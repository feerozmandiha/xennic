# Enterprise AI Collaboration Architecture — معماری همکاری هوش مصنوعی سازمانی

> **شناسه:** KNW-507
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **خانواده:** KNW-AI
> **دامنه:** ACD-01
> **نوع:** AI Collaboration Architecture
> **تاریخ:** 2026-07-01
> **مسئول:** معمار همکاری هوش مصنوعی
> **SSOT:** ✅ بله — تک منبع حقیقت معماری همکاری هوش مصنوعی
> **وابستگی:** KNW-000, KNW-001, KNW-501, KNW-502, KNW-503, KNW-504, KNW-505, KNW-506, AI-000
> **مخاطب:** ai-architect, ai-engineer, prompt-engineer, ai-operator, ai-auditor

---

## 1. Purpose

### چرا معماری همکاری؟

عامل‌های هوشمند SMOS به صورت ایزوله طراحی شده‌اند اما در عمل باید با یکدیگر همکاری کنند. بدون معماری همکاری:

- تعامل بین Agentها بدون ساختار مشخص خواهد بود
- اشتراک‌گذاری زمینه (Context) بین Agentها استاندارد نیست
- مسئولیت‌های مشترک فاقد مرزهای مشخص هستند
- نتایج همکاری قابل ردیابی و حسابرسی نیست
- مقیاس‌پذیری همکاری با افزایش Agentها غیرممکن می‌شود

KNW-507 این مشکلات را با تعریف یک **چارچوب معماری همکاری** حل می‌کند که نحوه تعامل، هماهنگی و همکاری بین Agentهای SMOS را تعریف می‌کند.

### اهداف

1. **تعریف زبان مشترک همکاری**: همه Agentها از یک چارچوب همکاری واحد پیروی می‌کنند
2. **جلوگیری از هرج‌ومرج در تعاملات**: الگوهای همکاری مشخص و استاندارد
3. **قابلیت ردیابی**: هر تعامل همکاری قابل ردیابی، حسابرسی و اشکال‌زدایی است
4. **مقیاس‌پذیری**: Agentهای جدید بدون بازطراحی معماری همکاری اضافه می‌شوند
5. **خودمختاری در همکاری**: Agentها می‌توانند بدون مداخله خارجی با یکدیگر همکاری کنند

---

## 2. Scope

### Inside Scope

| حوزه                        | توضیح                   |
| --------------------------- | ----------------------- |
| Collaboration Concepts      | مفاهیم بنیادین همکاری   |
| Collaboration Entities      | موجودیت‌های همکاری      |
| Collaboration Capabilities  | قابلیت‌های همکاری       |
| Collaboration Functions     | کارکردهای همکاری        |
| Collaboration Domains       | دامنه‌های همکاری        |
| Collaboration States        | وضعیت‌های همکاری        |
| Collaboration Stages        | مراحل همکاری            |
| Collaboration Models        | مدل‌های همکاری          |
| Collaboration Relationships | روابط همکاری            |
| Collaboration Taxonomy      | طبقه‌بندی ابعادی همکاری |
| Collaboration Lifecycle     | چرخه حیات همکاری        |
| Collaboration Governance    | حکمرانی همکاری          |
| Agent Collaboration Mapping | نگاشت همکاری به Agentها |

### Outside Scope

| حوزه                       | دلیل             |
| -------------------------- | ---------------- |
| پیاده‌سازی پرامپت همکاری   | حوزه PRM-\*      |
| پیاده‌سازی Workflow همکاری | حوزه AUT-\*      |
| پروتکل‌های ارتباطی         | پیاده‌سازی فنی   |
| APIها و SDKها              | پیاده‌سازی فنی   |
| کد و الگوریتم              | پیاده‌سازی       |
| محصولات و Vendorها         | خنثی‌بودن فناوری |

---

## 3. Collaboration Principles

| ID     | اصل                           | توضیح                                                |
| ------ | ----------------------------- | ---------------------------------------------------- |
| ACP-01 | **خودمختاری در همکاری**       | هر Agent autonomously تصمیم می‌گیرد چگونه همکاری کند |
| ACP-02 | **شفافیت**                    | همه تعاملات همکاری قابل ردیابی و حسابرسی هستند       |
| ACP-03 | **حداقلی بودن**               | کمترین میزان همکاری لازم برای دستیابی به هدف         |
| ACP-04 | **Context Preservation**      | زمینه همکاری در طول چرخه حیات حفظ می‌شود             |
| ACP-05 | **Responsibility Clarity**    | هر همکاری دارای مرزهای مسئولیت مشخص است              |
| ACP-06 | **Synchronization Integrity** | هماهنگی بین Agentها همیشه قابل اعتماد است            |
| ACP-07 | **Knowledge Preservation**    | دانش حاصل از همکاری حفظ و قابل بازیابی است           |
| ACP-08 | **Evolvability**              | معماری همکاری بدون بازطراحی قابل تکامل است           |

---

## 4. Collaboration Philosophy

### دیدگاه فلسفی

همکاری در SMOS بر سه اصل فلسفی استوار است:

1. **Agentها مستقل هستند اما منزوی نیستند** — هر Agent توانایی کامل برای انجام وظایف خود را دارد، اما برای وظایف مرکب نیازمند همکاری است
2. **همکاری یک رفتار است نه یک قابلیت** — هر Agent می‌تواند همکاری کند، اما چگونگی همکاری به ماهیت وظیفه بستگی دارد
3. **همکاری بدون وابستگی** — Agentها می‌توانند بدون ایجاد وابستگی دائمی با یکدیگر همکاری کنند

### مرزهای فلسفی

| مرز         | توضیح                                          |
| ----------- | ---------------------------------------------- |
| نهفته       | Agentها بدون همکاری نیز کار می‌کنند            |
| آشکار       | Agentها برای وظایف مرکب همکاری را آغاز می‌کنند |
| تکامل‌یافته | Agentها از همکاری‌های گذشته یاد می‌گیرند       |

---

## 5. Collaboration Objectives

| ID     | هدف                | توضیح                                           | معیار        |
| ------ | ------------------ | ----------------------------------------------- | ------------ |
| ACO-01 | تعامل استاندارد    | همه Agentها از الگوی همکاری یکسان پیروی کنند    | ۱۰۰٪ Agentها |
| ACO-02 | ردیابی کامل        | هر تعامل همکاری قابل ردیابی باشد                | ۱۰۰٪ تعاملات |
| ACO-03 | حداقل هزینه همکاری | همکاری کمترین سربار را به Agent تحمیل کند       | < ۱۰٪ زمان   |
| ACO-04 | حداکثر خودمختاری   | Agentها autonomously همکاری کنند                | > ۹۰٪ موارد  |
| ACO-05 | حفظ دانش همکاری    | دانش حاصل از همکاری ذخیره شود                   | ۱۰۰٪ موارد   |
| ACO-06 | مقیاس‌پذیری        | تعداد Agentها بدون افت کیفیت همکاری افزایش یابد | خطی          |
| ACO-07 | قابلیت حسابرسی     | همه همکاری‌ها قابل حسابرسی باشند                | ۱۰۰٪         |
| ACO-08 | انعطاف‌پذیری       | الگوهای همکاری قابل ترکیب باشند                 | ۸ مدل        |

---

## 6. Collaboration Domains

| ID     | دامنه                     | توضیح                                          | اولویت |
| ------ | ------------------------- | ---------------------------------------------- | ------ |
| ACD-01 | Strategic Collaboration   | همکاری استراتژیک — بین Agentهای لایه استراتژیک | P0     |
| ACD-02 | Operational Collaboration | همکاری عملیاتی — بین Agentهای لایه اجرایی      | P0     |
| ACD-03 | Knowledge Collaboration   | همکاری دانشی — اشتراک و تبادل دانش             | P1     |
| ACD-04 | Decision Collaboration    | همکاری تصمیم‌گیری — تصمیم‌های مرکب             | P0     |
| ACD-05 | Planning Collaboration    | همکاری برنامه‌ریزی — برنامه‌های مرکب           | P1     |
| ACD-06 | Learning Collaboration    | همکاری یادگیری — یادگیری جمعی                  | P2     |
| ACD-07 | Governance Collaboration  | همکاری حکمرانی — انطباق و نظارت جمعی           | P1     |
| ACD-08 | Cross-Agent Collaboration | همکاری بین عاملی — همکاری عمومی بین هر Agent   | P0     |

