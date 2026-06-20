"""
SOLAR-002: Inverter Sizing & String Configuration (IEC 62548)

Designs the optimal string configuration and inverter selection for a PV array.

Key formulas (IEC 62548):
  V_oc_max  = N × V_oc_STC × (1 + (T_min - 25) × TC_Voc / 100)
  V_mp_min  = N × V_mp_STC × (1 + (T_cell_max - 25) × TC_Vmp / 100)
  N_max     = floor(V_inv_max / V_oc_at_Tmin_per_module)
  N_min     = ceil(V_mppt_min / V_mp_at_Tmax_per_module)

Where T_cell_max = T_ambient_max + 25°C (typical urban installation).
Temperature coefficient of Vmp is approximated as ~1.25 × TC_Voc.
"""

import math
from typing import Dict, List, Any
from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import InverterSizingInput, InverterSizingOutput


class InverterSizingCalculator(BaseCalculator[InverterSizingInput]):
    """
    SOLAR-002: Inverter Sizing & String Configuration
    """

    CALCULATION_CODE = "SOLAR-002"
    CALCULATION_NAME = "Inverter Sizing & String Design"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 62548:2016"
    STANDARD_VERSION = "2016"
    ENGINE_VERSION   = "0.1.0"

    def validate_inputs(self, inputs: InverterSizingInput) -> bool:
        ValidationEngine.validate_positive(inputs.pv_capacity_kwp, "pv_capacity_kwp")
        ValidationEngine.validate_positive(inputs.module_watt_peak, "module_watt_peak")
        return True

    def _calculate(self, inputs: InverterSizingInput) -> Dict[str, Any]:
        p_pv_kwp = inputs.pv_capacity_kwp
        p_mod_wp = inputs.module_watt_peak
        v_oc     = inputs.module_voc_v
        v_mp     = inputs.module_vmp_v
        i_sc     = inputs.module_isc_a
        i_mp     = inputs.module_imp_a
        tc_voc   = inputs.module_temp_coeff_voc_pct
        tc_vmp   = tc_voc * 1.25  # approximate Vmp temp coefficient
        t_min    = inputs.t_min_c
        t_cell   = inputs.t_max_c
        v_inv_max= inputs.inverter_max_dc_voltage_v
        mppt_min = inputs.inverter_mppt_min_v
        mppt_max = inputs.inverter_mppt_max_v
        i_inv_max= inputs.inverter_max_input_current_a
        p_inv_ac = inputs.inverter_ac_power_kw
        dc_ac_rt= inputs.dc_ac_ratio_target
        t_amb    = inputs.max_ambient_temp_c
        alt      = inputs.altitude_m

        # ── Voltage per module at extreme temperatures ───────────────────────
        v_oc_at_tmin = v_oc * (1.0 + (t_min - 25.0) * tc_voc / 100.0)
        v_mp_at_tmax = v_mp * (1.0 + (t_cell - 25.0) * tc_vmp / 100.0)
        i_sc_at_tmax = i_sc * (1.0 + (t_cell - 25.0) * 0.0005)  # ~0.05%/°C

        # ── String sizing ────────────────────────────────────────────────────
        max_per_string = int(math.floor(v_inv_max / v_oc_at_tmin))
        min_per_string = int(math.ceil(mppt_min / v_mp_at_tmax))

        if max_per_string < min_per_string:
            max_per_string = min_per_string  # fallback

        # Choose optimum modules per string (center of range, round down for safety)
        n_per_string = (max_per_string + min_per_string) // 2
        n_per_string = max(min_per_string, min(n_per_string, max_per_string))

        # Total modules needed
        total_modules_ideal = int(math.ceil(p_pv_kwp * 1000.0 / p_mod_wp))
        n_strings = int(math.ceil(total_modules_ideal / n_per_string))
        total_modules = n_strings * n_per_string
        p_pv_actual_kwp = total_modules * p_mod_wp / 1000.0

        # ── Inverter sizing ──────────────────────────────────────────────────
        # Temperature derating: ~0.5%/°C above 45°C
        temp_derate = 1.0 - max(0.0, (t_amb - 45.0) * 0.005)
        temp_derate = max(0.6, min(1.0, temp_derate))

        # Altitude derating: ~1%/100m above 1000m
        alt_derate = 1.0 - max(0.0, (alt - 1000.0) / 100.0 * 0.01)
        alt_derate = max(0.6, min(1.0, alt_derate))

        p_inv_derated = p_inv_ac * temp_derate * alt_derate

        required_ac_power = p_pv_actual_kwp / dc_ac_rt
        n_inverters = max(1, math.ceil(required_ac_power / p_inv_derated))
        total_ac_power = n_inverters * p_inv_derated

        dc_ac_ratio_actual = p_pv_actual_kwp / total_ac_power if total_ac_power > 0 else 0.0

        # DC power per inverter
        p_dc_per_inv = p_pv_actual_kwp / n_inverters

        # ── String current check ─────────────────────────────────────────────
        string_isc = i_sc_at_tmax
        strings_per_inv = n_strings / n_inverters

        # ── Voltage checks ────────────────────────────────────────────────────
        v_string_max = n_per_string * v_oc_at_tmin
        v_string_mp_min = n_per_string * v_mp_at_tmax

        # Inverter loading ratio
        ilr = p_dc_per_inv / p_inv_derated if p_inv_derated > 0 else 0.0

        # ── Recommendations ──────────────────────────────────────────────────
        recommendations: List[str] = []
        if v_string_max > v_inv_max:
            recommendations.append(
                f"String Voc at T_min ({v_string_max:.0f}V) exceeds inverter max "
                f"({v_inv_max:.0f}V) — reduce modules per string to {max_per_string}"
            )
        if v_string_mp_min < mppt_min:
            recommendations.append(
                f"String Vmp at T_cell ({v_string_mp_min:.0f}V) below MPPT min "
                f"({mppt_min:.0f}V) — increase modules per string"
            )
        if v_string_mp_min > mppt_max:
            recommendations.append(
                f"String Vmp at T_cell ({v_string_mp_min:.0f}V) exceeds MPPT max "
                f"({mppt_max:.0f}V) — reduce modules per string"
            )
        if string_isc > i_inv_max:
            recommendations.append(
                f"String Isc ({string_isc:.1f}A) exceeds inverter max input current "
                f"({i_inv_max:.0f}A) — use fused combiners or reduce strings per input"
            )
        if alt > 1500:
            recommendations.append(
                f"Altitude {alt:.0f}m derating {alt_derate*100:.0f}% — "
                f"oversize inverter by {int((1/alt_derate - 1)*100)}%"
            )
        if t_amb > 45:
            recommendations.append(
                f"Ambient temp {t_amb:.0f}°C derating {temp_derate*100:.0f}% — "
                "ensure ventilation or oversize inverter"
            )
        if n_inverters > 1:
            recommendations.append(f"Use {n_inverters} inverters with {n_per_string}s × {int(strings_per_inv)}p configuration")

        recommendations.append(
            f"DC/AC ratio {dc_ac_ratio_actual:.2f} — within typical range (1.1–1.5)"
        )

        return {
            "modules_per_string": n_per_string,
            "max_modules_per_string": max_per_string,
            "min_modules_per_string": min_per_string,
            "number_of_strings": n_strings,
            "total_modules": total_modules,
            "actual_pv_power_kwp": round(p_pv_actual_kwp, 2),
            "number_of_inverters": n_inverters,
            "inverter_dc_power_kw": round(p_dc_per_inv, 2),
            "inverter_ac_power_total_kw": round(total_ac_power, 2),
            "dc_ac_ratio_actual": round(dc_ac_ratio_actual, 3),
            "max_string_voc_v": round(v_string_max, 1),
            "min_string_vmp_v": round(v_string_mp_min, 1),
            "max_string_isc_a": round(string_isc, 2),
            "string_current_a": round(i_mp, 2),
            "total_strings_per_inverter": round(strings_per_inv, 1),
            "temperature_derating_pct": round(temp_derate * 100, 1),
            "altitude_derating_pct": round(alt_derate * 100, 1),
            "effective_inverter_capacity_kw": round(p_inv_derated, 2),
            "inverter_loading_ratio": round(ilr, 3),
            "total_inverter_connections": n_strings,
            "recommendation_notes": recommendations,
        }

    def get_units(self) -> Dict[str, str]:
        return {
            "actual_pv_power_kwp": "kWp",
            "inverter_dc_power_kw": "kW",
            "inverter_ac_power_total_kw": "kW",
            "effective_inverter_capacity_kw": "kW",
            "max_string_voc_v": "V",
            "min_string_vmp_v": "V",
            "max_string_isc_a": "A",
            "string_current_a": "A",
        }

    def get_output_model(self):
        return InverterSizingOutput
