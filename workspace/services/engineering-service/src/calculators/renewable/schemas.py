# src/calculators/renewable/schemas.py
"""
Renewable Energy Calculator Schemas

Standards:
  IEC 61215   — PV Module Design Qualification
  IEC 62548   — PV Array Design Requirements
  IEEE 1547   — Distributed Energy Resources Interconnection
  IEC 62619   — Battery Safety Requirements
"""

from typing import Optional
from pydantic import Field
from src.core.base_calculator import CalculationInput


# ─── PV-001: Solar PV System Sizing ──────────────────────────────────────────

class SolarPVInput(CalculationInput):
    """
    PV-001: Solar PV System Sizing
    References: IEC 62548, IEC 61215, IEEE 1547
    """
    # Load
    daily_load_kwh: float = Field(
        ..., gt=0,
        description="Daily energy consumption (kWh/day)",
        example=30.0,
    )
    # Site
    peak_sun_hours: float = Field(
        default=5.0, gt=0, le=12,
        description="Peak Sun Hours (PSH) at site (hours/day). Iran avg: 4.5–6.5",
        example=5.5,
    )
    # Panel
    panel_watt_peak: float = Field(
        default=400.0, gt=0,
        description="Rated power of one PV panel (Wp)",
        example=400.0,
    )
    panel_voc: float = Field(
        default=45.0, gt=0,
        description="Open-circuit voltage of panel at STC (V)",
        example=45.0,
    )
    panel_vmp: float = Field(
        default=37.5, gt=0,
        description="Maximum power point voltage at STC (V)",
        example=37.5,
    )
    panel_isc: float = Field(
        default=11.0, gt=0,
        description="Short-circuit current at STC (A)",
        example=11.0,
    )
    panel_imp: float = Field(
        default=10.67, gt=0,
        description="Maximum power point current at STC (A)",
        example=10.67,
    )
    panel_temp_coeff_voc: float = Field(
        default=-0.27, lt=0,
        description="Temperature coefficient of Voc (%/°C). Typically -0.25 to -0.30",
        example=-0.27,
    )
    # Inverter
    inverter_voltage_dc_min: float = Field(
        default=200.0, gt=0,
        description="Inverter minimum DC input voltage (V)",
        example=200.0,
    )
    inverter_voltage_dc_max: float = Field(
        default=800.0, gt=0,
        description="Inverter maximum DC input voltage (V)",
        example=800.0,
    )
    inverter_voltage_mppt_min: float = Field(
        default=250.0, gt=0,
        description="Inverter MPPT minimum voltage (V)",
        example=250.0,
    )
    inverter_voltage_mppt_max: float = Field(
        default=650.0, gt=0,
        description="Inverter MPPT maximum voltage (V)",
        example=650.0,
    )
    # Site temperatures
    t_min: float = Field(
        default=-10.0,
        description="Minimum ambient temperature (°C) — for Voc_max",
        example=-10.0,
    )
    t_max: float = Field(
        default=70.0,
        description="Maximum cell temperature (°C) — for Vmp_min. Cell = ambient + 25°C typical",
        example=70.0,
    )
    # System
    system_efficiency: float = Field(
        default=0.80, gt=0, le=1,
        description="Overall system efficiency (0–1). Includes inverter, wiring, soiling losses",
        example=0.80,
    )
    autonomy_days: Optional[float] = Field(
        default=None, gt=0,
        description="Days of battery autonomy (for off-grid). None = grid-tied",
        example=2.0,
    )
    depth_of_discharge: float = Field(
        default=0.8, gt=0, le=1,
        description="Battery depth of discharge (DoD)",
        example=0.8,
    )
    battery_voltage: float = Field(
        default=48.0, gt=0,
        description="Battery bank voltage (V)",
        example=48.0,
    )


# ─── MOT-001: Motor Starting Analysis ────────────────────────────────────────

class MotorStartingInput(CalculationInput):
    """
    MOT-001: Motor Starting Current and Voltage Drop Analysis
    References: IEC 60034, IEC 60909, NEMA MG-1
    """
    motor_kw: float = Field(
        ..., gt=0,
        description="Motor rated power (kW)",
        example=45.0,
    )
    motor_voltage_v: float = Field(
        default=400.0, gt=0,
        description="Motor rated voltage (V)",
        example=400.0,
    )
    motor_efficiency: float = Field(
        default=0.92, gt=0, le=1,
        description="Motor efficiency at full load",
        example=0.92,
    )
    motor_power_factor: float = Field(
        default=0.85, gt=0, le=1,
        description="Motor power factor at full load",
        example=0.85,
    )
    starting_method: str = Field(
        default="DOL",
        description="Starting method: DOL | StarDelta | Autotransformer | VFD | SoftStarter",
        example="StarDelta",
    )
    starting_current_factor: float = Field(
        default=6.0, gt=0,
        description="Starting current as multiple of FLC (Ia/In). DOL: 5-8, StarDelta: 1.5-2.5",
        example=6.0,
    )
    transformer_kva: float = Field(
        ..., gt=0,
        description="Supply transformer rating (kVA)",
        example=250.0,
    )
    transformer_impedance_pct: float = Field(
        default=5.0, gt=0,
        description="Transformer short-circuit impedance (%)",
        example=5.0,
    )
    cable_resistance_mohm_m: float = Field(
        default=0.5, gt=0,
        description="Cable resistance (mΩ/m per phase)",
        example=0.5,
    )
    cable_length_m: float = Field(
        default=50.0, gt=0,
        description="Cable length from MCC to motor (m)",
        example=50.0,
    )
    allowable_voltage_dip_pct: float = Field(
        default=15.0, gt=0,
        description="Maximum allowable voltage dip during starting (%)",
        example=15.0,
    )


# ─── BAT-001: Battery Storage Sizing ─────────────────────────────────────────

class BatteryStorageInput(CalculationInput):
    """
    BAT-001: Battery Energy Storage Sizing
    References: IEC 62619, IEC 62109, IEEE 1547
    """
    load_kw: float = Field(
        ..., gt=0,
        description="Load power to be supported (kW)",
        example=10.0,
    )
    backup_hours: float = Field(
        ..., gt=0,
        description="Required backup time (hours)",
        example=4.0,
    )
    battery_type: str = Field(
        default="LiFePO4",
        description="Battery chemistry: LiFePO4 | LiNMC | LeadAcid | NaS",
        example="LiFePO4",
    )
    system_voltage: float = Field(
        default=48.0, gt=0,
        description="Battery system voltage (V)",
        example=48.0,
    )
    depth_of_discharge: float = Field(
        default=0.8, gt=0, le=1,
        description="Usable depth of discharge (DoD)",
        example=0.8,
    )
    inverter_efficiency: float = Field(
        default=0.95, gt=0, le=1,
        description="Inverter/charger efficiency",
        example=0.95,
    )
    battery_efficiency: float = Field(
        default=0.95, gt=0, le=1,
        description="Round-trip battery efficiency",
        example=0.95,
    )
    temperature_c: float = Field(
        default=25.0,
        description="Operating temperature (°C). Capacity derate below 25°C",
        example=25.0,
    )
    c_rate: float = Field(
        default=0.2, gt=0,
        description="Discharge C-rate. 0.2C = 5h discharge, 0.5C = 2h discharge",
        example=0.2,
    )
    load_power_factor: float = Field(
        default=0.9, gt=0, le=1,
        description="Load power factor",
        example=0.9,
    )
