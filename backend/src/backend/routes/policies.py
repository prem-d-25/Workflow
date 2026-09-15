from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.dependencies import get_current_user, require_roles
from backend.db.session import get_db
from backend.models import User, UserRole
from backend.schemas.rag import (
    PolicyDeleteResponse,
    PolicyDocumentInfo,
    PolicyUploadResponse,
)
from backend.services.rag_service import RAGService

router = APIRouter(prefix="/policies", tags=["Company Policies (RAG)"])


class TextPolicyCreateRequest(BaseModel):
    document_name: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=10)


@router.post(
    "/upload",
    response_model=PolicyUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload policy document (.pdf, .txt, .md) (Owner only)",
)
async def upload_policy_document(
    file: UploadFile = File(...),
    document_name: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.OWNER)),
):
    """
    Upload a company policy document (PDF or text).
    The document is extracted, chunked, embedded with sentence-transformers/all-MiniLM-L6-v2,
    and stored under the current user's company tenant.
    """
    doc_name = (document_name or file.filename or "policy_doc").strip()
    extracted_text = await RAGService.extract_text_from_file(file)

    return await RAGService.ingest_document(
        db=db,
        current_user=current_user,
        document_name=doc_name,
        content_text=extracted_text,
    )


@router.post(
    "/text",
    response_model=PolicyUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add raw text policy (Owner only)",
)
async def add_text_policy(
    payload: TextPolicyCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.OWNER)),
):
    """
    Add policy guidelines directly via raw text payload.
    Chunked, embedded, and isolated to tenant.
    """
    return await RAGService.ingest_document(
        db=db,
        current_user=current_user,
        document_name=payload.document_name,
        content_text=payload.content,
    )


@router.get(
    "",
    response_model=List[PolicyDocumentInfo],
    summary="List company policy documents (All roles)",
)
async def list_company_policies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all uploaded policy documents for the caller's company.
    Accessible to OWNER, HR, and EMPLOYEE.
    """
    return await RAGService.list_company_policies(db=db, current_user=current_user)


@router.delete(
    "/{document_name}",
    response_model=PolicyDeleteResponse,
    summary="Delete a company policy document (Owner only)",
)
async def delete_company_policy(
    document_name: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.OWNER)),
):
    """
    Delete all vector chunks belonging to a policy document.
    """
    return await RAGService.delete_company_policy(
        db=db,
        current_user=current_user,
        document_name=document_name,
    )
