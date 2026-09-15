from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_password_hash,
    verify_password,
)
from backend.models import Company, LeaveQuota, User, UserRole
from backend.schemas.auth import (
    ChangePasswordRequest,
    CompanyRegisterRequest,
    LoginRequest,
    TokenResponse,
)
from backend.schemas.user import UserResponse


class AuthService:
    """
    Handles authentication business logic: company registration, user login,
    token refresh, and first-time/voluntary password resets.
    """

    @staticmethod
    async def register_company_with_owner(
        db: AsyncSession,
        data: CompanyRegisterRequest,
    ) -> TokenResponse:
        # Check if email is already registered
        query = select(User).where(User.email == data.email.lower())
        result = await db.execute(query)
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address is already registered.",
            )

        # 1. Create company tenant
        company = Company(
            name=data.company_name.strip(),
            logo_url=data.logo_url,
        )
        db.add(company)
        await db.flush()

        # 2. Create Owner user (force_password_reset is False since owner chose their password)
        hashed_password = get_password_hash(data.password)
        owner_user = User(
            company_id=company.id,
            email=data.email.lower().strip(),
            password_hash=hashed_password,
            role=UserRole.OWNER,
            is_active=True,
            force_password_reset=False,
        )
        db.add(owner_user)
        await db.flush()

        # 3. Create default company leave quotas
        leave_quota = LeaveQuota(
            company_id=company.id,
            sick_quota=12,
            casual_quota=10,
            paid_quota=15,
        )
        db.add(leave_quota)
        await db.commit()
        await db.refresh(owner_user)

        # Issue tokens
        access_token = create_access_token(
            user_id=owner_user.id,
            role=owner_user.role.value,
            company_id=owner_user.company_id,
        )
        refresh_token = create_refresh_token(user_id=owner_user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            force_password_reset=owner_user.force_password_reset,
            user=UserResponse.model_validate(owner_user),
        )

    @staticmethod
    async def authenticate_user(
        db: AsyncSession,
        data: LoginRequest,
    ) -> TokenResponse:
        query = select(User).where(User.email == data.email.lower().strip())
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Soft delete check: disabled users cannot login
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Your account has been deactivated. Please contact your company administrator.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = create_access_token(
            user_id=user.id,
            role=user.role.value,
            company_id=user.company_id,
        )
        refresh_token = create_refresh_token(user_id=user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            force_password_reset=user.force_password_reset,
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    async def refresh_access_token(
        db: AsyncSession,
        refresh_token_str: str,
    ) -> TokenResponse:
        try:
            payload = decode_refresh_token(refresh_token_str)
            user_id = int(payload["sub"])
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        query = select(User).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive or not found.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        new_access_token = create_access_token(
            user_id=user.id,
            role=user.role.value,
            company_id=user.company_id,
        )
        new_refresh_token = create_refresh_token(user_id=user.id)

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            force_password_reset=user.force_password_reset,
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    async def change_user_password(
        db: AsyncSession,
        user: User,
        data: ChangePasswordRequest,
    ) -> None:
        if not verify_password(data.current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect.",
            )

        user.password_hash = get_password_hash(data.new_password)
        # Clear the first login requirement flag
        user.force_password_reset = False
        await db.commit()
