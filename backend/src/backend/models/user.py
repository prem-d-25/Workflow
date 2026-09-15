from typing import TYPE_CHECKING, Optional, List
from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.db.base import Base, TimestampMixin
from backend.models.enums import UserRole

if TYPE_CHECKING:
    from backend.models.company import Company
    from backend.models.leave import LeaveRequest
    from backend.models.announcement import Announcement


class User(Base, TimestampMixin):
    """
    User entity supporting multi-tenant access, RBAC, soft deletion, and mandatory password reset.
    """
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", native_enum=False),
        nullable=False,
        default=UserRole.EMPLOYEE,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    force_password_reset: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="users", lazy="selectin")
    leave_requests: Mapped[List["LeaveRequest"]] = relationship(
        "LeaveRequest",
        foreign_keys="[LeaveRequest.user_id]",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    reviewed_leaves: Mapped[List["LeaveRequest"]] = relationship(
        "LeaveRequest",
        foreign_keys="[LeaveRequest.reviewed_by]",
        back_populates="reviewer",
        lazy="selectin",
    )
    announcements: Mapped[List["Announcement"]] = relationship(
        "Announcement",
        foreign_keys="[Announcement.author_id]",
        back_populates="author",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}', company_id={self.company_id})>"
