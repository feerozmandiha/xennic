# Python Services Audit — Sprint R3.0

**Date:** 2026-07-18

## Summary: ⚠️ CONDITIONAL PASS

## Service Overview

| Service             | Version | Port | LOC        | Framework | Docker User       |
| ------------------- | ------- | ---- | ---------- | --------- | ----------------- |
| engineering-service | 0.4.0   | 8001 | 14,879     | FastAPI   | xennic (non-root) |
| ai-service          | 0.2.0   | 8002 | 3,906      | FastAPI   | xennic (non-root) |
| vision-service      | 1.0.0   | 8003 | 2,067      | FastAPI   | xennic (non-root) |
| **Total**           | —       | —    | **20,852** | —         | —                 |

## Docker Images

| Image                    | Size    |
| ------------------------ | ------- |
| base-engineering-service | 883 MB  |
| base-ai-service          | 844 MB  |
| base-vision-service      | 1.53 GB |

## Container Resources

| Service     | CPU   | Memory       |
| ----------- | ----- | ------------ |
| engineering | 0.16% | 119.3 MiB    |
| ai          | 0.15% | 149.3 MiB    |
| vision      | 0.17% | 59.14 MiB    |
| **Total**   | —     | **~328 MiB** |

## Health Endpoints

All three services return HTTP 200 with JSON status, version, and registered capabilities.

## Configuration Management

| Service     | Strategy                                 |
| ----------- | ---------------------------------------- |
| engineering | Raw `os.getenv()` — no pydantic-settings |
| ai          | pydantic-settings with `.env` file       |
| vision      | pydantic-settings with `.env` file       |

## Inter-Service Communication

- **ai → engineering:** httpx.AsyncClient via `CalculationTool`
- **ai → Qdrant:** qdrant-client for vector store
- **ai → MinIO:** minio SDK for object storage
- **ai → OpenAI/Anthropic/Google:** SDK clients
- **vision → external LLM:** httpx.AsyncClient (Groq API)
- **engineering:** No outbound calls (pure calculator)

## Dockerfile Quality

All 3 services use:

- Multi-stage builds (builder + runtime)
- Non-root `xennic` user
- pip cache mounts
- Built-in HEALTHCHECK
- python:3.12-slim base

## Findings

| #   | Issue                                                       | Severity |
| --- | ----------------------------------------------------------- | -------- |
| 1   | Engineering uses `os.getenv()` instead of pydantic-settings | MEDIUM   |
| 2   | Dependency version inconsistency (>= vs ==) across services | MEDIUM   |
| 3   | Vision CORS wide open (`allow_origins=["*"]`)               | HIGH     |
| 4   | No auth middleware on any Python service                    | MEDIUM   |
| 5   | Engineering `numpy<2.0.0` vs vision `numpy==2.2.4` conflict | LOW      |
| 6   | Health endpoint creates new registry instance (bug)         | LOW      |

## Score

**7.5/10** — Solid Docker integration and health checks, but security (CORS, auth) and config consistency need improvement.
