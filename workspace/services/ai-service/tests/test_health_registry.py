"""Registry-backed health and agent endpoint tests."""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app


class FakeRegistry:
    def list_all(self) -> list[dict[str, str]]:
        return [
            {
                "agent_id": "electrical_engineer",
                "agent_name": "Electrical Engineer Agent",
                "description": "Electrical engineering assistant",
            },
            {
                "agent_id": "document_analyst",
                "agent_name": "Document Analyst Agent",
                "description": "Document understanding assistant",
            },
        ]

    def get(self, agent_id: str):
        return None


def _set_registry(registry):
    previous = getattr(app.state, "registry", None)
    had_previous = hasattr(app.state, "registry")
    app.state.registry = registry
    return had_previous, previous


def _restore_registry(had_previous: bool, previous) -> None:
    if had_previous:
        app.state.registry = previous
    elif hasattr(app.state, "registry"):
        delattr(app.state, "registry")


def test_health_uses_app_state_registry() -> None:
    had_previous, previous = _set_registry(FakeRegistry())
    try:
        client = TestClient(app)
        response = client.get("/health")
    finally:
        _restore_registry(had_previous, previous)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["registry_ready"] is True
    assert data["agents_registered"] == 2


def test_agent_listing_uses_app_state_registry() -> None:
    had_previous, previous = _set_registry(FakeRegistry())
    try:
        client = TestClient(app)
        response = client.get("/api/v1/ai/agents")
    finally:
        _restore_registry(had_previous, previous)

    assert response.status_code == 200
    data = response.json()
    assert [agent["agent_id"] for agent in data] == [
        "electrical_engineer",
        "document_analyst",
    ]
