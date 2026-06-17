#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "${ROOT_DIR}"

node <<'EOF'
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const source = fs.readFileSync(path.join(process.cwd(), 'competitor-coach.js'), 'utf8');
const sandbox = {
  console,
  window: {}
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: 'competitor-coach.js' });

const coach = sandbox.window.SH6CompetitorCoach;
if (!coach || typeof coach.buildModel !== 'function') {
  throw new Error('Unable to load SH6CompetitorCoach.buildModel');
}

function assert(condition, message, payload) {
  if (condition) return;
  console.error('[competitor-coach-regression] FAIL');
  console.error(message);
  if (payload !== undefined) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

const rows = [
  { callsign: 'S58A', category: 'MSH', score: 14350008, qsos: 4225, m: 900, cty: 'S5' },
  { callsign: 'S59A', category: 'MSH', score: 12000000, qsos: 3900, m: 870, cty: 'S5' },
  { callsign: 'S50M', category: 'MSL', score: 5000000, qsos: 2500, m: 600, cty: 'S5' },
  { callsign: 'S51A', category: 'M2', score: 9000000, qsos: 3000, m: 700, cty: 'S5' },
  { callsign: 'S52A', category: 'MM', score: 11000000, qsos: 3500, m: 800, cty: 'S5' },
  { callsign: 'S54A', category: 'MD', score: 7000000, qsos: 2700, m: 650, cty: 'S5' },
  { callsign: 'S53A', category: 'SOAB HP', score: 6000000, qsos: 2300, m: 620, cty: 'S5' }
];

const sameCategory = coach.buildModel({
  rows,
  scopeType: 'dxcc',
  scopeValue: 'S5',
  categoryMode: 'same',
  targetCategory: 'MULTI-OP',
  stationCall: 'S58A',
  resolveCallMeta: () => ({ dxcc: 'S5' }),
  limit: 20
});
assert(
  sameCategory.targetCategory === 'MSH'
    && sameCategory.totalRows === 2
    && sameCategory.rows.every((row) => row.category === 'MSH'),
  'Same-category competitor coach must narrow broad MULTI-OP context to the current station exact category.',
  sameCategory
);

const allCategories = coach.buildModel({
  rows,
  scopeType: 'dxcc',
  scopeValue: 'S5',
  categoryMode: 'all',
  targetCategory: 'MULTI-OP',
  stationCall: 'S58A',
  resolveCallMeta: () => ({ dxcc: 'S5' }),
  limit: 20
});
assert(
  allCategories.totalRows === rows.length,
  'All-categories competitor coach mode must still keep the full scoped cohort.',
  allCategories
);

const broadMultiFallback = coach.buildModel({
  rows,
  scopeType: 'dxcc',
  scopeValue: 'S5',
  categoryMode: 'same',
  targetCategory: 'MULTI-OP',
  stationCall: 'NOHIT',
  resolveCallMeta: () => ({ dxcc: 'S5' }),
  limit: 20
});
assert(
  broadMultiFallback.totalRows === 6
    && broadMultiFallback.rows.every((row) => ['MSH', 'MSL', 'M2', 'MM', 'MD'].includes(row.category)),
  'Broad MULTI-OP fallback should still include multi categories when the current exact category is unknown.',
  broadMultiFallback
);

const singleExact = coach.buildModel({
  rows: [
    { callsign: 'S55OO', category: 'SO AB HP', score: 10000, qsos: 100, m: 100, cty: 'S5' },
    { callsign: 'S53M', category: 'SOAB HP', score: 9000, qsos: 90, m: 100, cty: 'S5' },
    { callsign: 'S57X', category: 'SO AB LP', score: 8000, qsos: 80, m: 100, cty: 'S5' }
  ],
  scopeType: 'dxcc',
  scopeValue: 'S5',
  categoryMode: 'same',
  targetCategory: 'SO AB HP',
  stationCall: 'S55OO',
  resolveCallMeta: () => ({ dxcc: 'S5' }),
  limit: 20
});
assert(
  singleExact.totalRows === 2
    && singleExact.rows.every((row) => coach.normalizeCategoryKey(row.category).replace(/\s+/g, '') === 'SOABHP'),
  'Same-category competitor coach must not merge all single-op power/band categories.',
  singleExact
);

console.log('[competitor-coach-regression] PASS');
EOF
