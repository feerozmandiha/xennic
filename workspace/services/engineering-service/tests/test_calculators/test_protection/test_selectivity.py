"""
Tests for PROT-003: Selectivity (Discrimination) Analysis per IEC 60947-2
"""

import pytest
from src.calculators.protection.selectivity import SelectivityCalculator
from src.calculators.protection.schemas import SelectivityInput


class TestSelectivityCalculator:
    def setup_method(self):
        self.calc = SelectivityCalculator()

    def test_current_selectivity_achieved(self):
        """Upstream Ii >> downstream Ii → selectivity achieved."""
        inputs = SelectivityInput(
            upstream_rated_current_a=630.0,
            upstream_instantaneous_threshold_a=6300.0,
            downstream_rated_current_a=250.0,
            downstream_instantaneous_threshold_a=2500.0,
            fault_current_ka=2.0,
            selectivity_type="current",
        )
        result = self.calc.execute(inputs)

        assert result.calculation_code == "PROT-003"
        r = result.results
        assert r["is_selective"] is True
        assert r["selectivity_ratio"] > 1.0
        assert r["selectivity_limit_ka"] > 0

    def test_current_selectivity_not_achieved(self):
        """Upstream Ii <= downstream Ii → selectivity NOT achieved."""
        inputs = SelectivityInput(
            upstream_rated_current_a=250.0,
            upstream_instantaneous_threshold_a=2500.0,
            downstream_rated_current_a=630.0,
            downstream_instantaneous_threshold_a=6300.0,
            fault_current_ka=25.0,
            selectivity_type="current",
        )
        result = self.calc.execute(inputs)
        assert result.results["is_selective"] is False

    def test_current_selectivity_fault_exceeds_limit(self):
        """Fault current above selectivity limit → not selective."""
        inputs = SelectivityInput(
            upstream_rated_current_a=630.0,
            upstream_instantaneous_threshold_a=6300.0,
            downstream_rated_current_a=250.0,
            downstream_instantaneous_threshold_a=2500.0,
            fault_current_ka=50.0,
            selectivity_type="current",
        )
        result = self.calc.execute(inputs)

        r = result.results
        assert r["is_selective"] is False

    def test_time_selectivity_achieved(self):
        """Upstream delay >> downstream clearing → time selectivity."""
        inputs = SelectivityInput(
            upstream_rated_current_a=630.0,
            upstream_instantaneous_threshold_a=6300.0,
            downstream_rated_current_a=250.0,
            downstream_instantaneous_threshold_a=2500.0,
            fault_current_ka=15.0,
            selectivity_type="time",
            upstream_delay_ms=300.0,
            downstream_clearing_ms=30.0,
        )
        result = self.calc.execute(inputs)
        assert result.results["is_selective"] is True

    def test_time_selectivity_not_achieved(self):
        """Upstream delay too short → not selective."""
        inputs = SelectivityInput(
            upstream_rated_current_a=630.0,
            upstream_instantaneous_threshold_a=6300.0,
            downstream_rated_current_a=250.0,
            downstream_instantaneous_threshold_a=2500.0,
            fault_current_ka=15.0,
            selectivity_type="time",
            upstream_delay_ms=20.0,
            downstream_clearing_ms=30.0,
        )
        result = self.calc.execute(inputs)
        assert result.results["is_selective"] is False

    def test_time_selectivity_missing_params_raises(self):
        """Missing delay params should raise ValueError on execute."""
        with pytest.raises(ValueError):
            inputs = SelectivityInput(
                upstream_rated_current_a=630.0,
                upstream_instantaneous_threshold_a=6300.0,
                downstream_rated_current_a=250.0,
                downstream_instantaneous_threshold_a=2500.0,
                fault_current_ka=15.0,
                selectivity_type="time",
            )
            self.calc.execute(inputs)

    def test_zone_selectivity_always_selective(self):
        """ZSI inherently achieves selectivity."""
        inputs = SelectivityInput(
            upstream_rated_current_a=630.0,
            upstream_instantaneous_threshold_a=6300.0,
            downstream_rated_current_a=250.0,
            downstream_instantaneous_threshold_a=2500.0,
            fault_current_ka=50.0,
            selectivity_type="zone_interlocking",
        )
        result = self.calc.execute(inputs)
        assert result.results["is_selective"] is True

    def test_same_breaker_no_selectivity(self):
        """Identical breakers cannot achieve current selectivity."""
        inputs = SelectivityInput(
            upstream_rated_current_a=630.0,
            upstream_instantaneous_threshold_a=6300.0,
            downstream_rated_current_a=630.0,
            downstream_instantaneous_threshold_a=6300.0,
            fault_current_ka=10.0,
            selectivity_type="current",
        )
        result = self.calc.execute(inputs)
        assert result.results["selectivity_ratio"] == 1.0
        assert result.results["is_selective"] is False
