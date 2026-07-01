# PgBouncer — Connection Pooling

**Version**: 1.0.0 | **Date**: Tir 1405

---

## Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   API / Web  │ ──►  │   PgBouncer   │ ──►  │  PostgreSQL  │
│   Services   │      │   :6432      │      │   :5432      │
└──────────────┘      └──────────────┘      └──────────────┘
                              │
                      Pool: 25 connections
                      Mode: transaction
```

---

## Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Pool Mode | `transaction` | Connections released after each transaction |
| Default Pool Size | 25 | per database/user pair |
| Max Client Connections | 200 | total clients that can queue |
| Max DB Connections | 50 | backend connections to PostgreSQL |
| Idle Timeout | 300s | close idle connections after 5 min |
| Server Reset | `DISCARD ALL` | reset session state on release |

### Connection String

```
postgresql://user:pass@pgbouncer:6432/db?schema=public&pgbouncer=true
```

The `&pgbouncer=true` parameter is required by Prisma for transaction pooling mode. It tells Prisma to use prepared statements without server-side bind.

---

## Docker Compose Integration

Both `base` and `production` compose files include PgBouncer:

```yaml
pgbouncer:
  image: edoburu/pgbouncer:latest
  container_name: xennic-pgbouncer
  environment:
    - DB_USER=${POSTGRES_USER}
    - DB_PASSWORD=${POSTGRES_PASSWORD}
    - DB_HOST=postgres
    - DB_PORT=5432
    - POOL_MODE=transaction
    - DEFAULT_POOL_SIZE=25
  ports:
    - "6432:6432"
  depends_on:
    postgres:
      condition: service_healthy
```

---

## Prisma Compatibility

| Feature | Status | Notes |
|---------|--------|-------|
| Transaction pooling | ✅ | `pool_mode=transaction` with `DISCARD ALL` |
| Prepared statements | ✅ | `pgbouncer=true` in connection string |
| Connection limits | ✅ | Pool size 25, adequate for Prisma's 10 default |
| Health checks | ✅ | `pg_isready` via PgBouncer to PostgreSQL |

---

## Monitoring

```bash
# Show PgBouncer stats
psql -h localhost -p 6432 -U xennic -d pgbouncer -c "SHOW STATS;"

# Show active pools
psql -h localhost -p 6432 -U xennic -d pgbouncer -c "SHOW POOLS;"

# Show clients
psql -h localhost -p 6432 -U xennic -d pgbouncer -c "SHOW CLIENTS;"

# Show servers (backends)
psql -h localhost -p 6432 -U xennic -d pgbouncer -c "SHOW SERVERS;"
```

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "no server configured" | PgBouncer cannot reach PostgreSQL | Check `DB_HOST`, `DB_PORT` env vars |
| "too many connections" | Pool exhausted | Increase `DEFAULT_POOL_SIZE` or `MAX_CLIENT_CONN` |
| Auth failures | Password mismatch | Ensure `DB_PASSWORD` matches PostgreSQL password |
| Prepared statement errors | Missing `pgbouncer=true` | Add `&pgbouncer=true` to connection string |

---

## Related Documents

| Document | Path |
|----------|------|
| Database Architecture | `docs/database/DATABASE_ARCHITECTURE.md` |
| Migration Strategy | `docs/database/MIGRATION_STRATEGY.md` |
| Backup & Restore | `docs/database/BACKUP_AND_RESTORE.md` |
| Production Compose | `infrastructure/docker/compose/production/docker-compose.yml` |
