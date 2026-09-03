#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

node <<'EOF'
'use strict';

const { performance } = require('perf_hooks');
require('./modules/compare/compare-core.js');

const core = globalThis.SH6CompareCore;
if (!core || typeof core.buildCompareBucketPayload !== 'function') {
  throw new Error('SH6CompareCore did not load.');
}

function assert(condition, message, details) {
  if (condition) return;
  console.error('[compare-core-regression] FAIL');
  console.error(message);
  if (details !== undefined) console.error(JSON.stringify(details, null, 2));
  process.exit(1);
}

const filterFixture = [
  { i: 0, call: 'K1AAA', op: 'OP1', txId: null, qsoNumber: 1, ts: Date.UTC(2025, 0, 4, 23, 50), isDupe: false },
  { i: 1, call: 'K1BBB', op: 'OP2', txId: '1', qsoNumber: 2, ts: Date.UTC(2025, 0, 5, 0, 0), isDupe: true }
];
assert(
  core.applyLogFilters(filterFixture, { opFilter: 'OP1' }).map((qso) => qso.i).join(',') === '0',
  'Operator filtering must preserve the requested operator.'
);
assert(
  core.applyLogFilters(filterFixture, {
    rangeFilter: { start: 1, end: 2, excludeDupes: true }
  }).map((qso) => qso.i).join(',') === '0',
  'Range filtering with excludeDupes must remove duplicate QSOs.'
);
assert(core.applyLogFilters(filterFixture, { radioFilter: '1' }).map((qso) => qso.i).join(',') === '1', 'Radio filtering must retain the requested transmitter ID.');
assert(core.applyLogFilters(filterFixture, { radioFilter: '__MISSING__' }).map((qso) => qso.i).join(',') === '0', 'Missing-radio filtering must retain only QSOs without a transmitter ID.');

const rowsPerSlot = 40000;
const start = Date.UTC(2025, 0, 4, 23, 50);
const logs = [0, 1, 2, 3].map((slotIndex) => (
  Array.from({ length: rowsPerSlot }, (_, index) => ({
    i: index,
    call: `K${(index % 9) + 1}AAA`,
    band: '20M',
    mode: 'CW',
    qsoNumber: index + 1,
    ts: start + (slotIndex * 1000) + (index * 60000)
  }))
));

const startedAt = performance.now();
const payload = core.buildCompareBucketPayload(logs, {});
const durationMs = performance.now() - startedAt;
assert(
  payload.counts.length === 4 && payload.counts.every((count) => count === rowsPerSlot),
  'The 160,000-QSO comparison must retain every slot count.',
  payload.counts
);
assert(
  payload.buckets[0]?.key === '6-143',
  'Week-wrapped bucket order must begin at the true earliest timestamp.',
  { firstBucketKey: payload.buckets[0]?.key }
);
assert(
  Number.isFinite(payload.totalRows) && payload.totalRows > 0,
  'The large comparison must produce a finite row count.',
  { totalRows: payload.totalRows }
);

console.log('[compare-core-regression] PASS');
console.log(JSON.stringify({ totalQsos: rowsPerSlot * 4, durationMs: Math.round(durationMs * 100) / 100 }));
EOF
