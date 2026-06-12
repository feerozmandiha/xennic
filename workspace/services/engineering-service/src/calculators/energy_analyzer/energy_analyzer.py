# src/calculators/energy_analyzer/energy_analyzer.py
"""
EA-001: Energy Consumption Analyzer

تحلیل جامع مصرف انرژی برق بر اساس تعرفه کامل توانیر ۱۴۰۳

مراجع:
  - آیین‌نامه تعرفه‌های برق مصوب هیئت وزیران ۱۴۰۲
  - بخشنامه شماره ۱۰۰/۲۰/۱۰ توانیر — تعرفه TOU
  - دستورالعمل محاسبه جریمه ضریب قدرت (مصوبه ۱۴۰۲)
  - IEC 61000-3-2, EN 50160, IEEE 519-2022
"""

import math
import logging
from typing import Dict, Any, Optional

from .schemas import EnergyAnalyzerInput

logger = logging.getLogger(__name__)

# ── سازگاری با BaseCalculator (اگر موجود باشد) ────────────────────────────────
try:
    from src.core.base_calculator import BaseCalculator as _Base
    _BaseClass = _Base
except ImportError:
    _BaseClass = object  # type: ignore


# ═══════════════════════════════════════════════════════════════════════════
# تعرفه‌های برق ایران ۱۴۰۳  (ریال/kWh — پس از افزایش دی‌ماه ۱۴۰۲)
# ═══════════════════════════════════════════════════════════════════════════

# ضرایب منطقه‌ای (توانیر — بخشنامه مناطق گرمسیری)
CLIMATE_MULTIPLIER = {
    "hot":      1.25,   # گرمسیری: خوزستان، بوشهر، هرمزگان، سیستان‌وبلوچستان، کرمان جنوبی
    "cold":     0.90,   # سردسیری: آذربایجان، کردستان، همدان، لرستان، اردبیل
    "moderate": 1.00,   # معتدل
}

# ضرایب TOU برای صنعتی/تجاری (نسبت به نرخ پایه)
TOU_MULTIPLIERS = {
    "peak":        1.50,   # اوج‌بار   (۱۷–۲۱ تابستان / ۷–۱۰ و ۱۷–۲۱ زمستان)
    "mid":         1.00,   # میان‌بار  (بقیه ساعات روز)
    "off_peak":    0.55,   # کم‌بار    (۲۳–۷)
    "peak_friday": 1.30,   # اوج جمعه (کمتر از اوج روزهای کاری)
}

