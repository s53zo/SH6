#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${REPORT_CLEANUP_AUDIT_PORT:-8846}"
OUT_DIR="${REPORT_CLEANUP_AUDIT_OUT:-$(mktemp -d /tmp/sh6-cleanup-audit.XXXXXX)}"
MODE="${REPORT_CLEANUP_AUDIT_MODE:-strict}"
SESSION="sh6-cleanup-audit-$RANDOM-$RANDOM"
AB="${AGENT_BROWSER_TOOL_DIR:-/tmp/sh6-agent-browser-tool}/node_modules/.bin/agent-browser"
if command -v agent-browser >/dev/null 2>&1; then AB="$(command -v agent-browser)"; fi
if [[ ! -x "$AB" ]]; then echo 'Install agent-browser first, or set AGENT_BROWSER_TOOL_DIR.' >&2; exit 1; fi
mkdir -p "$OUT_DIR"
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT_DIR" >"$OUT_DIR/server.log" 2>&1 &
HTTP_PID=$!
cleanup(){ kill "$HTTP_PID" >/dev/null 2>&1 || true; "$AB" --session "$SESSION" close >/dev/null 2>&1 || true; }
trap cleanup EXIT
sleep 1
kill -0 "$HTTP_PID"
QUERY=''
if [[ "$MODE" == 'baseline' ]]; then QUERY='?baseline=1'; fi
if [[ "$MODE" != 'baseline' ]]; then
 "$AB" --session "$SESSION" open "http://127.0.0.1:$PORT/tests/report-cleanup-normalizer-smoke.html" >/dev/null
 "$AB" --session "$SESSION" get text '#result' >"$OUT_DIR/normalizer.json"
 normalizer_status="$("$AB" --session "$SESSION" get text '#status' | tr -d '\r' | tail -n 1)"
 if [[ "$normalizer_status" != 'PASS' ]]; then echo "Normalizer failed ($OUT_DIR/normalizer.json)" >&2; exit 1; fi
fi
"$AB" --session "$SESSION" open "http://127.0.0.1:$PORT/tests/report-cleanup-audit.html$QUERY" >/dev/null
deadline=$((SECONDS + 900))
status=''
while (( SECONDS < deadline )); do
 status="$("$AB" --session "$SESSION" get text '#status' 2>/dev/null | tr -d '\r' | tail -n 1)"
 if [[ "$status" == 'PASS' || "$status" == 'FAIL' ]]; then break; fi
 sleep 2
done
"$AB" --session "$SESSION" get text '#result' >"$OUT_DIR/audit.json"
echo "Report cleanup audit: $status ($OUT_DIR/audit.json)"
if [[ "$status" != 'PASS' ]]; then node -e 'const r=require(process.argv[1]);console.log(JSON.stringify(r.checks?.filter(c=>!c.passed),null,2))' "$OUT_DIR/audit.json"; exit 1; fi
"$AB" --session "$SESSION" set viewport 1500 1000 >/dev/null
"$AB" --session "$SESSION" eval "document.getElementById('result').hidden=true;document.getElementById('status').hidden=true;document.getElementById('app').style.height='980px';document.body.style.margin='0';" >/dev/null
for report in 'Main' 'RUN vs S&P vs INBAND' 'Multipliers' 'Break time' 'Compare Insights'; do
 "$AB" --session "$SESSION" eval "(async()=>{await cleanupAudit.setMode(2); await cleanupAudit.navigate('$report');})()" >/dev/null
 name="$(echo "$report" | tr ' &/' '---')"
 "$AB" --session "$SESSION" screenshot "$OUT_DIR/$name.png" >/dev/null
done
for report in 'RUN vs S&P vs INBAND' 'Multipliers'; do
 "$AB" --session "$SESSION" eval "(async()=>{document.getElementById('app').style.width='390px';await cleanupAudit.navigate('$report');})()" >/dev/null
 "$AB" --session "$SESSION" set viewport 410 1000 >/dev/null
 name="$(echo "$report" | tr ' &/' '---')"
 "$AB" --session "$SESSION" screenshot "$OUT_DIR/$name-mobile.png" >/dev/null
done
"$AB" --session "$SESSION" set viewport 1500 1000 >/dev/null
"$AB" --session "$SESSION" eval "document.getElementById('app').style.width='1400px';" >/dev/null
if [[ "$MODE" != 'baseline' ]]; then
 "$AB" --session "$SESSION" eval "(async()=>{await cleanupAudit.navigate('RUN vs S&P vs INBAND'); document.getElementById('app').contentDocument.querySelector('details.report-more > summary').focus();})()" >/dev/null
 "$AB" --session "$SESSION" press Enter >/dev/null
 "$AB" --session "$SESSION" eval "if(!document.getElementById('app').contentDocument.querySelector('details.report-more').open)throw Error('Enter did not open More');" >/dev/null
 "$AB" --session "$SESSION" screenshot "$OUT_DIR/More-keyboard-open.png" >/dev/null
 "$AB" --session "$SESSION" press Space >/dev/null
 "$AB" --session "$SESSION" eval "if(document.getElementById('app').contentDocument.querySelector('details.report-more').open)throw Error('Space did not close More');" >/dev/null
 echo 'Native More disclosure keyboard check: Enter opens; Space closes.'
fi
node -e 'const r=require(process.argv[1]);console.log(`${r.reports.length} report/viewport/tab snapshots; ${r.checks.length} checks; ${r.tabs.length} tabs; ${r.errors.length} application errors`)' "$OUT_DIR/audit.json"
