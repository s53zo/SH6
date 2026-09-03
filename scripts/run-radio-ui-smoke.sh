#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${RADIO_UI_SMOKE_PORT:-8831}"
URL="http://127.0.0.1:${PORT}/tests/radio-ui-smoke.html"
SESSION="sh6-radio-ui-$RANDOM-$RANDOM"
SERVER_LOG="${RADIO_UI_SMOKE_SERVER_LOG:-/tmp/sh6-radio-ui-smoke.log}"
HTTP_PID=""
AB="$(command -v agent-browser || true)"
if [[ -z "${AB}" && -x "/tmp/sh6-agent-browser-tool/node_modules/.bin/agent-browser" ]]; then
  AB="/tmp/sh6-agent-browser-tool/node_modules/.bin/agent-browser"
fi
cleanup() { [[ -n "${HTTP_PID}" ]] && kill "${HTTP_PID}" >/dev/null 2>&1 || true; [[ -n "${AB}" ]] && "${AB}" --session "${SESSION}" close >/dev/null 2>&1 || true; }
trap cleanup EXIT
if [[ -z "${AB}" ]]; then echo "agent-browser is required" >&2; exit 1; fi
python3 -m http.server "${PORT}" --bind 127.0.0.1 --directory "${ROOT_DIR}" >"${SERVER_LOG}" 2>&1 & HTTP_PID="$!"
sleep 1
"${AB}" --session "${SESSION}" open "${URL}" >/dev/null
"${AB}" --session "${SESSION}" wait "#status" >/dev/null
deadline=$((SECONDS + 90)); status=""
while (( SECONDS < deadline )); do
  status="$("${AB}" --session "${SESSION}" get text "#status" 2>/dev/null | tr -d '\r' | tail -n 1 | xargs)"
  [[ "${status}" == "PASS" || "${status}" == "FAIL" ]] && break
  sleep 1
done
"${AB}" --session "${SESSION}" get text "#result"
[[ "${status}" == "PASS" ]] || { echo "[radio-ui-smoke] ${status:-TIMEOUT}" >&2; exit 1; }
echo "[radio-ui-smoke] PASS"
