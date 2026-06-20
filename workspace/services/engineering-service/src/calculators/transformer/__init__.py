"""
Transformer Engineering Module

Based on:
- IEC 60076: Power Transformers
- IEEE C57.110: K-Factor for Non-linear Loads
"""

from .sizing import TransformerSizingCalculator
from .losses import TransformerLossesCalculator
from .regulation import TransformerRegulationCalculator
from .k_factor import KFactorCalculator
from .efficiency import TransformerEfficiencyCalculator

__all__ = [
    "TransformerSizingCalculator",
    "TransformerLossesCalculator",
    "TransformerRegulationCalculator",
    "KFactorCalculator",
    "TransformerEfficiencyCalculator",
]
