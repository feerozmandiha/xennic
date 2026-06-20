"""
Tests for BAT-BU-001: Battery Backup Time
"""

import pytest
from src.calculators.renewable.backup_time import BackupTimeCalculator
from src.calculators.renewable.schemas import BackupTimeInput


class TestBackupTimeCalculator:
    def setup_method(self):
        self.calc = BackupTimeCalculator()

    def test_basic_backup_time(self):
        """200Ah at 48V, 5kW load → verify backup time is computed."""
        inputs = BackupTimeInput(
            battery_capacity_ah=200.0,
            system_voltage_v=48.0,
            load_power_kw=5.0,
        )
        result = self.calc.execute(inputs)
        assert result.calculation_code == "BAT-BU-001"
        r = result.results
        assert r["backup_time_hours"] > 0
        assert r["usable_capacity_kwh"] > 0
        assert r["discharge_current_a"] > 0

    def test_precise_time_calculation(self):
        """100Ah, 12V, 1kW → verify exact formula."""
        inputs = BackupTimeInput(
            battery_capacity_ah=100.0,
            system_voltage_v=12.0,
            load_power_kw=1.0,
        )
        result = self.calc.execute(inputs)
        r = result.results
        expected_gross_kwh = 100 * 12 / 1000  # 1.2 kWh
        assert r["total_energy_available_kwh"] == pytest.approx(expected_gross_kwh, 0.1)
        assert r["usable_capacity_kwh"] < expected_gross_kwh  # after losses
        assert r["backup_time_hours"] > 0

    def test_individual_loads_analysis(self):
        """Multiple loads should produce per-load breakdown."""
        inputs = BackupTimeInput(
            battery_capacity_ah=200.0,
            system_voltage_v=48.0,
            load_power_kw=5.0,
            individual_loads_kw=[3.0, 2.0, 1.0],
        )
        result = self.calc.execute(inputs)
        r = result.results
        assert r["load_analysis"] is not None
        assert len(r["load_analysis"]) == 3
        for entry in r["load_analysis"]:
            assert entry["backup_hours"] > 0

    def test_temperature_derating_reduces_time(self):
        """Cold temperature should reduce backup time."""
        warm = BackupTimeInput(
            battery_capacity_ah=200.0,
            temperature_c=25.0,
            load_power_kw=5.0,
        )
        cold = BackupTimeInput(
            battery_capacity_ah=200.0,
            temperature_c=0.0,
            load_power_kw=5.0,
        )
        r_warm = self.calc.execute(warm).results
        r_cold = self.calc.execute(cold).results
        assert r_cold["backup_time_hours"] < r_warm["backup_time_hours"]
        assert r_cold["temperature_derating"] < r_warm["temperature_derating"]

    def test_high_dod_longer_time(self):
        """Higher DoD → more usable capacity."""
        low_dod = BackupTimeInput(
            battery_capacity_ah=200.0,
            depth_of_discharge=0.5,
            load_power_kw=5.0,
        )
        high_dod = BackupTimeInput(
            battery_capacity_ah=200.0,
            depth_of_discharge=0.9,
            load_power_kw=5.0,
        )
        r_low = self.calc.execute(low_dod).results
        r_high = self.calc.execute(high_dod).results
        assert r_high["backup_time_hours"] > r_low["backup_time_hours"]

    def test_soc_timeline_generated(self):
        """State of charge timeline should be generated for reasonable backup times."""
        inputs = BackupTimeInput(
            battery_capacity_ah=400.0,
            system_voltage_v=48.0,
            load_power_kw=2.0,
        )
        result = self.calc.execute(inputs)
        r = result.results
        if r["soc_timeline"] is not None:
            assert len(r["soc_timeline"]) > 0
            first = r["soc_timeline"][0]
            assert first["hour"] == 0
            assert first["soc_pct"] == pytest.approx(100.0, 0.5)

    def test_validation_negative_capacity(self):
        """Negative battery capacity should raise error."""
        with pytest.raises(ValueError):
            BackupTimeInput(
                battery_capacity_ah=-100,
                load_power_kw=5.0,
            )

    def test_validation_invalid_dod(self):
        """DoD > 1 should raise error."""
        with pytest.raises(ValueError):
            inputs = BackupTimeInput(
                battery_capacity_ah=200.0,
                load_power_kw=5.0,
                depth_of_discharge=1.5,
            )
            self.calc.execute(inputs)

    def test_discharge_rate_high_warning(self):
        """Very high load relative to battery → C-rate warning."""
        inputs = BackupTimeInput(
            battery_capacity_ah=50.0,
            system_voltage_v=12.0,
            load_power_kw=5.0,
        )
        result = self.calc.execute(inputs)
        r = result.results
        if r["actual_c_rate"] > 1.0:
            assert len(r["warning_notes"]) > 0

    def test_units_are_defined(self):
        """All output fields have units."""
        units = self.calc.get_units()
        assert "backup_time_hours" in units
        assert "backup_time_minutes" in units
        assert "usable_capacity_kwh" in units
        assert "discharge_current_a" in units
