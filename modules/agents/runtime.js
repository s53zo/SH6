const numberFormatter = new Intl.NumberFormat('en-US');

function formatNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? numberFormatter.format(Math.round(num)) : 'N/A';
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function scoreForSlot(slot) {
  if (!slot) return null;
  const scoring = slot.scoring || {};
  const computed = toNumber(scoring.computedScore);
  if (computed != null) return computed;
  const claimed = toNumber(scoring.claimedScoreHeader);
  if (claimed != null) return claimed;
  const effective = toNumber(slot.effectivePointsTotal);
  if (effective != null) return effective;
  return null;
}

function multiplierForSlot(slot) {
  return toNumber(slot?.scoring?.computedMultiplierTotal);
}

function qsoPointsForSlot(slot) {
  return toNumber(slot?.scoring?.computedQsoPointsTotal) ?? toNumber(slot?.effectivePointsTotal);
}

function confidenceRank(value) {
  switch (String(value || '').toLowerCase()) {
    case 'high': return 4;
    case 'medium': return 3;
    case 'low': return 2;
    case 'unknown': return 1;
    default: return 0;
  }
}

function levelRank(value) {
  switch (String(value || '').toLowerCase()) {
    case 'high': return 5;
    case 'medium': return 4;
    case 'opportunity': return 3;
    case 'info': return 2;
    default: return 1;
  }
}

function buildAction(label, reportId) {
  return {
    type: 'report',
    label,
    reportId
  };
}

function findWorstHour(series = []) {
  if (!Array.isArray(series) || !series.length) return null;
  return series.reduce((worst, entry) => {
    if (!worst) return entry;
    if ((entry.qsos || 0) < (worst.qsos || 0)) return entry;
    return worst;
  }, null);
}

function findBestHour(series = []) {
  if (!Array.isArray(series) || !series.length) return null;
  return series.reduce((best, entry) => {
    if (!best) return entry;
    if ((entry.qsos || 0) > (best.qsos || 0)) return entry;
    return best;
  }, null);
}

function classifyOperatingStyle(slot) {
  const entries = Array.isArray(slot?.frequencySummary) ? slot.frequencySummary : [];
  const total = entries.reduce((sum, entry) => sum + (Number(entry?.count) || 0), 0);
  if (!total || !entries.length) {
    return {
      label: 'Unknown',
      confidence: 'low',
      summary: 'Frequency clustering is unavailable for this log.'
    };
  }
  const top = entries
    .map((entry) => ({ freq: entry.freq, count: Number(entry.count) || 0 }))
    .sort((left, right) => right.count - left.count)[0];
  const share = top && total ? top.count / total : 0;
  if (share >= 0.22) {
    return {
      label: 'Run-heavy',
      confidence: share >= 0.32 ? 'high' : 'medium',
      summary: `${Math.round(share * 100)}% of QSOs cluster around one dominant frequency bucket.`
    };
  }
  if (share <= 0.12) {
    return {
      label: 'Search-and-pounce heavy',
      confidence: 'medium',
      summary: `No single frequency bucket dominates the log (${Math.round(share * 100)}% top share).`
    };
  }
  return {
    label: 'Balanced / mixed',
    confidence: 'medium',
    summary: `Frequency concentration is moderate (${Math.round(share * 100)}% top share).`
  };
}

