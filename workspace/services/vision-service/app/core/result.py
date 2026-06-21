"""Pipeline result type — unified output envelope."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class StageResult:
    name: str
    success: bool
    confidence: float
    data: dict[str, Any] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    processing_time_ms: float = 0.0


@dataclass
class PipelineResult:
    success: bool
    confidence: float
    data: dict[str, Any] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    processing_time_ms: float = 0.0
    engine_version: str = "1.0.0"
    pipeline_trace: list[str] = field(default_factory=list)
    stage_results: dict[str, StageResult] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "success": self.success,
            "confidence": round(self.confidence, 4),
            "warnings": self.warnings,
            "errors": self.errors,
            "processing_time_ms": round(self.processing_time_ms, 2),
            "engine_version": self.engine_version,
            "pipeline_trace": self.pipeline_trace,
            "data": self.data,
        }

    def add_stage(self, stage: StageResult) -> None:
        self.stage_results[stage.name] = stage
        self.pipeline_trace.append(stage.name)
        self.processing_time_ms += stage.processing_time_ms
        self.warnings.extend(stage.warnings)
        self.errors.extend(stage.errors)
        if not stage.success:
            self.success = False
        if self.confidence == 1.0:
            self.confidence = stage.confidence
        else:
            self.confidence = min(self.confidence, stage.confidence)
