"""
SWT-001: Main Switch / Incomer Selection Calculator

Based on IEC 61439-1 (switchgear assemblies), IEC 60947-2 (circuit-breakers),
and IEC 60947-3 (switches, disconnectors, switch-disconnectors).

Selection rules:
  1. Design current Ib = max(total_connected × diversity, transformer_rating)
  2. Switch rating In ≥ Ib, selected from standard ratings
  3. Breaking capacity (Icu/Ics) ≥ prospective SC current
  4. Appropriate switch type based on application and number of sources
  5. LSIG settings computed for ACB/MCCB with electronic trip units
"""

import math
from typing import Dict, List

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import MainSwitchInput, LSIGSettings

# Standard rated currents (A) per IEC 61439-1
STANDARD_RATINGS = [
    100, 125, 160, 200, 250, 315, 400, 500, 630, 800,
    1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300,
]

# Breaking capacity ranges (kA) by switch type
BREAKING_CAPACITY_RANGES = {
    'acb':               [25, 36, 42, 50, 65, 80, 100, 120, 150],
    'mccb':              [10, 18, 25, 36, 50, 65, 85, 100],
    'switch_disconnector': [10, 16, 25, 32, 40, 50],
    'changeover':        [25, 36, 42, 50, 65, 80, 100],
    'switch_fuse':       [25, 36, 50, 65, 80, 100, 120],
}


def _select_rating(required: float) -> float:
    """Select smallest standard rating >= required."""
    for r in STANDARD_RATINGS:
        if r >= required:
            return float(r)
    return float(STANDARD_RATINGS[-1])


def _select_breaking_capacity(required_ka: float, capacities: List[float]) -> float:
    """Smallest breaking capacity >= required."""
    for cap in capacities:
        if cap >= required_ka:
            return float(cap)
    return float(capacities[-1])


def _temperature_derating(temp: float) -> float:
    """Derate 0.5% per °C above 40°C (per IEC 61439-1)."""
    if temp <= 40:
        return 1.0
    return max(1.0 - (temp - 40) * 0.005, 0.7)


class MainSwitchCalculator(BaseCalculator[MainSwitchInput]):
    """
    SWT-001: Main Switch / Incomer Selection

    Sizes the main incoming switch for a distribution board or
    switchboard per IEC 61439-1.
    """

    CALCULATION_CODE = "SWT-001"
    CALCULATION_NAME = "Main Switch / Incomer Selection"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 61439-1 / IEC 60947"
    STANDARD_VERSION = "2020"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self):
        return {
            "recommended_rated_current_a": "A",
            "recommended_breaking_capacity_ka": "kA",
            "design_current_a": "A",
        }

    def validate_inputs(self, inputs: MainSwitchInput) -> bool:
        ValidationEngine.validate_positive(inputs.short_circuit_current_ka, "short_circuit_current_ka")
        ValidationEngine.validate_positive(inputs.voltage_v, "voltage_v")
        ValidationEngine.validate_physical_range(inputs.diversity_factor, 0.1, 1.0, "diversity_factor")
        return True

    def _calculate(self, inputs: MainSwitchInput) -> Dict:
        # Design current: max of (connected × diversity, transformer rating)
        connected_load_a = 0.0
        if inputs.total_connected_kva:
            connected_load_a = (inputs.total_connected_kva * 1000) / (math.sqrt(3) * inputs.voltage_v)
        transformer_load_a = 0.0
        if inputs.transformer_kva:
            transformer_load_a = (inputs.transformer_kva * 1000) / (math.sqrt(3) * inputs.voltage_v)

        design_current = max(connected_load_a * inputs.diversity_factor, transformer_load_a)
        derating = _temperature_derating(inputs.ambient_temperature)
        required_rating = design_current / derating

        selected = _select_rating(required_rating)
        b_caps = BREAKING_CAPACITY_RANGES.get(inputs.switch_type, [25])
        b_cap = _select_breaking_capacity(inputs.short_circuit_current_ka, b_caps)

        is_sufficient = selected >= required_rating and b_cap >= inputs.short_circuit_current_ka

        # LSIG settings (for ACB / MCCB with electronic trip)
        lsig = None
        if inputs.lsig_required and inputs.switch_type in ('acb', 'mccb'):
            ir = selected  # Long-time pickup = switch rating
            tr = 5.0  # seconds (typical)
            sd = ir * 8.0  # Short-time = 8× In
            tsd = 0.4  # seconds
            ii = ir * 12.0  # Instantaneous = 12× In
            # Ground fault (if 4-pole)
            ig = ir * 0.2 if inputs.pole_count == 4 else None
            tg = 0.3 if ig else None
            lsig = LSIGSettings(
                long_time_pickup_a=ir,
                long_time_delay_s=tr,
                short_time_pickup_a=sd,
                short_time_delay_s=tsd,
                instantaneous_pickup_a=ii,
                ground_fault_pickup_a=ig,
                ground_fault_delay_s=tg,
            )

        # Recommendations
        notes: List[str] = []
        if inputs.num_sources > 1:
            notes.append(f"Incorporate mechanical / electrical interlock for {inputs.num_sources}-source system")
        if inputs.switch_type == 'changeover':
            notes.append("Ensure changeover has OFF position for isolation per IEC 60947-3")
        if inputs.switch_type in ('switch_disconnector', 'switch_fuse'):
            notes.append("This device provides isolation only — no overcurrent protection. Upstream protection required.")
        if b_cap < inputs.short_circuit_current_ka * 1.2:
            notes.append("Breaking capacity margin is low — consider upgrading switch type (e.g. ACB instead of MCCB)")

        return {
            "recommended_rated_current_a": selected,
            "recommended_breaking_capacity_ka": b_cap,
            "is_sufficient": is_sufficient,
            "switch_type": inputs.switch_type,
            "num_sources": inputs.num_sources,
            "pole_count": inputs.pole_count,
            "diversity_factor": inputs.diversity_factor,
            "design_current_a": round(design_current, 1),
            "derating_factor": round(derating, 3),
            "transformer_load_a": round(transformer_load_a, 1) if transformer_load_a > 0 else None,
            "connected_load_a": round(connected_load_a, 1) if connected_load_a > 0 else None,
            "lsig": lsig.model_dump() if lsig else None,
            "standard_reference": "IEC 61439-1 §5, IEC 60947-2, IEC 60947-3",
            "recommendation_notes": notes,
        }
