"""
Unit tests for Grounding Grid Design (GND-002 / IEEE Std 80-2013)
"""

import pytest
from src.calculators.grounding.grid_design import GroundingGridCalculator
from src.calculators.grounding.schemas import GroundingGridInput


class TestGroundingGrid:
    """Tests for GND-002: Grounding Grid Design"""

    def setup_method(self):
        self.calc = GroundingGridCalculator()

    def test_medium_grid_with_rods(self):
        """50×40m grid, 6×5 conductors, with rods — typical substation"""
        inputs = GroundingGridInput(
            grid_length_m=50.0,
            grid_width_m=40.0,
            n_conductors_x=6,
            n_conductors_y=5,
            soil_resistivity_ohm_m=150.0,
            max_fault_current_a=20000.0,
            fault_duration_s=0.5,
            has_ground_rods=True,
            rod_length_m=3.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert 0.1 < data['grid_resistance_ohm'] < 10
        assert data['max_gpr_v'] > 0
        assert data['allowable_step_v'] > 0
        assert data['allowable_touch_v'] > 0
        assert data['total_conductor_length_m'] > 0

    def test_small_grid_no_rods(self):
        """20×20m grid, 4×4, no rods — higher resistance"""
        inputs = GroundingGridInput(
            grid_length_m=20.0, grid_width_m=20.0,
            n_conductors_x=4, n_conductors_y=4,
            soil_resistivity_ohm_m=200.0,
            max_fault_current_a=5000.0,
            fault_duration_s=0.5,
            has_ground_rods=False,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['total_rod_length_m'] is None
        assert data['grid_resistance_ohm'] > 0

    def test_safety_margins(self):
        """Touch and step margins should be computed (may be negative if unsafe)"""
        inputs = GroundingGridInput(
            grid_length_m=80.0, grid_width_m=60.0,
            n_conductors_x=15, n_conductors_y=12,
            soil_resistivity_ohm_m=100.0,
            max_fault_current_a=15000.0,
            fault_duration_s=0.5,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert isinstance(data['touch_voltage_safe'], bool)
        assert isinstance(data['step_voltage_safe'], bool)
        assert isinstance(data['touch_margin_pct'], float)
        assert isinstance(data['step_margin_pct'], float)

    def test_high_resistivity_soil(self):
        """High soil resistivity → higher resistance, likely unsafe touch"""
        inputs = GroundingGridInput(
            grid_length_m=30.0, grid_width_m=30.0,
            n_conductors_x=5, n_conductors_y=5,
            soil_resistivity_ohm_m=5000.0,
            max_fault_current_a=10000.0,
            fault_duration_s=0.5,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['grid_resistance_ohm'] > 5
        # Likely unsafe with such high resistivity
        if not data['touch_voltage_safe']:
            notes = data['recommendation_notes']
            assert any('exceeds' in n for n in notes)

    def test_surface_layer_derating(self):
        """Surface layer should reduce Cs and increase allowable voltages"""
        inputs_no_surface = GroundingGridInput(
            grid_length_m=50.0, grid_width_m=40.0,
            n_conductors_x=6, n_conductors_y=5,
            soil_resistivity_ohm_m=150.0,
            max_fault_current_a=20000.0, fault_duration_s=0.5,
            surface_resistivity_ohm_m=150.0,
            surface_thickness_m=0.0,
        )
        inputs_with_rock = GroundingGridInput(
            grid_length_m=50.0, grid_width_m=40.0,
            n_conductors_x=6, n_conductors_y=5,
            soil_resistivity_ohm_m=150.0,
            max_fault_current_a=20000.0, fault_duration_s=0.5,
            surface_resistivity_ohm_m=3000.0,
            surface_thickness_m=0.15,
        )
        r1 = self.calc.execute(inputs_no_surface)
        r2 = self.calc.execute(inputs_with_rock)
        # With rock surface, allowable touch should be higher
        assert r2.results['allowable_touch_v'] > r1.results['allowable_touch_v']

    def test_50kg_body_lower_allowable(self):
        """50kg body weight → lower allowable voltages (more conservative)"""
        inputs_50 = GroundingGridInput(
            grid_length_m=50.0, grid_width_m=40.0,
            n_conductors_x=6, n_conductors_y=5,
            soil_resistivity_ohm_m=150.0,
            max_fault_current_a=20000.0, fault_duration_s=0.5,
            body_weight=50,
        )
        inputs_70 = GroundingGridInput(
            grid_length_m=50.0, grid_width_m=40.0,
            n_conductors_x=6, n_conductors_y=5,
            soil_resistivity_ohm_m=150.0,
            max_fault_current_a=20000.0, fault_duration_s=0.5,
            body_weight=70,
        )
        r1 = self.calc.execute(inputs_50)
        r2 = self.calc.execute(inputs_70)
        assert r1.results['allowable_touch_v'] < r2.results['allowable_touch_v']

    def test_conductor_spacing(self):
        """Spacing should be computed from dimensions and count"""
        inputs = GroundingGridInput(
            grid_length_m=50.0, grid_width_m=40.0,
            n_conductors_x=6, n_conductors_y=5,
            soil_resistivity_ohm_m=150.0,
            max_fault_current_a=20000.0, fault_duration_s=0.5,
        )
        result = self.calc.execute(inputs)
        data = result.results
        # 50m / (6-1) gaps = 10m
        assert abs(data['conductor_spacing_x_m'] - 10.0) < 0.1
        # 40m / (5-1) gaps = 10m
        assert abs(data['conductor_spacing_y_m'] - 10.0) < 0.1

    def test_conductor_weight(self):
        """Copper weight should be reasonable"""
        inputs = GroundingGridInput(
            grid_length_m=50.0, grid_width_m=40.0,
            n_conductors_x=6, n_conductors_y=5,
            soil_resistivity_ohm_m=150.0,
            max_fault_current_a=20000.0, fault_duration_s=0.5,
            conductor_diameter_mm=14.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        # 6×50 + 5×40 = 500m of 14mm copper
        # Volume = 500 × π × 0.007² = 0.077 m³
        # Weight = 0.077 × 8890 kg/m³ ≈ 685 kg
        assert 500 < data['total_conductor_weight_kg'] < 2000
        assert data['grid_area_m2'] == 2000.0
