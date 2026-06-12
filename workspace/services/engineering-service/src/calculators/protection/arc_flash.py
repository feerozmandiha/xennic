# src/calculators/protection/arc_flash.py
"""
PROT-002: Arc Flash Hazard Analysis

محاسبه انرژی قوس الکتریکی و تعیین سطح PPE

Standards:
  IEEE 1584-2018    — Guide for Performing Arc-Flash Hazard Calculations
  NFPA 70E-2021     — Standard for Electrical Safety in the Workplace
  IEC 60479-1:2016  — Effects of current on human beings
"""

import math
from typing import Optional
from pydantic import Field

try:
    from src.core.base_calculator import BaseCalculator, CalculationInput
    _Base  = BaseCalculator
    _Input = CalculationInput
except ImportError:
    from pydantic import BaseModel
    _Base  = object   # type: ignore
    _Input = BaseModel  # type: ignore


# ── PPE Categories (NFPA 70E Table 130.5(G)) ─────────────────────────────────
PPE_CATEGORIES = {
    0: {"cal_cm2_max": 1.2,   "label": "Cat 0", "description": "غیر قابل اشتعال — AR clothing",          "ppe": "لباس FR پایه"},
    1: {"cal_cm2_max": 4.0,   "label": "Cat 1", "description": "حداقل PPE برای کار روی تابلو",           "ppe": "لباس FR ۴ cal/cm²"},
    2: {"cal_cm2_max": 8.0,   "label": "Cat 2", "description": "PPE متوسط — اکثر کارهای LV",             "ppe": "لباس FR ۸ cal/cm² + شیلد"},
    3: {"cal_cm2_max": 25.0,  "label": "Cat 3", "description": "PPE بالا — کار MV",                      "ppe": "لباس FR ۲۵ cal/cm² + هلمت بلورین"},
    4: {"cal_cm2_max": 40.0,  "label": "Cat 4", "description": "PPE خیلی بالا — کار HV",                 "ppe": "لباس FR ۴۰ cal/cm² + کامل"},
    99:{"cal_cm2_max": 9999,  "label": "Dangerous","description":"⛔ کار روی برق‌دار ممنوع — قطع اجباری", "ppe": "غیر مجاز — قطع برق"},
}


class ArcFlashInput(_Input):  # type: ignore[misc]
    """PROT-002: داده‌های ورودی آنالیز Arc Flash"""

    # ── سیستم ─────────────────────────────────────────────────────────────────
    system_voltage_kv:    float = Field(..., gt=0, description="ولتاژ سیستم (kV)", example=0.4)
    bolted_fault_ka:      float = Field(..., gt=0, description="جریان اتصال کوتاه کامل (kA) — از SC-001", example=25.0)
    gap_mm:               float = Field(default=32.0, gt=0, description="فاصله قوس (mm) — بر اساس جدول IEEE 1584", example=32.0)
    working_distance_mm:  float = Field(default=450.0, gt=0, description="فاصله کار تا قوس (mm)", example=450.0)
    enclosure_type:       str   = Field(
        default="switchgear",
        description="نوع محفظه: switchgear | MCC | panel | open_air | cable",
    )

    # ── حفاظت ─────────────────────────────────────────────────────────────────
    arcing_fault_clearing_time_s: float = Field(
        default=0.1, gt=0,
        description="زمان قطع جریان قوس (s) — زمان کلید حفاظتی",
        example=0.1,
    )

    # ── پارامترهای IEEE 1584-2018 ──────────────────────────────────────────────
    conductor_config: str = Field(
        default="VCB",
        description="آرایش هادی: VCB (vacuum) | VCBB | HCB | HOA | VOA",
    )
    electrode_config: str = Field(
        default="BBF",
        description="پیکربندی الکترود IEEE 1584: BBF | BBFT | VCB | VCBB | HCB | HOA | VOA",
    )
    height_mm:        Optional[float] = Field(None, description="ارتفاع محفظه (mm) — IEEE 1584-2018", example=300.0)
    width_mm:         Optional[float] = Field(None, description="عرض محفظه (mm)", example=400.0)
    depth_mm:         Optional[float] = Field(None, description="عمق محفظه (mm)", example=250.0)


