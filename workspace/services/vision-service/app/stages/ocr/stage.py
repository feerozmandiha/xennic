"""Hybrid OCR: PaddleOCR → Tesseract fallback → Vision LLM context."""
from __future__ import annotations

from typing import Any

import numpy as np

from app.config.settings import settings
from app.core.stage import PipelineStage
from app.core.result import StageResult
from app.stages.ocr.paddle_ocr import PaddleOCREngine
from app.stages.ocr.tesseract_ocr import TesseractOCREngine
from app.stages.ocr.vision_llm import VisionLLMEngine


class OCRStage(PipelineStage):
    """Multi-engine OCR with cascade fallback:
    - auto/hybrid: PaddleOCR → Tesseract → LLM
    - tesseract:  Tesseract only
    - paddle:     PaddleOCR only
    - llm:        LLM only
    """

    def __init__(self) -> None:
        super().__init__("OCR")
        self._paddle = PaddleOCREngine.get_instance()
        self._tesseract = TesseractOCREngine.get_instance()
        self._llm = VisionLLMEngine()
        self._mode = settings.ocr_engine_mode

    async def process(
        self,
        image: np.ndarray,
        context: dict[str, Any],
    ) -> tuple[np.ndarray, StageResult]:
        doc_type = context.get("document_type", context.get("detected_type", "generic"))
        raw_text_blocks: list[dict[str, Any]] = []
        errors: list[str] = []
        engine_used = "none"

        # --- Engine cascade ---
        if self._mode in ("paddle", "hybrid", "auto"):
            try:
                raw_text_blocks = await self._paddle.recognize(image)
                if raw_text_blocks:
                    engine_used = "paddle"
                    errors.clear()  # previous engine succeeded — clear
            except Exception as e:
                errors.append(f"PaddleOCR: {e}")

        if not raw_text_blocks and self._mode in ("auto", "hybrid", "tesseract"):
            try:
                raw_text_blocks = await self._tesseract.recognize(image)
                if raw_text_blocks:
                    engine_used = "tesseract"
                    errors.clear()  # fallback succeeded — clear
            except Exception as e:
                errors.append(f"Tesseract: {e}")

        if self._mode in ("llm", "hybrid", "auto"):
            try:
                llm_result = await self._llm.analyze(image, doc_type=doc_type)
            except Exception as e:
                if self._mode == "llm":
                    return image, StageResult(
                        name=self.name, success=False, confidence=0.0,
                        errors=[f"LLM OCR failed: {e}"],
                    )
        else:
            llm_result = None

        # --- Confidence ---
        paddle_confidence = 0.0
        if raw_text_blocks:
            paddle_confidence = float(
                np.mean([b.get("confidence", 0) for b in raw_text_blocks])
            )

        llm_confidence = (
            float(llm_result.get("confidence", 0))
            if llm_result and llm_result.get("success")
            else 0.0
        )

        confidence = max(paddle_confidence, llm_confidence) if paddle_confidence or llm_confidence else 0.0
        combined_text = " ".join(b["text"] for b in raw_text_blocks)

        if llm_result and llm_result.get("success"):
            llm_data = llm_result.get("data", {})
            llm_text = llm_data.get("text", llm_data.get("extracted_text", ""))
            if llm_text:
                combined_text = combined_text + "\n" + llm_text if combined_text else llm_text

        context["ocr_raw_blocks"] = raw_text_blocks
        context["ocr_llm_result"] = llm_result
        context["ocr_text"] = combined_text
        context["ocr_engine"] = engine_used

        return image, StageResult(
            name=self.name,
            success=True,
            confidence=float(confidence),
            data={
                "text_blocks": raw_text_blocks,
                "llm_result": llm_result,
                "combined_text": combined_text,
                "confidence": float(confidence),
                "engine": engine_used,
                "errors": errors,
            },
        )
