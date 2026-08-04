# Test Environment Configuration

- **Document ID:** XENNIC-TEST-INFRA-DOTENV-047
- **Date:** 2026-08-02
- **Version:** 1.0.0
- **Status:** COMPLETE
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-TEST-INFRA-DOTENV-047
- **Related:** XENNIC-POST-MIGRATION-REBASELINE-044, `apps/api/jest.config.ts`, `apps/api/test/jest-e2e.json`

---

## 1. Current Problem

The API test suite relies on environment variables that must be present in the Jest process:

- `AI_MASTER_KEY` / `AI_MASTER_KEY_SALT` — required by `aes-encryption.service.ts`
- `DATABASE_URL` — required by any test that constructs a real `PrismaClient`
- `JWT_PRIVATE_KEY_PATH` / `JWT_PUBLIC_KEY_PATH` — required by auth-adjacent paths

Two implicit mechanisms existed before this order:

1. **Prisma Client** auto-loads the repository root `.env` at runtime, so DB-backed tests
   (e.g. `file-version.repository.integration.spec.ts`) silently worked.
2. **Inline defaults** in storage specs (`process.env.MINIO_* ??= ...`) covered MinIO creds.

Gap: plain `process.env` reads (like `AI_MASTER_KEY`) got **nothing**, because Jest does not
load `.env` itself. Result: the `ai-validation-integration` suite (19 tests) failed with
`AI_MASTER_KEY is not set or too short`.

Evidence before fix (from Order 044):

```text
Test Suites: 1 failed, 92 passed, 93 total
Tests:       19 failed, 1557 passed, 1576 total
```

Root cause: `AI_MASTER_KEY is not set or too short (minimum 16 chars)`.

---

## 2. Selected Solution

**Option A — shared Jest `setupFiles` loader** (`apps/api/test/setup-env.ts`).

Chosen over:

- Option B (`testEnvironment` with `setupFiles`): identical mechanics, no additional value,
  and `testEnvironment` already defaults to `node`.
- Option C (wrapper script): duplicates env logic, bypasses Jest's own lifecycle, and makes
  per-file overrides awkward.

The loader is registered in **both** Jest configs, so unit, integration, and e2e targets all
share one canonical path.

### Why not load `.env` directly in production code

Runtime production loading is governed separately (`ConfigModule`/Prisma). The loader is
**test-only** and never touches production bootstrapping.

---

## 3. Jest Configuration

### Unit + integration — `apps/api/jest.config.ts`

```ts
setupFiles: ['<rootDir>/../test/setup-env.ts'],
```

`<rootDir>` is `src`, so the path resolves to `apps/api/test/setup-env.ts`.

### E2E — `apps/api/test/jest-e2e.json`

```json
"setupFiles": ["<rootDir>/setup-env.ts"]
```

`<rootDir>` is `test`, so the path resolves to `apps/api/test/setup-env.ts`.

---

## 4. Loader Semantics — `apps/api/test/setup-env.ts`

Load order (first assignment wins):

1. **Existing `process.env`** (shell / CI secrets) — never overridden.
2. **`<repo-root>/.env`** — canonical local configuration.
3. **`apps/api/.env`** — optional API-local overrides when present.

Implemented with `dotenv.parse` + filtered assignment (not `dotenv.config`), so keys can be
selectively excluded and existing values are always preserved.

### Deliberate exclusion: `MINIO_*`

`MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`,
`MINIO_USE_SSL` are **not** injected from `.env`.

Reason: storage integration specs define their own MinIO defaults with `??=` that point at
the **local MinIO test server** (live container root user is `xennic-test-access`). The
deployment-scoped `MINIO_*` values in root `.env` differ from the live test server, and
injecting them would silently disable those spec defaults and break the integration suites.

This keeps:

- `file-version.service.integration.spec.ts` — `??=` defaults effective
- `test/kf-storage-integration.e2e-spec.ts` — `??=` defaults effective

Shell/CI still wins: if a real `MINIO_*` value is exported, it is preserved (rule 1).

---

## 5. Local Setup

No action required. When tests run from `apps/api` (pnpm filter) or repo root, the loader
discovers the repo root by walking up until `pnpm-workspace.yaml` is found, then reads
`.env` from there.

