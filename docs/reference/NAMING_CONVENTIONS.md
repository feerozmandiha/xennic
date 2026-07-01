# قراردادهای نام‌گذاری — Naming Conventions

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

قراردادهای نام‌گذاری در پلتفرم Xennic.

---

## Scope

Code, files, database, APIs, Git.

---

## Code

| مؤلفه | سبک | مثال |
|-------|------|------|
| Classes | PascalCase | `CalculationService` |
| Functions | camelCase | `calculateAmpacity()` |
| Variables | camelCase | `cableSize` |
| Constants | UPPER_SNAKE | `MAX_CURRENT` |
| Interfaces | PascalCase + I | `ICalculationInput` |
| Types | PascalCase | `CalculationResult` |
| Enums | PascalCase | `CalculationStatus` |

## Files

| نوع | سبک | مثال |
|-----|------|------|
| NestJS modules | kebab-case | `cable-calculation.module.ts` |
| Controllers | PascalCase | `CableCalculationController.ts` |
| Services | PascalCase | `CableCalculationService.ts` |
| NestJS pipes | PascalCase | `ValidationPipe.ts` |
| Config files | kebab-case | `database.config.ts` |

## Database

| مؤلفه | سبک | مثال |
|-------|------|------|
| Tables | snake_case | `cable_calculations` |
| Columns | snake_case | `cable_size_mm2` |
| Foreign keys | snake_case | `project_id` |
| Indexes | ix_snake | `ix_calc_project_id` |
| Enums | PascalCase | `CalculationStatus` |

## API

| مؤلفه | سبک |
|-------|------|
| Endpoints | kebab-case, plural |
| Parameters | camelCase |
| Query | camelCase |
| Response | camelCase |

## Git

| مؤلفه | سبک | مثال |
|-------|------|------|
| Branches | kebab-case | `feat/cable-sizing` |
| Commits | Conventional | `feat(api): add cable sizing` |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Coding Standards | `reference/CODING_STANDARDS.md` |
| Developer Guide | `development/DEVELOPER_GUIDE.md` |
| Standards Doc | `standards/XENNIC_CODING_STANDARDS_v1.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
