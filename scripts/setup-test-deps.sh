#!/bin/bash
# ── نصب dependencies تست ──────────────────────────────────────────────────
# اجرا: bash xennic-patch/scripts/setup-test-deps.sh

echo "📦 نصب ابزارهای تست..."

# jq
if ! command -v jq &>/dev/null; then
  echo "  → نصب jq..."
  sudo apt-get update -qq && sudo apt-get install -y -qq jq || {
    # fallback: snap
    sudo snap install jq 2>/dev/null || echo "  ⚠️  jq نصب نشد — sudo لازم است"
  }
else
  echo "  ✅ jq موجود: $(jq --version)"
fi

# python3 pip
if ! command -v pip3 &>/dev/null; then
  echo "  → نصب pip3..."
  sudo apt-get install -y -qq python3-pip 2>/dev/null
fi

# flask (برای mock server)
if ! python3 -c "import flask" &>/dev/null; then
  echo "  → نصب flask..."
  pip3 install flask --quiet || pip3 install flask --quiet --break-system-packages
fi

echo ""
echo "✅ وضعیت:"
command -v jq &>/dev/null && echo "  jq: $(jq --version)" || echo "  ❌ jq نصب نشد"
python3 -c "import flask; print(f'  flask: {flask.__version__}')" 2>/dev/null || echo "  ❌ flask نصب نشد"

echo ""
echo "🚀 حالا می‌توانید اجرا کنید:"
echo "  bash xennic-patch/scripts/test-full.sh"
echo "  python3 xennic-patch/scripts/test-engineering.py"
echo "  python3 xennic-patch/scripts/mock-api.py"
