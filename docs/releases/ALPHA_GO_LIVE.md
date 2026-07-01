# Alpha Go-Live Runbook — Xennic Platform v0.5.0-alpha

**Version**: 1.0.0  
**Status**: Pre-Flight  
**Last Updated**: Tir 1405 (June 2026)  

> This runbook documents the complete go-live procedure, monitoring thresholds, incident response protocols, and team coordination for the Xennic Alpha release.

---

## 1. Pre-Flight Checklist

This checklist must be completed **before** the go-live window. It syncs with `docs/releases/DEPLOYMENT_CHECKLIST.md` — refer to that document for detailed commands.

### 1.1 Environment & Configuration

- [ ] Production `.env` file populated and validated (no `CHANGE_ME_*` placeholders)
- [ ] All passwords generated (PostgreSQL, Redis, RabbitMQ) — 24+ characters each
- [ ] LLM API keys configured (Groq, OpenAI, Anthropic, Google)
- [ ] CORS origins set to production domains
- [ ] SMTP credentials configured (or console transport accepted as known limitation)
- [ ] Zarinpal merchant ID configured (if payment processing required)
- [ ] `.env` file permissions set to `600`

### 1.2 DNS & Networking

- [ ] `api.xennic.com` resolves to VPS IP: `dig api.xennic.com +short`
- [ ] `app.xennic.com` resolves to VPS IP: `dig app.xennic.com +short`
- [ ] SSL certificates obtained from Let's Encrypt and copied to `infrastructure/secrets/`
- [ ] Auto-renewal configured: `sudo systemctl status certbot.timer`
- [ ] Firewall rules applied: ports 80, 443, 22 only from internet
- [ ] fail2ban installed and active

### 1.3 Secrets & Security

- [ ] JWT RSA key pair generated and placed in `infrastructure/secrets/`
- [ ] Docker Secrets configured for sensitive values
- [ ] Git history free of credentials (verified with `git log --all -p | grep -i "password\|secret\|key"`)
- [ ] Swagger disabled in production (`NODE_ENV=production`)
- [ ] Helmet security headers active (14 headers verified)

### 1.4 Infrastructure

- [ ] Docker 24+ installed and Docker daemon running
- [ ] Docker Compose v2+ installed
- [ ] Sufficient disk space: `df -h` (>50GB free)
- [ ] Sufficient memory: `free -h` (>8GB available for all services)
- [ ] Docker registry accessible: `docker login ghcr.io` (or equivalent)

### 1.5 Team & Communication

- [ ] Go-live team assembled and roles assigned
- [ ] Communication channels verified (Slack, PagerDuty, on-call phone)
- [ ] Stakeholders notified of go-live window
- [ ] Rollback procedure reviewed by the team
- [ ] Incident response plan reviewed by the team
- [ ] Monitoring dashboards prepared and shared with the team

---

## 2. Monitoring Thresholds & Alerts

### 2.1 Service Health Thresholds

| Metric | Warning (Yellow) | Critical (Red) | Evaluation Window | Action |
|--------|-----------------|----------------|-------------------|--------|
| **CPU Usage** (any service) | > 70% | > 80% | 5 minutes | Investigate, scale if sustained |
| **Memory Usage** (any service) | > 75% | > 85% | 5 minutes | Restart service or scale up |
| **Disk Usage** (host) | > 70% | > 80% | 15 minutes | Clean logs, expand volume |
| **API Latency** (p95) | > 1s | > 2s | 5 minutes | Check DB, Redis, upstream services |
| **Error Rate** (5xx) | > 1% | > 3% | 5 minutes | Rollback if new deploy; investigate otherwise |
| **Health Check Failures** | 1 failure | 3 consecutive failures | 1 minute | Restart container; rollback if persists |
| **PostgreSQL Connections** | > 50 | > 80 | 5 minutes | Check PgBouncer, increase pool size |
| **Redis Memory** | > 70% | > 85% | 5 minutes | Flush cache or increase maxmemory |
| **RabbitMQ Queue Depth** | > 1000 | > 5000 | 5 minutes | Scale workers or investigate consumer |
| **MinIO Storage** | > 70% | > 85% | 15 minutes | Clean old files or expand storage |

### 2.2 Prometheus Alert Rules (pre-configured)

