# src/calculators/power_quality/schemas.py
"""
Power Quality Calculator Schemas — Pydantic Input Models

All power quality calculations reference:
  IEEE 519-2022  — Harmonic Control in Electric Power Systems
  IEC 61000-3-x  — Electromagnetic Compatibility
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field, model_validator
from src.core.base_calculator import CalculationInput

# mypy helper — در runtime همیشه Dict[int, float] است
_HarmonicDict = Dict[int, float]


# ─── PQ-001: THD ─────────────────────────────────────────────────────────────

class THDInput(CalculationInput):
    """
    Total Harmonic Distortion — IEEE 519-2022 Section 5

    harmonic_currents: dict of {harmonic_order: rms_amplitude}
    e.g. {1: 100.0, 3: 30.0, 5: 20.0, 7: 10.0}
    """
    harmonic_currents: Dict[int, float] = Field(
        ...,
        description="Harmonic spectrum: {order: RMS amplitude (A)}. Must include fundamental (order=1).",
        example={1: 100.0, 3: 30.0, 5: 20.0, 7: 10.0},
    )
    base_voltage_kv: Optional[float] = Field(
        None,
        description="System voltage in kV — used to determine IEEE 519 PCC voltage category",
        gt=0,
        example=0.4,
    )

    @model_validator(mode="after")
    def check_fundamental(self) -> "THDInput":
        # BUG FIX: explicit cast برای mypy — FieldInfo has no 'items' member
        spectrum: _HarmonicDict = dict(self.harmonic_currents)  # type: ignore[arg-type]
        if 1 not in spectrum:
            raise ValueError(
                "harmonic_currents must include the fundamental component (order=1)"
            )
        for order, amp in spectrum.items():
            if order < 1:
                raise ValueError(f"Harmonic order must be ≥ 1, got {order}")
            if amp < 0:
                raise ValueError(f"Harmonic amplitude must be ≥ 0, got {amp} for order {order}")
        return self


# ─── PQ-002: TDD ─────────────────────────────────────────────────────────────

class TDDInput(CalculationInput):
    """
    Total Demand Distortion — IEEE 519-2022 Section 5.2

    TDD = sqrt(sum(I_h²)) / I_L * 100  where I_L = max demand load current
    """
    harmonic_currents: Dict[int, float] = Field(
        ...,
        description="Harmonic spectrum: {order: RMS amplitude (A)}. Must NOT include fundamental.",
        example={3: 30.0, 5: 20.0, 7: 10.0, 11: 8.0, 13: 6.0},
    )
    max_demand_current_a: float = Field(
        ...,
        gt=0,
        description="Maximum demand load current at PCC (A) — 12-month average peak",
        example=200.0,
    )
    isc_il_ratio: Optional[float] = Field(
        None,
        gt=0,
        description="Short circuit current / Max demand current ratio (Isc/IL) — for IEEE 519 limit lookup",
        example=20.0,
    )

    @model_validator(mode="after")
    def check_no_fundamental(self) -> "TDDInput":
        # BUG FIX: explicit cast برای mypy — FieldInfo has no 'items' member
        spectrum: _HarmonicDict = dict(self.harmonic_currents)  # type: ignore[arg-type]
        if 1 in spectrum:
            raise ValueError(
                "harmonic_currents for TDD must NOT include fundamental (order=1). "
                "TDD uses only harmonic components (order ≥ 2)."
            )
        for order, amp in spectrum.items():
            if order < 2:
                raise ValueError(f"Harmonic order must be ≥ 2 for TDD, got {order}")
            if amp < 0:
                raise ValueError(f"Harmonic amplitude must be ≥ 0, got {amp}")
        return self


# ─── PQ-003: K-Factor (مجزا از TRF-004 — این نسخه PQ محاسبه‌گر است) ─────────

class KFactorPQInput(CalculationInput):
    """
    K-Factor for non-linear load — UL/IEEE
    K = Σ(I_h² × h²) / Σ(I_h²)
    """
    harmonic_currents: Dict[int, float] = Field(
        ...,
        description="Full harmonic spectrum including fundamental {order: RMS amplitude (A)}",
        example={1: 100.0, 3: 30.0, 5: 20.0, 7: 10.0},
    )
    transformer_kva: Optional[float] = Field(
        None,
        gt=0,
        description="Transformer rating in kVA — for derating recommendation",
        example=500.0,
    )

    @model_validator(mode="after")
    def check_spectrum(self) -> "KFactorPQInput":
        # BUG FIX: explicit cast برای mypy — FieldInfo has no 'items' member
        spectrum: _HarmonicDict = dict(self.harmonic_currents)  # type: ignore[arg-type]
        if not spectrum:
            raise ValueError("harmonic_currents cannot be empty")
        if 1 not in spectrum:
            raise ValueError("harmonic_currents must include fundamental (order=1)")
        return self


# ─── PQ-004: Resonance Analysis ──────────────────────────────────────────────

class ResonanceInput(CalculationInput):
    """
    Parallel Resonance Analysis — IEC 61000-3
    Resonant frequency: f_r = f_1 × sqrt(kVA_sc / kVAR_cap)
    """
    system_kva_sc: float = Field(
        ...,
        gt=0,
        description="System short circuit capacity at PCC in kVA",
        example=5000.0,
    )
    capacitor_kvar: float = Field(
        ...,
        gt=0,
        description="Total capacitor bank rating in kVAR",
        example=300.0,
    )
    fundamental_freq_hz: float = Field(
        default=50.0,
        gt=0,
        le=60.0,
        description="Fundamental system frequency in Hz (50 or 60)",
        example=50.0,
    )
    present_harmonics: Optional[List[int]] = Field(
        default=None,
        description="List of harmonic orders present in the system (for risk assessment)",
        example=[5, 7, 11, 13],
    )


# ─── PQ-005: Passive Filter Design ───────────────────────────────────────────

class PassiveFilterInput(CalculationInput):
    """
    Single-Tuned Passive Harmonic Filter Design — IEEE 519 / IEC 61000-4

    Tuning: f_tuned = 1 / (2π × sqrt(L × C))
    """
    target_harmonic_order: int = Field(
        ...,
        ge=2,
        le=50,
        description="Harmonic order to filter (e.g. 5 for 5th harmonic)",
        example=5,
    )
    system_voltage_v: float = Field(
        ...,
        gt=0,
        description="System line voltage in V",
        example=400.0,
    )
    harmonic_current_a: float = Field(
        ...,
        gt=0,
        description="RMS current of the target harmonic (A)",
        example=20.0,
    )
    system_freq_hz: float = Field(
        default=50.0,
        gt=0,
        le=60.0,
        description="Fundamental frequency (Hz)",
    )
    q_factor: float = Field(
        default=30.0,
        gt=1.0,
        le=200.0,
        description="Filter quality factor Q (typical 20–100)",
        example=30.0,
    )
    detuning_factor: float = Field(
        default=0.97,
        gt=0.9,
        lt=1.0,
        description="Tuning detuning factor p (typically 0.95–0.98) to avoid resonance at exact harmonic",
        example=0.97,
    )


# ─── PQ-006: Active Filter Sizing ────────────────────────────────────────────

class ActiveFilterInput(CalculationInput):
    """
    Active Power Filter Sizing — IEC 61000 / IEEE 519
    """
    harmonic_currents: Dict[int, float] = Field(
        ...,
        description="Harmonic spectrum (excluding fundamental): {order: RMS amplitude (A)}",
        example={3: 30.0, 5: 20.0, 7: 10.0, 11: 8.0},
    )
    target_thd_percent: float = Field(
        default=5.0,
        gt=0,
        le=50.0,
        description="Target THD% after filtering (IEEE 519 limit is typically 5%)",
        example=5.0,
    )
    fundamental_current_a: float = Field(
        ...,
        gt=0,
        description="Fundamental current (RMS) at PCC in A",
        example=100.0,
    )
    system_voltage_v: float = Field(
        ...,
        gt=0,
        description="System line-to-line voltage in V",
        example=400.0,
    )
    max_harmonic_order: int = Field(
        default=50,
        ge=10,
        le=100,
        description="Maximum harmonic order the APF must compensate",
        example=50,
    )

    @model_validator(mode="after")
    def check_no_fundamental(self) -> "ActiveFilterInput":
        # BUG FIX: explicit cast برای mypy — FieldInfo has no 'items' member
        spectrum: _HarmonicDict = dict(self.harmonic_currents)  # type: ignore[arg-type]
        if 1 in spectrum:
            raise ValueError("harmonic_currents must NOT include fundamental (order=1)")
        return self


# ─── PFC-001: Capacitor Bank Sizing (IEC 60831) ───────────────────────────────

class CapacitorBankInput(CalculationInput):
    """
    PFC-001: Capacitor Bank Sizing — IEC 60831

    Designs fixed or automatic capacitor banks with detuning and protection.
    Provide EITHER (active_power_kw + power_factor_current) OR apparent_power_kva + power_factor_current.
    """
    active_power_kw: Optional[float] = Field(None, gt=0, description="Active load power (kW)", example=200.0)
    apparent_power_kva: Optional[float] = Field(None, gt=0, description="Apparent load power (kVA)", example=250.0)
    power_factor_current: float = Field(..., gt=0, le=1.0, description="Current power factor (cos φ)", example=0.80)
    power_factor_target: float = Field(default=0.95, gt=0, le=1.0, description="Target power factor (cos φ)", example=0.95)
    voltage_v: float = Field(default=400.0, gt=0, description="System line voltage (V)", example=400.0)
    system_freq_hz: float = Field(default=50.0, gt=0, le=60.0, description="System frequency (Hz)")
    step_count: Optional[int] = Field(default=None, ge=1, le=20, description="Number of steps for automatic PFC bank. 1 = fixed bank", example=6)
    short_circuit_mva: Optional[float] = Field(default=None, gt=0, description="Short-circuit power at PCC (MVA) — for inrush calculation", example=50.0)
    detuning_pct: float = Field(default=0.0, ge=0, le=14, description="Detuning reactor factor %. 0=none, 5.67%, 7%, or 14%", example=7.0)
    load_hours_per_year: Optional[float] = Field(default=None, gt=0, description="Annual operating hours (for savings calc)", example=6000.0)
    energy_cost_per_kwh: Optional[float] = Field(default=None, gt=0, description="Energy cost (USD/kWh)", example=0.12)
    capacitor_cost_per_kvar: float = Field(default=15.0, gt=0, description="Capacitor bank cost (USD/kVAr)", example=15.0)

    @model_validator(mode="after")
    def validate_combination(self) -> "CapacitorBankInput":
        if self.active_power_kw:
            return self
        if self.apparent_power_kva and self.power_factor_current:
            return self
        raise ValueError("Provide either active_power_kw or apparent_power_kva + power_factor_current")


class CapacitorBankOutput(BaseModel):
    load_power_kw: float = Field(..., description="Active load power (kW)")
    power_factor_current: float = Field(..., description="Current power factor")
    power_factor_target: float = Field(..., description="Target power factor")
    power_factor_actual: float = Field(..., description="Actual achieved PF after correction")
    required_kvar: float = Field(..., description="Required capacitor reactive power (kVAr)")
    selected_bank_kvar: float = Field(..., description="Selected standard capacitor bank size (kVAr)")
    step_count: int = Field(..., description="Number of capacitor steps")
    step_size_kvar: float = Field(..., description="kVAr per step")
    voltage_v: float = Field(..., description="System voltage (V)")
    system_freq_hz: float = Field(..., description="System frequency (Hz)")
    current_before_a: float = Field(..., description="Line current before correction (A)")
    current_after_a: float = Field(..., description="Line current after correction (A)")
    current_reduction_pct: float = Field(..., description="Line current reduction (%)")
    capacitor_line_current_a: float = Field(..., description="Capacitor bank line current (A)")
    max_current_per_step_a: float = Field(..., description="Maximum current per step (A)")
    short_circuit_kva: float = Field(..., description="Short-circuit power at PCC (kVA)")
    short_circuit_current_a: float = Field(..., description="Short-circuit current at PCC (A)")
    inrush_peak_current_a: float = Field(..., description="Inrush current peak (A)")
    detuning_pct: float = Field(..., description="Detuning reactor percentage")
    detuning_required: bool = Field(..., description="Whether detuning is applied")
    detuning_type: Optional[str] = Field(None, description="Detuning tuning description")
    resonant_harmonic_order: Optional[float] = Field(None, description="Parallel resonance harmonic order")
    reactor_kvar: Optional[float] = Field(None, description="Reactor rating (kVAr)")
    reactor_inductance_mh: Optional[float] = Field(None, description="Reactor inductance (mH)")
    fuse_rating_a: float = Field(..., description="Recommended fuse rating (A)")
    recommended_cable_mm2: float = Field(..., description="Recommended cable cross-section (mm²)")
    annual_energy_savings_kwh: Optional[float] = Field(None, description="Annual energy savings (kWh)")
    annual_cost_savings_usd: Optional[float] = Field(None, description="Annual cost savings (USD)")
    payback_years: Optional[float] = Field(None, description="Simple payback period (years)")
    protection_notes: list[str] = Field(default_factory=list, description="Protection requirements")
    recommendation_notes: list[str] = Field(default_factory=list, description="Design recommendations")
    warnings: list[str] = Field(default_factory=list, description="Warnings")
    standard: str = Field(default="IEC 60831-1:2014 / IEC 61000-2-2", description="Applicable standard")


# ─── CAP-001: Power Factor Correction ─────────────────────────────────────────

class PFCorrectionInput(CalculationInput):
    """
    Power Factor Correction — IEC 60831 / IEC 61000-2-2

    Calculates required capacitor kVAr, current reduction, and optional payback.
    Provide EITHER (active_power_kw + power_factor_current) OR apparent_power_kva.
    """
    active_power_kw: Optional[float] = Field(None, gt=0, description="Active load power (kW)", example=100.0)
    apparent_power_kva: Optional[float] = Field(None, gt=0, description="Apparent load power (kVA)", example=125.0)
    power_factor_current: Optional[float] = Field(None, gt=0, le=1.0, description="Current power factor (cos φ)", example=0.80)
    power_factor_target: float = Field(default=0.95, gt=0, le=1.0, description="Target power factor (cos φ)", example=0.95)
    voltage_v: float = Field(default=400.0, gt=0, description="System line voltage (V)", example=400.0)
    system_freq_hz: float = Field(default=50.0, gt=0, le=60.0, description="System frequency (Hz)")
    load_hours_per_year: Optional[float] = Field(None, gt=0, description="Annual operating hours (for energy savings)", example=6000.0)
    energy_cost_per_kwh: Optional[float] = Field(None, gt=0, description="Energy cost (USD/kWh)", example=0.12)
    capacitor_cost_per_kvar: Optional[float] = Field(None, gt=0, description="Capacitor bank cost (USD/kVAr)", example=15.0)
    detuning_pct: float = Field(default=0.0, ge=0, le=14, description="Detuning reactor factor % (0 = no detuning, typical 5.67% or 7%)", example=7.0)
    cable_resistance_per_phase_ohm: Optional[float] = Field(None, ge=0, description="Cable/line resistance per phase (Ω) for loss reduction calc", example=0.05)

    @model_validator(mode="after")
    def validate_combination(self) -> "PFCorrectionInput":
        if self.active_power_kw and self.power_factor_current:
            return self
        if self.apparent_power_kva:
            return self
        raise ValueError("Provide either (active_power_kw + power_factor_current) or apparent_power_kva")


class PFCorrectionOutput(BaseModel):
    """Output schema for Power Factor Correction"""
    required_kvar: float = Field(..., description="Required capacitor reactive power (kVAr)")
    recommended_bank_kvar: float = Field(..., description="Recommended standard capacitor bank size (kVAr)")
    current_before_a: float = Field(..., description="Line current before correction (A)")
    current_after_a: float = Field(..., description="Line current after correction (A)")
    current_reduction_percent: float = Field(..., description="Current reduction (%)")
    apparent_power_before_kva: float = Field(..., description="Apparent power before correction (kVA)")
    apparent_power_after_kva: float = Field(..., description="Apparent power after correction (kVA)")
    pf_actual_after: float = Field(..., description="Actual achieved power factor after correction")
    active_power_kw: float = Field(..., description="Active load power (kW)")
    reactive_power_before_kvar: float = Field(..., description="Reactive power before correction (kVAr)")
    reactive_power_after_kvar: float = Field(..., description="Reactive power after correction (kVAr)")
    power_loss_reduction_kw: Optional[float] = Field(None, description="Reduction in I²R line losses (kW)")
    annual_energy_savings_kwh: Optional[float] = Field(None, description="Annual energy savings (kWh)")
    annual_cost_savings_usd: Optional[float] = Field(None, description="Annual cost savings (USD)")
    payback_period_years: Optional[float] = Field(None, description="Simple payback period (years)")
    resonant_harmonic_order: Optional[float] = Field(None, description="Parallel resonance harmonic order with detuning")
    detuning_reactor_required: bool = Field(..., description="Whether detuning reactor is applied")
