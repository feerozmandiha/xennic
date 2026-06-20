"""
Unit tests for Road / Street Lighting Design (LIGHT-002)
"""

import pytest
from src.calculators.lighting.road_lighting import RoadLightingCalculator
from src.calculators.lighting.schemas import RoadLightingInput


class TestRoadLighting:
    """Tests for LIGHT-002: Road Lighting Design (EN 13201)"""

    def setup_method(self):
        self.calc = RoadLightingCalculator()

    def test_m3_road_single_sided(self):
        """M3 road, 10m wide, single-sided LED — auto calculable spacing"""
        inputs = RoadLightingInput(
            road_width_m=10.0,
            road_length_m=300.0,
            road_class='M3',
            luminaire_type='LED_road',
            lamp_lumens=15000.0,
            luminaire_power_w=120.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert 15 <= data['recommended_spacing_m'] <= 50
        assert data['road_class'] == 'M3'
        assert data['target_luminance_cd_m2'] == 1.0
        assert data['num_poles'] >= 2
        assert data['mounting_height_m'] > 0

    def test_m1_highway_opposite(self):
        """M1 highway, 20m wide — opposite arrangement"""
        inputs = RoadLightingInput(
            road_width_m=20.0,
            road_length_m=1000.0,
            road_class='M1',
            luminaire_type='cut_off',
            lamp_lumens=25000.0,
            luminaire_power_w=250.0,
            mounting_height_m=12.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        # W/H = 20/12 = 1.67 > 1.5 → opposite arrangement
        assert data['arrangement'] == 'opposite'
        assert data['target_luminance_cd_m2'] == 2.0
        assert data['num_poles'] > 2

    def test_custom_spacing(self):
        """User-specified spacing should back-calculate achieved luminance"""
        inputs = RoadLightingInput(
            road_width_m=10.0,
            road_length_m=300.0,
            road_class='M3',
            luminaire_type='LED_road',
            lamp_lumens=15000.0,
            luminaire_power_w=120.0,
            target_spacing_m=30.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert abs(data['pole_spacing_m'] - 30.0) < 5.0
        assert data['achieved_luminance_cd_m2'] > 0

    def test_uniformity_checks(self):
        """Estimated uniformity should be reasonable"""
        inputs = RoadLightingInput(
            road_width_m=8.0, road_length_m=200.0,
            road_class='M4',
            luminaire_type='LED_road',
            lamp_lumens=12000.0, luminaire_power_w=100.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert 0 <= data['estimated_uniformity_u0'] <= 1.0
        assert 0 <= data['estimated_uniformity_ui'] <= 1.0
        assert data['u0_requirement'] > 0
        assert data['ui_requirement'] > 0

    def test_glare_rating(self):
        """TI should vary with luminaire type"""
        inputs_cutoff = RoadLightingInput(
            road_width_m=10.0, road_length_m=200.0,
            road_class='M3',
            luminaire_type='cut_off',
            lamp_lumens=15000.0, luminaire_power_w=120.0,
            mounting_height_m=10.0,
        )
        inputs_noncutoff = RoadLightingInput(
            road_width_m=10.0, road_length_m=200.0,
            road_class='M3',
            luminaire_type='non_cut_off',
            lamp_lumens=15000.0, luminaire_power_w=120.0,
            mounting_height_m=10.0,
        )
        r1 = self.calc.execute(inputs_cutoff)
        r2 = self.calc.execute(inputs_noncutoff)
        # Non-cut-off should have higher TI (worse glare)
        assert r2.results['estimated_ti_percent'] > r1.results['estimated_ti_percent']

    def test_p1_residential_path(self):
        """P1 class — low target luminance"""
        inputs = RoadLightingInput(
            road_width_m=5.0, road_length_m=100.0,
            road_class='P1',
            luminaire_type='decorative',
            lamp_lumens=3000.0, luminaire_power_w=40.0,
            mounting_height_m=5.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['target_luminance_cd_m2'] == 0.15
        assert data['num_poles'] >= 2

    def test_narrow_road_single_sided(self):
        """Narrow road should suggest single-sided"""
        inputs = RoadLightingInput(
            road_width_m=6.0, road_length_m=200.0,
            road_class='M4',
            luminaire_type='LED_road',
            lamp_lumens=10000.0, luminaire_power_w=80.0,
            mounting_height_m=7.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        # W/H = 6/7 = 0.86 → single_sided
        assert data['arrangement'] == 'single_sided'

    def test_power_and_energy(self):
        """Power and energy should be computed"""
        inputs = RoadLightingInput(
            road_width_m=12.0, road_length_m=500.0,
            road_class='M3',
            luminaire_type='LED_road',
            lamp_lumens=18000.0, luminaire_power_w=150.0,
            annual_operating_hours=4000.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['total_power_w'] > 0
        assert data['annual_energy_kwh'] > 0
        assert data['power_density_w_per_m2'] > 0

    def test_wet_surface_note(self):
        """Wet surface should produce a recommendation note"""
        inputs = RoadLightingInput(
            road_width_m=10.0, road_length_m=200.0,
            road_class='M3',
            luminaire_type='LED_road',
            lamp_lumens=15000.0, luminaire_power_w=120.0,
            road_surface='wet_asphalt',
        )
        result = self.calc.execute(inputs)
        notes = result.results['recommendation_notes']
        wet_notes = [n for n in notes if 'Wet' in n or 'wet' in n]
        assert len(wet_notes) > 0

    def test_median_arrangement_wide_road(self):
        """Very wide road with low height → median arrangement"""
        inputs = RoadLightingInput(
            road_width_m=30.0, road_length_m=500.0,
            road_class='M3',
            luminaire_type='LED_road',
            lamp_lumens=25000.0, luminaire_power_w=200.0,
            mounting_height_m=8.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        # W/H = 30/8 = 3.75 > 3.0 → median
        assert data['arrangement'] == 'median'
