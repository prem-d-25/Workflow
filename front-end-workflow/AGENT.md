Frontend Agent Context — WorkFlow

📖 Overview

WorkFlow is a resume-quality company/employee management web application. The frontend provides role-aware screens for Owners, Managers, and Employees, including authentication, dashboards, hierarchy management, leave management, announcements, and a company-policy RAG assistant.

The UI should be simple, clean, responsive, and professional enough for a resume/GitHub project without becoming a large design system or an over-engineered frontend.

🛠️ Tech Stack

Framework: React + Vite

Language: TypeScript

Styling: Tailwind CSS

Routing: React Router DOM

State Management: React Context where global state is actually required

API Communication: Fetch/Axios through a centralized API client

Backend: FastAPI

Database: PostgreSQL — accessed only through the backend

Do not introduce Redux, Zustand, a component library, or another state-management solution unless explicitly requested.

🎯 MVP Scope

The frontend contains ONLY UI required for:

Authentication

Register

Login

Logout

Role-Based UI

Owner

Manager

Employee

Company/User Hierarchy

Owner manages Managers

Manager manages their Employees

Leave Management

Employee submits leave

Manager approves/rejects employee leave

Manager submits leave

Owner approves/rejects manager leave

Leave statuses:

PENDING

APPROVED

REJECTED

Announcements

Owner creates company announcements

Manager creates team announcements

Employees view relevant announcements

RAG Policy Assistant

Ask questions about company policy

Display answers returned by the backend

Explicitly Out of Scope

Do NOT build UI for:

Payroll

Attendance

Notifications

Email systems

Analytics

Employee-specific leave calculations

Employee leave balance RAG

Performance management

Chat/messaging

Calendar systems

Other future HR features

👥 Roles

Owner
├── Manager A
│   ├── Employee 1
│   ├── Employee 2
│   └── Employee 3
│
└── Manager B
    ├── Employee 4
    └── Employee 5

Owner UI

Owner should be able to access relevant:

Dashboard

Manager management

Leave approvals for Managers

Company announcements

Policy assistant

Manager UI

Manager should be able to access relevant:

Dashboard

Employee management

Employee leave approvals

Own leave requests

Team announcements

Policy assistant

Employee UI

Employee should be able to access relevant:

Dashboard

Own leave requests

Relevant announcements

Policy assistant

📂 Architecture & Folder Structure

Recommended structure:

frontend/
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── leaves/
│   │   ├── announcements/
│   │   └── users/
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   │
│   │   ├── DashboardPage.tsx
│   │   ├── users/
│   │   ├── leaves/
│   │   ├── announcements/
│   │   └── rag/
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── ...
│   │
│   ├── context/
│   │   └── AuthContext.tsx
│   │
│   ├── services/
│   │   ├── apiClient.ts
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── leaveService.ts
│   │   ├── announcementService.ts
│   │   └── ragService.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── leave.ts
│   │   ├── announcement.ts
│   │   └── rag.ts
│   │
│   ├── routes/
│   │   └── AppRoutes.tsx
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env
├── .env.example
├── package.json
└── AGENT.md

Folder Responsibilities

components/

Reusable UI building blocks.

Examples:

Button

Input

Modal

Table

Card

Navbar

Sidebar

LeaveStatusBadge

AnnouncementCard

AI RULE — CRITICAL

Components must be reusable.

Do not put large page-specific workflows into generic components.

A component should receive data/actions through props when appropriate instead of directly knowing about unrelated pages.

pages/

Contains page-level UI and page-specific orchestration.

Examples:

LoginPage

DashboardPage

LeavePage

ManagerEmployeesPage

AnnouncementsPage

PolicyAssistantPage

AI RULE — CRITICAL

Page-specific logic belongs in pages/, not generic reusable components.

Pages can combine components, hooks, and services to implement a complete screen.

hooks/

Reusable React hooks.

Use hooks for reusable UI/application behavior.

Do not create hooks simply to move code around without providing reuse or a clear abstraction.

