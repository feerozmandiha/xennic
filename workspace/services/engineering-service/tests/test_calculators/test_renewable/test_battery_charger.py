"""
Tests for BATTERY-002: Battery Charger Selection (IEEE 485 / IEC 60364)
"""

import pytest
from src.calculators.renewable.battery_charger import BatteryChargerCalculator
from src.calculators.renewable.schemas import BatteryChargerInput


class TestBatteryCharger:
    """Tests for BATTERY-002: Battery Charger Selection"""

    def setup_method(self):
        self.calc = BatteryChargerCalculator()

    def test_vrla_basic(self):
        """VRLA battery 200Ah @ 48V — typical telecom"""
        inputs = BatteryChargerInput(
            battery_capacity_ah=200.0,
            battery_type='VRLA',
            cells_per_bank=24,
            system_voltage_dc_v=48.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['battery_type'] == 'VRLA'
        assert 50 < data['charging_voltage_float_v'] < 60
        assert data['charging_current_a'] > 0
        assert data['selected_charger_rating_a'] > 0
        assert data['dc_fuse_rating_a'] > 0

    def test_flooded_with_load(self):
        """Flooded battery 500Ah @ 110V with simultaneous load"""
        inputs = BatteryChargerInput(
            battery_capacity_ah=500.0,
            battery_type='flooded',
            cells_per_bank=55,
            system_voltage_dc_v=110.0,
            simultaneous_load_kw=5.0,
            charger_type='thyristor',
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['battery_type'] == 'flooded'
        assert data['simultaneous_load_kw'] == 5.0
        assert data['total_dc_power_kw'] > data['charger_dc_power_kw']
        assert 80 < data['charger_efficiency_pct'] < 95  # thyristor

    def test_lithium_lifePO4(self):
        """LiFePO4 100Ah @ 48V"""
        inputs = BatteryChargerInput(
            battery_capacity_ah=100.0,
            battery_type='LiFePO4',
            cells_per_bank=16,
            system_voltage_dc_v=48.0,
            charge_rate_c=0.5,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['battery_type'] == 'LiFePO4'
        assert 50 < data['charging_voltage_float_v'] < 60
        assert data['charging_current_a'] > 40  # 100×0.5

    def test_high_efficiency_hf(self):
        """High frequency charger should have >95% efficiency"""
        inputs = BatteryChargerInput(
            battery_capacity_ah=300.0,
            battery_type='VRLA',
            cells_per_bank=24,
            system_voltage_dc_v=48.0,
            charger_type='high_frequency',
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['charger_efficiency_pct'] >= 95

    def test_high_altitude_derating(self):
        """Altitude above 1500m should trigger derating and recommendation"""
        inputs = BatteryChargerInput(
            battery_capacity_ah=200.0,
            battery_type='VRLA',
            cells_per_bank=24,
            system_voltage_dc_v=48.0,
            altitude_m=2000.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['altitude_derating_factor'] < 0.95
        notes = ' '.join(data['recommendation_notes']).lower()
        assert 'altitude' in notes

    def test_cold_temperature_derating(self):
        """Cold temperature should reduce temp derating factor"""
        inputs_cold = BatteryChargerInput(
            battery_capacity_ah=200.0,
            battery_type='VRLA',
            cells_per_bank=24,
            system_voltage_dc_v=48.0,
            ambient_temp_c=5.0,
        )
        inputs_warm = BatteryChargerInput(
            battery_capacity_ah=200.0,
            battery_type='VRLA',
            cells_per_bank=24,
            system_voltage_dc_v=48.0,
            ambient_temp_c=30.0,
        )
        r_cold = self.calc.execute(inputs_cold)
        r_warm = self.calc.execute(inputs_warm)
        assert r_cold.results['temperature_derating_factor'] < r_warm.results['temperature_derating_factor']

    def test_ac_input_current(self):
        """AC input current should be reasonable for a given power"""
        inputs = BatteryChargerInput(
            battery_capacity_ah=500.0,
            battery_type='flooded',
            cells_per_bank=110,
            system_voltage_dc_v=220.0,
            charge_rate_c=0.1,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['ac_input_current_a'] > 0
        assert data['charger_ac_input_kva'] > 0

    def test_cable_selection(self):
        """DC cable should be selected based on charger current"""
        inputs = BatteryChargerInput(
            battery_capacity_ah=1000.0,
            battery_type='VRLA',
            cells_per_bank=24,
            system_voltage_dc_v=48.0,
            charge_rate_c=0.125,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['recommended_cable_mm2'] > 0
        # Large current should need thick cable
        assert data['recommended_cable_mm2'] >= 10

    def test_protection_notes(self):
        """Protection notes should be populated"""
        inputs = BatteryChargerInput(
            battery_capacity_ah=200.0,
            battery_type='VRLA',
            cells_per_bank=24,
            system_voltage_dc_v=48.0,
        )
        result = self.calc.execute(inputs)
        assert len(result.results['protection_notes']) > 0
        assert len(result.results['recommendation_notes']) > 0

    def test_output_ripple(self):
        """Thyristor should have higher ripple than HF"""
        hf = BatteryChargerInput(
            battery_capacity_ah=200.0, battery_type='VRLA',
            cells_per_bank=24, system_voltage_dc_v=48.0,
            charger_type='high_frequency',
        )
        thy = BatteryChargerInput(
            battery_capacity_ah=200.0, battery_type='VRLA',
            cells_per_bank=24, system_voltage_dc_v=48.0,
            charger_type='thyristor',
        )
        r_hf = self.calc.execute(hf)
        r_thy = self.calc.execute(thy)
        assert r_thy.results['estimated_output_ripple_mv_pp'] > r_hf.results['estimated_output_ripple_mv_pp']
