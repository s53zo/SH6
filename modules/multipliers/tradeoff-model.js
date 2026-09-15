import { buildScoreHistory, scoreStateAt, scoreWithOutcome, multiplierMarginal, emptyScoreState, addScoreContribution } from './score-adapter.js';
import { resolveMultiplierTarget } from './target-model.js';

const finite = (value) => value !== '' && value != null && Number.isFinite(Number(value));
const number = (value, fallback = 0) => finite(value) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const MINUTE = 60000;
const historyCache = new WeakMap();
const historicalStyleCache = new WeakMap();
export function multiplierHistory(source) {
  if (!historyCache.has(source)) historyCache.set(source, buildScoreHistory(source));
  return historyCache.get(source);
}

// Binary lookup into one cached replay: never rescore a prefix for each bucket.
export function historicalScoreBefore(history, timestamp) {
  if (!history.supported || !Number.isFinite(timestamp)) return null;
  let low = 0; let high = history.rows.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (history.rows[mid].ts < timestamp) low = mid + 1;
    else high = mid;
  }
  return low ? history.rows[low - 1].score : history.adapter.score(emptyScoreState());
}

export function multiplierHourlyScoreGrowth(selection) {
  const history = multiplierHistory(selection.source);
  return { supported: history.supported, reason: history.reason, rows: (selection.hourlyIntervals || selection.hourly).map((row) => {
    const start = Math.max(selection.start, row.start);
    const end = Math.min(selection.end + 1, row.intervalEnd ?? row.start + 3600000);
    const before = historicalScoreBefore(history, start);
    const after = historicalScoreBefore(history, end);
    return { ...row, stationScoreStart: before, stationScoreEnd: after, stationScoreGrowth: row.unknown || before == null || after == null ? null : after - before };
  }) };
}

export function multiplierEfficiencyGrowth(selection, efficiencyRows) {
  const history = multiplierHistory(selection.source);
  if (!history.supported) return { supported: false, reason: history.reason, rows: efficiencyRows.map((row) => ({ ...row, scoreGrowth: null })), unassignedGrowth: null };
  const groups = new Map();
  let assigned = 0;
  for (const event of selection.selected) {
    const growth = history.eventGrowth[event.scoringIndex] ?? 0;
    const key = JSON.stringify([event.radio, event.style]);
    groups.set(key, (groups.get(key) || 0) + growth);
    assigned += growth;
  }
  const stationGrowth = historicalScoreBefore(history, selection.end + 1) - historicalScoreBefore(history, selection.start);
  return { supported: true, stationGrowth, unassignedGrowth: stationGrowth - assigned,
    rows: efficiencyRows.map((row) => ({ ...row, scoreGrowth: groups.get(JSON.stringify([row.radio, row.style])) || 0 })) };
}

export function multiplierValueProgress(source, target, start, end) {
  const history = multiplierHistory(source);
  if (!history.supported || !Number.isFinite(start) || !Number.isFinite(end) || start > end) return [];
  const { adapter } = history;
  const state = emptyScoreState();
  const byIndex = new Map();
  for (const credit of source.scoring.multiplierCredits || []) {
    if (!byIndex.has(credit.qsoIndex)) byIndex.set(credit.qsoIndex, []);
    byIndex.get(credit.qsoIndex).push(credit);
  }
  const rows = [];
  const spacing = Math.max(60000, (end - start) / 300);
  let last = -Infinity;
  let opening = false;
  let creditedTargetUnits = 0;
  const value = () => {
    const marginal = multiplierMarginal(adapter, state, target);
    if (target.capacity != null && creditedTargetUnits >= target.capacity) { marginal.multiplier = null; marginal.equivalentQsos = null; }
    return marginal;
  };
  const emit = (ts, isOpening = false) => { rows.push({ ts, opening: isOpening, ...value() }); last = ts; };
  for (let index = 0; index < source.scoringEvents.length; index += 1) {
    const event = source.scoringEvents[index];
    if (event.ts > end) break;
    if (!opening && event.ts >= start) { emit(start, true); opening = true; }
    addScoreContribution(state, source.scoring.computedPointsByIndex[index], adapter.metadata.contributions[index], byIndex.get(index));
    for (const credit of byIndex.get(index) || []) if (credit.group === target.group && credit.scopeKey === target.scopeKey) creditedTargetUnits += Number(credit.rawCredit ?? 1);
    if (source.scoringEvents[index + 1]?.ts === event.ts) continue;
    if (event.ts >= start && event.ts - last >= spacing) emit(event.ts);
  }
  if (!opening) emit(start, true);
  if (rows.at(-1)?.ts === end && !rows.at(-1).opening) rows[rows.length - 1] = { ts: end, opening: false, ...value() };
  else emit(end);
  return rows;
}

