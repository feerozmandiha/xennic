# رده‌بندی دانش مهندسی نسخه ۲ — Engineering Taxonomy v2

**Version:** 2.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Purpose — هدف

Refine and extend the K1.1 taxonomy (v1) into a 5-level hierarchical taxonomy that integrates with the Semantic Layer. This v2 taxonomy adds two deeper levels (Concept Groups and Knowledge Objects) and aligns with the `engineering-vocabulary.md`, `synonym-dictionary.md`, and `canonical-concepts.md` documents.

نسخه دوم، طبقه‌بندی نسخه اول (K1.1) را به یک سلسله‌مراتب ۵ سطحی توسعه می‌دهد که با لایه معنایی (Semantic Layer) یکپارچه می‌شود. دو سطح جدید (گروه‌های مفهومی و اشیاء دانش) به سطوح قبلی افزوده شده‌اند.

---

## Overview — نمای کلی

```
Level 1: Engineering Domains (10 domains)
Level 2: Subdomains (40+ subdomains)
Level 3: Concept Groups (200+ groups)
Level 4: Canonical Concepts (mapped to canonical-concepts.md)
Level 5: Knowledge Objects (actual documents, standards, calculations)
```

| Level | FA | EN | Count | Description |
|-------|----|----|-------|-------------|
| L1 | حوزه‌های مهندسی | Engineering Domains | 10 | Broad engineering disciplines |
| L2 | زیرحوزه‌ها | Subdomains | 40+ | Specialized areas within each domain |
| L3 | گروه‌های مفهومی | Concept Groups | 200+ | Clusters of related concepts |
| L4 | مفاهیم بنیادین | Canonical Concepts | 12+ | Formal reusable knowledge units |
| L5 | اشیاء دانش | Knowledge Objects | Variable | Standards, calculations, manuals, catalogs |

---

## Level 1: Engineering Domains — سطح ۱: حوزه‌های مهندسی

Same 10 domains from v1, but with updated descriptions incorporating semantic terminology.

| Code | FA | EN | Description | Vocabulary Terms | Canonical Concepts |
|------|----|----|-------------|-----------------|-------------------|
| 1.1 | سیستم‌های قدرت | Power Systems | Generation, transmission, distribution, power quality, load studies | ~60 | 5 |
| 1.2 | حفاظت | Protection | Relay coordination, short-circuit, arc flash, equipment protection | ~50 | 3 |
| 1.3 | ارتینگ و صاعقه | Grounding & Lightning | Earthing systems, lightning protection, surge protection, soil resistivity | ~25 | 1 |
| 1.4 | کابل‌ها و سیم‌کشی | Cables & Wiring | Power cables, control cables, cable sizing, routing and installation | ~30 | 1 |
| 1.5 | تابلو برق و کلیدها | Switchgear & Panel | LV/MV switchgear, circuit breakers, disconnect switches, busbars | ~30 | 0 |
| 1.6 | موتورها و درایوها | Motors & Drives | Induction motors, synchronous motors, VSDs, soft starters | ~30 | 0 |
| 1.7 | ترانسفورماتورها | Transformers | Power transformers, distribution transformers, special transformers, insulation | ~25 | 1 |
| 1.8 | انرژی تجدیدپذیر | Renewable Energy | Solar PV, wind power, energy storage, grid interconnection, green hydrogen | ~40 | 0 |
| 1.9 | تأسیسات برق ساختمان | Building Electrical | Lighting, internal wiring, power distribution, fire alarm, BMS | ~30 | 1 |
| 1.10 | کنترل صنعتی | Industrial Control | PLC, SCADA, instrumentation, industrial networks, functional safety | ~30 | 0 |

---

## Level 2: Subdomains — سطح ۲: زیرحوزه‌ها

All subdomains from v1 taxonomy maintained. New subdomains marked with **NEW**.

### 1.1 Power Systems — سیستم‌های قدرت

| Code | FA | EN | Description |
|------|----|----|-------------|
| 1.1.1 | تولید | Generation | Power plant technologies, generators, excitation systems |
| 1.1.2 | انتقال | Transmission | HV/EHV lines, substations, busbars, series compensation |
| 1.1.3 | توزیع | Distribution | MV/LV networks, distribution transformers, feeders |
| 1.1.4 | کیفیت برق | Power Quality | Harmonics, flicker, voltage sag/swell, PF correction |
| 1.1.5 | بار و مصرف | Load & Consumption | Load profiling, demand forecasting, energy efficiency |
| **1.1.6** | **مطالعات سیستم قدرت** | **Power System Studies** | **Load flow, short circuit, transient stability, contingency analysis** |
| **1.1.7** | **پایداری سیستم قدرت** | **Power System Stability** | **Rotor angle stability, voltage stability, frequency stability, small-signal stability** |

### 1.2 Protection — حفاظت

| Code | FA | EN | Description |
|------|----|----|-------------|
| 1.2.1 | حفاظت عمومی | General Protection | Overcurrent, earth fault, differential, distance |
| 1.2.2 | رله‌ها | Relays | Numerical relays, protection coordination, setting |
| 1.2.3 | حفاظت ترانسفورماتور | Transformer Protection | Buchholz, OLTC, differential, restricted earth fault |
| 1.2.4 | حفاظت خطوط | Line Protection | Distance schemes, pilot protection, auto-reclosure |
| 1.2.5 | حفاظت ژنراتور | Generator Protection | Stator, rotor, loss of excitation, motoring |
| **1.2.6** | **فلاش قوس** | **Arc Flash** | **Incident energy, arc flash boundary, PPE category, IEEE 1584** |

### 1.3 Grounding & Lightning — ارتینگ و صاعقه

| Code | FA | EN | Description |
|------|----|----|-------------|
| 1.3.1 | ارتینگ | Grounding / Earthing | IEEE 80, grid design, step/touch voltage |
| 1.3.2 | صاعقه | Lightning Protection | IEC 62305, risk assessment, LPS zones |
| 1.3.3 | حفاظت در برابر صاعقه | Surge Protection | SPD selection, coordination, equipotential bonding |
| 1.3.4 | مقاومت ویژه خاک | Soil Resistivity | Wenner method, measurement, modeling |

### 1.4 Cables & Wiring — کابل‌ها و سیم‌کشی

| Code | FA | EN | Description |
|------|----|----|-------------|
| 1.4.1 | کابل‌های قدرت | Power Cables | MV/HV cable types, construction, termination |
| 1.4.2 | کابل‌های کنترل | Control Cables | Instrumentation, signal, twisted pair, shield |
| 1.4.3 | انتخاب کابل | Cable Sizing | Current rating, voltage drop, short-circuit rating |
| 1.4.4 | مسیریابی | Cable Routing | Tray, duct, direct burial, segregation |

### 1.5 Switchgear & Panel — تابلو برق و کلیدها

