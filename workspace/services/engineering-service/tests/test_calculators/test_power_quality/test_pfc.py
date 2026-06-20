"""
Unit tests for Power Factor Correction Calculator (CAP-001)
"""

import math
import pytest
from src.calculators.power_quality.pfc import PFCorrectionCalculator
from src.calculators.power_quality.schemas import PFCorrectionInput


class TestPFCorrection:
    """Tests for CAP-001: Power Factor Correction"""

    def setup_method(self):
        self.calc = PFCorrectionCalculator()

    def test_required_kvar_basic(self):
        """100kW from PF 0.80 → 0.95 should give ~45.6 kVAr"""
        inputs = PFCorrectionInput(
            active_power_kw=100.0,
            power_factor_current=0.80,
            power_factor_target=0.95,
            voltage_v=400.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        # tan(acos(0.80)) = 0.750, tan(acos(0.95)) = 0.329
        # Qc = 100 × (0.750 - 0.329) = 42.1
        assert abs(data['required_kvar'] - 42.1) < 1
        assert data['recommended_bank_kvar'] == 50.0  # next standard size

    def test_current_reduction(self):
        """Current should decrease after PF correction"""
        inputs = PFCorrectionInput(
            active_power_kw=100.0,
            power_factor_current=0.70,
            power_factor_target=0.95,
            voltage_v=400.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['current_before_a'] > data['current_after_a']
        assert data['current_reduction_percent'] > 0
        assert data['current_reduction_percent'] < 100

    def test_apparent_power_reduction(self):
        """Apparent power should decrease after correction"""
        inputs = PFCorrectionInput(
            active_power_kw=200.0,
            power_factor_current=0.75,
            power_factor_target=0.92,
            voltage_v=400.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['apparent_power_before_kva'] > data['apparent_power_after_kva']

    def test_from_apparent_power(self):
        """Calculation using apparent_power_kva instead of active_power_kw"""
        inputs = PFCorrectionInput(
            apparent_power_kva=125.0,
            power_factor_current=0.80,
            power_factor_target=0.95,
            voltage_v=400.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        # P = 125 × 0.80 = 100 kW
        assert abs(data['active_power_kw'] - 100.0) < 1
        assert data['required_kvar'] > 0

    def test_detuning_reactor(self):
        """With 7% detuning, resonant harmonic should be ~3.78"""
        inputs = PFCorrectionInput(
            active_power_kw=100.0,
            power_factor_current=0.80,
            power_factor_target=0.95,
            voltage_v=400.0,
            detuning_pct=7.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['detuning_reactor_required'] is True
        assert data['resonant_harmonic_order'] is not None
        expected = round(1.0 / math.sqrt(0.07), 2)
        assert abs(data['resonant_harmonic_order'] - expected) < 0.1

    def test_no_detuning(self):
        """Without detuning, resonant_harmonic_order should be None"""
        inputs = PFCorrectionInput(
            active_power_kw=100.0,
            power_factor_current=0.80,
            power_factor_target=0.95,
            voltage_v=400.0,
            detuning_pct=0.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['detuning_reactor_required'] is False
        assert data['resonant_harmonic_order'] is None

    def test_loss_reduction(self):
        """With cable resistance provided, loss reduction should be calculated"""
        inputs = PFCorrectionInput(
            active_power_kw=100.0,
            power_factor_current=0.80,
            power_factor_target=0.95,
            voltage_v=400.0,
            cable_resistance_per_phase_ohm=0.05,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['power_loss_reduction_kw'] is not None
        assert data['power_loss_reduction_kw'] > 0

    def test_annual_savings(self):
        """With hours and cost provided, savings should be calculated"""
        inputs = PFCorrectionInput(
            active_power_kw=100.0,
            power_factor_current=0.80,
            power_factor_target=0.95,
            voltage_v=400.0,
            cable_resistance_per_phase_ohm=0.05,
            load_hours_per_year=6000.0,
            energy_cost_per_kwh=0.12,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['annual_energy_savings_kwh'] is not None
        assert data['annual_cost_savings_usd'] is not None
        assert data['annual_energy_savings_kwh'] > 0
        assert data['annual_cost_savings_usd'] > 0

    def test_payback_period(self):
        """With capacitor cost provided, payback should be calculated"""
        inputs = PFCorrectionInput(
            active_power_kw=100.0,
            power_factor_current=0.80,
            power_factor_target=0.95,
            voltage_v=400.0,
            cable_resistance_per_phase_ohm=0.05,
            load_hours_per_year=6000.0,
            energy_cost_per_kwh=0.12,
            capacitor_cost_per_kvar=15.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['payback_period_years'] is not None
        assert data['payback_period_years'] > 0

    def test_invalid_input_raises_error(self):
        """Providing neither power nor kVA should raise ValueError"""
        with pytest.raises(ValueError):
            PFCorrectionInput(
                power_factor_current=0.80,
                power_factor_target=0.95,
                voltage_v=400.0,
            )