export function observedStrategyDefaults(source, at, lookbackMinutes = 60, filters = {}) {
  const start = at - lookbackMinutes * MINUTE;
  const groups = { run: [], sp: [] };
  let cached = historicalStyleCache.get(source);
  if (!cached || cached.at !== at) {
    const prefix = source.dated.filter((event) => event.ts <= at);
    const roles = typeof source.classifyHistoricalStyles === 'function' ? source.classifyHistoricalStyles(prefix.map((event) => event.qso), at) : [];
    cached = { at, roles: new Map(prefix.map((event, index) => [event, roles[index] || 'UNKNOWN'])) };
    historicalStyleCache.set(source, cached);
  }
  for (const event of source.dated) {
    if (event.ts > at || event.ts <= start || (filters.radio && event.radio !== filters.radio)
      || (filters.band && event.band !== filters.band) || (filters.mode && event.mode !== filters.mode)) continue;
    const style = cached.roles.get(event);
    const group = style === 'RUN' ? 'run' : ['SEARCH', 'INBAND', 'SP', 'S&P'].includes(style) ? 'sp' : null;
    if (group) groups[group].push(event);
  }
  const summarize = (events) => {
    const minutes = new Set(events.map((e) => `${e.radio}|${Math.floor(e.ts / MINUTE)}`)).size;
    const elapsedMinutes = Math.max(0, (at - Math.max(start, source.start ?? at)) / MINUTE);
    const points = events.reduce((sum, e) => sum + e.points, 0);
    const sufficient = elapsedMinutes >= 15 && events.length >= 20;
    return { sampleQsos: events.length, observedMinutes: minutes, elapsedMinutes, sufficient,
      rate: sufficient ? events.length * 60 / elapsedMinutes : null,
      averagePoints: sufficient ? points / events.length : null,
      source: `Previous ${lookbackMinutes} minutes through ${new Date(at).toISOString()}; styles are recomputed from that historical prefix without future QSOs or spot anchors. Rates divide matching style QSOs by ${elapsedMinutes} elapsed UTC minutes, including inactivity and other styles. This is observed throughput, not a measured pure-style operating speed.` };
  };
  return { run: summarize(groups.run), sp: summarize(groups.sp) };
}

