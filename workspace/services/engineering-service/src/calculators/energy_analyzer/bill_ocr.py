# src/calculators/energy_analyzer/bill_ocr.py
"""
Bill OCR Engine — استخراج داده از قبض برق ایران

روش کار (اولویت‌بندی):
  ۱. PDF text layer  → regex دقیق (بدون Tesseract)
  ۲. PDF → image → pytesseract (اگر نصب باشد)
  ۳. Groq AI (llama-3.1-8b)  → parse هوشمند (fallback نهایی)

پشتیبانی از قبض‌های:
  - شرکت برق منطقه‌ای / توزیع
  - قبض PDF با text layer
  - قبض اسکن‌شده (تصویر)
"""

import os
import re
import json
import base64
import logging
import unicodedata
from io import BytesIO
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _fa2en(text: str) -> str:
    """تبدیل اعداد فارسی/عربی به انگلیسی"""
    fa = "۰۱۲۳۴۵۶۷۸۹"
    ar = "٠١٢٣٤٥٦٧٨٩"
    for i, (f, a) in enumerate(zip(fa, ar)):
        text = text.replace(f, str(i)).replace(a, str(i))
    return text


def _clean_num(s: str) -> Optional[float]:
    """تبدیل رشته عددی (با کاما، فارسی) به float"""
    try:
        s = _fa2en(str(s)).replace(",", "").replace("٬", "").replace(" ", "").strip()
        return float(s)
    except (ValueError, TypeError):
        return None


def _get_api_key() -> str:
    return (
        os.environ.get("GROQ_API_KEY") or
        os.environ.get("AI_API_KEY") or
        ""
    )


# ─────────────────────────────────────────────────────────────────────────────
# Iranian Bill Regex Parser — نسخه جامع
# ─────────────────────────────────────────────────────────────────────────────

