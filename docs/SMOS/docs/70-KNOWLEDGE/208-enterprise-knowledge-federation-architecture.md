# KNW-205 — Enterprise Knowledge Federation Architecture

> **شناسه:** KNW-205
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-07-06
> **مسئول:** معمار دانش سازمانی
> **وابستگی:** KNW-000, KNW-001, KNW-201, KNW-202, KNW-203, KNW-204, KNW-301..308, KNW-401..405, KNW-501..510, KNW-701, KNW-801
> **مخاطب:** human, ai-agent, knowledge-engineer, system-architect

---

## ۱. Purpose

KNW-205 معماری فدراسیون دانش سازمانی SMOS را تعریف می‌کند. این سند چگونگی اتصال، همگام‌سازی، تفکیک هویت و تبادل دانش بین دامنه‌های مختلف دانش، خانواده‌های دانشی و سیستم‌های خارجی را مشخص می‌کند. فدراسیون دانش (Knowledge Federation) لایه‌ای از معماری دانش است که امکان کارکرد یکپارچه چندین دامنه دانشی مجزا را به صورت یک سیستم دانش واحد فراهم می‌کند.

**SSOT**: تنها منبع معتبر برای معماری فدراسیون دانش سازمانی SMOS.

---

## ۲. Scope

این سند محدوده زیر را پوشش می‌دهد:

- تعریف اصول و فلسفه فدراسیون دانش
- مدل لایه‌ای معماری فدراسیون
- دامنه‌ها، مفاهیم و موجودیت‌های فدراسیون
- قابلیت‌ها و کارکردهای فدراسیون
- مدل مرحله‌ای، مدل وضعیت و مدل‌های فدراسیون
- روابط، یکپارچگی و سازگاری فدراسیون
- حکمرانی، معیارها، محدودیت‌ها و گیت‌های کیفیت
- ۶ بلوک Machine Readable JSON
- ۳ JSON Schema (Draft-07)

**خارج از محدوده**:

- پیاده‌سازی فنی فدراسیون
- پروتکل‌های شبکه یا APIهای خاص
- پایگاه داده یا Vendor خاص
- RDF, OWL, SPARQL, GraphQL
- معماری توزیع‌شده یا هماهنگ‌سازی زمان اجرا (موضوع SMOS-712)

---

## ۳. Federation Principles

فدراسیون دانش SMOS بر ۸ اصل زیر استوار است:

| ID     | اصل                             | توضیح                                                              |
| ------ | ------------------------------- | ------------------------------------------------------------------ |
| KFP-01 | **Autonomy**                    | هر دامنه دانشی مستقل است و مالکیت داده خود را حفظ می‌کند           |
| KFP-02 | **Federation over Replication** | فدراسیون جایگزین کپی‌سازی می‌شود — داده در مبدأ می‌ماند            |
| KFP-03 | **Identity First**              | تفکیک هویت پیش‌نیاز هرگونه تبادل دانش است                          |
| KFP-04 | **Semantic Grounding**          | تمام نگاشت‌ها بر اساس معنای مشترک (Common Semantics) تعریف می‌شوند |
| KFP-05 | **Graduated Trust**             | اعتماد بین دامنه‌ها تدریجی و مبتنی بر اعتبارسنجی است               |
| KFP-06 | **Traceability**                | هر تبادل فدرال قابل ردیابی تا مبدأ است                             |
| KFP-07 | **Governance Parity**           | هر دامنه تابع حکمرانی مخصوص خود و قواعد فدرال است                  |
| KFP-08 | **Evolution Compatible**        | تکامل دامنه‌ها نباید فدراسیون را بشکند — backward compatible       |

---

## ۴. Federation Philosophy

فدراسیون دانش SMOS بر اساس فلسفه "اتحاد در عین استقلال" (Unity in Autonomy) طراحی شده است. برخلاف یکپارچه‌سازی (Integration) که داده را از منابع مختلف جمع‌آوری و در یک مخزن متمرکز ذخیره می‌کند، فدراسیون (Federation) داده را در مبدأ نگه می‌دارد و از طریق لایه‌ای از نگاشت‌های معنایی، هویتی و حاکمیتی، دسترسی یکپارچه به آن را فراهم می‌کند.

فدراسیون دانش SMOS:

- **جایگزین کپی نیست** — داده در مالکیت دامنه مبدأ باقی می‌ماند
- **یکپارچگی معنایی را تضمین می‌کند** — موجودیت‌های مشابه در دامنه‌های مختلف به هم متصل می‌شوند
- **شفاف است** — مصرف‌کننده می‌داند داده از کدام دامنه مبدأ آمده است
- **تکامل‌پذیر است** — دامنه‌های جدید بدون شکستن فدراسیون موجود اضافه می‌شوند

---

## ۵. Architecture — Layered Model

معماری فدراسیون دانش SMOS در ۵ لایه تعریف می‌شود:

| لایه       | نام                  | توضیح                                                                   |
| ---------- | -------------------- | ----------------------------------------------------------------------- |
| LYR-FED-01 | **Identity Layer**   | تفکیک هویت موجودیت‌ها بین دامنه‌ها — هر موجودیت یک هویت فدرال یکتا دارد |
| LYR-FED-02 | **Semantic Layer**   | نگاشت معنایی بین مفاهیم دامنه‌های مختلف — ترجمه معنا بین دامنه‌ها       |
| LYR-FED-03 | **Access Layer**     | دسترسی فدرال به دانش — کشف، پرس‌وجو و بازیابی از دامنه‌های متصل         |
| LYR-FED-04 | **Governance Layer** | حکمرانی فدرال — قواعد اشتراک‌گذاری، سطوح دسترسی، مجوزها                 |
| LYR-FED-05 | **Lifecycle Layer**  | چرخه حیات فدراسیون — ثبت، اتصال، اعتبارسنجی، تکامل، بازنشستگی           |

---

## ۶. Federation Domains

فدراسیون دانش SMOS شامل ۸ دامنه اصلی است:

| ID     | نام                      | توضیح                                    | لایه       |
| ------ | ------------------------ | ---------------------------------------- | ---------- |
| KFD-01 | **Domain Registration**  | ثبت دامنه‌های دانشی در فدراسیون          | LYR-FED-01 |
| KFD-02 | **Identity Resolution**  | تفکیک هویت موجودیت‌ها بین دامنه‌ها       | LYR-FED-01 |
| KFD-03 | **Semantic Mapping**     | نگاشت معنایی بین مفاهیم دامنه‌ها         | LYR-FED-02 |
| KFD-04 | **Federated Discovery**  | کشف دانش در سراسر دامنه‌های متصل         | LYR-FED-03 |
| KFD-05 | **Federated Query**      | پرس‌وجوی یکپارچه در دامنه‌های متعدد      | LYR-FED-03 |
| KFD-06 | **Federated Governance** | حکمرانی و سیاست‌های اشتراک‌گذاری         | LYR-FED-04 |
| KFD-07 | **Synchronization**      | همگام‌سازی وضعیت و تغییرات بین دامنه‌ها  | LYR-FED-05 |
| KFD-08 | **Federation Lifecycle** | چرخه حیات فدراسیون — از ثبت تا بازنشستگی | LYR-FED-05 |

---

## ۷. Federation Concepts

۲۰ مفهوم بنیادین فدراسیون دانش:

