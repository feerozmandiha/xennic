"""
PFC-001: Capacitor Bank Sizing (IEC 60831)

Standards:
  IEC 60831-1:2014 — Shunt Power Capacitors
  IEC 60931-1     — Shunt Power Capacitors (non-PE)
  IEC 61000-2-2   — Compatibility Levels
  IEEE 18-2012    — Shunt Power Capacitors

Calculations:
  1. Required reactive power (Q_c) based on load and target PF
  2. Standard capacitor bank selection
  3. Step configuration for automatic PFC banks
  4. Detuned reactor selection (if harmonic protection needed)
  5. Resonance check
  6. Inrush current and protection sizing
  7. Economics (savings, payback)
"""

import math
from typing import Dict, Any, Optional

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import CapacitorBankInput


STANDARD_BANK_SIZES = [2.5, 5, 7.5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75,
                       100, 150, 200, 250, 300, 400, 500, 600, 800, 1000]

STANDARD_STEP_SIZES = [2.5, 5, 7.5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75, 100]

STANDARD_DETUNING_PCT = [0.0, 5.67, 7.0, 8.0, 14.0]


def _calc_tan_phi(cos_phi: float) -> float:
    return math.sqrt(1.0 / (cos_phi * cos_phi) - 1.0) if 0 < cos_phi < 1 else 0.0


