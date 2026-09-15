# Workflow 

An enterprise role-based employee management platform featuring a hierarchical approval system and a context-aware AI HR chatbot.

## Features
- **Role-Based Access Control (RBAC):** Secure routing and permissions for Owners, HR, and Employees.
- **Hierarchical Leave Management:** Automated quota tracking, 5-day planned leave rules, and multi-tier approvals.
- **Centralized Announcements:** Company-wide notification broadcasting.
- **AI Policy Assistant:** A Retrieval-Augmented Generation (RAG) chatbot using `pgvector` for secure, tenant-isolated semantic search of uploaded company policy PDFs.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, Zustand, React Router
- **Backend:** Python, FastAPI, SQLAlchemy
- **Database & AI:** PostgreSQL, `pgvector`, OpenAI/HuggingFace Embeddings

## Setup Instructions

### Backend
1. Navigate to the backend directory: `cd backend`
2. Sync dependencies using uv: `uv sync`
3. Set up your `.env` file with `DATABASE_URL` and `JWT_SECRET`.
4. Run the server: `uv run uvicorn app.main:app --reload`

### Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