context/

Global application state that genuinely needs to be shared.

Initially this should mainly contain authentication state.

Do not put every piece of application data into Context.

services/

API communication.

Services should contain backend requests and API-specific logic.

Example:

leaveService.ts
    getMyLeaves()
    createLeave()
    approveLeave()
    rejectLeave()

Pages should call services/hooks rather than manually constructing API requests throughout the UI.

types/

Shared TypeScript types/interfaces for API and application data.

Examples:

User
Role
Leave
LeaveStatus
Announcement
RagAnswer

Avoid duplicating the same type in multiple files.

🔐 Authentication

Authentication is handled by the FastAPI backend.

Frontend responsibilities:

Register/login through API

Store authentication state appropriately

Send JWT with protected requests

Restore authentication state when possible

Redirect unauthenticated users to /login

Redirect authenticated users away from authentication pages when appropriate

Logout cleanly

Security Rule

The frontend must NEVER be treated as the authorization source of truth.

Role-based UI is for user experience only.

The backend must enforce every permission.

Never assume:

if user.role === "manager"

means the backend will allow an operation.

The API response is authoritative.

🛣️ Routing

Use React Router DOM.

Recommended route map:

/login
    → LoginPage

/register
    → RegisterPage

/dashboard
    → DashboardPage

/users/managers
    → ManagerManagementPage
    → Owner only

/users/employees
    → EmployeeManagementPage
    → Manager / appropriate authorized users

/leaves
    → LeavePage

/leaves/pending
    → PendingLeaveApprovalsPage
    → Owner / Manager depending on hierarchy

/announcements
    → AnnouncementsPage

/policy-assistant
    → PolicyAssistantPage

The exact route structure may change slightly as implementation develops.

Do not create routes for features outside the MVP.

🧭 Route Protection

Use reusable route guards.

Conceptually:

Public Route
    ↓
Login / Register

Protected Route
    ↓
Is authenticated?
    ↓
Yes → render page
No  → /login

For role-aware UI:

Authenticated
    ↓
Check role
    ↓
Show appropriate navigation/actions

But remember:

Frontend route guards are UX protection, not security.

The backend must independently enforce authorization.

🎨 UI/UX & Styling Guidelines

The design goal is:

Basic, clean, modern, professional.

It should look like a real internal company management application, not a flashy landing page.

Styling

Use Tailwind CSS.

Prefer:

Clean spacing

Rounded cards

Clear hierarchy

Subtle borders

Simple shadows

Readable typography

Responsive layouts

Consistent buttons

Consistent form controls

Clear empty states

Loading states

Error states

Avoid:

Excessive gradients

Excessive animations

Huge decorative elements

Overly colorful dashboards

Unnecessary glassmorphism

Complicated visual effects

Layout

Authenticated pages should generally use:

┌─────────────────────────────────────────────┐
│ Navbar / Header                             │
├──────────────┬──────────────────────────────┤
│ Sidebar      │ Main Content                 │
│              │                              │
│ Dashboard    │ Page heading                 │
│ Employees    │ Content                      │
│ Leaves       │                              │
│ Announcements│                              │
│ Assistant    │                              │
└──────────────┴──────────────────────────────┘

The navigation should adapt to the authenticated user's role.

🎨 Design System

Keep a small consistent design language.

Colors

Use Tailwind's neutral/slate palette for the application foundation.

Use semantic colors only where useful:

Green → success / approved

Red → error / rejected

Yellow/amber → pending / warning

Neutral/blue → primary actions and information

Do not hard-code many different colors throughout components.

Typography

Use a clean sans-serif system font stack unless a specific font is explicitly requested.

Hierarchy should be clear:

Page title
Section title
Card title
Body text
Secondary/helper text

Buttons

Have consistent visual patterns for:

Primary

Secondary

Danger

Ghost

Do not create a different button style for every page.

📱 Responsive Design

The application should work reasonably on:

Desktop

Tablet

Mobile

Desktop is the primary target because this is an internal company management application.

