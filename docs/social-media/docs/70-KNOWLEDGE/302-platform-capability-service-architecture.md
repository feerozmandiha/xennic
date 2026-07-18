# Enterprise Platform Capability & Service Architecture — معماری قابلیت‌ها و سرویس‌های پلتفرم

> **شناسه:** KNW-302
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-29
> **مسئول:** معمار دانش سازمانی
> **وابستگی:** [KNW-301](./300-platform-knowledge-foundation.md), [KNW-000](./00-enterprise-knowledge-architecture.md), [KNW-001](./10-knowledge-index.md), [KNW-101](./100-business-knowledge-foundation.md), [PLAT-000](../20-PLATFORMS/00-platform-playbook-standard.md)
> **مخاطب:** human, ai-agent, knowledge-engineer, platform-architect, capability-manager

---

## ۱. Purpose

KNW-302 مرجع رسمی قابلیت‌ها (Capabilities) و سرویس‌های (Services) پلتفرم سازمانی SMOS است. این سند SSOT (تک منبع حقیقت) برای تمام قابلیت‌ها و سرویس‌های پلتفرمی بوده و بر پایه مفاهیم KNW-301 ایجاد می‌شود.

### چرا KNW-302 وجود دارد

بدون یک معماری قابلیت و سرویس پلتفرمی:

- قابلیت‌های پلتفرم بدون ساختار و پراکنده تعریف می‌شوند
- سرویس‌های پلتفرم مرز و مسئولیت مشخصی ندارند
- نگاشت قابلیت به Agent و Automation غیرقابل ردیابی است
- اضافه کردن پلتفرم جدید نیازمند بازتعریف قابلیت‌ها است
- مصرف‌کنندگان (AI Agents, Workflows) نمی‌توانند قابلیت‌ها را به صورت ساختاریافته کشف کنند

KNW-302 این مشکلات را با تعریف **مدل رسمی قابلیت و سرویس پلتفرم** حل می‌کند.

### نقش KNW-302 در SMOS

| سند         | نقش                                                      |
| ----------- | -------------------------------------------------------- |
| KNW-301     | SSOT مفاهیم بنیادین پلتفرم (دامنه‌ها، لایه‌ها، مؤلفه‌ها) |
| **KNW-302** | **SSOT قابلیت‌ها و سرویس‌های پلتفرم**                    |
| KNW-303+    | معماری یکپارچگی و تعاملات پلتفرمی                        |
| PLAT-\*     | کتابچه‌های عملیاتی — مصرف‌کننده قابلیت‌ها                |
| AI-\*       | Agentها — مصرف‌کننده سرویس‌ها                            |

---

## ۲. Scope

### Inside Scope

| حوزه                         | توضیح                        |
| ---------------------------- | ---------------------------- |
| فلسفه قابلیت و سرویس پلتفرمی | هستی‌شناسی قابلیت و سرویس    |
| تاکسونومی قابلیت             | دسته‌بندی انواع قابلیت       |
| تاکسونومی سرویس              | دسته‌بندی انواع سرویس        |
| طبقه‌بندی قابلیت             | گروه‌های قابلیتی             |
| طبقه‌بندی سرویس              | گروه‌های سرویسی              |
| چرخه حیات قابلیت             | از تعریف تا بازنشستگی        |
| چرخه حیات سرویس              | از طراحی تا انقضا            |
| مدل قابلیت                   | ساختار، ویژگی‌ها و پارامترها |
| مدل سرویس                    | ساختار، ویژگی‌ها و مشخصات    |
| وابستگی‌های قابلیتی          | روابط بین قابلیت‌ها          |
| وابستگی‌های سرویسی           | روابط بین سرویس‌ها           |
| مالکیت و حکمرانی             | مسئولیت و نگهداری            |

### Outside Scope

| حوزه                   | دلیل                   |
| ---------------------- | ---------------------- |
| مفاهیم بنیادین پلتفرم  | حوزه KNW-301           |
| مؤلفه‌های پلتفرمی      | حوزه KNW-301           |
| ماژول‌های پلتفرمی      | حوزه KNW-301           |
| API و پیاده‌سازی سرویس | حوزه فنی (خارج از KNW) |
| پیکربندی Agent         | حوزه AI-\*             |
| Workflowهای خودکار     | حوزه AUT-\*            |
| پرامپت‌های پلتفرمی     | حوزه PRM-\*            |

---

## ۳. Capability Philosophy

### فلسفه قابلیت پلتفرمی

SMOS قابلیت پلتفرمی را به عنوان **توانایی انجام یک وظیفه پلتفرمی** تعریف می‌کند که:

1. **مستقل از پیاده‌سازی است** — یک قابلیت می‌تواند توسط سرویس‌های مختلف ارائه شود
2. **قابل ترکیب است** — قابلیت‌ها برای تشکیل وظایف پیچیده ترکیب می‌شوند
3. **قابل اندازه‌گیری است** — هر قابلیت دارای KPI است
4. **دارای مالک است** — هر قابلیت یک مالک مشخص دارد
5. **قابل مصرف توسط Agent است** — Agentها قابلیت‌ها را مصرف می‌کنند

### اصول هستی‌شناسی قابلیت

| اصل                                      | توضیح                              |
| ---------------------------------------- | ---------------------------------- |
| **هر قابلیت یک توانایی است**             | نه یک وظیفه، نه یک فرآیند          |
| **هر قابلیت به یک لایه تعلق دارد**       | لایه معماری پلتفرم                 |
| **هر قابلیت توسط یک سرویس ارائه می‌شود** | سرویس مجری قابلیت است              |
| **قابلیت‌ها قابل تفکیک هستند**           | مرز مشخص بین قابلیت‌ها             |
| **قابلیت‌ها قابل نگاشت به Agent هستند**  | هر قابلیت حداقل یک مصرف‌کننده دارد |

---

## ۴. Service Philosophy

### فلسفه سرویس پلتفرمی

SMOS سرویس پلتفرمی را به عنوان **مجری یک یا چند قابلیت پلتفرمی** تعریف می‌کند که:

1. **ورودی/خروجی مشخص دارد** — قرارداد سرویس شفاف است
2. **حالت‌پذیر یا بی‌حالت است** — stateful یا stateless
3. **دارای خطاهای مشخص است** — دامنه خطا تعریف شده است
4. **قابل زمان‌بندی است** — sync یا async
5. **قابل مصرف توسط Agent و Automation است** — هر دو می‌توانند مصرف کنند

### اصول هستی‌شناسی سرویس

| اصل                                           | توضیح                         |
| --------------------------------------------- | ----------------------------- |
| **هر سرویس یک یا چند قابلیت را ارائه می‌دهد** | رابطه یک‌به‌چند               |
| **هر سرویس مستقل از سایر سرویس‌ها است**       | مگر با وابستگی مشخص           |
| **هر سرویس دارای یک مالک است**                | مسئولیت سرویس مشخص است        |
| **سرویس‌ها قابل ترکیب هستند**                 | برای تشکیل قابلیت‌های مرکب    |
| **سرویس‌ها قابل تعویض هستند**                 | پیاده‌سازی می‌تواند تغییر کند |

---

## ۵. Capability Taxonomy

### تاکسونومی قابلیت

KNW-302 قابلیت‌ها را بر اساس دو بعد اصلی طبقه‌بندی می‌کند:

#### بعد اول — دسته قابلیت

| دسته         | شناسه     | توضیح                           | مثال          |
| ------------ | --------- | ------------------------------- | ------------- |
| Core         | CAPCAT-01 | قابلیت‌های اصلی و حیاتی پلتفرم  | انتشار محتوا  |
| Shared       | CAPCAT-02 | قابلیت‌های مشترک بین چند پلتفرم | زمان‌بندی     |
| Support      | CAPCAT-03 | قابلیت‌های پشتیبانی‌کننده       | کش، خطا       |
| Integration  | CAPCAT-04 | قابلیت‌های یکپارچگی             | اتصال API     |
| Governance   | CAPCAT-05 | قابلیت‌های حکمرانی              | انطباق        |
| Analytics    | CAPCAT-06 | قابلیت‌های تحلیلی               | جمع‌آوری داده |
| Intelligence | CAPCAT-07 | قابلیت‌های هوشمند               | بینش، پیشنهاد |

