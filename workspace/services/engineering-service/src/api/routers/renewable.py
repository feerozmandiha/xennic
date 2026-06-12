# src/api/routers/renewable.py
"""
Renewable Energy & Motor Endpoints

PV-001 : Solar PV System Sizing
MOT-001: Motor Starting Analysis
BAT-001: Battery Energy Storage Sizing
"""

from fastapi import APIRouter, HTTPException
from src.calculators.renewable import (
    SolarPVCalculator,
    MotorStartingCalculator,
    BatteryStorageCalculator,
)
from src.calculators.renewable.schemas import (
    SolarPVInput,
    MotorStartingInput,
    BatteryStorageInput,
)

router = APIRouter(prefix="/api/v1/engineering", tags=["Renewable & Motors"])

_solar   = SolarPVCalculator()
_motor   = MotorStartingCalculator()
_battery = BatteryStorageCalculator()


@router.post("/renewable/solar-pv",
             summary="PV-001: Solar PV System Sizing",
             description="Sizes a solar PV system per IEC 62548. Calculates panel count, string config, and energy production.")
async def solar_pv(inputs: SolarPVInput):
    try:
        result = _solar.calculate(inputs)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR", "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "CALCULATION_ERROR", "message": str(e)})


@router.post("/renewable/motor-starting",
             summary="MOT-001: Motor Starting Analysis",
             description="Calculates motor starting current and voltage dip per IEC 60034.")
async def motor_starting(inputs: MotorStartingInput):
    try:
        result = _motor.calculate(inputs)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR", "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "CALCULATION_ERROR", "message": str(e)})


@router.post("/renewable/battery-storage",
             summary="BAT-001: Battery Energy Storage Sizing",
             description="Sizes a battery storage system per IEC 62619. Supports LiFePO4, LiNMC, LeadAcid, NaS.")
async def battery_storage(inputs: BatteryStorageInput):
    try:
        result = _battery.calculate(inputs)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR", "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "CALCULATION_ERROR", "message": str(e)})
