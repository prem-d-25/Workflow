from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.models.company import Company
    from backend.models.user import User


class Announcement(Base, TimestampMixin):
    """
    Company-wide announcements published by authorized personnel.
    """
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="announcements", lazy="selectin")
    author: Mapped["User"] = relationship("User", back_populates="announcements", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Announcement(id={self.id}, title='{self.title}', company_id={self.company_id})>"
