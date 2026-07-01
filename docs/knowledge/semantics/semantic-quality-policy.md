# سیاست کیفیت معنایی — Semantic Quality Policy

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Purpose (هدف)

Define measurable quality metrics for the semantic layer. Every term, synonym, and translation must meet quality thresholds before publication.

---

## 2. Quality Dimensions (ابعاد کیفیت)

### 2.1 Completeness — کامل بودن (Weight: 25%)

| Check | Description |
|-------|-------------|
| Required fields | All required fields populated (name_en, name_fa, definition, domain) |
| Minimum definition length | ≥ 20 characters |
| References | At least one related_concept or related_standard reference |
| Scoring | Score = (populated_required / total_required) × 1.0 |

### 2.2 Consistency — یکپارچگی (Weight: 25%)

| Check | Description |
|-------|-------------|
| Circular references | No circular synonym references |
| Duplicate terms | No duplicate canonical terms |
| Cross-references | All cross-references are valid (term_ids exist) |
| Domain codes | Domain codes match taxonomy.md |
| Scoring | Score = (passed_checks / total_checks) |

### 2.3 Translation Accuracy — دقت ترجمه (Weight: 20%)

| Check | Description |
|-------|-------------|
| Bilingual validation | Bilingual entries validated by language reviewer |
| Persian standards | Persian term follows ISIRI/Tavanir usage where applicable |
| MT prohibition | No machine-translation-only entries without human review |
| Scoring | Score = human_reviewed_passing / total_bilingual_entries |

### 2.4 Duplicate Detection — تشخیص تکراری (Weight: 15%)

| Check | Description |
|-------|-------------|
| Exact duplicates | No exact duplicates (same name_en and name_fa) |
| Near-duplicates | No near-duplicates (cosine similarity > 0.95 between definitions) |
| Synonym overlap | Synonym groups checked for overlap |
| Scoring | Score = 1.0 - (duplicates_found / total_entries) |

### 2.5 Ambiguity Detection — تشخیص ابهام (Weight: 15%)

| Check | Description |
|-------|-------------|
| Ambiguous synonyms | No ambiguous synonyms (one synonym mapping to multiple canonical terms without context rules) |
| Acronym disambiguation | Acronyms with multiple expansions disambiguated by domain |
| Scoring | Score = non_ambiguous / total_entries_with_potential_ambiguity |

---

## 3. Quality Scoring Model (مدل امتیازدهی کیفیت)

```
SemanticQualityScore =
  (Completeness × 0.25) +
  (Consistency × 0.25) +
  (TranslationAccuracy × 0.20) +
  (DuplicateScore × 0.15) +
  (AmbiguityScore × 0.15)
```

---

## 4. Quality Gates (دروازه‌های کیفیت)

| Gate | Type | Description |
|------|------|-------------|
| Ingestion Gate | Automated | Checks for completeness and consistency |
| Review Gate | Human | Review for translation accuracy |
| Publication Gate | Threshold | Score ≥ 0.80 required for publication |
| Audit Gate | Periodic | Quarterly audit of all metrics |

---

## 5. Acceptance Thresholds (آستانه‌های پذیرش)

| Score | Action |
|-------|--------|
| ≥ 0.90 | Auto-publish |
| 0.80–0.89 | Conditional publish (requires review) |
| 0.60–0.79 | Return for revision |
| < 0.60 | Reject |

---

## 6. Continuous Quality Monitoring (پایش مستمر کیفیت)

| Period | Activity |
|--------|----------|
| Monthly | Automated quality scans |
| Quarterly | Human quality audits |
| Annual | Terminology review cycle |
| Ongoing | Quality trend reporting (score over time) |

---

## 7. Graph & AI Mapping (نگاشت به گراف و هوش مصنوعی)

Each quality check corresponds to a query or script pattern:

| Quality Check | Graph Query / Script Pattern |
|---------------|------------------------------|
| Completeness | `MATCH (t:Term) WHERE t.definition IS NULL RETURN count(t)` |
| Duplicate | `MATCH (t1:Term), (t2:Term) WHERE t1.name_en = t2.name_en AND t1.id <> t2.id` |
| Ambiguity | `MATCH (s:SynonymGroup) WHERE size(s.canonical_terms) > 1` |
