/**
 * Build the bounded, presentation-neutral model used by Compare Insights.
 *
 * This module intentionally consumes derived summaries only. It never walks the
 * full QSO arrays, so callers may rebuild or render the returned model without
 * making large-log performance proportional to the number of QSOs.
 *
 * @param {Array<object>} slotEntries Active compare slot entries. An entry may
 *   expose its data as `snapshot`, `slot`, or directly as the entry itself.
 * @param {object} [options]
 * @param {string} [options.referenceSlotId='A'] Slot used as the comparison target.
 * @param {'computed'|'claimed'|'logged'} [options.scoreMode='computed']
 * @param {number} [options.maxInsights=8] Maximum ranked insight cards.
 * @param {number} [options.maxTimelineBuckets=96] Maximum UTC-hour rows returned.
 * @param {{startTs:number,endTs:number}} [options.timeRange] Optional shared UTC range.
 * @param {number} [options.breakThresholdMinutes=60] Minimum unusual break length.
 * @returns {object} A serializable compare-insights model.
 */
export function buildCompareInsightsModel(slotEntries, options = {}) {
  const entries = (Array.isArray(slotEntries) ? slotEntries : [])
    .slice(0, 4)
    .map(normalizeSlotEntry)
    .filter((entry) => entry.ready);

  if (entries.length < 2) {
    return {
      visible: false,
      status: 'insufficient-logs',
      slots: [],
      timeline: [],
      insights: []
    };
  }

  const maxInsights = clampInteger(options.maxInsights, 1, 24, 8);
  const maxTimelineBuckets = clampInteger(options.maxTimelineBuckets, 1, 24 * 366, 96);
  const breakThresholdMinutes = clampInteger(options.breakThresholdMinutes, 2, 24 * 60, 60);
  const requestedReference = String(options.referenceSlotId || 'A').toUpperCase();
  const reference = entries.find((entry) => entry.id === requestedReference) || entries[0];
  const scoreMode = normalizeScoreMode(options.scoreMode);
  const slots = entries.map((entry) => buildSlotMetrics(entry, scoreMode));
  const slotById = new Map(slots.map((slot) => [slot.id, slot]));
  const timelineResult = buildUtcHourTimeline(entries, slotById, normalizeFilterTimeRange(options.timeRange), maxTimelineBuckets);
  const timeline = timelineResult.rows;
  const compatibility = buildCompatibility(entries, timeline);
  if (timelineResult.truncated) {
    compatibility.warnings.push(`UTC timeline is bounded to ${maxTimelineBuckets} hours; apply a shared time filter to inspect another range.`);
  }
  const candidates = [];

  entries.forEach((subjectEntry) => {
    if (subjectEntry.id === reference.id) return;
    const subject = slotById.get(subjectEntry.id);
    const target = slotById.get(reference.id);
    if (!subject || !target) return;

    addScoreGap(candidates, subject, target, scoreMode);
    addLargestHourGaps(candidates, timeline, subject, target, compatibility.timelineComparable);
    addWeakBand(candidates, subjectEntry, reference, subject, target);
    addBreakGap(candidates, subjectEntry, reference, subject, target, breakThresholdMinutes, compatibility.timelineComparable);
    addStyleGap(candidates, subjectEntry, reference, subject, target);
    addMissedMultiplierInference(candidates, subjectEntry, reference, subject, target);
  });

  const insights = rankAndBoundInsights(candidates, maxInsights);
  const axisStart = timeline.length ? timeline[0].startTs : null;
  const axisEnd = timeline.length ? timeline[timeline.length - 1].endTs : null;

  return {
    visible: true,
    status: insights.length ? 'ready' : 'no-material-gaps',
    referenceSlotId: reference.id,
    scoreMode,
    axis: {
      mode: 'utc',
      bucket: 'hour',
      startTs: axisStart,
      endTs: axisEnd,
      displayedBucketCount: timeline.length,
      totalBucketCount: timelineResult.totalEligible,
      truncated: timelineResult.truncated,
      ...compatibility
    },
    slots,
    timeline,
    insights,
    limitations: [
      'Timeline values use existing derived UTC-hour summaries.',
      'Score progression is an inferred pacing curve: final selected score multiplied by cumulative effective-points share, or cumulative QSO share when points are unavailable; it is not exact contest scoring at that hour.',
      'Operating-style classifications are heuristic.',
      'Potential missed multipliers are comparison leads, not verified scoring credits.'
    ]
  };
}

