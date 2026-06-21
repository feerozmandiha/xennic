"""Vision LLM OCR engine — uses multimodal LLM for document understanding."""
from __future__ import annotations

from typing import Any

import numpy as np

from app.config.providers import get_vision_client


class VisionLLMEngine:
    """OCR via multimodal vision LLM (Groq, OpenAI, etc.)."""

    PREDEFINED_PROMPTS: dict[str, str] = {
        "nameplate": (
            "You are an electrical engineer reading an equipment nameplate. "
            "Extract ALL visible fields as a JSON object. "
            "Fields to look for: manufacturer, model, serial_number, year_of_manufacture, "
            "power_kw, power_hp, voltage_v, current_a, frequency_hz, power_factor, "
            "efficiency_pct, poles, speed_rpm, insulation_class, duty_type, enclosure_type, "
            "connection_type. Return ONLY valid JSON."
        ),
        "bill": (
            "You are an energy analyst reading an electricity bill. "
            "Extract ALL visible fields as a JSON object. "
            "Fields to look for: bill_number, customer_name, customer_id, address, "
            "billing_period, issue_date, due_date, previous_reading_kwh, current_reading_kwh, "
            "consumption_kwh, average_daily_consumption, energy_charge, transmission_charge, "
            "distribution_charge, tax, other_charges, total_amount, payment_status. "
            "Return ONLY valid JSON."
        ),
        "generic": (
            "Extract all text from this image as structured JSON. "
            "Include sections, tables, and key-value pairs where possible. "
            "Return ONLY valid JSON with a 'text' field for full text and "
            "'fields' for any structured data found."
        ),
    }

    def __init__(self) -> None:
        self._client = get_vision_client()

    async def analyze(
        self,
        image: np.ndarray,
        doc_type: str = "generic",
        custom_prompt: str | None = None,
    ) -> dict[str, Any]:
        if self._client is None:
            return {"success": False, "error": "No LLM client configured"}

        import cv2

        # Encode to JPEG bytes
        success, buf = cv2.imencode(".jpg", image, [cv2.IMWRITE_JPEG_QUALITY, 85])
        if not success:
            return {"success": False, "error": "Failed to encode image"}

        prompt = custom_prompt or self.PREDEFINED_PROMPTS.get(doc_type, self.PREDEFINED_PROMPTS["generic"])
        return await self._client.analyze_image(buf.tobytes(), prompt)
