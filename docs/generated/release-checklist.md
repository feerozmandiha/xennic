# Release Checklist

> Generated: 2026-07-08T07:38:44.325Z

## Database

| Item                       | Required     | Verified | Detail                             |
| -------------------------- | ------------ | -------- | ---------------------------------- |
| Database migrated          | **Required** | ✅ Yes   | Prisma schema consistency verified |
| Migration history complete | **Required** | ✅ Yes   | All migrations present             |

## Infrastructure

| Item                        | Required     | Verified | Detail                      |
| --------------------------- | ------------ | -------- | --------------------------- |
| Redis healthy               | **Required** | ⬜ No    | Verify via health endpoint  |
| RabbitMQ healthy            | **Required** | ⬜ No    | Verify via health endpoint  |
| Vision service healthy      | **Required** | ⬜ No    | Port 8003 health check      |
| AI service healthy          | **Required** | ⬜ No    | Port 8002 health check      |
| Engineering service healthy | **Required** | ⬜ No    | Port 8001 health check      |
| Search service healthy      | **Required** | ⬜ No    | Verify search endpoints     |
| Storage service healthy     | **Required** | ⬜ No    | Verify storage endpoints    |
| Outbox relay healthy        | **Required** | ⬜ No    | Event outbox polling active |

## Observability

| Item                           | Required     | Verified | Detail                         |
| ------------------------------ | ------------ | -------- | ------------------------------ |
| Health endpoints responding    | **Required** | ⬜ No    | GET /api/v1/health             |
| Distributed tracing configured | **Required** | ⬜ No    | OpenTelemetry spans            |
| Metrics endpoint active        | **Required** | ⬜ No    | Prometheus /metrics            |
| Correlation IDs propagated     | **Required** | ⬜ No    | All services forward trace IDs |

## Deployment

| Item                              | Required     | Verified | Detail                        |
| --------------------------------- | ------------ | -------- | ----------------------------- |
| Feature flags reviewed            | **Required** | ⬜ No    | Toggle configuration verified |
| Database backup taken             | **Required** | ⬜ No    | pg_dump completed             |
| Secrets available in vault        | **Required** | ⬜ No    | No secrets in env files       |
| TLS certificates valid            | **Required** | ⬜ No    | Not expired                   |
| Disaster recovery plan documented | **Required** | ⬜ No    | DR procedures current         |
| Rollback procedure tested         | **Required** | ⬜ No    | Previous version deployable   |
| Kubernetes manifests validated    | **Required** | ⬜ No    | kubectl apply --dry-run       |
| Monitoring dashboards updated     | **Required** | ⬜ No    | Grafana dashboards current    |
| Alerting rules configured         | **Required** | ⬜ No    | Alertmanager rules            |

## Code Quality

| Item                           | Required     | Verified | Detail          |
| ------------------------------ | ------------ | -------- | --------------- |
| Architecture validation passed | **Required** | ✅ Yes   | Zero violations |
| Typecheck passed               | **Required** | ✅ Yes   | No type errors  |
| Lint passed                    | **Required** | ✅ Yes   | No lint errors  |
| Unit tests passing             | **Required** | ✅ Yes   | All green       |
| E2E tests passing              | **Required** | ✅ Yes   | All green       |

## Documentation

| Item                      | Required     | Verified | Detail               |
| ------------------------- | ------------ | -------- | -------------------- |
| API docs generated        | **Required** | ✅ Yes   | OpenAPI spec present |
| ADR references valid      | **Required** | ✅ Yes   | All ADRs present     |
| Mermaid diagrams valid    | **Required** | ✅ Yes   | Syntax check         |
| Documentation links valid | **Required** | ✅ Yes   | No broken refs       |

---

## Sign-off

| Role             | Name | Date | Signature |
| ---------------- | ---- | ---- | --------- |
| Release Manager  |      |      |           |
| QA Lead          |      |      |           |
| Engineering Lead |      |      |           |
| DevOps Lead      |      |      |           |
