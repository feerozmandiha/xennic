# Enterprise Platform Relationship Architecture — معماری روابط پلتفرم

> **شناسه:** KNW-303
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-29
> **مسئول:** معمار دانش سازمانی
> **وابستگی:** [KNW-301](./300-platform-knowledge-foundation.md), [KNW-302](./302-platform-capability-service-architecture.md), [KNW-000](./00-enterprise-knowledge-architecture.md), [KNW-001](./10-knowledge-index.md)
> **مخاطب:** human, ai-agent, knowledge-engineer, platform-architect, relationship-manager

---

## ۱. Purpose

KNW-303 معماری روابط پلتفرم سازمانی SMOS است. این سند SSOT (تک منبع حقیقت) برای **تعریف، طبقه‌بندی و ثبت روابط** بین همه موجودیت‌های پلتفرمی تعریف‌شده در KNW-301 و KNW-302 است.

### چرا KNW-303 وجود دارد

بدون یک معماری روابط پلتفرمی:

- روابط بین دامنه‌ها، لایه‌ها، قابلیت‌ها، سرویس‌ها، مؤلفه‌ها و ماژول‌ها بدون ساختار و ضمنی باقی می‌مانند
- Agentها نمی‌توانند گراف وابستگی و تعامل پلتفرمی را به صورت ساختاریافته مصرف کنند
- تأثیر تغییر در یک موجودیت بر سایر موجودیت‌ها قابل ردیابی نیست
- معماری یکپارچگی پلتفرم فاقد پایه دانش رسمی است
- اضافه کردن پلتفرم جدید نیازمند تحلیل دستی روابط است

KNW-303 این مشکلات را با تعریف **مدل رسمی رابطه پلتفرم** حل می‌کند.

### نقش KNW-303 در SMOS

| سند         | نقش                                                      |
| ----------- | -------------------------------------------------------- |
| KNW-301     | SSOT مفاهیم بنیادین پلتفرم (دامنه‌ها، لایه‌ها، مؤلفه‌ها) |
| KNW-302     | SSOT قابلیت‌ها و سرویس‌های پلتفرم                        |
| **KNW-303** | **SSOT روابط بین همه موجودیت‌های پلتفرم**                |
| KNW-304     | SSOT حکمرانی پلتفرم                                      |
| AI-\*       | مصرف‌کننده گراف روابط برای تصمیم‌گیری                    |
| AUT-\*      | مصرف‌کننده روابط برای مسیریابی گردش کار                  |

---

## ۲. Scope

### Inside Scope

| حوزه                | توضیح                                              |
| ------------------- | -------------------------------------------------- |
| فلسفه رابطه پلتفرمی | هستی‌شناسی رابطه در معماری پلتفرم                  |
| تاکسونومی رابطه     | دسته‌بندی انواع روابط پلتفرمی                      |
| انواع رابطه         | ساختاری، رفتاری، وابستگی، ارتباطی، داده‌ای، کنترلی |
| روابط ساختاری       | ترکیب، عضویت، containment                          |
| روابط رفتاری        | فراخوانی، اجرا، تولید                              |
| مدل وابستگی         | وابستگی‌های بین موجودیت‌های پلتفرمی                |
| مدل تعامل           | نحوه تعامل موجودیت‌ها                              |
| مدل ارتباط          | کانال‌های ارتباطی بین موجودیت‌ها                   |
| روابط قابلیتی       | ارتباط CAP-PLT\* با لایه‌ها و دامنه‌ها             |
| روابط سرویسی        | ارتباط SRV-PLT\* با مؤلفه‌ها و قابلیت‌ها           |
| روابط مؤلفه‌ای      | ارتباط PLTC\* با سرویس‌ها و ماژول‌ها               |
| روابط ماژولی        | ارتباط PLTM\* با مؤلفه‌ها و Agentها                |
| روابط لایه‌ای       | ارتباط LYR-PLT\* با دامنه‌ها و موجودیت‌ها          |
| روابط دامنه‌ای      | ارتباط PLTD\* با لایه‌ها و پلتفرم‌ها               |
| مرزهای پلتفرمی      | محدوده روابط معتبر                                 |
| روابط مالکیتی       | Ownership و stewardship                            |
| روابط حکمرانی       | انطباق، رعایت قواعد                                |
| Registry روابط      | فهرست مرکزی همه روابط                              |
| محدودیت‌های رابطه   | قواعد حاکم بر روابط                                |

### Outside Scope

| حوزه                         | دلیل                   |
| ---------------------------- | ---------------------- |
| مفاهیم بنیادین پلتفرم        | حوزه KNW-301           |
| قابلیت‌ها و سرویس‌های پلتفرم | حوزه KNW-302           |
| API و پیاده‌سازی روابط       | حوزه فنی (خارج از KNW) |
| Workflowهای مبتنی بر رابطه   | حوزه AUT-\*            |
| پرامپت‌های توصیف رابطه       | حوزه PRM-\*            |
| داده‌های عملیاتی روابط       | حوزه سیستم‌های اجرایی  |

---

## ۳. Relationship Principles

### اصول معماری رابطه پلتفرمی

| ID     | اصل                  | توضیح                                                                     |
| ------ | -------------------- | ------------------------------------------------------------------------- |
| RLP-01 | **صریح بودن**        | هر رابطه بین موجودیت‌های پلتفرمی باید صریحاً تعریف شود                    |
| RLP-02 | **یک‌طرفه بودن**     | هر رابطه دارای جهت مشخص است — روابط دوطرفه به دو رابطه مجزا تبدیل می‌شوند |
| RLP-03 | **تک منبع**          | هر رابطه تنها در KNW-303 ثبت می‌شود                                       |
| RLP-04 | **عدم بازتعریف**     | KNW-303 هیچ موجودیت جدیدی تعریف نمی‌کند — فقط رابطه تعریف می‌کند          |
| RLP-05 | **اعتبارسنجی‌پذیری** | همه روابط قابل اعتبارسنجی خودکار هستند                                    |
| RLP-06 | **ردیابی تأثیر**     | تأثیر تغییر در یک موجودیت بر موجودیت‌های مرتبط قابل ردیابی است            |
| RLP-07 | **عدم چرخه**         | روابط وابستگی باید غیرچرخه‌ای باشند                                       |

---

## ۴. Relationship Philosophy

### فلسفه رابطه پلتفرمی

SMOS رابطه پلتفرمی را به عنوان **ارتباط معنادار بین دو موجودیت پلتفرمی** تعریف می‌کند که:

1. **دارای جهت است** — از منبع به هدف
2. **دارای نوع است** — ساختاری، رفتاری، وابستگی، ارتباطی، داده‌ای، کنترلی
3. **دارای وزن است** — قوی، متوسط، ضعیف
4. **قابل اعتبارسنجی است** — با قواعد مشخص قابل بررسی است
5. **تغییرپذیر است** — با تغییر موجودیت‌ها تکامل می‌یابد

### اصول هستی‌شناسی رابطه

| اصل                                | توضیح                                             |
| ---------------------------------- | ------------------------------------------------- |
| **رابطه یک مفهوم First-Class است** | رابطه در معماری پلتفرم به اندازه موجودیت مهم است  |
| **رابطه دارای جهت است**            | هر رابطه از یک منبع به یک هدف جریان دارد          |
| **رابطه دارای نوع است**            | نوع رابطه ماهیت ارتباط را مشخص می‌کند             |
| **رابطه قابل ترکیب است**           | چند رابطه می‌توانند یک مسیر را تشکیل دهند         |
| **رابطه مستقل از پیاده‌سازی است**  | روابط معماری بدون وابستگی به فناوری تعریف می‌شوند |

---

## ۵. Relationship Taxonomy

### تاکسونومی رابطه پلتفرمی

KNW-303 روابط پلتفرمی را بر اساس دو بعد اصلی طبقه‌بندی می‌کند:

#### بعد اول — ماهیت رابطه

| ماهیت   | شناسه   | توضیح                              | مثال                                                 |
| ------- | ------- | ---------------------------------- | ---------------------------------------------------- |
| ساختاری | REL-STR | رابطه ترکیب، عضویت یا containment  | ماژول شامل مؤلفه‌ها                                  |
| رفتاری  | REL-BEH | رابطه فراخوانی، اجرا یا تولید      | سرویس قابلیت را اجرا می‌کند                          |
| وابستگی | REL-DEP | رابطه نیازمندی یا پیش‌نیاز         | قابلیت به قابلیت دیگر وابسته است                     |
| ارتباطی | REL-COM | رابطه ارسال/دریافت پیام            | مؤلفه به مؤلفه دیگر اعلان می‌کند                     |
| داده‌ای | REL-DAT | رابطه تولید/مصرف داده              | مؤلفه داده را در Cache ذخیره می‌کند                  |
| کنترلی  | REL-CTL | رابطه نظارت، مدیریت یا ارکستراسیون | لایه Automation لایه‌های زیرین را orchestrate می‌کند |
| حکمرانی | REL-GOV | رابطه انطباق، رعایت یا تبعیت       | سرویس از قواعد انطباق تبعیت می‌کند                   |
| مالکیتی | REL-OWN | رابطه مالکیت، stewardship یا مصرف  | Agent یک قابلیت را مصرف می‌کند                       |
| خارجی   | REL-EXT | رابطه با موجودیت‌های خارج از SMOS  | پلتفرم با API خارجی ارتباط دارد                      |

#### بعد دوم — شدت رابطه

| شدت   | شناسه      | توضیح                                               |
| ----- | ---------- | --------------------------------------------------- |
| قوی   | REL-INT-01 | رابطه مستقیم و ضروری — بدون آن موجودیت کار نمی‌کند  |
| متوسط | REL-INT-02 | رابطه غیرمستقیم — موجودیت با جایگزین نیز کار می‌کند |
| ضعیف  | REL-INT-03 | رابطه اختیاری — موجودیت مستقل عمل می‌کند            |

---

## ۶. Relationship Types

### انواع رابطه بر اساس ماهیت

| شناسه        | نوع               | ماهیت   | توضیح                                                          |
| ------------ | ----------------- | ------- | -------------------------------------------------------------- |
| REL-TYPE-001 | contains          | REL-STR | موجودیت منبع شامل موجودیت هدف است                              |
| REL-TYPE-002 | belongs-to        | REL-STR | موجودیت منبع عضو موجودیت هدف است                               |
| REL-TYPE-003 | composed-of       | REL-STR | موجودیت منبع از موجودیت هدف تشکیل شده است                      |
| REL-TYPE-004 | triggers          | REL-BEH | موجودیت منبع موجودیت هدف را فعال می‌کند                        |
| REL-TYPE-005 | invokes           | REL-BEH | موجودیت منبع موجودیت هدف را فراخوانی می‌کند                    |
| REL-TYPE-006 | executes          | REL-BEH | موجودیت منبع یک عملیات روی موجودیت هدف اجرا می‌کند             |
| REL-TYPE-007 | produces          | REL-BEH | موجودیت منبع موجودیت هدف را تولید می‌کند                       |
| REL-TYPE-008 | requires          | REL-DEP | موجودیت منبع به موجودیت هدف نیاز دارد                          |
| REL-TYPE-009 | depends-on        | REL-DEP | موجودیت منبع به موجودیت هدف وابسته است                         |
| REL-TYPE-010 | precedes          | REL-DEP | موجودیت منبع قبل از موجودیت هدف رخ می‌دهد                      |
| REL-TYPE-011 | sends             | REL-COM | موجودیت منبع پیام به موجودیت هدف می‌فرستد                      |
| REL-TYPE-012 | receives          | REL-COM | موجودیت منبع پیام از موجودیت هدف دریافت می‌کند                 |
| REL-TYPE-013 | notifies          | REL-COM | موجودیت منبع به موجودیت هدف اعلان می‌کند                       |
| REL-TYPE-014 | feeds             | REL-DAT | موجودیت منبع داده به موجودیت هدف می‌دهد                        |
| REL-TYPE-015 | consumes          | REL-DAT | موجودیت منبع داده از موجودیت هدف مصرف می‌کند                   |
| REL-TYPE-016 | transforms        | REL-DAT | موجودیت منبع داده موجودیت هدف را تبدیل می‌کند                  |
| REL-TYPE-017 | orchestrates      | REL-CTL | موجودیت منبع موجودیت هدف را هماهنگ می‌کند                      |
| REL-TYPE-018 | monitors          | REL-CTL | موجودیت منبع وضعیت موجودیت هدف را نظارت می‌کند                 |
| REL-TYPE-019 | governs           | REL-CTL | موجودیت منبع بر موجودیت هدف حاکم است                           |
| REL-TYPE-020 | delegates         | REL-CTL | موجودیت منبع وظیفه را به موجودیت هدف واگذار می‌کند             |
| REL-TYPE-021 | complies-with     | REL-GOV | موجودیت منبع از قواعد موجودیت هدف تبعیت می‌کند                 |
| REL-TYPE-022 | governed-by       | REL-GOV | موجودیت منبع تحت حاکمیت موجودیت هدف است                        |
| REL-TYPE-023 | owns              | REL-OWN | موجودیت منبع مالک موجودیت هدف است                              |
| REL-TYPE-024 | stewards          | REL-OWN | موجودیت منبع متولی موجودیت هدف است                             |
| REL-TYPE-025 | consumes-as-owner | REL-OWN | موجودیت منبع از موجودیت هدف به عنوان مصرف‌کننده استفاده می‌کند |
| REL-TYPE-026 | connects-to       | REL-EXT | موجودیت منبع به موجودیت هدف خارجی متصل است                     |
| REL-TYPE-027 | exposes           | REL-EXT | موجودیت منبع واسطی برای دسترسی موجودیت هدف ارائه می‌دهد        |
| REL-TYPE-028 | integrates-with   | REL-EXT | موجودیت منبع با موجودیت هدف خارجی یکپارچه است                  |

