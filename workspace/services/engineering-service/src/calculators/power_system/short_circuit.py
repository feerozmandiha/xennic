"""
PS-002: Short Circuit Analysis (IEC 60909)

Calculates three-phase and single-phase short-circuit currents
using the equivalent impedance method per IEC 60909.

Based on:
- IEC 60909-0: Short-circuit currents in three-phase AC systems
- IEC 60909-1: Factors for the calculation of short-circuit currents
"""

import math
from typing import Dict

from pandapower.shortcircuit import calc_sc

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from src.schemas.power_system import (
    ShortCircuitInput,
    SourceContribution,
)

from .network_builder import NetworkBuilder


class ShortCircuitCalculator(BaseCalculator[ShortCircuitInput]):
    CALCULATION_CODE = "PS-002"
    CALCULATION_NAME = "Short Circuit Analysis"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 60909-0"
    STANDARD_VERSION = "2016"
    ENGINE_VERSION = "0.1.0"

    def validate_inputs(self, inputs: ShortCircuitInput) -> bool:
        ValidationEngine.validate_positive(inputs.voltage_factor_c, "voltage_factor_c")
        bus_names = {b.name for b in inputs.network.buses}
        ValidationEngine.validate_in_enum(inputs.fault_bus, list(bus_names), "fault_bus")
        return True

    def get_units(self) -> Dict[str, str]:
        return {
            "ik_initial_ka": "kA",
            "ik_steady_ka": "kA",
            "ip_peak_ka": "kA",
            "kappa": "",
            "x_r_ratio": "",
            "motor_contribution_ka": "kA",
        }

    def _calculate(self, inputs: ShortCircuitInput) -> Dict:  # noqa: C901
        warnings: list[str] = []

        net = NetworkBuilder.create_network(inputs.network)

        bus_map = {net.bus.at[i, 'name']: i for i in net.bus.index}
        fault_bus_idx = bus_map[inputs.fault_bus]

        fault_type_map = {
            "three_phase": "3ph",
            "single_phase_to_ground": "1ph",
        }
        pp_fault_type = fault_type_map.get(inputs.fault_type, "3ph")

        calc_sc(
            net,
            fault_bus_idx,
            fault=pp_fault_type,
            case='max',
            ip=inputs.calculate_peak,
            branch_results=True,
        )

        sc_results = net.res_bus_sc
        if fault_bus_idx not in sc_results.index:
            raise ValueError(f"No short-circuit results for bus {inputs.fault_bus}")

        row = sc_results.loc[fault_bus_idx]

        ik_initial_ka = float(row.get('ikss_ka', 0))
        ip_peak_ka = float(row.get('ip_ka', 0)) if inputs.calculate_peak and 'ip_ka' in sc_results.columns else 0

        r_eq = float(row.get('rk_ohm', 0))
        x_eq = float(row.get('xk_ohm', 0))
        x_r_ratio = (x_eq / r_eq) if r_eq and r_eq > 0 else 0

        if x_r_ratio > 0:
            kappa = 1.02 + 0.98 * math.exp(-3 * x_r_ratio)
        else:
            kappa = 1.0

        ik_steady_ka = ik_initial_ka
        if x_r_ratio > 3:
            decay_factor = 1.0 - 0.03 * (x_r_ratio / (1 + x_r_ratio))
            ik_steady_ka = ik_initial_ka * decay_factor

        contributions: list[SourceContribution] = []
        motor_contribution_ka = 0

        try:
            if 'sgen' in net and len(net.sgen) > 0 and 'res_sgen_sc' in net:
                sgen_sc = net.res_sgen_sc
                for sgen_idx in sgen_sc.index:
                    contrib = float(sgen_sc.at[sgen_idx, 'ikss_ka'])
                    if contrib > 0:
                        sgen_name = net.sgen.at[sgen_idx, 'name'] if 'name' in net.sgen.columns else f"sgen_{sgen_idx}"
                        pct = (contrib / ik_initial_ka * 100) if ik_initial_ka > 0 else 0
                        contributions.append(SourceContribution(
                            source_name=sgen_name,
                            contribution_ka=round(contrib, 3),
                            contribution_percent=round(pct, 1),
                        ))
                        motor_contribution_ka += contrib

            if 'motor' in net and len(net.motor) > 0 and 'res_motor_sc' in net:
                motor_sc = net.res_motor_sc
                for m_idx in motor_sc.index:
                    contrib = float(motor_sc.at[m_idx, 'ikss_ka'])
                    if contrib > 0:
                        m_name = net.motor.at[m_idx, 'name'] if 'name' in net.motor.columns else f"motor_{m_idx}"
                        pct = (contrib / ik_initial_ka * 100) if ik_initial_ka > 0 else 0
                        contributions.append(SourceContribution(
                            source_name=m_name,
                            contribution_ka=round(contrib, 3),
                            contribution_percent=round(pct, 1),
                        ))
                        motor_contribution_ka += contrib
        except Exception:
            pass

        if ik_initial_ka > 50:
            warnings.append(
                f"Very high SC current ({ik_initial_ka:.1f} kA) — "
                "verify equipment ratings"
            )

        x_r_message = ""
        if x_r_ratio > 15:
            x_r_message = f"High X/R ratio ({x_r_ratio:.1f}) — DC component decay is slow"
            warnings.append(x_r_message)
        elif x_r_ratio < 1:
            x_r_message = f"Low X/R ratio ({x_r_ratio:.1f}) — predominantly resistive network"
            warnings.append(x_r_message)

        if not inputs.motor_contribution and motor_contribution_ka > 0:
            ik_initial_ka -= motor_contribution_ka
            if ik_initial_ka < 0:
                ik_initial_ka = 0

        return {
            "fault_bus": inputs.fault_bus,
            "fault_type": inputs.fault_type,
            "ik_initial_ka": round(ik_initial_ka, 3),
            "ik_steady_ka": round(ik_steady_ka, 3),
            "ip_peak_ka": round(ip_peak_ka, 3),
            "kappa": round(kappa, 4),
            "x_r_ratio": round(x_r_ratio, 2),
            "motor_contribution_ka": round(motor_contribution_ka, 3),
            "contributions": [c.model_dump() for c in contributions],
            "warnings": warnings,
        }