| Code | FA | EN | Description |
|------|----|----|-------------|
| 1.5.1 | تابلو برق | Switchgear Panels | LV/MV switchgear, form separation, IP rating |
| 1.5.2 | کلیدهای قدرت | Circuit Breakers | SF6, vacuum, air, oil; selection and testing |
| 1.5.3 | کلیدهای قطع بار | Disconnect Switches | Load break, isolating, earthing switches |
| 1.5.4 | باسبار | Busbars | Design, rating, thermal and electrodynamic |
| **1.5.5** | **داکت باسبار** | **Busbar Trunking** | **Sandwich busbar, overhead busbar, tap-off units, fire rating** |

### 1.6 Motors & Drives — موتورها و درایوها

| Code | FA | EN | Description |
|------|----|----|-------------|
| 1.6.1 | موتورهای القایی | Induction Motors | Squirrel cage, wound rotor, starting methods |
| 1.6.2 | موتورهای سنکرون | Synchronous Motors | Salient pole, PMSM, excitation |
| 1.6.3 | درایوها | Variable Speed Drives | V/F, vector control, DTC, harmonics |
| 1.6.4 | راه‌انداز | Soft Starters | Thyristor, MV soft starters, bypass |

### 1.7 Transformers — ترانسفورماتورها

| Code | FA | EN | Description |
|------|----|----|-------------|
| 1.7.1 | ترانسفورماتور قدرت | Power Transformers | HV/MV, auto-transformers, tap changers |
| 1.7.2 | ترانسفورماتور توزیع | Distribution Transformers | Pole-mounted, pad-mounted, dry type |
| 1.7.3 | ترانسفورماتور ویژه | Special Transformers | Rectifier, furnace, earthing, isolation |
| 1.7.4 | روغن و عایق | Oil & Insulation | DGA, furan analysis, insulation resistance |

### 1.8 Renewable Energy — انرژی تجدیدپذیر

| Code | FA | EN | Description |
|------|----|----|-------------|
| 1.8.1 | خورشیدی | Solar PV | Panels, inverters, string design, shading |
| 1.8.2 | بادی | Wind Power | Turbine types, grid connection, farm layout |
| 1.8.3 | ذخیره‌ساز | Energy Storage | BESS, Li-ion, flow batteries, BMS |
| 1.8.4 | اتصال به شبکه | Grid Interconnection | Net metering, islanding, power quality |
| **1.8.5** | **هیدروژن سبز** | **Green Hydrogen** | **Electrolysis, PEM, alkaline, hydrogen storage, fuel cells** |

### 1.9 Building Electrical — تأسیسات برق ساختمان

| Code | FA | EN | Description |
|------|----|----|-------------|
| 1.9.1 | طراحی روشنایی | Lighting Design | Lux levels, luminaire selection, emergency |
| 1.9.2 | سیم‌کشی داخلی | Internal Wiring | Conduit, trunking, socket circuits, load estimation |
| 1.9.3 | توزیع برق | Power Distribution | Main DB, sub-DB, riser, metering |
| 1.9.4 | اعلام حریق | Fire Alarm | Detection, alarm, voice evacuation, BS 5839 |
| **1.9.5** | **مدیریت ساختمان** | **BMS/BAS** | **HVAC control, lighting control, access control, energy optimization** |

### 1.10 Industrial Control — کنترل صنعتی

| Code | FA | EN | Description |
|------|----|----|-------------|
| 1.10.1 | PLC | PLC Systems | Ladder logic, SCADA, DCS, RTU |
| 1.10.2 | ابزار دقیق | Instrumentation | Sensors, transmitters, actuators, loop power |
| 1.10.3 | شبکه صنعتی | Industrial Networks | Profibus, Modbus, Ethernet/IP, OPC UA |
| 1.10.4 | ایمنی | Functional Safety | SIL, safety relays, redundancy |

---

## Level 3: Concept Groups — سطح ۳: گروه‌های مفهومی

Each concept group is a cluster of related concepts sharing a common theme. Groups are identified by their 4-level code (Domain.Subdomain.Group).

### 1.1.1 Generation — تولید

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.1.1.1 | انواع ژنراتور | Generator Types | Synchronous, Induction, Doubly-Fed, PMSG |
| 1.1.1.2 | سیستم تحریک | Excitation Systems | Brushless, Static, DC Exciter, PMG |
| 1.1.1.3 | پارامترهای ژنراتور | Generator Parameters | Rated Power, Voltage Regulation, Power Factor, Inertia Constant |
| 1.1.1.4 | اتصال به شبکه | Grid Connection | Synchronization, Islanding, Grid Code Compliance |
| 1.1.1.5 | حفاظت ژنراتور | Generator Protection | Stator Fault, Rotor Fault, Loss of Excitation, Motoring |

### 1.1.2 Transmission — انتقال

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.1.2.1 | خطوط هوایی | Overhead Lines | Conductor Types, Sag & Tension, Tower Types, Clearance |
| 1.1.2.2 | کابل‌های زیرزمینی | Underground Cables | XLPE Cable, Termination, Jointing, Sheath Bonding |
| 1.1.2.3 | پست‌های فشارقوی | HV Substations | AIS, GIS, Busbar Arrangements, Bay Configurations |
| 1.1.2.4 | جبرانسازی سری | Series Compensation | Series Capacitor, TCSC, Sub-synchronous Resonance |
| 1.1.2.5 | رله‌های خط انتقال | Transmission Line Relaying | Distance Protection, Pilot Protection, Auto-Reclosure |

### 1.1.3 Distribution — توزیع

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.1.3.1 | شبکه‌های توزیع | Distribution Networks | Radial, Ring, Mesh, Open-Loop Configuration |
| 1.1.3.2 | ترانسفورماتور توزیع | Distribution Transformers | Pole-Mounted, Pad-Mounted, Oil-Immersed, Dry-Type |
| 1.1.3.3 | فیدرهای توزیع | Distribution Feeders | Primary Feeder, Secondary Feeder, Voltage Regulation, Reclosers |
| 1.1.3.4 | حفاظت توزیع | Distribution Protection | Overcurrent, Fuse Coordination, Recloser Settings, Sectionalizers |
| 1.1.3.5 | بهینه‌سازی شبکه | Network Optimization | Loss Reduction, Voltage Profile Improvement, Reconfiguration |

### 1.1.4 Power Quality — کیفیت برق

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.1.4.1 | هارمونیک‌ها | Harmonics | THD, Individual Harmonics, Resonance, Filter Design |
| 1.1.4.2 | نوسانات ولتاژ | Voltage Variations | Sag, Swell, Interruption, Transient Overvoltage |
| 1.1.4.3 | فلیکر | Flicker | Voltage Fluctuation, Pst, Plt, Flicker Mitigation |
| 1.1.4.4 | تصحیح ضریب قدرت | Power Factor Correction | Capacitor Banks, Detuned Reactors, Active Filters, Static Var Compensator |
| 1.1.4.5 | پایش کیفیت برق | PQ Monitoring | PQ Analyzer, EN 50160 Compliance, Event Detection, Reporting |

