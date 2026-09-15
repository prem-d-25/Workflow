from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class PolicyDocumentInfo(BaseModel):
    """Metadata summary of an uploaded policy document."""
    document_name: str
    chunk_count: int
    total_characters: int


class PolicyUploadResponse(BaseModel):
    """Response after ingesting a policy document."""
    message: str
    document_name: str
    chunks_created: int


class PolicyDeleteResponse(BaseModel):
    """Response after deleting policy document chunks."""
    message: str
    document_name: str
    chunks_deleted: int


class ChatMessage(BaseModel):
    """Single message in a conversational session."""
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    """Request payload for policy RAG chatbot."""
    question: str = Field(..., min_length=1, max_length=2000, description="The user query regarding company policies")
    history: List[ChatMessage] = Field(
        default_factory=list,
        description="Active in-session ephemeral chat memory. Resets on frontend refresh.",
    )


class SourceCitation(BaseModel):
    """Source policy document chunk cited for an answer."""
    chunk_id: int
    document_name: str
    content_snippet: str
    similarity_score: Optional[float] = None


class ChatResponse(BaseModel):
    """AI chatbot response with retrieved citations and model metadata."""
    answer: str
    sources: List[SourceCitation] = Field(default_factory=list)
    model: str
