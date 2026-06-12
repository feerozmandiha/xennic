"""
Engineering Tools for PydanticAI Agent

These tools provide the agent with ability to perform engineering calculations
by calling the Engineering Service API.
"""

from typing import Dict, Any, Optional
from pydantic_ai import RunContext
from pydantic import Field
import json

from ...tools.calculation_tool import CalculationTool
from ...config.settings import settings


# Initialize calculation tool
calc_tool = CalculationTool(settings.ENGINEERING_SERVICE_URL)


# ============================================================================
# Basic Electrical Tools
# ============================================================================

async def calculate_ohms_law(
    ctx: RunContext,
    voltage_v: Optional[float] = Field(None, description="Voltage in Volts (V)"),
    current_a: Optional[float] = Field(None, description="Current in Amperes (A)"),
    resistance_ohm: Optional[float] = Field(None, description="Resistance in Ohms (Ω)"),
) -> Dict[str, Any]:
    """
    Calculate Ohm's Law: V = I × R
    
    Provide exactly two of the three parameters.
    
    Examples:
    - Calculate voltage: {"current_a": 10, "resistance_ohm": 5} -> 50V
    - Calculate current: {"voltage_v": 230, "resistance_ohm": 23} -> 10A
    - Calculate resistance: {"voltage_v": 230, "current_a": 10} -> 23Ω
    """
    # Validate that exactly two parameters are provided
    provided = sum(1 for v in [voltage_v, current_a, resistance_ohm] if v is not None)
    if provided != 2:
        return {
            "error": "Exactly two parameters must be provided",
            "provided": provided,
            "required": 2
        }
    
    inputs = {}
    if voltage_v is not None:
        inputs["voltage_v"] = voltage_v
    if current_a is not None:
        inputs["current_a"] = current_a
    if resistance_ohm is not None:
        inputs["resistance_ohm"] = resistance_ohm
    
    result = await calc_tool.calculate("BASIC-001", inputs)
    return result.get("data", {}).get("results", {})


async def calculate_active_power(
    ctx: RunContext,
    voltage_v: float = Field(..., description="Voltage in Volts (V)"),
    current_a: float = Field(..., description="Current in Amperes (A)"),
    power_factor: float = Field(..., description="Power factor (0 to 1)"),
    phase_type: str = Field(default="three", description="Phase type: 'single' or 'three'"),
) -> Dict[str, Any]:
    """
    Calculate Active Power (Real Power): P = V × I × PF
    
    For three-phase systems: P = √3 × V × I × PF
    """
    inputs = {
        "voltage_v": voltage_v,
        "current_a": current_a,
        "power_factor": power_factor,
        "phase_type": phase_type,
    }
    result = await calc_tool.calculate("BASIC-002", inputs)
    return result.get("data", {}).get("results", {})


async def calculate_apparent_power(
    ctx: RunContext,
    voltage_v: float = Field(..., description="Voltage in Volts (V)"),
    current_a: float = Field(..., description="Current in Amperes (A)"),
    phase_type: str = Field(default="three", description="Phase type: 'single' or 'three'"),
) -> Dict[str, Any]:
    """
    Calculate Apparent Power: S = V × I
    
    For three-phase systems: S = √3 × V × I
    """
    inputs = {
        "voltage_v": voltage_v,
        "current_a": current_a,
        "phase_type": phase_type,
    }
    result = await calc_tool.calculate("BASIC-003", inputs)
    return result.get("data", {}).get("results", {})


async def calculate_reactive_power(
    ctx: RunContext,
    active_power_w: float = Field(..., description="Active power in Watts (W)"),
    apparent_power_va: float = Field(..., description="Apparent power in VA"),
) -> Dict[str, Any]:
    """
    Calculate Reactive Power: Q = √(S² - P²)
    """
    inputs = {
        "active_power_w": active_power_w,
        "apparent_power_va": apparent_power_va,
    }
    result = await calc_tool.calculate("BASIC-004", inputs)
    return result.get("data", {}).get("results", {})


async def calculate_power_factor(
    ctx: RunContext,
    active_power_w: float = Field(..., description="Active power in Watts (W)"),
    apparent_power_va: float = Field(..., description="Apparent power in VA"),
) -> Dict[str, Any]:
    """
    Calculate Power Factor: PF = P / S
    """
    inputs = {
        "active_power_w": active_power_w,
        "apparent_power_va": apparent_power_va,
    }
    result = await calc_tool.calculate("BASIC-005", inputs)
    return result.get("data", {}).get("results", {})


# ============================================================================
# Cable Engineering Tools
# ============================================================================

