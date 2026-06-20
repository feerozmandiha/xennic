"""
LIGHT-002: Road / Street Lighting Calculator (EN 13201)

Based on EN 13201-2 (photometric requirements) and CIE 115-2010
(recommendations for road lighting).

Method:
  1. Road class → target average luminance (L_avg), uniformity ratios
  2. Arrangement type based on road width vs mounting height
  3. Spacing from lumen output: S = (N × Φ × UF × LLF × q0) / (L_avg × W)
  4. Uniformity estimation from SHR
  5. Glare rating (G) estimation
  6. Power density and energy assessment
"""

import math
from typing import Dict, List

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import RoadLightingInput


# ── Road lighting classes (EN 13201-2) ──────────────────────────────────────
# Target average luminance, overall uniformity U0, longitudinal uniformity UI
ROAD_CLASSES: Dict[str, Dict] = {
    'M1':  {'lavg': 2.0, 'u0': 0.4, 'ui': 0.7, 'ti': 10, 'sr': 0.5},
    'M2':  {'lavg': 1.5, 'u0': 0.4, 'ui': 0.6, 'ti': 10, 'sr': 0.5},
    'M3':  {'lavg': 1.0, 'u0': 0.4, 'ui': 0.6, 'ti': 15, 'sr': 0.5},
    'M4':  {'lavg': 0.75,'u0': 0.4, 'ui': 0.6, 'ti': 15, 'sr': 0.5},
    'M5':  {'lavg': 0.5, 'u0': 0.35,'ui': 0.5, 'ti': 15, 'sr': 0.5},
    'M6':  {'lavg': 0.3, 'u0': 0.35,'ui': 0.5, 'ti': 20, 'sr': 0.5},
    'C1':  {'lavg': 0.3, 'u0': 0.35,'ui': 0.4, 'ti': 15, 'sr': 0.5},
    'C2':  {'lavg': 0.2, 'u0': 0.35,'ui': 0.4, 'ti': 20, 'sr': 0.5},
    'P1':  {'lavg': 0.15,'u0': 0.35,'ui': 0.4, 'ti': 15, 'sr': 0.0},
    'P2':  {'lavg': 0.1, 'u0': 0.35,'ui': 0.4, 'ti': 20, 'sr': 0.0},
    'P3':  {'lavg': 0.075,'u0':0.35,'ui': 0.4, 'ti': 25, 'sr': 0.0},
}

# Luminaire photometric distributions → typical utilisation factor range
LUMINAIRE_UF = {
    'cut_off':       0.45,
    'semi_cut_off':  0.55,
    'non_cut_off':   0.65,
    'LED_road':      0.50,
    'decorative':    0.35,
}

# Average luminance coefficient q0 (cd/m²/lux) for typical road surfaces
ROAD_SURFACE_Q0 = {
    'dry_asphalt':    0.06,
    'wet_asphalt':    0.08,
    'dry_concrete':   0.05,
    'wet_concrete':   0.07,
}

# Recommended mounting height ranges for different road widths
# (height relative to road width for single-sided arrangement)
ARRANGEMENT_RULES = {
    'single_sided': {'max_ratio': 1.0, 'label': 'یک‌طرفه (Single-sided)'},
    'staggered':    {'max_ratio': 1.5, 'label': 'زیگزاگی (Staggered)'},
    'opposite':     {'max_ratio': 3.0, 'label': 'دو طرفه روبرو (Opposite)'},
    'median':       {'max_ratio': 4.0, 'label': 'وسطی (Median)'},
}

# Spacing-to-height ratio limits per luminaire type
MAX_SHR = {
    'cut_off':       3.0,
    'semi_cut_off':  3.5,
    'non_cut_off':   4.0,
    'LED_road':      3.5,
    'decorative':    2.5,
}


def _select_arrangement(road_width: float, mounting_height: float) -> str:
    """Select recommended arrangement based on W/H ratio."""
    ratio = road_width / max(mounting_height, 0.1)
    if ratio <= 1.0:
        return 'single_sided'
    elif ratio <= 1.5:
        return 'staggered'
    elif ratio <= 3.0:
        return 'opposite'
    else:
        return 'median'


def _arrangement_factor(arrangement: str) -> int:
    """Number of luminaires contributing per pole position."""
    return {'single_sided': 1, 'staggered': 1, 'opposite': 2, 'median': 2}.get(arrangement, 1)


