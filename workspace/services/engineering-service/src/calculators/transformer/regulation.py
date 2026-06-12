"""
TRF-003: Voltage Regulation Calculator

Based on IEC 60076
Formula:
ΔV% = Load% × (R × cosφ + X × sinφ)

Where:
- R = resistance component of impedance (R = Z × cosφ_z)
- X = reactance component of impedance (X = Z × sinφ_z)
- Z = impedance percent / 100
- cosφ = load power factor
- sinφ = √(1 - cos²φ)

Simplified formula: ΔV% ≈ Load% × (Z% × cos(φ_z - φ))
"""

import math
from typing import Dict
from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import TransformerRegulationInput, TransformerRegulationOutput


class TransformerRegulationCalculator(BaseCalculator[TransformerRegulationInput]):
    """
    Voltage Regulation Calculator according to IEC 60076
    
    Calculates voltage drop from no-load to full-load condition.
    """
    
    CALCULATION_CODE = "TRF-003"
    CALCULATION_NAME = "Voltage Regulation"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 60076"
    STANDARD_VERSION = "2020"
    ENGINE_VERSION = "0.1.0"
    
    # Typical X/R ratios for transformers
    TYPICAL_XR_RATIOS = {
        100: 1.5,
        500: 3.0,
        1000: 4.0,
        2500: 5.0,
        5000: 6.0,
        10000: 7.0,
    }
    
    def validate_inputs(self, inputs: TransformerRegulationInput) -> bool:
        """Validate input parameters"""
        ValidationEngine.validate_positive(inputs.impedance_percent, "impedance_percent")
        ValidationEngine.validate_physical_range(inputs.impedance_percent, 0, 20, "impedance_percent")
        ValidationEngine.validate_physical_range(inputs.power_factor, 0, 1, "power_factor")
        ValidationEngine.validate_physical_range(inputs.load_percent, 0, 150, "load_percent")
        
        return True
    
    def _estimate_xr_ratio(self, power_kva: float = 1000) -> float:
        """Estimate X/R ratio based on transformer size"""
        sizes = sorted(self.TYPICAL_XR_RATIOS.keys())
        for size in sizes:
            if power_kva <= size:
                return self.TYPICAL_XR_RATIOS[size]
        return self.TYPICAL_XR_RATIOS[sizes[-1]]
    
    def _calculate_regulation(self, inputs: TransformerRegulationInput) -> float:
        """
        Calculate voltage regulation percentage
        
        Formula: ΔV% = Load% × (R% × cosφ + X% × sinφ)
        Where R% = Z% × cosθ, X% = Z% × sinθ
        θ = arctan(X/R)
        """
        Z = inputs.impedance_percent / 100
        load_pu = inputs.load_percent / 100
        
        # Estimate X/R ratio (typical value)
        XR = self._estimate_xr_ratio()
        
        # Calculate R and X components of impedance
        R_pu = Z / math.sqrt(1 + XR**2)
        X_pu = R_pu * XR
        
        cosφ = inputs.power_factor
        sinφ = math.sqrt(1 - cosφ**2)
        
        # Voltage regulation formula
        regulation = load_pu * (R_pu * cosφ + X_pu * sinφ) * 100
        
        return round(regulation, 2)
    
    def _calculate(self, inputs: TransformerRegulationInput) -> Dict:
        """Calculate voltage regulation"""
        regulation_pct = self._calculate_regulation(inputs)
        
        return {
            "voltage_regulation_percent": regulation_pct,
            "impedance_percent": inputs.impedance_percent,
            "load_percent": inputs.load_percent,
            "power_factor": inputs.power_factor,
            "is_within_limits": regulation_pct <= 5.0,
        }
    
    def get_units(self) -> Dict[str, str]:
        return {
            "impedance_percent": "%",
            "power_factor": "unitless",
            "load_percent": "%",
            "voltage_regulation_percent": "%",
        }
