"""Tests for ECO-001: Return on Investment"""

import pytest
from src.calculators.economics.roi import ROICalculator
from src.calculators.economics.roi import ROIInput


class TestROI:
    def setup_method(self):
        self.calc = ROICalculator()

    def test_basic_roi(self):
        """$10k investment, $3k/year savings, 5 years"""
        inputs = ROIInput(initial_investment=10000, annual_savings=3000, analysis_years=5)
        result = self.calc.execute(inputs)
        data = result.results
        assert data['simple_roi_pct'] == 50.0  # (15000-10000)/10000 * 100
        assert data['payback_years'] == pytest.approx(3.33, rel=0.1)
        assert data['net_cash_flow'] == 15000
        assert data['npv_usd'] > 0  # discount rate 0 → NPV = total_net - inv

    def test_with_costs(self):
        """With operating costs"""
        inputs = ROIInput(initial_investment=50000, annual_savings=20000, annual_operating_costs=5000, analysis_years=10)
        result = self.calc.execute(inputs)
        data = result.results
        assert data['annual_net_cash_flow'] == 15000
        assert data['payback_years'] == pytest.approx(3.33, rel=0.1)

    def test_discount_rate_npv(self):
        """With discount rate, NPV should be lower than simple"""
        inputs = ROIInput(initial_investment=10000, annual_savings=3000, analysis_years=5, discount_rate_pct=10)
        result = self.calc.execute(inputs)
        data = result.results
        assert data['npv_usd'] > 0
        assert data['benefit_cost_ratio'] > 1.0
