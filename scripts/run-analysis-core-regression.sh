#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "${ROOT_DIR}"

node <<'EOF'
const fs = require('fs');

require('./modules/analysis/core.js');

const core = globalThis.SH6AnalysisCore;

function assert(condition, message, details) {
  if (condition) return;
  console.error(`[analysis-core-regression] ${message}`);
  if (details !== undefined) console.error(JSON.stringify(details, null, 2));
  process.exit(1);
}

function makeQso(call, index) {
  return {
    id: index,
    qsoNumber: index + 1,
    call,
    band: '20M',
    mode: 'CW',
    freq: 14.025,
    ts: Date.UTC(2025, 0, 1, 0, index),
    op: 'S53M',
    raw: {}
  };
}

const expected = new Map([
  ['K1ABC', ['United States', 'K', 5, 8, 'NA']],
  ['KG4ABC', ['United States', 'K', 5, 8, 'NA']],
  ['KG4AA', ['Guantanamo Bay', 'KG4', 8, 11, 'NA']],
  ['EA8ABC', ['Canary Islands', 'EA8', 33, 36, 'AF']],
  ['OH0X', ['Aland Islands', 'OH0', 15, 18, 'EU']],
  ['S53M', ['Slovenia', 'S5', 15, 28, 'EU']],
  ['DL1AAA/P', ['Fed. Rep. of Germany', 'DL', 14, 28, 'EU']],
  ['F/DL1AAA', ['France', 'F', 14, 27, 'EU']],
  ['4U1UN', ['United Nations HQ', '4U1UN', 5, 8, 'NA']],
  ['VP8/G4ABC', ['South Georgia Island', 'VP8/G', 13, 73, 'SA']],
  ['3B8CF', ['Mauritius', '3B8', 39, 53, 'AF']],
  ['JA1ABC', ['Japan', 'JA', 25, 45, 'AS']],
  ['VK9XAA', ['Christmas Island', 'VK9X', 29, 54, 'OC']],
  ['W1AW/KH6', ['Hawaii', 'KH6', 31, 61, 'OC']]
]);

const qsos = Array.from(expected.keys()).map(makeQso);
const ctyTable = core.parseCtyDat(fs.readFileSync('./cty.dat', 'utf8'));
core.buildDerived(qsos, {}, { ctyTable, masterCalls: [], analysisMode: 'contester' });

for (const qso of qsos) {
  const actual = [qso.country, qso.prefix, qso.cqZone, qso.ituZone, qso.continent];
  const wanted = expected.get(qso.call);
  assert(
    JSON.stringify(actual) === JSON.stringify(wanted),
    `Prefix resolution changed for ${qso.call}`,
    { actual, expected: wanted }
  );
}

const precedenceTable = [
  { prefix: 'A', exact: false, country: 'First broad match', cqZone: 1, ituZone: 1, continent: 'EU' },
  { prefix: 'ABC', exact: true, country: 'Later exact match', cqZone: 2, ituZone: 2, continent: 'NA' },
  { prefix: 'AB', exact: false, country: 'Later longer match', cqZone: 3, ituZone: 3, continent: 'AS' }
];
const [precedenceQso] = [makeQso('ABC', 0)];
core.buildDerived([precedenceQso], {}, { ctyTable: precedenceTable, masterCalls: [] });
assert(
  precedenceQso.country === 'First broad match',
  'Prefix lookup must retain first-match table precedence',
  precedenceQso
);

const adif = [
  '<ADIF_VER:5>3.1.4<EOH>',
  '<CALL:5>K1ABC<QSO_DATE:8>20250101<TIME_ON:6>123456<BAND:3>20M<MODE:2>CW<COMMENT:5>A<B>C<EOR>',
  '<call:5>DL1AA<qso_date:8>20250102<time_on:4>0102<band:3>40M<mode:3>SSB<eOr>',
  '<CALL:5>JA1ZZ<QSO_DATE:8>20250103<TIME_ON:4>0304<BAND:3>15M<MODE:2>CW'
].join('');
const parsedAdif = core.parseLogFile(adif, 'edge-cases.adi');
assert(parsedAdif.type === 'ADIF', 'ADIF fixture type changed', parsedAdif.type);
assert(parsedAdif.qsos.length === 3, 'ADIF record count changed', parsedAdif.qsos.length);
assert(parsedAdif.qsos[0].call === 'K1ABC', 'First ADIF callsign changed', parsedAdif.qsos[0]);
assert(parsedAdif.qsos[0].comment === 'A<B>C', 'Length-delimited ADIF values must retain angle brackets', parsedAdif.qsos[0]);
assert(parsedAdif.qsos[0].raw.ADIF_VER === '3.1.4', 'ADIF header fields must remain attached to the first record', parsedAdif.qsos[0].raw);
assert(parsedAdif.qsos[1].call === 'DL1AA' && parsedAdif.qsos[1].mode === 'SSB', 'Mixed-case ADIF tags changed', parsedAdif.qsos[1]);
assert(parsedAdif.qsos[2].call === 'JA1ZZ', 'Trailing ADIF record without EOR changed', parsedAdif.qsos[2]);

