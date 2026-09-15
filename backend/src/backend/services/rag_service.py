import io
import re
from typing import List, Optional, Tuple
from fastapi import HTTPException, UploadFile, status
from fastembed import TextEmbedding
import groq
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.config import settings
from backend.models import CompanyPolicy, User, UserRole
from backend.schemas.rag import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    PolicyDeleteResponse,
    PolicyDocumentInfo,
    PolicyUploadResponse,
    SourceCitation,
)

# Singleton embedding model to avoid re-initializing ONNX session on each call
_embedding_model: Optional[TextEmbedding] = None


def get_embedding_model() -> TextEmbedding:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = TextEmbedding(model_name=settings.EMBEDDING_MODEL)
    return _embedding_model


def chunk_text(text: str, chunk_size: int = 600, chunk_overlap: int = 120) -> List[str]:
    """
    Split text into overlapping semantic chunks for vector embedding and retrieval.
    Clean whitespace and avoid breaking sentences where possible.
    """
    cleaned = re.sub(r"[ \t]+", " ", text).strip()
    if not cleaned:
        return []

    # If text is smaller than chunk size, return single chunk
    if len(cleaned) <= chunk_size:
        return [cleaned]

    # Split by paragraphs or newlines first
    paragraphs = [p.strip() for p in cleaned.split("\n") if p.strip()]
    chunks: List[str] = []
    current_chunk = ""

    for para in paragraphs:
        if not current_chunk:
            current_chunk = para
        elif len(current_chunk) + len(para) + 1 <= chunk_size:
            current_chunk += "\n" + para
        else:
            chunks.append(current_chunk)
            # Retain overlap from end of current chunk
            overlap_text = current_chunk[-chunk_overlap:] if len(current_chunk) > chunk_overlap else current_chunk
            current_chunk = overlap_text + " " + para

    if current_chunk and (not chunks or chunks[-1] != current_chunk):
        chunks.append(current_chunk)

    # Sub-chunk any chunks that still exceed chunk_size
    final_chunks: List[str] = []
    for c in chunks:
        if len(c) <= chunk_size:
            final_chunks.append(c)
        else:
            start = 0
            while start < len(c):
                end = min(start + chunk_size, len(c))
                final_chunks.append(c[start:end].strip())
                if end == len(c):
                    break
                start += chunk_size - chunk_overlap

    return [c for c in final_chunks if len(c) > 10]