---

## 7. Collaboration Concepts

| ID      | مفهوم                  | توضیح                                        | دامنه      |
| ------- | ---------------------- | -------------------------------------------- | ---------- |
| ACC-001 | Collaboration Need     | نیاز به همکاری — محرک شروع همکاری            | ACD-01..08 |
| ACC-002 | Collaboration Session  | جلسه همکاری — واحد همکاری بین Agentها        | ACD-01..08 |
| ACC-003 | Participant            | شرکت‌کننده — Agent در حال همکاری             | ACD-01..08 |
| ACC-004 | Context                | زمینه — اطلاعات مشترک بین شرکت‌کنندگان       | ACD-01..08 |
| ACC-005 | Shared Objective       | هدف مشترک — هدف نهایی همکاری                 | ACD-01..08 |
| ACC-006 | Responsibility         | مسئولیت — وظیفه هر شرکت‌کننده                | ACD-01..08 |
| ACC-007 | Artifact               | مصنوع — خروجی قابل تحویل همکاری              | ACD-01..08 |
| ACC-008 | Coordination Point     | نقطه هماهنگی — نقاط تصمیم‌گیری در همکاری     | ACD-01..08 |
| ACC-009 | Synchronization Signal | سیگنال هماهنگ‌سازی — نشانه پیشرفت همکاری     | ACD-01..08 |
| ACC-010 | Collaboration State    | وضعیت همکاری — وضعیت جاری جلسه همکاری        | ACD-01..08 |
| ACC-011 | Collaboration Model    | مدل همکاری — الگوی ساختاری همکاری            | ACD-01..08 |
| ACC-012 | Collaboration Protocol | پروتکل همکاری — قواعد تعامل در همکاری        | ACD-01..08 |
| ACC-013 | Shared Memory          | حافظه مشترک — دانش انباشته همکاری            | ACD-01..08 |
| ACC-014 | Feedback Loop          | حلقه بازخورد — بازخورد بین شرکت‌کنندگان      | ACD-01..08 |
| ACC-015 | Escalation             | ارجاع — درخواست مداخله سطح بالاتر            | ACD-07     |
| ACC-016 | Consensus              | اجماع — توافق جمعی در همکاری                 | ACD-01..08 |
| ACC-017 | Handoff                | تحویل — انتقال مسئولیت بین Agentها           | ACD-02     |
| ACC-018 | Collaboration Report   | گزارش همکاری — ثبت تعاملات همکاری            | ACD-01..08 |
| ACC-019 | Trust Level            | سطح اعتماد — میزان اعتماد بین شرکت‌کنندگان   | ACD-01..08 |
| ACC-020 | Collaboration Metric   | معیار همکاری — شاخص اندازه‌گیری کیفیت همکاری | ACD-01..08 |

---

## 8. Collaboration Taxonomy

### ابعاد طبقه‌بندی همکاری

| بعد                     | مقادیر                                                     | توضیح                |
| ----------------------- | ---------------------------------------------------------- | -------------------- |
| Collaboration Scope     | Atomic, Composite, Cross-domain, Enterprise-wide           | دامنه همکاری         |
| Collaboration Authority | Autonomous, Supervised, Directed, Mandated                 | سطح اختیار در همکاری |
| Collaboration Duration  | Transient, Short-term, Medium-term, Long-term, Permanent   | مدت زمان همکاری      |
| Collaboration Topology  | Peer-to-Peer, Hub-and-Spoke, Hierarchical, Federated, Mesh | توپولوژی همکاری      |
| Coordination Level      | None, Informed, Coordinated, Synchronized, Integrated      | سطح هماهنگی          |
| Synchronization Level   | Async, Event-driven, Periodic, Real-time, Continuous       | سطح همگام‌سازی       |
| Knowledge Sharing Level | None, Context-only, Partial, Complete, Symbiotic           | سطح اشتراک دانش      |
| Trust Level             | Untrusted, Minimal, Standard, Elevated, Full               | سطح اعتماد در همکاری |

---

## 9. Collaboration Entities

| ID      | موجودیت                   | توضیح                         | Stateful | دامنه      |
| ------- | ------------------------- | ----------------------------- | -------- | ---------- |
| ACE-001 | Collaboration Session     | جلسه همکاری بین Agentها       | ✅       | ACD-01..08 |
| ACE-002 | Participant Agent         | Agent شرکت‌کننده در همکاری    | ❌       | ACD-01..08 |
| ACE-003 | Shared Context            | زمینه مشترک همکاری            | ✅       | ACD-01..08 |
| ACE-004 | Shared Objective          | هدف مشترک همکاری              | ❌       | ACD-01..08 |
| ACE-005 | Responsibility Assignment | تخصیص مسئولیت به شرکت‌کنندگان | ✅       | ACD-01..08 |
| ACE-006 | Collaboration Artifact    | مصنوع تولیدی همکاری           | ✅       | ACD-01..08 |
| ACE-007 | Coordination Record       | ثبت هماهنگی‌ها                | ✅       | ACD-01..08 |
| ACE-008 | Synchronization Record    | ثبت همگام‌سازی‌ها             | ✅       | ACD-01..08 |
| ACE-009 | Collaboration Log         | ثبت کامل تعاملات همکاری       | ✅       | ACD-01..08 |
| ACE-010 | Collaboration Evaluation  | ارزیابی کیفیت همکاری          | ✅       | ACD-01..08 |
| ACE-011 | Collaboration Report      | گزارش نهایی همکاری            | ✅       | ACD-01..08 |
| ACE-012 | Collaboration Knowledge   | دانش حاصل از همکاری           | ✅       | ACD-03     |

---

## 10. Collaboration Capabilities

| ID        | قابلیت                    | توضیح                       | دامنه      | مرحله       |
| --------- | ------------------------- | --------------------------- | ---------- | ----------- |
| ACCAP-001 | Need Detection            | تشخیص نیاز به همکاری        | ACD-01..08 | ACST-01     |
| ACCAP-002 | Participant Discovery     | کشف شرکت‌کنندگان مناسب      | ACD-01..08 | ACST-02     |
| ACCAP-003 | Context Assembly          | مونتاژ زمینه مشترک          | ACD-01..08 | ACST-03     |
| ACCAP-004 | Objective Alignment       | هم‌راستاسازی اهداف          | ACD-01..08 | ACST-03     |
| ACCAP-005 | Responsibility Assignment | تخصیص مسئولیت               | ACD-01..08 | ACST-04     |
| ACCAP-006 | Coordination Execution    | اجرای هماهنگی               | ACD-01..08 | ACST-05     |
| ACCAP-007 | Synchronization           | همگام‌سازی بین شرکت‌کنندگان | ACD-01..08 | ACST-05     |
| ACCAP-008 | Context Synchronization   | همگام‌سازی زمینه            | ACD-01..08 | ACST-05     |
| ACCAP-009 | Progress Monitoring       | نظارت بر پیشرفت             | ACD-01..08 | ACST-05..06 |
| ACCAP-010 | Validation                | اعتبارسنجی نتایج همکاری     | ACD-01..08 | ACST-06     |
| ACCAP-011 | Knowledge Consolidation   | تجمیع دانش حاصل از همکاری   | ACD-01..08 | ACST-07     |
| ACCAP-012 | Closure                   | بستن جلسه همکاری            | ACD-01..08 | ACST-08     |
| ACCAP-013 | Evaluation                | ارزیابی کیفیت همکاری        | ACD-01..08 | ACST-08     |
| ACCAP-014 | Learning                  | یادگیری از همکاری           | ACD-01..08 | ACST-08     |

