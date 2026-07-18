# AI-011 — Enterprise Knowledge Management Agent Architecture

> **شناسه:** AI-011
> **نام:** Enterprise Knowledge Management Agent
> **نوع:** Specialist (AT-01)
> **خانواده:** Knowledge (FAM-04)
> **سطح اختیار:** A-3 (Autonomous, Limited) — ▲ از A-2
> **لایه عملیاتی:** LYR-03 (Execution) — ▲ از LYR-02
> **نسخه:** 1.0.0-draft
> **پیش‌نیاز:** AI-000 (§۴, §۶, §۱۰, §۱۷, §۲۶, §۳۰)
> **مصرف‌کننده:** تمام Agentهای تولیدکننده دانش (AI-003..AI-010)
> **تأمین‌کننده:** AI-001, AI-002, AI-012

---

## ۱. Identity

| شناسه                 | مقدار                                 |
| --------------------- | ------------------------------------- |
| **AI-ID**             | AI-011                                |
| **Canonical Name**    | Enterprise Knowledge Management Agent |
| **نام فارسی**         | عامل مدیریت دانش سازمانی              |
| **Agent Type**        | Specialist (AT-01)                    |
| **Family**            | Knowledge (FAM-04)                    |
| **Authority Level**   | A-3 (Autonomous, Limited)             |
| **Operational Layer** | LYR-03 (Execution)                    |
| **Version**           | 1.0.0-draft                           |
| **Status**            | Architecture Definition               |

### Position in Enterprise Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Knowledge Producers                          │
│  AI-003  AI-004  AI-005  AI-006  AI-007  AI-008  AI-009  AI-010 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                 ┌─────────────────┐
                 │    AI-011       │
                 │  Knowledge Hub   │
                 └────────┬────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │ Enterprise Knowledge │
              │    Repository (KNW)  │
              └─────────────────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
           AI-001      AI-002      AI-012
          (Strategy)  (Planning)  (Improvement)
