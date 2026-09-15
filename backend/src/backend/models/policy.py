from typing import TYPE_CHECKING, Optional, List
from pgvector.sqlalchemy import Vector
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.db.base import Base

if TYPE_CHECKING:
    from backend.models.company import Company


class CompanyPolicy(Base):
    """
    Company policy document chunks with 384-dimensional vector embeddings for RAG semantic search.
    Tenant isolation is enforced via company_id.
    """
    __tablename__ = "company_policies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    document_name: Mapped[str] = mapped_column(String(255), nullable=False)
    content_chunk: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[Optional[List[float]]] = mapped_column(Vector(384), nullable=True)

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="policies", lazy="selectin")

    def __repr__(self) -> str:
        return f"<CompanyPolicy(id={self.id}, doc='{self.document_name}', company_id={self.company_id})>"
