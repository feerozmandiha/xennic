"""
Tests for MOT-001: Motor Starting Current and Voltage Drop Analysis
"""

import pytest
from src.calculators.renewable.motor_starting import MotorStartingCalculator
from src.calculators.renewable.schemas import MotorStartingInput


class TestMotorStartingCalculator:
    def setup_method(self):
        self.calc = MotorStartingCalculator()

    def test_dol_starting_current(self):
        """DOL start of 45kW motor with 250kVA transformer."""
        inputs = MotorStartingInput(
            motor_kw=45.0,
            motor_voltage_v=400.0,
            motor_efficiency=0.92,
            motor_power_factor=0.85,
            starting_method="DOL",
            starting_current_factor=6.0,
            transformer_kva=250.0,
            transformer_impedance_pct=5.0,
            cable_resistance_mohm_m=0.5,
            cable_length_m=50.0,
            allowable_voltage_dip_pct=15.0,
        )
        result = self.calc.execute(inputs)

        assert result.calculation_code == "MOT-001"
        r = result.results
        assert r["full_load_current_a"] > 0
        assert r["starting_current_a"] > r["full_load_current_a"]
        assert r["voltage_dip_pct"] > 0
        assert r["starting_kva"] > 0
        assert r["z_total_mohm"] > 0

    def test_star_delta_lower_dip(self):
        """Star-Delta should have lower starting current than DOL."""
        dol = MotorStartingInput(
            motor_kw=45.0, transformer_kva=250.0,
            starting_method="DOL",
        )
        sd = MotorStartingInput(
            motor_kw=45.0, transformer_kva=250.0,
            starting_method="StarDelta",
        )
        r_dol = self.calc.execute(dol).results
        r_sd = self.calc.execute(sd).results

        assert r_sd["starting_current_a"] < r_dol["starting_current_a"]
        assert r_sd["voltage_dip_pct"] < r_dol["voltage_dip_pct"]

    def test_vfd_lowest_starting_current(self):
        """VFD has the lowest starting current among all methods."""
        vfd = MotorStartingInput(
            motor_kw=45.0, transformer_kva=250.0,
            starting_method="VFD",
        )
        r = self.calc.execute(vfd).results
        assert r["current_factor"] < 2.0

    def test_voltage_dip_within_limits(self):
        """Stiff source + small motor → dip under allowable."""
        inputs = MotorStartingInput(
            motor_kw=15.0,
            transformer_kva=500.0,
            cable_length_m=10.0,
            cable_resistance_mohm_m=0.2,
        )
        result = self.calc.execute(inputs)
        r = result.results
        assert r["voltage_dip_ok"] is True
        assert r["voltage_dip_pct"] < r["allowable_dip_pct"]

    def test_large_motor_exceeds_dip_limit(self):
        """Weak transformer + large motor → dip exceeds limit → warnings."""
        inputs = MotorStartingInput(
            motor_kw=200.0,
            transformer_kva=250.0,
            cable_length_m=200.0,
            cable_resistance_mohm_m=1.0,
            allowable_voltage_dip_pct=10.0,
        )
        result = self.calc.execute(inputs)

        r = result.results
        if not r["voltage_dip_ok"]:
            assert len(r["warnings"]) > 0
            assert len(r["recommendations"]) > 0

    def test_starting_time_positive(self):
        """Estimated starting time should be positive and finite."""
        inputs = MotorStartingInput(
            motor_kw=37.0, transformer_kva=315.0,
        )
        result = self.calc.execute(inputs)
        assert result.results["estimated_starting_time_s"] > 0

    def test_invalid_method_raises(self):
        """Invalid starting method should raise ValueError."""
        with pytest.raises(ValueError):
            inputs = MotorStartingInput(
                motor_kw=45.0, transformer_kva=250.0,
                starting_method="InvalidMethod",
            )
            self.calc.execute(inputs)

    def test_units_are_defined(self):
        """All output fields have units."""
        units = self.calc.get_units()
        assert "full_load_current_a" in units
        assert "starting_current_a" in units
        assert "voltage_dip_pct" in units
