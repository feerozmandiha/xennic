# KNW-206 — Enterprise Knowledge Resolution Architecture

> **شناسه:** KNW-206
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-07-06
> **مسئول:** معمار دانش سازمانی
> **وابستگی:** KNW-000, KNW-001, KNW-201, KNW-202, KNW-203, KNW-204, KNW-205, KNW-301..308, KNW-401..405, KNW-501..510, KNW-701, KNW-801
> **مخاطب:** human, ai-agent, knowledge-engineer, system-architect

---

## ۱. Purpose

KNW-206 معماری تفکیک دانش سازمانی SMOS را تعریف می‌کند. تفکیک (Resolution) فرآیند تعیین پاسخ معتبر (Canonical Answer) در شرایطی است که چندین منبع دانش، هویت، تفسیر معنایی، نسخه، ارجاع، مالکیت، رابطه یا دامنه فدرال شده وجود دارد. این سند معماری چگونگی تفکیک دانش سازمانی را از نظر مفهومی و ساختاری تعریف می‌کند — نه نحوه اجرای فنی آن.

**SSOT**: تنها منبع معتبر برای معماری تفکیک دانش سازمانی SMOS.

---

## ۲. Scope

این سند محدوده زیر را پوشش می‌دهد:

- تعریف اصول و فلسفه تفکیک دانش
- مدل لایه‌ای معماری تفکیک
- دامنه‌ها، مفاهیم و موجودیت‌های تفکیک
- قابلیت‌ها و کارکردهای تفکیک
- مدل مرحله‌ای، مدل وضعیت و مدل‌های تفکیک
- روابط، یکپارچگی و سازگاری تفکیک
- حکمرانی، معیارها، محدودیت‌ها و گیت‌های کیفیت
- ۶ بلوک Machine Readable JSON
- ۳ JSON Schema (Draft-07)

**خارج از محدوده**:

- پیاده‌سازی فنی تفکیک
- الگوریتم‌های حل تعارض یا استنتاج
- موتورهای قانون یا موتورهای استنتاج
- APIها، زبان‌های پرس‌وجو یا پروتکل‌ها
- Workflow یا اتوماسیون
- پایگاه داده یا Vendor خاص
- هرگونه پیاده‌سازی اجرایی یا زمان اجرا

---

## ۳. Resolution Principles

تفکیک دانش SMOS بر ۸ اصل زیر استوار است:

| ID     | اصل                            | توضیح                                                |
| ------ | ------------------------------ | ---------------------------------------------------- |
| KRP-01 | **Canonical First**            | هر تفکیک باید به یک پاسخ معتبر (Canonical) منتهی شود |
| KRP-02 | **Evidence-Based**             | تفکیک باید مبتنی بر شواهد مستند از منابع معتبر باشد  |
| KRP-03 | **Traceability**               | هر تفکیک باید قابل ردیابی تا منابع مبدأ باشد         |
| KRP-04 | **Minimal Disruption**         | تفکیک نباید دانش معتبر موجود را تضعیف کند            |
| KRP-05 | **Authority Respect**          | تفکیک باید سطوح اختیار و مالکیت را محترم بشمارد      |
| KRP-06 | **Graduated Escalation**       | تعارضات unresolvable باید به سطح بالاتر ارجاع شوند   |
| KRP-07 | **Immutability of Resolution** | پس از ثبت، پاسخ معتبر تا بازبینی بعدی تغییر نمی‌کند  |
| KRP-08 | **Consistency Preservation**   | تفکیک نباید سازگاری دانش موجود را نقض کند            |

---

## ۴. Resolution Philosophy

تفکیک دانش SMOS بر اساس فلسفه "معتبرسازی از طریق شواهد" (Validation Through Evidence) طراحی شده است. در یک سیستم دانش سازمانی، وجود چندین منبع، تفسیر یا نسخه امری طبیعی است. تفکیک تعیین می‌کند کدام یک از این گزینه‌های موجود معتبر (Canonical) است.

تفکیک دانش SMOS:

- **جایگزین دانش موجود نیست** — یک پاسخ معتبر را در کنار پاسخ‌های دیگر ثبت می‌کند
- **مبتنی بر شواهد است** — هر تفکیک باید با منابع معتبر پشتیبانی شود
- **ردیابی‌پذیر است** — مسیر تفکیک از منابع تا پاسخ معتبر ثبت می‌شود
- **سلسله‌مراتبی است** — تعارضات unresolvable به سطوح بالاتر اختیار ارجاع می‌شوند
- **تغییرناپذیر است** — پاسخ معتبر پس از ثبت تا بازبینی رسمی تغییر نمی‌کند

---

## ۵. Architecture — Layered Model

معماری تفکیک دانش SMOS در ۵ لایه تعریف می‌شود:

| لایه       | نام                      | توضیح                                               |
| ---------- | ------------------------ | --------------------------------------------------- |
| LYR-RES-01 | **Identification Layer** | شناسایی منابع، هویت‌ها و گزینه‌های موجود برای تفکیک |
| LYR-RES-02 | **Evidence Layer**       | جمع‌آوری، ارزیابی و وزندهی شواهد از منابع مختلف     |
| LYR-RES-03 | **Correlation Layer**    | همبستگی و تطبیق شواهد بین منابع مختلف               |
| LYR-RES-04 | **Decision Layer**       | انتخاب پاسخ معتبر بر اساس شواهد و قواعد تفکیک       |
| LYR-RES-05 | **Registration Layer**   | ثبت و انتشار پاسخ معتبر در سیستم دانش               |

---

## ۶. Resolution Domains

تفکیک دانش SMOS شامل ۸ دامنه اصلی است:

| ID     | نام                         | توضیح                                                   | لایه       |
| ------ | --------------------------- | ------------------------------------------------------- | ---------- |
| KRD-01 | **Identity Resolution**     | تفکیک هویت موجودیت — کدام موجودیت مقصد ارجاع است        | LYR-RES-01 |
| KRD-02 | **Semantic Resolution**     | تفکیک معنایی — کدام معنا در بافت فعلی معتبر است         | LYR-RES-02 |
| KRD-03 | **Reference Resolution**    | تفکیک ارجاع — کدام pointer به موجودیت صحیح منتهی می‌شود | LYR-RES-01 |
| KRD-04 | **Relationship Resolution** | تفکیک رابطه — نوع و جهت رابطه بین دو موجودیت چیست       | LYR-RES-03 |
| KRD-05 | **Ownership Resolution**    | تفکیک مالکیت — چه کسی مالک یا متولی دانش است            | LYR-RES-04 |
| KRD-06 | **Version Resolution**      | تفکیک نسخه — کدام نسخه از دانش معتبر است                | LYR-RES-03 |
| KRD-07 | **Federation Resolution**   | تفکیک فدرال — تفکیک هویت در دامنه‌های متصل              | LYR-RES-02 |
| KRD-08 | **Conflict Resolution**     | تفکیک تعارض — حل داده‌های متناقض از منابع مختلف         | LYR-RES-04 |

---

## ۷. Resolution Concepts

۲۰ مفهوم بنیادین تفکیک دانش:

