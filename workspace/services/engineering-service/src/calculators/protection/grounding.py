# src/calculators/protection/grounding.py
"""
GND-001: Grounding / Earthing System Design

طراحی سیستم زمین الکتریکی برای ایمنی و حفاظت

Standards:
  IEC 60364-5-54:2011  — Earthing arrangements and protective conductors
  IEC 60364-4-41       — Protection against electric shock
  IEEE 80-2013         — Guide for Safety in AC Substation Grounding
  IEC 62305-3          — Lightning protection — Physical damage
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


class GroundingInput(_Input):  # type: ignore[misc]
    """GND-001: داده‌های ورودی طراحی سیستم زمین"""

    # ── پارامترهای خاک ────────────────────────────────────────────────────────
    soil_resistivity_ohm_m: float = Field(
        ..., gt=0,
        description="مقاومت ویژه خاک (Ω·m) — از آزمون Wenner یا تخمین",
        example=100.0,
    )
    soil_layer: str = Field(
        default="uniform",
        description="نوع خاک: uniform | two_layer",
    )
    upper_layer_depth_m:     Optional[float] = Field(None, description="عمق لایه بالایی (m) — برای two_layer", example=2.0)
    lower_layer_resistivity: Optional[float] = Field(None, description="مقاومت ویژه لایه پایین (Ω·m)", example=300.0)

    # ── الکترود ───────────────────────────────────────────────────────────────
    electrode_type: str = Field(
        default="rod",
        description="نوع الکترود: rod | plate | ring | mesh | strip",
    )
    rod_length_m:        float           = Field(default=3.0, gt=0, description="طول میل‌زمین (m)", example=3.0)
    rod_diameter_mm:     float           = Field(default=16.0, gt=0, description="قطر میل‌زمین (mm)", example=16.0)
    num_rods:            int             = Field(default=1, ge=1, description="تعداد میل‌زمین", example=1)
    rod_spacing_m:       Optional[float] = Field(None, description="فاصله بین میل‌زمین‌ها (m)", example=3.0)
    strip_length_m:      Optional[float] = Field(None, description="طول نوار افقی زمین (m)", example=10.0)
    strip_depth_m:       float           = Field(default=0.5, description="عمق دفن الکترود (m)", example=0.5)

    # ── الزامات ───────────────────────────────────────────────────────────────
    max_resistance_ohm:  float = Field(
        default=10.0,
        description="حداکثر مقاومت زمین مجاز (Ω) — استاندارد: <10Ω عمومی، <1Ω ساختمان‌های حساس",
        example=10.0,
    )
    fault_current_a:     Optional[float] = Field(None, description="جریان خطا (A) — برای محاسبه ولتاژ تماس", example=1000.0)
    fault_duration_s:    float           = Field(default=0.5, description="مدت خطا (s)", example=0.5)

    # ── نوع سیستم ─────────────────────────────────────────────────────────────
    system_type: str = Field(
        default="TN-S",
        description="نوع سیستم زمین: TN-S | TN-C | TN-C-S | TT | IT",
    )
    body_weight_kg: float = Field(default=70.0, description="وزن بدن انسان (kg) — برای محاسبه جریان قابل تحمل")


class GroundingCalculator(_Base):  # type: ignore[misc]
    """GND-001: Earthing System Design — IEC 60364-5-54 / IEEE 80"""

    CALCULATION_CODE = "GND-001"
    CALCULATION_NAME = "Grounding System Design — طراحی سیستم زمین"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 60364-5-54 / IEEE 80-2013"
    STANDARD_VERSION = "2013"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self):
        return {
            "rod_resistance_ohm":     "Ω",
            "total_resistance_ohm":   "Ω",
            "touch_voltage_v":        "V",
            "step_voltage_v":         "V",
            "tolerable_touch_v":      "V",
        }

    def validate_inputs(self, inp: GroundingInput) -> bool:
        if inp.soil_resistivity_ohm_m <= 0:
            raise ValueError("مقاومت ویژه خاک باید مثبت باشد")
        return True

    def calculate(self, inputs: GroundingInput) -> dict:
        self.validate_inputs(inputs)
        return self._calculate(inputs)

    def _calculate(self, inp: GroundingInput) -> dict:
        rho  = inp.soil_resistivity_ohm_m
        L    = inp.rod_length_m
        d    = inp.rod_diameter_mm / 1000   # m
        n    = inp.num_rods
        h    = inp.strip_depth_m

        # ── مقاومت یک میل‌زمین (IEC 60364-5-54 / Dwight formula) ─────────────
        # R_rod = (ρ/2πL) · [ln(4L/d) - 1]
        R_single_rod = (rho / (2 * math.pi * L)) * (math.log(4 * L / d) - 1)

        # ── ضریب کاهش برای چند میل‌زمین موازی ────────────────────────────────
        # eta = 1/n برای n میل با فاصله کافی، با ضریب تداخل
        if n == 1:
            R_rods = R_single_rod
        else:
            spacing = inp.rod_spacing_m or (2 * L)
            # ضریب تداخل Schwarz
            eta = self._parallel_efficiency(n, L, spacing)
            R_rods = R_single_rod / (n * eta)

        # ── مقاومت نوار افقی ──────────────────────────────────────────────────
        R_strip = 0.0
        if inp.strip_length_m:
            Ls = inp.strip_length_m
            ds = 0.01   # قطر معادل نوار مسی 25×4 mm
            R_strip = (rho / (2 * math.pi * Ls)) * (math.log(2 * Ls**2 / (ds * h)) - 1)

        # ── مقاومت کل (موازی rod + strip) ───────────────────────────────────
        if R_strip > 0:
            R_total = (R_rods * R_strip) / (R_rods + R_strip)
        else:
            R_total = R_rods

        # ── ولتاژ تماس و قدم ─────────────────────────────────────────────────
        touch_v = step_v = None
        if inp.fault_current_a:
            If = inp.fault_current_a
            # IEEE 80 eq. 79:  GPR = If · Rg
            GPR = If * R_total
            # تقریب ولتاژ تماس = 0.5 × GPR
            touch_v = 0.5 * GPR
            step_v  = 0.2 * GPR

        # ── حداکثر ولتاژ تماس قابل تحمل (IEEE 80 eq. 32) ────────────────────
        # Etouch = (1000 + 1.5·Cs·ρs) × 0.116/√t    برای 50kg
        # ساده‌سازی: بدون لایه سطحی
        Cs  = 1.0   # ضریب لایه سطحی (بدون شن = 1.0)
        Etouch = (1000 + 1.5 * Cs * rho) * (0.116 / math.sqrt(inp.fault_duration_s))
        Estep  = (1000 + 6.0 * Cs * rho) * (0.116 / math.sqrt(inp.fault_duration_s))

        # ── جریان قابل تحمل بدن (IEC 60479-1) ──────────────────────────────
        # I_body = 0.116/√t برای 50kg
        I_body_a = 0.116 / math.sqrt(inp.fault_duration_s)

        # ── بررسی کفایت ─────────────────────────────────────────────────────
        adequate   = R_total <= inp.max_resistance_ohm
        touch_safe = (touch_v is None) or (touch_v <= Etouch)
        step_safe  = (step_v  is None) or (step_v  <= Estep)

        # ── اندازه هادی زمین (IEC 60364-5-54) ─────────────────────────────────
        # S = I·√t / k    (mm²)
        pe_size = None
        if inp.fault_current_a:
            k_cu = 115   # مس با عایق PVC (IEC 60364 Table 54.2)
            k_al = 76
            S_min_cu = inp.fault_current_a * math.sqrt(inp.fault_duration_s) / k_cu
            pe_size = {
                "copper_mm2":     round(S_min_cu, 1),
                "aluminum_mm2":   round(inp.fault_current_a * math.sqrt(inp.fault_duration_s) / k_al, 1),
                "recommended":    self._next_standard_size(S_min_cu),
            }

        # ── تعداد میل‌زمین لازم برای رسیدن به هدف ────────────────────────────
        n_required = math.ceil(R_single_rod / inp.max_resistance_ohm)

        return {
            "system_type": inp.system_type,
            "soil": {
                "resistivity_ohm_m": rho,
                "classification":    self._soil_class(rho),
            },
            "electrode": {
                "type":              inp.electrode_type,
                "count":             n,
                "length_m":          L,
                "diameter_mm":       inp.rod_diameter_mm,
                "burial_depth_m":    h,
                "strip_length_m":    inp.strip_length_m,
            },
            "results": {
                "single_rod_resistance_ohm": round(R_single_rod, 3),
                "strip_resistance_ohm":      round(R_strip, 3) if R_strip else None,
                "total_resistance_ohm":      round(R_total, 3),
                "target_resistance_ohm":     inp.max_resistance_ohm,
                "adequate":                  adequate,
                "rods_needed_for_target":    n_required,
                "gpr_v":                     round(inp.fault_current_a * R_total, 1) if inp.fault_current_a else None,
                "touch_voltage_v":           round(touch_v, 1) if touch_v else None,
                "step_voltage_v":            round(step_v, 1) if step_v else None,
                "tolerable_touch_v":         round(Etouch, 1),
                "tolerable_step_v":          round(Estep, 1),
                "body_current_limit_a":      round(I_body_a, 3),
                "touch_safe":                touch_safe,
                "step_safe":                 step_safe,
            },
            "conductor_sizing":  pe_size,
            "standard_refs": {
                "resistance":     "IEC 60364-5-54:2011",
                "safety_voltage": "IEC 60479-1:2016",
                "substation":     "IEEE 80-2013",
                "pe_sizing":      "IEC 60364-5-54 Table 54.2",
            },
            "recommendations": self._recommendations(R_total, inp.max_resistance_ohm,
                                                     n, n_required, touch_safe, step_safe, pe_size),
        }

    # ── helpers ───────────────────────────────────────────────────────────────

    def _parallel_efficiency(self, n: int, L: float, s: float) -> float:
        """ضریب بهره‌وری موازی Schwarz"""
        if s >= 2 * L:
            return 0.95  # تداخل ناچیز
        ratio = s / L
        return 0.65 + 0.35 * ratio if ratio < 1 else 0.90

    def _soil_class(self, rho: float) -> str:
        if rho < 25:   return "خیلی مرطوب / دریاچه"
        if rho < 100:  return "رسی / مرطوب"
        if rho < 300:  return "لوم / نیمه‌خشک"
        if rho < 1000: return "شنی / خشک"
        return "سنگ / خیلی خشک"

    def _next_standard_size(self, s: float) -> float:
        """استانداردترین سایز بعدی کابل PE"""
        sizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240]
        for sz in sizes:
            if sz >= s:
                return sz
        return s

    def _recommendations(self, R_total, R_max, n, n_req, touch_safe, step_safe, pe_size) -> list:
        recs = []
        if not R_total <= R_max:
            recs.append(
                f"❌ مقاومت زمین {R_total:.2f}Ω > حد مجاز {R_max}Ω — "
                f"تعداد میل‌زمین را به حداقل {n_req} افزایش دهید"
            )
        else:
            recs.append(f"✅ مقاومت زمین {R_total:.2f}Ω ≤ {R_max}Ω — قابل قبول")
        if not touch_safe:
            recs.append("⚠️ ولتاژ تماس از حد مجاز تجاوز می‌کند — افزودن شبکه زمین و تسریع قطع")
        if not step_safe:
            recs.append("⚠️ ولتاژ قدم از حد مجاز تجاوز می‌کند — افزودن لایه شن یا چمن اطراف تجهیزات")
        if pe_size:
            recs.append(f"💡 هادی PE حداقل: مس {pe_size['copper_mm2']} mm² → استفاده از {pe_size['recommended']} mm²")
        if n < n_req:
            extra = n_req - n
            recs.append(f"💡 برای رسیدن به مقاومت هدف → {extra} میل‌زمین اضافه با فاصله ≥{2}m")
        return recs
