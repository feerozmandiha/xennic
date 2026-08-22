#!/bin/bash
# راه‌اندازی اپ موبایل زنیک روی پورت اختصاصی
PORT=${1:-3002}
export MOBILE_PORT=$PORT
echo "[mobile-app] شروع سرور روی پورت $PORT"
echo "[mobile-app] آدرس: http://localhost:$PORT"
echo "[mobile-app] اتصال مستقیم به vision-service: http://localhost:8003"
python3 server.py $PORT
