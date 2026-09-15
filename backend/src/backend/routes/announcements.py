from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.dependencies import get_current_user, require_roles
from backend.db.session import get_db
from backend.models import User, UserRole
from backend.schemas.announcement import (
    AnnouncementCreateRequest,
    AnnouncementResponse,
    AnnouncementUpdateRequest,
)
from backend.services.announcement_service import AnnouncementService

router = APIRouter(prefix="/announcements", tags=["Company Announcements"])


@router.post(
    "",
    response_model=AnnouncementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Publish a new announcement (Owner & HR only)",
)
async def create_announcement(
    data: AnnouncementCreateRequest,
    current_user: User = Depends(require_roles(UserRole.OWNER, UserRole.HR)),
    db: AsyncSession = Depends(get_db),
) -> AnnouncementResponse:
    """
    Broadcasts a new announcement to all company employees.
    **Restricted to OWNER and HR roles.**
    """
    return await AnnouncementService.create_announcement(db, current_user, data)


@router.get(
    "",
    response_model=List[AnnouncementResponse],
    summary="List all company announcements in chronological order",
)
async def list_announcements(
    search: Optional[str] = Query(None, description="Search keyword in title or content"),
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Limit for pagination"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[AnnouncementResponse]:
    """
    Retrieves the chronological feed of announcements for the caller's company.
    **Accessible to all active company members (Owner, HR, Employee).**
    """
    return await AnnouncementService.list_announcements(
        db=db,
        current_user=current_user,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{announcement_id}",
    response_model=AnnouncementResponse,
    summary="Get announcement details by ID",
)
async def get_announcement(
    announcement_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AnnouncementResponse:
    """
    Retrieves a specific announcement by its ID.
    """
    return await AnnouncementService.get_announcement_by_id(db, current_user, announcement_id)


@router.patch(
    "/{announcement_id}",
    response_model=AnnouncementResponse,
    summary="Update an announcement (Owner & HR only)",
)
async def update_announcement(
    announcement_id: int,
    data: AnnouncementUpdateRequest,
    current_user: User = Depends(require_roles(UserRole.OWNER, UserRole.HR)),
    db: AsyncSession = Depends(get_db),
) -> AnnouncementResponse:
    """
    Updates the headline or content of an announcement.
    **Restricted to OWNER and HR roles.**
    """
    return await AnnouncementService.update_announcement(db, current_user, announcement_id, data)


@router.delete(
    "/{announcement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an announcement (Owner & HR only)",
)
async def delete_announcement(
    announcement_id: int,
    current_user: User = Depends(require_roles(UserRole.OWNER, UserRole.HR)),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Removes an announcement from the company feed.
    **Restricted to OWNER and HR roles.**
    """
    await AnnouncementService.delete_announcement(db, current_user, announcement_id)
