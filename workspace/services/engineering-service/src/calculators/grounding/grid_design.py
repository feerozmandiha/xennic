"""
GND-002: Grounding Grid Design Calculator (IEEE Std 80-2013)

Designs a rectangular grounding grid for substations and
checks touch & step voltage safety per IEEE 80.

Key formulas:
  - Grid resistance (Sverak, Eq 52)
  - Mesh voltage (Eq 80 / 81)
  - Step voltage (Eq 90 / 91)
  - Allowable touch/step (Eq 33 / 29 with Cs derating)
"""

import math
from typing import Dict, List

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import GroundingGridInput


# Conductor properties (density g/cm³, resistivity μΩ·cm at 20°C)
CONDUCTOR_PROPS = {
    'copper':    {'density': 8.89, 'res_20c': 1.724},
    'copperweld': {'density': 8.33, 'res_20c': 5.0},
    'steel':     {'density': 7.86, 'res_20c': 15.0},
    'aluminum':  {'density': 2.70, 'res_20c': 2.83},
}


def _cs_factor(rho: float, rho_s: float, hs: float) -> float:
    """Surface layer derating factor Cs (IEEE 80 Eq 27 / 28)."""
    if hs <= 0 or rho_s <= 0:
        return 1.0
    return max(0.5, 1.0 - (0.09 * (1.0 - rho / rho_s)) / (2.0 * hs + 0.09))


def _mesh_voltage_factor(n: float, D: float, d: float, h: float) -> float:
    """Geometric mesh voltage factor Km (Eq 81 / 83)."""
    Kii = 1.0  # rods along perimeter
    Kh = math.sqrt(1.0 + h / 1.0)
    log_arg = max(0.01, D**2 / (16.0 * h * d) + (D + 2.0 * h)**2 / (8.0 * D * h) - h / (4.0 * d))
    term1 = math.log(log_arg)
    n_safe = max(n, 2.0)
    term2 = (Kii / Kh) * math.log(8.0 / (math.pi * (2.0 * n_safe - 1.0)))
    return (1.0 / (2.0 * math.pi)) * (term1 + term2)


def _irregularity_factor(n: float) -> float:
    """Irregularity / current distribution factor Ki (Eq 89)."""
    return 0.644 + 0.148 * n


def _step_voltage_factor(n: float, D: float, h: float) -> float:
    """Step voltage geometric factor Ks (Eq 91)."""
    n_safe = max(n, 2.0)
    return (1.0 / math.pi) * (
        1.0 / (2.0 * h) + 1.0 / (D + h) + (1.0 / D) * (1.0 - 0.5 ** (n_safe - 2.0))
    )


