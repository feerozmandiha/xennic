"""CORS security regression tests for vision-service."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.config.settings import Settings
from app.main import app


def test_cors_allows_configured_origin() -> None:
    client = TestClient(app)

    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert response.headers["access-control-allow-credentials"] == "true"


def test_cors_rejects_unconfigured_origin() -> None:
    client = TestClient(app)

    response = client.options(
        "/health",
        headers={
            "Origin": "https://evil.example.com",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


def test_settings_parse_vision_cors_origins_alias(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv(
        "VISION_CORS_ORIGINS",
        "https://app.xennic.example.com, https://www.xennic.example.com",
    )

    settings = Settings(_env_file=None)

    assert settings.cors_origins_list == [
        "https://app.xennic.example.com",
        "https://www.xennic.example.com",
    ]


def test_wildcard_cors_with_credentials_is_rejected() -> None:
    with pytest.raises(ValueError, match="CORS wildcard"):
        Settings(
            _env_file=None,
            cors_origins="*",
            cors_allow_credentials=True,
        )
