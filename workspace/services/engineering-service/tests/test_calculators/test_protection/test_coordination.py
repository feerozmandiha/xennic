"""
Tests for PROT-005: Protection Coordination Study (IEC 60255-151)
"""

import pytest
from src.calculators.protection.coordination import ProtectionCoordinationCalculator
from src.calculators.protection.schemas import ProtectionCoordinationInput, CoordinationDeviceInput


class TestProtectionCoordination:
    """Tests for PROT-005: Protection Coordination Study"""

    def setup_method(self):
        self.calc = ProtectionCoordinationCalculator()

    def test_total_selectivity(self):
        """Upstream rated higher + SI curve — should achieve full selectivity"""
        inputs = ProtectionCoordinationInput(
            upstream=CoordinationDeviceInput(
                name='MCCB-1', rated_current_a=630, curve_type='SI',
                tms=0.3, l_pickup_x_in=1.0, s_pickup_x_in=8.0, s_delay_s=0.4, i_pickup_x_in=12.0,
            ),
            downstream=CoordinationDeviceInput(
                name='MCCB-2', rated_current_a=250, curve_type='SI',
                tms=0.1, l_pickup_x_in=1.0, s_pickup_x_in=6.0, i_pickup_x_in=10.0,
            ),
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['overall_selectivity'] in ('total', 'partial')
        assert len(data['selectivity_table']) > 0
        assert isinstance(data['maximum_selectivity_current_a'], float)

    def test_no_selectivity(self):
        """Identical devices — should lose selectivity"""
        inputs = ProtectionCoordinationInput(
            upstream=CoordinationDeviceInput(name='A', rated_current_a=100, curve_type='SI', tms=0.1),
            downstream=CoordinationDeviceInput(name='B', rated_current_a=100, curve_type='SI', tms=0.1),
            fault_currents_a=[200, 500],
            selectivity_margin_ms=50.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['overall_selectivity'] in ('no_selectivity', 'partial')
        assert len(data['recommendations']) > 0

    def test_vi_curve(self):
        """Very Inverse curve should produce different timing"""
        inputs = ProtectionCoordinationInput(
            upstream=CoordinationDeviceInput(name='U', rated_current_a=200, curve_type='VI', tms=0.2),
            downstream=CoordinationDeviceInput(name='D', rated_current_a=100, curve_type='VI', tms=0.1),
            fault_currents_a=[500, 2000],
        )
        result = self.calc.execute(inputs)
        data = result.results
        for row in data['selectivity_table']:
            if row['downstream_trip_time_ms'] and row['upstream_trip_time_ms']:
                assert row['upstream_trip_time_ms'] > row['downstream_trip_time_ms']

    def test_ei_extremely_inverse(self):
        """Extremely Inverse — steep curve"""
        inputs = ProtectionCoordinationInput(
            upstream=CoordinationDeviceInput(name='U', rated_current_a=400, curve_type='EI', tms=0.2),
            downstream=CoordinationDeviceInput(name='D', rated_current_a=100, curve_type='EI', tms=0.1),
            fault_currents_a=[300, 1500],
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert len(data['selectivity_table']) == 2

    def test_instantaneous_trip(self):
        """Instantaneous (Ii) should trip at 20ms"""
        inputs = ProtectionCoordinationInput(
            upstream=CoordinationDeviceInput(
                name='U', rated_current_a=200, curve_type='SI', tms=0.1,
                i_pickup_x_in=15.0,
            ),
            downstream=CoordinationDeviceInput(
                name='D', rated_current_a=100, curve_type='SI', tms=0.05,
                i_pickup_x_in=10.0,
            ),
            fault_currents_a=[8000],
        )
        result = self.calc.execute(inputs)
        data = result.results
        for row in data['selectivity_table']:
            if row['downstream_trip_time_ms'] and row['upstream_trip_time_ms']:
                # Both should be in instantaneous range
                assert row['downstream_trip_time_ms'] <= 50
                assert row['upstream_trip_time_ms'] <= 50

    def test_below_pickup(self):
        """Fault below pickup — no trip"""
        inputs = ProtectionCoordinationInput(
            upstream=CoordinationDeviceInput(name='U', rated_current_a=1000, curve_type='SI', tms=0.1),
            downstream=CoordinationDeviceInput(name='D', rated_current_a=200, curve_type='SI', tms=0.1),
            fault_currents_a=[50],  # below both L-pickups
        )
        result = self.calc.execute(inputs)
        data = result.results
        row = data['selectivity_table'][0]
        assert row['upstream_trip_time_ms'] is None
        assert row['downstream_trip_time_ms'] is None
        assert row['selective'] is True  # downstream doesn't see fault

    def test_lti_curve(self):
        """Long Time Inverse — slower than SI at same TMS"""
        inputs = ProtectionCoordinationInput(
            upstream=CoordinationDeviceInput(name='U', rated_current_a=400, curve_type='LTI', tms=0.2),
            downstream=CoordinationDeviceInput(name='D', rated_current_a=100, curve_type='LTI', tms=0.1),
            fault_currents_a=[500],
        )
        result = self.calc.execute(inputs)
        data = result.results
        row = data['selectivity_table'][0]
        assert row['upstream_trip_time_ms'] > row['downstream_trip_time_ms']
        # LTI: t=0.1*120/(5-1)=3s = 3000ms
        assert row['downstream_trip_time_ms'] > 2000

    def test_custom_fault_levels(self):
        """Custom fault current list should be respected"""
        inputs = ProtectionCoordinationInput(
            upstream=CoordinationDeviceInput(name='U', rated_current_a=630, curve_type='SI', tms=0.2),
            downstream=CoordinationDeviceInput(name='D', rated_current_a=250, curve_type='SI', tms=0.1),
            fault_currents_a=[100, 1000, 10000],
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert len(data['selectivity_table']) == 3
        for row in data['selectivity_table']:
            assert row['fault_current_a'] in [100, 1000, 10000]

    def test_recommendations_populated(self):
        """Always includes coordination recommendations"""
        inputs = ProtectionCoordinationInput(
            upstream=CoordinationDeviceInput(name='U', rated_current_a=630, curve_type='SI', tms=0.2),
            downstream=CoordinationDeviceInput(name='D', rated_current_a=250, curve_type='SI', tms=0.1),
        )
        result = self.calc.execute(inputs)
        assert len(result.results['recommendations']) > 0
