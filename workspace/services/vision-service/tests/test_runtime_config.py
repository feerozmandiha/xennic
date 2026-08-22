"""Runtime configuration tests for vision-service."""
from __future__ import annotations

from pathlib import Path

import pytest

from app.config.providers import GroqVisionClient
from app.config.settings import Settings
from app.stages.ocr import tesseract_ocr


def test_settings_parse_tesseract_and_groq_env_aliases(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("TESSDATA_PATH", "/opt/tessdata")
    monkeypatch.setenv("VISION_GROQ_BASE_URL", "https://groq.example.test/chat")

    settings = Settings(_env_file=None)

    assert settings.tesseract_data_path == "/opt/tessdata"
    assert settings.vision_groq_base_url == "https://groq.example.test/chat"


def test_tesseract_language_mapping_uses_configured_data_path(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    (tmp_path / "eng.traineddata").write_text("", encoding="utf-8")
    (tmp_path / "fas.traineddata").write_text("", encoding="utf-8")

    monkeypatch.setattr(tesseract_ocr.settings, "tesseract_data_path", str(tmp_path))

    assert tesseract_ocr._to_tesseract_lang(["en", "fa", "ar"]) == "eng+fas"


@pytest.mark.asyncio
async def test_groq_client_uses_configured_base_url() -> None:
    client = GroqVisionClient(
        api_key="test-key",
        model="test-model",
        base_url="https://groq.example.test/chat",
    )

    try:
        assert client.base_url == "https://groq.example.test/chat"
        assert client.model == "test-model"
    finally:
        await client._client.aclose()
