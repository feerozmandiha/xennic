# TECHNICAL DEBT

**Date:** 2026-07-02
**Method:** Source-code search

---

## Critical Debt

| # | Issue | Count | Files | Impact | Fix Time |
|---|-------|-------|-------|--------|----------|
| 1 | `throw new Error` (not HttpException) | 98 | 34 | Generic 500 errors | 2-4 weeks |
| 2 | npm vulnerabilities | 57 (3 critical) | root deps | Security exploits | 1-2 weeks |
| 3 | No lint scripts for 4 packages | 4 | api, database, shared, types | Code quality unenforced | 1 week |
| 4 | `.gitignore` line-merge typo | 1 | `.gitignore:15` | `*.log` not ignored, secrets pattern broken | 1 hour |
| 5 | `openai` missing from ai-service | 1 | venv | Zero AI test coverage | 1 day |

## Moderate Debt

| # | Issue | Count | Files | Fix Time |
|---|-------|-------|-------|----------|
| 6 | `: any` type usage | 215 | 85 | 2-4 weeks |
| 7 | Pydantic V2 deprecation warnings | 215 | engineering-service schemas | 1 week |
| 8 | `console.log` for audit logging | 5 | `auth.service.ts` | 1 day |
| 9 | Runtime packages in root devDeps | ~10 | root package.json | 1 day |
| 10 | MinIO placeholder string | 1 | `minio.service.ts:33` | 1 hour |
| 11 | `@nestjs/throttler` in devDeps (api) | 1 | api/package.json | 1 day |
| 12 | `@nestjs/throttler` in web devDeps | 1 | web/package.json | 1 day |

## Low Debt

| # | Issue | Count | Fix Time |
|---|-------|-------|----------|
| 13 | TODO markers | 1 (notification queue) | 1 day |
| 14 | Prisma major version behind (6→7) | 1 | 1 day |
| 15 | Missing `nest-cli.json` | — | 1 day (already exists) |
| 16 | Missing .nvmrc | — | 1 hour |

## Clean Code Metrics

| Metric | Count |
|--------|-------|
| FIXME | 0 |
| HACK | 0 |
| eslint-disable | 0 |
| ts-ignore / ts-expect-error | 0 |
| Empty .ts files | 0 |
| Dead code directories | 5 (empty modules) |
