# موتور قیود — Constraint Engine

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Constraint Architecture — معماری قیود

Constraints are boundary conditions on engineering parameters that validate proposed values and conclusions.

| فیلد | نوع | توضیح |
|------|-----|-------|
| `constraint_id` | UUID | شناسه یکتای قید |
| `parameter` | String | پارامتر مهندسی تحت قید |
| `condition` | Expression | شرط مرزی (min, max, range, pattern) |
| `violation_severity` | Enum | warning, error, critical |
| `source` | String | منبع قید (استاندارد، مقرره) |
| `domain` | String | دامنه مهندسی |

---

## Constraint Categories — دسته‌بندی قیود

### 1. Voltage Limits — محدودیت‌های ولتاژ

| قید | مقدار | منبع | شدت |
|-----|-------|------|-----|
| Nominal voltage LV distribution | 230/400V ±10% | IEC 60038 | error |
| Maximum cable voltage drop | 5% of nominal | IEC 60364-5-52 | error |
| Maximum voltage drop (lighting) | 3% of nominal | IEC 60364-5-52 | error |
| Touch voltage limit (HV) | 520V | Tavanir regulations | critical |
| Step voltage limit | 500V (no gravel), 825V (with gravel) | IEEE 80 | critical |

### 2. Current Limits — محدودیت‌های جریان

| قید | مقدار | منبع | شدت |
|-----|-------|------|-----|
| Cable current rating | ≥ 1.25 × nominal load current | IEC 60364 | error |
| Busbar short-circuit withstand | ≥ calculated fault current | IEC 61439 | critical |
| Transformer rated current | ≥ nameplate continuous rating | IEC 60076 | error |
| Overload capacity (transformer) | ≤ 1.5 × rated for 30 min | IEC 60076 | warning |

### 3. Thermal Limits — محدودیت‌های حرارتی

| قید | مقدار | منبع | شدت |
|-----|-------|------|-----|
| Transformer top oil temperature | max 95°C | IEC 60076 | critical |
| Cable conductor temperature (XLPE) | max 90°C | IEC 60502 | critical |
| Cable conductor temperature (PVC) | max 70°C | IEC 60502 | critical |
| Switchgear internal temperature | max 55°C (rise above ambient) | IEC 61439 | error |
| Motor winding temperature (Class F) | max 155°C | IEC 60034 | critical |

### 4. Short Circuit Limits — محدودیت‌های اتصال کوتاه

| قید | مقدار | منبع | شدت |
|-----|-------|------|-----|
| Breaking capacity | ≥ calculated short-circuit current | IEC 60909 | critical |
| Making capacity | ≥ peak short-circuit current | IEC 60909 | critical |
| Cable thermal capacity | ≥ I²t let-through | IEC 60364 | critical |
| Busbar short-time withstand | ≥ fault current × fault duration | IEC 61439 | critical |

### 5. Protection Limits — محدودیت‌های حفاظتی

| قید | مقدار | منبع | شدت |
|-----|-------|------|-----|
| Protection pickup | ≤ 1.2 × nominal current | IEEE 242 | error |
| Protection coordination margin | ≥ 0.3s | IEEE 242 | warning |
| Earth fault pickup | ≤ 0.2 × nominal current | IEEE C37.91 | error |
| Instantaneous setting | ≥ 1.6 × starting current (motor) | IEEE C37.91 | error |

### 6. Regulatory Limits (Iran) — محدودیت‌های نظارتی (ایران)

| قید | مقدار | منبع | شدت |
|-----|-------|------|-----|
| Residential maximum demand | مطابق جدول تعرفه Tavanir | Tavanir tariff | error |
| Power factor penalty threshold | < 0.9 | Tavanir regulation | warning |
| Harmonic distortion limit (THD) | ≤ 8% for LV | Tavanir power quality code | error |
| Flicker severity (Pst) | ≤ 1.0 | Tavanir power quality code | warning |

### 7. Safety Limits — محدودیت‌های ایمنی