### ماتریس نوع رابطه به ماهیت

| نوع               | REL-STR | REL-BEH | REL-DEP | REL-COM | REL-DAT | REL-CTL | REL-GOV | REL-OWN | REL-EXT |
| ----------------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- |
| contains          | ✓       |         |         |         |         |         |         |         |         |
| belongs-to        | ✓       |         |         |         |         |         |         |         |         |
| composed-of       | ✓       |         |         |         |         |         |         |         |         |
| triggers          |         | ✓       |         |         |         |         |         |         |         |
| invokes           |         | ✓       |         |         |         |         |         |         |         |
| executes          |         | ✓       |         |         |         |         |         |         |         |
| produces          |         | ✓       |         |         |         |         |         |         |         |
| requires          |         |         | ✓       |         |         |         |         |         |         |
| depends-on        |         |         | ✓       |         |         |         |         |         |         |
| precedes          |         |         | ✓       |         |         |         |         |         |         |
| sends             |         |         |         | ✓       |         |         |         |         |         |
| receives          |         |         |         | ✓       |         |         |         |         |         |
| notifies          |         |         |         | ✓       |         |         |         |         |         |
| feeds             |         |         |         |         | ✓       |         |         |         |         |
| consumes          |         |         |         |         | ✓       |         |         |         |         |
| transforms        |         |         |         |         | ✓       |         |         |         |         |
| orchestrates      |         |         |         |         |         | ✓       |         |         |         |
| monitors          |         |         |         |         |         | ✓       |         |         |         |
| governs           |         |         |         |         |         | ✓       |         |         |         |
| delegates         |         |         |         |         |         | ✓       |         |         |         |
| complies-with     |         |         |         |         |         |         | ✓       |         |         |
| governed-by       |         |         |         |         |         |         | ✓       |         |         |
| owns              |         |         |         |         |         |         |         | ✓       |         |
| stewards          |         |         |         |         |         |         |         | ✓       |         |
| consumes-as-owner |         |         |         |         |         |         |         | ✓       |         |
| connects-to       |         |         |         |         |         |         |         |         | ✓       |
| exposes           |         |         |         |         |         |         |         |         | ✓       |
| integrates-with   |         |         |         |         |         |         |         |         | ✓       |

---

## ۷. Structural Relationships

### روابط ساختاری

روابط ساختاری نحوه **ترکیب، عضویت و containment** موجودیت‌های پلتفرمی را تعریف می‌کنند. این روابط توپولوژی ایستای معماری پلتفرم را تشکیل می‌دهند.

### ماژول به مؤلفه

| شناسه      | منبع                            | هدف      | نوع      | توضیح                                    |
| ---------- | ------------------------------- | -------- | -------- | ---------------------------------------- |
| RL-STR-001 | PLTM-001 (Publishing Module)    | PLTC-001 | contains | ماژول انتشار شامل مؤلفه Connector است    |
| RL-STR-002 | PLTM-001 (Publishing Module)    | PLTC-003 | contains | ماژول انتشار شامل Schedule Manager است   |
| RL-STR-003 | PLTM-001 (Publishing Module)    | PLTC-007 | contains | ماژول انتشار شامل Rate Limiter است       |
| RL-STR-004 | PLTM-001 (Publishing Module)    | PLTC-008 | contains | ماژول انتشار شامل Error Handler است      |
| RL-STR-005 | PLTM-001 (Publishing Module)    | PLTC-009 | contains | ماژول انتشار شامل Retry Manager است      |
| RL-STR-006 | PLTM-002 (Adaptation Module)    | PLTC-002 | contains | ماژول تطبیق شامل Content Adapter است     |
| RL-STR-007 | PLTM-003 (Compliance Module)    | PLTC-004 | contains | ماژول انطباق شامل Compliance Engine است  |
| RL-STR-008 | PLTM-004 (Analytics Module)     | PLTC-005 | contains | ماژول تحلیل شامل Analytics Collector است |
| RL-STR-009 | PLTM-007 (Orchestration Module) | PLTC-001 | contains | ماژول هماهنگ‌سازی شامل Connector است     |
| RL-STR-010 | PLTM-007 (Orchestration Module) | PLTC-010 | contains | ماژول هماهنگ‌سازی شامل State Store است   |

### مؤلفه به مؤلفه (ساختاری)

| شناسه      | منبع                           | هدف                           | نوع         | توضیح                                      |
| ---------- | ------------------------------ | ----------------------------- | ----------- | ------------------------------------------ |
| RL-STR-011 | PLTC-001 (Platform Connector)  | PLTC-003 (Schedule Manager)   | composed-of | Connector بخشی از زنجیره انتشار است        |
| RL-STR-012 | PLTC-002 (Content Adapter)     | PLTC-001 (Platform Connector) | composed-of | Content Adapter بخشی از خط لوله انتشار است |
| RL-STR-013 | PLTC-005 (Analytics Collector) | PLTC-006 (Platform Cache)     | composed-of | Analytics Collector به Cache متصل است      |
| RL-STR-014 | PLTC-008 (Error Handler)       | PLTC-009 (Retry Manager)      | composed-of | Error Handler بخشی از زیرساخت تاب‌آوری است |

### لایه به ماژول

| شناسه      | منبع                            | هدف                             | نوع      | توضیح                                      |
| ---------- | ------------------------------- | ------------------------------- | -------- | ------------------------------------------ |
| RL-STR-015 | LYR-PLT-04 (Distribution Layer) | PLTM-001 (Publishing Module)    | contains | لایه توزیع شامل ماژول انتشار است           |
| RL-STR-016 | LYR-PLT-03 (Content Layer)      | PLTM-002 (Adaptation Module)    | contains | لایه محتوا شامل ماژول تطبیق است            |
| RL-STR-017 | LYR-PLT-02 (Governance Layer)   | PLTM-003 (Compliance Module)    | contains | لایه حکمرانی شامل ماژول انطباق است         |
| RL-STR-018 | LYR-PLT-06 (Analytics Layer)    | PLTM-004 (Analytics Module)     | contains | لایه تحلیل شامل ماژول تحلیل است            |
| RL-STR-019 | LYR-PLT-05 (Engagement Layer)   | PLTM-005 (Engagement Module)    | contains | لایه تعامل شامل ماژول تعامل است            |
| RL-STR-020 | LYR-PLT-06 (Analytics Layer)    | PLTM-006 (Intelligence Module)  | contains | لایه تحلیل شامل ماژول هوش است              |
| RL-STR-021 | LYR-PLT-07 (Automation Layer)   | PLTM-007 (Orchestration Module) | contains | لایه خودکارسازی شامل ماژول هماهنگ‌سازی است |

### دامنه به لایه

| شناسه      | منبع                            | هدف                       | نوع        | توضیح                                           |
| ---------- | ------------------------------- | ------------------------- | ---------- | ----------------------------------------------- |
| RL-STR-022 | PLTD-001 (Social Media)         | LYR-PLT-01 (Strategic)    | belongs-to | دامنه رسانه اجتماعی به لایه استراتژیک تعلق دارد |
| RL-STR-023 | PLTD-002 (Content Distribution) | LYR-PLT-04 (Distribution) | belongs-to | دامنه توزیع به لایه توزیع تعلق دارد             |
| RL-STR-024 | PLTD-003 (Audience Engagement)  | LYR-PLT-05 (Engagement)   | belongs-to | دامنه تعامل به لایه تعامل تعلق دارد             |
| RL-STR-025 | PLTD-004 (Brand Presence)       | LYR-PLT-01 (Strategic)    | belongs-to | دامنه حضور برند به لایه استراتژیک تعلق دارد     |
| RL-STR-026 | PLTD-005 (Analytics)            | LYR-PLT-06 (Analytics)    | belongs-to | دامنه تحلیل به لایه تحلیل تعلق دارد             |
| RL-STR-027 | PLTD-006 (Automation)           | LYR-PLT-07 (Automation)   | belongs-to | دامنه خودکارسازی به لایه خودکارسازی تعلق دارد   |
| RL-STR-028 | PLTD-007 (Governance)           | LYR-PLT-02 (Governance)   | belongs-to | دامنه حکمرانی به لایه حکمرانی تعلق دارد         |
| RL-STR-029 | PLTD-008 (Operations)           | LYR-PLT-07 (Automation)   | belongs-to | دامنه عملیات به لایه خودکارسازی تعلق دارد       |

---

## ۸. Behavioral Relationships

### روابط رفتاری

روابط رفتاری نحوه **تعامل پویا** بین موجودیت‌های پلتفرمی را تعریف می‌کنند. این روابط جریان اجرا و عملیات را مشخص می‌کنند.

### مؤلفه به مؤلفه (رفتاری)

| شناسه      | منبع                           | هدف                           | نوع      | توضیح                                                        |
| ---------- | ------------------------------ | ----------------------------- | -------- | ------------------------------------------------------------ |
| RL-BEH-001 | PLTC-001 (Platform Connector)  | PLTC-003 (Schedule Manager)   | triggers | Connector پس از انتشار Schedule Manager را فعال می‌کند       |
| RL-BEH-002 | PLTC-002 (Content Adapter)     | PLTC-001 (Platform Connector) | triggers | Content Adapter پس از تطبیق Connector را فعال می‌کند         |
| RL-BEH-003 | PLTC-004 (Compliance Engine)   | PLTC-002 (Content Adapter)    | triggers | Compliance Engine پس از تأیید Content Adapter را فعال می‌کند |
| RL-BEH-004 | PLTC-005 (Analytics Collector) | PLTC-006 (Platform Cache)     | triggers | Analytics Collector داده را در Cache ذخیره می‌کند            |
| RL-BEH-005 | PLTC-008 (Error Handler)       | PLTC-009 (Retry Manager)      | triggers | Error Handler در صورت خطا Retry Manager را فعال می‌کند       |
| RL-BEH-006 | PLTC-012 (Webhook Receiver)    | PLTC-008 (Error Handler)      | triggers | Webhook Receiver رویداد را به Error Handler می‌فرستد         |
| RL-BEH-007 | PLTC-011 (Auth Manager)        | PLTC-001 (Platform Connector) | triggers | Auth Manager پس از احراز هویت Connector را آزاد می‌کند       |

### سرویس به قابلیت