const waeCwText = fs.readFileSync('./tests/fixtures/wae-cw-qtc.log', 'utf8');
const waeCw = core.parseLogFile(waeCwText, 'wae-cw-qtc.log');
assert(waeCw.qsos.length === 2, 'WAE CW QSO records must remain separate from QTC records', waeCw);
assert(waeCw.qtcs.length === 2, 'WAE CW QTC records must be retained', waeCw);
assert(waeCw.events.length === 4, 'WAE CW chronological events must contain QSOs and QTCs', waeCw.events);
assert(waeCw.qtcs[0].receiver === 'S53M', 'QTC receiver parsing changed', waeCw.qtcs[0]);
assert(waeCw.qtcs[0].transmitter === 'K0EJ', 'QTC transmitter parsing changed', waeCw.qtcs[0]);
assert(waeCw.qtcs[0].direction === 'received', 'European station QTC direction must be received', waeCw.qtcs[0]);
assert(waeCw.qtcs[0].seriesNumber === 2 && waeCw.qtcs[0].seriesSize === 2, 'QTC group parsing changed', waeCw.qtcs[0]);
assert(waeCw.qtcs[0].reportedTime === '0006', 'Reported QSO time parsing changed', waeCw.qtcs[0]);
assert(waeCw.qtcs[0].reportedCall === 'DK5PD', 'Reported callsign parsing changed', waeCw.qtcs[0]);
assert(waeCw.qtcs[0].reportedSerial === '0013', 'Reported serial parsing changed', waeCw.qtcs[0]);
assert(waeCw.qtcs[0].seriesId === waeCw.qtcs[1].seriesId, 'Rows in one QTC series need a stable shared identifier', waeCw.qtcs);
assert(waeCw.qtcs[0].parseStatus === 'valid', 'Complete QTC rows must parse as valid', waeCw.qtcs[0]);
assert(waeCw.qtcs[0].rawLine.startsWith('QTC:'), 'QTC raw line must be preserved', waeCw.qtcs[0]);

const waeSsb = core.parseLogFile(fs.readFileSync('./tests/fixtures/wae-ssb-qtc.log', 'utf8'), 'wae-ssb-qtc.log');
assert(waeSsb.qsos.length === 2 && waeSsb.qtcs.length === 2, 'WAE SSB records must be separated', waeSsb);
assert(waeSsb.qtcs.every((qtc) => qtc.direction === 'sent'), 'DX station QTC direction must be sent', waeSsb.qtcs);
assert(waeSsb.qtcs.every((qtc) => qtc.mode === 'SSB'), 'PH QTC mode must normalize to SSB', waeSsb.qtcs);

const waeRtty = core.parseLogFile(fs.readFileSync('./tests/fixtures/wae-rtty-qtc.log', 'utf8'), 'wae-rtty-qtc.log');
assert(waeRtty.qsos.length === 2 && waeRtty.qtcs.length === 2, 'WAE RTTY records must be separated', waeRtty);
assert(waeRtty.qtcs.every((qtc) => qtc.direction === 'received'), 'RTTY QTC direction must follow CALL-RX/CALL-TX', waeRtty.qtcs);
assert(waeRtty.qtcs.every((qtc) => qtc.mode === 'RTTY'), 'RY QTC mode must normalize to RTTY', waeRtty.qtcs);

