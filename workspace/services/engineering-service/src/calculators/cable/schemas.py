"""
Cable Engineering - Pydantic Schemas

Input and output schemas for all cable calculations
"""

from typing import Dict, Literal, Optional
from pydantic import BaseModel, Field, model_validator
from src.core.base_calculator import CalculationInput


class CableSizingInput(CalculationInput):
    """
    Input schema for Cable Sizing Calculation
    
    Based on IEC 60364-5-52
    """
    load_current: float = Field(..., gt=0, description="Load current in Amperes")
    installation_method: Literal['B2', 'C'] = Field(
        default='C',
        description="Installation method: B2 (conduit) or C (on wall/free air)"
    )
    ambient_temperature: float = Field(
        default=30.0,
        ge=-20,
        le=80,
        description="Ambient temperature in degrees Celsius"
    )
    conductor_material: Literal['copper', 'aluminum'] = Field(
        default='copper',
        description="Conductor material"
    )
    insulation_type: Literal['PVC', 'XLPE'] = Field(
        default='XLPE',
        description="Insulation type"
    )
    number_of_circuits: int = Field(
        default=1,
        ge=1,
        le=10,
        description="Number of circuits in close proximity"
    )
    
    @model_validator(mode='after')
    def validate_temperature_range(self):
        """Validate temperature is within insulation limits"""
        if self.insulation_type == 'PVC' and self.ambient_temperature > 70:
            raise ValueError(f"PVC insulation max temperature is 70°C, got {self.ambient_temperature}")
        if self.insulation_type == 'XLPE' and self.ambient_temperature > 90:
            raise ValueError(f"XLPE insulation max temperature is 90°C, got {self.ambient_temperature}")
        return self


class CableSizingOutput(BaseModel):
    """Output schema for Cable Sizing Calculation"""
    minimum_cable_size: float = Field(..., description="Minimum cross-sectional area in mm²")
    recommended_cable_size: float = Field(..., description="Recommended cable size in mm²")
    base_ampacity: float = Field(..., description="Base current-carrying capacity from table (A)")
    corrected_ampacity: float = Field(..., description="Ampacity after correction factors (A)")
    temperature_correction_factor: float = Field(..., description="Correction factor for temperature")
    grouping_correction_factor: float = Field(..., description="Correction factor for grouping")
    safety_margin: float = Field(..., description="Safety margin percentage")


class VoltageDropInput(CalculationInput):
    """
    Input schema for Voltage Drop Calculation
    
    Based on IEC 60364-5-52
    """
    voltage_v: float = Field(..., gt=0, description="System voltage in Volts")
    current_a: float = Field(..., gt=0, description="Load current in Amperes")
    cable_length_m: float = Field(..., gt=0, le=10000, description="Cable length in meters")
    cable_size_mm2: float = Field(..., gt=0, description="Cable cross-sectional area in mm²")
    conductor_material: Literal['copper', 'aluminum'] = Field(
        default='copper',
        description="Conductor material"
    )
    power_factor: float = Field(
        default=0.85,
        ge=0.1,
        le=1.0,
        description="Load power factor"
    )
    phase_type: Literal['single', 'three'] = Field(
        default='three',
        description="System type: single-phase or three-phase"
    )
    
    @model_validator(mode='after')
    def validate_power_factor(self):
        if not (0 < self.power_factor <= 1):
            raise ValueError(f"Power factor must be between 0 and 1, got {self.power_factor}")
        return self


class VoltageDropOutput(BaseModel):
    """Output schema for Voltage Drop Calculation"""
    voltage_drop_v: float = Field(..., description="Voltage drop in Volts")
    voltage_drop_percent: float = Field(..., description="Voltage drop as percentage")
    is_acceptable: bool = Field(..., description="Whether voltage drop is within 5%")
    recommendation: Optional[str] = Field(None, description="Recommendation if voltage drop is too high")


class ShortCircuitInput(CalculationInput):
    """
    Input schema for Short Circuit Withstand Calculation
    
    Based on IEC 60949
    """
    short_circuit_current_ka: float = Field(..., gt=0, description="Short circuit current in kA")
    fault_duration_s: float = Field(..., gt=0, le=5, description="Fault duration in seconds")
    conductor_material: Literal['copper', 'aluminum'] = Field(
        default='copper',
        description="Conductor material"
    )
    insulation_type: Literal['PVC', 'XLPE', 'EPR'] = Field(
        default='XLPE',
        description="Insulation type"
    )


class ShortCircuitOutput(BaseModel):
    """Output schema for Short Circuit Withstand Calculation"""
    minimum_cable_size: float = Field(..., description="Minimum cable size for short circuit withstand (mm²)")
    is_sufficient: bool = Field(..., description="Whether current cable is sufficient")
    thermal_energy_joules: float = Field(..., description="Thermal energy in Joules/mm²")


class PEConductorInput(CalculationInput):
    """
    Input schema for Protective Earth Conductor Sizing
    
    Based on IEC 60364-5-54
    """
    phase_conductor_size: float = Field(..., gt=0, description="Phase conductor size in mm²")
    conductor_material: Literal['copper', 'aluminum'] = Field(
        default='copper',
        description="Phase conductor material"
    )


class CableTrayInput(CalculationInput):
    """
    Input schema for Cable Tray/Ladder Sizing

    Based on IEC 61915 / IEC 61537
    """
    tray_width_mm: float = Field(..., gt=0, description="Tray width in mm")
    tray_depth_mm: float = Field(..., gt=0, description="Tray depth/height in mm (side rail height)")
    tray_type: Literal['perforated', 'ladder', 'solid_bottom', 'wire_mesh'] = Field(
        default='perforated',
        description="Tray type affecting fill ratio limits"
    )
    cables: Dict[str, int] = Field(
        ...,
        description="Mapping of cable outer diameter (mm) -> quantity, e.g. {'15': 6, '25': 3}"
    )
    spare_percent: float = Field(
        default=20.0,
        ge=0,
        le=100,
        description="Spare capacity percentage (usually 20-30%)"
    )

    @model_validator(mode='after')
    def validate_cables(self):
        if not self.cables:
            raise ValueError("At least one cable type must be provided")
        for diam_str, qty in self.cables.items():
            try:
                diam = float(diam_str)
            except ValueError:
                raise ValueError(f"Invalid cable diameter key: '{diam_str}'. Must be a number.")
            if diam <= 0:
                raise ValueError(f"Cable diameter must be positive, got {diam}")
            if qty <= 0:
                raise ValueError(f"Cable quantity must be positive, got {qty} for diameter {diam}")
        return self


class CableTrayOutput(BaseModel):
    """Output schema for Cable Tray/Ladder Sizing"""
    tray_area_mm2: float = Field(..., description="Total cross-sectional area of tray (mm²)")
    total_cable_area_mm2: float = Field(..., description="Total cable cross-sectional area (mm²)")
    fill_ratio_percent: float = Field(..., description="Current fill ratio (%)")
    max_fill_ratio_percent: float = Field(..., description="Maximum allowed fill ratio for tray type (%)")
    within_limit: bool = Field(..., description="Whether fill ratio is within permissible limit")
    recommended_tray_width_mm: Optional[float] = Field(None, description="Recommended minimum tray width (mm)")
    remaining_area_mm2: float = Field(..., description="Remaining usable area (mm²)")


class PEConductorOutput(BaseModel):
    """Output schema for PE Conductor Sizing"""
    minimum_pe_size: float = Field(..., description="Minimum PE conductor size in mm²")
    standard_reference: str = Field(default="IEC 60364-5-54 Table 54.3")
