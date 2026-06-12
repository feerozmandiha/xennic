# services/engineering-service/src/calculators/basic/active_power.py
"""
BASIC-002: Active Power Calculator
Standard: IEC 60050-131:2023
Formula: P = V × I × PF (single-phase)
"""

from typing import Dict, Literal
from pydantic import model_validator
from src.core.base_calculator import BaseCalculator, CalculationInput
from src.core.validation import ValidationEngine


class ActivePowerInput(CalculationInput):
    """Input schema for Active Power calculation"""
    voltage_v: float
    current_a: float
    power_factor: float
    phase_type: Literal['single', 'three'] = 'single'
    
    @model_validator(mode='after')
    def validate_power_factor(self) -> 'ActivePowerInput':
        if not (0 < self.power_factor <= 1):
            raise ValueError("Power factor must be in range (0, 1]")
        return self


class ActivePowerCalculator(BaseCalculator[ActivePowerInput]):
    CALCULATION_CODE = "BASIC-002"
    CALCULATION_NAME = "Active Power"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 60050"
    STANDARD_VERSION = "2023"
    ENGINE_VERSION = "0.1.0"
    
    def validate_inputs(self, inputs: ActivePowerInput) -> bool:
        ValidationEngine.validate_positive(inputs.voltage_v, "voltage_v")
        ValidationEngine.validate_positive(inputs.current_a, "current_a")
        ValidationEngine.validate_positive(inputs.power_factor, "power_factor")
        return True
    
    def _calculate(self, inputs: ActivePowerInput) -> Dict[str, float]:
        """Calculate active power in watts and kilowatts"""
        if inputs.phase_type == 'three':
            power_w = inputs.voltage_v * inputs.current_a * inputs.power_factor * 1.7320508  # √3
        else:
            power_w = inputs.voltage_v * inputs.current_a * inputs.power_factor
        
        return {
            "active_power_w": round(power_w, 4),
            "active_power_kw": round(power_w / 1000, 6)
        }
    
    def get_units(self) -> Dict[str, str]:
        return {
            "voltage_v": "V",
            "current_a": "A",
            "power_factor": "unitless",
            "active_power_w": "W",
            "active_power_kw": "kW"
        }