# موتور اطمینان — Confidence Engine

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Confidence Components (Refined from K1.1) — مؤلفه‌های اطمینان

The final confidence score is computed from 5 components, extending the K1.1 `confidence-scoring.md` formula into a runtime engine.

### 1. Source Authority Confidence — اطمینان مرجعیت منبع (وزن: ۳۰٪)

| تایر | محدوده امتیاز | امتیاز پایه |
|------|--------------|------------|
| 1 | 0.95 – 1.00 | 0.98 |
| 2 | 0.85 – 0.94 | 0.90 |
| 3 | 0.70 – 0.84 | 0.78 |
| 4 | 0.50 – 0.69 | 0.60 |
| 5 | 0.30 – 0.49 | 0.40 |

**Adjustment:** +0.02 if source is directly relevant to query

### 2. Evidence Quality Confidence — اطمینان کیفیت مدرک (وزن: ۲۵٪)

| وضعیت | امتیاز | توضیح |
|-------|--------|-------|
| Full clause/quotation | 0.95 | نقل‌قول مستقیم و کامل |
| Partial/summarized | 0.80 | خلاصه یا بخشی از متن |
| Inferred/implicit | 0.60 | استنباطی و غیرمستقیم |
| No direct evidence | 0.30 | بدون مدرک مستقیم |

### 3. Reasoning Strength Confidence — اطمینان قدرت استدلال (وزن: ۲۰٪)

| حالت استدلال | امتیاز پایه |
|-------------|------------|
| Deductive | 0.95 |
| Rule-Based | 0.90 |
| Constraint-Based | 0.80 |
| Inductive | 0.75 |
| Case-Based | 0.70 |
| Abductive | 0.65 |

**Adjustment:** -0.10 per unsupported reasoning step

### 4. Consistency Confidence — اطمینان سازگاری (وزن: ۱۵٪)

| وضعیت | امتیاز | توضیح |
|-------|--------|-------|
| Multiple independent sources support same conclusion | 0.90 | اجماع چند منبع مستقل |
| Single source only | 0.70 | تنها یک منبع |
| Sources partially conflict | 0.50 | تضاد جزئی بین منابع |
| Sources directly conflict | 0.20 | تضاد مستقیم بین منابع |

### 5. Temporal/Freshness Confidence — اطمینان زمانی/تازگی (وزن: ۱۰٪)

| وضعیت | امتیاز | توضیح |
|-------|--------|-------|
| Within currency window | 1.00 | در بازه اعتبار |
| Within 50% over window | 0.80 | تا ۵۰٪ خارج از بازه |
| Over window | 0.50 | خارج از بازه اعتبار |
| Deprecated | 0.10 | منسوخ شده |

Per source-hierarchy.md currency windows.

---

## Final Score Formula — فرمول امتیاز نهایی

```
Confidence = 0.30 × Source + 0.25 × Evidence + 0.20 × Reasoning + 0.15 × Consistency + 0.10 × Temporal
```

---

## Confidence Propagation — انتشار اطمینان

| قانون | توضیح |
|-------|-------|
| **Evidence confidence propagates UP** | Through reasoning chain from evidence to conclusion |
| **Chain confidence** | = min(all evidence confidences in chain) |
| **Overall conclusion confidence** | = weighted average of all chain confidences |
| **Consensus bonus** | If two chains support same conclusion → confidence increases (+0.05) |

---

## Score Interpretation — تفسیر امتیاز

| محدوده | برچسب | رفتار هوش مصنوعی |
|--------|-------|-----------------|
| 0.90 – 1.00 | Very High | Can be used for design decisions |
| 0.75 – 0.89 | High | Suitable for preliminary design |
| 0.50 – 0.74 | Moderate | Reference only, needs verification |
| 0.25 – 0.49 | Low | Informational only |
| 0.00 – 0.24 | Very Low | Should not be presented as answer |

---

## Runtime Implementation — پیاده‌سازی رانتایم

| مشخصه | توضیح |
|-------|-------|
| **Calculation trigger** | Confidence calculated at reasoning step 8 (per reasoning-runtime.md) |
| **Recalculation** | Recalculated if new evidence added or existing evidence changes |
| **Caching** | Cached per reasoning session for consistency |