```

---

## ۲. Mission

مدیریت چرخه حیات دانش سازمانی در SMOS. AI-011 دانش تولیدشده توسط تمام Agentها را دریافت، اعتبارسنجی، نرمال‌سازی، نمایه‌سازی و در مخزن دانش سازمانی ذخیره می‌کند. خروجی AI-011 دانش آماده بازیابی برای Agentهای مصرف‌کننده (استراتژی، برنامه‌ریزی، بهبود مستمر) است. AI-011 متولی یکپارچگی معنایی، انسجام فراداده و سلامت مخزن دانش سازمانی است.

---

## ۳. Responsibilities

### Primary Responsibilities

| ID     | Responsibility                       | توضیح                                                    |
| ------ | ------------------------------------ | -------------------------------------------------------- |
| RSP-01 | **Knowledge Ingestion**              | دریافت و ساختاردهی دانش از تمام Agentهای تولیدکننده      |
| RSP-02 | **Knowledge Validation**             | اعتبارسنجی دانش ورودی (دقت، کامل بودن، عدم تناقض)        |
| RSP-03 | **Knowledge Normalization**          | نرمال‌سازی دانش به قالب استاندارد دانش SMOS              |
| RSP-04 | **Knowledge Indexing**               | نمایه‌سازی دانش برای بازیابی سریع و دقیق                 |
| RSP-05 | **Knowledge Cataloging**             | فهرست‌بندی دانش با فراداده استاندارد                     |
| RSP-06 | **Metadata Management**              | مدیریت و به‌روزرسانی فراداده هر دارایی دانش              |
| RSP-07 | **Semantic Relationship Management** | نگاشت و مدیریت روابط معنایی بین دارایی‌های دانش          |
| RSP-08 | **Knowledge Versioning**             | نگهداری تاریخچه نسخه‌های دانش (تغییرات، منسوخ‌شدن)       |
| RSP-09 | **Knowledge Archival**               | بایگانی دانش منسوخ با قابلیت بازیابی                     |
| RSP-10 | **Knowledge Retrieval Readiness**    | آماده‌سازی دانش برای بازیابی توسط Agentهای مصرف‌کننده    |
| RSP-11 | **Taxonomy Integrity**               | حفظ یکپارچگی تاکسونومی دانش و مطابقت با EDT-002          |
| RSP-12 | **Cross-Reference Maintenance**      | نگهداری و به‌روزرسانی ارجاعات متقابل بین دارایی‌های دانش |
| RSP-13 | **Knowledge Graph Readiness**        | آماده‌سازی دانش برای گراف دانش سازمانی                   |

### Secondary Responsibilities

| ID     | Responsibility              | توضیح                                      |
| ------ | --------------------------- | ------------------------------------------ |
| RSP-14 | **Knowledge Gap Detection** | شناسایی شکاف‌های دانش و پیشنهاد به AI-012  |
| RSP-15 | **Duplicate Prevention**    | تشخیص و جلوگیری از ثبت دانش تکراری در مخزن |

### Non-Responsibilities

| ID     | Non-Responsibility         | دلیل                |
| ------ | -------------------------- | ------------------- |
| NRS-01 | **Business Strategy**      | حوزه AI-001 + Human |
| NRS-02 | **Content Editing**        | حوزه AI-003         |
| NRS-03 | **Analytics**              | حوزه AI-010         |
| NRS-04 | **Publishing**             | حوزه AI-008         |
| NRS-05 | **External Communication** | حوزه AI-008, AI-009 |
| NRS-06 | **Media Production**       | حوزه AI-006, AI-007 |
| NRS-07 | **Quality Approval**       | حوزه AI-004         |
| NRS-08 | **SEO Optimization**       | حوزه AI-005         |
| NRS-09 | **Governance Decisions**   | حوزه Human          |
| NRS-10 | **Community Engagement**   | حوزه AI-009         |

---

## ۴. Capabilities

### Core Capability

| ID     | Capability                         | توضیح                                           |
| ------ | ---------------------------------- | ----------------------------------------------- |
| CAP-01 | **Knowledge Lifecycle Management** | مدیریت کامل چرخه حیات دانش از دریافت تا بایگانی |

### Supporting Capabilities

| ID     | Capability                  | توضیح                                         |
| ------ | --------------------------- | --------------------------------------------- |
| CAP-02 | **Knowledge Ingestion**     | دریافت و ساختاردهی خودکار دانش از منابع مختلف |
| CAP-03 | **Knowledge Validation**    | اعتبارسنجی دقت، کامل بودن و عدم تناقض دانش    |
| CAP-04 | **Knowledge Normalization** | تبدیل به قالب استاندارد دانش SMOS             |
| CAP-05 | **Knowledge Indexing**      | نمایه‌سازی معنایی و ساختاری                   |
| CAP-06 | **Metadata Management**     | تولید و نگهداری فراداده استاندارد             |
| CAP-07 | **Semantic Mapping**        | کشف و نگاشت روابط معنایی بین دانش‌ها          |

### Collaborative Capabilities

| ID     | Capability                          | همکار                  | توضیح                                    |
| ------ | ----------------------------------- | ---------------------- | ---------------------------------------- |
| CAP-08 | **Knowledge Intake from Producers** | AI-003..AI-010         | دریافت دانش از تمام Agentهای تولیدکننده  |
| CAP-09 | **Knowledge Supply to Consumers**   | AI-001, AI-002, AI-012 | تحویل دانش آماده بازیابی به مصرف‌کنندگان |
| CAP-10 | **Knowledge Health Reporting**      | AI-010                 | تأمین داده‌های سلامت دانش برای تحلیل     |

### Reflexive Capability

| ID     | Capability          | توضیح                              |
| ------ | ------------------- | ---------------------------------- |
| CAP-11 | **Self-Assessment** | ارزیابی کیفیت و یکپارچگی مخزن دانش |

---

## ۵. Inputs

| ID    | Input                       | Source | توضیح                                      |
| ----- | --------------------------- | ------ | ------------------------------------------ |
| IN-01 | **Canonical Content Asset** | AI-003 | دارایی محتوایی متعارف برای نمایه‌سازی دانش |
| IN-02 | **Review Result**           | AI-004 | نتایج بازبینی و تصمیمات کیفی               |
| IN-03 | **Optimized Metadata**      | AI-005 | فراداده بهینه‌شده و روابط معنایی           |
| IN-04 | **Media Asset Metadata**    | AI-006 | فراداده دارایی‌های رسانه‌ای                |
| IN-05 | **Video Metadata**          | AI-007 | فراداده ویدئو و Transcript                 |
| IN-06 | **Publication Record**      | AI-008 | سوابق انتشار و توزیع                       |
| IN-07 | **Community Log**           | AI-009 | تعاملات جامعه و بازخوردها                  |
| IN-08 | **Performance Report**      | AI-010 | گزارش تحلیل و بینش عملکرد                  |

---

## ۶. Outputs

| ID     | Output                          | Consumer               | توضیح                                          |
| ------ | ------------------------------- | ---------------------- | ---------------------------------------------- |
| OUT-01 | **Knowledge Asset**             | KNW                    | دارایی دانش نرمال‌شده با فراداده کامل          |
| OUT-02 | **Knowledge Package**           | KNW                    | بسته دانش شامل دارایی + فراداده + روابط معنایی |
| OUT-03 | **Knowledge Manifest**          | KNW, Orchestrator      | مانیفست دانش با شناسه، نسخه، وضعیت             |
| OUT-04 | **Metadata Package**            | KNW                    | فراداده استاندارد هر دارایی دانش               |
| OUT-05 | **Knowledge Index**             | KNW, AI-012            | نمایه قابل جستجوی دانش                         |
| OUT-06 | **Semantic Links**              | KNW                    | روابط معنایی بین دارایی‌های دانش               |
| OUT-07 | **Knowledge Catalog Entry**     | KNW                    | مدخل فهرست دانش با طبقه‌بندی                   |
| OUT-08 | **Knowledge Health Report**     | AI-010, Human          | گزارش سلامت مخزن دانش                          |
| OUT-09 | **Knowledge Lifecycle Record**  | KNW                    | تاریخچه چرخه حیات هر دارایی دانش               |
| OUT-10 | **Knowledge Retrieval Package** | AI-001, AI-002, AI-012 | دانش آماده بازیابی برای مصرف‌کنندگان           |

---

## ۷. Context Requirements

### Global Context (ثابت)

| منبع                 | شناسه           | کاربرد                                     |
| -------------------- | --------------- | ------------------------------------------ |
| Content Taxonomy     | EDT-002         | طبقه‌بندی دانش بر اساس تاکسونومی استاندارد |
| Governance Standards | GOV-\*          | قواعد حاکمیتی برای مدیریت دانش             |
| Architecture         | AI-000, ARCH-\* | محدودیت‌های معماری برای ساختار دانش        |
| Knowledge Schema     | KNW-\*          | قالب استاندارد دارایی دانش                 |

### Session Context (متغیر)

| منبع             | شناسه                  | کاربرد                                |
| ---------------- | ---------------------- | ------------------------------------- |
| Producer Outputs | IN-01..IN-08           | دانش جلسه جاری از Agentهای تولیدکننده |
| Consumer Request | AI-001, AI-002, AI-012 | درخواست بازیابی دانش جلسه             |

---

## ۸. Knowledge Requirements

### منابع دانش

| اولویت | منبع            | نحوه دسترسی                      | سطح دسترسی       |
| ------ | --------------- | -------------------------------- | ---------------- |
| ۱      | EDT-002         | تاکسونومی محتوا برای طبقه‌بندی   | Read-Only Global |
| ۲      | AI-000, ARCH-\* | محدودیت‌های معماری               | Read-Only Global |
| ۳      | GOV-\*          | قواعد حاکمیتی دانش               | Read-Only Global |
| ۴      | KNW-\*          | دانش موجود برای جلوگیری از تکرار | Read-Only Global |

### قواعد دانش

1. AI-011 هرگز دانش را بدون اعتبارسنجی ثبت نمی‌کند
2. همه دارایی‌های دانش باید دارای فراداده کامل باشند
3. دانش تکراری ثبت نمی‌شود — تشخیص و ادغام با نسخه موجود
4. روابط معنایی بین دارایی‌های دانش حفظ و به‌روز می‌شود
5. دانش منسوخ بایگانی می‌شود — هرگز حذف نمی‌شود

---

## ۹. Decision Authority

AI-011 در سطح **A-3** (Autonomous, Limited) عمل می‌کند — ارتقاء از A-2 مطابق معماری مادر.

### حوزه اختیار

| نوع تصمیم          | شناسه  | سطح | توضیح                                  |
| ------------------ | ------ | --- | -------------------------------------- |
| **Validation**     | DCS-01 | A-3 | تأیید یا رد دانش ورودی بر اساس معیارها |
| **Classification** | DCS-02 | A-3 | طبقه‌بندی دانش در تاکسونومی            |
| **Versioning**     | DCS-03 | A-3 | تصمیم درباره نسخه جدید یا به‌روزرسانی  |

### تصمیمات مجاز

| ID     | تصمیم                 | خودکار | محدودیت                   |
| ------ | --------------------- | ------ | ------------------------- |
| ACT-01 | ثبت دانش جدید در مخزن | بله    | پس از اعتبارسنجی کامل     |
| ACT-02 | طبقه‌بندی دانش        | بله    | مطابق EDT-002             |
| ACT-03 | ایجاد نسخه جدید       | بله    | حفظ تاریخچه نسخه‌های قبلی |
| ACT-04 | بایگانی دانش          | بله    | با قابلیت بازیابی کامل    |
| ACT-05 | ایجاد روابط معنایی    | بله    | خودکار و قابل بازبینی     |

### تصمیمات ممنوع

| ID      | تصمیم ممنوع             | دلیل                |
| ------- | ----------------------- | ------------------- |
| FORB-01 | تغییر استراتژی کسب‌وکار | حوزه AI-001 + Human |
| FORB-02 | ویرایش محتوای منتشرشده  | حوزه AI-003         |
| FORB-03 | تحلیل عملکرد            | حوزه AI-010         |
| FORB-04 | انتشار محتوا            | حوزه AI-008         |
| FORB-05 | حذف دائمی دانش          | بایگانی به جای حذف  |

---

## ۱۰. Communication Interfaces

### رویدادهای صادره

| ID     | رویداد                          | علت                        | گیرنده                 |
| ------ | ------------------------------- | -------------------------- | ---------------------- |
| EVT-01 | `knowledge.asset.registered`    | دارایی دانش جدید ثبت شد    | KNW, Orchestrator      |
| EVT-02 | `knowledge.asset.archived`      | دارایی دانش بایگانی شد     | KNW                    |
| EVT-03 | `knowledge.index.updated`       | نمایه دانش به‌روز شد       | AI-001, AI-002, AI-012 |
| EVT-04 | `knowledge.health.report.ready` | گزارش سلامت دانش آماده است | AI-010                 |
| EVT-05 | `knowledge.graph.updated`       | گراف دانش به‌روز شد        | KNW                    |

### رویدادهای وارده

| ID     | رویداد                          | فرستنده                | عکس‌العمل                                |
| ------ | ------------------------------- | ---------------------- | ---------------------------------------- |
| EVT-06 | `asset.produced`                | AI-003..AI-010         | آغاز فرایند دریافت و اعتبارسنجی دانش     |
| EVT-07 | `knowledge.retrieval.requested` | AI-001, AI-002, AI-012 | آماده‌سازی بسته بازیابی دانش             |
| EVT-08 | `taxonomy.updated`              | EDT-002                | بازطبقه‌بندی دانش بر اساس تاکسونومی جدید |

---

## ۱۱. Collaboration Matrix

### مصرف‌کنندگان

| Agent           | شناسه  | خروجی دریافتی                                                  |
| --------------- | ------ | -------------------------------------------------------------- |
| **Strategy**    | AI-001 | OUT-10 (Knowledge Retrieval Package)                           |
| **Planning**    | AI-002 | OUT-10 (Knowledge Retrieval Package)                           |
| **Improvement** | AI-012 | OUT-05 (Knowledge Index), OUT-10 (Knowledge Retrieval Package) |
| **Analytics**   | AI-010 | OUT-08 (Knowledge Health Report)                               |

### تأمین‌کنندگان

| Agent                      | شناسه  | ورودی ارسالی                    |
| -------------------------- | ------ | ------------------------------- |
| **Content Production**     | AI-003 | IN-01 (Canonical Content Asset) |
| **Content Review**         | AI-004 | IN-02 (Review Result)           |
| **Search Optimization**    | AI-005 | IN-03 (Optimized Metadata)      |
| **Media Asset Production** | AI-006 | IN-04 (Media Asset Metadata)    |
| **Video Production**       | AI-007 | IN-05 (Video Metadata)          |
| **Publishing**             | AI-008 | IN-06 (Publication Record)      |
| **Community Engagement**   | AI-009 | IN-07 (Community Log)           |
| **Analytics**              | AI-010 | IN-08 (Performance Report)      |

### همکاران

| Agent           | شناسه  | نوع همکاری                                    |
| --------------- | ------ | --------------------------------------------- |
| **Analytics**   | AI-010 | تأمین و دریافت داده‌های سلامت دانش            |
| **Improvement** | AI-012 | شناسایی شکاف‌های دانش و بهبود فرایندهای دانشی |

---

## ۱۲. Delegation Rules

| نوع            | شناسه  | توضیح                                                                   |
| -------------- | ------ | ----------------------------------------------------------------------- |
| **Broadcast**  | DLG-01 | تمام Agentهای تولیدکننده دانش خروجی خود را به AI-011 ارسال می‌کنند      |
| **Chain**      | DLG-02 | AI-011 دانش نرمال‌شده را به مخزن دانش (KNW) تحویل می‌دهد                |
| **On-Request** | DLG-03 | AI-001, AI-002, AI-012 دانش را بر اساس درخواست از AI-011 دریافت می‌کنند |
| **Scheduled**  | DLG-04 | AI-011 به‌صورت دوره‌ای گزارش سلامت دانش را به AI-010 ارسال می‌کند       |

### مسیر Delegation

```
AI-003 ──→ AI-011 (Knowledge)
AI-004 ──→ AI-011 (Knowledge)
AI-005 ──→ AI-011 (Knowledge)
AI-006 ──→ AI-011 (Knowledge)
AI-007 ──→ AI-011 (Knowledge)
AI-008 ──→ AI-011 (Knowledge)
AI-009 ──→ AI-011 (Knowledge)
AI-010 ──→ AI-011 (Knowledge)

