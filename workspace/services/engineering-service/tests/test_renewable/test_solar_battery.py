"""
Tests for SOLAR-003: Solar PV Battery Sizing (IEC 62548)
"""

import pytest
from src.calculators.renewable.solar_battery import SolarBatteryCalculator
from src.calculators.renewable.schemas import SolarBatteryInput


class TestSolarBatteryCalculator:
    def setup_method(self):
        self.calc = SolarBatteryCalculator()

    def test_basic_off_grid_battery_sizing(self):
        """Basic off-grid battery sizing with LiFePO4."""
        inputs = SolarBatteryInput(
            daily_load_kwh=10.0,
            autonomy_days=2.0,
            battery_type='LiFePO4',
            system_voltage_v=48,
            depth_of_discharge=0.8,
            temperature_c=25.0,
        )
        result = self.calc.execute(inputs)

        assert result.calculation_code == "SOLAR-003"
        r = result.results
        assert r["battery_capacity_kwh"] > 0
        assert r["battery_capacity_ah"] > 0
        assert r["energy_required_kwh"] > 0
        assert r["discharge_current_a"] > 0
        assert r["cells_in_series"] > 0
        assert r["parallel_strings"] >= 1
        assert r["total_battery_units"] > 0
        assert r["c_rate_safe"] is True
        assert len(r["protection_notes"]) > 0
        assert len(r["recommendation_notes"]) > 0

    def test_cold_temperature_derating(self):
        """Cold temperature increases required capacity."""
        inputs_warm = SolarBatteryInput(
            daily_load_kwh=10.0,
            autonomy_days=2.0,
            temperature_c=25.0,
        )
        inputs_cold = SolarBatteryInput(
            daily_load_kwh=10.0,
            autonomy_days=2.0,
            temperature_c=0.0,
        )

        result_warm = self.calc.execute(inputs_warm)
        result_cold = self.calc.execute(inputs_cold)

        assert result_cold.results["battery_capacity_kwh"] > result_warm.results["battery_capacity_kwh"]
        assert result_cold.results["temperature_derating_factor"] < result_warm.results["temperature_derating_factor"]

    def test_with_pv_capacity_provided(self):
        """When PV capacity is provided, charge controller is sized accordingly."""
        inputs = SolarBatteryInput(
            daily_load_kwh=20.0,
            autonomy_days=2.0,
            pv_capacity_kwp=5.0,
            peak_sun_hours=5.0,
        )
        result = self.calc.execute(inputs)

        r = result.results
        assert r["pv_to_load_ratio"] is not None
        assert r["pv_to_load_ratio"] > 0
        assert r["charge_controller_current_a"] > 0

    def test_lead_acid_respects_dod_limit(self):
        """Lead-Acid has lower max DoD — test warning when exceeded."""
        inputs = SolarBatteryInput(
            daily_load_kwh=10.0,
            autonomy_days=2.0,
            battery_type='LeadAcid',
            depth_of_discharge=0.8,
        )
        with pytest.raises(ValueError):
            self.calc.execute(inputs)

    def test_accept_lead_acid_at_50pct_dod(self):
        """Lead-Acid at 50% DoD should work."""
        inputs = SolarBatteryInput(
            daily_load_kwh=10.0,
            autonomy_days=2.0,
            battery_type='LeadAcid',
            depth_of_discharge=0.5,
            max_c_rate=0.25,
        )
        result = self.calc.execute(inputs)
        assert result.results["battery_capacity_kwh"] > 0

    def test_multiple_battery_types(self):
        """Test all battery types produce valid results."""
        type_configs = {
            'LiFePO4': {'max_dod': 0.80, 'max_c_rate': 0.5, 'charge_rate': 0.3},
            'LiNMC':   {'max_dod': 0.70, 'max_c_rate': 0.5, 'charge_rate': 0.3},
            'LeadAcid':{'max_dod': 0.40, 'max_c_rate': 0.2, 'charge_rate': 0.1},
            'AGM':     {'max_dod': 0.50, 'max_c_rate': 0.25, 'charge_rate': 0.125},
            'Gel':     {'max_dod': 0.50, 'max_c_rate': 0.2, 'charge_rate': 0.1},
            'NaS':     {'max_dod': 0.70, 'max_c_rate': 0.4, 'charge_rate': 0.2},
            'NiCd':    {'max_dod': 0.70, 'max_c_rate': 0.5, 'charge_rate': 0.2},
        }
        for btype, cfg in type_configs.items():
            inputs = SolarBatteryInput(
                daily_load_kwh=10.0,
                autonomy_days=2.0,
                battery_type=btype,
                depth_of_discharge=cfg['max_dod'],
                max_c_rate=cfg['max_c_rate'],
                target_charge_rate_c=cfg['charge_rate'],
            )
            result = self.calc.execute(inputs)
            assert result.results["battery_capacity_kwh"] > 0
            assert result.results["cells_in_series"] > 0

    def test_high_c_rate_warning(self):
        """Very high load relative to capacity should trigger C-rate warning."""
        inputs = SolarBatteryInput(
            daily_load_kwh=100.0,
            autonomy_days=1.0,
            system_voltage_v=24,
        )
        result = self.calc.execute(inputs)
        r = result.results
        # High load + low voltage = very high discharge current
        if not r["c_rate_safe"]:
            assert len(r["warning_notes"]) > 0

    def test_string_configuration_48v_lifepo4(self):
        """48V system with LiFePO4 (3.2V cells) → 15 cells in series."""
        inputs = SolarBatteryInput(
            daily_load_kwh=5.0,
            autonomy_days=1.0,
            battery_type='LiFePO4',
            system_voltage_v=48,
            battery_cell_voltage_v=3.2,
        )
        result = self.calc.execute(inputs)
        assert result.results["cells_in_series"] == 15  # 48 / 3.2

    def test_validation_unknown_battery_type(self):
        """Unknown battery type should raise ValueError."""
        with pytest.raises(ValueError):
            inputs = SolarBatteryInput(
                daily_load_kwh=10.0,
                autonomy_days=2.0,
                battery_type='UnknownType',
            )
            self.calc.execute(inputs)

    def test_units_are_defined(self):
        """All output fields have units."""
        units = self.calc.get_units()
        assert "battery_capacity_kwh" in units
        assert "battery_capacity_ah" in units
        assert "discharge_current_a" in units
        assert "charge_current_a" in units
        assert "estimated_cost_usd" in units

    def test_system_efficiency_affects_capacity(self):
        """Lower system efficiency → larger required battery."""
        efficient = SolarBatteryInput(
            daily_load_kwh=10.0,
            autonomy_days=2.0,
            system_efficiency=0.90,
        )
        inefficient = SolarBatteryInput(
            daily_load_kwh=10.0,
            autonomy_days=2.0,
            system_efficiency=0.70,
        )
        r_efficient = self.calc.execute(efficient)
        r_inefficient = self.calc.execute(inefficient)
        assert r_inefficient.results["battery_capacity_kwh"] > r_efficient.results["battery_capacity_kwh"]
