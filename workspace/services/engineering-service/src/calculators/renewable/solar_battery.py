# src/calculators/renewable/solar_battery.py
"""
SOLAR-003: Solar PV Battery Sizing (IEC 62548)

Standards:
  IEC 62548:2016 — PV Array Design Requirements (battery sizing section)
  IEC 62619:2022 — Safety Requirements for Secondary Lithium Cells
  IEC 62109-1    — Power Converters for PV Systems
  IEEE 1013      — Lead-Acid Battery for PV Applications

Calculations:
  1. Energy requirement based on daily load and autonomy
  2. Battery capacity (kWh, Ah) with temperature derating
  3. Battery bank configuration (series/parallel)
  4. Discharge verification (C-rate check)
  5. Charge current and charge controller sizing
  6. PV production check (if PV data provided)
  7. Physical estimates (weight, volume)
  8. Lifecycle and cost analysis
  9. Protection sizing (fuse, cable)
"""

import math
from typing import Dict, Any, Optional

from src.core.base_calculator import BaseCalculator
from .schemas import SolarBatteryInput


BATTERY_SPECS = {
    "LiFePO4": {
        "cell_voltage":          3.2,
        "energy_density_wh_kg":  150,
        "cycle_life":            3000,
        "calendar_life_years":   10,
        "temp_derate_per_c":     0.005,
        "round_trip_efficiency": 0.95,
        "max_dod":               0.90,
        "self_discharge_month":  0.02,
        "cost_per_kwh_usd":      200,
        "max_c_rate":            1.0,
        "recommended_charge_c":  0.3,
    },
    "LiNMC": {
        "cell_voltage":          3.6,
        "energy_density_wh_kg":  200,
        "cycle_life":            1000,
        "calendar_life_years":   8,
        "temp_derate_per_c":     0.006,
        "round_trip_efficiency": 0.94,
        "max_dod":               0.80,
        "self_discharge_month":  0.03,
        "cost_per_kwh_usd":      250,
        "max_c_rate":            2.0,
        "recommended_charge_c":  0.5,
    },
    "LeadAcid": {
        "cell_voltage":          2.0,
        "energy_density_wh_kg":  40,
        "cycle_life":            400,
        "calendar_life_years":   5,
        "temp_derate_per_c":     0.008,
        "round_trip_efficiency": 0.85,
        "max_dod":               0.50,
        "self_discharge_month":  0.05,
        "cost_per_kwh_usd":      80,
        "max_c_rate":            0.25,
        "recommended_charge_c":  0.125,
    },
    "AGM": {
        "cell_voltage":          2.0,
        "energy_density_wh_kg":  45,
        "cycle_life":            600,
        "calendar_life_years":   6,
        "temp_derate_per_c":     0.007,
        "round_trip_efficiency": 0.88,
        "max_dod":               0.60,
        "self_discharge_month":  0.03,
        "cost_per_kwh_usd":      120,
        "max_c_rate":            0.3,
        "recommended_charge_c":  0.15,
    },
    "Gel": {
        "cell_voltage":          2.0,
        "energy_density_wh_kg":  42,
        "cycle_life":            700,
        "calendar_life_years":   7,
        "temp_derate_per_c":     0.007,
        "round_trip_efficiency": 0.87,
        "max_dod":               0.60,
        "self_discharge_month":  0.02,
        "cost_per_kwh_usd":      140,
        "max_c_rate":            0.25,
        "recommended_charge_c":  0.125,
    },
    "NaS": {
        "cell_voltage":          2.08,
        "energy_density_wh_kg":  120,
        "cycle_life":            2500,
        "calendar_life_years":   15,
        "temp_derate_per_c":     0.002,
        "round_trip_efficiency": 0.89,
        "max_dod":               0.80,
        "self_discharge_month":  0.00,
        "cost_per_kwh_usd":      400,
        "max_c_rate":            0.5,
        "recommended_charge_c":  0.2,
    },
    "NiCd": {
        "cell_voltage":          1.2,
        "energy_density_wh_kg":  55,
        "cycle_life":            2000,
        "calendar_life_years":   15,
        "temp_derate_per_c":     0.004,
        "round_trip_efficiency": 0.72,
        "max_dod":               0.80,
        "self_discharge_month":  0.10,
        "cost_per_kwh_usd":      350,
        "max_c_rate":            1.0,
        "recommended_charge_c":  0.2,
    },
}


