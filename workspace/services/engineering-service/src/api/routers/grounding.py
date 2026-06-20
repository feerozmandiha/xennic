"""
Grounding Engineering API Routes
"""

from fastapi import APIRouter, Request
from typing import Dict, Any

from src.calculators.grounding.schemas import GroundingGridInput

router = APIRouter()


def execute_calc(request: Request, code: str, input_data, model_class) -> Dict[str, Any]:
    registry = request.app.state.registry
    calculator_class = registry.get(code)
    calculator = calculator_class()
    inputs = model_class(**input_data.model_dump())
    result = calculator.execute(inputs)
    return {
        "success": True,
        "data": result.model_dump(),
        "meta": {"engine_version": calculator.ENGINE_VERSION},
    }


@router.post("/grid-design", summary="GND-002: طراحی شبکه زمین (IEEE Std 80-2013)")
async def grid_design(request: Request, inputs: GroundingGridInput) -> Dict[str, Any]:
    return execute_calc(request, "GND-002", inputs, GroundingGridInput)
