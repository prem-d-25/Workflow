# Workflow - Employee Management & RAG Platform

## 1. Tech Stack & Environment
- **Frontend**: React.js (Vite), Tailwind CSS, Zustand, React Router DOM, Axios, Lucide React
- **Backend**: Python 3.13+ (managed with `uv`), FastAPI, SQLAlchemy 2.0 (Async ORM), asyncpg, Pydantic v2, PyJWT, Passlib (Bcrypt)
- **Database & AI**: PostgreSQL with `pgvector` extension (`Vector(1536)`)

## 2. Color System & Theme Design System
- **Theme**: Dark Mode Enterprise Dashboard
- **Background**: `#0F172A` (`bg-slate-900`)
- **Card / Surface**: `#1E293B` (`bg-slate-800`)
- **Borders**: `#334155` (`border-slate-700`)
- **Primary Accent**: `#FF4500` (`bg-orange-600` for primary buttons, submission triggers)
- **Secondary Accent**: `#0D9488` (`text-teal-400` / `bg-teal-600` for active tabs, badges, chatbot elements)
- **Text**: `#F8FAFC` (`text-slate-50` primary), `#94A3B8` (`text-slate-400` secondary)

## 3. Core Database Schema Specifications
- **companies**: `id` (PK), `name`, `logo_url`, `created_at`
- **users**: `id` (PK), `company_id` (FK -> companies.id), `email` (UNIQUE), `password_hash`, `role` (OWNER, HR, EMPLOYEE), `is_active` (BOOL, default True), `force_password_reset` (BOOL, default True), `created_at`
- **leave_quotas**: `id` (PK), `company_id` (FK -> companies.id), `sick_quota` (INT), `casual_quota` (INT), `paid_quota` (INT)
- **leave_requests**: `id` (PK), `company_id` (FK -> companies.id), `user_id` (FK -> users.id), `leave_type` (SICK, CASUAL, PLANNED, UNPAID), `start_date` (DATE), `end_date` (DATE), `total_days` (INT), `reason` (TEXT), `status` (PENDING, APPROVED, REJECTED), `reviewed_by` (FK -> users.id, nullable), `reviewed_at` (TIMESTAMP, nullable), `created_at`
- **announcements**: `id` (PK), `company_id` (FK -> companies.id), `author_id` (FK -> users.id), `title`, `content`, `created_at`
- **company_policies**: `id` (PK), `company_id` (FK -> companies.id), `document_name`, `content_chunk` (TEXT), `embedding` (VECTOR(1536))

## 4. Role-Based Access Control (RBAC) & Permissions Matrix
| Action | OWNER | HR | EMPLOYEE |
| :--- | :---: | :---: | :---: |
| Register Company & Setup Quotas | Yes | No | No |
| Add HR Users | Yes | No | No |
| Add Employee Users | Yes | Yes | No |
| Enable / Disable (Soft-Delete) Users | All in Company | Employees Only | No |
| Approve Employee Leaves | Yes | Yes | No |
| Approve HR Leaves | Yes (Sole Approver) | No | No |
| Apply for Leave (Subject to Quotas/Rules) | Yes | Yes | Yes |
| Publish / Manage Announcements | Yes | Yes | No |
| View Announcements | Yes | Yes | Yes |
| Upload Company Policy Documents | Yes | No | No |
| Query AI Policy Assistant (RAG) | Yes | Yes | Yes |

## 5. Core Business Rules & Logic
- **Passcode Generation**: Default auto-generated password = First 3 letters of email + `1234` (e.g. `joh1234` for `john.doe@example.com`).
- **First Login Password Change**: Redirect to password change screen when `force_password_reset == True`. Update `password_hash` and set `force_password_reset = False`.
- **Soft Delete Only**: Disable users using `is_active = False`. Never hard delete rows. Block login attempts if `is_active == False` (401 Unauthorized).
- **Planned Leave Enforcement**: Requests with `leave_type == 'PLANNED'` require `(start_date - today) >= 5 days` (e.g. leave on 15-9 must be applied on or before 10-9).
- **Immediate & Emergency Leaves**: Sick, Casual, or Unpaid leaves can be submitted immediately without the 5-day requirement. If quotas are exhausted, employee can still submit an emergency/unpaid leave request.
- **Hierarchical Leave Approvals**:
  - Owner can approve both HR and Employee leaves.
  - HR can ONLY approve Employee leaves.
  - HR's own leaves MUST be approved by the Owner.
- **RAG Multi-Tenant Boundary**: All policy search queries MUST strictly filter by `WHERE company_id = current_user.company_id`.
- **RAG Chatbot Ephemeral Session & Guardrails**:
  - Active conversation history is maintained during the current session, but is cleared on page refresh (no persistent historical chat logs saved in DB).
  - Strict prompt guardrails: AI only answers questions relevant to company policies, leave rules, and workplace procedures; it politely declines unrelated prompts.