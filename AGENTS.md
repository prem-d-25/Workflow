# AGENTS.md — Rules for working on Workflow

Workflow is an Employee Management System (roles: Owner, HR, Employee) with a policy RAG chatbot.
Read `docs/ARCHITECTURE.md` for decisions and `docs/PLAN.md` for progress before starting any task.

## 0. How to work with me (most important)

The developer is learning and must be able to explain every line in an interview.

1. **One task at a time.** Do only what the prompt asks. Do not build extra features or "bonus" things.
2. **Ask before big decisions.** If something is not covered in `ARCHITECTURE.md` (new library, new table, changed folder structure, different approach), stop and ask. Offer 2 options with a recommendation.
3. **Explain after you finish.** End every task with: (a) files created or changed, (b) a 3 to 5 line plain-English explanation of how it works, (c) how to test it (exact commands or clicks).
4. **Never rewrite files you were not asked to touch.**
5. **Update `docs/PLAN.md`** by ticking the checkbox of the finished task.
6. Keep it simple. No over-engineering: no microservices, no Redis, no Celery, no Docker unless asked. Write code so that scaling later is possible, but do not build it now.

## 1. Tech stack (fixed)

- Backend: Python, FastAPI, `uv` for packages, SQLAlchemy 2.x (sync), Alembic, Pydantic v2, pydantic-settings
- Database: PostgreSQL + pgvector (extension version 0.8.6 is already installed)
- AI: LangChain, Groq (chat, model `llama-3.3-70b-versatile`), Gemini `gemini-embedding-001` at 768 dimensions (embeddings), FastEmbed as an optional second provider
- Frontend: React + Vite + TypeScript, React Router, Axios, Zod, Zustand, React Hook Form, Tailwind CSS, shadcn/ui
- Auth: JWT access token (short) + refresh token (httpOnly cookie)

## 2. Backend structure

```
backend/
  app/
    main.py              # create app, include routers, CORS only
    core/                # config.py, security.py (hash + jwt), database.py, deps.py
    models/              # SQLAlchemy models, one file per table
    schemas/             # Pydantic request/response models, one file per feature
    routers/             # HTTP only: parse request, call service, return response
    services/            # business logic lives here
    ai/                  # embeddings (provider interface), llm, rag pipeline
  alembic/
  pyproject.toml
  .env.example
```

Rules:
- **Routers stay thin.** No business logic and no raw queries in routers.
- **Services hold the logic.** A service receives the DB session and the current user, never a raw request.
- **Never return a SQLAlchemy model directly.** Always use a Pydantic response schema.
- **Never expose `password_hash`** in any response.
- One router file per feature (`auth.py`, `users.py`, `company.py`, `leaves.py`, `announcements.py`, `policy.py`, `chat.py`).
- Config only from environment variables via `core/config.py`. Never hardcode secrets.
- Use type hints everywhere. Short docstring on every service function.
- Errors: raise `HTTPException` with a clear message and the right status code (401, 403, 404, 409, 422).

## 3. Multi-tenancy rule (never break this)

Every table except `companies` has a `company_id`. **Every query must filter by `current_user.company_id`.**
Never take `company_id` from the request body or URL. Always take it from the logged-in user's token.
This includes vector search: filter by `company_id` first, then rank by similarity.

## 4. Roles and permissions

Use a dependency like `require_roles("owner", "hr")` from `core/deps.py`. Never check roles with scattered `if` statements in routers.
The permission table is in `docs/ARCHITECTURE.md`. Follow it exactly. Deactivated users (`is_active = false`) cannot log in or use a token.

## 5. Frontend structure

```
frontend/src/
  api/            # axios instance + one file per feature (leaveApi.ts, ...)
  components/
    ui/           # shadcn components (do not put feature logic here)
    common/       # shared pieces: PageHeader, EmptyState, ConfirmDialog, StatusBadge, DataTable
    layout/       # AppShell, Sidebar, Topbar
  features/       # one folder per feature
    auth/ leave/ announcements/ employees/ company/ profile/ chat/
      components/ # components used only by this feature
      hooks/      # data hooks for this feature
      schemas.ts  # Zod schemas
      types.ts
  pages/          # thin route-level pages that compose feature components
  routes/         # router config + ProtectedRoute + RoleRoute
  store/          # zustand stores (authStore only for now)
  lib/            # utils (cn, formatDate, etc.)
```

Rules:
- **No file over about 200 lines.** If a component grows past that, split it.
- One component per file. Name files after the component (`LeaveRequestForm.tsx`).
- Pages only compose. Logic goes into hooks, UI goes into components.
- **All API calls go through `src/api/`**, using the shared axios instance. Never call `axios` inside a component.
- Validate every form with **Zod + React Hook Form**. Backend validation always exists too.
- Zustand only for global auth state (user, role, access token, mustChangePassword). Everything else is local state or hooks. The chat is local state only.
- Every list/screen must handle three states: **loading, empty, error**.
- No `any` in TypeScript. No inline magic strings for roles or statuses: use constants.
- Access token lives in memory (Zustand), never localStorage. The refresh token is an httpOnly cookie set by the backend.

## 6. UI rules

Always read `.agents/skills/workflow-ui/SKILL.md` before creating or changing any screen or component. It defines the colors, fonts, spacing and the "do not" list.

## 7. Security basics (non-negotiable)

- Hash passwords with bcrypt. Never log passwords or tokens.
- Validate file uploads: PDF only, max 10 MB, check the content type and extension.
- CORS: allow only the frontend origin from config, with credentials.
- Do not trust any ID from the client without checking it belongs to the user's company.

## 8. Git and files

- Small commits, one per finished task, message like `feat(leave): apply and approve flow`.
- `.env` is never committed. Keep `.env.example` updated.
- Do not create README sections, tests or docs unless the prompt asks.

## 9. Definition of done for any task

- It runs without errors.
- It follows the folder rules above.
- Permissions and company filtering are enforced on the backend (not only hidden in the UI).
- Loading, empty and error states exist in the UI.
- The explanation and test steps (section 0.3) are given.