| ID      | مفهوم                      | توضیح                                             |
| ------- | -------------------------- | ------------------------------------------------- |
| KRC-001 | **Resolution**             | فرآیند تعیین پاسخ معتبر در شرایط چندگانه          |
| KRC-002 | **Canonical Answer**       | پاسخ معتبر نهایی پس از تفکیک                      |
| KRC-003 | **Candidate**              | یکی از گزینه‌های موجود برای تفکیک                 |
| KRC-004 | **Evidence**               | شاهد یا دلیلی که از یک کاندید پشتیبانی می‌کند     |
| KRC-005 | **Resolution Source**      | منبع دانشی که شواهد از آن استخراج می‌شود          |
| KRC-006 | **Conflict**               | وضعیتی که دو یا چند کاندید با هم ناسازگار هستند   |
| KRC-007 | **Ambiguity**              | وضعیتی که یک ارجاع به چند موجودیت ممکن اشاره دارد |
| KRC-008 | **Resolution Authority**   | نهاد یا سطح اختیار مسئول تفکیک                    |
| KRC-009 | **Resolution Scope**       | محدوده تفکیک — کدام دامنه دانشی تحت پوشش است      |
| KRC-010 | **Resolution Context**     | بافت تفکیک — شرایط و محدودیت‌های فعلی             |
| KRC-011 | **Evidence Weight**        | وزن شاهد — درجه اعتبار و ارتباط شاهد              |
| KRC-012 | **Candidate Confidence**   | اطمینان به کاندید بر اساس شواهد جمع‌آوری‌شده      |
| KRC-013 | **Resolution Decision**    | تصمیم نهایی تفکیک — انتخاب کاندید معتبر           |
| KRC-014 | **Resolution Trail**       | رد کامل تفکیک — از درخواست تا تصمیم نهایی         |
| KRC-015 | **Escalation Path**        | مسیر ارجاع تعارضات unresolvable به سطوح بالاتر    |
| KRC-016 | **Resolution Policy**      | سیاست تفکیک — قواعد حاکم بر فرآیند تفکیک          |
| KRC-017 | **Resolution Registry**    | ثبت‌مرکزی تمام تفکیک‌های انجام‌شده                |
| KRC-018 | **Resolution Fingerprint** | اثر انگشت تفکیک — شناسه یکتای هر تفکیک            |
| KRC-019 | **Resolution Status**      | وضعیت فعلی تفکیک                                  |
| KRC-020 | **Resolution Validity**    | اعتبار تفکیک — مدت زمان اعتبار پاسخ معتبر         |

---

## ۸. Resolution Entities

۱۲ موجودیت اصلی تفکیک دانش:

| ID      | موجودیت                | توضیح                             | دامنه  |
| ------- | ---------------------- | --------------------------------- | ------ |
| KRE-001 | **ResolutionRequest**  | درخواست تفکیک                     | KRD-01 |
| KRE-002 | **CandidateSet**       | مجموعه کاندیدهای موجود برای تفکیک | KRD-01 |
| KRE-003 | **Candidate**          | یک گزینه تفکیک                    | KRD-01 |
| KRE-004 | **Evidence**           | شاهد پشتیبان یک کاندید            | KRD-02 |
| KRE-005 | **EvidenceSource**     | منبع شاهد                         | KRD-02 |
| KRE-006 | **Conflict**           | تعارض بین دو یا چند کاندید        | KRD-08 |
| KRE-007 | **ResolutionDecision** | تصمیم نهایی تفکیک                 | KRD-04 |
| KRE-008 | **CanonicalAnswer**    | پاسخ معتبر ثبت‌شده                | KRD-05 |
| KRE-009 | **ResolutionTrail**    | رد کامل تفکیک                     | KRD-05 |
| KRE-010 | **ResolutionPolicy**   | سیاست تفکیک                       | KRD-05 |
| KRE-011 | **Escalation**         | ارجاع تعارض به سطح بالاتر         | KRD-08 |
| KRE-012 | **ResolutionRegistry** | ثبت‌مرکزی تفکیک‌ها                | KRD-05 |

---

## ۹. Resolution Capabilities

۱۴ قابلیت اصلی تفکیک دانش:

| ID        | قابلیت                           | توضیح                               | لایه       |
| --------- | -------------------------------- | ----------------------------------- | ---------- |
| KRCAP-001 | **Request Capture**              | دریافت و ثبت درخواست تفکیک          | LYR-RES-01 |
| KRCAP-002 | **Candidate Identification**     | شناسایی کاندیدهای موجود برای تفکیک  | LYR-RES-01 |
| KRCAP-003 | **Source Discovery**             | کشف منابع معتبر برای جمع‌آوری شواهد | LYR-RES-02 |
| KRCAP-004 | **Evidence Collection**          | جمع‌آوری شواهد از منابع شناسایی‌شده | LYR-RES-02 |
| KRCAP-005 | **Evidence Evaluation**          | ارزیابی اعتبار و وزن شواهد          | LYR-RES-02 |
| KRCAP-006 | **Cross-Source Correlation**     | همبستگی شواهد بین منابع مختلف       | LYR-RES-03 |
| KRCAP-007 | **Conflict Detection**           | شناسایی تعارض بین کاندیدها          | LYR-RES-03 |
| KRCAP-008 | **Authority Resolution**         | تفکیک بر اساس سطوح اختیار           | LYR-RES-04 |
| KRCAP-009 | **Decision Execution**           | اجرای تصمیم تفکیک                   | LYR-RES-04 |
| KRCAP-010 | **Escalation Management**        | مدیریت ارجاع تعارضات unresolvable   | LYR-RES-04 |
| KRCAP-011 | **Canonical Registration**       | ثبت پاسخ معتبر در سیستم دانش        | LYR-RES-05 |
| KRCAP-012 | **Resolution Validation**        | اعتبارسنجی تفکیک انجام‌شده          | LYR-RES-05 |
| KRCAP-013 | **Resolution Audit**             | ثبت و ردیابی تمام تفکیک‌ها          | LYR-RES-05 |
| KRCAP-014 | **Resolution Policy Management** | مدیریت سیاست‌های تفکیک              | LYR-RES-05 |

---

## ۱۰. Resolution Functions

۱۴ کارکرد تفکیک دانش:

| ID     | کارکرد               | قابلیت مرتبط | دامنه  |
| ------ | -------------------- | ------------ | ------ |
| KRF-01 | Capture Request      | KRCAP-001    | KRD-01 |
| KRF-02 | Identify Candidates  | KRCAP-002    | KRD-01 |
| KRF-03 | Discover Sources     | KRCAP-003    | KRD-02 |
| KRF-04 | Collect Evidence     | KRCAP-004    | KRD-02 |
| KRF-05 | Evaluate Evidence    | KRCAP-005    | KRD-02 |
| KRF-06 | Correlate Sources    | KRCAP-006    | KRD-03 |
| KRF-07 | Detect Conflict      | KRCAP-007    | KRD-03 |
| KRF-08 | Resolve By Authority | KRCAP-008    | KRD-04 |
| KRF-09 | Execute Decision     | KRCAP-009    | KRD-04 |
| KRF-10 | Manage Escalation    | KRCAP-010    | KRD-04 |
| KRF-11 | Register Canonical   | KRCAP-011    | KRD-05 |
| KRF-12 | Validate Resolution  | KRCAP-012    | KRD-05 |
| KRF-13 | Audit Resolution     | KRCAP-013    | KRD-05 |
| KRF-14 | Manage Policy        | KRCAP-014    | KRD-05 |

---

## ۱۱. Resolution Taxonomy

تاکسونومی تفکیک دانش در سه بعد اصلی طبقه‌بندی می‌شود:

### بعد ۱: نوع تفکیک

