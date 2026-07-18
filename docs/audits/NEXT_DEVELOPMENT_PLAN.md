# NEXT DEVELOPMENT PLAN

**Date:** 2026-07-02
**Based solely on verified repository state**

---

## Recommended Next Phase: Foundation Hardening

**Duration: 1-2 months | Priority: CRITICAL | Do NOT skip**

Add NO new features until the foundation is production-safe.

### Why This Phase

| Current State                       | Risk                                       |
| ----------------------------------- | ------------------------------------------ |
| 98 raw `throw new Error`            | Every repository error returns generic 500 |
| 57 npm vulnerabilities (3 critical) | Exploitable in production                  |
| 15 Python tests failing             | Basic calculator API broken                |
| AI-service has zero tests           | Undetected regressions                     |
| Lint broken for all packages        | Code quality degrades silently             |
| `.gitignore` typo                   | Logs and secrets may be committed          |
| Web build hangs                     | Cannot deploy frontend                     |
| No CI/CD                            | Every deploy is manual                     |

### Task Breakdown

| Week | Tasks                                                                        |
| ---- | ---------------------------------------------------------------------------- |
| 1    | Fix `.gitignore`, install `openai`, fix throttler deps, remove web throttler |
| 1-2  | Fix 15 Python test failures + 215 Pydantic warnings                          |
| 2-3  | Fix ESLint for all 6 packages, add lint scripts                              |
| 2-4  | Investigate + fix web build hang                                             |
| 3-6  | Replace 98 `throw new Error` with HttpException                              |
| 3-6  | Fix 57 npm vulnerabilities                                                   |
| 5-8  | Set up GitHub Actions CI (lint → typecheck → test → build)                   |
| 6-8  | Replace `console.log` audit with Logger, fix MinIO placeholder               |

### After Foundation Hardening

| Phase                                          | Duration   | Dependencies     |
| ---------------------------------------------- | ---------- | ---------------- |
| Testing Expansion                              | 2-3 months | Foundation done  |
| AI Platform (5 missing agents + orchestration) | 2-3 months | Testing done     |
| Knowledge Factory                              | 3-6 months | AI Platform done |
| Enterprise Modules (4)                         | 2-3 months | Foundation done  |
| CI/CD + Production Hardening                   | 1-2 months | Ongoing          |

### What NOT to Do Next

- ❌ Do NOT build more AI agents until AI tests pass
- ❌ Do NOT build Knowledge Factory until foundation is hardened
- ❌ Do NOT add enterprise modules until CI/CD exists
- ❌ Do NOT add new endpoints until lint is enforced
