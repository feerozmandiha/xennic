# مفاهیم بنیادین — Canonical Concepts Library

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Purpose

Define the first generation of Xennic canonical (standard) engineering concepts. Each concept is a pre-defined, reusable knowledge unit with formal definition, sources, and relationships to entities and other concepts. These form the vocabulary that AI services use to reason about engineering problems.

---

## 2. Concept Structure

Every canonical concept follows this structure:

| Field | Type | Description |
|-------|------|-------------|
| `concept_id` | UUID | XEN-CON-{SHORT-NAME}-{NNN} |
| `name_fa` | Text | Persian name |
| `name_en` | Text | English name |
| `aliases` | Array[Text] | Common alternative names |
| `definition` | Text | Formal definition (2–3 sentences) |
| `domains` | Array[Enum] | Engineering disciplines (from taxonomy) |
| `concept_type` | Enum | fact / rule / constraint / assumption / calculation / conclusion |
| `related_standards` | Array[Text] | Tier 1–2 references |
| `related_calculations` | Array[Text] | Engineering calculation procedures |
| `related_equipment` | Array[Text] | Equipment types involved |
| `related_regulations` | Array[Text] | National/international regulations |
| `related_tariffs` | Array[Text] | Applicable tariffs |
| `relationships` | Array[Object] | Connections to other concepts |
| `status` | Enum | Lifecycle stage |

---

## 3. Concept Catalog

### 3.1 Short Circuit Current (جریان اتصال کوتاه)

| Field | Value |
|-------|-------|
| `concept_id` | XEN-CON-SHORT-CIRCUIT-001 |
| `name_fa` | جریان اتصال کوتاه |
| `name_en` | Short Circuit Current |
| `aliases` | Fault Current, SC Current, Ik |
| `domains` | Power Systems, Protection |
| `concept_type` | Calculation |
| `definition` | The current that flows through an electrical system when two or more conductive points at different potentials make unintentional contact. Short circuit current magnitude depends on the source impedance, transformer impedance, and system configuration. It is the fundamental parameter for equipment rating and protection setting. |
| `related_standards` | IEC 60909, IEEE C37.010, IEEE 551 |
| `related_calculations` | Short Circuit Study, Fault Level Analysis |
| `related_equipment` | Circuit Breaker, Transformer, Cable, Busbar |
| `related_regulations` | Tavanir fault level requirements |
| `related_tariffs` | — |
| `relationships` | `determines` → Circuit Breaker Rating, `governed_by` → IEC 60909 |
| `status` | approved |

### 3.2 Load Flow (پخش بار)

| Field | Value |
|-------|-------|
| `concept_id` | XEN-CON-LOAD-FLOW-002 |
| `name_fa` | پخش بار |
| `name_en` | Load Flow |
| `aliases` | Power Flow, Load Flow Analysis |
| `domains` | Power Systems |
| `concept_type` | Calculation |
| `definition` | A steady-state analysis that computes voltage magnitudes and phase angles at every bus in a power network under given generation and load conditions. Load flow is the foundation for system planning, operation, and contingency analysis. |
| `related_standards` | IEC 60038, IEEE 399 |
| `related_calculations` | Voltage Profile, Power Factor Analysis |
| `related_equipment` | Transformer, Generator, Cable, Busbar |
| `related_regulations` | Grid code requirements |
| `related_tariffs` | — |
| `relationships` | `produces` → Voltage Profile, `requires` → Load Data |
| `status` | approved |

### 3.3 Voltage Drop (افت ولتاژ)

| Field | Value |
|-------|-------|
| `concept_id` | XEN-CON-VOLTAGE-DROP-003 |
| `name_fa` | افت ولتاژ |
| `name_en` | Voltage Drop |
| `aliases` | VD, Voltage Regulation |
| `domains` | Power Systems, Building Electrical, Cables |
| `concept_type` | Calculation |
| `definition` | The reduction in voltage between the sending and receiving ends of a conductor due to conductor impedance and load current. Acceptable voltage drop limits are specified by standards to ensure proper equipment operation and energy efficiency. |
| `related_standards` | IEC 60364, IEEE 141, NEC |
| `related_calculations` | Cable Sizing, Feeder Design |
| `related_equipment` | Cable, Transformer, Motor |
| `related_regulations` | Tavanir voltage quality |
| `related_tariffs` | — |
| `relationships` | `constrains` → Cable Length, `calculated_by` → Voltage Drop Formula |
| `status` | approved |

### 3.4 Protection Coordination (هماهنگی حفاظتی)

