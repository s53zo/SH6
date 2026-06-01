#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "${ROOT_DIR}"

node <<'EOF'
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const coreSource = fs.readFileSync(path.join(process.cwd(), 'modules/analysis/core.js'), 'utf8');
const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  Intl,
  Date,
  Math,
  JSON,
  Array,
  Object,
  Number,
  String,
  Boolean,
  RegExp,
  Map,
  Set,
  WeakMap,
  WeakSet,
  URL,
  URLSearchParams,
  TextEncoder,
  TextDecoder
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(coreSource, sandbox, { filename: 'core.js' });

const core = sandbox.SH6AnalysisCore;
if (!core || typeof core.buildDerived !== 'function') {
  throw new Error('Unable to load SH6AnalysisCore.buildDerived');
}

function makeQso(freq, minute, qsoNumber, band = '20M', mode = 'CW') {
  return {
    call: `TEST${String(qsoNumber).padStart(3, '0')}`,
    band,
    mode,
    freq,
    ts: Date.UTC(2024, 9, 26, 0, minute, 0),
    qsoNumber,
    raw: {}
  };
}

function classify(freqs) {
  const qsos = freqs.map((freq, idx) => makeQso(freq, idx, idx + 1));
  core.buildDerived(qsos, {});
  return qsos.map((q) => q.operatingStyleRole);
}

function derive(entries, resources = {}) {
  const qsos = entries.map((entry, idx) => makeQso(entry.freq, idx, idx + 1, entry.band || '20M', entry.mode || 'CW'));
  const derived = core.buildDerived(qsos, {}, resources);
  return { qsos, derived };
}

