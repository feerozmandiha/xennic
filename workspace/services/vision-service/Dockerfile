# syntax=docker/dockerfile:1.7
# Stage 1: Builder
FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 \
    tesseract-ocr tesseract-ocr-fas \
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
    libgl1 \
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 \
    tesseract-ocr tesseract-ocr-fas \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv

COPY ./app ./app

ENV PATH=/opt/venv/bin:$PATH
ENV PYTHONPATH=/app
ENV SERVICE_NAME=vision-service
ENV SERVICE_VERSION=1.0.0
ENV SERVICE_PORT=8003

EXPOSE 8003

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -sf http://localhost:8003/health || exit 1

USER xennic

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003"]