#### بعد دوم — سطح قابلیت

| سطح | شناسه     | توضیح                                         |
| --- | --------- | --------------------------------------------- |
| L1  | CAPLVL-01 | قابلیت پایه — توسط یک سرویس ساده ارائه می‌شود |
| L2  | CAPLVL-02 | قابلیت ترکیبی — نیازمند هماهنگی چند سرویس     |
| L3  | CAPLVL-03 | قابلیت مرکب — نیازمند ارکستراسیون             |

---

## ۶. Service Taxonomy

### تاکسونومی سرویس

#### دسته‌های سرویس

| دسته                | شناسه     | توضیح                   | مثال             |
| ------------------- | --------- | ----------------------- | ---------------- |
| Business Service    | SRVCAT-01 | سرویس‌های منطق کسب‌وکار | Publishing       |
| Application Service | SRVCAT-02 | سرویس‌های کاربردی       | Scheduling       |
| Platform Service    | SRVCAT-03 | سرویس‌های بستر پلتفرم   | Connector        |
| Integration Service | SRVCAT-04 | سرویس‌های یکپارچگی      | Webhook          |
| Knowledge Service   | SRVCAT-05 | سرویس‌های دانش          | Taxonomy         |
| Automation Service  | SRVCAT-06 | سرویس‌های خودکارسازی    | Orchestration    |
| AI Service          | SRVCAT-07 | سرویس‌های هوش مصنوعی    | Sentiment        |
| Shared Service      | SRVCAT-08 | سرویس‌های مشترک         | Auth, Rate Limit |

#### نوع سرویس بر اساس حالت

| نوع          | شناسه      | توضیح                     |
| ------------ | ---------- | ------------------------- |
| Synchronous  | SRVTYPE-01 | پاسخ همزمان               |
| Asynchronous | SRVTYPE-02 | پاسخ غیرهمزمان با Receipt |
| Streaming    | SRVTYPE-03 | جریان داده مداوم          |
| Batch        | SRVTYPE-04 | پردازش دسته‌ای            |

---

## ۷. Capability Classification

### گروه‌های قابلیتی

| شناسه      | گروه                     | دسته        | قابلیت‌های زیرمجموعه                               |
| ---------- | ------------------------ | ----------- | -------------------------------------------------- |
| CAPGRP-001 | Content Publishing       | Core        | CAP-PLT-001, CAP-PLT-002, CAP-PLT-003              |
| CAPGRP-002 | Content Adaptation       | Core        | CAP-PLT-004, CAP-PLT-005, CAP-PLT-006              |
| CAPGRP-003 | Platform Governance      | Governance  | CAP-PLT-007, CAP-PLT-008                           |
| CAPGRP-004 | Audience Operations      | Shared      | CAP-PLT-009, CAP-PLT-010                           |
| CAPGRP-005 | Analytics & Intelligence | Analytics   | CAP-PLT-011, CAP-PLT-012, CAP-PLT-013, CAP-PLT-014 |
| CAPGRP-006 | Community Operations     | Support     | CAP-PLT-015, CAP-PLT-016                           |
| CAPGRP-007 | Platform Orchestration   | Integration | CAP-PLT-017, CAP-PLT-018, CAP-PLT-019, CAP-PLT-020 |

### کاتالوگ کامل قابلیت‌ها

| شناسه       | قابلیت                          | گروه       | دسته         | سطح | لایه KNW-301 | سرویس مرتبط |
| ----------- | ------------------------------- | ---------- | ------------ | --- | ------------ | ----------- |
| CAP-PLT-001 | Single Content Publish          | CAPGRP-001 | Core         | L1  | LYR-PLT-04   | SRV-PLT-001 |
| CAP-PLT-002 | Batch Content Publish           | CAPGRP-001 | Core         | L2  | LYR-PLT-04   | SRV-PLT-002 |
| CAP-PLT-003 | Multi-Platform Distribution     | CAPGRP-001 | Core         | L2  | LYR-PLT-04   | SRV-PLT-003 |
| CAP-PLT-004 | Time-Based Scheduling           | CAPGRP-002 | Core         | L1  | LYR-PLT-04   | SRV-PLT-004 |
| CAP-PLT-005 | Event-Triggered Scheduling      | CAPGRP-002 | Core         | L2  | LYR-PLT-04   | SRV-PLT-004 |
| CAP-PLT-006 | Platform Format Adaptation      | CAPGRP-002 | Core         | L1  | LYR-PLT-03   | SRV-PLT-005 |
| CAP-PLT-007 | Platform Compliance Validation  | CAPGRP-003 | Governance   | L1  | LYR-PLT-02   | SRV-PLT-007 |
| CAP-PLT-008 | Brand Compliance Check          | CAPGRP-003 | Governance   | L1  | LYR-PLT-02   | SRV-PLT-007 |
| CAP-PLT-009 | Audience Segmentation           | CAPGRP-004 | Shared       | L2  | LYR-PLT-03   | SRV-PLT-008 |
| CAP-PLT-010 | Targeted Content Distribution   | CAPGRP-004 | Shared       | L2  | LYR-PLT-04   | SRV-PLT-003 |
| CAP-PLT-011 | Performance Metrics Collection  | CAPGRP-005 | Analytics    | L1  | LYR-PLT-06   | SRV-PLT-009 |
| CAP-PLT-012 | Metrics Aggregation & Reporting | CAPGRP-005 | Analytics    | L2  | LYR-PLT-06   | SRV-PLT-010 |
| CAP-PLT-013 | Trend Detection & Analysis      | CAPGRP-005 | Intelligence | L2  | LYR-PLT-06   | SRV-PLT-011 |
| CAP-PLT-014 | Sentiment Analysis              | CAPGRP-005 | Intelligence | L2  | LYR-PLT-06   | SRV-PLT-012 |
| CAP-PLT-015 | Community Response Handling     | CAPGRP-006 | Support      | L1  | LYR-PLT-05   | SRV-PLT-013 |
| CAP-PLT-016 | Incident Detection & Escalation | CAPGRP-006 | Support      | L2  | LYR-PLT-05   | SRV-PLT-014 |
| CAP-PLT-017 | Platform State Monitoring       | CAPGRP-007 | Integration  | L1  | LYR-PLT-07   | SRV-PLT-015 |
| CAP-PLT-018 | Cross-Platform Synchronization  | CAPGRP-007 | Integration  | L2  | LYR-PLT-07   | SRV-PLT-016 |
| CAP-PLT-019 | Rate Limit Management           | CAPGRP-007 | Support      | L1  | LYR-PLT-04   | SRV-PLT-017 |
| CAP-PLT-020 | Service Authentication          | CAPGRP-007 | Shared       | L1  | LYR-PLT-04   | SRV-PLT-018 |

---

## ۸. Service Classification

### گروه‌های سرویسی

| شناسه      | گروه سرویس              | دسته                | سرویس‌های زیرمجموعه                                |
| ---------- | ----------------------- | ------------------- | -------------------------------------------------- |
| SRVGRP-001 | Publishing Services     | Business Service    | SRV-PLT-001, SRV-PLT-002, SRV-PLT-003              |
| SRVGRP-002 | Scheduling Services     | Application Service | SRV-PLT-004                                        |
| SRVGRP-003 | Adaptation Services     | Application Service | SRV-PLT-005, SRV-PLT-006                           |
| SRVGRP-004 | Compliance Services     | Governance          | SRV-PLT-007                                        |
| SRVGRP-005 | Analytics Services      | AI Service          | SRV-PLT-009, SRV-PLT-010, SRV-PLT-011, SRV-PLT-012 |
| SRVGRP-006 | Community Services      | Application Service | SRV-PLT-013, SRV-PLT-014                           |
| SRVGRP-007 | Orchestration Services  | Integration Service | SRV-PLT-015, SRV-PLT-016                           |
| SRVGRP-008 | Infrastructure Services | Shared Service      | SRV-PLT-017, SRV-PLT-018                           |

### کاتالوگ کامل سرویس‌ها