function normalizeSlotEntry(entry, index) {
  const source = entry?.snapshot || entry?.slot || entry || {};
  const derived = source?.derived || {};
  const id = String(entry?.id || source?.id || String.fromCharCode(65 + index)).toUpperCase();
  return {
    id,
    label: String(entry?.label || source?.label || `Log ${id}`),
    source,
    derived,
    ready: entry?.ready === false ? false : Boolean(source?.derived)
  };
}

function buildSlotMetrics(entry, scoreMode) {
  const derived = entry.derived || {};
  const scoring = derived.scoring || {};
  const score = resolveScore(derived, scoreMode);
  const operating = derived.operatingStyle || {};
  const totals = operating.totals || {};
  const qsoTotal = sumSeries(derived.hourSeries, 'qsos');
  const pointTotal = sumSeries(derived.hourPointSeries, 'points');
  const multiplier = finiteOrNull(scoring.computedMultiplierTotal);
  return {
    id: entry.id,
    label: entry.label,
    call: String(derived.contestMeta?.stationCallsign || ''),
    contestId: String(derived.contestMeta?.contestId || ''),
    timeRange: normalizeTimeRange(derived.timeRange),
    qsoTotal,
    pointTotal,
    cumulativeQso: qsoTotal,
    cumulativePoints: pointTotal,
    score: score.value,
    scoreProvenance: score.provenance,
    scoreConfidence: String(scoring.confidence || 'unknown'),
    scoreRuleName: String(scoring.ruleName || ''),
    multiplierTotal: multiplier,
    multiplierProvenance: multiplier == null ? 'unavailable' : 'computed',
    operatingStyle: {
      available: Boolean(operating.totals),
      runQsos: numberOrZero(totals.runQsos),
      spQsos: numberOrZero(totals.spQsos),
      inbandQsos: numberOrZero(totals.inbandQsos),
      excludedQsoCount: numberOrZero(operating.excludedQsoCount),
      provenance: operating.totals ? 'inferred' : 'unavailable'
    },
    breakMinutes: numberOrZero(derived.breakSummary?.totalBreakMin)
  };
}

