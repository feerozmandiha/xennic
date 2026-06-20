"""
Switchgear Engineering API Routes

Endpoints for switchgear and main switch selection based on IEC 61439-1.
"""

from fastapi import APIRouter, Request
from typing import Dict, Any

from src.calculators.switchgear.schemas import MainSwitchInput

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


# ── SWT-001 ──────────────────────────────────────────────────────────────────
@router.post("/main-switch", summary="SWT-001: کلید اصلی (Main Switch/Incomer)")
async def main_switch(request: Request, inputs: MainSwitchInput) -> Dict[str, Any]:
    return execute_calc(request, "SWT-001", inputs, MainSwitchInput)
