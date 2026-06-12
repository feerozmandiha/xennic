# services/engineering-service/src/calculators/basic/ohms_law.py
"""
BASIC-001: Ohm's Law Calculator
Standard: IEC 60050-131:2023
Formula: V = I × R
Given any two parameters, calculate the third.
"""

from typing import Dict
from pydantic import model_validator
from src.core.base_calculator import BaseCalculator, CalculationInput
from src.core.validation import ValidationEngine
from src.core.unit_converter import UnitConversionEngine


class OhmsLawInput(CalculationInput):
    """Input schema for Ohm's Law calculation"""
    voltage_v: float | None = None
    current_a: float | None = None
    resistance_ohm: float | None = None
    
    @model_validator(mode='after')
    def check_exactly_two_provided(self) -> 'OhmsLawInput':
        provided_count = sum(1 for v in [self.voltage_v, self.current_a, self.resistance_ohm] if v is not None)
        if provided_count != 2:
            raise ValueError("Exactly two of the three parameters (voltage, current, resistance) must be provided.")
        return self


class OhmsLawCalculator(BaseCalculator[OhmsLawInput]):
    CALCULATION_CODE = "BASIC-001"
    CALCULATION_NAME = "Ohm's Law"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 60050"
    STANDARD_VERSION = "2023"
    ENGINE_VERSION = "0.1.0"
    
    def validate_inputs(self, inputs: OhmsLawInput) -> bool:
        """Validate physical ranges"""
        if inputs.voltage_v is not None:
            ValidationEngine.validate_positive(inputs.voltage_v, "voltage_v")
            ValidationEngine.validate_physical_range(inputs.voltage_v, 0, 1000000, "voltage_v")
        if inputs.current_a is not None:
            ValidationEngine.validate_positive(inputs.current_a, "current_a")
            ValidationEngine.validate_physical_range(inputs.current_a, 0, 100000, "current_a")
        if inputs.resistance_ohm is not None:
            ValidationEngine.validate_positive(inputs.resistance_ohm, "resistance_ohm")
            ValidationEngine.validate_physical_range(inputs.resistance_ohm, 0, 1000000000, "resistance_ohm")
        return True
    
    def _calculate(self, inputs: OhmsLawInput) -> Dict[str, float]:
        """Calculate the missing parameter"""
        if inputs.voltage_v is None:
            # Calculate V = I × R
            voltage = inputs.current_a * inputs.resistance_ohm
            return {"voltage_v": round(voltage, 6)}
        elif inputs.current_a is None:
            # Calculate I = V / R
            current = inputs.voltage_v / inputs.resistance_ohm
            return {"current_a": round(current, 6)}
        else:
            # Calculate R = V / I
            resistance = inputs.voltage_v / inputs.current_a
            return {"resistance_ohm": round(resistance, 6)}
    
    def get_units(self) -> Dict[str, str]:
        return {
            "voltage_v": "V",
            "current_a": "A",
            "resistance_ohm": "Ω"
        }