"""
Protection Engineering API Routes
"""

from fastapi import APIRouter, Request
from typing import Dict, Any

from src.calculators.protection.schemas import MCCBSelectionInput

router = APIRouter()


def execute_calculation(request: Request, calculation_code: str, input_data: Dict[str, Any], model_class) -> Dict[str, Any]:
    """Execute a calculation by code with unified response format"""
    registry = request.app.state.registry
    calculator_class = registry.get(calculation_code)
    calculator = calculator_class()
    inputs = model_class(**input_data)
    result = calculator.execute(inputs)
    return {
        "success": True,
        "data": result.model_dump(),
        "meta": {"engine_version": calculator.ENGINE_VERSION},
    }


@router.post(
    "/mccb-selection",
    summary="MCCB/ACB Selection",
    description="Select appropriate circuit breaker based on load current and short-circuit current",
)
async def mccb_selection(request: Request, inputs: MCCBSelectionInput) -> Dict[str, Any]:
    """
    MCCB/ACB Selection according to IEC 60947-2
    
    - Rated current (I_n) ≥ Load current × 1.25
    - Breaking capacity (I_cu) ≥ Short-circuit current
    - Temperature derating applied
    """
    return execute_calculation(request, "PROT-001", inputs.model_dump(), MCCBSelectionInput)
