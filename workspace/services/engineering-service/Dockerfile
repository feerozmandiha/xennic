<<<<<<< HEAD
=======
# Stage 1: Builder
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
FROM python:3.12-slim AS builder

WORKDIR /build

<<<<<<< HEAD
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /root/.local /root/.local
COPY ./src ./src
COPY ./pyproject.toml ./

=======
# Install build dependencies
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     gcc \
#     && rm -rf /var/lib/apt/lists/*

# # Copy requirements and install Python packages
# COPY requirements.txt .
# RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.12-slim

WORKDIR /app

# # Copy installed packages from builder
# COPY --from=builder /root/.local /root/.local

# # Copy application source
# COPY ./src ./src
# COPY ./pyproject.toml ./ 2>/dev/null || true

# Set environment variables
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app
ENV ENVIRONMENT=production
ENV LOG_LEVEL=INFO

<<<<<<< HEAD
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8001/health')" || exit 1

ENTRYPOINT ["tini", "--"]
=======
# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8001/health')" || exit 1

# Run the application
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]