### 1.1.5 Load & Consumption — بار و مصرف

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.1.5.1 | پروفایل بار | Load Profiling | Daily Load Curve, Seasonal Variation, Load Factor, Coincidence Factor |
| 1.1.5.2 | پیش‌بینی بار | Load Forecasting | Short-Term, Long-Term, Regression Models, AI-Based |
| 1.1.5.3 | مدیریت تقاضا | Demand Management | Peak Shaving, Load Shedding, Demand Response, DSM Programs |
| 1.1.5.4 | بهره‌وری انرژی | Energy Efficiency | Efficiency Metrics, Energy Audit, Benchmarking, ISO 50001 |

### 1.1.6 Power System Studies — مطالعات سیستم قدرت (NEW)

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.1.6.1 | مطالعات پخش بار | Load Flow Studies | Newton-Raphson, Fast-Decoupled, DC Load Flow, Contingency Analysis |
| 1.1.6.2 | مطالعات اتصال کوتاه | Short Circuit Studies | IEC 60909, IEEE C37.010, Symmetrical Components, Fault Contribution |
| 1.1.6.3 | مطالعات قوس الکتریکی | Arc Flash Studies | IEEE 1584, Incident Energy, Arc Flash Boundary, PPE Selection |
| 1.1.6.4 | مطالعات هماهنگی حفاظتی | Protection Coordination Studies | TCC Curves, Relay Settings, Selectivity, Grading Margin |
| 1.1.6.5 | مطالعات گذرا | Transient Studies | Switching Transients, Lightning Overvoltage, Insulation Coordination |

### 1.1.7 Power System Stability — پایداری سیستم قدرت (NEW)

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.1.7.1 | پایداری زاویه روتور | Rotor Angle Stability | Transient Stability, Small-Signal Stability, Equal Area Criterion |
| 1.1.7.2 | پایداری ولتاژ | Voltage Stability | PV Curves, QV Curves, Voltage Collapse, L-Index |
| 1.1.7.3 | پایداری فرکانس | Frequency Stability | Frequency Response, Load Shedding, Under-Frequency Protection |
| 1.1.7.4 | دامپینگ نوسانات | Oscillation Damping | Power System Stabilizer, Damping Controllers, Mode Identification |

### 1.2.1 General Protection — حفاظت عمومی

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.2.1.1 | حفاظت اضافه جریان | Overcurrent Protection | Phase Overcurrent, Earth Fault, Directional OC, ANSI 50/51/67 |
| 1.2.1.2 | حفاظت دیفرانسیل | Differential Protection | Percentage Differential, High Impedance, ANSI 87 |
| 1.2.1.3 | هماهنگی حفاظتی | Protection Coordination | TCC Curves, Selective Coordination, Cascading, Grading |
| 1.2.1.4 | حفاظت راه دور | Distance Protection | Impedance Relay, Mho Circle, Zones, ANSI 21 |

### 1.2.2 Relays — رله‌ها

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.2.2.1 | رله‌های عددی | Numerical Relays | Microprocessor Relays, Multi-Function, Communication Protocols |
| 1.2.2.2 | تنظیمات رله | Relay Settings | Pickup, Time Dial, Curve Selection, Logic Configuration |
| 1.2.2.3 | ارتباطات رله | Relay Communication | GOOSE, IEC 61850, DNP3, Modbus, Peer-to-Peer |

### 1.2.3 Transformer Protection — حفاظت ترانسفورماتور

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.2.3.1 | حفاظت گازی | Buchholz Protection | Buchholz Relay, Sudden Pressure, Gas Accumulation |
| 1.2.3.2 | حفاظت الکتریکی | Electrical Protection | Differential, Restricted EF, Overcurrent, Overfluxing |
| 1.2.3.3 | حفاظت حرارتی | Thermal Protection | Winding Temperature, Oil Temperature, Thermal Image |

### 1.2.4 Line Protection — حفاظت خطوط

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.2.4.1 | حفاظت دیستانس | Distance Schemes | Step Distance, Permissive Overreach, Blocking scheme |
| 1.2.4.2 | حفاظت پایلوت | Pilot Protection | Differential Current, Phase Comparison, Directional Comparison |
| 1.2.4.3 | بستن مجدد | Auto-Reclosure | Dead Time, Reclaim Time, Single Shot, Synch Check |

### 1.2.5 Generator Protection — حفاظت ژنراتور

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.2.5.1 | حفاظت استاتور | Stator Protection | Differential, Stator Earth Fault, Inter-turn Fault |
| 1.2.5.2 | حفاظت روتور | Rotor Protection | Rotor Earth Fault, Loss of Excitation, Over-excitation |
| 1.2.5.3 | حفاظت غیرعادی | Abnormal Protection | Reverse Power, Motoring, Over/Under Frequency, Loss of Synchronism |

### 1.2.6 Arc Flash — فلاش قوس (NEW)

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.2.6.1 | محاسبه انرژی قوس | Arc Flash Calculation | Incident Energy, Arc Flash Boundary, IEEE 1584 Equations |
| 1.2.6.2 | برچسب‌زنی | Arc Flash Labeling | Warning Labels, PPE Category, Shock Hazard, Approach Boundaries |
| 1.2.6.3 | کاهش خطر | Hazard Mitigation | Arc-Resistant Switchgear, Remote Racking, Zonal Protection |

### 1.3.1 Grounding / Earthing — ارتینگ

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.3.1.1 | طراحی شبکه ارت | Ground Grid Design | IEEE 80, Grid Conductor Sizing, Mesh Voltage, Step/Touch Voltage |
| 1.3.1.2 | الکترودهای زمین | Earth Electrodes | Rod, Plate, Ring, Foundation Earth Electrode |
| 1.3.1.3 | سیستم TN/TT/IT | System Earthing | TN-C, TN-S, TN-C-S, TT, IT Configuration |
| 1.3.1.4 | اتصال هم‌بندی | Equipotential Bonding | Main Bonding, Supplementary Bonding, Bonding Conductor Sizing |

### 1.3.2 Lightning Protection — صاعقه

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.3.2.1 | ارزیابی ریسک | Risk Assessment | IEC 62305-2, Risk Components, Protection Level, Tolerable Risk |
| 1.3.2.2 | سامانه حفاظت خارجی | External LPS | Air Termination, Down Conductor, Earth Termination, Separation Distance |
| 1.3.2.3 | سامانه حفاظت داخلی | Internal LPS | Equipotential Bonding, Shielding, SPD Coordination, Surge Protection Zones |

