"""enable_pgvector_extension

Revision ID: dbca0a20d091
Revises: 
Create Date: 2026-10-23 17:08:18.212367

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dbca0a20d091'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Enable pgvector extension."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")


def downgrade() -> None:
    """Drop pgvector extension."""
    op.execute("DROP EXTENSION IF EXISTS vector;")
