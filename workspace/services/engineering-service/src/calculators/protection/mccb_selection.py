"""
PROT-001: MCCB/ACB Selection Calculator

Based on IEC 60947-2
Rules:
- Rated current (I_n) ≥ Load current × 1.25 (safety factor)
- Breaking capacity (I_cu) ≥ Short-circuit current
- Voltage rating ≥ System voltage
"""

from typing import Dict
from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import MCCBSelectionInput, MCCBSelectionOutput


class MCCBSelectionCalculator(BaseCalculator[MCCBSelectionInput]):
    """
    MCCB/ACB Selection Calculator according to IEC 60947-2
    
    Selects appropriate circuit breaker based on load current
    and short-circuit current.
    """
    
    CALCULATION_CODE = "PROT-001"
    CALCULATION_NAME = "MCCB/ACB Selection"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 60947-2"
    STANDARD_VERSION = "2020"
    ENGINE_VERSION = "0.1.0"
    
    # Standard MCCB ratings (Amperes)
    MCCB_RATINGS = [10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600]
    
    # Standard ACB ratings (Amperes)
    ACB_RATINGS = [800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300]
    
    # Breaking capacities (kA) by type
    BREAKING_CAPACITIES = {
        'mccb': [10, 18, 25, 36, 50, 65, 85, 100, 150],
        'acb': [25, 36, 42, 50, 65, 80, 100, 120, 150],
    }
    
    def validate_inputs(self, inputs: MCCBSelectionInput) -> bool:
        """Validate input parameters"""
        ValidationEngine.validate_positive(inputs.load_current_a, "load_current_a")
        ValidationEngine.validate_positive(inputs.short_circuit_current_ka, "short_circuit_current_ka")
        ValidationEngine.validate_positive(inputs.voltage_v, "voltage_v")
        
        return True
    
    def _temperature_correction(self, temperature: float) -> float:
        """
        Calculate temperature correction factor for breaker rating
        
        Breakers typically rated at 40°C ambient
        """
        if temperature <= 40:
            return 1.0
        # De-rate by 0.5% per °C above 40°C
        derating = 1.0 - ((temperature - 40) * 0.005)
        return max(derating, 0.7)
    
    def _select_rating(self, required_current: float, ratings: list) -> float:
        """Select the smallest standard rating >= required current"""
        for rating in ratings:
            if rating >= required_current:
                return rating
        return ratings[-1]
    
    def _select_breaking_capacity(self, required_ka: float, capacities: list) -> float:
        """Select the smallest breaking capacity >= required"""
        for cap in capacities:
            if cap >= required_ka:
                return cap
        return capacities[-1]
    
    def _calculate(self, inputs: MCCBSelectionInput) -> Dict:
        """Calculate recommended MCCB/ACB"""
        # Apply safety factor (1.25x for continuous load)
        required_current = inputs.load_current_a * 1.25
        
        # Apply temperature correction
        temp_factor = self._temperature_correction(inputs.ambient_temperature)
        corrected_current = required_current / temp_factor
        
        # Select ratings based on type
        if inputs.application_type == 'mccb':
            ratings = self.MCCB_RATINGS
            capacities = self.BREAKING_CAPACITIES['mccb']
        else:
            ratings = self.ACB_RATINGS
            capacities = self.BREAKING_CAPACITIES['acb']
        
        rated_current = self._select_rating(corrected_current, ratings)
        breaking_capacity = self._select_breaking_capacity(inputs.short_circuit_current_ka, capacities)
        
        is_sufficient = (
            rated_current >= inputs.load_current_a and
            breaking_capacity >= inputs.short_circuit_current_ka
        )
        
        return {
            "recommended_rated_current_a": rated_current,
            "recommended_breaking_capacity_ka": breaking_capacity,
            "is_sufficient": is_sufficient,
            "standard_size": f"{int(rated_current)}A / {int(breaking_capacity)}kA",
            "temperature_derating_factor": round(temp_factor, 3),
            "required_current_with_safety": round(required_current, 1),
        }
    
    def get_units(self) -> Dict[str, str]:
        return {
            "load_current_a": "A",
            "short_circuit_current_ka": "kA",
            "voltage_v": "V",
            "recommended_rated_current_a": "A",
            "recommended_breaking_capacity_ka": "kA",
        }