class IranianBillParser:
    """
    پارسر regex برای قبض‌های برق ایران
    پشتیبانی از فرمت‌های مختلف شرکت‌های توزیع
    """

    # ── kWh مصرف ─────────────────────────────────────────────────────────────
    KWH_PATTERNS: List[str] = [
        # فرمت‌های فارسی
        r"مصرف\s*(?:این\s*دوره\s*)?[:\s،]+\s*([0-9۰-۹,،٬\s]+)\s*(?:کیلو\s*وات|kwh|kWh|KWH)",
        r"([0-9۰-۹,،٬]+)\s*کیلو\s*وات\s*ساعت",
        r"جمع\s*مصرف\s*[:\s]+([0-9۰-۹,،٬]+)",
        r"مصرف\s*کل\s*[:\s]+([0-9۰-۹,،٬]+)",
        r"انرژی\s*مصرفی\s*[:\s]+([0-9۰-۹,،٬]+)",
        r"مقدار\s*مصرف\s*[:\s]+([0-9۰-۹,،٬]+)",
        # نام جدول‌گونه در PDF
        r"(?:kwh|KWH|kWh)\s*[:\s|]+([0-9۰-۹,،٬]+)",
        r"([0-9۰-۹,،٬]{3,})\s*(?:kwh|KWH|kWh)",
        # فرمت عددی صرف (اگر بعد از "مصرف" باشد)
        r"(?:مصرف|Consumption)[^\d]{0,20}([0-9۰-۹,،٬]{3,8})",
        # پیک و آف‌پیک — جمع
        r"جمع\s*(?:کل\s*)?انرژی\s*[:\s]+([0-9۰-۹,،٬]+)",
        # خوانش کنتور
        r"(?:خوانش\s*)?(?:جاری|فعلی)\s*[:\s]+([0-9۰-۹,،٬]+).*(?:قبلی\s*[:\s]+([0-9۰-۹,،٬]+))",
    ]

    # ── مبلغ قبض ─────────────────────────────────────────────────────────────
    AMOUNT_PATTERNS: List[str] = [
        r"(?:مبلغ\s*)?قابل\s*پرداخت\s*[:\s]+([0-9۰-۹,،٬]+)\s*(?:ریال|تومان)?",
        r"جمع\s*کل\s*[:\s]+([0-9۰-۹,،٬]+)\s*(?:ریال|تومان)?",
        r"مبلغ\s*(?:نهایی|کل|قبض)\s*[:\s]+([0-9۰-۹,،٬]+)",
        r"بدهی\s*(?:جاری|کل)\s*[:\s]+([0-9۰-۹,،٬]+)",
        r"([0-9۰-۹,،٬]{6,})\s*ریال",
        r"مجموع\s*[:\s]+([0-9۰-۹,،٬]{5,})",
    ]

    # ── توان اوج / demand ────────────────────────────────────────────────────
    PEAK_KW_PATTERNS: List[str] = [
        r"(?:حداکثر\s*|بیشینه\s*)?توان\s*(?:اوج|بیشینه|حداکثر)\s*[:\s]+([0-9۰-۹,.]+)\s*(?:کیلو\s*وات|kw|KW)",
        r"(?:maximum|max)\s*demand\s*[:\s]+([0-9۰-۹,.]+)\s*(?:kw|KW)?",
        r"demand\s*[:\s]+([0-9۰-۹,.]+)",
        r"بیشینه\s*بار\s*[:\s]+([0-9۰-۹,.]+)",
        r"([0-9۰-۹,.]+)\s*(?:kw|KW)\s*(?:اوج|demand)",
    ]

    # ── ضریب قدرت ────────────────────────────────────────────────────────────
    PF_PATTERNS: List[str] = [
        r"ضریب\s*(?:توان|قدرت)\s*[:\s]+([0-9۰-۹.]+)",
        r"(?:cos|Cos|COS)\s*[φϕfi]?\s*[:\s=]+\s*([0-9.]+)",
        r"power\s*factor\s*[:\s]+([0-9.]+)",
        r"PF\s*[:\s=]+([0-9.]+)",
    ]

    # ── kVArh ────────────────────────────────────────────────────────────────
    KVARH_PATTERNS: List[str] = [
        r"(?:کیلو\s*وار|kvarh|kVArh|KVARH)\s*[:\s]+([0-9۰-۹,،٬]+)",
        r"([0-9۰-۹,،٬]+)\s*(?:kvarh|kVArh|KVARH)",
        r"راکتیو\s*[:\s]+([0-9۰-۹,،٬]+)",
        r"توان\s*راکتیو\s*[:\s]+([0-9۰-۹,،٬]+)",
    ]

    # ── تعداد روز دوره ───────────────────────────────────────────────────────
    DAYS_PATTERNS: List[str] = [
        r"(?:تعداد\s*)?روز(?:های)?\s*(?:دوره\s*)?[:\s]+([0-9۰-۹]+)\s*روز",
        r"([0-9۰-۹]+)\s*روز(?:ه)?(?:\s*(?:دوره|مصرف))?",
        r"دوره\s*[0-9۰-۹]+\s*روز",
        r"period\s*[:\s]+([0-9]+)\s*days?",
    ]

    # ── توان قراردادی ────────────────────────────────────────────────────────
    CONTRACT_KW_PATTERNS: List[str] = [
        r"(?:توان|قدرت)\s*قرارداد(?:ی)?\s*[:\s]+([0-9۰-۹,.]+)\s*(?:کیلو\s*وات|kw|KW)?",
        r"contracted\s*(?:power|demand)\s*[:\s]+([0-9.]+)",
        r"قدرت\s*تقاضا\s*[:\s]+([0-9۰-۹,.]+)",
    ]

    # ── نام و شماره مشترک ────────────────────────────────────────────────────
    NAME_PATTERNS: List[str] = [
        r"نام\s*مشترک\s*[:\s]+([^\n\r]+)",
        r"مشترک\s*[:\s]+([^\n\r]+?)(?:\s*[-|]|$)",
        r"subscriber\s*name\s*[:\s]+([^\n\r]+)",
    ]
    METER_PATTERNS: List[str] = [
        r"شماره\s*(?:کنتور|اشتراک|قرارداد|پرونده)\s*[:\s]+([0-9۰-۹\-]+)",
        r"(?:meter|کنتور)\s*(?:no|number|شماره)?\s*[:\s]+([0-9۰-۹\-]+)",
    ]

    @classmethod
    def parse(cls, text: str) -> Dict[str, Any]:
        """پارس کامل متن قبض"""
        # نرمال‌سازی متن
        text = unicodedata.normalize("NFC", text)
        text_en = _fa2en(text)          # نسخه با اعداد انگلیسی
        data: Dict[str, Any] = {}

        # ── kWh ──────────────────────────────────────────────────────────────
        kwh = cls._extract_kwh(text, text_en)
        if kwh:
            data["kwh_consumed"] = kwh

        # ── مبلغ ─────────────────────────────────────────────────────────────
        for pat in cls.AMOUNT_PATTERNS:
            m = re.search(pat, text_en, re.IGNORECASE | re.MULTILINE)
            if m:
                v = _clean_num(m.group(1))
                if v and v > 1000:
                    # اگر "تومان" در الگو بود ×10
                    if "تومان" in pat:
                        v *= 10
                    data["amount_rials"] = v
                    break

        # ── توان اوج ─────────────────────────────────────────────────────────
        for pat in cls.PEAK_KW_PATTERNS:
            m = re.search(pat, text_en, re.IGNORECASE)
            if m:
                v = _clean_num(m.group(1))
                if v and 0.1 <= v <= 100_000:
                    data["current_peak_kw"] = v
                    break

        # ── ضریب قدرت ────────────────────────────────────────────────────────
        for pat in cls.PF_PATTERNS:
            m = re.search(pat, text_en, re.IGNORECASE)
            if m:
                v = _clean_num(m.group(1))
                if v and 0.1 <= v <= 1.0:
                    data["power_factor"] = v
                    break

        # ── kVArh ────────────────────────────────────────────────────────────
        for pat in cls.KVARH_PATTERNS:
            m = re.search(pat, text_en, re.IGNORECASE)
            if m:
                v = _clean_num(m.group(1))
                if v and v >= 0:
                    data["kvarh_consumed"] = v
                    break

        # ── تعداد روز ────────────────────────────────────────────────────────
        for pat in cls.DAYS_PATTERNS:
            m = re.search(pat, text_en, re.IGNORECASE)
            if m:
                v = _clean_num(m.group(1))
                if v and 1 <= v <= 366:
                    data["billing_days"] = int(v)
                    break

        # ── توان قراردادی ────────────────────────────────────────────────────
        for pat in cls.CONTRACT_KW_PATTERNS:
            m = re.search(pat, text_en, re.IGNORECASE)
            if m:
                v = _clean_num(m.group(1))
                if v and 0.1 <= v <= 100_000:
                    data["contract_kw"] = v
                    break

        # ── نوع مشترک از کلیدواژه ────────────────────────────────────────────
        if re.search(r"صنعتی|industrial", text, re.IGNORECASE):
            data.setdefault("subscriber_type", "industrial")
            data.setdefault("tariff_code", "tavanir_industrial")
        elif re.search(r"تجاری|عمومی|commercial", text, re.IGNORECASE):
            data.setdefault("subscriber_type", "commercial")
            data.setdefault("tariff_code", "tavanir_commercial")
        elif re.search(r"کشاورزی|agricultural", text, re.IGNORECASE):
            data.setdefault("subscriber_type", "agricultural")
            data.setdefault("tariff_code", "tavanir_agricultural")
        else:
            data.setdefault("subscriber_type", "residential")
            data.setdefault("tariff_code", "tavanir_residential")

        # ── اطلاعات متنی ─────────────────────────────────────────────────────
        for pat in cls.NAME_PATTERNS:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                name = m.group(1).strip()
                if len(name) > 2:
                    data["subscriber_name"] = name
                    break

        for pat in cls.METER_PATTERNS:
            m = re.search(pat, text_en, re.IGNORECASE)
            if m:
                data["meter_number"] = m.group(1).strip()
                break

        return data

    @classmethod
    def _extract_kwh(cls, text: str, text_en: str) -> Optional[float]:
        """استخراج mصرف kWh — با روش‌های چندگانه"""

        # روش ۱: pattern های عادی
        for pat in cls.KWH_PATTERNS:
            # اگر pattern دو گروه دارد (خوانش کنتور)
            if r"([0-9۰-۹,،٬]+).*قبلی" in pat or "قبلی" in pat:
                m = re.search(pat, text_en, re.IGNORECASE | re.DOTALL)
                if m and len(m.groups()) >= 2:
                    current = _clean_num(m.group(1))
                    previous = _clean_num(m.group(2))
                    if current and previous and current > previous:
                        diff = current - previous
                        if 1 <= diff <= 1_000_000:
                            return diff
                continue

            m = re.search(pat, text_en, re.IGNORECASE | re.MULTILINE)
            if m:
                v = _clean_num(m.group(1))
                if v and 1 <= v <= 10_000_000:
                    return v

        # روش ۲: جستجوی اعداد بزرگ کنار واحد kWh در متن
        kwh_matches = re.findall(
            r"([0-9,،٬]{1,10})\s*(?:kwh|kWh|KWH|کیلو\s*وات\s*ساعت)",
            text_en, re.IGNORECASE
        )
        for raw in kwh_matches:
            v = _clean_num(raw)
            if v and 10 <= v <= 5_000_000:
                return v

        # روش ۳: خوانش کنتور (جدید - قدیم)
        # عبارت‌هایی مثل: "12345   11234" بین "جاری" و "قبلی"
        meter_block = re.search(
            r"(?:خوانش|کنتور|قرائت)[^\d]{0,50}([0-9,۰-۹]{4,})[^\d]{1,30}([0-9,۰-۹]{4,})",
            text_en, re.IGNORECASE | re.DOTALL
        )
        if meter_block:
            g1 = _clean_num(meter_block.group(1))
            g2 = _clean_num(meter_block.group(2))
            if g1 and g2:
                diff = abs(g1 - g2)
                if 1 <= diff <= 1_000_000:
                    return diff

        # روش ۴: جدول — ردیف‌هایی با عدد ۳-۷ رقمی بین ۱۰ تا ۵۰۰۰۰۰
        lines = text_en.split("\n")
        candidates = []
        for i, line in enumerate(lines):
            # اگر خط حاوی کلمه کلیدی و عدد است
            if re.search(r"(?:مصرف|kwh|انرژی|consumption)", line, re.IGNORECASE):
                nums = re.findall(r"[0-9]{3,8}", line)
                for n in nums:
                    v = float(n)
                    if 10 <= v <= 999999:
                        candidates.append(v)
        if candidates:
            # بزرگ‌ترین عدد منطقی
            return max(candidates)

        return None


