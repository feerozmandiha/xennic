# Xennic — Critical Path Analysis

**Date:** 2026-07-02
**Source:** XED-AUDIT-0001 (25 audit documents, 36 gaps identified)
**Overall Platform Score:** 34/100

---

## A. Fastest Path to RC1 (Minimum Viable Production)

### Overview
The absolute minimum set of fixes required before Xennic can serve real production traffic. This path prioritizes security (remove committed secrets, add missing guards), production reliability (graceful shutdown, transactions, health checks), and critical AI fixes (agents must actually call an LLM). Everything else is deferred.

### Gap IDs Included
- **Critical:** Gaps 2 (throw Error), 8 (throttler deps), 10 (gitignore)
- **Security:** JWT keys committed, UserController unguarded, SSRF, hard-delete public, encryption key in .env, no Helmet, prompt injection
- **Production:** graceful shutdown, env validation, bounded stores, transactions, idempotency, remove mock fallback, fix silent DB error swallowing, fix timer leaks, readiness/liveness probes
- **AI Critical:** C1 (agent never calls LLM), C2 (pipeline echoes input), C3 (dummy embeddings), C4 (workspaceId typo), C5 (duplicate method)
- **High Gaps:** 12 (RAG pipeline integration), 17 (fix `any` types — partial)

### Key Milestones
| Week | Milestone |
|------|-----------|
| W1 | Secrets removed, UserController guarded, Helmet added, SSRF fixed |
| W2 | Agent calls real LLM, duplicate method removed, workspaceId typo fixed |
| W3 | Graceful shutdown + env validation + health probes |
| W4 | Prisma transactions on all write paths |
| W5 | Idempotency middleware deployed |
| W6 | Redis-backed stores replace in-memory (ai-runtime) |
| W7 | Real SSE streaming, fixed embeddings |
| W8 | RAG context injected into chat responses |
| W9 | Fix 15 failing Python tests + ai-service tests |
| W10 | Security hardening completion (CORS, CSRF, prompt injection guard) |
| W11 | Final integration testing + staging deployment |
| W12 | Stabilization and RC1 cut |

### Estimated Hours
**Total: ~480 hours** (12 weeks × 40h/week)

### Team Size
**2 engineers:** 1 senior backend (NestJS + security + infra), 1 AI/ML engineer (Python agents + RAG + LLM integration)

### Risks
| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| AI quality will be basic | High | Acceptable for RC1; plan AI quality improvements for post-RC1 |
| No monitoring/observability | High | Only basic health probes — no Prometheus, no Sentry |
| No CI/CD pipeline | High | Manual deploy with checklist; CI/CD added in Phase 7 |
| No automated tests for new code | High | Manual regression testing before RC1 |
| Web build still hangs | Medium | Deploy API-only if web can't build; web is secondary |
| Secrets rotation breaks existing sessions | Medium | Coordinate with all users; force re-login |
| API key costs (LLM + embedding) | Medium | Set budget alerts; use Groq for low-cost inference |
| Mock fallback removal causes 503s | Medium | Client teams must handle 503 errors |

### Go/No-Go Criteria
- [ ] All 7 critical security issues remediated (secrets removed, guards added, SSRF fixed, Helmet active)
- [ ] Electrical Engineer Agent sends real LLM requests (verified via logs)
- [ ] Graceful shutdown works (SIGTERM drains connections)
- [ ] All write operations use Prisma `$transaction`
- [ ] POST endpoints reject duplicate `Idempotency-Key` within TTL
- [ ] `/health/readiness` and `/health/liveness` endpoints return correct status
- [ ] In-memory stores replaced with Redis-backed stores
- [ ] No committed secrets in git history (verified with `git log --all -p`)
- [ ] 15 failing Python tests fixed (all pass)
- [ ] ai-service tests pass (no collection errors)
- [ ] All UserController endpoints return 401 without auth
- [ ] Webhook delivery blocks private IP ranges

### What is Explicitly NOT Included
- No test coverage expansion (stays at ~9%)
- No CI/CD pipeline (manual deploy)
- No monitoring/observability (Prometheus, Grafana, Sentry)
- No citation engine, evidence chain, or guardrails (AI quality basic)
- No Knowledge Factory implementation (empty module stays empty)
- No enterprise modules (enterprise-* stay empty)
- No performance optimization (N+1, SELECT *, indexes)
- No code quality refactoring (large classes, console.log, bare catches)
- No documentation beyond minimal README update
- No K8s manifests (Docker Compose only)
- No load/stress testing
- No frontend testing
- No UUID-to-native-type migration
- No Prisma enum migration (string statuses remain)

---

## B. Minimum Path to Demo

