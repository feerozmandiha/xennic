# src/calculators/renewable/solar_pv.py
"""
PV-001: Solar PV System Sizing Calculator

Standards:
  IEC 62548:2016 — PV Array Design Requirements
  IEC 61215      — PV Module Design Qualification
  IEEE 1547-2018 — Distributed Energy Resources Interconnection

Calculations:
  1. System capacity (kWp)
  2. Number of panels
  3. String configuration (series/parallel)
  4. String voltage check (Voc_max, Vmp_min vs inverter limits)
  5. DC cable sizing
  6. Battery sizing (for off-grid)
  7. Annual energy production
"""

import math
from typing import Dict, Any

from src.core.base_calculator import BaseCalculator
from .schemas import SolarPVInput


class SolarPVCalculator(BaseCalculator[SolarPVInput]):
    """
    PV-001: Solar PV System Sizing
    """

    CALCULATION_CODE = "PV-001"
    CALCULATION_NAME = "Solar PV System Sizing"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 62548"
    STANDARD_VERSION = "2016"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self):
        return {
            "required_capacity_kwp": "kWp",
            "actual_capacity_kwp":   "kWp",
            "ac_output_kw":          "kW",
            "panels_final":          "عدد",
            "daily_production_kwh":  "kWh/day",
            "annual_production_kwh": "kWh/year",
            "string_voc_max_v":      "V",
            "string_vmp_stc_v":      "V",
            "coverage_ratio_pct":    "%",
        }

    def validate_inputs(self, inputs: SolarPVInput) -> bool:
        if inputs.peak_sun_hours <= 0:
            raise ValueError("Peak sun hours must be positive")
        if inputs.system_efficiency <= 0 or inputs.system_efficiency > 1:
            raise ValueError("System efficiency must be between 0 and 1")
        return True

    def _calculate(self, inputs: SolarPVInput) -> Dict[str, Any]:
        p = inputs

        # ── 1. Required PV capacity ──────────────────────────────────────────
        # E = P_peak × PSH × η_system
        # P_peak = E_daily / (PSH × η_system)
        pv_capacity_kwp = p.daily_load_kwh / (p.peak_sun_hours * p.system_efficiency)
        pv_capacity_wp  = pv_capacity_kwp * 1000

        # ── 2. Number of panels ──────────────────────────────────────────────
        n_panels = math.ceil(pv_capacity_wp / p.panel_watt_peak)
        actual_capacity_kwp = (n_panels * p.panel_watt_peak) / 1000
        actual_capacity_wp  = n_panels * p.panel_watt_peak

        # ── 3. String configuration ──────────────────────────────────────────
        # Voc_max: coldest temperature → highest voltage
        # Voc(T) = Voc_STC × (1 + α_Voc/100 × (T - 25))
        voc_max = p.panel_voc * (1 + (p.panel_temp_coeff_voc / 100) * (p.t_min - 25))

        # Vmp_min: hottest temperature → lowest operating voltage
        vmp_min = p.panel_vmp * (1 + (p.panel_temp_coeff_voc / 100) * (p.t_max - 25))

        # Max panels in series (limited by inverter max DC voltage)
        n_series_max_voc = math.floor(p.inverter_voltage_dc_max / voc_max)
        n_series_max_mppt = math.floor(p.inverter_voltage_mppt_max / vmp_min)
        n_series_max = min(n_series_max_voc, n_series_max_mppt)

        # Min panels in series (limited by MPPT minimum)
        n_series_min = math.ceil(p.inverter_voltage_mppt_min / vmp_min)

        # Recommended series count (aim for middle of MPPT range)
        target_vmp = (p.inverter_voltage_mppt_min + p.inverter_voltage_mppt_max) / 2
        n_series_rec = max(n_series_min, min(n_series_max, round(target_vmp / p.panel_vmp)))

        # Number of parallel strings
        n_parallel = math.ceil(n_panels / n_series_rec)
        n_panels_final = n_series_rec * n_parallel

        # ── 4. String voltage verification ──────────────────────────────────
        string_voc_max = n_series_rec * voc_max
        string_vmp_min = n_series_rec * vmp_min
        string_vmp_stc = n_series_rec * p.panel_vmp
        string_isc     = n_parallel * p.panel_isc
        string_imp     = n_parallel * p.panel_imp

        voc_ok  = string_voc_max <= p.inverter_voltage_dc_max
        vmp_ok  = (string_vmp_min >= p.inverter_voltage_mppt_min and
                   string_vmp_min <= p.inverter_voltage_mppt_max)

        # ── 5. DC array power ────────────────────────────────────────────────
        dc_power_kwp = (n_panels_final * p.panel_watt_peak) / 1000
        ac_power_kw  = dc_power_kwp * p.system_efficiency

        # ── 6. Annual energy production ──────────────────────────────────────
        annual_energy_kwh = dc_power_kwp * p.peak_sun_hours * 365 * p.system_efficiency
        daily_energy_kwh  = dc_power_kwp * p.peak_sun_hours * p.system_efficiency

        # ── 7. Battery sizing (off-grid only) ────────────────────────────────
        battery_results: Dict[str, Any] = {}
        if p.autonomy_days is not None:
            # Energy needed from battery
            energy_needed_kwh = p.daily_load_kwh * p.autonomy_days
            # Account for DoD and battery efficiency
            battery_capacity_kwh = energy_needed_kwh / (p.depth_of_discharge * 0.95)
            # Convert to Ah at system voltage
            battery_capacity_ah = (battery_capacity_kwh * 1000) / p.battery_voltage

            battery_results = {
                "autonomy_days":       p.autonomy_days,
                "energy_needed_kwh":   round(energy_needed_kwh, 2),
                "battery_capacity_kwh": round(battery_capacity_kwh, 2),
                "battery_capacity_ah": round(battery_capacity_ah, 1),
                "battery_voltage_v":   p.battery_voltage,
            }

        # ── 8. Performance metrics ───────────────────────────────────────────
        performance_ratio = p.system_efficiency  # simplified
        coverage_ratio    = daily_energy_kwh / p.daily_load_kwh

        # Warnings
        warnings = []
        if not voc_ok:
            warnings.append(f"⚠️ String Voc_max ({string_voc_max:.1f}V) exceeds inverter max DC voltage ({p.inverter_voltage_dc_max}V)")
        if not vmp_ok:
            warnings.append(f"⚠️ String Vmp_min ({string_vmp_min:.1f}V) outside MPPT range ({p.inverter_voltage_mppt_min}–{p.inverter_voltage_mppt_max}V)")
        if coverage_ratio < 1.0:
            warnings.append(f"⚠️ System covers only {coverage_ratio*100:.1f}% of daily load — increase capacity")

        return {
            # System sizing
            "required_capacity_kwp":  round(pv_capacity_kwp, 2),
            "actual_capacity_kwp":    round(dc_power_kwp, 2),
            "ac_output_kw":           round(ac_power_kw, 2),

            # Panel count
            "panels_required":        math.ceil(pv_capacity_wp / p.panel_watt_peak),
            "panels_final":           n_panels_final,
            "panel_watt_peak":        p.panel_watt_peak,

            # String configuration
            "panels_in_series":       n_series_rec,
            "strings_in_parallel":    n_parallel,
            "series_min":             n_series_min,
            "series_max":             n_series_max,

            # Voltage verification
            "string_voc_max_v":       round(string_voc_max, 1),
            "string_vmp_min_v":       round(string_vmp_min, 1),
            "string_vmp_stc_v":       round(string_vmp_stc, 1),
            "string_isc_a":           round(string_isc, 2),
            "string_imp_a":           round(string_imp, 2),
            "voc_within_limit":       voc_ok,
            "vmp_within_mppt":        vmp_ok,
            "string_design_valid":    voc_ok and vmp_ok,

            # Energy production
            "daily_production_kwh":   round(daily_energy_kwh, 1),
            "annual_production_kwh":  round(annual_energy_kwh, 0),
            "coverage_ratio_pct":     round(coverage_ratio * 100, 1),
            "performance_ratio":      round(performance_ratio, 3),
            "peak_sun_hours":         p.peak_sun_hours,
            "system_efficiency_pct":  round(p.system_efficiency * 100, 1),

            # Battery (if off-grid)
            "battery": battery_results if battery_results else None,

            # Standards
            "standards": {
                "array_design":    "IEC 62548:2016",
                "module_testing":  "IEC 61215",
                "interconnection": "IEEE 1547-2018",
            },

            "warnings":      warnings,
            "recommendations": [
                f"نصب {n_panels_final} پنل {p.panel_watt_peak}Wp در {n_parallel} رشته × {n_series_rec} تایی",
                f"ولتاژ string در STC: {string_vmp_stc:.0f}V (Voc_max: {string_voc_max:.0f}V)",
                f"تولید روزانه: {daily_energy_kwh:.1f} kWh | سالانه: {annual_energy_kwh:.0f} kWh",
                "از کابل DC با عایق ≥1kV و مقاومت UV استفاده کنید",
                "فیوز رشته‌ای برای جریان بیش از {:.0f}A ضروری است".format(string_isc),
            ],
        }
