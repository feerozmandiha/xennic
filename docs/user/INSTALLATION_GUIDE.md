# راهنمای نصب — Installation Guide

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

راهنمای نصب و راه‌اندازی پلتفرم Xennic.

---

## Scope

Local development, production deployment.

---

## Local Development

### Prerequisites

| نیازمندی | نسخه | نحوه نصب |
|-----------|-------|----------|
| Node.js | 20+ | nvm / fnm |
| pnpm | Latest | corepack enable |
| Docker | 24+ | docker.com |
| PostgreSQL | 17 | Docker / local |

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/xennic/xennic.git
cd xennic

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 4. Start infrastructure
docker compose -f infrastructure/docker/compose/base/docker-compose.yml up -d

# 5. Apply database
pnpm db:apply

# 6. Start development
pnpm dev
```

---

## Production Deployment

```bash
# 1. Server setup
# See deployment/SERVER_SETUP.md

# 2. Environment variables
# See deployment/ENVIRONMENT_VARIABLES.md

# 3. Docker compose production
docker compose -f docker-compose.prod.yml up -d

# 4. SSL setup
# See deployment/HTTPS.md

# 5. Verify
curl https://xennic.com/api/v1/health
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| User Guide | `user/USER_GUIDE.md` |
| Server Setup | `deployment/SERVER_SETUP.md` |
| Environment Variables | `deployment/ENVIRONMENT_VARIABLES.md` |
| Developer Guide | `development/DEVELOPER_GUIDE.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
