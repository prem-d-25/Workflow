from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from backend.models.enums import UserRole


class AnnouncementCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=255, description="Announcement headline")
    content: str = Field(..., min_length=3, max_length=10000, description="Announcement detailed content")


class AnnouncementUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255, description="Updated headline")
    content: Optional[str] = Field(None, min_length=3, max_length=10000, description="Updated detailed content")


class AnnouncementResponse(BaseModel):
    id: int
    company_id: int
    author_id: int
    title: str
    content: str
    created_at: datetime
    author_email: Optional[str] = None
    author_role: Optional[UserRole] = None

    model_config = ConfigDict(from_attributes=True)
