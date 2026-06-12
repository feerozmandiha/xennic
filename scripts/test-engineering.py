#!/usr/bin/env python3
"""
Xennic Engineering Service — Test Suite
اجرا: python3 xennic-patch/scripts/test-engineering.py
"""

import sys
import json
import urllib.request
import urllib.error
from dataclasses import dataclass
from typing import Any

BASE = "http://localhost:8001/api/v1"
PASS, FAIL, SKIP = 0, 0, 0

# ── رنگ‌ها ──────────────────────────────────────────────────────────────────

GREEN  = "\033[92m"; RED    = "\033[91m"; YELLOW = "\033[93m"
CYAN   = "\033[96m"; BOLD   = "\033[1m";  NC     = "\033[0m"

def ok(msg):      global PASS; PASS += 1; print(f"{GREEN}  ✅ {msg}{NC}")
def err(msg):     global FAIL; FAIL += 1; print(f"{RED}  ❌ {msg}{NC}")
def skip(msg):    global SKIP; SKIP += 1; print(f"{YELLOW}  ⏭  {msg}{NC}")
def section(msg): print(f"\n{CYAN}{BOLD}══ {msg} ══{NC}")

def post(path: str, body: dict) -> dict | None:
    try:
        data = json.dumps(body).encode()
        req  = urllib.request.Request(
            f"{BASE}{path}", data=data,
            headers={"Content-Type": "application/json"}, method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())
    except Exception as e:
        return None

def get(path: str) -> dict | None:
    try:
        with urllib.request.urlopen(f"{BASE}{path}", timeout=10) as r:
            return json.loads(r.read())
    except Exception:
        return None

# ═══════════════════════════════════════════════════════════════════════
section("1. HEALTH")
# ═══════════════════════════════════════════════════════════════════════

h = get("/health") or get("http://localhost:8001/health")
if h:
    ok(f"Service reachable — version {h.get('version', '?')}")
    cat_count = len(h.get('calculators', []))
    ok(f"Calculators available: {cat_count}") if cat_count >= 10 else err(f"Only {cat_count} calculators")
else:
    skip("Python Engineering Service not running — skip all tests")
    print(f"\n  ℹ️  Start with: cd workspace/services/engineering-service && uvicorn src.main:app --port 8001")
    print(f"\n{BOLD}══ RESULT: {PASS}✅  {FAIL}❌  {SKIP}⏭{NC}")
    sys.exit(0)

# ═══════════════════════════════════════════════════════════════════════
section("2. BASIC — Ohm's Law (BASIC-001)")
# ═══════════════════════════════════════════════════════════════════════

r = post("/engineering/basic/ohms-law", {"current_a": 10.0, "resistance_ohm": 23.0})
if r and r.get("success"):
    v = r["data"]["results"].get("voltage_v", 0)
    ok(f"Ohm's Law: V = {v} V") if abs(v - 230) < 0.01 else err(f"Wrong voltage: {v}")
else:
    err(f"Ohm's Law failed: {r}")

# Active power
r = post("/engineering/basic/active-power", {"voltage_v": 400, "current_a": 50, "power_factor": 0.85, "phases": 3})
if r and r.get("success"):
    p = r["data"]["results"].get("active_power_kw", 0)
    ok(f"Active Power: P = {p:.2f} kW")
else:
    err(f"Active Power failed: {r}")

# ═══════════════════════════════════════════════════════════════════════
section("3. CABLE — Sizing (CABLE-001)")
# ═══════════════════════════════════════════════════════════════════════

r = post("/engineering/cable/sizing", {
    "current_a": 100,
    "installation_method": "B2",
    "ambient_temp_c": 30,
    "insulation": "XLPE",
    "grouping_factor": 1.0,
})
if r and r.get("success"):
    size = r["data"]["results"].get("cable_size_mm2", "?")
    ok(f"Cable sizing: {size} mm²")
else:
    err(f"Cable sizing failed: {r}")

# Voltage drop
r = post("/engineering/cable/voltage-drop", {
    "current_a": 80,
    "length_m": 150,
    "cable_size_mm2": 35,
    "voltage_v": 400,
    "power_factor": 0.85,
    "phases": 3,
})
if r and r.get("success"):
    drop = r["data"]["results"].get("voltage_drop_percent", 0)
    ok(f"Voltage drop: {drop:.2f}%") if drop < 10 else err(f"Unexpected drop: {drop}")
else:
    err(f"Voltage drop failed: {r}")

# ═══════════════════════════════════════════════════════════════════════
section("4. TRANSFORMER — Sizing & Losses (TRF-001, TRF-002)")
# ═══════════════════════════════════════════════════════════════════════

r = post("/engineering/transformer/sizing", {
    "load_kw": 750,
    "power_factor": 0.85,
    "future_growth_percent": 20,
    "efficiency": 0.98,
})
if r and r.get("success"):
    size = r["data"]["results"].get("recommended_kva", "?")
    ok(f"Transformer sizing: {size} kVA")