| نوع               | توضیح                                                     | مثال                       |
| ----------------- | --------------------------------------------------------- | -------------------------- |
| **Direct**        | تفکیک مستقیم — یک منبع معتبر وجود دارد                    | هویت موجودیت در دامنه مبدأ |
| **Consensus**     | تفکیک با اجماع — چند منبع توافق دارند                     | نام رسمی یک مفهوم          |
| **Priority**      | تفکیک با اولویت — منبع با بالاترین اولویت انتخاب می‌شود   | نسخه رسمی سند              |
| **Authoritative** | تفکیک با مرجعیت — منبع دارای اختیار بالاتر انتخاب می‌شود  | حکم حکمرانی                |
| **Composite**     | تفکیک ترکیبی — از چند منبع برای نتیجه واحد استفاده می‌شود | تعریف جامع یک مفهوم        |

### بعد ۲: منبع شواهد

| نوع                    | توضیح                          |
| ---------------------- | ------------------------------ |
| **Knowledge Document** | سند دانشی KNW-NNN              |
| **Platform Document**  | کتابچه پلتفرم PLAT-NNN         |
| **Agent Output**       | خروجی عامل هوشمند AI-NNN       |
| **Human Input**        | ورودی انسانی (کارشناس یا مدیر) |
| **External Source**    | منبع خارجی معتبر               |

### بعد ۳: سطح اطمینان

| سطح              | توضیح                                       |
| ---------------- | ------------------------------------------- |
| **Certain**      | اطمینان کامل — یک کاندید بدون رقیب          |
| **High**         | اطمینان بالا — شواهد قوی به نفع یک کاندید   |
| **Medium**       | اطمینان متوسط — شواهد متوازن بین کاندیدها   |
| **Low**          | اطمینان پایین — نیاز به بررسی بیشتر         |
| **Unresolvable** | غیرقابل تفکیک — نیاز به ارجاع به سطح بالاتر |

---

## ۱۲. Resolution Stage Model

مدل مرحله‌ای تفکیک دانش در ۸ مرحله تعریف می‌شود:

| مرحله   | نام                          | توضیح                                   | خروجی                |
| ------- | ---------------------------- | --------------------------------------- | -------------------- |
| KRST-01 | **Request Capture**          | دریافت و ثبت درخواست تفکیک              | Resolution Request   |
| KRST-02 | **Source Identification**    | شناسایی منابع معتبر برای جمع‌آوری شواهد | Source Set           |
| KRST-03 | **Evidence Collection**      | جمع‌آوری شواهد از منابع شناسایی‌شده     | Evidence Set         |
| KRST-04 | **Evidence Evaluation**      | ارزیابی اعتبار، ارتباط و وزن شواهد      | Evaluated Evidence   |
| KRST-05 | **Cross-Source Correlation** | همبستگی و تطبیق شواهد بین منابع         | Correlated Evidence  |
| KRST-06 | **Candidate Selection**      | انتخاب کاندید معتبر بر اساس شواهد       | Selected Candidate   |
| KRST-07 | **Validation**               | اعتبارسنجی انتخاب انجام‌شده             | Validation Report    |
| KRST-08 | **Canonical Registration**   | ثبت پاسخ معتبر در سیستم دانش            | Registered Canonical |

---

## ۱۳. Resolution State Model

مدل وضعیت تفکیک دانش با ۸ وضعیت و ۱۸ انتقال مجاز:

### وضعیت‌ها

| ID     | وضعیت           | توضیح                                  |
| ------ | --------------- | -------------------------------------- |
| KRS-01 | **Pending**     | درخواست تفکیک دریافت شده اما شروع نشده |
| KRS-02 | **Identifying** | در حال شناسایی کاندیدها و منابع        |
| KRS-03 | **Evaluating**  | در حال ارزیابی شواهد                   |
| KRS-04 | **Correlating** | در حال همبستگی شواهد بین منابع         |
| KRS-05 | **Resolved**    | پاسخ معتبر تعیین شده                   |
| KRS-06 | **Validated**   | تفکیک با موفقیت اعتبارسنجی شده         |
| KRS-07 | **Superseded**  | تفکیک بعدی جایگزین این تفکیک شده       |
| KRS-08 | **Escalated**   | تعارض به سطح بالاتر ارجاع شده          |

### انتقال‌های مجاز

| از     | به     | شرط                           |
| ------ | ------ | ----------------------------- |
| KRS-01 | KRS-02 | شروع فرآیند تفکیک             |
| KRS-01 | KRS-08 | تعارض آشکار در درخواست        |
| KRS-02 | KRS-03 | تکمیل شناسایی کاندیدها        |
| KRS-02 | KRS-08 | عدم امکان شناسایی کاندید      |
| KRS-03 | KRS-04 | تکمیل ارزیابی شواهد           |
| KRS-03 | KRS-02 | نیاز به کاندیدهای بیشتر       |
| KRS-03 | KRS-08 | تعارض غیرقابل حل در شواهد     |
| KRS-04 | KRS-05 | تکمیل همبستگی و انتخاب کاندید |
| KRS-04 | KRS-03 | نیاز به شواهد بیشتر           |
| KRS-04 | KRS-08 | تعارض غیرقابل حل در همبستگی   |
| KRS-05 | KRS-06 | اعتبارسنجی موفق               |
| KRS-05 | KRS-04 | نیاز به همبستگی مجدد          |
| KRS-05 | KRS-07 | تفکیک جدید جایگزین شده        |
| KRS-06 | KRS-05 | نیاز به بازبینی               |
| KRS-06 | KRS-07 | تفکیک جدید جایگزین شده        |
| KRS-07 | KRS-01 | درخواست تفکیک مجدد            |
| KRS-08 | KRS-02 | بازگشت پس از رفع تعارض        |
| KRS-08 | KRS-07 | تعارض غیرقابل حل — بسته شدن   |

---

## ۱۴. Resolution Models

۸ مدل تفکیک دانش:

| ID     | مدل                         | توضیح                                              | دامنه  |
| ------ | --------------------------- | -------------------------------------------------- | ------ |
| KRM-01 | **Identity Resolution**     | تفکیک هویت — تعیین موجودیت مقصد یک ارجاع           | KRD-01 |
| KRM-02 | **Semantic Resolution**     | تفکیک معنا — تعیین معنی معتبر یک مفهوم در بافت     | KRD-02 |
| KRM-03 | **Reference Resolution**    | تفکیک ارجاع — تعیین صحت و اعتبار یک pointer        | KRD-03 |
| KRM-04 | **Relationship Resolution** | تفکیک رابطه — تعیین نوع و جهت رابطه بین موجودیت‌ها | KRD-04 |
| KRM-05 | **Ownership Resolution**    | تفکیک مالکیت — تعیین مالک یا متولی دانش            | KRD-05 |
| KRM-06 | **Version Resolution**      | تفکیک نسخه — تعیین نسخه معتبر دانش                 | KRD-06 |
| KRM-07 | **Federation Resolution**   | تفکیک فدرال — تعیین هویت موجودیت در دامنه فدرال    | KRD-07 |
| KRM-08 | **Conflict Resolution**     | تفکیک تعارض — حل داده‌های متناقض از منابع مختلف    | KRD-08 |

---

## ۱۵. Resolution Relationships

۱۰ رابطه اصلی تفکیک دانش:

| ID     | رابطه             | مبدأ               | مقصد               | توضیح                                |
| ------ | ----------------- | ------------------ | ------------------ | ------------------------------------ |
| KRR-01 | **Resolves**      | ResolutionRequest  | Candidate          | درخواست به یک کاندید منتهی می‌شود    |
| KRR-02 | **Supports**      | Evidence           | Candidate          | شاهد از یک کاندید پشتیبانی می‌کند    |
| KRR-03 | **Contradicts**   | Evidence           | Evidence           | دو شاهد با هم تناقض دارند            |
| KRR-04 | **Selected As**   | Decision           | Candidate          | تصمیم یک کاندید را انتخاب می‌کند     |
| KRR-05 | **Registered As** | CanonicalAnswer    | ResolutionDecision | پاسخ معتبر ثبت‌شده نتیجه تصمیم است   |
| KRR-06 | **Belongs To**    | Evidence           | EvidenceSource     | شاهد متعلق به یک منبع است            |
| KRR-07 | **Triggers**      | Conflict           | Escalation         | تعارض به ارجاع منتهی می‌شود          |
| KRR-08 | **Replaces**      | ResolutionDecision | ResolutionDecision | تصمیم جدید جایگزین تصمیم قبلی می‌شود |
| KRR-09 | **Governs**       | ResolutionPolicy   | ResolutionRequest  | سیاست بر درخواست حاکم است            |
| KRR-10 | **Records**       | ResolutionRegistry | ResolutionTrail    | رجیستری رد تفکیک را ثبت می‌کند       |

---

## ۱۶. Resolution Integrity

یکپارچگی تفکیک دانش بر اساس ۴ بعد تعریف می‌شود:

### بعد ۱: یکپارچگی درخواست (Request Integrity)

| قاعده                                          | توضیح |
| ---------------------------------------------- | ----- |
| هر درخواست تفکیک باید دارای یک دامنه مشخص باشد |
| هر درخواست باید دارای یک سطح اولویت باشد       |
| درخواست‌های تکراری برای یک موضوع مجاز نیستند   |

### بعد ۲: یکپارچگی شواهد (Evidence Integrity)

| قاعده                                      | توضیح |
| ------------------------------------------ | ----- |
| هر شاهد باید دارای منبع مشخص باشد          |
| شواهد بدون منبع معتبر نیستند               |
| هر شاهد باید قابل ردیابی تا منبع اصلی باشد |

### بعد ۳: یکپارچگی تصمیم (Decision Integrity)

| قاعده                                   | توضیح |
| --------------------------------------- | ----- |
| هر تصمیم باید مبتنی بر شواهد مستند باشد |
| تصمیم باید دارای دلیل (Rationale) باشد  |
| تصمیمات متعارض روی یک موضوع مجاز نیستند |

### بعد ۴: یکپارچگی ثبت (Registration Integrity)

| قاعده                                         | توضیح |
| --------------------------------------------- | ----- |
| هر پاسخ معتبر باید در رجیستری ثبت شود         |
| پاسخ معتبر پس از ثبت تا بازبینی تغییر نمی‌کند |
| هر پاسخ معتبر باید دارای تاریخ انقضا باشد     |

---

## ۱۷. Resolution Consistency Rules

۱۲ قاعده سازگاری تفکیک دانش:

| ID      | قاعده                                                        | توضیح                                |
| ------- | ------------------------------------------------------------ | ------------------------------------ |
| KRCR-01 | یک درخواست تفکیک فقط یک پاسخ معتبر دارد                      | Single canonical answer              |
| KRCR-02 | پاسخ معتبر نباید با دانش موجود ناسازگار باشد                 | Consistency with existing knowledge  |
| KRCR-03 | شواهد باید از منابع معتبر و شناخته‌شده باشند                 | Source validity                      |
| KRCR-04 | تعارضات باید پیش از ثبت پاسخ حل شوند                         | Pre-registration conflict resolution |
| KRCR-05 | تفکیک بعدی می‌تواند تفکیک قبلی را منسوخ کند                  | Succession allowed                   |
| KRCR-06 | ارجاع به سطوح بالاتر باید مستند شود                          | Documented escalation                |
| KRCR-07 | شواهد با وزن بالاتر بر شواهد با وزن پایین‌تر اولویت دارند    | Weight-based priority                |
| KRCR-08 | منبع با اختیار بالاتر بر منبع با اختیار پایین‌تر اولویت دارد | Authority-based priority             |
| KRCR-09 | تفکیک نباید باعث ایجاد دور در دانش شود                       | No resolution cycles                 |
| KRCR-10 | بازبینی دوره‌ای تفکیک‌های قدیمی الزامی است                   | Periodic review                      |
| KRCR-11 | هر تفکیک باید دارای سطح اطمینان مشخص باشد                    | Confidence level required            |
| KRCR-12 | بدون تفکیک خارج از دامنه تعریف‌شده                           | Scope-bound resolution               |

---

## ۱۸. Resolution Governance

حکمرانی تفکیک دانش بر اساس ۵ سطح اختیار (A-0 تا A-4) و ۴ حوزه حکمرانی تعریف می‌شود:

### حوزه‌های حکمرانی

| حوزه                      | توضیح                                        |
| ------------------------- | -------------------------------------------- |
| **Request Governance**    | حکمرانی درخواست — تأیید، اولویت‌بندی، تخصیص  |
| **Evidence Governance**   | حکمرانی شواهد — اعتبارسنجی منبع، وزن‌دهی     |
| **Decision Governance**   | حکمرانی تصمیم — تأیید، ثبت، انتشار           |
| **Escalation Governance** | حکمرانی ارجاع — مسیر ارجاع، سطح تصمیم‌گیرنده |

### مدل تصمیم‌گیری

| نوع تصمیم            | سطح اختیار | مسئول        |
| -------------------- | ---------- | ------------ |
| تفکیک هویتی ساده     | A-1        | تحلیلگر دانش |
| تفکیک معنایی         | A-2        | متولی دانش   |
| تفکیک مالکیت         | A-3        | افسر حکمرانی |
| تفکیک نسخه           | A-2        | مدیر نسخه    |
| تفکیک تعارض سطح بالا | A-3        | افسر حکمرانی |
| ارجاع به سطح بالاتر  | A-4        | معمار دانش   |

---

## ۱۹. Resolution Evidence Model

مدل شواهد تفکیک (Resolution Evidence) نحوه جمع‌آوری، ارزیابی و وزندهی شواهد را مشخص می‌کند:

### ساختار شاهد

| مؤلفه       | توضیح                                     |
| ----------- | ----------------------------------------- |
| source_id   | شناسه منبع شاهد                           |
| source_type | نوع منبع (KNW, PLAT, AI, Human, External) |
| content     | محتوای شاهد                               |
| weight      | وزن شاهد (۰٫۰ تا ۱٫۰)                     |
| relevance   | میزان ارتباط با موضوع تفکیک               |
| timestamp   | زمان ثبت شاهد                             |
| confidence  | اطمینان به صحت شاهد                       |

### معیارهای ارزیابی شواهد

| معیار                   | توضیح                               |
| ----------------------- | ----------------------------------- |
| **Source Authority**    | اعتبار منبع بر اساس سطح اختیار      |
| **Source Freshness**    | تازگی منبع — منابع جدیدتر وزن بیشتر |
| **Content Consistency** | سازگاری محتوای شاهد با دانش موجود   |
| **Coverage**            | پوشش موضوع توسط شاهد                |
| **Specificity**         | میزان اختصاصی بودن شاهد به موضوع    |

---

## ۲۰. Resolution Metrics

۱۵ معیار اصلی ارزیابی تفکیک دانش:

