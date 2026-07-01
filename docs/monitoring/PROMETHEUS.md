# Prometheus — Metrics Collection

**Version**: 1.0.0 | **Date**: Tir 1405

---

## Overview

Prometheus scrapes metrics from all Xennic services at 15s intervals, with 15-day retention.

## Configuration

**File**: `infrastructure/monitoring/prometheus/prometheus.yml`

| Target | Service | Port |
|--------|---------|------|
| API | NestJS | 3000 |
| Engineering | FastAPI | 8001 |
| AI | FastAPI | 8002 |
| Vision | FastAPI | 8003 |

## Access

- **URL**: http://localhost:9090
- **Targets**: http://localhost:9090/targets

## Data Retention

- Local storage: 15 days
- Path: `prometheus_data` volume

## Related

| Document | Path |
|----------|------|
| Grafana | `docs/monitoring/GRAFANA.md` |
| Loki | `docs/monitoring/LOKI.md` |
| Compose | `infrastructure/docker/compose/production/docker-compose.yml` |
