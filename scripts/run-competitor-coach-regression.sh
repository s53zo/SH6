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

const requestedCallExamples = [
  {
    name: 'S53M CQWW MM',
    stationCall: 'S53M',
    targetCategory: 'MULTI-OP',
    expectedTarget: 'MM',
    expectedCategories: ['MM'],
    rows: [
      { callsign: 'S53M', category: 'MM', score: 11504360, qsos: 3600, m: 700, cty: 'S5' },
      { callsign: 'S53M', category: 'AH ALL', score: 7764075, qsos: 2500, m: 600, cty: 'S5' },
      { callsign: 'S59ABC', category: 'MM', score: 9000000, qsos: 3300, m: 680, cty: 'S5' }
    ]
  },
  {
    name: 'S58A CQWPX MSH',
    stationCall: 'S58A',
    targetCategory: 'MULTI-OP',
    expectedTarget: 'MSH',
    expectedCategories: ['MSH'],
    rows: [
      { callsign: 'S58A', category: 'MSH', score: 14350008, qsos: 4225, m: 900, cty: 'S5' },
      { callsign: 'S58A', category: 'SH ALL', score: 5899009, qsos: 1900, m: 500, cty: 'S5' },
      { callsign: 'S59A', category: 'MSH', score: 12000000, qsos: 3900, m: 870, cty: 'S5' },
      { callsign: 'S50M', category: 'MSL', score: 5000000, qsos: 2500, m: 600, cty: 'S5' }
    ]
  },
  {
    name: 'K1LZ mixed same-call categories',
    stationCall: 'K1LZ',
    targetCategory: 'MULTI-OP',
    expectedTarget: 'M2',
    expectedCategories: ['M2'],
    rows: [
      { callsign: 'K1LZ', category: 'SH ALL', score: 16279842, qsos: 5000, m: 900, cty: 'W1' },
      { callsign: 'K1LZ', category: 'M2', score: 27797836, qsos: 7000, m: 1100, cty: 'W1' },
      { callsign: 'W1RIVAL', category: 'M2', score: 24000000, qsos: 6500, m: 1030, cty: 'W1' }
    ]
  },
  {
    name: 'AA3B CQWW single low',
    stationCall: 'AA3B',
    targetCategory: 'SINGLE-OP',
    expectedTarget: 'SL ALL',
    expectedCategories: ['SL ALL'],
    rows: [
      { callsign: 'AA3B', category: 'SL ALL', score: 14790600, qsos: 5200, m: 980, cty: 'W3' },
      { callsign: 'W3RIVAL', category: 'SL ALL', score: 13000000, qsos: 5000, m: 930, cty: 'W3' },
      { callsign: 'W3HP', category: 'SH ALL', score: 16000000, qsos: 5500, m: 1000, cty: 'W3' }
    ]
  },
  {
    name: 'E7DX CQWW MSH',
    stationCall: 'E7DX',
    targetCategory: 'MULTI-OP',
    expectedTarget: 'MSH',
    expectedCategories: ['MSH'],
    rows: [
      { callsign: 'E7DX', category: 'MSH', score: 15645224, qsos: 4600, m: 950, cty: 'E7' },
      { callsign: 'E7DX', category: 'SH ALL', score: 6765085, qsos: 2500, m: 610, cty: 'E7' },
      { callsign: 'E7RIVAL', category: 'MSH', score: 12000000, qsos: 4200, m: 880, cty: 'E7' }
    ]
  }
];

const operatorLinkedCategory = coach.buildModel({
  rows: [
    { callsign: 'LZ5R', category: 'M2', score: 27797836, qsos: 7918, m: 1622, operators: 'K1LZ', cty: 'LZ' },
    { callsign: 'K1LZ', category: 'SH ALL', score: 7688480, qsos: 2791, m: 928, operators: '', cty: 'W1' },
    { callsign: 'W1RIVAL', category: 'SH ALL', score: 7000000, qsos: 2600, m: 910, operators: '', cty: 'W1' }
  ],
  scopeType: 'dxcc',
  scopeValue: 'W1',
  categoryMode: 'same',
  targetCategory: 'MULTI-OP',
  stationCall: 'K1LZ',
  operatorCalls: ['K1LZ'],
  resolveCallMeta: (call) => ({ dxcc: call === 'LZ5R' ? 'LZ' : 'W1' }),
  limit: 20
});
assert(
  operatorLinkedCategory.currentRow?.callsign === 'K1LZ'
    && operatorLinkedCategory.targetCategory === 'SH ALL'
    && operatorLinkedCategory.rows.every((row) => row.category === 'SH ALL'),
  'Operator-linked rows must not determine the loaded station category.',
  operatorLinkedCategory
);

