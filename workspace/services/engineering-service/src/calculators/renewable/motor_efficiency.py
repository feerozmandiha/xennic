"""
MOT-002: Motor Efficiency Calculator (IEC 60034-30-1)

Verifies IE class compliance (IE1–IE4), calculates efficiency at 50%,
75%, and 100% load, estimates power factor, and computes energy
savings when upgrading to a higher IE class.

References:
  - IEC 60034-30-1:2014 — Efficiency classes for line-operated AC motors
  - IEC 60034-2-1:2014 — Standard methods for determining losses and efficiency
  - EU 2019/1781 — Ecodesign requirements for electric motors
"""

import math
from typing import Dict, List, Optional

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import MotorEfficiencyInput


# ── Minimum efficiency (%) tables per IEC 60034-30-1 ─────────────────────────
# 4-pole / 50 Hz (most common industrial motors)
IE_TABLE_4P_50HZ: Dict[str, Dict[float, float]] = {
    'IE4': {
        0.75: 85.5, 1.1: 86.5, 1.5: 87.5, 2.2: 88.5, 3: 89.5,
        4: 90.0, 5.5: 91.0, 7.5: 91.5, 11: 92.5, 15: 93.0,
        18.5: 93.5, 22: 93.5, 30: 94.0, 37: 94.5, 45: 94.5,
        55: 95.0, 75: 95.5, 90: 95.5, 110: 95.5, 132: 96.0,
        160: 96.0, 200: 96.0, 250: 96.0, 315: 96.0, 375: 96.0,
    },
    'IE3': {
        0.75: 82.5, 1.1: 84.1, 1.5: 85.3, 2.2: 86.7, 3: 87.7,
        4: 88.6, 5.5: 89.6, 7.5: 90.4, 11: 91.4, 15: 92.1,
        18.5: 92.6, 22: 93.0, 30: 93.6, 37: 93.9, 45: 94.2,
        55: 94.6, 75: 95.0, 90: 95.2, 110: 95.4, 132: 95.6,
        160: 95.8, 200: 96.0, 250: 96.1, 315: 96.2, 375: 96.3,
    },
    'IE2': {
        0.75: 77.4, 1.1: 79.6, 1.5: 81.3, 2.2: 83.2, 3: 84.6,
        4: 85.8, 5.5: 87.0, 7.5: 88.1, 11: 89.4, 15: 90.3,
        18.5: 91.0, 22: 91.6, 30: 92.3, 37: 92.8, 45: 93.3,
        55: 93.8, 75: 94.3, 90: 94.7, 110: 95.1, 132: 95.3,
        160: 95.5, 200: 95.7, 250: 95.9, 315: 96.0, 375: 96.1,
    },
    'IE1': {
        0.75: 72.1, 1.1: 75.0, 1.5: 77.2, 2.2: 79.7, 3: 81.5,
        4: 83.1, 5.5: 84.7, 7.5: 86.0, 11: 87.6, 15: 88.7,
        18.5: 89.5, 22: 90.2, 30: 91.0, 37: 91.6, 45: 92.2,
        55: 92.8, 75: 93.5, 90: 93.9, 110: 94.3, 132: 94.6,
        160: 94.9, 200: 95.1, 250: 95.4, 315: 95.6, 375: 95.7,
    },
}

# Pole correction factors (approx) relative to 4-pole
POLE_FACTOR = {2: 0.97, 4: 1.0, 6: 0.95, 8: 0.92}

# Frequency correction: 60Hz → slightly lower efficiency
FREQ_FACTOR_60HZ = 0.985

# Power factor at full load (estimation for 4-pole motors)
PF_TABLE: Dict[float, float] = {
    0.75: 0.75, 1.1: 0.78, 1.5: 0.80, 2.2: 0.82, 3: 0.83,
    4: 0.84, 5.5: 0.85, 7.5: 0.86, 11: 0.87, 15: 0.87,
    18.5: 0.88, 22: 0.88, 30: 0.89, 37: 0.89, 45: 0.89,
    55: 0.90, 75: 0.90, 90: 0.91, 110: 0.91, 132: 0.91,
    160: 0.91, 200: 0.92, 250: 0.92, 315: 0.92, 375: 0.92,
}

# Typical motor price per kW (USD, approximate) by IE class
IE_COST_PER_KW = {'IE1': 30, 'IE2': 40, 'IE3': 55, 'IE4': 80}

# Emission factor (kg CO₂ per kWh, Iran grid average)
CO2_FACTOR_KG_PER_KWH = 0.65