function buildUtcHourTimeline(entries, slotById, timeRange, maxBuckets) {
  const maps = new Map();
  const keys = new Set();
  entries.forEach((entry) => {
    const qsoMap = seriesMap(entry.derived.hourSeries, 'hour', 'qsos');
    const pointMap = seriesMap(entry.derived.hourPointSeries, 'hour', 'points');
    qsoMap.forEach((_, key) => keys.add(key));
    pointMap.forEach((_, key) => keys.add(key));
    maps.set(entry.id, { qsoMap, pointMap });
  });
  const ordered = Array.from(keys).filter(Number.isFinite).sort((a, b) => a - b);
  if (!ordered.length) return { rows: [], totalEligible: 0, truncated: false };
  const requestedStart = timeRange ? Math.floor(timeRange.startTs / 3600000) : ordered[0];
  const requestedEnd = timeRange ? Math.floor(timeRange.endTs / 3600000) : ordered[ordered.length - 1];
  const startHour = Math.min(requestedStart, requestedEnd);
  const endHour = Math.max(requestedStart, requestedEnd);
  const totalEligible = Math.max(0, endHour - startHour + 1);
  const displayEndHour = Math.min(endHour, startHour + maxBuckets - 1);
  const running = new Map(entries.map((entry) => {
    const slotMaps = maps.get(entry.id);
    let qsos = 0;
    let points = 0;
    slotMaps?.qsoMap.forEach((value, hour) => { if (hour < startHour) qsos += numberOrZero(value); });
    slotMaps?.pointMap.forEach((value, hour) => { if (hour < startHour) points += numberOrZero(value); });
    return [entry.id, { qsos, points }];
  }));
  const rows = [];
  for (let hour = startHour; hour <= displayEndHour; hour += 1) {
    const bySlot = {};
    entries.forEach((entry) => {
      const slotMaps = maps.get(entry.id);
      const qsos = numberOrZero(slotMaps?.qsoMap.get(hour));
      const points = numberOrZero(slotMaps?.pointMap.get(hour));
      const totals = running.get(entry.id);
      totals.qsos += qsos;
      totals.points += points;
      const slotMetrics = slotById.get(entry.id);
      const shareBasis = slotMetrics?.pointTotal > 0 ? 'effective-points' : 'qsos';
      const denominator = shareBasis === 'effective-points' ? slotMetrics?.pointTotal : slotMetrics?.qsoTotal;
      const numerator = shareBasis === 'effective-points' ? totals.points : totals.qsos;
      const scoreProgress = Number.isFinite(slotMetrics?.score) && Number.isFinite(denominator) && denominator > 0
        ? slotMetrics.score * Math.min(1, Math.max(0, numerator / denominator))
        : null;
      bySlot[entry.id] = {
        qsos,
        points,
        cumulativeQsos: totals.qsos,
        cumulativePoints: totals.points,
        scoreProgress: scoreProgress == null ? null : Math.round(scoreProgress),
        scoreProgressKind: scoreProgress == null ? 'unavailable' : 'inference',
        scoreProgressBasis: scoreProgress == null ? 'unavailable' : shareBasis
      };
    });
    rows.push({
      hour,
      startTs: hour * 3600000,
      endTs: (hour + 1) * 3600000 - 1,
      bySlot
    });
  }
  return { rows, totalEligible, truncated: totalEligible > rows.length };
}

function buildCompatibility(entries, timeline) {
  const contests = new Set(entries.map((entry) => String(entry.derived.contestMeta?.contestId || '').trim()).filter(Boolean));
  const ranges = entries.map((entry) => normalizeTimeRange(entry.derived.timeRange)).filter(Boolean);
  const overlapStart = ranges.length ? Math.max(...ranges.map((range) => range.minTs)) : null;
  const overlapEnd = ranges.length ? Math.min(...ranges.map((range) => range.maxTs)) : null;
  const hasOverlap = Number.isFinite(overlapStart) && Number.isFinite(overlapEnd) && overlapStart <= overlapEnd;
  const sameContest = contests.size <= 1;
  const warnings = [];
  if (!sameContest) warnings.push('Loaded logs identify different contests; time-based conclusions are suppressed.');
  if (!hasOverlap) warnings.push('Loaded logs do not overlap in UTC; time-based conclusions are suppressed.');
  if (!timeline.length) warnings.push('No UTC-hour summaries are available.');
  return {
    sameContest,
    hasOverlap,
    timelineComparable: sameContest && hasOverlap && timeline.length > 0,
    warnings
  };
}

function addScoreGap(out, subject, target, scoreMode) {
  if (!Number.isFinite(subject.score) || !Number.isFinite(target.score)) return;
  const gap = target.score - subject.score;
  if (gap <= 0) return;
  const pct = target.score > 0 ? gap / target.score : 0;
  out.push(makeInsight({
    id: `score-${subject.id}-vs-${target.id}-${scoreMode}`,
    category: 'score-gap',
    kind: 'fact',
    severity: severityFromRatio(pct),
    impact: 1000 + pct * 100,
    subject,
    target,
    title: `${subject.label} trails ${target.label} by ${formatInteger(gap)} ${scoreMode === 'logged' ? 'points' : 'score'}`,
    why: `The selected ${scoreMode} total is ${formatInteger(subject.score)} versus ${formatInteger(target.score)}.`,
    targetReport: scoreMode === 'computed' ? 'summary' : 'main'
  }));
}

