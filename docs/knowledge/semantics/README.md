# لایه معنایی مهندسی — Engineering Semantic Layer

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Purpose — هدف

The Semantic Layer unifies terminology across the Xennic platform by providing a **bilingual (FA/EN) lexicon, synonym resolution, and standards-aligned term mappings**. It ensures that every engineering concept, whether from international standards (IEC, IEEE) or Iranian authorities (Tavanir, ISIRI), can be referenced, retrieved, and reasoned over consistently.

**Core functions:**
- Unify terminology across all knowledge domains and source tiers
- Normalize Persian/English term pairs with canonical forms
- Map manufacturer-specific and standards-specific terms to canonical concepts
- Provide machine-readable semantic artifacts for AI services and Graph RAG

---

## Relationship to Adjacent Knowledge Domains — ارتباط با دامنه‌های مجاور

| Domain | Document | Relationship |
|--------|----------|--------------|
| **K1.1 Governance** | `governance/taxonomy.md` | Semantic terms inherit domain codes from taxonomy; every `domain` field in a term maps to a taxonomy code |
| **K1.1 Governance** | `governance/naming-conventions.md` | Term IDs, file paths, and metadata field names follow governance naming rules |
| **K1.5 Concepts** | `concepts/canonical-concepts.md` | Every semantic term references one or more canonical concepts via `related_concepts`; the semantic layer is the lexical bridge to the conceptual model |
| **K2 (future)** | Taxonomy / Knowledge Graph | Future K2 will build the knowledge graph atop this semantic layer; term nodes, synonym edges, and domain labels are the foundation for graph traversal and multi-hop reasoning |

---

## Directory Map — نقشه دایرکتوری

```
semantics/
├── README.md                       # این سند — نمای کلی لایه معنایی
├── acronym-dictionary.md           # فرهنگ مخفف‌ها — Acronym Dictionary
├── engineering-vocabulary.md       # واژگان مهندسی — فهرست کامل اصطلاحات
└── unit-normalization.md           # یکسان‌سازی واحدها — Unit Normalization
```

### Planned Files (Future)

| File | Description | Sprint |
|------|-------------|--------|
| `synonym-registry.md` | Registry of synonym groups with canonical term anchors | K2.1 |
| `bilingual-lexicon.json` | Machine-readable FA/EN lexicon for embedding pipelines | K2.1 |
| `acronym-dictionary.md` | Full acronym expansion table (FA, EN, mixed) — 80+ entries | K2.1 ✓ |
| `unit-normalization.md` | Unit conversion and normalization rules for numerical comparison | K2.1 ✓ |
| `manufacturer-term-map.md` | Mapping of manufacturer proprietary terms to canonical terms | K2.2 |
| `standards-term-map.md` | Cross-reference of IEC ↔ IEEE ↔ ISIRI ↔ Tavanir term variants | K2.2 |

---

## Key Design Principles — اصول طراحی کلیدی

| # | Principle | Description | Implementation |
|---|-----------|-------------|----------------|
| P1 | **Synonym Resolution** | One canonical term per concept; all variants (synonyms, misspellings, manufacturer names) redirect to canonical | `deprecated_terms` field on each term; equivalence edges in graph |
| P2 | **Bilingual Normalization** | Every term has both FA and EN canonical names; queries in either language resolve to the same concept | `name_fa` + `name_en` on every term; both indexed for search |
| P3 | **Standards Alignment** | Terms map to Tier 1–2 standards (IEC, IEEE, ISIRI, Tavanir) as their authoritative source | `related_standards` field with full standard ID and section reference |
| P4 | **AI Compatibility** | All semantic artifacts are machine-readable, JSON-serializable, and designed for direct consumption by embedding and RAG pipelines | Structured term format with embedding notes and graph mapping |
| P5 | **Iranian Engineering Context** | Persian-first treatment for terms where Iranian usage differs from international standards | Dedicated Iranian context section per term catalog |

---

## AI & Graph RAG Compatibility — سازگاری با هوش مصنوعی و Graph RAG

The Semantic Layer is designed as the lexical backbone for AI services and graph-based retrieval. The following rules govern how semantic artifacts integrate with the AI pipeline:

