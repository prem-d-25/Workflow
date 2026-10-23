"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """System settings validated by Pydantic."""

    DATABASE_URL: str = "postgresql+psycopg://postgres:password@localhost:5432/workflow"
    JWT_SECRET: str = "replace-with-a-secure-random-secret-key-at-least-32-chars"
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
