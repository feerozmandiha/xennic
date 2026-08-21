"""Pydantic Settings — all env vars validated at startup."""
from __future__ import annotations

from typing import Literal

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    # Service
    service_name: str = "vision-service"
    service_version: str = "1.0.0"
    service_port: int = 8003
    log_level: str = "INFO"

    # OCR engine
    ocr_engine_mode: Literal["paddle", "tesseract", "llm", "hybrid", "auto"] = "auto"
    paddle_ocr_lang: str = "fa,en,ar"
    vision_llm_provider: Literal["groq", "openai", "anthropic", "mock"] = "groq"
    vision_llm_model: str = "llama-3.2-90b-vision-preview"

    # API Keys
    groq_api_key: str = ""
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # HTTP / CORS
    # Prefer VISION_CORS_ORIGINS when the vision-service needs a stricter or
    # different allowlist than the main API. CORS_ORIGINS is kept as a shared
    # fallback for Docker Compose deployments.
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:3001",
        validation_alias=AliasChoices("VISION_CORS_ORIGINS", "CORS_ORIGINS"),
    )
    cors_allow_credentials: bool = True

    # Limits
    max_image_size_mb: int = 20
    allowed_extensions: str = "jpg,jpeg,png,bmp,tiff,pdf"
    ocr_timeout_seconds: int = 120
    llm_timeout_seconds: int = 60
    max_pipeline_parallelism: int = 4
    enable_gpu: bool = False

    @model_validator(mode="after")
    def validate_cors_configuration(self) -> "Settings":
        origins = self.cors_origins_list
        if not origins:
            raise ValueError("CORS origins must contain at least one origin")
        if "*" in origins and self.cors_allow_credentials:
            raise ValueError(
                "CORS wildcard origins are not allowed when credentials are enabled"
            )
        return self

    # Derived
    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    @property
    def allowed_extensions_list(self) -> list[str]:
        return [e.strip().lower() for e in self.allowed_extensions.split(",")]

    @property
    def paddle_langs(self) -> list[str]:
        return [lang.strip() for lang in self.paddle_ocr_lang.split(",")]


settings = Settings()