function buildScoreAuditor(snapshot) {
  const slot = snapshot.primary;
  const scoring = slot?.scoring || {};
  const claimed = toNumber(scoring.claimedScoreHeader);
  const computed = toNumber(scoring.computedScore);
  const delta = toNumber(scoring.scoreDeltaAbs);
  const ruleName = scoring.ruleName || 'Unknown rules';
  const detection = scoring.detectionMethod || 'unknown';
  if (claimed == null && computed == null) {
    return {
      id: 'score-auditor',
      agent: 'Score Auditor',
      level: 'info',
      confidence: 'low',
      headline: 'Score comparison is not available yet',
      summary: 'SH6 needs a claimed or computed score before it can audit scoring differences.',
      evidence: [
        `Rule detection: ${ruleName}`,
        `Detection method: ${detection}`
      ],
      actions: [buildAction('Open Main', 'main'), buildAction('Open Summary', 'summary')],
      provenance: {
        freshness: 'session',
        official: Boolean(scoring.ruleReferenceUrl),
        source: ruleName
      }
    };
  }
  const aligned = delta === 0;
  return {
    id: 'score-auditor',
    agent: 'Score Auditor',
    level: aligned ? 'info' : (Math.abs(delta || 0) >= 1000 ? 'high' : 'medium'),
    confidence: scoring.confidence || 'unknown',
    headline: aligned
      ? 'Claimed and computed scores align'
      : `Claimed and computed scores differ by ${formatNumber(Math.abs(delta || 0))} points`,
    summary: aligned
      ? `SH6 resolved ${ruleName} and the computed score matches the claimed header.`
      : `SH6 resolved ${ruleName} via ${detection}. Audit this delta before publishing a postmortem or comparing against rivals.`,
    evidence: [
      `Claimed score: ${formatNumber(claimed)}`,
      `Computed score: ${formatNumber(computed)}`,
      `Computed QSO points: ${formatNumber(scoring.computedQsoPointsTotal)}`,
      `Computed multipliers: ${formatNumber(scoring.computedMultiplierTotal)}`
    ].concat(Array.isArray(scoring.assumptions) && scoring.assumptions.length ? [`Assumptions: ${scoring.assumptions.slice(0, 2).join(' | ')}`] : []),
    actions: [buildAction('Open Main', 'main'), buildAction('Open Summary', 'summary'), buildAction('Open Log', 'log')],
    provenance: {
      freshness: 'session',
      official: Boolean(scoring.ruleReferenceUrl),
      source: ruleName
    }
  };
}

function buildMultiplierHunter(snapshot) {
  const slot = snapshot.primary;
  const qsoPoints = qsoPointsForSlot(slot);
  const mults = multiplierForSlot(slot);
  const compareMults = (snapshot.compareSlots || [])
    .map((entry) => ({ label: entry.label, mults: multiplierForSlot(entry) }))
    .filter((entry) => entry.mults != null)
    .sort((left, right) => right.mults - left.mults);
  const bestRival = compareMults[0] || null;
  const extraMultGap = bestRival && mults != null ? Math.max(0, bestRival.mults - mults) : 0;
  const leverage = qsoPoints != null ? qsoPoints : null;
  const level = extraMultGap >= 3 ? 'high' : (extraMultGap > 0 || leverage != null ? 'opportunity' : 'info');
  const headline = leverage != null
    ? `Each additional multiplier is worth about ${formatNumber(leverage)} points`
    : 'Multiplier leverage is unavailable';
  const summary = extraMultGap > 0
    ? `${bestRival.label} is ahead by ${formatNumber(extraMultGap)} multipliers. Close the multiplier gap before chasing marginal rate gains.`
    : (leverage != null
      ? 'Open Spots and Countries next. At the current point total, one clean multiplier still moves the score materially.'
      : 'Load a scored log or rival comparison to quantify multiplier leverage.');
  const evidence = [
    `Current multipliers: ${formatNumber(mults)}`,
    `Current QSO-point leverage: ${formatNumber(leverage)}`
  ];
  if (bestRival) evidence.push(`${bestRival.label} multipliers: ${formatNumber(bestRival.mults)}`);
  return {
    id: 'multiplier-hunter',
    agent: 'Multiplier Hunter',
    level,
    confidence: leverage != null ? 'medium' : 'low',
    headline,
    summary,
    evidence,
    actions: [buildAction('Open Spots', 'spots'), buildAction('Open Countries', 'countries'), buildAction('Open Competitor coach', 'competitor_coach')],
    provenance: {
      freshness: 'session',
      official: Boolean(slot?.scoring?.ruleReferenceUrl),
      source: 'score leverage heuristic'
    }
  };
}