function assert(condition, message, payload) {
  if (condition) return;
  console.error('[operating-style-regression] FAIL');
  console.error(message);
  if (payload !== undefined) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

const noReturnRoles = classify([14.02, 14.02, 14.02, 14.02, 14.03]);
assert(
  noReturnRoles[4] === 'SEARCH',
  'Off-run QSO without a return to the run frequency must stay SEARCH, not INBAND.',
  { roles: noReturnRoles }
);

const inbandRoles = classify([14.02, 14.02, 14.02, 14.02, 14.03, 14.02, 14.02, 14.02, 14.02]);
assert(
  inbandRoles[4] === 'INBAND',
  'Off-run QSO bracketed by RUN QSOs should classify as INBAND.',
  { roles: inbandRoles }
);

const activeRunScenario = derive([
  ...new Array(4).fill(0).map(() => ({ band: '20M', freq: 14.02 })),
  { band: '20M', freq: 14.031 },
  { band: '20M', freq: 14.036 },
  { band: '20M', freq: 14.041 },
  { band: '15M', freq: 21.014 },
  { band: '15M', freq: 21.025 },
  ...new Array(4).fill(0).map(() => ({ band: '20M', freq: 14.02 }))
]);
assert(
  activeRunScenario.qsos.slice(4, 7).every((q) => q.operatingStyleRole === 'INBAND'),
  'S&P QSOs on the active RUN band should classify as INBAND.',
  { roles: activeRunScenario.qsos.map((q) => ({ band: q.band, freq: q.freq, role: q.operatingStyleRole })) }
);
assert(
  activeRunScenario.qsos.slice(7, 9).every((q) => q.operatingStyleRole === 'SEARCH'),
  'S&P QSOs away from the active RUN band should classify as off-band S&P.',
  { roles: activeRunScenario.qsos.map((q) => ({ band: q.band, freq: q.freq, role: q.operatingStyleRole })) }
);
assert(
  Math.round(activeRunScenario.derived.operatingStyle.totals.inbandPctOfSp) === 60
    && Math.round(activeRunScenario.derived.operatingStyle.totals.offbandSpPctOfSp) === 40,
  'S&P-denominator operating-style percentages should remain available for non-table consumers.',
  activeRunScenario.derived.operatingStyle.totals
);
assert(
  Math.round(activeRunScenario.derived.operatingStyle.totals.inbandPct) === 23
    && Math.round(activeRunScenario.derived.operatingStyle.totals.searchPct) === 15,
  'Visible table percentages use all classified QSOs as the denominator.',
  activeRunScenario.derived.operatingStyle.totals
);

const spotAnchorEntries = [
  { band: '20M', freq: 14.031 },
  { band: '20M', freq: 14.037 },
  { band: '15M', freq: 21.021 }
];
const spotAnchorTs = Date.UTC(2024, 9, 26, 0, 0, 0);
const fallbackNoAnchors = derive(spotAnchorEntries);
const fallbackEmptyAnchors = derive(spotAnchorEntries, { operatingStyleSpotAnchors: [] });
assert(
  JSON.stringify(fallbackNoAnchors.qsos.map((q) => q.operatingStyleRole)) === JSON.stringify(fallbackEmptyAnchors.qsos.map((q) => q.operatingStyleRole))
    && fallbackEmptyAnchors.derived.operatingStyle.meta.spotAnchoringUsed === false,
  'Empty spot anchor resources must preserve Cabrillo-only classification.',
  {
    without: fallbackNoAnchors.qsos.map((q) => q.operatingStyleRole),
    empty: fallbackEmptyAnchors.qsos.map((q) => q.operatingStyleRole),
    meta: fallbackEmptyAnchors.derived.operatingStyle.meta
  }
);

const rbnAnchored = derive(spotAnchorEntries, {
  operatingStyleSpotAnchors: [
    { direction: 'ofUs', source: 'rbn', ts: spotAnchorTs, band: '20M', freqMHz: 14.031, mode: 'CW' }
  ]
});
assert(
  rbnAnchored.qsos.every((q) => q.operatingStyleRole === 'SEARCH')
    && rbnAnchored.derived.operatingStyle.meta.spotAnchorCountsBySource.rbn === 0,
  'RBN CW spots must not create RUN anchors when Cabrillo clustering did not already infer RUN.',
  {
    roles: rbnAnchored.qsos.map((q) => ({ band: q.band, mode: q.mode, role: q.operatingStyleRole })),
    meta: rbnAnchored.derived.operatingStyle.meta
  }
);

const rbnMicroLocal = derive([
  { band: '20M', freq: 14.031 },
  { band: '20M', freq: 14.032 },
  { band: '15M', freq: 21.021 }
], {
  operatingStyleSpotAnchors: [
    { direction: 'ofUs', source: 'rbn', ts: spotAnchorTs, band: '20M', freqMHz: 14.0315, mode: 'CW', spotter: 'K1ABC' }
  ]
});
assert(
  rbnMicroLocal.qsos.slice(0, 2).every((q) => q.operatingStyleRole === 'INBAND')
    && rbnMicroLocal.qsos[2].operatingStyleRole === 'SEARCH'
    && rbnMicroLocal.derived.operatingStyle.meta.spotAnchorCountsBySource.rbnMicro === 1,
  'A single RBN spot may bridge a local same-frequency CW micro-RUN without changing another band.',
  {
    roles: rbnMicroLocal.qsos.map((q) => ({ band: q.band, mode: q.mode, role: q.operatingStyleRole })),
    meta: rbnMicroLocal.derived.operatingStyle.meta
  }
);

const rbnMicroSpotterCluster = derive([
  { band: '20M', freq: 14.031 },
  { band: '15M', freq: 21.021 }
], {
  operatingStyleSpotAnchors: [
    { direction: 'ofUs', source: 'rbn', ts: spotAnchorTs, band: '20M', freqMHz: 14.031, mode: 'CW', spotter: 'K1AAA' },
    { direction: 'ofUs', source: 'rbn', ts: spotAnchorTs + 30000, band: '20M', freqMHz: 14.0312, mode: 'CW', spotter: 'K1BBB' },
    { direction: 'ofUs', source: 'rbn', ts: spotAnchorTs + 60000, band: '20M', freqMHz: 14.0309, mode: 'CW', spotter: 'K1CCC' }
  ]
});
assert(
  rbnMicroSpotterCluster.qsos[0].operatingStyleRole === 'INBAND'
    && rbnMicroSpotterCluster.qsos[1].operatingStyleRole === 'SEARCH'
    && rbnMicroSpotterCluster.derived.operatingStyle.meta.spotAnchorCountsBySource.rbnMicro === 1,
  'Multiple independent RBN spotters can bridge a one-QSO CW micro-RUN island.',
  {
    roles: rbnMicroSpotterCluster.qsos.map((q) => ({ band: q.band, mode: q.mode, role: q.operatingStyleRole })),
    meta: rbnMicroSpotterCluster.derived.operatingStyle.meta
  }
);

const rbnCorroboratesRun = derive([
  ...new Array(4).fill(0).map(() => ({ band: '20M', freq: 14.02 })),
  { band: '20M', freq: 14.031 },
  { band: '15M', freq: 21.021 }
], {
  operatingStyleSpotAnchors: [
    { direction: 'ofUs', source: 'rbn', ts: spotAnchorTs + (3 * 60 * 1000), band: '20M', freqMHz: 14.02, mode: 'CW' }
  ]
});
assert(
  rbnCorroboratesRun.qsos[4].operatingStyleRole === 'INBAND'
    && rbnCorroboratesRun.qsos[5].operatingStyleRole === 'SEARCH'
    && rbnCorroboratesRun.derived.operatingStyle.meta.spotAnchorCountsBySource.rbn === 1,
  'RBN CW spots should extend active RUN intervals only when they corroborate a Cabrillo-inferred RUN QSO.',
  {
    roles: rbnCorroboratesRun.qsos.map((q) => ({ band: q.band, mode: q.mode, role: q.operatingStyleRole })),
    meta: rbnCorroboratesRun.derived.operatingStyle.meta
  }
);

const rbnPhoneIgnored = derive([
  { band: '20M', freq: 14.031, mode: 'SSB' },
  { band: '20M', freq: 14.037, mode: 'SSB' }
], {
  operatingStyleSpotAnchors: [
    { direction: 'ofUs', source: 'rbn', ts: spotAnchorTs, band: '20M', freqMHz: 14.031, mode: 'CW' }
  ]
});
assert(
  rbnPhoneIgnored.qsos.every((q) => q.operatingStyleRole === 'SEARCH')
    && rbnPhoneIgnored.derived.operatingStyle.meta.spotAnchorCount === 0,
  'RBN anchors must not affect non-CW operating-style intervals.',
  {
    roles: rbnPhoneIgnored.qsos.map((q) => ({ mode: q.mode, role: q.operatingStyleRole })),
    meta: rbnPhoneIgnored.derived.operatingStyle.meta
  }
);

const classicSpotAnchored = derive([
  { band: '20M', freq: 14.031, mode: 'SSB' },
  { band: '15M', freq: 21.021, mode: 'SSB' }
], {
  operatingStyleSpotAnchors: [
    { direction: 'ofUs', source: 'spots', ts: spotAnchorTs, band: '20M', freqMHz: 14.031 }
  ]
});
assert(
  classicSpotAnchored.qsos[0].operatingStyleRole === 'INBAND'
    && classicSpotAnchored.qsos[1].operatingStyleRole === 'SEARCH'
    && classicSpotAnchored.derived.operatingStyle.meta.spotAnchorCountsBySource.spots === 1,
  'Classic spots of us should add all-mode RUN anchors with lower-confidence source metadata.',
  {
    roles: classicSpotAnchored.qsos.map((q) => ({ band: q.band, mode: q.mode, role: q.operatingStyleRole })),
    meta: classicSpotAnchored.derived.operatingStyle.meta
  }
);

const byUsIgnored = derive(spotAnchorEntries, {
  operatingStyleSpotAnchors: [
    { direction: 'byUs', source: 'spots', ts: spotAnchorTs, band: '20M', freqMHz: 14.031 }
  ]
});
assert(
  byUsIgnored.qsos.every((q) => q.operatingStyleRole === 'SEARCH')
    && byUsIgnored.derived.operatingStyle.meta.spotAnchorCount === 0,
  'Spots made by us must not become RUN anchors.',
  {
    roles: byUsIgnored.qsos.map((q) => q.operatingStyleRole),
    meta: byUsIgnored.derived.operatingStyle.meta
  }
);

const distantSpotIgnored = derive(spotAnchorEntries, {
  operatingStyleSpotAnchors: [
    { direction: 'ofUs', source: 'spots', ts: spotAnchorTs + (60 * 60 * 1000), band: '20M', freqMHz: 14.031 }
  ]
});
assert(
  distantSpotIgnored.qsos.every((q) => q.operatingStyleRole === 'SEARCH')
    && distantSpotIgnored.derived.operatingStyle.meta.spotAnchorCount === 0,
  'Spot anchors too far away from logged QSOs must not create active RUN intervals.',
  {
    roles: distantSpotIgnored.qsos.map((q) => q.operatingStyleRole),
    meta: distantSpotIgnored.derived.operatingStyle.meta
  }
);

const emptySpotState = derive(spotAnchorEntries, { operatingStyleSpotAnchors: null });
assert(
  emptySpotState.qsos.every((q) => q.operatingStyleRole === 'SEARCH'),
  'Unavailable spot anchor resources must not throw or change fallback classification.',
  { roles: emptySpotState.qsos.map((q) => q.operatingStyleRole) }
);

const qsyRunRoles = classify([
  ...new Array(30).fill(14.025),
  ...new Array(5).fill(14.035)
]);
assert(
  qsyRunRoles.slice(-5).every((role) => role === 'RUN'),
  'Sustained late frequency change should classify as a new RUN, not INBAND.',
  { lastRoles: qsyRunRoles.slice(-5) }
);

console.log('[operating-style-regression] PASS');
EOF
