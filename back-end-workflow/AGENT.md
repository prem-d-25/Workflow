Backend Agent Context — WorkFlow

📖 Overview

WorkFlow is a resume-quality company/employee management backend built as a small production-quality MVP. The backend provides authentication, JWT-based authorization, role-based access control, company hierarchy management, leave management with hierarchical approval, announcements, and a policy-focused RAG assistant.

The backend must prioritize clean architecture, security, validation, proper error handling, database integrity, and maintainability without overengineering.

🛠️ Tech Stack

Framework: FastAPI

Language: Python 3.12+

Package Manager: uv

Database: PostgreSQL

ORM: SQLAlchemy

Migrations: Alembic

Validation / Schemas: Pydantic v2

Authentication: JWT

Password Hashing: Secure password hashing

Vector Search: pgvector

RAG: Embeddings + pgvector + LLM

Testing: Pytest

Linting / Formatting: Ruff

Server: Uvicorn

Do not introduce another framework, ORM, package manager, or database unless explicitly requested.

🎯 MVP Scope

The backend MVP contains ONLY:

Authentication

Register

Login

Logout

JWT authentication

Password hashing

Protected routes

RBAC

Owner

Manager

Employee

Backend-enforced permissions

Company/User Hierarchy

Owner can create/manage Managers

Manager can create/manage Employees under themselves

Managers can only manage their own employees

Leave Management

Employees request leave

Employee leave is approved/rejected by their Manager

Managers request leave

Manager leave is approved/rejected by Owner

Statuses: PENDING, APPROVED, REJECTED

Company Announcements

Owner: company-wide announcements

Manager: team announcements

Employee: view relevant announcements

RAG Policy Assistant

Company policy documents only

Embeddings

pgvector retrieval

LLM-generated answers

No employee-specific leave balance data

Explicitly Out of Scope

Do NOT implement these unless explicitly requested:

Payroll

Attendance

Notifications

Email systems

Analytics

Employee-specific leave balance calculations

Performance management

Chat/messaging

Advanced HR workflows

Calendar systems

RAG access to employee/application data

👥 User Roles & Hierarchy

There are three roles:

Owner
├── Manager A
│   ├── Employee 1
│   ├── Employee 2
│   └── Employee 3
│
└── Manager B
    ├── Employee 4
    └── Employee 5

Owner

Can:

Add Managers

Manage Managers

Approve/reject Manager leave

Create company-wide announcements

Access owner-authorized resources

Manager

Can:

Add Employees under themselves

Manage their own Employees

Submit leave

Have leave approved/rejected by Owner

Approve/reject leave from their own Employees

Create announcements for their team

Access manager-authorized resources

Employee

Can:

Submit leave

Have leave approved/rejected by their Manager

View relevant announcements

Ask questions about company policies through RAG

Critical Security Rule

Frontend permissions are ONLY for UI behavior.

The FastAPI backend MUST enforce authorization on every protected operation.

Never trust:

Frontend role values

Client-supplied ownership IDs

Client-supplied manager IDs

Hidden UI fields

Request payloads for authorization decisions

Always derive the authenticated user from the validated JWT and verify resource ownership/hierarchy on the backend.

📂 Architecture & Folder Structure

Use a simple layered architecture.

Recommended structure:

backend/
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── router.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── leaves.py
│   │       ├── announcements.py
│   │       └── rag.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── dependencies.py
│   │   └── exceptions.py
│   │
│   ├── db/
│   │   ├── session.py
│   │   └── base.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── leave.py
│   │   ├── announcement.py
│   │   └── policy_document.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── leave.py
│   │   ├── announcement.py
│   │   └── rag.py
│   │
│   └── services/
│       ├── auth_service.py
│       ├── user_service.py
│       ├── leave_service.py
│       ├── announcement_service.py
│       └── rag_service.py
│
├── alembic/
├── tests/
├── .env
├── .env.example
├── pyproject.toml
└── AGENT.md

Responsibility of Each Layer

api/

Contains HTTP routes/controllers.

Responsibilities:

Receive HTTP requests

Validate request schemas

Get authenticated user

Call services

Return response schemas

Translate known service errors into HTTP responses

Routes should remain thin.

core/

Contains application-wide infrastructure:

Configuration

Security

JWT utilities

Authentication dependencies

Authorization dependencies

Common exceptions

db/