| Field | Value |
|-------|-------|
| `concept_id` | XEN-CON-PROT-COORD-004 |
| `name_fa` | هماهنگی حفاظتی |
| `name_en` | Protection Coordination |
| `aliases` | Protective Device Coordination, Relay Coordination |
| `domains` | Protection |
| `concept_type` | Calculation |
| `definition` | The systematic selection and setting of protective devices to isolate the smallest possible faulted section while maintaining supply to healthy sections. Proper coordination ensures selectivity, sensitivity, speed, and reliability of the protection system. |
| `related_standards` | IEEE 242, IEC 60909, IEEE C37.112 |
| `related_calculations` | Short Circuit Study, Time-Current Curve Analysis |
| `related_equipment` | Relay, Circuit Breaker, Fuse |
| `related_regulations` | Tavanir protection requirements |
| `related_tariffs` | — |
| `relationships` | `depends_on` → Short Circuit Current, `configures` → Relay Settings |
| `status` | approved |

### 3.5 Earthing System (سیستم ارتینگ)

| Field | Value |
|-------|-------|
| `concept_id` | XEN-CON-EARTHING-005 |
| `name_fa` | سیستم ارتینگ |
| `name_en` | Earthing System |
| `aliases` | Grounding System, Earth Electrode |
| `domains` | Grounding, Lightning, Protection |
| `concept_type` | Design |
| `definition` | A system of conductive paths and electrodes that provides a low-impedance path for fault currents to earth, ensuring safety of personnel and equipment. Earthing design considers soil resistivity, fault current magnitude, and permissible touch/step voltages. |
| `related_standards` | IEEE 80, IEC 62305, BS 7430, ISIRI |
| `related_calculations` | Earth Resistance Calculation, Step/Touch Voltage |
| `related_equipment` | Earth Electrode, Ground Grid, Surge Arrester |
| `related_regulations` | Tavanir earthing requirements, Ministry of Energy |
| `related_tariffs` | — |
| `relationships` | `governed_by` → IEEE 80, `constrains` → Substation Design |
| `status` | approved |

### 3.6 Power Quality (کیفیت توان)

| Field | Value |
|-------|-------|
| `concept_id` | XEN-CON-POWER-QUALITY-006 |
| `name_fa` | کیفیت توان |
| `name_en` | Power Quality |
| `aliases` | PQ, Power Quality |
| `domains` | Power Systems, Industrial Control |
| `concept_type` | Assessment |
| `definition` | The measure of how well the voltage, frequency, and waveform of an electrical supply conform to ideal sinusoidal characteristics. Poor power quality causes equipment malfunction, increased losses, and reduced system reliability. |
| `related_standards` | IEC 61000, IEEE 519, EN 50160 |
| `related_calculations` | Harmonic Analysis, Flicker Study |
| `related_equipment` | VSD, UPS, Generator, Transformer |
| `related_regulations` | Grid code PQ requirements |
| `related_tariffs` | — |
| `relationships` | `affected_by` → Harmonic Distortion, `monitored_by` → PQ Analyzer |
| `status` | approved |

### 3.7 Harmonic Distortion (اعوجاج هارمونیکی)

| Field | Value |
|-------|-------|
| `concept_id` | XEN-CON-HARMONICS-007 |
| `name_fa` | اعوجاج هارمونیکی |
| `name_en` | Harmonic Distortion |
| `aliases` | THD, Total Harmonic Distortion, Harmonics |
| `domains` | Power Quality, Industrial Control |
| `concept_type` | Calculation |
| `definition` | The deviation of a voltage or current waveform from the ideal sinusoidal shape due to the presence of frequency components that are integer multiples of the fundamental frequency. Harmonic distortion is caused by non-linear loads and must be limited to prevent equipment overheating and interference. |
| `related_standards` | IEEE 519, IEC 61000-2-4 |
| `related_calculations` | Harmonic Analysis, Filter Design |
| `related_equipment` | VSD, UPS, Transformer, Capacitor Bank |
| `related_regulations` | Grid code harmonic limits |
| `related_tariffs` | — |
| `relationships` | `caused_by` → Non-Linear Load, `limited_by` → IEEE 519 |
| `status` | approved |

### 3.8 Transformer Sizing (اندازه‌گذاری ترانسفورماتور)

