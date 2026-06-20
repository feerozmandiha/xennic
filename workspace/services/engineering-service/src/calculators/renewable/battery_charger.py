"""
BATTERY-002: Battery Charger Selection Calculator (IEEE 485 / IEC 60364)

Designs a battery charger/rectifier system for stationary battery banks.

Key references:
  IEEE 485-2020  — Recommended Practice for Sizing Lead-Acid Batteries
  IEC 60364-5-56 — Low-voltage electrical installations — Safety services
  IEC 60146      — Semiconductor converters

Formulas:
  V_float   = N_cells × V_cell_float
  V_boost   = N_cells × V_cell_boost
  I_charge  = C_rated × C_rate / (η_temp × η_alt)
  P_dc      = V_boost × I_charge + P_load
  P_ac_kva  = P_dc / (η_ch × PF)
  I_ac      = P_ac / (√3 × V_ac)
"""

import math
import statistics
from typing import Dict, List, Any, Tuple
from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import BatteryChargerInput, BatteryChargerOutput


_CELL_VOLTAGES = {
    'flooded':  (2.17, 2.50, 1.75),   # float, boost, end-of-discharge
    'VRLA':     (2.27, 2.40, 1.80),
    'LiFePO4':  (3.35, 3.65, 2.80),
    'LiNMC':    (3.45, 3.65, 3.00),
}

_STANDARD_CHARGER_RATINGS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 120,
                             150, 200, 250, 300, 400, 500, 600, 800, 1000]

# Cable sizing (mm²) per 60°C PVC — approximate DC current capacity
_CABLE_TABLE = [
    (2.5,  25),   (4,   32),   (6,   42),
    (10,   60),   (16,  80),   (25,  105),
    (35,   130),  (50,  160),  (70,  200),
    (95,   240),  (120, 280),  (150, 320),
]


def _select_standard_rating(current_a: float) -> int:
    for r in _STANDARD_CHARGER_RATINGS:
        if r >= current_a:
            return r
    return _STANDARD_CHARGER_RATINGS[-1]


def _select_cable_mm2(current_a: float) -> float:
    for mm2, amp in _CABLE_TABLE:
        if amp >= current_a * 1.25:
            return float(mm2)
    return float(_CABLE_TABLE[-1][0])


