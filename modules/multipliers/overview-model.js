// Display selection always follows full-log scoring. Never award credits here.
const MINUTE = 60000;
const HOUR = 60 * MINUTE;
const numeric = (value, fallback = 0) => value != null && Number.isFinite(Number(value)) ? Number(value) : fallback;
const timestamp = (value) => value != null && Number.isFinite(Number(value)) && Math.abs(Number(value)) <= 8640000000000000 ? Number(value) : null;
const token = (value) => String(value ?? '').trim().toUpperCase();

export function multiplierMode(value) {
  const mode = token(value);
  if (['PH', 'PHONE', 'SSB', 'USB', 'LSB', 'AM', 'FM'].includes(mode)) return 'SSB';
  if (['DIG', 'DIGITAL', 'RTTY', 'RY', 'FT8', 'FT4', 'PSK', 'PSK31', 'DATA', 'DIGI', 'MFSK', 'JT65', 'JT9', 'OLIVIA', 'FSK', 'FSK441', 'AMTOR'].includes(mode)) return 'DIG';
  return mode;
}

export function multiplierRadio(qso) {
  const id = token(qso?.txId ?? qso?.raw?.TX_ID);
  return /^[A-Z0-9][A-Z0-9._-]{0,15}$/.test(id) ? id : '__MISSING__';
}

export function multiplierFocusedQsos(slot, focus, slotId) {
  if (!slot || !focus || focus.slotId !== slotId || slot.logVersion !== focus.logVersion || !Number.isInteger(focus.index) || focus.index < 0) return [];
  const qso = (slot.fullQsoData || slot.qsoData)?.qsos?.[focus.index];
  return qso ? [qso] : [];
}

function emptyTotals() { return { qsos: 0, points: 0, bearingQsos: 0, raw: 0, weighted: 0 }; }
function addTotals(target, event) {
  target.qsos += 1;
  target.points += event.points;
  target.bearingQsos += event.credits.length ? 1 : 0;
  for (const credit of event.credits) { target.raw += credit.raw; target.weighted += credit.weighted; }
  return target;
}

export function multiplierCompatibility(a, b) {
  const left = a?.scoring || a;
  const right = b?.scoring || b;
  if (!left?.multiplierModelSupported || !right?.multiplierModelSupported) return { compatible: false, reason: 'An implemented multiplier model is required for both logs.' };
  if (left.ruleId !== right.ruleId) return { compatible: false, reason: 'These logs use different contest rules or rule editions.' };
  const key = left.multiplierPerspective?.compatibilityKey;
  if (!key || key !== right.multiplierPerspective?.compatibilityKey) return { compatible: false, reason: 'Multiplier groups, counting scopes, or station perspectives differ.' };
  return { compatible: true, reason: '' };
}

