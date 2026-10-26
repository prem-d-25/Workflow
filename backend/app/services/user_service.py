"""User management business logic."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.constants import UserRole
from app.core.security import hash_password
from app.models.company import Company
from app.models.user import User
from app.schemas.user import CreateUserRequest, ProfileResponse, ProfileUpdateRequest


def generate_temporary_password(email: str) -> str:
    """Generate default temporary password using email's local part + '@123'."""
    local_part = email.split("@")[0].lower()
    prefix = local_part[:4] if len(local_part) >= 4 else local_part
    return f"{prefix}@123"


def create_user(
    db: Session,
    current_user: User,
    data: CreateUserRequest,
) -> tuple[User, str]:
    """Create a new HR or Employee user under the current owner's company."""
    existing = db.scalars(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    temp_password = generate_temporary_password(data.email)
    hashed_pw = hash_password(temp_password)

    new_user = User(
        company_id=current_user.company_id,
        email=data.email,
        password_hash=hashed_pw,
        full_name=data.full_name,
        role=data.role,
        is_active=True,
        must_change_password=True,
        created_by=current_user.id,
    )
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    return new_user, temp_password


def list_users(
    db: Session,
    current_user: User,
    role: str | None = None,
    search: str | None = None,
    is_active: bool | None = None,
    page: int = 1,
    page_size: int = 10,
) -> tuple[list[User], int]:
    """List HR and employees from the caller's company with search and pagination."""
    stmt = select(User).where(
        User.company_id == current_user.company_id,
        User.role != UserRole.OWNER.value,
    )

    if role:
        stmt = stmt.where(User.role == role.strip().lower())

    if is_active is not None:
        stmt = stmt.where(User.is_active == is_active)

    if search:
        pattern = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(User.full_name).ilike(pattern),
                func.lower(User.email).ilike(pattern),
            )
        )

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.scalar(count_stmt) or 0

    paged_stmt = (
        stmt.order_by(func.lower(User.full_name).asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = list(db.scalars(paged_stmt).all())
    return items, total


def get_user_by_id(
    db: Session,
    current_user: User,
    user_id: uuid.UUID,
) -> User:
    """Retrieve user details ensuring tenant isolation and HR view restrictions."""
    user = db.scalars(
        select(User).where(
            User.id == user_id,
            User.company_id == current_user.company_id,
        )
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # HR cannot view the owner's profile
    if current_user.role == UserRole.HR.value and user.role == UserRole.OWNER.value:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


def update_user_status(
    db: Session,
    current_user: User,
    user_id: uuid.UUID,
    is_active: bool,
) -> User:
    """Update active status of an employee or HR (Owner only)."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own active status",
        )

    user = db.scalars(
        select(User).where(
            User.id == user_id,
            User.company_id == current_user.company_id,
        )
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.role == UserRole.OWNER.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change status of an owner",
        )

    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user


def get_profile(db: Session, current_user: User) -> ProfileResponse:
    """Retrieve the personal profile of the currently logged-in user."""
    company = db.scalars(
        select(Company).where(Company.id == current_user.company_id)
    ).first()
    company_name = company.name if company else ""

    return ProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        phone=current_user.phone,
        date_of_birth=current_user.date_of_birth,
        address=current_user.address,
        designation=current_user.designation,
        department=current_user.department,
        joined_on=current_user.joined_on,
        company_name=company_name,
    )


def update_profile(
    db: Session,
    current_user: User,
    data: ProfileUpdateRequest,
) -> ProfileResponse:
    """Update profile details of the currently logged-in user."""
    current_user.full_name = data.full_name
    current_user.phone = data.phone
    current_user.date_of_birth = data.date_of_birth
    current_user.address = data.address
    current_user.designation = data.designation
    current_user.department = data.department
    current_user.joined_on = data.joined_on

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return get_profile(db, current_user)
