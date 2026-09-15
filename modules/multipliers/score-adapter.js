// Pure analytical replay of scorer-emitted contributions. No QSO eligibility
// or multiplier credit decisions are made in this module.
const n = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const sum = (values) => values.reduce((total, value) => total + n(value), 0);
export function emptyScoreState() {
  return { points: 0, raw: 0, weighted: 0, qsoCount: 0, positiveQsoCount: 0, qtcCount: 0,
    distanceBonus: 0, threeBandBonus: 0, uniqueCallBonus: 0, ubaValidCount: 0, ubaBelgianCount: 0, ubaBelgianPoints: 0,
    groups: {}, bandPoints: {}, bandMults: {}, bandCounts: {} };
}
export function addScoreContribution(state, points, contribution = {}, credits = []) {
  const c = contribution || {};
  state.points += n(points);
  const band = c.band || 'UNKNOWN';
  state.bandPoints[band] = n(state.bandPoints[band]) + n(points);
  state.bandCounts[band] = n(state.bandCounts[band]) + n(c.bandQsoCount);
  for (const key of ['qsoCount', 'positiveQsoCount', 'qtcCount', 'distanceBonus', 'threeBandBonus', 'uniqueCallBonus', 'ubaValidCount', 'ubaBelgianCount', 'ubaBelgianPoints']) state[key] += n(c[key]);
  for (const credit of credits) {
    const raw = credit.rawCredit == null ? 1 : n(credit.rawCredit);
    const weighted = credit.weightedCredit == null ? raw * (credit.weight == null ? 1 : n(credit.weight)) : n(credit.weightedCredit);
    state.raw += raw; state.weighted += weighted;
    state.groups[credit.group] = n(state.groups[credit.group]) + raw;
    if (['per_band', 'per_hf_band_group'].includes(credit.countingScope)) state.bandMults[credit.scopeKey] = n(state.bandMults[credit.scopeKey]) + raw;
  }
  return state;
}