const scoringSpec = JSON.parse(fs.readFileSync('./data/contest_scoring_spec.json', 'utf8'));
const analyzedWae = core.analyzeLogText(waeCwText, 'wae-cw-qtc.log', {}, {
  ctyTable,
  masterCalls: [],
  scoringSpec,
  scoringStatus: 'ok',
  scoringSource: 'regression'
});
assert(analyzedWae.derived.bandModeSummary.reduce((sum, row) => sum + row.all, 0) === 2, 'Ordinary summaries must count QSO records only', analyzedWae.derived.bandModeSummary);
assert(analyzedWae.derived.uniqueCallsCount === 2, 'QTC payload calls must not affect worked-call uniqueness', analyzedWae.derived.uniqueCallsCount);
assert(analyzedWae.derived.allCallsList.every((row) => row.call !== 'DK5PD' && row.call !== 'MM2T'), 'QTC payload calls must not enter worked-calls reports', analyzedWae.derived.allCallsList);
assert(analyzedWae.derived.continentSummary.reduce((sum, row) => sum + row.qsos, 0) === 2, 'Geography reports must count QSO records only', analyzedWae.derived.continentSummary);
assert(analyzedWae.derived.prefixSummary.reduce((sum, row) => sum + row.qsos, 0) === 2, 'Prefix reports must count QSO records only', analyzedWae.derived.prefixSummary);
assert(analyzedWae.derived.frequencySummary.reduce((sum, row) => sum + row.count, 0) === 2, 'Frequency reports must count QSO records only', analyzedWae.derived.frequencySummary);
assert(analyzedWae.derived.operatorsSummary.reduce((sum, row) => sum + row.qsos, 0) <= 2, 'Operator QSO totals must exclude QTC records', analyzedWae.derived.operatorsSummary);
assert(analyzedWae.derived.minuteSeries.reduce((sum, row) => sum + row.qsos, 0) === 2, 'QSO rates must exclude QTC records', analyzedWae.derived.minuteSeries);
assert(analyzedWae.derived.activityMinuteSeries.reduce((sum, row) => sum + row.events, 0) === 4, 'Activity timelines must retain QSO and QTC events', analyzedWae.derived.activityMinuteSeries);
assert(analyzedWae.derived.scoring.computedQsoCount === 2, 'WAE scoring QSO count changed', analyzedWae.derived.scoring);
assert(analyzedWae.derived.scoring.computedQtcCount === 2, 'WAE scoring QTC count changed', analyzedWae.derived.scoring);
assert(analyzedWae.derived.scoring.computedQsoPointsTotal === 4, 'WAE point units must include QSOs and valid QTCs', analyzedWae.derived.scoring);
assert(analyzedWae.derived.qtc.overview.units === 2 && analyzedWae.derived.qtc.overview.seriesCount === 1, 'QTC overview aggregation changed', analyzedWae.derived.qtc);
assert(analyzedWae.derived.qtc.overview.uniquePartners === 1, 'QTC partner aggregation changed', analyzedWae.derived.qtc.partners);
assert(analyzedWae.derived.qtc.warnings.length === 0, 'Valid WAE CW fixture must not produce QTC rule warnings', analyzedWae.derived.qtc.warnings);

const waeQsoOnlyText = waeCwText.split(/\r?\n/).filter((line) => !/^QTC:/i.test(line)).join('\n');
const analyzedWaeQsoOnly = core.analyzeLogText(waeQsoOnlyText, 'wae-cw-qso-only.log', {}, {
  ctyTable,
  masterCalls: [],
  scoringSpec,
  scoringStatus: 'ok',
  scoringSource: 'regression'
});
assert(
  analyzedWae.derived.scoring.computedMultiplierTotal === analyzedWaeQsoOnly.derived.scoring.computedMultiplierTotal,
  'QTC payloads must never add WAE multipliers',
  { withQtc: analyzedWae.derived.scoring, qsoOnly: analyzedWaeQsoOnly.derived.scoring }
);
const waeLedger = analyzedWae.derived.scoring.multiplierCredits || [];
assert(waeLedger.length > 0, 'WAE scoring must expose multiplier credit provenance', analyzedWae.derived.scoring);
assert(
  waeLedger.reduce((sum, credit) => sum + Number(credit.weightedCredit || 0), 0) === analyzedWae.derived.scoring.computedMultiplierTotal,
  'WAE multiplier ledger weighted credits must reconcile to the computed total',
  { ledger: waeLedger, scoring: analyzedWae.derived.scoring }
);
assert(
  waeLedger.every((credit) => credit.ruleId === 'wae' && credit.callsign && Number.isInteger(credit.qsoIndex)),
  'Multiplier credits must include rule and QSO provenance',
  waeLedger
);
assert(
  waeLedger.every((credit) => credit.isQtc !== true && credit.callsign !== 'DK5PD' && credit.callsign !== 'MM2T'),
  'QTC payload calls must never enter the multiplier credit ledger',
  waeLedger
);