function addLargestHourGaps(out, timeline, subject, target, comparable) {
  if (!comparable) return;
  let rateBest = null;
  let pointBest = null;
  timeline.forEach((bucket) => {
    const a = bucket.bySlot[subject.id] || { qsos: 0, points: 0 };
    const b = bucket.bySlot[target.id] || { qsos: 0, points: 0 };
    const qsoGap = b.qsos - a.qsos;
    const pointGap = b.points - a.points;
    if (qsoGap > 0 && (!rateBest || qsoGap > rateBest.gap || (qsoGap === rateBest.gap && bucket.startTs < rateBest.bucket.startTs))) {
      rateBest = { bucket, gap: qsoGap, subjectValue: a.qsos, targetValue: b.qsos };
    }
    if (pointGap > 0 && (!pointBest || pointGap > pointBest.gap || (pointGap === pointBest.gap && bucket.startTs < pointBest.bucket.startTs))) {
      pointBest = { bucket, gap: pointGap, subjectValue: a.points, targetValue: b.points };
    }
  });
  if (rateBest) {
    out.push(makeInsight({
      id: `rate-${subject.id}-vs-${target.id}-${rateBest.bucket.hour}`,
      category: 'lost-rate',
      kind: 'fact',
      severity: severityFromRatio(rateBest.gap / Math.max(1, rateBest.targetValue)),
      impact: 700 + rateBest.gap,
      subject,
      target,
      title: `${formatUtcHour(rateBest.bucket.startTs)} was ${subject.label}'s largest rate gap`,
      why: `${target.label} logged ${formatInteger(rateBest.targetValue)} QSOs versus ${formatInteger(rateBest.subjectValue)}, a gap of ${formatInteger(rateBest.gap)}.`,
      targetReport: 'qs_by_minute',
      drilldownFilters: hourFilter(rateBest.bucket)
    }));
  }
  if (pointBest) {
    out.push(makeInsight({
      id: `points-${subject.id}-vs-${target.id}-${pointBest.bucket.hour}`,
      category: 'points-hour',
      kind: 'fact',
      severity: severityFromRatio(pointBest.gap / Math.max(1, pointBest.targetValue)),
      impact: 650 + pointBest.gap / 10,
      subject,
      target,
      title: `${formatUtcHour(pointBest.bucket.startTs)} had the largest points gap`,
      why: `${target.label} earned ${formatInteger(pointBest.targetValue)} effective points versus ${formatInteger(pointBest.subjectValue)}.`,
      targetReport: 'points_by_minute',
      drilldownFilters: hourFilter(pointBest.bucket)
    }));
  }
}

function addWeakBand(out, subjectEntry, targetEntry, subject, target) {
  const subjectBands = bandSummaryMap(subjectEntry.derived.bandModeSummary);
  const targetBands = bandSummaryMap(targetEntry.derived.bandModeSummary);
  let best = null;
  targetBands.forEach((targetBand, band) => {
    const subjectBand = subjectBands.get(band) || { qsos: 0, points: 0 };
    const pointGap = targetBand.points - subjectBand.points;
    const qsoGap = targetBand.qsos - subjectBand.qsos;
    if (pointGap <= 0 && qsoGap <= 0) return;
    const impact = Math.max(0, pointGap) + Math.max(0, qsoGap) * 2;
    if (!best || impact > best.impact || (impact === best.impact && band < best.band)) {
      best = { band, targetBand, subjectBand, pointGap, qsoGap, impact };
    }
  });
  if (!best) return;
  const referenceSize = Math.max(best.targetBand.points, best.targetBand.qsos, 1);
  out.push(makeInsight({
    id: `band-${subject.id}-vs-${target.id}-${stableToken(best.band)}`,
    category: 'weak-band',
    kind: 'fact',
    severity: severityFromRatio(Math.max(best.pointGap, best.qsoGap) / referenceSize),
    impact: 500 + best.impact / 10,
    subject,
    target,
    title: `${best.band} is ${subject.label}'s largest band deficit`,
    why: `${formatInteger(Math.max(0, best.pointGap))} fewer effective points and ${formatInteger(Math.max(0, best.qsoGap))} fewer QSOs than ${target.label}.`,
    targetReport: 'charts_qs_by_band',
    drilldownFilters: { bandFilter: best.band }
  }));
}

