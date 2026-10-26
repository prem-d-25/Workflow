"""Leave types HTTP endpoints."""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.constants import UserRole
from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import User
from app.schemas.leave_type import (
    LeaveTypeCreateRequest,
    LeaveTypeResponse,
    LeaveTypeUpdateRequest,
)
from app.services import leave_type_service

router = APIRouter(prefix="/leave-types", tags=["leave-types"])


@router.get("", response_model=list[LeaveTypeResponse])
def get_leave_types(
    current_user: User = Depends(
        require_roles(UserRole.OWNER, UserRole.HR, UserRole.EMPLOYEE)
    ),
    db: Session = Depends(get_db),
) -> list[LeaveTypeResponse]:
    """Retrieve all leave types for the caller's company sorted by name."""
    types = leave_type_service.get_leave_types(db, current_user.company_id)
    return [LeaveTypeResponse.model_validate(t) for t in types]


@router.post(
    "",
    response_model=LeaveTypeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_leave_type(
    data: LeaveTypeCreateRequest,
    current_user: User = Depends(require_roles(UserRole.OWNER)),
    db: Session = Depends(get_db),
) -> LeaveTypeResponse:
    """Create a new leave type for the company (Owner only)."""
    leave_type = leave_type_service.create_leave_type(
        db, current_user.company_id, data
    )
    return LeaveTypeResponse.model_validate(leave_type)


@router.put("/{leave_type_id}", response_model=LeaveTypeResponse)
def update_leave_type(
    leave_type_id: uuid.UUID,
    data: LeaveTypeUpdateRequest,
    current_user: User = Depends(require_roles(UserRole.OWNER)),
    db: Session = Depends(get_db),
) -> LeaveTypeResponse:
    """Update a leave type (Owner only)."""
    leave_type = leave_type_service.update_leave_type(
        db, current_user.company_id, leave_type_id, data
    )
    return LeaveTypeResponse.model_validate(leave_type)


@router.delete("/{leave_type_id}")
def delete_leave_type(
    leave_type_id: uuid.UUID,
    current_user: User = Depends(require_roles(UserRole.OWNER)),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """Delete a leave type if no leave requests are attached (Owner only)."""
    leave_type_service.delete_leave_type(db, current_user.company_id, leave_type_id)
    return {"message": "Leave type deleted successfully"}
