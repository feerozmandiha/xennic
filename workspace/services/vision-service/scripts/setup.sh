#!/usr/bin/env bash
set -euo pipefail

SERVICE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SERVICE_DIR"

echo "=== Setting up vision-service ==="
python3 -m venv venv
source venv/bin/activate

pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Install dev dependencies
pip install pytest pytest-asyncio pytest-cov ruff mypy

echo "=== Setup complete ==="
echo "Run: source venv/bin/activate"
echo "Run: uvicorn app.main:app --reload --port 8003"
