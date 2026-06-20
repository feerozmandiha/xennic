"""
Lighting Engineering API Routes
"""

from fastapi import APIRouter, Request
from typing import Dict, Any

from src.calculators.lighting.schemas import LumenMethodInput, RoadLightingInput

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


@router.post("/lumen-method", summary="LIGHT-001: طراحی روشنایی به روش Lumen")
async def lumen_method(request: Request, inputs: LumenMethodInput) -> Dict[str, Any]:
    return execute_calc(request, "LIGHT-001", inputs, LumenMethodInput)


@router.post("/road-lighting", summary="LIGHT-002: طراحی روشنایی معابر و خیابان")
async def road_lighting(request: Request, inputs: RoadLightingInput) -> Dict[str, Any]:
    return execute_calc(request, "LIGHT-002", inputs, RoadLightingInput)
