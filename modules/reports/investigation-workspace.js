export function createInvestigationWorkspaceRenderer(deps = {}) {
  const {
    getState,
    analysisModeDxer,
    compareSlotIds,
    getSlotById,
    getActiveCompareSlots,
    renderPlaceholder,
    renderReportIntroCard,
    renderAnalysisStepHeading,
    buildCompetitorCoachContext,
    createCompetitorCoachState,
    buildCoachRowKey,
    formatCoachScopeTitle,
    normalizeCoachScopeType,
    normalizeCoachCategory,
    normalizeCoachSeverity,
    coachSeverityLabel,
    findCqApiCategoryLabel,
    formatCqApiNumber,
    formatCqApiMultiplierValue,
    formatCqApiOperatorsCell,
    formatNumberSh6,
    formatYearSh6,
    normalizeCall,
    escapeHtml,
    escapeAttr,
    buildAgentBriefingKey,
    requestAgentBriefing,
    createAgentBriefingState
  } = deps;

  function renderCompetitorCoachContent() {
    const state = getState();
    if (state.analysisMode === analysisModeDxer) {
      return renderPlaceholder({
        id: 'competitor_coach',
        title: 'Competitor coach',
        message: 'Competitor coach is disabled in DXer mode.'
      });
    }
    if (!state.qsoData || !state.derived) {
      return renderPlaceholder({ id: 'competitor_coach', title: 'Competitor coach' });
    }
    const context = buildCompetitorCoachContext(state.cqApiClient || null);
    const coach = state.competitorCoach || createCompetitorCoachState();
    const selectedScope = context.ok
      ? (context.scopeValues?.[normalizeCoachScopeType(coach.scopeType)]
          ? normalizeCoachScopeType(coach.scopeType)
          : (['dxcc', 'continent', 'cq_zone', 'itu_zone'].find((key) => context.scopeValues?.[key]) || normalizeCoachScopeType(coach.scopeType)))
      : normalizeCoachScopeType(coach.scopeType);
    const categoryMode = coach.categoryMode === 'all' ? 'all' : 'same';
    const targetCategory = normalizeCoachCategory(coach.targetCategory || context.targetCategory || '');
    const categoryLabel = findCqApiCategoryLabel(state.apiEnrichment?.data?.labels?.catlist, targetCategory);
    const scopeValueText = context.ok ? String(context.scopeValues?.[selectedScope] || '') : '';
    const sourceRowsText = Number.isFinite(coach.sourceRows) ? formatNumberSh6(coach.sourceRows) : 'N/A';
    const statusText = coach.status === 'loading'
      ? '<p>Loading competitor cohort...</p>'
      : coach.status === 'error'
        ? `<p class="status-error">${escapeHtml(coach.error || 'Unable to load competitor cohort.')}</p>`
        : '';

    const current = coach.currentRow || null;
    const currentRank = Number.isFinite(current?.rank) ? current.rank : null;
    const currentRankText = Number.isFinite(currentRank) ? formatNumberSh6(currentRank) : 'N/A';
    const currentSummary = current
      ? `${escapeHtml(current.callsign || 'N/A')} · rank ${currentRankText} · ${formatCqApiNumber(current.score)}`
      : 'Current entry not detected in filtered cohort.';

    const rows = Array.isArray(coach.rows) ? coach.rows : [];
    const closestRivals = Array.isArray(coach.closestRivals) ? coach.closestRivals : [];
    const nearestAhead = closestRivals.find((row) => Number.isFinite(Number(row?.scoreGap)) && Number(row.scoreGap) > 0) || null;
    const nearestAny = closestRivals[0] || null;
    const nearestBehind = closestRivals.find((row) => Number.isFinite(Number(row?.scoreGap)) && Number(row.scoreGap) < 0) || null;
    const preferredSlot = compareSlotIds.find((slotId) => !getSlotById(slotId)?.qsoData) || 'B';
    const coachContest = String(coach.contestId || context.contestId || '').trim().toUpperCase();
    const coachMode = String(coach.mode || context.mode || '').trim().toLowerCase();
    const quickActionRow = nearestAhead || nearestAny;
    const quickActionYear = Number(quickActionRow?.year);
    const quickActionCall = normalizeCall(quickActionRow?.callsign || '');
    const quickActionReady = Boolean(quickActionRow) && Number.isFinite(quickActionYear) && Boolean(quickActionCall) && Boolean(coachContest) && Boolean(coachMode);
    const quickActionGap = quickActionRow && Number.isFinite(Number(quickActionRow?.scoreGap))
      ? `${Number(quickActionRow.scoreGap) >= 0 ? '+' : ''}${formatNumberSh6(Math.round(Math.abs(Number(quickActionRow.scoreGap))))}`
      : 'N/A';
    const quickActionHint = !rows.length
      ? 'No cohort rows yet. Switch scope/category to widen competitor coverage.'
      : !current
        ? 'Current station is not present in this filtered cohort. Try Category = All categories.'
        : rows.length === 1
          ? 'Only one row in cohort. Switch to a wider scope to find direct rivals.'
          : quickActionRow
            ? `Nearest rival is ${quickActionCall} (${quickActionGap} score gap). Load it to Log ${preferredSlot} for direct comparison.`
            : 'Select any row below and load it to Log B/C/D for side-by-side analysis.';
    const quickActionButton = quickActionReady
      ? (() => {
        const rowKey = buildCoachRowKey({
          callsign: quickActionCall,
          year: quickActionYear,
          contestId: coachContest,
          mode: coachMode
        });
        const slotAssigned = rowKey && rowKey === String(coach.loadedSlotRows?.[preferredSlot] || '');
        return `
          <button
            type="button"
            class="cqapi-load-btn coach-load-btn coach-quick-load${slotAssigned ? ' is-target' : ''}"
            data-slot="${preferredSlot}"
            data-row-key="${escapeAttr(rowKey)}"
            data-year="${escapeAttr(String(quickActionYear))}"
            data-callsign="${escapeAttr(quickActionCall)}"
            data-contest="${escapeAttr(coachContest)}"
            data-mode="${escapeAttr(coachMode)}"
            aria-pressed="${slotAssigned ? 'true' : 'false'}"
          >
            Load nearest rival to Log ${preferredSlot}
          </button>
        `;
      })()
      : '';

    const gapDriver = coach.gapDriver && typeof coach.gapDriver === 'object' ? coach.gapDriver : null;
    const gapDriverDirection = gapDriver?.direction === 'defending' ? 'Defend lead vs' : 'Chasing';
    const gapDriverCall = escapeHtml(gapDriver?.targetCallsign || 'N/A');
    const gapDriverScore = Number.isFinite(gapDriver?.scoreGap)
      ? formatNumberSh6(Math.round(Number(gapDriver.scoreGap)))
      : 'N/A';
    const gapDriverQso = Number.isFinite(gapDriver?.qsoGap)
      ? `${Number(gapDriver.qsoGap) >= 0 ? '+' : ''}${formatNumberSh6(Math.round(Number(gapDriver.qsoGap)))}`
      : 'N/A';
    const gapDriverMult = Number.isFinite(gapDriver?.multGap)
      ? `${Number(gapDriver.multGap) >= 0 ? '+' : ''}${formatNumberSh6(Math.round(Number(gapDriver.multGap)))}`
      : 'N/A';
    const gapDriverShare = Number.isFinite(gapDriver?.driverSharePct) ? `${Number(gapDriver.driverSharePct).toFixed(1)}%` : 'N/A';
    const gapDriverPrimary = gapDriver?.driver === 'qso'
      ? 'QSO volume'
      : (gapDriver?.driver === 'mult' ? 'Multipliers' : 'Mixed');
    const gapDriverAction = gapDriver?.driver === 'qso'
      ? (Number.isFinite(gapDriver?.neededQsos) ? `${formatNumberSh6(Math.round(Number(gapDriver.neededQsos)))} extra QSOs at current efficiency.` : 'Increase sustained rate in high-value hours.')
      : (gapDriver?.driver === 'mult'
          ? (Number.isFinite(gapDriver?.neededMults) ? `${formatNumberSh6(Math.round(Number(gapDriver.neededMults)))} additional multipliers at current efficiency.` : 'Prioritize multiplier hunting windows.')
          : 'Balance rate and multiplier runs to close the gap faster.');
    const gapDriverBlock = gapDriver
      ? `
        <div class="coach-driver-card">
          <h4>Gap driver</h4>
          <ul class="coach-driver-list">
            <li>${gapDriverDirection} <b>${gapDriverCall}</b> (score gap: <b>${gapDriverScore}</b>).</li>
            <li>Primary driver: <b>${gapDriverPrimary}</b> (estimated share: ${gapDriverShare}).</li>
            <li>QSO gap: ${gapDriverQso} | Mult gap: ${gapDriverMult}</li>
            <li>Recommended next move: ${escapeHtml(gapDriverAction)}</li>
          </ul>
        </div>
      `
      : '';

    const durationHours = (() => {
      const minTs = Number(state.derived?.timeRange?.minTs);
      const maxTs = Number(state.derived?.timeRange?.maxTs);
      if (!Number.isFinite(minTs) || !Number.isFinite(maxTs)) return null;
      const startHour = Math.floor(minTs / 3600000);
      const endHour = Math.floor(maxTs / 3600000);
      return Math.max(1, endHour - startHour + 1);
    })();
    const activeHours = Array.isArray(state.derived?.hourPointSeries) ? state.derived.hourPointSeries.length : null;
    const currentScore = Number(current?.score);
    const currentQsos = Number(current?.qsos);
    const currentMult = Number(current?.multTotal);
    const avgScorePerHour = Number.isFinite(currentScore) && Number.isFinite(durationHours) && durationHours > 0 ? currentScore / durationHours : null;
    const avgScorePerActiveHour = Number.isFinite(currentScore) && Number.isFinite(activeHours) && activeHours > 0 ? currentScore / activeHours : null;
    const avgScorePerQso = Number.isFinite(currentScore) && Number.isFinite(currentQsos) && currentQsos > 0 ? currentScore / currentQsos : null;
    const avgScorePerMult = Number.isFinite(currentScore) && Number.isFinite(currentMult) && currentMult > 0 ? currentScore / currentMult : null;

    const isSameCohortEntry = (a, b) => {
      if (!a || !b) return false;
      const callA = normalizeCall(a.callsign || '');
      const callB = normalizeCall(b.callsign || '');
      const catA = normalizeCoachCategory(a.category || '');
      const catB = normalizeCoachCategory(b.category || '');
      return Boolean(callA) && callA === callB && Boolean(catA) && catA === catB;
    };

    const renderCoachBriefCard = (title, row, opts = {}) => {
      const kind = String(opts.kind || '').trim().toLowerCase();
      const fallbackText = opts.fallbackText || '';
      if (!row || typeof row !== 'object') {
        return `
          <article class="coach-brief-card">
            <div class="coach-brief-head">
              <h4>${escapeHtml(title)}</h4>
              <span class="coach-severity-badge coach-severity-info">Info</span>
            </div>
            <p class="coach-brief-note">${escapeHtml(fallbackText || 'No target available for this card in the current cohort.')}</p>
            <div class="coach-brief-actions">
              <button type="button" class="coach-brief-btn coach-brief-nav" data-report="spots">Missed multipliers (Spots)</button>
              <button type="button" class="coach-brief-btn coach-brief-nav" data-report="graphs_points_by_hour">Points by hour</button>
            </div>
          </article>
        `;
      }

      const rowYear = Number(row?.year);
      const rowCall = normalizeCall(row?.callsign || '');
      const rowCategory = normalizeCoachCategory(row?.category || '');
      const scoreGap = Number(row?.scoreGap);
      const qsoGap = Number(row?.qsoGap);
      const multGap = Number(row?.multGap);
      const absScoreGap = Number.isFinite(scoreGap) ? Math.abs(scoreGap) : null;

      const isLeader = kind === 'leader' && current && isSameCohortEntry(row, current);
      const scoreVerb = Number.isFinite(scoreGap)
        ? (isLeader ? 'You are the leader.' : (scoreGap > 0 ? 'Behind by' : 'Ahead by'))
        : 'Score gap';
      const scoreText = Number.isFinite(absScoreGap) ? formatNumberSh6(Math.round(absScoreGap)) : 'N/A';

      const qsoDeficit = Number.isFinite(qsoGap) ? Math.max(0, Math.round(qsoGap)) : null;
      const multDeficit = Number.isFinite(multGap) ? Math.max(0, Math.round(multGap)) : null;

      const neededQsos = Number.isFinite(absScoreGap) && Number.isFinite(avgScorePerQso) && avgScorePerQso > 0
        ? Math.ceil(absScoreGap / avgScorePerQso)
        : null;
      const neededMults = Number.isFinite(absScoreGap) && Number.isFinite(avgScorePerMult) && avgScorePerMult > 0
        ? Math.ceil(absScoreGap / avgScorePerMult)
        : null;
      const neededHoursOverall = Number.isFinite(absScoreGap) && Number.isFinite(avgScorePerHour) && avgScorePerHour > 0
        ? absScoreGap / avgScorePerHour
        : null;
      const neededHoursActive = Number.isFinite(absScoreGap) && Number.isFinite(avgScorePerActiveHour) && avgScorePerActiveHour > 0
        ? absScoreGap / avgScorePerActiveHour
        : null;

      const severity = (() => {
        if (isLeader) return 'opportunity';
        const pct = Number(row?.scoreGapPct);
        if (!Number.isFinite(pct)) return Number.isFinite(absScoreGap) && absScoreGap > 0 ? 'medium' : 'info';
        const absPct = Math.abs(pct);
        if (kind === 'defend') {
          if (absPct <= 1.0) return 'high';
          if (absPct <= 3.0) return 'medium';
          return 'opportunity';
        }
        if (absPct >= 10) return 'high';
        if (absPct >= 4) return 'medium';
        return 'opportunity';
      })();

      const canLoad = Number.isFinite(rowYear) && Boolean(rowCall) && Boolean(coachContest) && Boolean(coachMode);
      const rowKey = canLoad ? buildCoachRowKey({
        callsign: rowCall,
        year: rowYear,
        contestId: coachContest,
        mode: coachMode
      }) : '';
      const slotAssigned = rowKey && rowKey === String(coach.loadedSlotRows?.[preferredSlot] || '');
      const loadButton = canLoad
        ? `
          <button
            type="button"
            class="cqapi-load-btn coach-load-btn coach-brief-btn${slotAssigned ? ' is-target' : ''}"
            data-slot="${preferredSlot}"
            data-row-key="${escapeAttr(rowKey)}"
            data-year="${escapeAttr(String(rowYear))}"
            data-callsign="${escapeAttr(rowCall)}"
            data-contest="${escapeAttr(coachContest)}"
            data-mode="${escapeAttr(coachMode)}"
            aria-pressed="${slotAssigned ? 'true' : 'false'}"
          >
            Load ${escapeHtml(rowCall)} to Log ${preferredSlot}
          </button>
        `
        : '';

      const showMultHunt = kind !== 'defend'
        ? (Number.isFinite(multDeficit) && multDeficit > 0)
        : (Number.isFinite(multGap) && multGap > 0);
      const multHint = showMultHunt
        ? 'Prioritize missed multipliers (Spots coach has a missed mult table).'
        : 'Multipliers are not the obvious deficit versus this target.';

      const rateHint = Number.isFinite(avgScorePerHour)
        ? `Your average score rate is ~${formatNumberSh6(Math.round(avgScorePerHour))} score/hour (overall).`
        : 'Points/score rate estimate unavailable (missing time range).';

      const hoursHint = (Number.isFinite(neededHoursOverall) || Number.isFinite(neededHoursActive))
        ? `At your pace, the score swing is ~${Number.isFinite(neededHoursOverall) ? neededHoursOverall.toFixed(1) : 'N/A'}h overall (or ~${Number.isFinite(neededHoursActive) ? neededHoursActive.toFixed(1) : 'N/A'}h active).`
        : 'Hours-to-close estimate unavailable.';

      const gapLine = Number.isFinite(scoreGap)
        ? `<li><b>${scoreVerb}</b> <b>${scoreText}</b> score vs <b>${escapeHtml(rowCall || 'N/A')}</b>${rowCategory ? ` (${escapeHtml(rowCategory)})` : ''}.</li>`
        : `<li><b>Target</b> ${escapeHtml(rowCall || 'N/A')}${rowCategory ? ` (${escapeHtml(rowCategory)})` : ''}.</li>`;

      const deltaLine = (() => {
        if (!Number.isFinite(qsoGap) && !Number.isFinite(multGap)) return '<li>QSO/mult deltas: N/A.</li>';
        const q = Number.isFinite(qsoGap) ? `${qsoGap >= 0 ? '+' : ''}${formatNumberSh6(Math.round(qsoGap))}` : 'N/A';
        const m = Number.isFinite(multGap) ? `${multGap >= 0 ? '+' : ''}${formatNumberSh6(Math.round(multGap))}` : 'N/A';
        return `<li>Gap breakdown: QSO delta ${q} | Mult delta ${m}.</li>`;
      })();

      const planLine = (() => {
        if (isLeader) {
          const defendText = nearestBehind ? `Nearest defender is ${escapeHtml(normalizeCall(nearestBehind.callsign || '') || 'N/A')}.` : 'No close defender detected.';
          return `<li>${defendText} Keep points rate high in your best hours and watch mult leakage.</li>`;
        }
        const parts = [];
        if (Number.isFinite(qsoDeficit) && qsoDeficit > 0) parts.push(`${formatNumberSh6(qsoDeficit)} QSOs`);
        if (Number.isFinite(multDeficit) && multDeficit > 0) parts.push(`${formatNumberSh6(multDeficit)} mults`);
        const deficitText = parts.length ? `Deficit vs target: ${parts.join(' and ')}.` : 'No direct QSO/mult deficit detected; improve efficiency and rate.';
        return `<li>${deficitText}</li>`;
      })();

      const equivalenceLine = (() => {
        if (!Number.isFinite(absScoreGap) || absScoreGap <= 0) return '<li>Equivalent effort: N/A.</li>';
        const qEq = Number.isFinite(neededQsos) ? `${formatNumberSh6(neededQsos)} QSOs` : 'N/A QSOs';
        const mEq = Number.isFinite(neededMults) ? `${formatNumberSh6(neededMults)} mults` : 'N/A mults';
        return `<li>Equivalent effort at your efficiency: ~${qEq} or ~${mEq}.</li>`;
      })();

      return `
        <article class="coach-brief-card coach-brief-${escapeAttr(kind || 'card')}">
          <div class="coach-brief-head">
            <h4>${escapeHtml(title)}</h4>
            <span class="coach-severity-badge coach-severity-${normalizeCoachSeverity(severity)}">${coachSeverityLabel(severity)}</span>
          </div>
          <p class="coach-brief-note">${escapeHtml(rateHint)} ${escapeHtml(hoursHint)}</p>
          <ul class="coach-brief-list">
            ${gapLine}
            ${deltaLine}
            ${planLine}
            ${equivalenceLine}
            <li><b>Multiplier focus:</b> ${escapeHtml(multHint)}</li>
          </ul>
          <div class="coach-brief-actions">
            <button type="button" class="coach-brief-btn coach-brief-nav" data-report="graphs_points_by_hour">Points by hour</button>
            <button type="button" class="coach-brief-btn coach-brief-nav" data-report="one_minute_point_rates">1-minute point rates</button>
            <button type="button" class="coach-brief-btn coach-brief-nav" data-report="spots">Missed multipliers (Spots)</button>
            ${loadButton}
          </div>
        </article>
      `;
    };

    const leaderRow = rows.length ? rows[0] : null;
    const coachBriefingBlock = `
      <div class="coach-brief-wrap">
        <h4>Coach briefing (leader, chase, defend)</h4>
        <div class="coach-brief-grid">
          ${renderCoachBriefCard('Leader target', leaderRow, {
            kind: 'leader',
            fallbackText: 'No leader row detected yet. Expand scope/category for a wider cohort.'
          })}
          ${renderCoachBriefCard('Chase target (nearest ahead)', nearestAhead, {
            kind: 'chase',
            fallbackText: 'No station ahead detected. You may be leading this cohort.'
          })}
          ${renderCoachBriefCard('Defend target (nearest behind)', nearestBehind, {
            kind: 'defend',
            fallbackText: 'No station behind detected. Cohort may be very small.'
          })}
        </div>
      </div>
    `;

    const rivalsBlock = closestRivals.length
      ? `
        <div class="coach-rivals-card">
          <h4>Closest rivals</h4>
          <table class="mtc coach-rivals-table">
            <tr class="thc"><th>Rank</th><th>Callsign</th><th>Category</th><th>Score</th><th>Gap</th><th>Action</th></tr>
            ${closestRivals.slice(0, 5).map((row, idx) => {
          const rowYear = Number(row?.year);
          const rowCall = normalizeCall(row?.callsign || '');
          const rowCategory = normalizeCoachCategory(row?.category || '');
          const rowGap = Number(row?.scoreGap);
          const rowGapText = Number.isFinite(rowGap)
            ? `${rowGap >= 0 ? '+' : ''}${formatNumberSh6(Math.round(Math.abs(rowGap)))}`
            : 'N/A';
          const canLoad = Number.isFinite(rowYear) && Boolean(rowCall) && Boolean(coachContest) && Boolean(coachMode);
          const rowKey = canLoad ? buildCoachRowKey({
            callsign: rowCall,
            year: rowYear,
            contestId: coachContest,
            mode: coachMode
          }) : '';
          const slotAssigned = rowKey && rowKey === String(coach.loadedSlotRows?.[preferredSlot] || '');
          const action = canLoad
            ? `<button type="button" class="cqapi-load-btn coach-load-btn coach-quick-load${slotAssigned ? ' is-target' : ''}" data-slot="${preferredSlot}" data-row-key="${escapeAttr(rowKey)}" data-year="${escapeAttr(String(rowYear))}" data-callsign="${escapeAttr(rowCall)}" data-contest="${escapeAttr(coachContest)}" data-mode="${escapeAttr(coachMode)}" aria-pressed="${slotAssigned ? 'true' : 'false'}">Load to Log ${preferredSlot}</button>`
            : '<span class="cqapi-muted">N/A</span>';
          return `
              <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
                <td>${formatCqApiNumber(row?.rank)}</td>
                <td>${escapeHtml(rowCall || 'N/A')}</td>
                <td>${escapeHtml(rowCategory || 'N/A')}</td>
                <td>${formatCqApiNumber(row?.score)}</td>
                <td>${rowGapText}</td>
                <td>${action}</td>
              </tr>
            `;
        }).join('')}
          </table>
        </div>
      `
      : '';

    const currentScoreValue = Number(current?.score);
    const nearestAheadGap = Number(nearestAhead?.scoreGap);
    const nearestAheadPct = Number.isFinite(nearestAheadGap) && Number.isFinite(currentScoreValue) && currentScoreValue > 0
      ? (nearestAheadGap / currentScoreValue) * 100
      : null;
    const cohortSeverity = !rows.length
      ? 'critical'
      : (!current ? 'high' : (rows.length === 1 ? 'medium' : 'opportunity'));
    const gapSeverity = !nearestAhead
      ? 'info'
      : (!Number.isFinite(nearestAheadPct)
          ? 'medium'
          : (nearestAheadPct >= 25 ? 'high' : (nearestAheadPct >= 10 ? 'medium' : 'opportunity')));
    const executionSeverity = !gapDriver
      ? 'info'
      : (gapDriver?.driver === 'mixed' ? 'medium' : 'opportunity');
    const cohortSummary = !rows.length
      ? 'No direct competitors were found with current filters.'
      : (!current
          ? 'Your station is not present in this filtered cohort.'
          : (rows.length === 1
              ? 'Only one entry matched the filters; expand scope for stronger benchmarking.'
              : `Cohort is healthy with ${formatCqApiNumber(rows.length)} comparable entries.`));
    const gapSummary = !nearestAhead
      ? 'You are currently leading this filtered cohort.'
      : `Nearest station ahead is ${escapeHtml(normalizeCall(nearestAhead.callsign || '') || 'N/A')} (${formatNumberSh6(Math.abs(Math.round(nearestAheadGap || 0)))} points${Number.isFinite(nearestAheadPct) ? `, ${nearestAheadPct.toFixed(1)}%` : ''}).`;
    const executionSummary = !gapDriver
      ? 'No dominant gap driver detected yet. Keep tracking both rate and multipliers.'
      : `Primary improvement axis is ${escapeHtml(gapDriverPrimary)}. Recommended move: ${escapeHtml(gapDriverAction)}`;
    const priorityCards = [
      {
        title: 'Cohort health',
        level: cohortSeverity,
        summary: cohortSummary
      },
      {
        title: 'Closest chase target',
        level: gapSeverity,
        summary: gapSummary
      },
      {
        title: 'Execution priority',
        level: executionSeverity,
        summary: executionSummary
      }
    ];
    const priorityBlock = `
      <div class="coach-priority-grid">
        ${priorityCards.map((card) => `
          <article class="coach-priority-card coach-priority-${normalizeCoachSeverity(card.level)}">
            <div class="coach-priority-head">
              <h4>${escapeHtml(card.title)}</h4>
              <span class="coach-severity-badge coach-severity-${normalizeCoachSeverity(card.level)}">${coachSeverityLabel(card.level)}</span>
            </div>
            <p>${card.summary}</p>
          </article>
        `).join('')}
      </div>
    `;

    const severityRank = {
      critical: 0,
      high: 1,
      medium: 2,
      opportunity: 3,
      info: 4
    };
    const buildHoursToCloseHint = (row) => {
      const absScoreGap = Math.abs(Number(row?.scoreGap));
      if (!Number.isFinite(absScoreGap) || absScoreGap <= 0) return 'Hours-to-close estimate unavailable.';
      const overall = Number.isFinite(avgScorePerHour) && avgScorePerHour > 0
        ? `${(absScoreGap / avgScorePerHour).toFixed(1)}h overall`
        : 'N/A overall';
      const active = Number.isFinite(avgScorePerActiveHour) && avgScorePerActiveHour > 0
        ? `${(absScoreGap / avgScorePerActiveHour).toFixed(1)}h active`
        : 'N/A active';
      return `At current pace the score swing is about ${overall} or ${active}.`;
    };
    const renderRankedCoachActionCard = (action, index) => `
      <article class="coach-ranked-card coach-ranked-${normalizeCoachSeverity(action.level)}">
        <div class="coach-ranked-head">
          <div class="coach-ranked-title">
            <span class="coach-ranked-order">${index + 1}</span>
            <h4>${escapeHtml(action.title)}</h4>
          </div>
          <span class="coach-severity-badge coach-severity-${normalizeCoachSeverity(action.level)}">${coachSeverityLabel(action.level)}</span>
        </div>
        <p class="coach-ranked-summary">${escapeHtml(action.summary)}</p>
        <ul class="coach-ranked-list">
          ${(action.details || []).map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}
        </ul>
        <div class="coach-ranked-actions">
          ${action.actions || '<button type="button" class="coach-brief-btn coach-brief-nav" data-report="summary">Summary</button>'}
        </div>
      </article>
    `;
    const rankedActions = [];
    if (!rows.length || !current) {
      rankedActions.push({
        level: cohortSeverity,
        title: !rows.length ? 'Widen competitor cohort' : 'Repair cohort coverage',
        summary: quickActionHint,
        details: [
          `Scope: ${formatCoachScopeTitle(selectedScope)}${scopeValueText ? ` (${scopeValueText})` : ''}.`,
          `Category mode: ${categoryMode === 'all' ? 'All categories' : 'Same category only'}.`,
          !rows.length
            ? 'Recommendation: widen the scope or category so SH6 can find direct rivals.'
            : 'Recommendation: switch to All categories or a wider scope so your own station appears in the cohort.'
        ],
        actions: `
          <button type="button" class="coach-brief-btn coach-brief-nav" data-report="summary">Summary</button>
          <button type="button" class="coach-brief-btn coach-brief-nav" data-report="spots">Missed multipliers (Spots)</button>
        `
      });
    }
    if (quickActionRow) {
      const quickScoreGap = Number(quickActionRow?.scoreGap);
      const quickGapDirection = Number.isFinite(quickScoreGap)
        ? (quickScoreGap > 0 ? 'behind' : (quickScoreGap < 0 ? 'ahead' : 'even with'))
        : 'near';
      rankedActions.push({
        level: nearestAhead ? gapSeverity : 'opportunity',
        title: nearestAhead ? 'Load the nearest rival into compare' : 'Load the nearest benchmark into compare',
        summary: quickActionHint,
        details: [
          `Target: ${quickActionCall || 'N/A'} in ${quickGapDirection} position.`,
          Number.isFinite(quickScoreGap)
            ? `Score swing: ${formatNumberSh6(Math.abs(Math.round(quickScoreGap)))} points. ${buildHoursToCloseHint(quickActionRow)}`
            : 'Score swing estimate unavailable.',
          'Use the compare workspace with a locked time range to isolate where the swing happened.'
        ],
        actions: `
          ${quickActionButton}
          <button type="button" class="coach-brief-btn coach-brief-nav" data-report="graphs_points_by_hour">Points by hour</button>
          <button type="button" class="coach-brief-btn coach-brief-nav" data-report="one_minute_point_rates">1-minute point rates</button>
        `
      });
    }
    if (gapDriver) {
      const gapActionButtons = gapDriver?.driver === 'mult'
        ? `
          <button type="button" class="coach-brief-btn coach-brief-nav" data-report="spots">Missed multipliers (Spots)</button>
          <button type="button" class="coach-brief-btn coach-brief-nav" data-report="summary">Scoring summary</button>
        `
        : gapDriver?.driver === 'qso'
          ? `
            <button type="button" class="coach-brief-btn coach-brief-nav" data-report="graphs_points_by_hour">Points by hour</button>
            <button type="button" class="coach-brief-btn coach-brief-nav" data-report="one_minute_point_rates">1-minute point rates</button>
          `
          : `
            <button type="button" class="coach-brief-btn coach-brief-nav" data-report="graphs_points_by_hour">Points by hour</button>
            <button type="button" class="coach-brief-btn coach-brief-nav" data-report="spots">Missed multipliers (Spots)</button>
          `;
      rankedActions.push({
        level: executionSeverity,
        title: gapDriver?.driver === 'mult'
          ? 'Recover the gap through multiplier hunting'
          : (gapDriver?.driver === 'qso'
              ? 'Recover the gap through sustained rate'
              : 'Split the recovery between rate and multipliers'),
        summary: gapDriverAction,
        details: [
          `${gapDriverDirection} ${gapDriver.targetCallsign || 'N/A'} with a ${gapDriverScore} score gap.`,
          `Primary driver: ${gapDriverPrimary} (${gapDriverShare} share).`,
          `Breakdown: QSO gap ${gapDriverQso} | Mult gap ${gapDriverMult}.`
        ],
        actions: gapActionButtons
      });
    }
    if (current && (nearestBehind || !nearestAhead)) {
      rankedActions.push({
        level: nearestBehind ? 'medium' : 'info',
        title: nearestBehind ? 'Protect against the nearest defender' : 'Protect the current lead',
        summary: nearestBehind
          ? `Nearest defender is ${normalizeCall(nearestBehind.callsign || '') || 'N/A'}. Keep the lead while you chase the next station.`
          : 'No immediate defender is visible in this cohort. Use the lead to pressure multipliers and protect high-rate hours.',
        details: [
          nearestBehind
            ? `Defender gap: ${formatNumberSh6(Math.abs(Math.round(Number(nearestBehind.scoreGap) || 0)))} points.`
            : 'No close defender detected in the current cohort.',
          'Monitor your strongest hours first so the lead does not leak during low-activity periods.',
          'Use time-locked compare and minute-rate reports before making operating changes.'
        ],
        actions: `
          <button type="button" class="coach-brief-btn coach-brief-nav" data-report="graphs_points_by_hour">Points by hour</button>
          <button type="button" class="coach-brief-btn coach-brief-nav" data-report="qs_by_minute">QSOs by minute</button>
          <button type="button" class="coach-brief-btn coach-brief-nav" data-report="spots">Missed multipliers (Spots)</button>
        `
      });
    }
    rankedActions.sort((left, right) => {
      const leftRank = severityRank[normalizeCoachSeverity(left.level)] ?? 99;
      const rightRank = severityRank[normalizeCoachSeverity(right.level)] ?? 99;
      return leftRank - rightRank;
    });
    const rankedActionBlock = rankedActions.length
      ? `
        <div class="coach-ranked-actions-wrap">
          <h4>Ranked actions</h4>
          <p class="coach-ranked-note">Start with action 1. Each action ties the current cohort gap to a direct compare load or a report jump.</p>
          <div class="coach-ranked-grid">
            ${rankedActions.map((action, index) => renderRankedCoachActionCard(action, index)).join('')}
          </div>
        </div>
      `
      : '';

    const tableRows = rows.map((row, idx) => {
      const rowYear = Number(row?.year);
      const rowCall = normalizeCall(row?.callsign || '');
      const rowCategory = normalizeCoachCategory(row?.category || '');
      const rowContest = String(coach.contestId || context.contestId || '').trim().toUpperCase();
      const rowMode = String(coach.mode || context.mode || '').trim().toLowerCase();
      const rowKey = buildCoachRowKey({
        callsign: rowCall,
        year: rowYear,
        contestId: rowContest,
        mode: rowMode
      });
      const isCurrent = current
        && rowCall
        && rowCall === normalizeCall(current.callsign || '')
        && rowCategory === normalizeCoachCategory(current.category || '');
      const trClass = isCurrent ? 'coach-row-current' : (idx % 2 === 0 ? 'td1' : 'td0');
      const canLoadCompare = Number.isFinite(rowYear) && Boolean(rowCall) && Boolean(rowContest) && Boolean(rowMode);
      const lastLoadedHere = rowKey && rowKey === String(coach.lastLoadedRowKey || '');
      const lastLoadedSlot = lastLoadedHere ? String(coach.lastLoadedSlot || '') : '';
      const loadActions = canLoadCompare
        ? `
          <div class="coach-load-control">
            <span class="coach-load-prefix">Load this log to slot</span>
            <span class="coach-load-segment" role="group" aria-label="Load this log to compare slot">
              ${compareSlotIds.map((slotId) => {
          const slotAssignedToRow = rowKey && rowKey === String(coach.loadedSlotRows?.[slotId] || '');
          const slotLabel = `Log ${slotId}`;
          return `<button type="button" class="cqapi-load-btn coach-load-btn${slotAssignedToRow ? ' is-target' : ''}" data-slot="${slotId}" data-row-key="${escapeAttr(rowKey)}" data-year="${escapeAttr(String(rowYear))}" data-callsign="${escapeAttr(rowCall)}" data-contest="${escapeAttr(rowContest)}" data-mode="${escapeAttr(rowMode)}" title="Load this log into ${slotLabel}" aria-label="Load this log into ${slotLabel}" aria-pressed="${slotAssignedToRow ? 'true' : 'false'}">${slotLabel}</button>`;
        }).join('')}
            </span>
            ${lastLoadedSlot ? `<span class="coach-last-loaded">Last loaded to Log ${escapeHtml(lastLoadedSlot)}</span>` : ''}
          </div>
        `
        : '<span class="cqapi-muted">N/A</span>';
      const operatorsCell = formatCqApiOperatorsCell(row?.operators || '');
      const operatorsTitleAttr = operatorsCell.title ? ` title="${escapeAttr(operatorsCell.title)}"` : '';
      const scoreGap = Number(row?.scoreGap);
      const scoreGapPct = Number(row?.scoreGapPct);
      const qsoGap = Number(row?.qsoGap);
      const multGap = Number(row?.multGap);
      const formatGap = (value, pct) => {
        if (!Number.isFinite(value)) return 'N/A';
        const signed = `${value >= 0 ? '+' : ''}${formatNumberSh6(Math.round(value))}`;
        if (!Number.isFinite(pct)) return signed;
        return `${signed} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`;
      };
      const formatSmallGap = (value) => {
        if (!Number.isFinite(value)) return 'N/A';
        return `${value >= 0 ? '+' : ''}${formatNumberSh6(Math.round(value))}`;
      };
      return `
        <tr class="${trClass}">
          <td>${formatCqApiNumber(row?.rank)}</td>
          <td>${escapeHtml(rowCall || 'N/A')}</td>
          <td>${escapeHtml(rowCategory || 'N/A')}</td>
          <td><strong>${formatCqApiNumber(row?.score)}</strong></td>
          <td>${formatGap(scoreGap, scoreGapPct)}</td>
          <td>${formatCqApiNumber(row?.qsos)}</td>
          <td>${formatSmallGap(qsoGap)}</td>
          <td>${formatCqApiMultiplierValue(row)}</td>
          <td>${formatSmallGap(multGap)}</td>
          <td class="coach-load-cell">${loadActions}</td>
          <td${operatorsTitleAttr}>${escapeHtml(operatorsCell.text)}</td>
        </tr>
      `;
    }).join('');

    const tableBlock = rows.length
      ? `
        <div class="cqapi-history-wrap">
          <table class="mtc coach-table">
            <tr class="thc"><th>Rank</th><th>Callsign</th><th>Category</th><th>Score</th><th>Gap to you</th><th>QSOs</th><th>QSO gap</th><th>Mult</th><th>Mult gap</th><th>Load to compare slot</th><th>Ops</th></tr>
            ${tableRows}
          </table>
        </div>
      `
      : '<p class="cqapi-muted">No competitors matched the selected filters.</p>';

    const controlsDisabled = context.ok ? '' : ' disabled';
    const scopeButtons = ['dxcc', 'continent', 'cq_zone', 'itu_zone'].map((key) => {
      const selected = key === selectedScope;
      const value = context.ok ? String(context.scopeValues?.[key] || '') : '';
      const suffix = value ? ` (${escapeHtml(value)})` : ' (N/A)';
      return `
        <button
          type="button"
          class="coach-choice-btn coach-scope-btn${selected ? ' active' : ''}"
          data-scope="${key}"
          aria-pressed="${selected ? 'true' : 'false'}"
          ${controlsDisabled}
        >
          ${formatCoachScopeTitle(key)}${suffix}
        </button>
      `;
    }).join('');
    const categoryButtons = [
      { value: 'same', label: 'Same category only' },
      { value: 'all', label: 'All categories' }
    ].map((item) => {
      const selected = item.value === categoryMode;
      return `
        <button
          type="button"
          class="coach-choice-btn coach-category-btn${selected ? ' active' : ''}"
          data-category-mode="${item.value}"
          aria-pressed="${selected ? 'true' : 'false'}"
          ${controlsDisabled}
        >
          ${item.label}
        </button>
      `;
    }).join('');

    const coachIntro = renderReportIntroCard(
      'Competitor coach workspace',
      'Find nearest rivals in your selected scope and load them directly into compare slots.',
      [
        `Scope ${formatCoachScopeTitle(selectedScope)}`,
        `Category mode ${categoryMode === 'all' ? 'All categories' : 'Same category'}`,
        `Cohort ${formatCqApiNumber(coach.totalRows)}`
      ]
    );

    return `
      <div class="cqapi-card mtc coach-card">
        <div class="gradient">&nbsp;Competitor coach</div>
        <div class="cqapi-body">
          ${coachIntro}
          <p>Find direct competitors by scope and category, then load any row directly to Log B, C, or D for side-by-side comparison.</p>
          ${context.ok ? '' : `<p class="status-error">${escapeHtml(context.reason || 'Competitor context unavailable.')}</p>`}
          ${renderAnalysisStepHeading(1, 'Filters', 'Choose scope and category mode for your competitor cohort.')}
          <div class="coach-controls">
            <div class="coach-control-group">
              <div class="coach-control-label">Scope</div>
              <div class="coach-choice-row">
                ${scopeButtons}
              </div>
            </div>
            <div class="coach-control-group">
              <div class="coach-control-label">Category</div>
              <div class="coach-choice-row">
                ${categoryButtons}
              </div>
            </div>
          </div>
          ${renderAnalysisStepHeading(2, 'Cohort snapshot', 'Confirm station context and nearest rival before loading compare slots.')}
          <table class="mtc coach-meta">
            <tr class="thc"><th>Metric</th><th>Value</th></tr>
            <tr class="td1"><td>Contest / mode / year</td><td>${escapeHtml(context.contestId || coach.contestId || 'N/A')} / ${escapeHtml(String(context.mode || coach.mode || '').toUpperCase() || 'N/A')} / ${formatYearSh6(context.year || coach.year)}</td></tr>
            <tr class="td0"><td>Station</td><td>${escapeHtml(context.callsign || 'N/A')}</td></tr>
            <tr class="td1"><td>Selected scope</td><td>${escapeHtml(formatCoachScopeTitle(selectedScope))} ${scopeValueText ? `(${escapeHtml(scopeValueText)})` : '(N/A)'}</td></tr>
            <tr class="td0"><td>Target category</td><td>${escapeHtml(targetCategory || 'N/A')}${categoryLabel ? ` - ${escapeHtml(categoryLabel)}` : ''}</td></tr>
            <tr class="td1"><td>Current in cohort</td><td>${currentSummary}</td></tr>
            <tr class="td0"><td>Cohort size</td><td>${formatCqApiNumber(coach.totalRows)} matched (from ${sourceRowsText} source rows)</td></tr>
          </table>
          ${coach.statusMessage ? `<p class="cqapi-msg">Data message: ${escapeHtml(coach.statusMessage)}</p>` : ''}
          ${statusText}
          ${rankedActionBlock}
          ${renderAnalysisStepHeading(3, 'Primary cohort table', 'Load one or more rivals directly into compare slots.')}
          ${tableBlock}
          ${rivalsBlock}
          <div class="sh6-advanced-analysis">
            ${renderAnalysisStepHeading(4, 'Coaching detail', 'Review priority cards and tactical guidance before the next session.')}
            ${priorityBlock}
            ${coachBriefingBlock}
            ${gapDriverBlock}
          </div>
        </div>
      </div>
    `;
  }

  function renderAgentBriefingContent() {
    const state = getState();
    if (!state.derived || !state.qsoData) {
      return renderPlaceholder({ id: 'agent_briefing', title: 'Agent briefing' });
    }
    const key = buildAgentBriefingKey();
    if (!state.agentBriefing || state.agentBriefing.key !== key) {
      requestAgentBriefing(key);
    }
    const briefing = state.agentBriefing || createAgentBriefingState();
    const summary = briefing.result?.summary || {};
    const findings = Array.isArray(briefing.result?.findings) ? briefing.result.findings : [];
    const renderActions = (actions, findingIndex) => {
      const list = Array.isArray(actions) ? actions : [];
      if (!list.length) return '';
      return list.map((action, actionIndex) => {
        if (!action || typeof action !== 'object') return '';
        if (action.type === 'report' && action.reportId) {
          return `<button type="button" class="agent-action-btn" data-report="${escapeAttr(action.reportId)}">${escapeHtml(action.label || action.reportId)}</button>`;
        }
        const actionId = `f${findingIndex}-a${actionIndex}`;
        const label = String(action.label || action.perspective?.label || 'Run action').trim() || 'Run action';
        return `<button type="button" class="agent-action-btn" data-agent-action-id="${escapeAttr(actionId)}">${escapeHtml(label)}</button>`;
      }).join('');
    };
    const summaryPills = [
      ['high', 'High'],
      ['medium', 'Medium'],
      ['opportunity', 'Opportunity'],
      ['info', 'Info']
    ].map(([keyName, label]) => `<span class="agent-summary-pill"><b>${escapeHtml(label)}</b> ${formatNumberSh6(summary[keyName] || 0)}</span>`).join('');
    const intro = renderReportIntroCard(
      'Agent briefing workspace',
      'Run SH6 agents against the current session to rank the next analysis steps, trust warnings, and debrief prompts.',
      [
        `Station ${escapeHtml(state.derived?.contestMeta?.stationCallsign || 'N/A')}`,
        `Contest ${escapeHtml(state.derived?.contestMeta?.contestId || 'N/A')}`,
        `Compare slots ${formatNumberSh6(getActiveCompareSlots().filter((entry) => entry.slot?.qsoData).length)}`
      ]
    );
    if (briefing.status === 'loading') {
      return `
        <div class="agent-report">
          ${intro}
          <div class="agent-empty-state">
            <p>Running SH6 agents on the current session snapshot...</p>
          </div>
        </div>
      `;
    }
    if (briefing.status === 'error') {
      return `
        <div class="agent-report">
          ${intro}
          <div class="agent-empty-state">
            <p class="status-error">${escapeHtml(briefing.error || 'Agent runtime failed.')}</p>
            <p><button type="button" class="agent-action-btn" data-report="summary">Open Summary</button></p>
          </div>
        </div>
      `;
    }
    const cards = findings.map((finding, findingIndex) => {
      const evidence = Array.isArray(finding.evidence) ? finding.evidence : [];
      const provenance = finding.provenance || {};
      return `
        <article class="agent-card agent-level-${escapeAttr(finding.level || 'info')}">
          <div class="agent-card-head">
            <div>
              <div class="agent-card-kicker">${escapeHtml(finding.agent || 'Agent')}</div>
              <h3>${escapeHtml(finding.headline || '')}</h3>
            </div>
            <div class="agent-card-meta">
              <span class="coach-severity-badge coach-severity-${escapeAttr(finding.level || 'info')}">${escapeHtml(coachSeverityLabel(finding.level || 'info'))}</span>
              <span class="agent-confidence">${escapeHtml(String(finding.confidence || 'unknown').toUpperCase())}</span>
            </div>
          </div>
          <p class="agent-summary">${escapeHtml(finding.summary || '')}</p>
          ${evidence.length ? `<ul class="agent-evidence-list">${evidence.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>` : ''}
          <div class="agent-provenance">
            <span><b>Source</b> ${escapeHtml(provenance.source || 'session')}</span>
            <span><b>Freshness</b> ${escapeHtml(provenance.freshness || 'session')}</span>
            <span><b>Official</b> ${provenance.official ? 'Yes' : 'No / mixed'}</span>
          </div>
          <div class="agent-actions">${renderActions(finding.actions, findingIndex)}</div>
        </article>
      `;
    }).join('');
    return `
      <div class="agent-report">
        ${intro}
        <div class="agent-summary-bar">
          ${summaryPills}
          <button type="button" class="agent-action-btn agent-refresh-btn" data-agent-refresh="1">Refresh briefing</button>
        </div>
        <div class="agent-grid">
          ${cards || '<div class="agent-empty-state"><p>No agent findings available for this session yet.</p></div>'}
        </div>
      </div>
    `;
  }

  return {
    renderCompetitorCoachContent,
    renderAgentBriefingContent
  };
}
