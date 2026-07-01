# مشخصات شئ دانش مهندسی — Engineering Knowledge Object Specification

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Overview — نمای کلی

Engineering Knowledge Object (EKO) واحد اصلی دانش در پلتفرم Xennic است. هر EKO نمایش ساختاریافته یک قطعه دانش مهندسی است که توسط K2.0 Acquisition Runtime تولید شده و توسط K2.5 Reasoning Runtime مصرف می‌شود. EKOها برای استدلال خودکار، بازیابی هوشمند و قابلیت ردیابی کامل طراحی شده‌اند.

## EKO Structure — ساختار شئ دانش

### 1. Identity — هویت

| فیلد | نوع | توضیح | مثال |
|------|-----|-------|------|
| `eko_id` | UUID | شناسه یکتای جهانی | XEN-EKO-1405-000042 |
| `eko_type` | Enum | نوع دانش | standard, regulation, tariff, catalog, calculation, case_study, article |
| `version` | SemVer | نسخه معنایی | 1.0.0 |
| `created_at` | ISO8601 | زمان ایجاد | 2026-03-15T09:30:00Z |
| `updated_at` | ISO8601 | آخرین به‌روزرسانی | 2026-06-20T14:00:00Z |

### 2. Metadata — ابرداده

شامل تمام لایه‌های ابرداده مطابق **metadata-schema.md**:

- **Core Metadata:** عنوان، توضیح، زبان، کلمات کلیدی
- **Electrical Engineering Metadata:** ولتاژ، جریان، توان، استاندارد مرتبط، دسته‌بندی فنی
- **AI Intelligence Metadata:** امتیاز اطمینان، تایر منبع، تاریخ انقضا
- **RAG Metadata:** پارامترهای تکه‌بندی، مدل embedding، فاصله语义
- **Traceability Metadata:** خط لوله دریافت، تاریخ و زمان دریافت، نسخه pipeline

### 3. Source Provenance — منشأ منبع

| فیلد | نوع | توضیح |
|------|-----|-------|
| `source_document_id` | UUID | ارجاع به سند اصلی در پایگاه دانش |
| `source_tier` | Integer (1-5) | تایر منبع بر اساس سلسله‌مراتب K1.7 |
| `ingestion_pipeline` | String | نسخه خط لوله دریافت ایجادکننده EKO |
| `checksum` | SHA-256 | هش محتوای منبع |
| `original_url` | String (nullable) | آدرس دریافت منبع |

### 4. Evidence Set — مجموعه شواهد

آرایه‌ای از گره‌های شواهد مطابق **evidence-model.md**:

| فیلد | نوع | توضیح |
|------|-----|-------|
| `evidence_id` | UUID | شناسه یکتای گره شواهد |
| `content` | Text | متن یا داده شواهد |
| `source_reference` | String | ارجاع به بخش مشخصی از منبع |
| `confidence` | Float (0.0-1.0) | امتیاز اطمینان این شواهد |
| `tier` | Integer (1-5) | تایر این شواهد |

**Aggregated Evidence Quality Score:** میانگین وزنی امتیاز اطمینان همه شواهد.

### 5. Concept References — ارجاعات مفهومی

| فیلد | نوع | توضیح |
|------|-----|-------|
| `concept_id` | UUID | شناسه مفهوم در دانش‌نامه |
| `mapping_type` | Enum | direct, related, inferred |
| `confidence` | Float (0.0-1.0) | اطمینان از ارتباط مفهومی |

### 6. Entity References — ارجاعات نهادی

| فیلد | نوع | توضیح |
|------|-----|-------|
| `entity_id` | UUID | شناسه نهاد (تجهیز، قطعه، پروژه) |
| `entity_type` | Enum | equipment, component, project, standard, manufacturer |
| `relationship_to_document` | String | شرح ارتباط نهاد با سند |

### 7. Relationship References — ارجاعات رابطه

| فیلد | نوع | توضیح |
|------|-----|-------|
| `source_entity` | UUID | نهاد مبدأ |
| `relationship_type` | String | نوع رابطه (feeds, supplies, depends_on, conforms_to) |
| `target_entity` | UUID | نهاد مقصد |
| `confidence` | Float (0.0-1.0) | اطمینان از وجود رابطه |

### 8. Chunk References — ارجاعات تکه

| فیلد | نوع | توضیح |
|------|-----|-------|
| `chunk_id` | UUID | شناسه تکه |
| `position` | Integer | ترتیب تکه در سند اصلی |
| `token_count` | Integer | تعداد توکن‌ها |
| `embedding_id` | UUID | شناسه برداری متناظر |

### 9. Embedding References — ارجاعات برداری

| فیلد | نوع | توضیح |
|------|-----|-------|
| `embedding_id` | UUID | شناسه بردار |
| `model_name` | String | نام مدل embedding |
| `model_version` | String | نسخه مدل |
| `dimension` | Integer | ابعاد بردار |
| `vector` | Float[] | مقادیر برداری (در API حذف می‌شود) |

### 10. Validation Status — وضعیت اعتبارسنجی

| لایه | شرح | حداقل امتیاز قبولی |
|------|-----|-------------------|
| File | صحت قالب و ساختار فایل | ۱.۰ |
| Metadata | کامل بودن ابرداده‌های الزامی | ۰.۹ |
| Semantic | انسجام معنایی محتوا | ۰.۸ |
| Engineering | تطابق با اصول مهندسی برق | ۰.۸ |
| Knowledge | سازگاری با دانش‌نامه | ۰.۷ |
| Publication | آمادگی برای انتشار | ۱.۰ |

**Human Review Status:** `pending` / `approved` / `rejected` / `needs_revision`

### 11. Reasoning References — ارجاعات استدلال (تکمیل توسط K2.5)

