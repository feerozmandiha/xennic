# Calculation Catalog

Complete reference of all 55 electrical engineering calculations, organized by category.

---

## Foundation (9 Plugins)

---

### ohms-law

**Ohm's Law** — Fundamental relationship between voltage, current, and resistance in DC circuits. Given any two parameters, calculates the third.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Range |
|-----------|-------|------|------|----------|-------|
| V | Voltage | number | V | Yes | — |
| I | Current | number | A | Yes | > 0 |
| R | Resistance | number | Ω | No | > 0 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| calculated | Calculated Value | number | V/A/Ω |
| method | Method Used | string | — |

**Formula Summary:** `V = I × R` (calculates missing parameter from the two provided)

**Standard:** IEC 60027

**AI Explanation:** Ohm's law relates voltage, current, and resistance in DC circuits. Given any two values, the third is computed.

**Accuracy/Tolerance:** Exact (theoretical relationship)

---

### power-calculation

**Power Calculation** — Computes active, reactive, and apparent power from voltage, current, and power factor in AC circuits.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| V | Voltage | number | V | Yes | — |
| I | Current | number | A | Yes | — |
| cosPhi | Power Factor | number | — | No | 1 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| P | Active Power | number | W |
| Q | Reactive Power | number | VAR |
| S | Apparent Power | number | VA |

**Formula Summary:** `S = V × I`, `P = S × cosφ`, `Q = S × √(1 - cos²φ)`

**Standard:** IEC 60027

**AI Explanation:** Power calculation using voltage, current, and power factor for AC circuits.

**Accuracy/Tolerance:** ±1% (assuming sinusoidal waveform)

---

### energy-calculation

**Energy Calculation** — Calculates electrical energy consumption from power and time.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| P | Power | number | W | Yes |
| t | Time | number | h | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| E_kWh | Energy | number | kWh |
| E_MJ | Energy (MJ) | number | MJ |

**Formula Summary:** `E_kWh = P × t / 1000`, `E_MJ = E_kWh × 3.6`

**Standard:** IEC 60027

**AI Explanation:** Energy calculation from power consumption over time.

**Accuracy/Tolerance:** ±0.5% (constant power assumed)

---

### efficiency

**Efficiency** — Calculates efficiency and total losses from input and output power.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| P_out | Output Power | number | W | Yes |
| P_in | Input Power | number | W | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| efficiency | Efficiency | number | % |
| losses | Total Losses | number | W |

**Formula Summary:** `η = P_out / P_in × 100`, `Losses = P_in - P_out`

**Standard:** IEC 60034-1

**AI Explanation:** Efficiency is the ratio of useful output to total input power.

**Accuracy/Tolerance:** ±1% (steady-state rated conditions)

---

### power-factor

**Power Factor** — Calculates power factor, phase angle, and reactive power from active and apparent power.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| P | Active Power | number | W | Yes |
| S | Apparent Power | number | VA | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| cosPhi | Power Factor | number | — |
| phi | Phase Angle | number | deg |
| Q | Reactive Power | number | VAR |

**Formula Summary:** `cosφ = P / S`, `φ = arccos(P/S) × 180/π`, `Q = √(S² - P²)`

**Standard:** IEEE 1459

**AI Explanation:** Power factor is the ratio of active to apparent power in AC systems.

**Accuracy/Tolerance:** ±0.01 PF (sinusoidal waveform)

---

### three-phase-power

**Three-Phase Power** — Computes three-phase active, reactive, and apparent power for balanced wye or delta systems.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| V_LL | Line-to-Line Voltage | number | V | Yes | — |
| I | Line Current | number | A | Yes | — |
| cosPhi | Power Factor | number | — | No | 0.85 |
| system | System Type | enum | — | Yes | — |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| P_3ph | Three-Phase Active Power | number | W |
| Q_3ph | Three-Phase Reactive Power | number | VAR |
| S_3ph | Three-Phase Apparent Power | number | VA |

**Formula Summary:** `S_3ph = √3 × V_LL × I`, `P_3ph = S_3ph × cosφ`

**Standard:** IEC 60027

**AI Explanation:** Three-phase power calculation using line-to-line voltage and current. Assumes balanced system.

**Accuracy/Tolerance:** ±1% (balanced system)

---

### per-unit-conversion

**Per-Unit Conversion** — Normalizes power, voltage, and impedance values to a common base for system studies.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| S_actual | Actual Power | number | VA | Yes |
| S_base | Base Power | number | VA | Yes |
| V_actual | Actual Voltage | number | V | Yes |
| V_base | Base Voltage | number | V | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| S_pu | Power per unit | number | pu |
| V_pu | Voltage per unit | number | pu |
| Z_pu | Impedance per unit | number | pu |

**Formula Summary:** `S_pu = S_actual / S_base`, `V_pu = V_actual / V_base`, `Z_pu = S_pu / V_pu²`

**Standard:** IEEE 141

**AI Explanation:** Per-unit conversion normalizes electrical quantities to a common base for simplified system analysis.

**Accuracy/Tolerance:** Exact (mathematical conversion)

---

### symmetrical-components

**Symmetrical Components** — Decomposes unbalanced three-phase currents into zero, positive, and negative sequence components.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| Ia | Phase A Current | number | A | Yes |
| Ib | Phase B Current | number | A | Yes |
| Ic | Phase C Current | number | A | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| I0 | Zero Sequence | number | A |
| I1 | Positive Sequence | number | A |
| I2 | Negative Sequence | number | A |

**Formula Summary:** `I0 = (Ia + Ib + Ic) / 3`, `I1, I2` via ±120° rotation

**Standard:** IEEE 141

**AI Explanation:** Symmetrical components decompose unbalanced three-phase quantities into balanced sequence sets for fault analysis.

**Accuracy/Tolerance:** ±2% (linear system assumption)

---

### fault-current-base

**Fault Current Base** — Calculates base current, base impedance, and fault current for IEC 60909 short-circuit studies.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| S_base | Base Power | number | MVA | Yes |
| V_base | Base Voltage | number | kV | Yes |
| Z_pu | Impedance per unit | number | pu | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| I_base | Base Current | number | A |
| I_fault | Fault Current | number | kA |
| Z_base | Base Impedance | number | Ω |

