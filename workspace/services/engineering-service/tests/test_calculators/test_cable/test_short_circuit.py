"""
Unit tests for Short Circuit Withstand Calculator (CABLE-003)
"""

import pytest
from src.calculators.cable.short_circuit import ShortCircuitWithstandCalculator
from src.calculators.cable.schemas import ShortCircuitInput, PEConductorInput


class TestShortCircuitWithstandCalculator:
    """Test suite for ShortCircuitWithstandCalculator"""
    
    def setup_method(self):
        self.calc = ShortCircuitWithstandCalculator()
    
    def test_copper_pvc_short_circuit(self):
        """Test copper/PVC cable short circuit withstand"""
        inputs = ShortCircuitInput(
            short_circuit_current_ka=10.0,
            fault_duration_s=1.0,
            conductor_material='copper',
            insulation_type='PVC',
        )
        result = self.calc.execute(inputs)
        
        # For I=10kA, t=1s, k=115: S = √(10000² × 1) / 115 ≈ 87mm²
        assert result.results["minimum_cable_size"] > 80
        assert result.results["minimum_cable_size"] < 95
        assert result.results["k_factor"] == 115
    
    def test_copper_xlpe_short_circuit(self):
        """Test copper/XLPE cable short circuit withstand (higher k = smaller cable)"""
        inputs = ShortCircuitInput(
            short_circuit_current_ka=10.0,
            fault_duration_s=1.0,
            conductor_material='copper',
            insulation_type='XLPE',
        )
        result = self.calc.execute(inputs)
        
        # For I=10kA, t=1s, k=143: S = √(10000² × 1) / 143 ≈ 70mm²
        assert result.results["minimum_cable_size"] > 65
        assert result.results["minimum_cable_size"] < 75
        assert result.results["k_factor"] == 143
    
    def test_aluminum_pvc_short_circuit(self):
        """Test aluminum/PVC cable short circuit withstand (lower k = larger cable)"""
        inputs = ShortCircuitInput(
            short_circuit_current_ka=10.0,
            fault_duration_s=1.0,
            conductor_material='aluminum',
            insulation_type='PVC',
        )
        result = self.calc.execute(inputs)
        
        # For I=10kA, t=1s, k=76: S = √(10000² × 1) / 76 ≈ 132mm²
        assert result.results["minimum_cable_size"] > 125
        assert result.results["minimum_cable_size"] < 140
        assert result.results["k_factor"] == 76
    
    def test_different_fault_durations(self):
        """Test that longer fault duration requires larger cable"""
        short_inputs = ShortCircuitInput(
            short_circuit_current_ka=10.0,
            fault_duration_s=0.1,
            conductor_material='copper',
            insulation_type='PVC',
        )
        long_inputs = ShortCircuitInput(
            short_circuit_current_ka=10.0,
            fault_duration_s=1.0,
            conductor_material='copper',
            insulation_type='PVC',
        )
        
        short_result = self.calc.execute(short_inputs)
        long_result = self.calc.execute(long_inputs)
        
        # Longer duration requires larger cable
        assert long_result.results["minimum_cable_size"] > short_result.results["minimum_cable_size"]
    
    def test_higher_current_requires_larger_cable(self):
        """Test that higher short circuit current requires larger cable"""
        low_current = ShortCircuitInput(
            short_circuit_current_ka=5.0,
            fault_duration_s=1.0,
            conductor_material='copper',
            insulation_type='PVC',
        )
        high_current = ShortCircuitInput(
            short_circuit_current_ka=20.0,
            fault_duration_s=1.0,
            conductor_material='copper',
            insulation_type='PVC',
        )
        
        low_result = self.calc.execute(low_current)
        high_result = self.calc.execute(high_current)
        
        # Higher current requires larger cable
        assert high_result.results["minimum_cable_size"] > low_result.results["minimum_cable_size"]
    
    def test_recommended_size_rounding(self):
        """Test that recommended size rounds up to standard size"""
        inputs = ShortCircuitInput(
            short_circuit_current_ka=8.0,
            fault_duration_s=1.0,
            conductor_material='copper',
            insulation_type='PVC',
        )
        result = self.calc.execute(inputs)
        
        standard_sizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400]
        # Recommended should be a standard size
        assert result.results["recommended_cable_size"] in standard_sizes
    
    def test_invalid_current_negative(self):
        """Test that negative current is rejected by Pydantic"""
        with pytest.raises(ValueError):
            ShortCircuitInput(
                short_circuit_current_ka=-10.0,
                fault_duration_s=1.0,
                conductor_material='copper',
                insulation_type='PVC',
            )
    
    def test_invalid_duration_zero(self):
        """Test that zero duration is rejected by Pydantic"""
        with pytest.raises(ValueError):
            ShortCircuitInput(
                short_circuit_current_ka=10.0,
                fault_duration_s=0,
                conductor_material='copper',
                insulation_type='PVC',
            )