# ─────────────────────────────────────────────────────────────────────────────
# Groq AI Fallback Parser
# ─────────────────────────────────────────────────────────────────────────────

class GroqBillParser:
    """
    استفاده از Groq llama-3.1-8b برای parse قبض وقتی regex شکست خورد
    """

    SYSTEM_PROMPT = """شما متخصص تجزیه قبض برق ایران هستید.
از متن قبض برق داده‌شده، اطلاعات زیر را استخراج کنید و دقیقاً به صورت JSON برگردانید.
اگر مقداری پیدا نشد، null قرار دهید. اعداد فارسی را به انگلیسی تبدیل کنید.

فرمت خروجی (فقط JSON، بدون توضیح اضافه):
{
  "kwh_consumed": عدد یا null,
  "amount_rials": عدد یا null,
  "billing_days": عدد یا null,
  "current_peak_kw": عدد یا null,
  "kvarh_consumed": عدد یا null,
  "power_factor": عدد یا null,
  "contract_kw": عدد یا null,
  "subscriber_type": "residential|commercial|industrial|agricultural",
  "subscriber_name": "متن یا null",
  "meter_number": "متن یا null"
}"""

    @classmethod
    async def parse(cls, text: str) -> Dict[str, Any]:
        api_key = _get_api_key()
        if not api_key:
            logger.warning("No Groq API key — skipping AI fallback")
            return {}

        # کوتاه کردن متن برای token limit
        text_truncated = text[:4000] if len(text) > 4000 else text

        try:
            import httpx
            payload = {
                "model": os.environ.get("AI_MODEL", "llama-3.1-8b-instant"),
                "messages": [
                    {"role": "system", "content": cls.SYSTEM_PROMPT},
                    {"role": "user", "content": f"متن قبض برق:\n\n{text_truncated}"},
                ],
                "temperature": 0.0,
                "max_tokens": 400,
                "response_format": {"type": "json_object"},
            }
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                if resp.status_code != 200:
                    logger.error("Groq error %s: %s", resp.status_code, resp.text[:200])
                    return {}

                content = resp.json()["choices"][0]["message"]["content"]
                parsed = json.loads(content)

                # پاک‌سازی
                clean: Dict[str, Any] = {}
                num_fields = ["kwh_consumed", "amount_rials", "billing_days",
                               "current_peak_kw", "kvarh_consumed", "power_factor", "contract_kw"]
                for f in num_fields:
                    v = parsed.get(f)
                    if v is not None:
                        fv = _clean_num(str(v))
                        if fv is not None:
                            clean[f] = fv
                for f in ["subscriber_type", "subscriber_name", "meter_number"]:
                    v = parsed.get(f)
                    if v and str(v).lower() not in ("null", "none", ""):
                        clean[f] = str(v)

                logger.info("Groq parsed fields: %s", list(clean.keys()))
                return clean

        except Exception as exc:
            logger.error("Groq bill parse error: %s", exc)
            return {}