| شناسه      | منبع                                     | هدف                      | نوع      | توضیح                                                    |
| ---------- | ---------------------------------------- | ------------------------ | -------- | -------------------------------------------------------- |
| RL-BEH-008 | SRV-PLT-001 (Content Publishing)         | CAP-PLT-001              | executes | سرویس انتشار قابلیت انتشار تکی را اجرا می‌کند            |
| RL-BEH-009 | SRV-PLT-002 (Batch Upload)               | CAP-PLT-002              | executes | سرویس آپلود دسته‌ای قابلیت انتشار دسته‌ای را اجرا می‌کند |
| RL-BEH-010 | SRV-PLT-003 (Distribution Orchestration) | CAP-PLT-003              | executes | سرویس توزیع قابلیت توزیع چندپلتفرمی را اجرا می‌کند       |
| RL-BEH-011 | SRV-PLT-004 (Schedule Management)        | CAP-PLT-004, CAP-PLT-005 | executes | سرویس زمان‌بندی هر دو قابلیت زمان‌بندی را اجرا می‌کند    |
| RL-BEH-012 | SRV-PLT-005 (Format Transformation)      | CAP-PLT-006              | executes | سرویس تبدیل قالب قابلیت تطبیق را اجرا می‌کند             |
| RL-BEH-013 | SRV-PLT-007 (Compliance Checking)        | CAP-PLT-007, CAP-PLT-008 | executes | سرویس انطباق قابلیت‌های انطباق را اجرا می‌کند            |
| RL-BEH-014 | SRV-PLT-009 (Analytics Ingestion)        | CAP-PLT-011              | executes | سرویس ورودی تحلیل قابلیت جمع‌آوری را اجرا می‌کند         |
| RL-BEH-015 | SRV-PLT-010 (Metrics Computation)        | CAP-PLT-012              | executes | سرویس محاسبه معیار قابلیت تجمیع را اجرا می‌کند           |
| RL-BEH-016 | SRV-PLT-011 (Trend Analysis)             | CAP-PLT-013              | executes | سرویس تحلیل روند قابلیت تشخیص روند را اجرا می‌کند        |
| RL-BEH-017 | SRV-PLT-012 (Sentiment Scoring)          | CAP-PLT-014              | executes | سرویس امتیاز احساسات قابلیت تحلیل احساسات را اجرا می‌کند |
| RL-BEH-018 | SRV-PLT-013 (Community Response)         | CAP-PLT-015              | executes | سرویس پاسخ جامعه قابلیت پاسخ به جامعه را اجرا می‌کند     |
| RL-BEH-019 | SRV-PLT-014 (Incident Management)        | CAP-PLT-016              | executes | سرویس مدیریت حادثه قابلیت تشخیص حادثه را اجرا می‌کند     |
| RL-BEH-020 | SRV-PLT-015 (State Monitoring)           | CAP-PLT-017              | executes | سرویس نظارت وضعیت قابلیت نظارت را اجرا می‌کند            |
| RL-BEH-021 | SRV-PLT-016 (Synchronization)            | CAP-PLT-018              | executes | سرویس همگام‌سازی قابلیت همگام‌سازی را اجرا می‌کند        |
| RL-BEH-022 | SRV-PLT-017 (Rate Limiting)              | CAP-PLT-019              | executes | سرویس محدودیت نرخ قابلیت مدیریت نرخ را اجرا می‌کند       |
| RL-BEH-023 | SRV-PLT-018 (Authentication)             | CAP-PLT-020              | executes | سرویس احراز هویت قابلیت تأیید هویت را اجرا می‌کند        |

### Agent به سرویس

| شناسه      | منبع                        | هدف                                                | نوع     | توضیح                                                   |
| ---------- | --------------------------- | -------------------------------------------------- | ------- | ------------------------------------------------------- |
| RL-BEH-024 | AI-003 (Content Production) | SRV-PLT-005                                        | invokes | Agent تولید محتوا سرویس تبدیل قالب را فراخوانی می‌کند   |
| RL-BEH-025 | AI-008 (Publishing)         | SRV-PLT-001, SRV-PLT-002, SRV-PLT-003              | invokes | Agent انتشار مجموعه سرویس‌های انتشار را فراخوانی می‌کند |
| RL-BEH-026 | AI-009 (Community)          | SRV-PLT-013, SRV-PLT-014                           | invokes | Agent جامعه سرویس‌های تعاملی را فراخوانی می‌کند         |
| RL-BEH-027 | AI-010 (Analytics)          | SRV-PLT-009, SRV-PLT-010, SRV-PLT-011, SRV-PLT-012 | invokes | Agent تحلیل مجموعه سرویس‌های تحلیلی را فراخوانی می‌کند  |
| RL-BEH-028 | AI-014 (Orchestrator)       | SRV-PLT-003, SRV-PLT-015, SRV-PLT-016              | invokes | هماهنگ‌ساز سرویس‌های ارکستراسیون را فراخوانی می‌کند     |

---

## ۹. Dependency Model

### مدل وابستگی

مدل وابستگی روابط **نیازمندی و پیش‌نیاز** بین موجودیت‌های پلتفرمی را تعریف می‌کند.

### قابلیت به قابلیت

| شناسه      | منبع                                      | هدف                                     | نوع      | شدت | توضیح                                     |
| ---------- | ----------------------------------------- | --------------------------------------- | -------- | --- | ----------------------------------------- |
| RL-DEP-001 | CAP-PLT-003 (Multi-Platform Distribution) | CAP-PLT-001 (Single Content Publish)    | requires | قوی | توزیع نیازمند انتشار پایه است             |
| RL-DEP-002 | CAP-PLT-005 (Event-Triggered Scheduling)  | CAP-PLT-017 (Platform State Monitoring) | requires | قوی | زمان‌بندی رویدادی نیازمند نظارت وضعیت است |
| RL-DEP-003 | CAP-PLT-010 (Targeted Distribution)       | CAP-PLT-009 (Audience Segmentation)     | requires | قوی | توزیع هدفمند نیازمند بخش‌بندی مخاطب است   |
| RL-DEP-004 | CAP-PLT-012 (Metrics Aggregation)         | CAP-PLT-011 (Metrics Collection)        | requires | قوی | تجمیع معیار نیازمند جمع‌آوری است          |
| RL-DEP-005 | CAP-PLT-013 (Trend Detection)             | CAP-PLT-012 (Metrics Aggregation)       | requires | قوی | تشخیص روند نیازمند داده تجمیعی است        |
| RL-DEP-006 | CAP-PLT-014 (Sentiment Analysis)          | CAP-PLT-011 (Metrics Collection)        | requires | قوی | تحلیل احساسات نیازمند داده ورودی است      |
| RL-DEP-007 | CAP-PLT-016 (Incident Detection)          | CAP-PLT-015 (Community Response)        | requires | قوی | تشخیص حادثه نیازمند بستر پاسخ است         |
| RL-DEP-008 | CAP-PLT-018 (Cross-Platform Sync)         | CAP-PLT-017 (Platform State Monitoring) | requires | قوی | همگام‌سازی نیازمند نظارت وضعیت است        |

### سرویس به سرویس

| شناسه      | منبع                                     | هدف                               | نوع      | شدت   | توضیح                                       |
| ---------- | ---------------------------------------- | --------------------------------- | -------- | ----- | ------------------------------------------- |
| RL-DEP-009 | SRV-PLT-003 (Distribution Orchestration) | SRV-PLT-001 (Content Publishing)  | requires | قوی   | ارکستراسیون توزیع به سرویس انتشار نیاز دارد |
| RL-DEP-010 | SRV-PLT-003 (Distribution Orchestration) | SRV-PLT-004 (Schedule Management) | requires | متوسط | ارکستراسیون توزیع به زمان‌بندی نیاز دارد    |
| RL-DEP-011 | SRV-PLT-010 (Metrics Computation)        | SRV-PLT-009 (Analytics Ingestion) | requires | قوی   | محاسبه معیار به داده ورودی نیاز دارد        |
| RL-DEP-012 | SRV-PLT-011 (Trend Analysis)             | SRV-PLT-010 (Metrics Computation) | requires | قوی   | تحلیل روند به معیار محاسبه‌شده نیاز دارد    |
| RL-DEP-013 | SRV-PLT-016 (Synchronization)            | SRV-PLT-015 (State Monitoring)    | requires | قوی   | همگام‌سازی به وضعیت جاری نیاز دارد          |
| RL-DEP-014 | SRV-PLT-001 (Content Publishing)         | SRV-PLT-017 (Rate Limiting)       | requires | متوسط | انتشار از محدودیت نرخ استفاده می‌کند        |
| RL-DEP-015 | SRV-PLT-001 (Content Publishing)         | SRV-PLT-018 (Authentication)      | requires | قوی   | انتشار نیازمند احراز هویت است               |

### سرویس به مؤلفه

| شناسه      | منبع                                | هدف                            | نوع      | شدت | توضیح                                              |
| ---------- | ----------------------------------- | ------------------------------ | -------- | --- | -------------------------------------------------- |
| RL-DEP-016 | SRV-PLT-001 (Content Publishing)    | PLTC-001 (Platform Connector)  | requires | قوی | سرویس انتشار به Connector نیاز دارد                |
| RL-DEP-017 | SRV-PLT-003 (Format Transformation) | PLTC-002 (Content Adapter)     | requires | قوی | سرویس تبدیل به Content Adapter نیاز دارد           |
| RL-DEP-018 | SRV-PLT-002 (Schedule Management)   | PLTC-003 (Schedule Manager)    | requires | قوی | سرویس زمان‌بندی به Schedule Manager نیاز دارد      |
| RL-DEP-019 | SRV-PLT-004 (Compliance Checking)   | PLTC-004 (Compliance Engine)   | requires | قوی | سرویس انطباق به Compliance Engine نیاز دارد        |
| RL-DEP-020 | SRV-PLT-005 (Analytics Ingestion)   | PLTC-005 (Analytics Collector) | requires | قوی | سرویس ورودی تحلیل به Analytics Collector نیاز دارد |

### ماژول به لایه

| شناسه      | منبع                            | هدف                             | نوع        | شدت | توضیح                                          |
| ---------- | ------------------------------- | ------------------------------- | ---------- | --- | ---------------------------------------------- |
| RL-DEP-021 | PLTM-001 (Publishing Module)    | LYR-PLT-04 (Distribution Layer) | belongs-to | قوی | ماژول انتشار در لایه توزیع قرار دارد           |
| RL-DEP-022 | PLTM-002 (Adaptation Module)    | LYR-PLT-03 (Content Layer)      | belongs-to | قوی | ماژول تطبیق در لایه محتوا قرار دارد            |
| RL-DEP-023 | PLTM-003 (Compliance Module)    | LYR-PLT-02 (Governance Layer)   | belongs-to | قوی | ماژول انطباق در لایه حکمرانی قرار دارد         |
| RL-DEP-024 | PLTM-004 (Analytics Module)     | LYR-PLT-06 (Analytics Layer)    | belongs-to | قوی | ماژول تحلیل در لایه تحلیل قرار دارد            |
| RL-DEP-025 | PLTM-005 (Engagement Module)    | LYR-PLT-05 (Engagement Layer)   | belongs-to | قوی | ماژول تعامل در لایه تعامل قرار دارد            |
| RL-DEP-026 | PLTM-006 (Intelligence Module)  | LYR-PLT-06 (Analytics Layer)    | belongs-to | قوی | ماژول هوش در لایه تحلیل قرار دارد              |
| RL-DEP-027 | PLTM-007 (Orchestration Module) | LYR-PLT-07 (Automation Layer)   | belongs-to | قوی | ماژول هماهنگ‌سازی در لایه خودکارسازی قرار دارد |

---

## ۱۰. Interaction Model

### مدل تعامل

مدل تعامل نحوه **همکاری و هماهنگی** بین موجودیت‌های پلتفرمی را تعریف می‌کند.

### الگوهای تعامل

| شناسه      | الگو              | توضیح                                      | کاربرد                                     |
| ---------- | ----------------- | ------------------------------------------ | ------------------------------------------ |
| INT-MOD-01 | Request-Response  | درخواست همزمان و دریافت پاسخ               | SRV-PLT-004, SRV-PLT-005, SRV-PLT-007      |
| INT-MOD-02 | Fire-and-Forget   | ارسال درخواست بدون انتظار پاسخ             | SRV-PLT-001, SRV-PLT-009                   |
| INT-MOD-03 | Publish-Subscribe | انتشار رویداد و مصرف توسط مشترکین          | PLTC-012, رویدادهای پلتفرم                 |
| INT-MOD-04 | Pipeline          | پردازش زنجیره‌ای داده                      | Content Adapter → Connector → Rate Limiter |
| INT-MOD-05 | Orchestration     | هماهنگ‌سازی چند سرویس توسط یک orchestrator | AI-014, SRV-PLT-003                        |

### نگاشت الگوی تعامل به جفت موجودیت‌ها

