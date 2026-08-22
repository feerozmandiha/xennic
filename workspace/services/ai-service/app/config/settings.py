"""
AI Service Configuration
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Service
    SERVICE_NAME: str = "ai-service"
    SERVICE_PORT: int = 8002
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # Anthropic
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"
    
    # Google
    GOOGLE_API_KEY: Optional[str] = None
    GOOGLE_MODEL: str = "gemini-1.5-pro"
    
    # Engineering Service
    ENGINEERING_SERVICE_URL: str = "http://engineering-service:8001"
    
    # Embeddings
    EMBEDDING_API_KEY: Optional[str] = None
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSION: int = 1536

    # Qdrant Vector Database
    QDRANT_URL: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_FORCE_FALLBACK: bool = False

    # Database (future)
    DATABASE_URL: Optional[str] = None


settings = Settings()
