# src/api/routers/protection_ext.py
"""
Extended Protection Endpoints:
  POST /api/v1/engineering/protection/short-circuit   — SC-001
  POST /api/v1/engineering/protection/arc-flash        — PROT-002
  POST /api/v1/engineering/protection/grounding        — GND-001
  POST /api/v1/engineering/protection/selectivity      — PROT-003
"""

from fastapi import APIRouter, Request
from typing import Dict, Any

from src.calculators.protection.short_circuit import ShortCircuitCalculator, ShortCircuitInput
from src.calculators.protection.arc_flash      import ArcFlashCalculator,    ArcFlashInput
from src.calculators.protection.grounding      import GroundingCalculator,   GroundingInput
from src.calculators.protection.fuse_selection  import FuseSelectionCalculator, FuseSelectionInput
from src.calculators.protection.selectivity    import SelectivityCalculator, SelectivityInput
from src.calculators.protection.coordination   import ProtectionCoordinationCalculator
from src.calculators.protection.schemas        import ProtectionCoordinationInput, ArcIncidentInput

router = APIRouter(prefix="/api/v1/engineering/protection", tags=["Protection Extended"])


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


# ── SC-001 ────────────────────────────────────────────────────────────────────
@router.post("/short-circuit", summary="SC-001: محاسبه اتصال کوتاه — IEC 60909")
async def short_circuit(request: Request, inputs: ShortCircuitInput) -> Dict[str, Any]:
    return execute_calc(request, "SC-001", inputs, ShortCircuitInput)


# ── PROT-002 ──────────────────────────────────────────────────────────────────
@router.post("/arc-flash", summary="PROT-002: آنالیز قوس الکتریکی — IEEE 1584-2018")
async def arc_flash(request: Request, inputs: ArcFlashInput) -> Dict[str, Any]:
    return execute_calc(request, "PROT-002", inputs, ArcFlashInput)


# ── GND-001 ───────────────────────────────────────────────────────────────────
@router.post("/grounding", summary="GND-001: طراحی سیستم زمین — IEC 60364-5-54")
async def grounding(request: Request, inputs: GroundingInput) -> Dict[str, Any]:
    return execute_calc(request, "GND-001", inputs, GroundingInput)


# ── PROT-003 ──────────────────────────────────────────────────────────────────
@router.post("/selectivity", summary="PROT-003: آنالیز سلکتیویته — IEC 60947-2")
async def selectivity(request: Request, inputs: SelectivityInput) -> Dict[str, Any]:
    return execute_calc(request, "PROT-003", inputs, SelectivityInput)


# ── PROT-004 ──────────────────────────────────────────────────────────────────
@router.post("/fuse-selection", summary="PROT-004: انتخاب فیوز — IEC 60269")
async def fuse_selection(request: Request, inputs: FuseSelectionInput) -> Dict[str, Any]:
    return execute_calc(request, "PROT-004", inputs, FuseSelectionInput)


# ── PROT-005 ──────────────────────────────────────────────────────────────────
@router.post("/coordination", summary="PROT-005: مطالعه هماهنگی حفاظتی — IEC 60255-151")
async def coordination(request: Request, inputs: ProtectionCoordinationInput) -> Dict[str, Any]:
    return execute_calc(request, "PROT-005", inputs, ProtectionCoordinationInput)


# ── ARC-001 ──────────────────────────────────────────────────────────────────
@router.post("/arc-incident", summary="ARC-001: انرژی وقوعی (قوس الکتریکی) — IEEE 1584-2018 / NFPA 70E")
async def arc_incident(request: Request, inputs: ArcIncidentInput) -> Dict[str, Any]:
    return execute_calc(request, "ARC-001", inputs, ArcIncidentInput)