| شناسه      | منبع                             | هدف                                   | الگو              | توضیح                                                      |
| ---------- | -------------------------------- | ------------------------------------- | ----------------- | ---------------------------------------------------------- |
| RL-COM-001 | PLTC-001 (Platform Connector)    | SRV-PLT-001                           | Fire-and-Forget   | Connector محتوا را برای انتشار ارسال می‌کند                |
| RL-COM-002 | SRV-PLT-001 (Content Publishing) | PLTC-003 (Schedule Manager)           | Request-Response  | سرویس انتشار زمان را از Schedule Manager می‌پرسد           |
| RL-COM-003 | PLTC-012 (Webhook Receiver)      | PLTC-008 (Error Handler)              | Publish-Subscribe | Webhook رویداد را منتشر می‌کند و Error Handler مصرف می‌کند |
| RL-COM-004 | PLTC-002 (Content Adapter)       | PLTC-001 (Platform Connector)         | Pipeline          | Content Adapter خروجی را به Connector می‌دهد               |
| RL-COM-005 | AI-014 (Orchestrator)            | SRV-PLT-003, SRV-PLT-015, SRV-PLT-016 | Orchestration     | هماهنگ‌ساز چند سرویس را orchestrate می‌کند                 |
| RL-COM-006 | PLTC-005 (Analytics Collector)   | SRV-PLT-009                           | Fire-and-Forget   | Collector داده را به سرویس ورودی می‌فرستد                  |
| RL-COM-007 | SRV-PLT-011 (Trend Analysis)     | SRV-PLT-010 (Metrics Computation)     | Request-Response  | تحلیل روند داده را از سرویس محاسبه درخواست می‌کند          |

---

## ۱۱. Communication Model

### مدل ارتباط

مدل ارتباط **کانال‌ها و پروتکل‌های ارتباطی** بین موجودیت‌های پلتفرمی را تعریف می‌کند.

### کانال‌های ارتباطی

| شناسه      | کانال               | توضیح                | مصرف‌کنندگان                          |
| ---------- | ------------------- | -------------------- | ------------------------------------- |
| COMM-CH-01 | Synchronous Channel | ارتباط همزمان مستقیم | SRV-PLT-004, SRV-PLT-005, SRV-PLT-007 |
| COMM-CH-02 | Asynchronous Queue  | صف پیام غیرهمزمان    | SRV-PLT-001, SRV-PLT-009, PLTC-001    |
| COMM-CH-03 | Event Bus           | گذرگاه رویداد        | PLTC-012, PLTC-008                    |
| COMM-CH-04 | Data Stream         | جریان داده مداوم     | PLTC-005, SRV-PLT-009                 |
| COMM-CH-05 | State Channel       | کانال وضعیت          | PLTC-010, SRV-PLT-015, SRV-PLT-016    |

### نگاشت ارتباطی

| شناسه      | فرستنده     | گیرنده      | کانال      | پروتکل             | توضیح                                             |
| ---------- | ----------- | ----------- | ---------- | ------------------ | ------------------------------------------------- |
| RL-COM-008 | PLTC-001    | SRV-PLT-001 | COMM-CH-02 | async-message      | Connector پیام انتشار را به صف می‌فرستد           |
| RL-COM-009 | PLTC-012    | PLTC-008    | COMM-CH-03 | event-notification | Webhook رویداد را روی Event Bus منتشر می‌کند      |
| RL-COM-010 | PLTC-005    | PLTC-006    | COMM-CH-04 | data-put           | Collector داده را در Cache می‌نویسد               |
| RL-COM-011 | PLTC-010    | SRV-PLT-015 | COMM-CH-05 | state-pull         | State Store وضعیت را برای Monitoring فراهم می‌کند |
| RL-COM-012 | SRV-PLT-004 | PLTC-003    | COMM-CH-01 | sync-call          | Schedule Manager به صورت همزمان فراخوانی می‌شود   |
| RL-COM-013 | AI-014      | SRV-PLT-003 | COMM-CH-01 | sync-call          | Orchestrator سرویس توزیع را فراخوانی می‌کند       |

---

## ۱۲. Capability Relationships

### روابط قابلیتی

این بخش روابط بین **قابلیت‌های پلتفرمی (CAP-PLT\*)** و سایر موجودیت‌ها را تعریف می‌کند.

### قابلیت به لایه

| شناسه      | منبع             | هدف                    | نوع        | توضیح                                                        |
| ---------- | ---------------- | ---------------------- | ---------- | ------------------------------------------------------------ |
| RL-STR-030 | CAP-PLT-001..003 | LYR-PLT-04             | belongs-to | قابلیت‌های انتشار به لایه توزیع تعلق دارند                   |
| RL-STR-031 | CAP-PLT-004..006 | LYR-PLT-04, LYR-PLT-03 | belongs-to | قابلیت‌های تطبیق به لایه‌های توزیع و محتوا تعلق دارند        |
| RL-STR-032 | CAP-PLT-007..008 | LYR-PLT-02             | belongs-to | قابلیت‌های انطباق به لایه حکمرانی تعلق دارند                 |
| RL-STR-033 | CAP-PLT-009..010 | LYR-PLT-03, LYR-PLT-04 | belongs-to | قابلیت‌های مخاطب به لایه محتوا و توزیع تعلق دارند            |
| RL-STR-034 | CAP-PLT-011..014 | LYR-PLT-06             | belongs-to | قابلیت‌های تحلیل به لایه تحلیل تعلق دارند                    |
| RL-STR-035 | CAP-PLT-015..016 | LYR-PLT-05             | belongs-to | قابلیت‌های جامعه به لایه تعامل تعلق دارند                    |
| RL-STR-036 | CAP-PLT-017..020 | LYR-PLT-07, LYR-PLT-04 | belongs-to | قابلیت‌های زیرساخت به لایه‌های خودکارسازی و توزیع تعلق دارند |

### قابلیت به دامنه

| شناسه      | منبع                            | هدف                                              | نوع        | توضیح                                                       |
| ---------- | ------------------------------- | ------------------------------------------------ | ---------- | ----------------------------------------------------------- |
| RL-STR-037 | CAPGRP-001 (Content Publishing) | PLTD-001 (Social Media), PLTD-002 (Distribution) | belongs-to | گروه انتشار به دامنه‌های رسانه و توزیع مرتبط است            |
| RL-STR-038 | CAPGRP-002 (Content Adaptation) | PLTD-002 (Distribution)                          | belongs-to | گروه تطبیق به دامنه توزیع مرتبط است                         |
| RL-STR-039 | CAPGRP-003 (Governance)         | PLTD-007 (Governance)                            | belongs-to | گروه انطباق به دامنه حکمرانی مرتبط است                      |
| RL-STR-040 | CAPGRP-004 (Audience)           | PLTD-003 (Engagement)                            | belongs-to | گروه مخاطب به دامنه تعامل مرتبط است                         |
| RL-STR-041 | CAPGRP-005 (Analytics)          | PLTD-005 (Analytics)                             | belongs-to | گروه تحلیل به دامنه تحلیل مرتبط است                         |
| RL-STR-042 | CAPGRP-006 (Community)          | PLTD-003 (Engagement)                            | belongs-to | گروه جامعه به دامنه تعامل مرتبط است                         |
| RL-STR-043 | CAPGRP-007 (Orchestration)      | PLTD-006 (Automation), PLTD-008 (Operations)     | belongs-to | گروه هماهنگ‌سازی به دامنه‌های خودکارسازی و عملیات مرتبط است |

### قابلیت به قابلیت (ترکیبی)

| شناسه      | منبع                                      | هدف                                       | نوع      | توضیح                                        |
| ---------- | ----------------------------------------- | ----------------------------------------- | -------- | -------------------------------------------- |
| RL-BEH-029 | CAP-PLT-003 (Multi-Platform Distribution) | CAP-PLT-001 (Single Content Publish)      | triggers | توزیع چندپلتفرمی انتشار تکی را فعال می‌کند   |
| RL-BEH-030 | CAP-PLT-010 (Targeted Distribution)       | CAP-PLT-003 (Multi-Platform Distribution) | triggers | توزیع هدفمند توزیع چندپلتفرمی را فعال می‌کند |
| RL-BEH-031 | CAP-PLT-012 (Metrics Aggregation)         | CAP-PLT-013 (Trend Detection)             | triggers | تجمیع معیار تشخیص روند را ممکن می‌کند        |
| RL-BEH-032 | CAP-PLT-016 (Incident Detection)          | CAP-PLT-015 (Community Response)          | triggers | تشخیص حادثه پاسخ جامعه را فعال می‌کند        |

---

## ۱۳. Service Relationships

### روابط سرویسی

این بخش روابط بین **سرویس‌های پلتفرمی (SRV-PLT\*)** و سایر موجودیت‌ها را تعریف می‌کند.

### سرویس به مؤلفه

| شناسه      | منبع                                | هدف                            | نوع  | توضیح                                                                 |
| ---------- | ----------------------------------- | ------------------------------ | ---- | --------------------------------------------------------------------- |
| RL-STR-044 | SRV-PLT-001 (Content Publishing)    | PLTC-001 (Platform Connector)  | uses | سرویس انتشار از Connector برای اتصال به پلتفرم استفاده می‌کند         |
| RL-STR-045 | SRV-PLT-003 (Format Transformation) | PLTC-002 (Content Adapter)     | uses | سرویس تبدیل از Content Adapter برای تطبیق قالب استفاده می‌کند         |
| RL-STR-046 | SRV-PLT-002 (Schedule Management)   | PLTC-003 (Schedule Manager)    | uses | سرویس زمان‌بندی از Schedule Manager برای مدیریت زمان استفاده می‌کند   |
| RL-STR-047 | SRV-PLT-004 (Compliance Checking)   | PLTC-004 (Compliance Engine)   | uses | سرویس انطباق از Compliance Engine برای بررسی استفاده می‌کند           |
| RL-STR-048 | SRV-PLT-005 (Analytics Ingestion)   | PLTC-005 (Analytics Collector) | uses | سرویس ورودی تحلیل از Analytics Collector برای جمع‌آوری استفاده می‌کند |
| RL-STR-049 | SRV-PLT-001 (Content Publishing)    | PLTC-007 (Rate Limiter)        | uses | سرویس انتشار از Rate Limiter برای کنترل نرخ استفاده می‌کند            |
| RL-STR-050 | SRV-PLT-001 (Content Publishing)    | PLTC-011 (Auth Manager)        | uses | سرویس انتشار از Auth Manager برای احراز هویت استفاده می‌کند           |

### سرویس به سرویس (ترکیبی)

| شناسه      | منبع                                     | هدف                               | نوع     | توضیح                                                |
| ---------- | ---------------------------------------- | --------------------------------- | ------- | ---------------------------------------------------- |
| RL-BEH-033 | SRV-PLT-003 (Distribution Orchestration) | SRV-PLT-001 (Content Publishing)  | invokes | ارکستراسیون توزیع سرویس انتشار را فراخوانی می‌کند    |
| RL-BEH-034 | SRV-PLT-003 (Distribution Orchestration) | SRV-PLT-004 (Schedule Management) | invokes | ارکستراسیون توزیع سرویس زمان‌بندی را فراخوانی می‌کند |
| RL-BEH-035 | SRV-PLT-010 (Metrics Computation)        | SRV-PLT-009 (Analytics Ingestion) | invokes | سرویس محاسبه معیار داده را از سرویس ورودی می‌گیرد    |
| RL-BEH-036 | SRV-PLT-016 (Synchronization)            | SRV-PLT-015 (State Monitoring)    | invokes | سرویس همگام‌سازی وضعیت را از سرویس نظارت می‌گیرد     |

### سرویس به گروه سرویسی

| شناسه      | منبع                                               | هدف        | نوع        | توضیح                                                          |
| ---------- | -------------------------------------------------- | ---------- | ---------- | -------------------------------------------------------------- |
| RL-STR-051 | SRV-PLT-001, SRV-PLT-002, SRV-PLT-003              | SRVGRP-001 | belongs-to | سه سرویس انتشار به گروه Publishing Services تعلق دارند         |
| RL-STR-052 | SRV-PLT-004                                        | SRVGRP-002 | belongs-to | سرویس زمان‌بندی به گروه Scheduling Services تعلق دارد          |
| RL-STR-053 | SRV-PLT-005, SRV-PLT-006                           | SRVGRP-003 | belongs-to | دو سرویس تطبیق به گروه Adaptation Services تعلق دارند          |
| RL-STR-054 | SRV-PLT-007                                        | SRVGRP-004 | belongs-to | سرویس انطباق به گروه Compliance Services تعلق دارد             |
| RL-STR-055 | SRV-PLT-009, SRV-PLT-010, SRV-PLT-011, SRV-PLT-012 | SRVGRP-005 | belongs-to | چهار سرویس تحلیل به گروه Analytics Services تعلق دارند         |
| RL-STR-056 | SRV-PLT-013, SRV-PLT-014                           | SRVGRP-006 | belongs-to | دو سرویس جامعه به گروه Community Services تعلق دارند           |
| RL-STR-057 | SRV-PLT-015, SRV-PLT-016                           | SRVGRP-007 | belongs-to | دو سرویس هماهنگ‌سازی به گروه Orchestration Services تعلق دارند |
| RL-STR-058 | SRV-PLT-017, SRV-PLT-018                           | SRVGRP-008 | belongs-to | دو سرویس زیرساخت به گروه Infrastructure Services تعلق دارند    |

