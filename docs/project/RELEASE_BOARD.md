# تخته انتشار — Release Board

**نسخه**: ۱.۰.۰ | **وضعیت**: Active | **آخرین بروزرسانی**: خرداد ۱۴۰۵ | **بازبینی بعدی**: هفتگی

---

## Release History

### v1.0.0 (۱۴۰۵-۰۳-۱۵)
| بخش | توضیح |
|-----|-------|
| **Features** | Auth, Projects, Calculations, Knowledge, OCR, Embeddings, Subscription |
| **Breaking Changes** | N/A (Initial release) |
| **Bug Fixes** | N/A |
| **Known Issues** | Test coverage < 50%, Manual deployment |
| **Rollback Plan** | N/A (Initial release) |
| **Deployment Notes** | Docker Compose, single region |

### v1.1.0 (Planned — ۱۴۰۵-۰۶)
| بخش | توضیح |
|-----|-------|
| **Planned Features** | CI/CD pipeline, prisma migrate, test coverage > 60% |
| **Breaking Changes** | None expected |
| **Bug Fixes** | nest-cli.json root path |
| **Known Issues** | - |
| **Rollback Plan** | Dokcer Compose version tag rollback |
| **Deployment Notes** | Automated via GitHub Actions |

### v1.2.0 (Planned — ۱۴۰۵-۰۹)
| بخش | توضیح |
|-----|-------|
| **Planned Features** | Document Analysis, Vision Pipeline, Admin Panel |
| **Breaking Changes** | Potential API additions |
| **Bug Fixes** | TBD |
| **Known Issues** | - |
| **Rollback Plan** | Blue/Green deployment |
| **Deployment Notes** | Multi-instance staging |

---

## Next Release Checklist

### v1.1.0
- [ ] GitHub Actions CI/CD
- [ ] prisma migrate implementation
- [ ] Test coverage > 60%
- [ ] CHANGELOG.md updated
- [ ] Version bumped

---

## Related Documents

| سند | مسیر |
|-----|------|
| Release Process | `project/RELEASE_PROCESS.md` |
| Versioning | `project/VERSIONING.md` |
| Changelog | `project/CHANGELOG.md` |
| Milestones | `project/MILESTONES.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
