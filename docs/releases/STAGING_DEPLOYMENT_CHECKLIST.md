# چک‌لیست استقرار مرحله آزمایشی — Staging Deployment Checklist (Alpha)

**نسخه**: ۱.۰.۰ | **وضعیت**: پیش‌نویس | **آخرین بروزرسانی**: تیر ۱۴۰۵
**Target Environment**: Staging VPS — Xennic Platform v0.5.0-alpha

> این چک‌لیست برای تأیید آمادگی زیرساخت، امنیت، پشتیبان‌گیری، مانیتورینگ و انتشار نسخه Alpha در محیط Staging استفاده می‌شود.
> کلیه موارد باید پیش از Go-Live تأیید و توسط مسئول مربوطه امضا شوند.

---

## ۱. بررسی‌های زیرساخت — Infrastructure Checks

**مسئول**: DevOps Lead | **مدت زمان تخمینی**: ۳۰ دقیقه

| # | [ ] | آیتم — Item | دستور تأیید — Verification Command | Expected Result | توضیحات — Notes |
|---|-----|-------------|-------------------------------------|-----------------|-----------------|
| ۱ | [ ] | **Docker Engine** نصب و فعال | `docker --version && sudo systemctl is-active docker` | `Docker version 27.x.x` + `active` | حداقل نسخه ۲۴ |
| ۲ | [ ] | **Docker Compose v2** نصب | `docker compose version` | `Docker Compose version v2.29.x` | از `docker-compose` (v1) استفاده نشود |
| ۳ | [ ] | **فضای دیسک** > ۲۰ گیگابایت | `df -h / \| tail -1 \| awk '{print $$4}'` | > 20G available | برای Docker images و volumes |
| ۴ | [ ] | **حافظه** > ۴ گیگابایت | `free -h \| grep Mem \| awk '{print $$7}'` | > 4G available | سرویس‌ها: Postgres, Redis, RabbitMQ, MinIO, 3 Python services, Node.js |
| ۵ | [ ] | **هسته CPU** > ۲ هسته | `nproc` | >= 4 | برای اجرای همزمان ۱۰+ کانتینر |
| ۶ | [ ] | **اتصال شبکه** اینترنت | `ping -c 3 google.com \| tail -1` | `0% packet loss` | برای pull images و API calls |
| ۷ | [ ] | **DNS Resolution** دامنه‌ها | `dig api.xennic.com +short && dig app.xennic.com +short` | Each returns VPS IP | A records باید تنظیم شده باشند |
| ۸ | [ ] | **TLS Certificate** معتبر | `openssl s_client -connect api.xennic.com:443 -servername api.xennic.com < /dev/null 2>/dev/null \| openssl x509 -noout -dates` | `notBefore` و `notAfter` معتبر | Let's Encrypt, حداقل ۳۰ روز اعتبار |
| ۹ | [ ] | **پورت‌ها** در دسترس | `ss -tlnp \| grep -E ':(80|443|5432|6379|5672|15672|9000|9090|3000|3001|8001|8002|8003)\b'` | Only expected services listening | پورت‌های تکراری (conflict) نداشته باشند |
| ۱۰ | [ ] | **نسخه OS** مناسب | `lsb_release -ds` | `Ubuntu 24.04 LTS` | مطابق VPS_PREPARATION_GUIDE.md |
| ۱۱ | [ ] | **Docker daemon.json** پیکربندی | `sudo cat /etc/docker/daemon.json \| python3 -m json.tool` | Valid JSON with log config | live-restore, log rotation |
| ۱۲ | [ ] | **Docker network** وجود دارد | `docker network ls \| grep xennic-network` | `xennic-network` present | شبکه bridge اختصاصی |

---

## ۲. بررسی‌های امنیتی — Security Checks

**مسئول**: Security Lead | **مدت زمان تخمینی**: ۲۰ دقیقه

