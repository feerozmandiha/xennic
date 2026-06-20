"""
PROT-004: Fuse Selection Calculator

Based on IEC 60269-1 (Low-voltage fuses) and IEC 60269-2 (gG/gM/aM).

Selection rules:
  - gG (general):  In ≥ load_current × 1.25
  - gM (motor):    In ≥ motor_starting_current / (2~6) depending on duration
  - aM (backup):   In ≥ load_current × 1.1, must coordinate with downstream

Breaking capacity must exceed prospective fault current.
Temperature derating: 0.5% per °C above 35°C ambient.
"""

import math
from typing import Dict, Optional

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import FuseSelectionInput

# Standard fuse ratings per IEC 60269-1 (A)
STANDARD_FUSE_RATINGS = [
    2, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100,
    125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250,
]

# Breaking capacities (kA) by fuse type
FUSE_BREAKING_CAPACITY = {
    'gG': 50,   # typical for gG up to 500V
    'gM': 50,
    'aM': 100,  # higher for backup fuses
}

# I²t estimates by fuse rating range (typical values for gG)
I2T_TABLE = [
    (16,   100),
    (32,   400),
    (63,   3000),
    (100,  10000),
    (160,  30000),
    (250,  80000),
    (400,  200000),
    (630,  500000),
    (1000, 1500000),
]


def _select_standard_rating(required_a: float) -> float:
    """Select the smallest standard rating >= required."""
    for rating in STANDARD_FUSE_RATINGS:
        if rating >= required_a:
            return float(rating)
    return float(STANDARD_FUSE_RATINGS[-1])


def _estimate_i2t(rated_a: float) -> float:
    """Interpolate I²t from table."""
    if rated_a <= I2T_TABLE[0][0]:
        return I2T_TABLE[0][1]
    for i in range(len(I2T_TABLE) - 1):
        lo_a, lo_i2t = I2T_TABLE[i]
        hi_a, hi_i2t = I2T_TABLE[i + 1]
        if lo_a <= rated_a <= hi_a:
            t = (rated_a - lo_a) / (hi_a - lo_a) if hi_a != lo_a else 0
            return lo_i2t + t * (hi_i2t - lo_i2t)
    return I2T_TABLE[-1][1]


class FuseSelectionCalculator(BaseCalculator[FuseSelectionInput]):
    """
    PROT-004: Fuse Selection per IEC 60269

    Selects appropriate fuse type and rating based on load,
    application, and fault conditions.
    """

    CALCULATION_CODE = "PROT-004"
    CALCULATION_NAME = "Fuse Selection (IEC 60269)"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 60269"
    STANDARD_VERSION = "2020"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self) -> Dict[str, str]:
        return {
            "recommended_rated_current_a": "A",
            "standard_fuse_rating_a": "A",
            "breaking_capacity_ka": "kA",
            "i2t_estimate_a2s": "A²s",
            "temperature_derating_factor": "pu",
        }

    def validate_inputs(self, inputs: FuseSelectionInput) -> bool:
        ValidationEngine.validate_positive(inputs.load_current_a, "load_current_a")
        ValidationEngine.validate_positive(inputs.short_circuit_current_ka, "short_circuit_current_ka")
        ValidationEngine.validate_positive(inputs.voltage_v, "voltage_v")
        return True

    def _temperature_derating(self, temp: float) -> float:
        """Derate 0.5% per °C above 35°C."""
        if temp <= 35:
            return 1.0
        return max(1.0 - (temp - 35) * 0.005, 0.7)

    def _calculate(self, inputs: FuseSelectionInput) -> Dict:
        derating = self._temperature_derating(inputs.ambient_temperature)

        if inputs.fuse_type == 'gG':
            required_a = inputs.load_current_a * 1.25 / derating
        elif inputs.fuse_type == 'gM':
            if inputs.motor_starting_current_a and inputs.motor_starting_duration_s:
                dur = inputs.motor_starting_duration_s
                # gM: In = starting_current / factor based on duration
                if dur <= 3:
                    factor = 6.0
                elif dur <= 10:
                    factor = 4.0
                else:
                    factor = 3.0
                required_a = max(inputs.load_current_a * 1.1, inputs.motor_starting_current_a / factor) / derating
            else:
                required_a = inputs.load_current_a * 1.25 / derating
        elif inputs.fuse_type == 'aM':
            required_a = inputs.load_current_a * 1.1 / derating
        else:
            required_a = inputs.load_current_a * 1.25 / derating

        selected = _select_standard_rating(required_a)
        b_capacity = FUSE_BREAKING_CAPACITY.get(inputs.fuse_type, 50)
        is_sufficient = selected >= inputs.load_current_a and b_capacity >= inputs.short_circuit_current_ka

        i2t = _estimate_i2t(selected) if inputs.fuse_type in ('gG', 'gM') else None

        selectivity_ratio: Optional[float] = None
        if inputs.fuse_type == 'gG' and selected > 0:
            selectivity_ratio = round(1.6, 2)

        return {
            "recommended_rated_current_a": round(required_a, 1),
            "standard_fuse_rating_a": selected,
            "breaking_capacity_ka": float(b_capacity),
            "is_sufficient": is_sufficient,
            "fuse_type": inputs.fuse_type,
            "application": inputs.application,
            "i2t_estimate_a2s": i2t,
            "selectivity_ratio": selectivity_ratio,
            "temperature_derating_factor": round(derating, 3),
            "standard": "IEC 60269-1 / IEC 60269-2",
        }
