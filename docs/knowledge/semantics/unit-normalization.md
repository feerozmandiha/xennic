# یکسان‌سازی واحدها — Unit Normalization

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Purpose — هدف

Create the official engineering unit model for Xennic. Every unit must have a canonical form, conversion rules, and formatting standards. This ensures numerical values across all documents and AI outputs are consistent and comparable.

---

## Unit Structure — ساختار واحد

| Field | Description | Example |
|-------|-------------|---------|
| `unit_id` | Unique identifier | XEN-UNIT-0001 |
| `canonical_name` | Preferred unit name | Volt |
| `symbol` | Standard symbol | V |
| `symbol_fa` | Persian symbol representation | ولت |
| `quantity` | Measured quantity | Voltage |
| `aliases` | Alternative non-canonical forms | volt, v, VOLT |
| `si_status` | SI-compliant? | Yes |
| `conversion_rule` | To/from SI base | 1 V = 1 kg·m²·s⁻³·A⁻¹ |

---

## SI Base & Derived Units — واحدهای پایه و مشتق SI

| ID | Unit | Symbol | Symbol (FA) | Quantity | SI Status | Conversion Rule |
|----|------|--------|-------------|----------|-----------|-----------------|
| XEN-UNIT-0001 | Volt | V | ولت | Voltage | SI derived | 1 V = 1 kg·m²·s⁻³·A⁻¹ |
| XEN-UNIT-0002 | Ampere | A | آمپر | Current | SI base | — |
| XEN-UNIT-0003 | Ohm | Ω | اهم | Resistance | SI derived | 1 Ω = 1 V/A |
| XEN-UNIT-0004 | Siemens | S | زیمنس | Conductance | SI derived | 1 S = 1 A/V |
| XEN-UNIT-0005 | Watt | W | وات | Power (active) | SI derived | 1 W = 1 J/s |
| XEN-UNIT-0006 | Volt-Ampere | VA | ولت آمپر | Power (apparent) | SI derived | 1 VA = 1 W (magnitude only) |
| XEN-UNIT-0007 | VAR | VAR | وار | Power (reactive) | SI derived | 1 VAR = 1 W (magnitude only) |
| XEN-UNIT-0008 | Hertz | Hz | هرتز | Frequency | SI derived | 1 Hz = 1 s⁻¹ |
| XEN-UNIT-0009 | Farad | F | فاراد | Capacitance | SI derived | 1 F = 1 C/V |
| XEN-UNIT-0010 | Henry | H | هنری | Inductance | SI derived | 1 H = 1 Wb/A |
| XEN-UNIT-0011 | Weber | Wb | وبر | Magnetic flux | SI derived | 1 Wb = 1 V·s |
| XEN-UNIT-0012 | Tesla | T | تسلا | Magnetic flux density | SI derived | 1 T = 1 Wb/m² |
| XEN-UNIT-0013 | Joule | J | ژول | Energy | SI derived | 1 J = 1 N·m |
| XEN-UNIT-0014 | Coulomb | C | کولن | Electric charge | SI derived | 1 C = 1 A·s |
| XEN-UNIT-0015 | Second | s | ثانیه | Time | SI base | — |
| XEN-UNIT-0016 | Meter | m | متر | Length | SI base | — |
| XEN-UNIT-0017 | Kilogram | kg | کیلوگرم | Mass | SI base | — |

---

## Multiples & Submultiples — پیشوندهای SI

