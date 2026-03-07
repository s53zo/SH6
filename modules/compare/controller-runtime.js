export function createCompareControllerRuntime(deps = {}) {
  const {
    getDom,
    getState,
    getReports,
    getActiveCompareSnapshots,
    getBaseReportId,
    compareScrollSyncReports,
    compareCrossHighlightReports,
    normalizeCompareScoreMode,
    cloneTsRange,
    saveCurrentComparePerspective,
    showOverlayNotice,
    renderCurrentReportWithLoading,
    setActiveReportById,
    escapeHtml,
    escapeAttr
  } = deps;

  let focusRenderTimer = null;

  function getDomSafe() {
    return getDom?.() || {};
  }

  function getStateSafe() {
    return getState?.() || {};
  }

  function getReportsSafe() {
    return Array.isArray(getReports?.()) ? getReports() : [];
  }

  function getBaseReportIdSafe(reportId) {
    if (typeof getBaseReportId === 'function') return getBaseReportId(reportId);
    return String(reportId || '').split('::')[0];
  }

  function escapeHtmlSafe(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(value);
    return String(value == null ? '' : value);
  }

  function escapeAttrSafe(value) {
    if (typeof escapeAttr === 'function') return escapeAttr(value);
    return String(value == null ? '' : value);
  }

  function escapeSelectorValue(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(value);
    }
    return String(value || '').replace(/["\\]/g, '\\$&');
  }

  function getCompareFocusPair(reportId, slotEntries) {
    const state = getStateSafe();
    const baseId = getBaseReportIdSafe(reportId);
    const ids = (Array.isArray(slotEntries) ? slotEntries : []).map((entry) => entry.id);
    const stored = state.compareFocus?.[baseId] || [];
    let left = ids.includes(stored[0]) ? stored[0] : ids[0];
    let right = ids.includes(stored[1]) ? stored[1] : ids.find((id) => id !== left);
    if (!right) right = ids.find((id) => id !== left) || left;
    if (right === left) right = ids.find((id) => id !== left) || left;
    return [left, right];
  }

  function renderCompareFocusControls(reportId, slotEntries, pair) {
    const entries = Array.isArray(slotEntries) ? slotEntries : [];
    if (entries.length <= 2) return '';
    const baseId = getBaseReportIdSafe(reportId);
    const renderOptions = (selectedId) => entries.map((entry) => {
      const selected = entry.id === selectedId ? ' selected' : '';
      return `<option value="${escapeAttrSafe(entry.id)}"${selected}>${escapeHtmlSafe(entry.label)}</option>`;
    }).join('');
    return `
      <div class="compare-focus">
        <span>Focus compare:</span>
        <select class="compare-focus-select" data-focus-report="${escapeAttrSafe(baseId)}" data-focus-role="a">
          ${renderOptions(pair[0])}
        </select>
        <span>vs</span>
        <select class="compare-focus-select" data-focus-report="${escapeAttrSafe(baseId)}" data-focus-role="b">
          ${renderOptions(pair[1])}
        </select>
      </div>
    `;
  }

  function resolveFocusEntries(reportId, slotEntries) {
    const entries = Array.isArray(slotEntries) ? slotEntries : [];
    const pair = getCompareFocusPair(reportId, entries);
    const left = entries.find((entry) => entry.id === pair[0]) || entries[0];
    const right = entries.find((entry) => entry.id === pair[1]) || entries.find((entry) => entry.id !== (left && left.id));
    return {
      pair,
      entries: [left, right].filter(Boolean)
    };
  }

  function clearCompareCrossHighlights(root) {
    if (!(root instanceof HTMLElement)) return;
    root.querySelectorAll('.compare-highlight-cell, .compare-highlight-row, .compare-focus-target').forEach((el) => {
      el.classList.remove('compare-highlight-cell', 'compare-highlight-row', 'compare-focus-target');
    });
  }

  function bindCompareScrollSync(reportId) {
    const state = getStateSafe();
    const baseId = getBaseReportIdSafe(reportId);
    if (!state.compareEnabled) return;
    if (!compareScrollSyncReports?.has?.(baseId)) return;
    const scrollers = Array.from(document.querySelectorAll('.compare-scroll-sync[data-sync-group]'));
    if (scrollers.length < 2) return;
    const groups = new Map();
    scrollers.forEach((el) => {
      const key = String(el.dataset.syncGroup || '').trim();
      if (!key) return;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });
    groups.forEach((items) => {
      if (!Array.isArray(items) || items.length < 2) return;
      let syncing = false;
      const muted = new WeakSet();
      const syncTo = (source) => {
        const left = source.scrollLeft;
        items.forEach((el) => {
          if (el === source) return;
          if (Math.abs((el.scrollLeft || 0) - left) < 1) return;
          muted.add(el);
          el.scrollLeft = left;
          requestAnimationFrame(() => muted.delete(el));
        });
      };
      items.forEach((el) => {
        if (el.dataset.syncBound === '1') return;
        el.dataset.syncBound = '1';
        el.addEventListener('scroll', () => {
          if (muted.has(el) || syncing) return;
          syncing = true;
          syncTo(el);
          syncing = false;
        }, { passive: true });
      });
      syncTo(items[0]);
    });
  }

  function bindCompareCrossHighlights(reportId) {
    const state = getStateSafe();
    const dom = getDomSafe();
    const baseId = getBaseReportIdSafe(reportId);
    if (!state.compareEnabled) return;
    if (!compareCrossHighlightReports?.has?.(baseId)) return;
    const root = dom.viewContainer instanceof HTMLElement
      ? dom.viewContainer.querySelector(`.compare-grid[data-compare-report="${escapeSelectorValue(baseId)}"]`)
      : null;
    if (!(root instanceof HTMLElement) || root.dataset.crossHighlightBound === '1') return;
    root.dataset.crossHighlightBound = '1';
    const activate = (target) => {
      const cell = target instanceof Element ? target.closest('[data-compare-cell-key]') : null;
      const row = target instanceof Element ? target.closest('[data-compare-row-key]') : null;
      if (!cell && !row) return;
      clearCompareCrossHighlights(root);
      if (row) {
        const rowKey = String(row.getAttribute('data-compare-row-key') || '');
        if (rowKey) {
          root.querySelectorAll(`[data-compare-row-key="${escapeSelectorValue(rowKey)}"]`).forEach((el) => {
            el.classList.add('compare-highlight-row');
          });
        }
      }
      if (cell) {
        const cellKey = String(cell.getAttribute('data-compare-cell-key') || '');
        if (cellKey) {
          root.querySelectorAll(`[data-compare-cell-key="${escapeSelectorValue(cellKey)}"]`).forEach((el) => {
            el.classList.add('compare-highlight-cell');
          });
        }
      }
    };
    root.addEventListener('mouseover', (evt) => activate(evt.target));
    root.addEventListener('focusin', (evt) => activate(evt.target));
    root.addEventListener('mouseleave', () => clearCompareCrossHighlights(root));
    root.addEventListener('focusout', () => {
      requestAnimationFrame(() => {
        if (!root.contains(document.activeElement)) clearCompareCrossHighlights(root);
      });
    });
  }

  function bindWorkspaceInteractions(reportId) {
    const dom = getDomSafe();
    const state = getStateSafe();
    if (!(dom.viewContainer instanceof HTMLElement)) return;

    bindCompareScrollSync(reportId);
    bindCompareCrossHighlights(reportId);

    const compareToggleButtons = dom.viewContainer.querySelectorAll('.compare-ui-toggle');
    compareToggleButtons.forEach((btn) => {
      btn.addEventListener('click', (evt) => {
        evt.preventDefault();
        const nextScoreMode = btn.dataset.compareScoreMode;
        if (nextScoreMode) {
          const normalized = normalizeCompareScoreMode?.(nextScoreMode);
          if (normalized === state.compareScoreMode) return;
          state.compareScoreMode = normalized;
          renderCurrentReportWithLoading?.();
          return;
        }
        const rangeAction = String(btn.dataset.compareRangeAction || '').trim().toLowerCase();
        if (rangeAction === 'lock-current') {
          const currentRange = cloneTsRange?.(state.logTimeRange);
          if (!currentRange) {
            showOverlayNotice?.('Apply a time filter in Log first, then lock it for compare.', 2600);
            return;
          }
          state.compareTimeRangeLock = currentRange;
          renderCurrentReportWithLoading?.();
          return;
        }
        if (rangeAction === 'clear-lock') {
          if (!state.compareTimeRangeLock) return;
          state.compareTimeRangeLock = null;
          renderCurrentReportWithLoading?.();
          return;
        }
        const perspectiveAction = String(btn.dataset.comparePerspectiveAction || '').trim().toLowerCase();
        if (perspectiveAction === 'save') {
          const saved = saveCurrentComparePerspective?.();
          if (saved?.label) {
            showOverlayNotice?.(`Saved perspective: ${saved.label}`, 2200);
          }
          return;
        }
        const toggle = String(btn.dataset.compareToggle || '').trim().toLowerCase();
        if (toggle === 'sync') {
          state.compareSyncEnabled = !state.compareSyncEnabled;
        } else if (toggle === 'sticky') {
          state.compareStickyEnabled = !state.compareStickyEnabled;
        } else {
          return;
        }
        renderCurrentReportWithLoading?.();
      });
    });

    const compareJumpButtons = dom.viewContainer.querySelectorAll('[data-compare-jump]');
    compareJumpButtons.forEach((btn) => {
      btn.addEventListener('click', (evt) => {
        evt.preventDefault();
        const targetId = String(btn.dataset.compareJump || '').trim();
        if (!targetId) return;
        const reports = getReportsSafe();
        if (reports[state.activeIndex]?.id === targetId) {
          renderCurrentReportWithLoading?.();
          return;
        }
        setActiveReportById?.(targetId, { silent: true });
      });
    });

    const compareFocusButtons = dom.viewContainer.querySelectorAll('[data-compare-focus-cell-key]');
    compareFocusButtons.forEach((btn) => {
      btn.addEventListener('click', (evt) => {
        evt.preventDefault();
        const cellKey = String(btn.dataset.compareFocusCellKey || '').trim();
        if (!cellKey) return;
        const baseId = getBaseReportIdSafe(reportId);
        const grid = dom.viewContainer.querySelector(`.compare-grid[data-compare-report="${escapeSelectorValue(baseId)}"]`);
        if (!(grid instanceof HTMLElement)) return;
        const selector = `[data-compare-cell-key="${escapeSelectorValue(cellKey)}"]`;
        const cells = Array.from(grid.querySelectorAll(selector));
        if (!cells.length) {
          showOverlayNotice?.('No matching compare cell is visible for that jump.', 2200);
          return;
        }
        clearCompareCrossHighlights(grid);
        cells.forEach((cell) => cell.classList.add('compare-highlight-cell', 'compare-focus-target'));
        const rowKey = String(cells[0].closest('[data-compare-row-key]')?.getAttribute('data-compare-row-key') || '');
        if (rowKey) {
          const rowSelector = `[data-compare-row-key="${escapeSelectorValue(rowKey)}"]`;
          grid.querySelectorAll(rowSelector).forEach((row) => row.classList.add('compare-highlight-row'));
        }
        const reduceMotion = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        cells[0].scrollIntoView({
          block: 'center',
          inline: 'center',
          behavior: reduceMotion ? 'auto' : 'smooth'
        });
      });
    });

    const focusSelects = dom.viewContainer.querySelectorAll('.compare-focus-select');
    if (!focusSelects.length) return;
    focusSelects.forEach((select) => {
      select.addEventListener('change', () => {
        const baseId = select.dataset.focusReport || '';
        if (!baseId) return;
        const role = select.dataset.focusRole || 'a';
        const slots = getActiveCompareSnapshots?.() || [];
        if (slots.length <= 2) return;
        const [currentLeft, currentRight] = getCompareFocusPair(baseId, slots);
        let left = currentLeft;
        let right = currentRight;
        if (role === 'a') left = select.value;
        else right = select.value;
        if (left === right) {
          const alt = slots.map((slot) => slot.id).find((id) => id !== left);
          if (role === 'a') right = alt || right;
          else left = alt || left;
        }
        state.compareFocus = state.compareFocus || {};
        state.compareFocus[baseId] = [left, right];
        if (focusRenderTimer) clearTimeout(focusRenderTimer);
        focusRenderTimer = setTimeout(() => {
          try {
            renderCurrentReportWithLoading?.();
          } catch (err) {
            console.error('Focus render failed:', err);
            showOverlayNotice?.('Unable to update focus view. Please try again.', 3000);
          }
        }, 0);
      });
    });
  }

  return {
    bindWorkspaceInteractions,
    bindCompareScrollSync,
    bindCompareCrossHighlights,
    clearCompareCrossHighlights,
    getCompareFocusPair,
    renderCompareFocusControls,
    resolveFocusEntries
  };
}
