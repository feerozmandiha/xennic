"""
Tests for BAT-001: Battery Energy Storage System Sizing
"""

import pytest
from src.calculators.renewable.battery_storage import BatteryStorageCalculator
from src.calculators.renewable.schemas import BatteryStorageInput


class TestBatteryStorageCalculator:
    def setup_method(self):
        self.calc = BatteryStorageCalculator()

    def test_lifepo4_sizing(self):
        """LiFePO4 battery sizing for 10kW load, 4h backup."""
        inputs = BatteryStorageInput(
            load_kw=10.0,
            backup_hours=4.0,
            battery_type="LiFePO4",
            system_voltage=48.0,
            depth_of_discharge=0.8,
        )
        result = self.calc.execute(inputs)

        assert result.calculation_code == "BAT-001"
        r = result.results
        assert r["battery_capacity_kwh"] > 0
        assert r["battery_capacity_ah"] > 0
        assert r["energy_required_kwh"] > 0
        assert r["discharge_current_a"] > 0
        assert r["estimated_weight_kg"] > 0
        assert r["estimated_cost_usd"] > 0
        assert r["design_life_years"] > 0
        assert r["fuse_rating_a"] > 0

    def test_lead_acid_sizing(self):
        """Lead-Acid sizing with limited DoD."""
        inputs = BatteryStorageInput(
            load_kw=5.0,
            backup_hours=8.0,
            battery_type="LeadAcid",
            depth_of_discharge=0.5,
        )
        result = self.calc.execute(inputs)
        r = result.results
        assert r["battery_type"] == "LeadAcid"
        assert r["battery_capacity_kwh"] > 0
        assert r["estimated_weight_kg"] > 0  # heavy

    def test_high_dod_lifepo4_warning(self):
        """High DoD on LeadAcid should produce warning."""
        inputs = BatteryStorageInput(
            load_kw=10.0,
            backup_hours=4.0,
            battery_type="LeadAcid",
            depth_of_discharge=0.9,
        )
        with pytest.raises(ValueError):
            self.calc.execute(inputs)

    def test_cold_temperature_derating(self):
        """Cold temperature should reduce effective capacity."""
        normal = BatteryStorageInput(load_kw=10.0, backup_hours=4.0)
        cold = BatteryStorageInput(load_kw=10.0, backup_hours=4.0, temperature_c=5.0)

        r_normal = self.calc.execute(normal).results
        r_cold = self.calc.execute(cold).results

        # Cold reduces temp_derate_factor → requires larger capacity
        assert r_cold["temp_derate_factor"] < r_normal["temp_derate_factor"]
        assert r_cold["battery_capacity_kwh"] >= r_normal["battery_capacity_kwh"]

    def test_high_c_rate_warning(self):
        """C-rate significantly above recommendation should produce warning."""
        inputs = BatteryStorageInput(
            load_kw=50.0,
            backup_hours=1.0,
            c_rate=0.2,
        )
        result = self.calc.execute(inputs)
        r = result.results
        if r["actual_c_rate"] > r["recommended_c_rate"] * 2:
            assert len(r["warnings"]) > 0

    def test_nas_battery(self):
        """NaS battery sizing (high-temp, long life)."""
        inputs = BatteryStorageInput(
            load_kw=100.0,
            backup_hours=6.0,
            battery_type="NaS",
            system_voltage=120.0,
        )
        result = self.calc.execute(inputs)
        r = result.results
        assert r["battery_type"] == "NaS"
        assert r["design_life_years"] > 0
        assert r["estimated_cost_usd"] > 0

    def test_unknown_battery_type_raises(self):
        """Invalid battery type should raise ValueError."""
        with pytest.raises(ValueError):
            inputs = BatteryStorageInput(
                load_kw=10.0, backup_hours=4.0,
                battery_type="UnknownChem",
            )
            self.calc.execute(inputs)

    def test_units_are_defined(self):
        """All output fields have units."""
        units = self.calc.get_units()
        assert "battery_capacity_kwh" in units
        assert "battery_capacity_ah" in units
        assert "discharge_current_a" in units
        assert "estimated_weight_kg" in units