---

## 11. Collaboration Functions

| ID     | کارکرد          | توضیح                                      | قابلیت مرتبط |
| ------ | --------------- | ------------------------------------------ | ------------ |
| ACF-01 | نیازسنجی همکاری | تعیین نیاز به همکاری بر اساس پیچیدگی وظیفه | ACCAP-001    |
| ACF-02 | شرکت‌کننده‌یابی | یافتن Agentهای مناسب برای همکاری           | ACCAP-002    |
| ACF-03 | زمینه‌ساز       | ایجاد و نگهداری زمینه مشترک                | ACCAP-003    |
| ACF-04 | هدف‌گذاری       | تعریف و هماهنگی اهداف مشترک                | ACCAP-004    |
| ACF-05 | مسئولیت‌پرداز   | تخصیص و ردیابی مسئولیت‌ها                  | ACCAP-005    |
| ACF-06 | هماهنگ‌ساز      | مدیریت نقاط هماهنگی                        | ACCAP-006    |
| ACF-07 | همگام‌ساز       | همگام‌سازی وضعیت شرکت‌کنندگان              | ACCAP-007    |
| ACF-08 | زمینه‌همگام     | همگام‌سازی زمینه بین Agentها               | ACCAP-008    |
| ACF-09 | پیشرفت‌نما      | نظارت و گزارش پیشرفت                       | ACCAP-009    |
| ACF-10 | اعتبارسنج       | تأیید صحت نتایج همکاری                     | ACCAP-010    |
| ACF-11 | دانش‌پرداز      | تجمیع و ذخیره دانش همکاری                  | ACCAP-011    |
| ACF-12 | بستار           | پایان دادن به جلسه همکاری                  | ACCAP-012    |
| ACF-13 | ارزیاب          | ارزیابی کیفیت و اثربخشی همکاری             | ACCAP-013    |
| ACF-14 | یادگیر          | استخراج درس‌آموخته از همکاری               | ACCAP-014    |

---

## 12. Collaboration Stages

| ID      | مرحله                      | توضیح                | ورودی                  | خروجی                  | قابلیت‌های مجاز                            |
| ------- | -------------------------- | -------------------- | ---------------------- | ---------------------- | ------------------------------------------ |
| ACST-01 | Collaboration Need         | تشخیص نیاز به همکاری | وظیفه مرکب             | Need Assessment        | ACCAP-001                                  |
| ACST-02 | Participant Identification | شناسایی شرکت‌کنندگان | Need Assessment        | Participant List       | ACCAP-002                                  |
| ACST-03 | Context Sharing            | اشتراک زمینه         | Participant List       | Shared Context         | ACCAP-003, ACCAP-004                       |
| ACST-04 | Responsibility Assignment  | تخصیص مسئولیت        | Shared Context         | Assignments            | ACCAP-005                                  |
| ACST-05 | Coordination               | هماهنگی اجرا         | Assignments            | Coordinated Output     | ACCAP-006, ACCAP-007, ACCAP-008, ACCAP-009 |
| ACST-06 | Validation                 | اعتبارسنجی           | Coordinated Output     | Validated Result       | ACCAP-010, ACCAP-009                       |
| ACST-07 | Knowledge Consolidation    | تجمیع دانش           | Validated Result       | Consolidated Knowledge | ACCAP-011                                  |
| ACST-08 | Closure                    | بستن و ارزیابی       | Consolidated Knowledge | Session Report         | ACCAP-012, ACCAP-013, ACCAP-014            |

---

## 13. Collaboration Models

| ID      | مدل                | توضیح                             | توپولوژی   | کاربرد                          |
| ------- | ------------------ | --------------------------------- | ---------- | ------------------------------- |
| ACDM-01 | Peer-to-Peer       | همکاری همتا به همتا — بدون مرکزیت | P2P        | همکاری بین Agentهای هم‌سطح      |
| ACDM-02 | Hub-and-Spoke      | همکاری متمرکز — یک Agent مرکزی    | Hub-Spoke  | همکاری با هماهنگ‌ساز مرکزی      |
| ACDM-03 | Hierarchical       | همکاری سلسله‌مراتبی               | Hierarchy  | همکاری با سطوح اختیار مختلف     |
| ACDM-04 | Federated          | همکاری فدرال — هر Agent مستقل     | Federation | همکاری بین Agentهای مستقل       |
| ACDM-05 | Consensus          | همکاری مبتنی بر اجماع             | Mesh       | تصمیم‌گیری جمعی                 |
| ACDM-06 | Coordinator-Based  | همکاری مبتنی بر هماهنگ‌ساز        | Star       | همکاری با یک هماهنگ‌ساز اختصاصی |
| ACDM-07 | Specialist Network | شبکه تخصصی                        | Mesh       | همکاری بین Agentهای تخصصی       |
| ACDM-08 | Hybrid             | ترکیبی از مدل‌های بالا            | Adaptive   | همکاری پویا بر اساس نیاز        |

---

## 14. Collaboration States

| ID     | وضعیت         | توضیح                             | نهایی |
| ------ | ------------- | --------------------------------- | ----- |
| ACS-01 | Initialized   | جلسه همکاری ایجاد شد              | ❌    |
| ACS-02 | Discovered    | شرکت‌کنندگان شناسایی شدند         | ❌    |
| ACS-03 | Connected     | ارتباط بین شرکت‌کنندگان برقرار شد | ❌    |
| ACS-04 | Coordinating  | هماهنگی در حال اجراست             | ❌    |
| ACS-05 | Collaborating | همکاری فعال در جریان است          | ❌    |
| ACS-06 | Synchronizing | همگام‌سازی نتایج                  | ❌    |
| ACS-07 | Completed     | همکاری با موفقیت پایان یافت       | ✅    |
| ACS-08 | Archived      | جلسه همکاری بایگانی شد            | ✅    |

### انتقال‌های مجاز

| از     | به     | شرط                                 | اختیار     |
| ------ | ------ | ----------------------------------- | ---------- |
| ACS-01 | ACS-02 | Need Assessment تأیید شد            | Autonomous |
| ACS-01 | ACS-08 | نیاز به همکاری منتفی شد             | Autonomous |
| ACS-02 | ACS-03 | Participant List نهایی شد           | Autonomous |
| ACS-02 | ACS-01 | شرکت‌کننده مناسب یافت نشد           | Supervised |
| ACS-03 | ACS-04 | Shared Context آماده شد             | Autonomous |
| ACS-03 | ACS-01 | ارتباط برقرار نشد                   | Supervised |
| ACS-04 | ACS-05 | Assignments تأیید شدند              | Autonomous |
| ACS-04 | ACS-01 | هماهنگی ممکن نیست                   | Supervised |
| ACS-05 | ACS-06 | Coordinated Output آماده شد         | Autonomous |
| ACS-05 | ACS-04 | نیاز به هماهنگی مجدد                | Autonomous |
| ACS-05 | ACS-01 | همکاری ناموفق                       | Directed   |
| ACS-06 | ACS-07 | Validated Result تأیید شد           | Autonomous |
| ACS-06 | ACS-05 | نیاز به همکاری مجدد                 | Autonomous |
| ACS-06 | ACS-01 | اعتبارسنجی ناموفق                   | Directed   |
| ACS-07 | ACS-08 | Session Report بایگانی شد           | Autonomous |
| ACS-07 | ACS-05 | نیاز به بازبینی                     | Supervised |
| ACS-08 | ACS-01 | جلسه همکاری جدید بر اساس دانش گذشته | Autonomous |

---

## 15. Collaboration Lifecycle

### مراحل چرخه حیات همکاری