### 1.3.3 Surge Protection — حفاظت در برابر صاعقه

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.3.3.1 | انتخاب SPD | SPD Selection | Type 1/2/3, Voltage Protection Level, Discharge Current, Coordination |
| 1.3.3.2 | منطقه‌بندی صاعقه | Lightning Protection Zones | LPZ 0, LPZ 1, LPZ 2, Zone Interface Protection |
| 1.3.3.3 | حفاظت تجهیزات حساس | Sensitive Equipment Protection | Data Line SPD, Telecom Protection, Signal Reference Grid |

### 1.3.4 Soil Resistivity — مقاومت ویژه خاک

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.3.4.1 | روش‌های اندازه‌گیری | Measurement Methods | Wenner 4-Pin, Schlumberger, Fall-of-Potential, Soil Resistivity Meter |
| 1.3.4.2 | مدل‌سازی خاک | Soil Modeling | Two-Layer Model, Multi-Layer Model, Apparent Resistivity, Inversion |

### 1.4.1 Power Cables — کابل‌های قدرت

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.4.1.1 | انواع کابل قدرت | Power Cable Types | Armoured, Unarmoured, SWA, AWA, PILC, XLPE, EPR |
| 1.4.1.2 | ساختار کابل | Cable Construction | Conductor, Insulation, Bedding, Armour, Sheath |
| 1.4.1.3 | پایانه‌سازی | Cable Termination | Heat Shrink, Cold Shrink, Terminations, Lugs, Glands |
| 1.4.1.4 | مفصل‌زنی | Cable Jointing | Straight Joint, Transition Joint, Branch Joint, Jointing Kit |

### 1.4.2 Control Cables — کابل‌های کنترل

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.4.2.1 | کابل‌های ابزار دقیق | Instrumentation Cables | Twisted Pair, Shielded, Overall Screen, Individually Screened |
| 1.4.2.2 | کابل‌های سیگنال | Signal Cables | Coaxial, Triaxial, Data Cable, Fiber Optic |
| 1.4.2.3 | جداسازی کابل | Cable Segregation | Voltage Levels, Signal Types, EMC Separation, Fire Compartment |

### 1.4.3 Cable Sizing — انتخاب کابل

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.4.3.1 | محاسبه ظرفیت جریان | Current Rating Calculation | IEC 60364-5-52, Ampacity, Correction Factors, Grouping |
| 1.4.3.2 | محاسبه افت ولتاژ | Voltage Drop Calculation | Steady-State VD, Starting VD, Permissible Limits IEC/IEEE |
| 1.4.3.3 | مقاومت در برابر اتصال کوتاه | Short Circuit Rating | Adiabatic Equation, k-Factor, Thermal Withstand, Conductor Size |

### 1.4.4 Cable Routing — مسیریابی

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.4.4.1 | مسیر کابل | Cable Tray Systems | Ladder Tray, Perforated Tray, Solid Bottom, Cable Basket |
| 1.4.4.2 | داکت و ترانشه | Duct & Trench | Underground Duct, Concrete Trench, Direct Burial, Draw Pit |
| 1.4.4.3 | استانداردهای مسیریابی | Routing Standards | Minimum Bending Radius, Pulling Tension, Side Wall Pressure, Segregation |

### 1.5.1 Switchgear Panels — تابلو برق

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.5.1.1 | تابلو فشار ضعیف | LV Switchgear | Form 1–4, IEC 61439, MCC, Distribution Board |
| 1.5.1.2 | تابلو فشار متوسط | MV Switchgear | Metal-Enclosed, Metal-Clad, GIS, IEC 62271 |
| 1.5.1.3 | درجه حفاظت | IP Ratings & Enclosure | IP Code, IK Rating, Ambient Conditions, Corrosion Protection |

### 1.5.2 Circuit Breakers — کلیدهای قدرت

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.5.2.1 | کلیدهای فشار ضعیف | LV Circuit Breakers | MCCB, ACB, MCB, RCCB, RCBO, Selection Criteria |
| 1.5.2.2 | کلیدهای فشار متوسط | MV Circuit Breakers | Vacuum, SF6, Air, Oil, Operating Mechanism |
| 1.5.2.3 | پارامترهای انتخاب | Selection Parameters | Rated Voltage, Current, Breaking Capacity, Making Capacity |
| 1.5.2.4 | تست کلید | Breaker Testing | Timing, Insulation Resistance, Contact Resistance, Hi-Pot |

### 1.5.3 Disconnect Switches — کلیدهای قطع بار

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.5.3.1 | سکسیونر | Disconnectors | Air Break, Center Break, Double Break, Pantograph |
| 1.5.3.2 | کلید ارت | Earthing Switches | High-Speed Earthing, Maintenance Earthing |
| 1.5.3.3 | کلید ترکیبی | Combined Switch | Switch-Disconnector, Fuse-Switch Disconnector |

### 1.5.4 Busbars — باسبار

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.5.4.1 | طراحی باسبار | Busbar Design | Copper vs Aluminum, Cross-Section, Current Rating, Temperature Rise |
| 1.5.4.2 | محاسبات حرارتی | Thermal Calculations | Heat Dissipation, Skin Effect, Proximity Effect, Joint Resistance |
| 1.5.4.3 | محاسبات دینامیکی | Electrodynamic Forces | Short-Circuit Force, Support Spacing, Natural Frequency |

### 1.5.5 Busbar Trunking — داکت باسبار (NEW)

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.5.5.1 | داکت باسبار ساندویچی | Sandwich Busbar | Compact Design, Low Impedance, Fire Rating IP68 |
| 1.5.5.2 | واحدهای جعبه‌برداری | Tap-Off Units | Plug-in, Fused Tap-Off, Switch Disconnector Tap-Off |
| 1.5.5.3 | داکت باسبار بالاسری | Overhead Busbar | Overhead Trunking, Rising Mains, Feeder Distribution |

### 1.6.1 Induction Motors — موتورهای القایی

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.6.1.1 | انواع موتور القایی | Induction Motor Types | Squirrel Cage, Wound Rotor, Slip Ring, High-Efficiency IE3/IE4 |
| 1.6.1.2 | روش‌های راه‌اندازی | Starting Methods | DOL, Star-Delta, Soft Start, VFD, Autotransformer |
| 1.6.1.3 | حفاظت موتور | Motor Protection | Thermal Overload, Stall Protection, Phase Unbalance, Short Circuit |
| 1.6.1.4 | انتخاب موتور | Motor Selection | Power Rating, Torque Curve, Duty Cycle, Ambient Conditions |

### 1.6.2 Synchronous Motors — موتورهای سنکرون

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.6.2.1 | انواع موتور سنکرون | Synchronous Motor Types | Salient Pole, Cylindrical Rotor, PMSM, Reluctance Motor |
| 1.6.2.2 | تحریک و کنترل | Excitation & Control | Brushless Exciter, Static Exciter, V/Hz Control, Power Factor Control |
| 1.6.2.3 | کاربردهای ویژه | Special Applications | Compressor Drive, Mill Drive, Reactive Power Compensation |

