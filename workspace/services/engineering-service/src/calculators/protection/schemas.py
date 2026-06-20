"""
Protection Engineering - Pydantic Schemas

Based on IEC 60947-2 and IEC 60269
"""

from typing import Literal, Optional, List, Dict, Any
from pydantic import BaseModel, Field, model_validator
from src.core.base_calculator import CalculationInput


class FuseSelectionInput(CalculationInput):
    """
    Input schema for Fuse Selection per IEC 60269

    Supports gG (general), gM (motor), and aM (backup) fuse types.
    """
    load_current_a: float = Field(..., gt=0, description="Normal load current (A)", example=100.0)
    short_circuit_current_ka: float = Field(..., gt=0, description="Prospective short-circuit current (kA)", example=25.0)
    voltage_v: float = Field(..., gt=0, description="System voltage (V)", example=400.0)
    fuse_type: Literal['gG', 'gM', 'aM'] = Field(default='gG', description="Fuse type per IEC 60269")
    application: Literal['general', 'motor', 'transformer', 'cable', 'semiconductor'] = Field(
        default='general', description="Application type for fuse selection"
    )
    ambient_temperature: float = Field(default=35, ge=-20, le=100, description="Ambient temperature (°C)")
    motor_starting_current_a: Optional[float] = Field(None, gt=0, description="Motor starting current (A) — for gM/aM selection", example=600.0)
    motor_starting_duration_s: Optional[float] = Field(None, gt=0, le=60, description="Motor starting duration (s)", example=5.0)

    @model_validator(mode='after')
    def validate_motor_params(self):
        if self.fuse_type in ('gM', 'aM') and self.application == 'motor':
            if not self.motor_starting_current_a:
                raise ValueError("motor_starting_current_a is required for motor applications with gM/aM fuses")
        return self


class FuseSelectionOutput(BaseModel):
    """Output schema for Fuse Selection per IEC 60269"""
    recommended_rated_current_a: float = Field(..., description="Recommended fuse rated current (A)")
    standard_fuse_rating_a: float = Field(..., description="Standard fuse rating (A)")
    breaking_capacity_ka: float = Field(..., description="Required breaking capacity (kA)")
    is_sufficient: bool = Field(..., description="Whether fuse rating meets requirements")
    fuse_type: str = Field(..., description="Selected fuse type")
    application: str = Field(..., description="Application type")
    i2t_estimate_a2s: Optional[float] = Field(None, description="Estimated I²t let-through (A²s)")
    selectivity_ratio: Optional[float] = Field(None, description="Selectivity ratio with upstream fuse (if applicable)")
    temperature_derating_factor: float = Field(..., description="Temperature derating factor")



class MCCBSelectionInput(CalculationInput):
    """
    Input schema for MCCB/ACB Selection
    
    Based on IEC 60947-2
    """
    load_current_a: float = Field(..., gt=0, description="Normal load current in Amperes")
    short_circuit_current_ka: float = Field(..., gt=0, description="Prospective short-circuit current in kA")
    voltage_v: float = Field(..., gt=0, description="System voltage in Volts")
    pole_count: Literal[1, 2, 3, 4] = Field(default=3, description="Number of poles")
    ambient_temperature: float = Field(default=40, ge=-20, le=70, description="Ambient temperature in °C")
    application_type: Literal['mccb', 'acb'] = Field(default='mccb', description="Type: MCCB or ACB")


class MCCBSelectionOutput(BaseModel):
    """Output schema for MCCB Selection"""
    recommended_rated_current_a: float = Field(..., description="Recommended rated current in Amperes")
    recommended_breaking_capacity_ka: float = Field(..., description="Recommended breaking capacity in kA")
    is_sufficient: bool = Field(..., description="Whether selected breaker is sufficient")
    standard_size: str = Field(..., description="Standard MCCB/ACB size")


class SelectivityInput(CalculationInput):
    """
    Input schema for Selectivity Analysis per IEC 60947-2
    """
    upstream_rated_current_a: float = Field(..., gt=0, description="Upstream breaker rated current (In)", example=630.0)
    upstream_instantaneous_threshold_a: float = Field(..., gt=0, description="Upstream instantaneous trip threshold (Ii)", example=6300.0)
    downstream_rated_current_a: float = Field(..., gt=0, description="Downstream breaker rated current (In)", example=250.0)
    downstream_instantaneous_threshold_a: float = Field(..., gt=0, description="Downstream instantaneous trip threshold (Ii)", example=2500.0)
    fault_current_ka: float = Field(..., gt=0, description="Prospective fault current at the point", example=25.0)
    selectivity_type: Literal['current', 'time', 'zone_interlocking'] = Field(default='current', description="Type of selectivity")
    upstream_delay_ms: Optional[float] = Field(None, ge=0, description="Upbreaker short-time delay (ms) — for time selectivity", example=200.0)
    downstream_clearing_ms: Optional[float] = Field(None, gt=0, description="Downstream breaker clearing time (ms)", example=30.0)
    cable_length_m: Optional[float] = Field(None, ge=0, description="Cable length between breakers (m) — for impedance selectivity", example=50.0)


class SelectivityOutput(BaseModel):
    """Output schema for Selectivity Analysis per IEC 60947-2"""
    is_selective: bool = Field(..., description="Whether selectivity is achieved")
    selectivity_limit_ka: float = Field(..., description="Maximum fault current where selectivity holds")
    selectivity_ratio: float = Field(..., description="Ii_upstream / Ii_downstream ratio")
    selectivity_type: str = Field(..., description="Type of selectivity applied")
    recommendation: str = Field(..., description="Recommendation for improvement")
    upstream_breaker_info: dict = Field(default_factory=dict, description="Upstream breaker parameters")
    downstream_breaker_info: dict = Field(default_factory=dict, description="Downstream breaker parameters")


