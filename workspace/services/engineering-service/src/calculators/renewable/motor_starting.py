# src/calculators/renewable/motor_starting.py
"""
MOT-001: Motor Starting Current and Voltage Drop Analysis

Standards:
  IEC 60034-1  — Rotating Electrical Machines
  IEC 60909-0  — Short-Circuit Currents
  NEMA MG-1    — Motors and Generators

Starting Methods:
  DOL            : Direct-On-Line  (Ia = 5–8 × In)
  StarDelta      : Y-Δ starter     (Ia = 1/3 × DOL current)
  Autotransformer: (Ia ∝ tap ratio²)
  SoftStarter    : Ia = 2–4 × In (adjustable)
  VFD            : Ia ≈ 1.0–1.5 × In (no starting surge)
"""

import math
from typing import Dict, Any

from src.core.base_calculator import BaseCalculator
from .schemas import MotorStartingInput


# Starting current factors by method
STARTING_FACTORS = {
    "DOL":              {"current_factor": 6.0, "torque_factor": 1.5, "voltage_factor": 1.0},
    "StarDelta":        {"current_factor": 2.0, "torque_factor": 0.5, "voltage_factor": 0.577},
    "Autotransformer":  {"current_factor": 3.0, "torque_factor": 0.64, "voltage_factor": 0.80},
    "SoftStarter":      {"current_factor": 3.5, "torque_factor": 1.0, "voltage_factor": 0.70},
    "VFD":              {"current_factor": 1.2, "torque_factor": 1.5, "voltage_factor": 0.20},
}


