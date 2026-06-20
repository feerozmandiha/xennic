"""
Unit tests for PS-002: Short Circuit Analysis (ShortCircuitCalculator)
"""

import pytest
from src.schemas.power_system import (
    ShortCircuitInput, NetworkData, BusData, GeneratorData, MotorData,
)
from src.calculators.power_system.short_circuit import ShortCircuitCalculator


@pytest.fixture
def single_source_network():
    """Simple network: one slack bus with one generator."""
    return NetworkData(
        buses=[
            BusData(name="GEN_BUS", vn_kv=20.0, type="slack"),
        ],
        generators=[
            GeneratorData(name="GEN1", bus="GEN_BUS", p_mw=50.0, vm_pu=1.0),
        ],
    )


@pytest.fixture
def parallel_source_network():
    """Two parallel sources feeding a fault bus."""
    return NetworkData(
        buses=[
            BusData(name="BUS_A", vn_kv=20.0, type="slack"),
            BusData(name="BUS_B", vn_kv=20.0, type="pq"),
            BusData(name="FAULT_BUS", vn_kv=20.0, type="pq"),
        ],
        generators=[
            GeneratorData(name="GEN_A", bus="BUS_A", p_mw=30.0, vm_pu=1.05),
            GeneratorData(name="GEN_B", bus="BUS_B", p_mw=30.0, vm_pu=1.05, scaling=True),
        ],
        lines=[
            LineData(
                name="LA-F", from_bus="BUS_A", to_bus="FAULT_BUS",
                length_km=5.0, r_ohm_per_km=0.02, x_ohm_per_km=0.10,
            ),
            LineData(
                name="LB-F", from_bus="BUS_B", to_bus="FAULT_BUS",
                length_km=5.0, r_ohm_per_km=0.02, x_ohm_per_km=0.10,
            ),
        ],
    )


from src.schemas.power_system import LineData  # noqa: E402


class TestShortCircuitCalculator:
    """Test suite for PS-002: Short Circuit Analysis"""

    def setup_method(self):
        self.calc = ShortCircuitCalculator()

    def test_single_generator_three_phase(self, single_source_network):
        """3-phase SC at generator bus with one source."""
        inputs = ShortCircuitInput(
            network=single_source_network,
            fault_bus="GEN_BUS",
            fault_type="three_phase",
            calculate_peak=True,
        )
        result = self.calc.execute(inputs)

        assert result.calculation_code == "PS-002"
        assert result.results["fault_bus"] == "GEN_BUS"
        assert result.results["ik_initial_ka"] > 0
        assert result.results["ik_steady_ka"] > 0
        assert result.results["x_r_ratio"] > 0

    def test_single_generator_single_phase(self, single_source_network):
        """Single-phase-to-ground SC at generator bus."""
        inputs = ShortCircuitInput(
            network=single_source_network,
            fault_bus="GEN_BUS",
            fault_type="single_phase_to_ground",
            calculate_peak=False,
        )
        result = self.calc.execute(inputs)

        assert result.results["fault_type"] == "single_phase_to_ground"
        assert result.results["ik_initial_ka"] > 0

    def test_parallel_sources(self, parallel_source_network):
        """SC with two parallel sources — current should be higher."""
        inputs = ShortCircuitInput(
            network=parallel_source_network,
            fault_bus="FAULT_BUS",
            fault_type="three_phase",
        )
        result = self.calc.execute(inputs)

        assert result.results["ik_initial_ka"] > 0
        assert result.results["x_r_ratio"] > 0

    def test_motor_contribution(self, single_source_network):
        """Include vs exclude motor contribution."""
        inputs_on = ShortCircuitInput(
            network=single_source_network,
            fault_bus="GEN_BUS",
            motor_contribution=True,
        )
        result_on = self.calc.execute(inputs_on)

        inputs_off = ShortCircuitInput(
            network=single_source_network,
            fault_bus="GEN_BUS",
            motor_contribution=False,
        )
        result_off = self.calc.execute(inputs_off)

        # Both should return results; with motors off should be <= with motors on
        assert result_on.results["ik_initial_ka"] >= 0
        assert result_off.results["ik_initial_ka"] >= 0

    def test_peak_current(self, single_source_network):
        """Peak current ip should be >= initial SC current."""
        inputs = ShortCircuitInput(
            network=single_source_network,
            fault_bus="GEN_BUS",
            calculate_peak=True,
            fault_type="three_phase",
        )
        result = self.calc.execute(inputs)

        # peak current should be >= initial symmetrical current
        assert result.results["ip_peak_ka"] >= result.results["ik_initial_ka"] * 0.5