class CapacitorBankCalculator(BaseCalculator[CapacitorBankInput]):
    """
    PFC-001: Capacitor Bank Sizing (IEC 60831)
    """

    CALCULATION_CODE = "PFC-001"
    CALCULATION_NAME = "Capacitor Bank Sizing"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 60831-1 / IEC 61000-2-2"
    STANDARD_VERSION = "2014"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self) -> Dict[str, str]:
        return {
            "required_kvar":            "kVAr",
            "selected_bank_kvar":       "kVAr",
            "step_count":               "عدد",
            "step_size_kvar":           "kVAr",
            "voltage_v":                "V",
            "current_before_a":         "A",
            "current_after_a":          "A",
            "current_reduction_pct":    "%",
            "max_current_per_step_a":   "A",
            "capacitor_current_a":      "A",
            "short_circuit_kva":        "kVA",
            "inrush_peak_a":            "A",
            "fuse_rating_a":            "A",
            "cable_size_mm2":           "mm²",
            "resonant_harmonic_order":  "pu",
            "annual_savings_usd":       "USD",
            "payback_years":            "years",
        }

    def validate_inputs(self, inputs: CapacitorBankInput) -> bool:
        ValidationEngine.validate_positive(inputs.power_factor_target, "power_factor_target")
        ValidationEngine.validate_physical_range(inputs.power_factor_target, 0.5, 1.0, "power_factor_target")
        if inputs.step_count is not None:
            if inputs.step_count < 1 or inputs.step_count > 20:
                raise ValueError(f"Step count must be 1-20, got {inputs.step_count}")
        if inputs.detuning_pct > 0 and inputs.detuning_pct not in STANDARD_DETUNING_PCT:
            if not (5 <= inputs.detuning_pct <= 14):
                raise ValueError(f"Detuning percentage must be one of {STANDARD_DETUNING_PCT} or between 5-14%")
        return True

    def _calculate(self, inputs: CapacitorBankInput) -> Dict[str, Any]:
        p = inputs

        # ── 1. Determine load parameters ──────────────────────────────────
        if p.active_power_kw and p.power_factor_current:
            p_kw = p.active_power_kw
            pf1 = p.power_factor_current
            s_kva = p_kw / pf1
        elif p.apparent_power_kva and p.power_factor_current:
            s_kva = p.apparent_power_kva
            pf1 = p.power_factor_current
            p_kw = s_kva * pf1
        else:
            raise ValueError("Provide active_power_kw + power_factor_current or apparent_power_kva + power_factor_current")

        pf2 = p.power_factor_target

        # ── 2. Required reactive power ────────────────────────────────────
        tan1 = _calc_tan_phi(pf1)
        tan2 = _calc_tan_phi(pf2)
        qc_kvar = p_kw * (tan1 - tan2)
        qc_kvar = max(qc_kvar, 0.0)

        # ── 3. Standard bank selection ────────────────────────────────────
        selected_bank = qc_kvar
        for size in STANDARD_BANK_SIZES:
            if size >= qc_kvar:
                selected_bank = float(size)
                break

        # ── 4. Step configuration ─────────────────────────────────────────
        effective_steps = p.step_count if p.step_count is not None else 1
        if effective_steps > 1:
            raw_step_kvar = selected_bank / effective_steps
            step_kvar = raw_step_kvar
            for std_step in STANDARD_STEP_SIZES:
                if std_step >= raw_step_kvar:
                    step_kvar = float(std_step)
                    break
            actual_steps = max(1, round(selected_bank / step_kvar))
            actual_bank_kvar = actual_steps * step_kvar
        else:
            step_kvar = selected_bank
            actual_steps = 1
            actual_bank_kvar = selected_bank

        # ── 5. Electrical parameters ──────────────────────────────────────
        v = p.voltage_v
        i1 = (s_kva * 1000) / (math.sqrt(3) * v) if v > 0 else 0

        s2_kva = p_kw / pf2 if pf2 > 0 else s_kva
        i2 = (s2_kva * 1000) / (math.sqrt(3) * v) if v > 0 else 0
        current_reduction_pct = ((i1 - i2) / i1 * 100) if i1 > 0 else 0

        capacitor_line_current_a = (actual_bank_kvar * 1000) / (math.sqrt(3) * v) if v > 0 else 0
        max_current_per_step = (step_kvar * 1000) / (math.sqrt(3) * v) if v > 0 else 0

        # ── 6. Short-circuit and inrush ────────────────────────────────────
        sc_kva = p.short_circuit_mva * 1000 if p.short_circuit_mva else s_kva * 20
        sc_current_a = (sc_kva * 1000) / (math.sqrt(3) * v) if v > 0 else 0

        step_capacitance_f = (step_kvar * 1000) / (2 * math.pi * p.system_freq_hz * v * v) if v > 0 else 0
        total_capacitance_f = (actual_bank_kvar * 1000) / (2 * math.pi * p.system_freq_hz * v * v) if v > 0 else 0
        inductive_reactance_ohm = (v * v) / (sc_kva * 1000) if sc_kva > 0 else 0.001
        inrush_peak_a = math.sqrt(2) * (v / math.sqrt(3)) / math.sqrt(
            inductive_reactance_ohm * (1.0 / (2 * math.pi * p.system_freq_hz * total_capacitance_f))
        ) if inductive_reactance_ohm > 0 and total_capacitance_f > 0 else 0

        # ── 7. Detuning ──────────────────────────────────────────────────
        detuning = p.detuning_pct > 0
        detuning_pct = p.detuning_pct if detuning else 0.0
        resonant_h = round(1.0 / math.sqrt(detuning_pct / 100.0), 2) if detuning else None

        if detuning:
            reactor_kvar = actual_bank_kvar * (detuning_pct / 100.0)
            reactor_inductance_mh = (
                (detuning_pct / 100.0) * (v * v) / (2 * math.pi * p.system_freq_hz * actual_bank_kvar * 1000)
            ) * 1000 if actual_bank_kvar > 0 else 0
        else:
            reactor_kvar = 0.0
            reactor_inductance_mh = 0.0

        # ── 8. Protection sizing ──────────────────────────────────────────
        fuse_rating_a = math.ceil(capacitor_line_current_a * 1.43 / 10) * 10

        cable_size_a = capacitor_line_current_a * 1.5
        if cable_size_a <= 30:
            cable_mm2 = 6.0
        elif cable_size_a <= 50:
            cable_mm2 = 10.0
        elif cable_size_a <= 70:
            cable_mm2 = 16.0
        elif cable_size_a <= 95:
            cable_mm2 = 25.0
        elif cable_size_a <= 120:
            cable_mm2 = 35.0
        elif cable_size_a <= 150:
            cable_mm2 = 50.0
        else:
            cable_mm2 = 70.0

        # ── 9. Economics ──────────────────────────────────────────────────
        annual_savings_kwh: Optional[float] = None
        annual_savings_usd: Optional[float] = None
        payback_years: Optional[float] = None

        if p.load_hours_per_year:
            current_reduction_kw = (s_kva - s2_kva) * 1
            annual_savings_kwh = current_reduction_kw * p.load_hours_per_year
            if p.energy_cost_per_kwh:
                annual_savings_usd = annual_savings_kwh * p.energy_cost_per_kwh
                if p.energy_cost_per_kwh > 0:
                    bank_cost = actual_bank_kvar * (p.capacitor_cost_per_kvar or 15.0)
                    payback_years = bank_cost / annual_savings_usd if annual_savings_usd > 0 else None

        # ── 10. Warnings ──────────────────────────────────────────────────
        warnings = []
        if resonant_h is not None and resonant_h < 5:
            warnings.append(f"Resonant frequency at {resonant_h}th harmonic — close to 5th, risk of resonance")
        if pf_actual_after := math.cos(math.atan(abs(p_kw * tan1 - actual_bank_kvar) / p_kw)) if p_kw > 0 else pf2:
            if pf_actual_after > 0.99:
                warnings.append(f"PF after correction ({pf_actual_after:.3f}) is very high — risk of over-correction")
        if inrush_peak_a > 1000:
            warnings.append(f"High inrush current ({inrush_peak_a:.0f}A peak) — consider series reactor or inrush limiting")

        recommendations = [
            f"Install {actual_bank_kvar:.0f} kVAr capacitor bank in {actual_steps} steps of {step_kvar:.0f} kVAr each",
            f"Line current reduction: {i1:.0f}A → {i2:.0f}A ({current_reduction_pct:.0f}% reduction)",
        ]
        if detuning:
            recommendations.append(f"Detuned reactor: {detuning_pct}%, tuning frequency to {resonant_h}th harmonic")
            recommendations.append(f"Reactor rating: {reactor_kvar:.1f} kVAr, {reactor_inductance_mh:.1f} mH")
        recommendations.extend([
            f"Capacitor fuse: {fuse_rating_a}A per phase",
            f"Cable: {cable_mm2:.0f} mm² copper minimum",
            f"Est. annual savings: ${annual_savings_usd:,.0f}" if annual_savings_usd else "",
        ])
        recommendations = [r for r in recommendations if r]

        protection_notes = [
            f"Overcurrent protection: {fuse_rating_a}A gG fuse per phase",
            f"Discharge resistor required for each step (discharge to <50V in 1 min per IEC 60831)",
        ]
        if detuning:
            protection_notes.append("Detuning reactors must be installed in series with each capacitor step")
            protection_notes.append("Verify harmonic environment — resonant peak should not align with dominant harmonics")

        return {
            "load_power_kw":                round(p_kw, 2),
            "power_factor_current":         pf1,
            "power_factor_target":          pf2,
            "power_factor_actual":          round(pf_actual_after, 4) if p_kw > 0 else pf2,
            "required_kvar":                round(qc_kvar, 2),
            "selected_bank_kvar":           actual_bank_kvar,
            "step_count":                   actual_steps,
            "step_size_kvar":               round(step_kvar, 2),
            "voltage_v":                    v,
            "system_freq_hz":               p.system_freq_hz,
            "current_before_a":             round(i1, 1),
            "current_after_a":              round(i2, 1),
            "current_reduction_pct":        round(current_reduction_pct, 2),
            "capacitor_line_current_a":     round(capacitor_line_current_a, 1),
            "max_current_per_step_a":       round(max_current_per_step, 2),
            "short_circuit_kva":            round(sc_kva, 0),
            "short_circuit_current_a":      round(sc_current_a, 1),
            "inrush_peak_current_a":        round(inrush_peak_a, 1),
            "detuning_pct":                 detuning_pct,
            "detuning_required":            detuning,
            "detuning_type": f"{detuning_pct}% (tuned to {resonant_h}th harmonic)" if detuning else None,
            "resonant_harmonic_order":      resonant_h,
            "reactor_kvar":                 round(reactor_kvar, 2) if detuning else None,
            "reactor_inductance_mh":        round(reactor_inductance_mh, 2) if detuning else None,
            "fuse_rating_a":                fuse_rating_a,
            "recommended_cable_mm2":        cable_mm2,
            "annual_energy_savings_kwh":    round(annual_savings_kwh, 0) if annual_savings_kwh is not None else None,
            "annual_cost_savings_usd":      round(annual_savings_usd, 2) if annual_savings_usd is not None else None,
            "payback_years":                round(payback_years, 2) if payback_years is not None else None,
            "protection_notes":             protection_notes,
            "recommendation_notes":         recommendations,
            "warnings":                     warnings,
            "standard":                     "IEC 60831-1:2014 / IEC 61000-2-2",
        }
