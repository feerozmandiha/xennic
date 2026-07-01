# مشخصات امنیت — Security Specification

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **مالک**: Security Team | **آخرین بروزرسانی**: خرداد ۱۴۰۵ | **بازبینی بعدی**: شهریور ۱۴۰۵

---

## Purpose

مشخصات رسمی امنیت پلتفرم Xennic.

---

## Scope

Authentication, authorization, encryption, secrets.

---

## Contract

### Authentication
| روش | وضعیت |
|-----|--------|
| JWT (RS256) | Active |
| API Key | Active |
| OAuth 2.0 / SSO | Planned for future implementation |
| MFA | Planned for future implementation |

### JWT Configuration
| پارامتر | مقدار |
|---------|-------|
| Algorithm | RS256 |
| Key Size | 2048 bits |
| Access TTL | 1 hour |
| Refresh TTL | 24 hours |
| Rotation | Every 90 days |

### Authorization
| مدل | وضعیت |
|-----|--------|
| RBAC (Role-Based) | Active |
| ABAC (Attribute-Based) | Active |
| Workspace Isolation | Active |

### Encryption
| لایه | الگوریتم |
|------|----------|
| Transport | TLS 1.3 |
| Storage (DB) | AES-256-GCM |
| Field-level | AES-256-GCM |
| Backups | AES-256-CBC |
| Passwords | bcrypt |

### Rate Limiting
| Tier | Limit | Window |
|------|-------|--------|
| Public | 100/hour | 1 hour |
| Authenticated | 1000/hour | 1 hour |
| Login | 5/min | IP-based |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Security Model | `security/SECURITY_MODEL.md` |
| JWT | `security/JWT.md` |
| Access Control | `security/ACCESS_CONTROL.md` |
| Auth Spec | `architecture/XENNIC_AUTHORIZATION_SPEC_v1.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
