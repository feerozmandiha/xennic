"""
Transformer Engineering - Pydantic Schemas

Input and output schemas for all transformer calculations
Based on IEC 60076 and IEEE C57.110
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field, model_validator
from src.core.base_calculator import CalculationInput


class TransformerEfficiencyInput(CalculationInput):
    """
    Input schema for Transformer Energy Efficiency (EU 548/2014)

    Validates transformer losses against Tier 1 (2015) and Tier 2 (2021) limits.
    """
    rated_power_kva: float = Field(..., gt=0, le=50000, description="Transformer rated power (kVA)", example=630.0)
    no_load_loss_w: float = Field(..., ge=0, description="Measured/rated no-load loss (W)", example=530.0)
    load_loss_w: float = Field(..., ge=0, description="Measured/rated load loss at rated power (W)", example=6800.0)
    transformer_type: Literal['oil', 'dry'] = Field(default='oil', description="Oil-immersed (oil) or Dry-type (dry)")
    voltage_level: Literal['LV', 'MV'] = Field(default='MV', description="Low voltage (LV) or Medium voltage (MV)")


class TransformerEfficiencyOutput(BaseModel):
    """Output schema for Transformer Energy Efficiency"""
    compliant_tier_1: bool = Field(..., description="Compliant with EU 548/2014 Tier 1 (2015)")
    compliant_tier_2: bool = Field(..., description="Compliant with EU 548/2014 Tier 2 (2021)")
    tier_1_no_load_max_w: float = Field(..., description="Max no-load loss for Tier 1 (W)")
    tier_1_load_max_w: float = Field(..., description="Max load loss for Tier 1 (W)")
    tier_2_no_load_max_w: float = Field(..., description="Max no-load loss for Tier 2 (W)")
    tier_2_load_max_w: float = Field(..., description="Max load loss for Tier 2 (W)")
    efficiency_percent: float = Field(..., description="Transformer efficiency at 100% load (%)")
    loss_class: str = Field(..., description="Loss class (A+, A, B, C) per EU 548/2014")


class TransformerSizingInput(CalculationInput):
    """
    Input schema for Transformer Sizing Calculation
    
    Based on IEC 60076
    """
    apparent_power_kva: Optional[float] = Field(None, gt=0, description="Apparent power in kVA")
    voltage_primary_v: Optional[float] = Field(None, gt=0, description="Primary voltage in Volts")
    voltage_secondary_v: Optional[float] = Field(None, gt=0, description="Secondary voltage in Volts")
    current_primary_a: Optional[float] = Field(None, gt=0, description="Primary current in Amperes")
    current_secondary_a: Optional[float] = Field(None, gt=0, description="Secondary current in Amperes")
    phase_type: Literal['single', 'three'] = Field(default='three', description="Single-phase or three-phase")
    
    @model_validator(mode='after')
    def validate_inputs(self):
        """Validate that sufficient parameters are provided"""
        provided = sum([
            self.apparent_power_kva is not None,
            self.voltage_primary_v is not None and self.current_primary_a is not None,
            self.voltage_secondary_v is not None and self.current_secondary_a is not None,
        ])
        if provided == 0:
            raise ValueError("Must provide either: power, or (voltage + current) for primary or secondary")
        return self


class TransformerSizingOutput(BaseModel):
    """Output schema for Transformer Sizing Calculation"""
    apparent_power_kva: float = Field(..., description="Apparent power in kVA")
    apparent_power_mva: float = Field(..., description="Apparent power in MVA")
    current_primary_a: float = Field(..., description="Primary current in Amperes")
    current_secondary_a: float = Field(..., description="Secondary current in Amperes")
    recommended_standard_size_kva: float = Field(..., description="Recommended standard transformer size")


class TransformerLossesInput(CalculationInput):
    """
    Input schema for Transformer Losses Calculation
    
    Based on IEC 60076
    """
    no_load_loss_w: float = Field(..., ge=0, description="No-load loss (core loss) in Watts")
    load_loss_w: float = Field(..., ge=0, description="Load loss (copper loss) at rated load in Watts")
    load_factor: float = Field(default=1.0, ge=0, le=1.5, description="Actual load / Rated load")
    operating_hours_per_year: int = Field(default=8760, ge=0, description="Annual operating hours")
    energy_cost_per_kwh: float = Field(default=0.12, gt=0, description="Energy cost in USD/kWh")


class TransformerLossesOutput(BaseModel):
    """Output schema for Transformer Losses Calculation"""
    total_losses_w: float = Field(..., description="Total losses at current load in Watts")
    total_losses_kw: float = Field(..., description="Total losses at current load in kW")
    annual_energy_loss_kwh: float = Field(..., description="Annual energy loss in kWh")
    annual_cost_usd: float = Field(..., description="Annual cost of losses in USD")
    efficiency_percent: float = Field(..., description="Transformer efficiency at current load")


class TransformerRegulationInput(CalculationInput):
    """
    Input schema for Voltage Regulation Calculation
    
    Based on IEC 60076
    """
    impedance_percent: float = Field(..., gt=0, le=20, description="Impedance voltage percentage")
    power_factor: float = Field(..., ge=0, le=1, description="Load power factor")
    load_percent: float = Field(default=100, ge=0, le=150, description="Load as percentage of rated")


class TransformerRegulationOutput(BaseModel):
    """Output schema for Voltage Regulation Calculation"""
    voltage_regulation_percent: float = Field(..., description="Voltage regulation percentage")
    secondary_voltage_v: Optional[float] = Field(None, description="Secondary voltage at load (if rated voltage provided)")


class KFactorInput(CalculationInput):
    """
    Input schema for K-Factor Calculation
    
    Based on IEEE C57.110
    """
    harmonic_currents: dict[int, float] = Field(..., description="Dictionary of harmonic order -> current (as % of fundamental)")
    
    @model_validator(mode='after')
    def validate_harmonics(self):
        """Validate harmonic orders are valid"""
        for order in self.harmonic_currents.keys():
            if order < 1:
                raise ValueError(f"Invalid harmonic order: {order}. Must be >= 1")
        return self


class KFactorOutput(BaseModel):
    """Output schema for K-Factor Calculation"""
    k_factor: float = Field(..., description="Calculated K-Factor")
    derating_factor: float = Field(..., description="Transformer derating factor for non-linear loads")
    recommended_k_factor_rating: int = Field(..., description="Recommended K-Factor rating (4, 9, 13, 20, 30, 40, 50)")
