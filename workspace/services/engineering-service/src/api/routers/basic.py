"""
Basic Electrical Calculations API Routes
"""

from fastapi import APIRouter, Request
from typing import Dict, Any

from src.core.registry import CalculationRegistry
from src.calculators.basic.ohms_law import OhmsLawInput
from src.calculators.basic.active_power import ActivePowerInput
from src.calculators.basic.apparent_power import ApparentPowerInput
from src.calculators.basic.reactive_power import ReactivePowerInput
from src.calculators.basic.power_factor import PowerFactorInput

router = APIRouter()


def execute_calculation(request: Request, calculation_code: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute a calculation by code with unified response format
    """
    registry = request.app.state.registry
    calculator_class = registry.get(calculation_code)
    calculator = calculator_class()
    
    # Determine input type based on calculation code
    if calculation_code == "BASIC-001":
        inputs = OhmsLawInput(**input_data)
    elif calculation_code == "BASIC-002":
        inputs = ActivePowerInput(**input_data)
    elif calculation_code == "BASIC-003":
        inputs = ApparentPowerInput(**input_data)
    elif calculation_code == "BASIC-004":
        inputs = ReactivePowerInput(**input_data)
    elif calculation_code == "BASIC-005":
        inputs = PowerFactorInput(**input_data)
    else:
        raise ValueError(f"Unknown calculation code: {calculation_code}")
    
    result = calculator.execute(inputs)
    
    return {
        "success": True,
        "data": result.model_dump(),
        "meta": {
            "engine_version": calculator.ENGINE_VERSION,
        }
    }


# BASIC-001: Ohm's Law
@router.post("/ohms-law", summary="Ohm's Law Calculator")
async def ohms_law_calculation(request: Request, inputs: OhmsLawInput) -> Dict[str, Any]:
    """Calculate voltage, current, or resistance from two parameters"""
    return execute_calculation(request, "BASIC-001", inputs.model_dump())


# BASIC-002: Active Power
@router.post("/active-power", summary="Active Power Calculator")
async def active_power_calculation(request: Request, inputs: ActivePowerInput) -> Dict[str, Any]:
    """Calculate active power in single-phase or three-phase systems"""
    return execute_calculation(request, "BASIC-002", inputs.model_dump())


# BASIC-003: Apparent Power
@router.post("/apparent-power", summary="Apparent Power Calculator")
async def apparent_power_calculation(request: Request, inputs: ApparentPowerInput) -> Dict[str, Any]:
    """Calculate apparent power in single-phase or three-phase systems"""
    return execute_calculation(request, "BASIC-003", inputs.model_dump())


# BASIC-004: Reactive Power
@router.post("/reactive-power", summary="Reactive Power Calculator")
async def reactive_power_calculation(request: Request, inputs: ReactivePowerInput) -> Dict[str, Any]:
    """Calculate reactive power from active and apparent power"""
    return execute_calculation(request, "BASIC-004", inputs.model_dump())


# BASIC-005: Power Factor
@router.post("/power-factor", summary="Power Factor Calculator")
async def power_factor_calculation(request: Request, inputs: PowerFactorInput) -> Dict[str, Any]:
    """Calculate power factor and phase angle from active and apparent power"""
    return execute_calculation(request, "BASIC-005", inputs.model_dump())