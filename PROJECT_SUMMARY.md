# Workflow Project - Master Overview & Implementation Summary

This single reference document contains the complete summary of everything implemented so far, the core architecture, business rules, and the step-by-step roadmap for subsequent phases.

---

## 1. Project Concept & Architecture

**Workflow** is an enterprise multi-tenant employee management platform with Role-Based Access Control (RBAC), hierarchical leave management, centralized company announcements, and a tenant-isolated AI HR chatbot (RAG) powered by PostgreSQL and `pgvector`.

### Technology Stack
* **Backend**:
  * Python 3.13+ managed with `uv`
  * **Framework**: FastAPI
  * **ORM**: SQLAlchemy 2.0 (Async ORM)
  * **Database Driver**: `asyncpg`
  * **Vector & AI**: `pgvector` (`Vector(1536)`)
  * **Configuration & Validation**: `pydantic-settings` & Pydantic v2
  * **Auth & Security**: PyJWT, Passlib (Bcrypt)
* **Frontend**:
  * React 19 + Vite
  * Tailwind CSS v4
  * Zustand (State Management)
  * React Router DOM v7
  * Axios & Lucide React

---

## 2. Directory Structure & Architecture

```
backend/
├── pyproject.toml                      # Project dependencies & metadata (uv managed)
├── uv.lock                             # Locked dependency graph
├── .gitignore                          # Ignores .venv, .env, __pycache__
├── .env.example                        # Documented environment variable template
├── .env                                # Local development configuration
├── alembic/                            # Version-controlled database migrations
│   ├── env.py                          # Async migration environment
│   └── versions/                       # Migration revisions
└── src/
    └── backend/
        ├── main.py                     # FastAPI application entrypoint with CORS
        ├── core/                       # Configuration, security & route guards
        │   ├── __init__.py
        │   ├── config.py               # Pydantic BaseSettings loading .env
        │   ├── dependencies.py         # get_current_user, require_roles (Guards)
        │   └── security.py             # Bcrypt hashing & dual JWT tokens
        ├── db/                         # Database engine & session management
        │   ├── __init__.py
        │   ├── base.py                 # SQLAlchemy DeclarativeBase & TimestampMixin
        │   └── session.py              # Async engine, connection pool & get_db dependency
        ├── models/                     # SQLAlchemy 2.0 async domain models
        │   ├── __init__.py             # Unified metadata registry exporting all models
        │   ├── enums.py                # UserRole, LeaveType, LeaveStatus enums
        │   ├── company.py              # Company model (multi-tenant boundary)
        │   ├── user.py                 # User model (RBAC, soft-delete, password reset)
        │   ├── leave.py                # LeaveQuota & LeaveRequest models
        │   ├── announcement.py         # Announcement broadcasting model
        │   └── policy.py               # CompanyPolicy model with Vector(1536)
        ├── schemas/                    # Pydantic data validation contracts
        │   ├── __init__.py
        │   ├── auth.py                 # Login, tokens, password change schemas
        │   ├── company.py              # Company schemas
        │   └── user.py                 # User creation & response schemas
        ├── services/                   # Business logic layer
        │   ├── __init__.py
        │   ├── auth_service.py         # Registration, login, refresh, password reset
        │   └── user_service.py         # Provisioning, soft-delete toggle, listings
        └── routes/                     # HTTP Endpoint Routers (Clean & Flat)
            ├── __init__.py             # Bundles all domain routers under /api/v1
            ├── auth.py                 # Authentication endpoints
            └── users.py                # User & team management endpoints
```

## 3. Role-Based Access Control (RBAC) & Permissions

| Feature / Action | OWNER | HR | EMPLOYEE |
| :--- | :---: | :---: | :---: |
| Register Company & Setup Default Quotas | Yes | No | No |
| Add HR Users | Yes | No | No |
| Add Employee Users | Yes | Yes | No |
| Toggle Active / Inactive (Soft-Delete) | Anyone in Company | Employees Only | No |
| Approve Employee Leaves | Yes | Yes | No |
| Approve HR Leaves | Yes (Sole Approver) | No | No |
| Submit Leave Requests | Yes | Yes | Yes |
| Publish / Delete Announcements | Yes | Yes | No |
| View Announcements Feed | Yes | Yes | Yes |
| Upload Company Policy Documents | Yes | No | No |
| Chat with AI Policy Assistant (RAG) | Yes | Yes | Yes |

---

## 4. Core Business Rules

1. **Auto-Generated Passwords**:
   - Format: First 3 characters of email + `1234` (e.g. `joh1234` for `john.doe@company.com`).
   - Default state on creation: `force_password_reset = True`.
