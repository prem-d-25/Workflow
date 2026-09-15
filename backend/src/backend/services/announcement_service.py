from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models import Announcement, User, UserRole
from backend.schemas.announcement import (
    AnnouncementCreateRequest,
    AnnouncementResponse,
    AnnouncementUpdateRequest,
)


class AnnouncementService:
    """
    Handles broadcasting and lifecycle of company announcements:
    - Creation, editing, and deletion by Owner and HR
    - Chronological viewing by all employees with tenant boundary isolation
    """

    @staticmethod
    async def create_announcement(
        db: AsyncSession,
        current_user: User,
        data: AnnouncementCreateRequest,
    ) -> AnnouncementResponse:
        # RBAC: Employees cannot publish announcements
        if current_user.role == UserRole.EMPLOYEE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employees are not authorized to broadcast announcements.",
            )

        announcement = Announcement(
            company_id=current_user.company_id,
            author_id=current_user.id,
            title=data.title.strip(),
            content=data.content.strip(),
        )
        db.add(announcement)
        await db.commit()
        await db.refresh(announcement)

        return AnnouncementResponse(
            id=announcement.id,
            company_id=announcement.company_id,
            author_id=announcement.author_id,
            title=announcement.title,
            content=announcement.content,
            created_at=announcement.created_at,
            author_email=current_user.email,
            author_role=current_user.role,
        )

    @staticmethod
    async def list_announcements(
        db: AsyncSession,
        current_user: User,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[AnnouncementResponse]:
        # Tenant isolation: strictly scoped to current_user.company_id
        query = (
            select(Announcement)
            .where(Announcement.company_id == current_user.company_id)
            .order_by(Announcement.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Announcement.title.ilike(search_pattern),
                    Announcement.content.ilike(search_pattern),
                )
            )

        result = await db.execute(query)
        announcements = result.scalars().all()

        return [
            AnnouncementResponse(
                id=a.id,
                company_id=a.company_id,
                author_id=a.author_id,
                title=a.title,
                content=a.content,
                created_at=a.created_at,
                author_email=a.author.email if a.author else None,
                author_role=a.author.role if a.author else None,
            )
            for a in announcements
        ]

    @staticmethod
    async def get_announcement_by_id(
        db: AsyncSession,
        current_user: User,
        announcement_id: int,
    ) -> AnnouncementResponse:
        query = select(Announcement).where(
            Announcement.id == announcement_id,
            Announcement.company_id == current_user.company_id,
        )
        result = await db.execute(query)
        a = result.scalar_one_or_none()

        if not a:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        return AnnouncementResponse(
            id=a.id,
            company_id=a.company_id,
            author_id=a.author_id,
            title=a.title,
            content=a.content,
            created_at=a.created_at,
            author_email=a.author.email if a.author else None,
            author_role=a.author.role if a.author else None,
        )

    @staticmethod
    async def update_announcement(
        db: AsyncSession,
        current_user: User,
        announcement_id: int,
        data: AnnouncementUpdateRequest,
    ) -> AnnouncementResponse:
        if current_user.role == UserRole.EMPLOYEE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employees cannot edit announcements.",
            )

        query = select(Announcement).where(
            Announcement.id == announcement_id,
            Announcement.company_id == current_user.company_id,
        )
        result = await db.execute(query)
        a = result.scalar_one_or_none()

        if not a:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        if data.title is not None:
            a.title = data.title.strip()
        if data.content is not None:
            a.content = data.content.strip()

        await db.commit()
        await db.refresh(a)

        return AnnouncementResponse(
            id=a.id,
            company_id=a.company_id,
            author_id=a.author_id,
            title=a.title,
            content=a.content,
            created_at=a.created_at,
            author_email=a.author.email if a.author else None,
            author_role=a.author.role if a.author else None,
        )

    @staticmethod
    async def delete_announcement(
        db: AsyncSession,
        current_user: User,
        announcement_id: int,
    ) -> None:
        if current_user.role == UserRole.EMPLOYEE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employees cannot delete announcements.",
            )

        query = select(Announcement).where(
            Announcement.id == announcement_id,
            Announcement.company_id == current_user.company_id,
        )
        result = await db.execute(query)
        a = result.scalar_one_or_none()

        if not a:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        await db.delete(a)
        await db.commit()