| شناسه   | مرحله                  | توضیح                     | وضعیت مجاز     |
| ------- | ---------------------- | ------------------------- | -------------- |
| ACLC-01 | Need Assessment        | ارزیابی نیاز به همکاری    | ACS-01         |
| ACLC-02 | Participant Discovery  | کشف و انتخاب شرکت‌کنندگان | ACS-02         |
| ACLC-03 | Context Establishment  | ایجاد زمینه مشترک         | ACS-03         |
| ACLC-04 | Coordination Execution | اجرای هماهنگی             | ACS-04, ACS-05 |
| ACLC-05 | Synchronization        | همگام‌سازی نتایج          | ACS-06         |
| ACLC-06 | Completion             | تکمیل همکاری              | ACS-07         |
| ACLC-07 | Archival               | بایگانی و ذخیره دانش      | ACS-08         |
| ACLC-08 | Evaluation & Learning  | ارزیابی و یادگیری         | ACS-07, ACS-08 |

### قواعد چرخه حیات

| قاعده    | توضیح                                             |
| -------- | ------------------------------------------------- |
| AC-LC-01 | هر جلسه همکاری از ACLC-01 شروع می‌شود             |
| AC-LC-02 | هر جلسه همکاری می‌تواند در هر مرحله‌ای خاتمه یابد |
| AC-LC-03 | خاتمه زودهنگام نیازمند ثبت دلیل است               |
| AC-LC-04 | دانش حاصل از ACLC-08 همیشه ذخیره می‌شود           |
| AC-LC-05 | بازگشت به مراحل قبلی نیازمند تأیید است            |

---

## 16. Collaboration Relationships

| ID     | رابطه                   | توضیح                     | نوع        | موجودیت مبدأ | موجودیت مقصد |
| ------ | ----------------------- | ------------------------- | ---------- | ------------ | ------------ |
| ACR-01 | Initiates               | آغاز همکاری توسط یک Agent | Functional | ACE-002      | ACE-001      |
| ACR-02 | Participates            | شرکت در همکاری            | Structural | ACE-002      | ACE-001      |
| ACR-03 | Shares Context          | اشتراک زمینه              | Behavioral | ACE-002      | ACE-003      |
| ACR-04 | Aligns Objective        | هم‌راستاسازی هدف          | Behavioral | ACE-002      | ACE-004      |
| ACR-05 | Assigns Responsibility  | تخصیص مسئولیت             | Governance | ACE-002      | ACE-005      |
| ACR-06 | Produces Artifact       | تولید مصنوع               | Functional | ACE-001      | ACE-006      |
| ACR-07 | Records Coordination    | ثبت هماهنگی               | Behavioral | ACE-001      | ACE-007      |
| ACR-08 | Generates Report        | تولید گزارش               | Functional | ACE-001      | ACE-011      |
| ACR-09 | Evaluates Collaboration | ارزیابی همکاری            | Functional | ACE-002      | ACE-010      |
| ACR-10 | Preserves Knowledge     | حفظ دانش همکاری           | Structural | ACE-011      | ACE-012      |

---

## 17. Collaboration Governance

### دامنه‌های حکمرانی همکاری

| شناسه  | دامنه حکمرانی             | توضیح                                        |
| ------ | ------------------------- | -------------------------------------------- |
| ACG-01 | Session Governance        | حکمرانی جلسه همکاری — ایجاد، مدیریت، خاتمه   |
| ACG-02 | Participation Governance  | حکمرانی شرکت — شرایط و محدودیت‌های شرکت      |
| ACG-03 | Context Governance        | حکمرانی زمینه — اشتراک و حفاظت از زمینه      |
| ACG-04 | Responsibility Governance | حکمرانی مسئولیت — تخصیص و پیگیری             |
| ACG-05 | Quality Governance        | حکمرانی کیفیت — معیارهای کیفیت همکاری        |
| ACG-06 | Knowledge Governance      | حکمرانی دانش — ذخیره و بازیابی دانش همکاری   |
| ACG-07 | Audit Governance          | حکمرانی حسابرسی — ردیابی و حسابرسی           |
| ACG-08 | Compliance Governance     | حکمرانی انطباق — انطباق با سیاست‌های سازمانی |

### قواعد حکمرانی

| ID      | قاعده                                              | دامنه  | اختیار |
| ------- | -------------------------------------------------- | ------ | ------ |
| ACG-R01 | هر جلسه همکاری باید یک Session ID یکتا داشته باشد  | ACG-01 | A-3    |
| ACG-R02 | هر شرکت‌کننده باید حداقل یک مسئولیت داشته باشد     | ACG-02 | A-2    |
| ACG-R03 | زمینه مشترک باید همیشه قابل ردیابی باشد            | ACG-03 | A-2    |
| ACG-R04 | تغییر مسئولیت باید ثبت شود                         | ACG-04 | A-2    |
| ACG-R05 | کیفیت همکاری باید پس از اتمام ارزیابی شود          | ACG-05 | A-3    |
| ACG-R06 | دانش همکاری باید در مخزن دانش ذخیره شود            | ACG-06 | A-2    |
| ACG-R07 | همه تعاملات همکاری باید قابل حسابرسی باشند         | ACG-07 | A-4    |
| ACG-R08 | همکاری باید با سیاست‌های سازمانی مطابقت داشته باشد | ACG-08 | A-3    |

---

## 18. Collaboration Constraints

| ID         | محدودیت             | توضیح                                                   | دامنه      |
| ---------- | ------------------- | ------------------------------------------------------- | ---------- |
| ACC-CST-01 | حداکثر شرکت‌کنندگان | بیش از ۱۰ Agent در یک جلسه همکاری مجاز نیست             | ACD-01..08 |
| ACC-CST-02 | حداکثر مدت همکاری   | همکاری طولانی‌مدت نیازمند بازبینی دوره‌ای است           | ACD-01..08 |
| ACC-CST-03 | حداقل سطح اعتماد    | شرکت‌کنندگان باید حداقل سطح اعتماد Standard داشته باشند | ACD-01..08 |
| ACC-CST-04 | همکاری هم‌سطح       | Agentها فقط با Agentهای هم‌سطح یا بالاتر همکاری می‌کنند | ACD-01..08 |
| ACC-CST-05 | عدم وابستگی دائم    | همکاری نباید وابستگی دائم ایجاد کند                     | ACD-01..08 |
| ACC-CST-06 | ثبت اجباری          | همه تعاملات همکاری باید ثبت شوند                        | ACD-01..08 |
| ACC-CST-07 | خاتمه امن           | خاتمه همکاری باید با حفظ یکپارچگی داده‌ها باشد          | ACD-01..08 |
| ACC-CST-08 | حفظ حریم            | اشتراک زمینه نباید اطلاعات محرمانه را افشا کند          | ACD-01..08 |

---

## 19. Collaboration Metrics

