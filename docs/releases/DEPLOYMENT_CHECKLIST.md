# Deployment Checklist — Xennic Platform v0.5.0-alpha

**Target Environment**: Production VPS / Docker Host  
**Estimated Duration**: 45–60 minutes  
**Last Updated**: Tir 1405 (June 2026)

---

## Pre-Deployment

### Environment Variables & Configuration

- [ ] Copy production environment template:
  ```bash
  cp infrastructure/docker/compose/production/.env.production.template .env
  ```
- [ ] Generate strong passwords (24+ characters) for:
  - [ ] `POSTGRES_PASSWORD` — `openssl rand -base64 32`
  - [ ] `REDIS_PASSWORD` — `openssl rand -base64 32`
  - [ ] `RABBITMQ_DEFAULT_PASS` — `openssl rand -base64 32`
- [ ] Configure LLM API keys in `.env`:
  - [ ] `GROQ_API_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `GOOGLE_API_KEY`
- [ ] Set `CORS_ORIGINS` to production frontend domain (e.g., `https://app.xennic.com`)
- [ ] Set `API_PUBLIC_URL` to production API domain (e.g., `https://api.xennic.com`)
- [ ] Configure `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` if email sending is required
- [ ] Set `ZARINPAL_MERCHANT_ID` if payment processing is needed
- [ ] Verify all placeholder values (`CHANGE_ME_*`) have been replaced
- [ ] Validate `.env` with the Zod schema (application will fail-fast on startup)

### DNS & TLS Certificates

- [ ] DNS A records configured:
  - [ ] `api.xennic.com` → VPS IP address
  - [ ] `app.xennic.com` → VPS IP address
- [ ] DNS propagation verified (`dig api.xennic.com +short`)
- [ ] TLS certificates obtained via Let's Encrypt:
  ```bash
  sudo certbot certonly --standalone -d api.xennic.com -d app.xennic.com
  ```
- [ ] Certificates copied to `infrastructure/secrets/`:
  ```bash
  sudo cp /etc/letsencrypt/live/api.xennic.com/fullchain.pem infrastructure/secrets/
  sudo cp /etc/letsencrypt/live/api.xennic.com/privkey.pem infrastructure/secrets/
  ```
- [ ] Auto-renewal configured (systemd timer or cron):
  ```bash
  sudo systemctl enable certbot.timer
  sudo systemctl start certbot.timer
  ```
- [ ] Self-signed fallback generated (for initial testing):
  ```bash
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout infrastructure/secrets/selfsigned.key \
    -out infrastructure/secrets/selfsigned.crt \
    -subj "/CN=xennic.local"
  ```

### Secrets & Security

- [ ] JWT RSA key pair generated:
  ```bash
  mkdir -p infrastructure/secrets
  ssh-keygen -t rsa -b 4096 -m PEM -f infrastructure/secrets/jwtRS256.key -N ""
  openssl rsa -in infrastructure/secrets/jwtRS256.key -pubout -outform PEM \
    -out infrastructure/secrets/jwtRS256.key.pub
  chmod 600 infrastructure/secrets/jwtRS256.key
  ```
- [ ] Docker Secrets configured (alternative to env vars for sensitive values):
  ```
  infrastructure/secrets/jwtRS256.key
  infrastructure/secrets/postgres_password.txt
  infrastructure/secrets/redis_password.txt
  ```
- [ ] `.env` file permissions set to `600`: `chmod 600 .env`
- [ ] Verify no secrets in git history: `git log --all -p | grep -i "password\|secret\|key"`
- [ ] Firewall configured (ufw/iptables):
  ```bash
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw allow 22/tcp
  sudo ufw enable
  ```
- [ ] fail2ban installed and configured:
  ```bash
  sudo apt install fail2ban
  sudo systemctl enable fail2ban
  sudo systemctl start fail2ban
  ```

### Docker Registry Access

- [ ] Docker installed (v24+): `docker --version`
- [ ] Docker Compose v2+ installed: `docker compose version`
- [ ] Logged in to container registry (if using private registry):
  ```bash
  echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$USERNAME" --password-stdin
  ```
