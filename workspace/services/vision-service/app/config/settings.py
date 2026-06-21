"""Pydantic Settings — all env vars validated at startup."""
from __future__ import annotations

from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
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

    # Limits
    max_image_size_mb: int = 20
    allowed_extensions: str = "jpg,jpeg,png,bmp,tiff,pdf"
    ocr_timeout_seconds: int = 120
    llm_timeout_seconds: int = 60
    max_pipeline_parallelism: int = 4
    enable_gpu: bool = False

    # Derived
    @property
    def allowed_extensions_list(self) -> list[str]:
        return [e.strip().lower() for e in self.allowed_extensions.split(",")]

    @property
    def paddle_langs(self) -> list[str]:
        return [lang.strip() for lang in self.paddle_ocr_lang.split(",")]


settings = Settings()