TARIFFS_1403: Dict[str, dict] = {
    # ── خانگی (پلکانی) ────────────────────────────────────────────────────
    "tavanir_residential": {
        "name": "خانگی",
        "type": "tiered",
        "tiers": [
            {"up_to_kwh": 100,  "price": 3_600},
            {"up_to_kwh": 200,  "price": 6_800},
            {"up_to_kwh": 300,  "price": 10_200},
            {"up_to_kwh": 500,  "price": 15_900},
            {"up_to_kwh": 800,  "price": 26_900},
            {"up_to_kwh": None, "price": 40_600},   # >800 kWh
        ],
        "hot_tiers": [                               # گرمسیری — پله‌های بالاتر
            {"up_to_kwh": 200,  "price": 3_600},
            {"up_to_kwh": 400,  "price": 6_800},
            {"up_to_kwh": 600,  "price": 10_200},
            {"up_to_kwh": 1000, "price": 15_900},
            {"up_to_kwh": None, "price": 26_900},
        ],
        "has_demand":     False,
        "pf_threshold":   None,
        "tou":            False,
    },

    # ── عمومی و تجاری ─────────────────────────────────────────────────────
    "tavanir_commercial": {
        "name": "عمومی و تجاری",
        "type": "tiered",
        "tiers": [
            {"up_to_kwh": 500,  "price": 18_900},
            {"up_to_kwh": None, "price": 28_400},
        ],
        "has_demand":     False,
        "pf_threshold":   0.90,
        "pf_penalty_pct": 4.0,     # ۴٪ هزینه انرژی به ازای هر ۰.۰۱ کمتر از ۰.۹۰
        "tou":            False,
    },

    # ── صنعتی فشارضعیف (<1kV) ─────────────────────────────────────────────
    "tavanir_industrial_lv": {
        "name": "صنعتی فشارضعیف",
        "type": "flat_tou",
        "base_price":         14_500,  # ریال/kWh (نرخ پایه میان‌بار)
        "has_demand":         True,
        "demand_price_kw":    3_200_000,  # ریال/kW/ماه (ماکسیمتر)
        "demand_ratchet_pct": 75,          # ۷۵٪ بیشینه ۱۲ ماه اخیر
        "pf_threshold":       0.85,
        "pf_penalty_pct":     5.0,
        "tou":                True,
        "tou_prices": {
            "peak":        21_750,    # ×1.5
            "mid":         14_500,    # ×1.0
            "off_peak":     7_975,    # ×0.55
            "peak_friday": 18_850,    # ×1.3
        },
    },

    # ── صنعتی فشارمتوسط (1–63kV) ──────────────────────────────────────────
    "tavanir_industrial_mv": {
        "name": "صنعتی فشارمتوسط",
        "type": "flat_tou",
        "base_price":         12_400,
        "has_demand":         True,
        "demand_price_kw":    2_850_000,
        "demand_ratchet_pct": 75,
        "pf_threshold":       0.85,
        "pf_penalty_pct":     5.0,
        "tou":                True,
        "tou_prices": {
            "peak":        18_600,
            "mid":         12_400,
            "off_peak":     6_820,
            "peak_friday": 16_120,
        },
        "mv_discount_pct": 5.0,   # تخفیف فشارمتوسط نسبت به LV
    },

    # ── صنعتی فشارقوی (>63kV) ─────────────────────────────────────────────
    "tavanir_industrial_hv": {
        "name": "صنعتی فشارقوی",
        "type": "flat_tou",
        "base_price":         10_200,
        "has_demand":         True,
        "demand_price_kw":    2_400_000,
        "demand_ratchet_pct": 75,
        "pf_threshold":       0.85,
        "pf_penalty_pct":     5.0,
        "tou":                True,
        "tou_prices": {
            "peak":        15_300,
            "mid":         10_200,
            "off_peak":     5_610,
            "peak_friday": 13_260,
        },
        "hv_discount_pct": 15.0,
    },

    # ── کشاورزی ────────────────────────────────────────────────────────────
    "tavanir_agricultural": {
        "name": "کشاورزی",
        "type": "flat",
        "base_price":     2_100,
        "has_demand":     False,
        "pf_threshold":   None,
        "tou":            False,
    },
}

# alias های backward-compat
TARIFFS_1403["tavanir_industrial"] = TARIFFS_1403["tavanir_industrial_mv"]

# ── استانداردهای کیفیت توان ───────────────────────────────────────────────
PF_STANDARDS = {
    "IEC":     0.90,
    "TAVANIR": 0.85,
    "IEEE":    0.90,
}

VOLTAGE_LIMITS = {
    "LV": {"min": 0.90, "max": 1.10},
    "MV": {"min": 0.92, "max": 1.08},
    "HV": {"min": 0.95, "max": 1.05},
}


# ═══════════════════════════════════════════════════════════════════════════
# EA-001 Calculator
# ═══════════════════════════════════════════════════════════════════════════

