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

console.log('[analysis-core-regression] PASS');
EOF
