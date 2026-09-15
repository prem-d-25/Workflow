import enum


class UserRole(str, enum.Enum):
    """
    Role-Based Access Control (RBAC) user roles.
    """
    OWNER = "OWNER"
    HR = "HR"
    EMPLOYEE = "EMPLOYEE"


class LeaveType(str, enum.Enum):
    """
    Types of employee leave requests.
    """
    SICK = "SICK"
    CASUAL = "CASUAL"
    PLANNED = "PLANNED"
    UNPAID = "UNPAID"


class LeaveStatus(str, enum.Enum):
    """
    Approval statuses for leave requests.
    """
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