export function buildMultiplierOverviewSource(qsos = [], scoring = {}, meta = {}, activityEvents = qsos) {
  const scoringEvents = activityEvents.length ? activityEvents : qsos;
  const eventIndex = new Map(scoringEvents.map((event, index) => [event, index]));
  const byIndex = new Map();
  const invalidCredits = [];
  for (const credit of scoring.multiplierCredits || []) {
    const index = Number(credit.qsoIndex);
    if (!Number.isInteger(index) || index < 0 || index >= scoringEvents.length || scoringEvents[index]?.isQtc) { invalidCredits.push(credit); continue; }
    const normalized = {
      ...credit, raw: numeric(credit.rawCredit, 1),
      weighted: numeric(credit.weightedCredit, numeric(credit.rawCredit, 1) * numeric(credit.weight, 1)),
      identity: JSON.stringify([credit.group, credit.countingScope, credit.scopeKey, credit.entityKey])
    };
    if (!byIndex.has(index)) byIndex.set(index, []);
    byIndex.get(index).push(normalized);
  }
  const events = qsos.map((qso, index) => ({
    index, qsoNumber: qso.qsoNumber ?? index + 1, qso,
    ts: timestamp(qso.ts), call: qso.call || '', band: token(qso.band), mode: multiplierMode(qso.mode),
    radio: multiplierRadio(qso), style: token(qso.operatingStyleRole) || 'UNKNOWN',
    scoringIndex: eventIndex.get(qso) ?? null,
    points: numeric(scoring.computedPointsByIndex?.[eventIndex.get(qso)]), credits: byIndex.get(eventIndex.get(qso)) || []
  }));
  const dated = events.filter((event) => event.ts != null).sort((a, b) => a.ts - b.ts || a.index - b.index);
  const undated = events.filter((event) => event.ts == null);
  const total = events.reduce(addTotals, emptyTotals());
  const scoringTimes = scoringEvents.map((event) => timestamp(event.ts)).filter((ts) => ts != null);
  const identityComplete = events.every((event) => event.scoringIndex != null);
  const supported = Boolean(scoring.multiplierModelSupported) && identityComplete && invalidCredits.length === 0;
  const scoringNote = scoring.ruleId === 'rda' && scoring.analyticalMetadata?.stationIsRu === false && (scoring.multiplierCredits || []).some((credit) => credit.group === 'country_for_ru_entries')
    ? 'Existing RDA scorer discrepancy: country credits are recorded for this non-Russian entrant, but its final-score formula uses only RDA districts. Recorded raw/weighted credit totals below retain those country entries; they do not all contribute to score. Historical score and scenarios use the existing district-only formula. No scoring rule has been changed.'
    : scoring.analyticalMetadata?.bundleFormula ? 'Bundled contest analysis follows SH6’s existing heuristic scorer, not verified organizer adjudication. Product variants preserve points when no multiplier is recorded (P × max(1, M)); the first multiplier therefore has zero standalone value at M = 0. Compare only matching subevents and station perspectives.' : '';
  return {
    scoring, meta, scoringEvents, events, dated, undated, total, invalidCredits, scoringNote,
    identityComplete,
    start: scoringTimes.length ? scoringTimes.reduce((a, b) => Math.min(a, b), Infinity) : null,
    end: scoringTimes.length ? scoringTimes.reduce((a, b) => Math.max(a, b), -Infinity) : null,
    supported,
    reason: !scoring.multiplierModelSupported ? 'This log has no implemented multiplier model. Multiplier analytics are unavailable.' : !identityComplete || invalidCredits.length ? 'Full-log QSO/credit identities do not reconcile with the scoring event stream. Multiplier analytics are unavailable.' : '',
    groups: Array.from(new Set((scoring.multiplierCredits || []).map((credit) => credit.group))).sort(),
    bands: Array.from(new Set(events.map((event) => event.band).filter(Boolean))).sort(),
    radios: Array.from(new Set(events.map((event) => event.radio))).sort()
  };
}

function selectEvent(event, filters) {
  if (filters.band && event.band !== token(filters.band)) return false;
  if (filters.mode && event.mode !== multiplierMode(filters.mode)) return false;
  if (filters.radio && event.radio !== token(filters.radio)) return false;
  return true;
}

function creditsForGroup(event, group) {
  return group ? { ...event, credits: event.credits.filter((credit) => credit.group === group) } : event;
}

