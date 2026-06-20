"""
PS-001: Load Flow Analysis Calculator

Performs power flow analysis using pandapower.
Supports Newton-Raphson (NR) and Backward-Forward Sweep (BFSW) methods.

Based on:
- IEEE 399: Power System Analysis
- IEEE 1547: Interconnection of Distributed Resources
"""

import time
from typing import Dict

import pandapower as pp

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from src.schemas.power_system import (
    BusFlowResult,
    LineFlowResult,
    LoadFlowInput,
    TotalLosses,
    TransformerFlowResult,
)

from .network_builder import NetworkBuilder


class LoadFlowCalculator(BaseCalculator[LoadFlowInput]):
    CALCULATION_CODE = "PS-001"
    CALCULATION_NAME = "Load Flow Analysis"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEEE 399 / IEC 60909"
    STANDARD_VERSION = "2020"
    ENGINE_VERSION = "0.1.0"

    def validate_inputs(self, inputs: LoadFlowInput) -> bool:
        ValidationEngine.validate_positive(inputs.max_iteration, "max_iteration")
        ValidationEngine.validate_positive(inputs.tolerance, "tolerance")
        return True

    def get_units(self) -> Dict[str, str]:
        return {
            "v_pu": "pu",
            "angle_deg": "deg",
            "p_mw": "MW",
            "q_mvar": "MVAR",
            "loading_percent": "%",
            "total_loss_kw": "kW",
            "total_loss_kvar": "kVAR",
            "computation_time_ms": "ms",
        }

    def _calculate(self, inputs: LoadFlowInput) -> Dict:  # noqa: C901
        time_start = time.time()
        warnings: list[str] = []
        recommendations: list[str] = []

        if inputs.algorithm == "bfsw":
            warnings.append("BFSW algorithm may not converge for meshed networks; NR recommended")

        net = NetworkBuilder.create_network(inputs.network)

        network_warnings = NetworkBuilder.validate_network(net)
        warnings.extend(network_warnings)

        init = "flat" if inputs.algorithm == "nr" else "dc"
        try:
            pp.runpp(
                net,
                algorithm=inputs.algorithm,
                max_iteration=inputs.max_iteration,
                tolerance_mva=inputs.tolerance,
                calculate_voltage_angles=inputs.calculate_voltage_angles,
                enforce_q_limits=inputs.enforce_q_limits,
                init=init,
            )
            converged = True
            iterations = net.converged if hasattr(net, 'converged') else 0
        except Exception as e:
            converged = False
            iterations = 0
            warnings.append(f"Load flow did not converge: {str(e)}")

        computation_time_ms = round((time.time() - time_start) * 1000, 2)

        buses: list[BusFlowResult] = []
        has_violation = False

        for bus_idx in net.bus.index:
            bus_name = net.bus.at[bus_idx, 'name']
            min_v = net.bus.at[bus_idx, 'min_vm_pu']
            max_v = net.bus.at[bus_idx, 'max_vm_pu']

            if converged and bus_idx in net.res_bus.index:
                v_pu = net.res_bus.at[bus_idx, 'vm_pu']
                angle = net.res_bus.at[bus_idx, 'va_degree']
                p_inj = net.res_bus.at[bus_idx, 'p_mw']
                q_inj = net.res_bus.at[bus_idx, 'q_mvar']
            else:
                v_pu = 1.0
                angle = 0.0
                p_inj = 0.0
                q_inj = 0.0

            v_ok = min_v <= v_pu <= max_v
            if not v_ok:
                has_violation = True
                warnings.append(
                    f"Bus {bus_name}: voltage {v_pu:.3f} pu outside limits "
                    f"[{min_v:.3f}, {max_v:.3f}]"
                )

            buses.append(BusFlowResult(
                bus_id=bus_name,
                v_pu=round(v_pu, 4),
                angle_deg=round(angle, 2),
                v_ok=v_ok,
                p_mw=round(p_inj, 3),
                q_mvar=round(q_inj, 3),
            ))

        line_results: list[LineFlowResult] = []
        if converged and len(net.line) > 0 and len(net.res_line) > 0:
            for line_idx in net.line.index:
                line_name = net.line.at[line_idx, 'name']
                from_bus_idx = net.line.at[line_idx, 'from_bus']
                to_bus_idx = net.line.at[line_idx, 'to_bus']
                from_bus_name = net.bus.at[from_bus_idx, 'name']
                to_bus_name = net.bus.at[to_bus_idx, 'name']

                loading = net.res_line.at[line_idx, 'loading_percent']
                max_loading = net.line.at[line_idx, 'max_loading_percent']
                loading_ok = loading <= max_loading

                if not loading_ok:
                    has_violation = True
                    warnings.append(
                        f"Line {line_name}: {loading:.1f}% loaded "
                        f"(limit {max_loading}%)"
                    )

                line_results.append(LineFlowResult(
                    line_id=line_name,
                    from_bus=from_bus_name,
                    to_bus=to_bus_name,
                    loading_percent=round(loading, 2),
                    p_from_mw=round(net.res_line.at[line_idx, 'p_from_mw'], 3),
                    q_from_mvar=round(net.res_line.at[line_idx, 'q_from_mvar'], 3),
                    p_to_mw=round(net.res_line.at[line_idx, 'p_to_mw'], 3),
                    q_to_mvar=round(net.res_line.at[line_idx, 'q_to_mvar'], 3),
                    i_from_a=round(net.res_line.at[line_idx, 'i_from_ka'] * 1000, 2),
                    i_to_a=round(net.res_line.at[line_idx, 'i_to_ka'] * 1000, 2),
                    loading_ok=loading_ok,
                ))

        tf_results: list[TransformerFlowResult] = []
        if converged and len(net.trafo) > 0 and len(net.res_trafo) > 0:
            for tf_idx in net.trafo.index:
                tf_name = net.trafo.at[tf_idx, 'name']
                hv_bus_idx = net.trafo.at[tf_idx, 'hv_bus']
                lv_bus_idx = net.trafo.at[tf_idx, 'lv_bus']
                hv_bus_name = net.bus.at[hv_bus_idx, 'name']
                lv_bus_name = net.bus.at[lv_bus_idx, 'name']

                loading = net.res_trafo.at[tf_idx, 'loading_percent']
                loading_ok = loading <= 100

                if not loading_ok:
                    has_violation = True
                    warnings.append(
                        f"Transformer {tf_name}: {loading:.1f}% loaded "
                        f"(limit 100%)"
                    )

                tf_results.append(TransformerFlowResult(
                    tf_id=tf_name,
                    hv_bus=hv_bus_name,
                    lv_bus=lv_bus_name,
                    loading_percent=round(loading, 2),
                    p_hv_mw=round(net.res_trafo.at[tf_idx, 'p_hv_mw'], 3),
                    q_hv_mvar=round(net.res_trafo.at[tf_idx, 'q_hv_mvar'], 3),
                    p_lv_mw=round(net.res_trafo.at[tf_idx, 'p_lv_mw'], 3),
                    q_lv_mvar=round(net.res_trafo.at[tf_idx, 'q_lv_mvar'], 3),
                    loading_ok=loading_ok,
                ))

        if converged and len(net.res_line) > 0:
            total_p_loss = net.res_line['pl_mw'].sum() * 1000
            total_q_loss = net.res_line['ql_mvar'].sum() * 1000
            if len(net.res_trafo) > 0:
                total_p_loss += net.res_trafo['pl_mw'].sum() * 1000
                total_q_loss += net.res_trafo['ql_mvar'].sum() * 1000
        else:
            total_p_loss = 0
            total_q_loss = 0

        losses = TotalLosses(
            total_loss_kw=round(total_p_loss, 2),
            total_loss_kvar=round(total_q_loss, 2),
        )

        if has_violation:
            system_status = "VIOLATION"
        elif len(warnings) > 0:
            system_status = "WARNING"
        else:
            system_status = "OK"

        if system_status == "VIOLATION":
            recommendations.append("Review bus voltage setpoints and adjust transformer taps")
            recommendations.append("Consider adding reactive power compensation (capacitor banks)")
            recommendations.append("Check line and transformer loading — may require upgrade")
        elif system_status == "WARNING":
            recommendations.append("Monitor voltage levels and loading trends")

        if losses.total_loss_kw > 1000:
            recommendations.append(
                f"System losses are significant ({losses.total_loss_kw:.0f} kW) — "
                "consider loss reduction measures"
            )

        return {
            "converged": converged,
            "iterations": iterations,
            "computation_time_ms": computation_time_ms,
            "buses": [b.model_dump() for b in buses],
            "lines": [lr.model_dump() for lr in line_results],
            "transformers": [t.model_dump() for t in tf_results],
            "total_losses": losses.model_dump(),
            "system_status": system_status,
            "warnings": warnings,
            "recommendations": recommendations,
        }
