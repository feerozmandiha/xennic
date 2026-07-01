# Server Rebuild Runbook — راهنمای بازسازی کامل سرور

**نسخه**: ۱.۰.۰ | **وضعیت**: فعال | **آخرین به‌روزرسانی**: ۲۰۲۶-۰۶-۲۳

**زمان هدف**: ۳۰ دقیقه (از OS نصب تا سرویس فعال)

**لینک‌های مرتبط**: [Deployment](Deployment.md) · [Rollback](Rollback.md) · [Disaster Recovery](Disaster-Recovery.md) · [Incident Response](Incident-Response.md) · [Secrets Rotation](Secrets-Rotation.md) · [Infrastructure Spec](/home/ahmad/xennic-docs/docs/deployment/XENNIC_INFRASTRUCTURE_SPEC_v1.md)

---

## پیش‌نیازها

- دسترسی root به سرور (یا user با sudo)
- دامنه با DNS اشاره شده به IP سرور
- دسترسی به GitHub repository
- دسترسی به providerهای AI (API keys)
- Backup دیتابیس در دسترس (برای ریستور)

---

## گام‌های بازسازی سرور

### گام ۱: نصب OS (۱۰ دقیقه)

**سیستم‌عامل**: Ubuntu 24.04 LTS (توصیه شده)

```bash
# حداقل specifications:
# CPU: 4 core
# RAM: 8 GB
# Storage: 50 GB SSD
# OS: Ubuntu 24.04 LTS Server
```

پس از نصب، SSH را تأیید کنید:

```bash
ssh root@<SERVER_IP>
```

**تنظیمات اولیه OS**:

```bash
# به‌روزرسانی سیستم
apt update && apt upgrade -y

# نصب ابزارهای پایه
apt install -y \
  curl wget git vim htop net-tools \
  ufw fail2ban unattended-upgrades

# تنظیم timezone
timedatectl set-timezone Asia/Tehran

# فایروال
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# فعال‌سازی unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

---

### گام ۲: نصب Docker (۵ دقیقه)

```bash
# حذف نسخه‌های قدیمی
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do
  apt remove -y $pkg 2>/dev/null || true
done

# نصب Docker official repository
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# فعال‌سازی Docker
systemctl enable --now docker

# افزودن user به گروه docker
usermod -aG docker $USER

# تأیید
docker --version
docker compose version
```

---

### گام ۳: کلون کردن Repository (۲ دقیقه)

```bash
mkdir -p /home/xennic
cd /home/xennic

# تنظیم SSH key برای دسترسی به GitHub
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
# 🔴 کلید را به GitHub Deploy Keys اضافه کنید

git clone git@github.com:anomalyco/xennic.git app
cd /home/xennic/app
```

---

### گام ۴: پیکربندی Environment (۵ دقیقه)

```bash
cp infrastructure/docker/compose/production/.env.production.template .env
vim .env
```

**مقادیر حیاتی در `.env`**:

| متغیر | اقدام |
|-------|-------|
| `POSTGRES_PASSWORD` | تولید: `openssl rand -base64 32` |
| `REDIS_PASSWORD` | تولید: `openssl rand -base64 32` |
| `RABBITMQ_DEFAULT_PASS` | تولید: `openssl rand -base64 32` |
| `CORS_ORIGINS` | آدرس دقیق فرانت‌اند |
| `API_PUBLIC_URL` | آدرس دقیق API |

تولید JWT keys:

```bash
mkdir -p infrastructure/secrets
ssh-keygen -t rsa -b 4096 -m PEM \
  -f infrastructure/secrets/jwtRS256.key -N ""
openssl rsa -in infrastructure/secrets/jwtRS256.key \
  -pubout -outform PEM \
  -out infrastructure/secrets/jwtRS256.key.pub
chmod 600 infrastructure/secrets/jwtRS256.key
```

---

### گام ۵: SSL Certificate (۳ دقیقه)

**گزینه A — Let's Encrypt (توصیه شده)**:

```bash
apt install -y certbot
certbot certonly --standalone \
  -d api.xennic.com \
  -d app.xennic.com

