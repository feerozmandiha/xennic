# src/calculators/energy_analyzer/schemas.py
"""
Energy Analyzer Input Schemas — تعرفه توانیر ۱۴۰۳

مراجع:
  - آیین‌نامه تعرفه‌های برق مصوب ۱۴۰۲/۱۴۰۳ (توانیر)
  - بخشنامه تفکیک مناطق گرمسیری/سردسیری
  - دستورالعمل محاسبه هزینه اوج/میان/کم‌بار
"""

from typing import Optional, List, Dict
from pydantic import BaseModel, Field, model_validator

# ── سازگاری با CalculationInput (اگر موجود باشد) ─────────────────────────────
try:
    from src.core.base_calculator import CalculationInput as _CalculationInput
    _InputBase = _CalculationInput
except ImportError:
    _InputBase = BaseModel  # type: ignore

CalculationInput = _InputBase  # re-export برای سازگاری


class MonthlyData(_InputBase):  # type: ignore[misc]
    """داده یک ماه از قبض"""
    month:          str   = Field(..., description="ماه (مثال: 1403/01)", example="1403/01")
    kwh_consumed:   float = Field(..., gt=0, description="مصرف kWh", example=850.0)
    peak_kw:        Optional[float] = Field(None, description="حداکثر توان اوج (kW)", example=15.0)
    off_peak_kwh:   Optional[float] = Field(None, description="مصرف خارج اوج (kWh)", example=350.0)
    peak_kwh:       Optional[float] = Field(None, description="مصرف اوج (kWh)", example=500.0)
    amount_rials:   Optional[float] = Field(None, description="مبلغ قبض (ریال)", example=8500000.0)


