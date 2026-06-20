"""
Tests for SOLAR-002: Inverter Sizing & String Design (IEC 62548)
"""

import pytest
from src.calculators.renewable.inverter_sizing import InverterSizingCalculator
from src.calculators.renewable.schemas import InverterSizingInput


class TestInverterSizing:
    """Tests for SOLAR-002: Inverter Sizing"""

    def setup_method(self):
        self.calc = InverterSizingCalculator()

    def test_100kwp_string_inverter(self):
        """100kWp array with 400W modules and 100kW string inverter"""
        inputs = InverterSizingInput(
            pv_capacity_kwp=100.0,
            module_watt_peak=400.0,
            module_voc_v=45.0, module_vmp_v=37.5,
            module_isc_a=11.0, module_imp_a=10.67,
            inverter_ac_power_kw=100.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['modules_per_string'] > 0
        assert data['number_of_strings'] > 0
        assert data['number_of_inverters'] >= 1
        assert 1.0 < data['dc_ac_ratio_actual'] < 2.0
        assert data['max_string_voc_v'] > 0

    def test_cold_temperature_string_limit(self):
        """Cold temps increase Voc — should reduce max modules per string"""
        inputs_cold = InverterSizingInput(
            pv_capacity_kwp=50.0,
            module_watt_peak=400.0,
            module_voc_v=45.0, module_vmp_v=37.5,
            module_isc_a=11.0, module_imp_a=10.67,
            t_min_c=-30.0,
        )
        inputs_warm = InverterSizingInput(
            pv_capacity_kwp=50.0,
            module_watt_peak=400.0,
            module_voc_v=45.0, module_vmp_v=37.5,
            module_isc_a=11.0, module_imp_a=10.67,
            t_min_c=0.0,
        )
        r_cold = self.calc.execute(inputs_cold)
        r_warm = self.calc.execute(inputs_warm)
        assert r_cold.results['max_modules_per_string'] <= r_warm.results['max_modules_per_string']

    def test_hot_temperature_vmp(self):
        """Hot temps reduce Vmp — should increase min modules per string"""
        inputs = InverterSizingInput(
            pv_capacity_kwp=50.0,
            module_watt_peak=400.0,
            module_voc_v=45.0, module_vmp_v=37.5,
            module_isc_a=11.0, module_imp_a=10.67,
            t_max_c=85.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['min_modules_per_string'] > 0

    def test_high_altitude_derating(self):
        """Altitude above 1500m should trigger derating"""
        inputs = InverterSizingInput(
            pv_capacity_kwp=100.0,
            module_watt_peak=400.0,
            module_voc_v=45.0, module_vmp_v=37.5,
            module_isc_a=11.0, module_imp_a=10.67,
            altitude_m=2500.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['altitude_derating_pct'] < 90
        notes = ' '.join(data['recommendation_notes']).lower()
        assert 'altitude' in notes

    def test_multiple_inverters(self):
        """Large array should require multiple inverters"""
        inputs = InverterSizingInput(
            pv_capacity_kwp=500.0,
            module_watt_peak=400.0,
            module_voc_v=45.0, module_vmp_v=37.5,
            module_isc_a=11.0, module_imp_a=10.67,
            inverter_ac_power_kw=100.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['number_of_inverters'] >= 2

    def test_central_inverter(self):
        """Central inverter topology should still size correctly"""
        inputs = InverterSizingInput(
            pv_capacity_kwp=1000.0,
            module_watt_peak=400.0,
            module_voc_v=45.0, module_vmp_v=37.5,
            module_isc_a=11.0, module_imp_a=10.67,
            inverter_type='central',
            inverter_ac_power_kw=500.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['number_of_inverters'] > 0
        assert data['dc_ac_ratio_actual'] > 0

    def test_dc_ac_ratio_input(self):
        """Higher target ratio should increase actual ratio"""
        inputs_low = InverterSizingInput(
            pv_capacity_kwp=100.0, module_watt_peak=400.0,
            module_voc_v=45.0, module_vmp_v=37.5,
            module_isc_a=11.0, module_imp_a=10.67,
            dc_ac_ratio_target=1.2,
        )
        inputs_high = InverterSizingInput(
            pv_capacity_kwp=100.0, module_watt_peak=400.0,
            module_voc_v=45.0, module_vmp_v=37.5,
            module_isc_a=11.0, module_imp_a=10.67,
            dc_ac_ratio_target=1.5,
        )
        r_low = self.calc.execute(inputs_low)
        r_high = self.calc.execute(inputs_high)
        assert r_high.results['dc_ac_ratio_actual'] >= r_low.results['dc_ac_ratio_actual']

    def test_temperature_derating(self):
        """High ambient temp should derate inverter capacity"""
        inputs = InverterSizingInput(
            pv_capacity_kwp=100.0, module_watt_peak=400.0,
            module_voc_v=45.0, module_vmp_v=37.5,
            module_isc_a=11.0, module_imp_a=10.67,
            max_ambient_temp_c=60.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['temperature_derating_pct'] < 95

    def test_inverter_loading_ratio(self):
        """ILR should be computed and reasonable"""
        inputs = InverterSizingInput(
            pv_capacity_kwp=100.0, module_watt_peak=400.0,
            module_voc_v=45.0, module_vmp_v=37.5,
            module_isc_a=11.0, module_imp_a=10.67,
            dc_ac_ratio_target=1.3,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['inverter_loading_ratio'] > 0.5
        assert data['effective_inverter_capacity_kw'] > 0