### Overview
What's needed for a production demo that looks and feels real to stakeholders. The focus is on visual impact: a working AI pipeline that actually calls an LLM, real streaming of responses, functional RAG that retrieves real documents, and a clean UX. DevOps, monitoring, performance optimization, and extensive testing are explicitly deferred.

### Gap IDs Included
- **AI Critical (all):** C1-C5 — agent must call LLM, pipeline must not echo, embeddings must work, streaming must be real, no duplicate methods
- **AI High:** C6 (tools dead code — partially), C7 (RAG in chat), C9 (fake streaming)
- **RAG:** 40% maturity → functional retrieval with real embeddings
- **High Gaps:** 12 (RAG pipeline integration), 15 (agent memory — basic)
- **Security:** P0 only (secrets, UserController, Helmet — not full hardening)
- **Production:** P0 only (graceful shutdown, env validation — not full transaction coverage)

### Key Milestones
| Week | Milestone |
|------|-----------|
| W1 | Emergency security fixes (secrets, guards, Helmet) |
| W2 | Agent connects to real LLM + real SSE streaming |
| W3 | Embedding pipeline fixed + RAG context in chat |
| W4 | Demo UI polish + conversation flow working |
| W5 | Engineering tool calling functional |
| W6 | Final demo prep: staging deploy, smoke tests, walkthrough |

### Estimated Hours
**Total: ~240 hours** (6 weeks × 40h/week)

### Team Size
**2 engineers:** 1 full-stack (NestJS + Next.js UI), 1 AI/ML (Python agents + RAG)

### Risks
| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Demo breaks due to missing error handling | High | Scripted demo path; avoid edge cases |
| No transaction safety | High | Demo only — accept data inconsistency risk |
| No monitoring if something fails | High | Pre-stage everything; no live changes during demo |
| LLM API key rate limits during demo | Medium | Pre-warm cache; use higher-tier API key |
| Web build still hangs | Medium | Deploy API-only; use simple UI or curl demo |
| RAG retrieval quality poor without real data | Medium | Pre-seed Qdrant with demo documents |
| Streaming stutters or drops | Medium | Fallback to non-streaming mode |

### Go/No-Go Criteria
- [ ] User can sign up, log in, and create a workspace
- [ ] User can start an AI conversation and get a real LLM-generated response
- [ ] Streaming shows tokens appearing in real time (not word-by-word delays)
- [ ] AI agent can reference engineering documents (RAG functional)
- [ ] AI agent can call a calculation tool and return result
- [ ] Knowledge articles can be created and retrieved
- [ ] Demo data seeded (at least 5 knowledge articles, 3 conversations)
- [ ] All visible security issues patched (no embarrassing demo breaches)
- [ ] Staging environment is stable and recoverable

### What is Explicitly NOT Included
- No CI/CD pipeline
- No monitoring, logging aggregation, or alerts
- No performance optimization
- No documentation beyond what exists
- No test coverage expansion
- No production hardening (CSP, CSRF, security headers)
- No billing/subscription flows (can demo but not fully secure)
- No enterprise features
- No Knowledge Factory
- No citation engine, evidence chain, or guardrails
- No load testing
- No K8s deployment (Docker Compose only)
- No scalability features (Redis caching, connection pooling)

---

## C. Maximum Quality Path to Enterprise GA

### Overview
Full enterprise readiness covering all 36 identified gaps plus comprehensive security, testing, DevOps, and AI quality improvements. This is the complete 28-week plan resulting in a production-grade platform suitable for enterprise customers with SLA requirements.

### Gap IDs Included
**All 36 gaps** from the gap analysis:
- **Critical (1-10):** Knowledge Factory, throw Error, zero tests, no CI/CD, lint broken, failed Python tests, ai-service tests, throttler deps, web build, gitignore
- **High (11-20):** Enterprise modules, RAG integration, multi-agent orchestration, Helmet/CSP, agent memory, provenance/citation, `any` types, shared build, README, pre-commit hooks
- **Medium (21-30):** Feature branches, semver, CHANGELOG, CONTRIBUTING, LICENSE, stale status report, empty knowledge dirs, empty diagrams, Pydantic warnings, mixed test tooling
- **Low (31-36):** MoEarning placeholder, no enums, throttler in web deps, .dockerignore, .nvmrc, .node-version

Plus all items from security, production-readiness, ai-audit, code-quality, performance, and technical-debt audits.

