"""
Switchgear Engineering - Pydantic Schemas

Based on IEC 61439-1, IEC 60947-2, IEC 60947-3
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field, model_validator
from src.core.base_calculator import CalculationInput


class MainSwitchInput(CalculationInput):
    """
    Input schema for Main Switch / Incomer Selection

    Selects the main incoming switch for a distribution board
    based on total load, transformer rating, diversity, and fault level.
    """
    total_connected_kva: Optional[float] = Field(None, gt=0, description="Total connected load (kVA)", example=500.0)
    transformer_kva: Optional[float] = Field(None, gt=0, description="Transformer rating feeding the board (kVA)", example=630.0)
    diversity_factor: float = Field(default=0.8, gt=0, le=1.0, description="Diversity / simultaneity factor (0-1)", example=0.8)
    short_circuit_current_ka: float = Field(..., gt=0, description="Prospective short-circuit current at incomer (kA)", example=25.0)
    voltage_v: float = Field(..., gt=0, description="System line voltage (V)", example=400.0)
    pole_count: Literal[3, 4] = Field(default=3, description="3-pole or 4-pole (with neutral)")
    switch_type: Literal['acb', 'mccb', 'switch_disconnector', 'changeover', 'switch_fuse'] = Field(
        default='mccb', description="Type of main switch"
    )
    num_sources: Literal[1, 2, 3] = Field(default=1, description="Number of incoming sources (1=single, 2=dual, 3=ring)")
    lsig_required: bool = Field(default=True, description="Whether LSIG protection settings are needed")
    ambient_temperature: float = Field(default=40, ge=-10, le=70, description="Ambient temperature (°C)")

    @model_validator(mode='after')
    def validate_power_source(self):
        if not self.total_connected_kva and not self.transformer_kva:
            raise ValueError("Provide either total_connected_kva or transformer_kva")
        if self.num_sources > 1 and self.switch_type not in ('changeover', 'acb'):
            raise ValueError("For multiple sources, use 'changeover' or 'acb' switch type")
        return self


class LSIGSettings(BaseModel):
    """LSIG protection settings for ACB/MCCB"""
    long_time_pickup_a: float = Field(..., description="Long-time pickup current (Ir)")
    long_time_delay_s: float = Field(..., description="Long-time delay (tr) in seconds")
    short_time_pickup_a: float = Field(..., description="Short-time pickup current (Sd)")
    short_time_delay_s: float = Field(..., description="Short-time delay (tsd) in seconds")
    instantaneous_pickup_a: float = Field(..., description="Instantaneous pickup (Ii)")
    ground_fault_pickup_a: Optional[float] = Field(None, description="Ground fault pickup (Ig)")
    ground_fault_delay_s: Optional[float] = Field(None, description="Ground fault delay (tg)")


class MainSwitchOutput(BaseModel):
    """Output schema for Main Switch / Incomer Selection"""
    recommended_rated_current_a: float = Field(..., description="Recommended switch rated current (A)")
    recommended_breaking_capacity_ka: float = Field(..., description="Required breaking capacity (kA)")
    is_sufficient: bool = Field(..., description="Whether selection meets requirements")
    switch_type: str = Field(..., description="Selected switch type")
    num_sources: int = Field(..., description="Number of sources")
    pole_count: int = Field(..., description="Number of poles")
    diversity_factor: float = Field(..., description="Applied diversity factor")
    design_current_a: float = Field(..., description="Design current (Ib) after diversity (A)")
    lsig: Optional[LSIGSettings] = Field(None, description="LSIG protection settings (if applicable)")
    standard_reference: str = Field(..., description="Applicable IEC standard")
    recommendation_notes: list[str] = Field(default_factory=list, description="Additional recommendations")
