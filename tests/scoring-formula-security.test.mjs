import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

createRequire(import.meta.url)('../modules/analysis/core.js');
const core = globalThis.SH6AnalysisCore;
const evaluate = (formula, points = 7) => {
  const assumptions = new Set();
  const score = core.evaluateRuleFormula({ id: 'arithmetic-probe', formula },
    { qsoPointsTotal: points }, { total: 3, groupCounts: {}, modeCounts: {} },
    { stationCall: 'S53M' }, assumptions);
  return { score, fallback: assumptions.has(`Formula evaluation fallback used: ${formula}`) };
};

test('arithmetic grammar, precedence, associativity, unary signs and rounding', () => {
  for (const [formula, expected] of [
    ['2 + 3 * 4', 14], ['(2 + 3) * 4', 20], ['20 / 2 / 2', 5],
    ['10 - 3 - 2', 5], ['-2 * -(3 + 4)', 14], ['+2 + -3', -1],
    ['1 - -2', 3], ['-(+(-2))', 2], ['\t2 +\n3', 5], ['.5 + 1.', 2],
    ['1e2 + 2E-1', 100], ['-1.5', -1], ['5 / 2', 3],
    ['score = qso_points_total * multipliers_total', 21],
    ['qso_points_total / (multipliers_total + 1)', 2]
  ]) assert.deepEqual(evaluate(formula), { score: expected, fallback: false }, formula);
  assert.deepEqual(evaluate('qso_points_total * -2', -7), { score: 14, fallback: false });
});

test('invalid expressions are rejected intact and use the existing fallback', () => {
  globalThis.__sh6FormulaInjection = 0;
  for (const formula of [
    '1 +', '(1 + 2', '1 + 2)', '1 2', '2(3)', '1++2', '1--2',
    '1 % 2', '1,2', '2 ** 3', '1 /*comment*/ + 2', '1 //comment\n+ 2',
    '1 @ + 2', '1e+', '0x10', 'unknown_name + 1', 'constructor', '__proto__',
    'Math.max(1, 2)', 'qso_points_total.toString()', 'qso_points_total[0]',
    'globalThis.__sh6FormulaInjection = 1',
    'score = globalThis.__sh6FormulaInjection = 1',
    'score = 1; globalThis.__sh6FormulaInjection = 1',
    'constructor.constructor("globalThis.__sh6FormulaInjection=1")()',
    'score = 1; ru_score = 2',
    'non_ru_score = 1; ru_score = 2;', 'score == 1',
    '1 / 0', '0 / 0', '1e309', '1e308 * 1e308',
    '1e308 * 1e308 / 1e308', 'Infinity', 'NaN',
    '('.repeat(130) + '1' + ')'.repeat(130), '1+'.repeat(2100) + '1'
  ]) {
    assert.deepEqual(evaluate(formula), { score: 21, fallback: true }, formula);
    assert.equal(globalThis.__sh6FormulaInjection, 0);
  }
  assert.equal(evaluate('qso_points_total + 1', Infinity).fallback, true);
  delete globalThis.__sh6FormulaInjection;
});

test('every shipped formula preserves pre-fix results and explicit contest handlers', () => {
  const spec = JSON.parse(fs.readFileSync(new URL('../data/contest_scoring_spec.json', import.meta.url)));
  const baseline = JSON.parse(fs.readFileSync(new URL('./fixtures/scoring-formula-baseline.json', import.meta.url))).scores;
  assert.deepEqual(Object.keys(baseline).sort(), spec.rule_sets.map((rule) => rule.id).sort());
  for (const rule of spec.rule_sets) {
    const actual = [];
    for (const total of [0, 1, 123.25]) for (const ru of [false, true]) {
      const points = {
        qsoPointsTotal: total, weightedQsoPointsTotal: total * 2, qsoCount: 12, qtcCount: 3,
        positiveQsoCount: 8, modePoints: { CW: 15, SSB: 20 }, uniqueCallCount: 7,
        matrixBasePoints: 11, newZoneBonus: 2, newRegionBonus: 3,
        bandPoints: { '20M': total, '40M': 10 }, bandQsoCounts: { '20M': 8, '40M': 2 },
        ubaValidQsoCount: 10, ubaBelgianQsoCount: 2, ubaBelgianQsoPoints: 5,
        sarlHfTriBandBonus: 6, avhfcDistanceBonus: 4
      };
      const multipliers = {
        total: 5, weightedTotal: 10,
        groupCounts: { cq_zone: 2, country: 3, dxcc_country: 2, country_for_ru_entries: 1,
          w_ve_qth: 1, us_states_dc: 2, ve_provinces_areas: 1, wpx_prefix: 3,
          eu_region_code: 4, russian_oblast: 2, rda_district: 3, unique_callsign: 7,
          bartg_dxcc_country: 2, bartg_call_area: 3, bartg_continent: 2 },
        modeCounts: { CW: 3, SSB: 2 }, bandMultiplierCounts: { '20M': 3, '40M': 2 }
      };
      const assumptions = new Set();
      actual.push(core.evaluateRuleFormula(rule, points, multipliers,
        { stationCall: ru ? 'R1ABC' : 'S53M/QRP', stationIsRu: ru }, assumptions));
      assert.ok(![...assumptions].some((note) => note.startsWith('Formula evaluation fallback used:')), rule.id);
    }
    assert.deepEqual(actual, baseline[rule.id], rule.id);
  }
});
