"""
PROT-005: Protection Coordination Study — Time-Current Curve Analysis

Performs TCC analysis for series-connected protective devices per IEC 60255-151 / IEEE C37.112.

Key formulas (IEC 60255-151):
  t(I) = TMS × K / ((I/I_pickup)^α - 1)

  Curve   |  K   |  α
  SI      | 0.14 | 0.02
  VI      | 13.5 | 1.0
  EI      | 80.0 | 2.0
  LTI     | 120  | 1.0
"""

import math
from typing import Dict, List, Any, Optional, Tuple

from src.core.base_calculator import BaseCalculator, ChartCurveData, EngineeringChart
from src.core.validation import ValidationEngine
from .schemas import ProtectionCoordinationInput, CoordinationDeviceInput


_IEEE_CURVES = {
    'SI':  (0.14,  0.02),  # Standard Inverse (IEC)
    'VI':  (13.5,  1.0),   # Very Inverse (IEC)
    'EI':  (80.0,  2.0),   # Extremely Inverse (IEC)
    'LTI': (120.0, 1.0),   # Long Time Inverse (IEC)
    'I2T': (1.0,   2.0),   # I²t (for fuses / current-limiting)
}


def _trip_time(current_a: float, pickup_a: float, curve: Tuple[float, float], tms: float) -> Optional[float]:
    """Calculate trip time in seconds per IEC 60255-151."""
    if current_a <= pickup_a:
        return None
    k, alpha = curve
    ratio = current_a / pickup_a
    try:
        return tms * k / (ratio ** alpha - 1.0)
    except (ZeroDivisionError, ValueError, OverflowError):
        return None


