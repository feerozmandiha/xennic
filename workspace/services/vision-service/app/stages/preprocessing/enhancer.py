from __future__ import annotations

from typing import Any

import cv2
import numpy as np

from app.core.stage import PipelineStage
from app.core.result import StageResult


class ImageEnhancer(PipelineStage):
    """Enhance image quality — contrast, sharpness, lighting correction."""

    async def process(
        self,
        image: np.ndarray,
        context: dict[str, Any],
    ) -> tuple[np.ndarray, StageResult]:
        result_img = image.copy()
        ops: list[str] = []

        gray = (
            result_img
            if result_img.ndim == 2
            else cv2.cvtColor(result_img, cv2.COLOR_BGR2GRAY)
        )

        # CLAHE contrast enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        ops.append("clahe")

        # If color, merge back
        if result_img.ndim == 3:
            hsv = cv2.cvtColor(result_img, cv2.COLOR_BGR2HSV)
            hsv[:, :, 2] = enhanced
            result_img = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        else:
            result_img = enhanced

        # Light sharpening
        kernel = np.array([[-0.5, -0.5, -0.5],
                           [-0.5,  5.0, -0.5],
                           [-0.5, -0.5, -0.5]])
        result_img = cv2.filter2D(result_img, -1, kernel)
        ops.append("sharpen")

        return result_img, StageResult(
            name=self.name,
            success=True,
            confidence=1.0,
            data={"operations": ops},
        )
