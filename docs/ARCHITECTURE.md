# Workflow — Architecture and Decisions

Simple on purpose. Clean structure now, so we can explain how each part would scale later.

## 1. Product in one paragraph

A company signs up and becomes its own private space. The Owner sets leave rules, adds HR and employees, posts announcements and uploads the policy PDF. HR and employees manage profiles and leave. Everyone can ask a small chatbot questions about their own company's policy.

## 2. Roles and permissions

| Action | Owner | HR | Employee |
|---|---|---|---|
| Register company (public signup) | yes (creates owner) | no | no |
| Edit company details | yes | no | no |
| Manage leave types and allowed days | yes | no | no |
| Add HR / Employee | yes | no | no |
| View list of HR and employees | yes | employees and HR (view only) | no |
| View a person's profile and leave balance | yes | yes | own only |
| Activate / deactivate a user | yes | no | no |
| Edit own profile | yes | yes | yes |
| Create / edit announcements | yes | yes | no |
| View announcements | yes | yes | yes |
| Apply for leave | no (owner does not take leave in v1) | yes | yes |
| Approve / reject employee leave | yes | yes | no |
| Approve / reject HR leave | yes | **no** | no |
| View own leave history | n/a | yes | yes |
| Upload / delete policy PDF | yes | no | no |
| Ask policy chatbot | yes | yes | yes |

Extra rules:
- Nobody can approve their own leave.
- An HR user cannot approve another HR user's leave (Owner only).
- Deactivated users cannot log in, and their existing tokens stop working.

## 3. Data model (PostgreSQL)

All ids are UUIDs. All tables have `created_at`. Every table except `companies` has `company_id` (indexed).

- **companies**: id, name, address, phone, website, industry, size, created_at
- **users**: id, company_id, email (unique), password_hash, full_name, role (`owner|hr|employee`), is_active, must_change_password, phone, date_of_birth, address, designation, department, joined_on, created_by, created_at
- **leave_types**: id, company_id, name, days_allowed (unique on company_id + name)
- **leave_requests**: id, company_id, user_id, leave_type_id, start_date, end_date, total_days, reason, status (`pending|approved|rejected`), decided_by, decided_at, decision_note, created_at
- **announcements**: id, company_id, title, body, event_date (optional), created_by, created_at, updated_at
- **policy_documents**: id, company_id (**unique**, so one PDF per company), filename, uploaded_by, created_at
- **policy_chunks**: id, company_id, document_id, chunk_index, content, embedding `vector(768)`

Indexes: `company_id` on all tables, HNSW (cosine) on `policy_chunks.embedding`, and an index on `leave_requests (company_id, user_id, status)`.
Deleting a policy document deletes its chunks (`ON DELETE CASCADE`).

## 4. Leave rules

- `total_days` = end_date − start_date + 1 (calendar days, no weekend or half-day logic).
- Balance for a type = `days_allowed` − sum of `total_days` of **approved** leaves of the current calendar year.
- When applying: reject if `total_days` is more than the remaining balance, counting **pending + approved** requests so people cannot over-request. Also reject if end_date is before start_date.
- Who sees which pending leaves:
  - Owner: all pending leaves in the company.
  - HR: pending leaves of employees only (not HR).
- Approve or reject stores `decided_by`, `decided_at` and an optional note.

## 5. Authentication flow

- **Owner register** (`POST /api/auth/register`): creates the company and the owner in one transaction. `must_change_password = false`.
- **Owner adds HR/Employee**: default password = first 4 letters of the email + `@123`, `must_change_password = true`. (Known weakness: guessable. Mitigation: the change is forced on first login. Future: emailed invite link.)
- **Login** (`POST /api/auth/login`): verifies the password and `is_active`. Returns an access token (15 min) in the JSON body and sets a refresh token (7 days) as an httpOnly, SameSite cookie scoped to `/api/auth`. The response includes the user and `must_change_password`.
- **Refresh** (`POST /api/auth/refresh`): reads the cookie and returns a new access token.
- **Logout** (`POST /api/auth/logout`): clears the cookie.
- **Change password** (`POST /api/auth/change-password`): needs the current password; sets `must_change_password = false`.
- Frontend: axios interceptor attaches the access token. On 401 it calls refresh once, then retries. If refresh fails, it logs out. While `mustChangePassword` is true the app shows a non-closable change-password dialog.
- Access token payload: `sub` (user id), `company_id`, `role`, `exp`. The backend still loads the user from the DB to check `is_active`.
- `require_roles` checks both role authorization and `must_change_password` (returning 403 "Password change required" if true); `get_current_user` does not enforce this so `/me` and `/change-password` stay accessible while a password change is pending.

