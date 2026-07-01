# نسخه‌بندی — Versioning

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

راهبرد نسخه‌بندی پلتفرم Xennic.

---

## Scope

Semantic versioning, compatibility.

---

## Semantic Versioning

Xennic از [Semantic Versioning 2.0.0](https://semver.org/) پیروی می‌کند:

```
MAJOR.MINOR.PATCH
```

| بخش | تغییر | مثال |
|------|--------|-------|
| **MAJOR** | Breaking API/DB changes | 2.0.0 |
| **MINOR** | New features (backward compatible) | 1.1.0 |
| **PATCH** | Bug fixes (backward compatible) | 1.0.1 |

## Pre-release Tags

| برچسب | معنی | مثال |
|-------|------|-------|
| -alpha | در حال توسعه | 1.1.0-alpha.1 |
| -beta | تست محدود | 1.1.0-beta.1 |
| -rc | نامزد انتشار | 1.1.0-rc.1 |

## Version Management

```bash
# View current version
pnpm version

# Bump version
pnpm version patch  # 1.0.0 → 1.0.1
pnpm version minor  # 1.0.0 → 1.1.0
pnpm version major  # 1.0.0 → 2.0.0
```

## Compatibility Matrix

| API Version | Client Support | DB Schema |
|-------------|---------------|-----------|
| 1.x | 1.x | v1 |
| 2.x | 2.x | v2 |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Release Process | `project/RELEASE_PROCESS.md` |
| Changelog | `project/CHANGELOG.md` |
| API Design | `backend/API_DESIGN.md` |
| API Reference | `api/API_REFERENCE.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