### 1.6.3 Variable Speed Drives — درایوها

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.6.3.1 | انواع درایو | Drive Types | V/F Drive, Vector Drive, DTC, Regenerative Drive |
| 1.6.3.2 | هارمونیک درایو | Drive Harmonics | 6-Pulse, 12-Pulse, 24-Pulse, Active Front End, Filter |
| 1.6.3.3 | انتخاب درایو | Drive Selection | kW Rating, Overload Capacity, Enclosure, Communication Protocol |

### 1.6.4 Soft Starters — راه‌انداز

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.6.4.1 | انواع سافت‌استارتر | Soft Starter Types | Thyristor-Based, MV Soft Starter, Bypass Contactor |
| 1.6.4.2 | پارامترهای تنظیم | Setting Parameters | Start Ramp Time, Initial Torque, Current Limit, Kick Start |
| 1.6.4.3 | کاربرد سافت‌استارتر | Application Selection | Pump, Fan, Conveyor, Compressor, Centrifugal Load |

### 1.7.1 Power Transformers — ترانسفورماتور قدرت

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.7.1.1 | انواع ترانس قدرت | Power Transformer Types | Two-Winding, Auto-Transformer, Three-Winding, Phase-Shifting |
| 1.7.1.2 | تپ‌چنجر | Tap Changers | OLTC, Off-Circuit, Resistor Type, Reactor Type, Diverter Switch |
| 1.7.1.3 | سیم‌پیچی و هسته | Windings & Core | Helical, Disc, Layer, Core Type, Shell Type, Core Material |
| 1.7.1.4 | خنک‌کاری | Cooling Systems | ONAN, ONAF, OFAF, OFWF, Forced Cooling, Radiator Design |
| 1.7.1.5 | تست ترانسفورماتور | Transformer Testing | Routine, Type, Special, Turns Ratio, Insulation, Impedance, DGA |

### 1.7.2 Distribution Transformers — ترانسفورماتور توزیع

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.7.2.1 | ترانس هوایی | Pole-Mounted | Single-Phase, Three-Phase, Self-Protected, Fused Cutout |
| 1.7.2.2 | ترانس زمینی | Pad-Mounted | Enclosure Type, Dead-Front, Live-Front, Operating Provisions |
| 1.7.2.3 | ترانس خشک | Dry-Type Transformers | Cast Resin, VPI, Open Wound, Ventilated, Temperature Class |

### 1.7.3 Special Transformers — ترانسفورماتور ویژه

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.7.3.1 | ترانس یکسوساز | Rectifier Transformers | 6-Pulse, 12-Pulse, Phase Displacement, Harmonic Cancellation |
| 1.7.3.2 | ترانس کوره | Furnace Transformers | High Current, Low Voltage, Tap Changer, Overload Capability |
| 1.7.3.3 | ترانس ارتینگ | Earthing Transformers | Zigzag, Star-Delta, Neutral Earthing, Grounding Impedance |

### 1.7.4 Oil & Insulation — روغن و عایق

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.7.4.1 | روغن ترانسفورماتور | Transformer Oil | Mineral Oil, Ester Fluid, Natural Ester, Breakdown Voltage |
| 1.7.4.2 | آنالیز گازی | DGA | Dissolved Gas Analysis, Key Gases, Rogers Ratio, Duval Triangle |
| 1.7.4.3 | عایق جامد | Solid Insulation | Paper, Pressboard, Nomex, Partial Discharge, Degree of Polymerization |

### 1.8.1 Solar PV — خورشیدی

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.8.1.1 | پنل‌های فتوولتائیک | PV Panels | Monocrystalline, Polycrystalline, Thin-Film, Bifacial, Efficiency |
| 1.8.1.2 | اینورتر خورشیدی | Solar Inverters | String Inverter, Central Inverter, Micro-Inverter, Hybrid Inverter |
| 1.8.1.3 | طراحی استرینگ | String Design | Series-Parallel Configuration, MPPT, Shading Analysis, Voltage/Temperature |
| 1.8.1.4 | سازه و نصب | Mounting & Installation | Rooftop, Ground-Mount, Tracking System, Tilt Angle, Wind Load |

### 1.8.2 Wind Power — بادی

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.8.2.1 | انواع توربین بادی | Wind Turbine Types | Horizontal Axis, Vertical Axis, Onshore, Offshore, DFIG, PMSG |
| 1.8.2.2 | مزرعه بادی | Wind Farm Design | Turbine Layout, Wake Effect, Capacity Factor, Energy Yield |
| 1.8.2.3 | اتصال به شبکه بادی | Grid Connection | LVRT, Fault Ride-Through, Reactive Power, Power Forecast |

### 1.8.3 Energy Storage — ذخیره‌ساز

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.8.3.1 | باتری‌ها | Battery Systems | Li-Ion, Lead-Acid, Flow Battery, NaS, LFP, NMC |
| 1.8.3.2 | سیستم مدیریت باتری | BMS | Cell Balancing, SOC, SOH, Temperature Monitoring, Protection |
| 1.8.3.3 | طراحی BESS | BESS Design | Capacity Sizing, C-Rate, Round-Trip Efficiency, Containerized |
| 1.8.3.4 | کاربردهای ذخیره‌ساز | Storage Applications | Peak Shaving, Frequency Regulation, Arbitrage, Backup |

### 1.8.4 Grid Interconnection — اتصال به شبکه

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.8.4.1 | اندازه‌گیری خالص | Net Metering | Bi-Directional Meter, Export/Import, Offset, Settlement |
| 1.8.4.2 | جزیره‌ای شدن | Islanding | Anti-Islanding, Intentional Islanding, Microgrid Transfer |
| 1.8.4.3 | انطباق با کد شبکه | Grid Code Compliance | Voltage/Frequency Limits, Power Quality, Protection Requirements |

### 1.8.5 Green Hydrogen — هیدروژن سبز (NEW)

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.8.5.1 | الکترولایزر | Electrolyzers | PEM, Alkaline, Solid Oxide, High-Temperature, Efficiency |
| 1.8.5.2 | ذخیره و انتقال هیدروژن | Hydrogen Storage & Transport | Compressed Gas, Liquid Hydrogen, Pipeline, Ammonia Carrier |
| 1.8.5.3 | پیل سوختی | Fuel Cells | PEMFC, SOFC, MCFC, Combined Heat and Power |

### 1.9.1 Lighting Design — طراحی روشنایی

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.9.1.1 | سطوح روشنایی | Illuminance Levels | Lux Targets, Task Area, Surround Area, Uniformity Ratio |
| 1.9.1.2 | انواع لامپ | Lamp Types | LED, Fluorescent, HID, Induction, Color Temperature, CRI |
| 1.9.1.3 | محاسبه روشنایی | Lighting Calculation | Lumen Method, DIALux, Point-by-Point, Maintenance Factor |
| 1.9.1.4 | روشنایی اضطراری | Emergency Lighting | Escape Route, Standby, Exit Signs, Central Battery, Self-Contained |