| Prefix | Symbol | Factor | Example | Example Value |
|--------|--------|--------|---------|---------------|
| tera | T | 10¹² | TW | 1 TW = 10¹² W |
| giga | G | 10⁹ | GW | 1 GW = 10⁹ W |
| mega | M | 10⁶ | MW | 1 MW = 10⁶ W |
| kilo | k | 10³ | kW | 1 kW = 10³ W |
| hecto | h | 10² | hW | 1 hW = 10² W (rare in power) |
| deca | da | 10¹ | daW | 1 daW = 10 W (rare) |
| (base) | — | 10⁰ | W | 1 W |
| deci | d | 10⁻¹ | dW | 1 dW = 0.1 W (rare) |
| centi | c | 10⁻² | cW | 1 cW = 0.01 W (rare) |
| milli | m | 10⁻³ | mW | 1 mW = 10⁻³ W |
| micro | μ | 10⁻⁶ | μW | 1 μW = 10⁻⁶ W |
| nano | n | 10⁻⁹ | nW | 1 nW = 10⁻⁹ W |
| pico | p | 10⁻¹² | pW | 1 pW = 10⁻¹² W |

### Capitalization Rule — قاعده حروف بزرگ و کوچک

| Condition | Example | Explanation |
|-----------|---------|-------------|
| Prefixes ≤ 10³ | k (kilo), m (milli), μ (micro) | Lowercase for k and below |
| Prefixes ≥ 10⁶ | M (mega), G (giga), T (tera) | Uppercase for M and above |
| Distinguish m vs M | mW = milliwatt, MW = megawatt | Critical: m (milli) ≠ M (mega) |
| Distinguish k vs K | kW = kilowatt (correct), KW = incorrect | Always lowercase k for kilo |

---

## Electrical Units — واحدهای الکتریکی (Detailed Treatment)

### Voltage — ولتاژ

| Canonical | Symbol | FA Symbol | Quantity | Aliases | Conversion |
|-----------|--------|-----------|----------|---------|------------|
| Volt | V | ولت | Voltage | volt, v, VOLT | 1 V = 1 kg·m²·s⁻³·A⁻¹ |
| Kilovolt | kV | کیلوولت | Voltage | KV, kv | 1 kV = 1000 V |
| Megavolt | MV | مگاولت | Voltage | mv (avoid) | 1 MV = 10⁶ V |

**AC/DC Annotation**: Append "AC" or "DC" after the unit when context is ambiguous: "12 kV AC", "500 kV DC".

### Current — جریان

| Canonical | Symbol | FA Symbol | Quantity | Aliases | Conversion |
|-----------|--------|-----------|----------|---------|------------|
| Ampere | A | آمپر | Current | amp, Amps, a | 1 A = 1 C/s |
| Kiloampere | kA | کیلوآمپر | Current | KA, ka | 1 kA = 1000 A |
| Milliampere | mA | میلی‌آمپر | Current | ma, MA (avoid) | 1 mA = 0.001 A |

### Power — توان

| Canonical | Symbol | FA Symbol | Quantity | Aliases | Conversion |
|-----------|--------|-----------|----------|---------|------------|
| Watt | W | وات | Active Power | watt, w | 1 W = 1 J/s |
| Kilowatt | kW | کیلووات | Active Power | KW, kw | 1 kW = 1000 W |
| Megawatt | MW | مگاوات | Active Power | mw (avoid) | 1 MW = 10⁶ W |
| Gigawatt | GW | گیگاوات | Active Power | gw (avoid) | 1 GW = 10⁹ W |
| Volt-Ampere | VA | ولت آمپر | Apparent Power | va | 1 VA = 1 V·A |
| Kilovolt-Ampere | kVA | کیلوولت آمپر | Apparent Power | KVA, kva | 1 kVA = 1000 VA |
| Megavolt-Ampere | MVA | مگاولت آمپر | Apparent Power | mva (avoid) | 1 MVA = 10⁶ VA |
| VAR | VAR | وار | Reactive Power | var | 1 VAR = 1 V·A·sin(φ) |
| Kilovar | kVAR | کیلووار | Reactive Power | KVAR, kvar | 1 kVAR = 1000 VAR |
| Megavar | MVAR | مگاوار | Reactive Power | mvar (avoid) | 1 MVAR = 10⁶ VAR |

### Energy — انرژی

