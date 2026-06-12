"""
CABLE-004: Protective Earth (PE) Conductor Sizing

Based on IEC 60364-5-54 Table 54.3

Rules:
- If phase conductor size ≤ 16mm²: PE size = phase size
- If 16mm² < phase size ≤ 35mm²: PE size = 16mm²
- If phase size > 35mm²: PE size = phase size / 2

For aluminum conductors, PE size follows same rules but material may differ.
"""

from typing import Dict
from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import PEConductorInput, PEConductorOutput


class PESizingCalculator(BaseCalculator[PEConductorInput]):
    """
    Protective Earth Conductor Sizing according to IEC 60364-5-54
    
    Determines the minimum cross-sectional area for protective
    earth conductors based on phase conductor size.
    """
    
    CALCULATION_CODE = "CABLE-004"
    CALCULATION_NAME = "PE Conductor Sizing"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 60364-5-54"
    STANDARD_VERSION = "2009"
    ENGINE_VERSION = "0.1.0"
    
    def validate_inputs(self, inputs: PEConductorInput) -> bool:
        """Validate input parameters"""
        ValidationEngine.validate_positive(inputs.phase_conductor_size, "phase_conductor_size")
        
        return True
    
    def _calculate_pe_size(self, inputs: PEConductorInput) -> float:
        """
        Calculate minimum PE conductor size according to IEC 60364-5-54 Table 54.3
        
        Rules:
        - S_phase ≤ 16mm²: S_pe = S_phase
        - 16mm² < S_phase ≤ 35mm²: S_pe = 16mm²
        - S_phase > 35mm²: S_pe = S_phase / 2
        """
        S_phase = inputs.phase_conductor_size
        
        if S_phase <= 16:
            return S_phase
        elif S_phase <= 35:
            return 16.0
        else:
            # Round up to standard size
            pe_size = S_phase / 2
            standard_sizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400]
            
            for size in standard_sizes:
                if size >= pe_size:
                    return size
            return standard_sizes[-1]
    
    def _calculate(self, inputs: PEConductorInput) -> Dict:
        """
        Calculate minimum PE conductor size
        
        Returns:
            Dictionary with calculation results
        """
        pe_size = self._calculate_pe_size(inputs)
        
        return {
            "minimum_pe_size": pe_size,
            "phase_conductor_size": inputs.phase_conductor_size,
            "standard_reference": "IEC 60364-5-54 Table 54.3",
            "ratio": round(pe_size / inputs.phase_conductor_size, 2) if inputs.phase_conductor_size > 0 else 0,
        }
    
    def get_units(self) -> Dict[str, str]:
        """Return units for all inputs and outputs"""
        return {
            "phase_conductor_size": "mm²",
            "conductor_material": "copper/aluminum",
            "minimum_pe_size": "mm²",
            "ratio": "unitless",
        }