export function createScoreAdapter(scoring) {
  const metadata = scoring?.analyticalMetadata;
  const rule = metadata?.rule;
  const unavailable = (reason) => ({ supported: false, reason, score: () => null });
  if (!rule || !Array.isArray(metadata.contributions)) return unavailable('The scorer has not supplied the event contributions needed for this formula.');
  if (rule.score_completeness && rule.score_completeness !== 'complete') return unavailable(rule.incomplete_score_reason || 'Final scoring requires inputs outside this log.');
  const id = rule.id;
  if (metadata.bundleFormula) {
    const variants = rule.id === 'arrl_family_bundle' ? (rule.subevents || []).map((entry) => entry.id) : rule.id === 'eu_vhf_bundle' ? (rule.subevent_models || []).map((entry) => entry.model_id) : [];
    if (rule.bundle !== true || !variants.includes(metadata.bundleVariant) || !['product-min-one', 'points', 'points-unique-bonus'].includes(metadata.bundleFormula)) return unavailable('Bundled analytical metadata does not identify a supported rule variant and formula.');
  }
  const formula = String(rule.formula || '').replace(/\s+/g, ' ').trim();
  const mult = (state) => {
    let value = rule.multipliers?.model === 'weighted_mults' ? state.weighted : state.raw;
    if (rule.multipliers?.minimum_total != null) value = Math.max(value, n(rule.multipliers.minimum_total));
    if (rule.multipliers?.maximum_total != null) value = Math.min(value, n(rule.multipliers.maximum_total));
    return value;
  };
  const group = (s, ...keys) => sum(keys.map((key) => s.groups[key]));
  const bands = (s, fn) => sum(Array.from(new Set([...Object.keys(s.bandPoints), ...Object.keys(s.bandMults)])).map((band) => fn(n(s.bandPoints[band]), n(s.bandMults[band]), n(s.bandCounts[band]))));
  let score;
  let family;
  if (metadata.bundleFormula === 'product-min-one') {
    family = 'bundle-product'; score = (s) => s.points * Math.max(1, s.raw);
  } else if (metadata.bundleFormula === 'points-unique-bonus') {
    family = 'points-unique-bonus'; score = (s) => s.points + s.uniqueCallBonus;
  } else if (metadata.bundleFormula === 'points') {
    family = 'points'; score = (s) => s.points;
  } else if (['euhfc', 'sarl_vhf_2026', 'avhfc_legacy'].includes(id)) {
    family = 'band-product'; score = (s) => bands(s, (p, m) => p * m) + (id === 'avhfc_legacy' ? s.distanceBonus : 0);
  } else if (id === 'aegean_vhf_legacy') {
    family = 'band-count-product'; score = (s) => bands(s, (p, m, q) => p * m * q);
  } else if (id === 'basso_ferrarese_legacy') {
    family = 'band-jolly'; score = (s) => bands(s, (p, m) => p * (m > 0 ? 100 * m : 1));
  } else if (id === 'volta_rtty_2026') {
    family = 'count-product'; score = (s) => s.positiveQsoCount * s.points * mult(s);
  } else if (id === 'uba_dx_2026') {
    family = 'belgian-bonus'; score = (s) => (s.points + (!metadata.stationBelgian && s.ubaValidCount > 0 ? Math.round(s.ubaBelgianPoints * s.ubaBelgianCount / s.ubaValidCount) : 0)) * mult(s);
  } else if (id === 'sp_dx_rtty_2026') {
    family = 'group-product'; score = (s) => s.points * group(s, 'sp_dx_rtty_country', 'sp_dx_rtty_poviat') * Math.min(6, group(s, 'sp_dx_rtty_continent'));
  } else if (['bartg_hf_rtty', 'bartg_sprint'].includes(id)) {
    family = 'group-product'; score = (s) => s.points * group(s, 'bartg_dxcc_country', 'bartg_call_area') * group(s, 'bartg_continent');
  } else if (id === 'wae') {
    family = 'qso-qtc-product'; score = (s) => (s.qsoCount + s.qtcCount) * (s.weighted || mult(s));
  } else if (id === 'uksmg_summer_2027') {
    family = 'group-additive'; score = (s) => s.points + 500 * group(s, 'uksmg_dxcc', 'uksmg_grid', 'uksmg_member') + 1000 * group(s, 'uksmg_committee');
  } else if (['rsgb_160m_2026', 'ukr_champ_rtty_2026', 'sarl_hf_2026'].includes(id)) {
    family = 'additive'; score = (s) => s.points + mult(s) * (id === 'rsgb_160m_2026' ? 1 : id === 'sarl_hf_2026' ? 2 : 5) + (id === 'sarl_hf_2026' ? s.threeBandBonus : 0);
  } else if (['wed_minitest_40m', 'wed_minitest_80m'].includes(id)) {
    family = 'qso-product'; score = (s) => s.qsoCount * group(s, 'unique_callsign');
  } else if (id === 'rda') {
    if (typeof metadata.stationIsRu !== 'boolean') return unavailable('The scorer has not supplied the RDA station perspective.');
    family = 'product'; score = (s) => s.points * group(s, 'rda_district', ...(metadata.stationIsRu ? ['country_for_ru_entries'] : []));
  } else if (id === 'rf_championship_cw') {
    family = 'points'; score = (s) => s.points;
  } else if (id === 'aegean_rtty_legacy') {
    if (![0, 20].includes(metadata.operatorQrpBonus)) return unavailable('The scorer has not supplied the entrant’s fixed QRP bonus.');
    family = 'points'; score = (s) => s.points + metadata.operatorQrpBonus;
  } else if (/^score = (?:qso_points_total|weighted_qso_points_total) \* multipliers_total$/.test(formula)
    || ['cqww', 'cqwpx', 'cqwwrtty', 'cqwpxrtty', 'darc_fieldday', 'eudx', 'zrs_kvp', 'rdxc', 'rda'].includes(id)) {
    family = 'product'; score = (s) => s.points * mult(s);
  } else if (formula === 'score = qso_points_total') {
    family = 'points'; score = (s) => s.points;
  } else return unavailable(`The ${id} formula needs an analytical adapter for: ${formula || 'its bundled score'}.`);
  return { supported: true, reason: '', family, rule, metadata, multiplierTotal: mult, score: (state) => Math.round(score(state)) };
}

