"""
Grounding Grid Design - Pydantic Schemas

Based on IEEE Std 80-2013.
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field
from src.core.base_calculator import CalculationInput


BODY_WEIGHTS = Literal[50, 70]
CONDUCTOR_MATERIALS = Literal['copper', 'copperweld', 'steel', 'aluminum']


class GroundingGridInput(CalculationInput):
    grid_length_m: float = Field(..., gt=0, le=500, description="Grid length (m)")
    grid_width_m: float = Field(..., gt=0, le=500, description="Grid width (m)")
    n_conductors_x: int = Field(..., ge=2, le=100, description="Number of conductors in X direction")
    n_conductors_y: int = Field(..., ge=2, le=100, description="Number of conductors in Y direction")
    burial_depth_m: float = Field(default=0.5, ge=0.1, le=3.0, description="Conductor burial depth (m)")
    conductor_diameter_mm: float = Field(default=14.0, ge=4, le=50, description="Conductor diameter (mm)")
    conductor_material: CONDUCTOR_MATERIALS = Field(default='copper', description="Conductor material")
    soil_resistivity_ohm_m: float = Field(..., gt=0, le=100000, description="Uniform soil resistivity (Ω·m)")
    surface_resistivity_ohm_m: float = Field(default=3000.0, gt=0, description="Surface layer (crushed rock) resistivity (Ω·m)")
    surface_thickness_m: float = Field(default=0.15, ge=0, le=1.0, description="Surface layer thickness (m)")
    max_fault_current_a: float = Field(..., gt=0, description="Maximum grid fault current (A)")
    fault_duration_s: float = Field(..., gt=0, le=10, description="Fault duration (s)")
    current_division_factor: float = Field(default=0.6, gt=0, le=1.0, description="Fault current division factor Sf")
    xr_ratio: float = Field(default=15.0, gt=0, description="X/R ratio at fault location")
    body_weight: BODY_WEIGHTS = Field(default=70, description="Body weight for allowable voltage calculation (50 or 70 kg)")
    has_ground_rods: bool = Field(default=True, description="Whether perimeter ground rods are included")
    rod_length_m: float = Field(default=3.0, ge=0, le=30, description="Ground rod length (m)")
    n_rods_per_node: int = Field(default=1, ge=0, le=10, description="Ground rods per perimeter node")


class GroundingGridOutput(BaseModel):
    grid_area_m2: float = Field(..., description="Grid area (m²)")
    total_conductor_length_m: float = Field(..., description="Total conductor length (m)")
    grid_resistance_ohm: float = Field(..., description="Grid resistance (Ω)")
    max_gpr_v: float = Field(..., description="Maximum Grid Potential Rise (V)")
    fault_current_grid_a: float = Field(..., description="Fault current dissipated by grid (A)")
    allowable_step_v: float = Field(..., description="Maximum allowable step voltage (V)")
    allowable_touch_v: float = Field(..., description="Maximum allowable touch voltage (V)")
    actual_mesh_voltage_v: float = Field(..., description="Actual maximum mesh (touch) voltage (V)")
    actual_step_voltage_v: float = Field(..., description="Actual maximum step voltage (V)")
    touch_voltage_safe: bool = Field(..., description="Whether actual touch < allowable")
    step_voltage_safe: bool = Field(..., description="Whether actual step < allowable")
    touch_margin_pct: float = Field(..., description="Touch voltage margin (%)")
    step_margin_pct: float = Field(..., description="Step voltage margin (%)")
    effective_conductors_n: float = Field(..., description="Effective number of parallel conductors")
    conductor_spacing_x_m: float = Field(..., description="Conductor spacing in X direction (m)")
    conductor_spacing_y_m: float = Field(..., description="Conductor spacing in Y direction (m)")
    total_conductor_weight_kg: float = Field(..., description="Total conductor weight (kg)")
    total_rod_length_m: Optional[float] = Field(None, description="Total ground rod length (m)")
    surface_derating_cs: float = Field(..., description="Surface layer derating factor Cs")
    recommendation_notes: list[str] = Field(default_factory=list, description="Additional recommendations")
    standard_reference: str = Field(default="IEEE Std 80-2013", description="Applicable standard")
