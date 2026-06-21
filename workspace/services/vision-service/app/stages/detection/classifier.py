"""Classify document type using visual heuristics + OCR text keywords."""
from __future__ import annotations

from typing import Any

import cv2
import numpy as np

from app.core.stage import PipelineStage
from app.core.result import StageResult
from app.schemas.inputs import DocumentType


class DocumentClassifier(PipelineStage):
    """Classify document type using:
    1. OCR text keywords (highest priority)
    2. Visual heuristics (aspect ratio / size)
    3. Default to generic
    """

    # Keywords that indicate an electricity bill (Persian + English)
    BILL_KEYWORDS: list[str] = [
        "قبض", "برق", "اشتراک", "شماره اشتراک", "توان", "قرائت", "مصرف",
        "bill", "electricity", "kwh", "kilo watt", "meter reading",
        "customer", "account number", "consumption", "energy charge",
        "power", "distribution", "transmission", "invoice", "due date",
        "billing period", "previous reading", "current reading",
    ]

    # Keywords that indicate an equipment nameplate (Persian + English)
    NAMEPLATE_KEYWORDS: list[str] = [
        "نام ساخت", "مدل", "توان نامی", "جریان", "ولتاژ", "دور",
        "طبقه عایقی", "ساخت", "سریال", "شماره فنی",
        "manufacturer", "model", "serial", "kw", "hp", "rpm",
        "voltage", "current", "ampere", "power", "frequency", "hz",
        "insulation", "class", "enclosure", "ip", "weight", "year",
    ]

    async def process(
        self,
        image: np.ndarray,
        context: dict[str, Any],
    ) -> tuple[np.ndarray, StageResult]:
        raw = context.get("document_type", context.get("detected_type", DocumentType.generic))
        doc_type = self._normalize_type(raw)

        if doc_type == DocumentType.generic:
            doc_type = self._classify(context)
            context["detected_type"] = doc_type

        return image, StageResult(
            name=self.name,
            success=True,
            confidence=1.0,
            data={"document_type": doc_type.value},
        )

    @staticmethod
    def _normalize_type(raw: Any) -> DocumentType:
        if isinstance(raw, DocumentType):
            return raw
        if isinstance(raw, str):
            try:
                return DocumentType(raw)
            except ValueError:
                return DocumentType.generic
        return DocumentType.generic

    def _classify(self, context: dict[str, Any]) -> DocumentType:
        # 1. Try text-based classification from OCR context
        if ocr_text := context.get("ocr_text", ""):
            return self._text_classify(ocr_text)

        # 2. Fall back to visual heuristics
        if (image := context.get("preprocessed_image")) is not None:
            return self._heuristic_classify(image)

        return DocumentType.generic

    @staticmethod
    def _text_classify(text: str) -> DocumentType:
        text_lower = text.lower()

        bill_score = sum(1 for kw in DocumentClassifier.BILL_KEYWORDS if kw in text_lower)
        nameplate_score = sum(1 for kw in DocumentClassifier.NAMEPLATE_KEYWORDS if kw in text_lower)

        if bill_score > nameplate_score and bill_score >= 2:
            return DocumentType.bill
        if nameplate_score > bill_score and nameplate_score >= 2:
            return DocumentType.nameplate
        # Tie or insufficient — fall through to visual
        return DocumentType.generic

    @staticmethod
    def _heuristic_classify(image: np.ndarray) -> DocumentType:
        gray = (
            image
            if image.ndim == 2
            else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        )
        h, w = gray.shape
        aspect = w / h

        # Bills are usually A4/letter portrait: aspect ~0.7-0.8
        if 0.6 < aspect < 0.9 and h > 500:
            return DocumentType.bill
        # Nameplates are typically small squares or rectangles
        if 0.5 < aspect < 2.0 and h < 1200 and w < 1200:
            return DocumentType.nameplate
        return DocumentType.generic