| ID      | مفهوم                      | توضیح                                                              |
| ------- | -------------------------- | ------------------------------------------------------------------ |
| KFC-001 | **Federation**             | مجموعه‌ای از دامنه‌های دانشی که تحت قواعد مشترک به هم متصل شده‌اند |
| KFC-002 | **Federated Domain**       | یک دامنه دانشی که در فدراسیون ثبت شده است                          |
| KFC-003 | **Federated Identity**     | هویت یکتای یک موجودیت در سراسر فدراسیون                            |
| KFC-004 | **Local Identity**         | هویت یک موجودیت در دامنه مبدأ خود                                  |
| KFC-005 | **Identity Mapping**       | نگاشت بین هویت محلی و هویت فدرال                                   |
| KFC-006 | **Semantic Alignment**     | هم‌راستاسازی معنایی بین مفاهیم دامنه‌های مختلف                     |
| KFC-007 | **Concept Mapping**        | نگاشت یک مفهوم در دامنه مبدأ به مفهوم معادل در دامنه مقصد          |
| KFC-008 | **Federation Topology**    | توپولوژی اتصال دامنه‌ها — Hub, Mesh, Hybrid                        |
| KFC-009 | **Federated Query**        | پرس‌وجویی که در چند دامنه به صورت هماهنگ اجرا می‌شود               |
| KFC-010 | **Federated Result**       | نتیجه ترکیبی از چند دامنه که به صورت یکپارچه ارائه می‌شود          |
| KFC-011 | **Trust Level**            | سطح اعتماد بین دامنه‌ها — تعیین‌کننده سطح دسترسی                   |
| KFC-012 | **Sharing Policy**         | سیاست اشتراک‌گذاری دانش بین دامنه‌ها                               |
| KFC-013 | **Federation Contract**    | قرارداد فدرال — شرایط اتصال، اشتراک‌گذاری و حکمرانی                |
| KFC-014 | **Synchronization Rule**   | قاعده همگام‌سازی تغییرات بین دامنه‌ها                              |
| KFC-015 | **Conflict Resolution**    | مکانیزم حل تعارض در صورت داده‌های متناقض بین دامنه‌ها              |
| KFC-016 | **Federation Boundary**    | مرز فدراسیون — محدوده دامنه‌های عضو                                |
| KFC-017 | **Federation Registry**    | ثبت‌مرکزی دامنه‌ها، نگاشت‌ها و قراردادهای فدرال                    |
| KFC-018 | **Federation Gateway**     | نقطه ورود به فدراسیون برای دامنه‌ها و مصرف‌کنندگان خارجی           |
| KFC-019 | **Federation Event**       | رویداد فدرال — تغییر وضعیت، ثبت دامنه جدید، قطع اتصال              |
| KFC-020 | **Federation Audit Trail** | رد کامل تمام رویدادها و تغییرات فدرال                              |

---

## ۸. Federation Entities

۱۲ موجودیت اصلی فدراسیون دانش:

| ID      | موجودیت                 | توضیح                            | دامنه  |
| ------- | ----------------------- | -------------------------------- | ------ |
| KFE-001 | **Federation**          | نمونه یک فدراسیون دانش           | KFD-08 |
| KFE-002 | **FederatedDomain**     | یک دامنه دانش عضو فدراسیون       | KFD-01 |
| KFE-003 | **FederatedIdentity**   | هویت فدرال یک موجودیت            | KFD-02 |
| KFE-004 | **IdentityMapping**     | نگاشت بین هویت محلی و فدرال      | KFD-02 |
| KFE-005 | **SemanticMapping**     | نگاشت معنایی بین مفاهیم دو دامنه | KFD-03 |
| KFE-006 | **FederationContract**  | قرارداد فدرال بین دامنه‌ها       | KFD-06 |
| KFE-007 | **SharingPolicy**       | سیاست اشتراک‌گذاری دانش          | KFD-06 |
| KFE-008 | **FederatedQuery**      | پرس‌وجوی فدرال                   | KFD-05 |
| KFE-009 | **FederatedResult**     | نتیجه پرس‌وجوی فدرال             | KFD-05 |
| KFE-010 | **SynchronizationRule** | قاعده همگام‌سازی                 | KFD-07 |
| KFE-011 | **FederationEvent**     | رویداد فدرال                     | KFD-08 |
| KFE-012 | **FederationRegistry**  | ثبت‌مرکزی فدراسیون               | KFD-08 |

---

## ۹. Federation Capabilities

۱۴ قابلیت اصلی فدراسیون دانش:

| ID        | قابلیت                    | توضیح                                     | لایه       |
| --------- | ------------------------- | ----------------------------------------- | ---------- |
| KFCAP-001 | **Domain Registration**   | ثبت دامنه جدید در فدراسیون                | LYR-FED-01 |
| KFCAP-002 | **Identity Resolution**   | تفکیک هویت موجودیت بین دامنه‌ها           | LYR-FED-01 |
| KFCAP-003 | **Semantic Alignment**    | هم‌راستاسازی معنایی دامنه‌ها              | LYR-FED-02 |
| KFCAP-004 | **Concept Translation**   | ترجمه مفهوم بین دامنه‌های مختلف           | LYR-FED-02 |
| KFCAP-005 | **Federated Discovery**   | کشف دانش در سراسر دامنه‌های متصل          | LYR-FED-03 |
| KFCAP-006 | **Distributed Query**     | اجرای پرس‌وجو در چند دامنه به صورت هماهنگ | LYR-FED-03 |
| KFCAP-007 | **Result Composition**    | ترکیب نتایج چند دامنه در یک نتیجه واحد    | LYR-FED-03 |
| KFCAP-008 | **Trust Assessment**      | ارزیابی و تعیین سطح اعتماد دامنه‌ها       | LYR-FED-04 |
| KFCAP-009 | **Policy Enforcement**    | اجرای سیاست‌های اشتراک‌گذاری              | LYR-FED-04 |
| KFCAP-010 | **Contract Management**   | مدیریت قراردادهای فدرال                   | LYR-FED-04 |
| KFCAP-011 | **Change Propagation**    | انتشار تغییرات بین دامنه‌ها               | LYR-FED-05 |
| KFCAP-012 | **Conflict Resolution**   | حل تعارض داده‌های متناقض                  | LYR-FED-05 |
| KFCAP-013 | **Federation Monitoring** | نظارت بر سلامت و وضعیت فدراسیون           | LYR-FED-05 |
| KFCAP-014 | **Federation Audit**      | ثبت و ردیابی تمام رویدادهای فدرال         | LYR-FED-05 |

---

## ۱۰. Federation Functions

۱۴ کارکرد فدراسیون دانش:

| ID     | کارکرد                     | قابلیت مرتبط | دامنه  |
| ------ | -------------------------- | ------------ | ------ |
| KFF-01 | Register Domain            | KFCAP-001    | KFD-01 |
| KFF-02 | Resolve Identity           | KFCAP-002    | KFD-02 |
| KFF-03 | Align Semantics            | KFCAP-003    | KFD-03 |
| KFF-04 | Translate Concept          | KFCAP-004    | KFD-03 |
| KFF-05 | Discover Across Domains    | KFCAP-005    | KFD-04 |
| KFF-06 | Execute Federated Query    | KFCAP-006    | KFD-05 |
| KFF-07 | Compose Results            | KFCAP-007    | KFD-05 |
| KFF-08 | Assess Trust Level         | KFCAP-008    | KFD-06 |
| KFF-09 | Enforce Sharing Policy     | KFCAP-009    | KFD-06 |
| KFF-10 | Manage Federation Contract | KFCAP-010    | KFD-06 |
| KFF-11 | Propagate Change           | KFCAP-011    | KFD-07 |
| KFF-12 | Resolve Conflict           | KFCAP-012    | KFD-07 |
| KFF-13 | Monitor Federation Health  | KFCAP-013    | KFD-08 |
| KFF-14 | Audit Federation Events    | KFCAP-014    | KFD-08 |