def _interpolate(table: Dict[float, float], power: float) -> float:
    """Interpolate value from power table (kW keys)."""
    keys = sorted(table.keys())
    if power <= keys[0]:
        return table[keys[0]]
    if power >= keys[-1]:
        return table[keys[-1]]
    for i in range(len(keys) - 1):
        if keys[i] <= power <= keys[i + 1]:
            t = (power - keys[i]) / (keys[i + 1] - keys[i])
            return table[keys[i]] + t * (table[keys[i + 1]] - table[keys[i]])
    return table[keys[-1]]


def _partial_load_efficiency(
    rated_eff: float,
    load_fraction: float,
    fixed_loss_ratio: float = 0.35,
) -> float:
    """
    Calculate efficiency at partial load using loss separation.

    Total losses at full load = (1 - η) / η × P_out
    Fixed losses (core + friction) = fixed_loss_ratio × total_losses
    Variable losses (copper + stray) ∝ load²
    """
    if load_fraction <= 0 or load_fraction > 1.0:
        return 0.0
    if rated_eff >= 100.0:
        return 100.0
    eff_dec = rated_eff / 100.0
    total_losses_fl = (1.0 - eff_dec) / eff_dec
    fixed_losses = fixed_loss_ratio * total_losses_fl
    var_losses = (1.0 - fixed_loss_ratio) * total_losses_fl
    load_losses = fixed_losses + var_losses * (load_fraction ** 2)
    p_out = load_fraction
    p_in = p_out + load_losses
    return p_out / p_in * 100.0


def _estimate_pf_at_load(full_load_pf: float, load_fraction: float) -> float:
    """Estimate power factor at partial load."""
    if load_fraction >= 0.8:
        return full_load_pf
    # PF drops roughly linearly at low loads
    pf_drop = (1.0 - load_fraction / 0.8) * 0.15
    return max(0.3, full_load_pf - pf_drop)