function addBreakGap(out, subjectEntry, targetEntry, subject, target, threshold, comparable) {
  if (!comparable) return;
  const subjectBreaks = Array.isArray(subjectEntry.derived.breakSummary?.breaks) ? subjectEntry.derived.breakSummary.breaks : [];
  const targetMinutePrefix = buildMinutePrefix(targetEntry.derived.minuteSeries);
  let best = null;
  subjectBreaks.forEach((entry) => {
    const minutes = numberOrZero(entry?.minutes);
    const startMinute = Number(entry?.start);
    const endMinute = Number(entry?.end);
    if (minutes < threshold || !Number.isFinite(startMinute) || !Number.isFinite(endMinute)) return;
    const targetQsos = sumMinutePrefixRange(targetMinutePrefix, startMinute, endMinute);
    if (targetQsos <= 0) return;
    const impact = targetQsos + minutes / 60;
    if (!best || impact > best.impact || (impact === best.impact && startMinute < best.startMinute)) {
      best = { minutes, startMinute, endMinute, targetQsos, impact };
    }
  });
  if (!best) return;
  out.push(makeInsight({
    id: `break-${subject.id}-vs-${target.id}-${best.startMinute}`,
    category: 'unusual-break',
    kind: 'inference',
    severity: severityFromRatio(best.targetQsos / Math.max(1, target.qsoTotal)),
    impact: 450 + best.impact,
    subject,
    target,
    title: `${subject.label} was off while ${target.label} stayed active`,
    why: `During a ${formatInteger(best.minutes)}-minute break, ${target.label} logged about ${formatInteger(best.targetQsos)} QSOs. The overlap suggests a reviewable opportunity, not guaranteed lost QSOs.`,
    targetReport: 'breaks',
    drilldownFilters: {
      timeRange: { startTs: best.startMinute * 60000, endTs: (best.endMinute + 1) * 60000 - 1 }
    }
  }));
}

function addStyleGap(out, subjectEntry, targetEntry, subject, target) {
  const a = subjectEntry.derived.operatingStyle?.totals;
  const b = targetEntry.derived.operatingStyle?.totals;
  if (!a || !b) return;
  const metrics = [
    { role: 'RUN', key: 'runQsos' },
    { role: 'S&P', key: 'spQsos' },
    { role: 'INBAND', key: 'inbandQsos' }
  ];
  let best = null;
  metrics.forEach((metric) => {
    const gap = numberOrZero(b[metric.key]) - numberOrZero(a[metric.key]);
    if (gap <= 0) return;
    if (!best || gap > best.gap || (gap === best.gap && metric.role < best.role)) best = { ...metric, gap };
  });
  if (!best) return;
  out.push(makeInsight({
    id: `style-${subject.id}-vs-${target.id}-${stableToken(best.role)}`,
    category: 'style-gap',
    kind: 'inference',
    severity: severityFromRatio(best.gap / Math.max(1, numberOrZero(b[best.key]))),
    impact: 350 + best.gap,
    subject,
    target,
    title: `${subject.label} logged fewer inferred ${best.role} QSOs`,
    why: `The existing operating-style heuristic classified ${formatInteger(best.gap)} more ${best.role} QSOs for ${target.label}.`,
    targetReport: 'run_sp_inband',
    drilldownFilters: { operatingStyleFilter: { band: 'ALL', role: best.role === 'S&P' ? 'SP' : best.role } }
  }));
}

