#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const rootDir = path.resolve(__dirname, '..');
require(path.join(rootDir, 'modules/analysis/core.js'));
require(path.join(rootDir, 'modules/compare/compare-core.js'));

const core = globalThis.SH6AnalysisCore;
const compareCore = globalThis.SH6CompareCore;
const calls = [
  'K1ABC', 'DL1AAA', 'JA1XYZ', 'PY2ZZ', 'VK3AA', 'ZS1TEST', 'G4AAA',
  'F5XYZ', 'I2ABC', 'VE3XYZ', 'W6AA', 'OH2BH', '9A1A', 'S51A',
  'EA8ABC', 'LU1DZ', 'YB1AAA', 'HS0ZAA', 'A45XR', '3B8CF'
];
const frequencies = [1832, 3525, 7025, 14025, 21025, 28025];

function parseArgs(argv) {
  const options = { realLog: process.env.SH6_PERF_REAL_LOG || '' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--real-log') options.realLog = argv[index += 1] || '';
    else if (arg.startsWith('--real-log=')) options.realLog = arg.slice('--real-log='.length);
  }
  return options;
}

function makeUniqueCall(index) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let value = index;
  const suffix = new Array(3).fill('A').map(() => {
    const letter = alphabet[value % alphabet.length];
    value = Math.floor(value / alphabet.length);
    return letter;
  }).reverse().join('');
  return `K${(Math.floor(index / (alphabet.length ** 3)) % 9) + 1}${suffix}`;
}

function makeLog(count, dayOffset = 0, options = {}) {
  const lines = [
    'START-OF-LOG: 3.0',
    'CALLSIGN: S53M',
    'CONTEST: CQ-WW-CW',
    'CATEGORY-OPERATOR: SINGLE-OP',
    'CATEGORY-TRANSMITTER: ONE',
    'CLAIMED-SCORE: 123456'
  ];
  const start = Date.UTC(2025, 10, 29 + dayOffset, 0, 0, 0);
  for (let index = 0; index < count; index += 1) {
    const date = new Date(start + (index * 31000));
    const dateText = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
    const timeText = `${String(date.getUTCHours()).padStart(2, '0')}${String(date.getUTCMinutes()).padStart(2, '0')}`;
    const call = options.highCardinality
      ? makeUniqueCall(index)
      : calls[index % calls.length].replace(/.$/, String(index % 10));
    const frequency = frequencies[index % frequencies.length] + (index % 15);
    lines.push(`QSO: ${String(frequency).padStart(5)} CW ${dateText} ${timeText} S53M 599 15 ${call} 599 ${String((index % 40) + 1).padStart(2, '0')}`);
  }
  lines.push('END-OF-LOG:');
  return lines.join('\n');
}

function round(value) {
  return Math.round(Number(value) * 100) / 100;
}

function median(values) {
  const ordered = values.slice().sort((left, right) => left - right);
  return ordered[Math.floor(ordered.length / 2)];
}

function measure(fn, iterations) {
  const timings = [];
  let value;
  for (let index = 0; index < iterations; index += 1) {
    const startedAt = performance.now();
    value = fn();
    timings.push(performance.now() - startedAt);
  }
  return {
    value,
    timing: {
      medianMs: round(median(timings)),
      minMs: round(Math.min(...timings)),
      maxMs: round(Math.max(...timings))
    }
  };
}

function measureTiming(fn, iterations) {
  return measure(fn, iterations).timing;
}

function buildCompareLog(qsos) {
  return (qsos || []).map((q, index) => ({
    i: index,
    call: q.call || '',
    grid: q.grid || '',
    band: q.band || '',
    mode: q.mode || '',
    op: q.op || '',
    country: q.country || '',
    continent: q.continent || '',
    cqZone: q.cqZone,
    ituZone: q.ituZone,
    qsoNumber: q.qsoNumber,
    ts: q.ts,
    bearing: q.bearing,
    distance: q.distance,
    callCount: q.callCount,
    isDupe: Boolean(q.isDupe),
    operatingStyleRole: q.operatingStyleRole || '',
    operatingStyleBand: q.operatingStyleBand || q.band || ''
  }));
}

const options = parseArgs(process.argv.slice(2));
const resourceStartedAt = performance.now();
const resources = {
  ctyTable: core.parseCtyDat(fs.readFileSync(path.join(rootDir, 'cty.dat'), 'utf8')),
  masterCalls: Array.from(core.parseMasterDta(fs.readFileSync(path.join(rootDir, 'MASTER.DTA'), 'utf8'))),
  scoringSpec: JSON.parse(fs.readFileSync(path.join(rootDir, 'data/contest_scoring_spec.json'), 'utf8')),
  scoringStatus: 'ok',
  scoringSource: 'benchmark',
  analysisMode: 'contester',
  callsignGridEntries: []
};

const output = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  platform: `${process.platform}-${process.arch}`,
  methodology: {
    nodeTiming: 'Repeated operations in one warm Node.js process; reported timing objects are medians.',
    coldStart: 'Not measured by this script. Use run-browser-performance-benchmark.sh in a fresh browser session for startup timing.',
    cacheState: 'Shared immutable resource indexes may be warm after their first use; do not label derive/analyze medians as cold-cache timings.'
  },
  resourceParseMs: round(performance.now() - resourceStartedAt),
  resourceCounts: {
    cty: resources.ctyTable.length,
    master: resources.masterCalls.length
  },
  workerResourceConfigureClone: measureTiming(
    () => structuredClone({ type: 'configureAnalysis', analysis: resources }),
    5
  ),
  synthetic: {},
  syntheticHighCardinality: {},
  fourLog: {}
};

