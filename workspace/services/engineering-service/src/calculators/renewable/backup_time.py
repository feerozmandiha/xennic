"""
BAT-BU-001: Battery Backup Time Calculator (IEC 62619 / IEEE 1013)

Standards:
  IEC 62619:2022 — Safety Requirements for Secondary Lithium Cells
  IEEE 1013      — Lead-Acid Battery for PV Applications
  IEC 62109-1    — Power Converters for PV Systems

Calculations:
  1. Available backup time (hours) based on battery capacity and load
  2. Usable capacity considering DoD, temperature, and efficiency
  3. Discharge analysis (current, C-rate, depth tracking)
  4. Time at various load levels
  5. State of charge tracking during discharge
"""

import math
from typing import Dict, Any

from src.core.base_calculator import BaseCalculator
from .schemas import BackupTimeInput


class BackupTimeCalculator(BaseCalculator[BackupTimeInput]):
    """
    BAT-BU-001: Battery Backup Time Calculator
    """

    CALCULATION_CODE = "BAT-BU-001"
    CALCULATION_NAME = "Battery Backup Time"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 62619 / IEEE 1013"
    STANDARD_VERSION = "2022"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self):
        return {
            "backup_time_hours":          "h",
            "backup_time_minutes":        "min",
            "usable_capacity_kwh":        "kWh",
            "usable_capacity_ah":         "Ah",
            "total_energy_available_kwh": "kWh",
            "discharge_current_a":        "A",
            "actual_c_rate":              "C",
            "load_power_kw":              "kW",
            "battery_capacity_kwh":       "kWh",
            "daily_cycles_possible":      "cycles/day",
        }

    def validate_inputs(self, inputs: BackupTimeInput) -> bool:
        if inputs.battery_capacity_ah <= 0:
            raise ValueError("Battery capacity must be positive")
        if inputs.load_power_kw <= 0:
            raise ValueError("Load power must be positive")
        if inputs.system_voltage_v <= 0:
            raise ValueError("System voltage must be positive")
        if inputs.depth_of_discharge <= 0 or inputs.depth_of_discharge > 1:
            raise ValueError("DoD must be between 0 and 1")
        if inputs.inverter_efficiency <= 0 or inputs.inverter_efficiency > 1:
            raise ValueError("Inverter efficiency must be between 0 and 1")
        return True

    def _calculate(self, inputs: BackupTimeInput) -> Dict[str, Any]:
        p = inputs

        # ── 1. Total battery energy ───────────────────────────────────────
        battery_capacity_kwh = (p.battery_capacity_ah * p.system_voltage_v) / 1000

        # ── 2. Temperature derating ────────────────────────────────────────
        temp_diff = max(0, 25 - p.temperature_c)
        temp_derate = 1.0 - (temp_diff * 0.006)
        temp_derate = max(temp_derate, 0.30)

        # ── 3. Usable capacity ────────────────────────────────────────────
        usable_capacity_kwh = (
            battery_capacity_kwh *
            p.depth_of_discharge *
            temp_derate *
            p.inverter_efficiency *
            p.battery_efficiency
        )
        usable_capacity_ah = (usable_capacity_kwh * 1000) / p.system_voltage_v

        # ── 4. Backup time ────────────────────────────────────────────────
        individual_loads = p.individual_loads_kw or []
        if individual_loads:
            total_load = sum(individual_loads)
            backup_hours_float = usable_capacity_kwh / total_load
        else:
            backup_hours_float = usable_capacity_kwh / p.load_power_kw

        hours = int(backup_hours_float)
        minutes = int((backup_hours_float - hours) * 60)

        # ── 5. Discharge analysis ──────────────────────────────────────────
        discharge_current_a = ((p.load_power_kw * 1000) / p.system_voltage_v)
        if p.individual_loads_kw:
            total = sum(p.individual_loads_kw)
            if total > 0:
                discharge_current_a = (total * 1000) / p.system_voltage_v

        actual_c_rate = discharge_current_a / p.battery_capacity_ah

        # ── 6. Time at different load levels ──────────────────────────────
        load_analysis = []
        if individual_loads:
            for i, load in enumerate(individual_loads):
                if load <= 0:
                    continue
                t_hours = usable_capacity_kwh / load
                load_analysis.append({
                    "load_kw": load,
                    "backup_hours": round(t_hours, 2),
                    "label": f"بار {i+1}",
                })

        # ── 7. Daily cycling ──────────────────────────────────────────────
        daily_cycles = 24.0 / backup_hours_float if backup_hours_float > 0 else 0

        # ── 8. State of charge timeline ────────────────────────────────────
        soc_timeline = []
        if backup_hours_float > 0 and backup_hours_float <= 72:
            step = max(1, int(backup_hours_float / 10))
            for h in range(0, int(backup_hours_float) + 1, step):
                soc = 100 * (1 - h / backup_hours_float)
                soc_timeline.append({"hour": h, "soc_pct": round(soc, 1)})

        # ── 9. Warnings ────────────────────────────────────────────────────
        warnings = []
        if actual_c_rate > 1.0:
            warnings.append(
                f"High discharge rate ({actual_c_rate:.2f}C) — "
                f"battery may deliver less than rated capacity"
            )
        if backup_hours_float < 0.5:
            warnings.append("Backup time less than 30 minutes — increase battery capacity")
        if backup_hours_float > 48:
            warnings.append("Backup time exceeds 48 hours — verify battery self-discharge is acceptable")
        if temp_derate < 0.80:
            warnings.append(
                f"Temperature {p.temperature_c}°C reduces usable capacity by "
                f"{(1-temp_derate)*100:.0f}%"
            )

        recommendations = [
            f"Backup time: {hours}h {minutes:02d}min at {p.load_power_kw:.1f}kW load",
            f"Usable capacity: {usable_capacity_kwh:.2f} kWh ({usable_capacity_ah:.0f} Ah at {p.system_voltage_v}V)",
            f"Discharge current: {discharge_current_a:.1f}A ({actual_c_rate:.3f}C)",
            f"Efficiency chain: inverter {p.inverter_efficiency*100:.0f}% × battery {p.battery_efficiency*100:.0f}% × temp {temp_derate*100:.0f}%",
        ]

        return {
            "battery_capacity_kwh":       round(battery_capacity_kwh, 2),
            "battery_capacity_ah":        p.battery_capacity_ah,
            "system_voltage_v":           p.system_voltage_v,
            "load_power_kw":              p.load_power_kw,
            "depth_of_discharge":         p.depth_of_discharge,
            "inverter_efficiency":        p.inverter_efficiency,
            "battery_efficiency":         p.battery_efficiency,
            "temperature_c":              p.temperature_c,
            "temperature_derating":       round(temp_derate, 3),
            "usable_capacity_kwh":        round(usable_capacity_kwh, 2),
            "usable_capacity_ah":         round(usable_capacity_ah, 1),
            "total_energy_available_kwh": round(battery_capacity_kwh, 2),
            "backup_time_hours":          round(backup_hours_float, 2),
            "backup_time_hours_int":      hours,
            "backup_time_minutes":        minutes,
            "discharge_current_a":        round(discharge_current_a, 1),
            "actual_c_rate":              round(actual_c_rate, 3),
            "daily_cycles_possible":      round(daily_cycles, 1),
            "load_analysis":              load_analysis if load_analysis else None,
            "soc_timeline":               soc_timeline if soc_timeline else None,
            "warning_notes":              warnings,
            "recommendation_notes":       recommendations,
            "standards": {
                "battery_safety":  "IEC 62619:2022",
                "lead_acid_pv":    "IEEE 1013",
                "installation":    "IEC 62109-1",
            },
        }