requestedCallExamples.forEach((example) => {
  const model = coach.buildModel({
    rows: example.rows,
    scopeType: 'dxcc',
    scopeValue: example.rows[0].cty,
    categoryMode: 'same',
    targetCategory: example.targetCategory,
    stationCall: example.stationCall,
    resolveCallMeta: () => ({ dxcc: example.rows[0].cty }),
    limit: 20
  });
  const categories = Array.from(new Set(model.rows.map((row) => row.category))).sort();
  assert(
    model.currentRow?.callsign === example.stationCall
      && model.targetCategory === example.expectedTarget
      && JSON.stringify(categories) === JSON.stringify(example.expectedCategories.slice().sort()),
    `${example.name} should resolve the current exact category and filter the cohort consistently.`,
    { model, categories, expected: example }
  );
});

async function runCqApiOperatorRegression() {
  const cqSource = fs.readFileSync(path.join(process.cwd(), 'cq-api-enrichment.js'), 'utf8');
  const payloads = new Map([
    ['geolist', { status: 200, W1: 'United States' }],
    ['catlist', { status: 200, data: [{ category: 'M2', description: 'Multi-Two' }, { category: 'SH ALL', description: 'Single Op High All Band' }] }],
    ['score/cw/2025/K1LZ', {
      status: 200,
      data: [
        { callsign: 'LZ5R', cat: 'M2', score: '27797836', q: '7918', m: '1622', operators: 'K1LZ', cty: 'LZ', yr: '2025' },
        { callsign: 'ND3T', cat: 'SH ALL', score: '16279842', q: '4211', m: '1347', operators: 'LZ5DB@K1LZ', cty: 'W1', yr: '2025' }
      ]
    }],
    ['score/cw/*/K1LZ', {
      status: 200,
      data: [
        { callsign: 'LZ5R', cat: 'M2', score: '27797836', q: '7918', m: '1622', operators: 'K1LZ', cty: 'LZ', yr: '2025' },
        { callsign: 'K1LZ', cat: 'M2', score: '32328432', q: '7092', m: '1548', operators: 'K1LZ K1ZM', cty: 'W1', yr: '2024' }
      ]
    }],
    ['record/cw/*/W1', { status: 400, status_message: 'No results found' }],
    ['record/cw/*/WORLD', { status: 400, status_message: 'No results found' }]
  ]);
  const cqSandbox = {
    console,
    window: {},
    globalThis: null,
    setTimeout,
    clearTimeout,
    AbortController,
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    fetch: async (url) => {
      const pathKey = String(url).replace(/^https:\/\/proxy\/cqwpx\//, '');
      const payload = payloads.get(pathKey) || { status: 400, status_message: `Unexpected ${pathKey}` };
      return {
        status: Number(payload.status) || 200,
        text: async () => JSON.stringify(payload)
      };
    }
  };
  cqSandbox.globalThis = cqSandbox;
  vm.createContext(cqSandbox);
  vm.runInContext(cqSource, cqSandbox, { filename: 'cq-api-enrichment.js' });

  const client = cqSandbox.window.SH6CqApi.createClient({
    proxyBase: 'https://proxy',
    useDirect: false,
    maxAttempts: 1,
    timeoutMs: 1000,
    storagePrefix: 'test_'
  });
  const result = await client.enrich({
    contestId: 'CQWPX',
    mode: 'cw',
    year: '2025',
    callsign: 'K1LZ',
    categories: [],
    geos: ['W1'],
    scopeGeos: { dxcc: 'W1', world: 'WORLD' }
  });
  assert(
    result.ok
      && !result.currentScore
      && !result.matchedCategory
      && !result.record,
    'CQ API enrichment must not use operator-linked score rows as station category evidence.',
    result
  );
}

runCqApiOperatorRegression()
  .then(() => {
    console.log('[competitor-coach-regression] PASS');
  })
  .catch((err) => {
    console.error('[competitor-coach-regression] FAIL');
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  });
EOF