### 1.9.2 Internal Wiring — سیم‌کشی داخلی

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.9.2.1 | مدارهای روشنایی | Lighting Circuits | Radial, Loop-in, Junction Box, Switch Wiring, Dimmer Control |
| 1.9.2.2 | مدارهای پریز | Socket Circuits | Ring Circuit, Radial Circuit, Spur, Socket Rating, RCD Protection |
| 1.9.2.3 | لوله‌ها و داکت‌ها | Conduit & Trunking | PVC Conduit, Metal Conduit, Trunking, Cable Tray, Glanding |

### 1.9.3 Power Distribution — توزیع برق

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.9.3.1 | محاسبه دیماند | Demand Calculation | Connected Load, Diversity Factor, Demand Factor, Peak Demand |
| 1.9.3.2 | تابلوی اصلی | Main Distribution Board | Incomer, Busbar, Sub-Feed, Metering Compartment |
| 1.9.3.3 | تابلوی فرعی | Sub Distribution Board | Floor DB, Unit DB, Final Circuit Distribution, RCD Protection |
| 1.9.3.4 | بالابرنده | Rising Main / Riser | Vertical Busbar, Tap-Off, Floor Distribution, Cable Riser |

### 1.9.4 Fire Alarm — اعلام حریق

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.9.4.1 | دتکتورها | Detectors | Smoke, Heat, Multi-Criteria, CO, Flame, Aspirating |
| 1.9.4.2 | پنل اعلام حریق | Fire Alarm Panel | Conventional, Addressable, Loop, Zone, Cause & Effect |
| 1.9.4.3 | اعلام و اطفاء | Alarm & Suppression | Sounders, Strobes, Voice Evacuation, Sprinkler Interface |

### 1.9.5 BMS/BAS — مدیریت ساختمان (NEW)

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.9.5.1 | کنترل HVAC | HVAC Control | Temperature, Humidity, VAV, AHU, Chiller, Boiler |
| 1.9.5.2 | کنترل روشنایی | Lighting Control | DALI, 0-10V, Occupancy Sensor, Daylight Harvesting |
| 1.9.5.3 | یکپارچه‌سازی | System Integration | BACnet, Modbus, KNX, LonWorks, IoT Gateway |
| 1.9.5.4 | بهینه‌سازی انرژی | Energy Optimization | Scheduling, Setpoint Optimization, Demand-Limit, Fault Detection |

### 1.10.1 PLC Systems — PLC

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.10.1.1 | سخت‌افزار PLC | PLC Hardware | CPU, I/O Module, Power Supply, Rack, Backplane |
| 1.10.1.2 | برنامه‌نویسی PLC | PLC Programming | Ladder Logic, FBD, ST, SFC, IL (IEC 61131-3) |
| 1.10.1.3 | SCADA و HMI | SCADA & HMI | RTU, Master Station, Historian, Alarm Management |
| 1.10.1.4 | DCS | Distributed Control Systems | Redundancy, Controller, I/O Rack, Control Network |

### 1.10.2 Instrumentation — ابزار دقیق

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.10.2.1 | سنسورها | Sensors | Pressure, Temperature, Flow, Level, Proximity |
| 1.10.2.2 | ترانسمیترها | Transmitters | 4-20 mA, HART, Fieldbus, Smart, Configuration |
| 1.10.2.3 | اکچویتورها | Actuators | Electric, Pneumatic, Hydraulic, Control Valve, Positioner |
| 1.10.2.4 | حلقه ابزار دقیق | Instrument Loop | Loop Power, Isolation, Signal Conditioning, Cable Specification |

### 1.10.3 Industrial Networks — شبکه صنعتی

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.10.3.1 | شبکه‌های میدانی | Fieldbus Networks | Profibus PA/DP, Foundation Fieldbus, AS-Interface |
| 1.10.3.2 | شبکه‌های اترنت | Industrial Ethernet | Profinet, EtherNet/IP, EtherCAT, Modbus TCP |
| 1.10.3.3 | شبکه‌های سریال | Serial Networks | RS-232, RS-485, Modbus RTU, Point-to-Point, Multi-Drop |
| 1.10.3.4 | OPC | OPC Communication | OPC DA, OPC HDA, OPC UA, Client-Server, Pub-Sub |

### 1.10.4 Functional Safety — ایمنی

| Group Code | FA | EN | Contains Concepts |
|------------|----|----|-------------------|
| 1.10.4.1 | سطوح SIL | SIL Levels | SIL 1–4, PFD, PFH, SIF, SIS |
| 1.10.4.2 | رله‌های ایمنی | Safety Relays | Emergency Stop, Light Curtain, Two-Hand Control, Redundancy |
| 1.10.4.3 | سیستم‌های ایمنی | Safety Systems | Fail-Safe, Redundancy, Diagnostic Coverage, Proof Test |

---

## Level 4: Canonical Concepts — سطح ۴: مفاهیم بنیادین

Mapping concept groups to the canonical concepts defined in `canonical-concepts.md`.

| Group Code | Canonical Concept ID | Canonical Name | FA Name | Mapping Type |
|------------|---------------------|----------------|---------|--------------|
| 1.4.3.1 | XEN-CON-CABLE-SIZE-009 | Cable Sizing | اندازه‌گذاری کابل | Direct |
| 1.2.1.1 | XEN-CON-SHORT-CIRCUIT-001 | Short Circuit Current | جریان اتصال کوتاه | Direct |
| 1.2.1.3 | XEN-CON-PROT-COORD-004 | Protection Coordination | هماهنگی حفاظتی | Direct |
| 1.3.1.1 | XEN-CON-EARTHING-005 | Earthing System | سیستم ارتینگ | Direct |
| 1.9.3.1 | XEN-CON-DEMAND-010 | Demand Calculation | محاسبه دیماند | Direct |
| 1.1.5.1 | XEN-CON-ENERGY-CONSUMPTION-011 | Energy Consumption | مصرف انرژی | Direct |
| 1.1.6.1 | XEN-CON-LOAD-FLOW-002 | Load Flow | پخش بار | Related |
| 1.4.3.2 | XEN-CON-VOLTAGE-DROP-003 | Voltage Drop | افت ولتاژ | Related |
| 1.1.4.1 | XEN-CON-HARMONICS-007 | Harmonic Distortion | اعوجاج هارمونیکی | Related |
| 1.8.1.2 | XEN-CON-POWER-QUALITY-006 | Power Quality | کیفیت توان | Related |
| 1.7.1.4 | XEN-CON-TRANSFORMER-SIZE-008 | Transformer Sizing | اندازه‌گذاری ترانسفورماتور | Related |
| 1.2.6.1 | XEN-CON-FAULT-DIAG-012 | Fault Diagnosis | عیب‌یابی | Related |

