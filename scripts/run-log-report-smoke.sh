#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${LOG_REPORT_SMOKE_PORT:-8826}"
URL="http://127.0.0.1:${PORT}/"
FIXTURE_LOG="${ROOT_DIR}/tests/fixtures/operating-style-demo.log"
SERVER_LOG="${LOG_REPORT_SMOKE_SERVER_LOG:-/tmp/sh6-log-report-smoke-server.log}"
NPM_CACHE_DIR="${NPM_CACHE_DIR:-/tmp/sh6-npm-cache}"
AGENT_BROWSER_TOOL_DIR="${AGENT_BROWSER_TOOL_DIR:-/tmp/sh6-agent-browser-tool}"
AGENT_BROWSER_BIN=""
HTTP_PID=""

cleanup() {
  if [[ -n "${HTTP_PID}" ]]; then
    kill "${HTTP_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

setup_agent_browser() {
  if command -v agent-browser >/dev/null 2>&1; then
    AGENT_BROWSER_BIN="$(command -v agent-browser)"
    return
  fi

  mkdir -p "${AGENT_BROWSER_TOOL_DIR}"
  if [[ ! -x "${AGENT_BROWSER_TOOL_DIR}/node_modules/.bin/agent-browser" ]]; then
    npm_config_cache="${NPM_CACHE_DIR}" npm install --silent --prefix "${AGENT_BROWSER_TOOL_DIR}" agent-browser >/dev/null
  fi
  AGENT_BROWSER_BIN="${AGENT_BROWSER_TOOL_DIR}/node_modules/.bin/agent-browser"
}

run_ab() {
  "${AGENT_BROWSER_BIN}" "$@"
}

run_case() {
  local mode="$1"
  local session="sh6-log-report-smoke-${mode}-$RANDOM-$RANDOM"

  run_ab --session "${session}" open "${URL}" >/dev/null
  run_ab --session "${session}" wait "body" >/dev/null
  run_ab --session "${session}" eval "(() => { window.__sh6Errors = []; window.addEventListener('error', (evt) => window.__sh6Errors.push({ type: 'error', message: evt.message, filename: evt.filename, lineno: evt.lineno, colno: evt.colno })); window.addEventListener('unhandledrejection', (evt) => window.__sh6Errors.push({ type: 'rejection', message: evt.reason && evt.reason.message ? evt.reason.message : String(evt.reason) })); return 'ok'; })()" >/dev/null
  sleep 2
  run_ab --session "${session}" eval "(() => { document.querySelector('.landing-start-link')?.click(); return 'start'; })()" >/dev/null
  sleep 1
  if [[ "${mode}" == "dxer" ]]; then
    run_ab --session "${session}" eval "(() => { const input = document.querySelector('input[name=\"analysisModeLoad\"][value=\"dxer\"]'); if (input) { input.checked = true; input.dispatchEvent(new Event('change', { bubbles: true })); } return 'dxer'; })()" >/dev/null
    sleep 2
  fi
  run_ab --session "${session}" upload '#fileInput' "${FIXTURE_LOG}" >/dev/null
  local deadline=$((SECONDS + 60))
  local loaded="false"
  while (( SECONDS < deadline )); do
    local loaded_raw
    loaded_raw="$(run_ab --json --session "${session}" eval "(() => /parsed/i.test(document.querySelector('#fileStatus')?.textContent || '') && !document.querySelector('#viewReportsBtn')?.disabled)()" 2>/dev/null || true)"
    loaded="$(echo "${loaded_raw}" | jq -r '.data.result // false' 2>/dev/null || true)"
    if [[ "${loaded}" == "true" ]]; then
      break
    fi
    sleep 0.5
  done
  if [[ "${loaded}" != "true" ]]; then
    echo "[log-report-smoke] Local fixture did not finish loading in ${mode} mode." >&2
    exit 1
  fi
  run_ab --session "${session}" eval "(() => { document.querySelector('#viewReportsBtn')?.click(); return 'view'; })()" >/dev/null
  sleep 2
  run_ab --session "${session}" eval "(() => { const item = Array.from(document.querySelectorAll('#navList [data-index]')).find((el) => (el.textContent || '').trim() === 'Log'); if (item) item.click(); return item ? item.dataset.index : 'missing'; })()" >/dev/null
  sleep 4

  local state_out
  state_out="$(run_ab --session "${session}" eval "(() => JSON.stringify({ mode: '${mode}', errors: window.__sh6Errors || [], title: document.querySelector('#viewTitle')?.textContent || '', busy: document.querySelector('#viewContainer')?.getAttribute('aria-busy') || '', loadingText: document.querySelector('.loading-text')?.textContent || '', hasLogSearch: !!document.querySelector('#logSearchInput'), hasVirtualShell: !!document.querySelector('[data-virtual-table=\"log\"]'), viewText: document.querySelector('#viewContainer')?.textContent || '' }))()" 2>/dev/null | tr -d '\r' | tail -n 1)"
  echo "${state_out}"

  STATE_JSON="${state_out}" node <<'EOF'
let payload = JSON.parse(process.env.STATE_JSON || '{}');
if (typeof payload === 'string') {
  payload = JSON.parse(payload);
}
const ok = payload.title === 'Log'
  && payload.busy === 'false'
  && !String(payload.loadingText || '')
  && payload.hasLogSearch === true
  && payload.hasVirtualShell === true
  && Array.isArray(payload.errors)
  && payload.errors.length === 0;
if (!ok) {
  console.error('[log-report-smoke] Failure');
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}
console.log(`[log-report-smoke] ${payload.mode} PASS`);
EOF

  run_ab --session "${session}" close >/dev/null 2>&1 || true
}

echo "[log-report-smoke] Starting static server at ${URL}"
python3 -m http.server "${PORT}" --bind 127.0.0.1 --directory "${ROOT_DIR}" >"${SERVER_LOG}" 2>&1 &
HTTP_PID="$!"
sleep 1

if ! kill -0 "${HTTP_PID}" >/dev/null 2>&1; then
  echo "[log-report-smoke] Failed to start local server. See ${SERVER_LOG}" >&2
  exit 1
fi

setup_agent_browser
run_ab install >/dev/null 2>&1 || true

run_case "contester"
run_case "dxer"

echo "[log-report-smoke] PASS"
