# جلوگیری از توهم AI — Hallucination Prevention Framework

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Prevention Layers — لایه‌های پیشگیری

```
┌─────────────────────────────────────────────────────────────┐
│                  Hallucination Prevention                   │
│                                                             │
│  Layer 1: Knowledge Boundary Detection                     │
│  Layer 2: Source Verification Layer                        │
│  Layer 3: Constraint Enforcement                           │
│  Layer 4: Confidence Threshold Gates                       │
│  Layer 5: Human Escalation Criteria                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Detection Techniques                    │   │
│  │  Semantic Gap · Factual Consistency · Numeric Check │   │
│  │  Cross-Source Validation · Post-gen Verification    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Knowledge Boundary Detection — تشخیص مرز دانش

AI باید تشخیص دهد که آیا query در محدوده پوشش پایگاه دانش قرار دارد یا خیر.

### Coverage Assessment

| معیار | آستانه | اقدام |
|-------|--------|-------|
| **Knowledge Coverage** | < ۵۰٪ از اطلاعات مورد نیاز | پرچم "Insufficient Knowledge" |
| **Max Retrieval Score** | < ۰.۷ | عدم امکان پاسخ‌دهی |
| **Relevant Chunks Found** | ۰ | پاسخ مسدود |
| **Domain Match** | خارج از حوزه‌های مهندسی تعریف شده | هشدار "Out of Domain" |

### Implementation

```python
def assess_knowledge_coverage(query, retrieved_chunks):
    """
    ارزیابی درصد پوشش دانش برای query ورودی
    """
    required_aspects = extract_aspects(query)
    covered_aspects = count_covered_aspects(required_aspects, retrieved_chunks)
    coverage_ratio = covered_aspects / len(required_aspects)

    if coverage_ratio < 0.5:
        return {"status": "insufficient", "coverage": coverage_ratio}
    if max(retrieval_scores) < 0.7:
        return {"status": "low_confidence", "coverage": coverage_ratio}
    return {"status": "sufficient", "coverage": coverage_ratio}
```

| وضعیت | رفتار |
|-------|-------|
| **Sufficient** | ادامه فرآیند عادی |
| **Insufficient** | تولید پاسخ با هشدار "This information is not available in the current knowledge base" |
| **Low Confidence** | تولید پاسخ با پیشوند "Low Confidence — Verify Before Use" |
| **Out of Domain** | هشدار و هدایت به حوزه‌های پشتیبانی شده |

---

## Layer 2: Source Verification Layer — لایه تأیید منبع

هر ادعا در پاسخ باید به یک چانک منبع نگاشت شود.

### Claim Mapping

```
Response: "جریان نامی مجاز کابل ۲۵mm² مس برابر ۱۱۰A است."

Claims Identified:
  ├── Claim 1: "کابل مسی است" → Source: catalog-nexans-25mm² §2.1 ✅
  ├── Claim 2: "جریان نامی مجاز = ۱۱۰A" → Source: IEC 60364-5-52 §4.2 ✅
  └── Claim 3: "مقطع کابل ۲۵mm² است" → Source: query parameter (user-provided)

Unmapped Claims: [] → Clean ✅
```

| الگوریتم | توضیح |
|----------|-------|
| **Claim Extraction** | استخراج جملات دارای ادعای واقعی از پاسخ تولید شده |
| **Source Matching** | تطابق هر ادعا با چانک‌های بازیابی شده (تشابه معنایی > ۰.۸) |
| **Unmapped Alert** | ادعاهای بدون تطابق → حذف از پاسخ + لاگ |
| **Post-Gen Verification** | LLM مجدداً پاسخ را در برابر چانک‌های اصلی بررسی می‌کند |

### Post-Generation Verification Prompt

```
System: You are a hallucination detector. Verify each factual claim in the
generated answer against the provided source chunks.

For each claim, determine:
- SUPPORTED: The source chunk supports this claim
- CONTRADICTED: The source chunk contradicts this claim
- UNSUPPORTED: The source chunk neither supports nor contradicts this claim