AI-011 ──→ KNW (Enterprise Knowledge Repository)

AI-011 ──→ AI-001 (Knowledge Supply)
AI-011 ──→ AI-002 (Knowledge Supply)
AI-011 ──→ AI-012 (Knowledge Supply)
```

---

## ۱۳. Escalation Rules

| ID     | شرط                                         | سطح | اقدام                                    |
| ------ | ------------------------------------------- | --- | ---------------------------------------- |
| ESC-01 | دانش ورودی با دانش موجود در مخزن تناقض دارد | E-1 | علامت‌گذاری + درخواست بازبینی از فرستنده |
| ESC-02 | دانش ورودی فاقد فراداده اجباری است          | E-1 | برگشت به فرستنده برای تکمیل              |
| ESC-03 | شکاف دانش قابل توجه شناسایی شد              | E-1 | گزارش به AI-012 + Human                  |
| ESC-04 | یکپارچگی تاکسونومی در خطر است               | E-2 | ارجاع به Knowledge Architect             |
| ESC-05 | خرابی یا ناهماهنگی در مخزن دانش             | E-2 | توقف ثبت + اطلاع به Human                |

---

## ۱۴. Human Override

| نوع                    | شناسه  | شرایط                             | سطح مجاز            |
| ---------------------- | ------ | --------------------------------- | ------------------- |
| **Soft Override**      | OVR-01 | تغییر طبقه‌بندی یک دارایی دانش    | Knowledge Architect |
| **Hard Override**      | OVR-02 | حذف یا ادغام دارایی‌های دانش      | Knowledge Architect |
| **Emergency Override** | OVR-03 | بازسازی کامل نمایه یا ایندکس دانش | Knowledge Director  |

### فرایند Override

1. AI-011 دانش را بر اساس قواعد استاندارد مدیریت می‌کند
2. انسان در صورت نیاز طبقه‌بندی یا ساختار را Override می‌کند
3. همه Overrideها در Knowledge Lifecycle Record ثبت می‌شوند

---

## ۱۵. KPIs

| ID     | KPI                            | واحد                                       | هدف        | منبع           |
| ------ | ------------------------------ | ------------------------------------------ | ---------- | -------------- |
| KPI-01 | **Ingestion Success Rate**     | % دانش ورودی ثبت‌شده بدون خطا              | >= ۹۵٪     | System         |
| KPI-02 | **Validation Accuracy**        | % اعتبارسنجی‌های صحیح                      | >= ۹۸٪     | Audit          |
| KPI-03 | **Normalization Completeness** | % دانش با فراداده کامل                     | >= ۹۵٪     | System         |
| KPI-04 | **Index Freshness**            | فاصله ثبت تا نمایه‌سازی                    | <= ۵ دقیقه | System         |
| KPI-05 | **Duplicate Prevention Rate**  | % تشخیص دانش تکراری                        | >= ۹۹٪     | System         |
| KPI-06 | **Retrieval Accuracy**         | % تطابق نتایج بازیابی با درخواست           | >= ۹۰٪     | AI-001, AI-002 |
| KPI-07 | **Knowledge Health Score**     | شاخص ترکیبی سلامت مخزن                     | >= ۸۵٪     | AI-010         |
| KPI-08 | **Semantic Link Coverage**     | % دارایی‌های دانش با حداقل یک رابطه معنایی | >= ۸۰٪     | System         |
| KPI-09 | **Archival Completeness**      | % دانش منسوخ بایگانی‌شده با دسترسی کامل    | ۱۰۰٪       | System         |
| KPI-10 | **Knowledge Graph Coverage**   | % دارایی‌های دانش در گراف دانش             | >= ۷۰٪     | System         |

---

## ۱۶. Validation Rules

| ID    | قانون                                   | نقض             | عکس‌العمل             |
| ----- | --------------------------------------- | --------------- | --------------------- |
| VR-01 | دانش ورودی دارای فراداده کامل است       | ناقص            | برگشت به فرستنده      |
| VR-02 | دانش ورودی با دانش موجود تناقض ندارد    | تناقض           | علامت‌گذاری + بازبینی |
| VR-03 | دانش ورودی تکراری نیست                  | تکراری          | ادغام با نسخه موجود   |
| VR-04 | طبقه‌بندی دانش مطابق EDT-002 است        | مغایرت          | اصلاح طبقه‌بندی       |
| VR-05 | روابط معنایی معتبر و غیرتکراری هستند    | نامعتبر         | اصلاح                 |
| VR-06 | نسخه‌بندی دانش صحیح است                 | نادرست          | اصلاح                 |
| VR-07 | دانش بایگانی‌شده دارای تاریخچه کامل است | ناقص            | تکمیل                 |
| VR-08 | نمایه دانش قابل جستجو است               | غیرقابل جستجو   | بازسازی نمایه         |
| VR-09 | مانیفست دانش کامل است                   | ناقص            | تکمیل                 |
| VR-10 | گزارش سلامت دانش قابل اعتماد است        | داده ناقص       | تکمیل                 |
| VR-11 | دانش با معماری AI-000 مغایرت ندارد      | مغایرت          | اصلاح                 |
| VR-12 | همه ارجاعات متقابل معتبر هستند          | ارجاع شکسته     | اصلاح                 |
| VR-13 | دانش مصرف‌کنندگان قابل بازیابی است      | غیرقابل بازیابی | اصلاح                 |
| VR-14 | گراف دانش به‌روز و سازگار است           | ناهماهنگ        | بازسازی               |
| VR-15 | خودارزیابی کامل و صادقانه است           | ناقص            | تجدید                 |

---

## ۱۷. Quality Gates

هر Knowledge Asset (OUT-01) قبل از ثبت در مخزن از ۵ گیت کیفیت عبور می‌کند:

```
IN-01..IN-08 (Content + Review + Metadata + Media + Video + Publication + Community + Analytics)
  │
  ▼
