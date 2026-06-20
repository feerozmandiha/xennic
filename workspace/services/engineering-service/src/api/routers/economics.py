"""
Economic Analysis API Routes

ECO-001: Return on Investment (ROI)
ECO-002: Net Present Value (NPV)
ECO-003: Internal Rate of Return (IRR)
"""

from fastapi import APIRouter, Request
from typing import Dict, Any

from src.calculators.economics.roi import ROIInput
from src.calculators.economics.npv import NPVInput
from src.calculators.economics.irr import IRRInput

router = APIRouter(prefix="/api/v1/engineering/economics", tags=["Economic Analysis"])


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


@router.post("/roi", summary="ECO-001: Return on Investment (ROI)")
async def roi_calculation(request: Request, inputs: ROIInput) -> Dict[str, Any]:
    return execute_calc(request, "ECO-001", inputs, ROIInput)


@router.post("/npv", summary="ECO-002: Net Present Value (NPV)")
async def npv_calculation(request: Request, inputs: NPVInput) -> Dict[str, Any]:
    return execute_calc(request, "ECO-002", inputs, NPVInput)


@router.post("/irr", summary="ECO-003: Internal Rate of Return (IRR)")
async def irr_calculation(request: Request, inputs: IRRInput) -> Dict[str, Any]:
    return execute_calc(request, "ECO-003", inputs, IRRInput)
