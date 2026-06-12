"""
Protection Engineering - Pydantic Schemas

Based on IEC 60947-2
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field, model_validator
from src.core.base_calculator import CalculationInput


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
    Input schema for Selectivity Analysis
    """
    upstream_breaker_type: str = Field(..., description="Upstream breaker model/type")
    downstream_breaker_type: str = Field(..., description="Downstream breaker model/type")
    fault_current_ka: float = Field(..., gt=0, description="Fault current in kA")
    selectivity_type: Literal['current', 'time', 'zone'] = Field(default='time', description="Type of selectivity")


class SelectivityOutput(BaseModel):
    """Output schema for Selectivity Analysis"""
    is_selective: bool = Field(..., description="Whether selectivity is achieved")
    selectivity_limit_ka: float = Field(..., description="Maximum current for selectivity in kA")
    recommendation: str = Field(..., description="Recommendation for improvement")
