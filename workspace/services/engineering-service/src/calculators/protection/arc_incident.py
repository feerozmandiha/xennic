"""
ARC-001: Incident Energy (Arc Flash) — IEEE 1584-2018 / NFPA 70E-2021

Standards:
  IEEE 1584-2018  — Guide for Performing Arc-Flash Hazard Calculations
  NFPA 70E-2021   — Standard for Electrical Safety in the Workplace

Calculations:
  1. Arcing current (IEEE 1584-2018 eq. 1)
  2. Normalized incident energy (eq. 3)
  3. Incident energy at working distance (cal/cm², J/cm²)
  4. Arc flash boundary (AFB)
  5. PPE category per NFPA 70E
  6. Hazard risk classification
"""

import math
import logging
from typing import Dict, Any, Tuple

from pydantic import BaseModel, Field
from src.core.base_calculator import BaseCalculator
from src.core.base_calculator import CalculationInput


PPE_CATEGORIES: Dict[int, Dict[str, Any]] = {
    0:  {"cal_cm2_max": 1.2,   "label": "Cat 0", "hazard": "Minimal",         "ppe": "FR shirt + pants"},
    1:  {"cal_cm2_max": 4.0,   "label": "Cat 1", "hazard": "Low",             "ppe": "FR 4 cal/cm²"},
    2:  {"cal_cm2_max": 8.0,   "label": "Cat 2", "hazard": "Moderate",        "ppe": "FR 8 cal/cm² + face shield"},
    3:  {"cal_cm2_max": 25.0,  "label": "Cat 3", "hazard": "High",            "ppe": "FR 25 cal/cm² + hood"},
    4:  {"cal_cm2_max": 40.0,  "label": "Cat 4", "hazard": "Very High",       "ppe": "FR 40 cal/cm² + full kit"},
    99: {"cal_cm2_max": 9999,  "label": "Danger", "hazard": "Extreme",        "ppe": "DE-ENERGIZE — work prohibited"},
}


class ArcIncidentInput(CalculationInput):
    system_voltage_kv: float = Field(
        ..., gt=0, le=1000,
        description="System nominal voltage (kV)",
        example=0.4,
    )
    bolted_fault_ka: float = Field(
        ..., gt=0,
        description="Bolted three-phase fault current (kA)",
        example=25.0,
    )
    gap_mm: float = Field(
        default=32.0, gt=0, le=500,
        description="Conductor gap distance (mm). Typical: 13mm LV, 32-104mm MV",
        example=32.0,
    )
    working_distance_mm: float = Field(
        default=457.0, gt=0, le=10000,
        description="Working distance from arc source (mm). 457mm LV, 914mm HV typical",
        example=457.0,
    )
    clearing_time_s: float = Field(
        default=0.1, gt=0, le=10,
        description="Arc clearing time (s). Typically 0.1-0.2s for LV breakers",
        example=0.1,
    )
    enclosure_type: str = Field(
        default="enclosed",
        description="Enclosure type: enclosed | open_air | cable_box | switchgear | MCC",
        example="enclosed",
    )
    electrode_config: str = Field(
        default="VCB",
        description="Electrode configuration per IEEE 1584: VCB | VCBB | HCB | HOA | VOA | BBF | BBFT",
        example="VCB",
    )
    system_freq_hz: float = Field(
        default=50.0, ge=50, le=60,
        description="System frequency (Hz)",
        example=50.0,
    )


class ArcIncidentOutput(BaseModel):
    system_voltage_kv: float = Field(..., description="System voltage (kV)")
    bolted_fault_ka: float = Field(..., description="Bolted fault current (kA)")
    arcing_current_ka: float = Field(..., description="Computed arcing current (kA)")
    clearing_time_s: float = Field(..., description="Arc clearing time (s)")
    gap_mm: float = Field(..., description="Conductor gap (mm)")
    enclosure_type: str = Field(..., description="Enclosure type")
    incident_energy_cal_cm2: float = Field(..., description="Incident energy (cal/cm²)")
    incident_energy_j_cm2: float = Field(..., description="Incident energy (J/cm²)")
    arc_flash_boundary_m: float = Field(..., description="Arc flash boundary distance (m)")
    working_distance_mm: float = Field(..., description="Working distance (mm)")
    hazard_risk_category: int = Field(..., description="Hazard risk category (0-4, 99=danger)")
    hazard_risk_label: str = Field(..., description="HRC label")
    hazard_level: str = Field(..., description="Hazard description")
    required_ppe: str = Field(..., description="Required PPE description")
    limited_approach_m: float = Field(..., description="Limited approach boundary (m)")
    restricted_approach_m: float = Field(..., description="Restricted approach boundary (m)")
    fusing_energy_a2s: float = Field(..., description="Estimated fuse I²t (A²s)")
    recommendation_notes: list[str] = Field(default_factory=list, description="Safety recommendations")
    standard_reference: str = Field(default="IEEE 1584-2018 / NFPA 70E-2021", description="Applicable standard")


