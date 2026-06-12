# tests/test_calculators/test_apparent_power.py
import pytest
from src.calculators.basic.apparent_power import ApparentPowerCalculator, ApparentPowerInput
from src.core.exceptions import ValidationError


def test_apparent_power_single_phase():
    """Test single-phase apparent power calculation"""
    calc = ApparentPowerCalculator()
    inputs = ApparentPowerInput(voltage_v=230.0, current_a=10.0)
    result = calc.execute(inputs)
    
    assert result.results["apparent_power_va"] == 2300.0
    assert result.results["apparent_power_kva"] == 2.3


def test_apparent_power_three_phase():
    """Test three-phase apparent power calculation"""
    calc = ApparentPowerCalculator()
    inputs = ApparentPowerInput(voltage_v=400.0, current_a=20.0, phase_type='three')
    result = calc.execute(inputs)
    
    expected_va = 400 * 20 * 1.7320508  # ~13856.4
    assert abs(result.results["apparent_power_va"] - 13856.4) < 0.01


def test_apparent_power_negative_values():
    """Test that negative values are rejected"""
    calc = ApparentPowerCalculator()
    
    with pytest.raises(ValidationError):
        inputs = ApparentPowerInput(voltage_v=-230.0, current_a=10.0)
        calc.execute(inputs)


def test_apparent_power_zero_values():
    """Test that zero values are rejected"""
    calc = ApparentPowerCalculator()
    
    with pytest.raises(ValidationError):
        inputs = ApparentPowerInput(voltage_v=0, current_a=10.0)
        calc.execute(inputs)


def test_apparent_power_precision():
    """Test precision of calculations"""
    calc = ApparentPowerCalculator()
    inputs = ApparentPowerInput(voltage_v=230.5, current_a=10.25)
    result = calc.execute(inputs)
    
    # 230.5 * 10.25 = 2362.625
    assert result.results["apparent_power_va"] == 2362.625