| Canonical | Symbol | FA Symbol | Quantity | Aliases | Conversion |
|-----------|--------|-----------|----------|---------|------------|
| Watt-hour | Wh | وات ساعت | Energy | WH, wh | 1 Wh = 3600 J |
| Kilowatt-hour | kWh | کیلووات ساعت | Energy | KWh, kwh, KW-h | 1 kWh = 3.6 × 10⁶ J |
| Megawatt-hour | MWh | مگاوات ساعت | Energy | MWh, mwh | 1 MWh = 3.6 × 10⁹ J |
| Gigawatt-hour | GWh | گیگاوات ساعت | Energy | GWh, gwh | 1 GWh = 3.6 × 10¹² J |
| Joule | J | ژول | Energy | j | 1 J = 1 N·m |
| Kilojoule | kJ | کیلوژول | Energy | KJ, kj | 1 kJ = 1000 J |
| Megajoule | MJ | مگاژول | Energy | mj (avoid) | 1 MJ = 10⁶ J |

### Impedance — امپدانس

| Canonical | Symbol | FA Symbol | Quantity | Aliases | Conversion |
|-----------|--------|-----------|----------|---------|------------|
| Ohm | Ω | اهم | Resistance | ohm, O, o | 1 Ω = 1 V/A |
| Milli-ohm | mΩ | میلی‌اهم | Resistance | mOhm, mo | 1 mΩ = 0.001 Ω |
| Kilo-ohm | kΩ | کیلواهم | Resistance | KOhm, ko | 1 kΩ = 1000 Ω |
| Mega-ohm | MΩ | مگااهم | Resistance | MOhm, MO | 1 MΩ = 10⁶ Ω |
| Percent Impedance | %Z | درصد امپدانس | Impedance | Z%, % | Per-unit based on transformer/base rating |

### Frequency — فرکانس

| Canonical | Symbol | FA Symbol | Quantity | Aliases | Conversion |
|-----------|--------|-----------|----------|---------|------------|
| Hertz | Hz | هرتز | Frequency | hz, HZ | 1 Hz = 1 s⁻¹ |
| Millihertz | mHz | میلی‌هرتز | Frequency | mhz (avoid) | 1 mHz = 0.001 Hz |
| Radian per second | rad/s | رادیان بر ثانیه | Angular frequency | — | 1 rad/s = 1/(2π) Hz |

### Capacitance — ظرفیت خازنی

| Canonical | Symbol | FA Symbol | Quantity | Aliases | Conversion |
|-----------|--------|-----------|----------|---------|------------|
| Farad | F | فاراد | Capacitance | f | 1 F = 1 C/V |
| Microfarad | μF | میکروفاراد | Capacitance | uF, mfd, MF | 1 μF = 10⁻⁶ F |
| Nanofarad | nF | نانوفاراد | Capacitance | nf | 1 nF = 10⁻⁹ F |
| Picofarad | pF | پیکوفاراد | Capacitance | pf, P | 1 pF = 10⁻¹² F |

### Inductance — القاوری

| Canonical | Symbol | FA Symbol | Quantity | Aliases | Conversion |
|-----------|--------|-----------|----------|---------|------------|
| Henry | H | هنری | Inductance | h | 1 H = 1 Wb/A |
| Millihenry | mH | میلی‌هنری | Inductance | mh | 1 mH = 0.001 H |
| Microhenry | μH | میکروهنری | Inductance | uH, uh | 1 μH = 10⁻⁶ H |

### Temperature — دما

| Canonical | Symbol | FA Symbol | Quantity | Aliases | Conversion |
|-----------|--------|-----------|----------|---------|------------|
| Degree Celsius | °C | درجه سلسیوس | Temperature | C, degC | T(K) = T(°C) + 273.15 |
| Kelvin | K | کلوین | Temperature | °K (avoid) | SI base unit for temperature |
| Degree Fahrenheit | °F | درجه فارنهایت | Temperature | F, degF | T(°C) = (T(°F) − 32) × 5/9 |

### Length — طول