function buildRateCoach(snapshot) {
  const slot = snapshot.primary;
  const breakSummary = slot?.breakSummary || {};
  const breaks = Array.isArray(breakSummary.breaks) ? breakSummary.breaks : [];
  const longestBreak = breaks.slice().sort((left, right) => (right.minutes || 0) - (left.minutes || 0))[0] || null;
  const bestHour = findBestHour(slot?.hourSeries);
  const worstHour = findWorstHour(slot?.hourSeries);
  const totalBreakMin = Number(breakSummary.totalBreakMin || 0);
  return {
    id: 'rate-coach',
    agent: 'Rate Coach',
    level: totalBreakMin >= 90 || (longestBreak?.minutes || 0) >= 30 ? 'high' : (totalBreakMin > 0 ? 'medium' : 'opportunity'),
    confidence: Array.isArray(slot?.hourSeries) && slot.hourSeries.length ? 'high' : 'low',
    headline: totalBreakMin > 0
      ? `${formatNumber(totalBreakMin)} break minutes detected`
      : 'No major dead-time block detected',
    summary: totalBreakMin > 0
      ? `Longest break: ${formatNumber(longestBreak?.minutes || 0)} minutes. Compare the weakest hour against your strongest operating window next.`
      : 'Rate holds together well overall. Focus on maximizing the strongest hour pattern rather than repairing a major dead period.',
    evidence: [
      `Best hour: ${formatNumber(bestHour?.qsos || 0)} QSOs`,
      `Weakest hour: ${formatNumber(worstHour?.qsos || 0)} QSOs`,
      `Longest break: ${formatNumber(longestBreak?.minutes || 0)} minutes`
    ],
    actions: [buildAction('Open Rates', 'rates'), buildAction('Open Qs by hour', 'graphs_qs_by_hour'), buildAction('Open 1-minute rates', 'one_minute_rates')],
    provenance: {
      freshness: 'session',
      official: true,
      source: 'derived hour and break series'
    }
  };
}

function buildRivalScout(snapshot) {
  const primaryScore = scoreForSlot(snapshot.primary);
  const rivals = (snapshot.compareSlots || [])
    .map((entry) => ({
      label: entry.label,
      score: scoreForSlot(entry),
      mults: multiplierForSlot(entry),
      qsos: entry.qsoCount
    }))
    .filter((entry) => entry.score != null)
    .sort((left, right) => right.score - left.score);
  const bestRival = rivals[0] || null;
  const coachRival = snapshot.coach?.closestRivals?.[0] || null;
  if (!bestRival && !coachRival) {
    return {
      id: 'rival-scout',
      agent: 'Rival Scout',
      level: 'info',
      confidence: 'low',
      headline: 'No rival context is loaded yet',
      summary: 'Load compare logs or refresh Competitor coach to explain where nearby stations beat you.',
      evidence: ['Compare slots loaded: 0'],
      actions: [buildAction('Open Competitor coach', 'competitor_coach'), buildAction('Open Save&Load session', 'session')],
      provenance: {
        freshness: 'session',
        official: false,
        source: 'compare/coach context'
      }
    };
  }
  const gap = bestRival && primaryScore != null ? bestRival.score - primaryScore : null;
  const primaryLeads = Number.isFinite(gap) && gap <= 0;
  const gapValue = Number.isFinite(gap) ? Math.abs(gap) : null;
  const headline = bestRival
    ? (primaryLeads
        ? `Log A is ahead of ${bestRival.label} by ${formatNumber(gapValue)} points`
        : `${bestRival.label} is ahead by ${formatNumber(gapValue)} points`)
    : `Closest coach rival: ${coachRival.call || 'Unknown'}`;
  const summary = bestRival
    ? (primaryLeads
        ? `Protect the lead against ${bestRival.label}, then use compare reports to see where the margin is still fragile.`
        : `Inspect score, multiplier, and QSO deltas against ${bestRival.label} before making operating conclusions.`)
    : `Competitor coach suggests ${coachRival.call || 'a nearby rival'} as the next benchmark log.`;
  const evidence = [];
  if (bestRival) {
    evidence.push(`${bestRival.label} score: ${formatNumber(bestRival.score)}`);
    evidence.push(`${bestRival.label} multipliers: ${formatNumber(bestRival.mults)}`);
    evidence.push(`${bestRival.label} QSOs: ${formatNumber(bestRival.qsos)}`);
  }
  if (coachRival) {
    evidence.push(`Coach rival: ${coachRival.call || 'Unknown'} · score ${formatNumber(coachRival.scoreTotal)}`);
  }
  return {
    id: 'rival-scout',
    agent: 'Rival Scout',
    level: bestRival && gap > 0 ? 'high' : 'opportunity',
    confidence: bestRival ? 'high' : 'medium',
    headline,
    summary,
    evidence,
    actions: [buildAction('Open Competitor coach', 'competitor_coach'), buildAction('Open Summary', 'summary'), buildAction('Open Qs by hour', 'graphs_qs_by_hour')],
    provenance: {
      freshness: 'session',
      official: false,
      source: bestRival ? 'loaded compare logs' : 'competitor coach cohort'
    }
  };
}

