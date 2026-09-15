import assert from 'node:assert/strict';
import { buildMultiplierOverviewSource, selectMultiplierOverview, multiplierRollingRates, multiplierCompatibility, multiplierCumulativeSeries, multiplierCumulative, multiplierFocusedQsos } from '../modules/multipliers/overview-model.js';

const base = Date.UTC(2026, 8, 1, 23, 0);
const qsos = [
  { ts: base, call: 'A1AA', band: '20M', mode: 'CW', txId: '0' },
  { ts: base + 60000, call: 'B1BB', band: '20M', mode: 'CW', txId: '1' },
  { ts: base + 3600000, call: 'A1AA', band: '40M', mode: 'CW', txId: '1' },
  { ts: base + 3 * 3600000, call: 'C1CC', band: '40M', mode: 'CW' },
  { ts: null, call: 'D1DD', band: '40M', mode: 'CW' }
];
const credit = (qsoIndex, group, scopeKey, weight = 1) => ({ qsoIndex, group, scopeKey, countingScope: 'per_band', entityKey: 'X', rawCredit: 1, weight, weightedCredit: weight });
const scoring = { ruleId: 'fixture', multiplierModelSupported: true, computedPointsByIndex: [2, 0, 2, 2, 2],
  multiplierPerspective: { compatibilityKey: 'fixture|country,zone|per_band' },
  multiplierCredits: [credit(0, 'country', '20M'), credit(0, 'zone', '20M'), credit(2, 'country', '40M', 2), credit(4, 'zone', '40M')] };
