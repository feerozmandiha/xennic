# src/api/routers/bill_ocr.py
"""
Bill OCR API Endpoints

POST /api/v1/engineering/energy/ocr-bill
  آپلود PDF/تصویر قبض برق → OCR → تحلیل pandapower

POST /api/v1/engineering/energy/ocr-preview
  فقط استخراج داده، بدون تحلیل

POST /api/v1/engineering/energy/manual-analyze
  ورود دستی داده قبض → تحلیل مستقیم (بدون OCR)
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional
from pydantic import BaseModel

from src.calculators.energy_analyzer.bill_ocr import BillOCREngine
from src.calculators.energy_analyzer import EnergyAnalyzerCalculator, EnergyAnalyzerInput

router    = APIRouter(prefix="/api/v1/engineering", tags=["Bill OCR"])
_analyzer = EnergyAnalyzerCalculator()

MAX_FILE_SIZE = 10 * 1024 * 1024   # 10 MB

ALLOWED_TYPES = {
    "application/pdf":          "pdf",
    "image/jpeg":               "image",
    "image/jpg":                "image",
    "image/png":                "image",
    "image/webp":               "image",
    "application/octet-stream": "image",
}


def _detect_file_type(file: UploadFile) -> str:
    ct = (file.content_type or "").lower().split(";")[0].strip()
    if ct in ALLOWED_TYPES:
        return ALLOWED_TYPES[ct]
    name = (file.filename or "").lower()
    if name.endswith(".pdf"):
        return "pdf"
    if name.endswith((".jpg", ".jpeg", ".png", ".webp")):
        return "image"
    return "image"


def _build_analysis_input(norm: dict) -> Optional[EnergyAnalyzerInput]:
    """ساخت EnergyAnalyzerInput از داده normalize شده"""
    kwh = norm.get("kwh_consumed")
    if not kwh:
        return None
    try:
        return EnergyAnalyzerInput(
            subscriber_type        = norm.get("subscriber_type", "residential"),
            tariff_code            = norm.get("tariff_code", "tavanir_residential"),
            climate_zone           = norm.get("climate_zone", "moderate"),
            contract_type          = norm.get("contract_type", "normal"),
            voltage_level          = norm.get("voltage_level", "LV"),
            supply_voltage_kv      = float(norm.get("supply_voltage_kv", 0.4)),
            current_kwh            = float(kwh),
            billing_days           = int(norm.get("billing_days", 30)),
            current_peak_kw        = norm.get("current_peak_kw"),
            maximeter_kw           = norm.get("maximeter_kw"),
            contract_kw            = norm.get("contract_kw"),
            current_kvarh          = norm.get("kvarh_consumed"),
            peak_kwh               = norm.get("peak_kwh"),
            mid_kwh                = norm.get("mid_kwh"),
            off_peak_kwh           = norm.get("off_peak_kwh"),
            peak_kwh_friday        = norm.get("peak_kwh_friday"),
            power_factor_measured  = norm.get("power_factor"),
            amount_rials           = norm.get("amount_rials"),
        )
    except (ValueError, TypeError) as exc:
        raise ValueError(f"ساخت ورودی تحلیل ناموفق: {exc}") from exc


# ── POST /energy/ocr-bill ─────────────────────────────────────────────────────

@router.post(
    "/energy/ocr-bill",
    summary="OCR + تحلیل قبض برق (PDF/تصویر)",
)
async def ocr_bill(
    file:         UploadFile = File(..., description="فایل PDF یا تصویر قبض برق"),
    run_analysis: str        = Form(default="true"),
):
    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail={"code": "FILE_TOO_LARGE", "message": "حجم فایل بیش از ۱۰ مگابایت است"},
        )
    if len(file_bytes) < 10:
        raise HTTPException(
            status_code=400,
            detail={"code": "EMPTY_FILE", "message": "فایل خالی است"},
        )

    file_type  = _detect_file_type(file)
    ocr_result = await BillOCREngine.process(file_bytes, file_type)

    # ── تحلیل ──────────────────────────────────────────────────────────────
    analysis_result = None
    do_analyze = run_analysis.lower() in ("true", "1", "yes")
    norm = ocr_result.get("normalized", {})
    kwh  = norm.get("kwh_consumed")

    if do_analyze and kwh:
        try:
            inputs          = _build_analysis_input(norm)
            analysis_result = _analyzer.calculate(inputs)
        except (ValueError, KeyError, RuntimeError, TypeError) as exc:
            analysis_result = {"error": str(exc), "note": "تحلیل ناموفق"}

    ocr_section = {
        "method":      ocr_result.get("method", "unknown"),
        "ocr_success": ocr_result.get("success", False),
        "kwh_found":   bool(kwh),
        "extracted":   ocr_result.get("extracted", {}),
        "normalized":  norm,
        "warnings":    ocr_result.get("warnings", []),
        "raw_text_preview": ocr_result.get("raw_text", "")[:300] if not bool(kwh) else "",
    }

    return {
        "success": True,
        "file": {
            "name":         file.filename,
            "type":         file_type,
            "size_kb":      round(len(file_bytes) / 1024, 1),
            "content_type": file.content_type or "unknown",
        },
        "ocr":      ocr_section,
        "analysis": analysis_result,
        "manual_entry_required": not bool(kwh),
        "manual_hint": (
            None if kwh else
            "OCR نتوانست مصرف kWh را استخراج کند. "
            "مقادیر زیر را از قبض پیدا کرده و در فرم وارد کنید:\n"
            "• مصرف kWh (عدد روی قبض کنار 'مصرف' یا 'kWh')\n"
            "• مبلغ قابل پرداخت (ریال)\n"
            "• تعداد روز دوره"
        ),
    }


# ── POST /energy/manual-analyze ───────────────────────────────────────────────

class ManualBillInput(BaseModel):
    """ورود دستی داده قبض — کامل با TOU و منطقه"""
    kwh_consumed:        float
    billing_days:        int          = 30
    subscriber_type:     str          = "residential"
    tariff_code:         str          = "tavanir_residential"
    climate_zone:        str          = "moderate"
    contract_type:       str          = "normal"
    voltage_level:       str          = "LV"
    supply_voltage_kv:   float        = 0.4
    # ماکسیمتر
    current_peak_kw:     Optional[float] = None
    maximeter_kw:        Optional[float] = None
    contract_kw:         Optional[float] = None
    # راکتیو
    kvarh_consumed:      Optional[float] = None
    power_factor:        Optional[float] = None
    # TOU
    peak_kwh:            Optional[float] = None
    mid_kwh:             Optional[float] = None
    off_peak_kwh:        Optional[float] = None
    peak_kwh_friday:     Optional[float] = None
    # مبلغ
    amount_rials:        Optional[float] = None
    # شبکه
    transformer_kva:     Optional[float] = None
    cable_length_m:      Optional[float] = None
    cable_size_mm2:      Optional[float] = None


@router.post(
    "/energy/manual-analyze",
    summary="تحلیل با ورود دستی داده قبض",
)
async def manual_analyze(body: ManualBillInput):
    """
    وقتی OCR نتوانست kWh را پیدا کند، کاربر داده را دستی وارد می‌کند.
    این endpoint مستقیم EnergyAnalyzer را اجرا می‌کند.
    """
    try:
        inputs = EnergyAnalyzerInput(
            subscriber_type        = body.subscriber_type,
            tariff_code            = body.tariff_code,
            climate_zone           = body.climate_zone,
            contract_type          = body.contract_type,
            voltage_level          = body.voltage_level,
            supply_voltage_kv      = body.supply_voltage_kv,
            current_kwh            = body.kwh_consumed,
            billing_days           = body.billing_days,
            current_peak_kw        = body.current_peak_kw,
            maximeter_kw           = body.maximeter_kw,
            contract_kw            = body.contract_kw,
            current_kvarh          = body.kvarh_consumed,
            power_factor_measured  = body.power_factor,
            amount_rials           = body.amount_rials,
            peak_kwh               = body.peak_kwh,
            mid_kwh                = body.mid_kwh,
            off_peak_kwh           = body.off_peak_kwh,
            peak_kwh_friday        = body.peak_kwh_friday,
            transformer_kva        = body.transformer_kva,
            cable_length_m         = body.cable_length_m,
            cable_size_mm2         = body.cable_size_mm2,
        )
        result = _analyzer.calculate(inputs)
        return {
            "success":  True,
            "source":   "manual_entry",
            "analysis": result,
            "ocr": {
                "method":      "manual",
                "ocr_success": True,
                "kwh_found":   True,
                "normalized": {
                    "kwh_consumed":    body.kwh_consumed,
                    "billing_days":    body.billing_days,
                    "subscriber_type": body.subscriber_type,
                    "climate_zone":    body.climate_zone,
                    "contract_type":   body.contract_type,
                    "current_peak_kw": body.current_peak_kw,
                    "maximeter_kw":    body.maximeter_kw,
                    "contract_kw":     body.contract_kw,
                    "power_factor":    body.power_factor,
                    "amount_rials":    body.amount_rials,
                    "peak_kwh":        body.peak_kwh,
                    "mid_kwh":         body.mid_kwh,
                    "off_peak_kwh":    body.off_peak_kwh,
                    "peak_kwh_friday": body.peak_kwh_friday,
                },
                "warnings": [],
            },
        }
    except (ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=422,
            detail={"code": "INVALID_INPUT", "message": str(exc)},
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={"code": "ANALYSIS_ERROR", "message": str(exc)},
        ) from exc


# ── POST /energy/ocr-preview ──────────────────────────────────────────────────

@router.post(
    "/energy/ocr-preview",
    summary="پیش‌نمایش OCR (بدون تحلیل)",
)
async def ocr_preview(file: UploadFile = File(...)):
    file_bytes = await file.read()
    if len(file_bytes) < 10:
        raise HTTPException(status_code=400, detail={"code": "EMPTY_FILE"})

    file_type  = _detect_file_type(file)
    ocr_result = await BillOCREngine.process(file_bytes, file_type)

    return {
        "success":    ocr_result.get("success", False),
        "method":     ocr_result.get("method", "unknown"),
        "extracted":  ocr_result.get("extracted", {}),
        "normalized": ocr_result.get("normalized", {}),
        "warnings":   ocr_result.get("warnings", []),
        "raw_text_preview": ocr_result.get("raw_text", "")[:500],
    }
