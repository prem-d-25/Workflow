# Workflow Platform - Build Flow & Implementation Roadmap

This roadmap outlines the complete execution lifecycle of the **Workflow** project. Each phase is broken down into modular steps so you can review, provide specific requirements or tweaks, and trigger execution one step at a time.

---

## Progress Overview

| Phase | Milestone | Status | Description |
| :---: | :--- | :---: | :--- |
| **Phase 1** | **Database & Environment Core** | **COMPLETED** | `.env`, `pydantic-settings`, async engine, connection pool, and 6 SQLAlchemy 2.0 async models. |
| **Phase 2** | **Migrations & Schema Setup** | **COMPLETED** | Alembic setup for async migrations, `pgvector` extension activation, initial migration applied to database. |
| **Phase 3** | **Auth & Role-Based User Management** | **COMPLETED** | Dual JWT tokens (Access + Refresh), registration, login, auto-passwords, first-login reset, and RBAC user provisioning. |
| **Phase 4** | **Leave Quotas & Approval Workflow** | **COMPLETED** | Company quota editing, 5-day planned leave rule, emergency leaves, balance inquiry, and hierarchical approvals. |
| **Phase 5** | **Company Announcements** | **COMPLETED** | Event and broadcast system (Owner & HR publish, all view), editing, deletion, and tenant boundary. |
| **Phase 6** | **RAG Policy Chatbot & Document Ingestion** | **NEXT** | Policy PDF/text ingestion, `pgvector` semantic search, tenant boundary, and prompt guardrails. |
| **Phase 7** | **Frontend Dashboards & UI** | Queued | Dark-mode enterprise UI (Vite + React + Tailwind + Zustand) for Owner, HR, Employee, and Chatbot. |

---

## Detailed Phase Breakdown

### Phase 1: Database & Environment Core (Completed)
- [x] Configure `.env.example` and local `.env` with async PostgreSQL credentials and pool settings.
- [x] Implement type-safe configuration in `backend/src/backend/core/config.py`.
- [x] Set up async SQLAlchemy engine with connection pooling (`pool_pre_ping=True`) and transaction-safe `get_db()` dependency in `backend/src/backend/db/`.
- [x] Model all 6 core tables in `backend/src/backend/models/`:
  - `companies` (tenant root)
  - `users` (multi-tenant, RBAC, soft-deletion via `is_active`, `force_password_reset`)
  - `leave_quotas` (sick, casual, paid quotas)
  - `leave_requests` (leave type, start/end dates, total days, approval status, reviewer audit)
  - `announcements` (broadcasting author, title, content)
  - `company_policies` (chunks with `Vector(1536)` embedding)

---

### Phase 2: Database Migrations (Alembic) (Completed)
*Goal: Enable version-controlled, production-safe schema migrations for PostgreSQL.*
- [x] Initialized Alembic in `backend/` configured for `asyncpg` and SQLAlchemy 2.0 async engine.
- [x] Configured `alembic/env.py` and `alembic/script.py.mako` with `Base.metadata`, `settings.DATABASE_URL`, and `pgvector`.
- [x] Enhanced models with `lazy="selectin"` on relationships for asynchronous compatibility.
- [x] Migration revision `5c74f6e4d220_initial_schema.py` auto-generated with `CREATE EXTENSION IF NOT EXISTS vector;` and all 6 tables.
- [x] Migration applied to PostgreSQL (`workflow_db`) via `alembic upgrade head`.
- [x] Live database verification conducted: all 6 models, relationships, insertions, and `pgvector` cosine similarity search verified.

---

### Phase 3: Authentication & Role-Based User Management (Completed)
*Goal: Secure authentication, dual Access + Refresh JWT tokens, auto-passwords, first-login reset, and hierarchical user management.*
- [x] Implemented native bcrypt password hashing and verification in `backend/src/backend/core/security.py`.
- [x] Dual JWT Token Architecture: Short-lived Access Token (30 mins) and long-lived Refresh Token (7 days) with typed claims (`type="access"` vs `type="refresh"`).
- [x] Auto-generated passcode utility: `email[:3].lower() + "1234"` (e.g. `joh1234`).
- [x] Mandatory first-login password change flow (`force_password_reset=True`).
- [x] Soft-delete toggle (`is_active=False` blocks login with 401 Unauthorized).
- [x] Implemented Auth endpoints in `backend/src/backend/api/v1/auth.py`:
  - `POST /api/v1/auth/register-company`: Atomically creates company, owner user, default leave quotas.
  - `POST /api/v1/auth/login`: Authenticates, checks active status, returns access + refresh tokens.
  - `POST /api/v1/auth/refresh`: Exchanges valid refresh token for a new access token.
  - `POST /api/v1/auth/change-password`: Resets password and clears `force_password_reset` flag.
  - `GET /api/v1/auth/me`: Returns profile and company details.