Contains database infrastructure:

SQLAlchemy engine

Session configuration

Declarative base

Database-related setup

models/

Contains SQLAlchemy database models.

Models represent persisted database state and relationships.

schemas/

Contains Pydantic request/response schemas.

Use schemas to control:

Input validation

Output serialization

Public API contracts

Never expose SQLAlchemy models directly as API responses.

services/

Contains business logic.

AI RULE — CRITICAL

Business logic belongs in services/, NOT directly in api/ routes.

For example:

POST /leaves/{id}/approve
        ↓
API route
        ↓
leave_service.approve_leave(...)
        ↓
Validate hierarchy + permissions + status
        ↓
Database update
        ↓
Response schema

Do not place complicated business rules inside route functions.

🗄️ Database Design Principles

Use PostgreSQL with SQLAlchemy.

Expected core entities:

User
Leave
Announcement
PolicyDocument / PolicyChunk

The exact schema can evolve as implementation progresses, but keep relationships explicit and normalized.

User Hierarchy

Users should have:

Role

Company relationship

Manager relationship where applicable

Important hierarchy rules:

Owner
  ↓
Manager
  ↓
Employee

An Employee belongs to one Manager.

A Manager belongs to the Owner/company.

Managers must never be able to access or modify employees belonging to another manager.

Database Integrity

Prefer database constraints and relationships where appropriate.

Use Alembic migrations for schema changes.

Never manually modify the production database schema as a substitute for migrations.

🔐 Authentication & Authorization

Use JWT authentication.

Expected flow:

Register
  ↓
Hash password
  ↓
Store user

Login
  ↓
Verify password
  ↓
Create JWT
  ↓
Client sends Bearer token
  ↓
FastAPI validates JWT
  ↓
Authenticated user identified
  ↓
Authorization checks role/hierarchy

Passwords

Never store plaintext passwords.

Never return password hashes through API responses.

JWT

JWT payload should contain only information needed for authentication/authorization.

Do not put sensitive or unnecessary application data into JWTs.

Authorization

Authentication answers:

Who is the user?

Authorization answers:

Is this user allowed to perform this operation on this resource?

Both must be handled correctly.

🧠 Business Rules

Leave Approval

Employee:

Employee submits leave
        ↓
PENDING
        ↓
Employee's Manager
        ↓
APPROVED / REJECTED

Manager:

Manager submits leave
        ↓
PENDING
        ↓
Owner
        ↓
APPROVED / REJECTED

A user must not approve their own leave.

A Manager must not approve leave belonging to another Manager's employee.

An Employee must not approve/reject leave.

Only valid pending leaves can be approved/rejected.

📢 Announcements

Announcement visibility must follow hierarchy.

Owner

Can create:

Company-wide announcements

Manager

Can create:

Team announcements for employees under that manager

Employee

Can:

View announcements relevant to them

Do not allow employees to create announcements.

Do not allow a Manager to publish announcements for another Manager's team.

🤖 RAG Policy Assistant

The initial RAG system is intentionally limited.

Data Source

Only company policy documents.

Examples:

Sick leave policy

Casual leave policy

General leave rules

Other company policies

Flow

User question
      ↓
Create embedding
      ↓
pgvector similarity search
      ↓
Retrieve relevant policy chunks
      ↓
Build LLM context
      ↓
LLM generates answer
      ↓
Return answer

Critical RAG Boundary

The RAG assistant MUST NOT initially access:

Employee leave balances

Employee personal data

Application-specific leave records

Payroll

Attendance

For example:

"How many sick leaves do I have left?"

is OUT OF SCOPE for the initial RAG implementation.

The system should answer only questions supported by company policy documents.

Future employee-specific data integration must be implemented separately when explicitly requested.

⚙️ Environment Variables

Use .env locally and never commit real secrets.

Example .env.example:

APP_NAME=WorkFlow
APP_ENV=development
DEBUG=true

DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/workflow

JWT_SECRET=replace-with-secure-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# RAG / LLM
LLM_API_KEY=
EMBEDDING_MODEL=
LLM_MODEL=

Do not place real credentials in:

AGENT.md

source code

Git

README

frontend code

🚀 Local Setup & Development

Install dependencies

Use uv.

uv sync

Activate virtual environment

Windows PowerShell:

.\.venv\Scripts\Activate.ps1

Run migrations