class MotorEfficiencyCalculator(BaseCalculator[MotorEfficiencyInput]):
    """
    MOT-002: Motor Efficiency Verification (IEC 60034-30-1)

    Verifies that a motor meets its declared IE class, calculates
    efficiency at 50%, 75%, and 100% load, and computes energy/CO₂
    savings when upgrading.
    """

    CALCULATION_CODE = "MOT-002"
    CALCULATION_NAME = "Motor Efficiency Verification"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 60034-30-1"
    STANDARD_VERSION = "2014"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self):
        return {
            "required_min_efficiency_pct": "%",
            "declared_efficiency_pct": "%",
            "efficiency_at_100_pct": "%",
            "efficiency_at_75_pct": "%",
            "efficiency_at_50_pct": "%",
            "class_compliant": "",
            "power_factor_at_100": "",
            "power_factor_at_75": "",
            "power_factor_at_50": "",
            "annual_energy_consumption_kwh": "kWh",
            "annual_energy_cost_usd": "USD",
            "annual_co2_kg": "kg",
            "upgrade_savings_kwh": "kWh",
            "upgrade_savings_usd": "USD",
            "upgrade_payback_years": "years",
        }

    def validate_inputs(self, inputs: MotorEfficiencyInput) -> bool:
        ValidationEngine.validate_positive(inputs.rated_power_kw, "rated_power_kw")
        ValidationEngine.validate_positive(inputs.declared_efficiency_pct, "declared_efficiency_pct")
        if inputs.declared_efficiency_pct > 100:
            raise ValueError("declared_efficiency_pct must be ≤ 100")
        return True

    def _calculate(self, inputs: MotorEfficiencyInput) -> Dict:
        # 1. Determine minimum required efficiency for declared IE class
        ie_table = IE_TABLE_4P_50HZ.get(inputs.ie_class, {})
        if not ie_table:
            base_req = 87.0
        else:
            base_req = _interpolate(ie_table, inputs.rated_power_kw)

        # Apply pole correction
        pole_corr = POLE_FACTOR.get(inputs.pole_count, 1.0)
        freq_corr = FREQ_FACTOR_60HZ if inputs.frequency_hz == 60 else 1.0
        min_req_eff = base_req * pole_corr * freq_corr

        # 2. Compliance check
        declared_eff = inputs.declared_efficiency_pct
        class_compliant = declared_eff >= min_req_eff - 0.1

        # 3. Partial load efficiency (using declared efficiency as full load)
        eff_100 = declared_eff
        eff_75 = _partial_load_efficiency(declared_eff, 0.75)
        eff_50 = _partial_load_efficiency(declared_eff, 0.50)

        # 4. Power factor estimation
        pf_100 = _interpolate(PF_TABLE, inputs.rated_power_kw)
        pf_75 = _estimate_pf_at_load(pf_100, 0.75)
        pf_50 = _estimate_pf_at_load(pf_100, 0.50)

        # 5. Annual energy
        actual_load_kw = inputs.rated_power_kw * inputs.load_factor
        annual_energy = actual_load_kw * inputs.annual_operating_hours / (eff_100 / 100.0)
        annual_cost = annual_energy * inputs.energy_cost_per_kwh
        annual_co2 = annual_energy * CO2_FACTOR_KG_PER_KWH

        # 6. Upgrade analysis: compare against next higher IE class
        ie_classes = ['IE1', 'IE2', 'IE3', 'IE4']
        upgrade_data: Optional[Dict] = None
        if inputs.ie_class in ie_classes:
            current_idx = ie_classes.index(inputs.ie_class)
            if current_idx < len(ie_classes) - 1:
                upgrade_class = ie_classes[current_idx + 1]
                upgrade_table = IE_TABLE_4P_50HZ.get(upgrade_class, {})
                if upgrade_table:
                    upg_eff_base = _interpolate(upgrade_table, inputs.rated_power_kw)
                    upg_eff = upg_eff_base * pole_corr * freq_corr
                    if upg_eff > declared_eff:
                        upg_annual = actual_load_kw * inputs.annual_operating_hours / (upg_eff / 100.0)
                        savings_kwh = annual_energy - upg_annual
                        savings_usd = savings_kwh * inputs.energy_cost_per_kwh
                        cost_diff = inputs.rated_power_kw * (IE_COST_PER_KW.get(upgrade_class, 55) - IE_COST_PER_KW.get(inputs.ie_class, 40))
                        payback = cost_diff / savings_usd if savings_usd > 0 else None
                        upgrade_data = {
                            'upgrade_to_class': upgrade_class,
                            'upgrade_efficiency_pct': round(upg_eff, 1),
                            'upgrade_savings_kwh': round(savings_kwh, 0),
                            'upgrade_savings_usd': round(savings_usd, 0),
                            'upgrade_cost_premium_usd': round(cost_diff, 0),
                            'upgrade_payback_years': round(payback, 1) if payback else None,
                        }

        # 7. Recommendations
        notes: List[str] = []
        if not class_compliant:
            notes.append(f"Declared efficiency ({declared_eff:.1f}%) is below {inputs.ie_class} minimum ({min_req_eff:.1f}%). Motor may not comply with IEC 60034-30-1.")
        if inputs.load_factor < 0.5:
            notes.append(f"Motor is lightly loaded ({inputs.load_factor*100:.0f}%). Consider downsizing for better efficiency.")
        if inputs.load_factor > 0.95:
            notes.append("Motor is near full load. Consider upgrading to next IE class for energy savings.")
        if upgrade_data and upgrade_data['upgrade_payback_years'] and upgrade_data['upgrade_payback_years'] < 2:
            notes.append(f"Upgrading to {upgrade_data['upgrade_to_class']} has payback < 2 years — strongly recommended.")
        if inputs.pole_count != 4:
            notes.append(f"Efficiency adjusted for {inputs.pole_count}-pole motor (correction factor: {pole_corr:.2f}).")

        result = {
            "rated_power_kw": inputs.rated_power_kw,
            "pole_count": inputs.pole_count,
            "frequency_hz": inputs.frequency_hz,
            "ie_class": inputs.ie_class,
            "declared_efficiency_pct": declared_eff,
            "required_min_efficiency_pct": round(min_req_eff, 1),
            "class_compliant": class_compliant,
            "efficiency_at_100_pct": round(eff_100, 1),
            "efficiency_at_75_pct": round(eff_75, 1),
            "efficiency_at_50_pct": round(eff_50, 1),
            "power_factor_at_100": round(pf_100, 3),
            "power_factor_at_75": round(pf_75, 3),
            "power_factor_at_50": round(pf_50, 3),
            "load_factor": inputs.load_factor,
            "annual_operating_hours": inputs.annual_operating_hours,
            "annual_energy_consumption_kwh": round(annual_energy, 0),
            "annual_energy_cost_usd": round(annual_cost, 0),
            "annual_co2_kg": round(annual_co2, 0),
            "energy_cost_per_kwh": inputs.energy_cost_per_kwh,
            "recommendation_notes": notes,
            "standard_reference": "IEC 60034-30-1:2014 / EU 2019/1781",
        }
        if upgrade_data:
            result.update(upgrade_data)
        return result
