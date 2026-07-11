#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${SH6_PERF_PORT:-8831}"
URL="http://127.0.0.1:${PORT}/"
MODE="single"
FOUR_LOG_COUNT="${SH6_FOUR_LOG_QSOS_PER_SLOT:-5001}"
if [[ "${1:-}" == "--four-log" ]]; then
  MODE="four-log"
  FOUR_LOG_COUNT="${2:-${FOUR_LOG_COUNT}}"
  LOG_PATH=""
else
  LOG_PATH="${SH6_PERF_LOG_PATH:-${1:-}}"
fi
SESSION="sh6-performance-$RANDOM-$RANDOM"
SERVER_LOG="${SH6_PERF_SERVER_LOG:-/tmp/sh6-performance-server.log}"
NPM_CACHE_DIR="${NPM_CACHE_DIR:-/tmp/sh6-npm-cache}"
AGENT_BROWSER_TOOL_DIR="${AGENT_BROWSER_TOOL_DIR:-/tmp/sh6-agent-browser-tool}"
AGENT_BROWSER_BIN=""
AGENT_BROWSER_NEEDS_INSTALL="false"
AGENT_BROWSER_TIMEOUT_SECONDS="${SH6_AGENT_BROWSER_TIMEOUT_SECONDS:-30}"
AGENT_BROWSER_CLEANUP_TIMEOUT_SECONDS="${SH6_AGENT_BROWSER_CLEANUP_TIMEOUT_SECONDS:-5}"
HTTP_PID=""
BROWSER_INSTALL_PID=""

cleanup() {
  if [[ -n "${BROWSER_INSTALL_PID}" ]]; then
    kill "${BROWSER_INSTALL_PID}" >/dev/null 2>&1 || true
  fi
  if [[ -n "${AGENT_BROWSER_BIN}" ]]; then
    run_ab_bounded "${AGENT_BROWSER_CLEANUP_TIMEOUT_SECONDS}" close >/dev/null 2>&1 || true
  fi
  if [[ -n "${HTTP_PID}" ]]; then
    kill "${HTTP_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

install_browser_bounded() {
  run_ab install >/dev/null 2>&1 &
  BROWSER_INSTALL_PID="$!"
  for ((attempt = 0; attempt < 20; attempt += 1)); do
    if ! kill -0 "${BROWSER_INSTALL_PID}" >/dev/null 2>&1; then
      wait "${BROWSER_INSTALL_PID}" >/dev/null 2>&1 || true
      BROWSER_INSTALL_PID=""
      return
    fi
    sleep 1
  done
  kill "${BROWSER_INSTALL_PID}" >/dev/null 2>&1 || true
  wait "${BROWSER_INSTALL_PID}" >/dev/null 2>&1 || true
  BROWSER_INSTALL_PID=""
}

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
  AGENT_BROWSER_NEEDS_INSTALL="true"
}

run_ab() {
  run_ab_bounded "${AGENT_BROWSER_TIMEOUT_SECONDS}" "$@"
}

run_ab_bounded() {
  local timeout_seconds="$1"
  shift
  perl -e '$seconds = shift; $SIG{ALRM} = sub { exit 124 }; alarm $seconds; exec @ARGV or exit 127' \
    "${timeout_seconds}" "${AGENT_BROWSER_BIN}" --session "${SESSION}" "$@"
}

wait_for_expression() {
  local expression="$1"
  local timeout_seconds="$2"
  local started_at
  started_at="$(date +%s)"
  while true; do
    local result
    result="$(run_ab eval "Boolean(${expression})" 2>/dev/null | tr -d '\r' | tail -n 1)"
    if [[ "${result}" == "true" ]]; then return 0; fi
    if (( $(date +%s) - started_at >= timeout_seconds )); then
      echo "[browser-performance] Timed out waiting for: ${expression}" >&2
      return 1
    fi
    sleep 0.2
  done
}

if [[ -n "${LOG_PATH}" && ! -f "${LOG_PATH}" ]]; then
  echo "[browser-performance] Log file not found: ${LOG_PATH}" >&2
  exit 1
fi
if [[ "${MODE}" == "four-log" && (! "${FOUR_LOG_COUNT}" =~ ^[0-9]+$ || "${FOUR_LOG_COUNT}" -lt 1) ]]; then
  echo "[browser-performance] Four-log QSO count must be a positive integer." >&2
  exit 1
fi

python3 -m http.server "${PORT}" --bind 127.0.0.1 --directory "${ROOT_DIR}" >"${SERVER_LOG}" 2>&1 &
HTTP_PID="$!"
server_ready="false"
for ((attempt = 0; attempt < 40; attempt += 1)); do
  if ! kill -0 "${HTTP_PID}" >/dev/null 2>&1; then
    echo "[browser-performance] Local server exited. See ${SERVER_LOG}" >&2
    exit 1
  fi
  page_source="$(curl -fsS "${URL}index.html" 2>/dev/null || true)"
  if [[ "${page_source}" == *"<html"* && "${page_source}" == *"main.js"* ]]; then
    server_ready="true"
    break
  fi
  sleep 0.1