| ID      | معیار                           | توضیح                                | هدف   | اندازه‌گیری |
| ------- | ------------------------------- | ------------------------------------ | ----- | ----------- |
| ACM-001 | collaboration_success_rate      | نرخ موفقیت همکاری                    | ≥ ۹۰٪ | هفتگی       |
| ACM-002 | avg_collaboration_time          | میانگین زمان هر همکاری               | ≤ هدف | روزانه      |
| ACM-003 | participant_satisfaction        | رضایت شرکت‌کنندگان                   | ≥ ۸۵٪ | ماهانه      |
| ACM-004 | context_quality_score           | کیفیت زمینه مشترک                    | ≥ ۹۰٪ | هفتگی       |
| ACM-005 | coordination_efficiency         | کارایی هماهنگی                       | ≥ ۸۰٪ | هفتگی       |
| ACM-006 | knowledge_preservation_rate     | نرخ حفظ دانش همکاری                  | ۱۰۰٪  | ماهانه      |
| ACM-007 | collaboration_overhead          | سربار همکاری                         | ≤ ۱۰٪ | روزانه      |
| ACM-008 | autonomous_collaboration_rate   | نرخ همکاری خودمختار                  | ≥ ۹۰٪ | هفتگی       |
| ACM-009 | conflict_rate                   | نرخ تعارض در همکاری                  | ≤ ۵٪  | ماهانه      |
| ACM-010 | rework_rate                     | نرخ بازکاری ناشی از همکاری           | ≤ ۱۰٪ | ماهانه      |
| ACM-011 | audit_compliance_rate           | نرخ انطباق حسابرسی                   | ۱۰۰٪  | ماهانه      |
| ACM-012 | learning_application_rate       | نرخ کاربرد یادگیری همکاری            | ≥ ۷۰٪ | سه‌ماهه     |
| ACM-013 | cross_domain_collaboration_rate | نرخ همکاری بین‌دامنه‌ای              | ≥ ۳۰٪ | ماهانه      |
| ACM-014 | collaboration_scalability       | مقیاس‌پذیری همکاری با افزایش Agentها | خطی   | سه‌ماهه     |
| ACM-015 | lifecycle_completion_rate       | نرخ تکمیل چرخه حیات همکاری           | ≥ ۹۰٪ | هفتگی       |

---

## 20. Collaboration Registry

### رجیستری مرکزی همکاری

| شناسه          | مؤلفه              | دامنه      | نوع        | وضعیت |
| -------------- | ------------------ | ---------- | ---------- | ----- |
| ACCAP-001..014 | قابلیت‌های همکاری  | ACD-01..08 | Capability | Draft |
| ACF-01..14     | کارکردهای همکاری   | ACD-01..08 | Function   | Draft |
| ACDM-01..08    | مدل‌های همکاری     | ACD-01..08 | Model      | Draft |
| ACST-01..08    | مراحل همکاری       | ACD-01..08 | Stage      | Draft |
| ACS-01..08     | وضعیت‌های همکاری   | ACD-01..08 | State      | Draft |
| ACE-001..012   | موجودیت‌های همکاری | ACD-01..08 | Entity     | Draft |

### نگاشت Agent به مدل همکاری

| Agent  | مدل پیش‌فرض                  | مدل‌های جایگزین  |
| ------ | ---------------------------- | ---------------- |
| AI-001 | ACDM-01 (Peer-to-Peer)       | ACDM-05, ACDM-07 |
| AI-002 | ACDM-01 (Peer-to-Peer)       | ACDM-05          |
| AI-003 | ACDM-07 (Specialist Network) | ACDM-01          |
| AI-004 | ACDM-06 (Coordinator-Based)  | ACDM-03          |
| AI-005 | ACDM-01 (Peer-to-Peer)       | ACDM-04          |
| AI-006 | ACDM-07 (Specialist Network) | ACDM-01          |
| AI-007 | ACDM-07 (Specialist Network) | ACDM-01          |
| AI-008 | ACDM-02 (Hub-and-Spoke)      | ACDM-06          |
| AI-009 | ACDM-04 (Federated)          | ACDM-01          |
| AI-010 | ACDM-05 (Consensus)          | ACDM-01, ACDM-04 |
| AI-011 | ACDM-04 (Federated)          | ACDM-01          |
| AI-012 | ACDM-01 (Peer-to-Peer)       | ACDM-05          |
| AI-013 | ACDM-07 (Specialist Network) | ACDM-04          |
| AI-014 | ACDM-06 (Coordinator-Based)  | ACDM-02, ACDM-03 |

---

## 21. Quality Gates

| گیت      | مکان             | معیار                                    | مسئول  |
| -------- | ---------------- | ---------------------------------------- | ------ |
| QG-AC-01 | ACS-01 → ACS-02  | Need Assessment معتبر است                | AI-014 |
| QG-AC-02 | ACS-03 → ACS-04  | Shared Context کامل و سازگار است         | AI-004 |
| QG-AC-03 | ACS-04 → ACS-05  | Assignments با قابلیت Agentها سازگار است | AI-014 |
| QG-AC-04 | ACS-05 → ACS-06  | Coordinated Output حداقل کیفیت را دارد   | AI-004 |
| QG-AC-05 | ACS-06 → ACS-07  | Validated Result تأیید شد                | AI-004 |
| QG-AC-06 | ACS-07 → ACS-08  | Session Report ثبت و بایگانی شد          | AI-011 |
| QG-AC-07 | ACS-08 → Closure | Knowledge Consolidation کامل شد          | AI-011 |

---

## 22. Validation Rules

| ID       | قانون                                                     | سطح     | نقض             |
| -------- | --------------------------------------------------------- | ------- | --------------- |
| VR-AC-01 | هر جلسه همکاری باید حداقل ۲ شرکت‌کننده داشته باشد         | معماری  | عدم تشکیل       |
| VR-AC-02 | هر شرکت‌کننده باید حداقل یک مسئولیت داشته باشد            | معماری  | نقض حکمرانی     |
| VR-AC-03 | زمینه مشترک باید مستند باشد                               | معماری  | نقض ردیابی      |
| VR-AC-04 | همه جلسات همکاری باید ثبت شوند                            | حکمرانی | نقض حسابرسی     |
| VR-AC-05 | همکاری نباید چرخه ایجاد کند                               | معماری  | نقض ساختاری     |
| VR-AC-06 | دانش همکاری باید ذخیره شود                                | عملیاتی | نقض حفظ دانش    |
| VR-AC-07 | خاتمه همکاری باید با رضایت همه شرکت‌کنندگان باشد          | حکمرانی | نقض حکمرانی     |
| VR-AC-08 | تغییر مدل همکاری باید ثبت شود                             | معماری  | نقض ردیابی      |
| VR-AC-09 | همکاری بین‌دامنه‌ای نیازمند تأیید اضافی است               | حکمرانی | نقض اختیار      |
| VR-AC-10 | هر Agent می‌تواند همزمان در حداکثر ۳ جلسه همکاری شرکت کند | عملیاتی | نقض مقیاس‌پذیری |
| VR-AC-11 | زمان انتظار برای پاسخ در همکاری باید محدود باشد           | عملیاتی | نقض کارایی      |
| VR-AC-12 | هر جلسه همکاری باید یک Agent مسئول (Lead) داشته باشد      | معماری  | نقض حکمرانی     |

---

## 23. Naming Rules

| ID       | قاعده                   | الگو       | مثال       |
| -------- | ----------------------- | ---------- | ---------- |
| NR-AC-01 | مفاهیم همکاری           | ACC-NNN    | ACC-001    |
| NR-AC-02 | موجودیت‌های همکاری      | ACE-NNN    | ACE-001    |
| NR-AC-03 | قابلیت‌های همکاری       | ACCAP-NNN  | ACCAP-001  |
| NR-AC-04 | کارکردهای همکاری        | ACF-NN     | ACF-01     |
| NR-AC-05 | دامنه‌های همکاری        | ACD-NN     | ACD-01     |
| NR-AC-06 | وضعیت‌های همکاری        | ACS-NN     | ACS-01     |
| NR-AC-07 | مراحل همکاری            | ACST-NN    | ACST-01    |
| NR-AC-08 | مدل‌های همکاری          | ACDM-NN    | ACDM-01    |
| NR-AC-09 | روابط همکاری            | ACR-NN     | ACR-01     |
| NR-AC-10 | معیارهای همکاری         | ACM-NNN    | ACM-001    |
| NR-AC-11 | اصول همکاری             | ACP-NN     | ACP-01     |
| NR-AC-12 | مراحل چرخه حیات همکاری  | ACLC-NN    | ACLC-01    |
| NR-AC-13 | محدودیت‌های همکاری      | ACC-CST-NN | ACC-CST-01 |
| NR-AC-14 | قواعد حکمرانی همکاری    | ACG-RNN    | ACG-R01    |
| NR-AC-15 | گیت‌های کیفیت همکاری    | QG-AC-NN   | QG-AC-01   |
| NR-AC-16 | قواعد اعتبارسنجی همکاری | VR-AC-NN   | VR-AC-01   |

