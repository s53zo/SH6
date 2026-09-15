import assert from 'node:assert/strict';
import { overviewChart, renderMultiplierOverview } from '../modules/multipliers/overview-view.js';
import { buildMultiplierOverviewSource, selectMultiplierOverview } from '../modules/multipliers/overview-model.js';
import { normalizeMultiplierSettings } from '../modules/multipliers/settings.js';

const start = Date.UTC(2026, 6, 11, 12);
const points = [0, 1, 2, 3].map((i) => ({ ts: start + (i + 1) * 1800000, start: start + i * 1800000, end: start + (i + 1) * 1800000, value: i * 10 }));
const bars = overviewChart([{ label: 'Credits/hour', points }], 'Rate');
assert.equal((bars.match(/class="multiplier-bar"/g) || []).length, 4);
assert.ok(bars.includes('width="180"'), '30-minute bar is one quarter of two-hour axis');
const zoom = overviewChart([{ label: 'Credits/hour', points }], 'Rate', {}, { xZoom: 2, xPosition: 100, yScale: 0.5 });
assert.equal((zoom.match(/class="multiplier-bar"/g) || []).length, 4, 'retired X settings cannot crop the time range');
assert.ok(zoom.includes('width="180"'));
assert.ok(zoom.includes('above displayed Y maximum'));
assert.ok(!zoom.includes('NaN'));
assert.deepEqual(normalizeMultiplierSettings({ xZoom: 2, xPosition: 0, yScale: 0.5 }), { yScale: 0.5 });
assert.deepEqual(normalizeMultiplierSettings({ xZoom: 0, xPosition: 101, yScale: -1 }), {});
function slot(id, minutes) {
  const qsos = minutes.map((minute) => ({ ts: start + minute * 60000, band: '20M', mode: 'CW' }));
  const scoring = { ruleId: 'fixture', multiplierModelSupported: true, computedPointsByIndex: qsos.map(() => 2), multiplierPerspective: { compatibilityKey: 'fixture' },
    multiplierCredits: qsos.map((qso, qsoIndex) => ({ qsoIndex, group: 'country', countingScope: 'per_band', scopeKey: '20M', entityKey: String(qsoIndex), rawCredit: 1, weightedCredit: 1, weight: 1 })) };
  return { id, label: id, selection: selectMultiplierOverview(buildMultiplierOverviewSource(qsos, scoring)) };
}
const slots = [slot('A', [0, 20]), slot('B', [20, 100])];
for (const view of ['hourly', 'rate', 'cumulative']) {
  const html = renderMultiplierOverview(slots, { view, windowMinutes: 30 });
  const axes = [...html.matchAll(/<text x="55" y="202">([^<]+).*?<text x="775" y="218" text-anchor="end">([^<]+)/g)].map((match) => match.slice(1));
  assert.equal(axes.length, view === 'rate' ? 6 : 2);
  assert.ok(axes.every((axis) => JSON.stringify(axis) === JSON.stringify(axes[0])), `${view}: compatible logs share the full UTC bar extent`);
  if (view === 'rate') {
    for (const match of html.matchAll(/class="multiplier-bar" data-start="(\d+)" data-end="(\d+)"/g)) assert.equal(Number(match[2]) - Number(match[1]), 1800000, 'shared bounds preserve full rolling-window bars');
  }
}
console.log('Multiplier bar geometry, shared UTC axes and persistence: PASS');
