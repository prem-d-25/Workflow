"""Company HTTP endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.constants import UserRole
from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import User
from app.schemas.company import CompanyResponse, CompanyUpdateRequest
from app.services import company_service

router = APIRouter(prefix="/company", tags=["company"])


@router.get("", response_model=CompanyResponse)
def get_company(
    current_user: User = Depends(
        require_roles(UserRole.OWNER, UserRole.HR, UserRole.EMPLOYEE)
    ),
    db: Session = Depends(get_db),
) -> CompanyResponse:
    """Retrieve details for the current user's company."""
    company = company_service.get_company(db, current_user.company_id)
    return CompanyResponse.model_validate(company)


@router.put("", response_model=CompanyResponse)
def update_company(
    data: CompanyUpdateRequest,
    current_user: User = Depends(require_roles(UserRole.OWNER)),
    db: Session = Depends(get_db),
) -> CompanyResponse:
    """Update details for the company (Owner only)."""
    company = company_service.update_company(db, current_user.company_id, data)
    return CompanyResponse.model_validate(company)
