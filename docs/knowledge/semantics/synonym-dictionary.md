# فرهنگ هم‌معنایی — Synonym Dictionary

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Overview

The Xennic Synonym Dictionary maps all equivalent engineering terms to a single canonical concept. Regardless of which term a user, document, or system uses, the semantic layer resolves it to the same canonical meaning. This dictionary is the foundation for search normalization, cross-lingual retrieval, and Knowledge Graph entity resolution.

---

## 1. Synonym Group Structure

Each synonym group follows this schema:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `synonym_group_id` | string | Unique identifier | `XEN-SYN-0001` |
| `canonical_term` | string (EN) | Preferred/official term from vocabulary | `Circuit Breaker` |
| `canonical_id` | string | term_id from engineering-vocabulary.md | `XEN-VOC-EQP-0012` |
| `synonyms` | array of string | Equivalent terms (EN + FA) | `["Breaker", "CB", "کلید قدرت", "کلید فیوز"]` |
| `context_rules` | string (optional) | When to use each synonym | `"Use 'CB' in single-line diagrams; use 'کلید قدرت' in Persian maintenance docs"` |
| `confidence` | float (0.0–1.0) | Mapping confidence | `0.95` |
| `domain` | string | Engineering domain | `Switchgear` |
| `graph_mapping` | object | Knowledge Graph mapping | `{ canonical_node, synonym_edges }` |

---

## 2. Synonym Groups (60+)

### 2.1 Electrical Equipment — تجهیزات برقی

| ID | Canonical | Synonyms | Context | Confidence | Domain |
|----|-----------|----------|---------|------------|--------|
| XEN-SYN-0001 | Circuit Breaker | Breaker, CB, کلید قدرت, کلید فیوز | CB preferred in SLDs | 0.98 | Switchgear |
| XEN-SYN-0002 | Transformer | Power Transformer, Distribution Transformer, ترانسفورماتور, ترانس | "ترانس" is colloquial | 0.97 | Transformer |
| XEN-SYN-0003 | Switchgear | Switchboard, Panelboard, LV Panel, MV Panel, تابلو برق, تابلو | "Switchboard" used in IEC 61439 | 0.95 | Switchgear |
| XEN-SYN-0004 | Cable | Power Cable, Conductor, کابل, سیم, هادی | "هادی" used in theoretical contexts | 0.96 | Cables |
| XEN-SYN-0005 | Busbar | Bus, Busway, باسبار, شینه, باس | "شینه" is common in Iranian maintenance | 0.95 | Switchgear |
| XEN-SYN-0006 | Relay | Protection Relay, Protective Relay, رله حفاظتی, رله | "رله" alone may refer to any type | 0.97 | Protection |
| XEN-SYN-0007 | Fuse | Fuse Link, فیوز, فیلز | "Fuse Link" for HRC types | 0.96 | Protection |
| XEN-SYN-0008 | Surge Arrester | Lightning Arrester, Surge Protector, برقگیر, صاعقه‌گیر | "Surge Protector" for LV applications | 0.95 | Protection |
| XEN-SYN-0009 | Disconnector | Isolator, Disconnect Switch, کلید قطع بار, سکسیونر | "ایزولاتور" used in overhead lines | 0.94 | Switchgear |
| XEN-SYN-0010 | Contactor | Magnetic Contactor, کنتاکتور, کلید مغناطیسی | — | 0.96 | Control |

### 2.2 Protection Terms — اصطلاحات حفاظتی

| ID | Canonical | Synonyms | Context | Confidence | Domain |
|----|-----------|----------|---------|------------|--------|
| XEN-SYN-0011 | Overcurrent | OC, Overcurrent Protection, اضافه جریان, حفاظت اضافه جریان | ANSI 50/51 | 0.98 | Protection |
| XEN-SYN-0012 | Earth Fault | Ground Fault, EF, Earth Leakage, خطای زمین, اتصال زمین | ANSI 50N/51N | 0.97 | Protection |
| XEN-SYN-0013 | Differential Protection | Diff Protection, Differential Relay, حفاظت دیفرانسیل, رله دیفرانسیل | ANSI 87 | 0.96 | Protection |
| XEN-SYN-0014 | Distance Protection | Impedance Protection, Distance Relay, حفاظت دیستانس, رله دیستانس | ANSI 21 | 0.96 | Protection |
| XEN-SYN-0015 | Short Circuit | Fault, SC, Short, اتصال کوتاه, اتصال, خطا | "Fault" is broader; "SC" for symmetrical | 0.97 | Protection |
| XEN-SYN-0016 | Trip | Open, Shutdown, فرمان قطع, تریپ, قطع | "Trip" for relays; "Open" for breakers | 0.95 | Protection |
| XEN-SYN-0017 | Close | Make, فرمان وصل, بستن, وصل | "Make" in switchgear standards | 0.94 | Protection |
| XEN-SYN-0018 | Reclose | Auto-Reclose, Auto-Reclosing, بستن مجدد, ریکلوز | ANSI 79 | 0.95 | Protection |
| XEN-SYN-0019 | Under Voltage | UV, Undervoltage, کم‌فشاری, افت ولتاژ | ANSI 27 | 0.96 | Protection |
| XEN-SYN-0020 | Over Voltage | OV, Overvoltage, اضافه ولتاژ, بیش‌فشاری | ANSI 59 | 0.96 | Protection |