| شناسه       | سرویس                              | گروه       | دسته                | حالت  | Stateful | قابلیت‌های مرتبط         |
| ----------- | ---------------------------------- | ---------- | ------------------- | ----- | -------- | ------------------------ |
| SRV-PLT-001 | Content Publishing Service         | SRVGRP-001 | Business Service    | Async | No       | CAP-PLT-001              |
| SRV-PLT-002 | Batch Upload Service               | SRVGRP-001 | Business Service    | Batch | Yes      | CAP-PLT-002              |
| SRV-PLT-003 | Distribution Orchestration Service | SRVGRP-001 | Integration Service | Async | Yes      | CAP-PLT-003, CAP-PLT-010 |
| SRV-PLT-004 | Schedule Management Service        | SRVGRP-002 | Application Service | Sync  | Yes      | CAP-PLT-004, CAP-PLT-005 |
| SRV-PLT-005 | Format Transformation Service      | SRVGRP-003 | Application Service | Sync  | No       | CAP-PLT-006              |
| SRV-PLT-006 | Media Optimization Service         | SRVGRP-003 | Application Service | Sync  | No       | CAP-PLT-006              |
| SRV-PLT-007 | Compliance Checking Service        | SRVGRP-004 | Governance          | Sync  | No       | CAP-PLT-007, CAP-PLT-008 |
| SRV-PLT-008 | Audience Profile Service           | SRVGRP-002 | Knowledge Service   | Sync  | Yes      | CAP-PLT-009              |
| SRV-PLT-009 | Analytics Ingestion Service        | SRVGRP-005 | AI Service          | Async | Yes      | CAP-PLT-011              |
| SRV-PLT-010 | Metrics Computation Service        | SRVGRP-005 | AI Service          | Async | Yes      | CAP-PLT-012              |
| SRV-PLT-011 | Trend Analysis Service             | SRVGRP-005 | AI Service          | Async | No       | CAP-PLT-013              |
| SRV-PLT-012 | Sentiment Scoring Service          | SRVGRP-005 | AI Service          | Async | No       | CAP-PLT-014              |
| SRV-PLT-013 | Community Response Service         | SRVGRP-006 | Application Service | Sync  | No       | CAP-PLT-015              |
| SRV-PLT-014 | Incident Management Service        | SRVGRP-006 | Application Service | Async | Yes      | CAP-PLT-016              |
| SRV-PLT-015 | State Monitoring Service           | SRVGRP-007 | Integration Service | Async | Yes      | CAP-PLT-017              |
| SRV-PLT-016 | Synchronization Service            | SRVGRP-007 | Integration Service | Async | Yes      | CAP-PLT-018              |
| SRV-PLT-017 | Rate Limiting Service              | SRVGRP-008 | Shared Service      | Sync  | Yes      | CAP-PLT-019              |
| SRV-PLT-018 | Authentication Service             | SRVGRP-008 | Shared Service      | Sync  | No       | CAP-PLT-020              |

---

## ۹. Capability Lifecycle

### چرخه حیات قابلیت

| مرحله       | شناسه      | توضیح                        | خروجی               |
| ----------- | ---------- | ---------------------------- | ------------------- |
| Defined     | CAPLIFE-01 | قابلیت شناسایی و ثبت شده است | Capability Record   |
| Validated   | CAPLIFE-02 | قابلیت اعتبارسنجی شده است    | Validation Report   |
| Implemented | CAPLIFE-03 | سرویس مجری قابلیت فعال است   | Service Binding     |
| Active      | CAPLIFE-04 | قابلیت در حال مصرف است       | Consumption Metrics |
| Deprecated  | CAPLIFE-05 | قابلیت جایگزین شده است       | Migration Plan      |
| Retired     | CAPLIFE-06 | قابلیت حذف شده است           | Archive Record      |

### قواعد چرخه حیات

| ID    | قاعده                                               |
| ----- | --------------------------------------------------- |
| CL-01 | هر قابلیت باید حداقل یک مرحله Defined را طی کند     |
| CL-02 | انتقال به Active نیازمند Validated است              |
| CL-03 | انتقال به Deprecated نیازمند اطلاع مصرف‌کنندگان است |
| CL-04 | قابلیت Retired نباید مصرف‌کننده فعال داشته باشد     |
| CL-05 | تغییر در قابلیت Active نیازمند ADR است              |

---

## ۱۰. Service Lifecycle

### چرخه حیات سرویس

| مرحله          | شناسه      | توضیح                          | خروجی            |
| -------------- | ---------- | ------------------------------ | ---------------- |
| Designed       | SRVLIFE-01 | سرویس طراحی و ثبت شده است      | Service Spec     |
| Built          | SRVLIFE-02 | سرویس ساخته شده است            | Implementation   |
| Tested         | SRVLIFE-03 | سرویس تست شده است              | Test Report      |
| Deployed       | SRVLIFE-04 | سرویس در دسترس است             | Service Endpoint |
| Active         | SRVLIFE-05 | سرویس توسط Agentها مصرف می‌شود | Usage Metrics    |
| Deprecated     | SRVLIFE-06 | سرویس جایگزین شده است          | Migration Plan   |
| Decommissioned | SRVLIFE-07 | سرویس غیرفعال شده است          | Archive Record   |

### قواعد چرخه حیات سرویس

| ID     | قاعده                                                 |
| ------ | ----------------------------------------------------- |
| SCL-01 | هر سرویس باید حداقل به یک قابلیت مرتبط باشد           |
| SCL-02 | سرویس Deprecated باید مصرف‌کنندگان را اطلاع دهد       |
| SCL-03 | سرویس Decommissioned نباید مصرف‌کننده فعال داشته باشد |
| SCL-04 | تغییر در سرویس Active نیازمند ADR است                 |

---

## ۱۱. Capability Model

### مدل قابلیت

هر قابلیت پلتفرمی در KNW-302 دارای ساختار زیر است:

| مؤلفه       | نوع           | توضیح                         | الزامی |
| ----------- | ------------- | ----------------------------- | ------ |
| شناسه       | CAP-PLT-NNN   | شناسه یکتا در خانواده KNW-PLT | ✓      |
| نام         | String        | نام فارسی و انگلیسی           | ✓      |
| گروه        | CAPGRP-NNN    | گروه قابلیتی                  | ✓      |
| دسته        | CAPCAT-NN     | Core/Shared/Support/...       | ✓      |
| سطح         | CAPLVL-NN     | L1/L2/L3                      | ✓      |
| لایه        | LYR-PLT-NN    | لایه معماری از KNW-301        | ✓      |
| سرویس مرتبط | SRV-PLT-NNN   | سرویس مجری                    | ✓      |
| ورودی       | String[]      | ورودی‌های مورد نیاز           | —      |
| خروجی       | String[]      | خروجی‌های تولیدی              | —      |
| پیش‌نیاز    | CAP-PLT-NNN[] | قابلیت‌های پیش‌نیاز           | —      |
| خطا         | String[]      | خطاهای ممکن                   | —      |
| KPI         | KPI-302-NN    | شاخص عملکرد                   | ✓      |

---

## ۱۲. Service Model

### مدل سرویس

هر سرویس پلتفرمی در KNW-302 دارای ساختار زیر است:

| مؤلفه      | نوع           | توضیح                             | الزامی |
| ---------- | ------------- | --------------------------------- | ------ |
| شناسه      | SRV-PLT-NNN   | شناسه یکتا در خانواده KNW-PLT     | ✓      |
| نام        | String        | نام فارسی و انگلیسی               | ✓      |
| گروه       | SRVGRP-NNN    | گروه سرویسی                       | ✓      |
| دسته       | SRVCAT-NN     | Business/Application/Platform/... | ✓      |
| حالت       | SRVTYPE-NN    | Sync/Async/Batch/Streaming        | ✓      |
| Stateful   | Boolean       | آیا سرویس حالت‌پذیر است           | ✓      |
| قابلیت‌ها  | CAP-PLT-NNN[] | قابلیت‌های ارائه‌شده              | ✓      |
| ورودی      | Object        | ساختار ورودی                      | —      |
| خروجی      | Object        | ساختار خروجی                      | —      |
| خطاها      | String[]      | خطاهای ممکن                       | —      |
| وابستگی‌ها | SRV-PLT-NNN[] | سرویس‌های وابسته                  | —      |
| SLA        | String        | سطح سرویس مورد انتظار             | —      |

---

## ۱۳. Capability Dependency Model

### وابستگی‌های قابلیتی

قابلیت‌های پلتفرمی ممکن است به یکدیگر وابسته باشند. این وابستگی‌ها در مدل زیر تعریف می‌شوند.

