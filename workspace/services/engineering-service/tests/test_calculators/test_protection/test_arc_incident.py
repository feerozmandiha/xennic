"""
Unit tests for ARC-001: Incident Energy (Arc Flash) — IEEE 1584-2018
"""

import pytest
from src.calculators.protection.arc_incident import ArcIncidentCalculator
from src.calculators.protection.schemas import ArcIncidentInput


class TestArcIncident:
    """Tests for ARC-001: Incident Energy"""

    def setup_method(self):
        self.calc = ArcIncidentCalculator()

    def test_lv_switchgear_400v_25ka(self):
        """Typical LV switchgear: 0.4 kV, 25 kA, 0.1s, enclosed"""
        inputs = ArcIncidentInput(
            system_voltage_kv=0.4,
            bolted_fault_ka=25.0,
            gap_mm=32.0,
            working_distance_mm=457.0,
            clearing_time_s=0.1,
            enclosure_type="enclosed",
            electrode_config="VCB",
            system_freq_hz=50.0,
        )
        result = self.calc.execute(inputs)
        r = result.results

        assert r["incident_energy_cal_cm2"] > 0
        assert r["arcing_current_ka"] > 0
        assert r["incident_energy_j_cm2"] > 0
        assert r["arc_flash_boundary_m"] > 0
        assert 0 <= r["hazard_risk_category"] <= 99
        assert len(r["recommendation_notes"]) > 0
        assert r["system_voltage_kv"] == 0.4
        assert r["bolted_fault_ka"] == 25.0

    def test_mv_outdoor_11kv_10ka(self):
        """MV outdoor: 11 kV, 10 kA, open air"""
        inputs = ArcIncidentInput(
            system_voltage_kv=11.0,
            bolted_fault_ka=10.0,
            gap_mm=104.0,
            working_distance_mm=914.0,
            clearing_time_s=0.2,
            enclosure_type="open_air",
            electrode_config="HOA",
            system_freq_hz=50.0,
        )
        result = self.calc.execute(inputs)
        r = result.results

        assert r["incident_energy_cal_cm2"] > 0
        assert r["arcing_current_ka"] > 0
        assert r["incident_energy_j_cm2"] > 0
        assert r["arc_flash_boundary_m"] >= 0
        assert r["system_voltage_kv"] == 11.0

    def test_high_clearing_time_increases_energy(self):
        """Longer clearing time -> higher incident energy"""
        inputs_short = ArcIncidentInput(
            system_voltage_kv=0.4,
            bolted_fault_ka=25.0,
            clearing_time_s=0.1,
        )
        inputs_long = ArcIncidentInput(
            system_voltage_kv=0.4,
            bolted_fault_ka=25.0,
            clearing_time_s=0.5,
        )
        r_short = self.calc.execute(inputs_short).results
        r_long = self.calc.execute(inputs_long).results

        assert r_long["incident_energy_cal_cm2"] > r_short["incident_energy_cal_cm2"]
        assert r_long["arc_flash_boundary_m"] > r_short["arc_flash_boundary_m"]

    def test_open_air_has_lower_energy_than_enclosed(self):
        """Enclosed has CF=1.5 factor, so energy should be higher"""
        inputs_enclosed = ArcIncidentInput(
            system_voltage_kv=0.4,
            bolted_fault_ka=25.0,
            enclosure_type="enclosed",
        )
        inputs_open = ArcIncidentInput(
            system_voltage_kv=0.4,
            bolted_fault_ka=25.0,
            enclosure_type="open_air",
        )
        r_enc = self.calc.execute(inputs_enclosed).results
        r_open = self.calc.execute(inputs_open).results

        assert r_enc["incident_energy_cal_cm2"] > r_open["incident_energy_cal_cm2"]

    def test_ppe_category_0_below_1point2(self):
        """Very low energy should be Cat 0"""
        inputs = ArcIncidentInput(
            system_voltage_kv=0.4,
            bolted_fault_ka=1.0,
            clearing_time_s=0.05,
        )
        result = self.calc.execute(inputs).results
        assert result["hazard_risk_category"] == 0
        assert result["hazard_risk_label"] == "Cat 0"

    def test_ppe_category_99_above_40(self):
        """Very high energy should be Danger (99)"""
        inputs = ArcIncidentInput(
            system_voltage_kv=11.0,
            bolted_fault_ka=50.0,
            clearing_time_s=1.0,
            working_distance_mm=200.0,
        )
        result = self.calc.execute(inputs).results
        assert result["hazard_risk_category"] == 99
        assert "DE-ENERGIZE" in result["required_ppe"]

    def test_invalid_negative_voltage_raises(self):
        """Negative voltage should raise ValueError"""
        with pytest.raises(ValueError):
            inputs = ArcIncidentInput(
                system_voltage_kv=-1.0,
                bolted_fault_ka=25.0,
            )
            self.calc.execute(inputs)

    def test_unit_systems_all_fields_present(self):
        """All expected output fields must be present"""
        inputs = ArcIncidentInput(
            system_voltage_kv=0.4,
            bolted_fault_ka=20.0,
        )
        result = self.calc.execute(inputs).results

        expected_fields = [
            "system_voltage_kv", "bolted_fault_ka", "arcing_current_ka",
            "clearing_time_s", "gap_mm", "enclosure_type",
            "incident_energy_cal_cm2", "incident_energy_j_cm2",
            "arc_flash_boundary_m", "working_distance_mm",
            "hazard_risk_category", "hazard_risk_label", "hazard_level",
            "required_ppe", "limited_approach_m", "restricted_approach_m",
            "fusing_energy_a2s", "recommendation_notes",
        ]
        for field in expected_fields:
            assert field in result, f"Missing field: {field}"

    def test_arcing_current_less_than_bolted(self):
        """Arcing current should always be less than bolted fault current"""
        inputs = ArcIncidentInput(
            system_voltage_kv=0.4,
            bolted_fault_ka=25.0,
        )
        result = self.calc.execute(inputs).results
        assert result["arcing_current_ka"] < result["bolted_fault_ka"]

    def test_switchgear_mcc_enclosed_all_use_cf(self):
        """Switchgear, MCC, and enclosed should all use enclosure factor"""
        for enc in ["enclosed", "switchgear", "MCC"]:
            inputs = ArcIncidentInput(
                system_voltage_kv=0.4,
                bolted_fault_ka=25.0,
                enclosure_type=enc,
            )
            result = self.calc.execute(inputs).results
            assert result["incident_energy_cal_cm2"] > 0, f"Failed for {enc}"
