# فرهنگ مخفف‌ها — Acronym Dictionary

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Purpose — هدف

Normalize all engineering abbreviations used in the Xennic knowledge base. Every acronym resolves to exactly one canonical full form (or multiple with explicit context disambiguation rules). This dictionary serves as the authoritative reference for acronym expansion in AI pipelines, Graph RAG node mapping, and human-readable documentation.

---

## Entry Structure — ساختار ورودی

| Field | Description | Example |
|-------|-------------|---------|
| `acronym_id` | Unique identifier | XEN-ACR-0001 |
| `acronym` | The abbreviation | CB |
| `full_name_en` | Full English form | Circuit Breaker |
| `full_name_fa` | Full Persian form | کلید قدرت |
| `domain` | Engineering domain | switchgear |
| `related_concepts` | Links to canonical concepts | switchgear, protection, overcurrent |
| `usage_notes` | When and how to use | Use for MV/HV switching devices only; distinguish from switch-disconnector |
| `disambiguation` | Context for resolution if ambiguous | — |

---

## Equipment — تجهیزات

| ID | Acronym | Full Name (EN) | Full Name (FA) | Domain | Related Concepts | Usage Notes | Disambiguation |
|----|---------|----------------|----------------|--------|------------------|-------------|----------------|
| XEN-ACR-0001 | CB | Circuit Breaker | کلید قدرت | switchgear | switchgear, protection | Use for MV/HV switching devices with fault interruption capability | — |
| XEN-ACR-0002 | CT | Current Transformer | ترانسفورماتور جریان | protection | protection, metering | Always specify core type (protection/measurement) | Do not confuse with "Computed Tomography" |
| XEN-ACR-0003 | PT | Potential Transformer | ترانسفورماتور ولتاژ | protection | protection, metering | Also called Voltage Transformer (VT) | See VT alternative |
| XEN-ACR-0004 | VT | Voltage Transformer | ترانسفورماتور ولتاژ | protection | protection, metering | Preferred term in IEC context | — |
| XEN-ACR-0005 | RMU | Ring Main Unit | واحد حلقه اصلی | switchgear | distribution, switchgear | Used in MV distribution networks | — |
| XEN-ACR-0006 | GIS | Gas Insulated Switchgear | تابلو برق عایق گازی | switchgear | switchgear, substation | SF6 insulated; specify gas type | — |
| XEN-ACR-0007 | AIS | Air Insulated Switchgear | تابلو برق عایق هوا | switchgear | switchgear, substation | Conventional air-insulated; higher footprint than GIS | — |
| XEN-ACR-0008 | OLTC | On Load Tap Changer | تغییر دهنده پست تحت بار | transformer | transformer, voltage regulation | Located in power transformers; distinguishes from off-circuit tap changer | — |
| XEN-ACR-0009 | VSD | Variable Speed Drive | درایو سرعت متغیر | motor | motor, drive, control | General term for speed control | See VFD (largely interchangeable) |
| XEN-ACR-0010 | VFD | Variable Frequency Drive | درایو فرکانس متغیر | motor | motor, drive, control | Specific to frequency-based speed control | Largely synonymous with VSD |
| XEN-ACR-0011 | MCC | Motor Control Center | مرکز کنترل موتور | motor | motor, switchgear, control | LV assembly for motor control | — |
| XEN-ACR-0012 | DB | Distribution Board | تابلو توزیع | distribution | distribution, LV | LV final distribution | Do not confuse with "Database" |
| XEN-ACR-0013 | MDB | Main Distribution Board | تابلو اصلی توزیع | distribution | distribution, LV | Primary DB in a building electrical system | — |
| XEN-ACR-0014 | SMDB | Sub Main Distribution Board | تابلو فرعی توزیع | distribution | distribution, LV | Secondary DB fed from MDB | — |
| XEN-ACR-0015 | UPS | Uninterruptible Power Supply | منبع تغذیه بدون وقفه | power quality | power quality, backup | Specify topology (online/offline/line-interactive) | — |
| XEN-ACR-0016 | ATS | Automatic Transfer Switch | کلید انتقال خودکار | switchgear | switchgear, backup | Automatic source transfer between normal/emergency | — |
| XEN-ACR-0017 | SPD | Surge Protective Device | وسیله حفاظتی در برابر موج | grounding | surge protection, grounding | IEC 61643 rated | — |
| XEN-ACR-0018 | RCD | Residual Current Device | کلید محافظ جان | protection | protection, LV | Detects leakage current | — |
| XEN-ACR-0019 | RCBO | Residual Current Breaker with Overcurrent | کلید محافظ جان با حفاظت اضافه جریان | protection | protection, LV | Combines RCD + MCB functions | — |
| XEN-ACR-0020 | MCB | Miniature Circuit Breaker | کلید مینیاتوری | switchgear | switchgear, protection, LV | Up to 125 A, IEC 60898 | — |
| XEN-ACR-0021 | MCCB | Molded Case Circuit Breaker | کلید کامپکت | switchgear | switchgear, protection, LV | 63–1600 A, IEC 60947-2 | — |
| XEN-ACR-0022 | ACB | Air Circuit Breaker | کلید هوایی | switchgear | switchgear, protection, LV | LV main breakers, typically >630 A | — |
| XEN-ACR-0023 | VCB | Vacuum Circuit Breaker | کلید خلأ | switchgear | switchgear, protection, MV | MV preferred technology up to 40.5 kV | — |
| XEN-ACR-0024 | SF6 CB | Sulfur Hexafluoride Circuit Breaker | کلید هگزا فلوراید گوگرد | switchgear | switchgear, protection | MV/HV; gas-insulated interrupter | — |