| شناسه      | قابلیت مصرف‌کننده                         | قابلیت تأمین‌کننده                      | نوع وابستگی | توضیح                             |
| ---------- | ----------------------------------------- | --------------------------------------- | ----------- | --------------------------------- |
| CAPDEP-001 | CAP-PLT-003 (Multi-Platform Distribution) | CAP-PLT-001 (Single Content Publish)    | Requires    | توزیع نیازمند انتشار پایه است     |
| CAPDEP-002 | CAP-PLT-005 (Event-Triggered Scheduling)  | CAP-PLT-017 (Platform State Monitoring) | Requires    | رویداد نیازمند نظارت وضعیت است    |
| CAPDEP-003 | CAP-PLT-010 (Targeted Distribution)       | CAP-PLT-009 (Audience Segmentation)     | Requires    | توزیع هدفمند نیازمند بخش‌بندی است |
| CAPDEP-004 | CAP-PLT-012 (Metrics Aggregation)         | CAP-PLT-011 (Metrics Collection)        | Requires    | تجمیع نیازمند جمع‌آوری است        |
| CAPDEP-005 | CAP-PLT-013 (Trend Detection)             | CAP-PLT-012 (Metrics Aggregation)       | Requires    | روند نیازمند داده تجمیعی است      |
| CAPDEP-006 | CAP-PLT-014 (Sentiment Analysis)          | CAP-PLT-011 (Metrics Collection)        | Requires    | احساسات نیازمند داده است          |
| CAPDEP-007 | CAP-PLT-016 (Incident Detection)          | CAP-PLT-015 (Community Response)        | Requires    | حادثه نیازمند بستر پاسخ است       |
| CAPDEP-008 | CAP-PLT-018 (Cross-Platform Sync)         | CAP-PLT-017 (Platform State Monitoring) | Requires    | همگام‌سازی نیازمند نظارت است      |

---

## ۱۴. Service Dependency Model

### وابستگی‌های سرویسی

| شناسه      | سرویس مصرف‌کننده                         | سرویس تأمین‌کننده                 | نوع وابستگی | توضیح                                       |
| ---------- | ---------------------------------------- | --------------------------------- | ----------- | ------------------------------------------- |
| SRVDEP-001 | SRV-PLT-003 (Distribution Orchestration) | SRV-PLT-001 (Content Publishing)  | Calls       | ارکستراسیون سرویس انتشار را فراخوانی می‌کند |
| SRVDEP-002 | SRV-PLT-003 (Distribution Orchestration) | SRV-PLT-004 (Schedule Management) | Calls       | ارکستراسیون از زمان‌بندی استفاده می‌کند     |
| SRVDEP-003 | SRV-PLT-010 (Metrics Computation)        | SRV-PLT-009 (Analytics Ingestion) | Consumes    | محاسبه داده را از ورودی مصرف می‌کند         |
| SRVDEP-004 | SRV-PLT-011 (Trend Analysis)             | SRV-PLT-010 (Metrics Computation) | Consumes    | روند از داده محاسبه‌شده استفاده می‌کند      |
| SRVDEP-005 | SRV-PLT-016 (Synchronization)            | SRV-PLT-015 (State Monitoring)    | Calls       | همگام‌سازی وضعیت را مانیتور می‌کند          |
| SRVDEP-006 | SRV-PLT-001 (Content Publishing)         | SRV-PLT-017 (Rate Limiting)       | Uses        | انتشار از محدودیت نرخ استفاده می‌کند        |
| SRVDEP-007 | SRV-PLT-001 (Content Publishing)         | SRV-PLT-018 (Authentication)      | Uses        | انتشار از احراز هویت استفاده می‌کند         |

---

## ۱۵. Capability Ownership

### مالکیت قابلیت‌های پلتفرمی

| گروه قابلیتی | مالک (Owner)      | متولی (Steward) | مصرف‌کننده اصلی |
| ------------ | ----------------- | --------------- | --------------- |
| CAPGRP-001   | معمار پلتفرم      | مدیر انتشار     | AI-008          |
| CAPGRP-002   | معمار پلتفرم      | مدیر محتوا      | AI-003, AI-005  |
| CAPGRP-003   | افسر انطباق       | مدیر پلتفرم     | AI-004          |
| CAPGRP-004   | استراتژیست پلتفرم | مدیر مخاطب      | AI-001, AI-002  |
| CAPGRP-005   | مدیر تحلیل        | تحلیلگر داده    | AI-010, AI-012  |
| CAPGRP-006   | مدیر جامعه        | مدیر تعامل      | AI-009          |
| CAPGRP-007   | معمار سیستم       | مدیر عملیات     | AI-014          |

### قواعد مالکیت قابلیت

| ID      | قاعده                                             |
| ------- | ------------------------------------------------- |
| COWN-01 | هر گروه قابلیتی یک مالک مشخص دارد                 |
| COWN-02 | تغییر در قابلیت Core نیازمند ADR است              |
| COWN-03 | افزودن قابلیت جدید نیازمند تأیید معمار پلتفرم است |
| COWN-04 | همه تغییرات در Change Log ثبت می‌شوند             |

---

## ۱۶. Service Ownership

### مالکیت سرویس‌های پلتفرمی

| گروه سرویسی | مالک (Owner)     | متولی (Steward) | مصرف‌کننده اصلی |
| ----------- | ---------------- | --------------- | --------------- |
| SRVGRP-001  | مدیر انتشار      | مهندس پلتفرم    | AI-008, AUT-\*  |
| SRVGRP-002  | مدیر برنامه‌ریزی | مهندس پلتفرم    | AI-008          |
| SRVGRP-003  | مدیر محتوا       | مهندس محتوا     | AI-003          |
| SRVGRP-004  | افسر انطباق      | مهندس پلتفرم    | AI-004          |
| SRVGRP-005  | مدیر تحلیل       | مهندس داده      | AI-010          |
| SRVGRP-006  | مدیر جامعه       | مهندس تعامل     | AI-009          |
| SRVGRP-007  | معمار سیستم      | مهندس عملیات    | AI-014          |
| SRVGRP-008  | معمار امنیت      | مهندس زیرساخت   | AI-008, AI-014  |

### قواعد مالکیت سرویس

| ID      | قاعده                                 |
| ------- | ------------------------------------- |
| SOWN-01 | هر سرویس یک مالک مشخص دارد            |
| SOWN-02 | سرویس بدون مالک نباید Active باشد     |
| SOWN-03 | تغییر در سرویس Active نیازمند ADR است |

---

## ۱۷. Capability Governance

### حکمرانی قابلیت‌ها

| ID      | اصل                                | توضیح                                            |
| ------- | ---------------------------------- | ------------------------------------------------ |
| CGOV-01 | KNW-302 SSOT است                   | هیچ قابلیت پلتفرمی خارج از این سند تعریف نمی‌شود |
| CGOV-02 | بازبینی دوره‌ای                    | قابلیت‌ها با هر پلتفرم جدید بازبینی می‌شوند      |
| CGOV-03 | عدم تکرار                          | قابلیت‌ها نباید با یکدیگر همپوشانی داشته باشند   |
| CGOV-04 | انطباق با KNW-301                  | قابلیت‌ها تابع لایه‌ها و دامنه‌های KNW-301 هستند |
| CGOV-05 | قابلیت Core ممنوعیت تغییر بدون ADR | تغییر در CAPGRP-001 نیازمند ADR است              |

---

## ۱۸. Service Governance

### حکمرانی سرویس‌ها

| ID      | اصل                                       | توضیح                                           |
| ------- | ----------------------------------------- | ----------------------------------------------- |
| SGOV-01 | KNW-302 SSOT است                          | هیچ سرویس پلتفرمی خارج از این سند تعریف نمی‌شود |
| SGOV-02 | سرویس تابع قابلیت است                     | هر سرویس باید حداقل یک قابلیت را ارائه دهد      |
| SGOV-03 | سرویس بدون مصرف‌کننده نباید Active باشد   | مگر سرویس زیرساختی                              |
| SGOV-04 | همه سرویس‌ها باید SLA ثبت شده داشته باشند |                                                 |
| SGOV-05 | تغییر در سرویس Active نیازمند ADR است     |                                                 |

---

## ۱۹. Relationship to KNW-301

