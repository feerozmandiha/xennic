# XENNIC_INFRASTRUCTURE_SPEC_v1

Version: 1.0

Status: Approved

Date: 2026-05-30

---

# Purpose

This document defines the infrastructure architecture of the Xennic Platform.

Infrastructure goals:

- Docker First
- Cloud Ready
- High Availability Ready
- Horizontal Scaling Ready
- Monitoring Ready
- Security By Design

---

# Deployment Strategy

Containerization:

Docker

Orchestration (Future):

Kubernetes

Current Phase:

Docker Compose

---

# Environment Stages

Development

Staging

Production

---

# Core Infrastructure

Frontend

Backend API

Engineering Service

AI Service

Worker Service

Notification Service

PostgreSQL

Redis

MinIO

Meilisearch

Qdrant

Nginx

Prometheus

Grafana

Loki

OpenTelemetry Collector

---

=========================================================
NETWORK DESIGN
=========================================================

Docker Networks

xennic-public

xennic-private

xennic-monitoring

Rules:

Public services:

- nginx
- web

Private services:

- postgres
- redis
- qdrant
- meilisearch
- minio

Only internal communication allowed.

---

=========================================================
POSTGRESQL
=========================================================

Service:

postgres

Version:

17

Container:

postgres:17

Persistent Volume:

postgres_data

Port:

5432

Environment:

POSTGRES_DB

POSTGRES_USER

POSTGRES_PASSWORD

---

Backup:

Daily

Retention:

30 Days

---

=========================================================
REDIS
=========================================================

Service:

redis

Version:

7

Usage:

Cache

Queue

Rate Limiting

Session Storage

BullMQ

Persistent Volume:

redis_data

---

=========================================================
MINIO
=========================================================

Service:

minio

Purpose:

Object Storage

Stores:

Documents

Reports

Images

Engineering Files

AI Uploads

Volumes:

minio_data

---

Buckets:

public

private

reports

documents

engineering

ai

---

=========================================================
MEILISEARCH
=========================================================

Purpose:

Full Text Search

Indexes:

articles

products

projects

documents

calculations

---

=========================================================
QDRANT
=========================================================

Purpose:

Vector Search

Collections:

articles

documents

engineering_standards

calculations

ai_knowledge

---

=========================================================
NGINX
=========================================================

Purpose:

Reverse Proxy

SSL Termination

Rate Limiting

Caching

Routing

---

Routes

/

→ web

/api

→ api

/docs

→ docs-site

---

=========================================================
WEB APPLICATION
=========================================================

Technology:

Next.js

Container:

web

Port:

3000

Build:

Standalone Output

Mode:

Production Optimized

---

=========================================================
API APPLICATION
=========================================================

Technology:

NestJS

Container:

api

Port:

3001

Responsibilities:

Authentication

Authorization

Workspace

Projects

Marketplace

Billing

Storage

Administration

---

=========================================================
ENGINEERING SERVICE
=========================================================

Technology:

FastAPI

Container:

engineering-service

Port:

8001

Responsibilities:

Engineering Calculations

Power Quality

Protection

Solar

Reports

---

=========================================================
AI SERVICE
=========================================================

Technology:

FastAPI

Container:

ai-service

Port:

8002

Responsibilities:

AI Agents

RAG

Document Analysis

Drawing Analysis

Model Routing

---

=========================================================
WORKER SERVICE
=========================================================

Technology:

NestJS

Container:

worker-service

Responsibilities:

PDF Generation

Email

Background Jobs

Indexing

Scheduled Tasks

---

=========================================================
NOTIFICATION SERVICE
=========================================================

Technology:

NestJS

Container:

notification-service

Responsibilities:

SMS

Email

Push Notifications

Webhooks

---

=========================================================
OBSERVABILITY
=========================================================

Monitoring Stack

Prometheus

Grafana

Loki

OpenTelemetry

---

Metrics

API Metrics

DB Metrics

Queue Metrics

AI Metrics

Engineering Metrics

---

Logs

Application Logs

Infrastructure Logs

Audit Logs

---

Tracing

Distributed Tracing

Request Tracing

Background Job Tracing

---

=========================================================
SECRETS MANAGEMENT
=========================================================

Development

.env

Production

Docker Secrets

Future

Vault

---

=========================================================
DOCKER VOLUMES
=========================================================

postgres_data

redis_data

minio_data

meilisearch_data

qdrant_data

grafana_data

loki_data

prometheus_data

---

=========================================================
HEALTH CHECKS
=========================================================

Required For:

web

api

engineering-service

ai-service

postgres

redis

minio

meilisearch

qdrant

---

Endpoints

/health

/health/live

/health/ready

---

=========================================================
BACKUP STRATEGY
=========================================================

PostgreSQL

Daily Backup

Retention:

30 Days

---

MinIO

Daily Backup

Retention:

30 Days

---

Qdrant

Weekly Snapshot

Retention:

8 Weeks

---

=========================================================
SECURITY
=========================================================

TLS Required

HTTPS Only

Rate Limiting

CORS Policy

CSP Headers

Secure Cookies

JWT Rotation

Refresh Token Rotation

Audit Logging

API Key Support

---

=========================================================
SCALING STRATEGY
=========================================================

Phase 1

Single Server

Docker Compose

---

Phase 2

Multiple Servers

Load Balancer

---

Phase 3

Kubernetes

Auto Scaling

---

=========================================================
CI/CD
=========================================================

GitHub Actions

Pipelines:

lint

test

build

docker

release

deploy

security

---

Deployment Target

Ubuntu LTS

Docker Engine

Docker Compose

---

=========================================================
NON-NEGOTIABLE RULES
=========================================================

- Docker First
- Infrastructure As Code
- Monitoring Mandatory
- OpenTelemetry Mandatory
- Health Checks Mandatory
- Daily Backups Mandatory
- TLS Mandatory
- No Direct Database Exposure
- No Production Debug Mode
- No Hardcoded Secrets

Approved.