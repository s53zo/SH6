export function createRbnCompareViewRuntime(deps = {}) {
  const {
    getState,
    getActiveCompareSlots,
    getSlotById,
    compareSlotIds = [],
    createCompetitorCoachState,
    buildCompetitorCoachContext,
    normalizeCall,
    normalizeBandToken,
    formatBandLabel,
    escapeAttr,
    escapeHtml,
    mapSpotStatus,
    buildRbnDayList,
    getRbnCompareRankingCached,
    continentLabel,
    normalizeSpotterBase,
    formatNumberSh6,
    renderReportIntroCard,
    renderRbnRecommendationCallout,
    renderStateCard,
    analysisModeDxer = 'dxer'
  } = deps;

  function getStateSafe() {
    return getState?.() || {};
  }

  function getActiveCompareSlotsSafe() {
    return Array.isArray(getActiveCompareSlots?.()) ? getActiveCompareSlots() : [];
  }

  function getSlotByIdSafe(slotId) {
    if (typeof getSlotById === 'function') return getSlotById(slotId);
    return null;
  }

  function createCompetitorCoachStateSafe() {
    if (typeof createCompetitorCoachState === 'function') return createCompetitorCoachState();
    return { closestRivals: [] };
  }

  function buildCompetitorCoachContextSafe(client) {
    if (typeof buildCompetitorCoachContext === 'function') return buildCompetitorCoachContext(client);
    return {};
  }

  function normalizeCallSafe(value) {
    if (typeof normalizeCall === 'function') return normalizeCall(value);
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  }

  function normalizeBandTokenSafe(value) {
    if (typeof normalizeBandToken === 'function') return normalizeBandToken(value);
    return String(value || '').trim().toUpperCase();
  }

  function formatBandLabelSafe(value) {
    if (typeof formatBandLabel === 'function') return formatBandLabel(value);
    return String(value || '').trim().toUpperCase();
  }

  function escapeAttrSafe(value) {
    if (typeof escapeAttr === 'function') return escapeAttr(value);
    return String(value || '').replace(/"/g, '&quot;');
  }

  function escapeHtmlSafe(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(value);
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function mapSpotStatusSafe(status) {
    if (typeof mapSpotStatus === 'function') return mapSpotStatus(status);
    return String(status || '').trim().toLowerCase();
  }

  function buildRbnDayListSafe(minTs, maxTs) {
    if (typeof buildRbnDayList === 'function') return buildRbnDayList(minTs, maxTs);
    return [];
  }

  function getRbnCompareRankingCachedSafe(slotId, slot, bandKey) {
    if (typeof getRbnCompareRankingCached === 'function') return getRbnCompareRankingCached(slotId, slot, bandKey);
    return null;
  }

  function continentLabelSafe(value) {
    if (typeof continentLabel === 'function') return continentLabel(value);
    return String(value || '').trim().toUpperCase() || 'N/A';
  }

  function normalizeSpotterBaseSafe(value) {
    if (typeof normalizeSpotterBase === 'function') return normalizeSpotterBase(value);
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '').replace(/-\d+$/, '');
  }

  function formatNumberSafe(value) {
    if (typeof formatNumberSh6 === 'function') return formatNumberSh6(value);
    const num = Number(value);
    return Number.isFinite(num) ? num.toLocaleString('en-US') : '0';
  }

  function renderReportIntroCardSafe(title, intro, items) {
    if (typeof renderReportIntroCard === 'function') return renderReportIntroCard(title, intro, items);
    return `<section class="report-intro"><h3>${escapeHtmlSafe(title)}</h3><p>${escapeHtmlSafe(intro)}</p></section>`;
  }

  function renderRbnRecommendationCalloutSafe() {
    if (typeof renderRbnRecommendationCallout === 'function') return renderRbnRecommendationCallout();
    return `
      <section class="report-recommendation-card">
        <span class="report-recommendation-kicker">Author recommendation</span>
        <div class="report-recommendation-body">
          <a href="https://s53m.com/RBN" target="_blank" rel="noopener noreferrer">Open the dedicated RBN analysis site</a>
          <p>Use the standalone RBN workspace for deeper beacon-focused investigation, then return to SH6 for log-integrated analysis.</p>
        </div>
      </section>
    `;
  }

  function renderStateCardSafe(config = {}) {
    if (typeof renderStateCard === 'function') return renderStateCard(config);
    return `<section class="state-card state-${escapeAttrSafe(config.type || 'info')}"><h3>${escapeHtmlSafe(config.title || '')}</h3><p>${escapeHtmlSafe(config.message || '')}</p></section>`;
  }

  function ensureRbnCompareSignalState() {
    const state = getStateSafe();
    state.rbnCompareSignal = state.rbnCompareSignal && typeof state.rbnCompareSignal === 'object'
      ? state.rbnCompareSignal
      : { selectedByContinent: {} };
    if (!state.rbnCompareSignal.selectedByContinent || typeof state.rbnCompareSignal.selectedByContinent !== 'object') {
      state.rbnCompareSignal.selectedByContinent = {};
    }
    return state.rbnCompareSignal;
  }

  function slotMarkerShape(slotId) {
    const id = String(slotId || 'A').toUpperCase();
    if (id === 'B') return 'triangle';
    if (id === 'C') return 'square';
    if (id === 'D') return 'diamond';
    return 'circle';
  }

  function slotMarkerSymbol(slotId) {
    const shape = slotMarkerShape(slotId);
    if (shape === 'triangle') return '▲';
    if (shape === 'square') return '■';
    if (shape === 'diamond') return '◆';
    return '●';
  }

  function slotLineDash(slotId) {
    const id = String(slotId || 'A').toUpperCase();
    if (id === 'B') return [8, 6];
    if (id === 'C') return [2, 5];
    if (id === 'D') return [10, 5, 2, 5];
    return [];
  }

  function slotLineStyleLabel(slotId) {
    const id = String(slotId || 'A').toUpperCase();
    if (id === 'B') return 'dashed';
    if (id === 'C') return 'dotted';
    if (id === 'D') return 'dash-dot';
    return 'solid';
  }

  function slotLineStyleSample(slotId) {
    const id = String(slotId || 'A').toUpperCase();
    if (id === 'B') return '- - -';
    if (id === 'C') return '. . .';
    if (id === 'D') return '-.-.-';
    return '-----';
  }

  function slotLegendMarkerSvg(slotId) {
    const shape = slotMarkerShape(slotId);
    const fill = '#23466f';
    if (shape === 'triangle') {
      return `<svg class="rbn-slot-marker" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><polygon points="6,2 10,10 2,10" fill="${fill}"/></svg>`;
    }
    if (shape === 'square') {
      return `<svg class="rbn-slot-marker" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="3" y="3" width="6" height="6" fill="${fill}"/></svg>`;
    }
    if (shape === 'diamond') {
      return `<svg class="rbn-slot-marker" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><polygon points="6,1.7 10.3,6 6,10.3 1.7,6" fill="${fill}"/></svg>`;
    }
    return `<svg class="rbn-slot-marker" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="3.2" fill="${fill}"/></svg>`;
  }

  function slotLegendLineSvg(slotId) {
    const dash = slotLineDash(slotId);
    const width = String(slotId || 'A').toUpperCase() === 'A' ? 2.1 : 1.7;
    const stroke = '#23466f';
    const dashAttr = (dash && dash.length) ? ` stroke-dasharray="${dash.join(' ')}"` : '';
    return `<svg class="rbn-slot-line" width="46" height="12" viewBox="0 0 46 12" aria-hidden="true"><line x1="2" y1="6" x2="44" y2="6" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"${dashAttr} vector-effect="non-scaling-stroke" opacity="0.45"/></svg>`;
  }

  function renderRbnCompareSignal() {
    const state = getStateSafe();
    if (!state.qsoData || !state.derived) {
      return renderStateCardSafe({
        type: 'info',
        title: 'RBN compare signal unavailable',
        message: 'Load a log to enable RBN signal compare.'
      });
    }

    const slots = getActiveCompareSlotsSafe();
    const loaded = slots.filter((entry) => entry.slot?.qsoData && entry.slot?.derived);
    const base = loaded.find((entry) => entry.id === 'A') || loaded[0] || null;
    const bandKey = normalizeBandTokenSafe(state.globalBandFilter || '');
    const slotLegendHtml = loaded.map((entry) => {
      const call = normalizeCallSafe(entry.slot?.derived?.contestMeta?.stationCallsign || '');
      const label = call || entry.label || `Log ${entry.id}`;
      const markerSvg = slotLegendMarkerSvg(entry.id);
      const lineSvg = slotLegendLineSvg(entry.id);
      return `<span class="rbn-slot-chip" title="${escapeAttrSafe(slotLineStyleLabel(entry.id))}"><span class="rbn-slot-chip-call">${escapeHtmlSafe(label)}</span>${markerSvg}${lineSvg}</span>`;
    }).join('');

    const compareOffer = (() => {
      const emptySlots = compareSlotIds.filter((slotId) => !getSlotByIdSafe(slotId)?.qsoData);
      if (!emptySlots.length) return '';
      const coach = state.competitorCoach || createCompetitorCoachStateSafe();
      const context = buildCompetitorCoachContextSafe(state.cqApiClient || null);
      const contestId = String(coach.contestId || context.contestId || '').trim().toUpperCase();
      const mode = String(coach.mode || context.mode || '').trim().toLowerCase();
      const currentCall = normalizeCallSafe(state.derived?.contestMeta?.stationCallsign || '');
      const rivals = Array.isArray(coach.closestRivals) ? coach.closestRivals : [];
      const picks = [];
      const seen = new Set();
      for (const row of rivals) {
        const call = normalizeCallSafe(row?.callsign || '');
        const year = Number(row?.year);
        if (!call || call === currentCall) continue;
        if (!Number.isFinite(year)) continue;
        const key = `${call}|${year}`;
        if (seen.has(key)) continue;
        seen.add(key);
        picks.push({ call, year });
        if (picks.length >= emptySlots.length) break;
      }
      const buttons = emptySlots.map((slotId, idx) => {
        const pick = picks[idx] || picks[0] || null;
        if (!pick || !contestId || !mode) return '';
        return `<button type="button" class="cqapi-load-btn coach-load-btn" data-slot="${escapeAttrSafe(slotId)}" data-year="${escapeAttrSafe(String(pick.year))}" data-callsign="${escapeAttrSafe(pick.call)}" data-contest="${escapeAttrSafe(contestId)}" data-mode="${escapeAttrSafe(mode)}">Load ${escapeHtmlSafe(pick.call)} to Log ${escapeHtmlSafe(slotId)}</button>`;
      }).filter(Boolean).join(' ');
      const navBtn = '<button type="button" class="button rbn-coach-nav" data-report="competitor_coach">Open Competitor coach</button>';
      const note = buttons
        ? 'Load a few nearby rivals for side-by-side signal comparison:'
        : 'Tip: open Competitor coach to select and load rivals into Log B/C/D for compare.';
      return `
        <div class="export-actions export-note">
          <b>Compare tip</b> ${escapeHtmlSafe(note)}
          <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px;">${buttons || ''}${navBtn}</div>
        </div>
      `;
    })();

    const rbnControls = loaded.map((entry) => {
      const status = mapSpotStatusSafe(entry.slot?.rbnState?.status || 'idle');
      const statusText = status === 'ready' ? 'ready' : (status === 'loading' ? 'loading' : (status === 'error' ? 'error' : 'idle'));
      return `<span class="cqapi-muted">${escapeHtmlSafe(entry.label)} RBN: ${escapeHtmlSafe(statusText)}</span>`;
    }).join(' · ');

    const warning = (() => {
      const minTs = state.derived?.timeRange?.minTs;
      const maxTs = state.derived?.timeRange?.maxTs;
      const days = buildRbnDayListSafe(minTs, maxTs);
      if ((days || []).length > 2) {
        const spanText = state.analysisMode === analysisModeDxer ? 'this log' : 'this contest';
        return `<div class="export-actions export-note">Note: ${escapeHtmlSafe(spanText)} spans more than 2 UTC dates; RBN queries are limited to 2 dates at a time. Adjust selected days in <b>RBN spots</b> if needed.</div>`;
      }
      return '';
    })();

    const continentOrder = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC'];
    const selections = ensureRbnCompareSignalState();
    const rankingCached = base ? getRbnCompareRankingCachedSafe(base.id, base.slot, bandKey) : null;
    const byContinent = rankingCached?.byContinent || new Map();
    const baseReady = base?.slot?.rbnState?.status === 'ready';

    const cards = continentOrder.map((continent, orderIndex) => {
      const list = byContinent.get(continent) || [];
      const topCount = list[0]?.count || 0;
      return { continent, list, topCount, orderIndex };
    }).sort((a, b) => (b.topCount - a.topCount) || (a.orderIndex - b.orderIndex)).map(({ continent, list }) => {
      const continentText = continentLabelSafe(continent) || continent;
      const continentHtml = escapeHtmlSafe(continentText);
      const saved = normalizeSpotterBaseSafe(String(selections.selectedByContinent[continent] || '').trim());
      const defaultSpotter = (list.length && saved && list.some((entry) => entry.spotter === saved)) ? saved : (list[0]?.spotter || '');
      if (defaultSpotter) selections.selectedByContinent[continent] = defaultSpotter;
      const options = list.length
        ? list.slice(0, 80).map((entry) => {
          const label = `${entry.spotter} (${formatNumberSafe(entry.count)})`;
          return `<option value="${escapeAttrSafe(entry.spotter)}" ${entry.spotter === defaultSpotter ? 'selected' : ''}>${escapeHtmlSafe(label)}</option>`;
        }).join('')
        : `<option value="">${rankingCached ? 'No skimmers' : 'Building list...'}</option>`;
      const statusMsg = !list.length
        ? (baseReady ? `No RBN spots found for ${continentText}.` : 'Load RBN spots to populate charts.')
        : '';
      const statusHidden = list.length ? 'hidden' : '';
      const spotterAttr = list.length ? escapeAttrSafe(defaultSpotter) : '';
      const disabledAttr = list.length ? '' : 'disabled';
      return `
        <article class="rbn-signal-card">
          <div class="rbn-signal-head">
            <h4>${continentHtml} top skimmer</h4>
            <label class="rbn-signal-picker">
              <span>Skimmer</span>
              <select class="rbn-signal-select" data-continent="${escapeAttrSafe(continent)}" ${disabledAttr}>
                ${options}
              </select>
            </label>
            <button type="button" class="button rbn-signal-copy-btn" data-continent="${escapeAttrSafe(continent)}" ${disabledAttr} aria-label="Copy ${continentHtml} graph as image">
              <span class="rbn-signal-copy-icon" aria-hidden="true"><svg viewBox="0 0 16 16" role="presentation" focusable="false"><rect x="2.25" y="2.25" width="8.5" height="8.5" rx="1.2" ry="1.2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="5.25" y="5.25" width="8.5" height="8.5" rx="1.2" ry="1.2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></span>
              <span class="rbn-signal-copy-label">Copy as image</span>
            </button>
            <button type="button" class="button rbn-signal-reset-btn" ${disabledAttr}>Reset zoom</button>
            <span class="rbn-signal-hint cqapi-muted">Drag to zoom time, double-click to reset.</span>
            <span class="rbn-signal-status cqapi-muted" ${statusHidden}>${escapeHtmlSafe(statusMsg)}</span>
          </div>
          <div class="rbn-signal-body">
            <div class="rbn-signal-plot">
              <canvas class="rbn-signal-canvas" data-continent="${escapeAttrSafe(continent)}" data-spotter="${spotterAttr}" data-height="260" role="img" aria-label="RBN signal scatter plot"></canvas>
              <div class="rbn-signal-zoom-box" hidden></div>
              <div class="rbn-signal-meta cqapi-muted">0 points plotted · SNR range: N/A</div>
            </div>
            <div class="rbn-signal-legend">
              <span class="rbn-signal-legend-bands"></span>
              <span class="rbn-legend-item rbn-legend-shape">${slotLegendHtml}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    const intro = renderReportIntroCardSafe(
      'RBN compare signal',
      'Scatter charts of RBN SNR (dB) versus time, colored by band and overlaid across loaded logs.',
      []
    );

    return `
      ${intro}
      ${renderRbnRecommendationCalloutSafe()}
      ${warning}
      <div class="export-actions">${rbnControls || '<span class="cqapi-muted">Load at least one log to enable RBN charts.</span>'}</div>
      ${compareOffer}
      <div class="rbn-signal-grid">${cards}</div>
    `;
  }

  return {
    slotMarkerShape,
    slotMarkerSymbol,
    slotLineDash,
    slotLineStyleLabel,
    slotLineStyleSample,
    slotLegendMarkerSvg,
    slotLegendLineSvg,
    renderRbnCompareSignal
  };
}
