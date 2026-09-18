#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "${ROOT_DIR}"

node --input-type=module <<'EOF'
import { createSessionCodec } from './modules/session/codec.js';
import { createComparePerspectiveStore } from './modules/session/perspectives.js';
import { deflateRawSync } from 'node:zlib';
import {
  PERMALINK_V3_LIMITS,
  base64UrlToBytes,
  bytesToBase64Url,
  compactStateToPositional,
  decodeV3State,
  encodeV3State,
  positionalToCompactState
} from './modules/session/permalink-v3.js';

const DEFAULT_COMPARE_FOCUS = Object.freeze({
  countries_by_time: ['A', 'B'],
  countries_by_month: ['A', 'B'],
  countries_by_year: ['A', 'B'],
  qs_by_minute: ['A', 'B'],
  one_minute_rates: ['A', 'B'],
  points_by_minute: ['A', 'B'],
  one_minute_point_rates: ['A', 'B'],
  zones_cq_by_year: ['A', 'B'],
  zones_cq_by_month: ['A', 'B'],
  zones_itu_by_year: ['A', 'B'],
  zones_itu_by_month: ['A', 'B']
});

const cloneCompareFocus = (source = DEFAULT_COMPARE_FOCUS) => ({
  countries_by_time: Array.isArray(source.countries_by_time) ? source.countries_by_time.slice() : ['A', 'B'],
  countries_by_month: Array.isArray(source.countries_by_month) ? source.countries_by_month.slice() : ['A', 'B'],
  countries_by_year: Array.isArray(source.countries_by_year) ? source.countries_by_year.slice() : ['A', 'B'],
  qs_by_minute: Array.isArray(source.qs_by_minute) ? source.qs_by_minute.slice() : ['A', 'B'],
  one_minute_rates: Array.isArray(source.one_minute_rates) ? source.one_minute_rates.slice() : ['A', 'B'],
  points_by_minute: Array.isArray(source.points_by_minute) ? source.points_by_minute.slice() : ['A', 'B'],
  one_minute_point_rates: Array.isArray(source.one_minute_point_rates) ? source.one_minute_point_rates.slice() : ['A', 'B'],
  zones_cq_by_year: Array.isArray(source.zones_cq_by_year) ? source.zones_cq_by_year.slice() : ['A', 'B'],
  zones_cq_by_month: Array.isArray(source.zones_cq_by_month) ? source.zones_cq_by_month.slice() : ['A', 'B'],
  zones_itu_by_year: Array.isArray(source.zones_itu_by_year) ? source.zones_itu_by_year.slice() : ['A', 'B'],
  zones_itu_by_month: Array.isArray(source.zones_itu_by_month) ? source.zones_itu_by_month.slice() : ['A', 'B']
});

const cloneTsRange = (value, startKey = 'startTs', endKey = 'endTs') => {
  if (!value || typeof value !== 'object') return null;
  const start = Number(value[startKey]);
  const end = Number(value[endKey]);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return { [startKey]: start, [endKey]: end };
};

const normalizeAnalysisMode = (value) => {
  const key = String(value || '').toLowerCase();
  return key === 'dxer' || key === 'contester' ? key : '';
};

const normalizeCompareScoreMode = (value) => {
  const key = String(value || '').toLowerCase();
  return key === 'claimed' || key === 'logged' ? key : 'computed';
};
const normalizeWpxColumnMode = (value) => ['all', 'prefix', 'band', 'continent'].includes(String(value || '').toLowerCase())
  ? String(value).toLowerCase()
  : 'all';

const normalizePeriodYears = (values) => Array.from(new Set((Array.isArray(values) ? values : []).map((value) => Math.trunc(Number(value))).filter((value) => Number.isFinite(value)))).sort((a, b) => a - b);
const normalizePeriodMonths = (values) => Array.from(new Set((Array.isArray(values) ? values : []).map((value) => Math.trunc(Number(value))).filter((value) => Number.isFinite(value) && value >= 1 && value <= 12))).sort((a, b) => a - b);

