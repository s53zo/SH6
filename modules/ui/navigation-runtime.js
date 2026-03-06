export function createNavigationRuntime(deps = {}) {
  const {
    getDom,
    getState,
    getReports,
    navSections,
    navSectionByReport,
    trackEvent,
    renderReport,
    bindReportInteractions,
    destroyVirtualTableControllers,
    renderRetainedReportContent,
    isRetainedReport,
    escapeAttr,
    trackRenderPerf,
    renderMapView,
    scheduleAutosaveSession,
    shouldPeriodFilterReport,
    updatePeriodRibbon,
    analysisModeDxer
  } = deps;

  let navStickyBottomBound = false;
  let navSearchBound = false;
  let renderSeq = 0;

  function getDomSafe() {
    return getDom?.() || {};
  }

  function getStateSafe() {
    return getState?.() || {};
  }

  function getReportsSafe() {
    return Array.isArray(getReports?.()) ? getReports() : [];
  }

  function escapeAttrSafe(value) {
    if (typeof escapeAttr === 'function') return escapeAttr(value);
    return String(value == null ? '' : value);
  }

  function bindNavStickyBottom() {
    const dom = getDomSafe();
    if (navStickyBottomBound || !dom.navList) return;
    navStickyBottomBound = true;
    const scrollEl = dom.navList;
    const bottomThresholdPx = 10;
    let shouldStick = false;

    const isNearBottom = () => {
      const remaining = scrollEl.scrollHeight - (scrollEl.scrollTop + scrollEl.clientHeight);
      return remaining <= bottomThresholdPx;
    };

    scrollEl.addEventListener('click', (evt) => {
      const target = evt.target instanceof Element ? evt.target : null;
      if (!target) return;
      const summary = target.closest('summary');
      if (!summary || !scrollEl.contains(summary)) return;
      shouldStick = isNearBottom();
    }, true);

    scrollEl.addEventListener('toggle', (evt) => {
      const details = evt.target;
      if (!(details instanceof HTMLDetailsElement)) return;
      if (!scrollEl.contains(details)) return;
      if (!details.open) return;
      if (!shouldStick) return;
      requestAnimationFrame(() => {
        scrollEl.scrollTop = scrollEl.scrollHeight;
        shouldStick = false;
      });
    }, true);
  }

  function applyNavSearchFilter(rawTerm = '') {
    const dom = getDomSafe();
    const state = getStateSafe();
    if (!dom.navList) return;
    const rawValue = String(rawTerm || '').trim();
    const term = rawValue.toLowerCase();
    state.navSearch = term;
    const navNodes = Array.from(dom.navList.querySelectorAll('[data-index]'));
    navNodes.forEach((el) => {
      const text = String(el.dataset.searchText || el.textContent || '').trim().toLowerCase();
      const visible = !term || text.includes(term);
      el.classList.toggle('nav-hidden', !visible);
    });

    const groups = Array.from(dom.navList.querySelectorAll('.nav-group'));
    groups.forEach((details) => {
      const visibleChildren = details.querySelectorAll('[data-index]:not(.nav-hidden)');
      const visible = visibleChildren.length > 0;
      details.classList.toggle('nav-hidden', !visible);
      if (term && visible) details.open = true;
    });

    const sectionItems = Array.from(dom.navList.querySelectorAll('.nav-section-item'));
    sectionItems.forEach((item) => {
      const visibleNodes = item.querySelectorAll('[data-index]:not(.nav-hidden)');
      const visible = visibleNodes.length > 0;
      item.classList.toggle('nav-hidden', !visible);
      const sectionDetails = item.querySelector('.nav-section');
      if (sectionDetails && term && visible) sectionDetails.open = true;
    });

    if (dom.navSearchEmpty) {
      const finalVisibleCount = navNodes.filter((el) => !el.classList.contains('nav-hidden') && !el.closest('.nav-hidden')).length;
      const showEmpty = Boolean(term) && finalVisibleCount === 0;
      dom.navSearchEmpty.hidden = !showEmpty;
      dom.navSearchEmpty.setAttribute('aria-hidden', showEmpty ? 'false' : 'true');
      dom.navSearchEmpty.textContent = showEmpty
        ? `No reports match "${rawValue}". Try a shorter term or press Esc to clear.`
        : '';
    }
  }

  function setupNavSearch() {
    const dom = getDomSafe();
    const state = getStateSafe();
    if (!dom.navSearchInput || navSearchBound) return;
    navSearchBound = true;
    dom.navSearchInput.value = state.navSearch || '';
    dom.navSearchInput.addEventListener('input', () => {
      applyNavSearchFilter(dom.navSearchInput.value);
    });
    dom.navSearchInput.addEventListener('keydown', (evt) => {
      if (evt.key !== 'Escape') return;
      evt.preventDefault();
      dom.navSearchInput.value = '';
      applyNavSearchFilter('');
    });
    document.addEventListener('keydown', (evt) => {
      if (evt.defaultPrevented) return;
      const target = evt.target instanceof HTMLElement ? evt.target : null;
      const inInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (inInput) return;
      if (evt.key === '/' || ((evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === 'k')) {
        evt.preventDefault();
        dom.navSearchInput.focus();
        dom.navSearchInput.select();
      }
    });
  }

  function updateNavHighlight() {
    const dom = getDomSafe();
    const state = getStateSafe();
    if (!dom.navList) return;
    const items = dom.navList.querySelectorAll('[data-index]');
    const mapActive = !!state.mapViewActive;
    items.forEach((el) => {
      const isActive = !mapActive && Number(el.dataset.index) === state.activeIndex;
      el.classList.toggle('active', isActive);
      const base = el.dataset.baseClass;
      if (base) el.classList.add(base);
      el.classList.toggle('sli', isActive);
      if (isActive) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
      if (isActive) {
        const details = el.closest('details');
        if (details && !el.classList.contains('nav-summary')) details.open = true;
      }
    });
  }

  function updatePrevNextButtons() {
    const dom = getDomSafe();
    const state = getStateSafe();
    const reports = getReportsSafe();
    if (dom.prevBtn) dom.prevBtn.disabled = state.activeIndex === 0;
    if (dom.nextBtn) dom.nextBtn.disabled = state.activeIndex === reports.length - 1;
  }

  function showLoadingState(message) {
    const dom = getDomSafe();
    if (!dom.viewContainer) return;
    document.body.classList.add('is-loading');
    dom.viewContainer.setAttribute('aria-busy', 'true');
    dom.viewContainer.innerHTML = `
      <div class="loading-state" role="status" aria-live="polite">
        <div class="loading-spinner"></div>
        <div class="loading-text">${message}</div>
      </div>
    `;
  }

  function clearLoadingState() {
    const dom = getDomSafe();
    document.body.classList.remove('is-loading');
    if (dom.viewContainer) dom.viewContainer.setAttribute('aria-busy', 'false');
  }

  function renderReportWithLoading(report) {
    const dom = getDomSafe();
    const state = getStateSafe();
    const seq = ++renderSeq;
    const title = report?.title || 'report';
    showLoadingState(`Preparing ${title}...`);
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (seq !== renderSeq) return;
        const startedAt = (typeof performance !== 'undefined' && typeof performance.now === 'function')
          ? performance.now()
          : Date.now();
        const html = renderReport?.(report) || '';
        const elapsedMs = (typeof performance !== 'undefined' && typeof performance.now === 'function')
          ? (performance.now() - startedAt)
          : (Date.now() - startedAt);
        trackRenderPerf?.(report?.id, elapsedMs, html?.length || 0);
        if (seq !== renderSeq) return;
        destroyVirtualTableControllers?.();
        const retainedKey = String(report?.id || '').split('::')[0];
        const retainedRoot = isRetainedReport?.(retainedKey) && dom.viewContainer instanceof HTMLElement
          ? dom.viewContainer.querySelector(`[data-retained-root="${escapeAttrSafe(retainedKey)}"]`)
          : null;
        if (retainedRoot instanceof HTMLElement) {
          retainedRoot.innerHTML = renderRetainedReportContent?.(retainedKey) || '';
        } else if (dom.viewContainer) {
          dom.viewContainer.innerHTML = html;
        }
        bindReportInteractions?.(report?.id || '');
        if (dom.loadPanel) {
          if (report?.id === 'load_logs') {
            dom.loadPanel.style.display = state.showLoadPanel ? 'block' : 'none';
          } else {
            dom.loadPanel.style.display = 'none';
            state.showLoadPanel = false;
          }
        }
        if (dom.bandRibbon) {
          dom.bandRibbon.style.display = report?.id === 'load_logs' ? 'none' : '';
        }
        if (dom.periodFilterRibbon) {
          const isPeriodReport = report && shouldPeriodFilterReport?.(report.id);
          const shouldShow = report?.id !== 'load_logs' && isPeriodReport && state.analysisMode === analysisModeDxer;
          dom.periodFilterRibbon.style.display = shouldShow ? '' : 'none';
          if (shouldShow) {
            updatePeriodRibbon?.();
          }
        }
        const isLoadReport = report?.id === 'load_logs';
        document.body.classList.toggle('landing-only', isLoadReport && !state.showLoadPanel);
        document.body.classList.toggle('load-active', isLoadReport && state.showLoadPanel);
        const landingPage = document.querySelector('.landing-page');
        if (landingPage) {
          landingPage.classList.toggle('is-hidden', isLoadReport && state.showLoadPanel);
        }
        clearLoadingState();
        scheduleAutosaveSession?.();
      }, 0);
    });
  }

  function renderActiveReport() {
    const dom = getDomSafe();
    const state = getStateSafe();
    const reports = getReportsSafe();
    if (state.mapViewActive) {
      if (dom.viewTitle) dom.viewTitle.textContent = 'Map';
      destroyVirtualTableControllers?.();
      if (dom.viewContainer) dom.viewContainer.innerHTML = renderMapView?.() || '';
      bindReportInteractions?.('map_view');
      return;
    }
    const report = reports[state.activeIndex];
    if (!report) return;
    renderReportWithLoading(report);
  }

  function setActiveReport(idx) {
    const dom = getDomSafe();
    const state = getStateSafe();
    const reports = getReportsSafe();
    state.mapViewActive = false;
    document.body.classList.remove('map-view', 'map-full');
    state.activeIndex = idx;
    const report = reports[idx];
    if (!report) return;
    if (dom.viewTitle) dom.viewTitle.textContent = report.title;
    updateNavHighlight();
    updatePrevNextButtons();
    renderReportWithLoading(report);
  }

  function initNavigation() {
    const dom = getDomSafe();
    const state = getStateSafe();
    const reports = getReportsSafe();
    if (!dom.navList) return;
    dom.navList.innerHTML = '';
    const groups = new Map();
    reports.forEach((report, index) => {
      if (!report?.parentId) return;
      if (!groups.has(report.parentId)) groups.set(report.parentId, []);
      groups.get(report.parentId).push({ report, index });
    });
    const groupParentIds = new Set(groups.keys());
    const sections = Array.isArray(navSections) ? navSections : [];
    const sectionMap = new Map(sections.map((section) => [section.id, { ...section, items: [] }]));
    const fallbackSectionId = sections[0]?.id || 'load_core';
    const bindKeyboardActivation = (el, onActivate) => {
      if (!el || typeof onActivate !== 'function') return;
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.addEventListener('keydown', (evt) => {
        if (evt.key !== 'Enter' && evt.key !== ' ') return;
        evt.preventDefault();
        onActivate();
      });
    };
    const getSectionIdForReport = (report) => {
      const direct = navSectionByReport?.[report?.id];
      if (direct) return direct;
      if (report?.parentId && navSectionByReport?.[report.parentId]) return navSectionByReport[report.parentId];
      return fallbackSectionId;
    };

    const makeNavItem = (index, title, baseClass) => {
      const li = document.createElement('li');
      li.textContent = title;
      li.dataset.index = index;
      li.dataset.baseClass = baseClass;
      li.dataset.searchText = String(title || '').trim().toLowerCase();
      li.classList.add(baseClass);
      const activate = () => {
        const report = getReportsSafe()[index];
        if (report?.id === 'load_logs') {
          state.showLoadPanel = false;
        }
        trackEvent?.('menu_click', {
          report_id: report?.id || '',
          report_title: report?.title || title || ''
        });
        setActiveReport(index);
      };
      li.addEventListener('click', activate);
      bindKeyboardActivation(li, activate);
      return li;
    };

    const makeSummary = (index, title, baseClass) => {
      const summary = document.createElement('summary');
      summary.textContent = title;
      summary.dataset.index = index;
      summary.dataset.baseClass = baseClass;
      summary.dataset.searchText = String(title || '').trim().toLowerCase();
      summary.classList.add(baseClass, 'nav-summary');
      summary.addEventListener('click', () => {
        const report = getReportsSafe()[index];
        trackEvent?.('menu_click', {
          report_id: report?.id || '',
          report_title: report?.title || title || '',
          group: 'summary'
        });
        setActiveReport(index);
      });
      return summary;
    };

    reports.forEach((report, index) => {
      if (report?.parentId) return;
      const sectionId = getSectionIdForReport(report);
      if (!sectionMap.has(sectionId)) {
        sectionMap.set(sectionId, { id: sectionId, title: sectionId, openByDefault: false, items: [] });
      }
      sectionMap.get(sectionId).items.push({ report, index });
    });

    sections.forEach((section, sectionIndex) => {
      const bucket = sectionMap.get(section.id);
      if (!bucket?.items?.length) return;
      const wrapper = document.createElement('li');
      wrapper.classList.add('nav-section-item');
      const details = document.createElement('details');
      details.classList.add('nav-section');
      if (section.openByDefault || sectionIndex === 0) details.open = true;

      const summary = document.createElement('summary');
      summary.classList.add('nav-section-summary');
      summary.textContent = section.title;
      details.appendChild(summary);

      const sectionList = document.createElement('ol');
      sectionList.classList.add('nav-section-list');
      bucket.items.forEach(({ report, index }) => {
        if (!report || index == null) return;
        if (groupParentIds.has(report.id)) {
          const group = groups.get(report.id) || [];
          const groupDetails = document.createElement('details');
          groupDetails.classList.add('nav-group');
          groupDetails.appendChild(makeSummary(index, report.title, 'mli'));
          const sublist = document.createElement('ol');
          sublist.classList.add('nav-sublist');
          group.forEach((child) => {
            if (!child || child.index == null) return;
            sublist.appendChild(makeNavItem(child.index, child.report.title, 'cli'));
          });
          groupDetails.appendChild(sublist);
          const groupWrap = document.createElement('li');
          groupWrap.classList.add('nav-group-item');
          groupWrap.appendChild(groupDetails);
          sectionList.appendChild(groupWrap);
          return;
        }
        sectionList.appendChild(makeNavItem(index, report.title, 'mli'));
      });
      details.appendChild(sectionList);
      wrapper.appendChild(details);
      dom.navList.appendChild(wrapper);
    });

    updateNavHighlight();
    applyNavSearchFilter(state.navSearch || dom.navSearchInput?.value || '');
    updatePrevNextButtons();
    bindNavStickyBottom();
  }

  return {
    applyNavSearchFilter,
    clearLoadingState,
    initNavigation,
    renderActiveReport,
    renderReportWithLoading,
    setActiveReport,
    setupNavSearch,
    showLoadingState,
    updateNavHighlight,
    updatePrevNextButtons
  };
}
