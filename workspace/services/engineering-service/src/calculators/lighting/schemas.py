"""
Lighting Engineering - Pydantic Schemas

Based on CIE 190 lumen method and EN 12464-1 illuminance recommendations.
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field, model_validator
from src.core.base_calculator import CalculationInput


TASK_TYPES = Literal[
    'office_general', 'office_desk', 'conference', 'industrial_rough',
    'industrial_medium', 'industrial_fine', 'warehouse', 'laboratory',
    'classroom', 'retail_general', 'retail_display', 'healthcare_general',
    'corridor', 'parking', 'emergency',
]

LUMINAIRE_TYPES = Literal[
    'direct', 'semi_direct', 'general_diffuse', 'semi_indirect', 'indirect',
]


class LumenMethodInput(CalculationInput):
    room_length_m: float = Field(..., gt=0, le=200, description="Room length (m)")
    room_width_m: float = Field(..., gt=0, le=200, description="Room width (m)")
    room_height_m: float = Field(..., gt=0, le=50, description="Room height (m)")
    workplane_height_m: float = Field(default=0.85, ge=0, le=10, description="Workplane height above floor (m)")
    task_type: TASK_TYPES = Field(default='office_general', description="Task/application type")
    target_illuminance_lux: Optional[float] = Field(None, gt=0, description="Custom target illuminance (lux). Overrides task_type default")
    luminaire_type: LUMINAIRE_TYPES = Field(default='direct', description="Luminaire photometric distribution")
    lamp_lumens: float = Field(..., gt=0, le=100000, description="Luminous flux per lamp (lm)")
    lamps_per_luminaire: int = Field(default=1, ge=1, le=20, description="Number of lamps per luminaire")
    luminaire_power_w: float = Field(..., gt=0, le=10000, description="Power consumption per luminaire (W)")
    light_loss_factor: float = Field(default=0.8, gt=0, le=1.0, description="Light Loss Factor / Maintenance Factor")
    reflectance_ceiling: float = Field(default=0.7, ge=0, le=1.0, description="Ceiling reflectance (0-1)")
    reflectance_wall: float = Field(default=0.5, ge=0, le=1.0, description="Wall reflectance (0-1)")
    reflectance_floor: float = Field(default=0.2, ge=0, le=1.0, description="Floor reflectance (0-1)")
    max_shr: float = Field(default=1.5, gt=0, le=3.0, description="Maximum Spacing-to-Height Ratio for the luminaire")
    mounting_height_m: Optional[float] = Field(None, gt=0, le=50, description="Mounting height above floor (m). Default: 0.15m below ceiling")
    annual_operating_hours: float = Field(default=2500, gt=0, description="Annual operating hours for energy calculation")
    maintenance_interval_years: float = Field(default=3, gt=0, description="Planned maintenance interval (years)")

    @model_validator(mode='after')
    def validate_room_geometry(self):
        hm = self.mounting_height_m or (self.room_height_m - 0.15)
        workplane_hm = hm - self.workplane_height_m
        if workplane_hm <= 0:
            raise ValueError("Mounting height must be above workplane height")
        if self.reflectance_ceiling < 0 or self.reflectance_ceiling > 1:
            raise ValueError("Ceiling reflectance must be between 0 and 1")
        return self


# ── Road Lighting (LIGHT-002) ─────────────────────────────────────────────────

ROAD_LUMINAIRE_TYPES = Literal[
    'cut_off', 'semi_cut_off', 'non_cut_off', 'LED_road', 'decorative',
]

ROAD_CLASSES = Literal[
    'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'C1', 'C2', 'P1', 'P2', 'P3',
]

ARRANGEMENT_TYPES = Literal[
    'single_sided', 'staggered', 'opposite', 'median',
]

ROAD_SURFACES = Literal[
    'dry_asphalt', 'wet_asphalt', 'dry_concrete', 'wet_concrete',
]


class RoadLightingInput(CalculationInput):
    road_width_m: float = Field(..., gt=0, le=50, description="Road width (m)")
    road_length_m: float = Field(..., gt=0, le=10000, description="Length of road section to be lit (m)")
    road_class: ROAD_CLASSES = Field(default='M3', description="Road lighting class per EN 13201-2")
    luminaire_type: ROAD_LUMINAIRE_TYPES = Field(default='LED_road', description="Luminaire photometric distribution")
    lamp_lumens: float = Field(..., gt=0, le=200000, description="Initial luminous flux per luminaire (lm)")
    luminaire_power_w: float = Field(..., gt=0, le=2000, description="Power consumption per luminaire (W)")
    light_loss_factor: float = Field(default=0.80, gt=0, le=1.0, description="Light Loss / Maintenance Factor")
    mounting_height_m: Optional[float] = Field(None, gt=0, le=30, description="Pole mounting height (m). Default: 0.8×road width")
    arrangement_type: Optional[ARRANGEMENT_TYPES] = Field(None, description="Pole arrangement. Default: auto based on W/H ratio")
    target_spacing_m: Optional[float] = Field(None, gt=0, le=100, description="Desired pole spacing (m). If blank, calculated from target luminance")
    road_surface: ROAD_SURFACES = Field(default='dry_asphalt', description="Road surface type for luminance coefficient q0")
    annual_operating_hours: float = Field(default=4000, gt=0, description="Annual night operating hours")


class RoadLightingOutput(BaseModel):
    road_class: str = Field(..., description="Selected road lighting class")
    target_luminance_cd_m2: float = Field(..., description="Target average luminance (cd/m²)")
    achieved_luminance_cd_m2: float = Field(..., description="Achieved average luminance (cd/m²)")
    recommended_spacing_m: float = Field(..., description="Recommended pole spacing (m)")
    max_spacing_m: float = Field(..., description="Maximum spacing by SHR limit (m)")
    spacing_ok: bool = Field(..., description="Whether spacing meets SHR max")
    mounting_height_m: float = Field(..., description="Mounting height (m)")
    arrangement: str = Field(..., description="Pole arrangement type")
    luminaire_type: str = Field(..., description="Luminaire photometric type")
    road_surface: str = Field(..., description="Road surface type")
    num_poles: int = Field(..., description="Number of poles required")
    pole_spacing_m: float = Field(..., description="Actual pole spacing (m)")
    installation_length_m: float = Field(..., description="Length of installation (m)")
    estimated_uniformity_u0: float = Field(..., description="Estimated overall uniformity U0")
    estimated_uniformity_ui: float = Field(..., description="Estimated longitudinal uniformity UI")
    u0_requirement: float = Field(..., description="U0 requirement from class")
    ui_requirement: float = Field(..., description="UI requirement from class")
    u0_ok: bool = Field(..., description="Whether estimated U0 meets requirement")
    ui_ok: bool = Field(..., description="Whether estimated UI meets requirement")
    estimated_ti_percent: float = Field(..., description="Estimated threshold increment TI (%)")
    ti_limit_percent: float = Field(..., description="TI limit from class (%)")
    ti_ok: bool = Field(..., description="Whether estimated TI meets requirement")
    total_power_w: float = Field(..., description="Total installed lighting power (W)")
    power_density_w_per_m2: float = Field(..., description="Installed power density (W/m²)")
    annual_energy_kwh: float = Field(..., description="Annual energy (kWh)")
    recommendation_notes: list[str] = Field(default_factory=list, description="Additional recommendations")
    standard_reference: str = Field(default="EN 13201-2:2016 / CIE 115:2010", description="Applicable standard")


# ── Lumen Method Output ───────────────────────────────────────────────────────

class LumenMethodOutput(BaseModel):
    room_index: float = Field(..., description="Room Index (RI)")
    utilization_factor: float = Field(..., description="Utilization Factor (UF)")
    required_luminaires: int = Field(..., description="Required number of luminaires")
    installed_lux: float = Field(..., description="Actual installed illuminance (lux)")
    target_illuminance_lux: float = Field(..., description="Target design illuminance (lux)")
    luminaire_rows: int = Field(..., description="Number of rows in layout")
    luminaire_columns: int = Field(..., description="Number of columns in layout")
    actual_spacing_rows_m: float = Field(..., description="Spacing between rows (m)")
    actual_spacing_columns_m: float = Field(..., description="Spacing between columns (m)")
    max_spacing_m: float = Field(..., description="Maximum permitted spacing (m)")
    spacing_ok: bool = Field(..., description="Whether spacing meets SHR max")
    total_power_w: float = Field(..., description="Total installed lighting power (W)")
    power_density_w_m2: float = Field(..., description="Installed power density (W/m²)")
    power_density_reference_w_m2: float = Field(..., description="Reference power density for task type (W/m²)")
    power_density_ok: bool = Field(..., description="Whether power density meets reference")
    annual_energy_kwh: float = Field(..., description="Annual energy consumption (kWh)")
    task_type: str = Field(..., description="Selected task type")
    luminaire_type: str = Field(..., description="Selected luminaire type")
    recommendation_notes: list[str] = Field(default_factory=list, description="Additional recommendations")
    standard_reference: str = Field(default="CIE 190 / EN 12464-1", description="Applicable standard")