### 2.3 Power System Terms — اصطلاحات سیستم قدرت

| ID | Canonical | Synonyms | Context | Confidence | Domain |
|----|-----------|----------|---------|------------|--------|
| XEN-SYN-0021 | Load Flow | Power Flow, پخش بار, مطالعات بار | "Load Flow" in industry; "Power Flow" in academia | 0.97 | Power Systems |
| XEN-SYN-0022 | Voltage Drop | VD, Voltage Regulation, افت ولتاژ, تنظیم ولتاژ | "Regulation" for generator AVR; "Drop" for cables | 0.95 | Power Systems |
| XEN-SYN-0023 | Power Factor | PF, Cos φ, ضریب قدرت, کسینوس فی | Cos φ in technical specs | 0.98 | Power Systems |
| XEN-SYN-0024 | Active Power | Real Power, P, توان اکتیو, توان حقیقی, P (kW) | P in formulas | 0.97 | Power Systems |
| XEN-SYN-0025 | Reactive Power | Q, توان راکتیو, Q (kVAr) | Q in formulas | 0.97 | Power Systems |
| XEN-SYN-0026 | Apparent Power | S, توان ظاهری, S (kVA) | S in formulas | 0.97 | Power Systems |
| XEN-SYN-0027 | Demand | Load Demand, Maximum Demand, دیماند, حداکثر دیماند | Tavanir billing context | 0.95 | Power Systems |
| XEN-SYN-0028 | Energy Consumption | Usage, Consumption, مصرف انرژی, مصرف برق | "Usage" in billing; "Consumption" in engineering | 0.96 | Power Systems |
| XEN-SYN-0029 | Harmonic | Harmonic Distortion, THD, هارمونیک, اعوجاج هارمونیکی | THD for measurement context | 0.95 | Power Quality |
| XEN-SYN-0030 | Flicker | Voltage Flicker, فلیکر, نوسان ولتاژ | — | 0.93 | Power Quality |

### 2.4 Measurements — اندازه‌گیری‌ها

| ID | Canonical | Synonyms | Context | Confidence | Domain |
|----|-----------|----------|---------|------------|--------|
| XEN-SYN-0031 | CT | Current Transformer, ترانس جریان, CT | "CT" in SLDs | 0.98 | Measurements |
| XEN-SYN-0032 | PT | VT, Voltage Transformer, Potential Transformer, ترانس ولتاژ, PT | "VT" in protection; "PT" in metering | 0.97 | Measurements |
| XEN-SYN-0033 | Meter | Energy Meter, Watt-hour Meter, کنتور, کنتور برق | "کنتور" for residential; "Meter" for industrial | 0.96 | Measurements |
| XEN-SYN-0034 | PMU | Synchrophasor, Phasor Measurement Unit, فازور, PMU | — | 0.94 | Measurements |
| XEN-SYN-0035 | Multimeter | AVO Meter, Digital Multimeter, DMM, مولتی‌متر, آوومتر | "AVO" is archaic but still used | 0.93 | Measurements |

### 2.5 Transformer Components — اجزای ترانسفورماتور

| ID | Canonical | Synonyms | Context | Confidence | Domain |
|----|-----------|----------|---------|------------|--------|
| XEN-SYN-0036 | OLTC | On-Load Tap Changer, Tap Changer, تپ چنجر, تغییردهنده ضربه تحت بار | "Tap Changer" generically includes off-load | 0.96 | Transformer |
| XEN-SYN-0037 | HV Winding | Primary Winding, سمت اولیه, سمت فشارقوی, سیم‌پیچ HV | "Primary" for step-down transformers | 0.95 | Transformer |
| XEN-SYN-0038 | LV Winding | Secondary Winding, سمت ثانویه, سمت فشارضعیف, سیم‌پیچ LV | "Secondary" for step-down transformers | 0.95 | Transformer |
| XEN-SYN-0039 | Core | Iron Core, Magnetic Core, هسته, هسته مغناطیسی | "Iron Core" traditional; "Magnetic Core" modern | 0.96 | Transformer |
| XEN-SYN-0040 | Winding | Coil, سیم‌پیچ, کویل, کلاف | "Coil" in small transformers; "Winding" in power | 0.95 | Transformer |
| XEN-SYN-0041 | Bushing | Insulator Bushing, بوشینگ, مقره عبوری | — | 0.94 | Transformer |
| XEN-SYN-0042 | Conservator | Oil Conservator, Oil Expansion Tank, منبع روغن, محافظ روغن | — | 0.94 | Transformer |

