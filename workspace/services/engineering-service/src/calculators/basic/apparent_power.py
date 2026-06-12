# services/engineering-service/src/calculators/basic/apparent_power.py
"""
BASIC-003: Apparent Power Calculator
Standard: IEC 60050-131:2023
Formula: S = V × I (single-phase), S = √3 × V × I (three-phase)
"""

from typing import Dict, Literal
from src.core.base_calculator import BaseCalculator, CalculationInput
from src.core.validation import ValidationEngine


class ApparentPowerInput(CalculationInput):
    """Input schema for Apparent Power calculation"""
    voltage_v: float
    current_a: float
    phase_type: Literal['single', 'three'] = 'single'


class ApparentPowerCalculator(BaseCalculator[ApparentPowerInput]):
    CALCULATION_CODE = "BASIC-003"
    CALCULATION_NAME = "Apparent Power"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 60050"
    STANDARD_VERSION = "2023"
    ENGINE_VERSION = "0.1.0"
    
    def validate_inputs(self, inputs: ApparentPowerInput) -> bool:
        ValidationEngine.validate_positive(inputs.voltage_v, "voltage_v")
        ValidationEngine.validate_positive(inputs.current_a, "current_a")
        return True
    
    def _calculate(self, inputs: ApparentPowerInput) -> Dict[str, float]:
        """Calculate apparent power in VA and kVA"""
        if inputs.phase_type == 'three':
            power_va = inputs.voltage_v * inputs.current_a * 1.7320508  # √3
        else:
            power_va = inputs.voltage_v * inputs.current_a
        
        return {
            "apparent_power_va": round(power_va, 4),
            "apparent_power_kva": round(power_va / 1000, 6)
        }
    
    def get_units(self) -> Dict[str, str]:
        return {
            "voltage_v": "V",
            "current_a": "A",
            "apparent_power_va": "VA",
            "apparent_power_kva": "kVA"
        }