export function selectMultiplierOverview(source, filters = {}) {
  const start = timestamp(filters.startTs) ?? source.start;
  const end = timestamp(filters.endTs) ?? source.end;
  const eligible = source.dated.filter((event) => selectEvent(event, filters)).map((event) => creditsForGroup(event, filters.group));
  const opening = emptyTotals();
  const selected = [];
  for (const event of eligible) {
    if (event.ts < start) addTotals(opening, event);
    else if (event.ts <= end) selected.push(event);
  }
  const totals = selected.reduce(addTotals, emptyTotals());
  const hourlyMap = new Map();
  for (const event of selected) {
    const hour = Math.floor(event.ts / HOUR) * HOUR;
    if (!hourlyMap.has(hour)) hourlyMap.set(hour, { start: hour, ...emptyTotals() });
    addTotals(hourlyMap.get(hour), event);
  }
  // Keep sparse data in the model; the view can render explicit gap intervals
  // without allocating years of empty minute/hour buckets for an accidental log.
  let raw = opening.raw;
  let weighted = opening.weighted;
  const hourly = Array.from(hourlyMap.values()).sort((a, b) => a.start - b.start).map((row) => {
    raw += row.raw; weighted += row.weighted;
    const observedEnd = timestamp(filters.endTs) == null ? Math.floor(end / MINUTE) * MINUTE + MINUTE : end + 1;
    const observedStart = timestamp(filters.startTs) == null ? Math.floor(start / MINUTE) * MINUTE : start;
    const evidenceStart = Math.floor(source.start / MINUTE) * MINUTE;
    const evidenceEnd = Math.floor(source.end / MINUTE) * MINUTE + MINUTE;
    const elapsedMinutes = Math.max(0, (Math.min(row.start + HOUR, observedEnd, evidenceEnd) - Math.max(row.start, observedStart, evidenceStart)) / MINUTE);
    const hourlyRate = (count) => elapsedMinutes >= 1 ? count * 60 / elapsedMinutes : null;
    return { ...row, elapsedMinutes, partial: elapsedMinutes < 60, qsosPerHour: hourlyRate(row.qsos),
      pointsPerHour: hourlyRate(row.points), rawPerHour: hourlyRate(row.raw),
      cumulativeRaw: raw, cumulativeWeighted: weighted, state: row.raw ? 'New multipliers' : 'Activity without new multipliers' };
  });
  const gaps = [];
  const hourlyIntervals = [];
  if (start != null && end != null && start <= end) {
    const rangeStart = timestamp(filters.startTs) == null ? Math.floor(start / MINUTE) * MINUTE : start;
    const rangeEnd = timestamp(filters.endTs) == null ? Math.floor(end / MINUTE) * MINUTE + MINUTE : end + 1;
    const evidenceStart = Math.floor(source.start / MINUTE) * MINUTE;
    const evidenceEnd = Math.floor(source.end / MINUTE) * MINUTE + MINUTE;
    let cursor = rangeStart;
    let cumulativeRaw = opening.raw;
    let cumulativeWeighted = opening.weighted;
    const gap = (until) => {
      // Split only at evidence boundaries; a multi-year empty span stays O(1).
      const boundaries = [cursor, ...[evidenceStart, evidenceEnd].filter((ts) => ts > cursor && ts < until), until];
      for (let i = 1; i < boundaries.length; i += 1) {
        const from = boundaries[i - 1]; const to = boundaries[i];
        if (to <= from) continue;
        const known = source.start != null && source.end != null && from >= evidenceStart && to <= evidenceEnd;
        const row = { start: from, intervalEnd: to, ...emptyTotals(), elapsedMinutes: (to - from) / MINUTE,
          cumulativeRaw, cumulativeWeighted, qsosPerHour: known ? 0 : null, pointsPerHour: known ? 0 : null, rawPerHour: known ? 0 : null,
          state: known ? 'No matching QSO activity' : 'Outside recorded log evidence', gap: true, unknown: !known };
        if (!known) for (const key of Object.keys(emptyTotals())) row[key] = null;
        gaps.push(row); hourlyIntervals.push(row);
      }
    };
    for (const row of hourly) {
      const from = Math.max(rangeStart, row.start, evidenceStart);
      gap(from);
      const intervalEnd = Math.min(rangeEnd, row.start + HOUR, evidenceEnd);
      hourlyIntervals.push({ ...row, start: from, hourStart: row.start, intervalEnd });
      cumulativeRaw = row.cumulativeRaw; cumulativeWeighted = row.cumulativeWeighted;
      cursor = intervalEnd;
    }
    gap(rangeEnd);
  }
  const breakdownMap = new Map();
  const timeline = [];
  let previousCreditTs = null;
  for (const event of eligible) {
    if (event.ts > end) break;
    if (!event.credits.length) continue;
    const gapMinutes = previousCreditTs == null ? null : (event.ts - previousCreditTs) / MINUTE;
    previousCreditTs = event.ts;
    if (event.ts < start) continue;
    timeline.push({ ...event, gapMinutes });
    for (const credit of event.credits) {
      const key = JSON.stringify([event.band, credit.group, credit.countingScope, credit.scopeKey, credit.weight]);
      if (!breakdownMap.has(key)) breakdownMap.set(key, { band: event.band, group: credit.group, countingScope: credit.countingScope, scopeKey: credit.scopeKey, weight: numeric(credit.weight, 1), raw: 0, weighted: 0 });
      const row = breakdownMap.get(key); row.raw += credit.raw; row.weighted += credit.weighted;
    }
  }
  const undated = source.undated.filter((event) => selectEvent(event, filters)).map((event) => creditsForGroup(event, filters.group));
  const undatedTotals = undated.reduce(addTotals, emptyTotals());
  return { source, filters, start, end, selected, eligible, opening, totals, hourly, hourlyIntervals, gaps, timeline, undated, undatedTotals, breakdown: Array.from(breakdownMap.values()) };
}

