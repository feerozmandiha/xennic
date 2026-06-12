# tests/test_calculators/test_power_factor.py
import pytest
import math
from src.calculators.basic.power_factor import PowerFactorCalculator, PowerFactorInput
from src.core.exceptions import ValidationError


def test_power_factor_calculation():
    """Test power factor calculation"""
    calc = PowerFactorCalculator()
    inputs = PowerFactorInput(active_power_w=850.0, apparent_power_va=1000.0)
    result = calc.execute(inputs)
    
    assert result.results["power_factor"] == 0.85
    assert abs(result.results["angle_degrees"] - math.degrees(math.acos(0.85))) < 0.01


def test_power_factor_edge_case_unity():
    """Test power factor = 1 (pure resistive load)"""
    calc = PowerFactorCalculator()
    inputs = PowerFactorInput(active_power_w=1000.0, apparent_power_va=1000.0)
    result = calc.execute(inputs)
    
    assert result.results["power_factor"] == 1.0
    assert result.results["angle_degrees"] == 0.0


def test_power_factor_invalid_input():
    """Test that active power > apparent power raises error"""
    calc = PowerFactorCalculator()
    
    with pytest.raises(ValueError, match="Active power cannot be greater than apparent power"):
        inputs = PowerFactorInput(active_power_w=1500.0, apparent_power_va=1000.0)
        calc.execute(inputs)


def test_power_factor_negative_values():
    """Test that negative values are rejected"""
    calc = PowerFactorCalculator()
    
    with pytest.raises(ValidationError):
        inputs = PowerFactorInput(active_power_w=-850.0, apparent_power_va=1000.0)
        calc.execute(inputs)


def test_power_factor_zero_apparent():
    """Test that zero apparent power is rejected"""
    calc = PowerFactorCalculator()
    
    with pytest.raises(ValidationError):
        inputs = PowerFactorInput(active_power_w=850.0, apparent_power_va=0)
        calc.execute(inputs)


def test_power_factor_standard_reference():
    """Test that standard reference is IEEE 1459"""
    calc = PowerFactorCalculator()
    assert calc.STANDARD == "IEEE 1459"
    assert calc.STANDARD_VERSION == "2010"