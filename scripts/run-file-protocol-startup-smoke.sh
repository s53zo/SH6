#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FILE_URL="file://${ROOT_DIR}/index.html"
SESSION="sh6-file-protocol-startup-smoke-$RANDOM-$RANDOM"
NPM_CACHE_DIR="${NPM_CACHE_DIR:-/tmp/sh6-npm-cache}"
AGENT_BROWSER_TOOL_DIR="${AGENT_BROWSER_TOOL_DIR:-/tmp/sh6-agent-browser-tool}"
AGENT_BROWSER_BIN=""

cleanup() {
  if [[ -n "${AGENT_BROWSER_BIN}" ]]; then
    "${AGENT_BROWSER_BIN}" --session "${SESSION}" close >/dev/null 2>&1 || true
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

setup_agent_browser
run_ab install >/dev/null 2>&1 || true
run_ab --session "${SESSION}" open "${FILE_URL}" >/dev/null
run_ab --session "${SESSION}" wait "#viewTitle" >/dev/null
sleep 2

title="$(run_ab --session "${SESSION}" get text "#viewTitle" 2>/dev/null | tr -d '\r' | tail -n 1 | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
nav_count="$(run_ab --session "${SESSION}" get count "#navList li" 2>/dev/null | tr -d '\r' | tail -n 1 | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
state_json="$(run_ab --session "${SESSION}" eval "(() => JSON.stringify({ loadPanelDisplay: getComputedStyle(document.querySelector('#loadPanel')).display, navDisabled: !!document.querySelector('#navSearchInput')?.disabled, bodyClass: document.body.className, viewText: document.querySelector('#viewContainer')?.textContent || '' }))()" 2>/dev/null | tr -d '\r' | tail -n 1)"

echo "[file-protocol-startup-smoke] title=${title}"
echo "[file-protocol-startup-smoke] nav_count=${nav_count}"
echo "${state_json}"

if [[ "${title}" != "Local server required" ]]; then
  echo "[file-protocol-startup-smoke] Unexpected title." >&2
  exit 1
fi

if [[ "${nav_count}" != "3" ]]; then
  echo "[file-protocol-startup-smoke] Expected sidebar fallback items." >&2
  exit 1
fi

STATE_JSON="${state_json}" node <<'EOF'
let payload = JSON.parse(process.env.STATE_JSON || '{}');
if (typeof payload === 'string') {
  payload = JSON.parse(payload);
}
const ok = payload.loadPanelDisplay === 'none'
  && payload.navDisabled === true
  && String(payload.viewText || '').includes('Open SH6 through a local web server')
  && String(payload.viewText || '').includes('./scripts/run-local-web.sh');
if (!ok) {
  console.error('[file-protocol-startup-smoke] Unexpected browser state.');
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}
console.log('[file-protocol-startup-smoke] PASS');
EOF