// Windows are trailing [end - window, end), sampled on UTC minute boundaries.
// Counts are never annualized from a shorter observation span.
export function multiplierRollingRates(selection, windowMinutes = 30) {
  const minutes = [15, 30, 60].includes(Number(windowMinutes)) ? Number(windowMinutes) : 30;
  if (selection.start == null || selection.end == null || selection.start > selection.end) return [];
  const list = selection.eligible;
  const windowMs = minutes * MINUTE;
  const first = Math.floor(selection.start / MINUTE) * MINUTE + MINUTE;
  const last = Math.floor(selection.end / MINUTE) * MINUTE + MINUTE;
  // Bound samples for long logs without changing window duration or UTC positions.
  const step = Math.max(1, Math.ceil((last - first) / MINUTE / 3000)) * MINUTE;
  let left = 0; let right = 0;
  const totals = emptyTotals();
  const alter = (event, sign) => {
    const counts = addTotals(emptyTotals(), event);
    for (const key of Object.keys(totals)) totals[key] += counts[key] * sign;
  };
  const rows = [];
  const recordedEnd = Math.floor(selection.source.end / MINUTE) * MINUTE + MINUTE;
  const explicitEnd = timestamp(selection.filters?.endTs);
  const observedEnd = Math.min(recordedEnd, explicitEnd == null ? recordedEnd : explicitEnd + 1);
  // Clamp the final stride so the last QSO's minute is included even when
  // the sampled grid does not land on it. This still emits at most 3,001 rows.
  for (let end = first; ; end = Math.min(last, end + step)) {
    while (right < list.length && list[right].ts < end && list[right].ts <= selection.end) alter(list[right++], 1);
    while (left < right && list[left].ts < end - windowMs) alter(list[left++], -1);
    rows.push({ end, ...totals, windowMinutes: minutes, rawPerHour: totals.raw * 60 / minutes,
      qsosPerHour: totals.qsos * 60 / minutes, pointsPerHour: totals.points * 60 / minutes,
      partial: end - windowMs < selection.source.start || end > observedEnd,
      truncatedEnd: end > observedEnd,
      observedMinutes: Math.max(0, Math.min(end, observedEnd) - Math.max(end - windowMs, selection.source.start)) / MINUTE });
    if (end === last) break;
  }
  return rows;
}

