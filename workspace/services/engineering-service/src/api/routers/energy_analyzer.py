# src/api/routers/energy_analyzer.py
"""
EA-001: Energy Analyzer Endpoints

POST /api/v1/engineering/energy/analyze
"""

from fastapi import APIRouter, HTTPException
from src.calculators.energy_analyzer import EnergyAnalyzerCalculator, EnergyAnalyzerInput

router = APIRouter(prefix="/api/v1/engineering", tags=["Energy Analyzer"])

_analyzer = EnergyAnalyzerCalculator()


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
async def analyze_energy(inputs: EnergyAnalyzerInput):
    try:
        result = _analyzer.calculate(inputs)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={"code": "VALIDATION_ERROR", "message": str(e)},
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "CALCULATION_ERROR", "message": str(e)},
        )
