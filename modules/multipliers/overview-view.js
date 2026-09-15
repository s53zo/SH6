import { multiplierRollingRates, multiplierEfficiency, multiplierCumulativeSeries, multiplierCompatibility, multiplierPeriodHighlights } from './overview-model.js';
import { buildTradeoff, multiplierHourlyScoreGrowth, multiplierValueProgress, multiplierEfficiencyGrowth } from './tradeoff-model.js';

export const OVERVIEW_VIEWS = [
  ['hourly', 'Overview / hourly'], ['rate', 'Multiplier rate'], ['cumulative', 'Cumulative progress'],
  ['breakdown', 'Band and type'], ['timeline', 'Credit timeline'], ['efficiency', 'Operating efficiency']
];
export const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const number = (value) => value == null || !Number.isFinite(Number(value)) ? '—' : Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
const utc = (value) => value == null ? 'Unknown time' : new Date(value).toISOString().replace('T', ' ').replace('.000Z', 'Z');
const radioLabel = (id) => id === '__MISSING__' ? 'Missing' : /^R/.test(id) ? id : `R${id}`;
const groupLabel = (group) => String(group || '').replaceAll('_', ' ');

function table(headers, rows, caption) {
  return `<div class="multiplier-table-wrap"><table class="mtc"><caption>${escape(caption)}</caption><thead><tr>${headers.map((h) => `<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}">No matching records.</td></tr>`}</tbody></table></div>`;
}

function tradeoffRows(model) {
  const data = { headers: ['Strategy', 'QSOs/hour assumption', 'Average ordinary points', 'New credits on success', 'Success probability', 'Search/switch minutes', 'Expected QSOs', 'Expected score gain', 'Break-even search minutes', 'Status', 'Target QSO points (blank uses ordinary)', 'Ordinary Belgian (1=yes)', 'Target Belgian (1=yes)', 'Break-even explanation'],
    rows: model.supported ? model.strategies.map((s) => [s.id === 'run' ? 'RUN' : s.id === 'sp' ? 'S&P for points' : 'Multiplier hunt', s.assumptions.rate, s.assumptions.averagePoints, s.assumptions.credits, s.assumptions.probability, s.assumptions.searchMinutes, s.expectedQsos, s.expectedGain, s.breakEven?.minutes, s.supported ? 'Conditional on entered assumptions' : s.reason, s.assumptions.targetAveragePoints, s.assumptions.ordinaryBelgian, s.assumptions.targetBelgian, s.breakEven?.reason]) : [['Unavailable', '', '', '', '', '', '', '', '', model.reason, '', '', '', '']] };
  if (model.supported) {
    data.headers.push('Ordinary distance-bonus points per QSO', 'Target distance-bonus points per QSO', 'Ordinary third-band completion probability', 'Target third-band completion probability');
    data.rows.forEach((row, index) => { const a = model.strategies[index].assumptions; row.push(a.ordinaryDistanceBonus, a.targetDistanceBonus, a.ordinaryThirdBandProbability, a.targetThirdBandProbability); });
    data.headers.push('Evaluation UTC', 'Horizon minutes', 'Station score at evaluation', 'Target multiplier type', 'Target band', 'Counting scope', 'Scope key', 'Weight', 'Target QSOs on success', 'Effective target points per QSO', 'Marginal multiplier value', 'Marginal ordinary QSO value', 'Equivalent ordinary QSOs', 'Observation source', 'Probability sensitivity');
    data.rows.forEach((row, index) => {
      const strategy = model.strategies[index];
      const a = strategy.assumptions;
      row.push(utc(model.at), model.horizon, model.currentScore, model.target.group, model.target.band, model.target.countingScope, model.target.scopeKey, model.target.weight, Number(a.credits) > 0 ? a.targetQsos ?? 1 : 0, a.targetAveragePoints == null || a.targetAveragePoints === '' ? a.averagePoints : a.targetAveragePoints, model.marginal.multiplier, model.marginal.qso, model.marginal.equivalentQsos, strategy.observed.source, strategy.sensitivity?.map((s) => `${s.probability}: ${s.gain}`).join('; '));
    });
    data.headers.push('Ordinary QSO points for marginal equivalence', 'Target mode', 'Remaining known target entities', 'Target limitations');
    data.rows.forEach((row) => row.push(model.ordinaryPointsAssumption, model.target.mode, model.target.remaining, model.targetResolution.limitation));
  }
  return data;
}