const base64UrlEncode = (value) => Buffer.from(String(value == null ? '' : value), 'utf8')
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/g, '');
const base64UrlDecode = (value) => {
  let text = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  while (text.length % 4) text += '=';
  return Buffer.from(text, 'base64').toString('utf8');
};

const state = {
  multiplierOverview: { view: 'tradeoff', windowMinutes: 30, mode: 'CW', group: 'country', tradeoffBySlot: { A: { at: 1700000000000, targetBand: '20M', horizonMinutes: 15, scenarios: { run: { rate: '60', averagePoints: '2', credits: '0', probability: '0', searchMinutes: '0' } } }, D: { scenarios: { hunt: { credits: '', probability: null } } } } },
  analysisMode: 'dxer',
  compareCount: 4,
  compareScoreMode: 'logged',
  multiplierOpportunitiesReferenceSlotId: 'B',
  multiplierOpportunitiesWindowMinutes: 30,
  multiplierOpportunitiesFilters: { search: 'France', comparison: 'B', group: 'country', band: '20M', mode: 'CW', confidence: 'High', evidence: 'RBN', status: 'Plausible opportunity' },
  compareSyncEnabled: false,
  compareStickyEnabled: false,
  compareTimeRangeLock: { startTs: 1700000000000, endTs: 1700003600000 },
  compareFocus: cloneCompareFocus({
    ...DEFAULT_COMPARE_FOCUS,
    countries_by_month: ['A', 'C'],
    points_by_minute: ['A', 'D']
  }),
  globalBandFilter: '20M',
  globalRadioFilter: '1',
  radioHeatMetric: 'combinedRate',
  radioHeatA: '0',
  radioHeatB: '1',
  breakThreshold: 20,
  passedQsoWindow: 12,
  globalYearsFilter: [2025],
  globalMonthsFilter: [11],
  logPageSize: 250,
  logPage: 2,
  compareLogWindowStart: 50,
  compareLogWindowSize: 500,
  wpxColumnMode: 'continent',
  logSearch: 'S53',
  logFieldFilter: '599',
  logBandFilter: '20M',
  logModeFilter: 'CW',
  logRadioFilter: '1',
  logOpFilter: 'S53ZO',
  logCallLenFilter: 0,
  logCallStructFilter: 'LLNLL',
  logCountryFilter: 'Slovenia',
  logContinentFilter: 'EU',
  logCqFilter: '15',
  logItuFilter: '28',
  logOperatingStyleFilter: { band: '20M', role: 'RUN' },
  logRange: { start: 0, end: 99, excludeDupes: true },
  logTimeRange: { startTs: 1700000000000, endTs: 1700001800000 },
  logHeadingRange: { start: 0, end: 180 },
  logStationQsoRange: { min: 1, max: 10 },
  logDistanceRange: { start: 100, end: 2000 }
};

const slotMap = new Map([
  ['A', {
    qsoData: { qsos: [1, 2] },
    logFile: { name: 'S55OO.log', size: 14535, source: 'Archive', path: 'ZRS_KVP/2025/jesen/S55OO.log' },
    rawLogText: 'RAW-A',
    rawLogBytes: new Uint8Array([0, 159, 146, 150]),
    scoringRuleOverride: 'wrtc_2022',
    skipped: false,
    spotsState: { windowMinutes: 20, bandFilter: ['20M'] },
    rbnState: { windowMinutes: 30, bandFilter: ['20M'], selectedDays: ['20251116'] }
  }],
  ['B', {
    qsoData: { qsos: [1] },
    logFile: { name: 'S53M.log', size: 15573, source: 'Archive', path: 'ZRS_KVP/2025/jesen/S53M.log' },
    rawLogText: '',
    scoringRuleOverride: 'wrtc_2026',
    skipped: false,
    spotsState: { windowMinutes: 15, bandFilter: [] },
    rbnState: { windowMinutes: 15, bandFilter: [], selectedDays: [] }
  }],
  ['C', { qsoData: null, logFile: null, skipped: true }],
  ['D', { qsoData: null, logFile: null, skipped: false }]
]);