done
if [[ "${server_ready}" != "true" ]]; then
  echo "[browser-performance] Local server did not become ready at ${URL}" >&2
  exit 1
fi
setup_agent_browser
if [[ "${AGENT_BROWSER_NEEDS_INSTALL}" == "true" ]]; then
  install_browser_bounded
fi
if ! run_ab open 'about:blank' >/dev/null 2>&1; then
  install_browser_bounded
  run_ab open 'about:blank' >/dev/null
fi
run_ab network route 'https://www.googletagmanager.com/**' --abort >/dev/null
run_ab network route 'https://www.google-analytics.com/**' --abort >/dev/null
run_ab network route 'https://unpkg.com/**' --abort >/dev/null
run_ab network route 'https://cdn.jsdelivr.net/**' --abort >/dev/null
run_ab open "${URL}" >/dev/null
wait_for_expression "window.SH6?.getPerformance?.().events?.some((entry) => entry.name === 'start_interactive')" 60

if [[ "${MODE}" == "four-log" ]]; then
  run_ab eval "(() => { const radio = document.querySelector('input[name=\"compareCount\"][value=\"4\"]'); if (!radio) return false; radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); return true; })()" >/dev/null
  for slot_id in A B C D; do
    case "${slot_id}" in
      A) input_id="fileInput"; status_id="fileStatus" ;;
      B) input_id="fileInputB"; status_id="fileStatusB" ;;
      C) input_id="fileInputC"; status_id="fileStatusC" ;;
      D) input_id="fileInputD"; status_id="fileStatusD" ;;
    esac
    run_ab eval "(() => { const count = Number('${FOUR_LOG_COUNT}'); const slot = '${slot_id}'; const field = (name, value) => '<' + name + ':' + String(value).length + '>' + value; const rows = []; const slotIndex = slot.charCodeAt(0) - 65; const start = Date.UTC(2025, 0, 4, 23, 0, 0) + (slotIndex * 250); for (let index = 0; index < count; index += 1) { const date = new Date(start + (index * 1000)); const dateText = String(date.getUTCFullYear()) + String(date.getUTCMonth() + 1).padStart(2, '0') + String(date.getUTCDate()).padStart(2, '0'); const timeText = String(date.getUTCHours()).padStart(2, '0') + String(date.getUTCMinutes()).padStart(2, '0') + String(date.getUTCSeconds()).padStart(2, '0'); const call = 'K' + String((index % 9) + 1) + slot + String(index % 1000).padStart(3, '0'); rows.push(field('CALL', call) + field('QSO_DATE', dateText) + field('TIME_ON', timeText) + field('BAND', '20M') + field('MODE', 'CW') + field('OPERATOR', index % 2 ? 'OP2' : 'OP1') + '<EOR>'); } const input = document.getElementById('${input_id}'); const transfer = new DataTransfer(); transfer.items.add(new File([rows.join('')], 'synthetic-' + slot + '.adi', { type: 'text/plain' })); input.files = transfer.files; input.dispatchEvent(new Event('change', { bubbles: true })); return rows.length; })()" >/dev/null
    if [[ "${slot_id}" != "A" ]]; then
      case "${slot_id}" in
        B) probe_count=1 ;;
        C) probe_count=2 ;;
        D) probe_count=3 ;;
      esac
      run_ab eval "(() => { window.__sh6AnalysisRafProbes = window.__sh6AnalysisRafProbes || []; const startedAt = performance.now(); requestAnimationFrame(() => window.__sh6AnalysisRafProbes.push(performance.now() - startedAt)); return true; })()" >/dev/null
      wait_for_expression "window.__sh6AnalysisRafProbes?.length >= ${probe_count}" 10
    fi
    wait_for_expression "(document.querySelector('#${status_id}')?.textContent || '').includes('parsed')" 180
  done
  run_ab eval "document.querySelector('#viewReportsBtn')?.click(); true" >/dev/null
  wait_for_expression "document.querySelector('#viewTitle')?.textContent === 'Main' && document.querySelector('#viewContainer')?.getAttribute('aria-busy') === 'false'" 60
  run_ab eval "(() => { const events = window.SH6.getPerformance().events; window.__sh6CompareClickAt = performance.now(); window.__sh6LogReadyCount = events.filter((entry) => entry.name === 'report_ready' && entry.reportId === 'log').length; const item = Array.from(document.querySelectorAll('#navList [data-index]')).find((entry) => (entry.textContent || '').trim() === 'Log'); item?.click(); return Boolean(item); })()" >/dev/null
  wait_for_expression "window.SH6.getPerformance().events.some((entry) => entry.name === 'worker_compare_ready')" 120
  wait_for_expression "Boolean(document.querySelector('#viewContainer .compare-log-table'))" 60
  wait_for_expression "window.SH6.getPerformance().events.filter((entry) => entry.name === 'report_ready' && entry.reportId === 'log').length > (window.__sh6LogReadyCount || 0)" 60
