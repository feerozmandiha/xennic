# چارچوب استدلال مهندسی — Engineering Reasoning Framework

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Reasoning Modes — حالت‌های استدلال

### 1. Deductive Reasoning — استدلال قیاسی (قیاسی)

از قاعده کلی به مصداق خاص.

| مشخصه | توضیح |
|-------|-------|
| **الگو** | General Rule → Specific Case |
| **کاربرد** | اعمال استانداردها، انطباق با کدها، محاسبات فرمولی |
| **اعتبار** | مطلق — در صورت صحت قاعده و شرایط |
| **امتیاز اطمینان پایه** | 0.95 |

**مثال:**
```
قاعده: IEC 60364 specifies 30mA RCD for socket circuits up to 32A
مصداق: این مدار 32 آمپری یک مدار پریز است
نتیجه: این مدار به RCD 30mA نیاز دارد
```

### 2. Inductive Reasoning — استدلال استقرایی (استقرایی)

از مصادیق خاص به الگوی کلی.

| مشخصه | توضیح |
|-------|-------|
| **الگو** | Specific Cases → General Pattern |
| **کاربرد** | تشخیص خطا، شناسایی الگو، تحلیل داده‌های عملیاتی |
| **اعتبار** | احتمالی — نیاز به تأیید با نمونه‌های بیشتر |
| **امتیاز اطمینان پایه** | 0.75 |

**مثال:**
```
مشاهدات: سه موتور مشابه در ساعات کاری مختلف دچار خرابی بلبرینگ شده‌اند
الگو: خرابی مکرر بلبرینگ در موتورهای این سری
نتیجه: احتمالاً موتورها مشکل ناهم‌محوری (misalignment) دارند
```

### 3. Abductive Reasoning — استدلال فرضیه‌ساز (فرضیه‌سازی)

از مشاهده به بهترین توضیح.

| مشخصه | توضیح |
|-------|-------|
| **الگو** | Observation → Best Explanation |
| **کاربرد** | عیب‌یابی، تحلیل ریشه‌ای، شناسایی علت |
| **اعتبار** | حدسی — بهترین توضیح موجود، نه لزوماً صحیح |
| **امتیاز اطمینان پایه** | 0.65 |

**مثال:**
```
مشاهده: کلید Breaker در 80% جریان نامی تریپ می‌کند
تبیین‌های ممکن:
  1. هارمونیک‌های بالا باعث افزایش جریان مؤثر شده
  2. کاهش ظرفیت حرارتی به دلیل دمای محیط بالا
  3. فرسودگی و کاهش آستانه تریپ
بهترین تبیین: هارمونیک‌ها + بررسی دمای محیط
```

### 4. Case-Based Reasoning — استدلال مبتنی بر مورد (مبتنی بر مورد)

از موارد مشابه گذشته به راه‌حل جدید.

| مشخصه | توضیح |
|-------|-------|
| **الگو** | Past Cases → New Solution |
| **کاربرد** | طراحی اولیه، انتخاب تجهیزات، تخمین پارامترها |
| **اعتبار** | تقریبی — نیاز به تطبیق با شرایط جدید |
| **امتیاز اطمینان پایه** | 0.70 |

**مثال:**
```
مورد گذشته: پست 5MW با ترانسفورماتور 2×2500kVA طراحی شد
مورد جدید: نیروگاه 5MW مشابه
نتیجه: ترانسفورماتور 2×2500kVA پیشنهاد می‌شود
تطبیق: بررسی ضریب همزمانی و توسعه آینده
```

---

## Reasoning Mode Selection — انتخاب حالت استدلال

| نوع سوال | حالت پیش‌فرض | حالت جایگزین |
|---------|-------------|-------------|
| تطابق با استاندارد | Deductive | Case-Based |
| محاسبات فنی | Deductive | — |
| عیب‌یابی | Abductive | Inductive |
| انتخاب تجهیزات | Case-Based | Deductive |
| تحلیل خطا | Inductive | Abductive |
| طراحی مفهومی | Case-Based | Deductive |
| مستندسازی فنی | Deductive | — |

---

## Reasoning Process — فرآیند استدلال

هر گام استدلال شامل موارد زیر است:

```
┌────────────────────────────────────────────────────────────┐
│                    Reasoning Step                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Input     │  │  Reasoning   │  │   Intermediate   │  │
│  │  Evidence   │→│    Rule      │→│    Conclusion    │  │
│  │  (Sources)  │  │   Applied    │  │                  │  │
│  └─────────────┘  └──────────────┘  └───────┬──────────┘  │
│                                             │             │
│  ┌──────────────────────────────────────────┴──────────┐  │
│  │  Confidence Score at Step + Source Attribution      │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

| عنصر گام استدلال | توضیح | الزام |
|------------------|-------|-------|
| **Input Evidence** | شواهد ورودی از پایگاه دانش | حداقل یک منبع |
| **Reasoning Rule** | قاعده استدلال اعمال شده | مستند با ارجاع |
| **Intermediate Conclusion** | نتیجه میانی این گام | قابل ردیابی |
| **Step Confidence** | امتیاز اطمینان این گام (0.0-1.0) | محاسبه شده |
| **Source Attribution** | ارجاع به منابع مورد استفاده | الزامی |

---

## Mandatory Output Structure — ساختار خروجی اجباری

هر پاسخ AI باید شامل بخش‌های زیر باشد:

### Answer — پاسخ

پاسخ مستقیم به سوال کاربر. مختصر، دقیق و مبتنی بر شواهد.

### Reasoning Path — مسیر استدلال

گام‌به‌گام نحوه رسیدن به نتیجه:

```
Step 1: [Reasoning Mode] [Rule Applied]
        Input: [Evidence]
        Output: [Intermediate Conclusion]
        Confidence: [Score]
        Sources: [References]

Step 2: [Reasoning Mode] [Rule Applied]
        Input: [Previous Output + New Evidence]
        Output: [Intermediate Conclusion]
        Confidence: [Score]
        Sources: [References]
```

### Evidence — شواهد

| # | منبع | تایر | بخش | امتیاز بازیابی |
|---|------|------|------|--------------|
| 1 | IEC 60364-5-52:2022 | Tier 1 | §4.2, Table 4 | 0.94 |
| 2 | ISIRI 1234:1403 | Tier 1 | §7.1 | 0.91 |

### Confidence — اطمینان

| مؤلفه | امتیاز | وزن |
|-------|--------|-----|
| Source Confidence | 0.95 | 30% |
| Retrieval Confidence | 0.92 | 25% |
| Reasoning Confidence | 0.95 | 25% |
| Temporal Confidence | 1.00 | 10% |
| Consensus Confidence | 0.75 | 10% |
| **Final Score** | **0.92** | **100%** |

**Interpretation:** Very High — Suitable for design decisions

### Limitations — محدودیت‌ها

مواردی که پاسخ پوشش نمی‌دهد:

- این پاسخ ضرایب تصحیح گروه کابل را در نظر نگرفته است
- این پاسخ برای نصب در هوای آزاد معتبر است (not buried)
- این پاسخ فرض می‌کند دمای محیط ۴۰°C و فرکانس ۵۰Hz است

---

## Response Templates — قالب‌های پاسخ

### Full Response (Confidence ≥ 0.75)

```json
{
  "answer": "پاسخ مستقیم به سوال",
  "reasoning_path": [
    {
      "step": 1,
      "mode": "deductive",
      "rule": "IEC 60364-5-52 §4.2",
      "input": "کابل مسی 25mm²",
      "output": "جریان پایه 110A",
      "confidence": 0.95,
      "sources": ["kb://iec-60364-5-52/4.2"]
    }
  ],
  "evidence": [
    {"id": "ev-001", "source": "IEC 60364-5-52:2022", "tier": 1, "section": "§4.2"}
  ],
  "confidence": {
    "overall": 0.92,
    "components": {"source": 0.95, "retrieval": 0.92, "reasoning": 0.95, "temporal": 1.0, "consensus": 0.75},
    "interpretation": "Very High"
  },
  "limitations": ["این پاسخ ضرایب تصحیح گروه کابل را در نظر نگرفته است"]
}
```

### Low Confidence Response (0.5 ≤ Confidence < 0.75)

```
⚠️ LOW CONFIDENCE — Verify Before Use

[Answer with explicit caveats]
```

### Insufficient Knowledge Response (Confidence < 0.5)

```
This information is not available in the current knowledge base.

The following related documents exist but do not fully address your query:
- [Document A] — covers [topic] partially
- [Document B] — related but different scope

Consider refining your query or consulting a human expert.
```
