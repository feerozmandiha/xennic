# موجودیت‌های مهندسی — Engineering Entity Model

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Purpose

Define the canonical engineering entity architecture for Xennic. Each entity represents a real-world engineering object, concept, or actor that participates in the knowledge model. Entities are the subjects and objects of engineering relationships and are building blocks of the future Knowledge Graph.

---

## 2. Entity Architecture

Every entity has:

| Component | Type | Description |
|-----------|------|-------------|
| `entity_id` | UUID | XEN-ENT-{TYPE}-{NNNN} |
| `name` | Text | Bilingual (FA/EN) |
| `entity_type` | Enum | One of the defined types in §3 |
| `attributes` | Map | Type-specific properties |
| `relationships` | Array | Connections to other entities (defined in engineering-relations.md) |
| `metadata` | Object | Per metadata-schema.md |
| `version` | String | semver |
| `status` | Enum | Lifecycle stage |

---

## 3. Entity Catalog

### 3.1 Standard

**Description:** یک استاندارد فنی بین‌المللی یا ملی که الزامات، مشخصات یا روش‌های اجرایی را تعریف می‌کند. استانداردها به عنوان مرجع اصلی در طراحی، آزمایش و بهره‌برداری تجهیزات و سیستم‌های مهندسی به کار می‌روند. **An international or national technical standard** that defines requirements, specifications, or procedural methods.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `standard_code` | String | ✅ | Official standard designation | `IEC 60909` |
| `title` | String | ✅ | Full standard title | `Short-circuit currents in three-phase AC systems` |
| `edition_year` | Integer | ✅ | Year of publication | `2016` |
| `publishing_body` | String | ✅ | Standards organization | `IEC`, `IEEE`, `ISIRI` |
| `scope` | Text | ✅ | Applicability domain | `LV and HV systems up to 550 kV` |
| `status` | Enum | ✅ | Lifecycle state of the standard | `active`, `superseded`, `withdrawn` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Equipment | governs | The standard sets requirements for equipment |
| Standard | supersedes | This standard replaces an older edition |
| Regulation | referenced_by | A regulation adopts or cites this standard |

---

### 3.2 Regulation

**Description:** یک مقررهٔ قانونی الزام‌آور که توسط نهاد قانون‌گذار برای تضمین ایمنی، کیفیت یا بهره‌وری در صنعت برق وضع می‌شود. مقررات در حوزهٔ قضائی خود بر استانداردها اولویت دارند. **A legally binding technical regulation** issued by an authority to ensure safety, quality, or efficiency.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `regulation_code` | String | ✅ | Official regulation identifier | `Tavanir-1402-04` |
| `title` | String | ✅ | Regulation title | `ضوابط فنی طراحی پست‌های توزیع` |
| `issuing_authority` | String | ✅ | Governing body | `Tavanir`, `Ministry of Energy` |
| `jurisdiction` | String | ✅ | Geographic scope | `Iran` |
| `effective_date` | Date | ✅ | Date of enforcement | `1402-01-01` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Standard | adopts | The regulation formally adopts a standard |
| Project | applies_to | The regulation governs project execution |
| Region | enforced_in | The regulation is enforceable in a jurisdiction |

---

### 3.3 Tariff

**Description:** یک ساختار قیمت‌گذاری برق که نحوهٔ محاسبهٔ هزینهٔ انرژی مصرفی مشترکین را مشخص می‌کند. تعرفه‌ها بر اساس نوع مشترک، سطح ولتاژ و الگوی مصرف طبقه‌بندی می‌شوند. **An electricity pricing structure** that defines how energy costs are calculated for customers.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `tariff_code` | String | ✅ | Unique tariff identifier | `TAR-RES-1404` |
| `tariff_type` | Enum | ✅ | Customer category | `residential`, `commercial`, `industrial` |
| `rate_structure` | JSON | ✅ | Pricing tiers and rates | `{"base": 120, "peak": 350, "off_peak": 80}` |
| `effective_period` | Interval | ✅ | Validity period | `1404-01-01` to `1404-12-29` |
| `applicable_voltage` | Enum | ✅ | Voltage level range | `LV`, `MV`, `HV` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Customer | applies_to | This tariff is assigned to a customer |
| Regulation | defined_by | The tariff is established by a regulation |
| Energy Source | affects | The tariff influences energy cost calculations |

