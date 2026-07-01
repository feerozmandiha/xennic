# فرمول‌ها — Formulas

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

فرمول‌های محاسباتی مهندسی برق پلتفرم Xennic.

---

## Scope

تمامی فرمول‌های پیاده‌سازی شده.

---

## Basic Electrical

| کد | نام | فرمول |
|----|------|--------|
| BASIC-001 | Ohm's Law | V = I × R |
| BASIC-002 | Active Power (1Φ) | P = V × I × PF |
| BASIC-002 | Active Power (3Φ) | P = √3 × V × I × PF |
| BASIC-003 | Apparent Power (1Φ) | S = V × I |
| BASIC-003 | Apparent Power (3Φ) | S = √3 × V × I |
| BASIC-004 | Reactive Power | Q = √(S² - P²) |
| BASIC-005 | Power Factor | PF = P / S |

## Cable

| کد | فرمول |
|----|--------|
| CABLE-001 | Ampacity per IEC 60287 tables |
| CABLE-002 | ΔV = (√3 × I × L × (Rcosθ + Xsinθ)) / 1000 |
| CABLE-003 | A_min = (I_sc × √t) / K |
| CABLE-004 | A_pe = A_phase × k (per IEC 60364) |

## Transformer

| کد | فرمول |
|----|--------|
| TRF-001 | S = √3 × V × I / 1000 |
| TRF-002 | η = P_out / (P_out + P_core + P_copper) |
| TRF-003 | Regulation = (V_no_load - V_full_load) / V_full_load |

## Protection

| کد | فرمول |
|----|--------|
| PROT-001 | I_set = I_n × 1.05 (thermal) |
| PROT-002 | I_mag = I_n × 10-14 (magnetic) |
| PROT-006 | E = 1.15 × V × I_sc × 0.2 / (D²) (Arc Flash) |

---

## Formula Governance

| قانون | توضیح |
|-------|--------|
| Version | هر فرمول دارای نسخه است |
| Standard | هر فرمول به استاندارد مرجع متصل است |
| Validation | ورودی قبل از محاسبه اعتبارسنجی می‌شود |
| Audit | تمام محاسبات ذخیره و قابل حسابرسی هستند |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Calculation Engine | `engineering/CALCULATION_ENGINE.md` |
| Validation Rules | `engineering/VALIDATION_RULES.md` |
| Calculator Catalog | `engineering/XENNIC_CALCULATION_CATALOG_v1.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
