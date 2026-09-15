from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.dependencies import get_current_user, require_roles
from backend.db.session import get_db
from backend.models import User, UserRole
from backend.schemas.user import (
    UserCreateRequest,
    UserCreateResponse,
    UserResponse,
    UserStatusToggleRequest,
)
from backend.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users & Team Management"])


@router.post(
    "",
    response_model=UserCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Provision a new employee or HR account",
)
async def create_user(
    data: UserCreateRequest,
    current_user: User = Depends(require_roles(UserRole.OWNER, UserRole.HR)),
    db: AsyncSession = Depends(get_db),
) -> UserCreateResponse:
    """
    Provisions a new corporate account with an auto-generated password (`email[:3] + 1234`).
    - **OWNER**: Can provision both `HR` and `EMPLOYEE` roles.
    - **HR**: Can provision `EMPLOYEE` role only.
    - Returns user profile along with `temporary_password`.
    """
    return await UserService.create_user(db, current_user, data)


@router.get(
    "",
    response_model=List[UserResponse],
    summary="List all users within the current company",
)
async def list_users(
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by email substring"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(50, ge=1, le=100, description="Pagination limit"),
    current_user: User = Depends(require_roles(UserRole.OWNER, UserRole.HR)),
    db: AsyncSession = Depends(get_db),
) -> List[UserResponse]:
    """
    Retrieves users belonging strictly to the caller's company tenant.
    """
    return await UserService.list_company_users(
        db=db,
        current_user=current_user,
        role=role,
        is_active=is_active,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get user details by ID",
)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Retrieves user profile for an individual in the same company tenant.
    """
    return await UserService.get_user_by_id(db, current_user, user_id)


@router.patch(
    "/{user_id}/status",
    response_model=UserResponse,
    summary="Toggle user active status (soft delete)",
)
async def toggle_status(
    user_id: int,
    data: UserStatusToggleRequest,
    current_user: User = Depends(require_roles(UserRole.OWNER, UserRole.HR)),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Toggles an account between active and disabled (soft delete).
    - **OWNER**: Can toggle any employee or HR in the company.
    - **HR**: Can only toggle `EMPLOYEE` accounts.
    - Users cannot deactivate their own account.
    """
    return await UserService.toggle_user_status(db, current_user, user_id, data)
