"""User management request and response schemas."""

from datetime import date, datetime
from typing import Any
import uuid

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.constants import UserRole


class CreateUserRequest(BaseModel):
    """Payload for creating a new HR or Employee account."""

    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    role: str = Field(..., description="Role must be 'hr' or 'employee'")

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Full name cannot be empty or whitespace only.")
        return stripped

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: Any) -> Any:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if cleaned not in (UserRole.HR.value, UserRole.EMPLOYEE.value):
            raise ValueError("Role must be 'hr' or 'employee'")
        return cleaned


class UserItemResponse(BaseModel):
    """Summary representation of a user for list views."""

    id: uuid.UUID
    company_id: uuid.UUID
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    must_change_password: bool
    designation: str | None = None
    department: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserDetailResponse(BaseModel):
    """Full detail view of a user profile (no password_hash)."""

    id: uuid.UUID
    company_id: uuid.UUID
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    must_change_password: bool
    phone: str | None = None
    date_of_birth: date | None = None
    address: str | None = None
    designation: str | None = None
    department: str | None = None
    joined_on: date | None = None
    created_by: uuid.UUID | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreateUserResponse(UserDetailResponse):
    """Response returned upon user creation, revealing temporary_password once."""

    temporary_password: str


class UserStatusUpdateRequest(BaseModel):
    """Payload for activating or deactivating a user."""

    is_active: bool


class UserListResponse(BaseModel):
    """Paginated list of users."""

    items: list[UserItemResponse]
    total: int
    page: int
    page_size: int
