# بازیابی بحران — Disaster Recovery

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

طرح بازیابی بحران (Disaster Recovery) پلتفرم Xennic.

---

## Scope

DR scenarios, runbooks, recovery procedures.

---

## DR Architecture

```mermaid
graph TB
    subgraph "Primary Region"
        LB["Load Balancer"]
        API["API Cluster"]
        PG_PRIMARY["PostgreSQL\nPrimary"]
        REDIS_PRIMARY["Redis\nPrimary"]
        STORAGE_PRIMARY["S3 Primary"]
    end
    
    subgraph "DR Region (Standby)"
        API_DR["API Cluster\n(Idle)"]
        PG_STANDBY["PostgreSQL\nReplica"]
        REDIS_REPLICA["Redis\nReplica"]
        STORAGE_DR["S3 Cross-Region\nReplication"]
    end
    
    PG_PRIMARY -.|Streaming Replication| PG_STANDBY
    REDIS_PRIMARY -.|Async Replication| REDIS_REPLICA
    STORAGE_PRIMARY -.|CRR| STORAGE_DR
    LB -->|Active| API
    LB -->|Failover| API_DR
```

---

## DR Scenarios

| سناریو | RTO | RPO | Action |
|--------|-----|-----|--------|
| Single instance failure | 5 min | 0 | Auto-heal via K8s |
| Database failure | 15 min | 1 hour | Promote replica |
| Region outage | 4 hours | 24 hours | Activate DR region |
| Data corruption | 1 hour | 24 hours | Restore from backup |

## DR Runbook

### Step 1: Assess
```bash
# Check service health
curl -f http://localhost:3000/api/v1/health

# Check database
pg_isready -h localhost

# Check replication lag
psql -c "SELECT pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn();"
```

### Step 2: Initiate Failover
```bash
# Promote standby database
pg_ctl promote -D /var/lib/postgresql/standby

# Update DNS
aws route53 change-resource-record-sets --change-batch file://failover.json

# Verify
curl -f https://api.xennic.com/health
```

### Step 3: Verify & Notify
```bash
# Full health check
./scripts/dr-verify.sh

# Notify team
./scripts/dr-notify.sh "DR failover complete"
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| Backup Plan | `devops/BACKUP_PLAN.md` |
| Monitoring | `devops/MONITORING.md` |
| Infrastructure | `infrastructure/INFRASTRUCTURE.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