Do not spend excessive time building a complex mobile-specific layout unless explicitly requested.

📡 API Integration

All backend communication should go through a centralized API client.

Example:

services/
└── apiClient.ts

The API client should handle:

Base URL

HTTP requests

JSON handling

Authentication headers

Common error handling where appropriate

Example architecture:

Page
 ↓
Service
 ↓
apiClient
 ↓
FastAPI

Not:

Page
 ↓
fetch(...)
 ↓
fetch(...)
 ↓
axios(...)
 ↓
fetch(...)

Avoid scattered API calls throughout UI components.

API Services

Keep domain-specific API operations separated:

authService.ts
userService.ts
leaveService.ts
announcementService.ts
ragService.ts

⚙️ Environment Variables

Example .env:

VITE_API_BASE_URL=http://localhost:8000

Example .env.example:

VITE_API_BASE_URL=http://localhost:8000

Never put:

JWT secrets

Database credentials

LLM API keys

Backend secrets

into frontend environment variables.

Anything exposed through VITE_* should be treated as public.

🚀 Local Setup & Development

Install dependencies:

npm install

Start development server:

npm run dev

Build:

npm run build

Preview production build:

npm run preview

Use the package manager already established by the project if it differs, but do not introduce multiple package managers unnecessarily.

🧩 Component Guidelines

Prefer small reusable components.

Example:

Button
Input
Modal
Card
Table
Badge
LoadingSpinner
EmptyState
ErrorMessage

Domain components:

LeaveCard
LeaveStatusBadge
LeaveRequestForm
AnnouncementCard
EmployeeTable
ManagerTable

Pages compose these components.

Avoid giant components such as:

Dashboard.tsx = 1000+ lines

If a page becomes large, extract meaningful reusable or page-specific components.

Do not split every five lines into a component.

📝 Forms & Validation

Forms should provide:

Required field validation

Clear labels

Helpful error messages

Loading/submitting state

Disabled submit state when appropriate

API error display

Backend validation is still authoritative.

Frontend validation exists for UX and early feedback.

Never assume frontend validation replaces backend validation.

🔄 Loading / Error / Empty States

Every API-driven screen should consider:

Loading

Loading...

Prefer a simple skeleton/spinner when appropriate.

Error

Show a clear user-facing message.

Do not display raw server stack traces.

Empty

Example:

No leave requests found.

Success

After actions such as:

Creating a manager

Creating an employee

Submitting leave

Approving leave

Rejecting leave

Creating an announcement

provide clear feedback where appropriate.

Keep feedback simple.

📊 Role-Aware Dashboard

The dashboard can display different useful information based on role.

Owner

Focus on:

Company overview

Managers

Pending manager leave approvals

Company announcements

Manager

Focus on:

Team

Pending employee leave approvals

Own leave

Team announcements

Employee

Focus on:

Own leave requests

Relevant announcements

Policy assistant

Do not add analytics or charts just to make the dashboard look bigger.

🤖 RAG Policy Assistant UI

The frontend should provide a simple chat/question interface.

Example:

┌─────────────────────────────────────┐
│ Company Policy Assistant            │
├─────────────────────────────────────┤
│                                     │
│ You: How many sick leaves do I get? │
│                                     │
│ AI: According to company policy...  │
│                                     │
├─────────────────────────────────────┤
│ Ask about company policy...   [Ask] │
└─────────────────────────────────────┘

The assistant initially answers ONLY from company policy documents.

Do not build UI for:

"How many sick leaves do I have left?"

because employee-specific leave balance data is intentionally outside the MVP.

🔒 Frontend Security Rules

Never store backend secrets in frontend code.

Never expose database credentials.

Never expose LLM API keys.

Never trust client-side role checks for security.

Never allow UI manipulation to bypass backend permissions.

Never put authorization logic solely in the frontend.

Do not assume hidden buttons provide security.

Handle expired/invalid authentication cleanly.

Avoid logging JWTs or sensitive user information.

Do not store unnecessary sensitive data in browser storage.

