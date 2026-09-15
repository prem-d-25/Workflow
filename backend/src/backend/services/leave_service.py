from datetime import date, datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models import LeaveQuota, LeaveRequest, LeaveStatus, LeaveType, User, UserRole
from backend.schemas.leave import (
    LeaveApplyRequest,
    LeaveBalanceResponse,
    LeaveQuotaResponse,
    LeaveQuotaUpdateRequest,
    LeaveResponse,
    LeaveReviewRequest,
    LeaveTypeBalance,
)


class LeaveService:
    """
    Handles complete Leave Management workflow:
    - Custom quotas and company balance calculations
    - 5-day advance planned leave rule enforcement
    - Non-blocking emergency / over-quota leave submissions
    - Hierarchical multi-tier approvals (Owner reviews all; HR reviews employees only)
    """

    @staticmethod
    async def get_company_quotas(
        db: AsyncSession,
        company_id: int,
    ) -> LeaveQuotaResponse:
        query = select(LeaveQuota).where(LeaveQuota.company_id == company_id)
        result = await db.execute(query)
        quota = result.scalar_one_or_none()

        if not quota:
            # Create default if missing
            quota = LeaveQuota(
                company_id=company_id,
                sick_quota=12,
                casual_quota=10,
                paid_quota=15,
            )
            db.add(quota)
            await db.commit()
            await db.refresh(quota)

        return LeaveQuotaResponse.model_validate(quota)

    @staticmethod
    async def update_company_quotas(
        db: AsyncSession,
        current_user: User,
        data: LeaveQuotaUpdateRequest,
    ) -> LeaveQuotaResponse:
        if current_user.role != UserRole.OWNER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the company Owner can update leave quota limits.",
            )

        query = select(LeaveQuota).where(LeaveQuota.company_id == current_user.company_id)
        result = await db.execute(query)
        quota = result.scalar_one_or_none()

        if quota:
            quota.sick_quota = data.sick_quota
            quota.casual_quota = data.casual_quota
            quota.paid_quota = data.paid_quota
        else:
            quota = LeaveQuota(
                company_id=current_user.company_id,
                sick_quota=data.sick_quota,
                casual_quota=data.casual_quota,
                paid_quota=data.paid_quota,
            )
            db.add(quota)

        await db.commit()
        await db.refresh(quota)
        return LeaveQuotaResponse.model_validate(quota)

    @staticmethod
    async def calculate_user_balance(
        db: AsyncSession,
        company_id: int,
        user_id: int,
    ) -> LeaveBalanceResponse:
        # 1. Fetch quota allocations
        quota_query = select(LeaveQuota).where(LeaveQuota.company_id == company_id)
        quota_result = await db.execute(quota_query)
        quota = quota_result.scalar_one_or_none()
        sick_limit = quota.sick_quota if quota else 12
        casual_limit = quota.casual_quota if quota else 10
        paid_limit = quota.paid_quota if quota else 15

        # 2. Aggregate approved leave days taken by this user
        leaves_query = (
            select(LeaveRequest.leave_type, func.sum(LeaveRequest.total_days))
            .where(
                LeaveRequest.company_id == company_id,
                LeaveRequest.user_id == user_id,
                LeaveRequest.status == LeaveStatus.APPROVED,
            )
            .group_by(LeaveRequest.leave_type)
        )
        leaves_result = await db.execute(leaves_query)
        used_by_type = {row[0]: int(row[1]) for row in leaves_result.all()}

        used_sick = used_by_type.get(LeaveType.SICK, 0)
        used_casual = used_by_type.get(LeaveType.CASUAL, 0)
        used_planned = used_by_type.get(LeaveType.PLANNED, 0)
        used_unpaid = used_by_type.get(LeaveType.UNPAID, 0)

        # 3. Compute remaining balances and extra/unpaid overflows
        rem_sick = max(0, sick_limit - used_sick)
        rem_casual = max(0, casual_limit - used_casual)
        rem_paid = max(0, paid_limit - used_planned)

        overflow_sick = max(0, used_sick - sick_limit)
        overflow_casual = max(0, used_casual - casual_limit)
        overflow_paid = max(0, used_planned - paid_limit)

        extra_unpaid_days = used_unpaid + overflow_sick + overflow_casual + overflow_paid

        return LeaveBalanceResponse(
            sick=LeaveTypeBalance(quota=sick_limit, used=used_sick, remaining=rem_sick),
            casual=LeaveTypeBalance(quota=casual_limit, used=used_casual, remaining=rem_casual),
            paid=LeaveTypeBalance(quota=paid_limit, used=used_planned, remaining=rem_paid),
            extra_unpaid_days=extra_unpaid_days,
        )

    @staticmethod
    async def apply_for_leave(
        db: AsyncSession,
        current_user: User,
        data: LeaveApplyRequest,
    ) -> LeaveResponse:
        # Date order validation
        if data.end_date < data.start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Leave end date cannot be earlier than start date.",
            )

        total_days = (data.end_date - data.start_date).days + 1

        # Business Rule: Planned Leave 5-Day Advance Notice Enforcement
        today = date.today()
        if data.leave_type == LeaveType.PLANNED:
            days_in_advance = (data.start_date - today).days
            if days_in_advance < 5:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Planned leave requires at least 5 days advance notice. "
                        f"Requested start date ({data.start_date}) is only {days_in_advance} "
                        f"day(s) away from today ({today}). For urgent leaves, please select Sick, Casual, or Unpaid."
                    ),
                )

        # Note: Non-blocking over-quota rule:
        # Even if quotas are exhausted or for emergency/accident, leave is accepted with status PENDING.
        leave_request = LeaveRequest(
            company_id=current_user.company_id,
            user_id=current_user.id,
            leave_type=data.leave_type,
            start_date=data.start_date,
            end_date=data.end_date,
            total_days=total_days,
            reason=data.reason.strip(),
            status=LeaveStatus.PENDING,
        )
        db.add(leave_request)
        await db.commit()
        await db.refresh(leave_request)

        return LeaveResponse(
            id=leave_request.id,
            company_id=leave_request.company_id,
            user_id=leave_request.user_id,
            leave_type=leave_request.leave_type,
            start_date=leave_request.start_date,
            end_date=leave_request.end_date,
            total_days=leave_request.total_days,
            reason=leave_request.reason,
            status=leave_request.status,
            reviewed_by=leave_request.reviewed_by,
            reviewed_at=leave_request.reviewed_at,
            created_at=leave_request.created_at,
            user_email=current_user.email,
        )

    @staticmethod
    async def review_leave_request(
        db: AsyncSession,
        current_user: User,
        leave_id: int,
        data: LeaveReviewRequest,
    ) -> LeaveResponse:
        # Fetch leave request within current user's company
        query = select(LeaveRequest).where(
            LeaveRequest.id == leave_id,
            LeaveRequest.company_id == current_user.company_id,
        )
        result = await db.execute(query)
        leave = result.scalar_one_or_none()

        if not leave:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Leave request not found.",
            )

        applicant = leave.user
        if not applicant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant user not found.",
            )

        # Hierarchical Approvals RBAC Enforcement:
        # 1. Employees cannot approve any leave request
        if current_user.role == UserRole.EMPLOYEE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employees are not authorized to review leave applications.",
            )

        # 2. Cannot approve own leave request
        if current_user.id == applicant.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot review or approve your own leave request.",
            )

        # 3. HR can ONLY approve Employee requests (HR requests must be approved by Owner)
        if current_user.role == UserRole.HR:
            if applicant.role != UserRole.EMPLOYEE:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="HR can only review Employee leave requests. HR leaves must be approved by the Owner.",
                )

        # Apply approval / rejection
        leave.status = data.status
        leave.reviewed_by = current_user.id
        leave.reviewed_at = datetime.now(timezone.utc)

        await db.commit()
        await db.refresh(leave)

        return LeaveResponse(
            id=leave.id,
            company_id=leave.company_id,
            user_id=leave.user_id,
            leave_type=leave.leave_type,
            start_date=leave.start_date,
            end_date=leave.end_date,
            total_days=leave.total_days,
            reason=leave.reason,
            status=leave.status,
            reviewed_by=leave.reviewed_by,
            reviewed_at=leave.reviewed_at,
            created_at=leave.created_at,
            user_email=applicant.email,
            reviewer_email=current_user.email,
        )

    @staticmethod
    async def list_leaves_for_review(
        db: AsyncSession,
        current_user: User,
        status_filter: Optional[LeaveStatus] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[LeaveResponse]:
        if current_user.role == UserRole.EMPLOYEE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employees do not have access to the approval queue.",
            )

        query = select(LeaveRequest).where(LeaveRequest.company_id == current_user.company_id)

        # HR can only see leave requests from Employees
        if current_user.role == UserRole.HR:
            query = query.join(LeaveRequest.user).where(User.role == UserRole.EMPLOYEE)

        if status_filter:
            query = query.where(LeaveRequest.status == status_filter)

        query = query.order_by(LeaveRequest.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        leaves = result.scalars().all()

        responses = []
        for l in leaves:
            responses.append(
                LeaveResponse(
                    id=l.id,
                    company_id=l.company_id,
                    user_id=l.user_id,
                    leave_type=l.leave_type,
                    start_date=l.start_date,
                    end_date=l.end_date,
                    total_days=l.total_days,
                    reason=l.reason,
                    status=l.status,
                    reviewed_by=l.reviewed_by,
                    reviewed_at=l.reviewed_at,
                    created_at=l.created_at,
                    user_email=l.user.email if l.user else None,
                    reviewer_email=l.reviewer.email if l.reviewer else None,
                )
            )
        return responses

    @staticmethod
    async def list_my_leaves(
        db: AsyncSession,
        current_user: User,
        skip: int = 0,
        limit: int = 50,
    ) -> List[LeaveResponse]:
        query = (
            select(LeaveRequest)
            .where(
                LeaveRequest.company_id == current_user.company_id,
                LeaveRequest.user_id == current_user.id,
            )
            .order_by(LeaveRequest.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        leaves = result.scalars().all()

        return [
            LeaveResponse(
                id=l.id,
                company_id=l.company_id,
                user_id=l.user_id,
                leave_type=l.leave_type,
                start_date=l.start_date,
                end_date=l.end_date,
                total_days=l.total_days,
                reason=l.reason,
                status=l.status,
                reviewed_by=l.reviewed_by,
                reviewed_at=l.reviewed_at,
                created_at=l.created_at,
                user_email=current_user.email,
                reviewer_email=l.reviewer.email if l.reviewer else None,
            )
            for l in leaves
        ]
