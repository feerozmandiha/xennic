"""Knowledge engine — derive engineering intelligence from extracted data."""
from __future__ import annotations

from typing import Any

import numpy as np

from app.core.stage import PipelineStage
from app.core.result import StageResult


class KnowledgeEngine(PipelineStage):
    """Derive engineering knowledge from extracted and validated data."""

    async def process(
        self,
        image: np.ndarray,
        context: dict[str, Any],
    ) -> tuple[np.ndarray, StageResult]:
        data = context.get("extracted_data", {})

        knowledge: dict[str, Any] = {}
        warnings: list[str] = []

        # Infer device type from parameters
        device_type = self._infer_device_type(data)
        if device_type:
            knowledge["inferred_device_type"] = device_type

        # Estimate load / application
        recommended_use = self._estimate_application(data, device_type)
        if recommended_use:
            knowledge["recommended_application"] = recommended_use

        # Calculate apparent power (kVA)
        if "voltage_v" in data and "current_a" in data:
            knowledge["apparent_power_kva"] = round(
                data["voltage_v"] * data["current_a"] / 1000, 2
            )

        # Motor-specific knowledge
        if device_type == "motor":
            motor_knowledge = self._motor_analysis(data)
            knowledge.update(motor_knowledge)

        # Transformer-specific knowledge
        if device_type == "transformer":
            tx_knowledge = self._transformer_analysis(data)
            knowledge.update(tx_knowledge)

        confidence = 0.8 if knowledge else 0.0

        return image, StageResult(
            name=self.name,
            success=True,
            confidence=float(confidence),
            data={"knowledge": knowledge},
            warnings=warnings,
        )

    def _infer_device_type(self, data: dict[str, Any]) -> str | None:
        has_motor_params = (
            "speed_rpm" in data
            or "poles" in data
            or ("power_kw" in data and "current_a" in data)
        )
        has_transformer_params = "voltage_v" in data and data.get("voltage_v", 0) > 1000
        if has_transformer_params and not has_motor_params:
            return "transformer"
        if has_motor_params:
            return "motor"
        return "generic_electrical"

    def _estimate_application(
        self,
        data: dict[str, Any],
        device_type: str | None,
    ) -> str | None:
        if device_type == "motor":
            power = data.get("power_kw", 0)
            if power < 1:
                return "Small motor — fans, pumps, compressors"
            if power < 100:
                return "Medium motor — industrial machinery, conveyors"
            return "Large motor — heavy industry, mining"
        if device_type == "transformer":
            return "Power transmission / distribution"
        return None

    def _motor_analysis(self, data: dict[str, Any]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        poles = data.get("poles")
        freq = data.get("frequency_hz", 50)

        if poles and freq:
            sync_speed = 120 * freq / poles
            result["synchronous_speed_rpm"] = int(sync_speed)
            actual = data.get("speed_rpm")
            if actual:
                slip = ((sync_speed - actual) / sync_speed) * 100
                result["slip_pct"] = round(slip, 2)

        if "power_kw" in data and "efficiency_pct" in data:
            eff = data["efficiency_pct"]
            result["input_power_kw"] = round(data["power_kw"] / (eff / 100), 2)

        return result

    def _transformer_analysis(self, data: dict[str, Any]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        if "power_kw" in data and "voltage_v" in data:
            result["estimated_secondary_current_a"] = round(
                data["power_kw"] * 1000 / data["voltage_v"], 2
            )
        return result