| ID      | معیار                    | توضیح                                       | واحد  |
| ------- | ------------------------ | ------------------------------------------- | ----- |
| KRM-001 | Resolution Success Rate  | درصد تفکیک‌های موفق به کل درخواست‌ها        | درصد  |
| KRM-002 | Average Resolution Time  | میانگین زمان از درخواست تا ثبت پاسخ         | دقیقه |
| KRM-003 | Conflict Rate            | درصد درخواست‌های با تعارض                   | درصد  |
| KRM-004 | Escalation Rate          | درصد درخواست‌های ارجاع‌شده                  | درصد  |
| KRM-005 | Canonical Accuracy       | درصد پاسخ‌های معتبر تأییدشده در بازبینی     | درصد  |
| KRM-006 | Evidence Coverage        | درصد درخواست‌های با شواهد کافی              | درصد  |
| KRM-007 | Source Diversity         | میانگین تعداد منابع متفاوت به ازای هر تفکیک | عدد   |
| KRM-008 | Resolution Freshness     | میانگین زمان از ثبت تا آخرین بازبینی        | روز   |
| KRM-009 | Supersession Rate        | درصد تفکیک‌های جایگزین‌شده                  | درصد  |
| KRM-010 | Decision Confidence      | میانگین سطح اطمینان تصمیمات ثبت‌شده         | سطح   |
| KRM-011 | Policy Compliance        | درصد انطباق با سیاست‌های تفکیک              | درصد  |
| KRM-012 | Audit Completeness       | درصد تفکیک‌های با رد کامل ثبت‌شده           | درصد  |
| KRM-013 | Resolution Backlog       | تعداد درخواست‌های تفکیک در صف انتظار        | عدد   |
| KRM-014 | Re-resolution Rate       | درصد تفکیک‌های نیازمند بازبینی مجدد         | درصد  |
| KRM-015 | Stakeholder Satisfaction | رضایت ذی‌نفعان از کیفیت تفکیک               | درصد  |

---

## ۲۱. Resolution Constraints

۸ محدودیت اصلی تفکیک دانش:

| ID       | محدودیت                                             | توضیح                              |
| -------- | --------------------------------------------------- | ---------------------------------- |
| KRCST-01 | یک درخواست تفکیک فقط یک پاسخ معتبر دارد             | Single canonical answer            |
| KRCST-02 | پاسخ معتبر پس از ثبت تا بازبینی رسمی تغییر نمی‌کند  | Post-registration immutability     |
| KRCST-03 | تفکیک فقط در دامنه تعریف‌شده مجاز است               | Scope-limited resolution           |
| KRCST-04 | شواهد بدون منبع معتبر نیستند                        | Sourced evidence only              |
| KRCST-05 | تعارضات باید پیش از ثبت حل شوند                     | Pre-registration resolution        |
| KRCST-06 | ارجاع به سطح بالاتر فقط پس از exhaustion شواهد محلی | Escalation after exhaustion        |
| KRCST-07 | تفکیک نباید دانش معتبر موجود را نقض کند             | No violation of existing knowledge |
| KRCST-08 | بازبینی دوره‌ای تفکیک‌های قدیمی الزامی است          | Mandatory periodic review          |

---

## ۲۲. Resolution Quality Gates

۷ گیت کیفیت تفکیک دانش:

| ID      | گیت                       | مرحله   | معیار عبور                           |
| ------- | ------------------------- | ------- | ------------------------------------ |
| KRQG-01 | **Request Validation**    | KRST-01 | دامنه، اولویت و موضوع معتبر هستند    |
| KRQG-02 | **Source Sufficiency**    | KRST-02 | حداقل یک منبع معتبر شناسایی شده      |
| KRQG-03 | **Evidence Adequacy**     | KRST-04 | شواهد کافی برای تصمیم‌گیری وجود دارد |
| KRQG-04 | **Conflict Check**        | KRST-05 | تعارضات شناسایی و مستند شده‌اند      |
| KRQG-05 | **Decision Review**       | KRST-06 | تصمیم منطبق بر شواهد و سیاست‌ها است  |
| KRQG-06 | **Validation Pass**       | KRST-07 | اعتبارسنجی با موفقیت انجام شده       |
| KRQG-07 | **Registration Complete** | KRST-08 | پاسخ معتبر با رد کامل ثبت شده است    |

---

## ۲۳. Cross-Family Mapping

نگاشت تفکیک دانش با سایر خانواده‌های دانشی SMOS:

| خانواده دانش           | دامنه         | ارتباط با تفکیک                                            |
| ---------------------- | ------------- | ---------------------------------------------------------- |
| KNW-BUS (KNW-101..104) | کسب‌وکار      | تفکیک هویت و مالکیت کسب‌وکار                               |
| KNW-PLT (KNW-301..308) | پلتفرم        | تفکیک هویت و نسخه پلتفرم                                   |
| KNW-OPS (KNW-401..405) | عملیات        | تفکیک رویدادها و وضعیت عملیاتی                             |
| KNW-AI (KNW-501..510)  | هوش مصنوعی    | تفکیک خروجی‌های متناقض Agentها                             |
| KNW-BRD (KNW-701)      | برند          | تفکیک هویت و صدای برند                                     |
| KNW-REF (KNW-801)      | مرجع          | تفکیک ارجاعات مرجع                                         |
| KNW-ENG (KNW-201..205) | موتورهای دانش | مصرف‌کننده تفکیک — کامپایلر، گراف، معنا، پرس‌وجو، فدراسیون |
| COM-001..005           | ارتباطات      | تفکیک محتوا و کانال                                        |

---

## ۲۴. Resolution Authority Model

مدل اختیار تفکیک (Resolution Authority) نحوه تعیین مرجعیت در تفکیک دانش را مشخص می‌کند:

### سطوح اختیار در تفکیک

| سطح     | نام                        | توضیح                              | تصمیمات مجاز             |
| ------- | -------------------------- | ---------------------------------- | ------------------------ |
| AUTH-01 | **Local Authority**        | اختیار محلی — دامنه مبدأ           | تفکیک هویت محلی          |
| AUTH-02 | **Domain Authority**       | اختیار دامنه — متولی دانش          | تفکیک معنایی و ارجاع     |
| AUTH-03 | **Cross-Domain Authority** | اختیار بین‌دامنه‌ای — افسر حکمرانی | تفکیک مالکیت و تعارض     |
| AUTH-04 | **Enterprise Authority**   | اختیار سازمانی — معمار دانش        | تفکیک سیاستی و معماری    |
| AUTH-05 | **Executive Authority**    | اختیار اجرایی — مدیر ارشد          | تفکیک نهایی unresolvable |

### قواعد اختیار

| قاعده                                              | توضیح |
| -------------------------------------------------- | ----- |
| هر تفکیک باید در lowest possible level انجام شود   |
| ارجاع به سطح بالاتر نیاز به مستندسازی دارد         |
| تصمیم سطح بالاتر بر تصمیم سطح پایین‌تر اولویت دارد |
| اختیار قابل تفویض است اما مسئولیت غیرقابل تفویض    |

---

## ۲۵. Resolution Evolution Model

مدل تکامل تفکیک دانش در ۵ سطح تعریف می‌شود:

| سطح    | نام                           | توضیح                                                          |
| ------ | ----------------------------- | -------------------------------------------------------------- |
| REL-01 | **Manual Resolution**         | تفکیک دستی — تمام تصمیمات توسط انسان                           |
| REL-02 | **Assisted Resolution**       | تفکیک کمکی — سیستم کاندیدها را پیشنهاد می‌دهد                  |
| REL-03 | **Semi-Automated Resolution** | تفکیک نیمه‌خودکار — سیستم برای موارد استاندارد تصمیم می‌گیرد   |
| REL-04 | **Guided Resolution**         | تفکیک هدایت‌شده — سیستم با قواعد از پیش تعریف‌شده تفکیک می‌کند |
| REL-05 | **Adaptive Resolution**       | تفکیک تطبیقی — سیستم از تفکیک‌های قبلی یاد می‌گیرد             |

