# Xennic — First Deployment Runbook

**Version**: 1.0.0 | **Status**: Active | **Last Updated**: Tir 1405 (June 2026)

> For a new DevOps engineer deploying Xennic for the first time. VPS must be prepared per
> [VPS_PREPARATION_GUIDE.md](../deployment/VPS_PREPARATION_GUIDE.md).

Related: [Deployment Checklist](../releases/DEPLOYMENT_CHECKLIST.md) · [Rollback](Rollback.md) ·
[Disaster Recovery](Disaster-Recovery.md)

---

## 1. Overview

### 1.1 Architecture

```
                            ┌──────────────┐
                            │   Internet   │
                            └──────┬───────┘
                                   │ :80 / :443
                                   ▼
                          ┌────────────────┐
                          │  Nginx (80/443) │
                          │  Reverse Proxy  │
                          └────┬───────────┘
                 ┌─────────────┼──────────────┐
                 ▼             ▼              ▼
         ┌────────────┐ ┌───────────┐ ┌──────────────┐
         │ NestJS API │ │ Next.js  │ │  Engineering │
         │  :3000     │ │ Web:3001 │ │  FastAPI:8001│
         └──────┬─────┘ └──────────┘ └──────┬───────┘
                │                           │
                ▼                           ▼
         ┌────────────┐             ┌──────────────┐
         │  AI Service│             │ Vision Svc   │
         │  FastAPI   │             │ FastAPI:8003 │
         │  :8002     │             └──────────────┘
         └──────┬─────┘
                │
         ┌──────┴──────────────────┬──────────────┐
         ▼                         ▼              ▼
  ┌──────────────┐          ┌───────────┐  ┌──────────────┐
  │ PostgreSQL17 │          │  Redis 8  │  │  RabbitMQ 4  │
  │  :5432       │          │  :6379    │  │  :5672/15672 │
  └──────┬───────┘          └───────────┘  └──────────────┘
         │
  ┌──────┴───────┐          ┌───────────┐
  │  PgBouncer   │          │   MinIO   │
  │   :6432      │          │ :9000/9001│
  └──────────────┘          └───────────┘

  ┌────────────────────────────────────────────────────┐
  │  Monitoring: Prometheus:9090  Grafana:3002  Loki:3100  │
  └────────────────────────────────────────────────────┘
```

### 1.2 Port Mapping

| Service | Port | Function |
|---------|------|----------|
| Nginx | 80/443 | HTTP/HTTPS reverse proxy |
| NestJS API | 3000 | REST API (Fastify) |
| Next.js Web | 3001 | Frontend application |
| Engineering | 8001 | Engineering calcs (FastAPI) |
| AI Service | 8002 | LLM orchestration (FastAPI) |
| Vision Service | 8003 | OCR/analysis (FastAPI) |
| PostgreSQL | 5432 | Primary database |
| PgBouncer | 6432 | Connection pooling |
| Redis | 6379 | Cache/session/queue |
| RabbitMQ | 5672/15672 | Message broker + UI |
| MinIO | 9000/9001 | S3 storage + console |
| Prometheus | 9090 | Metrics |
| Grafana | 3002 | Dashboards |
| Loki | 3100 | Log aggregation |

All services share one Docker bridge network: `xennic-network`. Services reach each other by container
name (e.g., `postgres:5432`, `redis:6379`, `pgbouncer:6432`). API connects through PgBouncer, not
directly to Postgres.

---

## 2. Prerequisites

- **VPS**: Ubuntu 24.04, 4 CPU / 8GB RAM / 100GB SSD, Docker 24+, Compose v2+
- **DNS**: `api.xennic.com` and `app.xennic.com` A records → VPS IP
- **TLS**: Let's Encrypt certs for both domains
- **Tools**: `git`, `openssl`, `jq`, MinIO Client (`mc`)

```bash
# Quick tool check
which docker docker compose git openssl curl jq || sudo apt install -y jq

# Install mc if missing
which mc || (curl -fsSL https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/local/bin/mc \
  && chmod +x /usr/local/bin/mc)

# TLS certs
sudo certbot certonly --standalone -d api.xennic.com -d app.xennic.com
sudo cp /etc/letsencrypt/live/api.xennic.com/{fullchain.pem,privkey.pem} infrastructure/secrets/
sudo chmod 600 infrastructure/secrets/privkey.pem
sudo systemctl enable --now certbot.timer
```

---

## 3. Initial Setup

```bash
# Clone
git clone git@github.com:anomalyco/xennic.git /home/xennic/app
cd /home/xennic/app

# Environment
cp infrastructure/docker/compose/production/.env.production.example \
   infrastructure/docker/compose/production/.env
```

