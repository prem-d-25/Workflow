from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models import Company, LeaveQuota, User, UserRole
from backend.schemas.company import CompanyUpdateRequest, CompanyWithQuotasResponse
from backend.schemas.leave import LeaveQuotaResponse


class CompanyService:
    """
    Handles company tenant operations: viewing profile & editing company details
    and leave quotas (restricted strictly to OWNER).
    """

    @staticmethod
    async def get_company_profile(
        db: AsyncSession,
        company_id: int,
    ) -> CompanyWithQuotasResponse:
        company_query = select(Company).where(Company.id == company_id)
        result = await db.execute(company_query)
        company = result.scalar_one_or_none()

        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found.",
            )

        quota_query = select(LeaveQuota).where(LeaveQuota.company_id == company_id)
        quota_result = await db.execute(quota_query)
        quota = quota_result.scalar_one_or_none()

        return CompanyWithQuotasResponse(
            id=company.id,
            name=company.name,
            logo_url=company.logo_url,
            created_at=company.created_at,
            quotas=LeaveQuotaResponse.model_validate(quota) if quota else None,
        )

    @staticmethod
    async def update_company_profile(
        db: AsyncSession,
        current_user: User,
        data: CompanyUpdateRequest,
    ) -> CompanyWithQuotasResponse:
        # Only the company OWNER is permitted to edit company details and leave quotas
        if current_user.role != UserRole.OWNER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the company Owner can update company details and leave quota settings.",
            )

        company_query = select(Company).where(Company.id == current_user.company_id)
        result = await db.execute(company_query)
        company = result.scalar_one_or_none()

        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found.",
            )

        # Update basic details
        if data.name is not None:
            company.name = data.name.strip()
        if data.logo_url is not None:
            company.logo_url = data.logo_url.strip() if data.logo_url else None

        # Update leave quotas if specified
        quota_query = select(LeaveQuota).where(LeaveQuota.company_id == current_user.company_id)
        quota_result = await db.execute(quota_query)
        quota = quota_result.scalar_one_or_none()

        if data.quotas is not None:
            if quota:
                quota.sick_quota = data.quotas.sick_quota
                quota.casual_quota = data.quotas.casual_quota
                quota.paid_quota = data.quotas.paid_quota
            else:
                quota = LeaveQuota(
                    company_id=current_user.company_id,
                    sick_quota=data.quotas.sick_quota,
                    casual_quota=data.quotas.casual_quota,
                    paid_quota=data.quotas.paid_quota,
                )
                db.add(quota)

        await db.commit()
        await db.refresh(company)
        if quota:
            await db.refresh(quota)

        return CompanyWithQuotasResponse(
            id=company.id,
            name=company.name,
            logo_url=company.logo_url,
            created_at=company.created_at,
            quotas=LeaveQuotaResponse.model_validate(quota) if quota else None,
        )
