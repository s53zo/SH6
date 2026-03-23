#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "${ROOT_DIR}"

node --input-type=module <<'EOF'
import { createSessionCodec } from './modules/session/codec.js';
import { createComparePerspectiveStore } from './modules/session/perspectives.js';

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
  analysisMode: 'dxer',
  compareCount: 4,
  compareScoreMode: 'logged',
  compareSyncEnabled: false,
  compareStickyEnabled: true,
  compareTimeRangeLock: { startTs: 1700000000000, endTs: 1700003600000 },
  compareFocus: cloneCompareFocus({
    ...DEFAULT_COMPARE_FOCUS,
    countries_by_month: ['A', 'C'],
    points_by_minute: ['A', 'D']
  }),
  globalBandFilter: '20M',
  breakThreshold: 20,
  passedQsoWindow: 12,
  globalYearsFilter: [2025],
  globalMonthsFilter: [11],
  logPageSize: 250,
  logPage: 2,
  compareLogWindowStart: 50,
  compareLogWindowSize: 500,
  logSearch: 'S53',
  logFieldFilter: '599',
  logBandFilter: '20M',
  logModeFilter: 'CW',
  logOpFilter: 'S53ZO',
  logCallLenFilter: 5,
  logCallStructFilter: 'LLNLL',
  logCountryFilter: 'Slovenia',
  logContinentFilter: 'EU',
  logCqFilter: '15',
  logItuFilter: '28',
  logRange: { start: 10, end: 99 },
  logTimeRange: { startTs: 1700000000000, endTs: 1700001800000 },
  logHeadingRange: { start: 90, end: 180 },
  logStationQsoRange: { min: 1, max: 10 },
  logDistanceRange: { start: 100, end: 2000 }
};

const slotMap = new Map([
  ['A', {
    qsoData: { qsos: [1, 2] },
    logFile: { name: 'S55OO.log', size: 14535, source: 'Archive', path: 'ZRS_KVP/2025/jesen/S55OO.log' },
    rawLogText: 'RAW-A',
    skipped: false,
    spotsState: { windowMinutes: 20, bandFilter: ['20M'] },
    rbnState: { windowMinutes: 30, bandFilter: ['20M'], selectedDays: ['20251116'] }
  }],
  ['B', {
    qsoData: { qsos: [1] },
    logFile: { name: 'S53M.log', size: 15573, source: 'Archive', path: 'ZRS_KVP/2025/jesen/S53M.log' },
    rawLogText: '',
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
  appVersion: '6.2.20',
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
add('Session payload stores analysisMode', payload.analysisMode === 'dxer', payload.analysisMode);
add('Session payload includes raw slot text when requested', payload.slots[0].rawText === 'RAW-A', payload.slots[0].rawText);

const compact = codec.buildCompactSessionPayload(payload, true);
add('Compact payload saves analysisMode', compact.am === 'dxer', compact);
add('Compact payload keeps compare focus overrides', Array.isArray(compact.f?.r) && compact.f.r[1] === 'C', compact.f);

const encoded = codec.encodePermalinkState(payload);
add('Permalink encoding prefers compact v2 prefix', encoded.startsWith('v2.'), encoded.slice(0, 8));

const parsed = codec.parsePermalinkState(`?state=${encoded}`);
add('Permalink parse restores analysisMode', parsed?.analysisMode === 'dxer', parsed?.analysisMode);
add('Permalink parse restores compare count', parsed?.compareCount === 4, parsed?.compareCount);
add('Permalink parse restores slot archive path', parsed?.slots?.[0]?.archivePath === 'ZRS_KVP/2025/jesen/S55OO.log', parsed?.slots?.[0]);
add('Permalink parse restores skipped compact slot', parsed?.slots?.[2]?.skipped === true, parsed?.slots?.[2]);

const permalink = codec.buildPermalink();
add('buildPermalink uses canonical public origin', permalink.startsWith('https://s53m.com/SH6/?state='), permalink);

const savedCurrent = perspectiveStore.saveCurrentComparePerspective();
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
