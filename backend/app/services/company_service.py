"""Company business logic."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.company import Company
from app.schemas.company import CompanyUpdateRequest


def get_company(db: Session, company_id: uuid.UUID) -> Company:
    """Fetch the tenant company by ID or raise 404."""
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )
    return company


def update_company(
    db: Session,
    company_id: uuid.UUID,
    data: CompanyUpdateRequest,
) -> Company:
    """Update tenant company profile information."""
    company = get_company(db, company_id)

    company.name = data.name.strip()
    company.address = data.address.strip() if data.address is not None else None
    company.phone = data.phone.strip() if data.phone is not None else None
    company.website = data.website.strip() if data.website is not None else None
    company.industry = data.industry.strip() if data.industry is not None else None
    company.size = data.size.strip() if data.size is not None else None

    db.commit()
    db.refresh(company)
    return company
