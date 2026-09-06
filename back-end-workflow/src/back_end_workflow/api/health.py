from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from back_end_workflow.db.database import get_db
from back_end_workflow.services import health_service

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/db-check")
async def check_db(db: AsyncSession = Depends(get_db)):
    """
    Hit this endpoint in Postman (GET /api/health/db-check)
    to verify that the database is connected.
    """
    result = await health_service.check_database_connection(db)
    return result

# Placeholder for future routes (e.g., auth, leaves)
# @router.post("/dummy-route")
# async def dummy_route():
#     pass
