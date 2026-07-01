# موتور قواعد — Rule Engine

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Rule Architecture — معماری قواعد

Rules are IF-THEN statements extracted from standards, regulations, and best practices. Rules are stored as structured objects in the knowledge base.

| فیلد | نوع | توضیح |
|------|-----|-------|
| `rule_id` | UUID | شناسه یکتای قاعده |
| `premise` | Condition[] | شروط IF — شرایط فعال‌سازی قاعده |
| `conclusion` | Action[] | اقدامات THEN — نتایج اجرای قاعده |
| `source_tier` | Integer (1-5) | تایر منبع بر اساس سلسله‌مراتب K1.7 |
| `domain` | String | دامنه مهندسی (e.g., protection, cable, earthing) |
| `version` | SemVer | نسخه معنایی قاعده |
| `status` | Enum | active, deprecated, superseded, draft |

---

## Rule Categories — دسته‌بندی قواعد

### 1. Standards Rules — قواعد استانداردها

قواعد مستخرج از استانداردهای IEC، IEEE، ISO.

| مثال | شرط (IF) | نتیجه (THEN) | منبع |
|------|----------|-------------|------|
| Cable derating | cable_type = PVC AND ambient_temp > 40°C | apply derating factor 0.87 | IEC 60364-5-52 |
| Voltage drop limit | circuit_length > 100m | max voltage drop ≤ 5% | IEC 60364-5-52 |
| Transformer cooling | transformer_power > 2MVA | cooling_type = forced_oil | IEC 60076 |

### 2. Regulatory Rules — قواعد نظارتی

قواعد مستخرج از مقررات ملی.

| مثال | شرط (IF) | نتیجه (THEN) | منبع |
|------|----------|-------------|------|
| Voltage level | customer_type = industrial AND contracted_capacity > 1MW | voltage_level = 20kV | Tavanir distribution regulations |
| Metering type | connected_load > 100kW | metering_type = CT_VT | Tavanir metering code |
| Tariff assignment | usage = agricultural | tariff_code = AGRI-01 | Tavanir tariff schedule |

### 3. Protection Rules — قواعد حفاظتی

قواعد مستخرج از مهندسی حفاظت.

| مثال | شرط (IF) | نتیجه (THEN) | منبع |
|------|----------|-------------|------|
| Protective device | feeder_type = main_incoming | protection_type = overcurrent_and_earth_fault | IEEE C37.91 |
| Differential protection | transformer_power > 5MVA | recommended_protection = differential | IEEE C37.91 |
| Relay coordination | relay_type = overcurrent | coordination_margin ≥ 0.3s | IEEE 242 |

### 4. Safety Rules — قواعد ایمنی

قواعد مستخرج از استانداردهای ایمنی.

| مثال | شرط (IF) | نتیجه (THEN) | منبع |
|------|----------|-------------|------|
| Working distance | nominal_voltage > 1000V | minimum_working_distance = 3m | IEEE 80, IEC 61936 |
| Clearance distance | voltage_level = 20kV | minimum_clearance = 0.5m | IEC 61936 |
| Earth resistance | substation_type = HV | max_earth_resistance = 1Ω | IEEE 80 |

### 5. Design Rules — قواعد طراحی

قواعد مستخرج از بهترین شیوه‌های مهندسی.

| مثال | شرط (IF) | نتیجه (THEN) | منبع |
|------|----------|-------------|------|
| Motor starting | motor_power > 200kW | starting_method = soft_starter OR VSD | Industry best practice (Tier 5) |
| Cable sizing | cable_routing = underground | apply derating factor 0.85 | Industry best practice (Tier 5) |
| Transformer loading | load_type = mixed | max_loading = 80% | Industry best practice (Tier 5) |

### 6. Operational Rules — قواعد عملیاتی

قواعد مستخرج از دستورالعمل‌های بهره‌برداری.

| مثال | شرط (IF) | نتیجه (THEN) | منبع |
|------|----------|-------------|------|
| Power factor | load_factor < 0.3 | recommend_power_factor_correction = TRUE | Energy management practice |
| Load shedding | system_frequency < 49.5Hz | shed_load = 10% | Grid operation code |
| Maintenance interval | equipment_type = transformer AND age > 20 years | maintenance_frequency = 6_months | Maintenance best practice |