---

## ۲۶. Resolution Traceability Model

مدل ردیابی تفکیک (Resolution Traceability) نحوه ردیابی مسیر تفکیک از درخواست تا پاسخ معتبر را مشخص می‌کند:

### ابعاد ردیابی

| بعد                           | توضیح                            |
| ----------------------------- | -------------------------------- |
| **Request Traceability**      | ردیابی از درخواست تا تصمیم نهایی |
| **Evidence Traceability**     | ردیابی هر شاهد تا منبع مبدأ      |
| **Decision Traceability**     | ردیابی منطق و دلیل تصمیم         |
| **Conflict Traceability**     | ردیابی تعارضات و نحوه حل آنها    |
| **Supersession Traceability** | ردیابی زنجیره جایگزینی تفکیک‌ها  |

### ساختار رد (Resolution Trail Entry)

| فیلد          | توضیح                           |
| ------------- | ------------------------------- |
| trail_id      | شناسه یکتای رد                  |
| resolution_id | شناسه تفکیک                     |
| stage         | مرحله فعلی رد                   |
| action        | اقدام انجام‌شده                 |
| actor         | عامل اقدام (منبع، سیستم، انسان) |
| timestamp     | زمان ثبت                        |
| evidence      | شواهد استفاده‌شده در این مرحله  |

---

## ۲۷. Machine Readable JSON Blocks

### Block 1 — Resolution Concepts

```json
{
  "$schema": "KNW-206-concept-registry",
  "resolution_concepts": [
    { "id": "KRC-001", "name": "Resolution", "domain": "KRD-01", "layer": "LYR-RES-01" },
    { "id": "KRC-002", "name": "Canonical Answer", "domain": "KRD-05", "layer": "LYR-RES-05" },
    { "id": "KRC-003", "name": "Candidate", "domain": "KRD-01", "layer": "LYR-RES-01" },
    { "id": "KRC-004", "name": "Evidence", "domain": "KRD-02", "layer": "LYR-RES-02" },
    { "id": "KRC-005", "name": "Resolution Source", "domain": "KRD-02", "layer": "LYR-RES-02" },
    { "id": "KRC-006", "name": "Conflict", "domain": "KRD-08", "layer": "LYR-RES-03" },
    { "id": "KRC-007", "name": "Ambiguity", "domain": "KRD-01", "layer": "LYR-RES-01" },
    { "id": "KRC-008", "name": "Resolution Authority", "domain": "KRD-05", "layer": "LYR-RES-04" },
    { "id": "KRC-009", "name": "Resolution Scope", "domain": "KRD-05", "layer": "LYR-RES-04" },
    { "id": "KRC-010", "name": "Resolution Context", "domain": "KRD-05", "layer": "LYR-RES-04" },
    { "id": "KRC-011", "name": "Evidence Weight", "domain": "KRD-02", "layer": "LYR-RES-02" },
    { "id": "KRC-012", "name": "Candidate Confidence", "domain": "KRD-03", "layer": "LYR-RES-03" },
    { "id": "KRC-013", "name": "Resolution Decision", "domain": "KRD-04", "layer": "LYR-RES-04" },
    { "id": "KRC-014", "name": "Resolution Trail", "domain": "KRD-05", "layer": "LYR-RES-05" },
    { "id": "KRC-015", "name": "Escalation Path", "domain": "KRD-08", "layer": "LYR-RES-04" },
    { "id": "KRC-016", "name": "Resolution Policy", "domain": "KRD-05", "layer": "LYR-RES-05" },
    { "id": "KRC-017", "name": "Resolution Registry", "domain": "KRD-05", "layer": "LYR-RES-05" },
    {
      "id": "KRC-018",
      "name": "Resolution Fingerprint",
      "domain": "KRD-05",
      "layer": "LYR-RES-05"
    },
    { "id": "KRC-019", "name": "Resolution Status", "domain": "KRD-05", "layer": "LYR-RES-05" },
    { "id": "KRC-020", "name": "Resolution Validity", "domain": "KRD-05", "layer": "LYR-RES-05" }
  ]
}
```

### Block 2 — Resolution Entities

```json
{
  "$schema": "KNW-206-entity-registry",
  "resolution_entities": [
    { "id": "KRE-001", "name": "ResolutionRequest", "domain": "KRD-01", "type": "Core" },
    { "id": "KRE-002", "name": "CandidateSet", "domain": "KRD-01", "type": "Core" },
    { "id": "KRE-003", "name": "Candidate", "domain": "KRD-01", "type": "Core" },
    { "id": "KRE-004", "name": "Evidence", "domain": "KRD-02", "type": "Core" },
    { "id": "KRE-005", "name": "EvidenceSource", "domain": "KRD-02", "type": "Core" },
    { "id": "KRE-006", "name": "Conflict", "domain": "KRD-08", "type": "Operational" },
    { "id": "KRE-007", "name": "ResolutionDecision", "domain": "KRD-04", "type": "Core" },
    { "id": "KRE-008", "name": "CanonicalAnswer", "domain": "KRD-05", "type": "Core" },
    { "id": "KRE-009", "name": "ResolutionTrail", "domain": "KRD-05", "type": "Audit" },
    { "id": "KRE-010", "name": "ResolutionPolicy", "domain": "KRD-05", "type": "Governance" },
    { "id": "KRE-011", "name": "Escalation", "domain": "KRD-08", "type": "Operational" },
    { "id": "KRE-012", "name": "ResolutionRegistry", "domain": "KRD-05", "type": "Core" }
  ]
}
```

### Block 3 — Resolution Capabilities

```json
{
  "$schema": "KNW-206-capability-registry",
  "resolution_capabilities": [
    { "id": "KRCAP-001", "name": "Request Capture", "layer": "LYR-RES-01", "domain": "KRD-01" },
    {
      "id": "KRCAP-002",
      "name": "Candidate Identification",
      "layer": "LYR-RES-01",
      "domain": "KRD-01"
    },
    { "id": "KRCAP-003", "name": "Source Discovery", "layer": "LYR-RES-02", "domain": "KRD-02" },
    { "id": "KRCAP-004", "name": "Evidence Collection", "layer": "LYR-RES-02", "domain": "KRD-02" },
    { "id": "KRCAP-005", "name": "Evidence Evaluation", "layer": "LYR-RES-02", "domain": "KRD-02" },
    {
      "id": "KRCAP-006",
      "name": "Cross-Source Correlation",
      "layer": "LYR-RES-03",
      "domain": "KRD-03"
    },
    { "id": "KRCAP-007", "name": "Conflict Detection", "layer": "LYR-RES-03", "domain": "KRD-03" },
    {
      "id": "KRCAP-008",
      "name": "Authority Resolution",
      "layer": "LYR-RES-04",
      "domain": "KRD-04"
    },
    { "id": "KRCAP-009", "name": "Decision Execution", "layer": "LYR-RES-04", "domain": "KRD-04" },
    {
      "id": "KRCAP-010",
      "name": "Escalation Management",
      "layer": "LYR-RES-04",
      "domain": "KRD-04"
    },
    {
      "id": "KRCAP-011",
      "name": "Canonical Registration",
      "layer": "LYR-RES-05",
      "domain": "KRD-05"
    },
    {
      "id": "KRCAP-012",
      "name": "Resolution Validation",
      "layer": "LYR-RES-05",
      "domain": "KRD-05"
    },
    { "id": "KRCAP-013", "name": "Resolution Audit", "layer": "LYR-RES-05", "domain": "KRD-05" },
    {
      "id": "KRCAP-014",
      "name": "Resolution Policy Management",
      "layer": "LYR-RES-05",
      "domain": "KRD-05"
    }
  ]
}
```

