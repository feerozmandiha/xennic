from __future__ import annotations

from typing import Any

import cv2
import numpy as np

from app.core.stage import PipelineStage
from app.core.result import StageResult


class Denoiser(PipelineStage):
    """Remove noise using Non-Local Means Denoising."""

    STRENGTH = 10

    async def process(
        self,
        image: np.ndarray,
        context: dict[str, Any],
    ) -> tuple[np.ndarray, StageResult]:
        if image.ndim == 3 and image.shape[2] == 3:
            denoised = cv2.fastNlMeansDenoisingColored(
                image, None, self.STRENGTH, self.STRENGTH, 7, 21,
            )
        else:
            denoised = cv2.fastNlMeansDenoising(image, None, self.STRENGTH, 7, 21)

        context["preprocessed_image"] = denoised

        return denoised, StageResult(
            name=self.name,
            success=True,
            confidence=1.0,
            data={"strength": self.STRENGTH},
        )
