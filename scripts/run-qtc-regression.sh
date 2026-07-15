#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

node <<'EOF'
const fs = require('fs');

require('./modules/analysis/core.js');

function assert(condition, message, details) {
  if (condition) return;
  console.error(`[qtc-regression] ${message}`);
  if (details !== undefined) console.error(JSON.stringify(details, null, 2));
  process.exit(1);
}

(async () => {
  const moduleSource = fs.readFileSync('./modules/qtc/runtime.js', 'utf8');
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`;
  const qtcModule = await import(moduleUrl);
  const core = globalThis.SH6AnalysisCore;
  const text = fs.readFileSync('./tests/fixtures/wae-cw-qtc.log', 'utf8');
  const ctyTable = core.parseCtyDat(fs.readFileSync('./cty.dat', 'utf8'));
  const scoringSpec = JSON.parse(fs.readFileSync('./data/contest_scoring_spec.json', 'utf8'));
  const analyzed = core.analyzeLogText(text, 'wae-cw-qtc.log', {}, {
    ctyTable,
    scoringSpec,
    scoringStatus: 'ok',
    scoringSource: 'regression'
  });
  const runtime = qtcModule.createQtcRuntime({
    escapeHtml: (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'),
    escapeAttr: (value) => String(value ?? '').replaceAll('"', '&quot;'),
    formatNumber: (value) => String(value ?? ''),
    formatBand: (value) => String(value || ''),
    formatDate: (value) => Number.isFinite(value) ? new Date(value).toISOString() : 'N/A'
  });
  const snapshot = { derived: analyzed.derived, qsoData: analyzed.qsoData };

  const overview = runtime.renderSlotReport('qtc_overview', snapshot, 'A');
  assert(overview.includes('QTC units') && overview.includes('Point-unit share'), 'Overview must expose QTC-specific KPIs', overview);
  assert(runtime.renderSlotReport('qtc_timeline', snapshot, 'A').includes('Cumulative'), 'Timeline must expose cumulative QTC production');
  assert(runtime.renderSlotReport('qtc_efficiency', snapshot, 'A').includes('Units / active minute'), 'Efficiency must state its rate denominator');
  assert(runtime.renderSlotReport('qtc_partners', snapshot, 'A').includes('K0EJ'), 'Partner report must retain counterpart callsigns');
  assert(runtime.renderSlotReport('qtc_series', snapshot, 'A').includes('DK5PD'), 'Series report must retain reported QSO payloads');
  assert(runtime.renderSlotReport('qtc_quality', snapshot, 'A').includes('No QTC format or rule warnings'), 'Valid QTC traffic must have a clean quality state');
  assert(runtime.renderSlotReport('qtc_export', snapshot, 'A').includes('data-qtc-export="items"'), 'Export report must expose item and series actions');

  const itemsCsv = qtcModule.buildQtcItemsCsv(analyzed.derived.qtc.items);
  assert(itemsCsv.startsWith('event_type,date_time_utc'), 'QTC item CSV header changed', itemsCsv);
  assert(itemsCsv.includes('reported_callsign') && itemsCsv.includes('raw_line'), 'QTC item CSV must retain payload and source fields', itemsCsv);
  const formulaCsv = qtcModule.buildQtcItemsCsv([{ reportedCall: '=CMD()', rawLine: '@unsafe' }]);
  assert(formulaCsv.includes("'=CMD()") && formulaCsv.includes("'@unsafe"), 'CSV cells must neutralize spreadsheet formulas', formulaCsv);

  const malformedText = text.replace('2/2 K0EJ 0007 MM2T 0007', '2/3 K0EJ 0006 DK5PD 0013');
  const malformed = core.analyzeLogText(malformedText, 'wae-cw-malformed.log', {}, { ctyTable });
  const warningCodes = malformed.derived.qtc.warnings.map((warning) => warning.code);
  assert(warningCodes.includes('announced_size_mismatch'), 'Series size mismatches must be reported', malformed.derived.qtc.warnings);
  assert(warningCodes.includes('duplicate_reported_qso'), 'Duplicate QTC payloads must be reported', malformed.derived.qtc.warnings);

  const invalidGroupText = text.replace('2/2 K0EJ 0006 DK5PD 0013', 'bad K0EJ 0006 DK5PD 0013');
  const invalidGroup = core.analyzeLogText(invalidGroupText, 'wae-cw-invalid-group.log', {}, { ctyTable });
  assert(invalidGroup.derived.qtc.overview.malformedUnits === 1, 'Invalid QTC syntax must not score as a valid QTC unit', invalidGroup.derived.qtc.overview);
  assert(invalidGroup.derived.qtc.warnings.some((warning) => warning.code === 'invalid_qtc_group'), 'Invalid QTC group syntax must be explicit in quality output', invalidGroup.derived.qtc.warnings);

  const cwInvalidDirection = core.analyzeLogText(text.replaceAll('K0EJ', 'DL1AAA'), 'wae-cw-invalid-direction.log', {}, { ctyTable });
  assert(cwInvalidDirection.derived.qtc.warnings.some((warning) => warning.code === 'cw_ssb_invalid_direction'), 'CW/SSB QTC traffic must be DX to Europe', cwInvalidDirection.derived.qtc.warnings);

  const rttyText = fs.readFileSync('./tests/fixtures/wae-rtty-qtc.log', 'utf8');
  const rttySameContinent = core.analyzeLogText(rttyText.replaceAll('JA1AAA', 'W1AW'), 'wae-rtty-same-continent.log', {}, { ctyTable });
  assert(rttySameContinent.derived.qtc.warnings.some((warning) => warning.code === 'rtty_same_continent'), 'RTTY QTC traffic must cross continents', rttySameContinent.derived.qtc.warnings);
  assert(!rttySameContinent.derived.qtc.warnings.some((warning) => warning.code === 'cw_ssb_invalid_direction'), 'RTTY must not use the CW/SSB one-way direction check', rttySameContinent.derived.qtc.warnings);

  const quotaLines = Array.from({ length: 11 }, (_, idx) => (
    `QTC: 14008 CW 2025-08-09 01${String(idx).padStart(2, '0')} S53M 1/10 K0EJ 00${String(idx).padStart(2, '0')} W${idx}AAA ${String(idx + 1).padStart(4, '0')}`
  ));
  const quotaText = ['START-OF-LOG: 3.0', 'CONTEST: WAE CW', 'CALLSIGN: S53M', ...quotaLines, 'END-OF-LOG:'].join('\n');
  const quota = core.analyzeLogText(quotaText, 'wae-cw-pair-quota.log', {}, { ctyTable });
  assert(quota.derived.qtc.warnings.some((warning) => warning.code === 'pair_quota_exceeded' && warning.count === 11), 'Pair quota validation must flag every unit beyond a 10-QTC station-pair allowance', quota.derived.qtc.warnings);

  console.log('[qtc-regression] PASS');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
EOF