function renderTradeoff(selection, settings, slotId) {
  const model = buildTradeoff(selection, settings);
  if (!model.supported) return `<p class="state-card">${escape(model.reason)}</p><button type="button" class="no-print" data-mult-tradeoff-reset="${escape(slotId)}">Reset this log's scenario settings</button>`;
  const input = (key, label, value, attributes = '', strategy = '') => `<label>${escape(label)} <input data-mult-tradeoff="${escape(key)}" data-slot="${escape(slotId)}" data-strategy="${escape(strategy)}" value="${escape(value ?? '')}" ${attributes}></label>`;
  const numeric = 'type="number" step="any"';
  const select = (key, label, value, choices) => `<label>${escape(label)} <select data-mult-tradeoff="${escape(key)}" data-slot="${escape(slotId)}" data-strategy="">${choices.map((choice) => `<option value="${escape(choice)}"${choice === value ? ' selected' : ''}>${escape(choice)}</option>`).join('')}</select></label>`;
  const controls = input('at', 'Scoring position (UTC)', new Date(model.at).toISOString().slice(0, 19), 'type="datetime-local" step="1"')
    + input('lookbackMinutes', 'Prior observation minutes', settings.lookbackMinutes ?? 60, `${numeric} min="1" max="120"`)
    + select('targetGroup', 'Multiplier type', model.target.group, model.targetResolution.groups)
    + select('targetBand', 'Target band', model.target.band, model.targetResolution.bands)
    + select('targetMode', 'Target mode', model.target.mode, model.targetResolution.modes)
    + `<span>Rule scope: ${escape(model.target.countingScope)} / ${escape(model.target.scopeKey)}; weight: ${number(model.target.weight)}.</span>`
    + input('averagePoints', 'Ordinary QSO points for equivalence', settings.averagePoints ?? model.defaults.run.averagePoints ?? model.defaults.sp.averagePoints ?? 2, `${numeric} min="0"`);
  const observations = Object.entries(model.defaults).map(([id, value]) => [id.toUpperCase(), value.sampleQsos, number(value.observedMinutes), number(value.rate), number(value.averagePoints), value.sufficient ? 'Observed activity proxy' : 'Insufficient evidence']);
  const observed = `<h4>Observed analysis</h4><div class="multiplier-overview-controls">${controls}</div><p>Station-wide score at ${escape(utc(model.at))}: ${number(model.currentScore)}. Display filters do not reset scoring history. Marginal values assume the target is eligible and not previously credited in this scope.</p><p>Additional multiplier alone: ${number(model.marginal.multiplier)} score points. Ordinary QSO: ${number(model.marginal.qso)}. Multiplier equivalent: ${model.marginal.equivalentQsos == null ? 'unavailable' : `${number(model.marginal.equivalentQsos)} ordinary QSOs`}.</p>${table(['Inferred style', 'Sample QSOs', 'Recorded radio-minutes', 'QSOs/hour', 'Mean QSO points', 'Evidence'], observations.map((r) => r.map(escape)), 'Prior observations')}<p>${escape(model.defaults.run.source)} Styles are inferred, not transmitter identities or proof of strategy effectiveness.</p>`;
  const scenarios = model.strategies.map((s) => `<fieldset><legend>${s.id === 'run' ? 'Continue RUN' : s.id === 'sp' ? 'S&P for points' : 'Hunt multipliers'}</legend><div class="multiplier-overview-controls">${[
    ['rate', 'Ordinary QSOs/hour', 'min="0" max="2000"'], ['averagePoints', 'Points per ordinary QSO', 'min="0"'], ['targetAveragePoints', 'Points per target QSO (default: ordinary)', 'min="0"'],
    ...(model.adapter.family === 'belgian-bonus' ? [['ordinaryBelgian', 'Ordinary contacts Belgian? 1=yes, 0=no', 'min="0" max="1"'], ['targetBelgian', 'Target contacts Belgian? 1=yes, 0=no', 'min="0" max="1"']] : []),
    ...(model.adapter.rule.id === 'avhfc_legacy' ? [['ordinaryDistanceBonus', 'Separate distance-bonus points per ordinary QSO', 'min="0" max="50000"'], ['targetDistanceBonus', 'Separate distance-bonus points per target QSO', 'min="0" max="50000"']] : []),
    ...(model.adapter.rule.id === 'sarl_hf_2026' ? [['ordinaryThirdBandProbability', 'Ordinary QSO earns a new third-band bonus: probability', 'min="0" max="1"'], ['targetThirdBandProbability', 'Target QSO earns a new third-band bonus: probability', 'min="0" max="1"']] : []),
    ['credits', 'New credits if successful', 'min="0" max="100"'], ['targetQsos', 'Target contacts on success', 'min="1" max="100"'],
    ['probability', 'Success probability (0–1)', 'min="0" max="1"'], ['searchMinutes', 'Search/switch minutes', `min="0" max="${model.horizon}"`]
  ].map(([key, label, attrs]) => input(key, label, s.assumptions[key] ?? (key === 'targetQsos' ? 1 : ''), `${numeric} ${attrs}`, s.id)).join('')}</div><p>${s.supported ? `Expected gain: ${number(s.expectedGain)} score points; expected QSOs: ${number(s.expectedQsos)}. Failure gain: ${number(s.failureGain)}; success gain: ${number(s.successGain)}.` : escape(s.reason)}</p>${s.breakEven ? `<p>Break-even search time: ${number(s.breakEven.minutes)} minutes. ${escape(s.breakEven.reason)}</p>` : ''}${s.sensitivity ? `<details><summary>Probability sensitivity</summary>${table(['Success probability', 'Expected score gain'], s.sensitivity.map((r) => [number(r.probability), number(r.gain)]), 'Sensitivity with other assumptions fixed')}</details>` : ''}</fieldset>`).join('');
  const ranked = model.strategies.filter((s) => s.supported).sort((a, b) => b.expectedGain - a.expectedGain);
  const conclusion = ranked.length === 3 ? `Under these assumptions, ${ranked[0].id === 'run' ? 'RUN' : ranked[0].id === 'sp' ? 'S&P for points' : 'multiplier hunting'} has the highest expected score gain. This is not evidence that targets will be available or successfully worked.` : 'Insufficient evidence to compare all three strategies: complete the missing assumptions.';
  const valueRows = multiplierValueProgress(selection.source, { ...model.target, averagePoints: model.ordinaryPointsAssumption }, selection.start, model.at);
  const targetNote = `<p>${escape(model.targetResolution.limitation)} ${model.targetResolution.eligibilityKnown ? '' : 'Band/mode eligibility is not fully declared by this rule; these are hypothetical credit-unit calculations, not eligibility approval.'} ${model.target.remaining == null ? 'The remaining eligible-entity count is unknown.' : `${number(model.target.remaining)} uncredited entities remain in the implemented type/scope universe at the selected time.`} ${model.targetResolution.correctedLegacySettings ? 'Saved scope/weight overrides were replaced with the selected rule’s canonical values.' : ''}</p>`;
  const valueChart = overviewChart([{ label: 'Additional multiplier alone (score points)', points: valueRows.map((row) => ({ ts: row.ts, value: row.multiplier })) }], 'Historical marginal multiplier value', {}, settings);
  const valueDetails = `<details><summary>Historical value samples</summary><p>Fixed target and ordinary-QSO points assumption (${number(model.ordinaryPointsAssumption)}) throughout. The ordinary-QSO comparison assumes no extra distance or third-band bonus, and a non-Belgian contact for UBA. Scenario-specific bonus assumptions are applied separately below. Approximately 300 samples at most, plus boundaries. Opening values precede events at the range start; final values include events through the evaluation time. No future scoring events contribute.</p>${table(['UTC', 'Multiplier alone', 'Ordinary QSO', 'Equivalent ordinary QSOs'], valueRows.map((row) => [escape(utc(row.ts)), number(row.multiplier), number(row.qso), number(row.equivalentQsos)]), 'Historical marginal values')}</details>`;
  return `${observed}${targetNote}${valueChart}${valueDetails}<h4>What-if scenarios</h4><div class="multiplier-overview-controls">${input('horizonMinutes', 'Forecast horizon (minutes)', model.horizon, `${numeric} min="1" max="120"`)}</div><p>Each scenario combines ordinary QSOs with one success/failure outcome for the entered bundle of new credits. Successful target contacts also earn QSO points. Search/switch time reduces ordinary QSO production. Rates and success probabilities are assumptions, not predictions.</p>${scenarios}<p>${escape(conclusion)}</p>`;
}