**Formula Summary:** `I_base = S_base × 10⁶ / (√3 × V_base × 10³)`, `I_fault = I_base / Z_pu / 1000`

**Standard:** IEC 60909

**AI Explanation:** Fault current base calculation per IEC 60909 for short-circuit studies.

**Accuracy/Tolerance:** ±2% (pre-fault voltage assumed nominal)

---

## Cable (7 Plugins)

---

### cable-sizing

**Cable Sizing** — Determines minimum cable cross-sectional area based on design current, cable type, and installation conditions per IEC 60364.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| I_b | Design Current | number | A | Yes | — |
| cable_type | Cable Type | enum | — | Yes | — |
| ambient_temp | Ambient Temperature | number | °C | No | 40 |
| num_cores | Number of Cores | number | — | Yes | — |
| installation | Installation Method | enum | — | Yes | — |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| min_csa | Minimum Cross-Sectional Area | number | mm² |
| I_z | Cable Current Rating | number | A |
| recommended_size | Recommended Standard Size | number | mm² |

**Formula Summary:** Base rating adjusted by temperature factor; CSA selected from standard table based on adjusted current.

**Standard:** IEC 60364-5-52

**AI Explanation:** Determines minimum cable cross-sectional area based on design current, cable type, and installation conditions.

**Accuracy/Tolerance:** ±5% (standard conditions, copper conductor)

---

### cable-voltage-drop

**Cable Voltage Drop** — Calculates voltage drop along a cable run and checks compliance with IEC limits.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| I_b | Design Current | number | A | Yes | — |
| L | Cable Length | number | m | Yes | — |
| csa | Cross-Sectional Area | number | mm² | Yes | — |
| system | System Type | enum | — | Yes | — |
| cosPhi | Power Factor | number | — | No | 0.85 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| V_drop | Voltage Drop | number | V |
| V_drop_pct | Voltage Drop Percentage | number | % |
| status | Compliance Status | string | — |

**Formula Summary:** `V_drop = √3 × I_b × L × (R_cosφ + X_sinφ) / 1000` (three-phase)

**Standard:** IEC 60364-5-52

**AI Explanation:** Calculates voltage drop along a cable run and checks compliance with IEC limits (3% lighting, 5% other).

**Accuracy/Tolerance:** ±3% (copper at 70°C operating temperature)

---

### cable-ampacity

**Cable Ampacity** — Calculates current-carrying capacity with derating factors for temperature, grouping, and insulation type.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| csa | Cross-Sectional Area | number | mm² | Yes | — |
| insulation | Insulation Type | enum | — | Yes | — |
| num_cores | Number of Cores | number | — | Yes | — |
| installation | Installation Method | enum | — | Yes | — |
| ambient_temp | Ambient Temperature | number | °C | No | 40 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| I_z | Current Rating | number | A |
| temp_derating | Temperature Derating Factor | number | — |
| group_derating | Grouping Derating Factor | number | — |

**Formula Summary:** Base ampacity from CSA table × insulation factor × temperature derating × grouping derating.

**Standard:** IEC 60364-5-52

**AI Explanation:** Calculates cable current-carrying capacity with derating factors for temperature and grouping.

**Accuracy/Tolerance:** ±5% (standard installation)

---

### cable-short-circuit-withstand

**Cable Short-Circuit Withstand** — Calculates the short-circuit withstand capability of a cable based on adiabatic heating.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| csa | Cross-Sectional Area | number | mm² | Yes |
| material | Conductor Material | enum | — | Yes |
| insulation | Insulation Type | enum | — | Yes |
| t_sc | Short-Circuit Duration | number | s | Yes |
| I_initial | Initial Fault Current | number | A | No |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| I_withstand | Withstand Current Capacity | number | A |
| k_factor | K Factor | number | — |
| is_adequate | Adequate Sizing | boolean | — |

**Formula Summary:** `I_withstand = k × CSA / √t_sc` (adiabatic equation)

**Standard:** IEC 60364-5-54 / IEC 60724

**AI Explanation:** Calculates the short-circuit withstand capability of a cable based on adiabatic heating.

**Accuracy/Tolerance:** ±5% (adiabatic assumption)

---

### cable-derating-grouping

**Cable Derating — Grouping** — Determines the grouping correction factor for multiple cables in proximity.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| num_circuits | Number of Circuits | number | — | Yes |
| arrangement | Arrangement | enum | — | Yes |
| system_type | System Type | enum | — | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| grouping_factor | Grouping Derating Factor | number | — |
| description | Factor Description | string | — |

**Formula Summary:** Tabulated factors based on circuit count and spacing arrangement (touching: 0.80–0.50, spaced: 0.95–0.70).

**Standard:** IEC 60364-5-52

**AI Explanation:** Determines the grouping correction factor for multiple cables in proximity.

**Accuracy/Tolerance:** ±10% (depends on actual loading diversity)

---

### cable-derating-ambient

**Cable Derating — Ambient Temperature** — Calculates ambient temperature derating factor using IEC 60364 formula.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| ambient_temp | Ambient Temperature | number | °C | Yes | — |
| insulation | Insulation Type | enum | — | Yes | — |
| installation | Installation Medium | enum | — | Yes | — |
| base_temp | Reference Temperature | number | °C | No | 30 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| derating_factor | Ambient Temperature Derating Factor | number | — |
| status | Derating Status | string | — |

**Formula Summary:** `Factor = √((T_max - T_amb) / (T_max - T_base))`

**Standard:** IEC 60364-5-52

**AI Explanation:** Calculates ambient temperature derating factor for cables using the formula from IEC 60364.

**Accuracy/Tolerance:** ±3% (standard conductor temperature limits)

---

### cable-derating-soil

**Cable Derating — Soil Thermal Resistivity** — Calculates derating factors for buried cables based on soil thermal resistivity and burial depth.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| soil_rho | Soil Thermal Resistivity | number | K·m/W | Yes |
| depth | Burial Depth | number | m | Yes |
| csa | Cross-Sectional Area | number | mm² | Yes |
| insulation | Insulation Type | enum | — | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| soil_derating | Soil Thermal Derating Factor | number | — |
| depth_derating | Depth Derating Factor | number | — |
| combined_derating | Combined Soil Derating | number | — |

**Formula Summary:** Tabulated factors for soil thermal resistivity (1.12–0.73) multiplied by depth factor (1.02–0.89).