---

## Protection — حفاظت

| ID | Acronym | Full Name (EN) | Full Name (FA) | Domain | Related Concepts | Usage Notes | Disambiguation |
|----|---------|----------------|----------------|--------|------------------|-------------|----------------|
| XEN-ACR-0025 | OC | Overcurrent | اضافه جریان | protection | protection, relay | General term for current above rated | Distinguish from OC/EF (overcurrent + earth fault) |
| XEN-ACR-0026 | OC/EF | Overcurrent and Earth Fault | اضافه جریان و خطای زمین | protection | protection, relay | Common combined protection function | — |
| XEN-ACR-0027 | EF | Earth Fault | خطای زمین | protection | protection, grounding | Also called "ground fault" | — |
| XEN-ACR-0028 | REF | Restricted Earth Fault | خطای زمین محدود | protection | transformer protection | Differential earth fault protection for transformers | — |
| XEN-ACR-0029 | O/C | Overcurrent | اضافه جریان | protection | protection, relay | Alternative notation for overcurrent | Synonymous with OC; avoid mixing notations |
| XEN-ACR-0030 | U/V | Under Voltage | کم‌فشانی | protection | protection, voltage | Voltage below threshold | — |
| XEN-ACR-0031 | O/V | Over Voltage | بیش‌فشانی | protection | protection, voltage | Voltage above threshold | — |
| XEN-ACR-0032 | O/F | Over Frequency | بیش‌فرکانسی | protection | protection, frequency | Frequency above threshold | — |
| XEN-ACR-0033 | U/F | Under Frequency | کم‌فرکانسی | protection | protection, frequency | Frequency below threshold | — |
| XEN-ACR-0034 | O/L | Over Load | اضافه بار | protection | protection, thermal | Thermal overload protection | — |
| XEN-ACR-0035 | ANSI | American National Standards Institute | مؤسسه استاندارد ملی آمریکا | standards | standards, protection | ANSI device numbers used in protection schematics | — |
| XEN-ACR-0036 | IEEE | Institute of Electrical and Electronics Engineers | مؤسسه مهندسین برق و الکترونیک | standards | standards, protection | Publisher of major power system standards | — |
| XEN-ACR-0037 | IEC | International Electrotechnical Commission | کمیسیون بین‌المللی الکتروتکنیک | standards | standards, protection | Primary international standards body for electrical engineering | — |

