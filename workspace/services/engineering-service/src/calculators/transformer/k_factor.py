"""
TRF-004: K-Factor Calculator

Based on IEEE C57.110
Formula: K = Σ(I_h² × h²) / Σ(I_h²)

Where:
- I_h = harmonic current as a percentage of fundamental (per unit)
- h = harmonic order

K-Factor ratings: 4, 9, 13, 20, 30, 40, 50
"""

import math
from typing import Dict
from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import KFactorInput, KFactorOutput


class KFactorCalculator(BaseCalculator[KFactorInput]):
    """
    K-Factor Calculator according to IEEE C57.110
    
    Calculates transformer derating factor for non-linear loads.
    """
    
    CALCULATION_CODE = "TRF-004"
    CALCULATION_NAME = "K-Factor (Harmonics)"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEEE C57.110"
    STANDARD_VERSION = "2018"
    ENGINE_VERSION = "0.1.0"
    
    # Standard K-Factor ratings
    STANDARD_K_FACTORS = [4, 9, 13, 20, 30, 40, 50]
    
    def validate_inputs(self, inputs: KFactorInput) -> bool:
        """Validate input parameters"""
        if not inputs.harmonic_currents:
            raise ValueError("At least one harmonic current must be provided")
        
        for order, current in inputs.harmonic_currents.items():
            ValidationEngine.validate_positive(current, f"harmonic_{order}_current")
            if current > 100:
                raise ValueError(f"Harmonic current {current}% exceeds 100%")
        
        return True
    
    def _calculate_k_factor(self, inputs: KFactorInput) -> float:
        """
        Calculate K-Factor based on harmonic currents
        
        K = Σ(I_h² × h²) / Σ(I_h²)
        """
        sum_i_squared = 0
        sum_i_squared_h_squared = 0
        
        for order, current_pct in inputs.harmonic_currents.items():
            I_pu = current_pct / 100
            I_squared = I_pu ** 2
            
            sum_i_squared += I_squared
            sum_i_squared_h_squared += I_squared * (order ** 2)
        
        if sum_i_squared == 0:
            return 1.0
        
        k_factor = sum_i_squared_h_squared / sum_i_squared
        return round(k_factor, 2)
    
    def _get_standard_k_factor(self, k_factor: float) -> int:
        """Get the nearest standard K-Factor rating (round up)"""
        for standard_k in self.STANDARD_K_FACTORS:
            if standard_k >= k_factor:
                return standard_k
        return self.STANDARD_K_FACTORS[-1]
    
    def _calculate_derating_factor(self, k_factor: float) -> float:
        """
        Calculate transformer derating factor based on K-Factor
        
        Approximate formula: Derating = 1 / (1 + (K-1)/K_max)
        """
        if k_factor <= 1:
            return 1.0
        
        # Derating factor decreases as K-Factor increases
        derating = 1.0 / (1.0 + (k_factor - 1) / 50)
        return round(max(derating, 0.5), 2)
    
    def _calculate(self, inputs: KFactorInput) -> Dict:
        """Calculate K-Factor and derating"""
        k_factor = self._calculate_k_factor(inputs)
        standard_k = self._get_standard_k_factor(k_factor)
        derating = self._calculate_derating_factor(k_factor)
        
        return {
            "k_factor": k_factor,
            "derating_factor": derating,
            "recommended_k_factor_rating": standard_k,
            "recommended_derating": round(derating, 2),
        }
    
    def get_units(self) -> Dict[str, str]:
        return {
            "harmonic_currents": "%",
            "k_factor": "unitless",
            "derating_factor": "pu",
            "recommended_k_factor_rating": "unitless",
        }
