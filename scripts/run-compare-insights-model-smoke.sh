#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${COMPARE_INSIGHTS_MODEL_SMOKE_PORT:-8821}"
URL="http://127.0.0.1:${PORT}/tests/compare-insights-model-smoke.html"
SESSION="sh6-compare-insights-model-smoke-$RANDOM-$RANDOM"
SERVER_LOG="${COMPARE_INSIGHTS_MODEL_SMOKE_SERVER_LOG:-/tmp/sh6-compare-insights-model-smoke-server.log}"
AGENT_BROWSER_TOOL_DIR="${AGENT_BROWSER_TOOL_DIR:-/tmp/sh6-agent-browser-tool}"
NPM_CACHE_DIR="${NPM_CACHE_DIR:-/tmp/sh6-npm-cache}"
AGENT_BROWSER_BIN=""
HTTP_PID=""

cleanup() {
  [[ -z "${HTTP_PID}" ]] || kill "${HTTP_PID}" >/dev/null 2>&1 || true
  [[ -z "${AGENT_BROWSER_BIN}" ]] || "${AGENT_BROWSER_BIN}" --session "${SESSION}" close >/dev/null 2>&1 || true
}
trap cleanup EXIT

if command -v agent-browser >/dev/null 2>&1; then
  AGENT_BROWSER_BIN="$(command -v agent-browser)"
else
  mkdir -p "${AGENT_BROWSER_TOOL_DIR}"
  if [[ ! -x "${AGENT_BROWSER_TOOL_DIR}/node_modules/.bin/agent-browser" ]]; then
    npm_config_cache="${NPM_CACHE_DIR}" npm install --silent --prefix "${AGENT_BROWSER_TOOL_DIR}" agent-browser >/dev/null
  fi
  AGENT_BROWSER_BIN="${AGENT_BROWSER_TOOL_DIR}/node_modules/.bin/agent-browser"
fi

echo "[compare-insights-model-smoke] Starting static server at ${URL}"
python3 -m http.server "${PORT}" --bind 127.0.0.1 --directory "${ROOT_DIR}" >"${SERVER_LOG}" 2>&1 &
HTTP_PID="$!"
sleep 1
kill -0 "${HTTP_PID}" >/dev/null 2>&1 || { echo "Server failed; see ${SERVER_LOG}" >&2; exit 1; }

"${AGENT_BROWSER_BIN}" --session "${SESSION}" open "${URL}" >/dev/null
"${AGENT_BROWSER_BIN}" --session "${SESSION}" wait "#status" >/dev/null

deadline=$((SECONDS + 90))
status=""
while (( SECONDS < deadline )); do
  status="$("${AGENT_BROWSER_BIN}" --session "${SESSION}" get text "#status" 2>/dev/null | tr -d '\r' | tail -n 1 | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
  [[ "${status}" != "PASS" && "${status}" != "FAIL" ]] || break
  sleep 1
done

result_json="$("${AGENT_BROWSER_BIN}" --session "${SESSION}" get text "#result" 2>/dev/null | tr -d '\r')"
echo "[compare-insights-model-smoke] status=${status}"
echo "${result_json}"
[[ "${status}" == "PASS" ]] || { echo "[compare-insights-model-smoke] FAIL" >&2; exit 1; }
echo "[compare-insights-model-smoke] PASS"