export function buildScoreHistory(source) {
  const adapter = createScoreAdapter(source.scoring);
  if (!adapter.supported) return { adapter, supported: false, reason: adapter.reason, rows: [] };
  const events = source.scoringEvents;
  if (events.some((event) => event.ts == null || !Number.isFinite(Number(event.ts)))) return { adapter, supported: false, reason: 'Undated scoring events prevent an exact historical score.', rows: [] };
  if (events.some((event, index) => index && event.ts < events[index - 1].ts)) return { adapter, supported: false, reason: 'Scoring event order is not chronological; historical advice would use credits from a later timestamp.', rows: [] };
  const credits = new Map();
  for (const credit of source.scoring.multiplierCredits || []) {
    if (!credits.has(credit.qsoIndex)) credits.set(credit.qsoIndex, []);
    credits.get(credit.qsoIndex).push(credit);
  }
  const state = emptyScoreState();
  const rows = [];
  const eventGrowth = [];
  let previousScore = adapter.score(state);
  for (let i = 0; i < events.length; i += 1) {
    addScoreContribution(state, source.scoring.computedPointsByIndex[i], adapter.metadata.contributions[i], credits.get(i));
    const currentScore = adapter.score(state);
    eventGrowth.push(currentScore - previousScore);
    previousScore = currentScore;
    if (i + 1 < events.length && events[i + 1].ts === events[i].ts) continue;
    rows.push({ ts: events[i].ts, score: adapter.score(state), points: state.points, multipliers: adapter.multiplierTotal(state) });
  }
  const reconciled = source.scoring.computedScore != null && adapter.score(state) === source.scoring.computedScore;
  return { adapter, supported: reconciled, reason: reconciled ? '' : 'Analytical replay does not reconcile with the existing scorer; historical value is unavailable.', rows: reconciled ? rows : [], eventGrowth: reconciled ? eventGrowth : [], finalState: state };
}

export function scoreStateAt(source, adapter, timestamp) {
  const state = emptyScoreState();
  const credits = new Map();
  for (const credit of source.scoring.multiplierCredits || []) {
    if (!credits.has(credit.qsoIndex)) credits.set(credit.qsoIndex, []);
    credits.get(credit.qsoIndex).push(credit);
  }
  source.scoringEvents.forEach((event, index) => {
    if (event.ts != null && Number.isFinite(event.ts) && event.ts <= timestamp) addScoreContribution(state, source.scoring.computedPointsByIndex[index], adapter.metadata.contributions[index], credits.get(index));
  });
  return state;
}

export function scoreWithOutcome(adapter, state, outcome = {}) {
  const next = { ...state, groups: { ...state.groups }, bandPoints: { ...state.bandPoints }, bandMults: { ...state.bandMults }, bandCounts: { ...state.bandCounts } };
  for (const batch of Array.isArray(outcome) ? outcome : [outcome]) {
    const band = batch.band || 'UNKNOWN';
    const count = Math.max(0, n(batch.qsos));
    const points = n(batch.points);
    addScoreContribution(next, points, {
      band, qsoCount: count, positiveQsoCount: points > 0 ? count : 0,
      bandQsoCount: count, qtcCount: n(batch.qtcs), distanceBonus: n(batch.distanceBonus),
      threeBandBonus: n(batch.threeBandBonus), ubaValidCount: points > 0 ? count : 0,
      ubaBelgianCount: batch.belgian && points > 0 ? count : 0, ubaBelgianPoints: batch.belgian && points > 0 ? points : 0
    }, batch.credits || []);
  }
  return adapter.score(next);
}

export function multiplierMarginal(adapter, state, { band, group, scopeKey, countingScope = 'once_total', weight = 1, averagePoints = 2 } = {}) {
  const base = adapter.score(state);
  const credit = { group, scopeKey: scopeKey || band || 'ALL', countingScope, rawCredit: 1, weight, weightedCredit: weight };
  const multiplier = scoreWithOutcome(adapter, state, { band, credits: [credit] }) - base;
  const qso = scoreWithOutcome(adapter, state, { band, qsos: 1, points: averagePoints }) - base;
  return { multiplier, qso, equivalentQsos: qso > 0 ? multiplier / qso : null };
}