---

### 3.4 Equipment

**Description:** یک تجهیز Generic مهندسی برق که پایهٔ همهٔ تجهیزات تخصصی‌تر است. این موجودیت ویژگی‌های مشترک همهٔ تجهیزات مانند ولتاژ نامی، جریان نامی و انطباق با استانداردها را تعریف می‌کند. **A generic electrical equipment** base type from which all specialized equipment entities inherit.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `equipment_type` | Enum | ✅ | Category of equipment | `transformer`, `cable`, `circuit_breaker` |
| `manufacturer` | String | ✅ | Brand or producer | `Siemens`, `ABB`, `Prysmian` |
| `model` | String | ✅ | Model designation | `SIVACON 8PQ` |
| `rated_voltage` | Float | ✅ | Nominal voltage in kV | `20` |
| `rated_current` | Float | ✅ | Nominal current in A | `630` |
| `rated_frequency` | Float | ✅ | Frequency in Hz | `50` |
| `standards_compliance` | Array | Optional | Applicable standards | `["IEC 61439", "ISIRI 1234"]` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Manufacturer | manufactured_by | The equipment is produced by a manufacturer |
| Standard | complies_with | The equipment meets standard requirements |
| Parameter | has_parameter | The equipment has measurable parameters |

---

### 3.5 Manufacturer

**Description:** یک شرکت تولیدکنندهٔ تجهیزات مهندسی که کاتالوگ، دیتاشیت و خدمات پشتیبانی فنی ارائه می‌دهد. تولیدکنندگان به عنوان منبع Tier 3 در سلسله‌مراتب اعتبار منابع طبقه‌بندی می‌شوند. **An equipment manufacturing company** that produces, catalogs, and supports engineering products.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `name` | String | ✅ | Legal company name | `Siemens Energy AG` |
| `country` | String | ✅ | Country of headquarters | `Germany` |
| `industry_certifications` | Array | Optional | Quality or process certs | `["ISO 9001", "ISO 14001"]` |
| `website` | String | Optional | Corporate website | `https://www.siemens-energy.com` |
| `support_contact` | String | Optional | Technical support channel | `support@siemens-energy.com` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Equipment | produces | The manufacturer produces equipment |
| Catalog | publishes | The manufacturer publishes product catalogs |
| Datasheet | provides | The manufacturer provides technical datasheets |

---

### 3.6 Transformer

**Description:** یک ترانسفورماتور قدرت یا توزیع که انرژی الکتریکی را بین سطوح ولتاژ مختلف تبدیل می‌کند. ترانسفورماتورها از اجزای اصلی پست‌های برق و شبکه‌های انتقال و توزیع هستند. **A power or distribution transformer** that converts electrical energy between voltage levels.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `power_rating` | Float | ✅ | Rated power in kVA or MVA | `25000` (kVA) |
| `voltage_ratio` | String | ✅ | Primary/secondary voltages | `132/20` (kV) |
| `vector_group` | String | ✅ | Winding connection and phase shift | `YNd11` |
| `impedance_percentage` | Float | ✅ | Short-circuit impedance | `12.5` |
| `cooling_type` | Enum | ✅ | Cooling method | `ONAN`, `ONAF`, `OFAF`, `ODAF` |
| `tap_changer_type` | Enum | ✅ | Voltage regulation mechanism | `OLTC`, `off_circuit`, `none` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Substation | belongs_to | The transformer is installed in a substation |
| Circuit Breaker | protected_by | The transformer is protected by a breaker |
| Standard | governed_by | The transformer conforms to a standard (e.g. IEC 60076) |

---

### 3.7 Generator

