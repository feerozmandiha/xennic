# src/api/routers/power_quality.py
"""
Power Quality Engineering API Routes

Endpoints for power quality analysis based on IEEE 519-2022 and IEC 61000.
"""

from fastapi import APIRouter, Request
from typing import Dict, Any

from src.calculators.power_quality.schemas import (
    THDInput,
    TDDInput,
    KFactorPQInput,
    ResonanceInput,
    PassiveFilterInput,
    ActiveFilterInput,
)

router = APIRouter()


def _execute(request: Request, code: str, inputs, schema_class) -> Dict[str, Any]:
    """Unified calculation executor"""
    registry         = request.app.state.registry
    calculator_class = registry.get(code)
    calculator       = calculator_class()
    validated        = schema_class(**inputs.model_dump())
    result           = calculator.execute(validated)
    return {
        "success": True,
        "data":    result.model_dump(),
        "meta":    {"engine_version": calculator.ENGINE_VERSION},
    }


# ─── PQ-001: THD ─────────────────────────────────────────────────────────────

@router.post(
    "/thd",
    summary="Total Harmonic Distortion (THD)",
    description=(
        "Calculates THD for current/voltage waveforms.\n\n"
        "**Standard:** IEEE 519-2022\n"
        "**Formula:** THD = √(ΣI_h²) / I₁ × 100\n\n"
        "Provide harmonic spectrum including fundamental (order=1)."
    ),
    tags=["Power Quality"],
)
async def thd_calculation(request: Request, inputs: THDInput) -> Dict[str, Any]:
    return _execute(request, "PQ-001", inputs, THDInput)


# ─── PQ-002: TDD ─────────────────────────────────────────────────────────────

@router.post(
    "/tdd",
    summary="Total Demand Distortion (TDD)",
    description=(
        "Calculates TDD at the Point of Common Coupling (PCC).\n\n"
        "**Standard:** IEEE 519-2022\n"
        "**Formula:** TDD = √(ΣI_h²) / I_L × 100\n\n"
        "Provide harmonic spectrum **excluding** fundamental (order ≥ 2)."
    ),
    tags=["Power Quality"],
)
async def tdd_calculation(request: Request, inputs: TDDInput) -> Dict[str, Any]:
    return _execute(request, "PQ-002", inputs, TDDInput)


# ─── PQ-003: K-Factor ────────────────────────────────────────────────────────

@router.post(
    "/k-factor",
    summary="K-Factor for Non-Linear Loads",
    description=(
        "Calculates K-Factor to determine transformer rating requirement.\n\n"
        "**Standard:** UL 1561 / IEEE C57.110\n"
        "**Formula:** K = Σ(I_h² × h²) / Σ(I_h²)"
    ),
    tags=["Power Quality"],
)
async def k_factor_calculation(request: Request, inputs: KFactorPQInput) -> Dict[str, Any]:
    return _execute(request, "PQ-003", inputs, KFactorPQInput)


# ─── PQ-004: Resonance Analysis ──────────────────────────────────────────────

@router.post(
    "/resonance",
    summary="Parallel Resonance Analysis",
    description=(
        "Identifies resonance risk between capacitor banks and system impedance.\n\n"
        "**Standard:** IEC 61000-3 / IEEE 519\n"
        "**Formula:** h_r = √(kVA_sc / kVAR_cap)"
    ),
    tags=["Power Quality"],
)
async def resonance_analysis(request: Request, inputs: ResonanceInput) -> Dict[str, Any]:
    return _execute(request, "PQ-004", inputs, ResonanceInput)


# ─── PQ-005: Passive Filter Design ───────────────────────────────────────────

@router.post(
    "/passive-filter",
    summary="Single-Tuned Passive Harmonic Filter Design",
    description=(
        "Designs a single-tuned LC passive filter for a target harmonic.\n\n"
        "**Standard:** IEEE 519 / IEC 61000-4-7\n"
        "Returns: capacitor (μF), reactor (mH), and current ratings."
    ),
    tags=["Power Quality"],
)
async def passive_filter_design(request: Request, inputs: PassiveFilterInput) -> Dict[str, Any]:
    return _execute(request, "PQ-005", inputs, PassiveFilterInput)


# ─── PQ-006: Active Filter Sizing ────────────────────────────────────────────

@router.post(
    "/active-filter",
    summary="Active Power Filter (APF) Sizing",
    description=(
        "Determines the required APF current rating to meet IEEE 519 THD limits.\n\n"
        "**Standard:** IEC 61000 / IEEE 519-2022\n"
        "Returns: compensating current (A), APF kVA, and achievable THD%."
    ),
    tags=["Power Quality"],
)
async def active_filter_sizing(request: Request, inputs: ActiveFilterInput) -> Dict[str, Any]:
    return _execute(request, "PQ-006", inputs, ActiveFilterInput)
