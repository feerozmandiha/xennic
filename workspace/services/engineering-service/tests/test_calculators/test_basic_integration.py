# tests/test_calculators/test_basic_integration.py
"""
Integration tests for basic electrical calculations
Tests the entire chain: Ohm's Law -> Power Calculations
"""

import pytest
from src.calculators.basic.ohms_law import OhmsLawCalculator, OhmsLawInput
from src.calculators.basic.active_power import ActivePowerCalculator, ActivePowerInput
from src.calculators.basic.apparent_power import ApparentPowerCalculator, ApparentPowerInput
from src.calculators.basic.reactive_power import ReactivePowerCalculator, ReactivePowerInput
from src.calculators.basic.power_factor import PowerFactorCalculator, PowerFactorInput


def test_complete_power_triangle():
    """Test the complete power triangle calculation chain"""
    
    # Step 1: Calculate current using Ohm's Law
    ohm_calc = OhmsLawCalculator()
    ohm_input = OhmsLawInput(voltage_v=230.0, resistance_ohm=23.0)
    ohm_result = ohm_calc.execute(ohm_input)
    current = ohm_result.results["current_a"]
    
    # Step 2: Calculate apparent power
    apparent_calc = ApparentPowerCalculator()
    apparent_input = ApparentPowerInput(voltage_v=230.0, current_a=current)
    apparent_result = apparent_calc.execute(apparent_input)
    s = apparent_result.results["apparent_power_va"]
    
    # Step 3: Calculate active power with PF=0.85
    active_calc = ActivePowerCalculator()
    active_input = ActivePowerInput(voltage_v=230.0, current_a=current, power_factor=0.85)
    active_result = active_calc.execute(active_input)
    p = active_result.results["active_power_w"]
    
    # Step 4: Calculate reactive power from P and S
    reactive_calc = ReactivePowerCalculator()
    reactive_input = ReactivePowerInput(active_power_w=p, apparent_power_va=s)
    reactive_result = reactive_calc.execute(reactive_input)
    q = reactive_result.results["reactive_power_var"]
    
    # Step 5: Calculate power factor from P and S
    pf_calc = PowerFactorCalculator()
    pf_input = PowerFactorInput(active_power_w=p, apparent_power_va=s)
    pf_result = pf_calc.execute(pf_input)
    pf = pf_result.results["power_factor"]
    
    # Verify relationships
    assert abs(pf - 0.85) < 0.01
    assert abs(s - (p**2 + q**2)**0.5) < 0.01
    assert p == 2300.0 * 0.85  # V=230, I=10, PF=0.85


def test_ohms_law_to_active_power_flow():
    """Test data flow from Ohm's Law to Active Power"""
    
    # Given voltage and resistance, find current
    ohm_calc = OhmsLawCalculator()
    ohm_result = ohm_calc.execute(OhmsLawInput(voltage_v=400.0, resistance_ohm=40.0))
    current = ohm_result.results["current_a"]
    
    # Use current for power calculation
    power_calc = ActivePowerCalculator()
    power_result = power_calc.execute(ActivePowerInput(
        voltage_v=400.0,
        current_a=current,
        power_factor=0.9
    ))
    
    # I = V/R = 400/40 = 10A
    # P = V*I*PF = 400*10*0.9 = 3600W
    assert abs(power_result.results["active_power_w"] - 3600.0) < 0.01
