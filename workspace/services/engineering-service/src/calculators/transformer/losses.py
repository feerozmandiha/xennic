"""
TRF-002: Transformer Losses Calculator

Based on IEC 60076
Formulas:
- Total Losses = No-Load Loss + (Load Factor)² × Load Loss
- Efficiency = (Output Power) / (Output Power + Total Losses) × 100%
- Annual Energy Loss = Total Losses × Operating Hours / 1000 (kWh)
"""

from typing import Dict
from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import TransformerLossesInput, TransformerLossesOutput


class TransformerLossesCalculator(BaseCalculator[TransformerLossesInput]):
    """
    Transformer Losses Calculator according to IEC 60076
    
    Calculates total losses, efficiency, and annual energy cost.
    """
    
    CALCULATION_CODE = "TRF-002"
    CALCULATION_NAME = "Transformer Losses"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 60076"
    STANDARD_VERSION = "2020"
    ENGINE_VERSION = "0.1.0"
    
    def validate_inputs(self, inputs: TransformerLossesInput) -> bool:
        """Validate input parameters"""
        ValidationEngine.validate_non_negative(inputs.no_load_loss_w, "no_load_loss_w")
        ValidationEngine.validate_non_negative(inputs.load_loss_w, "load_loss_w")
        ValidationEngine.validate_physical_range(inputs.load_factor, 0, 1.5, "load_factor")
        ValidationEngine.validate_non_negative(inputs.operating_hours_per_year, "operating_hours_per_year")
        ValidationEngine.validate_positive(inputs.energy_cost_per_kwh, "energy_cost_per_kwh")
        
        return True
    
    def _calculate(self, inputs: TransformerLossesInput) -> Dict:
        """Calculate transformer losses and efficiency"""
        # Total losses at current load
        load_loss_actual = inputs.load_loss_w * (inputs.load_factor ** 2)
        total_losses_w = inputs.no_load_loss_w + load_loss_actual
        total_losses_kw = total_losses_w / 1000
        
        # Rated output power (assume rated power factor of 0.8 for estimation)
        rated_output_kw = None
        if hasattr(inputs, 'rated_power_kva') and inputs.rated_power_kva:
            rated_output_kw = inputs.rated_power_kva * 0.8
            output_power_kw = rated_output_kw * inputs.load_factor
            efficiency_pct = (output_power_kw / (output_power_kw + total_losses_kw)) * 100 if output_power_kw > 0 else 0
        else:
            # Estimate efficiency based on typical values
            # For 1000kVA transformer, typical efficiency is 98-99%
            if total_losses_kw > 0:
                # Rough estimate: assume rated output = total_losses_w * 50
                estimated_output_kw = total_losses_kw * 50
                efficiency_pct = (estimated_output_kw / (estimated_output_kw + total_losses_kw)) * 100
            else:
                efficiency_pct = 100.0
        
        # Annual energy loss
        annual_energy_loss_kwh = total_losses_kw * inputs.operating_hours_per_year
        annual_cost_usd = annual_energy_loss_kwh * inputs.energy_cost_per_kwh
        
        return {
            "total_losses_w": round(total_losses_w, 1),
            "total_losses_kw": round(total_losses_kw, 3),
            "no_load_loss_w": round(inputs.no_load_loss_w, 1),
            "load_loss_at_rated_w": round(inputs.load_loss_w, 1),
            "load_loss_at_current_w": round(load_loss_actual, 1),
            "annual_energy_loss_kwh": round(annual_energy_loss_kwh, 0),
            "annual_cost_usd": round(annual_cost_usd, 2),
            "efficiency_percent": round(efficiency_pct, 2),
        }
    
    def get_units(self) -> Dict[str, str]:
        return {
            "no_load_loss_w": "W",
            "load_loss_w": "W",
            "load_factor": "pu",
            "operating_hours_per_year": "h",
            "energy_cost_per_kwh": "USD/kWh",
            "total_losses_w": "W",
            "total_losses_kw": "kW",
            "annual_energy_loss_kwh": "kWh",
            "annual_cost_usd": "USD",
            "efficiency_percent": "%",
        }