🤖 AI Guidelines — CRITICAL

When acting as a coding agent for this project:

Stay within the current MVP scope.

Do not build future features unless explicitly requested.

Inspect the existing frontend before creating new components or utilities.

Reuse existing components and patterns.

Use TypeScript for reusable components and shared application types.

Prefer TypeScript throughout the frontend; use JavaScript only if the existing project explicitly requires it.

Avoid any unless there is a genuinely unavoidable external boundary.

Prefer explicit interfaces/types.

Keep components functional and use React hooks.

Keep reusable components generic and page-specific logic in pages.

Keep API communication inside services/.

Keep global state minimal.

Use Context only for genuinely global state such as authentication.

Do not introduce Redux/Zustand or another state library without explicit approval.

Use Tailwind CSS consistently.

Do not introduce a UI component library unless explicitly requested.

Keep the UI basic, clean, and professional.

Avoid unnecessary animations and visual complexity.

Every API-driven page should handle loading, error, and empty states.

Backend validation and authorization are authoritative.

Do not duplicate backend business logic in the frontend.

Do not implement security rules solely through UI hiding.

Do not scatter raw fetch()/Axios calls throughout components.

Do not create unnecessary abstractions.

Do not refactor unrelated files while implementing a feature.

Keep naming consistent.

Do not add features simply because they may be useful in the future.

Explain what is being implemented and why before significant changes.

Work incrementally and do not jump ahead to later phases.

Keep the implementation resume-quality while remaining practical and fast to build.

🧭 Development Workflow

When implementing a frontend feature:

1. Understand the requirement
2. Check existing pages/components
3. Check existing types
4. Check existing API services
5. Identify required API interaction
6. Create/update types
7. Create/update service
8. Build/reuse components
9. Implement page-level behavior
10. Add/update routes
11. Add loading/error/empty states
12. Verify role-based UI behavior
13. Test against backend API
14. Build the project
15. Clean up only what is necessary

Do not start implementing unrelated future features.

📌 Implementation Priority

Follow this general order:

Phase 1 — React/Vite/Tailwind setup
Phase 2 — Application layout + routing
Phase 3 — Authentication
Phase 4 — RBAC-aware navigation/dashboard
Phase 5 — User hierarchy
Phase 6 — Leave management
Phase 7 — Announcements
Phase 8 — RAG policy assistant
Phase 9 — UI polish + error/loading states

The current requested task always takes priority.

Do not implement a later phase unless requested or required by the current feature.

✅ Definition of Done

A frontend feature is complete when:

The requested UI is implemented

Existing components are reused where appropriate

API calls use the service/API-client layer

TypeScript types are defined correctly

Loading states exist where needed

Error states exist where needed

Empty states exist where appropriate

Role-aware UI is handled

Backend remains the authorization source of truth

UI is responsive enough for the target use case

Tailwind styling is consistent

No unnecessary dependency was introduced

No out-of-scope feature was added

Existing functionality was not unnecessarily changed

The application builds successfully

==================================================
USER DEFINED RULES (UPDATED)
==================================================
- MODULAR CODE: Never put all code into a single file. Break down large components and logic into smaller, maintainable files so they are easy to read and modify.
- API CLIENT: Exclusively use 'axios' for all API calls. Avoid using native fetch.
- DOCUMENTATION: Any time a new major architectural decision or feature is introduced, this AGENT.md file MUST be updated to reflect it.


==================================================
DESIGN SYSTEM: ENGINEERED ORANGE & CHARCOAL
==================================================
- Primary Brand Color: Engineered Orange (Tailwind 'orange-500' / #f97316 to 'orange-600')
- Background/Neutral: Charcoal/Zinc (Tailwind 'zinc-50' for light mode backgrounds, 'zinc-900' for dark accents or text)
- Style: Minimalist, clean lines, slightly rounded corners (rounded-lg or rounded-xl), subtle shadows (shadow-sm, shadow-md). Avoid heavy gradients. Use Lucide-react for icons.
