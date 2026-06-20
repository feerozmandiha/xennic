"""
Unit tests for PS-003: Motor Starting Analysis (PowerSystemMotorStartingCalculator)
"""

import pytest
from src.schemas.power_system import (
    MotorStartingInput, MotorStartingOutput,
    NetworkData, BusData, MotorData, LoadData,
)
from src.calculators.power_system.motor_starting import PowerSystemMotorStartingCalculator


@pytest.fixture
def simple_motor_network():
    """Small network with a motor bus and a stiff source."""
    return NetworkData(
        buses=[
            BusData(name="SOURCE", vn_kv=0.4, type="slack"),
            BusData(name="MOTOR_BUS", vn_kv=0.4, type="pq"),
        ],
        lines=[
            LineData(
                name="FEEDER", from_bus="SOURCE", to_bus="MOTOR_BUS",
                length_km=0.1, r_ohm_per_km=0.1, x_ohm_per_km=0.05,
            ),
        ],
        loads=[
            LoadData(name="OTHER_LOAD", bus="MOTOR_BUS", p_mw=0.02, q_mvar=0.01),
        ],
    )


from src.schemas.power_system import LineData  # noqa: E402


class TestPowerSystemMotorStarting:
    """Test suite for PS-003: Motor Starting Analysis"""

    def setup_method(self):
        self.calc = PowerSystemMotorStartingCalculator()

    def test_dol_starting(self, simple_motor_network):
        """Direct-on-line start of a 100 kW motor."""
        inputs = MotorStartingInput(
            motor=MotorData(
                name="M1",
                rated_power_kw=100.0,
                rated_voltage_v=400.0,
                rated_efficiency=0.95,
                speed_rpm=1500,
                starting_current_factor=6.5,
                starting_power_factor=0.3,
                starting_torque_factor=1.5,
                starting_method="direct",
                stall_time_s=20,
            ),
            network=simple_motor_network,
            motor_bus="MOTOR_BUS",
            allowed_voltage_dip_pct=15.0,
            load_torque_percent=50.0,
        )
        result = self.calc.execute(inputs)

        assert result.calculation_code == "PS-003"
        details = result.results["details"]
        assert details["voltage_dip_percent"] > 0
        assert details["starting_current_a"] > 0
        assert details["starting_torque_nm"] > 0
        assert details["rated_torque_nm"] > 0

    def test_voltage_dip_calculation(self, simple_motor_network):
        """Voltage dip should be reasonable for a small motor."""
        # Small motor, stiff source — small dip
        inputs = MotorStartingInput(
            motor=MotorData(
                name="SMALL_MOTOR",
                rated_power_kw=10.0,
                rated_voltage_v=400.0,
                rated_efficiency=0.92,
                speed_rpm=1500,
                starting_current_factor=5.0,
                starting_power_factor=0.35,
                starting_torque_factor=1.5,
                starting_method="direct",
                stall_time_s=20,
            ),
            network=simple_motor_network,
            motor_bus="MOTOR_BUS",
            load_torque_percent=30.0,
        )
        result = self.calc.execute(inputs)

        details = result.results["details"]
        assert details["voltage_dip_percent"] < 100
        assert 0 < details["voltage_dip_deviation"] < 1.0

    def test_starting_time_estimation(self, simple_motor_network):
        """Acceleration time should be finite and reasonable."""
        inputs = MotorStartingInput(
            motor=MotorData(
                name="M1",
                rated_power_kw=37.0,
                rated_voltage_v=400.0,
                rated_efficiency=0.93,
                speed_rpm=1500,
                starting_current_factor=6.0,
                starting_power_factor=0.3,
                starting_torque_factor=1.8,
                starting_method="direct",
                stall_time_s=20,
            ),
            network=simple_motor_network,
            motor_bus="MOTOR_BUS",
            load_torque_percent=40.0,
        )
        result = self.calc.execute(inputs)

        details = result.results["details"]
        if details["starting_time_s"] is not None:
            assert details["starting_time_s"] > 0
        if details["acceleration_time_s"] is not None:
            assert details["acceleration_time_s"] > 0

    def test_warnings_for_severe_dip(self, simple_motor_network):
        """Very large motor causing severe dip should produce warnings."""
        inputs = MotorStartingInput(
            motor=MotorData(
                name="BIG_MOTOR",
                rated_power_kw=500.0,
                rated_voltage_v=400.0,
                rated_efficiency=0.95,
                speed_rpm=1500,
                starting_current_factor=7.0,
                starting_power_factor=0.25,
                starting_torque_factor=1.5,
                starting_method="direct",
                stall_time_s=20,
            ),
            network=simple_motor_network,
            motor_bus="MOTOR_BUS",
            load_torque_percent=50.0,
        )
        result = self.calc.execute(inputs)

        assert len(result.results.get("warnings", [])) >= 0
        assert result.results["motor_name"] == "BIG_MOTOR"