class ArcIncidentCalculator(BaseCalculator[ArcIncidentInput]):
    """
    ARC-001: Incident Energy (Arc Flash) — IEEE 1584-2018
    """

    CALCULATION_CODE = "ARC-001"
    CALCULATION_NAME = "Incident Energy (Arc Flash)"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEEE 1584-2018 / NFPA 70E-2021"
    STANDARD_VERSION = "2018"
    ENGINE_VERSION   = "0.1.0"

    def get_units(self) -> Dict[str, str]:
        return {
            "incident_energy_cal_cm2":  "cal/cm²",
            "incident_energy_j_cm2":    "J/cm²",
            "arc_flash_boundary_m":     "m",
            "arcing_current_ka":        "kA",
            "fusing_energy_a2s":        "A²s",
        }

    def validate_inputs(self, inputs: ArcIncidentInput) -> bool:
        if inputs.system_voltage_kv <= 0:
            raise ValueError("System voltage must be positive")
        if inputs.bolted_fault_ka <= 0:
            raise ValueError("Bolted fault current must be positive")
        if inputs.clearing_time_s <= 0:
            raise ValueError("Clearing time must be positive")
        return True

    def _arc_current_coeffs(self, config: str, v_kv: float) -> Tuple[float, ...]:
        if v_kv <= 1.0:
            return -0.153, 0.931, 1.091, -0.682
        elif v_kv <= 15.0:
            return -0.083, 1.037, 0.840, -0.562
        else:
            return -0.100, 1.040, 0.780, -0.500

    def _energy_coeffs(self, config: str, v_kv: float) -> Tuple[float, ...]:
        if v_kv <= 1.0:
            return -0.792, 1.494, 0.900
        elif v_kv <= 15.0:
            return -0.555, 1.318, 0.760
        else:
            return -0.400, 1.200, 0.650

    def _ppe_category(self, e_cal: float) -> int:
        if e_cal <= 1.2:
            return 0
        elif e_cal <= 4.0:
            return 1
        elif e_cal <= 8.0:
            return 2
        elif e_cal <= 25.0:
            return 3
        elif e_cal <= 40.0:
            return 4
        return 99

    def _calculate(self, inputs: ArcIncidentInput) -> Dict[str, Any]:
        p = inputs

        v_kv = p.system_voltage_kv
        ibf = p.bolted_fault_ka
        gap = p.gap_mm
        d_mm = p.working_distance_mm
        t = p.clearing_time_s

        # ── Arc current (IEEE 1584-2018 eq. 1) ────────────────────────────
        K, A, B, C = self._arc_current_coeffs(p.electrode_config, v_kv)
        log_ia = K + A * math.log10(ibf) + B * math.log10(v_kv) + C * math.log10(gap)
        ia = 10 ** log_ia

        # ── Normalized energy (eq. 3) ─────────────────────────────────────
        k1, k2, k3 = self._energy_coeffs(p.electrode_config, v_kv)
        log_en = k1 + k2 * math.log10(ia) + k3 * math.log10(gap)
        en = 10 ** log_en

        # ── Incident energy at working distance ───────────────────────────
        cf = 1.0
        if p.enclosure_type in ("enclosed", "switchgear", "MCC", "panel"):
            cf = 1.5
        x_exp = 1.5
        e_jcm2 = cf * en * (t / 0.2) * ((610.0 / d_mm) ** x_exp)
        e_cal = e_jcm2 / 4.184

        # ── Arc flash boundary (AFB) ──────────────────────────────────────
        e_threshold_jcm2 = 1.2 * 4.184
        afb_mm = 610.0 * ((cf * en * t / 0.2) / e_threshold_jcm2) ** (1 / x_exp)
        afb_m = afb_mm / 1000

        # ── Approach boundaries ───────────────────────────────────────────
        lab_m = afb_m * 3.0
        rab_m = afb_m * 0.5

        # ── PPE category ──────────────────────────────────────────────────
        hrc = self._ppe_category(e_cal)
        ppe_info = PPE_CATEGORIES.get(hrc, PPE_CATEGORIES[99])

        # ── Fusing energy ─────────────────────────────────────────────────
        fusing_a2s = (ia * 1000) ** 2 * t

        # ── Recommendations ───────────────────────────────────────────────
        recs = []
        if hrc >= 4:
            recs.append("DANGER: De-energize before work — incident energy exceeds 40 cal/cm²")
        elif hrc >= 3:
            recs.append(f"High incident energy ({e_cal:.1f} cal/cm²) — reduce clearing time if possible")
        if t > 0.3:
            recs.append(f"Clearing time {t:.2f}s is long — reducing to 0.1s lowers energy to {e_cal * (0.1/t):.1f} cal/cm²")
        if afb_m > 3.0:
            recs.append(f"Arc flash boundary is {afb_m:.1f}m — post warning signs and restrict access")
        recs.append(f"Required PPE: {ppe_info['ppe']}")

        return {
            "system_voltage_kv":        v_kv,
            "bolted_fault_ka":          ibf,
            "arcing_current_ka":        round(ia, 3),
            "clearing_time_s":          t,
            "gap_mm":                   gap,
            "enclosure_type":           p.enclosure_type,
            "electrode_config":         p.electrode_config,
            "working_distance_mm":      d_mm,
            "incident_energy_cal_cm2":  round(e_cal, 2),
            "incident_energy_j_cm2":    round(e_jcm2, 2),
            "arc_flash_boundary_m":     round(afb_m, 2),
            "limited_approach_m":       round(lab_m, 2),
            "restricted_approach_m":    round(rab_m, 2),
            "hazard_risk_category":     hrc,
            "hazard_risk_label":        ppe_info["label"],
            "hazard_level":             ppe_info["hazard"],
            "required_ppe":             ppe_info["ppe"],
            "fusing_energy_a2s":        round(fusing_a2s, 0),
            "recommendation_notes":     recs,
            "standards": {
                "energy_calc":  "IEEE 1584-2018",
                "ppe_table":    "NFPA 70E-2021 Table 130.5(G)",
                "threshold":    "1.2 cal/cm² = onset of 2nd degree burn",
            },
        }
