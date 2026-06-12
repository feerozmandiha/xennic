# src/calculators/protection/short_circuit.py
"""
SC-001: Short Circuit Current Calculator

محاسبه جریان اتصال کوتاه سه‌فاز، دو فاز، تک‌فاز به زمین

Standards:
  IEC 60909-0:2016  — Short-circuit currents in three-phase AC systems
  IEC 60909-1:2002  — Factors for the calculation
  IEC 60865-1       — Thermal and electromagnetic effects
"""

import math
from typing import Optional
from pydantic import BaseModel, Field, model_validator

try:
    from src.core.base_calculator import BaseCalculator, CalculationInput
    _Base  = BaseCalculator
    _Input = CalculationInput
except ImportError:
    from pydantic import BaseModel as _BaseModel
    _Base  = object   # type: ignore
    _Input = _BaseModel  # type: ignore


# ─────────────────────────────────────────────────────────────────────────────
# Input Schema
# ─────────────────────────────────────────────────────────────────────────────

class ShortCircuitInput(_Input):  # type: ignore[misc]
    """SC-001: داده‌های ورودی محاسبه اتصال کوتاه"""

    # ── شبکه تغذیه ────────────────────────────────────────────────────────────
    system_voltage_kv:   float = Field(..., gt=0, description="ولتاژ سیستم (kV)", example=20.0)
    frequency_hz:        float = Field(default=50.0, description="فرکانس (Hz)", example=50.0)

    # ── امپدانس شبکه (Thevenin) ────────────────────────────────────────────────
    grid_fault_level_mva: Optional[float] = Field(
        None, gt=0,
        description="توان اتصال کوتاه شبکه (MVA) — اگر داشتید",
        example=500.0,
    )
    grid_r_ohm:   Optional[float] = Field(None, description="مقاومت شبکه Thevenin (Ω)", example=0.01)
    grid_x_ohm:   Optional[float] = Field(None, description="راکتانس شبکه Thevenin (Ω)", example=0.5)

    # ── ترانسفورماتور ─────────────────────────────────────────────────────────
    transformer_kva:     Optional[float] = Field(None, gt=0, description="توان ترانس (kVA)", example=1000.0)
    transformer_vk_pct:  float           = Field(default=6.0, description="امپدانس کوتاه ترانس (%)", example=6.0)
    transformer_vkr_pct: float           = Field(default=1.0, description="مؤلفه مقاومتی (%)", example=1.0)
    transformer_hv_kv:   Optional[float] = Field(None, description="ولتاژ اولیه ترانس (kV)", example=20.0)
    transformer_lv_kv:   Optional[float] = Field(None, description="ولتاژ ثانویه ترانس (kV)", example=0.4)

    # ── کابل/شین تا نقطه خطا ──────────────────────────────────────────────────
    cable_length_m:      Optional[float] = Field(None, ge=0, description="طول کابل تا نقطه خطا (m)", example=50.0)
    cable_r_ohm_per_km:  Optional[float] = Field(None, description="مقاومت کابل (Ω/km)", example=0.0927)
    cable_x_ohm_per_km:  Optional[float] = Field(None, description="راکتانس کابل (Ω/km)", example=0.08)
    cable_size_mm2:      Optional[float] = Field(None, description="سطح مقطع کابل (mm²) — برای تخمین خودکار", example=240.0)
    cable_material:      str             = Field(default="copper", description="جنس هادی: copper | aluminum")

    # ── نوع خطا ───────────────────────────────────────────────────────────────
    fault_type:          str  = Field(
        default="three_phase",
        description="نوع خطا: three_phase | line_to_line | single_phase | double_phase_earth",
    )

    # ── ضرایب IEC 60909 ────────────────────────────────────────────────────────
    voltage_factor_c:    float = Field(
        default=1.1,
        description="ضریب ولتاژ c (IEC 60909 Table 1): 1.1 برای Isc_max / 0.95 برای Isc_min",
        ge=0.9, le=1.1,
    )
    motor_contribution:  bool  = Field(default=False, description="لحاظ کردن سهم موتورها")
    total_motor_kw:      Optional[float] = Field(None, description="توان کل موتورها (kW)")

    @model_validator(mode='after')
    def _validate(self):
        if not self.grid_fault_level_mva and not (self.grid_r_ohm or self.grid_x_ohm):
            # مقدار پیش‌فرض
            self.grid_fault_level_mva = 500.0
        return self