### Key Milestones
| Week | Phase | Milestone |
|------|-------|-----------|
| W1-2 | Phase 0: Stop the Bleeding | Security holes closed, agent calls LLM |
| W3-5 | Phase 1: Foundation | Graceful shutdown, env validation, transactions, idempotency, health checks |
| W6-8 | Phase 2: Security Hardening | CSRF, CSP, prompt injection, secret management, CORS for Python |
| W9-11 | Phase 3: Data Layer | Cascade deletes, indexes, enums, UUID native type |
| W12-14 | Phase 4: Code Quality | No bare catches, no console.log, pagination extracted, large classes split |
| W15-17 | Phase 5: AI Quality | Citation engine, evidence chain, guardrails, conflict resolution, hybrid RAG |
| W18-22 | Phase 6: Testing | 60%+ coverage, integration tests, e2e tests, concurrency tests, load tests |
| W23-25 | Phase 7: DevOps | CI/CD, K8s manifests, Prometheus, Grafana, Sentry, centralized logging |
| W26-28 | Phase 8: Polish | Large class split, ADRs, request tracing, circuit breakers, final security review |

### Estimated Hours
| Phase | Hours |
|-------|-------|
| Phase 0: Stop the Bleeding | 40h |
| Phase 1: Foundation | 120h |
| Phase 2: Security Hardening | 60h |
| Phase 3: Data Layer | 80h |
| Phase 4: Code Quality | 120h |
| Phase 5: AI Quality | 160h |
| Phase 6: Testing | 400h |
| Phase 7: DevOps | 80h |
| Phase 8: Polish | 80h |
| **Total** | **1,140h** |

### Team Size
**4 engineers:** 2 senior backend (NestJS, Prisma, security, DevOps), 1 AI/ML engineer (Python agents, RAG, LLM), 1 QA/DevOps engineer (testing, CI/CD, monitoring)

### Risks
| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Scope creep (28 weeks is long) | High | Strict phase gating; no changes without re-estimation |
| AI quality still below expectations | Medium | Dedicated AI phase with clear acceptance criteria |
| Team availability over 7 months | Medium | Cross-train; document knowledge; use ADRs |
| Dependencies on external LLM providers | Medium | Multi-provider support (Groq, OpenAI, Anthropic) |
| Database migration complexity (UUID, enums) | High | Zero-downtime migration plan; staged rollout |
| Web build hang root cause unknown | Medium | Dedicated investigation early (Phase 0/1) |
| Test coverage target (60%) ambitious | Medium | Start with critical path modules; accept lower coverage for non-critical |
| K8s learning curve | Medium | Start with Docker Compose; migrate to K8s incrementally |

### Go/No-Go Criteria
- [ ] OWASP Top 10 compliance verified
- [ ] All 7 critical + 7 high security issues remediated (from security.md)
- [ ] 48 technical debt items addressed (8 P0, 14 P1, 18 P2, 8 P3)
- [ ] Test coverage ≥ 60% across all modules
- [ ] All Python tests pass (0 failures, 0 collection errors)
- [ ] AI agents use real LLMs with citation, evidence chain, guardrails, and confidence scoring
- [ ] CI/CD pipeline operational (PR → lint → typecheck → test → build → deploy)
- [ ] K8s manifests complete with readiness/liveness probes, resource limits, HPA
- [ ] Monitoring dashboards operational (API perf, AI quality, DB health)
- [ ] Sentry error tracking active for all services
- [ ] Structured JSON logging with request tracing
- [ ] Performance benchmarks meet targets (p95 latency < 500ms for API, < 5s for AI)
- [ ] Load test passes: 100 concurrent users without degradation
- [ ] All 36 gaps from gap analysis closed
- [ ] Final security penetration test passed

### What is Explicitly NOT Included
- Knowledge Factory module (remains empty; separate project post-GA)
- Enterprise modules (enterprise-* remain empty; separate project)
- Mobile app (iOS/Android)
- Real-time collaboration features
- Advanced analytics/BI dashboards
- Multi-region deployment
- SOC2/ISO27001 certification process (code readiness only)
- Third-party marketplace integrations
- Advanced workflow automation engine
- Natural language querying for database
- Custom model fine-tuning

---

## Summary Comparison

| Dimension | Fastest Path to RC1 | Min Path to Demo | Max Quality to GA |
|-----------|-------------------|------------------|-------------------|
| **Timeline** | ~12 weeks | ~6 weeks | ~28 weeks |
| **Effort** | ~480 hours | ~240 hours | ~1,140 hours |
| **Team** | 2 engineers | 2 engineers | 4 engineers |
| **Security** | Critical only | Critical only | Full (all 14 items) |
| **AI Quality** | Basic (calls LLM) | Functional (LLM + RAG + tools) | Enterprise (citation + guardrails) |
| **Testing** | ~9% coverage | ~9% coverage | 60%+ coverage |
| **CI/CD** | None | None | Full pipeline |
| **Monitoring** | Basic health probes | Basic health probes | Prometheus + Grafana + Sentry |
| **Risk** | AI quality basic, no safety net | Demo-only, not prod-safe | High cost, long timeline |
| **Best for** | Internal/alpha customers | Stakeholder demo | Enterprise GA release |
