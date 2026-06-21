"""Nameplate field extractor — Persian + English support."""
from __future__ import annotations

import re
from typing import Any

import numpy as np

from app.core.stage import PipelineStage
from app.core.result import StageResult
from app.schemas.nameplate import NameplateData


PERSIAN_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")
ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")


def _normalize_digits(text: str) -> str:
    text = text.translate(PERSIAN_DIGITS)
    text = text.translate(ARABIC_DIGITS)
    return text


class NameplateExtractor(PipelineStage):
    """Extract nameplate fields from OCR text + LLM result."""

    PATTERNS: dict[str, list[re.Pattern]] = {
        "manufacturer": [
            re.compile(r"(?:manufacturer|mfr|made|سازنده|تولید کننده|کارخانه|شرکت)\s*[:.\-]?\s*([A-Za-zآ-ی]{2,30})", re.I),
        ],
        "model": [
            re.compile(r"(?:model|type|typ|مدل|نوع)\s*[:.\-]?\s*(\S{3,30})", re.I),
        ],
        "serial": [
            re.compile(r"(?:s/n|serial\s*(?:no|num)?|سریال|شماره سریال|شماره فنی)\s*[:.\-]?\s*(\S{4,30})", re.I),
            re.compile(r"SER\s*[:.\-]?\s*(\S{4,30})", re.I),
        ],
        "year": [
            re.compile(r"(?:year|سال|ساخت\s*\d{4}|تاریخ\s*ساخت)\s*[:.\-]?\s*(\d{4})", re.I),
        ],
        "power_kw": [
            re.compile(r"\b(\d+[.,]?\d*)\s*(?:kw|ک‌وات|کیلووات)\b", re.I),
        ],
        "power_hp": [
            re.compile(r"\b(\d+[.,]?\d*)\s*(?:hp|اسب بخار)\b", re.I),
        ],
        "voltage": [
            re.compile(r"\b(\d{3,4})\s*V(?:olts?)?\b", re.I),
            re.compile(r"VOLT\s*[:.\-]?\s*(\d{3,4})", re.I),
            re.compile(r"(?:ولتاژ|ولت)\s*[:.\-]?\s*(\d{3,4})", re.I),
        ],
        "current": [
            re.compile(r"CURRENT\s*[:.\-]?\s*(\d+[.,]?\d*)", re.I),
            re.compile(r"\b(\d+[.,]?\d*)\s*A\b(?![A-Za-z0-9])", re.I),
            re.compile(r"(?:جریان|آمپر)\s*[:.\-]?\s*(\d+[.,]?\d*)", re.I),
        ],
        "frequency": [
            re.compile(r"(\d{2})\s*(?:Hz|HZ|هرتز)", re.I),
        ],
        "speed_rpm": [
            re.compile(r"(?:SPEED|RPM|دور)\s*[:.\-]?\s*(\d{3,5})\s*(?:RPM|r\.?\s*p\.?\s*m\.?|دور بر دقیقه|دقیقه)", re.I),
        ],
        "poles": [
            re.compile(r"(\d)\s*(?:POLE|P\b|قطب)", re.I),
        ],
        "insulation_class": [
            re.compile(r"(?:CLASS|INS|INSULATION|کلاس عایقی|طبقه عایقی)\s*[:.\-]?\s*([A-Z])\b", re.I),
        ],
        "duty_type": [
            re.compile(r"\bDUTY\s*[:.\-]?\s*(S\d)", re.I),
            re.compile(r"(?:نوع کار|کار)\s*[:.\-]?\s*(S\d)", re.I),
        ],
        "enclosure": [
            re.compile(r"\b(IP\d{2})\b", re.I),
            re.compile(r"(NEMA\s*\d+)", re.I),
        ],
        "connection": [
            re.compile(r"(?:CONNECTION|CONN\.?|اتصال|نوع اتصال)\s*[:.\-]?\s*(\S{3,20})", re.I),
        ],
        "efficiency": [
            re.compile(r"(\d{2}[.,]?\d*)\s*(?:%|EFF|بازده|راندمان)", re.I),
            re.compile(r"EFF\.?\s*[:.\-]?\s*(\d{2}[.,]?\d*)", re.I),
        ],
    }

    FIELD_MAP: dict[str, str] = {
        "manufacturer": "manufacturer",
        "model": "model",
        "serial": "serial_number",
        "year": "year_of_manufacture",
        "power_kw": "power_kw",
        "power_hp": "power_hp",
        "voltage": "voltage_v",
        "current": "current_a",
        "frequency": "frequency_hz",
        "speed_rpm": "speed_rpm",
        "poles": "poles",
        "insulation_class": "insulation_class",
        "duty_type": "duty_type",
        "enclosure": "enclosure_type",
        "connection": "connection_type",
        "efficiency": "efficiency_pct",
    }

    async def process(
        self,
        image: np.ndarray,
        context: dict[str, Any],
    ) -> tuple[np.ndarray, StageResult]:
        combined_text: str = context.get("ocr_text", "")
        llm_result: dict[str, Any] | None = context.get("ocr_llm_result")

        extracted: dict[str, Any] = {}

        for field, patterns in self.PATTERNS.items():
            for pat in patterns:
                m = pat.search(combined_text)
                if m:
                    target = self.FIELD_MAP.get(field, field)
                    val = m.group(1).strip()
                    if val:
                        extracted[target] = val
                    break

        if llm_result and llm_result.get("success"):
            llm_data = llm_result.get("data", {})
            for key in NameplateData.model_fields:
                if key in llm_data and llm_data[key] is not None:
                    extracted[key] = llm_data[key]

        # Sanitize types
        sanitized: dict[str, Any] = {}
        type_map: dict[str, type] = {
            "power_kw": float, "power_hp": float, "voltage_v": float,
            "current_a": float, "frequency_hz": float, "efficiency_pct": float,
            "power_factor": float, "speed_rpm": int, "poles": int,
            "year_of_manufacture": int,
        }
        for key, val in extracted.items():
            if isinstance(val, str):
                val = _normalize_digits(val)
            if key in type_map:
                try:
                    sanitized[key] = type_map[key](str(val).replace(",", "."))
                except (ValueError, TypeError):
                    sanitized[key] = val
            else:
                sanitized[key] = val

        nameplate = NameplateData(**{
            k: v for k, v in sanitized.items()
            if k in NameplateData.model_fields
        })
        for k, v in sanitized.items():
            if k not in NameplateData.model_fields:
                nameplate.extra_fields[k] = str(v)

        non_null = sum(
            1 for val in nameplate.model_dump(exclude={"extra_fields"}).values()
            if val is not None
        )
        total = len(NameplateData.model_fields) - 1
        confidence = min(1.0, non_null / max(total, 1))

        context["extracted_data"] = nameplate.model_dump()
        context["extraction_confidence"] = float(confidence)

        return image, StageResult(
            name=self.name,
            success=True,
            confidence=float(confidence),
            data={"nameplate": nameplate.model_dump()},
        )
