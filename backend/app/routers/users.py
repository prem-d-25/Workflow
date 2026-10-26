"""Users HTTP router."""

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.constants import UserRole
from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import User
from app.schemas.user import (
    CreateUserRequest,
    CreateUserResponse,
    UserDetailResponse,
    UserItemResponse,
    UserListResponse,
    UserStatusUpdateRequest,
)
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=CreateUserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: CreateUserRequest,
    current_user: User = Depends(require_roles(UserRole.OWNER)),
    db: Session = Depends(get_db),
) -> CreateUserResponse:
    """Create a new HR or Employee user under the company (Owner only)."""
    user, temp_password = user_service.create_user(db, current_user, data)
    user_dict = UserDetailResponse.model_validate(user).model_dump()
    return CreateUserResponse(**user_dict, temporary_password=temp_password)


@router.get("", response_model=UserListResponse)
def list_users(
    role: str | None = Query(default=None, description="Filter by role ('hr' or 'employee')"),
    search: str | None = Query(default=None, description="Search by name or email"),
    is_active: bool | None = Query(default=None, description="Filter by active status"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=10, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(require_roles(UserRole.OWNER, UserRole.HR)),
    db: Session = Depends(get_db),
) -> UserListResponse:
    """List HR and employee users in the caller's company (Owner and HR)."""
    items, total = user_service.list_users(
        db,
        current_user,
        role=role,
        search=search,
        is_active=is_active,
        page=page,
        page_size=page_size,
    )
    return UserListResponse(
        items=[UserItemResponse.model_validate(u) for u in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{user_id}", response_model=UserDetailResponse)
def get_user(
    user_id: uuid.UUID,
    current_user: User = Depends(require_roles(UserRole.OWNER, UserRole.HR)),
    db: Session = Depends(get_db),
) -> UserDetailResponse:
    """Retrieve detailed profile information for a user (Owner and HR)."""
    user = user_service.get_user_by_id(db, current_user, user_id)
    return UserDetailResponse.model_validate(user)


@router.patch("/{user_id}/status", response_model=UserDetailResponse)
def update_user_status(
    user_id: uuid.UUID,
    data: UserStatusUpdateRequest,
    current_user: User = Depends(require_roles(UserRole.OWNER)),
    db: Session = Depends(get_db),
) -> UserDetailResponse:
    """Activate or deactivate a user account (Owner only)."""
    user = user_service.update_user_status(
        db, current_user, user_id, data.is_active
    )
    return UserDetailResponse.model_validate(user)
