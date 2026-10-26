"""Leave type business logic."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.leave_request import LeaveRequest
from app.models.leave_type import LeaveType
from app.schemas.leave_type import LeaveTypeCreateRequest, LeaveTypeUpdateRequest


def get_leave_types(db: Session, company_id: uuid.UUID) -> list[LeaveType]:
    """Retrieve all leave types for a company sorted by name."""
    stmt = (
        select(LeaveType)
        .where(LeaveType.company_id == company_id)
        .order_by(func.lower(LeaveType.name).asc())
    )
    return list(db.scalars(stmt).all())


def create_leave_type(
    db: Session,
    company_id: uuid.UUID,
    data: LeaveTypeCreateRequest,
) -> LeaveType:
    """Create a new leave type ensuring name uniqueness within the company."""
    trimmed_name = data.name.strip()
    existing = db.scalars(
        select(LeaveType).where(
            LeaveType.company_id == company_id,
            func.lower(LeaveType.name) == trimmed_name.lower(),
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Leave type '{trimmed_name}' already exists in your company",
        )

    leave_type = LeaveType(
        company_id=company_id,
        name=trimmed_name,
        days_allowed=data.days_allowed,
    )
    db.add(leave_type)
    try:
        db.commit()
        db.refresh(leave_type)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Leave type '{trimmed_name}' already exists in your company",
        )
    return leave_type


def update_leave_type(
    db: Session,
    company_id: uuid.UUID,
    leave_type_id: uuid.UUID,
    data: LeaveTypeUpdateRequest,
) -> LeaveType:
    """Update a leave type's name and allowed days within the caller's company."""
    leave_type = db.scalars(
        select(LeaveType).where(
            LeaveType.id == leave_type_id,
            LeaveType.company_id == company_id,
        )
    ).first()
    if not leave_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave type not found",
        )

    trimmed_name = data.name.strip()
    existing = db.scalars(
        select(LeaveType).where(
            LeaveType.company_id == company_id,
            func.lower(LeaveType.name) == trimmed_name.lower(),
            LeaveType.id != leave_type_id,
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Leave type '{trimmed_name}' already exists in your company",
        )

    leave_type.name = trimmed_name
    leave_type.days_allowed = data.days_allowed
    try:
        db.commit()
        db.refresh(leave_type)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Leave type '{trimmed_name}' already exists in your company",
        )
    return leave_type


def delete_leave_type(
    db: Session,
    company_id: uuid.UUID,
    leave_type_id: uuid.UUID,
) -> None:
    """Delete a leave type if it has no associated leave requests."""
    leave_type = db.scalars(
        select(LeaveType).where(
            LeaveType.id == leave_type_id,
            LeaveType.company_id == company_id,
        )
    ).first()
    if not leave_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave type not found",
        )

    has_requests = db.scalars(
        select(LeaveRequest.id)
        .where(
            LeaveRequest.company_id == company_id,
            LeaveRequest.leave_type_id == leave_type_id,
        )
        .limit(1)
    ).first()
    if has_requests:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete leave type that has associated leave requests",
        )

    db.delete(leave_type)
    db.commit()
