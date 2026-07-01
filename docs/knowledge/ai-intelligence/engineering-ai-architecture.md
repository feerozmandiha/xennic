# معماری هوش مصنوعی مهندسی — Engineering AI Architecture

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Architecture Overview — نمای کلی معماری

لایه هوش مصنوعی مهندسی (AI Intelligence Layer) در بالای پایگاه دانش، خط لوله RAG و پایگاه داده برداری قرار گرفته است. این لایه وظیفه استدلال، امتیازدهی اطمینان، و زنجیره‌سازی شواهد را برای پاسخ‌های مهندسی بر عهده دارد.

```
┌──────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│              (Web App / API / Mobile)                        │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                      AI Intelligence Layer                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   AI Service (8002)                    │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐ │  │
│  │  │    Query     │ │  Reasoning   │ │   Confidence   │ │  │
│  │  │ Classifier   │ │    Engine    │ │    Scorer      │ │  │
│  │  └──────┬───────┘ └──────┬───────┘ └───────┬────────┘ │  │
│  │  ┌──────┴───────┐ ┌──────┴───────┐ ┌───────┴────────┐ │  │
│  │  │   Source     │ │  Evidence    │ │  Hallucination │ │  │
│  │  │  Validator   │ │ Chain Builder│ │    Detector    │ │  │
│  │  └──────────────┘ └──────────────┘ └────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   Knowledge Interface Layer                  │
│  ┌─────────────────────┐  ┌───────────────────────────────┐  │
│  │   RAG Pipeline      │  │   Structured Knowledge (DB)   │  │
│  │  ┌───────────────┐  │  │  ┌─────────────────────────┐  │  │
│  │  │  Retrieval    │  │  │  │  Standards / Tariffs    │  │  │
│  │  │  + Rerank     │  │  │  │  Formulas / Catalogs    │  │  │
│  │  └───────┬───────┘  │  │  └─────────────────────────┘  │  │
│  └──────────┼──────────┘  └───────────────────────────────┘  │
│             ▼                                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    Qdrant Vector DB                    │  │
│  │           (Embeddings + Metadata Store)                │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Component Diagram — نمودار مؤلفه‌ها

```
User Query → AI Service → Knowledge Interface → RAG Pipeline → Qdrant
                                    ↓
                        AI Intelligence Layer
                        ├── Source Validator
                        ├── Reasoning Engine
                        ├── Confidence Scorer
                        ├── Evidence Chain Builder
                        └── Hallucination Detector
```

| مؤلفه | مسئولیت | وابستگی‌ها |
|-------|---------|-----------|
| **Query Classifier** | تشخیص حوزه مهندسی سوال و تعیین نوع درخواست | AI Service |
| **Source Validator** | اعتبارسنجی منابع بر اساس سلسله‌مراتب و تایید دسترسی | Knowledge Base |
| **Reasoning Engine** | اجرای استدلال قیاسی، استقرایی، فرضیه‌سازی و مبتنی بر مورد | Evidence Chain |
| **Confidence Scorer** | محاسبه امتیاز اطمینان ترکیبی از ۵ مؤلفه | RAG + Reasoning |
| **Evidence Chain Builder** | ساخت زنجیره شواهد از منبع تا نتیجه | Reasoning Engine |
| **Hallucination Detector** | تشخیص مرز دانش، تطابق واقعی، صحت‌سنجی عددی | Source Validator |

---

## 3. Query Flow — جریان پرسش

یک سوال مهندسی کاربر مراحل زیر را طی می‌کند:

```
Step 1: Query Classification
        ├── تشخیص حوزه (Power / Protection / Grounding / ...)
        ├── تشخیص نوع (Design / Fault / Calculation / Standard)
        └── تعیین پارامترهای جستجو

Step 2: Source Tier Determination
        ├── Tier 1-5 بر اساس نوع سوال و حوزه
        └── فیلتر بر اساس حداقل تایر مجاز

Step 3: RAG Retrieval
        ├── جستجوی برداری در Qdrant
        ├── فیلتر بر اساس تایر منبع
        ├── Re-ranking با cross-encoder
        └── بازگشت K=5 تا K=10 قطعه برتر

Step 4: Reasoning Engine
        ├── انتخاب حالت استدلال مناسب
        ├── اجرای گام‌های استدلال
        └── ساخت زنجیره شواهد میانی

