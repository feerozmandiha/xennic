# امتیازدهی اطمینان — Confidence Scoring System

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Confidence Components — مؤلفه‌های اطمینان

امتیاز اطمینان نهایی از ترکیب وزنی ۵ مؤلفه محاسبه می‌شود:

```
Final Score = (W₁ × S₁) + (W₂ × S₂) + (W₃ × S₃) + (W₄ × S₄) + (W₅ × S₅)

Where:
  W₁ = 0.30 (Source Confidence)
  W₂ = 0.25 (Retrieval Confidence)
  W₃ = 0.25 (Reasoning Confidence)
  W₄ = 0.10 (Temporal Confidence)
  W₅ = 0.10 (Consensus Confidence)
```

---

### 1. Source Confidence — اطمینان منبع (وزن: ۳۰٪)

بر اساس تایر منبع در سلسله‌مراتب منابع:

| تایر | نوع منبع | محدوده امتیاز | امتیاز پایه |
|------|---------|--------------|------------|
| 1 | استاندارد بین‌المللی (IEC, IEEE, ISO) | 0.95 – 1.00 | 0.98 |
| 2 | استاندارد ملی (ISIRI, BS, DIN, NF) | 0.85 – 0.94 | 0.90 |
| 3 | کاتالوگ رسمی کارخانه (Siemens, ABB, Schneider) | 0.70 – 0.84 | 0.78 |
| 4 | منابع معتبر (کتب مرجع، مقالات علمی) | 0.50 – 0.69 | 0.60 |
| 5 | محتوای تولیدی تیم Xennic | 0.30 – 0.49 | 0.40 |

**تنظیم امتیاز:**
- منبع مستقیماً مرتبط با query → امتیاز پایه + ۰.۰۲
- منبع دارای تأیید انسانی → امتیاز پایه + ۰.۰۵
- منبع دارای چندین نسخه (آخرین نسخه) → امتیاز پایه + ۰.۰۱
- منبع بازنشسته یا منسوخ → امتیاز = ۰.۳۰ (صرف‌نظر از تایر)

### 2. Retrieval Confidence — اطمینان بازیابی (وزن: ۲۵٪)

بر اساس کیفیت تطابق query با چانک‌های بازیابی شده:

| مؤلفه | توضیح | وزن در Retrieval Confidence |
|-------|-------|---------------------------|
| **Cosine Similarity** | تشابه برداری بین query embedding و chunk embedding | ۶۰٪ |
| **Rerank Score** | امتیاز cross-encoder بین query و chunk | ۴۰٪ |

**فرمول:**
```
Retrieval Confidence = 0.60 × avg(cosine_similarity) + 0.40 × avg(rerank_score)
```

| محدوده امتیاز | تفسیر | وضعیت |
|--------------|-------|-------|
| 0.90 – 1.00 | تطابق عالی | استفاده مستقیم |
| 0.75 – 0.89 | تطابق خوب | قابل استفاده |
| 0.50 – 0.74 | تطابق متوسط | نیاز به بررسی |
| 0.25 – 0.49 | تطابق ضعیف | احتیاط |
| 0.00 – 0.24 | عدم تطابق | عدم استفاده |

### 3. Reasoning Confidence — اطمینان استدلال (وزن: ۲۵٪)

بر اساس صحت منطقی مسیر استدلال:

| معیار | وزن | توضیح |
|-------|-----|-------|
| **Logical Soundness** | ۴۰٪ | آیا گام‌های استدلال از نظر منطقی معتبر هستند؟ |
| **Chain Completeness** | ۳۰٪ | آیا تمام گام‌های لازم برای رسیدن به نتیجه وجود دارد؟ |
| **Absence of Contradictions** | ۲۰٪ | آیا هیچ تناقض داخلی در زنجیره وجود ندارد؟ |
| **Mode Appropriateness** | ۱۰٪ | آیا حالت استدلال انتخاب شده برای این مسئله مناسب است؟ |