// A scenario has fixed ordinary-QSO production and one explicit success/failure
// outcome for a bundle of new credits. Fractional ordinary counts are a mixture
// of adjacent integer outcomes, keeping nonlinear score factors discrete.
export function evaluateStrategy(adapter, state, scenario, horizonMinutes, target) {
  if (!adapter?.supported || typeof adapter.score !== 'function') return { supported: false, reason: adapter?.reason || 'This scoring formula is unavailable.' };
  if (![scenario.rate, scenario.averagePoints, scenario.credits, scenario.probability, scenario.searchMinutes].every(finite)) return { supported: false, reason: 'Insufficient evidence: enter all scenario assumptions.' };
  if (!finite(horizonMinutes) || Number(horizonMinutes) < 1 || Number(horizonMinutes) > 120) return { supported: false, reason: 'Forecast horizon must be between 1 and 120 minutes.' };
  if (Number(scenario.rate) < 0 || Number(scenario.rate) > 2000 || Number(scenario.averagePoints) < 0 || Number(scenario.averagePoints) > 1000000) return { supported: false, reason: 'Enter a QSO rate between 0 and 2,000 and average points between 0 and 1,000,000.' };
  if (!Number.isInteger(Number(scenario.credits)) || Number(scenario.credits) < 0 || Number(scenario.credits) > 100) return { supported: false, reason: 'New credits must be a whole number between 0 and 100.' };
  if (target?.remaining != null && Number(scenario.credits) > target.remaining) return { supported: false, reason: `Only ${target.remaining} uncredited entities remain in this implemented type/scope universe.` };
  if (Number(scenario.probability) < 0 || Number(scenario.probability) > 1) return { supported: false, reason: 'Success probability must be between 0 and 1.' };
  if (Number(scenario.searchMinutes) < 0 || Number(scenario.searchMinutes) > Number(horizonMinutes)) return { supported: false, reason: 'Search/switching time must fit within the forecast horizon.' };
  if (!target || (Number(scenario.credits) > 0 && (!target.group || !finite(target.weight) || Number(target.weight) <= 0))) return { supported: false, reason: 'Select a multiplier type and positive scoring weight.' };
  if ((adapter.family?.startsWith('band-') || target.countingScope?.startsWith('per_band')) && (!target.band || !target.scopeKey)) return { supported: false, reason: 'This formula requires an explicit target band and multiplier scope.' };
  if (adapter.family === 'belgian-bonus' && (!['0', '1'].includes(String(scenario.ordinaryBelgian)) || (Number(scenario.credits) > 0 && !['0', '1'].includes(String(scenario.targetBelgian))))) return { supported: false, reason: 'Specify Belgian status separately for ordinary and successful target contacts.' };
  if (scenario.targetAveragePoints != null && scenario.targetAveragePoints !== '' && (!finite(scenario.targetAveragePoints) || Number(scenario.targetAveragePoints) < 0 || Number(scenario.targetAveragePoints) > 1000000)) return { supported: false, reason: 'Target QSO points must be between 0 and 1,000,000.' };
  if (scenario.targetQsos != null && (!finite(scenario.targetQsos) || !Number.isInteger(Number(scenario.targetQsos)) || Number(scenario.targetQsos) < 1 || Number(scenario.targetQsos) > 100)) return { supported: false, reason: 'Successful target contacts must be a whole number between 1 and 100.' };
  const auxiliaryKeys = adapter.rule?.id === 'avhfc_legacy' ? ['ordinaryDistanceBonus', ...(Number(scenario.credits) > 0 ? ['targetDistanceBonus'] : [])]
    : adapter.rule?.id === 'sarl_hf_2026' ? ['ordinaryThirdBandProbability', ...(Number(scenario.credits) > 0 ? ['targetThirdBandProbability'] : [])] : [];
  for (const key of auxiliaryKeys) {
    const value = Number(scenario[key]);
    if (!finite(scenario[key]) || value < 0 || (key.endsWith('Probability') ? value > 1 : !Number.isInteger(value) || value > 50000)) return { supported: false, reason: key.endsWith('Probability') ? 'Enter third-band completion probabilities between 0 and 1 for ordinary and target QSOs. A completion means earning a new two-point bonus.' : 'Enter distance-bonus score points per ordinary/target QSO as whole numbers from 0 to 50,000, separate from QSO points.' };
  }
  const horizon = clamp(number(horizonMinutes, 15), 1, 120);
  const search = clamp(number(scenario.searchMinutes), 0, horizon);
  const rate = clamp(number(scenario.rate), 0, 2000);
  const avg = clamp(number(scenario.averagePoints), 0, 1000000);
  const credits = Math.floor(clamp(number(scenario.credits), 0, 100));
  const p = clamp(number(scenario.probability), 0, 1);
  const expectedQsos = rate * (horizon - search) / 60;
  const low = Math.floor(expectedQsos);
  const fraction = expectedQsos - low;
  const creditRows = credits ? [{ ...target, rawCredit: credits, weightedCredit: credits * number(target.weight, 1) }] : [];
  const base = adapter.score(state);
  let expected = 0; let failure = 0; let success = 0;
  for (const [count, probability] of [[low, 1 - fraction], [low + 1, fraction]]) {
    if (!probability) continue;
    const common = { band: target.band, qsos: count, points: count * avg, belgian: String(scenario.ordinaryBelgian) === '1', distanceBonus: adapter.rule?.id === 'avhfc_legacy' ? count * number(scenario.ordinaryDistanceBonus) : 0 };
    // SARL's bonus is additive and always an integer two-point increment, so
    // its expected value can be added after evaluating the discrete base score.
    // This avoids rounding expected fractional completions inside the scorer.
    const ordinaryBonusExpectation = adapter.rule?.id === 'sarl_hf_2026' ? 2 * count * number(scenario.ordinaryThirdBandProbability) : 0;
    const f = scoreWithOutcome(adapter, state, common) + ordinaryBonusExpectation;
    // Target contacts earn their own QSO points as well as credits on success.
    const targetQsos = credits ? Math.max(1, Math.floor(number(scenario.targetQsos, 1))) : 0;
    const targetBonusExpectation = adapter.rule?.id === 'sarl_hf_2026' ? 2 * targetQsos * number(scenario.targetThirdBandProbability) : 0;
    const s = scoreWithOutcome(adapter, state, [common, { band: target.band, qsos: targetQsos, points: targetQsos * number(scenario.targetAveragePoints, avg), belgian: String(scenario.targetBelgian) === '1', distanceBonus: adapter.rule?.id === 'avhfc_legacy' ? targetQsos * number(scenario.targetDistanceBonus) : 0, credits: creditRows }]) + ordinaryBonusExpectation + targetBonusExpectation;
    failure += probability * (f - base);
    success += probability * (s - base);
    expected += probability * ((1 - p) * (f - base) + p * (s - base));
  }
  const targetQsos = credits ? number(scenario.targetQsos, 1) : 0;
  return { supported: true, expectedGain: expected, failureGain: failure, successGain: success, expectedQsos: expectedQsos + p * targetQsos, ordinaryQsos: expectedQsos, probability: p, searchMinutes: search, horizonMinutes: horizon };
}

