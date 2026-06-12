# tests/integration/test_basic_api.py
"""
Integration tests for Basic Electrical API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "engineering-service"
    assert "calculators_registered" in data


def test_ohms_law_calculate_voltage():
    """Test Ohm's Law API - calculate voltage from current and resistance"""
    response = client.post(
        "/api/v1/engineering/basic/ohms-law",
        json={"current_a": 10.0, "resistance_ohm": 5.0}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["calculation_code"] == "BASIC-001"
    assert data["data"]["results"]["voltage_v"] == 50.0


def test_ohms_law_calculate_current():
    """Test Ohm's Law API - calculate current from voltage and resistance"""
    response = client.post(
        "/api/v1/engineering/basic/ohms-law",
        json={"voltage_v": 230.0, "resistance_ohm": 23.0}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["results"]["current_a"] == 10.0


def test_ohms_law_validation_error():
    """Test Ohm's Law API with invalid input (only one parameter)"""
    response = client.post(
        "/api/v1/engineering/basic/ohms-law",
        json={"current_a": 10.0}
    )
    
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "error" in data


def test_active_power_single_phase():
    """Test Active Power API - single phase"""
    response = client.post(
        "/api/v1/engineering/basic/active-power",
        json={"voltage_v": 230.0, "current_a": 10.0, "power_factor": 0.85}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["calculation_code"] == "BASIC-002"
    assert data["data"]["results"]["active_power_w"] == 1955.0


def test_active_power_three_phase():
    """Test Active Power API - three phase"""
    response = client.post(
        "/api/v1/engineering/basic/active-power",
        json={"voltage_v": 400.0, "current_a": 20.0, "power_factor": 0.9, "phase_type": "three"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert abs(data["data"]["results"]["active_power_w"] - 12470.76) < 0.01


def test_active_power_invalid_pf():
    """Test Active Power API with invalid power factor"""
    response = client.post(
        "/api/v1/engineering/basic/active-power",
        json={"voltage_v": 230.0, "current_a": 10.0, "power_factor": 1.5}
    )
    
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False


def test_apparent_power_single_phase():
    """Test Apparent Power API - single phase"""
    response = client.post(
        "/api/v1/engineering/basic/apparent-power",
        json={"voltage_v": 230.0, "current_a": 10.0}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["results"]["apparent_power_va"] == 2300.0


def test_apparent_power_three_phase():
    """Test Apparent Power API - three phase"""
    response = client.post(
        "/api/v1/engineering/basic/apparent-power",
        json={"voltage_v": 400.0, "current_a": 20.0, "phase_type": "three"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert abs(data["data"]["results"]["apparent_power_va"] - 13856.4) < 0.01


def test_reactive_power():
    """Test Reactive Power API"""
    response = client.post(
        "/api/v1/engineering/basic/reactive-power",
        json={"active_power_w": 800.0, "apparent_power_va": 1000.0}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["results"]["reactive_power_var"] == 600.0


def test_power_factor():
    """Test Power Factor API"""
    response = client.post(
        "/api/v1/engineering/basic/power-factor",
        json={"active_power_w": 850.0, "apparent_power_va": 1000.0}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["results"]["power_factor"] == 0.85