---

## Rule Execution — اجرای قواعد

### Inference Method — روش استنتاج

| مرحله | شرح |
|-------|------|
| 1 | جمع‌آوری حقایق شناخته‌شده از ورودی و پایگاه دانش |
| 2 | تطبیق مقدمه (premise) تمام قواعد با حقایق موجود |
| 3 | فعال‌سازی قواعدی که مقدمه آنها با حقایق منطبق است |
| 4 | اجرای نتیجه (conclusion) قواعد فعال‌شده به ترتیب اولویت |
| 5 | افزودن نتایج جدید به مجموعه حقایق برای استنتاج زنجیره‌ای |

### Rule Priority — اولویت قواعد

| تایر | اولویت | مثال منابع |
|------|--------|-----------|
| Tier 1 | ۱ (بالاترین) | IEC, IEEE standards |
| Tier 2 | ۲ | ISO, ANSI standards |
| Tier 3 | ۳ | National regulations (Tavanir, etc.) |
| Tier 4 | ۴ | Industry guidelines |
| Tier 5 | ۵ (پایین‌ترین) | Best practices, experience-based |

### Conflict Handling — مدیریت تعارض

| سناریو | رفتار |
|--------|-------|
| دو قاعده با نتایج یکسان | هر دو اجرا می‌شوند (نتیجه یکسان) |
| دو قاعده با نتایج متضاد | قاعده با تایر بالاتر (عدد کمتر) برنده است |
| نتایج متضاد با تایر مساوی | هیچکدام اجرا نمی‌شود — نیاز به بازبانی انسانی |
| عدم تطابق هیچ قاعده | هیچ اقدامی انجام نمی‌شود (خطا نیست) |

---

## Rule Versioning — نسخه‌بندی قواعد

| مؤلفه | شرح |
|-------|------|
| نسخه قاعده | MAJOR.MINOR — تغییرات اساسی (MAJOR) و جزئی (MINOR) |
| تغییرات عمده | MAJOR: تغییر در منطق شرط یا نتیجه، حذف قاعده |
| تغییرات جزئی | MINOR: به‌روزرسانی منبع، ویرایش توضیحات |
| backward compatibility | قواعد قدیمی تا پایان دوره گذار باقی می‌مانند |
| تاریخچه | تمام نسخه‌های قبلی برای حسابرسی قابل دسترسی هستند |

---

## Rule Traceability — رهگیری قواعد

| مؤلفه | توضیح |
|-------|-------|
| Execution Log | شناسه قاعده، مقادیر مقدمه، نتیجه اجرا، زمان اجرا |
| Source Reference | استاندارد، بند، صفحه دقیق برای هر قاعده |
| Audit Trail | چه کسی یا چه عاملی قاعده را ایجاد/ویرایش کرده است |
| AI Citation | خروجی AI باید مشخص کند از کدام قواعد استفاده کرده است |

### Execution Log Entry — ورودی لاگ اجرا

| فیلد | مثال |
|------|------|
| `rule_id` | RULE-IEC-60364-5-52-0042 |
| `premise_values` | `{cable_type: "PVC", ambient_temp: 45}` |
| `conclusion_applied` | `{derating_factor: 0.87}` |
| `timestamp` | 2026-06-20T14:30:00Z |
| `rule_version` | 1.2.0 |

---

## Rules Lifecycle — چرخه حیات قواعد

| وضعیت | شرح | گذار مجاز |
|-------|------|-----------|
| Draft | پیش‌نویس اولیه | → Active, Archived |
| Active | فعال و قابل استفاده در استنتاج | → Deprecated, Superseded |
| Deprecated | منسوخ‌شده اما هنوز موجود برای backward compatibility | → Superseded, Archived |
| Superseded | جایگزین‌شده با نسخه جدیدتر | → Archived |
| Archived | بایگانی‌شده و غیرقابل استفاده | — |