### رابطه KNW-302 با KNW-301

KNW-302 بر پایه KNW-301 ایجاد می‌شود و مفاهیم آن را تکمیل می‌کند.

### قواعد رابطه

| ID         | قاعده                                                               |
| ---------- | ------------------------------------------------------------------- |
| REF-301-01 | KNW-302 به KNW-301 به عنوان منبع مفاهیم بنیادین وابسته است          |
| REF-301-02 | قابلیت‌های CAP-PLT-_ به لایه‌های LYR-PLT-_ از KNW-301 ارجاع می‌دهند |
| REF-301-03 | KNW-302 هیچ مفهوم بنیادین پلتفرمی را بازتعریف نمی‌کند               |
| REF-301-04 | تغییر در KNW-301 ممکن است نیازمند بازبینی KNW-302 باشد              |

### نگاشت CAP-PLT به PLTCAP

| CAP-PLT                               | PLTCAP (KNW-301)       | توضیح                             |
| ------------------------------------- | ---------------------- | --------------------------------- |
| CAP-PLT-001, CAP-PLT-002              | PLTCAP-001             | انتشار محتوا — یک‌به‌چند          |
| CAP-PLT-003                           | PLTCAP-002             | توزیع چندپلتفرمی — یک‌به‌یک       |
| CAP-PLT-004, CAP-PLT-005              | PLTCAP-003             | زمان‌بندی — یک‌به‌چند             |
| CAP-PLT-006                           | PLTCAP-004             | تطبیق قالب — یک‌به‌یک             |
| CAP-PLT-007, CAP-PLT-008              | PLTCAP-005             | انطباق — یک‌به‌چند                |
| CAP-PLT-009, CAP-PLT-010              | PLTCAP-006             | مخاطب — یک‌به‌چند                 |
| CAP-PLT-011                           | PLTCAP-007             | جمع‌آوری — یک‌به‌یک               |
| CAP-PLT-015, CAP-PLT-016              | PLTCAP-008             | نظارت — یک‌به‌چند                 |
| CAP-PLT-012, CAP-PLT-013, CAP-PLT-014 | PLTCAP-009, PLTCAP-010 | هوش — چند‌به‌چند                  |
| CAP-PLT-017, CAP-PLT-018              | PLTCAP-011, PLTCAP-012 | مدیریت و هماهنگ‌سازی — چند‌به‌چند |

---

## ۲۰. Relationship to PLAT-\*

### رابطه KNW-302 با کتابچه‌های پلتفرم

PLAT-\*ها مشخصات یک پلتفرم خاص را تعریف می‌کنند و قابلیت‌ها و سرویس‌های KNW-302 را برای آن پلتفرم نمونه‌سازی می‌کنند.

### قواعد رابطه

| ID         | قاعده                                                          |
| ---------- | -------------------------------------------------------------- |
| PLT-REF-01 | هر PLAT-_ باید قابلیت‌های مصرفی خود را از CAP-PLT-_ انتخاب کند |
| PLT-REF-02 | هیچ PLAT-_ نباید قابلیتی خارج از CAP-PLT-_ تعریف کند           |
| PLT-REF-03 | PLAT-\* تنها مشخصات پیاده‌سازی قابلیت را اضافه می‌کند          |
| PLT-REF-04 | تغییر در CAP-PLT-* نیازمند بازبینی PLAT-*های مصرف‌کننده است    |

### نگاشت PLAT-\* به گروه‌های قابلیتی

| کتابچه               | گروه‌های قابلیتی مصرفی             |
| -------------------- | ---------------------------------- |
| PLAT-001 (Instagram) | CAPGRP-001..007                    |
| PLAT-002 (LinkedIn)  | CAPGRP-001..007                    |
| PLAT-003 (Telegram)  | CAPGRP-001, CAPGRP-003, CAPGRP-006 |
| PLAT-004 (X/Twitter) | CAPGRP-001, CAPGRP-003, CAPGRP-005 |
| PLAT-005 (YouTube)   | CAPGRP-001..007                    |
| PLAT-006 (Aparat)    | CAPGRP-001, CAPGRP-003             |
| PLAT-007 (Website)   | CAPGRP-001..007                    |

---

## ۲۱. Relationship to AI-\*

### رابطه KNW-302 با Agentها

Agentها سرویس‌های پلتفرمی را برای انجام وظایف خود مصرف می‌کنند.

### قواعد رابطه

| ID        | قاعده                                                                     |
| --------- | ------------------------------------------------------------------------- |
| AI-REF-01 | هر Agent که سرویس پلتفرمی مصرف می‌کند باید سرویس را در SRV-PLT-\* ثبت کند |
| AI-REF-02 | Agentها قابلیت‌ها را از طریق سرویس‌ها مصرف می‌کنند                        |
| AI-REF-03 | یک Agent می‌تواند چند سرویس را مصرف کند                                   |
| AI-REF-04 | Agent جدید نیازمند بررسی نگاشت قابلیتی با KNW-302 است                     |

### نگاشت Agent به سرویس‌ها

| Agent                        | سرویس‌های مصرفی                                                              |
| ---------------------------- | ---------------------------------------------------------------------------- |
| AI-001 (Content Strategy)    | SRV-PLT-008 (Audience Profile)                                               |
| AI-002 (Content Planning)    | SRV-PLT-004 (Schedule Management), SRV-PLT-008 (Audience Profile)            |
| AI-003 (Content Production)  | SRV-PLT-005 (Format Transformation), SRV-PLT-006 (Media Optimization)        |
| AI-004 (Content Review)      | SRV-PLT-007 (Compliance Checking)                                            |
| AI-005 (Search Optimization) | SRV-PLT-005 (Format Transformation)                                          |
| AI-008 (Publishing)          | SRV-PLT-001, SRV-PLT-002, SRV-PLT-003, SRV-PLT-004, SRV-PLT-017, SRV-PLT-018 |
| AI-009 (Community)           | SRV-PLT-013 (Community Response), SRV-PLT-014 (Incident Management)          |
| AI-010 (Analytics)           | SRV-PLT-009, SRV-PLT-010, SRV-PLT-011, SRV-PLT-012                           |
| AI-012 (Improvement)         | SRV-PLT-011 (Trend Analysis), SRV-PLT-012 (Sentiment Scoring)                |
| AI-014 (Orchestrator)        | SRV-PLT-003, SRV-PLT-015, SRV-PLT-016                                        |

---

## ۲۲. Relationship to AUT-\*

### رابطه KNW-302 با Workflowهای خودکار

Workflowها سرویس‌ها را برای اجرای فرآیندهای خودکار پلتفرمی orchestrate می‌کنند.

### قواعد رابطه

| ID         | قاعده                                                                    |
| ---------- | ------------------------------------------------------------------------ |
| AUT-REF-01 | هر Workflow پلتفرمی باید سرویس‌های مصرفی خود را از SRV-PLT-\* انتخاب کند |
| AUT-REF-02 | Workflow می‌تواند چند سرویس را به صورت زنجیره‌ای orchestrate کند         |
| AUT-REF-03 | خطاهای Workflow باید با خطاهای سرویس مطابقت داشته باشند                  |

### نگاشت AUT-\* به سرویس‌ها

| Workflow             | سرویس‌های مصرفی                                                 |
| -------------------- | --------------------------------------------------------------- |
| Publishing Chain     | SRV-PLT-001, SRV-PLT-003, SRV-PLT-004, SRV-PLT-017, SRV-PLT-018 |
| Content Adaptation   | SRV-PLT-005, SRV-PLT-006                                        |
| Compliance Check     | SRV-PLT-007                                                     |
| Analytics Collection | SRV-PLT-009, SRV-PLT-010                                        |
| Incident Response    | SRV-PLT-013, SRV-PLT-014                                        |
| Cross-Platform Sync  | SRV-PLT-015, SRV-PLT-016                                        |

---

## ۲۳. Validation Rules

