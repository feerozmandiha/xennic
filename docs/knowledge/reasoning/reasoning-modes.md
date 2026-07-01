# حالت‌های استدلال — Reasoning Modes

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Overview — نمای کلی

This document defines all supported reasoning modes for the Xennic Engineering Reasoning Runtime (K2.5). Each mode is a formal strategy for transforming evidence into conclusions. The appropriate mode is selected by the Reasoning Orchestrator based on query characteristics and domain context.

This specification builds upon the reasoning framework defined in K1.1 (Engineering Reasoning Framework) and provides the operational details required for runtime mode selection.

---

## Mode Catalog — فهرست حالت‌ها

### 1. Deductive Reasoning — استدلال قیاسی

| مشخصه | توضیح |
|-------|-------|
| **هدف** | Apply general rules to specific cases |
| **نقاط قوت** | High confidence (base: 0.95), deterministic, fully auditable |
| **نقاط ضعف** | Requires complete rules, no creativity, no handling of novel situations |
| **موارد استفاده** | Standards compliance, code application, formula calculation, regulation checking |
| **تأثیر بر اطمینان** | ±0.05 based on rule completeness and source tier |
| **محرک انتخاب** | Query contains explicit standard / code / regulation reference |

**مثال ماشه:**

| عبارت در Query | حالت استدلال |
|----------------|-------------|
| "According to IEC 60909..." | Deductive |
| "Per NEC Article 250..." | Deductive |
| "As per IEEE 519..." | Deductive |

---

### 2. Inductive Reasoning — استدلال استقرایی

| مشخصه | توضیح |
|-------|-------|
| **هدف** | Generalize patterns from specific observations |
| **نقاط قوت** | Pattern discovery, handles new situations, learns from operational data |
| **نقاط ضعف** | Lower confidence (base: 0.75), requires sufficient sample size, correlation ≠ causation |
| **موارد استفاده** | Fault diagnosis, load profiling, trend analysis, failure pattern recognition |
| **تأثیر بر اطمینان** | ±0.10 based on sample size and statistical significance |
| **محرک انتخاب** | Multiple similar cases or observations available in knowledge base |

**تعداد نمونه‌های مورد نیاز:**

| تعداد نمونه | تصحیح اطمینان | وضعیت |
|-------------|---------------|-------|
| 1–2 | −0.10 | Insufficient — flag user |
| 3–5 | −0.05 | Minimum acceptable |
| 6–10 | ±0.00 | Adequate |
| 11–20 | +0.05 | Good |
| 20+ | +0.10 | Strong |

---

### 3. Abductive Reasoning — استدلال فرضیه‌ساز

| مشخصه | توضیح |
|-------|-------|
| **هدف** | Find the best explanation for observed symptoms |
| **نقاط قوت** | Diagnostic capability, handles incomplete data, generates testable hypotheses |
| **نقاط ضعف** | Speculative (base: 0.65), multiple possible explanations, no guarantee of correctness |
| **موارد استفاده** | Troubleshooting, root cause analysis, fault diagnosis, anomaly investigation |
| **تأثیر بر اطمینان** | ±0.15 based on explanation uniqueness and evidence coverage |
| **محرک انتخاب** | Problem description with symptoms, no direct rule match |

**تعداد فرضیه‌های ممکن:**

| فرضیه‌ها | تصحیح اطمینان | توضیح |
|----------|---------------|-------|
| 1 unique explanation | +0.15 | Very strong indicator |
| 2–3 explanations | +0.05 | Multiple plausible paths |
| 4+ explanations | −0.10 | Too many possibilities, low confidence |

---

### 4. Case-Based Reasoning — استدلال مبتنی بر مورد

| مشخصه | توضیح |
|-------|-------|
| **هدف** | Apply past solutions to new problems with adaptation |
| **نقاط قوت** | Practical, experience-based, high user acceptance, domain-relevant |
| **نقاط ضعف** | Requires similar cases in knowledge base (base: 0.70), adaptation may introduce error |
| **موارد استفاده** | Equipment selection, design assistance, similar project references, parameter estimation |
| **تأثیر بر اطمینان** | ±0.10 based on case similarity score (cosine / structural) |
| **محرک انتخاب** | Query explicitly references past projects or matches historical cases |