function buildLogHygiene(snapshot) {
  const slot = snapshot.primary;
  const issues = (slot?.possibleErrors || []).length;
  const notInMaster = Number(slot?.notInMasterCount || 0);
  const dupes = Number(slot?.dupeCount || 0);
  return {
    id: 'log-hygiene',
    agent: 'Log Hygiene',
    level: issues >= 25 || notInMaster >= 10 ? 'high' : ((issues + notInMaster + dupes) > 0 ? 'medium' : 'info'),
    confidence: 'high',
    headline: `${formatNumber(issues)} possible errors, ${formatNumber(notInMaster)} not-in-master calls`,
    summary: (issues + notInMaster + dupes) > 0
      ? 'Clean these before treating scoring or rival gaps as pure operating problems.'
      : 'No major hygiene hotspot is visible from the derived error summaries.',
    evidence: [
      `Possible errors: ${formatNumber(issues)}`,
      `Not in master: ${formatNumber(notInMaster)}`,
      `Dupes flagged: ${formatNumber(dupes)}`
    ],
    actions: [buildAction('Open Possible errors', 'possible_errors'), buildAction('Open Not in master', 'not_in_master'), buildAction('Open Dupes', 'dupes')],
    provenance: {
      freshness: 'session',
      official: true,
      source: 'derived validation and master checks'
    }
  };
}

function buildArchiveMiner(snapshot) {
  const coach = snapshot.coach || {};
  const closest = Array.isArray(coach.closestRivals) ? coach.closestRivals : [];
  const compareArchives = (snapshot.compareSlots || []).filter((entry) => entry.sourceType === 'archive').length;
  const headline = closest.length
    ? `${formatNumber(closest.length)} nearby coach rivals are ready to mine`
    : `${formatNumber(compareArchives)} archive-backed compare logs loaded`;
  const summary = closest.length
    ? 'Use Competitor coach and saved perspectives to turn the nearest cohort rows into a repeatable historical benchmark set.'
    : 'Archive mining is available, but the current session does not yet have a strong cohort context.';
  return {
    id: 'archive-miner',
    agent: 'Archive Miner',
    level: closest.length ? 'opportunity' : 'info',
    confidence: closest.length ? 'medium' : 'low',
    headline,
    summary,
    evidence: [
      `Coach cohort rows: ${formatNumber(coach.totalRows)}`,
      `Loaded archive compare logs: ${formatNumber(compareArchives)}`
    ],
    actions: [buildAction('Open Competitor coach', 'competitor_coach'), buildAction('Open Save&Load session', 'session')],
    provenance: {
      freshness: 'session',
      official: false,
      source: 'archive cohort availability'
    }
  };
}

function buildPropagationAnalyst(snapshot) {
  const spots = snapshot.primary?.spots || {};
  const rbn = snapshot.primary?.rbn || {};
  const totalSignals = Number(spots.totalScanned || 0) + Number(rbn.totalScanned || 0);
  const level = totalSignals > 0 ? 'opportunity' : 'info';
  return {
    id: 'propagation-analyst',
    agent: 'Propagation Analyst',
    level,
    confidence: totalSignals > 0 ? 'medium' : 'low',
    headline: totalSignals > 0
      ? `${formatNumber(totalSignals)} propagation signals captured in this session`
      : 'No spot or RBN evidence is loaded yet',
    summary: totalSignals > 0
      ? 'Correlate your weakest operating windows with Spots and RBN before concluding the issue was purely tactical.'
      : 'Load Spots or RBN data to separate propagation constraints from operator choices.',
    evidence: [
      `Spots scanned: ${formatNumber(spots.totalScanned)}`,
      `RBN scanned: ${formatNumber(rbn.totalScanned)}`,
      `Spots status: ${spots.status || 'idle'}`,
      `RBN status: ${rbn.status || 'idle'}`
    ],
    actions: [buildAction('Open Spots', 'spots'), buildAction('Open RBN spots', 'rbn_spots'), buildAction('Open RBN compare signal', 'rbn_compare_signal')],
    provenance: {
      freshness: 'session',
      official: false,
      source: 'spot and RBN telemetry'
    }
  };
}