---

## 24. Cross References

| سند     | ارجاع به                 | نوع ارجاع           |
| ------- | ------------------------ | ------------------- |
| KNW-507 | KNW-000, KNW-001         | معماری + نمایه      |
| KNW-507 | KNW-501 (AI Foundation)  | پایه دانش           |
| KNW-507 | KNW-502 (AI Reasoning)   | استدلال             |
| KNW-507 | KNW-503 (AI Memory)      | حافظه مشترک         |
| KNW-507 | KNW-504 (AI Tool)        | ابزار همکاری        |
| KNW-507 | KNW-505 (AI Planning)    | برنامه‌ریزی همکاری  |
| KNW-507 | KNW-506 (AI Decision)    | تصمیم‌گیری همکاری   |
| KNW-507 | AI-000 (AI Architecture) | معماری مادر Agentها |
| KNW-507 | AI-014 (Orchestrator)    | هماهنگ‌ساز همکاری   |

---

## 25. Dependencies

| شناسه   | وابسته به | نوع وابستگی                      |
| ------- | --------- | -------------------------------- |
| KNW-507 | KNW-000   | مشتق‌شده (Derived-From)          |
| KNW-507 | KNW-001   | مشتق‌شده                         |
| KNW-507 | KNW-501   | مشتق‌شده — مفاهیم پایه AI        |
| KNW-507 | KNW-502   | مشتق‌شده — الگوهای استدلال مشترک |
| KNW-507 | KNW-503   | مشتق‌شده — حافظه مشترک           |
| KNW-507 | KNW-504   | مشتق‌شده — ابزار همکاری          |
| KNW-507 | KNW-505   | مشتق‌شده — برنامه‌ریزی همکاری    |
| KNW-507 | KNW-506   | مشتق‌شده — تصمیم‌گیری همکاری     |
| KNW-507 | AI-000    | معماری — معماری مادر Agentها     |

---

## 26. Machine Readable Blocks

### Block 1 — Collaboration Identity

```json
{
  "id": "KNW-507",
  "name_fa": "معماری همکاری هوش مصنوعی سازمانی",
  "name_en": "Enterprise AI Collaboration Architecture",
  "version": "1.0.0-draft",
  "family": "KNW-AI",
  "domain": "ACD-01",
  "type": "AI Collaboration Architecture",
  "status": "draft",
  "ssot": true,
  "total_concepts": 20,
  "total_entities": 12,
  "total_capabilities": 14,
  "total_functions": 14,
  "total_domains": 8,
  "total_states": 8,
  "total_stages": 8,
  "total_collaboration_models": 8,
  "total_relationships": 10,
  "total_metrics": 15,
  "total_principles": 8,
  "total_lifecycle_stages": 8,
  "dependencies": [
    "KNW-000",
    "KNW-001",
    "KNW-501",
    "KNW-502",
    "KNW-503",
    "KNW-504",
    "KNW-505",
    "KNW-506",
    "AI-000"
  ]
}
```

### Block 2 — Collaboration Ontology

```json
{
  "ontology": {
    "concepts": [
      { "id": "ACC-001", "name": "Collaboration Need", "domain": "ACD-01..08" },
      { "id": "ACC-002", "name": "Collaboration Session", "domain": "ACD-01..08" },
      { "id": "ACC-003", "name": "Participant", "domain": "ACD-01..08" },
      { "id": "ACC-004", "name": "Context", "domain": "ACD-01..08" },
      { "id": "ACC-005", "name": "Shared Objective", "domain": "ACD-01..08" },
      { "id": "ACC-006", "name": "Responsibility", "domain": "ACD-01..08" },
      { "id": "ACC-007", "name": "Artifact", "domain": "ACD-01..08" },
      { "id": "ACC-008", "name": "Coordination Point", "domain": "ACD-01..08" },
      { "id": "ACC-009", "name": "Synchronization Signal", "domain": "ACD-01..08" },
      { "id": "ACC-010", "name": "Collaboration State", "domain": "ACD-01..08" },
      { "id": "ACC-011", "name": "Collaboration Model", "domain": "ACD-01..08" },
      { "id": "ACC-012", "name": "Collaboration Protocol", "domain": "ACD-01..08" },
      { "id": "ACC-013", "name": "Shared Memory", "domain": "ACD-01..08" },
      { "id": "ACC-014", "name": "Feedback Loop", "domain": "ACD-01..08" },
      { "id": "ACC-015", "name": "Escalation", "domain": "ACD-07" },
      { "id": "ACC-016", "name": "Consensus", "domain": "ACD-01..08" },
      { "id": "ACC-017", "name": "Handoff", "domain": "ACD-02" },
      { "id": "ACC-018", "name": "Collaboration Report", "domain": "ACD-01..08" },
      { "id": "ACC-019", "name": "Trust Level", "domain": "ACD-01..08" },
      { "id": "ACC-020", "name": "Collaboration Metric", "domain": "ACD-01..08" }
    ],
    "entities": [
      {
        "id": "ACE-001",
        "name": "Collaboration Session",
        "stateful": true,
        "domain": "ACD-01..08"
      },
      { "id": "ACE-002", "name": "Participant Agent", "stateful": false, "domain": "ACD-01..08" },
      { "id": "ACE-003", "name": "Shared Context", "stateful": true, "domain": "ACD-01..08" },
      { "id": "ACE-004", "name": "Shared Objective", "stateful": false, "domain": "ACD-01..08" },
      {
        "id": "ACE-005",
        "name": "Responsibility Assignment",
        "stateful": true,
        "domain": "ACD-01..08"
      },
      {
        "id": "ACE-006",
        "name": "Collaboration Artifact",
        "stateful": true,
        "domain": "ACD-01..08"
      },
      { "id": "ACE-007", "name": "Coordination Record", "stateful": true, "domain": "ACD-01..08" },
      {
        "id": "ACE-008",
        "name": "Synchronization Record",
        "stateful": true,
        "domain": "ACD-01..08"
      },
      { "id": "ACE-009", "name": "Collaboration Log", "stateful": true, "domain": "ACD-01..08" },
      {
        "id": "ACE-010",
        "name": "Collaboration Evaluation",
        "stateful": true,
        "domain": "ACD-01..08"
      },
      { "id": "ACE-011", "name": "Collaboration Report", "stateful": true, "domain": "ACD-01..08" },
      { "id": "ACE-012", "name": "Collaboration Knowledge", "stateful": true, "domain": "ACD-03" }
    ],
    "state_machine": {
      "states": ["ACS-01", "ACS-02", "ACS-03", "ACS-04", "ACS-05", "ACS-06", "ACS-07", "ACS-08"],
      "transitions": [
        { "from": "ACS-01", "to": "ACS-02" },
        { "from": "ACS-01", "to": "ACS-08" },
        { "from": "ACS-02", "to": "ACS-03" },
        { "from": "ACS-02", "to": "ACS-01" },
        { "from": "ACS-03", "to": "ACS-04" },
        { "from": "ACS-03", "to": "ACS-01" },
        { "from": "ACS-04", "to": "ACS-05" },
        { "from": "ACS-04", "to": "ACS-01" },
        { "from": "ACS-05", "to": "ACS-06" },
        { "from": "ACS-05", "to": "ACS-04" },
        { "from": "ACS-05", "to": "ACS-01" },
        { "from": "ACS-06", "to": "ACS-07" },
        { "from": "ACS-06", "to": "ACS-05" },
        { "from": "ACS-06", "to": "ACS-01" },
        { "from": "ACS-07", "to": "ACS-08" },
        { "from": "ACS-07", "to": "ACS-05" },
        { "from": "ACS-08", "to": "ACS-01" }
      ]
    }
  }
}
```