| Canonical | Symbol | FA Symbol | Quantity | Aliases | Conversion |
|-----------|--------|-----------|----------|---------|------------|
| Meter | m | متر | Length | M, mtr | SI base |
| Kilometer | km | کیلومتر | Length | KM, kmtr | 1 km = 1000 m |
| Millimeter | mm | میلی‌متر | Length | MM, m.m. | 1 mm = 0.001 m |
| Centimeter | cm | سانتی‌متر | Length | CM | 1 cm = 0.01 m |
| Foot | ft | فوت | Length | FT, feet | 1 ft = 0.3048 m |
| Inch | in | اینچ | Length | IN, inch, " | 1 in = 0.0254 m |

### Cross-Section — سطح مقطع

| Canonical | Symbol | FA Symbol | Quantity | Aliases | Conversion |
|-----------|--------|-----------|----------|---------|------------|
| Square millimeter | mm² | میلی‌متر مربع | Area | mm2, sqmm | 1 mm² = 10⁻⁶ m² |
| Thousand circular mil | kcmil | کا سیرکولار میل | Area | MCM | 1 kcmil = 0.5067 mm² |
| American Wire Gauge | AWG | اِیدبلیوجی | Area | — | See conversion table below |

**AWG ↔ mm² Conversion Table:**

| AWG | mm² | AWG | mm² | AWG | mm² |
|-----|-----|-----|-----|-----|-----|
| 18 | 0.823 | 8 | 8.37 | 250 kcmil | 126.7 |
| 16 | 1.31 | 6 | 13.3 | 300 kcmil | 152.0 |
| 14 | 2.08 | 4 | 21.2 | 350 kcmil | 177.3 |
| 12 | 3.31 | 2 | 33.6 | 400 kcmil | 202.7 |
| 10 | 5.26 | 1/0 | 53.5 | 500 kcmil | 253.4 |
| — | — | 2/0 | 67.4 | 600 kcmil | 304.0 |
| — | — | 3/0 | 85.0 | 750 kcmil | 380.0 |
| — | — | 4/0 | 107.2 | 1000 kcmil | 506.7 |

### Torque — گشتاور

| Canonical | Symbol | FA Symbol | Quantity | Aliases | Conversion |
|-----------|--------|-----------|----------|---------|------------|
| Newton-meter | N·m | نیوتن متر | Torque | Nm, N-m | 1 N·m = 1 J |
| Kilogram-meter | kg·m | کیلوگرم متر | Torque | kgm, kgf·m | 1 kg·m = 9.80665 N·m |
| Pound-foot | lb·ft | پوند فوت | Torque | lb-ft, lbf·ft | 1 lb·ft = 1.35582 N·m |

### Speed — سرعت

| Canonical | Symbol | FA Symbol | Quantity | Aliases | Conversion |
|-----------|--------|-----------|----------|---------|------------|
| Revolution per minute | RPM | دور بر دقیقه | Rotational speed | rpm, Rpm | 1 RPM = (2π/60) rad/s |
| Radian per second | rad/s | رادیان بر ثانیه | Angular velocity | — | 1 rad/s = (60/2π) RPM |

### Time — زمان

| Canonical | Symbol | FA Symbol | Quantity | Aliases | Conversion |
|-----------|--------|-----------|----------|---------|------------|
| Second | s | ثانیه | Time | sec, S | SI base |
| Millisecond | ms | میلی‌ثانیه | Time | msec, mS | 1 ms = 0.001 s |
| Microsecond | μs | میکروثانیه | Time | us, usec | 1 μs = 10⁻⁶ s |
| Minute | min | دقیقه | Time | m, MIN | 1 min = 60 s |
| Hour | h | ساعت | Time | hr, H | 1 h = 3600 s |
| Cycle (50 Hz) | cyc_50 | سیکل (۵۰ هرتز) | Time (electrical) | — | 1 cycle = 0.02 s (at 50 Hz) |
| Cycle (60 Hz) | cyc_60 | سیکل (۶۰ هرتز) | Time (electrical) | — | 1 cycle = 0.01667 s (at 60 Hz) |

