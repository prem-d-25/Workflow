"""Import every model so Alembic can see them via Base.metadata."""

from app.models.company import Company
from app.models.user import User
from app.models.leave_type import LeaveType
from app.models.leave_request import LeaveRequest
from app.models.announcement import Announcement
from app.models.policy_document import PolicyDocument
from app.models.policy_chunk import PolicyChunk

__all__ = [
    "Company",
    "User",
    "LeaveType",
    "LeaveRequest",
    "Announcement",
    "PolicyDocument",
    "PolicyChunk",
]