class TestPESizingCalculator:
    """Test suite for PE Conductor Sizing (CABLE-004)"""
    
    def setup_method(self):
        from src.calculators.cable.pe_sizing import PESizingCalculator
        self.calc = PESizingCalculator()
    
    def test_pe_size_small_phase(self):
        """Test PE sizing when phase ≤ 16mm²"""
        inputs = PEConductorInput(
            phase_conductor_size=10.0,
            conductor_material='copper',
        )
        result = self.calc.execute(inputs)
        
        # PE should equal phase size (10mm²)
        assert result.results["minimum_pe_size"] == 10.0
    
    def test_pe_size_medium_phase(self):
        """Test PE sizing when 16 < phase ≤ 35mm²"""
        inputs = PEConductorInput(
            phase_conductor_size=25.0,
            conductor_material='copper',
        )
        result = self.calc.execute(inputs)
        
        # PE should be 16mm²
        assert result.results["minimum_pe_size"] == 16.0
    
    def test_pe_size_large_phase(self):
        """Test PE sizing when phase > 35mm²"""
        inputs = PEConductorInput(
            phase_conductor_size=70.0,
            conductor_material='copper',
        )
        result = self.calc.execute(inputs)
        
        # PE should be phase/2 = 35mm²
        assert result.results["minimum_pe_size"] == 35.0
    
    def test_pe_size_very_large_phase(self):
        """Test PE sizing for very large phase conductor"""
        inputs = PEConductorInput(
            phase_conductor_size=300.0,
            conductor_material='copper',
        )
        result = self.calc.execute(inputs)
        
        # PE should be 150mm² (next standard size after 150)
        assert result.results["minimum_pe_size"] == 150.0
    
    def test_pe_size_boundary_16mm2(self):
        """Test PE sizing at boundary 16mm²"""
        inputs = PEConductorInput(
            phase_conductor_size=16.0,
            conductor_material='copper',
        )
        result = self.calc.execute(inputs)
        
        # At boundary, PE equals phase size (16mm²)
        assert result.results["minimum_pe_size"] == 16.0
    
    def test_pe_size_boundary_35mm2(self):
        """Test PE sizing at boundary 35mm²"""
        inputs = PEConductorInput(
            phase_conductor_size=35.0,
            conductor_material='copper',
        )
        result = self.calc.execute(inputs)
        
        # At boundary (35mm²), PE should be 16mm²
        assert result.results["minimum_pe_size"] == 16.0
    
    def test_pe_size_aluminum(self):
        """Test PE sizing for aluminum (rules are same)"""
        inputs = PEConductorInput(
            phase_conductor_size=50.0,
            conductor_material='aluminum',
        )
        result = self.calc.execute(inputs)
        
        # Same rules apply regardless of material
        assert result.results["minimum_pe_size"] == 25.0
    
    def test_invalid_phase_size_negative(self):
        """Test that negative phase size is rejected by Pydantic"""
        with pytest.raises(ValueError):
            PEConductorInput(
                phase_conductor_size=-10.0,
                conductor_material='copper',
            )
    
    def test_pe_size_ratio(self):
        """Test that ratio is calculated correctly"""
        inputs = PEConductorInput(
            phase_conductor_size=50.0,
            conductor_material='copper',
        )
        result = self.calc.execute(inputs)
        
        # Ratio = 25/50 = 0.5
        assert result.results["ratio"] == 0.5
