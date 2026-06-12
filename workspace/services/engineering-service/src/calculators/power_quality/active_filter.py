# src/calculators/power_quality/active_filter.py
"""
PQ-006: Active Power Filter (APF) Sizing

Standard: IEC 61000 / IEEE 519-2022
Method:   Current injection type APF

An APF injects equal and opposite harmonic currents to cancel
load harmonics at the PCC. Sizing determines the required
compensating current rating of the APF inverter.
"""

import math
from typing import Dict, List, Any

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import ActiveFilterInput


# Standard APF current ratings (A) available in market
_STANDARD_APF_RATINGS = [20, 30, 50, 75, 100, 150, 200, 300, 400, 600]


def _next_apf_rating(required_a: float) -> int:
    for rating in _STANDARD_APF_RATINGS:
        if rating >= required_a:
            return rating
    return _STANDARD_APF_RATINGS[-1]


class ActiveFilterCalculator(BaseCalculator[ActiveFilterInput]):
    """
    PQ-006: Active Power Filter Sizing Calculator
    Determines APF inverter current rating for target THD compliance.
    """

    CALCULATION_CODE = "PQ-006"
    CALCULATION_NAME = "Active Power Filter (APF) Sizing"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 61000 / IEEE 519"
    STANDARD_VERSION = "2022"
    ENGINE_VERSION   = "0.1.0"

    def validate_inputs(self, inputs: ActiveFilterInput) -> bool:
        ValidationEngine.validate_positive(inputs.fundamental_current_a, "fundamental_current_a")
        ValidationEngine.validate_positive(inputs.system_voltage_v,      "system_voltage_v")
        return True

    def _calculate(self, inputs: ActiveFilterInput) -> Dict[str, Any]:
        harmonics       = inputs.harmonic_currents
        i1              = inputs.fundamental_current_a
        target_thd      = inputs.target_thd_percent / 100.0
        v_ll            = inputs.system_voltage_v
        max_order       = inputs.max_harmonic_order

        # Current THD (without filter)
        total_harmonic_sq = sum(v ** 2 for v in harmonics.values())
        current_thd_pct   = (math.sqrt(total_harmonic_sq) / i1) * 100.0

        # Target harmonic RMS that must remain after filtering
        target_harmonic_rms = target_thd * i1   # A

        # Current harmonic RMS
        current_harmonic_rms = math.sqrt(total_harmonic_sq)

        # Harmonic current that must be compensated
        # I_comp = sqrt(I_harmonics_current² - I_harmonics_target²)
        if current_harmonic_rms <= target_harmonic_rms:
            compensating_current_a = 0.0
            required_rating_a      = 0
            already_compliant      = True
        else:
            compensating_current_a = math.sqrt(
                current_harmonic_rms ** 2 - target_harmonic_rms ** 2
            )
            # Add 20% safety margin
            compensating_with_margin = compensating_current_a * 1.20
            required_rating_a = _next_apf_rating(compensating_with_margin)
            already_compliant = False

        # APF kVA rating (3-phase)
        v_ln = v_ll / math.sqrt(3)
        apf_kva = (v_ln * required_rating_a * 3) / 1000.0 if required_rating_a > 0 else 0.0

        # Harmonic orders within APF bandwidth
        in_bandwidth = [h for h in harmonics if h <= max_order]
        out_of_bandwidth = [h for h in harmonics if h > max_order]

        # THD achievable (within bandwidth)
        compensated_sq = sum(
            harmonics[h] ** 2 for h in out_of_bandwidth if h in harmonics
        )
        achievable_thd_pct = (math.sqrt(compensated_sq) / i1) * 100.0 if i1 > 0 else 0.0

        warnings: List[str] = []
        recommendations: List[str] = []

        if already_compliant:
            recommendations.append(
                f"System is already within target THD {inputs.target_thd_percent}% — "
                "no APF required"
            )
        else:
            recommendations.append(
                f"Install APF with ≥ {required_rating_a} A current rating "
                f"({apf_kva:.1f} kVA, 3-phase)"
            )

        if out_of_bandwidth:
            warnings.append(
                f"Harmonics at orders {out_of_bandwidth} exceed APF bandwidth "
                f"(max order {max_order}) — these will NOT be compensated"
            )
            if achievable_thd_pct > inputs.target_thd_percent:
                warnings.append(
                    f"Achievable THD {achievable_thd_pct:.2f}% still exceeds target "
                    f"{inputs.target_thd_percent}% — extend APF bandwidth or add passive filter "
                    "for high-order harmonics"
                )

        if current_thd_pct > 50:
            warnings.append(
                "Very high harmonic distortion — consider combined passive+active "
                "hybrid filter solution for better cost/performance"
            )

        recommendations.append(
            "Verify APF placement at PCC for maximum effectiveness"
        )

        return {
            "current_thd_percent":       round(current_thd_pct, 3),
            "target_thd_percent":        inputs.target_thd_percent,
            "achievable_thd_percent":    round(achievable_thd_pct, 3),
            "current_harmonic_rms_a":    round(current_harmonic_rms, 3),
            "target_harmonic_rms_a":     round(target_harmonic_rms, 3),
            "compensating_current_a":    round(compensating_current_a, 3),
            "required_apf_current_a":    required_rating_a,
            "apf_kva_3phase":            round(apf_kva, 2),
            "safety_margin_percent":     20,
            "apf_bandwidth_max_order":   max_order,
            "harmonics_in_bandwidth":    sorted(in_bandwidth),
            "harmonics_out_of_bandwidth":sorted(out_of_bandwidth),
            "already_compliant":         already_compliant,
            "warnings":                  warnings,
            "recommendations":           recommendations,
        }

    def get_units(self) -> Dict[str, str]:
        return {
            "current_harmonic_rms_a":  "A",
            "compensating_current_a":  "A",
            "required_apf_current_a":  "A",
            "apf_kva_3phase":          "kVA",
            "current_thd_percent":     "%",
            "target_thd_percent":      "%",
        }
