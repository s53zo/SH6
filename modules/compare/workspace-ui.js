export function createCompareWorkspaceRenderer(deps = {}) {
  const {
    escapeHtml,
    escapeAttr,
    formatNumberSh6,
    resolveCompareScoreModeLabel,
    normalizeCompareScoreMode,
    cloneTsRange,
    sameTsRange,
    formatCompareTimeRangeLabel,
    getCompareTimeRangeLock,
    compareTimeLockReports,
    compareScrollSyncReports,
    compareScoreModeComputed,
    compareScoreModeClaimed,
    compareScoreModeLogged
  } = deps;

  // Settings retain existing data hooks and saved-state compatibility, without
  // repeating report metadata or score banners above the comparison panels.
  function renderCompareSettings(reportId, context) {
    const safeReportId = String(reportId || '').split('::')[0];
    const scoreMode = normalizeCompareScoreMode(context?.state?.compareScoreMode);
    const timeLock = getCompareTimeRangeLock();
    const currentTimeFilter = cloneTsRange(context?.state?.logTimeRange);
    const supportsTimeLock = compareTimeLockReports.has(safeReportId);
    const lockCurrentButton = supportsTimeLock && currentTimeFilter && !sameTsRange(currentTimeFilter, timeLock)
      ? '<button type="button" class="compare-ui-toggle" data-compare-range-action="lock-current">Lock current time filter</button>'
      : '';
    const clearTimeLockButton = supportsTimeLock && timeLock
      ? '<button type="button" class="compare-ui-toggle" data-compare-range-action="clear-lock">Clear time lock</button>'
      : '';
    return `
      <details class="report-more" data-compare-settings>
        <summary>More</summary>
        <div class="report-more-controls no-print">
          <button type="button" class="compare-ui-toggle${context?.state?.compareSyncEnabled ? ' active' : ''}" data-compare-toggle="sync" aria-pressed="${Boolean(context?.state?.compareSyncEnabled)}">Sync scroll ${context?.state?.compareSyncEnabled ? 'on' : 'off'}</button>
          <button type="button" class="compare-ui-toggle${context?.state?.compareStickyEnabled ? ' active' : ''}" data-compare-toggle="sticky" aria-pressed="${Boolean(context?.state?.compareStickyEnabled)}">Sticky headers ${context?.state?.compareStickyEnabled ? 'on' : 'off'}</button>
          ${[compareScoreModeComputed, compareScoreModeClaimed, compareScoreModeLogged].map((mode) => `<button type="button" class="compare-ui-toggle${scoreMode === mode ? ' active' : ''}" data-compare-score-mode="${escapeAttr(mode)}" aria-pressed="${scoreMode === mode}">${escapeHtml(resolveCompareScoreModeLabel(mode))}</button>`).join('')}
          ${lockCurrentButton}
          ${clearTimeLockButton}
          <button type="button" class="compare-ui-toggle" data-compare-perspective-action="save">Save perspective</button>
          <button type="button" class="compare-ui-toggle" data-compare-jump="compare_insights">Compare Insights</button>
          <button type="button" class="compare-ui-toggle" data-compare-jump="summary">Scoring summary</button>
        </div>
      </details>
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
    const stackReports = new Set([
      'rates',
      'qs_by_minute',
      'points_by_minute',
      'one_minute_rates',
      'one_minute_point_rates',
      'countries_by_time'
    ]);
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
      'run_sp_inband',
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
    const settings = (slotEntries || []).length > 1 && !options.hideToolbar
      ? renderCompareSettings(baseId, context)
      : '';
    const timeLock = compareTimeLockReports.has(baseId) ? getCompareTimeRangeLock() : null;
    const timeLockNotice = timeLock
      ? `<p class="compare-time-lock-note">Time lock: ${escapeHtml(formatCompareTimeRangeLabel(timeLock))}</p>`
      : '';
    return `
      ${timeLockNotice}
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
      ${settings}
    `;
  }

  return { renderComparePanels };
}
