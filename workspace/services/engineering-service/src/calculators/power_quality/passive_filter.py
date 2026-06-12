# src/calculators/power_quality/passive_filter.py
"""
PQ-005: Single-Tuned Passive Harmonic Filter Design

Standard: IEEE 519-2022 / IEC 61000-4-7
Tuning:   f_t = f_1 × h_target × detuning_factor
          X_C = V² / Q_C   (capacitive reactance)
          X_L = X_C / h_t² (inductive reactance at tuning)
          L   = X_L / (2π × f_1)
          C   = 1 / (X_C × 2π × f_1)

A single-tuned passive filter provides a low-impedance path for the
target harmonic, diverting it from the rest of the system.
"""

import math
from typing import Dict, List, Any

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import PassiveFilterInput


class PassiveFilterCalculator(BaseCalculator[PassiveFilterInput]):
    """
    PQ-005: Single-Tuned Passive Harmonic Filter Designer
    """

    CALCULATION_CODE = "PQ-005"
    CALCULATION_NAME = "Single-Tuned Passive Harmonic Filter Design"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEEE 519 / IEC 61000-4-7"
    STANDARD_VERSION = "2022"
    ENGINE_VERSION   = "0.1.0"

    def validate_inputs(self, inputs: PassiveFilterInput) -> bool:
        ValidationEngine.validate_positive(inputs.system_voltage_v,   "system_voltage_v")
        ValidationEngine.validate_positive(inputs.harmonic_current_a, "harmonic_current_a")
        return True

    def _calculate(self, inputs: PassiveFilterInput) -> Dict[str, Any]:
        h       = inputs.target_harmonic_order
        v_ll    = inputs.system_voltage_v           # V line-to-line
        v_ln    = v_ll / math.sqrt(3)               # V line-to-neutral
        i_h     = inputs.harmonic_current_a         # A (RMS) harmonic current
        f1      = inputs.system_freq_hz
        q       = inputs.q_factor
        p       = inputs.detuning_factor            # detuning factor

        # Tuned frequency (with detuning)
        h_t   = h * p                               # effective tuned order
        f_t   = h_t * f1                            # tuned frequency (Hz)
        w1    = 2 * math.pi * f1
        w_t   = 2 * math.pi * f_t

        # Reactive power needed to handle harmonic current
        # Q_filter ≈ V_h × I_h (single-phase) × 3 (three-phase)
        v_h   = v_ln                                # voltage at harmonic (approximate)
        q_filter_kvar = (v_h * i_h * 3) / 1000.0   # kVAR (3-phase)

        # Capacitor sizing: Q_C = V_ln² / X_C → X_C = V_ln² / Q_C
        x_c   = (v_ln ** 2) / (q_filter_kvar * 1000.0 / 3)  # Ω per phase
        c_uf  = 1.0 / (x_c * w1) * 1e6             # μF per phase

        # Reactor sizing: X_L = X_C / h_t²
        x_l   = x_c / (h_t ** 2)                   # Ω per phase
        l_mh  = (x_l / w1) * 1000.0                # mH per phase

        # Filter impedance at tuned frequency
        z_filter_at_tuning = x_l / q               # Ω (resistance of filter)

        # Filter impedance at harmonic h (should be very low)
        x_net = abs(h * x_l - x_c / h)             # net reactance at harmonic h
        z_at_harmonic = math.sqrt(z_filter_at_tuning ** 2 + x_net ** 2)

        # Current rating
        i_cap_a = v_ln / x_c                        # fundamental current through capacitor (A)
        i_total_a = math.sqrt(i_cap_a ** 2 + i_h ** 2)  # total RMS current

        # Voltage rating of capacitor (with harmonic voltage)
        v_cap_kv = (v_ln + i_h * x_l) / 1000.0    # kV peak approx

        warnings: List[str] = []
        recommendations: List[str] = []

        if p >= 1.0:
            warnings.append(
                "Detuning factor ≥ 1.0 — filter is tuned AT the harmonic frequency, "
                "which risks parallel resonance. Use p = 0.95–0.98."
            )
        if q_filter_kvar < 10:
            warnings.append("Filter reactive power < 10 kVAR — may have limited effectiveness")
        if v_cap_kv > v_ll / 1000.0 * 1.1:
            warnings.append(
                f"Capacitor voltage rating {v_cap_kv:.2f} kV may exceed system voltage — "
                "verify capacitor voltage class"
            )

        recommendations.append(
            f"Install series reactor {l_mh:.2f} mH + capacitor {c_uf:.2f} μF per phase"
        )
        recommendations.append(
            f"Verify resonance analysis (PQ-004) after filter installation — "
            f"effective tuned order: h_t = {h_t:.2f}"
        )

        return {
            "target_harmonic_order":    h,
            "detuning_factor":          p,
            "tuned_harmonic_order":     round(h_t, 3),
            "tuned_frequency_hz":       round(f_t, 2),
            "filter_kvar_3phase":       round(q_filter_kvar, 3),
            "capacitor_uf_per_phase":   round(c_uf, 4),
            "capacitor_kvar_per_phase": round(q_filter_kvar / 3, 3),
            "reactor_mh_per_phase":     round(l_mh, 4),
            "capacitor_reactance_ohm":  round(x_c, 4),
            "reactor_reactance_ohm":    round(x_l, 4),
            "filter_impedance_at_harmonic_ohm": round(z_at_harmonic, 4),
            "capacitor_current_a":      round(i_cap_a, 3),
            "total_filter_current_a":   round(i_total_a, 3),
            "capacitor_voltage_kv":     round(v_cap_kv, 4),
            "q_factor":                 q,
            "warnings":                 warnings,
            "recommendations":          recommendations,
        }

    def get_units(self) -> Dict[str, str]:
        return {
            "tuned_frequency_hz":    "Hz",
            "filter_kvar_3phase":    "kVAR",
            "capacitor_uf_per_phase": "μF",
            "reactor_mh_per_phase":  "mH",
            "capacitor_reactance_ohm": "Ω",
            "reactor_reactance_ohm": "Ω",
            "capacitor_current_a":   "A",
            "capacitor_voltage_kv":  "kV",
        }