---

## ۱۱. Federation Taxonomy

تاکسونومی فدراسیون دانش در سه بعد اصلی طبقه‌بندی می‌شود:

### بعد ۱: نوع توپولوژی

| نوع              | توضیح                                   | موارد استفاده      |
| ---------------- | --------------------------------------- | ------------------ |
| **Hub**          | یک دامنه مرکزی به همه دامنه‌ها متصل است | فدراسیون متمرکز    |
| **Mesh**         | هر دامنه به چند دامنه دیگر متصل است     | فدراسیون توزیع‌شده |
| **Hybrid**       | ترکیبی از Hub و Mesh                    | فدراسیون ترکیبی    |
| **Hierarchical** | دامنه‌ها در سلسله‌مراتب سازمان‌یافته    | فدراسیون سازمانی   |

### بعد ۲: نوع اتصال

| نوع            | توضیح                                           |
| -------------- | ----------------------------------------------- |
| **Permanent**  | اتصال دائمی — دامنه همیشه در دسترس است          |
| **On-Demand**  | اتصال درخواستی — دامنه در صورت نیاز متصل می‌شود |
| **Replicated** | داده مبدأ به صورت دوره‌ای کپی می‌شود (استثنا)   |
| **Cached**     | داده با کش موقت در دسترس است                    |

### بعد ۳: سطح فدراسیون

| سطح                 | توضیح                                        |
| ------------------- | -------------------------------------------- |
| **Identity Only**   | تنها هویت موجودیت‌ها فدرال شده است           |
| **Semantic**        | هویت + معناشناسی فدرال شده است               |
| **Full Federation** | هویت + معنا + دسترسی + حکمرانی فدرال شده است |

---

## ۱۲. Federation Stage Model

مدل مرحله‌ای فدراسیون دانش در ۸ مرحله تعریف می‌شود:

| مرحله   | نام                          | توضیح                                  | خروجی                 |
| ------- | ---------------------------- | -------------------------------------- | --------------------- |
| KFST-01 | **Domain Identification**    | شناسایی دامنه دانشی برای فدراسیون      | Domain Profile        |
| KFST-02 | **Capability Assessment**    | ارزیابی قابلیت‌های دامنه برای فدراسیون | Capability Report     |
| KFST-03 | **Contract Negotiation**     | مذاکره و انعقاد قرارداد فدرال          | Federation Contract   |
| KFST-04 | **Identity Mapping**         | نقشه‌برداری هویت موجودیت‌ها            | Identity Map          |
| KFST-05 | **Semantic Alignment**       | هم‌راستاسازی معنایی                    | Semantic Map          |
| KFST-06 | **Connection Establishment** | برقراری اتصال فدرال                    | Federation Connection |
| KFST-07 | **Validation**               | اعتبارسنجی اتصال و نگاشت‌ها            | Validation Report     |
| KFST-08 | **Federation Activation**    | فعال‌سازی فدراسیون                     | Active Federation     |

---

## ۱۳. Federation State Model

مدل وضعیت فدراسیون دانش با ۸ وضعیت و ۱۸ انتقال مجاز:

### وضعیت‌ها

| ID     | وضعیت            | توضیح                              |
| ------ | ---------------- | ---------------------------------- |
| KFS-01 | **Defined**      | دامنه تعریف شده اما ثبت نشده       |
| KFS-02 | **Registered**   | دامنه در فدراسیون ثبت شده          |
| KFS-03 | **Connected**    | اتصال فدرال برقرار شده             |
| KFS-04 | **Mapped**       | نگاشت‌های هویتی و معنایی تکمیل شده |
| KFS-05 | **Validated**    | اعتبارسنجی با موفقیت انجام شده     |
| KFS-06 | **Federated**    | فدراسیون فعال است                  |
| KFS-07 | **Deprecated**   | دامنه در حال بازنشستگی             |
| KFS-08 | **Disconnected** | اتصال فدرال قطع شده                |

### انتقال‌های مجاز

| از     | به     | شرط                        |
| ------ | ------ | -------------------------- |
| KFS-01 | KFS-02 | ثبت دامنه در فدراسیون      |
| KFS-02 | KFS-03 | برقراری اتصال اولیه        |
| KFS-02 | KFS-08 | عدم موفقیت در اتصال        |
| KFS-03 | KFS-04 | تکمیل نگاشت هویتی و معنایی |
| KFS-03 | KFS-08 | شکست در نگاشت              |
| KFS-04 | KFS-05 | اعتبارسنجی نگاشت‌ها        |
| KFS-04 | KFS-08 | عدم تأیید نگاشت‌ها         |
| KFS-05 | KFS-06 | فعال‌سازی فدراسیون         |
| KFS-05 | KFS-04 | نیاز به بازنگاری نگاشت‌ها  |
| KFS-06 | KFS-05 | نیاز به اعتبارسنجی مجدد    |
| KFS-06 | KFS-07 | اعلام بازنشستگی            |
| KFS-07 | KFS-06 | لغو بازنشستگی              |
| KFS-07 | KFS-08 | قطع اتصال نهایی            |
| KFS-08 | KFS-02 | ثبت مجدد دامنه             |
| KFS-08 | KFS-01 | بازگشت به تعریف            |
| KFS-06 | KFS-03 | نیاز به اتصال مجدد         |
| KFS-06 | KFS-08 | قطع اتصال مستقیم           |
| KFS-01 | KFS-08 | انصراف از فدراسیون         |

---

## ۱۴. Federation Models

۸ مدل فدراسیون دانش:

| ID      | مدل                            | توضیح                                                                     | دامنه  |
| ------- | ------------------------------ | ------------------------------------------------------------------------- | ------ |
| KFMD-01 | **Identity Federation**        | فدراسیون مبتنی بر هویت — موجودیت‌ها در دامنه‌های مختلف شناسایی می‌شوند    | KFD-02 |
| KFMD-02 | **Semantic Federation**        | فدراسیون مبتنی بر معنا — مفاهیم بین دامنه‌ها ترجمه می‌شوند                | KFD-03 |
| KFMD-03 | **Discovery Federation**       | فدراسیون مبتنی بر کشف — دانش در دامنه‌های مختلف قابل کشف است              | KFD-04 |
| KFMD-04 | **Query Federation**           | فدراسیون مبتنی بر پرس‌وجو — پرس‌وجوها در دامنه‌های متعدد اجرا می‌شوند     | KFD-05 |
| KFMD-05 | **Governance Federation**      | فدراسیون مبتنی بر حکمرانی — سیاست‌ها و قواعد اشتراک‌گذاری                 | KFD-06 |
| KFMD-06 | **Synchronization Federation** | فدراسیون مبتنی بر همگام‌سازی — تغییرات بین دامنه‌ها منتشر می‌شوند         | KFD-07 |
| KFMD-07 | **Hybrid Federation**          | ترکیب چند مدل فدراسیون                                                    | KFD-08 |
| KFMD-08 | **Federated Registry**         | فدراسیون مبتنی بر ثبت‌مرکزی — دامنه‌ها از طریق رجیستری مرکزی متصل می‌شوند | KFD-08 |

---

## ۱۵. Federation Relationships

۱۰ رابطه اصلی فدراسیون دانش:

| ID     | رابطه             | مبدأ                | مقصد              | توضیح                                 |
| ------ | ----------------- | ------------------- | ----------------- | ------------------------------------- |
| KFR-01 | **Federates**     | FederatedDomain     | Federation        | دامنه عضو فدراسیون است                |
| KFR-02 | **Maps To**       | IdentityMapping     | FederatedIdentity | نگاشت هویت به هویت فدرال              |
| KFR-03 | **Aligns With**   | SemanticMapping     | ConceptMapping    | نگاشت معنایی به نگاشت مفهوم           |
| KFR-04 | **Governs**       | FederationContract  | FederatedDomain   | قرارداد فدرال دامنه را حکمرانی می‌کند |
| KFR-05 | **Executes On**   | FederatedQuery      | FederatedDomain   | پرس‌وجو روی دامنه اجرا می‌شود         |
| KFR-06 | **Produces**      | FederatedQuery      | FederatedResult   | پرس‌وجو نتیجه تولید می‌کند            |
| KFR-07 | **Propagates To** | SynchronizationRule | FederatedDomain   | تغییرات به دامنه منتشر می‌شود         |
| KFR-08 | **Trusts**        | FederatedDomain     | FederatedDomain   | رابطه اعتماد بین دامنه‌ها             |
| KFR-09 | **Depends On**    | FederatedDomain     | FederatedDomain   | وابستگی یک دامنه به دامنه دیگر        |
| KFR-10 | **Records**       | FederationRegistry  | FederationEvent   | رجیستری رویدادها را ثبت می‌کند        |

---

## ۱۶. Federation Integrity

یکپارچگی فدراسیون دانش بر اساس ۴ بعد تعریف می‌شود:

### بعد ۱: یکپارچگی هویتی (Identity Integrity)

| قاعده                                             | توضیح |
| ------------------------------------------------- | ----- |
| هر موجودیت در فدراسیون یک هویت فدرال یکتا دارد    |
| هر هویت محلی حداکثر به یک هویت فدرال نگاشت می‌شود |
| هویت فدرال پس از ثبت قابل تغییر نیست              |

### بعد ۲: یکپارچگی معنایی (Semantic Integrity)

| قاعده                                                     | توضیح |
| --------------------------------------------------------- | ----- |
| هر نگاشت معنایی دو مفهوم در دو دامنه را به هم متصل می‌کند |
| نگاشت‌های معنایی باید دوطرفه (bidirectional) باشند        |
| زنجیره نگاشت‌ها باید بدون دور (acyclic) باشد              |

### بعد ۳: یکپارچگی قراردادی (Contract Integrity)

| قاعده                                              | توضیح |
| -------------------------------------------------- | ----- |
| هر دامنه عضو باید یک قرارداد فدرال فعال داشته باشد |
| قرارداد باید پیش از اتصال منعقد شود                |
| قرارداد منسوخ به قطع اتصال منتهی می‌شود            |

### بعد ۴: یکپارچگی عملیاتی (Operational Integrity)

| قاعده                                   | توضیح |
| --------------------------------------- | ----- |
| هر رویداد فدرال باید در رجیستری ثبت شود |
| تغییرات باید به صورت اتمی منتشر شوند    |
| تعارضات باید پیش از فعال‌سازی حل شوند   |

---

## ۱۷. Federation Consistency Rules

۱۲ قاعده سازگاری فدراسیون دانش:

| ID      | قاعده                                                        | توضیح                   |
| ------- | ------------------------------------------------------------ | ----------------------- |
| KFCR-01 | یک دامنه نمی‌تواند همزمان در دو وضعیت فعال باشد              | KFS mutually exclusive  |
| KFCR-02 | نگاشت‌ها باید پس از تغییر دامنه مبدأ بازبینی شوند            | Stale mapping detection |
| KFCR-03 | پرس‌وجوی فدرال فقط روی دامنه‌های فعال (KFS-06) اجرا می‌شود   | Query scope validation  |
| KFCR-04 | نتایج فدرال باید منبع هر بخش را مشخص کنند                    | Source traceability     |
| KFCR-05 | اعتماد بین دامنه‌ها باید دوره‌ای بازبینی شود                 | Trust refresh           |
| KFCR-06 | قراردادهای فدرال باید پیش از انقضا تمدید شوند                | Contract expiry         |
| KFCR-07 | همگام‌سازی باید وضعیت ناسازگار (conflict) را گزارش دهد       | Conflict reporting      |
| KFCR-08 | خروج دامنه از فدراسیون باید تمام وابستگی‌ها را اطلاع‌دهی کند | Dependency notification |
| KFCR-09 | نگاشت‌های معنایی نباید دور ایجاد کنند                        | Acyclic mapping         |
| KFCR-10 | دامنه‌های جدید باید پیش از پیوستن ارزیابی شوند               | Pre-join assessment     |
| KFCR-11 | تغییر در یک دامنه نباید فدراسیون دامنه‌های دیگر را بشکند     | Backward compatibility  |
| KFCR-12 | تمام رویدادهای فدرال باید در Audit Trail ثبت شوند            | Full audit              |

---

## ۱۸. Federation Governance

حکمرانی فدراسیون دانش بر اساس ۵ سطح اختیار (A-0 تا A-4) و ۴ حوزه حکمرانی تعریف می‌شود:

### حوزه‌های حکمرانی

| حوزه                      | توضیح                                          |
| ------------------------- | ---------------------------------------------- |
| **Membership Governance** | حکمرانی عضویت — ثبت، تأیید، خروج دامنه‌ها      |
| **Contract Governance**   | حکمرانی قرارداد — انعقاد، بازبینی، فسخ         |
| **Access Governance**     | حکمرانی دسترسی — سطح دسترسی دامنه‌ها به یکدیگر |
| **Audit Governance**      | حکمرانی حسابرسی — ثبت و بازبینی رویدادها       |

### مدل تصمیم‌گیری

| نوع تصمیم          | سطح اختیار | مسئول         |
| ------------------ | ---------- | ------------- |
| ثبت دامنه جدید     | A-2        | مدیر فدراسیون |
| انعقاد قرارداد     | A-3        | افسر حکمرانی  |
| تغییر سطح دسترسی   | A-3        | افسر حکمرانی  |
| قطع اتصال دامنه    | A-2        | مدیر فدراسیون |
| بازنشستگی فدراسیون | A-4        | معمار ارشد    |
| حل تعارض           | A-2        | مدیر فدراسیون |

---

## ۱۹. Federation Resolution Model

مدل تفکیک فدرال (Federation Resolution) نحوه تبدیل یک شناسه محلی به شناسه فدرال را مشخص می‌کند. تفکیک در ۵ مرحله انجام می‌شود:

| مرحله  | نام                               | ورودی                   | خروجی             |
| ------ | --------------------------------- | ----------------------- | ----------------- |
| FRS-01 | **Local Identity Capture**        | شناسه محلی + دامنه مبدأ | LocalIdentity     |
| FRS-02 | **Domain Resolution**             | دامنه مبدأ              | FederationDomain  |
| FRS-03 | **Identity Mapping Lookup**       | LocalIdentity           | IdentityMapping   |
| FRS-04 | **Federated Identity Resolution** | IdentityMapping         | FederatedIdentity |
| FRS-05 | **Federation Context Enrichment** | FederatedIdentity       | FederatedContext  |

---

## ۲۰. Federation Metrics

۱۵ معیار اصلی ارزیابی فدراسیون دانش:

