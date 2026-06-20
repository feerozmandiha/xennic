# src/api/routers/energy_analyzer.py
"""
EA-001: Energy Analyzer Endpoints

POST /api/v1/engineering/energy/analyze
"""

from fastapi import APIRouter, Request
from typing import Dict, Any

from src.calculators.energy_analyzer import EnergyAnalyzerCalculator, EnergyAnalyzerInput

router = APIRouter(prefix="/api/v1/engineering", tags=["Energy Analyzer"])


@router.post(
    "/energy/analyze",
    summary="EA-001: Energy Consumption Analyzer",
    description="""
تحلیل جامع مصرف انرژی برق با pandapower.

**ورودی**: داده‌های قبض برق (خانگی یا صنعتی)

**خروجی**:
- Load Flow با pandapower (ولتاژ، تلفات، بارگذاری)
- تحلیل ضریب قدرت و محاسبه خازن جبران‌ساز
- هزینه تعرفه و مقایسه با قبض واقعی
- شاخص کارایی انرژی (EEI)
- توصیه‌های بهینه‌سازی

**استانداردها**: IEC 61000، EN 50160، IEEE 519، تعرفه توانیر ۱۴۰۳
    """,
)
async def analyze_energy(request: Request, inputs: EnergyAnalyzerInput) -> Dict[str, Any]:
    registry = request.app.state.registry
    calculator_class = registry.get("EA-001")
    calculator = calculator_class()
    result = calculator.execute(inputs)
    return {
        "success": True,
        "data": result.model_dump(),
        "meta": {"engine_version": calculator.ENGINE_VERSION},
    }
