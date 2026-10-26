# Workflow — Build Plan

Tick a box only after the task works and the developer has tested it.
Model hint: **Opus** = hard or foundational, **Sonnet** = normal features, **Flash** = small fixes and styling.
Opus 4.6, Sonnet 4.6 and GPT-OSS are available in Antigravity only until **Nov 2**, so the Opus phases come first.

## Phase 1 — Setup (Sonnet)
- [x] Repo with `backend/` and `frontend/` folders, `.gitignore`
- [x] Backend: `uv` project, FastAPI app with `/api/health`, config from `.env`
- [x] Database connection to local PostgreSQL, `CREATE EXTENSION vector`
- [x] Alembic configured
- [x] Frontend: Vite + React + TypeScript, Tailwind, shadcn/ui init, router, axios instance
- [x] Fonts and design tokens from the UI skill added to Tailwind config
- [x] Frontend calls `/api/health` and shows the result (proves the connection and CORS work)

## Phase 2 — Database models and migration (Opus)
- [x] All models from `ARCHITECTURE.md` section 3
- [x] First Alembic migration, including pgvector column and HNSW index
- [x] Verify the tables in pgAdmin

## Phase 3 — Authentication (Opus)
- [x] Password hashing and JWT helpers (`core/security.py`)
- [x] Register company + owner
- [x] Login, refresh (cookie), logout, `/me`
- [x] `get_current_user` and `require_roles` dependencies
- [x] Change password and `must_change_password` flag
- [x] Frontend: auth store, login and register pages, axios refresh interceptor
- [x] Frontend: protected routes, role routes, forced change-password dialog
- [x] App shell: sidebar and topbar per role

## Phase 4 — Owner: company, leave types, users (Sonnet)
- [x] Company details view and edit
- [x] Leave types: add, edit, delete
- [x] Add HR / Employee (default password rule)
- [x] Users list (owner and HR), with role filter and search
- [x] User detail page: profile, leave balance, activate / deactivate (owner only)

## Phase 5 — Profile (Sonnet)
- [ ] View and edit own profile (all roles)

## Phase 6 — Leave (Sonnet, use Opus if the approval rules get messy)
- [ ] Apply for leave with balance validation
- [ ] My leaves list with status
- [ ] To-review list with approve / reject (owner: everyone, HR: employees only)
- [ ] Permission tests by hand: HR cannot approve HR, nobody approves own leave

## Phase 7 — Announcements (Sonnet)
- [ ] List and detail view (all roles)
- [ ] Create and edit (owner, HR)

## Phase 8 — RAG backend (Opus)
- [ ] Embedding provider interface, Gemini provider, retries
- [ ] Quick script that embeds one sentence (proves the Gemini key works, 768 dimensions)
- [ ] PDF upload: extract, chunk, embed, replace old chunks
- [ ] Delete policy endpoint
- [ ] Chat endpoint: company-filtered search, threshold, strict prompt, history
- [ ] Groq to Gemini fallback
- [ ] Manual isolation test with two companies

## Phase 9 — Policy and chat UI (Sonnet)
- [ ] Owner policy page: upload, replace, delete
- [ ] Floating chat button and side panel
- [ ] Chat keeps recent history, shows loading and error states, clears on refresh

## Phase 10 — Polish and interview prep (Flash or Sonnet)
- [ ] Review loading, empty and error states on every screen
- [ ] Seed script with a demo company, HR and employee
- [ ] README: setup steps, screenshots, architecture summary
- [ ] Final pass on the scaling cheat sheet in `ARCHITECTURE.md` section 9

## Decisions log
Add a line here whenever a decision changes, with the date and the reason.

- Frontend language: TypeScript (assumed, confirm).