## 6. API overview (all under `/api`)

- Auth: `register`, `login`, `refresh`, `logout`, `change-password`, `GET /me`
- Company: `GET/PUT /company`
- Leave types: `GET /leave-types`, `POST/PUT/DELETE` (owner)
- Users: `GET /users` (owner, hr), `POST /users` (owner), `GET /users/{id}` (owner, hr), `PATCH /users/{id}/status` (owner), `GET/PUT /users/me/profile`
- Leaves: `POST /leaves`, `GET /leaves/mine`, `GET /leaves/to-review`, `PATCH /leaves/{id}/decision`, `GET /leaves/balance` (own), `GET /users/{id}/leave-balance` (owner, hr)
- Announcements: `GET /announcements`, `POST`, `PUT /{id}` (owner, hr)
- Policy: `GET /policy`, `POST /policy` (upload, replaces the old one), `DELETE /policy` (owner)
- Chat: `POST /chat` with `{ question, history }`

## 7. RAG chatbot design

**Upload** (owner only): validate the PDF, extract text (`pypdf`), split into chunks (about 800 characters with 100 overlap), embed the chunks, then in one transaction delete the old document and chunks and insert the new ones. If the PDF has no extractable text (scanned image), return a clear error.

**Ask**:
1. Take the question and the last 6 messages of `history` from the client. Cap the message lengths.
2. Embed the question.
3. Search `policy_chunks` **where `company_id` = the user's company**, top 4 by cosine distance.
4. If nothing is below the distance threshold, answer "I can only help with questions about your company's policy." without calling the LLM.
5. Otherwise send to Groq: system prompt, then the retrieved context, then the recent history, then the question.
6. System prompt rules: answer only from the provided context; if the answer is not in the context, say so; refuse coding, general knowledge and unrelated questions politely.

**Memory**: the server stores nothing. The browser keeps the chat in React state and sends the recent messages with each question. A refresh clears everything.

**Provider interface** (`app/ai/embeddings.py`):
- `EmbeddingProvider` with `embed_documents(list[str])` and `embed_query(str)`.
- `GeminiEmbeddingProvider` (default, 768 dimensions) and `FastEmbedProvider` (`BAAI/bge-base-en-v1.5`, also 768).
- Chosen by `EMBEDDING_PROVIDER` in `.env`. Never mix providers inside one database: after switching, the owner re-uploads the PDF.
- Retry 2 to 3 times with a short backoff on rate-limit or network errors, then return a friendly error.

**Chat LLM** (`app/ai/llm.py`): Groq is the primary. If Groq fails after retries, fall back to Gemini Flash through the same function. This is safe because nothing from the answer is stored.

## 8. Decisions we made and why

- **Sync SQLAlchemy**: simpler to read and debug. FastAPI runs sync routes in a thread pool, which is fine at this size.
- **Services layer**: keeps routers thin and logic testable.
- **Tenant id from the token, never from the client**: prevents one company reading another's data.
- **Embeddings behind an interface**: swapping providers is a config change.
- **No chat history in the DB**: matches the requirement (temporary chat) and keeps the backend stateless.
- **Calendar-day leave**: simplest rule that works. Holidays and weekends are a later feature.

## 9. "How I would scale this" (interview cheat sheet)

| Concern | Answer |
|---|---|
| Many users | Backend is stateless, so run several instances behind a load balancer. |
| Slow DB queries | Indexes on `company_id`, pagination on every list, connection pooling (PgBouncer). |
| PDF upload is slow | Move extraction and embedding to a background worker (Celery/RQ or a queue). Today it runs inside the request. |
| LLM / embedding limits | Provider interface plus retries and fallback. Paid tiers and per-company rate limits in production. |
| Repeated questions | Cache embeddings and frequent answers in Redis. |
| Vector search at scale | HNSW index already; partition by company or move to a dedicated vector store if needed. |
| Security | Rate limit login, invite links instead of default passwords, audit log for approvals. |
| Auth | Refresh token rotation and revocation list. |
| Observability | Structured logging, error tracking (Sentry), health endpoint. |
| Deployment | Docker, managed Postgres with pgvector, environment-based config. |