- [ ] Sufficient disk space verified: `df -h` (recommended: >50GB free)

### Pre-Deployment Backup

- [ ] Database backup taken (if upgrading existing deployment):
  ```bash
  bash scripts/db-backup.sh
  ```
- [ ] Current image versions recorded:
  ```bash
  docker images --format "{{.Repository}}:{{.Tag}}" | grep xennic > current_images.txt
  ```
- [ ] Current git commit recorded:
  ```bash
  git log --oneline -1 > current_commit.txt
  ```

---

## Deployment

### Pull Images (or Build Locally)

**Option A: Pull pre-built images (recommended)**

```bash
docker compose -f infrastructure/docker/compose/production/docker-compose.yml pull
```

**Option B: Build locally**

- [ ] Build all services:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml build --parallel
  ```

### Start Infrastructure Services

Start in dependency order:

- [ ] Start PostgreSQL:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d postgres
  ```
- [ ] Wait for PostgreSQL health: `docker compose ps postgres | grep healthy`

- [ ] Start PgBouncer:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d pgbouncer
  ```

- [ ] Start Redis:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d redis
  ```

- [ ] Start RabbitMQ:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d rabbitmq
  ```

- [ ] Start MinIO:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d minio
  ```

- [ ] Verify all infrastructure services healthy:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml ps
  ```

### Start Application Services

- [ ] Run database migrations:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml run --rm api npx prisma migrate deploy
  ```

- [ ] Verify migration output (no errors, all migrations applied).

- [ ] Start Engineering Service:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d engineering
  ```

- [ ] Start AI Service:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d ai
  ```

- [ ] Start Vision Service:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d vision
  ```

- [ ] Start NestJS API:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d api
  ```

- [ ] Start Next.js Web:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d web
  ```

### Start Nginx Reverse Proxy

- [ ] Start Nginx:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d nginx
  ```

### Start Monitoring Stack

- [ ] Start Prometheus:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d prometheus
  ```

- [ ] Start Grafana:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d grafana
  ```

- [ ] Start Loki:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d loki
  ```

- [ ] Start Promtail:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d promtail
  ```

### Verify All Services Running

- [ ] Run final status check:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml ps
  ```
  Expected: all services `Up (healthy)`

---

## Post-Deployment

### Health Checks

- [ ] API health endpoint:
  ```bash
  curl -s http://localhost:3000/api/v1/health | jq .
  ```
  Expected: `{ "success": true, "data": { "status": "ok", "services": {...} } }`

- [ ] Web frontend accessible:
  ```bash
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3001
  ```
  Expected: `200`

- [ ] Engineering service health:
  ```bash
  curl -s http://localhost:8001/health | jq .
  ```

- [ ] AI service health:
  ```bash
  curl -s http://localhost:8002/health | jq .
  ```

- [ ] Vision service health:
  ```bash
  curl -s http://localhost:8003/health | jq .
  ```

- [ ] Nginx reverse proxy (external endpoint):
  ```bash
  curl -s -o /dev/null -w "%{http_code}" https://api.xennic.com/api/v1/health
  ```
  Expected: `200`

- [ ] Prometheus targets:
  ```bash
  curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets | length'
  ```
  Expected: all configured targets `UP`

### Smoke Tests

- [ ] Run automated smoke test suite:
  ```bash
  bash scripts/smoke-test.sh
  ```
  Expected: All tests PASS

- [ ] Manual smoke tests:
  - [ ] Register a new user: `POST /api/v1/auth/register`
  - [ ] Login: `POST /api/v1/auth/login`
  - [ ] Create workspace: `POST /api/v1/workspaces`
  - [ ] Run engineering calculation: `POST /api/v1/engineering/analysis/motor`
  - [ ] Upload file: `POST /api/v1/storage/upload`
  - [ ] Query AI: `POST /api/v1/ai/chat`
  - [ ] Process document with OCR: `POST /api/v1/vision/ocr`

### Backup Verification

- [ ] Run backup script:
  ```bash
  bash scripts/db-backup.sh
  ```
- [ ] Verify backup file created and non-empty:
  ```bash
  ls -lh backups/
  ```

### Monitoring Validation

- [ ] Grafana dashboard accessible:
  ```bash
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
  ```
  Expected: `200` (Grafana login page)

- [ ] Prometheus targets all UP:
  ```bash
  curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | select(.health=="up") | .labels.instance'
  ```

- [ ] Logs reaching Loki:
  ```bash
  curl -s "http://localhost:3100/loki/api/v1/query_range" --data-urlencode 'query={job="api"}' | jq '.data.result | length'
  ```
  Expected: > 0

- [ ] Verify no ERROR logs in last 5 minutes:
  ```bash
  curl -s "http://localhost:3100/loki/api/v1/query_range" --data-urlencode 'query={job=~".+"} |= "ERROR"' | jq '.data.result | length'
  ```

### Final Verification

- [ ] SSL Labs test (if public): visit `https://www.ssllabs.com/ssltest/analyze.html?d=api.xennic.com`
  Expected: Grade A or higher

