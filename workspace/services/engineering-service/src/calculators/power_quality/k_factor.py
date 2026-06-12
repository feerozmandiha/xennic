# src/calculators/power_quality/k_factor.py
"""
PQ-003: K-Factor Calculator for Power Quality

Standard: UL 1561 / IEEE C57.110
Formula:  K = Σ(I_h² × h²) / Σ(I_h²)

K-Factor quantifies the ability of a transformer to serve non-linear loads.
A K-1 transformer handles pure sine waves; K-13, K-20 etc. handle harmonics.
"""

import math
from typing import Dict, List, Any

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import KFactorPQInput


# Standard K-Factor ratings available in market
_STANDARD_K_RATINGS = [1, 4, 9, 13, 20, 30, 40, 50]


def _next_k_rating(k: float) -> int:
    for rating in _STANDARD_K_RATINGS:
        if rating >= k:
            return rating
    return _STANDARD_K_RATINGS[-1]


class KFactorPQCalculator(BaseCalculator[KFactorPQInput]):
    """
    PQ-003: K-Factor Calculator
    Determines required transformer K-Factor rating for non-linear loads.
    """

    CALCULATION_CODE = "PQ-003"
    CALCULATION_NAME = "K-Factor (Power Quality)"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "UL 1561 / IEEE C57.110"
    STANDARD_VERSION = "2018"
    ENGINE_VERSION   = "0.1.0"

    def validate_inputs(self, inputs: KFactorPQInput) -> bool:
        ValidationEngine.validate_positive(
            inputs.harmonic_currents[1], "fundamental (order=1)"
        )
        return True

    def _calculate(self, inputs: KFactorPQInput) -> Dict[str, Any]:
        spectrum = inputs.harmonic_currents

        # Normalize to per-unit of fundamental
        i1   = spectrum[1]
        i_pu = {h: v / i1 for h, v in spectrum.items()}

        # K = Σ(I_h_pu² × h²) / Σ(I_h_pu²)
        numerator   = sum((amps ** 2) * (order ** 2) for order, amps in i_pu.items())
        denominator = sum(amps ** 2 for amps in i_pu.values())

        k_factor = numerator / denominator if denominator > 0 else 1.0

        # THD from this spectrum
        harmonics_only = {h: v for h, v in spectrum.items() if h != 1}
        thd_pct = (
            math.sqrt(sum(v ** 2 for v in harmonics_only.values())) / i1 * 100.0
            if harmonics_only else 0.0
        )

        # Derating factor: FHL = Σ(I_h_pu² × h²) / Σ(I_h_pu² × h^0.8) approx
        # Simplified derating: 1 / sqrt(1 + 0.1*(K-1))  — practical approximation
        derating_factor = 1.0 / math.sqrt(1.0 + 0.1 * max(0, k_factor - 1.0))

        # Recommended standard rating
        recommended_rating = _next_k_rating(k_factor)

        # Derated kVA (if transformer_kva provided)
        derated_kva = None
        if inputs.transformer_kva:
            derated_kva = round(inputs.transformer_kva * derating_factor, 1)

        warnings: List[str] = []
        recommendations: List[str] = []

        if k_factor > 1:
            recommendations.append(
                f"Use K-{recommended_rating} rated transformer for this load"
            )
        if k_factor > 13:
            warnings.append(
                f"High K-Factor ({k_factor:.1f}) — consider Active Power Filter "
                "to reduce harmonic content and allow smaller transformer rating"
            )
        if thd_pct > 20:
            warnings.append(
                f"THD {thd_pct:.1f}% is high — harmonic mitigation recommended "
                "before transformer selection"
            )

        return {
            "k_factor":                 round(k_factor, 4),
            "thd_percent":              round(thd_pct, 3),
            "derating_factor":          round(derating_factor, 4),
            "derated_kva":              derated_kva,
            "recommended_k_factor_rating": recommended_rating,
            "transformer_kva":          inputs.transformer_kva,
            "warnings":                 warnings,
            "recommendations":          recommendations,
        }

    def get_units(self) -> Dict[str, str]:
        return {
            "k_factor":        "—",
            "thd_percent":     "%",
            "derating_factor": "—",
            "derated_kva":     "kVA",
        }