### Block 3 — Collaboration Registry

```json
{
  "registry": {
    "domains": [
      { "id": "ACD-01", "name": "Strategic Collaboration", "type": "core", "priority": "P0" },
      { "id": "ACD-02", "name": "Operational Collaboration", "type": "core", "priority": "P0" },
      { "id": "ACD-03", "name": "Knowledge Collaboration", "type": "core", "priority": "P1" },
      { "id": "ACD-04", "name": "Decision Collaboration", "type": "core", "priority": "P0" },
      { "id": "ACD-05", "name": "Planning Collaboration", "type": "support", "priority": "P1" },
      { "id": "ACD-06", "name": "Learning Collaboration", "type": "support", "priority": "P2" },
      { "id": "ACD-07", "name": "Governance Collaboration", "type": "support", "priority": "P1" },
      { "id": "ACD-08", "name": "Cross-Agent Collaboration", "type": "core", "priority": "P0" }
    ],
    "models": [
      {
        "id": "ACDM-01",
        "name": "Peer-to-Peer",
        "topology": "P2P",
        "description": "همکاری همتا به همتا"
      },
      {
        "id": "ACDM-02",
        "name": "Hub-and-Spoke",
        "topology": "Hub-Spoke",
        "description": "همکاری متمرکز"
      },
      {
        "id": "ACDM-03",
        "name": "Hierarchical",
        "topology": "Hierarchy",
        "description": "همکاری سلسله‌مراتبی"
      },
      {
        "id": "ACDM-04",
        "name": "Federated",
        "topology": "Federation",
        "description": "همکاری فدرال"
      },
      {
        "id": "ACDM-05",
        "name": "Consensus",
        "topology": "Mesh",
        "description": "همکاری مبتنی بر اجماع"
      },
      {
        "id": "ACDM-06",
        "name": "Coordinator-Based",
        "topology": "Star",
        "description": "همکاری مبتنی بر هماهنگ‌ساز"
      },
      {
        "id": "ACDM-07",
        "name": "Specialist Network",
        "topology": "Mesh",
        "description": "شبکه تخصصی"
      },
      { "id": "ACDM-08", "name": "Hybrid", "topology": "Adaptive", "description": "ترکیبی" }
    ]
  }
}
```

### Block 4 — Collaboration Relationships

```json
{
  "relationships": [
    {
      "id": "ACR-01",
      "name": "Initiates",
      "from": "ACE-002",
      "to": "ACE-001",
      "type": "Functional"
    },
    {
      "id": "ACR-02",
      "name": "Participates",
      "from": "ACE-002",
      "to": "ACE-001",
      "type": "Structural"
    },
    {
      "id": "ACR-03",
      "name": "Shares Context",
      "from": "ACE-002",
      "to": "ACE-003",
      "type": "Behavioral"
    },
    {
      "id": "ACR-04",
      "name": "Aligns Objective",
      "from": "ACE-002",
      "to": "ACE-004",
      "type": "Behavioral"
    },
    {
      "id": "ACR-05",
      "name": "Assigns Responsibility",
      "from": "ACE-002",
      "to": "ACE-005",
      "type": "Governance"
    },
    {
      "id": "ACR-06",
      "name": "Produces Artifact",
      "from": "ACE-001",
      "to": "ACE-006",
      "type": "Functional"
    },
    {
      "id": "ACR-07",
      "name": "Records Coordination",
      "from": "ACE-001",
      "to": "ACE-007",
      "type": "Behavioral"
    },
    {
      "id": "ACR-08",
      "name": "Generates Report",
      "from": "ACE-001",
      "to": "ACE-011",
      "type": "Functional"
    },
    {
      "id": "ACR-09",
      "name": "Evaluates Collaboration",
      "from": "ACE-002",
      "to": "ACE-010",
      "type": "Functional"
    },
    {
      "id": "ACR-10",
      "name": "Preserves Knowledge",
      "from": "ACE-011",
      "to": "ACE-012",
      "type": "Structural"
    }
  ]
}
```

### Block 5 — AI Agent Mapping

```json
{
  "agent_collaboration": [
    {
      "agent": "AI-001",
      "domain": "ACD-01",
      "capabilities": ["ACCAP-001", "ACCAP-002", "ACCAP-003", "ACCAP-004", "ACCAP-009"],
      "default_model": "ACDM-01",
      "authority": "Autonomous",
      "stages": ["ACST-01..05", "ACST-07"]
    },
    {
      "agent": "AI-002",
      "domain": "ACD-01",
      "capabilities": ["ACCAP-001", "ACCAP-004", "ACCAP-005", "ACCAP-009"],
      "default_model": "ACDM-01",
      "authority": "Autonomous",
      "stages": ["ACST-01..05"]
    },
    {
      "agent": "AI-003",
      "domain": "ACD-02",
      "capabilities": ["ACCAP-003", "ACCAP-006", "ACCAP-007", "ACCAP-008", "ACCAP-009"],
      "default_model": "ACDM-07",
      "authority": "Supervised",
      "stages": ["ACST-03..06"]
    },
    {
      "agent": "AI-004",
      "domain": "ACD-07",
      "capabilities": ["ACCAP-003", "ACCAP-009", "ACCAP-010", "ACCAP-013"],
      "default_model": "ACDM-06",
      "authority": "Directed",
      "stages": ["ACST-03", "ACST-05..06", "ACST-08"]
    },
    {
      "agent": "AI-005",
      "domain": "ACD-01",
      "capabilities": ["ACCAP-002", "ACCAP-003", "ACCAP-008"],
      "default_model": "ACDM-01",
      "authority": "Autonomous",
      "stages": ["ACST-02..03", "ACST-05"]
    },
    {
      "agent": "AI-006",
      "domain": "ACD-02",
      "capabilities": ["ACCAP-003", "ACCAP-006", "ACCAP-007"],
      "default_model": "ACDM-07",
      "authority": "Supervised",
      "stages": ["ACST-03..05"]
    },
    {
      "agent": "AI-007",
      "domain": "ACD-02",
      "capabilities": ["ACCAP-003", "ACCAP-006", "ACCAP-007"],
      "default_model": "ACDM-07",
      "authority": "Supervised",
      "stages": ["ACST-03..05"]
    },
    {
      "agent": "AI-008",
      "domain": "ACD-02",
      "capabilities": ["ACCAP-003", "ACCAP-005", "ACCAP-006", "ACCAP-009", "ACCAP-010"],
      "default_model": "ACDM-02",
      "authority": "Autonomous",
      "stages": ["ACST-03..06"]
    },
    {
      "agent": "AI-009",
      "domain": "ACD-02",
      "capabilities": ["ACCAP-003", "ACCAP-006", "ACCAP-009", "ACCAP-012"],
      "default_model": "ACDM-04",
      "authority": "Autonomous",
      "stages": ["ACST-03", "ACST-05..06", "ACST-08"]
    },
    {
      "agent": "AI-010",
      "domain": "ACD-03",
      "capabilities": ["ACCAP-003", "ACCAP-009", "ACCAP-013", "ACCAP-014"],
      "default_model": "ACDM-05",
      "authority": "Autonomous",
      "stages": ["ACST-03", "ACST-05", "ACST-08"]
    },
    {
      "agent": "AI-011",
      "domain": "ACD-03",
      "capabilities": ["ACCAP-003", "ACCAP-010", "ACCAP-011", "ACCAP-014"],
      "default_model": "ACDM-04",
      "authority": "Autonomous",
      "stages": ["ACST-03", "ACST-06..08"]
    },
    {
      "agent": "AI-012",
      "domain": "ACD-06",
      "capabilities": ["ACCAP-003", "ACCAP-009", "ACCAP-013", "ACCAP-014"],
      "default_model": "ACDM-01",
      "authority": "Autonomous",
      "stages": ["ACST-03", "ACST-05", "ACST-08"]
    },
    {
      "agent": "AI-013",
      "domain": "ACD-03",
      "capabilities": ["ACCAP-001", "ACCAP-002", "ACCAP-003", "ACCAP-011"],
      "default_model": "ACDM-07",
      "authority": "Supervised",
      "stages": ["ACST-01..03", "ACST-07"]
    },
    {
      "agent": "AI-014",
      "domain": "ACD-01..08",
      "capabilities": [
        "ACCAP-001",
        "ACCAP-002",
        "ACCAP-004",
        "ACCAP-005",
        "ACCAP-006",
        "ACCAP-009",
        "ACCAP-010",
        "ACCAP-013"
      ],
      "default_model": "ACDM-06",
      "authority": "Mandated",
      "stages": ["ACST-01..08"]
    }
  ]
}
```