| # | [ ] | آیتم — Item | دستور تأیید — Verification Command | Expected Result | توضیحات — Notes |
|---|-----|-------------|-------------------------------------|-----------------|-----------------|
| ۱ | [ ] | **Firewall rules** (UFW) | `sudo ufw status numbered` | Only 22, 80, 443 allowed | `default deny incoming` فعال باشد |
| ۲ | [ ] | **SSH Root Login** غیرفعال | `sudo sshd -T \| grep permitrootlogin` | `permitrootlogin no` | فقط کاربر `xennic` مجاز است |
| ۳ | [ ] | **SSH PasswordAuth** غیرفعال | `sudo sshd -T \| grep passwordauthentication` | `passwordauthentication no` | فقط key-based auth |
| ۴ | [ ] | **fail2ban status** فعال | `sudo fail2ban-client status sshd \| grep "Currently banned"` | Jail active, `Currently banned: 0+` | حتماً sshd و recidive jails فعال باشند |
| ۵ | [ ] | **unattended-upgrades** فعال | `sudo systemctl is-active unattended-upgrades` | `active` | Auto-reboot در ۰۴:۰۰ UTC تنظیم شده باشد |
| ۶ | [ ] | **کاربر xennic** در گروه docker | `groups xennic \| grep docker` | `docker` in group | بدون sudo اجرای Docker |
| ۷ | [ ] | **Secret scanning** (Git history) | `git log --all -p \| grep -i "password\|secret\|PRIVATE_KEY\|API_KEY" \| head -5` | No matches | هیچ‌ credentialای در تاریخچه نیست |
| ۸ | [ ] | **.env file permissions** | `stat -c "%a %n" .env 2>/dev/null \|\| echo "No .env"` | `600` | فقط owner بخواند |
| ۹ | [ ] | **Docker Secrets** پیکربندی | `docker secret ls 2>/dev/null; ls -la infrastructure/secrets/` | Secrets files with `600` | JWT keys, passwords |
| ۱۰ | [ ] | **Non-root user** در کانتینرها | `grep -r "USER" --include="Dockerfile" apps/api/ apps/web/ workspace/services/` | `USER node` or `USER nobody` | هیچ‌ Dockerfileای از root استفاده نکند |

---

## ۳. بررسی‌های پشتیبان‌گیری — Backup Checks

**مسئول**: DevOps Lead | **مدت زمان تخمینی**: ۱۵ دقیقه

| # | [ ] | آیتم — Item | دستور تأیید — Verification Command | Expected Result | توضیحات — Notes |
|---|-----|-------------|-------------------------------------|-----------------|-----------------|
| ۱ | [ ] | **Backup directory** وجود دارد | `ls -la /var/backups/xennic/ \|\| ls -la backups/` | Directory exists with write permission | مسیر در backup script مشخص شده باشد |
| ۲ | [ ] | **Recent backup** موجود است | `ls -lt /var/backups/xennic/*.dump 2>/dev/null \| head -3` | Backup from last 24h | اسکریپت `scripts/db-backup.sh` اجرا شده باشد |
| ۳ | [ ] | **Backup format** معتبر | `file /var/backups/xennic/latest.dump 2>/dev/null \|\| pg_restore -l latest.dump > /dev/null 2>&1 && echo "valid"` | `valid` (PostgreSQL custom format) | فایل خراب نباشد |
| ۴ | [ ] | **Backup size** معقول | `ls -lh /var/backups/xennic/latest.dump \| awk '{print $$5}'` | > 1 MB (non-empty) | حجم صفر نشانه backup failed |
| ۵ | [ ] | **Restore script** موجود | `ls -la scripts/db-restore.sh` | `db-restore.sh` موجود و `+x` | اسکریپت بازیابی تست شده باشد |
| ۶ | [ ] | **Offsite copy** تأیید شد | `rclone ls remote:xennic-backups/ 2>/dev/null \|\| echo "Check manually"` | Remote copy exists or manual check confirmed | S3/Backblaze/rsync به سرور دیگر |

---

## ۴. بررسی‌های مانیتورینگ — Monitoring Checks

