"""
LIGHT-001: Lighting Design — Lumen Method Calculator

Based on CIE 190 (utilization factor tables) and EN 12464-1
(illuminance recommendations for indoor workplaces).

Method:
  1. Determine mounting height above workplane (Hm)
  2. Compute Room Index (RI) = L×W / (Hm × (L + W))
  3. Look up Utilization Factor (UF) from RI + luminaire type + reflectances
  4. Compute required luminaires: N = (E × A) / (n × Φ × UF × LLF)
  5. Floor layout (rows × columns)
  6. Spacing check against SHR max
  7. Power density check
"""

import math
from typing import Dict, List, Tuple

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import LumenMethodInput


# ── Task types → standard maintained illuminance (lux) ──────────────────────
# Based on EN 12464-1 Table 5.1–5.40
TASK_ILLUMINANCE: Dict[str, float] = {
    'office_general':      300,
    'office_desk':         500,
    'conference':          400,
    'industrial_rough':    200,
    'industrial_medium':   400,
    'industrial_fine':     750,
    'warehouse':           150,
    'laboratory':          500,
    'classroom':           350,
    'retail_general':      300,
    'retail_display':      500,
    'healthcare_general':  300,
    'corridor':            100,
    'parking':             75,
    'emergency':           50,
}

# Reference power densities (W/m²) — approximate values based on
# ASHRAE 90.1-2019 and typical LED practice
REFERENCE_POWER_DENSITY: Dict[str, float] = {
    'office_general':      9.0,
    'office_desk':         11.0,
    'conference':          10.0,
    'industrial_rough':    7.0,
    'industrial_medium':    9.0,
    'industrial_fine':     14.0,
    'warehouse':           6.0,
    'laboratory':          12.0,
    'classroom':           10.0,
    'retail_general':      12.0,
    'retail_display':      18.0,
    'healthcare_general':  10.0,
    'corridor':            5.0,
    'parking':             3.0,
    'emergency':           2.0,
}

# ── Room Index (RI) reference points for UF lookup ──────────────────────────
RI_VALUES = [0.6, 0.8, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0]

# UF tables for (ceiling 70%, wall 50%, floor 20%) — common installed scenario
# Each entry corresponds to RI_VALUES
UF_TABLES: Dict[str, List[float]] = {
    'direct':         [0.30, 0.40, 0.48, 0.55, 0.60, 0.66, 0.71, 0.74, 0.77, 0.79],
    'semi_direct':    [0.28, 0.38, 0.46, 0.53, 0.58, 0.64, 0.69, 0.72, 0.75, 0.77],
    'general_diffuse':[0.25, 0.35, 0.43, 0.50, 0.55, 0.61, 0.66, 0.69, 0.72, 0.74],
    'semi_indirect':  [0.22, 0.32, 0.40, 0.47, 0.52, 0.58, 0.63, 0.66, 0.69, 0.71],
    'indirect':       [0.18, 0.27, 0.35, 0.42, 0.47, 0.53, 0.58, 0.61, 0.64, 0.66],
}


def _interpolate_uf(ri: float, uf_values: List[float]) -> float:
    """Linearly interpolate UF for a given room index."""
    if ri <= RI_VALUES[0]:
        return uf_values[0]
    if ri >= RI_VALUES[-1]:
        return uf_values[-1]
    for i in range(len(RI_VALUES) - 1):
        if RI_VALUES[i] <= ri <= RI_VALUES[i + 1]:
            t = (ri - RI_VALUES[i]) / (RI_VALUES[i + 1] - RI_VALUES[i])
            return uf_values[i] + t * (uf_values[i + 1] - uf_values[i])
    return uf_values[-1]


def _reflectance_correction(
    uf_base: float,
    rc: float, rw: float, rf: float,
) -> float:
    """
    Simple correction factor for non-standard reflectances.

    Based on typical CIE UF variation:
    - Each 0.1 increase in ceiling reflectance → +2% UF
    - Each 0.1 increase in wall reflectance → +3% UF
    - Floor reflectance has minor effect → +1% per 0.1
    """
    delta_rc = (rc - 0.7) / 0.1 * 0.02
    delta_rw = (rw - 0.5) / 0.1 * 0.03
    delta_rf = (rf - 0.2) / 0.1 * 0.01
    correction = 1.0 + delta_rc + delta_rw + delta_rf
    return max(min(uf_base * correction, 0.95), 0.05)


def _optimize_layout(
    n_required: int,
    room_length: float,
    room_width: float,
    max_spacing: float,
) -> Tuple[int, int, float, float]:
    """Determine rows × columns for best fit."""
    aspect = room_length / room_width if room_width > 0 else 1
    # Try to make columns along length, rows along width
    # so spacing in both directions is similar
    best = (1, max(1, n_required), 0.0, 0.0)
    best_score = float('inf')
    for cols in range(1, max(50, n_required + 2)):
        rows = math.ceil(n_required / cols)
        n_actual = rows * cols
        if n_actual < n_required:
            continue
        spc_c = room_length / cols if cols > 1 else room_length
        spc_r = room_width / rows if rows > 1 else room_width
        # Penalize for excess luminaires and uneven spacing
        score = (n_actual - n_required) * 10 + abs(spc_c - spc_r)
        if spc_c > max_spacing or spc_r > max_spacing:
            score += 50  # Heavily penalize over-spacing
        if spc_c > max_spacing * 1.5 or spc_r > max_spacing * 1.5:
            continue  # Invalid
        if score < best_score:
            best_score = score
            best = (rows, cols, spc_r, spc_c)
    return best