**Description:** یک واحد تولید توان الکتریکی که انرژی مکانیکی را به انرژی الکتریکی تبدیل می‌کند. ژنراتورها بسته به نوع محرک اولیه (دیزل، گاز، بخار، آب، باد) در انواع مختلفی دسته‌بندی می‌شوند. **A power generation unit** that converts mechanical energy into electrical energy.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `rated_power` | Float | ✅ | Output power in MW | `100` |
| `voltage` | Float | ✅ | Terminal voltage in kV | `13.8` |
| `power_factor` | Float | ✅ | Rated power factor | `0.85` |
| `excitation_type` | Enum | ✅ | Field excitation method | `static`, `brushless`, `compound` |
| `prime_mover_type` | Enum | ✅ | Prime mover category | `diesel`, `gas`, `steam`, `hydro`, `wind` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Busbar | connected_to | The generator feeds a busbar |
| Load | supplies | The generator supplies a load |
| Grid | synchronized_with | The generator is synchronized with the grid |

---

### 3.8 Motor

**Description:** یک موتور الکتریکی که انرژی الکتریکی را به انرژی مکانیکی تبدیل می‌کند. موتورها در صنایع مختلف برای به‌حرکت‌درآوردن پمپ‌ها، فن‌ها، کمپرسورها و نقاله‌ها استفاده می‌شوند. **An electric motor** that converts electrical energy into mechanical rotational force.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `power` | Float | ✅ | Rated mechanical power in kW or HP | `250` (kW) |
| `voltage` | Float | ✅ | Supply voltage in kV | `6.6` |
| `speed` | Integer | ✅ | Synchronous speed in RPM | `1500` |
| `efficiency_class` | Enum | ✅ | IE efficiency category | `IE3` |
| `starting_method` | Enum | ✅ | Motor starting technique | `direct_on_line`, `star_delta`, `VFD` |
| `enclosure_type` | Enum | ✅ | Protection enclosure | `TEFC`, `TENV`, `SPDP`, `WPII` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Variable Speed Drive | driven_by | The motor is controlled by a VSD |
| Relay | protected_by | The motor is protected by a relay |
| Cable | fed_from | The motor is supplied via a cable |

---

### 3.9 Cable

**Description:** یک کابل قدرت یا کنترل که هدایت جریان الکتریکی بین تجهیزات را فراهم می‌کند. کابل‌ها بر اساس جنس هادی، نوع عایق، سطح ولتاژ و سطح مقطع طبقه‌بندی می‌شوند. **A power or control cable** that conducts electrical current between equipment.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `conductor_material` | Enum | ✅ | Conductor metal | `copper`, `aluminum` |
| `insulation_type` | Enum | ✅ | Insulation material | `XLPE`, `PVC`, `EPR` |
| `voltage_rating` | String | ✅ | Rated voltage U₀/U | `12/20` (kV) |
| `cross_section` | Float | ✅ | Conductor area in mm² | `240` |
| `cores` | Integer | ✅ | Number of conductors | `3` |
| `current_carrying_capacity` | Float | ✅ | Ampacity in A | `350` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Equipment | connects | The cable interconnects equipment |
| Cable Sizing | selected_by | The cable is sized by a calculation |
| Standard | governed_by | The cable complies with a standard (e.g. IEC 60364) |

---

### 3.10 Busbar

**Description:** یک سیستم شین که تجمع و توزیع جریان الکتریکی را در یک نقطه از شبکه فراهم می‌کند. شین‌ها به صورت تک‑شین، دوبل یا حلقوی پیکربندی می‌شوند. **A busbar system** that provides a common connection point for power distribution.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `rated_voltage` | Float | ✅ | Nominal voltage in kV | `20` |
| `rated_current` | Float | ✅ | Continuous current rating in A | `2000` |
| `short_circuit_withstand` | Float | ✅ | Rated short-time withstand current in kA | `40` |
| `material` | Enum | ✅ | Conductor material | `copper`, `aluminum` |
| `configuration` | Enum | ✅ | Busbar arrangement | `single`, `double`, `ring` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Switchgear | connects_to | The busbar is part of a switchgear assembly |
| Transformer | fed_by | The busbar receives power from a transformer |
| Circuit Breaker | protected_by | The busbar is protected by a breaker |

