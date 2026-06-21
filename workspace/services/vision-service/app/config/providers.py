"""LLM provider clients."""
from __future__ import annotations

import abc
import json
from typing import Any

import httpx

from app.config.settings import settings


class LLMClient(abc.ABC):
    """Abstract base for multimodal (vision) LLM clients."""

    @abc.abstractmethod
    async def analyze_image(
        self,
        image_bytes: bytes,
        prompt: str,
        mime_type: str = "image/jpeg",
    ) -> dict[str, Any]:
        ...


class GroqVisionClient(LLMClient):
    """Groq multimodal (vision) client using existing key."""

    BASE_URL = "https://api.groq.com/openai/v1/chat/completions"

    def __init__(self, api_key: str, model: str | None = None) -> None:
        self.api_key = api_key
        self.model = model or settings.vision_llm_model
        self._client = httpx.AsyncClient(timeout=settings.llm_timeout_seconds)

    async def analyze_image(
        self,
        image_bytes: bytes,
        prompt: str,
        mime_type: str = "image/jpeg",
    ) -> dict[str, Any]:
        import base64

        b64 = base64.b64encode(image_bytes).decode("utf-8")
        data_url = f"data:{mime_type};base64,{b64}"

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": data_url, "detail": "high"},
                        },
                    ],
                }
            ],
            "temperature": 0.1,
            "max_tokens": 4096,
            "response_format": {"type": "json_object"},
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        resp = await self._client.post(self.BASE_URL, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

        content = data["choices"][0]["message"]["content"]
        return json.loads(content)


class MockVisionClient(LLMClient):
    """Mock client for testing / development."""

    async def analyze_image(
        self,
        image_bytes: bytes,
        prompt: str,
        mime_type: str = "image/jpeg",
    ) -> dict[str, Any]:
        return {
            "success": True,
            "confidence": 0.95,
            "data": {
                "manufacturer": "TESTCORP",
                "model": "MOCK-1000",
                "power_kw": 100.0,
                "voltage_v": 400,
                "current_a": 250,
            },
            "engine": "mock",
        }


def get_vision_client() -> LLMClient | None:
    provider = settings.vision_llm_provider
    if provider == "groq" and settings.groq_api_key:
        return GroqVisionClient(api_key=settings.groq_api_key)
    if provider == "openai" and settings.openai_api_key:
        msg = "OpenAI vision client not yet implemented"
        raise NotImplementedError(msg)
    if provider == "anthropic" and settings.anthropic_api_key:
        msg = "Anthropic vision client not yet implemented"
        raise NotImplementedError(msg)
    if provider == "mock":
        return MockVisionClient()
    return None
