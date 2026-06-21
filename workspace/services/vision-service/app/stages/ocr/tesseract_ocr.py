"""Tesseract OCR engine — multi-strategy for real-world documents."""
from __future__ import annotations

import asyncio
import os
from typing import Any

import cv2
import numpy as np
import pytesseract

from app.config.settings import settings


TESSDATA_PATH = "/usr/share/tesseract-ocr/5/tessdata"

_LANG_MAP: dict[str, str] = {
    "fa": "fas",
    "en": "eng",
    "ar": "ara",
}


def _to_tesseract_lang(paddle_langs: list[str]) -> str:
    mapped = [_LANG_MAP.get(l, l) for l in paddle_langs]
    available = {
        f.replace(".traineddata", "")
        for f in os.listdir(TESSDATA_PATH)
        if f.endswith(".traineddata")
    }
    mapped = [l for l in mapped if l in available]
    return "+".join(mapped) if mapped else "eng+fas"


def _try_ocr(gray: np.ndarray, config_suffix: str = "") -> list[dict[str, Any]]:
    base = f"--oem 3 --psm 3 --tessdata-dir {TESSDATA_PATH} -l {_to_tesseract_lang(settings.paddle_langs)}"
    config = f"{base} {config_suffix}".strip()

    data = pytesseract.image_to_data(
        gray, config=config, output_type=pytesseract.Output.DICT,
    )
    results: list[dict[str, Any]] = []
    for i in range(len(data["text"])):
        text = data["text"][i].strip()
        conf_str = data["conf"][i]
        if not text:
            continue
        try:
            conf = int(conf_str) / 100.0
        except (ValueError, TypeError):
            conf = 0.0
        if conf <= 0:
            continue
        x, y, w, h = (
            data["left"][i], data["top"][i],
            data["width"][i], data["height"][i],
        )
        results.append({
            "text": text,
            "confidence": conf,
            "bbox": [x, y, x + w, y + h],
        })
    return results


def _ocr_sync(image: np.ndarray) -> list[dict[str, Any]]:
    """Run all strategies synchronously — called in thread pool."""
    gray = image if image.ndim == 2 else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    strategies = [
        ("adaptive", _adaptive_gaussian(gray)),
        ("otsu", _otsu(gray)),
    ]

    best: list[dict[str, Any]] = []
    best_score = 0.0

    for name, img in strategies:
        try:
            result = _try_ocr(img)
            if not result:
                continue
            avg_conf = float(np.mean([r["confidence"] for r in result]))
            score = len(result) * avg_conf
            if score > best_score:
                best = result
                best_score = score
        except Exception:
            continue

    # If strategies failed, try raw grayscale
    if not best:
        try:
            result = _try_ocr(gray)
            if result:
                avg_conf = float(np.mean([r["confidence"] for r in result]))
                if len(result) * avg_conf > 0:
                    best = result
        except Exception:
            pass

    # Last resort: alternative PSM
    if not best:
        try:
            result = _try_ocr(gray, "--psm 6")
            best = result or []
        except Exception:
            return []

    return best


def _adaptive_gaussian(gray: np.ndarray) -> np.ndarray:
    return cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 31, 4,
    )


def _otsu(gray: np.ndarray) -> np.ndarray:
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return binary


class TesseractOCREngine:
    """Tesseract OCR with multi-strategy fallback for tough documents."""

    _instance: TesseractOCREngine | None = None

    @classmethod
    def get_instance(cls) -> TesseractOCREngine:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def recognize(self, image: np.ndarray) -> list[dict[str, Any]]:
        return await asyncio.to_thread(_ocr_sync, image.copy())
