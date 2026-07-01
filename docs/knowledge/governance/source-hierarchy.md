# سلسله‌مراتب اعتبار منابع — Source Trust Hierarchy

**Version:** 1.0.0 | **Status:** Published | **Last Updated:** Tir 1405

---

## 1. Tier Definitions

| Tier | Category | FA | Examples | Trust Level | Citation Required | Human Review |
|------|----------|----|----------|-------------|-------------------|--------------|
| 1 | International Standards | استانداردهای بین‌المللی | IEC, IEEE, ISO, ANSI, NEMA | Maximum | Always | Always |
| 2 | National Regulations | مقررات ملی | ISIRI, Tavanir, Ministry of Energy, SATBA | High | Always | Always |
| 3 | Manufacturer Documentation | مستندات سازنده | Siemens, ABB, Schneider, GE, Eaton, Prysmian | Medium | Always | Conditional |
| 4 | Peer Reviewed Papers | مقالات علمی | IEEE journals, IET, Elsevier, Springer | Moderate | Always | Conditional |
| 5 | Community Knowledge | دانش عمومی | Forums (Eng-Tips, Reddit), technical blogs, wikis, LinkedIn articles | Low | Recommended | Always |

---

## 2. Detailed Tier Descriptions

### Tier 1 — International Standards

These are normative documents developed by internationally recognized standards organizations through consensus processes. They carry maximum authority in the Xennic knowledge system.

**Characteristics:**
- Developed by formal technical committees with balanced representation
- Subject to public review and ballot processes
- Regularly revised and maintained
- Legally referenced in many national regulations

**Examples:**
- IEC 60038 (Standard Voltages)
- IEC 60909 (Short-circuit currents)
- IEEE 80 (Guide for Safety in AC Substation Grounding)
- IEC 62305 (Protection against lightning)
- ISO 9001 (Quality management)

### Tier 2 — National Regulations

Legally binding or officially adopted technical regulations issued by national authorities. These take precedence within their jurisdiction.

**Characteristics:**
- Have legal or regulatory force within the issuing country
- Often adopt or adapt international standards
- Published by government ministries or national standards bodies

**Examples:**
- ISIRI 1234 (Iranian national standard)
- Tavanir technical regulations (شرایط فنی توزیع برق)
- Ministry of Energy electrical installation codes
- SATBA renewable energy regulations

### Tier 3 — Manufacturer Documentation

Technical documentation produced by equipment manufacturers. Authority is limited to the specific products described.

**Characteristics:**
- Highly specific to particular products or product lines
- Contains verified test data and performance curves
- May include application guidance and selection criteria
- Commercial bias is possible

**Examples:**
- Siemens SIVACON switchgear catalog
- ABB VD4 circuit breaker datasheet
- Schneider Electric LV switchboard manual
- Prysmian cable selection guide

### Tier 4 — Peer Reviewed Papers

Academic publications that have undergone peer review. Moderate authority due to methodological rigor.

**Characteristics:**
- Subject to academic peer review
- Present novel methods, analyses, or case studies
- May contain preliminary or unvalidated findings
- Not normative; represent the state of research

**Examples:**
- IEEE Transactions on Power Delivery articles
- CIGRE technical brochures and session papers
- IET Generation, Transmission & Distribution
- International conferences (ICPS, ICECCE)

### Tier 5 — Community Knowledge

Unofficial content from engineering communities, forums, and informal publications. Lowest authority in the hierarchy.

**Characteristics:**
- Not formally reviewed or validated
- May contain errors, outdated practices, or opinions
- Useful for practical tips, troubleshooting, and peer experience
- Must be independently verified before use in engineering decisions

**Examples:**
- Eng-Tips forums
- Reddit r/ElectricalEngineering
- LinkedIn technical articles
- Personal engineering blogs

---

## 3. Authority Rules

### Rule 1: Lowest-Tier Preference

> AI MUST cite a Tier N source only when no Tier N-1 source exists on the same topic.

