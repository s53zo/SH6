#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${OPERATING_TIME_PDF_PORT:-8837}"
OUT="${OPERATING_TIME_PDF_OUT:-/tmp/sh6-operating-time-pdf}"
AB="${AGENT_BROWSER_BIN:-/tmp/sh6-agent-browser-tool/node_modules/.bin/agent-browser}"
SESSION="sh6-operating-time-pdf-$RANDOM-$RANDOM"
mkdir -p "${OUT}"
python3 -m http.server "${PORT}" --bind 127.0.0.1 --directory "${ROOT_DIR}" >"${OUT}/server.log" 2>&1 &
HTTP_PID="$!"
cleanup() { kill "${HTTP_PID}" >/dev/null 2>&1 || true; "${AB}" --session "${SESSION}" close >/dev/null 2>&1 || true; }
trap cleanup EXIT
sleep 1
kill -0 "${HTTP_PID}"
"${AB}" --session "${SESSION}" open "http://127.0.0.1:${PORT}/tests/operating-time-ui-smoke.html?print=${OPERATING_TIME_PDF_MODE:-1}" >/dev/null
deadline=$((SECONDS + 90)); status=""
while (( SECONDS < deadline )); do
  status="$("${AB}" --session "${SESSION}" get text '#status' 2>/dev/null | tr -d '\r' | tail -n 1 | xargs)"
  [[ "${status}" == "PASS" || "${status}" == "FAIL" ]] && break
  sleep 1
done
if [[ "${status}" != "PASS" ]]; then
  "${AB}" --session "${SESSION}" get text '#result' || true
  echo "[operating-time-pdf] ${status:-TIMEOUT}" >&2
  exit 1
fi
"${AB}" --session "${SESSION}" wait ".export-doc" >/dev/null
"${AB}" --session "${SESSION}" pdf "${OUT}/operating-time.pdf"
pdftotext "${OUT}/operating-time.pdf" "${OUT}/operating-time.txt"
rg -q 'Possible 2BSIQ' "${OUT}/operating-time.txt"
rg -q 'Per-band activity minutes' "${OUT}/operating-time.txt"
pdftoppm -scale-to 1500 -png "${OUT}/operating-time.pdf" "${OUT}/page" >/dev/null 2>&1
echo "[operating-time-pdf] PASS: ${OUT}/operating-time.pdf"