---

## Power Systems — سیستم‌های قدرت

| ID | Acronym | Full Name (EN) | Full Name (FA) | Domain | Related Concepts | Usage Notes | Disambiguation |
|----|---------|----------------|----------------|--------|------------------|-------------|----------------|
| XEN-ACR-0038 | HV | High Voltage | ولتاژ بالا | power | voltage, transmission | IEC: >36 kV AC | — |
| XEN-ACR-0039 | MV | Medium Voltage | ولتاژ متوسط | power | voltage, distribution | IEC: 1–36 kV AC | — |
| XEN-ACR-0040 | LV | Low Voltage | ولتاژ پایین | power | voltage, distribution | IEC: ≤1000 V AC / ≤1500 V DC | — |
| XEN-ACR-0041 | EHV | Extra High Voltage | ولتاژ فوق‌العاده بالا | power | voltage, transmission | >230 kV; varies by region | — |
| XEN-ACR-0042 | UHV | Ultra High Voltage | ولتاژ بسیار بالا | power | voltage, transmission | >800 kV AC / >500 kV DC | — |
| XEN-ACR-0043 | AC | Alternating Current | جریان متناوب | power | power system, current | Standard for power transmission | — |
| XEN-ACR-0044 | DC | Direct Current | جریان مستقیم | power | power system, current | Used in HVDC, battery systems, electronics | — |
| XEN-ACR-0045 | HVDC | High Voltage Direct Current | جریان مستقیم ولتاژ بالا | power | transmission, DC | Long-distance bulk power transmission | — |
| XEN-ACR-0046 | HVAC | Heating Ventilation and Air Conditioning | گرمایش، تهویه و سرمایش | building | building, mechanical | Building services system | **Not** High Voltage AC; domain disambiguates |
| XEN-ACR-0047 | PF | Power Factor | ضریب قدرت | power quality | power quality, efficiency | Ratio of active to apparent power | — |
| XEN-ACR-0048 | THD | Total Harmonic Distortion | اعوجاج هارمونیکی کل | power quality | harmonics, power quality | Voltage or current harmonic distortion | — |
| XEN-ACR-0049 | TDD | Total Demand Distortion | اعوجاج کل تقاضا | power quality | harmonics, power quality | Current harmonics relative to peak demand | Similar to THD but normalized to demand |
| XEN-ACR-0050 | PCC | Point of Common Coupling | نقطه اتصال مشترک | power quality | grid connection, power quality | Interface between customer and utility | — |
| XEN-ACR-0051 | SC | Short Circuit | اتصال کوتاه | protection | fault, protection | Fault condition | — |
| XEN-ACR-0052 | BIL | Basic Insulation Level | سطح عایقی پایه | power | insulation, transformer, switchgear | Lightning impulse withstand voltage | — |

---

## Renewable — انرژی تجدیدپذیر

| ID | Acronym | Full Name (EN) | Full Name (FA) | Domain | Related Concepts | Usage Notes | Disambiguation |
|----|---------|----------------|----------------|--------|------------------|-------------|----------------|
| XEN-ACR-0053 | PV | Photovoltaic | فتوولتائیک | renewable | solar, generation | Solar power generation technology | — |
| XEN-ACR-0054 | BESS | Battery Energy Storage System | سیستم ذخیره‌سازی انرژی باتری | renewable | storage, battery | Grid-scale or behind-the-meter storage | — |
| XEN-ACR-0055 | MPPT | Maximum Power Point Tracking | ردیابی نقطه حداکثر توان | renewable | solar, inverter | Algorithm in PV inverters | — |
| XEN-ACR-0056 | SOC | State of Charge | وضعیت شارژ | renewable | battery, storage | Battery charge level (0–100%) | Do not confuse with "System on Chip" |
| XEN-ACR-0057 | DOD | Depth of Discharge | عمق دشارژ | renewable | battery, storage | Inverse of SOC | — |
| XEN-ACR-0058 | DER | Distributed Energy Resource | منبع انرژی توزیع‌شده | renewable | distribution, generation | Small-scale generation/storage connected to distribution network | — |
| XEN-ACR-0059 | VPP | Virtual Power Plant | نیروگاه مجازی | renewable | aggregation, smart grid | Aggregated DERs acting as a single power plant | — |
| XEN-ACR-0060 | PPA | Power Purchase Agreement | قرارداد خرید برق | renewable | commercial, tariff | Long-term electricity purchase contract | — |
| XEN-ACR-0061 | REC | Renewable Energy Certificate | گواهی انرژی تجدیدپذیر | renewable | commercial, regulation | Tradable certificate for renewable generation | — |
| XEN-ACR-0062 | FiT | Feed in Tariff | تعرفه تضمینی خرید برق | renewable | tariff, regulation | Government-guaranteed price for renewable generation | — |

