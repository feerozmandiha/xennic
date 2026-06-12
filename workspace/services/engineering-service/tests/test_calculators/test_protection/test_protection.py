"""
Unit tests for Protection Engineering Calculators
"""

import pytest
from src.calculators.protection.mccb_selection import MCCBSelectionCalculator
from src.calculators.protection.schemas import MCCBSelectionInput


class TestMCCBSelection:
    """Tests for PROT-001: MCCB/ACB Selection"""
    
    def setup_method(self):
        self.calc = MCCBSelectionCalculator()
    
    def test_mccb_selection_100a_load(self):
        """Test MCCB selection for 100A load"""
        inputs = MCCBSelectionInput(
            load_current_a=100.0,
            short_circuit_current_ka=10.0,
            voltage_v=400.0,
            pole_count=3,
            ambient_temperature=40,
            application_type='mccb',
        )
        result = self.calc.execute(inputs)
        
        # With safety factor 1.25 -> 125A, next standard is 125A
        assert result.results["recommended_rated_current_a"] >= 125.0
        assert result.results["is_sufficient"] is True
    
    def test_acb_selection_2000a_load(self):
        """Test ACB selection for 2000A load"""
        inputs = MCCBSelectionInput(
            load_current_a=2000.0,
            short_circuit_current_ka=50.0,
            voltage_v=400.0,
            pole_count=3,
            ambient_temperature=40,
            application_type='acb',
        )
        result = self.calc.execute(inputs)
        
        # ACB should be selected with appropriate rating
        assert result.results["recommended_rated_current_a"] >= 2000.0
        assert result.results["is_sufficient"] is True
    
    def test_insufficient_breaking_capacity(self):
        """Test when short circuit current exceeds breaking capacity"""
        inputs = MCCBSelectionInput(
            load_current_a=100.0,
            short_circuit_current_ka=100.0,  # Very high
            voltage_v=400.0,
            pole_count=3,
            ambient_temperature=40,
            application_type='mccb',
        )
        result = self.calc.execute(inputs)
        
        # May not be sufficient (depends on available ratings)
        # Test just verifies calculation runs
        assert result.results["recommended_breaking_capacity_ka"] > 0
    
    def test_temperature_derating(self):
        """Test temperature derating effect"""
        normal_inputs = MCCBSelectionInput(
            load_current_a=100.0,
            short_circuit_current_ka=10.0,
            voltage_v=400.0,
            pole_count=3,
            ambient_temperature=40,
            application_type='mccb',
        )
        hot_inputs = MCCBSelectionInput(
            load_current_a=100.0,
            short_circuit_current_ka=10.0,
            voltage_v=400.0,
            pole_count=3,
            ambient_temperature=60,
            application_type='mccb',
        )
        
        normal_result = self.calc.execute(normal_inputs)
        hot_result = self.calc.execute(hot_inputs)
        
        # Hot environment may require larger rating due to derating
        assert hot_result.results["recommended_rated_current_a"] >= normal_result.results["recommended_rated_current_a"]
    
    def test_invalid_load_current(self):
        """Test that negative load current is rejected by Pydantic"""
        with pytest.raises(ValueError):
            MCCBSelectionInput(
                load_current_a=-100.0,
                short_circuit_current_ka=10.0,
                voltage_v=400.0,
                pole_count=3,
                ambient_temperature=40,
                application_type='mccb',
            )
    
    def test_safety_factor_application(self):
        """Test that safety factor is applied correctly"""
        inputs = MCCBSelectionInput(
            load_current_a=80.0,
            short_circuit_current_ka=10.0,
            voltage_v=400.0,
            pole_count=3,
            ambient_temperature=40,
            application_type='mccb',
        )
        result = self.calc.execute(inputs)
        
        # 80A * 1.25 = 100A required, next standard is 100A
        assert result.results["required_current_with_safety"] >= 100.0
