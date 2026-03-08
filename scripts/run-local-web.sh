#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOST="${SH6_LOCAL_HOST:-127.0.0.1}"
PORT="${SH6_LOCAL_PORT:-8000}"
URL="http://${HOST}:${PORT}/"

echo "[sh6-local] Serving ${ROOT_DIR}"
echo "[sh6-local] Open ${URL}"

if command -v open >/dev/null 2>&1; then
  open "${URL}" >/dev/null 2>&1 || true
fi

exec python3 -m http.server "${PORT}" --bind "${HOST}" --directory "${ROOT_DIR}"