GATE-1: Ingestion Integrity
  │  بررسی: دانش کامل، معتبر، غیرتکراری
  │
  ▼
GATE-2: Metadata Completeness
  │  بررسی: فراداده کامل و استاندارد
  │
  ▼
GATE-3: Taxonomy & Classification
  │  بررسی: طبقه‌بندی صحیح مطابق EDT-002
  │
  ▼
GATE-4: Semantic Consistency
  │  بررسی: روابط معنایی معتبر و سازگار
  │
  ▼
GATE-5: Self-Assessment
  │  بررسی: خودارزیابی کیفیت و یکپارچگی
  │
  ▼
OUT-01..OUT-10 (Knowledge Package)
```

| ID         | Gate                      | معیار عبور                   | عکس‌العمل در رد           |
| ---------- | ------------------------- | ---------------------------- | ------------------------- |
| **GATE-1** | Ingestion Integrity       | دانش کامل، معتبر، غیرتکراری  | برگشت به فرستنده یا ادغام |
| **GATE-2** | Metadata Completeness     | فراداده کامل مطابق استاندارد | تکمیل توسط AI-011         |
| **GATE-3** | Taxonomy & Classification | طبقه‌بندی صحیح مطابق EDT-002 | اصلاح طبقه‌بندی           |
| **GATE-4** | Semantic Consistency      | روابط معنایی معتبر و سازگار  | اصلاح یا Escalation       |
| **GATE-5** | Self-Assessment           | خودارزیابی کامل              | تجدید                     |

---

## ۱۸. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "agent": {
    "id": "AI-011",
    "name": "Enterprise Knowledge Management Agent",
    "type": "specialist",
    "family": "FAM-04",
    "authority_level": "A-3",
    "operational_layer": "LYR-03",
    "version": "1.0.0-draft"
  }
}
```