const ledgerRule = scoringSpec.rule_sets.find((rule) => rule.id === 'cqww');
const ledgerQsos = [
  { ...makeQso('K1ABC', 0), points: 3 },
  { ...makeQso('K1DEF', 1), points: 3, isDupe: true },
  { ...makeQso('K2ABC', 2), points: 0 }
];
core.buildDerived(ledgerQsos, {}, { ctyTable, masterCalls: [] });
ledgerQsos[1].isDupe = true;
const ledgerPoints = { pointsByIndex: [3, 3, 0] };
const strictLedgerRule = { ...ledgerRule, multipliers: { ...ledgerRule.multipliers, credit_on_zero_point_valid_qso: false } };
const ledgerState = core.computeRuleMultipliers(strictLedgerRule, ledgerQsos, {
  call: 'S53M', stationCountryKey: 'SLOVENIA', stationContinent: 'EU'
}, ledgerPoints, new Set(), { ctyTable, scoringSpec });
assert(ledgerState.credits.length === ledgerState.rawTotal, 'Raw multiplier credits must reconcile to raw total', ledgerState);
assert(ledgerState.rejections.some((row) => row.reason === 'duplicate_qso'), 'Duplicate multiplier rejection reason is required', ledgerState.rejections);
assert(ledgerState.rejections.some((row) => row.reason === 'non_positive_points'), 'Zero-credit multiplier rejection reason is required', ledgerState.rejections);

for (const rule of scoringSpec.rule_sets.filter((entry) => entry.bundle !== true)) {
  const probe = { ...makeQso('K1ABC', 0), points: 3, raw: { exchangeRcvd: 'CA A01 MO01 001 25' } };
  core.buildDerived([probe], {}, { ctyTable, masterCalls: [] });
  const state = core.computeRuleMultipliers(rule, [probe], {
    call: 'S53M', stationCountryKey: 'SLOVENIA', stationContinent: 'EU', stationCqZone: 15,
    stationIsDl: false, stationIsFrench: false, stationIsRu: false, stationIsWVe: false
  }, { pointsByIndex: [3] }, new Set(), { ctyTable, scoringSpec });
  assert(Array.isArray(state.credits) && Array.isArray(state.rejections), `Rule ${rule.id} must expose ledger arrays`, state);
  assert(state.rawTotal === state.credits.length, `Rule ${rule.id} raw credits must reconcile`, state);
  assert(state.weightedTotal === state.credits.reduce((sum, row) => sum + Number(row.weightedCredit || 0), 0) || state.credits.length === 0, `Rule ${rule.id} weighted credits must reconcile`, state);
}

const breakQsoA = makeQso('K1AAA', 0);
const breakQsoB = makeQso('K1BBB', 180);
const breakQtc = {
  ...waeCw.qtcs[0],
  id: 'qtc-break-marker',
  ts: Date.UTC(2025, 0, 1, 1, 30),
  parseStatus: 'valid',
  isQtc: true
};
const qsoOnlyBreaks = core.buildDerived([breakQsoA, breakQsoB], {}, { ctyTable });
const activityBreaks = core.buildDerived([breakQsoA, breakQsoB], {
  qtcs: [breakQtc],
  events: [breakQsoA, breakQtc, breakQsoB]
}, { ctyTable });
assert(activityBreaks.breakSummary.breaks.length === 2, 'A QTC must split an otherwise continuous off-time interval', activityBreaks.breakSummary);
assert(activityBreaks.breakSummary.totalBreakMin < qsoOnlyBreaks.breakSummary.totalBreakMin, 'QTC activity minutes must not count as off-time', {
  activity: activityBreaks.breakSummary,
  qsoOnly: qsoOnlyBreaks.breakSummary
});

console.log('[analysis-core-regression] PASS');
EOF
