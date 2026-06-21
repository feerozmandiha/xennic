"""PaddleOCR engine wrapper."""
from __future__ import annotations

from typing import Any

import numpy as np

from app.config.settings import settings


class PaddleOCREngine:
    """Thread-safe wrapper around PaddleOCR."""

    _instance: PaddleOCREngine | None = None

    def __init__(self) -> None:
        self._ocr = None  # lazy import
        self._langs = settings.paddle_langs

    @classmethod
    def get_instance(cls) -> PaddleOCREngine:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _ensure_loaded(self) -> None:
        if self._ocr is not None:
            return
        # Lazy import so the service can start without paddle installed
        from paddleocr import PaddleOCR  # type: ignore[import-untyped]

        self._ocr = PaddleOCR(
            use_angle_cls=True,
            lang=self._langs[0] if self._langs else "en",
            show_log=False,
            use_gpu=settings.enable_gpu,
        )

    async def recognize(self, image: np.ndarray) -> list[dict[str, Any]]:
        self._ensure_loaded()
        # PaddleOCR runs synchronously; run in thread pool in production
        result = self._ocr.ocr(image, cls=True)  # type: ignore[union-attr]
        if not result or not result[0]:
            return []
        boxes_texts = []
        for line in result[0]:
            bbox, (text, conf) = line
            boxes_texts.append({
                "bbox": [float(c) for coord in bbox for c in coord],
                "text": str(text),
                "confidence": float(conf),
            })
        return boxes_texts
