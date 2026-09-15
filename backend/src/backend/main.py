from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import api_router
from backend.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Employee Management & AI RAG Platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for Vite frontend integration with credentials/cookie support
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount consolidated v1 API router
app.include_router(api_router)


@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint to verify backend service availability."""
    return {"status": "ok", "project": settings.PROJECT_NAME, "environment": settings.ENVIRONMENT}


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint welcoming API consumers."""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/docs",
        "version": "0.1.0",
    }
