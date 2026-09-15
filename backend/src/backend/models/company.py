
from typing import TYPE_CHECKING, Optional, List
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.models.user import User
    from backend.models.leave import LeaveQuota, LeaveRequest
    from backend.models.announcement import Announcement
    from backend.models.policy import CompanyPolicy


class Company(Base, TimestampMixin):
    """
    Company tenant entity. Serves as the tenant boundary for users, policies, and requests.
    """
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)

    # Relationships (lazy="selectin" enables safe async loading without MissingGreenlet)
    users: Mapped[List["User"]] = relationship(
        "User",
        back_populates="company",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    leave_quotas: Mapped[List["LeaveQuota"]] = relationship(
        "LeaveQuota",
        back_populates="company",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    leave_requests: Mapped[List["LeaveRequest"]] = relationship(
        "LeaveRequest",
        back_populates="company",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    announcements: Mapped[List["Announcement"]] = relationship(
        "Announcement",
        back_populates="company",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    policies: Mapped[List["CompanyPolicy"]] = relationship(
        "CompanyPolicy",
        back_populates="company",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Company(id={self.id}, name='{self.name}')>"
