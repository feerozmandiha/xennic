"""
Power System Studies API Routes

PS-001: Load Flow Analysis (IEC 60909 / IEEE 399)
PS-002: Short Circuit Analysis (IEC 60909-0)
PS-003: Motor Starting Analysis (IEEE 399 / NEMA MG-1)
PS-004: Busbar Sizing (IEC 61439-1)
"""

from typing import Any, Dict

from fastapi import APIRouter, Request

from src.schemas.power_system import (
    BusbarSizingInput,
    LoadFlowInput,
    MotorStartingInput,
    ShortCircuitInput,
)

router = APIRouter()


def execute_calculation(request: Request, calculation_code: str, input_data: Dict[str, Any], model_class) -> Dict[str, Any]:
    registry = request.app.state.registry
    calculator_class = registry.get(calculation_code)
    calculator = calculator_class()
    inputs = model_class(**input_data)
    result = calculator.execute(inputs)
    return {
        "success": True,
        "data": result.model_dump(),
        "meta": {
            "engine_version": calculator.ENGINE_VERSION,
        }
    }


@router.post(
    "/load-flow",
    summary="PS-001: Load Flow Analysis",
    description="Perform load flow (power flow) analysis using Newton-Raphson or Backward-Forward Sweep",
)
async def load_flow(request: Request, payload: LoadFlowInput):
    return execute_calculation(request, "PS-001", payload.model_dump(), LoadFlowInput)


@router.post(
    "/short-circuit",
    summary="PS-002: Short Circuit Analysis",
    description="Calculate three-phase and single-phase short-circuit currents per IEC 60909-0",
)
async def short_circuit(request: Request, payload: ShortCircuitInput):
    return execute_calculation(request, "PS-002", payload.model_dump(), ShortCircuitInput)


@router.post(
    "/motor-starting",
    summary="PS-003: Motor Starting Analysis",
    description="Evaluate voltage dip during motor start and acceleration time",
)
async def motor_starting(request: Request, payload: MotorStartingInput):
    return execute_calculation(request, "PS-003", payload.model_dump(), MotorStartingInput)


@router.post(
    "/busbar-sizing",
    summary="PS-004: Busbar Sizing",
    description="Thermal and electrodynamic busbar sizing per IEC 61439-1",
)
async def busbar_sizing(request: Request, payload: BusbarSizingInput):
    return execute_calculation(request, "PS-004", payload.model_dump(), BusbarSizingInput)
