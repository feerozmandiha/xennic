"""
Transformer Engineering API Routes
"""

from fastapi import APIRouter, Request
from typing import Dict, Any

from src.calculators.transformer.schemas import (
    TransformerSizingInput,
    TransformerLossesInput,
    TransformerRegulationInput,
    KFactorInput,
    TransformerEfficiencyInput,
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
        "meta": {"engine_version": calculator.ENGINE_VERSION},
    }


@router.post("/sizing", summary="Transformer Sizing", description="Calculate transformer kVA and currents")
async def transformer_sizing(request: Request, inputs: TransformerSizingInput) -> Dict[str, Any]:
    return execute_calculation(request, "TRF-001", inputs.model_dump(), TransformerSizingInput)


@router.post("/losses", summary="Transformer Losses", description="Calculate transformer losses and efficiency")
async def transformer_losses(request: Request, inputs: TransformerLossesInput) -> Dict[str, Any]:
    return execute_calculation(request, "TRF-002", inputs.model_dump(), TransformerLossesInput)


@router.post("/regulation", summary="Voltage Regulation", description="Calculate transformer voltage regulation")
async def transformer_regulation(request: Request, inputs: TransformerRegulationInput) -> Dict[str, Any]:
    return execute_calculation(request, "TRF-003", inputs.model_dump(), TransformerRegulationInput)


@router.post("/k-factor", summary="K-Factor Calculator", description="Calculate K-Factor for non-linear loads")
async def k_factor(request: Request, inputs: KFactorInput) -> Dict[str, Any]:
    return execute_calculation(request, "TRF-004", inputs.model_dump(), KFactorInput)


@router.post("/efficiency", summary="Transformer Energy Efficiency", description="Validate losses against EU 548/2014 Tier 1 & Tier 2 limits")
async def transformer_efficiency(request: Request, inputs: TransformerEfficiencyInput) -> Dict[str, Any]:
    return execute_calculation(request, "TRF-005", inputs.model_dump(), TransformerEfficiencyInput)