const codec = createSessionCodec({
  getState: () => state,
  getSlotById: (id) => slotMap.get(id),
  slotIds: ['A', 'B', 'C', 'D'],
  appVersion: '6.2.21',
  sessionVersion: 6,
  permalinkBaseUrl: 'https://s53m.com/SH6/',
  permalinkCompactPrefix: 'v2.',
  periodFilterCompactYears: 'py',
  periodFilterCompactMonths: 'pm',
  analysisModeDxer: 'dxer',
  compareScoreModeComputed: 'computed',
  defaultCompareFocus: DEFAULT_COMPARE_FOCUS,
  normalizeAnalysisMode,
  normalizeCompareScoreMode,
  normalizeWpxColumnMode,
  normalizePeriodYears,
  normalizePeriodMonths,
  cloneCompareFocus,
  cloneTsRange,
  base64UrlEncode,
  base64UrlDecode
});

const storage = new Map();
let durableSaved = [];
const perspectiveStore = createComparePerspectiveStore({
  getState: () => state,
  getCurrentReportId: () => 'points_by_minute',
  storageKey: 'sh6_compare_perspectives_v1',
  limit: 12,
  readStorageText: (key) => storage.get(key) || '',
  writeStorageText: (key, value) => storage.set(key, value),
  ensureDurableStorageReady: async () => ({
    saveComparePerspectives: async (items) => { durableSaved = Array.isArray(items) ? items.slice() : []; }
  }),
  normalizeCompareScoreMode,
  cloneCompareFocus,
  cloneTsRange,
  defaultCompareFocus: DEFAULT_COMPARE_FOCUS
});

const checks = [];
const add = (name, passed, details = null) => checks.push({ name, passed: Boolean(passed), details });

const payload = codec.buildSessionPayload(true);
add('Multiplier overview session snapshot is independent', JSON.stringify(payload.multiplierOverview) === JSON.stringify(state.multiplierOverview) && payload.multiplierOverview !== state.multiplierOverview, payload.multiplierOverview);
add('Session payload stores analysisMode', payload.analysisMode === 'dxer', payload.analysisMode);
add('Session payload stores synchronized radio filters', payload.globalRadioFilter === '1' && payload.logFilters?.radioFilter === '1', { global: payload.globalRadioFilter, log: payload.logFilters?.radioFilter });
add('Session payload stores radio heatmap settings', payload.radioHeatMetric === 'combinedRate' && payload.radioHeatA === '0' && payload.radioHeatB === '1', { metric: payload.radioHeatMetric, a: payload.radioHeatA, b: payload.radioHeatB });
add('Session payload stores multiplier opportunity settings', payload.multiplierOpportunities?.referenceSlotId === 'B' && payload.multiplierOpportunities?.windowMinutes === 30, payload.multiplierOpportunities);
add('Session payload includes raw slot text when requested', payload.slots[0].rawText === 'RAW-A', payload.slots[0].rawText);
add('Session payload includes original raw bytes when requested', typeof payload.slots[0].rawBytesBase64 === 'string' && payload.slots[0].rawBytesBase64.length > 0, payload.slots[0].rawBytesBase64);
add('Session payload preserves WRTC 2022 scoring override', payload.slots[0].scoringRuleOverride === 'wrtc_2022', payload.slots[0]);
add('Session payload preserves WRTC 2026 scoring override', payload.slots[1].scoringRuleOverride === 'wrtc_2026', payload.slots[1]);

