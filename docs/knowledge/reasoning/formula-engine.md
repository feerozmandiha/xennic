# موتور فرمول‌ها — Formula Engine

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Formula Architecture — معماری فرمول‌ها

Formulas are structured mathematical expressions with defined inputs and outputs, stored in a registry for execution and validation.

| فیلد | نوع | توضیح |
|------|-----|-------|
| `formula_id` | UUID | شناسه یکتای فرمول |
| `name` | String | نام فرمول |
| `expression` | Expression | عبارت ریاضی ساختاریافته |
| `input_parameters` | Parameter[] | پارامترهای ورودی با نوع و واحد |
| `output_parameters` | Parameter[] | پارامترهای خروجی با نوع و واحد |
| `units` | String[] | واحدهای ورودی/خروجی |
| `source_reference` | String | ارجاع به استاندارد و بند |
| `domain` | String | دامنه مهندسی |
| `version` | SemVer | نسخه فرمول |

---

## Formula Registry — ثبت فرمول‌ها

### Power Systems — سیستم‌های قدرت

| فرمول | عبارت | پارامترها | منبع |
|-------|-------|-----------|------|
| Short circuit current | Ik = c × Un / (√3 × Zk) | Un, Zk, c → Ik | IEC 60909 |
| Voltage drop | ΔV = I × L × (R cosφ + X sinφ) | I, L, R, X, cosφ → ΔV | IEC 60364 |
| Transformer regulation | ε = (Pk × cosφ + Qk × sinφ) / Sr | Pk, Qk, Sr, cosφ → ε | IEC 60076 |
| Symmetrical components | I1 = (Ia + a × Ib + a² × Ic) / 3 | Ia, Ib, Ic → I1, I2, I0 | IEC 60909 |
| Fault level | Ssc = √3 × Un × Ik | Un, Ik → Ssc | IEC 60909 |

### Cable Sizing — سایزینگ کابل

| فرمول | عبارت | پارامترها | منبع |
|-------|-------|-----------|------|
| Current rating | Iz = I × k1 × k2 × k3 × k4 | I, k1..k4 → Iz | IEC 60364 |
| Voltage drop (3-phase) | ΔV = √3 × I × L × (R cosφ + X sinφ) / 1000 | I, L, R, X, cosφ → ΔV | IEC 60364 |
| Short circuit thermal | S = √(I²t) / k | I, t, k → S | IEC 60364-5-54 |
| Earth fault loop impedance | Zs = Ze + R1 + R2 | Ze, R1, R2 → Zs | IEC 60364 |
| Cable resistance at temp | Rt = R20 × (1 + α × (T − 20)) | R20, α, T → Rt | IEC 60228 |

### Protection — حفاظت

| فرمول | عبارت | پارامترها | منبع |
|-------|-------|-----------|------|
| Overcurrent pickup | Ip = Iload × 1.25 | Iload → Ip | IEEE 242 |
| Transformer differential | Idiff = |Iprimary × ratio − Isecondary| | Iprimary, Isecondary, ratio → Idiff | IEEE C37.91 |
| CT saturation voltage | Vs = K × Isec × (Rct + 2 × Rlead) | K, Isec, Rct, Rlead → Vs | IEC 61869 |
| Arc flash energy | E = 4.184 × Cf × En × (t / 0.2) × (610 / D) | Cf, En, t, D → E | IEEE 1584 |
| Protection grading margin | Δt = toperating_upstream − toperating_downstream | toperating_upstream, toperating_downstream → Δt | IEEE 242 |

### Earthing — ارتینگ

| فرمول | عبارت | پارامترها | منبع |
|-------|-------|-----------|------|
| Earth resistance (single rod) | R = ρ / (2πL) × ln(4L / d) | ρ, L, d → R | IEEE 80 |
| Earth resistance (plate) | R = ρ / (4 × √(A/π)) | ρ, A → R | IEEE 80 |
| Step voltage | Vstep = ρ × Is × Ks / L | ρ, Is, Ks, L → Vstep | IEEE 80 |
| Touch voltage | Vtouch = ρ × Is × Km / L | ρ, Is, Km, L → Vtouch | IEEE 80 |
| Grid resistance | Rg = ρ × (1/Lt + 1/√(20×A)) | ρ, Lt, A → Rg | IEEE 80 |

### Power Quality — کیفیت قدرت

| فرمول | عبارت | پارامترها | منبع |
|-------|-------|-----------|------|
| THD | THD = √(ΣVh²) / V1 × 100% | Vh[] , V1 → THD | IEEE 519 |
| Power factor correction | Qc = P × (tan φ1 − tan φ2) | P, cosφ1, cosφ2 → Qc | IEEE 519 |
| Voltage unbalance | Vunbal = (Vmax − Vmin) / Vavg × 100% | Va, Vb, Vc → Vunbal | IEC 61000 |
| Flicker (Pst) | Pst = √(0.0314 × P0.1 + 0.0525 × P1 + …) | P0.1, P1, P3, P10, P50 → Pst | IEC 61000-4-15 |
| Crest factor | CF = Vpeak / Vrms | Vpeak, Vrms → CF | IEEE 519 |

---

## Formula Execution — اجرای فرمول‌ها

