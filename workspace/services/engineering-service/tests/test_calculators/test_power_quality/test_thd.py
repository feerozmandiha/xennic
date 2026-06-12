# tests/test_calculators/test_power_quality/test_thd.py
"""Unit tests for PQ-001: THD Calculator"""

import math
import pytest
from src.calculators.power_quality.thd import THDCalculator
from src.calculators.power_quality.schemas import THDInput


class TestTHDCalculator:

    def setup_method(self):
        self.calc = THDCalculator()

    def test_pure_sine_wave_zero_thd(self):
        """Pure sine wave (only fundamental) → THD = 0%"""
        inputs = THDInput(harmonic_currents={1: 100.0})
        result = self.calc.execute(inputs)
        assert result.results["thd_percent"] == 0.0
        assert result.results["is_compliant"] is True

    def test_typical_vfd_spectrum(self):
        """Typical 6-pulse VFD — 5th and 7th dominant"""
        inputs = THDInput(harmonic_currents={
            1: 100.0, 5: 20.0, 7: 14.0, 11: 9.0, 13: 7.0
        })
        result = self.calc.execute(inputs)
        # THD = sqrt(20²+14²+9²+7²) / 100 * 100
        expected = math.sqrt(20**2 + 14**2 + 9**2 + 7**2)
        assert abs(result.results["thd_percent"] - expected) < 0.01

    def test_ieee519_compliance_low_voltage(self):
        """THD < 8% → compliant for ≤1kV systems"""
        inputs = THDInput(
            harmonic_currents={1: 100.0, 5: 5.0, 7: 3.0},
            base_voltage_kv=0.4,
        )
        result = self.calc.execute(inputs)
        assert result.results["thd_percent"] < 8.0
        assert result.results["is_compliant"] is True
        assert result.results["ieee519_voltage_category"] == "≤1kV"

    def test_ieee519_noncompliant(self):
        """THD > 5% → non-compliant for 1-69kV system"""
        inputs = THDInput(
            harmonic_currents={1: 100.0, 5: 30.0, 7: 20.0},
            base_voltage_kv=11.0,
        )
        result = self.calc.execute(inputs)
        assert result.results["is_compliant"] is False
        assert len(result.results["warnings"]) > 0

    def test_dominant_harmonic_detected(self):
        """5th harmonic is dominant"""
        inputs = THDInput(harmonic_currents={1: 100.0, 3: 5.0, 5: 30.0, 7: 10.0})
        result = self.calc.execute(inputs)
        assert result.results["dominant_harmonic_order"] == 5

    def test_spectrum_percent_calculated(self):
        """Spectrum as % of fundamental"""
        inputs = THDInput(harmonic_currents={1: 100.0, 5: 20.0})
        result = self.calc.execute(inputs)
        assert result.results["spectrum_percent"]["5"] == pytest.approx(20.0)

    def test_total_rms_current(self):
        """Total RMS = sqrt(I1² + Σ Ih²)"""
        inputs = THDInput(harmonic_currents={1: 100.0, 5: 30.0, 7: 20.0})
        result = self.calc.execute(inputs)
        expected_rms = math.sqrt(100**2 + 30**2 + 20**2)
        assert abs(result.results["total_rms_a"] - expected_rms) < 0.01

    def test_missing_fundamental_raises_error(self):
        """Must include fundamental (order=1)"""
        with pytest.raises(ValueError, match="fundamental"):
            THDInput(harmonic_currents={5: 20.0, 7: 10.0})

    def test_metadata_correct(self):
        """Standard and code are correct"""
        assert self.calc.CALCULATION_CODE == "PQ-001"
        assert self.calc.STANDARD == "IEEE 519"
        assert self.calc.STANDARD_VERSION == "2022"