class SolarBatteryCalculator(BaseCalculator[SolarBatteryInput]):
    """
    SOLAR-003: Solar PV Battery Sizing (IEC 62548)
    """

    CALCULATION_CODE = "SOLAR-003"
    CALCULATION_NAME = "Solar PV Battery Sizing"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 62548 / IEC 62619"
    STANDARD_VERSION = "2022"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self):
        return {
            "battery_capacity_kwh":  "kWh",
            "battery_capacity_ah":   "Ah",
            "energy_required_kwh":   "kWh",
            "discharge_current_a":   "A",
            "charge_current_a":      "A",
            "charge_controller_a":   "A",
            "estimated_weight_kg":   "kg",
            "estimated_volume_l":    "L",
            "estimated_cost_usd":    "USD",
            "cable_size_mm2":        "mm²",
            "fuse_rating_a":         "A",
        }

    def validate_inputs(self, inputs: SolarBatteryInput) -> bool:
        if inputs.battery_type not in BATTERY_SPECS:
            raise ValueError(
                f"Unknown battery type '{inputs.battery_type}'. "
                f"Use: {list(BATTERY_SPECS.keys())}"
            )
        specs = BATTERY_SPECS[inputs.battery_type]
        if inputs.depth_of_discharge > specs["max_dod"]:
            raise ValueError(
                f"DoD {inputs.depth_of_discharge} exceeds max for {inputs.battery_type} "
                f"({specs['max_dod']})"
            )
        if inputs.max_c_rate > specs["max_c_rate"]:
            raise ValueError(
                f"Max C-rate {inputs.max_c_rate} exceeds safe limit for "
                f"{inputs.battery_type} ({specs['max_c_rate']})"
            )
        if inputs.target_charge_rate_c > specs["max_c_rate"]:
            raise ValueError(
                f"Target charge rate {inputs.target_charge_rate_c}C exceeds safe limit "
                f"for {inputs.battery_type} ({specs['max_c_rate']}C)"
            )
        return True

    def _calculate(self, inputs: SolarBatteryInput) -> Dict[str, Any]:
        p = inputs
        specs = BATTERY_SPECS[p.battery_type]

        # ── 1. Energy requirement ──────────────────────────────────────────
        net_efficiency = p.inverter_efficiency * p.battery_efficiency * p.system_efficiency
        energy_required_kwh = (p.daily_load_kwh * p.autonomy_days) / max(net_efficiency, 0.01)

        # ── 2. Temperature derating ────────────────────────────────────────
        temp_diff = max(0, 25 - p.temperature_c)
        temp_derate = 1.0 - (temp_diff * specs["temp_derate_per_c"])
        temp_derate = max(temp_derate, 0.30)

        # ── 3. Battery capacity ────────────────────────────────────────────
        battery_capacity_kwh = energy_required_kwh / (
            p.depth_of_discharge * temp_derate
        )
        battery_capacity_wh = battery_capacity_kwh * 1000
        battery_capacity_ah = battery_capacity_wh / p.system_voltage_v

        # ── 4. Battery bank configuration ──────────────────────────────────
        cells_in_series = max(1, round(p.system_voltage_v / p.battery_cell_voltage_v))

        if p.battery_cell_capacity_ah is not None and p.battery_cell_capacity_ah > 0:
            cell_ah = p.battery_cell_capacity_ah
            parallel_strings = max(1, math.ceil(battery_capacity_ah / cell_ah))
            actual_battery_ah = parallel_strings * cell_ah
            actual_battery_kwh = actual_battery_ah * p.system_voltage_v / 1000
        else:
            cell_ah = battery_capacity_ah
            parallel_strings = 1
            actual_battery_kwh = battery_capacity_kwh
            actual_battery_ah = battery_capacity_ah

        total_battery_units = cells_in_series * parallel_strings

        # ── 5. Discharge analysis ──────────────────────────────────────────
        discharge_current_a = (p.daily_load_kwh * 1000) / (
            p.system_voltage_v * p.inverter_efficiency * p.load_power_factor * 24
        )
        actual_c_rate = discharge_current_a / actual_battery_ah
        c_rate_safe = actual_c_rate <= p.max_c_rate

        # ── 6. Charge current & controller sizing ──────────────────────────
        if p.max_charge_current_a is not None and p.max_charge_current_a > 0:
            charge_current_a = p.max_charge_current_a
        else:
            charge_current_a = actual_battery_ah * p.target_charge_rate_c

        charge_rate_c = charge_current_a / actual_battery_ah if actual_battery_ah > 0 else 0

        if p.pv_capacity_kwp is not None and p.peak_sun_hours is not None:
            pv_daily_kwh = p.pv_capacity_kwp * p.peak_sun_hours * p.system_efficiency
            pv_to_load_ratio = pv_daily_kwh / p.daily_load_kwh if p.daily_load_kwh > 0 else None
            pv_charge_current_a = (p.pv_capacity_kwp * 1000) / p.system_voltage_v
            charge_controller_current_a = max(charge_current_a, pv_charge_current_a)
        else:
            pv_to_load_ratio = None
            charge_controller_current_a = charge_current_a * 1.25

        # ── 7. Physical estimates ──────────────────────────────────────────
        weight_kg = (actual_battery_kwh * 1000) / specs["energy_density_wh_kg"]
        volume_l = actual_battery_kwh * 1000 / (specs["energy_density_wh_kg"] * 1.2)

        # ── 8. Lifecycle analysis ──────────────────────────────────────────
        cycles_per_year = 365
        calendar_limited = specs["calendar_life_years"]
        cycle_limited = specs["cycle_life"] / cycles_per_year
        design_life = min(calendar_limited, cycle_limited)
        depth_cycle_penalty = p.depth_of_discharge / specs["max_dod"]
        adjusted_cycle_life = max(100, int(specs["cycle_life"] * depth_cycle_penalty))

        # ── 9. Cost estimate ───────────────────────────────────────────────
        cost = actual_battery_kwh * specs["cost_per_kwh_usd"]

        # ── 10. Protection sizing ──────────────────────────────────────────
        fuse_a = math.ceil(discharge_current_a * 1.25 / 5) * 5
        cable_size_mm2 = round(
            0.0175 * 2 * 10 * discharge_current_a / 3.0, 1
        )

        # ── Warnings ───────────────────────────────────────────────────────
        warnings = []
        if not c_rate_safe:
            warnings.append(
                f"C-rate {actual_c_rate:.3f} exceeds maximum {p.max_c_rate} — "
                f"increase battery capacity or reduce load"
            )
        if temp_derate < 0.80:
            warnings.append(
                f"Temperature {p.temperature_c}°C reduces capacity to "
                f"{temp_derate*100:.0f}% — consider heated enclosure"
            )
        if p.depth_of_discharge > 0.85 and p.battery_type in ("LeadAcid", "AGM", "Gel"):
            warnings.append(
                f"DoD {p.depth_of_discharge} exceeds recommended for "
                f"{p.battery_type} — cycle life will be significantly reduced"
            )
        if pv_to_load_ratio is not None and pv_to_load_ratio < 1.0:
            warnings.append(
                f"PV production covers only {pv_to_load_ratio*100:.0f}% of daily load — "
                f"battery will deplete over time"
            )
        if p.autonomy_days > 7:
            warnings.append(
                f"Autonomy of {p.autonomy_days} days requires very large battery — "
                f"consider backup generator"
            )

        protection_notes = [
            f"DC fuse/breaker: {fuse_a}A, suitable for {cable_size_mm2}mm² cable",
            f"Cable sizing: {cable_size_mm2} mm² minimum between battery and inverter",
            f"Overcurrent protection required on each parallel string",
            f"Battery disconnect switch rated for {discharge_current_a:.0f}A DC",
        ]

        recommendations = [
            f"Battery bank: {actual_battery_ah:.0f}Ah at {p.system_voltage_v}V "
            f"({cells_in_series}S × {parallel_strings}P = {total_battery_units} units)",
            f"Charge controller: ≥{charge_controller_current_a:.0f}A, {p.system_voltage_v}V",
            f"Design life: {design_life:.0f} years / {adjusted_cycle_life} cycles",
            f"Estimated cost: ${cost:,.0f} (battery only)",
            f"Use {fuse_a}A DC fuse with {cable_size_mm2}mm² cable",
        ]

        return {
            "battery_type":                   p.battery_type,
            "system_voltage_v":                p.system_voltage_v,
            "daily_load_kwh":                  p.daily_load_kwh,
            "autonomy_days":                   p.autonomy_days,
            "depth_of_discharge":              p.depth_of_discharge,

            "energy_required_kwh":             round(energy_required_kwh, 2),
            "battery_capacity_kwh":            round(actual_battery_kwh, 2),
            "battery_capacity_ah":             round(actual_battery_ah, 1),

            "temperature_derating_factor":     round(temp_derate, 3),
            "system_efficiency_used":          round(net_efficiency, 3),

            "discharge_current_a":             round(discharge_current_a, 1),
            "actual_c_rate":                   round(actual_c_rate, 3),
            "max_c_rate":                      p.max_c_rate,
            "c_rate_safe":                     c_rate_safe,

            "cells_in_series":                 cells_in_series,
            "parallel_strings":                parallel_strings,
            "total_battery_units":             total_battery_units,

            "charge_current_a":                round(charge_current_a, 1),
            "charge_rate_c":                   round(charge_rate_c, 3),
            "charge_controller_current_a":     round(charge_controller_current_a, 0),

            "pv_to_load_ratio":                round(pv_to_load_ratio, 3) if pv_to_load_ratio is not None else None,

            "estimated_weight_kg":             round(weight_kg, 1),
            "estimated_volume_l":              round(volume_l, 1),

            "cycle_life":                      adjusted_cycle_life,
            "calendar_life_years":             specs["calendar_life_years"],
            "design_life_years":               round(design_life, 1),

            "estimated_cost_usd":              round(cost, 0),

            "recommended_fuse_rating_a":       fuse_a,
            "recommended_dc_cable_size_mm2":   cable_size_mm2,

            "protection_notes":                protection_notes,
            "recommendation_notes":            recommendations,
            "warning_notes":                   warnings,

            "standards": {
                "pv_battery_sizing": "IEC 62548:2016",
                "battery_safety":    "IEC 62619:2022",
                "installation":      "IEC 62109-1",
                "lead_acid":         "IEEE 1013",
            },
        }
