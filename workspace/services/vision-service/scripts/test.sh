#!/usr/bin/env bash
set -euo pipefail

SERVICE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SERVICE_DIR"

source venv/bin/activate
python -m pytest tests/ -v --cov=app --cov-report=term-missing "$@"
