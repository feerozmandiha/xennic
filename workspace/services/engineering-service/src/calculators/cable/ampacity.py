"""
CABLE-001: Cable Ampacity Calculator

Based on IEC 60364-5-52
Calculates the current-carrying capacity of cables considering:
- Installation method (B2: conduit, C: on wall/free air)
- Conductor material (copper, aluminum)
- Insulation type (PVC, XLPE)
- Ambient temperature correction
- Grouping correction (multiple circuits)

Formula: I_corrected = I_base × k1 × k2
where:
- I_base: Base ampacity from tables (30°C for PVC, 40°C for XLPE)
- k1: Temperature correction factor (Table B.52.7)
- k2: Grouping correction factor (Table B.52.8)
"""

from typing import Dict, List, Optional
from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from src.core.exceptions import ValidationError
from src.data.tables.iec_60364_ampacity import (
    CABLE_SIZES,
    get_ampacity_table,
    TEMPERATURE_CORRECTION_FACTORS,
    GROUPING_CORRECTION_FACTORS,
    find_minimum_cable_size,
)
from .schemas import CableSizingInput, CableSizingOutput


class CableAmpacityCalculator(BaseCalculator[CableSizingInput]):
    """
    Cable Ampacity Calculator according to IEC 60364-5-52
    
    Determines the minimum cable size required for a given load current,
    considering installation conditions and correction factors.
    """
    
    CALCULATION_CODE = "CABLE-001"
    CALCULATION_NAME = "Cable Ampacity Sizing"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 60364-5-52"
    STANDARD_VERSION = "2009"
    ENGINE_VERSION = "0.1.0"
    
    def validate_inputs(self, inputs: CableSizingInput) -> bool:
        """Validate input parameters"""
        # Load current validation
        ValidationEngine.validate_positive(inputs.load_current, "load_current")
        ValidationEngine.validate_physical_range(
            inputs.load_current, 0, 2000, "load_current"
        )
        
        # Ambient temperature validation
        ValidationEngine.validate_physical_range(
            inputs.ambient_temperature, -20, 80, "ambient_temperature"
        )
        
        # Number of circuits validation
        ValidationEngine.validate_physical_range(
            inputs.number_of_circuits, 1, 10, "number_of_circuits"
        )
        
        return True
    
    def _get_temperature_correction_factor(self, inputs: CableSizingInput) -> float:
        """
        Get temperature correction factor (k1) from Table B.52.7
        
        Args:
            inputs: Cable sizing input parameters
            
        Returns:
            Temperature correction factor
        """
        temp_table = TEMPERATURE_CORRECTION_FACTORS.get(inputs.insulation_type, {})
        
        # Find closest temperature in table
        available_temps = sorted(temp_table.keys())
        closest_temp = min(available_temps, key=lambda x: abs(x - inputs.ambient_temperature))
        
        return temp_table.get(closest_temp, 1.0)
    
    def _get_grouping_correction_factor(self, inputs: CableSizingInput) -> float:
        """
        Get grouping correction factor (k2) from Table B.52.8
        
        Args:
            inputs: Cable sizing input parameters
            
        Returns:
            Grouping correction factor
        """
        circuits = inputs.number_of_circuits
        
        if circuits in GROUPING_CORRECTION_FACTORS:
            return GROUPING_CORRECTION_FACTORS[circuits]
        elif circuits > 10:
            return 0.48  # Factor for 10+ circuits
        else:
            return 1.0
    
    def _calculate(self, inputs: CableSizingInput) -> Dict:
        """
        Calculate minimum cable size based on ampacity
        
        Returns:
            Dictionary with calculation results
        """
        # Step 1: Get base ampacity table
        ampacity_table = get_ampacity_table(
            inputs.conductor_material,
            inputs.insulation_type,
            inputs.installation_method,
        )
        
        if not ampacity_table:
            raise ValidationError(
                "cable_configuration",
                f"{inputs.conductor_material}/{inputs.insulation_type}/{inputs.installation_method}",
                "No ampacity table available for this configuration"
            )
        
        # Step 2: Get correction factors
        k1 = self._get_temperature_correction_factor(inputs)
        k2 = self._get_grouping_correction_factor(inputs)
        
        # Step 3: Calculate required ampacity after corrections
        required_ampacity = inputs.load_current / (k1 * k2)
        
        # Step 4: Find minimum cable size
        base_size = find_minimum_cable_size(required_ampacity, ampacity_table)
        base_ampacity = ampacity_table.get(base_size, 0)
        
        # Step 5: Calculate corrected ampacity
        corrected_ampacity = base_ampacity * k1 * k2
        
        # Step 6: Calculate safety margin
        safety_margin = ((corrected_ampacity - inputs.load_current) / inputs.load_current) * 100
        
        # Step 7: Determine recommended size (one size larger if margin < 20%)
        recommended_size = base_size
        if safety_margin < 20:
            size_index = CABLE_SIZES.index(base_size) if base_size in CABLE_SIZES else -1
            if size_index + 1 < len(CABLE_SIZES):
                recommended_size = CABLE_SIZES[size_index + 1]
        
        return {
            "minimum_cable_size": float(base_size),
            "recommended_cable_size": float(recommended_size),
            "base_ampacity": round(base_ampacity, 1),
            "corrected_ampacity": round(corrected_ampacity, 1),
            "temperature_correction_factor": round(k1, 3),
            "grouping_correction_factor": round(k2, 3),
            "safety_margin": round(safety_margin, 1),
        }
    
    def get_units(self) -> Dict[str, str]:
        """Return units for all inputs and outputs"""
        return {
            "load_current": "A",
            "ambient_temperature": "°C",
            "minimum_cable_size": "mm²",
            "recommended_cable_size": "mm²",
            "base_ampacity": "A",
            "corrected_ampacity": "A",
            "temperature_correction_factor": "unitless",
            "grouping_correction_factor": "unitless",
            "safety_margin": "%",
        }