---

## Control & Automation — کنترل و اتوماسیون

| ID | Acronym | Full Name (EN) | Full Name (FA) | Domain | Related Concepts | Usage Notes | Disambiguation |
|----|---------|----------------|----------------|--------|------------------|-------------|----------------|
| XEN-ACR-0063 | SCADA | Supervisory Control and Data Acquisition | کنترل نظارتی و گردآوری داده‌ها | control | automation, monitoring | Centralized system for remote monitoring and control | — |
| XEN-ACR-0064 | DCS | Distributed Control System | سیستم کنترل توزیع‌شده | control | automation, process control | Process control system for continuous industrial processes | — |
| XEN-ACR-0065 | PLC | Programmable Logic Controller | کنترل‌کننده منطقی برنامه‌پذیر | control | automation, industrial control | Industrial digital computer for automation | — |
| XEN-ACR-0066 | RTU | Remote Terminal Unit | واحد پایانه دوردست | control | automation, SCADA | Field device for data acquisition and control | — |
| XEN-ACR-0067 | HMI | Human Machine Interface | رابط انسان و ماشین | control | automation, SCADA | User interface for industrial control systems | — |
| XEN-ACR-0068 | EMS | Energy Management System | سیستم مدیریت انرژی | control | energy, monitoring | Software for monitoring and optimizing energy consumption | — |
| XEN-ACR-0069 | DMS | Distribution Management System | سیستم مدیریت توزیع | control | distribution, automation | Utility system for managing distribution networks | — |
| XEN-ACR-0070 | OMS | Outage Management System | سیستم مدیریت خاموشی | control | distribution, reliability | Utility system for outage detection and restoration | — |
| XEN-ACR-0071 | AMI | Advanced Metering Infrastructure | زیرساخت اندازه‌گیری پیشرفته | control | metering, smart grid | Smart meter network infrastructure | — |
| XEN-ACR-0072 | WAMS | Wide Area Monitoring System | سیستم پایش گسترده | control | monitoring, transmission | Phasor-based wide-area power system monitoring | — |
| XEN-ACR-0073 | PMU | Phasor Measurement Unit | واحد اندازه‌گیری فازوری | control | monitoring, WAMS | High-speed synchronized measurement device | — |
| XEN-ACR-0074 | GPS | Global Positioning System | سامانه موقعیت‌یاب جهانی | control | timing, synchronization | Used for PMU time synchronization | Not navigation use in power context |

---

## Standards & Organizations — استانداردها و سازمان‌ها

