# tests/test_calculators/test_reactive_power.py
import pytest
import math
from src.calculators.basic.reactive_power import ReactivePowerCalculator, ReactivePowerInput
from src.core.exceptions import ValidationError


def test_reactive_power_calculation():
    """Test reactive power calculation"""
    calc = ReactivePowerCalculator()
    # Power triangle: S=1000, P=800 -> Q=600
    inputs = ReactivePowerInput(active_power_w=800.0, apparent_power_va=1000.0)
    result = calc.execute(inputs)
    
    assert result.results["reactive_power_var"] == 600.0
    assert result.results["reactive_power_kvar"] == 0.6


def test_reactive_power_edge_case_pf_one():
    """Test reactive power when power factor = 1 (P = S)"""
    calc = ReactivePowerCalculator()
    inputs = ReactivePowerInput(active_power_w=1000.0, apparent_power_va=1000.0)
    result = calc.execute(inputs)
    
    assert result.results["reactive_power_var"] == 0.0


def test_reactive_power_invalid_input():
    """Test that active power > apparent power raises error"""
    calc = ReactivePowerCalculator()
    
    with pytest.raises(ValueError, match="Active power cannot be greater than apparent power"):
        inputs = ReactivePowerInput(active_power_w=1500.0, apparent_power_va=1000.0)
        calc.execute(inputs)


def test_reactive_power_negative_values():
    """Test that negative values are rejected"""
    calc = ReactivePowerCalculator()
    
    with pytest.raises(ValidationError):
        inputs = ReactivePowerInput(active_power_w=-800.0, apparent_power_va=1000.0)
        calc.execute(inputs)


def test_reactive_power_known_values():
    """Test with known power factor values"""
    calc = ReactivePowerCalculator()
    
    # Power factor 0.8, S=1000 -> P=800, Q=600
    inputs = ReactivePowerInput(active_power_w=800.0, apparent_power_va=1000.0)
    result = calc.execute(inputs)
    
    assert result.results["reactive_power_var"] == 600.0


def test_reactive_power_calculation_accuracy():
    """Test accuracy with non-round numbers"""
    calc = ReactivePowerCalculator()
    inputs = ReactivePowerInput(active_power_w=1234.56, apparent_power_va=2345.67)
    result = calc.execute(inputs)
    
    expected_q = math.sqrt(2345.67**2 - 1234.56**2)
    assert abs(result.results["reactive_power_var"] - expected_q) < 0.01