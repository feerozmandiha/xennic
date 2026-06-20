# src/calculators/renewable/schemas.py
"""
Renewable Energy Calculator Schemas

Standards:
  IEC 61215   — PV Module Design Qualification
  IEC 62548   — PV Array Design Requirements
  IEEE 1547   — Distributed Energy Resources Interconnection
  IEC 62619   — Battery Safety Requirements
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field
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


# ─── SOLAR-002: Inverter Sizing & String Design (IEC 62548) ───────────────────

INVERTER_TYPES = Literal['string', 'central', 'micro']


class InverterSizingInput(CalculationInput):
    pv_capacity_kwp: float = Field(..., gt=0, le=500000, description="Total PV array rated power (kWp)")
    module_watt_peak: float = Field(..., gt=0, le=1000, description="Module rated power (Wp)")
    module_voc_v: float = Field(..., gt=0, le=100, description="Module open-circuit voltage at STC (V)")
    module_vmp_v: float = Field(..., gt=0, le=80, description="Module maximum power voltage at STC (V)")
    module_isc_a: float = Field(..., gt=0, le=30, description="Module short-circuit current at STC (A)")
    module_imp_a: float = Field(..., gt=0, le=30, description="Module maximum power current at STC (A)")
    module_temp_coeff_voc_pct: float = Field(default=-0.27, lt=0, ge=-0.50, description="Temperature coefficient of Voc (%/°C)")
    t_min_c: float = Field(default=-10.0, ge=-50, le=30, description="Minimum ambient temperature (°C)")
    t_max_c: float = Field(default=70.0, ge=30, le=100, description="Maximum cell temperature (°C)")
    inverter_ac_power_kw: float = Field(default=100.0, gt=0, le=5000, description="Candidate inverter AC rated power (kW)")
    inverter_max_dc_voltage_v: float = Field(default=1000.0, gt=0, le=2000, description="Inverter max DC input voltage (V)")
    inverter_mppt_min_v: float = Field(default=200.0, gt=0, description="Inverter MPPT minimum voltage (V)")
    inverter_mppt_max_v: float = Field(default=800.0, gt=0, description="Inverter MPPT maximum voltage (V)")
    inverter_max_input_current_a: float = Field(default=200.0, gt=0, le=5000, description="Inverter max DC input current (A)")
    inverter_type: INVERTER_TYPES = Field(default='string', description="Inverter topology")
    dc_ac_ratio_target: float = Field(default=1.25, gt=1.0, le=2.0, description="Target DC/AC ratio")
    ac_voltage_v: float = Field(default=400.0, gt=0, le=69000, description="Inverter AC output voltage (V)")
    max_ambient_temp_c: float = Field(default=40.0, ge=-10, le=60, description="Maximum ambient temperature for inverter siting (°C)")
    altitude_m: float = Field(default=0.0, ge=0, le=5000, description="Installation altitude (m)")


class InverterSizingOutput(BaseModel):
    modules_per_string: int = Field(..., description="Recommended number of modules per string")
    max_modules_per_string: int = Field(..., description="Maximum modules per string (Voc limit)")
    min_modules_per_string: int = Field(..., description="Minimum modules per string (Vmp limit)")
    number_of_strings: int = Field(..., description="Total number of strings")
    total_modules: int = Field(..., description="Total number of modules")
    actual_pv_power_kwp: float = Field(..., description="Actual total PV capacity (kWp)")
    number_of_inverters: int = Field(..., description="Number of inverters required")
    inverter_dc_power_kw: float = Field(..., description="DC power per inverter (kW)")
    inverter_ac_power_total_kw: float = Field(..., description="Total AC power (kW)")
    dc_ac_ratio_actual: float = Field(..., description="Actual DC/AC ratio")
    max_string_voc_v: float = Field(..., description="String Voc at minimum temperature (V)")
    min_string_vmp_v: float = Field(..., description="String Vmp at maximum temperature (V)")
    max_string_isc_a: float = Field(..., description="String Isc at maximum temperature (A)")
    string_current_a: float = Field(..., description="String operating current (A)")
    total_strings_per_inverter: float = Field(..., description="Strings connected per inverter")
    temperature_derating_pct: float = Field(..., description="Inverter temperature derating (%)")
    altitude_derating_pct: float = Field(..., description="Inverter altitude derating (%)")
    effective_inverter_capacity_kw: float = Field(..., description="Inverter AC capacity after derating (kW)")
    inverter_loading_ratio: float = Field(..., description="Inverter loading ratio (P_dc / P_ac_derated)")
    total_inverter_connections: int = Field(..., description="Total MPPT inputs needed")
    recommendation_notes: list[str] = Field(default_factory=list, description="Design recommendations")
    standard_reference: str = Field(default="IEC 62548:2016", description="Applicable standard")


# ─── BATTERY-002: Battery Charger Selection (IEEE 485 / IEC 60364) ────────────

BATTERY_CHARGER_TYPES = Literal['high_frequency', 'thyristor']
BATTERY_TYPES_CHARGER = Literal['flooded', 'VRLA', 'LiFePO4', 'LiNMC']


class BatteryChargerInput(CalculationInput):
    battery_capacity_ah: float = Field(..., gt=0, le=50000, description="Battery bank capacity (Ah)")
    battery_type: BATTERY_TYPES_CHARGER = Field(default='VRLA', description="Battery chemistry")
    cells_per_bank: int = Field(default=24, gt=0, le=500, description="Number of cells in series per string")
    system_voltage_dc_v: float = Field(..., gt=0, le=1500, description="Nominal DC bus voltage (V)")
    charge_rate_c: float = Field(default=0.125, gt=0, le=2.0, description="Charge C-rate (C/8 = 0.125 typical for lead-acid)")
    recharge_time_hours: float = Field(default=8.0, gt=0, le=72, description="Desired recharge time (hours)")
    simultaneous_load_kw: float = Field(default=0.0, ge=0, description="DC load power during charging (kW)")
    charger_type: BATTERY_CHARGER_TYPES = Field(default='high_frequency', description="Charger/rectifier technology")
    ac_voltage_v: float = Field(default=400.0, gt=0, le=69000, description="AC supply voltage (V)")
    ac_frequency_hz: Literal[50, 60] = Field(default=50, description="AC frequency (Hz)")
    ambient_temp_c: float = Field(default=30.0, ge=-10, le=60, description="Max ambient temperature (°C)")
    altitude_m: float = Field(default=0.0, ge=0, le=5000, description="Installation altitude (m)")
    target_power_factor: float = Field(default=0.92, gt=0, le=1.0, description="Required power factor at rated load")


class BatteryChargerOutput(BaseModel):
    battery_type: str
    system_voltage_v: float
    cell_float_voltage_v: float = Field(..., description="Float charge voltage per cell (V)")
    cell_boost_voltage_v: float = Field(..., description="Boost/equalize voltage per cell (V)")
    charging_voltage_float_v: float = Field(..., description="Total float charging voltage (V)")
    charging_voltage_boost_v: float = Field(..., description="Total boost charging voltage (V)")
    charging_current_a: float = Field(..., description="Required DC charging current (A)")
    temperature_derating_factor: float = Field(..., description="Temperature derating factor (0-1)")
    altitude_derating_factor: float = Field(..., description="Altitude derating factor (0-1)")
    effective_charge_current_a: float = Field(..., description="Current including derating (A)")
    charger_dc_power_kw: float = Field(..., description="DC output power of charger (kW)")
    simultaneous_load_kw: float
    total_dc_power_kw: float = Field(..., description="DC power including simultaneous load (kW)")
    charger_efficiency_pct: float = Field(..., description="Efficiency at rated load (%)")
    charger_ac_input_kva: float = Field(..., description="Charger AC input apparent power (kVA)")
    charger_ac_input_kw: float = Field(..., description="Charger AC input real power (kW)")
    ac_input_current_a: float = Field(..., description="AC input current per phase (A)")
    charger_power_factor: float = Field(..., description="Power factor at rated load")
    selected_charger_rating_a: int = Field(..., description="Standard charger current rating (A)")
    selected_charger_modules: int = Field(..., description="Number of parallel charger modules")
    module_rating_a: int = Field(..., description="Rating per charger module (A)")
    estimated_output_ripple_mv_pp: float = Field(..., description="Peak-to-peak output ripple voltage (mV)")
    dc_fuse_rating_a: float = Field(..., description="Recommended DC output fuse rating (A)")
    ac_breaker_rating_a: float = Field(..., description="Recommended AC input breaker rating (A)")
    recommended_cable_mm2: float = Field(..., description="Recommended DC cable cross-section (mm²)")
    protection_notes: list[str] = Field(default_factory=list, description="Protection requirements")
    recommendation_notes: list[str] = Field(default_factory=list, description="Additional recommendations")
    standard_reference: str = Field(default="IEEE 485-2020 / IEC 60364-5-56", description="Applicable standard")


# ─── SOLAR-003: Solar Battery Sizing (IEC 62548) ──────────────────────────────

SOLAR_BATTERY_TYPES = Literal['LiFePO4', 'LiNMC', 'LeadAcid', 'NaS', 'AGM', 'Gel', 'NiCd']
SOLAR_BATTERY_VOLTAGES = Literal[12, 24, 48, 96, 120, 240, 360, 480]


class SolarBatteryInput(CalculationInput):
    daily_load_kwh: float = Field(
        ..., gt=0, le=100000,
        description="Average daily energy consumption (kWh/day)",
        example=30.0,
    )
    autonomy_days: float = Field(
        default=2.0, gt=0, le=30,
        description="Required days of battery autonomy",
        example=2.0,
    )
    battery_type: SOLAR_BATTERY_TYPES = Field(
        default='LiFePO4',
        description="Battery chemistry",
        example='LiFePO4',
    )
    system_voltage_v: SOLAR_BATTERY_VOLTAGES = Field(
        default=48,
        description="Nominal battery bank voltage (V)",
        example=48,
    )
    depth_of_discharge: float = Field(
        default=0.8, gt=0, le=1,
        description="Maximum allowable depth of discharge (0-1)",
        example=0.8,
    )
    temperature_c: float = Field(
        default=25.0, ge=-20, le=60,
        description="Minimum ambient temperature at site (°C). Affects battery capacity",
        example=10.0,
    )
    inverter_efficiency: float = Field(
        default=0.95, gt=0, le=1,
        description="Inverter efficiency (0-1)",
        example=0.95,
    )
    battery_efficiency: float = Field(
        default=0.95, gt=0, le=1,
        description="Battery round-trip efficiency (0-1)",
        example=0.95,
    )
    system_efficiency: float = Field(
        default=0.80, gt=0, le=1,
        description="Overall DC system efficiency — wiring, connections, soiling (0-1)",
        example=0.80,
    )
    max_c_rate: float = Field(
        default=0.5, gt=0, le=10,
        description="Maximum recommended discharge C-rate for the battery type",
        example=0.5,
    )
    target_charge_rate_c: float = Field(
        default=0.125, gt=0, le=2,
        description="Target charge C-rate (C/8 = 0.125 typical for lead-acid)",
        example=0.125,
    )
    load_power_factor: float = Field(
        default=0.9, gt=0, le=1,
        description="Load power factor",
        example=0.9,
    )
    pv_capacity_kwp: Optional[float] = Field(
        default=None, gt=0, le=100000,
        description="Total PV array capacity (kWp) — for charge controller sizing",
        example=10.0,
    )
    peak_sun_hours: Optional[float] = Field(
        default=None, gt=0, le=12,
        description="Peak Sun Hours at site — for PV production check (hours/day)",
        example=5.5,
    )
    battery_cell_voltage_v: float = Field(
        default=3.2, gt=0, le=15,
        description="Nominal voltage of a single battery cell/block (V). LiFePO4=3.2, LeadAcid=2.0",
        example=3.2,
    )
    battery_cell_capacity_ah: Optional[float] = Field(
        default=None, gt=0, le=10000,
        description="Capacity of a single battery cell/block (Ah). Leave empty for automatic sizing",
        example=200,
    )
    max_charge_current_a: Optional[float] = Field(
        default=None, gt=0, le=5000,
        description="Maximum charge current from charge controller (A). Leave empty to auto-calculate",
        example=100,
    )
    days_of_cloudy: float = Field(
        default=0.0, ge=0, le=30,
        description="Expected consecutive cloudy days for PV production adjustment (0 = ignore)",
        example=2.0,
    )


class SolarBatteryOutput(BaseModel):
    battery_type: str = Field(..., description="Battery chemistry")
    system_voltage_v: float = Field(..., description="Nominal battery bank voltage (V)")
    daily_load_kwh: float = Field(..., description="Daily energy consumption (kWh/day)")
    autonomy_days: float = Field(..., description="Days of battery autonomy")
    depth_of_discharge: float = Field(..., description="Depth of discharge used")
    energy_required_kwh: float = Field(..., description="Total energy required from battery bank (kWh)")
    battery_capacity_kwh: float = Field(..., description="Required battery capacity (kWh)")
    battery_capacity_ah: float = Field(..., description="Required battery capacity (Ah)")
    temperature_derating_factor: float = Field(..., description="Temperature derating factor (0-1)")
    system_efficiency_used: float = Field(..., description="Overall system efficiency applied")
    discharge_current_a: float = Field(..., description="Expected discharge current (A)")
    actual_c_rate: float = Field(..., description="Actual discharge C-rate")
    max_c_rate: float = Field(..., description="Maximum allowed C-rate")
    c_rate_safe: bool = Field(..., description="Whether actual C-rate is within limits")
    cells_in_series: int = Field(..., description="Number of battery cells/blocks in series")
    parallel_strings: int = Field(..., description="Number of parallel battery strings")
    total_battery_units: int = Field(..., description="Total battery cells/blocks needed")
    charge_current_a: float = Field(..., description="Recommended charging current (A)")
    charge_rate_c: float = Field(..., description="Charge rate applied (C)")
    charge_controller_current_a: float = Field(..., description="Required charge controller current rating (A)")
    pv_to_load_ratio: Optional[float] = Field(None, description="Ratio of PV production to daily load (if PV data provided)")
    estimated_weight_kg: float = Field(..., description="Estimated battery weight (kg)")
    estimated_volume_l: float = Field(..., description="Estimated battery volume (L)")
    cycle_life: int = Field(..., description="Expected cycle life (cycles)")
    calendar_life_years: float = Field(..., description="Expected calendar life (years)")
    design_life_years: float = Field(..., description="Design life based on operating conditions (years)")
    estimated_cost_usd: float = Field(..., description="Estimated battery cost (USD)")
    recommended_fuse_rating_a: float = Field(..., description="Recommended DC fuse/breaker rating (A)")
    recommended_dc_cable_size_mm2: float = Field(..., description="Recommended DC cable cross-section (mm²)")
    protection_notes: list[str] = Field(default_factory=list, description="Protection requirements")
    recommendation_notes: list[str] = Field(default_factory=list, description="Design recommendations")
    warning_notes: list[str] = Field(default_factory=list, description="Warnings if any")
    standard_reference: str = Field(default="IEC 62548:2016 / IEC 62619:2022", description="Applicable standard")


# ─── BAT-BU-001: Battery Backup Time ──────────────────────────────────────────

class BackupTimeInput(CalculationInput):
    battery_capacity_ah: float = Field(
        ..., gt=0,
        description="Battery bank capacity (Ah)",
        example=200.0,
    )
    system_voltage_v: float = Field(
        default=48.0, gt=0,
        description="Battery system voltage (V)",
        example=48.0,
    )
    load_power_kw: float = Field(
        ..., gt=0,
        description="Load power to be supported (kW)",
        example=5.0,
    )
    depth_of_discharge: float = Field(
        default=0.80, gt=0, le=1,
        description="Maximum depth of discharge (DoD)",
        example=0.80,
    )
    inverter_efficiency: float = Field(
        default=0.95, gt=0, le=1,
        description="Inverter efficiency (0-1)",
        example=0.95,
    )
    battery_efficiency: float = Field(
        default=0.95, gt=0, le=1,
        description="Battery round-trip efficiency (0-1)",
        example=0.95,
    )
    temperature_c: float = Field(
        default=25.0, ge=-20, le=60,
        description="Minimum ambient temperature (°C)",
        example=25.0,
    )
    individual_loads_kw: Optional[List[float]] = Field(
        default=None,
        description="List of individual load powers (kW) for per-load analysis",
        example=[3.0, 2.0, 1.5],
    )


class BackupTimeOutput(BaseModel):
    battery_capacity_kwh: float = Field(..., description="Total battery capacity (kWh)")
    battery_capacity_ah: float = Field(..., description="Battery capacity (Ah)")
    system_voltage_v: float = Field(..., description="System voltage (V)")
    load_power_kw: float = Field(..., description="Load power (kW)")
    depth_of_discharge: float = Field(..., description="Depth of discharge")
    inverter_efficiency: float = Field(..., description="Inverter efficiency")
    battery_efficiency: float = Field(..., description="Battery efficiency")
    temperature_c: float = Field(..., description="Temperature (°C)")
    temperature_derating: float = Field(..., description="Temperature derating factor")
    usable_capacity_kwh: float = Field(..., description="Usable battery capacity after losses (kWh)")
    usable_capacity_ah: float = Field(..., description="Usable battery capacity (Ah)")
    total_energy_available_kwh: float = Field(..., description="Total gross energy (kWh)")
    backup_time_hours: float = Field(..., description="Backup time (hours)")
    backup_time_hours_int: int = Field(..., description="Backup time integer hours")
    backup_time_minutes: int = Field(..., description="Backup time remaining minutes")
    discharge_current_a: float = Field(..., description="Discharge current (A)")
    actual_c_rate: float = Field(..., description="Actual discharge C-rate")
    daily_cycles_possible: float = Field(..., description="Full discharge cycles per day")
    load_analysis: Optional[list] = Field(None, description="Per-load backup time breakdown")
    soc_timeline: Optional[list] = Field(None, description="State of charge over time")
    warning_notes: list[str] = Field(default_factory=list, description="Warnings")
    recommendation_notes: list[str] = Field(default_factory=list, description="Recommendations")
    standards: dict = Field(default_factory=dict, description="Applicable standards")


# ─── MOT-002: Motor Efficiency (IEC 60034-30-1) ───────────────────────────────

IE_CLASSES = Literal['IE1', 'IE2', 'IE3', 'IE4']
POLE_COUNTS = Literal[2, 4, 6, 8]


class MotorEfficiencyInput(CalculationInput):
    rated_power_kw: float = Field(..., gt=0, le=5000, description="Motor rated output power (kW)")
    ie_class: IE_CLASSES = Field(default='IE3', description="Declared IE efficiency class per IEC 60034-30-1")
    declared_efficiency_pct: float = Field(..., gt=0, le=100, description="Declared full-load efficiency from nameplate (%)")
    pole_count: POLE_COUNTS = Field(default=4, description="Number of poles (2, 4, 6, or 8)")
    frequency_hz: Literal[50, 60] = Field(default=50, description="Rated frequency (Hz)")
    load_factor: float = Field(default=0.75, gt=0, le=1.0, description="Average operating load factor (0-1)")
    annual_operating_hours: float = Field(default=4000, gt=0, description="Annual operating hours")
    energy_cost_per_kwh: float = Field(default=0.08, gt=0, description="Energy cost (USD/kWh)")


class MotorEfficiencyOutput(BaseModel):
    rated_power_kw: float = Field(..., description="Motor rated power (kW)")
    pole_count: int = Field(..., description="Number of poles")
    frequency_hz: int = Field(..., description="Rated frequency (Hz)")
    ie_class: str = Field(..., description="Declared IE class")
    declared_efficiency_pct: float = Field(..., description="Declared full-load efficiency (%)")
    required_min_efficiency_pct: float = Field(..., description="Minimum efficiency for IE class per IEC 60034-30-1 (%)")
    class_compliant: bool = Field(..., description="Whether declared efficiency meets IE class minimum")
    efficiency_at_100_pct: float = Field(..., description="Efficiency at 100% load (%)")
    efficiency_at_75_pct: float = Field(..., description="Efficiency at 75% load (%)")
    efficiency_at_50_pct: float = Field(..., description="Efficiency at 50% load (%)")
    power_factor_at_100: float = Field(..., description="Estimated power factor at 100% load")
    power_factor_at_75: float = Field(..., description="Estimated power factor at 75% load")
    power_factor_at_50: float = Field(..., description="Estimated power factor at 50% load")
    load_factor: float = Field(..., description="Operating load factor")
    annual_operating_hours: float = Field(..., description="Annual operating hours")
    annual_energy_consumption_kwh: float = Field(..., description="Annual energy consumption (kWh)")
    annual_energy_cost_usd: float = Field(..., description="Annual energy cost (USD)")
    annual_co2_kg: float = Field(..., description="Annual CO₂ emissions (kg)")
    energy_cost_per_kwh: float = Field(..., description="Energy cost (USD/kWh)")
    upgrade_to_class: Optional[str] = Field(None, description="Recommended upgrade IE class")
    upgrade_efficiency_pct: Optional[float] = Field(None, description="Efficiency of upgrade class (%)")
    upgrade_savings_kwh: Optional[float] = Field(None, description="Annual energy savings from upgrade (kWh)")
    upgrade_savings_usd: Optional[float] = Field(None, description="Annual cost savings from upgrade (USD)")
    upgrade_cost_premium_usd: Optional[float] = Field(None, description="Cost premium for upgrade motor (USD)")
    upgrade_payback_years: Optional[float] = Field(None, description="Simple payback period for upgrade (years)")
    recommendation_notes: list[str] = Field(default_factory=list, description="Additional recommendations")
    standard_reference: str = Field(default="IEC 60034-30-1:2014", description="Applicable standard")
