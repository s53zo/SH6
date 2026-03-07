export function createLoadPanelRuntime(deps = {}) {
  const {
    getSlotPanel,
    getStatusElBySlot,
    getSlotStatusElBySlot,
    getRepoCompactBySlot,
    getSlotById,
    getActiveCompareSlots,
    clearSlotData,
    escapeHtml,
    focusArchiveSearchInput,
    loadDemoLog,
    getReports,
    setActiveReport,
    getViewContainer,
    slotIds = ['A', 'B', 'C', 'D']
  } = deps;

  let slotActionsBound = false;
  let loadSummaryActionsBound = false;

  function escapeHtmlSafe(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(value);
    return String(value == null ? '' : value);
  }

  function setArchiveCompact(slotId, show, pathLabel = '') {
    const { compact, text, controls } = getRepoCompactBySlot?.(slotId) || {};
    if (!(compact instanceof HTMLElement) || !(controls instanceof HTMLElement)) return;
    compact.hidden = !show;
    controls.hidden = show;
    if (text instanceof HTMLElement) {
      text.textContent = pathLabel ? `Loaded from archive: ${pathLabel}` : 'Loaded from archive.';
    }
  }

  function updateSlotStatus(slotId) {
    const slot = getSlotById?.(slotId) || null;
    const panel = getSlotPanel?.(slotId) || null;
    const statusEl = getSlotStatusElBySlot?.(slotId) || null;
    const isSkipped = !!slot?.skipped;
    const isLoaded = !!slot?.qsoData;
    const isEmpty = !isSkipped && !isLoaded;
    if (panel instanceof HTMLElement) {
      panel.classList.toggle('is-skipped', isSkipped);
      panel.classList.toggle('is-loaded', isLoaded);
      panel.classList.toggle('is-empty', isEmpty);
    }
    if (statusEl instanceof HTMLElement) {
      statusEl.textContent = isSkipped ? 'Skipped' : isLoaded ? 'Loaded' : 'Empty';
      statusEl.className = ['slot-status', isSkipped ? 'status-skipped' : '', isLoaded ? 'status-loaded' : '', isEmpty ? 'status-empty' : '']
        .filter(Boolean)
        .join(' ');
    }
    const summaryEl = getStatusElBySlot?.(slotId) || null;
    if (summaryEl instanceof HTMLElement) {
      if (isSkipped) summaryEl.textContent = 'Slot skipped.';
      else if (isEmpty) summaryEl.textContent = 'No log loaded';
    }
  }

  function updateLoadSummary() {
    const loadSummaryItems = document.getElementById('loadSummaryItems');
    const viewReportsBtn = document.getElementById('viewReportsBtn');
    const loadSummaryHint = document.getElementById('loadSummaryHint');
    if (!(loadSummaryItems instanceof HTMLElement) || !(viewReportsBtn instanceof HTMLElement)) return;
    const active = Array.isArray(getActiveCompareSlots?.()) ? getActiveCompareSlots() : [];
    const chips = active.map((entry) => {
      const slot = entry?.slot;
      const status = slot?.skipped ? 'skipped' : slot?.qsoData ? 'loaded' : 'empty';
      const label = `${entry?.label || entry?.id || 'Slot'}: ${status === 'loaded' ? 'Loaded' : status === 'skipped' ? 'Skipped' : 'Empty'}`;
      return `<span class="summary-chip ${status}">${escapeHtmlSafe(label)}</span>`;
    });
    loadSummaryItems.innerHTML = chips.join('');
    const allResolved = active.every((entry) => entry?.slot?.skipped || entry?.slot?.qsoData);
    const anyLoaded = active.some((entry) => entry?.slot?.qsoData);
    viewReportsBtn.disabled = !(allResolved && anyLoaded);
    if (loadSummaryHint instanceof HTMLElement) {
      if (!anyLoaded) loadSummaryHint.textContent = 'Load at least one log to continue.';
      else if (!allResolved) loadSummaryHint.textContent = 'Finish loading all visible slots.';
      else loadSummaryHint.textContent = 'Ready to explore reports.';
    }
  }

  function setSlotAction(slotId, action) {
    const panel = getSlotPanel?.(slotId) || null;
    if (!(panel instanceof HTMLElement)) return;
    panel.querySelectorAll('.slot-choice').forEach((btn) => {
      const isActive = btn.dataset.action === action;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.tabIndex = isActive ? 0 : -1;
    });
    panel.querySelectorAll('.slot-panel').forEach((block) => {
      const isActive = block.dataset.panel === action;
      block.classList.toggle('is-active', isActive);
      block.hidden = !isActive;
      block.setAttribute('role', 'tabpanel');
    });
    if (action !== 'skip') {
      const slot = getSlotById?.(slotId) || null;
      if (slot?.skipped) {
        slot.skipped = false;
        updateSlotStatus(slotId);
        updateLoadSummary();
      }
    }
  }

  function clearSlot(slotId) {
    clearSlotData?.(slotId);
    updateSlotStatus(slotId);
    setArchiveCompact(slotId, false);
  }

  function skipSlot(slotId) {
    clearSlot(slotId);
    const slot = getSlotById?.(slotId) || null;
    if (slot) slot.skipped = true;
    setSlotAction(slotId, 'skip');
    updateSlotStatus(slotId);
    updateLoadSummary();
  }

  function setupSlotActions() {
    if (slotActionsBound) return;
    slotActionsBound = true;
    document.querySelectorAll('.slot-choice').forEach((btn) => {
      btn.addEventListener('click', (evt) => {
        evt.preventDefault();
        const slotId = btn.dataset.slot || 'A';
        const action = btn.dataset.action || 'upload';
        if (action === 'skip') {
          skipSlot(slotId);
          return;
        }
        setSlotAction(slotId, action);
      });
    });
    document.querySelectorAll('.repo-change').forEach((btn) => {
      btn.addEventListener('click', (evt) => {
        evt.preventDefault();
        const slotId = btn.dataset.slot || 'A';
        setArchiveCompact(slotId, false);
        setSlotAction(slotId, 'archive');
        focusArchiveSearchInput?.(slotId);
      });
    });
    document.querySelectorAll('.demo-log-btn').forEach((btn) => {
      btn.addEventListener('click', (evt) => {
        evt.preventDefault();
        const slotId = btn.dataset.slot || 'A';
        setSlotAction(slotId, 'demo');
        loadDemoLog?.(slotId);
      });
    });
    (Array.isArray(slotIds) ? slotIds : ['A', 'B', 'C', 'D']).forEach((slotId) => {
      const panel = getSlotPanel?.(slotId) || null;
      const activeBtn = panel instanceof HTMLElement ? panel.querySelector('.slot-choice.is-active') : null;
      const action = activeBtn ? (activeBtn.dataset.action || 'upload') : 'upload';
      setSlotAction(slotId, action);
      updateSlotStatus(slotId);
    });
    updateLoadSummary();
  }

  function setupLoadSummaryActions() {
    const viewReportsBtn = document.getElementById('viewReportsBtn');
    if (!(viewReportsBtn instanceof HTMLElement) || loadSummaryActionsBound) return;
    loadSummaryActionsBound = true;
    viewReportsBtn.addEventListener('click', (evt) => {
      evt.preventDefault();
      const reports = Array.isArray(getReports?.()) ? getReports() : [];
      const mainIndex = reports.findIndex((report) => report?.id === 'main');
      if (mainIndex >= 0) {
        setActiveReport?.(mainIndex);
        return;
      }
      const container = getViewContainer?.() || document.getElementById('viewContainer');
      if (container instanceof HTMLElement) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  return {
    setArchiveCompact,
    updateSlotStatus,
    setSlotAction,
    updateLoadSummary,
    setupSlotActions,
    setupLoadSummaryActions
  };
}
