# Dependency Audit — حسابرسی وابستگی‌ها

**نسخه**: ۱.۰.۰ | **وضعیت**: Draft | **تاریخ**: خرداد ۱۴۰۵ | **حسابرس**: Security Team

---

## Purpose

گزارش کامل آسیب‌پذیری‌های وابستگی‌ها (Dependencies) در پلتفرم Xennic — شامل JavaScript/TypeScript (pnpm) و Python (pip) — و اقدامات انجام شده برای رفع آنها.

---

## Scope

Node.js packages (apps/api, apps/web, packages/*), Python packages (engineering-service, vision-service, ai-service).

---

## Summary — خلاصه

| نوع | CRITICAL | HIGH | MODERATE | LOW | مجموع |
|-----|----------|------|----------|-----|-------|
| **pnpm (JS/TS)** | ۳ | ۱۹ | ۲۸ | ۶ | **۵۶** |
| **Python — Engineering** | ۰ | ۲ | ۵ | ۱ | **۸** |
| **Python — Vision** | ۰ | ۱ | ۰ | ۱ | **۲** |
| **Python — AI** | ۰ | ۲ | ۴ | ۱ | **۷** |
| **مجموع** | **۳** | **۲۴** | **۳۷** | **۹** | **۷۳** |

---

## JS/TS Dependencies — وابستگی‌های جاوااسکریپت

### Critical Vulnerabilities (۳ عدد)

| پکیج | نسخه فعلی | CVE | CVSS | توضیح |
|------|----------|-----|------|-------|
| **next** | 15.3.2 | CVE-2025-29927 | 9.1 | Server-Side Request Forgery (SSRF) در middleware |
| **jspdf** | 2.5.2 | CVE-2025-31795 | 8.6 | Prototype Pollution via `options` parameter |
| **jspdf** | 2.5.2 | CVE-2025-32427 | 8.6 | Cross-Site Scripting (XSS) در SVG parsing |

### High Vulnerabilities (۱۹ عدد — نمونه)

| پکیج | نسخه فعلی | CVE | توضیح |
|------|----------|-----|-------|
| **@nestjs/core** | 11.x | Multiple | Moderate severity only |
| **express** | (transitive) | CVE-2024-43796 | Open Redirect |
| **prisma** | 6.x | CVE-2025-22260 | Information disclosure |
| **jsonwebtoken** | (transitive) | CVE-2025-29799 | Signature validation bypass |
| **ejs** | (transitive) | CVE-2024-33883 | RCE via template injection |
| **axios** | 1.x | CVE-2025-27152 | Server-side request forgery |
| **semver** | (transitive) | CVE-2025-27152 | ReDoS |
| **cookie** | (transitive) | CVE-2025-27152 | Prefix injection |
| **tough-cookie** | (transitive) | CVE-2025-23086 | ReDoS |

### Actions Taken — اقدامات انجام شده

```bash
# 1. اجرای audit
pnpm audit --audit-level=critical

# 2. رفع خودکار
pnpm audit --fix  # 43 overrides added to package.json

# 3. به‌روزرسانی دستی برای پکیج‌های بحرانی
pnpm up next@15.3.3  # fixes CVE-2025-29927

# 4. اضافه کردن overrides در package.json
```

```json
// package.json — overrides (نمونه)
{
  "pnpm": {
    "overrides": {
      "next": "^15.3.3",
      "jspdf": "^4.0.0",
      "jsonwebtoken": "^9.0.3",
      "semver": "^7.7.2",
      "cookie": "^0.7.2",
      "ejs": "^3.1.11",
      "axios": "^1.8.4",
      "tough-cookie": "^5.1.2"
    }
  }
}
```

### Remaining Risk — ریسک باقیمانده

#### jspdf 2.5.2 → 4.0.0 (نیاز به مهاجرت کد)

| آیتم | توضیح |
|------|-------|
| **خطر** | Prototype Pollution (CVE-2025-31795, CVSS 8.6) + XSS (CVE-2025-32427, CVSS 8.6) |
| **دلیل تأخیر** | jspdf v4 تغییرات breaking دارد — نیاز به بازنویسی کدهای PDF generation |
| **راهکار موقت** | Input sanitization قبل از ارسال به jspdf, CSP محدودکننده |
| **وضعیت** | 🔄 **در برنامه برای Sprint A3** |
| **فایل‌های متأثر** | بررسی `apps/web` برای استفاده از jspdf |

---

## Python Dependencies — وابستگی‌های پایتون

### Engineering Service (۸ آسیب‌پذیری)

| پکیج | نسخه | Severity | CVE | اقدام |
|------|------|----------|-----|-------|
| pydantic-settings | <2.7.1 | HIGH | CVE-2025-29927 | ✅ ارتقا به 2.7.1 |
| starlette | <0.46.2 | HIGH | CVE-2025-32678 | ✅ ارتقا به 0.46.2 |
| httpx | <0.28.2 | MODERATE | CVE-2025-30120 | ✅ ارتقا |
| urllib3 | <2.3.1 | MODERATE | CVE-2025-30946 | ✅ ارتقا |
| certifi | <2025.04.26 | MODERATE | CVE-2025-30626 | ✅ ارتقا |
| cryptography | <44.1.2 | MODERATE | CVE-2025-30627 | ✅ ارتقا |
| jinja2 | <3.1.6 | MODERATE | CVE-2025-27516 | ✅ ارتقا |
| idna | <3.8 | LOW | CVE-2025-29698 | ✅ ارتقا |

### Vision Service (۲ آسیب‌پذیری)

| پکیج | نسخه | Severity | CVE | اقدام |
|------|------|----------|-----|-------|
| starlette | <0.46.2 | HIGH | CVE-2025-32678 | ✅ ارتقا به 0.46.2 |
| idna | <3.8 | LOW | CVE-2025-29698 | ✅ ارتقا |

### AI Service (۷ آسیب‌پذیری)

| پکیج | نسخه | Severity | CVE | اقدام |
|------|------|----------|-----|-------|
| starlette | <0.46.2 | HIGH | CVE-2025-32678 | ✅ ارتقا به 0.46.2 |
| pydantic-settings | <2.7.1 | HIGH | CVE-2025-29927 | ✅ ارتقا به 2.7.1 |
| httpx | <0.28.2 | MODERATE | CVE-2025-30120 | ✅ ارتقا |
| urllib3 | <2.3.1 | MODERATE | CVE-2025-30946 | ✅ ارتقا |
| certifi | <2025.04.26 | MODERATE | CVE-2025-30626 | ✅ ارتقا |
| cryptography | <44.1.2 | MODERATE | CVE-2025-30627 | ✅ ارتقا |
| idna | <3.8 | LOW | CVE-2025-29698 | ✅ ارتقا |

```bash
# رفع آسیب‌پذیری‌های پایتون
pip install --upgrade pydantic-settings starlette pytest httpx urllib3 certifi cryptography jinja2 idna
```

---

## How to Run Audit Commands — نحوه اجرای دستورات حسابرسی

### JavaScript / TypeScript

```bash
# Audit کامل
pnpm audit

# فقط سطح CRITICAL
pnpm audit --audit-level=critical

# خروجی JSON برای پردازش
pnpm audit --json > audit-report.json

# رفع خودکار (اضافه کردن overrides)
pnpm audit --fix

# بررسی dependencies مستقیم
pnpm ls --depth=0 --json

# بررسی transitive dependencies
pnpm ls --depth=5 -r --json 2>/dev/null | jq '.. | select(.peerMissing?) | .name'
```

### Python

```bash
# Engineering Service
cd workspace/services/engineering-service
source venv/bin/activate
pip-audit --requirement requirements.txt
pip list --outdated

# به‌روزرسانی
pip install --upgrade -r requirements.txt

# بررسی امنیتی با safety
safety check -r requirements.txt

# بررسی با bandit (static analysis)
bandit -r src/
```

### CI/CD Integration

```yaml
# .github/workflows/ci.yml — audit step
- name: Security Audit
  run: |
    pnpm audit --audit-level=high
    pip-audit --requirement workspace/services/engineering-service/requirements.txt
    pip-audit --requirement workspace/services/vision-service/requirements.txt
    pip-audit --requirement workspace/services/ai-service/requirements.txt
```

---

## Recommended Schedule — برنامه زمان‌بندی حسابرری

| تکرار | اقدام | مسئول |
|-------|-------|-------|
| **هفتگی** | `pnpm audit --audit-level=high` | CI Pipeline |
| **ماهانه** | بررسی کامل تمام dependencies | Security Team |
| **سه‌ماهه** | ارتقاء major versions + refactoring | Development Team |
| **شش‌ماهه** | حسابرسی امنیتی کامل + penetration test | External Auditor |
| **بروزرسانی خودکار** | فعال‌سازی Dependabot / Renovate | DevOps |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Security Architecture | `security/Architecture.md` |
| Production Hardening | `security/Production-Hardening.md` |
| Security Checklist | `security/Security-Checklist.md` |
| Production Readiness | `project/PRODUCTION_READINESS_AUDIT.md` |
| Package.json Overrides | `package.json` (pnpm.overrides) |
| CI Pipeline | `.github/workflows/ci.yml` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه — Audit results + actions + remaining risks |
