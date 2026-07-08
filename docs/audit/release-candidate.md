# Xennic — Release Candidate Checklist

> **Purpose**: Verify that every subsystem of the Xennic platform is production-ready before tagging a release candidate.
> **Owner**: Engineering Lead
> **Sign-off required**: Engineering Lead, Security Lead, DevOps Lead, QA Lead, AI Lead

---

## 1. Security Checklist

- [ ] All secrets removed from git history
- [ ] JWT keys rotated and properly managed (not committed)
- [ ] All API endpoints have proper auth guards
- [ ] RBAC enforced on all protected endpoints
- [ ] Workspace isolation verified on all queries
- [ ] Input validation active on all DTOs (`whitelist: true`, `forbidNonWhitelisted: true`)
- [ ] Helmet/security headers configured
- [ ] CORS properly restricted
- [ ] CSRF protection enabled
- [ ] Rate limiting configured and tested
- [ ] SQL injection impossible (Prisma parameterized queries verified)
- [ ] SSRF prevention in webhooks and external calls
- [ ] Prompt injection guardrails in place
- [ ] File upload validation (type, size, path traversal)
- [ ] Error messages don't leak sensitive information
- [ ] Audit logging for security events

## 2. Performance Checklist

- [ ] No N+1 query patterns in hot paths
- [ ] Missing indexes added and verified
- [ ] Prisma `SELECT *` replaced with selective field selection
- [ ] Redis caching for frequently accessed data
- [ ] Qdrant optimized (`batch_size`, `limit`, `collection_exists` removed)
- [ ] Real SSE streaming (not fake word-by-word)
- [ ] Circuit breakers for external services
- [ ] Memory limits configured for in-memory caches
- [ ] No synchronous I/O in async context
- [ ] Serialization optimized (no pretty-print in production)
- [ ] OpenAPI generation excluded from CI build

## 3. Scalability Checklist

- [ ] Horizontal scaling tested with multiple API replicas
- [ ] Database connection pooling configured
- [ ] No in-memory session affinity (works with multiple instances)
- [ ] Stateless API design verified
- [ ] Queue-based processing for heavy AI workloads
- [ ] Rate limiting per-tenant (not global)

## 4. Deployment Checklist

- [ ] Kubernetes manifests complete and tested
- [ ] Docker images optimized (multi-stage builds)
- [ ] CI/CD pipeline operational
- [ ] Database migrations tested (up and down)
- [ ] Blue-green or rolling deployment strategy documented
- [ ] Environment-specific configuration validated
- [ ] Production docker-compose.yml complete
- [ ] Health/readiness/liveness endpoints configured for K8s

## 5. Observability Checklist

- [ ] Structured JSON logging enabled
- [ ] Request tracing implemented (OpenTelemetry)
- [ ] Metrics exported (Prometheus format)
- [ ] Key business metrics defined and tracked
- [ ] Error tracking configured (Sentry)
- [ ] Centralized log aggregation
- [ ] Dashboards created for operations team
- [ ] Alerts configured for critical conditions

## 6. Backup & Recovery Checklist

- [ ] Automated database backups configured
- [ ] Backup retention policy documented
- [ ] Point-in-time recovery tested
- [ ] File storage (MinIO) backup strategy documented
- [ ] Qdrant backup strategy documented
- [ ] Recovery runbook written and tested
- [ ] RPO and RTO documented

## 7. Disaster Recovery Checklist

- [ ] Multi-region or multi-AZ strategy documented
- [ ] DNS failover configured
- [ ] Database read replicas configured
- [ ] Data replication lag monitored
- [ ] DR runbook tested at least once
- [ ] Contact list for incident response

## 8. Testing Checklist

- [ ] Unit test coverage ≥ 80% (all modules)
- [ ] Integration tests for critical paths
- [ ] E2E tests for happy paths
- [ ] Load tests conducted (target: X concurrent users)
- [ ] Security penetration test passed
- [ ] AI model evaluation passed (accuracy, hallucination rate)
- [ ] Edge cases tested (empty results, rate limits, timeouts)
- [ ] Concurrency tests passed (no race conditions, deadlocks)

## 9. AI Validation Checklist

- [ ] Real LLM call verified (not mock)
- [ ] RAG pipeline returns accurate results
- [ ] Citation engine correctly attributes sources
- [ ] Evidence chain intact and verifiable
- [ ] Hallucination guardrails functional
- [ ] Engineering guardrails verified for all calculation types
- [ ] Confidence scoring accurate
- [ ] Conflict resolution working for conflicting sources
- [ ] Agent execution pipeline tested end-to-end
- [ ] Streaming responses verified

## 10. Knowledge Validation Checklist

- [ ] Knowledge CRUD operations working correctly
- [ ] Taxonomy management verified
- [ ] Search returning correct results
- [ ] Version management tested
- [ ] Workflow approval process tested
- [ ] Translations working correctly
- [ ] Media attachments working

## 11. Documentation Checklist

- [ ] API documentation up to date (OpenAPI)
- [ ] Architecture documentation current
- [ ] Deployment guide complete
- [ ] Operations runbook complete
- [ ] Developer onboarding guide updated
- [ ] Disaster recovery plan documented
- [ ] Security policies documented
- [ ] Known issues documented

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead | | | |
| Security Lead | | | |
| DevOps Lead | | | |
| QA Lead | | | |
| AI Lead | | | |
