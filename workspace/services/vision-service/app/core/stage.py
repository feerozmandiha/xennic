"""Base pipeline stage — Strategy pattern."""
from __future__ import annotations

import time
from abc import ABC, abstractmethod
from typing import Any

import numpy as np

from app.core.result import StageResult


class PipelineStage(ABC):
    """Abstract base for every pipeline stage."""

    def __init__(self, name: str | None = None) -> None:
        self._name = name or self.__class__.__name__

    @property
    def name(self) -> str:
        return self._name

    @abstractmethod
    async def process(
        self,
        image: np.ndarray,
        context: dict[str, Any],
    ) -> tuple[np.ndarray, StageResult]:
        ...

    async def __call__(
        self,
        image: np.ndarray,
        context: dict[str, Any] | None = None,
    ) -> tuple[np.ndarray, StageResult]:
        context = context or {}
        t0 = time.perf_counter()
        try:
            img, result = await self.process(image, context)
            result.name = self.name
            result.processing_time_ms = (time.perf_counter() - t0) * 1000
            result.success = len(result.errors) == 0
            return img, result
        except Exception as exc:
            elapsed = (time.perf_counter() - t0) * 1000
            return image, StageResult(
                name=self.name,
                success=False,
                confidence=0.0,
                errors=[str(exc)],
                processing_time_ms=elapsed,
            )