2. **First Login Enforcement**:
   - When `force_password_reset == True`, the user is required to set a new password before accessing their dashboard.
3. **Soft Deletion & Status Toggle**:
   - Accounts are never deleted from the database.
   - Status toggle flips `is_active = False`. Inactive users receive `401 Unauthorized` on login.
4. **Planned Leave Enforcement**:
   - Leave requests of type `PLANNED` must be submitted at least 5 days in advance (`(start_date - today) >= 5 days`).
5. **Immediate & Emergency Leaves**:
   - `SICK`, `CASUAL`, or `UNPAID` leaves can be submitted immediately without the 5-day rule.
   - If an employee has depleted their quotas, they can still submit emergency/unpaid requests so urgent situations are not blocked.
6. **Hierarchical Approvals**:
   - Owner can approve leave requests of both HR and Employees.
   - HR can only approve Employee leaves.
   - HR's own leaves must be reviewed and approved by the Owner.
7. **RAG Semantic Search & Guardrails**:
   - Policy search is strictly tenant-isolated (`WHERE company_id = current_user.company_id`).
   - The chatbot maintains context during the active session, but history resets on browser refresh.
   - Strict prompt guardrails ensure the assistant only answers company- and policy-related queries.

---

## 5. What Has Been Implemented So Far

### A. Environment & Configuration
* **`backend/.env.example`**: Committed reference template of all required variables.
* **`backend/.env`**: Local development configuration with asyncpg database connection string.
* **`.gitignore`** (root & backend): Configured to protect secrets and ignore `.venv`, `.env`, and cache files.
* **`backend/src/backend/core/config.py`**: Type-safe `BaseSettings` using `pydantic-settings` to parse and validate settings.

### B. Database Connection Layer (`backend/src/backend/db/`)
* **`base.py`**: SQLAlchemy 2.0 `DeclarativeBase` with a reusable `TimestampMixin` (`created_at`).
* **`session.py`**: Async engine with connection pooling (`pool_pre_ping=True`, pool sizing), `async_sessionmaker`, and a FastAPI `get_db()` dependency managing automatic transaction commit, rollback on errors, and session close.
* **`__init__.py`**: Clean module exports (`Base`, `engine`, `async_session_maker`, `get_db`).

### C. SQLAlchemy 2.0 Async Models (`backend/src/backend/models/`)
All 6 tables and enums are created with relationships and type annotations:
* **`enums.py`**: `UserRole`, `LeaveType`, `LeaveStatus`.
* **`company.py`**: `companies` table (tenant boundary, name, logo, created_at).
* **`user.py`**: `users` table (`company_id`, email, `password_hash`, role, `is_active`, `force_password_reset`).
* **`leave.py`**: `leave_quotas` (sick, casual, paid quotas) and `leave_requests` (dates, total days, reason, status, reviewer audit).
* **`announcement.py`**: `announcements` table (broadcasting author, title, content).
* **`policy.py`**: `company_policies` table with `Vector(1536)` embedding column for `pgvector`.
* **`__init__.py`**: Central registry exporting `Base` and all models.

### D. Automated Verification
* Settings resolution tested and verified.
* Metadata table registration verified: all 6 tables compile properly.
* Column schemas, foreign keys, and vector types verified.
* `get_db()` async generator verified.

---

## 6. Step-by-Step Build Roadmap (What We Build Next)

| Phase | Description | Key Deliverables | Status |
| :---: | :--- | :--- | :---: |
| **Phase 1** | **Database & Environment Core** | `.env`, async engine, connection pool, models | **COMPLETED** |
| **Phase 2** | **Migrations & Schema Setup** | Alembic setup for async migrations, `pgvector` activation, live tables | **COMPLETED** |
| **Phase 3** | **Auth & User Management** | Dual JWT (Access + Refresh), registration, login, auto-passwords, reset, toggle active | **COMPLETED** |
| **Phase 4** | **Leave Quotas & Approval Flow** | Company quota editing, 5-day planned rule, emergency requests, multi-tier approvals | **COMPLETED** |
| **Phase 5** | **Company Announcements** | Broadcasting system (Owner/HR publish, all view), editing, deletion, tenant boundary | **COMPLETED** |
| **Phase 6** | **RAG Policy Chatbot** | Document ingestion, `pgvector` search, tenant filter, guardrails | **NEXT** |
| **Phase 7** | **Frontend Dashboards** | Dark-mode UI (Owner, HR, Employee, Chatbot) | Queued |

---

## How We Will Work Together

Whenever you are ready for the next step, you can tell me:
> *"Let's start Phase 2"* (or give any specific instructions/inputs you want for that phase).

I will review your requirements, update the plan, and implement each phase cleanly with full verification.