**Generate secrets:**
```bash
openssl rand -base64 32  # → POSTGRES_PASSWORD, REDIS_PASSWORD, RABBITMQ_DEFAULT_PASS
```

Edit `infrastructure/docker/compose/production/.env` — replace all `CHANGE_ME_*` values:

| Variable | Notes |
|----------|-------|
| `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `RABBITMQ_DEFAULT_PASS` | 24+ chars each |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | Choose / generate |
| `API_PUBLIC_URL` | `https://api.xennic.com` |
| `FRONTEND_URL` / `CORS_ORIGINS` | `https://app.xennic.com` |
| `GROQ_API_KEY`, `OPENAI_API_KEY`, etc. | From provider consoles |
| `GRAFANA_ADMIN_PASSWORD` | Choose |

```bash
chmod 600 infrastructure/docker/compose/production/.env
```

**JWT RSA key pair (Docker secrets):**
```bash
mkdir -p infrastructure/secrets
ssh-keygen -t rsa -b 4096 -m PEM -f infrastructure/secrets/jwtRS256.key -N ""
openssl rsa -in infrastructure/secrets/jwtRS256.key -pubout -outform PEM \
  -out infrastructure/secrets/jwtRS256.key.pub
chmod 600 infrastructure/secrets/jwtRS256.key
```

**SSL certs for Nginx:**
```bash
mkdir -p infrastructure/nginx/ssl
cp infrastructure/secrets/{fullchain.pem,privkey.pem} infrastructure/nginx/ssl/
chmod 644 infrastructure/nginx/ssl/fullchain.pem
chmod 600 infrastructure/nginx/ssl/privkey.pem
```

---

## 4. Infrastructure Deployment

Set this alias for brevity:

```bash
COMPOSE_FILE="infrastructure/docker/compose/production/docker-compose.yml"
```

### 4.1 Databases & Message Queue

```bash
docker compose -f $COMPOSE_FILE up -d postgres redis rabbitmq
docker compose -f $COMPOSE_FILE ps | grep -E "postgres|redis|rabbitmq"
```

Expected: all three show `Up (healthy)`. If not, check logs:
`docker compose -f $COMPOSE_FILE logs postgres --tail 50`

### 4.2 Storage & Connection Pooling

```bash
docker compose -f $COMPOSE_FILE up -d minio pgbouncer
docker compose -f $COMPOSE_FILE ps | grep -E "minio|pgbouncer"
```

### 4.3 Initialize MinIO Buckets

```bash
chmod +x scripts/minio-setup.sh
bash scripts/minio-setup.sh
```

Expected: 5 buckets created (uploads, calculations, backups, ai-models, public), versioning
enabled on backups & ai-models.

> **Note**: Script waits up to 60s for MinIO to be ready. If it fails, run
> `docker compose -f $COMPOSE_FILE logs minio` to diagnose.

### 4.4 Verify Infrastructure

```bash
docker compose -f $COMPOSE_FILE ps
```

All five must be `Up (healthy)`: postgres, redis, rabbitmq, minio, pgbouncer.

---

## 5. Application Deployment

### 5.1 Build or Pull Images

```bash
# Option A — pull pre-built (recommended)
docker compose -f $COMPOSE_FILE pull

# Option B — build locally (~5-15 min)
docker compose -f $COMPOSE_FILE build --parallel
```

### 5.2 Database Migrations

```bash
docker compose -f $COMPOSE_FILE run --rm api sh -c "npx prisma migrate deploy"
```

Expected output ends with: `✔ All migrations have been applied successfully`

> **Critical**: If migrations fail, do NOT proceed. Investigate with
> `docker compose -f $COMPOSE_FILE logs api`. You may need to roll back.

### 5.3 Deploy Python Services

```bash
docker compose -f $COMPOSE_FILE up -d engineering-service ai-service vision-service
sleep 10
curl -s http://localhost:8001/health && echo "" && curl -s http://localhost:8002/health && echo "" && curl -s http://localhost:8003/health
```

All three should return HTTP 200.

### 5.4 Deploy API & Web

```bash
docker compose -f $COMPOSE_FILE up -d api web
```

### 5.5 Verify Each Service

```bash
# API
curl -s http://localhost:3000/api/v1/health | jq .
# {"success":true,"data":{"status":"ok"}}

# Web
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001
# 200

# Backend services
curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health && echo ""
curl -s -o /dev/null -w "%{http_code}" http://localhost:8002/health && echo ""
curl -s -o /dev/null -w "%{http_code}" http://localhost:8003/health && echo ""
# All 200
```

### 5.6 Deploy Nginx

```bash
docker compose -f $COMPOSE_FILE up -d nginx
docker compose -f $COMPOSE_FILE exec nginx nginx -t
# nginx: configuration file test is successful
```

