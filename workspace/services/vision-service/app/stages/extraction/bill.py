"""Electricity bill field extractor — Persian + English support."""
from __future__ import annotations

import re
from typing import Any

import numpy as np

from app.core.stage import PipelineStage
from app.core.result import StageResult
from app.schemas.bill import BillData


# Persian/Arabic digit mapping
PERSIAN_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")
ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")


def _normalize_digits(text: str) -> str:
    text = text.translate(PERSIAN_DIGITS)
    text = text.translate(ARABIC_DIGITS)
    return text


def _parse_num(val: str) -> float | None:
    val = _normalize_digits(val.strip())
    val = val.replace(",", "").replace("٬", "")
    try:
        return float(val)
    except ValueError:
        return None


class BillExtractor(PipelineStage):
    """Extract bill fields from OCR text + LLM result."""

    PATTERNS: dict[str, list[re.Pattern]] = {
        "bill_number": [
            re.compile(r"(?:bill|invoice|شماره اشتراک|شماره حساب|شماره قبض|شماره)\s*(?:no|number|#)?\s*[:.\-]?\s*(\S{5,30})", re.I),
        ],
        "customer_name": [
            re.compile(r"(?:customer|مشتری|نام مشترک|نام)\s*(?:name)?\s*[:.\-]?\s*(.{3,60})", re.I),
        ],
        "customer_id": [
            re.compile(r"(?:کد اشتراک|کد مشترک|شناسه)\s*[:.\-]?\s*(\d[\d\-]+\d)", re.I),
        ],
        "address": [
            re.compile(r"(?:address|نشانی|آدرس)\s*[:.\-]?\s*(.{10,})", re.I),
        ],
        "billing_period": [
            re.compile(r"(?:دوره|billing period|دوره صورتحساب)\s*[:.\-]?\s*(.{5,30})", re.I),
        ],
        "issue_date": [
            re.compile(r"(?:تاریخ صدور|تاریخ|issue date)\s*[:.\-]?\s*(\d{4}/\d{1,2}/\d{1,2})", re.I),
            re.compile(r"(?:تاریخ صدور|تاریخ|issue date)\s*[:.\-]?\s*(\d{4}-\d{1,2}-\d{1,2})", re.I),
        ],
        "due_date": [
            re.compile(r"(?:due date|سررسید|تاریخ سررسید|پرداخت تا)\s*[:.\-]?\s*(.{6,20})", re.I),
        ],
        "previous_reading": [
            re.compile(r"(?:قرائت قبل|قرائت قبلی|قبلی|previous|prior)\s*(?:reading|متر)?\s*[:.\-]?\s*(\d[\d,.\s]*)", re.I),
        ],
        "current_reading": [
            re.compile(r"(?:قرائت فعلی|قرائت حال|فعلی|current|present)\s*(?:reading|متر)?\s*[:.\-]?\s*(\d[\d,.\s]*)", re.I),
        ],
        "consumption": [
            re.compile(r"(?:مصرف|consumption|usage|مصرف کل)\s*[:.\-]?\s*(\d+[.,]?\d*)", re.I),
        ],
        "total_amount": [
            re.compile(r"(?:مبلغ قابل پرداخت|جمع کل|جمع|total payable|total amount|total)\s*[:.\-]?\s*(\d[\d,.\s]*)", re.I),
        ],
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
                    val = m.group(1).strip()
                    if val:
                        extracted[field] = val
                        break

        if llm_result and llm_result.get("success"):
            llm_data = llm_result.get("data", {})
            for key in BillData.model_fields:
                if key not in extracted and key in llm_data and llm_data[key] is not None:
                    extracted[key] = llm_data[key]

        # Field name mapping → BillData fields
        field_map: dict[str, str] = {
            "bill_number": "bill_number",
            "customer_name": "customer_name",
            "customer_id": "customer_id",
            "address": "address",
            "billing_period": "billing_period",
            "issue_date": "issue_date",
            "due_date": "due_date",
            "previous_reading": "previous_reading_kwh",
            "current_reading": "current_reading_kwh",
            "consumption": "consumption_kwh",
            "total_amount": "total_amount",
        }

        float_fields = {
            "previous_reading_kwh", "current_reading_kwh", "consumption_kwh",
            "average_daily_consumption", "energy_charge", "transmission_charge",
            "distribution_charge", "tax", "other_charges", "total_amount",
        }

        final: dict[str, Any] = {}
        for k, v in extracted.items():
            target = field_map.get(k, k)
            if target in float_fields:
                parsed = _parse_num(v)
                if parsed is not None:
                    final[target] = parsed
                else:
                    final[target] = v
            else:
                final[target] = v

        bill = BillData(**{k: v for k, v in final.items() if k in BillData.model_fields})
        for k, v in final.items():
            if k not in BillData.model_fields:
                bill.extra_fields[k] = str(v)

        non_null = sum(
            1 for val in bill.model_dump(exclude={"line_items", "extra_fields"}).values()
            if val is not None
        )
        total = len(BillData.model_fields) - 2
        confidence = min(1.0, non_null / max(total, 1))

        context["extracted_data"] = bill.model_dump()
        context["extraction_confidence"] = float(confidence)

        return image, StageResult(
            name=self.name,
            success=True,
            confidence=float(confidence),
            data={"bill": bill.model_dump()},
        )
