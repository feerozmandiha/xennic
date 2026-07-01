# قوانین معنایی — Semantic Rules

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Purpose

Define the formal rules for term matching, alias resolution, fuzzy matching, and concept resolution across the Xennic knowledge base. These rules power the semantic layer's core engine.

---

## 1. Term Matching Rules (قوانین تطابق اصطلاحات)

The hierarchy of matching strategies applied in order from highest priority to fallback.

### Rule 1: Exact Match — تطابق دقیق

| Property | Value |
|----------|-------|
| Match confidence | 1.0 |
| Behaviour | Input exactly equals canonical term (case-insensitive for EN, normalized for FA) |
| Priority | Applied first for speed |

FA normalization removes diacritics, normalizes alef variants (آ ا أ إ → ا), normalizes ye (ی ي → ی), and normalizes he (ه ة → ه).

### Rule 2: Acronym Match — تطابق مخفف

| Property | Value |
|----------|-------|
| Match confidence | 0.95 |
| Behaviour | Input is an acronym → resolve to full form via acronym-dictionary.md |
| Note | Acronyms checked case-insensitively; multiple matches disambiguated by domain context |

### Rule 3: Synonym Match — تطابق هم‌معنایی

| Property | Value |
|----------|-------|
| Match confidence | 0.90 |
| Behaviour | Input matches a synonym → resolve to canonical term via synonym-dictionary.md |
| Direction | Bi-directional (EN→FA and FA→EN synonyms supported) |

### Rule 4: Stemmed Match — تطابق ریشه

| Property | Value |
|----------|-------|
| Match confidence | 0.85 |
| Behaviour | Input after stemming matches canonical or synonym |
| EN stemming | Porter or Snowball stemmer |
| FA stemming | Persian-specific stemmer (remove plural ی, ان, ها; verb suffixes) |

### Rule 5: Fuzzy Match — تطابق تقریبی

| Property | Value |
|----------|-------|
| Match confidence | 0.60–0.80 (proportional to edit distance) |
| Levenshtein distance | ≤ 2 for short terms (< 8 chars), ≤ 3 for longer terms |
| Persian fuzzy matching | Normalized Levenshtein (normalize characters first) |
| Token-level fuzzy | If input has multiple tokens, try matching each token individually |

### Rule 6: Embedding Similarity Match — تطابق برداری

| Property | Value |
|----------|-------|
| Match confidence | cosine_similarity × 0.9 |
| Behaviour | Fallback: if all above fail, compute embedding similarity with canonical terms |
| Threshold | Minimum cosine similarity 0.7 for match |
| Scope | Applied to both EN and FA embeddings |

---

## 2. Alias Resolution (تفکیک نام‌های مستعار)

| Property | Rule |
|----------|------|
| Cardinality | Every alias resolves to exactly one canonical term |
| Determinism | Alias resolution is deterministic (no ML involved) |
| Storage | Alias table is stored as a flat key-value map for O(1) lookup |

### Examples

| Alias | Resolves To |
|-------|-------------|
| `cb` | `circuit_breaker` |
| `breker` | `circuit_breaker` (common misspelling) |
| `مدارشکن` | `circuit_breaker` |
| `کلید قدرت` | `circuit_breaker` |

Persian aliases include common colloquial forms and regional variations.

---

## 3. Standard Reference Matching (تطابق ارجاعات استاندارد)

| Pattern | Resolution |
|---------|------------|
| `IEC 60909` | Standard(IEC, 60909) |
| `IEC 60909:2001` | Standard(IEC, 60909, 2001) |
| `IEC 60909-1` | Standard(IEC, 60909-1) |
| `IEC 60909 §4.2` | Standard(IEC, 60909, section=4.2) |
| `IEEE 80-2013` | Standard(IEEE, 80, 2013) |
| `ISIRI 1234` | Standard(ISIRI, 1234) |

Each standards body has a dedicated regex pattern for extraction and resolution.

---

## 4. Manufacturer Name Matching (تطابق نام سازنده)

| Property | Rule |
|----------|------|
| Canonical source | Manufacturer names maintained in engineering-entities.md |
| Fuzzy matching | Allowed (Edit distance ≤ 2) |
| Regional variants | Supported per locale |

### Examples

| Input | Canonical |
|-------|-----------|
| Siemens | Siemens AG |
| ABB | ABB Group |
| ABB Iran | ABB Group |

---

## 5. Equipment Name Matching (تطابق نام تجهیزات)

| Pattern | Resolution |
|---------|------------|
| Manufacturer + Model: `Siemens 3AH` | Equipment(Siemens, 3AH) |
| Type + Rating: `20kV CB` | Equipment(circuit_breaker, 20kV) |
| Function + Location: `Incoming Feeder CB` | Equipment(circuit_breaker, function=incoming) |

---

## 6. Confidence Scoring for Semantic Matching (امتیازدهی اطمینان)

Overall match confidence is the MAXIMUM confidence from all matching strategies that succeed.

| Scenario | Confidence | Action |
|----------|------------|--------|
| Exact match succeeds | 1.0 | Stop — no other strategies needed |
| Exact fails, acronym succeeds | 0.95 | Accept |
| Only fuzzy succeeds | 0.60–0.80 | Based on edit distance |
| Only embedding succeeds | 0.70–0.90 | Based on cosine similarity |

---

## 7. Disambiguation Rules (قوانین ابهام‌زدایی)

When a term maps to multiple canonical concepts:

| Priority | Rule |
|----------|------|
| 1 | Use domain context from the query or document taxonomy |
| 2 | If no domain context, prefer most common usage (frequency-based) |
| 3 | If equally common, return all alternatives with confidence scores |
| 4 | User can manually disambiguate by appending domain prefix |

---

## 8. Graph Mapping (نگاشت به گراف)

Each rule type maps to a graph query pattern:

| Rule Type | Graph Query Pattern |
|-----------|---------------------|
| Synonym resolution | `MATCH (t:Term)-[:SYNONYM_OF]->(c:CanonicalTerm)` |
| Acronym resolution | `MATCH (a:Acronym)-[:EXPANDS_TO]->(f:FullForm)` |
| Standard reference | `MATCH (s:Standard {code: "IEC 60909"})` |
| Equipment naming | `MATCH (e:Equipment {manufacturer: "Siemens", model: "3AH"})` |