class RAGService:
    """
    RAG service managing:
    - Policy document ingestion (.pdf, .txt, .md) with tenant isolation (Owner only)
    - Vector embeddings generation via local sentence-transformers/all-MiniLM-L6-v2
    - Semantic similarity retrieval against PostgreSQL pgvector
    - Groq LLM chatbot with strict guardrails and ephemeral in-session memory
    """

    @classmethod
    def generate_embeddings(cls, texts: List[str]) -> List[List[float]]:
        """Generate 384-dimensional vector embeddings using fastembed."""
        if not texts:
            return []
        model = get_embedding_model()
        raw_embeddings = list(model.embed(texts))
        return [emb.tolist() for emb in raw_embeddings]

    @classmethod
    def generate_single_embedding(cls, text: str) -> List[float]:
        """Generate a single 384-dimensional vector embedding for a query string."""
        return cls.generate_embeddings([text])[0]

    @classmethod
    async def extract_text_from_file(cls, file: UploadFile) -> str:
        """Extract text from uploaded PDF, TXT, or MD files."""
        content_bytes = await file.read()
        filename = (file.filename or "").lower()

        if filename.endswith(".pdf"):
            import pypdf

            try:
                reader = pypdf.PdfReader(io.BytesIO(content_bytes))
                extracted_pages = []
                for page_idx, page in enumerate(reader.pages):
                    page_text = page.extract_text()
                    if page_text:
                        extracted_pages.append(page_text)
                full_text = "\n\n".join(extracted_pages)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to parse PDF document: {str(e)}",
                )
        elif filename.endswith((".txt", ".md")):
            try:
                full_text = content_bytes.decode("utf-8")
            except UnicodeDecodeError:
                full_text = content_bytes.decode("latin-1", errors="ignore")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type. Please upload a .pdf, .txt, or .md document.",
            )

        cleaned_text = full_text.strip()
        if not cleaned_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded document contains no readable text.",
            )
        return cleaned_text

    @classmethod
    async def ingest_document(
        cls,
        db: AsyncSession,
        current_user: User,
        document_name: str,
        content_text: str,
    ) -> PolicyUploadResponse:
        """
        Chunk and embed a policy document under current_user's company_id.
        RBAC: Owner only.
        """
        if current_user.role != UserRole.OWNER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only company Owners are authorized to upload and manage policy documents.",
            )

        clean_doc_name = document_name.strip()
        if not clean_doc_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document name cannot be empty.",
            )

        chunks = chunk_text(content_text)
        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract meaningful text chunks from document.",
            )

        # Remove previous chunks of the same document for idempotency
        delete_stmt = delete(CompanyPolicy).where(
            CompanyPolicy.company_id == current_user.company_id,
            CompanyPolicy.document_name == clean_doc_name,
        )
        await db.execute(delete_stmt)

        # Generate embeddings in batch
        embeddings = cls.generate_embeddings(chunks)

        # Store policy chunks
        policy_objects = [
            CompanyPolicy(
                company_id=current_user.company_id,
                document_name=clean_doc_name,
                content_chunk=chunk_str,
                embedding=emb_vec,
            )
            for chunk_str, emb_vec in zip(chunks, embeddings)
        ]
        db.add_all(policy_objects)
        await db.commit()

        return PolicyUploadResponse(
            message=f"Successfully ingested policy '{clean_doc_name}' with {len(chunks)} chunks.",
            document_name=clean_doc_name,
            chunks_created=len(chunks),
        )

    @classmethod
    async def list_company_policies(
        cls,
        db: AsyncSession,
        current_user: User,
    ) -> List[PolicyDocumentInfo]:
        """
        List all distinct policy documents for current_user's company with chunk count.
        Accessible by all roles (OWNER, HR, EMPLOYEE) for transparency.
        """
        stmt = (
            select(
                CompanyPolicy.document_name,
                func.count(CompanyPolicy.id).label("chunk_count"),
                func.sum(func.length(CompanyPolicy.content_chunk)).label("total_chars"),
            )
            .where(CompanyPolicy.company_id == current_user.company_id)
            .group_by(CompanyPolicy.document_name)
            .order_by(CompanyPolicy.document_name.asc())
        )
        result = await db.execute(stmt)
        rows = result.all()

        return [
            PolicyDocumentInfo(
                document_name=row[0],
                chunk_count=row[1],
                total_characters=row[2] or 0,
            )
            for row in rows
        ]

    @classmethod
    async def delete_company_policy(
        cls,
        db: AsyncSession,
        current_user: User,
        document_name: str,
    ) -> PolicyDeleteResponse:
        """
        Delete all chunks for a document name.
        RBAC: Owner only.
        """
        if current_user.role != UserRole.OWNER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only company Owners can delete policy documents.",
            )

        stmt = delete(CompanyPolicy).where(
            CompanyPolicy.company_id == current_user.company_id,
            CompanyPolicy.document_name == document_name,
        )
        result = await db.execute(stmt)
        await db.commit()

        deleted_count = result.rowcount or 0
        if deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No policy document found with name '{document_name}'.",
            )

        return PolicyDeleteResponse(
            message=f"Successfully deleted policy document '{document_name}'.",
            document_name=document_name,
            chunks_deleted=deleted_count,
        )

    @classmethod
    async def search_relevant_chunks(
        cls,
        db: AsyncSession,
        company_id: int,
        query: str,
        top_k: int = 4,
    ) -> List[Tuple[CompanyPolicy, float]]:
        """
        Perform vector similarity search filtered strictly by company_id using pgvector cosine distance.
        """
        query_emb = cls.generate_single_embedding(query)

        stmt = (
            select(
                CompanyPolicy,
                CompanyPolicy.embedding.cosine_distance(query_emb).label("distance"),
            )
            .where(
                CompanyPolicy.company_id == company_id,
                CompanyPolicy.embedding.is_not(None),
            )
            .order_by("distance")
            .limit(top_k)
        )

        result = await db.execute(stmt)
        rows = result.all()
        # Convert cosine distance to cosine similarity (1 - distance)
        return [(row[0], round(1.0 - float(row[1]), 4)) for row in rows]

    @classmethod
    async def ask_chatbot(
        cls,
        db: AsyncSession,
        current_user: User,
        request: ChatRequest,
    ) -> ChatResponse:
        """
        Answer employee/HR/Owner policy inquiries using Groq LLM grounded strictly on tenant's policies.
        Includes guardrails against out-of-scope queries and ephemeral multi-turn memory.
        """
        if not settings.GROQ_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Groq AI chatbot is not configured. Please set GROQ_API_KEY in the environment.",
            )

        # 1. Retrieve top matching chunks strictly for current_user's company
        matches = await cls.search_relevant_chunks(
            db=db,
            company_id=current_user.company_id,
            query=request.question,
            top_k=4,
        )

        # Build context from chunks
        sources: List[SourceCitation] = []
        context_parts: List[str] = []

        for policy, similarity in matches:
            sources.append(
                SourceCitation(
                    chunk_id=policy.id,
                    document_name=policy.document_name,
                    content_snippet=policy.content_chunk[:200] + ("..." if len(policy.content_chunk) > 200 else ""),
                    similarity_score=similarity,
                )
            )
            context_parts.append(
                f"--- DOCUMENT: {policy.document_name} ---\n{policy.content_chunk}"
            )

        context_block = "\n\n".join(context_parts) if context_parts else "No relevant company policy documents found."

        # 2. Guardrailed System Prompt
        system_prompt = (
            "You are the official Company Policy & HR Assistant for this organization.\n"
            "Your sole mission is to provide accurate, concise, and helpful answers based strictly on the provided company policy documents, workplace guidelines, and leave rules.\n\n"
            "STRICT GUARDRAILS & INSTRUCTIONS:\n"
            "1. ONLY answer questions concerning company policies, workplace guidelines, leave policies, working hours, employee benefits, code of conduct, and internal procedures.\n"
            "2. If the user asks off-topic, general, or unrelated questions (e.g. general coding assistance, math problems, trivia, creative writing, world events, recipes, personal advice), politely and firmly REFUSE to answer. State: 'I am an AI HR & Policy Assistant dedicated only to answering questions about company policies, workplace guidelines, and leave rules. I cannot assist with unrelated topics.'\n"
            "3. If the provided policy documents do not contain the answer, state clearly and honestly: 'Our current company policy documentation does not contain information on this topic. Please contact your HR department or company manager for guidance.' Do NOT invent or hallucinate rules, numbers, or terms not found in the documents.\n"
            "4. Always ground your answers in the provided context and reference the specific document name when relevant.\n"
            "5. Maintain a professional, polite, and constructive tone at all times.\n\n"
            f"COMPANY POLICY CONTEXT:\n{context_block}"
        )

        # 3. Assemble Groq Message History (multi-turn ephemeral in-session memory)
        messages = [{"role": "system", "content": system_prompt}]

        # Append last 6 turns of in-session history from frontend if provided
        if request.history:
            for past_msg in request.history[-6:]:
                if past_msg.role in ("user", "assistant"):
                    messages.append({"role": past_msg.role, "content": past_msg.content})

        # Append current user question
        messages.append({"role": "user", "content": request.question})

        # 4. Call Groq API
        try:
            client = groq.AsyncGroq(api_key=settings.GROQ_API_KEY)
            completion = await client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                temperature=0.2,
                max_tokens=1024,
            )
            answer_text = completion.choices[0].message.content or ""
        except groq.APIError as err:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Groq LLM Service error: {str(err)}",
            )
        except Exception as ex:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected error while communicating with AI assistant: {str(ex)}",
            )

        return ChatResponse(
            answer=answer_text.strip(),
            sources=sources,
            model=settings.GROQ_MODEL,
        )
