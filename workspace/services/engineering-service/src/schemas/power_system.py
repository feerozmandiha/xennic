"""
Power System Studies - Pydantic Schemas

Input and output schemas for all power system calculations
Based on IEC 60909, IEC 61439, IEEE 399
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator

# ─── Shared Data Models ───────────────────────────────────────────────────────

class BusData(BaseModel):
    name: str = Field(..., description="Bus name/identifier")
    vn_kv: float = Field(..., gt=0, description="Rated voltage (kV)")
    type: Literal["b", "pq", "pv", "slack"] = Field(default="b", description="Bus type: b=PQ, pq=PQ, pv=PV, slack=Slack")
    min_vm_pu: float = Field(default=0.95, ge=0.8, le=1.0, description="Minimum voltage limit (pu)")
    max_vm_pu: float = Field(default=1.05, ge=1.0, le=1.2, description="Maximum voltage limit (pu)")


class LineData(BaseModel):
    name: str = Field(..., description="Line name/identifier")
    from_bus: str = Field(..., description="From bus name")
    to_bus: str = Field(..., description="To bus name")
    length_km: float = Field(default=1.0, gt=0, description="Line length (km)")
    r_ohm_per_km: float = Field(..., ge=0, description="Resistance per km (Ohm/km)")
    x_ohm_per_km: float = Field(..., ge=0, description="Reactance per km (Ohm/km)")
    b_uf_per_km: float = Field(default=0, ge=0, description="Shunt capacitance per km (uF/km)")
    max_loading_percent: float = Field(default=100, ge=1, le=120, description="Max allowable loading (%)")


class TransformerData(BaseModel):
    name: str = Field(..., description="Transformer name/identifier")
    hv_bus: str = Field(..., description="HV side bus name")
    lv_bus: str = Field(..., description="LV side bus name")
    sn_mva: float = Field(..., gt=0, description="Rated power (MVA)")
    vn_hv_kv: float = Field(..., gt=0, description="HV rated voltage (kV)")
    vn_lv_kv: float = Field(..., gt=0, description="LV rated voltage (kV)")
    vk_percent: float = Field(..., gt=0, le=50, description="Short-circuit voltage (%)")
    vkr_percent: float = Field(default=0, ge=0, le=50, description="Ohmic part of SC voltage (%)")
    pfe_kw: float = Field(default=0, ge=0, description="Iron losses (kW)")
    i0_percent: float = Field(default=0, ge=0, le=10, description="No-load current (%)")
    tap_side: Literal["hv", "lv"] = Field(default="hv", description="Tap changer side")
    tap_pos: int = Field(default=0, description="Tap position")
    tap_step_percent: float = Field(default=1.25, ge=0.1, le=5, description="Tap step (% per step)")
    tap_neutral: int = Field(default=0, description="Neutral tap position")


class LoadData(BaseModel):
    name: str = Field(..., description="Load name/identifier")
    bus: str = Field(..., description="Connected bus name")
    p_mw: float = Field(..., description="Active power (MW)")
    q_mvar: float = Field(default=0, description="Reactive power (MVAR)")
    scaling_factor: float = Field(default=1.0, ge=0, le=2, description="Load scaling factor")


class GeneratorData(BaseModel):
    name: str = Field(..., description="Generator name/identifier")
    bus: str = Field(..., description="Connected bus name")
    p_mw: float = Field(..., ge=0, description="Active power (MW)")
    vm_pu: float = Field(default=1.0, ge=0.9, le=1.1, description="Voltage setpoint (pu)")
    min_q_mvar: float = Field(default=-9999, description="Min reactive power (MVAR)")
    max_q_mvar: float = Field(default=9999, description="Max reactive power (MVAR)")
    min_p_mw: float = Field(default=0, description="Min active power (MW)")
    max_p_mw: float = Field(default=9999, description="Max active power (MW)")
    scaling: bool = Field(default=True, description="Participate in distributed slack")


# ─── Network Data (composite) ────────────────────────────────────────────────

class NetworkData(BaseModel):
    buses: list[BusData] = Field(..., min_length=1, description="Network buses")
    lines: list[LineData] = Field(default_factory=list, description="Network lines")
    transformers: list[TransformerData] = Field(default_factory=list, description="Network transformers")
    loads: list[LoadData] = Field(default_factory=list, description="Network loads")
    generators: list[GeneratorData] = Field(default_factory=list, description="Network generators")

    @model_validator(mode='after')
    def validate_bus_names(self):  # noqa: C901
        bus_names = {b.name for b in self.buses}
        for line in self.lines:
            if line.from_bus not in bus_names:
                raise ValueError(f"Line '{line.name}': from_bus '{line.from_bus}' not found in buses")
            if line.to_bus not in bus_names:
                raise ValueError(f"Line '{line.name}': to_bus '{line.to_bus}' not found in buses")
        for tf in self.transformers:
            if tf.hv_bus not in bus_names:
                raise ValueError(f"Transformer '{tf.name}': hv_bus '{tf.hv_bus}' not found in buses")
            if tf.lv_bus not in bus_names:
                raise ValueError(f"Transformer '{tf.name}': lv_bus '{tf.lv_bus}' not found in buses")
        for load in self.loads:
            if load.bus not in bus_names:
                raise ValueError(f"Load '{load.name}': bus '{load.bus}' not found in buses")
        for gen in self.generators:
            if gen.bus not in bus_names:
                raise ValueError(f"Generator '{gen.name}': bus '{gen.bus}' not found in buses")
        slack_buses = [b for b in self.buses if b.type == 'slack']
        if len(slack_buses) != 1:
            raise ValueError(f"Network must have exactly one slack bus, found {len(slack_buses)}")
        return self


# ─── Motor Data ───────────────────────────────────────────────────────────────

class MotorData(BaseModel):
    name: str = Field(..., description="Motor name")
    rated_power_kw: float = Field(..., gt=0, description="Rated mechanical power (kW)")
    rated_voltage_v: float = Field(..., gt=0, description="Rated voltage (V)")
    rated_power_factor: float = Field(default=0.85, gt=0, le=1, description="Rated power factor")
    rated_efficiency: float = Field(default=0.95, gt=0, le=1, description="Rated efficiency")
    speed_rpm: int = Field(default=1500, ge=1, description="Rated speed (rpm)")
    starting_current_factor: float = Field(default=6.5, ge=1, le=15, description="I_start / I_n")
    starting_power_factor: float = Field(default=0.3, gt=0, le=1, description="Starting power factor")
    starting_torque_factor: float = Field(default=1.5, ge=0.5, le=5, description="Starting torque / FLT")
    starting_method: Literal["direct", "star_delta", "soft_starter", "vfd"] = Field(default="direct", description="Starting method")
    stall_time_s: float = Field(default=20, gt=0, description="Max stall time (s)")
    locked_rotor_torque_factor: float = Field(default=2.5, ge=0.5, le=5, description="LRT / FLT")
    breakdown_torque_factor: float = Field(default=2.5, ge=1, le=5, description="BDT / FLT")


# ─── PS-001: Load Flow ────────────────────────────────────────────────────────

class LoadFlowInput(BaseModel):
    network: NetworkData = Field(..., description="Network model")
    algorithm: Literal["nr", "bfsw"] = Field(default="nr", description="Load flow algorithm: nr=Newton-Raphson, bfsw=Backward-Forward")
    max_iteration: int = Field(default=100, ge=10, le=1000, description="Maximum iterations")
    tolerance: float = Field(default=1e-6, ge=1e-10, le=1e-3, description="Convergence tolerance")
    calculate_voltage_angles: bool = Field(default=True, description="Calculate bus voltage angles")
    enforce_q_limits: bool = Field(default=True, description="Enforce generator reactive power limits")


class BusFlowResult(BaseModel):
    bus_id: str = Field(..., description="Bus name")
    v_pu: float = Field(..., description="Voltage magnitude (pu)")
    angle_deg: float = Field(..., description="Voltage angle (degrees)")
    v_ok: bool = Field(..., description="Voltage within limits")
    p_mw: float = Field(..., description="Net active power injection (MW)")
    q_mvar: float = Field(..., description="Net reactive power injection (MVAR)")


class LineFlowResult(BaseModel):
    line_id: str = Field(..., description="Line name")
    from_bus: str = Field(..., description="From bus")
    to_bus: str = Field(..., description="To bus")
    loading_percent: float = Field(..., description="Line loading (%)")
    p_from_mw: float = Field(..., description="Active power at from end (MW)")
    q_from_mvar: float = Field(..., description="Reactive power at from end (MVAR)")
    p_to_mw: float = Field(..., description="Active power at to end (MW)")
    q_to_mvar: float = Field(..., description="Reactive power at to end (MVAR)")
    i_from_a: float = Field(..., description="Current at from end (A)")
    i_to_a: float = Field(..., description="Current at to end (A)")
    loading_ok: bool = Field(..., description="Loading within limits")


class TransformerFlowResult(BaseModel):
    tf_id: str = Field(..., description="Transformer name")
    hv_bus: str = Field(..., description="HV bus")
    lv_bus: str = Field(..., description="LV bus")
    loading_percent: float = Field(..., description="Loading (%)")
    p_hv_mw: float = Field(..., description="Active power at HV side (MW)")
    q_hv_mvar: float = Field(..., description="Reactive power at HV side (MVAR)")
    p_lv_mw: float = Field(..., description="Active power at LV side (MW)")
    q_lv_mvar: float = Field(..., description="Reactive power at LV side (MVAR)")
    loading_ok: bool = Field(..., description="Loading within limits")


class TotalLosses(BaseModel):
    total_loss_kw: float = Field(..., description="Total active power losses (kW)")
    total_loss_kvar: float = Field(..., description="Total reactive power losses (kVAR)")


class LoadFlowOutput(BaseModel):
    converged: bool = Field(..., description="Load flow converged")
    iterations: int = Field(..., description="Number of iterations")
    computation_time_ms: float = Field(..., description="Computation time (ms)")
    buses: list[BusFlowResult] = Field(..., description="Bus results")
    lines: list[LineFlowResult] = Field(default_factory=list, description="Line results")
    transformers: list[TransformerFlowResult] = Field(default_factory=list, description="Transformer results")
    total_losses: TotalLosses = Field(..., description="Total system losses")
    system_status: str = Field(..., description="Overall status: OK / WARNING / VIOLATION")
    warnings: list[str] = Field(default_factory=list, description="Warnings")
    recommendations: list[str] = Field(default_factory=list, description="Recommendations")


# ─── PS-002: Short Circuit ────────────────────────────────────────────────────

class ShortCircuitInput(BaseModel):
    network: NetworkData = Field(..., description="Network model")
    fault_bus: str = Field(..., description="Bus where fault occurs")
    fault_type: Literal["three_phase", "single_phase_to_ground"] = Field(default="three_phase", description="Fault type")
    voltage_factor_c: float = Field(default=1.1, ge=1.0, le=1.1, description="Voltage factor per IEC 60909 Table 1")
    motor_contribution: bool = Field(default=True, description="Include motor contribution")
    calculate_peak: bool = Field(default=True, description="Calculate peak current (ip)")

    @model_validator(mode='after')
    def validate_fault_bus(self):
        bus_names = {b.name for b in self.network.buses}
        if self.fault_bus not in bus_names:
            raise ValueError(f"fault_bus '{self.fault_bus}' not found in network buses")
        return self


class SourceContribution(BaseModel):
    source_name: str = Field(..., description="Source name")
    contribution_ka: float = Field(..., description="Contribution to fault (kA)")
    contribution_percent: float = Field(..., description="Contribution percentage")


class ShortCircuitOutput(BaseModel):
    fault_bus: str = Field(..., description="Fault bus name")
    fault_type: str = Field(..., description="Fault type")
    ik_initial_ka: float = Field(..., description="Initial symmetrical SC current I\"k (kA)")
    ik_steady_ka: float = Field(..., description="Steady-state SC current Ik (kA)")
    ip_peak_ka: float = Field(default=0, description="Peak current ip (kA)")
    kappa: float = Field(default=0, description="Peak factor kappa")
    x_r_ratio: float = Field(..., description="X/R ratio at fault point")
    motor_contribution_ka: float = Field(default=0, description="Motor contribution (kA)")
    contributions: list[SourceContribution] = Field(default_factory=list, description="Source contributions")
    warnings: list[str] = Field(default_factory=list, description="Warnings")


# ─── PS-003: Motor Starting ───────────────────────────────────────────────────

class MotorStartingInput(BaseModel):
    motor: MotorData = Field(..., description="Motor data")
    network: NetworkData = Field(..., description="Network model")
    motor_bus: str = Field(..., description="Bus where motor is connected")
    allowed_voltage_dip_pct: float = Field(default=15.0, ge=1, le=50, description="Max allowable voltage dip (%)")
    load_torque_percent: float = Field(default=50, ge=1, le=200, description="Load torque during start (% of starting torque)")
    load_inertia_kgm2: Optional[float] = Field(default=None, ge=0, description="Load inertia (kg·m²)")
    pcc_bus: Optional[str] = Field(default=None, description="Point of common coupling bus name")

    @model_validator(mode='after')
    def validate_buses(self):
        bus_names = {b.name for b in self.network.buses}
        if self.motor_bus not in bus_names:
            raise ValueError(f"motor_bus '{self.motor_bus}' not found in network buses")
        if self.pcc_bus and self.pcc_bus not in bus_names:
            raise ValueError(f"pcc_bus '{self.pcc_bus}' not found in network buses")
        return self


class MotorStartingResult(BaseModel):
    voltage_dip_percent: float = Field(..., description="Voltage dip at motor bus (%)")
    voltage_dip_deviation: float = Field(..., description="Voltage dip (pu deviation)")
    v_dip_at_pcc_pu: float = Field(..., description="Voltage at PCC during start (pu)")
    starting_current_a: float = Field(..., description="Starting current (A)")
    starting_time_s: Optional[float] = Field(default=None, description="Estimated starting time (s)")
    acceleration_time_s: Optional[float] = Field(default=None, description="Estimated acceleration time (s)")
    starting_torque_nm: float = Field(..., description="Starting torque (Nm)")
    rated_torque_nm: float = Field(..., description="Rated torque (Nm)")


class MotorStartingOutput(BaseModel):
    motor_name: str = Field(..., description="Motor name")
    motor_bus: str = Field(..., description="Motor bus name")
    starting_method: str = Field(..., description="Starting method used")
    details: MotorStartingResult = Field(..., description="Detailed results")
    warnings: list[str] = Field(default_factory=list, description="Warnings")
    recommendations: list[str] = Field(default_factory=list, description="Recommendations")


# ─── PS-004: Busbar Sizing ────────────────────────────────────────────────────

class BusbarDimensions(BaseModel):
    width_mm: float = Field(..., gt=0, description="Busbar width (mm)")
    thickness_mm: float = Field(..., gt=0, description="Busbar thickness (mm)")
    cross_section_mm2: float = Field(..., gt=0, description="Cross-sectional area (mm²)")


class ThermalRating(BaseModel):
    temp_rise_k: float = Field(..., description="Temperature rise (K)")
    p_loss_w: float = Field(..., description="Power loss per meter (W/m)")
    surface_area_per_m: float = Field(..., description="Surface area per meter (mm²/m)")
    current_capacity_a: float = Field(..., description="Current capacity (A)")


class ElectrodynamicForce(BaseModel):
    peak_force_n: float = Field(..., description="Peak electrodynamic force (N)")
    bending_moment_nm: float = Field(..., description="Maximum bending moment (N·m)")
    bending_stress_mpa: float = Field(..., description="Maximum bending stress (MPa)")
    yield_strength_mpa: float = Field(..., description="Material yield strength (MPa)")
    stress_ok: bool = Field(..., description="Stress within limits")


class BusbarSizingInput(BaseModel):
    rated_current_a: float = Field(..., gt=0, description="Rated current (A)")
    short_circuit_current_ka: float = Field(..., gt=0, description="Short-circuit current (kA)")
    duration_s: float = Field(default=1.0, gt=0, le=5, description="Fault duration (s)")
    material: Literal["copper", "aluminum"] = Field(default="copper", description="Busbar material")
    busbar: Optional[BusbarDimensions] = Field(default=None, description="Existing busbar dimensions (if known)")
    arrangement: Literal["flat", "edge"] = Field(default="flat", description="Busbar arrangement")
    phase_spacing_mm: float = Field(default=100, gt=0, description="Phase spacing (mm)")
    span_length_mm: float = Field(default=1000, gt=0, description="Support span length (mm)")
    support_type: Literal["simply_supported", "fixed"] = Field(default="simply_supported", description="Support type")
    peak_factor: float = Field(default=2.5, ge=1.0, le=3.0, description="Peak factor for SC current (√2 × κ)")


class BusbarSizingOutput(BaseModel):
    busbar: BusbarDimensions = Field(..., description="Busbar dimensions")
    thermal_rating: ThermalRating = Field(..., description="Thermal rating")
    electrodynamic_force: ElectrodynamicForce = Field(..., description="Electrodynamic forces")
    adiabatic_withstand_ka: float = Field(..., description="Adiabatic SC withstand (kA)")
    bending_stress_ok: bool = Field(..., description="Bending stress within limits")
    status: str = Field(..., description="Status: OK / FAIL_MECHANICAL / FAIL_THERMAL")
    warnings: list[str] = Field(default_factory=list, description="Warnings")
    recommendations: list[str] = Field(default_factory=list, description="Recommendations")