**Standard:** IEC 60364-5-52

**AI Explanation:** Derating factors for buried cables based on soil thermal resistivity and depth of burial.

**Accuracy/Tolerance:** ±10% (depends on soil uniformity)

---

## Transformer (8 Plugins)

---

### transformer-sizing

**Transformer Sizing** — Determines the recommended transformer rating based on connected load, demand factor, and growth margin.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| P_total | Total Connected Load | number | kVA | Yes | — |
| demand_factor | Demand Factor | number | — | No | 0.8 |
| future_growth | Future Growth Margin | number | % | No | 20 |
| load_type | Load Type | enum | — | Yes | — |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| S_demand | Demand Power | number | kVA |
| S_rated | Recommended Transformer Rating | number | kVA |
| overload_capacity | Available Overload Capacity | number | % |

**Formula Summary:** `S_demand = P_total × demand_factor`, `S_rated = S_demand × (1 + growth%) × load_type_factor`

**Standard:** IEC 60076

**AI Explanation:** Determines the recommended transformer rating based on connected load, demand factor, and growth margin.

**Accuracy/Tolerance:** ±5% (depends on demand factor accuracy)

---

### transformer-efficiency

**Transformer Efficiency** — Calculates efficiency at a given load factor using no-load and load losses.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| S_rated | Rated Power | number | kVA | Yes | — |
| P_no_load | No-Load Losses | number | W | Yes | — |
| P_load | Load Losses at Rated | number | W | Yes | — |
| load_factor | Load Factor | number | — | No | 1.0 |
| cosPhi | Power Factor | number | — | No | 0.9 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| efficiency | Efficiency at Given Load | number | % |
| total_losses | Total Losses | number | W |
| P_out | Output Power | number | W |

**Formula Summary:** `η = P_out / (P_out + P_no_load + load² × P_load) × 100`

**Standard:** IEC 60076-1

**AI Explanation:** Calculates transformer efficiency at a given load factor using no-load and load losses.

**Accuracy/Tolerance:** ±1% (based on provided loss data)

---

### transformer-losses

**Transformer Losses** — Estimates no-load and load losses from efficiency measurements at different load levels.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| S_rated | Rated Power | number | kVA | Yes |
| efficiency_at_full | Efficiency at 100% Load | number | % | Yes |
| efficiency_at_half | Efficiency at 50% Load | number | % | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| P_no_load | No-Load Losses (Estimated) | number | W |
| P_load | Load Losses at Rated (Estimated) | number | W |
| P_total_full | Total Losses at Full Load | number | W |

**Formula Summary:** Extrapolates P_no_load and P_load from efficiency data at two load points using the loss separation method.

**Standard:** IEC 60076-1

**AI Explanation:** Estimates transformer no-load and load losses from efficiency data at different load levels.

**Accuracy/Tolerance:** ±5% (estimation — actual values require factory test reports)

---

### transformer-regulation

**Transformer Voltage Regulation** — Calculates voltage regulation based on percentage impedance and loading.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| Z_pct | Impedance Voltage | number | % | Yes | — |
| X_R_ratio | X/R Ratio | number | — | Yes | — |
| load_factor | Load Factor | number | — | No | 1.0 |
| cosPhi | Power Factor | number | — | No | 0.9 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| R_pct | Resistance Component | number | % |
| X_pct | Reactance Component | number | % |
| regulation | Voltage Regulation | number | % |

**Formula Summary:** `Regulation = load × (R_pct × cosφ + X_pct × sinφ) + (load² × (X_pct × cosφ - R_pct × sinφ)² / 200)`

**Standard:** IEC 60076-1

**AI Explanation:** Calculates transformer voltage regulation based on impedance and loading.

**Accuracy/Tolerance:** ±2% (sinusoidal waveform, constant primary voltage)

---

### transformer-impedance

**Transformer Impedance** — Converts percentage impedance to actual ohmic values and calculates fault current contribution.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| S_rated | Rated Power | number | MVA | Yes | — |
| V_primary | Primary Voltage | number | kV | Yes | — |
| Z_pct | Impedance Voltage | number | % | Yes | — |
| X_R_ratio | X/R Ratio | number | — | No | 5 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| Z_actual | Actual Impedance | number | Ω |
| R_actual | Actual Resistance | number | Ω |
| X_actual | Actual Reactance | number | Ω |
| I_fault | Symmetrical Fault Current | number | A |

**Formula Summary:** `Z_base = V_primary² / S_rated`, `Z_actual = Z_pct / 100 × Z_base`

**Standard:** IEC 60076-5

**AI Explanation:** Converts transformer percentage impedance to actual ohmic values and calculates fault current contribution.

**Accuracy/Tolerance:** ±3% (infinite bus assumed for fault current)

---

### transformer-temperature-rise

**Transformer Temperature Rise** — Estimates temperature rise based on losses, cooling surface area, and cooling type.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| P_no_load | No-Load Losses | number | W | Yes | — |
| P_load | Load Losses | number | W | Yes | — |
| surface_area | Effective Cooling Surface Area | number | m² | Yes | — |
| load_factor | Load Factor | number | — | No | 1.0 |
| cooling | Cooling Type | enum | — | Yes | — |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| total_losses | Total Heat to Dissipate | number | W |
| temp_rise | Estimated Temperature Rise | number | K |
| is_compliant | Compliance with IEC 60076-2 | boolean | — |

**Formula Summary:** `temp_rise = total_losses / (surface_area × cooling_coefficient / 100)`

**Standard:** IEC 60076-2

**AI Explanation:** Estimates transformer temperature rise based on losses and cooling system.

**Accuracy/Tolerance:** ±10% (uniform heat distribution assumed)

---

### transformer-loading

**Transformer Loading** — Assesses loading condition and estimates insulation aging per IEC 60076-7.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| S_rated | Rated Power | number | kVA | Yes | — |
| P_load_actual | Actual Load | number | kVA | Yes | — |
| ambient_temp | Ambient Temperature | number | °C | No | 30 |
| prior_loading | Prior Loading Factor | number | — | No | 0.7 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| loading_factor | Loading Factor | number | pu |
| status | Loading Status | string | — |
| normal_life | Estimated Insulation Life | number | years |