---

## ۱۴. Component Relationships

### روابط مؤلفه‌ای

این بخش روابط بین **مؤلفه‌های پلتفرمی (PLTC\*)** و سایر موجودیت‌ها را تعریف می‌کند.

### مؤلفه به سرویس

| شناسه      | منبع                           | هدف                      | نوع    | توضیح                                                   |
| ---------- | ------------------------------ | ------------------------ | ------ | ------------------------------------------------------- |
| RL-STR-059 | PLTC-001 (Platform Connector)  | SRV-PLT-001              | serves | Connector به سرویس انتشار خدمت می‌دهد                   |
| RL-STR-060 | PLTC-002 (Content Adapter)     | SRV-PLT-005              | serves | Content Adapter به سرویس تبدیل خدمت می‌دهد              |
| RL-STR-061 | PLTC-003 (Schedule Manager)    | SRV-PLT-004              | serves | Schedule Manager به سرویس زمان‌بندی خدمت می‌دهد         |
| RL-STR-062 | PLTC-004 (Compliance Engine)   | SRV-PLT-007              | serves | Compliance Engine به سرویس انطباق خدمت می‌دهد           |
| RL-STR-063 | PLTC-005 (Analytics Collector) | SRV-PLT-009              | serves | Analytics Collector به سرویس ورودی تحلیل خدمت می‌دهد    |
| RL-STR-064 | PLTC-006 (Platform Cache)      | SRV-PLT-005              | serves | Platform Cache به سرویس ذخیره‌سازی موقت خدمت می‌دهد     |
| RL-STR-065 | PLTC-007 (Rate Limiter)        | SRV-PLT-017              | serves | Rate Limiter به سرویس محدودیت نرخ خدمت می‌دهد           |
| RL-STR-066 | PLTC-008 (Error Handler)       | SRV-PLT-001              | serves | Error Handler به سرویس انتشار در مدیریت خطا خدمت می‌دهد |
| RL-STR-067 | PLTC-009 (Retry Manager)       | SRV-PLT-001              | serves | Retry Manager به سرویس انتشار در تلاش مجدد خدمت می‌دهد  |
| RL-STR-068 | PLTC-010 (State Store)         | SRV-PLT-015, SRV-PLT-016 | serves | State Store به سرویس‌های نظارت و همگام‌سازی خدمت می‌دهد |
| RL-STR-069 | PLTC-011 (Auth Manager)        | SRV-PLT-018              | serves | Auth Manager به سرویس احراز هویت خدمت می‌دهد            |
| RL-STR-070 | PLTC-012 (Webhook Receiver)    | SRV-PLT-006              | serves | Webhook Receiver به سرویس اعلان خدمت می‌دهد             |

### مؤلفه به لایه

| شناسه      | منبع                                                                           | هدف        | نوع        | توضیح                                       |
| ---------- | ------------------------------------------------------------------------------ | ---------- | ---------- | ------------------------------------------- |
| RL-STR-071 | PLTC-001, PLTC-003, PLTC-006, PLTC-007, PLTC-008, PLTC-009, PLTC-011, PLTC-012 | LYR-PLT-04 | belongs-to | مؤلفه‌های توزیع به لایه توزیع تعلق دارند    |
| RL-STR-072 | PLTC-002                                                                       | LYR-PLT-03 | belongs-to | Content Adapter به لایه محتوا تعلق دارد     |
| RL-STR-073 | PLTC-004                                                                       | LYR-PLT-02 | belongs-to | Compliance Engine به لایه حکمرانی تعلق دارد |
| RL-STR-074 | PLTC-005, PLTC-006                                                             | LYR-PLT-06 | belongs-to | مؤلفه‌های تحلیل به لایه تحلیل تعلق دارند    |
| RL-STR-075 | PLTC-010                                                                       | LYR-PLT-07 | belongs-to | State Store به لایه خودکارسازی تعلق دارد    |

---

## ۱۵. Module Relationships

### روابط ماژولی

این بخش روابط بین **ماژول‌های پلتفرمی (PLTM\*)** و سایر موجودیت‌ها را تعریف می‌کند.

### ماژول به Agent

| شناسه      | منبع                        | هدف                             | نوع               | توضیح                                             |
| ---------- | --------------------------- | ------------------------------- | ----------------- | ------------------------------------------------- |
| RL-OWN-001 | AI-008 (Publishing)         | PLTM-001 (Publishing Module)    | consumes-as-owner | Agent انتشار مصرف‌کننده اصلی ماژول انتشار است     |
| RL-OWN-002 | AI-003 (Content Production) | PLTM-002 (Adaptation Module)    | consumes-as-owner | Agent تولید محتوا مصرف‌کننده اصلی ماژول تطبیق است |
| RL-OWN-003 | AI-004 (Content Review)     | PLTM-003 (Compliance Module)    | consumes-as-owner | Agent بازبینی مصرف‌کننده اصلی ماژول انطباق است    |
| RL-OWN-004 | AI-010 (Analytics)          | PLTM-004 (Analytics Module)     | consumes-as-owner | Agent تحلیل مصرف‌کننده اصلی ماژول تحلیل است       |
| RL-OWN-005 | AI-009 (Community)          | PLTM-005 (Engagement Module)    | consumes-as-owner | Agent جامعه مصرف‌کننده اصلی ماژول تعامل است       |
| RL-OWN-006 | AI-010 (Analytics)          | PLTM-006 (Intelligence Module)  | consumes-as-owner | Agent تحلیل مصرف‌کننده اصلی ماژول هوش است         |
| RL-OWN-007 | AI-014 (Orchestrator)       | PLTM-007 (Orchestration Module) | consumes-as-owner | هماهنگ‌ساز مصرف‌کننده اصلی ماژول هماهنگ‌سازی است  |

### ماژول به ماژول (همکاری)

| شناسه      | منبع                            | هدف                                              | نوع          | توضیح                                                 |
| ---------- | ------------------------------- | ------------------------------------------------ | ------------ | ----------------------------------------------------- |
| RL-BEH-037 | PLTM-001 (Publishing Module)    | PLTM-002 (Adaptation Module)                     | triggers     | ماژول انتشار پس از تطبیق توسط ماژول تطبیق فعال می‌شود |
| RL-BEH-038 | PLTM-003 (Compliance Module)    | PLTM-001 (Publishing Module)                     | governs      | ماژول انطباق بر ماژول انتشار نظارت می‌کند             |
| RL-BEH-039 | PLTM-004 (Analytics Module)     | PLTM-006 (Intelligence Module)                   | feeds        | ماژول تحلیل داده را به ماژول هوش می‌دهد               |
| RL-BEH-040 | PLTM-007 (Orchestration Module) | PLTM-001, PLTM-002, PLTM-003, PLTM-004, PLTM-005 | orchestrates | ماژول هماهنگ‌سازی سایر ماژول‌ها را orchestrate می‌کند |

### ماژول به قابلیت

| شناسه      | منبع                            | هدف                                   | نوع      | توضیح                                              |
| ---------- | ------------------------------- | ------------------------------------- | -------- | -------------------------------------------------- |
| RL-STR-076 | PLTM-001 (Publishing Module)    | CAPGRP-001 (Content Publishing)       | contains | ماژول انتشار شامل گروه قابلیت انتشار است           |
| RL-STR-077 | PLTM-002 (Adaptation Module)    | CAPGRP-002 (Content Adaptation)       | contains | ماژول تطبیق شامل گروه قابلیت تطبیق است             |
| RL-STR-078 | PLTM-003 (Compliance Module)    | CAPGRP-003 (Governance)               | contains | ماژول انطباق شامل گروه قابلیت انطباق است           |
| RL-STR-079 | PLTM-004 (Analytics Module)     | CAPGRP-005 (Analytics & Intelligence) | contains | ماژول تحلیل شامل گروه قابلیت تحلیل است             |
| RL-STR-080 | PLTM-005 (Engagement Module)    | CAPGRP-004, CAPGRP-006                | contains | ماژول تعامل شامل گروه‌های مخاطب و جامعه است        |
| RL-STR-081 | PLTM-006 (Intelligence Module)  | CAPGRP-005 (Intelligence subset)      | contains | ماژول هوش شامل قابلیت‌های هوشمند است               |
| RL-STR-082 | PLTM-007 (Orchestration Module) | CAPGRP-007 (Platform Orchestration)   | contains | ماژول هماهنگ‌سازی شامل گروه قابلیت هماهنگ‌سازی است |

---

## ۱۶. Layer Relationships

### روابط لایه‌ای

این بخش روابط **بین لایه‌های معماری پلتفرم** و نحوه تعامل آنها را تعریف می‌کند.

### توالی لایه‌ها

| شناسه      | منبع                      | هدف                       | نوع          | توضیح                                              |
| ---------- | ------------------------- | ------------------------- | ------------ | -------------------------------------------------- |
| RL-DEP-028 | LYR-PLT-01 (Strategic)    | LYR-PLT-02 (Governance)   | precedes     | لایه استراتژیک قبل از لایه حکمرانی قرار دارد       |
| RL-DEP-029 | LYR-PLT-02 (Governance)   | LYR-PLT-03 (Content)      | precedes     | لایه حکمرانی قبل از لایه محتوا قرار دارد           |
| RL-DEP-030 | LYR-PLT-03 (Content)      | LYR-PLT-04 (Distribution) | precedes     | لایه محتوا قبل از لایه توزیع قرار دارد             |
| RL-DEP-031 | LYR-PLT-04 (Distribution) | LYR-PLT-05 (Engagement)   | precedes     | لایه توزیع قبل از لایه تعامل قرار دارد             |
| RL-DEP-032 | LYR-PLT-06 (Analytics)    | تمام لایه‌ها              | monitors     | لایه تحلیل تمام لایه‌ها را نظارت می‌کند            |
| RL-DEP-033 | LYR-PLT-07 (Automation)   | تمام لایه‌ها              | orchestrates | لایه خودکارسازی تمام لایه‌ها را orchestrate می‌کند |

### لایه به لایه (وابستگی)

| شناسه      | منبع                      | هدف                       | نوع        | توضیح                                                         |
| ---------- | ------------------------- | ------------------------- | ---------- | ------------------------------------------------------------- |
| RL-DEP-034 | LYR-PLT-03 (Content)      | LYR-PLT-01 (Strategic)    | depends-on | لایه محتوا به استراتژی تعریف‌شده در لایه استراتژیک وابسته است |
| RL-DEP-035 | LYR-PLT-04 (Distribution) | LYR-PLT-03 (Content)      | depends-on | لایه توزیع به محتوای لایه محتوا وابسته است                    |
| RL-DEP-036 | LYR-PLT-05 (Engagement)   | LYR-PLT-04 (Distribution) | depends-on | لایه تعامل به محتوای منتشرشده وابسته است                      |
| RL-DEP-037 | LYR-PLT-06 (Analytics)    | LYR-PLT-04 (Distribution) | depends-on | لایه تحلیل به داده توزیع وابسته است                           |
| RL-DEP-038 | LYR-PLT-02 (Governance)   | LYR-PLT-01 (Strategic)    | depends-on | لایه حکمرانی به استراتژی وابسته است                           |

---

## ۱۷. Domain Relationships

### روابط دامنه‌ای

این بخش روابط **بین دامنه‌های پلتفرمی** و نحوه تعامل آنها را تعریف می‌کند.

### دامنه به دامنه