function addMissedMultiplierInference(out, subjectEntry, targetEntry, subject, target) {
  const types = [
    { category: 'country', field: 'countrySummary', key: 'country', report: 'countries' },
    { category: 'cq-zone', field: 'cqZoneSummary', key: 'cqZone', report: 'zones_cq' },
    { category: 'itu-zone', field: 'ituZoneSummary', key: 'ituZone', report: 'zones_itu' },
    { category: 'prefix', field: 'prefixSummary', key: 'prefix', report: 'prefixes' }
  ];
  let best = null;
  types.forEach((type) => {
    const subjectValues = summaryValueSet(subjectEntry.derived[type.field], type.key);
    const missing = (Array.isArray(targetEntry.derived[type.field]) ? targetEntry.derived[type.field] : [])
      .map((row) => ({ value: row?.[type.key], weight: numberOrZero(row?.qsos) }))
      .filter((row) => row.value !== '' && row.value != null && !subjectValues.has(String(row.value)))
      .sort((a, b) => b.weight - a.weight || String(a.value).localeCompare(String(b.value)));
    if (!missing.length) return;
    const candidate = { ...type, missing, weight: missing.reduce((sum, row) => sum + row.weight, 0) };
    if (!best || candidate.missing.length > best.missing.length || (candidate.missing.length === best.missing.length && candidate.category < best.category)) best = candidate;
  });
  if (!best) return;
  const examples = best.missing.slice(0, 3).map((row) => String(row.value));
  out.push(makeInsight({
    id: `potential-mult-${subject.id}-vs-${target.id}-${stableToken(best.category)}`,
    category: 'potential-missed-multiplier',
    kind: 'inference',
    severity: best.missing.length >= 5 ? 'high' : (best.missing.length >= 2 ? 'medium' : 'low'),
    impact: 300 + Math.min(best.missing.length, 50),
    subject,
    target,
    title: `${target.label} worked ${best.missing.length} additional ${best.category} values`,
    why: `${examples.join(', ')}${best.missing.length > examples.length ? ', …' : ''} appear in the reference summary but not ${subject.label}. These are leads only; SH6 has not verified that they earned multiplier credit under this contest's rules.`,
    targetReport: best.report,
    drilldownFilters: null,
    evidence: { summaryType: best.category, candidateCount: best.missing.length, examples }
  }));
}

function makeInsight(input) {
  return {
    id: input.id,
    category: input.category,
    kind: input.kind,
    severity: input.severity,
    impact: roundImpact(input.impact),
    subjectSlotId: input.subject.id,
    referenceSlotId: input.target.id,
    title: input.title,
    why: input.why,
    targetReport: input.targetReport,
    drilldownFilters: input.drilldownFilters || null,
    evidence: input.evidence || null
  };
}

function rankAndBoundInsights(candidates, maxInsights) {
  const categoryCounts = new Map();
  return candidates
    .slice()
    .sort((a, b) => b.impact - a.impact || a.category.localeCompare(b.category) || a.id.localeCompare(b.id))
    .filter((entry) => {
      const count = categoryCounts.get(entry.category) || 0;
      if (count >= 2) return false;
      categoryCounts.set(entry.category, count + 1);
      return true;
    })
    .slice(0, maxInsights);
}

function resolveScore(derived, mode) {
  const scoring = derived.scoring || {};
  if (mode === 'claimed') {
    const value = parseScore(derived.contestMeta?.claimedScore ?? scoring.claimedScoreHeader);
    return { value, provenance: value == null ? 'unavailable' : 'claimed' };
  }
  if (mode === 'logged') {
    const value = firstFinite(scoring.loggedPointsTotal, derived.effectivePointsTotal, derived.totalPoints);
    return { value, provenance: value == null ? 'unavailable' : 'logged-points' };
  }
  const value = finiteOrNull(scoring.computedScore);
  return { value, provenance: value == null ? 'unavailable' : 'computed' };
}

