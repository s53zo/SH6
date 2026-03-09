export function createSpotsCompareRuntime(deps = {}) {
  const {
    getState,
    getActiveCompareSnapshots,
    getSpotStateBySource,
    getAvailableBands,
    sortBands,
    formatBandLabel,
    bandClass,
    escapeAttr,
    escapeHtml,
    renderSpotsCompareSlot,
    renderComparePanels,
    renderRbnRecommendationCallout
  } = deps;

  function getStateSafe() {
    return getState?.() || {};
  }

  function getActiveCompareSnapshotsSafe() {
    return Array.isArray(getActiveCompareSnapshots?.()) ? getActiveCompareSnapshots() : [];
  }

  function getSpotStateBySourceSafe(slot, source) {
    return getSpotStateBySource?.(slot, source) || {};
  }

  function getAvailableBandsSafe(includeUnknown = false) {
    return Array.isArray(getAvailableBands?.(includeUnknown)) ? getAvailableBands(includeUnknown) : [];
  }

  function sortBandsSafe(values) {
    if (typeof sortBands === 'function') return sortBands(values);
    return Array.isArray(values) ? values.slice().sort() : [];
  }

  function formatBandLabelSafe(value) {
    if (typeof formatBandLabel === 'function') return formatBandLabel(value);
    return String(value || '').trim().toUpperCase();
  }

  function bandClassSafe(value) {
    if (typeof bandClass === 'function') return bandClass(value);
    return '';
  }

  function escapeAttrSafe(value) {
    if (typeof escapeAttr === 'function') return escapeAttr(value);
    return String(value == null ? '' : value);
  }

  function escapeHtmlSafe(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(value);
    return String(value == null ? '' : value);
  }

  function renderSpotsCompareSlotSafe(entry, source) {
    if (typeof renderSpotsCompareSlot === 'function') return renderSpotsCompareSlot(entry, source);
    return `<p>No ${escapeHtmlSafe(entry?.label || 'log')} loaded.</p>`;
  }

  function renderComparePanelsSafe(slotEntries, htmlBlocks, reportId, options = {}) {
    if (typeof renderComparePanels === 'function') return renderComparePanels(slotEntries, htmlBlocks, reportId, options);
    return htmlBlocks.join('');
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

  function normalizeHeadingLabel(text) {
    return String(text || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  function renderSpotsSharedControls(source) {
    const state = getStateSafe();
    const sourceAttr = escapeAttrSafe(source);
    const spotState = getSpotStateBySourceSafe(state, source);
    const windowMinutes = Number(spotState.windowMinutes) || 15;
    const bandFilterSet = new Set(spotState.bandFilter || []);
    const baseBands = getAvailableBandsSafe(true).filter((band) => band && String(band).toLowerCase() !== 'unknown');
    const bandOptions = sortBandsSafe(baseBands);
    return `
      <div class="spots-controls">
        <label>Match window (minutes): <span class="spots-window-value" data-shared="1" data-source="${sourceAttr}">${windowMinutes}</span></label>
        <input class="spots-window" data-shared="1" data-source="${sourceAttr}" type="range" min="1" max="60" step="1" value="${windowMinutes}">
      </div>
      <div class="spots-filters">
        <label class="spots-filter">
          <input type="checkbox" class="spots-band-filter" data-shared="1" data-source="${sourceAttr}" data-band="ALL" ${bandFilterSet.size ? '' : 'checked'}>
          <span>All bands</span>
        </label>
        ${bandOptions.map((band) => {
          const label = band === 'unknown' ? 'Unknown' : formatBandLabelSafe(band);
          const checked = bandFilterSet.has(band) ? 'checked' : '';
          const cls = band === 'unknown' ? '' : bandClassSafe(band);
          return `
            <label class="spots-filter ${cls}">
              <input type="checkbox" class="spots-band-filter" data-shared="1" data-source="${sourceAttr}" data-band="${escapeAttrSafe(band)}" ${checked}>
              <span>${escapeHtmlSafe(label)}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderSpotsCompare(source) {
    const slots = getActiveCompareSnapshotsSafe();
    const htmlBlocks = slots.map((entry) => (
      entry.ready
        ? renderSpotsCompareSlotSafe(entry, source)
        : `<p>No ${escapeHtmlSafe(entry.label)} loaded.</p>`
    ));
    const controls = renderSpotsSharedControls(source);
    const topNotice = source === 'rbn' ? renderRbnRecommendationCalloutSafe() : '';
    return `${topNotice}${controls}${renderComparePanelsSafe(slots, htmlBlocks, source === 'rbn' ? 'rbn_spots' : 'spots')}`;
  }

  function buildSpotsAlignBlocks(panelEl, stopHeading = 'all spots of you') {
    if (!(panelEl instanceof HTMLElement)) return [];
    const children = Array.from(panelEl.children);
    if (!children.length) return [];
    const isHeadingNode = (el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (!el.classList.contains('export-actions') || !el.classList.contains('export-note')) return false;
      const first = el.firstElementChild;
      return Boolean(first && first.tagName === 'B');
    };
    const headingIndices = [];
    let stopIndex = children.length;
    const stopKey = normalizeHeadingLabel(stopHeading);
    for (let i = 0; i < children.length; i += 1) {
      const el = children[i];
      if (!isHeadingNode(el)) continue;
      const heading = normalizeHeadingLabel(el.firstElementChild?.textContent || '');
      if (stopKey && heading === stopKey) {
        stopIndex = i;
        break;
      }
      headingIndices.push(i);
    }
    if (!headingIndices.length) return [];
    const blocks = [];
    for (let i = 0; i < headingIndices.length; i += 1) {
      const start = headingIndices[i];
      const nextStart = headingIndices[i + 1] != null ? headingIndices[i + 1] : stopIndex;
      if (start >= nextStart) continue;
      const wrapper = document.createElement('div');
      wrapper.className = 'spots-align-block';
      wrapper.dataset.alignIdx = String(i);
      const firstNode = children[start];
      if (!firstNode || firstNode.parentElement !== panelEl) continue;
      panelEl.insertBefore(wrapper, firstNode);
      for (let k = start; k < nextStart; k += 1) {
        const node = children[k];
        if (node && node.parentElement === panelEl) {
          wrapper.appendChild(node);
        }
      }
      blocks.push(wrapper);
    }
    return blocks;
  }

  function alignSpotsCompareSections(reportId) {
    const id = String(reportId || '').split('::')[0];
    const state = getStateSafe();
    if (id !== 'spots' && id !== 'rbn_spots') return;
    if (!state.compareEnabled) return;
    if ((globalThis.window?.innerWidth || 0) < 768) return;
    const panels = Array.from(document.querySelectorAll('.compare-panel .spots-panel'));
    if (panels.length < 2) return;
    const blockSets = panels.map((panel) => buildSpotsAlignBlocks(panel, 'all spots of you'));
    const maxBlocks = Math.max(0, ...blockSets.map((list) => list.length));
    for (let i = 0; i < maxBlocks; i += 1) {
      const group = blockSets.map((list) => list[i]).filter(Boolean);
      if (group.length < 2) continue;
      group.forEach((el) => {
        el.style.minHeight = '';
      });
      const target = Math.max(...group.map((el) => el.offsetHeight));
      group.forEach((el) => {
        el.style.minHeight = `${target}px`;
      });
    }
  }

  return {
    renderSpotsSharedControls,
    renderSpotsCompare,
    buildSpotsAlignBlocks,
    alignSpotsCompareSections
  };
}