export function strategyBreakEven(adapter, state, baselineGain, scenario, horizon, target) {
  const gain = (minutes) => evaluateStrategy(adapter, state, { ...scenario, searchMinutes: minutes }, horizon, target);
  const zero = gain(0); const full = gain(horizon);
  if (!zero.supported || !full.supported) return { minutes: null, reason: 'Insufficient assumptions.' };
  if (adapter.family === 'belgian-bonus') {
    // Adjacent-integer QSO mixtures make expected score piecewise linear in
    // available production time. Inspect every knot; UBA is not monotonic.
    const rate = Number(scenario.rate);
    const knots = [0, horizon];
    if (rate > 0) for (let count = 1; count < rate * horizon / 60; count += 1) knots.push(horizon - count * 60 / rate);
    knots.sort((a, b) => a - b);
    const intervals = [];
    let previous = { time: knots[0], gain: zero.expectedGain };
    for (const time of knots.slice(1)) {
      const current = { time, gain: gain(time).expectedGain };
      const left = previous.gain >= baselineGain;
      const right = current.gain >= baselineGain;
      if (left || right) {
        const crossing = left === right ? null : previous.time + (baselineGain - previous.gain) * (current.time - previous.time) / (current.gain - previous.gain);
        const interval = { start: left ? previous.time : crossing, end: right ? current.time : crossing };
        const last = intervals.at(-1);
        if (last && Math.abs(last.end - interval.start) < 1e-8) last.end = interval.end;
        else intervals.push(interval);
      }
      previous = current;
    }
    return { minutes: intervals.at(-1)?.end ?? null, intervals, reason: intervals.length ? `Competitive search-time intervals (minutes): ${intervals.map((r) => `${r.start.toFixed(2)}–${r.end.toFixed(2)}`).join(', ')}. UBA bonus dilution can make gains nonmonotonic; shorter search is not necessarily better.` : 'No search-time interval matches the baseline under these assumptions.' };
  }
  if (zero.expectedGain < baselineGain) return { minutes: null, reason: 'Does not beat the baseline even with no search delay.' };
  if (full.expectedGain >= baselineGain) return { minutes: horizon, reason: 'Remains competitive throughout the selected horizon under these assumptions.' };
  let low = 0; let high = horizon;
  for (let i = 0; i < 32; i += 1) { const mid = (low + high) / 2; if (gain(mid).expectedGain >= baselineGain) low = mid; else high = mid; }
  return { minutes: low, reason: 'Maximum search/switching time before expected score gain falls below the baseline.' };
}

