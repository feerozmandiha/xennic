# src/calculators/renewable/battery_storage.py
"""
BAT-001: Battery Energy Storage System (BESS) Sizing

Standards:
  IEC 62619:2022 — Safety Requirements for Secondary Lithium Cells
  IEC 62109-1    — Power Converters for PV Systems
  IEEE 1115      — Lead-Acid Battery Sizing
  IEEE 1013      — Lead-Acid Battery for PV Applications

Battery Types:
  LiFePO4  : 80-90% DoD, 2000-5000 cycles, best safety
  LiNMC    : 80% DoD, 500-2000 cycles, high energy density
  LeadAcid : 50% DoD, 300-500 cycles, lowest cost
  NaS      : 80% DoD, 2500+ cycles, high temperature
"""

import math
from typing import Dict, Any

from src.core.base_calculator import BaseCalculator
from .schemas import BatteryStorageInput


# Battery technology parameters
BATTERY_SPECS = {
    "LiFePO4": {
        "energy_density_wh_kg": 150,    # Wh/kg
        "voltage_cell":          3.2,   # V nominal
        "cells_series_48v":      15,    # cells for 48V
        "cycle_life":            3000,  # cycles at 80% DoD
        "calendar_life_years":   10,
        "temp_derate_factor":    0.97,  # per 1°C below 25°C
        "round_trip_efficiency": 0.95,
        "max_dod":               0.90,
        "self_discharge_month":  0.02,  # 2% per month
        "cost_per_kwh_usd":      200,
    },
    "LiNMC": {
        "energy_density_wh_kg": 200,
        "voltage_cell":          3.6,
        "cells_series_48v":      14,
        "cycle_life":            1000,
        "calendar_life_years":   8,
        "temp_derate_factor":    0.98,
        "round_trip_efficiency": 0.94,
        "max_dod":               0.80,
        "self_discharge_month":  0.03,
        "cost_per_kwh_usd":      250,
    },
    "LeadAcid": {
        "energy_density_wh_kg": 40,
        "voltage_cell":          2.0,
        "cells_series_48v":      24,
        "cycle_life":            400,
        "calendar_life_years":   5,
        "temp_derate_factor":    0.95,
        "round_trip_efficiency": 0.85,
        "max_dod":               0.50,
        "self_discharge_month":  0.05,
        "cost_per_kwh_usd":      80,
    },
    "NaS": {
        "energy_density_wh_kg": 120,
        "voltage_cell":          2.08,
        "cells_series_48v":      23,
        "cycle_life":            2500,
        "calendar_life_years":   15,
        "temp_derate_factor":    1.00,  # operates at 300-350°C
        "round_trip_efficiency": 0.89,
        "max_dod":               0.80,
        "self_discharge_month":  0.00,
        "cost_per_kwh_usd":      400,
    },
}