**Formula Summary:** `hot_spot_temp = T_amb + 65 × load¹·⁶ + 15`, `aging_rate = 2^((T_hs - 98) / 6)`

**Standard:** IEC 60076-7

**AI Explanation:** Assesses transformer loading condition and estimates insulation aging per IEC 60076-7.

**Accuracy/Tolerance:** ±15% (insulation life estimation)

---

### transformer-parallel-operation

**Transformer Parallel Operation** — Calculates load sharing between two transformers operating in parallel.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| S_1 | Transformer 1 Rating | number | kVA | Yes |
| Z_1 | Transformer 1 Impedance | number | % | Yes |
| S_2 | Transformer 2 Rating | number | kVA | Yes |
| Z_2 | Transformer 2 Impedance | number | % | Yes |
| S_total | Total Load | number | kVA | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| S_1_share | T1 Load Share | number | kVA |
| S_2_share | T2 Load Share | number | kVA |
| load_ratio_1 | T1 Loading | number | % |
| load_ratio_2 | T2 Loading | number | % |
| is_balanced | Load Sharing Balanced | boolean | — |

**Formula Summary:** `S_1_share = S_total × (S_1/Z_1) / (S_1/Z_1 + S_2/Z_2)`

**Standard:** IEC 60076-1

**AI Explanation:** Calculates load sharing between two transformers operating in parallel.

**Accuracy/Tolerance:** ±2% (same voltage ratio and vector group required)

---

## Short Circuit (7 Plugins)

---

### sc-three-phase

**Three-Phase Short Circuit** — Calculates initial symmetrical short-circuit current, power, and breaking current per IEC 60909.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| V_n | Nominal Voltage | number | V | Yes | — |
| Z_positive | Positive Sequence Impedance | number | Ω | Yes | — |
| c_factor | Voltage Factor c | number | — | No | 1.1 |
| R_X_ratio | R/X Ratio | number | — | No | 0.1 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| I_k3 | Initial Symmetrical SC Current | number | kA |
| S_k3 | Initial SC Power | number | MVA |
| I_b | Symmetrical Breaking Current | number | kA |

**Formula Summary:** `I_k3 = c × V_n / (√3 × Z_pos) / 1000`

**Standard:** IEC 60909

**AI Explanation:** Three-phase short-circuit calculation per IEC 60909 using the equivalent voltage source method.

**Accuracy/Tolerance:** ±3% (equivalent voltage source method)

---

### sc-line-line

**Line-to-Line Short Circuit** — Calculates phase-to-phase short-circuit current per IEC 60909.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| V_n | Nominal Voltage | number | V | Yes | — |
| Z_positive | Positive Sequence Impedance | number | Ω | Yes | — |
| Z_negative | Negative Sequence Impedance | number | Ω | No | — |
| c_factor | Voltage Factor c | number | — | No | 1.1 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| I_k2 | Line-to-Line SC Current | number | kA |
| ratio_to_3ph | Ratio to Three-Phase SC | number | — |

**Formula Summary:** `I_k2 = c × V_n / (Z_pos + Z_neg) / 1000`

**Standard:** IEC 60909

**AI Explanation:** Line-to-line short-circuit calculation per IEC 60909. Typically ~87% of three-phase SC.

**Accuracy/Tolerance:** ±3%

---

### sc-single-line-ground

**Single Line-to-Ground Short Circuit** — Calculates SLG fault current using symmetrical components per IEC 60909.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| V_n | Nominal Voltage | number | V | Yes | — |
| Z_positive | Positive Sequence Impedance | number | Ω | Yes | — |
| Z_negative | Negative Sequence Impedance | number | Ω | No | — |
| Z_zero | Zero Sequence Impedance | number | Ω | Yes | — |
| c_factor | Voltage Factor c | number | — | No | 1.1 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| I_k1 | Single Line-to-Ground SC Current | number | kA |
| Z_total | Total Sequence Impedance | number | Ω |

**Formula Summary:** `I_k1 = √3 × c × V_n / (Z_pos + Z_neg + Z_zero) / 1000`

**Standard:** IEC 60909

**AI Explanation:** Single line-to-ground short-circuit calculation per IEC 60909 using symmetrical components.

**Accuracy/Tolerance:** ±5% (depends heavily on zero sequence impedance accuracy)

---

### sc-peak-current

**Peak Short-Circuit Current** — Calculates peak making current using the κ factor per IEC 60909.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| I_k | Initial Symmetrical SC Current | number | kA | Yes |
| R_X_ratio | R/X Ratio at Fault Point | number | — | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| kappa | Peak Factor κ | number | — |
| I_p | Peak Short-Circuit Current | number | kA |

**Formula Summary:** `κ = 1.02 + 0.98 × e^(-3 × R/X)`, `I_p = κ × √2 × I_k`

**Standard:** IEC 60909

**AI Explanation:** Calculates peak short-circuit current (making current) per IEC 60909 using the κ factor.

**Accuracy/Tolerance:** ±5% (κ limited to ≤ 2.0)

---

### sc-breaking-current

**Symmetrical Breaking Current** — Calculates breaking current and DC component for circuit breaker selection per IEC 60909.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| I_k | Initial Symmetrical SC Current | number | kA | Yes | — |
| t_min | Minimum Breaker Operating Time | number | s | Yes | — |
| R_X_ratio | R/X Ratio | number | — | Yes | — |
| I_rated_gen | Rated Generator Current | number | A | No | 0 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| mu | Breaking Factor μ | number | — |
| I_b | Symmetrical Breaking Current | number | kA |
| DC_component | DC Component at Contact Separation | number | % |

**Formula Summary:** `I_b = μ × I_k`, `DC% = 100 × √2 × e^(-2π × R/X × t_min)`

**Standard:** IEC 60909

**AI Explanation:** Calculates symmetrical breaking current per IEC 60909 for circuit breaker selection.

**Accuracy/Tolerance:** ±5% (breaker operating time dependent)

---

### sc-making-current

**Making Current (Peak)** — Calculates making current for circuit breaker closing duty per IEC 60909.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| I_k | Initial Symmetrical SC Current | number | kA | Yes |
| kappa | Peak Factor κ | number | — | Yes |
| breaker_type | Breaker Type | enum | — | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| I_making | Making Current | number | kA |
| I_making_rms | Making Current (RMS equivalent) | number | kA |
| margin | Margin to Rated Making Capacity | number | % |

