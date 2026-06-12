"""
IEC 60364-5-52: Ampacity Tables for Cables

Reference: IEC 60364-5-52:2009 - Electrical installations of buildings
Part 5-52: Selection and erection of electrical equipment - Wiring systems

Tables included:
- B.52.1: Copper conductors, PVC insulated, Method B2 (conduit)
- B.52.2: Copper conductors, PVC insulated, Method C (on wall)
- B.52.3: Copper conductors, XLPE insulated, Method B2
- B.52.4: Copper conductors, XLPE insulated, Method C
- B.52.5: Aluminum conductors, PVC insulated, Method B2
- B.52.6: Aluminum conductors, PVC insulated, Method C
- B.52.7: Temperature correction factors (ambient temperature)
- B.52.8: Grouping correction factors (number of circuits)
"""

from typing import Dict, Literal

# Cross-sectional areas (mm²) for cables
CABLE_SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400]

# ============================================================================
# Table B.52.1 - Copper, PVC insulated, Method B2 (conduit or trunking)
# Current-carrying capacity (Amperes) - CORRECTED VALUES
# ============================================================================
COPPER_PVC_B2: Dict[int, float] = {
    1.5: 13.5,
    2.5: 18.5,
    4: 25.0,
    6: 32.0,
    10: 44.0,
    16: 60.0,
    25: 80.0,
    35: 99.0,
    50: 122.0,
    70: 155.0,
    95: 188.0,
    120: 217.0,
    150: 250.0,
    185: 285.0,
    240: 340.0,
    300: 390.0,
    400: 447.0,
}

# ============================================================================
# Table B.52.2 - Copper, PVC insulated, Method C (on wall / free air)
# Current-carrying capacity (Amperes) - CORRECTED VALUES
# ============================================================================
COPPER_PVC_C: Dict[int, float] = {
    1.5: 16.5,
    2.5: 23.0,
    4: 31.0,
    6: 40.0,
    10: 55.0,
    16: 74.0,
    25: 98.0,
    35: 122.0,
    50: 150.0,
    70: 188.0,
    95: 228.0,
    120: 264.0,
    150: 305.0,
    185: 350.0,
    240: 415.0,
    300: 475.0,
    400: 545.0,
}

# ============================================================================
# Table B.52.3 - Copper, XLPE insulated, Method B2 (conduit)
# Current-carrying capacity (Amperes) - CORRECTED VALUES
# ============================================================================
COPPER_XLPE_B2: Dict[int, float] = {
    1.5: 16.0,
    2.5: 22.0,
    4: 30.0,
    6: 39.0,
    10: 54.0,
    16: 73.0,
    25: 97.0,
    35: 120.0,
    50: 148.0,
    70: 187.0,
    95: 227.0,
    120: 263.0,
    150: 304.0,
    185: 348.0,
    240: 415.0,
    300: 476.0,
    400: 547.0,
}

# ============================================================================
# Table B.52.4 - Copper, XLPE insulated, Method C (on wall / free air)
# Current-carrying capacity (Amperes) - CORRECTED VALUES
# ============================================================================
COPPER_XLPE_C: Dict[int, float] = {
    1.5: 20.0,
    2.5: 28.0,
    4: 38.0,
    6: 49.0,
    10: 68.0,
    16: 92.0,
    25: 121.0,
    35: 150.0,
    50: 186.0,
    70: 233.0,
    95: 285.0,
    120: 330.0,
    150: 380.0,
    185: 435.0,
    240: 515.0,
    300: 590.0,
    400: 680.0,
}

# ============================================================================
# Aluminum tables (77% of copper values)
# ============================================================================
ALUMINUM_PVC_B2: Dict[int, float] = {
    size: round(value * 0.77, 1) for size, value in COPPER_PVC_B2.items()
}
ALUMINUM_PVC_C: Dict[int, float] = {
    size: round(value * 0.77, 1) for size, value in COPPER_PVC_C.items()
}
ALUMINUM_XLPE_B2: Dict[int, float] = {
    size: round(value * 0.77, 1) for size, value in COPPER_XLPE_B2.items()
}
ALUMINUM_XLPE_C: Dict[int, float] = {
    size: round(value * 0.77, 1) for size, value in COPPER_XLPE_C.items()
}

# ============================================================================
# Temperature Correction Factors (Table B.52.7)
# ============================================================================
TEMPERATURE_CORRECTION_FACTORS: Dict[str, Dict[int, float]] = {
    "PVC": {
        25: 1.03,
        30: 1.00,
        35: 0.94,
        40: 0.87,
        45: 0.79,
        50: 0.71,
        55: 0.61,
        60: 0.50,
    },
    "XLPE": {
        25: 1.08,
        30: 1.05,
        35: 1.02,
        40: 1.00,
        45: 0.96,
        50: 0.91,
        55: 0.86,
        60: 0.80,
        65: 0.74,
        70: 0.67,
    },
}