class MotorStartingCalculator(BaseCalculator[MotorStartingInput]):
    """
    MOT-001: Motor Starting Analysis
    """

    CALCULATION_CODE = "MOT-001"
    CALCULATION_NAME = "Motor Starting Current & Voltage Drop"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 60034 / IEC 60909"
    STANDARD_VERSION = "2022"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self):
        return {
            "full_load_current_a":  "A",
            "starting_current_a":   "A",
            "starting_kva":         "kVA",
            "voltage_dip_pct":      "%",
            "voltage_terminal_v":   "V",
            "z_total_mohm":         "mΩ",
        }

    def validate_inputs(self, inputs: MotorStartingInput) -> bool:
        if inputs.starting_method not in STARTING_FACTORS and inputs.starting_method not in [
            "DOL", "StarDelta", "Autotransformer", "SoftStarter", "VFD"
        ]:
            raise ValueError(f"Invalid starting method. Use: {list(STARTING_FACTORS.keys())}")
        return True

    def _calculate(self, inputs: MotorStartingInput) -> Dict[str, Any]:
        p = inputs
        method_info = STARTING_FACTORS.get(p.starting_method, STARTING_FACTORS["DOL"])

        # ── Full Load Current ────────────────────────────────────────────────
        # I_FL = P / (√3 × V × η × cosφ)
        flc_a = (p.motor_kw * 1000) / (
            math.sqrt(3) * p.motor_voltage_v * p.motor_efficiency * p.motor_power_factor
        )

        # ── Starting Current ─────────────────────────────────────────────────
        ia_factor = p.starting_current_factor * method_info["voltage_factor"]**2
        starting_current_a = flc_a * ia_factor

        # ── Transformer impedance ────────────────────────────────────────────
        # Z_tr = (V² / S) × (Uk% / 100)
        z_transformer = (
            (p.motor_voltage_v ** 2) / (p.transformer_kva * 1000)
        ) * (p.transformer_impedance_pct / 100)

        # ── Cable impedance ──────────────────────────────────────────────────
        # Z_cable = R × L (one-way, doubled for return)
        z_cable = (p.cable_resistance_mohm_m / 1000) * p.cable_length_m * 2  # both conductors

        # ── Voltage drop during starting ─────────────────────────────────────
        # ΔV% ≈ (I_start × Z_source) / V_rated × 100
        z_total = z_transformer + z_cable

        # Voltage at motor terminals during starting
        # More accurate: V_dip = I_start × Z / V_rated (per phase)
        v_base = p.motor_voltage_v / math.sqrt(3)  # phase voltage
        v_dip_v = starting_current_a * z_total / math.sqrt(3)
        v_dip_pct = (v_dip_v / v_base) * 100 * method_info["voltage_factor"]

        v_terminal_starting = p.motor_voltage_v * (1 - v_dip_pct / 100)

        # ── Power demand during starting ─────────────────────────────────────
        starting_kva = math.sqrt(3) * p.motor_voltage_v * starting_current_a / 1000
        starting_kw  = starting_kva * 0.15  # typical starting power factor ≈ 0.15

        # ── Assessment ──────────────────────────────────────────────────────
        voltage_dip_ok = v_dip_pct <= p.allowable_voltage_dip_pct
        transformer_loading_pct = (starting_kva / p.transformer_kva) * 100

        # ── Starting time estimate ───────────────────────────────────────────
        # Simplified: t_start ≈ J × ω² / (2 × T_acc × P)
        # For approximate: t ≈ 0.5–3s for direct start
        starting_time_s = max(0.5, 3.0 * (p.motor_kw / 100) ** 0.5)

        # ── Recommendations ──────────────────────────────────────────────────
        warnings = []
        recommendations = []

        if v_dip_pct > p.allowable_voltage_dip_pct:
            warnings.append(
                f"⚠️ افت ولتاژ {v_dip_pct:.1f}% بیشتر از حد مجاز {p.allowable_voltage_dip_pct}% است"
            )
            if p.starting_method == "DOL":
                recommendations.append("استفاده از Star-Delta یا Soft Starter توصیه می‌شود")
            if p.starting_method != "VFD":
                recommendations.append("VFD (Variable Frequency Drive) کمترین افت ولتاژ را دارد")

        if transformer_loading_pct > 80:
            warnings.append(f"⚠️ بارگذاری ترانسفورماتور حین راه‌اندازی: {transformer_loading_pct:.0f}%")

        recommendations.extend([
            f"جریان راه‌اندازی: {starting_current_a:.0f}A ({ia_factor:.1f}× FLC)",
            f"افت ولتاژ: {v_dip_pct:.1f}% — {'✓ مجاز' if voltage_dip_ok else '✗ بیش از حد'}",
            f"برای کاهش افت ولتاژ: کابل ضخیم‌تر یا روش راه‌اندازی نرم‌تر",
        ])

        return {
            # Motor rated values
            "motor_kw":              p.motor_kw,
            "motor_voltage_v":       p.motor_voltage_v,
            "full_load_current_a":   round(flc_a, 1),
            "motor_power_factor":    p.motor_power_factor,
            "motor_efficiency":      p.motor_efficiency,

            # Starting method
            "starting_method":       p.starting_method,
            "current_factor":        round(ia_factor, 2),
            "starting_current_a":    round(starting_current_a, 1),
            "starting_kva":          round(starting_kva, 1),
            "starting_kw":           round(starting_kw, 1),

            # Impedances
            "z_transformer_ohm":     round(z_transformer * 1000, 3),  # mΩ
            "z_cable_ohm":           round(z_cable * 1000, 3),        # mΩ
            "z_total_mohm":          round((z_transformer + z_cable) * 1000, 3),

            # Voltage during starting
            "voltage_dip_pct":       round(v_dip_pct, 2),
            "voltage_terminal_v":    round(v_terminal_starting, 1),
            "voltage_dip_ok":        voltage_dip_ok,
            "allowable_dip_pct":     p.allowable_voltage_dip_pct,

            # Transformer loading
            "transformer_kva":           p.transformer_kva,
            "transformer_loading_pct":   round(transformer_loading_pct, 1),

            # Timing
            "estimated_starting_time_s": round(starting_time_s, 1),

            # Summary
            "starting_method_info": {
                "DOL":             "جریان 5-8 برابر FLC — ساده اما بیشترین اثر روی شبکه",
                "StarDelta":       "جریان 1/3 DOL — نیاز به 6 سیم موتور",
                "Autotransformer": "جریان و گشتاور کنترل‌شده با تپ",
                "SoftStarter":     "راه‌اندازی نرم الکترونیکی — گشتاور قابل تنظیم",
                "VFD":             "کمترین جریان — کنترل کامل سرعت و گشتاور",
            }.get(p.starting_method, ""),

            "warnings":        warnings,
            "recommendations": recommendations,

            "standards": {
                "motor":    "IEC 60034-1",
                "starting": "NEMA MG-1 / IEC 60947-4",
            },
        }