function buildOperatingStyleAnalyst(snapshot) {
  const style = classifyOperatingStyle(snapshot.primary);
  return {
    id: 'operating-style-analyst',
    agent: 'Operating Style Analyst',
    level: style.label === 'Balanced / mixed' ? 'opportunity' : 'info',
    confidence: style.confidence,
    headline: `${style.label} operating profile`,
    summary: style.summary,
    evidence: [
      `Distinct frequency buckets: ${formatNumber((snapshot.primary?.frequencySummary || []).length)}`,
      `Hour buckets: ${formatNumber((snapshot.primary?.hourSeries || []).length)}`
    ],
    actions: [buildAction('Open Frequencies', 'charts_frequencies'), buildAction('Open Rates', 'rates'), buildAction('Open Qs by minute', 'qs_by_minute')],
    provenance: {
      freshness: 'session',
      official: false,
      source: 'frequency clustering heuristic'
    }
  };
}

function buildSessionCurator(snapshot) {
  const recommendations = [];
  const hygieneCount = Number(snapshot.primary?.possibleErrors?.length || 0) + Number(snapshot.primary?.notInMasterCount || 0);
  if (hygieneCount > 0) recommendations.push('Start with hygiene cleanup before score diagnosis.');
  if ((snapshot.compareSlots || []).length > 0) recommendations.push('Then compare against the nearest loaded rival.');
  recommendations.push('Finish with a time-based review of the weakest hour or longest break.');
  return {
    id: 'session-curator',
    agent: 'Session Curator',
    level: 'opportunity',
    confidence: 'medium',
    headline: 'Recommended investigation path is ready',
    summary: 'This session has enough context to follow a repeatable review sequence instead of jumping randomly between reports.',
    evidence: recommendations.concat([
      `Saved perspectives: ${formatNumber(snapshot.perspectivesCount || 0)}`,
      snapshot.compareTimeRangeLock ? 'A compare time lock is already active.' : 'No compare time lock is active yet.'
    ]),
    actions: [buildAction('Open Save&Load session', 'session'), buildAction('Open Summary', 'summary'), buildAction('Open Qs by hour', 'graphs_qs_by_hour')],
    provenance: {
      freshness: 'session',
      official: false,
      source: 'session orchestration heuristic'
    }
  };
}

function buildPostmortemWriter(snapshot) {
  const scoring = snapshot.primary?.scoring || {};
  const breakMinutes = Number(snapshot.primary?.breakSummary?.totalBreakMin || 0);
  const hygiene = Number(snapshot.primary?.possibleErrors?.length || 0) + Number(snapshot.primary?.notInMasterCount || 0);
  const lines = [
    `Score review: ${formatNumber(scoring.computedScore)} computed vs ${formatNumber(scoring.claimedScoreHeader)} claimed.`,
    `Rate review: ${formatNumber(breakMinutes)} break minutes were detected across the session.`,
    `Data review: ${formatNumber(hygiene)} hygiene flags need attention before final conclusions.`
  ];
  return {
    id: 'postmortem-writer',
    agent: 'Postmortem Writer',
    level: 'opportunity',
    confidence: 'medium',
    headline: 'Draft debrief is ready to refine',
    summary: 'Use this as the spine of your written postmortem, then attach evidence from the linked reports.',
    evidence: lines,
    actions: [buildAction('Open Summary', 'summary'), buildAction('Open Save&Load session', 'session'), buildAction('Open Agent briefing', 'agent_briefing')],
    provenance: {
      freshness: 'session',
      official: false,
      source: 'generated narrative from session metrics'
    }
  };
}

function buildRulesInterpreter(snapshot) {
  const scoring = snapshot.primary?.scoring || {};
  const ruleName = scoring.ruleName || 'Unknown rules';
  const duplicatePolicy = scoring.duplicatePolicy || 'unknown';
  const multiplierPolicy = scoring.multiplierCreditPolicy || 'unknown';
  return {
    id: 'rules-interpreter',
    agent: 'Rules Interpreter',
    level: 'info',
    confidence: scoring.confidence || 'unknown',
    headline: `Scoring is using ${ruleName}`,
    summary: `Duplicate policy is "${duplicatePolicy}" and multiplier credit policy is "${multiplierPolicy}".`,
    evidence: [
      `Detection method: ${scoring.detectionMethod || 'unknown'}`,
      `Confidence: ${scoring.confidence || 'unknown'}`,
      `Rule source: ${scoring.ruleSpecSource || 'unknown'}`
    ],
    actions: [buildAction('Open Main', 'main'), buildAction('Open Summary', 'summary')],
    provenance: {
      freshness: 'session',
      official: Boolean(scoring.ruleReferenceUrl),
      source: ruleName
    }
  };
}

