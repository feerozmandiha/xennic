# services/engineering-service/src/calculators/basic/reactive_power.py
"""
BASIC-004: Reactive Power Calculator
Standard: IEC 60050-131:2023
Formula: Q = √(S² - P²)
"""

from typing import Dict
import math
from src.core.base_calculator import BaseCalculator, CalculationInput
from src.core.validation import ValidationEngine


class ReactivePowerInput(CalculationInput):
    """Input schema for Reactive Power calculation"""
    active_power_w: float
    apparent_power_va: float


class ReactivePowerCalculator(BaseCalculator[ReactivePowerInput]):
    CALCULATION_CODE = "BASIC-004"
    CALCULATION_NAME = "Reactive Power"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 60050"
    STANDARD_VERSION = "2023"
    ENGINE_VERSION = "0.1.0"
    
    def validate_inputs(self, inputs: ReactivePowerInput) -> bool:
        ValidationEngine.validate_positive(inputs.active_power_w, "active_power_w")
        ValidationEngine.validate_positive(inputs.apparent_power_va, "apparent_power_va")
        
        # Check that active power is not greater than apparent power
        if inputs.active_power_w > inputs.apparent_power_va:
            raise ValueError("Active power cannot be greater than apparent power")
        return True
    
    def _calculate(self, inputs: ReactivePowerInput) -> Dict[str, float]:
        """Calculate reactive power using Pythagorean theorem"""
        reactive_power_var = math.sqrt(
            inputs.apparent_power_va ** 2 - inputs.active_power_w ** 2
        )
        
        return {
            "reactive_power_var": round(reactive_power_var, 4),
            "reactive_power_kvar": round(reactive_power_var / 1000, 6)
        }
    
    def get_units(self) -> Dict[str, str]:
        return {
            "active_power_w": "W",
            "apparent_power_va": "VA",
            "reactive_power_var": "VAR",
            "reactive_power_kvar": "kVAR"
        }