---

### 3.11 Relay

**Description:** یک رلهٔ حفاظتی که سیگنال‌های الکتریکی را اندازه‌گیری کرده و در صورت تشخیص خطا، فرمان قطع به کلید را صادر می‌کند. رله‌ها بر اساس نوع حفاظت (اضافه‌جریان، دیفرانسیل، فاصله‌یاب، خطای زمین) طبقه‌بندی می‌شوند. **A protection relay** that monitors electrical signals and issues trip commands upon fault detection.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `relay_type` | Enum | ✅ | Protection function category | `overcurrent`, `differential`, `distance`, `earth_fault` |
| `model` | String | ✅ | Manufacturer model number | `SIPROTEC 7SJ82` |
| `manufacturer` | String | ✅ | Relay manufacturer | `Siemens` |
| `communication_protocol` | Enum | ✅ | SCADA interface protocol | `IEC 61850`, `Modbus`, `DNP3` |
| `setting_ranges` | JSON | ✅ | Configurable parameter limits | `{"current_pickup": [0.1, 4.0], "time_multiplier": [0.05, 1.0]}` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Equipment | protects | The relay protects equipment |
| Protection Study | configured_by | The relay settings are determined by a study |
| SCADA | communicates_with | The relay reports to the SCADA system |

---

### 3.12 Circuit Breaker

**Description:** یک کلید قطع و وصل خودکار که جریان عادی و جریان خطا را در مدار قطع و وصل می‌کند. کلیدهای قدرت بر اساس ولتاژ، جریان، ظرفیت قطع و مکانیزم عملکرد طبقه‌بندی می‌شوند. **A circuit switching and protection device** that interrupts both normal and fault currents.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `voltage_rating` | Float | ✅ | Rated voltage in kV | `24` |
| `current_rating` | Float | ✅ | Continuous current in A | `1250` |
| `breaking_capacity` | Float | ✅ | Rated short-circuit breaking current in kA | `25` |
| `making_capacity` | Float | ✅ | Rated short-circuit making current in kA | `63` |
| `operating_mechanism` | Enum | ✅ | Mechanism type | `spring`, `hydraulic`, `pneumatic`, `magnetic` |
| `number_of_poles` | Integer | ✅ | Number of switching poles | `3` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Circuit/Feeder | protects | The breaker protects a circuit or feeder |
| Relay | coordinated_with | The breaker coordinates with a protection relay |
| Fault Level | rated_for | The breaker is rated for the system fault level |

---

### 3.13 Protection Function

**Description:** یک تابع حفاظتی انتزاعی که توسط استاندارد ANSI/IEEE C37.2 کدگذاری شده است. توابع حفاظتی مانند اضافه‌جریان (50/51)، دیفرانسیل (87) و فاصله‌یاب (21) بلوک‌های سازندهٔ سیستم‌های حفاظتی هستند. **An abstract protection function** defined by ANSI/IEEE C37.2 codes such as overcurrent (50/51), differential (87), and distance (21).

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `ansi_code` | String | ✅ | ANSI device number | `50/51` |
| `function_name` | String | ✅ | Descriptive name | `Phase overcurrent protection` |
| `input_signals` | Array | ✅ | Measured quantities | `["phase_current", "voltage"]` |
| `output_trip` | Boolean | ✅ | Whether function can trip | `true` |
| `time_characteristic` | Enum | ✅ | Time-current curve type | `definite`, `inverse`, `extremely_inverse`, `very_inverse` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Protection Scheme | implements | The function is part of a protection scheme |
| Relay | configured_in | The function resides in a relay |
| Standard | defined_by | The function is defined by IEEE C37.2 |

---

### 3.14 Calculation