```bash
pnpm --filter @xennic/api test --runInBand          # unit
pnpm --filter @xennic/api test:e2e                  # e2e
```

MinIO integration suites can be forced with explicit overrides (loader preserves them):

```bash
MINIO_ENDPOINT=localhost:9000 \
MINIO_ACCESS_KEY=xennic-test-access \
MINIO_SECRET_KEY=xennic-test-secret-1234 \
pnpm --filter @xennic/api exec jest -c test/jest-e2e.json \
  test/kf-storage-integration.e2e-spec.ts --runInBand
```

---

## 6. CI Setup

CI must inject secrets via the environment (GitHub Actions `env:` / secrets), **not** by
committing a `.env`. Because rule 1 (existing `process.env` wins) always holds, CI-provided
values take precedence over the loader and are never masked by `.env`.

Required CI environment surface is the same set documented in `.env.example`. The loader is
safe when `.env` is absent (CI) — it simply does nothing.

---

## 7. Required Variables

| Variable               | Required       | Notes                                                |
| ---------------------- | -------------- | ---------------------------------------------------- |
| `AI_MASTER_KEY`        | Yes            | ≥ 16 chars; AES encryption service                   |
| `AI_MASTER_KEY_SALT`   | No             | optional salt for AES derivation                     |
| `DATABASE_URL`         | Yes\*          | auto-loaded by Prisma Client for DB tests            |
| `JWT_PRIVATE_KEY_PATH` | Conditional    | auth paths using real keys                           |
| `JWT_PUBLIC_KEY_PATH`  | Conditional    | auth paths using real keys                           |
| `MINIO_*`              | Test-defaulted | excluded from loader; spec `??=` covers local server |

`*` — loaded by the loader now for consistency, previously only via Prisma's implicit load.

All are declared in `.env.example` (no new variables introduced).

---

## 8. Security Rules

1. `.env` is git-ignored (`git check-ignore -v .env` → `.gitignore`).
2. No value is ever logged or printed by the loader.
3. Loader writes only to `process.env` in-process — no file output, no snapshots.
4. Error messages never embed secret values (`AI_MASTER_KEY` length check reports length only).
5. Loader produces no insecure placeholder values.
6. CI secrets come from the environment (shell/`env:`), never from committed files.

---

## 9. Test Evidence

All commands executed locally (2026-08-02) against live PostgreSQL 17.10 and live MinIO
(root user `xennic-test-access`).

| Suite                               | Before                  | After                            |
| ----------------------------------- | ----------------------- | -------------------------------- |
| `ai-validation-integration.spec.ts` | 19 failed               | **19/19 pass**                   |
| Full unit (`--runInBand`)           | 92/93 suites, 1557/1576 | **93/93 suites, 1576/1576 pass** |
| FileVersion (3 spec files)          | 66 pass                 | **66/66 pass**                   |
| ProjectFile e2e (2 files)           | 35 pass                 | **35/35 pass**                   |
| KF MinIO integration e2e            | 14 pass                 | **14/14 pass**                   |
| Full e2e (`test:e2e`)               | n/a                     | **12/12 suites, 225/225 pass**   |
| `typecheck` (`tsc --noEmit`)        | clean                   | **clean**                        |
| `build` (`tsc && generate:openapi`) | pass                    | **pass (237 endpoints)**         |

`git diff --check`: clean for the loader and config changes.

---

## 10. Change Log

| Date       | Version | Change                                                                                                                                                  | Author                             |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 2026-08-02 | 1.0.0   | Created canonical Jest env loader `apps/api/test/setup-env.ts`; registered in `jest.config.ts` and `test/jest-e2e.json`; documented MINIO\_\* exclusion | Order XENNIC-TEST-INFRA-DOTENV-047 |

---

## 11. Scope Boundaries / Non-Changes

Per order restrictions, no changes were made to:

- Production logic (no `src` business-code changes by this order)
- `prisma/schema.prisma` and no migrations
- MinIO implementation
- FileVersion API (still pending independent review)
- Qdrant
- `.env` contents
- No commits, no pushes, no `git add .`
