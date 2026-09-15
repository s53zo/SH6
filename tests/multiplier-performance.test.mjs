import assert from 'node:assert/strict';
import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { buildMultiplierOverviewSource, selectMultiplierOverview, multiplierCumulative } from '../modules/multipliers/overview-model.js';
import { renderMultiplierOverview, renderMultiplierOverviewPanel, multiplierOverviewCsv, sampleMultiplierChart } from '../modules/multipliers/overview-view.js';
import { multiplierHistory } from '../modules/multipliers/tradeoff-model.js';

const spec = JSON.parse(fs.readFileSync(new URL('../data/contest_scoring_spec.json', import.meta.url)));
const rule = spec.rule_sets.find((item) => item.id === 'cqwpx');
const start = Date.UTC(2026, 4, 30);
function makeSource(count, creditEvery = 10) {
  const qsos = Array.from({ length: count }, (_, index) => ({ ts: start + Math.floor(index * 172800000 / count), call: `TEST${index}`, qsoNumber: index + 1, band: ['80M', '40M', '20M', '15M', '10M'][index % 5], mode: 'CW', txId: String(index % 2), operatingStyleRole: index % 3 ? 'RUN' : 'SEARCH' }));
  const credits = qsos.flatMap((qso, index) => index % creditEvery ? [] : [{ qsoIndex: index, group: 'wpx_prefix', countingScope: 'once_total', scopeKey: 'ALL', entityKey: `PREFIX${index}`, timestamp: qso.ts, band: qso.band, mode: qso.mode, rawCredit: 1, weight: 1, weightedCredit: 1 }]);
  return buildMultiplierOverviewSource(qsos, { ruleId: 'cqwpx', multiplierModelSupported: true, multiplierCredits: credits, computedPointsByIndex: qsos.map(() => 3), computedScore: count * 3 * credits.length,
    multiplierPerspective: { groups: ['wpx_prefix'], countingScope: 'once_total', compatibilityKey: 'cqwpx|once_total|common' },
    analyticalMetadata: { rule, contributions: qsos.map((qso) => ({ band: qso.band, mode: qso.mode, qsoCount: 1 })),
      targetDescriptors: { groups: [{ id: 'wpx_prefix', capacity: null }], bands: ['80M', '40M', '20M', '15M', '10M'], modes: ['CW'], countingScope: 'once_total', limitation: 'Synthetic performance fixture' } }
  }, { stationCallsign: 'PERF' });
}
const measurements = {};
let at = performance.now();
const slots = ['A', 'B', 'C', 'D'].map((id) => ({ id, label: `Log ${id}`, selection: selectMultiplierOverview(makeSource(20000)) }));
measurements.buildFour20kMs = Math.round(performance.now() - at);
for (const view of ['hourly', 'rate', 'cumulative', 'breakdown', 'timeline', 'efficiency', 'tradeoff', 'undated']) {
  at = performance.now();
  const html = renderMultiplierOverview(slots, { view });
  measurements[view] = { ms: Math.round(performance.now() - at), bytes: Buffer.byteLength(html) };
  assert.equal((html.match(/class="multiplier-overview-panel"/g) || []).length, 4);
  assert.ok((html.match(/class="multiplier-qso-link"/g) || []).length <= 800, 'four timeline panels render at most 200 source buttons each');
  assert.ok(html.length < 3000000, 'interactive four-log DOM remains bounded');
}
const history = multiplierHistory(slots[0].selection.source);
assert.equal(history.supported, true);
assert.equal(multiplierHistory(slots[0].selection.source), history, 'score history cache reuses the same replay');
at = performance.now();
const stress = selectMultiplierOverview(makeSource(100000, 1));
const full = multiplierCumulative(stress).map((row) => ({ ts: row.ts, value: row.raw }));
const sampled = sampleMultiplierChart(full);
assert.ok(sampled.length <= 1600);
assert.equal(sampled[0], full[0]);
assert.equal(sampled.at(-1), full.at(-1));
const spike = Array.from({ length: 10000 }, (_, index) => ({ ts: index, value: index === 1234 ? 999 : index === 7890 ? -999 : 0 }));
assert.ok(sampleMultiplierChart(spike).some((row) => row.value === 999));
assert.ok(sampleMultiplierChart(spike).some((row) => row.value === -999));
const denseHtml = renderMultiplierOverviewPanel(stress, { view: 'cumulative' });
assert.ok(denseHtml.length < 200000, '100,000-credit cumulative chart has bounded path and table');
assert.ok(denseHtml.includes('Dense bars are sampled'));
const csv = multiplierOverviewCsv(stress, 'cumulative');
assert.equal(csv.split('\r\n').length, full.length + 2, 'CSV preserves every exact cumulative row');
measurements.stress100k = { ms: Math.round(performance.now() - at), htmlBytes: Buffer.byteLength(denseHtml), csvBytes: Buffer.byteLength(csv), exactRows: full.length, chartPoints: sampled.length };
console.log(JSON.stringify({ passed: true, measurements }, null, 2));