| ID    | قانون                                           | سطح     | نقض   |
| ----- | ----------------------------------------------- | ------- | ----- |
| VR-01 | هر قابلیت دارای شناسه یکتا CAP-PLT-NNN است      | معماری  | خطا   |
| VR-02 | هر سرویس دارای شناسه یکتا SRV-PLT-NNN است       | معماری  | خطا   |
| VR-03 | هر قابلیت به یک گروه قابلیتی (CAPGRP) تعلق دارد | معماری  | خطا   |
| VR-04 | هر سرویس به یک گروه سرویسی (SRVGRP) تعلق دارد   | معماری  | خطا   |
| VR-05 | هر قابلیت به یک لایه از KNW-301 مرتبط است       | معماری  | خطا   |
| VR-06 | هر سرویس حداقل یک قابلیت را ارائه می‌دهد        | معماری  | خطا   |
| VR-07 | وابستگی‌های قابلیتی غیرچرخه‌ای هستند            | معماری  | خطا   |
| VR-08 | وابستگی‌های سرویسی غیرچرخه‌ای هستند             | معماری  | خطا   |
| VR-09 | هیچ دو قابلیتی همپوشانی مسئولیتی ندارند         | محتوایی | هشدار |
| VR-10 | هر قابلیت Core حداقل یک مصرف‌کننده Agent دارد   | معماری  | خطا   |
| VR-11 | نام قابلیت با ARCH-003 همخوانی دارد             | محتوایی | خطا   |
| VR-12 | هر سرویس Active دارای SLA ثبت شده است           | معماری  | هشدار |

---

## ۲۴. Quality Gates

| گیت   | مکان              | معیار                                                  | مسئول        |
| ----- | ----------------- | ------------------------------------------------------ | ------------ |
| QG-01 | Draft → Review    | هویت کامل، ۳۰ بخش، همه CAP-PLT* و SRV-PLT* ثبت شده‌اند | خودکار       |
| QG-02 | Review → Approved | اعتبارسنجی با KNW-301 و عدم تناقض                      | معمار دانش   |
| QG-03 | Approved → Active | ثبت در KNW-001 و نگاشت به PLAT-\*                      | متولی دانش   |
| QG-04 | Active → Updated  | هماهنگی با KNW-301 جدید                                | معمار پلتفرم |

---

## ۲۵. Knowledge Producers

### تولیدکنندگان KNW-302

| تولیدکننده   | نوع تولید           | نقش        |
| ------------ | ------------------- | ---------- |
| معمار دانش   | ایجاد + ویرایش      | مالک       |
| متولی دانش   | ویرایش + نگهداری    | متولی      |
| معمار پلتفرم | پیشنهاد قابلیت جدید | مصرف‌کننده |
| مدیر پلتفرم  | پیشنهاد سرویس جدید  | مصرف‌کننده |

---

## ۲۶. Knowledge Consumers

### مصرف‌کنندگان KNW-302

| مصرف‌کننده                    | نوع مصرف               | سطح دسترسی |
| ----------------------------- | ---------------------- | ---------- |
| AI-001 (Content Strategy)     | پرس‌وجو قابلیت         | A-3        |
| AI-002 (Content Planning)     | پرس‌وجو قابلیت + سرویس | A-2        |
| AI-003 (Content Production)   | پرس‌وجو سرویس          | A-2        |
| AI-004 (Content Review)       | پرس‌وجو سرویس          | A-3        |
| AI-005 (Search Optimization)  | پرس‌وجو سرویس          | A-3        |
| AI-008 (Publishing)           | پرس‌وجو + اجرای سرویس  | A-3        |
| AI-009 (Community)            | پرس‌وجو سرویس          | A-2        |
| AI-010 (Analytics)            | پرس‌وجو سرویس          | A-3        |
| AI-011 (Knowledge Management) | همه                    | A-4        |
| AI-012 (Improvement)          | پرس‌وجو سرویس          | A-3        |
| AI-014 (Orchestrator)         | پرس‌وجو + ارکستراسیون  | A-4        |
| Human (Platform Architect)    | مطالعه + مرجع          | A-4        |

---

## ۲۷. Machine Readable Blocks

### Block 1 — Capability Identity

```json
{
  "id": "KNW-302",
  "name_fa": "معماری قابلیت‌ها و سرویس‌های پلتفرم",
  "name_en": "Enterprise Platform Capability & Service Architecture",
  "version": "1.0.0-draft",
  "family": "KNW-PLT",
  "domain": "DOM-PLT-002",
  "type": "Platform Capability Knowledge",
  "status": "draft",
  "ssot": true,
  "total_capabilities": 20,
  "total_services": 18,
  "total_capability_groups": 7,
  "total_service_groups": 8,
  "total_capability_dependencies": 8,
  "total_service_dependencies": 7,
  "dependencies": ["KNW-301", "KNW-000", "KNW-001", "KNW-101", "PLAT-000"]
}
```

### Block 2 — Capability Catalog

```json
{
  "capabilities": [
    {
      "id": "CAP-PLT-001",
      "name": "Single Content Publish",
      "group": "CAPGRP-001",
      "category": "Core",
      "level": "L1",
      "layer": "LYR-PLT-04",
      "service": "SRV-PLT-001",
      "consumers": ["AI-008"]
    },
    {
      "id": "CAP-PLT-002",
      "name": "Batch Content Publish",
      "group": "CAPGRP-001",
      "category": "Core",
      "level": "L2",
      "layer": "LYR-PLT-04",
      "service": "SRV-PLT-002",
      "consumers": ["AI-008"]
    },
    {
      "id": "CAP-PLT-003",
      "name": "Multi-Platform Distribution",
      "group": "CAPGRP-001",
      "category": "Core",
      "level": "L2",
      "layer": "LYR-PLT-04",
      "service": "SRV-PLT-003",
      "consumers": ["AI-008"]
    },
    {
      "id": "CAP-PLT-004",
      "name": "Time-Based Scheduling",
      "group": "CAPGRP-002",
      "category": "Core",
      "level": "L1",
      "layer": "LYR-PLT-04",
      "service": "SRV-PLT-004",
      "consumers": ["AI-008"]
    },
    {
      "id": "CAP-PLT-005",
      "name": "Event-Triggered Scheduling",
      "group": "CAPGRP-002",
      "category": "Core",
      "level": "L2",
      "layer": "LYR-PLT-04",
      "service": "SRV-PLT-004",
      "consumers": ["AI-008"]
    },
    {
      "id": "CAP-PLT-006",
      "name": "Platform Format Adaptation",
      "group": "CAPGRP-002",
      "category": "Core",
      "level": "L1",
      "layer": "LYR-PLT-03",
      "service": "SRV-PLT-005",
      "consumers": ["AI-003"]
    },
    {
      "id": "CAP-PLT-007",
      "name": "Platform Compliance Validation",
      "group": "CAPGRP-003",
      "category": "Governance",
      "level": "L1",
      "layer": "LYR-PLT-02",
      "service": "SRV-PLT-007",
      "consumers": ["AI-004"]
    },
    {
      "id": "CAP-PLT-008",
      "name": "Brand Compliance Check",
      "group": "CAPGRP-003",
      "category": "Governance",
      "level": "L1",
      "layer": "LYR-PLT-02",
      "service": "SRV-PLT-007",
      "consumers": ["AI-004"]
    },
    {
      "id": "CAP-PLT-009",
      "name": "Audience Segmentation",
      "group": "CAPGRP-004",
      "category": "Shared",
      "level": "L2",
      "layer": "LYR-PLT-03",
      "service": "SRV-PLT-008",
      "consumers": ["AI-001", "AI-002"]
    },
    {
      "id": "CAP-PLT-010",
      "name": "Targeted Content Distribution",
      "group": "CAPGRP-004",
      "category": "Shared",
      "level": "L2",
      "layer": "LYR-PLT-04",
      "service": "SRV-PLT-003",
      "consumers": ["AI-008"]
    },
    {
      "id": "CAP-PLT-011",
      "name": "Performance Metrics Collection",
      "group": "CAPGRP-005",
      "category": "Analytics",
      "level": "L1",
      "layer": "LYR-PLT-06",
      "service": "SRV-PLT-009",
      "consumers": ["AI-010"]
    },
    {
      "id": "CAP-PLT-012",
      "name": "Metrics Aggregation & Reporting",
      "group": "CAPGRP-005",
      "category": "Analytics",
      "level": "L2",
      "layer": "LYR-PLT-06",
      "service": "SRV-PLT-010",
      "consumers": ["AI-010"]
    },
    {
      "id": "CAP-PLT-013",
      "name": "Trend Detection & Analysis",
      "group": "CAPGRP-005",
      "category": "Intelligence",
      "level": "L2",
      "layer": "LYR-PLT-06",
      "service": "SRV-PLT-011",
      "consumers": ["AI-010", "AI-012"]
    },
    {
      "id": "CAP-PLT-014",
      "name": "Sentiment Analysis",
      "group": "CAPGRP-005",
      "category": "Intelligence",
      "level": "L2",
      "layer": "LYR-PLT-06",
      "service": "SRV-PLT-012",
      "consumers": ["AI-010", "AI-012"]
    },
    {
      "id": "CAP-PLT-015",
      "name": "Community Response Handling",
      "group": "CAPGRP-006",
      "category": "Support",
      "level": "L1",
      "layer": "LYR-PLT-05",
      "service": "SRV-PLT-013",
      "consumers": ["AI-009"]
    },
    {
      "id": "CAP-PLT-016",
      "name": "Incident Detection & Escalation",
      "group": "CAPGRP-006",
      "category": "Support",
      "level": "L2",
      "layer": "LYR-PLT-05",
      "service": "SRV-PLT-014",
      "consumers": ["AI-009"]
    },
    {
      "id": "CAP-PLT-017",
      "name": "Platform State Monitoring",
      "group": "CAPGRP-007",
      "category": "Integration",
      "level": "L1",
      "layer": "LYR-PLT-07",
      "service": "SRV-PLT-015",
      "consumers": ["AI-014"]
    },
    {
      "id": "CAP-PLT-018",
      "name": "Cross-Platform Synchronization",
      "group": "CAPGRP-007",
      "category": "Integration",
      "level": "L2",
      "layer": "LYR-PLT-07",
      "service": "SRV-PLT-016",
      "consumers": ["AI-014"]
    },
    {
      "id": "CAP-PLT-019",
      "name": "Rate Limit Management",
      "group": "CAPGRP-007",
      "category": "Support",
      "level": "L1",
      "layer": "LYR-PLT-04",
      "service": "SRV-PLT-017",
      "consumers": ["AI-008"]
    },
    {
      "id": "CAP-PLT-020",
      "name": "Service Authentication",
      "group": "CAPGRP-007",
      "category": "Shared",
      "level": "L1",
      "layer": "LYR-PLT-04",
      "service": "SRV-PLT-018",
      "consumers": ["AI-008", "AI-014"]
    }
  ]
}
```

