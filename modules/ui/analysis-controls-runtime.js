export function createAnalysisControlsRuntime(deps = {}) {
  const {
    getDom,
    getState,
    normalizeAnalysisMode,
    clearAnalysisModeSuggestion,
    invalidateCompareLogData,
    updateBandRibbon,
    rebuildReports,
    renderActiveReport,
    updateLoadSummary,
    syncPeriodFiltersWithAvailableData,
    recomputeDerived,
    trackEvent,
    showOverlayNotice,
    resolveAnalysisModeLabel,
    analysisModeDefault = 'contester',
    analysisModeDxer = 'dxer',
    analysisModeDifferenceText = ''
  } = deps;

  let compareToggleBound = false;
  let analysisToggleBound = false;

  function getDomSafe() {
    return getDom?.() || {};
  }

  function getStateSafe() {
    return getState?.() || {};
  }

  function setCompareCount(count, updateRadios = false) {
    const dom = getDomSafe();
    const state = getStateSafe();
    const safeCount = Math.min(4, Math.max(1, Number(count) || 1));
    state.compareCount = safeCount;
    state.compareEnabled = safeCount > 1;
    document.body.classList.toggle('compare-mode', state.compareEnabled);
    document.body.classList.remove('compare-count-1', 'compare-count-2', 'compare-count-3', 'compare-count-4');
    document.body.classList.add(`compare-count-${safeCount}`);
    if (dom.compareHelper instanceof HTMLElement) {
      dom.compareHelper.textContent = safeCount > 1
        ? `Comparing ${safeCount} logs`
        : 'Single log mode';
    }
    if (updateRadios && dom.compareModeRadios && dom.compareModeRadios.length) {
      dom.compareModeRadios.forEach((radio) => {
        radio.checked = Number(radio.value) === safeCount;
      });
    }
    invalidateCompareLogData?.();
    updateBandRibbon?.();
    rebuildReports?.();
    renderActiveReport?.();
    updateLoadSummary?.();
  }

  function syncLoadPanelFlowForAnalysisMode() {
    const dom = getDomSafe();
    const state = getStateSafe();
    const isDxer = state.analysisMode === analysisModeDxer;
    document.body.classList.toggle('analysis-mode-dxer', isDxer);
    if (dom.loadTipBadge instanceof HTMLElement) {
      dom.loadTipBadge.hidden = isDxer;
      dom.loadTipBadge.style.display = isDxer ? 'none' : '';
    }
    if (dom.compareModeLoadStep instanceof HTMLElement) {
      dom.compareModeLoadStep.hidden = isDxer;
    }
    if (dom.loadStepAnalysisTitle instanceof HTMLElement) {
      dom.loadStepAnalysisTitle.textContent = 'Step 1 · Choose analysis mode';
    }
    if (dom.loadStepCompareTitle instanceof HTMLElement) {
      dom.loadStepCompareTitle.textContent = isDxer
        ? 'Step 2 · Log compare is disabled in DXer mode'
        : 'Step 2 · Choose how many logs to compare';
    }
    if (dom.loadStepLoadTitle instanceof HTMLElement) {
      dom.loadStepLoadTitle.textContent = isDxer ? 'Step 2 · Load logs' : 'Step 3 · Load logs';
    }
    if (dom.loadStepReportsTitle instanceof HTMLElement) {
      dom.loadStepReportsTitle.textContent = isDxer ? 'Step 3 · View reports' : 'Step 4 · View reports';
    }
    if (dom.loadPanelSubtitle instanceof HTMLElement) {
      dom.loadPanelSubtitle.textContent = isDxer
        ? 'Choose analysis mode first, then load one log to continue.'
        : 'Choose analysis mode first, then choose compare mode and load logs.';
    }
  }

  function enforceCompareCountForAnalysisMode(mode, previousMode = '') {
    const state = getStateSafe();
    if (mode === analysisModeDxer) {
      if (state.compareCount > 1) {
        state.compareCountBeforeDxer = Math.min(4, Math.max(1, Number(state.compareCount) || 1));
      }
      if (state.compareCount !== 1) {
        setCompareCount(1, previousMode !== analysisModeDxer);
      }
      return;
    }
    const restoreCount = Math.min(4, Math.max(1, Number(state.compareCountBeforeDxer) || 1));
    if (state.compareCount !== restoreCount) {
      setCompareCount(restoreCount, previousMode === analysisModeDxer);
    }
  }

  function setAnalysisMode(mode, updateRadios = false) {
    const dom = getDomSafe();
    const state = getStateSafe();
    const safeMode = normalizeAnalysisMode?.(mode) || analysisModeDefault;
    const previousMode = state.analysisMode;
    state.analysisMode = safeMode;
    clearAnalysisModeSuggestion?.();
    if (previousMode !== safeMode) {
      enforceCompareCountForAnalysisMode(safeMode, previousMode);
    }
    if (updateRadios && dom.analysisModeRadios && dom.analysisModeRadios.length) {
      dom.analysisModeRadios.forEach((radio) => {
        radio.checked = String(radio.value) === safeMode;
      });
    }
    syncLoadPanelFlowForAnalysisMode();
    syncPeriodFiltersWithAvailableData?.();
    rebuildReports?.();
    const hasLoadedLog = !!state.qsoData || (Array.isArray(state.compareSlots) && state.compareSlots.some((slot) => slot && slot.qsoData));
    if (hasLoadedLog) {
      recomputeDerived?.('analysisMode').catch((err) => {
        console.warn('Analysis-mode rederive failed:', err);
      });
      return;
    }
    renderActiveReport?.();
  }

  function bindAnalysisModeDiffHint() {
    const dom = getDomSafe();
    if (!(dom.analysisModeDiffHint instanceof HTMLElement) || !(dom.analysisModeDiffTooltip instanceof HTMLElement)) return;
    if (dom.analysisModeDiffHint.dataset.analysisModeBound === 'true') return;
    dom.analysisModeDiffHint.dataset.analysisModeBound = 'true';
    const diffHint = dom.analysisModeDiffHint;
    const tooltip = dom.analysisModeDiffTooltip;
    const text = diffHint.getAttribute('data-analysis-mode-diff-hint') || analysisModeDifferenceText;
    tooltip.textContent = text;
    const showDiffHint = () => {
      tooltip.textContent = text;
      tooltip.hidden = false;
      tooltip.setAttribute('aria-hidden', 'false');
      tooltip.classList.add('analysis-mode-diff-tooltip-visible');
    };
    const hideDiffHint = () => {
      tooltip.hidden = true;
      tooltip.setAttribute('aria-hidden', 'true');
      tooltip.classList.remove('analysis-mode-diff-tooltip-visible');
    };
    diffHint.addEventListener('mouseenter', showDiffHint);
    diffHint.addEventListener('mouseleave', hideDiffHint);
    diffHint.addEventListener('focus', showDiffHint);
    diffHint.addEventListener('blur', hideDiffHint);
    diffHint.addEventListener('click', (evt) => {
      evt.preventDefault();
      if (tooltip.hidden) showDiffHint();
      else hideDiffHint();
    });
    document.addEventListener('click', (evt) => {
      if (evt.target === diffHint || tooltip.contains(evt.target)) return;
      hideDiffHint();
    });
    diffHint.addEventListener('keydown', (evt) => {
      if (evt.key !== 'Escape') return;
      hideDiffHint();
    });
    hideDiffHint();
  }

  function setupCompareToggle() {
    const dom = getDomSafe();
    if (!dom.compareModeRadios || !dom.compareModeRadios.length) return;
    if (!compareToggleBound) {
      compareToggleBound = true;
      dom.compareModeRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
          if (!radio.checked) return;
          trackEvent?.('compare_mode_change', {
            count: Number(radio.value) || 1
          });
          setCompareCount(radio.value, false);
        });
      });
    }
    const selected = Array.from(dom.compareModeRadios).find((radio) => radio.checked);
    setCompareCount(selected ? selected.value : 1, true);
  }

  function setupAnalysisModeToggle() {
    const dom = getDomSafe();
    if (!dom.analysisModeRadios || !dom.analysisModeRadios.length) return;
    if (!analysisToggleBound) {
      analysisToggleBound = true;
      dom.analysisModeRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
          if (!radio.checked) return;
          trackEvent?.('analysis_mode_change', {
            mode: String(radio.value || '').trim().toLowerCase()
          });
          setAnalysisMode(radio.value, true);
        });
      });
      if (dom.analysisModeSuggestion instanceof HTMLElement) {
        dom.analysisModeSuggestion.addEventListener('click', (evt) => {
          const btn = evt.target && evt.target.closest ? evt.target.closest('[data-mode-suggestion]') : null;
          if (!btn) return;
          const targetMode = btn.dataset.modeSuggestion;
          setAnalysisMode(targetMode, true);
          showOverlayNotice?.(`Analysis mode set to ${resolveAnalysisModeLabel?.(targetMode) || targetMode || ''}.`);
        });
      }
      bindAnalysisModeDiffHint();
    }
    const selected = Array.from(dom.analysisModeRadios).find((radio) => radio.checked);
    setAnalysisMode(selected ? selected.value : analysisModeDefault, true);
  }

  return {
    setCompareCount,
    syncLoadPanelFlowForAnalysisMode,
    setAnalysisMode,
    setupCompareToggle,
    setupAnalysisModeToggle
  };
}