```yaml
# Alert rules deployed in Prometheus
groups:
  - name: xennic-alerts
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels: { severity: critical }
        annotations:
          summary: "{{ $labels.job }} is down"

      - alert: HighCpuUsage
        expr: avg by (container) (rate(container_cpu_usage_seconds_total[5m])) > 0.8
        for: 5m
        labels: { severity: warning }
        annotations:
          summary: "{{ $labels.container }} CPU > 80%"

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.85
        for: 5m
        labels: { severity: warning }
        annotations:
          summary: "{{ $labels.container }} memory > 85%"

      - alert: HighApiLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels: { severity: critical }
        annotations:
          summary: "API p95 latency > 2s"

      - alert: HighErrorRate
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.03
        for: 5m
        labels: { severity: critical }
        annotations:
          summary: "Error rate > 3%"
```

### 2.3 Grafana Dashboards

| Dashboard | Purpose | Key Panels |
|-----------|---------|------------|
| **System Health** | Overall platform status | Service up/down, CPU, memory, disk per host |
| **API Performance** | NestJS API metrics | Request rate, latency p50/p95/p99, error rate, endpoint heatmap |
| **Engineering Service** | Calculation engine | Requests per calculator, calculation duration, error rate |
| **AI Service** | LLM and RAG metrics | Tokens consumed, latency per provider, cache hit ratio, cost per query |
| **Vision Service** | OCR/document pipeline | Documents processed, OCR confidence distribution, processing time |
| **Infrastructure** | PostgreSQL, Redis, RabbitMQ | Connection count, queue depth, cache hit ratio, replication lag |
| **Business Metrics** | Platform KPIs | Active users, workspaces created, calculations run, revenue |

---

## 3. Incident Response

### 3.1 Severity Levels

| Level | Definition | Examples | Response Time | Mitigation Target |
|-------|-----------|----------|--------------|-------------------|
| **SEV1** | Complete service outage or data loss | API down, DB corruption, security breach | 5 minutes | 15 minutes |
| **SEV2** | Partial service degradation | Slow performance, one service down, feature broken | 15 minutes | 60 minutes |
| **SEV3** | Non-critical bugs or minor issues | UI glitch, incorrect calculation for edge case | 60 minutes | 1 business day |
| **SEV4** | Informational / requests | Feature requests, documentation feedback | 1 business day | Next sprint |

### 3.2 Incident Lifecycle

```
Detection → Triage → Containment → Eradication → Recovery → Post-mortem
```

### 3.3 Detection Sources

| Source | Tool | Action |
|--------|------|--------|
| Prometheus Alert | Alertmanager → Slack/PagerDuty | Acknowledge within 5 minutes |
| Grafana Dashboard | Manual review | Investigate anomalies |
| User Report | GitHub Issues / Support ticket | Confirm and escalate |
| Log Pattern | Loki alert | Query logs and identify root cause |
| Uptime Monitor | Health check endpoint | Verify service accessibility |

### 3.4 Triage & Escalation

Immediate actions upon incident notification:

1. **Acknowledge** the alert in PagerDuty / Slack within 5 minutes
2. **Assess severity** using the severity table above
3. **Declare incident** with unique ID:
   ```bash
   INCIDENT_ID="INC-$(date +%Y%m%d-%H%M%S)"
   ```
4. **Post initial status** to `#incidents` Slack channel
5. **Create war room** (Slack channel `#incidents-war-room` + voice call if SEV1)
6. **Assign roles**: Incident Commander, Comms Lead, Technical Lead
7. **Begin mitigation** following runbook for the specific scenario

### 3.5 Escalation Path

```
┌─────────────────┐
│  On-Call Engineer │ ── 5 min response ──→ Triage & Mitigation
└────────┬────────┘
         │ unresolved after 15 min
         ▼
┌─────────────────┐
│  DevOps Lead     │ ── coordinate cross-team response
└────────┬────────┘
         │ unresolved after 30 min
         ▼
┌─────────────────┐
│  Tech Lead       │ ── architecture decisions, rollback authority
└────────┬────────┘
         │ unresolved after 60 min
         ▼
┌─────────────────┐
│  CTO / VP Eng    │ ── executive escalation, business decisions
└─────────────────┘
```

### 3.6 Communication Templates

#### Initial Incident Notification

```
🚨 [SEV<LEVEL>] <INCIDENT_ID> — <BRIEF TITLE>

Description: <brief description of the issue>
Impact: <affected services, users, features>
Time Detected: <UTC timestamp>
Severity: SEV<LEVEL>
Status: Investigating / Mitigating / Resolved
Lead: <person name>

Channel: #incidents-war-room
```

#### Status Update (every 30 minutes until resolved)