| فیلد | نوع | توضیح |
|------|-----|-------|
| `reasoning_id` | UUID | شناسه خروجی استدلال |
| `reasoning_type` | Enum | question_answering, verification, calculation, comparison |
| `timestamp` | ISO8601 | زمان استدلال |
| `confidence_impact` | Float | تغییر امتیاز اطمینان در اثر استدلال |

### 12. Confidence Score — امتیاز اطمینان

مطابق **confidence-engine.md**:

| مؤلفه | وزن |
|-------|------|
| Source Confidence | ۳۰٪ |
| Retrieval Confidence | ۲۵٪ |
| Reasoning Confidence | ۲۵٪ |
| Temporal Confidence | ۱۰٪ |
| Consensus Confidence | ۱۰٪ |

**Overall Confidence:** Float (0.0-1.0)

### 13. Version History — تاریخچه نسخه

| فیلد | نوع | توضیح |
|------|-----|-------|
| `version` | SemVer | شماره نسخه |
| `timestamp` | ISO8601 | زمان انتشار نسخه |
| `change_description` | String | شرح تغییرات |
| `author` | String | عامل ایجاد تغییر |

### 14. Audit Trail — مسیر حسابرسی

| فیلد | نوع | توضیح |
|------|-----|-------|
| `timestamp` | ISO8601 | زمان رویداد |
| `actor` | String | عامل (pipeline, user, system) |
| `action` | String | اقدام انجام شده |
| `details` | JSON | جزئیات تکمیلی |

### 15. Digital Signature — امضای دیجیتال

SHA-256 از نمایش JSON کامل EKO. این امضا یکپارچگی EKO را در طول چرخه حیات تضمین می‌کند و امکان تأیید توسط هر مصرف‌کننده‌ای را فراهم می‌آورد.

### 16. Publication Status — وضعیت انتشار

| فیلد | نوع | مقادیر مجاز |
|------|-----|-------------|
| `lifecycle_stage` | Enum | draft, reviewed, approved, published, superseded, archived |
| `publication_targets` | Map | کلید: هدف (Qdrant, Graph, API, Search)، مقدار: timestamp انتشار |

---

## Required vs Optional Fields — فیلدهای الزامی و اختیاری

| بخش | فیلدهای الزامی | فیلدهای اختیاری | رفتار در صورت فقدان |
|-----|----------------|-----------------|---------------------|
| Identity | eko_id, eko_type, version, created_at | updated_at | updated_at = created_at |
| Metadata | core, electrical_engineering | ai_intelligence, rag, traceability | مقدار پیش‌فرض خالی |
| Source Provenance | source_document_id, source_tier, checksum | original_url | null |
| Evidence Set | حداقل یک گره | — | انتشار مجاز نیست |
| Concept References | — | کل بخش | آرایه خالی |
| Entity References | — | کل بخش | آرایه خالی |
| Chunk References | حداقل یک تکه (برای published) | — | انتشار مجاز نیست |
| Confidence Score | overall | breakdown | breakdown از مقادیر پیش‌فرض |
| Validation Status | file, metadata | سایر لایه‌ها | ۰.۰ برای لایه‌های缺失 |
| Digital Signature | hash | — | در زمان انتشار محاسبه می‌شود |
| Publication Status | lifecycle_stage | publication_targets | draft |

---

## Validation Rules — قوانین اعتبارسنجی

| قانون | شرح |
|-------|------|
| R1 | همه فیلدهای الزامی باید غیرنال باشند |
| R2 | برای EKOهای منتشرشده، تعداد شواهد ≥ ۱ |
| R3 | برای EKOهای منتشرشده، امتیاز اطمینان ≥ ۰.۴ |
| R4 | برای EKOهای منتشرشده، حداقل یک تکه وجود داشته باشد |
| R5 | SHA-256 محاسبه‌شده باید با مقدار ذخیره‌شده مطابقت داشته باشد |
| R6 | source_tier باید بین ۱ تا ۵ باشد |
| R7 | confidence_score باید بین ۰.۰ تا ۱.۰ باشد |

---

## Serialization Strategy — استراتژی سریال‌سازی

| هدف | قالب | توضیح |
|-----|------|-------|
| API Transfer | JSON | قالب اصلی برای انتقال بین سرویس‌ها |
| Storage Efficiency | Protocol Buffers | قالب داخلی برای ذخیره‌سازی بهینه |
| Schema Versioning | `ekp_schema_version` | فیلد versioned schema برای مهاجرت‌های آینده |

---

## Graph Mapping — نگاشت گراف

| مؤلفه EKO | گره/لبه گراف | برچسب |
|-----------|-------------|-------|
| EKO | Node | `KnowledgeObject` |
| Metadata sections | Node Properties | — |
| Concept References | Edge | → `Concept` |
| Entity References | Edge | → `Entity` |
| Evidence | Edge | → `Evidence` |
| Chunks | Edge | → `Chunk` |

این نگاشت امکان جستجوی گرافی پیشرفته (Graph RAG) و استدلال چندمسیره را فراهم می‌کند.

---

## AI Consumption Rules — قوانین مصرف هوش مصنوعی

| قانون | شرح |
|-------|------|
| C1 | سرویس‌های AI، EKOها را از طریق Knowledge API یا Qdrant بازیابی می‌کنند |
| C2 | موتور استدلال (K2.5) از EKO به عنوان شواهد اصلی استفاده می‌کند |
| C3 | امتیاز اطمینان EKO وزن آن را در استدلال تعیین می‌کند |
| C4 | source_tier اولویت را در حل تعارض بین EKOهای متضاد مشخص می‌کند |
| C5 | منسوخ‌شدن (superseded) باعث کاهش امتیاز به ۰.۳ می‌شود |
