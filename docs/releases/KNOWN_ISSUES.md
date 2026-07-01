# Known Issues — Xennic Platform v0.5.0-alpha

**Last Updated**: Tir 1405 (June 2026)  
**Total Open Issues**: 15  

---

## Severity Classification

| Severity | Definition | Response Required |
|----------|-----------|-------------------|
| **HIGH** | Blocks core functionality or presents a security/critical risk | Resolve before production deployment |
| **MEDIUM** | Impacts non-critical functionality or degrades experience | Schedule for next sprint |
| **LOW** | Minor inconvenience, cosmetic, or nice-to-have | Prioritize as capacity allows |

---

## HIGH Severity Issues

### KI-001: Test Coverage Below 20%

- **Title**: Insufficient automated test coverage
- **Description**: Overall test coverage across the platform is approximately 18%. The NestJS API has unit tests for auth and select modules only. Python services have minimal test coverage. This creates significant regression risk for any code change.
- **Status**: Open
- **Workaround**: Run the full manual smoke test suite (`scripts/smoke-test.sh`) before every deployment. All changes must pass manual QA review.
- **Affected Component**: All services
- **Target Fix**: v0.6.0-beta

### KI-002: Slow npm Registry Builds in CI

- **Title**: npm/pnpm dependency resolution causes CI pipeline delays
- **Description**: The CI pipeline consistently experiences 3-5 minute delays during `pnpm install` due to dependency resolution overhead across the monorepo. This extends total build time to 12+ minutes.
- **Status**: Open
- **Workaround**: Use Docker layer caching to preserve `node_modules` between CI runs. Consider pnpm store configuration with caching.
- **Affected Component**: CI/CD Pipeline (GitHub Actions)
- **Target Fix**: v0.6.0-beta

### KI-003: jspdf CVE — Unpatched Vulnerability

- **Title**: Critical CVE in jspdf dependency (frontend)
- **Description**: The `jspdf` package used in the web frontend for PDF generation has a known CVE (CVE-2024-xxxx). The maintainer has not yet released a patched version compatible with the current API.
- **Status**: Open
- **Workaround**: PDF generation is isolated to the client side. No sensitive data is included in generated PDFs without user consent. Monitor for upstream patch.
- **Affected Component**: Next.js Web (`apps/web`)
- **Target Fix**: v0.6.0-beta

### KI-004: Storage Layer Not Battle-Tested

- **Title**: MinIO object storage lacks production validation
- **Description**: The MinIO storage backend has been configured and integrated but has not been tested under production load conditions. File upload throughput, concurrent access patterns, and retention policy enforcement are unverified.
- **Status**: Open
- **Workaround**: Keep file uploads under 50MB. Monitor MinIO logs and disk usage manually. No automated retention enforcement.
- **Affected Component**: NestJS API (StorageModule), MinIO
- **Target Fix**: v0.6.0-beta

### KI-005: VPS Production Environment Not Deployed

- **Title**: No VPS deployment or production hosting configured
- **Description**: The platform has not been deployed to any production VPS environment. All deployment testing has been performed on local Docker Compose stacks. DNS records (api.xennic.com, app.xennic.com) are not configured.
- **Status**: Open
- **Workaround**: The platform can be deployed on any Docker-capable Linux host. Follow `docs/runbooks/Deployment.md` for manual setup.
- **Affected Component**: Infrastructure / DevOps
- **Target Fix**: v0.6.0-beta

---

## MEDIUM Severity Issues

### KI-006: AI Response Caching Not Implemented

- **Title**: LLM responses and embeddings are not cached
- **Description**: Every identical AI query triggers a new LLM API call, resulting in unnecessary cost and latency. Embeddings are regenerated for repeated document chunks. No cache invalidation strategy is in place.
- **Status**: Open
- **Workaround**: No workaround. Each query is unique cost. Monitor API usage dashboards in Grafana.
- **Affected Component**: AI Service (`workspace/services/ai-service`)
- **Target Fix**: v0.6.0-beta

### KI-007: Redis Port Configuration Conflict

- **Title**: Redis port inconsistency between environment files
- **Description**: The root `.env` file specifies Redis on port `6379` while `infrastructure/docker/.env` specifies `6380`. This causes connection failures when switching between configurations or when both environments are active.
- **Status**: Open
- **Workaround**: Ensure all `REDIS_PORT` values are consistent. Recommended: use `6379` across all configurations.
- **Affected Component**: Configuration (environment files)
- **Target Fix**: v0.6.0-beta

### KI-008: No CDN for Static Assets

- **Title**: Web frontend static assets served directly without CDN
- **Description**: Next.js static assets (JavaScript bundles, CSS, fonts, images) are served directly from the application server without any CDN layer. This increases latency for users outside the deployment region and adds load to the application server.
- **Status**: Open
- **Workaround**: Configure Cloudflare or similar CDN in front of `app.xennic.com`. Currently not configured.
- **Affected Component**: Next.js Web, Infrastructure
- **Target Fix**: v0.6.0-beta

### KI-009: Vision OCR Accuracy Unverified

