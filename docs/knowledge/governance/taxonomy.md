# طبقه‌بندی دانش مهندسی — Engineering Knowledge Taxonomy

**Version:** 1.0.0 | **Status:** Published | **Last Updated:** Tir 1405

---

## Overview

The Xennic taxonomy classifies engineering knowledge along four orthogonal dimensions: **Domain**, **Document Type**, **Source Tier**, and **Application**. Every knowledge artifact is assigned one or more labels from each dimension.

---

## 1. By Engineering Domain (حوزهٔ مهندسی)

### 1.1 Power Systems — سیستم‌های قدرت

| Code | FA | EN | Description |
|------|----|----|-------------|
| 1.1.1 | تولید | Generation | Power plant technologies, generators, excitation systems |
| 1.1.2 | انتقال | Transmission | HV/EHV lines, substations, busbars, series compensation |
| 1.1.3 | توزیع | Distribution | MV/LV networks, distribution transformers, feeders |
| 1.1.4 | کیفیت برق | Power Quality | Harmonics, flicker, voltage sag/swell, PF correction |
| 1.1.5 | بار و مصرف | Load & Consumption | Load profiling, demand forecasting, energy efficiency |

### 1.2 Protection — حفاظت

| Code | FA | EN | Description |
|------|----|----|-------------|
| 1.2.1 | حفاظت عمومی | General Protection | Overcurrent, earth fault, differential, distance |
| 1.2.2 | رله‌ها | Relays | Numerical relays, protection coordination, setting |
| 1.2.3 | حفاظت ترانسفورماتور | Transformer Protection | Buchholz, OLTC, differential, restricted earth fault |
| 1.2.4 | حفاظت خطوط | Line Protection | Distance schemes, pilot protection, auto-reclosure |
| 1.2.5 | حفاظت ژنراتور | Generator Protection | Stator, rotor, loss of excitation, motoring |

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

### 1.9 Building Electrical — تأسیسات برق ساختمان

| Code | FA | EN | Description |
|------|----|----|-------------|
| 1.9.1 | طراحی روشنایی | Lighting Design | Lux levels, luminaire selection, emergency |
| 1.9.2 | سیم‌کشی داخلی | Internal Wiring | Conduit, trunking, socket circuits, load estimation |
| 1.9.3 | توزیع برق | Power Distribution | Main DB, sub-DB, riser, metering |
| 1.9.4 | اعلام حریق | Fire Alarm | Detection, alarm, voice evacuation, BS 5839 |

### 1.10 Industrial Control — کنترل صنعتی

| Code | FA | EN | Description |
|------|----|----|-------------|
| 1.10.1 | PLC | PLC Systems | Ladder logic, SCADA, DCS, RTU |
| 1.10.2 | ابزار دقیق | Instrumentation | Sensors, transmitters, actuators, loop power |
| 1.10.3 | شبکه صنعتی | Industrial Networks | Profibus, Modbus, Ethernet/IP, OPC UA |
| 1.10.4 | ایمنی | Functional Safety | SIL, safety relays, redundancy |

---

## 2. By Document Type (نوع سند)

| Code | FA | EN | Description |
|------|----|----|-------------|
| 2.1 | استاندارد | Standard | International or national normative document |
| 2.2 | مقررات | Regulation | Legally binding rules from authorities |
| 2.3 | تعرفه | Tariff | Pricing schedules for energy or equipment |
| 2.4 | کاتالوگ | Catalog | Manufacturer product range |
| 2.5 | دیتاشیت | Datasheet | Technical specifications of a specific product |
| 2.6 | راهنما | Manual | Installation, operation, or maintenance instructions |
| 2.7 | مقاله | Article | Technical publication or technical note |
| 2.8 | کتاب | Book | Reference textbook or handbook |
| 2.9 | مطالعه موردی | Case Study | Real engineering project with analysis |
| 2.10 | محاسبات | Calculation | Engineering calculations & design notes |
| 2.11 | نقشه | Drawing | Single-line diagram, schematic, layout |
| 2.12 | گزارش | Report | Engineering report, test report, study |

---

## 3. By Source Tier (ردیف منبع)

| Code | Tier | FA | EN |
|------|------|----|----|
| 3.1 | Tier 1 | استانداردهای بین‌المللی | International Standards |
| 3.2 | Tier 2 | مقررات ملی | National Regulations |
| 3.3 | Tier 3 | مستندات سازنده | Manufacturer Documentation |
| 3.4 | Tier 4 | مقالات علمی | Peer Reviewed Papers |
| 3.5 | Tier 5 | دانش عمومی | Community Knowledge |

Detailed definitions are in the [Source Hierarchy](./source-hierarchy.md) document.

---

## 4. By Application (کاربرد)

| Code | FA | EN | Description |
|------|----|----|-------------|
| 4.1 | طراحی | Design | System sizing, equipment selection, layout |
| 4.2 | تحلیل | Analysis | Simulation, fault analysis, load flow, coordination |
| 4.3 | نصب | Installation | Site work, commissioning, testing |
| 4.4 | نگهداری | Maintenance | Preventive, predictive, corrective procedures |
| 4.5 | بازرسی | Inspection | Visual inspection, thermography, partial discharge |
| 4.6 | آموزش | Education | Training material, tutorials, reference |

---

## Taxonomy Assignment Rules

1. Every document MUST have at least one Domain code, one Document Type code, and one Application code.
2. Source Tier is derived automatically from the document type and origin; it MAY be overridden by admin.
3. A document MAY belong to multiple domains (e.g., a transformer protection standard → 1.2.3 + 1.7.1).
4. The full classification is stored as: `{ "domain": ["1.1.3"], "doc_type": ["2.1"], "tier": ["3.1"], "application": ["4.1"] }`.
5. Taxonomy codes are immutable once assigned; corrections create a new version.