| Field | Value |
|-------|-------|
| `concept_id` | XEN-CON-TRANSFORMER-SIZE-008 |
| `name_fa` | اندازه‌گذاری ترانسفورماتور |
| `name_en` | Transformer Sizing |
| `aliases` | Transformer Selection, Transformer Rating |
| `domains` | Power Systems, Design |
| `concept_type` | Calculation |
| `definition` | The process of selecting the appropriate transformer kVA rating based on the connected load, diversity factor, future expansion, and ambient conditions. Correct sizing ensures economical operation while meeting voltage regulation and thermal constraints. |
| `related_standards` | IEC 60076, IEEE C57.12 |
| `related_calculations` | Load Estimation, Voltage Drop |
| `related_equipment` | Transformer, Load, Cable |
| `related_regulations` | Tavanir transformer standards |
| `related_tariffs` | — |
| `relationships` | `requires` → Load Profile, `produces` → Transformer Rating |
| `status` | approved |

### 3.9 Cable Sizing (اندازه‌گذاری کابل)

| Field | Value |
|-------|-------|
| `concept_id` | XEN-CON-CABLE-SIZE-009 |
| `name_fa` | اندازه‌گذاری کابل |
| `name_en` | Cable Sizing |
| `aliases` | Cable Selection, Conductor Sizing, Cable Rating |
| `domains` | Cables, Building Electrical, Design |
| `concept_type` | Calculation |
| `definition` | The determination of the minimum conductor cross-sectional area required to safely carry the expected load current under specified installation conditions. Cable sizing considers ampacity, voltage drop, short-circuit thermal rating, and installation method. |
| `related_standards` | IEC 60364, NEC, IEEE 835, ISIRI |
| `related_calculations` | Voltage Drop, Short Circuit Thermal Rating |
| `related_equipment` | Cable, Circuit Breaker, Motor |
| `related_regulations` | Tavanir cable standards |
| `related_tariffs` | — |
| `relationships` | `depends_on` → Load Current, `constrained_by` → Voltage Drop |
| `status` | approved |

### 3.10 Demand Calculation (محاسبه دیماند)

| Field | Value |
|-------|-------|
| `concept_id` | XEN-CON-DEMAND-010 |
| `name_fa` | محاسبه دیماند |
| `name_en` | Demand Calculation |
| `aliases` | Load Estimation, Demand Analysis, Maximum Demand |
| `domains` | Power Systems, Building Electrical |
| `concept_type` | Calculation |
| `definition` | The estimation of the maximum electrical load that a system or circuit is expected to carry under normal operating conditions. Demand calculation applies diversity factors to connected loads to determine the required supply capacity. |
| `related_standards` | IEC 60364, IEEE 141, NEC |
| `related_calculations` | Transformer Sizing, Feeder Sizing |
| `related_equipment` | Transformer, Generator, Meter |
| `related_regulations` | Tavanir demand tariffs |
| `related_tariffs` | All Tavanir demand tariffs |
| `relationships` | `uses` → Diversity Factor, `produces` → Connected Load |
| `status` | approved |

### 3.11 Energy Consumption (مصرف انرژی)

| Field | Value |
|-------|-------|
| `concept_id` | XEN-CON-ENERGY-CONSUMPTION-011 |
| `name_fa` | مصرف انرژی |
| `name_en` | Energy Consumption |
| `aliases` | Energy Usage, Energy Analysis, Consumption Analysis |
| `domains` | Power Systems, Building Electrical, Renewables |
| `concept_type` | Analysis |
| `definition` | The total electrical energy used by a system, facility, or piece of equipment over a specified period. Energy consumption analysis is essential for tariff calculation, energy efficiency assessment, and demand-side management. |
| `related_standards` | ISO 50001, IEC 62053 |
| `related_calculations` | Load Profile, Cost Analysis |
| `related_equipment` | Meter, Load, Generator |
| `related_regulations` | Tavanir tariffs, Energy efficiency regulations |
| `related_tariffs` | All Tavanir tariffs |
| `relationships` | `measured_by` → Meter, `affected_by` → Load Factor |
| `status` | approved |

### 3.12 Fault Diagnosis (عیب‌یابی)

| Field | Value |
|-------|-------|
| `concept_id` | XEN-CON-FAULT-DIAG-012 |
| `name_fa` | عیب‌یابی |
| `name_en` | Fault Diagnosis |
| `aliases` | Troubleshooting, Fault Detection, Diagnostic Analysis |
| `domains` | Protection, Maintenance, Industrial Control |
| `concept_type` | Analysis |
| `definition` | The systematic process of identifying the type, location, and cause of electrical faults using measurements, relay records, and system data. Fault diagnosis enables targeted corrective action and informs preventive maintenance planning. |
| `related_standards` | IEEE C37.2, IEC 61850 |
| `related_calculations` | Protection Analysis, Event Analysis |
| `related_equipment` | Relay, Circuit Breaker, Transformer, Motor |
| `related_regulations` | — |
| `related_tariffs` | — |
| `relationships` | `uses` → Fault Signature, `produces` → Diagnosis |
| `status` | approved |