mkdir -p infrastructure/nginx/ssl
cp /etc/letsencrypt/live/api.xennic.com/fullchain.pem \
  infrastructure/nginx/ssl/
cp /etc/letsencrypt/live/api.xennic.com/privkey.pem \
  infrastructure/nginx/ssl/
```

**گزینه B — Self-Signed (توسعه/آزمایش)**:

```bash
mkdir -p infrastructure/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout infrastructure/nginx/ssl/privkey.pem \
  -out infrastructure/nginx/ssl/fullchain.pem \
  -subj "/CN=xennic.local"
```

---

### گام ۶: استقرار سرویس‌ها (۵ دقیقه)

```bash
cd /home/xennic/app

# دریافت آخرین image‌ها
docker compose -f infrastructure/docker/compose/production/docker-compose.yml pull

# اجرا
docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d

# پایش لاگ‌ها
docker compose -f infrastructure/docker/compose/production/docker-compose.yml logs -f --tail=50
```

---

### گام ۷: بازیابی دیتابیس (در صورت وجود بکاپ)

```bash
# اگر دیتابیس قبلی وجود دارد:
docker exec -i xennic-postgres pg_restore -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" --clean --if-exists \
  < backups/latest.dump
```

در غیر این صورت، اجرای migration:

```bash
docker exec xennic-api npx prisma migrate deploy
```

---

### گام ۸: تأیید نهایی

```bash
# اجرای health check
for name in \
  "Nginx:http://localhost/nginx-health" \
  "API:http://localhost/api/v1/health" \
  "Web:http://localhost:3001" \
  "Engineering:http://localhost:8001/health" \
  "AI:http://localhost:8002/health" \
  "Vision:http://localhost:8003/health"; do
  svc="${name%%:*}"
  url="${name#*:}"
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  echo "$svc: $([ "$code" = "200" ] && echo "✅" || echo "❌") ($code)"
done
```

---

## چک‌لیست تأیید بازسازی

- [ ] SSH به سرور وصل می‌شود
- [ ] فایروال فعال است (ports 22, 80, 443)
- [ ] Docker + Docker Compose نصب و فعال است
- [ ] Repository کلون شده است
- [ ] `.env` با مقادیر امن پر شده است
- [ ] JWT key pair تولید شده است
- [ ] SSL certificate معتبر است
- [ ] همه health endpoints OK هستند
- [ ] DNS records به IP جدید اشاره دارند
- [ ] cron job بکاپ فعال است
- [ ] monitoring به سرور جدید متصل است
- [ ] rate limiting فعال است

---

## اگر SSH قطع شود (Lost SSH)

### اگر containerها RUNNING هستند:

```bash
# از طریق provider console (Vultr, DigitalOcean, etc.)
# → Recovery console / VNC
# یا از طریق سرور دیگر:
ssh -J <JUMP_SERVER> xennic@<SERVER_IP>
```

### اگر سرور完全不响应:

1. از طریق provider console ری‌بوť کنید
2. اگر باز هم وصل نشد:
   - snapshot بگیرید
   - سرور جدید بسازید
   - از این runbook از گام ۱ پیروی کنید

### Preventative:

```bash
# همیشه user دوم با sudo ایجاد کنید
adduser xennic-backup
usermod -aG sudo xennic-backup

# و SSH key دوم اضافه کنید
echo "ssh-ed25519 AAAA... backup-key" >> ~/.ssh/authorized_keys
```

---

## Troubleshooting بازسازی

| مشکل | راه‌حل |
|------|--------|
| **Docker install fails** | `apt update` را تکرار کنید، یا `curl -fsSL https://get.docker.com \| sh` |
| **Git clone fails** | SSH key را در GitHub Deploy Keys بررسی کنید |
| **Container can't pull** | `docker login` یا `docker logout` و دوباره pull |
| **Port conflict** | `ss -tlnp \| grep 3000` و سرویس مزاحم را متوقف کنید |
| **Database restore fails** | بکاپ دیگر را امتحان کنید، یا migration تازه |

---

> **پس از بازسازی**: [Disaster Recovery Runbook](Disaster-Recovery.md) را برای تنظیم cron بکاپ بررسی کنید.
