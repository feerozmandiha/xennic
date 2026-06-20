"""Tests for ECO-002: Net Present Value"""

import pytest
from src.calculators.economics.npv import NPVCalculator, NPVInput


class TestNPV:
    def setup_method(self):
        self.calc = NPVCalculator()

    def test_positive_npv(self):
        """$10k investment, $3k/year for 5 years, 10% discount rate"""
        inputs = NPVInput(
            initial_investment=10000,
            cash_flows=[3000, 3000, 3000, 3000, 3000],
            discount_rate_pct=10,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['npv_usd'] > 0
        assert data['profitability_index'] > 1.0
        assert data['decision'] == 'accept'

    def test_negative_npv(self):
        """Negative NPV should reject"""
        inputs = NPVInput(
            initial_investment=100000,
            cash_flows=[5000, 5000, 5000],
            discount_rate_pct=15,
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['npv_usd'] < 0
        assert data['decision'] == 'reject'
