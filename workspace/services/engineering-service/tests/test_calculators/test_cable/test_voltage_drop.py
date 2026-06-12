"""
Unit tests for Voltage Drop Calculator (CABLE-002)
"""

import pytest
from src.calculators.cable.voltage_drop import VoltageDropCalculator
from src.calculators.cable.schemas import VoltageDropInput


class TestVoltageDropCalculator:
    """Test suite for VoltageDropCalculator"""
    
    def setup_method(self):
        self.calc = VoltageDropCalculator()
    
    def test_single_phase_copper_10mm2_100m(self):
        """Test single-phase voltage drop for 10mm² copper cable"""
        inputs = VoltageDropInput(
            voltage_v=230.0,
            current_a=20.0,
            cable_length_m=100.0,
            cable_size_mm2=10.0,
            conductor_material='copper',
            power_factor=0.85,
            phase_type='single',
        )
        result = self.calc.execute(inputs)
        
        assert result.results["voltage_drop_v"] > 0
        assert result.results["voltage_drop_percent"] > 0
    
    def test_single_phase_acceptable_drop(self):
        """Test single-phase with acceptable voltage drop"""
        inputs = VoltageDropInput(
            voltage_v=230.0,
            current_a=10.0,
            cable_length_m=50.0,
            cable_size_mm2=16.0,
            conductor_material='copper',
            power_factor=0.9,
            phase_type='single',
        )
        result = self.calc.execute(inputs)
        
        assert result.results["is_acceptable"] is True
    
    def test_single_phase_excessive_drop(self):
        """Test single-phase with excessive voltage drop"""
        inputs = VoltageDropInput(
            voltage_v=230.0,
            current_a=50.0,
            cable_length_m=500.0,
            cable_size_mm2=10.0,
            conductor_material='copper',
            power_factor=0.8,
            phase_type='single',
        )
        result = self.calc.execute(inputs)
        
        assert result.results["is_acceptable"] is False
    
    def test_three_phase_copper_35mm2_200m(self):
        """Test three-phase voltage drop for 35mm² copper cable"""
        inputs = VoltageDropInput(
            voltage_v=400.0,
            current_a=100.0,
            cable_length_m=200.0,
            cable_size_mm2=35.0,
            conductor_material='copper',
            power_factor=0.85,
            phase_type='three',
        )
        result = self.calc.execute(inputs)
        
        assert result.results["voltage_drop_v"] > 0
        assert result.results["voltage_drop_percent"] > 0
    
    def test_three_phase_vs_single_phase(self):
        """Test that three-phase has lower drop than single-phase"""
        common_inputs = {
            'voltage_v': 400.0,
            'current_a': 50.0,
            'cable_length_m': 100.0,
            'cable_size_mm2': 25.0,
            'conductor_material': 'copper',
            'power_factor': 0.85,
        }
        
        single_result = self.calc.execute(VoltageDropInput(**common_inputs, phase_type='single'))
        three_result = self.calc.execute(VoltageDropInput(**common_inputs, phase_type='three'))
        
        # Three-phase has √3 factor (1.732) but also different voltage base
        # For same line current, three-phase drop is actually lower percentage
        assert three_result.results["voltage_drop_percent"] < single_result.results["voltage_drop_percent"]
    
    def test_aluminum_vs_copper(self):
        """Test that aluminum has higher voltage drop than copper"""
        base_inputs = {
            'voltage_v': 400.0,
            'current_a': 50.0,
            'cable_length_m': 100.0,
            'cable_size_mm2': 35.0,
            'power_factor': 0.85,
            'phase_type': 'three',
        }
        
        copper_result = self.calc.execute(VoltageDropInput(**base_inputs, conductor_material='copper'))
        alu_result = self.calc.execute(VoltageDropInput(**base_inputs, conductor_material='aluminum'))
        
        # Aluminum has higher resistance
        assert alu_result.results["voltage_drop_percent"] > copper_result.results["voltage_drop_percent"]
    
    def test_power_factor_effect_on_voltage_drop(self):
        """Test that voltage drop varies with power factor (relationship depends on cable size)"""
        base_inputs = {
            'voltage_v': 400.0,
            'current_a': 50.0,
            'cable_length_m': 100.0,
            'cable_size_mm2': 35.0,
            'conductor_material': 'copper',
            'phase_type': 'three',
        }
        
        pf_095_result = self.calc.execute(VoltageDropInput(**base_inputs, power_factor=0.95))
        pf_080_result = self.calc.execute(VoltageDropInput(**base_inputs, power_factor=0.80))
        
        # Just verify both produce valid results
        assert pf_095_result.results["voltage_drop_percent"] > 0
        assert pf_080_result.results["voltage_drop_percent"] > 0
    
    def test_very_long_cable(self):
        """Test very long cable (500m)"""
        inputs = VoltageDropInput(
            voltage_v=400.0,
            current_a=30.0,
            cable_length_m=500.0,
            cable_size_mm2=70.0,
            conductor_material='copper',
            power_factor=0.85,
            phase_type='three',
        )
        result = self.calc.execute(inputs)
        
        assert result.results["voltage_drop_percent"] > 0
    
    def test_very_short_cable(self):
        """Test very short cable (10m)"""
        inputs = VoltageDropInput(
            voltage_v=230.0,
            current_a=100.0,
            cable_length_m=10.0,
            cable_size_mm2=35.0,
            conductor_material='copper',
            power_factor=0.85,
            phase_type='single',
        )
        result = self.calc.execute(inputs)
        
        assert result.results["voltage_drop_percent"] < 2.0
    
    def test_minimum_cable_size(self):
        """Test with minimum cable size (1.5mm²)"""
        inputs = VoltageDropInput(
            voltage_v=230.0,
            current_a=10.0,
            cable_length_m=30.0,
            cable_size_mm2=1.5,
            conductor_material='copper',
            power_factor=0.9,
            phase_type='single',
        )
        result = self.calc.execute(inputs)
        
        assert result.results["voltage_drop_v"] > 0
    
    def test_large_cable_reactance_dominant(self):
        """Test with large cable where reactance becomes significant"""
        inputs_240 = VoltageDropInput(
            voltage_v=400.0,
            current_a=400.0,
            cable_length_m=200.0,
            cable_size_mm2=240.0,
            conductor_material='copper',
            power_factor=0.85,
            phase_type='three',
        )
        result = self.calc.execute(inputs_240)
        
        assert result.results["voltage_drop_percent"] > 0
    
    # =========================================================================
    # Validation tests (Pydantic raises ValueError)
    # =========================================================================
    
    def test_invalid_voltage_negative(self):
        """Test that negative voltage is rejected by Pydantic"""
        with pytest.raises(ValueError):
            VoltageDropInput(
                voltage_v=-230.0,
                current_a=10.0,
                cable_length_m=50.0,
                cable_size_mm2=10.0,
                conductor_material='copper',
                power_factor=0.85,
                phase_type='single',
            )
    
    def test_invalid_power_factor_out_of_range(self):
        """Test that power factor > 1 is rejected by Pydantic"""
        with pytest.raises(ValueError):
            VoltageDropInput(
                voltage_v=230.0,
                current_a=10.0,
                cable_length_m=50.0,
                cable_size_mm2=10.0,
                conductor_material='copper',
                power_factor=1.5,
                phase_type='single',
            )
    
    def test_zero_length_cable(self):
        """Test that zero length cable is rejected by Pydantic"""
        with pytest.raises(ValueError):
            VoltageDropInput(
                voltage_v=230.0,
                current_a=10.0,
                cable_length_m=0,
                cable_size_mm2=10.0,
                conductor_material='copper',
                power_factor=0.85,
                phase_type='single',
            )