# ─────────────────────────────────────────────────────────────────────────────
# Calculator
# ─────────────────────────────────────────────────────────────────────────────

class ShortCircuitCalculator(_Base):  # type: ignore[misc]
    """SC-001: Short Circuit Current — IEC 60909"""

    CALCULATION_CODE = "SC-001"
    CALCULATION_NAME = "Short Circuit Calculation — محاسبه اتصال کوتاه"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 60909-0:2016"
    STANDARD_VERSION = "2016"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self):
        return {
            "isc_three_phase_ka": "kA",
            "isc_line_line_ka":   "kA",
            "isc_single_phase_ka":"kA",
            "peak_current_ka":    "kA",
            "thermal_current_ka": "kA",
        }

    def validate_inputs(self, inputs: ShortCircuitInput) -> bool:
        if inputs.system_voltage_kv <= 0:
            raise ValueError("ولتاژ سیستم باید مثبت باشد")
        return True

    def calculate(self, inputs: ShortCircuitInput) -> dict:
        self.validate_inputs(inputs)
        return self._calculate(inputs)

    def _calculate(self, inputs: ShortCircuitInput) -> dict:
        p   = inputs
        Vn  = p.system_voltage_kv * 1000          # V (line-to-line)
        c   = p.voltage_factor_c
        f   = p.frequency_hz
        w   = 2 * math.pi * f

        # ── امپدانس شبکه (Zg) ─────────────────────────────────────────────────
        Rg, Xg = self._grid_impedance(p, Vn)

        # ── امپدانس ترانسفورماتور (ZT) ────────────────────────────────────────
        Rt, Xt, Zt = self._transformer_impedance(p)

        # ── امپدانس کابل (Zc) ─────────────────────────────────────────────────
        Rc, Xc = self._cable_impedance(p)

        # ── امپدانس کل ────────────────────────────────────────────────────────
        R_total = Rg + Rt + Rc
        X_total = Xg + Xt + Xc
        Z_total = math.sqrt(R_total**2 + X_total**2)

        if Z_total <= 0:
            raise ValueError("امپدانس کل صفر است — ورودی‌ها را بررسی کنید")

        # ── جریان پایه ────────────────────────────────────────────────────────
        Ibase = Vn / (math.sqrt(3) * Z_total)   # A (جریان مؤثر سه‌فاز)

        # ── جریانات اتصال کوتاه ───────────────────────────────────────────────
        # سه‌فاز (IEC 60909 eq. 29):  I"k3 = c·Un / (√3·Zk)
        Ik3 = (c * Vn) / (math.sqrt(3) * Z_total)

        # دو‌فاز (IEC 60909 eq. 30):  I"k2 = (√3/2) · I"k3
        Ik2 = (math.sqrt(3) / 2) * Ik3

        # تک‌فاز (IEC 60909 eq. 52):  I"k1 = (√3·c·Un) / (|2Z1+Z0|)
        # تقریب: Z0 ≈ 3·Z1 برای شبکه‌های معمول
        Z1 = Z_total
        Z0 = 3 * Z1  # تقریب
        Ik1 = (math.sqrt(3) * c * Vn) / (2 * Z1 + Z0)

        # دو‌فاز به زمین
        Ik2e = Ik3 * 1.15   # تقریب IEC

        # ── ضریب پیک κ (IEC 60909 Table 3) ──────────────────────────────────
        RX_ratio = R_total / X_total if X_total > 0 else 0.1
        kappa    = self._kappa(RX_ratio)
        ip       = kappa * math.sqrt(2) * Ik3   # جریان پیک

        # ── جریان حرارتی معادل Ith ────────────────────────────────────────────
        # IEC 60909 eq. 78:  Ith = Ik · √(1 + m + n)
        Tk    = 0.5   # زمان فرضی قطع (s) — معمولاً ۵۰۰ms
        m     = self._m_factor(kappa, Tk, f)
        n     = 1.0   # برای ترانسفورماتورها n≈1
        Ith   = Ik3 * math.sqrt(1 + m + n)

        # ── سهم موتور ─────────────────────────────────────────────────────────
        motor_ik3 = 0.0
        if p.motor_contribution and p.total_motor_kw:
            # IEC 60909: سهم موتور ≈ 3×In_motor برای موتورهای ناهمزمان
            In_motor  = p.total_motor_kw * 1000 / (math.sqrt(3) * Vn * 0.9)
            motor_ik3 = 3.0 * In_motor
            Ik3      += motor_ik3

        # ── انتخاب جریان بر اساس نوع خطا ─────────────────────────────────────
        fault_map = {
            "three_phase":        Ik3,
            "line_to_line":       Ik2,
            "single_phase":       Ik1,
            "double_phase_earth": Ik2e,
        }
        Isc_selected = fault_map.get(p.fault_type, Ik3)

        # ── توان اتصال کوتاه ───────────────────────────────────────────────────
        Sk3 = math.sqrt(3) * Vn * Ik3 / 1e6   # MVA

        # ── بارگذاری حرارتی کابل ──────────────────────────────────────────────
        cable_check = None
        if p.cable_size_mm2:
            # IEC 60364-5-54: S_min = I·√t / k
            k_cu = 115  # ضریب برای مس با عایق PVC
            k_al = 76   # آلومینیوم
            k    = k_cu if p.cable_material == "copper" else k_al
            Tk_default = 0.5
            S_min = (Ik3 / 1000) * math.sqrt(Tk_default) * 1000 / k
            cable_check = {
                "selected_mm2":    p.cable_size_mm2,
                "required_mm2":    round(S_min, 1),
                "adequate":        p.cable_size_mm2 >= S_min,
                "k_factor":        k,
                "fault_duration_s":Tk_default,
            }

        return {
            "fault_type": p.fault_type,
            "system": {
                "voltage_kv":   p.system_voltage_kv,
                "frequency_hz": f,
                "voltage_factor_c": c,
            },
            "impedances": {
                "grid_r_ohm":  round(Rg, 5),
                "grid_x_ohm":  round(Xg, 5),
                "trafo_r_ohm": round(Rt, 5),
                "trafo_x_ohm": round(Xt, 5),
                "cable_r_ohm": round(Rc, 5),
                "cable_x_ohm": round(Xc, 5),
                "total_r_ohm": round(R_total, 5),
                "total_x_ohm": round(X_total, 5),
                "total_z_ohm": round(Z_total, 5),
                "r_x_ratio":   round(RX_ratio, 3),
            },
            "results": {
                # جریان‌های اتصال کوتاه
                "isc_three_phase_ka":    round(Ik3 / 1000, 3),
                "isc_line_line_ka":      round(Ik2 / 1000, 3),
                "isc_single_phase_ka":   round(Ik1 / 1000, 3),
                "isc_double_earth_ka":   round(Ik2e / 1000, 3),
                # جریان انتخاب‌شده بر اساس نوع خطا
                "isc_selected_ka":       round(Isc_selected / 1000, 3),
                # پیک
                "kappa":                 round(kappa, 3),
                "peak_current_ka":       round(ip / 1000, 3),
                # حرارتی
                "thermal_current_ka":    round(Ith / 1000, 3),
                "thermal_fault_time_s":  Tk,
                # توان
                "fault_mva":             round(Sk3, 2),
                # سهم موتور
                "motor_contribution_ka": round(motor_ik3 / 1000, 3) if motor_ik3 else None,
            },
            "cable_check":   cable_check,
            "standard_refs": {
                "main":    "IEC 60909-0:2016",
                "effects": "IEC 60865-1",
                "cable":   "IEC 60364-5-54",
                "note":    "Voltage factor c=1.1 for max Isc (LV/MV), c=0.95 for min Isc",
            },
            "recommendations": self._recommendations(Ik3, ip, Ith, cable_check),
        }

    # ── helpers ───────────────────────────────────────────────────────────────

    def _grid_impedance(self, p: ShortCircuitInput, Vn: float):
        if p.grid_r_ohm is not None and p.grid_x_ohm is not None:
            return p.grid_r_ohm, p.grid_x_ohm
        if p.grid_fault_level_mva:
            Sk  = p.grid_fault_level_mva * 1e6
            Zg  = Vn**2 / Sk
            Rg  = Zg * 0.1   # R/X ≈ 0.1 برای شبکه فشارمتوسط
            Xg  = Zg * math.sqrt(1 - 0.1**2)
            return Rg, Xg
        return 0.0, 0.0

    def _transformer_impedance(self, p: ShortCircuitInput):
        if not p.transformer_kva or not p.transformer_lv_kv:
            return 0.0, 0.0, 0.0
        Vn2  = p.transformer_lv_kv * 1000
        Sn   = p.transformer_kva * 1000
        Zb   = Vn2**2 / Sn           # impedance base (Ω)
        Zt   = (p.transformer_vk_pct / 100) * Zb
        Rt   = (p.transformer_vkr_pct / 100) * Zb
        Xt   = math.sqrt(Zt**2 - Rt**2)
        return Rt, Xt, Zt

    def _cable_impedance(self, p: ShortCircuitInput):
        if not p.cable_length_m:
            return 0.0, 0.0
        L = p.cable_length_m / 1000  # km
        if p.cable_r_ohm_per_km and p.cable_x_ohm_per_km:
            return p.cable_r_ohm_per_km * L, p.cable_x_ohm_per_km * L
        if p.cable_size_mm2:
            rho = 0.0172 if p.cable_material == "copper" else 0.0282   # Ω·mm²/m
            r   = (rho * 1000) / p.cable_size_mm2  # Ω/km
            x   = 0.08  # Ω/km تقریبی
            return r * L, x * L
        return 0.0, 0.0

    def _kappa(self, rx: float) -> float:
        """IEC 60909 Table 3 — ضریب پیک κ"""
        if rx <= 0:
            return 1.02
        return 1.02 + 0.98 * math.exp(-3 * rx)

    def _m_factor(self, kappa: float, Tk: float, f: float) -> float:
        """IEC 60909 eq. 74 — ضریب اثر DC"""
        return (1 / (2 * f * Tk)) * ((kappa - 1)**2)

    def _recommendations(self, Ik3, ip, Ith, cable_check) -> list:
        recs = []
        Ik3_ka = Ik3 / 1000
        ip_ka  = ip  / 1000
        if Ik3_ka > 25:
            recs.append(f"⚠️ جریان اتصال کوتاه سه‌فاز {Ik3_ka:.1f} kA — کلیدها باید rated ≥{math.ceil(Ik3_ka/5)*5} kA باشند")
        if ip_ka > 63:
            recs.append(f"⚠️ جریان پیک {ip_ka:.1f} kA — نیاز به شینه با استحکام الکترودینامیکی بالا")
        if cable_check and not cable_check["adequate"]:
            recs.append(
                f"❌ کابل {cable_check['selected_mm2']} mm² برای جریان اتصال کوتاه کافی نیست"
                f" — حداقل {cable_check['required_mm2']} mm² لازم است (IEC 60364-5-54)"
            )
        if not recs:
            recs.append("✅ مقادیر در محدوده قابل قبول — تجهیزات را با rated values تطبیق دهید")
        return recs