**Description:** یک روش محاسباتی مهندسی که ورودی‌های مشخص را گرفته و خروجی‌های طراحی یا تحلیل را تولید می‌کند. محاسبات بر اساس استانداردها، فرمول‌ها یا شبیه‌سازی‌های نرم‌افزاری انجام می‌شوند. **An engineering calculation procedure** that transforms given inputs into design or analysis outputs.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `calculation_type` | Enum | ✅ | Type of engineering calculation | `short_circuit`, `cable_sizing`, `load_flow` |
| `input_parameters` | JSON | ✅ | Input schema | `{"voltage": "float", "impedance": "float"}` |
| `output_parameters` | JSON | ✅ | Output schema | `{"fault_current": "float", "xr_ratio": "float"}` |
| `formula_reference` | String | ✅ | Source of the formula | `IEC 60909 §4.2` |
| `software_implementation` | String | Optional | Software tool | `DIgSILENT PowerFactory`, `ETAP` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Standard | based_on | The calculation follows a standard |
| Assumption | requires | The calculation depends on assumptions |
| Result | produces | The calculation produces a result |

---

### 3.15 Fault

**Description:** یک حالت خطای الکتریکی مانند اتصال کوتاه سه‑فاز، تک‑فاز، فاز‑به‑فاز یا خطای زمین که منجر به عبور جریان اضافی از شبکه می‌شود. خطاها توسط مطالعات اتصال کوتاه تحلیل و توسط کلیدهای قدرت قطع می‌شوند. **An electrical fault condition** such as three‑phase, single‑phase, phase‑to‑phase, or earth fault.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `fault_type` | Enum | ✅ | Fault category | `three_phase`, `single_phase`, `phase_to_phase`, `earth` |
| `location` | String | ✅ | Fault position in the network | `Busbar B1, 20 kV side` |
| `duration` | Float | ✅ | Fault clearing time in seconds | `0.12` |
| `magnitude` | Float | ✅ | Fault current in kA | `16.5` |
| `impedance` | Float | Optional | Fault impedance in ohms | `0.5` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Fault Study | analyzed_by | The fault is examined in a study |
| Stress | causes | The fault produces thermal/mechanical stress |
| Circuit Breaker | cleared_by | The fault is interrupted by a breaker |

---

### 3.16 Measurement

**Description:** یک اندازه‌گیری میدانی یا مشاهده‌گر که مقدار یک پارامتر الکتریکی را در یک مکان و زمان مشخص ثبت می‌کند. اندازه‌گیری‌ها برای پایش تجهیزات، اعتبارسنجی محاسبات و تحلیل عملکرد به کار می‌روند. **A field measurement or observation** that records the value of an electrical parameter at a specific location and time.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `measured_parameter` | String | ✅ | Parameter name | `voltage`, `current`, `power`, `THD` |
| `value` | Float | ✅ | Numeric reading | `20.5` |
| `unit` | String | ✅ | Measurement unit | `kV`, `A`, `MW`, `%` |
| `location` | String | ✅ | Measurement point | `Main LV switchboard, busbar A` |
| `timestamp` | DateTime | ✅ | Recording time | `2025-06-15T14:30:00Z` |
| `measurement_device` | String | ✅ | Instrument used | `Fluke 435 II` |
| `accuracy` | String | Optional | Measurement accuracy class | `±0.5%` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Calculation | validates | The measurement confirms a calculation |
| Equipment | monitors | The measurement monitors equipment |
| Analysis | used_in | The measurement is used in analysis |

---

### 3.17 Project

