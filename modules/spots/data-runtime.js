export function createSpotsDataRuntime(deps = {}) {
  const {
    getState,
    createSpotsState,
    createRbnState,
    getLoadedCompareSlots,
    getMultiplierCandidateCalls,
    mapSpotMultiplierEntities,
    normalizeBandToken,
    parseBandFromFreq,
    normalizeCall,
    normalizeSpotterBase,
    runEngineTask,
    updateDataStatus,
    renderActiveReport,
    refreshOperatingStyleSpotAnchors,
    spotsBaseUrl = '',
    rbnProxyUrl = '',
    rbnSummaryOnlyThreshold = 0
  } = deps;

  function getStateSafe() {
    return typeof getState === 'function' ? getState() : null;
  }

  function getWindowSafe() {
    return typeof window !== 'undefined' ? window : globalThis;
  }

  function resolveSlot(slot) {
    if (slot && typeof slot === 'object') return slot;
    return getStateSafe();
  }

  function createSpotsStateSafe(source = 'spots') {
    if (typeof createSpotsState === 'function') return createSpotsState(source);
    return {
      source,
      status: 'idle',
      error: null,
      errors: [],
      stats: null,
      lastWindowKey: null,
      lastCall: null,
      lastCandidateKey: null,
      lastDaysKey: null,
      lastErrorKey: null,
      lastErrorAt: 0,
      lastErrorStatus: null,
      retryAfterMs: 0,
      retryTimer: null,
      inflightKey: null,
      inflightPromise: null,
      windowMinutes: 15,
      bandFilter: [],
      raw: null,
      totalScanned: 0,
      totalOfUs: 0,
      totalByUs: 0,
      capPerSide: null,
      truncatedOfUs: false,
      truncatedByUs: false,
      summaryOnly: false,
      qsoIndex: null,
      qsoCallIndex: null,
      drillBand: '',
      drillHour: null,
      drillContinent: '',
      drillCqZone: '',
      drillItuZone: ''
    };
  }

  function createRbnStateSafe() {
    if (typeof createRbnState === 'function') return createRbnState();
    return createSpotsStateSafe('rbn');
  }

  function getLoadedCompareSlotsSafe() {
    return Array.isArray(getLoadedCompareSlots?.()) ? getLoadedCompareSlots() : [];
  }

  function normalizeBandTokenSafe(value) {
    if (typeof normalizeBandToken === 'function') return normalizeBandToken(value);
    return String(value || '').trim().toUpperCase();
  }

  function parseBandFromFreqSafe(freqMHz) {
    if (typeof parseBandFromFreq === 'function') return parseBandFromFreq(freqMHz);
    return '';
  }

  function normalizeCallSafe(value) {
    if (typeof normalizeCall === 'function') return normalizeCall(value);
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  }

  function normalizeSpotterBaseSafe(value) {
    if (typeof normalizeSpotterBase === 'function') return normalizeSpotterBase(value);
    return normalizeCallSafe(value).replace(/-\d+$/, '');
  }

  function runEngineTaskSafe(type, payload = {}) {
    if (typeof runEngineTask === 'function') return runEngineTask(type, payload);
    return Promise.reject(new Error('engine task unavailable'));
  }

  function updateDataStatusSafe() {
    if (typeof updateDataStatus === 'function') updateDataStatus();
  }

  function renderActiveReportSafe() {
    if (typeof renderActiveReport === 'function') renderActiveReport();
  }

  function refreshOperatingStyleSpotAnchorsSafe(slot) {
    if (typeof refreshOperatingStyleSpotAnchors !== 'function') return;
    refreshOperatingStyleSpotAnchors(slot);
  }

  function formatDayOfYear(ts) {
    const d = new Date(ts);
    const start = Date.UTC(d.getUTCFullYear(), 0, 1);
    const day = Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start) / 86400000) + 1;
    return String(day).padStart(3, '0');
  }

  function buildSpotDayList(minTs, maxTs) {
    if (!Number.isFinite(minTs) || !Number.isFinite(maxTs)) return [];
    const days = [];
    const start = Date.UTC(new Date(minTs).getUTCFullYear(), new Date(minTs).getUTCMonth(), new Date(minTs).getUTCDate());
    const end = Date.UTC(new Date(maxTs).getUTCFullYear(), new Date(maxTs).getUTCMonth(), new Date(maxTs).getUTCDate());
    for (let t = start; t <= end; t += 86400000) {
      const d = new Date(t);
      days.push({
        year: d.getUTCFullYear(),
        doy: formatDayOfYear(t)
      });
    }
    return days;
  }

  function formatSpotDayLabel(day) {
    if (!day || !Number.isFinite(day.year)) return '';
    const dayNum = parseInt(day.doy, 10);
    if (!Number.isFinite(dayNum)) return `${day.year}/${day.doy}`;
    const date = new Date(Date.UTC(day.year, 0, 1));
    date.setUTCDate(date.getUTCDate() + dayNum - 1);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function buildRbnDayList(minTs, maxTs) {
    if (!Number.isFinite(minTs) || !Number.isFinite(maxTs)) return [];
    const days = [];
    const start = Date.UTC(new Date(minTs).getUTCFullYear(), new Date(minTs).getUTCMonth(), new Date(minTs).getUTCDate());
    const end = Date.UTC(new Date(maxTs).getUTCFullYear(), new Date(maxTs).getUTCMonth(), new Date(maxTs).getUTCDate());
    for (let t = start; t <= end; t += 86400000) {
      const d = new Date(t);
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      days.push(`${y}${m}${day}`);
    }
    return days;
  }

  function formatRbnDayLabel(day) {
    const raw = String(day || '');
    if (!/^\d{8}$/.test(raw)) return raw;
    const y = raw.slice(0, 4);
    const m = raw.slice(4, 6);
    const d = raw.slice(6, 8);
    return `${y}-${m}-${d}`;
  }

  function ensureSpotsState(slot) {
    const target = resolveSlot(slot);
    if (!target || typeof target !== 'object') return createSpotsStateSafe();
    if (!target.spotsState) {
      target.spotsState = createSpotsStateSafe();
    }
    return target.spotsState;
  }

  function getSpotsState() {
    return ensureSpotsState(getStateSafe());
  }

  function ensureRbnState(slot) {
    const target = resolveSlot(slot);
    if (!target || typeof target !== 'object') return createRbnStateSafe();
    if (!target.rbnState) {
      target.rbnState = createRbnStateSafe();
    }
    return target.rbnState;
  }

  function getRbnState() {
    return ensureRbnState(getStateSafe());
  }

  function getSpotStateBySource(slot, source) {
    return source === 'rbn' ? ensureRbnState(slot) : ensureSpotsState(slot);
  }

  function selectRbnDaysForSlot(slot, minTs, maxTs) {
    const allDays = buildRbnDayList(minTs, maxTs);
    if (!allDays.length) return [];
    const rbnState = ensureRbnState(slot);
    const selected = Array.isArray(rbnState.selectedDays) ? rbnState.selectedDays : [];
    const valid = selected.filter((day) => allDays.includes(day));
    let out = [];
    if (allDays.length <= 2) {
      out = allDays.slice();
    } else if (valid.length >= 2) {
      out = valid.slice(0, 2);
    } else if (valid.length === 1) {
      out = [valid[0]];
      const next = allDays.find((day) => day !== valid[0]);
      if (next) out.push(next);
    } else {
      out = allDays.slice(0, 2);
    }
    rbnState.selectedDays = out.slice();
    return out;
  }

  function loadSpotsForSource(slot, source) {
    if (source === 'rbn') return loadRbnForCurrentLog(slot);
    return loadSpotsForCurrentLog(slot);
  }

  function buildSpotWindowKey(minTs, maxTs) {
    return `${minTs || 0}-${maxTs || 0}`;
  }

  function resolveSpotDisplayRange(slot = getStateSafe()) {
    const appState = getStateSafe();
    const target = resolveSlot(slot);
    const localMin = Number(target?.derived?.timeRange?.minTs);
    const localMax = Number(target?.derived?.timeRange?.maxTs);
    if (!Number.isFinite(localMin) || !Number.isFinite(localMax)) {
      return { minTs: null, maxTs: null };
    }
    let minTs = localMin;
    let maxTs = localMax;
    if (appState?.compareEnabled) {
      const ranges = getLoadedCompareSlotsSafe()
        .map((entry) => ({
          minTs: Number(entry.slot?.derived?.timeRange?.minTs),
          maxTs: Number(entry.slot?.derived?.timeRange?.maxTs)
        }))
        .filter((range) => Number.isFinite(range.minTs) && Number.isFinite(range.maxTs));
      if (ranges.length) {
        minTs = Math.min(...ranges.map((range) => range.minTs));
        maxTs = Math.max(...ranges.map((range) => range.maxTs));
      }
    }
    return { minTs, maxTs };
  }

  function isSpotWithinDisplayRange(ts, range) {
    if (!Number.isFinite(ts)) return false;
    if (!range || !Number.isFinite(range.minTs) || !Number.isFinite(range.maxTs)) return true;
    return ts >= range.minTs && ts <= range.maxTs;
  }

  function getSpotHeatmapHours(minTs, maxTs) {
    const full = Array.from({ length: 24 }, (_, hour) => hour);
    if (!Number.isFinite(minTs) || !Number.isFinite(maxTs)) return full;
    if ((maxTs - minTs) >= (24 * 3600000 - 1)) return full;
    const startBucket = Math.floor(minTs / 3600000);
    const endBucket = Math.floor(maxTs / 3600000);
    if (!Number.isFinite(startBucket) || !Number.isFinite(endBucket) || endBucket < startBucket) return full;
    const out = [];
    const seen = new Set();
    for (let bucket = startBucket; bucket <= endBucket; bucket += 1) {
      const hour = ((bucket % 24) + 24) % 24;
      if (!seen.has(hour)) {
        seen.add(hour);
        out.push(hour);
      }
    }
    return out.length ? out : full;
  }

  function parseSpotLine(line) {
    const parts = String(line || '').split('^');
    if (parts.length < 6) return null;
    const freqKHz = parseFloat(parts[0]);
    const dxCall = (parts[1] || '').trim().toUpperCase();
    const ts = parseInt(parts[2], 10) * 1000;
    const comment = (parts[3] || '').trim();
    const spotter = (parts[4] || '').trim().toUpperCase();
    if (!dxCall || !spotter || !Number.isFinite(ts)) return null;
    const freqMHz = Number.isFinite(freqKHz) ? freqKHz / 1000 : null;
    const band = freqMHz ? normalizeBandTokenSafe(parseBandFromFreqSafe(freqMHz) || '') : '';
    return { dxCall, spotter, ts, freqKHz, freqMHz, band, comment };
  }

  function buildQsoTimeIndex(qsos) {
    const map = new Map();
    (qsos || []).forEach((qso) => {
      if (!Number.isFinite(qso.ts)) return;
      const band = normalizeBandTokenSafe(qso.band || '');
      if (!band) return;
      if (!map.has(band)) map.set(band, []);
      map.get(band).push(qso.ts);
    });
    map.forEach((list) => list.sort((a, b) => a - b));
    return map;
  }

  function buildQsoCallIndex(qsos) {
    const map = new Map();
    (qsos || []).forEach((qso) => {
      if (!Number.isFinite(qso.ts) || !qso.call) return;
      const band = normalizeBandTokenSafe(qso.band || '');
      if (!band) return;
      const call = normalizeCallSafe(qso.call);
      if (!call) return;
      if (!map.has(band)) map.set(band, new Map());
      const bandMap = map.get(band);
      if (!bandMap.has(call)) bandMap.set(call, []);
      bandMap.get(call).push(qso.ts);
    });
    map.forEach((bandMap) => {
      bandMap.forEach((list) => list.sort((a, b) => a - b));
    });
    return map;
  }

  function materializeQsoTimeIndex(entries) {
    return new Map((entries || []).map(([band, list]) => [band, Array.isArray(list) ? list.slice() : []]));
  }

  function materializeQsoCallIndex(entries) {
    return new Map((entries || []).map(([band, bandEntries]) => [
      band,
      new Map((bandEntries || []).map(([call, list]) => [call, Array.isArray(list) ? list.slice() : []]))
    ]));
  }

  async function buildSpotIndexesAsync(qsos) {
    const lite = (qsos || []).map((qso) => ({
      ts: qso?.ts,
      band: qso?.band || '',
      call: qso?.call || ''
    }));
    try {
      const data = await runEngineTaskSafe('spotIndexes', { qsos: lite });
      return {
        qsoIndex: materializeQsoTimeIndex(data?.timeIndexEntries),
        qsoCallIndex: materializeQsoCallIndex(data?.callIndexEntries)
      };
    } catch (err) {
      return {
        qsoIndex: buildQsoTimeIndex(qsos),
        qsoCallIndex: buildQsoCallIndex(qsos)
      };
    }
  }

  function hasQsoWithin(band, ts, index, windowMs) {
    if (!band || !index?.has?.(band)) return false;
    const list = index.get(band);
    let lo = 0;
    let hi = list.length - 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const val = list[mid];
      if (val < ts) lo = mid + 1;
      else if (val > ts) hi = mid - 1;
      else return true;
    }
    const candidates = [];
    if (lo < list.length) candidates.push(list[lo]);
    if (lo - 1 >= 0) candidates.push(list[lo - 1]);
    return candidates.some((time) => Math.abs(time - ts) <= windowMs);
  }

  function hasQsoCallWithin(band, call, ts, index, windowMs) {
    if (!band || !call || !index?.has?.(band)) return false;
    const bandMap = index.get(band);
    const key = normalizeCallSafe(call);
    if (!bandMap || !bandMap.has(key)) return false;
    const list = bandMap.get(key);
    let lo = 0;
    let hi = list.length - 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const val = list[mid];
      if (val < ts) lo = mid + 1;
      else if (val > ts) hi = mid - 1;
      else return true;
    }
    const candidates = [];
    if (lo < list.length) candidates.push(list[lo]);
    if (lo - 1 >= 0) candidates.push(list[lo - 1]);
    return candidates.some((time) => Math.abs(time - ts) <= windowMs);
  }

  function getNearestQsoDeltaMinutes(band, ts, index) {
    if (!band || !index?.has?.(band)) return null;
    const list = index.get(band);
    let lo = 0;
    let hi = list.length - 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const val = list[mid];
      if (val < ts) lo = mid + 1;
      else if (val > ts) hi = mid - 1;
      else return 0;
    }
    const candidates = [];
    if (lo < list.length) candidates.push(list[lo]);
    if (lo - 1 >= 0) candidates.push(list[lo - 1]);
    if (!candidates.length) return null;
    const best = Math.min(...candidates.map((time) => Math.abs(time - ts)));
    return best / 60000;
  }

  function getNearestQsoCallDeltaMinutes(band, call, ts, index) {
    if (!band || !call || !index?.has?.(band)) return null;
    const bandMap = index.get(band);
    const key = normalizeCallSafe(call);
    if (!bandMap || !bandMap.has(key)) return null;
    const list = bandMap.get(key);
    let lo = 0;
    let hi = list.length - 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const val = list[mid];
      if (val < ts) lo = mid + 1;
      else if (val > ts) hi = mid - 1;
      else return 0;
    }
    const candidates = [];
    if (lo < list.length) candidates.push(list[lo]);
    if (lo - 1 >= 0) candidates.push(list[lo - 1]);
    if (!candidates.length) return null;
    const best = Math.min(...candidates.map((time) => Math.abs(time - ts)));
    return best / 60000;
  }

  async function fetchSpotFile(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.status === 429) {
      const retryAfter = String(res.headers.get('retry-after') || '').trim();
      const retryAfterSeconds = retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) : null;
      const err = new Error('Rate limited (HTTP 429).');
      err.status = 429;
      err.retryAfterMs = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : 15000;
      throw err;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!/\.gz$/i.test(url)) return res.text();
    if (typeof DecompressionStream !== 'function') {
      throw new Error('gzip not supported in this browser');
    }
    const buffer = await res.arrayBuffer();
    const ds = new DecompressionStream('gzip');
    const stream = new Response(buffer).body.pipeThrough(ds);
    return new Response(stream).text();
  }

  function formatRbnComment(spot) {
    const parts = [];
    if (Number.isFinite(spot.snr)) parts.push(`SNR ${spot.snr} dB`);
    if (Number.isFinite(spot.speed)) parts.push(`Speed ${spot.speed}`);
    if (spot.mode) parts.push(String(spot.mode).toUpperCase());
    if (spot.txMode && spot.txMode !== spot.mode) parts.push(`TX ${String(spot.txMode).toUpperCase()}`);
    if (spot.spotterRaw && spot.spotterRaw !== spot.spotter) parts.push(`Skimmer ${spot.spotterRaw}`);
    return parts.join(' · ');
  }

  function normalizeRbnSpot(raw) {
    if (!raw) return null;
    const spotterRaw = normalizeCallSafe(raw.spotterRaw || raw.spotter || '');
    const spotter = normalizeSpotterBaseSafe(raw.spotter || spotterRaw);
    const dxCall = normalizeCallSafe(raw.dxCall || '');
    const ts = Number(raw.ts);
    const freqKHz = raw.freqKHz != null ? Number(raw.freqKHz) : Number(raw.freq);
    const freqMHz = Number.isFinite(raw.freqMHz) ? Number(raw.freqMHz) : (Number.isFinite(freqKHz) ? freqKHz / 1000 : null);
    let band = normalizeBandTokenSafe(raw.band || '');
    if (!band && Number.isFinite(freqMHz)) band = normalizeBandTokenSafe(parseBandFromFreqSafe(freqMHz));
    const snr = raw.snr != null ? Number(raw.snr) : (raw.db != null ? Number(raw.db) : null);
    const speed = raw.speed != null ? Number(raw.speed) : null;
    const mode = raw.mode || '';
    const txMode = raw.txMode || raw.tx_mode || '';
    const spot = {
      spotter,
      spotterRaw,
      dxCall,
      ts: Number.isFinite(ts) ? ts : null,
      freqKHz: Number.isFinite(freqKHz) ? freqKHz : null,
      freqMHz: Number.isFinite(freqMHz) ? freqMHz : null,
      band: band || '',
      mode,
      snr: Number.isFinite(snr) ? snr : null,
      speed: Number.isFinite(speed) ? speed : null,
      txMode
    };
    spot.comment = formatRbnComment(spot);
    return spot;
  }

  async function fetchRbnSpots(call, days) {
    const params = new URLSearchParams();
    if (call) params.set('call', call);
    if (days && days.length) params.set('days', days.join(','));
    const url = `${rbnProxyUrl}?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.status === 429) {
      const retryAfter = String(res.headers.get('retry-after') || '').trim();
      const retryAfterSeconds = retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) : null;
      const err = new Error('Rate limited (HTTP 429).');
      err.status = 429;
      err.retryAfterMs = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : 15000;
      throw err;
    }
    if (res.status === 404) {
      return {
        call: String(call || ''),
        days: Array.isArray(days) ? days.slice() : [],
        total: 0,
        totalOfUs: 0,
        totalByUs: 0,
        capPerSide: 0,
        truncatedOfUs: false,
        truncatedByUs: false,
        ofUsSpots: [],
        byUsSpots: [],
        errors: [],
        notFound: true
      };
    }
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        if (body && typeof body === 'object' && body.error) msg = String(body.error);
      } catch (err) {
        // ignore parse failures
      }
      throw new Error(msg);
    }
    const data = await res.json();
    if (!data || typeof data !== 'object') throw new Error('Invalid RBN response');
    return data;
  }

  async function loadSpotsForCurrentLog(slot = getStateSafe()) {
    const target = resolveSlot(slot);
    const spotsState = ensureSpotsState(target);
    if (!target?.derived || !target?.qsoData) return;
    const call = normalizeCallSafe(target.derived.contestMeta?.stationCallsign || '');
    const minTs = target.derived.timeRange?.minTs;
    const maxTs = target.derived.timeRange?.maxTs;
    if (!call || !Number.isFinite(minTs) || !Number.isFinite(maxTs)) {
      spotsState.status = 'error';
      spotsState.error = 'Missing callsign or time range.';
      renderActiveReportSafe();
      return;
    }
    const win = getWindowSafe();
    const windowKey = buildSpotWindowKey(minTs, maxTs);
    const candidateCalls = typeof getMultiplierCandidateCalls === 'function'
      ? Array.from(getMultiplierCandidateCalls()).map(normalizeCallSafe).filter(Boolean).sort()
      : [];
    const candidateCallSet = new Set(candidateCalls);
    const candidateKey = candidateCalls.join(',');
    const attemptKey = `${call}|${windowKey}|${candidateKey}`;
    const now = Date.now();
    const minRetryDelayMs = (spotsState.lastErrorStatus === 429)
      ? Math.max(3000, Math.min(60000, Number(spotsState.retryAfterMs) || 15000))
      : 60000;
    if (
      spotsState.status === 'error'
      && String(spotsState.lastErrorKey || '') === attemptKey
      && (now - Number(spotsState.lastErrorAt || 0)) < minRetryDelayMs
    ) {
      return;
    }
    if (
      spotsState.status === 'qrx'
      && String(spotsState.lastErrorKey || '') === attemptKey
      && (now - Number(spotsState.lastErrorAt || 0)) < minRetryDelayMs
    ) {
      return;
    }
    if (spotsState.status === 'ready' && spotsState.lastWindowKey === windowKey && spotsState.lastCall === call && spotsState.lastCandidateKey === candidateKey) {
      renderActiveReportSafe();
      return;
    }
    if (
      spotsState.status === 'loading'
      && spotsState.inflightPromise
      && String(spotsState.inflightKey || '') === attemptKey
    ) {
      return spotsState.inflightPromise;
    }
    spotsState.status = 'loading';
    spotsState.error = null;
    spotsState.lastErrorKey = null;
    spotsState.lastErrorAt = 0;
    spotsState.lastErrorStatus = null;
    spotsState.retryAfterMs = 0;
    spotsState.errors = [];
    spotsState.stats = null;
    spotsState.inflightKey = attemptKey;
    updateDataStatusSafe();
    renderActiveReportSafe();
    const days = buildSpotDayList(minTs, maxTs);
    const urls = days.map((day) => ({
      day,
      urls: [
        `${spotsBaseUrl}/${day.year}/${day.doy}.dat`,
        `${spotsBaseUrl}/${day.year}/${day.doy}.dat.gz`
      ]
    }));
    const { qsoIndex, qsoCallIndex } = await buildSpotIndexesAsync(target.qsoData.qsos);
    try {
      if (spotsState.retryTimer) {
        win.clearTimeout(spotsState.retryTimer);
        spotsState.retryTimer = null;
      }
      spotsState.inflightPromise = (async () => {
        let total = 0;
        const ofUsSpots = [];
        const byUsSpots = [];
        const candidateSpots = [];
        for (const entry of urls) {
          let text = null;
          let lastErr = null;
          for (const url of entry.urls) {
            try {
              text = await fetchSpotFile(url);
              break;
            } catch (err) {
              lastErr = err;
            }
          }
          if (text == null) throw lastErr || new Error('Spot file missing');
          const lines = text.split(/\r?\n/);
          for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
            const line = lines[lineIndex];
            if (!line) continue;
            const spot = parseSpotLine(line);
            if (!spot) continue;
            total += 1;
            if (spot.dxCall === call) {
              ofUsSpots.push(spot);
            }
            if (spot.spotter === call) {
              byUsSpots.push(spot);
            }
            const multiplierEntities = typeof mapSpotMultiplierEntities === 'function'
              ? mapSpotMultiplierEntities(spot, target)
              : [];
            if (multiplierEntities.length) candidateSpots.push({ ...spot, multiplierEntities });
            else if (candidateCallSet.has(spot.dxCall)) candidateSpots.push(spot);
            if (lineIndex > 0 && lineIndex % 10000 === 0) {
              await new Promise((resolve) => win.setTimeout(resolve, 0));
            }
          }
        }
        return { total, ofUsSpots, byUsSpots, candidateSpots };
      })();
      const data = await spotsState.inflightPromise;
      spotsState.status = 'ready';
      spotsState.error = null;
      spotsState.lastWindowKey = windowKey;
      spotsState.lastCall = call;
      spotsState.lastCandidateKey = candidateKey;
      spotsState.totalScanned = data.total;
      spotsState.raw = { ofUsSpots: data.ofUsSpots, byUsSpots: data.byUsSpots, candidateSpots: data.candidateSpots };
      spotsState.totalOfUs = data.ofUsSpots.length;
      spotsState.totalByUs = data.byUsSpots.length;
      spotsState.capPerSide = null;
      spotsState.truncatedOfUs = false;
      spotsState.truncatedByUs = false;
      spotsState.summaryOnly = false;
      spotsState.qsoIndex = qsoIndex;
      spotsState.qsoCallIndex = qsoCallIndex;
      computeSpotsStats(target);
      refreshOperatingStyleSpotAnchorsSafe(target);
    } catch (err) {
      const status = err && typeof err === 'object' && Number.isFinite(err.status) ? Number(err.status) : null;
      const retryAfterMs = err && typeof err === 'object' && Number.isFinite(err.retryAfterMs) ? Number(err.retryAfterMs) : 0;
      spotsState.lastErrorStatus = status;
      spotsState.retryAfterMs = retryAfterMs;
      if (status === 429) {
        spotsState.status = 'qrx';
        spotsState.error = null;
        if (spotsState.retryTimer) win.clearTimeout(spotsState.retryTimer);
        spotsState.retryTimer = win.setTimeout(() => loadSpotsForCurrentLog(target), retryAfterMs || 15000);
      } else {
        spotsState.status = 'error';
        spotsState.error = err && err.message ? err.message : 'Failed to load spots.';
      }
      spotsState.lastErrorKey = attemptKey;
      spotsState.lastErrorAt = Date.now();
    }
    if (spotsState.status !== 'loading') {
      spotsState.inflightKey = null;
      spotsState.inflightPromise = null;
    }
    updateDataStatusSafe();
    renderActiveReportSafe();
  }

  async function loadRbnForCurrentLog(slot = getStateSafe()) {
    const target = resolveSlot(slot);
    const rbnState = ensureRbnState(target);
    if (!target?.derived || !target?.qsoData) return;
    const call = normalizeCallSafe(target.derived.contestMeta?.stationCallsign || '');
    const minTs = target.derived.timeRange?.minTs;
    const maxTs = target.derived.timeRange?.maxTs;
    if (!call || !Number.isFinite(minTs) || !Number.isFinite(maxTs)) {
      rbnState.status = 'error';
      rbnState.error = 'Missing callsign or time range.';
      renderActiveReportSafe();
      return;
    }
    const win = getWindowSafe();
    const windowKey = buildSpotWindowKey(minTs, maxTs);
    const days = selectRbnDaysForSlot(target, minTs, maxTs);
    const daysKey = (days || []).join(',');
    const attemptKey = `${call}|${windowKey}|${daysKey}`;
    const now = Date.now();
    const minRetryDelayMs = (rbnState.lastErrorStatus === 429)
      ? Math.max(3000, Math.min(60000, Number(rbnState.retryAfterMs) || 15000))
      : 60000;
    if (
      rbnState.status === 'error'
      && String(rbnState.lastErrorKey || '') === attemptKey
      && (now - Number(rbnState.lastErrorAt || 0)) < minRetryDelayMs
    ) {
      return;
    }
    if (
      rbnState.status === 'ready'
      && rbnState.lastWindowKey === windowKey
      && rbnState.lastCall === call
      && String(rbnState.lastDaysKey || '') === daysKey
    ) {
      renderActiveReportSafe();
      return;
    }
    rbnState.status = 'loading';
    rbnState.error = null;
    rbnState.lastErrorKey = null;
    rbnState.lastErrorAt = 0;
    rbnState.lastErrorStatus = null;
    rbnState.retryAfterMs = 0;
    rbnState.errors = [];
    rbnState.stats = null;
    rbnState.inflightKey = attemptKey;
    updateDataStatusSafe();
    renderActiveReportSafe();
    const { qsoIndex, qsoCallIndex } = await buildSpotIndexesAsync(target.qsoData.qsos);
    try {
      if (rbnState.retryTimer) {
        win.clearTimeout(rbnState.retryTimer);
        rbnState.retryTimer = null;
      }
      if (!(rbnState.inflightPromise && String(rbnState.inflightKey || '') === attemptKey)) {
        rbnState.inflightKey = attemptKey;
        rbnState.inflightPromise = fetchRbnSpots(call, days);
      }
      const data = await rbnState.inflightPromise;
      const ofUsSpots = (data.ofUsSpots || []).map(normalizeRbnSpot).filter(Boolean);
      const byUsSpots = (data.byUsSpots || []).map(normalizeRbnSpot).filter(Boolean);
      rbnState.status = 'ready';
      rbnState.error = null;
      rbnState.lastWindowKey = windowKey;
      rbnState.lastCall = call;
      rbnState.lastDaysKey = daysKey;
      rbnState.totalScanned = data.total || data.scanned || 0;
      rbnState.errors = Array.isArray(data.errors) ? data.errors : [];
      rbnState.totalOfUs = Number.isFinite(data.totalOfUs) ? data.totalOfUs : ofUsSpots.length;
      rbnState.totalByUs = Number.isFinite(data.totalByUs) ? data.totalByUs : byUsSpots.length;
      rbnState.capPerSide = Number.isFinite(data.capPerSide) ? data.capPerSide : null;
      rbnState.truncatedOfUs = Boolean(data.truncatedOfUs);
      rbnState.truncatedByUs = Boolean(data.truncatedByUs);
      rbnState.summaryOnly = (rbnState.totalOfUs + rbnState.totalByUs) > rbnSummaryOnlyThreshold;
      rbnState.raw = { ofUsSpots, byUsSpots };
      rbnState.qsoIndex = qsoIndex;
      rbnState.qsoCallIndex = qsoCallIndex;
      computeSpotsStats(target, rbnState);
      refreshOperatingStyleSpotAnchorsSafe(target);
    } catch (err) {
      const status = err && typeof err === 'object' && Number.isFinite(err.status) ? Number(err.status) : null;
      const retryAfterMs = err && typeof err === 'object' && Number.isFinite(err.retryAfterMs) ? Number(err.retryAfterMs) : 0;
      rbnState.lastErrorStatus = status;
      rbnState.retryAfterMs = retryAfterMs;
      if (status === 429) {
        rbnState.status = 'qrx';
        rbnState.error = null;
        if (rbnState.retryTimer) win.clearTimeout(rbnState.retryTimer);
        rbnState.retryTimer = win.setTimeout(() => loadRbnForCurrentLog(target), retryAfterMs || 15000);
      } else {
        rbnState.status = 'error';
        rbnState.error = err && err.message ? err.message : 'Failed to load RBN spots.';
      }
      rbnState.lastErrorKey = attemptKey;
      rbnState.lastErrorAt = Date.now();
    }
    if (rbnState.status !== 'loading') {
      rbnState.inflightKey = null;
      rbnState.inflightPromise = null;
    }
    updateDataStatusSafe();
    renderActiveReportSafe();
  }

  function computeSpotsStats(slot = getStateSafe(), spotsStateOverride = null) {
    const target = resolveSlot(slot);
    const spotsState = spotsStateOverride || ensureSpotsState(target);
    if (!spotsState.raw || !target?.qsoData) return;
    const windowMinutes = Number(spotsState.windowMinutes) || 15;
    const windowMs = windowMinutes * 60 * 1000;
    const filterSet = new Set(spotsState.bandFilter || []);
    const bandAllowed = (band) => {
      if (!filterSet.size) return true;
      const key = band || 'unknown';
      return filterSet.has(key);
    };
    const displayRange = resolveSpotDisplayRange(target);
    const qsoRecordsByBand = new Map();
    const qsoRecordsByBandCall = new Map();
    (target.qsoData.qsos || []).forEach((qso) => {
      if (!Number.isFinite(qso?.ts)) return;
      const band = normalizeBandTokenSafe(qso.band || '');
      if (!qsoRecordsByBand.has(band)) qsoRecordsByBand.set(band, []);
      qsoRecordsByBand.get(band).push(qso);
      const call = normalizeCallSafe(qso.call || '');
      if (call) {
        const key = `${band}|${call}`;
        if (!qsoRecordsByBandCall.has(key)) qsoRecordsByBandCall.set(key, []);
        qsoRecordsByBandCall.get(key).push(qso);
      }
    });
    qsoRecordsByBand.forEach((list) => list.sort((a, b) => a.ts - b.ts));
    qsoRecordsByBandCall.forEach((list) => list.sort((a, b) => a.ts - b.ts));
    const nearestQso = (band, ts, call = '') => {
      const bandKey = normalizeBandTokenSafe(band || '');
      const wantedCall = normalizeCallSafe(call);
      const list = wantedCall ? (qsoRecordsByBandCall.get(`${bandKey}|${wantedCall}`) || []) : (qsoRecordsByBand.get(bandKey) || []);
      let lo = 0;
      let hi = list.length;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (list[mid].ts < ts) lo = mid + 1; else hi = mid; }
      const candidates = [list[lo - 1], list[lo]].filter(Boolean);
      const best = candidates.sort((a, b) => Math.abs(a.ts - ts) - Math.abs(b.ts - ts))[0] || null;
      return best && Math.abs(best.ts - ts) <= windowMs ? best : null;
    };
    const radioIdForQso = (qso) => {
      const value = qso?.txId ?? qso?.raw?.TX_ID ?? qso?.raw?.TRANSMITTER_ID ?? qso?.raw?.RADIO_ID ?? qso?.raw?.RADIO;
      const id = String(value == null ? '' : value).trim().toUpperCase();
      return /^[A-Z0-9][A-Z0-9._-]{0,15}$/.test(id) ? id : null;
    };
    let ofUs = 0;
    let byUs = 0;
    let ofUsMatched = 0;
    let byUsMatched = 0;
    let byUsMatchedDx = 0;
    const spotters = new Map();
    const dxTargets = new Map();
    const bandStats = new Map();
    const responseTimes = [];
    const responseDxTimes = [];
    const heatmap = new Map();
    const ofUsSpots = [];
    const byUsSpots = [];
    (spotsState.raw.ofUsSpots || []).forEach((spot) => {
      if (!isSpotWithinDisplayRange(spot.ts, displayRange)) return;
      if (!bandAllowed(spot.band)) return;
      ofUs += 1;
      spotters.set(spot.spotter, (spotters.get(spot.spotter) || 0) + 1);
      const bandKey = spot.band || 'unknown';
      if (!bandStats.has(bandKey)) bandStats.set(bandKey, { ofUs: 0, ofUsMatched: 0, byUs: 0, byUsMatched: 0 });
      bandStats.get(bandKey).ofUs += 1;
      const matchedQso = nearestQso(spot.band, spot.ts);
      const matched = Boolean(matchedQso);
      if (matched) {
        ofUsMatched += 1;
        bandStats.get(bandKey).ofUsMatched += 1;
      }
      const delta = matchedQso ? Math.abs(matchedQso.ts - spot.ts) / 60000 : null;
      if (matched && Number.isFinite(delta)) responseTimes.push(delta);
      ofUsSpots.push({ ...spot, matched, delta, matchedRadioId: radioIdForQso(matchedQso), radioAttribution: matchedQso ? 'time-nearby inferred' : '' });
      if (spot.band) {
        if (!heatmap.has(spot.band)) heatmap.set(spot.band, Array.from({ length: 24 }, () => 0));
        const hour = new Date(spot.ts).getUTCHours();
        heatmap.get(spot.band)[hour] = (heatmap.get(spot.band)[hour] || 0) + 1;
      }
    });
    (spotsState.raw.byUsSpots || []).forEach((spot) => {
      if (!isSpotWithinDisplayRange(spot.ts, displayRange)) return;
      if (!bandAllowed(spot.band)) return;
      byUs += 1;
      dxTargets.set(spot.dxCall, (dxTargets.get(spot.dxCall) || 0) + 1);
      const bandKey = spot.band || 'unknown';
      if (!bandStats.has(bandKey)) bandStats.set(bandKey, { ofUs: 0, ofUsMatched: 0, byUs: 0, byUsMatched: 0 });
      bandStats.get(bandKey).byUs += 1;
      const matchedAnyQso = nearestQso(spot.band, spot.ts);
      const matched = Boolean(matchedAnyQso);
      if (matched) {
        byUsMatched += 1;
        bandStats.get(bandKey).byUsMatched += 1;
      }
      const matchedDxQso = nearestQso(spot.band, spot.ts, spot.dxCall);
      const matchedDx = Boolean(matchedDxQso);
      const deltaDx = matchedDxQso ? Math.abs(matchedDxQso.ts - spot.ts) / 60000 : null;
      if (matchedDx) {
        byUsMatchedDx += 1;
        if (Number.isFinite(deltaDx)) responseDxTimes.push(deltaDx);
      }
      const matchedQso = matchedDxQso || matchedAnyQso;
      byUsSpots.push({ ...spot, matched, matchedDx, deltaDx: Number.isFinite(deltaDx) ? deltaDx : null, matchedRadioId: radioIdForQso(matchedQso), radioAttribution: matchedQso ? 'time-nearby inferred' : '' });
    });
    const topSpotters = Array.from(spotters.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const topDx = Array.from(dxTargets.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
    spotsState.stats = {
      total: spotsState.totalScanned || 0,
      ofUs,
      byUs,
      ofUsMatched,
      byUsMatched,
      byUsMatchedDx,
      topSpotters,
      topDx,
      ofUsSpots,
      byUsSpots,
      bandStats: Array.from(bandStats.entries()).map(([band, info]) => ({ band, ...info })),
      responseTimes,
      responseDxTimes,
      heatmap: Array.from(heatmap.entries()).map(([band, hours]) => ({ band, hours }))
    };
  }

  return {
    buildSpotDayList,
    formatSpotDayLabel,
    buildRbnDayList,
    formatRbnDayLabel,
    ensureSpotsState,
    getSpotsState,
    ensureRbnState,
    getRbnState,
    getSpotStateBySource,
    selectRbnDaysForSlot,
    loadSpotsForSource,
    buildSpotWindowKey,
    resolveSpotDisplayRange,
    isSpotWithinDisplayRange,
    getSpotHeatmapHours,
    parseSpotLine,
    buildQsoTimeIndex,
    buildQsoCallIndex,
    materializeQsoTimeIndex,
    materializeQsoCallIndex,
    buildSpotIndexesAsync,
    hasQsoWithin,
    hasQsoCallWithin,
    getNearestQsoDeltaMinutes,
    getNearestQsoCallDeltaMinutes,
    fetchSpotFile,
    formatRbnComment,
    normalizeRbnSpot,
    fetchRbnSpots,
    loadSpotsForCurrentLog,
    loadRbnForCurrentLog,
    computeSpotsStats
  };
}