**مسئول**: DevOps Lead | **مدت زمان تخمینی**: ۲۰ دقیقه

| # | [ ] | آیتم — Item | دستور تأیید — Verification Command | Expected Result | توضیحات — Notes |
|---|-----|-------------|-------------------------------------|-----------------|-----------------|
| ۱ | [ ] | **Prometheus targets** UP | `curl -s http://localhost:9090/api/v1/targets \| jq '.data.activeTargets[] \| select(.health=="up") \| .labels.job'` | All configured targets listed | api, engineering, ai, vision, postgres, node |
| ۲ | [ ] | **Grafana datasources** پیکربندی | `curl -s -u admin:\$GRAFANA_PASS http://localhost:3002/api/datasources \| jq '.[].name'` | Includes Prometheus, Loki | Datasources provisioned correctly |
| ۳ | [ ] | **Loki log shipping** فعال | `curl -s "http://localhost:3100/loki/api/v1/query_range" --data-urlencode 'query={job=~".+"}' \| jq '.data.result \| length'` | `> 0` | لاگ‌ها از همه سرویس‌ها به Loki می‌رسند |
| ۴ | [ ] | **Alert rules** پیکربندی | `curl -s http://localhost:9090/api/v1/rules \| jq '.data.groups[].rules \| length'` | `>= 5` alert rules | ServiceDown, HighCpu, HighMemory, HighLatency, HighErrorRate |
| ۵ | [ ] | **Grafana dashboards** قابل مشاهده | `curl -s -u admin:\$GRAFANA_PASS http://localhost:3002/api/search \| jq '.[].title'` | System Health, API Performance, etc. | حداقل ۳ dashboard provisioned |
| ۶ | [ ] | **Uptime check** endpoint | `curl -s -o /dev/null -w "%{http_code}" https://api.xennic.com/api/v1/health` | `200` | Endpoint عمومی از خارج قابل دسترسی است |

---

## ۵. بررسی‌های انتشار — Release Approval Checks

**مسئول**: Tech Lead + QA Lead | **مدت زمان تخمینی**: ۴۵ دقیقه

| # | [ ] | آیتم — Item | دستور تأیید — Verification Command | Expected Result | توضیحات — Notes |
|---|-----|-------------|-------------------------------------|-----------------|-----------------|
| ۱ | [ ] | **All tests passing** | `pnpm test 2>&1 \| tail -5` | `Tests: XXX passed, XXX total` | Unit + e2e tests |
| ۲ | [ ] | **Build validation** | `pnpm build 2>&1 \| tail -5` | Build successful, no errors | NestJS, Next.js, Python services |
| ۳ | [ ] | **Lint & typecheck** | `pnpm lint && pnpm typecheck` | No errors | ESLint + TypeScript strict |
| ۴ | [ ] | **Python lint (ruff)** | `cd workspace/services/engineering-service && ruff check src && mypy src --strict` | All checks passed | برای هر ۳ سرویس Python |
| ۵ | [ ] | **Known issues reviewed** | `cat docs/releases/KNOWN_ISSUES.md \| head -20` | All reviewed, no P0/P1 blockers | لیست issues در مستند Known Issues |
| ۶ | [ ] | **Rollback plan** مستند | `ls -la docs/runbooks/Rollback.md` | File exists and reviewed | تیم rollback procedure را بلد باشد |
| ۷ | [ ] | **Load test results** > baseline | `cat docs/releases/BUILD_VALIDATION_REPORT.md \| grep -i "load\|perf\|latency"` | Latency < 2s p95, Error rate < 1% | تست k6 اجرا شده باشد |
| ۸ | [ ] | **Security audit** complete | `cat docs/releases/ALPHA_SECURITY_CHECKLIST.md \| grep -E "\[x\]" \| wc -l` | All checklist items completed | آیتم‌های release gate امنیتی پاس شده باشند |
| ۹ | [ ] | **Docker images** تگ شده | `docker images --format "{{.Repository}}:{{.Tag}}" \| grep xennic \| grep -v latest` | Semantic tags (e.g., `0.5.0-alpha`) | از تگ `latest` در staging استفاده نشود |
| ۱۰ | [ ] | **Go-live sign-off** جمع‌آوری | `ls -la docs/releases/SIGNOFF*.md 2>/dev/null \|\| echo "Pending"` | Sign-off document exists | امضای Tech Lead, DevOps Lead, Product Owner |