| شناسه      | منبع                            | هدف                                                    | نوع          | توضیح                                     |
| ---------- | ------------------------------- | ------------------------------------------------------ | ------------ | ----------------------------------------- |
| RL-DEP-039 | PLTD-002 (Content Distribution) | PLTD-001 (Social Media)                                | depends-on   | توزیع به بستر رسانه اجتماعی وابسته است    |
| RL-DEP-040 | PLTD-003 (Audience Engagement)  | PLTD-002 (Content Distribution)                        | depends-on   | تعامل به محتوای منتشرشده وابسته است       |
| RL-DEP-041 | PLTD-005 (Analytics)            | PLTD-002 (Content Distribution), PLTD-003 (Engagement) | depends-on   | تحلیل به داده توزیع و تعامل وابسته است    |
| RL-DEP-042 | PLTD-004 (Brand Presence)       | PLTD-001 (Social Media), PLTD-002 (Distribution)       | depends-on   | حضور برند به رسانه و توزیع وابسته است     |
| RL-DEP-043 | PLTD-007 (Governance)           | تمام دامنه‌ها                                          | governs      | حکمرانی بر تمام دامنه‌ها حاکم است         |
| RL-DEP-044 | PLTD-006 (Automation)           | تمام دامنه‌ها                                          | orchestrates | خودکارسازی تمام دامنه‌ها را هماهنگ می‌کند |
| RL-DEP-045 | PLTD-008 (Operations)           | تمام دامنه‌ها                                          | monitors     | عملیات تمام دامنه‌ها را نظارت می‌کند      |

### دامنه به پلتفرم

| شناسه      | منبع                            | هدف                                                                | نوع         | توضیح                                      |
| ---------- | ------------------------------- | ------------------------------------------------------------------ | ----------- | ------------------------------------------ |
| RL-EXT-001 | PLTD-001 (Social Media)         | Instagram, LinkedIn, X/Twitter                                     | connects-to | دامنه رسانه به پلتفرم‌های اجتماعی متصل است |
| RL-EXT-002 | PLTD-001 (Social Media)         | Telegram, Bale                                                     | connects-to | دامنه رسانه به پیام‌رسان‌ها متصل است       |
| RL-EXT-003 | PLTD-002 (Content Distribution) | Instagram, LinkedIn, Telegram, X/Twitter, YouTube, Aparat, Website | connects-to | دامنه توزیع به همه پلتفرم‌ها متصل است      |
| RL-EXT-004 | PLTD-003 (Audience Engagement)  | Instagram, LinkedIn, Telegram, YouTube                             | connects-to | دامنه تعامل به پلتفرم‌های تعاملی متصل است  |
| RL-EXT-005 | PLTD-004 (Brand Presence)       | Instagram, LinkedIn, Website                                       | connects-to | دامنه برند به پلتفرم‌های برند متصل است     |
| RL-EXT-006 | PLTD-005 (Analytics)            | Instagram, LinkedIn, X/Twitter, YouTube, Website                   | connects-to | دامنه تحلیل به پلتفرم‌های تحلیلی متصل است  |

---

## ۱۸. Platform Boundaries

### مرزهای پلتفرمی

مرزهای پلتفرمی محدوده **روابط معتبر** بین موجودیت‌های پلتفرمی را تعریف می‌کنند.

### قواعد مرز

| ID     | قاعده                                                                            |
| ------ | -------------------------------------------------------------------------------- |
| BND-01 | روابط فقط بین موجودیت‌های ثبت‌شده در KNW-301 و KNW-302 معتبر هستند               |
| BND-02 | هیچ رابطه‌ای نباید از لایه LYR-PLT-07 به LYR-PLT-01 مستقیم باشد                  |
| BND-03 | روابط بین دامنه‌ها فقط از طریق لایه‌های مشترک مجاز است                           |
| BND-04 | یک مؤلفه فقط می‌تواند با سرویس‌های هم‌لایه خود رابطه داشته باشد                  |
| BND-05 | روابط خارجی (REL-EXT) فقط از طریق PLTC-001 (Platform Connector) مجاز است         |
| BND-06 | روابط کنترلی (REL-CTL) فقط از بالابه‌پایین (از لایه بالاتر به پایین‌تر) مجاز است |

### ماتریس مرز رابطه

| از / به | دامنه | لایه | قابلیت | سرویس | مؤلفه | ماژول | خارجی |
| ------- | ----- | ---- | ------ | ----- | ----- | ----- | ----- |
| دامنه   | ✓     | ✓    | ✓      | —     | —     | —     | ✓     |
| لایه    | —     | ✓    | ✓      | —     | —     | ✓     | —     |
| قابلیت  | —     | —    | ✓      | ✓     | —     | —     | —     |
| سرویس   | —     | —    | ✓      | ✓     | ✓     | —     | —     |
| مؤلفه   | —     | —    | —      | ✓     | ✓     | ✓     | ✓     |
| ماژول   | —     | ✓    | ✓      | —     | ✓     | ✓     | —     |
| خارجی   | —     | —    | —      | —     | ✓     | —     | ✓     |

---

## ۱۹. Ownership Relationships

### روابط مالکیتی

این بخش روابط **مالکیت، stewardship و مصرف** بین موجودیت‌ها و ذی‌نفعان را تعریف می‌کند.

### مالکیت گروه‌های قابلیتی

| شناسه      | مالک              | موجودیت                               | نوع  | توضیح                                 |
| ---------- | ----------------- | ------------------------------------- | ---- | ------------------------------------- |
| RL-OWN-008 | معمار پلتفرم      | CAPGRP-001 (Content Publishing)       | owns | معمار پلتفرم مالک گروه انتشار است     |
| RL-OWN-009 | معمار پلتفرم      | CAPGRP-002 (Content Adaptation)       | owns | معمار پلتفرم مالک گروه تطبیق است      |
| RL-OWN-010 | افسر انطباق       | CAPGRP-003 (Governance)               | owns | افسر انطباق مالک گروه انطباق است      |
| RL-OWN-011 | استراتژیست پلتفرم | CAPGRP-004 (Audience Operations)      | owns | استراتژیست پلتفرم مالک گروه مخاطب است |
| RL-OWN-012 | مدیر تحلیل        | CAPGRP-005 (Analytics & Intelligence) | owns | مدیر تحلیل مالک گروه تحلیل است        |
| RL-OWN-013 | مدیر جامعه        | CAPGRP-006 (Community Operations)     | owns | مدیر جامعه مالک گروه جامعه است        |
| RL-OWN-014 | معمار سیستم       | CAPGRP-007 (Platform Orchestration)   | owns | معمار سیستم مالک گروه هماهنگ‌سازی است |

### مالکیت گروه‌های سرویسی

| شناسه      | مالک             | موجودیت                              | نوع  | توضیح                                    |
| ---------- | ---------------- | ------------------------------------ | ---- | ---------------------------------------- |
| RL-OWN-015 | مدیر انتشار      | SRVGRP-001 (Publishing Services)     | owns | مدیر انتشار مالک گروه سرویس انتشار است   |
| RL-OWN-016 | مدیر برنامه‌ریزی | SRVGRP-002 (Scheduling Services)     | owns | مدیر برنامه‌ریزی مالک گروه زمان‌بندی است |
| RL-OWN-017 | مدیر محتوا       | SRVGRP-003 (Adaptation Services)     | owns | مدیر محتوا مالک گروه تطبیق است           |
| RL-OWN-018 | افسر انطباق      | SRVGRP-004 (Compliance Services)     | owns | افسر انطباق مالک گروه انطباق است         |
| RL-OWN-019 | مدیر تحلیل       | SRVGRP-005 (Analytics Services)      | owns | مدیر تحلیل مالک گروه تحلیل است           |
| RL-OWN-020 | مدیر جامعه       | SRVGRP-006 (Community Services)      | owns | مدیر جامعه مالک گروه جامعه است           |
| RL-OWN-021 | معمار سیستم      | SRVGRP-007 (Orchestration Services)  | owns | معمار سیستم مالک گروه هماهنگ‌سازی است    |
| RL-OWN-022 | معمار امنیت      | SRVGRP-008 (Infrastructure Services) | owns | معمار امنیت مالک گروه زیرساخت است        |

### مصرف‌کنندگان سرویس

| شناسه      | مصرف‌کننده | موجودیت                            | نوع               | توضیح                                                 |
| ---------- | ---------- | ---------------------------------- | ----------------- | ----------------------------------------------------- |
| RL-OWN-023 | AI-008     | SRVGRP-001, SRVGRP-002, SRVGRP-008 | consumes-as-owner | Agent انتشار مصرف‌کننده اصلی سرویس‌های انتشار است     |
| RL-OWN-024 | AI-003     | SRVGRP-003                         | consumes-as-owner | Agent تولید محتوا مصرف‌کننده اصلی سرویس‌های تطبیق است |
| RL-OWN-025 | AI-004     | SRVGRP-004                         | consumes-as-owner | Agent بازبینی مصرف‌کننده اصلی سرویس انطباق است        |
| RL-OWN-026 | AI-010     | SRVGRP-005                         | consumes-as-owner | Agent تحلیل مصرف‌کننده اصلی سرویس‌های تحلیل است       |
| RL-OWN-027 | AI-009     | SRVGRP-006                         | consumes-as-owner | Agent جامعه مصرف‌کننده اصلی سرویس‌های جامعه است       |
| RL-OWN-028 | AI-014     | SRVGRP-007                         | consumes-as-owner | هماهنگ‌ساز مصرف‌کننده اصلی سرویس‌های هماهنگ‌سازی است  |

---

## ۲۰. Governance Relationships

### روابط حکمرانی

این بخش روابط **انطباق، رعایت قواعد و تبعیت** بین موجودیت‌های پلتفرمی را تعریف می‌کند.

### انطباق قابلیت با قواعد

| شناسه      | منبع                              | هدف                               | نوع           | توضیح                                                |
| ---------- | --------------------------------- | --------------------------------- | ------------- | ---------------------------------------------------- |
| RL-GOV-001 | CAP-PLT-007 (Platform Compliance) | KNW-102 (Business Rules)          | complies-with | قابلیت انطباق از قواعد کسب‌وکار KNW-102 تبعیت می‌کند |
| RL-GOV-002 | CAP-PLT-008 (Brand Compliance)    | BRD-001, BRD-002 (Brand Identity) | complies-with | قابلیت انطباق برند از هویت برند تبعیت می‌کند         |
| RL-GOV-003 | CAP-PLT-001..020                  | KNW-301 (Platform Foundation)     | complies-with | همه قابلیت‌ها از معماری پایه KNW-301 تبعیت می‌کنند   |

### انطباق سرویس با قواعد

| شناسه      | منبع                              | هدف                                   | نوع           | توضیح                                             |
| ---------- | --------------------------------- | ------------------------------------- | ------------- | ------------------------------------------------- |
| RL-GOV-004 | SRV-PLT-007 (Compliance Checking) | PLAT-000 (Platform Playbook Standard) | complies-with | سرویس انطباق از استاندارد PLAT-000 تبعیت می‌کند   |
| RL-GOV-005 | SRV-PLT-001..018                  | CON-000 (SMOS Constitution)           | complies-with | همه سرویس‌ها از قانون اساسی SMOS تبعیت می‌کنند    |
| RL-GOV-006 | SRV-PLT-001 (Content Publishing)  | GOV-\* (Governance Standards)         | complies-with | سرویس انتشار از استانداردهای حکمرانی تبعیت می‌کند |

### انطباق مؤلفه با استانداردها

| شناسه      | منبع                          | هدف                                | نوع           | توضیح                                            |
| ---------- | ----------------------------- | ---------------------------------- | ------------- | ------------------------------------------------ |
| RL-GOV-007 | PLTC-001 (Platform Connector) | ARCH-020 (Multi-Platform Strategy) | complies-with | Connector از استراتژی چندپلتفرمی تبعیت می‌کند    |
| RL-GOV-008 | PLTC-004 (Compliance Engine)  | KNW-102 (Business Rules)           | complies-with | Compliance Engine از قواعد کسب‌وکار تبعیت می‌کند |
| RL-GOV-009 | PLTC-011 (Auth Manager)       | CON-000 (Security Principles)      | complies-with | Auth Manager از اصول امنیتی تبعیت می‌کند         |

### حکمرانی لایه‌ها

| شناسه      | منبع                            | هدف                           | نوع         | توضیح                                        |
| ---------- | ------------------------------- | ----------------------------- | ----------- | -------------------------------------------- |
| RL-GOV-010 | LYR-PLT-02 (Governance Layer)   | LYR-PLT-01 (Strategic Layer)  | governed-by | لایه حکمرانی تحت حاکمیت استراتژی است         |
| RL-GOV-011 | LYR-PLT-03 (Content Layer)      | LYR-PLT-02 (Governance Layer) | governed-by | لایه محتوا تحت حاکمیت قواعد لایه حکمرانی است |
| RL-GOV-012 | LYR-PLT-04 (Distribution Layer) | LYR-PLT-02 (Governance Layer) | governed-by | لایه توزیع تحت حاکمیت قواعد انطباق است       |
| RL-GOV-013 | LYR-PLT-05 (Engagement Layer)   | LYR-PLT-02 (Governance Layer) | governed-by | لایه تعامل تحت حاکمیت قواعد انطباق است       |
| RL-GOV-014 | LYR-PLT-06 (Analytics Layer)    | LYR-PLT-02 (Governance Layer) | governed-by | لایه تحلیل تحت حاکمیت قواعد حریم خصوصی است   |
| RL-GOV-015 | LYR-PLT-07 (Automation Layer)   | LYR-PLT-02 (Governance Layer) | governed-by | لایه خودکارسازی تحت حاکمیت قواعد عملیاتی است |