const compact = codec.buildCompactSessionPayload(payload, true);
const undatedSettings = codec.normalizeMultiplierSettings({ view: 'undated', tradeoffBySlot: { B: { targetMode: 'SSB' } } });
add('Undated view and target mode persist', undatedSettings.view === 'undated' && undatedSettings.tradeoffBySlot.B.targetMode === 'SSB', undatedSettings);
add('Multiplier overview compact round trip preserves per-slot zero and empty assumptions', JSON.stringify(codec.inflateCompactSessionPayload(compact).multiplierOverview) === JSON.stringify(payload.multiplierOverview), compact.mv);
add('Legacy compact session defaults multiplier settings safely', JSON.stringify(codec.inflateCompactSessionPayload({ v: 2 }).multiplierOverview) === '{}', null);
const malformedMultiplier = codec.normalizeMultiplierSettings({ view: 'bad', windowMinutes: 2, cache: [1, 2], tradeoffBySlot: { X: { horizonMinutes: 15 }, A: { targetGroup: 'x'.repeat(1000), scenarios: { unknown: { rate: 10 }, run: { rate: Infinity, probability: 0 } } } } });
add('Multiplier settings are bounded and reject unknown keys', !malformedMultiplier.view && !malformedMultiplier.cache && !malformedMultiplier.tradeoffBySlot.X && malformedMultiplier.tradeoffBySlot.A.targetGroup.length === 160 && !('rate' in malformedMultiplier.tradeoffBySlot.A.scenarios.run) && malformedMultiplier.tradeoffBySlot.A.scenarios.run.probability === 0, malformedMultiplier);
add('Compact payload saves analysisMode', compact.am === 'dxer', compact);
add('Compact payload keeps compare focus overrides', Array.isArray(compact.f?.r) && compact.f.r[1] === 'C', compact.f);
const compactSlotA = codec.inflateCompactSessionPayload(compact).slots.find((slot) => slot.id === 'A');
add('Compact session preserves original raw byte payload', typeof compactSlotA?.rawBytesBase64 === 'string' && compactSlotA.rawBytesBase64 === payload.slots[0].rawBytesBase64, compactSlotA?.rawBytesBase64);

const historicalCompact = { ...compact };
delete historicalCompact.x;
const historicalInflated = codec.inflateCompactSessionPayload(historicalCompact);
add(
  'Legacy compact payload without x restores the historical 1000-row compare window',
  historicalInflated?.compareLogWindowSize === 1000,
  historicalInflated?.compareLogWindowSize
);

const cappedRenderPreference = codec.inflateCompactSessionPayload({ ...compact, x: 500 });
const adaptiveRenderSize = Math.min(cappedRenderPreference.compareLogWindowSize, 100);
add(
  'Adaptive compare rendering leaves the persisted user window preference unchanged',
  adaptiveRenderSize === 100 && cappedRenderPreference.compareLogWindowSize === 500,
  { adaptiveRenderSize, persistedWindowSize: cappedRenderPreference.compareLogWindowSize }
);

const encoded = codec.encodePermalinkState(payload);
add('Permalink encoding prefers compressed v3 for a feature-rich state', encoded.startsWith('v3.'), encoded.slice(0, 8));

