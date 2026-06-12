"""
Xennic Engineering Service - FastAPI Application
Version: 0.3.0
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from src.core.registry import CalculationRegistry
from src.core.exceptions import ValidationError as EngineeringValidationError

# ── Basic Electrical ──────────────────────────────────────────────────────────
from src.calculators.basic.ohms_law      import OhmsLawCalculator
from src.calculators.basic.active_power  import ActivePowerCalculator
from src.calculators.basic.apparent_power import ApparentPowerCalculator
from src.calculators.basic.reactive_power import ReactivePowerCalculator
from src.calculators.basic.power_factor  import PowerFactorCalculator

# ── Cable Engineering ─────────────────────────────────────────────────────────
from src.calculators.cable.ampacity      import CableAmpacityCalculator
from src.calculators.cable.voltage_drop  import VoltageDropCalculator
from src.calculators.cable.short_circuit import ShortCircuitWithstandCalculator
from src.calculators.cable.pe_sizing     import PESizingCalculator

# ── Transformer Engineering ───────────────────────────────────────────────────
from src.calculators.transformer.sizing     import TransformerSizingCalculator
from src.calculators.transformer.losses     import TransformerLossesCalculator
from src.calculators.transformer.regulation import TransformerRegulationCalculator
from src.calculators.transformer.k_factor   import KFactorCalculator

# ── Protection Engineering ────────────────────────────────────────────────────
from src.calculators.protection.mccb_selection import MCCBSelectionCalculator

# ── Power Quality ✅ جدید ──────────────────────────────────────────────────────
from src.calculators.power_quality.thd            import THDCalculator
from src.calculators.power_quality.tdd            import TDDCalculator
from src.calculators.power_quality.k_factor       import KFactorPQCalculator
from src.calculators.power_quality.resonance      import ResonanceCalculator
from src.calculators.power_quality.passive_filter import PassiveFilterCalculator
from src.calculators.power_quality.active_filter  import ActiveFilterCalculator

# ── API Routers ───────────────────────────────────────────────────────────────
from src.api.routers.basic         import router as basic_router
from src.api.routers.cable         import router as cable_router
from src.api.routers.transformer   import router as transformer_router
from src.api.routers.protection    import router as protection_router
from src.api.routers.protection_ext import router as protection_ext_router   # ✅ SC-001, PROT-002, GND-001
from src.api.routers.power_quality import router as power_quality_router
from src.api.routers.renewable       import router as renewable_router
from src.api.routers.energy_analyzer  import router as energy_analyzer_router
from src.api.routers.bill_ocr         import router as bill_ocr_router


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

    # Transformer Engineering
    registry.register(TransformerSizingCalculator)
    registry.register(TransformerLossesCalculator)
    registry.register(TransformerRegulationCalculator)
    registry.register(KFactorCalculator)

    # Protection Engineering
    registry.register(MCCBSelectionCalculator)

    # Power Quality ✅ جدید
    registry.register(THDCalculator)
    registry.register(TDDCalculator)
    registry.register(KFactorPQCalculator)
    registry.register(ResonanceCalculator)
    registry.register(PassiveFilterCalculator)
    registry.register(ActiveFilterCalculator)

    # Renewable Energy
    from src.calculators.renewable import SolarPVCalculator, MotorStartingCalculator, BatteryStorageCalculator
    registry.register(SolarPVCalculator)
    registry.register(MotorStartingCalculator)
    registry.register(BatteryStorageCalculator)

    # Energy Analyzer
    from src.calculators.energy_analyzer import EnergyAnalyzerCalculator
    registry.register(EnergyAnalyzerCalculator)

    # Protection Extended ✅ جدید
    from src.calculators.protection.short_circuit import ShortCircuitCalculator
    from src.calculators.protection.arc_flash      import ArcFlashCalculator
    from src.calculators.protection.grounding      import GroundingCalculator
    registry.register(ShortCircuitCalculator)
    registry.register(ArcFlashCalculator)
    registry.register(GroundingCalculator)

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


# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*",   # در production محدود کن
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

app.include_router(bill_ocr_router,
    tags=["Bill OCR"])

app.include_router(renewable_router,                # ✅ جدید
    tags=["Renewable & Motors"])

app.include_router(protection_ext_router,           # ✅ SC-001, PROT-002, GND-001
    tags=["Protection Extended"])