export function buildTradeoff(selection, settings = {}) {
  if (settings.at != null && settings.at !== '' && (!finite(settings.at) || !Number.isFinite(new Date(Number(settings.at)).getTime()))) return { supported: false, reason: 'The saved historical timestamp is invalid. Select a valid UTC scoring position.' };
  if (settings.lookbackMinutes != null && (!finite(settings.lookbackMinutes) || Number(settings.lookbackMinutes) < 1 || Number(settings.lookbackMinutes) > 120)) return { supported: false, reason: 'Prior observation duration must be between 1 and 120 minutes.' };
  if (settings.horizonMinutes != null && (!finite(settings.horizonMinutes) || Number(settings.horizonMinutes) < 1 || Number(settings.horizonMinutes) > 120)) return { supported: false, reason: 'Forecast horizon must be between 1 and 120 minutes.' };
  if (settings.averagePoints != null && settings.averagePoints !== '' && (!finite(settings.averagePoints) || Number(settings.averagePoints) < 0 || Number(settings.averagePoints) > 1000000)) return { supported: false, reason: 'Ordinary QSO points for equivalence must be between 0 and 1,000,000.' };
  const history = multiplierHistory(selection.source);
  if (!history.supported) return { supported: false, reason: history.reason };
  const at = finite(settings.at) ? Number(settings.at) : selection.end;
  if (!finite(at) || !Number.isFinite(new Date(Number(at)).getTime())) return { supported: false, reason: 'A valid dated scoring position is required.' };
  const adapter = history.adapter;
  const state = scoreStateAt(selection.source, adapter, at);
  const targetResolution = resolveMultiplierTarget(selection.source, settings, at, selection.filters);
  if (!targetResolution.supported) return targetResolution;
  const { target } = targetResolution;
  const defaults = observedStrategyDefaults(selection.source, at, number(settings.lookbackMinutes, 60), { ...selection.filters, band: target.band, mode: target.mode });
  const ordinaryPointsAssumption = number(settings.averagePoints, defaults.run.averagePoints ?? defaults.sp.averagePoints ?? 2);
  const marginal = multiplierMarginal(adapter, state, { ...target, averagePoints: ordinaryPointsAssumption });
  if (target.remaining === 0) { marginal.multiplier = null; marginal.equivalentQsos = null; }
  const horizon = clamp(number(settings.horizonMinutes, 15), 1, 120);
  const strategies = ['run', 'sp', 'hunt'].map((id) => {
    const observed = defaults[id === 'run' ? 'run' : 'sp'];
    const assumptions = { rate: observed.rate, averagePoints: observed.averagePoints, credits: null, probability: null, searchMinutes: 0, ...(settings.scenarios?.[id] || {}) };
    const result = evaluateStrategy(adapter, state, assumptions, horizon, target);
    return { id, assumptions, observed, ...result };
  });
  const baseline = strategies[0];
  for (const strategy of strategies) {
    if (!strategy.supported) continue;
    strategy.sensitivity = [0, .25, .5, .75, 1].map((probability) => ({ probability, gain: evaluateStrategy(adapter, state, { ...strategy.assumptions, probability }, horizon, target).expectedGain }));
    if (baseline.supported && strategy.id !== 'run') strategy.breakEven = strategyBreakEven(adapter, state, baseline.expectedGain, strategy.assumptions, horizon, target);
  }
  return { supported: true, at, adapter, state, target, targetResolution, marginal, ordinaryPointsAssumption, defaults, horizon, strategies, currentScore: adapter.score(state) };
}