const parsed = codec.parsePermalinkState(`?state=${encoded}`);
const expectedPermalinkPayload = codec.inflateCompactSessionPayload(codec.buildCompactSessionPayload(payload, false));
const stablePayload = (value) => ({ ...value, createdAt: 0 });
add('Complete compact-to-v3 round trip is semantically exact', JSON.stringify(stablePayload(parsed)) === JSON.stringify(stablePayload(expectedPermalinkPayload)), { parsed, expectedPermalinkPayload });
add('Permalink parse restores analysisMode', parsed?.analysisMode === 'dxer', parsed?.analysisMode);
add('Permalink parse restores compare count', parsed?.compareCount === 4, parsed?.compareCount);
add('Permalink parse restores synchronized radio filters', parsed?.globalRadioFilter === '1' && parsed?.logFilters?.radioFilter === '1', { global: parsed?.globalRadioFilter, log: parsed?.logFilters?.radioFilter });
add('Permalink parse restores radio heatmap settings', parsed?.radioHeatMetric === 'combinedRate' && parsed?.radioHeatA === '0' && parsed?.radioHeatB === '1', { metric: parsed?.radioHeatMetric, a: parsed?.radioHeatA, b: parsed?.radioHeatB });
add('Permalink parse restores multiplier opportunity settings', parsed?.multiplierOpportunities?.referenceSlotId === 'B' && parsed?.multiplierOpportunities?.windowMinutes === 30 && parsed?.multiplierOpportunities?.filters?.confidence === 'High' && parsed?.multiplierOpportunities?.filters?.evidence === 'RBN' && parsed?.multiplierOpportunities?.filters?.status === 'Plausible opportunity', parsed?.multiplierOpportunities);
add('Permalink parse restores slot archive path', parsed?.slots?.[0]?.archivePath === 'ZRS_KVP/2025/jesen/S55OO.log', parsed?.slots?.[0]);
add('Permalink parse restores WRTC 2022 scoring override', parsed?.slots?.[0]?.scoringRuleOverride === 'wrtc_2022', parsed?.slots?.[0]);
add('Permalink parse restores WRTC 2026 scoring override', parsed?.slots?.[1]?.scoringRuleOverride === 'wrtc_2026', parsed?.slots?.[1]);
add('Permalink parse restores skipped compact slot', parsed?.slots?.[2]?.skipped === true, parsed?.slots?.[2]);
add('Permalink parse leaves omitted slot D empty', parsed?.slots?.[3]?.empty === true && parsed?.slots?.[3]?.skipped === false, parsed?.slots?.[3]);
add('Normal permalink never includes raw uploaded log content', !parsed?.slots?.some((slot) => slot.rawText || slot.rawBytesBase64), parsed?.slots);

const knownV2TwoLog = 'v2.eyJ2IjoyLCJjIjoyLCJzIjpbeyJpIjoiQSIsIm4iOiJ0azBjLmxvZyIsInoiOjE3NTMxNzAsIm8iOiJEZW1vIiwicCI6IkNRV1cvY3cvMjAyNS90azBjLmxvZyIsInQiOiJhIn0seyJpIjoiQiIsIm4iOiJzNTNtLmxvZyIsInoiOjY0MTQ1MCwibyI6IkFyY2hpdmUiLCJwIjoiQ1FXVy9jdy8yMDI1L3M1M20ubG9nIiwidCI6ImEifV19';
const knownV2FourLog = 'v2.eyJ2IjoyLCJjIjo0LCJzIjpbeyJpIjoiQSIsIm4iOiJ0azBjLmxvZyIsInoiOjE3NTMxNzAsIm8iOiJEZW1vIiwicCI6IkNRV1cvY3cvMjAyNS90azBjLmxvZyIsInQiOiJhIn0seyJpIjoiQiIsIm4iOiJzNTNtLmxvZyIsInoiOjY0MTQ1MCwibyI6IkFyY2hpdmUiLCJwIjoiQ1FXVy9jdy8yMDI1L3M1M20ubG9nIiwidCI6ImEifSx7ImkiOiJDIiwibiI6IkU3MFQubG9nIiwieiI6MTAyNjUsIm8iOiJBcmNoaXZlIiwicCI6IlRUQy1TUENXQy8yMDI2LTA5LTE1L0U3MFQubG9nIiwidCI6ImEifSx7ImkiOiJEIiwibiI6IlM1M1pPLmxvZyIsInoiOjUzMDUsIm8iOiJBcmNoaXZlIiwicCI6IlRUQy1TUENXQy8yMDI2LTA5LTE1L1M1M1pPLmxvZyIsInQiOiJhIn1dfQ';
const knownTwo = codec.parsePermalinkState(`?state=${knownV2TwoLog}`);
const knownFour = codec.parsePermalinkState(`?state=${knownV2FourLog}`);
const slotMetadata = (value) => (value?.slots || []).filter((slot) => !slot.empty).map((slot) => ({
  id: slot.id,
  name: slot.file?.name,
  size: slot.file?.size,
  source: slot.file?.source,
  path: slot.archivePath,
  sourceType: slot.sourceType
}));
const expectedTwoMetadata = [
  { id: 'A', name: 'tk0c.log', size: 1753170, source: 'Demo', path: 'CQWW/cw/2025/tk0c.log', sourceType: 'archive' },
  { id: 'B', name: 's53m.log', size: 641450, source: 'Archive', path: 'CQWW/cw/2025/s53m.log', sourceType: 'archive' }
];
const expectedFourMetadata = [
  ...expectedTwoMetadata,
  { id: 'C', name: 'E70T.log', size: 10265, source: 'Archive', path: 'TTC-SPCWC/2026-09-15/E70T.log', sourceType: 'archive' },
  { id: 'D', name: 'S53ZO.log', size: 5305, source: 'Archive', path: 'TTC-SPCWC/2026-09-15/S53ZO.log', sourceType: 'archive' }
];
add('Known two-log v2 fixture restores all exact slot metadata', knownTwo?.compareCount === 2 && JSON.stringify(slotMetadata(knownTwo)) === JSON.stringify(expectedTwoMetadata), slotMetadata(knownTwo));
add('Known mixed four-log v2 fixture restores all exact slot metadata', knownFour?.compareCount === 4 && JSON.stringify(slotMetadata(knownFour)) === JSON.stringify(expectedFourMetadata), slotMetadata(knownFour));

