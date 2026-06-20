"""
Tests for PV-001: Solar PV System Sizing
"""

import pytest
from src.calculators.renewable.solar_pv import SolarPVCalculator
from src.calculators.renewable.schemas import SolarPVInput


class TestSolarPVCalculator:
    def setup_method(self):
        self.calc = SolarPVCalculator()

    def test_basic_grid_tied_sizing(self):
        """Grid-tied 30 kWh/day system with default panels."""
        inputs = SolarPVInput(
            daily_load_kwh=30.0,
            peak_sun_hours=5.0,
            panel_watt_peak=400.0,
        )
        result = self.calc.execute(inputs)

        assert result.calculation_code == "PV-001"
        r = result.results
        assert r["required_capacity_kwp"] > 0
        assert r["actual_capacity_kwp"] >= r["required_capacity_kwp"]
        assert r["panels_final"] >= r["panels_required"]
        assert r["panels_in_series"] > 0
        assert r["strings_in_parallel"] > 0
        assert r["daily_production_kwh"] > 0
        assert r["annual_production_kwh"] > 0
        assert r["voc_within_limit"] is True
        assert r["vmp_within_mppt"] is True
        assert r["string_design_valid"] is True
        assert r["battery"] is None

    def test_off_grid_with_battery(self):
        """Off-grid system with autonomy days set."""
        inputs = SolarPVInput(
            daily_load_kwh=20.0,
            peak_sun_hours=4.5,
            panel_watt_peak=400.0,
            autonomy_days=2.0,
            depth_of_discharge=0.8,
            battery_voltage=48.0,
        )
        result = self.calc.execute(inputs)

        assert result.calculation_code == "PV-001"
        r = result.results
        assert r["battery"] is not None
        assert r["battery"]["autonomy_days"] == 2.0
        assert r["battery"]["battery_capacity_kwh"] > 0
        assert r["battery"]["battery_capacity_ah"] > 0

    def test_low_irradiance_high_capacity(self):
        """High-load, low-irradiance scenario requiring many panels."""
        inputs = SolarPVInput(
            daily_load_kwh=100.0,
            peak_sun_hours=3.0,
            panel_watt_peak=300.0,
        )
        result = self.calc.execute(inputs)

        r = result.results
        assert r["panels_final"] >= 100 / (3 * 0.8) / (300 / 1000)
        assert r["strings_in_parallel"] >= 1

    def test_inverter_voltage_limits_respected(self):
        """String Voc_max must not exceed inverter max DC voltage."""
        inputs = SolarPVInput(
            daily_load_kwh=30.0,
            panel_watt_peak=400.0,
            panel_voc=49.0,
            inverter_voltage_dc_max=600.0,
            t_min=-20.0,
        )
        result = self.calc.execute(inputs)

        r = result.results
        assert r["string_voc_max_v"] <= 600.0
        assert r["string_design_valid"] is True

    def test_cold_temperature_voc_exceeds_inverter(self):
        """Very cold temps raise Voc — should produce warning."""
        inputs = SolarPVInput(
            daily_load_kwh=50.0,
            panel_watt_peak=400.0,
            panel_voc=49.0,
            inverter_voltage_dc_max=600.0,
            t_min=-30.0,
            peak_sun_hours=5.5,
        )
        result = self.calc.execute(inputs)

        r = result.results
        if not r["voc_within_limit"]:
            assert len(r["warnings"]) > 0

    def test_validation_raises_on_bad_psh(self):
        """Peak sun hours must be positive."""
        with pytest.raises(ValueError):
            inputs = SolarPVInput(
                daily_load_kwh=30.0,
                peak_sun_hours=0,
            )
            self.calc.execute(inputs)

    def test_units_are_defined(self):
        """All output fields have units."""
        units = self.calc.get_units()
        assert "required_capacity_kwp" in units
        assert "actual_capacity_kwp" in units
        assert "daily_production_kwh" in units
        assert "annual_production_kwh" in units
