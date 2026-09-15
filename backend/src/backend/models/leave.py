from datetime import date, datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.db.base import Base, TimestampMixin
from backend.models.enums import LeaveStatus, LeaveType

if TYPE_CHECKING:
    from backend.models.company import Company
    from backend.models.user import User


class LeaveQuota(Base):
    """
    Leave quota allocations configured per company.
    """
    __tablename__ = "leave_quotas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    sick_quota: Mapped[int] = mapped_column(Integer, nullable=False, default=12)
    casual_quota: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    paid_quota: Mapped[int] = mapped_column(Integer, nullable=False, default=15)

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="leave_quotas", lazy="selectin")

    def __repr__(self) -> str:
        return f"<LeaveQuota(id={self.id}, company_id={self.company_id}, sick={self.sick_quota}, casual={self.casual_quota}, paid={self.paid_quota})>"


class LeaveRequest(Base, TimestampMixin):
    """
    Employee leave applications with reviewer workflow and duration tracking.
    """
    __tablename__ = "leave_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    leave_type: Mapped[LeaveType] = mapped_column(
        Enum(LeaveType, name="leave_type", native_enum=False),
        nullable=False,
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_days: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[LeaveStatus] = mapped_column(
        Enum(LeaveStatus, name="leave_status", native_enum=False),
        nullable=False,
        default=LeaveStatus.PENDING,
        index=True,
    )
    reviewed_by: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="leave_requests", lazy="selectin")
    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="leave_requests",
        lazy="selectin",
    )
    reviewer: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[reviewed_by],
        back_populates="reviewed_leaves",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return (
            f"<LeaveRequest(id={self.id}, user_id={self.user_id}, "
            f"type='{self.leave_type}', days={self.total_days}, status='{self.status}')>"
        )
