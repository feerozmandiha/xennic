"""
CABLE-002: Voltage Drop Calculator

Based on IEC 60364-5-52
Formula for voltage drop:

Single-phase: ΔV = 2 × I × L × (R × cosφ + X × sinφ)
Three-phase:  ΔV = √3 × I × L × (R × cosφ + X × sinφ)

Where:
- ΔV: Voltage drop (Volts)
- I: Load current (Amperes)
- L: Cable length (kilometers)
- R: Conductor resistance (Ω/km)
- X: Conductor reactance (Ω/km)
- cosφ: Power factor
- sinφ: √(1 - cos²φ)

Note: Lower power factor (cosφ) = higher sinφ = higher voltage drop
"""

import math
from typing import Dict
from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from src.data.tables.iec_60364_ampacity import (
    CONDUCTOR_RESISTANCE,
    CONDUCTOR_REACTANCE,
)
from .schemas import VoltageDropInput, VoltageDropOutput


class VoltageDropCalculator(BaseCalculator[VoltageDropInput]):
    """
    Voltage Drop Calculator according to IEC 60364-5-52
    """
    
    CALCULATION_CODE = "CABLE-002"
    CALCULATION_NAME = "Voltage Drop Calculator"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 60364-5-52"
    STANDARD_VERSION = "2009"
    ENGINE_VERSION = "0.1.0"
    
    ALLOWABLE_DROP_PERCENT = 5.0
    
    def validate_inputs(self, inputs: VoltageDropInput) -> bool:
        """Validate input parameters"""
        ValidationEngine.validate_positive(inputs.voltage_v, "voltage_v")
        ValidationEngine.validate_positive(inputs.current_a, "current_a")
        ValidationEngine.validate_positive(inputs.cable_length_m, "cable_length_m")
        ValidationEngine.validate_positive(inputs.cable_size_mm2, "cable_size_mm2")
        ValidationEngine.validate_physical_range(inputs.power_factor, 0, 1, "power_factor")
        
        return True
    
    def _get_resistance(self, inputs: VoltageDropInput) -> float:
        """Get conductor resistance (Ω/km)"""
        size = inputs.cable_size_mm2
        material = inputs.conductor_material
        
        resistance_table = CONDUCTOR_RESISTANCE.get(material, {})
        
        if size in resistance_table:
            return resistance_table[size]
        
        available_sizes = sorted(resistance_table.keys())
        for avail_size in available_sizes:
            if avail_size >= size:
                return resistance_table[avail_size]
        return resistance_table[available_sizes[-1]]
    
    def _get_reactance(self, inputs: VoltageDropInput) -> float:
        """Get conductor reactance (Ω/km)"""
        size = inputs.cable_size_mm2
        
        if size in CONDUCTOR_REACTANCE:
            return CONDUCTOR_REACTANCE[size]
        
        available_sizes = sorted(CONDUCTOR_REACTANCE.keys())
        for avail_size in available_sizes:
            if avail_size >= size:
                return CONDUCTOR_REACTANCE[avail_size]
        return CONDUCTOR_REACTANCE[available_sizes[-1]]
    
    def _calculate_voltage_drop(self, inputs: VoltageDropInput) -> Dict[str, float]:
        """Calculate voltage drop using IEC formula"""
        L = inputs.cable_length_m / 1000.0
        R = self._get_resistance(inputs)
        X = self._get_reactance(inputs)
        
        cosφ = inputs.power_factor
        sinφ = math.sqrt(1 - cosφ**2)
        
        voltage_drop_per_km = R * cosφ + X * sinφ
        
        if inputs.phase_type == 'single':
            voltage_drop_v = 2 * inputs.current_a * L * voltage_drop_per_km
        else:
            voltage_drop_v = math.sqrt(3) * inputs.current_a * L * voltage_drop_per_km
        
        voltage_drop_percent = (voltage_drop_v / inputs.voltage_v) * 100
        
        return {
            "voltage_drop_v": round(voltage_drop_v, 2),
            "voltage_drop_percent": round(voltage_drop_percent, 2),
        }
    
    def _get_recommendation(self, voltage_drop_percent: float) -> str:
        """Generate recommendation based on voltage drop percentage"""
        if voltage_drop_percent <= 5.0:
            return f"Voltage drop is within acceptable limits (≤5%). Current drop: {voltage_drop_percent}%"
        elif voltage_drop_percent <= 8.0:
            return f"Voltage drop ({voltage_drop_percent}%) exceeds 5% limit for lighting. Consider increasing cable size or reducing load."
        else:
            return f"Voltage drop ({voltage_drop_percent}%) exceeds standard limits. Increase cable size, reduce cable length, or reduce load current."
    
    def _calculate(self, inputs: VoltageDropInput) -> Dict:
        """Calculate voltage drop and provide recommendation"""
        results = self._calculate_voltage_drop(inputs)
        
        voltage_drop_percent = results["voltage_drop_percent"]
        is_acceptable = voltage_drop_percent <= self.ALLOWABLE_DROP_PERCENT
        recommendation = self._get_recommendation(voltage_drop_percent)
        
        return {
            "voltage_drop_v": results["voltage_drop_v"],
            "voltage_drop_percent": results["voltage_drop_percent"],
            "is_acceptable": is_acceptable,
            "recommendation": recommendation,
        }
    
    def get_units(self) -> Dict[str, str]:
        return {
            "voltage_v": "V",
            "current_a": "A",
            "cable_length_m": "m",
            "cable_size_mm2": "mm²",
            "conductor_material": "copper/aluminum",
            "power_factor": "unitless",
            "phase_type": "single/three",
            "voltage_drop_v": "V",
            "voltage_drop_percent": "%",
        }