class BatteryStorageCalculator(BaseCalculator[BatteryStorageInput]):
    """
    BAT-001: Battery Energy Storage Sizing
    """

    CALCULATION_CODE = "BAT-001"
    CALCULATION_NAME = "Battery Energy Storage Sizing"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 62619 / IEEE 1115"
    STANDARD_VERSION = "2022"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self):
        return {
            "battery_capacity_kwh":  "kWh",
            "battery_capacity_ah":   "Ah",
            "discharge_current_a":   "A",
            "estimated_weight_kg":   "kg",
            "estimated_cost_usd":    "USD",
            "design_life_years":     "years",
        }

    def validate_inputs(self, inputs: BatteryStorageInput) -> bool:
        if inputs.battery_type not in BATTERY_SPECS:
            raise ValueError(f"Unknown battery type. Use: {list(BATTERY_SPECS.keys())}")
        if inputs.depth_of_discharge > BATTERY_SPECS[inputs.battery_type]["max_dod"]:
            raise ValueError(
                f"DoD {inputs.depth_of_discharge} exceeds max for {inputs.battery_type} "
                f"({BATTERY_SPECS[inputs.battery_type]['max_dod']})"
            )
        return True

    def _calculate(self, inputs: BatteryStorageInput) -> Dict[str, Any]:
        p     = inputs
        specs = BATTERY_SPECS[p.battery_type]

        # ── 1. Energy requirement ────────────────────────────────────────────
        # E_load = P × t / (PF × η_inv)
        energy_load_kwh = (p.load_kw * p.backup_hours) / (
            p.load_power_factor * p.inverter_efficiency
        )

        # ── 2. Temperature derating ──────────────────────────────────────────
        # Capacity reduces below 25°C
        temp_diff = max(0, 25 - p.temperature_c)
        temp_derate = 1 - (temp_diff * (1 - specs["temp_derate_factor"]))

        # ── 3. Required battery capacity ─────────────────────────────────────
        # C_battery = E_load / (DoD × η_battery × temp_derate)
        battery_capacity_kwh = energy_load_kwh / (
            p.depth_of_discharge * p.battery_efficiency * temp_derate
        )
        battery_capacity_wh = battery_capacity_kwh * 1000

        # ── 4. Capacity in Ah ────────────────────────────────────────────────
        battery_capacity_ah = battery_capacity_wh / p.system_voltage

        # ── 5. Discharge current ─────────────────────────────────────────────
        # I_discharge = P_load / (V_system × η_inv)
        discharge_current_a = (p.load_kw * 1000) / (
            p.system_voltage * p.inverter_efficiency * p.load_power_factor
        )

        # ── 6. C-rate verification ───────────────────────────────────────────
        # Actual C-rate = I_discharge / C_battery(Ah)
        actual_c_rate = discharge_current_a / battery_capacity_ah

        # ── 7. Weight and volume estimate ────────────────────────────────────
        battery_weight_kg = (battery_capacity_wh / specs["energy_density_wh_kg"])
        # Typical volumetric energy density ≈ 1.5× gravimetric (Wh/L)
        battery_volume_l  = battery_capacity_wh / (specs["energy_density_wh_kg"] * 1.2)

        # ── 8. Lifecycle analysis ────────────────────────────────────────────
        # Cycles per year (conservative)
        cycles_per_year = 365  # daily cycling
        calendar_limited = specs["calendar_life_years"]
        cycle_limited    = specs["cycle_life"] / cycles_per_year
        design_life_years = min(calendar_limited, cycle_limited)

        # Cost estimate
        estimated_cost_usd = battery_capacity_kwh * specs["cost_per_kwh_usd"]
        cost_per_kwh_cycle = (
            specs["cost_per_kwh_usd"] /
            (specs["cycle_life"] * p.depth_of_discharge)
        )

        # ── 9. Protection sizing ─────────────────────────────────────────────
        # Battery fuse/breaker: 1.25 × I_discharge (NEC 690.8)
        fuse_rating_a = math.ceil(discharge_current_a * 1.25 / 10) * 10

        # ── 10. Warnings ─────────────────────────────────────────────────────
        warnings = []
        if actual_c_rate > p.c_rate * 2:
            warnings.append(
                f"⚠️ نرخ تخلیه {actual_c_rate:.2f}C بیشتر از C-rate توصیه‌شده — ظرفیت را افزایش دهید"
            )
        if temp_derate < 0.85:
            warnings.append(
                f"⚠️ دمای {p.temperature_c}°C باعث کاهش ظرفیت {(1-temp_derate)*100:.0f}% می‌شود"
            )
        if p.depth_of_discharge > 0.85 and p.battery_type == "LeadAcid":
            warnings.append("⚠️ DoD بیش از 50% برای باتری سرب-اسید عمر را کوتاه می‌کند")

        return {
            # Load requirements
            "load_kw":               p.load_kw,
            "backup_hours":          p.backup_hours,
            "energy_required_kwh":   round(energy_load_kwh, 2),

            # Battery sizing
            "battery_type":          p.battery_type,
            "battery_capacity_kwh":  round(battery_capacity_kwh, 2),
            "battery_capacity_ah":   round(battery_capacity_ah, 1),
            "battery_capacity_wh":   round(battery_capacity_wh, 0),
            "system_voltage_v":      p.system_voltage,
            "depth_of_discharge":    p.depth_of_discharge,

            # Derating
            "temperature_c":         p.temperature_c,
            "temp_derate_factor":    round(temp_derate, 3),

            # Current
            "discharge_current_a":   round(discharge_current_a, 1),
            "actual_c_rate":         round(actual_c_rate, 3),
            "recommended_c_rate":    p.c_rate,
            "fuse_rating_a":         fuse_rating_a,

            # Physical
            "estimated_weight_kg":   round(battery_weight_kg, 1),
            "estimated_volume_l":    round(battery_volume_l, 1),

            # Efficiency
            "inverter_efficiency":   p.inverter_efficiency,
            "battery_efficiency":    p.battery_efficiency,
            "round_trip_efficiency": round(p.inverter_efficiency * p.battery_efficiency, 3),

            # Lifecycle
            "cycle_life":            specs["cycle_life"],
            "calendar_life_years":   specs["calendar_life_years"],
            "design_life_years":     round(design_life_years, 1),
            "cycles_per_year":       cycles_per_year,

            # Economics
            "estimated_cost_usd":        round(estimated_cost_usd, 0),
            "cost_per_kwh_usd":          specs["cost_per_kwh_usd"],
            "levelized_cost_per_kwh_usd": round(cost_per_kwh_cycle, 4),

            # Battery specs
            "specs": {
                "energy_density_wh_kg":  specs["energy_density_wh_kg"],
                "round_trip_efficiency": specs["round_trip_efficiency"],
                "max_dod":               specs["max_dod"],
                "self_discharge_month":  specs["self_discharge_month"],
            },

            "warnings": warnings,
            "recommendations": [
                f"ظرفیت: {battery_capacity_kwh:.1f} kWh در {p.system_voltage}V ({battery_capacity_ah:.0f} Ah)",
                f"وزن تقریبی: {battery_weight_kg:.0f} kg | حجم: {battery_volume_l:.0f} L",
                f"عمر طراحی: {design_life_years:.0f} سال | {specs['cycle_life']} سیکل",
                f"هزینه تقریبی: ${estimated_cost_usd:,.0f}",
                f"کلید/فیوز حفاظتی: {fuse_rating_a}A",
            ],

            "standards": {
                "battery_safety":  "IEC 62619:2022",
                "installation":    "IEC 62109-1",
                "lead_acid":       "IEEE 1115",
            },
        }