### Block 3 — Service Catalog

```json
{
  "services": [
    {
      "id": "SRV-PLT-001",
      "name": "Content Publishing Service",
      "group": "SRVGRP-001",
      "category": "Business Service",
      "mode": "async",
      "stateful": false,
      "capabilities": ["CAP-PLT-001"]
    },
    {
      "id": "SRV-PLT-002",
      "name": "Batch Upload Service",
      "group": "SRVGRP-001",
      "category": "Business Service",
      "mode": "batch",
      "stateful": true,
      "capabilities": ["CAP-PLT-002"]
    },
    {
      "id": "SRV-PLT-003",
      "name": "Distribution Orchestration Service",
      "group": "SRVGRP-001",
      "category": "Integration Service",
      "mode": "async",
      "stateful": true,
      "capabilities": ["CAP-PLT-003", "CAP-PLT-010"]
    },
    {
      "id": "SRV-PLT-004",
      "name": "Schedule Management Service",
      "group": "SRVGRP-002",
      "category": "Application Service",
      "mode": "sync",
      "stateful": true,
      "capabilities": ["CAP-PLT-004", "CAP-PLT-005"]
    },
    {
      "id": "SRV-PLT-005",
      "name": "Format Transformation Service",
      "group": "SRVGRP-003",
      "category": "Application Service",
      "mode": "sync",
      "stateful": false,
      "capabilities": ["CAP-PLT-006"]
    },
    {
      "id": "SRV-PLT-006",
      "name": "Media Optimization Service",
      "group": "SRVGRP-003",
      "category": "Application Service",
      "mode": "sync",
      "stateful": false,
      "capabilities": ["CAP-PLT-006"]
    },
    {
      "id": "SRV-PLT-007",
      "name": "Compliance Checking Service",
      "group": "SRVGRP-004",
      "category": "Governance",
      "mode": "sync",
      "stateful": false,
      "capabilities": ["CAP-PLT-007", "CAP-PLT-008"]
    },
    {
      "id": "SRV-PLT-008",
      "name": "Audience Profile Service",
      "group": "SRVGRP-002",
      "category": "Knowledge Service",
      "mode": "sync",
      "stateful": true,
      "capabilities": ["CAP-PLT-009"]
    },
    {
      "id": "SRV-PLT-009",
      "name": "Analytics Ingestion Service",
      "group": "SRVGRP-005",
      "category": "AI Service",
      "mode": "async",
      "stateful": true,
      "capabilities": ["CAP-PLT-011"]
    },
    {
      "id": "SRV-PLT-010",
      "name": "Metrics Computation Service",
      "group": "SRVGRP-005",
      "category": "AI Service",
      "mode": "async",
      "stateful": true,
      "capabilities": ["CAP-PLT-012"]
    },
    {
      "id": "SRV-PLT-011",
      "name": "Trend Analysis Service",
      "group": "SRVGRP-005",
      "category": "AI Service",
      "mode": "async",
      "stateful": false,
      "capabilities": ["CAP-PLT-013"]
    },
    {
      "id": "SRV-PLT-012",
      "name": "Sentiment Scoring Service",
      "group": "SRVGRP-005",
      "category": "AI Service",
      "mode": "async",
      "stateful": false,
      "capabilities": ["CAP-PLT-014"]
    },
    {
      "id": "SRV-PLT-013",
      "name": "Community Response Service",
      "group": "SRVGRP-006",
      "category": "Application Service",
      "mode": "sync",
      "stateful": false,
      "capabilities": ["CAP-PLT-015"]
    },
    {
      "id": "SRV-PLT-014",
      "name": "Incident Management Service",
      "group": "SRVGRP-006",
      "category": "Application Service",
      "mode": "async",
      "stateful": true,
      "capabilities": ["CAP-PLT-016"]
    },
    {
      "id": "SRV-PLT-015",
      "name": "State Monitoring Service",
      "group": "SRVGRP-007",
      "category": "Integration Service",
      "mode": "async",
      "stateful": true,
      "capabilities": ["CAP-PLT-017"]
    },
    {
      "id": "SRV-PLT-016",
      "name": "Synchronization Service",
      "group": "SRVGRP-007",
      "category": "Integration Service",
      "mode": "async",
      "stateful": true,
      "capabilities": ["CAP-PLT-018"]
    },
    {
      "id": "SRV-PLT-017",
      "name": "Rate Limiting Service",
      "group": "SRVGRP-008",
      "category": "Shared Service",
      "mode": "sync",
      "stateful": true,
      "capabilities": ["CAP-PLT-019"]
    },
    {
      "id": "SRV-PLT-018",
      "name": "Authentication Service",
      "group": "SRVGRP-008",
      "category": "Shared Service",
      "mode": "sync",
      "stateful": false,
      "capabilities": ["CAP-PLT-020"]
    }
  ]
}
```

### Block 4 — Capability Relationships

```json
{
  "capability_relationships": [
    {
      "id": "CAPREL-001",
      "source": "CAP-PLT-003",
      "target": "CAP-PLT-001",
      "type": "requires",
      "description": "Multi-Platform Distribution requires Single Content Publish"
    },
    {
      "id": "CAPREL-002",
      "source": "CAP-PLT-005",
      "target": "CAP-PLT-017",
      "type": "requires",
      "description": "Event-Triggered Scheduling requires Platform State Monitoring"
    },
    {
      "id": "CAPREL-003",
      "source": "CAP-PLT-010",
      "target": "CAP-PLT-009",
      "type": "requires",
      "description": "Targeted Distribution requires Audience Segmentation"
    },
    {
      "id": "CAPREL-004",
      "source": "CAP-PLT-012",
      "target": "CAP-PLT-011",
      "type": "requires",
      "description": "Metrics Aggregation requires Metrics Collection"
    },
    {
      "id": "CAPREL-005",
      "source": "CAP-PLT-013",
      "target": "CAP-PLT-012",
      "type": "requires",
      "description": "Trend Detection requires Metrics Aggregation"
    },
    {
      "id": "CAPREL-006",
      "source": "CAP-PLT-014",
      "target": "CAP-PLT-011",
      "type": "requires",
      "description": "Sentiment Analysis requires Metrics Collection"
    },
    {
      "id": "CAPREL-007",
      "source": "CAP-PLT-016",
      "target": "CAP-PLT-015",
      "type": "requires",
      "description": "Incident Detection requires Community Response"
    },
    {
      "id": "CAPREL-008",
      "source": "CAP-PLT-018",
      "target": "CAP-PLT-017",
      "type": "requires",
      "description": "Cross-Platform Sync requires Platform State Monitoring"
    }
  ]
}
```