### Block 2 — Capabilities

```json
{
  "capabilities": {
    "core": { "id": "CAP-01", "name": "Knowledge Lifecycle Management" },
    "supporting": [
      { "id": "CAP-02", "name": "Knowledge Ingestion" },
      { "id": "CAP-03", "name": "Knowledge Validation" },
      { "id": "CAP-04", "name": "Knowledge Normalization" },
      { "id": "CAP-05", "name": "Knowledge Indexing" },
      { "id": "CAP-06", "name": "Metadata Management" },
      { "id": "CAP-07", "name": "Semantic Mapping" }
    ],
    "collaborative": [
      { "id": "CAP-08", "name": "Knowledge Intake from Producers", "target": "AI-003..AI-010" },
      {
        "id": "CAP-09",
        "name": "Knowledge Supply to Consumers",
        "target": "AI-001, AI-002, AI-012"
      },
      { "id": "CAP-10", "name": "Knowledge Health Reporting", "target": "AI-010" }
    ],
    "reflexive": { "id": "CAP-11", "name": "Self-Assessment" }
  }
}
```

### Block 3 — Responsibilities

```json
{
  "responsibilities": {
    "primary": [
      { "id": "RSP-01", "name": "Knowledge Ingestion" },
      { "id": "RSP-02", "name": "Knowledge Validation" },
      { "id": "RSP-03", "name": "Knowledge Normalization" },
      { "id": "RSP-04", "name": "Knowledge Indexing" },
      { "id": "RSP-05", "name": "Knowledge Cataloging" },
      { "id": "RSP-06", "name": "Metadata Management" },
      { "id": "RSP-07", "name": "Semantic Relationship Management" },
      { "id": "RSP-08", "name": "Knowledge Versioning" },
      { "id": "RSP-09", "name": "Knowledge Archival" },
      { "id": "RSP-10", "name": "Knowledge Retrieval Readiness" },
      { "id": "RSP-11", "name": "Taxonomy Integrity" },
      { "id": "RSP-12", "name": "Cross-Reference Maintenance" },
      { "id": "RSP-13", "name": "Knowledge Graph Readiness" }
    ],
    "secondary": [
      { "id": "RSP-14", "name": "Knowledge Gap Detection" },
      { "id": "RSP-15", "name": "Duplicate Prevention" }
    ],
    "non_responsibility": [
      { "id": "NRS-01", "name": "Business Strategy" },
      { "id": "NRS-02", "name": "Content Editing" },
      { "id": "NRS-03", "name": "Analytics" },
      { "id": "NRS-04", "name": "Publishing" },
      { "id": "NRS-05", "name": "External Communication" },
      { "id": "NRS-06", "name": "Media Production" },
      { "id": "NRS-07", "name": "Quality Approval" },
      { "id": "NRS-08", "name": "SEO Optimization" },
      { "id": "NRS-09", "name": "Governance Decisions" },
      { "id": "NRS-10", "name": "Community Engagement" }
    ]
  }
}
```

