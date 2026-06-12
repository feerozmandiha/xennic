"""
Integration tests for Cable Engineering API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.core.registry import CalculationRegistry
from src.calculators.cable.ampacity import CableAmpacityCalculator
from src.calculators.cable.voltage_drop import VoltageDropCalculator
from src.calculators.cable.short_circuit import ShortCircuitWithstandCalculator
from src.calculators.cable.pe_sizing import PESizingCalculator
from src.calculators.basic.ohms_law import OhmsLawCalculator
from src.calculators.basic.active_power import ActivePowerCalculator
from src.calculators.basic.apparent_power import ApparentPowerCalculator
from src.calculators.basic.reactive_power import ReactivePowerCalculator
from src.calculators.basic.power_factor import PowerFactorCalculator


# Setup registry before tests
@pytest.fixture(scope="session", autouse=True)
def setup_registry():
    """Setup registry with all calculators for testing"""
    registry = CalculationRegistry()
    registry.clear()
    
    # Basic calculators
    registry.register(OhmsLawCalculator)
    registry.register(ActivePowerCalculator)
    registry.register(ApparentPowerCalculator)
    registry.register(ReactivePowerCalculator)
    registry.register(PowerFactorCalculator)
    
    # Cable calculators
    registry.register(CableAmpacityCalculator)
    registry.register(VoltageDropCalculator)
    registry.register(ShortCircuitWithstandCalculator)
    registry.register(PESizingCalculator)
    
    # Set registry in app state
    app.state.registry = registry
    
    yield
    
    # Cleanup
    app.state.registry = None


# Create test client
client = TestClient(app)


class TestCableAPI:
    """Test suite for Cable Engineering API"""
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["calculators_registered"] >= 9
    
    # =========================================================================
    # CABLE-001: Cable Sizing Tests
    # =========================================================================
    
    def test_cable_sizing_copper_pvc_c_100a(self):
        """Test cable sizing for 100A load with copper/PVC on wall"""
        response = client.post(
            "/api/v1/engineering/cable/sizing",
            json={
                "load_current": 100.0,
                "installation_method": "C",
                "ambient_temperature": 30.0,
                "conductor_material": "copper",
                "insulation_type": "PVC",
                "number_of_circuits": 1,
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["calculation_code"] == "CABLE-001"
        assert "minimum_cable_size" in data["data"]["results"]
    
    def test_cable_sizing_with_temperature_derating(self):
        """Test cable sizing with high temperature derating"""
        response = client.post(
            "/api/v1/engineering/cable/sizing",
            json={
                "load_current": 100.0,
                "installation_method": "C",
                "ambient_temperature": 50.0,
                "conductor_material": "copper",
                "insulation_type": "PVC",
                "number_of_circuits": 1,
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # Temperature correction factor should be 0.71 for 50°C
        assert data["data"]["results"]["temperature_correction_factor"] == 0.71
    
    def test_cable_sizing_with_grouping(self):
        """Test cable sizing with multiple circuits grouping"""
        response = client.post(
            "/api/v1/engineering/cable/sizing",
            json={
                "load_current": 100.0,
                "installation_method": "C",
                "ambient_temperature": 30.0,
                "conductor_material": "copper",
                "insulation_type": "PVC",
                "number_of_circuits": 3,
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # Grouping factor for 3 circuits should be 0.70
        assert data["data"]["results"]["grouping_correction_factor"] == 0.70
    
    def test_cable_sizing_aluminum(self):
        """Test cable sizing for aluminum conductor"""
        response = client.post(
            "/api/v1/engineering/cable/sizing",
            json={
                "load_current": 100.0,
                "installation_method": "C",
                "ambient_temperature": 30.0,
                "conductor_material": "aluminum",
                "insulation_type": "PVC",
                "number_of_circuits": 1,
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # Aluminum requires larger cable than copper
        assert data["data"]["results"]["minimum_cable_size"] >= 50.0
    
    # =========================================================================
    # CABLE-002: Voltage Drop Tests
    # =========================================================================
    
    def test_voltage_drop_single_phase(self):
        """Test voltage drop for single-phase system"""
        response = client.post(
            "/api/v1/engineering/cable/voltage-drop",
            json={
                "voltage_v": 230.0,
                "current_a": 20.0,
                "cable_length_m": 100.0,
                "cable_size_mm2": 10.0,
                "conductor_material": "copper",
                "power_factor": 0.85,
                "phase_type": "single",
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["calculation_code"] == "CABLE-002"
        assert "voltage_drop_percent" in data["data"]["results"]
    
    def test_voltage_drop_three_phase(self):
        """Test voltage drop for three-phase system"""
        response = client.post(
            "/api/v1/engineering/cable/voltage-drop",
            json={
                "voltage_v": 400.0,
                "current_a": 50.0,
                "cable_length_m": 150.0,
                "cable_size_mm2": 35.0,
                "conductor_material": "copper",
                "power_factor": 0.85,
                "phase_type": "three",
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_voltage_drop_acceptable(self):
        """Test voltage drop within acceptable limits"""
        response = client.post(
            "/api/v1/engineering/cable/voltage-drop",
            json={
                "voltage_v": 400.0,
                "current_a": 30.0,
                "cable_length_m": 50.0,
                "cable_size_mm2": 50.0,
                "conductor_material": "copper",
                "power_factor": 0.9,
                "phase_type": "three",
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["results"]["is_acceptable"] is True
    
    # =========================================================================
    # CABLE-003: Short Circuit Tests
    # =========================================================================
    
    def test_short_circuit_copper_pvc(self):
        """Test short circuit withstand for copper/PVC cable"""
        response = client.post(
            "/api/v1/engineering/cable/short-circuit",
            json={
                "short_circuit_current_ka": 10.0,
                "fault_duration_s": 1.0,
                "conductor_material": "copper",
                "insulation_type": "PVC",
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["calculation_code"] == "CABLE-003"
        assert data["data"]["results"]["k_factor"] == 115
    
    def test_short_circuit_copper_xlpe(self):
        """Test short circuit withstand for copper/XLPE cable"""
        response = client.post(
            "/api/v1/engineering/cable/short-circuit",
            json={
                "short_circuit_current_ka": 10.0,
                "fault_duration_s": 1.0,
                "conductor_material": "copper",
                "insulation_type": "XLPE",
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["results"]["k_factor"] == 143
    
    def test_short_circuit_aluminum(self):
        """Test short circuit withstand for aluminum cable"""
        response = client.post(
            "/api/v1/engineering/cable/short-circuit",
            json={
                "short_circuit_current_ka": 10.0,
                "fault_duration_s": 1.0,
                "conductor_material": "aluminum",
                "insulation_type": "PVC",
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["results"]["k_factor"] == 76
    
    # =========================================================================
    # CABLE-004: PE Sizing Tests
    # =========================================================================
    
    def test_pe_sizing_small_phase(self):
        """Test PE sizing for small phase conductor (≤16mm²)"""
        response = client.post(
            "/api/v1/engineering/cable/pe-sizing",
            json={
                "phase_conductor_size": 10.0,
                "conductor_material": "copper",
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["results"]["minimum_pe_size"] == 10.0
    
    def test_pe_sizing_medium_phase(self):
        """Test PE sizing for medium phase conductor (16-35mm²)"""
        response = client.post(
            "/api/v1/engineering/cable/pe-sizing",
            json={
                "phase_conductor_size": 25.0,
                "conductor_material": "copper",
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["results"]["minimum_pe_size"] == 16.0
    
    def test_pe_sizing_large_phase(self):
        """Test PE sizing for large phase conductor (>35mm²)"""
        response = client.post(
            "/api/v1/engineering/cable/pe-sizing",
            json={
                "phase_conductor_size": 70.0,
                "conductor_material": "copper",
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["results"]["minimum_pe_size"] == 35.0
    
    # =========================================================================
    # Validation Error Tests
    # =========================================================================
    
    def test_invalid_load_current(self):
        """Test invalid load current (negative) - Pydantic returns 422"""
        response = client.post(
            "/api/v1/engineering/cable/sizing",
            json={
                "load_current": -100.0,
                "installation_method": "C",
                "ambient_temperature": 30.0,
                "conductor_material": "copper",
                "insulation_type": "PVC",
            }
        )
        # Pydantic validation returns 422
        assert response.status_code == 422
        data = response.json()
        assert data["success"] is False
    
    def test_invalid_voltage_drop_parameters(self):
        """Test invalid voltage drop parameters (zero length)"""
        response = client.post(
            "/api/v1/engineering/cable/voltage-drop",
            json={
                "voltage_v": 230.0,
                "current_a": 10.0,
                "cable_length_m": 0,
                "cable_size_mm2": 10.0,
                "conductor_material": "copper",
                "power_factor": 0.85,
                "phase_type": "single",
            }
        )
        # Pydantic validation returns 422
        assert response.status_code == 422
        data = response.json()
        assert data["success"] is False
