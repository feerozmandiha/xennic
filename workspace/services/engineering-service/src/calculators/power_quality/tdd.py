# src/calculators/power_quality/tdd.py
"""
PQ-002: Total Demand Distortion (TDD) Calculator

Standard: IEEE 519-2022 — Section 5.2
Formula:  TDD = sqrt(Σ I_h²) / I_L × 100   (h ≥ 2)

Unlike THD (which uses fundamental as base), TDD uses the
maximum demand load current (I_L) as the base — more meaningful
for utility engineers assessing harmonic impact on the grid.
"""

import math
from typing import Dict, List, Any, Optional

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import TDDInput


# IEEE 519-2022 Table 2 — Current Distortion Limits (% of I_L)
# Key: Isc/IL ratio range
_IEEE519_TDD_LIMITS: List[Dict] = [
    {"isc_il_min": 0,    "isc_il_max": 20,   "h_3_10": 4.0,  "h_11_16": 2.0, "h_17_22": 1.5, "h_23_34": 0.6, "h_35_plus": 0.3, "tdd": 5.0},
    {"isc_il_min": 20,   "isc_il_max": 50,   "h_3_10": 7.0,  "h_11_16": 3.5, "h_17_22": 2.5, "h_23_34": 1.0, "h_35_plus": 0.5, "tdd": 8.0},
    {"isc_il_min": 50,   "isc_il_max": 100,  "h_3_10": 10.0, "h_11_16": 4.5, "h_17_22": 4.0, "h_23_34": 1.5, "h_35_plus": 0.7, "tdd": 12.0},
    {"isc_il_min": 100,  "isc_il_max": 1000, "h_3_10": 12.0, "h_11_16": 5.5, "h_17_22": 5.0, "h_23_34": 2.0, "h_35_plus": 1.0, "tdd": 15.0},
    {"isc_il_min": 1000, "isc_il_max": 1e12, "h_3_10": 15.0, "h_11_16": 7.0, "h_17_22": 6.0, "h_23_34": 2.5, "h_35_plus": 1.4, "tdd": 20.0},
]


def _get_ieee519_limits(isc_il: Optional[float]) -> Dict:
    if isc_il is None:
        return _IEEE519_TDD_LIMITS[0]  # conservative default
    for row in _IEEE519_TDD_LIMITS:
        if row["isc_il_min"] <= isc_il < row["isc_il_max"]:
            return row
    return _IEEE519_TDD_LIMITS[-1]


def _get_harmonic_limit(order: int, limits: Dict) -> float:
    if 3 <= order <= 10:   return limits["h_3_10"]
    if 11 <= order <= 16:  return limits["h_11_16"]
    if 17 <= order <= 22:  return limits["h_17_22"]
    if 23 <= order <= 34:  return limits["h_23_34"]
    return limits["h_35_plus"]


class TDDCalculator(BaseCalculator[TDDInput]):
    """
    PQ-002: TDD Calculator
    Assesses harmonic current injection at the Point of Common Coupling (PCC).
    """

    CALCULATION_CODE = "PQ-002"
    CALCULATION_NAME = "Total Demand Distortion (TDD)"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEEE 519"
    STANDARD_VERSION = "2022"
    ENGINE_VERSION   = "0.1.0"

    def validate_inputs(self, inputs: TDDInput) -> bool:
        ValidationEngine.validate_positive(inputs.max_demand_current_a, "max_demand_current_a")
        return True

    def _calculate(self, inputs: TDDInput) -> Dict[str, Any]:
        harmonics = inputs.harmonic_currents
        i_l       = inputs.max_demand_current_a
        isc_il    = inputs.isc_il_ratio

        # TDD = sqrt(Σ I_h²) / I_L × 100
        sum_sq    = sum(v ** 2 for v in harmonics.values())
        tdd_pct   = (math.sqrt(sum_sq) / i_l) * 100.0

        # IEEE 519 limits
        limits = _get_ieee519_limits(isc_il)
        tdd_limit = limits["tdd"]
        is_compliant = tdd_pct <= tdd_limit

        # Individual harmonic compliance
        individual_violations: List[Dict] = []
        for order, amp in harmonics.items():
            individual_pct = (amp / i_l) * 100.0
            ind_limit      = _get_harmonic_limit(order, limits)
            if individual_pct > ind_limit:
                individual_violations.append({
                    "harmonic_order": order,
                    "value_percent":  round(individual_pct, 3),
                    "limit_percent":  ind_limit,
                    "excess_percent": round(individual_pct - ind_limit, 3),
                })

        # Spectrum % of I_L
        spectrum_pct = {
            str(h): round(v / i_l * 100.0, 3) for h, v in harmonics.items()
        }

        warnings: List[str] = []
        recommendations: List[str] = []

        if not is_compliant:
            warnings.append(
                f"TDD {tdd_pct:.2f}% exceeds IEEE 519 limit of {tdd_limit}% "
                f"(Isc/IL = {isc_il if isc_il else 'unknown'})"
            )
        if individual_violations:
            orders = [str(v["harmonic_order"]) for v in individual_violations]
            warnings.append(
                f"Individual harmonic violations at orders: {', '.join(orders)}"
            )
            recommendations.append(
                "Install harmonic filters targeted at violating harmonic orders"
            )
        if tdd_pct > 15:
            recommendations.append(
                "Consider Active Power Filter (APF) for comprehensive harmonic mitigation"
            )

        return {
            "tdd_percent":              round(tdd_pct, 4),
            "max_demand_current_a":     round(i_l, 4),
            "harmonic_rms_a":           round(math.sqrt(sum_sq), 4),
            "spectrum_percent_of_il":   spectrum_pct,
            "isc_il_ratio":             isc_il,
            "ieee519_tdd_limit":        tdd_limit,
            "is_compliant":             is_compliant,
            "individual_violations":    individual_violations,
            "warnings":                 warnings,
            "recommendations":          recommendations,
        }

    def get_units(self) -> Dict[str, str]:
        return {
            "max_demand_current_a": "A",
            "harmonic_rms_a":       "A",
            "tdd_percent":          "%",
            "ieee519_tdd_limit":    "%",
        }