| # | Rule | Description | AI/Graph Implication |
|---|------|-------------|----------------------|
| R1 | **Graph Node Mapping** | Every term maps to a concept node in the knowledge graph | `term_id` → node URI; node label: `SemanticTerm` |
| R2 | **Synonym Equivalence Edges** | Synonyms create equivalence edges between terms and canonical concepts | Edges of type `EQUIVALENT_TO` connect deprecated/alt terms to canonical; enables synonym-aware retrieval |
| R3 | **Bilingual Lexicon for Cross-Lingual Retrieval** | FA and EN term names both indexed; queries in either language resolve to the same canonical concept | Embedding pipeline indexes both `name_fa` and `name_en`; cross-lingual retrieval via shared canonical anchor |
| R4 | **Acronym Pre-Processing** | Acronyms expand via a pre-processing layer before embedding | A separate acronym table maps short forms (e.g., "CT") to canonical terms; expansion happens before vector search |
| R5 | **Unit Normalization** | Numerical values are comparable via unit normalization rules | Unit conversion factors stored per term; embedding uses normalized values for numerical comparison |
| R6 | **Fuzzy Query Matching** | Semantic rules enable fuzzy matching for user queries | Synonym graph + phonetic matching (FA/EN) + Levenshtein distance on term names; fallback chain for unmatched queries |
| R7 | **Machine-Readable Artifacts** | All semantic artifacts must be JSON serializable | Term definitions, synonym maps, and lexicon dump to JSON for pipeline ingestion; no free-text formats |
| R8 | **Embedding Compatibility** | Canonical terms used as primary text for vector embedding | `name_en + ": " + definition` as primary embedding text; `name_fa` as secondary; `deprecated_terms` excluded from primary embedding |
| R9 | **Multilingual Search** | FA and EN terms both indexed; queries normalized to canonical form | Dual-index strategy: FA tokenizer for Persian queries, standard tokenizer for English; result merge via canonical term ID |

---

## Iranian Engineering Context — بافت مهندسی ایران

The Iranian power industry uses a distinct set of terminology that differs from international norms in several key areas. The Semantic Layer provides dedicated handling for:

| Area | Coverage | Examples |
|------|----------|----------|
| **Tavanir Terminology** | Terms defined or mandated by Tavanir (توانیر) regulations | دیماند (Demand), ضریب همزمانی (Diversity Factor), قدرت قراردادی (Contract Capacity), دیماند قرائت شده (Measured Demand), ضریب بار (Load Factor) |
| **ISIRI Standards** | Iranian national standards referenced alongside IEC/IEEE | ISIRI 1-3 (voltage levels), ISIRI 607 (cables), ISIRI 132 (earthing) |
| **Regional Distribution Company Variants** | Terminology differences between regional电力 companies (Bakhtar, Bargh-e Tehran, etc.) | Minor differences in tariff term names, voltage classification boundaries |
| **Iranian Voltage Levels** | Voltage levels specific to Iran's distribution network | 20 kV (primary distribution — differs from 11 kV / 33 kV common elsewhere), 400 V (LV), 63 kV / 132 kV / 230 kV / 400 kV (transmission) |
| **Persian Tariff Terminology** | Terms specific to Iran's electricity tariff structure | قیمت نهایی برق (Final Electricity Price), هزینه سوخت (Fuel Cost), عوارض (Levies), دیماند اشتراک (Subscription Demand), پیک‌سایی (Peak Shaving) |
| **Iranian Grid Code** | Grid connection requirements unique to Iran's network | Tavanir's protection coordination requirements, power quality limits, earhing practices |

### Approach

1. **Persian-first** for Iranian-specific terms: `name_fa` is the authoritative label when the term has no direct international equivalent.
2. **Cross-reference to IEC/IEEE** where the Iranian standard aligns: `related_standards` lists both ISIRI/Tavanir and equivalent international standard.
3. **Region tagging**: Terms may carry a `region` metadata field (`IR`, `INT`, `BOTH`) to indicate jurisdictional scope.

---

## Version History — تاریخچه نسخه

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Tir 1405 | Initial draft — directory structure, README, and engineering vocabulary |
| 1.0.0 | Tir 1405 | Added acronym-dictionary.md (80+ entries) and unit-normalization.md |

---

> For term definitions, see [`engineering-vocabulary.md`](engineering-vocabulary.md). For the conceptual model that uses these terms, see `concepts/canonical-concepts.md`.