Only claims marked SUPPORTED may remain in the final response.
Claims marked CONTRADICTED or UNSUPPORTED must be removed.
```

---

## Layer 3: Constraint Enforcement — اعمال محدودیت‌ها

AI باید محدودیت‌های زیر را در تمام پاسخ‌ها رعایت کند:

| محدودیت | شرط | پیامد نقض |
|---------|-----|----------|
| **Numerical Values** | هر مقدار عددی باید به یک منبع مستند ارجاع دهد | حذف مقدار + هشدار |
| **Equipment Recommendations** | هر توصیه تجهیزات باید به کاتالوگ رسمی ارجاع دهد | حذف توصیه + هشدار |
| **Design Parameters** | هر پارامتر طراحی باید به استاندارد مرجع متصل باشد | حذف پارامتر + هشدار |
| **Safety Recommendations** | هر توصیه ایمنی باید به استاندارد نظارتی متصل باشد | مسدودسازی کامل پاسخ |
| **Regulatory References** | هر ارجاع قانونی باید به سند رسمی مرتبط باشد | مسدودسازی کامل پاسخ |

### Constraint Enforcement Engine

| نوع داده | validator | مثال |
|----------|-----------|-------|
| عددی | `has_numeric_source(value, sources)` | "جریان ۱۱۰A [IEC 60364-5-52 §4.2]" ✅ |
| تجهیزات | `has_catalog_ref(equipment, sources)` | "کابل NYY 25mm² [Nexans Catalog 2024]" ✅ |
| پارامتر طراحی | `has_standard_ref(param, standard, sources)` | "ضریب ۰.۸۷ [ISIRI 1234 §7.1]" ✅ |
| ایمنی | `has_regulatory_ref(rec, regulation, sources)` | "RCD 30mA [IEC 60364 §411.1]" ✅ |

---

## Layer 4: Confidence Threshold Gates — دروازه‌های آستانه اطمینان

| آستانه | شرط | اقدام |
|--------|------|-------|
| **Overall < ۰.۵** | اطمینان کلی پایین | پیشوند "Low Confidence — Verify Before Use" |
| **Any Component < ۰.۳** | یک مؤلفه بسیار پایین | پرچم‌گذاری آن مؤلفه در پاسخ |
| **Source < ۰.۵** | کیفیت منبع پایین | هشدار کیفیت منبع |
| **Retrieval < ۰.۳** | عدم تطابق query با دانش | مسدودسازی پاسخ |
| **Reasoning < ۰.۳** | استدلال نامعتبر | مسدودسازی پاسخ |

### Gate Logic

```
IF overall_score >= 0.75:
    → Full response, no warnings
ELIF overall_score >= 0.50:
    → Response with "⚠ Low Confidence — Verify Before Use"
    → Flag components below 0.3
ELIF overall_score >= 0.25:
    → Response with explicit warnings per component
    → Not suitable for engineering use
ELSE:
    → Block response
    → Return "This information is not available in the current knowledge base."
```

---

## Layer 5: Human Escalation Criteria — معیارهای ارجاع به کارشناس

موارد زیر باید به صورت خودکار به کارشناس انسانی ارجاع داده شوند:

| دسته | معیار | اولویت |
|------|-------|--------|
| **Safety-Critical** | پارامترهای اتصال کوتاه، تنظیمات حفاظتی، طراحی ارتینگ | فوری |
| **Source Conflict** | تضاد بین دو منبع Tier 1 | بالا |
| **Low Confidence** | امتیاز اطمینان < ۰.۳ | بالا |
| **Interpretation Required** | query نیاز به تفسیر خارج از دانش موجود دارد | متوسط |
| **Novel Scenario** | سناریوی جدید بدون نمونه مشابه در پایگاه | متوسط |
| **User Request** | کاربر صریحاً درخواست بازبینی انسانی کرده است | بر اساس درخواست |

### Escalation Flow

```
Trigger Event → Classification → Priority Assignment → Queue Insertion
                                                         │
                                                    ┌────┴────┐
                                                    │ Human   │
                                                    │ Expert  │
                                                    └────┬────┘
                                                         │
                                                    ┌────┴────┐
                                                    │ Review  │
                                                    │ Decision│
                                                    └────┬────┘
                                                    ┌────┴────┐
                                                    │ Response│
                                                    │ Update  │
                                                    └─────────┘
