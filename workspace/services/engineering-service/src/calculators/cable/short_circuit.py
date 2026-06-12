"""
CABLE-003: Short Circuit Withstand Calculator

Based on IEC 60949: Thermal permissible short-circuit currents

Formula: S_min = √(I² × t) / k

Where:
- S_min: Minimum conductor cross-section (mm²)
- I: Short-circuit current (kA)
- t: Fault duration (seconds)
- k: Factor based on conductor material and insulation

Reference values for k (IEC 60949 Table 1):
- Copper/PVC:    k = 115  (θ_i = 70°C, θ_f = 160°C)
- Copper/XLPE:   k = 143  (θ_i = 90°C, θ_f = 250°C)
- Copper/EPR:    k = 143  (θ_i = 90°C, θ_f = 250°C)
- Aluminum/PVC:  k = 76   (θ_i = 70°C, θ_f = 160°C)
- Aluminum/XLPE: k = 94   (θ_i = 90°C, θ_f = 250°C)
- Aluminum/EPR:  k = 94   (θ_i = 90°C, θ_f = 250°C)
"""

import math
from typing import Dict
from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from src.data.tables.iec_60364_ampacity import SHORT_CIRCUIT_K_FACTORS
from .schemas import ShortCircuitInput, ShortCircuitOutput


class ShortCircuitWithstandCalculator(BaseCalculator[ShortCircuitInput]):
    """
    Short Circuit Withstand Calculator according to IEC 60949
    
    Calculates minimum cable size required to withstand thermal
    effects of short circuit current.
    """
    
    CALCULATION_CODE = "CABLE-003"
    CALCULATION_NAME = "Short Circuit Withstand"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 60949"
    STANDARD_VERSION = "2009"
    ENGINE_VERSION = "0.1.0"
    
    def validate_inputs(self, inputs: ShortCircuitInput) -> bool:
        """Validate input parameters"""
        ValidationEngine.validate_positive(inputs.short_circuit_current_ka, "short_circuit_current_ka")
        ValidationEngine.validate_positive(inputs.fault_duration_s, "fault_duration_s")
        
        return True
    
    def _get_k_factor(self, inputs: ShortCircuitInput) -> float:
        """
        Get the k-factor from IEC 60949 Table 1
        
        Args:
            inputs: Short circuit input parameters
            
        Returns:
            k-factor value
        """
        material = inputs.conductor_material
        insulation = inputs.insulation_type
        
        k_table = SHORT_CIRCUIT_K_FACTORS.get(material, {})
        return k_table.get(insulation, 115.0)  # Default to copper/PVC if not found
    
    def _calculate_minimum_size(self, inputs: ShortCircuitInput) -> float:
        """
        Calculate minimum cable size for short circuit withstand
        
        Formula: S_min = √(I² × t) / k
        
        Where:
        - I in Amperes (convert from kA)
        - t in seconds
        - k factor
        """
        # Convert kA to Amperes
        I = inputs.short_circuit_current_ka * 1000.0
        t = inputs.fault_duration_s
        k = self._get_k_factor(inputs)
        
        # Calculate I²t
        i2t = I * I * t
        
        # Calculate minimum size
        S_min = math.sqrt(i2t) / k
        
        return round(S_min, 1)
    
    def _calculate_thermal_energy(self, inputs: ShortCircuitInput) -> float:
        """
        Calculate thermal energy per mm²
        
        Formula: E = (I² × t) / S²
        """
        I = inputs.short_circuit_current_ka * 1000.0
        t = inputs.fault_duration_s
        k = self._get_k_factor(inputs)
        
        # Using formula: E = I² × t (Joules)
        # Normalized per mm² using k factor
        energy = (I * I * t) / (k * k)
        
        return round(energy, 0)
    
    def _calculate(self, inputs: ShortCircuitInput) -> Dict:
        """
        Calculate minimum cable size for short circuit withstand
        
        Returns:
            Dictionary with calculation results
        """
        min_size = self._calculate_minimum_size(inputs)
        thermal_energy = self._calculate_thermal_energy(inputs)
        
        # Round up to next standard size
        standard_sizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400]
        recommended_size = min_size
        for size in standard_sizes:
            if size >= min_size:
                recommended_size = size
                break
        
        return {
            "minimum_cable_size": min_size,
            "recommended_cable_size": recommended_size,
            "is_sufficient": True,  # This calculator just gives minimum, not comparing
            "thermal_energy_joules": thermal_energy,
            "k_factor": self._get_k_factor(inputs),
            "short_circuit_current_a": inputs.short_circuit_current_ka * 1000,
            "fault_duration_s": inputs.fault_duration_s,
        }
    
    def get_units(self) -> Dict[str, str]:
        """Return units for all inputs and outputs"""
        return {
            "short_circuit_current_ka": "kA",
            "fault_duration_s": "s",
            "conductor_material": "copper/aluminum",
            "insulation_type": "PVC/XLPE/EPR",
            "minimum_cable_size": "mm²",
            "recommended_cable_size": "mm²",
            "thermal_energy_joules": "J/mm²",
            "k_factor": "unitless",
        }
