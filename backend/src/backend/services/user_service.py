from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.security import generate_default_password, get_password_hash
from backend.models import User, UserRole
from backend.schemas.user import (
    UserCreateRequest,
    UserCreateResponse,
    UserResponse,
    UserStatusToggleRequest,
)


class UserService:
    """
    Handles user management business logic: RBAC provisioning,
    soft deletion, and tenant-scoped user querying.
    """

    @staticmethod
    async def create_user(
        db: AsyncSession,
        current_user: User,
        data: UserCreateRequest,
    ) -> UserCreateResponse:
        # 1. RBAC permissions check
        if current_user.role == UserRole.EMPLOYEE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employees are not authorized to create new accounts.",
            )

        if current_user.role == UserRole.HR:
            if data.role != UserRole.EMPLOYEE:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="HR can only provision Employee accounts (cannot create HR or Owner).",
                )

        if data.role == UserRole.OWNER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot create additional Owner accounts.",
            )

        # 2. Check if email already exists
        email_clean = data.email.lower().strip()
        existing_check = await db.execute(select(User).where(User.email == email_clean))
        if existing_check.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A user with email '{email_clean}' is already registered.",
            )

        # 3. Generate auto-generated password (first 3 letters + 1234)
        temp_password = generate_default_password(email_clean)
        hashed_password = get_password_hash(temp_password)

        # 4. Create new user with mandatory first-login password change
        new_user = User(
            company_id=current_user.company_id,
            email=email_clean,
            password_hash=hashed_password,
            role=data.role,
            is_active=True,
            force_password_reset=True,
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        return UserCreateResponse(
            user=UserResponse.model_validate(new_user),
            temporary_password=temp_password,
        )

    @staticmethod
    async def toggle_user_status(
        db: AsyncSession,
        current_user: User,
        target_user_id: int,
        data: UserStatusToggleRequest,
    ) -> UserResponse:
        # Cannot modify own status
        if current_user.id == target_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate or modify your own account status.",
            )

        # Retrieve target user within same company tenant
        query = select(User).where(
            User.id == target_user_id,
            User.company_id == current_user.company_id,
        )
        result = await db.execute(query)
        target_user = result.scalar_one_or_none()

        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in your company.",
            )

        # RBAC Check:
        if current_user.role == UserRole.EMPLOYEE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employees are not authorized to modify user accounts.",
            )

        if current_user.role == UserRole.HR:
            if target_user.role != UserRole.EMPLOYEE:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="HR is only authorized to modify status of Employee accounts.",
                )

        # Apply status change (soft delete toggle)
        target_user.is_active = data.is_active
        await db.commit()
        await db.refresh(target_user)

        return UserResponse.model_validate(target_user)

    @staticmethod
    async def get_user_by_id(
        db: AsyncSession,
        current_user: User,
        user_id: int,
    ) -> UserResponse:
        query = select(User).where(
            User.id == user_id,
            User.company_id == current_user.company_id,
        )
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in your company.",
            )
        return UserResponse.model_validate(user)

    @staticmethod
    async def list_company_users(
        db: AsyncSession,
        current_user: User,
        role: Optional[UserRole] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[UserResponse]:
        query = select(User).where(User.company_id == current_user.company_id)

        if role is not None:
            query = query.where(User.role == role)
        if is_active is not None:
            query = query.where(User.is_active == is_active)
        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.where(User.email.ilike(search_pattern))

        query = query.order_by(User.id.asc()).offset(skip).limit(limit)
        result = await db.execute(query)
        users = result.scalars().all()

        return [UserResponse.model_validate(u) for u in users]
