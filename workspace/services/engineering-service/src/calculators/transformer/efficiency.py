"""
TRF-005: Transformer Energy Efficiency per EU 548/2014 (Directive 2009/125/EC Lot 2)

Validates no-load and load losses against:
  - Tier 1 (effective 1 July 2015)
  - Tier 2 (effective 1 July 2021)

Supports oil-immersed and dry-type transformers from 50 kVA to 10000+ kVA.
"""

import math
from typing import Dict, List, Tuple

from src.core.base_calculator import BaseCalculator
from .schemas import TransformerEfficiencyInput


# EU 548/2014 Annex I — maximum no-load loss Po (W) and load loss Pk (W)
# Data points for interpolation: (kVA, Po_tier1, Pk_tier1, Po_tier2, Pk_tier2)
_LOSS_LIMITS_OIL: List[Tuple[float, float, float, float, float]] = [
    (50,    110,   1350,    90,   1100),
    (100,   180,   2150,   145,   1750),
    (160,   245,   3100,   200,   2500),
    (250,   340,   4200,   275,   3400),
    (400,   480,   6000,   390,   4850),
    (630,   650,   8400,   530,   6800),
    (1000,  900,  13000,   740,  10500),
    (1600, 1200,  20000,   980,  16000),
    (2500, 1600,  32000,  1300,  26000),
]

_LOSS_LIMITS_DRY: List[Tuple[float, float, float, float, float]] = [
    (50,    200,   1800,   160,   1500),
    (100,   320,   2600,   260,   2200),
    (160,   460,   3500,   370,   2900),
    (250,   650,   4600,   520,   3800),
    (400,   930,   6500,   750,   5300),
    (630,  1300,   9500,  1050,   7800),
    (1000, 1850,  15000,  1500,  12000),
    (1600, 2600,  22500,  2100,  18000),
    (2500, 3700,  34000,  3000,  27000),
]


def _interpolate(
    kva: float,
    table: List[Tuple[float, float, float, float, float]],
) -> Tuple[float, float, float, float]:
    """Linearly interpolate loss limits for a given kVA rating."""
    if kva <= table[0][0]:
        return table[0][1], table[0][2], table[0][3], table[0][4]
    if kva >= table[-1][0]:
        # Extrapolate beyond max using last row ratios
        n = table[-1]
        return n[1], n[2], n[3], n[4]
    for i in range(len(table) - 1):
        lo, hi = table[i], table[i + 1]
        if lo[0] <= kva <= hi[0]:
            t = (kva - lo[0]) / (hi[0] - lo[0])
            return (
                lo[1] + t * (hi[1] - lo[1]),
                lo[2] + t * (hi[2] - lo[2]),
                lo[3] + t * (hi[3] - lo[3]),
                lo[4] + t * (hi[4] - lo[4]),
            )
    return table[-1][1], table[-1][2], table[-1][3], table[-1][4]


def _loss_class(po_actual: float, pk_actual: float, po_max: float, pk_max: float) -> str:
    """Determine loss class based on percentage of max limits."""
    po_pct = po_actual / po_max if po_max > 0 else 1.0
    pk_pct = pk_actual / pk_max if pk_max > 0 else 1.0
    avg_pct = (po_pct + pk_pct) / 2

    if avg_pct <= 0.75:
        return "A+"
    elif avg_pct <= 0.90:
        return "A"
    elif avg_pct <= 1.0:
        return "B"
    else:
        return "C"


class TransformerEfficiencyCalculator(BaseCalculator[TransformerEfficiencyInput]):
    """
    TRF-005: Transformer Energy Efficiency per EU 548/2014

    Validates transformer losses against EU 548/2014 Tier 1 (2015) and
    Tier 2 (2021) minimum efficiency requirements.
    """

    CALCULATION_CODE = "TRF-005"
    CALCULATION_NAME = "Transformer Energy Efficiency (EU 548/2014)"
    FORMULA_VERSION = "1.0"
    STANDARD = "EU 548/2014"
    STANDARD_VERSION = "2014"
    ENGINE_VERSION = "0.1.0"

    def get_units(self):
        return {
            "tier_1_no_load_max_w": "W",
            "tier_1_load_max_w": "W",
            "tier_2_no_load_max_w": "W",
            "tier_2_load_max_w": "W",
            "efficiency_percent": "%",
        }

    def validate_inputs(self, inputs: TransformerEfficiencyInput) -> bool:
        if inputs.transformer_type not in ("oil", "dry"):
            raise ValueError("transformer_type must be 'oil' or 'dry'")
        if inputs.voltage_level not in ("LV", "MV"):
            raise ValueError("voltage_level must be 'LV' or 'MV'")
        return True

    def _calculate(self, inputs: TransformerEfficiencyInput) -> Dict:
        table = _LOSS_LIMITS_OIL if inputs.transformer_type == "oil" else _LOSS_LIMITS_DRY
        po_t1, pk_t1, po_t2, pk_t2 = _interpolate(inputs.rated_power_kva, table)

        compliant_t1 = inputs.no_load_loss_w <= po_t1 and inputs.load_loss_w <= pk_t1
        compliant_t2 = inputs.no_load_loss_w <= po_t2 and inputs.load_loss_w <= pk_t2

        # Estimate efficiency at 100% load, PF=0.8
        output_power_w = inputs.rated_power_kva * 1000 * 0.8
        total_loss_w = inputs.no_load_loss_w + inputs.load_loss_w
        efficiency_pct = (
            (output_power_w / (output_power_w + total_loss_w)) * 100
            if output_power_w > 0 else 0.0
        )

        loss_class = _loss_class(
            inputs.no_load_loss_w, inputs.load_loss_w,
            po_t2, pk_t2,
        )

        return {
            "rated_power_kva": inputs.rated_power_kva,
            "no_load_loss_w": inputs.no_load_loss_w,
            "load_loss_w": inputs.load_loss_w,
            "transformer_type": inputs.transformer_type,
            "voltage_level": inputs.voltage_level,
            "tier_1_no_load_max_w": round(po_t1, 1),
            "tier_1_load_max_w": round(pk_t1, 1),
            "tier_2_no_load_max_w": round(po_t2, 1),
            "tier_2_load_max_w": round(pk_t2, 1),
            "compliant_tier_1": compliant_t1,
            "compliant_tier_2": compliant_t2,
            "efficiency_percent": round(efficiency_pct, 3),
            "loss_class": loss_class,
            "standard": "EU 548/2014 (Directive 2009/125/EC Lot 2)",
        }
