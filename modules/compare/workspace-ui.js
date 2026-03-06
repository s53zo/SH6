export function createCompareWorkspaceRenderer(deps = {}) {
  const {
    escapeHtml,
    escapeAttr,
    formatNumberSh6,
    formatDateSh6,
    resolveCompareScoreModeLabel,
    normalizeCompareScoreMode,
    parseClaimedScoreNumber,
    cloneTsRange,
    sameTsRange,
    formatCompareTimeRangeLabel,
    getCompareTimeRangeLock,
    getBaseReportId,
    getCompareFocusPair,
    filterQsosAndPointsByTsRange,
    getEffectivePointsByIndex,
    buildMinutePointMapFromQsos,
    buildMinuteCountMap,
    compareTimeLockReports,
    compareScrollSyncReports,
    compareScoreModeComputed,
    compareScoreModeClaimed,
    compareScoreModeLogged
  } = deps;

  function resolveCompareScore(snapshot, compareScoreMode) {
    if (!snapshot || typeof snapshot !== 'object') return null;
    const mode = normalizeCompareScoreMode(compareScoreMode);
    const scoring = snapshot?.derived?.scoring || {};
    if (mode === compareScoreModeClaimed) {
      const claimed = parseClaimedScoreNumber(snapshot?.derived?.contestMeta?.claimedScore);
      return Number.isFinite(claimed) && claimed >= 0 ? claimed : null;
    }
    if (mode === compareScoreModeLogged) {
      const qsoCount = Number(snapshot?.qsoData?.qsos?.length || 0);
      const logged = Number(scoring.loggedPointsTotal);
      if (Number.isFinite(logged) && (logged > 0 || qsoCount === 0)) return Math.round(logged);
      const effective = Number(snapshot?.derived?.effectivePointsTotal);
      if (Number.isFinite(effective) && (effective > 0 || qsoCount === 0)) return Math.round(effective);
      const totalPoints = Number(snapshot?.derived?.totalPoints);
      return Number.isFinite(totalPoints) && (totalPoints > 0 || qsoCount === 0) ? Math.round(totalPoints) : null;
    }
    const computed = Number(scoring.computedScore);
    return Number.isFinite(computed) && computed >= 0 ? computed : null;
  }

  function resolveCompareMultiplier(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return null;
    const scoring = snapshot?.derived?.scoring || {};
    const mult = Number(scoring.computedMultiplierTotal);
    return Number.isFinite(mult) && mult >= 0 ? mult : null;
  }

  function buildCompareInsightChip(slotMetrics, key, label, reportJump) {
    const values = (slotMetrics || [])
      .map((entry) => ({
        ...entry,
        metricValue: Number(entry[key])
      }))
      .filter((entry) => Number.isFinite(entry.metricValue));
    if (values.length < 2) {
      return `<button type="button" class="compare-insight-chip" disabled>${escapeHtml(label)}: N/A</button>`;
    }
    const leader = values.reduce((best, entry) => (
      !best || entry.metricValue > best.metricValue ? entry : best
    ), null);
    const minValue = Math.min(...values.map((entry) => entry.metricValue));
    const spread = Math.max(0, Math.round((leader?.metricValue || 0) - minValue));
    const baseline = values.find((entry) => entry.id === 'A') || values[0];
    const gap = Number.isFinite(baseline?.metricValue) && Number.isFinite(leader?.metricValue)
      ? Math.round((leader.metricValue || 0) - (baseline.metricValue || 0))
      : null;
    const gapPct = Number.isFinite(gap) && Number.isFinite(baseline?.metricValue) && baseline.metricValue > 0
      ? (gap / baseline.metricValue) * 100
      : null;
    const baselineText = Number.isFinite(gap)
      ? (gap > 0
          ? `${formatNumberSh6(Math.abs(gap))} behind Log ${escapeHtml(String(baseline?.id || '').toUpperCase())}${Number.isFinite(gapPct) ? ` (${gapPct.toFixed(1)}%)` : ''}`
          : `Leading from Log ${escapeHtml(String(baseline?.id || '').toUpperCase())}`)
      : 'No baseline';
    const summary = `${label} spread ${formatNumberSh6(spread)} · leader ${escapeHtml(leader?.call || 'N/A')} · ${baselineText}`;
    return `<button type="button" class="compare-insight-chip" data-compare-jump="${escapeAttr(reportJump)}">${summary}</button>`;
  }

  function buildCompareLargestDeltaChip(slotEntries, reportId) {
    const baseId = getBaseReportId(reportId);
    if ((slotEntries || []).length < 2) return '';
    if (baseId !== 'qs_by_minute' && baseId !== 'points_by_minute') return '';
    const selectedEntries = (slotEntries || []).length > 2
      ? (() => {
        const [leftId, rightId] = getCompareFocusPair(baseId, slotEntries);
        return [
          slotEntries.find((entry) => entry.id === leftId),
          slotEntries.find((entry) => entry.id === rightId)
        ].filter(Boolean);
      })()
      : slotEntries.slice(0, 2);
    if (selectedEntries.length < 2) return '';
    const metricLabel = baseId === 'points_by_minute' ? 'points' : 'QSOs';
    const metricMaps = selectedEntries.slice(0, 2).map((entry) => {
      const qsos = entry.snapshot?.qsoData?.qsos || [];
      const range = getCompareTimeRangeLock();
      const filtered = filterQsosAndPointsByTsRange(
        qsos,
        getEffectivePointsByIndex(entry.snapshot?.derived, qsos),
        range
      );
      return baseId === 'points_by_minute'
        ? buildMinutePointMapFromQsos(filtered.qsos, filtered.pointsByIndex)
        : buildMinuteCountMap(filtered.qsos);
    });
    const keys = new Set([...metricMaps[0].keys(), ...metricMaps[1].keys()]);
    let best = null;
    keys.forEach((key) => {
      const left = Number(metricMaps[0].get(key) || 0);
      const right = Number(metricMaps[1].get(key) || 0);
      const delta = left - right;
      if (!best || Math.abs(delta) > Math.abs(best.delta)) {
        best = { key, delta, left, right };
      }
    });
    if (!best || !Number.isFinite(best.key)) return '';
    const leader = best.delta >= 0 ? selectedEntries[0] : selectedEntries[1];
    const loser = best.delta >= 0 ? selectedEntries[1] : selectedEntries[0];
    const timeText = escapeHtml(formatDateSh6(best.key * 60000));
    const deltaText = formatNumberSh6(Math.abs(Math.round(best.delta)));
    return `
      <button
        type="button"
        class="compare-insight-chip"
        data-compare-focus-cell-key="minute-${escapeAttr(String(best.key))}"
      >
        Largest ${escapeHtml(metricLabel)} delta ${timeText} · ${escapeHtml(leader?.label || 'A')} +${deltaText} vs ${escapeHtml(loser?.label || 'B')}
      </button>
    `;
  }

  function renderCompareInsightStrip(slotEntries, currentReportId, context) {
    const compareScoreMode = context?.state?.compareScoreMode;
    const slotMetrics = (slotEntries || []).map((entry) => ({
      id: entry.id,
      label: entry.label,
      call: entry.snapshot?.derived?.contestMeta?.stationCallsign || entry.label,
      score: resolveCompareScore(entry.snapshot, compareScoreMode),
      multiplier: resolveCompareMultiplier(entry.snapshot)
    }));
    const scoreLabel = resolveCompareScoreModeLabel(compareScoreMode);
    const largestDeltaChip = buildCompareLargestDeltaChip(slotEntries, currentReportId);
    const jumpButtons = `
      <div class="compare-insight-jumps">
        <button type="button" class="compare-workspace-jump" data-compare-jump="${escapeAttr(currentReportId === 'main' ? 'summary' : 'main')}">${currentReportId === 'main' ? 'Jump to summary' : 'Jump to main'}</button>
        <button type="button" class="compare-workspace-jump" data-compare-jump="summary">Scoring summary</button>
      </div>
    `;
    return `
      <div class="compare-insight-strip">
        <div class="compare-insight-row">
          ${buildCompareInsightChip(slotMetrics, 'score', scoreLabel, 'main')}
          ${buildCompareInsightChip(slotMetrics, 'multiplier', 'Multipliers', 'summary')}
          ${largestDeltaChip}
        </div>
        ${jumpButtons}
      </div>
    `;
  }

  function renderCompareWorkspaceToolbar(reportId, slotEntries, context) {
    const safeReportId = String(reportId || '').split('::')[0];
    const reportTitle = (context?.reports || []).find((entry) => entry.id === safeReportId)?.title || safeReportId;
    const compareScoreMode = context?.state?.compareScoreMode;
    const scoreMode = normalizeCompareScoreMode(compareScoreMode);
    const timeLock = getCompareTimeRangeLock();
    const currentTimeFilter = cloneTsRange(context?.state?.logTimeRange);
    const supportsTimeLock = compareTimeLockReports.has(safeReportId);
    const lockCurrentButton = supportsTimeLock && currentTimeFilter && !sameTsRange(currentTimeFilter, timeLock)
      ? '<button type="button" class="compare-ui-toggle" data-compare-range-action="lock-current">Lock current time filter</button>'
      : '';
    const timeLockStatus = supportsTimeLock && timeLock
      ? `<button type="button" class="compare-ui-toggle active" disabled>Time lock ${escapeHtml(formatCompareTimeRangeLabel(timeLock))}</button>`
      : '';
    const clearTimeLockButton = supportsTimeLock && timeLock
      ? '<button type="button" class="compare-ui-toggle" data-compare-range-action="clear-lock">Clear time lock</button>'
      : '';
    const slotSummary = (slotEntries || []).map((entry) => {
      const call = escapeHtml(entry.snapshot?.derived?.contestMeta?.stationCallsign || 'N/A');
      const contest = escapeHtml(entry.snapshot?.derived?.contestMeta?.contestId || 'N/A');
      const qsos = entry.snapshot?.qsoData?.qsos?.length || 0;
      return `<span class="compare-workspace-slot compare-${entry.id.toLowerCase()}">${escapeHtml(entry.label)} · ${call} · ${contest} · ${formatNumberSh6(qsos)} QSOs</span>`;
    }).join('');
    const controls = `
      <div class="compare-workspace-controls">
        <button type="button" class="compare-ui-toggle${context?.state?.compareSyncEnabled ? ' active' : ''}" data-compare-toggle="sync">Sync scroll ${context?.state?.compareSyncEnabled ? 'on' : 'off'}</button>
        <button type="button" class="compare-ui-toggle${context?.state?.compareStickyEnabled ? ' active' : ''}" data-compare-toggle="sticky">Sticky headers ${context?.state?.compareStickyEnabled ? 'on' : 'off'}</button>
        <button type="button" class="compare-ui-toggle${scoreMode === compareScoreModeComputed ? ' active' : ''}" data-compare-score-mode="${compareScoreModeComputed}">${escapeHtml(resolveCompareScoreModeLabel(compareScoreModeComputed))}</button>
        <button type="button" class="compare-ui-toggle${scoreMode === compareScoreModeClaimed ? ' active' : ''}" data-compare-score-mode="${compareScoreModeClaimed}">${escapeHtml(resolveCompareScoreModeLabel(compareScoreModeClaimed))}</button>
        <button type="button" class="compare-ui-toggle${scoreMode === compareScoreModeLogged ? ' active' : ''}" data-compare-score-mode="${compareScoreModeLogged}">${escapeHtml(resolveCompareScoreModeLabel(compareScoreModeLogged))}</button>
        ${timeLockStatus}
        ${lockCurrentButton}
        ${clearTimeLockButton}
        <button type="button" class="compare-ui-toggle" data-compare-perspective-action="save">Save perspective</button>
      </div>
    `;
    const insightStrip = renderCompareInsightStrip(slotEntries, safeReportId, context);
    return `
      <div class="compare-workspace">
        <div class="compare-workspace-head">
          <span class="compare-workspace-title">Compare workspace</span>
          <span class="compare-workspace-report">Report: ${escapeHtml(reportTitle)}</span>
        </div>
        <div class="compare-workspace-slot-row">${slotSummary}</div>
        ${controls}
        ${insightStrip}
      </div>
    `;
  }

  function renderCompareHeader(slot, label, slotId) {
    const call = escapeHtml(slot?.derived?.contestMeta?.stationCallsign || 'N/A');
    const contest = escapeHtml(slot?.derived?.contestMeta?.contestId || 'N/A');
    const year = slot?.derived?.timeRange?.minTs ? new Date(slot.derived.timeRange.minTs).getUTCFullYear() : 'N/A';
    const qsos = slot?.qsoData?.qsos?.length ? formatNumberSh6(slot.qsoData.qsos.length) : '0';
    const slotLabel = escapeHtml(label || `Log ${slotId}`);
    return `
      <div class="compare-head-main">
        <span class="compare-slot-badge compare-slot-${String(slotId || '').toLowerCase()}">${slotLabel}</span>
        <span class="compare-head-call">${call}</span>
      </div>
      <div class="compare-head-meta">${contest} · ${year} · ${qsos} QSOs</div>
    `;
  }

  function renderComparePanels(slotEntries, htmlBlocks, reportId, options = {}, context = {}) {
    const baseId = String(reportId || '').split('::')[0];
    const narrowReports = new Set([
      'one_minute_rates',
      'one_minute_point_rates',
      'rates'
    ]);
    const wrapReports = new Set(['one_minute_rates', 'one_minute_point_rates']);
    const stackReports = new Set(['rates']);
    const quadReports = new Set([
      'main',
      'summary',
      'qsl_labels',
      'qs_per_station',
      'one_minute_rates',
      'one_minute_point_rates',
      'distance',
      'breaks',
      'continents',
      'kmz_files',
      'fields_map',
      'callsign_length',
      'callsign_structure',
      'zones_cq',
      'zones_itu',
      'not_in_master',
      'possible_errors',
      'comments',
      'sh6_info',
      'charts'
    ]);
    const isNarrow = narrowReports.has(baseId);
    const shouldWrap = wrapReports.has(baseId);
    const isChart = options.chart || baseId.startsWith('charts_');
    const isQuad = isChart || quadReports.has(baseId);
    const shouldStack = stackReports.has(baseId);
    const syncScroll = context?.state?.compareSyncEnabled && !isChart && compareScrollSyncReports.has(baseId);
    const syncGroup = `compare-sync-${baseId}-${(slotEntries || []).map((entry) => entry.id).join('').toLowerCase()}`;
    const gridClass = `compare-grid compare-count-${(slotEntries || []).length}${isNarrow ? ' compare-narrow' : ''}${isChart ? ' compare-chart' : ''}${isQuad ? ' compare-quad' : ''}${shouldStack ? ' compare-stack' : ''}${context?.state?.compareStickyEnabled ? '' : ' compare-sticky-off'}`;
    const toolbar = (slotEntries || []).length > 1 && !options.hideToolbar
      ? renderCompareWorkspaceToolbar(baseId, slotEntries, context)
      : '';
    return `
      ${toolbar}
      <div class="${gridClass}"${syncScroll ? ` data-compare-sync-group="${escapeAttr(syncGroup)}"` : ''} data-compare-report="${escapeAttr(baseId)}">
        ${(slotEntries || []).map((entry, idx) => {
          const html = htmlBlocks[idx] || '';
          const panelClass = `compare-panel compare-${entry.id.toLowerCase()}`;
          return `
            <div class="${panelClass}">
              <div class="compare-head">${renderCompareHeader(entry.snapshot, entry.label, entry.id)}</div>
              <div class="compare-scroll${shouldWrap ? ' compare-scroll-wrap' : ''}${syncScroll ? ' compare-scroll-sync' : ''}"${syncScroll ? ` data-sync-group="${escapeAttr(syncGroup)}" data-sync-slot="${escapeAttr(entry.id)}"` : ''}>${html}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  return { renderComparePanels };
}
