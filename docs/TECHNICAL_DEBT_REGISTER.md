# Technical Debt Register

> **Status:** Current as of 2026-07-06
> **Governance Score:** 🟢 100/100
> **Open Items:** 0

---

## Zero Open Items

All 239 architecture violations identified during the initial governance scan have been resolved:

| Severity | Count | Resolution |
|----------|-------|------------|
| 🔴 Critical | 38 | Moved 24 InMemory repos from `infrastructure/` to `testing/adapters/`; updated 38 spec files + 2 E2E files |
| 🟠 High | 0 | — |
| 🟡 Medium | 201 | Fixed validator regex to properly handle compound filename suffixes (`.entity.spec.ts`, `.repository.interface.ts`, etc.) — all 201 were false positives from buggy detection |
| 🔵 Low | 0 | — |

## Previously Tracked (Resolved)

### ADR-020: Architecture Governance Automation Baseline

**Root cause:** No automated enforcement of architecture rules existed. All violations were pre-existing patterns from Sprint I1 (Enterprise Intelligence) and Sprint O1 (Enterprise Orchestration) where test doubles were placed in infrastructure layers for convenience.

**Resolution approach:**
- Created `testing/adapters/` directories in all 19 affected modules
- Moved all 24 InMemory* implementations out of `infrastructure/` layer
- Updated 38 spec files and 2 E2E test files to import from new locations
- Removed `@Injectable()` decorator from testing adapters (not needed for DI-free test doubles)
- Added profile-aware rule filtering to support `--profile production|test` execution modes

### NAME-001 False Positives

**Root cause:** The `isKebabCase()` validation function required files to have at least one recognized suffix from a predefined list. Files with compound suffixes (`.repository.interface.ts`, `.entity.spec.ts`) or files without standard suffixes (`circuit-breaker.ts`, `api-registry.ts`) were incorrectly flagged.

**Resolution approach:**
- Simplified `isKebabCase()` to validate that every dot-separated part follows kebab-case lowercase pattern
- Removed the suffix whitelist requirement

---

*Maintained by: Chief Enterprise Architect*
*Next review: Per governance scan output*