# ─── PROT-005: Protection Coordination Study (IEC 60255-151) ──────────────────


class CoordinationDeviceInput(CalculationInput):
    name: str = Field(default='Device', description="Device label")
    rated_current_a: float = Field(..., gt=0, le=10000, description="Rated current (In) in A")
    curve_type: str = Field(default='SI', pattern='^(SI|VI|EI|LTI|I2T)$', description="IEC 60255-151 curve type")
    tms: float = Field(default=0.1, gt=0, le=5.0, description="Time multiplier setting (TMS)")
    l_pickup_x_in: float = Field(default=1.0, ge=0.5, le=2.0, description="Long-time pickup (×In)")
    s_pickup_x_in: Optional[float] = Field(default=None, ge=1.0, le=15.0, description="Short-time pickup (×In)")
    s_delay_s: Optional[float] = Field(default=None, ge=0.0, le=5.0, description="Short-time delay (s)")
    i_pickup_x_in: Optional[float] = Field(default=None, ge=1.5, le=30.0, description="Instantaneous pickup (×In)")


class ProtectionCoordinationInput(CalculationInput):
    upstream: CoordinationDeviceInput
    downstream: CoordinationDeviceInput
    fault_currents_a: List[float] = Field(
        default_factory=lambda: [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000],
        description="Fault current values for selectivity analysis (A)",
    )
    system_voltage_v: float = Field(default=400.0, gt=0, le=500000, description="System voltage (V)")
    selectivity_margin_ms: float = Field(default=100.0, gt=0, le=1000, description="Required time margin for selectivity (ms)")


class ProtectionCoordinationOutput(BaseModel):
    selectivity_table: List[Dict[str, Any]] = Field(default_factory=list, description="Selectivity analysis per fault level")
    overall_selectivity: str = Field(..., description="Overall result: total | partial | none")
    limiting_device: str = Field(..., description="Device limiting selectivity")
    maximum_selectivity_current_a: float = Field(..., description="Max fault current with full selectivity (A)")
    downstream_min_trip_ms: float = Field(..., description="Downstream minimum trip time (ms)")
    upstream_min_trip_ms: float = Field(..., description="Upstream minimum trip time (ms)")
    recommendations: List[str] = Field(default_factory=list, description="Coordination improvement suggestions")


# ─── ARC-001: Incident Energy (Arc Flash) — IEEE 1584-2018 ─────────────────────


class ArcIncidentInput(CalculationInput):
    system_voltage_kv: float = Field(
        ..., gt=0, le=1000,
        description="System nominal voltage (kV)",
        example=0.4,
    )
    bolted_fault_ka: float = Field(
        ..., gt=0,
        description="Bolted three-phase fault current (kA)",
        example=25.0,
    )
    gap_mm: float = Field(
        default=32.0, gt=0, le=500,
        description="Conductor gap distance (mm). Typical: 13mm LV, 32-104mm MV",
        example=32.0,
    )
    working_distance_mm: float = Field(
        default=457.0, gt=0, le=10000,
        description="Working distance from arc source (mm). 457mm LV, 914mm HV typical",
        example=457.0,
    )
    clearing_time_s: float = Field(
        default=0.1, gt=0, le=10,
        description="Arc clearing time (s). Typically 0.1-0.2s for LV breakers",
        example=0.1,
    )
    enclosure_type: str = Field(
        default="enclosed",
        description="Enclosure type: enclosed | open_air | cable_box | switchgear | MCC",
        example="enclosed",
    )
    electrode_config: str = Field(
        default="VCB",
        description="Electrode config per IEEE 1584: VCB | VCBB | HCB | HOA | VOA | BBF | BBFT",
        example="VCB",
    )
    system_freq_hz: float = Field(
        default=50.0, ge=50, le=60,
        description="System frequency (Hz)",
        example=50.0,
    )


class ArcIncidentOutput(BaseModel):
    system_voltage_kv: float = Field(..., description="System voltage (kV)")
    bolted_fault_ka: float = Field(..., description="Bolted fault current (kA)")
    arcing_current_ka: float = Field(..., description="Computed arcing current (kA)")
    clearing_time_s: float = Field(..., description="Arc clearing time (s)")
    gap_mm: float = Field(..., description="Conductor gap (mm)")
    enclosure_type: str = Field(..., description="Enclosure type")
    incident_energy_cal_cm2: float = Field(..., description="Incident energy (cal/cm²)")
    incident_energy_j_cm2: float = Field(..., description="Incident energy (J/cm²)")
    arc_flash_boundary_m: float = Field(..., description="Arc flash boundary distance (m)")
    working_distance_mm: float = Field(..., description="Working distance (mm)")
    hazard_risk_category: int = Field(..., description="Hazard risk category (0-4, 99=danger)")
    hazard_risk_label: str = Field(..., description="HRC label")
    hazard_level: str = Field(..., description="Hazard description")
    required_ppe: str = Field(..., description="Required PPE description")
    limited_approach_m: float = Field(..., description="Limited approach boundary (m)")
    restricted_approach_m: float = Field(..., description="Restricted approach boundary (m)")
    fusing_energy_a2s: float = Field(..., description="Estimated fuse I²t (A²s)")
    recommendation_notes: list[str] = Field(default_factory=list, description="Safety recommendations")
    standard_reference: str = Field(default="IEEE 1584-2018 / NFPA 70E-2021", description="Applicable standard")
