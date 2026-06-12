"""
TRF-001: Transformer Sizing Calculator

Based on IEC 60076
Formulas:
- Three-phase: S = √3 × V × I / 1000 (kVA)
- Single-phase: S = V × I / 1000 (kVA)
- I = S × 1000 / (√3 × V) for three-phase
- I = S × 1000 / V for single-phase
"""

import math
from typing import Dict, Optional
from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import TransformerSizingInput, TransformerSizingOutput


class TransformerSizingCalculator(BaseCalculator[TransformerSizingInput]):
    """
    Transformer Sizing Calculator according to IEC 60076
    
    Calculates apparent power and currents based on provided parameters.
    """
    
    CALCULATION_CODE = "TRF-001"
    CALCULATION_NAME = "Transformer Sizing"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 60076"
    STANDARD_VERSION = "2020"
    ENGINE_VERSION = "0.1.0"
    
    # Standard transformer sizes (kVA)
    STANDARD_SIZES = [5, 10, 15, 25, 30, 37.5, 50, 75, 100, 112.5, 150, 167, 
                      200, 225, 250, 300, 333, 500, 750, 1000, 1500, 2000, 2500, 
                      3000, 3750, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 
                      40000, 50000, 60000, 75000, 100000]
    
    def validate_inputs(self, inputs: TransformerSizingInput) -> bool:
        """Validate input parameters"""
        if inputs.apparent_power_kva is not None:
            ValidationEngine.validate_positive(inputs.apparent_power_kva, "apparent_power_kva")
        if inputs.voltage_primary_v is not None:
            ValidationEngine.validate_positive(inputs.voltage_primary_v, "voltage_primary_v")
        if inputs.current_primary_a is not None:
            ValidationEngine.validate_positive(inputs.current_primary_a, "current_primary_a")
        if inputs.voltage_secondary_v is not None:
            ValidationEngine.validate_positive(inputs.voltage_secondary_v, "voltage_secondary_v")
        if inputs.current_secondary_a is not None:
            ValidationEngine.validate_positive(inputs.current_secondary_a, "current_secondary_a")
        
        return True
    
    def _calculate_from_power(self, inputs: TransformerSizingInput) -> Dict:
        """Calculate currents from given power"""
        S_kva = inputs.apparent_power_kva
        
        if inputs.phase_type == 'three':
            I_primary = S_kva * 1000 / (math.sqrt(3) * inputs.voltage_primary_v) if inputs.voltage_primary_v else None
            I_secondary = S_kva * 1000 / (math.sqrt(3) * inputs.voltage_secondary_v) if inputs.voltage_secondary_v else None
        else:
            I_primary = S_kva * 1000 / inputs.voltage_primary_v if inputs.voltage_primary_v else None
            I_secondary = S_kva * 1000 / inputs.voltage_secondary_v if inputs.voltage_secondary_v else None
        
        return {
            "S_kva": S_kva,
            "S_mva": S_kva / 1000,
            "I_primary": round(I_primary, 1) if I_primary else None,
            "I_secondary": round(I_secondary, 1) if I_secondary else None,
        }
    
    def _calculate_from_primary(self, inputs: TransformerSizingInput) -> Dict:
        """Calculate power from primary voltage and current"""
        if inputs.phase_type == 'three':
            S_kva = math.sqrt(3) * inputs.voltage_primary_v * inputs.current_primary_a / 1000
        else:
            S_kva = inputs.voltage_primary_v * inputs.current_primary_a / 1000
        
        return self._calculate_from_power(
            TransformerSizingInput(
                apparent_power_kva=S_kva,
                voltage_secondary_v=inputs.voltage_secondary_v,
                phase_type=inputs.phase_type,
            )
        )
    
    def _calculate_from_secondary(self, inputs: TransformerSizingInput) -> Dict:
        """Calculate power from secondary voltage and current"""
        if inputs.phase_type == 'three':
            S_kva = math.sqrt(3) * inputs.voltage_secondary_v * inputs.current_secondary_a / 1000
        else:
            S_kva = inputs.voltage_secondary_v * inputs.current_secondary_a / 1000
        
        return self._calculate_from_power(
            TransformerSizingInput(
                apparent_power_kva=S_kva,
                voltage_primary_v=inputs.voltage_primary_v,
                phase_type=inputs.phase_type,
            )
        )
    
    def _get_standard_size(self, S_kva: float) -> float:
        """Get the next standard transformer size"""
        for size in self.STANDARD_SIZES:
            if size >= S_kva:
                return size
        return self.STANDARD_SIZES[-1]
    
    def _calculate(self, inputs: TransformerSizingInput) -> Dict:
        """Calculate transformer sizing"""
        if inputs.apparent_power_kva is not None:
            result = self._calculate_from_power(inputs)
        elif inputs.voltage_primary_v is not None and inputs.current_primary_a is not None:
            result = self._calculate_from_primary(inputs)
        elif inputs.voltage_secondary_v is not None and inputs.current_secondary_a is not None:
            result = self._calculate_from_secondary(inputs)
        else:
            raise ValueError("Insufficient parameters provided")
        
        S_kva = result["S_kva"]
        
        return {
            "apparent_power_kva": round(S_kva, 1),
            "apparent_power_mva": round(S_kva / 1000, 3),
            "current_primary_a": result["I_primary"] if result["I_primary"] else 0,
            "current_secondary_a": result["I_secondary"] if result["I_secondary"] else 0,
            "recommended_standard_size_kva": self._get_standard_size(S_kva),
        }
    
    def get_units(self) -> Dict[str, str]:
        return {
            "apparent_power_kva": "kVA",
            "apparent_power_mva": "MVA",
            "current_primary_a": "A",
            "current_secondary_a": "A",
            "voltage_primary_v": "V",
            "voltage_secondary_v": "V",
        }
