export function createRbnCompareModelRuntime(deps = {}) {
  const {
    getDom,
    getState,
    getActiveCompareSlots,
    getActiveReportId,
    lookupPrefix,
    baseCall,
    normalizeContinent,
    normalizeSpotterBase,
    normalizeBandToken,
    escapeAttr,
    escapeHtml,
    formatNumberSh6,
    continentLabel,
    scheduleRbnCompareSignalDraw
  } = deps;

  const rbnCompareSignalIndexCache = new Map(); // slotId -> { dataKey, bySpotter: Map(spotter -> entry) }
  const rbnCompareSignalIndexJobs = new Map(); // slotId -> { dataKey, slotRef, spots, i, bySpotter }
  const rbnCompareSignalRankingCache = new Map(); // `${slotId}|${bandKey||'ALL'}` -> { dataKey, byContinent }

  function getDomSafe() {
    return getDom?.() || {};
  }

  function getStateSafe() {
    return getState?.() || {};
  }

  function getActiveCompareSlotsSafe() {
    return Array.isArray(getActiveCompareSlots?.()) ? getActiveCompareSlots() : [];
  }

  function getActiveReportIdSafe() {
    if (typeof getActiveReportId === 'function') return String(getActiveReportId() || '').trim();
    return '';
  }

  function lookupPrefixSafe(value) {
    if (typeof lookupPrefix === 'function') return lookupPrefix(value);
    return null;
  }

  function baseCallSafe(value) {
    if (typeof baseCall === 'function') return baseCall(value);
    return String(value || '').trim().toUpperCase().split('/')[0];
  }

  function normalizeContinentSafe(value) {
    if (typeof normalizeContinent === 'function') return normalizeContinent(value);
    return String(value || '').trim().toUpperCase();
  }

  function normalizeSpotterBaseSafe(value) {
    if (typeof normalizeSpotterBase === 'function') return normalizeSpotterBase(value);
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '').replace(/-\d+$/, '');
  }

  function normalizeBandTokenSafe(value) {
    if (typeof normalizeBandToken === 'function') return normalizeBandToken(value);
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

  function formatNumberSafe(value) {
    if (typeof formatNumberSh6 === 'function') return formatNumberSh6(value);
    const num = Number(value);
    return Number.isFinite(num) ? num.toLocaleString('en-US') : '0';
  }

  function continentLabelSafe(value) {
    if (typeof continentLabel === 'function') return continentLabel(value);
    return String(value || '').trim().toUpperCase() || 'N/A';
  }

  function scheduleRbnCompareSignalDrawSafe() {
    if (typeof scheduleRbnCompareSignalDraw === 'function') scheduleRbnCompareSignalDraw();
  }

  function getWindowSafe() {
    return typeof window !== 'undefined' ? window : globalThis;
  }

  function requestIdleCallbackSafe(callback, options) {
    const win = getWindowSafe();
    if (typeof win.requestIdleCallback === 'function') {
      win.requestIdleCallback(callback, options);
    } else if (typeof win.setTimeout === 'function') {
      win.setTimeout(callback, 0);
    } else {
      callback();
    }
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

  function resolveSpotterContinent(spotterCall) {
    const key = normalizeSpotterBaseSafe(spotterCall || '');
    const prefix = key ? (lookupPrefixSafe(key) || lookupPrefixSafe(baseCallSafe(key))) : null;
    return normalizeContinentSafe(prefix?.continent || '') || 'N/A';
  }

  function rbnCompareSlotDataKey(slot) {
    const r = slot?.rbnState;
    if (!r || r.status !== 'ready' || !r.raw || !Array.isArray(r.raw.ofUsSpots)) return '';
    const days = Array.isArray(r.selectedDays) ? r.selectedDays.join(',') : '';
    const count = Number.isFinite(r.totalOfUs) ? r.totalOfUs : r.raw.ofUsSpots.length;
    return `${String(r.lastCall || '')}|${String(r.lastWindowKey || '')}|${days}|${count}`;
  }

  function hashString32(value) {
    const str = String(value || '');
    let h = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function sampleFlatStrideSeeded(data, capPoints, seed) {
    const arr = Array.isArray(data) ? data : [];
    const total = Math.floor(arr.length / 2);
    const cap = Math.max(0, Math.floor(Number(capPoints) || 0));
    if (!cap || total <= cap) return arr;
    const stride = Math.max(1, Math.ceil(total / cap));
    const offset = stride > 1 ? (hashString32(seed) % stride) : 0;
    const out = [];
    for (let i = offset; i < total; i += stride) {
      const idx = i * 2;
      out.push(arr[idx], arr[idx + 1]);
    }
    return out;
  }

  function computeProportionalCaps(entries, total, capTotal, minEach = 200) {
    const safeTotal = Math.max(0, Math.floor(total || 0));
    const cap = Math.max(0, Math.floor(capTotal || 0));
    if (!cap || safeTotal <= cap) {
      return entries.map(([band, count]) => [band, count]);
    }
    const out = entries.map(([band, count]) => {
      const safeCount = Math.max(0, Math.floor(count || 0));
      const raw = Math.floor((cap * safeCount) / Math.max(1, safeTotal));
      return [band, Math.min(safeCount, Math.max(minEach, raw))];
    });
    let sum = out.reduce((acc, [, count]) => acc + count, 0);
    if (sum > cap) {
      const order = out.map(([, count], idx) => ({ idx, count })).sort((a, b) => b.count - a.count);
      for (const item of order) {
        if (sum <= cap) break;
        const current = out[item.idx][1];
        const next = Math.max(minEach, current - (sum - cap));
        out[item.idx][1] = next;
        sum -= (current - next);
      }
    } else if (sum < cap) {
      let remaining = cap - sum;
      const byAvailable = out.map(([, count], idx) => {
        const original = Math.max(0, Math.floor(entries[idx]?.[1] || 0));
        return { idx, available: Math.max(0, original - count) };
      }).sort((a, b) => b.available - a.available);
      for (const item of byAvailable) {
        if (!remaining) break;
        if (item.available <= 0) continue;
        const add = Math.min(item.available, remaining);
        out[item.idx][1] += add;
        remaining -= add;
      }
    }
    return out;
  }

  function clearRankingCacheForSlot(slotId) {
    Array.from(rbnCompareSignalRankingCache.keys()).forEach((key) => {
      if (key.startsWith(`${slotId}|`)) rbnCompareSignalRankingCache.delete(key);
    });
  }

  function createSpotterIndexEntry(spotter) {
    return {
      spotter,
      continent: resolveSpotterContinent(spotter),
      totalCount: 0,
      bandCounts: new Map(),
      byBand: new Map(),
      minSnr: null,
      maxSnr: null
    };
  }

  function appendSpotToIndex(bySpotter, spot) {
    if (!spot || !spot.spotter) return;
    if (!Number.isFinite(spot.ts) || !Number.isFinite(spot.snr)) return;
    const spotter = normalizeSpotterBaseSafe(spot.spotter);
    if (!spotter) return;
    const band = normalizeBandTokenSafe(spot.band || '') || '';
    let entry = bySpotter.get(spotter);
    if (!entry) {
      entry = createSpotterIndexEntry(spotter);
      bySpotter.set(spotter, entry);
    }
    entry.totalCount += 1;
    entry.bandCounts.set(band, (entry.bandCounts.get(band) || 0) + 1);
    if (!entry.byBand.has(band)) entry.byBand.set(band, []);
    entry.byBand.get(band).push(spot.ts, spot.snr);
    entry.minSnr = entry.minSnr == null ? spot.snr : Math.min(entry.minSnr, spot.snr);
    entry.maxSnr = entry.maxSnr == null ? spot.snr : Math.max(entry.maxSnr, spot.snr);
  }

  function getRbnCompareIndexCached(slotId, slot) {
    const key = rbnCompareSlotDataKey(slot);
    if (!key) return null;
    const cached = rbnCompareSignalIndexCache.get(slotId);
    if (cached && cached.dataKey === key) return cached;
    return null;
  }

  function scheduleRbnCompareIndexBuild(slotId, slot) {
    const dataKey = rbnCompareSlotDataKey(slot);
    if (!dataKey) return;
    const cached = rbnCompareSignalIndexCache.get(slotId);
    if (cached && cached.dataKey === dataKey) return;
    const existing = rbnCompareSignalIndexJobs.get(slotId);
    if (existing && existing.dataKey === dataKey) return;
    const spots = slot?.rbnState?.raw?.ofUsSpots || [];
    const job = {
      slotId,
      slotRef: slot,
      dataKey,
      spots,
      i: 0,
      bySpotter: new Map()
    };
    rbnCompareSignalIndexJobs.set(slotId, job);
    const step = () => {
      const liveKey = rbnCompareSlotDataKey(job.slotRef);
      if (liveKey !== job.dataKey) {
        rbnCompareSignalIndexJobs.delete(slotId);
        return;
      }
      const end = Math.min(job.spots.length, job.i + 6000);
      for (; job.i < end; job.i += 1) {
        appendSpotToIndex(job.bySpotter, job.spots[job.i]);
      }
      if (job.i >= job.spots.length) {
        rbnCompareSignalIndexJobs.delete(slotId);
        rbnCompareSignalIndexCache.set(slotId, { dataKey: job.dataKey, bySpotter: job.bySpotter });
        clearRankingCacheForSlot(slotId);
        scheduleRbnCompareSignalDrawSafe();
        populateRbnCompareSignalSpotterSelects();
        return;
      }
      requestIdleCallbackSafe(step, { timeout: 200 });
    };
    requestIdleCallbackSafe(step, { timeout: 200 });
  }

  function getRbnCompareRankingCached(slotId, slot, bandKey) {
    const dataKey = rbnCompareSlotDataKey(slot);
    if (!dataKey) return null;
    const key = `${slotId}|${bandKey || 'ALL'}`;
    const cached = rbnCompareSignalRankingCache.get(key);
    if (cached && cached.dataKey === dataKey) return cached;
    return null;
  }

  function buildRbnCompareRankingFromIndex(slotId, slot, bandKey, index) {
    const dataKey = rbnCompareSlotDataKey(slot);
    if (!dataKey || !index || index.dataKey !== dataKey) return null;
    const byContinent = new Map();
    const normalizedBand = normalizeBandTokenSafe(bandKey || '');
    index.bySpotter.forEach((entry) => {
      const count = normalizedBand ? (entry.bandCounts.get(normalizedBand) || 0) : (entry.totalCount || 0);
      if (!count) return;
      const continent = entry.continent || 'N/A';
      if (!byContinent.has(continent)) byContinent.set(continent, []);
      byContinent.get(continent).push({ spotter: entry.spotter, count });
    });
    byContinent.forEach((list, continent) => {
      list.sort((a, b) => b.count - a.count || a.spotter.localeCompare(b.spotter));
      byContinent.set(continent, list);
    });
    const key = `${slotId}|${normalizedBand || 'ALL'}`;
    const built = { dataKey, byContinent };
    rbnCompareSignalRankingCache.set(key, built);
    return built;
  }

  function populateRbnCompareSignalSpotterSelects() {
    if (getActiveReportIdSafe() !== 'rbn_compare_signal') return;
    const dom = getDomSafe();
    const root = dom.viewContainer instanceof HTMLElement ? dom.viewContainer : null;
    if (!(root instanceof HTMLElement)) return;
    const slots = getActiveCompareSlotsSafe();
    const base = slots.find((entry) => entry.id === 'A') || slots[0] || null;
    if (!base) return;
    const baseReady = base?.slot?.rbnState?.status === 'ready';
    const state = getStateSafe();
    const bandKey = normalizeBandTokenSafe(state.globalBandFilter || '');
    const cached = getRbnCompareRankingCached(base.id, base.slot, bandKey);
    const index = cached ? null : getRbnCompareIndexCached(base.id, base.slot);
    const ranking = cached || (index ? buildRbnCompareRankingFromIndex(base.id, base.slot, bandKey, index) : null);
    if (!ranking) {
      if (base.slot?.rbnState?.status === 'ready') scheduleRbnCompareIndexBuild(base.id, base.slot);
      return;
    }

    const selections = ensureRbnCompareSignalState();
    const selects = Array.from(root.querySelectorAll('.rbn-signal-select'));
    const grid = root.querySelector('.rbn-signal-grid');
    if (grid instanceof HTMLElement) {
      const continentOrder = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC'];
      const orderIndex = new Map(continentOrder.map((continent, idx) => [continent, idx]));
      const cards = Array.from(grid.querySelectorAll('.rbn-signal-card'));
      const getCardContinent = (card) => {
        const select = card.querySelector('.rbn-signal-select');
        const canvas = card.querySelector('.rbn-signal-canvas');
        return String(select?.dataset?.continent || canvas?.dataset?.continent || '').trim().toUpperCase() || 'N/A';
      };
      cards.sort((a, b) => {
        const continentA = getCardContinent(a);
        const continentB = getCardContinent(b);
        const topA = ranking.byContinent.get(continentA)?.[0]?.count || 0;
        const topB = ranking.byContinent.get(continentB)?.[0]?.count || 0;
        if (topB !== topA) return topB - topA;
        return (orderIndex.get(continentA) ?? 999) - (orderIndex.get(continentB) ?? 999);
      });
      cards.forEach((card) => grid.appendChild(card));
    }

    const hasHtmlButton = typeof HTMLButtonElement !== 'undefined';
    selects.forEach((select) => {
      const continent = String(select.dataset.continent || '').trim().toUpperCase() || 'N/A';
      const list = ranking.byContinent.get(continent) || [];
      const card = select.closest('.rbn-signal-card');
      const statusEl = card ? card.querySelector('.rbn-signal-status') : null;
      const copyBtn = card ? card.querySelector('.rbn-signal-copy-btn') : null;
      const label = continentLabelSafe(continent) || continent;
      if (!list.length) {
        select.innerHTML = '<option value="">No skimmers</option>';
        select.disabled = true;
        if (hasHtmlButton && copyBtn instanceof HTMLButtonElement) copyBtn.disabled = true;
        const canvas = card?.querySelector('.rbn-signal-canvas');
        if (canvas instanceof HTMLCanvasElement) canvas.dataset.spotter = '';
        if (statusEl instanceof HTMLElement) {
          statusEl.textContent = baseReady
            ? `No RBN spots found for ${label}.`
            : 'Load RBN spots to populate charts.';
          statusEl.hidden = false;
        }
        return;
      }
      const saved = normalizeSpotterBaseSafe(String(selections.selectedByContinent[continent] || '').trim());
      const defaultSpotter = saved && list.some((entry) => entry.spotter === saved) ? saved : list[0].spotter;
      selections.selectedByContinent[continent] = defaultSpotter;
      select.disabled = false;
      if (hasHtmlButton && copyBtn instanceof HTMLButtonElement) copyBtn.disabled = false;
      select.innerHTML = list.slice(0, 80).map((entry) => {
        const optionLabel = `${entry.spotter} (${formatNumberSafe(entry.count)})`;
        return `<option value="${escapeAttrSafe(entry.spotter)}" ${entry.spotter === defaultSpotter ? 'selected' : ''}>${escapeHtmlSafe(optionLabel)}</option>`;
      }).join('');
      const canvas = card?.querySelector('.rbn-signal-canvas');
      if (canvas instanceof HTMLCanvasElement) canvas.dataset.spotter = defaultSpotter;
      if (statusEl instanceof HTMLElement) {
        statusEl.textContent = '';
        statusEl.hidden = true;
      }
    });
    scheduleRbnCompareSignalDrawSafe();
  }

  return {
    resolveSpotterContinent,
    rbnCompareSlotDataKey,
    sampleFlatStrideSeeded,
    computeProportionalCaps,
    getRbnCompareIndexCached,
    scheduleRbnCompareIndexBuild,
    getRbnCompareRankingCached,
    buildRbnCompareRankingFromIndex,
    populateRbnCompareSignalSpotterSelects
  };
}