**Description:** یک پروژهٔ مهندسی برق که شامل طراحی، ساخت یا بازسازی تأسیسات الکتریکی می‌شود. پروژه‌ها بر اساس نوع، کارفرما، مکان و وضعیت پیشرفت طبقه‌بندی می‌شوند. **An engineering project** encompassing design, construction, or retrofit of electrical installations.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `project_name` | String | ✅ | Project title | `Gas-insulated 132 kV substation` |
| `project_type` | Enum | ✅ | Project category | `design`, `construction`, `retrofit` |
| `client` | String | ✅ | Client organization | `Tavanir Regional Electric Co.` |
| `location` | String | ✅ | Geographic location | `Isfahan, Iran` |
| `status` | Enum | ✅ | Execution phase | `feasibility`, `design`, `tendering`, `construction`, `commissioned` |
| `timeline` | Interval | ✅ | Planned schedule | `1404-06-01` to `1405-12-30` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Substation | includes | The project contains a substation |
| Standard | uses | The project references a standard |
| Regulation | governed_by | The project must comply with a regulation |

---

### 3.18 Substation

**Description:** یک پست برق که تجهیزات اصلی مانند ترانسفورماتور، کلید، شین و رله را در خود جای می‌دهد. پست‌ها به دو نوع عایق‌گازی (GIS) و عایق‌هوایی (AIS) تقسیم می‌شوند و نقش کلیدی در انتقال و توزیع برق دارند. **An electrical substation** that houses transformers, switchgear, busbars, and protection equipment.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `substation_type` | Enum | ✅ | Insulation technology | `GIS`, `AIS` |
| `voltage_levels` | Array | ✅ | Voltage levels present | `[132, 20]` (kV) |
| `capacity` | Float | ✅ | Total installed capacity in MVA | `200` |
| `configuration` | Enum | ✅ | Busbar arrangement | `single_bus`, `double_bus`, `ring_bus`, `breaker_and_a_half` |
| `location` | String | ✅ | Site coordinates or address | `35.6892° N, 51.3890° E` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Transformer | contains | The substation contains transformers |
| Switchgear | houses | The substation houses switchgear |
| Transmission Line | connected_to | The substation connects to transmission lines |

---

### 3.19 Customer

**Description:** یک مشترک برق که انرژی الکتریکی را تحت یک تعرفهٔ مشخص مصرف می‌کند. مشترکین به سه دستهٔ خانگی، تجاری و صنعتی تقسیم می‌شوند و هر یک دارای الگوی مصرف و ظرفیت قراردادی خاص خود هستند. **An electricity customer or consumer** who uses electrical energy under a subscribed tariff.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `customer_type` | Enum | ✅ | Customer category | `residential`, `commercial`, `industrial` |
| `contracted_capacity` | Float | ✅ | Agreed power demand in kW | `500` |
| `supply_voltage` | Float | ✅ | Service voltage in kV | `20` |
| `tariff_code` | String | ✅ | Assigned tariff identifier | `TAR-IND-1404` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Tariff | subscribed_to | The customer is subscribed to a tariff |
| Energy | consumes | The customer consumes electrical energy |
| Load Profile | has | The customer exhibits a load profile |

---

### 3.20 Energy Source

**Description:** یک منبع انرژی اولیه که برای تولید برق به کار می‌رود. منابع انرژی شامل شبکهٔ سراسری، خورشید، باد، دیزل، گاز و باتری می‌شوند و هر یک دارای ظرفیت، دسترسی و ضریب انتشار خاص خود هستند. **A primary energy source** used for electricity generation.

**Attributes:**

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `source_type` | Enum | ✅ | Type of energy source | `grid`, `solar`, `wind`, `diesel`, `gas`, `battery` |
| `capacity` | Float | ✅ | Installed or contracted capacity in MW | `50` |
| `availability` | Float | ✅ | Availability factor (0.0 – 1.0) | `0.85` |
| `emission_factor` | Float | Optional | CO₂ emission factor in kg/MWh | `0.45` |

**Relationships:**

| To Entity | Relationship Type | Description |
|-----------|-------------------|-------------|
| Generator | feeds | The source feeds a generator |
| Load | supplements | The source supplements a load |
| Regulation | subject_to | The source is regulated by law |

---

## 4. Entity Inheritance

Xennic defines a simple inheritance model to reduce redundancy and enforce consistency across entity types.