### 2.6 Tavanir / Iranian Specific — اصطالحات اختصاصی ایران

| ID | Canonical | Synonyms | Context | Confidence | Domain |
|----|-----------|----------|---------|------------|--------|
| XEN-SYN-0043 | قدرت قراردادی | Contracted Capacity, Maximum Demand (Tavanir), قدرت پیمانی | Tavanir billing – NOT "installed capacity" | 0.90 | Tariff |
| XEN-SYN-0044 | ضریب همزمانی | Coincidence Factor, Diversity Factor, ضریب همزمان | "Diversity Factor" in IEC; "Coincidence" in Tavanir | 0.88 | Power Systems |
| XEN-SYN-0045 | تعرفه | Tariff, Rate, نرخ, تعرفه برق | "Rate" in US context; "تعرفه" only for Iran | 0.95 | Tariff |
| XEN-SYN-0046 | انشعاب | Service Connection, Connection, سرویس, انشعاب برق | Tavanir service connection permit | 0.93 | Tariff |
| XEN-SYN-0047 | دیماند | Demand, Billing Demand, دیماند صورتحساب | Peak demand for billing | 0.94 | Tariff |
| XEN-SYN-0048 | پیک‌سایی | Peak Clipping, Peak Shaving, مدیریت پیک | Demand-side management | 0.90 | Power Systems |
| XEN-SYN-0049 | بار غیرخطی | Non-linear Load, Harmonic Load, بار هارمونیکی | — | 0.92 | Power Quality |
| XEN-SYN-0050 | افت توان | Line Loss, Power Loss, تلفات, تلفات توان | Transmission/distribution context | 0.93 | Power Systems |

### 2.7 Cables & Wiring — کابل و سیم‌کشی

| ID | Canonical | Synonyms | Context | Confidence | Domain |
|----|-----------|----------|---------|------------|--------|
| XEN-SYN-0051 | Armoured Cable | SWA Cable, Steel Wire Armoured, کابل زره‌دار, کابل SWA | SWA is most common term | 0.95 | Cables |
| XEN-SYN-0052 | XLPE Cable | Cross-linked Polyethylene, کابل XLPE, کابل اشعه‌ای | Cross-linked vs. XLPE | 0.96 | Cables |
| XEN-SYN-0053 | PVC Cable | PVC Insulated Cable, کابل PVC, کابل پلاستیکی | — | 0.96 | Cables |
| XEN-SYN-0054 | Conductor Cross-section | Cable Size, Cross-section, سطح مقطع, سایز کابل, mm² | "سطح مقطع" technical; "سایز" colloquial | 0.94 | Cables |
| XEN-SYN-0055 | Cable Tray | Cable Ladder, Cable Trunking, نردبان کابل, داکت کابل, ترانکینگ | "Tray" vs "Ladder" per IEC 61537 | 0.93 | Cables |

### 2.8 Earthing & Lightning — ارتینگ و صاعقه

| ID | Canonical | Synonyms | Context | Confidence | Domain |
|----|-----------|----------|---------|------------|--------|
| XEN-SYN-0056 | Earthing | Grounding, Earth Connection, ارتینگ, زمین, اتصال زمین | "Grounding" in US/IEEE; "Earthing" in IEC/UK | 0.97 | Grounding |
| XEN-SYN-0057 | Earth Electrode | Ground Rod, Earth Rod, الکترود زمین, میله ارت, چاه ارت | "چاه ارت" for Iranian practice (earth pit) | 0.95 | Grounding |
| XEN-SYN-0058 | Step Voltage | Step Potential, ولتاژ گام, پتانسیل گام | Step vs. touch voltage | 0.94 | Grounding |
| XEN-SYN-0059 | Touch Voltage | Touch Potential, ولتاژ تماس, پتانسیل تماس | — | 0.94 | Grounding |
| XEN-SYN-0060 | Lightning Protection | LPS, Lightning Conductor, حفاظت در برابر صاعقه, برقگیر, سیستم حفاظت صاعقه | "LPS" IEC 62305 terminology | 0.96 | Lightning |