class ArcFlashCalculator(_Base):  # type: ignore[misc]
    """PROT-002: Arc Flash Analysis — IEEE 1584-2018"""

    CALCULATION_CODE = "PROT-002"
    CALCULATION_NAME = "Arc Flash Analysis — آنالیز خطر قوس الکتریکی"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEEE 1584-2018 / NFPA 70E-2021"
    STANDARD_VERSION = "2018"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self):
        return {
            "incident_energy_cal_cm2": "cal/cm²",
            "arc_flash_boundary_m":    "m",
            "arcing_current_ka":       "kA",
        }

    def validate_inputs(self, inp: ArcFlashInput) -> bool:
        if inp.system_voltage_kv <= 0:
            raise ValueError("ولتاژ باید مثبت باشد")
        if inp.bolted_fault_ka <= 0:
            raise ValueError("جریان اتصال کوتاه باید مثبت باشد")
        return True

    def calculate(self, inputs: ArcFlashInput) -> dict:
        self.validate_inputs(inputs)
        return self._calculate(inputs)

    def _calculate(self, inp: ArcFlashInput) -> dict:
        Voc   = inp.system_voltage_kv       # kV
        Ibf   = inp.bolted_fault_ka         # kA
        D     = inp.working_distance_mm / 1000  # m
        t     = inp.arcing_fault_clearing_time_s
        gap   = inp.gap_mm

        # ── جریان قوس (IEEE 1584-2018 eq. 1) ─────────────────────────────────
        # log10(Ia) = K + A·log10(Ibf) + B·log10(V) + C·log10(G)
        # ضرایب برای VCB (Table 1 IEEE 1584-2018)
        K, A, B, C = self._arc_current_coeffs(inp.electrode_config, Voc)
        log_Ia = K + A * math.log10(Ibf) + B * math.log10(Voc) + C * math.log10(gap)
        Ia     = 10 ** log_Ia   # kA

        # ── انرژی نرمال‌شده (E_n) — IEEE 1584 eq. 3 ──────────────────────────
        k1, k2, k3 = self._energy_coeffs(inp.electrode_config, Voc)
        log_En = k1 + k2 * math.log10(Ia) + k3 * math.log10(gap)
        En     = 10 ** log_En   # J/cm² at 610mm, t=0.2s

        # ── تبدیل به cal/cm² با فاصله و زمان ─────────────────────────────────
        # E = CF · En · (t/0.2) · (610/D_mm)^x
        CF    = 1.0   # ضریب محفظه — 1.0 برای open، 1.5 برای enclosed
        if inp.enclosure_type in ("switchgear", "MCC", "panel"):
            CF = 1.5
        x_exp = 1.5   # توان فاصله (IEC 1584 eq. 4)
        D_mm  = inp.working_distance_mm
        E_Jcm2 = CF * En * (t / 0.2) * ((610.0 / D_mm) ** x_exp)

        # تبدیل J/cm² به cal/cm²  (1 cal = 4.184 J)
        E_cal = E_Jcm2 / 4.184

        # ── مرز قوس (AFB) — IEEE 1584 eq. 9 ──────────────────────────────────
        # AFB: فاصله‌ای که E = 1.2 cal/cm² (آستانه سوختگی درجه ۲)
        E_threshold = 1.2  # cal/cm² = آستانه سوختگی درجه ۲ NFPA 70E
        E_Jcm2_threshold = E_threshold * 4.184
        AFB_mm = 610.0 * ((CF * En * t / 0.2) / E_Jcm2_threshold) ** (1 / x_exp)
        AFB_m  = AFB_mm / 1000

        # ── Limited / Restricted / Prohibited approach ─────────────────────────
        # NFPA 70E Table 130.4(D)(a) — تقریبی
        LAB_m = AFB_m * 3.0   # Limited Approach Boundary
        RAB_m = AFB_m * 0.5   # Restricted Approach Boundary

        # ── سطح PPE ───────────────────────────────────────────────────────────
        ppe_cat = self._ppe_category(E_cal)
        ppe_info = PPE_CATEGORIES.get(ppe_cat, PPE_CATEGORIES[99])

        # ── ولتاژ risk ─────────────────────────────────────────────────────────
        risk_level = (
            "🟢 پایین"   if E_cal < 4.0  else
            "🟡 متوسط"   if E_cal < 12.0 else
            "🔴 بالا"    if E_cal < 40.0 else
            "⛔ خطرناک"
        )

        return {
            "system": {
                "voltage_kv":          Voc,
                "bolted_fault_ka":     Ibf,
                "arcing_current_ka":   round(Ia, 3),
                "clearing_time_s":     t,
                "working_distance_mm": inp.working_distance_mm,
                "electrode_config":    inp.electrode_config,
                "enclosure_type":      inp.enclosure_type,
            },
            "results": {
                "incident_energy_cal_cm2": round(E_cal, 2),
                "incident_energy_j_cm2":   round(E_Jcm2, 2),
                "arc_flash_boundary_m":    round(AFB_m, 2),
                "limited_approach_m":      round(LAB_m, 2),
                "restricted_approach_m":   round(RAB_m, 2),
                "risk_level":              risk_level,
            },
            "ppe": {
                "category":    ppe_cat,
                "label":       ppe_info["label"],
                "description": ppe_info["description"],
                "required_ppe":ppe_info["ppe"],
                "min_arc_rating_cal_cm2": ppe_info["cal_cm2_max"],
            },
            "standard_refs": {
                "energy_calc": "IEEE 1584-2018",
                "ppe_table":   "NFPA 70E-2021 Table 130.5(G)",
                "threshold":   "1.2 cal/cm² = onset of 2nd degree burn (NFPA 70E)",
            },
            "recommendations": self._recommendations(E_cal, AFB_m, ppe_cat, t),
        }

    # ── coefficients ──────────────────────────────────────────────────────────

    def _arc_current_coeffs(self, config: str, V_kv: float):
        """IEEE 1584-2018 Table 1 — ضرایب جریان قوس"""
        # ساده‌سازی — برای VCB در محدوده 0.208-15 kV
        if V_kv <= 1.0:
            return -0.153, 0.931, 1.091, -0.682
        elif V_kv <= 15.0:
            return -0.083, 1.037, 0.840, -0.562
        else:
            return -0.100, 1.040, 0.780, -0.500

    def _energy_coeffs(self, config: str, V_kv: float):
        """IEEE 1584-2018 Table 3 — ضرایب انرژی نرمال‌شده"""
        if V_kv <= 1.0:
            return -0.792, 1.494, 0.900
        elif V_kv <= 15.0:
            return -0.555, 1.318, 0.760
        else:
            return -0.400, 1.200, 0.650

    def _ppe_category(self, E_cal: float) -> int:
        """دسته‌بندی PPE بر اساس NFPA 70E"""
        if E_cal <= 1.2:
            return 0
        elif E_cal <= 4.0:
            return 1
        elif E_cal <= 8.0:
            return 2
        elif E_cal <= 25.0:
            return 3
        elif E_cal <= 40.0:
            return 4
        else:
            return 99

    def _recommendations(self, E_cal, AFB_m, ppe_cat, t) -> list:
        recs = []
        if ppe_cat == 99:
            recs.append("⛔ کار روی مدار برق‌دار مجاز نیست — حتماً برق را قطع کنید")
        elif ppe_cat >= 3:
            recs.append(f"⚠️ انرژی قوس {E_cal:.1f} cal/cm² بالاست — بررسی کاهش زمان قطع")
        if t > 0.5:
            recs.append(
                f"💡 زمان قطع {t}s زیاد است — با کاهش به ۰.۱s انرژی قوس ~{E_cal*(0.1/t):.1f} cal/cm² می‌شود"
            )
        if AFB_m > 3.0:
            recs.append(f"⚠️ مرز قوس {AFB_m:.1f}m — علامت‌گذاری و محدودسازی منطقه ضروری است")
        if ppe_cat <= 2 and t <= 0.2:
            recs.append("✅ سطح خطر قابل مدیریت — رعایت PPE و رویه کار ایمن کافی است")
        recs.append(f"📋 PPE مورد نیاز: {PPE_CATEGORIES.get(ppe_cat, PPE_CATEGORIES[99])['ppe']}")
        return recs
