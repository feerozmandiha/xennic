"""
HARM-001: Advanced Harmonic Analysis with Inter-harmonics & Active Filter dq Control

Covers:
  1. THD including inter-harmonics (IEC 61000-4-7)
  2. Active filter current sizing with dq control parameter estimation
  3. LCL / L output filter design for APF
  4. Compensation current spectrum analysis

Key formulas:
  - THD_with_interharmonics = sqrt(Σ(I_h²) + Σ(I_ih²)) / I_1 × 100%
  - I_comp = sqrt(I_total_harmonic² - I_target²)
  - V_dc_min = 2 × sqrt(2) × V_ll / sqrt(3)  (for APF)
  - LCL filter: L1 = V_dc / (8 × f_sw × ΔI_ripple_max)
               Cf = 5% of base capacitance
               L2 = 0.5 × L1 (typical)
"""

import math
from typing import Dict, List, Any, Tuple
from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from .schemas import AdvancedHarmonicInput


class AdvancedHarmonicCalculator(BaseCalculator[AdvancedHarmonicInput]):
    """
    HARM-001: Advanced Harmonic Analysis & Active Filter Design with dq Control
    """

    CALCULATION_CODE = "HARM-001"
    CALCULATION_NAME = "Advanced Harmonic Analysis & Active Filter Design"
    FORMULA_VERSION  = "1.0"
    STANDARD         = "IEC 61000-4-7 / IEEE 519-2022"
    STANDARD_VERSION = "2022"
    ENGINE_VERSION   = "0.1.0"

    _STANDARD_APF_RATINGS = [30, 50, 75, 100, 150, 200, 300, 400, 600, 800, 1000]

    def validate_inputs(self, inputs: AdvancedHarmonicInput) -> bool:
        ValidationEngine.validate_positive(inputs.fundamental_current_a, "fundamental_current_a")
        ValidationEngine.validate_positive(inputs.system_voltage_v, "system_voltage_v")
        return True

    def _calculate(self, inputs: AdvancedHarmonicInput) -> Dict[str, Any]:
        f1 = inputs.fundamental_freq_hz
        v_ll = inputs.system_voltage_v
        i1 = inputs.fundamental_current_a
        harmonics = inputs.harmonic_spectrum
        interharmonics = inputs.interharmonic_spectrum
        target_thd = inputs.target_thd_percent / 100.0
        f_sw = inputs.switching_frequency_hz
        topology = inputs.filter_topology
        bw_dq = inputs.dq_bandwidth_hz
        max_order = inputs.max_compensation_order

        # ── 1. THD including inter-harmonics ──────────────────────────────────
        sum_h_sq = sum(mag ** 2 for mag in harmonics.values())
        sum_ih_sq = sum(mag ** 2 for mag in interharmonics.values())
        total_harmonic_sq = sum_h_sq + sum_ih_sq

        thd_no_inter = (math.sqrt(sum_h_sq) / 100.0) * 100.0 if i1 > 0 else 0.0
        inter_thd = (math.sqrt(sum_ih_sq) / 100.0) * 100.0 if i1 > 0 else 0.0
        total_thd = math.sqrt(thd_no_inter ** 2 + inter_thd ** 2)

        total_harmonic_rms_a = (math.sqrt(total_harmonic_sq) / 100.0) * i1

        # ── 2. Dominant inter-harmonic identification ────────────────────────
        dominant_inter: List[Dict[str, float]] = []
        sorted_ih = sorted(interharmonics.items(), key=lambda x: x[1], reverse=True)
        dominant_inter = [
            {"frequency_hz": round(f, 1), "magnitude_pct": round(m, 3),
             "equivalent_order": round(f / f1, 2)}
            for f, m in sorted_ih[:5] if m > 1.0
        ]

        # ── 3. Compensating current ──────────────────────────────────────────
        target_harmonic_rms_a = target_thd * i1
        if total_harmonic_rms_a <= target_harmonic_rms_a:
            compensating_current_a = 0.0
            already_compliant = True
            required_rating_a = 0
            apf_kva = 0.0
        else:
            compensating_current_a = math.sqrt(
                max(0.0, total_harmonic_rms_a ** 2 - target_harmonic_rms_a ** 2)
            )
            comp_with_margin = compensating_current_a * 1.15
            for r in self._STANDARD_APF_RATINGS:
                if r >= comp_with_margin:
                    required_rating_a = r
                    break
            else:
                required_rating_a = self._STANDARD_APF_RATINGS[-1]
            v_ln = v_ll / math.sqrt(3)
            apf_kva = (v_ln * required_rating_a * 3) / 1000.0
            already_compliant = False

        # ── 4. DC bus voltage estimation ──────────────────────────────────────
        v_dc_min = 2.0 * math.sqrt(2.0) * v_ll / math.sqrt(3)
        v_dc_input = inputs.dc_bus_voltage_v or v_dc_min * 1.1
        dc_utilization = (v_dc_min / v_dc_input) * 100.0 if v_dc_input > 0 else 0.0

        # ── 5. LCL filter design ─────────────────────────────────────────────
        z_base = (v_ll / math.sqrt(3)) ** 2 / (i1 * v_ll / math.sqrt(3))
        c_base = 1.0 / (2.0 * math.pi * f1 * z_base)
        c_filter = 0.05 * c_base  # 5% of base capacitance
        l1_total_h = v_dc_input / (8.0 * f_sw * 0.3 * required_rating_a) if required_rating_a > 0 else 1e-6
        l2_h = 0.5 * l1_total_h if topology == "LCL" else 0.0
        l_filter = l1_total_h if topology == "L" else l1_total_h + l2_h

        r_damping = 1.0 / (3.0 * 2.0 * math.pi * f1 * c_filter) if c_filter > 0 else 0.0

        # Resonant frequency of LCL filter
        if topology == "LCL" and l1_total_h > 0 and l2_h > 0 and c_filter > 0:
            l_eq = (l1_total_h * l2_h) / (l1_total_h + l2_h)
            f_res = 1.0 / (2.0 * math.pi * math.sqrt(l_eq * c_filter)) if l_eq > 0 and c_filter > 0 else 0.0
        else:
            f_res = 0.0

        # ── 6. dq current control parameters ─────────────────────────────────
        # PI controller gains: Kp = L × bw, Ki = R × bw (simplified)
        R_est = 0.01 * z_base  # estimated resistance (1% of base impedance)
        L_est = l_filter
        Kp = L_est * 2.0 * math.pi * bw_dq
        Ki = R_est * 2.0 * math.pi * bw_dq

        # ── 7. Compensation spectrum analysis ────────────────────────────────
        in_bandwidth: List[Dict[str, Any]] = []
        out_of_bandwidth: List[Dict[str, Any]] = []
        for order, mag in sorted(harmonics.items()):
            entry = {"order": order, "magnitude_pct": round(mag, 3)}
            if order <= max_order:
                in_bandwidth.append(entry)
            else:
                out_of_bandwidth.append(entry)

        for freq, mag in sorted(interharmonics.items()):
            equiv_order = freq / f1
            entry = {"frequency_hz": round(freq, 1), "magnitude_pct": round(mag, 3), "equivalent_order": round(equiv_order, 2)}
            if equiv_order <= max_order:
                in_bandwidth.append(entry)
            else:
                out_of_bandwidth.append(entry)

        # Achievable THD (only out-of-bandwidth components remain)
        out_sq = sum(e["magnitude_pct"] ** 2 for e in out_of_bandwidth)
        achievable_thd_pct = math.sqrt(out_sq) if out_sq > 0 else 0.0

        # ── 8. Warnings & Recommendations ────────────────────────────────────
        warnings: List[str] = []
        recommendations: List[str] = []

        if interharmonics and inter_thd > 5.0:
            warnings.append(
                f"Significant inter-harmonic content ({inter_thd:.2f}% THD) — "
                "standard APFs may not fully compensate non-integer frequencies"
            )
            recommendations.append(
                "Consider advanced APF with wide-bandwidth dq control or "
                "adaptive filtering algorithm for inter-harmonic compensation"
            )

        if v_dc_input < v_dc_min:
            warnings.append(
                f"DC bus voltage ({v_dc_input:.0f}V) insufficient for {v_ll:.0f}V system. "
                f"Minimum required: {v_dc_min:.0f}V"
            )

        if dc_utilization > 95.0:
            warnings.append(
                f"DC bus utilization at {dc_utilization:.0f}% — "
                "limited overmodulation margin. Increase Vdc."
            )

        if topology == "L" and f_res > 0 and (f_res / f1) < 10:
            warnings.append(
                f"L filter resonant frequency ({f_res:.0f} Hz, order {f_res/f1:.1f}) "
                "may cause amplification near switching harmonics"
            )

        if already_compliant:
            recommendations.append(
                f"System already below target THD {inputs.target_thd_percent}% — "
                "no active filter required"
            )
        else:
            recommendations.append(
                f"Install APF rated ≥ {required_rating_a} A ({apf_kva:.1f} kVA, 3-phase) "
                f"with DC bus ≥ {v_dc_min:.0f}V and {topology} output filter"
            )

        if out_of_bandwidth:
            warnings.append(
                f"Components at {len(out_of_bandwidth)} orders/frequencies exceed "
                f"APF bandwidth (limit = order {max_order}) — will NOT be compensated"
            )
            if achievable_thd_pct > inputs.target_thd_percent:
                warnings.append(
                    f"Achievable THD {achievable_thd_pct:.2f}% still exceeds "
                    f"target {inputs.target_thd_percent}% — increase APF bandwidth "
                    "or add passive filter for high-order harmonics"
                )

        recommendations.append(
            "dq synchronous reference frame control with PI compensators "
            "for zero steady-state error at selected harmonics"
        )
        if bw_dq >= 500:
            recommendations.append(
                f"Selective harmonic elimination (SHE) PWM recommended at {f_sw/1000:.0f} kHz "
                "for lowest switching losses"
            )

        # ── Return results ───────────────────────────────────────────────────
        return {
            "total_thd_percent": round(total_thd, 3),
            "thd_without_interharmonics_percent": round(thd_no_inter, 3),
            "interharmonic_thd_percent": round(inter_thd, 3),
            "total_harmonic_rms_a": round(total_harmonic_rms_a, 3),
            "fundamental_current_a": i1,
            "target_thd_percent": inputs.target_thd_percent,
            "achievable_thd_percent": round(achievable_thd_pct, 3),
            "dominant_interharmonics": dominant_inter,
            "compensating_current_a": round(compensating_current_a, 3),
            "required_apf_current_a": required_rating_a,
            "apf_kva_3phase": round(apf_kva, 2),
            "safety_margin_percent": 15,
            "dc_bus_voltage_min_v": round(v_dc_min, 0),
            "dc_bus_voltage_selected_v": round(v_dc_input, 0),
            "dc_bus_utilization_percent": round(dc_utilization, 1),
            "filter_topology": topology,
            "l1_inductance_mh": round(l1_total_h * 1000, 3),
            "l2_inductance_mh": round(l2_h * 1000, 3),
            "total_inductance_mh": round(l_filter * 1000, 3),
            "filter_capacitance_uf": round(c_filter * 1e6, 3),
            "damping_resistor_ohm": round(r_damping, 3),
            "filter_resonant_frequency_hz": round(f_res, 1),
            "ripple_current_estimate_pct": 30,
            "dq_control_bandwidth_hz": bw_dq,
            "kp_current_controller": round(Kp, 6),
            "ki_current_controller": round(Ki, 6),
            "harmonics_in_bandwidth": in_bandwidth[:30],
            "harmonics_out_of_bandwidth": out_of_bandwidth[:20],
            "already_compliant": already_compliant,
            "warnings": warnings,
            "recommendations": recommendations,
        }

    def get_units(self) -> Dict[str, str]:
        return {
            "total_thd_percent": "%",
            "thd_without_interharmonics_percent": "%",
            "interharmonic_thd_percent": "%",
            "total_harmonic_rms_a": "A",
            "fundamental_current_a": "A",
            "achievable_thd_percent": "%",
            "compensating_current_a": "A",
            "required_apf_current_a": "A",
            "apf_kva_3phase": "kVA",
            "safety_margin_percent": "%",
            "dc_bus_voltage_min_v": "V",
            "dc_bus_voltage_selected_v": "V",
            "dc_bus_utilization_percent": "%",
            "l1_inductance_mh": "mH",
            "l2_inductance_mh": "mH",
            "total_inductance_mh": "mH",
            "filter_capacitance_uf": "µF",
            "damping_resistor_ohm": "Ω",
            "filter_resonant_frequency_hz": "Hz",
            "ripple_current_estimate_pct": "%",
            "dq_control_bandwidth_hz": "Hz",
            "kp_current_controller": "",
            "ki_current_controller": "",
        }
