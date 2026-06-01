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

function makeQso(freq, minute, qsoNumber, band = '20M') {
  return {
    call: `TEST${String(qsoNumber).padStart(3, '0')}`,
    band,
    mode: 'CW',
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

function derive(entries) {
  const qsos = entries.map((entry, idx) => makeQso(entry.freq, idx, idx + 1, entry.band || '20M'));
  const derived = core.buildDerived(qsos, {});
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
  'INBAND and off-band percentages must be computed over S&P QSOs.',
  activeRunScenario.derived.operatingStyle.totals
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