Test external routing:
```bash
curl -s -o /dev/null -w "%{http_code}" https://api.xennic.com/api/v1/health
# 200
```

---

## 6. Monitoring Deployment

```bash
docker compose -f $COMPOSE_FILE up -d prometheus grafana loki promtail
```

### 6.1 Verify Monitoring

```bash
# Prometheus ready
curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/-/ready      # 200

# All targets UP
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | select(.health=="up") | .labels.instance'

# Grafana
curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/health   # 200

# Loki
curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/ready        # 200

# Logs flowing to Loki
curl -s "http://localhost:3100/loki/api/v1/query_range" \
  --data-urlencode 'query={job="api"}' | jq '.data.result | length'
# > 0
```

Grafana at `http://localhost:3002` (user: `admin`, password from `.env`). Prometheus and Loki
datasources are pre-provisioned.

---

## 7. Post-Deployment Verification

### 7.1 Run Automated Checks

```bash
# Preflight (should pass before deploy, re-run to confirm)
bash scripts/deployment/preflight-check.sh --verbose

# Post-deploy health check
bash scripts/deployment/post-deploy-check.sh --verbose
```

Expected post-deploy output: 14 checks, 14 healthy (api, web, engineering-service,
ai-service, vision-service, nginx, postgres, redis, rabbitmq, minio, pgbouncer,
prometheus, grafana, loki).

### 7.2 Validation Suite

```bash
bash scripts/validation/health-check.sh    # All services healthy
bash scripts/validation/backup-check.sh     # Backup mechanism operational
bash scripts/validation/security-check.sh   # All security checks pass
```

### 7.3 Final Status

```bash
docker compose -f $COMPOSE_FILE ps | wc -l
# Expect 16 lines (header + 14 services + blank)
```

---

## 8. Day-2 Operations

### 8.1 Viewing Logs

```bash
# All services
docker compose -f $COMPOSE_FILE logs -f --tail=100

# Single service (e.g., api)
docker compose -f $COMPOSE_FILE logs -f --tail=50 api

# Search for errors
docker compose -f $COMPOSE_FILE logs api 2>&1 | grep -i error

# Loki query via curl
curl -s "http://localhost:3100/loki/api/v1/query_range" \
  --data-urlencode 'query={job="api"} |= "ERROR"' | jq .
```

### 8.2 Scaling Services

```bash
# Scale a service (limited support in Compose)
docker compose -f $COMPOSE_FILE up -d --scale api=3 api
```

> True horizontal scaling requires a load balancer — Phase 2 of the scaling strategy.

### 8.3 Backup Schedule

Add to crontab (`crontab -e`):
```
0 3 * * * cd /home/xennic/app && bash scripts/db-backup.sh >> /var/log/xennic-backup.log 2>&1
```

Manual test: `bash scripts/db-backup.sh && ls -lh backups/`

### 8.4 Update Process

```bash
cd /home/xennic/app
bash scripts/db-backup.sh                     # 1. Backup
git pull origin main                          # 2. Pull code
docker compose -f $COMPOSE_FILE pull           # 3. Pull new images
docker compose -f $COMPOSE_FILE run --rm api \ # 4. Run migrations
  npx prisma migrate deploy
docker compose -f $COMPOSE_FILE up -d \       # 5. Recreate containers
  --remove-orphans
bash scripts/deployment/post-deploy-check.sh  # 6. Verify
```

### 8.5 Rollback Procedure

> Full details: [Rollback Runbook](Rollback.md)

**When to rollback immediately:**
- Health check fails 3+ consecutive times
- Error rate >5% 5xx over 5 minutes
- Database migration error / schema mismatch
- Container restarting >3 times/minute

**Steps:**
```bash
docker compose -f $COMPOSE_FILE down api web             # Stop affected
# Edit docker-compose.yml to revert image tags, then:
docker compose -f $COMPOSE_FILE pull api web
docker compose -f $COMPOSE_FILE up -d api web
# If DB migration was applied:
bash scripts/db-restore.sh backups/pre_deploy_backup_$(date +%Y%m%d).dump
```

---

## 9. Troubleshooting

| # | Symptom | Likely Cause | Fix |
|---|---------|-------------|-----|
| 1 | API exits immediately | Missing JWT secret files | Check `infrastructure/secrets/jwtRS256.key` and `.pub` exist |
| 2 | Postgres auth failure | POSTGRES_PASSWORD has special chars | Regenerate without `$`, `\`, `"` |
| 3 | Nginx "host not found" | API/Web not yet healthy | Wait for upstream services or check health |
| 4 | Cannot connect to port | Port conflict or container down | `ss -tlnp \| grep <port>`; `docker compose ps <svc>` |
| 5 | MinIO setup hangs | MinIO not ready | `docker compose -f $COMPOSE_FILE logs minio` |
| 6 | Grafana "Datasource not found" | Prometheus unhealthy | Prometheus must be healthy first |
| 7 | Migration fails | Can't reach DB via PgBouncer | `docker compose ps pgbouncer` — must be healthy |
| 8 | Container restart loop | OOM | `dmesg \| grep -i oom`; increase memory limits |
| 9 | SSL expired | Certbot timer not running | `sudo systemctl status certbot.timer` |
| 10 | Disk full | Docker logs / old images | `docker system prune -af` (caution) |

