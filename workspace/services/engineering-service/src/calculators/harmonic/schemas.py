"""
HARM-001: Advanced Harmonic Analysis — Input/Output Schemas

Covers:
  - Inter-harmonic analysis per IEC 61000-4-7
  - Active filter with dq control design
  - Compensation current spectrum
"""

from pydantic import Field, field_validator
from typing import Dict, List, Optional, Any
from src.core.base_calculator import CalculationInput, CalculationResult


class AdvancedHarmonicInput(CalculationInput):
    fundamental_freq_hz: float = Field(50.0, ge=45, le=65, description="Fundamental frequency (Hz)")
    system_voltage_v: float = Field(..., gt=0, le=500000, description="Line-to-line voltage (V)")
    fundamental_current_a: float = Field(..., gt=0, le=100000, description="Fundamental RMS current per phase (A)")
    harmonic_spectrum: Dict[int, float] = Field(
        default_factory=lambda: {5: 20.0, 7: 14.0, 11: 9.0, 13: 6.0},
        description="Integer harmonic orders and magnitudes as % of fundamental",
    )
    interharmonic_spectrum: Dict[float, float] = Field(
        default_factory=dict,
        description="Inter-harmonic frequencies (Hz) and magnitudes as % of fundamental",
    )
    target_thd_percent: float = Field(5.0, gt=0, le=100, description="Target THD after compensation (%)")
    dc_bus_voltage_v: Optional[float] = Field(None, gt=0, description="APF DC bus voltage (V)")
    switching_frequency_hz: float = Field(10000.0, ge=1000, le=100000, description="APF switching frequency (Hz)")
    filter_topology: str = Field("LCL", pattern="^(LCL|L)$", description="Output filter topology (LCL or L)")
    dq_bandwidth_hz: float = Field(500.0, gt=0, le=5000, description="dq current control bandwidth (Hz)")
    max_compensation_order: int = Field(50, ge=1, le=200, description="Maximum harmonic order to compensate")

    @field_validator('harmonic_spectrum')
    @classmethod
    def check_harmonic_values(cls, v: Dict[int, float]) -> Dict[int, float]:
        for order, mag in v.items():
            if order <= 0 or order != int(order):
                raise ValueError(f"Invalid harmonic order: {order}. Must be positive integer.")
            if mag < 0 or mag > 200:
                raise ValueError(f"Harmonic magnitude out of range [0,200]%: {order}={mag}%")
        return v

    @field_validator('interharmonic_spectrum')
    @classmethod
    def check_interharmonic_values(cls, v: Dict[float, float]) -> Dict[float, float]:
        for freq, mag in v.items():
            if freq <= 0:
                raise ValueError(f"Interharmonic frequency must be positive: {freq}")
            if mag < 0 or mag > 200:
                raise ValueError(f"Interharmonic magnitude out of range [0,200]%: {freq}Hz={mag}%")
        return v


class AdvancedHarmonicOutput(CalculationResult):
    results: Dict[str, Any]
