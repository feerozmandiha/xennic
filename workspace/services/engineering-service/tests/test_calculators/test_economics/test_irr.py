"""Tests for ECO-003: Internal Rate of Return"""

import pytest
from src.calculators.economics.irr import IRRCalculator, IRRInput


class TestIRR:
    def setup_method(self):
        self.calc = IRRCalculator()

    def test_simple_irr(self):
        """$10k investment, $3k/year for 5 years → IRR ~15-16%"""
        inputs = IRRInput(
            initial_investment=10000,
            cash_flows=[3000, 3000, 3000, 3000, 3000],
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['converged'] is True
        assert 10 < data['irr_pct'] < 20
        assert abs(data['npv_at_irr_usd']) < 0.1

    def test_high_return(self):
        """High return should give high IRR"""
        inputs = IRRInput(
            initial_investment=1000,
            cash_flows=[1000, 1000, 1000],
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['converged'] is True
        assert data['irr_pct'] > 50

    def test_low_return(self):
        """Low return → low IRR"""
        inputs = IRRInput(
            initial_investment=100000,
            cash_flows=[5000, 5000, 5000, 5000, 5000],
        )
        result = self.calc.execute(inputs)
        data = result.results
        assert data['irr_pct'] < 10
