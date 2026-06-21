from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class DocumentType(str, Enum):
    nameplate = "nameplate"
    bill = "bill"
    generic = "generic"


class ProcessingMode(str, Enum):
    read = "read"
    analyze = "analyze"


class VisionRequest(BaseModel):
    """Incoming request for any vision pipeline."""

    mode: ProcessingMode = ProcessingMode.read
    document_type: DocumentType = DocumentType.generic
    options: dict[str, Any] = Field(default_factory=dict)


class VisionResponse(BaseModel):
    """Unified response envelope."""

    success: bool
    confidence: float = Field(ge=0.0, le=1.0)
    warnings: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    processing_time_ms: float = Field(ge=0.0)
    engine_version: str = "1.0.0"
    data: dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: str | None = None