| ID | Acronym | Full Name (EN) | Full Name (FA) | Domain | Related Concepts | Usage Notes | Disambiguation |
|----|---------|----------------|----------------|--------|------------------|-------------|----------------|
| XEN-ACR-0075 | ISIRI | Institute of Standards and Industrial Research of Iran | مؤسسه استاندارد و تحقیقات صنعتی ایران | standards | regulation, Iran | Iranian national standards body | — |
| XEN-ACR-0076 | SATBA | Renewable Energy Organization of Iran | سازمان انرژی‌های تجدیدپذیر و بهره‌وری انرژی ایران | regulation | renewable, Iran | Government body for renewable energy | Also known as "ساتبا" |
| XEN-ACR-0077 | TAVANIR | Iran Power Generation and Transmission Company | شرکت مادرتخصصی تولید و انتقال نیروی برق ایران | regulation | power, Iran | State-owned power utility holding company | Also known as "توانیر" |
| XEN-ACR-0078 | NIGC | National Iranian Gas Company | شرکت ملی گاز ایران | regulation | gas, Iran | State-owned gas company | — |
| XEN-ACR-0079 | NIOEC | National Iranian Oil Engineering Company | شرکت مهندسی نفت ایران | regulation | oil, Iran | Engineering arm of Iranian oil industry | — |
| XEN-ACR-0080 | EPC | Engineering Procurement Construction | مهندسی، تأمین و ساخت | commercial | project, contract | Project delivery method | — |
| XEN-ACR-0081 | BOO | Build Own Operate | ساخت، مالکیت و بهره‌برداری | commercial | project, contract | Project financing model | — |
| XEN-ACR-0082 | BOT | Build Operate Transfer | ساخت، بهره‌برداری و انتقال | commercial | project, contract | Project financing model with transfer | — |

---

## Measurement — اندازه‌گیری

| ID | Acronym | Full Name (EN) | Full Name (FA) | Domain | Related Concepts | Usage Notes | Disambiguation |
|----|---------|----------------|----------------|--------|------------------|-------------|----------------|
| XEN-ACR-0083 | RMS | Root Mean Square | مقدار مؤثر | measurement | voltage, current | Effective value of AC waveform | — |
| XEN-ACR-0084 | P-P | Peak to Peak | پیک تا پیک | measurement | voltage, waveform | Peak-to-peak amplitude | — |
| XEN-ACR-0085 | PEAK | Maximum Value | حداکثر مقدار | measurement | voltage, current | Peak instantaneous value | — |
| XEN-ACR-0086 | FLA | Full Load Amps | جریان بار کامل | measurement | motor, current | Rated current at full load | — |
| XEN-ACR-0087 | LRA | Locked Rotor Amps | جریان روتور قفل‌شده | measurement | motor, starting | Starting inrush current of motor | — |
| XEN-ACR-0088 | SFA | Service Factor Amps | جریان ضریب سرویس | measurement | motor, overload | Maximum continuous current at service factor | — |
| XEN-ACR-0089 | MVA | Mega Volt Ampere | مگا ولت آمپر | measurement | power, apparent power | Apparent power rating | — |
| XEN-ACR-0090 | kVA | Kilo Volt Ampere | کیلو ولت آمپر | measurement | power, apparent power | Apparent power for smaller equipment | — |
| XEN-ACR-0091 | kW | Kilo Watt | کیلو وات | measurement | power, active power | Active power | — |
| XEN-ACR-0092 | MW | Mega Watt | مگا وات | measurement | power, active power | Large-scale active power | — |
| XEN-ACR-0093 | GW | Giga Watt | گیگا وات | measurement | power, active power | National-scale active power | — |
| XEN-ACR-0094 | kV | Kilo Volt | کیلو ولت | measurement | voltage | Voltage level | — |
| XEN-ACR-0095 | kA | Kilo Ampere | کیلو آمپر | measurement | current | High fault current levels | — |

---

## Persian Acronyms — مخفف‌های فارسی

Special section for acronyms originating from Persian (Farsi) engineering terminology.

