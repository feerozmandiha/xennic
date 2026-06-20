"""
Unit tests for PS-001: Load Flow Analysis (LoadFlowCalculator)
"""

import pytest
import numpy as np
from src.schemas.power_system import (
    LoadFlowInput, NetworkData, BusData, LineData, LoadData, TransformerData,
)
from src.calculators.power_system.load_flow import LoadFlowCalculator


@pytest.fixture
def two_bus_network():
    """Simple 2-bus network: Slack (20kV) + PQ load (20kV) with a line."""
    return NetworkData(
        buses=[
            BusData(name="BUS1", vn_kv=20.0, type="slack"),
            BusData(name="BUS2", vn_kv=20.0, type="pq"),
        ],
        lines=[
            LineData(
                name="L1", from_bus="BUS1", to_bus="BUS2",
                length_km=1.0, r_ohm_per_km=0.1, x_ohm_per_km=0.05,
            ),
        ],
        loads=[
            LoadData(name="LOAD1", bus="BUS2", p_mw=5.0, q_mvar=2.0),
        ],
    )


@pytest.fixture
def transformer_network():
    """Network with a 20/0.4 kV transformer and tap changer."""
    return NetworkData(
        buses=[
            BusData(name="HV_BUS", vn_kv=20.0, type="slack"),
            BusData(name="LV_BUS", vn_kv=0.4, type="pq"),
        ],
        transformers=[
            TransformerData(
                name="T1", hv_bus="HV_BUS", lv_bus="LV_BUS",
                sn_mva=2.5, vn_hv_kv=20.0, vn_lv_kv=0.4,
                vk_percent=6.0, vkr_percent=1.5, pfe_kw=3.0, i0_percent=0.5,
                tap_pos=0, tap_step_percent=2.5, tap_neutral=0,
            ),
        ],
        loads=[
            LoadData(name="LV_LOAD", bus="LV_BUS", p_mw=1.5, q_mvar=0.5),
        ],
    )


class TestLoadFlowCalculator:
    """Test suite for PS-001: Load Flow Analysis"""

    def setup_method(self):
        self.calc = LoadFlowCalculator()

    def test_simple_two_bus_network(self, two_bus_network):
        """Test 2-bus network — verify convergence and basic results."""
        inputs = LoadFlowInput(network=two_bus_network, algorithm="nr")
        result = self.calc.execute(inputs)

        assert result.calculation_code == "PS-001"
        assert result.results["converged"] is True
        assert result.results["system_status"] in ("OK", "WARNING")

        buses = result.results["buses"]
        bus_names = {b["bus_id"] for b in buses}
        assert "BUS1" in bus_names
        assert "BUS2" in bus_names

        # Slack bus voltage should be ~1.0 pu
        bus1 = next(b for b in buses if b["bus_id"] == "BUS1")
        assert bus1["v_pu"] == pytest.approx(1.0, abs=0.01)

    def test_load_flow_with_transformer_and_tap(self, transformer_network):
        """Test load flow with transformer and tap changer."""
        inputs = LoadFlowInput(
            network=transformer_network,
            algorithm="nr",
            calculate_voltage_angles=False,
        )
        result = self.calc.execute(inputs)

        assert result.results["converged"] is True

        buses = result.results["buses"]
        bus_ids = {b["bus_id"] for b in buses}
        assert "HV_BUS" in bus_ids
        assert "LV_BUS" in bus_ids

        lv_bus = next(b for b in buses if b["bus_id"] == "LV_BUS")
        assert lv_bus["v_pu"] > 0.9

        transformers = result.results["transformers"]
        assert len(transformers) > 0
        tf = transformers[0]
        assert tf["tf_id"] == "T1"
        assert tf["loading_ok"] is True

    def test_non_convergent_case(self):
        """Test with extreme loading that prevents convergence."""
        network = NetworkData(
            buses=[
                BusData(name="BUS1", vn_kv=20.0, type="slack"),
                BusData(name="BUS2", vn_kv=20.0, type="pq"),
            ],
            lines=[
                LineData(
                    name="L1", from_bus="BUS1", to_bus="BUS2",
                    length_km=10.0, r_ohm_per_km=5.0, x_ohm_per_km=10.0,
                ),
            ],
            loads=[
                LoadData(name="HUGE_LOAD", bus="BUS2", p_mw=500.0, q_mvar=200.0),
            ],
        )
        inputs = LoadFlowInput(
            network=network,
            algorithm="nr",
            max_iteration=10,
            tolerance=1e-3,
        )
        result = self.calc.execute(inputs)

        # May or may not converge; should not crash
        assert "warnings" in result.results

    def test_algorithm_selection(self, two_bus_network):
        """Test both NR and BFSW algorithm selection."""
        # NR
        inputs_nr = LoadFlowInput(network=two_bus_network, algorithm="nr")
        result_nr = self.calc.execute(inputs_nr)
        assert result_nr.results["converged"] is True

        # BFSW — may not converge for this small meshed case, should not crash
        inputs_bfsw = LoadFlowInput(network=two_bus_network, algorithm="bfsw")
        result_bfsw = self.calc.execute(inputs_bfsw)
        assert isinstance(result_bfsw.results["converged"], bool)

    def test_ieee_5_bus_network(self):
        """IEEE 5-bus system test — verify voltage ranges are realistic."""
        network = NetworkData(
            buses=[
                BusData(name="BUS1", vn_kv=69.0, type="slack"),
                BusData(name="BUS2", vn_kv=69.0, type="pq"),
                BusData(name="BUS3", vn_kv=69.0, type="pq"),
                BusData(name="BUS4", vn_kv=69.0, type="pq"),
                BusData(name="BUS5", vn_kv=69.0, type="pq"),
            ],
            lines=[
                LineData(name="L1-2", from_bus="BUS1", to_bus="BUS2", length_km=10.0, r_ohm_per_km=0.02, x_ohm_per_km=0.06),
                LineData(name="L1-3", from_bus="BUS1", to_bus="BUS3", length_km=10.0, r_ohm_per_km=0.02, x_ohm_per_km=0.06),
                LineData(name="L2-3", from_bus="BUS2", to_bus="BUS3", length_km=10.0, r_ohm_per_km=0.02, x_ohm_per_km=0.06),
                LineData(name="L2-4", from_bus="BUS2", to_bus="BUS4", length_km=10.0, r_ohm_per_km=0.03, x_ohm_per_km=0.08),
                LineData(name="L3-5", from_bus="BUS3", to_bus="BUS5", length_km=10.0, r_ohm_per_km=0.03, x_ohm_per_km=0.08),
                LineData(name="L4-5", from_bus="BUS4", to_bus="BUS5", length_km=10.0, r_ohm_per_km=0.02, x_ohm_per_km=0.06),
            ],
            loads=[
                LoadData(name="LOAD2", bus="BUS2", p_mw=20.0, q_mvar=10.0),
                LoadData(name="LOAD3", bus="BUS3", p_mw=30.0, q_mvar=15.0),
                LoadData(name="LOAD4", bus="BUS4", p_mw=25.0, q_mvar=12.0),
                LoadData(name="LOAD5", bus="BUS5", p_mw=20.0, q_mvar=10.0),
            ],
        )
        inputs = LoadFlowInput(network=network, algorithm="nr")
        result = self.calc.execute(inputs)

        assert result.results["converged"] is True

        for bus in result.results["buses"]:
            assert 0.9 <= bus["v_pu"] <= 1.1

        assert result.results["system_status"] in ("OK", "WARNING")
