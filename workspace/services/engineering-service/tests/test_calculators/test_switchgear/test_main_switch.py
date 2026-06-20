"""
Unit tests for Main Switch / Incomer Selection (SWT-001)
"""

import pytest
from src.calculators.switchgear.main_switch import MainSwitchCalculator
from src.calculators.switchgear.schemas import MainSwitchInput


class TestMainSwitch:
    """Tests for SWT-001: Main Switch / Incomer Selection"""

    def setup_method(self):
        self.calc = MainSwitchCalculator()

    def test_acb_from_transformer(self):
        """630kVA transformer at 400V should select ~1000A ACB"""
        inputs = MainSwitchInput(
            transformer_kva=630.0,
            short_circuit_current_ka=25.0,
            voltage_v=400.0,
            switch_type='acb',
            lsig_required=True,
        )
        result = self.calc.execute(inputs)
        data = result.results
        # I = 630kVA / (√3 × 400V) = 909A → next standard = 1000A
        assert data['recommended_rated_current_a'] == 1000.0
        assert data['switch_type'] == 'acb'
        assert data['is_sufficient'] is True
        assert data['lsig'] is not None
        assert data['lsig']['long_time_pickup_a'] == 1000.0

    def test_mccb_from_connected_load(self):
        """500kVA connected load with 0.8 diversity → MCCB 630A"""
        inputs = MainSwitchInput(
            total_connected_kva=500.0,
            diversity_factor=0.8,
            short_circuit_current_ka=25.0,
            voltage_v=400.0,
            switch_type='mccb',
        )
        result = self.calc.execute(inputs)
        data = result.results
        # I = 500kVA × 0.8 / (√3 × 400) = 577A → next = 630A
        assert data['recommended_rated_current_a'] >= 630.0
        assert data['design_current_a'] > 0
        assert data['diversity_factor'] == 0.8

    def test_changeover_dual_source(self):
        """Dual source system should use changeover switch"""
        inputs = MainSwitchInput(
            total_connected_kva=300.0,
            short_circuit_current_ka=25.0,
            voltage_v=400.0,
            switch_type='changeover',
            num_sources=2,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['switch_type'] == 'changeover'
        assert data['num_sources'] == 2
        assert data['recommended_rated_current_a'] > 0

    def test_switch_disconnector_no_lsig(self):
        """Switch-disconnector should have no LSIG and appropriate notes"""
        inputs = MainSwitchInput(
            total_connected_kva=200.0,
            short_circuit_current_ka=16.0,
            voltage_v=400.0,
            switch_type='switch_disconnector',
            lsig_required=False,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['lsig'] is None
        assert any('isolation' in n for n in data['recommendation_notes'])

    def test_4_pole_with_ground_fault(self):
        """4-pole ACB should include ground fault settings"""
        inputs = MainSwitchInput(
            transformer_kva=1000.0,
            short_circuit_current_ka=25.0,
            voltage_v=400.0,
            switch_type='acb',
            pole_count=4,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['pole_count'] == 4
        assert data['lsig'] is not None
        assert data['lsig']['ground_fault_pickup_a'] is not None
        assert data['lsig']['ground_fault_delay_s'] is not None

    def test_temperature_derating(self):
        """Higher temperature should increase selected rating"""
        inputs_hot = MainSwitchInput(
            transformer_kva=630.0,
            short_circuit_current_ka=25.0,
            voltage_v=400.0,
            ambient_temperature=60.0,
        )
        inputs_cool = MainSwitchInput(
            transformer_kva=630.0,
            short_circuit_current_ka=25.0,
            voltage_v=400.0,
            ambient_temperature=30.0,
        )
        result_hot = self.calc.execute(inputs_hot)
        result_cool = self.calc.execute(inputs_cool)
        assert result_hot.results['recommended_rated_current_a'] >= result_cool.results['recommended_rated_current_a']

    def test_transformer_over_connected(self):
        """When transformer is larger than connected load, transformer dominates"""
        inputs = MainSwitchInput(
            total_connected_kva=400.0,
            transformer_kva=1000.0,
            short_circuit_current_ka=25.0,
            voltage_v=400.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        # Transformer = 1443A → next = 1600A
        assert data['recommended_rated_current_a'] == 1600.0

    def test_invalid_sources_with_mccb(self):
        """Multiple sources with MCCB should raise ValueError"""
        with pytest.raises(ValueError, match="For multiple sources"):
            MainSwitchInput(
                total_connected_kva=400.0,
                short_circuit_current_ka=25.0,
                voltage_v=400.0,
                switch_type='mccb',
                num_sources=2,
            )

    def test_no_power_source_raises(self):
        """Neither connected load nor transformer should raise error"""
        with pytest.raises(ValueError, match="Provide either"):
            MainSwitchInput(
                short_circuit_current_ka=25.0,
                voltage_v=400.0,
            )