```

---

## Detection Techniques — تکنیک‌های تشخیص

### 1. Semantic Gap Analysis — تحلیل شکاف معنایی

| مرحله | توضیح | تکنیک |
|-------|-------|-------|
| Embedding Comparison | مقایسه embedding query با embedding چانک‌ها | Cosine Similarity |
| Coverage Matrix | ماتریس پوشش جنبه‌های query | Aspect Extraction + NER |
| Gap Report | گزارش جنبه‌های پوشش‌داده نشده | LLM-based Gap Analysis |

**آستانه:** اگر تشابه معنایی بین query و تمام چانک‌ها < ۰.۶ → شکاف معنایی → Insufficient Knowledge

### 2. Factual Consistency Checking — بررسی تطابق واقعی

| تکنیک | روش | دقت |
|-------|-----|-----|
| **NLI-based** | Natural Language Inference بین ادعا و منبع | ۸۵٪ |
| **Token-overlap** | اشتراک توکن‌های کلیدی بین ادعا و منبع | ۷۰٪ |
| **LLM Judge** | LLM به عنوان داور تطابق | ۹۰٪ |
| **Hybrid** | ترکیب سه روش بالا | ۹۵٪ |

### 3. Numerical Precision Verification — صحت‌سنجی عددی

| بررسی | روش | مثال |
|-------|-----|-------|
| **Source Match** | آیا عدد دقیقاً در منبع وجود دارد؟ | "۱۱۰A → IEC 60364-5-52 جدول 4" ✅ |
| **Calculation Check** | آیا محاسبه ریاضی درست است؟ | "۱۱۰ × ۰.۸۷ = ۹۵.۷" ✅ |
| **Unit Consistency** | آیا واحدها سازگار هستند؟ | "mm² vs A" ✅ |
| **Range Plausibility** | آیا عدد در محدوده معقول است؟ | "جریان ۱۱۰A برای ۲۵mm² معقول است" ✅ |

### 4. Cross-Source Validation — اعتبارسنجی بین‌منبعی

| وضعیت | تفسیر |
|-------|-------|
| همه منابع一致 | اطمینان بالا |
| ≥ ۲ منبع一致 + ۱ منبع متفاوت | اطمینان متوسط — ذکر اختلاف |
| ۱ منبع در برابر سایرین | پرچم conflict — بررسی انسانی |
| همه منابع متفاوت | عدم اجماع — مسدودسازی |

---

## Response Templates — قالب‌های پاسخ

### Template A: High Confidence (≥ 0.75)

```
[Answer]

Confidence: [score] — Very High/High

Sources:
- [Source 1] (Tier X) — [Section]
- [Source 2] (Tier X) — [Section]

Reasoning Path: [summary of steps]

Limitations:
- [Limitation 1]
- [Limitation 2]
```

### Template B: Moderate Confidence (0.50 – 0.74)

```
⚠️ Low Confidence — Verify Before Use

[Answer with explicit caveats]

Confidence: [score] — Moderate
Flags: [flagged components with scores < 0.3]

Sources:
- [Source 1] (Tier X) — [Section]
- [Source 2] (Tier X) — [Section]

Recommendation: This information should be verified against authoritative sources
before use in engineering designs.
```

### Template C: Low Confidence (0.25 – 0.49)

```
⚠️ WARNING: Low Confidence — This information should not be used for
engineering decisions without expert verification.

[Answer with maximum caveats]

Confidence: [score] — Low
Flags: [all components with scores]

Why confidence is low:
- [Reason 1]
- [Reason 2]

Recommendation: Consult a human expert or refer to the original standards directly.
```

### Template D: Insufficient Knowledge (< 0.25 or Knowledge Coverage < 50%)

```
This information is not available in the current knowledge base.

Related documents that may be of interest:
- [Related Doc 1] — [brief description]
- [Related Doc 2] — [brief description]

Suggested actions:
1. Refine your query to focus on available topics
2. Contact your knowledge base administrator to request this content
3. Consult a human engineering expert
```

### Template E: Safety-Critical Block

```
⚠️ SAFETY NOTICE

This query involves safety-critical parameters (fault current, protection settings,
earthing design) that require expert human verification.

The AI system cannot provide a definitive answer for safety-critical applications
without human review.

Your query has been escalated to a human expert for review.
Expected response time: [timeframe]

Reference: [Escalation ID]
```

---

## Monitoring & Metrics — نظارت و معیارها

| معیار | هدف | اندازه‌گیری |
|-------|-----|------------|
| **Hallucination Rate** | < ۱٪ از کل پاسخ‌ها | نمونه‌گیری تصادفی + بازبینی انسانی |
| **False Positive Rate** | < ۵٪ در تشخیص توهم | مقایسه با برچسب‌های انسانی |
| **False Negative Rate** | < ۱٪ | تشخیص موارد توهم نشده |
| **Escalation Accuracy** | > ۹۰٪ موارد ارجاع شده واقعاً نیازمند بررسی | بازخورد کارشناسان |
| **Average Response Confidence** | > ۰.۷۰ | میانگین امتیاز اطمینان تمام پاسخ‌ها |
| **Knowledge Coverage Rate** | > ۸۰٪ queries با پوشش کافی | نسبت به کل queries |

---

## Incident Response — پاسخ به حادثه

| سطح حادثه | توضیح | اقدام |
|-----------|-------|-------|
| **P0 — Critical** | توهم در مورد پارامترهای ایمنی | مسدودسازی فوری سرویس + بازبینی + به‌روزرسانی |
| **P1 — High** | توهم با اطلاعات عددی نادرست | حذف پاسخ‌های affected + اصلاح مدل |
| **P2 — Medium** | توهم در ارجاع منبع (منبع اشتباه) | اصلاح خودکار + لاگ |
| **P3 — Low** | توهم در جزئیات غیرمهندسی | لاگ + بررسی دوره‌ای |

> کلیه حوادث توهم در **Audit Trail** ثبت شده و به صورت ماهانه در **Hallucination Review Board** بررسی می‌شوند.