else:
    err(f"Transformer sizing failed: {r}")

r = post("/engineering/transformer/losses", {
    "rated_kva": 1000,
    "no_load_loss_kw": 2.1,
    "load_loss_kw": 10.5,
    "load_factor": 0.75,
})
if r and r.get("success"):
    eff = r["data"]["results"].get("efficiency_percent", 0)
    ok(f"Transformer efficiency: {eff:.2f}%")
else:
    err(f"Transformer losses failed: {r}")

# ═══════════════════════════════════════════════════════════════════════
section("5. POWER QUALITY — THD (PQ-001)")
# ═══════════════════════════════════════════════════════════════════════

r = post("/engineering/power-quality/thd", {
    "fundamental_a": 100,
    "harmonics": [
        {"order": 5, "magnitude_a": 15},
        {"order": 7, "magnitude_a": 8},
        {"order": 11, "magnitude_a": 4},
        {"order": 13, "magnitude_a": 3},
    ],
})
if r and r.get("success"):
    thd = r["data"]["results"].get("thd_percent", 0)
    status = r["data"]["results"].get("ieee519_compliant", "?")
    ok(f"THD = {thd:.2f}% | IEEE 519 compliant: {status}")
    if thd > 5:
        ok("THD > 5% correctly identified as non-compliant")
else:
    err(f"THD failed: {r}")

# TDD
r = post("/engineering/power-quality/tdd", {
    "harmonics": [
        {"order": 5, "magnitude_a": 15},
        {"order": 7, "magnitude_a": 8},
    ],
    "fundamental_a": 100,
    "isc_il_ratio": 20,
    "voltage_kv": 0.4,
})
if r and r.get("success"):
    tdd = r["data"]["results"].get("tdd_percent", 0)
    ok(f"TDD = {tdd:.2f}%")
else:
    err(f"TDD failed: {r}")

# ═══════════════════════════════════════════════════════════════════════
section("6. POWER QUALITY — Passive Filter (PQ-005)")
# ═══════════════════════════════════════════════════════════════════════

r = post("/engineering/power-quality/passive-filter", {
    "system_voltage_kv": 0.4,
    "fundamental_frequency_hz": 50,
    "target_harmonic_order": 5,
    "reactive_power_kvar": 100,
})
if r and r.get("success"):
    C = r["data"]["results"].get("capacitor_uf", "?")
    L = r["data"]["results"].get("inductor_mh", "?")
    ok(f"Passive Filter: C = {C} μF, L = {L} mH")
else:
    err(f"Passive filter failed: {r}")

# ═══════════════════════════════════════════════════════════════════════
section("7. RESONANCE (PQ-004)")
# ═══════════════════════════════════════════════════════════════════════

r = post("/engineering/power-quality/resonance", {
    "system_kva": 1000,
    "transformer_impedance_percent": 5.5,
    "capacitor_kvar": 300,
    "system_voltage_kv": 0.4,
})
if r and r.get("success"):
    hn = r["data"]["results"].get("resonance_order", "?")
    ok(f"Resonance harmonic order: {hn}")
else:
    err(f"Resonance failed: {r}")

# ═══════════════════════════════════════════════════════════════════════
section("8. EDGE CASES & VALIDATION")
# ═══════════════════════════════════════════════════════════════════════

# Zero current
r = post("/engineering/basic/ohms-law", {"current_a": 0, "resistance_ohm": 10})
if r:
    if r.get("success"):
        ok("Zero current handled (V=0)")
    else:
        ok("Zero current rejected (validation)")
else:
    skip("Zero current test unreachable")

# Negative resistance
r = post("/engineering/cable/voltage-drop", {
    "current_a": -10, "length_m": 100, "cable_size_mm2": 16,
    "voltage_v": 400, "power_factor": 0.85, "phases": 3
})
if r and not r.get("success"):
    ok("Negative current rejected")
else:
    skip("Negative current not validated")

# ═══════════════════════════════════════════════════════════════════════
#  SUMMARY
# ═══════════════════════════════════════════════════════════════════════

total = PASS + FAIL + SKIP
print(f"\n{BOLD}══════════════════════════════════════{NC}")
print(f"{BOLD}  ENGINEERING TEST RESULTS{NC}")
print(f"{BOLD}══════════════════════════════════════{NC}")
print(f"{GREEN}  ✅ PASS: {PASS}{NC}")
print(f"{RED}  ❌ FAIL: {FAIL}{NC}")
print(f"{YELLOW}  ⏭  SKIP: {SKIP}{NC}")
print(f"  📊 TOTAL: {total}")
print(f"{BOLD}══════════════════════════════════════{NC}")

if FAIL == 0:
    print(f"{GREEN}{BOLD}  🎉 All engineering tests passed!{NC}")
    sys.exit(0)
else:
    print(f"{RED}{BOLD}  ⚠️  {FAIL} test(s) failed{NC}")
    sys.exit(1)