| مرحله | شرح | ورودی | خروجی |
|-------|------|-------|-------|
| ۱ | Resolve | شناسه فرمول | فرمول کامل از registry |
| ۲ | Validate Inputs | پارامترهای ورودی | تأیید نوع، محدوده، واحد |
| ۳ | Normalize | پارامترها | تبدیل به واحد SI |
| ۴ | Execute | پارامترهای نرمال‌شده | نتیجه خام |
| ۵ | Validate Output | نتیجه خام | بررسی محدوده و معقولیت |
| ۶ | Normalize Output | نتیجه تأییدشده | تبدیل به واحد درخواستی |
| ۷ | Return | نتیجه نهایی | مقدار + metadata |

### Input Validation — اعتبارسنجی ورودی

| نوع بررسی | توضیح | مثال |
|-----------|-------|------|
| Type check | تطابق نوع داده پارامتر | voltage باید float باشد |
| Range check | مقدار در محدوده فیزیکی معقول | voltage = 20kV (نه 20V برای پست) |
| Unit check | واحد قابل تشخیص و تبدیل | "kV", "A", "mm²" |
| Required check | پارامترهای اجباری حضور دارند | همه ورودی‌های غیر nullable |

### Output Validation — اعتبارسنجی خروجی

| نوع بررسی | توضیح |
|-----------|-------|
| Range check | خروجی در محدوده فیزیکی معقول |
| Plausibility check | مقایسه با مقادیر شناخته‌شده از پروژه‌های مشابه |
| Historical validation | مقایسه با محاسبات قبلی در شرایط مشابه |

---

## Formula Dependencies — وابستگی‌های فرمول

### Dependency Graph — گراف وابستگی

فرمول‌ها می‌توانند به فرمول‌های دیگر وابسته باشند (DAG).

| سناریو | رفتار |
|--------|-------|
| وابستگی ساده | فرمول وابسته ابتدا اجرا می‌شود |
| زنجیره وابستگی | مرتب‌سازی توپولوژیک، اجرای ترتیبی |
| وابستگی چرخه‌ای | شناسایی و خطا — اجازه اجرا داده نمی‌شود |

### Resolution Strategy — استراتژی تفکیک

| مرحله | شرح |
|-------|------|
| ۱ | شناسایی تمام وابستگی‌های مستقیم و غیرمستقیم |
| ۲ | ساخت گراف وابستگی |
| ۳ | تشخیص چرخه (circular dependency) |
| ۴ | مرتب‌سازی توپولوژیک |
| ۵ | اجرای فرمول‌ها به ترتیب وابستگی |

---

## Formula Versioning — نسخه‌بندی فرمول‌ها

| مؤلفه | شرح |
|-------|------|
| Schema version | نسخه ساختار موتور فرمول (برای تغییرات در فرمت فرمول‌ها) |
| Formula version | نسخه خود فرمول — تغییر با ویرایش استاندارد مرجع |
| Standard update | انتشار ویرایش جدید IEC → نسخه جدید فرمول، نسخه قدیمی preserved |
| Backward compatibility | فرمول‌های قدیمی برای پروژه‌های موجود قابل دسترسی |

---

## Formula Traceability — رهگیری فرمول‌ها

| مؤلفه | توضیح |
|-------|-------|
| Execution Log | شناسه فرمول، مقادیر ورودی، خروجی، نسخه، زمان |
| Source Reference | استاندارد، بند، شماره معادله |
| AI Citation | "محاسبه شده بر اساس IEC 60909:2001 §4.2" |

### Execution Log Entry — ورودی لاگ اجرا

| فیلد | مثال |
|------|------|
| `formula_id` | FML-IEC-60909-0042 |
| `formula_name` | Short circuit current (Ik) |
| `inputs` | `{Un: 20000, Zk: 1.2, c: 1.05}` |
| `output` | `{Ik: 10103.8}` |
| `units` | `{Ik: "A"}` |
| `formula_version` | 2.1.0 |
| `execution_time_ms` | 15 |
| `timestamp` | 2026-06-20T14:30:00Z |

---

## Formula Environment — محیط فرمول

### Supported Operations — عملیات پشتیبانی‌شده

| دسته | عملیات |
|------|--------|
| Arithmetic | +, −, ×, /, ^, √, ³√ |
| Trigonometric | sin, cos, tan, arcsin, arccos, arctan |
| Logarithmic | ln, log, log₂ |
| Complex | magnitude, angle, real, imag |
| Vector | dot, cross, norm, angle_between |
| Unit conversion | خودکار بین واحدهای هم‌خانواده (kV ↔ V, MVA ↔ kVA) |
| Constants | π, e, √3, c (speed of light), μ₀, ε₀ |

### Plausibility Ranges — محدوده‌های معقولیت

| پارامتر | محدوده معقول | واحد |
|---------|-------------|------|
| voltage (LV) | 100 – 1000 | V |
| voltage (MV) | 1 – 72.5 | kV |
| voltage (HV) | 72.5 – 800 | kV |
| cable size | 1.5 – 1000 | mm² |
| transformer | 0.1 – 1000 | MVA |
| fault current | 0.1 – 100 | kA |
| resistance | 0.001 – 10000 | Ω |