### 2.9 Renewable Energy — انرژی تجدیدپذیر

| ID | Canonical | Synonyms | Context | Confidence | Domain |
|----|-----------|----------|---------|------------|--------|
| XEN-SYN-0061 | Solar Panel | PV Panel, Solar Module, Photovoltaic Panel, پنل خورشیدی, پنل فتوولتائیک | "PV Module" in technical specs | 0.97 | Renewable |
| XEN-SYN-0062 | Inverter | Solar Inverter, PV Inverter, اینورتر, مبدل | "اینورتر" general; specific context needed | 0.96 | Renewable |
| XEN-SYN-0063 | Net Metering | Net Energy Metering, Bi-directional Metering, صادرات-واردات, کنتور دوطرفه | Called "صادرات-وimportات" by Tavanir | 0.95 | Renewable |
| XEN-SYN-0064 | Battery Storage | BESS, Energy Storage System, ذخیره‌ساز باتری, سامانه ذخیره انرژی, BESS | — | 0.95 | Renewable |

### 2.10 Industrial Control — کنترل صنعتی

| ID | Canonical | Synonyms | Context | Confidence | Domain |
|----|-----------|----------|---------|------------|--------|
| XEN-SYN-0065 | PLC | Programmable Logic Controller, پی‌ال‌سی, کنترل‌کننده منطقی قابل برنامه‌ریزی | "PLC" standard abbreviation | 0.98 | Control |
| XEN-SYN-0066 | SCADA | Supervisory Control And Data Acquisition, اسکادا, کنترل نظارتی | — | 0.97 | Control |
| XEN-SYN-0067 | HMI | Human Machine Interface, اچ‌ام‌آی, رابط انسان و ماشین | — | 0.96 | Control |
| XEN-SYN-0068 | VFD | Variable Frequency Drive, VSD, Adjustable Speed Drive, درایو فرکانس متغیر, VSD | "VFD" common in US; "VSD" in IEC | 0.95 | Control |

---

## 3. Iranian Engineering Synonyms — هم‌معناهای مهندسی ایران

This section documents terms where Iranian engineering usage differs from international standards or where region-specific mappings are required.

### 3.1 Voltage Level Differences

| International Term | International Value | Iranian Equivalent | Notes |
|--------------------|--------------------|--------------------|-------|
| Primary Distribution | 11 kV or 33 kV (IEC) | 20 kV | 20 kV is the standard primary distribution voltage in Iran |
| Secondary Distribution | 400 V (IEC) | 400 V | 3-phase 400 V is consistent with IEC, but domestic single-phase is 230 V |
| Extra High Voltage | 400 kV (IEC) | 400 kV | Consistent with IEC |
| Transmission | 230 kV (some regions) | 230 kV & 132 kV | Iran uses both 230 kV and 132 kV (legacy) |
| Sub-transmission | 66 kV or 132 kV | 63 kV | Iran uses 63 kV (unique to Iran/region) |

### 3.2 Tavanir-Specific Terminology

| Iranian Term | International False Friend | Correct Mapping | Reason |
|-------------|---------------------------|-----------------|--------|
| قدرت قراردادی | Installed Capacity (نصب) | Contracted Capacity | Tavanir bills based on contracted kW, not installed |
| ضریب همزمانی | Coincidence Factor (US) | Diversity Factor (IEC) | Used inversely in Iran per Tavanir regulations |
| دیماند | Demand (generic) | Billing Demand / Maximum Demand | Tavanir-defined peak average over 30-min interval |
| انشعاب | Connection (generic) | Service Connection (permit + fee) | Legal permission to connect, not the physical tap |
| پیک‌سایی | Peak Shaving | Demand Response / Load Management | Tavanir DSM program name |
| تعرفه تشویقی | Incentive Tariff | Feed-in Premium | Specific to Tavanir renewable buy-back program |
| عوارض برق | Electricity Tax | Electricity Surcharge / Levy | Not a tax per se but a regulatory charge |

### 3.3 Regional Variations — تفاوت‌های منطقه‌ای

| Region | Term Variation | Standard Term | Notes |
|--------|---------------|---------------|-------|
| تهران | ترانس | ترانسفورماتور | Colloquial shortening common in Tehran area |
| اصفهان | کابل هوایی | هادی هوایی / خط هوایی | Regional preference for overhead conductor |
| خوزستان | کابل خودنگهدار | کابل سش (Self-supporting) | Common in humid regions |
| خراسان | دیزل ژنراتور | ژنراتور برق | Regional term for emergency generator |
| شمال | چاه ارت | الکترود زمین | "Earth pit" construction method differs |