---

## 4. Concept Relationships Matrix

| Source Concept | Relationship | Target Concept |
|----------------|-------------|----------------|
| Short Circuit Current | `determines` | Circuit Breaker Rating (entity) |
| Short Circuit Current | `governed_by` | IEC 60909 (standard) |
| Short Circuit Current | `depended_by` | Protection Coordination |
| Load Flow | `produces` | Voltage Profile (entity) |
| Load Flow | `requires` | Load Data (entity) |
| Voltage Drop | `constrains` | Cable Sizing |
| Voltage Drop | `calculated_by` | Voltage Drop Formula (rule) |
| Protection Coordination | `depends_on` | Short Circuit Current |
| Protection Coordination | `configures` | Relay Settings (entity) |
| Earthing System | `governed_by` | IEEE 80 (standard) |
| Earthing System | `constrains` | Substation Design (entity) |
| Power Quality | `affected_by` | Harmonic Distortion |
| Power Quality | `monitored_by` | PQ Analyzer (entity) |
| Harmonic Distortion | `caused_by` | Non-Linear Load (entity) |
| Harmonic Distortion | `limited_by` | IEEE 519 (standard) |
| Transformer Sizing | `requires` | Demand Calculation |
| Transformer Sizing | `requires` | Load Profile (entity) |
| Transformer Sizing | `produces` | Transformer Rating (entity) |
| Cable Sizing | `depends_on` | Load Current (entity) |
| Cable Sizing | `constrained_by` | Voltage Drop |
| Demand Calculation | `uses` | Diversity Factor (entity) |
| Demand Calculation | `produces` | Connected Load (entity) |
| Demand Calculation | `feeds` | Transformer Sizing |
| Energy Consumption | `measured_by` | Meter (entity) |
| Energy Consumption | `affected_by` | Load Factor (entity) |
| Fault Diagnosis | `uses` | Fault Signature (entity) |
| Fault Diagnosis | `produces` | Diagnosis (entity) |

---

## 5. Concept Index

| ID | English Name | Persian Name | Type | Section |
|----|-------------|-------------|------|---------|
| XEN-CON-SHORT-CIRCUIT-001 | Short Circuit Current | جریان اتصال کوتاه | Calculation | §3.1 |
| XEN-CON-LOAD-FLOW-002 | Load Flow | پخش بار | Calculation | §3.2 |
| XEN-CON-VOLTAGE-DROP-003 | Voltage Drop | افت ولتاژ | Calculation | §3.3 |
| XEN-CON-PROT-COORD-004 | Protection Coordination | هماهنگی حفاظتی | Calculation | §3.4 |
| XEN-CON-EARTHING-005 | Earthing System | سیستم ارتینگ | Design | §3.5 |
| XEN-CON-POWER-QUALITY-006 | Power Quality | کیفیت توان | Assessment | §3.6 |
| XEN-CON-HARMONICS-007 | Harmonic Distortion | اعوجاج هارمونیکی | Calculation | §3.7 |
| XEN-CON-TRANSFORMER-SIZE-008 | Transformer Sizing | اندازه‌گذاری ترانسفورماتور | Calculation | §3.8 |
| XEN-CON-CABLE-SIZE-009 | Cable Sizing | اندازه‌گذاری کابل | Calculation | §3.9 |
| XEN-CON-DEMAND-010 | Demand Calculation | محاسبه دیماند | Calculation | §3.10 |
| XEN-CON-ENERGY-CONSUMPTION-011 | Energy Consumption | مصرف انرژی | Analysis | §3.11 |
| XEN-CON-FAULT-DIAG-012 | Fault Diagnosis | عیب‌یابی | Analysis | §3.12 |

---

## 6. Extension Rules

1. New canonical concepts may be added via governance amendment; ID sequence continues from the last assigned number.
2. All concept IDs must follow the pattern `XEN-CON-{SHORT-NAME}-{NNN}` with zero-padded 3-digit sequence.
3. Concepts may be deprecated (status: `archived`) but never deleted from the catalog.
4. Relationship references must correspond to types defined in engineering-relations.md.
5. Bilingual names are required; missing `name_fa` is acceptable only for non-Persian concepts.