for (const count of [100, 2000, 20000]) {
  const text = makeLog(count);
  const iterations = count >= 20000 ? 3 : 5;
  const parsed = measure(() => core.parseLogFile(text, `synthetic-${count}.log`), iterations);
  const derived = measure(() => core.deriveLog(parsed.value, {}, resources), iterations);
  const analyzed = measure(() => core.analyzeLogText(text, `synthetic-${count}.log`, {}, resources), iterations);
  output.synthetic[count] = {
    bytes: Buffer.byteLength(text),
    qsos: parsed.value.qsos.length,
    parse: parsed.timing,
    derive: derived.timing,
    analyze: analyzed.timing
  };
}

for (const count of [2000, 20000]) {
  const text = makeLog(count, 0, { highCardinality: true });
  const iterations = count >= 20000 ? 3 : 5;
  const parsed = core.parseLogFile(text, `synthetic-unique-${count}.log`);
  const derived = measure(() => core.deriveLog(parsed, {}, resources), iterations);
  output.syntheticHighCardinality[count] = {
    bytes: Buffer.byteLength(text),
    qsos: parsed.qsos.length,
    uniqueCalls: new Set(parsed.qsos.map((qso) => qso.call)).size,
    derive: derived.timing
  };
}

for (const count of [2000, 20000]) {
  const slots = [0, 1, 2, 3].map((dayOffset) => ({
    slotId: 'ABCD'[dayOffset],
    qsoData: core.parseLogFile(makeLog(count, dayOffset), `synthetic-${count}-${dayOffset}.log`),
    context: {}
  }));
  const iterations = count >= 20000 ? 3 : 5;
  const legacyCombinedClone = measureTiming(
    () => structuredClone({ type: 'deriveSlots', slots, analysis: resources }),
    iterations
  );
  const cachedTaskClone = measureTiming(
    () => structuredClone({ type: 'deriveSlots', slots }),
    iterations
  );
  const derive = measure(() => slots.map((entry) => core.deriveLog(entry.qsoData, entry.context, resources)), iterations);
  const projection = measure(
    () => slots.map((entry) => buildCompareLog(entry.qsoData.qsos)),
    iterations
  );
  const compareLogs = projection.value;
  const legacyCompareTransfer = measureTiming(
    () => structuredClone({ type: 'compareBuckets', logs: compareLogs, filters: {} }),
    iterations
  );
  const residentCompareTransfer = measureTiming(
    () => structuredClone({
      type: 'compareBuckets',
      slotIds: ['A', 'B', 'C', 'D'],
      loadedSlotIds: ['A', 'B', 'C', 'D'],
      filters: {}
    }),
    iterations
  );
  const compareBuckets = measure(
    () => compareCore.buildCompareBucketPayload(compareLogs, {}),
    iterations
  );
  output.fourLog[count] = {
    totalQsos: count * slots.length,
    legacyCombinedPayloadClone: legacyCombinedClone,
    cachedTaskPayloadClone: cachedTaskClone,
    derive: derive.timing,
    compareProjection: projection.timing,
    legacyCompareTransfer,
    residentCompareFilterTransfer: residentCompareTransfer,
    compareBuckets: compareBuckets.timing,
    compareRows: compareBuckets.value.totalRows
  };
}

if (options.realLog) {
  const realPath = path.resolve(options.realLog);
  const text = fs.readFileSync(realPath, 'utf8');
  let startedAt = performance.now();
  const qsoData = core.parseLogFile(text, realPath);
  const parseMs = performance.now() - startedAt;
  startedAt = performance.now();
  core.deriveLog(qsoData, {}, resources);
  const deriveMs = performance.now() - startedAt;
  startedAt = performance.now();
  const compareLog = buildCompareLog(qsoData.qsos);
  const compareProjectionMs = performance.now() - startedAt;
  startedAt = performance.now();
  const compareData = compareCore.buildCompareBucketPayload([compareLog], {});
  const compareBucketsMs = performance.now() - startedAt;
  startedAt = performance.now();
  const fourCopyCompareData = compareCore.buildCompareBucketPayload(
    [compareLog, compareLog, compareLog, compareLog],
    {}
  );
  const fourCopyCompareBucketsMs = performance.now() - startedAt;
  output.realLog = {
    basename: path.basename(realPath),
    bytes: Buffer.byteLength(text),
    qsos: qsoData.qsos.length,
    parseMs: round(parseMs),
    deriveMs: round(deriveMs),
    compareProjectionMs: round(compareProjectionMs),
    compareBucketsMs: round(compareBucketsMs),
    compareRows: compareData.totalRows,
    fourCopyCompareBucketsMs: round(fourCopyCompareBucketsMs),
    fourCopyCompareCounts: fourCopyCompareData.counts
  };
}

{
  const scaleGuardLogs = [0, 1, 2, 3].map((slotIndex) => {
    const start = Date.UTC(2025, 0, 4, 23, 50) + (slotIndex * 1000);
    return Array.from({ length: 40000 }, (_, index) => ({
      i: index,
      call: makeUniqueCall(index),
      band: '20M',
      mode: 'CW',
      qsoNumber: index + 1,
      ts: start + (index * 60000)
    }));
  });
  const scaleGuard = measure(() => compareCore.buildCompareBucketPayload(scaleGuardLogs, {}), 1);
  const expectedFirstKey = '6-143';
  if (scaleGuard.value.counts.some((count) => count !== 40000)
    || scaleGuard.value.buckets[0]?.key !== expectedFirstKey) {
    throw new Error('160,000-QSO comparison scale guard failed.');
  }
  output.comparisonScaleGuard = {
    totalQsos: 160000,
    durationMs: scaleGuard.timing.medianMs,
    counts: scaleGuard.value.counts,
    firstBucketKey: scaleGuard.value.buckets[0]?.key || ''
  };
}

console.log(JSON.stringify(output, null, 2));
