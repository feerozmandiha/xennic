# چرخه حیات شئ دانش — Knowledge Object Lifecycle

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Lifecycle Stages — مراحل چرخه حیات

### 1. Created — ایجاد
EKO از خروجی خط لوله دریافت (Acquisition Pipeline) نمونه‌سازی می‌شود. در این مرحله، هویت اولیه، ابرداده و مجموعه شواهد به EKO اختصاص می‌یابد. امضای دیجیتال محاسبه و وضعیت انتشار روی `draft` تنظیم می‌شود.

### 2. Validating — در حال اعتبارسنجی
EKO وارد خط لوله اعتبارسنجی می‌شود. شش لایه اعتبارسنجی به صورت ترتیبی اجرا می‌شوند: File, Metadata, Semantic, Engineering, Knowledge, Publication. هر لایه یک امتیاز ۰.۰ تا ۱.۰ تولید می‌کند.

### 3. Validated — تأییدشده
همه دروازه‌های اعتبارسنجی با موفقیت عبور داده شده‌اند. EKO آماده انتشار است اما هنوز برای مصرف AI در دسترس نیست. در این مرحله بازبینی انسانی (human review) می‌تواند انجام شود.

### 4. Published — منتشرشده
EKO برای مصرف توسط سرویس‌های AI در دسترس قرار می‌گیرد. هماهنگ‌کننده انتشار (Publication Coordinator) EKO را در تمام اهداف انتشار ثبت می‌کند: Qdrant (جستجوی برداری)، گراف دانش، API، موتور جستجو.

### 5. Superseded — جایگزین‌شده
نسخه جدیدتری از EKO منتشر شده است. EKO قبلی منسوخ اعلام می‌شود اما همچنان قابل دسترسی است. امتیاز اطمینان آن به ۰.۳ کاهش می‌یابد و در نتایج جستجو اولویت پایین‌تری دارد.

### 6. Archived — بایگانی‌شده
EKO دیگر فعال نیست. برای تطابق با الزامات حسابرسی و ردیابی، رکورد کامل آن حفظ می‌شود اما در جستجوهای AI شرکت داده نمی‌شود.

---

## Stage Transition Diagram — نمودار گذار وضعیت

```
        ┌──────────┐
        │ Created  │
        └────┬─────┘
             │ Pipeline validation begins
             ▼
        ┌──────────┐
        │Validating│
        └────┬─────┘
             │ All 6 layers pass (score ≥ 0.7)
             ▼
        ┌──────────┐
        │ Validated│
        └────┬─────┘
             │ Publication coordinator completes
             ▼
        ┌───────────┐
        │ Published │
        └┬────┬─────┘
         │    │
         │    │ New version published
         │    ▼
         │ ┌────────────┐
         │ │ Superseded │
         │ └─────┬──────┘
         │       │ 2+ years
         │       ▼
         │ ┌──────────┐
         └→│ Archived  │
           └──────────┘
```

---

## Stage Transition Rules — قوانین گذار وضعیت

| از | به | رویداد محرک | شرط |
|----|----|------------|------|
| Created | Validating | Pipeline validation begins | صحت قالب و تطابق checksum |
| Validating | Validated | All 6 validation layers pass | امتیاز ≥ ۰.۷ در همه لایه‌ها |
| Validated | Published | Publication coordinator completes | همه اهداف انتشار تأیید شدند |
| Published | Superseded | New version published | EKO جایگزین با شناسه یکسان منتشر شد |
| Published | Archived | Withdrawn or obsolete | دستور انصراف یا تشخیص فرسودگی سیستم |
| Superseded | Archived | 2+ years since supersession | فاصله زمانی ≥ ۲ سال از جایگزینی |

---

## Quality Gates — دروازه‌های کیفیت

| گذار | دروازه | معیار پذیرش |
|------|--------|-------------|
| → Validating | Format & Checksum | قالب JSON معتبر، SHA-256 مطابقت دارد |
| → Validated | Validation Scores | امتیاز ≥ ۰.۷ در تمام ۶ لایه |
| → Published | Target Confirmation | همه اهداف انتشار (Qdrant, Graph, API, Search) تأیید بازگشتی ارسال کردند |
| → Superseded | Replacement Ready | EKO جدید با eko_id یکسان نسخه بالاتر دارد |
| → Archived | Retention Policy | شرط زمانی ۲ سال از superseded یا تأیید مدیر |

---

## Lifecycle Events — رویدادهای چرخه حیات

| رویداد | محرک | مصرف‌کنندگان |
|--------|------|-------------|
| `EkoCreated` | پایان Pipeline Acquisition | Audit Log, Notification Service, Metrics |
| `EkoValidated` | پایان همه ۶ لایه اعتبارسنجی | Publication Coordinator, Human Review Queue |
| `EkoPublished` | تأیید همه اهداف انتشار | Knowledge API, Qdrant Indexer, Graph Builder, Search Index |
| `EkoSuperseded` | انتشار نسخه جدید | AI Services (cache invalidation), Search Index |
| `EkoArchived` | انقضای سیاست نگهداری | Audit Log, Storage Optimizer |

هر رویداد شامل payload کامل با `eko_id`، `version`، `lifecycle_stage` قبلی و جدید، و `timestamp` است.

---

## Human Review — بازبینی انسانی

در مرحله Validated، EKO می‌تواند وارد صف بازبینی انسانی شود:

| وضعیت بازبینی | اقدام بعدی |
|--------------|------------|
| `pending` | منتظر بازبینی |
| `approved` | ادامه به Published |
| `rejected` | بازگشت به Created با شرح دلیل |
| `needs_revision` | بازگشت به Validating با دستور اصلاح |

بازبینی انسانی اجباری نیست اما برای EKOهای با source_tier ≥ ۳ یا امتیاز اطمینان < ۰.۶ توصیه می‌شود.

---

## Rollback — بازگشت

در صورت تشخیص خطا پس از انتشار:

| سناریو | اقدام |
|--------|-------|
| خطای جزیی | انتشار نسخه PATCH جدید |
| خطای عمده | بازگشت به نسخه پایدار قبلی (activate previous version) |
| خطای بحرانی |撤 انتشار (unpublish) و بازگشت به Validated |

بازگشت همیشه از طریق نسخه‌بندی انجام می‌شود و هیچ EKOای حذف نمی‌گردد.
