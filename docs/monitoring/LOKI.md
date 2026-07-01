# Loki — Log Aggregation

**Version**: 1.0.0 | **Date**: Tir 1405

---

## Overview

Loki aggregates logs from all Docker containers, indexed by service name.

## Components

| Component | Image | Port |
|-----------|-------|------|
| Loki | grafana/loki:3.1.1 | 3100 |
| Promtail | grafana/promtail:3.1.1 | 9080 |

## Log Flow

```
Docker containers → Promtail (docker_sd) → Loki → Grafana
```

## Labels

Each log line is labeled with:
- `container` — Docker container name
- `service` — Docker Compose service name
- `logstream` — stdout / stderr

## Access

- Loki API: http://localhost:3100
- Query via Grafana Explore → Loki datasource

## Retention

- Configurable in `loki.yml` via `reject_old_samples_max_age`
- Default: 7 days (168h)

## Related

| Document | Path |
|----------|------|
| Prometheus | `docs/monitoring/PROMETHEUS.md` |
| Grafana | `docs/monitoring/GRAFANA.md` |
| Compose | `infrastructure/docker/compose/production/docker-compose.yml` |
