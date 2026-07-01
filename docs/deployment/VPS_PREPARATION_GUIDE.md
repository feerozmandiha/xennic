# راهنمای آماده‌سازی سرور مجازی — VPS Preparation Guide

**نسخه**: ۱.۰.۰ | **وضعیت**: پیش‌نویس | **آخرین بروزرسانی**: تیر ۱۴۰۵
**Target Platform**: Ubuntu 24.04 LTS — Single VPS Deployment

---

## فهرست — Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Ubuntu 24.04 Installation](#2-ubuntu-2404-installation)
3. [User Creation & SSH Hardening](#3-user-creation--ssh-hardening)
4. [Firewall Configuration](#4-firewall-configuration)
5. [Docker Installation](#5-docker-installation)
6. [Docker Compose Installation](#6-docker-compose-installation)
7. [fail2ban Setup](#7-fail2ban-setup)
8. [Automatic Security Updates](#8-automatic-security-updates)
9. [System Tuning](#9-system-tuning)
10. [Monitoring Agents (Optional)](#10-monitoring-agents-optional)
11. [Verification](#11-verification)

---

## 1. Prerequisites

Before starting, ensure you have:

| مورد | توضیحات |
|------|---------|
| **Domain name** | `xennic.com` registered and accessible |
| **DNS A records** | `api.xennic.com` → VPS IP, `app.xennic.com` → VPS IP |
| **VPS root access** | Root password or SSH key from provider |
| **Minimum specs** | 4 CPU cores, 8 GB RAM, 100 GB SSD |
| **Network** | Public IP with ports 22, 80, 443 accessible |

---

## 2. Ubuntu 24.04 Installation

### 2.1. انتخاب توزیع — Distribution Selection

از پنل مدیریت VPS خود، Ubuntu 24.04 LTS (Noble Numbat) را انتخاب کنید.

گزینه‌های پیشنهادی هنگام نصب:
- Minimal server installation
- OpenSSH server (انتخاب کنید)
- Standard system utilities

### 2.2. ورود اولیه — Initial Login

پس از نصب، از طریق SSH با کاربر root وارد شوید:

```bash
ssh root@<VPS_IP_ADDRESS>
```

Expected output:
```
Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.x x86_64)
```

### 2.3. به‌روزرسانی سیستم — System Update

```bash
apt update && apt upgrade -y
apt autoremove -y
```

نصب ابزارهای ضروری:

```bash
apt install -y curl wget git vim htop net-tools ca-certificates gnupg lsb-release
```

---

## 3. User Creation & SSH Hardening

### 3.1. ایجاد کاربر xennic — Create xennic User

```bash
adduser xennic
```

دستورات را دنبال کنید:
- Password: یک رمز عبور قوی (۲۴+ کاراکتر) وارد کنید
- Full Name: `Xennic Admin`
- سایر فیلدها: خالی بگذارید

افزودن به گروه sudo:

```bash
usermod -aG sudo xennic
```

تأیید:

```bash
id xennic
# Expected: uid=1001(xennic) gid=1001(xennic) groups=1001(xennic),27(sudo)
```

### 3.2. تنظیم SSH Key — SSH Key Setup

روی **سیستم محلی خود** (نه VPS)، کلید SSH بسازید:

```bash
ssh-keygen -t ed25519 -a 100 -f ~/.ssh/xennic_vps -C "xennic@vps"
```

کپی کلید به VPS:

```bash
ssh-copy-id -i ~/.ssh/xennic_vps.pub xennic@<VPS_IP_ADDRESS>
```

### 3.3. پیکربندی SSH — SSH Configuration

فایل `/etc/ssh/sshd_config` را ویرایش کنید:

```bash
sudo vim /etc/ssh/sshd_config
```

تنظیمات زیر را اعمال کنید:

```ssh-config
# غیرفعال کردن ورود root
PermitRootLogin no

# فقط کلید SSH
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no

# AllowUsers
AllowUsers xennic

# (اختیاری) تغییر پورت SSH
# Port 2222

# محدودیت تلاش
MaxAuthTries 3
MaxSessions 5

# تنظیمات امنیتی
Protocol 2
HostKeyAlgorithms ssh-ed25519,rsa-sha2-512,rsa-sha2-256
KexAlgorithms curve25519-sha256,diffie-hellman-group-exchange-sha256
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com

# inactivity timeout
ClientAliveInterval 300
ClientAliveCountMax 2
```

اعمال تغییرات:

```bash
sudo sshd -t                          # تست syntax
sudo systemctl reload sshd            # بارگذاری مجدد
```

### 3.4. تست ورود — Test Login

در یک ترمینال جداگانه تست کنید (ترمینال فعلی را نبندید):

```bash
ssh -i ~/.ssh/xennic_vps xennic@<VPS_IP_ADDRESS>
```

تأیید کنید که ورود root کار نمی‌کند:

```bash
ssh root@<VPS_IP_ADDRESS>
# Expected: Permission denied (publickey)
```

---

## 4. Firewall Configuration

### 4.1. تنظیم UFW — UFW Setup

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

باز کردن پورت‌های ضروری:

```bash
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
```

> اگر پورت SSH را تغییر داده‌اید، پورت جدید را جایگزین `22` کنید.

فعال‌سازی فایروال:

```bash
sudo ufw enable
# Expected: Firewall is active and enabled on system startup
```

بررسی وضعیت:

```bash
sudo ufw status verbose
```

Expected output:
```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp (SSH)               ALLOW IN    Anywhere
80/tcp (HTTP)              ALLOW IN    Anywhere
443/tcp (HTTPS)            ALLOW IN    Anywhere
```

### 4.2. پورت‌های Docker — Docker Ports

در استقرار Xennic، Docker از پورت‌های داخلی استفاده می‌کند که از طریق Nginx reverse proxy (پورت‌های ۸۰ و ۴۴۳) در معرض اینترنت قرار می‌گیرند. پورت‌های Docker **نیازی به باز کردن مستقیم در UFW ندارند**، مگر برای دسترسی‌های مدیریتی:

```bash
# (اختیاری) برای دسترسی به Grafana dashboard از طریق IP مستقیم
# sudo ufw allow 3002/tcp comment 'Grafana'

# (اختیاری) برای RabbitMQ management UI
# sudo ufw allow 15672/tcp comment 'RabbitMQ Admin'
```

> **توصیه امنیتی**: پورت‌های مدیریتی را فقط از طریق VPN یا SSH tunnel در دسترس قرار دهید.

---

## 5. Docker Installation

### 5.1. حذف نسخه‌های قدیمی — Remove Old Versions

```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  sudo apt remove -y $pkg 2>/dev/null || true
done
```

### 5.2. نصب از مخزن رسمی — Install from Official Repository

```bash
# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
```

### 5.3. نصب Docker Engine — Install Docker Engine

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin
```

### 5.4. افزودن کاربر به گروه docker — Add User to Docker Group

```bash
sudo usermod -aG docker xennic
```

> **نکته**: برای اعمال تغییر گروه، از سیستم خارج شوید و دوباره وارد شوید (`exit` سپس `ssh ...`). یا از `newgrp docker` استفاده کنید.

### 5.5. تأیید نصب — Verify Installation

```bash
docker --version
# Expected: Docker version 27.x.x, build xxxxxxx

sudo systemctl status docker --no-pager
# Expected: active (running)
```

آزمایش hello-world:

```bash
docker run hello-world
# Expected: Hello from Docker! message
```

### 5.6. تنظیم لاگ‌گیری Docker — Docker Logging Configuration

فایل `/etc/docker/daemon.json` را ایجاد کنید:

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "live-restore": true
}
EOF
```

راه‌اندازی مجدد Docker:

```bash
sudo systemctl restart docker
```

---

## 6. Docker Compose Installation

### 6.1. نصب Docker Compose Plugin — Install Compose Plugin

از داکر ۲۴ به بعد، `docker compose` (v2) به عنوان plugin در دسترس است:

```bash
sudo apt install -y docker-compose-plugin
```

تأیید نصب:

```bash
docker compose version
# Expected: Docker Compose version v2.29.x
```

### 6.2. تنظیم تکمیل خودکار — Auto-completion Setup

```bash
sudo curl -L \
  https://raw.githubusercontent.com/docker/compose/master/contrib/completion/bash/docker-compose \
  -o /etc/bash_completion.d/docker-compose
```

---

## 7. fail2ban Setup

### 7.1. نصب fail2ban — Install fail2ban

```bash
sudo apt install -y fail2ban
```

### 7.2. تنظیم SSH Jail — SSH Jail Configuration

فایل `/etc/fail2ban/jail.local` را ایجاد کنید:

```bash
sudo tee /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
# Whitelist your own IP (optional)
# ignoreip = <YOUR_HOME_IP>
bantime = 1h
findtime = 10m
maxretry = 5
banaction = ufw
banaction_allports = ufw

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 24h
findtime = 10m
```

### 7.3. تنظیم Recidive Jail — Recidive Jail

Recidive jail کاربرانی را که مکرراً banned می‌شوند برای مدت طولانی‌تری مسدود می‌کند:

```bash
sudo tee -a /etc/fail2ban/jail.local << 'EOF'

[recidive]
enabled = true
logpath = /var/log/fail2ban.log
banaction = ufw
bantime = 1w
findtime = 1d
maxretry = 3
```

### 7.4. راه‌اندازی fail2ban — Start fail2ban

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

بررسی وضعیت:

```bash
sudo fail2ban-client status
# Expected: Status |- Number of jail: 2 |- Jail list: recidive, sshd

sudo fail2ban-client status sshd
# Expected: Status for the jail: sshd
```

---

## 8. Automatic Security Updates

### 8.1. نصب unattended-upgrades — Install unattended-upgrades

```bash
sudo apt install -y unattended-upgrades apt-listchanges
```

### 8.2. پیکربندی — Configuration

فایل `/etc/apt/apt.conf.d/50unattended-upgrades` را ویرایش کنید:

```bash
sudo tee /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}:${distro_codename}-updates";
    "${distro_id}:${distro_codename}-proposed";
};
Unattended-Upgrade::DevRelease "false";
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";
Unattended-Upgrade::OnlyOnACPower "false";
EOF
```

### 8.3. فعال‌سازی خودکار — Enable Auto Updates

```bash
sudo tee /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF
```

### 8.4. تست پیکربندی — Test Configuration

```bash
sudo unattended-upgrades --dry-run --debug
# Expected: No errors, packages listed for update
```

---

## 9. System Tuning

### 9.1. Ulimit Settings

فایل `/etc/security/limits.d/xennic.conf` را ایجاد کنید:

```bash
sudo tee /etc/security/limits.d/xennic.conf << 'EOF'
# افزایش محدودیت‌های systemd و Docker
*               soft    nofile          1048576
*               hard    nofile          1048576
*               soft    nproc           unlimited
*               hard    nproc           unlimited
*               soft    memlock         unlimited
*               hard    memlock         unlimited
root            soft    nofile          1048576
root            hard    nofile          1048576
EOF
```

### 9.2. Kernel Parameters for Docker

فایل `/etc/sysctl.d/99-xennic.conf` را ایجاد کنید:

```bash
sudo tee /etc/sysctl.d/99-xennic.conf << 'EOF'
# Network tuning for Docker
net.ipv4.ip_forward = 1
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1

# افزایش محدودیت‌های شبکه
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.core.netdev_max_backlog = 65535

# TCP optimization
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_intvl = 30
net.ipv4.tcp_keepalive_probes = 5

# Virtual memory
vm.max_map_count = 262144
vm.swappiness = 10
vm.dirty_ratio = 80
vm.dirty_background_ratio = 5

# File system
fs.file-max = 2097152
fs.inotify.max_user_watches = 524288
EOF
```

اعمال تنظیمات:

```bash
sudo sysctl --system
```

تأیید:

```bash
sudo sysctl fs.file-max net.core.somaxconn vm.swappiness
# Expected: fs.file-max = 2097152, net.core.somaxconn = 65535, vm.swappiness = 10
```

### 9.3. تنظیم Swap — Swap Configuration

برای سرور با ۸ گیگابایت رم، swap به اندازه ۲ گیگابایت کافی است:

```bash
# بررسی swap موجود
sudo swapon --show

# اگر swap وجود ندارد
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# دائمی کردن
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# تنظیم swappiness (قبلاً در sysctl تنظیم شد)
sudo sysctl vm.swappiness=10
```

### 9.4. تنظیم Timezone — Timezone Configuration

```bash
sudo timedatectl set-timezone Asia/Tehran
timedatectl
# Expected: Time zone: Asia/Tehran (+0330, +0430)
```

> **اختیاری**: در صورت نیاز به UTC برای لاگ‌های Docker:
> ```bash
> sudo timedatectl set-timezone UTC
> ```

---

## 10. Monitoring Agents (Optional)

### 10.1. نصب Node Exporter — Install Node Exporter

Node Exporter معیارهای سطح سیستم (CPU، حافظه، دیسک، شبکه) را برای Prometheus فراهم می‌کند.

```bash
# دانلود آخرین نسخه
NODE_EXPORTER_VERSION="1.8.2"
wget https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz
tar xzf node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz
sudo mv node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64*
```

ایجاد سرویس systemd:

```bash
sudo tee /etc/systemd/system/node_exporter.service << 'EOF'
[Unit]
Description=Prometheus Node Exporter
After=network.target

[Service]
User=nobody
Group=nogroup
Type=simple
ExecStart=/usr/local/bin/node_exporter \
  --web.listen-address=:9100 \
  --collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/) \
  --collector.textfile.directory=/var/lib/node_exporter/textfile_collector
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

راه‌اندازی سرویس:

```bash
sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

تأیید:

```bash
curl -s http://localhost:9100/metrics | head -5
# Expected: Node Exporter metrics output
```

### 10.2. به‌روزرسانی Prometheus — Update Prometheus Config

در فایل `infrastructure/monitoring/prometheus/prometheus.yml`، target زیر را اضافه کنید:

```yaml
- job_name: 'node'
  static_configs:
    - targets: ['host.docker.internal:9100']
```

> **توجه**: در Docker Linux، به جای `host.docker.internal` از IP گیت‌وی (معمولاً `172.17.0.1`) استفاده کنید:
> ```bash
> ip route show default | awk '{print $3}'
> ```

---

## 11. Verification

### 11.1. چک‌لیست نهایی — Final Verification

| # | مورد | دستور بررسی | Expected Result |
|---|------|-------------|-----------------|
| 1 | OS version | `lsb_release -a` | Ubuntu 24.04 LTS |
| 2 | User exists | `id xennic` | uid=1001(xennic) ... groups=...27(sudo) |
| 3 | SSH config | `sudo sshd -T \| grep permitrootlogin` | `permitrootlogin no` |
| 4 | UFW active | `sudo ufw status` | Status: active |
| 5 | UFW rules | `sudo ufw status numbered` | SSH, HTTP, HTTPS allowed |
| 6 | Docker installed | `docker --version` | Docker version 27.x.x |
| 7 | Docker running | `sudo systemctl is-active docker` | active |
| 8 | Docker in group | `groups xennic \| grep docker` | docker group present |
| 9 | Docker Compose | `docker compose version` | Docker Compose version v2.x.x |
| 10 | fail2ban active | `sudo fail2ban-client status` | Jail list: sshd, recidive |
| 11 | unattended-upgrades | `sudo systemctl is-active unattended-upgrades` | active |
| 12 | ulimit | `ulimit -n` | 1048576 |
| 13 | sysctl | `sudo sysctl vm.swappiness` | vm.swappiness = 10 |
| 14 | Swap | `sudo swapon --show` | /swapfile 2G |
| 15 | Timezone | `timedatectl \| grep "Time zone"` | Asia/Tehran or UTC |
| 16 | Disk space | `df -h /` | > 50 GB available |
| 17 | Memory | `free -h` | > 4 GB available |
| 18 | CPU cores | `nproc` | >= 4 |

### 11.2. تست اتصال DNS — DNS Resolution Test

```bash
dig api.xennic.com +short
# Expected: <VPS_IP_ADDRESS>

dig app.xennic.com +short
# Expected: <VPS_IP_ADDRESS>

nslookup xennic.com
# Expected: Authoritative answer with A record
```

### 11.3. تست جامع Docker — Docker Comprehensive Test

```bash
docker run --rm alpine:latest sh -c "
  echo 'Container is running'
  echo 'CPU cores: \$(nproc)'
  echo 'Memory: \$(free -m | grep Mem | awk \"{print \\\$2}\") MB'
  echo 'Hostname: \$(hostname)'
  echo 'DNS: \$(nslookup xennic.com 2>/dev/null || echo OK)'"
```

### 11.4. ذخیره Snakeoil — Save Verification Output

```bash
{
  echo "=== Xennic VPS Verification Report ==="
  echo "Date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo "Hostname: $(hostname)"
  echo "OS: $(lsb_release -ds)"
  echo "Kernel: $(uname -r)"
  echo "CPU: $(nproc) cores"
  echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
  echo "Disk: $(df -h / | tail -1 | awk '{print $2, $4}')"
  echo "Docker: $(docker --version)"
  echo "Compose: $(docker compose version)"
  echo "---"
  echo "UFW: $(sudo ufw status | head -1)"
  echo "fail2ban: $(sudo systemctl is-active fail2ban)"
  echo "unattended-upgrades: $(sudo systemctl is-active unattended-upgrades)"
} | sudo tee /root/xennic-vps-verify-$(date +%Y%m%d).txt
```

---

## مستندات مرتبط — Related Documents

| سند | مسیر |
|-----|------|
| Server Setup | `docs/deployment/SERVER_SETUP.md` |
| Production Checklist | `docs/deployment/PRODUCTION_CHECKLIST.md` |
| Docker Compose | `docs/deployment/DOCKER_COMPOSE.md` |
| Infrastructure Spec | `docs/deployment/XENNIC_INFRASTRUCTURE_SPEC_v1.md` |
| Deployment Checklist | `docs/releases/DEPLOYMENT_CHECKLIST.md` |
| Alpha Go-Live | `docs/releases/ALPHA_GO_LIVE.md` |
| Security Checklist | `docs/releases/ALPHA_SECURITY_CHECKLIST.md` |
| DNS Configuration | `docs/deployment/DOMAIN_CONFIGURATION.md` |
| Nginx Config | `docs/deployment/NGINX.md` |
| HTTPS Config | `docs/deployment/HTTPS.md` |

---

## تاریخچه نسخه‌ها — Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | تیر ۱۴۰۵ | انتشار اولیه |
