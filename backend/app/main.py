"""FastAPI application entry point, CORS setup, and router registration."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.auth import router as auth_router
from app.routers.company import router as company_router
from app.routers.health import router as health_router
from app.routers.leave_types import router as leave_types_router
from app.routers.users import router as users_router

app = FastAPI(
    title="Workflow API",
    description="Employee Management System API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(company_router, prefix="/api")
app.include_router(leave_types_router, prefix="/api")
app.include_router(users_router, prefix="/api")
