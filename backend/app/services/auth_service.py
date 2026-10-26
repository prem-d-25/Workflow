"""Authentication business logic."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.constants import UserRole
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.company import Company
from app.models.user import User
from app.schemas.auth import RegisterRequest, TokenResponse, UserResponse


def _build_auth_tokens(user: User) -> tuple[TokenResponse, str]:
    """Generate access and refresh tokens for a user and construct the TokenResponse."""
    access_token = create_access_token(
        user_id=user.id,
        company_id=user.company_id,
        role=user.role,
    )
    refresh_token = create_refresh_token(
        user_id=user.id,
        company_id=user.company_id,
        role=user.role,
    )
    user_response = UserResponse.model_validate(user)
    token_response = TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response,
    )
    return token_response, refresh_token


def register_company_owner(
    db: Session,
    data: RegisterRequest,
) -> tuple[TokenResponse, str]:
    """Register a new company and its initial owner in a single atomic transaction."""
    existing_user = db.scalars(select(User).where(User.email == data.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    hashed_pw = hash_password(data.password)

    try:
        company = Company(name=data.company_name)
        db.add(company)
        db.flush()

        owner = User(
            company_id=company.id,
            email=data.email,
            password_hash=hashed_pw,
            full_name=data.full_name,
            role=UserRole.OWNER.value,
            is_active=True,
            must_change_password=False,
        )
        db.add(owner)
        db.commit()
        db.refresh(owner)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )
    except Exception:
        db.rollback()
        raise

    return _build_auth_tokens(owner)


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> tuple[TokenResponse, str]:
    """Authenticate user credentials and return tokens, or raise 401/403."""
    user = db.scalars(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is deactivated",
        )

    return _build_auth_tokens(user)


def refresh_access_token(
    db: Session,
    refresh_token: str,
) -> TokenResponse:
    """Validate a refresh token and issue a new access token for active users."""
    payload = decode_token(refresh_token, expected_type="refresh")
    user_id_raw = payload.get("sub")
    if not user_id_raw:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    try:
        user_uuid = uuid.UUID(user_id_raw)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        )

    user = db.get(User, user_uuid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is deactivated",
        )

    new_access_token = create_access_token(
        user_id=user.id,
        company_id=user.company_id,
        role=user.role,
    )
    return TokenResponse(
        access_token=new_access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


def change_password(
    db: Session,
    user: User,
    current_password: str,
    new_password: str,
) -> None:
    """Verify current password, ensure new password is distinct, and update user password."""
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    if current_password == new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password cannot be the same as the current password",
        )

    user.password_hash = hash_password(new_password)
    user.must_change_password = False
    db.commit()
    db.refresh(user)