**Formula Summary:** `I_making = κ × √2 × I_k`

**Standard:** IEC 60909

**AI Explanation:** Calculates the making current (peak and RMS) for circuit breaker closing duty.

**Accuracy/Tolerance:** ±5%

---

### sc-thermal-equivalent

**Thermal Equivalent SC Current** — Calculates I_th and I²t for conductor heating assessment per IEC 60909.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| I_k | Initial Symmetrical SC Current | number | kA | Yes |
| I_b | Symmetrical Breaking Current | number | kA | Yes |
| t_k | Fault Duration | number | s | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| m_factor | Thermal Equivalent Factor m | number | — |
| n_factor | Thermal Equivalent Factor n | number | — |
| I_th | Thermal Equivalent SC Current | number | kA |
| I2t | Energy Let-Through | number | kA²s |

**Formula Summary:** `I_th = I_k × √(m / (2 × 50 × t_k) + n)`

**Standard:** IEC 60909

**AI Explanation:** Calculates the thermal equivalent short-circuit current for conductor heating assessment.

**Accuracy/Tolerance:** ±5% (adiabatic, durations ≤ 5s)

---

## Grounding (6 Plugins)

---

### grounding-earth-resistance

**Earth Resistance** — Calculates earth resistance of grounding rods using the IEEE 80 formula.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| rho | Soil Resistivity | number | Ω·m | Yes | — |
| L | Rod Length | number | m | Yes | — |
| d | Rod Diameter | number | m | Yes | — |
| configuration | Rod Configuration | enum | — | Yes | — |
| num_rods | Number of Rods | number | — | No | 1 |
| spacing | Rod Spacing | number | m | No | 3 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| R_g | Earth Resistance (Single Rod) | number | Ω |
| R_effective | Effective Resistance (Multiple Rods) | number | Ω |
| is_compliant | Compliant with IEEE 80 (≤5Ω) | boolean | — |

**Formula Summary:** `R_g = ρ / (2πL) × (ln(8L/d) - 1)` (single rod)

**Standard:** IEEE 80

**AI Explanation:** Calculates earth resistance of grounding rods using the standard IEEE 80 formula.

**Accuracy/Tolerance:** ±10% (uniform soil assumption)

---

### grounding-grid-resistance

**Grid Resistance** — Calculates substation grounding grid resistance using the Sverak formula per IEEE 80.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| rho | Soil Resistivity | number | Ω·m | Yes | — |
| A | Grid Area | number | m² | Yes | — |
| L_total | Total Conductor Length | number | m | Yes | — |
| d | Conductor Diameter | number | m | Yes | — |
| h | Grid Burial Depth | number | m | No | 0.5 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| R_g | Grid Resistance | number | Ω |
| R_s | Surface Layer Resistance | number | Ω |

**Formula Summary:** `R_g = ρ × (1/√A + 1/(L + 20A(1 + 1/(1 + h√A/A))))`

**Standard:** IEEE 80

**AI Explanation:** Calculates the resistance of a substation grounding grid using the Sverak formula per IEEE 80.

**Accuracy/Tolerance:** ±10% (uniform soil assumed)

---

### grounding-touch-voltage

**Touch Voltage** — Calculates actual and allowable touch voltage per IEEE 80 for substation grounding safety.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| I_G | Maximum Grid Current | number | A | Yes | — |
| rho_s | Surface Layer Resistivity | number | Ω·m | Yes | — |
| h_s | Surface Layer Thickness | number | m | Yes | — |
| D | Grid Spacing | number | m | Yes | — |
| d | Conductor Diameter | number | m | Yes | — |
| h | Grid Burial Depth | number | m | No | 0.5 |
| n | Parallel Conductors | number | — | Yes | — |
| m | Cross Conductors | number | — | Yes | — |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| E_touch | Actual Touch Voltage | number | V |
| E_touch_limit | Allowable Touch Voltage (50kg) | number | V |
| is_safe | Safe for 50kg Person | boolean | — |

**Formula Summary:** `E_touch = ρ_s × K_m × K_i × I_G / L_eff`, `E_limit = (1000 + 1.5 × C_s × ρ_s) × 0.116`

**Standard:** IEEE 80

**AI Explanation:** Calculates actual and allowable touch voltage per IEEE 80 for substation grounding safety.

**Accuracy/Tolerance:** ±10% (uniform soil, 50kg body weight)

---

### grounding-step-voltage

**Step Voltage** — Calculates actual and allowable step voltage per IEEE 80 for substation grounding safety.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| I_G | Maximum Grid Current | number | A | Yes | — |
| rho_s | Surface Layer Resistivity | number | Ω·m | Yes | — |
| h_s | Surface Layer Thickness | number | m | Yes | — |
| D | Grid Spacing | number | m | Yes | — |
| h | Grid Burial Depth | number | m | No | 0.5 |
| L_eff | Effective Conductor Length | number | m | Yes | — |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| E_step | Actual Step Voltage | number | V |
| E_step_limit | Allowable Step Voltage (50kg) | number | V |
| is_safe | Safe for 50kg Person | boolean | — |

**Formula Summary:** `E_step = ρ_s × K_s × I_G × 1000 / L_eff`, `E_limit = (1000 + 6 × C_s × ρ_s) × 0.116`

**Standard:** IEEE 80

**AI Explanation:** Calculates actual and allowable step voltage per IEEE 80 for substation grounding safety.

**Accuracy/Tolerance:** ±10% (uniform soil, 0.5m step distance)

---

### grounding-conductor-sizing

**Grounding Conductor Sizing** — Sizes grounding conductors per IEEE 80 based on fault current magnitude and duration.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| I_fault | Maximum Fault Current | number | A | Yes |
| t_fault | Fault Duration | number | s | Yes |
| material | Conductor Material | enum | — | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| A_kcmil | Minimum Conductor Size | number | kcmil |
| A_mm2 | Minimum Conductor Size | number | mm² |
| k_factor | Material Constant k | number | — |

**Formula Summary:** `A = I_fault × √t_fault / √((TCAP × 10⁴ / (α_r × ρ_r × 10⁻⁴)) × ln((1 + α_r(T_m - 20)) / (1 + α_r(40 - 20))))`

**Standard:** IEEE 80 / NEC 250

