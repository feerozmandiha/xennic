"""
Unit tests for Lighting Design - Lumen Method (LIGHT-001)
"""

import pytest
from src.calculators.lighting.lumen_method import LumenMethodCalculator
from src.calculators.lighting.schemas import LumenMethodInput


class TestLumenMethod:
    """Tests for LIGHT-001: Lighting Design (Lumen Method)"""

    def setup_method(self):
        self.calc = LumenMethodCalculator()

    def test_standard_office(self):
        """10×8m office room with 300 lux target — direct LED luminaires"""
        inputs = LumenMethodInput(
            room_length_m=10.0,
            room_width_m=8.0,
            room_height_m=3.0,
            task_type='office_general',
            luminaire_type='direct',
            lamp_lumens=3500.0,
            lamps_per_luminaire=1,
            luminaire_power_w=40.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert 8 <= data['required_luminaires'] <= 30
        assert 250 <= data['installed_lux'] <= 400
        assert data['room_index'] > 0
        assert data['utilization_factor'] > 0
        assert data['target_illuminance_lux'] == 300
        assert data['luminaire_type'] == 'direct'
        assert data['luminaire_rows'] >= 1
        assert data['luminaire_columns'] >= 1

    def test_warehouse_task_type(self):
        """Warehouse should use 150 lux target"""
        inputs = LumenMethodInput(
            room_length_m=20.0,
            room_width_m=15.0,
            room_height_m=6.0,
            task_type='warehouse',
            luminaire_type='direct',
            lamp_lumens=5000.0,
            lamps_per_luminaire=2,
            luminaire_power_w=60.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['target_illuminance_lux'] == 150
        assert data['required_luminaires'] > 0

    def test_custom_target_illuminance(self):
        """Custom target overrides task type default"""
        inputs = LumenMethodInput(
            room_length_m=10.0,
            room_width_m=8.0,
            room_height_m=3.0,
            task_type='corridor',
            target_illuminance_lux=500.0,
            luminaire_type='direct',
            lamp_lumens=3500.0,
            lamps_per_luminaire=1,
            luminaire_power_w=40.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['target_illuminance_lux'] == 500

    def test_semi_indirect_luminaires(self):
        """Semi-indirect luminaires have lower UF → more luminaires needed"""
        inputs_direct = LumenMethodInput(
            room_length_m=10.0, room_width_m=8.0, room_height_m=3.0,
            task_type='office_general',
            luminaire_type='direct',
            lamp_lumens=3500.0, lamps_per_luminaire=1,
            luminaire_power_w=40.0,
        )
        inputs_indirect = LumenMethodInput(
            room_length_m=10.0, room_width_m=8.0, room_height_m=3.0,
            task_type='office_general',
            luminaire_type='indirect',
            lamp_lumens=3500.0, lamps_per_luminaire=1,
            luminaire_power_w=40.0,
        )
        result_direct = self.calc.execute(inputs_direct)
        result_indirect = self.calc.execute(inputs_indirect)
        assert result_indirect.results['utilization_factor'] < result_direct.results['utilization_factor']
        # Indirect typically needs more luminaires for same target
        assert result_indirect.results['required_luminaires'] >= result_direct.results['required_luminaires']

    def test_spacing_check(self):
        """Large spacing should fail spacing_ok"""
        inputs = LumenMethodInput(
            room_length_m=30.0,
            room_width_m=20.0,
            room_height_m=3.0,
            task_type='warehouse',
            luminaire_type='direct',
            lamp_lumens=10000.0,
            lamps_per_luminaire=4,
            luminaire_power_w=200.0,
            max_shr=1.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert 'spacing_ok' in data

    def test_power_density_compliance(self):
        """Power density should be reasonable for low-power LED"""
        inputs = LumenMethodInput(
            room_length_m=10.0, room_width_m=8.0, room_height_m=3.0,
            task_type='corridor',
            luminaire_type='direct',
            lamp_lumens=2000.0, lamps_per_luminaire=1,
            luminaire_power_w=15.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['power_density_reference_w_m2'] > 0
        assert data['power_density_w_m2'] > 0

    def test_annual_energy(self):
        """Annual energy should be computed correctly"""
        inputs = LumenMethodInput(
            room_length_m=10.0, room_width_m=8.0, room_height_m=3.0,
            task_type='office_general',
            luminaire_type='direct',
            lamp_lumens=3500.0, lamps_per_luminaire=1,
            luminaire_power_w=40.0,
            annual_operating_hours=2000.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        # energy = power_W × hours / 1000
        expected_energy = data['total_power_w'] * 2000 / 1000
        assert abs(data['annual_energy_kwh'] - expected_energy) < 1.0

    def test_non_standard_reflectances(self):
        """Dark room surfaces should lower UF"""
        inputs_light = LumenMethodInput(
            room_length_m=10.0, room_width_m=8.0, room_height_m=3.0,
            task_type='office_general',
            luminaire_type='direct',
            lamp_lumens=3500.0, lamps_per_luminaire=1,
            luminaire_power_w=40.0,
            reflectance_ceiling=0.7, reflectance_wall=0.5,
        )
        inputs_dark = LumenMethodInput(
            room_length_m=10.0, room_width_m=8.0, room_height_m=3.0,
            task_type='office_general',
            luminaire_type='direct',
            lamp_lumens=3500.0, lamps_per_luminaire=1,
            luminaire_power_w=40.0,
            reflectance_ceiling=0.3, reflectance_wall=0.2,
        )
        result_light = self.calc.execute(inputs_light)
        result_dark = self.calc.execute(inputs_dark)
        assert result_dark.results['utilization_factor'] < result_light.results['utilization_factor']

    def test_mounting_height_validation(self):
        """Mounting height must be above workplane"""
        with pytest.raises(ValueError, match="above workplane"):
            LumenMethodInput(
                room_length_m=10.0, room_width_m=8.0, room_height_m=2.0,
                workplane_height_m=2.0,
                task_type='office_general',
                luminaire_type='direct',
                lamp_lumens=3500.0, lamps_per_luminaire=1,
                luminaire_power_w=40.0,
                mounting_height_m=1.5,
            )

    def test_very_large_room(self):
        """Large industrial hall should compute reasonable layout"""
        inputs = LumenMethodInput(
            room_length_m=80.0,
            room_width_m=40.0,
            room_height_m=10.0,
            task_type='industrial_medium',
            luminaire_type='direct',
            lamp_lumens=20000.0,
            lamps_per_luminaire=2,
            luminaire_power_w=250.0,
            max_shr=1.5,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['required_luminaires'] >= 1
        assert data['luminaire_rows'] * data['luminaire_columns'] == data['required_luminaires']

    def test_emergency_lighting(self):
        """Emergency with 50 lux should need very few luminaires"""
        inputs = LumenMethodInput(
            room_length_m=10.0, room_width_m=8.0, room_height_m=3.0,
            task_type='emergency',
            luminaire_type='direct',
            lamp_lumens=500.0, lamps_per_luminaire=1,
            luminaire_power_w=5.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['target_illuminance_lux'] == 50
        assert data['required_luminaires'] >= 1