- [ ] Disk usage acceptable:
  ```bash
  df -h /
  ```
  Expected: < 80% usage

- [ ] Memory usage acceptable:
  ```bash
  docker stats --no-stream --format "table {{.Name}}\t{{.MemPerc}}"
  ```
  Expected: each service < 85%

- [ ] API response time:
  ```bash
  time curl -s https://api.xennic.com/api/v1/health
  ```
  Expected: < 500ms

---

## Rollback Procedure

### When to Rollback

Rollback immediately if any of the following are true:

| Condition | Threshold |
|-----------|-----------|
| API health check fails | > 3 minutes from deploy |
| Error rate spike | > 5% 5xx responses |
| Database migration error | Schema mismatch or data loss |
| Critical performance degradation | Latency > 2x baseline |
| Security vulnerability discovered | In newly deployed version |
| Container crash loop | Container restarting more than 3 times/minute |

### Rollback Steps

- [ ] **Step 1**: Stop affected services:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml down api web
  ```

- [ ] **Step 2**: Revert Docker image tags to previous version:
  ```bash
  # Edit docker-compose.yml and change image tags
  vim infrastructure/docker/compose/production/docker-compose.yml
  ```

- [ ] **Step 3**: Pull and restart previous versions:
  ```bash
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml pull api web
  docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d api web
  ```

- [ ] **Step 4**: If database migration was applied, restore from backup:
  ```bash
  bash scripts/db-restore.sh backups/pre_deploy_backup_$(date +%Y%m%d).dump
  ```

- [ ] **Step 5**: Verify rollback success:
  ```bash
  bash scripts/smoke-test.sh
  ```

- [ ] **Step 6**: Document the incident and root cause.

> Full rollback details: `docs/runbooks/Rollback.md`

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **DevOps Lead** | ___________ | ___________ | ___________ |
| **QA Lead** | ___________ | ___________ | ___________ |
| **Tech Lead** | ___________ | ___________ | ___________ |
| **Product Owner** | ___________ | ___________ | ___________ |

---

## Related Documents

| Document | Path |
|----------|------|
| Deployment Runbook | `docs/runbooks/Deployment.md` |
| Rollback Runbook | `docs/runbooks/Rollback.md` |
| Infrastructure Spec | `infrastructure/XENNIC_INFRASTRUCTURE_SPEC_v1.md` |
| Environment Variables | `deployment/ENVIRONMENT_VARIABLES.md` |
| Nginx Configuration | `deployment/NGINX.md` |
| HTTPS Configuration | `deployment/HTTPS.md` |
| Server Setup | `deployment/SERVER_SETUP.md` |
| Disaster Recovery | `docs/runbooks/Disaster-Recovery.md` |
| Incident Response | `docs/runbooks/Incident-Response.md` |
| Production Readiness Audit | `docs/project/PRODUCTION_READINESS_AUDIT.md` |