**AI Explanation:** Sizes grounding conductors per IEEE 80 based on fault current magnitude and duration.

**Accuracy/Tolerance:** ±5% (adiabatic heating)

---

### grounding-rod-sizing

**Grounding Rod Sizing** — Determines required rod length and number of rods to achieve target earth resistance.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| rho | Soil Resistivity | number | Ω·m | Yes | — |
| target_R | Target Earth Resistance | number | Ω | Yes | — |
| rod_diameter | Rod Diameter | number | mm | No | 16 |
| rod_type | Rod Material | enum | — | Yes | — |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| L_required | Required Rod Length | number | m |
| R_single | Single Rod Resistance (2.4m) | number | Ω |
| num_rods | Number of Rods Needed (2.4m each) | number | — |

**Formula Summary:** `L_required = ρ / (2π × R_target) × (ln(8 × ρ / (2π × R_target) / d) - 1)`

**Standard:** IEEE 80 / NEC 250.52

**AI Explanation:** Determines required grounding rod length and number of rods to achieve target earth resistance.

**Accuracy/Tolerance:** ±15% (rocky soil may prevent full rod penetration)

---

## Protection (7 Plugins)

---

### protection-fuse-sizing

**Fuse Sizing** — Selects appropriate fuse rating based on load type and starting conditions per IEC 60269.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| I_nominal | Full Load Current | number | A | Yes |
| load_type | Load Type | enum | — | Yes |
| fuse_class | Fuse Class | enum | — | Yes |
| starting_current | Starting/Inrush Current | number | A | No |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| I_fuse_rated | Recommended Fuse Rating | number | A |
| fuse_standard_size | Standard Fuse Size | number | A |
| margin | Design Margin | number | % |

**Formula Summary:** `min_rating = I_nominal × factor` (motor: 1.5, transformer: 1.25, capacitor: 1.65)

**Standard:** IEC 60269 / NEC 240

**AI Explanation:** Selects appropriate fuse rating based on load type and starting conditions per IEC 60269.

**Accuracy/Tolerance:** ±5% (standard fuse sizes applied)

---

### protection-mcb-selection

**MCB Selection** — Selects miniature circuit breaker rating and trip curve per IEC 60898.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| I_nominal | Full Load Current | number | A | Yes | — |
| load_type | Load Type | enum | — | Yes | — |
| I_sc | Prospective SC Current | number | kA | Yes | — |
| num_poles | Number of Poles | number | — | No | 1 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| In_rated | MCB Rated Current | number | A |
| trip_curve | Recommended Trip Curve | string | — |
| breaking_capacity | Required Breaking Capacity | number | kA |

**Formula Summary:** `In = I_nominal × factor` (traces to standard rating); Curve B/C/D per load type.

**Standard:** IEC 60898

**AI Explanation:** Selects miniature circuit breaker rating and trip curve based on load characteristics per IEC 60898.

**Accuracy/Tolerance:** ±5%

---

### protection-mccb-selection

**MCCB Selection** — Selects MCCB rating, breaking capacity, and frame size per IEC 60947-2.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| I_nominal | Full Load Current | number | A | Yes | — |
| I_sc | Prospective SC Current | number | kA | Yes | — |
| application | Application | enum | — | Yes | — |
| num_poles | Number of Poles | number | — | No | 3 |
| selective | Selective Coordination Required | boolean | — | No | false |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| In_rated | MCCB Rated Current | number | A |
| Icu_required | Required Ultimate Breaking Capacity | number | kA |
| Ics_required | Required Service Breaking Capacity | number | kA |
| frame_size | Recommended Frame Size | string | — |

**Formula Summary:** `In = I_nominal × application_factor`, `Icu = I_sc × (1.25 if selective else 1.0)`

**Standard:** IEC 60947-2

**AI Explanation:** Selects MCCB rating, breaking capacity, and frame size per IEC 60947-2.

**Accuracy/Tolerance:** ±5%

---

### protection-acb-selection

**ACB Selection** — Selects air circuit breaker rating and protection functions per IEC 60947-2.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| I_nominal | Full Load Current | number | A | Yes | — |
| I_sc | Prospective SC Current | number | kA | Yes | — |
| application | Application | enum | — | Yes | — |
| num_poles | Number of Poles | number | — | No | 3 |
| with_neutral | Neutral Protection Required | boolean | — | No | false |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| In_rated | ACB Rated Current | number | A |
| Icu_required | Required Breaking Capacity | number | kA |
| standard_rating | Standard ACB Rating | number | A |
| protection_functions | Required Protection Functions | string | — |

**Formula Summary:** Protection functions: `L` (long-time), `S` (short-time), `I` (instantaneous), `G` (ground fault)

**Standard:** IEC 60947-2

**AI Explanation:** Selects air circuit breaker rating and protection functions per IEC 60947-2.

**Accuracy/Tolerance:** ±5%

---

### protection-relay-ct-sizing

**CT Sizing for Protection Relays** — Sizes current transformers including ratio, burden, and accuracy class per IEC 61869-2.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| I_nominal | Primary Full Load Current | number | A | Yes | — |
| I_sc_max | Maximum SC Current | number | kA | Yes | — |
| relay_type | Protection Relay Type | enum | — | Yes | — |
| lead_length | CT Lead Length (one-way) | number | m | No | 50 |
| lead_size | Lead Conductor Size | number | mm² | No | 4 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| CT_ratio | Recommended CT Ratio | string | — |
| VA_required | Required CT Burden | number | VA |
| accuracy_class | Required Accuracy Class | string | — |
| ALF | Required Accuracy Limit Factor | number | — |

**Formula Summary:** `CT_primary = I_nominal × factor`, `VA = relay_burden + lead_resistance`

**Standard:** IEC 61869-2 / IEEE C57.13

**AI Explanation:** Sizes current transformers for protection relays including ratio, burden, and accuracy class per IEC 61869-2.

**Accuracy/Tolerance:** ±5% (ALF verification against saturation limit)

---

### protection-coordination

**Protection Coordination** — Checks selective coordination between upstream and downstream protection devices.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| I_fault_main | Main Device Fault Current | number | kA | Yes | — |
| I_fault_downstream | Downstream Device Fault Current | number | kA | Yes | — |
| t_main | Main Device Operating Time | number | s | Yes | — |
| t_downstream | Downstream Device Operating Time | number | s | Yes | — |
| margin | Required Coordination Margin | number | s | No | 0.2 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| is_selective | Selective Coordination Achieved | boolean | — |
| time_margin | Actual Time Margin | number | s |
| recommendation | Coordination Recommendation | string | — |