**Example:** When answering about short-circuit calculation methodology, IEC 60909 (Tier 1) MUST be cited before any manufacturer guide (Tier 3) or forum post (Tier 5).

### Rule 2: Conflict Resolution

> When sources provide conflicting information, the highest-tier source prevails. Tier 1 overrides all others; Tier 2 overrides Tiers 3-5.

**Example:** If a manufacturer datasheet (Tier 3) suggests a cable ampacity rating that differs from IEC 60364 (Tier 1), the IEC value is authoritative.

### Rule 3: Missing Source Declaration

> If no authoritative source exists for a given topic, AI MUST explicitly state: "No authoritative source found for [topic]".

**Example:** "No authoritative source found for lightning risk assessment in 400 Hz aircraft power systems. The following is based on general engineering principles (Tier 5)."

### Rule 4: Source Chaining

> When document A cites standard B, the provenance chain is A → B. The trust level of any claim derived from A is `min(A.tier, B.tier)`.

**Example:** A manufacturer's application guide (Tier 3) that cites IEC 60909 (Tier 1) for fault current calculations inherits a trust level of `min(3, 1) = 1` for those specific calculations.

### Rule 5: Jurisdictional Override

> Within Iran, Tier 2 (national) regulations override Tier 1 (international) standards on matters where national deviation is permitted or mandated.

**Example:** For earthing practices in Iran, Tavanir regulations (Tier 2) take precedence over IEEE 80 (Tier 1) where the two differ.

### Rule 6: Temporal Validity

> A source is considered valid only if its latest edition or revision date is within the acceptable currency window. If superseded, the new version automatically takes precedence.

| Tier | Currency Window | Action if Expired |
|------|-----------------|-------------------|
| 1 | 10 years from publication | Flag for review; prefer newer edition if available |
| 2 | 5 years from publication | Flag for review; check for replacement regulation |
| 3 | 5 years from publication | Flag for review; check for updated catalog |
| 4 | 15 years from publication | Flag for historical context only |
| 5 | 2 years from publication | Treat as potentially outdated |

**Example:** A 1998 edition of IEEE 80 is superseded by the 2000 edition (and later the 2013 edition). The AI MUST cite the 2013 edition, not the 1998 edition.

---

## 4. Examples of Tier Application

### Example 1: Transformer Protection Setting

```
Query: What is the recommended differential protection setting for a 20/0.4 kV transformer?

Response:
According to IEC 60076 (Tier 1) and IEEE C37.91 (Tier 1),
the recommended differential pickup setting is 0.2–0.4 pu.
[Citation: IEC 60076-1:2021 §7.3, IEEE C37.91-2021 §4.2]

Manufacturer application notes from Siemens (Tier 3) suggest
0.25–0.35 pu, which falls within this range.
[Citation: Siemens SIPROTEC 5 Manual v7.3 §3.1.2]
```

### Example 2: Conflicting Data

```
Query: What is the maximum allowable touch voltage for a 132 kV substation?

Tier 1 (IEEE 80-2013):  V_touch_max = (1000 + 1.5 × ρ_s × C_s) / √t_s
Tier 2 (Tavanir):        V_touch_max = 520 V (fixed value for HV)

Resolution: Within Iran, the Tavanir regulation (Tier 2) overrides
IEEE 80 (Tier 1) per jurisdictional override (Rule 5).
Max touch voltage = 520 V.
[Citation: Tavanir technical regulation §4.3.2]
```

### Example 3: Missing Source

```
Query: What is the optimal cable tray fill ratio for cables with
armor in explosive environments?

Response:
No authoritative source found for cable tray fill ratio in
explosive environments with armored cables.

General guidance (Tier 5) from engineering forums suggests 40–50% fill,
but this has not been verified against a Tier 1-2 source.

The closest applicable standard is IEC 60079-14 (Tier 1), which
covers explosive atmospheres but does not specify fill ratios.
```
