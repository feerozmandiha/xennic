"""
Unit tests for Transformer Engineering Calculators
"""

import pytest
from src.calculators.transformer.sizing import TransformerSizingCalculator
from src.calculators.transformer.losses import TransformerLossesCalculator
from src.calculators.transformer.regulation import TransformerRegulationCalculator
from src.calculators.transformer.k_factor import KFactorCalculator
from src.calculators.transformer.schemas import (
    TransformerSizingInput,
    TransformerLossesInput,
    TransformerRegulationInput,
    KFactorInput,
)
from src.core.exceptions import ValidationError


class TestTransformerSizing:
    """Tests for TRF-001: Transformer Sizing"""
    
    def setup_method(self):
        self.calc = TransformerSizingCalculator()
    
    def test_three_phase_from_power(self):
        """Test three-phase transformer sizing from power"""
        inputs = TransformerSizingInput(
            apparent_power_kva=1000.0,
            voltage_primary_v=11000.0,
            voltage_secondary_v=400.0,
            phase_type='three',
        )
        result = self.calc.execute(inputs)
        
        # I_primary = 1000 * 1000 / (1.732 * 11000) ≈ 52.5A
        assert abs(result.results["current_primary_a"] - 52.5) < 1
        # I_secondary = 1000 * 1000 / (1.732 * 400) ≈ 1443A
        assert abs(result.results["current_secondary_a"] - 1443) < 10
    
    def test_single_phase_from_power(self):
        """Test single-phase transformer sizing from power"""
        inputs = TransformerSizingInput(
            apparent_power_kva=50.0,
            voltage_primary_v=230.0,
            voltage_secondary_v=24.0,
            phase_type='single',
        )
        result = self.calc.execute(inputs)
        
        # I_primary = 50 * 1000 / 230 ≈ 217A
        assert abs(result.results["current_primary_a"] - 217.4) < 1
        # I_secondary = 50 * 1000 / 24 ≈ 2083A
        assert abs(result.results["current_secondary_a"] - 2083.3) < 10
    
    def test_three_phase_from_primary_current(self):
        """Test three-phase transformer sizing from primary current"""
        inputs = TransformerSizingInput(
            voltage_primary_v=11000.0,
            current_primary_a=52.5,
            voltage_secondary_v=400.0,
            phase_type='three',
        )
        result = self.calc.execute(inputs)
        
        # S = 1.732 * 11000 * 52.5 / 1000 ≈ 1000kVA
        assert abs(result.results["apparent_power_kva"] - 1000) < 10
    
    def test_standard_size_recommendation(self):
        """Test standard transformer size recommendation"""
        inputs = TransformerSizingInput(
            apparent_power_kva=120.0,
            voltage_primary_v=11000.0,
            voltage_secondary_v=400.0,
        )
        result = self.calc.execute(inputs)
        
        # Next standard size above 120kVA is 150kVA
        assert result.results["recommended_standard_size_kva"] == 150.0


class TestTransformerLosses:
    """Tests for TRF-002: Transformer Losses"""
    
    def setup_method(self):
        self.calc = TransformerLossesCalculator()
    
    def test_losses_at_rated_load(self):
        """Test losses at rated load (load factor = 1.0)"""
        inputs = TransformerLossesInput(
            no_load_loss_w=2000.0,
            load_loss_w=10000.0,
            load_factor=1.0,
            operating_hours_per_year=8760,
            energy_cost_per_kwh=0.12,
        )
        result = self.calc.execute(inputs)
        
        # Total losses = 2000 + 10000 = 12000W = 12kW
        assert result.results["total_losses_kw"] == 12.0
        # Annual energy = 12 * 8760 = 105120 kWh
        assert result.results["annual_energy_loss_kwh"] == 105120
    
    def test_losses_at_partial_load(self):
        """Test losses at 50% load (load factor = 0.5)"""
        inputs = TransformerLossesInput(
            no_load_loss_w=2000.0,
            load_loss_w=10000.0,
            load_factor=0.5,
            operating_hours_per_year=8760,
            energy_cost_per_kwh=0.12,
        )
        result = self.calc.execute(inputs)
        
        # Load loss at 50% = 10000 * 0.25 = 2500W
        # Total losses = 2000 + 2500 = 4500W = 4.5kW
        assert result.results["total_losses_kw"] == 4.5
    
    def test_annual_cost_calculation(self):
        """Test annual cost calculation"""
        inputs = TransformerLossesInput(
            no_load_loss_w=1000.0,
            load_loss_w=5000.0,
            load_factor=0.8,
            operating_hours_per_year=8000,
            energy_cost_per_kwh=0.15,
        )
        result = self.calc.execute(inputs)
        
        # Total losses = 1000 + 5000*0.64 = 4200W = 4.2kW
        # Annual energy = 4.2 * 8000 = 33600 kWh
        # Cost = 33600 * 0.15 = 5040 USD
        assert abs(result.results["annual_cost_usd"] - 5040) < 10
    
    def test_efficiency_calculation(self):
        """Test efficiency calculation"""
        inputs = TransformerLossesInput(
            no_load_loss_w=1000.0,
            load_loss_w=5000.0,
            load_factor=1.0,
            operating_hours_per_year=8760,
            energy_cost_per_kwh=0.12,
        )
        result = self.calc.execute(inputs)
        
        # Efficiency should be > 98% for typical transformer
        assert result.results["efficiency_percent"] > 98.0