export function multiplierEfficiency(selection) {
  // Each recorded minute contributes one minute of observed activity, divided
  // proportionally among styles represented within that radio/minute. Gaps are
  // not assigned to a style and simultaneous radios are separate observations.
  const minuteGroups = new Map();
  for (const event of selection.selected) {
    const key = JSON.stringify([event.radio, Math.floor(event.ts / MINUTE)]);
    if (!minuteGroups.has(key)) minuteGroups.set(key, []);
    minuteGroups.get(key).push(event);
  }
  const rows = new Map();
  for (const events of minuteGroups.values()) {
    for (const event of events) {
      const key = JSON.stringify([event.radio, event.style]);
      if (!rows.has(key)) rows.set(key, { radio: event.radio, style: event.style, minutes: 0, ...emptyTotals() });
      const row = rows.get(key);
      addTotals(row, event);
      row.minutes += 1 / events.length;
    }
  }
  return Array.from(rows.values()).map((row) => ({ ...row,
    qsosPerHour: row.minutes ? row.qsos * 60 / row.minutes : null,
    pointsPerHour: row.minutes ? row.points * 60 / row.minutes : null,
    rawPerHour: row.minutes ? row.raw * 60 / row.minutes : null,
    sufficient: row.qsos >= 20 && row.minutes >= 15
  }));
}

export function multiplierCumulative(selection) {
  if (selection.start == null || selection.end == null || selection.start > selection.end) return [];
  let raw = selection.opening.raw;
  let weighted = selection.opening.weighted;
  const rows = [{ ts: selection.start, raw, weighted, opening: true }];
  for (const event of selection.selected) {
    if (!event.credits.length) continue;
    for (const credit of event.credits) { raw += credit.raw; weighted += credit.weighted; }
    if (rows.at(-1)?.ts === event.ts && !rows.at(-1).opening) Object.assign(rows.at(-1), { raw, weighted });
    else rows.push({ ts: event.ts, raw, weighted });
  }
  if (rows.at(-1).ts < selection.end) rows.push({ ts: selection.end, raw, weighted, opening: false });
  return rows;
}

export function multiplierCumulativeSeries(selection, dimension = 'total') {
  if (!['band', 'group'].includes(dimension)) return [{ key: 'total', label: 'All matching credits', rows: multiplierCumulative(selection) }];
  if (selection.start == null || selection.end == null || selection.start > selection.end) return [];
  const buckets = new Map();
  for (const event of selection.eligible) {
    if (event.ts > selection.end) break;
    for (const credit of event.credits) {
      const key = dimension === 'band' ? event.band || 'UNKNOWN' : credit.group || 'UNKNOWN';
      if (!buckets.has(key)) buckets.set(key, { key, label: key, raw: 0, weighted: 0, additions: new Map() });
      const bucket = buckets.get(key);
      if (event.ts < selection.start) { bucket.raw += credit.raw; bucket.weighted += credit.weighted; }
      else {
        const counts = bucket.additions.get(event.ts) || { raw: 0, weighted: 0 };
        counts.raw += credit.raw; counts.weighted += credit.weighted;
        bucket.additions.set(event.ts, counts);
      }
    }
  }
  return Array.from(buckets.values()).sort((a, b) => a.key.localeCompare(b.key)).map((bucket) => {
    let { raw, weighted } = bucket;
    const rows = [{ ts: selection.start, raw, weighted, opening: true }];
    for (const [ts, counts] of bucket.additions) {
      raw += counts.raw; weighted += counts.weighted;
      rows.push({ ts, raw, weighted, opening: false });
    }
    if (rows.at(-1).ts < selection.end) rows.push({ ts: selection.end, raw, weighted, opening: false });
    return { key: bucket.key, label: bucket.label, rows };
  });
}

export function multiplierPeriodHighlights(selection) {
  const best = selection.hourly.reduce((winner, row) => !winner || row.raw > winner.raw ? row : winner, null);
  if (selection.start == null || selection.end == null || selection.start > selection.end) return { best: null, longestGap: null };
  let previous = selection.start;
  let longestGap = { start: previous, end: previous, minutes: 0 };
  const consider = (end) => {
    const minutes = (end - previous) / MINUTE;
    if (minutes > longestGap.minutes) longestGap = { start: previous, end, minutes };
    previous = end;
  };
  for (const event of selection.timeline) consider(event.ts);
  consider(selection.end);
  return { best: best?.raw > 0 ? best : null, longestGap };
}