const legacyPayload = { version: 6, compareCount: 2, slots: [{ id: 'A', empty: true }, { id: 'B', empty: true }] };
const legacyState = base64UrlEncode(JSON.stringify(legacyPayload));
add('Legacy non-prefixed permalink remains readable', JSON.stringify(codec.parsePermalinkState(`?state=${legacyState}`)) === JSON.stringify(legacyPayload), legacyState);
add('Unknown future permalink prefix is rejected', codec.parsePermalinkState('?state=v99.AAAA') === null, null);

const positional = compactStateToPositional(codec.buildCompactSessionPayload(payload, false));
const positionalWithFutureFields = [...positional, 'future-field', 0, false];
const futureCompact = positionalToCompactState(positionalWithFutureFields);
add('Bounded unknown trailing positional fields are ignored', futureCompact?.c === 4 && futureCompact?.s?.length === 3, futureCompact);
const requiredOnlyCompact = positionalToCompactState([3]);
add('Missing trailing optional positional fields use existing defaults', requiredOnlyCompact?.v === 2 && Object.keys(requiredOnlyCompact).length === 1, requiredOnlyCompact);
add('Unsupported positional schema version is rejected', positionalToCompactState([99]) === null, null);

const byteFixture = new TextEncoder().encode('S53M · Živjo · 日本語');
const byteEncoded = bytesToBase64Url(byteFixture);
add('UTF-8 bytes survive unpadded Base64URL conversion', new TextDecoder().decode(base64UrlToBytes(byteEncoded)) === 'S53M · Živjo · 日本語', byteEncoded);
add('Corrupted Base64URL is rejected', decodeV3State('v3.not+base64') === null, null);
add('Corrupted raw DEFLATE is rejected', decodeV3State(`v3.${bytesToBase64Url(new Uint8Array([255, 255, 255]))}`) === null, null);
const compressFixture = (text) => `v3.${bytesToBase64Url(new Uint8Array(deflateRawSync(Buffer.from(text, 'utf8'))))}`;
const compressBytesFixture = (bytes) => `v3.${bytesToBase64Url(new Uint8Array(deflateRawSync(Buffer.from(bytes))))}`;
add('Valid DEFLATE containing invalid JSON is rejected', decodeV3State(compressFixture('not JSON')) === null, null);
add('Valid DEFLATE containing malformed UTF-8 is rejected', decodeV3State(compressBytesFixture([255, 254, 253])) === null, null);
add('Structurally invalid positional JSON is rejected', decodeV3State(compressFixture(JSON.stringify({ v: 3 }))) === null, null);
add('Wrong top-level field type is rejected', decodeV3State(compressFixture(JSON.stringify([3, ['dxer']]))) === null && decodeV3State(compressFixture(JSON.stringify([3, null, 'four']))) === null, null);
const overlongNestedTuple = JSON.parse(JSON.stringify(positional));
overlongNestedTuple[23][0].push('unsupported trailing slot value');
add('Unknown nested tuple fields are rejected', decodeV3State(compressFixture(JSON.stringify(overlongNestedTuple))) === null, null);
const prototypeState = decodeV3State(compressFixture('{"__proto__":{"polluted":true}}'));
add('Object/prototype-pollution payload is rejected', prototypeState === null && Object.prototype.polluted === undefined, prototypeState);
add('Oversized encoded v3 state is rejected', decodeV3State(`v3.${'A'.repeat(PERMALINK_V3_LIMITS.encodedChars + 1)}`) === null, null);
add('Oversized decompressed v3 state is rejected', decodeV3State(compressFixture(JSON.stringify([3, 'x'.repeat(PERMALINK_V3_LIMITS.decompressedBytes)]))) === null, null);
const maximumStringState = encodeV3State({ v: 2, l: { s: 'Ž'.repeat(PERMALINK_V3_LIMITS.stringLength) } });
add('Maximum-length valid Unicode string round trips', decodeV3State(maximumStringState)?.l?.s === 'Ž'.repeat(PERMALINK_V3_LIMITS.stringLength), maximumStringState.length);
add('Over-limit string is rejected', decodeV3State(compressFixture(JSON.stringify([3, 'x'.repeat(PERMALINK_V3_LIMITS.stringLength + 1)]))) === null, null);
add('Over-limit collection is rejected', decodeV3State(compressFixture(JSON.stringify([3, Array.from({ length: PERMALINK_V3_LIMITS.arrayLength + 1 }, (_, index) => index)]))) === null, null);
const localCompact = decodeV3State(encodeV3State({ v: 2, s: [{ i: 'A', n: 'upload.log', z: 0, o: 'Local', t: 'l' }] }));
const localRestored = codec.inflateCompactSessionPayload(localCompact);
add('Local upload metadata and zero-byte size round trip', localRestored?.slots?.[0]?.sourceType === 'local' && localRestored?.slots?.[0]?.file?.source === 'Local' && localRestored?.slots?.[0]?.file?.size === 0, localRestored?.slots?.[0]);
add('Duplicate slot IDs are rejected', decodeV3State(encodeV3State({ v: 2, s: [{ i: 'A' }, { i: 'A' }] })) === null, null);
let unknownCompactRejected = false;
try {
  encodeV3State({ v: 2, futureCriticalSetting: 'must not disappear' });
} catch (error) {
  unknownCompactRejected = true;
}
add('Unknown compact fields fail closed instead of disappearing from v3', unknownCompactRejected, null);
const nullableMultiplierCompact = decodeV3State(encodeV3State({ v: 2, mv: { mode: null, group: null } }));
add('Supported explicit-null multiplier values round trip', nullableMultiplierCompact?.mv?.mode === null && nullableMultiplierCompact?.mv?.group === null, nullableMultiplierCompact);
let unknownNestedMultiplierRejected = 0;
for (const candidate of [
  { v: 2, mv: { tradeoffBySlot: { E: { targetBand: '20M' } } } },
  { v: 2, mv: { tradeoffBySlot: { A: { scenarios: { future: { rate: 10 } } } } } }
]) {
  try {
    encodeV3State(candidate);
  } catch (error) {
    unknownNestedMultiplierRejected += 1;
  }
}
add('Unknown nested multiplier map keys fail closed', unknownNestedMultiplierRejected === 2, unknownNestedMultiplierRejected);
const rawExcluded = decodeV3State(encodeV3State({ v: 2, s: [{ i: 'A', x: 'RAW LOG', b: 'UkFX' }] }));
add('Explicit raw compact slot fields have no v3 positions', rawExcluded?.s?.[0]?.i === 'A' && !('x' in rawExcluded.s[0]) && !('b' in rawExcluded.s[0]), rawExcluded);

