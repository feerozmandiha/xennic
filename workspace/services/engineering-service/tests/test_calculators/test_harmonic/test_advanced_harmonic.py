"""
Tests for HARM-001: Advanced Harmonic Analysis & Active Filter dq Control
"""

import pytest
from src.calculators.harmonic.advanced_harmonic import AdvancedHarmonicCalculator
from src.calculators.harmonic.schemas import AdvancedHarmonicInput


class TestAdvancedHarmonic:
    """Tests for HARM-001: Advanced Harmonic Analysis"""

    def setup_method(self):
        self.calc = AdvancedHarmonicCalculator()

    def test_basic_harmonic_analysis(self):
        """Typical 6-pulse drive harmonics — THD should be ~27%"""
        inputs = AdvancedHarmonicInput(
            system_voltage_v=400.0,
            fundamental_current_a=100.0,
            harmonic_spectrum={5: 20.0, 7: 14.0, 11: 9.0, 13: 6.0},
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert 25 < data['total_thd_percent'] < 30
        assert data['interharmonic_thd_percent'] == 0.0
        assert data['required_apf_current_a'] > 0
        assert data['dc_bus_voltage_min_v'] > 500
        assert data['dc_bus_utilization_percent'] > 0

    def test_with_interharmonics(self):
        """Inter-harmonics should increase total THD"""
        inputs = AdvancedHarmonicInput(
            system_voltage_v=400.0,
            fundamental_current_a=100.0,
            harmonic_spectrum={5: 20.0, 7: 14.0, 11: 9.0},
            interharmonic_spectrum={175.0: 5.0, 225.0: 3.0},
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['interharmonic_thd_percent'] > 0
        assert data['total_thd_percent'] > data['thd_without_interharmonics_percent']
        assert len(data['dominant_interharmonics']) > 0

    def test_already_compliant(self):
        """Low distortion — no APF needed"""
        inputs = AdvancedHarmonicInput(
            system_voltage_v=400.0,
            fundamental_current_a=100.0,
            harmonic_spectrum={5: 3.0, 7: 2.0},
            target_thd_percent=10.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['already_compliant'] is True
        assert data['required_apf_current_a'] == 0

    def test_lcl_filter_parameters(self):
        """LCL filter parameters should be computed"""
        inputs = AdvancedHarmonicInput(
            system_voltage_v=690.0,
            fundamental_current_a=200.0,
            harmonic_spectrum={5: 25.0, 7: 18.0, 11: 12.0},
            switching_frequency_hz=5000.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['filter_topology'] == 'LCL'
        assert data['l1_inductance_mh'] > 0
        assert data['l2_inductance_mh'] > 0
        assert data['filter_capacitance_uf'] > 0
        assert data['damping_resistor_ohm'] > 0
        assert data['total_inductance_mh'] > data['l1_inductance_mh']

    def test_l_filter_no_l2(self):
        """L filter should have zero L2"""
        inputs = AdvancedHarmonicInput(
            system_voltage_v=400.0,
            fundamental_current_a=100.0,
            harmonic_spectrum={5: 20.0},
            filter_topology='L',
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['filter_topology'] == 'L'
        assert data['l2_inductance_mh'] == 0.0
        assert data['total_inductance_mh'] == data['l1_inductance_mh']

    def test_dc_bus_voltage_estimation(self):
        """Explicit DC bus voltage should be used"""
        inputs = AdvancedHarmonicInput(
            system_voltage_v=400.0,
            fundamental_current_a=100.0,
            harmonic_spectrum={5: 20.0},
            dc_bus_voltage_v=800.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['dc_bus_voltage_selected_v'] == 800.0
        assert data['dc_bus_voltage_min_v'] > 0
        assert data['dc_bus_utilization_percent'] < 100

    def test_dq_control_gains(self):
        """dq PI gains should scale with bandwidth"""
        inputs_high = AdvancedHarmonicInput(
            system_voltage_v=400.0, fundamental_current_a=100.0,
            harmonic_spectrum={5: 20.0}, dq_bandwidth_hz=1000.0,
        )
        inputs_low = AdvancedHarmonicInput(
            system_voltage_v=400.0, fundamental_current_a=100.0,
            harmonic_spectrum={5: 20.0}, dq_bandwidth_hz=200.0,
        )
        r_high = self.calc.execute(inputs_high)
        r_low = self.calc.execute(inputs_low)
        assert r_high.results['kp_current_controller'] > r_low.results['kp_current_controller']
        assert r_high.results['ki_current_controller'] > r_low.results['ki_current_controller']

    def test_compensation_spectrum(self):
        """Filters should separate in-bandwidth vs out-of-bandwidth"""
        inputs = AdvancedHarmonicInput(
            system_voltage_v=400.0,
            fundamental_current_a=100.0,
            harmonic_spectrum={5: 20.0, 25: 3.0, 35: 2.0},
            max_compensation_order=20,
        )
        result = self.calc.execute(inputs)
        data = result.results
        in_bw = [e['order'] for e in data['harmonics_in_bandwidth']]
        out_bw = [e['order'] for e in data['harmonics_out_of_bandwidth']]
        assert 5 in in_bw
        assert 25 in out_bw or 35 in out_bw

    def test_warnings_for_interharmonics(self):
        """Significant inter-harmonics should generate warnings"""
        inputs = AdvancedHarmonicInput(
            system_voltage_v=400.0,
            fundamental_current_a=100.0,
            harmonic_spectrum={5: 10.0},
            interharmonic_spectrum={175.0: 15.0, 225.0: 12.0},
            target_thd_percent=5.0,
        )
        result = self.calc.execute(inputs)
        warnings = result.results['warnings']
        warning_text = ' '.join(warnings).lower()
        assert 'inter-harmonic' in warning_text

    def test_high_voltage_system(self):
        """6.6kV system — high voltage, lower current"""
        inputs = AdvancedHarmonicInput(
            system_voltage_v=6600.0,
            fundamental_current_a=500.0,
            harmonic_spectrum={5: 15.0, 7: 10.0},
            target_thd_percent=5.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['dc_bus_voltage_min_v'] > 5000
        assert data['required_apf_current_a'] > 0
        assert data['apf_kva_3phase'] > 100

    def test_achievable_thd(self):
        """Achievable THD should reflect uncompensated harmonics"""
        inputs = AdvancedHarmonicInput(
            system_voltage_v=400.0,
            fundamental_current_a=100.0,
            harmonic_spectrum={5: 20.0, 7: 14.0, 55: 5.0},
            max_compensation_order=50,
            target_thd_percent=5.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        # 55th order is out of bandwidth
        assert data['achievable_thd_percent'] > 0
        # achievable should be less than total (most harmonics compensated)
        if data['harmonics_out_of_bandwidth']:
            assert data['achievable_thd_percent'] < data['total_thd_percent']