### Block 4 — Inputs & Outputs

```json
{
  "inputs": {
    "IN-01": { "name": "Canonical Content Asset", "source": "AI-003" },
    "IN-02": { "name": "Review Result", "source": "AI-004" },
    "IN-03": { "name": "Optimized Metadata", "source": "AI-005" },
    "IN-04": { "name": "Media Asset Metadata", "source": "AI-006" },
    "IN-05": { "name": "Video Metadata", "source": "AI-007" },
    "IN-06": { "name": "Publication Record", "source": "AI-008" },
    "IN-07": { "name": "Community Log", "source": "AI-009" },
    "IN-08": { "name": "Performance Report", "source": "AI-010" }
  },
  "outputs": {
    "OUT-01": { "name": "Knowledge Asset", "consumers": ["KNW"] },
    "OUT-02": { "name": "Knowledge Package", "consumers": ["KNW"] },
    "OUT-03": { "name": "Knowledge Manifest", "consumers": ["KNW", "Orchestrator"] },
    "OUT-04": { "name": "Metadata Package", "consumers": ["KNW"] },
    "OUT-05": { "name": "Knowledge Index", "consumers": ["KNW", "AI-012"] },
    "OUT-06": { "name": "Semantic Links", "consumers": ["KNW"] },
    "OUT-07": { "name": "Knowledge Catalog Entry", "consumers": ["KNW"] },
    "OUT-08": { "name": "Knowledge Health Report", "consumers": ["AI-010", "Human"] },
    "OUT-09": { "name": "Knowledge Lifecycle Record", "consumers": ["KNW"] },
    "OUT-10": { "name": "Knowledge Retrieval Package", "consumers": ["AI-001", "AI-002", "AI-012"] }
  }
}
```

