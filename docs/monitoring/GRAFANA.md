# Grafana — Dashboards & Visualization

**Version**: 1.0.0 | **Date**: Tir 1405

---

## Overview

Grafana provides dashboards for metrics (Prometheus) and logs (Loki).

## Access

| Detail | Value |
|--------|-------|
| URL | http://localhost:3002 |
| Username | `admin` |
| Password | `${GRAFANA_ADMIN_PASSWORD}` (default: `admin`) |
| Sign-up | Disabled |

## Data Sources

| Name | Type | URL |
|------|------|-----|
| Prometheus | Prometheus | http://prometheus:9090 |
| Loki | Loki | http://loki:3100 |

Provisioned automatically via `infrastructure/monitoring/grafana/provisioning/datasources/`.

## Related

| Document | Path |
|----------|------|
| Prometheus | `docs/monitoring/PROMETHEUS.md` |
| Loki | `docs/monitoring/LOKI.md` |
| Compose | `infrastructure/docker/compose/production/docker-compose.yml` |
