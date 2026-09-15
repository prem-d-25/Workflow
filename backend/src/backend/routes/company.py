from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.dependencies import get_current_user, require_roles
from backend.db.session import get_db
from backend.models import User, UserRole
from backend.schemas.company import CompanyUpdateRequest, CompanyWithQuotasResponse
from backend.services.company_service import CompanyService

router = APIRouter(prefix="/company", tags=["Company & Tenant Settings"])


@router.get(
    "",
    response_model=CompanyWithQuotasResponse,
    summary="Get current company profile and leave quotas",
)
async def get_company(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CompanyWithQuotasResponse:
    """
    Retrieves company details along with the configured leave quotas.
    Accessible to all active company members (Owner, HR, Employee).
    """
    return await CompanyService.get_company_profile(db, current_user.company_id)


@router.patch(
    "",
    response_model=CompanyWithQuotasResponse,
    summary="Update company details and leave quotas (Owner only)",
)
async def update_company(
    data: CompanyUpdateRequest,
    current_user: User = Depends(require_roles(UserRole.OWNER)),
    db: AsyncSession = Depends(get_db),
) -> CompanyWithQuotasResponse:
    """
    Updates the company profile (name, logo_url) and custom leave quota limits (sick, casual, paid).
    **Restricted strictly to the company Owner.**
    """
    return await CompanyService.update_company_profile(db, current_user, data)
