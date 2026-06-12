# tests/test_calculators/test_active_power.py
import pytest
from src.calculators.basic.active_power import ActivePowerCalculator, ActivePowerInput
from src.core.exceptions import ValidationError


def test_active_power_single_phase():
    """Test single-phase active power calculation"""
    calc = ActivePowerCalculator()
    inputs = ActivePowerInput(voltage_v=230.0, current_a=10.0, power_factor=0.85)
    result = calc.execute(inputs)
    
    expected_w = 230 * 10 * 0.85  # 1955
    assert result.results["active_power_w"] == 1955.0
    assert result.results["active_power_kw"] == 1.955


def test_active_power_three_phase():
    """Test three-phase active power calculation"""
    calc = ActivePowerCalculator()
    inputs = ActivePowerInput(voltage_v=400.0, current_a=20.0, power_factor=0.9, phase_type='three')
    result = calc.execute(inputs)
    
    expected_w = 400 * 20 * 0.9 * 1.7320508  # ~12470.76
    assert abs(result.results["active_power_w"] - 12470.76) < 0.01


def test_active_power_invalid_power_factor():
    """Test that invalid power factor values are rejected"""
    calc = ActivePowerCalculator()
    
    with pytest.raises(ValueError, match="Power factor must be in range"):
        inputs = ActivePowerInput(voltage_v=230.0, current_a=10.0, power_factor=1.5)
        calc.execute(inputs)
    
    with pytest.raises(ValueError, match="Power factor must be in range"):
        inputs = ActivePowerInput(voltage_v=230.0, current_a=10.0, power_factor=-0.5)
        calc.execute(inputs)


def test_active_power_zero_values():
    """Test that zero values are rejected"""
    calc = ActivePowerCalculator()
    
    with pytest.raises(ValidationError):
        inputs = ActivePowerInput(voltage_v=0, current_a=10.0, power_factor=0.85)
        calc.execute(inputs)


def test_active_power_edge_case_pf_one():
    """Test power factor = 1 (pure resistive load)"""
    calc = ActivePowerCalculator()
    inputs = ActivePowerInput(voltage_v=230.0, current_a=10.0, power_factor=1.0)
    result = calc.execute(inputs)
    
    assert result.results["active_power_w"] == 2300.0


def test_active_power_standard_reference():
    """Test that standard reference is correct"""
    calc = ActivePowerCalculator()
    assert calc.STANDARD == "IEC 60050"
    assert calc.STANDARD_VERSION == "2023"