const source = buildMultiplierOverviewSource(qsos, scoring);
assert.equal(source.total.raw, 4);
assert.equal(source.total.weighted, 5);
assert.equal(source.total.bearingQsos, 3);
assert.equal(source.undated.length, 1);
const later = selectMultiplierOverview(source, { startTs: base + 3600000 });
assert.equal(later.opening.raw, 2);
assert.equal(later.totals.raw, 1);
assert.equal(later.hourly.at(-1).cumulativeRaw, 3);
assert.equal(later.gaps.length, 1);
assert.equal(later.timeline[0].index, 2);
assert.equal(later.timeline[0].gapMinutes, 60);
const bandSeries = multiplierCumulativeSeries(later, 'band');
assert.equal(bandSeries.find((s) => s.key === '20M').rows[0].raw, 2, 'prior-band credits retain their opening balance');
assert.equal(bandSeries.find((s) => s.key === '40M').rows.at(-1).weighted, 2);
assert.equal(bandSeries.reduce((sum, s) => sum + s.rows.at(-1).raw, 0), later.opening.raw + later.totals.raw);
const typeSeries = multiplierCumulativeSeries(later, 'group');
assert.equal(typeSeries.find((s) => s.key === 'country').rows.at(-1).raw, 2, 'separate band-scoped country credits are not deduplicated');
assert.equal(typeSeries.find((s) => s.key === 'zone').rows.at(-1).raw, 1);
assert.ok(typeSeries.every((s) => s.rows.at(-1).ts === later.end), 'series retain elapsed-time plateau to selected end');
const radio = selectMultiplierOverview(source, { radio: '1' });
assert.equal(radio.totals.qsos, 2);
assert.equal(radio.totals.raw, 1, 'filtering cannot move the first country credit to the second radio');
assert.equal(selectMultiplierOverview(source, { group: 'zone' }).totals.raw, 1);
assert.equal(multiplierRollingRates(selectMultiplierOverview(source), 15)[0].raw, 2);
assert.equal(multiplierRollingRates(selectMultiplierOverview(source), 15)[0].rawPerHour, 8);
assert.equal(multiplierRollingRates(selectMultiplierOverview(source), 15)[0].partial, true);
assert.equal(multiplierCompatibility(scoring, scoring).compatible, true);
assert.equal(multiplierCompatibility(scoring, { ...scoring, ruleId: 'other' }).compatible, false);
assert.equal(buildMultiplierOverviewSource(qsos, {}).supported, false);
const qtc = { ts: base + 30000, isQtc: true, band: '20M' };
const interleaved = [qsos[0], qtc, qsos[1]];
const qtcSource = buildMultiplierOverviewSource(qsos.slice(0, 2), { ...scoring, computedPointsByIndex: [1, 8, 1], multiplierCredits: [credit(2, 'country', '20M')] }, {}, interleaved);
assert.equal(qtcSource.events[1].scoringIndex, 2);
assert.equal(qtcSource.events[1].credits.length, 1);
assert.equal(qtcSource.total.points, 2, 'QTC points must not shift onto another QSO');
const sparseSelection = { start: 0, end: 100000, opening: { raw: 0, weighted: 0 }, selected: Array.from({ length: 100000 }, (_, ts) => ({ ts, credits: ts === 0 ? [{ raw: 1, weighted: 1 }] : [] })) };
assert.equal(multiplierCumulative(sparseSelection).length, 3, 'large logs with one credit need only opening, change and endpoint rows');
const boundedSource = buildMultiplierOverviewSource([0, 3600000, 3620000].map((ts) => ({ ts, band: '20M', mode: 'CW' })), { ...scoring, multiplierCredits: [] });
const boundedRate = multiplierRollingRates(selectMultiplierOverview(boundedSource, { startTs: 3600000, endTs: 3610000 }), 15).at(-1);
assert.equal(boundedRate.end, 3660000);
assert.equal(boundedRate.partial, true, 'rounded window endpoint must not hide an explicit cutoff');
assert.equal(boundedRate.truncatedEnd, true);
assert.ok(Math.abs(boundedRate.observedMinutes - (15 - 49999 / 60000)) < 1e-9);
assert.equal(boundedRate.qsos, 1, 'excluded later QSO is never included');
// A sampled long-log grid must retain the last minute, including its credits.
const longEnd = base + 3001 * 60000;
const longQsos = [base, longEnd, longEnd + 20000].map((ts) => ({ ts, band: '20M', mode: 'CW' }));
const longSource = buildMultiplierOverviewSource(longQsos, { ...scoring,
  computedPointsByIndex: [0, 3, 5],
  multiplierCredits: [credit(1, 'country', '20M'), credit(2, 'zone', '20M')]
});
const longRates = multiplierRollingRates(selectMultiplierOverview(longSource), 30);
assert.equal(longRates.at(-1).end, longEnd + 60000, 'last minute survives a non-divisible sampling stride');
assert.equal(longRates.at(-1).raw, 2);
assert.equal(longRates.at(-1).points, 8);
assert.equal(longRates.at(-1).qsos, 2, 'opening QSO has left the trailing window');
assert.equal(longRates.at(-1).partial, false);
assert.ok(longRates.length <= 3001, 'long-log sampling remains bounded');
assert.equal(new Set(longRates.map((row) => row.end)).size, longRates.length, 'endpoint is not duplicated');
const longCutoff = multiplierRollingRates(selectMultiplierOverview(longSource, { endTs: longEnd + 10000 }), 30).at(-1);
assert.equal(longCutoff.end, longEnd + 60000);
assert.equal(longCutoff.raw, 1, 'final sampled window respects an exact cutoff');
assert.equal(longCutoff.points, 3);
assert.equal(longCutoff.qsos, 1);
assert.equal(longCutoff.truncatedEnd, true);
assert.equal(longCutoff.partial, true);
assert.ok(Math.abs(longCutoff.observedMinutes - (30 - 49999 / 60000)) < 1e-9);
const focusSlot = { logVersion: 4, fullQsoData: { qsos }, qsoData: { qsos: [qsos[3]] } };
const focus = { slotId: 'B', index: 0, logVersion: 4 };
assert.deepEqual(multiplierFocusedQsos(focusSlot, focus, 'B'), [qsos[0]], 'exact source comes from full log despite current filtered subset');
assert.deepEqual(multiplierFocusedQsos(focusSlot, focus, 'A'), [], 'same QSO number in another slot is not the target');
assert.deepEqual(multiplierFocusedQsos({ ...focusSlot, logVersion: 5 }, focus, 'B'), [], 'replacing a log invalidates old focus');
assert.deepEqual(multiplierFocusedQsos(focusSlot, { ...focus, index: -1 }, 'B'), []);
const brokenIdentity = buildMultiplierOverviewSource(qsos, scoring, {}, qsos.map((qso) => ({ ...qso })));
assert.equal(brokenIdentity.supported, false, 'unresolved identities cannot silently become zero credits');
assert.match(brokenIdentity.reason, /identities/);
const brokenCredit = buildMultiplierOverviewSource(qsos, { ...scoring, multiplierCredits: [{ qsoIndex: -1 }] });
assert.equal(brokenCredit.supported, false, 'unattributable credits make totals unavailable');
const invalidDate = buildMultiplierOverviewSource([{ ts: 1e30 }], { multiplierModelSupported: true });
assert.equal(invalidDate.undated.length, 1, 'out-of-range dates are handled as unknown timestamps');
const gapSource = buildMultiplierOverviewSource([{ ts: 0, band: '20M' }, { ts: 10800000, band: '20M' }], { multiplierModelSupported: true, multiplierCredits: [] });
const gapRange = selectMultiplierOverview(gapSource, { startTs: -3600000, endTs: 18000000 });
assert.equal(gapRange.gaps.length, 3, 'leading/trailing unknown spans and interior inactivity are explicit');
assert.equal(gapRange.hourlyIntervals[0].state, 'Outside recorded log evidence');
assert.equal(gapRange.hourlyIntervals[0].qsos, null, 'unknown evidence is not zero activity');
assert.equal(gapRange.gaps[1].state, 'No matching QSO activity');
assert.equal(gapRange.gaps[1].start, 3600000);
assert.equal(gapRange.gaps[1].intervalEnd, 10800000);
assert.equal(gapRange.hourly.at(-1).elapsedMinutes, 1, 'explicit selection beyond log cannot expand known observation duration');
const emptyBand = selectMultiplierOverview(gapSource, { band: '40M' });
assert.equal(emptyBand.hourlyIntervals.length, 1, 'wholly empty filtered selection is one interval');
assert.equal(emptyBand.hourlyIntervals[0].qsos, 0);
const unknownQso = { ts: null, band: '20M', txId: '1' };
const unknownSource = buildMultiplierOverviewSource([unknownQso], { multiplierModelSupported: true, multiplierCredits: [{ qsoIndex: 0, group: 'country', rawCredit: 1, weight: 2 }] });
const unknownSelection = selectMultiplierOverview(unknownSource, { startTs: 0, endTs: 60000, radio: '1' });
assert.equal(unknownSelection.totals.raw, 0);
assert.equal(unknownSelection.undatedTotals.raw, 1);
assert.equal(unknownSelection.undatedTotals.weighted, 2);
assert.equal(selectMultiplierOverview(unknownSource, { radio: '0' }).undated.length, 0);
const qtcEnd = buildMultiplierOverviewSource([gapSource.events[0].qso], { multiplierModelSupported: true }, {}, [gapSource.events[0].qso, { ts: 7200000, isQtc: true }]);
assert.equal(qtcEnd.end, 7200000, 'QTC tail belongs to station scoring time envelope');
console.log('Multiplier overview attribution model: PASS');