| ID | Acronym | Full Name (FA) | Full Name (EN) | Domain | Usage Notes |
|----|---------|----------------|----------------|--------|-------------|
| XEN-ACR-P001 | ب.ت | بهره‌برداری | Operation | power | Used in tariff and dispatch documents |
| XEN-ACR-P002 | ق.ق | قراردادی | Contracted | commercial | Appears in power purchase agreements |
| XEN-ACR-P003 | ا.ث.ب | اتصال ثابت به باس | Solidly Grounded | grounding | Neutral grounding method in MV/LV systems |
| XEN-ACR-P004 | ت.ض | تلفات ضریب | Loss Factor | power | Used in loss calculation formulas |
| XEN-ACR-P005 | ه.ت | هزینه تأمین | Supply Cost | commercial | Used in tariff structure documents |
| XEN-ACR-P006 | د.م | دیماند اندازه‌گیری‌شده | Measured Demand | power | Recorded maximum demand in tariff billing |
| XEN-ACR-P007 | ق.ق.د | قدرت قراردادی دیماند | Contracted Demand Capacity | power | Maximum contracted power in demand tariff |
| XEN-ACR-P008 | ض.ه | ضریب همزمانی | Diversity Factor | power | Ratio of simultaneous to peak demand |

---

## Iranian Engineering Acronyms — مخفف‌های مهندسی ایران

Dedicated section for organizations and entities in the Iranian power industry.

| ID | Persian Name | Acronym / Alternative | Full Name (EN) | Role |
|----|-------------|----------------------|----------------|------|
| XEN-ACR-IR001 | توانیر | TAVANIR | Iran Power Generation, Transmission & Distribution Co. | State-owned holding company managing Iran's power grid |
| XEN-ACR-IR002 | برق منطقه‌ای | Regional Electric Co. | Regional Electric Company | Regional transmission and dispatch under Tavanir |
| XEN-ACR-IR003 | توزیع برق | Distribution Co. | Power Distribution Company | Provincial distribution utility under Tavanir |
| XEN-ACR-IR004 | ساتبا | SATBA | Renewable Energy & Energy Efficiency Organization | Government body regulating renewable energy |
| XEN-ACR-IR005 | مپنا | MAPNA | Power Plants Management Company | Major EPC contractor for power plants |
| XEN-ACR-IR006 | نصب نیرو | Nasb Niroo | Power Plant Equipment Company | Manufacturer of power plant equipment |
| XEN-ACR-IR007 | فراب | FARAB | Regional Electric Company of Fars | Regional utility for Fars province |
| XEN-ACR-IR008 | برق تهران | Bargh-e Tehran | Tehran Power Distribution Company | Distribution utility for Tehran province |

---

## Acronym → Graph Mapping — نگاشت مخفف‌ها به گراف

Each acronym is represented as a node in the knowledge graph with the following structure:

### Node

| Property | Value |
|----------|-------|
| **Label** | `Acronym` |
| **Properties** | `acronym_id`, `acronym`, `full_name_en`, `full_name_fa`, `domain` |

### Edges

| Edge Type | Target Node | Properties | Description |
|-----------|-------------|------------|-------------|
| `EXPANDS_TO` | `FullForm` | `{confidence: 1.0, domain: "<domain>"}` | Connects the acronym to its full-form expansion node |
| `HAS_CANONICAL` | `CanonicalConcept` | — | Connects the acronym to the canonical concept node in the conceptual model |

### Example Subgraph (CB)

```
(Acronym {acronym: "CB"})
    --[EXPANDS_TO {confidence: 1.0, domain: "switchgear"}]--> 
        (FullForm {name_en: "Circuit Breaker", name_fa: "کلید قدرت"})
    --[HAS_CANONICAL]--> 
        (CanonicalConcept {name: "Circuit Breaker"})
```

### AI Pipeline Rules

1. **Pre-Processing**: All user queries and document text are scanned for acronym matches before embedding or search.
2. **Canonical Expansion**: Matched acronyms are expanded to their canonical full form before vector embedding.
3. **Domain Filtering**: When an acronym is ambiguous (e.g., HVAC), the document domain metadata determines the correct expansion.
4. **Graph Traversal**: Graph RAG queries can traverse from acronym → full form → canonical concept → related concepts for multi-hop reasoning.

---

## Version History — تاریخچه نسخه

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Tir 1405 | Initial draft — 95 acronym entries across equipment, protection, power systems, renewable, control, standards, measurement, Persian, and Iranian engineering sections |