- **Title**: OCR accuracy for engineering documents has not been benchmarked
- **Description**: The 3-pass OCR pipeline (Tesseract default, PSM mode, custom) has not been systematically evaluated against a representative corpus of engineering documents. Persian text accuracy is estimated at ~85% based on anecdotal testing.
- **Status**: Open
- **Workaround**: For critical document processing, use the EasyOCR backend engine via `VISION_OCR_ENGINE_MODE=easyocr`. Manually verify OCR output for sensitive documents.
- **Affected Component**: Vision Service (`workspace/services/vision-service`)
- **Target Fix**: v0.6.0-beta

### KI-010: Rate Limiting Not Configured at Nginx Level

- **Title**: Nginx reverse proxy lacks rate limiting configuration
- **Description**: While application-level rate limiting is active via `@nestjs/throttler`, no rate limiting has been configured at the Nginx reverse proxy layer. This leaves the infrastructure exposed to DDoS and brute-force attacks at the network edge.
- **Status**: Open
- **Workaround**: Application-level throttling provides partial protection (5 req/min for auth, 10 req/10s global). Monitor traffic patterns in Grafana.
- **Affected Component**: Infrastructure (Nginx), NestJS API
- **Target Fix**: v0.6.0-beta

### KI-011: SMTP Not Configured for Production Email

- **Title**: Production email delivery not configured
- **Description**: Email sending (password reset, notifications) uses a console transport by default. No SMTP provider (SendGrid, SES, SMTP relay) has been configured for production email delivery.
- **Status**: Open
- **Workaround**: Set `MAIL_TRANSPORT=smtp` and configure `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` in `.env` with valid SMTP credentials.
- **Affected Component**: NestJS API (NotificationModule)
- **Target Fix**: v0.6.0-beta

### KI-012: Webhook Retry Mechanism Not Implemented

- **Title**: Outgoing webhooks lack retry logic for failed deliveries
- **Description**: When the platform sends webhooks to external services, failed deliveries are not retried. Network failures or temporary downstream outages result in permanent webhook data loss.
- **Status**: Open
- **Workaround**: Downstream services should implement their own polling as a fallback. Monitor webhook delivery logs in Loki.
- **Affected Component**: NestJS API (WebhookModule)
- **Target Fix**: v0.6.0-beta

### KI-013: API Documentation Unversioned

- **Title**: OpenAPI/Swagger documentation reflects only the latest schema
- **Description**: The generated OpenAPI specification at `packages/openapi/v1/openapi.json` is always overwritten with the latest schema. There is no versioned documentation (v1, v2) or changelog for API contract changes.
- **Status**: Open
- **Workaround**: Developers should diff the generated OpenAPI spec manually. Use git history to track changes.
- **Affected Component**: NestJS API (OpenAPI generation)
- **Target Fix**: v0.6.0-beta

---

## LOW Severity Issues

### KI-014: No Automated Rollback Procedure

- **Title**: Rollback process requires manual intervention
- **Description**: There is no automated rollback script or procedure. Rolling back a deployment requires manually reverting Docker Compose version tags, restoring database backups, and verifying service health.
- **Status**: Open
- **Workaround**: Follow `docs/runbooks/Rollback.md` for step-by-step manual rollback instructions. Target RTO: 10 minutes for SEV1 incidents.
- **Affected Component**: DevOps / Infrastructure
- **Target Fix**: v0.6.0-beta

### KI-015: No Performance Benchmarks

- **Title**: Platform performance baselines have not been established
- **Description**: No systematic performance benchmarking has been conducted. There are no established baselines for API latency, concurrent user capacity, maximum file upload size, or throughput under load. Capacity planning is based on estimates.
- **Status**: Open
- **Workaround**: Use Grafana dashboards to monitor current performance metrics. Establish manual baselines during load testing sessions.
- **Affected Component**: All services
- **Target Fix**: v0.6.0-beta

---

## Issue Summary

| Severity | Count | Issue IDs |
|----------|-------|-----------|
| **HIGH** | 5 | KI-001, KI-002, KI-003, KI-004, KI-005 |
| **MEDIUM** | 8 | KI-006, KI-007, KI-008, KI-009, KI-010, KI-011, KI-012, KI-013 |
| **LOW** | 2 | KI-014, KI-015 |
| **Total** | **15** | |

---

## Resolution Progress

| Fix Status | Count | Issues |
|-----------|-------|--------|
| Open | 15 | All KI-001 through KI-015 |
| In Progress | 0 | — |
| Resolved | 0 | — |

---

## Related Documents

| Document | Path |
|----------|------|
| Release Notes | `docs/releases/ALPHA_RELEASE_NOTES.md` |
| Production Readiness Audit | `docs/project/PRODUCTION_READINESS_AUDIT.md` |
| Technical Debt | `docs/project/TECHNICAL_DEBT.md` |
| Quality Dashboard | `docs/project/QUALITY_DASHBOARD.md` |
| Risk Register | `docs/project/RISK_REGISTER.md` |
| Known Limitations | `docs/project/KNOWN_LIMITATIONS.md` |

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Tir 1405 | Initial release — Alpha known issues catalog |
