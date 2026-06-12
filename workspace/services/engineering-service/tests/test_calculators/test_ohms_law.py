# tests/test_calculators/test_ohms_law.py
import pytest
from src.calculators.basic.ohms_law import OhmsLawCalculator, OhmsLawInput
from src.core.exceptions import ValidationError


def test_ohms_law_calculate_voltage():
    """Test calculating voltage when current and resistance are given"""
    calc = OhmsLawCalculator()
    inputs = OhmsLawInput(current_a=10.0, resistance_ohm=23.0)
    result = calc.execute(inputs)
    
    assert result.calculation_code == "BASIC-001"
    assert "voltage_v" in result.results
    assert result.results["voltage_v"] == 230.0


def test_ohms_law_calculate_current():
    """Test calculating current when voltage and resistance are given"""
    calc = OhmsLawCalculator()
    inputs = OhmsLawInput(voltage_v=230.0, resistance_ohm=23.0)
    result = calc.execute(inputs)
    
    assert "current_a" in result.results
    assert result.results["current_a"] == 10.0


def test_ohms_law_calculate_resistance():
    """Test calculating resistance when voltage and current are given"""
    calc = OhmsLawCalculator()
    inputs = OhmsLawInput(voltage_v=230.0, current_a=10.0)
    result = calc.execute(inputs)
    
    assert "resistance_ohm" in result.results
    assert result.results["resistance_ohm"] == 23.0


def test_ohms_law_invalid_input_count():
    """Test that providing 1 or 3 parameters raises error"""
    calc = OhmsLawCalculator()
    
    # Only one parameter provided
    with pytest.raises(ValueError, match="Exactly two"):
        inputs = OhmsLawInput(voltage_v=230.0)
        calc.execute(inputs)
    
    # Three parameters provided
    with pytest.raises(ValueError, match="Exactly two"):
        inputs = OhmsLawInput(voltage_v=230.0, current_a=10.0, resistance_ohm=23.0)
        calc.execute(inputs)


def test_ohms_law_negative_values():
    """Test that negative values are rejected"""
    calc = OhmsLawCalculator()
    
    with pytest.raises(ValidationError):
        inputs = OhmsLawInput(voltage_v=-230.0, current_a=10.0)
        calc.execute(inputs)


def test_ohms_law_precision():
    """Test that results are rounded to 6 decimal places"""
    calc = OhmsLawCalculator()
    inputs = OhmsLawInput(voltage_v=1.0, resistance_ohm=3.0)
    result = calc.execute(inputs)
    
    # 1 / 3 = 0.333333... should be rounded to 6 decimals
    assert result.results["current_a"] == 0.333333