| ID      | معیار                           | توضیح                                    | واحد       |
| ------- | ------------------------------- | ---------------------------------------- | ---------- |
| KFM-001 | Federation Coverage             | درصد دامنه‌های دانشی عضو فدراسیون        | درصد       |
| KFM-002 | Identity Resolution Rate        | درصد تفکیک‌های موفق هویت                 | درصد       |
| KFM-003 | Semantic Alignment Completeness | درصد مفاهیم نگاشت‌شده                    | درصد       |
| KFM-004 | Query Success Rate              | درصد پرس‌وجوهای فدرال موفق               | درصد       |
| KFM-005 | Query Latency                   | زمان متوسط پاسخ پرس‌وجوی فدرال           | میلی‌ثانیه |
| KFM-006 | Synchronization Delay           | تأخیر متوسط انتشار تغییرات               | میلی‌ثانیه |
| KFM-007 | Conflict Rate                   | درصد پرس‌وجوهای با تعارض                 | درصد       |
| KFM-008 | Contract Compliance             | درصد انطباق با قراردادهای فدرال          | درصد       |
| KFM-009 | Domain Availability             | درصد در دسترس بودن دامنه‌های عضو         | درصد       |
| KFM-010 | Federation Churn                | نرخ خروج و ورود دامنه‌ها                 | تعداد/ماه  |
| KFM-011 | Audit Completeness              | درصد رویدادهای ثبت‌شده                   | درصد       |
| KFM-012 | Trust Level Distribution        | توزیع سطوح اعتماد دامنه‌ها               | توزیع      |
| KFM-013 | Mapping Freshness               | میانگین زمان آخرین بازبینی نگاشت‌ها      | روز        |
| KFM-014 | Cross-Domain Query Depth        | میانگین تعداد دامنه‌های درگیر در پرس‌وجو | عدد        |
| KFM-015 | Federation Evolution Rate       | نرخ تکامل فدراسیون (تغییرات/ماه)         | تعداد/ماه  |

---

## ۲۱. Federation Constraints

۸ محدودیت اصلی فدراسیون دانش:

| ID       | محدودیت                                                          | توضیح                      |
| -------- | ---------------------------------------------------------------- | -------------------------- |
| KFCST-01 | یک دامنه فقط یک بار می‌تواند در فدراسیون ثبت شود                 | Unique registration        |
| KFCST-02 | هویت فدرال پس از ثبت قابل تغییر نیست                             | Immutable identity         |
| KFCST-03 | پرس‌وجوی فدرال فقط به دامنه‌های عضو محدود می‌شود                 | Membership boundary        |
| KFCST-04 | نگاشت‌ها باید پیش از فعال‌سازی اعتبارسنجی شوند                   | Pre-activation validation  |
| KFCST-05 | قرارداد فدرال باید دارای تاریخ انقضا باشد                        | Contract expiry            |
| KFCST-06 | دامنه در وضعیت Deprecated به پرس‌وجو پاسخ نمی‌دهد                | Deprecated no-query        |
| KFCST-07 | تغییرات تنها یک‌طرفه (منبع→مقصد) منتشر می‌شوند                   | Unidirectional propagation |
| KFCST-08 | فدراسیون نباید باعث تکرار داده شود (Federation over Replication) | No replication             |

---

## ۲۲. Federation Quality Gates

۷ گیت کیفیت فدراسیون دانش:

| ID      | گیت                             | مرحله   | معیار عبور                           |
| ------- | ------------------------------- | ------- | ------------------------------------ |
| KFQG-01 | **Contract Review**             | KFST-03 | قرارداد توسط حکمرانی تأیید شده است   |
| KFQG-02 | **Identity Mapping Validation** | KFST-04 | تمام موجودیت‌های حیاتی نگاشت شده‌اند |
| KFQG-03 | **Semantic Alignment Review**   | KFST-05 | دقت نگاشت ≥ ۹۵٪                      |
| KFQG-04 | **Connection Verification**     | KFST-06 | اتصال با موفقیت برقرار شده است       |
| KFQG-05 | **Integration Test**            | KFST-07 | پرس‌وجوی آزمایشی موفق                |
| KFQG-06 | **Governance Compliance**       | KFST-07 | انطباق با حکمرانی تأیید شده است      |
| KFQG-07 | **Federation Readiness**        | KFST-08 | تمام گیت‌های قبلی عبور کرده‌اند      |

---

## ۲۳. Cross-Family Mapping

نگاشت فدراسیون دانش با سایر خانواده‌های دانشی SMOS:

| خانواده دانش           | دامنه         | ارتباط با فدراسیون                                  |
| ---------------------- | ------------- | --------------------------------------------------- |
| KNW-BUS (KNW-101..104) | کسب‌وکار      | فدراسیون دامنه‌های کسب‌وکار                         |
| KNW-PLT (KNW-301..308) | پلتفرم        | فدراسیون دامنه‌های پلتفرمی                          |
| KNW-OPS (KNW-401..405) | عملیات        | فدراسیون دامنه‌های عملیاتی                          |
| KNW-AI (KNW-501..510)  | هوش مصنوعی    | فدراسیون دامنه‌های هوش مصنوعی                       |
| KNW-BRD (KNW-701)      | برند          | فدراسیون دامنه‌های برند                             |
| KNW-REF (KNW-801)      | مرجع          | فدراسیون دامنه‌های مرجع                             |
| KNW-ENG (KNW-201..204) | موتورهای دانش | مصرف‌کننده فدراسیون — کامپایلر، گراف، معنا، پرس‌وجو |
| COM-001..005           | ارتباطات      | فدراسیون دامنه‌های محتوایی                          |

---

## ۲۴. Federation Discovery Model

مدل کشف فدرال (Federated Discovery) نحوه یافتن دانش در دامنه‌های مختلف را مشخص می‌کند:

### مراحل کشف فدرال

| مرحله                   | توضیح                                  |
| ----------------------- | -------------------------------------- |
| **Intent Broadcast**    | ارسال قصد پرس‌وجو به دامنه‌های عضو     |
| **Capability Matching** | تطبیق قصد با قابلیت‌های دامنه‌ها       |
| **Domain Selection**    | انتخاب دامنه‌های واجد شرایط            |
| **Query Distribution**  | توزیع پرس‌وجو بین دامنه‌های انتخاب‌شده |
| **Result Collection**   | جمع‌آوری نتایج از دامنه‌ها             |
| **Result Composition**  | ترکیب نتایج در یک پاسخ واحد            |
| **Result Delivery**     | تحویل نتیجه ترکیبی به مصرف‌کننده       |

### الگوهای کشف

| الگو          | توضیح                                            |
| ------------- | ------------------------------------------------ |
| **Broadcast** | پرس‌وجو به تمام دامنه‌های عضو ارسال می‌شود       |
| **Selective** | پرس‌وجو به دامنه‌های منتخب ارسال می‌شود          |
| **Cascading** | پرس‌وجو به ترتیب اولویت به دامنه‌ها ارسال می‌شود |
| **Parallel**  | پرس‌وجو به صورت همزمان به چند دامنه ارسال می‌شود |

---

## ۲۵. Federation Evolution Model

مدل تکامل فدراسیون دانش در ۵ سطح تعریف می‌شود:

| سطح    | نام                       | توضیح                                                    |
| ------ | ------------------------- | -------------------------------------------------------- |
| FEL-01 | **Initial Federation**    | فدراسیون اولیه — یک دامنه مرکزی + یک دامنه عضو           |
| FEL-02 | **Structured Federation** | فدراسیون ساختاریافته — چند دامنه با توپولوژی مشخص        |
| FEL-03 | **Semantic Federation**   | فدراسیون معنایی — نگاشت‌های معنایی کامل بین دامنه‌ها     |
| FEL-04 | **Governed Federation**   | فدراسیون حکمرانی‌شده — حکمرانی، قراردادها و حسابرسی فعال |
| FEL-05 | **Adaptive Federation**   | فدراسیون تطبیقی — تشخیص خودکار تغییرات و تطبیق نگاشت‌ها  |

### محرک‌های تکامل

| ID     | محرک                    | توضیح                      |
| ------ | ----------------------- | -------------------------- |
| FEV-01 | New Domain Addition     | اضافه شدن دامنه دانشی جدید |
| FEV-02 | Domain Evolution        | تکامل یک دامنه عضو         |
| FEV-03 | Governance Change       | تغییر در حکمرانی فدرال     |
| FEV-04 | Performance Requirement | نیاز به بهبود عملکرد       |
| FEV-05 | Security Requirement    | نیاز به افزایش امنیت       |
| FEV-06 | Scale Requirement       | نیاز به مقیاس‌پذیری        |

---

## ۲۶. Federation Traceability Model

مدل ردیابی فدرال (Federation Traceability) نحوه ردیابی منشأ و تغییرات دانش در سراسر فدراسیون را مشخص می‌کند:

### ابعاد ردیابی

| بعد                      | توضیح                              |
| ------------------------ | ---------------------------------- |
| **Source Traceability**  | ردیابی منبع هر داده تا دامنه مبدأ  |
| **Mapping Traceability** | ردیابی نگاشت‌های اعمال‌شده بر داده |
| **Query Traceability**   | ردیابی مسیر پرس‌وجو در دامنه‌ها    |
| **Change Traceability**  | ردیابی تغییرات و انتشار آنها       |
| **Audit Traceability**   | ردیابی رویدادهای فدرال             |

### ساختار رد (Trace Entry)

| فیلد          | توضیح                                 |
| ------------- | ------------------------------------- |
| trace_id      | شناسه یکتای رد                        |
| source_domain | دامنه مبدأ                            |
| target_domain | دامنه مقصد                            |
| mapping_id    | شناسه نگاشت استفاده‌شده               |
| operation     | نوع عملیات (read, resolve, map, sync) |
| timestamp     | زمان ثبت                              |
| status        | وضعیت عملیات                          |

---

## ۲۷. Machine Readable JSON Blocks

### Block 1 — Federation Concepts

```json
{
  "$schema": "KNW-205-concept-registry",
  "federation_concepts": [
    { "id": "KFC-001", "name": "Federation", "domain": "KFD-08", "layer": "LYR-FED-05" },
    { "id": "KFC-002", "name": "Federated Domain", "domain": "KFD-01", "layer": "LYR-FED-01" },
    { "id": "KFC-003", "name": "Federated Identity", "domain": "KFD-02", "layer": "LYR-FED-01" },
    { "id": "KFC-004", "name": "Local Identity", "domain": "KFD-02", "layer": "LYR-FED-01" },
    { "id": "KFC-005", "name": "Identity Mapping", "domain": "KFD-02", "layer": "LYR-FED-01" },
    { "id": "KFC-006", "name": "Semantic Alignment", "domain": "KFD-03", "layer": "LYR-FED-02" },
    { "id": "KFC-007", "name": "Concept Mapping", "domain": "KFD-03", "layer": "LYR-FED-02" },
    { "id": "KFC-008", "name": "Federation Topology", "domain": "KFD-08", "layer": "LYR-FED-05" },
    { "id": "KFC-009", "name": "Federated Query", "domain": "KFD-05", "layer": "LYR-FED-03" },
    { "id": "KFC-010", "name": "Federated Result", "domain": "KFD-05", "layer": "LYR-FED-03" },
    { "id": "KFC-011", "name": "Trust Level", "domain": "KFD-06", "layer": "LYR-FED-04" },
    { "id": "KFC-012", "name": "Sharing Policy", "domain": "KFD-06", "layer": "LYR-FED-04" },
    { "id": "KFC-013", "name": "Federation Contract", "domain": "KFD-06", "layer": "LYR-FED-04" },
    { "id": "KFC-014", "name": "Synchronization Rule", "domain": "KFD-07", "layer": "LYR-FED-05" },
    { "id": "KFC-015", "name": "Conflict Resolution", "domain": "KFD-07", "layer": "LYR-FED-05" },
    { "id": "KFC-016", "name": "Federation Boundary", "domain": "KFD-08", "layer": "LYR-FED-05" },
    { "id": "KFC-017", "name": "Federation Registry", "domain": "KFD-08", "layer": "LYR-FED-05" },
    { "id": "KFC-018", "name": "Federation Gateway", "domain": "KFD-08", "layer": "LYR-FED-05" },
    { "id": "KFC-019", "name": "Federation Event", "domain": "KFD-08", "layer": "LYR-FED-05" },
    { "id": "KFC-020", "name": "Federation Audit Trail", "domain": "KFD-08", "layer": "LYR-FED-05" }
  ]
}
```

### Block 2 — Federation Entities

```json
{
  "$schema": "KNW-205-entity-registry",
  "federation_entities": [
    { "id": "KFE-001", "name": "Federation", "domain": "KFD-08", "type": "Core" },
    { "id": "KFE-002", "name": "FederatedDomain", "domain": "KFD-01", "type": "Core" },
    { "id": "KFE-003", "name": "FederatedIdentity", "domain": "KFD-02", "type": "Core" },
    { "id": "KFE-004", "name": "IdentityMapping", "domain": "KFD-02", "type": "Core" },
    { "id": "KFE-005", "name": "SemanticMapping", "domain": "KFD-03", "type": "Core" },
    { "id": "KFE-006", "name": "FederationContract", "domain": "KFD-06", "type": "Governance" },
    { "id": "KFE-007", "name": "SharingPolicy", "domain": "KFD-06", "type": "Governance" },
    { "id": "KFE-008", "name": "FederatedQuery", "domain": "KFD-05", "type": "Operational" },
    { "id": "KFE-009", "name": "FederatedResult", "domain": "KFD-05", "type": "Operational" },
    { "id": "KFE-010", "name": "SynchronizationRule", "domain": "KFD-07", "type": "Operational" },
    { "id": "KFE-011", "name": "FederationEvent", "domain": "KFD-08", "type": "Audit" },
    { "id": "KFE-012", "name": "FederationRegistry", "domain": "KFD-08", "type": "Core" }
  ]
}
```

### Block 3 — Federation Capabilities

```json
{
  "$schema": "KNW-205-capability-registry",
  "federation_capabilities": [
    { "id": "KFCAP-001", "name": "Domain Registration", "layer": "LYR-FED-01", "domain": "KFD-01" },
    { "id": "KFCAP-002", "name": "Identity Resolution", "layer": "LYR-FED-01", "domain": "KFD-02" },
    { "id": "KFCAP-003", "name": "Semantic Alignment", "layer": "LYR-FED-02", "domain": "KFD-03" },
    { "id": "KFCAP-004", "name": "Concept Translation", "layer": "LYR-FED-02", "domain": "KFD-03" },
    { "id": "KFCAP-005", "name": "Federated Discovery", "layer": "LYR-FED-03", "domain": "KFD-04" },
    { "id": "KFCAP-006", "name": "Distributed Query", "layer": "LYR-FED-03", "domain": "KFD-05" },
    { "id": "KFCAP-007", "name": "Result Composition", "layer": "LYR-FED-03", "domain": "KFD-05" },
    { "id": "KFCAP-008", "name": "Trust Assessment", "layer": "LYR-FED-04", "domain": "KFD-06" },
    { "id": "KFCAP-009", "name": "Policy Enforcement", "layer": "LYR-FED-04", "domain": "KFD-06" },
    { "id": "KFCAP-010", "name": "Contract Management", "layer": "LYR-FED-04", "domain": "KFD-06" },
    { "id": "KFCAP-011", "name": "Change Propagation", "layer": "LYR-FED-05", "domain": "KFD-07" },
    { "id": "KFCAP-012", "name": "Conflict Resolution", "layer": "LYR-FED-05", "domain": "KFD-07" },
    {
      "id": "KFCAP-013",
      "name": "Federation Monitoring",
      "layer": "LYR-FED-05",
      "domain": "KFD-08"
    },
    { "id": "KFCAP-014", "name": "Federation Audit", "layer": "LYR-FED-05", "domain": "KFD-08" }
  ]
}
```

