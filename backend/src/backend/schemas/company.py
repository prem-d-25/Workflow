from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from backend.schemas.leave import LeaveQuotaResponse, LeaveQuotaUpdateRequest


class CompanyCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Company name")
    logo_url: Optional[str] = Field(None, max_length=1024, description="Optional logo URL")


class CompanyUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255, description="Updated company name")
    logo_url: Optional[str] = Field(None, max_length=1024, description="Updated logo URL")
    quotas: Optional[LeaveQuotaUpdateRequest] = Field(None, description="Updated company leave quotas")


class CompanyResponse(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CompanyWithQuotasResponse(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None
    created_at: datetime
    quotas: Optional[LeaveQuotaResponse] = None

    model_config = ConfigDict(from_attributes=True)