---

## ۶. مراحل استقرار — Deployment Steps

پس از تأیید تمام موارد بالا، استقرار را به ترتیب زیر انجام دهید:

### ۶.۱. آماده‌سازی — Preparation

```bash
# 1. اطمینان از آخرین کد
git checkout main && git pull origin main

# 2. بررسی آخرین commit
git log --oneline -3

# 3. تنظیم environment
cp infrastructure/docker/compose/production/.env.production.template .env
# .env را با مقادیر واقعی پر کنید
vim .env
chmod 600 .env
```

### ۶.۲. استقرار سرویس‌ها — Deploy Services

```bash
# 4. Pull images
docker compose -f infrastructure/docker/compose/production/docker-compose.yml pull

# 5. Start infrastructure
docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d postgres redis rabbitmq minio pgbouncer

# 6. Wait for health
sleep 15
docker compose -f infrastructure/docker/compose/production/docker-compose.yml ps

# 7. Run migrations
docker compose -f infrastructure/docker/compose/production/docker-compose.yml run --rm api npx prisma migrate deploy

# 8. Start application services
docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d engineering-service ai-service vision-service api web

# 9. Start reverse proxy
docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d nginx

# 10. Start monitoring
docker compose -f infrastructure/docker/compose/production/docker-compose.yml up -d prometheus grafana loki promtail
```

### ۶.۳. تأیید نهایی — Final Verification

```bash
# 11. Status check
docker compose -f infrastructure/docker/compose/production/docker-compose.yml ps
# Expected: All services "Up (healthy)"

# 12. Health check
curl -s https://api.xennic.com/api/v1/health | jq .

# 13. Run smoke tests
bash scripts/smoke-test.sh
```

---

## ۷. امضا — Sign-Off

| نقش — Role | نام — Name | تاریخ — Date | امضا — Signature |
|------------|------------|--------------|------------------|
| **DevOps Lead** | ___________ | ___________ | ___________ |
| **Security Lead** | ___________ | ___________ | ___________ |
| **Tech Lead** | ___________ | ___________ | ___________ |
| **QA Lead** | ___________ | ___________ | ___________ |
| **Product Owner** | ___________ | ___________ | ___________ |

> **شرط انتشار**: همه ۵ بخش چک‌لیست باید ۱۰۰٪ تأیید شوند. هر آیتم تأیید نشده باید با توضیح مستند و زمان‌بندی رفع شود.

---

## مستندات مرتبط — Related Documents

| سند | مسیر |
|-----|------|
| VPS Preparation Guide | `docs/deployment/VPS_PREPARATION_GUIDE.md` |
| Deployment Checklist | `docs/releases/DEPLOYMENT_CHECKLIST.md` |
| Alpha Go-Live Runbook | `docs/releases/ALPHA_GO_LIVE.md` |
| Alpha Release Gate | `docs/releases/ALPHA_RELEASE_GATE.md` |
| Alpha Security Checklist | `docs/releases/ALPHA_SECURITY_CHECKLIST.md` |
| Known Issues | `docs/releases/KNOWN_ISSUES.md` |
| Build Validation Report | `docs/releases/BUILD_VALIDATION_REPORT.md` |
| Production Checklist | `docs/deployment/PRODUCTION_CHECKLIST.md` |
| Infrastructure Spec | `docs/deployment/XENNIC_INFRASTRUCTURE_SPEC_v1.md` |
| Environment Variables | `docs/deployment/ENVIRONMENT_VARIABLES.md` |

---

## تاریخچه نسخه‌ها — Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | تیر ۱۴۰۵ | انتشار اولیه |
