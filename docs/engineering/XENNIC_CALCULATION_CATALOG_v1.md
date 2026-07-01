# XENNIC_CALCULATION_CATALOG_v1

Version: 1.0

Status: Approved

Date: 2026-05-30

---

# Purpose

This document defines the official engineering calculation catalog.

Every calculation must contain:

- Unique Code
- Category
- Standard Reference
- Inputs
- Outputs
- Units
- Formula Version
- Validation Rules

---

# Calculation ID Format

<Category>-<Number>

Examples:

BASIC-001

CABLE-001

PQ-001

SOLAR-001

---

=========================================================
BASIC ELECTRICAL
=========================================================

---------------------------------------------------------
BASIC-001
OHM'S LAW
---------------------------------------------------------

Code:

BASIC-001

Formula:

V = I × R

Inputs:

current_a

resistance_ohm

Outputs:

voltage_v

Units:

A
Ω
V

Formula Version:

1.0

Standard:

IEC

Validation:

current_a > 0

resistance_ohm > 0

---

---------------------------------------------------------
BASIC-002
ACTIVE POWER
---------------------------------------------------------

Formula:

P = V × I × PF

Inputs:

voltage_v

current_a

power_factor

Outputs:

active_power_kw

Units:

V

A

kW

Validation:

0 < power_factor ≤ 1

---

---------------------------------------------------------
BASIC-003
APPARENT POWER
---------------------------------------------------------

Formula:

S = √3 × V × I

Inputs:

voltage_v

current_a

Outputs:

apparent_power_kva

---

---------------------------------------------------------
BASIC-004
REACTIVE POWER
---------------------------------------------------------

Formula:

Q = √(S² − P²)

Outputs:

reactive_power_kvar

---

=========================================================
CABLE ENGINEERING
=========================================================

---------------------------------------------------------
CABLE-001
CABLE AMPACITY
---------------------------------------------------------

Reference:

IEC 60287

Inputs:

load_current

installation_method

ambient_temperature

conductor_material

insulation_type

Outputs:

minimum_cable_size

correction_factor

recommended_cable

Formula Version:

1.0

---

---------------------------------------------------------
CABLE-002
VOLTAGE DROP
---------------------------------------------------------

Reference:

IEC 60364

Inputs:

length_m

current_a

resistance

reactance

power_factor

Outputs:

voltage_drop_v

voltage_drop_percent

---

---------------------------------------------------------
CABLE-003
SHORT CIRCUIT WITHSTAND
---------------------------------------------------------

Reference:

IEC 60949

Inputs:

short_circuit_current

fault_duration

material_constant

Outputs:

minimum_cross_section

---

---------------------------------------------------------
CABLE-004
PE CONDUCTOR SIZING
---------------------------------------------------------

Reference:

IEC 60364

Inputs:

phase_conductor_size

Outputs:

pe_size

---

=========================================================
TRANSFORMER ENGINEERING
=========================================================

---------------------------------------------------------
TRF-001
TRANSFORMER SIZING
---------------------------------------------------------

Reference:

IEC 60076

Inputs:

total_load_kw

power_factor

future_growth_factor

Outputs:

required_kva

recommended_transformer

---

---------------------------------------------------------
TRF-002
TRANSFORMER LOSSES
---------------------------------------------------------

Inputs:

no_load_loss

load_loss

loading_percent

Outputs:

total_loss

efficiency

---

=========================================================
PROTECTION ENGINEERING
=========================================================

---------------------------------------------------------
PROT-001
MCCB SELECTION
---------------------------------------------------------

Reference:

IEC 60947

Inputs:

load_current

starting_current

ambient_temperature

Outputs:

recommended_mccb

breaking_capacity

trip_setting

---

---------------------------------------------------------
PROT-002
SELECTIVITY ANALYSIS
---------------------------------------------------------

Reference:

IEC 60947

Inputs:

upstream_device

downstream_device

fault_current

Outputs:

selective

coordination_margin

---

=========================================================
EARTHING ENGINEERING
=========================================================

---------------------------------------------------------
EARTH-001
GROUND RESISTANCE
---------------------------------------------------------

Reference:

IEEE 80

Inputs:

soil_resistivity

electrode_length

electrode_count

Outputs:

ground_resistance

---

---------------------------------------------------------
EARTH-002
STEP VOLTAGE
---------------------------------------------------------

Reference:

IEEE 80

Inputs:

fault_current

soil_resistivity

grid_geometry

Outputs:

step_voltage

safe_limit

---

=========================================================
LIGHTING ENGINEERING
=========================================================

---------------------------------------------------------
LIGHT-001
LUX CALCULATION
---------------------------------------------------------

Reference:

EN 12464

Inputs:

area_m2

target_lux

utilization_factor

maintenance_factor

