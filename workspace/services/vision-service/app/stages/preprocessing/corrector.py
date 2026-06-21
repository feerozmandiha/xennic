from __future__ import annotations

from typing import Any

import cv2
import numpy as np

from app.core.stage import PipelineStage
from app.core.result import StageResult


class PerspectiveCorrector(PipelineStage):
    """Detect largest quadrilateral and apply perspective transform."""

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

        # Edge detection
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if not contours:
            return image, StageResult(
                name=self.name, success=True, confidence=1.0,
                data={"corrected": False, "reason": "no contours found"},
            )

        # Find largest contour by area
        largest = max(contours, key=cv2.contourArea)
        peri = cv2.arcLength(largest, True)
        approx = cv2.approxPolyDP(largest, 0.02 * peri, True)

        if len(approx) != 4:
            return image, StageResult(
                name=self.name, success=True, confidence=1.0,
                data={"corrected": False, "reason": f"contour has {len(approx)} vertices, expected 4"},
            )

        pts = np.float32([p[0] for p in approx])
        # Order: top-left, top-right, bottom-right, bottom-left
        rect = self._order_points(pts)

        w = int(max(
            np.linalg.norm(rect[1] - rect[0]),
            np.linalg.norm(rect[2] - rect[3]),
        ))
        h = int(max(
            np.linalg.norm(rect[3] - rect[0]),
            np.linalg.norm(rect[2] - rect[1]),
        ))

        dst = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
        M = cv2.getPerspectiveTransform(rect, dst)
        corrected = cv2.warpPerspective(image, M, (w, h))

        return corrected, StageResult(
            name=self.name,
            success=True,
            confidence=1.0,
            data={"corrected": True, "new_size": f"{w}x{h}"},
        )

    @staticmethod
    def _order_points(pts: np.ndarray) -> np.ndarray:
        rect = np.zeros((4, 2), dtype=np.float32)
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]
        rect[2] = pts[np.argmax(s)]
        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]
        rect[3] = pts[np.argmax(diff)]
        return rect
