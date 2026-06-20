# src/api/routers/renewable.py
"""
Renewable Energy & Motor Endpoints

PV-001 : Solar PV System Sizing
MOT-001: Motor Starting Analysis
BAT-001: Battery Energy Storage Sizing
"""

from fastapi import APIRouter, Request
from typing import Dict, Any

from src.calculators.renewable.schemas import (
    SolarPVInput,
    MotorStartingInput,
    BatteryStorageInput,
    MotorEfficiencyInput,
    BatteryChargerInput,
    InverterSizingInput,
    SolarBatteryInput,
    BackupTimeInput,
)

router = APIRouter(prefix="/api/v1/engineering", tags=["Renewable & Motors"])


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


@router.post("/renewable/solar-pv",
             summary="PV-001: Solar PV System Sizing",
             description="Sizes a solar PV system per IEC 62548. Calculates panel count, string config, and energy production.")
async def solar_pv(request: Request, inputs: SolarPVInput) -> Dict[str, Any]:
    return execute_calc(request, "PV-001", inputs, SolarPVInput)


@router.post("/renewable/motor-starting",
             summary="MOT-001: Motor Starting Analysis",
             description="Calculates motor starting current and voltage dip per IEC 60034.")
async def motor_starting(request: Request, inputs: MotorStartingInput) -> Dict[str, Any]:
    return execute_calc(request, "MOT-001", inputs, MotorStartingInput)


@router.post("/renewable/battery-storage",
             summary="BAT-001: Battery Energy Storage Sizing",
             description="Sizes a battery storage system per IEC 62619. Supports LiFePO4, LiNMC, LeadAcid, NaS.")
async def battery_storage(request: Request, inputs: BatteryStorageInput) -> Dict[str, Any]:
    return execute_calc(request, "BAT-001", inputs, BatteryStorageInput)


@router.post("/renewable/motor-efficiency",
             summary="MOT-002: Motor Efficiency Verification (IEC 60034-30-1)",
             description="Verifies IE class compliance and computes efficiency at partial loads, power factor, and upgrade savings.")
async def motor_efficiency(request: Request, inputs: MotorEfficiencyInput) -> Dict[str, Any]:
    return execute_calc(request, "MOT-002", inputs, MotorEfficiencyInput)


@router.post("/renewable/battery-charger",
             summary="BATTERY-002: Battery Charger Selection (IEEE 485 / IEC 60364)",
             description="Designs a battery charger/rectifier system including charging voltage/current, AC input, protection, and cable sizing.")
async def battery_charger(request: Request, inputs: BatteryChargerInput) -> Dict[str, Any]:
    return execute_calc(request, "BATTERY-002", inputs, BatteryChargerInput)


@router.post("/renewable/inverter-sizing",
             summary="SOLAR-002: Inverter Sizing & String Design (IEC 62548)",
             description="Designs PV string configuration and selects inverter count based on IEC 62548 voltage/temperature constraints.")
async def inverter_sizing(request: Request, inputs: InverterSizingInput) -> Dict[str, Any]:
    return execute_calc(request, "SOLAR-002", inputs, InverterSizingInput)


@router.post("/renewable/solar-battery",
             summary="SOLAR-003: Solar PV Battery Sizing (IEC 62548)",
             description="Sizes battery bank for solar PV systems per IEC 62548. Calculates capacity, string config, charge controller sizing, and protection.")
async def solar_battery(request: Request, inputs: SolarBatteryInput) -> Dict[str, Any]:
    return execute_calc(request, "SOLAR-003", inputs, SolarBatteryInput)


@router.post("/renewable/backup-time",
             summary="BAT-BU-001: Battery Backup Time",
             description="Calculates available backup time from battery bank capacity, load, DoD, and efficiency chain per IEC 62619.")
async def backup_time(request: Request, inputs: BackupTimeInput) -> Dict[str, Any]:
    return execute_calc(request, "BAT-BU-001", inputs, BackupTimeInput)