# ─────────────────────────────────────────────────────────────────────────────
# BillOCREngine — ارکستراتور
# ─────────────────────────────────────────────────────────────────────────────

class BillOCREngine:

    # ── PDF → text layer ──────────────────────────────────────────────────────

    @staticmethod
    def _extract_text_from_pdf(pdf_bytes: bytes) -> str:
        """استخراج متن از text layer PDF — پشتیبانی از pypdf و pdfplumber"""

        # روش ۱: pdfplumber (دقیق‌تر برای جدول‌های PDF)
        try:
            import pdfplumber
            pages_text = []
            with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    # متن
                    t = page.extract_text(x_tolerance=3, y_tolerance=3) or ""
                    # جداول
                    for table in page.extract_tables():
                        if table:
                            for row in table:
                                if row:
                                    t += "\n" + "\t".join(str(c) for c in row if c)
                    pages_text.append(t)
            text = "\n".join(pages_text)
            if text.strip():
                logger.info("pdfplumber extracted %d chars", len(text))
                return text
        except ImportError:
            pass
        except Exception as exc:
            logger.error("pdfplumber: %s", exc)

        # روش ۲: pypdf
        try:
            import pypdf
            reader = pypdf.PdfReader(BytesIO(pdf_bytes))
            text = "\n".join(p.extract_text() or "" for p in reader.pages)
            if text.strip():
                logger.info("pypdf extracted %d chars", len(text))
                return text
        except ImportError:
            pass
        except Exception as exc:
            logger.error("pypdf: %s", exc)

        # روش ۳: PyMuPDF (fitz)
        try:
            import fitz  # pymupdf
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            text = "\n".join(page.get_text() for page in doc)
            if text.strip():
                logger.info("pymupdf extracted %d chars", len(text))
                return text
        except ImportError:
            pass
        except Exception as exc:
            logger.error("pymupdf: %s", exc)

        logger.warning("No PDF text extractor available. Install: pdfplumber or pypdf")
        return ""

    # ── PDF → PNG image ───────────────────────────────────────────────────────

    @staticmethod
    def _pdf_to_image_bytes(pdf_bytes: bytes, dpi: int = 200) -> Optional[bytes]:
        try:
            from pdf2image import convert_from_bytes
            images = convert_from_bytes(pdf_bytes, dpi=dpi, first_page=1, last_page=1)
            if not images:
                return None
            buf = BytesIO()
            images[0].save(buf, format="PNG")
            return buf.getvalue()
        except ImportError:
            logger.warning("pdf2image not installed")
            return None
        except Exception as exc:
            logger.error("PDF to image: %s", exc)
            return None

    # ── Tesseract OCR ─────────────────────────────────────────────────────────

    @staticmethod
    def _tesseract_ocr(image_bytes: bytes) -> Optional[str]:
        try:
            import pytesseract
            from PIL import Image as PILImage
            img = PILImage.open(BytesIO(image_bytes))
            # بهینه‌سازی تصویر
            if img.mode != "L":
                img = img.convert("L")  # grayscale
            text = pytesseract.image_to_string(img, lang="fas+eng", config="--psm 6 --oem 3")
            if text.strip():
                logger.info("Tesseract extracted %d chars", len(text))
                return text
        except ImportError:
            logger.warning("pytesseract not installed")
        except Exception as exc:
            logger.error("Tesseract: %s", exc)
        return None

    # ── Normalize ─────────────────────────────────────────────────────────────

    @staticmethod
    def normalize(raw: Dict[str, Any]) -> Dict[str, Any]:
        normalized: Dict[str, Any] = {}

        st = str(raw.get("subscriber_type", "residential")).lower()
        valid_types = {"residential", "small_commercial", "commercial", "industrial", "agricultural"}
        normalized["subscriber_type"] = st if st in valid_types else "residential"

        tc = str(raw.get("tariff_code", ""))
        valid_tariffs = {
            "tavanir_residential", "tavanir_commercial",
            "tavanir_industrial", "tavanir_agricultural",
        }
        normalized["tariff_code"] = (
            tc if tc in valid_tariffs else f"tavanir_{normalized['subscriber_type']}"
        )

        num_fields = {
            "kwh_consumed":      (0.1, 10_000_000),
            "billing_days":      (1, 366),
            "current_peak_kw":   (0.01, 100_000),
            "contract_kw":       (0.01, 100_000),
            "kvarh_consumed":    (0, None),
            "power_factor":      (0.1, 1.0),
            "amount_rials":      (100, None),
            "peak_kwh":          (0, None),
            "off_peak_kwh":      (0, None),
            "supply_voltage_kv": (0.1, 500),
        }
        for field, (min_val, max_val) in num_fields.items():
            val = raw.get(field)
            if val is None:
                continue
            try:
                fval = float(str(val).replace(",", "").replace("،", ""))
                if fval >= min_val and (max_val is None or fval <= max_val):
                    normalized[field] = round(fval, 4)
            except (ValueError, TypeError):
                pass

        for field in ["subscriber_name", "subscriber_id", "meter_number",
                       "billing_period", "address"]:
            val = raw.get(field)
            if val and str(val).strip().lower() not in ("null", "none", ""):
                normalized[field] = str(val).strip()

        vl = str(raw.get("voltage_level", "LV")).upper()
        normalized["voltage_level"] = vl if vl in {"LV", "MV", "HV"} else "LV"

        if "billing_days" not in normalized:
            normalized["billing_days"] = 30

        return normalized

    # ── Main process ──────────────────────────────────────────────────────────

    @classmethod
    async def process(
        cls,
        file_bytes: bytes,
        file_type: str,
        use_vision: bool = False,
    ) -> Dict[str, Any]:
        """
        پردازش فایل قبض برق
        اولویت: PDF text layer → Tesseract → Groq AI
        """
        method   = "unknown"
        raw_data : Dict[str, Any] = {}
        raw_text : str = ""

        # ── مرحله ۱: استخراج متن خام ─────────────────────────────────────────
        if file_type == "pdf":
            raw_text = cls._extract_text_from_pdf(file_bytes)
            if raw_text.strip():
                raw_data = IranianBillParser.parse(raw_text)
                method   = "pdf_text_layer"
            else:
                # PDF فاقد text layer → تبدیل به تصویر
                img_bytes = cls._pdf_to_image_bytes(file_bytes)
                if img_bytes:
                    tess_text = cls._tesseract_ocr(img_bytes)
                    if tess_text:
                        raw_text = tess_text
                        raw_data = IranianBillParser.parse(tess_text)
                        method   = "pdf_image_tesseract"
        else:
            # تصویر مستقیم
            tess_text = cls._tesseract_ocr(file_bytes)
            if tess_text:
                raw_text = tess_text
                raw_data = IranianBillParser.parse(tess_text)
                method   = "tesseract"

        # ── مرحله ۲: Groq AI اگر kWh هنوز پیدا نشده ─────────────────────────
        kwh_found_regex = bool(raw_data.get("kwh_consumed"))
        if not kwh_found_regex and raw_text.strip():
            logger.info("Regex failed kWh — trying Groq AI fallback")
            ai_data = await GroqBillParser.parse(raw_text)
            if ai_data:
                # merge: AI data + regex data (regex اولویت برای مقادیر موجود)
                merged = {**ai_data, **raw_data}
                # اما kWh از AI را قبول کن
                if ai_data.get("kwh_consumed"):
                    merged["kwh_consumed"] = ai_data["kwh_consumed"]
                raw_data = merged
                method   = method + "+groq_ai" if method != "unknown" else "groq_ai"

        normalized = cls.normalize(raw_data)
        kwh_found  = bool(normalized.get("kwh_consumed"))

        warnings: List[str] = []
        if not kwh_found:
            warnings.append(
                "OCR نتوانست مصرف kWh را استخراج کند — لطفاً مقدار را به‌صورت دستی وارد کنید"
            )
        if method == "unknown":
            warnings.append("متن قابل استخراج از فایل نبود — از PDF با text layer استفاده کنید")

        return {
            "success":    kwh_found,
            "method":     method,
            "extracted":  raw_data,
            "normalized": normalized,
            "raw_text":   raw_text[:800] if raw_text else "",  # برای debug در dev
            "warnings":   warnings,
        }
