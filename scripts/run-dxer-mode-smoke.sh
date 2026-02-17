#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${DXER_MODE_SMOKE_PORT:-8780}"
URL="http://127.0.0.1:${PORT}/tests/dxer-mode-smoke.html"
SESSION="sh6-dxer-mode-smoke-${RANDOM}-${RANDOM}"
SERVER_LOG="${DXER_MODE_SMOKE_SERVER_LOG:-/tmp/sh6-dxer-mode-smoke-server.log}"
AGENT_BROWSER_TOOL_DIR="${AGENT_BROWSER_TOOL_DIR:-/tmp/sh6-agent-browser-tool}"
NPM_CACHE_DIR="${NPM_CACHE_DIR:-/tmp/sh6-npm-cache}"
AGENT_BROWSER_BIN=""
HTTP_PID=""

cleanup() {
  if [[ -n "${HTTP_PID}" ]]; then
    kill "${HTTP_PID}" >/dev/null 2>&1 || true
  fi
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
    npm_config_cache="${NPM_CACHE_DIR:-/tmp/sh6-npm-cache}" npm install --silent --prefix "${AGENT_BROWSER_TOOL_DIR}" agent-browser >/dev/null
  fi
  AGENT_BROWSER_BIN="${AGENT_BROWSER_TOOL_DIR}/node_modules/.bin/agent-browser"
}

run_ab() {
  "${AGENT_BROWSER_BIN}" "$@"
}

echo "[dxer-mode-smoke] Starting static server at ${URL}"
python3 -m http.server "${PORT}" --bind 127.0.0.1 --directory "${ROOT_DIR}" >"${SERVER_LOG}" 2>&1 &
HTTP_PID="$!"
disown "${HTTP_PID}" 2>/dev/null || true
sleep 1

if ! kill -0 "${HTTP_PID}" >/dev/null 2>&1; then
  echo "[dxer-mode-smoke] Failed to start local server. See ${SERVER_LOG}" >&2
  exit 1
fi

setup_agent_browser
run_ab install >/dev/null 2>&1 || true
run_ab --session "${SESSION}" open "${URL}" >/dev/null
run_ab --session "${SESSION}" wait "#status" >/dev/null

deadline=$((SECONDS + 60))
status=""
while (( SECONDS < deadline )); do
  status="$(run_ab --session "${SESSION}" get text "#status" 2>/dev/null | tr -d '\r' | tail -n 1 | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
  if [[ "${status}" == "PASS" || "${status}" == "FAIL" ]]; then
    break
  fi
  sleep 1
done

result_json="$(run_ab --session "${SESSION}" get text "#result" 2>/dev/null | tr -d '\r')"
echo "[dxer-mode-smoke] status=${status}"
echo "${result_json}"

if [[ "${status}" != "PASS" ]]; then
  echo "[dxer-mode-smoke] DXER/Contester smoke test failed." >&2
  exit 1
fi

# Runtime app smoke: switch to DXer mode and confirm menu items are gated as expected.
APP_URL="http://127.0.0.1:${PORT}/index.html"
run_ab --session "${SESSION}" open "${APP_URL}" >/dev/null
load_panel_ready=false
deadline=$((SECONDS + 15))
while ((SECONDS < deadline)); do
  if run_ab --session "${SESSION}" get text "#loadPanel" >/dev/null 2>&1; then
    load_panel_ready=true
    break
  fi
  sleep 0.5
done

if [[ "${load_panel_ready}" != true ]]; then
  echo "[dxer-mode-smoke] Failed to load index panel for runtime check." >&2
  exit 1
fi

runtime_eval_raw="$(run_ab --json --session "${SESSION}" eval "$(cat <<'JS'
(() => {
  function collectMenuEntries() {
    return Array.from(document.querySelectorAll('#navList li[data-index]')).map((li) => li.textContent.trim());
  }
  function has(entries, value) {
    return entries.indexOf(value) !== -1;
  }
  function setMode(mode) {
    const radio = document.querySelector('input[name="analysisMode"][value="' + mode + '"]');
    if (!radio) return;
    radio.checked = true;
    radio.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const contesterEntries = collectMenuEntries();
  setMode('dxer');
  const dxerEntries = collectMenuEntries();

  return {
    contester: {
      countriesByMonth: has(contesterEntries, 'Countries by month'),
      cqByMonth: has(contesterEntries, 'CQ zones by month'),
      ituByMonth: has(contesterEntries, 'ITU zones by month'),
      qsByMinute: has(contesterEntries, 'Qs by minute'),
      pointsByMinute: has(contesterEntries, 'Points by minute'),
      breakTime: has(contesterEntries, 'Break time')
    },
    dxer: {
      countriesByMonth: has(dxerEntries, 'Countries by month'),
      cqByMonth: has(dxerEntries, 'CQ zones by month'),
      ituByMonth: has(dxerEntries, 'ITU zones by month'),
      qsByMinute: has(dxerEntries, 'Qs by minute'),
      pointsByMinute: has(dxerEntries, 'Points by minute'),
      breakTime: has(dxerEntries, 'Break time'),
      qsByHour: has(dxerEntries, 'Qs by hour sheet'),
      pointsByHour: has(dxerEntries, 'Points by hour sheet'),
      oneMinuteRates: has(dxerEntries, 'One minute rates')
    }
  };
})();
JS
)")"
runtime_payload="$(echo "${runtime_eval_raw}" | jq -c '.data.result' 2>/dev/null || true)"

if [[ -z "${runtime_payload}" || "${runtime_payload}" == "null" ]]; then
  echo "[dxer-mode-smoke] Runtime eval failed to return JSON payload." >&2
  echo "${runtime_eval_raw}"
  exit 1
fi

runtime_ok="$(echo "${runtime_payload}" | jq -r '
  def inv($v): if $v then false else true end;
  . as $r |
  (($r | .dxer.countriesByMonth) and
   ($r | .dxer.cqByMonth) and
   ($r | .dxer.ituByMonth) and
   inv($r | .dxer.qsByMinute) and
   inv($r | .dxer.pointsByMinute) and
   inv($r | .dxer.breakTime) and
   inv($r | .dxer.qsByHour) and
   inv($r | .dxer.pointsByHour) and
   inv($r | .dxer.oneMinuteRates) and
   ($r | .contester.qsByMinute))
' 2>/dev/null || true)"
if [[ "${runtime_ok}" != "true" ]]; then
  echo "[dxer-mode-smoke] Runtime mode-gating check failed."
  echo "${runtime_payload}"
  exit 1
fi

echo "[dxer-mode-smoke] PASS"