class GroundingGridCalculator(BaseCalculator[GroundingGridInput]):
    """
    GND-002: Grounding Grid Design (IEEE Std 80-2013)

    Designs a rectangular grounding grid and evaluates safety
    against touch and step voltage limits.
    """

    CALCULATION_CODE = "GND-002"
    CALCULATION_NAME = "Grounding Grid Design"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEEE Std 80-2013"
    STANDARD_VERSION = "2013"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self):
        return {
            "grid_resistance_ohm": "Ω",
            "max_gpr_v": "V",
            "allowable_step_v": "V",
            "allowable_touch_v": "V",
            "actual_mesh_voltage_v": "V",
            "actual_step_voltage_v": "V",
        }

    def validate_inputs(self, inputs: GroundingGridInput) -> bool:
        ValidationEngine.validate_positive(inputs.grid_length_m, "grid_length_m")
        ValidationEngine.validate_positive(inputs.grid_width_m, "grid_width_m")
        ValidationEngine.validate_positive(inputs.soil_resistivity_ohm_m, "soil_resistivity_ohm_m")
        ValidationEngine.validate_positive(inputs.max_fault_current_a, "max_fault_current_a")
        return True

    def _calculate(self, inputs: GroundingGridInput) -> Dict:
        L = inputs.grid_length_m
        W = inputs.grid_width_m
        A = L * W
        h = inputs.burial_depth_m
        d = inputs.conductor_diameter_mm / 1000.0  # m
        rho = inputs.soil_resistivity_ohm_m
        rho_s = inputs.surface_resistivity_ohm_m
        hs = inputs.surface_thickness_m

        ncx = inputs.n_conductors_x
        ncy = inputs.n_conductors_y
        spacing_x = L / (ncx - 1) if ncx > 1 else L
        spacing_y = W / (ncy - 1) if ncy > 1 else W

        # Total conductor length
        Lc = ncx * L + ncy * W
        Lp = 2.0 * (L + W)

        # Ground rods
        n_perimeter = 2 * (ncx + ncy - 2)
        Lr = 0.0
        num_rods = 0
        if inputs.has_ground_rods and inputs.rod_length_m > 0:
            num_rods = n_perimeter * inputs.n_rods_per_node
            Lr = num_rods * inputs.rod_length_m

        Lt = Lc + Lr

        # ── Grid resistance (Sverak, Eq 52) ─────────────────────────────────
        Rg = rho * (
            1.0 / Lt + 1.0 / math.sqrt(20.0 * A) * (1.0 + 1.0 / (1.0 + h * math.sqrt(20.0 / A)))
        )

        # ── Fault current ──────────────────────────────────────────────────
        Ig = inputs.max_fault_current_a * inputs.current_division_factor
        GPR = Ig * Rg

        # ── Surface derating (Eq 27) ───────────────────────────────────────
        Cs = _cs_factor(rho, rho_s, hs)

        # ── Allowable voltages (Eq 33 for touch, Eq 29 for step) ───────────
        ts = inputs.fault_duration_s
        body_factor = 0.116 if inputs.body_weight == 50 else 0.157

        allow_step = (1000.0 + 6.0 * Cs * rho_s) * body_factor / math.sqrt(ts)
        allow_touch = (1000.0 + 1.5 * Cs * rho_s) * body_factor / math.sqrt(ts)

        # ── Effective number of parallel conductors (Eq 84-89) ─────────────
        n_a = 2.0 * Lc / Lp
        n_b = 1.0
        if L != W:
            n_b = math.sqrt(Lp / (4.0 * math.sqrt(A)))
        n_c = 1.0
        n_d = 1.0
        # For rectangular grids:
        n_ratio = L / W if W > 0 else 1
        if n_ratio > 8:
            # Long, narrow grid
            nc_extra = (Lc / Lp) ** 2
            n_c = nc_extra
        if n_a * n_b * n_c * n_d > 0:
            n = n_a * n_b * n_c * n_d
        else:
            n = max(ncx, ncy)

        # ── Mesh voltage (Eq 80-83) ────────────────────────────────────────
        # Use average spacing
        D_avg = (spacing_x + spacing_y) / 2.0
        Km = _mesh_voltage_factor(n, D_avg, d, h)
        Ki = _irregularity_factor(n)

        # Effective length for mesh (Eq 82)
        Lm = Lc + Lr if inputs.has_ground_rods else Lc + 0.0

        Em = rho * Ig * Km * Ki / Lm if Lm > 0 else 0

        # ── Step voltage (Eq 90-91) ────────────────────────────────────────
        Ks = _step_voltage_factor(n, D_avg, h)
        Ls = 0.75 * Lc + 0.85 * Lr

        Es = rho * Ig * Ks * Ki / Ls if Ls > 0 else 0

        # ── Safety margins ─────────────────────────────────────────────────
        touch_safe = Em <= allow_touch
        step_safe = Es <= allow_step
        touch_margin = (allow_touch - Em) / allow_touch * 100 if allow_touch > 0 else 0
        step_margin = (allow_step - Es) / allow_step * 100 if allow_step > 0 else 0

        # ── Conductor weight ───────────────────────────────────────────────
        mat = CONDUCTOR_PROPS.get(inputs.conductor_material, CONDUCTOR_PROPS['copper'])
        cross_section = math.pi * (d ** 2) / 4.0  # m²
        volume_m3 = Lc * cross_section
        weight_kg = volume_m3 * mat['density'] * 1000  # density g/cm³ → kg/m³ = ×1000

        # ── Recommendations ────────────────────────────────────────────────
        notes: List[str] = []
        if not touch_safe:
            notes.append(f"Touch voltage ({Em:.0f}V) exceeds limit ({allow_touch:.0f}V). Increase grid area, add conductors, or deeper burial.")
        if not step_safe:
            notes.append(f"Step voltage ({Es:.0f}V) exceeds limit ({allow_step:.0f}V). Increase surface layer or reduce spacing.")
        if GPR > 5000:
            notes.append(f"GPR is {GPR:.0f}V (>5kV). Ensure fence bonding and transferable potential mitigation.")
        if Cs < 0.7:
            notes.append(f"Surface derating Cs={Cs:.2f} is low. Increase crushed rock thickness ({hs*1000:.0f}mm → >150mm).")
        if Rg > 5:
            notes.append(f"Grid resistance {Rg:.1f}Ω exceeds typical 5Ω target. Consider more conductors or longer rods.")
        if not inputs.has_ground_rods:
            notes.append("No ground rods specified. Adding rods significantly improves performance.")
        if spacing_x > 10 or spacing_y > 10:
            notes.append(f"Conductor spacing >10m ({spacing_x:.0f}×{spacing_y:.0f}m). Smaller spacing improves mesh voltage.")
        if Lr > 0:
            notes.append(f"{num_rods} ground rods × {inputs.rod_length_m}m = {Lr:.0f}m total rod length included.")

        return {
            "grid_area_m2": round(A, 1),
            "total_conductor_length_m": round(Lc, 1),
            "grid_resistance_ohm": round(Rg, 3),
            "max_gpr_v": round(GPR, 0),
            "fault_current_grid_a": round(Ig, 0),
            "allowable_step_v": round(allow_step, 0),
            "allowable_touch_v": round(allow_touch, 0),
            "actual_mesh_voltage_v": round(Em, 0),
            "actual_step_voltage_v": round(Es, 0),
            "touch_voltage_safe": touch_safe,
            "step_voltage_safe": step_safe,
            "touch_margin_pct": round(touch_margin, 1),
            "step_margin_pct": round(step_margin, 1),
            "effective_conductors_n": round(n, 2),
            "conductor_spacing_x_m": round(spacing_x, 2),
            "conductor_spacing_y_m": round(spacing_y, 2),
            "total_conductor_weight_kg": round(weight_kg, 1),
            "total_rod_length_m": round(Lr, 1) if Lr > 0 else None,
            "surface_derating_cs": round(Cs, 3),
            "recommendation_notes": notes,
            "standard_reference": "IEEE Std 80-2013",
        }
