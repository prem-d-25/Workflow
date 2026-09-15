from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.dependencies import get_current_user, require_roles
from backend.db.session import get_db
from backend.models import LeaveStatus, User, UserRole
from backend.schemas.leave import (
    LeaveApplyRequest,
    LeaveBalanceResponse,
    LeaveQuotaResponse,
    LeaveQuotaUpdateRequest,
    LeaveResponse,
    LeaveReviewRequest,
)
from backend.services.leave_service import LeaveService

router = APIRouter(prefix="/leaves", tags=["Leave Management & Approvals"])


@router.get(
    "/quotas",
    response_model=LeaveQuotaResponse,
    summary="Get company leave quotas",
)
async def get_quotas(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeaveQuotaResponse:
    """
    Returns the company's annual leave quota allocations (Sick, Casual, Paid).
    """
    return await LeaveService.get_company_quotas(db, current_user.company_id)


@router.put(
    "/quotas",
    response_model=LeaveQuotaResponse,
    summary="Update company leave quotas (Owner only)",
)
async def update_quotas(
    data: LeaveQuotaUpdateRequest,
    current_user: User = Depends(require_roles(UserRole.OWNER)),
    db: AsyncSession = Depends(get_db),
) -> LeaveQuotaResponse:
    """
    Configures company-wide leave quotas (Sick, Casual, Paid).
    **Restricted strictly to the company Owner.**
    """
    return await LeaveService.update_company_quotas(db, current_user, data)


@router.get(
    "/balance",
    response_model=LeaveBalanceResponse,
    summary="Get current user's leave balance & extra days",
)
async def get_balance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeaveBalanceResponse:
    """
    Calculates the current user's remaining leave balances and approved extra/unpaid days.
    """
    return await LeaveService.calculate_user_balance(db, current_user.company_id, current_user.id)


@router.post(
    "",
    response_model=LeaveResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new leave application",
)
async def apply_leave(
    data: LeaveApplyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeaveResponse:
    """
    Submits a leave request for review.
    - **Planned Leave Enforcement**: Requests with `leave_type == 'PLANNED'` require at least 5 days advance notice.
    - **Immediate & Emergency Leaves**: Sick, Casual, or Unpaid leaves can be submitted immediately.
    - **Non-blocking Over-Quota Policy**: Even if an employee's quotas are depleted, they can still submit emergency/unpaid leaves without system rejection.
    """
    return await LeaveService.apply_for_leave(db, current_user, data)


@router.get(
    "/my",
    response_model=List[LeaveResponse],
    summary="List current user's leave request history",
)
async def get_my_leaves(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Limit for pagination"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[LeaveResponse]:
    """
    Retrieves the calling user's complete leave request history.
    """
    return await LeaveService.list_my_leaves(db, current_user, skip=skip, limit=limit)


@router.get(
    "",
    response_model=List[LeaveResponse],
    summary="List leave requests for review queue (Owner & HR)",
)
async def list_leaves_for_review(
    status: Optional[LeaveStatus] = Query(None, description="Filter by status (PENDING, APPROVED, REJECTED)"),
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Limit for pagination"),
    current_user: User = Depends(require_roles(UserRole.OWNER, UserRole.HR)),
    db: AsyncSession = Depends(get_db),
) -> List[LeaveResponse]:
    """
    Approval queue for managers:
    - **Owner**: Sees all leave requests in the company (HR and Employees).
    - **HR**: Sees leave requests from Employees only.
    """
    return await LeaveService.list_leaves_for_review(db, current_user, status_filter=status, skip=skip, limit=limit)


@router.patch(
    "/{leave_id}/review",
    response_model=LeaveResponse,
    summary="Approve or reject a leave request",
)
async def review_leave(
    leave_id: int,
    data: LeaveReviewRequest,
    current_user: User = Depends(require_roles(UserRole.OWNER, UserRole.HR)),
    db: AsyncSession = Depends(get_db),
) -> LeaveResponse:
    """
    Reviews a leave request with multi-tier hierarchical approvals:
    - **Owner**: Can approve/reject both HR and Employee leaves.
    - **HR**: Can approve/reject Employee leaves only (HR leave requests MUST be approved by the Owner).
    - Users cannot approve their own leave applications.
    """
    return await LeaveService.review_leave_request(db, current_user, leave_id, data)