### Block 4 — Resolution Functions

```json
{
  "$schema": "KNW-206-function-registry",
  "resolution_functions": [
    { "id": "KRF-01", "name": "Capture Request", "capability": "KRCAP-001", "domain": "KRD-01" },
    {
      "id": "KRF-02",
      "name": "Identify Candidates",
      "capability": "KRCAP-002",
      "domain": "KRD-01"
    },
    { "id": "KRF-03", "name": "Discover Sources", "capability": "KRCAP-003", "domain": "KRD-02" },
    { "id": "KRF-04", "name": "Collect Evidence", "capability": "KRCAP-004", "domain": "KRD-02" },
    { "id": "KRF-05", "name": "Evaluate Evidence", "capability": "KRCAP-005", "domain": "KRD-02" },
    { "id": "KRF-06", "name": "Correlate Sources", "capability": "KRCAP-006", "domain": "KRD-03" },
    { "id": "KRF-07", "name": "Detect Conflict", "capability": "KRCAP-007", "domain": "KRD-03" },
    {
      "id": "KRF-08",
      "name": "Resolve By Authority",
      "capability": "KRCAP-008",
      "domain": "KRD-04"
    },
    { "id": "KRF-09", "name": "Execute Decision", "capability": "KRCAP-009", "domain": "KRD-04" },
    { "id": "KRF-10", "name": "Manage Escalation", "capability": "KRCAP-010", "domain": "KRD-04" },
    { "id": "KRF-11", "name": "Register Canonical", "capability": "KRCAP-011", "domain": "KRD-05" },
    {
      "id": "KRF-12",
      "name": "Validate Resolution",
      "capability": "KRCAP-012",
      "domain": "KRD-05"
    },
    { "id": "KRF-13", "name": "Audit Resolution", "capability": "KRCAP-013", "domain": "KRD-05" },
    { "id": "KRF-14", "name": "Manage Policy", "capability": "KRCAP-014", "domain": "KRD-05" }
  ]
}
```

### Block 5 — Resolution Stages

```json
{
  "$schema": "KNW-206-stage-registry",
  "resolution_stages": [
    {
      "id": "KRST-01",
      "name": "Request Capture",
      "input": "ResolutionRequest",
      "output": "CapturedRequest",
      "domain": "KRD-01"
    },
    {
      "id": "KRST-02",
      "name": "Source Identification",
      "input": "CapturedRequest",
      "output": "SourceSet",
      "domain": "KRD-02"
    },
    {
      "id": "KRST-03",
      "name": "Evidence Collection",
      "input": "SourceSet",
      "output": "EvidenceSet",
      "domain": "KRD-02"
    },
    {
      "id": "KRST-04",
      "name": "Evidence Evaluation",
      "input": "EvidenceSet",
      "output": "EvaluatedEvidence",
      "domain": "KRD-02"
    },
    {
      "id": "KRST-05",
      "name": "Cross-Source Correlation",
      "input": "EvaluatedEvidence",
      "output": "CorrelatedEvidence",
      "domain": "KRD-03"
    },
    {
      "id": "KRST-06",
      "name": "Candidate Selection",
      "input": "CorrelatedEvidence",
      "output": "SelectedCandidate",
      "domain": "KRD-04"
    },
    {
      "id": "KRST-07",
      "name": "Validation",
      "input": "SelectedCandidate",
      "output": "ValidationReport",
      "domain": "KRD-05"
    },
    {
      "id": "KRST-08",
      "name": "Canonical Registration",
      "input": "ValidationReport",
      "output": "RegisteredCanonical",
      "domain": "KRD-05"
    }
  ],
  "total_stages": 8
}
```

### Block 6 — Resolution Models

```json
{
  "$schema": "KNW-206-model-registry",
  "resolution_models": [
    {
      "id": "KRM-01",
      "name": "Identity Resolution",
      "domain": "KRD-01",
      "input": "IdentityReference",
      "output": "ResolvedEntity",
      "consumers": ["AI-001", "AI-004", "AI-011"]
    },
    {
      "id": "KRM-02",
      "name": "Semantic Resolution",
      "domain": "KRD-02",
      "input": "AmbiguousMeaning",
      "output": "CanonicalMeaning",
      "consumers": ["AI-003", "AI-004", "AI-011"]
    },
    {
      "id": "KRM-03",
      "name": "Reference Resolution",
      "domain": "KRD-03",
      "input": "KnowledgeReference",
      "output": "ResolvedReference",
      "consumers": ["AI-005", "AI-008", "AI-011"]
    },
    {
      "id": "KRM-04",
      "name": "Relationship Resolution",
      "domain": "KRD-04",
      "input": "EntityPair",
      "output": "CanonicalRelationship",
      "consumers": ["AI-011", "AI-014"]
    },
    {
      "id": "KRM-05",
      "name": "Ownership Resolution",
      "domain": "KRD-05",
      "input": "OwnershipQuestion",
      "output": "CanonicalOwner",
      "consumers": ["AI-004", "AI-014"]
    },
    {
      "id": "KRM-06",
      "name": "Version Resolution",
      "domain": "KRD-06",
      "input": "VersionSet",
      "output": "CanonicalVersion",
      "consumers": ["AI-011", "AI-012"]
    },
    {
      "id": "KRM-07",
      "name": "Federation Resolution",
      "domain": "KRD-07",
      "input": "FederatedIdentity",
      "output": "CanonicalFederatedEntity",
      "consumers": ["AI-011", "AI-014"]
    },
    {
      "id": "KRM-08",
      "name": "Conflict Resolution",
      "domain": "KRD-08",
      "input": "ConflictingEvidence",
      "output": "ResolvedConflict",
      "consumers": ["AI-004", "AI-011", "AI-014"]
    }
  ],
  "total_models": 8
}
```

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Resolution Request Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "KNW-206-resolution-request",
  "title": "Resolution Request Schema",
  "description": "Schema for a resolution request in the Enterprise Knowledge Resolution Architecture",
  "type": "object",
  "properties": {
    "request_id": {
      "type": "string",
      "description": "شناسه یکتای درخواست تفکیک",
      "pattern": "^KRR-[0-9]{8}-[A-Z0-9]{8}$"
    },
    "resolution_domain": {
      "type": "string",
      "description": "دامنه تفکیک",
      "enum": ["KRD-01", "KRD-02", "KRD-03", "KRD-04", "KRD-05", "KRD-06", "KRD-07", "KRD-08"]
    },
    "subject": {
      "type": "string",
      "description": "موضوع تفکیک"
    },
    "candidates": {
      "type": "array",
      "description": "کاندیدهای پیشنهادی",
      "items": {
        "type": "object",
        "properties": {
          "candidate_id": { "type": "string" },
          "description": { "type": "string" },
          "source": { "type": "string" }
        }
      }
    },
    "priority": {
      "type": "string",
      "description": "اولویت تفکیک",
      "enum": ["critical", "high", "medium", "low"]
    },
    "requester": {
      "type": "string",
      "description": "درخواست‌کننده",
      "pattern": "^AI-[0-9]{3}$|^Human$|^System$"
    },
    "context": {
      "type": "object",
      "description": "بافت تفکیک",
      "properties": {
        "knowledge_families": { "type": "array", "items": { "type": "string" } },
        "scope": { "type": "string" },
        "deadline": { "type": "string", "format": "date-time" }
      }
    }
  },
  "required": ["request_id", "resolution_domain", "subject", "priority", "requester"]
}
```

### Schema 2 — Evidence Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "KNW-206-evidence",
  "title": "Resolution Evidence Schema",
  "description": "Schema for resolution evidence in the Enterprise Knowledge Resolution Architecture",
  "type": "object",
  "properties": {
    "evidence_id": {
      "type": "string",
      "description": "شناسه یکتای شاهد"
    },
    "request_id": {
      "type": "string",
      "description": "شناسه درخواست تفکیک"
    },
    "source": {
      "type": "object",
      "description": "منبع شاهد",
      "properties": {
        "source_id": { "type": "string" },
        "source_type": { "type": "string", "enum": ["KNW", "PLAT", "AI", "Human", "External"] },
        "source_reference": { "type": "string" },
        "authority_level": {
          "type": "string",
          "enum": ["AUTH-01", "AUTH-02", "AUTH-03", "AUTH-04", "AUTH-05"]
        }
      }
    },
    "content": {
      "type": "string",
      "description": "محتوای شاهد"
    },
    "weight": {
      "type": "number",
      "description": "وزن شاهد (۰٫۰ تا ۱٫۰)",
      "minimum": 0,
      "maximum": 1
    },
    "relevance": {
      "type": "number",
      "description": "میزان ارتباط با موضوع (۰٫۰ تا ۱٫۰)",
      "minimum": 0,
      "maximum": 1
    },
    "supports_candidate": {
      "type": "string",
      "description": "کاندیدی که این شاهد از آن پشتیبانی می‌کند"
    },
    "timestamp": {
      "type": "string",
      "description": "زمان ثبت شاهد",
      "format": "date-time"
    }
  },
  "required": ["evidence_id", "request_id", "source", "content", "supports_candidate"]
}
```