# ============================================================================
# Grouping Correction Factors (Table B.52.8)
# ============================================================================
GROUPING_CORRECTION_FACTORS: Dict[int, float] = {
    1: 1.00,
    2: 0.80,
    3: 0.70,
    4: 0.65,
    5: 0.60,
    6: 0.57,
    7: 0.54,
    8: 0.52,
    9: 0.50,
    10: 0.48,
}


def get_ampacity_table(
    conductor_material: str,
    insulation_type: str,
    installation_method: str,
) -> Dict[int, float]:
    """Get the appropriate ampacity table based on parameters"""
    
    if conductor_material == "copper" and insulation_type == "PVC":
        if installation_method == "B2":
            return COPPER_PVC_B2
        else:
            return COPPER_PVC_C
    elif conductor_material == "copper" and insulation_type == "XLPE":
        if installation_method == "B2":
            return COPPER_XLPE_B2
        else:
            return COPPER_XLPE_C
    elif conductor_material == "aluminum" and insulation_type == "PVC":
        if installation_method == "B2":
            return ALUMINUM_PVC_B2
        else:
            return ALUMINUM_PVC_C
    elif conductor_material == "aluminum" and insulation_type == "XLPE":
        if installation_method == "B2":
            return ALUMINUM_XLPE_B2
        else:
            return ALUMINUM_XLPE_C
    else:
        return {}


def find_minimum_cable_size(
    required_current: float,
    ampacity_table: Dict[int, float],
) -> int:
    """Find the minimum cable size that can carry the required current"""
    for size in CABLE_SIZES:
        if size in ampacity_table and ampacity_table[size] >= required_current:
            return size
    return CABLE_SIZES[-1]

# ============================================================================
# Conductor Resistance and Reactance (per km)
# Reference: IEC 60287
# ============================================================================

# Resistance (Ω/km) at 90°C for XLPE and 70°C for PVC
CONDUCTOR_RESISTANCE = {
    "copper": {
        1.5: 12.1,
        2.5: 7.41,
        4: 4.61,
        6: 3.08,
        10: 1.83,
        16: 1.15,
        25: 0.727,
        35: 0.524,
        50: 0.387,
        70: 0.268,
        95: 0.193,
        120: 0.153,
        150: 0.124,
        185: 0.0991,
        240: 0.0754,
        300: 0.0601,
        400: 0.0470,
    },
    "aluminum": {
        1.5: 19.9,
        2.5: 12.2,
        4: 7.56,
        6: 5.06,
        10: 3.00,
        16: 1.88,
        25: 1.20,
        35: 0.868,
        50: 0.641,
        70: 0.443,
        95: 0.320,
        120: 0.253,
        150: 0.206,
        185: 0.164,
        240: 0.125,
        300: 0.100,
        400: 0.0778,
    },
}

# Reactance (Ω/km) approximate for cables (values based on IEC 60287)
CONDUCTOR_REACTANCE = {
    1.5: 0.120,
    2.5: 0.115,
    4: 0.110,
    6: 0.105,
    10: 0.100,
    16: 0.095,
    25: 0.090,
    35: 0.085,
    50: 0.080,
    70: 0.075,
    95: 0.070,
    120: 0.068,
    150: 0.065,
    185: 0.062,
    240: 0.060,
    300: 0.058,
    400: 0.055,
}

# ============================================================================
# Short Circuit Withstand Constants (k factor)
# Reference: IEC 60949 - Table 1
# 
# k = sqrt( (Q_c * (B + 20)) / ρ_20 * ln((B + θ_f) / (B + θ_i)) )
# 
# Standard values:
# - Copper/PVC:   115 (θ_i = 70°C, θ_f = 160°C)
# - Copper/XLPE:  143 (θ_i = 90°C, θ_f = 250°C)
# - Copper/EPR:   143 (θ_i = 90°C, θ_f = 250°C)
# - Aluminum/PVC: 76  (θ_i = 70°C, θ_f = 160°C)
# - Aluminum/XLPE:94  (θ_i = 90°C, θ_f = 250°C)
# - Aluminum/EPR: 94  (θ_i = 90°C, θ_f = 250°C)
# ============================================================================

SHORT_CIRCUIT_K_FACTORS = {
    "copper": {
        "PVC": 115.0,
        "XLPE": 143.0,
        "EPR": 143.0,
    },
    "aluminum": {
        "PVC": 76.0,
        "XLPE": 94.0,
        "EPR": 94.0,
    },
}
