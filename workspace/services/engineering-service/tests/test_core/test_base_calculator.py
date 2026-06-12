# tests/test_core/test_base_calculator.py
import pytest
from datetime import datetime, timezone
from src.core.base_calculator import (
    BaseCalculator, CalculationInput, CalculationResult
)
from src.core.exceptions import ValidationError


class DummyInput(CalculationInput):
    voltage: float
    current: float


class DummyCalculator(BaseCalculator[DummyInput]):
    CALCULATION_CODE = "DEMO-001"
    CALCULATION_NAME = "Demo Power"
    FORMULA_VERSION = "2.0"
    STANDARD = "IEC 60050"
    STANDARD_VERSION = "2023"
    ENGINE_VERSION = "0.1.0"
    
    def validate_inputs(self, inputs: DummyInput) -> bool:
        if inputs.voltage <= 0:
            raise ValidationError("voltage", inputs.voltage, "must be positive")
        if inputs.current <= 0:
            raise ValidationError("current", inputs.current, "must be positive")
        return True
    
    def _calculate(self, inputs: DummyInput) -> dict:
        return {"power_w": inputs.voltage * inputs.current}
    
    def get_units(self) -> dict:
        return {"voltage": "V", "current": "A", "power_w": "W"}


def test_base_calculator_execute():
    """Test that execute returns a valid CalculationResult"""
    calc = DummyCalculator()
    inputs = DummyInput(voltage=230.0, current=10.0)
    result = calc.execute(inputs)
    
    assert isinstance(result, CalculationResult)
    assert result.calculation_code == "DEMO-001"
    assert result.calculation_name == "Demo Power"
    assert result.formula_version == "2.0"
    assert result.standard == "IEC 60050"
    assert result.results["power_w"] == 2300.0
    assert result.calculation_timestamp is not None
    assert isinstance(result.calculation_timestamp, datetime)


def test_base_calculator_validation_fails():
    """Test that validation errors are raised correctly"""
    calc = DummyCalculator()
    inputs = DummyInput(voltage=-10.0, current=5.0)
    
    with pytest.raises(ValidationError) as exc_info:
        calc.execute(inputs)
    
    assert "voltage" in str(exc_info.value)


def test_base_calculator_metadata():
    """Test that calculator metadata is correct"""
    assert DummyCalculator.CALCULATION_CODE == "DEMO-001"
    assert DummyCalculator.CALCULATION_NAME == "Demo Power"
    assert DummyCalculator.STANDARD == "IEC 60050"


def test_base_calculator_repr():
    """Test string representation"""
    calc = DummyCalculator()
    assert repr(calc) == "<DummyCalculator code=DEMO-001>"


def test_calculation_result_timestamp_utc():
    """Test that timestamp is UTC"""
    calc = DummyCalculator()
    inputs = DummyInput(voltage=100.0, current=2.0)
    result = calc.execute(inputs)
    
    assert result.calculation_timestamp.tzinfo == timezone.utc
