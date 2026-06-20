"""
ECO-003: Internal Rate of Return (IRR) Calculator

Finds r such that NPV(r) = 0 using Newton-Raphson iteration:
  r_{n+1} = r_n - NPV(r_n) / NPV'(r_n)

Where:
  NPV(r)  = -C₀ + Σ(C_t / (1+r)^t)
  NPV'(r) = -Σ(t × C_t / (1+r)^{t+1})
"""

from typing import Dict, List, Any
from pydantic import BaseModel, Field
from src.core.base_calculator import BaseCalculator, CalculationInput
from src.core.validation import ValidationEngine


class IRRInput(CalculationInput):
    initial_investment: float = Field(..., gt=0, description="Initial capital investment (USD)")
    cash_flows: List[float] = Field(..., min_length=1, max_length=100, description="Annual net cash flows (USD)")
    max_iterations: int = Field(default=100, ge=10, le=10000, description="Maximum Newton-Raphson iterations")
    tolerance: float = Field(default=1e-6, gt=0, le=0.01, description="Convergence tolerance")


class IRROutput(BaseModel):
    irr_pct: float = Field(..., description="Internal Rate of Return (%)")
    npv_at_irr_usd: float = Field(..., description="NPV at computed IRR (should be ~0)")
    iterations: int = Field(..., description="Iterations to converge")
    converged: bool = Field(..., description="Whether solution converged")
    initial_investment: float = Field(..., description="Initial investment (USD)")
    total_cash_flows: float = Field(..., description="Sum of undiscounted cash flows (USD)")
    recommendation: str = Field(..., description="Investment recommendation")


_MAX_IRR_ITERATIONS = 1000


def _npv(inv: float, cf: List[float], r: float) -> float:
    value = -inv
    for t, cf_t in enumerate(cf, start=1):
        value += cf_t / ((1.0 + r) ** t)
    return value


def _npv_derivative(inv: float, cf: List[float], r: float) -> float:
    value = 0.0
    for t, cf_t in enumerate(cf, start=1):
        value -= t * cf_t / ((1.0 + r) ** (t + 1))
    return value


class IRRCalculator(BaseCalculator[IRRInput]):
    CALCULATION_CODE = "ECO-003"
    CALCULATION_NAME = "Internal Rate of Return"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "ISO 15686-5 / IEC 60300-3-3"
    STANDARD_VERSION = "2017"
    ENGINE_VERSION   = "0.1.0"

    def validate_inputs(self, inputs: IRRInput) -> bool:
        ValidationEngine.validate_positive(inputs.initial_investment, "initial_investment")
        return True

    def _calculate(self, inputs: IRRInput) -> Dict[str, Any]:
        inv = inputs.initial_investment
        cf  = inputs.cash_flows
        tol = inputs.tolerance
        max_iter = min(inputs.max_iterations, _MAX_IRR_ITERATIONS)

        total_cf = sum(cf)

        # Initial guess: (total_cf / inv) ^ (1/n) - 1
        n = len(cf)
        avg_return = (total_cf / inv) ** (1.0 / n) - 1.0 if inv > 0 and total_cf > 0 else 0.1
        r = max(0.001, min(avg_return, 10.0))  # clamp between 0.1% and 1000%

        converged = False
        iteration = 0

        for i in range(max_iter):
            iteration = i + 1
            f = _npv(inv, cf, r)
            if abs(f) < tol:
                converged = True
                break
            f_prime = _npv_derivative(inv, cf, r)
            if abs(f_prime) < 1e-15:
                break
            r_new = r - f / f_prime
            r_new = max(-0.999, min(r_new, 10.0))  # keep in [-99.9%, 1000%]
            if abs(r_new - r) < tol:
                r = r_new
                converged = True
                break
            r = r_new

        irr_pct = r * 100.0
        npv_at_irr = _npv(inv, cf, r)

        if converged:
            rec = f"IRR = {irr_pct:.2f}% — {'Accept (IRR > discount rate)' if irr_pct > 5.0 else 'Reject (low return)'}"
        else:
            rec = f"IRR did not converge after {iteration} iterations — try different cash flow pattern"

        return {
            "irr_pct": round(irr_pct, 4),
            "npv_at_irr_usd": round(npv_at_irr, 6),
            "iterations": iteration,
            "converged": converged,
            "initial_investment": inv,
            "total_cash_flows": round(total_cf, 2),
            "recommendation": rec,
        }

    def get_units(self) -> Dict[str, str]:
        return {"irr_pct": "%", "initial_investment": "USD", "total_cash_flows": "USD"}

    def get_output_model(self):
        return IRROutput