**Formula Summary:** `time_margin = t_main - t_downstream`, selective if `time_margin ≥ margin`

**Standard:** IEC 60909 / IEEE 242

**AI Explanation:** Checks selective coordination between upstream and downstream protection devices.

**Accuracy/Tolerance:** ±10% (relay timing accuracy dependent)

---

### protection-breaking-capacity

**Breaking Capacity** — Determines minimum breaking capacity requirement for protection devices.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| I_sc_prospective | Prospective SC Current at Installation Point | number | kA | Yes | — |
| device_type | Device Type | enum | — | Yes | — |
| system_voltage | System Voltage | number | V | Yes | — |
| safety_factor | Safety Factor | number | — | No | 1.25 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| Icu_min | Minimum Breaking Capacity Required | number | kA |
| Ics_min | Minimum Service Breaking Capacity | number | kA |
| recommended_class | Recommended Breaking Capacity Class | string | — |

**Formula Summary:** `Icu_min = I_sc_prospective × safety_factor`

**Standard:** IEC 60947-2

**AI Explanation:** Determines the minimum breaking capacity requirement for protection devices based on prospective SC current.

**Accuracy/Tolerance:** +0% (safety factor applied — must not be lower than calculated)

---

## Motor (6 Plugins)

---

### motor-current

**Motor Full Load Current** — Calculates motor full load current from power rating, voltage, efficiency, and power factor.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| P_rated | Motor Rated Power | number | kW | Yes | — |
| V_rated | Rated Voltage | number | V | Yes | — |
| cosPhi | Power Factor | number | — | No | 0.85 |
| efficiency | Efficiency | number | % | No | 90 |
| system | System Type | enum | — | Yes | — |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| I_FL | Full Load Current | number | A |
| I_NL | No-Load Current (Estimated) | number | A |
| kVA_rating | Motor kVA Rating | number | kVA |

**Formula Summary:** `I_FL = P × 1000 / (√3 × V × cosφ × η/100)` (three-phase)

**Standard:** IEC 60034-1 / NEMA MG-1

**AI Explanation:** Calculates motor full load current based on power rating, voltage, efficiency, and power factor.

**Accuracy/Tolerance:** ±3% (standard induction motor characteristics)

---

### motor-starting-current

**Motor Starting Current** — Calculates locked rotor current and effective starting current based on NEMA code and starting method.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| I_FL | Full Load Current | number | A | Yes |
| NEMA_code | NEMA Locked Rotor Code | enum | — | Yes |
| P_rated | Motor Rated Power | number | HP | No |
| start_method | Starting Method | enum | — | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| I_LRC | Locked Rotor Current | number | A |
| I_start | Actual Starting Current | number | A |
| start_ratio | Starting Current / FLA | number | — |

**Formula Summary:** `I_start = I_LRC × method_factor` (DOL: 1.0, star-delta: 0.33, VFD: 0.1)

**Standard:** IEC 60034-1 / NEMA MG-1

**AI Explanation:** Calculates motor locked rotor current and effective starting current based on NEMA code and starting method.

**Accuracy/Tolerance:** ±10% (depends on motor design and supply impedance)

---

### motor-voltage-drop-starting

**Motor Starting Voltage Dip** — Calculates voltage dip during motor starting due to inrush current and source impedance.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| I_start | Starting Current | number | A | Yes | — |
| Z_source | Source Impedance at PCC | number | Ω | Yes | — |
| V_nominal | Nominal Voltage | number | V | Yes | — |
| cosPhi_start | Starting Power Factor | number | — | No | 0.3 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| V_dip | Voltage Dip During Start | number | V |
| V_dip_pct | Voltage Dip Percentage | number | % |
| is_acceptable | Within Acceptable Limit (15%) | boolean | — |

**Formula Summary:** `V_dip = √3 × I_start × Z_source × cosφ_start`

**Standard:** IEC 60034-1

**AI Explanation:** Calculates voltage dip during motor starting due to inrush current and source impedance.

**Accuracy/Tolerance:** ±5% (source impedance accuracy dependent)

---

### motor-starting-method

**Motor Starting Method Selection** — Recommends motor starting method based on power, supply capacity, and allowable dip.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| P_rated | Motor Rated Power | number | kW | Yes | — |
| V_system | System Voltage | number | V | Yes | — |
| supply_capacity | Supply SC Capacity at PCC | number | MVA | Yes | — |
| load_type | Driven Load Type | enum | — | Yes | — |
| max_dip_allowed | Maximum Allowed Voltage Dip | number | % | No | 15 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| recommended_method | Recommended Starting Method | string | — |
| V_dip_estimated | Estimated Voltage Dip | number | % |
| feasible_DOL | Direct-On-Line Feasible | boolean | — |

**Formula Summary:** `supply_ratio = MVA_sc / P_rated × 1000`, DOL if ratio sufficient

**Standard:** IEC 60034-1 / NEMA MG-1

**AI Explanation:** Recommends motor starting method based on power rating, supply capacity, and allowable voltage dip.

**Accuracy/Tolerance:** ±10% (estimation based on supply ratio)

---

### motor-cable-sizing

**Motor Cable Sizing** — Sizes motor feeder cables considering continuous rating, starting current, and voltage drop.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| I_FL | Full Load Current | number | A | Yes | — |
| I_start | Starting Current | number | A | Yes | — |
| L | Cable Length | number | m | Yes | — |
| cable_type | Cable Type | enum | — | Yes | — |
| installation | Installation Method | enum | — | Yes | — |
| ambient_temp | Ambient Temperature | number | °C | No | 40 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| min_csa_continuous | Min CSA for Continuous Rating | number | mm² |
| min_csa_vdrop | Min CSA for Voltage Drop (Start) | number | mm² |
| recommended_csa | Recommended CSA | number | mm² |
| V_drop_start_pct | Voltage Drop at Starting | number | % |

**Formula Summary:** CSA selected for continuous rating, then verified against 15% starting voltage drop limit.

**Standard:** IEC 60364-5-52 / NEMA MG-1