export function sampleMultiplierChart(points, limit = 1600) {
  if (points.length <= limit) return points;
  const sampled = [points[0]];
  const buckets = Math.max(1, Math.floor((limit - 2) / 4));
  const width = (points.length - 2) / buckets;
  for (let bucket = 0; bucket < buckets; bucket += 1) {
    const start = 1 + Math.floor(bucket * width);
    const end = Math.min(points.length - 1, 1 + Math.floor((bucket + 1) * width));
    let low = start; let high = start;
    for (let index = start + 1; index < end; index += 1) {
      if (points[index].value < points[low].value) low = index;
      if (points[index].value > points[high].value) high = index;
    }
    for (const index of [...new Set([start, low, high, end - 1])].sort((a, b) => a - b)) sampled.push(points[index]);
  }
  sampled.push(points.at(-1));
  return sampled;
}

export function overviewChart(series, title, bounds = {}, settings = {}) {
  const points = series.flatMap((s) => s.points).filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.value));
  if (!points.length) return '<p>No dated data for this chart.</p>';
  // Reductions avoid exceeding the argument limit on large contest logs.
  const baseMin = Math.min(bounds.start ?? Infinity, points.reduce((value, p) => Math.min(value, p.start ?? p.ts), Infinity));
  const baseMax = Math.max(bounds.end ?? -Infinity, points.reduce((value, p) => Math.max(value, p.end ?? p.ts + 60000), -Infinity));
  const span = Math.max(60000, baseMax - baseMin);
  const min = baseMin;
  const max = min + span;
  const high = Math.max(1, bounds.max ?? points.reduce((value, p) => Math.max(value, p.value), 0)) * Math.max(0.1, Math.min(4, Number(settings.yScale) || 1));
  const x = (ts) => 55 + (ts - min) / Math.max(1, max - min) * 720;
  const y = (value) => 175 - value / high * 155;
  const colors = ['#1559b7', '#ad222b', '#25763b', '#74308d'];
  let sampled = false;
  const bars = series.map((s, i) => {
    const full = s.points.filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.value));
    // Keep the DOM bounded while retaining original UTC positions and extrema.
    const valid = sampleMultiplierChart(full, 400);
    sampled ||= valid.length < full.length;
    return valid.map((p, index) => {
      const start = p.start ?? p.ts;
      const end = p.end ?? Math.max(start + 60000, valid[index + 1]?.ts ?? baseMax);
      if (end <= min || start >= max) return '';
      const left = x(Math.max(min, start));
      const width = Math.max(0, x(Math.min(max, end)) - left);
      const top = y(Math.max(0, Math.min(high, p.value)));
      return `<rect class="multiplier-bar" data-start="${start}" data-end="${end}" x="${left}" y="${top}" width="${width}" height="${175 - top}" fill="${colors[i % colors.length]}" fill-opacity="${series.length > 1 ? 0.35 : 0.75}" stroke="${colors[i % colors.length]}" stroke-width="0.6"${i ? ` stroke-dasharray="${i * 3} 3"` : ''}><title>${escape(s.label)}: ${number(p.value)}; ${escape(utc(start))} to ${escape(utc(end))}${p.value > high ? '; above displayed Y maximum' : ''}</title></rect>`;
    }).join('');
  }).join('');
  return `<figure class="multiplier-chart"><svg viewBox="0 0 800 220" role="img" aria-label="${escape(title)}"><title>${escape(title)}</title><path d="M55 20V175H775" stroke="#8894a4" fill="none"/><text x="4" y="25">${number(high)}</text><text x="32" y="178">0</text>${bars}<text x="55" y="202">${escape(utc(min))}</text><text x="775" y="218" text-anchor="end">${escape(utc(max))}</text></svg><figcaption>${escape(title)}. ${sampled ? 'Dense bars are sampled with endpoints and local extrema retained; exact tables and CSV keep all rows. ' : ''}Chart viewport only; tables and CSV retain the full selection. Values above the Y maximum are clipped. ${series.map((s, i) => `<span style="color:${colors[i % colors.length]}"><svg aria-hidden="true" viewBox="0 0 40 8" style="display:inline;width:40px;height:8px;min-height:0;vertical-align:middle"><rect x="1" y="1" width="38" height="6" fill="currentColor" fill-opacity="0.35" stroke="currentColor"${i ? ` stroke-dasharray="${i * 3} 3"` : ''}/></svg> ${escape(s.label)} (${i ? `dash ${i * 3}/3` : 'solid'})</span>`).join(' · ')}</figcaption></figure>`;
}