class LumenMethodCalculator(BaseCalculator[LumenMethodInput]):
    """
    LIGHT-001: Lighting Design — Lumen Method

    Calculates the number of luminaires required to achieve a
    target illuminance using the lumen method per CIE 190,
    with layout, spacing, power density, and energy checks.
    """

    CALCULATION_CODE = "LIGHT-001"
    CALCULATION_NAME = "Lighting Design (Lumen Method)"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "CIE 190 / EN 12464-1"
    STANDARD_VERSION = "2020"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self):
        return {
            "room_index": "",
            "utilization_factor": "",
            "required_luminaires": "pcs",
            "installed_lux": "lux",
            "target_illuminance_lux": "lux",
            "total_power_w": "W",
            "power_density_w_m2": "W/m²",
            "annual_energy_kwh": "kWh",
            "actual_spacing_rows_m": "m",
            "actual_spacing_columns_m": "m",
            "max_spacing_m": "m",
        }

    def validate_inputs(self, inputs: LumenMethodInput) -> bool:
        ValidationEngine.validate_positive(inputs.room_length_m, "room_length_m")
        ValidationEngine.validate_positive(inputs.room_width_m, "room_width_m")
        ValidationEngine.validate_positive(inputs.room_height_m, "room_height_m")
        ValidationEngine.validate_physical_range(inputs.light_loss_factor, 0.1, 1.0, "light_loss_factor")
        return True

    def _calculate(self, inputs: LumenMethodInput) -> Dict:
        # 1. Mounting height above workplane
        mount_h = inputs.mounting_height_m or (inputs.room_height_m - 0.15)
        hm = mount_h - inputs.workplane_height_m
        area = inputs.room_length_m * inputs.room_width_m

        # 2. Room Index
        ri = (inputs.room_length_m * inputs.room_width_m) / (hm * (inputs.room_length_m + inputs.room_width_m))

        # 3. Utilization Factor
        uf_base = _interpolate_uf(ri, UF_TABLES[inputs.luminaire_type])
        uf = _reflectance_correction(uf_base, inputs.reflectance_ceiling, inputs.reflectance_wall, inputs.reflectance_floor)

        # 4. Target illuminance
        target_lux = inputs.target_illuminance_lux or TASK_ILLUMINANCE.get(inputs.task_type, 300)

        # 5. Required luminaires
        total_lumens_per_luminaire = inputs.lamp_lumens * inputs.lamps_per_luminaire
        if total_lumens_per_luminaire <= 0 or uf <= 0 or inputs.light_loss_factor <= 0:
            n_required = 1
        else:
            n_required = math.ceil((target_lux * area) / (total_lumens_per_luminaire * uf * inputs.light_loss_factor))

        n_required = max(1, n_required)

        # 6. Layout optimization
        max_spacing = inputs.max_shr * hm
        rows, cols, spc_r, spc_c = _optimize_layout(n_required, inputs.room_length_m, inputs.room_width_m, max_spacing)
        n_actual = rows * cols

        # 7. Actual installed illuminance
        installed_lux = (n_actual * total_lumens_per_luminaire * uf * inputs.light_loss_factor) / area

        # 8. Power and energy
        total_power = n_actual * inputs.luminaire_power_w
        power_density = total_power / area
        ref_pd = REFERENCE_POWER_DENSITY.get(inputs.task_type, 10.0)
        annual_energy = total_power * inputs.annual_operating_hours / 1000.0

        # 9. Spacing check
        spacing_ok = spc_r <= max_spacing + 0.05 and spc_c <= max_spacing + 0.05

        # 10. Power density check
        pd_ok = power_density <= ref_pd * 1.15  # 15% tolerance

        # 11. Recommendations
        notes: List[str] = []
        if not spacing_ok:
            notes.append(f"Spacing exceeds max SHR ({inputs.max_shr}×Hm = {max_spacing:.1f}m). Consider more luminaires or different layout.")
        if not pd_ok:
            notes.append(f"Power density {power_density:.1f} W/m² exceeds reference {ref_pd:.1f} W/m². Consider higher-efficacy luminaires.")
        if n_actual > n_required:
            notes.append(f"Layout requires {n_actual} luminaires (rounded up from {n_required} calculated) for uniform spacing.")
        if hm < 1.5:
            notes.append("Low mounting height — consider surface-mounted or recessed luminaires for glare control.")
        if uf < 0.3:
            notes.append(f"Low utilization factor ({uf:.2f}) — consider lighter room surfaces or different luminaire distribution.")
        if inputs.light_loss_factor < 0.7:
            notes.append(f"Light Loss Factor is low ({inputs.light_loss_factor}). Plan cleaning at {inputs.maintenance_interval_years}-year intervals.")

        return {
            "room_index": round(ri, 2),
            "utilization_factor": round(uf, 3),
            "required_luminaires": n_actual,
            "installed_lux": round(installed_lux, 1),
            "target_illuminance_lux": round(target_lux, 0),
            "luminaire_rows": rows,
            "luminaire_columns": cols,
            "actual_spacing_rows_m": round(spc_r, 2),
            "actual_spacing_columns_m": round(spc_c, 2),
            "max_spacing_m": round(max_spacing, 2),
            "spacing_ok": spacing_ok,
            "total_power_w": round(total_power, 1),
            "power_density_w_m2": round(power_density, 2),
            "power_density_reference_w_m2": round(ref_pd, 1),
            "power_density_ok": pd_ok,
            "annual_energy_kwh": round(annual_energy, 1),
            "task_type": inputs.task_type,
            "luminaire_type": inputs.luminaire_type,
            "recommendation_notes": notes,
            "standard_reference": "CIE 190 / EN 12464-1",
        }