- [x] Implemented User Management endpoints with RBAC guards in `backend/src/backend/api/v1/users.py`:
  - `POST /api/v1/users`: Owner can provision HR and Employee; HR can provision Employee only (creating HR/Owner rejected with 403); Employees blocked (403). Returns credentials.
  - `PATCH /api/v1/users/{id}/status`: Soft-delete toggle. Owner can toggle anyone in company; HR can only toggle Employees; self-deactivation blocked.
  - `GET /api/v1/users`: Tenant-scoped user listing with pagination and search.
- [x] FastAPI application entrypoint in `backend/src/backend/main.py` with CORS middleware.
- [x] Automated E2E verification test suite passing 100% of scenarios.

---

### Phase 4: Leave Management & Hierarchical Approvals (Completed)
*Goal: Company quota editing, 5-day advance planned leave rule, non-blocking emergency requests, balance inquiries, and hierarchical approval tiers.*
- [x] Company & Quota Editing ([company.py](file:///c:/Users/prem/Desktop/Guide/Python/Py/workflow/backend/src/backend/routes/company.py)): Owner can update company name, logo, and customize quota numbers (sick, casual, paid). Non-owners blocked (403).
- [x] Planned Leave 5-Day Notice Rule: Validates `(start_date - today) >= 5 days` for `PLANNED` leaves. Submissions with < 5 days notice rejected with 400 Bad Request.
- [x] Immediate Leaves: Sick, Casual, and Unpaid leaves can be submitted for today or tomorrow without 5-day barrier.
- [x] Non-Blocking Over-Quota Policy: Employees with depleted quotas or emergency/accident situations can submit leaves without system rejection.
- [x] Hierarchical Multi-Tier Approvals ([leaves.py](file:///c:/Users/prem/Desktop/Guide/Python/Py/workflow/backend/src/backend/routes/leaves.py)):
  - Owner can approve/reject both HR and Employee leaves.
  - HR can only approve Employee leaves (HR reviewing HR or Owner rejected with 403).
  - HR leaves must be approved by the Owner.
  - Self-approval blocked (403). Employees blocked from reviewing (403).
- [x] Leave Balance Engine: Tracks allocated quotas, approved days used per type, remaining days, and extra/unpaid days.
- [x] Full Automated E2E verification test suite passing 100% of scenarios (11/11 tests passed).

---

### Phase 5: Centralized Announcements (Completed)
*Goal: Broadcast company notifications and events with tenant isolation.*
- [x] Implemented announcement schemas in `backend/src/backend/schemas/announcement.py`.
- [x] Implemented `AnnouncementService` in `backend/src/backend/services/announcement_service.py`:
  - Enforces RBAC permissions: Owner and HR can create, update, and delete; Employees blocked (403).
  - Chronological sorting (`created_at.desc()`).
  - Search filtering across titles and contents.
  - Strict tenant boundary isolation (`company_id = current_user.company_id`).
- [x] Implemented API routes in `backend/src/backend/routes/announcements.py`:
  - `POST /api/v1/announcements` (Owner & HR only)
  - `GET /api/v1/announcements` (All company members)
  - `GET /api/v1/announcements/{id}` (All company members)
  - `PATCH /api/v1/announcements/{id}` (Owner & HR only)
  - `DELETE /api/v1/announcements/{id}` (Owner & HR only)
- [x] Full Automated E2E verification test suite passing 100% of scenarios (12/12 tests passed).

---

### Phase 6: AI RAG Policy Chatbot & Document Ingestion (Completed)
*Goal: Grounded AI assistant answering company policies with tenant isolation and strict guardrails.*

#### Implemented Components & Features:
- [x] **Local 384-dimensional Vector Embeddings**:
  - Integrated `fastembed` with ONNX-optimized `sentence-transformers/all-MiniLM-L6-v2`.
  - Updated `company_policies.embedding` column to `Vector(384)` via Alembic migration `aa1355203c64_update_vector_dim_384`.
- [x] **Document Ingestion & Chunking (`RAGService`)**:
  - Supports `.pdf` parsing (via `pypdf`), `.txt`, and `.md` file formats as well as direct text payloads.
  - Overlapping semantic chunker (chunk size ~600 chars, 120 overlap).
  - RBAC: Only `OWNER` can upload, ingest, or delete policy documents.
  - Strict tenant boundary: All chunks stored with `company_id = current_user.company_id`.
- [x] **pgvector Cosine Distance Semantic Retrieval**:
  - Fast vector similarity search with `cosine_distance` strictly filtered by tenant (`company_id`).
  - Formats retrieved chunks as contextual source citations with similarity scores.
- [x] **Groq LLM Integration & Strict Prompt Guardrails**:
  - High-speed async Groq inference powered by `qwen/qwen3.8-27b` (or configured Groq model).
  - Strict System Prompt: Exclusively answers policy, leave rules, and workplace guidelines; firmly refuses out-of-scope prompts (coding, math, general trivia, recipes).
  - Grounded honesty: Explicitly informs the user if policy documentation does not cover a topic rather than hallucinating.
- [x] **Ephemeral Multi-Turn Memory**:
  - Passes client-side conversation history (`history: List[ChatMessage]`) in the request payload.
  - Retains multi-turn dialogue context while maintaining zero persistent chat logs in the database.
- [x] **API Endpoints**:
  - `POST /api/v1/policies/upload` (Owner only, multipart file)
  - `POST /api/v1/policies/text` (Owner only, raw text)
  - `GET /api/v1/policies` (All roles: OWNER, HR, EMPLOYEE)
  - `DELETE /api/v1/policies/{document_name}` (Owner only)
  - `POST /api/v1/chat` (All roles: OWNER, HR, EMPLOYEE)
- [x] **Verification**: Full Automated E2E test suite passing 100% of scenarios (12/12 tests passed).

---

### Phase 7: Frontend Application & Dashboards (Decomposed Architecture)
*Goal: Production-grade, dark-mode enterprise React application with robust error handling, token refresh lifecycle, React Hook Form + Zod validation, and role-driven dashboards.*

```
Frontend Sub-phases Overview:
├── Phase 7.1: Setup, Design Tokens, Tailwind CSS & Dependencies
├── Phase 7.2: API Client, Cookie/Token Engine, Auth Store & Interceptors
├── Phase 7.3: Reusable UI Component Library & Notification System
├── Phase 7.4: Authentication & Onboarding Views (Zod + React Hook Form)
├── Phase 7.5: Main Dashboard Shell & Navigation Layout
├── Phase 7.6: Leave Management & Quotas Center
├── Phase 7.7: Team & User Management Center (Owner & HR)
├── Phase 7.8: Centralized Announcements Board
└── Phase 7.9: Policy Knowledge Base & AI RAG Chatbot
```

---

#### Phase 7.1: Setup, Design Tokens, Tailwind CSS & Dependencies (Completed)
* **Core Tooling**:
  - [x] Configured `@tailwindcss/vite` with `@import "tailwindcss";` in `src/index.css`.
  - [x] Configured Vite path aliases (`@/*` pointing to `src/*`) and API reverse proxy in `vite.config.js`.
  - [x] Installed dependencies: `react-hook-form`, `@hookform/resolvers`, `zod`, `clsx`, `tailwind-merge`, `lucide-react`, `zustand`, `axios`.
* **Design System Tokens (Adhering to agent.md Section 2)**:
  - [x] Dark mode enterprise palette: Background `#0F172A`, Surface `#1E293B`, Borders `#334155`.
  - [x] Brand Primary Accent: `#FF4500` (Orange-600) for primary buttons/triggers.
  - [x] Brand Secondary Accent: `#0D9488` (Teal-600 / Teal-400) for badges, active tabs, AI elements.
  - [x] Typography and custom scrollbar utilities.
  - [x] Live reverse proxy `/api/health` verified with 200 OK.
  - [x] Production bundle compilation verified (`vite build` finished in 1.57s with zero errors).

---

#### Phase 7.2: API Client, Cookie/Token Engine, Auth Store & Interceptors (Completed)
* **Production HttpOnly Cookie Security Engine**:
  - [x] Backend sets `refresh_token` in a secure `HttpOnly; SameSite=Lax; Path=/api/v1/auth; Max-Age=604800` response header on login, register, and refresh.
  - [x] Backend implements `POST /api/v1/auth/logout` that deletes the HttpOnly refresh cookie (`Max-Age=0`).
  - [x] JavaScript is completely blocked from reading the refresh token, providing full immunity against XSS token-stealing attacks.
* **Axios HTTP Client (`src/api/client.js`)**:
  - [x] `withCredentials: true` enables the browser to automatically transmit HttpOnly cookies.
  - [x] Request interceptor injecting `Authorization: Bearer <access_token>` from memory/sessionStorage.
  - [x] Concurrency-controlled 401 response interceptor with `failedQueue` to prevent race conditions during token rotation.
  - [x] Calls `/api/v1/auth/refresh` without body payloads, relying on browser's native HttpOnly cookie transmission.
  - [x] Standardized `formatApiError()` helper extracting user-friendly messages from FastAPI/Pydantic validation lists.
* **Token Storage Helper (`src/lib/storage.js`)**:
  - [x] Caches short-lived access tokens in `sessionStorage` and user metadata in `localStorage` for instant hydration.
  - [x] Clean `clearAll()` method for complete credentials erasure on logout.
* **Zustand State Management (`src/store/authStore.js`)**:
  - [x] State: `user`, `company`, `accessToken`, `isAuthenticated`, `forcePasswordReset`, `isLoading`.
  - [x] Actions: `login()`, `registerCompany()`, `logout()`, `changePassword()`, `updateTokens()`, `initialize()`.
  - [x] Synchronizes automatically with Axios interceptor events (`wf:tokens-refreshed`, `wf:auth-expired`).
* **Modular Domain API Services (`src/api/`)**:
  - [x] `auth.js`, `company.js`, `users.js`, `leaves.js`, `announcements.js`, `policies.js`, `chat.js`.
* **Route Guards & RBAC Components (`src/components/auth/`)**:
  - [x] `<ProtectedRoute>`: Enforces login, blocks soft-deleted users, and redirects pending password resets.
  - [x] `<RoleGuard>`: Enforces role permissions (`OWNER`, `HR`, `EMPLOYEE`) with custom fallbacks and access banners.
* **Verification & Automated Test Execution**:
  - [x] Live automated test suite `scratch/test_httponly_cookie.py` verified 100% of cookie lifecycle steps.
  - [x] Regressions checked: Phase 4, Phase 5, Phase 6 test suites passing 100%.
  - [x] Production bundle compilation verified (`vite build` finished in 2.08s with zero errors).

---

#### Phase 7.3: Reusable UI Component Library & Notification System (Completed)
* **Isolated Reusable Component Catalog (`src/components/ui/`)**:
  - [x] `Button`: Primary (`#FF4500`), secondary, teal (`#0D9488`), outline, danger, ghost, loading spinner state.
  - [x] `Input` & `Textarea`: Dark theme, icon prefixes, helper text, error styling.
  - [x] `Select`: Custom chevron dropdown with options or children.
  - [x] `FormField`: Integration wrapper for React Hook Form displaying inline Zod error messages.
  - [x] `Alert` / `ErrorBanner`: Formatted error callouts for backend validation (400, 422, 500) and dismissible notices.
  - [x] `Modal` / `Dialog`: Accessible backdrop blur, body scroll lock, focus-trap, ESC/click-outside dismiss.
  - [x] `ConfirmDialog`: Confirmation for destructive actions (deactivate employee, delete policy, reject leave).
  - [x] `Badge`: Role badges (`OWNER`, `HR`, `EMPLOYEE`) and status badges (`PENDING`, `APPROVED`, `REJECTED`, `ACTIVE`, `DEACTIVATED`).
  - [x] `Card` & `StatCard`: Metrics and dashboard widgets with trend badges and icons.
  - [x] `Skeleton`, `TableSkeleton` & `Spinner`: Animated pulse loading states.
  - [x] `ToastNotification` & `useToastStore`: Global floating toast provider (`toast.success`, `toast.error`, `toast.warning`, `toast.info`).
  - [x] Interactive Gallery in `App.jsx` verifying all 12 components live.
  - [x] Production bundle verified (`vite build` finished in 1.34s with zero errors).

---

#### Phase 7.4: Authentication & Onboarding Views (Zod + React Hook Form) (Completed)
* **Company Registration View (`/register`)**:
  - [x] Fields: Company Name, Owner Email, Password, Confirm Password.
  - [x] Zod validation schema (`registerCompanySchema`) + server error mapping (e.g. duplicate email/company).
  - [x] Automatically provisions new tenant workspace with default leave quotas and transitions to dashboard.
* **Login View (`/login`)**:
  - [x] Corporate email & password with inline Zod validation (`loginSchema`).
  - [x] Handles `force_password_reset` trigger upon successful authentication by redirecting to `/reset-password`.
  - [x] Auto-redirects already authenticated users to `/dashboard`.
* **Mandatory First-Time Password Reset (`/reset-password`)**:
  - [x] Required for employees/HR provisioned with temporary passwords (`agent.md` Section 5).
  - [x] Zod validation (`resetPasswordSchema`) enforcing minimum 6 characters and password matching.
  - [x] Unlocks full platform access (`force_password_reset: false`) upon successful update.
* **Routing & Component Reuse**:
  - [x] Clean `react-router-dom` setup in `App.jsx` (`/login`, `/register`, `/reset-password`, `/dashboard`, `/ui-catalog`).
  - [x] Zero component duplication: 100% strictly reuses the 12 Phase 7.3 components from `src/components/ui/`.
  - [x] Production bundle verified (`vite build` completed in 1.50s with zero errors).
  - [x] Full browser E2E test verified: Tenant registration, HttpOnly cookie reception, workspace dashboard session, and clean logout.

---

#### Phase 7.5: Main Dashboard Shell & Navigation Layout
* **Layout Structure**:
  - Collapsible responsive sidebar with role-filtered links.
  - Top header displaying company name, logo, active role pill, and user profile menu.
  - Profile modal allowing users to view account details and change password.

---

#### Phase 7.6: Leave Management & Quotas Center
* **Employee View**:
  - Visual quota summary: Sick, Casual, Planned, and Unpaid leaves (allocated, used, remaining).
  - Apply Leave Modal (Zod validated): 5-day advance notice validation for planned leave, over-quota warning banner.
  - My Leave Requests history table with status tags.
* **HR & Owner Approval Center**:
  - Review queue: Pending leaves list with filter by type/status.
  - Approve & Reject actions with optional reviewer notes.
  - Hierarchical safeguards (HR cannot approve Owner or self).
* **Company Leave Settings (Owner Only)**:
  - Form to update company name and customized default quotas (`sick_quota`, `casual_quota`, `paid_quota`).

---

#### Phase 7.7: Team & User Management Center (Owner & HR)
* **Team Directory**:
  - Paginated / searchable user table with role filter and status indicator (`Active` / `Deactivated`).
* **Add Team Member Modal**:
  - Zod form: Full Name, Corporate Email, Role (`HR` or `EMPLOYEE`), Job Title.
  - Displays generated temporary password with 1-click copy to clipboard.
* **Deactivation / Reactivation Action**:
  - Soft-delete toggle (`PATCH /api/v1/users/{id}/status`) with confirmation dialog.

---

#### Phase 7.8: Centralized Announcements Board
* **Announcements Feed**:
  - Reverse-chronological broadcast feed with author and timestamp.
  - Keyword search bar.
* **Publisher Modal (Owner & HR)**:
  - Form with Title and Content.
  - Edit and Delete capabilities for author/owner.

---

#### Phase 7.9: Policy Knowledge Base & AI RAG Chatbot
* **Policy Management (Owner)**:
  - Document upload zone (.pdf, .txt, .md drag-and-drop or raw text input).
  - Uploaded documents list with chunk metrics and delete option.
* **AI Policy Chatbot**:
  - Floating / docked dark-mode chat widget accessible to all roles.
  - Multi-turn ephemeral memory (resets on refresh / session clear).
  - Grounded answers with collapsible document source citations.
  - Refusal handling for off-topic queries.

---

## How to Proceed

When you are ready to build:
1. Start with **Phase 7.1: Setup, Design Tokens, Tailwind CSS & Dependencies**.
2. We will build, verify, and test each sub-phase step-by-step with clean production code!