### Block 5 — Service Relationships

```json
{
  "service_relationships": [
    {
      "id": "SRVREL-001",
      "source": "SRV-PLT-003",
      "target": "SRV-PLT-001",
      "type": "calls",
      "description": "Distribution Orchestration calls Content Publishing"
    },
    {
      "id": "SRVREL-002",
      "source": "SRV-PLT-003",
      "target": "SRV-PLT-004",
      "type": "calls",
      "description": "Distribution Orchestration calls Schedule Management"
    },
    {
      "id": "SRVREL-003",
      "source": "SRV-PLT-010",
      "target": "SRV-PLT-009",
      "type": "consumes",
      "description": "Metrics Computation consumes Analytics Ingestion data"
    },
    {
      "id": "SRVREL-004",
      "source": "SRV-PLT-011",
      "target": "SRV-PLT-010",
      "type": "consumes",
      "description": "Trend Analysis consumes Metrics Computation data"
    },
    {
      "id": "SRVREL-005",
      "source": "SRV-PLT-016",
      "target": "SRV-PLT-015",
      "type": "calls",
      "description": "Synchronization calls State Monitoring"
    },
    {
      "id": "SRVREL-006",
      "source": "SRV-PLT-001",
      "target": "SRV-PLT-017",
      "type": "uses",
      "description": "Content Publishing uses Rate Limiting"
    },
    {
      "id": "SRVREL-007",
      "source": "SRV-PLT-001",
      "target": "SRV-PLT-018",
      "type": "uses",
      "description": "Content Publishing uses Authentication"
    }
  ]
}
```

### Block 6 — Capability KPIs

```json
{
  "kpis": [
    {
      "id": "KPI-302-01",
      "name": "capability_coverage",
      "description": "پوشش قابلیت‌های تعریف‌شده در برابر نیازمندی‌های پلتفرم",
      "target": "20/20",
      "measurement": "quarterly"
    },
    {
      "id": "KPI-302-02",
      "name": "service_capability_alignment",
      "description": "هم‌راستایی سرویس‌ها با قابلیت‌ها",
      "target": "100%",
      "measurement": "quarterly"
    },
    {
      "id": "KPI-302-03",
      "name": "capability_group_completeness",
      "description": "تکمیل گروه‌های قابلیتی",
      "target": "7/7",
      "measurement": "quarterly"
    },
    {
      "id": "KPI-302-04",
      "name": "service_group_completeness",
      "description": "تکمیل گروه‌های سرویسی",
      "target": "8/8",
      "measurement": "quarterly"
    },
    {
      "id": "KPI-302-05",
      "name": "capability_agent_mapping",
      "description": "نگاشت قابلیت به Agent مصرف‌کننده",
      "target": "≥ 90%",
      "measurement": "monthly"
    },
    {
      "id": "KPI-302-06",
      "name": "dependency_acyclic",
      "description": "عدم وجود وابستگی چرخه‌ای",
      "target": "0 cycles",
      "measurement": "quarterly"
    }
  ]
}
```

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Platform Capability

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:platform:capability:detailed:v1",
  "title": "Platform Capability (Detailed)",
  "description": "Schema for SMOS Platform Capability definitions in KNW-302",
  "type": "object",
  "required": ["id", "name", "group", "category", "level", "layer", "service"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^CAP-PLT-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "group": {
      "type": "string",
      "pattern": "^CAPGRP-[0-9]{3}$"
    },
    "category": {
      "type": "string",
      "enum": [
        "Core",
        "Shared",
        "Support",
        "Integration",
        "Governance",
        "Analytics",
        "Intelligence"
      ]
    },
    "level": {
      "type": "string",
      "enum": ["L1", "L2", "L3"]
    },
    "layer": {
      "type": "string",
      "pattern": "^LYR-PLT-[0-9]{2}$"
    },
    "service": {
      "type": "string",
      "pattern": "^SRV-PLT-[0-9]{3}$"
    },
    "consumers": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^AI-[0-9]{3}$"
      },
      "minItems": 1
    },
    "description": {
      "type": "string",
      "maxLength": 500
    }
  },
  "additionalProperties": false
}
```

### Schema 2 — Platform Service

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:platform:service:detailed:v1",
  "title": "Platform Service (Detailed)",
  "description": "Schema for SMOS Platform Service definitions in KNW-302",
  "type": "object",
  "required": ["id", "name", "group", "category", "mode", "stateful", "capabilities"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^SRV-PLT-[0-9]{3}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "group": {
      "type": "string",
      "pattern": "^SRVGRP-[0-9]{3}$"
    },
    "category": {
      "type": "string",
      "enum": [
        "Business Service",
        "Application Service",
        "Platform Service",
        "Integration Service",
        "Knowledge Service",
        "Automation Service",
        "AI Service",
        "Shared Service"
      ]
    },
    "mode": {
      "type": "string",
      "enum": ["sync", "async", "batch", "streaming"]
    },
    "stateful": {
      "type": "boolean"
    },
    "capabilities": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^CAP-PLT-[0-9]{3}$"
      },
      "minItems": 1
    },
    "description": {
      "type": "string",
      "maxLength": 500
    }
  },
  "additionalProperties": false
}
```

### Schema 3 — Capability Relationship

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:platform:capability-relationship:v1",
  "title": "Capability Relationship",
  "description": "Schema for relationships between SMOS Platform Capabilities",
  "type": "object",
  "required": ["id", "source", "target", "type"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^CAPREL-[0-9]{3}$"
    },
    "source": {
      "type": "string",
      "pattern": "^CAP-PLT-[0-9]{3}$"
    },
    "target": {
      "type": "string",
      "pattern": "^CAP-PLT-[0-9]{3}$"
    },
    "type": {
      "type": "string",
      "enum": ["requires", "enhances", "conflicts", "replaces", "delegates"]
    },
    "description": {
      "type": "string",
      "maxLength": 300
    }
  },
  "additionalProperties": false
}
```

---

## ۲۹. KPIs — شاخص‌های کلیدی عملکرد

| KPI                        | شناسه      | هدف    | بازه   | مسئول        |
| -------------------------- | ---------- | ------ | ------ | ------------ |
| پوشش قابلیت‌ها             | KPI-302-01 | ۲۰/۲۰  | فصلی   | متولی دانش   |
| هم‌راستایی سرویس با قابلیت | KPI-302-02 | ۱۰۰٪   | فصلی   | معمار دانش   |
| تکمیل گروه قابلیتی         | KPI-302-03 | ۷/۷    | فصلی   | معمار پلتفرم |
| تکمیل گروه سرویسی          | KPI-302-04 | ۸/۸    | فصلی   | معمار پلتفرم |
| نگاشت قابلیت به Agent      | KPI-302-05 | ≥ ۹۰٪  | ماهانه | متولی دانش   |
| عدم وابستگی چرخه‌ای        | KPI-302-06 | ۰ چرخه | فصلی   | معمار دانش   |

---

## ۳۰. Change Log

| نسخه        | تاریخ      | تغییر                                                                                                                                                                                                                                                                                                                                          | توسط        |
| ----------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-29 | نگارش اولیه — معماری قابلیت‌ها و سرویس‌های پلتفرم سازمانی. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema, ۲۰ قابلیت (CAP-PLT-001..020), ۱۸ سرویس (SRV-PLT-001..018), ۷ گروه قابلیتی (CAPGRP-001..007), ۸ گروه سرویسی (SRVGRP-001..008), ۸ وابستگی قابلیتی (CAPDEP-001..008), ۷ وابستگی سرویسی (SRVDEP-001..007). SSOT قابلیت‌ها و سرویس‌های پلتفرم SMOS. | معمار سیستم |
