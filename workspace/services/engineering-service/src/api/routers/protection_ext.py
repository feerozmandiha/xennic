# src/api/routers/protection_ext.py
"""
Extended Protection Endpoints:
  POST /api/v1/engineering/protection/short-circuit   — SC-001
  POST /api/v1/engineering/protection/arc-flash        — PROT-002
  POST /api/v1/engineering/protection/grounding        — GND-001
"""

from fastapi import APIRouter, HTTPException

from src.calculators.protection.short_circuit import ShortCircuitCalculator, ShortCircuitInput
from src.calculators.protection.arc_flash      import ArcFlashCalculator,    ArcFlashInput
from src.calculators.protection.grounding      import GroundingCalculator,   GroundingInput

router = APIRouter(prefix="/api/v1/engineering/protection", tags=["Protection Extended"])

_sc  = ShortCircuitCalculator()
_af  = ArcFlashCalculator()
_gnd = GroundingCalculator()


# ── SC-001 ────────────────────────────────────────────────────────────────────
@router.post("/short-circuit", summary="SC-001: محاسبه اتصال کوتاه — IEC 60909")
async def short_circuit(inputs: ShortCircuitInput):
    try:
        return _sc.calculate(inputs)
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR",   "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "CALCULATION_ERROR",  "message": str(e)})


# ── PROT-002 ──────────────────────────────────────────────────────────────────
@router.post("/arc-flash", summary="PROT-002: آنالیز قوس الکتریکی — IEEE 1584-2018")
async def arc_flash(inputs: ArcFlashInput):
    try:
        return _af.calculate(inputs)
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR",   "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "CALCULATION_ERROR",  "message": str(e)})


# ── GND-001 ───────────────────────────────────────────────────────────────────
@router.post("/grounding", summary="GND-001: طراحی سیستم زمین — IEC 60364-5-54")
async def grounding(inputs: GroundingInput):
    try:
        return _gnd.calculate(inputs)
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR",   "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "CALCULATION_ERROR",  "message": str(e)})