```
🔵 <INCIDENT_ID> — Status Update #<N>

Time: <UTC timestamp>
Duration: <elapsed time>
What we know: <update on investigation findings>
Action taken: <mitigation steps completed>
Next steps: <planned actions>
ETA: <estimated resolution time or "TBD">
```

#### Resolution Notice

```
✅ <INCIDENT_ID> — RESOLVED

Time Resolved: <UTC timestamp>
Total Duration: <duration>
Root Cause: <one-line explanation>
Action Taken: <summary of fix>
Monitoring: <what to watch for next 24 hours>
Post-mortem: <link to post-mortem document>
```

---

## 4. Rollback Decision Criteria

### 4.1 When to Rollback

Rollback must be initiated immediately (within 5 minutes) when ANY of the following conditions are met:

| Condition | Threshold | Decision |
|-----------|-----------|----------|
| Health check failure | 3+ consecutive failures for any core service | **Rollback** |
| Error rate spike | > 5% 5xx responses over 5 minutes | **Rollback** |
| Data integrity issue | Schema mismatch, data loss, corruption detected | **Rollback** |
| Performance regression | API latency > 3x baseline for 10+ minutes | **Rollback** |
| Security vulnerability | Active exploitation or P0 vulnerability in new code | **Rollback** |
| Crash loop | Container restarting > 3 times/minute | **Rollback** |

### 4.2 When NOT to Rollback

| Condition | Alternative Action |
|-----------|-------------------|
| Cosmetic UI issue | File bug, fix in next hotfix |
| Feature flag can disable | Disable feature, file bug |
| Non-critical feature broken | Document known issue, fix in next sprint |
| Minor calculation inaccuracy | Log issue, patch in hotfix |

### 4.3 Rollback Authority

| Role | Can Initiate Rollback? |
|------|----------------------|
| On-Call Engineer | Yes (SEV1/SEV2 only) |
| DevOps Lead | Yes |
| Tech Lead | Yes |
| Incident Commander | Yes |
| Product Owner | No (must request via Tech Lead) |

---

## 5. Post-Mortem Process

### 5.1 Timeline

| Phase | When | Activity |
|-------|------|----------|
| **Incident Active** | During incident | Log all actions, decisions, timestamps in `#incidents-war-room` |
| **Immediate Review** | Within 24 hours of resolution | Initial debrief, collect logs and metrics |
| **Post-Mortem Draft** | Within 48 hours | Draft document with timeline, root cause, action items |
| **Post-Mortem Review** | Within 72 hours | Team review, assign action items, update runbooks |
| **Action Items Closed** | Within 2 weeks | Verify fixes, update monitoring, close items |

### 5.2 Post-Mortem Document Template

```markdown
# Post-Mortem: <INCIDENT_ID>

## Incident Summary
- **Date**: YYYY-MM-DD
- **Duration**: HH:MM (detection → resolution)
- **Severity**: SEV<LEVEL>
- **Impact**: <affected services, users, data>

## Timeline (UTC)
| Time | Event |
|------|-------|
| HH:MM | Incident detected |
| HH:MM | Incident declared |
| HH:MM | Mitigation started |
| HH:MM | Service restored |
| HH:MM | Monitoring confirmed stable |

## Root Cause
<detailed technical explanation>

## Contributing Factors
- Factor 1
- Factor 2

## What Went Well
- 

## What Went Wrong
- 

## Action Items
| # | Action | Owner | Due Date | Status |
|---|--------|-------|----------|--------|
| 1 | | | | Open |
| 2 | | | | Open |

## Prevention
<how to prevent recurrence>

## Related Documents
- Runbook updates needed: <link>
- Monitoring improvements: <link>
```

---

## 6. Team Contact List

| Role | Name | Contact | Backup |
|------|------|---------|--------|
| **DevOps Lead** | ___________ | ___________ | ___________ |
| **Tech Lead** | ___________ | ___________ | ___________ |
| **Security Lead** | ___________ | ___________ | ___________ |
| **Backend Lead** | ___________ | ___________ | ___________ |
| **Frontend Lead** | ___________ | ___________ | ___________ |
| **QA Lead** | ___________ | ___________ | ___________ |
| **Product Owner** | ___________ | ___________ | ___________ |
| **On-Call Engineer** | ___________ | ___________ | ___________ |

### Communication Channels

