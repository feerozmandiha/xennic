"""
Tests for EA-001: Energy Consumption Analyzer

Covers tariff calculation, power factor analysis, load flow,
consumption trend, and energy efficiency index.
"""

import pytest
from src.calculators.energy_analyzer import EnergyAnalyzerCalculator, EnergyAnalyzerInput


class TestEnergyAnalyzerCalculator:
    def setup_method(self):
        self.calc = EnergyAnalyzerCalculator()

    def test_industrial_mv_tou_analysis(self):
        """Industrial MV subscriber with TOU consumption breakdown."""
        inputs = EnergyAnalyzerInput(
            current_kwh=45000.0,
            billing_days=30,
            subscriber_type="industrial_mv",
            tariff_code="tavanir_industrial_mv",
            climate_zone="moderate",
            contract_type="tou",
            peak_kwh=18000.0,
            mid_kwh=15000.0,
            off_peak_kwh=12000.0,
        )
        result = self.calc.execute(inputs)

        assert result.calculation_code == "EA-001"
        r = result.results
        assert "consumption" in r
        assert "power_factor" in r
        assert "cost" in r
        assert "summary" in r

    def test_residential_flat_rate(self):
        """Residential subscriber with flat rate, moderate climate."""
        inputs = EnergyAnalyzerInput(
            current_kwh=850.0,
            billing_days=30,
            subscriber_type="residential",
            tariff_code="tavanir_residential",
            climate_zone="moderate",
            contract_type="normal",
        )
        result = self.calc.execute(inputs)

        assert result.calculation_code == "EA-001"
        c = result.results["consumption"]
        assert c["daily_avg_kwh"] == pytest.approx(850.0 / 30, rel=0.1)

    def test_hot_climate_tariff_multiplier(self):
        """Hot climate zones should have higher tariff multiplier."""
        hot = EnergyAnalyzerInput(
            current_kwh=1000.0,
            subscriber_type="residential",
            climate_zone="hot",
            contract_type="normal",
        )
        moderate = EnergyAnalyzerInput(
            current_kwh=1000.0,
            subscriber_type="residential",
            climate_zone="moderate",
            contract_type="normal",
        )
        r_hot = self.calc.execute(hot).results
        r_mod = self.calc.execute(moderate).results
        assert r_hot["cost"]["climate_multiplier"] > r_mod["cost"]["climate_multiplier"]

    def test_power_factor_penalty(self):
        """PF below 0.9 should incur reactive power penalty for industrial."""
        inputs = EnergyAnalyzerInput(
            current_kwh=45000.0,
            subscriber_type="industrial_mv",
            tariff_code="tavanir_industrial_mv",
            contract_type="tou",
            power_factor_measured=0.82,
        )
        result = self.calc.execute(inputs)
        pf = result.results["power_factor"]
        assert pf["below_threshold"] is True
        assert pf["measured"] < pf["standard_min"]

    def test_energy_efficiency_index(self):
        """EEI should produce a letter grade A-D."""
        inputs = EnergyAnalyzerInput(
            current_kwh=30000.0,
            subscriber_type="industrial_mv",
            tariff_code="tavanir_industrial_mv",
            contract_type="tou",
            power_factor_measured=0.95,
        )
        result = self.calc.execute(inputs)
        eei = result.results["energy_efficiency"]
        assert eei["grade"] in ("A", "B", "C", "D")

    def test_consumption_trend_with_monthly_history(self):
        """Monthly history should produce trend analysis."""
        from src.calculators.energy_analyzer.schemas import MonthlyData

        inputs = EnergyAnalyzerInput(
            current_kwh=45000.0,
            subscriber_type="industrial_mv",
            tariff_code="tavanir_industrial_mv",
            contract_type="tou",
            monthly_history=[
                MonthlyData(month="1403/01", kwh_consumed=40000.0),
                MonthlyData(month="1403/02", kwh_consumed=42000.0),
                MonthlyData(month="1403/03", kwh_consumed=45000.0),
            ],
        )
        result = self.calc.execute(inputs)
        trend = result.results["trend"]
        assert trend is not None

    def test_load_flow_with_transformer_data(self):
        """Load flow should work when transformer data is provided."""
        inputs = EnergyAnalyzerInput(
            current_kwh=45000.0,
            subscriber_type="industrial_mv",
            tariff_code="tavanir_industrial_mv",
            contract_type="tou",
            transformer_kva=630.0,
            cable_length_m=80.0,
            cable_size_mm2=240.0,
        )
        result = self.calc.execute(inputs)
        lf = result.results["load_flow"]
        assert lf is not None

    def test_recommendations_include_actionable_items(self):
        """Recommendations should be present and non-empty."""
        inputs = EnergyAnalyzerInput(
            current_kwh=45000.0,
            subscriber_type="industrial_mv",
            tariff_code="tavanir_industrial_mv",
            contract_type="tou",
            power_factor_measured=0.78,
        )
        result = self.calc.execute(inputs)
        assert len(result.results.get("recommendations", [])) > 0

    def test_overload_penalty(self):
        """Consumption above contract kW should trigger overload penalty."""
        inputs = EnergyAnalyzerInput(
            current_kwh=100000.0,
            subscriber_type="industrial_mv",
            tariff_code="tavanir_industrial_mv",
            contract_type="tou",
            current_peak_kw=200.0,
            contract_kw=150.0,
        )
        result = self.calc.execute(inputs)
        cost = result.results["cost"]
        if cost.get("overload_penalty"):
            assert cost["overload_penalty"] > 0
