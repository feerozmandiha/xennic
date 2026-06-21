"""Pipeline orchestrator — Chain of Responsibility."""
from __future__ import annotations

import time
from typing import Any

import numpy as np

from app.core.result import PipelineResult
from app.core.stage import PipelineStage


class Pipeline:
    """Orchestrate stages in sequence. Each stage receives the output image
    from the preceding stage."""

    def __init__(self, stages: list[PipelineStage] | None = None) -> None:
        self._stages: list[PipelineStage] = stages or []

    def add_stage(self, stage: PipelineStage) -> None:
        self._stages.append(stage)

    async def run(
        self,
        image: np.ndarray,
        context: dict[str, Any] | None = None,
    ) -> PipelineResult:
        context = context or {}
        result = PipelineResult(success=True, confidence=1.0)
        t0 = time.perf_counter()

        for stage in self._stages:
            image, stage_result = await stage(image, context)
            result.add_stage(stage_result)
            if not stage_result.success:
                result.success = False
                break

        # Aggregate extracted data into result.data
        result.data = context.get("extracted_data", {})
        for sr in result.stage_results.values():
            if sr.data and "knowledge" in sr.data:
                result.data["knowledge"] = sr.data["knowledge"]
            if sr.data and "combined_text" in sr.data:
                result.data["combined_text"] = sr.data["combined_text"]

        result.processing_time_ms = (time.perf_counter() - t0) * 1000
        return result