class ProtectionCoordinationCalculator(BaseCalculator[ProtectionCoordinationInput]):
    """
    PROT-005: Protection Coordination Study with Time-Current Curve Analysis
    """

    CALCULATION_CODE = "PROT-005"
    CALCULATION_NAME = "Protection Coordination Study"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 60255-151 / IEC 60947-2"
    STANDARD_VERSION = "2021"
    ENGINE_VERSION   = "0.1.0"

    def validate_inputs(self, inputs: ProtectionCoordinationInput) -> bool:
        ValidationEngine.validate_positive(inputs.system_voltage_v, "system_voltage_v")
        return True

    def _device_trip_time(self, device: CoordinationDeviceInput, fault_a: float) -> Optional[Dict[str, Any]]:
        """Calculate trip time considering L, S, I bands."""
        curve = _IEEE_CURVES.get(device.curve_type, _IEEE_CURVES['SI'])

        l_pickup_a = device.l_pickup_x_in * device.rated_current_a
        s_pickup_a = device.s_pickup_x_in * device.rated_current_a if device.s_pickup_x_in else None
        i_pickup_a = device.i_pickup_x_in * device.rated_current_a if device.i_pickup_x_in else None

        # Determine which band operates
        if fault_a <= l_pickup_a:
            return None  # below pickup — no trip

        # Long-time (inverse)
        lt_time_s = _trip_time(fault_a, l_pickup_a, curve, device.tms)

        # Short-time (definite or inverse)
        st_time_s: Optional[float] = None
        if s_pickup_a and fault_a >= s_pickup_a:
            if device.s_delay_s and device.s_delay_s > 0:
                st_time_s = device.s_delay_s  # definite time
            else:
                st_time_s = _trip_time(fault_a, s_pickup_a, curve, device.tms)

        # Instantaneous
        inst_time_s: Optional[float] = None
        if i_pickup_a and fault_a >= i_pickup_a:
            inst_time_s = 0.02  # 20ms typical instantaneous

        # Fastest operating time
        times = [t for t in [lt_time_s, st_time_s, inst_time_s] if t is not None]
        if not times:
            return None

        min_time_s = min(times)
        operating_band = 'instantaneous' if inst_time_s and min_time_s == inst_time_s else \
                         'short-time' if st_time_s and min_time_s == st_time_s else \
                         'long-time'

        return {
            "trip_time_s": round(min_time_s, 4),
            "trip_time_ms": round(min_time_s * 1000, 2),
            "operating_band": operating_band,
            "l_pickup_a": round(l_pickup_a, 1),
            "s_pickup_a": round(s_pickup_a, 1) if s_pickup_a else None,
            "i_pickup_a": round(i_pickup_a, 1) if i_pickup_a else None,
            "curve_type": device.curve_type,
            "tms": device.tms,
        }

    def _calculate(self, inputs: ProtectionCoordinationInput) -> Dict[str, Any]:
        up = inputs.upstream
        down = inputs.downstream
        margin_ms = inputs.selectivity_margin_ms

        selectivity_table: List[Dict[str, Any]] = []
        total_selective = True
        any_selective = False
        max_selective_a = 0.0
        limiting_device = "none"

        for fault_a in sorted(inputs.fault_currents_a):
            up_result = self._device_trip_time(up, fault_a)
            down_result = self._device_trip_time(down, fault_a)

            up_time_ms = up_result['trip_time_ms'] if up_result else None
            down_time_ms = down_result['trip_time_ms'] if down_result else None

            # Selectivity check
            selective = False
            if down_time_ms is None:
                selective = True  # downstream doesn't see fault
            elif up_time_ms is None:
                selective = False  # upstream doesn't see fault
            else:
                selective = (up_time_ms - down_time_ms) >= margin_ms

            if selective:
                any_selective = True
                if fault_a > max_selective_a:
                    max_selective_a = fault_a
            else:
                total_selective = False
                if fault_a > max_selective_a and limiting_device == "none":
                    limiting_device = f"at {fault_a:.0f}A — upstream {(up_time_ms or 0):.0f}ms vs downstream {(down_time_ms or 0):.0f}ms (margin < {margin_ms:.0f}ms)"

            if fault_a > max_selective_a and not selective:
                pass  # selectivity lost

            selectivity_table.append({
                "fault_current_a": fault_a,
                "selective": selective,
                "upstream_trip_time_ms": up_time_ms,
                "downstream_trip_time_ms": down_time_ms,
                "margin_ms": round((up_time_ms - down_time_ms), 1) if up_time_ms is not None and down_time_ms is not None else None,
                "upstream_band": up_result['operating_band'] if up_result else 'none',
                "downstream_band": down_result['operating_band'] if down_result else 'none',
            })

        if total_selective:
            overall = "total"
        elif any_selective:
            overall = "partial"
        else:
            overall = "no_selectivity"

        # Min trip times
        down_times = [r['downstream_trip_time_ms'] for r in selectivity_table if r['downstream_trip_time_ms'] is not None]
        up_times = [r['upstream_trip_time_ms'] for r in selectivity_table if r['upstream_trip_time_ms'] is not None]

        recommendations: List[str] = []
        if overall == "no_selectivity":
            recommendations.append(
                "No selectivity achieved — increase upstream TMS to at least "
                f"{down.tms * 2:.2f} or use S-delay on upstream device"
            )
        elif overall == "partial":
            recommendations.append(
                f"Partial selectivity up to {max_selective_a:.0f}A — "
                "increase upstream short-time delay or raise instantaneous pickup"
            )
        else:
            recommendations.append("Full selectivity achieved across all fault levels")

        if up.i_pickup_x_in and up.i_pickup_x_in <= (down.i_pickup_x_in or 20) * 1.5:
            recommendations.append(
                "Increase upstream instantaneous pickup (Ii) to ≥ 2× downstream Ii "
                f"(currently {up.i_pickup_x_in:.0f}×In vs {(down.i_pickup_x_in or 0):.0f}×In)"
            )

        if down.s_delay_s:
            recommendations.append(
                f"Downstream S-delay ({down.s_delay_s:.2f}s) limits arc flash energy — verify with IEEE 1584"
            )

        recommendations.append("Verify coordination at minimum fault level (L-L and L-G)")

        return {
            "selectivity_table": selectivity_table,
            "overall_selectivity": overall,
            "limiting_device": limiting_device if limiting_device != "none" else "none",
            "maximum_selectivity_current_a": max_selective_a,
            "downstream_min_trip_ms": round(min(down_times), 2) if down_times else 0.0,
            "upstream_min_trip_ms": round(min(up_times), 2) if up_times else 0.0,
            "recommendations": recommendations,
        }

    def get_charts(self, inputs: ProtectionCoordinationInput, results: Dict[str, Any]) -> list[EngineeringChart]:
        """Generate TCC curves for upstream and downstream devices."""
        up = inputs.upstream
        down = inputs.downstream
        up_curve = _IEEE_CURVES.get(up.curve_type, _IEEE_CURVES['SI'])
        down_curve = _IEEE_CURVES.get(down.curve_type, _IEEE_CURVES['SI'])

        # Log-spaced current range: 0.5 × pickup to 5 × max fault
        max_fault = max(inputs.fault_currents_a)
        up_pickup = up.l_pickup_x_in * up.rated_current_a
        down_pickup = down.l_pickup_x_in * down.rated_current_a
        min_current = min(up_pickup, down_pickup) * 0.3
        max_current = max(max_fault * 2, up_pickup * 5, down_pickup * 5)

        pts = 100
        currents: list[float] = []
        log_min = math.log10(min_current) if min_current > 0 else 0
        log_max = math.log10(max_current)
        for i in range(pts):
            currents.append(round(10 ** (log_min + (i / (pts - 1)) * (log_max - log_min)), 2))

        def curve_points(device: CoordinationDeviceInput, curve_constants: Tuple[float, float]) -> list[float]:
            pickup = device.l_pickup_x_in * device.rated_current_a
            k, alpha = curve_constants
            times: list[float] = []
            for i in currents:
                ratio = i / pickup if pickup > 0 else 1
                if ratio <= 1.0:
                    # Below pickup — push way out (won't trip)
                    times.append(10000.0)
                else:
                    try:
                        t = device.tms * k / (ratio ** alpha - 1.0)
                        times.append(round(min(t, 10000.0), 4))
                    except (ZeroDivisionError, ValueError, OverflowError):
                        times.append(10000.0)
            return times

        return [
            EngineeringChart(
                type="tcc",
                title="Time-Current Curve — Protection Coordination",
                curves=[
                    ChartCurveData(
                        name=f"{up.name or 'Upstream'} ({up.rated_current_a}A, {up.curve_type}, TMS={up.tms})",
                        currents=currents,
                        times=curve_points(up, up_curve),
                        color="#2563eb",
                    ),
                    ChartCurveData(
                        name=f"{down.name or 'Downstream'} ({down.rated_current_a}A, {down.curve_type}, TMS={down.tms})",
                        currents=currents,
                        times=curve_points(down, down_curve),
                        color="#dc2626",
                        dashed=True,
                    ),
                ],
                x_label="Current (A)",
                y_label="Time (s)",
            ),
        ]

    def get_units(self) -> Dict[str, str]:
        return {
            "maximum_selectivity_current_a": "A",
            "downstream_min_trip_ms": "ms",
            "upstream_min_trip_ms": "ms",
        }
