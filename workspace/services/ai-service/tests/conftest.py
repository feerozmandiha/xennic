"""Shared pytest configuration for ai-service."""

from __future__ import annotations

import pytest


@pytest.fixture(autouse=True)
def _disable_external_providers(monkeypatch: pytest.MonkeyPatch) -> None:
    """Unit tests should not initialize real LLM clients or SSL contexts."""
    monkeypatch.delenv('OPENAI_API_KEY', raising=False)
    monkeypatch.delenv('ANTHROPIC_API_KEY', raising=False)
    monkeypatch.delenv('GOOGLE_API_KEY', raising=False)

    def _empty_init(self) -> None:
        self.providers = {}

    monkeypatch.setattr('app.core.model_router.ModelRouter.__init__', _empty_init)
