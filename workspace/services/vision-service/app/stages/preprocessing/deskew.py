from __future__ import annotations

from typing import Any

import cv2
import numpy as np

from app.core.result import StageResult
from app.core.stage import PipelineStage


class DeskewStage(PipelineStage):
    """Safely correct small document skew without damaging readable images."""

    MAX_CORRECTION_ANGLE = 15.0
    MIN_CORRECTION_ANGLE = 0.5
    MIN_FOREGROUND_POINTS = 20

    async def process(
        self,
        image: np.ndarray,
        context: dict[str, Any],
    ) -> tuple[np.ndarray, StageResult]:
        if image is None or image.size == 0:
            return image, StageResult(
                name=self.name,
                success=False,
                confidence=0.0,
                errors=["Empty image received"],
            )

        gray = (
            image
            if image.ndim == 2
            else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        )

        if gray.ndim != 2:
            return image, StageResult(
                name=self.name,
                success=False,
                confidence=0.0,
                errors=["Unable to create grayscale image"],
            )

        blurred = cv2.GaussianBlur(gray, (3, 3), 0)

        _, binary = cv2.threshold(
            blurred,
            0,
            255,
            cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU,
        )

        foreground = cv2.findNonZero(binary)

        if foreground is None or len(foreground) < self.MIN_FOREGROUND_POINTS:
            return image, StageResult(
                name=self.name,
                success=True,
                confidence=1.0,
                data={
                    "corrected": False,
                    "angle": 0.0,
                    "reason": "insufficient_foreground",
                },
            )

        rect = cv2.minAreaRect(foreground)
        raw_angle = float(rect[-1])

        if raw_angle < -45.0:
            angle = -(90.0 + raw_angle)
        else:
            angle = -raw_angle

        if not np.isfinite(angle):
            return image, StageResult(
                name=self.name,
                success=True,
                confidence=1.0,
                data={
                    "corrected": False,
                    "angle": 0.0,
                    "reason": "invalid_angle",
                },
            )

        if (
            abs(angle) < self.MIN_CORRECTION_ANGLE
            or abs(angle) > self.MAX_CORRECTION_ANGLE
        ):
            return image, StageResult(
                name=self.name,
                success=True,
                confidence=1.0,
                data={
                    "corrected": False,
                    "angle": float(angle),
                    "reason": "angle_out_of_safe_range",
                },
            )

        height, width = image.shape[:2]
        center = (width / 2.0, height / 2.0)

        matrix = cv2.getRotationMatrix2D(center, angle, 1.0)

        rotated = cv2.warpAffine(
            image,
            matrix,
            (width, height),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE,
        )

        if rotated is None or rotated.size == 0:
            return image, StageResult(
                name=self.name,
                success=True,
                confidence=1.0,
                data={
                    "corrected": False,
                    "angle": float(angle),
                    "reason": "empty_rotation_output",
                },
            )

        rotated_gray = (
            rotated
            if rotated.ndim == 2
            else cv2.cvtColor(rotated, cv2.COLOR_BGR2GRAY)
        )

        original_quality = float(np.std(gray))
        rotated_quality = float(np.std(rotated_gray))

        if (
            not np.isfinite(rotated_quality)
            or original_quality > 0
            and rotated_quality < original_quality * 0.25
        ):
            return image, StageResult(
                name=self.name,
                success=True,
                confidence=1.0,
                warnings=["Deskew output rejected; original image preserved"],
                data={
                    "corrected": False,
                    "angle": float(angle),
                    "reason": "quality_regression",
                },
            )

        return rotated, StageResult(
            name=self.name,
            success=True,
            confidence=1.0,
            data={
                "corrected": True,
                "angle": float(angle),
                "reason": "safe_rotation",
            },
        )