**امتیازدهی هر معیار:**

| معیار | شرایط | امتیاز |
|-------|-------|--------|
| Logical Soundness | همه گام‌ها از یک قاعده معتبر تبعیت می‌کنند | ۱.۰ |
| | یک یا چند گام دارای ابهام منطقی | ۰.۶ |
| | گام‌های استدلال ناقص یا غیرمنطقی | ۰.۳ |
| Chain Completeness | همه گام‌های لازم وجود دارند | ۱.۰ |
| | یک گام میانی缺失 | ۰.۶ |
| | چندین گام缺失 | ۰.۳ |
| Absence of Contradictions | بدون تناقض | ۱.۰ |
| | تناقض جزئی (قابل رفع با ذکر) | ۰.۶ |
| | تناقض عمده | ۰.۰ |
| Mode Appropriateness | حالت کاملاً مناسب | ۱.۰ |
| | حالت نسبتاً مناسب | ۰.۷ |
| | حالت نامناسب | ۰.۴ |

**فرمول:**
```
Reasoning Confidence = 0.40 × L + 0.30 × C + 0.20 × A + 0.10 × M

Where:
  L = Logical Soundness score
  C = Chain Completeness score
  A = Absence of Contradictions score
  M = Mode Appropriateness score
```

### 4. Temporal Confidence — اطمینان زمانی (وزن: ۱۰٪)

بر اساس قدمت اسناد مورد استفاده:

| سن سند | امتیاز | شرایط |
|--------|--------|-------|
| < ۲ سال | ۱.۰۰ | آخرین نسخه |
| ۲ – ۵ سال | ۰.۹۵ | استاندارد معمولاً معتبر است |
| ۵ – ۱۰ سال | ۰.۸۰ | معتبر مگر اینکه نسخه جدیدتر منتشر شده باشد |
| > ۱۰ سال (تأیید نشده) | ۰.۵۰ | باید فعال بودن تأیید شود |
| > ۱۰ سال (تأیید فعال) | ۰.۸۰ | با تأیید expert |
| نامشخص | ۰.۵۰ | تاریخ انتشار موجود نیست |

**تعدیل:**
- استانداردهای IEC با نسخه جدیدتر → ۰.۵۰ (نیاز به ارتقا)
- استانداردهای بدون تغییر در ۱۰ سال → ۰.۸۵ (پایدار)
- کاتالوگ‌های فنی > ۳ سال → ۰.۷۰ (ممکن است قدیمی باشد)

### 5. Consensus Confidence — اطمینان اجماع (وزن: ۱۰٪)

بر اساس تعداد منابع مستقلی که از یک نتیجه حمایت می‌کنند:

| تعداد منابع مستقل | امتیاز | مثال |
|------------------|--------|------|
| ۱ | ۰.۵۰ | فقط یک استاندارد |
| ۲ | ۰.۷۵ | دو استاندارد یا یک استاندارد + کاتالوگ |
| ۳+ | ۰.۹۰ | سه منبع یا بیشتر از سه حوزه مختلف |
| ۵+ | ۰.۹۵ | اجماع قوی |

**تعریف منبع مستقل:**
- دو استاندارد از سازمان‌های مختلف (مثلاً IEC + IEEE) → مستقل ✅
- دو نسخه از یک استاندارد → مستقل ❌ (یک منبع محسوب می‌شود)
- استاندارد + کاتالوگ کارخانه → مستقل ✅
- استاندارد + مقاله علمی → مستقل ✅

---

## Final Score Calculation — محاسبه امتیاز نهایی

### Weighted Average

```
Final Score = (0.30 × S_source) + (0.25 × S_retrieval) + (0.25 × S_reasoning) + (0.10 × S_temporal) + (0.10 × S_consensus)
```

### Penalty Modifiers