---

## Per Unit System — سیستم پریونیت

### Overview — نمای کلی

The per-unit (pu) system normalizes electrical quantities to a dimensionless value relative to chosen base values. It simplifies power system calculations by eliminating transformer turns ratios and voltage levels.

### Base Values Selection — انتخاب مقادیر پایه

| Quantity | Formula | Typical Base Values |
|-----------|---------|---------------------|
| Power (S_base) | Chosen | 1 MVA, 10 MVA, 100 MVA |
| Voltage (V_base) | Chosen (line-to-line) | 400 V, 20 kV, 63 kV, 132 kV, 230 kV, 400 kV |
| Current (I_base) | S_base / (√3 × V_base) | Derived |
| Impedance (Z_base) | V_base² / S_base | Derived |

### Conversion Formulas — فرمول‌های تبدیل

| Quantity | Per Unit Value | Notes |
|-----------|---------------|-------|
| Voltage | V_pu = V_actual / V_base | — |
| Current | I_pu = I_actual / I_base | — |
| Impedance | Z_pu = Z_actual / Z_base | — |
| Power | S_pu = S_actual / S_base | — |

### Common Base Values for Power Systems — مقادیر پایه رایج

| System Level | V_base (kV) | S_base (MVA) | Z_base (Ω) | I_base (kA) |
|-------------|-------------|--------------|------------|-------------|
| Transmission (400 kV) | 400 | 100 | 1600 | 0.144 |
| Transmission (230 kV) | 230 | 100 | 529 | 0.251 |
| Sub-transmission (132 kV) | 132 | 100 | 174.2 | 0.437 |
| Sub-transmission (63 kV) | 63 | 100 | 39.69 | 0.916 |
| Primary Distribution (20 kV) | 20 | 10 | 40 | 0.289 |
| Secondary Distribution (400 V) | 0.4 | 0.5 | 0.32 | 0.722 |
| LV Consumer (230 V) | 0.23 | 0.1 | 0.529 | 0.251 |

### pu ↔ Percentage Conversion — تبدیل پریونیت به درصد

| Conversion | Formula | Example |
|-----------|---------|---------|
| pu → % | value × 100 | 0.05 pu = 5% |
| % → pu | value ÷ 100 | 10% = 0.1 pu |

**Common Usage:** Transformer impedance is typically expressed as percentage on its own rating: Z = 8% on 20 MVA base = 0.08 pu on 20 MVA. For system studies, re-base to the system base.

Re-basing formula:
```
Z_pu(new) = Z_pu(old) × (S_base_new / S_base_old) × (V_base_old² / V_base_new²)
```

---

## Persian Formatting Rules — قواعد قالب‌بندی فارسی

### Decimal Separator — جداکننده اعشار

| System | Symbol | Example | Usage |
|--------|--------|---------|-------|
| Persian (FA) | ٫ (U+066B) | ۱۲٫۵ kV | Preferred in Persian text |
| International | . (U+002E) | 12.5 kV | Acceptable in bilingual documents |

### Thousands Separator — جداکننده هزارگان

| System | Symbol | Example | Usage |
|--------|--------|---------|-------|
| Persian (FA) | ٬ (U+066C) | ۱۲٬۵۰۰ V | Preferred in Persian text |
| International | , (U+002C) or space | 12,500 V or 12 500 V | Space recommended per SI |

### Persian Digits — ارقام فارسی

| Persian | ۰ | ۱ | ۲ | ۳ | ۴ | ۵ | ۶ | ۷ | ۸ | ۹ |
|---------|---|---|---|---|---|---|---|---|---|---|
| Hindu-Arabic | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |

**Rule:** Use Persian digits in Persian text, Hindu-Arabic digits in English text. In bilingual documents, maintain consistency per language segment.

### Unit Placement — جایگاه واحد

| Language | Pattern | Example |
|----------|---------|---------|
| English | Number + space + Symbol | 12 kV |
| Persian (standard) | Number + space + Symbol | ۱۲ کیلوولت |
| Persian (traditional) | number + space + Persian name | ۱۲ کیلو ولت |

