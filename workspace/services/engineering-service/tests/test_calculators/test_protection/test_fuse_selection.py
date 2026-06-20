"""
Unit tests for Fuse Selection Calculator (PROT-004)
"""

import pytest
from src.calculators.protection.fuse_selection import FuseSelectionCalculator
from src.calculators.protection.schemas import FuseSelectionInput


class TestFuseSelection:
    """Tests for PROT-004: Fuse Selection per IEC 60269"""

    def setup_method(self):
        self.calc = FuseSelectionCalculator()

    def test_gG_general_purpose(self):
        """100A load should select 125A gG fuse (100 × 1.25 = 125)"""
        inputs = FuseSelectionInput(
            load_current_a=100.0,
            short_circuit_current_ka=25.0,
            voltage_v=400.0,
            fuse_type='gG',
            application='general',
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['standard_fuse_rating_a'] == 125.0
        assert data['fuse_type'] == 'gG'
        assert data['is_sufficient'] is True
        assert data['breaking_capacity_ka'] >= 25.0

    def test_gG_next_size(self):
        """105A load should round up to 125A"""
        inputs = FuseSelectionInput(
            load_current_a=105.0,
            short_circuit_current_ka=50.0,
            voltage_v=400.0,
            fuse_type='gG',
            application='general',
        )
        result = self.calc.execute(inputs)
        data = result.results
        # 105 × 1.25 = 131.25 → next standard = 160
        assert data['standard_fuse_rating_a'] == 160.0

    def test_gM_motor(self):
        """Motor with 600A starting current should select gM fuse"""
        inputs = FuseSelectionInput(
            load_current_a=100.0,
            short_circuit_current_ka=25.0,
            voltage_v=400.0,
            fuse_type='gM',
            application='motor',
            motor_starting_current_a=600.0,
            motor_starting_duration_s=5.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        # starting 600A / 4 (for 5s) = 150A → next standard = 160
        assert data['standard_fuse_rating_a'] >= 150.0
        assert data['fuse_type'] == 'gM'

    def test_aM_backup(self):
        """aM fuse for motor backup protection"""
        inputs = FuseSelectionInput(
            load_current_a=100.0,
            short_circuit_current_ka=50.0,
            voltage_v=400.0,
            fuse_type='aM',
            application='motor',
            motor_starting_current_a=600.0,
            motor_starting_duration_s=3.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        # aM: In ≥ 100 × 1.1 = 110 → next standard = 125
        assert data['standard_fuse_rating_a'] == 125.0
        assert data['breaking_capacity_ka'] == 100.0  # aM has 100kA

    def test_temperature_derating(self):
        """High ambient should increase required rating"""
        inputs_hot = FuseSelectionInput(
            load_current_a=100.0,
            short_circuit_current_ka=25.0,
            voltage_v=400.0,
            fuse_type='gG',
            ambient_temperature=60.0,
        )
        result_hot = self.calc.execute(inputs_hot)
        data_hot = result_hot.results

        inputs_cool = FuseSelectionInput(
            load_current_a=100.0,
            short_circuit_current_ka=25.0,
            voltage_v=400.0,
            fuse_type='gG',
            ambient_temperature=30.0,
        )
        result_cool = self.calc.execute(inputs_cool)
        data_cool = result_cool.results

        assert data_hot['standard_fuse_rating_a'] >= data_cool['standard_fuse_rating_a']
        assert data_hot['temperature_derating_factor'] < data_cool['temperature_derating_factor']

    def test_i2t_estimate(self):
        """gG fuse should have I²t estimate"""
        inputs = FuseSelectionInput(
            load_current_a=63.0,
            short_circuit_current_ka=25.0,
            voltage_v=400.0,
            fuse_type='gG',
        )
        result = self.calc.execute(inputs)
        data = result.results
        # 63A fuse → 63 × 1.25 = 78.75 → next = 80A → I²t ~ some value
        assert data['i2t_estimate_a2s'] is not None
        assert data['i2t_estimate_a2s'] > 0

    def test_aM_no_i2t(self):
        """aM fuse should not have I²t estimate"""
        inputs = FuseSelectionInput(
            load_current_a=100.0,
            short_circuit_current_ka=50.0,
            voltage_v=400.0,
            fuse_type='aM',
            application='motor',
            motor_starting_current_a=600.0,
            motor_starting_duration_s=3.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['i2t_estimate_a2s'] is None

    def test_gG_selectivity_ratio(self):
        """gG fuse should have selectivity ratio"""
        inputs = FuseSelectionInput(
            load_current_a=100.0,
            short_circuit_current_ka=25.0,
            voltage_v=400.0,
            fuse_type='gG',
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['selectivity_ratio'] is not None
        assert data['selectivity_ratio'] > 1.0

    def test_motor_params_required(self):
        """gM motor application without starting current should raise error"""
        with pytest.raises(ValueError, match="motor_starting_current_a is required"):
            FuseSelectionInput(
                load_current_a=100.0,
                short_circuit_current_ka=25.0,
                voltage_v=400.0,
                fuse_type='gM',
                application='motor',
            )
