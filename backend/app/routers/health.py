"""Health check route handler."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def get_health(db: Session = Depends(get_db)) -> HealthResponse:
    """Return API status, database connectivity, and pgvector extension status."""
    db_connected = False
    vector_enabled = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True

        ext_check = db.execute(
            text("SELECT 1 FROM pg_extension WHERE extname = 'vector'")
        ).scalar()
        vector_enabled = ext_check is not None
    except Exception:
        db_connected = False
        vector_enabled = False

    return HealthResponse(
        status="ok" if (db_connected and vector_enabled) else "degraded",
        database="connected" if db_connected else "disconnected",
        vector="enabled" if vector_enabled else "missing",
    )
