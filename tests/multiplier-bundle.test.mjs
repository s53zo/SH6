import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { buildMultiplierOverviewSource, multiplierCompatibility } from '../modules/multipliers/overview-model.js';
import { buildScoreHistory, scoreStateAt, multiplierMarginal, emptyScoreState } from '../modules/multipliers/score-adapter.js';

createRequire(import.meta.url)('../modules/analysis/core.js');
const core = globalThis.SH6AnalysisCore;
const baselineContext = vm.createContext({ console });
// Pin the pre-6.3.30 scorer so committing this test cannot move its baseline.
vm.runInContext(execFileSync('git', ['show', '1537003:modules/analysis/core.js'], { encoding: 'utf8' }), baselineContext);
const baseline = baselineContext.SH6AnalysisCore;
const spec = JSON.parse(fs.readFileSync(new URL('../data/contest_scoring_spec.json', import.meta.url)));
const ctyText = fs.readFileSync(new URL('../cty.dat', import.meta.url), 'utf8');
const fixture = fs.readFileSync(new URL('./fixtures/radio-m2.log', import.meta.url), 'utf8');
const resources = { scoringSpec: spec, ctyTable: core.parseCtyDat(ctyText), masterCalls: [] };
const oldResources = { scoringSpec: spec, ctyTable: baseline.parseCtyDat(ctyText), masterCalls: [] };
const variants = spec.rule_sets.find((r) => r.id === 'arrl_family_bundle').subevents.map((sub) => ({ folder: 'ARRL', name: sub.slug_patterns[0], id: sub.id }));
variants.push(...[['IARU VHF', 'distance_only'], ['ALPE ADRIA', 'distance_times_multipliers'], ['MICROWAVE', 'band_weighted_distance']].map(([name, id]) => ({ folder: 'EU_VHF_CONTESTS', name, id })));
const sources = [];
for (const variant of variants) {
  const text = fixture.replace('CONTEST: IARU-HF', `CONTEST: ${variant.name}`).replaceAll('TEST1', 'S50A')
    .replace('END-OF-LOG:', 'QSO: 14047 CW 2026-07-11 1202 S50A 599 27 HB2T 599 28 0\nQSO: 28047 CW 2026-07-11 1203 S50A 599 27 HB2T 599 28 1\nEND-OF-LOG:');
  const run = (engine, env) => {
    const parsed = engine.parseLogFile(text, 'bundle.log');
    // Explicit distance/grid inputs exercise the VHF models as well as HF entities.
    parsed.qsos.forEach((q, index) => { q.distance = 100 + index * 50; q.grid = index < 2 ? 'JN76' : 'JN86'; });
    const context = { logFile: { name: 'bundle.log', path: `${variant.folder}/${variant.name}/bundle.log` }, events: parsed.events, qtcs: parsed.qtcs };
    const derived = engine.buildDerived(parsed.qsos, context, env);
    return { parsed, context, derived };
  };
  const { parsed, context, derived } = run(core, resources);
  const original = run(baseline, oldResources).derived.scoring;
  const scoring = derived.scoring;
  assert.equal(scoring.bundle?.subeventId || scoring.bundle?.subeventModelId, variant.id);
  assert.equal(scoring.computedScore, original.computedScore, `${variant.id}: original final score preserved`);
  assert.equal(scoring.computedMultiplierTotal, original.computedMultiplierTotal, `${variant.id}: original multiplier count preserved`);
  assert.equal(JSON.stringify(scoring.computedPointsByIndex), JSON.stringify(original.computedPointsByIndex), `${variant.id}: original per-event points preserved`);
  const source = buildMultiplierOverviewSource(parsed.qsos, scoring, derived.contestMeta, parsed.events);
  const history = buildScoreHistory(source);
  assert.equal(history.supported, true, `${variant.id}: ${history.reason}`);
  if (variant.id === 'arrl_10ghz_up') assert.equal(history.finalState.uniqueCallBonus, 300, 'unique-call bonus is attributed once even when a call returns on another band');
  if (variant.id === 'arrl_10m') assert.ok(source.events.some((event) => event.credits.length > 1), 'mixed bundle can award multiple distinct entities on one QSO');
  for (const ts of new Set(parsed.events.map((q) => q.ts))) {
    const prefix = parsed.events.filter((q) => q.ts <= ts);
    const rescored = core.computeContestScoringSummary(prefix, derived.contestMeta, context, resources);
    assert.equal(history.adapter.score(scoreStateAt(source, history.adapter, ts)), rescored.computedScore, `${variant.id}: exact prefix`);
  }
  if (scoring.multiplierModelSupported) {
    assert.equal(source.total.raw, scoring.computedMultiplierTotal, `${variant.id}: all set additions attributed`);
    sources.push(source);
    const initial = { ...emptyScoreState(), points: 100 };
    const credit = scoring.multiplierCredits[0] || { band: '20M', group: scoring.multiplierPerspective.groups[0], countingScope: scoring.multiplierPerspective.countingScope, scopeKey: 'ALL' };
    const marginal = multiplierMarginal(history.adapter, initial, { band: credit.band, group: credit.group, countingScope: credit.countingScope, scopeKey: credit.scopeKey });
    assert.equal(marginal.multiplier, 0, 'first bundle multiplier preserves P×max(1,M) fallback');
  }
}
assert.equal(multiplierCompatibility(sources[0], sources[1]).compatible, false, 'different bundled subevents cannot share comparison scales');
console.log(`Multiplier bundle regression: PASS (${variants.length} variants; committed-scorer and prefix comparisons)`);
