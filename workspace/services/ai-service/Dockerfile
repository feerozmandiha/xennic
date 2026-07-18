# syntax=docker/dockerfile:1.7
# Stage 1: Builder
FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m venv /opt/venv \
    && /opt/venv/bin/pip --disable-pip-version-check install --retries 10 --timeout 600 -r requirements.txt

# Stage 2: Runtime
FROM python:3.12-slim

RUN groupadd -r xennic && useradd -r -g xennic -d /app -s /sbin/nologin xennic

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv

COPY ./app ./app

ENV PATH=/opt/venv/bin:$PATH
ENV PYTHONPATH=/app

EXPOSE 8002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -sf http://localhost:8002/health || exit 1

USER xennic

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