elif [[ -n "${LOG_PATH}" ]]; then
  run_ab upload '#fileInput' "${LOG_PATH}" >/dev/null
  wait_for_expression "(document.querySelector('#fileStatus')?.textContent || '').includes('parsed')" 180
  run_ab eval "document.querySelector('#viewReportsBtn')?.click(); true" >/dev/null
  wait_for_expression "document.querySelector('#viewTitle')?.textContent === 'Main' && document.querySelector('#viewContainer')?.getAttribute('aria-busy') === 'false'" 60
  wait_for_expression "window.SH6.getPerformance().events.some((entry) => entry.name === 'report_ready' && entry.reportId === 'main')" 60
fi

run_ab wait 100 >/dev/null
result="$(run_ab eval "(() => {
  const summary = window.SH6.getPerformance();
  const event = (name) => summary.events.filter((entry) => entry.name === name).at(-1) || null;
  const firstEvent = (name) => summary.events.find((entry) => entry.name === name) || null;
  const fileStart = event('file_load_start');
  const logReady = event('log_ready');
  const reportReady = summary.events.filter((entry) => entry.name === 'report_ready' && entry.reportId === 'main').at(-1) || null;
  const endEvent = reportReady || logReady;
  const relevantLongTasks = fileStart && endEvent
    ? summary.longTasks.filter((entry) => entry.startMs >= fileStart.atMs && entry.startMs <= endEvent.atMs)
    : summary.longTasks;
  const compareReady = summary.events.filter((entry) => entry.name === 'worker_compare_ready').at(-1) || null;
  const compareReportReady = summary.events.filter((entry) => entry.name === 'report_ready' && entry.reportId === 'log' && entry.atMs >= (window.__sh6CompareClickAt || Infinity)).at(-1) || null;
  const compareLongTasks = compareReportReady
    ? summary.longTasks.filter((entry) => entry.startMs >= (window.__sh6CompareClickAt || compareReady.atMs) && entry.startMs <= compareReportReady.atMs)
    : [];
  return JSON.stringify({
    appVersion: summary.appVersion,
    startup: {
      interactiveMs: firstEvent('start_interactive')?.atMs || null,
      domContentLoadedMs: summary.navigation?.domContentLoadedMs || null,
      loadEventMs: summary.navigation?.loadEventMs || null
    },
    log: fileStart && logReady ? {
      bytes: fileStart.inputBytes || 0,
      qsos: logReady.qsoCount || 0,
      fileToDataReadyMs: logReady.atMs - fileStart.atMs,
      fileToFirstReportMs: reportReady ? reportReady.atMs - fileStart.atMs : null,
      workerStartupMs: event('worker_startup_ready')?.durationMs || null,
      workerResourceConfigureMs: event('worker_resources_ready')?.durationMs || null,
      workerAnalysisMs: event('worker_analysis_ready')?.durationMs || null,
      mainThreadAnalysisMs: event('main_thread_analysis_ready')?.durationMs || null,
      longestMainThreadTaskMs: Math.max(0, ...relevantLongTasks.map((entry) => entry.durationMs)),
      mainThreadLongTaskTotalMs: relevantLongTasks.reduce((sum, entry) => sum + entry.durationMs, 0)
    } : null,
    fourLog: compareReady ? {
      qsosPerSlot: Number('${FOUR_LOG_COUNT}') || null,
      totalQsos: compareReady.qsoCount || 0,
      workerCompareMs: compareReady.durationMs || null,
      workerCompareCompletedAtMs: compareReady.atMs || null,
      analysisInFlightRafMaxMs: Math.max(0, ...(window.__sh6AnalysisRafProbes || [])),
      requestedWindowSize: summary.compareLogWindow?.requestedSize || null,
      renderedWindowSize: summary.compareLogWindow?.renderedSize || null,
      clickToPaintMs: compareReportReady ? compareReportReady.atMs - (window.__sh6CompareClickAt || compareReady.atMs) : null,
      longestMainThreadTaskMs: Math.max(0, ...compareLongTasks.map((entry) => entry.durationMs)),
      mainThreadLongTaskTotalMs: compareLongTasks.reduce((sum, entry) => sum + entry.durationMs, 0),
      usedMainThreadFallback: summary.events.some((entry) => entry.name === 'main_thread_compare_ready' && entry.atMs >= (window.__sh6CompareClickAt || 0))
    } : null,
    render: summary.render,
    reportReadyMs: reportReady?.durationMs || null,
    networkInterception: ['analytics', 'unpkg', 'jsdelivr']
  });
})()" 2>/dev/null | tr -d '\r' | tail -n 1)"

SH6_PERF_RESULT="${result}" node <<'EOF'
const raw = process.env.SH6_PERF_RESULT || '{}';
const value = JSON.parse(raw);
const parsed = typeof value === 'string' ? JSON.parse(value) : value;
if (parsed.fourLog
  && (parsed.fourLog.requestedWindowSize !== 1000 || parsed.fourLog.renderedWindowSize !== 100)) {
  throw new Error(`Compare window persistence mismatch: ${JSON.stringify(parsed.fourLog)}`);
}
console.log(JSON.stringify(parsed));
EOF