| Mapping Type | Description |
|--------------|-------------|
| Direct | Concept group directly implements this canonical concept (primary mapping) |
| Related | Concept group has a supporting or subsidiary relationship to this canonical concept |

---

## Level 5: Knowledge Objects — سطح ۵: اشیاء دانش

Types of knowledge objects that map to each concept group.

| Group Code | Object Type | Examples |
|------------|-------------|----------|
| 1.4.3.2 | Standard | IEC 60364-5-52, IEEE 835 |
| 1.4.3.2 | Calculation | Cable Sizing Calculator (CABLE-001) |
| 1.4.3.2 | Catalog | Prysmian Cable Catalog |
| 1.4.3.2 | Manual | Cable Installation Guide |
| 1.2.1.1 | Standard | IEC 60909, IEEE C37.010 |
| 1.2.1.1 | Calculation | Short Circuit Calculator (SC-001) |
| 1.2.1.1 | Article | IEEE paper on fault current limits |
| 1.3.1.1 | Standard | IEEE 80, BS 7430, IEC 61936 |
| 1.3.1.1 | Calculation | Earth Grid Design Calculator (GRID-001) |
| 1.3.1.1 | Manual | Grounding Installation Guide |
| 1.9.3.1 | Standard | IEC 60364, NEC Article 220 |
| 1.9.3.1 | Calculation | Load Estimation Calculator (LOAD-001) |
| 1.9.3.1 | Regulation | Tavanir Demand Tariff Schedule |
| 1.1.5.1 | Standard | ISO 50001, IEC 62053 |
| 1.1.5.1 | Article | Energy Efficiency Guidelines |
| 1.1.5.1 | Book | Electrical Load Forecasting Handbook |
| 1.1.7.1 | Standard | IEEE 1110, IEEE PES Transient Stability Guidelines |
| 1.1.7.1 | Calculation | Transient Stability Simulation (TS-001) |
| 1.1.7.1 | Manual | Power System Stabilizer Tuning Guide |
| 1.2.6.1 | Standard | IEEE 1584, NFPA 70E |
| 1.2.6.1 | Calculation | Arc Flash Calculator (AF-001) |
| 1.2.6.1 | Regulation | OSHA Arc Flash Requirements |
| 1.5.5.1 | Standard | IEC 61439-6, BS EN 60439 |
| 1.5.5.1 | Catalog | Busbar Trunking Manufacturer Catalog |
| 1.5.5.1 | Calculation | Busbar Rating Calculator (BB-001) |
| 1.8.5.1 | Standard | IEC 62282, ISO 22734 |
| 1.8.5.1 | Article | Green Hydrogen Production Review |
| 1.8.5.1 | Manual | PEM Electrolyzer Installation Manual |
| 1.9.5.1 | Standard | ISO 16484, ASHRAE Guideline 13 |
| 1.9.5.1 | Catalog | BMS Controller Catalog |
| 1.9.5.1 | Manual | BACnet Integration Guide |
| 1.10.1.1 | Standard | IEC 61131-3 |
| 1.10.1.1 | Manual | Siemens S7 Programming Guide |
| 1.10.1.1 | Catalog | PLC Hardware Selection Guide |
| 1.10.4.1 | Standard | IEC 61508, IEC 62061, ISO 13849 |
| 1.10.4.1 | Calculation | SIL Verification Calculator (SIL-001) |
| 1.10.4.1 | Manual | Safety System Design Guide |

### Knowledge Object Type Definitions

| Object Type | FA | Description |
|-------------|----|-------------|
| Standard | استاندارد | International or national normative document (IEC, IEEE, ISIRI) |
| Regulation | مقررات | Legally binding rules (Tavanir, Ministry of Energy) |
| Tariff | تعرفه | Pricing schedules (Tavanir tariff categories) |
| Catalog | کاتالوگ | Manufacturer product range documentation |
| Datasheet | دیتاشیت | Technical specifications of a specific product |
| Manual | راهنما | Installation, operation, or maintenance instructions |
| Article | مقاله | Technical publication or technical note |
| Book | کتاب | Reference textbook or handbook |
| Case Study | مطالعه موردی | Real engineering project with analysis |
| Calculation | محاسبات | Engineering calculation procedures and tools |
| Drawing | نقشه | Single-line diagram, schematic, layout |
| Report | گزارش | Engineering report, test report, study |

---

## Cross-Domain Mappings — نگاشت‌های بین‌حوزه‌ای

Concepts and groups that span multiple domains.

| Concept | Source Domain | Target Domain | Relationship |
|---------|---------------|---------------|--------------|
| Power Quality (١.١.٤) | 1.1.4 Power Quality | 1.8 Renewable Energy | Inverter harmonics from solar PV and wind installations |
| Protection Coordination (١.٢.١) | 1.2 Protection | 1.7 Transformers | Transformer protection settings and coordination |
| Earthing System (١.٣.١) | 1.3 Grounding & Lightning | 1.9 Building Electrical | Earthing design for building electrical systems |
| Cable Sizing (١.٤.٣) | 1.4 Cables & Wiring | 1.6 Motors & Drives | Motor feeder cable sizing calculation |
| Arc Flash (١.٢.٦) | 1.2 Protection | 1.5 Switchgear & Panel | Arc flash incident energy in switchgear assemblies |
| Demand Calculation (١.٩.٣) | 1.9 Building Electrical | 1.1 Power Systems | Demand calculation for transformer sizing |
| Voltage Drop (١.٤.٣) | 1.4 Cables & Wiring | 1.1 Power Systems | Voltage drop in distribution networks |
| Transformer Sizing (١.٧.١) | 1.7 Transformers | 1.1 Power Systems | Transformer sizing from load flow studies |

### Cross-Domain Edges for Graph RAG

| Edge Type | From | To | Description |
|-----------|------|----|-------------|
| `CROSS_DOMAIN` | 1.1.4.1 (Harmonic Groups) | 1.8.1.2 (Solar Inverters) | Inverter harmonic distortion |
| `CROSS_DOMAIN` | 1.2.3.x (Transformer Protection) | 1.7.1.x (Power Transformers) | Transformer protection schemes |
| `CROSS_DOMAIN` | 1.3.1.x (Earthing Design) | 1.9.3.x (Building Distribution) | Building earthing requirements |
| `CROSS_DOMAIN` | 1.4.3.x (Cable Sizing) | 1.6.1.x (Motor Selection) | Motor feeder cable design |
| `CROSS_DOMAIN` | 1.2.6.x (Arc Flash) | 1.5.1.x (Switchgear) | Arc flash in switchgear |
| `CROSS_DOMAIN` | 1.9.3.1 (Demand Calc) | 1.7.1.x (Transformer Sizing) | Load estimation for transformers |
| `CROSS_DOMAIN` | 1.1.6.2 (Short Circuit) | 1.2.1.x (Protection) | Short circuit for protection settings |
| `CROSS_DOMAIN` | 1.8.3.x (Energy Storage) | 1.1.4.x (Power Quality) | BESS impact on power quality |

