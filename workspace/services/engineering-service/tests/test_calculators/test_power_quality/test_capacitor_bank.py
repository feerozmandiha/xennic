"""
Tests for PFC-001: Capacitor Bank Sizing (IEC 60831)
"""

import pytest
from src.calculators.power_quality.capacitor_bank import CapacitorBankCalculator
from src.calculators.power_quality.schemas import CapacitorBankInput


class TestCapacitorBankCalculator:
    def setup_method(self):
        self.calc = CapacitorBankCalculator()

    def test_basic_correction(self):
        """Basic PF correction from 0.80 to 0.95."""
        inputs = CapacitorBankInput(
            active_power_kw=100.0,
            power_factor_current=0.80,
            power_factor_target=0.95,
        )
        result = self.calc.execute(inputs)

        assert result.calculation_code == "PFC-001"
        r = result.results
        assert r["required_kvar"] > 0
        assert r["selected_bank_kvar"] >= r["required_kvar"]
        assert r["current_before_a"] > r["current_after_a"]
        assert r["current_reduction_pct"] > 0
        assert r["step_count"] >= 1
        assert len(r["protection_notes"]) > 0
        assert len(r["recommendation_notes"]) > 0

    def test_multi_step_automatic_bank(self):
        """6-step automatic PFC bank."""
        inputs = CapacitorBankInput(
            active_power_kw=200.0,
            power_factor_current=0.75,
            power_factor_target=0.95,
            step_count=6,
            voltage_v=400.0,
        )
        result = self.calc.execute(inputs)
        r = result.results
        assert r["step_count"] > 1
        assert r["step_size_kvar"] > 0
        assert r["max_current_per_step_a"] > 0

    def test_with_detuning(self):
        """Capacitor bank with 7% detuning reactor."""
        inputs = CapacitorBankInput(
            active_power_kw=300.0,
            power_factor_current=0.80,
            power_factor_target=0.95,
            detuning_pct=7.0,
            voltage_v=400.0,
        )
        result = self.calc.execute(inputs)
        r = result.results
        assert r["detuning_required"] is True
        assert r["detuning_pct"] == 7.0
        assert r["resonant_harmonic_order"] is not None
        assert r["resonant_harmonic_order"] > 0
        assert r["reactor_kvar"] is not None
        assert r["reactor_inductance_mh"] is not None

    def test_inrush_current_calculation(self):
        """Inrush current computed with short-circuit power provided."""
        inputs = CapacitorBankInput(
            active_power_kw=500.0,
            power_factor_current=0.85,
            power_factor_target=0.95,
            short_circuit_mva=50.0,
            voltage_v=400.0,
        )
        result = self.calc.execute(inputs)
        r = result.results
        assert r["short_circuit_kva"] > 0
        assert r["short_circuit_current_a"] > 0
        assert r["inrush_peak_current_a"] >= 0

    def test_economics(self):
        """Savings and payback calculation."""
        inputs = CapacitorBankInput(
            active_power_kw=200.0,
            power_factor_current=0.75,
            power_factor_target=0.95,
            load_hours_per_year=6000,
            energy_cost_per_kwh=0.12,
            capacitor_cost_per_kvar=15.0,
        )
        result = self.calc.execute(inputs)
        r = result.results
        assert r["annual_energy_savings_kwh"] is not None
        assert r["annual_cost_savings_usd"] is not None
        assert r["annual_cost_savings_usd"] > 0
        assert r["payback_years"] is not None
        assert r["payback_years"] > 0

    def test_apparent_power_input(self):
        """Capacitor sizing using apparent power + PF."""
        inputs = CapacitorBankInput(
            apparent_power_kva=250.0,
            power_factor_current=0.80,
            power_factor_target=0.95,
        )
        result = self.calc.execute(inputs)
        r = result.results
        assert r["required_kvar"] > 0
        assert r["load_power_kw"] == 200.0  # 250 * 0.8

    def test_fixed_bank_single_step(self):
        """Fixed capacitor bank (step_count=1 or default)."""
        inputs = CapacitorBankInput(
            active_power_kw=50.0,
            power_factor_current=0.82,
            power_factor_target=0.95,
        )
        result = self.calc.execute(inputs)
        r = result.results
        assert r["step_count"] == 1
        assert r["step_size_kvar"] == r["selected_bank_kvar"]

    def test_validation_raises_on_no_input(self):
        """Must provide either active_power_kw or apparent_power_kva."""
        with pytest.raises(ValueError):
            CapacitorBankInput(
                power_factor_current=0.80,
                power_factor_target=0.95,
            )

    def test_units_are_defined(self):
        """All output fields have units."""
        units = self.calc.get_units()
        assert "required_kvar" in units
        assert "selected_bank_kvar" in units
        assert "current_before_a" in units
        assert "fuse_rating_a" in units
        assert "annual_savings_usd" in units