const deterministicA = encodeV3State(codec.buildCompactSessionPayload(payload, false));
const deterministicB = encodeV3State(codec.buildCompactSessionPayload(payload, false));
add('v3 encoding is deterministic', deterministicA === deterministicB, { length: deterministicA.length });
const minimalPayload = { ...codec.inflateCompactSessionPayload({ v: 2 }), globalBandFilter: 'x' };
const minimalState = codec.encodePermalinkState(minimalPayload);
add('Shortest-format selection retains v2 when v3 is not shorter', minimalState.startsWith('v2.'), minimalState);
const diagnostic = codec.getPermalinkDiagnostics(payload);
add('Permalink diagnostics report a meaningful v3 reduction', diagnostic.selectedEncoding === 'v3' && diagnostic.reductionPercent > 20 && diagnostic.v3StateLength < diagnostic.v2StateLength, diagnostic);

const permalink = codec.buildPermalink();
add('buildPermalink uses canonical public origin', permalink.startsWith('https://s53m.com/SH6/?state='), permalink);

const savedCurrent = perspectiveStore.saveCurrentComparePerspective();
add('Saved perspective retains multiplier settings', JSON.stringify(savedCurrent.multiplierOverview) === JSON.stringify(state.multiplierOverview), savedCurrent.multiplierOverview);
add('saveCurrentComparePerspective creates an entry', Boolean(savedCurrent?.id), savedCurrent);
add('Perspective storage persists current report id', savedCurrent?.reportId === 'points_by_minute', savedCurrent?.reportId);