function buildDataProvenanceAgent(snapshot) {
  const scoring = snapshot.primary?.scoring || {};
  const dataStatus = snapshot.dataStatus || {};
  const issues = [];
  if (!scoring.supported) issues.push('Scoring rules are unresolved or unsupported.');
  if (confidenceRank(scoring.confidence) < confidenceRank('medium')) issues.push(`Scoring confidence is ${scoring.confidence || 'unknown'}.`);
  if (snapshot.primary?.spots?.status && !['ok', 'ready'].includes(String(snapshot.primary.spots.status))) issues.push(`Spots status is ${snapshot.primary.spots.status}.`);
  if (snapshot.primary?.rbn?.status && !['ok', 'ready'].includes(String(snapshot.primary.rbn.status))) issues.push(`RBN status is ${snapshot.primary.rbn.status}.`);
  if (dataStatus.ctyStatus && !['ok', 'ready'].includes(String(dataStatus.ctyStatus))) issues.push(`cty.dat status is ${dataStatus.ctyStatus}.`);
  if (dataStatus.masterStatus && !['ok', 'ready'].includes(String(dataStatus.masterStatus))) issues.push(`MASTER.DTA status is ${dataStatus.masterStatus}.`);
  if (dataStatus.qthStatus && !['ok', 'ready'].includes(String(dataStatus.qthStatus))) issues.push(`QTH status is ${dataStatus.qthStatus}.`);
  if (dataStatus.cqApiStatus && !['ok', 'ready', 'pending', 'idle'].includes(String(dataStatus.cqApiStatus))) issues.push(`CQ API status is ${dataStatus.cqApiStatus}.`);
  if (!(snapshot.compareSlots || []).length && snapshot.compareEnabled) issues.push('Compare mode is enabled but no rival logs are loaded.');
  return {
    id: 'data-provenance-agent',
    agent: 'Data Provenance Agent',
    level: issues.length >= 3 ? 'high' : (issues.length ? 'medium' : 'info'),
    confidence: 'high',
    headline: issues.length ? `${formatNumber(issues.length)} trust warnings need acknowledgement` : 'Current findings have a healthy provenance baseline',
    summary: issues.length
      ? 'Treat lower-confidence findings as directional until the missing or degraded data sources are repaired.'
      : 'Current score, compare, and enrichment inputs are strong enough for normal post-contest analysis.',
    evidence: issues.length ? issues : ['Scoring confidence is acceptable.', 'Compare context is present or optional.', 'No degraded enrichment signal blocks the workflow.'],
    actions: [buildAction('Open Main', 'main'), buildAction('Open Spots', 'spots'), buildAction('Open Save&Load session', 'session')],
    provenance: {
      freshness: 'session',
      official: true,
      source: 'runtime provenance checks'
    }
  };
}

export function runSh6AgentRuntime(snapshot = {}) {
  const findings = [
    buildScoreAuditor(snapshot),
    buildMultiplierHunter(snapshot),
    buildRateCoach(snapshot),
    buildRivalScout(snapshot),
    buildLogHygiene(snapshot),
    buildArchiveMiner(snapshot),
    buildPropagationAnalyst(snapshot),
    buildOperatingStyleAnalyst(snapshot),
    buildSessionCurator(snapshot),
    buildPostmortemWriter(snapshot),
    buildRulesInterpreter(snapshot),
    buildDataProvenanceAgent(snapshot)
  ].filter(Boolean);

  findings.sort((left, right) => (
    levelRank(right.level) - levelRank(left.level)
    || confidenceRank(right.confidence) - confidenceRank(left.confidence)
    || String(left.agent || '').localeCompare(String(right.agent || ''))
  ));

  const summary = findings.reduce((acc, finding) => {
    const key = String(finding.level || 'info');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    generatedAt: Date.now(),
    summary,
    findings
  };
}
