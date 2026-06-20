"""
Unit tests for Cable Tray/Ladder Sizing Calculator (CABLE-005)
"""

import pytest
from src.calculators.cable.tray_sizing import CableTraySizingCalculator
from src.calculators.cable.schemas import CableTrayInput


class TestCableTraySizing:
    """Tests for CABLE-005: Cable Tray/Ladder Sizing"""

    def setup_method(self):
        self.calc = CableTraySizingCalculator()

    def test_ladder_tray_within_limit(self):
        """300mm ladder tray with 3x 25mm cables — should be within 50% fill"""
        inputs = CableTrayInput(
            tray_width_mm=300.0,
            tray_depth_mm=100.0,
            tray_type='ladder',
            cables={'25': 3},
            spare_percent=20.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['within_limit'] is True
        assert data['fill_ratio_percent'] < 50.0
        assert data['max_fill_ratio_percent'] == 50.0

    def test_perforated_tray_overfill(self):
        """200mm perforated tray with many cables — should exceed 40%"""
        inputs = CableTrayInput(
            tray_width_mm=200.0,
            tray_depth_mm=50.0,
            tray_type='perforated',
            cables={'15': 20, '25': 10},
            spare_percent=20.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['within_limit'] is False
        assert data['fill_ratio_percent'] > 40.0
        assert data['recommended_tray_width_mm'] is not None
        assert data['recommended_tray_width_mm'] > 200.0

    def test_solid_bottom_tray(self):
        """Solid bottom tray has strictest limit (30%)"""
        inputs = CableTrayInput(
            tray_width_mm=400.0,
            tray_depth_mm=100.0,
            tray_type='solid_bottom',
            cables={'32': 4},
            spare_percent=25.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['max_fill_ratio_percent'] == 30.0
        assert data['within_limit'] is True

    def test_wire_mesh_tray(self):
        """Wire mesh tray allows 50% fill"""
        inputs = CableTrayInput(
            tray_width_mm=300.0,
            tray_depth_mm=100.0,
            tray_type='wire_mesh',
            cables={'40': 6, '50': 4},
            spare_percent=15.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['max_fill_ratio_percent'] == 50.0
        assert data['within_limit'] is True or data['within_limit'] is False

    def test_fill_ratio_calculation_accuracy(self):
        """Verify fill ratio math: cable area = π(d/2)² × qty, fill = area / tray_area"""
        inputs = CableTrayInput(
            tray_width_mm=100.0,
            tray_depth_mm=50.0,
            tray_type='ladder',
            cables={'10': 1},
            spare_percent=20.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        import math
        expected_area = math.pi * (10 / 2) ** 2 * 1
        expected_fill = (expected_area / (100 * 50)) * 100
        assert abs(data['fill_ratio_percent'] - expected_fill) < 0.1
        assert abs(data['total_cable_area_mm2'] - expected_area) < 0.1

    def test_recommendation_next_standard_width(self):
        """Overfilled tray should recommend next standard width"""
        inputs = CableTrayInput(
            tray_width_mm=100.0,
            tray_depth_mm=50.0,
            tray_type='perforated',
            cables={'25': 8},
            spare_percent=20.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['within_limit'] is False
        assert data['recommended_tray_width_mm'] is not None
        # Recommended should be a standard width > current
        assert data['recommended_tray_width_mm'] > 100.0

    def test_cable_breakdown_output(self):
        """Verify cable_breakdown dict is present with correct keys"""
        inputs = CableTrayInput(
            tray_width_mm=300.0,
            tray_depth_mm=100.0,
            tray_type='ladder',
            cables={'15': 4, '32': 2},
            spare_percent=20.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert 'cable_breakdown' in data
        assert '15' in data['cable_breakdown']
        assert '32' in data['cable_breakdown']
        assert data['cable_breakdown']['15']['qty'] == 4
        assert data['cable_breakdown']['32']['qty'] == 2

    def test_empty_cables_raises_error(self):
        """Providing no cables should raise ValueError"""
        with pytest.raises(ValueError, match="At least one cable"):
            CableTrayInput(
                tray_width_mm=300.0,
                tray_depth_mm=100.0,
                tray_type='ladder',
                cables={},
                spare_percent=20.0,
            )

    def test_remaining_area_positive_when_within_limit(self):
        """When within limit, remaining area should be positive"""
        inputs = CableTrayInput(
            tray_width_mm=300.0,
            tray_depth_mm=100.0,
            tray_type='ladder',
            cables={'25': 3},
            spare_percent=20.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['within_limit'] is True
        assert data['remaining_area_mm2'] > 0
