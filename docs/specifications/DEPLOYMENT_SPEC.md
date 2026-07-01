# مشخصات استقرار — Deployment Specification

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **مالک**: DevOps Team | **آخرین بروزرسانی**: خرداد ۱۴۰۵ | **بازبینی بعدی**: شهریور ۱۴۰۵

---

## Purpose

مشخصات رسمی Deployment پلتفرم Xennic.

---

## Scope

Infrastructure, Docker, CI/CD, monitoring.

---

## Contract

### Infrastructure
| مؤلفه | تکنولوژی | نسخه |
|-------|----------|------|
| Container Runtime | Docker | 24+ |
| Orchestration | Docker Compose | V3 |
| Database | PostgreSQL | 17 |
| Cache | Redis | 8 |
| Message Queue | RabbitMQ | 4 |
| Vector DB | Qdrant | 1.x |

### Services
| سرویس | Port | Instance | Strategy |
|-------|------|----------|----------|
| NestJS API | 3000 | 2+ | Rolling |
| Next.js Web | 3001 | 2+ | Blue/Green |
| Engineering Service | 8001 | 2+ | Rolling |
| AI Service | 8002 | 2+ | Rolling |
| Vision Service | 8003 | 2+ | Rolling |

### CI/CD
| مرحله | ابزار |
|-------|-------|
| Source Control | GitHub |
| CI Pipeline | GitHub Actions |
| Container Registry | ghcr.io |
| Deployment | Docker Compose / K8s (planned) |

### Monitoring
| ابزار | کاربرد |
|-------|--------|
| Prometheus | Metrics collection |
| Grafana | Dashboards + Alerting |
| Loki | Log aggregation |
| Tempo | Distributed tracing |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Infrastructure | `infrastructure/INFRASTRUCTURE.md` |
| CI/CD | `devops/CI_CD.md` |
| Monitoring | `devops/MONITORING.md` |
| Infra Spec | `deployment/XENNIC_INFRASTRUCTURE_SPEC_v1.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
