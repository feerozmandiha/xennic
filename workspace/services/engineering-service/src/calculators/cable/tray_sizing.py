"""
CABLE-005: Cable Tray / Ladder Sizing Calculator

Based on IEC 61915 / IEC 61537 / NEC 392

Calculates fill ratio, recommends tray size, and validates
compliance with maximum fill ratio limits per tray type.

Fill ratio limits (common practice per NEC 392 and IEC):
  - Ladder tray:   50% max
  - Perforated:    40% max
  - Solid bottom:  30% max
  - Wire mesh:     50% max
"""

import math
from typing import Dict

from src.core.base_calculator import BaseCalculator
from .schemas import CableTrayInput

# Standard tray widths (mm) per IEC 61537
STANDARD_TRAY_WIDTHS = [50, 100, 150, 200, 300, 400, 450, 500, 600, 750, 900]

# Max fill ratio per tray type
MAX_FILL_RATIO = {
    'ladder': 0.50,
    'perforated': 0.40,
    'solid_bottom': 0.30,
    'wire_mesh': 0.50,
}


class CableTraySizingCalculator(BaseCalculator[CableTrayInput]):
    """
    CABLE-005: Cable Tray / Ladder Sizing

    Calculates fill ratio and validates per IEC 61915 / NEC 392.
    Recommends next standard tray width if overfilled.
    """

    CALCULATION_CODE = "CABLE-005"
    CALCULATION_NAME = "Cable Tray / Ladder Sizing"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 61915 / IEC 61537"
    STANDARD_VERSION = "2020"
    ENGINE_VERSION = "0.1.0"

    def get_units(self):
        return {
            "tray_width_mm": "mm",
            "tray_depth_mm": "mm",
            "tray_area_mm2": "mm²",
            "total_cable_area_mm2": "mm²",
            "fill_ratio_percent": "%",
            "max_fill_ratio_percent": "%",
            "recommended_tray_width_mm": "mm",
            "remaining_area_mm2": "mm²",
        }

    def validate_inputs(self, inputs: CableTrayInput) -> bool:
        if inputs.tray_type not in MAX_FILL_RATIO:
            raise ValueError(f"Unsupported tray type: {inputs.tray_type}")
        return True

    def _calculate(self, inputs: CableTrayInput) -> Dict:
        tray_area = inputs.tray_width_mm * inputs.tray_depth_mm
        max_fill = MAX_FILL_RATIO[inputs.tray_type]

        # Calculate total cable area: sum of π(d/2)² × qty for each cable type
        total_cable_area = 0.0
        cable_breakdown = {}
        for diam_str, qty in inputs.cables.items():
            diam = float(diam_str)
            area_per_cable = math.pi * (diam / 2.0) ** 2
            area_total = area_per_cable * qty
            total_cable_area += area_total
            cable_breakdown[diam_str] = {
                "qty": qty,
                "area_per_cable_mm2": round(area_per_cable, 2),
                "area_total_mm2": round(area_total, 2),
            }

        fill_ratio = total_cable_area / tray_area if tray_area > 0 else 0
        fill_pct = fill_ratio * 100
        max_fill_pct = max_fill * 100
        within_limit = fill_ratio <= max_fill

        # Recommended tray width (with spare)
        required_area = total_cable_area / (max_fill * (1 - inputs.spare_percent / 100))
        required_width = required_area / inputs.tray_depth_mm
        recommended_tray_width = None
        if not within_limit or inputs.tray_width_mm < required_width:
            for w in STANDARD_TRAY_WIDTHS:
                if w >= required_width:
                    recommended_tray_width = float(w)
                    break
            if recommended_tray_width is None:
                recommended_tray_width = float(STANDARD_TRAY_WIDTHS[-1] * 2)

        remaining = tray_area * max_fill - total_cable_area

        return {
            "tray_width_mm": inputs.tray_width_mm,
            "tray_depth_mm": inputs.tray_depth_mm,
            "tray_type": inputs.tray_type,
            "tray_area_mm2": round(tray_area, 1),
            "total_cable_area_mm2": round(total_cable_area, 1),
            "fill_ratio_percent": round(fill_pct, 2),
            "max_fill_ratio_percent": max_fill_pct,
            "within_limit": within_limit,
            "recommended_tray_width_mm": (
                round(recommended_tray_width, 0) if recommended_tray_width else None
            ),
            "remaining_area_mm2": round(max(remaining, 0), 1),
            "cable_breakdown": cable_breakdown,
            "standard": "IEC 61915 / IEC 61537 / NEC 392",
        }
