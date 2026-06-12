"""
Cable Engineering API Routes

Endpoints for cable sizing calculations based on IEC standards
"""

from fastapi import APIRouter, Request
from typing import Dict, Any

from src.calculators.cable.schemas import (
    CableSizingInput,
    VoltageDropInput,
    ShortCircuitInput,
    PEConductorInput,
)


router = APIRouter()


def execute_calculation(request: Request, calculation_code: str, input_data: Dict[str, Any], model_class) -> Dict[str, Any]:
    """
    Execute a calculation by code with unified response format
    
    Args:
        request: FastAPI request object
        calculation_code: Code of the calculator (e.g., "CABLE-001")
        input_data: Dictionary of input parameters
        model_class: Pydantic model class to validate input data
    """
    registry = request.app.state.registry
    calculator_class = registry.get(calculation_code)
    calculator = calculator_class()
    
    # Convert dict to Pydantic model
    inputs = model_class(**input_data)
    
    result = calculator.execute(inputs)
    
    return {
        "success": True,
        "data": result.model_dump(),
        "meta": {
            "engine_version": calculator.ENGINE_VERSION,
        }
    }


# ============================================================================
# CABLE-001: Cable Ampacity Sizing
# ============================================================================

@router.post(
    "/sizing",
    summary="Cable Ampacity Sizing",
    description="Calculate minimum cable size based on load current, installation method, and correction factors.",
)
async def cable_sizing(request: Request, inputs: CableSizingInput) -> Dict[str, Any]:
    """
    Cable Ampacity Sizing according to IEC 60364-5-52
    """
    return execute_calculation(request, "CABLE-001", inputs.model_dump(), CableSizingInput)


# ============================================================================
# CABLE-002: Voltage Drop Calculation
# ============================================================================

@router.post(
    "/voltage-drop",
    summary="Voltage Drop Calculator",
    description="Calculate voltage drop for single-phase and three-phase systems.",
)
async def voltage_drop(request: Request, inputs: VoltageDropInput) -> Dict[str, Any]:
    """
    Voltage Drop Calculation according to IEC 60364-5-52
    """
    return execute_calculation(request, "CABLE-002", inputs.model_dump(), VoltageDropInput)


# ============================================================================
# CABLE-003: Short Circuit Withstand
# ============================================================================

@router.post(
    "/short-circuit",
    summary="Short Circuit Withstand",
    description="Calculate minimum cable size for short circuit thermal withstand.",
)
async def short_circuit(request: Request, inputs: ShortCircuitInput) -> Dict[str, Any]:
    """
    Short Circuit Withstand Calculation according to IEC 60949
    """
    return execute_calculation(request, "CABLE-003", inputs.model_dump(), ShortCircuitInput)


# ============================================================================
# CABLE-004: PE Conductor Sizing
# ============================================================================

@router.post(
    "/pe-sizing",
    summary="PE Conductor Sizing",
    description="Calculate minimum protective earth conductor size.",
)
async def pe_sizing(request: Request, inputs: PEConductorInput) -> Dict[str, Any]:
    """
    Protective Earth Conductor Sizing according to IEC 60364-5-54 Table 54.3
    """
    return execute_calculation(request, "CABLE-004", inputs.model_dump(), PEConductorInput)