---

## ۲۱. Validation Rules

| ID    | قانون                                                                                 | سطح     | نقض   |
| ----- | ------------------------------------------------------------------------------------- | ------- | ----- |
| VR-01 | هر رابطه دارای شناسه یکتا است                                                         | معماری  | خطا   |
| VR-02 | هر رابطه دارای منبع و هدف معتبر است (موجودیت باید در KNW-301 یا KNW-302 ثبت شده باشد) | معماری  | خطا   |
| VR-03 | هر رابطه دارای نوع معتبر از REL-TYPE-\* است                                           | معماری  | خطا   |
| VR-04 | هیچ رابطه‌ای موجودیت جدیدی معرفی نمی‌کند                                              | معماری  | خطا   |
| VR-05 | روابط وابستگی (REL-DEP) غیرچرخه‌ای هستند                                              | معماری  | خطا   |
| VR-06 | روابط لایه‌ای با مرزهای تعریف‌شده در BND-\* سازگار هستند                              | معماری  | خطا   |
| VR-07 | هر موجودیت KNW-301 حداقل یک رابطه دارد                                                | معماری  | هشدار |
| VR-08 | هر قابلیت CAP-PLT\* حداقل یک رابطه به لایه دارد                                       | معماری  | خطا   |
| VR-09 | هر سرویس SRV-PLT\* حداقل یک رابطه به مؤلفه دارد                                       | معماری  | هشدار |
| VR-10 | هیچ رابطه‌ای بین موجودیت‌های غیرهم‌خانواده بدون مجوز مرز وجود ندارد                   | معماری  | خطا   |
| VR-11 | روابط خارجی (REL-EXT) فقط از طریق PLTC-001 مجاز است                                   | معماری  | خطا   |
| VR-12 | روابط مالکیتی (REL-OWN) باید موجودیت انسانی یا Agent معتبر داشته باشند                | محتوایی | خطا   |
| VR-13 | رابطه معکوس هر رابطه باید در Registry ثبت شود (در صورت وجود)                          | معماری  | هشدار |
| VR-14 | هر ماژول PLTM\* حداقل یک رابطه به لایه و یک رابطه به مؤلفه دارد                       | معماری  | هشدار |
| VR-15 | روابط کنترلی فقط از لایه بالاتر به لایه پایین‌تر مجاز است                             | معماری  | خطا   |

---

## ۲۲. Quality Gates

| گیت   | مکان                | معیار                                              | مسئول        |
| ----- | ------------------- | -------------------------------------------------- | ------------ |
| QG-01 | Draft → Review      | هویت کامل، ۳۰ بخش، همه انواع رابطه تعریف شده‌اند   | خودکار       |
| QG-02 | Review → Approved   | اعتبارسنجی همه روابط با KNW-301 و KNW-302          | معمار دانش   |
| QG-03 | Approved → Active   | ثبت در KNW-001 و تأیید عدم چرخه وابستگی            | متولی دانش   |
| QG-04 | Active → Updated    | هماهنگی با تغییرات KNW-301 و KNW-302 جدید          | معمار پلتفرم |
| QG-05 | Registry → Verified | همه موجودیت‌های مرجع در Registry دارای رابطه هستند | خودکار       |

---

## ۲۳. Evolution Strategy

### استراتژی تکامل روابط

KNW-303 با اضافه شدن موجودیت‌های جدید در KNW-301 و KNW-302 تکامل می‌یابد.

### قواعد تکامل

| ID     | قاعده                                                                             |
| ------ | --------------------------------------------------------------------------------- |
| EVO-01 | اضافه شدن موجودیت جدید در KNW-301 نیازمند اضافه شدن حداقل یک رابطه در KNW-303 است |
| EVO-02 | اضافه شدن قابلیت جدید در KNW-302 نیازمند رابطه با لایه و سرویس در KNW-303 است     |
| EVO-03 | حذف موجودیت از KNW-301 نیازمند حذف همه روابط مرتبط در KNW-303 است                 |
| EVO-04 | تغییر نوع رابطه نیازمند ADR است                                                   |
| EVO-05 | اضافه کردن نوع رابطه جدید نیازمند به‌روزرسانی تاکسونومی (بخش ۵) است               |

### الگوی تکامل

| مرحله | اقدام                                                  | خروجی              |
| ----- | ------------------------------------------------------ | ------------------ |
| ۱     | موجودیت جدید در KNW-301 یا KNW-302 ثبت می‌شود          | Entity Record      |
| ۲     | روابط پیش‌فرض بر اساس نوع موجودیت ایجاد می‌شود         | Relationship Draft |
| ۳     | اعتبارسنجی خودکار روابط انجام می‌شود                   | Validation Report  |
| ۴     | روابط در Registry KNW-303 ثبت می‌شوند                  | Registry Entry     |
| ۵     | نگاشت به مصرف‌کنندگان (AI-_, AUT-_) به‌روزرسانی می‌شود | Consumer Mapping   |

---

## ۲۴. Relationship Registry

### Registry مرکزی روابط

| شناسه  | دامنه                       | تعداد روابط                             | بخش مرجع   |
| ------ | --------------------------- | --------------------------------------- | ---------- |
| RL-STR | Structural Relationships    | ۸۲                                      | بخش ۷      |
| RL-BEH | Behavioral Relationships    | ۴۰                                      | بخش ۸      |
| RL-DEP | Dependency Relationships    | ۳۸                                      | بخش ۹      |
| RL-COM | Communication Relationships | ۱۳                                      | بخش ۱۰, ۱۱ |
| RL-DAT | Data Relationships          | (از طریق RL-COM و RL-BEH پوشش داده شده) | —          |
| RL-CTL | Control Relationships       | (در RL-BEH و RL-DEP ادغام شده)          | —          |
| RL-GOV | Governance Relationships    | ۱۵                                      | بخش ۲۰     |
| RL-OWN | Ownership Relationships     | ۲۸                                      | بخش ۱۹     |
| RL-EXT | External Relationships      | ۶                                       | بخش ۱۷     |

### آمار Registry

| معیار                    | مقدار |
| ------------------------ | ----- |
| مجموع روابط ثبت‌شده      | ۲۲۲   |
| مجموع انواع رابطه        | ۲۸    |
| مجموع ماهیت‌های رابطه    | ۹     |
| موجودیت‌های مبدأ یکتا    | ۶۲    |
| موجودیت‌های مقصد یکتا    | ۴۸    |
| پوشش موجودیت‌های KNW-301 | ۱۰۰٪  |
| پوشش موجودیت‌های KNW-302 | ۱۰۰٪  |

---

## ۲۵. Relationship Constraints

### محدودیت‌های رابطه

| شناسه      | محدودیت                 | توضیح                                                        | شدت   |
| ---------- | ----------------------- | ------------------------------------------------------------ | ----- |
| CST-REL-01 | Non-Circular Dependency | وابستگی‌ها نباید چرخه ایجاد کنند                             | خطا   |
| CST-REL-02 | Single Source of Truth  | هر رابطه فقط یک بار در KNW-303 ثبت می‌شود                    | خطا   |
| CST-REL-03 | Directional Flow        | روابط باید جهت مشخص داشته باشند                              | خطا   |
| CST-REL-04 | Boundary Compliance     | روابط نباید از مرزهای تعریف‌شده عبور کنند                    | خطا   |
| CST-REL-05 | Entity Existence        | منبع و هدف هر رابطه باید در KNW-301 یا KNW-302 ثبت شده باشند | خطا   |
| CST-REL-06 | Type Validity           | نوع رابطه باید از REL-TYPE-\* معتبر باشد                     | خطا   |
| CST-REL-07 | No Duplicate            | هیچ دو رابطه‌ای نباید منبع، هدف و نوع یکسان داشته باشند      | خطا   |
| CST-REL-08 | Inverse Completeness    | اگر رابطه inverse دارد، باید هر دو ثبت شوند                  | هشدار |
| CST-REL-09 | Consumer Consistency    | مصرف‌کننده رابطه باید با سطح دسترسی سازگار باشد              | هشدار |

---

## ۲۶. Naming Rules

### قواعد نام‌گذاری روابط

| الگو          | شناسه          | مثال         |
| ------------- | -------------- | ------------ |
| رابطه ساختاری | `RL-STR-NNN`   | RL-STR-001   |
| رابطه رفتاری  | `RL-BEH-NNN`   | RL-BEH-001   |
| رابطه وابستگی | `RL-DEP-NNN`   | RL-DEP-001   |
| رابطه ارتباطی | `RL-COM-NNN`   | RL-COM-001   |
| رابطه حکمرانی | `RL-GOV-NNN`   | RL-GOV-001   |
| رابطه مالکیتی | `RL-OWN-NNN`   | RL-OWN-001   |
| رابطه خارجی   | `RL-EXT-NNN`   | RL-EXT-001   |
| نوع رابطه     | `REL-TYPE-NNN` | REL-TYPE-001 |
| شدت رابطه     | `REL-INT-NN`   | REL-INT-01   |
| الگوی تعامل   | `INT-MOD-NN`   | INT-MOD-01   |
| کانال ارتباطی | `COMM-CH-NN`   | COMM-CH-01   |

### قواعد عمومی

| ID     | قاعده                                                              |
| ------ | ------------------------------------------------------------------ |
| NAM-01 | شناسه روابط منحصربه‌فرد و ترتیبی هستند                             |
| NAM-02 | شناسه روابط با پیشوند دسته رابطه شروع می‌شود                       |
| NAM-03 | نام‌ها با ARCH-003 (Enterprise Canonical Vocabulary) همخوانی دارند |
| NAM-04 | از فاصله و کاراکتر خاص در شناسه استفاده نمی‌شود                    |

---

## ۲۷. Machine Readable Blocks

### Block 1 — Relationship Identity

```json
{
  "id": "KNW-303",
  "name_fa": "معماری روابط پلتفرم",
  "name_en": "Enterprise Platform Relationship Architecture",
  "version": "1.0.0-draft",
  "family": "KNW-PLT",
  "domain": "DOM-PLT-003",
  "type": "Platform Relationship Knowledge",
  "status": "draft",
  "ssot": true,
  "total_relationship_types": 28,
  "total_relationship_categories": 9,
  "total_relationships_registered": 222,
  "total_structural_relationships": 82,
  "total_behavioral_relationships": 40,
  "total_dependency_relationships": 38,
  "total_communication_relationships": 13,
  "total_governance_relationships": 15,
  "total_ownership_relationships": 28,
  "total_external_relationships": 6,
  "dependencies": ["KNW-301", "KNW-302", "KNW-000", "KNW-001"]
}
```

### Block 2 — Relationship Registry

```json
{
  "relationship_registry": [
    { "prefix": "RL-STR", "category": "REL-STR", "name": "Structural", "total": 82, "section": 7 },
    { "prefix": "RL-BEH", "category": "REL-BEH", "name": "Behavioral", "total": 40, "section": 8 },
    { "prefix": "RL-DEP", "category": "REL-DEP", "name": "Dependency", "total": 38, "section": 9 },
    {
      "prefix": "RL-COM",
      "category": "REL-COM",
      "name": "Communication",
      "total": 13,
      "section": 11
    },
    { "prefix": "RL-GOV", "category": "REL-GOV", "name": "Governance", "total": 15, "section": 20 },
    { "prefix": "RL-OWN", "category": "REL-OWN", "name": "Ownership", "total": 28, "section": 19 },
    { "prefix": "RL-EXT", "category": "REL-EXT", "name": "External", "total": 6, "section": 17 }
  ]
}
```

### Block 3 — Relationship Taxonomy

