"""LeaveType request and response schemas."""

from datetime import datetime
import uuid

from pydantic import BaseModel, ConfigDict, Field, field_validator


class LeaveTypeResponse(BaseModel):
    """Leave category details."""

    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    days_allowed: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeaveTypeCreateRequest(BaseModel):
    """Payload to create a new leave type."""

    name: str = Field(..., min_length=1, max_length=50)
    days_allowed: int = Field(..., ge=0, le=365)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Leave type name cannot be empty or whitespace only.")
        return stripped


class LeaveTypeUpdateRequest(BaseModel):
    """Payload to update an existing leave type."""

    name: str = Field(..., min_length=1, max_length=50)
    days_allowed: int = Field(..., ge=0, le=365)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Leave type name cannot be empty or whitespace only.")
        return stripped
