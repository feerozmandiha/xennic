# XENNIC ARCHITECTURE SPECIFICATION v1

## System Vision

Xennic is a Multi-Tenant SaaS Platform for Electrical Engineering, Renewable Energy, Engineering Calculations, AI-Assisted Consulting and Technical Commerce.

Architecture must support growth from a small engineering platform to a large-scale enterprise ecosystem.

---

# Architecture Style

Architecture Pattern:

* Modular Monolith
* Domain Driven Design (DDD)
* CQRS
* Event Driven Architecture
* API First
* Cloud Native Ready

Future Migration Path:

Modular Monolith → Service Extraction → Microservices

---

# Core Services

## Frontend Layer

Technology:

* Next.js
* TypeScript
* App Router
* SSR
* ISR
* SEO Optimization

Responsibilities:

* User Interface
* Workspace UI
* Dashboard
* Marketplace
* Knowledge Base
* Project Management

---

## Backend Layer

Technology:

* NestJS
* TypeScript

Responsibilities:

* Business Logic
* Authentication
* Authorization
* Subscription Management
* Workspace Management
* API Layer

---

## AI Layer

Technology:

* FastAPI
* Python

Responsibilities:

* AI Agents
* Engineering Recommendations
* RAG Pipelines
* Document Processing
* Drawing Analysis

---

## Data Layer

PostgreSQL

Primary System Database

Redis

Cache
Queue
Session

Qdrant

Vector Database

Meilisearch

Search Engine

MinIO

Object Storage

---

# Multi-Tenant Model

Tenant Entity:

Workspace

All business resources belong to a workspace.

Examples:

Workspace
├── Users
├── Projects
├── Files
├── Calculations
├── Reports
├── AI Sessions

---

# Domain Structure

Identity

Workspace

Subscription

Billing

Engineering

AI

Knowledge

Consultation

Marketplace

Project

Storage

Notification

Administration

Learning (Reserved)

---

# Engineering Engine

Service Type:

Dedicated Python Service

Communication:

REST API

Future:

gRPC Ready

---

# AI Architecture

NestJS

↓

AI Gateway

↓

FastAPI

↓

Model Providers

* OpenAI
* Claude
* Gemini
* Local Models

---

# Search Architecture

Content Sources:

Articles
Projects
Products
Documents

↓

Meilisearch

---

# Vector Search Architecture

Documents

↓

Embedding Pipeline

↓

Qdrant

↓

AI Retrieval

---

# Security

JWT

Refresh Tokens

RBAC

PBAC

API Keys

Rate Limiting

Audit Logs

2FA Ready

---

# Monitoring

Prometheus

Grafana

Loki

Health Checks

Metrics

Tracing Ready

---

# Deployment

Docker Only

Every service must be containerized.

No direct host installation allowed.

---

# Documentation

OpenAPI

Swagger

Developer Documentation

Architecture Documentation

Every endpoint must be documented.

No undocumented APIs are allowed.
