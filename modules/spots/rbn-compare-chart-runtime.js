export function createRbnCompareChartRuntime(deps = {}) {
  const {
    getDom,
    getState,
    getActiveCompareSlots,
    getRbnCompareIndexCached,
    scheduleRbnCompareIndexBuild,
    sampleFlatStrideSeeded,
    computeProportionalCaps,
    slotMarkerShape,
    slotLineDash,
    normalizeSpotterBase,
    normalizeBandToken,
    formatBandLabel,
    sortBands,
    escapeHtml,
    formatNumberSh6,
    getCanvasZoomKey,
    resolveCanvasZoomWindow
  } = deps;

  const rbnCompareSignalCanvasJobs = new WeakMap(); // canvas -> { token, raf }

  function getDomSafe() {
    return getDom?.() || {};
  }

  function getStateSafe() {
    return getState?.() || {};
  }

  function getActiveCompareSlotsSafe() {
    return Array.isArray(getActiveCompareSlots?.()) ? getActiveCompareSlots() : [];
  }

  function getRbnCompareIndexCachedSafe(slotId, slot) {
    if (typeof getRbnCompareIndexCached === 'function') return getRbnCompareIndexCached(slotId, slot);
    return null;
  }

  function scheduleRbnCompareIndexBuildSafe(slotId, slot) {
    if (typeof scheduleRbnCompareIndexBuild === 'function') scheduleRbnCompareIndexBuild(slotId, slot);
  }

  function sampleFlatStrideSeededSafe(data, capPoints, seed) {
    if (typeof sampleFlatStrideSeeded === 'function') return sampleFlatStrideSeeded(data, capPoints, seed);
    return Array.isArray(data) ? data : [];
  }

  function computeProportionalCapsSafe(entries, total, capTotal, minEach = 200) {
    if (typeof computeProportionalCaps === 'function') return computeProportionalCaps(entries, total, capTotal, minEach);
    return Array.isArray(entries) ? entries : [];
  }

  function slotMarkerShapeSafe(slotId) {
    if (typeof slotMarkerShape === 'function') return slotMarkerShape(slotId);
    return 'circle';
  }

  function slotLineDashSafe(slotId) {
    if (typeof slotLineDash === 'function') return slotLineDash(slotId);
    return [];
  }

  function normalizeSpotterBaseSafe(value) {
    if (typeof normalizeSpotterBase === 'function') return normalizeSpotterBase(value);
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '').replace(/-\d+$/, '');
  }

  function normalizeBandTokenSafe(value) {
    if (typeof normalizeBandToken === 'function') return normalizeBandToken(value);
    return String(value || '').trim().toUpperCase();
  }

  function formatBandLabelSafe(value) {
    if (typeof formatBandLabel === 'function') return formatBandLabel(value);
    return String(value || '').trim().toUpperCase();
  }

  function sortBandsSafe(values) {
    if (typeof sortBands === 'function') return sortBands(values);
    return Array.isArray(values) ? values.slice().sort() : [];
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

  function formatNumberSafe(value) {
    if (typeof formatNumberSh6 === 'function') return formatNumberSh6(value);
    const num = Number(value);
    return Number.isFinite(num) ? num.toLocaleString('en-US') : '0';
  }

  function getCanvasZoomKeySafe(canvas, chartType = 'rbn', bandKey = '') {
    if (typeof getCanvasZoomKey === 'function') return getCanvasZoomKey(canvas, chartType, bandKey);
    return '';
  }

  function resolveCanvasZoomWindowSafe(chartType, key, fallbackMinTs, fallbackMaxTs) {
    if (typeof resolveCanvasZoomWindow === 'function') {
      return resolveCanvasZoomWindow(chartType, key, fallbackMinTs, fallbackMaxTs);
    }
    return { minTs: fallbackMinTs, maxTs: fallbackMaxTs, zoomed: false };
  }

  function getWindowSafe() {
    return typeof window !== 'undefined' ? window : globalThis;
  }

  function requestAnimationFrameSafe(callback) {
    const win = getWindowSafe();
    if (typeof win.requestAnimationFrame === 'function') return win.requestAnimationFrame(callback);
    if (typeof win.setTimeout === 'function') return win.setTimeout(callback, 16);
    callback();
    return 0;
  }

  function cancelAnimationFrameSafe(handle) {
    const win = getWindowSafe();
    if (typeof win.cancelAnimationFrame === 'function') {
      win.cancelAnimationFrame(handle);
    } else if (typeof win.clearTimeout === 'function') {
      win.clearTimeout(handle);
    }
  }

  function bandColorForChart(band) {
    const key = normalizeBandTokenSafe(band || '');
    if (key === '160M') return '#334155';
    if (key === '80M') return '#2563eb';
    if (key === '40M') return '#16a34a';
    if (key === '20M') return '#f59e0b';
    if (key === '15M') return '#dc2626';
    if (key === '10M') return '#7c3aed';
    return '#0f172a';
  }

  function formatUtcTick(ts) {
    if (!Number.isFinite(ts)) return '';
    const d = new Date(ts);
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${dd}.${mo} ${hh}:${mm}Z`;
  }

  function drawRbnSignalCanvas(canvas, model) {
    if (!(canvas instanceof HTMLCanvasElement) || !model) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const prev = rbnCompareSignalCanvasJobs.get(canvas);
    if (prev && prev.raf) cancelAnimationFrameSafe(prev.raf);
    const token = (prev?.token || 0) + 1;
    const job = { token, raf: 0 };
    rbnCompareSignalCanvasJobs.set(canvas, job);
    const win = getWindowSafe();
    const dpr = Math.max(1, Math.min(2, win.devicePixelRatio || 1));
    const cssWidth = Math.max(320, canvas.clientWidth || 920);
    const cssHeight = Math.max(220, Number(canvas.dataset.height) || 260);
    const width = Math.round(cssWidth * dpr);
    const height = Math.round(cssHeight * dpr);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    canvas.style.height = `${cssHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const margin = { left: 52, right: 12, top: 14, bottom: 26 };
    const plotW = Math.max(10, cssWidth - margin.left - margin.right);
    const plotH = Math.max(10, cssHeight - margin.top - margin.bottom);
    const minTs = model.minTs;
    const maxTs = model.maxTs;
    const minY = model.minY;
    const maxY = model.maxY;
    const series = Array.isArray(model.series) ? model.series : [];
    const pointCount = series.reduce((acc, seriesEntry) => acc + Math.floor((Array.isArray(seriesEntry?.data) ? seriesEntry.data.length : 0) / 2), 0);

    const xOf = (ts) => margin.left + ((ts - minTs) / Math.max(1, (maxTs - minTs))) * plotW;
    const yOf = (value) => margin.top + (1 - ((value - minY) / Math.max(1e-9, (maxY - minY)))) * plotH;
    canvas.dataset.plotLeft = String(margin.left);
    canvas.dataset.plotRight = String(margin.left + plotW);
    canvas.dataset.plotTop = String(margin.top);
    canvas.dataset.plotBottom = String(margin.top + plotH);
    canvas.dataset.viewMinTs = String(minTs);
    canvas.dataset.viewMaxTs = String(maxTs);
    canvas.dataset.fullMinTs = String(Number.isFinite(model.fullMinTs) ? model.fullMinTs : minTs);
    canvas.dataset.fullMaxTs = String(Number.isFinite(model.fullMaxTs) ? model.fullMaxTs : maxTs);

    ctx.strokeStyle = '#b9cbe7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + plotH);
    ctx.lineTo(margin.left + plotW, margin.top + plotH);
    ctx.stroke();

    ctx.fillStyle = '#23456f';
    ctx.font = '11px var(--sh6-font-family, verdana, arial, sans-serif)';
    ctx.textBaseline = 'middle';

    const yTicks = 5;
    for (let i = 0; i <= yTicks; i += 1) {
      const t = i / yTicks;
      const yVal = minY + (1 - t) * (maxY - minY);
      const y = margin.top + t * plotH;
      ctx.strokeStyle = 'rgba(185, 203, 231, 0.45)';
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + plotW, y);
      ctx.stroke();
      ctx.fillText(`${Math.round(yVal)}`, 6, y);
    }

    ctx.textBaseline = 'top';
    const xTicks = Math.max(2, Math.min(10, Math.floor(plotW / 120)));
    for (let i = 0; i <= xTicks; i += 1) {
      const t = i / xTicks;
      const ts = minTs + t * (maxTs - minTs);
      const x = margin.left + t * plotW;
      ctx.strokeStyle = 'rgba(185, 203, 231, 0.45)';
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotH);
      ctx.stroke();
      const label = formatUtcTick(ts);
      const labelW = Math.max(0, ctx.measureText(label).width || 0);
      const clamped = Math.max(margin.left, Math.min(x - labelW / 2, margin.left + plotW - labelW));
      ctx.fillText(label, clamped, margin.top + plotH + 6);
    }

    const drawMarker = (x, y, shape, size) => {
      const s = size;
      if (shape === 'triangle') {
        ctx.moveTo(x, y - s);
        ctx.lineTo(x + s, y + s);
        ctx.lineTo(x - s, y + s);
        ctx.closePath();
      } else if (shape === 'square') {
        ctx.rect(x - s, y - s, s * 2, s * 2);
      } else if (shape === 'diamond') {
        ctx.moveTo(x, y - s);
        ctx.lineTo(x + s, y);
        ctx.lineTo(x, y + s);
        ctx.lineTo(x - s, y);
        ctx.closePath();
      } else {
        ctx.arc(x, y, s, 0, Math.PI * 2);
      }
    };

    const trendBreakMs = 30 * 60 * 1000;
    const trendlines = Array.isArray(model.trendlines) ? model.trendlines : [];
    if (trendlines.length) {
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1.8;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      trendlines.forEach((trendline) => {
        const data = Array.isArray(trendline?.data) ? trendline.data : [];
        if (data.length < 4) return;
        ctx.strokeStyle = trendline.color || bandColorForChart(trendline.band);
        ctx.lineWidth = Number.isFinite(trendline.width) ? trendline.width : 1.8;
        ctx.setLineDash(Array.isArray(trendline.dash) ? trendline.dash : []);
        ctx.beginPath();
        let started = false;
        let prevTs = null;
        for (let i = 0; i < data.length; i += 2) {
          const ts = data[i];
          const snr = data[i + 1];
          if (!Number.isFinite(ts) || !Number.isFinite(snr)) continue;
          if (ts < minTs || ts > maxTs) continue;
          const x = xOf(ts);
          const y = yOf(snr);
          const shouldBreak = started && Number.isFinite(prevTs) && (ts - prevTs) > trendBreakMs;
          if (!started || shouldBreak) {
            if (started) ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
          prevTs = ts;
        }
        if (started) ctx.stroke();
        ctx.setLineDash([]);
      });
      ctx.restore();
    }

    const pointAlpha = pointCount > 20000 ? 0.14 : (pointCount > 12000 ? 0.18 : (pointCount > 7000 ? 0.22 : (pointCount > 3500 ? 0.26 : 0.32)));
    const pointSize = 3.0;
    const jitterScale = pointCount > 20000 ? 0.55 : (pointCount > 12000 ? 0.45 : (pointCount > 7000 ? 0.35 : (pointCount > 3500 ? 0.2 : 0)));
    const jitterOf = (ts, snr) => {
      if (!jitterScale) return { x: 0, y: 0 };
      const a = (Number.isFinite(ts) ? Math.floor(ts / 1000) : 0) | 0;
      const b = (Number.isFinite(snr) ? Math.round(snr * 100) : 0) | 0;
      const h = (Math.imul(a, 2654435761) ^ Math.imul(b, 1597334677)) >>> 0;
      const jx = (((h & 1023) / 1023) - 0.5) * 2 * jitterScale;
      const jy = ((((h >>> 10) & 1023) / 1023) - 0.5) * 2 * jitterScale;
      return { x: jx, y: jy };
    };

    ctx.fillStyle = '#193d6e';
    ctx.font = '12px var(--sh6-font-family, verdana, arial, sans-serif)';
    ctx.textBaseline = 'top';
    ctx.fillText(model.title || '', margin.left, 2);

    const budgetPerFrame = pointCount > 20000 ? 4200 : (pointCount > 12000 ? 5000 : 6200);
    let seriesIdx = 0;
    let pointIdx = 0;
    const step = () => {
      const live = rbnCompareSignalCanvasJobs.get(canvas);
      if (!live || live.token !== token) return;
      ctx.save();
      ctx.globalAlpha = pointAlpha;
      let remaining = budgetPerFrame;
      while (remaining > 0 && seriesIdx < series.length) {
        const seriesEntry = series[seriesIdx] || {};
        const data = Array.isArray(seriesEntry.data) ? seriesEntry.data : [];
        const shape = seriesEntry.shape || 'circle';
        const color = seriesEntry.color || bandColorForChart(seriesEntry.band);
        ctx.fillStyle = color;
        if (!data.length) {
          seriesIdx += 1;
          pointIdx = 0;
          continue;
        }
        ctx.beginPath();
        let drawn = 0;
        while (remaining > 0 && pointIdx < data.length) {
          const ts = data[pointIdx];
          const snr = data[pointIdx + 1];
          pointIdx += 2;
          if (!Number.isFinite(ts) || !Number.isFinite(snr)) continue;
          if (ts < minTs || ts > maxTs) continue;
          const { x: jx, y: jy } = jitterOf(ts, snr);
          const x = xOf(ts) + jx;
          const y = yOf(snr) + jy;
          if (shape === 'triangle' || shape === 'square' || shape === 'diamond') {
            drawMarker(x, y, shape, pointSize);
          } else {
            ctx.moveTo(x + pointSize, y);
            ctx.arc(x, y, pointSize, 0, Math.PI * 2);
          }
          drawn += 1;
          remaining -= 1;
        }
        if (drawn) ctx.fill();
        if (pointIdx >= data.length) {
          seriesIdx += 1;
          pointIdx = 0;
        }
      }
      ctx.restore();
      if (seriesIdx < series.length) {
        job.raf = requestAnimationFrameSafe(step);
        rbnCompareSignalCanvasJobs.set(canvas, job);
      }
    };
    job.raf = requestAnimationFrameSafe(step);
    rbnCompareSignalCanvasJobs.set(canvas, job);
  }

  function drawRbnCompareSignalCharts() {
    const dom = getDomSafe();
    const root = dom.viewContainer instanceof HTMLElement ? dom.viewContainer : null;
    if (!(root instanceof HTMLElement)) return;
    const canvases = Array.from(root.querySelectorAll('.rbn-signal-canvas')).filter((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement)) return false;
      return canvas.dataset.rbnVisible !== '0';
    });
    if (!canvases.length) return;

    const state = getStateSafe();
    const slots = getActiveCompareSlotsSafe().filter((entry) => entry.slot?.qsoData && entry.slot?.derived);
    const base = slots.find((entry) => entry.id === 'A') || slots[0] || null;
    const bandKey = normalizeBandTokenSafe(state.globalBandFilter || '');
    const minTs = Math.min(...slots.map((entry) => Number(entry.slot?.derived?.timeRange?.minTs)).filter(Number.isFinite));
    const maxTs = Math.max(...slots.map((entry) => Number(entry.slot?.derived?.timeRange?.maxTs)).filter(Number.isFinite));
    const safeMinTs = Number.isFinite(minTs) ? minTs : Date.now() - 24 * 3600 * 1000;
    const safeMaxTs = Number.isFinite(maxTs) ? maxTs : Date.now();
    const slotKeys = slots.map((entry) => {
      const idx = getRbnCompareIndexCachedSafe(entry.id, entry.slot);
      const dataKey = idx?.dataKey || '';
      const idxFlag = idx ? '1' : '0';
      return `${entry.id}:${dataKey}:${idxFlag}`;
    }).join('|');

    canvases.forEach((canvas) => {
      const continent = String(canvas.dataset.continent || '').trim().toUpperCase() || 'N/A';
      const selectedSpotter = normalizeSpotterBaseSafe(String(canvas.dataset.spotter || '').trim());
      const card = canvas.closest('.rbn-signal-card');
      const legendBandsNode = card ? card.querySelector('.rbn-signal-legend-bands') : null;
      const metaNode = card ? card.querySelector('.rbn-signal-meta') : null;
      const hintNode = card ? card.querySelector('.rbn-signal-hint') : null;
      const sizeKey = `${canvas.clientWidth || 0}x${Number(canvas.dataset.height) || 260}`;
      const zoomKey = getCanvasZoomKeySafe(canvas, 'rbn', bandKey);
      const zoomWindow = resolveCanvasZoomWindowSafe('rbn', zoomKey, safeMinTs, safeMaxTs);
      const viewMinTs = zoomWindow.minTs;
      const viewMaxTs = zoomWindow.maxTs;
      const drawKey = `${selectedSpotter}|${bandKey || 'ALL'}|${slotKeys}|${sizeKey}|${Math.round(viewMinTs)}-${Math.round(viewMaxTs)}`;
      if (canvas.dataset.rbnDrawKey === drawKey) return;
      canvas.dataset.rbnDrawKey = drawKey;

      if (!base || !selectedSpotter) {
        drawRbnSignalCanvas(canvas, {
          title: 'RBN signal',
          minTs: viewMinTs,
          maxTs: viewMaxTs,
          fullMinTs: safeMinTs,
          fullMaxTs: safeMaxTs,
          minY: -30,
          maxY: 40,
          series: []
        });
        if (legendBandsNode instanceof HTMLElement) legendBandsNode.innerHTML = '';
        if (metaNode instanceof HTMLElement) metaNode.textContent = '0 points plotted · SNR range: N/A';
        if (hintNode instanceof HTMLElement) hintNode.textContent = 'Drag to zoom time, double-click to reset.';
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', 'RBN signal scatter plot. No data plotted.');
        return;
      }

      const bandsPlotted = new Set();
      let minSnr = null;
      let maxSnr = null;
      let minY = null;
      let maxY = null;
      const series = [];
      let pointTotal = 0;

      slots.forEach((entry) => {
        const slotId = entry.id;
        const shape = slotMarkerShapeSafe(slotId);
        const slot = entry.slot;
        const index = getRbnCompareIndexCachedSafe(slotId, slot);
        if (!index) {
          scheduleRbnCompareIndexBuildSafe(slotId, slot);
          return;
        }
        const spotterEntry = index.bySpotter?.get(selectedSpotter);
        if (!spotterEntry) return;
        const perSlotCap = 6500;
        if (bandKey) {
          const raw = spotterEntry.byBand?.get(bandKey) || [];
          const seed = `${selectedSpotter}|${slotId}|${index.dataKey}|${bandKey}`;
          const sampled = sampleFlatStrideSeededSafe(raw, perSlotCap, seed);
          if (!sampled.length) return;
          pointTotal += Math.floor(sampled.length / 2);
          series.push({ band: bandKey, slotId, shape, color: bandColorForChart(bandKey), data: sampled });
          bandsPlotted.add(bandKey);
          for (let i = 1; i < sampled.length; i += 2) {
            const snr = sampled[i];
            if (!Number.isFinite(snr)) continue;
            minSnr = minSnr == null ? snr : Math.min(minSnr, snr);
            maxSnr = maxSnr == null ? snr : Math.max(maxSnr, snr);
            minY = minY == null ? snr : Math.min(minY, snr);
            maxY = maxY == null ? snr : Math.max(maxY, snr);
          }
          return;
        }

        const bandCounts = Array.from(spotterEntry.bandCounts?.entries?.() || []).filter(([band, count]) => band && count > 0);
        const total = spotterEntry.totalCount || bandCounts.reduce((acc, [, count]) => acc + count, 0);
        const caps = computeProportionalCapsSafe(bandCounts, total, perSlotCap, 120);
        caps.forEach(([band, cap]) => {
          const raw = spotterEntry.byBand?.get(band) || [];
          const seed = `${selectedSpotter}|${slotId}|${index.dataKey}|${band}`;
          const sampled = sampleFlatStrideSeededSafe(raw, cap, seed);
          if (!sampled.length) return;
          pointTotal += Math.floor(sampled.length / 2);
          series.push({ band, slotId, shape, color: bandColorForChart(band), data: sampled });
          bandsPlotted.add(band);
          for (let i = 1; i < sampled.length; i += 2) {
            const snr = sampled[i];
            if (!Number.isFinite(snr)) continue;
            minSnr = minSnr == null ? snr : Math.min(minSnr, snr);
            maxSnr = maxSnr == null ? snr : Math.max(maxSnr, snr);
            minY = minY == null ? snr : Math.min(minY, snr);
            maxY = maxY == null ? snr : Math.max(maxY, snr);
          }
        });
      });

      if (minY == null || maxY == null) {
        minY = -30;
        maxY = 40;
      } else if (minY === maxY) {
        minY -= 5;
        maxY += 5;
      } else {
        const pad = Math.max(2, (maxY - minY) * 0.08);
        minY -= pad;
        maxY += pad;
      }

      const titleBand = bandKey ? formatBandLabelSafe(bandKey) : 'All bands';
      const title = `${continent} · ${selectedSpotter} · ${titleBand}`;
      const p75 = (values) => {
        if (!values || !values.length) return null;
        values.sort((a, b) => a - b);
        const n = values.length;
        const idx = Math.max(0, Math.min(n - 1, Math.floor(0.75 * (n - 1))));
        return values[idx];
      };

      const trendlines = series.map((seriesEntry) => {
        const data = Array.isArray(seriesEntry?.data) ? seriesEntry.data : [];
        const slotId = String(seriesEntry?.slotId || 'A').toUpperCase();
        const band = normalizeBandTokenSafe(seriesEntry?.band || '');
        if (!data.length || !band) return null;
        const pointsInSeries = Math.floor(data.length / 2);
        const bucketMs = pointsInSeries <= 250 ? 15 * 60 * 1000 : (pointsInSeries <= 700 ? 10 * 60 * 1000 : 5 * 60 * 1000);
        const trendBins = Math.max(1, Math.ceil((viewMaxTs - viewMinTs) / bucketMs));
        const bins = Array.from({ length: trendBins }, () => []);
        for (let i = 0; i < data.length; i += 2) {
          const ts = data[i];
          const snr = data[i + 1];
          if (!Number.isFinite(ts) || !Number.isFinite(snr)) continue;
          if (ts < viewMinTs || ts > viewMaxTs) continue;
          const bin = Math.floor((ts - viewMinTs) / bucketMs);
          if (bin < 0 || bin >= trendBins) continue;
          bins[bin].push(snr);
        }
        const points = [];
        for (let i = 0; i < trendBins; i += 1) {
          const values = bins[i];
          if (!values || values.length < 1) continue;
          const window = [];
          if (i > 0 && bins[i - 1]?.length) window.push(...bins[i - 1]);
          window.push(...values);
          if (i + 1 < trendBins && bins[i + 1]?.length) window.push(...bins[i + 1]);
          const value = p75(window);
          if (!Number.isFinite(value)) continue;
          const ts = viewMinTs + (i + 0.5) * bucketMs;
          points.push(ts, value);
        }
        if (points.length < 4) return null;
        return {
          slotId,
          band,
          color: seriesEntry.color || bandColorForChart(band),
          dash: slotLineDashSafe(slotId),
          width: slotId === 'A' ? 2.1 : 1.7,
          data: points
        };
      }).filter(Boolean);

      drawRbnSignalCanvas(canvas, {
        title,
        minTs: viewMinTs,
        maxTs: viewMaxTs,
        fullMinTs: safeMinTs,
        fullMaxTs: safeMaxTs,
        minY,
        maxY,
        series,
        trendlines
      });

      if (legendBandsNode instanceof HTMLElement) {
        const bands = sortBandsSafe(Array.from(bandsPlotted).filter(Boolean));
        legendBandsNode.innerHTML = bands.map((band) => (
          `<span class="rbn-legend-item"><i style="background:${bandColorForChart(band)}"></i>${escapeHtmlSafe(formatBandLabelSafe(band) || band)}</span>`
        )).join('');
      }
      if (metaNode instanceof HTMLElement) {
        const fmt = (value) => (Number.isFinite(value) ? `${value > 0 ? '+' : ''}${Math.round(value)}` : 'N/A');
        const rangeText = (Number.isFinite(minSnr) && Number.isFinite(maxSnr)) ? `${fmt(minSnr)}..${fmt(maxSnr)} dB` : 'N/A';
        metaNode.textContent = `${formatNumberSafe(pointTotal)} points plotted · SNR range: ${rangeText}`;
      }
      if (hintNode instanceof HTMLElement) {
        hintNode.textContent = zoomWindow.zoomed
          ? 'Drag to zoom time, double-click to reset (zoom active).'
          : 'Drag to zoom time, double-click to reset.';
      }
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `${title}. ${formatNumberSafe(pointTotal)} points plotted. ${metaNode instanceof HTMLElement ? metaNode.textContent : ''}`);
    });
  }

  return {
    bandColorForChart,
    formatUtcTick,
    drawRbnSignalCanvas,
    drawRbnCompareSignalCharts
  };
}
