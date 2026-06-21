"""
Xennic Engineering Service - FastAPI Application
Version: 0.4.0

✅ SEC-001A: CORS Hardening Applied
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ── API Routers ───────────────────────────────────────────────────────────────
from src.api.routers.basic import router as basic_router

from src.api.routers.cable import router as cable_router
from src.api.routers.energy_analyzer import router as energy_analyzer_router
from src.api.routers.power_quality import router as power_quality_router
from src.api.routers.power_system import router as power_system_router
from src.api.routers.protection import router as protection_router
from src.api.routers.protection_ext import router as protection_ext_router
from src.api.routers.renewable import router as renewable_router
from src.api.routers.transformer import router as transformer_router
from src.api.routers.switchgear import router as switchgear_router
from src.api.routers.lighting import router as lighting_router
from src.api.routers.grounding import router as grounding_router
from src.api.routers.economics import router as economics_router
from src.calculators.basic.active_power import ActivePowerCalculator
from src.calculators.basic.apparent_power import ApparentPowerCalculator

# ── Basic Electrical ──────────────────────────────────────────────────────────
from src.calculators.basic.ohms_law import OhmsLawCalculator
from src.calculators.basic.power_factor import PowerFactorCalculator
from src.calculators.basic.reactive_power import ReactivePowerCalculator

# ── Cable Engineering ─────────────────────────────────────────────────────────
from src.calculators.cable.ampacity import CableAmpacityCalculator
from src.calculators.cable.pe_sizing import PESizingCalculator
from src.calculators.cable.short_circuit import ShortCircuitWithstandCalculator
from src.calculators.cable.tray_sizing import CableTraySizingCalculator
from src.calculators.cable.voltage_drop import VoltageDropCalculator
from src.calculators.power_quality.active_filter import ActiveFilterCalculator
from src.calculators.power_quality.k_factor import KFactorPQCalculator
from src.calculators.power_quality.passive_filter import PassiveFilterCalculator
from src.calculators.power_quality.pfc import PFCorrectionCalculator
from src.calculators.power_quality.resonance import ResonanceCalculator
from src.calculators.power_quality.tdd import TDDCalculator
from src.calculators.harmonic import AdvancedHarmonicCalculator

# ── Power Quality ─────────────────────────────────────────────────────────────
from src.calculators.power_quality.thd import THDCalculator

# ── Protection Engineering ────────────────────────────────────────────────────
from src.calculators.protection.mccb_selection import MCCBSelectionCalculator
from src.calculators.transformer.efficiency import TransformerEfficiencyCalculator
from src.calculators.transformer.k_factor import KFactorCalculator
from src.calculators.transformer.losses import TransformerLossesCalculator
from src.calculators.transformer.regulation import TransformerRegulationCalculator

# ── Transformer Engineering ───────────────────────────────────────────────────
from src.calculators.transformer.sizing import TransformerSizingCalculator
from src.core.exceptions import ValidationError as EngineeringValidationError
from src.core.registry import CalculationRegistry


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    print("🚀 Starting Xennic Engineering Service v0.4.0...")

    registry = CalculationRegistry()

    # Basic Electrical
    registry.register(OhmsLawCalculator)
    registry.register(ActivePowerCalculator)
    registry.register(ApparentPowerCalculator)
    registry.register(ReactivePowerCalculator)
    registry.register(PowerFactorCalculator)

    # Cable Engineering
    registry.register(CableAmpacityCalculator)
    registry.register(VoltageDropCalculator)
    registry.register(ShortCircuitWithstandCalculator)
    registry.register(PESizingCalculator)
    registry.register(CableTraySizingCalculator)

    # Transformer Engineering
    registry.register(TransformerSizingCalculator)
    registry.register(TransformerLossesCalculator)
    registry.register(TransformerRegulationCalculator)
    registry.register(KFactorCalculator)
    registry.register(TransformerEfficiencyCalculator)

    # Protection Engineering
    registry.register(MCCBSelectionCalculator)

    # Protection Extended (registered later in lifespan — moved up for simplicity)
    from src.calculators.protection.fuse_selection import FuseSelectionCalculator
    registry.register(FuseSelectionCalculator)

    # Switchgear Engineering
    from src.calculators.switchgear import MainSwitchCalculator
    registry.register(MainSwitchCalculator)

    # Lighting Engineering
    from src.calculators.lighting import LumenMethodCalculator, RoadLightingCalculator
    registry.register(LumenMethodCalculator)
    registry.register(RoadLightingCalculator)

    # Power Quality
    registry.register(THDCalculator)
    registry.register(TDDCalculator)
    registry.register(KFactorPQCalculator)
    registry.register(ResonanceCalculator)
    registry.register(PassiveFilterCalculator)
    registry.register(ActiveFilterCalculator)
    registry.register(PFCorrectionCalculator)

    # Advanced Harmonic Analysis
    registry.register(AdvancedHarmonicCalculator)

    # Capacitor Bank Sizing
    from src.calculators.power_quality.capacitor_bank import CapacitorBankCalculator
    registry.register(CapacitorBankCalculator)

    # Renewable Energy
    from src.calculators.renewable import (
        BatteryStorageCalculator,
        MotorStartingCalculator,
        SolarPVCalculator,
        MotorEfficiencyCalculator,
    )
    registry.register(SolarPVCalculator)
    registry.register(MotorStartingCalculator)
    registry.register(BatteryStorageCalculator)
    registry.register(MotorEfficiencyCalculator)
    from src.calculators.renewable.battery_charger import BatteryChargerCalculator
    registry.register(BatteryChargerCalculator)
    from src.calculators.renewable.inverter_sizing import InverterSizingCalculator
    registry.register(InverterSizingCalculator)
    from src.calculators.renewable.solar_battery import SolarBatteryCalculator
    registry.register(SolarBatteryCalculator)
    from src.calculators.renewable.backup_time import BackupTimeCalculator
    registry.register(BackupTimeCalculator)

    # Economic Analysis
    from src.calculators.economics.roi import ROICalculator
    from src.calculators.economics.npv import NPVCalculator
    from src.calculators.economics.irr import IRRCalculator
    registry.register(ROICalculator)
    registry.register(NPVCalculator)
    registry.register(IRRCalculator)

    # Protection Coordination
    from src.calculators.protection.coordination import ProtectionCoordinationCalculator
    registry.register(ProtectionCoordinationCalculator)

    # Energy Analyzer
    from src.calculators.energy_analyzer import EnergyAnalyzerCalculator
    registry.register(EnergyAnalyzerCalculator)

    # Power System Studies
    from src.calculators.power_system.busbar_sizing import BusbarSizingCalculator
    from src.calculators.power_system.load_flow import LoadFlowCalculator as PSLoadFlowCalculator
    from src.calculators.power_system.motor_starting import PowerSystemMotorStartingCalculator
    from src.calculators.power_system.short_circuit import (
        ShortCircuitCalculator as PSShortCircuitCalculator,
    )
    registry.register(PSLoadFlowCalculator)
    registry.register(PSShortCircuitCalculator)
    registry.register(PowerSystemMotorStartingCalculator)
    registry.register(BusbarSizingCalculator)

    # Protection Extended
    from src.calculators.protection.arc_flash import ArcFlashCalculator
    from src.calculators.protection.arc_incident import ArcIncidentCalculator
    from src.calculators.protection.grounding import GroundingCalculator
    from src.calculators.protection.short_circuit import ShortCircuitCalculator
    registry.register(ShortCircuitCalculator)
    registry.register(ArcFlashCalculator)
    registry.register(ArcIncidentCalculator)
    registry.register(GroundingCalculator)
    from src.calculators.grounding import GroundingGridCalculator
    registry.register(GroundingGridCalculator)
    from src.calculators.protection.selectivity import SelectivityCalculator
    registry.register(SelectivityCalculator)

    print(f"✅ Registered {registry.count()} calculators:")
    for info in registry.list_all():
        print(f"   [{info['code']}] {info['name']}  (std: {info['standard']})")

    app.state.registry = registry
    yield

    print("🛑 Shutting down Xennic Engineering Service...")


app = FastAPI(
    title="Xennic Engineering Service",
    description=(
        "## Electrical Engineering Calculation Engine\n\n"
        "### Modules\n"
        "- **Basic Electrical** — Ohm's Law, Power Calculations\n"
        "- **Cable Engineering** — Sizing, Voltage Drop, Short Circuit (IEC 60364)\n"
        "- **Transformer Engineering** — Sizing, Losses, Regulation, K-Factor (IEC 60076)\n"
        "- **Protection Engineering** — MCCB/ACB Selection (IEC 60947)\n"
        "- **Power Quality** — THD, TDD, K-Factor, Resonance, Filters (IEEE 519)\n"
    ),
    version="0.4.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ═══════════════════════════════════════════════════════════════════════════════
# SEC-001A: CORS HARDENING
# ═══════════════════════════════════════════════════════════════════════════════
#
# ❌ قبل (ناامن):
#   allow_origins=["*"]
#
# ✅ بعد (امن):
#   فقط origins مجاز از طریق متغیر محیطی CORS_ORIGINS
#
# ═══════════════════════════════════════════════════════════════════════════════

def get_cors_origins() -> list[str]:
    """
    دریافت لیست origins مجاز از متغیر محیطی

    در .env تنظیم کنید:
        CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://xennic.ir

    اگر تنظیم نشده باشد، فقط localhost مجاز است.
    """
    env_origins = os.getenv("CORS_ORIGINS", "")

    if env_origins:
        return [origin.strip() for origin in env_origins.split(",") if origin.strip()]

    # Development defaults — فقط localhost
    return [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),  # ✅ از env خوانده می‌شود
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],  # ✅ محدود به متدهای مجاز
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Request-ID",
        "X-Workspace-ID",
    ],  # ✅ محدود به headers مجاز
)


# ── Global Exception Handlers ─────────────────────────────────────────────────

@app.exception_handler(EngineeringValidationError)
async def engineering_validation_error_handler(
    request: Request, exc: EngineeringValidationError
):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "code":    "ENGINEERING_VALIDATION_ERROR",
                "message": str(exc),
                "field":   getattr(exc, "field", None),
            },
        },
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {"code": "VALIDATION_ERROR", "message": str(exc)},
        },
    )


@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(
    request: Request, exc: RequestValidationError
):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code":    "REQUEST_VALIDATION_ERROR",
                "message": "Invalid request parameters",
                "details": exc.errors(),
            },
        },
    )


# ── Health Check ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    registry = CalculationRegistry()
    return {
        "status":                 "ok",
        "service":                "engineering-service",
        "version":                "0.4.0",
        "calculators_registered": registry.count(),
    }


# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(basic_router,
    prefix="/api/v1/engineering/basic",
    tags=["Basic Electrical"])

app.include_router(cable_router,
    prefix="/api/v1/engineering/cable",
    tags=["Cable Engineering"])

app.include_router(transformer_router,
    prefix="/api/v1/engineering/transformer",
    tags=["Transformer Engineering"])

app.include_router(protection_router,
    prefix="/api/v1/engineering/protection",
    tags=["Protection Engineering"])

app.include_router(power_quality_router,
    prefix="/api/v1/engineering/power-quality",
    tags=["Power Quality"])

app.include_router(energy_analyzer_router,
    tags=["Energy Analyzer"])

app.include_router(renewable_router,
    tags=["Renewable & Motors"])

app.include_router(protection_ext_router,
    tags=["Protection Extended"])

app.include_router(power_system_router,
    prefix="/api/v1/engineering/power-system",
    tags=["Power System Studies"])

app.include_router(switchgear_router,
    prefix="/api/v1/engineering/switchgear",
    tags=["Switchgear Engineering"])

app.include_router(lighting_router,
    prefix="/api/v1/engineering/lighting",
    tags=["Lighting Engineering"])

app.include_router(grounding_router,
    prefix="/api/v1/engineering/grounding",
    tags=["Grounding Engineering"])

app.include_router(economics_router,
    prefix="/api/v1/engineering/economics",
    tags=["Economic Analysis"])
