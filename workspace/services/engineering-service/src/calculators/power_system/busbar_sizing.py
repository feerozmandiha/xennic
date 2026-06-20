"""
PS-004: Busbar Sizing (IEC 61439-1 / IEEE C37.23)

Thermal and electrodynamic sizing of switchgear busbars
based on IEC 61439-1 power loss verification method.

Based on:
- IEC 61439-1: Low-voltage switchgear and controlgear assemblies
- IEEE C37.23: Metal-enclosed bus
"""

import math
from typing import Dict

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from src.schemas.power_system import (
    BusbarDimensions,
    BusbarSizingInput,
    BusbarSizingOutput,
    ElectrodynamicForce,
    ThermalRating,
)


class BusbarSizingCalculator(BaseCalculator[BusbarSizingInput]):
    CALCULATION_CODE = "PS-004"
    CALCULATION_NAME = "Busbar Sizing (IEC 61439-1)"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 61439-1"
    STANDARD_VERSION = "2020"
    ENGINE_VERSION = "0.1.0"

    # Copper resistivity at 20°C (Ω·m)
    RHO_CU_20 = 1.724e-8
    # Aluminum resistivity at 20°C (Ω·m)
    RHO_AL_20 = 2.650e-8

    # Temperature coefficient of resistance (1/K)
    ALPHA_CU = 0.00393
    ALPHA_AL = 0.00403

    # Specific heat capacity (J/(kg·K))
    SPECIFIC_HEAT_CU = 385
    SPECIFIC_HEAT_AL = 897

    # Density (kg/m³)
    DENSITY_CU = 8960
    DENSITY_AL = 2700

    def validate_inputs(self, inputs: BusbarSizingInput) -> bool:
        ValidationEngine.validate_positive(inputs.rated_current_a, "rated_current_a")
        ValidationEngine.validate_positive(inputs.short_circuit_current_ka * 1000, "short_circuit_current")
        ValidationEngine.validate_positive(inputs.duration_s, "duration_s")
        ValidationEngine.validate_physical_range(inputs.duration_s, 0.01, 5.0, "duration_s")
        ValidationEngine.validate_in_enum(inputs.material, ["copper", "aluminum"], "material")
        return True

    def get_units(self) -> Dict[str, str]:
        return {
            "cross_section_mm2": "mm²",
            "width_mm": "mm",
            "thickness_mm": "mm",
            "thermal_current_a": "A",
            "temp_rise_k": "K",
            "adiabatic_current_ka": "kA",
            "peak_force_n": "N",
            "bending_moment_nm": "N·m",
            "bending_stress_mpa": "MPa",
        }

    def _calculate(self, inputs: BusbarSizingInput) -> Dict:  # noqa: C901
        warnings: list[str] = []
        recommendations: list[str] = []

        ip_ka = inputs.short_circuit_current_ka * inputs.peak_factor
        ip_a = ip_ka * 1000

        if inputs.material == "copper":
            rho_20 = self.RHO_CU_20
            alpha = self.ALPHA_CU
        else:
            rho_20 = self.RHO_AL_20
            alpha = self.ALPHA_AL

        if inputs.busbar:
            b = inputs.busbar.width_mm / 1000
            h = inputs.busbar.thickness_mm / 1000
            cross_section_m2 = b * h
            cross_section_mm2 = inputs.busbar.width_mm * inputs.busbar.thickness_mm
            surface_area_per_m = 2 * (b + h)
            width = inputs.busbar.width_mm
            thickness = inputs.busbar.thickness_mm
        else:
            # Derive required cross-section from rated current (≈ 2 A/mm² for Cu, 1.2 for Al)
            if inputs.material == "copper":
                current_density = 2.0
            else:
                current_density = 1.2
            cross_section_mm2 = inputs.rated_current_a / current_density
            thickness = 10
            width = cross_section_mm2 / thickness
            b = width / 1000
            h = thickness / 1000
            cross_section_m2 = cross_section_mm2 * 1e-6
            surface_area_per_m = 2 * (b + h)

        # --- Thermal rating (IEC 61439-1, §9.2.1 power loss method) ---
        temp_rise_k = 65
        temp_op = 40 + temp_rise_k
        rho_op = rho_20 * (1 + alpha * (temp_op - 20))
        r_per_m = rho_op / cross_section_m2

        p_loss_w = inputs.rated_current_a ** 2 * r_per_m

        heat_transfer_coeff = 12
        surface_temp_rise = p_loss_w / (surface_area_per_m * heat_transfer_coeff) if surface_area_per_m > 0 else 0

        if surface_temp_rise > 105:
            warnings.append(
                f"High temperature rise ({surface_temp_rise:.0f}K) — "
                "consider larger cross-section or forced cooling"
            )

        thermal_rating = ThermalRating(
            temp_rise_k=round(surface_temp_rise, 1),
            p_loss_w=round(p_loss_w, 1),
            surface_area_per_m=round(surface_area_per_m * 1000, 1),
            current_capacity_a=round(inputs.rated_current_a * math.sqrt(65 / surface_temp_rise), 0) if surface_temp_rise > 0 else inputs.rated_current_a,
        )

        # --- Adiabatic withstand (short-circuit) ---
        if inputs.material == "copper":
            k_adiabatic = 226  # A·√s / mm² for Cu (IEC 61439-1 Table 6)
        else:
            k_adiabatic = 148

        adiabatic_current_a = k_adiabatic * cross_section_mm2 / math.sqrt(inputs.duration_s)
        adiabatic_current_ka = adiabatic_current_a / 1000

        if inputs.short_circuit_current_ka > adiabatic_current_ka:
            warnings.append(
                f"SC current ({inputs.short_circuit_current_ka:.1f} kA) exceeds "
                f"adiabatic withstand ({adiabatic_current_ka:.1f} kA) — "
                "increase cross-section or reduce clearing time"
            )

        if adiabatic_current_ka > 2 * inputs.short_circuit_current_ka:
            recommendations.append("Cross-section larger than required — consider material optimization")

        # --- Electrodynamic force (peak) ---
        spacing_m = inputs.phase_spacing_mm / 1000
        if spacing_m <= 0:
            spacing_m = 0.1

        # Force between parallel conductors (IEC 60865)
        if inputs.arrangement == "flat":
            eff_spacing = spacing_m
        else:
            eff_spacing = spacing_m

        mu_0 = 4 * math.pi * 1e-7
        force_per_m = (mu_0 / (2 * math.pi)) * (ip_a ** 2) / eff_spacing

        # Factor for arrangement
        force_total_n = force_per_m * inputs.span_length_mm / 1000

        # Bending moment (simply supported beam)
        L = inputs.span_length_mm / 1000
        if inputs.support_type == "simply_supported":
            bending_moment_nm = force_total_n * L / 8
        elif inputs.support_type == "fixed":
            bending_moment_nm = force_total_n * L / 12
        else:
            bending_moment_nm = force_total_n * L / 8

        # Section modulus
        section_modulus = (width * thickness ** 2) / 6  # mm³ -> mm³
        bending_stress_mpa = (bending_moment_nm * 1000) / (section_modulus / 1e9) / 1e6

        if inputs.material == "copper":
            yield_strength_mpa = 200
        else:
            yield_strength_mpa = 100

        if bending_stress_mpa > yield_strength_mpa:
            warnings.append(
                f"Bending stress ({bending_stress_mpa:.1f} MPa) exceeds "
                f"yield strength ({yield_strength_mpa} MPa) — "
                "reduce span or increase cross-section"
            )

        electrodynamic = ElectrodynamicForce(
            peak_force_n=round(force_total_n, 1),
            bending_moment_nm=round(bending_moment_nm, 3),
            bending_stress_mpa=round(bending_stress_mpa, 2),
            yield_strength_mpa=yield_strength_mpa,
            stress_ok=bending_stress_mpa <= yield_strength_mpa,
        )

        busbar = BusbarDimensions(
            width_mm=round(width, 1),
            thickness_mm=round(thickness, 1),
            cross_section_mm2=round(cross_section_mm2, 1),
        )

        if electrodynamic.stress_ok and adiabatic_current_ka > inputs.short_circuit_current_ka:
            status = "OK"
        elif not electrodynamic.stress_ok:
            status = "FAIL_MECHANICAL"
            recommendations.append("Increase busbar cross-section or reduce span between supports")
        elif adiabatic_current_ka <= inputs.short_circuit_current_ka:
            status = "FAIL_THERMAL"
            recommendations.append("Increase cross-section or reduce fault clearing time")

        return BusbarSizingOutput(
            busbar=busbar,
            thermal_rating=thermal_rating,
            electrodynamic_force=electrodynamic,
            adiabatic_withstand_ka=round(adiabatic_current_ka, 2),
            bending_stress_ok=electrodynamic.stress_ok,
            status=status,
            warnings=warnings,
            recommendations=recommendations,
        ).model_dump()
