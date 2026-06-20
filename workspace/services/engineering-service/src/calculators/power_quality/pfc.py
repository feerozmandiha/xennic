"""
CAP-001: Power Factor Correction Calculator

Based on IEC 60831 (Shunt power capacitors) and IEC 61000-2-2.

Formulas:
  Q_c = P × (tan φ₁ - tan φ₂)
  S₁  = P / cos φ₁
  S₂  = P / cos φ₂
  I   = S / (√3 × V)   [three-phase]

  tan φ = √(1/cos²φ - 1)

  Loss reduction: ΔP = 3 × I² × R × (1 - (cos φ₁/cos φ₂)²)

  Resonant harmonic order: h_r = √(S_sc / Q_c)
    where S_sc ≈ S / (detuning_factor as impedance)
"""

import math
from typing import Dict, Optional

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import PFCorrectionInput

# Standard capacitor bank sizes (kVAr) per IEC 60831
STANDARD_BANK_SIZES = [2.5, 5, 7.5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75,
                       100, 150, 200, 250, 300, 400, 500, 600, 800, 1000]


def _calc_tan_phi(cos_phi: float) -> float:
    return math.sqrt(1.0 / (cos_phi * cos_phi) - 1.0) if 0 < cos_phi < 1 else 0.0


class PFCorrectionCalculator(BaseCalculator[PFCorrectionInput]):
    """
    CAP-001: Power Factor Correction Calculator

    Sizes capacitor banks and computes savings per IEC 60831.
    """

    CALCULATION_CODE = "CAP-001"
    CALCULATION_NAME = "Power Factor Correction"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 60831 / IEC 61000-2-2"
    STANDARD_VERSION = "2020"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self) -> Dict[str, str]:
        return {
            "required_kvar": "kVAr",
            "recommended_bank_kvar": "kVAr",
            "current_before_a": "A",
            "current_after_a": "A",
            "current_reduction_percent": "%",
            "apparent_power_before_kva": "kVA",
            "apparent_power_after_kva": "kVA",
            "active_power_kw": "kW",
            "reactive_power_before_kvar": "kVAr",
            "reactive_power_after_kvar": "kVAr",
            "power_loss_reduction_kw": "kW",
            "annual_energy_savings_kwh": "kWh",
            "annual_cost_savings_usd": "USD",
            "payback_period_years": "years",
            "resonant_harmonic_order": "pu",
        }

    def validate_inputs(self, inputs: PFCorrectionInput) -> bool:
        ValidationEngine.validate_positive(inputs.power_factor_target, "power_factor_target")
        ValidationEngine.validate_physical_range(inputs.power_factor_target, 0.5, 1.0, "power_factor_target")
        if inputs.detuning_pct > 0:
            ValidationEngine.validate_physical_range(inputs.detuning_pct, 1, 14, "detuning_pct")
        return True

    def _calculate(self, inputs: PFCorrectionInput) -> Dict:
        # Determine P (kW) and initial PF
        if inputs.active_power_kw and inputs.power_factor_current:
            p_kw = inputs.active_power_kw
            pf1 = inputs.power_factor_current
        elif inputs.apparent_power_kva and inputs.power_factor_current:
            p_kw = inputs.apparent_power_kva * inputs.power_factor_current
            pf1 = inputs.power_factor_current
        else:
            raise ValueError("Insufficient input data")

        pf2 = inputs.power_factor_target

        # Q_c = P × (tan φ₁ - tan φ₂)
        tan1 = _calc_tan_phi(pf1)
        tan2 = _calc_tan_phi(pf2)
        qc_kvar = p_kw * (tan1 - tan2)

        if qc_kvar < 0:
            qc_kvar = 0.0

        # Recommended standard bank
        recommended = qc_kvar
        for size in STANDARD_BANK_SIZES:
            if size >= qc_kvar:
                recommended = float(size)
                break

        # Apparent powers
        s1_kva = p_kw / pf1 if pf1 > 0 else 0
        s2_kva = p_kw / pf2 if pf2 > 0 else 0

        # Currents (three-phase)
        v = inputs.voltage_v
        i1 = (s1_kva * 1000) / (math.sqrt(3) * v) if v > 0 else 0
        i2 = (s2_kva * 1000) / (math.sqrt(3) * v) if v > 0 else 0

        current_reduction = ((i1 - i2) / i1 * 100) if i1 > 0 else 0

        # Reactive powers
        q1_kvar = p_kw * tan1
        q2_kvar = p_kw * tan2

        # Actual achieved PF after correction with standard bank
        q_actual_kvar = q1_kvar - recommended
        pf_actual = math.cos(math.atan(abs(q_actual_kvar) / p_kw)) if p_kw > 0 else pf2

        # Loss reduction in cables (I²R)
        loss_reduction_kw: Optional[float] = None
        if inputs.cable_resistance_per_phase_ohm is not None and inputs.cable_resistance_per_phase_ohm > 0:
            r = inputs.cable_resistance_per_phase_ohm
            loss_before = 3 * (i1 ** 2) * r / 1000
            loss_after = 3 * (i2 ** 2) * r / 1000
            loss_reduction_kw = loss_before - loss_after

        # Annual savings
        annual_savings_kwh: Optional[float] = None
        annual_savings_usd: Optional[float] = None
        if loss_reduction_kw is not None and inputs.load_hours_per_year:
            annual_savings_kwh = loss_reduction_kw * inputs.load_hours_per_year
            if inputs.energy_cost_per_kwh:
                annual_savings_usd = annual_savings_kwh * inputs.energy_cost_per_kwh

        # Payback
        payback_years: Optional[float] = None
        if annual_savings_usd is not None and annual_savings_usd > 0 and inputs.capacitor_cost_per_kvar:
            total_cost = recommended * inputs.capacitor_cost_per_kvar
            payback_years = total_cost / annual_savings_usd

        # Resonant harmonic with detuning
        resonant_h: Optional[float] = None
        detuning = inputs.detuning_pct > 0
        if detuning:
            pct = inputs.detuning_pct / 100.0
            resonant_h = round(1.0 / math.sqrt(pct), 2)

        return {
            "required_kvar": round(qc_kvar, 2),
            "recommended_bank_kvar": recommended,
            "current_before_a": round(i1, 2),
            "current_after_a": round(i2, 2),
            "current_reduction_percent": round(current_reduction, 2),
            "apparent_power_before_kva": round(s1_kva, 2),
            "apparent_power_after_kva": round(s2_kva, 2),
            "pf_actual_after": round(pf_actual, 4),
            "active_power_kw": round(p_kw, 2),
            "reactive_power_before_kvar": round(q1_kvar, 2),
            "reactive_power_after_kvar": round(max(q2_kvar, 0), 2),
            "power_loss_reduction_kw": round(loss_reduction_kw, 3) if loss_reduction_kw is not None else None,
            "annual_energy_savings_kwh": round(annual_savings_kwh, 0) if annual_savings_kwh is not None else None,
            "annual_cost_savings_usd": round(annual_savings_usd, 2) if annual_savings_usd is not None else None,
            "payback_period_years": round(payback_years, 2) if payback_years is not None else None,
            "resonant_harmonic_order": resonant_h,
            "detuning_reactor_required": detuning,
            "standard": "IEC 60831 / IEC 61000-2-2",
        }