---

## Iranian Engineering Taxonomy Additions — افزوده‌های مهندسی ایران

Special taxonomy extensions for the Iranian engineering context.

### 2.13 ISIRI Standards — استانداردهای ملی ایران

| Code | FA | EN | Equivalent IEC |
|------|----|----|----------------|
| 2.13.1 | استانداردهای ملی | ISIRI National Standards | Various IEC |
| 2.13.2 | استانداردهای کابل | ISIRI Cable Standards | IEC 60228, IEC 60502 |
| 2.13.3 | استانداردهای ترانس | ISIRI Transformer Standards | IEC 60076 |
| 2.13.4 | استانداردهای ارتینگ | ISIRI Earthing Standards | IEC 60364, IEEE 80 |

### 2.14 Tavanir Regulations — مقررات توانیر

| Code | FA | EN | Description |
|------|----|----|-------------|
| 2.14.1 | مقررات طراحی | Tavanir Design Regulations | Technical specifications for network design |
| 2.14.2 | مقررات حفاظتی | Tavanir Protection Regulations | Protection coordination requirements |
| 2.14.3 | مقررات دیماند | Tavanir Demand Regulations | Demand calculation and Billing rules |
| 2.14.4 | مقررات انشعاب | Tavanir Connection Regulations | Service connection requirements |

### 2.15 Regional Distribution Company Documents — اسناد شرکت‌های توزیع منطقه‌ای

| Code | FA | EN | Example |
|------|----|----|---------|
| 2.15.1 | اسناد برق تهران | Tehran Power Documents | Bargh-e Tehran specifications |
| 2.15.2 | اسناد برق منطقه‌ای | Regional Company Documents | Bakhtar, Gharb, Shargh, Jonub |

### Tavanir Tariff Categories — تعرفه‌های مصوب توانیر

| Code | FA | EN | Application |
|------|----|----|-------------|
| 2.15.1 | تعرفه عمومی | General Tariff | Residential, commercial |
| 2.15.2 | تعرفه صنعتی | Industrial Tariff | Factories, industrial plants |
| 2.15.3 | تعرفه کشاورزی | Agricultural Tariff | Farming, irrigation |
| 2.15.4 | تعرفه تجاری | Commercial Tariff | Shops, offices |
| 2.15.5 | تعرفه دیماند | Demand Tariff | High-consumption subscribers |

---

## Taxonomy v2 → AI & Graph RAG

### Graph Node Hierarchy

| Taxonomy Level | Graph Node Type | Example | Properties |
|----------------|----------------|---------|------------|
| Level 1 | `EngineeringDomain` | `PowerSystems` | code, name_fa, name_en, terms_count |
| Level 2 | `Subdomain` | `Distribution` | code, name_fa, name_en, parent_domain |
| Level 3 | `ConceptGroup` | `CableSizing` | code, name_fa, name_en, contains_concepts |
| Level 4 | `CanonicalConcept` | `XEN-CON-CABLE-SIZE-009` | concept_id, definition, type, standards |
| Level 5 | `KnowledgeObject` | `IEC 60364-5-52` | doc_id, object_type, url, tier |

### Graph Edge Types

| Edge Type | From Level | To Level | Description |
|-----------|------------|----------|-------------|
| `BELONGS_TO` | L2 → L1 | Subdomain → Domain | Subdomain belongs to domain |
| `BELONGS_TO` | L3 → L2 | ConceptGroup → Subdomain | Group belongs to subdomain |
| `BELONGS_TO` | L4 → L3 | CanonicalConcept → ConceptGroup | Concept belongs to group |
| `BELONGS_TO` | L5 → L3 | KnowledgeObject → ConceptGroup | Object belongs to group |
| `CROSS_DOMAIN` | L3 → L3 | ConceptGroup → ConceptGroup | Sibling groups across domains |
| `DIRECT_MAPPING` | L4 → L3 | CanonicalConcept → ConceptGroup | Direct mapping relationship |
| `RELATED_MAPPING` | L4 → L3 | CanonicalConcept → ConceptGroup | Related mapping relationship |

### AI Integration Rules

| Rule | Description |
|------|-------------|
| **Filter Parameter** | Taxonomy codes (e.g., `1.1.3.2`) used as filter parameters for RAG retrieval to scope search results to specific domains/subdomains |
| **Query Expansion** | Taxonomy hierarchy enables query expansion: user queries can be broadened (parent domain) or narrowed (child groups) based on the taxonomy tree |
| **Contextual Embedding Prefix** | Full taxonomy path (e.g., `Power Systems > Distribution > Cable Sizing`) can be used as a contextual embedding prefix to disambiguate polysemous terms |
| **Hybrid Search** | Taxonomy codes combined with vector similarity for hybrid search: exact taxonomy filter + semantic similarity on content |
| **Multi-Hop Reasoning** | Cross-domain edges enable graph traversal across related concept groups for multi-hop question answering |
| **Auto-Tagging** | New documents can be auto-tagged with taxonomy codes via classifier trained on group definitions and canonical concept mappings |
| **Bilingual Retrieval** | Persian and English taxonomy labels both indexed; queries in either language resolve to the same taxonomy node |

### Query Examples

| Query Type | Example | Taxonomy Use |
|------------|---------|--------------|
| Filtered | "Find cable sizing standards for 20 kV networks" | Filter: `1.4.3` (Cable Sizing) → return only objects from that group |
| Expanded | "What protection do I need for a transformer?" | Expand: `1.2.3` (Transformer Protection) + `1.7.1` (Power Transformers) via cross-domain |
| Narrowed | "Show me solar inverter specifications" | Narrow: `1.8` (Renewable) → `1.8.1` (Solar PV) → `1.8.1.2` (Solar Inverters) |
| Cross-lingual | "استاندارد ارتینگ" | Resolve: FA label → taxonomy node `1.3.1` → retrieve linked standards |

---

## Version History — تاریخچه نسخه

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Tir 1405 | Initial taxonomy (4 dimensions, 10 domains, 40+ subdomains) |
| 2.0.0 | Tir 1405 | 5-level hierarchy with concept groups, canonical concept mapping, knowledge objects, cross-domain mappings, AI & Graph RAG integration |

---

> Related documents: [`canonical-concepts.md`](../concepts/canonical-concepts.md), [`synonym-dictionary.md`](./synonym-dictionary.md), [`naming-conventions.md`](../governance/naming-conventions.md), [`taxonomy.md`](../governance/taxonomy.md)
