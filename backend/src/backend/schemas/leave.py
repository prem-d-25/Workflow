from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from backend.models.enums import LeaveStatus, LeaveType


class LeaveQuotaResponse(BaseModel):
    id: int
    company_id: int
    sick_quota: int
    casual_quota: int
    paid_quota: int

    model_config = ConfigDict(from_attributes=True)


class LeaveQuotaUpdateRequest(BaseModel):
    sick_quota: int = Field(..., ge=0, description="Allocated annual sick leave days")
    casual_quota: int = Field(..., ge=0, description="Allocated annual casual leave days")
    paid_quota: int = Field(..., ge=0, description="Allocated annual paid leave days")


class LeaveApplyRequest(BaseModel):
    leave_type: LeaveType = Field(..., description="Type of leave: SICK, CASUAL, PLANNED, or UNPAID")
    start_date: date = Field(..., description="First day of leave (YYYY-MM-DD)")
    end_date: date = Field(..., description="Last day of leave (YYYY-MM-DD)")
    reason: str = Field(..., min_length=3, max_length=1000, description="Reason for leave application")


class LeaveResponse(BaseModel):
    id: int
    company_id: int
    user_id: int
    leave_type: LeaveType
    start_date: date
    end_date: date
    total_days: int
    reason: str
    status: LeaveStatus
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    user_email: Optional[str] = None
    reviewer_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class LeaveReviewRequest(BaseModel):
    status: LeaveStatus = Field(..., description="Review decision: APPROVED or REJECTED")


class LeaveTypeBalance(BaseModel):
    quota: int
    used: int
    remaining: int


class LeaveBalanceResponse(BaseModel):
    sick: LeaveTypeBalance
    casual: LeaveTypeBalance
    paid: LeaveTypeBalance
    extra_unpaid_days: int = Field(
        ...,
        description="Total approved extra or unpaid leave days taken beyond allocated quotas (e.g. emergency/accident leaves)",
    )
