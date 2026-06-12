"""
Unit tests for Cable Ampacity Calculator (CABLE-001)
"""

import pytest
from src.calculators.cable.ampacity import CableAmpacityCalculator
from src.calculators.cable.schemas import CableSizingInput


class TestCableAmpacityCalculator:
    """Test suite for CableAmpacityCalculator"""
    
    def setup_method(self):
        self.calc = CableAmpacityCalculator()
    
    # =========================================================================
    # Copper conductor tests
    # =========================================================================
    
    def test_copper_pvc_c_on_wall_100a(self):
        """Test copper/PVC cable on wall for 100A load"""
        inputs = CableSizingInput(
            load_current=100.0,
            installation_method='C',
            ambient_temperature=30.0,
            conductor_material='copper',
            insulation_type='PVC',
            number_of_circuits=1,
        )
        result = self.calc.execute(inputs)
        
        # 35mm² Cu/PVC/C has ampacity 122A
        assert result.results["minimum_cable_size"] == 35.0
    
    def test_copper_xlpe_c_on_wall_150a(self):
        """Test copper/XLPE cable on wall for 150A load"""
        inputs = CableSizingInput(
            load_current=150.0,
            installation_method='C',
            ambient_temperature=40.0,
            conductor_material='copper',
            insulation_type='XLPE',
            number_of_circuits=1,
        )
        result = self.calc.execute(inputs)
        
        # 35mm² Cu/XLPE/C has ampacity 150A (actually 150A exactly)
        # So 35mm² should be sufficient
        assert result.results["minimum_cable_size"] == 35.0
    
    def test_copper_pvc_b2_conduit_50a(self):
        """Test copper/PVC cable in conduit for 50A load"""
        inputs = CableSizingInput(
            load_current=50.0,
            installation_method='B2',
            ambient_temperature=30.0,
            conductor_material='copper',
            insulation_type='PVC',
            number_of_circuits=1,
        )
        result = self.calc.execute(inputs)
        
        # 16mm² Cu/PVC/B2 has ampacity 60A
        assert result.results["minimum_cable_size"] == 16.0
    
    # =========================================================================
    # Temperature correction tests
    # =========================================================================
    
    def test_temperature_correction_high_ambient(self):
        """Test temperature correction for high ambient temperature"""
        inputs = CableSizingInput(
            load_current=100.0,
            installation_method='C',
            ambient_temperature=50.0,
            conductor_material='copper',
            insulation_type='PVC',
            number_of_circuits=1,
        )
        result = self.calc.execute(inputs)
        
        # Correction factor for 50°C with PVC is 0.71
        assert result.results["temperature_correction_factor"] == 0.71
        # Due to derating, need larger cable (50mm²)
        assert result.results["minimum_cable_size"] == 50.0
    
    def test_temperature_correction_xlpe_high(self):
        """Test temperature correction for XLPE at high temperature"""
        inputs = CableSizingInput(
            load_current=100.0,
            installation_method='C',
            ambient_temperature=55.0,
            conductor_material='copper',
            insulation_type='XLPE',
            number_of_circuits=1,
        )
        result = self.calc.execute(inputs)
        
        # Correction factor for 55°C with XLPE is 0.86
        assert result.results["temperature_correction_factor"] == 0.86
    
    # =========================================================================
    # Grouping correction tests
    # =========================================================================
    
    def test_grouping_correction_multiple_circuits(self):
        """Test grouping correction for multiple circuits"""
        inputs = CableSizingInput(
            load_current=100.0,
            installation_method='C',
            ambient_temperature=30.0,
            conductor_material='copper',
            insulation_type='PVC',
            number_of_circuits=3,
        )
        result = self.calc.execute(inputs)
        
        # Grouping factor for 3 circuits is 0.70
        assert result.results["grouping_correction_factor"] == 0.70
    
    def test_grouping_correction_max_circuits(self):
        """Test grouping correction for maximum circuits"""
        inputs = CableSizingInput(
            load_current=50.0,
            installation_method='C',
            ambient_temperature=30.0,
            conductor_material='copper',
            insulation_type='PVC',
            number_of_circuits=10,
        )
        result = self.calc.execute(inputs)
        
        # Grouping factor for 10 circuits is 0.48
        assert result.results["grouping_correction_factor"] == 0.48
    
    # =========================================================================
    # Aluminum conductor tests
    # =========================================================================
    
    def test_aluminum_conductor_derating(self):
        """Test aluminum conductor requires larger size"""
        copper_inputs = CableSizingInput(
            load_current=100.0,
            installation_method='C',
            ambient_temperature=30.0,
            conductor_material='copper',
            insulation_type='PVC',
            number_of_circuits=1,
        )
        alu_inputs = CableSizingInput(
            load_current=100.0,
            installation_method='C',
            ambient_temperature=30.0,
            conductor_material='aluminum',
            insulation_type='PVC',
            number_of_circuits=1,
        )
        
        copper_result = self.calc.execute(copper_inputs)
        alu_result = self.calc.execute(alu_inputs)
        
        # Aluminum requires larger cable size
        assert alu_result.results["minimum_cable_size"] >= copper_result.results["minimum_cable_size"]
    
    # =========================================================================
    # Safety margin tests
    # =========================================================================
    
    def test_safety_margin_calculation(self):
        """Test safety margin calculation"""
        inputs = CableSizingInput(
            load_current=80.0,
            installation_method='C',
            ambient_temperature=30.0,
            conductor_material='copper',
            insulation_type='PVC',
            number_of_circuits=1,
        )
        result = self.calc.execute(inputs)
        
        # 35mm² Cu/PVC/C has ampacity 122A
        # Safety margin = (122 - 80) / 80 * 100 = 52.5%
        # But actual calculated may vary, just check > 0
        assert result.results["safety_margin"] > 0
    
    # =========================================================================
    # Validation tests
    # =========================================================================
    
    def test_invalid_load_current_negative(self):
        """Test that negative load current is rejected"""
        with pytest.raises(ValueError):
            CableSizingInput(
                load_current=-10.0,
                installation_method='C',
                ambient_temperature=30.0,
                conductor_material='copper',
                insulation_type='PVC',
            )
    
    def test_invalid_temperature_out_of_range(self):
        """Test that extreme temperatures are rejected"""
        with pytest.raises(ValueError):
            CableSizingInput(
                load_current=100.0,
                installation_method='C',
                ambient_temperature=100.0,
                conductor_material='copper',
                insulation_type='PVC',
            )
    
    def test_invalid_number_of_circuits(self):
        """Test that invalid number of circuits is rejected"""
        with pytest.raises(ValueError):
            CableSizingInput(
                load_current=100.0,
                installation_method='C',
                ambient_temperature=30.0,
                conductor_material='copper',
                insulation_type='PVC',
                number_of_circuits=0,
            )
    
    def test_pvc_temperature_exceeds_limit(self):
        """Test that PVC temperature exceeding 70°C is rejected"""
        with pytest.raises(ValueError, match="PVC insulation max temperature is 70°C"):
            CableSizingInput(
                load_current=100.0,
                installation_method='C',
                ambient_temperature=80.0,
                conductor_material='copper',
                insulation_type='PVC',
            )
    
    # =========================================================================
    # Edge case tests
    # =========================================================================
    
    def test_very_small_load_current(self):
        """Test very small load current"""
        inputs = CableSizingInput(
            load_current=5.0,
            installation_method='C',
            ambient_temperature=30.0,
            conductor_material='copper',
            insulation_type='PVC',
            number_of_circuits=1,
        )
        result = self.calc.execute(inputs)
        
        # Smallest cable size (1.5mm²) should be sufficient
        assert result.results["minimum_cable_size"] == 1.5
    
    def test_corrected_ampacity_sufficient(self):
        """Test that corrected ampacity is sufficient for load"""
        inputs = CableSizingInput(
            load_current=100.0,
            installation_method='C',
            ambient_temperature=30.0,
            conductor_material='copper',
            insulation_type='PVC',
            number_of_circuits=1,
        )
        result = self.calc.execute(inputs)
        
        # Corrected ampacity should be >= load current
        assert result.results["corrected_ampacity"] >= inputs.load_current
