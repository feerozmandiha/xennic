# راه‌اندازی سرور — Server Setup

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

راهنمای راه‌اندازی سرور برای استقرار پلتفرم Xennic.

---

## Scope

System requirements, OS setup, dependency installation.

---

## Requirements

| مؤلفه | Minimum | Recommended |
|-------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 16 GB | 32 GB |
| Storage | 100 GB SSD | 250 GB NVMe |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Network | 1 Gbps | 10 Gbps |

---

## Setup Steps

```bash
# 1. System update
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. Install Node.js (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20

# 4. Install pnpm
corepack enable && corepack prepare pnpm@latest --activate

# 5. Install PostgreSQL client
sudo apt install postgresql-client -y

# 6. Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| Docker | `deployment/DOCKER.md` |
| Docker Compose | `deployment/DOCKER_COMPOSE.md` |
| Production Checklist | `deployment/PRODUCTION_CHECKLIST.md` |
| Infrastructure | `infrastructure/INFRASTRUCTURE.md` |
| Docker Compose Base | `infrastructure/docker/compose/base/docker-compose.yml` |
| Docker Compose Qdrant | `workspace/docker-compose.yml` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
