from fastapi import APIRouter
from backend.routes.announcements import router as announcements_router
from backend.routes.auth import router as auth_router
from backend.routes.chat import router as chat_router
from backend.routes.company import router as company_router
from backend.routes.leaves import router as leaves_router
from backend.routes.policies import router as policies_router
from backend.routes.users import router as users_router

# Consolidated API v1 router
api_router = APIRouter(prefix="/api/v1")

# Include domain route modules
api_router.include_router(auth_router)
api_router.include_router(company_router)
api_router.include_router(users_router)
api_router.include_router(leaves_router)
api_router.include_router(announcements_router)
api_router.include_router(policies_router)
api_router.include_router(chat_router)

__all__ = [
    "api_router",
    "auth_router",
    "company_router",
    "users_router",
    "leaves_router",
    "announcements_router",
    "policies_router",
    "chat_router",
]

