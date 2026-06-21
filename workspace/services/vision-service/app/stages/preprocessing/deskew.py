from __future__ import annotations

from typing import Any

import cv2
import numpy as np

from app.core.stage import PipelineStage
from app.core.result import StageResult


class DeskewStage(PipelineStage):
    """Correct image skew using Hough transform or moments."""

    async def process(
        self,
        image: np.ndarray,
        context: dict[str, Any],
    ) -> tuple[np.ndarray, StageResult]:
        gray = (
            image
            if image.ndim == 2
            else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        )

        # Threshold
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

        # Find all non-zero points
        coords = np.column_stack(np.where(binary > 0))
        if len(coords) == 0:
            return image, StageResult(
                name=self.name, success=True, confidence=1.0,
                data={"corrected": False, "angle": 0.0},
            )

        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = 90 + angle
        angle = -angle

        if abs(angle) < 0.5:
            return image, StageResult(
                name=self.name, success=True, confidence=1.0,
                data={"corrected": False, "angle": float(angle)},
            )

        h, w = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

        return rotated, StageResult(
            name=self.name,
            success=True,
            confidence=1.0,
            data={"corrected": True, "angle": float(angle)},
        )
