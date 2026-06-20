"""
ECO-002: Net Present Value (NPV) Calculator

Formulas:
  NPV = -C₀ + Σ(C_t / (1+r)^t)   for t=1..n
  PI  = NPV / C₀ + 1             (Profitability Index)

Where:
  C₀ = initial investment
  C_t = net cash flow at year t
  r  = discount rate
  n  = analysis period
"""

from typing import Dict, List, Any
from pydantic import BaseModel, Field
from src.core.base_calculator import BaseCalculator, CalculationInput
from src.core.validation import ValidationEngine


class NPVInput(CalculationInput):
    initial_investment: float = Field(..., gt=0, description="Initial capital investment (USD)")
    cash_flows: List[float] = Field(..., min_length=1, description="Annual net cash flows (USD) for each year")
    discount_rate_pct: float = Field(..., gt=0, le=100, description="Annual discount rate (%)")


class NPVOutput(BaseModel):
    npv_usd: float = Field(..., description="Net Present Value (USD)")
    profitability_index: float = Field(..., description="Profitability Index (PI)")
    initial_investment: float = Field(..., description="Initial investment (USD)")
    total_cash_flows: float = Field(..., description="Sum of undiscounted cash flows (USD)")
    discount_rate_pct: float = Field(..., description="Applied discount rate (%)")
    decision: str = Field(..., description="Investment decision: accept / reject")


class NPVCalculator(BaseCalculator[NPVInput]):
    CALCULATION_CODE = "ECO-002"
    CALCULATION_NAME = "Net Present Value"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "ISO 15686-5 / IEC 60300-3-3"
    STANDARD_VERSION = "2017"
    ENGINE_VERSION   = "0.1.0"

    def validate_inputs(self, inputs: NPVInput) -> bool:
        ValidationEngine.validate_positive(inputs.initial_investment, "initial_investment")
        ValidationEngine.validate_positive(inputs.discount_rate_pct, "discount_rate_pct")
        return True

    def _calculate(self, inputs: NPVInput) -> Dict[str, Any]:
        inv = inputs.initial_investment
        cf  = inputs.cash_flows
        dr  = inputs.discount_rate_pct / 100.0

        npv = -inv
        for t, cf_t in enumerate(cf, start=1):
            npv += cf_t / ((1.0 + dr) ** t)

        total_cf = sum(cf)
        pi = (npv + inv) / inv if inv > 0 else 0.0  # PI = PV of future CF / Investment

        return {
            "npv_usd": round(npv, 2),
            "profitability_index": round(pi, 3),
            "initial_investment": inv,
            "total_cash_flows": round(total_cf, 2),
            "discount_rate_pct": inputs.discount_rate_pct,
            "decision": "accept" if npv >= 0 else "reject",
        }

    def get_units(self) -> Dict[str, str]:
        return {"npv_usd": "USD", "initial_investment": "USD", "total_cash_flows": "USD"}

    def get_output_model(self):
        return NPVOutput