**AI Explanation:** Sizes motor feeder cables considering continuous rating, starting current, and voltage drop.

**Accuracy/Tolerance:** ±5% (copper conductor, 400V system)

---

### motor-protection-sizing

**Motor Protection Sizing** — Sizes overload and short-circuit protection devices per IEC 60947-4-1.

**Inputs:**
| Parameter | Label | Type | Unit | Required |
|-----------|-------|------|------|----------|
| I_FL | Full Load Current | number | A | Yes |
| I_LRC | Locked Rotor Current | number | A | Yes |
| I_sc | Prospective SC Current at Motor Terminal | number | kA | Yes |
| protection_type | Protection Type | enum | — | Yes |
| application | Application | enum | — | Yes |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| overload_relay_setting | Overload Relay Setting | number | A |
| sc_protection_rating | SC Protection Rating | number | A |
| type2_coordination | Type 2 Coordination Achievable | boolean | — |
| recommended_device | Recommended Protection Device | string | — |

**Formula Summary:** Overload = I_FL × 1.05 (general) or × 1.15 (critical); SC rating per I_LRC / factor

**Standard:** IEC 60947-4-1 / NEMA ICS 2

**AI Explanation:** Sizes motor overload and short-circuit protection devices per IEC 60947-4-1.

**Accuracy/Tolerance:** ±5%

---

## Power Quality (5 Plugins)

---

### pq-power-factor-correction

**Power Factor Correction** — Calculates required capacitive reactive power to achieve target power factor.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| P | Active Power | number | kW | Yes | — |
| cosPhi_actual | Actual Power Factor | number | — | Yes | — |
| cosPhi_target | Target Power Factor | number | — | Yes | — |
| V_system | System Voltage | number | V | No | 400 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| Q_c | Required Capacitive Reactive Power | number | kVAR |
| C_value | Required Capacitance (per phase wye) | number | µF |
| I_capacitive | Capacitor Current | number | A |
| savings_kW | Estimated Loss Reduction | number | kW |

**Formula Summary:** `Q_c = P × (tan(φ_actual) - tan(φ_target))`

**Standard:** IEEE 1459 / IEC 61000

**AI Explanation:** Calculates required reactive power compensation to achieve target power factor.

**Accuracy/Tolerance:** ±3% (sinusoidal waveform)

---

### pq-capacitor-bank

**Capacitor Bank Design** — Designs capacitor bank configuration including step size, connection type, and detuning reactor.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| Q_total | Total Required kVAR | number | kVAR | Yes | — |
| V_system | System Voltage | number | V | Yes | — |
| num_steps | Number of Steps | number | — | Yes | — |
| connection | Connection Type | enum | — | Yes | — |
| detuning | Detuning Reactor | enum | — | No | none |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| Q_per_step | kVAR per Step | number | kVAR |
| C_per_step | Capacitance per Step | number | µF |
| I_rated | Rated Capacitor Current | number | A |
| resonant_freq | Resonant Frequency (with detuning) | number | Hz |

**Formula Summary:** `Q_per_step = Q_total / steps`, `C_per_step = Q_step × 1000 / (2π × 50 × V²)`

**Standard:** IEC 60831 / IEEE 18

**AI Explanation:** Designs capacitor bank configuration including step size, connection type, and detuning reactor.

**Accuracy/Tolerance:** ±5% (standard capacitor units)

---

### pq-reactive-power

**Reactive Power Analysis** — Calculates reactive power from apparent and active power measurements.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| S | Apparent Power | number | kVA | Yes | — |
| P | Active Power | number | kW | Yes | — |
| V_LL | Line-to-Line Voltage | number | V | No | 400 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| Q | Total Reactive Power | number | kVAR |
| cosPhi | Power Factor | number | — |
| phi | Phase Angle | number | deg |
| I_reactive | Reactive Current Component | number | A |

**Formula Summary:** `Q = √(S² - P²)`, `cosφ = P / S`

**Standard:** IEEE 1459

**AI Explanation:** Calculates reactive power from apparent and active power measurements.

**Accuracy/Tolerance:** ±1% (fundamental frequency)

---

### pq-harmonic-estimation

**Harmonic Distortion Estimation** — Estimates voltage THD and current TDD based on load type and system strength per IEEE 519.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| load_type | Load Type | enum | — | Yes | — |
| S_load | Load kVA Rating | number | kVA | Yes | — |
| S_sc | SC Capacity at PCC | number | MVA | Yes | — |
| V_system | System Voltage | number | kV | No | 0.4 |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| THD_v_estimated | Estimated Voltage THD | number | % |
| ITDD_estimated | Estimated Current TDD | number | % |
| dominant_harmonics | Dominant Harmonic Orders | string | — |
| IEEE519_compliant | Compliant with IEEE 519 limits | boolean | — |

**Formula Summary:** THD and TDD from load-type typical spectra; verified against SCR ratio.

**Standard:** IEEE 519 / IEC 61000-2-4

**AI Explanation:** Estimates harmonic distortion levels based on load type and system strength per IEEE 519.

**Accuracy/Tolerance:** ±15% (estimation — actual measurement recommended)

---

### pq-voltage-regulation

**Voltage Regulation Assessment** — Assesses voltage deviation against IEC 60038 tolerances and recommends corrective action.

**Inputs:**
| Parameter | Label | Type | Unit | Required | Default |
|-----------|-------|------|------|----------|---------|
| V_nominal | Nominal Voltage | number | V | Yes | — |
| V_actual | Actual Measured Voltage | number | V | Yes | — |
| system_type | System Type | enum | — | Yes | — |
| regulation_devices | Available Regulation Devices | enum | — | No | none |

**Outputs:**
| Parameter | Label | Type | Unit |
|-----------|-------|------|------|
| deviation_pct | Voltage Deviation | number | % |
| status | Compliance Status | string | — |
| regulation_available_pct | Regulation Available | number | % |
| corrected_voltage | Corrected Voltage (with device) | number | V |

**Formula Summary:** `deviation = (V_actual - V_nominal) / V_nominal × 100`

**Standard:** IEC 60038 / IEEE 141

**AI Explanation:** Assesses voltage regulation against IEC 60038 nominal voltage tolerances and recommends corrective action.

**Accuracy/Tolerance:** ±2% (steady-state measurement)
