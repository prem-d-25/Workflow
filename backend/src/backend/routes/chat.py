from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.dependencies import get_current_user
from backend.db.session import get_db
from backend.models import User
from backend.schemas.rag import ChatRequest, ChatResponse
from backend.services.rag_service import RAGService

router = APIRouter(prefix="/chat", tags=["AI Policy Chatbot (RAG)"])


@router.post(
    "",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Query AI Policy Chatbot (All roles)",
)
async def query_policy_chatbot(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Query the AI Policy Chatbot with RAG retrieval against company policy documents.
    - Tenant isolated: strictly queries caller's company_id.
    - Accessible to all roles (OWNER, HR, EMPLOYEE).
    - Ephemeral multi-turn context: passes `history` from current frontend session.
    - Strict guardrails: strictly answers policy/leave/workplace questions, refusing out-of-scope queries.
    """
    return await RAGService.ask_chatbot(
        db=db,
        current_user=current_user,
        request=request,
    )