| شرط | جریمه | اعمال بر |
|-----|-------|---------|
| هر منبع با تایر < ۳ | ۱۰٪ کاهش | Source Confidence |
| وجود هر تناقض | ۲۰٪ کاهش | Reasoning Confidence |
| بازیابی با امتیاز < ۰.۵ | ۱۵٪ کاهش | Retrieval Confidence |
| سند > ۱۰ سال بدون تأیید | ۳۰٪ کاهش | Temporal Confidence |

### Minimum Score Floor

| شرط | کف امتیاز |
|-----|-----------|
| حداقل یک منبع Tier 1 | ۰.۳۰ |
| فقط منابع Tier 3+ | ۰.۱۵ |
| بدون منبع | ۰.۰۰ (پاسخ مسدود) |

---

## Score Interpretation — تفسیر امتیاز

| محدوده | برچسب | کاربرد مجاز | شرط نمایش |
|--------|-------|------------|----------|
| 0.90 – 1.00 | Very High | تصمیمات طراحی، مستندات فنی نهایی | نمایش بدون هشدار |
| 0.75 – 0.89 | High | طراحی مقدماتی، پیش‌نویس | نمایش با ذکر "High Confidence" |
| 0.50 – 0.74 | Moderate | مرجع فقط، نیاز به تأیید دستی | نمایش با هشدار "Verify Before Use" |
| 0.25 – 0.49 | Low | اطلاعاتی فقط، قابل استفاده در طراحی نیست | نمایش با هشدار شدید |
| 0.00 – 0.24 | Very Low | نباید به عنوان پاسخ ارائه شود | مسدود — پیام "Insufficient Knowledge" |

### Required Prefixes

| سطح اطمینان | پیشوند اجباری پاسخ |
|-------------|-------------------|
| Moderate | `⚠️ Low Confidence — Verify Before Use` |
| Low | `⚠️ WARNING: Low Confidence — This information should not be used for engineering decisions without expert verification.` |
| Very Low | پاسخ مسدود — `This information is not available in the current knowledge base.` |

---

## Multi-Component Scoring Example — مثال امتیازدهی چندمؤلفه‌ای

**Query:** جریان اتصال کوتاه برای ترانسفورماتور 1000kVA, 20/0.4kV

| مؤلفه | امتیاز | وزن | سهم |
|-------|--------|-----|-----|
| Source (Tier 1 — IEC 60909) | 0.98 | 0.30 | 0.294 |
| Retrieval (Sim: 0.92, Rerank: 0.88) | 0.90 | 0.25 | 0.225 |
| Reasoning (Deductive, کامل, بدون تناقض) | 0.95 | 0.25 | 0.237 |
| Temporal (IEC 60909:2016, < ۱۰ سال) | 0.80 | 0.10 | 0.080 |
| Consensus (IEC 60909 + IEEE 141, 2 source) | 0.75 | 0.10 | 0.075 |
| **Final Score** | | | **0.911** |

**Interpretation:** Very High — Suitable for design decisions

---

## Confidence Audit Trail — مسیر حسابرسی اطمینان

هر محاسبه امتیاز اطمینان باید قابل ممیزی باشد:

```json
{
  "confidence_id": "conf-001",
  "final_score": 0.911,
  "components": {
    "source": {"score": 0.98, "weight": 0.30, "sources": ["kb://iec-60909/1.0"]},
    "retrieval": {"score": 0.90, "weight": 0.25, "cosine_sim": 0.92, "rerank": 0.88},
    "reasoning": {"score": 0.95, "weight": 0.25, "logical": 1.0, "complete": 1.0, "contradictions": 1.0, "mode": 1.0},
    "temporal": {"score": 0.80, "weight": 0.10, "doc_age_years": 9, "confirmed_active": true},
    "consensus": {"score": 0.75, "weight": 0.10, "independent_sources": 2}
  },
  "penalties_applied": [],
  "interpretation": "Very High",
  "timestamp": "2025-06-20T10:30:05Z"
}
```
