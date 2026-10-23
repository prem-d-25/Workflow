"""Application-wide constant enumerations."""

from enum import StrEnum


class UserRole(StrEnum):
    """Roles a user can have inside a company."""

    OWNER = "owner"
    HR = "hr"
    EMPLOYEE = "employee"


class LeaveStatus(StrEnum):
    """Lifecycle states of a leave request."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