### Diagnostic Commands

```bash
# All service status
docker compose -f $COMPOSE_FILE ps

# Logs for failing service
docker compose -f $COMPOSE_FILE logs --tail=100 api

# Resource usage
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemPerc}}"

# Port conflicts
ss -tlnp | grep -E ":(3000|3001|8001|8002|8003|5432|6379|5672|9000|9090|3100)"

# Database
docker compose -f $COMPOSE_FILE exec postgres pg_isready -U xennic

# Redis
docker compose -f $COMPOSE_FILE exec redis redis-cli -a "$REDIS_PASSWORD" ping

# RabbitMQ
docker compose -f $COMPOSE_FILE exec rabbitmq rabbitmqctl status
```

### Restarting Services

```bash
docker compose -f $COMPOSE_FILE restart api         # Single service
docker compose -f $COMPOSE_FILE restart              # All
docker compose -f $COMPOSE_FILE down --timeout 30    # Graceful full stop
docker compose -f $COMPOSE_FILE up -d                # Full restart
```

---

## 10. Quick Reference

### 10.1 Important File Paths

| Path | Purpose |
|------|---------|
| `infrastructure/docker/compose/production/docker-compose.yml` | Production compose |
| `infrastructure/docker/compose/production/.env` | Environment variables |
| `infrastructure/secrets/jwtRS256.key` / `.pub` | JWT RSA key pair |
| `infrastructure/nginx/ssl/` | TLS certificates |
| `infrastructure/monitoring/prometheus/prometheus.yml` | Prometheus config |
| `infrastructure/monitoring/grafana/provisioning/` | Grafana datasources/dashboards |
| `infrastructure/monitoring/loki/loki.yml` | Loki config |
| `infrastructure/monitoring/promtail/promtail.yml` | Promtail config |
| `scripts/deployment/preflight-check.sh` | Pre-deployment check |
| `scripts/deployment/post-deploy-check.sh` | Post-deployment check |
| `scripts/validation/health-check.sh` | Service health check |
| `scripts/validation/backup-check.sh` | Backup validation |
| `scripts/validation/security-check.sh` | Security scan |
| `scripts/minio-setup.sh` | MinIO bucket init |
| `prisma/schema.prisma` | Database schema |

### 10.2 Environment Variables Quick Reference

| Group | Must Set | Notes |
|-------|----------|-------|
| App | `API_PUBLIC_URL`, `FRONTEND_URL`, `CORS_ORIGINS` | Your domains |
| DB | `POSTGRES_PASSWORD` | `openssl rand -base64 32` |
| Redis | `REDIS_PASSWORD` | Same command |
| RabbitMQ | `RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS` | |
| MinIO | `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` | |
| LLM | At least one of `GROQ_API_KEY`, `OPENAI_API_KEY`, etc. | |
| SMTP | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Optional but needed for email |
| Grafana | `GRAFANA_ADMIN_PASSWORD` | |

### 10.3 Docker Compose Cheat Sheet

| Command | Purpose |
|---------|---------|
| `docker compose -f $COMPOSE_FILE up -d` | Deploy all services |
| `docker compose -f $COMPOSE_FILE up -d <svc>` | Deploy single service |
| `docker compose -f $COMPOSE_FILE ps` | List running services |
| `docker compose -f $COMPOSE_FILE logs -f` | Follow all logs |
| `docker compose -f $COMPOSE_FILE logs -f <svc>` | Follow single service log |
| `docker compose -f $COMPOSE_FILE restart <svc>` | Restart service |
| `docker compose -f $COMPOSE_FILE down` | Stop everything |
| `docker compose -f $COMPOSE_FILE down -v` | Stop + delete volumes (⚠️ data loss) |
| `docker compose -f $COMPOSE_FILE pull` | Pull latest images |
| `docker compose -f $COMPOSE_FILE build --parallel` | Build locally |
| `docker compose -f $COMPOSE_FILE run --rm <svc> <cmd>` | Run one-off command |
| `docker compose -f $COMPOSE_FILE exec <svc> <cmd>` | Exec in running container |
| `docker system prune -af` | Clean unused Docker resources (⚠️) |
