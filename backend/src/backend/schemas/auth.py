from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from backend.schemas.company import CompanyResponse
from backend.schemas.user import UserResponse


class CompanyRegisterRequest(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=255, description="Name of the company")
    logo_url: Optional[str] = Field(None, max_length=1024, description="Optional company logo URL")
    email: EmailStr = Field(..., description="Owner's corporate email address")
    password: str = Field(..., min_length=6, max_length=72, description="Owner password (min 6 characters)")


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Corporate email address")
    password: str = Field(..., min_length=1, description="Account password")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    force_password_reset: bool
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Valid long-lived refresh token")


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, description="Current account password")
    new_password: str = Field(..., min_length=6, max_length=72, description="New password (min 6 chars)")


class MeResponse(BaseModel):
    user: UserResponse
    company: CompanyResponse

    model_config = ConfigDict(from_attributes=True)