| Channel | Purpose | Access |
|---------|---------|--------|
| `#incidents` | Incident announcements (read-only for non-participants) | All team members |
| `#incidents-war-room` | Technical coordination during incidents | DevOps, Engineering leads |
| `#engineering` | General engineering discussion | Engineering team |
| `#devops` | Infrastructure and deployment discussion | DevOps team |
| On-call phone | Emergency escalation | DevOps Lead, Tech Lead |
| PagerDuty | Automated alert notification | On-call engineer |

---

## 7. Go-Live Window

| Phase | Activity | Duration | Owner |
|-------|----------|----------|-------|
| **T-24h** | Final pre-flight checklist review | 1 hour | DevOps Lead |
| **T-12h** | Infrastructure verification, backup test | 2 hours | DevOps Lead |
| **T-6h** | Stakeholder notification, team standup | 30 min | Tech Lead |
| **T-2h** | Final DNS check, SSL validation | 30 min | DevOps Lead |
| **T-0** | Begin deployment (DEPLOYMENT_CHECKLIST.md) | 1 hour | DevOps Lead |
| **T+1h** | Smoke tests complete, monitoring verified | 30 min | QA Lead |
| **T+2h** | Go/No-Go decision | 15 min | Tech Lead |
| **T+4h** | First status update to stakeholders | 15 min | Product Owner |
| **T+24h** | Go-live retrospective | 1 hour | All leads |

### Go/No-Go Decision

All of the following must be TRUE for a **GO** decision:

- [ ] All pre-flight checklist items complete
- [ ] All services healthy (health checks pass)
- [ ] Smoke tests pass
- [ ] Monitoring dashboards showing data
- [ ] No SEV1/SEV2 incidents active from previous deployment
- [ ] Rollback procedure ready and team briefed
- [ ] Stakeholders notified

---

## 8. Post-Go-Live Verification (48-Hour Watch)

- [ ] **Hour 1**: Monitor all dashboards continuously
- [ ] **Hour 2**: Run full smoke test suite
- [ ] **Hour 4**: Verify backup completed successfully
- [ ] **Hour 8**: Review error logs, check for anomalies
- [ ] **Hour 12**: Verify auto-renewal of SSL (if applicable)
- [ ] **Hour 24**: Review performance metrics vs. baseline
- [ ] **Hour 48**: Final stability sign-off; transition to normal operations

---

## 9. Communication Plan

| Audience | When | Channel | Message |
|----------|------|---------|---------|
| **Engineering Team** | T-24h | Slack `#engineering` | Go-live schedule, roles, runbook links |
| **Stakeholders** | T-6h | Email | Go-live time, expected downtime, rollout plan |
| **All Team** | T-0 | Slack `#general` | Deploy started, expected completion time |
| **All Team** | T+1h | Slack `#general` | Deploy complete, monitoring active |
| **Stakeholders** | T+2h | Email | Go-live completed, summary of what shipped |
| **All Team** | T+24h | Slack `#general` | First day retrospective, stability report |

---

## 10. Emergency Contacts

| Service | Contact | Notes |
|---------|---------|-------|
| **VPS Provider** | ___________ | Support portal / phone |
| **DNS Provider** | ___________ | Support portal |
| **SSL Provider** | Let's Encrypt community | Self-serve (certbot) |
| **Docker Registry** | ___________ | GitHub support if ghcr.io |
| **LLM Providers** | Groq, OpenAI, Anthropic dashboards | API key management |

---

## Related Documents

| Document | Path |
|----------|------|
| Deployment Checklist | `docs/releases/DEPLOYMENT_CHECKLIST.md` |
| Release Notes | `docs/releases/ALPHA_RELEASE_NOTES.md` |
| Known Issues | `docs/releases/KNOWN_ISSUES.md` |
| Deployment Runbook | `docs/runbooks/Deployment.md` |
| Rollback Runbook | `docs/runbooks/Rollback.md` |
| Incident Response | `docs/runbooks/Incident-Response.md` |
| Disaster Recovery | `docs/runbooks/Disaster-Recovery.md` |
| Production Readiness Audit | `docs/project/PRODUCTION_READINESS_AUDIT.md` |
| Release Gate | `docs/releases/ALPHA_RELEASE_GATE.md` |
| Security Checklist | `docs/releases/ALPHA_SECURITY_CHECKLIST.md` |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **DevOps Lead** | ___________ | ___________ | ___________ |
| **Tech Lead** | ___________ | ___________ | ___________ |
| **Security Lead** | ___________ | ___________ | ___________ |
| **Product Owner** | ___________ | ___________ | ___________ |

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Tir 1405 | Initial Alpha go-live runbook |