```json
{
  "relationship_types": [
    {
      "id": "REL-TYPE-001",
      "name": "contains",
      "category": "REL-STR",
      "description": "Source contains target as a part"
    },
    {
      "id": "REL-TYPE-002",
      "name": "belongs-to",
      "category": "REL-STR",
      "description": "Source belongs to target as a member"
    },
    {
      "id": "REL-TYPE-003",
      "name": "composed-of",
      "category": "REL-STR",
      "description": "Source is composed of target elements"
    },
    {
      "id": "REL-TYPE-004",
      "name": "triggers",
      "category": "REL-BEH",
      "description": "Source triggers execution of target"
    },
    {
      "id": "REL-TYPE-005",
      "name": "invokes",
      "category": "REL-BEH",
      "description": "Source invokes target operation"
    },
    {
      "id": "REL-TYPE-006",
      "name": "executes",
      "category": "REL-BEH",
      "description": "Source executes a capability via target"
    },
    {
      "id": "REL-TYPE-007",
      "name": "produces",
      "category": "REL-BEH",
      "description": "Source produces target artifact"
    },
    {
      "id": "REL-TYPE-008",
      "name": "requires",
      "category": "REL-DEP",
      "description": "Source requires target to function"
    },
    {
      "id": "REL-TYPE-009",
      "name": "depends-on",
      "category": "REL-DEP",
      "description": "Source depends on target"
    },
    {
      "id": "REL-TYPE-010",
      "name": "precedes",
      "category": "REL-DEP",
      "description": "Source precedes target in sequence"
    },
    {
      "id": "REL-TYPE-011",
      "name": "sends",
      "category": "REL-COM",
      "description": "Source sends message to target"
    },
    {
      "id": "REL-TYPE-012",
      "name": "receives",
      "category": "REL-COM",
      "description": "Source receives message from target"
    },
    {
      "id": "REL-TYPE-013",
      "name": "notifies",
      "category": "REL-COM",
      "description": "Source notifies target of events"
    },
    {
      "id": "REL-TYPE-014",
      "name": "feeds",
      "category": "REL-DAT",
      "description": "Source feeds data to target"
    },
    {
      "id": "REL-TYPE-015",
      "name": "consumes",
      "category": "REL-DAT",
      "description": "Source consumes data from target"
    },
    {
      "id": "REL-TYPE-016",
      "name": "transforms",
      "category": "REL-DAT",
      "description": "Source transforms data for target"
    },
    {
      "id": "REL-TYPE-017",
      "name": "orchestrates",
      "category": "REL-CTL",
      "description": "Source orchestrates target execution"
    },
    {
      "id": "REL-TYPE-018",
      "name": "monitors",
      "category": "REL-CTL",
      "description": "Source monitors target state"
    },
    {
      "id": "REL-TYPE-019",
      "name": "governs",
      "category": "REL-CTL",
      "description": "Source governs target behavior"
    },
    {
      "id": "REL-TYPE-020",
      "name": "delegates",
      "category": "REL-CTL",
      "description": "Source delegates tasks to target"
    },
    {
      "id": "REL-TYPE-021",
      "name": "complies-with",
      "category": "REL-GOV",
      "description": "Source complies with target rules"
    },
    {
      "id": "REL-TYPE-022",
      "name": "governed-by",
      "category": "REL-GOV",
      "description": "Source is governed by target authority"
    },
    {
      "id": "REL-TYPE-023",
      "name": "owns",
      "category": "REL-OWN",
      "description": "Source owns target entity"
    },
    {
      "id": "REL-TYPE-024",
      "name": "stewards",
      "category": "REL-OWN",
      "description": "Source stewards target entity"
    },
    {
      "id": "REL-TYPE-025",
      "name": "consumes-as-owner",
      "category": "REL-OWN",
      "description": "Source consumes target as primary consumer"
    },
    {
      "id": "REL-TYPE-026",
      "name": "connects-to",
      "category": "REL-EXT",
      "description": "Source connects to external target"
    },
    {
      "id": "REL-TYPE-027",
      "name": "exposes",
      "category": "REL-EXT",
      "description": "Source exposes interface for target"
    },
    {
      "id": "REL-TYPE-028",
      "name": "integrates-with",
      "category": "REL-EXT",
      "description": "Source integrates with external target"
    }
  ]
}
```

### Block 4 — Dependency Matrix

```json
{
  "dependency_matrix": {
    "total_dependencies": 38,
    "dependency_counts_by_category": {
      "capability-to-capability": 8,
      "service-to-service": 7,
      "service-to-component": 5,
      "module-to-layer": 7,
      "layer-to-layer": 5,
      "domain-to-domain": 5,
      "layer-sequence": 6
    },
    "critical_dependencies": [
      {
        "source": "CAP-PLT-003",
        "target": "CAP-PLT-001",
        "type": "requires",
        "severity": "strong"
      },
      {
        "source": "SRV-PLT-003",
        "target": "SRV-PLT-001",
        "type": "requires",
        "severity": "strong"
      },
      { "source": "SRV-PLT-001", "target": "PLTC-001", "type": "requires", "severity": "strong" },
      {
        "source": "LYR-PLT-04",
        "target": "LYR-PLT-03",
        "type": "depends-on",
        "severity": "strong"
      },
      { "source": "PLTD-002", "target": "PLTD-001", "type": "depends-on", "severity": "strong" }
    ]
  }
}
```

### Block 5 — Statistics

```json
{
  "total_relationships": 222,
  "total_relationship_types": 28,
  "total_categories": 9,
  "unique_source_entities": 62,
  "unique_target_entities": 48,
  "entity_coverage": {
    "KNW-301_coverage_percent": 100,
    "KNW-302_coverage_percent": 100
  },
  "relationship_distribution": {
    "structural_percent": 36.9,
    "behavioral_percent": 18.0,
    "dependency_percent": 17.1,
    "communication_percent": 5.9,
    "governance_percent": 6.8,
    "ownership_percent": 12.6,
    "external_percent": 2.7
  },
  "type_distribution": {
    "contains": 36,
    "belongs-to": 46,
    "composed-of": 3,
    "triggers": 10,
    "invokes": 14,
    "executes": 16,
    "requires": 19,
    "depends-on": 12,
    "precedes": 7,
    "sends-receives-notifies": 13,
    "governs-complies": 15,
    "owns-stewards-consumes": 28,
    "connects-to": 6
  },
  "max_depth_of_dependency_chain": 4,
  "dependency_cycles": 0
}
```

### Block 6 — Roadmap

```json
{
  "roadmap": [
    {
      "id": "P6.S9",
      "phase": "Platform Relationship Architecture",
      "description": "معماری روابط پلتفرم — ۲۲۲ رابطه بین موجودیت‌های KNW-301 و KNW-302",
      "documents": ["KNW-303"],
      "status": "current"
    },
    {
      "id": "P6.S10",
      "phase": "Platform Governance Architecture",
      "description": "معماری حکمرانی پلتفرم — ۸ دامنه حکمرانی, ۵ سطح اختیار, ۱۲ قاعده, ۷ سیاست",
      "documents": ["KNW-304"],
      "status": "current"
    },
    {
      "id": "P6.S11",
      "phase": "Platform Lifecycle Architecture",
      "description": "معماری چرخه حیات پلتفرم",
      "documents": ["KNW-305+"],
      "status": "planned"
    },
    {
      "id": "P6.S12",
      "phase": "Brand & Reference Knowledge",
      "description": "دانش برند و مرجع",
      "documents": ["KNW-701+", "KNW-801+"],
      "status": "planned"
    },
    {
      "id": "P6.S13",
      "phase": "AI & Automation Knowledge",
      "description": "دانش هوش مصنوعی و خودکارسازی",
      "documents": ["KNW-501+", "KNW-601+"],
      "status": "planned"
    }
  ]
}
```

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Platform Relationship

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:platform:relationship:canonical:v1",
  "title": "Platform Relationship",
  "description": "Schema for SMOS Platform Relationship canonical definitions in KNW-303",
  "type": "object",
  "required": ["id", "source", "target", "type", "category"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^(RL-STR|RL-BEH|RL-DEP|RL-COM|RL-GOV|RL-OWN|RL-EXT)-[0-9]{3}$"
    },
    "source": {
      "type": "string",
      "description": "Source entity ID from KNW-301 or KNW-302"
    },
    "target": {
      "type": "string",
      "description": "Target entity ID from KNW-301 or KNW-302"
    },
    "type": {
      "type": "string",
      "pattern": "^REL-TYPE-[0-9]{3}$",
      "description": "Relationship type from Relationship Taxonomy"
    },
    "category": {
      "type": "string",
      "enum": [
        "REL-STR",
        "REL-BEH",
        "REL-DEP",
        "REL-COM",
        "REL-DAT",
        "REL-CTL",
        "REL-GOV",
        "REL-OWN",
        "REL-EXT"
      ]
    },
    "severity": {
      "type": "string",
      "enum": ["strong", "medium", "weak"]
    },
    "description": {
      "type": "string",
      "maxLength": 500
    }
  },
  "additionalProperties": false
}
```

### Schema 2 — Relationship Dependency

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:platform:relationship:dependency:v1",
  "title": "Relationship Dependency",
  "description": "Schema for SMOS Platform dependency relationship definitions in KNW-303",
  "type": "object",
  "required": ["id", "source", "target", "type", "severity"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^RL-DEP-[0-9]{3}$"
    },
    "source": {
      "type": "string",
      "description": "Dependent entity ID"
    },
    "target": {
      "type": "string",
      "description": "Entity being depended upon"
    },
    "type": {
      "type": "string",
      "enum": ["requires", "depends-on", "precedes"]
    },
    "severity": {
      "type": "string",
      "enum": ["strong", "medium", "weak"]
    },
    "impact_scope": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["structural", "behavioral", "temporal", "data"]
      },
      "minItems": 1,
      "maxItems": 4
    },
    "description": {
      "type": "string",
      "maxLength": 500
    }
  },
  "additionalProperties": false
}
```

### Schema 3 — Platform Interaction

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:platform:interaction:v1",
  "title": "Platform Interaction",
  "description": "Schema for SMOS Platform Interaction pattern definitions in KNW-303",
  "type": "object",
  "required": ["id", "source", "target", "pattern", "channel"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^RL-COM-[0-9]{3}$"
    },
    "source": {
      "type": "string",
      "description": "Sending entity ID"
    },
    "target": {
      "type": "string",
      "description": "Receiving entity ID"
    },
    "pattern": {
      "type": "string",
      "enum": [
        "Request-Response",
        "Fire-and-Forget",
        "Publish-Subscribe",
        "Pipeline",
        "Orchestration"
      ]
    },
    "channel": {
      "type": "string",
      "pattern": "^COMM-CH-[0-9]{2}$"
    },
    "protocol": {
      "type": "string",
      "enum": [
        "sync-call",
        "async-message",
        "event-notification",
        "data-put",
        "data-pull",
        "state-pull"
      ]
    },
    "description": {
      "type": "string",
      "maxLength": 500
    }
  },
  "additionalProperties": false
}
```

---

## ۲۹. Statistics — آمار

| معیار                            | مقدار                                    |
| -------------------------------- | ---------------------------------------- |
| مجموع روابط ثبت‌شده              | ۲۲۲                                      |
| مجموع انواع رابطه                | ۲۸                                       |
| مجموع ماهیت‌های رابطه            | ۹                                        |
| موجودیت‌های مبدأ یکتا            | ۶۲                                       |
| موجودیت‌های مقصد یکتا            | ۴۸                                       |
| پوشش موجودیت‌های KNW-301         | ۱۰۰٪                                     |
| پوشش موجودیت‌های KNW-302         | ۱۰۰٪                                     |
| بیشترین عمق زنجیره وابستگی       | ۴                                        |
| تعداد چرخه وابستگی               | ۰                                        |
| میانگین رابطه به ازای هر موجودیت | ۲.۰                                      |
| بیشترین رابطه توسط یک موجودیت    | PLTC-001 (Platform Connector) — ۱۲ رابطه |

---

## ۳۰. Change Log

| نسخه        | تاریخ      | تغییر                                                                                                                                                                                                                                                                                                                                                                                         | توسط        |
| ----------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-29 | نگارش اولیه — معماری روابط پلتفرم سازمانی. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۸ نوع رابطه در ۹ ماهیت, ۲۲۲ رابطه ثبت‌شده بین ۶۲ موجودیت مبدأ و ۴۸ موجودیت مقصد. ۸۲ رابطه ساختاری (RL-STR), ۴۰ رابطه رفتاری (RL-BEH), ۳۸ رابطه وابستگی (RL-DEP), ۱۳ رابطه ارتباطی (RL-COM), ۱۵ رابطه حکمرانی (RL-GOV), ۲۸ رابطه مالکیتی (RL-OWN), ۶ رابطه خارجی (RL-EXT). SSOT روابط پلتفرم SMOS. | معمار سیستم |
