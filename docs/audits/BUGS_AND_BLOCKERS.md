# BUGS AND BLOCKERS

**Date:** 2026-07-02

---

## Blocker 1: 15 Failing Python Tests (engineering-service)

| Test                             | Type        | Symptom        |
| -------------------------------- | ----------- | -------------- |
| test_ohms_law_calculate_voltage  | Integration | AssertionError |
| test_ohms_law_calculate_current  | Integration | AssertionError |
| test_ohms_law_validation_error   | Integration | API error      |
| test_active_power_single_phase   | Integration | TypeError      |
| test_active_power_three_phase    | Integration | TypeError      |
| test_active_power_invalid_pf     | Integration | TypeError      |
| test_apparent_power_single_phase | Integration | API error      |
| test_apparent_power_three_phase  | Integration | API error      |
| test_reactive_power              | Integration | AttributeError |
| test_power_factor                | Integration | AttributeError |
| test_thd_missing_fundamental     | Integration | API error      |
| test_tdd_with_fundamental_raises | Integration | API error      |
| test_resonance_low_risk          | Integration | API error      |
| test_apf_with_fundamental_raises | Integration | API error      |
| test_registry_thread_safe        | Unit        | AssertionError |

**Root cause:** Likely API test fixtures not connecting to the running service. The basic calculator API endpoints are returning unexpected responses.

## Blocker 2: AI-service Tests Broken

| Issue      | Details                                                                         |
| ---------- | ------------------------------------------------------------------------------- |
| Symptom    | `ModuleNotFoundError: No module named 'openai'`                                 |
| Root cause | `openai` missing from venv; `requirements.txt` has `openai` commented or absent |
| Impact     | Zero AI test coverage; 15 tests cannot run                                      |
| Fix        | `pip install openai` in ai-service venv                                         |

## Blocker 3: Web Build Hangs

| Issue      | Details                                 |
| ---------- | --------------------------------------- |
| Symptom    | `next build` does not complete (>5 min) |
| Impact     | Cannot produce web deployment artifact  |
| Root cause | Unknown — needs investigation           |

## Blocker 4: Lint Completely Broken

| Package            | Issue                              |
| ------------------ | ---------------------------------- |
| `@xennic/web`      | Missing `@eslint/eslintrc` package |
| `@xennic/config`   | `node_modules` missing             |
| `@xennic/types`    | `node_modules` missing             |
| `@xennic/api`      | No lint script                     |
| `@xennic/database` | No lint script                     |
| `@xennic/shared`   | No lint script                     |

## Blocker 5: 57 npm Vulnerabilities (3 Critical)

Notable: `dompurify` (via `jspdf`) has active XSS advisories in web package.

## Blocker 6: `.gitignore` Misconfiguration

Line 15 in `.gitignore`:

```
*.loginfrastructure/docker/secrets/*.key
```

This is a line-merge typo — `*.log` is not ignored and secrets path is malformed.

## Bug: Raw `throw new Error` in 34 Repository Files

98 occurrences across all repository implementations. These bypass:

- Global exception filter (`AllExceptionsFilter`)
- Unified response format (`{success, error: {code, message, details}}`)
- NestJS `HttpException` hierarchy

Every one will return a generic 500 error in production.
