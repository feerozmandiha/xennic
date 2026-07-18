# 07 — Build Report

**Date:** 2026-07-02

---

## 7.1 TypeScript Compilation (`tsc --noEmit`)

| Package       | Result       | Errors |
| ------------- | ------------ | ------ |
| `@xennic/api` | ✅ **CLEAN** | 0      |

**Details:** No output = no errors, no warnings. Compilation succeeded silently.

---

## 7.2 Prisma Client Generation

| Metric  | Result                        |
| ------- | ----------------------------- |
| Status  | ✅ **SUCCESS**                |
| Version | 6.19.3                        |
| Time    | 5.67s                         |
| Schema  | `prisma/schema.prisma`        |
| Output  | `node_modules/.prisma/client` |

---

## 7.3 Full Monorepo Build (`pnpm build` via Turborepo)

| Package            | Build Command               | Result                                    |
| ------------------ | --------------------------- | ----------------------------------------- |
| `@xennic/config`   | `tsc -p tsconfig.base.json` | ✅ Cache hit                              |
| `@xennic/database` | `tsc -p tsconfig.json`      | ✅ Cache hit                              |
| `@xennic/types`    | `tsc -p tsconfig.json`      | ✅ Cache hit                              |
| `@xennic/api`      | `tsc && generate:openapi`   | ✅ **162 endpoints generated**            |
| `@xennic/web`      | `next build`                | ⚠️ **Hung — did not finish within 5 min** |

**Overall:** Partial success. API and packages built cleanly. Web (Next.js) timed out — likely a heavy build or missing env.

---

## 7.4 NestJS CLI Build

| Command      | Result                                     |
| ------------ | ------------------------------------------ |
| `nest build` | ⚠️ **Not configured** — no `nest-cli.json` |

The project uses raw `tsc` for builds, not `nest build`. This is documented in `package.json`.

---

## 7.5 Lint Results (`pnpm lint`)

| Package            | Lint Command | Result                                     |
| ------------------ | ------------ | ------------------------------------------ |
| `@xennic/config`   | `eslint src` | ✅ Clean                                   |
| `@xennic/types`    | `eslint src` | ✅ Clean                                   |
| `@xennic/web`      | `next lint`  | ❌ **FAILED** — missing `@eslint/eslintrc` |
| `@xennic/api`      | _undefined_  | ❌ No lint script                          |
| `@xennic/database` | _undefined_  | ❌ No lint script                          |
| `@xennic/shared`   | _undefined_  | ❌ No lint script                          |

**4 of 6 packages cannot lint.** Only `config` and `types` succeed.

---

## 7.6 Issues Found

| Issue                          | Severity | Details                                               |
| ------------------------------ | -------- | ----------------------------------------------------- |
| Web build hangs                | Medium   | `next build` does not complete within 5 minutes       |
| Web lint fails                 | Medium   | Missing `@eslint/eslintrc` package                    |
| API has no lint script         | Medium   | `apps/api/package.json` has no `lint` entry           |
| Database has no lint script    | Low      | Missing                                               |
| Shared has no lint script      | Low      | Missing                                               |
| No `nest-cli.json`             | Low      | Build uses `tsc` directly (intentional)               |
| Mixed build tooling            | Low      | `ts-node` + `ts-jest` (older) alongside `tsx` (newer) |
| `@nestjs/throttler` in devDeps | Medium   | Runtime dependency incorrectly categorized            |