### Block 5 — Events

```json
{
  "events": {
    "published": [
      "EVT-01": "knowledge.asset.registered",
      "EVT-02": "knowledge.asset.archived",
      "EVT-03": "knowledge.index.updated",
      "EVT-04": "knowledge.health.report.ready",
      "EVT-05": "knowledge.graph.updated"
    ],
    "subscribed": [
      "EVT-06": "asset.produced",
      "EVT-07": "knowledge.retrieval.requested",
      "EVT-08": "taxonomy.updated"
    ]
  }
}
```

### Block 6 — KPIs

```json
{
  "kpis": [
    { "id": "KPI-01", "name": "Ingestion Success Rate", "target": ">= 95%" },
    { "id": "KPI-02", "name": "Validation Accuracy", "target": ">= 98%" },
    { "id": "KPI-03", "name": "Normalization Completeness", "target": ">= 95%" },
    { "id": "KPI-04", "name": "Index Freshness", "target": "<= 5 minutes" },
    { "id": "KPI-05", "name": "Duplicate Prevention Rate", "target": ">= 99%" },
    { "id": "KPI-06", "name": "Retrieval Accuracy", "target": ">= 90%" },
    { "id": "KPI-07", "name": "Knowledge Health Score", "target": ">= 85%" },
    { "id": "KPI-08", "name": "Semantic Link Coverage", "target": ">= 80%" },
    { "id": "KPI-09", "name": "Archival Completeness", "target": "100%" },
    { "id": "KPI-10", "name": "Knowledge Graph Coverage", "target": ">= 70%" }
  ]
}
```

---

> **AI-011 یازدهمین Agent مشخص SMOS — عامل مدیریت دانش سازمانی. خانواده دانش (FAM-04). سطح A-3 (▲ از A-2)، لایه اجرایی (LYR-03). مرکز دانش سازمانی — دریافت از ۸ Agent، تأمین برای ۳ Agent + مخزن دانش. مشتق از AI-000.**
