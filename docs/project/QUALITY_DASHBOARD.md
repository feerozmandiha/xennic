# داشبورد کیفیت — Quality Dashboard

**نسخه**: ۱.۰.۰ | **وضعیت**: Active | **آخرین بروزرسانی**: خرداد ۱۴۰۵ | **بازبینی بعدی**: هفتگی

---

## Metrics

| معیار | امتیاز | وضعیت | هدف |
|-------|--------|-------|------|
| **Documentation Coverage** | ۹۵٪ | 🟢 | > 90% |
| **API Coverage** | ۸۰٪ | 🟢 | > 80% |
| **Testing Coverage** | ۳۰٪ | 🔴 | > 70% |
| **Architecture Coverage** | ۹۰٪ | 🟢 | > 85% |
| **Production Readiness** | ۴۰٪ | 🟡 | > 80% |
| **Security Readiness** | ۷۰٪ | 🟡 | > 90% |
| **Performance Readiness** | ۵۰٪ | 🟡 | > 80% |
| **Technical Debt** | ۶۰٪ | 🟡 | < 20% |

---

## Issues

| نوع | تعداد | روند |
|-----|-------|------|
| **Open Bugs** | ۱۲ | 📈 Increasing |
| **Critical Bugs** | ۲ | ➡️ Stable |
| **High Priority Tasks** | ۵ | 📈 Increasing |
| **Medium Priority Tasks** | ۱۵ | ➡️ Stable |
| **Low Priority Tasks** | ۳۰ | 📉 Decreasing |

---

## Trends

```mermaid
graph LR
    subgraph "Last 30 Days"
        DOC["Docs: 95% 🟢"]
        TEST["Test: 30% 🔴"]
        ARCH["Arch: 90% 🟢"]
        SEC["Security: 70% 🟡"]
    end
    
    subgraph "Target"
        DOC_T["95%"]
        TEST_T["70%"]
        ARCH_T["90%"]
        SEC_T["90%"]
    end
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| Project Status | `project/PROJECT_STATUS.md` |
| Risk Register | `project/RISK_REGISTER.md` |
| Technical Debt | `project/TECHNICAL_DEBT.md` |
| Known Limitations | `project/KNOWN_LIMITATIONS.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
