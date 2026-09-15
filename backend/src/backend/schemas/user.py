from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from backend.models.enums import UserRole


class UserResponse(BaseModel):
    id: int
    company_id: int
    email: EmailStr
    role: UserRole
    is_active: bool
    force_password_reset: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserCreateRequest(BaseModel):
    email: EmailStr = Field(..., description="Employee or HR corporate email address")
    role: UserRole = Field(default=UserRole.EMPLOYEE, description="Assigned role: HR or EMPLOYEE")


class UserCreateResponse(BaseModel):
    user: UserResponse
    temporary_password: str = Field(..., description="Auto-generated passcode (email[:3] + '1234')")


class UserStatusToggleRequest(BaseModel):
    is_active: bool = Field(..., description="Active state for account access (soft-delete toggle)")
