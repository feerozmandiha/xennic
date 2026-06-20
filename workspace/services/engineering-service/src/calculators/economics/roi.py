"""
ECO-001: Return on Investment (ROI) Calculator

Formulas:
  ROI (%)      = (Net Profit / Total Investment) × 100
  Payback      = Total Investment / Net Annual Cash Flow
  Net Savings  = Σ(annual_savings - annual_costs) over n years
"""

from typing import Dict, Any
from pydantic import BaseModel, Field
from src.core.base_calculator import BaseCalculator, CalculationInput
from src.core.validation import ValidationEngine


class ROIInput(CalculationInput):
    initial_investment: float = Field(..., gt=0, description="Initial capital investment (USD)")
    annual_savings: float = Field(..., gt=0, description="Annual cost savings / revenue (USD)")
    annual_operating_costs: float = Field(default=0.0, ge=0, description="Annual O&M costs (USD)")
    analysis_years: int = Field(default=10, gt=0, le=50, description="Analysis period (years)")
    discount_rate_pct: float = Field(default=0.0, ge=0, le=100, description="Discount rate for NPV (%) — 0 = simple ROI")


class ROIOutput(BaseModel):
    simple_roi_pct: float = Field(..., description="Simple ROI over analysis period (%)")
    annual_roi_pct: float = Field(..., description="Annualized ROI (%)")
    payback_years: float = Field(..., description="Simple payback period (years)")
    net_cash_flow: float = Field(..., description="Total net cash flow (USD)")
    annual_net_cash_flow: float = Field(..., description="Net cash flow per year (USD)")
    npv_usd: float = Field(..., description="Net Present Value (USD) if discount_rate > 0")
    benefit_cost_ratio: float = Field(..., description="Benefit-to-cost ratio")


class ROICalculator(BaseCalculator[ROIInput]):
    CALCULATION_CODE = "ECO-001"
    CALCULATION_NAME = "Return on Investment"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 60300-3-3 / ISO 15686-5"
    STANDARD_VERSION = "2017"
    ENGINE_VERSION   = "0.1.0"

    def validate_inputs(self, inputs: ROIInput) -> bool:
        ValidationEngine.validate_positive(inputs.initial_investment, "initial_investment")
        ValidationEngine.validate_positive(inputs.annual_savings, "annual_savings")
        return True

    def _calculate(self, inputs: ROIInput) -> Dict[str, Any]:
        inv  = inputs.initial_investment
        sav  = inputs.annual_savings
        cost = inputs.annual_operating_costs
        n    = inputs.analysis_years
        dr   = inputs.discount_rate_pct / 100.0

        net_annual = sav - cost

        # Simple payback
        payback = inv / net_annual if net_annual > 0 else float('inf')

        # Simple ROI
        total_net = net_annual * n
        roi_pct = ((total_net - inv) / inv) * 100.0
        annual_roi = roi_pct / n

        # NPV
        npv = -inv
        for t in range(1, n + 1):
            npv += net_annual / ((1.0 + dr) ** t)

        # Benefit-cost ratio
        total_benefits = sav * n
        total_costs = inv + cost * n
        bcr = total_benefits / total_costs if total_costs > 0 else 0.0

        return {
            "simple_roi_pct": round(roi_pct, 2),
            "annual_roi_pct": round(annual_roi, 2),
            "payback_years": round(payback, 2),
            "net_cash_flow": round(total_net, 2),
            "annual_net_cash_flow": round(net_annual, 2),
            "npv_usd": round(npv, 2),
            "benefit_cost_ratio": round(bcr, 3),
        }

    def get_units(self) -> Dict[str, str]:
        return {"npv_usd": "USD", "net_cash_flow": "USD", "annual_net_cash_flow": "USD"}

    def get_output_model(self):
        return ROIOutput
