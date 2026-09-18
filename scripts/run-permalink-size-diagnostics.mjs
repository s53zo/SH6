import { performance } from 'node:perf_hooks';
import { createSessionCodec } from '../modules/session/codec.js';
import { decodeV3State, inspectV3Encoding } from '../modules/session/permalink-v3.js';

const SLOT_IDS = ['A', 'B', 'C', 'D'];
const DEFAULT_FOCUS = Object.freeze({
  countries_by_time: ['A', 'B'], countries_by_month: ['A', 'B'], countries_by_year: ['A', 'B'],
  qs_by_minute: ['A', 'B'], one_minute_rates: ['A', 'B'], points_by_minute: ['A', 'B'],
  one_minute_point_rates: ['A', 'B'], zones_cq_by_year: ['A', 'B'], zones_cq_by_month: ['A', 'B'],
  zones_itu_by_year: ['A', 'B'], zones_itu_by_month: ['A', 'B']
});
const cloneFocus = (source = DEFAULT_FOCUS) => Object.fromEntries(
  Object.entries(DEFAULT_FOCUS).map(([key, fallback]) => [key, Array.isArray(source[key]) ? source[key].slice() : fallback.slice()])
);
const normalizeList = (values, predicate = () => true) => Array.from(new Set(
  (Array.isArray(values) ? values : []).map(Number).filter((value) => Number.isFinite(value) && predicate(value)).map(Math.trunc)
)).sort((a, b) => a - b);
const base64UrlEncode = (value) => Buffer.from(String(value ?? ''), 'utf8').toString('base64url');
const base64UrlDecode = (value) => Buffer.from(String(value || ''), 'base64url').toString('utf8');

const codec = createSessionCodec({
  getState: () => ({}),
  getSlotById: () => null,
  slotIds: SLOT_IDS,
  appVersion: 'diagnostic',
  sessionVersion: 1,
  permalinkBaseUrl: 'https://s53m.com/SH6/',
  permalinkCompactPrefix: 'v2.',
  periodFilterCompactYears: 'py',
  periodFilterCompactMonths: 'pm',
  analysisModeDxer: 'dxer',
  compareScoreModeComputed: 'computed',
  defaultCompareFocus: DEFAULT_FOCUS,
  normalizeAnalysisMode: (value) => (value === 'dxer' ? 'dxer' : ''),
  normalizeCompareScoreMode: (value) => (['claimed', 'logged'].includes(value) ? value : 'computed'),
  normalizeWpxColumnMode: (value) => String(value || ''),
  normalizePeriodYears: (values) => normalizeList(values),
  normalizePeriodMonths: (values) => normalizeList(values, (value) => value >= 1 && value <= 12),
  cloneCompareFocus: cloneFocus,
  cloneTsRange: (value) => value && Number.isFinite(Number(value.startTs)) && Number.isFinite(Number(value.endTs))
    ? { startTs: Number(value.startTs), endTs: Number(value.endTs) }
    : null,
  base64UrlEncode,
  base64UrlDecode
});

const TWO_LOG_V2 = 'v2.eyJ2IjoyLCJjIjoyLCJzIjpbeyJpIjoiQSIsIm4iOiJ0azBjLmxvZyIsInoiOjE3NTMxNzAsIm8iOiJEZW1vIiwicCI6IkNRV1cvY3cvMjAyNS90azBjLmxvZyIsInQiOiJhIn0seyJpIjoiQiIsIm4iOiJzNTNtLmxvZyIsInoiOjY0MTQ1MCwibyI6IkFyY2hpdmUiLCJwIjoiQ1FXVy9jdy8yMDI1L3M1M20ubG9nIiwidCI6ImEifV19';
const FOUR_LOG_V2 = 'v2.eyJ2IjoyLCJjIjo0LCJzIjpbeyJpIjoiQSIsIm4iOiJ0azBjLmxvZyIsInoiOjE3NTMxNzAsIm8iOiJEZW1vIiwicCI6IkNRV1cvY3cvMjAyNS90azBjLmxvZyIsInQiOiJhIn0seyJpIjoiQiIsIm4iOiJzNTNtLmxvZyIsInoiOjY0MTQ1MCwibyI6IkFyY2hpdmUiLCJwIjoiQ1FXVy9jdy8yMDI1L3M1M20ubG9nIiwidCI6ImEifSx7ImkiOiJDIiwibiI6IkU3MFQubG9nIiwieiI6MTAyNjUsIm8iOiJBcmNoaXZlIiwicCI6IlRUQy1TUENXQy8yMDI2LTA5LTE1L0U3MFQubG9nIiwidCI6ImEifSx7ImkiOiJEIiwibiI6IlM1M1pPLmxvZyIsInoiOjUzMDUsIm8iOiJBcmNoaXZlIiwicCI6IlRUQy1TUENXQy8yMDI2LTA5LTE1L1M1M1pPLmxvZyIsInQiOiJhIn1dfQ';
const decodeV2Fixture = (state) => JSON.parse(base64UrlDecode(state.slice(3)));

