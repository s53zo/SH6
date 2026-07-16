const DEFAULT_WINDOW_MINUTES = 15;
const ALLOWED_WINDOWS = new Set([5, 10, 15, 30, 60]);

function normalizeCall(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
}

function creditKey(row) {
  return [row?.group || '', row?.countingScope || '', row?.scopeKey || 'ALL', row?.entityKey || ''].join('|');
}

function finiteTimestamp(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeMode(value) {
  const mode = String(value || '').toUpperCase();
  if (mode === 'PH' || mode === 'PHONE' || mode === 'USB' || mode === 'LSB') return 'SSB';
  if (mode === 'RY' || mode === 'RTTY' || mode === 'DIGI' || mode === 'DIG') return 'DIG';
  return mode;
}

function eventFitsCandidate(event, candidate) {
  const ts = finiteTimestamp(event?.ts ?? event?.timestamp);
  if (ts == null) return false;
  if (Number.isFinite(candidate.contestStartTs) && ts < candidate.contestStartTs) return false;
  if (Number.isFinite(candidate.contestEndTs) && ts > candidate.contestEndTs) return false;
  const band = String(event?.band || '').toUpperCase();
  if (candidate.band && candidate.band !== 'UNKNOWN' && band && band !== candidate.band) return false;
  if (candidate.countingScope === 'per_mode' || candidate.countingScope === 'per_band_per_mode') {
    const mode = normalizeMode(event?.mode || event?.txMode);
    if (mode && candidate.mode && mode !== candidate.mode) return false;
  }
  return true;
}

function nearestActivity(qsos, ts, band, windowMs) {
  let before = null;
  let after = null;
  let sameBand = false;
  let anyBand = false;
  for (const qso of qsos) {
    const qsoTs = finiteTimestamp(qso?.ts ?? qso?.timestamp);
    if (qsoTs == null) continue;
    const delta = qsoTs - ts;
    if (delta <= 0 && (!before || qsoTs > before.ts)) before = { ts: qsoTs, band: String(qso?.band || '').toUpperCase(), call: qso?.call || '' };
    if (delta >= 0 && (!after || qsoTs < after.ts)) after = { ts: qsoTs, band: String(qso?.band || '').toUpperCase(), call: qso?.call || '' };
    if (Math.abs(delta) <= windowMs) {
      anyBand = true;
      if (!band || String(qso?.band || '').toUpperCase() === band) sameBand = true;
    }
  }
  const distances = [before, after].filter(Boolean).map((row) => Math.abs(row.ts - ts));
  const closestMs = distances.length ? Math.min(...distances) : null;
  return { before, after, closestMs, anyBand, sameBand, inBreak: !anyBand };
}

function evidenceSourceLabel(hasRbn, hasCluster) {
  if (hasRbn && hasCluster) return 'RBN + cluster';
  if (hasRbn) return 'RBN';
  if (hasCluster) return 'Cluster';
  return 'None';
}

function classifyConfidence(factors) {
  if (factors.distinctRbnSkimmers >= 2 && factors.sameBandActivity) return 'High';
  if ((factors.distinctRbnSkimmers >= 1 || factors.distinctClusterSpotters >= 2) && factors.referenceActive) return 'Medium';
  if (factors.qualifyingEvidence > 0) return 'Low';
  return 'No evidence';
}

function confidenceExplanation(factors) {
  if (factors.confidence === 'High') return 'At least two same-continent RBN skimmers heard the candidate while the reference was active on the candidate band.';
  if (factors.confidence === 'Medium') return 'Same-continent reception or repeated cluster evidence overlaps reference-station activity.';
  if (factors.confidence === 'Low') return 'Same-continent evidence exists, but reference activity or band alignment is weak.';
  return 'A comparison log credited this multiplier, but no qualifying same-continent reception evidence was found.';
}

function comparisonCompatibility(reference, comparison) {
  const a = reference?.scoring?.multiplierPerspective;
  const b = comparison?.scoring?.multiplierPerspective;
  if (!a || !b) return { compatible: false, reason: 'Multiplier perspective metadata is unavailable.' };
  if (String(reference?.scoring?.ruleId || '') !== String(comparison?.scoring?.ruleId || '')) {
    return { compatible: false, reason: 'The logs use different scoring rules.' };
  }
  if (a.compatibilityKey !== b.compatibilityKey) {
    return { compatible: false, reason: 'The logs use incompatible multiplier scopes or station-dependent perspectives.' };
  }
  return { compatible: true, reason: '' };
}

export function buildMultiplierOpportunities(options = {}) {
  const slots = Array.isArray(options.slots) ? options.slots.filter(Boolean) : [];
  const reference = slots.find((slot) => slot.id === options.referenceSlotId) || slots[0] || null;
  const windowMinutes = ALLOWED_WINDOWS.has(Number(options.correlationWindowMinutes))
    ? Number(options.correlationWindowMinutes)
    : DEFAULT_WINDOW_MINUTES;
  if (!reference) return { supported: false, reason: 'No reference log is loaded.', candidates: [], compatibility: [] };
  if (!reference.scoring?.multiplierModelSupported) {
    return { supported: false, reason: 'This contest has no implemented multiplier model.', referenceSlotId: reference.id, candidates: [], compatibility: [] };
  }

  const compatibility = slots.filter((slot) => slot !== reference).map((slot) => ({
    slotId: slot.id,
    ...comparisonCompatibility(reference, slot)
  }));
  const compatibleIds = new Set(compatibility.filter((row) => row.compatible).map((row) => row.slotId));
  const selectedComparisonIds = new Set(Array.isArray(options.comparisonSlotIds) && options.comparisonSlotIds.length
    ? options.comparisonSlotIds
    : Array.from(compatibleIds));
  const comparisons = slots.filter((slot) => compatibleIds.has(slot.id) && selectedComparisonIds.has(slot.id));
  const referenceCredits = new Map((reference.scoring.multiplierCredits || []).map((row) => [creditKey(row), row]));
  const candidates = new Map();
  const contestStartTs = finiteTimestamp(options.contestStartTs);
  const contestEndTs = finiteTimestamp(options.contestEndTs);

  for (const slot of comparisons) {
    for (const credit of (slot.scoring?.multiplierCredits || [])) {
      const key = creditKey(credit);
      if (referenceCredits.has(key)) continue;
      let candidate = candidates.get(key);
      if (!candidate) {
        candidate = {
          key, group: credit.group, entityKey: credit.entityKey, entityLabel: credit.entityLabel,
          countingScope: credit.countingScope, scopeKey: credit.scopeKey || 'ALL',
          band: String(credit.band || 'UNKNOWN').toUpperCase(), mode: normalizeMode(credit.mode),
          rawValue: Number(credit.rawCredit || 1), weightedValue: Number(credit.weightedCredit || credit.rawCredit || 1),
          creditedSlots: [], representativeCallsigns: [], comparisonCredits: [], rejectedCredits: [], evidence: [],
          contestStartTs, contestEndTs
        };
        candidates.set(key, candidate);
      }
      if (!candidate.creditedSlots.includes(slot.id)) candidate.creditedSlots.push(slot.id);
      const call = normalizeCall(credit.callsign);
      if (call && !candidate.representativeCallsigns.includes(call)) candidate.representativeCallsigns.push(call);
      candidate.comparisonCredits.push({ ...credit, slotId: slot.id });
    }
  }

  for (const rejection of (reference.scoring.multiplierRejections || [])) {
    const key = creditKey(rejection);
    if (referenceCredits.has(key)) continue;
    let candidate = candidates.get(key);
    if (!candidate) {
      candidate = {
        key, group: rejection.group, entityKey: rejection.entityKey, entityLabel: rejection.entityLabel,
        countingScope: rejection.countingScope, scopeKey: rejection.scopeKey || 'ALL',
        band: String(rejection.band || 'UNKNOWN').toUpperCase(), mode: normalizeMode(rejection.mode),
        rawValue: 1, weightedValue: 1, creditedSlots: [], representativeCallsigns: [], comparisonCredits: [], rejectedCredits: [], evidence: [],
        contestStartTs, contestEndTs
      };
      candidates.set(key, candidate);
    }
    const call = normalizeCall(rejection.callsign);
    if (call && !candidate.representativeCallsigns.includes(call)) candidate.representativeCallsigns.push(call);
    candidate.rejectedCredits.push(rejection);
  }

  for (const event of (Array.isArray(options.clusterSpots) ? options.clusterSpots : [])) {
    const ts = finiteTimestamp(event?.ts ?? event?.timestamp);
    if (ts == null || (contestStartTs != null && ts < contestStartTs) || (contestEndTs != null && ts > contestEndTs)) continue;
    for (const entity of (event?.multiplierEntities || [])) {
      const key = String(entity?.key || '');
      if (!key || referenceCredits.has(key)) continue;
      let candidate = candidates.get(key);
      if (!candidate) {
        candidate = {
          key, group: entity.group, entityKey: entity.entityKey, entityLabel: entity.entityLabel,
          countingScope: entity.countingScope, scopeKey: entity.scopeKey || 'ALL',
          band: String(entity.band || event.band || 'UNKNOWN').toUpperCase(), mode: normalizeMode(entity.mode || event.mode),
          rawValue: Number(entity.rawValue || 1), weightedValue: Number(entity.weightedValue || entity.rawValue || 1),
          creditedSlots: [], representativeCallsigns: [], comparisonCredits: [], rejectedCredits: [], evidence: [],
          contestStartTs, contestEndTs, spottedOnly: true
        };
        candidates.set(key, candidate);
      }
      const call = normalizeCall(event?.dxCall || event?.call);
      if (call && !candidate.representativeCallsigns.includes(call)) candidate.representativeCallsigns.push(call);
    }
  }

  const candidateKeysByCall = new Map();
  for (const candidate of candidates.values()) {
    for (const call of candidate.representativeCallsigns) {
      const keys = candidateKeysByCall.get(call) || [];
      keys.push(candidate.key);
      candidateKeysByCall.set(call, keys);
    }
  }
  const referenceContinent = String(reference.stationContinent || '').toUpperCase();
  const resolveContinent = typeof options.resolveContinent === 'function' ? options.resolveContinent : () => '';
  const sources = [
    ['cluster', Array.isArray(options.clusterSpots) ? options.clusterSpots : []],
    ['rbn', Array.isArray(options.rbnSpots) ? options.rbnSpots : []]
  ];
  for (const [source, events] of sources) {
    for (const event of events) {
      const call = normalizeCall(event?.dxCall || event?.call);
      const keys = candidateKeysByCall.get(call);
      if (!keys) continue;
      const receiverCall = normalizeCall(event?.spotter || event?.skimmer);
      const receiverContinent = String(event?.spotterContinent || event?.skimmerContinent || resolveContinent(receiverCall) || '').toUpperCase();
      if (!referenceContinent || receiverContinent !== referenceContinent) continue;
      for (const key of keys) {
        const candidate = candidates.get(key);
        if (!eventFitsCandidate(event, candidate)) continue;
        const ts = finiteTimestamp(event?.ts ?? event?.timestamp);
        candidate.evidence.push({ ...event, source, dxCall: call, receiverCall, receiverContinent, ts });
      }
    }
  }

  const referenceQsos = (reference.qsos || []).filter((qso) => !qso?.isQtc).slice().sort((a, b) => Number(a.ts) - Number(b.ts));
  const windowMs = windowMinutes * 60000;
  const outputCandidates = Array.from(candidates.values()).map((candidate) => {
    const rbnSkimmers = new Set();
    const clusterSpotters = new Set();
    let referenceActive = false;
    let sameBandActivity = false;
    const evidence = candidate.evidence.map((event) => {
      const activity = nearestActivity(referenceQsos, event.ts, String(event.band || candidate.band).toUpperCase(), windowMs);
      referenceActive ||= activity.anyBand;
      sameBandActivity ||= activity.sameBand;
      if (event.source === 'rbn') rbnSkimmers.add(event.receiverCall);
      else clusterSpotters.add(event.receiverCall);
      return { ...event, referenceActivity: activity };
    }).sort((a, b) => a.ts - b.ts);
    const factors = {
      qualifyingEvidence: evidence.length,
      distinctRbnSkimmers: rbnSkimmers.size,
      distinctClusterSpotters: clusterSpotters.size,
      referenceActive,
      sameBandActivity
    };
    factors.confidence = classifyConfidence(factors);
    return {
      ...candidate,
      evidence,
      firstEvidenceTs: evidence[0]?.ts ?? null,
      lastEvidenceTs: evidence[evidence.length - 1]?.ts ?? null,
      strongestEvidenceSource: evidenceSourceLabel(rbnSkimmers.size > 0, clusterSpotters.size > 0),
      factors,
      confidence: factors.confidence,
      status: candidate.rejectedCredits.length && !candidate.creditedSlots.length
        ? 'Rejected credit'
        : (candidate.creditedSlots.length
          ? 'Unique to comparison log'
          : (factors.confidence === 'Low' ? 'Weak opportunity' : (factors.confidence === 'No evidence' ? 'No supporting evidence' : 'Plausible opportunity'))),
      explanation: confidenceExplanation(factors)
    };
  });

  const confidenceCounts = { High: 0, Medium: 0, Low: 0, 'No evidence': 0 };
  outputCandidates.forEach((row) => { confidenceCounts[row.confidence] += 1; });
  const rawGap = comparisons.length
    ? Math.max(...comparisons.map((slot) => Number(slot.scoring?.computedRawMultiplierTotal || 0))) - Number(reference.scoring?.computedRawMultiplierTotal || 0)
    : 0;
  const weightedGap = comparisons.length
    ? Math.max(...comparisons.map((slot) => Number(slot.scoring?.computedMultiplierTotal || 0))) - Number(reference.scoring?.computedMultiplierTotal || 0)
    : 0;
  const comparisonLeader = comparisons.slice().sort((a, b) => Number(b.scoring?.computedMultiplierTotal || 0) - Number(a.scoring?.computedMultiplierTotal || 0))[0] || null;
  const aggregateCredits = (credits) => {
    const map = new Map();
    (credits || []).forEach((credit) => {
      const key = `${credit.band || 'UNKNOWN'}|${credit.mode || 'ALL'}`;
      const row = map.get(key) || { band: credit.band || 'UNKNOWN', mode: credit.mode || 'ALL', raw: 0, weighted: 0 };
      row.raw += Number(credit.rawCredit || 0);
      row.weighted += Number(credit.weightedCredit || credit.rawCredit || 0);
      map.set(key, row);
    });
    return map;
  };
  const referenceByBandMode = aggregateCredits(reference.scoring?.multiplierCredits);
  const leaderByBandMode = aggregateCredits(comparisonLeader?.scoring?.multiplierCredits);
  const bandModeGaps = Array.from(new Set([...referenceByBandMode.keys(), ...leaderByBandMode.keys()])).map((key) => {
    const ref = referenceByBandMode.get(key) || { band: key.split('|')[0], mode: key.split('|')[1], raw: 0, weighted: 0 };
    const leader = leaderByBandMode.get(key) || { band: ref.band, mode: ref.mode, raw: 0, weighted: 0 };
    return {
      band: leader.band,
      mode: leader.mode,
      referenceRaw: ref.raw,
      referenceWeighted: ref.weighted,
      leaderRaw: leader.raw,
      leaderWeighted: leader.weighted,
      rawGap: leader.raw - ref.raw,
      weightedGap: leader.weighted - ref.weighted
    };
  }).sort((a, b) => a.band.localeCompare(b.band) || a.mode.localeCompare(b.mode));
  bandModeGaps.forEach((gap) => {
    const activity = referenceQsos.filter((qso) => String(qso?.band || '').toUpperCase() === gap.band && (!gap.mode || gap.mode === 'ALL' || normalizeMode(qso?.mode) === gap.mode));
    const times = activity.map((qso) => finiteTimestamp(qso?.ts)).filter((ts) => ts != null);
    const scopedCandidates = outputCandidates.filter((candidate) => candidate.band === gap.band && (!gap.mode || gap.mode === 'ALL' || candidate.mode === gap.mode));
    gap.referenceQsos = activity.length;
    gap.operatingHours = times.length > 1 ? (Math.max(...times) - Math.min(...times)) / 3600000 : 0;
    gap.sameBandEvidence = scopedCandidates.reduce((sum, candidate) => sum + candidate.evidence.filter((event) => event.referenceActivity?.sameBand).length, 0);
    gap.strongestOpportunity = scopedCandidates.slice().sort((a, b) => {
      const rank = { High: 3, Medium: 2, Low: 1, 'No evidence': 0 };
      return (rank[b.confidence] - rank[a.confidence]) || b.weightedValue - a.weightedValue;
    })[0]?.entityLabel || '';
  });
  const timelineSlots = [reference, ...comparisons];
  const timelineHours = new Set();
  const creditsBySlotHour = new Map();
  timelineSlots.forEach((slot) => {
    const byHour = new Map();
    (slot.scoring?.multiplierCredits || []).forEach((credit) => {
      const ts = finiteTimestamp(credit.timestamp);
      if (ts == null) return;
      const hourTs = Math.floor(ts / 3600000) * 3600000;
      timelineHours.add(hourTs);
      const row = byHour.get(hourTs) || { raw: 0, weighted: 0 };
      row.raw += Number(credit.rawCredit || 0);
      row.weighted += Number(credit.weightedCredit || credit.rawCredit || 0);
      byHour.set(hourTs, row);
    });
    creditsBySlotHour.set(slot.id, byHour);
  });
  const cumulative = new Map(timelineSlots.map((slot) => [slot.id, { raw: 0, weighted: 0 }]));
  const creditTimeline = Array.from(timelineHours).sort((a, b) => a - b).map((hourTs) => ({
    hourTs,
    slots: timelineSlots.map((slot) => {
      const running = cumulative.get(slot.id);
      const added = creditsBySlotHour.get(slot.id)?.get(hourTs) || { raw: 0, weighted: 0 };
      running.raw += added.raw;
      running.weighted += added.weighted;
      return { slotId: slot.id, callsign: slot.callsign || slot.id, raw: running.raw, weighted: running.weighted, newRaw: added.raw, newWeighted: added.weighted };
    })
  }));
  return {
    supported: true,
    referenceSlotId: reference.id,
    referenceCallsign: reference.callsign || reference.label || reference.id,
    referenceRawTotal: Number(reference.scoring?.computedRawMultiplierTotal || 0),
    referenceWeightedTotal: Number(reference.scoring?.computedMultiplierTotal || 0),
    ruleId: reference.scoring.ruleId,
    perspective: reference.scoring.multiplierPerspective,
    windowMinutes,
    compatibility,
    rawGap,
    weightedGap,
    comparisonLeaderSlotId: comparisonLeader?.id || '',
    comparisonLeaderCallsign: comparisonLeader?.callsign || comparisonLeader?.label || comparisonLeader?.id || '',
    comparisonLeaderRawTotal: Number(comparisonLeader?.scoring?.computedRawMultiplierTotal || 0),
    comparisonLeaderWeightedTotal: Number(comparisonLeader?.scoring?.computedMultiplierTotal || 0),
    bandModeGaps,
    creditTimeline,
    confidenceCounts,
    candidates: outputCandidates.sort((a, b) => b.weightedValue - a.weightedValue || a.entityLabel.localeCompare(b.entityLabel))
  };
}

function csvCell(value) {
  let text = value == null ? '' : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function rowsToSafeCsv(headers, rows) {
  const keys = headers.map((header) => typeof header === 'string' ? header : header.key);
  const labels = headers.map((header) => typeof header === 'string' ? header : header.label);
  return [labels.map(csvCell).join(','), ...rows.map((row) => keys.map((key) => csvCell(row?.[key])).join(','))].join('\r\n');
}

export const multiplierOpportunityInternals = {
  creditKey,
  classifyConfidence,
  comparisonCompatibility,
  nearestActivity
};