class BatteryChargerCalculator(BaseCalculator[BatteryChargerInput]):
    """
    BATTERY-002: Battery Charger / Rectifier Selection
    """

    CALCULATION_CODE = "BATTERY-002"
    CALCULATION_NAME = "Battery Charger Selection"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEEE 485-2020 / IEC 60364-5-56"
    STANDARD_VERSION = "2020/2019"
    ENGINE_VERSION   = "0.1.0"

    def validate_inputs(self, inputs: BatteryChargerInput) -> bool:
        ValidationEngine.validate_positive(inputs.battery_capacity_ah, "battery_capacity_ah")
        ValidationEngine.validate_positive(inputs.system_voltage_dc_v, "system_voltage_dc_v")
        return True

    def _calculate(self, inputs: BatteryChargerInput) -> Dict[str, Any]:
        cap     = inputs.battery_capacity_ah
        btype   = inputs.battery_type
        n_cells = inputs.cells_per_bank
        v_dc    = inputs.system_voltage_dc_v
        c_rate  = inputs.charge_rate_c
        t_rech  = inputs.recharge_time_hours
        p_load  = inputs.simultaneous_load_kw
        ctype   = inputs.charger_type
        v_ac    = inputs.ac_voltage_v
        f_ac    = inputs.ac_frequency_hz
        t_amb   = inputs.ambient_temp_c
        alt     = inputs.altitude_m
        pf_target = inputs.target_power_factor

        # Cell voltages
        v_float_c, v_boost_c, v_eod_c = _CELL_VOLTAGES[btype]

        v_float_total = n_cells * v_float_c
        v_boost_total = n_cells * v_boost_c

        # Temperature derating
        # Lead-acid: ~0.5%/°C below 25°C; lithium: ~0.3%/°C below 0°C
        if btype in ('flooded', 'VRLA'):
            temp_derate = 1.0 - max(0.0, (25.0 - t_amb) * 0.005)
        else:
            temp_derate = 1.0 - max(0.0, (0.0 - t_amb) * 0.003)
        temp_derate = max(0.6, min(1.0, temp_derate))

        # Altitude derating: ~1%/100m above 1000m
        alt_derate = 1.0 - max(0.0, (alt - 1000.0) / 100.0 * 0.01)
        alt_derate = max(0.6, min(1.0, alt_derate))

        # Charging current (base)
        i_charge_base = cap * c_rate

        # Effective current considering derating
        i_charge_eff = i_charge_base / (temp_derate * alt_derate)

        # Standard charger selection
        selected_rating = _select_standard_rating(i_charge_eff)

        # Modules (parallel rectifier modules)
        module_rating = 50  # base module size
        n_modules = math.ceil(selected_rating / module_rating)
        selected_rating_actual = n_modules * module_rating

        # DC power
        # Use boost voltage for sizing (worst case)
        p_dc_charge_kw = (v_boost_total * selected_rating_actual) / 1000.0
        p_dc_total_kw = p_dc_charge_kw + p_load

        # Charger efficiency
        # Thyristor: ~92%, HF: ~96%
        if ctype == 'thyristor':
            efficiency = 0.92
            p_reactive_factor = 1.15  # typical displacement PF ~0.87
            ripple_mv = 100.0        # higher ripple for thyristor
        else:
            efficiency = 0.96
            p_reactive_factor = 1.0 / pf_target
            ripple_mv = 30.0         # low ripple for HF

        charger_pf = min(pf_target, 0.95 if ctype == 'high_frequency' else 0.88)

        # AC input
        p_ac_kw = p_dc_total_kw / efficiency
        p_ac_kva = p_ac_kw / charger_pf
        i_ac_a = p_ac_kva * 1000.0 / (math.sqrt(3) * v_ac) if v_ac > 0 else 0.0

        # Protection
        i_dc_fuse = selected_rating_actual * 1.25
        i_ac_breaker = i_ac_a * 1.15
        cable_mm2 = _select_cable_mm2(selected_rating_actual)

        protection_notes: List[str] = [
            f"DC output fuse: {i_dc_fuse:.0f}A (125% of charger rating)",
            f"AC input breaker: {i_ac_breaker:.0f}A (115% of input current)",
            "Charger output reverse polarity protection required",
            "DC overvoltage protection set at 115% of boost voltage",
        ]
        if ctype == 'thyristor':
            protection_notes.append("AC input harmonic filter recommended (5th, 7th, 11th)")

        recommendations: List[str] = [
            f"Install {n_modules} × {module_rating}A charger modules in parallel",
            f"Use {ctype.replace('_', ' ').title()} technology for {btype} battery",
            f"Verify charger operating range: {v_float_total:.0f}–{v_boost_total:.0f}V DC",
        ]
        if alt > 1500:
            recommendations.append(f"Altitude derating ({alt:.0f}m) reduces capacity — oversize by {int((1/alt_derate - 1)*100)}%")
        if t_amb > 40:
            recommendations.append("High ambient temperature — ensure adequate ventilation / forced cooling")
        if p_load > 0:
            recommendations.append(f"Charger sized for simultaneous load of {p_load:.1f} kW during recharge")
        recommendations.append(f"Ground fault detection recommended per IEC 60364-5-56")

        return {
            "battery_type": btype,
            "system_voltage_v": v_dc,
            "cell_float_voltage_v": v_float_c,
            "cell_boost_voltage_v": v_boost_c,
            "charging_voltage_float_v": round(v_float_total, 1),
            "charging_voltage_boost_v": round(v_boost_total, 1),
            "charging_current_a": round(i_charge_base, 1),
            "temperature_derating_factor": round(temp_derate, 3),
            "altitude_derating_factor": round(alt_derate, 3),
            "effective_charge_current_a": round(i_charge_eff, 1),
            "charger_dc_power_kw": round(p_dc_charge_kw, 2),
            "simultaneous_load_kw": p_load,
            "total_dc_power_kw": round(p_dc_total_kw, 2),
            "charger_efficiency_pct": round(efficiency * 100, 1),
            "charger_ac_input_kva": round(p_ac_kva, 2),
            "charger_ac_input_kw": round(p_ac_kw, 2),
            "ac_input_current_a": round(i_ac_a, 1),
            "charger_power_factor": round(charger_pf, 3),
            "selected_charger_rating_a": selected_rating_actual,
            "selected_charger_modules": n_modules,
            "module_rating_a": module_rating,
            "estimated_output_ripple_mv_pp": ripple_mv,
            "dc_fuse_rating_a": round(i_dc_fuse, 0),
            "ac_breaker_rating_a": round(i_ac_breaker, 0),
            "recommended_cable_mm2": cable_mm2,
            "protection_notes": protection_notes,
            "recommendation_notes": recommendations,
        }

    def get_units(self) -> Dict[str, str]:
        return {
            "cell_float_voltage_v": "V",
            "cell_boost_voltage_v": "V",
            "charging_voltage_float_v": "V",
            "charging_voltage_boost_v": "V",
            "charging_current_a": "A",
            "effective_charge_current_a": "A",
            "charger_dc_power_kw": "kW",
            "total_dc_power_kw": "kW",
            "charger_ac_input_kva": "kVA",
            "charger_ac_input_kw": "kW",
            "ac_input_current_a": "A",
            "estimated_output_ripple_mv_pp": "mV",
            "dc_fuse_rating_a": "A",
            "ac_breaker_rating_a": "A",
            "recommended_cable_mm2": "mm²",
        }

    def get_output_model(self):
        return BatteryChargerOutput