const normalizedGenerated = perspectiveStore.normalizeGeneratedComparePerspective({
  label: 'Largest delta window',
  reportId: 'points_by_minute',
  compareTimeRangeLock: { startTs: 1700000100000, endTs: 1700000400000 }
});
add('normalizeGeneratedComparePerspective falls back to current score mode', normalizedGenerated?.compareScoreMode === 'logged', normalizedGenerated);

const bundle = perspectiveStore.saveComparePerspectiveBundle([
  { label: 'Window A', reportId: 'qs_by_minute' },
  { label: 'Window B', reportId: 'points_by_minute', compareScoreMode: 'claimed' }
]);
add('saveComparePerspectiveBundle stores multiple entries', Array.isArray(bundle) && bundle.length === 2, bundle);

const stored = perspectiveStore.loadStoredComparePerspectives();
add('Stored perspectives are readable after save', stored.length >= 3, stored.length);

const deleted = perspectiveStore.deleteStoredComparePerspective(savedCurrent?.id);
add('deleteStoredComparePerspective removes saved entry', deleted === true && !perspectiveStore.loadStoredComparePerspectives().some((item) => item.id === savedCurrent?.id), perspectiveStore.loadStoredComparePerspectives());
await new Promise((resolve) => setTimeout(resolve, 0));
add('Durable perspective persistence receives saved items', Array.isArray(durableSaved) && durableSaved.length >= 2, durableSaved.length);

const failed = checks.filter((check) => !check.passed);
console.log(JSON.stringify({
  passed: failed.length === 0,
  checks
}, null, 2));

if (failed.length) process.exit(1);
EOF