export function multiplierViewRows(selection, view, settings = {}) {
  if (view === 'undated') return { headers: ['UTC', 'QSO number', 'Callsign', 'Band', 'Mode', 'Credits (type / entity / scope)', 'Raw credits', 'Weighted credits', 'Time selection membership', 'Radio'], rows: (selection.undated || []).map((r) => [utc(null), r.qsoNumber, r.call, r.band, r.mode, r.credits.map((c) => `${groupLabel(c.group)} / ${c.entityLabel || c.entityKey} / ${c.scopeKey}`).join('; '), r.credits.reduce((sum, c) => sum + c.raw, 0), r.credits.reduce((sum, c) => sum + c.weighted, 0), 'Unknown; not included in dated totals or rates', radioLabel(r.radio)]) };
  if (view === 'value-history') {
    const model = buildTradeoff(selection, settings);
    if (!model.supported) return { headers: ['Status'], rows: [[model.reason]] };
    return {
      headers: ['UTC', 'Opening balance', 'Multiplier alone score gain', 'Ordinary QSO score gain', 'Equivalent ordinary QSOs', 'Ordinary QSO points assumption', 'Target multiplier type', 'Target band', 'Counting scope', 'Scope key', 'Weight', 'Evaluation UTC', 'Assumptions', 'Target mode', 'Known type/scope capacity', 'Target limitations'],
      rows: multiplierValueProgress(selection.source, { ...model.target, averagePoints: model.ordinaryPointsAssumption }, selection.start, model.at).map((row) => [utc(row.ts), row.opening ? 'Yes' : 'No', row.multiplier, row.qso, row.equivalentQsos, model.ordinaryPointsAssumption, model.target.group, model.target.band, model.target.countingScope, model.target.scopeKey, model.target.weight, utc(model.at), 'Fixed eligible unworked target assumed; no auxiliary ordinary-QSO bonus; non-Belgian ordinary contact for UBA; historical scoring only.', model.target.mode, model.target.capacity, model.targetResolution.limitation])
    };
  }
  if (view === 'tradeoff') return tradeoffRows(buildTradeoff(selection, settings));
  if (view === 'rate') return {
    headers: ['Window end UTC', 'Window minutes', 'Observed minutes', 'Partial window', 'New credits', 'Mults/hour', 'QSOs', 'QSOs/hour', 'QSO points', 'Points/hour'],
    rows: multiplierRollingRates(selection, settings.windowMinutes).map((r) => [utc(r.end), r.windowMinutes, r.observedMinutes, r.partial ? 'Yes' : 'No', r.raw, r.rawPerHour, r.qsos, r.qsosPerHour, r.points, r.pointsPerHour])
  };
  if (view === 'cumulative') return { headers: ['UTC', 'Series', 'Cumulative raw credits', 'Cumulative weighted credits', 'Opening balance'], rows: multiplierCumulativeSeries(selection, settings.cumulativeBy).flatMap((series) => series.rows.map((r) => [utc(r.ts), groupLabel(series.label), r.raw, r.weighted, r.opening ? 'Yes' : 'No'])) };
  if (view === 'breakdown') return { headers: ['Band', 'Multiplier type', 'Counting scope', 'Scope', 'Weight', 'Raw credits', 'Weighted credits'], rows: selection.breakdown.map((r) => [r.band, groupLabel(r.group), r.countingScope, r.scopeKey, r.weight, r.raw, r.weighted]) };
  if (view === 'timeline') return { headers: ['UTC', 'QSO number', 'Callsign', 'Band', 'Mode', 'Credits (type / entity / scope)', 'Raw credits', 'Weighted credits', 'Minutes since previous credit', 'Radio'], rows: selection.timeline.map((r) => [utc(r.ts), r.qsoNumber, r.call, r.band, r.mode, r.credits.map((c) => `${groupLabel(c.group)} / ${c.entityLabel || c.entityKey} / ${c.scopeKey}`).join('; '), r.credits.reduce((sum, c) => sum + c.raw, 0), r.credits.reduce((sum, c) => sum + c.weighted, 0), r.gapMinutes, radioLabel(r.radio)]) };
  if (view === 'efficiency') {
    const growth = multiplierEfficiencyGrowth(selection, multiplierEfficiency(selection));
    return { headers: ['Radio', 'Style (inferred)', 'Recorded minutes', 'QSOs', 'QSOs/hour', 'QSO points', 'Points/hour', 'New credits', 'Mults/hour', 'Sample', 'Sequentially attributed score growth'], rows: growth.rows.map((r) => [radioLabel(r.radio), r.style, r.minutes, r.qsos, r.qsosPerHour, r.points, r.pointsPerHour, r.raw, r.rawPerHour, r.sufficient ? 'Sufficient observed activity' : 'Small sample — avoid ranking', r.scoreGrowth]), scoreContext: growth };
  }
  return {
    headers: ['UTC hour / interval start', 'Observed minutes', 'QSOs', 'QSO points', 'Multiplier QSOs', 'New raw credits', 'New weighted credits', 'Cumulative raw credits', 'QSOs/hour', 'Points/hour', 'Mults/hour', 'Activity', 'Station-wide score growth', 'Interval end UTC (exclusive)'],
    rows: multiplierHourlyScoreGrowth(selection).rows.map((r) => [utc(r.start), r.unknown ? null : r.elapsedMinutes, r.qsos, r.points, r.bearingQsos, r.raw, r.weighted, r.cumulativeRaw, r.qsosPerHour, r.pointsPerHour, r.rawPerHour, r.state, r.stationScoreGrowth, utc(r.intervalEnd ?? r.start + 3600000)])
  };
}