### Block 6 — Statistics

```json
{
  "statistics": {
    "total_concepts": 20,
    "total_entities": 12,
    "total_capabilities": 14,
    "total_functions": 14,
    "total_domains": 8,
    "total_states": 8,
    "total_transitions": 17,
    "total_stages": 8,
    "total_models": 8,
    "total_relationships": 10,
    "total_metrics": 15,
    "total_principles": 8,
    "total_lifecycle_stages": 8,
    "total_constraints": 8,
    "total_quality_gates": 7,
    "total_validation_rules": 12,
    "total_governance_rules": 8,
    "total_agents_mapped": 14,
    "taxonomy_dimensions": 8,
    "toplevel_predicates": ["is_active", "is_synchronized", "is_validated", "is_archived"],
    "lowest_state": "ACS-01",
    "highest_state": "ACS-08"
  }
}
```

---

## 27. JSON Schemas (Draft-07)

### Schema 1 — Collaboration Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:ai:collaboration:entity:v1",
  "title": "Collaboration Entity",
  "description": "Schema for SMOS Collaboration Entity definitions",
  "type": "object",
  "required": ["id", "name", "domain"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^ACE-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "description": {
      "type": "string",
      "maxLength": 500
    },
    "domain": {
      "type": "string",
      "pattern": "^ACD-[0-9]{2}$"
    },
    "stateful": {
      "type": "boolean"
    },
    "components": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 10
    }
  },
  "additionalProperties": false
}
```

### Schema 2 — Collaboration Capability

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:ai:collaboration:capability:v1",
  "title": "Collaboration Capability",
  "description": "Schema for SMOS Collaboration Capability definitions",
  "type": "object",
  "required": ["id", "name", "domain", "stage"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^ACCAP-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 50
    },
    "description": {
      "type": "string",
      "maxLength": 500
    },
    "domain": {
      "type": "string",
      "pattern": "^ACD-[0-9]{2}$"
    },
    "stage": {
      "type": "string",
      "pattern": "^ACST-[0-9]{2}$"
    },
    "collaboration_models": {
      "type": "array",
      "items": { "type": "string", "pattern": "^ACDM-[0-9]{2}$" },
      "maxItems": 8
    },
    "applicable_agents": {
      "type": "array",
      "items": { "type": "string", "pattern": "^AI-[0-9]{3}$" },
      "maxItems": 20
    }
  },
  "additionalProperties": false
}
```

### Schema 3 — Collaboration State

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:ai:collaboration:state:v1",
  "title": "Collaboration State",
  "description": "Schema for SMOS Collaboration State machine definitions",
  "type": "object",
  "required": ["id", "name", "is_final"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^ACS-[0-9]{2}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 50
    },
    "description": {
      "type": "string",
      "maxLength": 300
    },
    "is_final": {
      "type": "boolean"
    },
    "transitions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["to"],
        "properties": {
          "to": { "type": "string", "pattern": "^ACS-[0-9]{2}$" },
          "condition": { "type": "string", "maxLength": 200 }
        }
      },
      "maxItems": 10
    }
  },
  "additionalProperties": false
}
```

---

## 28. Statistics

### آمار KNW-507

| شاخص                     | مقدار |
| ------------------------ | ----- |
| تعداد مفاهیم همکاری      | ۲۰    |
| تعداد موجودیت‌های همکاری | ۱۲    |
| تعداد قابلیت‌های همکاری  | ۱۴    |
| تعداد کارکردهای همکاری   | ۱۴    |
| تعداد دامنه‌های همکاری   | ۸     |
| تعداد وضعیت‌های همکاری   | ۸     |
| تعداد انتقال‌های مجاز    | ۱۷    |
| تعداد مراحل همکاری       | ۸     |
| تعداد مدل‌های همکاری     | ۸     |
| تعداد روابط همکاری       | ۱۰    |
| تعداد محدودیت‌های همکاری | ۸     |
| تعداد معیارهای کلیدی     | ۱۵    |
| تعداد اصول همکاری        | ۸     |
| تعداد اهداف همکاری       | ۸     |
| تعداد مراحل چرخه حیات    | ۸     |
| تعداد گیت‌های کیفیت      | ۷     |
| تعداد قواعد اعتبارسنجی   | ۱۲    |
| تعداد قواعد حکمرانی      | ۸     |
| تعداد ابعاد تاکسونومی    | ۸     |
| تعداد Agentهای نگاشت‌شده | ۱۴    |

### ذی‌نفعان

| شناسه     | ذی‌نفع             | نقش                                   |
| --------- | ------------------ | ------------------------------------- |
| STK-AC-01 | AI Architect       | طراحی معماری همکاری Agentها           |
| STK-AC-02 | AI Engineer        | پیاده‌سازی قابلیت‌های همکاری          |
| STK-AC-03 | Prompt Engineer    | طراحی پرامپت‌های همکاری               |
| STK-AC-04 | AI Operator        | نظارت بر کیفیت همکاری‌ها              |
| STK-AC-05 | AI Auditor         | حسابرسی انطباق همکاری‌ها              |
| STK-AC-06 | Governance Officer | انطباق همکاری‌ها با سیاست‌های سازمانی |

---

## 29. Roadmap

### نقشه راه توسعه معماری همکاری

| فاز               | اسپرینت    | تمرکز                | اسناد       |
| ----------------- | ---------- | -------------------- | ----------- |
| Foundation        | P6.S20     | پایه دانش هوش مصنوعی | KNW-501     |
| Reasoning         | P6.S21     | معماری استدلال       | KNW-502     |
| Memory            | P6.S22     | معماری حافظه         | KNW-503     |
| Tool              | P6.S23     | معماری ابزار         | KNW-504     |
| Planning          | P6.S24     | معماری برنامه‌ریزی   | KNW-505     |
| Decision          | P6.S25     | معماری تصمیم‌گیری    | KNW-506     |
| **Collaboration** | **P6.S26** | **معماری همکاری**    | **KNW-507** |
| Learning          | P6.S27     | معماری یادگیری       | KNW-508     |
| Governance        | P6.S28     | معماری حکمرانی       | KNW-509     |

---

## 30. Change Log

| نسخه        | تاریخ      | تغییر                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | توسط        |
| ----------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-07-01 | نگارش اولیه — معماری همکاری هوش مصنوعی سازمانی SMOS. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (ACC-001 تا ACC-020), ۱۲ موجودیت (ACE-001 تا ACE-012), ۱۴ قابلیت (ACCAP-001 تا ACCAP-014), ۱۴ کارکرد (ACF-01 تا ACF-14), ۸ دامنه (ACD-01 تا ACD-08), ۸ وضعیت (ACS-01 تا ACS-08), ۸ مرحله (ACST-01 تا ACST-08), ۸ مدل همکاری (ACDM-01 تا ACDM-08), ۱۰ رابطه (ACR-01 تا ACR-10), ۱۵ معیار (ACM-001 تا ACM-015). هفتمین سند خانواده KNW-AI. Architecture Neutral, Implementation Free, Vendor Neutral. | معمار سیستم |
