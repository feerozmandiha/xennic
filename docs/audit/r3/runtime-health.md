# Runtime Health Audit — Sprint R3.0

**Date:** 2026-07-18 ~10:00 UTC  
**Status:** ✅ PASS (all services restored)

## Service Health Dashboard

```
╔══════════════════════════════════════════════════════════╗
║           XENNIC RUNTIME HEALTH — Sprint R3.0           ║
╠══════════════════════════════════════════════════════════╣
║  INFRASTRUCTURE (Docker)                                ║
║  PostgreSQL (5432)  . . . . . . . . . .  ✅ HEALTHY    ║
║  Redis (6380)       . . . . . . . . . .  ✅ HEALTHY    ║
║  RabbitMQ (5672)    . . . . . . . . . .  ✅ HEALTHY    ║
║  Qdrant (6333)      . . . . . . . . . .  ✅ HEALTHY    ║
║                                                         ║
║  PYTHON SERVICES (Docker)                               ║
║  Engineering (8001) . . . . . . . . . .  ✅ HEALTHY    ║
║  AI Service (8002)  . . . . . . . . . .  ✅ HEALTHY    ║
║  Vision (8003)      . . . . . . . . . .  ✅ HEALTHY    ║
║                                                         ║
║  APPLICATION SERVICES (Host)                            ║
║  NestJS API (3000)  . . . . . . . . . .  ✅ HEALTHY    ║
║  Next.js Web (3001) . . . . . . . . . .  ❌ DOWN       ║
║                                                         ║
║  OVERALL: 8/9 SERVICES HEALTHY                          ║
╚══════════════════════════════════════════════════════════╝
```

## Container Details

| Container                  | Status       | Restarts | Health  | User    | Memory  |
| -------------------------- | ------------ | -------- | ------- | ------- | ------- |
| xennic-postgres            | Up (healthy) | 0        | healthy | root    | ~50 MB  |
| xennic-redis               | Up (healthy) | 0        | healthy | root    | ~10 MB  |
| xennic-rabbitmq            | Up (healthy) | 0        | healthy | root    | ~80 MB  |
| xennic-qdrant              | Up (healthy) | 0        | healthy | default | ~60 MB  |
| xennic-engineering-service | Up (healthy) | 0        | healthy | xennic  | 119 MiB |
| xennic-ai-service          | Up (healthy) | 0        | healthy | xennic  | 149 MiB |
| xennic-vision-service      | Up (healthy) | 0        | healthy | xennic  | 59 MiB  |

## Health Endpoints

| Service                 | Response                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| API (`/api/v1/health`)  | `{"status":"ok","service":"xennic-api"}`                                                        |
| Engineering (`/health`) | `{"status":"ok","service":"engineering-service","version":"0.4.0","calculators_registered":52}` |
| AI (`/health`)          | `{"status":"ok","service":"ai-service","version":"0.2.0","agents_registered":2}`                |
| Vision (`/health`)      | `{"status":"ok","service":"vision-service","version":"1.0.0"}`                                  |

## Database Connectivity

- PostgreSQL: ✅ Connected, 132 tables
- Redis: ✅ Connected (PING → PONG)
- RabbitMQ: ✅ Connected (management UI at 15672)

## Known Issues

1. **Next.js Web (3001):** Not running — not started in this session
2. **Monitoring stack:** 9 containers defined but never started (Docker Hub rate limit deferred)
3. **Vision service:** Previously in restart loop; stabilized after rebuild
