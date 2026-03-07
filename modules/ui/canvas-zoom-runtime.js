export function createCanvasZoomRuntime(deps = {}) {
  const {
    getState,
    normalizeSpotterBase,
    normalizeBandToken,
    minDragPx = 8,
    minSpanMs = 5 * 60 * 1000
  } = deps;

  function getWindowSafe() {
    return typeof window !== 'undefined' ? window : globalThis;
  }

  function getDocumentSafe() {
    const win = getWindowSafe();
    return win.document || (typeof document !== 'undefined' ? document : null);
  }

  function getStateSafe() {
    return getState?.() || {};
  }

  function normalizeSpotterBaseSafe(value) {
    if (typeof normalizeSpotterBase === 'function') return normalizeSpotterBase(value);
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '').replace(/-\d+$/, '');
  }

  function normalizeBandTokenSafe(value) {
    if (typeof normalizeBandToken === 'function') return normalizeBandToken(value);
    return String(value || '').trim().toUpperCase();
  }

  function isCanvasElement(target) {
    const win = getWindowSafe();
    const CanvasCtor = win.HTMLCanvasElement || globalThis.HTMLCanvasElement;
    return typeof CanvasCtor !== 'undefined' && target instanceof CanvasCtor;
  }

  function ensureCanvasZoomStore(chartType = 'rbn') {
    const state = getStateSafe();
    if (chartType === 'rbn') {
      state.rbnCompareSignal = state.rbnCompareSignal && typeof state.rbnCompareSignal === 'object'
        ? state.rbnCompareSignal
        : { selectedByContinent: {} };
      if (!state.rbnCompareSignal.selectedByContinent) state.rbnCompareSignal.selectedByContinent = {};
      if (!state.rbnCompareSignal.zoomByKey || typeof state.rbnCompareSignal.zoomByKey !== 'object') {
        state.rbnCompareSignal.zoomByKey = {};
      }
      return state.rbnCompareSignal.zoomByKey;
    }
    if (!state.spotsCanvasZoomByKey || typeof state.spotsCanvasZoomByKey !== 'object') {
      state.spotsCanvasZoomByKey = {};
    }
    return state.spotsCanvasZoomByKey;
  }

  function getCanvasZoomKey(canvas, chartType = 'rbn', bandKey = '') {
    if (!isCanvasElement(canvas)) return '';
    if (chartType === 'rbn') {
      const continent = String(canvas.dataset.continent || '').trim().toUpperCase() || 'N/A';
      const spotter = normalizeSpotterBaseSafe(String(canvas.dataset.spotter || '').trim()) || 'none';
      return `${continent}|${spotter}|${bandKey || 'ALL'}`;
    }
    const slot = String(canvas.dataset.slot || '').trim().toUpperCase() || 'A';
    const source = String(canvas.dataset.source || '').trim().toLowerCase() || 'spots';
    return `${slot}|${source}|${bandKey || 'ALL'}`;
  }

  function resolveCanvasZoomWindow(chartType, key, fallbackMinTs, fallbackMaxTs) {
    const out = { minTs: fallbackMinTs, maxTs: fallbackMaxTs, zoomed: false };
    if (!Number.isFinite(fallbackMinTs) || !Number.isFinite(fallbackMaxTs) || fallbackMaxTs <= fallbackMinTs) return out;
    if (!key) return out;
    const zoomStore = ensureCanvasZoomStore(chartType);
    const zoom = zoomStore[key];
    if (!zoom || typeof zoom !== 'object') return out;
    let minTs = Number(zoom.minTs);
    let maxTs = Number(zoom.maxTs);
    if (!Number.isFinite(minTs) || !Number.isFinite(maxTs)) return out;
    minTs = Math.max(fallbackMinTs, minTs);
    maxTs = Math.min(fallbackMaxTs, maxTs);
    if (maxTs <= minTs) return out;
    if ((maxTs - minTs) < minSpanMs) {
      const mid = (minTs + maxTs) / 2;
      minTs = mid - minSpanMs / 2;
      maxTs = mid + minSpanMs / 2;
      if (minTs < fallbackMinTs) {
        minTs = fallbackMinTs;
        maxTs = Math.min(fallbackMaxTs, minTs + minSpanMs);
      }
      if (maxTs > fallbackMaxTs) {
        maxTs = fallbackMaxTs;
        minTs = Math.max(fallbackMinTs, maxTs - minSpanMs);
      }
      if (maxTs <= minTs) return out;
    }
    out.minTs = minTs;
    out.maxTs = maxTs;
    out.zoomed = true;
    return out;
  }

  function clearCanvasZoom(chartType, key, onZoomChanged) {
    if (!key) return;
    const zoomStore = ensureCanvasZoomStore(chartType);
    if (!Object.prototype.hasOwnProperty.call(zoomStore, key)) return;
    delete zoomStore[key];
    if (typeof onZoomChanged === 'function') onZoomChanged();
  }

  function getCanvasPlotMetrics(canvas) {
    if (!isCanvasElement(canvas)) return null;
    const plotLeft = Number(canvas.dataset.plotLeft);
    const plotRight = Number(canvas.dataset.plotRight);
    const plotTop = Number(canvas.dataset.plotTop);
    const plotBottom = Number(canvas.dataset.plotBottom);
    const viewMinTs = Number(canvas.dataset.viewMinTs);
    const viewMaxTs = Number(canvas.dataset.viewMaxTs);
    const fullMinTs = Number(canvas.dataset.fullMinTs);
    const fullMaxTs = Number(canvas.dataset.fullMaxTs);
    if (!Number.isFinite(plotLeft) || !Number.isFinite(plotRight) || plotRight <= plotLeft) return null;
    if (!Number.isFinite(plotTop) || !Number.isFinite(plotBottom) || plotBottom <= plotTop) return null;
    if (!Number.isFinite(viewMinTs) || !Number.isFinite(viewMaxTs) || viewMaxTs <= viewMinTs) return null;
    if (!Number.isFinite(fullMinTs) || !Number.isFinite(fullMaxTs) || fullMaxTs <= fullMinTs) return null;
    return { plotLeft, plotRight, plotTop, plotBottom, viewMinTs, viewMaxTs, fullMinTs, fullMaxTs };
  }

  function updateCanvasZoomBox(canvas, startX, currentX) {
    if (!isCanvasElement(canvas)) return;
    const parent = canvas.parentElement;
    let box = parent ? parent.querySelector('.rbn-signal-zoom-box, .chart-zoom-box') : null;
    if (!box && parent) {
      const doc = getDocumentSafe();
      if (!doc?.createElement) return;
      if (!parent.style.position) parent.style.position = 'relative';
      box = doc.createElement('div');
      box.className = 'chart-zoom-box';
      box.hidden = true;
      parent.appendChild(box);
    }
    const metrics = getCanvasPlotMetrics(canvas);
    if (!(box instanceof HTMLElement) || !metrics) return;
    const left = Math.max(metrics.plotLeft, Math.min(startX, currentX));
    const right = Math.min(metrics.plotRight, Math.max(startX, currentX));
    const width = Math.max(0, right - left);
    box.style.left = `${left}px`;
    box.style.top = `${metrics.plotTop}px`;
    box.style.width = `${width}px`;
    box.style.height = `${Math.max(0, metrics.plotBottom - metrics.plotTop)}px`;
    box.hidden = width <= 0;
  }

  function hideCanvasZoomBox(canvas) {
    if (!isCanvasElement(canvas)) return;
    const parent = canvas.parentElement;
    const box = parent ? parent.querySelector('.rbn-signal-zoom-box, .chart-zoom-box') : null;
    if (!(box instanceof HTMLElement)) return;
    box.hidden = true;
    box.style.width = '0px';
  }

  function applyCanvasZoomFromPixels(canvas, chartType, key, startX, endX, onZoomChanged) {
    const metrics = getCanvasPlotMetrics(canvas);
    if (!metrics || !key) return;
    const width = Math.abs(endX - startX);
    if (width < minDragPx) return;
    const plotW = Math.max(1, metrics.plotRight - metrics.plotLeft);
    const leftPx = Math.max(metrics.plotLeft, Math.min(startX, endX));
    const rightPx = Math.min(metrics.plotRight, Math.max(startX, endX));
    const leftRatio = (leftPx - metrics.plotLeft) / plotW;
    const rightRatio = (rightPx - metrics.plotLeft) / plotW;
    const viewSpan = Math.max(1, metrics.viewMaxTs - metrics.viewMinTs);
    let minTs = metrics.viewMinTs + leftRatio * viewSpan;
    let maxTs = metrics.viewMinTs + rightRatio * viewSpan;
    if (!Number.isFinite(minTs) || !Number.isFinite(maxTs) || maxTs <= minTs) return;
    if ((maxTs - minTs) < minSpanMs) {
      const mid = (minTs + maxTs) / 2;
      minTs = mid - minSpanMs / 2;
      maxTs = mid + minSpanMs / 2;
    }
    minTs = Math.max(metrics.fullMinTs, minTs);
    maxTs = Math.min(metrics.fullMaxTs, maxTs);
    if (maxTs <= minTs) return;
    const zoomStore = ensureCanvasZoomStore(chartType);
    zoomStore[key] = { minTs, maxTs };
    if (typeof onZoomChanged === 'function') onZoomChanged();
  }

  function bindDragZoomOnCanvas(canvas, options = {}) {
    if (!isCanvasElement(canvas)) return;
    const chartType = String(options.chartType || 'rbn');
    if (canvas.dataset.zoomBound === chartType) return;
    canvas.dataset.zoomBound = chartType;
    const resolveBandKey = typeof options.getBandKey === 'function'
      ? options.getBandKey
      : (() => '');
    const onZoomChanged = typeof options.onZoomChanged === 'function'
      ? options.onZoomChanged
      : (() => {});
    const toLocalPoint = (evt) => {
      const rect = canvas.getBoundingClientRect();
      return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    };
    const clampX = (x, metrics) => Math.max(metrics.plotLeft, Math.min(metrics.plotRight, x));
    let drag = null;
    const finishDrag = (evt, applyZoom) => {
      if (!drag) return;
      const active = drag;
      drag = null;
      canvas.classList.remove('is-zoom-dragging');
      hideCanvasZoomBox(canvas);
      try {
        if (Number.isFinite(active.pointerId) && canvas.hasPointerCapture(active.pointerId)) {
          canvas.releasePointerCapture(active.pointerId);
        }
      } catch (err) {
        // Ignore capture release errors across browser implementations.
      }
      if (!applyZoom) return;
      const point = toLocalPoint(evt);
      const metrics = getCanvasPlotMetrics(canvas);
      if (!metrics) return;
      const endX = clampX(point.x, metrics);
      const bandKey = normalizeBandTokenSafe(resolveBandKey() || '');
      const key = getCanvasZoomKey(canvas, chartType, bandKey);
      applyCanvasZoomFromPixels(canvas, chartType, key, active.startX, endX, () => {
        canvas.dataset.rbnDrawKey = '';
        onZoomChanged();
      });
    };
    canvas.addEventListener('pointerdown', (evt) => {
      if (evt.button !== 0) return;
      const metrics = getCanvasPlotMetrics(canvas);
      if (!metrics) return;
      const point = toLocalPoint(evt);
      if (point.x < metrics.plotLeft || point.x > metrics.plotRight || point.y < metrics.plotTop || point.y > metrics.plotBottom) return;
      const startX = clampX(point.x, metrics);
      drag = { pointerId: evt.pointerId, startX };
      canvas.classList.add('is-zoom-dragging');
      updateCanvasZoomBox(canvas, startX, startX);
      try {
        canvas.setPointerCapture(evt.pointerId);
      } catch (err) {
        // Ignore capture errors on unsupported platforms.
      }
      evt.preventDefault();
    });
    canvas.addEventListener('pointermove', (evt) => {
      if (!drag || evt.pointerId !== drag.pointerId) return;
      const metrics = getCanvasPlotMetrics(canvas);
      if (!metrics) return;
      const point = toLocalPoint(evt);
      const currentX = clampX(point.x, metrics);
      updateCanvasZoomBox(canvas, drag.startX, currentX);
    });
    canvas.addEventListener('pointerup', (evt) => {
      if (!drag || evt.pointerId !== drag.pointerId) return;
      finishDrag(evt, true);
    });
    canvas.addEventListener('pointercancel', (evt) => {
      if (!drag || evt.pointerId !== drag.pointerId) return;
      finishDrag(evt, false);
    });
    canvas.addEventListener('dblclick', (evt) => {
      evt.preventDefault();
      const bandKey = normalizeBandTokenSafe(resolveBandKey() || '');
      const key = getCanvasZoomKey(canvas, chartType, bandKey);
      clearCanvasZoom(chartType, key, () => {
        canvas.dataset.rbnDrawKey = '';
        onZoomChanged();
      });
    });
  }

  return {
    ensureCanvasZoomStore,
    getCanvasZoomKey,
    resolveCanvasZoomWindow,
    clearCanvasZoom,
    getCanvasPlotMetrics,
    updateCanvasZoomBox,
    hideCanvasZoomBox,
    applyCanvasZoomFromPixels,
    bindDragZoomOnCanvas
  };
}