### Block 4 — Federation Functions

```json
{
  "$schema": "KNW-205-function-registry",
  "federation_functions": [
    { "id": "KFF-01", "name": "Register Domain", "capability": "KFCAP-001", "domain": "KFD-01" },
    { "id": "KFF-02", "name": "Resolve Identity", "capability": "KFCAP-002", "domain": "KFD-02" },
    { "id": "KFF-03", "name": "Align Semantics", "capability": "KFCAP-003", "domain": "KFD-03" },
    { "id": "KFF-04", "name": "Translate Concept", "capability": "KFCAP-004", "domain": "KFD-03" },
    {
      "id": "KFF-05",
      "name": "Discover Across Domains",
      "capability": "KFCAP-005",
      "domain": "KFD-04"
    },
    {
      "id": "KFF-06",
      "name": "Execute Federated Query",
      "capability": "KFCAP-006",
      "domain": "KFD-05"
    },
    { "id": "KFF-07", "name": "Compose Results", "capability": "KFCAP-007", "domain": "KFD-05" },
    { "id": "KFF-08", "name": "Assess Trust Level", "capability": "KFCAP-008", "domain": "KFD-06" },
    {
      "id": "KFF-09",
      "name": "Enforce Sharing Policy",
      "capability": "KFCAP-009",
      "domain": "KFD-06"
    },
    {
      "id": "KFF-10",
      "name": "Manage Federation Contract",
      "capability": "KFCAP-010",
      "domain": "KFD-06"
    },
    { "id": "KFF-11", "name": "Propagate Change", "capability": "KFCAP-011", "domain": "KFD-07" },
    { "id": "KFF-12", "name": "Resolve Conflict", "capability": "KFCAP-012", "domain": "KFD-07" },
    {
      "id": "KFF-13",
      "name": "Monitor Federation Health",
      "capability": "KFCAP-013",
      "domain": "KFD-08"
    },
    {
      "id": "KFF-14",
      "name": "Audit Federation Events",
      "capability": "KFCAP-014",
      "domain": "KFD-08"
    }
  ]
}
```

### Block 5 — Federation Stages

```json
{
  "$schema": "KNW-205-stage-registry",
  "federation_stages": [
    {
      "id": "KFST-01",
      "name": "Domain Identification",
      "input": "KnowledgeDomain",
      "output": "DomainProfile",
      "domain": "KFD-01"
    },
    {
      "id": "KFST-02",
      "name": "Capability Assessment",
      "input": "DomainProfile",
      "output": "CapabilityReport",
      "domain": "KFD-01"
    },
    {
      "id": "KFST-03",
      "name": "Contract Negotiation",
      "input": "CapabilityReport",
      "output": "FederationContract",
      "domain": "KFD-06"
    },
    {
      "id": "KFST-04",
      "name": "Identity Mapping",
      "input": "FederationContract",
      "output": "IdentityMap",
      "domain": "KFD-02"
    },
    {
      "id": "KFST-05",
      "name": "Semantic Alignment",
      "input": "IdentityMap",
      "output": "SemanticMap",
      "domain": "KFD-03"
    },
    {
      "id": "KFST-06",
      "name": "Connection Establishment",
      "input": "SemanticMap",
      "output": "FederationConnection",
      "domain": "KFD-01"
    },
    {
      "id": "KFST-07",
      "name": "Validation",
      "input": "FederationConnection",
      "output": "ValidationReport",
      "domain": "KFD-05"
    },
    {
      "id": "KFST-08",
      "name": "Federation Activation",
      "input": "ValidationReport",
      "output": "ActiveFederation",
      "domain": "KFD-08"
    }
  ],
  "total_stages": 8
}
```

### Block 6 — Federation Models

```json
{
  "$schema": "KNW-205-model-registry",
  "federation_models": [
    {
      "id": "KFMD-01",
      "name": "Identity Federation",
      "domain": "KFD-02",
      "input": "LocalIdentity",
      "output": "FederatedIdentity",
      "consumers": ["AI-011", "AI-014"]
    },
    {
      "id": "KFMD-02",
      "name": "Semantic Federation",
      "domain": "KFD-03",
      "input": "LocalConcept",
      "output": "FederatedConcept",
      "consumers": ["AI-003", "AI-011"]
    },
    {
      "id": "KFMD-03",
      "name": "Discovery Federation",
      "domain": "KFD-04",
      "input": "DiscoveryIntent",
      "output": "DiscoveryResult",
      "consumers": ["AI-001", "AI-005"]
    },
    {
      "id": "KFMD-04",
      "name": "Query Federation",
      "domain": "KFD-05",
      "input": "FederatedQuery",
      "output": "FederatedResult",
      "consumers": ["AI-011", "AI-014"]
    },
    {
      "id": "KFMD-05",
      "name": "Governance Federation",
      "domain": "KFD-06",
      "input": "FederationContract",
      "output": "GovernanceStatus",
      "consumers": ["AI-004", "AI-014"]
    },
    {
      "id": "KFMD-06",
      "name": "Synchronization Federation",
      "domain": "KFD-07",
      "input": "ChangeEvent",
      "output": "SyncStatus",
      "consumers": ["AI-011", "AI-012"]
    },
    {
      "id": "KFMD-07",
      "name": "Hybrid Federation",
      "domain": "KFD-08",
      "input": "FederationRequirements",
      "output": "FederatedSystem",
      "consumers": ["AI-014"]
    },
    {
      "id": "KFMD-08",
      "name": "Federated Registry",
      "domain": "KFD-08",
      "input": "DomainRegistration",
      "output": "FederatedDomain",
      "consumers": ["AI-011", "AI-014"]
    }
  ],
  "total_models": 8
}
```

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Federation Contract Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "KNW-205-federation-contract",
  "title": "Federation Contract Schema",
  "description": "Schema for a federation contract in the Enterprise Knowledge Federation Architecture",
  "type": "object",
  "properties": {
    "contract_id": {
      "type": "string",
      "description": "شناسه یکتای قرارداد فدرال",
      "pattern": "^KFC-[0-9]{8}-[A-Z0-9]{8}$"
    },
    "federation_id": {
      "type": "string",
      "description": "شناسه فدراسیون"
    },
    "domain_id": {
      "type": "string",
      "description": "شناسه دامنه عضو"
    },
    "contract_type": {
      "type": "string",
      "description": "نوع قرارداد",
      "enum": ["membership", "access", "sharing", "synchronization"]
    },
    "trust_level": {
      "type": "string",
      "description": "سطح اعتماد",
      "enum": ["TRL-01", "TRL-02", "TRL-03", "TRL-04", "TRL-05"]
    },
    "sharing_policies": {
      "type": "array",
      "description": "سیاست‌های اشتراک‌گذاری",
      "items": {
        "type": "object",
        "properties": {
          "policy_id": { "type": "string" },
          "knowledge_families": { "type": "array", "items": { "type": "string" } },
          "access_level": { "type": "string", "enum": ["read", "resolve", "query", "sync"] }
        }
      }
    },
    "valid_from": {
      "type": "string",
      "description": "تاریخ شروع اعتبار",
      "format": "date-time"
    },
    "valid_until": {
      "type": "string",
      "description": "تاریخ انقضا",
      "format": "date-time"
    },
    "status": {
      "type": "string",
      "description": "وضعیت قرارداد",
      "enum": ["active", "expired", "terminated", "suspended"]
    }
  },
  "required": [
    "contract_id",
    "federation_id",
    "domain_id",
    "contract_type",
    "trust_level",
    "valid_from",
    "valid_until"
  ]
}
```

### Schema 2 — Identity Mapping Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "KNW-205-identity-mapping",
  "title": "Identity Mapping Schema",
  "description": "Schema for an identity mapping in the Enterprise Knowledge Federation Architecture",
  "type": "object",
  "properties": {
    "mapping_id": {
      "type": "string",
      "description": "شناسه یکتای نگاشت"
    },
    "local_identity": {
      "type": "object",
      "description": "هویت محلی",
      "properties": {
        "domain_id": { "type": "string" },
        "local_id": { "type": "string" },
        "local_type": { "type": "string" }
      }
    },
    "federated_identity": {
      "type": "object",
      "description": "هویت فدرال",
      "properties": {
        "federated_id": { "type": "string" },
        "federated_type": { "type": "string" }
      }
    },
    "mapping_type": {
      "type": "string",
      "description": "نوع نگاشت",
      "enum": ["direct", "transformed", "contextual"]
    },
    "confidence": {
      "type": "number",
      "description": "اطمینان از نگاشت",
      "minimum": 0,
      "maximum": 1
    },
    "status": {
      "type": "string",
      "description": "وضعیت نگاشت",
      "enum": ["active", "stale", "conflict", "broken"]
    }
  },
  "required": ["mapping_id", "local_identity", "federated_identity", "mapping_type", "status"]
}
```