async def calculate_cable_sizing(
    ctx: RunContext,
    load_current: float = Field(..., description="Load current in Amperes (A)"),
    conductor_material: str = Field(default="copper", description="copper or aluminum"),
    insulation_type: str = Field(default="XLPE", description="PVC, XLPE, or EPR"),
    installation_method: str = Field(default="C", description="Installation method: B2 (conduit) or C (on wall)"),
    ambient_temperature: float = Field(default=30.0, description="Ambient temperature in °C"),
    number_of_circuits: int = Field(default=1, description="Number of circuits in proximity"),
) -> Dict[str, Any]:
    """
    Calculate minimum cable size based on load current and installation conditions.
    
    Based on IEC 60364-5-52.
    
    Examples:
    - 100A load, copper, PVC, on wall -> minimum cable size 35mm²
    """
    inputs = {
        "load_current": load_current,
        "conductor_material": conductor_material,
        "insulation_type": insulation_type,
        "installation_method": installation_method,
        "ambient_temperature": ambient_temperature,
        "number_of_circuits": number_of_circuits,
    }
    result = await calc_tool.calculate("CABLE-001", inputs)
    return result.get("data", {}).get("results", {})


async def calculate_voltage_drop(
    ctx: RunContext,
    voltage_v: float = Field(..., description="System voltage in Volts (V)"),
    current_a: float = Field(..., description="Load current in Amperes (A)"),
    cable_length_m: float = Field(..., description="Cable length in meters (m)"),
    cable_size_mm2: float = Field(..., description="Cable cross-sectional area in mm²"),
    conductor_material: str = Field(default="copper", description="copper or aluminum"),
    power_factor: float = Field(default=0.85, description="Load power factor (0 to 1)"),
    phase_type: str = Field(default="three", description="Phase type: 'single' or 'three'"),
) -> Dict[str, Any]:
    """
    Calculate voltage drop for a cable.
    
    Based on IEC 60364-5-52.
    
    Example:
    - 400V, 100A, 50m, 35mm² copper -> voltage drop ~1.2%
    """
    inputs = {
        "voltage_v": voltage_v,
        "current_a": current_a,
        "cable_length_m": cable_length_m,
        "cable_size_mm2": cable_size_mm2,
        "conductor_material": conductor_material,
        "power_factor": power_factor,
        "phase_type": phase_type,
    }
    result = await calc_tool.calculate("CABLE-002", inputs)
    return result.get("data", {}).get("results", {})


async def calculate_short_circuit_withstand(
    ctx: RunContext,
    short_circuit_current_ka: float = Field(..., description="Short circuit current in kA"),
    fault_duration_s: float = Field(..., description="Fault duration in seconds (s)"),
    conductor_material: str = Field(default="copper", description="copper or aluminum"),
    insulation_type: str = Field(default="XLPE", description="PVC, XLPE, or EPR"),
) -> Dict[str, Any]:
    """
    Calculate minimum cable size for short circuit thermal withstand.
    
    Based on IEC 60949.
    """
    inputs = {
        "short_circuit_current_ka": short_circuit_current_ka,
        "fault_duration_s": fault_duration_s,
        "conductor_material": conductor_material,
        "insulation_type": insulation_type,
    }
    result = await calc_tool.calculate("CABLE-003", inputs)
    return result.get("data", {}).get("results", {})


# ============================================================================
# Transformer Engineering Tools
# ============================================================================

async def calculate_transformer_sizing(
    ctx: RunContext,
    apparent_power_kva: Optional[float] = Field(None, description="Apparent power in kVA"),
    voltage_primary_v: Optional[float] = Field(None, description="Primary voltage in Volts (V)"),
    voltage_secondary_v: Optional[float] = Field(None, description="Secondary voltage in Volts (V)"),
    phase_type: str = Field(default="three", description="Phase type: 'single' or 'three'"),
) -> Dict[str, Any]:
    """
    Calculate transformer sizing: kVA, primary/secondary currents.
    
    Provide either (apparent_power_kva + voltage_primary_v + voltage_secondary_v)
    or (voltage_primary_v + voltage_secondary_v + current_primary_a or current_secondary_a).
    
    Based on IEC 60076.
    """
    inputs = {
        "phase_type": phase_type,
    }
    if apparent_power_kva is not None:
        inputs["apparent_power_kva"] = apparent_power_kva
    if voltage_primary_v is not None:
        inputs["voltage_primary_v"] = voltage_primary_v
    if voltage_secondary_v is not None:
        inputs["voltage_secondary_v"] = voltage_secondary_v
    
    result = await calc_tool.calculate("TRF-001", inputs)
    return result.get("data", {}).get("results", {})


async def calculate_transformer_losses(
    ctx: RunContext,
    no_load_loss_w: float = Field(..., description="No-load loss (core loss) in Watts (W)"),
    load_loss_w: float = Field(..., description="Load loss at rated load in Watts (W)"),
    load_factor: float = Field(default=1.0, description="Actual load / Rated load (0 to 1.5)"),
    operating_hours_per_year: int = Field(default=8760, description="Annual operating hours"),
    energy_cost_per_kwh: float = Field(default=0.12, description="Energy cost in USD/kWh"),
) -> Dict[str, Any]:
    """
    Calculate transformer losses, efficiency, and annual cost.
    
    Based on IEC 60076.
    """
    inputs = {
        "no_load_loss_w": no_load_loss_w,
        "load_loss_w": load_loss_w,
        "load_factor": load_factor,
        "operating_hours_per_year": operating_hours_per_year,
        "energy_cost_per_kwh": energy_cost_per_kwh,
    }
    result = await calc_tool.calculate("TRF-002", inputs)
    return result.get("data", {}).get("results", {})
