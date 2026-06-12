# services/engineering-service/src/calculators/basic/power_factor.py
"""
BASIC-005: Power Factor Calculator
Standard: IEEE 1459-2010
Formula: PF = P / S
"""
import math  # <-- اضافه کنید
from typing import Dict
from src.core.base_calculator import BaseCalculator, CalculationInput
from src.core.validation import ValidationEngine


class PowerFactorInput(CalculationInput):
    """Input schema for Power Factor calculation"""
    active_power_w: float
    apparent_power_va: float


class PowerFactorCalculator(BaseCalculator[PowerFactorInput]):
    CALCULATION_CODE = "BASIC-005"
    CALCULATION_NAME = "Power Factor"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEEE 1459"
    STANDARD_VERSION = "2010"
    ENGINE_VERSION = "0.1.0"
    
    def validate_inputs(self, inputs: PowerFactorInput) -> bool:
        ValidationEngine.validate_positive(inputs.active_power_w, "active_power_w")
        ValidationEngine.validate_positive(inputs.apparent_power_va, "apparent_power_va")
        
        if inputs.active_power_w > inputs.apparent_power_va:
            raise ValueError("Active power cannot be greater than apparent power")
        return True
    
    def _calculate(self, inputs: PowerFactorInput) -> Dict[str, float]:
        """Calculate power factor"""
        power_factor = inputs.active_power_w / inputs.apparent_power_va
        
        return {
            "power_factor": round(power_factor, 4),
            "angle_degrees": round(math.degrees(math.acos(power_factor)), 2)
        }
    
    def get_units(self) -> Dict[str, str]:
        return {
            "active_power_w": "W",
            "apparent_power_va": "VA",
            "power_factor": "unitless",
            "angle_degrees": "°"
        }