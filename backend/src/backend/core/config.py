from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

# Locate the project root where .env resides
BASE_DIR = Path(__file__).resolve().parents[3]
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Workflow"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database Configuration (Async PostgreSQL)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/workflow_db"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_PRE_PING: bool = True
    DB_ECHO: bool = False

    # Authentication & JWT
    JWT_SECRET: str = "super-secret-jwt-key-replace-in-production-change-this-string"
    JWT_REFRESH_SECRET: str = "super-secret-refresh-jwt-key-replace-in-production-change-this"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 30 minutes for access tokens
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7     # 7 days for refresh tokens

    # AI RAG & LLM Configuration
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "qwen/qwen3.8-27b"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    model_config = SettingsConfigDict(
        env_file=(str(ENV_FILE), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