class RoadLightingCalculator(BaseCalculator[RoadLightingInput]):
    """
    LIGHT-002: Road / Street Lighting Design (EN 13201)

    Calculates luminaire spacing, mounting height, and layout
    for road lighting based on traffic class and road geometry.
    """

    CALCULATION_CODE = "LIGHT-002"
    CALCULATION_NAME = "Road Lighting Design"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "EN 13201 / CIE 115"
    STANDARD_VERSION = "2020"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self):
        return {
            "recommended_spacing_m": "m",
            "max_spacing_m": "m",
            "achieved_luminance_cd_m2": "cd/m²",
            "target_luminance_cd_m2": "cd/m²",
            "num_poles": "pcs",
            "total_power_w": "W",
            "power_density_w_m2": "W/m²",
            "annual_energy_kwh": "kWh",
            "installation_length_m": "m",
        }

    def validate_inputs(self, inputs: RoadLightingInput) -> bool:
        ValidationEngine.validate_positive(inputs.road_width_m, "road_width_m")
        ValidationEngine.validate_positive(inputs.lamp_lumens, "lamp_lumens")
        ValidationEngine.validate_physical_range(inputs.light_loss_factor, 0.1, 1.0, "light_loss_factor")
        return True

    def _calculate(self, inputs: RoadLightingInput) -> Dict:
        # 1. Road class parameters
        cls_params = ROAD_CLASSES.get(inputs.road_class, ROAD_CLASSES['M3'])
        target_lavg = cls_params['lavg']

        # 2. Arrangement
        mount_h = inputs.mounting_height_m or (inputs.road_width_m * 0.8)
        arrangement = inputs.arrangement_type or _select_arrangement(inputs.road_width_m, mount_h)

        # 3. Determine number of luminaire rows
        n_rows = _arrangement_factor(arrangement)

        # 4. Utilisation factor
        uf = LUMINAIRE_UF.get(inputs.luminaire_type, 0.50)
        q0 = ROAD_SURFACE_Q0.get(inputs.road_surface, 0.06)

        # 5. Spacing calculation
        if inputs.target_spacing_m:
            spacing = inputs.target_spacing_m
            # back-calculate achieved luminance
            achieved_lavg = (n_rows * inputs.lamp_lumens * uf * inputs.light_loss_factor * q0) / (inputs.road_width_m * spacing)
        else:
            spacing = (n_rows * inputs.lamp_lumens * uf * inputs.light_loss_factor * q0) / (target_lavg * inputs.road_width_m)
            achieved_lavg = target_lavg

        # 6. Max spacing from SHR rule
        max_shr = MAX_SHR.get(inputs.luminaire_type, 3.0)
        max_spacing = max_shr * mount_h

        spacing_ok = spacing <= max_spacing
        if not spacing_ok and not inputs.target_spacing_m:
            # Clamp to max spacing
            spacing = max_spacing
            achieved_lavg = (n_rows * inputs.lamp_lumens * uf * inputs.light_loss_factor * q0) / (inputs.road_width_m * spacing)

        # 7. Number of poles over installation length
        road_len = inputs.road_length_m
        num_poles = max(2, math.ceil(road_len / spacing)) if spacing > 0 else 2
        actual_spacing = road_len / (num_poles - 1) if num_poles > 1 else spacing

        # 8. Uniformity estimation (simplified)
        shr = actual_spacing / mount_h if mount_h > 0 else max_shr
        # U0 estimation: better with smaller SHR, opposite/staggered arrangement
        u0_base = 0.35 if arrangement in ('single_sided', 'median') else 0.40
        u0_penalty = max(0, (shr - 2.0) * 0.05)
        u0_est = max(0.25, min(0.65, u0_base - u0_penalty))
        ui_est = max(0.3, u0_est + 0.1)

        # 9. Glare rating (simplified TI estimation)
        # TI increases with mounting height decrease and wider distribution
        glare_factor = {'cut_off': 8, 'semi_cut_off': 12, 'non_cut_off': 18, 'LED_road': 10, 'decorative': 15}
        ti_est = glare_factor.get(inputs.luminaire_type, 12) * (1 - (mount_h - 5) / 20) if mount_h < 12 else glare_factor.get(inputs.luminaire_type, 12) * 0.8
        ti_est = max(5, min(30, round(ti_est, 1)))

        # 10. Power and energy
        total_power = num_poles * inputs.luminaire_power_w
        power_density = total_power / (inputs.road_width_m * road_len / 1000) if road_len > 0 else 0
        annual_energy = total_power * inputs.annual_operating_hours / 1000

        # 11. Recommendations
        notes: List[str] = []
        if not spacing_ok:
            notes.append(f"Spacing ({spacing:.1f}m) exceeds max SHR ({max_shr}×H). Increase mounting height or use different luminaire distribution.")
        if u0_est < cls_params['u0']:
            notes.append(f"Estimated uniformity U0 ({u0_est:.2f}) may be below requirement ({cls_params['u0']}). Consider opposite arrangement or shorter spacing.")
        if ti_est > cls_params['ti']:
            notes.append(f"Estimated glare TI ({ti_est:.0f}%) exceeds limit ({cls_params['ti']}%). Use cut-off luminaire or increase mounting height.")
        if arrangement != inputs.arrangement_type and inputs.arrangement_type is None:
            notes.append(f"Recommended arrangement: {ARRANGEMENT_RULES[arrangement]['label']} (W/H = {inputs.road_width_m / max(mount_h, 0.1):.1f})")
        if mount_h < 6:
            notes.append("Low mounting height may cause glare and poor uniformity.")
        if inputs.road_surface in ('wet_asphalt', 'wet_concrete'):
            notes.append("Wet surface increases luminance — uniformity may be worse in wet conditions.")

        return {
            "road_class": inputs.road_class,
            "target_luminance_cd_m2": target_lavg,
            "achieved_luminance_cd_m2": round(achieved_lavg, 2),
            "recommended_spacing_m": round(actual_spacing, 1),
            "max_spacing_m": round(max_spacing, 1),
            "spacing_ok": actual_spacing <= max_spacing,
            "mounting_height_m": round(mount_h, 1),
            "arrangement": arrangement,
            "luminaire_type": inputs.luminaire_type,
            "road_surface": inputs.road_surface,
            "num_poles": num_poles,
            "pole_spacing_m": round(actual_spacing, 1),
            "installation_length_m": road_len,
            "estimated_uniformity_u0": round(u0_est, 2),
            "estimated_uniformity_ui": round(ui_est, 2),
            "u0_requirement": cls_params['u0'],
            "ui_requirement": cls_params['ui'],
            "u0_ok": u0_est >= cls_params['u0'],
            "ui_ok": ui_est >= cls_params['ui'],
            "estimated_ti_percent": ti_est,
            "ti_limit_percent": cls_params['ti'],
            "ti_ok": ti_est <= cls_params['ti'],
            "total_power_w": round(total_power, 1),
            "power_density_w_per_m2": round(power_density, 2),
            "annual_energy_kwh": round(annual_energy, 1),
            "recommendation_notes": notes,
            "standard_reference": "EN 13201-2:2016 / CIE 115:2010",
        }