Step 5: Confidence Scoring
        ├── محاسبه امتیاز هر مؤلفه
        ├── وزندهی و ترکیب
        └── تعیین سطح اطمینان نهایی

Step 6: Evidence Chain Construction
        ├── ثبت تمام گره‌های شواهد
        ├── پیوند استدلالی بین گره‌ها
        └── محاسبه امتیاز زنجیره

Step 7: Response Assembly
        ├── تولید پاسخ نهایی
        ├── پیوست زنجیره شواهد
        └── افزودن هشدارها و محدودیت‌ها
```

---

## 4. Integration Points — نقاط یکپارچه‌سازی

| سرویس مبدأ | سرویس مقصد | پروتکل | هدف | فرکانس |
|-----------|-----------|--------|-----|--------|
| AI Service | Qdrant | HTTP/gRPC | جستجوی برداری و بازیابی قطعات | Real-time |
| AI Service | LLM Provider | HTTP | استدلال و تولید پاسخ | Real-time |
| AI Service | Knowledge Base API | REST/JSON | اعتبارسنجی منابع و متادیتا | Real-time |
| AI Service | Engineering Service | HTTP | محاسبات مهندسی و فرمول‌ها | On-demand |
| RAG Pipeline | Qdrant | HTTP | ذخیره و بازیابی embedding | Batch + Real-time |
| Knowledge Interface | PostgreSQL | SQL | دسترسی به دانش ساختاریافته | Real-time |
| Hallucination Detector | LLM Provider | HTTP | صحت‌سنجی پساتولید | Real-time |

---

## 5. Data Flow — جریان داده برای یک نمونه سوال

**Example Query:** "جریان نامی مجاز کابل مسی ۲۵mm² در دمای ۴۰°C چقدر است؟"

```
Step 1: Query Classification
        Input:  "جریان نامی مجاز کابل مسی ۲۵mm² در دمای ۴۰°C چقدر است؟"
        Output: Domain = Cable, Type = Calculation, Parameters = {size: 25mm², material: Cu, temp: 40°C}

Step 2: RAG Retrieval
        Query Vector → Qdrant Search → Top 10 chunks
        Filter: tier IN (1,2), domain = cable
        Retrieved:
          Chunk A: IEC 60364-5-52 §4.2 — جدول جریان مجاز کابل‌ها (Tier 1, Score: 0.94)
          Chunk B: ISIRI 1234 — ضریب تصحیح دما (Tier 1, Score: 0.91)
          Chunk C: Catalog Nexans — مشخصات کابل مسی ۲۵mm² (Tier 3, Score: 0.78)

Step 3: Reasoning
        Deductive Rule:
          IEC 60364-5-52 §4.2 → جریان پایه برای ۲۵mm² Cu = 110A
          ISIRI 1234 → ضریب تصحیح برای ۴۰°C = 0.87
          جریان نهایی = 110 × 0.87 = 95.7A

Step 4: Confidence Scoring
        Source Confidence:   0.95 (Tier 1)
        Retrieval Confidence: 0.92 (average similarity)
        Reasoning Confidence: 0.95 (direct deductive, no ambiguity)
        Temporal Confidence:  1.0 (IEC 60364-5-52:2022 < 5 years)
        Consensus Confidence: 0.75 (2 independent sources)
        Final Score: 0.95 × 0.30 + 0.92 × 0.25 + 0.95 × 0.25 + 1.0 × 0.10 + 0.75 × 0.10 = 0.92

Step 5: Evidence Chain
        Node 1: IEC 60364-5-52 §4.2 — جریان پایه ۱۱۰A (Tier 1)
        Node 2: ISIRI 1234 — ضریب ۰.۸۷ (Tier 1)
        Node 3: نتیجه ۹۵.۷A — حاصل ضرب Node 1 × Node 2
        Chain Confidence: 0.92

Step 6: Response
        Answer: "جریان نامی مجاز کابل مسی ۲۵mm² در دمای ۴۰°C برابر ۹۵.۷ آمپر است."
        Reasoning Path: [مشاهده بالا]
        Evidence: [Node 1, Node 2]
        Confidence: 0.92 — Very High
        Limitations: "این مقدار برای نصب در هوای آزاد و بدون در نظر گرفتن ضریب تصحیح گروه کابل محاسبه شده است."
```
