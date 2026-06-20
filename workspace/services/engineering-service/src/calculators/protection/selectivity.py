"""
PROT-003: Selectivity (Discrimination) Analysis per IEC 60947-2

Supports:
- Current selectivity  : Upstream Ii > Downstream Ii
- Time selectivity     : Upstream delay > Downstream clearing time
- Zone interlocking    : Communication-based (simplified)
"""

import math
from typing import Dict, Any

from src.core.base_calculator import BaseCalculator
from .schemas import SelectivityInput


class SelectivityCalculator(BaseCalculator[SelectivityInput]):
    CALCULATION_CODE = "PROT-003"
    CALCULATION_NAME = "Selectivity (Discrimination) Analysis"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC 60947-2"
    STANDARD_VERSION = "2020"
    ENGINE_VERSION = "0.1.0"

    def get_units(self):
        return {
            "selectivity_limit_ka": "kA",
            "selectivity_ratio": "",
            "upstream_rated_current_a": "A",
            "upstream_instantaneous_threshold_a": "A",
            "downstream_rated_current_a": "A",
            "downstream_instantaneous_threshold_a": "A",
        }

    def validate_inputs(self, inputs: SelectivityInput) -> bool:
        if inputs.upstream_instantaneous_threshold_a <= inputs.downstream_instantaneous_threshold_a and inputs.selectivity_type == "current":
            pass  # ممکن است همچنان selective نباشد ولی validation پاس است
        if inputs.selectivity_type == "time":
            if inputs.upstream_delay_ms is None:
                raise ValueError("upstream_delay_ms required for time selectivity")
            if inputs.downstream_clearing_ms is None:
                raise ValueError("downstream_clearing_ms required for time selectivity")
        return True

    def _calculate(self, inputs: SelectivityInput) -> Dict[str, Any]:
        p = inputs

        # Common calculations
        ratio = p.upstream_instantaneous_threshold_a / p.downstream_instantaneous_threshold_a

        fault_a = p.fault_current_ka * 1000

        if p.selectivity_type == "current":
            result = self._current_selectivity(p, ratio, fault_a)
        elif p.selectivity_type == "time":
            result = self._time_selectivity(p, ratio, fault_a)
        elif p.selectivity_type == "zone_interlocking":
            result = self._zone_selectivity(p, ratio, fault_a)
        else:
            result = self._current_selectivity(p, ratio, fault_a)

        result.update({
            "selectivity_type": p.selectivity_type,
            "upstream_breaker_info": {
                "rated_current_a": p.upstream_rated_current_a,
                "instantaneous_threshold_a": p.upstream_instantaneous_threshold_a,
            },
            "downstream_breaker_info": {
                "rated_current_a": p.downstream_rated_current_a,
                "instantaneous_threshold_a": p.downstream_instantaneous_threshold_a,
            },
        })

        return result

    def _current_selectivity(self, p: SelectivityInput, ratio: float, fault_a: float) -> Dict[str, Any]:
        """Current-based selectivity: upstream Ii must exceed downstream Ii."""
        selectivity_limit_a = p.downstream_instantaneous_threshold_a
        is_selective = (
            p.upstream_instantaneous_threshold_a >= p.downstream_instantaneous_threshold_a * 1.25
        )

        if is_selective:
            msg = "Selectivity achieved — upstream Ii sufficiently exceeds downstream Ii"
        else:
            msg = (
                "Selectivity NOT achieved — increase upstream Ii "
                f"(currently {p.upstream_instantaneous_threshold_a:.0f}A) "
                f"to at least {p.downstream_instantaneous_threshold_a * 1.25:.0f}A"
            )

        if fault_a > selectivity_limit_a:
            msg += f" — fault current {p.fault_current_ka:.1f}kA exceeds selectivity limit {selectivity_limit_a/1000:.1f}kA"

        return {
            "is_selective": is_selective and (fault_a <= selectivity_limit_a),
            "selectivity_limit_ka": round(selectivity_limit_a / 1000, 3),
            "selectivity_ratio": round(ratio, 2),
            "recommendation": msg,
        }

    def _time_selectivity(self, p: SelectivityInput, ratio: float, fault_a: float) -> Dict[str, Any]:
        """Time-based selectivity: upstream delay must exceed downstream clearing time."""
        selectivity_limit_a = p.downstream_instantaneous_threshold_a * 1.25
        is_selective = False
        if p.upstream_delay_ms is not None and p.downstream_clearing_ms is not None:
            is_selective = p.upstream_delay_ms > p.downstream_clearing_ms * 1.5

        if is_selective:
            msg = (
                f"Time selectivity achieved — upstream delay ({p.upstream_delay_ms:.0f}ms) "
                f"exceeds downstream clearing ({p.downstream_clearing_ms:.0f}ms)"
            )
        else:
            msg = (
                "Time selectivity NOT achieved — increase upstream delay "
                f"(needs > {p.downstream_clearing_ms * 1.5:.0f}ms)"
            )

        return {
            "is_selective": is_selective,
            "selectivity_limit_ka": round(selectivity_limit_a / 1000, 3),
            "selectivity_ratio": round(ratio, 2),
            "recommendation": msg,
        }

    def _zone_selectivity(self, p: SelectivityInput, ratio: float, fault_a: float) -> Dict[str, Any]:
        """Zone selective interlocking (ZSI) — simplified."""
        selectivity_limit_a = p.downstream_instantaneous_threshold_a * 2.0
        is_selective = True  # ZSI inherently achieves selectivity up to breaker capacity

        msg = (
            "Zone Selective Interlocking (ZSI) provides full selectivity "
            f"up to {selectivity_limit_a / 1000:.1f}kA (2× downstream Ii). "
            "Requires compatible breakers with communication (e.g., Micrologic, Trip Unit)"
        )

        return {
            "is_selective": is_selective,
            "selectivity_limit_ka": round(selectivity_limit_a / 1000, 3),
            "selectivity_ratio": round(ratio, 2),
            "recommendation": msg,
        }
