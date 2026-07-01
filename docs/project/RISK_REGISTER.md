# ثبت ریسک — Risk Register

**نسخه**: ۱.۰.۰ | **وضعیت**: Active | **آخرین بروزرسانی**: خرداد ۱۴۰۵ | **بازبینی بعدی**: ماهانه

---

## Risk Definitions

| سطح | Impact | Probability |
|-----|--------|-------------|
| 🟢 Low | Minimal disruption | < 20% |
| 🟡 Medium | Moderate impact | 20-50% |
| 🟠 High | Significant impact | 50-70% |
| 🔴 Critical | Business-threatening | > 70% |

---

## Risk Register

### R-001: Test Coverage Deficit
| فیلد | مقدار |
|------|-------|
| **Risk** | تست کافی نیست → رگرسیون در production |
| **Impact** | 🔴 Critical |
| **Probability** | 🟠 High (70%) |
| **Mitigation** | افزایش coverage به ۷۰٪ در v1.1 |
| **Owner** | Backend Team |
| **Status** | 🟠 Mitigating |
| **Review Date** | ۱۴۰۵/۰۴ |

### R-002: Database Migration Instability
| فیلد | مقدار |
|------|-------|
| **Risk** | `prisma db push` → data loss در production |
| **Impact** | 🔴 Critical |
| **Probability** | 🟡 Medium (40%) |
| **Mitigation** | مهاجرت به `prisma migrate` در v1.1 |
| **Owner** | Backend Team |
| **Status** | 🟠 Mitigating |
| **Review Date** | ۱۴۰۵/۰۴ |

### R-003: Manual Deployment Error
| فیلد | مقدار |
|------|-------|
| **Risk** | استقرار دستی → خطای انسانی |
| **Impact** | 🟠 High |
| **Probability** | 🟡 Medium (50%) |
| **Mitigation** | GitHub Actions CI/CD |
| **Owner** | DevOps Team |
| **Status** | 🟠 Mitigating |
| **Review Date** | ۱۴۰۵/۰۴ |

### R-004: Single Region Outage
| فیلد | مقدار |
|------|-------|
| **Risk** | عدم وجود DR → downtime طولانی |
| **Impact** | 🔴 Critical |
| **Probability** | 🟢 Low (10%) |
| **Mitigation** | Multi-region DR در v2.0 |
| **Owner** | DevOps Team |
| **Status** | 🟢 Accepted |
| **Review Date** | ۱۴۰۵/۰۶ |

### R-005: API Rate Limiting Bypass
| فیلد | مقدار |
|------|-------|
| **Risk** | Rate limiting ضعیف → DoS |
| **Impact** | 🟠 High |
| **Probability** | 🟢 Low (15%) |
| **Mitigation** | Redis-based sliding window + IP ban |
| **Owner** | Backend Team |
| **Status** | 🟢 Mitigated |
| **Review Date** | ۱۴۰۵/۰۴ |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Project Status | `project/PROJECT_STATUS.md` |
| Technical Debt | `project/TECHNICAL_DEBT.md` |
| Quality Dashboard | `project/QUALITY_DASHBOARD.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