Outputs:

required_lumens

required_fixtures

---

=========================================================
POWER FACTOR CORRECTION
=========================================================

---------------------------------------------------------
PFC-001
CAPACITOR BANK SIZING
---------------------------------------------------------

Inputs:

existing_pf

target_pf

load_kw

Outputs:

required_kvar

recommended_steps

---

=========================================================
POWER SYSTEM STUDIES
=========================================================

---------------------------------------------------------
PS-001
LOAD FLOW
---------------------------------------------------------

Reference:

IEC

Engine:

pandapower

Inputs:

network_model

loads

sources

Outputs:

bus_voltages

line_loading

losses

---

---------------------------------------------------------
PS-002
SHORT CIRCUIT ANALYSIS
---------------------------------------------------------

Reference:

IEC 60909

Engine:

pandapower

Outputs:

fault_current

peak_current

thermal_current

---

=========================================================
POWER QUALITY
=========================================================

---------------------------------------------------------
PQ-001
THD CALCULATION
---------------------------------------------------------

Reference:

IEEE 519

Formula:

THD = √(ΣH²) / Fundamental × 100

Inputs:

harmonic_spectrum

Outputs:

thd_percent

compliance_status

---

---------------------------------------------------------
PQ-002
TDD CALCULATION
---------------------------------------------------------

Reference:

IEEE 519

Inputs:

harmonic_currents

maximum_demand_current

Outputs:

tdd_percent

---

---------------------------------------------------------
PQ-003
K-FACTOR
---------------------------------------------------------

Reference:

UL / IEEE

Inputs:

harmonic_spectrum

Outputs:

k_factor

recommended_transformer

---

---------------------------------------------------------
PQ-004
RESONANCE ANALYSIS
---------------------------------------------------------

Inputs:

system_impedance

capacitor_bank

harmonic_orders

Outputs:

resonant_frequency

risk_level

---

---------------------------------------------------------
PQ-005
PASSIVE FILTER DESIGN
---------------------------------------------------------

Inputs:

target_harmonic

load_current

system_voltage

Outputs:

filter_parameters

reactor_size

capacitor_size

---

---------------------------------------------------------
PQ-006
ACTIVE FILTER SIZING
---------------------------------------------------------

Inputs:

harmonic_spectrum

load_current

target_thd

Outputs:

required_filter_current

recommended_filter

---

=========================================================
ARC FLASH
=========================================================

---------------------------------------------------------
ARC-001
INCIDENT ENERGY
---------------------------------------------------------

Reference:

IEEE 1584

Inputs:

fault_current

clearing_time

working_distance

Outputs:

incident_energy

ppe_category

---

=========================================================
SOLAR ENGINEERING
=========================================================

---------------------------------------------------------
SOLAR-001
PV ARRAY SIZING
---------------------------------------------------------

Reference:

IEC 62548

Inputs:

daily_energy_kwh

solar_irradiance

system_losses

Outputs:

required_kwp

panel_quantity

---

---------------------------------------------------------
SOLAR-002
INVERTER SIZING
---------------------------------------------------------

Inputs:

pv_capacity

dc_ac_ratio

Outputs:

recommended_inverter

---

---------------------------------------------------------
SOLAR-003
BATTERY SIZING
---------------------------------------------------------

Inputs:

daily_load

autonomy_days

dod

system_voltage

Outputs:

battery_capacity_ah

---

=========================================================
BATTERY STORAGE
=========================================================

---------------------------------------------------------
BAT-001
BACKUP TIME
---------------------------------------------------------

Inputs:

battery_capacity

load_power

efficiency

Outputs:

backup_hours

---

=========================================================
ECONOMIC ANALYSIS
=========================================================

---------------------------------------------------------
ECO-001
ROI
---------------------------------------------------------

Inputs:

investment

annual_savings

Outputs:

roi_percent

payback_years

---

---------------------------------------------------------
ECO-002
NPV
---------------------------------------------------------

Inputs:

cash_flows

discount_rate

Outputs:

npv

---

---------------------------------------------------------
ECO-003
IRR
---------------------------------------------------------

Inputs:

cash_flows

Outputs:

irr

---

# Formula Governance

Every Formula Must Have:

formula_version

author

reviewer

standard_reference

approval_date

---

# Validation Rules

Input validation must occur before calculation.

Invalid calculations must never execute.

All validation errors must be returned through API.

---

# Calculation Result Structure

{
  "calculation_code": "PQ-001",
  "formula_version": "1.0",
  "standard": "IEEE 519",
  "inputs": {},
  "results": {},
  "warnings": [],
  "recommendations": []
}

---

# Change Management

Any formula modification requires:

- New Formula Version
- Technical Review
- Approval Record
- Migration Note

Old calculations must remain reproducible.

Approved.