| Abstract Base | Concrete Subtypes | Common Inherited Attributes |
|---------------|-------------------|----------------------------|
| **Equipment** | Transformer, Generator, Motor, Cable, Busbar | `manufacturer`, `model`, `rated_voltage`, `rated_current`, `rated_frequency`, `standards_compliance` |
| **Protection Device** | Relay, Circuit Breaker | `voltage_rating`, `current_rating`, `manufacturer`, `model`, `communication_protocol` |
| **Document** | Standard, Regulation, Tariff | `title`, `code`, `publishing_authority`, `effective_date`, `status` |

All entities inherit the following base attributes from the root **Entity** model:

| Attribute | Type | Source |
|-----------|------|--------|
| `entity_id` | UUID (XEN-ENT-{TYPE}-{NNNN}) | System-generated |
| `name` | Text (bilingual) | Defined at creation |
| `entity_type` | Enum | Immutable after creation |
| `metadata` | Object | Per metadata-schema.md |
| `version` | String (semver) | Incremented on update |
| `status` | Enum | `draft`, `active`, `deprecated`, `archived` |

Inheritance rule: A subtype MUST include all attributes of its base type plus its own type-specific attributes. Subtypes MAY override base attribute descriptions but NOT their types.

---

## 5. Graph Node Mapping

Each Xennic engineering entity maps to a Knowledge Graph node as follows:

| Entity Component | Graph Element | Mapping Rule |
|------------------|---------------|--------------|
| `entity_id` | `node_id` (URI) | `xen:ent:{entity_type}:{uuid}` |
| `entity_type` | `node_label` | CamelCase using entity type |
| `attributes` | `node_properties` | Key-value pairs, flattened |
| `relationships` | `edges` | Directed, typed, with cardinality |
| `metadata` | `node_annotations` | Attached as labeled properties |

### 5.1 Entity Serialization Format (Graph RAG)

For Graph RAG consumption, entities MUST be serialized in the following JSON-LD inspired format:

```json
{
  "@id": "xen:ent:transformer:a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "@type": "Transformer",
  "name": {
    "fa": "ترانسفورماتور 132/20 کیلوولت 25 مگاولت‌آمپر",
    "en": "132/20 kV 25 MVA Transformer"
  },
  "properties": {
    "power_rating": 25000,
    "power_rating_unit": "kVA",
    "voltage_ratio": "132/20",
    "vector_group": "YNd11",
    "impedance_percentage": 12.5,
    "cooling_type": "ONAN",
    "tap_changer_type": "OLTC"
  },
  "edges": [
    {
      "@id": "xen:rel:belongs_to",
      "direction": "outgoing",
      "target": "xen:ent:substation:b2c3d4e5-..."
    },
    {
      "@id": "xen:rel:governed_by",
      "direction": "outgoing",
      "target": "xen:ent:standard:c3d4e5f6-...",
      "properties": {
        "standard": "IEC 60076"
      }
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "status": "active",
    "created_at": "2025-06-15T10:30:00Z",
    "source_tier": 1,
    "confidence_score": 0.95
  }
}
```

### 5.2 Edge Direction Convention

| Relationship Semantics | Graph Direction |
|------------------------|-----------------|
| Physical containment | Source → Target contains Source |
| Dependency | Dependent → Dependency |
| Ownership | Owner → Possession |
| Governance | Subject → Governing Document |
| Derivation | Derived → Original |

### 5.3 Serialization Rules

1. All node identifiers MUST be valid URIs under the `xen:ent:` namespace.
2. Attribute values MUST be serialized as primitive types (string, number, boolean, array).
3. Enum values MUST be serialized as strings in the same lowercase-hyphenated form defined in attributes tables.
4. Bilingual names MUST be nested under `name.fa` and `name.en`.
5. Edges MUST include a `@id` referencing the relationship type defined in engineering-relations.md.
6. Metadata MUST include at minimum `version`, `status`, `created_at`, `source_tier`, and `confidence_score`.
7. Null or empty values MUST be omitted from the serialization output.
