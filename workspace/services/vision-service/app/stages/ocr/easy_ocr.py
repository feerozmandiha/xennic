"""EasyOCR engine — deep-learning based OCR with Persian support.

Model weights are downloaded from GitHub on first use.
If models are not cached, initialization returns None (no hang).
Set OCR_ENGINE_MODE=easyocr to force EasyOCR usage.
"""
from __future__ import annotations

import asyncio
import os
from typing import Any

import numpy as np


_EASYOCR_MODEL_DIR = os.path.expanduser("~/.EasyOCR/model")


def _models_available() -> bool:
    """Check if all required model files are cached (no download needed)."""
    required = ["craft_mlt_25k.pth", "english_g2.pth"]
    if not os.path.isdir(_EASYOCR_MODEL_DIR):
        return False
    return all(os.path.isfile(os.path.join(_EASYOCR_MODEL_DIR, f)) for f in required)


class EasyOCREngine:
    """EasyOCR wrapper with lazy singleton initialization.

    Skips loading if model weights are not already cached
    (avoids hanging on first-use download).
    """

    _instance: EasyOCREngine | None = None
    _reader: Any = None
    _available: bool | None = None

    def __init__(self) -> None:
        self._langs = ["fa", "en"]

    @classmethod
    def get_instance(cls) -> EasyOCREngine:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @property
    def available(self) -> bool:
        if self._available is None:
            self.__class__._available = _models_available()
        return self._available

    def _get_reader(self) -> Any:
        if self._reader is None:
            import easyocr
            self.__class__._reader = easyocr.Reader(
                self._langs,
                gpu=False,
                download_enabled=False,
            )
        return self._reader

    async def recognize(self, image: np.ndarray) -> list[dict[str, Any]]:
        if not self.available:
            return []

        try:
            reader = self._get_reader()
        except Exception:
            return []

        raw = await asyncio.to_thread(
            reader.readtext, image,
            paragraph=True,
            width_ths=0.7,
            height_ths=0.7,
        )

        results: list[dict[str, Any]] = []
        for bbox, text, conf in raw:
            text = text.strip()
            if not text:
                continue
            x_coords = [p[0] for p in bbox]
            y_coords = [p[1] for p in bbox]
            results.append({
                "text": text,
                "confidence": float(conf),
                "bbox": [min(x_coords), min(y_coords), max(x_coords), max(y_coords)],
            })
        return results
