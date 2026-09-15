import assert from 'node:assert/strict';
import { resolveMultiplierTarget, multiplierTargetScope } from '../modules/multipliers/target-model.js';
import { evaluateStrategy } from '../modules/multipliers/tradeoff-model.js';
import { createScoreAdapter, emptyScoreState } from '../modules/multipliers/score-adapter.js';

const source = (overrides = {}, credits = []) => ({ dated: [{ ts: 0, band: '80M', mode: 'CW' }], scoring: {
  multiplierCredits: credits,
  analyticalMetadata: { targetDescriptors: { groups: [{ id: 'country', capacity: null }], countingScope: 'per_band', bands: ['80M', '20M'], modes: ['CW', 'RTTY'], ...overrides } }
} });
const wae = source({ bandWeights: { '80m': 4, '20m': 2 } }, [{ group: 'country', band: '80M', scopeKey: '80M', weight: 4, timestamp: 0 }]);
let resolved = resolveMultiplierTarget(wae, { targetBand: '20M', targetWeight: 4, targetScope: '80M' }, 100);
assert.equal(resolved.target.weight, 2, 'WAE weight follows new target band');
assert.equal(resolved.target.scopeKey, '20M');
assert.equal(resolved.correctedLegacySettings, true);
resolved = resolveMultiplierTarget(source({ countingScope: 'per_band_per_mode' }), { targetBand: '20M', targetMode: 'RTTY' }, 100);
assert.equal(resolved.target.scopeKey, '20M|DIG');
assert.equal(multiplierTargetScope('per_hf_band_group', 'country', '20M', 'CW'), 'HIGH');
assert.equal(multiplierTargetScope('bartg_hf_mixed', 'bartg_dxcc_country', '20M', 'DIG'), '20M');
assert.equal(multiplierTargetScope('bartg_hf_mixed', 'bartg_continent', '20M', 'DIG'), 'ALL');
for (const settings of [{ targetGroup: 'invented' }, { targetBand: 'NONSENSE' }, { targetMode: 'SSB' }]) assert.equal(resolveMultiplierTarget(source(), settings, 100).supported, false);
const six = ['AF', 'AS', 'EU', 'NA', 'OC', 'SA'].map((entityKey, index) => ({ group: 'bartg_continent', scopeKey: 'ALL', entityKey, timestamp: index }));
const continents = source({ groups: [{ id: 'bartg_continent', capacity: 6 }], countingScope: 'bartg_hf_mixed' }, six);
assert.equal(resolveMultiplierTarget(continents, {}, 4).target.remaining, 1, 'future credit never reduces historical capacity');
const target = resolveMultiplierTarget(continents, {}, 5).target;
assert.equal(target.remaining, 0);
const adapter = createScoreAdapter({ analyticalMetadata: { rule: { id: 'bartg_hf_rtty', multipliers: {} }, contributions: [] } });
const result = evaluateStrategy(adapter, emptyScoreState(), { rate: 60, averagePoints: 1, credits: 1, probability: 1, searchMinutes: 0 }, 15, target);
assert.equal(result.supported, false, 'seventh continent is rejected before hypothetical scoring');
assert.match(result.reason, /0 uncredited entities/);
console.log('Multiplier target model: PASS');
