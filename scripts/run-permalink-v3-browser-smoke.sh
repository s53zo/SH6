#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PERMALINK_V3_BROWSER_SMOKE_PORT:-8831}"
URL="http://127.0.0.1:${PORT}/tests/permalink-v3-browser-smoke.html"
SESSION="sh6-permalink-v3-smoke-$RANDOM-$RANDOM"
SERVER_LOG="${PERMALINK_V3_BROWSER_SMOKE_SERVER_LOG:-/tmp/sh6-permalink-v3-browser-smoke-server.log}"
NPM_CACHE_DIR="${NPM_CACHE_DIR:-/tmp/sh6-npm-cache}"
AGENT_BROWSER_TOOL_DIR="${AGENT_BROWSER_TOOL_DIR:-/tmp/sh6-agent-browser-tool}"
AGENT_BROWSER_BIN=""
HTTP_PID=""

cleanup() {
  if [[ -n "${HTTP_PID}" ]]; then
    kill "${HTTP_PID}" >/dev/null 2>&1 || true
    wait "${HTTP_PID}" >/dev/null 2>&1 || true
  fi
  if [[ -n "${AGENT_BROWSER_BIN}" ]]; then "${AGENT_BROWSER_BIN}" --session "${SESSION}" close >/dev/null 2>&1 || true; fi
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

python3 -m http.server "${PORT}" --bind 127.0.0.1 --directory "${ROOT_DIR}" >"${SERVER_LOG}" 2>&1 &
HTTP_PID="$!"
sleep 1
kill -0 "${HTTP_PID}" >/dev/null 2>&1

"${AGENT_BROWSER_BIN}" install >/dev/null 2>&1 || true
"${AGENT_BROWSER_BIN}" --session "${SESSION}" open "${URL}" >/dev/null
"${AGENT_BROWSER_BIN}" --session "${SESSION}" wait "#status" >/dev/null

deadline=$((SECONDS + 60))
status=""
while (( SECONDS < deadline )); do
  status="$("${AGENT_BROWSER_BIN}" --session "${SESSION}" get text "#status" 2>/dev/null | tr -d '\r' | tail -n 1 | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
  [[ "${status}" == "PASS" || "${status}" == "FAIL" ]] && break
  sleep 1
done
result_json="$("${AGENT_BROWSER_BIN}" --session "${SESSION}" get text "#result" 2>/dev/null | tr -d '\r')"
echo "[permalink-v3-browser-smoke] status=${status}"
echo "${result_json}"
[[ "${status}" == "PASS" ]]

v3_state="$(cd "${ROOT_DIR}" && node --input-type=module - <<'EOF'
import { encodeV3State } from './modules/session/permalink-v3.js';
console.log(encodeV3State({ v: 2, c: 2, am: 'dxer', s: [{ i: 'A', k: 1 }, { i: 'B', k: 1 }] }));
EOF
)"
v2_state="$(node - <<'EOF'
console.log(`v2.${Buffer.from(JSON.stringify({ v: 2, c: 2, am: 'dxer', s: [{ i: 'A', k: 1 }, { i: 'B', k: 1 }] }), 'utf8').toString('base64url')}`);
EOF
)"

check_restored_app() {
  local state_value="$1"
  local format_label="$2"
  "${AGENT_BROWSER_BIN}" --session "${SESSION}" open "http://127.0.0.1:${PORT}/index.html?state=${state_value}" >/dev/null
  "${AGENT_BROWSER_BIN}" --session "${SESSION}" wait "#appVersion" >/dev/null
  sleep 2
  local app_json
  app_json="$("${AGENT_BROWSER_BIN}" --session "${SESSION}" eval "(() => JSON.stringify({ version: document.querySelector('#appVersion')?.textContent, dxer: document.body.classList.contains('analysis-mode-dxer'), a: document.querySelector('.log-a .slot-status')?.textContent, b: document.querySelector('.log-b .slot-status')?.textContent }))()" 2>/dev/null | tr -d '\r' | tail -n 1)"
  FORMAT_LABEL="${format_label}" APP_JSON="${app_json}" node <<'EOF'
let value = JSON.parse(process.env.APP_JSON || '{}');
if (typeof value === 'string') value = JSON.parse(value);
const passed = value.version === 'v6.3.33' && value.dxer === true && value.a === 'Skipped' && value.b === 'Skipped';
if (!passed) {
  console.error(`[permalink-v3-browser-smoke] ${process.env.FORMAT_LABEL} app restoration failed: ${JSON.stringify(value)}`);
  process.exit(1);
}
console.log(`[permalink-v3-browser-smoke] ${process.env.FORMAT_LABEL} full-app restoration PASS`);
EOF
}

check_restored_app "${v3_state}" "v3"
"${AGENT_BROWSER_BIN}" --session "${SESSION}" eval "(() => { window.__sh6CopiedPermalink = ''; window.prompt = (_message, value) => { window.__sh6CopiedPermalink = value; return value; }; try { Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async (value) => { window.__sh6CopiedPermalink = value; } }); } catch (_error) {} const item = [...document.querySelectorAll('#navList [data-index]')].find((node) => node.textContent.includes('Save&Load session')); item?.click(); return !!item; })()" >/dev/null
"${AGENT_BROWSER_BIN}" --session "${SESSION}" wait ".session-permalink" >/dev/null
"${AGENT_BROWSER_BIN}" --session "${SESSION}" eval "document.querySelector('.session-permalink')?.click()" >/dev/null
sleep 1
copied_url="$("${AGENT_BROWSER_BIN}" --session "${SESSION}" eval "window.__sh6CopiedPermalink || ''" 2>/dev/null | tr -d '\r' | tail -n 1)"
COPIED_URL="${copied_url}" node <<'EOF'
let value = JSON.parse(process.env.COPIED_URL || '""');
if (!/^https:\/\/s53m\.com\/SH6\/\?state=v[23]\./.test(value)) {
  console.error(`[permalink-v3-browser-smoke] Copy path did not produce a canonical compact permalink: ${value}`);
  process.exit(1);
}
console.log('[permalink-v3-browser-smoke] full-app copy path PASS');
EOF

check_restored_app "${v2_state}" "v2"

"${AGENT_BROWSER_BIN}" --session "${SESSION}" open "http://127.0.0.1:${PORT}/index.html?state=v3.AAAA" >/dev/null
"${AGENT_BROWSER_BIN}" --session "${SESSION}" wait "#appVersion" >/dev/null
sleep 1
invalid_json="$("${AGENT_BROWSER_BIN}" --session "${SESSION}" eval "(() => JSON.stringify({ notice: document.querySelector('#dragOverlay')?.classList.contains('notice'), message: document.querySelector('#dragOverlay .drag-overlay-message')?.textContent || '', navUsable: !document.querySelector('#navSearchInput')?.disabled }))()" 2>/dev/null | tr -d '\r' | tail -n 1)"
INVALID_JSON="${invalid_json}" node <<'EOF'
let value = JSON.parse(process.env.INVALID_JSON || '{}');
if (typeof value === 'string') value = JSON.parse(value);
const passed = value.notice === true && value.message.includes('invalid, unsupported, or too large') && value.navUsable === true;
if (!passed) {
  console.error(`[permalink-v3-browser-smoke] Invalid-link behavior failed: ${JSON.stringify(value)}`);
  process.exit(1);
}
console.log('[permalink-v3-browser-smoke] invalid-link non-blocking notice PASS');
EOF