function bandSummaryMap(rows) {
  const map = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const band = String(row?.band || '').trim().toUpperCase();
    if (!band) return;
    map.set(band, { qsos: numberOrZero(row?.all ?? row?.qsos), points: numberOrZero(row?.points) });
  });
  return map;
}

function summaryValueSet(rows, key) {
  return new Set((Array.isArray(rows) ? rows : [])
    .map((row) => row?.[key])
    .filter((value) => value !== '' && value != null)
    .map(String));
}

function seriesMap(rows, keyField, valueField) {
  const map = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const key = Number(row?.[keyField]);
    const value = Number(row?.[valueField]);
    if (!Number.isFinite(key) || !Number.isFinite(value)) return;
    map.set(key, (map.get(key) || 0) + value);
  });
  return map;
}

function buildMinutePrefix(rows) {
  const points = Array.from(seriesMap(rows, 'minute', 'qsos').entries())
    .sort((a, b) => a[0] - b[0]);
  let cumulative = 0;
  return points.map(([minute, qsos]) => {
    cumulative += numberOrZero(qsos);
    return { minute, cumulative };
  });
}

function sumMinutePrefixRange(prefix, startMinute, endMinute) {
  if (!Array.isArray(prefix) || !prefix.length) return 0;
  const upperBound = (value) => {
    let low = 0;
    let high = prefix.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (prefix[middle].minute <= value) low = middle + 1;
      else high = middle;
    }
    return low;
  };
  const rightIndex = upperBound(endMinute) - 1;
  if (rightIndex < 0) return 0;
  const leftIndex = upperBound(startMinute - 1) - 1;
  const right = prefix[rightIndex]?.cumulative || 0;
  const left = leftIndex >= 0 ? (prefix[leftIndex]?.cumulative || 0) : 0;
  return Math.max(0, right - left);
}

function sumSeries(rows, field) {
  return (Array.isArray(rows) ? rows : []).reduce((sum, row) => sum + numberOrZero(row?.[field]), 0);
}

function normalizeTimeRange(range) {
  const minTs = Number(range?.minTs);
  const maxTs = Number(range?.maxTs);
  return Number.isFinite(minTs) && Number.isFinite(maxTs) && minTs <= maxTs ? { minTs, maxTs } : null;
}

function normalizeFilterTimeRange(range) {
  const startTs = Number(range?.startTs);
  const endTs = Number(range?.endTs);
  return Number.isFinite(startTs) && Number.isFinite(endTs) && startTs <= endTs ? { startTs, endTs } : null;
}

function hourFilter(bucket) {
  return { timeRange: { startTs: bucket.startTs, endTs: bucket.endTs } };
}

function normalizeScoreMode(mode) {
  const value = String(mode || '').trim().toLowerCase();
  if (value === 'claimed' || value === 'logged') return value;
  return 'computed';
}

function parseScore(value) {
  if (Number.isFinite(Number(value)) && String(value).trim() !== '') return Number(value);
  const cleaned = String(value ?? '').replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return cleaned && Number.isFinite(parsed) ? parsed : null;
}

function firstFinite(...values) {
  for (const value of values) {
    const finite = finiteOrNull(value);
    if (finite != null) return finite;
  }
  return null;
}

function finiteOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clampInteger(value, min, max, fallback) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function severityFromRatio(ratio) {
  const value = Number(ratio) || 0;
  if (value >= 0.3) return 'high';
  if (value >= 0.12) return 'medium';
  return 'low';
}

function roundImpact(value) {
  return Math.round((Number(value) || 0) * 1000) / 1000;
}

function stableToken(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
}

function formatInteger(value) {
  return Math.round(Number(value) || 0).toLocaleString('en-US');
}

function formatUtcHour(ts) {
  const date = new Date(ts);
  if (!Number.isFinite(date.getTime())) return 'Unknown UTC hour';
  return `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 13)}:00 UTC`;
}