**درجه شباهت مورد:**

| شباهت | تصحیح اطمینان | وضعیت |
|-------|---------------|-------|
| 0.90–1.00 | +0.10 | Almost identical |
| 0.75–0.89 | +0.05 | High similarity |
| 0.60–0.74 | ±0.00 | Moderate — use with caution |
| 0.40–0.59 | −0.05 | Low — adaptation risky |
| < 0.40 | −0.10 | Insufficient — fallback to another mode |

---

### 5. Rule-Based Reasoning — استدلال مبتنی بر قاعده

| مشخصه | توضیح |
|-------|-------|
| **هدف** | Apply explicit IF-THEN rules from engineering standards and design guides |
| **نقاط قوت** | Deterministic, fully auditable, easy to validate (base: 0.90) |
| **نقاط ضعف** | Brittle outside rule scope, no learning capability, requires complete rule set |
| **موارد استفاده** | Protection setting rules, design rules, safety interlock rules, configuration validation |
| **تأثیر بر اطمینان** | ±0.05 based on rule source tier |
| **محرک انتخاب** | Query condition matches an existing rule antecedent |

**منبع قاعده و تأثیر آن:**

| تایر منبع | تصحیح اطمینان | مثال |
|-----------|---------------|------|
| Tier 1 (Standard) | +0.05 | IEC, IEEE, NEC, ISIRI |
| Tier 2 (Industry Guide) | +0.00 | IEEE Color Books, CIGRÉ |
| Tier 3 (Manufacturer) | −0.05 | Schneider, Siemens design guides |
| Tier 4 (Internal) | −0.10 | Company design practice documents |
| Tier 5 (Unverified) | −0.15 | Unreviewed external sources |

---

### 6. Constraint-Based Reasoning — استدلال مبتنی بر قیود

| مشخصه | توضیح |
|-------|-------|
| **هدف** | Find feasible solutions within defined constraints |
| **نقاط قوت** | Handles trade-offs, finds feasible region, systematic exploration (base: 0.80) |
| **نقاط ضعف** | No optimality guarantee, may find no solution, computationally expensive for large spaces |
| **موارد استفاده** | Design space exploration, equipment matching, feasibility studies, cable sizing within limits |
| **تأثیر بر اطمینان** | ±0.10 based on constraint completeness and coverage |
| **محرک انتخاب** | Query specifies design parameters with upper / lower bounds or limits |

**پوشش قیود:**

| پوشش | تصحیح اطمینان | وضعیت |
|------|---------------|-------|
| All constraints defined | +0.10 | Complete specification |
| Major constraints defined | +0.05 | Sufficient for feasible region |
| Partial constraints | ±0.00 | Solution may not be practical |
| Missing critical constraints | −0.10 | Result may violate unstated limits |

---

### 7. Hybrid Reasoning — استدلال ترکیبی

| مشخصه | توضیح |
|-------|-------|
| **هدف** | Combine multiple reasoning modes for complex, multi-domain queries |
| **نقاط قوت** | Best coverage for complex engineering problems, leverages strengths of each mode |
| **نقاط ضعف** | Complex traceability, harder to validate, increased latency |
| **موارد استفاده** | Complete engineering design, protection coordination, system studies, multi-domain analysis |
| **اطمینان** | Weighted average of component modes based on contribution share |
| **محرک انتخاب** | Query spans multiple domains or contains multiple distinct sub-questions |

**ترکیب اطمینان در حالت Hybrid:**

| مؤلفه | وزن پیش‌فرض |
|-------|------------|
| Deductive contribution | 30% |
| Rule-Based contribution | 25% |
| Constraint-Based contribution | 20% |
| Case-Based contribution | 15% |
| Inductive contribution | 10% |
| Abductive contribution | 0% (not used unless only mode available) |

---

## Mode Selection Algorithm — الگوریتم انتخاب حالت

The Reasoning Orchestrator selects the appropriate reasoning mode using the following algorithm:

### Step 1: Query Analysis — تحلیل Query

Analyze the user query for the following signals:

