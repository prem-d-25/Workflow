# 🏗️ Implementation Plan: Backend Database Setup (PostgreSQL)

Here is the step-by-step plan to connect your FastAPI backend to your PostgreSQL database. 

## 1. 🗄️ Database Preparation (Your Turn!)
Before we can write the code to connect, I need you to do the following in **pgAdmin**:
1. Open **pgAdmin** and log in.
2. Right-click on "Databases" (under your local server) -> **Create** -> **Database**.
3. Name the database: `workflow_db` and click Save.
4. **Tell me your PostgreSQL username** (usually `postgres`) **and your password** so I can create the connection string.

## 2. 📦 Install Dependencies
I will use `uv` to install the necessary Python packages for our database:
- `sqlalchemy` (The ORM to interact with the database using Python objects)
- `asyncpg` (The lightning-fast async driver for PostgreSQL)
- `alembic` (For database migrations, so we can update our tables easily later)
- `python-dotenv` (To securely load environment variables)

## 3. ⚙️ Environment Variables
I will create a `.env` file in the `back-end-workflow` folder. It will contain the connection string using the credentials you provide:
`DATABASE_URL=postgresql+asyncpg://<username>:<password>@localhost:5432/workflow_db`

## 4. 🔌 Database Connection Logic (`src/back_end_workflow/db/database.py`)
I will create the core database configuration which handles:
- The async Engine (the actual connection to Postgres).
- The Session Maker (what we use to query the DB).
- The `get_db()` dependency (which we will inject into our FastAPI routes).

## 5. 🧑‍💼 Create the Base User Model (`src/back_end_workflow/models/user.py`)
To test that everything works, I will build our first database table: the `User` model. This will include fields for `id`, `email`, `password_hash`, and `role` based on our `AGENT.md` rules.

---
**STATUS:** Awaiting your database credentials. Once you create `workflow_db` in pgAdmin and give me your username/password, I will execute this plan!
