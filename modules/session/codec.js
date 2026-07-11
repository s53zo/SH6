export function createSessionCodec(deps = {}) {
  const historicalCompareLogWindowSize = 1000;
  const {
    getState,
    getSlotById,
    slotIds = ['A', 'B', 'C', 'D'],
    appVersion,
    sessionVersion,
    permalinkBaseUrl,
    permalinkCompactPrefix,
    periodFilterCompactYears,
    periodFilterCompactMonths,
    analysisModeDxer,
    compareScoreModeComputed,
    defaultCompareFocus,
    normalizeAnalysisMode,
    normalizeCompareScoreMode,
    normalizeWpxColumnMode,
    normalizePeriodYears,
    normalizePeriodMonths,
    cloneCompareFocus,
    cloneTsRange,
    base64UrlEncode,
    base64UrlDecode
  } = deps;

  function serializeSpotSettings(spotState) {
    if (!spotState) return { windowMinutes: 15, bandFilter: [] };
    return {
      windowMinutes: Number(spotState.windowMinutes) || 15,
      bandFilter: Array.isArray(spotState.bandFilter) ? spotState.bandFilter.slice() : []
    };
  }

  function serializeRbnSettings(rbnState) {
    if (!rbnState) return { windowMinutes: 15, bandFilter: [], selectedDays: [] };
    return {
      windowMinutes: Number(rbnState.windowMinutes) || 15,
      bandFilter: Array.isArray(rbnState.bandFilter) ? rbnState.bandFilter.slice() : [],
      selectedDays: Array.isArray(rbnState.selectedDays) ? rbnState.selectedDays.slice() : []
    };
  }

  function buildSessionPayload(includeRaw) {
    const state = getState();
    const slots = slotIds.map((id) => {
      const slot = getSlotById(id);
      if (!slot || !slot.qsoData || !slot.logFile) {
        return { id, empty: true, skipped: !!slot?.skipped };
      }
      const file = {
        name: slot.logFile?.name || '',
        size: Number.isFinite(slot.logFile?.size) ? slot.logFile.size : 0,
        source: slot.logFile?.source || ''
      };
      const path = slot.logFile?.path || '';
      const sourceType = path ? 'archive' : 'local';
      const data = {
        id,
        empty: false,
        skipped: false,
        file,
        sourceType,
        archivePath: path || '',
        scoringRuleOverride: slot.scoringRuleOverride || '',
        spots: serializeSpotSettings(slot.spotsState),
        rbn: serializeRbnSettings(slot.rbnState)
      };
      if (includeRaw) {
        data.rawText = slot.rawLogText || '';
      }
      return data;
    });
    return {
      version: sessionVersion,
      createdAt: Date.now(),
      appVersion,
      analysisMode: state.analysisMode,
      compareCount: state.compareCount,
      compareScoreMode: state.compareScoreMode,
      compareSyncEnabled: state.compareSyncEnabled,
      compareStickyEnabled: state.compareStickyEnabled,
      compareTimeRangeLock: cloneTsRange(state.compareTimeRangeLock),
      wpxColumnMode: typeof normalizeWpxColumnMode === 'function'
        ? normalizeWpxColumnMode(state.wpxColumnMode)
        : state.wpxColumnMode,
      compareFocus: state.compareFocus,
      globalBandFilter: state.globalBandFilter || '',
      breakThreshold: state.breakThreshold,
      passedQsoWindow: state.passedQsoWindow,
      globalYearsFilter: state.globalYearsFilter || [],
      globalMonthsFilter: state.globalMonthsFilter || [],
      logPageSize: state.logPageSize,
      logPage: state.logPage,
      compareLogWindowStart: state.compareLogWindowStart,
      compareLogWindowSize: state.compareLogWindowSize,
      logFilters: {
        search: state.logSearch || '',
        fieldFilter: state.logFieldFilter || '',
        bandFilter: state.logBandFilter || '',
        modeFilter: state.logModeFilter || '',
        opFilter: state.logOpFilter || '',
        callLenFilter: Number.isFinite(state.logCallLenFilter) ? state.logCallLenFilter : null,
        callStructFilter: state.logCallStructFilter || '',
        countryFilter: state.logCountryFilter || '',
        continentFilter: state.logContinentFilter || '',
        cqFilter: state.logCqFilter || '',
        ituFilter: state.logItuFilter || '',
        operatingStyleFilter: state.logOperatingStyleFilter || null,
        rangeFilter: state.logRange || null,
        timeRange: state.logTimeRange || null,
        headingRange: state.logHeadingRange || null,
        stationQsoRange: state.logStationQsoRange || null,
        distanceRange: state.logDistanceRange || null
      },
      slots
    };
  }

  function createDefaultLogFilters() {
    return {
      search: '',
      fieldFilter: '',
      bandFilter: '',
      modeFilter: '',
      opFilter: '',
      callLenFilter: null,
      callStructFilter: '',
      countryFilter: '',
      continentFilter: '',
      cqFilter: '',
      ituFilter: '',
      operatingStyleFilter: null,
      rangeFilter: null,
      timeRange: null,
      headingRange: null,
      stationQsoRange: null,
      distanceRange: null
    };
  }

  function normalizeCompactSlotList(list) {
    if (!Array.isArray(list)) return [];
    const out = [];
    list.forEach((value) => {
      const id = String(value || '').toUpperCase();
      if (!slotIds.includes(id)) return;
      if (!out.includes(id)) out.push(id);
    });
    return out;
  }

  function sameStringList(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (String(a[i]) !== String(b[i])) return false;
    }
    return true;
  }

  function compactCompareFocus(focus) {
    const current = cloneCompareFocus(focus || defaultCompareFocus);
    const compact = {};
    const mapping = [
      ['countries_by_time', 'c'],
      ['countries_by_month', 'r'],
      ['qs_by_minute', 'm'],
      ['one_minute_rates', 'o'],
      ['points_by_minute', 'p'],
      ['one_minute_point_rates', 'q'],
      ['countries_by_year', 'u'],
      ['zones_cq_by_year', 'v'],
      ['zones_cq_by_month', 's'],
      ['zones_itu_by_year', 'w'],
      ['zones_itu_by_month', 't']
    ];
    mapping.forEach(([key, shortKey]) => {
      const now = normalizeCompactSlotList(current[key]);
      const def = normalizeCompactSlotList(defaultCompareFocus[key]);
      if (!sameStringList(now, def)) compact[shortKey] = now;
    });
    return Object.keys(compact).length ? compact : null;
  }

  function inflateCompareFocus(compact) {
    const out = cloneCompareFocus();
    if (!compact || typeof compact !== 'object') return out;
    const mapping = {
      c: 'countries_by_time',
      r: 'countries_by_month',
      x: 'countries_by_month',
      m: 'qs_by_minute',
      o: 'one_minute_rates',
      p: 'points_by_minute',
      q: 'one_minute_point_rates',
      u: 'countries_by_year',
      v: 'zones_cq_by_year',
      s: 'zones_cq_by_month',
      w: 'zones_itu_by_year',
      t: 'zones_itu_by_month'
    };
    Object.entries(mapping).forEach(([shortKey, key]) => {
      if (!(shortKey in compact)) return;
      out[key] = normalizeCompactSlotList(compact[shortKey]);
    });
    return out;
  }

  function compactRangeObject(value, startKey, endKey) {
    if (!value || typeof value !== 'object') return null;
    const start = Number(value[startKey]);
    const end = Number(value[endKey]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    return [start, end];
  }

  function inflateRangeObject(value, startKey, endKey) {
    if (!Array.isArray(value) || value.length !== 2) return null;
    const start = Number(value[0]);
    const end = Number(value[1]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    return { [startKey]: start, [endKey]: end };
  }

  function compactLogFilters(filters) {
    const f = filters || createDefaultLogFilters();
    const compact = {};
    if (f.search) compact.s = f.search;
    if (f.fieldFilter) compact.f = f.fieldFilter;
    if (f.bandFilter) compact.b = f.bandFilter;
    if (f.modeFilter) compact.m = f.modeFilter;
    if (f.opFilter) compact.o = f.opFilter;
    if (Number.isFinite(f.callLenFilter)) compact.l = Number(f.callLenFilter);
    if (f.callStructFilter) compact.t = f.callStructFilter;
    if (f.countryFilter) compact.c = f.countryFilter;
    if (f.continentFilter) compact.k = f.continentFilter;
    if (f.cqFilter) compact.q = f.cqFilter;
    if (f.ituFilter) compact.i = f.ituFilter;
    if (f.operatingStyleFilter && typeof f.operatingStyleFilter === 'object') {
      const band = String(f.operatingStyleFilter.band || '').trim();
      const role = String(f.operatingStyleFilter.role || '').trim();
      if (band || role) compact.v = { b: band, r: role };
    }
    const qsoRange = compactRangeObject(f.rangeFilter, 'start', 'end');
    if (qsoRange) compact.r = qsoRange;
    if (f.rangeFilter?.excludeDupes) compact.rd = 1;
    const timeRange = compactRangeObject(f.timeRange, 'startTs', 'endTs');
    if (timeRange) compact.y = timeRange;
    const headingRange = compactRangeObject(f.headingRange, 'start', 'end');
    if (headingRange) compact.h = headingRange;
    const stationRange = compactRangeObject(f.stationQsoRange, 'min', 'max');
    if (stationRange) compact.u = stationRange;
    const distanceRange = compactRangeObject(f.distanceRange, 'start', 'end');
    if (distanceRange) compact.d = distanceRange;
    return Object.keys(compact).length ? compact : null;
  }

  function inflateCompactLogFilters(compact) {
    const out = createDefaultLogFilters();
    if (!compact || typeof compact !== 'object') return out;
    if (typeof compact.s === 'string') out.search = compact.s;
    if (typeof compact.f === 'string') out.fieldFilter = compact.f;
    if (typeof compact.b === 'string') out.bandFilter = compact.b;
    if (typeof compact.m === 'string') out.modeFilter = compact.m;
    if (typeof compact.o === 'string') out.opFilter = compact.o;
    if (Number.isFinite(Number(compact.l))) out.callLenFilter = Number(compact.l);
    if (typeof compact.t === 'string') out.callStructFilter = compact.t;
    if (typeof compact.c === 'string') out.countryFilter = compact.c;
    if (typeof compact.k === 'string') out.continentFilter = compact.k;
    if (typeof compact.q === 'string') out.cqFilter = compact.q;
    if (typeof compact.i === 'string') out.ituFilter = compact.i;
    if (compact.v && typeof compact.v === 'object') {
      out.operatingStyleFilter = {
        band: typeof compact.v.b === 'string' ? compact.v.b : '',
        role: typeof compact.v.r === 'string' ? compact.v.r : ''
      };
    }
    out.rangeFilter = inflateRangeObject(compact.r, 'start', 'end');
    if (out.rangeFilter && compact.rd === 1) out.rangeFilter.excludeDupes = true;
    out.timeRange = inflateRangeObject(compact.y, 'startTs', 'endTs');
    out.headingRange = inflateRangeObject(compact.h, 'start', 'end');
    out.stationQsoRange = inflateRangeObject(compact.u, 'min', 'max');
    out.distanceRange = inflateRangeObject(compact.d, 'start', 'end');
    return out;
  }

  function compactSpotSettingsData(settings, includeDays = false) {
    if (!settings || typeof settings !== 'object') return null;
    const compact = {};
    const minutes = Number(settings.windowMinutes) || 15;
    if (minutes !== 15) compact.w = minutes;
    if (Array.isArray(settings.bandFilter) && settings.bandFilter.length) {
      compact.b = settings.bandFilter.slice();
    }
    if (includeDays && Array.isArray(settings.selectedDays) && settings.selectedDays.length) {
      compact.d = settings.selectedDays.slice();
    }
    return Object.keys(compact).length ? compact : null;
  }

  function inflateSpotSettingsData(compact, includeDays = false) {
    const out = includeDays
      ? { windowMinutes: 15, bandFilter: [], selectedDays: [] }
      : { windowMinutes: 15, bandFilter: [] };
    if (!compact || typeof compact !== 'object') return out;
    const minutes = Number(compact.w);
    if (Number.isFinite(minutes) && minutes > 0) out.windowMinutes = minutes;
    if (Array.isArray(compact.b)) out.bandFilter = compact.b.slice();
    if (includeDays && Array.isArray(compact.d)) out.selectedDays = compact.d.slice();
    return out;
  }

  function compactSlots(slots, includeRaw) {
    if (!Array.isArray(slots)) return [];
    const out = [];
    slots.forEach((slot) => {
      const id = String(slot?.id || '').toUpperCase();
      if (!slotIds.includes(id)) return;
      if (slot.empty) {
        if (slot.skipped) out.push({ i: id, k: 1 });
        return;
      }
      const item = { i: id };
      const name = slot.file?.name || '';
      if (name) item.n = name;
      const size = Number(slot.file?.size);
      if (Number.isFinite(size) && size > 0) item.z = size;
      const source = slot.file?.source || '';
      if (source) item.o = source;
      if (slot.archivePath) item.p = slot.archivePath;
      if (slot.scoringRuleOverride) item.q = slot.scoringRuleOverride;
      if (slot.sourceType === 'local') item.t = 'l';
      else if (slot.archivePath || slot.sourceType === 'archive') item.t = 'a';
      const spots = compactSpotSettingsData(slot.spots, false);
      if (spots) item.s = spots;
      const rbn = compactSpotSettingsData(slot.rbn, true);
      if (rbn) item.r = rbn;
      if (includeRaw && typeof slot.rawText === 'string' && slot.rawText) item.x = slot.rawText;
      out.push(item);
    });
    return out;
  }

  function inflateCompactSlots(items) {
    const byId = new Map();
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const id = String(item?.i || '').toUpperCase();
        if (!slotIds.includes(id)) return;
        if (item.k) {
          byId.set(id, { id, empty: true, skipped: true });
          return;
        }
        const sourceType = (item.t === 'a' || item.p) ? 'archive' : 'local';
        const size = Number(item.z);
        const path = typeof item.p === 'string' ? item.p : '';
        const defaultName = path ? (path.split('/').pop() || `${id}.log`) : `${id}.log`;
        const file = {
          name: typeof item.n === 'string' && item.n ? item.n : defaultName,
          size: Number.isFinite(size) ? size : 0,
          source: typeof item.o === 'string' ? item.o : (sourceType === 'archive' ? 'Archive' : 'Local')
        };
        const slot = {
          id,
          empty: false,
          skipped: false,
          file,
          sourceType,
          archivePath: path,
          scoringRuleOverride: typeof item.q === 'string' ? item.q : '',
          spots: inflateSpotSettingsData(item.s, false),
          rbn: inflateSpotSettingsData(item.r, true)
        };
        if (typeof item.x === 'string' && item.x) slot.rawText = item.x;
        byId.set(id, slot);
      });
    }
    return slotIds.map((id) => byId.get(id) || { id, empty: true, skipped: false });
  }

  function buildCompactSessionPayload(payload, includeRaw = false) {
    const compact = { v: 2 };
    if (payload.analysisMode === analysisModeDxer) compact.am = payload.analysisMode;
    const compareCount = Number(payload.compareCount);
    if (Number.isFinite(compareCount) && compareCount !== 1) compact.c = compareCount;
    if (payload.compareScoreMode && payload.compareScoreMode !== compareScoreModeComputed) compact.cs = payload.compareScoreMode;
    if (payload.compareSyncEnabled === false) compact.sy = 0;
    if (payload.compareStickyEnabled === false) compact.sk = 0;
    const compareTimeRangeLock = compactRangeObject(payload.compareTimeRangeLock, 'startTs', 'endTs');
    if (compareTimeRangeLock) compact.tr = compareTimeRangeLock;
    const focus = compactCompareFocus(payload.compareFocus);
    if (focus) compact.f = focus;
    if (payload.globalBandFilter) compact.g = payload.globalBandFilter;
    const breakThreshold = Number(payload.breakThreshold);
    if (Number.isFinite(breakThreshold) && breakThreshold !== 15) compact.b = breakThreshold;
    const passedQsoWindow = Number(payload.passedQsoWindow);
    if (Number.isFinite(passedQsoWindow) && passedQsoWindow !== 10) compact.p = passedQsoWindow;
    const logPageSize = Number(payload.logPageSize);
    if (Number.isFinite(logPageSize) && logPageSize !== 1000) compact.z = logPageSize;
    const logPage = Number(payload.logPage);
    if (Number.isFinite(logPage) && logPage !== 0) compact.n = logPage;
    const compareStart = Number(payload.compareLogWindowStart);
    if (Number.isFinite(compareStart) && compareStart !== 0) compact.w = compareStart;
    const compareSize = Number(payload.compareLogWindowSize);
    if (Number.isFinite(compareSize) && compareSize !== 1000) compact.x = compareSize;
    const wpxColumnMode = typeof normalizeWpxColumnMode === 'function'
      ? normalizeWpxColumnMode(payload.wpxColumnMode)
      : payload.wpxColumnMode;
    const defaultWpxColumnMode = typeof normalizeWpxColumnMode === 'function'
      ? normalizeWpxColumnMode('')
      : '';
    if (wpxColumnMode && wpxColumnMode !== defaultWpxColumnMode) compact.wp = wpxColumnMode;
    if (Array.isArray(payload.globalYearsFilter) && payload.globalYearsFilter.length) {
      compact[periodFilterCompactYears] = normalizePeriodYears(payload.globalYearsFilter);
    }
    if (Array.isArray(payload.globalMonthsFilter) && payload.globalMonthsFilter.length) {
      compact[periodFilterCompactMonths] = normalizePeriodMonths(payload.globalMonthsFilter);
    }
    const filters = compactLogFilters(payload.logFilters);
    if (filters) compact.l = filters;
    const slots = compactSlots(payload.slots, includeRaw);
    if (slots.length) compact.s = slots;
    return compact;
  }

  function inflateCompactSessionPayload(compact) {
    if (!compact || typeof compact !== 'object' || Number(compact.v) !== 2) return null;
    const analysisMode = normalizeAnalysisMode(compact.am);
    const compareCount = Math.min(4, Math.max(1, Number(compact.c) || 1));
    const compareScoreMode = normalizeCompareScoreMode(compact.cs);
    const compareSyncEnabled = compact.sy !== 0;
    const compareStickyEnabled = compact.sk !== 0;
    const compareTimeRangeLock = inflateRangeObject(compact.tr, 'startTs', 'endTs');
    const breakThreshold = Number(compact.b);
    const passedQsoWindow = Number(compact.p);
    const logPageSize = Number(compact.z);
    const logPage = Number(compact.n);
    const compareStart = Number(compact.w);
    const hasCompareSize = Object.prototype.hasOwnProperty.call(compact, 'x');
    const compareSize = hasCompareSize ? Number(compact.x) : historicalCompareLogWindowSize;
    return {
      version: sessionVersion,
      createdAt: Date.now(),
      appVersion,
      analysisMode,
      compareCount,
      compareScoreMode,
      compareSyncEnabled,
      compareStickyEnabled,
      compareTimeRangeLock,
      compareFocus: inflateCompareFocus(compact.f),
      globalBandFilter: typeof compact.g === 'string' ? compact.g : '',
      globalYearsFilter: normalizePeriodYears(compact[periodFilterCompactYears]),
      globalMonthsFilter: normalizePeriodMonths(compact[periodFilterCompactMonths]),
      breakThreshold: Number.isFinite(breakThreshold) ? breakThreshold : 15,
      passedQsoWindow: Number.isFinite(passedQsoWindow) ? passedQsoWindow : 10,
      logPageSize: Number.isFinite(logPageSize) ? logPageSize : 1000,
      logPage: Number.isFinite(logPage) ? logPage : 0,
      compareLogWindowStart: Number.isFinite(compareStart) ? compareStart : 0,
      compareLogWindowSize: Number.isFinite(compareSize) && compareSize > 0
        ? compareSize
        : historicalCompareLogWindowSize,
      wpxColumnMode: typeof normalizeWpxColumnMode === 'function'
        ? normalizeWpxColumnMode(compact.wp)
        : compact.wp,
      logFilters: inflateCompactLogFilters(compact.l),
      slots: inflateCompactSlots(compact.s)
    };
  }

  function encodePermalinkState(payload) {
    const legacyEncoded = base64UrlEncode(JSON.stringify(payload));
    try {
      const compactPayload = buildCompactSessionPayload(payload, false);
      const compactEncoded = `${permalinkCompactPrefix}${base64UrlEncode(JSON.stringify(compactPayload))}`;
      if (compactEncoded.length < legacyEncoded.length) return compactEncoded;
    } catch (err) {
      /* fall back to legacy encoding */
    }
    return legacyEncoded;
  }

  function buildPermalink() {
    const payload = buildSessionPayload(false);
    const encoded = encodePermalinkState(payload);
    const url = new URL(permalinkBaseUrl);
    url.searchParams.set('state', encoded);
    url.hash = '';
    return url.toString();
  }

  function parsePermalinkState(search) {
    const params = new URLSearchParams(search || '');
    const encoded = params.get('state');
    if (!encoded) return null;
    try {
      if (encoded.startsWith(permalinkCompactPrefix)) {
        const json = base64UrlDecode(encoded.slice(permalinkCompactPrefix.length));
        const compact = JSON.parse(json);
        const inflated = inflateCompactSessionPayload(compact);
        if (inflated) return inflated;
      }
      const json = base64UrlDecode(encoded);
      return JSON.parse(json);
    } catch (err) {
      return null;
    }
  }

  return {
    buildCompactSessionPayload,
    buildPermalink,
    buildSessionPayload,
    createDefaultLogFilters,
    encodePermalinkState,
    inflateCompactSessionPayload,
    parsePermalinkState,
    serializeRbnSettings,
    serializeSpotSettings
  };
}