| سیگنال | مثال |
|--------|------|
| **Standard reference** | "IEC 60909", "IEEE 519", "NEC 250" |
| **Case reference** | "Similar to project X", "Like previous design" |
| **Constraint expression** | "Within limits", "between X and Y", "maximum", "minimum" |
| **Formula requirement** | "Calculate", "compute", "determine" |
| **Symptom description** | "Failed", "tripped", "overheated", "why" |
| **Domain** | "Protection", "cable sizing", "transformer", "motor" |

### Step 2: Mode Scoring — امتیازدهی حالت

Score each mode on applicability (0.0–1.0):

| حالت | شروط امتیازدهی |
|------|----------------|
| **Deductive** | 1.0 if standard reference found; 0.3 if domain requires standard compliance |
| **Inductive** | 1.0 if ≥ 3 similar observations; 0.5 if 1–2 observations |
| **Abductive** | 1.0 if symptoms present without rule match; 0.4 if partial symptom match |
| **Case-Based** | 1.0 if explicit case reference; 0.6 if similarity score > 0.6 |
| **Rule-Based** | 1.0 if rule antecedent matches; 0.3 if domain has known rule set |
| **Constraint-Based** | 1.0 if bounds / limits specified; 0.5 if implicit bounds exist |

### Step 3: Decision — تصمیم‌گیری

| شرط | انتخاب |
|-----|--------|
| Highest score > 0.7 AND second highest ≤ 0.7 | Single mode (highest score) |
| Two or more modes score > 0.7 | Hybrid Reasoning |
| No mode scores > 0.5 | Fallback: Direct Retrieval (no reasoning, present EKO content as-is) |
| All modes score 0.0 | Human Escalation |

---

## Mode Decision Table — جدول تصمیم‌گیری حالت

| مشخصه Query | حالت پیشنهادی | اطمینان پایه |
|-------------|---------------|-------------|
| "According to IEC 60909 short-circuit calculation..." | Deductive | 0.95 |
| "Three identical motors failed within a month..." | Inductive | 0.75 |
| "Why did the 22kV breaker trip during startup?" | Abductive | 0.65 |
| "Similar to project Khorshid phase 2 substation..." | Case-Based | 0.70 |
| "IF transformer load exceeds 80% THEN activate alarm..." | Rule-Based | 0.90 |
| "Find a cable that carries 250A within 3% voltage drop..." | Constraint-Based | 0.80 |
| "Design the protection system for a 132/20kV substation..." | Hybrid | 0.85 |
| "What is the maximum demand for a residential complex?" | Deductive | 0.95 |
| "Analyze harmonics from VFD drives in water pumping..." | Inductive | 0.75 |
| "Diagnose repeated nuisance tripping of MCCB..." | Abductive | 0.65 |
| "Recommend transformer for 5MW solar farm expansion..." | Case-Based | 0.70 |
| "Verify busbar clearance per IEC 62271-1..." | Deductive | 0.95 |
| "Select cable gland type for Zone 1 hazardous area..." | Rule-Based | 0.90 |
| "Is a 2500A busway sufficient for this load profile?" | Constraint-Based | 0.80 |
| "Complete electrical design for new 10MW cogeneration plant..." | Hybrid | 0.85 |

---

## Fallback: Direct Retrieval — بازگشت به بازیابی مستقیم

When no reasoning mode scores above 0.5, the system falls back to Direct Retrieval:

| مشخصه | توضیح |
|-------|-------|
| **ورودی** | User query |
| **فرآیند** | Retrieve top EKOs from Knowledge API, present without transformation |
| **خروجی** | Ranked list of EKOs with relevance scores — no reasoning chain |
| **اعلام به کاربر** | "No specific reasoning mode applies. Retrieved knowledge objects are shown for your review." |
| **اطمینان** | Not calculated — retrieval relevance score displayed instead |

---

## Cross-Mode Conflict Resolution — رفع تعارض بین‌حالتی

When Hybrid Reasoning produces conflicting intermediate conclusions from different modes:

| تعارض | راهکار |
|-------|--------|
| Deductive vs Rule-Based | Both deterministic — merge if compatible; flag if contradictory |
| Deductive vs Inductive | Deductive takes priority (higher base confidence) |
| Abductive vs Inductive | Inductive takes priority (evidence-based vs hypothesis-based) |
| Case-Based vs Constraint-Based | Constraint-Based takes priority (mathematical guarantee) |
| Any vs Human Escalation | Human decision overrides all modes |