class TestTransformerRegulation:
    """Tests for TRF-003: Voltage Regulation"""
    
    def setup_method(self):
        self.calc = TransformerRegulationCalculator()
    
    def test_regulation_at_unity_pf(self):
        """Test voltage regulation at unity power factor"""
        inputs = TransformerRegulationInput(
            impedance_percent=5.0,
            power_factor=1.0,
            load_percent=100,
        )
        result = self.calc.execute(inputs)
        
        # Regulation should be positive (voltage drop)
        assert result.results["voltage_regulation_percent"] > 0
    
    def test_regulation_at_lagging_pf(self):
        """Test voltage regulation at lagging power factor"""
        inputs = TransformerRegulationInput(
            impedance_percent=5.0,
            power_factor=0.8,
            load_percent=100,
        )
        result = self.calc.execute(inputs)
        
        # Lower power factor = higher regulation
        assert result.results["voltage_regulation_percent"] > 0
    
    def test_regulation_at_partial_load(self):
        """Test voltage regulation at 50% load"""
        inputs = TransformerRegulationInput(
            impedance_percent=5.0,
            power_factor=0.8,
            load_percent=50,
        )
        result = self.calc.execute(inputs)
        
        # Regulation should be approximately half of full load
        assert result.results["voltage_regulation_percent"] > 0
        assert result.results["is_within_limits"] is True


class TestKFactor:
    """Tests for TRF-004: K-Factor"""
    
    def setup_method(self):
        self.calc = KFactorCalculator()
    
    def test_no_harmonics(self):
        """Test K-Factor with no harmonics should raise error"""
        inputs = KFactorInput(
            harmonic_currents={}
        )
        with pytest.raises(ValueError):
            self.calc.execute(inputs)
    
    def test_only_fundamental(self):
        """Test K-Factor with only fundamental (pure sine wave)"""
        inputs = KFactorInput(
            harmonic_currents={
                1: 100.0,
            }
        )
        result = self.calc.execute(inputs)
        
        # Pure sine wave should have K = 1.0
        assert result.results["k_factor"] == 1.0
    
    def test_typical_six_pulse_drive(self):
        """Test K-Factor for typical 6-pulse VFD (5th and 7th harmonics)"""
        inputs = KFactorInput(
            harmonic_currents={
                5: 20.0,   # 20% 5th harmonic
                7: 14.0,   # 14% 7th harmonic
                11: 9.0,   # 9% 11th harmonic
                13: 7.0,   # 7% 13th harmonic
            }
        )
        result = self.calc.execute(inputs)
        
        # K-Factor should be > 1 (indicating harmonic content)
        # Actual value may be high due to h² weighting
        assert result.results["k_factor"] > 1.0
    
    def test_k_factor_increases_with_harmonic_order(self):
        """Test that higher harmonic orders increase K-Factor"""
        low_order_inputs = KFactorInput(
            harmonic_currents={
                3: 30.0,
            }
        )
        high_order_inputs = KFactorInput(
            harmonic_currents={
                13: 30.0,
            }
        )
        
        low_result = self.calc.execute(low_order_inputs)
        high_result = self.calc.execute(high_order_inputs)
        
        # Same magnitude, higher order = higher K-Factor
        assert high_result.results["k_factor"] > low_result.results["k_factor"]
    
    def test_high_harmonic_content(self):
        """Test K-Factor with high harmonic content"""
        inputs = KFactorInput(
            harmonic_currents={
                3: 50.0,
                5: 30.0,
                7: 20.0,
                9: 10.0,
            }
        )
        result = self.calc.execute(inputs)
        
        # K-Factor should be higher for significant harmonics
        assert result.results["k_factor"] > 5.0
    
    def test_derating_factor(self):
        """Test derating factor calculation"""
        inputs = KFactorInput(
            harmonic_currents={
                5: 30.0,
                7: 25.0,
            }
        )
        result = self.calc.execute(inputs)
        
        # Derating factor should be less than 1.0 for non-linear loads
        assert result.results["derating_factor"] < 1.0
    
    def test_k_factor_standard_rating(self):
        """Test standard K-Factor rating selection"""
        inputs = KFactorInput(
            harmonic_currents={
                5: 40.0,
                7: 30.0,
            }
        )
        result = self.calc.execute(inputs)
        
        # Recommended rating should be one of standard values
        assert result.results["recommended_k_factor_rating"] in [4, 9, 13, 20, 30, 40, 50]
    
    def test_k_factor_1_derates_to_1(self):
        """Test that K=1 gives derating factor of 1.0"""
        inputs = KFactorInput(
            harmonic_currents={
                1: 100.0,
            }
        )
        result = self.calc.execute(inputs)
        
        assert result.results["derating_factor"] == 1.0
