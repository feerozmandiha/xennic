"""Validation engine — validates extracted values against domain rules."""
from __future__ import annotations

from typing import Any

import numpy as np

from app.core.stage import PipelineStage
from app.core.result import StageResult


class ValidationRule:
    """Single validation rule with a check function and error message."""

    def __init__(
        self,
        field: str,
        check: Any,
        message: str,
        severity: str = "warning",
    ) -> None:
        self.field = field
        self.check = check
        self.message = message
        self.severity = severity


# Domain-specific validation rules
NAMEPLATE_RULES: list[ValidationRule] = [
    ValidationRule("power_kw", lambda v: v is None or v <= 50000, "Power exceeds typical range", "error"),
    ValidationRule("voltage_v", lambda v: v is None or 12 <= v <= 33000, "Voltage outside typical range (12–33000V)", "warning"),
    ValidationRule("current_a", lambda v: v is None or v <= 10000, "Current exceeds typical range", "warning"),
    ValidationRule("frequency_hz", lambda v: v is None or v in (50, 60), "Frequency should be 50 or 60 Hz", "warning"),
    ValidationRule("speed_rpm", lambda v: v is None or 0 < v <= 100000, "Speed outside typical range", "error"),
    ValidationRule("poles", lambda v: v is None or v in (2, 4, 6, 8, 10, 12, 16), "Unusual pole count", "warning"),
    ValidationRule("efficiency_pct", lambda v: v is None or 0 < v <= 100, "Efficiency must be 0–100%", "error"),
    ValidationRule("power_factor", lambda v: v is None or 0 <= v <= 1, "Power factor must be 0–1", "error"),
    ValidationRule("voltage_v", lambda v: v is None or v <= 1000, "Low voltage equipment (≤1000V)", "info"),
]


class ValidationStage(PipelineStage):
    """Validate extracted data against engineering domain rules."""

    def __init__(self, rules: list[ValidationRule] | None = None) -> None:
        super().__init__("Validation")
        self._rules = rules or NAMEPLATE_RULES

    async def process(
        self,
        image: np.ndarray,
        context: dict[str, Any],
    ) -> tuple[np.ndarray, StageResult]:
        data = context.get("extracted_data", context.get("stage_data", {}))
        warnings: list[str] = []
        errors: list[str] = []
        validated_data: dict[str, Any] = {}

        for rule in self._rules:
            val = data.get(rule.field)
            try:
                valid = rule.check(val)
                if not valid:
                    entry = f"{rule.field}: {rule.message}"
                    if rule.severity == "error":
                        errors.append(entry)
                    else:
                        warnings.append(entry)
                else:
                    validated_data[rule.field] = val
            except Exception:
                errors.append(f"{rule.field}: validation check failed")

        # Consistency checks
        if "power_kw" in data and "current_a" in data and "voltage_v" in data:
            p_est = data["voltage_v"] * data["current_a"] * 0.001  # rough P = V*I*k
            ratio = abs(data["power_kw"] - p_est) / max(data["power_kw"], 0.001)
            if ratio > 0.5:
                warnings.append(f"Power ({data['power_kw']}kW) inconsistent with V*I ({p_est:.1f}kW)")

        confidence = max(0.0, 1.0 - (len(errors) * 0.3 + len(warnings) * 0.1))

        return image, StageResult(
            name=self.name,
            success=len(errors) == 0,
            confidence=float(min(1.0, confidence)),
            data={
                "validated": validated_data,
                "rules_applied": len(self._rules),
            },
            warnings=warnings,
            errors=errors,
        )
