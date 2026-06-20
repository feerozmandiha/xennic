"""
Unit tests for Motor Efficiency Verification (MOT-002)
"""

import pytest
from src.calculators.renewable.motor_efficiency import MotorEfficiencyCalculator
from src.calculators.renewable.schemas import MotorEfficiencyInput


class TestMotorEfficiency:
    """Tests for MOT-002: Motor Efficiency (IEC 60034-30-1)"""

    def setup_method(self):
        self.calc = MotorEfficiencyCalculator()

    def test_ie3_compliant(self):
        """37kW IE3 motor with valid efficiency should be compliant"""
        inputs = MotorEfficiencyInput(
            rated_power_kw=37.0,
            ie_class='IE3',
            declared_efficiency_pct=94.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['class_compliant'] is True
        assert data['required_min_efficiency_pct'] > 0
        assert data['ie_class'] == 'IE3'

    def test_ie4_premium(self):
        """7.5kW IE4 motor should require ~91.5% min"""
        inputs = MotorEfficiencyInput(
            rated_power_kw=7.5,
            ie_class='IE4',
            declared_efficiency_pct=92.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['class_compliant'] is True
        assert data['required_min_efficiency_pct'] > 90

    def test_non_compliant(self):
        """Motor below IE class minimum should flag non-compliant"""
        inputs = MotorEfficiencyInput(
            rated_power_kw=15.0,
            ie_class='IE3',
            declared_efficiency_pct=88.0,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['class_compliant'] is False
        assert data['efficiency_at_100_pct'] == 88.0
        # Verify recommendation note
        notes = data['recommendation_notes']
        assert any('below' in n for n in notes)

    def test_partial_load_efficiency(self):
        """75% and 50% load efficiency should be calculated"""
        inputs = MotorEfficiencyInput(
            rated_power_kw=30.0,
            ie_class='IE3',
            declared_efficiency_pct=93.6,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert 88 <= data['efficiency_at_75_pct'] <= 95
        assert 85 <= data['efficiency_at_50_pct'] <= 95
        # Efficiency at 50% should be lower than at 75%
        assert data['efficiency_at_50_pct'] < data['efficiency_at_75_pct']

    def test_power_factor_estimation(self):
        """Power factor should be estimated at different loads"""
        inputs = MotorEfficiencyInput(
            rated_power_kw=55.0,
            ie_class='IE3',
            declared_efficiency_pct=94.6,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert 0.8 <= data['power_factor_at_100'] <= 0.95
        assert data['power_factor_at_75'] <= data['power_factor_at_100']
        assert data['power_factor_at_50'] <= data['power_factor_at_75']

    def test_annual_energy(self):
        """Annual energy consumption should scale with load and hours"""
        inputs = MotorEfficiencyInput(
            rated_power_kw=37.0, ie_class='IE3',
            declared_efficiency_pct=94.0,
            load_factor=0.8, annual_operating_hours=6000.0,
            energy_cost_per_kwh=0.10,
        )
        result = self.calc.execute(inputs)
        data = result.results
        # P_in = P_out / η = 37*0.8 / 0.94 = 31.49 kW
        # Energy = 31.49 * 6000 = 188,936 kWh
        assert 150000 <= data['annual_energy_consumption_kwh'] <= 250000
        assert data['annual_energy_cost_usd'] > 0
        assert data['annual_co2_kg'] > 0

    def test_upgrade_ie2_to_ie3(self):
        """IE2 → IE3 upgrade should show savings"""
        inputs = MotorEfficiencyInput(
            rated_power_kw=37.0,
            ie_class='IE2',
            declared_efficiency_pct=93.0,
            load_factor=0.8,
            annual_operating_hours=6000.0,
            energy_cost_per_kwh=0.10,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data.get('upgrade_to_class') == 'IE3'
        assert data.get('upgrade_savings_kwh', 0) > 0
        assert data.get('upgrade_savings_usd', 0) > 0

    def test_upgrade_ie3_to_ie4(self):
        """IE3 → IE4 upgrade should show savings"""
        inputs = MotorEfficiencyInput(
            rated_power_kw=11.0,
            ie_class='IE3',
            declared_efficiency_pct=91.4,
            load_factor=0.85,
            annual_operating_hours=8000.0,
            energy_cost_per_kwh=0.12,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data.get('upgrade_to_class') == 'IE4'
        if data.get('upgrade_savings_usd', 0) > 0:
            assert data.get('upgrade_payback_years') is not None

    def test_light_load_recommendation(self):
        """Low load factor should trigger downsizing recommendation"""
        inputs = MotorEfficiencyInput(
            rated_power_kw=30.0, ie_class='IE3',
            declared_efficiency_pct=93.6,
            load_factor=0.30,
        )
        result = self.calc.execute(inputs)
        notes = result.results['recommendation_notes']
        assert any('lightly' in n or 'downsiz' in n for n in notes)

    def test_pole_count_correction(self):
        """6-pole motor should have adjusted efficiency requirement"""
        inputs_4p = MotorEfficiencyInput(
            rated_power_kw=15.0, ie_class='IE3',
            declared_efficiency_pct=92.1, pole_count=4,
        )
        inputs_6p = MotorEfficiencyInput(
            rated_power_kw=15.0, ie_class='IE3',
            declared_efficiency_pct=92.1, pole_count=6,
        )
        r1 = self.calc.execute(inputs_4p)
        r2 = self.calc.execute(inputs_6p)
        # 6-pole has lower required efficiency (0.95 factor)
        assert r2.results['required_min_efficiency_pct'] < r1.results['required_min_efficiency_pct']
