# src/calculators/power_quality/resonance.py
"""
PQ-004: Parallel Resonance Analysis

Standard: IEC 61000-3 / IEEE 519
Formula:  h_r = sqrt(kVA_sc / kVAR_cap)   [parallel resonance order]
          f_r = h_r × f_1                  [resonant frequency]

When capacitor banks are installed for PFC, they can resonate with
system inductance at a specific harmonic order — amplifying harmonic
voltages and currents to dangerous levels.
"""

import math
from typing import Dict, List, Any, Optional

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import ResonanceInput


class ResonanceCalculator(BaseCalculator[ResonanceInput]):
    """
    PQ-004: Parallel Resonance Analysis
    Identifies risk of resonance between capacitor banks and system impedance.
    """

    CALCULATION_CODE = "PQ-004"
    CALCULATION_NAME = "Parallel Resonance Analysis"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 61000-3 / IEEE 519"
    STANDARD_VERSION = "2022"
    ENGINE_VERSION   = "0.1.0"

    def validate_inputs(self, inputs: ResonanceInput) -> bool:
        ValidationEngine.validate_positive(inputs.system_kva_sc,   "system_kva_sc")
        ValidationEngine.validate_positive(inputs.capacitor_kvar,   "capacitor_kvar")
        ValidationEngine.validate_positive(inputs.fundamental_freq_hz, "fundamental_freq_hz")
        return True

    def _calculate(self, inputs: ResonanceInput) -> Dict[str, Any]:
        kva_sc  = inputs.system_kva_sc
        kvar_c  = inputs.capacitor_kvar
        f1      = inputs.fundamental_freq_hz

        # Parallel resonant harmonic order
        h_r = math.sqrt(kva_sc / kvar_c)
        f_r = h_r * f1

        # Nearest integer harmonic orders to resonance
        h_lower = math.floor(h_r)
        h_upper = math.ceil(h_r)

        # Risk assessment — is resonant order close to a common harmonic?
        # Common harmonics for 6-pulse drives: 5, 7, 11, 13, 17, 19, 23, 25
        common_harmonics = [3, 5, 7, 9, 11, 13, 17, 19, 23, 25]
        risk_level = "LOW"
        risk_harmonics: List[int] = []

        for h in common_harmonics:
            if abs(h - h_r) <= 0.5:   # within 0.5 order = HIGH risk
                risk_level = "HIGH"
                risk_harmonics.append(h)
            elif abs(h - h_r) <= 1.5: # within 1.5 order = MEDIUM risk
                if risk_level != "HIGH":
                    risk_level = "MEDIUM"
                risk_harmonics.append(h)

        # Present harmonics risk check
        if inputs.present_harmonics:
            for h in inputs.present_harmonics:
                if abs(h - h_r) <= 0.5:
                    risk_level = "HIGH"
                    if h not in risk_harmonics:
                        risk_harmonics.append(h)

        # Amplification factor at nearest harmonic (approximate)
        # Q ≈ h_r / (h - h_r) when h ≈ h_r
        amplification_estimates: List[Dict] = []
        for h in (risk_harmonics or [h_lower, h_upper]):
            if h > 0 and abs(h - h_r) > 0.01:
                amp_factor = abs(h_r ** 2 / (h ** 2 - h_r ** 2))
                amplification_estimates.append({
                    "harmonic_order": h,
                    "amplification_factor": round(min(amp_factor, 99.9), 2),
                })

        warnings: List[str] = []
        recommendations: List[str] = []

        if risk_level == "HIGH":
            warnings.append(
                f"HIGH RISK: Resonant order h_r={h_r:.2f} is very close to "
                f"harmonic orders {risk_harmonics}. Severe voltage amplification expected!"
            )
            recommendations.append(
                "Add series reactor to capacitor bank to detune resonance "
                f"(target p = 0.95–0.98 of nearest harmonic frequency)"
            )
            recommendations.append(
                "Calculate detuning reactor: X_L = p² × X_C / h² "
                "where p is the detuning factor (0.97 typical)"
            )
        elif risk_level == "MEDIUM":
            warnings.append(
                f"MEDIUM RISK: Resonant order h_r={h_r:.2f} is near harmonic orders {risk_harmonics}."
            )
            recommendations.append(
                "Consider detuning reactor on capacitor bank for safety margin"
            )
        else:
            recommendations.append(
                f"Low resonance risk. Monitor if additional capacitors are added "
                f"(current h_r = {h_r:.2f})."
            )

        return {
            "resonant_harmonic_order":  round(h_r, 3),
            "resonant_frequency_hz":    round(f_r, 2),
            "nearest_lower_harmonic":   h_lower,
            "nearest_upper_harmonic":   h_upper,
            "risk_level":               risk_level,
            "risk_harmonic_orders":     risk_harmonics,
            "amplification_estimates":  amplification_estimates,
            "system_kva_sc":            kva_sc,
            "capacitor_kvar":           kvar_c,
            "warnings":                 warnings,
            "recommendations":          recommendations,
        }

    def get_units(self) -> Dict[str, str]:
        return {
            "resonant_frequency_hz": "Hz",
            "system_kva_sc":         "kVA",
            "capacitor_kvar":        "kVAR",
        }
