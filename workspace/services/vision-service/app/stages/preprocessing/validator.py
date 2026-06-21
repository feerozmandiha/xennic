from __future__ import annotations

from typing import Any

import cv2
import numpy as np

from app.core.stage import PipelineStage
from app.core.result import StageResult


class ImageValidator(PipelineStage):
    """Validate image format, dimensions, and basic quality."""

    MIN_WIDTH = 64
    MIN_HEIGHT = 64
    MAX_WIDTH = 10000
    MAX_HEIGHT = 10000

    async def process(
        self,
        image: np.ndarray,
        context: dict[str, Any],
    ) -> tuple[np.ndarray, StageResult]:
        warnings: list[str] = []
        errors: list[str] = []

        h, w = image.shape[:2]

        if h < self.MIN_WIDTH or w < self.MIN_HEIGHT:
            errors.append(f"Image too small: {w}x{h}")

        if h > self.MAX_HEIGHT or w > self.MAX_WIDTH:
            warnings.append(f"Large image ({w}x{h}), may be slow")

        if image.ndim not in (2, 3):
            errors.append(f"Invalid image dimensions: {image.ndim}")

        if image.ndim == 3 and image.shape[2] not in (1, 3, 4):
            errors.append(f"Unsupported channels: {image.shape[2]}")

        # Check for blank / near-blank image
        gray = image if image.ndim == 2 else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        std = float(np.std(gray))
        if std < 5.0:
            warnings.append("Low contrast — image may be blank or uniform")

        confidence = max(0.0, min(1.0, 1.0 - (len(errors) * 0.5)))

        context["validated"] = True
        context["original_size"] = (w, h)

        return image, StageResult(
            name=self.name,
            success=len(errors) == 0,
            confidence=confidence,
            data={
                "width": w,
                "height": h,
                "channels": image.shape[2] if image.ndim == 3 else 1,
                "dtype": str(image.dtype),
            },
            warnings=warnings,
            errors=errors,
        )