class EnergyAnalyzerInput(_InputBase):  # type: ignore[misc]
    """
    EA-001: Energy Consumption Analyzer

    تحلیل جامع مصرف انرژی با تعرفه کامل توانیر ۱۴۰۳
    شامل: اوج/میان/کم‌بار، منطقه گرمسیری/سردسیری، نوع قرارداد، ماکسیمتر
    """

    # ── اطلاعات مشترک ─────────────────────────────────────────────────────────
    subscriber_type: str = Field(
        default="residential",
        description=(
            "نوع مشترک:\n"
            "  residential        — خانگی\n"
            "  small_commercial   — تجاری کوچک (زیر ۳۰ kW)\n"
            "  commercial         — عمومی و تجاری\n"
            "  industrial_lv      — صنعتی فشارضعیف\n"
            "  industrial_mv      — صنعتی فشارمتوسط\n"
            "  industrial_hv      — صنعتی فشارقوی\n"
            "  agricultural       — کشاورزی\n"
            "  industrial         — صنعتی (عمومی)"
        ),
        example="industrial_mv",
    )
    tariff_code: str = Field(
        default="tavanir_residential",
        description=(
            "کد تعرفه:\n"
            "  tavanir_residential / tavanir_commercial\n"
            "  tavanir_industrial_lv / tavanir_industrial_mv / tavanir_industrial_hv\n"
            "  tavanir_agricultural"
        ),
        example="tavanir_industrial_mv",
    )

    # ── منطقه جغرافیایی (اثر گرمسیری/سردسیری) ───────────────────────────────
    climate_zone: str = Field(
        default="moderate",
        description=(
            "منطقه آب‌وهوایی:\n"
            "  hot      — گرمسیری (خوزستان، بوشهر، هرمزگان، سیستان، کرمان جنوبی)\n"
            "  cold     — سردسیری (آذربایجان، کردستان، همدان، لرستان کوهستانی)\n"
            "  moderate — معتدل (سایر استان‌ها)"
        ),
        example="moderate",
    )

    # ── نوع قرارداد و سطح ولتاژ ───────────────────────────────────────────────
    voltage_level: str = Field(
        default="LV",
        description="سطح ولتاژ: LV (<1kV) | MV (1-63kV) | HV (>63kV)",
        example="MV",
    )
    supply_voltage_kv: float = Field(
        default=0.4, gt=0,
        description="ولتاژ اتصال (kV)",
        example=20.0,
    )
    contract_type: str = Field(
        default="normal",
        description=(
            "نوع قرارداد:\n"
            "  normal       — قرارداد عادی\n"
            "  tou          — قرارداد TOU (Time of Use) — اوج/میان/کم‌بار\n"
            "  interruptible— قابل قطع (تخفیف ویژه)\n"
            "  green        — قرارداد انرژی سبز"
        ),
        example="tou",
    )

    # ── داده‌های این دوره ──────────────────────────────────────────────────────
    current_kwh:         float = Field(..., gt=0, description="مصرف این دوره (kWh)", example=45000.0)
    billing_days:        int   = Field(default=30, gt=0, description="تعداد روزهای دوره", example=30)

    # ── اوج/میان/کم‌بار (TOU) ────────────────────────────────────────────────
    peak_kwh:            Optional[float] = Field(None, description="مصرف ساعات اوج‌بار (kWh) — ۷ صبح تا ۱۱ شب", example=18000.0)
    mid_kwh:             Optional[float] = Field(None, description="مصرف ساعات میان‌بار (kWh)", example=15000.0)
    off_peak_kwh:        Optional[float] = Field(None, description="مصرف ساعات کم‌بار (kWh) — ۱۱ شب تا ۷ صبح", example=12000.0)
    peak_kwh_friday:     Optional[float] = Field(None, description="مصرف اوج‌بار جمعه (kWh) — نرخ متفاوت", example=3000.0)

    # ── ماکسیمتر و توان ───────────────────────────────────────────────────────
    current_peak_kw:     Optional[float] = Field(None, gt=0, description="حداکثر توان اوج / ماکسیمتر این دوره (kW)", example=120.0)
    contract_kw:         Optional[float] = Field(None, gt=0, description="توان قراردادی (kW) — برای محاسبه تجاوز", example=150.0)
    maximeter_kw:        Optional[float] = Field(None, description="قرائت ماکسیمتر (kW) — اگر جدا از peak_kw است", example=118.0)
    ratchet_months:      int             = Field(default=12, description="دوره رatchet ماکسیمتر (ماه) — معمولاً ۱۲ ماه", example=12)

    # ── توان راکتیو ───────────────────────────────────────────────────────────
    current_kvarh:       Optional[float] = Field(None, description="مصرف راکتیو کل (kVArh)", example=18000.0)
    kvarh_peak:          Optional[float] = Field(None, description="مصرف راکتیو اوج‌بار (kVArh)", example=9000.0)
    kvarh_off_peak:      Optional[float] = Field(None, description="مصرف راکتیو کم‌بار (kVArh)", example=9000.0)

    # ── ضریب قدرت ─────────────────────────────────────────────────────────────
    power_factor_measured: Optional[float] = Field(None, gt=0, le=1, description="ضریب قدرت اندازه‌گیری‌شده", example=0.82)

    # ── مبلغ قبض ──────────────────────────────────────────────────────────────
    amount_rials:        Optional[float] = Field(None, description="مبلغ قابل پرداخت قبض (ریال) — برای مقایسه", example=450000000.0)

    # ── پارامترهای شبکه (Load Flow) ───────────────────────────────────────────
    transformer_kva:     Optional[float] = Field(None, gt=0, description="توان ترانسفورماتور (kVA)", example=630.0)
    transformer_imp_pct: float           = Field(default=4.0, description="امپدانس ترانسفورماتور (%)", example=4.0)
    cable_length_m:      Optional[float] = Field(None, description="طول کابل از ترانس تا تابلو (m)", example=80.0)
    cable_size_mm2:      Optional[float] = Field(None, description="سطح مقطع کابل (mm²)", example=240.0)

    # ── سیستم‌های تجدیدپذیر ───────────────────────────────────────────────────
    has_solar_pv:        bool            = Field(default=False, description="آیا سیستم PV خورشیدی دارید؟")
    solar_kw:            Optional[float] = Field(None, description="توان سیستم PV (kW)")
    has_battery:         bool            = Field(default=False, description="آیا باتری ذخیره دارید؟")
    has_vfd:             bool            = Field(default=False, description="آیا درایو (VFD) روی موتورها دارید؟")

    # ── بارهای اصلی ───────────────────────────────────────────────────────────
    main_loads: Optional[Dict[str, float]] = Field(
        None,
        description="بارهای اصلی به صورت {نام: kW}",
        example={"موتور پمپ": 37, "روشنایی": 12, "کولر صنعتی": 25},
    )

    # ── داده تاریخی ───────────────────────────────────────────────────────────
    monthly_history: Optional[List[MonthlyData]] = Field(
        None,
        description="داده‌های ۶-۱۲ ماه گذشته برای تحلیل روند",
    )

    @model_validator(mode='after')
    def _validate_and_normalize(self):
        # تبدیل subscriber_type قدیمی
        mapping = {
            "industrial": "industrial_mv",
            "small_commercial": "commercial",
        }
        if self.subscriber_type in mapping:
            self.subscriber_type = mapping[self.subscriber_type]

        # تبدیل tariff_code قدیمی
        tc_mapping = {
            "tavanir_industrial": "tavanir_industrial_mv",
        }
        if self.tariff_code in tc_mapping:
            self.tariff_code = tc_mapping[self.tariff_code]

        # اگر TOU داده شده و current_peak_kwh قدیمی هم بود → peak_kwh
        if not self.peak_kwh and hasattr(self, 'current_peak_kwh') and self.current_peak_kwh:
            self.peak_kwh = self.current_peak_kwh

        return self

    # alias برای سازگاری backward
    @property
    def current_peak_kwh(self) -> Optional[float]:
        return self.peak_kwh

    @property
    def current_offpeak_kwh(self) -> Optional[float]:
        return self.off_peak_kwh
