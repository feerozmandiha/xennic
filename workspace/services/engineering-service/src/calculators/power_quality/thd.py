# src/calculators/power_quality/thd.py
"""
PQ-001: Total Harmonic Distortion (THD) Calculator

Standard: IEEE 519-2022 — Section 5
Formula:  THD_I = sqrt(Σ I_h²) / I_1 × 100  (h = 2..N)

THD measures how much the waveform deviates from a pure sine wave.
"""

import math
from typing import Dict, List, Any

from src.core.base_calculator import BaseCalculator, ChartCurveData, EngineeringChart, HarmonicBinData
from src.core.validation import ValidationEngine
from .schemas import THDInput


# IEEE 519-2022 Table 1 — Voltage distortion limits at PCC
_IEEE519_VOLTAGE_LIMITS: Dict[str, Dict[str, float]] = {
    "≤1kV":    {"individual": 5.0,  "thd": 8.0},
    "1-69kV":  {"individual": 3.0,  "thd": 5.0},
    "69-161kV":{"individual": 1.5,  "thd": 2.5},
    ">161kV":  {"individual": 1.0,  "thd": 1.5},
}


def _get_voltage_category(voltage_kv: float | None) -> str:
    if voltage_kv is None:
        return "1-69kV"  # default: distribution
    if voltage_kv <= 1:
        return "≤1kV"
    if voltage_kv <= 69:
        return "1-69kV"
    if voltage_kv <= 161:
        return "69-161kV"
    return ">161kV"


class THDCalculator(BaseCalculator[THDInput]):
    """
    PQ-001: THD Calculator
    Calculates Total Harmonic Distortion for current or voltage waveforms.
    """

    CALCULATION_CODE = "PQ-001"
    CALCULATION_NAME = "Total Harmonic Distortion (THD)"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEEE 519"
    STANDARD_VERSION = "2022"
    ENGINE_VERSION   = "0.1.0"

    def validate_inputs(self, inputs: THDInput) -> bool:
        ValidationEngine.validate_positive(
            inputs.harmonic_currents[1], "fundamental (order=1)"
        )
        return True

    def _calculate(self, inputs: THDInput) -> Dict[str, Any]:
        spectrum   = inputs.harmonic_currents
        i_fund     = spectrum[1]
        harmonics  = {h: v for h, v in spectrum.items() if h != 1}

        # THD = sqrt(Σ I_h²) / I_1 × 100
        sum_sq     = sum(v ** 2 for v in harmonics.values())
        thd_pct    = (math.sqrt(sum_sq) / i_fund) * 100.0

        # Dominant harmonic
        dominant_order = max(harmonics, key=harmonics.get) if harmonics else None
        dominant_pct   = (harmonics[dominant_order] / i_fund * 100.0) if dominant_order else 0.0

        # RMS total current
        total_rms  = math.sqrt(i_fund ** 2 + sum_sq)
        crest_factor = (i_fund * math.sqrt(2)) / total_rms if total_rms > 0 else math.sqrt(2)

        # IEEE 519 compliance
        cat = _get_voltage_category(inputs.base_voltage_kv)
        limit = _IEEE519_VOLTAGE_LIMITS[cat]
        is_compliant = thd_pct <= limit["thd"]

        # Harmonic spectrum as percentage of fundamental
        spectrum_pct: Dict[str, float] = {
            str(h): round(v / i_fund * 100.0, 3)
            for h, v in harmonics.items()
        }

        # Warnings & Recommendations
        warnings: List[str] = []
        recommendations: List[str] = []

        if not is_compliant:
            warnings.append(
                f"THD {thd_pct:.2f}% exceeds IEEE 519 limit of {limit['thd']}% "
                f"for {cat} systems"
            )
            recommendations.append(
                "Install harmonic filters or consider active power filter (APF)"
            )
        if dominant_order and harmonics[dominant_order] / i_fund > 0.1:
            recommendations.append(
                f"Design single-tuned passive filter for {dominant_order}th harmonic "
                f"({dominant_pct:.1f}% of fundamental)"
            )
        if thd_pct > 20:
            warnings.append(
                "High THD may cause transformer overheating — verify K-factor rating"
            )
            recommendations.append("Check transformer K-factor compatibility (use PQ-003)")

        return {
            "thd_percent":          round(thd_pct, 4),
            "fundamental_a":        round(i_fund, 4),
            "total_rms_a":          round(total_rms, 4),
            "harmonic_rms_a":       round(math.sqrt(sum_sq), 4),
            "dominant_harmonic_order": dominant_order,
            "dominant_harmonic_percent": round(dominant_pct, 3),
            "crest_factor":         round(crest_factor, 4),
            "spectrum_percent":     spectrum_pct,
            "ieee519_voltage_category": cat,
            "ieee519_thd_limit":    limit["thd"],
            "ieee519_individual_limit": limit["individual"],
            "is_compliant":         is_compliant,
            "warnings":             warnings,
            "recommendations":      recommendations,
        }

    def get_charts(self, inputs: THDInput, results: Dict[str, Any]) -> list[EngineeringChart]:
        """Generate harmonic spectrum bar chart."""
        harmonics_list: list[HarmonicBinData] = [
            HarmonicBinData(order=h, magnitude_percent=round(v / inputs.harmonic_currents[1] * 100.0, 2))
            for h, v in sorted(inputs.harmonic_currents.items())
            if h != 1
        ]

        return [
            EngineeringChart(
                type="harmonic",
                title="Harmonic Current Spectrum",
                harmonics=sorted(harmonics_list, key=lambda x: x.order),
                thd_percent=results.get("thd_percent"),
                limit_percent=results.get("ieee519_thd_limit"),
            ),
        ]

    def get_units(self) -> Dict[str, str]:
        return {
            "fundamental_a":   "A",
            "total_rms_a":     "A",
            "harmonic_rms_a":  "A",
            "thd_percent":     "%",
            "ieee519_thd_limit": "%",
        }
