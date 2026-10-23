"""Schemas for system health check."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health check response payload."""

    status: str
    database: str
    vector: str
