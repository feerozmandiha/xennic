# XENNIC — Disaster Recovery Runbook

## Overview

This runbook documents recovery procedures for all critical platform components. Follow these steps in order during an outage event.

**Last Updated:** 2026-07-05

---

## 1. PostgreSQL Database

### Failure Detection
- API returns 500 errors with database connection failures
- Health check: `curl http://localhost:3000/api/v1/health` returns 503
- Container status: `docker ps | grep xennic-postgres`

### Recovery Steps

```bash
# Step 1: Verify data directory integrity
docker exec xennic-postgres pg_isready -U postgres

# Step 2: Attempt restart
docker restart xennic-postgres

# Step 3: If volume corrupted, restore from backup
docker run --rm -v xennic_postgres_data:/data -v /backups:/backups \
  postgres:17-alpine sh -c "tar xzf /backups/pg-base-$(date +%Y%m%d).tar.gz -C /data"

# Step 4: Start container
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d postgres

# Step 5: Verify data integrity
PGPASSWORD=postgres psql -h localhost -U postgres -d xennic -c "SELECT count(*) FROM information_schema.tables;"
```

### RTO: < 1 hour | RPO: < 5 minutes

---

## 2. Redis Cache

### Failure Detection
- Increased latency on cache-dependent endpoints
- Cache entries return null (fall through to database)

### Recovery Steps

```bash
# Step 1: Attempt restart
docker restart xennic-redis

# Step 2: Verify persistence files
docker exec xennic-redis ls -la /data/

# Step 3: If RDB/AOF corrupted, start fresh (cache will rehydrate)
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d redis

# Step 4: Verify connectivity
docker exec xennic-redis redis-cli PING  # Should return PONG
```

### RTO: < 10 minutes | RPO: < 1 minute

---

## 3. RabbitMQ

### Failure Detection
- Messages stuck in outbox table
- Dead-letter queue growing

### Recovery Steps

```bash
# Step 1: Verify Erlang cookie
docker exec xennic-rabbitmq cat /var/lib/rabbitmq/.erlang.cookie

# Step 2: Start Mnesia database repair
docker exec xennic-rabbitmq rabbitmqctl start_app

# Step 3: Verify queue mirroring
docker exec xennic-rabbitmq rabbitmqctl list_queues name durable slave_pids

# Step 4: Recover from disk if needed
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d rabbitmq
```

### RTO: < 15 minutes | RPO: < 1 minute

---

## 4. MinIO Object Storage

### Failure Detection
- File upload/download failures
- Storage-related API errors

### Recovery Steps

```bash
# Step 1: Check storage health
docker exec xennic-minio mc admin info local

# Step 2: Restore from secondary (if configured)
docker exec xennic-minio mc mirror --overwrite remote/bucket /data/bucket

# Step 3: Restart with data volume
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d minio
```

### RTO: < 30 minutes | RPO: < 15 minutes

---

## 5. Qdrant Vector Database

### Failure Detection
- Vector search returns empty results
- Embedding operations fail

### Recovery Steps

```bash
# Step 1: Check Qdrant health
curl http://localhost:6333/health

# Step 2: List collections
curl http://localhost:6333/collections

# Step 3: Restore from snapshot
docker exec qdrant curl -X POST 'http://localhost:6333/collections/knowledge/snapshots/recover' \
  -H 'Content-Type: application/json' \
  -d '{"location": "/snapshots/knowledge-latest.snapshot"}'

# Step 4: Restart container
docker compose -f workspace/docker-compose.yml up -d qdrant
```

### RTO: < 30 minutes | RPO: < 15 minutes

---

## 6. Full Platform Recovery

### Complete Outage Recovery Order

1. **PostgreSQL** — Start database first (all services depend on it)
2. **Redis** — Start cache layer
3. **RabbitMQ** — Start message broker
4. **MinIO** — Start object storage
5. **Qdrant** — Start vector database
6. **Python Services** — Start AI (8002), Engineering (8001), Vision (8003)
7. **NestJS API** — Start API server (port 3000)
8. **NextJS Web** — Start web application (port 3001)

### Verification Commands

```bash
# Infrastructure health check
./infrastructure/scripts/health-check.sh

# API readiness
curl http://localhost:3000/api/v1/health

# Check outbox replay (process any pending events)
curl http://localhost:3000/api/v1/admin/outbox/status
```

---

## 7. Backup Procedures

### PostgreSQL

Production Docker Compose deployments include a host-side backup helper with
checksum generation, single-run locking, and retention cleanup.

```bash
# One-off backup using the production compose stack
BACKUP_DIR=/secure/xennic/backups/postgres \
BACKUP_RETENTION_DAYS=14 \
./infrastructure/docker/scripts/backup-postgres.sh

# Install a daily cron entry. Default schedule is 02:17 server time.
CRON_SCHEDULE="17 2 * * *" \
BACKUP_DIR=/secure/xennic/backups/postgres \
BACKUP_RETENTION_DAYS=14 \
./infrastructure/docker/scripts/install-backup-cron.sh

# Verify the latest archive checksum
cd /secure/xennic/backups/postgres
sha256sum -c "$(ls -1t xennic-postgres-*.dump.sha256 | head -1)"
```

Restore drill example:

```bash
# Copy a selected .dump file to the host running Docker, then restore into the
# production postgres container. Stop write traffic before running this command.
docker compose --env-file infrastructure/docker/compose/production/.env \
  -f infrastructure/docker/compose/production/docker-compose.yml \
  exec -T postgres sh -c 'export PGPASSWORD="$POSTGRES_PASSWORD"; \
    pg_restore --clean --if-exists --no-owner --no-acl \
      --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' \
  < /secure/xennic/backups/postgres/xennic-postgres-YYYYMMDDTHHMMSSZ.dump
```

WAL archiving remains a future enhancement for point-in-time recovery:

```bash
archive_command = 'cp %p /backups/wal/%f'
```

### Redis
```bash
# Trigger RDB save
redis-cli SAVE

# AOF is enabled by default in redis.conf
```

### MinIO
```bash
# Mirror buckets to secondary
mc mirror --watch xennic/bucket remote/bucket
```

---

## 8. Contact Information

| Role | Contact |
|------|---------|
| Database Administrator | (define) |
| Infrastructure Lead | (define) |
| Security Officer | (define) |
| DevOps Engineer | (define) |

---

*Maintain this runbook with every production deployment.*