uv run alembic upgrade head

Start FastAPI

Use the project's configured start command.

Typical development command:

uv run uvicorn app.main:app --reload

If a project script named back-end-workflow is configured in pyproject.toml, this may also be used:

uv run back-end-workflow

Ruff

Check code:

uv run ruff check .

Format code:

uv run ruff format .

Tests

uv run pytest

🔌 API Organization

Use clear REST-style route prefixes.

Recommended:

/api/auth
/api/users
/api/leaves
/api/announcements
/api/rag

Example responsibilities:

/api/auth

Register

Login

Logout

Current authenticated user

/api/users

User management

Manager creation

Employee creation

Hierarchy-aware user operations

/api/leaves

Submit leave

List relevant leaves

Approve leave

Reject leave

/api/announcements

Create announcements

List relevant announcements

/api/rag

Ask policy questions

Policy-document ingestion/retrieval endpoints if required by the implementation

Do not create endpoints for features outside the MVP.

❌ Error Handling

Use consistent HTTP errors.

Examples:

401 Unauthorized

When authentication is missing/invalid.

403 Forbidden

When the user is authenticated but lacks permission.

404 Not Found

When a resource does not exist or should not be exposed.

400 Bad Request

For invalid business operations where appropriate.

422 Unprocessable Entity

For request validation handled by FastAPI/Pydantic.

Do not expose internal exceptions, stack traces, database details, or secrets to clients.

🧪 Testing Guidelines

Write tests for important business rules, especially:

Registration

Login

Invalid credentials

Protected routes

Role authorization

Owner → Manager creation

Manager → Employee creation

Manager isolation

Employee leave submission

Manager leave approval

Manager leave submission

Owner leave approval

Invalid leave approval

Announcement visibility

RAG retrieval behavior

Prioritize tests around business rules rather than testing trivial framework behavior.

🧱 Development Workflow

When implementing a feature, follow this order where practical:

1. Understand the requirement
2. Check existing architecture
3. Identify database changes
4. Create/update SQLAlchemy models
5. Create Alembic migration
6. Create Pydantic schemas
7. Implement service/business logic
8. Add API route
9. Add authorization checks
10. Add tests
11. Run Ruff
12. Run tests

Do not skip directly to routes if the feature requires database or service-layer changes.

🤖 AI Guidelines — CRITICAL

When acting as a coding agent for this project:

Stay within the current MVP scope.

Do not implement future features unless explicitly requested.

Before changing code, inspect the existing project structure and reuse existing patterns.

Do not create duplicate utilities, services, schemas, or dependencies when an existing implementation can be reused.

Keep API routes thin.

Put business logic in services/.

Use Pydantic v2 for API validation and serialization.

Use SQLAlchemy for database access.

Use Alembic for database schema changes.

Never bypass authentication/authorization for convenience.

Backend authorization is the source of truth.

Never trust role, owner, manager, or user IDs supplied by the frontend without validating them against the authenticated user and database.

Never store plaintext passwords.

Never expose secrets or password hashes.

Prefer simple solutions over unnecessary abstractions.

Do not introduce unnecessary design patterns.

Keep naming consistent and descriptive.

Handle expected errors explicitly.

Add tests for meaningful business rules.

Do not silently change existing behavior while implementing unrelated work.

Do not refactor unrelated files unless necessary.

If a requirement is ambiguous and the ambiguity affects architecture or security, ask before making a major assumption.

Explain what is being implemented and why before large changes.

Work incrementally and do not jump ahead to later project phases.

Keep the implementation resume-quality but practical enough to finish quickly.

📌 Implementation Priority

When multiple tasks are possible, follow this general order:

Phase 1 — Project setup
Phase 2 — Database + migrations
Phase 3 — Authentication
Phase 4 — RBAC + hierarchy
Phase 5 — Leave management
Phase 6 — Announcements
Phase 7 — RAG policy assistant
Phase 8 — Testing + cleanup

Do not start a later phase just because its structure can be prepared early.

The current requested task always takes priority.

✅ Definition of Done

A backend feature is considered complete when:

The requirement is implemented

Authorization is enforced server-side

Input/output schemas are defined

Business logic is in the service layer

Database changes have migrations when required

Errors are handled appropriately

Relevant tests exist

Ruff passes

Existing functionality is not unnecessarily broken

No out-of-scope feature was added