### 3.4 Equipment Naming Variations — تفاوت‌های نام‌گذاری تجهیزات

| Equipment | International | Iran Common | Notes |
|-----------|---------------|-------------|-------|
| MV Circuit Breaker | MV CB / VCB | کلید قدرت ۲۰ کیلوولت | Voltage specified first |
| Disconnect Switch | Disconnector | سکسیونر | French loanword (sectionneur) |
| Ring Main Unit | RMU | آرام‌یو / رینگ اصلی | Acronym pronounced as word |
| Capacitor Bank | Capacitor Bank | خازن‌کمپان / بانک خازنی | Mixed Persian-English |
| Power Transformer | Power Transformer | ترانس قدرت | Often specified as "ترانس ۲۰ کیلوولت" |
| Earthing Transformer | Earthing Transformer | ترانس ارت / ترانس زاویه | "Zigzag transformer" colloquially |

---

## 4. Synonym → Graph Mapping

Each synonym group maps to a cluster of nodes in the Xennic Knowledge Graph with typed edges.

### 4.1 Node Structure

```
Canonical Node:   [term_id]  ── type: Concept
Synonym Node:     [synonym]  ── type: SynonymExpression
```

### 4.2 Edge Types

| Edge | From | To | Property |
|------|------|----|----------|
| `SYNONYM_OF` | SynonymExpression | Concept | `{ confidence: 0.95, region: null, context: null }` |
| `EQUIVALENT_TO` | Concept | Concept | `{ bidirectional: true, confidence: 1.0 }` |

### 4.3 Mapping Table

| Synonym Group | Canonical Node | Synonym Nodes | Edge Details |
|---------------|---------------|---------------|--------------|
| XEN-SYN-0001 | `Circuit_Breaker` | `Breaker`, `CB`, `کلید_قدرت`, `کلید_فیوز` | `SYNONYM_OF` with conf 0.95; FA nodes tagged `[lang:fa]` |
| XEN-SYN-0002 | `Transformer` | `Power_Transformer`, `Distribution_Transformer`, `ترانسفورماتور`, `ترانس` | `SYNONYM_OF`; `ترانس` has conf 0.90 (colloquial) |
| XEN-SYN-0003 | `Switchgear` | `Switchboard`, `Panelboard`, `تابلو_برق`, `تابلو` | Regional edge: `{region: "Iran", confidence: 0.93}` |
| XEN-SYN-0005 | `Busbar` | `Bus`, `Busway`, `باسبار`, `شینه`, `باس` | `شینه` edge: `{region: "Iran", domain: "maintenance"}` |
| XEN-SYN-0043 | `Contracted_Capacity` | `قدرت_قراردادی`, `قدرت_پیمانی`, `Maximum_Demand` | `{context: "Tavanir billing", confidence: 0.90}` |
| XEN-SYN-0044 | `Coincidence_Factor` | `ضریب_همزمانی`, `Diversity_Factor` | `{context: "IEC vs Tavanir", note: "inverse relationship"}` |

### 4.4 Edge Properties Schema

```yaml
SYNONYM_OF:
  confidence: float          # 0.0–1.0
  region: string | null      # "Iran", "IEC", null
  context: string | null      # "billing", "maintenance", "standard"
  direction: string          # "fa→en", "en→fa", "bidirectional"
  source: string             # "synonym-dictionary-v1.0.0"

EQUIVALENT_TO:
  bidirectional: bool        # always true
  confidence: float          # always 1.0
  source: string             # "synonym-dictionary-v1.0.0"
```

### 4.5 Graph Integration Notes

1. Synonym groups with `confidence < 0.85` are flagged for manual review at ingestion time.
2. Edges from FA synonyms carry a `lang:fa` property to enable language-filtered traversal.
3. During query, user input is matched against all synonym nodes, then resolved to the canonical node via the shortest `SYNONYM_OF` path.
4. When two canonical nodes share a synonym (ambiguous), the resolution uses domain context from the query to disambiguate.

---

## 5. Maintenance & Evolution

| Action | Trigger | Process |
|--------|---------|---------|
| Add synonym | New term discovered in ingestion pipeline | Submit to semantic layer → review → assign new XEN-SYN-ID |
| Adjust confidence | Model retraining or manual audit | Update confidence field, increment MINOR version |
| Deprecate group | Term obsolete | Set `status: deprecated`, keep for historical queries |
| Merge groups | Overlapping synonym sets | Retain lower ID as canonical, redirect higher ID |

New entries are added monthly. Entries that have not been accessed in 24 months are moved to a cold storage tier.