**Rule:** The unit symbol always follows the number with a single space, regardless of language.

### RTL Rendering Considerations — ملاحظات راست‌به‌چپ

| Issue | Recommendation |
|-------|----------------|
| Number direction | Numbers remain LTR even in RTL Persian text |
| Complex units with slashes | Use explicit Unicode directional marks (LRM/RLM) when needed |
| Mixed text | Wrap English units in LTR isolates when embedded in Persian RTL paragraphs |
| Fractional notation | Persian decimal separator (٫) may cause rendering issues in some systems; use full-width space workaround if needed |

---

## Formatting Rules — قواعد قالب‌بندی

### Core Rules

| # | Rule | Correct | Incorrect | Explanation |
|---|------|---------|-----------|-------------|
| 1 | Space between number and unit | 12 kV | 12kV | Always include a non-breaking space |
| 2 | No pluralization | 12 kV | 12 kVs | Units are never pluralized |
| 3 | Case sensitivity: voltage | V (volt) | v | SI symbol V is uppercase |
| 4 | Case sensitivity: current | A (ampere) | a | SI symbol A is uppercase |
| 5 | Case sensitivity: frequency | Hz | hz | H uppercase, z lowercase |
| 6 | Case sensitivity: power | W | w | SI symbol W is uppercase |
| 7 | Lowercase prefix for ≤ 10³ | kW, mA, μF | KW, MA, MF | k, m, μ are lowercase |
| 8 | Uppercase prefix for ≥ 10⁶ | MW, MVA, GW | mw, mva, gw | M, G, T are uppercase |
| 9 | Compound units | kWh | kW-h, kW·h | kWh is preferred |
| 10 | Per-unit format | 0.85 pu | 0.85 p.u., 0.85 pu | Lowercase "pu", no spaces |

### Acceptable Symbol Variants

| Preferred | Acceptable | Not Acceptable |
|-----------|------------|----------------|
| Ω | Ohm | O, ohm |
| μF | uF | mF (confuses with milli) |
| kWh | kW·h | KWH, kwh |
| N·m | Nm | NM, n-m |
| °C | degC | C (ambiguous) |

---

## Conversion Table — جدول تبدیل

### Power — توان

| From | To | Factor | Example |
|------|----|--------|---------|
| Horsepower (hp) | kW | 0.7457 | 100 hp = 74.57 kW |
| Horsepower (hp) | W | 745.7 | 1 hp = 745.7 W |
| PS (metric hp) | kW | 0.7355 | 100 PS = 73.55 kW |
| PS (metric hp) | hp | 0.9863 | 100 PS = 98.63 hp |
| BTU/h | kW | 0.0002931 | 3412 BTU/h = 1 kW |
| BTU/h | W | 0.2931 | 1 BTU/h = 0.2931 W |
| TR (Ton of Refrigeration) | kW | 3.517 | 1 TR = 3.517 kW |

### Cable Sizes — اندازه کابل

| kcmil | mm² | kcmil | mm² |
|-------|-----|-------|-----|
| 250 | 126.7 | 750 | 380.0 |
| 300 | 152.0 | 800 | 405.4 |
| 350 | 177.3 | 900 | 456.0 |
| 400 | 202.7 | 1000 | 506.7 |
| 500 | 253.4 | 1250 | 633.4 |
| 600 | 304.0 | 1500 | 760.0 |

### Length — طول

| From | To | Factor | Example |
|------|----|--------|---------|
| Inch (in) | mm | 25.4 | 1 in = 25.4 mm |
| Foot (ft) | m | 0.3048 | 100 ft = 30.48 m |
| Mile (mi) | km | 1.6093 | 1 mi = 1.6093 km |
| Yard (yd) | m | 0.9144 | 1 yd = 0.9144 m |

### Temperature — دما

