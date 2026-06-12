# tests/test_calculators/test_power_quality/test_pq_integration.py
"""
Integration tests for Power Quality API endpoints (PQ-001 … PQ-006)
"""

import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.core.registry import CalculationRegistry
from src.calculators.power_quality import (
    THDCalculator, TDDCalculator, KFactorPQCalculator,
    ResonanceCalculator, PassiveFilterCalculator, ActiveFilterCalculator,
)


@pytest.fixture(scope="module", autouse=True)
def setup_registry():
    registry = CalculationRegistry()
    registry.clear()
    registry.register(THDCalculator)
    registry.register(TDDCalculator)
    registry.register(KFactorPQCalculator)
    registry.register(ResonanceCalculator)
    registry.register(PassiveFilterCalculator)
    registry.register(ActiveFilterCalculator)
    app.state.registry = registry
    yield
    app.state.registry = None


client = TestClient(app)
BASE = "/api/v1/engineering/power-quality"


# ── PQ-001: THD ───────────────────────────────────────────────────────────────

class TestTHDAPI:

    def test_thd_basic(self):
        resp = client.post(f"{BASE}/thd", json={
            "harmonic_currents": {"1": 100.0, "5": 20.0, "7": 14.0}
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["data"]["calculation_code"] == "PQ-001"
        assert data["data"]["results"]["thd_percent"] > 0
        assert "is_compliant" in data["data"]["results"]

    def test_thd_with_voltage_category(self):
        resp = client.post(f"{BASE}/thd", json={
            "harmonic_currents": {"1": 100.0, "5": 5.0},
            "base_voltage_kv": 0.4
        })
        assert resp.status_code == 200
        result = resp.json()["data"]["results"]
        assert result["ieee519_voltage_category"] == "≤1kV"
        assert result["ieee519_thd_limit"] == 8.0

    def test_thd_missing_fundamental(self):
        resp = client.post(f"{BASE}/thd", json={
            "harmonic_currents": {"5": 20.0, "7": 10.0}
        })
        assert resp.status_code in (400, 422)
        assert resp.json()["success"] is False


# ── PQ-002: TDD ───────────────────────────────────────────────────────────────

class TestTDDAPI:

    def test_tdd_basic(self):
        resp = client.post(f"{BASE}/tdd", json={
            "harmonic_currents": {"5": 20.0, "7": 14.0, "11": 9.0},
            "max_demand_current_a": 200.0,
            "isc_il_ratio": 20.0,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["data"]["calculation_code"] == "PQ-002"
        result = data["data"]["results"]
        assert result["tdd_percent"] > 0
        assert "is_compliant" in result
        assert result["ieee519_tdd_limit"] == 8.0   # Isc/IL=20 → limit=8%

    def test_tdd_with_fundamental_raises(self):
        resp = client.post(f"{BASE}/tdd", json={
            "harmonic_currents": {"1": 100.0, "5": 20.0},
            "max_demand_current_a": 200.0,
        })
        assert resp.status_code in (400, 422)


# ── PQ-003: K-Factor ─────────────────────────────────────────────────────────

class TestKFactorAPI:

    def test_kfactor_pure_sine(self):
        """K=1 for pure sine"""
        resp = client.post(f"{BASE}/k-factor", json={
            "harmonic_currents": {"1": 100.0}
        })
        assert resp.status_code == 200
        result = resp.json()["data"]["results"]
        assert result["k_factor"] == pytest.approx(1.0, abs=0.001)
        assert result["derating_factor"] == pytest.approx(1.0, abs=0.001)

    def test_kfactor_with_harmonics(self):
        """Higher harmonics → K > 1"""
        resp = client.post(f"{BASE}/k-factor", json={
            "harmonic_currents": {"1": 100.0, "3": 33.0, "5": 20.0, "7": 14.0}
        })
        assert resp.status_code == 200
        result = resp.json()["data"]["results"]
        assert result["k_factor"] > 1.0
        assert result["recommended_k_factor_rating"] in [1, 4, 9, 13, 20, 30, 40, 50]

    def test_kfactor_with_transformer_kva(self):
        resp = client.post(f"{BASE}/k-factor", json={
            "harmonic_currents": {"1": 100.0, "5": 30.0, "7": 20.0},
            "transformer_kva": 500.0,
        })
        assert resp.status_code == 200
        result = resp.json()["data"]["results"]
        assert result["derated_kva"] is not None
        assert result["derated_kva"] < 500.0


# ── PQ-004: Resonance ─────────────────────────────────────────────────────────

class TestResonanceAPI:

    def test_resonance_basic(self):
        resp = client.post(f"{BASE}/resonance", json={
            "system_kva_sc": 5000.0,
            "capacitor_kvar": 300.0,
        })
        assert resp.status_code == 200
        result = resp.json()["data"]["results"]
        # h_r = sqrt(5000/300) ≈ 4.08
        assert abs(result["resonant_harmonic_order"] - 4.08) < 0.1
        assert result["resonant_frequency_hz"] == pytest.approx(4.08 * 50, abs=1)

    def test_resonance_high_risk(self):
        """h_r ≈ 5 → HIGH RISK (5th harmonic very common)"""
        # 5000 / 200 = 25 → h_r = 5.0
        resp = client.post(f"{BASE}/resonance", json={
            "system_kva_sc": 5000.0,
            "capacitor_kvar": 200.0,
            "present_harmonics": [5, 7],
        })
        assert resp.status_code == 200
        result = resp.json()["data"]["results"]
        assert result["risk_level"] == "HIGH"
        assert len(result["warnings"]) > 0

    def test_resonance_low_risk(self):
        """h_r away from common harmonics → LOW"""
        # sqrt(5000/800) ≈ 2.5 → not near common harmonics
        resp = client.post(f"{BASE}/resonance", json={
            "system_kva_sc": 5000.0,
            "capacitor_kvar": 800.0,
        })
        assert resp.status_code == 200
        result = resp.json()["data"]["results"]
        assert result["risk_level"] in ("LOW", "MEDIUM")


# ── PQ-005: Passive Filter ────────────────────────────────────────────────────

class TestPassiveFilterAPI:

    def test_passive_filter_5th_harmonic(self):
        resp = client.post(f"{BASE}/passive-filter", json={
            "target_harmonic_order": 5,
            "system_voltage_v": 400.0,
            "harmonic_current_a": 20.0,
        })
        assert resp.status_code == 200
        result = resp.json()["data"]["results"]
        assert result["target_harmonic_order"] == 5
        assert result["capacitor_uf_per_phase"] > 0
        assert result["reactor_mh_per_phase"] > 0
        assert result["tuned_harmonic_order"] < 5  # detuned below 5th

    def test_passive_filter_has_recommendations(self):
        resp = client.post(f"{BASE}/passive-filter", json={
            "target_harmonic_order": 7,
            "system_voltage_v": 400.0,
            "harmonic_current_a": 15.0,
            "q_factor": 40.0,
        })
        assert resp.status_code == 200
        result = resp.json()["data"]["results"]
        assert len(result["recommendations"]) > 0


# ── PQ-006: Active Filter ─────────────────────────────────────────────────────

class TestActiveFilterAPI:

    def test_apf_sizing_basic(self):
        resp = client.post(f"{BASE}/active-filter", json={
            "harmonic_currents": {"3": 30.0, "5": 20.0, "7": 10.0},
            "target_thd_percent": 5.0,
            "fundamental_current_a": 100.0,
            "system_voltage_v": 400.0,
        })
        assert resp.status_code == 200
        result = resp.json()["data"]["results"]
        assert result["required_apf_current_a"] > 0
        assert result["apf_kva_3phase"] > 0
        assert result["current_thd_percent"] > result["target_thd_percent"]

    def test_apf_already_compliant(self):
        """Very small harmonics → already compliant"""
        resp = client.post(f"{BASE}/active-filter", json={
            "harmonic_currents": {"5": 2.0, "7": 1.0},
            "target_thd_percent": 10.0,
            "fundamental_current_a": 100.0,
            "system_voltage_v": 400.0,
        })
        assert resp.status_code == 200
        result = resp.json()["data"]["results"]
        assert result["already_compliant"] is True
        assert result["required_apf_current_a"] == 0

    def test_apf_with_fundamental_raises(self):
        resp = client.post(f"{BASE}/active-filter", json={
            "harmonic_currents": {"1": 100.0, "5": 20.0},
            "target_thd_percent": 5.0,
            "fundamental_current_a": 100.0,
            "system_voltage_v": 400.0,
        })
        assert resp.status_code in (400, 422)