export function multiplierOverviewCsv(selection, view, settings = {}) {
  const data = multiplierViewRows(selection, view, settings);
  const contextHeaders = ['Rule ID', 'Selected start UTC', 'Selected end UTC', 'Band filter', 'Mode filter', 'Radio filter', 'Multiplier type filter'];
  const context = [selection.source.scoring.ruleId, utc(selection.start), utc(selection.end), selection.filters.band || 'All', selection.filters.mode || 'All', selection.filters.radio || 'All', selection.filters.group || 'All'];
  contextHeaders.push('Scorer limitations');
  context.push(selection.source.scoringNote || '');
  data.headers.push(...contextHeaders);
  data.rows.forEach((row) => row.push(...context));
  if (data.scoreContext) {
    data.headers.push('Station score growth', 'QTC/filtered-out event score growth', 'Attribution convention');
    data.rows.forEach((row) => row.push(data.scoreContext.stationGrowth, data.scoreContext.unassignedGrowth, 'Full-log sequential event deltas; ties follow scorer order; interactions assigned once; not causal.'));
  }
  const cell = (value) => {
    let text = String(value ?? '');
    if (/^[=+@-]/.test(text) && !/^-?\d+(\.\d+)?$/.test(text)) text = `'${text}`;
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return [data.headers, ...data.rows].map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n';
}

export function renderMultiplierOverviewPanel(selection, settings = {}, slotId = 'A') {
  if (!selection.source.supported) return `<p class="state-card">${escape(selection.source.reason)}</p>`;
  const view = settings.view || 'hourly';
  const context = `<p>Rule: ${escape(selection.source.scoring.ruleId || 'Unknown')}. Selected UTC: ${escape(utc(selection.start))}–${escape(utc(selection.end))}. Band: ${escape(selection.filters.band || 'All')}; mode: ${escape(selection.filters.mode || 'All')}; radio: ${escape(selection.filters.radio || 'All')}; multiplier type: ${escape(selection.filters.group || 'All')}.</p>`;
  if (view === 'tradeoff') return `<p class="state-card">Should I keep calling CQ, search for ordinary contacts, or spend time finding a new multiplier? This view compares those three choices using your contest's score formula. First choose a time in the log to see what an extra multiplier was worth then. Below, enter realistic rates, search time and chances of success to compare score gains over the next 15 minutes (or your chosen horizon). RUN means calling CQ; S&amp;P means searching and answering other stations. These are what-if estimates, not a prediction of available contacts.</p>` + context + `<button type="button" class="multiplier-overview-csv no-print" data-slot="${escape(slotId)}" data-mult-export="value-history">Export historical values CSV</button>` + renderTradeoff(selection, settings, slotId);
  const data = multiplierViewRows(selection, view, settings);
  let chart = '';
  let note = '';
  if (view === 'breakdown') note = `<p><button type="button" class="no-print" data-mult-opportunities-slot="${escape(slotId)}">Multiplier Opportunities for Log ${escape(slotId)}</button> Opportunities uses this log as the reference and carries the band, mode and multiplier type. It examines full-log, station-wide evidence; the overview time and radio selections do not constrain that report.</p>`;
  if (view === 'undated') note = `<p class="state-card">This is a log-quality check, not another performance report. These contacts have a missing or invalid date/time, so SH6 cannot place them in hourly or rate charts. ${selection.undated.length ? 'Open a QSO to inspect the original record. Correct its time in your logging software, then reload the log.' : 'No matching QSOs have missing time; there is nothing to fix in this selection.'}</p><p>These QSOs match the band, mode, radio and multiplier-type selection, but their time-range membership cannot be established. They are separate from dated totals, opening balances, rates and score history. Original full-log credit attribution is retained; no timestamp is invented.</p>`;
  if (view === 'rate') {
    const rows = multiplierRollingRates(selection, settings.windowMinutes);
    const windowMs = ([15, 30, 60].includes(Number(settings.windowMinutes)) ? Number(settings.windowMinutes) : 30) * 60000;
    // Work backwards so the latest window is always shown, without overlapping bars.
    let nextEnd = Infinity;
    const barRows = [...rows].reverse().filter((r) => {
      if (r.end > nextEnd - windowMs) return false;
      nextEnd = r.end; return true;
    }).reverse();
    chart = [['rawPerHour', 'Multiplier credits/hour'], ['qsosPerHour', 'QSOs/hour'], ['pointsPerHour', 'QSO points/hour']].map(([key, label]) => overviewChart([{ label, points: barRows.map((r) => ({ ts: r.end, start: r.end - windowMs, end: r.end, value: r[key] })) }], label, settings.rateBounds?.[key], settings)).join('');
    note = '<p>Each bar spans the selected rolling window (15, 30 or 60 minutes) and its height is the rate per hour. Bars show non-overlapping samples ending with the latest available window; the table and CSV retain all rolling samples. Trailing windows use elapsed UTC minutes, including breaks. Rates divide the actual count by the full selected window. Partial windows identify missing evidence before the log began or after an exact selected end time; they are not boosted to a shorter denominator.</p>';
  } else if (view === 'cumulative') {
    const series = multiplierCumulativeSeries(selection, settings.cumulativeBy);
    chart = overviewChart(series.map((s) => ({ label: groupLabel(s.label), step: true, points: s.rows.map((r) => ({ ts: r.ts, value: r.raw })) })), 'Cumulative multiplier credits', settings.chartBounds, settings);
    note = `<p>Opening balance: ${number(selection.opening.raw)} raw credits. Bar heights show cumulative credits at the start of each displayed interval, not new credits during that interval. Each series includes its matching full-log credits before the selected time range. Band/type bars sum awarded credits, not unique entities across separately counted scopes.</p>`;
  } else if (view === 'efficiency') {
    note = '<p>Styles are inferred by SH6 from the full log, without spot anchors. Duration is recorded radio-minutes, shared proportionally between styles within each minute; unrecorded gaps are unclassified. These observed-activity rates do not measure all time spent searching. Historical scenarios separately recompute styles using only the selected historical prefix.</p>';
    const growth = multiplierEfficiencyGrowth(selection, multiplierEfficiency(selection));
    note += `<p>${growth.supported ? `Score growth follows original scorer event order, including that order for tied timestamps: the entire before/after score difference belongs to the event's inferred style and radio. This allocates interactions once, is order-dependent, and is not a causal strategy effect or an allocation to one filtered multiplier type. Displayed groups plus ${number(growth.unassignedGrowth)} score points from QTCs/other filtered-out events reconcile to ${number(growth.stationGrowth)} station-wide score growth in the selected interval.` : `Score attribution unavailable: ${escape(growth.reason)}`}</p>`;
  } else if (view === 'hourly') {
    chart = overviewChart([{ label: 'New credits per UTC hour', points: selection.hourly.map((r) => ({ ts: r.start, start: r.start, end: r.start + 3600000, value: r.raw })) }], 'Hourly multiplier credits', settings.chartBounds, settings);
    note = `<p>Hour rates use the displayed observation duration. Log endpoints include their recorded minute; explicit time limits are respected. Rates for observations shorter than one minute are unavailable. ${selection.gaps.length ? `${selection.gaps.length} empty interval(s) are shown explicitly in the table and CSV. “No matching QSO activity” refers to the active filters and does not rule out QTC activity. Periods outside log evidence are unknown, not zero activity.` : ''}</p>`;
    const score = multiplierHourlyScoreGrowth(selection);
    const highlights = multiplierPeriodHighlights(selection);
    note += `<p>${highlights.best ? `Best displayed UTC hour: ${escape(utc(highlights.best.start))}, ${number(highlights.best.raw)} new credits${highlights.best.partial ? ' (partial hour)' : ''}.` : 'No new multiplier credits in this selection.'} ${highlights.longestGap ? `Longest interval without a new matching credit: ${number(highlights.longestGap.minutes)} minutes (${escape(utc(highlights.longestGap.start))} to ${escape(utc(highlights.longestGap.end))}). This includes inactivity and is bounded by the selected time range.` : ''}</p><p>${score.supported ? 'Score growth is station-wide within each displayed time interval, including QTC contributions. Band, mode, type and radio filters do not recompute the station score. It is not an attribution of score to only the displayed credits.' : `Score growth unavailable: ${escape(score.reason)}`}</p>`;
  }
  const pageSize = settings.exportAll ? Math.max(1, data.rows.length) : 200;
  const pageCount = Math.max(1, Math.ceil(data.rows.length / pageSize));
  const page = settings.exportAll ? 0 : Math.max(0, Math.min(pageCount - 1, Math.floor(Number(settings.tablePages?.[slotId]) || 0)));
  const offset = page * pageSize;
  const rows = data.rows.slice(offset, offset + pageSize).map((row) => row.map((value) => escape(typeof value === 'number' ? number(value) : value == null ? '—' : value)));
  if (view === 'timeline' || view === 'undated') rows.forEach((row, i) => {
    const event = (view === 'undated' ? selection.undated : selection.timeline)[offset + i];
    row[1] = `<button type="button" class="multiplier-qso-link" data-slot="${escape(slotId)}" data-qso-index="${event.index}">${escape(event.qsoNumber)}</button>`;
  });
  const pager = pageCount > 1 ? `<nav class="multiplier-overview-controls no-print" tabindex="-1" aria-label="${escape(slotId)} analytical table pages"><button type="button" data-mult-page-action="previous" data-mult-page="${page - 1}" data-slot="${escape(slotId)}"${page === 0 ? ' disabled' : ''}>Previous</button><span>Rows ${number(offset + 1)}–${number(Math.min(data.rows.length, offset + pageSize))} of ${number(data.rows.length)}. CSV includes all selected rows.</span><button type="button" data-mult-page-action="next" data-mult-page="${page + 1}" data-slot="${escape(slotId)}"${page + 1 >= pageCount ? ' disabled' : ''}>Next</button></nav>` : '';
  const detail = pager + table(data.headers, rows, OVERVIEW_VIEWS.find(([id]) => id === view)?.[1] || 'Multiplier overview');
  const unavailable = selection.source.undated.length && view !== 'undated' ? `<p>${number(selection.undatedTotals?.qsos)} matching QSOs with missing time and ${number(selection.undatedTotals?.raw)} raw credits are excluded from these dated totals. Check the original records in the Log view. Their membership in the selected time range is unknown.</p>` : '';
  return `${context}${unavailable}${note}${chart}${chart ? `<details${page > 0 || settings.exportAll ? ' open' : ''}><summary>Exact values</summary>${detail}</details>` : detail}`;
}

export function renderMultiplierOverview(slots, settings = {}) {
  const ready = slots.filter((slot) => slot.selection?.source.supported);
  const reference = ready[0];
  const comparable = ready.filter((slot) => multiplierCompatibility(reference.selection.source, slot.selection.source).compatible);
  const bounds = { start: Math.min(...comparable.map((s) => s.selection.start)), end: Math.max(...comparable.map((s) => s.selection.end)) };
  // Shared axes must cover the rendered bars, not just QSO timestamps. Otherwise
  // each panel extends its own axis and equal UTC positions cease to align.
  if (!settings.view || settings.view === 'hourly') {
    bounds.start = Math.floor(bounds.start / 3600000) * 3600000;
    bounds.end = comparable.reduce((end, s) => s.selection.hourly.reduce((value, row) => Math.max(value, row.start + 3600000), end), bounds.end);
  }
  if (settings.view === 'cumulative') {
    bounds.end += 60000;
    bounds.max = Math.max(1, ...comparable.map((s) => s.selection.opening.raw + s.selection.totals.raw));
  }
  else bounds.max = comparable.reduce((max, s) => s.selection.hourly.reduce((value, row) => Math.max(value, row.raw), max), 1);
  const rateBounds = {};
  if (settings.view === 'rate') {
    const windows = comparable.flatMap((s) => multiplierRollingRates(s.selection, settings.windowMinutes));
    for (const key of ['rawPerHour', 'qsosPerHour', 'pointsPerHour']) {
      rateBounds[key] = windows.reduce((range, row) => ({ start: Math.min(range.start, row.end - row.windowMinutes * 60000), end: Math.max(range.end, row.end), max: Math.max(range.max, row[key]) }), { start: Infinity, end: -Infinity, max: 1 });
    }
  }
  return slots.map((slot) => {
    if (!slot.selection) return `<section class="multiplier-overview-panel"><h3>${escape(slot.label)}</h3><p>No log loaded.</p></section>`;
    if (!slot.selection.source.supported) return `<section class="multiplier-overview-panel" data-slot="${escape(slot.id)}"><h3>${escape(slot.label)}</h3><p class="state-card">${escape(slot.selection.source.reason)}</p></section>`;
    const compatibility = reference ? multiplierCompatibility(reference.selection.source, slot.selection.source) : { compatible: false, reason: '' };
    const message = (slot !== reference && !compatibility.compatible ? `<p class="state-card">Comparison unavailable: ${escape(compatibility.reason)} This panel shows its own contest results.</p>` : '') + (slot.selection.source.scoringNote ? `<p class="state-card">${escape(slot.selection.source.scoringNote)}</p>` : '');
    const totals = settings.view === 'undated' ? slot.selection.undatedTotals : slot.selection.totals;
    return `<section class="multiplier-overview-panel" data-slot="${escape(slot.id)}"><h3>${escape(slot.label)} · ${escape(slot.selection.source.meta.stationCallsign || '')}</h3>${message}<p>${number(totals.raw)} raw credits · ${number(totals.weighted)} weighted credits · ${number(totals.bearingQsos)} multiplier-bearing QSOs</p><button type="button" class="multiplier-overview-csv no-print" data-slot="${escape(slot.id)}">Export this view CSV</button>${renderMultiplierOverviewPanel(slot.selection, { ...settings, ...(settings.tradeoffBySlot?.[slot.id] || {}), chartBounds: compatibility.compatible ? bounds : undefined, rateBounds: compatibility.compatible ? rateBounds : undefined }, slot.id)}</section>`;
  }).join('');
}