| قید | مقدار | منبع | شدت |
|-----|-------|------|-----|
| Minimum clearance for 20kV (indoors) | 0.5m | IEC 61936 | critical |
| Minimum clearance for 20kV (outdoors) | 1.0m | IEC 61936 | critical |
| Maximum earth resistance (HV substation) | 1Ω | IEEE 80 | critical |
| Maximum earth resistance (LV substation) | 10Ω | IEC 60364 | error |
| Guarding height (indoor substation) | ≥ 2.5m | IEC 61936 | critical |

### 8. Jurisdiction Constraints — قیود حوزه قضایی

| حوزه | رفتار | شرح |
|------|--------|------|
| Iran (Tavanir) | استفاده از محدودیت‌های Tavanir به عنوان پیش‌فرض | انحرافات ملی از IEC در اولویت |
| EU (EN) | استفاده از محدودیت‌های EN | EN 50522, EN 61936 |
| IEC Default | استفاده از استانداردهای IEC در صورت عدم تطابق حوزه | بازگشت به مقدار پیش‌فرض IEC |

---

## Validation Workflow — گردش کار اعتبارسنجی

| مرحله | شرح | خروجی |
|-------|------|-------|
| ۱ | جمع‌آوری همه قیود مرتبط با دامنه و حوزه قضایی | مجموعه قیود فعال |
| ۲ | برای هر مقدار یا نتیجه پیشنهادی، بررسی تمام قیود قابل اعمال | نتایج اعتبارسنجی |
| ۳ | PASS — مقدار در محدوده مجاز | ادامه فرآیند |
| ۴ | WARNING — مقدار نزدیک به حد مجاز (در فاصله ۵٪) | پرچم‌گذاری برای بازبینی |
| ۵ | FAIL — مقدار بیش از حد مجاز | مسدود شدن نتیجه، پیشنهاد جایگزین |
| ۶ | CRITICAL — نقض قید ایمنی | اسکالیشن فوری |

---

## Constraint Priority — اولویت قیود

| اولویت | دسته | رفتار |
|--------|------|-------|
| ۱ (بالاترین) | Safety Limits | نقض = اسکالیشن فوری |
| ۲ | Regulatory Limits | نقض = مسدود شدن نتیجه |
| ۳ | Standards Limits | نقض = خطا با امکان override مستند |
| ۴ | Design Best Practice | نقض = هشدار |

در اولویت یکسان، محدودکننده‌ترین (کمترین) حد اعمال می‌شود.

---

## Constraint Resolution — حل قیود

### Override Mechanism — مکانیسم نادیده‌گیری

| شرط | رفتار |
|-----|-------|
| Safety limit violation | override غیرمجاز — نیاز به تأیید انسانی |
| Regulatory limit violation | override با مستندسازی دلیل و مجوز مقام صالح |
| Standards limit violation | override با دلیل فنی مستند و تأیید مهندسی |
| Design practice violation | override خودکار با توضیح |

### Multi-Jurisdiction — چندحوزه‌ای

| سناریو | رفتار |
|--------|-------|
| پروژه در ایران | اعمال قیود Tavanir به عنوان پیش‌فرض + IEC به عنوان مکمل |
| پروژه در اتحادیه اروپا | اعمال قیود EN + IEC |
| حوزه نامشخص | اعمال قیود IEC به عنوان پیش‌فرض جهانی + اعلام نیاز به تعیین حوزه |

---

## Constraint Traceability — رهگیری قیود

| مؤلفه | توضیح |
|-------|-------|
| Validation Log | شناسه قید، پارامتر، مقدار پیشنهادی، حد مجاز، نتیجه، زمان |
| Override Log | شناسه قید، دلیل override، مجازکننده، زمان |
| Source Reference | استاندارد، بند، صفحه دقیق |
| Citation | خروجی AI باید مشخص کند از کدام قیود استفاده کرده است |

### Validation Log Entry — ورودی لاگ اعتبارسنجی

| فیلد | مثال |
|------|------|
| `constraint_id` | CNS-IEC-60364-5-52-0017 |
| `parameter` | cable_voltage_drop |
| `proposed_value` | 6.2% |
| `limit_value` | 5% |
| `result` | FAIL |
| `severity` | error |
| `timestamp` | 2026-06-20T14:30:00Z |