### Schema 3 — Resolution Decision Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "KNW-206-resolution-decision",
  "title": "Resolution Decision Schema",
  "description": "Schema for a resolution decision in the Enterprise Knowledge Resolution Architecture",
  "type": "object",
  "properties": {
    "decision_id": {
      "type": "string",
      "description": "شناسه یکتای تصمیم تفکیک"
    },
    "request_id": {
      "type": "string",
      "description": "شناسه درخواست تفکیک"
    },
    "selected_candidate": {
      "type": "string",
      "description": "کاندید انتخاب‌شده"
    },
    "confidence": {
      "type": "string",
      "description": "سطح اطمینان",
      "enum": ["certain", "high", "medium", "low"]
    },
    "rationale": {
      "type": "string",
      "description": "دلیل و منطق تصمیم"
    },
    "evidence_summary": {
      "type": "array",
      "description": "خلاصه شواهد استفاده‌شده",
      "items": {
        "type": "object",
        "properties": {
          "evidence_id": { "type": "string" },
          "weight": { "type": "number" },
          "contribution": { "type": "string" }
        }
      }
    },
    "decision_type": {
      "type": "string",
      "description": "نوع تصمیم",
      "enum": ["direct", "consensus", "priority", "authoritative", "composite"]
    },
    "decided_by": {
      "type": "string",
      "description": "تصمیم‌گیرنده"
    },
    "timestamp": {
      "type": "string",
      "description": "زمان تصمیم",
      "format": "date-time"
    },
    "supersedes": {
      "type": "string",
      "description": "تصمیم قبلی که این تصمیم جایگزین می‌کند"
    }
  },
  "required": [
    "decision_id",
    "request_id",
    "selected_candidate",
    "confidence",
    "rationale",
    "decision_type",
    "decided_by"
  ]
}
```

---

## ۲۹. Resolution Integrity Rules

### قواعد یکپارچگی تفکیک

| ID       | قاعده                             | توضیح                              | منبع     |
| -------- | --------------------------------- | ---------------------------------- | -------- |
| RINTR-01 | هر درخواست یک پاسخ معتبر دارد     | تفکیک‌های بدون پاسخ مجاز نیستند    | KRCST-01 |
| RINTR-02 | پاسخ معتبر تغییرناپذیر است        | تا بازبینی رسمی قابل تغییر نیست    | KRCST-02 |
| RINTR-03 | شواهد باید دارای منبع باشند       | شواهد بدون منبع معتبر نیستند       | KRCST-04 |
| RINTR-04 | تعارضات باید پیش از ثبت حل شوند   | تعارض حل‌نشده به ثبت منتهی نمی‌شود | KRCST-05 |
| RINTR-05 | تفکیک در محدوده دامنه مجاز است    | تفکیک خارج از دامنه مجاز نیست      | KRCST-03 |
| RINTR-06 | ارجاع پس از exhaustion شواهد محلی | ارجاع زودهنگام مجاز نیست           | KRCST-06 |
| RINTR-07 | تفکیک نباید دانش معتبر را نقض کند | حفظ یکپارچگی دانش موجود            | KRCST-07 |
| RINTR-08 | بازبینی دوره‌ای الزامی است        | تفکیک‌های قدیمی باید بازبینی شوند  | KRCST-08 |

---

## ۳۰. Cross-Domain Resolution Mapping

### نگاشت بین دامنه‌های تفکیک

| دامنه مبدأ            | دامنه مقصد            | نوع نگاشت  | توضیح                                          |
| --------------------- | --------------------- | ---------- | ---------------------------------------------- |
| KRD-01 (Identity)     | KRD-02 (Semantic)     | Direct     | تفکیک هویت به تفکیک معنا منتهی می‌شود          |
| KRD-01 (Identity)     | KRD-03 (Reference)    | Contextual | هویت می‌تواند نیاز به تفکیک ارجاع داشته باشد   |
| KRD-02 (Semantic)     | KRD-04 (Relationship) | Direct     | تفکیک معنا به تفکیک رابطه منتهی می‌شود         |
| KRD-03 (Reference)    | KRD-01 (Identity)     | Composite  | تفکیک ارجاع به تفکیک هویت منتهی می‌شود         |
| KRD-04 (Relationship) | KRD-05 (Ownership)    | Contextual | رابطه می‌تواند به تفکیک مالکیت نیاز داشته باشد |
| KRD-05 (Ownership)    | KRD-06 (Version)      | Direct     | تفکیک مالکیت به تفکیک نسخه منتهی می‌شود        |
| KRD-06 (Version)      | KRD-08 (Conflict)     | Delegated  | نسخه‌های متعارض به تفکیک تعارض نیاز دارند      |
| KRD-07 (Federation)   | KRD-01 (Identity)     | Direct     | تفکیک فدرال به تفکیک هویت منتهی می‌شود         |
| KRD-08 (Conflict)     | KRD-07 (Federation)   | Contextual | تعارض می‌تواند ناشی از فدراسیون باشد           |
| KRD-08 (Conflict)     | KRD-05 (Ownership)    | Composite  | تعارض unresolvable به تفکیک مالکیت نیاز دارد   |

---

> **پایان KNW-206 — Enterprise Knowledge Resolution Architecture**
> نسخه 1.0.0-draft — ۲۰۲۶-۰۷-۰۶
> **معماری — بدون پیاده‌سازی — خنثی از نظر فناوری**