| From | To | Formula | Example |
|------|----|---------|---------|
| °F | °C | (°F − 32) × 5/9 | 212 °F = 100 °C |
| °C | °F | (°C × 9/5) + 32 | 100 °C = 212 °F |
| K | °C | K − 273.15 | 300 K = 26.85 °C |
| °C | K | °C + 273.15 | 100 °C = 373.15 K |

### Pressure (SF6, Vacuum Applications) — فشار

| From | To | Factor | Example |
|------|----|--------|---------|
| psi | kPa | 6.8948 | 14.5 psi = 100 kPa |
| psi | bar | 0.06895 | 14.5 psi = 1 bar |
| bar | kPa | 100 | 1 bar = 100 kPa |
| mm Hg (torr) | kPa | 0.1333 | 760 mm Hg = 101.3 kPa |
| atm | kPa | 101.325 | 1 atm = 101.325 kPa |
| mbar | kPa | 0.1 | 1000 mbar = 100 kPa |

### Angular — زاویه‌ای

| From | To | Factor | Example |
|------|----|--------|---------|
| Degree (°) | radian (rad) | π/180 | 180° = π rad |
| RPM | rad/s | 2π/60 | 1500 RPM = 157.08 rad/s |
| rad/s | RPM | 60/2π | 314.16 rad/s = 3000 RPM |

---

## Units → Graph & AI Mapping — نگاشت واحدها به گراف و هوش مصنوعی

### Graph Model — مدل گراف

Each unit is represented as a node in the knowledge graph:

| Property | Value |
|----------|-------|
| **Label** | `Unit` |
| **Properties** | `unit_id`, `symbol`, `canonical_name`, `quantity`, `si_status` |

### Edges — یال‌ها

| Edge Type | Target | Properties | Description |
|-----------|--------|------------|-------------|
| `CONVERTS_TO` | Related Unit | `{factor: <numeric>, confidence: 1.0}` | Conversion between related units (e.g., kW → MW with factor 0.001) |
| `MEASURES` | Quantity Type | — | Associates unit with the measured quantity node |
| `HAS_PREFIX` | SI Prefix | `{factor: <10^n>}` | For prefixed units (e.g., kW has prefix k with factor 10³) |

### Example Subgraph (kW)

```
(Unit {symbol: "kW", canonical_name: "Kilowatt"})
    --[CONVERTS_TO {factor: 0.001}]--> (Unit {symbol: "MW", canonical_name: "Megawatt"})
    --[CONVERTS_TO {factor: 1000}]--> (Unit {symbol: "W", canonical_name: "Watt"})
    --[MEASURES]--> (Quantity {name: "Active Power", name_fa: "توان اکتیو"})
    --[HAS_PREFIX {factor: 1000}]--> (Prefix {symbol: "k", name: "kilo"})
```

### AI Pipeline Rules

| Rule | Description |
|------|-------------|
| **Canonical Unit** | All numerical comparisons and calculations use the canonical unit form. Non-canonical forms are converted before processing. |
| **Pre-Calculation Normalization** | AI services must normalize all numerical values to canonical units before any calculation or comparison. |
| **Embedding Canonical Form Only** | Unit symbols and names should use canonical form only in embedding text. Non-canonical variants are excluded from primary embedding. |
| **User Query Normalization** | All user queries (e.g., "کیلووات", "kw", "kW", "KW") are normalized to canonical "kW" before search or computation. |
| **Search Indexing** | Both canonical and alias forms are indexed for search discovery, but only canonical form is used in vector embeddings. |
| **Bilingual Unit Resolution** | Persian unit queries (e.g., "مگاوات") resolve to the same canonical node as English queries ("MW"). |
| **Quantity-Aware Conversion** | Conversions are only valid between units of the same quantity (e.g., active power → active power, not active power → apparent power). |

---

## Version History — تاریخچه نسخه

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Tir 1405 | Initial draft — SI base/derived units, multiples, electrical units, per-unit system, Persian formatting, conversion tables, graph & AI mapping |