function deterministicText(length, seed) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let value = seed >>> 0;
  let output = '';
  for (let index = 0; index < length; index += 1) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    output += alphabet[(value >>> 26) & 63];
  }
  return output;
}

const featureRich = {
  v: 2, am: 'dxer', c: 4, cs: 'logged',
  mv: { view: 'rate', cumulativeBy: 'group', windowMinutes: 60, mode: 'CW', group: 'country', yScale: 1.5 },
  mo: { r: 'B', w: 30, s: 'France', p: 'B', g: 'country', b: '20M', m: 'CW', c: 'High', e: 'RBN', t: 'Plausible opportunity' },
  sy: 0, sk: 0, tr: [1700000000000, 1700003600000],
  f: { r: ['A', 'C'], p: ['A', 'D'] }, g: '20M', gr: '1', rh: { m: 'combinedRate', a: '0', b: '1' },
  b: 20, p: 12, z: 250, n: 2, w: 50, x: 500, wp: 'prefix', py: [2025, 2026], pm: [9, 11],
  l: { s: 'S53', f: '599', b: '20M', m: 'CW', j: '1', o: 'S53ZO', l: 5, t: 'LLNLL', c: 'Slovenia', k: 'EU', q: '15', i: '28', v: { b: '20M', r: 'RUN' }, r: [0, 99], rd: 1, y: [1700000000000, 1700001800000], h: [0, 180], u: [0, 10], d: [0, 2000] },
  s: decodeV2Fixture(FOUR_LOG_V2).s
};

const worstCase = {
  ...featureRich,
  l: { ...featureRich.l, s: deterministicText(4096, 1) },
  s: SLOT_IDS.map((id, index) => ({
    i: id,
    n: `${id}.log`,
    z: 999999999,
    o: 'Archive',
    p: `Archive/${deterministicText(3800, index + 10)}/${id}.log`,
    q: `rule_${deterministicText(150, index + 20)}`,
    t: 'a',
    s: { w: 60, b: ['160M', '80M', '40M', '20M', '15M', '10M'] },
    r: { w: 60, b: ['160M', '80M', '40M', '20M', '15M', '10M'], d: ['20260918', '20260919'] }
  }))
};

const cases = [
  ['minimal one-log', { v: 2, s: [{ i: 'A', n: 'N0CALL.log', z: 1200, o: 'Local', t: 'l' }] }],
  ['supplied two-log', decodeV2Fixture(TWO_LOG_V2)],
  ['supplied mixed four-log', decodeV2Fixture(FOUR_LOG_V2)],
  ['feature-rich four-log', featureRich],
  ['worst-case legitimate', worstCase]
];

const results = cases.map(([name, compact]) => {
  const full = { ...codec.inflateCompactSessionPayload(compact), createdAt: 0 };
  const v2State = `v2.${base64UrlEncode(JSON.stringify(compact))}`;
  const encodeStart = performance.now();
  const v3 = inspectV3Encoding(compact);
  const encodeMs = performance.now() - encodeStart;
  const decodeStart = performance.now();
  const decoded = decodeV3State(v3.state);
  const decodeMs = performance.now() - decodeStart;
  if (!decoded) throw new Error(`${name}: v3 failed to decode`);
  const selected = v3.state.length < v2State.length ? 'v3' : 'v2';
  const selectedLength = Math.min(v2State.length, v3.state.length);
  return {
    name,
    fullJsonBytes: new TextEncoder().encode(JSON.stringify(full)).length,
    v2StateLength: v2State.length,
    positionalJsonBytes: v3.positionalJsonBytes,
    compressedBytes: v3.compressedBytes,
    v3StateLength: v3.state.length,
    selected,
    reductionPercent: Number((((v2State.length - selectedLength) / v2State.length) * 100).toFixed(1)),
    encodeMs: Number(encodeMs.toFixed(3)),
    decodeMs: Number(decodeMs.toFixed(3))
  };
});

const suppliedMixed = results.find((entry) => entry.name === 'supplied mixed four-log');
if (!suppliedMixed || suppliedMixed.v2StateLength !== 505 || suppliedMixed.v3StateLength >= 200 || suppliedMixed.reductionPercent < 60) {
  throw new Error(`Supplied mixed four-log reduction regressed: ${JSON.stringify(suppliedMixed)}`);
}
if (results.some((entry) => entry.selected !== (entry.v3StateLength < entry.v2StateLength ? 'v3' : 'v2'))) {
  throw new Error('Shortest-format selection diagnostic failed');
}

console.table(results);
console.log(JSON.stringify({ passed: true, dependency: 'fflate 0.8.3 raw DEFLATE subset (MIT)', results }, null, 2));
