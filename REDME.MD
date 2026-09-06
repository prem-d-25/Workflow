# WorkFlow

# Role-Based Employee Management Platform with RAG-Powered AI Assistant

A modern, enterprise-grade Employee Management and Operations Platform built with **FastAPI**, **React.js**, and **PostgreSQL (pgvector)**. The platform provides granular role-based access control (RBAC) across organizational hierarchies, automated workflow approvals, centralized communication, and an intelligent Retrieval-Augmented Generation (RAG) assistant for querying internal policies and employee data.

---

## 🚀 Key Features

### 1. Hierarchical Role-Based Access Control (RBAC)
- Multi-tier permissions tailored for **Owner**, **HR**, and **Employee** roles.
- Secure JWT-based authentication with refresh/access token lifecycle and password hashing (bcrypt).
- Strict endpoint-level authorization guards preventing privilege escalation.

### 2. Hierarchical Leave Management & Approval Workflows
- **Employee Portal**: Apply for leaves, track remaining balances, and view real-time status updates.
- **Multi-Level Approval Flow**: Configurable approval pipelines (Employee → HR / Manager → Owner).
- Automated leave balance deduction and audit trail tracking.

### 3. Centralized Company Announcements Module
- Company-wide or department-specific broadcasts published by HR/Owners.
- Priority pinning, scheduled posts, and rich-text support.
- Real-time notifications and updates.

### 4. RAG-Based AI Knowledge Assistant (`pgvector`)
- Context-aware chatbot trained on internal handbooks, HR policies, benefits, and FAQ documentation.
- Vector embeddings stored and similarity-searched natively via **PostgreSQL + `pgvector`**.
- Role-aware filtering ensuring users only retrieve information permitted for their access tier[cite: 1].

---

## 🛠 Architecture & Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Axios[cite: 1]
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy ORM, Alembic, Pydantic[cite: 1]
- **Database & Vector Store**: PostgreSQL with `pgvector` extension[cite: 1]
- **AI / Embeddings**: LangChain / LlamaIndex, OpenAI / HuggingFace Models[cite: 1]
- **Authentication**: OAuth2 Password Bearer with JWT & Bcrypt[cite: 1]

---

## 👥 Role-Based Access Control (RBAC)

| Feature / Module | Employee | HR Manager | Owner / Admin |
| :--- | :---: | :---: | :---: |
| **View Own Profile & Dashboard** | ✅ | ✅ | ✅ |
| **Apply / Track Own Leaves** | ✅ | ✅ | ✅ |
| **Approve / Reject Team Leaves** | ❌ | ✅ | ✅ |
| **Employee Directory & Records** | Read-Only | Full CRUD | Full CRUD |
| **Publish Announcements** | ❌ | ✅ | ✅ |
| **Upload Policy Documents (RAG)**| ❌ | ✅ | ✅ |
| **RAG AI Policy Chatbot** | ✅ | ✅ | ✅ |
| **Role & Permission Management** | ❌ | ❌ | ✅ |
| **Audit Logs & System Analytics**| ❌ | Read-Only | Full Access |

---

## 🧠 RAG AI Chatbot Architecture

1. **Document Ingestion**: HR/Owner uploads organizational PDFs/Docs (Employee Handbook, Leave Policies, Benefits)[cite: 1].
2. **Chunking & Embedding**: Text is parsed, split into semantically coherent chunks, and embedded via an embedding model[cite: 1].
3. **Storage in `pgvector`**: Chunk embeddings and metadata (access role, category, source) are indexed in PostgreSQL[cite: 1].
4. **Query Pipeline**:
   - User inputs a prompt (e.g., *"How many casual leaves can I take consecutively?"*)[cite: 1].
   - System embeds the prompt and executes a cosine distance similarity query via `pgvector`[cite: 1].
   - Top-$k$ relevant passages are retrieved and injected into the LLM system prompt[cite: 1].
   - LLM generates a grounded, context-aware answer[cite: 1].

---
