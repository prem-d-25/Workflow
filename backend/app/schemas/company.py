"""Company request and response schemas."""

from datetime import datetime
import uuid

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CompanyResponse(BaseModel):
    """Company tenant details."""

    id: uuid.UUID
    name: str
    address: str | None = None
    phone: str | None = None
    website: str | None = None
    industry: str | None = None
    size: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CompanyUpdateRequest(BaseModel):
    """Payload for updating company information."""

    name: str = Field(..., min_length=1, max_length=255)
    address: str | None = Field(default=None, max_length=500)
    phone: str | None = Field(default=None, max_length=30)
    website: str | None = Field(default=None, max_length=255)
    industry: str | None = Field(default=None, max_length=100)
    size: str | None = Field(default=None, max_length=50)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Company name cannot be empty or whitespace only.")
        return stripped