class EnergyAnalyzerCalculator(_BaseClass):  # type: ignore[misc]
    """EA-001: Energy Consumption Analyzer — مستقل از BaseCalculator"""

    CALCULATION_CODE = "EA-001"
    CALCULATION_NAME = "Energy Consumption Analyzer — تحلیل مصرف انرژی"
    FORMULA_VERSION  = "2.0"
    STANDARD         = "IEC 61000 / EN 50160 / تعرفه توانیر ۱۴۰۳"
    STANDARD_VERSION = "1403"
    ENGINE_VERSION   = "0.2.0"

    def get_units(self) -> Dict[str, str]:
        return {
            "current_kwh":               "kWh",
            "daily_avg_kwh":             "kWh/day",
            "power_factor":              "",
            "load_factor":               "",
            "cost_estimated_rials":      "ریال",
            "voltage_drop_pct":          "%",
            "loss_kw":                   "kW",
            "reactive_compensation_kvar":"kVAR",
        }

    # ── public API ─────────────────────────────────────────────────────────────
    # ── abstract method های BaseCalculator — باید implement شوند ──────────────

    def validate_inputs(self, inputs: EnergyAnalyzerInput) -> bool:
        """پیاده‌سازی validate_inputs — الزامی برای BaseCalculator"""
        if inputs.current_kwh <= 0:
            raise ValueError("مصرف kWh باید مثبت باشد")
        if inputs.billing_days <= 0:
            raise ValueError("تعداد روز دوره باید مثبت باشد")
        return True

    # ── public API — هم برای BaseCalculator هم standalone ────────────────────

    def calculate(self, inputs: EnergyAnalyzerInput) -> Dict[str, Any]:
        """
        نقطه ورود اصلی — سازگار با BaseCalculator و استفاده مستقیم
        اگر BaseCalculator متد calculate دارد این override می‌کند
        """
        self.validate_inputs(inputs)
        try:
            result = self._calculate(inputs)
            return result
        except Exception as exc:
            logger.error("EnergyAnalyzerCalculator._calculate error: %s", exc, exc_info=True)
            raise

    def _calculate(self, inputs: EnergyAnalyzerInput) -> Dict[str, Any]:
        p = inputs
        tariff = TARIFFS_1403.get(p.tariff_code, TARIFFS_1403["tavanir_industrial_mv"])

        # ══ ۱. شاخص‌های پایه ════════════════════════════════════════════════
        daily_avg_kwh = p.current_kwh / p.billing_days
        avg_kw        = p.current_kwh / (p.billing_days * 24)

        load_factor = None
        if p.current_peak_kw and p.current_peak_kw > 0:
            load_factor = round(avg_kw / p.current_peak_kw, 3)

        # ── ضریب قدرت ────────────────────────────────────────────────────
        pf = p.power_factor_measured
        if pf is None and p.current_kvarh and p.current_kwh:
            pf = p.current_kwh / math.sqrt(p.current_kwh**2 + p.current_kvarh**2)
        if pf:
            pf = round(pf, 4)

        q_kvar = None
        if pf and pf < 1.0 and avg_kw > 0:
            q_kvar = round(avg_kw * math.tan(math.acos(pf)), 2)

        # ══ ۲. هزینه تعرفه ══════════════════════════════════════════════════
        cost_result = self._calculate_cost(p, tariff)

        # ══ ۳. Load Flow ════════════════════════════════════════════════════
        load_flow = self._run_load_flow(p, avg_kw, q_kvar)

        # ══ ۴. ضریب قدرت ════════════════════════════════════════════════════
        pf_analysis = self._analyze_power_factor(p, pf, avg_kw, tariff, cost_result)

        # ══ ۵. روند ═════════════════════════════════════════════════════════
        trend = self._analyze_trend(p)

        # ══ ۶. کارایی انرژی ══════════════════════════════════════════════════
        energy_efficiency = self._energy_efficiency_index(p, avg_kw, pf, load_factor)

        # ══ ۷. توصیه‌ها ══════════════════════════════════════════════════════
        recommendations = self._generate_recommendations(
            p, pf, load_factor, cost_result, pf_analysis, load_flow
        )

        return {
            "consumption": {
                "kwh_total":      round(p.current_kwh, 1),
                "daily_avg_kwh":  round(daily_avg_kwh, 1),
                "avg_kw":         round(avg_kw, 2),
                "peak_kw":        p.current_peak_kw,
                "maximeter_kw":   p.maximeter_kw,
                "load_factor":    load_factor,
                "billing_days":   p.billing_days,
                # TOU
                "kwh_peak":       p.peak_kwh,
                "kwh_mid":        p.mid_kwh,
                "kwh_off_peak":   p.off_peak_kwh,
                "kwh_peak_friday":p.peak_kwh_friday,
            },
            "power_factor": {
                "measured":            pf,
                "reactive_kvar":       q_kvar,
                "kvarh_total":         p.current_kvarh,
                "standard_min":        PF_STANDARDS["TAVANIR"],
                "standard_target":     PF_STANDARDS["IEC"],
                "status":              pf_analysis.get("status"),
                "below_threshold":     pf_analysis.get("below_threshold"),
                "pf_threshold":        pf_analysis.get("pf_threshold"),
                "penalty_rials":       pf_analysis.get("penalty_rials"),
                "compensation_kvar":   pf_analysis.get("compensation_kvar"),
                "capacitor_kvar":      pf_analysis.get("capacitor_kvar"),
                "savings_rials_month": pf_analysis.get("savings_rials_month"),
            },
            "cost":             cost_result,
            "load_flow":        load_flow,
            "trend":            trend,
            "energy_efficiency":energy_efficiency,
            "summary": {
                "tariff_name":     tariff["name"],
                "tariff_code":     p.tariff_code,
                "voltage_level":   p.voltage_level,
                "subscriber_type": p.subscriber_type,
                "climate_zone":    p.climate_zone,
                "contract_type":   p.contract_type,
                "tou_enabled":     bool(tariff.get("tou")),
                "overall_status":  self._overall_status(pf, load_factor, load_flow),
            },
            "warnings":        self._generate_warnings(p, pf, load_factor, load_flow, cost_result),
            "recommendations": recommendations,
        }

    # ─────────────────────────────────────────────────────────────────────
    # محاسبه هزینه تعرفه — کامل
    # ─────────────────────────────────────────────────────────────────────

    def _calculate_cost(self, p: EnergyAnalyzerInput, tariff: dict) -> dict:
        kwh          = p.current_kwh
        tariff_type  = tariff.get("type", "flat")
        climate_mult = CLIMATE_MULTIPLIER.get(p.climate_zone, 1.0)
        energy_cost  = 0.0
        tou_breakdown: Dict[str, Any] = {}

        # ── TOU (اوج/میان/کم‌بار) ─────────────────────────────────────────
        has_tou_data = (
            tariff.get("tou") and
            (p.peak_kwh or p.mid_kwh or p.off_peak_kwh)
        )
        if has_tou_data:
            tou_prices = tariff.get("tou_prices", {})
            pk  = (p.peak_kwh or 0)
            mid = (p.mid_kwh or 0)
            op  = (p.off_peak_kwh or 0)
            pkf = (p.peak_kwh_friday or 0)

            # اگر جمع TOU با total تفاوت داشت، باقیمانده را mid حساب کن
            tou_sum = pk + mid + op + pkf
            if tou_sum < kwh * 0.95:
                mid += kwh - tou_sum

            c_pk  = pk  * tou_prices.get("peak", tariff.get("base_price", 0))
            c_mid = mid * tou_prices.get("mid",  tariff.get("base_price", 0))
            c_op  = op  * tou_prices.get("off_peak", tariff.get("base_price", 0))
            c_pkf = pkf * tou_prices.get("peak_friday", tou_prices.get("peak", 0))

            energy_cost = c_pk + c_mid + c_op + c_pkf
            tou_breakdown = {
                "peak_kwh":    round(pk),   "peak_cost":    round(c_pk),
                "mid_kwh":     round(mid),  "mid_cost":     round(c_mid),
                "off_peak_kwh":round(op),   "off_peak_cost":round(c_op),
                "peak_friday_kwh": round(pkf), "peak_friday_cost": round(c_pkf),
            }

        # ── تعرفه پلکانی (خانگی) ──────────────────────────────────────────
        elif tariff_type == "tiered":
            # منطقه گرمسیری → پله‌های بلندتر
            tiers = (
                tariff.get("hot_tiers", tariff["tiers"])
                if p.climate_zone == "hot" and "hot_tiers" in tariff
                else tariff["tiers"]
            )
            remaining  = kwh
            prev_limit = 0
            for tier in tiers:
                if remaining <= 0:
                    break
                limit = tier["up_to_kwh"]
                chunk = min(remaining, (limit or float("inf")) - prev_limit)
                energy_cost += chunk * tier["price"]
                remaining   -= chunk
                prev_limit   = limit or 0

        # ── تعرفه ثابت / flat ─────────────────────────────────────────────
        else:
            base = tariff.get("base_price", 0)
            energy_cost = kwh * base

        # ── ضریب آب‌وهوایی (فقط برای غیر پلکانی) ─────────────────────────
        if tariff_type != "tiered":
            energy_cost *= climate_mult

        # ── هزینه demand (ماکسیمتر) ──────────────────────────────────────
        demand_cost    = 0.0
        ratchet_demand = None
        demand_kw      = p.maximeter_kw or p.current_peak_kw

        if tariff.get("has_demand") and demand_kw:
            demand_price = tariff.get("demand_price_kw", 0)

            # Ratchet: حداقل ۷۵٪ بیشینه ۱۲ماه اخیر
            ratchet_pct  = tariff.get("demand_ratchet_pct", 75) / 100
            history_peak = demand_kw  # اگر تاریخچه نداریم، همین را استفاده می‌کنیم
            if p.monthly_history:
                history_peak = max(
                    (h.peak_kw for h in p.monthly_history if h.peak_kw),
                    default=demand_kw,
                )
            ratchet_demand = max(demand_kw, history_peak * ratchet_pct)
            demand_cost    = ratchet_demand * demand_price

        # ── تجاوز از توان قراردادی ────────────────────────────────────────
        overload_cost = 0.0
        if (p.contract_kw and demand_kw and demand_kw > p.contract_kw):
            overload_kw   = demand_kw - p.contract_kw
            overload_cost = overload_kw * tariff.get("demand_price_kw", 0) * 3  # ۳× جریمه

        # ── جمع و مالیات ──────────────────────────────────────────────────
        subtotal = energy_cost + demand_cost + overload_cost
        tax      = subtotal * 0.09   # ۹٪ مالیات ارزش افزوده
        total    = subtotal + tax

        # ── مقایسه با قبض واقعی ──────────────────────────────────────────
        diff_rials = diff_pct = None
        if p.amount_rials:
            diff_rials = round(total - p.amount_rials)
            diff_pct   = round((diff_rials / p.amount_rials) * 100, 1)

        return {
            "energy_cost_rials":  round(energy_cost),
            "demand_cost_rials":  round(demand_cost),
            "overload_cost_rials":round(overload_cost) if overload_cost else None,
            "subtotal_rials":     round(subtotal),
            "tax_rials":          round(tax),
            "total_rials":        round(total),
            "actual_bill_rials":  p.amount_rials,
            "difference_rials":   diff_rials,
            "difference_pct":     diff_pct,
            "avg_price_kwh":      round(subtotal / kwh) if kwh else None,
            "climate_multiplier": climate_mult,
            "ratchet_demand_kw":  round(ratchet_demand, 1) if ratchet_demand else None,
            "tou_breakdown":      tou_breakdown if tou_breakdown else None,
            "unit":               "ریال",
        }

    # ─────────────────────────────────────────────────────────────────────
    # Load Flow با pandapower
    # ─────────────────────────────────────────────────────────────────────

    def _run_load_flow(self, p: EnergyAnalyzerInput, avg_kw: float, q_kvar: Optional[float]) -> dict:
        try:
            import pandapower as pp
            import warnings
            warnings.filterwarnings("ignore")

            net   = pp.create_empty_network(sn_mva=10)
            v_kv  = p.supply_voltage_kv
            b_grd = pp.create_bus(net, vn_kv=v_kv, name="شبکه سراسری")
            pp.create_ext_grid(net, bus=b_grd, vm_pu=1.0)

            b_load = b_grd
            if p.transformer_kva and v_kv > 1:
                b_lv = pp.create_bus(net, vn_kv=0.4, name="فشارضعیف")
                pp.create_transformer_from_parameters(
                    net, hv_bus=b_grd, lv_bus=b_lv,
                    sn_mva=p.transformer_kva / 1000,
                    vn_hv_kv=v_kv, vn_lv_kv=0.4,
                    vkr_percent=1.0, vk_percent=p.transformer_imp_pct,
                    pfe_kw=p.transformer_kva * 0.002,
                    i0_percent=0.5, shift_degree=0,
                )
                b_load = b_lv

            if p.cable_length_m and p.cable_size_mm2:
                b_pan = pp.create_bus(
                    net, vn_kv=0.4 if v_kv > 1 else v_kv, name="تابلو اصلی"
                )
                r_km = 0.0225 / (p.cable_size_mm2 / 240)
                pp.create_line_from_parameters(
                    net, from_bus=b_load, to_bus=b_pan,
                    length_km=p.cable_length_m / 1000,
                    r_ohm_per_km=r_km, x_ohm_per_km=0.08,
                    c_nf_per_km=0, max_i_ka=1.0,
                )
                b_load = b_pan

            q = q_kvar if q_kvar else avg_kw * math.tan(math.acos(0.85))
            pp.create_load(net, bus=b_load, p_mw=avg_kw / 1000, q_mvar=q / 1000, name="بار")

            if p.has_solar_pv and p.solar_kw:
                pp.create_sgen(net, bus=b_load, p_mw=p.solar_kw / 1000, q_mvar=0, name="PV")

            pp.runpp(net, algorithm="nr", numba=False)

            v_pu       = float(net.res_bus["vm_pu"].iloc[-1])
            v_lim      = VOLTAGE_LIMITS.get(p.voltage_level, VOLTAGE_LIMITS["LV"])
            v_ok       = v_lim["min"] <= v_pu <= v_lim["max"]
            loss_kw    = float(net.res_line["pl_kw"].sum()) if len(net.line) else 0.0
            loss_pct   = (loss_kw / avg_kw * 100) if avg_kw > 0 else 0.0
            loss_kwh_m = loss_kw * 24 * 30

            trafo_loading = (
                float(net.res_trafo["loading_percent"].iloc[0])
                if len(net.trafo) else None
            )
            line_loading = (
                float(net.res_line["loading_percent"].max())
                if len(net.line) else None
            )

            return {
                "converged":              True,
                "method":                 "pandapower Newton-Raphson",
                "voltage_pu":             round(v_pu, 4),
                "voltage_ok":             v_ok,
                "voltage_limit_min":      v_lim["min"],
                "voltage_limit_max":      v_lim["max"],
                "loss_kw":                round(loss_kw, 2),
                "loss_pct":               round(loss_pct, 2),
                "loss_kwh_month":         round(loss_kwh_m, 0),
                "transformer_loading_pct":round(trafo_loading, 1) if trafo_loading else None,
                "cable_loading_pct":      round(line_loading, 1) if line_loading else None,
            }

        except ImportError:
            return {
                "converged": False,
                "method":    "pandapower not installed",
                "note":      "pip install pandapower",
                "simple_estimate": self._simple_load_flow(p, avg_kw, q_kvar),
            }
        except Exception as exc:
            return {
                "converged": False,
                "error":     str(exc),
                "simple_estimate": self._simple_load_flow(p, avg_kw, q_kvar),
            }

    def _simple_load_flow(self, p: EnergyAnalyzerInput, avg_kw: float,
                           q_kvar: Optional[float]) -> dict:
        if not p.cable_length_m or not p.cable_size_mm2:
            return {"note": "داده کابل برای تخمین موجود نیست"}
        r_per_m = 0.0225 / p.cable_size_mm2
        r_total = r_per_m * p.cable_length_m * 2
        pf = p.power_factor_measured or 0.85
        v  = p.supply_voltage_kv * 1000 if p.supply_voltage_kv <= 1 else 400
        i  = avg_kw * 1000 / (math.sqrt(3) * v * pf) if v > 0 else 0
        vd = math.sqrt(3) * i * r_total
        vd_pct = (vd / v) * 100 if v > 0 else 0
        loss_kw = 3 * i**2 * r_total / 1000
        return {
            "voltage_drop_pct": round(vd_pct, 2),
            "voltage_ok":       vd_pct < 5.0,
            "loss_kw":          round(loss_kw, 3),
            "current_a":        round(i, 1),
        }

    # ─────────────────────────────────────────────────────────────────────
    # تحلیل ضریب قدرت
    # ─────────────────────────────────────────────────────────────────────

    def _analyze_power_factor(self, p: EnergyAnalyzerInput, pf: Optional[float],
                               avg_kw: float, tariff: dict, cost: dict) -> dict:
        if pf is None:
            return {"status": "نامشخص", "note": "ضریب قدرت قابل محاسبه نیست"}

        threshold   = tariff.get("pf_threshold") or 0.85
        penalty_pct = tariff.get("pf_penalty_pct", 0)

        if pf >= 0.95:
            status = "عالی"
        elif pf >= 0.90:
            status = "خوب"
        elif pf >= threshold:
            status = "قابل قبول"
        else:
            status = "زیر حد مجاز — جریمه اعمال می‌شود"

        # جریمه
        penalty_rials = None
        if pf < threshold and penalty_pct > 0:
            n_steps       = math.ceil((threshold - pf) / 0.01)
            energy_cost   = cost.get("energy_cost_rials", p.current_kwh * 12400)
            penalty_rials = round(energy_cost * (n_steps * penalty_pct / 100))

        # خازن جبران‌ساز
        target_pf         = 0.95
        compensation_kvar = None
        capacitor_kvar    = None
        savings_month     = None

        if pf < target_pf and avg_kw > 0:
            phi_now    = math.acos(pf)
            phi_target = math.acos(target_pf)
            comp       = avg_kw * (math.tan(phi_now) - math.tan(phi_target))
            compensation_kvar = round(comp, 1)
            capacitor_kvar    = math.ceil(comp / 5) * 5
            if penalty_rials:
                savings_month = penalty_rials

        return {
            "status":              status,
            "pf_threshold":        threshold,
            "pf_target":           target_pf,
            "below_threshold":     pf < threshold,
            "penalty_rials":       penalty_rials,
            "compensation_kvar":   compensation_kvar,
            "capacitor_kvar":      capacitor_kvar,
            "savings_rials_month": savings_month,
        }

    # ─────────────────────────────────────────────────────────────────────
    # روند مصرف
    # ─────────────────────────────────────────────────────────────────────

    def _analyze_trend(self, p: EnergyAnalyzerInput) -> Optional[dict]:
        if not p.monthly_history or len(p.monthly_history) < 2:
            return None
        history    = sorted(p.monthly_history, key=lambda x: x.month)
        kwh_values = [h.kwh_consumed for h in history]
        avg        = sum(kwh_values) / len(kwh_values)
        n          = len(kwh_values)
        x_mean     = (n - 1) / 2
        num = sum((i - x_mean) * (kwh_values[i] - avg) for i in range(n))
        den = sum((i - x_mean)**2 for i in range(n))
        slope     = num / den if den else 0
        mom       = ((p.current_kwh - kwh_values[-1]) / kwh_values[-1]) * 100
        direction = "صعودی" if slope > avg * 0.02 else "نزولی" if slope < -avg * 0.02 else "پایدار"
        return {
            "months_analyzed":     len(history),
            "avg_kwh":             round(avg, 1),
            "max_kwh":             round(max(kwh_values), 1),
            "min_kwh":             round(min(kwh_values), 1),
            "month_over_month_pct":round(mom, 1),
            "trend":               direction,
            "slope_kwh_month":     round(slope, 1),
        }

    # ─────────────────────────────────────────────────────────────────────
    # شاخص کارایی انرژی (EEI)
    # ─────────────────────────────────────────────────────────────────────

    def _energy_efficiency_index(self, p: EnergyAnalyzerInput, avg_kw: float,
                                  pf: Optional[float], load_factor: Optional[float]) -> dict:
        # Load Factor Score
        lf_score = 0
        if load_factor:
            if load_factor >= 0.75:   lf_score = 100
            elif load_factor >= 0.60: lf_score = 80
            elif load_factor >= 0.45: lf_score = 60
            else:                     lf_score = 35

        # Power Factor Score
        pf_score = 0
        if pf:
            if pf >= 0.95:   pf_score = 100
            elif pf >= 0.90: pf_score = 80
            elif pf >= 0.85: pf_score = 60
            elif pf >= 0.80: pf_score = 40
            else:             pf_score = 20

        scores  = [s for s in [lf_score, pf_score] if s > 0]
        overall = round(sum(scores) / len(scores), 1) if scores else 50.0
        grade   = "A" if overall >= 85 else "B" if overall >= 70 else "C" if overall >= 55 else "D"

        return {
            "overall_score":       overall,
            "grade":               grade,
            "load_factor_score":   lf_score,
            "power_factor_score":  pf_score,
            "interpretation": {
                "A": "کارایی عالی",
                "B": "کارایی خوب",
                "C": "نیاز به بهینه‌سازی",
                "D": "نیاز به اصلاح فوری",
            }[grade],
        }

    # ─────────────────────────────────────────────────────────────────────
    # وضعیت کلی
    # ─────────────────────────────────────────────────────────────────────

    def _overall_status(self, pf, load_factor, load_flow) -> str:
        issues = 0
        if pf and pf < 0.85:          issues += 2
        elif pf and pf < 0.90:        issues += 1
        if load_factor and load_factor < 0.45: issues += 1
        if load_flow.get("voltage_ok") is False: issues += 2
        if (load_flow.get("loss_pct") or 0) > 5: issues += 1
        if issues == 0:   return "✅ وضعیت مطلوب"
        elif issues <= 1: return "⚠️ نیاز به پایش"
        elif issues <= 3: return "🔶 نیاز به بهینه‌سازی"
        else:             return "🔴 نیاز به اصلاح فوری"

    # ─────────────────────────────────────────────────────────────────────
    # هشدارها
    # ─────────────────────────────────────────────────────────────────────

    def _generate_warnings(self, p, pf, load_factor, load_flow, cost) -> list:
        w = []
        if pf and pf < 0.85:
            w.append(f"⚠️ ضریب قدرت {pf:.2f} زیر حد مجاز ۰.۸۵ — جریمه اعمال می‌شود")
        if load_factor and load_factor < 0.45:
            w.append(f"⚠️ ضریب بار {load_factor:.2f} پایین — demand بالا نسبت به میانگین")
        if load_flow.get("voltage_ok") is False:
            w.append(f"⚠️ ولتاژ {load_flow.get('voltage_pu', '?')} pu خارج از محدوده")
        if (load_flow.get("loss_pct") or 0) > 5:
            w.append(f"⚠️ تلفات توان {load_flow.get('loss_pct', 0):.1f}% بالاست")
        if p.contract_kw and p.current_peak_kw and p.current_peak_kw > p.contract_kw:
            w.append(
                f"⚠️ تجاوز از توان قراردادی: {p.current_peak_kw} kW > {p.contract_kw} kW"
                f" — جریمه {(cost.get('overload_cost_rials') or 0)/1e6:.1f} میلیون ریال"
            )
        if p.climate_zone == "hot":
            w.append("ℹ️ منطقه گرمسیری — پله‌های مصرف خانگی دارای پهنای بیشتری است")
        return w

    # ─────────────────────────────────────────────────────────────────────
    # توصیه‌ها
    # ─────────────────────────────────────────────────────────────────────

    def _generate_recommendations(self, p, pf, load_factor, cost,
                                   pf_analysis, load_flow) -> list:
        recs = []

        # ضریب قدرت
        if pf and pf < 0.90:
            cap     = pf_analysis.get("capacitor_kvar")
            savings = pf_analysis.get("savings_rials_month", 0) or 0
            recs.append(
                f"💡 نصب خازن جبران‌ساز {cap} kVAR — "
                f"صرفه‌جویی تخمینی: {savings/1e6:.1f} میلیون ریال/ماه"
            )

        # TOU — انتقال بار
        if load_factor and load_factor < 0.50:
            recs.append(
                "💡 انتقال بار به ساعات کم‌بار (۲۳–۷) — "
                "کاهش هزینه demand و بهره‌مندی از تعرفه TOU پایین"
            )

        # ماکسیمتر
        if p.current_peak_kw and load_factor and load_factor < 0.55 and p.contract_kw:
            recs.append(
                "💡 نصب سیستم مدیریت بار (BMS) برای کنترل ماکسیمتر — "
                f"کاهش demand از {p.current_peak_kw:.0f} به "
                f"{p.current_kwh / (p.billing_days * 24 * 0.7):.0f} kW تخمین"
            )

        # تلفات
        if (load_flow.get("loss_pct") or 0) > 3:
            recs.append(
                f"💡 بهسازی سیم‌کشی — تلفات {load_flow.get('loss_pct', 0):.1f}% "
                f"معادل {load_flow.get('loss_kwh_month', 0):.0f} kWh/ماه"
            )

        # ولتاژ
        if load_flow.get("voltage_ok") is False:
            v = load_flow.get("voltage_pu", 1.0)
            recs.append(
                "💡 ولتاژ پایین — بررسی tap ترانسفورماتور یا کابل ضخیم‌تر"
                if v < 0.95 else
                "💡 ولتاژ بالا — تنظیم tap ترانسفورماتور"
            )

        # PV خورشیدی
        if not p.has_solar_pv and p.current_kwh > 5000:
            off_peak = p.off_peak_kwh or 0
            daytime  = p.current_kwh - off_peak
            solar_kw = round(daytime * 0.25 / (p.billing_days * 5), 0)
            savings  = daytime * 0.25 * (cost.get("avg_price_kwh") or 12400) / 1e6
            recs.append(
                f"💡 سیستم PV خورشیدی پیشنهادی: {solar_kw:.0f} kW — "
                f"صرفه‌جویی تخمینی: {savings:.1f} میلیون ریال/ماه"
            )

        # VFD
        if not p.has_vfd and p.subscriber_type.startswith("industrial"):
            recs.append(
                "💡 نصب درایو VFD روی موتورهای پمپ و فن — "
                "کاهش ۲۰–۳۵٪ مصرف انرژی موتوری"
            )

        if not recs:
            recs.append("✅ وضعیت مصرف انرژی مناسب است — ادامه پایش توصیه می‌شود")

        return recs