### Schema 3 — Federation Event Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "KNW-205-federation-event",
  "title": "Federation Event Schema",
  "description": "Schema for a federation event in the Enterprise Knowledge Federation Architecture",
  "type": "object",
  "properties": {
    "event_id": {
      "type": "string",
      "description": "شناسه یکتای رویداد"
    },
    "event_type": {
      "type": "string",
      "description": "نوع رویداد",
      "enum": [
        "domain_registered",
        "domain_connected",
        "domain_disconnected",
        "contract_signed",
        "contract_expired",
        "mapping_updated",
        "conflict_detected",
        "conflict_resolved",
        "synchronization_completed",
        "federation_activated",
        "federation_deprecated"
      ]
    },
    "source_domain": {
      "type": "string",
      "description": "دامنه مبدأ رویداد"
    },
    "target_domains": {
      "type": "array",
      "description": "دامنه‌های مقصد",
      "items": { "type": "string" }
    },
    "timestamp": {
      "type": "string",
      "description": "زمان رویداد",
      "format": "date-time"
    },
    "severity": {
      "type": "string",
      "description": "شدت رویداد",
      "enum": ["info", "warning", "error", "critical"]
    },
    "details": {
      "type": "object",
      "description": "جزئیات رویداد"
    },
    "trace_id": {
      "type": "string",
      "description": "شناسه رد برای ردیابی"
    }
  },
  "required": ["event_id", "event_type", "source_domain", "timestamp", "severity"]
}
```

---

## ۲۹. Federation Integrity Rules

### قواعد یکپارچگی فدراسیون

| ID       | قاعده                                     | توضیح                                                        | منبع     |
| -------- | ----------------------------------------- | ------------------------------------------------------------ | -------- |
| FINTR-01 | هر دامنه یک هویت فدرال یکتا دارد          | دامنه‌های تکراری مجاز نیستند                                 | KFCST-01 |
| FINTR-02 | هر موجودیت یک هویت فدرال دارد             | موجودیت‌های بدون هویت فدرال نمی‌توانند در فدراسیون شرکت کنند | KFCST-02 |
| FINTR-03 | قراردادها دارای تاریخ انقضا هستند         | قراردادهای منقضی به قطع اتصال منتهی می‌شوند                  | KFCST-05 |
| FINTR-04 | نگاشت‌ها باید پیش از فعال‌سازی تأیید شوند | نگاشت‌های تأییدنشده معتبر نیستند                             | KFCST-04 |
| FINTR-05 | دامنه منسوخ به پرس‌وجو پاسخ نمی‌دهد       | دامنه در وضعیت Deprecated غیرفعال است                        | KFCST-06 |
| FINTR-06 | انتشار تغییرات یک‌طرفه است                | تغییرات از مبدأ به مقصد منتشر می‌شوند                        | KFCST-07 |
| FINTR-07 | بدون تکرار داده در فدراسیون               | فدراسیون جایگزین replication است                             | KFCST-08 |
| FINTR-08 | تمام رویدادها ثبت می‌شوند                 | هیچ رویداد فدرالی بدون ثبت باقی نمی‌ماند                     | KFCST-03 |

---

## ۳۰. Cross-Domain Federation Mapping

### نگاشت بین دامنه‌های فدراسیون

| دامنه مبدأ            | دامنه مقصد            | نوع نگاشت  | توضیح                                          |
| --------------------- | --------------------- | ---------- | ---------------------------------------------- |
| KFD-01 (Registration) | KFD-02 (Identity)     | Direct     | ثبت دامنه به تفکیک هویت منتهی می‌شود           |
| KFD-02 (Identity)     | KFD-03 (Semantic)     | Direct     | تفکیک هویت به نگاشت معنایی منتهی می‌شود        |
| KFD-03 (Semantic)     | KFD-04 (Discovery)    | Contextual | نگاشت معنایی کشف را تسهیل می‌کند               |
| KFD-04 (Discovery)    | KFD-05 (Query)        | Direct     | کشف به پرس‌وجو منتهی می‌شود                    |
| KFD-05 (Query)        | KFD-08 (Lifecycle)    | Delegated  | پرس‌وجو می‌تواند به رویداد چرخه حیات منتهی شود |
| KFD-06 (Governance)   | KFD-01 (Registration) | Direct     | حکمرانی ثبت دامنه را کنترل می‌کند              |
| KFD-06 (Governance)   | KFD-05 (Query)        | Contextual | حکمرانی محدوده پرس‌وجو را تعیین می‌کند         |
| KFD-07 (Sync)         | KFD-04 (Discovery)    | Delegated  | همگام‌سازی می‌تواند کشف جدید را آغاز کند       |
| KFD-08 (Lifecycle)    | KFD-06 (Governance)   | Direct     | رویداد چرخه حیات به حکمرانی گزارش می‌شود       |
| KFD-08 (Lifecycle)    | KFD-01 (Registration) | Composite  | خروج از فدراسیون نیاز به ثبت‌زدایی دارد        |

---

> **پایان KNW-205 — Enterprise Knowledge Federation Architecture**
> نسخه 1.0.0-draft — ۲۰۲۶-۰۷-۰۶
> **معماری — بدون پیاده‌سازی — خنثی از نظر فناوری**
