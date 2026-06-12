"""
AI Service Configuration
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
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
    
    # Database (future)
    DATABASE_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
