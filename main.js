(() => {
  const BASE_REPORTS = [
    { id: 'load_logs', title: 'Start' },
    { id: 'main', title: 'Main' },
    { id: 'competitor_coach', title: 'Competitor coach' },
    { id: 'summary', title: 'Summary' },
    { id: 'log', title: 'Log' },
    { id: 'operators', title: 'Operators' },
    { id: 'all_callsigns', title: 'All callsigns' },
    { id: 'rates', title: 'Rates' },
    { id: 'countries', title: 'Countries' },
    { id: 'countries_by_time', title: 'Countries by time' },
    { id: 'qs_per_station', title: 'Qs per station' },
    { id: 'passed_qsos', title: 'Passed QSOs' },
    { id: 'dupes', title: 'Dupes' },
    { id: 'qs_by_hour_sheet', title: 'Qs by hour sheet' },
    { id: 'graphs_qs_by_hour', title: 'Qs by hour' },
    { id: 'points_by_hour_sheet', title: 'Points by hour sheet' },
    { id: 'graphs_points_by_hour', title: 'Points by hour' },
    { id: 'qs_by_minute', title: 'Qs by minute' },
    { id: 'points_by_minute', title: 'Points by minute' },
    { id: 'one_minute_rates', title: 'One minute rates' },
    { id: 'one_minute_point_rates', title: 'One minute point rates' },
    { id: 'prefixes', title: 'Prefixes' },
    { id: 'distance', title: 'Distance' },
    { id: 'beam_heading', title: 'Beam heading' },
    { id: 'breaks', title: 'Break time' },
    { id: 'continents', title: 'Continents' },
    { id: 'kmz_files', title: 'KMZ files' },
    { id: 'fields_map', title: 'Fields map' },
    { id: 'callsign_length', title: 'Callsign length' },
    { id: 'callsign_structure', title: 'Callsign structure' },
    { id: 'zones_cq', title: 'CQ zones' },
    { id: 'zones_itu', title: 'ITU zones' },
    { id: 'not_in_master', title: 'Not in master' },
    { id: 'possible_errors', title: 'Possible errors' },
    { id: 'charts_top_10_countries', title: 'Top 10 countries' },
    { id: 'charts_qs_by_band', title: 'Qs by band' },
    { id: 'charts_continents', title: 'Continents' },
    { id: 'charts_frequencies', title: 'Frequencies' },
    { id: 'charts_beam_heading', title: 'Beam heading' },
    { id: 'charts_beam_heading_by_hour', title: 'Beam heading by hour' },
    { id: 'comments', title: 'Comments' },
    { id: 'spots', title: 'Spots' },
    { id: 'rbn_spots', title: 'RBN spots' },
    { id: 'rbn_compare_signal', title: 'RBN compare signal' },
    { id: 'export', title: 'EXPORT PDF, HTML, CBR' },
    { id: 'session', title: 'Save&Load session' },
    { id: 'qsl_labels', title: 'QSL labels' },
    { id: 'spot_hunter', title: 'Spot hunter' },
    { id: 'sh6_info', title: 'SH6 info' }
  ];

  const NAV_SECTIONS = [
    { id: 'load_core', title: 'Load & Core', openByDefault: true },
    { id: 'rate_time', title: 'Rates & Time', openByDefault: true },
    { id: 'geo_analysis', title: 'Geography', openByDefault: true },
    { id: 'quality_review', title: 'Quality & Review', openByDefault: false },
    { id: 'maps_charts', title: 'Maps & Charts', openByDefault: false },
    { id: 'spots_coach', title: 'Spots & Coach', openByDefault: true },
    { id: 'export_tools', title: 'Export & Tools', openByDefault: false }
  ];

  const NAV_SECTION_BY_REPORT = Object.freeze({
    load_logs: 'load_core',
    main: 'load_core',
    summary: 'load_core',
    log: 'load_core',
    raw_log: 'load_core',
    operators: 'load_core',

    rates: 'rate_time',
    points_rates: 'rate_time',
    qs_by_hour_sheet: 'rate_time',
    graphs_qs_by_hour: 'rate_time',
    points_by_hour_sheet: 'rate_time',
    graphs_points_by_hour: 'rate_time',
    qs_by_minute: 'rate_time',
    points_by_minute: 'rate_time',
    one_minute_rates: 'rate_time',
    one_minute_point_rates: 'rate_time',
    breaks: 'rate_time',

    countries: 'geo_analysis',
    countries_by_time: 'geo_analysis',
    continents: 'geo_analysis',
    zones_cq: 'geo_analysis',
    zones_itu: 'geo_analysis',
    prefixes: 'geo_analysis',
    distance: 'geo_analysis',
    beam_heading: 'geo_analysis',
    kmz_files: 'geo_analysis',
    fields_map: 'geo_analysis',

    all_callsigns: 'quality_review',
    qs_per_station: 'quality_review',
    passed_qsos: 'quality_review',
    dupes: 'quality_review',
    callsign_length: 'quality_review',
    callsign_structure: 'quality_review',
    not_in_master: 'quality_review',
    possible_errors: 'quality_review',
    comments: 'quality_review',

    charts_top_10_countries: 'maps_charts',
    charts_qs_by_band: 'maps_charts',
    charts_continents: 'maps_charts',
    charts_frequencies: 'maps_charts',
    charts_beam_heading: 'maps_charts',
    charts_beam_heading_by_hour: 'maps_charts',

    competitor_coach: 'spots_coach',
    spots: 'spots_coach',
    rbn_spots: 'spots_coach',
    rbn_compare_signal: 'spots_coach',
    spot_hunter: 'spots_coach',

    export: 'export_tools',
    session: 'export_tools',
    qsl_labels: 'export_tools',
    sh6_info: 'export_tools'
  });

  let reports = [];

  const APP_VERSION = 'v5.1.19';
  const UI_THEME_STORAGE_KEY = 'sh6_ui_theme';
  const UI_THEME_CLASSIC = 'classic';
  const UI_THEME_NT = 'nt';
  const CHART_MODE_ABSOLUTE = 'absolute';
  const CHART_MODE_NORMALIZED = 'normalized';
  const SQLJS_BASE_URLS = [
    'https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/',
    'https://unpkg.com/sql.js@1.8.0/dist/'
  ];
  const ARCHIVE_BASE_URL = 'https://raw.githubusercontent.com/s53zo/Hamradio-Contest-logs-Archives/main';
  const ARCHIVE_SHARD_BASE = 'https://cdn.jsdelivr.net/gh/s53zo/Hamradio-Contest-logs-Archives@main/SH6';
  const ARCHIVE_SHARD_BASE_RAW = 'https://raw.githubusercontent.com/s53zo/Hamradio-Contest-logs-Archives/main/SH6';
  const ARCHIVE_SH6_BASE = `${ARCHIVE_BASE_URL}/SH6`;
  const ARCHIVE_BRANCHES = ['main', 'master'];
  const SCORING_SPEC_URLS = [
    'https://cdn.jsdelivr.net/gh/s53zo/SH6@contest-rules/data/contest_scoring_spec.json',
    'https://raw.githubusercontent.com/s53zo/SH6/contest-rules/data/contest_scoring_spec.json',
    'https://cdn.jsdelivr.net/gh/s53zo/SH6@main/data/contest_scoring_spec.json',
    'https://raw.githubusercontent.com/s53zo/SH6/main/data/contest_scoring_spec.json',
    'data/contest_scoring_spec.json',
    './data/contest_scoring_spec.json'
  ];
  const SCORING_UNKNOWN_WARNING = 'Rules for this contest are unknown. Showing logged points only if available.';
  const SPOTS_BASE_URL = 'https://azure.s53m.com/spots';
  const RBN_PROXY_URL = 'https://azure.s53m.com/cors/rbn';
  const CQ_API_PROXY_BASE = 'https://azure.s53m.com/cors/cqapi';
  const CQ_API_SCRIPT_URL = 'cq-api-enrichment.js';
  const COMPETITOR_COACH_SCRIPT_URL = 'competitor-coach.js';
  const CQ_API_SUPPORTED_CONTESTS = new Set(['CQWW', 'CQWPX', 'CQWWRTTY', 'CQWPXRTTY', 'CQ160']);
  const CQ_API_PROXY_KEYS = Object.freeze({
    CQWW: 'cqww',
    CQWPX: 'cqwpx',
    CQWWRTTY: 'cqwwrtty',
    CQWPXRTTY: 'cqwpxrtty',
    CQ160: 'cq160'
  });
  const CALLSIGN_LOOKUP_URLS = [
    'https://azure.s53m.com/sh6/lookup'
  ];
  const CALLSIGN_LOOKUP_BATCH = 180;
  const CALLSIGN_LOOKUP_MAX_BATCH_BYTES = 1700;
  const CALLSIGN_LOOKUP_SPLIT_STATUSES = new Set([400, 404, 413, 414, 429, 431, 500, 502, 503, 504]);
  const CALLSIGN_LOOKUP_RETRYABLE_STATUSES = new Set([404, 408, 425, 429, 500, 502, 503, 504]);
  const CALLSIGN_LOOKUP_MAX_ATTEMPTS = 3;
  const CALLSIGN_LOOKUP_RETRY_DELAY_MS = 12000;
  const CALLSIGN_LOOKUP_MIN_GAP_MS = 280;
  const CALLSIGN_LOOKUP_TIMEOUT_MS = 8000;
  const RBN_SUMMARY_ONLY_THRESHOLD = 200000;
  const SPOT_TABLE_LIMIT = 2000;
  const QSL_LABEL_TOOL_URL = 'https://s53zo.github.io/ADIF-to-QSL-label/make_qsl_labels.html';
  const QRZ_URLS = ['https://azure.s53m.com/cors/qrz', 'https://www.qrz.com/db'];
  const QRZ_CACHE_TTL = 1000 * 60 * 60 * 24 * 7;
  const QRZ_MAX_CONCURRENCY = 3;
  const COMPARE_PROGRESS_THRESHOLD = 20000;
  const RECONSTRUCTED_NOTICE = 'THIS LOG IS RECONSTRUCTED. For contests where not all stations submitted logs, the repo can generate reconstructed mock logs. These are built by inferring QSOs for missing stations from logs that were submitted. They are not official submissions and are not complete logs.';
  const DEMO_ARCHIVE_PATH = 'CQWW/cw/2025/tk0c.log';
  const DEMO_ARCHIVE_LABEL = 'TK0C CQWW CW 2025';
  const CORS_PROXIES = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
  ];
  const CTY_URLS = [
    'https://azure.s53m.com/cors/cty.dat',
    'https://www.country-files.com/cty/cty.dat',
    'cty.dat',
    './cty.dat',
    '/cty.dat',
    'CTY.DAT',
    './CTY.DAT',
    '/CTY.DAT'
  ];
  const MASTER_URLS = [
    'https://azure.s53m.com/cors/MASTER.DTA',
    'https://www.supercheckpartial.com/MASTER.DTA',
    'MASTER.DTA',
    './MASTER.DTA',
    '/MASTER.DTA'
  ];
  const LOG_EXTENSIONS = new Set(['adi', 'adif', 'cbf', 'cbr', 'log']);
  const LOG_EXTENSIONS_LABEL = '.adi, .adif, .cbf, .cbr, .log';
  const COMPARE_SLOT_IDS = ['B', 'C', 'D'];
  const COMPARE_SLOT_LABELS = {
    A: 'Log A',
    B: 'Log B',
    C: 'Log C',
    D: 'Log D'
  };
  const COMPARE_SLOT_COLORS = {
    A: '#1e5bd6',
    B: '#c62828',
    C: '#2e7d32',
    D: '#6a1b9a'
  };
  const SINGLE_INSTANCE_REPORT_IDS = new Set([
    'load_logs',
    'export',
    'session',
    'charts',
    'qsl_labels',
    'competitor_coach',
    'rbn_compare_signal'
  ]);
  const SESSION_VERSION = 1;
  const PERMALINK_COMPACT_PREFIX = 'v2.';
  const DEFAULT_COMPARE_FOCUS = Object.freeze({
    countries_by_time: ['A', 'B'],
    qs_by_minute: ['A', 'B'],
    one_minute_rates: ['A', 'B'],
    points_by_minute: ['A', 'B'],
    one_minute_point_rates: ['A', 'B']
  });

  function cloneCompareFocus(source = DEFAULT_COMPARE_FOCUS) {
    return {
      countries_by_time: Array.isArray(source.countries_by_time) ? source.countries_by_time.slice() : ['A', 'B'],
      qs_by_minute: Array.isArray(source.qs_by_minute) ? source.qs_by_minute.slice() : ['A', 'B'],
      one_minute_rates: Array.isArray(source.one_minute_rates) ? source.one_minute_rates.slice() : ['A', 'B'],
      points_by_minute: Array.isArray(source.points_by_minute) ? source.points_by_minute.slice() : ['A', 'B'],
      one_minute_point_rates: Array.isArray(source.one_minute_point_rates) ? source.one_minute_point_rates.slice() : ['A', 'B']
    };
  }

  function createSpotsState(source = 'spots') {
    return {
      source,
      status: 'idle',
      error: null,
      errors: [],
      stats: null,
      lastWindowKey: null,
      lastCall: null,
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

  function createRbnState() {
    return createSpotsState('rbn');
  }

  function createApiEnrichmentState() {
    return {
      status: 'idle',
      error: null,
      source: null,
      helperActive: false,
      data: null,
      requestKey: null
    };
  }

  function createCompetitorCoachState(seed = {}) {
    const scopeType = String(seed.scopeType || 'continent').trim().toLowerCase();
    const seedSlotRows = seed.loadedSlotRows && typeof seed.loadedSlotRows === 'object' ? seed.loadedSlotRows : {};
    const loadedSlotRows = COMPARE_SLOT_IDS.reduce((acc, slotId) => {
      acc[slotId] = String(seedSlotRows[slotId] || '').trim();
      return acc;
    }, {});
    const lastLoadedSlot = String(seed.lastLoadedSlot || '').trim().toUpperCase();
    return {
      status: 'idle',
      error: null,
      source: null,
      statusMessage: '',
      requestKey: null,
      scopeType: ['dxcc', 'continent', 'cq_zone', 'itu_zone'].includes(scopeType) ? scopeType : 'continent',
      categoryMode: String(seed.categoryMode || 'same').toLowerCase() === 'all' ? 'all' : 'same',
      targetScopeValue: '',
      targetCategory: '',
      scopeLabel: '',
      rows: [],
      totalRows: 0,
      sourceRows: 0,
      currentRow: null,
      closestRivals: [],
      gapDriver: null,
      insights: [],
      contestId: '',
      mode: '',
      year: null,
      loadedSlotRows,
      lastLoadedSlot: COMPARE_SLOT_IDS.includes(lastLoadedSlot) ? lastLoadedSlot : '',
      lastLoadedRowKey: String(seed.lastLoadedRowKey || '').trim()
    };
  }

  function createEmptyCompareSlot() {
    return {
      logFile: null,
      skipped: false,
      qsoData: null,
      qsoLite: null,
      rawLogText: '',
      derived: null,
      logPage: 0,
      logPageSize: 1000,
      fullQsoData: null,
      fullDerived: null,
      bandDerivedCache: new Map(),
      logVersion: 0,
      spotsState: createSpotsState(),
      rbnState: createRbnState(),
      apiEnrichment: createApiEnrichmentState()
    };
  }

  function resetMainSlot() {
    state.logFile = null;
    state.skipped = false;
    state.qsoData = null;
    state.qsoLite = null;
    state.rawLogText = '';
    state.derived = null;
    state.logPage = 0;
    state.allCallsignsCountryFilter = '';
    state.fullQsoData = null;
    state.fullDerived = null;
    state.bandDerivedCache = new Map();
    state.logVersion = (state.logVersion || 0) + 1;
    state.spotsState = createSpotsState();
    state.rbnState = createRbnState();
    state.apiEnrichment = createApiEnrichmentState();
    state.competitorCoach = createCompetitorCoachState(state.competitorCoach);
  }

  function resetCompareSlot(slotId) {
    const idx = COMPARE_SLOT_IDS.indexOf(String(slotId || '').toUpperCase());
    if (idx < 0) return;
    state.compareSlots[idx] = createEmptyCompareSlot();
  }

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
    const slotIds = ['A', 'B', 'C', 'D'];
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
        spots: serializeSpotSettings(slot.spotsState),
        rbn: serializeRbnSettings(slot.rbnState)
      };
      if (includeRaw) {
        data.rawText = slot.rawLogText || '';
      }
      return data;
    });
    return {
      version: SESSION_VERSION,
      createdAt: Date.now(),
      appVersion: APP_VERSION,
      compareCount: state.compareCount,
      compareFocus: state.compareFocus,
      globalBandFilter: state.globalBandFilter || '',
      breakThreshold: state.breakThreshold,
      passedQsoWindow: state.passedQsoWindow,
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
      if (!['A', 'B', 'C', 'D'].includes(id)) return;
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
    const current = cloneCompareFocus(focus || {});
    const compact = {};
    const mapping = [
      ['countries_by_time', 'c'],
      ['qs_by_minute', 'm'],
      ['one_minute_rates', 'o'],
      ['points_by_minute', 'p'],
      ['one_minute_point_rates', 'q']
    ];
    mapping.forEach(([key, shortKey]) => {
      const now = normalizeCompactSlotList(current[key]);
      const def = normalizeCompactSlotList(DEFAULT_COMPARE_FOCUS[key]);
      if (!sameStringList(now, def)) compact[shortKey] = now;
    });
    return Object.keys(compact).length ? compact : null;
  }

  function inflateCompareFocus(compact) {
    const out = cloneCompareFocus();
    if (!compact || typeof compact !== 'object') return out;
    const mapping = {
      c: 'countries_by_time',
      m: 'qs_by_minute',
      o: 'one_minute_rates',
      p: 'points_by_minute',
      q: 'one_minute_point_rates'
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
    const qsoRange = compactRangeObject(f.rangeFilter, 'start', 'end');
    if (qsoRange) compact.r = qsoRange;
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
    out.rangeFilter = inflateRangeObject(compact.r, 'start', 'end');
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
      if (!['A', 'B', 'C', 'D'].includes(id)) return;
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
        if (!['A', 'B', 'C', 'D'].includes(id)) return;
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
          spots: inflateSpotSettingsData(item.s, false),
          rbn: inflateSpotSettingsData(item.r, true)
        };
        if (typeof item.x === 'string' && item.x) slot.rawText = item.x;
        byId.set(id, slot);
      });
    }
    return ['A', 'B', 'C', 'D'].map((id) => byId.get(id) || { id, empty: true, skipped: false });
  }

  function buildCompactSessionPayload(payload, includeRaw = false) {
    const compact = { v: 2 };
    const compareCount = Number(payload.compareCount);
    if (Number.isFinite(compareCount) && compareCount !== 1) compact.c = compareCount;
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
    const filters = compactLogFilters(payload.logFilters);
    if (filters) compact.l = filters;
    const slots = compactSlots(payload.slots, includeRaw);
    if (slots.length) compact.s = slots;
    return compact;
  }

  function inflateCompactSessionPayload(compact) {
    if (!compact || typeof compact !== 'object' || Number(compact.v) !== 2) return null;
    const compareCount = Math.min(4, Math.max(1, Number(compact.c) || 1));
    const breakThreshold = Number(compact.b);
    const passedQsoWindow = Number(compact.p);
    const logPageSize = Number(compact.z);
    const logPage = Number(compact.n);
    const compareStart = Number(compact.w);
    const compareSize = Number(compact.x);
    return {
      version: SESSION_VERSION,
      createdAt: Date.now(),
      appVersion: APP_VERSION,
      compareCount,
      compareFocus: inflateCompareFocus(compact.f),
      globalBandFilter: typeof compact.g === 'string' ? compact.g : '',
      breakThreshold: Number.isFinite(breakThreshold) ? breakThreshold : 15,
      passedQsoWindow: Number.isFinite(passedQsoWindow) ? passedQsoWindow : 10,
      logPageSize: Number.isFinite(logPageSize) ? logPageSize : 1000,
      logPage: Number.isFinite(logPage) ? logPage : 0,
      compareLogWindowStart: Number.isFinite(compareStart) ? compareStart : 0,
      compareLogWindowSize: Number.isFinite(compareSize) ? compareSize : 1000,
      logFilters: inflateCompactLogFilters(compact.l),
      slots: inflateCompactSlots(compact.s)
    };
  }

  function encodePermalinkState(payload) {
    const legacyEncoded = base64UrlEncode(JSON.stringify(payload));
    try {
      const compactPayload = buildCompactSessionPayload(payload, false);
      const compactEncoded = `${PERMALINK_COMPACT_PREFIX}${base64UrlEncode(JSON.stringify(compactPayload))}`;
      if (compactEncoded.length < legacyEncoded.length) return compactEncoded;
    } catch (err) {
      /* fall back to legacy encoding */
    }
    return legacyEncoded;
  }

  function applySpotSettings(slot, data) {
    if (!slot) return;
    if (data?.spots) {
      const spotsState = getSpotStateBySource(slot, 'spots');
      spotsState.windowMinutes = Number(data.spots.windowMinutes) || 15;
      spotsState.bandFilter = Array.isArray(data.spots.bandFilter) ? data.spots.bandFilter.slice() : [];
    }
    if (data?.rbn) {
      const rbnState = getSpotStateBySource(slot, 'rbn');
      rbnState.windowMinutes = Number(data.rbn.windowMinutes) || 15;
      rbnState.bandFilter = Array.isArray(data.rbn.bandFilter) ? data.rbn.bandFilter.slice() : [];
      rbnState.selectedDays = Array.isArray(data.rbn.selectedDays) ? data.rbn.selectedDays.slice() : [];
    }
  }

  function applySessionFilters(filters) {
    const f = filters || {};
    state.logSearch = f.search || '';
    state.logFieldFilter = f.fieldFilter || '';
    state.logBandFilter = f.bandFilter || '';
    state.logModeFilter = f.modeFilter || '';
    state.logOpFilter = f.opFilter || '';
    state.logCallLenFilter = Number.isFinite(f.callLenFilter) ? f.callLenFilter : null;
    state.logCallStructFilter = f.callStructFilter || '';
    state.logCountryFilter = f.countryFilter || '';
    state.logContinentFilter = f.continentFilter || '';
    state.logCqFilter = f.cqFilter || '';
    state.logItuFilter = f.ituFilter || '';
    state.logRange = f.rangeFilter || null;
    state.logTimeRange = f.timeRange || null;
    state.logHeadingRange = f.headingRange || null;
    state.logStationQsoRange = f.stationQsoRange || null;
    state.logDistanceRange = f.distanceRange || null;
  }

  function migrateSessionPayload(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const payload = { ...raw };
    const version = Number.isFinite(payload.version) ? payload.version : 0;
    if (version <= 0) {
      if (!payload.slots && payload.compareSlots) {
        payload.slots = payload.compareSlots;
      }
      if (payload.filters && !payload.logFilters) {
        payload.logFilters = payload.filters;
      }
      payload.version = 1;
    }
    return payload;
  }

  async function applySessionPayload(payload, options = {}) {
    const migrated = migrateSessionPayload(payload);
    if (!migrated || typeof migrated !== 'object') return;
    state.sessionNotice = [];
    state.allCallsignsCountryFilter = '';
    const compareCount = Math.min(4, Math.max(1, Number(migrated.compareCount) || 1));
    setCompareCount(compareCount, true);
    state.compareFocus = migrated.compareFocus || state.compareFocus;
    state.globalBandFilter = migrated.globalBandFilter || '';
    state.breakThreshold = Number(migrated.breakThreshold) || state.breakThreshold;
    state.passedQsoWindow = Number(migrated.passedQsoWindow) || state.passedQsoWindow;
    if (Number.isFinite(migrated.logPageSize)) state.logPageSize = migrated.logPageSize;
    if (Number.isFinite(migrated.logPage)) state.logPage = migrated.logPage;
    if (Number.isFinite(migrated.compareLogWindowStart)) state.compareLogWindowStart = migrated.compareLogWindowStart;
    if (Number.isFinite(migrated.compareLogWindowSize)) state.compareLogWindowSize = migrated.compareLogWindowSize;
    applySessionFilters(migrated.logFilters);
    const slotPayloads = Array.isArray(migrated.slots) ? migrated.slots : [];
    const payloadMap = new Map(slotPayloads.map((s) => [String(s.id || '').toUpperCase(), s]));
    for (const id of ['A', 'B', 'C', 'D']) {
      const data = payloadMap.get(id);
      if (!data || data.empty) {
        if (id === 'A') resetMainSlot();
        else resetCompareSlot(id);
        const slot = getSlotById(id);
        if (slot) slot.skipped = !!data?.skipped;
        updateSlotStatus(id);
        setArchiveCompact(id, false);
        continue;
      }
      if (options.fromPermalink && data.sourceType === 'local') {
        const label = data.file?.name ? ` (${data.file.name})` : '';
        state.sessionNotice.push(`Permalink needs local log upload for slot ${id}${label}.`);
        if (id === 'A') resetMainSlot();
        else resetCompareSlot(id);
        continue;
      }
      if (data.rawText) {
        applyLoadedLogToSlot(id, data.rawText, data.file?.name || `${id}.log`, data.file?.size || data.rawText.length, 'Session', null, data.archivePath || '');
        applySpotSettings(getSlotById(id), data);
        continue;
      }
      if (data.archivePath) {
        const result = await fetchArchiveLogText(data.archivePath);
        if (result && result.text) {
          const name = data.file?.name || data.archivePath.split('/').pop() || `${id}.log`;
          applyLoadedLogToSlot(id, result.text, name, result.text.length, 'Archive', null, data.archivePath);
          applySpotSettings(getSlotById(id), data);
        } else {
          state.sessionNotice.push(`Failed to load archive log for slot ${id}.`);
          if (id === 'A') resetMainSlot();
          else resetCompareSlot(id);
        }
      }
    }
    updateLoadSummary();
    invalidateCompareLogData();
    updateBandRibbon();
    rebuildReports();
    const logIndex = reports.findIndex((r) => r.id === 'log');
    if (logIndex >= 0) setActiveReport(logIndex);
  }

  function buildPermalink() {
    const payload = buildSessionPayload(false);
    const encoded = encodePermalinkState(payload);
    const url = new URL(window.location.href);
    url.searchParams.set('state', encoded);
    url.hash = '';
    return url.toString();
  }

  function buildMapPermalink(scope, key, full = false) {
    const url = new URL(buildPermalink());
    url.searchParams.set('view', 'map');
    if (scope) url.searchParams.set('mapScope', scope);
    if (key) url.searchParams.set('mapKey', key);
    if (full) url.searchParams.set('mapFull', '1');
    return url.toString();
  }

  function parsePermalinkState() {
    const params = new URLSearchParams(window.location.search || '');
    const encoded = params.get('state');
    if (!encoded) return null;
    try {
      if (encoded.startsWith(PERMALINK_COMPACT_PREFIX)) {
        const json = base64UrlDecode(encoded.slice(PERMALINK_COMPACT_PREFIX.length));
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

  function parseMapViewParams() {
    const params = new URLSearchParams(window.location.search || '');
    if (params.get('view') !== 'map') return null;
    return {
      scope: params.get('mapScope') || '',
      key: params.get('mapKey') || '',
      full: params.get('mapFull') === '1'
    };
  }

  let spotHunterModulePromise = null;
  let cqApiModulePromise = null;
  let competitorCoachModulePromise = null;
  function loadSpotHunterModule() {
    if (window.SpotHunterRender) return Promise.resolve();
    if (spotHunterModulePromise) return spotHunterModulePromise;
    spotHunterModulePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `spot_hunter.js?v=${encodeURIComponent(APP_VERSION)}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Spot hunter module failed to load.'));
      document.head.appendChild(script);
    });
    return spotHunterModulePromise;
  }

  function loadCqApiModule() {
    if (window.SH6CqApi && typeof window.SH6CqApi.createClient === 'function') return Promise.resolve();
    if (cqApiModulePromise) return cqApiModulePromise;
    cqApiModulePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${CQ_API_SCRIPT_URL}?v=${encodeURIComponent(APP_VERSION)}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('CQ API module failed to load.'));
      document.head.appendChild(script);
    });
    return cqApiModulePromise;
  }

  function loadCompetitorCoachModule() {
    if (window.SH6CompetitorCoach && typeof window.SH6CompetitorCoach.buildModel === 'function') return Promise.resolve();
    if (competitorCoachModulePromise) return competitorCoachModulePromise;
    competitorCoachModulePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${COMPETITOR_COACH_SCRIPT_URL}?v=${encodeURIComponent(APP_VERSION)}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Competitor coach module failed to load.'));
      document.head.appendChild(script);
    });
    return competitorCoachModulePromise;
  }

  function buildFetchUrls(urls) {
    const remotes = [];
    const locals = [];
    urls.forEach((url) => {
      if (/^https?:\/\//i.test(url)) remotes.push(url);
      else locals.push(url);
    });
    const proxies = [];
    remotes.forEach((url) => {
      CORS_PROXIES.forEach((proxy) => proxies.push(proxy(url)));
    });
    return remotes.concat(proxies, locals);
  }

  function getAppBasePath() {
    if (typeof window === 'undefined' || !window.location) return '/';
    const pathname = String(window.location.pathname || '/');
    if (pathname.endsWith('/')) return pathname;
    const lastSlash = pathname.lastIndexOf('/');
    const tail = lastSlash >= 0 ? pathname.slice(lastSlash + 1) : pathname;
    if (tail.includes('.')) return lastSlash >= 0 ? pathname.slice(0, lastSlash + 1) : '/';
    return `${pathname}/`;
  }

  function buildScoringSpecUrls() {
    const urls = [];
    const pushUrl = (url) => {
      if (!url || urls.includes(url)) return;
      urls.push(url);
    };
    const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
    const basePath = getAppBasePath();
    if (/^https?:\/\//i.test(origin)) {
      pushUrl(`${origin}${basePath}data/contest_scoring_spec.json`);
    }
    SCORING_SPEC_URLS.forEach(pushUrl);
    return urls;
  }

  const state = {
    activeIndex: 0,
    logFile: null,
    skipped: false,
    qsoData: null,
    qsoLite: null,
    rawLogText: '',
    ctyDat: null,
    masterDta: null,
    ctyTable: null,
    masterSet: null,
    prefixCache: new Map(),
    callsignGridCache: new Map(),
    derived: null,
    logPage: 0,
    logPageSize: 1000,
    notInMasterPage: 0,
    notInMasterPageSize: 500,
    logSearch: '',
    logFieldFilter: '',
    logBandFilter: '',
    logModeFilter: '',
    logOpFilter: '',
    logCallLenFilter: null,
    logCallStructFilter: '',
    logCountryFilter: '',
    logContinentFilter: '',
    logCqFilter: '',
    logItuFilter: '',
    allCallsignsCountryFilter: '',
    logRange: null,
    logTimeRange: null,
    logHeadingRange: null,
    logStationQsoRange: null,
    logDistanceRange: null,
    breakThreshold: 15,
    passedQsoWindow: 10,
    globalBandFilter: '',
    fullQsoData: null,
    fullDerived: null,
    bandDerivedCache: new Map(),
    leafletMap: null,
    mapContext: null,
    kmzUrls: {},
    ctyStatus: 'pending',
    masterStatus: 'pending',
    scoringStatus: 'pending',
    qthStatus: 'pending',
    cqApiStatus: 'pending',
    spotHunterStatus: 'pending',
    ctyError: null,
    masterError: null,
    scoringError: null,
    qthError: null,
    cqApiError: null,
    spotHunterError: null,
    ctySource: null,
    masterSource: null,
    scoringSource: null,
    scoringSpec: null,
    scoringRuleMap: new Map(),
    scoringRuleByFolder: new Map(),
    scoringAliasMap: new Map(),
    qthSource: CALLSIGN_LOOKUP_URLS[0],
    cqApiSource: CQ_API_PROXY_BASE,
    spotHunterSource: null,
    showLoadPanel: false,
    compareEnabled: false,
    compareCount: 1,
    compareSyncEnabled: true,
    compareStickyEnabled: true,
    chartMetricMode: CHART_MODE_ABSOLUTE,
    uiTheme: UI_THEME_NT,
    navSearch: '',
    compareFocus: cloneCompareFocus(),
    compareWorker: null,
    compareLogData: null,
    compareLogPendingKey: null,
    compareLogPendingSince: null,
    compareLogFallbackTimer: null,
    compareLogWindowStart: 0,
    compareLogWindowSize: 1000,
    renderPerf: {
      last: null,
      byReport: {}
    },
    sessionNotice: [],
    renderSlotId: null,
    logVersion: 0,
    cqApiClient: null,
    cqApiRequestToken: 0,
    apiEnrichment: createApiEnrichmentState(),
    competitorCoach: createCompetitorCoachState(),
    spotsState: null,
    rbnState: null,
    compareSlots: [createEmptyCompareSlot(), createEmptyCompareSlot(), createEmptyCompareSlot()]
  };

  const qrzPhotoInFlight = new Map();
  const callsignGridPending = new Set();
  let callsignGridTimer = null;
  let callsignGridInFlight = false;
  let callsignLookupLastRequestTs = 0;
  const archiveShardDbCache = new Map();
  const archiveRowsByCallCache = new Map();
  let archiveSqlLoader = null;
  let archiveSqlBaseUrl = null;
  let rbnCompareSignalResizeObserver = null;
  let rbnCompareSignalResizeRaf = 0;

  const base64UrlEncode = (value) => {
    const text = String(value == null ? '' : value);
    const encoded = btoa(unescape(encodeURIComponent(text)));
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  };

  const base64UrlDecode = (value) => {
    if (!value) return '';
    let text = String(value);
    text = text.replace(/-/g, '+').replace(/_/g, '/');
    while (text.length % 4) text += '=';
    return decodeURIComponent(escape(atob(text)));
  };

  function trackEvent(name, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params || {});
    }
  }

  const dom = {
    navList: document.getElementById('navList'),
    navSearchInput: document.getElementById('navSearchInput'),
    loadPanel: document.getElementById('loadPanel'),
    fileInput: document.getElementById('fileInput'),
    fileInputB: document.getElementById('fileInputB'),
    fileInputC: document.getElementById('fileInputC'),
    fileInputD: document.getElementById('fileInputD'),
    ctyInput: document.getElementById('ctyInput'),
    masterInput: document.getElementById('masterInput'),
    slotStatusA: document.getElementById('slotStatusA'),
    slotStatusB: document.getElementById('slotStatusB'),
    slotStatusC: document.getElementById('slotStatusC'),
    slotStatusD: document.getElementById('slotStatusD'),
    fileStatus: document.getElementById('fileStatus'),
    fileStatusB: document.getElementById('fileStatusB'),
    fileStatusC: document.getElementById('fileStatusC'),
    fileStatusD: document.getElementById('fileStatusD'),
    viewTitle: document.getElementById('viewTitle'),
    viewContainer: document.getElementById('viewContainer'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    ctyStatus: document.getElementById('ctyStatus'),
    ctySourceLabel: document.getElementById('ctySourceLabel'),
    masterStatus: document.getElementById('masterStatus'),
    masterSourceLabel: document.getElementById('masterSourceLabel'),
    qthStatus: document.getElementById('qthStatus'),
    qthStatusRow: document.getElementById('qthStatusRow'),
    qthSourceLabel: document.getElementById('qthSourceLabel'),
    cqApiStatus: document.getElementById('cqApiStatus'),
    cqApiStatusRow: document.getElementById('cqApiStatusRow'),
    cqApiSourceLabel: document.getElementById('cqApiSourceLabel'),
    spotsStatus: document.getElementById('spotsStatus'),
    spotsSourceLabel: document.getElementById('spotsSourceLabel'),
    spotsStatusRow: document.getElementById('spotsStatusRow'),
    rbnStatus: document.getElementById('rbnStatus'),
    rbnSourceLabel: document.getElementById('rbnSourceLabel'),
    rbnStatusRow: document.getElementById('rbnStatusRow'),
    spotHunterStatus: document.getElementById('spotHunterStatus'),
    spotHunterSourceLabel: document.getElementById('spotHunterSourceLabel'),
    spotHunterStatusRow: document.getElementById('spotHunterStatusRow'),
    compareHelper: document.getElementById('compareHelper'),
    appVersion: document.getElementById('appVersion'),
    bandRibbon: document.getElementById('bandRibbon'),
    loadSummary: document.getElementById('loadSummary'),
    loadSummaryItems: document.getElementById('loadSummaryItems'),
    loadSummaryHint: document.getElementById('loadSummaryHint'),
    viewReportsBtn: document.getElementById('viewReportsBtn'),
    repoSearch: document.getElementById('repoSearch'),
    repoStatus: document.getElementById('repoStatus'),
    repoResults: document.getElementById('repoResults'),
    repoFilters: document.getElementById('repoFilters'),
    repoCompact: document.getElementById('repoCompact'),
    repoCompactText: document.getElementById('repoCompactText'),
    repoControls: document.getElementById('repoControls'),
    repoSearchB: document.getElementById('repoSearchB'),
    repoStatusB: document.getElementById('repoStatusB'),
    repoResultsB: document.getElementById('repoResultsB'),
    repoFiltersB: document.getElementById('repoFiltersB'),
    repoCompactB: document.getElementById('repoCompactB'),
    repoCompactTextB: document.getElementById('repoCompactTextB'),
    repoControlsB: document.getElementById('repoControlsB'),
    repoSearchC: document.getElementById('repoSearchC'),
    repoStatusC: document.getElementById('repoStatusC'),
    repoResultsC: document.getElementById('repoResultsC'),
    repoFiltersC: document.getElementById('repoFiltersC'),
    repoCompactC: document.getElementById('repoCompactC'),
    repoCompactTextC: document.getElementById('repoCompactTextC'),
    repoControlsC: document.getElementById('repoControlsC'),
    repoSearchD: document.getElementById('repoSearchD'),
    repoStatusD: document.getElementById('repoStatusD'),
    repoResultsD: document.getElementById('repoResultsD'),
    repoFiltersD: document.getElementById('repoFiltersD'),
    repoCompactD: document.getElementById('repoCompactD'),
    repoCompactTextD: document.getElementById('repoCompactTextD'),
    repoControlsD: document.getElementById('repoControlsD'),
    compareModeRadios: document.querySelectorAll('input[name="compareCount"]'),
    uiThemeSwitch: document.getElementById('uiThemeSwitch'),
    uiThemeClassicBtn: document.getElementById('uiThemeClassicBtn'),
    uiThemeNtBtn: document.getElementById('uiThemeNtBtn'),
    dropReplace: document.getElementById('dropReplace'),
    dropReplaceActions: document.getElementById('dropReplaceActions'),
    dropReplaceCancel: document.getElementById('dropReplaceCancel'),
    dragOverlay: document.getElementById('dragOverlay')
  };

  function buildSlotSnapshot(source) {
    if (!source) return createEmptyCompareSlot();
    return {
      logFile: source.logFile,
      qsoData: source.qsoData,
      qsoLite: source.qsoLite,
      rawLogText: source.rawLogText,
      derived: source.derived,
      logPage: source.logPage,
      logPageSize: source.logPageSize,
      fullQsoData: source.fullQsoData,
      fullDerived: source.fullDerived,
      bandDerivedCache: source.bandDerivedCache,
      logVersion: source.logVersion,
      spotsState: source.spotsState,
      rbnState: source.rbnState,
      apiEnrichment: source.apiEnrichment
    };
  }

  function getSlotById(slotId) {
    if (!slotId || slotId === 'A') return state;
    const idx = COMPARE_SLOT_IDS.indexOf(String(slotId).toUpperCase());
    if (idx === -1) return null;
    return state.compareSlots[idx];
  }

  function getActiveCompareSlots() {
    const count = Math.min(4, Math.max(1, Number(state.compareCount) || 1));
    const ids = ['A', 'B', 'C', 'D'].slice(0, count);
    return ids.map((id) => {
      const slot = getSlotById(id);
      return {
        id,
        label: COMPARE_SLOT_LABELS[id] || `Log ${id}`,
        color: COMPARE_SLOT_COLORS[id] || '#333333',
        slot
      };
    });
  }

  function normalizeUiTheme(value) {
    const key = String(value || '').trim().toLowerCase();
    return key === UI_THEME_CLASSIC ? UI_THEME_CLASSIC : UI_THEME_NT;
  }

  function normalizeChartMetricMode(value) {
    const key = String(value || '').trim().toLowerCase();
    return key === CHART_MODE_NORMALIZED ? CHART_MODE_NORMALIZED : CHART_MODE_ABSOLUTE;
  }

  function getPreferredUiTheme() {
    try {
      const saved = localStorage.getItem(UI_THEME_STORAGE_KEY);
      return normalizeUiTheme(saved);
    } catch (err) {
      return UI_THEME_NT;
    }
  }

  function syncUiThemeButtons() {
    const active = normalizeUiTheme(state.uiTheme);
    [dom.uiThemeClassicBtn, dom.uiThemeNtBtn].forEach((btn) => {
      if (!btn) return;
      const selected = normalizeUiTheme(btn.dataset.theme) === active;
      btn.classList.toggle('active', selected);
      btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
      btn.tabIndex = selected ? 0 : -1;
    });
  }

  function applyUiTheme(nextTheme, persist = true) {
    const theme = normalizeUiTheme(nextTheme);
    state.uiTheme = theme;
    document.body.classList.toggle('ui-theme-classic', theme === UI_THEME_CLASSIC);
    document.body.classList.toggle('ui-theme-nt', theme === UI_THEME_NT);
    syncUiThemeButtons();
    if (persist) {
      try {
        localStorage.setItem(UI_THEME_STORAGE_KEY, theme);
      } catch (err) {
        // Ignore storage failures in restricted contexts.
      }
    }
  }

  function getLoadedCompareSlots() {
    return getActiveCompareSlots().filter((entry) => entry.slot && entry.slot.qsoData && !entry.slot.skipped);
  }

  function getSlotPanel(slotId) {
    const key = String(slotId || 'A').toUpperCase();
    return document.querySelector(`.log-panel[data-slot="${key}"]`);
  }

  function getStatusElBySlot(slotId) {
    const key = String(slotId || 'A').toUpperCase();
    if (key === 'B') return dom.fileStatusB;
    if (key === 'C') return dom.fileStatusC;
    if (key === 'D') return dom.fileStatusD;
    return dom.fileStatus;
  }

  function getSlotStatusElBySlot(slotId) {
    const key = String(slotId || 'A').toUpperCase();
    if (key === 'B') return dom.slotStatusB;
    if (key === 'C') return dom.slotStatusC;
    if (key === 'D') return dom.slotStatusD;
    return dom.slotStatusA;
  }

  function getRepoCompactBySlot(slotId) {
    const key = String(slotId || 'A').toUpperCase();
    if (key === 'B') return { compact: dom.repoCompactB, text: dom.repoCompactTextB, controls: dom.repoControlsB };
    if (key === 'C') return { compact: dom.repoCompactC, text: dom.repoCompactTextC, controls: dom.repoControlsC };
    if (key === 'D') return { compact: dom.repoCompactD, text: dom.repoCompactTextD, controls: dom.repoControlsD };
    return { compact: dom.repoCompact, text: dom.repoCompactText, controls: dom.repoControls };
  }

  function formatArchiveBreadcrumb(path) {
    if (!path) return '';
    return path.split('/').filter(Boolean).join(' / ');
  }

  function setArchiveCompact(slotId, show, pathLabel = '') {
    const { compact, text, controls } = getRepoCompactBySlot(slotId);
    if (!compact || !controls) return;
    compact.hidden = !show;
    controls.hidden = show;
    if (text) {
      text.textContent = pathLabel ? `Loaded from archive: ${pathLabel}` : 'Loaded from archive.';
    }
  }

  function updateSlotStatus(slotId) {
    const slot = getSlotById(slotId);
    const panel = getSlotPanel(slotId);
    const statusEl = getSlotStatusElBySlot(slotId);
    const isSkipped = !!slot?.skipped;
    const isLoaded = !!slot?.qsoData;
    const isEmpty = !isSkipped && !isLoaded;
    if (panel) {
      panel.classList.toggle('is-skipped', isSkipped);
      panel.classList.toggle('is-loaded', isLoaded);
      panel.classList.toggle('is-empty', isEmpty);
    }
    if (statusEl) {
      statusEl.textContent = isSkipped ? 'Skipped' : isLoaded ? 'Loaded' : 'Empty';
      statusEl.className = ['slot-status', isSkipped ? 'status-skipped' : '', isLoaded ? 'status-loaded' : '', isEmpty ? 'status-empty' : ''].filter(Boolean).join(' ');
    }
    if (isSkipped) {
      const summaryEl = getStatusElBySlot(slotId);
      if (summaryEl) summaryEl.textContent = 'Slot skipped.';
    } else if (isEmpty) {
      const summaryEl = getStatusElBySlot(slotId);
      if (summaryEl) summaryEl.textContent = 'No log loaded';
    }
  }

  function setSlotAction(slotId, action) {
    const panel = getSlotPanel(slotId);
    if (!panel) return;
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
      const slot = getSlotById(slotId);
      if (slot?.skipped) {
        slot.skipped = false;
        updateSlotStatus(slotId);
        updateLoadSummary();
      }
    }
  }

  function clearSlot(slotId) {
    if (String(slotId || 'A').toUpperCase() === 'A') resetMainSlot();
    else resetCompareSlot(slotId);
    updateSlotStatus(slotId);
    setArchiveCompact(slotId, false);
  }

  function skipSlot(slotId) {
    clearSlot(slotId);
    const slot = getSlotById(slotId);
    if (slot) slot.skipped = true;
    setSlotAction(slotId, 'skip');
    updateSlotStatus(slotId);
    updateLoadSummary();
  }

  function updateLoadSummary() {
    if (!dom.loadSummaryItems || !dom.viewReportsBtn) return;
    const active = getActiveCompareSlots();
    const chips = active.map((entry) => {
      const slot = entry.slot;
      const status = slot?.skipped ? 'skipped' : slot?.qsoData ? 'loaded' : 'empty';
      const label = `${entry.label}: ${status === 'loaded' ? 'Loaded' : status === 'skipped' ? 'Skipped' : 'Empty'}`;
      return `<span class="summary-chip ${status}">${escapeHtml(label)}</span>`;
    });
    dom.loadSummaryItems.innerHTML = chips.join('');
    const allResolved = active.every((entry) => entry.slot?.skipped || entry.slot?.qsoData);
    const anyLoaded = active.some((entry) => entry.slot?.qsoData);
    const ready = allResolved && anyLoaded;
    dom.viewReportsBtn.disabled = !ready;
    if (dom.loadSummaryHint) {
      if (!anyLoaded) dom.loadSummaryHint.textContent = 'Load at least one log to continue.';
      else if (!allResolved) dom.loadSummaryHint.textContent = 'Finish loading all visible slots.';
      else dom.loadSummaryHint.textContent = 'Ready to explore reports.';
    }
  }

  function getActiveCompareSnapshots() {
    return getActiveCompareSlots().map((entry) => ({
      ...entry,
      snapshot: buildSlotSnapshot(entry.slot),
      ready: !!entry.slot?.qsoData
    }));
  }

  const renderers = {};
  let overlayNoticeTimer = null;
  let pendingDropFile = null;
  let navStickyBottomBound = false;

  function initNavigation() {
    if (!dom.navList) return;
    dom.navList.innerHTML = '';
    const groups = new Map();
    reports.forEach((r, idx) => {
      if (!r.parentId) return;
      if (!groups.has(r.parentId)) groups.set(r.parentId, []);
      groups.get(r.parentId).push({ report: r, index: idx });
    });
    const groupParentIds = new Set(groups.keys());
    const sectionMap = new Map(NAV_SECTIONS.map((section) => [section.id, { ...section, items: [] }]));
    const fallbackSectionId = NAV_SECTIONS[0]?.id || 'load_core';
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
      const direct = NAV_SECTION_BY_REPORT[report?.id];
      if (direct) return direct;
      if (report?.parentId && NAV_SECTION_BY_REPORT[report.parentId]) return NAV_SECTION_BY_REPORT[report.parentId];
      return fallbackSectionId;
    };

    const makeNavItem = (idx, title, baseClass) => {
      const li = document.createElement('li');
      li.textContent = title;
      li.dataset.index = idx;
      li.dataset.baseClass = baseClass;
      li.dataset.searchText = String(title || '').trim().toLowerCase();
      li.classList.add(baseClass);
      const activate = () => {
        const report = reports[idx];
        if (report?.id === 'load_logs') {
          state.showLoadPanel = false;
        }
        trackEvent('menu_click', {
          report_id: report?.id || '',
          report_title: report?.title || title || ''
        });
        setActiveReport(idx);
      };
      li.addEventListener('click', activate);
      bindKeyboardActivation(li, activate);
      return li;
    };

    const makeSummary = (idx, title, baseClass) => {
      const summary = document.createElement('summary');
      summary.textContent = title;
      summary.dataset.index = idx;
      summary.dataset.baseClass = baseClass;
      summary.dataset.searchText = String(title || '').trim().toLowerCase();
      summary.classList.add(baseClass, 'nav-summary');
      summary.addEventListener('click', () => {
        const report = reports[idx];
        trackEvent('menu_click', {
          report_id: report?.id || '',
          report_title: report?.title || title || '',
          group: 'summary'
        });
        setActiveReport(idx);
      });
      return summary;
    };

    reports.forEach((r, idx) => {
      if (r.parentId) return;
      const sectionId = getSectionIdForReport(r);
      if (!sectionMap.has(sectionId)) {
        sectionMap.set(sectionId, { id: sectionId, title: sectionId, openByDefault: false, items: [] });
      }
      sectionMap.get(sectionId).items.push({ report: r, index: idx });
    });

    NAV_SECTIONS.forEach((section, sectionIdx) => {
      const bucket = sectionMap.get(section.id);
      if (!bucket || !bucket.items || !bucket.items.length) return;
      const wrapper = document.createElement('li');
      wrapper.classList.add('nav-section-item');
      const details = document.createElement('details');
      details.classList.add('nav-section');
      if (section.openByDefault || sectionIdx === 0) details.open = true;

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

  function bindNavStickyBottom() {
    if (navStickyBottomBound || !dom.navList) return;
    navStickyBottomBound = true;
    const scrollEl = dom.navList;
    const bottomThresholdPx = 10;
    let shouldStick = false;

    const isNearBottom = () => {
      // If content grows while the user is "pinned" to bottom, keep them pinned.
      const remaining = scrollEl.scrollHeight - (scrollEl.scrollTop + scrollEl.clientHeight);
      return remaining <= bottomThresholdPx;
    };

    // Capture (not bubble) so we observe summary clicks even when toggle doesn't bubble.
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

      // Run after layout updates so the new scrollHeight is reflected.
      requestAnimationFrame(() => {
        scrollEl.scrollTop = scrollEl.scrollHeight;
        shouldStick = false;
      });
    }, true);
  }

  function applyNavSearchFilter(rawTerm = '') {
    if (!dom.navList) return;
    const term = String(rawTerm || '').trim().toLowerCase();
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
  }

  function setupNavSearch() {
    if (!dom.navSearchInput) return;
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
    dom.prevBtn.disabled = state.activeIndex === 0;
    dom.nextBtn.disabled = state.activeIndex === reports.length - 1;
  }

  let renderSeq = 0;
  function showLoadingState(message) {
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
    document.body.classList.remove('is-loading');
    if (dom.viewContainer) dom.viewContainer.setAttribute('aria-busy', 'false');
  }

  function showOverlayNotice(message, duration = 4500) {
    if (!dom.dragOverlay) return;
    const msgEl = dom.dragOverlay.querySelector('.drag-overlay-message');
    if (msgEl) msgEl.textContent = message;
    dom.dragOverlay.classList.add('notice');
    if (overlayNoticeTimer) clearTimeout(overlayNoticeTimer);
    overlayNoticeTimer = setTimeout(() => {
      dom.dragOverlay.classList.remove('notice');
    }, duration);
  }

  function trackRenderPerf(reportId, elapsedMs, htmlLength = 0) {
    const id = String(reportId || 'unknown');
    const elapsed = Number(elapsedMs);
    if (!Number.isFinite(elapsed)) return;
    const perf = state.renderPerf && typeof state.renderPerf === 'object'
      ? state.renderPerf
      : { last: null, byReport: {} };
    const byReport = perf.byReport && typeof perf.byReport === 'object' ? perf.byReport : {};
    const prev = byReport[id] || { count: 0, totalMs: 0, avgMs: 0, maxMs: 0, lastMs: 0, lastHtmlSize: 0 };
    const count = prev.count + 1;
    const totalMs = prev.totalMs + elapsed;
    byReport[id] = {
      count,
      totalMs,
      avgMs: totalMs / count,
      maxMs: Math.max(prev.maxMs || 0, elapsed),
      lastMs: elapsed,
      lastHtmlSize: Number(htmlLength) || 0
    };
    perf.byReport = byReport;
    perf.last = {
      reportId: id,
      ms: elapsed,
      htmlSize: Number(htmlLength) || 0,
      at: Date.now()
    };
    state.renderPerf = perf;
    if (elapsed >= 80) {
      console.debug(`[SH6] slow render: ${id} ${elapsed.toFixed(1)}ms`);
    }
  }

  function getRenderPerfSummary() {
    const perf = state.renderPerf && typeof state.renderPerf === 'object'
      ? state.renderPerf
      : { last: null, byReport: {} };
    const byReport = perf.byReport && typeof perf.byReport === 'object' ? perf.byReport : {};
    let hotspotId = '';
    let hotspot = null;
    Object.entries(byReport).forEach(([reportId, entry]) => {
      const maxMs = Number(entry?.maxMs || 0);
      if (!hotspot || maxMs > Number(hotspot.maxMs || 0)) {
        hotspotId = reportId;
        hotspot = entry;
      }
    });
    return {
      last: perf.last || null,
      hotspotId,
      hotspot: hotspot || null
    };
  }

  function renderReportWithLoading(report) {
    const seq = ++renderSeq;
    const title = report?.title || 'report';
    showLoadingState(`Preparing ${title}...`);
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (seq !== renderSeq) return;
        const startedAt = (typeof performance !== 'undefined' && typeof performance.now === 'function')
          ? performance.now()
          : Date.now();
        const html = renderReport(report);
        const elapsedMs = (typeof performance !== 'undefined' && typeof performance.now === 'function')
          ? (performance.now() - startedAt)
          : (Date.now() - startedAt);
        trackRenderPerf(report?.id, elapsedMs, html?.length || 0);
        if (seq !== renderSeq) return;
        dom.viewContainer.innerHTML = html;
        bindReportInteractions(report.id);
        if (dom.loadPanel) {
          if (report.id === 'load_logs') {
            dom.loadPanel.style.display = state.showLoadPanel ? 'block' : 'none';
          } else {
            dom.loadPanel.style.display = 'none';
            state.showLoadPanel = false;
          }
        }
        if (dom.bandRibbon) {
          dom.bandRibbon.style.display = report.id === 'load_logs' ? 'none' : '';
        }
        const isLoadReport = report.id === 'load_logs';
        document.body.classList.toggle('landing-only', isLoadReport && !state.showLoadPanel);
        document.body.classList.toggle('load-active', isLoadReport && state.showLoadPanel);
        const landingPage = document.querySelector('.landing-page');
        if (landingPage) {
          landingPage.classList.toggle('is-hidden', isLoadReport && state.showLoadPanel);
        }
        clearLoadingState();
      }, 0);
    });
  }

  function invalidateCompareLogData() {
    state.compareLogData = null;
    state.compareLogPendingKey = null;
    state.compareLogPendingSince = null;
    if (state.compareLogFallbackTimer) {
      clearTimeout(state.compareLogFallbackTimer);
      state.compareLogFallbackTimer = null;
    }
    state.compareLogWindowStart = 0;
  }

  function updateBandRibbon() {
    if (!dom.bandRibbon) return;
    const bands = getAvailableBands(state.compareCount > 1);
    const active = (state.globalBandFilter || '').trim();
    const hasActive = active && bands.some((b) => String(b).toUpperCase() === active.toUpperCase());
    if (active && !hasActive) state.globalBandFilter = '';
    const selected = (state.globalBandFilter || '').trim();
    let html = '<span class="band-label">Band:</span>';
    html += `<a href="#" class="band-pill${selected ? '' : ' active'}" data-band="">All</a>`;
    bands.forEach((band) => {
      const isActive = selected && String(band).toUpperCase() === selected.toUpperCase();
      const label = escapeHtml(formatBandLabel(band));
      const bandAttr = escapeAttr(band);
      html += `<a href="#" class="band-pill${isActive ? ' active' : ''}" data-band="${bandAttr}">${label}</a>`;
    });
    dom.bandRibbon.innerHTML = html;
  }

  function renderActiveReport() {
    if (state.mapViewActive) {
      dom.viewTitle.textContent = 'Map';
      dom.viewContainer.innerHTML = renderMapView();
      bindReportInteractions('map_view');
      return;
    }
    const report = reports[state.activeIndex];
    if (!report) return;
    renderReportWithLoading(report);
  }

  function setActiveReport(idx) {
    state.mapViewActive = false;
    document.body.classList.remove('map-view', 'map-full');
    state.activeIndex = idx;
    const report = reports[idx];
    dom.viewTitle.textContent = report.title;
    updateNavHighlight();
    updatePrevNextButtons();
    renderReportWithLoading(report);
  }

  function renderReportIntroCard(title, subtitle = '', tags = []) {
    const safeTitle = escapeHtml(title || '');
    const safeSubtitle = escapeHtml(subtitle || '');
    const tagHtml = Array.isArray(tags) && tags.length
      ? `<div class="report-chip-row">${tags.map((tag) => `<span class="report-chip">${escapeHtml(tag || '')}</span>`).join('')}</div>`
      : '';
    return `
      <section class="report-intro-card">
        <h3>${safeTitle}</h3>
        ${safeSubtitle ? `<p>${safeSubtitle}</p>` : ''}
        ${tagHtml}
      </section>
    `;
  }

  function renderAnalysisStepHeading(stepNumber, title, subtitle = '') {
    const stepText = Number.isFinite(Number(stepNumber)) ? `Step ${Number(stepNumber)}` : String(stepNumber || 'Step');
    return `
      <div class="analysis-step-title">
        <span class="analysis-step-kicker">${escapeHtml(stepText)}</span>
        <span class="analysis-step-name">${escapeHtml(title || '')}</span>
        ${subtitle ? `<span class="analysis-step-note">${escapeHtml(subtitle)}</span>` : ''}
      </div>
    `;
  }

  function renderStateCard({ type = 'info', title = '', message = '', actionLabel = '', actionClass = '' } = {}) {
    const safeType = ['info', 'warn', 'error'].includes(type) ? type : 'info';
    const safeTitle = escapeHtml(title || 'Status');
    const safeMessage = escapeHtml(message || '');
    const safeActionLabel = escapeHtml(actionLabel || '');
    return `
      <section class="state-card state-${safeType}">
        <h3>${safeTitle}</h3>
        ${safeMessage ? `<p>${safeMessage}</p>` : ''}
        ${safeActionLabel ? `<p><button type="button" class="button ${escapeAttr(actionClass || '')}">${safeActionLabel}</button></p>` : ''}
      </section>
    `;
  }

  function normalizeCoachSeverity(level) {
    const key = String(level || '').trim().toLowerCase();
    if (key === 'critical') return 'critical';
    if (key === 'high') return 'high';
    if (key === 'medium') return 'medium';
    if (key === 'opportunity') return 'opportunity';
    return 'info';
  }

  function coachSeverityLabel(level) {
    const key = normalizeCoachSeverity(level);
    if (key === 'critical') return 'Critical';
    if (key === 'high') return 'High';
    if (key === 'medium') return 'Medium';
    if (key === 'opportunity') return 'Opportunity';
    return 'Info';
  }

  function inferCoachInsightSeverity(text) {
    const key = String(text || '').toLowerCase();
    if (!key) return 'info';
    if (key.includes('not found') || key.includes('no competitors') || key.includes('unable')) return 'critical';
    if (key.includes('very narrow') || key.includes('very small') || key.includes('need about')) return 'high';
    if (key.includes('main gap driver') || key.includes('gap driver') || key.includes('multiplier deficit')) return 'medium';
    if (key.includes('nearest rival') || key.includes('leading') || key.includes('rows analyzed')) return 'opportunity';
    return 'info';
  }

  function renderPlaceholder(report) {
    const hasLog = !!state.logFile && !!state.qsoData && state.qsoData.qsos && state.qsoData.qsos.length;
    if (!hasLog) {
      return renderStateCard({
        type: 'warn',
        title: 'No log loaded yet',
        message: 'To see this report, load a log first. You can upload your own file, use archive search, or start with the demo log.',
        actionLabel: 'Demo log',
        actionClass: 'demo-log-btn'
      });
    }
    return renderStateCard({
      type: 'info',
      title: report.title,
      message: 'This report will appear after log data is available for this view.'
    });
  }

  const BAND_DEFS = [
    { label: '2190M', min: 0.1357, max: 0.1378 },
    { label: '630M', min: 0.472, max: 0.479 },
    { label: '560M', min: 0.5, max: 0.51 },
    { label: '160M', min: 1.8, max: 2.0 },
    { label: '80M', min: 3.4, max: 4.0 },
    { label: '60M', min: 5.0, max: 5.5 },
    { label: '40M', min: 6.9, max: 7.5 },
    { label: '30M', min: 10.0, max: 10.2 },
    { label: '20M', min: 13.9, max: 15.0 },
    { label: '17M', min: 18.0, max: 18.2 },
    { label: '15M', min: 20.8, max: 22.0 },
    { label: '12M', min: 24.8, max: 25.0 },
    { label: '10M', min: 27.9, max: 29.8 },
    { label: '8M', min: 40.0, max: 45.0 },
    { label: '6M', min: 50.0, max: 54.0 },
    { label: '5M', min: 54.0, max: 70.0 },
    { label: '4M', min: 70.0, max: 71.0 },
    { label: '2M', min: 144.0, max: 148.0 },
    { label: '1.25M', min: 222.0, max: 225.0 },
    { label: '70CM', min: 420.0, max: 450.0 },
    { label: '33CM', min: 902.0, max: 928.0 },
    { label: '23CM', min: 1240.0, max: 1300.0 },
    { label: '13CM', min: 2300.0, max: 2450.0 },
    { label: '9CM', min: 3300.0, max: 3500.0 },
    { label: '6CM', min: 5650.0, max: 5925.0 },
    { label: '3CM', min: 10000.0, max: 10500.0 },
    { label: '1.25CM', min: 24000.0, max: 24250.0 },
    { label: '6MM', min: 47000.0, max: 47200.0 },
    { label: '4MM', min: 75500.0, max: 81000.0 },
    { label: '2.5MM', min: 122000.0, max: 123000.0 },
    { label: '2MM', min: 134000.0, max: 141000.0 },
    { label: '1MM', min: 241000.0, max: 250000.0 }
  ];

  const BAND_LABELS = new Set(BAND_DEFS.map((b) => b.label));
  const BAND_ORDER_INDEX = new Map(BAND_DEFS.map((b, idx) => [b.label, idx]));
  const METER_TOKEN_MAP = new Map();
  BAND_DEFS.forEach((band) => {
    const match = band.label.match(/^(\d+(?:\.\d+)?)(M)$/i);
    if (!match) return;
    const num = match[1];
    const norm = String(parseFloat(num));
    METER_TOKEN_MAP.set(num, band.label);
    METER_TOKEN_MAP.set(norm, band.label);
  });

  const SUPPORTED_BANDS = new Set([...BAND_LABELS, 'LIGHT']);

  function bandOrderIndex(band) {
    const key = (band || '').toUpperCase();
    if (BAND_ORDER_INDEX.has(key)) return BAND_ORDER_INDEX.get(key);
    const num = parseFloat(key);
    if (Number.isFinite(num)) return 1000 + num;
    return 9999;
  }

  function sortBands(list) {
    return (list || []).slice().sort((a, b) => {
      const ai = bandOrderIndex(a);
      const bi = bandOrderIndex(b);
      if (ai !== bi) return ai - bi;
      return String(a || '').localeCompare(String(b || ''));
    });
  }

  function formatBandLabel(band) {
    if (!band) return '';
    const raw = String(band).trim();
    if (!raw) return '';
    if (raw === 'All' || raw === 'ALL') return 'All';
    const key = raw.toUpperCase();
    if (BAND_LABELS.has(key) || key === 'LIGHT') return key.toLowerCase();
    return raw;
  }

  function bandLabelFromNumberToken(token) {
    if (!token) return '';
    const key = String(token).trim();
    if (!key) return '';
    const direct = METER_TOKEN_MAP.get(key);
    if (direct) return direct;
    const norm = String(parseFloat(key));
    return METER_TOKEN_MAP.get(norm) || '';
  }

  function normalizeCall(call) {
    return (call || '').trim().toUpperCase();
  }

  function normalizeSpotterBase(call) {
    const norm = normalizeCall(call || '');
    if (!norm) return '';
    // RBN skimmers often suffix callsign with "-#" (skimmer ID). We treat these as the same spotter base.
    return norm.replace(/-\d+$/, '');
  }

  function parseBandFromFreq(freqMHz) {
    if (!Number.isFinite(freqMHz)) return '';
    for (const band of BAND_DEFS) {
      if (freqMHz >= band.min && freqMHz < band.max) return band.label;
    }
    return '';
  }

  function normalizeBandToken(raw) {
    if (!raw) return '';
    const cleaned = String(raw).trim();
    if (!cleaned) return '';
    let token = cleaned.toLowerCase().replace(/\s+/g, '');
    token = token
      .replace(/meters?|metres?/g, 'm')
      .replace(/centimeters?|centimetres?/g, 'cm')
      .replace(/millimeters?|millimetres?/g, 'mm');
    let match = token.match(/^(\d+(?:\.\d+)?)(mm|cm|m)$/);
    if (match) {
      const num = String(parseFloat(match[1]));
      return `${num}${match[2]}`.toUpperCase();
    }
    match = token.match(/^(\d+(?:\.\d+)?)g(?:hz)?$/);
    if (match) {
      const ghz = parseFloat(match[1]);
      if (Number.isFinite(ghz)) {
        const band = parseBandFromFreq(ghz * 1000);
        return band || `${match[1]}G`.toUpperCase();
      }
    }
    if (/^\d+(\.\d+)?$/.test(token)) {
      const fromToken = bandLabelFromNumberToken(token);
      if (fromToken) return fromToken;
      const num = parseFloat(token);
      if (!Number.isFinite(num)) return '';
      const mhz = num >= 1000 ? num / 1000 : num;
      const band = parseBandFromFreq(mhz);
      return band || String(num).toUpperCase();
    }
    return cleaned.toUpperCase();
  }

  function normalizeBand(rawBand, freq) {
    const band = normalizeBandToken(rawBand);
    if (band) return band;
    if (Number.isFinite(freq)) return parseBandFromFreq(freq);
    return '';
  }

  function normalizeMode(mode) {
    return (mode || '').trim().toUpperCase();
  }

  const numberFormatCache = new Map();
  function formatNumberSh6(value) {
    if (value == null || value === '') return '';
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value);
    if (numberFormatCache.has(num)) return numberFormatCache.get(num);
    const formatted = num.toLocaleString('en-US');
    if (numberFormatCache.size > 5000) numberFormatCache.clear();
    numberFormatCache.set(num, formatted);
    return formatted;
  }

  function formatYearSh6(value, empty = 'N/A') {
    if (value == null || value === '') return empty;
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value);
    if (Number.isInteger(num)) return String(num);
    return String(value);
  }

  function formatFrequency(freq) {
    if (freq == null || freq === '') return '';
    const num = Number(freq);
    if (!Number.isFinite(num)) return String(freq);
    return num.toFixed(3);
  }

  function getBandsFromDerived(derived) {
    if (!derived || !derived.bandSummary) return [];
    return derived.bandSummary.map((b) => b.band).filter((b) => {
      if (!b) return false;
      const key = String(b).trim();
      if (!key) return false;
      return key.toLowerCase() !== 'unknown';
    });
  }

  function getAvailableBands(includeCompare = false) {
    const bands = new Set();
    getBandsFromDerived(state.fullDerived || state.derived).forEach((b) => bands.add(b));
    if (includeCompare || state.compareCount > 1) {
      getActiveCompareSlots().forEach((entry) => {
        if (!entry.slot || entry.id === 'A') return;
        getBandsFromDerived(entry.slot.fullDerived || entry.slot.derived).forEach((b) => bands.add(b));
      });
    }
    return sortBands(Array.from(bands));
  }

  function getDisplayBandList() {
    return getAvailableBands(state.compareCount > 1);
  }

  function bandSlug(band) {
    if (!band || band === 'All' || band === 'ALL') return 'all';
    return formatBandLabel(band).replace(/[^a-z0-9]+/gi, '_');
  }

  function buildReportsList() {
    const list = [];
    BASE_REPORTS.forEach((r) => {
      list.push(r);
    });
    return list;
  }

  function resolveLegacyBandReportId(reportId) {
    const raw = String(reportId || '');
    if (!raw.includes('::')) return null;
    const [baseId, band] = raw.split('::');
    if (!baseId || !band) return null;
    const allowed = new Set(['countries_by_time', 'graphs_qs_by_hour', 'graphs_points_by_hour']);
    if (!allowed.has(baseId)) return null;
    return { baseId, band };
  }

  function setActiveReportById(reportId, options = {}) {
    const safeId = String(reportId || '');
    if (safeId === 'charts') {
      // Backward compat: older sessions/permalinks used a parent Charts menu.
      return setActiveReportById('charts_qs_by_band', options);
    }
    const legacy = resolveLegacyBandReportId(safeId);
    if (legacy) {
      // Backward compat: old permalinks/sessions used per-band menu items.
      state.globalBandFilter = legacy.band;
      updateBandRibbon();
      const baseIndex = reports.findIndex((r) => r.id === legacy.baseId);
      if (baseIndex >= 0) return setActiveReport(baseIndex);
    }
    const idx = reports.findIndex((r) => r.id === safeId);
    if (idx >= 0) return setActiveReport(idx);
    return;
  }

  function rebuildReports() {
    const currentId = reports[state.activeIndex]?.id;
    reports = buildReportsList();
    let newIndex = currentId ? reports.findIndex((r) => r.id === currentId) : -1;
    if (newIndex < 0 && currentId) {
      const legacy = resolveLegacyBandReportId(currentId);
      if (legacy) {
        state.globalBandFilter = legacy.band;
        updateBandRibbon();
        newIndex = reports.findIndex((r) => r.id === legacy.baseId);
      }
    }
    if (newIndex >= 0) state.activeIndex = newIndex;
    else if (reports.length) state.activeIndex = Math.min(state.activeIndex, reports.length - 1);
    initNavigation();
  }

  function getFrequencyScatterRange(qsos) {
    let minTs = Infinity;
    let maxTs = -Infinity;
    let minFreq = Infinity;
    let maxFreq = -Infinity;
    let count = 0;
    (qsos || []).forEach((q) => {
      if (!Number.isFinite(q.ts) || !Number.isFinite(q.freq)) return;
      count += 1;
      if (q.ts < minTs) minTs = q.ts;
      if (q.ts > maxTs) maxTs = q.ts;
      if (q.freq < minFreq) minFreq = q.freq;
      if (q.freq > maxFreq) maxFreq = q.freq;
    });
    if (!count) return null;
    return { minTs, maxTs, minFreq, maxFreq, count };
  }

  function mergeFrequencyScatterRanges(rangeA, rangeB) {
    if (!rangeA && !rangeB) return null;
    if (!rangeA) return { ...rangeB };
    if (!rangeB) return { ...rangeA };
    return {
      minTs: Math.min(rangeA.minTs, rangeB.minTs),
      maxTs: Math.max(rangeA.maxTs, rangeB.maxTs),
      minFreq: Math.min(rangeA.minFreq, rangeB.minFreq),
      maxFreq: Math.max(rangeA.maxFreq, rangeB.maxFreq),
      count: (rangeA.count || 0) + (rangeB.count || 0)
    };
  }

  function mergeFrequencyScatterRangesList(ranges) {
    const valid = (ranges || []).filter(Boolean);
    if (!valid.length) return null;
    return valid.reduce((acc, range) => mergeFrequencyScatterRanges(acc, range), null);
  }

  function sampleFrequencyScatterPoints(qsos, maxPoints = 6000) {
    const all = [];
    (qsos || []).forEach((q) => {
      if (!Number.isFinite(q.ts) || !Number.isFinite(q.freq)) return;
      all.push({ ts: q.ts, freq: q.freq });
    });
    if (!all.length) return { points: [], total: 0 };
    const step = Math.ceil(all.length / maxPoints);
    if (step <= 1) return { points: all, total: all.length };
    const sampled = all.filter((_, idx) => idx % step === 0);
    return { points: sampled, total: all.length };
  }

  function applyRangePadding(min, max, padRatio, fallbackSpan) {
    let span = max - min;
    if (!Number.isFinite(span) || span <= 0) span = fallbackSpan;
    const pad = span * padRatio;
    return { min: min - pad, max: max + pad };
  }

  function getWeekendKeyFromRange(range) {
    if (!range || !Number.isFinite(range.minTs) || !Number.isFinite(range.maxTs)) return null;
    const midTs = (range.minTs + range.maxTs) / 2;
    const base = new Date(midTs);
    const baseUtc = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
    const day = baseUtc.getUTCDay();
    const prevOffset = -((day + 1) % 7);
    const nextOffset = prevOffset === 0 ? 0 : prevOffset + 7;
    const prevSat = new Date(baseUtc);
    prevSat.setUTCDate(prevSat.getUTCDate() + prevOffset);
    const nextSat = new Date(baseUtc);
    nextSat.setUTCDate(nextSat.getUTCDate() + nextOffset);
    const pick = Math.abs(midTs - prevSat.getTime()) <= Math.abs(midTs - nextSat.getTime()) ? prevSat : nextSat;
    const year = pick.getUTCFullYear();
    const month = String(pick.getUTCMonth() + 1).padStart(2, '0');
    const date = String(pick.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  }

  const SORT_HEADER_BLACKLIST = new Set(['Map', 'KMZ file']);

  function buildHeaderGrid(headerRows) {
    const grid = [];
    headerRows.forEach((row, rowIndex) => {
      let colIndex = 0;
      grid[rowIndex] = grid[rowIndex] || [];
      Array.from(row.cells).forEach((cell) => {
        const colspan = cell.colSpan || 1;
        const rowspan = cell.rowSpan || 1;
        while (grid[rowIndex][colIndex]) colIndex += 1;
        for (let r = 0; r < rowspan; r += 1) {
          const targetRow = rowIndex + r;
          grid[targetRow] = grid[targetRow] || [];
          for (let c = 0; c < colspan; c += 1) {
            grid[targetRow][colIndex + c] = cell;
          }
        }
        colIndex += colspan;
      });
    });
    return grid;
  }

  function findHeaderColumnIndex(grid, cell) {
    for (let r = 0; r < grid.length; r += 1) {
      const row = grid[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c += 1) {
        if (row[c] === cell) return c;
      }
    }
    return -1;
  }

  function getCellByColumn(row, colIndex) {
    let col = 0;
    for (const cell of Array.from(row.cells)) {
      const span = cell.colSpan || 1;
      if (colIndex >= col && colIndex < col + span) return cell;
      col += span;
    }
    return null;
  }

  function resolveHeaderGridForTable(table) {
    if (!(table instanceof HTMLTableElement)) return null;
    const rows = Array.from(table.rows || []);
    if (!rows.length) return null;
    const headerRows = [];
    for (const row of rows) {
      if (row && row.classList && row.classList.contains('thc')) headerRows.push(row);
      else break;
    }
    if (!headerRows.length) return null;
    const grid = buildHeaderGrid(headerRows);
    const indexMap = new Map();
    headerRows.forEach((row, idx) => indexMap.set(row, idx));
    return { grid, indexMap };
  }

  function getCellByColumnWithHeaderGrid(row, colIndex, headerCtx) {
    if (headerCtx && headerCtx.indexMap && headerCtx.indexMap.has(row)) {
      const r = headerCtx.indexMap.get(row);
      const hit = headerCtx.grid?.[r]?.[colIndex] || null;
      if (hit) return hit;
    }
    return getCellByColumn(row, colIndex);
  }

  function normalizeSortText(text) {
    return (text || '').replace(/\u00a0/g, ' ').trim();
  }

  function parseSortableNumber(text) {
    if (!text) return null;
    const cleaned = text.replace(/\s+/g, '').replace(/,/g, '').replace(/%/g, '');
    if (!cleaned) return null;
    if (!/^[-+]?\d*(?:\.\d+)?$/.test(cleaned)) return null;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  function detectNumericColumn(rows, colIndex) {
    const sample = rows.slice(0, 25);
    if (!sample.length) return false;
    let numeric = 0;
    sample.forEach((row) => {
      const cell = getCellByColumn(row, colIndex);
      const text = normalizeSortText(cell ? cell.textContent : '');
      const num = parseSortableNumber(text);
      if (num != null) numeric += 1;
    });
    return numeric / sample.length >= 0.6;
  }

  function refreshRowStriping(rows) {
    rows.forEach((row, idx) => {
      row.classList.remove('td0', 'td1');
      row.classList.add(idx % 2 === 0 ? 'td1' : 'td0');
    });
  }

  function makeTablesSortable(container) {
    const tables = Array.from(container.querySelectorAll('table.mtc, table.log-table'));
    tables.forEach((table) => {
      const rows = Array.from(table.rows);
      if (!rows.length) return;
      let dataRowSeen = false;
      let hasSectionHeaders = false;
      const headerRows = [];
      for (const row of rows) {
        const hasTh = row.querySelector('th') != null;
        const hasTd = row.querySelector('td') != null;
        if (hasTh && !dataRowSeen) {
          headerRows.push(row);
        } else if (hasTd && !hasTh) {
          dataRowSeen = true;
        } else if (dataRowSeen && hasTh && !hasTd) {
          hasSectionHeaders = true;
          break;
        }
      }
      if (!headerRows.length || hasSectionHeaders) return;

      const grid = buildHeaderGrid(headerRows);
      const headerCells = headerRows.flatMap((row) => Array.from(row.cells));
      headerCells.forEach((th) => {
        if (!(th instanceof HTMLTableCellElement)) return;
        if (th.dataset.sortableReady === '1') return;
        const colspan = th.colSpan || 1;
        const label = normalizeSortText(th.textContent);
        if (colspan > 1) return;
        if (!label || SORT_HEADER_BLACKLIST.has(label)) return;
        const colIndex = findHeaderColumnIndex(grid, th);
        if (colIndex < 0) return;

        th.dataset.sortableReady = '1';
        th.dataset.sortCol = String(colIndex);
        th.classList.add('sortable');
        const inner = th.innerHTML;
        th.innerHTML = `<button type="button" class="sort-link" aria-label="Sort by ${label}">${inner}<span class="sort-indicator"></span></button>`;
      });

      const handleSortClick = (evt) => {
        const btn = evt.target instanceof HTMLElement ? evt.target.closest('.sort-link') : null;
        if (!btn) return;
        const th = btn.closest('th');
        if (!th) return;
        const colIndex = Number(th.dataset.sortCol);
        if (!Number.isFinite(colIndex)) return;

        const order = th.dataset.sortOrder === 'asc' ? 'desc' : 'asc';
        headerCells.forEach((cell) => {
          if (cell.dataset.sortOrder) delete cell.dataset.sortOrder;
          cell.classList.remove('sorted-asc', 'sorted-desc');
        });
        th.dataset.sortOrder = order;
        th.classList.toggle('sorted-asc', order === 'asc');
        th.classList.toggle('sorted-desc', order === 'desc');

        const dataRows = rows.filter((row) => row.querySelector('td') != null && row.querySelector('th') == null);
        if (!dataRows.length) return;
        const numeric = detectNumericColumn(dataRows, colIndex);
        dataRows.sort((a, b) => {
          const aCell = getCellByColumn(a, colIndex);
          const bCell = getCellByColumn(b, colIndex);
          const aText = normalizeSortText(aCell ? aCell.textContent : '');
          const bText = normalizeSortText(bCell ? bCell.textContent : '');
          if (numeric) {
            const aNum = parseSortableNumber(aText);
            const bNum = parseSortableNumber(bText);
            const aVal = aNum == null ? -Infinity : aNum;
            const bVal = bNum == null ? -Infinity : bNum;
            return order === 'asc' ? aVal - bVal : bVal - aVal;
          }
          return order === 'asc'
            ? aText.localeCompare(bText)
            : bText.localeCompare(aText);
        });
        refreshRowStriping(dataRows);
        const parent = table.tBodies[0] || table;
        dataRows.forEach((row) => parent.appendChild(row));
      };

      table.addEventListener('click', handleSortClick);
    });
  }

  function getTableColumnCount(table) {
    const rows = Array.from(table.rows);
    for (const row of rows) {
      if (!row || !row.cells || row.cells.length === 0) continue;
      return Array.from(row.cells).reduce((sum, cell) => sum + (cell.colSpan || 1), 0);
    }
    return 0;
  }

  function shouldStickyTable(table, reportId) {
    if (reportId === 'one_minute_rates') return true;
    if (reportId === 'one_minute_point_rates') return true;
    const colCount = getTableColumnCount(table);
    return colCount >= 8;
  }

  function getBaseReportId(reportId) {
    return String(reportId || '').split('::')[0];
  }

  function clearStickyTableState(table) {
    if (!(table instanceof HTMLTableElement)) return;
    table.classList.remove('sticky-first', 'sticky-head', 'sticky-cols-1', 'sticky-cols-2', 'sticky-cols-3', 'sticky-cols-4');
    table.style.removeProperty('--sticky-header-total');
    for (let i = 1; i <= 4; i += 1) {
      table.style.removeProperty(`--sticky-col-${i}-left`);
      table.style.removeProperty(`--sticky-col-${i}-width`);
    }
    const cells = Array.from(table.querySelectorAll('.sticky-head-cell, .sticky-col-cell'));
    cells.forEach((cell) => {
      if (!(cell instanceof HTMLTableCellElement)) return;
      cell.classList.remove('sticky-head-cell', 'sticky-col-cell', 'sticky-col-1', 'sticky-col-2', 'sticky-col-3', 'sticky-col-4');
      cell.style.removeProperty('position');
      cell.style.removeProperty('top');
      cell.style.removeProperty('left');
      cell.style.removeProperty('z-index');
    });
  }

  function collectStickyHeaderRows(table) {
    const rows = Array.from(table.rows || []);
    const headerRows = [];
    for (const row of rows) {
      const hasTh = row.querySelector('th') != null;
      const hasTd = row.querySelector('td') != null;
      const isHeaderLike = row.classList.contains('thc') || (hasTh && !hasTd);
      if (!headerRows.length) {
        if (!isHeaderLike) continue;
        headerRows.push(row);
        continue;
      }
      if (!isHeaderLike) break;
      headerRows.push(row);
    }
    return headerRows;
  }

  function applyStickyHeaders(table) {
    const headerRows = collectStickyHeaderRows(table);
    if (!headerRows.length) return;
    let topOffset = 0;
    headerRows.forEach((row, idx) => {
      const rowHeight = Math.max(20, Math.ceil(row.getBoundingClientRect().height || row.offsetHeight || 0));
      const cells = Array.from(row.cells || []);
      cells.forEach((cell) => {
        if (!(cell instanceof HTMLTableCellElement)) return;
        cell.classList.add('sticky-head-cell');
        cell.style.position = 'sticky';
        cell.style.top = `${topOffset}px`;
        cell.style.zIndex = String(20 - idx);
      });
      topOffset += rowHeight;
    });
    table.style.setProperty('--sticky-header-total', `${topOffset}px`);
    table.classList.add('sticky-head');
  }

  function getStickyColumnCount(table, reportId) {
    const baseId = getBaseReportId(reportId);
    switch (baseId) {
      case 'log':
        return 2;
      case 'qs_by_minute':
      case 'points_by_minute':
        return 2;
      case 'countries_by_time':
        return 4;
      case 'countries':
        return 4;
      case 'continents':
        return 3;
      case 'beam_heading':
      case 'charts_beam_heading_by_hour':
        return 1;
      default:
        break;
    }
    return shouldStickyTable(table, baseId) ? 1 : 0;
  }

  function resolveStickyColumnWidths(table, columnCount) {
    const rows = Array.from(table.rows || []);
    const headerCtx = resolveHeaderGridForTable(table);
    const widths = [];
    for (let col = 0; col < columnCount; col += 1) {
      let width = 0;
      const sampleRows = rows.slice(0, 60);
      sampleRows.forEach((row) => {
        const cell = getCellByColumnWithHeaderGrid(row, col, headerCtx);
        if (!(cell instanceof HTMLTableCellElement)) return;
        // Ignore spanning cells (footer/separator rows) when sizing sticky columns.
        if ((cell.colSpan || 1) !== 1) return;
        const measured = Math.ceil(cell.getBoundingClientRect().width || cell.offsetWidth || 0);
        if (measured > width) width = measured;
      });
      widths.push(Math.max(34, width || 0));
    }
    return widths;
  }

  function applyStickyColumns(table, columnCount) {
    const count = Math.max(0, Math.min(4, columnCount || 0));
    if (!count) return;
    const widths = resolveStickyColumnWidths(table, count);
    const headerCtx = resolveHeaderGridForTable(table);
    const offsets = [];
    let left = 0;
    for (let i = 0; i < widths.length; i += 1) {
      offsets.push(left);
      table.style.setProperty(`--sticky-col-${i + 1}-left`, `${left}px`);
      table.style.setProperty(`--sticky-col-${i + 1}-width`, `${widths[i]}px`);
      left += widths[i];
    }
    const rows = Array.from(table.rows || []);
    rows.forEach((row) => {
      const seen = new Set();
      for (let col = 0; col < count; col += 1) {
        const cell = getCellByColumnWithHeaderGrid(row, col, headerCtx);
        if (!(cell instanceof HTMLTableCellElement)) continue;
        if ((cell.colSpan || 1) !== 1) continue;
        if (seen.has(cell)) continue;
        seen.add(cell);
        const stickyClass = `sticky-col-${col + 1}`;
        cell.classList.add('sticky-col-cell', stickyClass);
        cell.style.position = 'sticky';
        cell.style.left = `${offsets[col]}px`;
        const isHeaderCell = cell.classList.contains('sticky-head-cell') || row.classList.contains('thc');
        cell.style.zIndex = String(isHeaderCell ? (40 - col) : (8 - col));
      }
    });
    table.classList.add(`sticky-cols-${count}`);
    if (count >= 1) table.classList.add('sticky-first');
  }

  function shouldUseTallTableWrap(baseId, table) {
    const longReports = new Set([
      'log',
      'countries',
      'countries_by_time',
      'qs_by_minute',
      'points_by_minute',
      'all_callsigns',
      'not_in_master',
      'passed_qsos',
      'dupes',
      'beam_heading',
      'charts_beam_heading_by_hour'
    ]);
    if (!longReports.has(baseId)) return false;
    const rowCount = Number(table?.rows?.length || 0);
    if (!rowCount) return false;
    if (baseId === 'log') return rowCount > 80;
    return rowCount > 28;
  }

  function applyTableWrapSizing(table, reportId) {
    if (!(table instanceof HTMLTableElement)) return;
    const baseId = getBaseReportId(reportId);
    const holder = table.closest('.table-wrap') || table.closest('.compare-scroll') || table.closest('.compare-log-wrap');
    if (!(holder instanceof HTMLElement)) return;
    holder.classList.remove('table-wrap--tall', 'compare-scroll--tall', 'compare-log-wrap--tall');
    if (!shouldUseTallTableWrap(baseId, table)) return;
    if (holder.classList.contains('compare-scroll')) {
      holder.classList.add('compare-scroll--tall');
      return;
    }
    if (holder.classList.contains('compare-log-wrap')) {
      holder.classList.add('compare-log-wrap--tall');
      return;
    }
    holder.classList.add('table-wrap--tall');
  }

  function buildLongReportJumpTargets(container, reportId) {
    if (!(container instanceof HTMLElement)) return [];
    const baseId = getBaseReportId(reportId);
    const supported = new Set([
      'log',
      'countries',
      'countries_by_time',
      'qs_by_minute',
      'points_by_minute',
      'beam_heading',
      'all_callsigns',
      'not_in_master',
      'passed_qsos',
      'dupes'
    ]);
    if (!supported.has(baseId)) return [];
    const targets = [];
    if (baseId === 'log') {
      const filters = container.querySelector('#logSearchForm');
      if (filters instanceof HTMLElement) targets.push({ id: 'filters', label: 'Filters', el: filters });
    }
    const table = container.querySelector('.table-wrap, .compare-log-wrap, .compare-scroll');
    if (table instanceof HTMLElement) targets.push({ id: 'table', label: 'Main table', el: table });
    if (baseId === 'log') {
      const pages = container.querySelector('.log-controls-bottom, .compare-window-controls');
      if (pages instanceof HTMLElement) targets.push({ id: 'pages', label: 'Pages', el: pages });
    }
    return targets;
  }

  function attachLongReportJumpBar(container, reportId) {
    if (!(container instanceof HTMLElement)) return;
    const existing = container.querySelector('.report-jumpbar');
    if (existing) existing.remove();
    const targets = buildLongReportJumpTargets(container, reportId);
    if (!targets.length) return;
    const targetMap = new Map(targets.map((item) => [item.id, item.el]));
    const bar = document.createElement('div');
    bar.className = 'report-jumpbar no-print';
    bar.innerHTML = `
      <span class="report-jumpbar-label">Quick jump</span>
      <button type="button" class="button report-jumpbar-btn" data-report-jump="top">Top</button>
      ${targets.map((item) => `<button type="button" class="button report-jumpbar-btn" data-report-jump="${escapeAttr(item.id)}">${escapeHtml(item.label)}</button>`).join('')}
      <button type="button" class="button report-jumpbar-btn" data-report-jump="bottom">Bottom</button>
    `;
    bar.addEventListener('click', (evt) => {
      const btn = evt.target instanceof HTMLElement ? evt.target.closest('[data-report-jump]') : null;
      if (!btn) return;
      evt.preventDefault();
      const jump = String(btn.dataset.reportJump || '').trim();
      const reduceMotion = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (jump === 'top') {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        return;
      }
      if (jump === 'bottom') {
        const tail = container.lastElementChild;
        if (tail instanceof HTMLElement) {
          tail.scrollIntoView({ block: 'end', behavior: reduceMotion ? 'auto' : 'smooth' });
        }
        return;
      }
      const target = targetMap.get(jump);
      if (!(target instanceof HTMLElement)) return;
      target.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    container.insertBefore(bar, container.firstChild);
  }

  function wrapWideTables(container, reportId) {
    if (!container) return;
    const baseId = getBaseReportId(reportId);
    const stickyAllowed = !state.compareEnabled || state.compareStickyEnabled;
    const tables = Array.from(container.querySelectorAll('table.mtc, table.log-table, table.fields-map'));
    tables.forEach((table) => {
      if (!(table instanceof HTMLTableElement)) return;
      clearStickyTableState(table);
      if (stickyAllowed && shouldStickyTable(table, baseId)) {
        applyStickyHeaders(table);
      }
      if (stickyAllowed) {
        const stickyColCount = getStickyColumnCount(table, baseId);
        if (stickyColCount > 0) {
          applyStickyColumns(table, stickyColCount);
        }
      }
      if (table.closest('.table-wrap') || table.closest('.compare-scroll') || table.closest('.compare-log-wrap')) {
        return;
      }
      const parent = table.parentNode;
      if (!parent) return;
      const wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      parent.insertBefore(wrap, table);
      wrap.appendChild(table);
      applyTableWrapSizing(table, baseId);
      return;
    });
    tables.forEach((table) => {
      if (!(table instanceof HTMLTableElement)) return;
      applyTableWrapSizing(table, baseId);
    });
  }

  const MODE_DIGITAL = new Set([
    'FT8', 'FT4', 'RTTY', 'PSK', 'PSK31', 'DATA', 'DIGI', 'MFSK',
    'JT65', 'JT9', 'OLIVIA', 'FSK', 'FSK441', 'AMTOR'
  ]);
  const MODE_PHONE = new Set(['SSB', 'USB', 'LSB', 'AM', 'FM', 'PH', 'PHONE']);

  function modeBucket(mode) {
    const m = normalizeMode(mode);
    if (m === 'CW') return 'CW';
    if (MODE_PHONE.has(m)) return 'Phone';
    if (MODE_DIGITAL.has(m)) return 'Digital';
    return 'Digital';
  }

  function escapeHtml(value) {
    if (value == null) return '';
    return String(value).replace(/[&<>"']/g, (ch) => {
      switch (ch) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return ch;
      }
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function escapeXml(value) {
    if (value == null) return '';
    return String(value).replace(/[&<>'"]/g, (ch) => {
      switch (ch) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&apos;';
        default: return ch;
      }
    });
  }

  const escapeCallCache = new Map();
  const escapeCountryCache = new Map();
  function escapeMemo(value, cache) {
    if (value == null) return '';
    const key = String(value);
    if (cache.has(key)) return cache.get(key);
    const escaped = escapeHtml(key);
    if (cache.size > 50000) cache.clear();
    cache.set(key, escaped);
    return escaped;
  }
  function escapeCall(value) {
    return escapeMemo(value, escapeCallCache);
  }
  function escapeCountry(value) {
    return escapeMemo(value, escapeCountryCache);
  }

  async function copyToClipboard(text) {
    if (!text) return false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(textarea);
    return ok;
  }

  function dateKeyFromTs(ts) {
    const d = new Date(ts);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    return y * 10000 + m * 100 + day;
  }

  function formatDateKey(key) {
    const y = Math.floor(key / 10000);
    const m = Math.floor((key % 10000) / 100);
    const d = key % 100;
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  const BAND_CLASS_MAP = {
    '160M': 'b160',
    '80M': 'b80',
    '40M': 'b40',
    '20M': 'b20',
    '15M': 'b15',
    '10M': 'b10'
  };

  function bandClass(band) {
    return BAND_CLASS_MAP[(band || '').toUpperCase()] || '';
  }

  function modeClass(mode) {
    const bucket = modeBucket(mode);
    if (bucket === 'CW') return 'm-cw';
    if (bucket === 'Digital') return 'm-dig';
    if (bucket === 'Phone') return 'm-ph';
    return '';
  }

  function continentClass(cont) {
    switch (normalizeContinent(cont)) {
      case 'NA': return 'c2';
      case 'SA': return 'c3';
      case 'EU': return 'c4';
      case 'AF': return 'c5';
      case 'AS': return 'c6';
      case 'OC': return 'c7';
      default: return '';
    }
  }

  function mapAllLink(label = 'Map all') {
    return `<a href="#" class="map-link map-all" data-scope="all" data-key="">${label}</a>`;
  }

  function mapAllFooter(columnCount = 1) {
    const cols = Math.max(1, Number(columnCount) || 1);
    return `<tr class="map-all-row"><td colspan="${cols}" class="tar">${mapAllLink()}</td></tr>`;
  }

  const dateFormatCache = new Map();
  function formatDateSh6(ts) {
    if (ts == null) return 'N/A';
    if (dateFormatCache.has(ts)) return dateFormatCache.get(ts);
    const d = new Date(ts);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    const formatted = `${day}-${month}_${year} ${hh}:${mm}Z`;
    if (dateFormatCache.size > 5000) dateFormatCache.clear();
    dateFormatCache.set(ts, formatted);
    return formatted;
  }

  function formatDaySh6(ts) {
    if (ts == null) return '';
    const d = new Date(ts);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}-${month}_${year}`;
  }

  function formatMinutes(mins) {
    if (mins == null || !Number.isFinite(mins)) return 'N/A';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} (${mins} min.)`;
  }

  function minuteCountClass(count) {
    if (!count) return '';
    if (count >= 10) return 's9';
    return `s${count - 1}`;
  }

  function hourRange(qsos) {
    const times = qsos.map((q) => q.ts).filter((t) => typeof t === 'number');
    if (!times.length) return { startHour: 0, endHour: -1 };
    const min = Math.min(...times);
    const max = Math.max(...times);
    return {
      startHour: Math.floor(min / 3600000),
      endHour: Math.floor(max / 3600000)
    };
  }

  function buildCountryTimeBuckets(qsos, bandFilter) {
    const map = new Map(); // country -> {prefix, name, continent, total, buckets: Map(hourBucket -> [4 counts])}
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    qsos.forEach((q) => {
      const qBand = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey && qBand !== bandKey) return;
      if (q.country == null || q.ts == null) return;
      const hour = Math.floor(q.ts / 3600000);
      const quarter = Math.floor((q.ts % 3600000) / (15 * 60000));
      if (!map.has(q.country)) {
        map.set(q.country, {
          name: q.country,
          prefix: q.prefix || '',
          continent: q.continent || '',
          total: 0,
          buckets: new Map()
        });
      }
      const entry = map.get(q.country);
      entry.total += 1;
      if (!entry.buckets.has(hour)) entry.buckets.set(hour, [0, 0, 0, 0]);
      entry.buckets.get(hour)[quarter] += 1;
    });
    return map;
  }

  function deriveContestMeta(qsos) {
    const meta = {
      stationCallsign: null,
      contestId: null,
      category: null,
      categoryOperator: null,
      categoryMode: null,
      categoryBand: null,
      categoryPower: null,
      categoryTransmitter: null,
      categoryStation: null,
      claimedScore: null,
      club: null,
      software: null,
      operators: null
    };
    for (const q of qsos) {
      const r = q.raw || {};
      if (!meta.stationCallsign) meta.stationCallsign = firstNonNull(r.STATION_CALLSIGN, r.OPERATOR, q.op);
      if (!meta.contestId) meta.contestId = firstNonNull(r.CONTEST_ID, r.CONTEST_NAME, r.CONTEST);
      if (!meta.category) meta.category = firstNonNull(r.CATEGORY_OPERATOR, r.CATEGORY, r.CATEGORY_OVERLAY);
      if (!meta.categoryOperator) meta.categoryOperator = firstNonNull(r.CATEGORY_OPERATOR, r.CATEGORY);
      if (!meta.categoryMode) meta.categoryMode = firstNonNull(r.CATEGORY_MODE, r.MODE);
      if (!meta.categoryBand) meta.categoryBand = firstNonNull(r.CATEGORY_BAND, r.BAND);
      if (!meta.categoryPower) meta.categoryPower = firstNonNull(r.CATEGORY_POWER);
      if (!meta.categoryTransmitter) meta.categoryTransmitter = firstNonNull(r.CATEGORY_TRANSMITTER);
      if (!meta.categoryStation) meta.categoryStation = firstNonNull(r.CATEGORY_STATION);
      if (meta.claimedScore == null) meta.claimedScore = firstNonNull(r.CLAIMED_SCORE, r.CLAIMED, r.APP_N1MM_CLAIMED_SCORE);
      if (!meta.club) meta.club = firstNonNull(r.CLUB, r.APP_N1MM_CLUB);
      if (!meta.software) meta.software = firstNonNull(r.APP_N1MM_N1MMVERSION, r.SW_VERSION, r.SOFTWARE);
      if (!meta.operators) meta.operators = firstNonNull(r.OPERATORS);
      if (meta.stationCallsign && meta.contestId && meta.category) break;
    }
    return meta;
  }

  const SCORING_RULE_ALIASES = Object.freeze({
    cqww: ['CQWW', 'CQ-WW', 'CQ WW', 'CQ WORLD WIDE'],
    cqwpx: ['CQWPX', 'CQ-WPX', 'CQ WPX'],
    cqwwrtty: ['CQWWRTTY', 'CQ-WW-RTTY', 'CQ WW RTTY'],
    cqwpxrtty: ['CQWPXRTTY', 'CQ-WPX-RTTY', 'CQ WPX RTTY'],
    cq160: ['CQ160', 'CQ 160', 'CQ-160'],
    wae: ['WAE', 'WORKED ALL EUROPE'],
    darc_fieldday: ['DARC FIELDDAY', 'DARC FIELD DAY'],
    darc_wag: ['DARC WAG', 'WAG CONTEST'],
    ref: ['COUPE DU REF', 'REF CONTEST'],
    eudx: ['EU DX', 'EUDX', 'EU DX CONTEST'],
    euhfc: ['EUHFC', 'EUROPEAN HF CHAMPIONSHIP'],
    eu_vhf_bundle: ['IARU REGION 1 VHF', 'EU VHF', 'ALPE ADRIA'],
    ww_pmc: ['WW PMC', 'WORLDWIDE PEACE MESSENGER'],
    zrs_kvp: ['ZRS KVP'],
    ok_om_dx: ['OK OM DX', 'OK-OM DX', 'OK DX', 'OM DX'],
    rdxc: ['RDXC', 'RUSSIAN DX'],
    rf_championship_cw: ['RF CHAMPIONSHIP CW', 'CHAMPIONSHIP OF RUSSIA CW'],
    ham_spirit: ['HAM SPIRIT'],
    rcc_cup: ['RCC CUP'],
    rda: ['RDA CONTEST', 'RUSSIAN DISTRICT AWARD'],
    rrtc: ['RRTC', 'RUSSIAN RADIO TEAM CHAMPIONSHIP'],
    yuri_gagarin: ['YURI GAGARIN', 'GAGARIN'],
    wed_minitest_40m: ['WEDNESDAY MINITEST 40M', 'WED MINI 40M'],
    wed_minitest_80m: ['WEDNESDAY MINITEST 80M', 'WED MINI 80M'],
    arrl_family_bundle: ['ARRL']
  });
  const SCORING_PHASE1_RULES = new Set([
    'cqww',
    'cqwpx',
    'cqwwrtty',
    'cqwpxrtty',
    'cq160',
    'wae',
    'ref',
    'eudx',
    'euhfc',
    'zrs_kvp',
    'rdxc',
    'rf_championship_cw',
    'ham_spirit',
    'rcc_cup',
    'rrtc',
    'yuri_gagarin'
  ]);
  const SCORING_PHASE2_RULES = new Set([
    'darc_fieldday',
    'darc_wag',
    'ww_pmc',
    'ok_om_dx',
    'rda',
    'wed_minitest_40m',
    'wed_minitest_80m'
  ]);

  function normalizeContestKey(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, '').trim();
  }

  function parseClaimedScoreNumber(value) {
    if (value == null || value === '') return null;
    const raw = String(value).trim();
    if (!raw) return null;
    const normalized = raw.replace(/,/g, '');
    const num = Number(normalized.replace(/[^\d.\-]/g, ''));
    if (!Number.isFinite(num)) return null;
    return Math.round(num);
  }

  function getArchiveFolderFromPath(path) {
    const raw = String(path || '').trim();
    if (!raw) return '';
    const clean = raw.replace(/^\/+|\/+$/g, '');
    if (!clean) return '';
    const folder = clean.split('/')[0] || '';
    return folder.trim();
  }

  function addScoringAlias(aliasMap, alias, ruleId, bias = 0) {
    const key = normalizeContestKey(alias);
    if (!key || !ruleId) return;
    const list = aliasMap.get(key) || [];
    list.push({ ruleId, score: key.length + bias });
    aliasMap.set(key, list);
  }

  function pickBestAliasCandidate(candidates) {
    if (!Array.isArray(candidates) || !candidates.length) return null;
    return candidates.slice().sort((a, b) => {
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      return String(a.ruleId || '').localeCompare(String(b.ruleId || ''));
    })[0] || null;
  }

  function buildScoringIndexes(spec) {
    const byId = new Map();
    const byFolder = new Map();
    const aliasMap = new Map();
    const list = Array.isArray(spec?.rule_sets) ? spec.rule_sets : [];
    list.forEach((rule) => {
      if (!rule || !rule.id) return;
      byId.set(rule.id, rule);
      if (rule.archive_folder) {
        byFolder.set(normalizeContestKey(rule.archive_folder), rule.id);
      }
      addScoringAlias(aliasMap, rule.id, rule.id, 70);
      addScoringAlias(aliasMap, rule.archive_folder, rule.id, 80);
      addScoringAlias(aliasMap, rule.name, rule.id, 10);
      if (Array.isArray(rule.aliases)) {
        rule.aliases.forEach((alias) => addScoringAlias(aliasMap, alias, rule.id, 90));
      }
      const builtIn = SCORING_RULE_ALIASES[rule.id];
      if (Array.isArray(builtIn)) {
        builtIn.forEach((alias) => addScoringAlias(aliasMap, alias, rule.id, 100));
      }
      if (Array.isArray(rule?.subevents)) {
        rule.subevents.forEach((sub) => {
          if (!sub) return;
          addScoringAlias(aliasMap, sub.id, rule.id, 50);
          if (Array.isArray(sub.slug_patterns)) {
            sub.slug_patterns.forEach((pattern) => addScoringAlias(aliasMap, pattern, rule.id, 60));
          }
        });
      }
    });
    return { byId, byFolder, aliasMap };
  }

  function applyScoringSpec(spec, sourceLabel) {
    const indexes = buildScoringIndexes(spec);
    state.scoringSpec = spec;
    state.scoringRuleMap = indexes.byId;
    state.scoringRuleByFolder = indexes.byFolder;
    state.scoringAliasMap = indexes.aliasMap;
    state.scoringStatus = 'ok';
    state.scoringError = null;
    state.scoringSource = sourceLabel || '';
  }

  function resolveRuleIdByContestName(contestIdRaw) {
    const key = normalizeContestKey(contestIdRaw);
    if (!key) return null;
    const aliasMap = state.scoringAliasMap instanceof Map ? state.scoringAliasMap : new Map();
    if (aliasMap.has(key)) {
      const best = pickBestAliasCandidate(aliasMap.get(key));
      return best ? best.ruleId : null;
    }
    let winner = null;
    aliasMap.forEach((candidates, alias) => {
      if (!alias) return;
      if (!key.includes(alias) && !alias.includes(key)) return;
      const best = pickBestAliasCandidate(candidates);
      if (!best) return;
      const matchScore = (best.score || 0) + Math.min(alias.length, key.length);
      if (!winner || matchScore > winner.score) {
        winner = { ruleId: best.ruleId, score: matchScore };
      }
    });
    return winner ? winner.ruleId : null;
  }

  function getConfidenceLabel(rule) {
    const raw = String(rule?.confidence || '').trim().toLowerCase();
    if (raw === 'high') return 'high';
    if (raw.startsWith('medium')) return 'medium';
    if (raw === 'low') return 'low';
    return 'unknown';
  }

  function resolveArrlSubevent(rule, contestIdRaw) {
    if (!rule || !Array.isArray(rule.subevents)) return null;
    const key = normalizeContestKey(contestIdRaw);
    if (!key) return null;
    let winner = null;
    rule.subevents.forEach((sub) => {
      const patterns = Array.isArray(sub?.slug_patterns) ? sub.slug_patterns : [];
      patterns.forEach((pattern) => {
        const patternKey = normalizeContestKey(pattern);
        if (!patternKey) return;
        if (!key.includes(patternKey) && !patternKey.includes(key)) return;
        const score = patternKey.length;
        if (!winner || score > winner.score) {
          winner = { subevent: sub, score };
        }
      });
    });
    return winner ? winner.subevent : null;
  }

  function resolveEuVhfModel(rule, contestIdRaw) {
    const key = normalizeContestKey(contestIdRaw);
    if (!key || !Array.isArray(rule?.subevent_models)) return null;
    if (key.includes('ALPEADRIA')) return rule.subevent_models.find((m) => m.model_id === 'distance_times_multipliers') || null;
    if (key.includes('MICROWAVE') || key.includes('MARATON') || key.includes('SHF')) {
      return rule.subevent_models.find((m) => m.model_id === 'band_weighted_distance') || null;
    }
    if (key.includes('IARU') || key.includes('REGION1') || key.includes('VHF')) {
      return rule.subevent_models.find((m) => m.model_id === 'distance_only') || null;
    }
    return null;
  }

  function resolveContestRuleSet(contestMeta, context = {}) {
    const byId = state.scoringRuleMap;
    const byFolder = state.scoringRuleByFolder;
    if (!(byId instanceof Map) || byId.size === 0 || !(byFolder instanceof Map)) {
      const failed = state.scoringStatus === 'error';
      return {
        supported: false,
        reason: failed ? 'spec_error' : 'spec_unavailable',
        warning: failed
          ? 'Scoring rules failed to load. Showing logged points only if available.'
          : 'Scoring rules are still loading. Please retry in a moment.',
        assumptions: failed
          ? [state.scoringError ? `Scoring spec load error: ${state.scoringError}` : 'Scoring spec load failed.']
          : ['Scoring spec file is not loaded in runtime yet.'],
        detectionMethod: 'none'
      };
    }
    const archivePath = context?.logFile?.path || context?.sourcePath || '';
    const folder = getArchiveFolderFromPath(archivePath);
    const contestRaw = String(contestMeta?.contestId || '').trim();
    const bundleHint = `${contestRaw} ${archivePath}`.trim();
    const folderKey = normalizeContestKey(folder);
    let ruleId = folderKey ? byFolder.get(folderKey) : null;
    let detectionMethod = ruleId ? 'archive_folder' : 'contest_id_alias';
    if (!ruleId) {
      ruleId = resolveRuleIdByContestName(contestRaw);
    }
    const rule = ruleId ? byId.get(ruleId) : null;
    if (!rule) {
      return {
        supported: false,
        reason: 'unknown_rule',
        warning: SCORING_UNKNOWN_WARNING,
        assumptions: ['No matching contest rule set found for this log.'],
        detectionMethod,
        detectionValue: contestRaw || folder || ''
      };
    }
    let bundle = null;
    const assumptions = [];
    if (rule.bundle === true && rule.id === 'arrl_family_bundle') {
      const subevent = resolveArrlSubevent(rule, bundleHint);
      if (subevent) {
        bundle = {
          type: 'arrl',
          subeventId: subevent.id,
          subevent
        };
      } else {
        assumptions.push('ARRL bundle matched but exact subevent slug was not detected.');
      }
    }
    if (rule.bundle === true && rule.id === 'eu_vhf_bundle') {
      const model = resolveEuVhfModel(rule, bundleHint);
      if (model) {
        bundle = {
          type: 'eu_vhf',
          subeventModelId: model.model_id,
          subeventModel: model
        };
      } else {
        assumptions.push('EU VHF bundle matched but subevent model could not be inferred from contest name.');
      }
    }
    return {
      supported: true,
      rule,
      ruleId: rule.id,
      confidence: getConfidenceLabel(rule),
      detectionMethod,
      detectionValue: detectionMethod === 'archive_folder' ? folder : contestRaw,
      assumptions,
      bundle
    };
  }

  function computeLoggedPointsTotal(qsos) {
    return (qsos || []).reduce((sum, q) => (
      Number.isFinite(q?.points) ? sum + q.points : sum
    ), 0);
  }

  const US_STATE_CODES = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC'
  ]);
  const VE_AREA_CODES = new Set(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']);

  function normalizeCountryName(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
  }

  function hasCountryToken(country, tokens) {
    const key = normalizeCountryName(country);
    if (!key) return false;
    return tokens.some((token) => key.includes(token));
  }

  function isCountryUs(country) {
    return hasCountryToken(country, ['UNITED STATES', 'USA', 'K ', 'W ']);
  }

  function isCountryVe(country) {
    return hasCountryToken(country, ['CANADA']);
  }

  function isCountryUsOrVe(country) {
    return isCountryUs(country) || isCountryVe(country);
  }

  function isCountryRu(country) {
    return hasCountryToken(country, ['RUSSIA', 'RUSSIAN FEDERATION']);
  }

  function isCountryFrench(country) {
    return hasCountryToken(country, ['FRANCE']);
  }

  function isCountryDl(country) {
    return hasCountryToken(country, ['GERMANY', 'FEDERAL REPUBLIC OF GERMANY']);
  }

  function isPortableStation(contestMeta, stationCall) {
    const cat = String(contestMeta?.categoryStation || '').toUpperCase();
    const call = String(stationCall || '').toUpperCase();
    if (cat.includes('PORTABLE')) return true;
    if (cat === 'MOBILE') return true;
    if (call.includes('/P') || call.includes('/M') || call.includes('/MM')) return true;
    return false;
  }

  function extractExchangeTokens(q) {
    const raw = firstNonNull(
      q?.exchRcvd,
      q?.srx,
      q?.raw?.SRX_STRING,
      q?.raw?.EXCH_RCVD,
      q?.raw?.STATE,
      q?.raw?.SECTION,
      q?.raw?.RDA,
      q?.raw?.DOK,
      q?.raw?.EXCHANGE
    );
    if (!raw) return [];
    return String(raw)
      .toUpperCase()
      .split(/[\s,;:/]+/)
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function extractWVeQth(tokens) {
    for (const token of tokens) {
      if (US_STATE_CODES.has(token)) return token;
      if (VE_AREA_CODES.has(token)) return token;
    }
    return '';
  }

  function extractDokToken(tokens) {
    return tokens.find((token) => /^[A-Z]{1,3}\d{1,3}$/.test(token)) || '';
  }

  function extractEuRegionToken(tokens) {
    return tokens.find((token) => /^[A-Z]{1,3}\d{1,3}$/.test(token)) || '';
  }

  function extractRdaToken(tokens) {
    return tokens.find((token) => /^[A-Z]{2}\d{2,3}$/.test(token)) || '';
  }

  function extractRccNumber(tokens) {
    return tokens.find((token) => /^\d{1,4}$/.test(token)) || '';
  }

  function extractSerialToken(tokens) {
    return tokens.find((token) => /^\d{1,4}$/.test(token)) || '';
  }

  function extractRefDepartmentToken(tokens) {
    return tokens.find((token) => /^\d{2}[A-Z]?$/.test(token)) || '';
  }

  function extractTeamCode(tokens) {
    return tokens.find((token) => /^[A-Z]{2}\d{1,2}$/.test(token)) || '';
  }

  function extractYearToken(tokens) {
    return tokens.find((token) => /^(19|20)\d{2}$/.test(token)) || '';
  }

  function extractRegionToken(tokens) {
    return tokens.find((token) => /^[A-Z]{2,4}$/.test(token)) || '';
  }

  function extractSentExchangeTokens(q) {
    const raw = firstNonNull(
      q?.exchSent,
      q?.stx,
      q?.raw?.STX_STRING,
      q?.raw?.EXCH_SENT
    );
    if (!raw) return [];
    return String(raw)
      .toUpperCase()
      .split(/[\s,;:/]+/)
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function modeKeyForScoring(mode) {
    const bucket = modeBucket(mode);
    if (bucket === 'CW') return 'CW';
    if (bucket === 'Phone') return 'SSB';
    return 'DIG';
  }

  function lookupBandCoefficient(map, bandNorm) {
    if (!map || typeof map !== 'object') return 1;
    const key = String(bandNorm || '').toLowerCase();
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      const val = Number(map[key]);
      return Number.isFinite(val) ? val : 1;
    }
    if (Object.prototype.hasOwnProperty.call(map, bandNorm)) {
      const val = Number(map[bandNorm]);
      return Number.isFinite(val) ? val : 1;
    }
    return 1;
  }

  function hfBandGroupKey(bandNorm) {
    const band = String(bandNorm || '').toUpperCase();
    if (band === '160M' || band === '80M' || band === '40M') return 'LOW';
    if (band === '20M' || band === '15M' || band === '10M') return 'HIGH';
    return band || 'OTHER';
  }

  function buildStationScoringProfile(qsos, contestMeta) {
    const stationCall = normalizeCall(contestMeta?.stationCallsign || deriveStationCallsign(qsos));
    const stationPrefix = stationCall ? lookupPrefix(stationCall) : null;
    const stationCountry = stationPrefix?.country || '';
    const stationContinent = normalizeContinent(stationPrefix?.continent || '');
    let stationSentEuRegion = '';
    let stationHasSentExchangeTokens = false;
    for (const q of (qsos || [])) {
      const sentTokens = extractSentExchangeTokens(q);
      if (!sentTokens.length) continue;
      stationHasSentExchangeTokens = true;
      const euRegion = extractEuRegionToken(sentTokens);
      if (euRegion) {
        stationSentEuRegion = euRegion;
        break;
      }
    }
    return {
      stationCall,
      stationPrefixToken: stationPrefix?.prefix || '',
      stationCountry,
      stationCountryKey: normalizeCountryName(stationCountry),
      stationContinent,
      stationCqZone: stationPrefix?.cqZone || null,
      stationItuZone: stationPrefix?.ituZone || null,
      stationIsEu: stationContinent === 'EU',
      stationIsNa: stationContinent === 'NA',
      stationIsRu: isCountryRu(stationCountry),
      stationIsFrench: isCountryFrench(stationCountry),
      stationIsDl: isCountryDl(stationCountry),
      stationIsWVe: isCountryUsOrVe(stationCountry),
      stationSentEuRegion,
      stationHasSentExchangeTokens,
      stationIsEuExchangeMember: Boolean(stationSentEuRegion),
      stationPortable: isPortableStation(contestMeta, stationCall)
    };
  }

  function makeScoringRuntime(station) {
    return {
      station,
      callContacts: new Map(),
      callBandModes: new Map(),
      zoneBandSeen: new Set(),
      rfSubjectSeen: new Set(),
      unknownWhen: new Set(),
      unknownMultiplier: new Set()
    };
  }

  function buildQsoScoringFacts(q, station, runtime) {
    const call = normalizeCall(q?.call);
    const prefix = call ? lookupPrefix(call) : null;
    const qCountry = q?.country || prefix?.country || '';
    const qCountryKey = normalizeCountryName(qCountry);
    const qContinent = normalizeContinent(q?.continent || prefix?.continent || '');
    const qCqZone = q?.cqZone != null ? q.cqZone : (prefix?.cqZone || null);
    const qItuZone = q?.ituZone != null ? q.ituZone : (prefix?.ituZone || null);
    const sameCountry = Boolean(station.stationCountryKey && qCountryKey && station.stationCountryKey === qCountryKey);
    const sameContinent = Boolean(station.stationContinent && qContinent && station.stationContinent === qContinent);
    const exchangeTokens = extractExchangeTokens(q);
    const exchangeSentTokens = extractSentExchangeTokens(q);
    const bandNorm = normalizeBandToken(q?.band);
    const modeKey = modeKeyForScoring(q?.mode);
    const bandModeKey = `${bandNorm}|${modeKey}`;
    const seenCount = runtime.callContacts.get(call) || 0;
    const seenBandModes = runtime.callBandModes.get(call) || new Set();
    const zoneBandKey = (qCqZone != null && bandNorm) ? `${bandNorm}|${qCqZone}` : '';
    const rfSubject = exchangeTokens[0] || '';
    const qPrefixToken = prefix?.prefix || '';
    const exchangeEuRegion = extractEuRegionToken(exchangeTokens);
    return {
      q,
      call,
      validQso: Boolean(call),
      qCountry,
      qCountryKey,
      qContinent,
      qCqZone,
      qItuZone,
      qIsEu: qContinent === 'EU',
      qIsNa: qContinent === 'NA',
      qIsRu: isCountryRu(qCountry),
      qIsFrench: isCountryFrench(qCountry),
      qIsDl: isCountryDl(qCountry),
      qIsWVe: isCountryUsOrVe(qCountry),
      sameCountry,
      sameContinent,
      differentContinent: Boolean(station.stationContinent && qContinent && station.stationContinent !== qContinent),
      differentCqZone: qCqZone != null && station.stationCqZone != null && Number(qCqZone) !== Number(station.stationCqZone),
      differentItuZone: qItuZone != null && station.stationItuZone != null && Number(qItuZone) !== Number(station.stationItuZone),
      exchangeTokens,
      exchangeSentTokens,
      hasExchangeTokens: exchangeTokens.length > 0,
      exchangePrimary: exchangeTokens[0] || '',
      exchangeSentPrimary: exchangeSentTokens[0] || '',
      exchangeWVeQth: extractWVeQth(exchangeTokens),
      exchangeDok: extractDokToken(exchangeTokens),
      exchangeEuRegion,
      qIsEuExchangeMember: Boolean(exchangeEuRegion),
      exchangeSerial: extractSerialToken(exchangeTokens),
      exchangeSentSerial: extractSerialToken(exchangeSentTokens),
      exchangeRefDepartment: extractRefDepartmentToken(exchangeTokens),
      exchangeRda: extractRdaToken(exchangeTokens),
      exchangeRccNumber: extractRccNumber(exchangeTokens),
      exchangeTeamCode: extractTeamCode(exchangeTokens),
      exchangeYear: extractYearToken(exchangeTokens),
      exchangeRegion: extractRegionToken(exchangeTokens),
      bandNorm,
      modeKey,
      bandModeKey,
      isQtc: Boolean(q?.isQtc),
      isSatellite: bandNorm === 'LIGHT' || normalizeMode(q?.mode).includes('SAT'),
      isMaritime: /\/MM/.test(call),
      qPortable: /\/P|\/M/.test(call),
      wpx: q?.wpxPrefix || wpxPrefix(call),
      samePrefix: Boolean(station.stationPrefixToken && qPrefixToken && station.stationPrefixToken === qPrefixToken),
      seenCount,
      isNewBandModeForCall: Boolean(call) && !seenBandModes.has(bandModeKey),
      isNewZoneOnBand: Boolean(zoneBandKey) && !runtime.zoneBandSeen.has(zoneBandKey),
      zoneBandKey,
      rfSubject,
      isNewRfSubject: Boolean(rfSubject) && !runtime.rfSubjectSeen.has(rfSubject),
      isRccMember: /RCC|RC\d{1,3}/.test(exchangeTokens.join(' ')),
      isRrtcTeam: /^[A-Z]{2}\d{1,2}$/.test(exchangeTokens[0] || '')
    };
  }

  function markScoringRuntime(facts, runtime) {
    if (!facts.call) return;
    runtime.callContacts.set(facts.call, facts.seenCount + 1);
    const set = runtime.callBandModes.get(facts.call) || new Set();
    set.add(facts.bandModeKey);
    runtime.callBandModes.set(facts.call, set);
    if (facts.zoneBandKey) runtime.zoneBandSeen.add(facts.zoneBandKey);
    if (facts.rfSubject) runtime.rfSubjectSeen.add(facts.rfSubject);
  }

  function evaluateScoringCondition(when, facts, runtime, assumptions) {
    const stationIsEuForExchangeRules = runtime.station.stationHasSentExchangeTokens
      ? runtime.station.stationIsEuExchangeMember
      : runtime.station.stationIsEu;
    const qIsEuForExchangeRules = facts.hasExchangeTokens
      ? facts.qIsEuExchangeMember
      : facts.qIsEu;
    switch (when) {
      case 'any_valid_qso':
      case 'valid_qso':
        return facts.validQso;
      case 'valid_qtc_sent_or_received':
        return facts.validQso && facts.isQtc;
      case 'same_country':
        return facts.sameCountry;
      case 'same_country_same_prefix':
        return facts.sameCountry && facts.samePrefix;
      case 'same_country_different_prefix_or_same_continent_different_country':
        return (facts.sameCountry && !facts.samePrefix) || (facts.sameContinent && !facts.sameCountry);
      case 'same_continent_different_country':
      case 'different_country_same_continent':
        return facts.sameContinent && !facts.sameCountry;
      case 'same_continent_different_itu_zone':
        return facts.sameContinent && !facts.sameCountry && facts.differentItuZone;
      case 'different_continent':
        return facts.differentContinent;
      case 'different_continent_and_zone':
        return facts.differentContinent && facts.differentCqZone;
      case 'non_eu_same_country':
        return !stationIsEuForExchangeRules && facts.sameCountry;
      case 'non_eu_other_country_same_continent':
        return !stationIsEuForExchangeRules && facts.sameContinent && !facts.sameCountry;
      case 'non_eu_other_continent':
        return !stationIsEuForExchangeRules && facts.differentContinent;
      case 'same_continent_non_member':
        return facts.sameContinent && !facts.sameCountry && !facts.isRccMember;
      case 'different_continent_non_member':
        return facts.differentContinent && !facts.isRccMember;
      case 'non_eu_to_eu':
        return !stationIsEuForExchangeRules && qIsEuForExchangeRules;
      case 'eu_to_eu_other_country':
      case 'eu_or_east_med_to_eu_or_east_med':
        return stationIsEuForExchangeRules && qIsEuForExchangeRules && !facts.sameCountry;
      case 'eu_to_own_country':
        return stationIsEuForExchangeRules && qIsEuForExchangeRules && facts.sameCountry;
      case 'eu_to_non_eu_same_continent':
        return stationIsEuForExchangeRules && !qIsEuForExchangeRules && facts.sameContinent;
      case 'eu_to_other_continent':
      case 'eu_or_east_med_to_other_continent':
        return stationIsEuForExchangeRules && facts.differentContinent;
      case 'ru_to_ru_same_continent':
        return runtime.station.stationIsRu && facts.qIsRu && facts.sameContinent;
      case 'ru_to_ru_other_continent':
        return runtime.station.stationIsRu && facts.qIsRu && facts.differentContinent;
      case 'ru_to_other_country_same_continent':
        return runtime.station.stationIsRu && !facts.qIsRu && facts.sameContinent;
      case 'ru_to_other_continent':
        return runtime.station.stationIsRu && facts.differentContinent;
      case 'non_ru_same_country':
        return !runtime.station.stationIsRu && facts.sameCountry;
      case 'non_ru_same_continent_other_country':
        return !runtime.station.stationIsRu && facts.sameContinent && !facts.sameCountry;
      case 'non_ru_other_continent':
        return !runtime.station.stationIsRu && facts.differentContinent;
      case 'non_ru_to_ru':
        return !runtime.station.stationIsRu && facts.qIsRu;
      case 'fixed_eu':
        return !runtime.station.stationPortable && runtime.station.stationIsEu;
      case 'fixed_outside_eu':
        return !runtime.station.stationPortable && !runtime.station.stationIsEu;
      case 'portable_eu':
        return runtime.station.stationPortable && runtime.station.stationIsEu;
      case 'portable_outside_eu':
        return runtime.station.stationPortable && !runtime.station.stationIsEu;
      case 'fixed_to_fixed':
        return !runtime.station.stationPortable && !facts.qPortable;
      case 'dl_station_working_dl':
        return runtime.station.stationIsDl && facts.qIsDl;
      case 'dl_station_working_europe_non_dl':
        return runtime.station.stationIsDl && facts.qIsEu && !facts.qIsDl;
      case 'dl_station_working_dx':
        return runtime.station.stationIsDl && !facts.qIsEu;
      case 'non_dl_station_any_valid_qso':
        return !runtime.station.stationIsDl && facts.validQso;
      case 'french_station_to_foreign_same_continent':
        return runtime.station.stationIsFrench && !facts.qIsFrench && facts.sameContinent;
      case 'french_station_to_foreign_other_continent':
        return runtime.station.stationIsFrench && !facts.qIsFrench && facts.differentContinent;
      case 'french_station_to_french_same_continent':
        return runtime.station.stationIsFrench && facts.qIsFrench && facts.sameContinent;
      case 'french_station_to_french_other_continent':
        return runtime.station.stationIsFrench && facts.qIsFrench && facts.differentContinent;
      case 'non_french_station_to_french_same_continent':
        return !runtime.station.stationIsFrench && facts.qIsFrench && facts.sameContinent;
      case 'non_french_station_to_french_other_continent':
        return !runtime.station.stationIsFrench && facts.qIsFrench && facts.differentContinent;
      case 'same_p150_country':
        return facts.sameCountry;
      case 'with_rcc_member_station':
        return facts.isRccMember;
      case 'with_rrtc_team_station':
        return facts.isRrtcTeam;
      case 'with_non_team_same_itu_zone':
        return !facts.isRrtcTeam && !facts.differentItuZone;
      case 'with_non_team_different_itu_zone':
        return !facts.isRrtcTeam && facts.differentItuZone;
      case 'special_station_ok5o':
        return facts.call === 'OK5O';
      case 'iss_rs0iss':
        return facts.call === 'RS0ISS';
      case 'maritime_mobile':
        return facts.isMaritime;
      case 'satellite_qso':
        return facts.isSatellite;
      case 'first_contact_with_callsign':
        return facts.seenCount === 0;
      case 'second_contact_with_callsign_new_band_or_mode':
        return facts.seenCount === 1 && facts.isNewBandModeForCall;
      case 'third_contact_with_callsign_new_band_or_mode':
        return facts.seenCount === 2 && facts.isNewBandModeForCall;
      case 'new_zone_on_band':
        return facts.isNewZoneOnBand;
      case 'new_rf_subject_once_contest':
        return facts.isNewRfSubject;
      case 'other_pairs':
        return facts.validQso;
      default:
        if (!runtime.unknownWhen.has(when)) {
          runtime.unknownWhen.add(when);
          assumptions.add(`Unhandled scoring condition: ${when}`);
        }
        return false;
    }
  }

  function pointsFromConditionRules(rules, facts, runtime, assumptions) {
    if (!Array.isArray(rules)) return null;
    for (const row of rules) {
      const points = Number(row?.points);
      if (!Number.isFinite(points)) continue;
      if (!evaluateScoringCondition(String(row?.when || ''), facts, runtime, assumptions)) continue;
      return points;
    }
    return null;
  }

  function computeRuleQsoPoints(rule, qsos, station, assumptions) {
    const runtime = makeScoringRuntime(station);
    const model = String(rule?.qso_points?.model || '').trim();
    const pointsByIndex = new Array((qsos || []).length).fill(0);
    let qsoPointsTotal = 0;
    let weightedQsoPointsTotal = 0;
    let qsoCount = 0;
    let qtcCount = 0;
    let matrixBasePoints = 0;
    let newZoneBonus = 0;
    let newRegionBonus = 0;
    const modePoints = { CW: 0, SSB: 0, DIG: 0 };
    const bandPoints = {};
    const uniqueCalls = new Set();
    const handledTableModels = new Set([
      'table_by_geography',
      'table_by_portable_status_and_geography',
      'table_by_station_region',
      'table_by_station_region_and_geography',
      'table_by_eu_membership_and_geography',
      'table_by_region_pairing',
      'table_by_country_prefix_continent',
      'table_by_ru_status_and_geography',
      'table_by_ru_non_ru',
      'table_by_station_type_and_itu_relation',
      'table_with_member_bonus'
    ]);

    (qsos || []).forEach((q, idx) => {
      const facts = buildQsoScoringFacts(q, station, runtime);
      const isDuplicate = Boolean(q?.isDupe) && String(rule?.id || '') === 'darc_fieldday';
      if (facts.call && !isDuplicate) uniqueCalls.add(facts.call);
      if (isDuplicate) {
        pointsByIndex[idx] = 0;
        return;
      }
      let points = null;
      if (handledTableModels.has(model)) {
        points = pointsFromConditionRules(rule?.qso_points?.rules, facts, runtime, assumptions);
      } else if (model === 'table_by_geography_and_band_group') {
        const groups = rule?.qso_points?.band_groups || {};
        const isLowBand = ['160M', '80M', '40M'].includes(facts.bandNorm);
        const low = groups.low_bands_40_80_160 || groups.low_bands_40_80 || null;
        const high = groups.high_bands_10_15_20 || null;
        const table = isLowBand ? low : high;
        if (table) {
          if (facts.differentContinent) points = Number(table.different_continent);
          else if (facts.sameCountry) points = Number(table.same_country);
          else if (facts.sameContinent) {
            if (facts.qIsNa && station.stationIsNa && Number.isFinite(Number(table.na_intra_continent_exception))) {
              points = Number(table.na_intra_continent_exception);
            } else {
              points = Number(table.same_continent_different_country);
            }
          }
        }
      } else if (model === 'table_by_band_group') {
        const groups = rule?.qso_points?.band_groups || {};
        if (['160M', '80M', '40M'].includes(facts.bandNorm)) points = Number(groups['160_80_40']);
        else points = Number(groups['20_15_10']);
      } else if (model === 'by_mode') {
        const rows = Array.isArray(rule?.qso_points?.rules) ? rule.qso_points.rules : [];
        const key = normalizeMode(q?.mode);
        const row = rows.find((r) => normalizeMode(r?.mode) === key) || rows.find((r) => modeKeyForScoring(r?.mode) === facts.modeKey);
        points = Number(row?.points);
      } else if (model === 'fixed') {
        points = Number(rule?.qso_points?.rules?.[0]?.points);
      } else if (model === 'qso_and_qtc_units') {
        points = facts.validQso ? 1 : 0;
        if (facts.isQtc) qtcCount += 1;
      } else if (model === 'zone_matrix_plus_bonuses') {
        const base = facts.validQso ? (facts.differentContinent && facts.differentCqZone ? 2 : 1) : 0;
        points = base;
        matrixBasePoints += base;
        const bonuses = Array.isArray(rule?.qso_points?.bonuses) ? rule.qso_points.bonuses : [];
        bonuses.forEach((bonus) => {
          if (!evaluateScoringCondition(String(bonus?.when || ''), facts, runtime, assumptions)) return;
          const b = Number(bonus?.points);
          if (!Number.isFinite(b)) return;
          points += b;
          if (String(bonus.when) === 'new_zone_on_band') newZoneBonus += b;
          else newRegionBonus += b;
        });
      } else if (model === 'progressive_per_callsign_plus_geography_bonus') {
        const base = pointsFromConditionRules(rule?.qso_points?.rules, facts, runtime, assumptions);
        const modeCoefficients = rule?.qso_points?.mode_coefficients || {};
        const modeCoeff = Number(modeCoefficients[facts.modeKey] ?? 1);
        points = Number.isFinite(base) ? (base * modeCoeff) : null;
        const bonuses = Array.isArray(rule?.qso_points?.geography_bonus) ? rule.qso_points.geography_bonus : [];
        bonuses.forEach((row) => {
          if (!evaluateScoringCondition(String(row?.when || ''), facts, runtime, assumptions)) return;
          const b = Number(row?.bonus);
          if (!Number.isFinite(b)) return;
          points = (Number.isFinite(points) ? points : 0) + b;
        });
      } else if (model === 'base_points_with_band_and_mode_coefficients') {
        const base = pointsFromConditionRules(rule?.qso_points?.base_rules, facts, runtime, assumptions);
        const bandCoeff = lookupBandCoefficient(rule?.qso_points?.band_coefficients, facts.bandNorm);
        const modeCoeffs = rule?.qso_points?.mode_coefficients || {};
        const modeCoeff = Number(modeCoeffs[facts.modeKey] ?? 1);
        points = Number.isFinite(base) ? (base * bandCoeff * modeCoeff) : null;
      }
      if (!Number.isFinite(points)) {
        if (!model) assumptions.add('Missing qso_points.model, using logged points fallback.');
        else assumptions.add(`Scoring model fallback used for ${model}.`);
        points = Number.isFinite(q?.points) ? q.points : 0;
      }
      pointsByIndex[idx] = points;
      qsoPointsTotal += points;
      weightedQsoPointsTotal += points;
      if (!facts.isQtc && facts.validQso) qsoCount += 1;
      modePoints[facts.modeKey] = (modePoints[facts.modeKey] || 0) + points;
      const bandKey = facts.bandNorm || 'UNKNOWN';
      bandPoints[bandKey] = (bandPoints[bandKey] || 0) + points;
      markScoringRuntime(facts, runtime);
    });

    return {
      pointsByIndex,
      qsoPointsTotal,
      weightedQsoPointsTotal,
      qsoCount,
      qtcCount,
      modePoints,
      uniqueCallCount: uniqueCalls.size,
      matrixBasePoints,
      newZoneBonus,
      newRegionBonus,
      bandPoints
    };
  }

  function getMultiplierValue(group, facts, station, runtime, assumptions) {
    switch (group) {
      case 'country':
      case 'country_for_ru_entries':
      case 'dxcc_country':
      case 'dxcc_entities_for_french_entries':
      case 'dl_station_uses_country_entities':
      case 'wae_country_or_dxcc_set_by_station_region':
        return facts.qCountryKey || '';
      case 'cq_zone':
        return facts.qCqZone != null ? String(facts.qCqZone) : '';
      case 'cq_zone_except_own':
        if (facts.qCqZone == null || station.stationCqZone == null) return '';
        return Number(facts.qCqZone) === Number(station.stationCqZone) ? '' : String(facts.qCqZone);
      case 'itu_zone':
        return facts.qItuZone != null ? String(facts.qItuZone) : '';
      case 'itu_zone_plus_locator_sector': {
        const grid = String(facts.q?.grid || '').slice(0, 2).toUpperCase();
        return facts.qItuZone != null ? `${facts.qItuZone}|${grid}` : '';
      }
      case 'w_ve_qth':
      case 'us_states_dc':
      case 've_provinces_areas':
        return facts.exchangeWVeQth || '';
      case 'wpx_prefix':
        return facts.wpx || '';
      case 'prefix_within_zone':
        return (facts.wpx && facts.qCqZone != null) ? `${facts.wpx}|${facts.qCqZone}` : '';
      case 'ok_district':
      case 'om_district':
      case 'non_dl_station_uses_dok_districts':
        return facts.exchangeDok || '';
      case 'rda_district':
      case 'russian_oblast':
        return facts.exchangeRda || '';
      case 'rcc_number':
        return facts.exchangeRccNumber || '';
      case 'rrtc_team_code':
        return facts.exchangeTeamCode || '';
      case 'special_station_abbreviation':
      case 'departments_and_special_prefixes':
        return facts.exchangeRefDepartment || facts.exchangeRegion || facts.exchangePrimary || '';
      case 'eu_region_code':
        return facts.exchangeEuRegion || '';
      case 'unique_year_number_exchange':
        return facts.exchangeYear || facts.exchangeSerial || facts.exchangeSentSerial || '';
      case 'unique_callsign':
        return facts.call || '';
      default:
        if (!runtime.unknownMultiplier.has(group)) {
          runtime.unknownMultiplier.add(group);
          assumptions.add(`Unhandled multiplier group: ${group}`);
        }
        return '';
    }
  }

  function computeRuleMultipliers(rule, qsos, station, pointState, assumptions) {
    const model = String(rule?.multipliers?.model || '');
    const configuredGroups = Array.isArray(rule?.multipliers?.groups) ? rule.multipliers.groups : [];
    const configuredScope = String(rule?.multipliers?.counting_scope || 'once_total');
    const bandWeights = rule?.multipliers?.band_weights || {};
    let effectiveGroups = configuredGroups.slice();
    let effectiveScope = configuredScope;

    // Some rule sets encode station-dependent multiplier semantics in prose.
    if (model === 'station_dependent_group') {
      if (rule?.id === 'darc_wag') {
        effectiveGroups = [station.stationIsDl ? 'dl_station_uses_country_entities' : 'non_dl_station_uses_dok_districts'];
        if (!station.stationIsDl) {
          effectiveScope = 'once_total';
          assumptions.add('Applied non-DL WAG multiplier scope override: once_total.');
        }
      } else if (rule?.id === 'ref') {
        effectiveGroups = station.stationIsFrench
          ? ['departments_and_special_prefixes', 'dxcc_entities_for_french_entries']
          : ['departments_and_special_prefixes'];
      }
    }
    if (rule?.id === 'darc_fieldday') {
      effectiveScope = 'per_hf_band_group';
      assumptions.add('Applied DARC Fieldday multiplier scope override: high/low HF band groups.');
    }

    const runtime = makeScoringRuntime(station);
    const perGroup = new Map();
    const groupCounts = {};
    const bandMultiplierCounts = {};
    let weightedTotal = 0;
    const modeMultiplierSets = { CW: new Set(), SSB: new Set(), DIG: new Set() };

    (qsos || []).forEach((q, idx) => {
      if ((pointState?.pointsByIndex?.[idx] || 0) <= 0) {
        markScoringRuntime(buildQsoScoringFacts(q, station, runtime), runtime);
        return;
      }
      const facts = buildQsoScoringFacts(q, station, runtime);
      effectiveGroups.forEach((group) => {
        const value = getMultiplierValue(group, facts, station, runtime, assumptions);
        if (!value) return;
        let scopeKey = 'ALL';
        if (effectiveScope === 'per_mode') scopeKey = facts.modeKey || 'UNKNOWN';
        if (effectiveScope === 'per_band') scopeKey = facts.bandNorm || 'UNKNOWN';
        if (effectiveScope === 'per_band_per_mode') scopeKey = `${facts.bandNorm || 'UNKNOWN'}|${facts.modeKey}`;
        if (effectiveScope === 'per_hf_band_group') scopeKey = hfBandGroupKey(facts.bandNorm);
        const uniqueKey = `${scopeKey}|${value}`;
        const set = perGroup.get(group) || new Set();
        if (set.has(uniqueKey)) return;
        set.add(uniqueKey);
        perGroup.set(group, set);
        groupCounts[group] = (groupCounts[group] || 0) + 1;
        if (effectiveScope === 'per_band' || effectiveScope === 'per_hf_band_group') {
          bandMultiplierCounts[scopeKey] = (bandMultiplierCounts[scopeKey] || 0) + 1;
        }
        modeMultiplierSets[facts.modeKey].add(uniqueKey);
        if (model === 'weighted_mults' && effectiveScope === 'per_band') {
          const w = lookupBandCoefficient(bandWeights, facts.bandNorm);
          weightedTotal += Number.isFinite(w) ? w : 1;
        }
      });
      markScoringRuntime(facts, runtime);
    });

    const total = Object.values(groupCounts).reduce((acc, n) => acc + (Number(n) || 0), 0);
    let multiplierTotal = total;
    if (model === 'single_group') multiplierTotal = Number(groupCounts[effectiveGroups[0]] || 0);
    if (model === 'none_multiplicative') multiplierTotal = 0;
    if (model === 'weighted_mults') multiplierTotal = weightedTotal > 0 ? weightedTotal : total;

    return {
      groupCounts,
      total: multiplierTotal,
      weightedTotal: weightedTotal > 0 ? weightedTotal : multiplierTotal,
      bandMultiplierCounts,
      modeCounts: {
        CW: modeMultiplierSets.CW.size,
        SSB: modeMultiplierSets.SSB.size,
        DIG: modeMultiplierSets.DIG.size
      }
    };
  }

  function evalNumericExpression(expression, vars) {
    const safe = String(expression || '').replace(/[^A-Za-z0-9_+\-*/().\s]/g, ' ');
    const replaced = safe.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, (name) => {
      const val = Number(vars[name]);
      return Number.isFinite(val) ? String(val) : '0';
    });
    try {
      const out = Function(`"use strict"; return (${replaced});`)();
      return Number.isFinite(out) ? Math.round(out) : null;
    } catch (err) {
      return null;
    }
  }

  function evaluateRuleFormula(rule, pointState, multState, station, assumptions) {
    const vars = {
      qso_points_total: pointState.qsoPointsTotal || 0,
      weighted_qso_points_total: pointState.weightedQsoPointsTotal || pointState.qsoPointsTotal || 0,
      qso_count: pointState.qsoCount || 0,
      qtc_count: pointState.qtcCount || 0,
      cw_points: pointState.modePoints?.CW || 0,
      ssb_points: pointState.modePoints?.SSB || 0,
      multipliers_total: multState.total || 0,
      weighted_multiplier_sum: multState.weightedTotal || multState.total || 0,
      cq_zone_mults: multState.groupCounts?.cq_zone || 0,
      country_mults:
        (multState.groupCounts?.country || 0)
        + (multState.groupCounts?.dxcc_country || 0)
        + (multState.groupCounts?.country_for_ru_entries || 0),
      w_ve_qth_mults:
        (multState.groupCounts?.w_ve_qth || 0)
        + (multState.groupCounts?.us_states_dc || 0)
        + (multState.groupCounts?.ve_provinces_areas || 0),
      wpx_prefix_mults: multState.groupCounts?.wpx_prefix || 0,
      eu_region_mults: multState.groupCounts?.eu_region_code || 0,
      oblast_mults: multState.groupCounts?.russian_oblast || 0,
      rda_mults: multState.groupCounts?.rda_district || 0,
      cw_mults: multState.modeCounts?.CW || 0,
      ssb_mults: multState.modeCounts?.SSB || 0,
      unique_callsigns: multState.groupCounts?.unique_callsign || pointState.uniqueCallCount || 0,
      section_mults:
        (multState.groupCounts?.us_states_dc || 0)
        + (multState.groupCounts?.ve_provinces_areas || 0)
        + (multState.groupCounts?.w_ve_qth || 0),
      matrix_base_points: pointState.matrixBasePoints || 0,
      new_zone_bonus: pointState.newZoneBonus || 0,
      new_region_bonus: pointState.newRegionBonus || 0
    };
    if (String(rule?.id || '') === 'euhfc') {
      const bandPoints = pointState?.bandPoints || {};
      const bandMults = multState?.bandMultiplierCounts || {};
      const bands = new Set([...Object.keys(bandPoints), ...Object.keys(bandMults)]);
      let bandwiseScore = 0;
      bands.forEach((band) => {
        const pts = Number(bandPoints[band] || 0);
        const mults = Number(bandMults[band] || 0);
        if (!Number.isFinite(pts) || !Number.isFinite(mults) || pts <= 0 || mults <= 0) return;
        bandwiseScore += (pts * mults);
      });
      if (bandwiseScore > 0) {
        assumptions.add('Applied EUHFC band-wise score formula override.');
        return Math.round(bandwiseScore);
      }
    }
    const formulaRaw = String(rule?.formula || '').trim();
    if (!formulaRaw) {
      if (String(rule?.multipliers?.model || '') === 'none_multiplicative') {
        return (vars.matrix_base_points + vars.new_zone_bonus + vars.new_region_bonus);
      }
      if (vars.multipliers_total > 0) return vars.qso_points_total * vars.multipliers_total;
      return vars.qso_points_total;
    }
    let expression = formulaRaw;
    if (formulaRaw.includes(';')) {
      const parts = formulaRaw.split(';').map((p) => p.trim()).filter(Boolean);
      const selected = station.stationIsRu
        ? (parts.find((p) => p.toLowerCase().includes('ru_score')) || parts[parts.length - 1])
        : (parts.find((p) => p.toLowerCase().includes('non_ru_score')) || parts[0]);
      expression = selected || formulaRaw;
    }
    if (expression.includes('=')) {
      expression = expression.split('=').slice(1).join('=').trim();
    }
    const score = evalNumericExpression(expression, vars);
    if (score == null) {
      assumptions.add(`Formula evaluation fallback used: ${formulaRaw}`);
      if (vars.multipliers_total > 0) return vars.qso_points_total * vars.multipliers_total;
      return vars.qso_points_total;
    }
    return score;
  }

  function scoreFromRule(rule, qsos, contestMeta, assumptions) {
    const station = buildStationScoringProfile(qsos, contestMeta);
    const pointState = computeRuleQsoPoints(rule, qsos, station, assumptions);
    const multState = computeRuleMultipliers(rule, qsos, station, pointState, assumptions);
    const computedScore = evaluateRuleFormula(rule, pointState, multState, station, assumptions);
    if (String(rule?.id || '') === 'wae') {
      const claimed = parseClaimedScoreNumber(contestMeta?.claimedScore);
      if (Number.isFinite(claimed) && claimed > 0 && Number(pointState?.qtcCount || 0) === 0 && computedScore < (claimed * 0.8)) {
        assumptions.add('No QTC records found in this WAE log; claimed score may include QTC traffic omitted from the archive file.');
      }
    }
    return {
      station,
      pointState,
      multState,
      computedScore
    };
  }

  function arlVhfBandFactor(bandNorm) {
    switch (String(bandNorm || '').toUpperCase()) {
      case '6M':
      case '2M':
        return 1;
      case '1.25M':
      case '70CM':
        return 2;
      case '33CM':
      case '23CM':
        return 4;
      default:
        return 8;
    }
  }

  function euVhfBandFactor(bandNorm) {
    switch (String(bandNorm || '').toUpperCase()) {
      case '6M':
      case '4M':
      case '2M':
        return 1;
      case '1.25M':
      case '70CM':
        return 2;
      case '33CM':
      case '23CM':
        return 3;
      default:
        return 4;
    }
  }

  function firstGrid4FromFacts(facts) {
    const direct = String(facts?.q?.grid || '').toUpperCase();
    if (/^[A-R]{2}\d{2}/.test(direct)) return direct.slice(0, 4);
    for (const token of (facts?.exchangeTokens || [])) {
      if (/^[A-R]{2}\d{2}/.test(token)) return token.slice(0, 4);
    }
    return '';
  }

  function scoreArrlBundle(resolved, qsos, contestMeta, assumptions) {
    const subeventId = String(resolved?.bundle?.subeventId || '');
    const station = buildStationScoringProfile(qsos, contestMeta);
    const runtime = makeScoringRuntime(station);
    const pointsByIndex = new Array((qsos || []).length).fill(0);
    const multOnce = new Set();
    const multPerBand = new Set();
    const multPerMode = { CW: new Set(), SSB: new Set(), DIG: new Set() };
    const uniqueCalls = new Set();
    let qsoPointsTotal = 0;
    let multiplierTotal = 0;

    (qsos || []).forEach((q, idx) => {
      const facts = buildQsoScoringFacts(q, station, runtime);
      if (!facts.validQso) {
        markScoringRuntime(facts, runtime);
        return;
      }
      uniqueCalls.add(facts.call);
      const distance = Number(q?.distance);
      let points = 0;
      if (subeventId === 'arrl_dx') {
        points = 3;
        const multVal = station.stationIsWVe ? facts.qCountryKey : (facts.exchangeWVeQth || facts.qCountryKey);
        if (multVal) multPerBand.add(`${facts.bandNorm}|${multVal}`);
      } else if (subeventId === 'arrl_sweepstakes') {
        points = 2;
        const multVal = facts.exchangeWVeQth || facts.exchangeRegion;
        if (multVal) multOnce.add(multVal);
      } else if (subeventId === 'arrl_10m') {
        points = facts.modeKey === 'CW' ? 4 : 2;
        const baseVals = [facts.exchangeWVeQth, facts.qCountryKey, facts.qItuZone != null ? String(facts.qItuZone) : ''].filter(Boolean);
        baseVals.forEach((value) => multPerMode[facts.modeKey].add(value));
      } else if (subeventId === 'arrl_160m') {
        points = (station.stationIsWVe && facts.qIsWVe) ? 2 : 5;
        const multVal = station.stationIsWVe ? (facts.exchangeWVeQth || facts.qCountryKey) : (facts.exchangeWVeQth || '');
        if (multVal) multOnce.add(multVal);
      } else if (subeventId === 'arrl_rtty_roundup') {
        points = 1;
        const multVal = facts.exchangeWVeQth || facts.qCountryKey;
        if (multVal) multOnce.add(multVal);
      } else if (subeventId === 'arrl_intl_digital') {
        const bonus = Number.isFinite(distance) ? Math.max(1, Math.ceil(distance / 500)) : 1;
        points = 1 + bonus;
      } else if (subeventId === 'arrl_vhf_jan_jun_sep') {
        points = arlVhfBandFactor(facts.bandNorm);
        const grid4 = firstGrid4FromFacts(facts);
        if (grid4) multPerBand.add(`${facts.bandNorm}|${grid4}`);
      } else if (subeventId === 'arrl_222_up_distance') {
        points = Number.isFinite(distance) ? Math.round(distance * arlVhfBandFactor(facts.bandNorm)) : 0;
      } else if (subeventId === 'arrl_10ghz_up') {
        points = Number.isFinite(distance) ? Math.round(distance * arlVhfBandFactor(facts.bandNorm)) : 0;
      } else if (subeventId === 'arrl_eme') {
        points = 100;
        const grid4 = firstGrid4FromFacts(facts);
        if (grid4) multPerBand.add(`${facts.bandNorm}|${grid4}`);
      } else {
        points = Number.isFinite(q?.points) ? q.points : 0;
        assumptions.add('ARRL subevent fallback to logged points because subevent pattern was not matched.');
      }
      pointsByIndex[idx] = points;
      qsoPointsTotal += points;
      markScoringRuntime(facts, runtime);
    });

    if (subeventId === 'arrl_dx') {
      multiplierTotal = multPerBand.size;
    } else if (subeventId === 'arrl_10m') {
      multiplierTotal = multPerMode.CW.size + multPerMode.SSB.size + multPerMode.DIG.size;
    } else if (subeventId === 'arrl_vhf_jan_jun_sep' || subeventId === 'arrl_eme') {
      multiplierTotal = multPerBand.size;
    } else {
      multiplierTotal = multOnce.size;
    }

    let computedScore = null;
    if (subeventId === 'arrl_intl_digital' || subeventId === 'arrl_222_up_distance') {
      computedScore = qsoPointsTotal;
    } else if (subeventId === 'arrl_10ghz_up') {
      computedScore = qsoPointsTotal + (uniqueCalls.size * 100);
      assumptions.add('ARRL 10 GHz bonus uses heuristic +100 per unique call.');
    } else if (multiplierTotal > 0) {
      computedScore = qsoPointsTotal * multiplierTotal;
    } else {
      computedScore = qsoPointsTotal;
    }

    assumptions.add('ARRL bundle scorer uses heuristic interpretation from bundled rules metadata.');
    return {
      qsoPointsTotal,
      multiplierTotal,
      computedScore,
      pointsByIndex
    };
  }

  function scoreEuVhfBundle(resolved, qsos, contestMeta, assumptions) {
    const modelId = String(resolved?.bundle?.subeventModelId || '');
    const station = buildStationScoringProfile(qsos, contestMeta);
    const runtime = makeScoringRuntime(station);
    const pointsByIndex = new Array((qsos || []).length).fill(0);
    const multPerBand = new Set();
    let qsoPointsTotal = 0;

    (qsos || []).forEach((q, idx) => {
      const facts = buildQsoScoringFacts(q, station, runtime);
      const distance = Number(q?.distance);
      let points = 0;
      if (modelId === 'distance_only') {
        points = Number.isFinite(distance) ? Math.max(0, Math.round(distance)) : 0;
      } else if (modelId === 'distance_times_multipliers') {
        points = Number.isFinite(distance) ? Math.max(1, Math.round(distance)) : 1;
        const grid4 = firstGrid4FromFacts(facts);
        if (grid4) multPerBand.add(`${facts.bandNorm}|${grid4}`);
      } else if (modelId === 'band_weighted_distance') {
        points = Number.isFinite(distance) ? Math.max(0, Math.round(distance * euVhfBandFactor(facts.bandNorm))) : 0;
      } else {
        points = Number.isFinite(q?.points) ? q.points : 0;
        assumptions.add('EU VHF bundle fallback to logged points because no subevent model matched.');
      }
      pointsByIndex[idx] = points;
      qsoPointsTotal += points;
      markScoringRuntime(facts, runtime);
    });

    const multiplierTotal = multPerBand.size;
    let computedScore = qsoPointsTotal;
    if (modelId === 'distance_times_multipliers') {
      computedScore = multiplierTotal > 0 ? (qsoPointsTotal * multiplierTotal) : qsoPointsTotal;
    }
    assumptions.add('EU VHF bundle scorer uses heuristic interpretation from bundled model hints.');
    return {
      qsoPointsTotal,
      multiplierTotal,
      computedScore,
      pointsByIndex
    };
  }

  function computeContestScoringSummary(qsos, contestMeta, context = {}) {
    const loggedPointsTotal = computeLoggedPointsTotal(qsos);
    const claimedScoreHeader = parseClaimedScoreNumber(contestMeta?.claimedScore);
    const resolved = resolveContestRuleSet(contestMeta, context);
    if (!resolved.supported) {
      return {
        supported: false,
        confidence: 'unknown',
        warning: resolved.warning || SCORING_UNKNOWN_WARNING,
        assumptions: Array.isArray(resolved.assumptions) ? resolved.assumptions : [],
        detectionMethod: resolved.detectionMethod || 'none',
        detectionValue: resolved.detectionValue || '',
        ruleId: null,
        ruleName: 'Unknown contest',
        claimedScoreHeader,
        loggedPointsTotal,
        computedQsoPointsTotal: null,
        computedMultiplierTotal: null,
        computedScore: null,
        scoreDeltaAbs: null,
        scoreDeltaPct: null,
        effectivePointsSource: loggedPointsTotal > 0 ? 'logged' : 'none',
        bundle: null,
        computedPointsByIndex: []
      };
    }
    const assumptions = new Set(Array.isArray(resolved.assumptions) ? resolved.assumptions : []);
    if (resolved.rule?.bundle === true) {
      let bundleScore = null;
      if (resolved.bundle?.type === 'arrl') {
        bundleScore = scoreArrlBundle(resolved, qsos, contestMeta, assumptions);
      } else if (resolved.bundle?.type === 'eu_vhf') {
        bundleScore = scoreEuVhfBundle(resolved, qsos, contestMeta, assumptions);
      } else {
        assumptions.add('Bundle contest matched but subevent was not detected. Logged points fallback is used.');
      }
      const computedScore = Number.isFinite(bundleScore?.computedScore) ? Math.round(bundleScore.computedScore) : null;
      const deltaAbs = (computedScore != null && Number.isFinite(claimedScoreHeader))
        ? computedScore - claimedScoreHeader
        : null;
      const deltaPct = (deltaAbs != null && Number.isFinite(claimedScoreHeader) && claimedScoreHeader !== 0)
        ? (deltaAbs / claimedScoreHeader) * 100
        : null;
      return {
        supported: true,
        confidence: resolved.confidence || 'unknown',
        warning: '',
        assumptions: Array.from(assumptions),
        detectionMethod: resolved.detectionMethod || '',
        detectionValue: resolved.detectionValue || '',
        ruleId: resolved.ruleId || '',
        ruleName: resolved.rule?.name || resolved.ruleId || '',
        claimedScoreHeader,
        loggedPointsTotal,
        computedQsoPointsTotal: Number.isFinite(bundleScore?.qsoPointsTotal) ? Math.round(bundleScore.qsoPointsTotal) : null,
        computedMultiplierTotal: Number.isFinite(bundleScore?.multiplierTotal) ? Number(bundleScore.multiplierTotal) : null,
        computedScore,
        scoreDeltaAbs: deltaAbs,
        scoreDeltaPct: deltaPct,
        effectivePointsSource: computedScore != null ? 'computed' : (loggedPointsTotal > 0 ? 'logged' : 'none'),
        bundle: resolved.bundle || null,
        computedPointsByIndex: Array.isArray(bundleScore?.pointsByIndex) ? bundleScore.pointsByIndex : []
      };
    }
    const ruleId = String(resolved.ruleId || '');
    const inPhase1 = SCORING_PHASE1_RULES.has(ruleId);
    const inPhase2 = SCORING_PHASE2_RULES.has(ruleId);
    if (!inPhase1 && !inPhase2) {
      assumptions.add(`Scorer for ${resolved.ruleId} is not enabled in current rollout.`);
      return {
        supported: true,
        confidence: resolved.confidence || 'unknown',
        warning: '',
        assumptions: Array.from(assumptions),
        detectionMethod: resolved.detectionMethod || '',
        detectionValue: resolved.detectionValue || '',
        ruleId: resolved.ruleId || '',
        ruleName: resolved.rule?.name || resolved.ruleId || '',
        claimedScoreHeader,
        loggedPointsTotal,
        computedQsoPointsTotal: null,
        computedMultiplierTotal: null,
        computedScore: null,
        scoreDeltaAbs: null,
        scoreDeltaPct: null,
        effectivePointsSource: loggedPointsTotal > 0 ? 'logged' : 'none',
        bundle: resolved.bundle || null,
        computedPointsByIndex: []
      };
    }
    if (inPhase2) {
      assumptions.add('Medium-confidence scorer active: validate assumptions against yearly published rules.');
    }
    const scored = scoreFromRule(resolved.rule, qsos, contestMeta, assumptions);
    const computedScore = Number.isFinite(scored.computedScore) ? Math.round(scored.computedScore) : null;
    const deltaAbs = (computedScore != null && Number.isFinite(claimedScoreHeader))
      ? computedScore - claimedScoreHeader
      : null;
    const deltaPct = (deltaAbs != null && Number.isFinite(claimedScoreHeader) && claimedScoreHeader !== 0)
      ? (deltaAbs / claimedScoreHeader) * 100
      : null;
    return {
      supported: true,
      confidence: resolved.confidence || 'unknown',
      warning: '',
      assumptions: Array.from(assumptions),
      detectionMethod: resolved.detectionMethod || '',
      detectionValue: resolved.detectionValue || '',
      ruleId: resolved.ruleId || '',
      ruleName: resolved.rule?.name || resolved.ruleId || '',
      claimedScoreHeader,
      loggedPointsTotal,
      computedQsoPointsTotal: Math.round(scored.pointState.qsoPointsTotal || 0),
      computedMultiplierTotal: Number(scored.multState.total || 0),
      computedScore,
      scoreDeltaAbs: deltaAbs,
      scoreDeltaPct: deltaPct,
      effectivePointsSource: computedScore != null ? 'computed' : (loggedPointsTotal > 0 ? 'logged' : 'none'),
      bundle: resolved.bundle || null,
      computedPointsByIndex: Array.isArray(scored.pointState.pointsByIndex) ? scored.pointState.pointsByIndex : []
    };
  }

  function getEffectivePointsByIndex(derived, qsos) {
    const list = Array.isArray(qsos) ? qsos : [];
    if (derived?.scoring?.effectivePointsSource === 'computed' && Array.isArray(derived?.scoring?.computedPointsByIndex) && derived.scoring.computedPointsByIndex.length === list.length) {
      return derived.scoring.computedPointsByIndex.slice();
    }
    return list.map((q) => (Number.isFinite(q?.points) ? q.points : 0));
  }

  function computeBreakSummary(minutesMap, threshold) {
    const minutes = Array.from(minutesMap.keys()).sort((a, b) => a - b);
    if (!minutes.length) return { totalBreakMin: 0, breaks: [] };
    const breaks = [];
    let totalBreakMin = 0;
    for (let i = 1; i < minutes.length; i++) {
      const gap = minutes[i] - minutes[i - 1];
      if (gap > threshold) {
        const len = gap - 1;
        totalBreakMin += len;
        breaks.push({ start: minutes[i - 1] + 1, end: minutes[i] - 1, minutes: len });
      }
    }
    return { totalBreakMin, breaks };
  }

  function gridToLatLon(grid) {
    // Maidenhead locator to lat/lon (center of square). Supports 4 or 6 chars.
    if (!grid || grid.length < 4) return null;
    const g = grid.trim().toUpperCase();
    const A = 'A'.charCodeAt(0);
    const R = 'R'.charCodeAt(0);
    const X = 'X'.charCodeAt(0);
    const lonField = g.charCodeAt(0);
    const latField = g.charCodeAt(1);
    if (lonField < A || lonField > R || latField < A || latField > R) return null;
    const lonSquare = parseInt(g[2], 10);
    const latSquare = parseInt(g[3], 10);
    if (!Number.isFinite(lonSquare) || !Number.isFinite(latSquare)) return null;
    let lon = (lonField - A) * 20 - 180 + lonSquare * 2;
    let lat = (latField - A) * 10 - 90 + latSquare * 1;
    if (g.length >= 6) {
      const lonSub = g.charCodeAt(4);
      const latSub = g.charCodeAt(5);
      if (lonSub < A || lonSub > X || latSub < A || latSub > X) return null;
      const lonMin = (lonSub - A) * (5 / 60) + (2.5 / 60);
      const latMin = (latSub - A) * (2.5 / 60) + (1.25 / 60);
      return { lat: lat + latMin, lon: lon + lonMin };
    }
    return { lat: lat + 0.5, lon: lon + 1 };
  }

  function latLonToField(lat, lon) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    const fieldLon = Math.floor((lon + 180) / 20);
    const fieldLat = Math.floor((lat + 90) / 10);
    if (fieldLon < 0 || fieldLon > 17 || fieldLat < 0 || fieldLat > 17) return null;
    const A = 'A'.charCodeAt(0);
    return String.fromCharCode(A + fieldLon) + String.fromCharCode(A + fieldLat);
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function greatCirclePoints(lat1, lon1, lat2, lon2, segments) {
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;
    const phi1 = toRad(lat1);
    const lambda1 = toRad(lon1);
    const phi2 = toRad(lat2);
    const lambda2 = toRad(lon2);
    const sinPhi1 = Math.sin(phi1);
    const cosPhi1 = Math.cos(phi1);
    const sinPhi2 = Math.sin(phi2);
    const cosPhi2 = Math.cos(phi2);
    const x1 = cosPhi1 * Math.cos(lambda1);
    const y1 = cosPhi1 * Math.sin(lambda1);
    const z1 = sinPhi1;
    const x2 = cosPhi2 * Math.cos(lambda2);
    const y2 = cosPhi2 * Math.sin(lambda2);
    const z2 = sinPhi2;
    const dot = Math.min(1, Math.max(-1, x1 * x2 + y1 * y2 + z1 * z2));
    const omega = Math.acos(dot);
    if (!Number.isFinite(omega) || omega === 0) {
      return [[lat1, lon1], [lat2, lon2]];
    }
    const sinOmega = Math.sin(omega);
    const pts = [];
    const steps = Math.max(2, segments || 24);
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const a = Math.sin((1 - t) * omega) / sinOmega;
      const b = Math.sin(t * omega) / sinOmega;
      const x = a * x1 + b * x2;
      const y = a * y1 + b * y2;
      const z = a * z1 + b * z2;
      const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
      const lon = toDeg(Math.atan2(y, x));
      pts.push([lat, lon]);
    }
    return pts;
  }

  function bearingDeg(lat1, lon1, lat2, lon2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    const brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
  }

  function firstNonNull(...vals) {
    for (const v of vals) {
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return null;
  }

  function parseZone(val) {
    const n = parseInt((val ?? '').toString().trim(), 10);
    return Number.isFinite(n) ? n : null;
  }

  function classifyCallStructure(call) {
    const m = call.match(/^([A-Z]+)(\d+)([A-Z]+)$/);
    if (!m) return 'other';
    const pre = m[1].length;
    const digits = m[2].length;
    const suf = m[3].length;
    return `${pre}x${suf}d${digits}`;
  }

  function parseOperatorsList(raw) {
    if (!raw) return [];
    const tokens = String(raw)
      .split(/[,;]+/)
      .flatMap((chunk) => chunk.split(/\s+/))
      .map((t) => t.trim())
      .filter(Boolean);
    const out = [];
    const seen = new Set();
    tokens.forEach((t) => {
      const norm = normalizeCall(t);
      if (!norm || seen.has(norm)) return;
      seen.add(norm);
      out.push(norm);
    });
    return out;
  }

  function deriveStation(qsos) {
    // Try to find station lat/lon from ADIF/Cabrillo fields: MY_GRIDSQUARE, STATION_LOC, GRID, MY_LAT/LON.
    for (const q of qsos) {
      const r = q.raw || {};
      const grids = [
        r.MY_GRIDSQUARE,
        r.STATION_LOC,
        r.GRID,
        r['GRID-LOCATOR'],
        r['HQ-GRID-LOCATOR']
      ].filter((g) => g !== undefined && g !== null && g !== '');
      for (const g of grids) {
        const loc = gridToLatLon(g);
        if (loc) return { lat: loc.lat, lon: loc.lon, source: 'grid', value: g };
      }
      if (r.MY_LAT && r.MY_LON) {
        const lat = parseFloat(r.MY_LAT);
        const lon = parseFloat(r.MY_LON);
        if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon, source: 'latlon', value: `${lat},${lon}` };
      }
    }
    const stationCall = deriveStationCallsign(qsos);
    if (stationCall) {
      const lookupGrid = getCallsignGrid(stationCall);
      if (lookupGrid) {
        const loc = gridToLatLon(lookupGrid);
        if (loc) return { lat: loc.lat, lon: loc.lon, source: 'lookup', value: lookupGrid };
      }
      const prefix = lookupPrefix(stationCall);
      if (prefix && prefix.lat != null && prefix.lon != null) {
        return { lat: prefix.lat, lon: prefix.lon, source: 'cty', value: stationCall };
      }
    }
    return null;
  }

  function deriveStationCallsign(qsos) {
    for (const q of qsos) {
      const r = q.raw || {};
      const call = firstNonNull(r.STATION_CALLSIGN, r.OPERATOR, q.op);
      const normalized = normalizeCall(call);
      if (normalized) return normalized;
    }
    return null;
  }

  function deriveRemoteLatLon(q, prefix) {
    // Prefer QSO-specific grid; fall back to lookup grid; then prefix lat/lon from cty.dat.
    if (q.grid) {
      const loc = gridToLatLon(q.grid);
      if (loc) return loc;
    }
    if (q.call) {
      const lookupGrid = getCallsignGrid(q.call);
      if (lookupGrid) {
        const loc = gridToLatLon(lookupGrid);
        if (loc) return loc;
      }
    }
    if (prefix && prefix.lat != null && prefix.lon != null) {
      return { lat: prefix.lat, lon: prefix.lon };
    }
    return null;
  }

  function makeDistanceSummary() {
    let count = 0;
    let sum = 0;
    let min = null;
    let max = null;
    const histogram = new Map(); // bucket (0-1000,1000-2000, etc) -> {count, bands:Map}
    return {
      add(d, band) {
        if (!Number.isFinite(d)) return;
        count += 1;
        sum += d;
        if (min == null || d < min) min = d;
        if (max == null || d > max) max = d;
        const bucket = Math.floor(d / 1000) * 1000;
        if (!histogram.has(bucket)) histogram.set(bucket, { count: 0, bands: new Map() });
        const entry = histogram.get(bucket);
        entry.count += 1;
        if (band) entry.bands.set(band, (entry.bands.get(band) || 0) + 1);
      },
      export() {
        const buckets = Array.from(histogram.entries()).sort((a, b) => a[0] - b[0]).map(([start, data]) => ({
          range: `${start}-${start + 999}`,
          count: data.count,
          bands: data.bands
        }));
        return {
          count,
          avg: count ? sum / count : null,
          min,
          max,
          buckets
        };
      }
    };
  }

  function makeHeadingSummary() {
    const sectors = new Map(); // 0-10, 10-20, etc
    return {
      add(b, band) {
        if (!Number.isFinite(b)) return;
        const bucket = Math.floor(b / 10) * 10;
        if (!sectors.has(bucket)) {
          sectors.set(bucket, { count: 0, bands: new Map() });
        }
        const entry = sectors.get(bucket);
        entry.count += 1;
        if (band) entry.bands.set(band, (entry.bands.get(band) || 0) + 1);
      },
      export() {
        return Array.from(sectors.entries()).sort((a, b) => a[0] - b[0]).map(([start, data]) => ({
          sector: `${String(start).padStart(3, '0')} - ${String(start + 9).padStart(3, '0')}`,
          start,
          count: data.count,
          bands: data.bands
        }));
      }
    };
  }

  function parseDateTime(dateStr, timeStr) {
    const d = (dateStr || '').trim().replace(/\D/g, '');
    const t = (timeStr || '').trim().replace(/\D/g, '');
    if (d.length !== 8) return null;
    const year = parseInt(d.slice(0, 4), 10);
    const month = parseInt(d.slice(4, 6), 10) - 1;
    const day = parseInt(d.slice(6, 8), 10);
    let hh = 0, mm = 0, ss = 0;
    if (t.length >= 2) hh = parseInt(t.slice(0, 2), 10) || 0;
    if (t.length >= 4) mm = parseInt(t.slice(2, 4), 10) || 0;
    if (t.length >= 6) ss = parseInt(t.slice(4, 6), 10) || 0;
    const ts = Date.UTC(year, month, day, hh, mm, ss);
    return Number.isNaN(ts) ? null : ts;
  }

  function normalizeCabrilloMode(mode) {
    const m = normalizeMode(mode);
    if (m === 'RY' || m === 'RTTY') return 'RTTY';
    if (m === 'PH') return 'SSB';
    return m;
  }

  function isMaidenheadGrid(token) {
    if (!token) return false;
    const t = token.trim().toUpperCase();
    return /^[A-R]{2}\d{2}([A-X]{2})?$/.test(t);
  }

  function normalizeLookupGrid(raw) {
    if (!raw) return null;
    const t = String(raw).trim().toUpperCase();
    if (!t) return null;
    if (t.length >= 6 && /^[A-R]{2}\d{2}[A-X]{2}/.test(t)) {
      return t.slice(0, 6);
    }
    if (t.length >= 4 && /^[A-R]{2}\d{2}/.test(t)) {
      return t.slice(0, 4);
    }
    return null;
  }

  function isCallsignToken(token) {
    if (!token) return false;
    const t = token.trim().toUpperCase();
    if (isMaidenheadGrid(t)) return false;
    return /[A-Z]/.test(t) && /\d/.test(t);
  }

  function isLikelyRstToken(token) {
    if (!token) return false;
    const t = String(token).trim().toUpperCase();
    if (!t) return false;
    if (/^[1-5]\d{1,2}$/.test(t)) return true;
    if (/^(5NN|5NNN)$/.test(t)) return true;
    if (/^5NN[+-]?\d*$/.test(t)) return true;
    return false;
  }

  function parseCabrilloFreqToken(token) {
    const raw = (token || '').trim();
    if (!raw) return { freqMHz: null, band: '' };
    const upper = raw.toUpperCase();
    if (upper === 'LIGHT') return { freqMHz: null, band: 'LIGHT' };

    const ghzMatch = upper.match(/^(\d+(?:\.\d+)?)\s*G(?:HZ)?$/);
    if (ghzMatch) {
      const ghz = parseFloat(ghzMatch[1]);
      if (Number.isFinite(ghz)) {
        const mhz = ghz * 1000;
        const band = parseBandFromFreq(mhz) || `${ghzMatch[1]}G`.toUpperCase();
        return { freqMHz: mhz, band };
      }
    }

    const mhzMatch = upper.match(/^(\d+(?:\.\d+)?)\s*M(?:HZ)?$/);
    if (mhzMatch) {
      const mhz = parseFloat(mhzMatch[1]);
      if (Number.isFinite(mhz)) {
        const band = parseBandFromFreq(mhz) || normalizeBandToken(raw);
        return { freqMHz: mhz, band };
      }
    }

    if (/^\d+(\.\d+)?$/.test(upper)) {
      const bandToken = bandLabelFromNumberToken(upper);
      if (bandToken) {
        return { freqMHz: null, band: bandToken };
      }
      const num = parseFloat(upper);
      if (!Number.isFinite(num)) return { freqMHz: null, band: '' };
      const mhz = num >= 1000 ? num / 1000 : num;
      const band = parseBandFromFreq(mhz) || String(num).toUpperCase();
      return { freqMHz: mhz, band };
    }

    return { freqMHz: null, band: normalizeBandToken(raw) };
  }

  function normalizeCabrilloHeaderValue(value) {
    if (Array.isArray(value)) return value.join(' ');
    return value;
  }

  function shouldParseCabrilloTxId(header) {
    const tx = String(normalizeCabrilloHeaderValue(header?.['CATEGORY-TRANSMITTER'] || '') || '').toUpperCase();
    const op = String(normalizeCabrilloHeaderValue(header?.['CATEGORY-OPERATOR'] || '') || '').toUpperCase();
    if (tx && tx !== 'ONE' && tx !== 'SINGLE') return true;
    if (op.includes('MULTI')) return true;
    return false;
  }

  function parseCabrillo(text) {
    const lines = text.split(/\r?\n/);
    const header = {};
    const qsos = [];
    const parseQsoTokens = (tokens, isQtc) => {
      if (tokens.length < 8) return;
      const freqInfo = parseCabrilloFreqToken(tokens[0]);
      const freqMHz = freqInfo.freqMHz;
      const mode = normalizeCabrilloMode(tokens[1]);
      const date = tokens[2] || '';
      const time = tokens[3] || '';
      const myCall = tokens[4] || '';
      let txId = null;
      const working = tokens.slice();
      if (working.length >= 9 && /^\d$/.test(working[working.length - 1]) && shouldParseCabrilloTxId(header)) {
        txId = working.pop();
      }

      const isVhfGrid =
        working.length >= 8 &&
        isMaidenheadGrid(working[5]) &&
        isCallsignToken(working[6]) &&
        isMaidenheadGrid(working[7]);

      if (isVhfGrid) {
        const sentGrid = working[5] || '';
        const call = working[6] || '';
        const rcvdTokens = working.slice(7).map((t) => t.trim()).filter(Boolean);
        const exchSent = sentGrid;
        const exchRcvd = rcvdTokens.join(' ').trim();
        const rcvdGrid = rcvdTokens.find((t) => isMaidenheadGrid(t));
        qsos.push({
          QSO_DATE: date,
          TIME_ON: time,
          BAND: freqInfo.band || (freqMHz ? parseBandFromFreq(freqMHz) : ''),
          MODE: mode,
          CALL: call,
          FREQ: freqMHz,
          RST_SENT: '',
          RST_RCVD: '',
          STX_STRING: exchSent,
          SRX_STRING: exchRcvd,
          MY_GRIDSQUARE: sentGrid,
          GRIDSQUARE: rcvdGrid,
          OPERATOR: myCall,
          IS_QTC: isQtc,
          TX_ID: txId
        });
        return;
      }

      // Legacy Cabrillo variant without a sent exchange token:
      // QSO: freq mode date time MYCALL DXCALL RSTSENT RSTRCVD [EXCH...]
      const hasLegacyNoSentExchange =
        working.length >= 8 &&
        isCallsignToken(working[5]) &&
        isLikelyRstToken(working[6]) &&
        isLikelyRstToken(working[7]);

      if (hasLegacyNoSentExchange) {
        const call = working[5] || '';
        const rstSent = working[6] || '';
        const rstRcvd = working[7] || '';
        const exchRcvd = working.slice(8).join(' ').trim();
        const rcvdTokens = working.slice(8).map((t) => t.trim()).filter(Boolean);
        const rcvdGrid = rcvdTokens.find((t) => isMaidenheadGrid(t));
        qsos.push({
          QSO_DATE: date,
          TIME_ON: time,
          BAND: freqInfo.band || (freqMHz ? parseBandFromFreq(freqMHz) : ''),
          MODE: mode,
          CALL: call,
          FREQ: freqMHz,
          RST_SENT: rstSent,
          RST_RCVD: rstRcvd,
          STX_STRING: '',
          SRX_STRING: exchRcvd,
          MY_GRIDSQUARE: '',
          GRIDSQUARE: rcvdGrid,
          OPERATOR: myCall,
          IS_QTC: isQtc,
          TX_ID: txId
        });
        return;
      }

      if (working.length < 9) return;
      const rstSent = working[5] || '';
      const rest = working.slice(6);
      let dxIndex = -1;
      for (let i = 0; i < rest.length; i += 1) {
        if (!isCallsignToken(rest[i])) continue;
        if (i + 1 < rest.length && isLikelyRstToken(rest[i + 1])) {
          dxIndex = i;
          break;
        }
        if (dxIndex === -1) dxIndex = i;
      }
      if (dxIndex === -1 || dxIndex + 1 >= rest.length) {
        dxIndex = Math.max(0, Math.min(1, rest.length - 2));
      }
      const exchSent = rest.slice(0, dxIndex).join(' ').trim();
      const call = rest[dxIndex] || '';
      const rstRcvd = rest[dxIndex + 1] || '';
      const exchRcvd = rest.slice(dxIndex + 2).join(' ').trim();
      const sentTokens = rest.slice(0, dxIndex).map((t) => t.trim()).filter(Boolean);
      const rcvdTokens = rest.slice(dxIndex + 2).map((t) => t.trim()).filter(Boolean);
      const sentGrid = sentTokens.find((t) => isMaidenheadGrid(t));
      const rcvdGrid = rcvdTokens.find((t) => isMaidenheadGrid(t));
      qsos.push({
        QSO_DATE: date,
        TIME_ON: time,
        BAND: freqInfo.band || (freqMHz ? parseBandFromFreq(freqMHz) : ''),
        MODE: mode,
        CALL: call,
        FREQ: freqMHz,
        RST_SENT: rstSent,
        RST_RCVD: rstRcvd,
        STX_STRING: exchSent,
        SRX_STRING: exchRcvd,
        MY_GRIDSQUARE: sentGrid,
        GRIDSQUARE: rcvdGrid,
        OPERATOR: myCall,
        IS_QTC: isQtc,
        TX_ID: txId
      });
    };
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (/^QSO:/i.test(trimmed)) {
        const tokens = trimmed.replace(/^QSO:\s*/i, '').split(/\s+/);
        parseQsoTokens(tokens, false);
      } else if (/^QTC:/i.test(trimmed)) {
        const tokens = trimmed.replace(/^QTC:\s*/i, '').split(/\s+/);
        parseQsoTokens(tokens, true);
      } else {
        const idx = trimmed.indexOf(':');
        if (idx === -1) return;
        const key = trimmed.slice(0, idx).trim().toUpperCase();
        const value = trimmed.slice(idx + 1).trim();
        if (!key) return;
        if (header[key] == null) header[key] = value;
        else if (Array.isArray(header[key])) header[key].push(value);
        else header[key] = [header[key], value];
      }
    });
    return { header, qsos };
  }

  function parseAdif(text) {
    // Minimal ADIF parser: splits on <eor> and extracts <field:length[:type]>value
    const records = [];
    const parts = text.split(/<eor>/i);
    for (const raw of parts) {
      const rec = {};
      let i = 0;
      while (i < raw.length) {
        const lt = raw.indexOf('<', i);
        if (lt === -1) break;
        const gt = raw.indexOf('>', lt);
        if (gt === -1) break;
        const header = raw.slice(lt + 1, gt);
        const [namePart, restPart] = header.split(':');
        const name = (namePart || '').trim().toUpperCase();
        const lenStr = (restPart || '').split(/[>:]/)[0];
        const len = parseInt(lenStr, 10);
        if (!name || !Number.isFinite(len) || len <= 0) {
          i = gt + 1;
          continue;
        }
        const value = raw.substr(gt + 1, len);
        rec[name] = value.trim();
        i = gt + 1 + len;
      }
      if (Object.keys(rec).length > 0) {
        records.push(rec);
      }
    }
    return records;
  }

  function parseCbf(text) {
    // Basic CBF parser: expects columns separated by semicolons or commas or tabs.
    // Typical fields (up to): DATE, TIME, CALL, BAND/FREQ, MODE, RST_SENT, RST_RCVD, EXCH_SENT, EXCH_RCVD, OPERATOR, GRIDSQUARE, CQZ, ITUZ
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0 && !l.startsWith(';'));
    const qsos = [];
    for (const line of lines) {
      // Handle comma decimal separators by replacing ',' in numbers before splitting; keep delimiter splitting on semicolon/tab.
      const cleaned = line.replace(/(\d),(?=\d)/g, '$1.');
      const parts = cleaned.split(/[\t;]+/).map((p) => p.trim());
      if (parts.length < 5) continue;
      // If still too many tokens, try comma as delimiter fallback
      const fields = parts.length >= 5 ? parts : line.split(',').map((p) => p.trim());
      const [date, time, call, bandOrFreq, mode, rstSent, rstRcvd, exchSent, exchRcvd, operator, grid, cqz, ituz] = fields;
      const freqInfo = parseCabrilloFreqToken(bandOrFreq);
      let band = freqInfo.band || normalizeBandToken(bandOrFreq);
      let freq = Number.isFinite(freqInfo.freqMHz) ? freqInfo.freqMHz : null;
      qsos.push({
        DATE: date,
        TIME: time,
        BAND: band,
        MODE: mode,
        CALL: call,
        FREQ: freq,
        RST_SENT: rstSent,
        RST_RCVD: rstRcvd,
        EXCH_SENT: exchSent,
        EXCH_RCVD: exchRcvd,
        OPERATOR: operator,
        GRIDSQUARE: grid,
        CQZ: cqz,
        ITUZ: ituz
      });
    }
    return qsos;
  }

  function parseLogFile(text, filename) {
    const lower = (filename || '').toLowerCase();
    if (lower.endsWith('.log') || lower.endsWith('.cbr') || /START-OF-LOG:/i.test(text) || /^QSO:/im.test(text)) {
      const cab = parseCabrillo(text);
      const metaRaw = cab.header || {};
      const meta = {};
      Object.keys(metaRaw).forEach((key) => {
        meta[key] = normalizeCabrilloHeaderValue(metaRaw[key]);
      });
      const sharedRaw = {
        STATION_CALLSIGN: meta.CALLSIGN || meta.CALL || null,
        CONTEST: meta.CONTEST || null,
        CATEGORY_OPERATOR: meta['CATEGORY-OPERATOR'] || null,
        CATEGORY_ASSISTED: meta['CATEGORY-ASSISTED'] || null,
        CATEGORY_POWER: meta['CATEGORY-POWER'] || null,
        CATEGORY_BAND: meta['CATEGORY-BAND'] || null,
        CATEGORY_MODE: meta['CATEGORY-MODE'] || null,
        CATEGORY_TRANSMITTER: meta['CATEGORY-TRANSMITTER'] || null,
        CATEGORY_STATION: meta['CATEGORY-STATION'] || null,
        CLUB: meta.CLUB || null,
        SOFTWARE: meta['CREATED-BY'] || null,
        CLAIMED_SCORE: meta['CLAIMED-SCORE'] || meta['CLAIMED-SCORE:'] || null,
        OPERATORS: meta.OPERATORS || null,
        GRID: meta['GRID-LOCATOR'] || meta['HQ-GRID-LOCATOR'] || null,
        MY_GRIDSQUARE: meta['GRID-LOCATOR'] || meta['HQ-GRID-LOCATOR'] || null,
        LOCATION: meta.LOCATION || null
      };
      const qsos = cab.qsos.map((r, idx) => ({
        id: idx,
        qsoNumber: idx + 1,
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, r.FREQ),
        mode: normalizeMode(r.MODE),
        freq: r.FREQ ? parseFloat(r.FREQ) : null,
        time: `${(r.QSO_DATE || '').trim()} ${(r.TIME_ON || '').trim()}`,
        ts: parseDateTime(r.QSO_DATE, r.TIME_ON),
        op: normalizeCall(r.OPERATOR || sharedRaw.STATION_CALLSIGN),
        grid: r.GRIDSQUARE,
        rstSent: r.RST_SENT,
        rstRcvd: r.RST_RCVD,
        exchSent: firstNonNull(r.STX_STRING, r.STX),
        exchRcvd: firstNonNull(r.SRX_STRING, r.SRX),
        points: parseInt(firstNonNull(r.POINTS), 10),
        srx: firstNonNull(r.SRX_STRING, r.SRX),
        stx: firstNonNull(r.STX_STRING, r.STX),
        isQtc: Boolean(r.IS_QTC),
        raw: { ...sharedRaw, ...r }
      }));
      return { type: 'CABRILLO', qsos };
    }
    if (lower.endsWith('.adi') || lower.endsWith('.adif') || /<eoh>/i.test(text) || /<eor>/i.test(text)) {
      const adifRecords = parseAdif(text);
      const qsos = adifRecords.map((r, idx) => ({
        id: idx,
        qsoNumber: idx + 1,
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, r.FREQ ? parseFloat(r.FREQ) : null),
        mode: normalizeMode(r.MODE),
        freq: r.FREQ ? parseFloat(r.FREQ) : null,
        time: `${(r.QSO_DATE || '').trim()} ${(r.TIME_ON || '').trim()}`,
        ts: parseDateTime(r.QSO_DATE, r.TIME_ON),
        op: normalizeCall(r.OPERATOR || r.STATION_CALLSIGN),
        grid: r.GRIDSQUARE,
        rstSent: r.RST_SENT,
        rstRcvd: r.RST_RCVD,
        exchSent: firstNonNull(r.STX_STRING, r.STX),
        exchRcvd: firstNonNull(r.SRX_STRING, r.SRX, r.APP_N1MM_EXCHANGE1),
        points: parseInt(firstNonNull(r.APP_N1MM_POINTS, r.QSO_PTS, r.QSO_POINTS, r.POINTS), 10),
        srx: firstNonNull(r.SRX_STRING, r.SRX),
        stx: firstNonNull(r.STX_STRING, r.STX),
        comment: r.COMMENT || r.NOTES,
        raw: r
      }));
      return { type: 'ADIF', qsos };
    }
    if (lower.endsWith('.cbf')) {
      const cbfRecords = parseCbf(text);
      const qsos = cbfRecords.map((r, idx) => ({
        id: idx,
        qsoNumber: idx + 1,
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, null),
        mode: normalizeMode(r.MODE),
        freq: null,
        time: `${(r.DATE || '').trim()} ${(r.TIME || '').trim()}`,
        ts: parseDateTime(r.DATE, r.TIME),
        op: normalizeCall(r.OPERATOR || r.STATION_CALLSIGN),
        grid: r.GRIDSQUARE,
        rstSent: r.RST_SENT,
        rstRcvd: r.RST_RCVD,
        exchSent: firstNonNull(r.EXCH_SENT, r.STX),
        exchRcvd: firstNonNull(r.EXCH_RCVD, r.SRX),
        points: parseInt(firstNonNull(r.POINTS), 10),
        srx: firstNonNull(r.EXCH_RCVD, r.SRX),
        stx: firstNonNull(r.EXCH_SENT, r.STX),
        comment: r.COMMENT || r.NOTES,
        raw: r
      }));
      return { type: 'CBF', qsos };
    }
    // Fallback: try ADIF
    const adifRecords = parseAdif(text);
    if (adifRecords.length) {
      const qsos = adifRecords.map((r, idx) => ({
        id: idx,
        qsoNumber: idx + 1,
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, r.FREQ ? parseFloat(r.FREQ) : null),
        mode: normalizeMode(r.MODE),
        freq: r.FREQ ? parseFloat(r.FREQ) : null,
        time: `${(r.QSO_DATE || '').trim()} ${(r.TIME_ON || '').trim()}`,
        ts: parseDateTime(r.QSO_DATE, r.TIME_ON),
        op: normalizeCall(r.OPERATOR || r.STATION_CALLSIGN),
        rstSent: r.RST_SENT,
        rstRcvd: r.RST_RCVD,
        exchSent: firstNonNull(r.STX_STRING, r.STX),
        exchRcvd: firstNonNull(r.SRX_STRING, r.SRX, r.APP_N1MM_EXCHANGE1),
        points: parseInt(firstNonNull(r.APP_N1MM_POINTS, r.QSO_PTS, r.QSO_POINTS, r.POINTS), 10),
        raw: r
      }));
      return { type: 'ADIF', qsos };
    }
    return { type: 'unknown', qsos: [] };
  }

  function mapSpotStatus(status) {
    if (status === 'ready') return 'ok';
    if (status === 'loading') return 'loading';
    if (status === 'error') return 'error';
    if (status === 'idle') return 'pending';
    return status || '';
  }

  function updateDataStatus() {
    const isProxy = (src) => /allorigins\.win|corsproxy\.io/i.test(src || '');
    const classifySource = (src) => {
      if (!src) return { mark: '', className: '' };
      const lower = String(src).toLowerCase();
      if (lower.includes('azure.s53m.com')) return { mark: '✓', className: 'source-local' };
      if (lower.includes('allorigins.win') || lower.includes('corsproxy.io')) return { mark: '✓', className: 'source-proxy' };
      return { mark: '', className: '' };
    };
    const formatStatus = (status, src) => {
      if (status === 'ok') return isProxy(src) ? 'OK - Ready' : 'OK';
      if (status === 'loading') return isProxy(src) ? 'proxy loading' : 'loading';
      if (status === 'error') return 'error';
      return status || '';
    };
    if (dom.ctyStatus) {
      dom.ctyStatus.textContent = formatStatus(state.ctyStatus, state.ctySource);
      dom.ctyStatus.title = [state.ctySource, state.ctyError].filter(Boolean).join(' ');
      const proxy = isProxy(state.ctySource);
      dom.ctyStatus.className = [
        'status-indicator',
        state.ctyStatus === 'ok' ? 'status-ok' : '',
        state.ctyStatus === 'loading' ? (proxy ? 'status-proxy-loading' : 'status-loading') : '',
        state.ctyStatus === 'error' ? 'status-error' : ''
      ].filter(Boolean).join(' ');
    }
    if (dom.ctySourceLabel) {
      const info = classifySource(state.ctySource);
      dom.ctySourceLabel.textContent = info.mark;
      dom.ctySourceLabel.title = state.ctySource || '';
      dom.ctySourceLabel.className = ['source-indicator', info.className].filter(Boolean).join(' ');
    }
    if (dom.masterStatus) {
      dom.masterStatus.textContent = formatStatus(state.masterStatus, state.masterSource);
      dom.masterStatus.title = [state.masterSource, state.masterError].filter(Boolean).join(' ');
      const proxy = isProxy(state.masterSource);
      dom.masterStatus.className = [
        'status-indicator',
        state.masterStatus === 'ok' ? 'status-ok' : '',
        state.masterStatus === 'loading' ? (proxy ? 'status-proxy-loading' : 'status-loading') : '',
        state.masterStatus === 'error' ? 'status-error' : ''
      ].filter(Boolean).join(' ');
    }
    if (dom.masterSourceLabel) {
      const info = classifySource(state.masterSource);
      dom.masterSourceLabel.textContent = info.mark;
      dom.masterSourceLabel.title = state.masterSource || '';
      dom.masterSourceLabel.className = ['source-indicator', info.className].filter(Boolean).join(' ');
    }
    if (dom.qthStatus) {
      dom.qthStatus.textContent = formatStatus(state.qthStatus, state.qthSource);
      dom.qthStatus.title = [state.qthSource, state.qthError].filter(Boolean).join(' ');
      const proxy = isProxy(state.qthSource);
      dom.qthStatus.className = [
        'status-indicator',
        state.qthStatus === 'ok' ? 'status-ok' : '',
        state.qthStatus === 'loading' ? (proxy ? 'status-proxy-loading' : 'status-loading') : '',
        state.qthStatus === 'error' ? 'status-error' : ''
      ].filter(Boolean).join(' ');
    }
    if (dom.qthStatusRow) {
      dom.qthStatusRow.classList.toggle('hidden', state.qthStatus === 'pending');
    }
    if (dom.qthSourceLabel) {
      const info = classifySource(state.qthSource);
      dom.qthSourceLabel.textContent = info.mark;
      dom.qthSourceLabel.title = state.qthSource || '';
      dom.qthSourceLabel.className = ['source-indicator', info.className].filter(Boolean).join(' ');
    }
    if (dom.cqApiStatus) {
      dom.cqApiStatus.textContent = formatStatus(state.cqApiStatus, state.cqApiSource);
      dom.cqApiStatus.title = [state.cqApiSource, state.cqApiError].filter(Boolean).join(' ');
      const proxy = isProxy(state.cqApiSource);
      dom.cqApiStatus.className = [
        'status-indicator',
        state.cqApiStatus === 'ok' ? 'status-ok' : '',
        state.cqApiStatus === 'loading' ? (proxy ? 'status-proxy-loading' : 'status-loading') : '',
        state.cqApiStatus === 'error' ? 'status-error' : ''
      ].filter(Boolean).join(' ');
    }
    if (dom.cqApiStatusRow) {
      dom.cqApiStatusRow.classList.toggle('hidden', state.cqApiStatus === 'pending');
    }
    if (dom.cqApiSourceLabel) {
      const info = classifySource(state.cqApiSource);
      dom.cqApiSourceLabel.textContent = info.mark;
      dom.cqApiSourceLabel.title = state.cqApiSource || '';
      dom.cqApiSourceLabel.className = ['source-indicator', info.className].filter(Boolean).join(' ');
    }
    if (dom.spotsStatus) {
      const spotsState = ensureSpotsState(state);
      const status = mapSpotStatus(spotsState.status);
      dom.spotsStatus.textContent = formatStatus(status, SPOTS_BASE_URL);
      dom.spotsStatus.title = SPOTS_BASE_URL;
      const proxy = isProxy(SPOTS_BASE_URL);
      dom.spotsStatus.className = [
        'status-indicator',
        status === 'ok' ? 'status-ok' : '',
        status === 'loading' ? (proxy ? 'status-proxy-loading' : 'status-loading') : '',
        status === 'error' ? 'status-error' : ''
      ].filter(Boolean).join(' ');
    }
    if (dom.spotsSourceLabel) {
      const info = classifySource(SPOTS_BASE_URL);
      dom.spotsSourceLabel.textContent = info.mark;
      dom.spotsSourceLabel.title = SPOTS_BASE_URL;
      dom.spotsSourceLabel.className = ['source-indicator', info.className].filter(Boolean).join(' ');
    }
    if (dom.rbnStatus) {
      const rbnState = ensureRbnState(state);
      const status = mapSpotStatus(rbnState.status);
      dom.rbnStatus.textContent = formatStatus(status, RBN_PROXY_URL);
      dom.rbnStatus.title = RBN_PROXY_URL;
      const proxy = isProxy(RBN_PROXY_URL);
      dom.rbnStatus.className = [
        'status-indicator',
        status === 'ok' ? 'status-ok' : '',
        status === 'loading' ? (proxy ? 'status-proxy-loading' : 'status-loading') : '',
        status === 'error' ? 'status-error' : ''
      ].filter(Boolean).join(' ');
    }
    if (dom.rbnSourceLabel) {
      const info = classifySource(RBN_PROXY_URL);
      dom.rbnSourceLabel.textContent = info.mark;
      dom.rbnSourceLabel.title = RBN_PROXY_URL;
      dom.rbnSourceLabel.className = ['source-indicator', info.className].filter(Boolean).join(' ');
    }
    if (dom.spotHunterStatus) {
      const status = mapSpotStatus(state.spotHunterStatus);
      dom.spotHunterStatus.textContent = formatStatus(status, state.spotHunterSource);
      dom.spotHunterStatus.title = [state.spotHunterSource, state.spotHunterError].filter(Boolean).join(' ');
      const proxy = isProxy(state.spotHunterSource);
      dom.spotHunterStatus.className = [
        'status-indicator',
        status === 'ok' ? 'status-ok' : '',
        status === 'loading' ? (proxy ? 'status-proxy-loading' : 'status-loading') : '',
        status === 'error' ? 'status-error' : ''
      ].filter(Boolean).join(' ');
    }
    if (dom.spotHunterSourceLabel) {
      const info = classifySource(state.spotHunterSource);
      dom.spotHunterSourceLabel.textContent = info.mark;
      dom.spotHunterSourceLabel.title = state.spotHunterSource || '';
      dom.spotHunterSourceLabel.className = ['source-indicator', info.className].filter(Boolean).join(' ');
    }
    if (dom.spotHunterStatusRow) {
      dom.spotHunterStatusRow.classList.toggle('hidden', state.spotHunterStatus === 'pending');
    }
  }

  function isSupportedLogFile(file) {
    const name = (file && file.name) ? file.name.toLowerCase() : '';
    const ext = name.includes('.') ? name.split('.').pop() : '';
    return LOG_EXTENSIONS.has(ext);
  }

  function showInvalidFileAlert(message) {
    window.alert(message);
  }

  async function loadLogFile(file, slotId, statusEl, sourceLabel) {
    if (!file) return;
    if (!isSupportedLogFile(file)) {
      if (statusEl) statusEl.textContent = `Unsupported file type. Please use ${LOG_EXTENSIONS_LABEL}.`;
      showInvalidFileAlert(`Invalid file type. Please upload ${LOG_EXTENSIONS_LABEL}.`);
      return;
    }
    try {
      const text = await file.text();
      const parsed = applyLoadedLogToSlot(slotId, text, file.name, file.size, sourceLabel || 'Uploaded', statusEl);
      if (parsed && parsed.type === 'unknown') {
        showInvalidFileAlert('Invalid log file. The format could not be recognized.');
      } else if (parsed && parsed.qsos && parsed.qsos.length === 0) {
        showInvalidFileAlert('No QSOs parsed. Check that the file is a valid ADIF or CBF log.');
      }
    } catch (err) {
      console.error('File parse failed:', err);
      if (statusEl) {
        statusEl.textContent = `Failed to parse ${file.name}: ${err && err.message ? err.message : 'unknown error'}`;
      }
      showInvalidFileAlert('Failed to read the log file. Please try a different file.');
    }
  }

  function setupFileDropZone(dropEl, statusEl, slotId) {
    if (!dropEl) return;
    const prevent = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
    };
    const highlight = () => dropEl.classList.add('drag-over');
    const unhighlight = () => dropEl.classList.remove('drag-over');
    ['dragenter', 'dragover'].forEach((evtName) => {
      dropEl.addEventListener(evtName, (evt) => {
        prevent(evt);
        highlight();
        if (evt.dataTransfer) evt.dataTransfer.dropEffect = 'copy';
      });
    });
    ['dragleave', 'dragend'].forEach((evtName) => {
      dropEl.addEventListener(evtName, (evt) => {
        prevent(evt);
        unhighlight();
      });
    });
    dropEl.addEventListener('drop', async (evt) => {
      prevent(evt);
      unhighlight();
      const [file] = evt.dataTransfer?.files || [];
      if (!file) return;
      if (statusEl) statusEl.textContent = `Loading ${file.name}...`;
      setSlotAction(slotId, 'upload');
      await loadLogFile(file, slotId, statusEl, 'Dropped');
    });
  }

  function setupFileInput(inputEl, statusEl, slotId) {
    if (!inputEl) return;
    inputEl.addEventListener('change', async (evt) => {
      const [file] = evt.target.files || [];
      if (!file) return;
      if (statusEl) statusEl.textContent = `Loading ${file.name}...`;
      setSlotAction(slotId, 'upload');
      await loadLogFile(file, slotId, statusEl, 'Uploaded');
    });
    const dropEl = inputEl.closest('.drop-zone');
    if (dropEl) setupFileDropZone(dropEl, statusEl, slotId);
  }

  function buildQsoLiteArray(qsos) {
    return (qsos || []).map((q, idx) => ({
      i: idx,
      call: q.call || '',
      grid: q.grid || '',
      band: q.band || '',
      mode: q.mode || '',
      country: q.country || '',
      continent: q.continent || '',
      cqZone: q.cqZone,
      ituZone: q.ituZone,
      qsoNumber: q.qsoNumber,
      ts: q.ts,
      bearing: q.bearing,
      distance: q.distance,
      callCount: q.callCount
    }));
  }

  function ensureSlotQsoLite(slot) {
    if (!slot || !slot.qsoData || !Array.isArray(slot.qsoData.qsos)) return;
    if (!slot.qsoLite || slot.qsoLite.length !== slot.qsoData.qsos.length) {
      slot.qsoLite = buildQsoLiteArray(slot.qsoData.qsos);
    }
  }

  function applyLoadedLogToSlot(slotId, text, filename, size, sourceLabel, statusEl, sourcePath) {
    const safeSize = Number.isFinite(size) ? size : text.length;
    const slotKey = String(slotId || 'A').toUpperCase();
    const target = getSlotById(slotId);
    if (!target) return null;
    target.skipped = false;
    target.spotsState = createSpotsState();
    target.rbnState = createRbnState();
    target.apiEnrichment = createApiEnrichmentState();
    const reconstructed = typeof sourcePath === 'string' && sourcePath.startsWith('RECONSTRUCTED_LOGS/');
    target.logFile = { name: filename, size: safeSize, source: sourceLabel || '' };
    if (sourcePath) target.logFile.path = sourcePath;
    if (reconstructed) target.logFile.reconstructed = true;
    target.logPage = 0;
    if (target === state) {
      state.notInMasterPage = 0;
      state.allCallsignsCountryFilter = '';
      state.competitorCoach = createCompetitorCoachState(state.competitorCoach);
    }
    const statusTarget = statusEl || getStatusElBySlot(slotId);
    if (statusTarget) statusTarget.textContent = `Loaded ${filename} (${formatNumberSh6(safeSize)} bytes)`;
    target.rawLogText = text;
    target.qsoData = parseLogFile(text, filename);
    queueCallsignGridLookup(target.qsoData.qsos);
    target.derived = buildDerived(target.qsoData.qsos, { logFile: target.logFile });
    target.qsoLite = buildQsoLiteArray(target.qsoData.qsos);
    target.fullQsoData = target.qsoData;
    target.fullDerived = target.derived;
    target.bandDerivedCache = new Map();
    target.logVersion = (target.logVersion || 0) + 1;
    if (target === state) {
      if (state.kmzUrls) {
        Object.values(state.kmzUrls).forEach((url) => {
          try {
            URL.revokeObjectURL(url);
          } catch (err) {
            /* ignore revoke failures */
          }
        });
      }
      state.kmzUrls = {};
    }
    if (!target.qsoData.qsos.length) {
      if (statusTarget) statusTarget.textContent = `Loaded ${filename} (${formatNumberSh6(safeSize)} bytes) – parsed 0 QSOs. Check file format.`;
    } else if (statusTarget) {
      statusTarget.textContent = `Loaded ${filename} (${formatNumberSh6(safeSize)} bytes) – parsed ${formatNumberSh6(target.qsoData.qsos.length)} QSOs as ${target.qsoData.type}`;
    }
    updateSlotStatus(slotId);
    if (sourceLabel === 'Archive') {
      const pathLabel = formatArchiveBreadcrumb(sourcePath || '');
      setArchiveCompact(slotId, true, pathLabel);
    } else {
      setArchiveCompact(slotId, false);
    }
    trackEvent('upload_log', {
      log_slot: slotId || 'A',
      source: sourceLabel || 'unknown',
      file_name: filename || '',
      qso_count: target.qsoData.qsos.length || 0,
      log_type: target.qsoData.type || ''
    });
    invalidateCompareLogData();
    updateBandRibbon();
    rebuildReports();
    setActiveReport(state.activeIndex);
    updateLoadSummary();
    if (Array.isArray(state.sessionNotice) && state.sessionNotice.length) {
      const tag = `slot ${String(slotId || '').toUpperCase()}`;
      state.sessionNotice = state.sessionNotice.filter((msg) => !String(msg).toLowerCase().includes(tag.toLowerCase()));
    }
    triggerCqApiEnrichmentForSlot(target, slotKey);
    return target.qsoData;
  }

  function getFirstAvailableSlotId() {
    const active = getActiveCompareSlots();
    for (const entry of active) {
      if (!entry.slot?.qsoData && !entry.slot?.skipped) return entry.id;
    }
    return null;
  }

  function showDropReplacePrompt(file) {
    if (!dom.dropReplace || !dom.dropReplaceActions) return false;
    pendingDropFile = file;
    const active = getActiveCompareSlots();
    const buttons = active.map((entry) => (
      `<button type="button" class="button" data-slot="${escapeAttr(entry.id)}">Replace ${escapeHtml(entry.label)}</button>`
    ));
    dom.dropReplaceActions.innerHTML = buttons.join('');
    dom.dropReplace.classList.add('active');
    dom.dropReplace.setAttribute('aria-hidden', 'false');
    return true;
  }

  function hideDropReplacePrompt() {
    pendingDropFile = null;
    if (!dom.dropReplace) return;
    dom.dropReplace.classList.remove('active');
    dom.dropReplace.setAttribute('aria-hidden', 'true');
  }

  function setupDropReplacePrompt() {
    if (!dom.dropReplace || !dom.dropReplaceActions) return;
    dom.dropReplaceActions.addEventListener('click', (evt) => {
      const target = evt.target instanceof HTMLElement ? evt.target.closest('button') : null;
      if (!target || !pendingDropFile) return;
      const slotId = target.dataset.slot || 'A';
      hideDropReplacePrompt();
      setSlotAction(slotId, 'upload');
      loadLogFile(pendingDropFile, slotId, getStatusElBySlot(slotId), 'Dropped');
    });
    if (dom.dropReplaceCancel) {
      dom.dropReplaceCancel.addEventListener('click', (evt) => {
        evt.preventDefault();
        hideDropReplacePrompt();
      });
    }
  }

  function setupGlobalDragOverlay() {
    if (!dom.dragOverlay) return;
    let depth = 0;
    const hasFiles = (evt) => {
      const types = evt.dataTransfer && evt.dataTransfer.types;
      return types ? Array.from(types).includes('Files') : false;
    };
    const show = () => dom.dragOverlay.classList.add('active');
    const hide = () => dom.dragOverlay.classList.remove('active');
    const maybeRevealLoadPanel = () => {
      const active = reports[state.activeIndex];
      if (active && active.id === 'load_logs') {
        state.showLoadPanel = true;
        document.body.classList.remove('landing-only');
        if (dom.loadPanel) dom.loadPanel.style.display = 'block';
      }
    };

    document.addEventListener('dragenter', (evt) => {
      if (!hasFiles(evt)) return;
      depth += 1;
      show();
    });
    document.addEventListener('dragover', (evt) => {
      if (!hasFiles(evt)) return;
      evt.preventDefault();
      if (evt.dataTransfer) evt.dataTransfer.dropEffect = 'copy';
      show();
    });
    document.addEventListener('dragleave', (evt) => {
      if (!hasFiles(evt)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) hide();
    });
    document.addEventListener('drop', (evt) => {
      if (!hasFiles(evt)) return;
      evt.preventDefault();
      depth = 0;
      hide();
      const [file] = evt.dataTransfer?.files || [];
      if (!file) return;
      maybeRevealLoadPanel();
      const slotId = getFirstAvailableSlotId();
      if (!slotId) {
        showDropReplacePrompt(file);
        return;
      }
      setSlotAction(slotId, 'upload');
      loadLogFile(file, slotId, getStatusElBySlot(slotId), 'Dropped');
    });
  }

  function setupDataFileInputs() {
    if (dom.ctyInput) {
      dom.ctyInput.addEventListener('change', async (evt) => {
        const [file] = evt.target.files || [];
        if (!file) return;
        try {
          const text = await file.text();
          const table = parseCtyDat(text);
          if (!table || !table.length) {
            state.ctyTable = null;
            state.prefixCache = new Map();
            state.ctyStatus = 'error';
            state.ctyError = 'Parsed 0 prefixes from cty.dat';
            state.ctySource = 'local upload';
          } else {
            state.ctyDat = text;
            state.ctyTable = table;
            state.prefixCache = new Map();
            state.ctyStatus = 'ok';
            state.ctyError = null;
            state.ctySource = 'local upload';
            recomputeDerived('cty');
          }
        } catch (err) {
          state.ctyTable = null;
          state.prefixCache = new Map();
          state.ctyStatus = 'error';
          state.ctyError = err && err.message ? err.message : 'Load failed';
          state.ctySource = 'local upload';
        }
        updateDataStatus();
      });
    }
    if (dom.masterInput) {
      dom.masterInput.addEventListener('change', async (evt) => {
        const [file] = evt.target.files || [];
        if (!file) return;
        try {
          const text = await file.text();
          const set = parseMasterDta(text);
          if (!set || set.size === 0) {
            state.masterSet = null;
            state.masterStatus = 'error';
            state.masterError = 'Parsed 0 calls from MASTER.DTA';
            state.masterSource = 'local upload';
          } else {
            state.masterDta = text;
            state.masterSet = set;
            state.masterStatus = 'ok';
            state.masterError = null;
            state.masterSource = 'local upload';
            recomputeDerived('master');
          }
        } catch (err) {
          state.masterSet = null;
          state.masterStatus = 'error';
          state.masterError = err && err.message ? err.message : 'Load failed';
          state.masterSource = 'local upload';
        }
        updateDataStatus();
      });
    }
  }

  function recomputeDerived(reason) {
    if (state.qsoData) {
      state.derived = buildDerived(state.qsoData.qsos, { logFile: state.logFile });
      state.qsoLite = buildQsoLiteArray(state.qsoData.qsos);
      state.fullQsoData = state.qsoData;
      state.fullDerived = state.derived;
      state.bandDerivedCache = new Map();
      state.logVersion = (state.logVersion || 0) + 1;
    }
    state.compareSlots.forEach((slot) => {
      if (slot && slot.qsoData) {
        slot.derived = buildDerived(slot.qsoData.qsos, { logFile: slot.logFile });
        slot.qsoLite = buildQsoLiteArray(slot.qsoData.qsos);
        slot.fullQsoData = slot.qsoData;
        slot.fullDerived = slot.derived;
        slot.bandDerivedCache = new Map();
        slot.logVersion = (slot.logVersion || 0) + 1;
      }
    });
    const hasAny = state.qsoData || state.compareSlots.some((slot) => slot && slot.qsoData);
    if (!hasAny) return;
    state.competitorCoach = createCompetitorCoachState(state.competitorCoach);
    invalidateCompareLogData();
    updateBandRibbon();
    rebuildReports();
    renderActiveReport();
  }

  function shouldBandFilterReport(reportId) {
    if (!state.globalBandFilter) return false;
    const excluded = new Set([
      'kmz_files',
      'comments',
      'sh6_info',
      'competitor_coach'
    ]);
    return !excluded.has(reportId);
  }

  function getBandFilteredQsos(band) {
    const source = state.fullQsoData?.qsos || state.qsoData?.qsos || [];
    return source.filter((q) => q.band && q.band.toUpperCase() === band);
  }

  function getBandFilteredQsosFrom(qsos, band) {
    if (!band) return qsos || [];
    const key = String(band).toUpperCase();
    return (qsos || []).filter((q) => q.band && q.band.toUpperCase() === key);
  }

  function withBandContext(reportId, fn) {
    if (!state.globalBandFilter || !shouldBandFilterReport(reportId)) return fn();
    const band = state.globalBandFilter;
    const cache = state.bandDerivedCache || new Map();
    if (!state.bandDerivedCache) state.bandDerivedCache = cache;
    let derived = cache.get(band);
    let qsos;
    if (!derived) {
      qsos = getBandFilteredQsos(band);
      derived = buildDerived(qsos, { logFile: state.logFile, sourcePath: state.logFile?.path || '' });
      cache.set(band, derived);
    } else {
      qsos = getBandFilteredQsos(band);
    }
    const prevQso = state.qsoData;
    const prevDerived = state.derived;
    state.qsoData = { ...(state.fullQsoData || prevQso), qsos };
    state.derived = derived;
    const out = fn();
    state.qsoData = prevQso;
    state.derived = prevDerived;
    return out;
  }

  async function fetchResource(url, onStatus) {
    try {
      onStatus('loading');
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      onStatus('ok');
      return text;
    } catch (err) {
      console.error('Fetch failed:', url, err);
      onStatus('error');
      return { error: err.message || 'Load failed' };
    }
  }

  async function fetchWithFallback(urls, onStatus) {
    let lastError = null;
    for (const url of urls) {
      const res = await fetchResource(url, (status) => onStatus(status, url));
      if (res && typeof res === 'object' && res.error) {
        lastError = res.error;
        continue;
      }
      return { text: res, url };
    }
    return { error: lastError || 'All sources failed' };
  }

  const archiveCrc32Table = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i += 1) {
      let c = i;
      for (let k = 0; k < 8; k += 1) {
        c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
      }
      table[i] = c >>> 0;
    }
    return table;
  })();

  function archiveCrc32(value) {
    const text = String(value || '');
    let c = 0xffffffff;
    for (let i = 0; i < text.length; i += 1) {
      c = archiveCrc32Table[(c ^ text.charCodeAt(i)) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function getArchiveShardUrlsForCallsign(callsign) {
    const normalized = normalizeCall(callsign);
    if (!normalized) return [];
    const bucket = archiveCrc32(normalized) & 0xff;
    const shard = bucket.toString(16).padStart(2, '0');
    const suffix = `logs_${shard}.sqlite?v=${encodeURIComponent(APP_VERSION)}`;
    return [
      `${ARCHIVE_SHARD_BASE_RAW}/${suffix}`,
      `${ARCHIVE_SHARD_BASE}/${suffix}`
    ];
  }

  function normalizeArchiveModeToken(value) {
    const raw = String(value || '').trim().toUpperCase();
    if (!raw) return '';
    if (raw === 'SSB' || raw === 'PHONE') return 'PH';
    if (raw === 'RY') return 'RTTY';
    return raw;
  }

  function normalizeArchiveContestToken(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, '');
  }

  function withTimeoutPromise(promise, ms, label = 'Operation') {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`${label} timed out after ${ms}ms`));
      }, Math.max(1000, Number(ms) || 1000));
      promise.then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      }).catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
    });
  }

  async function loadArchiveSqlJs() {
    if (archiveSqlLoader) return archiveSqlLoader;
    archiveSqlLoader = (async () => {
      if (typeof window.initSqlJs === 'function') {
        archiveSqlBaseUrl = archiveSqlBaseUrl || SQLJS_BASE_URLS[0];
        return window.initSqlJs({ locateFile: (file) => `${archiveSqlBaseUrl}${file}` });
      }
      let lastErr = null;
      for (const base of SQLJS_BASE_URLS) {
        try {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `${base}sql-wasm.js`;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${base}sql-wasm.js`));
            document.head.appendChild(script);
          });
          if (typeof window.initSqlJs === 'function') {
            archiveSqlBaseUrl = base;
            return window.initSqlJs({ locateFile: (file) => `${base}${file}` });
          }
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr || new Error('sql.js not loaded.');
    })();
    return archiveSqlLoader;
  }

  async function openArchiveShardDbForCallsign(callsign) {
    const shardUrls = getArchiveShardUrlsForCallsign(callsign);
    if (!shardUrls.length) throw new Error('Invalid callsign');
    const cacheKey = shardUrls.join('|');
    if (archiveShardDbCache.has(cacheKey)) return archiveShardDbCache.get(cacheKey);
    const SQL = await loadArchiveSqlJs();
    let lastErr = null;
    for (const url of shardUrls) {
      try {
        const response = await withTimeoutPromise(fetch(url, { cache: 'no-store' }), 20000, 'Archive shard download');
        if (!response.ok) throw new Error(`Shard download failed: HTTP ${response.status}`);
        const buffer = await withTimeoutPromise(response.arrayBuffer(), 20000, 'Archive shard read');
        const db = new SQL.Database(new Uint8Array(buffer));
        archiveShardDbCache.set(cacheKey, db);
        return db;
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error('Archive shard download failed');
  }

  async function queryArchiveRowsByCallsign(callsign) {
    const normalized = normalizeCall(callsign);
    if (!normalized) return [];
    if (archiveRowsByCallCache.has(normalized)) return archiveRowsByCallCache.get(normalized);
    const db = await openArchiveShardDbForCallsign(normalized);
    const stmt = db.prepare('SELECT path, contest, year, mode, season FROM logs WHERE callsign = ?');
    stmt.bind([normalized]);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    archiveRowsByCallCache.set(normalized, rows);
    return rows;
  }

  function pickArchiveHistoryMatch(rows, request) {
    const contestKey = normalizeArchiveContestToken(request?.contestId);
    const modeKey = normalizeArchiveModeToken(request?.mode);
    const year = Number(request?.year);
    const call = normalizeCall(request?.callsign || '');
    if (!contestKey || !Number.isFinite(year) || !call) return null;

    const scored = (rows || [])
      .map((row) => {
        const path = String(row?.path || '');
        const rowContest = normalizeArchiveContestToken(row?.contest);
        const rowYear = Number(row?.year);
        const rowMode = normalizeArchiveModeToken(row?.mode);
        const isReconstructed = /^RECONSTRUCTED_LOGS\//i.test(path);
        const baseName = path.split('/').pop() || '';
        const fileCall = normalizeCall(baseName.replace(/\.[^.]+$/, ''));
        const fileCallMatch = fileCall && fileCall === call;
        let score = 0;
        if (rowContest === contestKey) score += 100;
        if (rowYear === year) score += 80;
        if (modeKey) {
          if (rowMode === modeKey) score += 20;
          else if (!rowMode) score += 8;
          else score -= 30;
        }
        if (!isReconstructed) score += 12;
        if (fileCallMatch) score += 6;
        return {
          row,
          score,
          path,
          rowMode,
          isReconstructed,
          fileCallMatch
        };
      })
      .filter((entry) => Number(entry?.score) > 0)
      .filter((entry) => normalizeArchiveContestToken(entry.row?.contest) === contestKey)
      .filter((entry) => Number(entry.row?.year) === year);

    if (!scored.length) return null;
    scored.sort((a, b) => (
      b.score - a.score
      || Number(a.isReconstructed) - Number(b.isReconstructed)
      || Number(b.fileCallMatch) - Number(a.fileCallMatch)
      || a.path.length - b.path.length
      || a.path.localeCompare(b.path)
    ));
    return scored[0].row || null;
  }

  function ensureCompareCountForSlot(slotId) {
    const key = String(slotId || '').toUpperCase();
    const needed = key === 'B' ? 2 : key === 'C' ? 3 : key === 'D' ? 4 : 1;
    if (state.compareCount < needed) {
      setCompareCount(needed, true);
    }
  }

  async function loadCqApiHistoryArchiveToSlot(request) {
    const slotId = String(request?.slotId || '').toUpperCase();
    if (!COMPARE_SLOT_IDS.includes(slotId)) throw new Error('Invalid target compare slot');
    const callsign = normalizeCall(request?.callsign || '');
    const contestId = String(request?.contestId || '').trim().toUpperCase();
    const mode = String(request?.mode || '').trim().toLowerCase();
    const year = Number(request?.year);
    if (!callsign || !contestId || !mode || !Number.isFinite(year)) {
      throw new Error('Missing callsign, contest, mode, or year');
    }

    const rows = await queryArchiveRowsByCallsign(callsign);
    const match = pickArchiveHistoryMatch(rows, { callsign, contestId, mode, year });
    if (!match?.path) {
      throw new Error(`No archive log found for ${callsign} ${contestId} ${year}`);
    }

    const downloaded = await fetchArchiveLogText(match.path);
    if (!downloaded?.text) throw new Error(`Failed to download archive log ${match.path}`);

    ensureCompareCountForSlot(slotId);
    setSlotAction(slotId, 'archive');
    const fileName = String(match.path).split('/').pop() || `${callsign}.log`;
    applyLoadedLogToSlot(
      slotId,
      downloaded.text,
      fileName,
      downloaded.text.length,
      'Archive',
      getStatusElBySlot(slotId),
      match.path
    );
    return {
      slotId,
      path: match.path,
      source: downloaded.source || ''
    };
  }

  async function fetchArchiveLogText(path) {
    if (!path) return null;
    const urls = [];
    const primary = `${ARCHIVE_BASE_URL}/${path}`;
    urls.push(primary);
    ARCHIVE_BRANCHES.forEach((branch) => {
      const rawUrl = `https://raw.githubusercontent.com/s53zo/Hamradio-Contest-logs-Archives/${branch}/${path}`;
      if (!urls.includes(rawUrl)) urls.push(rawUrl);
    });
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const text = await res.text();
          return { text, source: url };
        }
      } catch (err) {
        /* ignore and try next */
      }
    }
    return null;
  }

  function getCallsignGridCache() {
    if (!state.callsignGridCache) state.callsignGridCache = new Map();
    return state.callsignGridCache;
  }

  function getCallsignGrid(call) {
    const key = normalizeCall(call);
    if (!key) return null;
    const cache = getCallsignGridCache();
    if (!cache.has(key)) return null;
    return cache.get(key) || null;
  }

  function setCallsignGridMissing(calls) {
    const cache = getCallsignGridCache();
    (calls || []).forEach((call) => {
      const key = normalizeCall(call);
      if (key) cache.set(key, null);
    });
  }

  function applyCallsignLookupPayload(data) {
    const cache = getCallsignGridCache();
    if (Array.isArray(data?.rows)) {
      data.rows.forEach((row) => {
        if (!row || row.length < 2) return;
        const call = normalizeCall(row[0]);
        const grid = normalizeLookupGrid(row[1]);
        if (!call) return;
        cache.set(call, isMaidenheadGrid(grid) ? grid : null);
      });
    }
    if (Array.isArray(data?.missing)) {
      data.missing.forEach((call) => {
        const key = normalizeCall(call);
        if (key) cache.set(key, null);
      });
    }
  }

  function partitionLookupCalls(calls) {
    const chunks = [];
    let current = [];
    for (const rawCall of calls || []) {
      const call = normalizeCall(rawCall);
      if (!call) continue;
      current.push(call);
      const bytes = JSON.stringify({ calls: current }).length;
      if (bytes > CALLSIGN_LOOKUP_MAX_BATCH_BYTES && current.length > 1) {
        const last = current.pop();
        if (current.length) chunks.push(current);
        current = [last];
      }
      if (current.length >= CALLSIGN_LOOKUP_BATCH) {
        chunks.push(current);
        current = [];
      }
    }
    if (current.length) chunks.push(current);
    return chunks;
  }

  async function postCallsignLookup(url, calls) {
    const payload = JSON.stringify({ calls });
    const doRequest = async () => {
      const now = Date.now();
      const minGap = Number(CALLSIGN_LOOKUP_MIN_GAP_MS) || 0;
      const waitMs = Math.max(0, (callsignLookupLastRequestTs + minGap) - now);
      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
      callsignLookupLastRequestTs = Date.now();
      const ctl = (typeof AbortController === 'function') ? new AbortController() : null;
      const timer = ctl ? setTimeout(() => ctl.abort(), CALLSIGN_LOOKUP_TIMEOUT_MS) : null;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          signal: ctl ? ctl.signal : undefined
        });
        const text = await res.text();
        let data = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch (err) {
          return { ok: false, status: res.status, data: null, error: `Invalid JSON (HTTP ${res.status})` };
        }
        if (!res.ok) {
          const message = String(data?.status_message || data?.message || `HTTP ${res.status}`).trim();
          return { ok: false, status: res.status, data, error: message || `HTTP ${res.status}` };
        }
        return { ok: true, status: res.status, data, error: '' };
      } catch (err) {
        return { ok: false, status: 0, data: null, error: err && err.message ? err.message : 'Lookup request failed' };
      } finally {
        if (timer) clearTimeout(timer);
      }
    };

    let result = null;
    for (let attempt = 1; attempt <= CALLSIGN_LOOKUP_MAX_ATTEMPTS; attempt += 1) {
      // eslint-disable-next-line no-await-in-loop
      result = await doRequest();
      if (result.ok) return result;
      const status = Number(result.status);
      const retryable = CALLSIGN_LOOKUP_RETRYABLE_STATUSES.has(status);
      if (!retryable || attempt >= CALLSIGN_LOOKUP_MAX_ATTEMPTS) break;
      const waitMs = (status === 429)
        ? CALLSIGN_LOOKUP_RETRY_DELAY_MS
        : Math.min(5000, 450 * (2 ** (attempt - 1)));
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    return result || { ok: false, status: 0, data: null, error: 'Lookup request failed' };
  }

  async function fetchCallsignGridBatchViaUrl(url, calls) {
    if (!calls || !calls.length) return { ok: true, warning: '' };
    const uniqueCalls = dedupeValues(calls.map((call) => normalizeCall(call)).filter(Boolean));
    const chunks = partitionLookupCalls(uniqueCalls);
    let warnings = [];
    for (const chunk of chunks) {
      // eslint-disable-next-line no-await-in-loop
      const res = await postCallsignLookup(url, chunk);
      if (res.ok) {
        applyCallsignLookupPayload(res.data);
        continue;
      }
      const status = Number(res.status);
      const canSplit = CALLSIGN_LOOKUP_SPLIT_STATUSES.has(status) && chunk.length > 1;
      if (canSplit) {
        const mid = Math.floor(chunk.length / 2);
        const left = chunk.slice(0, mid);
        const right = chunk.slice(mid);
        // eslint-disable-next-line no-await-in-loop
        const leftResult = await fetchCallsignGridBatchViaUrl(url, left);
        // eslint-disable-next-line no-await-in-loop
        const rightResult = await fetchCallsignGridBatchViaUrl(url, right);
        if (!leftResult.ok || !rightResult.ok) {
          return { ok: false, warning: [leftResult.warning, rightResult.warning].filter(Boolean).join(' | '), error: res.error || `HTTP ${status}` };
        }
        if (leftResult.warning) warnings.push(leftResult.warning);
        if (rightResult.warning) warnings.push(rightResult.warning);
        continue;
      }
      if (CALLSIGN_LOOKUP_SPLIT_STATUSES.has(status) && chunk.length === 1) {
        const markMissing = status === 400 || status === 413 || status === 414 || status === 431;
        if (markMissing) {
          setCallsignGridMissing(chunk);
          warnings.push(`Lookup skipped for ${chunk[0]} (${res.error || `HTTP ${status}`})`);
          continue;
        }
        return { ok: false, warning: warnings.join(' | '), error: res.error || `HTTP ${status || 0}` };
      }
      return { ok: false, warning: warnings.join(' | '), error: res.error || `HTTP ${status || 0}` };
    }
    return { ok: true, warning: warnings.join(' | ') };
  }

  async function fetchCallsignGridBatch(calls) {
    if (!calls || !calls.length) return { ok: true, warning: '' };
    try {
      let lastError = '';
      let warnings = [];
      for (const url of CALLSIGN_LOOKUP_URLS) {
        // eslint-disable-next-line no-await-in-loop
        const result = await fetchCallsignGridBatchViaUrl(url, calls);
        if (result.ok) {
          state.qthSource = url;
          if (result.warning) warnings.push(result.warning);
          return { ok: true, warning: warnings.join(' | ') };
        }
        if (result.warning) warnings.push(result.warning);
        lastError = result.error || 'Lookup failed';
      }
      return { ok: false, warning: warnings.join(' | '), error: lastError || 'Lookup failed' };
    } catch (err) {
      return { ok: false, warning: '', error: err && err.message ? err.message : 'Lookup failed' };
    }
  }

  async function flushCallsignGridLookup() {
    if (callsignGridInFlight) return;
    const pending = Array.from(callsignGridPending);
    if (!pending.length) return;
    callsignGridPending.clear();
    callsignGridInFlight = true;
    let hadError = false;
    const warnings = [];
    let lastError = '';
    try {
      for (let i = 0; i < pending.length; i += CALLSIGN_LOOKUP_BATCH) {
        const batch = pending.slice(i, i + CALLSIGN_LOOKUP_BATCH);
        // eslint-disable-next-line no-await-in-loop
        const result = await fetchCallsignGridBatch(batch);
        if (!result.ok) {
          hadError = true;
          lastError = result.error || lastError || 'Lookup failed';
        }
        if (result.warning) warnings.push(result.warning);
      }
    } finally {
      callsignGridInFlight = false;
      if (!hadError) {
        state.qthStatus = 'ok';
        state.qthError = null;
      } else {
        state.qthStatus = 'error';
        state.qthError = lastError || 'Lookup failed';
      }
      if (warnings.length) {
        console.warn('Callsign lookup warnings:', warnings.join(' | '));
      }
      updateDataStatus();
      recomputeDerived('lookup');
      if (callsignGridPending.size) {
        scheduleCallsignGridLookup();
      }
    }
  }

  function scheduleCallsignGridLookup() {
    if (callsignGridTimer) return;
    callsignGridTimer = setTimeout(() => {
      callsignGridTimer = null;
      flushCallsignGridLookup();
    }, 250);
  }

  function queueCallsignGridLookup(qsos) {
    if (!CALLSIGN_LOOKUP_URLS || !CALLSIGN_LOOKUP_URLS.length) return;
    if (!qsos || !qsos.length) return;
    const cache = getCallsignGridCache();
    const pending = new Set();
    qsos.forEach((q) => {
      const call = normalizeCall(q.call);
      if (!call) return;
      if (isMaidenheadGrid(q.grid)) return;
      if (!isCallsignToken(call)) {
        cache.set(call, null);
        return;
      }
      if (cache.has(call)) return;
      pending.add(call);
    });
    const stationCall = deriveStationCallsign(qsos);
    if (stationCall && isCallsignToken(stationCall) && !cache.has(stationCall)) pending.add(stationCall);
    if (!pending.size) return;
    pending.forEach((call) => callsignGridPending.add(call));
    state.qthStatus = 'loading';
    state.qthSource = CALLSIGN_LOOKUP_URLS[0];
    state.qthError = null;
    updateDataStatus();
    scheduleCallsignGridLookup();
  }

  function dedupeValues(values) {
    const out = [];
    const seen = new Set();
    (values || []).forEach((value) => {
      const key = String(value == null ? '' : value).trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(key);
    });
    return out;
  }

  function mapContinentToCqGeo(cont) {
    const c = normalizeContinent(cont);
    if (c === 'AF') return 'AFR';
    if (c === 'AS') return 'ASI';
    if (c === 'EU') return 'EUR';
    if (c === 'NA') return 'NAM';
    if (c === 'OC') return 'OCE';
    if (c === 'SA') return 'SAM';
    return '';
  }

  function inferApiMode(slot, contestId) {
    if (contestId === 'CQWWRTTY' || contestId === 'CQWPXRTTY') return 'rtty';
    const category = String(slot?.derived?.contestMeta?.category || '').toUpperCase();
    if (category.includes('CW')) return 'cw';
    if (category.includes('SSB') || category.includes('PHONE') || category.includes('PH')) return 'ph';
    const qsos = slot?.qsoData?.qsos || [];
    let cw = 0;
    let phone = 0;
    qsos.forEach((q) => {
      const bucket = modeBucket(q.mode);
      if (bucket === 'CW') cw += 1;
      if (bucket === 'Phone') phone += 1;
    });
    if (cw > phone) return 'cw';
    if (phone > 0) return 'ph';
    return 'cw';
  }

  function inferApiCategories(slot, contestId) {
    const out = [];
    const metaCategory = String(slot?.derived?.contestMeta?.category || '').trim();
    if (metaCategory) out.push(metaCategory);

    const firstRaw = slot?.qsoData?.qsos?.[0]?.raw || {};
    const parts = [
      firstRaw.CATEGORY_OPERATOR,
      firstRaw.CATEGORY_ASSISTED,
      firstRaw.CATEGORY_POWER,
      firstRaw.CATEGORY_BAND
    ].filter(Boolean).map((v) => String(v).trim());
    if (parts.length) out.push(parts.join(' '));

    if (contestId === 'CQ160') {
      const letter = String(metaCategory || '').trim().toUpperCase().match(/^([A-Z])\b/);
      if (letter && letter[1]) out.push(letter[1]);
      const first = String(firstRaw.CATEGORY || '').trim().toUpperCase();
      if (first.length === 1) out.push(first);
    }
    return dedupeValues(out);
  }

  function inferApiScopeGeos(slot) {
    const scope = {
      dxcc: '',
      continent: '',
      world: 'WORLD'
    };
    const stationCall = normalizeCall(slot?.derived?.contestMeta?.stationCallsign || deriveStationCallsign(slot?.qsoData?.qsos || []));
    if (stationCall) {
      const prefix = lookupPrefix(stationCall);
      if (prefix) {
        if (prefix.prefix) scope.dxcc = String(prefix.prefix).toUpperCase();
        const contGeo = mapContinentToCqGeo(prefix.continent);
        if (contGeo) scope.continent = contGeo;
      }
    }
    return scope;
  }

  function inferApiGeos(slot) {
    const scope = inferApiScopeGeos(slot);
    return dedupeValues([scope.dxcc, scope.continent, scope.world]);
  }

  function buildCqApiRequest(slot) {
    if (!slot?.derived || !slot?.qsoData) return null;
    const contestIdText = String(slot.derived.contestMeta?.contestId || '');
    const archivePath = String(slot.logFile?.path || '');
    const contestId = state.cqApiClient?.normalizeContestId
      ? state.cqApiClient.normalizeContestId(contestIdText, archivePath)
      : null;
    if (!contestId) return null;
    const callsign = normalizeCall(slot.derived.contestMeta?.stationCallsign || deriveStationCallsign(slot.qsoData.qsos));
    if (!callsign) return null;
    const minTs = slot.derived.timeRange?.minTs;
    const year = Number.isFinite(minTs) ? String(new Date(minTs).getUTCFullYear()) : '*';
    const mode = inferApiMode(slot, contestId);
    return {
      contestId,
      archivePath,
      callsign,
      year,
      mode,
      categories: inferApiCategories(slot, contestId),
      scopeGeos: inferApiScopeGeos(slot),
      geos: inferApiGeos(slot)
    };
  }

  async function ensureCqApiClient() {
    if (state.cqApiClient) return state.cqApiClient;
    await loadCqApiModule();
    if (!window.SH6CqApi || typeof window.SH6CqApi.createClient !== 'function') {
      throw new Error('CQ API client unavailable');
    }
    state.cqApiClient = window.SH6CqApi.createClient({
      proxyBase: CQ_API_PROXY_BASE,
      useProxy: true,
      useDirect: true,
      timeoutMs: 9000,
      maxAttempts: 3,
      retryBackoffMs: 220,
      debug: Boolean(window.SH6_API_DEBUG)
    });
    return state.cqApiClient;
  }

  function setCqApiStatus(status, source, error) {
    state.cqApiStatus = status || 'pending';
    state.cqApiSource = source || state.cqApiSource || CQ_API_PROXY_BASE;
    state.cqApiError = error || null;
    updateDataStatus();
  }

  async function triggerCqApiEnrichmentForSlot(slot, slotId = 'A') {
    if (!slot || !slot.qsoData || !slot.derived) return;

    const defaultApiState = createApiEnrichmentState();
    if (!slot.apiEnrichment) slot.apiEnrichment = defaultApiState;

    let client = null;
    try {
      client = await ensureCqApiClient();
    } catch (err) {
      slot.apiEnrichment = {
        ...createApiEnrichmentState(),
        status: 'error',
        error: err && err.message ? err.message : 'CQ API module load failed'
      };
      setCqApiStatus('error', CQ_API_PROXY_BASE, slot.apiEnrichment.error);
      renderActiveReport();
      return;
    }

    const req = buildCqApiRequest(slot);
    if (!req || !client.isSupportedContest(req.contestId)) {
      slot.apiEnrichment = {
        ...createApiEnrichmentState(),
        status: 'unsupported',
        error: 'Contest not supported for CQ API enrichment'
      };
      if (String(slotId).toUpperCase() === 'A') {
        setCqApiStatus('pending', CQ_API_PROXY_BASE, null);
      }
      renderActiveReport();
      return;
    }

    const token = `${req.contestId}:${req.callsign}:${req.year}:${req.mode}:${Date.now()}`;
    slot.apiEnrichment = {
      ...createApiEnrichmentState(),
      status: 'loading',
      requestKey: token
    };
    setCqApiStatus('loading', CQ_API_PROXY_BASE, null);
    renderActiveReport();

    try {
      const result = await client.enrich(req);
      if (!slot.apiEnrichment || slot.apiEnrichment.requestKey !== token) return;

      if (result?.ok) {
        slot.apiEnrichment = {
          ...createApiEnrichmentState(),
          status: 'ready',
          source: result.source || null,
          helperActive: Boolean(result.helperActive),
          data: result
        };
        setCqApiStatus('ok', result.source || CQ_API_PROXY_BASE, null);
      } else if (result?.unsupported) {
        slot.apiEnrichment = {
          ...createApiEnrichmentState(),
          status: 'unsupported',
          error: result.reason || 'Unsupported'
        };
        setCqApiStatus('pending', CQ_API_PROXY_BASE, null);
      } else {
        slot.apiEnrichment = {
          ...createApiEnrichmentState(),
          status: 'error',
          error: result?.error || 'CQ API request failed'
        };
        setCqApiStatus('error', result?.source || CQ_API_PROXY_BASE, slot.apiEnrichment.error);
      }
    } catch (err) {
      if (!slot.apiEnrichment || slot.apiEnrichment.requestKey !== token) return;
      slot.apiEnrichment = {
        ...createApiEnrichmentState(),
        status: 'error',
        error: err && err.message ? err.message : 'CQ API request failed'
      };
      setCqApiStatus('error', CQ_API_PROXY_BASE, slot.apiEnrichment.error);
    }
    renderActiveReport();
  }

  function normalizeCoachCategory(value) {
    return String(value || '')
      .replace(/%20/gi, ' ')
      .replace(/\+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  function normalizeCoachScopeType(value) {
    const key = String(value || '').trim().toLowerCase();
    if (key === 'dxcc') return 'dxcc';
    if (key === 'continent') return 'continent';
    if (key === 'cq_zone' || key === 'cqzone' || key === 'cq') return 'cq_zone';
    if (key === 'itu_zone' || key === 'ituzone' || key === 'itu') return 'itu_zone';
    return 'dxcc';
  }

  function formatCoachScopeTitle(scopeType) {
    if (scopeType === 'dxcc') return 'DXCC';
    if (scopeType === 'continent') return 'Continent';
    if (scopeType === 'cq_zone') return 'CQ zone';
    if (scopeType === 'itu_zone') return 'ITU zone';
    return 'Scope';
  }

  function encodeCqApiPathSegment(value) {
    return encodeURIComponent(String(value == null ? '' : value).trim())
      .replace(/%2A/g, '*')
      .replace(/%20/g, '+');
  }

  function parseCoachNumber(value) {
    if (value == null || value === '') return null;
    const n = Number(String(value).replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  }

  function parseCoachStatusMessage(payload) {
    if (!payload || typeof payload !== 'object') return '';
    return String(payload.status_message || payload['status message'] || payload.message || '').trim();
  }

  function normalizeCoachRawRow(contestId, mode, year, row) {
    if (!row || typeof row !== 'object') return null;
    const score = parseCoachNumber(row.rawscore ?? row.raw_score ?? row.score);
    if (!Number.isFinite(score)) return null;
    return {
      contest: contestId,
      mode,
      year: Number.isFinite(parseCoachNumber(row.year ?? row.yr)) ? parseCoachNumber(row.year ?? row.yr) : year,
      callsign: normalizeCall(row.callsign || row.call || ''),
      category: normalizeCoachCategory(row.category || row.cat || ''),
      score,
      qsos: parseCoachNumber(row.qsos || row.q),
      multTotal: parseCoachNumber(row.mult || row.m),
      multBreakdown: {},
      operators: String(row.operators || ''),
      geo: String(row.geo || row.cty || '').trim().toUpperCase(),
      raw: row
    };
  }

  function scoreCoachRows(rows) {
    return (rows || []).map((row) => {
      const category = normalizeCoachCategory(row?.category || row?.cat || '');
      const desc = String(row?.description || '').trim();
      return {
        row,
        category,
        description: String(desc || '').toUpperCase()
      };
    });
  }

  function isCoachMultiCategory(entry) {
    const category = String(entry?.category || '').toUpperCase();
    const description = String(entry?.description || '').toUpperCase();
    if (!category && !description) return false;
    if (description.includes('MULTI')) return true;
    return /^M(?:M|2|S|L|O|ULTI|$)/.test(category);
  }

  function isCoachSingleCategory(entry) {
    const category = String(entry?.category || '').toUpperCase();
    const description = String(entry?.description || '').toUpperCase();
    if (!category && !description) return false;
    if (description.includes('SINGLE')) return true;
    return /^(S|AH|AL|SQ|SH|SO)/.test(category);
  }

  function isCoachChecklogCategory(entry) {
    const category = String(entry?.category || '').toUpperCase();
    const description = String(entry?.description || '').toUpperCase();
    return category.startsWith('CK') || description.includes('CHECK');
  }

  function resolveCoachRawCategoryCandidates(options = {}) {
    const out = [];
    const seen = new Set();
    const push = (value) => {
      const key = normalizeCoachCategory(value);
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(key);
    };

    const categoryMode = options.categoryMode === 'all' ? 'all' : 'same';
    const targetCategory = normalizeCoachCategory(options.targetCategory || '');
    const selfRawCategory = normalizeCoachCategory(options.selfRawCategory || '');
    const catlist = Array.isArray(options.catlist) ? options.catlist : [];
    const entries = scoreCoachRows(catlist.map((row) => ({
      category: row?.category || '',
      description: row?.description || ''
    })));
    const categories = entries.map((entry) => entry.category).filter(Boolean);

    if (categoryMode === 'all') {
      if (selfRawCategory) push(selfRawCategory);
      categories.forEach(push);
      if (!out.length && targetCategory) push(targetCategory);
      return out.slice(0, 40);
    }

    if (selfRawCategory) push(selfRawCategory);
    if (targetCategory && categories.includes(targetCategory)) push(targetCategory);

    if (targetCategory && (!out.length || !categories.includes(targetCategory))) {
      if (targetCategory.includes('MULTI')) {
        entries.filter(isCoachMultiCategory).forEach((entry) => push(entry.category));
      } else if (targetCategory.includes('SINGLE')) {
        entries.filter(isCoachSingleCategory).forEach((entry) => push(entry.category));
      } else if (targetCategory.includes('CHECK')) {
        entries.filter(isCoachChecklogCategory).forEach((entry) => push(entry.category));
      }
    }

    if (!out.length && targetCategory) push(targetCategory);
    if (!out.length && categories.length) push(categories[0]);
    if (!out.length && targetCategory.includes('MULTI')) ['MM', 'M2', 'MSH'].forEach(push);
    return out.slice(0, 12);
  }

  async function fetchCoachRawCategoryRows(contestId, mode, category, year) {
    const proxyKey = CQ_API_PROXY_KEYS[contestId];
    if (!proxyKey) return { ok: false, rows: [], source: '', statusMessage: 'Unsupported contest' };
    const safeCategory = normalizeCoachCategory(category || '');
    if (!safeCategory) return { ok: false, rows: [], source: '', statusMessage: 'Missing category' };
    const url = `${CQ_API_PROXY_BASE}/${proxyKey}/raw/${encodeCqApiPathSegment(mode)}/category/${encodeCqApiPathSegment(safeCategory)}`;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const text = await res.text();
      let payload = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch (err) {
        return { ok: false, rows: [], source: url, statusMessage: `Invalid JSON (HTTP ${res.status})` };
      }
      const status = Number(payload?.status);
      const statusMessage = parseCoachStatusMessage(payload);
      if (status !== 200 || !Array.isArray(payload?.data)) {
        return { ok: false, rows: [], source: url, statusMessage: statusMessage || `HTTP ${res.status}` };
      }
      const rows = payload.data
        .map((row) => normalizeCoachRawRow(contestId, mode, year, row))
        .filter(Boolean)
        .filter((row) => !safeCategory || normalizeCoachCategory(row.category) === safeCategory);
      return { ok: true, rows, source: url, statusMessage };
    } catch (err) {
      return {
        ok: false,
        rows: [],
        source: url,
        statusMessage: err && err.message ? err.message : 'Raw category request failed'
      };
    }
  }

  function normalizeContestIdForCoach(contestText, archivePath) {
    const pathFirst = String(archivePath || '').split('/').filter(Boolean)[0] || '';
    const byPath = pathFirst.toUpperCase();
    if (CQ_API_SUPPORTED_CONTESTS.has(byPath)) return byPath;
    const raw = String(contestText || '').toUpperCase().replace(/[_\s]+/g, '-');
    if (!raw) return '';
    if (raw.includes('CQ-WPX-RTTY') || raw === 'CQWPXRTTY') return 'CQWPXRTTY';
    if (raw.includes('CQ-WW-RTTY') || raw === 'CQWWRTTY') return 'CQWWRTTY';
    if (raw.includes('CQ-WPX') || raw === 'CQWPX') return 'CQWPX';
    if (raw.includes('CQ-WW') || raw === 'CQWW') return 'CQWW';
    if (raw.includes('CQ-160') || raw === 'CQ160') return 'CQ160';
    return '';
  }

  function buildCompetitorCoachContext(client) {
    if (!state.qsoData || !state.derived) {
      return { ok: false, reason: 'Load Log A first.' };
    }
    const contestIdText = String(state.derived.contestMeta?.contestId || '');
    const archivePath = String(state.logFile?.path || '');
    const contestId = client?.normalizeContestId
      ? client.normalizeContestId(contestIdText, archivePath)
      : normalizeContestIdForCoach(contestIdText, archivePath);
    if (!contestId || !CQ_API_SUPPORTED_CONTESTS.has(contestId)) {
      return { ok: false, reason: 'This contest is not supported for CQ competitor analysis.' };
    }
    const callsign = normalizeCall(state.derived.contestMeta?.stationCallsign || deriveStationCallsign(state.qsoData.qsos));
    if (!callsign) {
      return { ok: false, reason: 'Station callsign not found in the loaded log.' };
    }
    const mode = inferApiMode(state, contestId);
    if (!mode) {
      return { ok: false, reason: 'Unable to infer mode for CQ competitor lookup.' };
    }
    const minTs = state.derived.timeRange?.minTs;
    const year = Number.isFinite(minTs) ? new Date(minTs).getUTCFullYear() : null;
    if (!Number.isFinite(year)) {
      return { ok: false, reason: 'Unable to infer contest year from the loaded log.' };
    }

    const stationPrefix = lookupPrefix(callsign) || lookupPrefix(baseCall(callsign));
    const scopeValues = {
      dxcc: String(stationPrefix?.prefix || '').trim().toUpperCase(),
      continent: normalizeContinent(stationPrefix?.continent || ''),
      cq_zone: Number.isFinite(stationPrefix?.cqZone) ? String(stationPrefix.cqZone) : '',
      itu_zone: Number.isFinite(stationPrefix?.ituZone) ? String(stationPrefix.ituZone) : ''
    };

    const targetCategory = normalizeCoachCategory(
      state.apiEnrichment?.data?.currentScore?.category
      || state.apiEnrichment?.data?.history?.[0]?.category
      || state.apiEnrichment?.data?.matchedCategory
      || state.derived.contestMeta?.category
    );

    const operatorCalls = dedupeValues([
      ...parseOperatorsList(state.derived?.contestMeta?.operators || ''),
      ...(state.derived?.operatorsSummary || []).map((item) => normalizeCall(item?.op || '')),
      callsign
    ].filter(Boolean)).map((value) => normalizeCall(value));

    return {
      ok: true,
      contestId,
      mode,
      year,
      callsign,
      scopeValues,
      targetCategory,
      operatorCalls
    };
  }

  function buildCompetitorCoachRequestKey(context, scopeType, categoryMode, targetCategory) {
    return [
      state.logVersion || 0,
      context.contestId || '',
      context.mode || '',
      context.year || '',
      context.callsign || '',
      scopeType || '',
      context.scopeValues?.[scopeType] || '',
      categoryMode || '',
      normalizeCoachCategory(targetCategory || '')
    ].join('|');
  }

  function buildCoachRowKey({ callsign, year, contestId, mode }) {
    const call = normalizeCall(callsign || '');
    const y = Number(year);
    const contest = String(contestId || '').trim().toUpperCase();
    const normalizedMode = String(mode || '').trim().toLowerCase();
    if (!call || !Number.isFinite(y) || !contest || !normalizedMode) return '';
    return `${call}|${Math.round(y)}|${contest}|${normalizedMode}`;
  }

  async function triggerCompetitorCoachRefresh(force = false) {
    if (!state.qsoData || !state.derived) return;
    const previous = state.competitorCoach || createCompetitorCoachState();

    let client;
    try {
      client = await ensureCqApiClient();
    } catch (err) {
      state.competitorCoach = {
        ...createCompetitorCoachState(previous),
        status: 'error',
        error: err && err.message ? err.message : 'CQ API client unavailable'
      };
      if (reports[state.activeIndex]?.id === 'competitor_coach') renderActiveReport();
      return;
    }

    const context = buildCompetitorCoachContext(client);
    if (!context.ok) {
      state.competitorCoach = {
        ...createCompetitorCoachState(previous),
        status: 'error',
        error: context.reason || 'Competitor context unavailable'
      };
      if (reports[state.activeIndex]?.id === 'competitor_coach') renderActiveReport();
      return;
    }

    const requestedScope = normalizeCoachScopeType(previous.scopeType || 'dxcc');
    const scopeType = context.scopeValues?.[requestedScope]
      ? requestedScope
      : (['dxcc', 'continent', 'cq_zone', 'itu_zone'].find((key) => context.scopeValues?.[key]) || requestedScope);
    const targetScopeValue = String(context.scopeValues?.[scopeType] || '');
    const categoryMode = previous.categoryMode === 'all' ? 'all' : 'same';
    const targetCategory = normalizeCoachCategory(previous.targetCategory || context.targetCategory || '');

    if (!targetScopeValue) {
      state.competitorCoach = {
        ...createCompetitorCoachState(previous),
        status: 'error',
        scopeType,
        categoryMode,
        targetCategory,
        error: `No ${formatCoachScopeTitle(scopeType)} value found for the station.`
      };
      if (reports[state.activeIndex]?.id === 'competitor_coach') renderActiveReport();
      return;
    }

    const requestKey = buildCompetitorCoachRequestKey(context, scopeType, categoryMode, targetCategory);
    if (!force && previous.requestKey === requestKey && (previous.status === 'loading' || previous.status === 'ready')) {
      return;
    }

    state.competitorCoach = {
      ...createCompetitorCoachState(previous),
      status: 'loading',
      requestKey,
      scopeType,
      categoryMode,
      targetScopeValue,
      targetCategory,
      scopeLabel: formatCoachScopeTitle(scopeType),
      contestId: context.contestId,
      mode: context.mode,
      year: context.year
    };
    if (reports[state.activeIndex]?.id === 'competitor_coach') renderActiveReport();

    try {
      await loadCompetitorCoachModule();
      if (!window.SH6CompetitorCoach || typeof window.SH6CompetitorCoach.buildModel !== 'function') {
        throw new Error('Competitor coach module unavailable.');
      }
      const scoreRes = await client.score(context.contestId, context.mode, String(context.year), '*');
      let cohortRows = scoreRes?.ok && Array.isArray(scoreRes.rows) ? scoreRes.rows.slice() : [];
      let statusMessage = scoreRes?.statusMessage || '';
      let sourceKind = 'official';
      let rawSource = '';

      const selfRawRes = await client.raw(context.contestId, context.mode, context.callsign);
      const selfRawCategory = selfRawRes?.ok && Array.isArray(selfRawRes.rows) && selfRawRes.rows.length
        ? normalizeCoachCategory(selfRawRes.rows[0]?.category || '')
        : '';
      const effectiveTargetCategory = normalizeCoachCategory(
        selfRawCategory
        || targetCategory
        || context.targetCategory
      );

      if (!cohortRows.length) {
        const catRes = await client.catlist(context.contestId);
        const catlist = catRes?.ok && Array.isArray(catRes.list) ? catRes.list : [];
        const categories = resolveCoachRawCategoryCandidates({
          categoryMode,
          targetCategory: effectiveTargetCategory,
          selfRawCategory,
          catlist
        });
        const rawRows = [];
        const rawMessages = [];
        for (const category of categories) {
          // eslint-disable-next-line no-await-in-loop
          const rawRes = await fetchCoachRawCategoryRows(context.contestId, context.mode, category, context.year);
          if (rawRes.ok && Array.isArray(rawRes.rows) && rawRes.rows.length) {
            rawRows.push(...rawRes.rows);
            if (!rawSource && rawRes.source) rawSource = rawRes.source;
          } else if (rawRes.statusMessage) {
            rawMessages.push(rawRes.statusMessage);
          }
        }
        cohortRows = rawRows;
        const fallbackMessage = 'Using raw score fallback cohort (unofficial/live).';
        sourceKind = 'raw';
        statusMessage = fallbackMessage;
        if (!cohortRows.length && rawMessages.length) {
          statusMessage = [fallbackMessage, rawMessages[0]].filter(Boolean).join(' ').trim();
        }
      }

      if (!Array.isArray(cohortRows) || !cohortRows.length) {
        throw new Error(scoreRes?.statusMessage || 'No competitor rows returned by CQ API.');
      }

      const callMetaCache = new Map();
      const resolveCallMeta = (callsign) => {
        const key = normalizeCall(callsign);
        if (!key) return { dxcc: '', continent: '', cqZone: '', ituZone: '' };
        if (callMetaCache.has(key)) return callMetaCache.get(key);
        const prefix = lookupPrefix(key) || lookupPrefix(baseCall(key));
        const meta = {
          dxcc: String(prefix?.prefix || '').trim().toUpperCase(),
          continent: normalizeContinent(prefix?.continent || ''),
          cqZone: Number.isFinite(prefix?.cqZone) ? String(prefix.cqZone) : '',
          ituZone: Number.isFinite(prefix?.ituZone) ? String(prefix.ituZone) : ''
        };
        callMetaCache.set(key, meta);
        return meta;
      };

      const model = window.SH6CompetitorCoach.buildModel({
        rows: cohortRows,
        scopeType,
        scopeValue: targetScopeValue,
        categoryMode,
        targetCategory: effectiveTargetCategory,
        stationCall: context.callsign,
        operatorCalls: context.operatorCalls,
        fallbackCurrent: state.apiEnrichment?.data?.currentScore || null,
        resolveCallMeta,
        limit: 60
      });

      state.competitorCoach = {
        ...state.competitorCoach,
        status: 'ready',
        error: null,
        source: rawSource || scoreRes?.source || '',
        statusMessage: statusMessage || '',
        rows: Array.isArray(model?.rows) ? model.rows : [],
        totalRows: Number(model?.totalRows) || 0,
        sourceRows: Array.isArray(cohortRows) ? cohortRows.length : 0,
        currentRow: model?.currentRow || null,
        closestRivals: Array.isArray(model?.closestRivals) ? model.closestRivals.slice(0, 5) : [],
        gapDriver: model?.gapDriver || null,
        insights: Array.isArray(model?.insights) ? model.insights.slice(0, 6) : [],
        targetScopeValue: String(model?.targetScopeValue || targetScopeValue || ''),
        targetCategory: String(model?.targetCategory || effectiveTargetCategory || targetCategory || ''),
        scopeLabel: formatCoachScopeTitle(scopeType),
        contestId: context.contestId,
        mode: context.mode,
        year: context.year
      };
      trackEvent('competitor_coach_refresh', {
        contest: context.contestId,
        mode: context.mode,
        year: context.year,
        scope: scopeType,
        category_mode: categoryMode,
        source_kind: sourceKind,
        cohort_rows: state.competitorCoach.totalRows
      });
    } catch (err) {
      state.competitorCoach = {
        ...state.competitorCoach,
        status: 'error',
        error: err && err.message ? err.message : 'Competitor cohort fetch failed.',
        rows: [],
        totalRows: 0,
        currentRow: null,
        closestRivals: [],
        gapDriver: null,
        insights: []
      };
    }

    if (reports[state.activeIndex]?.id === 'competitor_coach') renderActiveReport();
  }


  function getQrzPhotoCache(call) {
    if (!call) return { hit: false, url: null };
    try {
      const raw = localStorage.getItem(`qrz_photo_${call}`);
      if (!raw) return { hit: false, url: null };
      const data = JSON.parse(raw);
      if (!data || !data.updatedAt) return { hit: false, url: null };
      if (Date.now() - data.updatedAt > QRZ_CACHE_TTL) return { hit: false, url: null };
      return { hit: true, url: data.url || null };
    } catch (err) {
      return { hit: false, url: null };
    }
  }

  function setQrzPhotoCache(call, url) {
    if (!call) return;
    try {
      const payload = { updatedAt: Date.now(), url: url || null };
      localStorage.setItem(`qrz_photo_${call}`, JSON.stringify(payload));
    } catch (err) {
      // ignore cache failures
    }
  }

  function parseQrzPhotoUrl(html) {
    const text = String(html || '');
    const match = text.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (match) return match[1];
    const secure = text.match(/<meta\s+property=["']og:image:secure_url["']\s+content=["']([^"']+)["']/i);
    return secure ? secure[1] : null;
  }

  async function fetchQrzPhoto(call) {
    const cached = getQrzPhotoCache(call);
    if (cached.hit) return cached.url;
    if (qrzPhotoInFlight.has(call)) return qrzPhotoInFlight.get(call);
    const task = (async () => {
      const urls = QRZ_URLS.map((base) => `${base}/${encodeURIComponent(call)}`);
      const res = await fetchWithFallback(buildFetchUrls(urls), () => {});
      if (res && res.error) {
        setQrzPhotoCache(call, null);
        return null;
      }
      const photoUrl = parseQrzPhotoUrl(res.text || '');
      setQrzPhotoCache(call, photoUrl);
      return photoUrl;
    })();
    qrzPhotoInFlight.set(call, task);
    try {
      return await task;
    } finally {
      qrzPhotoInFlight.delete(call);
    }
  }

  function updateOperatorPhoto(call, url) {
    const items = document.querySelectorAll('.op-photo[data-qrz-call]');
    items.forEach((el) => {
      if (el.dataset.qrzCall !== call) return;
      el.classList.remove('op-photo-loading');
      el.classList.toggle('op-photo-missing', !url);
      el.textContent = '';
      if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = `${call} photo`;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.referrerPolicy = 'no-referrer';
        img.addEventListener('error', () => {
          el.textContent = '(No photo)';
          el.classList.add('op-photo-missing');
        }, { once: true });
        el.appendChild(img);
      } else {
        el.textContent = '(No photo)';
      }
    });
  }

  async function loadOperatorPhotos(root) {
    const scope = root || document;
    const elements = Array.from(scope.querySelectorAll('.op-photo[data-qrz-call]'));
    const calls = Array.from(new Set(elements.map((el) => (el.dataset.qrzCall || '').trim()).filter(Boolean)));
    if (!calls.length) return;
    const tasks = calls.map((call) => async () => {
      const cached = getQrzPhotoCache(call);
      if (cached.hit) {
        updateOperatorPhoto(call, cached.url);
        return;
      }
      const url = await fetchQrzPhoto(call);
      updateOperatorPhoto(call, url);
    });
    const executing = new Set();
    for (const task of tasks) {
      const promise = Promise.resolve().then(task);
      executing.add(promise);
      const cleanup = () => executing.delete(promise);
      promise.then(cleanup, cleanup);
      if (executing.size >= QRZ_MAX_CONCURRENCY) {
        await Promise.race(executing);
      }
    }
    await Promise.allSettled(executing);
  }

  function handleFetchResult(res, target) {
    if (res && typeof res === 'object' && res.error) {
      state[target + 'Error'] = res.error;
      return null;
    }
    state[target + 'Error'] = null;
    return res;
  }

  function isLocalHost() {
    if (typeof window === 'undefined' || !window.location) return false;
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  }

  function buildLocalFirstUrls(urls) {
    const remotes = [];
    const locals = [];
    urls.forEach((url) => {
      if (/^https?:\/\//i.test(url)) remotes.push(url);
      else locals.push(url);
    });
    return locals.concat(remotes);
  }

  function initDataFetches() {
    const useLocalFirst = isLocalHost();
    const ctyUrls = useLocalFirst ? buildLocalFirstUrls(CTY_URLS) : buildFetchUrls(CTY_URLS);
    const masterUrls = useLocalFirst ? buildLocalFirstUrls(MASTER_URLS) : buildFetchUrls(MASTER_URLS);
    const scoringUrls = useLocalFirst ? buildLocalFirstUrls(buildScoringSpecUrls()) : buildFetchUrls(buildScoringSpecUrls());
    fetchWithFallback(ctyUrls, (status, url) => {
      state.ctyStatus = status;
      if (status === 'error') state.ctySource = url;
      if (status === 'loading') state.ctySource = url;
      updateDataStatus();
    }).then((res) => {
      if (res.error) {
        state.ctyError = res.error;
        state.prefixCache = new Map();
        updateDataStatus();
        return;
      }
      const text = handleFetchResult(res.text, 'cty');
      state.ctySource = res.url;
      state.ctyDat = text;
      if (text) {
        const table = parseCtyDat(text);
        if (table && table.length > 0) {
          state.ctyTable = table;
          state.prefixCache = new Map();
          state.ctyError = null;
          state.ctyStatus = 'ok';
          recomputeDerived('cty');
        } else {
          state.ctyTable = null;
          state.prefixCache = new Map();
          state.ctyError = 'Parsed 0 prefixes from cty.dat';
          state.ctyStatus = 'error';
        }
      }
      updateDataStatus();
    });

    fetchWithFallback(masterUrls, (status, url) => {
      state.masterStatus = status;
      if (status === 'error') state.masterSource = url;
      if (status === 'loading') state.masterSource = url;
      updateDataStatus();
    }).then((res) => {
      if (res.error) {
        state.masterError = res.error;
        updateDataStatus();
        return;
      }
      const text = handleFetchResult(res.text, 'master');
      state.masterSource = res.url;
      state.masterDta = text;
      if (text) {
        const set = parseMasterDta(text);
        if (set && set.size > 0) {
          state.masterSet = set;
          state.masterError = null;
          state.masterStatus = 'ok';
          recomputeDerived('master');
        } else {
          state.masterSet = null;
          state.masterError = 'Parsed 0 calls from MASTER.DTA';
          state.masterStatus = 'error';
        }
      }
      updateDataStatus();
    });

    fetchWithFallback(scoringUrls, (status, url) => {
      state.scoringStatus = status;
      if (status === 'error' || status === 'loading') state.scoringSource = url;
    }).then((res) => {
      if (res.error) {
        state.scoringError = res.error;
        state.scoringStatus = 'error';
        recomputeDerived('scoring');
        return;
      }
      try {
        const parsed = JSON.parse(res.text || '{}');
        if (!Array.isArray(parsed?.rule_sets) || parsed.rule_sets.length === 0) {
          throw new Error('Scoring spec has no rule_sets');
        }
        applyScoringSpec(parsed, res.url);
      } catch (err) {
        state.scoringStatus = 'error';
        state.scoringError = err && err.message ? err.message : 'Failed to parse scoring spec';
      }
      recomputeDerived('scoring');
    });
  }

  function parseCtyDat(text) {
    // Parses cty.dat into array of prefix objects for quick lookups.
    // cty.dat format: country:...:tz, prefix1,prefix2,...;aliases with entries spanning multiple lines ending in ';'
    if (!text || /<html|<body/i.test(text)) return [];
    const lines = text.split(/\r?\n/);
    const entries = [];
    const parseToken = (tok, base, isPrimary) => {
      const cleaned = tok.replace(/[:\s]+$/g, '');
      const m = cleaned.match(/^(=)?([^(\[\s]+)(?:\((\d+)\))?(?:\[(\d+)\])?$/);
      if (!m) return null;
      const [, exactMark, bodyRaw, cqOverride, ituOverride] = m;
      const body = bodyRaw.replace(/^\*+/, '');
      if (!body) return null;
      return {
        prefix: body.toUpperCase(),
        exact: exactMark === '=',
        primary: Boolean(isPrimary),
        country: base.country,
        cqZone: cqOverride ? parseInt(cqOverride, 10) : base.cqZone,
        ituZone: ituOverride ? parseInt(ituOverride, 10) : base.ituZone,
        continent: base.continent,
        lat: base.lat,
        lon: base.lon,
        tz: base.tz
      };
    };

    let buffer = '';
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      buffer += (buffer ? ' ' : '') + line;
      while (buffer.includes(';')) {
        const [entryChunk, restChunk] = buffer.split(/;\s*/, 2);
        buffer = restChunk || '';
        const entryLine = entryChunk.trim();
        if (!entryLine) continue;
        // Split by colon to get fixed fields; the remainder (after 7 fields) is the prefix list with commas
        const fields = entryLine.split(':');
        if (fields.length < 8) continue;
        const [name, cqZone, ituZone, continent, lat, lon, tz, ...restFields] = fields;
        const prefixBlock = restFields.join(':').replace(/;+$/, '');
        const prefixes = prefixBlock.split(/[, \t]+/).filter(Boolean);
        const lonVal = parseFloat(lon);
        const base = {
          country: name,
          cqZone: parseInt(cqZone, 10) || null,
          ituZone: parseInt(ituZone, 10) || null,
          continent: (continent || '').trim() || null,
          lat: parseFloat(lat) || null,
          // cty.dat longitudes are west-positive; invert to standard east-positive.
          lon: Number.isFinite(lonVal) ? -lonVal : null,
          tz: parseFloat(tz) || null
        };
        let primarySet = false;
        for (const p of prefixes) {
          const parsed = parseToken(p.trim(), base, !primarySet);
          if (parsed) {
            entries.push(parsed);
            if (!primarySet) primarySet = true;
          }
        }
      }
    }
    // Sort by exact first, then prefix length descending for longest-match lookups.
    const sorted = entries.sort((a, b) => {
      if (a.exact !== b.exact) return a.exact ? -1 : 1;
      return b.prefix.length - a.prefix.length;
    });
    if (sorted.length > 0) return sorted;

    // Fallback loose parser if structured parse failed (e.g., unexpected formatting)
    const looseEntries = [];
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const firstColon = line.indexOf(':');
      if (firstColon === -1) continue;
      const countryFields = line.split(':');
      if (countryFields.length < 7) continue;
      const [name, cqZone, ituZone, continent, lat, lon, tz, restFields] = countryFields;
      const suffix = restFields ? restFields.split(/[;,]/) : [];
      const lonVal = parseFloat(lon);
      const base = {
        country: name,
        cqZone: parseInt(cqZone, 10) || null,
        ituZone: parseInt(ituZone, 10) || null,
        continent: (continent || '').trim() || null,
        lat: parseFloat(lat) || null,
        // cty.dat longitudes are west-positive; invert to standard east-positive.
        lon: Number.isFinite(lonVal) ? -lonVal : null,
        tz: parseFloat(tz) || null
      };
      let primarySet = false;
      for (const t of suffix) {
        const parsed = parseToken(t.trim(), base, !primarySet);
        if (parsed) {
          looseEntries.push(parsed);
          if (!primarySet) primarySet = true;
        }
      }
    }
    return looseEntries.sort((a, b) => {
      if (a.exact !== b.exact) return a.exact ? -1 : 1;
      return b.prefix.length - a.prefix.length;
    });
  }

  function suggestMasterMatches(call, masterSet, limit = 5) {
    if (!call || !masterSet || masterSet.size === 0) return [];
    const suggestions = [];
    const target = call.toUpperCase();
    for (const m of masterSet) {
      if (m.length !== target.length) continue;
      let diff = 0;
      for (let i = 0; i < target.length; i++) {
        if (target[i] !== m[i]) diff += 1;
        if (diff > 1) break;
      }
      if (diff === 1) suggestions.push(m);
      if (suggestions.length >= limit) break;
    }
    return suggestions;
  }

  function parseMasterDta(text) {
    // MASTER.DTA can contain CRLF and potential binary junk; treat as bytes -> UTF-8 safely.
    let data = text;
    if (!(typeof text === 'string')) {
      // Fallback: try to coerce ArrayBuffer/Uint8Array
      try {
        data = new TextDecoder('utf-8').decode(text);
      } catch (e) {
        console.warn('MASTER.DTA decode failed, using raw:', e);
        data = '';
      }
    }
    const set = new Set();
    const lines = data.split(/\r?\n/);
    for (const line of lines) {
      const cleaned = line.replace(/\0/g, '').trim();
      const call = normalizeCall(cleaned);
      if (call) {
        set.add(call);
        const base = baseCall(call);
        if (base) set.add(base);
      }
    }
    // If the file is binary, line parsing yields too few calls; scan for call-like tokens.
    if (set.size < 1000) {
      let scan = data;
      if (typeof text !== 'string') {
        try {
          scan = new TextDecoder('latin1').decode(text);
        } catch (e) {
          scan = data;
        }
      }
      const re = /[A-Z0-9\/]{3,12}/g;
      let m;
      while ((m = re.exec(scan)) !== null) {
        const token = m[0];
        if (!/^\w/.test(token)) continue;
        if (!/[0-9]/.test(token)) continue;
        const call = normalizeCall(token);
        if (call) {
          set.add(call);
          const base = baseCall(call);
          if (base) set.add(base);
        }
      }
    }
    return set;
  }

  function baseCall(call) {
    if (!call) return '';
    const parts = call.split('/');
    if (parts.length === 1) return call;
    const suffix = parts[parts.length - 1];
    const portable = new Set(['P', 'M', 'MM', 'AM', 'QRP']);
    if (portable.has(suffix)) return parts[0];
    // Prefer the longer segment that looks like a callsign
    const cand = parts.reduce((best, p) => (p.length > best.length ? p : best), '');
    return cand || call;
  }

  const WPX_IGNORE_SUFFIXES = new Set(['A', 'E', 'J', 'P', 'M', 'MM', 'AM', 'QRP', 'QRPP']);

  function extractWpxPrefix(part) {
    if (!part) return '';
    const text = normalizeCall(part).replace(/[^A-Z0-9]/g, '');
    if (!text) return '';
    const lastDigitIndex = text.search(/\d(?!.*\d)/);
    if (lastDigitIndex >= 0) {
      if (lastDigitIndex === 0) {
        const leading = text.match(/^(\d+[A-Z]+)/);
        if (leading) return leading[1];
      }
      return text.slice(0, lastDigitIndex + 1);
    }
    const letters = text.replace(/[^A-Z]/g, '');
    if (!letters) return '';
    if (letters.length >= 2) return `${letters.slice(0, 2)}0`;
    return `${letters[0]}0`;
  }

  function wpxPrefix(call) {
    const norm = normalizeCall(call);
    if (!norm) return '';
    const parts = norm.split('/').filter(Boolean);
    const base = baseCall(norm) || norm;
    let candidate = '';
    let candidateHasDigit = false;
    for (const part of parts) {
      if (!part || part === base) continue;
      if (WPX_IGNORE_SUFFIXES.has(part)) continue;
      if (!/[A-Z]/.test(part)) continue;
      const hasDigit = /\d/.test(part);
      if (!candidate || (hasDigit && !candidateHasDigit)) {
        candidate = part;
        candidateHasDigit = hasDigit;
        if (candidateHasDigit) break;
      }
    }
    return extractWpxPrefix(candidate || base || parts[0] || norm);
  }

  function setupPrevNext() {
    dom.prevBtn.addEventListener('click', () => {
      if (state.activeIndex > 0) setActiveReport(state.activeIndex - 1);
    });
    dom.nextBtn.addEventListener('click', () => {
      if (state.activeIndex < reports.length - 1) setActiveReport(state.activeIndex + 1);
    });
  }

  function lookupPrefix(call) {
    if (!state.ctyTable || !call) return null;
    const key = normalizeCall(call);
    if (!key) return null;
    if (state.prefixCache.has(key)) return state.prefixCache.get(key);
    let found = null;
    for (const entry of state.ctyTable) {
      if (entry.exact) {
        if (key === entry.prefix) {
          found = entry;
          break;
        }
      } else if (key.startsWith(entry.prefix)) {
        found = entry;
        break;
      }
    }
    if (state.prefixCache.size > 10000) state.prefixCache.clear();
    state.prefixCache.set(key, found);
    return found;
  }

  function buildCountryPrefixMap() {
    const map = new Map();
    if (!state.ctyTable) return map;
    for (const entry of state.ctyTable) {
      if (!entry.country || !entry.prefix || !entry.primary) continue;
      if (!map.has(entry.country)) map.set(entry.country, entry.prefix);
    }
    for (const entry of state.ctyTable) {
      if (!entry.country || !entry.prefix) continue;
      if (map.has(entry.country)) continue;
      const current = map.get(entry.country);
      if (!current || entry.prefix.length < current.length) {
        map.set(entry.country, entry.prefix);
      }
    }
    return map;
  }

  function normalizeContinent(code) {
    const raw = (code || '').trim().toUpperCase();
    if (!raw) return '';
    if (raw === 'NA' || raw === 'SA' || raw === 'EU' || raw === 'AF' || raw === 'AS' || raw === 'OC') return raw;
    const words = raw.replace(/[^A-Z]/g, ' ').split(/\s+/).filter(Boolean);
    if (raw.includes('AMERICA')) {
      if (raw.includes('SOUTH') || words.includes('S')) return 'SA';
      if (raw.includes('NORTH') || words.includes('N')) return 'NA';
      return 'NA';
    }
    if (raw.includes('EUROPE')) return 'EU';
    if (raw.includes('AFRICA')) return 'AF';
    if (raw.includes('ASIA')) return 'AS';
    if (raw.includes('OCEANIA') || raw.includes('AUSTRALIA')) return 'OC';
    const match = raw.match(/[A-Z]{2}/);
    return match ? match[0] : '';
  }

  function continentLabel(code) {
    switch (normalizeContinent(code)) {
      case 'NA': return 'North America';
      case 'SA': return 'South America';
      case 'EU': return 'Europe';
      case 'AF': return 'Africa';
      case 'AS': return 'Asia';
      case 'OC': return 'Oceania';
      default: return code || '';
    }
  }

  function markDupes(qsos) {
    const seen = new Map();
    const dupes = [];
    for (const q of qsos) {
      const key = `${q.call}|${q.band}|${q.mode}`;
      if (seen.has(key)) {
        q.isDupe = true;
        dupes.push(q);
      } else {
        q.isDupe = false;
        seen.set(key, true);
      }
    }
    return dupes;
  }

  function buildDerived(qsos, context = {}) {
    if (!qsos) return null;
    const dupes = markDupes(qsos);
    const calls = new Set();
    const bands = new Map();
    const bandModes = new Map(); // band -> {cw,digital,phone,all,points,countries:Set}
    const countries = new Map();
    const continents = new Map();
    const cqZones = new Map();
    const hours = new Map(); // hour bucket (UTC) -> stats
    const minutes = new Map(); // minute bucket (UTC) -> stats
    const tenMinutes = new Map(); // 10-minute buckets
    const wpxPrefixes = new Map();
    const wpxPrefixGroups = new Map();
    const callsignLengths = new Map(); // len -> {callsigns:Set, qsos}
    const notInMasterCalls = new Map(); // call -> {qsos, firstTs, lastTs}
    const allCalls = new Map(); // call -> {qsos, bands:Set, firstTs, lastTs}
    const hoursCountries = new Map(); // hour -> Map(country -> count)
    const bandHourCountry = new Map(); // band -> Map(hour -> Map(country -> count))
    const ops = new Map(); // operator -> {qsos, uniques:Set}
    const structures = new Map(); // struct -> {callsigns:Set, qsos}
    const ituZones = new Map();
    const distanceSummary = makeDistanceSummary();
    const headingSummary = makeHeadingSummary();
    const headingByHour = new Map(); // hour -> Map(sector -> count)
    const freqBins = new Map();
    const possibleErrors = [];
    const comments = new Set();
    const fields = new Map(); // grid field (first two letters)
    let minTs = null;
    let maxTs = null;
    let totalPoints = 0;

    const station = deriveStation(qsos);
    const contestMeta = deriveContestMeta(qsos);
    const countryPrefixMap = buildCountryPrefixMap();

    qsos.forEach((q) => {
      if (q.call) calls.add(q.call);
      if (typeof q.ts === 'number') {
        if (minTs === null || q.ts < minTs) minTs = q.ts;
        if (maxTs === null || q.ts > maxTs) maxTs = q.ts;
      }
      const bandKey = normalizeBand(q.band, Number.isFinite(q.freq) ? q.freq : null) || 'unknown';
      if (bandKey && bandKey !== q.band) {
        q.band = bandKey;
      }
      if (!bands.has(bandKey)) {
        bands.set(bandKey, { qsos: 0, uniques: new Set(), dupes: 0 });
      }
      const b = bands.get(bandKey);
      b.qsos += 1;
      if (q.isDupe) b.dupes += 1;
      if (q.call) b.uniques.add(q.call);

      if (!bandModes.has(bandKey)) {
        bandModes.set(bandKey, { band: bandKey, cw: 0, digital: 0, phone: 0, all: 0, points: 0, countries: new Set() });
      }
      const bm = bandModes.get(bandKey);
      const bucket = modeBucket(q.mode);
      if (bucket === 'CW') bm.cw += 1;
      if (bucket === 'Digital') bm.digital += 1;
      if (bucket === 'Phone') bm.phone += 1;
      bm.all += 1;
      if (Number.isFinite(q.points)) {
        bm.points += q.points;
        totalPoints += q.points;
      }

      const loggedCq = parseZone(q.raw?.CQZ ?? q.raw?.CQ_ZONE);
      const loggedItu = parseZone(q.raw?.ITUZ ?? q.raw?.ITU_ZONE);
      if (loggedCq != null) q.cqZone = loggedCq;
      if (loggedItu != null) q.ituZone = loggedItu;

      // Prefix/country enrich
      const prefix = lookupPrefix(q.call);
      const wpx = wpxPrefix(q.call);
      if (wpx) q.wpxPrefix = wpx;
      if (prefix) {
        const cont = normalizeContinent(prefix.continent);
        q.country = prefix.country;
        if (q.cqZone == null) q.cqZone = prefix.cqZone;
        if (q.ituZone == null) q.ituZone = prefix.ituZone;
        q.continent = cont;
        q.prefix = prefix.prefix;
        if (prefix.country) {
          if (!countries.has(prefix.country)) {
            countries.set(prefix.country, {
              qsos: 0,
              uniques: new Set(),
              bands: new Set(),
              bandCounts: new Map(),
              cw: 0,
              digital: 0,
              phone: 0,
              firstTs: q.ts,
              lastTs: q.ts,
              continent: cont || null,
              distSum: 0,
              distCount: 0
            });
          }
          const c = countries.get(prefix.country);
          c.qsos += 1;
          if (q.call) c.uniques.add(q.call);
          if (q.band) {
            c.bands.add(q.band);
            c.bandCounts.set(q.band, (c.bandCounts.get(q.band) || 0) + 1);
          }
          if (bucket === 'CW') c.cw += 1;
          if (bucket === 'Digital') c.digital += 1;
          if (bucket === 'Phone') c.phone += 1;
          if (bm) bm.countries.add(prefix.country);
          if (typeof q.ts === 'number') {
            if (c.firstTs == null || q.ts < c.firstTs) c.firstTs = q.ts;
            if (c.lastTs == null || q.ts > c.lastTs) c.lastTs = q.ts;
          }
        }
        if (cont) {
          if (!continents.has(cont)) {
            continents.set(cont, { qsos: 0, uniques: new Set(), bandCounts: new Map(), cw: 0, digital: 0, phone: 0 });
          }
          const c = continents.get(cont);
          c.qsos += 1;
          if (q.call) c.uniques.add(q.call);
          if (q.band) c.bandCounts.set(q.band, (c.bandCounts.get(q.band) || 0) + 1);
          if (bucket === 'CW') c.cw += 1;
          if (bucket === 'Digital') c.digital += 1;
          if (bucket === 'Phone') c.phone += 1;
        }
      }

      if (q.cqZone) {
        if (!cqZones.has(q.cqZone)) cqZones.set(q.cqZone, { qsos: 0, countries: new Set(), bandCounts: new Map() });
        const z = cqZones.get(q.cqZone);
        z.qsos += 1;
        if (q.country) z.countries.add(q.country);
        if (q.band) z.bandCounts.set(q.band, (z.bandCounts.get(q.band) || 0) + 1);
      }
      if (q.ituZone) {
        if (!ituZones.has(q.ituZone)) ituZones.set(q.ituZone, { qsos: 0, countries: new Set(), bandCounts: new Map() });
        const z = ituZones.get(q.ituZone);
        z.qsos += 1;
        if (q.country) z.countries.add(q.country);
        if (q.band) z.bandCounts.set(q.band, (z.bandCounts.get(q.band) || 0) + 1);
      }

      // Master lookup (only if file successfully loaded and non-empty)
      if (state.masterSet && state.masterSet.size > 0) {
        const callKey = normalizeCall(q.call);
        const base = baseCall(callKey);
        q.inMaster = (callKey && state.masterSet.has(callKey)) || (base && state.masterSet.has(base));
        if (!q.inMaster && q.call) {
          if (!notInMasterCalls.has(q.call)) notInMasterCalls.set(q.call, { qsos: 0, firstTs: q.ts, lastTs: q.ts });
          const n = notInMasterCalls.get(q.call);
          n.qsos += 1;
          if (typeof q.ts === 'number') {
            if (n.firstTs == null || q.ts < n.firstTs) n.firstTs = q.ts;
            if (n.lastTs == null || q.ts > n.lastTs) n.lastTs = q.ts;
          }
        }
      }

      // Hourly aggregation (UTC)
      if (typeof q.ts === 'number') {
        const hourBucket = Math.floor(q.ts / 3600000); // ms to hours
        if (!hours.has(hourBucket)) {
          hours.set(hourBucket, { qsos: 0, byBand: new Map() });
        }
        const h = hours.get(hourBucket);
        h.qsos += 1;
        if (!h.byBand.has(bandKey)) h.byBand.set(bandKey, 0);
        h.byBand.set(bandKey, h.byBand.get(bandKey) + 1);

        const minuteBucket = Math.floor(q.ts / 60000);
        if (!minutes.has(minuteBucket)) {
          minutes.set(minuteBucket, { qsos: 0 });
        }
        minutes.get(minuteBucket).qsos += 1;

        const tenBucket = Math.floor(q.ts / (60000 * 10));
        if (!tenMinutes.has(tenBucket)) tenMinutes.set(tenBucket, { qsos: 0 });
        tenMinutes.get(tenBucket).qsos += 1;

        // Countries by time (overall + per band)
        if (q.country) {
          if (!hoursCountries.has(hourBucket)) hoursCountries.set(hourBucket, new Map());
          const hc = hoursCountries.get(hourBucket);
          hc.set(q.country, (hc.get(q.country) || 0) + 1);

          if (!bandHourCountry.has(bandKey)) bandHourCountry.set(bandKey, new Map());
          const bandMap = bandHourCountry.get(bandKey);
          if (!bandMap.has(hourBucket)) bandMap.set(hourBucket, new Map());
          const bhc = bandMap.get(hourBucket);
          bhc.set(q.country, (bhc.get(q.country) || 0) + 1);
        }
      }

      // WPX prefixes
      if (wpx) {
        if (!wpxPrefixes.has(wpx)) wpxPrefixes.set(wpx, { qsos: 0, uniques: new Set() });
        const p = wpxPrefixes.get(wpx);
        p.qsos += 1;
        if (q.call) p.uniques.add(q.call);

        const countryKey = prefix?.country || 'Unknown';
        if (!wpxPrefixGroups.has(countryKey)) {
          wpxPrefixGroups.set(countryKey, {
            country: countryKey,
            continent: prefix?.continent || '',
            id: prefix?.country ? (countryPrefixMap.get(prefix.country) || '') : '',
            prefixes: new Set()
          });
        }
        wpxPrefixGroups.get(countryKey).prefixes.add(wpx);
      }

      // Callsign lengths
      if (q.call) {
        const len = q.call.length;
        if (!callsignLengths.has(len)) callsignLengths.set(len, { callsigns: new Set(), qsos: 0 });
        const lenEntry = callsignLengths.get(len);
        lenEntry.qsos += 1;
        lenEntry.callsigns.add(q.call);
        const struct = classifyCallStructure(q.call);
        if (!structures.has(struct)) structures.set(struct, { callsigns: new Set(), qsos: 0, example: q.call });
        const structEntry = structures.get(struct);
        structEntry.qsos += 1;
        structEntry.callsigns.add(q.call);
        if (!structEntry.example) structEntry.example = q.call;
      }

      // All calls summary
      if (q.call) {
        if (!allCalls.has(q.call)) allCalls.set(q.call, { qsos: 0, bands: new Set(), bandCounts: new Map(), firstTs: q.ts, lastTs: q.ts });
        const a = allCalls.get(q.call);
        a.qsos += 1;
        if (q.band) {
          a.bands.add(q.band);
          a.bandCounts.set(q.band, (a.bandCounts.get(q.band) || 0) + 1);
        }
        if (typeof q.ts === 'number') {
          if (a.firstTs == null || q.ts < a.firstTs) a.firstTs = q.ts;
          if (a.lastTs == null || q.ts > a.lastTs) a.lastTs = q.ts;
        }
      }

      // Operators
      if (q.op) {
        if (!ops.has(q.op)) ops.set(q.op, { qsos: 0, uniques: new Set() });
        const o = ops.get(q.op);
        o.qsos += 1;
        if (q.call) o.uniques.add(q.call);
      }

      // Distance / heading if station known
      if (station && station.lat != null && station.lon != null) {
        const remote = deriveRemoteLatLon(q, prefix);
        if (remote) {
          const dist = haversineKm(station.lat, station.lon, remote.lat, remote.lon);
          const brng = bearingDeg(station.lat, station.lon, remote.lat, remote.lon);
          q.distance = dist;
          q.bearing = brng;
          distanceSummary.add(dist, q.band);
          headingSummary.add(brng, q.band);
          if (q.country && countries.has(q.country)) {
            const c = countries.get(q.country);
            c.distSum += dist;
            c.distCount += 1;
          }
          // heading by hour bucketed into 30 deg sectors
          if (typeof q.ts === 'number') {
            const hourBucket = Math.floor(q.ts / 3600000);
            if (!headingByHour.has(hourBucket)) headingByHour.set(hourBucket, new Map());
            const hb = headingByHour.get(hourBucket);
            const sector = Math.floor(brng / 30) * 30;
            hb.set(sector, (hb.get(sector) || 0) + 1);
          }
        }
      }

      // Comments
      const comment = q.raw?.COMMENT || q.raw?.NOTES;
      if (comment) comments.add(comment);

      // Fields (grid first two letters, fallback to lat/lon)
      if (q.grid && q.grid.length >= 2) {
        const field = q.grid.slice(0, 2).toUpperCase();
        fields.set(field, (fields.get(field) || 0) + 1);
      } else {
        const remote = deriveRemoteLatLon(q, prefix);
        if (remote) {
          const field = latLonToField(remote.lat, remote.lon);
          if (field) fields.set(field, (fields.get(field) || 0) + 1);
        }
      }

      // Possible errors
      const freqBand = Number.isFinite(q.freq) ? parseBandFromFreq(q.freq) : null;
      if (!q.call) {
        possibleErrors.push({ reason: 'Missing callsign', q });
      } else if (classifyCallStructure(q.call) === 'other') {
        possibleErrors.push({ reason: 'Unrecognized callsign pattern', q });
      }
      if (!prefix) {
        possibleErrors.push({ reason: 'Prefix not found in cty.dat', q });
      }
      if (q.ts == null) {
        possibleErrors.push({ reason: 'Invalid/missing time', q });
      }
      if (q.band && !SUPPORTED_BANDS.has(q.band)) {
        const bandLabel = formatBandLabel(q.band) || q.band;
        possibleErrors.push({ reason: `Unexpected band value "${bandLabel}"`, q });
      }
      if (Number.isFinite(q.freq)) {
        if (!freqBand) {
          possibleErrors.push({ reason: `Frequency ${q.freq} MHz is outside supported bands`, q });
        } else if (q.band && q.band !== freqBand) {
          possibleErrors.push({ reason: `Band/freq mismatch: band ${formatBandLabel(q.band)}, freq ${q.freq} MHz (${formatBandLabel(freqBand)})`, q });
        }
        const bin = Math.floor(q.freq * 10) / 10;
        freqBins.set(bin, (freqBins.get(bin) || 0) + 1);
      }
      if (prefix) {
        if (prefix.cqZone && loggedCq != null && loggedCq !== prefix.cqZone) {
          possibleErrors.push({ reason: `CQ zone mismatch: logged ${loggedCq}, prefix ${prefix.cqZone}`, q });
        }
        if (prefix.ituZone && loggedItu != null && loggedItu !== prefix.ituZone) {
          possibleErrors.push({ reason: `ITU zone mismatch: logged ${loggedItu}, prefix ${prefix.ituZone}`, q });
        }
      }
    });

    const bandSummary = [];
    bands.forEach((v, k) => {
      bandSummary.push({
        band: k,
        qsos: v.qsos,
        dupes: v.dupes,
        uniques: v.uniques.size
      });
    });
    bandSummary.sort((a, b) => {
      const ai = bandOrderIndex(a.band);
      const bi = bandOrderIndex(b.band);
      if (ai !== bi) return ai - bi;
      return (a.band || '').localeCompare(b.band || '');
    });

    const bandModeSummary = Array.from(bandModes.values()).map((b) => ({
      band: b.band,
      cw: b.cw,
      digital: b.digital,
      phone: b.phone,
      all: b.all,
      countries: b.countries.size,
      points: b.points
    })).sort((a, b) => {
      const ai = bandOrderIndex(a.band);
      const bi = bandOrderIndex(b.band);
      if (ai !== bi) return ai - bi;
      return a.band.localeCompare(b.band);
    });

    const countrySummary = [];
    countries.forEach((v, k) => {
      countrySummary.push({
        country: k,
        qsos: v.qsos,
        uniques: v.uniques.size,
        bands: sortBands(Array.from(v.bands)),
        bandCounts: v.bandCounts,
        cw: v.cw,
        digital: v.digital,
        phone: v.phone,
        continent: v.continent,
        distanceAvg: v.distCount ? v.distSum / v.distCount : null,
        prefixCode: countryPrefixMap.get(k) || '',
        firstTs: v.firstTs,
        lastTs: v.lastTs
      });
    });
    const continentOrder = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC'];
    countrySummary.sort((a, b) => {
      const ai = continentOrder.indexOf((a.continent || '').toUpperCase());
      const bi = continentOrder.indexOf((b.continent || '').toUpperCase());
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return (a.prefixCode || a.country).localeCompare(b.prefixCode || b.country);
    });

    const continentSummary = [];
    continents.forEach((v, k) => {
      continentSummary.push({
        continent: k,
        qsos: v.qsos,
        uniques: v.uniques.size,
        bandCounts: v.bandCounts,
        cw: v.cw,
        digital: v.digital,
        phone: v.phone
      });
    });
    continentSummary.sort((a, b) => {
      const ai = continentOrder.indexOf((a.continent || '').toUpperCase());
      const bi = continentOrder.indexOf((b.continent || '').toUpperCase());
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return (a.continent || '').localeCompare(b.continent || '');
    });

	    const cqZoneSummary = [];
	    cqZones.forEach((v, k) => {
	      cqZoneSummary.push({
	        cqZone: k,
	        qsos: v.qsos,
	        countries: v.countries.size,
	        bandCounts: v.bandCounts
	      });
	    });
	    cqZoneSummary.sort((a, b) => a.cqZone - b.cqZone);

	    const ituZoneSummary = [];
	    ituZones.forEach((v, k) => {
	      ituZoneSummary.push({
	        ituZone: k,
	        qsos: v.qsos,
	        countries: v.countries.size,
	        bandCounts: v.bandCounts
	      });
	    });
	    ituZoneSummary.sort((a, b) => a.ituZone - b.ituZone);

    // Build hourly series sorted by time
    const hourSeries = Array.from(hours.entries()).sort((a, b) => a[0] - b[0]).map(([hour, v]) => {
      const bandsObj = {};
      v.byBand.forEach((count, band) => bandsObj[band] = count);
      return { hour, qsos: v.qsos, bands: bandsObj };
    });

    // Minute series
    const minuteSeries = Array.from(minutes.entries()).sort((a, b) => a[0] - b[0]).map(([minute, v]) => ({
      minute,
      qsos: v.qsos
    }));

    const breakSummary = computeBreakSummary(minutes, 60);

    const tenMinuteSeries = Array.from(tenMinutes.entries()).sort((a, b) => a[0] - b[0]).map(([bucket, v]) => ({
      bucket,
      qsos: v.qsos
    }));

    // Prefix summary
    const prefixSummary = [];
    wpxPrefixes.forEach((v, k) => {
      prefixSummary.push({
        prefix: k,
        qsos: v.qsos,
        uniques: v.uniques.size
      });
    });
    prefixSummary.sort((a, b) => b.qsos - a.qsos || a.prefix.localeCompare(b.prefix));

    // Callsign length summary
    const callsignLengthSummary = Array.from(callsignLengths.entries()).map(([len, info]) => ({
      len,
      callsigns: info.callsigns.size,
      qsos: info.qsos
    }))
      .sort((a, b) => a.len - b.len);

    // Not in master list
    const notInMasterList = Array.from(notInMasterCalls.entries()).map(([call, info]) => ({
      call,
      qsos: info.qsos,
      firstTs: info.firstTs,
      lastTs: info.lastTs
    })).sort((a, b) => b.qsos - a.qsos || a.call.localeCompare(b.call));

    const allCallsList = Array.from(allCalls.entries()).map(([call, info]) => ({
      call,
      qsos: info.qsos,
      bands: Array.from(info.bands).sort(),
      bandCounts: info.bandCounts,
      firstTs: info.firstTs,
      lastTs: info.lastTs
    })).sort((a, b) => a.call.localeCompare(b.call));

    const callCountMap = new Map();
    allCalls.forEach((info, call) => callCountMap.set(call, info.qsos));
    qsos.forEach((q) => {
      if (!q || !q.call) return;
      q.callCount = callCountMap.get(q.call) || 0;
    });

    let operatorsSummary = Array.from(ops.entries()).map(([op, info]) => ({
      op,
      qsos: info.qsos,
      uniques: info.uniques.size
    })).sort((a, b) => b.qsos - a.qsos || a.op.localeCompare(b.op));
    const headerOperators = parseOperatorsList(contestMeta?.operators);
    if (headerOperators.length) {
      const stationNorm = normalizeCall(contestMeta?.stationCallsign || '');
      const opKeys = Array.from(ops.keys()).map((op) => normalizeCall(op)).filter(Boolean);
      const onlyStation = opKeys.length === 0 || (opKeys.length === 1 && stationNorm && opKeys[0] === stationNorm);
      if (onlyStation) {
        operatorsSummary = headerOperators.map((op) => ({ op, qsos: 0, uniques: 0 }));
      }
    }

    const structureSummary = Array.from(structures.entries()).map(([struct, info]) => ({
      struct,
      example: info.example,
      callsigns: info.callsigns.size,
      qsos: info.qsos
    })).sort((a, b) => b.qsos - a.qsos || a.struct.localeCompare(b.struct));

    const headingByHourSeries = Array.from(headingByHour.entries()).sort((a, b) => a[0] - b[0]).map(([hour, m]) => {
      const sectors = Array.from(m.entries()).sort((a, b) => a[0] - b[0]).map(([sector, count]) => ({ sector, count }));
      return { hour, sectors };
    });

    const frequencySummary = Array.from(freqBins.entries()).sort((a, b) => a[0] - b[0]).map(([freq, count]) => ({
      freq,
      count
    }));

    const fieldsSummary = Array.from(fields.entries()).map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count || a.field.localeCompare(b.field));

    const scoring = computeContestScoringSummary(qsos, contestMeta, {
      logFile: context?.logFile || null,
      sourcePath: context?.sourcePath || ''
    });
    const effectivePointsByIndex = (scoring?.effectivePointsSource === 'computed' && Array.isArray(scoring.computedPointsByIndex) && scoring.computedPointsByIndex.length === qsos.length)
      ? scoring.computedPointsByIndex
      : qsos.map((q) => (Number.isFinite(q?.points) ? q.points : 0));
    const hourPoints = new Map();
    const minutePoints = new Map();
    qsos.forEach((q, idx) => {
      if (!Number.isFinite(q?.ts)) return;
      const points = Number(effectivePointsByIndex[idx] || 0);
      if (!Number.isFinite(points)) return;
      const hourBucket = Math.floor(q.ts / 3600000);
      const minuteBucket = Math.floor(q.ts / 60000);
      hourPoints.set(hourBucket, (hourPoints.get(hourBucket) || 0) + points);
      minutePoints.set(minuteBucket, (minutePoints.get(minuteBucket) || 0) + points);
    });
    const hourPointSeries = Array.from(hourPoints.entries()).sort((a, b) => a[0] - b[0]).map(([hour, points]) => ({ hour, points }));
    const minutePointSeries = Array.from(minutePoints.entries()).sort((a, b) => a[0] - b[0]).map(([minute, points]) => ({ minute, points }));
    const effectivePointsTotal = effectivePointsByIndex.reduce((sum, p) => sum + (Number.isFinite(p) ? p : 0), 0);

    return {
      dupes,
      uniqueCallsCount: calls.size,
      bandSummary,
      bandModeSummary,
      countrySummary,
      continentSummary,
      cqZoneSummary,
      ituZoneSummary,
      hourSeries,
      minuteSeries,
      hourPointSeries,
      minutePointSeries,
      tenMinuteSeries,
      prefixSummary,
      prefixGroups: wpxPrefixGroups,
      callsignLengthSummary,
      notInMasterList,
      allCallsList,
      hoursCountries,
      bandHourCountry,
      operatorsSummary,
      structureSummary,
      distanceSummary: distanceSummary.export(),
      headingSummary: headingSummary.export(),
      headingByHourSeries,
      frequencySummary,
      fieldsSummary,
      station,
      contestMeta,
      scoring,
      comments: Array.from(comments),
      possibleErrors,
      timeRange: { minTs, maxTs },
      breakSummary,
      totalPoints,
      effectivePointsTotal
    };
  }

  function formatDate(ts) {
    if (ts == null) return 'N/A';
    const d = new Date(ts);
    return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, 'Z');
  }

  function formatCqApiNumber(value) {
    if (value == null || value === '') return 'N/A';
    return formatNumberSh6(value);
  }

  function findCqApiCategoryLabel(catlist, category) {
    const key = String(category || '').trim().toUpperCase();
    if (!key || !Array.isArray(catlist)) return '';
    const hit = catlist.find((entry) => String(entry?.category || '').trim().toUpperCase() === key);
    return hit?.description ? String(hit.description).trim() : '';
  }

  function findCqApiGeoLabel(geolist, geo) {
    const key = String(geo || '').trim().toUpperCase();
    if (!key || !geolist || typeof geolist !== 'object') return '';
    return String(geolist[key] || '').trim();
  }

  function formatCqApiMultiplierValue(row) {
    if (!row) return 'N/A';
    const parts = Object.entries(row.multBreakdown || {})
      .filter(([, value]) => Number.isFinite(value))
      .map(([key, value]) => `${escapeHtml(String(key).toUpperCase())} ${formatNumberSh6(value)}`);
    if (!parts.length) return formatCqApiNumber(row.multTotal);
    const total = Number.isFinite(row.multTotal) ? formatNumberSh6(row.multTotal) : '';
    return `${total ? `${total} (` : ''}${parts.join(', ')}${total ? ')' : ''}`;
  }

  function formatCqApiOperatorsCell(primaryOperators) {
    const ops = parseOperatorsList(primaryOperators || '');
    if (!ops.length) return { text: 'N/A', title: '' };
    if (ops.length === 1) return { text: ops[0], title: ops[0] };
    return { text: `${ops.length} ops`, title: ops.join(' ') };
  }

  function buildCqApiDebugPayloadText(payload, maxChars = 18000) {
    if (!payload) return '';
    try {
      const text = JSON.stringify(payload, null, 2);
      if (text.length <= maxChars) return text;
      return `${text.slice(0, maxChars)}\n... [truncated ${text.length - maxChars} chars]`;
    } catch (err) {
      return `Could not stringify debug payload: ${err && err.message ? err.message : String(err)}`;
    }
  }

  function renderCqApiEnrichmentCard(enrichment) {
    const info = enrichment || createApiEnrichmentState();
    if (info.status === 'idle') return '';

    if (info.status === 'loading') {
      return `
        <div class="cqapi-card mtc">
          <div class="gradient">&nbsp;CQ contest API</div>
          <div class="cqapi-body">
            <p>Loading API enrichment data…</p>
          </div>
        </div>
      `;
    }

    if (info.status === 'unsupported') {
      return `
        <div class="cqapi-card mtc">
          <div class="gradient">&nbsp;CQ contest API</div>
          <div class="cqapi-body">
            <p class="cqapi-muted">This log contest is currently not supported by the CQ API endpoints.</p>
          </div>
        </div>
      `;
    }

    if (info.status === 'error') {
      const err = escapeHtml(info.error || 'CQ API request failed.');
      return `
        <div class="cqapi-card mtc">
          <div class="gradient">&nbsp;CQ contest API</div>
          <div class="cqapi-body">
            <p class="status-error">${err}</p>
            <p class="cqapi-helper">If CORS blocks direct calls, use the SH6 helper endpoint on azure.s53m.com.</p>
          </div>
        </div>
      `;
    }

    if (info.status !== 'ready' || !info.data) return '';
    const data = info.data;
    const current = data.currentScore || null;
    const history = Array.isArray(data.history) ? data.history.slice(0, 8) : [];
    const recordsByScope = Array.isArray(data.recordsByScope) ? data.recordsByScope : [];
    const source = info.source || data.source || '';
    const sourceLabel = info.helperActive ? 'helper' : 'direct';
    const sourceText = source ? escapeHtml(source) : 'N/A';
    const currentScoreSource = String(data.currentScoreSource || '').toLowerCase();
    const currentSourceText = currentScoreSource === 'raw'
      ? 'Raw (unofficial/live)'
      : (current ? 'Final (official)' : 'N/A');
    const selectedYear = Number(data.year) || null;
    const category = current?.category || history[0]?.category || data.matchedCategory || '';
    const apiStatusMessage = data.statusMessage ? String(data.statusMessage).trim() : '';
    const categoryLabel = findCqApiCategoryLabel(data.labels?.catlist, category);
    const currentRankYear = Number(current?.year) || null;
    const debugPayloadText = Boolean(window.SH6_API_DEBUG)
      ? buildCqApiDebugPayloadText(data.debugPayload)
      : '';
    const debugBlock = debugPayloadText
      ? `<details class="cqapi-debug"><summary>Debug payload</summary><pre>${escapeHtml(debugPayloadText)}</pre></details>`
      : '';
    const scopeRows = ['dxcc', 'continent', 'world'].map((scopeKey, idx) => {
      const entry = recordsByScope.find((item) => String(item?.scope || '').toLowerCase() === scopeKey) || null;
      const geoCode = String(entry?.geo || '').trim().toUpperCase();
      const matchedGeoCode = String(entry?.matchedGeo || '').trim().toUpperCase();
      const geoSuffix = matchedGeoCode && geoCode && matchedGeoCode !== geoCode
        ? ` (via ${escapeHtml(matchedGeoCode)})`
        : '';
      const geoLabel = findCqApiGeoLabel(data.labels?.geolist, geoCode);
      const geoText = geoCode ? `${escapeHtml(geoCode)}${geoLabel ? ` - ${escapeHtml(geoLabel)}` : ''}${geoSuffix}` : 'N/A';
      const row = entry?.row || null;
      const recordCategory = String(row?.category || entry?.category || '').trim().toUpperCase();
      const recordCategoryLabel = findCqApiCategoryLabel(data.labels?.catlist, recordCategory);
      const categoryText = recordCategory
        ? `${escapeHtml(recordCategory)}${recordCategoryLabel ? ` - ${escapeHtml(recordCategoryLabel)}` : ''}`
        : 'N/A';
      const holderText = row?.callsign
        ? `${escapeHtml(row.callsign)} (${formatYearSh6(row?.year)})`
        : 'N/A';
      const scopeTitle = scopeKey === 'dxcc'
        ? 'DXCC'
        : (scopeKey === 'continent' ? 'Continent' : 'World');
      return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td>${scopeTitle}</td>
          <td>${geoText}</td>
          <td>${categoryText}</td>
          <td>${holderText}</td>
          <td><strong>${formatCqApiNumber(row?.score)}</strong></td>
          <td>${formatCqApiMultiplierValue(row)}</td>
        </tr>
      `;
    }).join('');
    const historyRows = history.map((row, idx) => {
      const isCurrent = selectedYear && Number(row?.year) === selectedYear;
      const trClass = isCurrent ? 'cqapi-history-current' : (idx % 2 === 0 ? 'td1' : 'td0');
      const operatorsCell = formatCqApiOperatorsCell(row?.operators);
      const operatorsTitleAttr = operatorsCell.title ? ` title="${escapeAttr(operatorsCell.title)}"` : '';
      const categoryText = escapeHtml(String(row?.category || 'N/A').toUpperCase());
      const historyYear = Number(row?.year);
      const historyCall = normalizeCall(row?.callsign || data.callsign || '');
      const canLoadCompare = Number.isFinite(historyYear) && Boolean(historyCall) && Boolean(data?.contestId) && Boolean(data?.mode);
      const loadActions = canLoadCompare
        ? ['B', 'C', 'D'].map((slotId) => (
          `<button type="button" class="cqapi-load-btn" data-slot="${slotId}" data-year="${escapeAttr(String(historyYear))}" data-callsign="${escapeAttr(historyCall)}" data-contest="${escapeAttr(String(data.contestId || ''))}" data-mode="${escapeAttr(String(data.mode || ''))}" title="Load this log into Log ${slotId}">${slotId}</button>`
        )).join('')
        : '<span class="cqapi-muted">N/A</span>';
      return `
        <tr class="${trClass}">
          <td>${formatYearSh6(row?.year)}</td>
          <td>${categoryText}</td>
          <td>${formatCqApiNumber(row?.score)}</td>
          <td>${formatCqApiNumber(row?.qsos)}</td>
          <td>${formatCqApiMultiplierValue(row)}</td>
          <td class="cqapi-load-cell">${loadActions}</td>
          <td${operatorsTitleAttr}>${escapeHtml(operatorsCell.text)}</td>
        </tr>
      `;
    }).join('');
    const noHistory = historyRows ? '' : '<p class="cqapi-muted">No historical rows were returned for this callsign.</p>';
    return `
      <div class="cqapi-card mtc">
        <div class="gradient">&nbsp;CQ contest API</div>
        <div class="cqapi-body">
          <div class="cqapi-source" title="${escapeAttr(source || '')}">Source: ${sourceText} <span class="cqapi-helper">${escapeHtml(sourceLabel)}</span></div>
          ${apiStatusMessage ? `<div class="cqapi-msg">API message: ${escapeHtml(apiStatusMessage)}</div>` : ''}
          <table class="mtc cqapi-table">
            <tr class="thc"><th>Metric</th><th>Value</th></tr>
            <tr class="td1"><td>Contest / mode</td><td>${escapeHtml(data.contestId || 'N/A')} / ${escapeHtml((data.mode || '').toUpperCase() || 'N/A')}</td></tr>
            <tr class="td0"><td>Selected year</td><td>${formatYearSh6(currentRankYear || selectedYear)}</td></tr>
            <tr class="td1"><td>Current score</td><td><strong>${formatCqApiNumber(current?.score)}</strong></td></tr>
            <tr class="td0"><td>Current QSOs</td><td>${formatCqApiNumber(current?.qsos)}</td></tr>
            <tr class="td1"><td>Current multipliers</td><td>${formatCqApiMultiplierValue(current)}</td></tr>
            <tr class="td0"><td>Current score source</td><td>${escapeHtml(currentSourceText)}</td></tr>
            <tr class="td1"><td>Category</td><td>${escapeHtml(category || 'N/A')}${categoryLabel ? ` - ${escapeHtml(categoryLabel)}` : ''}</td></tr>
          </table>
          <table class="mtc cqapi-records">
            <tr class="thc"><th>Scope</th><th>Geo</th><th>Category</th><th>Record holder</th><th>Score</th><th>Mult</th></tr>
            ${scopeRows}
          </table>
          ${noHistory}
          ${historyRows ? `
            <div class="cqapi-history-wrap">
              <table class="mtc cqapi-history">
                <tr class="thc"><th>Year</th><th>Category</th><th>Score</th><th>QSOs</th><th>Mult</th><th>Load this log to slot</th><th>Ops</th></tr>
                ${historyRows}
              </table>
            </div>
          ` : ''}
          ${debugBlock}
        </div>
      </div>
    `;
  }

  function renderMain() {
    if (!state.qsoData || !state.derived) return renderPlaceholder({ id: 'main', title: 'Main' });
    const totalQsos = state.qsoData.qsos.length;
    const dupes = state.derived.dupes.length;
    const uniques = state.derived.uniqueCallsCount;
    const duration = (state.derived.timeRange.maxTs && state.derived.timeRange.minTs)
      ? Math.round((state.derived.timeRange.maxTs - state.derived.timeRange.minTs) / 60000)
      : null;
    const participation = duration != null ? formatMinutes(duration) : 'N/A';
    const breakMinutes = state.derived.breakSummary?.totalBreakMin || 0;
    const breakTime = duration != null ? formatMinutes(breakMinutes) : 'N/A';
    const operatingMinutes = duration != null ? Math.max(duration - breakMinutes, 0) : null;
    const operatingTime = operatingMinutes != null ? formatMinutes(operatingMinutes) : 'N/A';
    const qsosPerStation = uniques ? (totalQsos / uniques).toFixed(2) : 'N/A';
    const kmPerQso = state.derived.distanceSummary?.avg ? `${state.derived.distanceSummary.avg.toFixed(0)} km` : 'N/A';
    const countries = state.derived.countrySummary?.length || 0;
    const fields = state.derived.fieldsSummary?.length || 0;
    const notInMaster = state.derived.notInMasterList?.length || 0;
    const notInMasterPct = uniques ? ((notInMaster / uniques) * 100).toFixed(2) : '0.00';
    const prefixes = state.derived.prefixSummary?.length || 0;
    const stationCallRaw = state.derived.contestMeta?.stationCallsign || '';
    const stationPrefix = stationCallRaw ? lookupPrefix(stationCallRaw) : null;
    const stationCountry = escapeHtml(stationPrefix?.country || 'N/A');
    const locator = escapeHtml(state.derived.station?.source === 'grid' ? state.derived.station.value : 'N/A');
    const operators = escapeHtml(state.derived.operatorsSummary?.map((o) => o.op).join(' ') || 'N/A');
    const contest = escapeHtml(state.derived.contestMeta?.contestId || 'N/A');
    const category = escapeHtml(state.derived.contestMeta?.category || 'N/A');
    const scoring = state.derived.scoring || {};
    const claimedHeader = Number.isFinite(scoring.claimedScoreHeader)
      ? scoring.claimedScoreHeader
      : parseClaimedScoreNumber(state.derived.contestMeta?.claimedScore);
    const claimedDisplay = Number.isFinite(claimedHeader) ? `${formatNumberSh6(claimedHeader)} pts` : 'N/A';
    const computedScore = Number.isFinite(scoring.computedScore) ? `${formatNumberSh6(scoring.computedScore)} pts` : 'N/A';
    const deltaDisplay = Number.isFinite(scoring.scoreDeltaAbs)
      ? `${scoring.scoreDeltaAbs >= 0 ? '+' : ''}${formatNumberSh6(scoring.scoreDeltaAbs)}${Number.isFinite(scoring.scoreDeltaPct) ? ` (${scoring.scoreDeltaPct.toFixed(1)}%)` : ''}`
      : 'N/A';
    const loggedPoints = Number.isFinite(scoring.loggedPointsTotal) ? scoring.loggedPointsTotal : state.derived.totalPoints;
    const loggedPointsDisplay = Number.isFinite(loggedPoints) ? `${formatNumberSh6(loggedPoints)} pts` : 'N/A';
    const computedPointsDisplay = Number.isFinite(scoring.computedQsoPointsTotal) ? `${formatNumberSh6(scoring.computedQsoPointsTotal)} pts` : 'N/A';
    const multiplierDisplay = Number.isFinite(scoring.computedMultiplierTotal) ? formatNumberSh6(scoring.computedMultiplierTotal) : 'N/A';
    const confidenceLabel = escapeHtml(scoring.confidence || 'unknown');
    const confidenceClass = (scoring.confidence === 'high')
      ? 'loaded'
      : (scoring.confidence === 'medium' ? 'empty' : 'skipped');
    const scoringRule = escapeHtml(scoring.ruleName || 'Unknown');
    const scoringAssumptions = Array.isArray(scoring.assumptions) && scoring.assumptions.length
      ? escapeHtml(scoring.assumptions.join(' | '))
      : '';
    const scoringWarning = scoring.warning
      ? `<div class="recon-note scoring-note">${escapeHtml(scoring.warning)}</div>`
      : '';
    const software = escapeHtml(state.derived.contestMeta?.software || 'N/A');
    const club = escapeHtml(state.derived.contestMeta?.club || 'N/A');
    const stationCall = stationCallRaw ? escapeHtml(stationCallRaw) : 'N/A';

    const reconNote = state.logFile?.reconstructed
      ? `<div class="recon-note">${escapeHtml(RECONSTRUCTED_NOTICE)}</div>`
      : '';
    const rows = [
      ['Callsign', `<strong>${stationCall}</strong>`],
      ['Country', stationCountry],
      ['Locator', locator],
      ['Event', contest],
      ['Category', category],
      ['Operators', operators],
      ['Start date', formatDateSh6(state.derived.timeRange.minTs)],
      ['End date', formatDateSh6(state.derived.timeRange.maxTs)],
      ['Participation time', participation],
      ['Break time', breakTime],
      ['Operating time', operatingTime],
      ['QSOs', `<strong>${formatNumberSh6(totalQsos)}</strong>`],
      ['Dupes', formatNumberSh6(dupes)],
      ['Unique callsigns', formatNumberSh6(uniques)],
      ['QSOs per station', qsosPerStation],
      ['Kilometers per QSO', kmPerQso],
      ['Countries', formatNumberSh6(countries)],
      ['Fields', formatNumberSh6(fields)],
      ['Moves', 'N/A'],
      ['Claimed score (header)', `<strong>${claimedDisplay}</strong>`],
      ['Computed score (rules)', `<strong>${computedScore}</strong>`],
      ['Score delta', deltaDisplay],
      ['Logged points total', loggedPointsDisplay],
      ['Computed QSO points', computedPointsDisplay],
      ['Computed multipliers', multiplierDisplay],
      ['Scoring rule', scoringRule],
      ['Scoring confidence', `<span class="summary-chip ${confidenceClass}">${confidenceLabel}</span>`],
      ['Scoring assumptions', scoringAssumptions || 'None'],
      ['Software', software],
      ['Callsigns not found in SH6.master', `${formatNumberSh6(notInMaster)} (${notInMasterPct}%)`],
      ['Prefixes', formatNumberSh6(prefixes)],
      ['Club', club]
    ];
    const cqApiCard = renderCqApiEnrichmentCard(state.apiEnrichment);
    const intro = renderReportIntroCard(
      'Main performance snapshot',
      'Quick diagnostic summary for the loaded log and scoring model.',
      [
        `Callsign ${stationCallRaw || 'N/A'}`,
        `Contest ${state.derived.contestMeta?.contestId || 'N/A'}`,
        `Category ${state.derived.contestMeta?.category || 'N/A'}`,
        `${formatNumberSh6(totalQsos)} QSOs`
      ]
    );
    const rowHtml = rows.map(([label, value], idx) => `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}"><td>${label}</td><td>${value}</td></tr>
      `).join('');
    return `
      ${intro}
      ${reconNote}
      ${scoringWarning}
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;">
        <tr class="thc"><th>Parameter</th><th>Value</th></tr>
        ${rowHtml}
      </table>
      ${cqApiCard}
    `;
  }

  function renderCompetitorCoach() {
    if (!state.qsoData || !state.derived) {
      return renderPlaceholder({ id: 'competitor_coach', title: 'Competitor coach' });
    }
    const context = buildCompetitorCoachContext(state.cqApiClient || null);
    const coach = state.competitorCoach || createCompetitorCoachState();
    const selectedScope = context.ok
      ? (context.scopeValues?.[normalizeCoachScopeType(coach.scopeType)]
          ? normalizeCoachScopeType(coach.scopeType)
          : (['dxcc', 'continent', 'cq_zone', 'itu_zone'].find((key) => context.scopeValues?.[key]) || normalizeCoachScopeType(coach.scopeType)))
      : normalizeCoachScopeType(coach.scopeType);
    const categoryMode = coach.categoryMode === 'all' ? 'all' : 'same';
    const targetCategory = normalizeCoachCategory(coach.targetCategory || context.targetCategory || '');
    const categoryLabel = findCqApiCategoryLabel(state.apiEnrichment?.data?.labels?.catlist, targetCategory);
    const scopeValueText = context.ok ? String(context.scopeValues?.[selectedScope] || '') : '';
    const sourceRowsText = Number.isFinite(coach.sourceRows) ? formatNumberSh6(coach.sourceRows) : 'N/A';
    const statusText = coach.status === 'loading'
      ? '<p>Loading competitor cohort...</p>'
      : coach.status === 'error'
        ? `<p class="status-error">${escapeHtml(coach.error || 'Unable to load competitor cohort.')}</p>`
        : '';

    // Legacy coaching notes were replaced by the tactical briefing cards below.

    const current = coach.currentRow || null;
    const currentRank = Number.isFinite(current?.rank) ? current.rank : null;
    const currentRankText = Number.isFinite(currentRank) ? formatNumberSh6(currentRank) : 'N/A';
    const currentSummary = current
      ? `${escapeHtml(current.callsign || 'N/A')} · rank ${currentRankText} · ${formatCqApiNumber(current.score)}`
      : 'Current entry not detected in filtered cohort.';

    const rows = Array.isArray(coach.rows) ? coach.rows : [];
    const closestRivals = Array.isArray(coach.closestRivals) ? coach.closestRivals : [];
    const nearestAhead = closestRivals.find((row) => Number.isFinite(Number(row?.scoreGap)) && Number(row.scoreGap) > 0) || null;
    const nearestAny = closestRivals[0] || null;
    const nearestBehind = closestRivals.find((row) => Number.isFinite(Number(row?.scoreGap)) && Number(row.scoreGap) < 0) || null;
    const preferredSlot = COMPARE_SLOT_IDS.find((slotId) => !getSlotById(slotId)?.qsoData) || 'B';
    const coachContest = String(coach.contestId || context.contestId || '').trim().toUpperCase();
    const coachMode = String(coach.mode || context.mode || '').trim().toLowerCase();
    const quickActionRow = nearestAhead || nearestAny;
    const quickActionYear = Number(quickActionRow?.year);
    const quickActionCall = normalizeCall(quickActionRow?.callsign || '');
    const quickActionReady = Boolean(quickActionRow) && Number.isFinite(quickActionYear) && Boolean(quickActionCall) && Boolean(coachContest) && Boolean(coachMode);
    const quickActionGap = quickActionRow && Number.isFinite(Number(quickActionRow?.scoreGap))
      ? `${Number(quickActionRow.scoreGap) >= 0 ? '+' : ''}${formatNumberSh6(Math.round(Math.abs(Number(quickActionRow.scoreGap))))}`
      : 'N/A';
    const quickActionHint = !rows.length
      ? 'No cohort rows yet. Switch scope/category to widen competitor coverage.'
      : !current
        ? 'Current station is not present in this filtered cohort. Try Category = All categories.'
        : rows.length === 1
          ? 'Only one row in cohort. Switch to a wider scope to find direct rivals.'
          : quickActionRow
            ? `Nearest rival is ${quickActionCall} (${quickActionGap} score gap). Load it to Log ${preferredSlot} for direct comparison.`
            : 'Select any row below and load it to Log B/C/D for side-by-side analysis.';
    const quickActionButton = quickActionReady
      ? (() => {
        const rowKey = buildCoachRowKey({
          callsign: quickActionCall,
          year: quickActionYear,
          contestId: coachContest,
          mode: coachMode
        });
        const slotAssigned = rowKey && rowKey === String(coach.loadedSlotRows?.[preferredSlot] || '');
        return `
          <button
            type="button"
            class="cqapi-load-btn coach-load-btn coach-quick-load${slotAssigned ? ' is-target' : ''}"
            data-slot="${preferredSlot}"
            data-row-key="${escapeAttr(rowKey)}"
            data-year="${escapeAttr(String(quickActionYear))}"
            data-callsign="${escapeAttr(quickActionCall)}"
            data-contest="${escapeAttr(coachContest)}"
            data-mode="${escapeAttr(coachMode)}"
            aria-pressed="${slotAssigned ? 'true' : 'false'}"
          >
            Load nearest rival to Log ${preferredSlot}
          </button>
        `;
      })()
      : '';

    const gapDriver = coach.gapDriver && typeof coach.gapDriver === 'object' ? coach.gapDriver : null;
    const gapDriverDirection = gapDriver?.direction === 'defending' ? 'Defend lead vs' : 'Chasing';
    const gapDriverCall = escapeHtml(gapDriver?.targetCallsign || 'N/A');
    const gapDriverScore = Number.isFinite(gapDriver?.scoreGap)
      ? formatNumberSh6(Math.round(Number(gapDriver.scoreGap)))
      : 'N/A';
    const gapDriverQso = Number.isFinite(gapDriver?.qsoGap)
      ? `${Number(gapDriver.qsoGap) >= 0 ? '+' : ''}${formatNumberSh6(Math.round(Number(gapDriver.qsoGap)))}`
      : 'N/A';
    const gapDriverMult = Number.isFinite(gapDriver?.multGap)
      ? `${Number(gapDriver.multGap) >= 0 ? '+' : ''}${formatNumberSh6(Math.round(Number(gapDriver.multGap)))}`
      : 'N/A';
    const gapDriverShare = Number.isFinite(gapDriver?.driverSharePct) ? `${Number(gapDriver.driverSharePct).toFixed(1)}%` : 'N/A';
    const gapDriverPrimary = gapDriver?.driver === 'qso'
      ? 'QSO volume'
      : (gapDriver?.driver === 'mult' ? 'Multipliers' : 'Mixed');
    const gapDriverAction = gapDriver?.driver === 'qso'
      ? (Number.isFinite(gapDriver?.neededQsos) ? `${formatNumberSh6(Math.round(Number(gapDriver.neededQsos)))} extra QSOs at current efficiency.` : 'Increase sustained rate in high-value hours.')
      : (gapDriver?.driver === 'mult'
          ? (Number.isFinite(gapDriver?.neededMults) ? `${formatNumberSh6(Math.round(Number(gapDriver.neededMults)))} additional multipliers at current efficiency.` : 'Prioritize multiplier hunting windows.')
          : 'Balance rate and multiplier runs to close the gap faster.');
    const gapDriverBlock = gapDriver
      ? `
        <div class="coach-driver-card">
          <h4>Gap driver</h4>
          <ul class="coach-driver-list">
            <li>${gapDriverDirection} <b>${gapDriverCall}</b> (score gap: <b>${gapDriverScore}</b>).</li>
            <li>Primary driver: <b>${gapDriverPrimary}</b> (estimated share: ${gapDriverShare}).</li>
            <li>QSO gap: ${gapDriverQso} | Mult gap: ${gapDriverMult}</li>
            <li>Recommended next move: ${escapeHtml(gapDriverAction)}</li>
          </ul>
        </div>
      `
      : '';

    const durationHours = (() => {
      const minTs = Number(state.derived?.timeRange?.minTs);
      const maxTs = Number(state.derived?.timeRange?.maxTs);
      if (!Number.isFinite(minTs) || !Number.isFinite(maxTs)) return null;
      const startHour = Math.floor(minTs / 3600000);
      const endHour = Math.floor(maxTs / 3600000);
      return Math.max(1, endHour - startHour + 1);
    })();
    const activeHours = Array.isArray(state.derived?.hourPointSeries) ? state.derived.hourPointSeries.length : null;
    const currentScore = Number(current?.score);
    const currentQsos = Number(current?.qsos);
    const currentMult = Number(current?.multTotal);
    const avgScorePerHour = Number.isFinite(currentScore) && Number.isFinite(durationHours) && durationHours > 0 ? currentScore / durationHours : null;
    const avgScorePerActiveHour = Number.isFinite(currentScore) && Number.isFinite(activeHours) && activeHours > 0 ? currentScore / activeHours : null;
    const avgScorePerQso = Number.isFinite(currentScore) && Number.isFinite(currentQsos) && currentQsos > 0 ? currentScore / currentQsos : null;
    const avgScorePerMult = Number.isFinite(currentScore) && Number.isFinite(currentMult) && currentMult > 0 ? currentScore / currentMult : null;

    const isSameCohortEntry = (a, b) => {
      if (!a || !b) return false;
      const callA = normalizeCall(a.callsign || '');
      const callB = normalizeCall(b.callsign || '');
      const catA = normalizeCoachCategory(a.category || '');
      const catB = normalizeCoachCategory(b.category || '');
      return Boolean(callA) && callA === callB && Boolean(catA) && catA === catB;
    };

    const renderCoachBriefCard = (title, row, opts = {}) => {
      const kind = String(opts.kind || '').trim().toLowerCase();
      const fallbackText = opts.fallbackText || '';
      if (!row || typeof row !== 'object') {
        return `
          <article class="coach-brief-card">
            <div class="coach-brief-head">
              <h4>${escapeHtml(title)}</h4>
              <span class="coach-severity-badge coach-severity-info">Info</span>
            </div>
            <p class="coach-brief-note">${escapeHtml(fallbackText || 'No target available for this card in the current cohort.')}</p>
            <div class="coach-brief-actions">
              <button type="button" class="coach-brief-btn coach-brief-nav" data-report="spots">Missed multipliers (Spots)</button>
              <button type="button" class="coach-brief-btn coach-brief-nav" data-report="graphs_points_by_hour">Points by hour</button>
            </div>
          </article>
        `;
      }

      const rowYear = Number(row?.year);
      const rowCall = normalizeCall(row?.callsign || '');
      const rowCategory = normalizeCoachCategory(row?.category || '');
      const scoreGap = Number(row?.scoreGap);
      const qsoGap = Number(row?.qsoGap);
      const multGap = Number(row?.multGap);
      const absScoreGap = Number.isFinite(scoreGap) ? Math.abs(scoreGap) : null;

      const isLeader = kind === 'leader' && current && isSameCohortEntry(row, current);
      const isAheadTarget = kind === 'chase' || kind === 'leader';
      const scoreVerb = Number.isFinite(scoreGap)
        ? (isLeader ? 'You are the leader.' : (scoreGap > 0 ? 'Behind by' : 'Ahead by'))
        : 'Score gap';
      const scoreText = Number.isFinite(absScoreGap) ? formatNumberSh6(Math.round(absScoreGap)) : 'N/A';

      const qsoDeficit = Number.isFinite(qsoGap) ? Math.max(0, Math.round(qsoGap)) : null;
      const multDeficit = Number.isFinite(multGap) ? Math.max(0, Math.round(multGap)) : null;
      const qsoLead = Number.isFinite(qsoGap) ? Math.max(0, Math.round(-qsoGap)) : null;
      const multLead = Number.isFinite(multGap) ? Math.max(0, Math.round(-multGap)) : null;

      const neededQsos = Number.isFinite(absScoreGap) && Number.isFinite(avgScorePerQso) && avgScorePerQso > 0
        ? Math.ceil(absScoreGap / avgScorePerQso)
        : null;
      const neededMults = Number.isFinite(absScoreGap) && Number.isFinite(avgScorePerMult) && avgScorePerMult > 0
        ? Math.ceil(absScoreGap / avgScorePerMult)
        : null;
      const neededHoursOverall = Number.isFinite(absScoreGap) && Number.isFinite(avgScorePerHour) && avgScorePerHour > 0
        ? absScoreGap / avgScorePerHour
        : null;
      const neededHoursActive = Number.isFinite(absScoreGap) && Number.isFinite(avgScorePerActiveHour) && avgScorePerActiveHour > 0
        ? absScoreGap / avgScorePerActiveHour
        : null;

      const severity = (() => {
        if (isLeader) return 'opportunity';
        const pct = Number(row?.scoreGapPct);
        if (!Number.isFinite(pct)) return Number.isFinite(absScoreGap) && absScoreGap > 0 ? 'medium' : 'info';
        const absPct = Math.abs(pct);
        if (kind === 'defend') {
          if (absPct <= 1.0) return 'high';
          if (absPct <= 3.0) return 'medium';
          return 'opportunity';
        }
        if (absPct >= 10) return 'high';
        if (absPct >= 4) return 'medium';
        return 'opportunity';
      })();

      const canLoad = Number.isFinite(rowYear) && Boolean(rowCall) && Boolean(coachContest) && Boolean(coachMode);
      const rowKey = canLoad ? buildCoachRowKey({
        callsign: rowCall,
        year: rowYear,
        contestId: coachContest,
        mode: coachMode
      }) : '';
      const slotAssigned = rowKey && rowKey === String(coach.loadedSlotRows?.[preferredSlot] || '');
      const loadButton = canLoad
        ? `
          <button
            type="button"
            class="cqapi-load-btn coach-load-btn coach-brief-btn${slotAssigned ? ' is-target' : ''}"
            data-slot="${preferredSlot}"
            data-row-key="${escapeAttr(rowKey)}"
            data-year="${escapeAttr(String(rowYear))}"
            data-callsign="${escapeAttr(rowCall)}"
            data-contest="${escapeAttr(coachContest)}"
            data-mode="${escapeAttr(coachMode)}"
            aria-pressed="${slotAssigned ? 'true' : 'false'}"
          >
            Load ${escapeHtml(rowCall)} to Log ${preferredSlot}
          </button>
        `
        : '';

      const showMultHunt = kind !== 'defend'
        ? (Number.isFinite(multDeficit) && multDeficit > 0)
        : (Number.isFinite(multGap) && multGap > 0);
      const multHint = showMultHunt
        ? 'Prioritize missed multipliers (Spots coach has a missed mult table).'
        : 'Multipliers are not the obvious deficit versus this target.';

      const rateHint = Number.isFinite(avgScorePerHour)
        ? `Your average score rate is ~${formatNumberSh6(Math.round(avgScorePerHour))} score/hour (overall).`
        : 'Points/score rate estimate unavailable (missing time range).';

      const hoursHint = (Number.isFinite(neededHoursOverall) || Number.isFinite(neededHoursActive))
        ? `At your pace, the score swing is ~${Number.isFinite(neededHoursOverall) ? neededHoursOverall.toFixed(1) : 'N/A'}h overall (or ~${Number.isFinite(neededHoursActive) ? neededHoursActive.toFixed(1) : 'N/A'}h active).`
        : 'Hours-to-close estimate unavailable.';

      const gapLine = Number.isFinite(scoreGap)
        ? `<li><b>${scoreVerb}</b> <b>${scoreText}</b> score vs <b>${escapeHtml(rowCall || 'N/A')}</b>${rowCategory ? ` (${escapeHtml(rowCategory)})` : ''}.</li>`
        : `<li><b>Target</b> ${escapeHtml(rowCall || 'N/A')}${rowCategory ? ` (${escapeHtml(rowCategory)})` : ''}.</li>`;

      const deltaLine = (() => {
        if (!Number.isFinite(qsoGap) && !Number.isFinite(multGap)) return '<li>QSO/mult deltas: N/A.</li>';
        const q = Number.isFinite(qsoGap) ? `${qsoGap >= 0 ? '+' : ''}${formatNumberSh6(Math.round(qsoGap))}` : 'N/A';
        const m = Number.isFinite(multGap) ? `${multGap >= 0 ? '+' : ''}${formatNumberSh6(Math.round(multGap))}` : 'N/A';
        return `<li>Gap breakdown: QSO delta ${q} | Mult delta ${m}.</li>`;
      })();

      const planLine = (() => {
        if (isLeader) {
          const defendText = nearestBehind ? `Nearest defender is ${escapeHtml(normalizeCall(nearestBehind.callsign || '') || 'N/A')}.` : 'No close defender detected.';
          return `<li>${defendText} Keep points rate high in your best hours and watch mult leakage.</li>`;
        }
        const parts = [];
        if (Number.isFinite(qsoDeficit) && qsoDeficit > 0) parts.push(`${formatNumberSh6(qsoDeficit)} QSOs`);
        if (Number.isFinite(multDeficit) && multDeficit > 0) parts.push(`${formatNumberSh6(multDeficit)} mults`);
        const deficitText = parts.length ? `Deficit vs target: ${parts.join(' and ')}.` : 'No direct QSO/mult deficit detected; improve efficiency and rate.';
        return `<li>${deficitText}</li>`;
      })();

      const equivalenceLine = (() => {
        if (!Number.isFinite(absScoreGap) || absScoreGap <= 0) return '<li>Equivalent effort: N/A.</li>';
        const qEq = Number.isFinite(neededQsos) ? `${formatNumberSh6(neededQsos)} QSOs` : 'N/A QSOs';
        const mEq = Number.isFinite(neededMults) ? `${formatNumberSh6(neededMults)} mults` : 'N/A mults';
        return `<li>Equivalent effort at your efficiency: ~${qEq} or ~${mEq}.</li>`;
      })();

      return `
        <article class="coach-brief-card coach-brief-${escapeAttr(kind || 'card')}">
          <div class="coach-brief-head">
            <h4>${escapeHtml(title)}</h4>
            <span class="coach-severity-badge coach-severity-${normalizeCoachSeverity(severity)}">${coachSeverityLabel(severity)}</span>
          </div>
          <p class="coach-brief-note">${escapeHtml(rateHint)} ${escapeHtml(hoursHint)}</p>
          <ul class="coach-brief-list">
            ${gapLine}
            ${deltaLine}
            ${planLine}
            ${equivalenceLine}
            <li><b>Multiplier focus:</b> ${escapeHtml(multHint)}</li>
          </ul>
          <div class="coach-brief-actions">
            <button type="button" class="coach-brief-btn coach-brief-nav" data-report="graphs_points_by_hour">Points by hour</button>
            <button type="button" class="coach-brief-btn coach-brief-nav" data-report="one_minute_point_rates">1-minute point rates</button>
            <button type="button" class="coach-brief-btn coach-brief-nav" data-report="spots">Missed multipliers (Spots)</button>
            ${loadButton}
          </div>
        </article>
      `;
    };

    const leaderRow = rows.length ? rows[0] : null;
    const coachBriefingBlock = `
      <div class="coach-brief-wrap">
        <h4>Coach briefing (leader, chase, defend)</h4>
        <div class="coach-brief-grid">
          ${renderCoachBriefCard('Leader target', leaderRow, {
            kind: 'leader',
            fallbackText: 'No leader row detected yet. Expand scope/category for a wider cohort.'
          })}
          ${renderCoachBriefCard('Chase target (nearest ahead)', nearestAhead, {
            kind: 'chase',
            fallbackText: 'No station ahead detected. You may be leading this cohort.'
          })}
          ${renderCoachBriefCard('Defend target (nearest behind)', nearestBehind, {
            kind: 'defend',
            fallbackText: 'No station behind detected. Cohort may be very small.'
          })}
        </div>
      </div>
    `;

    const rivalsBlock = closestRivals.length
      ? `
        <div class="coach-rivals-card">
          <h4>Closest rivals</h4>
          <table class="mtc coach-rivals-table">
            <tr class="thc"><th>Rank</th><th>Callsign</th><th>Category</th><th>Score</th><th>Gap</th><th>Action</th></tr>
            ${closestRivals.slice(0, 5).map((row, idx) => {
          const rowYear = Number(row?.year);
          const rowCall = normalizeCall(row?.callsign || '');
          const rowCategory = normalizeCoachCategory(row?.category || '');
          const rowGap = Number(row?.scoreGap);
          const rowGapText = Number.isFinite(rowGap)
            ? `${rowGap >= 0 ? '+' : ''}${formatNumberSh6(Math.round(Math.abs(rowGap)))}`
            : 'N/A';
          const canLoad = Number.isFinite(rowYear) && Boolean(rowCall) && Boolean(coachContest) && Boolean(coachMode);
          const rowKey = canLoad ? buildCoachRowKey({
            callsign: rowCall,
            year: rowYear,
            contestId: coachContest,
            mode: coachMode
          }) : '';
          const slotAssigned = rowKey && rowKey === String(coach.loadedSlotRows?.[preferredSlot] || '');
          const action = canLoad
            ? `<button type="button" class="cqapi-load-btn coach-load-btn coach-quick-load${slotAssigned ? ' is-target' : ''}" data-slot="${preferredSlot}" data-row-key="${escapeAttr(rowKey)}" data-year="${escapeAttr(String(rowYear))}" data-callsign="${escapeAttr(rowCall)}" data-contest="${escapeAttr(coachContest)}" data-mode="${escapeAttr(coachMode)}" aria-pressed="${slotAssigned ? 'true' : 'false'}">Load to Log ${preferredSlot}</button>`
            : '<span class="cqapi-muted">N/A</span>';
          return `
              <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
                <td>${formatCqApiNumber(row?.rank)}</td>
                <td>${escapeHtml(rowCall || 'N/A')}</td>
                <td>${escapeHtml(rowCategory || 'N/A')}</td>
                <td>${formatCqApiNumber(row?.score)}</td>
                <td>${rowGapText}</td>
                <td>${action}</td>
              </tr>
            `;
        }).join('')}
          </table>
        </div>
      `
      : '';

    const quickActionBlock = `
      <div class="coach-quick-actions">
        <div class="coach-quick-hint">${escapeHtml(quickActionHint)}</div>
        ${quickActionButton}
      </div>
    `;

    const currentScoreValue = Number(current?.score);
    const nearestAheadGap = Number(nearestAhead?.scoreGap);
    const nearestAheadPct = Number.isFinite(nearestAheadGap) && Number.isFinite(currentScoreValue) && currentScoreValue > 0
      ? (nearestAheadGap / currentScoreValue) * 100
      : null;
    const cohortSeverity = !rows.length
      ? 'critical'
      : (!current ? 'high' : (rows.length === 1 ? 'medium' : 'opportunity'));
    const gapSeverity = !nearestAhead
      ? 'info'
      : (!Number.isFinite(nearestAheadPct)
          ? 'medium'
          : (nearestAheadPct >= 25 ? 'high' : (nearestAheadPct >= 10 ? 'medium' : 'opportunity')));
    const executionSeverity = !gapDriver
      ? 'info'
      : (gapDriver?.driver === 'mixed' ? 'medium' : 'opportunity');
    const cohortSummary = !rows.length
      ? 'No direct competitors were found with current filters.'
      : (!current
          ? 'Your station is not present in this filtered cohort.'
          : (rows.length === 1
              ? 'Only one entry matched the filters; expand scope for stronger benchmarking.'
              : `Cohort is healthy with ${formatCqApiNumber(rows.length)} comparable entries.`));
    const gapSummary = !nearestAhead
      ? 'You are currently leading this filtered cohort.'
      : `Nearest station ahead is ${escapeHtml(normalizeCall(nearestAhead.callsign || '') || 'N/A')} (${formatNumberSh6(Math.abs(Math.round(nearestAheadGap || 0)))} points${Number.isFinite(nearestAheadPct) ? `, ${nearestAheadPct.toFixed(1)}%` : ''}).`;
    const executionSummary = !gapDriver
      ? 'No dominant gap driver detected yet. Keep tracking both rate and multipliers.'
      : `Primary improvement axis is ${escapeHtml(gapDriverPrimary)}. Recommended move: ${escapeHtml(gapDriverAction)}`;
    const priorityCards = [
      {
        title: 'Cohort health',
        level: cohortSeverity,
        summary: cohortSummary
      },
      {
        title: 'Closest chase target',
        level: gapSeverity,
        summary: gapSummary
      },
      {
        title: 'Execution priority',
        level: executionSeverity,
        summary: executionSummary
      }
    ];
    const priorityBlock = `
      <div class="coach-priority-grid">
        ${priorityCards.map((card) => `
          <article class="coach-priority-card coach-priority-${normalizeCoachSeverity(card.level)}">
            <div class="coach-priority-head">
              <h4>${escapeHtml(card.title)}</h4>
              <span class="coach-severity-badge coach-severity-${normalizeCoachSeverity(card.level)}">${coachSeverityLabel(card.level)}</span>
            </div>
            <p>${card.summary}</p>
          </article>
        `).join('')}
      </div>
    `;

    const tableRows = rows.map((row, idx) => {
      const rowYear = Number(row?.year);
      const rowCall = normalizeCall(row?.callsign || '');
      const rowCategory = normalizeCoachCategory(row?.category || '');
      const rowContest = String(coach.contestId || context.contestId || '').trim().toUpperCase();
      const rowMode = String(coach.mode || context.mode || '').trim().toLowerCase();
      const rowKey = buildCoachRowKey({
        callsign: rowCall,
        year: rowYear,
        contestId: rowContest,
        mode: rowMode
      });
      const isCurrent = current
        && rowCall
        && rowCall === normalizeCall(current.callsign || '')
        && rowCategory === normalizeCoachCategory(current.category || '');
      const trClass = isCurrent ? 'coach-row-current' : (idx % 2 === 0 ? 'td1' : 'td0');
      const canLoadCompare = Number.isFinite(rowYear) && Boolean(rowCall) && Boolean(rowContest) && Boolean(rowMode);
      const lastLoadedHere = rowKey && rowKey === String(coach.lastLoadedRowKey || '');
      const lastLoadedSlot = lastLoadedHere ? String(coach.lastLoadedSlot || '') : '';
      const loadActions = canLoadCompare
        ? `
          <div class="coach-load-control">
            <span class="coach-load-prefix">Load this log to slot</span>
            <span class="coach-load-segment" role="group" aria-label="Load this log to compare slot">
              ${COMPARE_SLOT_IDS.map((slotId) => {
          const slotAssignedToRow = rowKey && rowKey === String(coach.loadedSlotRows?.[slotId] || '');
          const slotLabel = `Log ${slotId}`;
          return `<button type="button" class="cqapi-load-btn coach-load-btn${slotAssignedToRow ? ' is-target' : ''}" data-slot="${slotId}" data-row-key="${escapeAttr(rowKey)}" data-year="${escapeAttr(String(rowYear))}" data-callsign="${escapeAttr(rowCall)}" data-contest="${escapeAttr(rowContest)}" data-mode="${escapeAttr(rowMode)}" title="Load this log into ${slotLabel}" aria-label="Load this log into ${slotLabel}" aria-pressed="${slotAssignedToRow ? 'true' : 'false'}">${slotLabel}</button>`;
        }).join('')}
            </span>
            ${lastLoadedSlot ? `<span class="coach-last-loaded">Last loaded to Log ${escapeHtml(lastLoadedSlot)}</span>` : ''}
          </div>
        `
        : '<span class="cqapi-muted">N/A</span>';
      const operatorsCell = formatCqApiOperatorsCell(row?.operators || '');
      const operatorsTitleAttr = operatorsCell.title ? ` title="${escapeAttr(operatorsCell.title)}"` : '';
      const scoreGap = Number(row?.scoreGap);
      const scoreGapPct = Number(row?.scoreGapPct);
      const qsoGap = Number(row?.qsoGap);
      const multGap = Number(row?.multGap);
      const formatGap = (value, pct) => {
        if (!Number.isFinite(value)) return 'N/A';
        const signed = `${value >= 0 ? '+' : ''}${formatNumberSh6(Math.round(value))}`;
        if (!Number.isFinite(pct)) return signed;
        return `${signed} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`;
      };
      const formatSmallGap = (value) => {
        if (!Number.isFinite(value)) return 'N/A';
        return `${value >= 0 ? '+' : ''}${formatNumberSh6(Math.round(value))}`;
      };
      return `
        <tr class="${trClass}">
          <td>${formatCqApiNumber(row?.rank)}</td>
          <td>${escapeHtml(rowCall || 'N/A')}</td>
          <td>${escapeHtml(rowCategory || 'N/A')}</td>
          <td><strong>${formatCqApiNumber(row?.score)}</strong></td>
          <td>${formatGap(scoreGap, scoreGapPct)}</td>
          <td>${formatCqApiNumber(row?.qsos)}</td>
          <td>${formatSmallGap(qsoGap)}</td>
          <td>${formatCqApiMultiplierValue(row)}</td>
          <td>${formatSmallGap(multGap)}</td>
          <td class="coach-load-cell">${loadActions}</td>
          <td${operatorsTitleAttr}>${escapeHtml(operatorsCell.text)}</td>
        </tr>
      `;
    }).join('');

    const tableBlock = rows.length
      ? `
        <div class="cqapi-history-wrap">
          <table class="mtc coach-table">
            <tr class="thc"><th>Rank</th><th>Callsign</th><th>Category</th><th>Score</th><th>Gap to you</th><th>QSOs</th><th>QSO gap</th><th>Mult</th><th>Mult gap</th><th>Load to compare slot</th><th>Ops</th></tr>
            ${tableRows}
          </table>
        </div>
      `
      : '<p class="cqapi-muted">No competitors matched the selected filters.</p>';

    const controlsDisabled = context.ok ? '' : ' disabled';
    const scopeButtons = ['dxcc', 'continent', 'cq_zone', 'itu_zone'].map((key) => {
      const selected = key === selectedScope;
      const value = context.ok ? String(context.scopeValues?.[key] || '') : '';
      const suffix = value ? ` (${escapeHtml(value)})` : ' (N/A)';
      return `
        <button
          type="button"
          class="coach-choice-btn coach-scope-btn${selected ? ' active' : ''}"
          data-scope="${key}"
          aria-pressed="${selected ? 'true' : 'false'}"
          ${controlsDisabled}
        >
          ${formatCoachScopeTitle(key)}${suffix}
        </button>
      `;
    }).join('');
    const categoryButtons = [
      { value: 'same', label: 'Same category only' },
      { value: 'all', label: 'All categories' }
    ].map((item) => {
      const selected = item.value === categoryMode;
      return `
        <button
          type="button"
          class="coach-choice-btn coach-category-btn${selected ? ' active' : ''}"
          data-category-mode="${item.value}"
          aria-pressed="${selected ? 'true' : 'false'}"
          ${controlsDisabled}
        >
          ${item.label}
        </button>
      `;
    }).join('');

    const coachIntro = renderReportIntroCard(
      'Competitor coach workspace',
      'Find nearest rivals in your selected scope and load them directly into compare slots.',
      [
        `Scope ${formatCoachScopeTitle(selectedScope)}`,
        `Category mode ${categoryMode === 'all' ? 'All categories' : 'Same category'}`,
        `Cohort ${formatCqApiNumber(coach.totalRows)}`
      ]
    );

    return `
      <div class="cqapi-card mtc coach-card">
        <div class="gradient">&nbsp;Competitor coach</div>
        <div class="cqapi-body">
          ${coachIntro}
          <p>Find direct competitors by scope and category, then load any row directly to Log B, C, or D for side-by-side comparison.</p>
          ${context.ok ? '' : `<p class="status-error">${escapeHtml(context.reason || 'Competitor context unavailable.')}</p>`}
          ${renderAnalysisStepHeading(1, 'Filters', 'Choose scope and category mode for your competitor cohort.')}
          <div class="coach-controls">
            <div class="coach-control-group">
              <div class="coach-control-label">Scope</div>
              <div class="coach-choice-row">
                ${scopeButtons}
              </div>
            </div>
            <div class="coach-control-group">
              <div class="coach-control-label">Category</div>
              <div class="coach-choice-row">
                ${categoryButtons}
              </div>
            </div>
          </div>
          ${renderAnalysisStepHeading(2, 'Cohort snapshot', 'Confirm station context and nearest rival before loading compare slots.')}
          <table class="mtc coach-meta">
            <tr class="thc"><th>Metric</th><th>Value</th></tr>
            <tr class="td1"><td>Contest / mode / year</td><td>${escapeHtml(context.contestId || coach.contestId || 'N/A')} / ${escapeHtml(String(context.mode || coach.mode || '').toUpperCase() || 'N/A')} / ${formatYearSh6(context.year || coach.year)}</td></tr>
            <tr class="td0"><td>Station</td><td>${escapeHtml(context.callsign || 'N/A')}</td></tr>
            <tr class="td1"><td>Selected scope</td><td>${escapeHtml(formatCoachScopeTitle(selectedScope))} ${scopeValueText ? `(${escapeHtml(scopeValueText)})` : '(N/A)'}</td></tr>
            <tr class="td0"><td>Target category</td><td>${escapeHtml(targetCategory || 'N/A')}${categoryLabel ? ` - ${escapeHtml(categoryLabel)}` : ''}</td></tr>
            <tr class="td1"><td>Current in cohort</td><td>${currentSummary}</td></tr>
            <tr class="td0"><td>Cohort size</td><td>${formatCqApiNumber(coach.totalRows)} matched (from ${sourceRowsText} source rows)</td></tr>
          </table>
          ${coach.statusMessage ? `<p class="cqapi-msg">Data message: ${escapeHtml(coach.statusMessage)}</p>` : ''}
          ${statusText}
          ${quickActionBlock}
          ${renderAnalysisStepHeading(3, 'Primary cohort table', 'Load one or more rivals directly into compare slots.')}
          ${tableBlock}
          ${renderAnalysisStepHeading(4, 'Coaching detail', 'Review priority cards and tactical guidance before the next session.')}
          ${priorityBlock}
          ${coachBriefingBlock}
          ${rivalsBlock}
          ${gapDriverBlock}
        </div>
      </div>
    `;
  }

  function renderOperators() {
    if (!state.derived) return renderPlaceholder({ id: 'operators', title: 'Operators' });
    if (!state.derived.operatorsSummary || state.derived.operatorsSummary.length === 0) return '<p>No operator data in log.</p>';
    const cards = state.derived.operatorsSummary.map((o) => {
      const callRaw = o.op || '';
      const callKey = normalizeCall(callRaw) || callRaw;
      const call = escapeHtml(callKey);
      const callAttr = escapeAttr(callKey);
      const urlCall = encodeURIComponent(callKey);
      const titleAttr = escapeAttr(`${callKey} at QRZ.COM`);
      const qsoCount = Number.isFinite(o.qsos) ? o.qsos : 0;
      const qsoLink = `<a href="#" class="log-op" data-op="${callAttr}">${formatNumberSh6(qsoCount)}</a>`;
      return `
        <div class="operator-card">
          <div class="np op-photo op-photo-loading" data-qrz-call="${callAttr}">(Loading)</div>
          <br/><br/>
          <b><a rel="noopener noreferrer nofollow" title="${titleAttr}" target="_blank" href="https://www.qrz.com/db/${urlCall}">${call}</a></b>
          <br/><span>QSOs: ${qsoLink}</span><br/>&nbsp;<br/><br/>
        </div>
      `;
    }).join('');
    return `
      <div class="operator-grid">${cards}</div>
    `;
  }

  function getMaxQsosPerStation(derived) {
    if (!derived?.allCallsList?.length) return 0;
    return derived.allCallsList.reduce((max, entry) => {
      const val = Number(entry.qsos) || 0;
      return val > max ? val : max;
    }, 0);
  }

  function buildQsPerStationBuckets(derived, maxQso) {
    const maxVal = Number.isFinite(maxQso) ? maxQso : getMaxQsosPerStation(derived);
    if (!maxVal || maxVal <= 0) return [];
    const buckets = Array.from({ length: maxVal }, (_, i) => ({
      min: i + 1,
      max: i + 1,
      label: String(i + 1),
      stations: 0,
      qsos: 0
    }));
    if (!derived?.allCallsList) return buckets;
    derived.allCallsList.forEach((entry) => {
      const count = Number(entry.qsos) || 0;
      if (!count) return;
      const bucket = buckets.find((b) => count >= b.min && count <= b.max);
      if (!bucket) return;
      bucket.stations += 1;
      bucket.qsos += count;
    });
    return buckets;
  }

  function renderQsPerStationTable(derived, totalQsos, maxQso) {
    if (!derived) return '<p>No data.</p>';
    const buckets = buildQsPerStationBuckets(derived, maxQso);
    if (!buckets.length) return '<p>No data.</p>';
    const totalStations = derived.allCallsList?.length || 0;
    const total = Number(totalQsos) || 0;
    const rows = buckets.map((b, idx) => {
      const stationsCount = b.stations || 0;
      const qsosCount = b.qsos || 0;
      const stationsText = formatNumberSh6(stationsCount);
      const qsosText = formatNumberSh6(qsosCount);
      const pctStations = totalStations ? ((stationsCount / totalStations) * 100).toFixed(1) : '';
      const pctQsos = total ? ((qsosCount / total) * 100).toFixed(1) : '';
      const minAttr = escapeAttr(b.min);
      const maxAttr = escapeAttr(b.max);
      const stationLink = stationsCount ? `<a href="#" class="log-station-qso" data-min="${minAttr}" data-max="${maxAttr}">${stationsText}</a>` : '';
      const qsoLink = qsosCount ? `<a href="#" class="log-station-qso" data-min="${minAttr}" data-max="${maxAttr}">${qsosText}</a>` : '';
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td><b>${b.label}</b></td>
        <td>${stationLink}</td>
        <td>${pctStations ? `${pctStations}%` : ''}</td>
        <td>${qsoLink}</td>
        <td>${pctQsos ? `${pctQsos}%` : ''}</td>
      </tr>
    `;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>QSOs per station</th><th>Stations</th><th>% Stations</th><th>QSOs</th><th>% QSOs</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderQsPerStation() {
    if (!state.derived) return renderPlaceholder({ id: 'qs_per_station', title: 'Qs per station' });
    return renderQsPerStationTable(state.derived, state.qsoData?.qsos?.length || 0);
  }

  function renderSummary() {
    if (!state.derived) return renderPlaceholder({ id: 'summary', title: 'Summary' });
    const totalQsos = state.qsoData?.qsos.length || 0;
    const totalCountries = state.derived.countrySummary?.length || 0;
    const totalPoints = Number.isFinite(state.derived.totalPoints) ? state.derived.totalPoints : '';
    const totals = state.derived.bandModeSummary.reduce((acc, b) => {
      acc.cw += b.cw;
      acc.digital += b.digital;
      acc.phone += b.phone;
      acc.all += b.all;
      return acc;
    }, { cw: 0, digital: 0, phone: 0, all: 0 });
    const rowsData = [
      ...state.derived.bandModeSummary,
      { band: 'All', ...totals, countries: totalCountries, points: totalPoints }
    ];
    const renderModeCells = (count, pct, band, mode) => {
      if (!count) return '<td colspan="3"></td>';
      const pctText = pct.toFixed(1);
      const title = `${formatNumberSh6(count)} Qs - ${pctText}%`;
      const bandAttr = escapeAttr(band || '');
      const modeAttr = escapeAttr(mode || '');
      const link = `<a href="#" class="log-filter" data-band="${bandAttr}" data-mode="${modeAttr}">${formatNumberSh6(count)}</a>`;
      return `
        <td>${link}</td>
        <td><i>${pctText}</i></td>
        <td title="${title}" align="left"><div class="sum" style="width:${pctText}px"></div></td>
      `;
    };
    const rows = rowsData.map((b, idx) => {
      const cwPct = totalQsos ? (b.cw / totalQsos) * 100 : 0;
      const digPct = totalQsos ? (b.digital / totalQsos) * 100 : 0;
      const phonePct = totalQsos ? (b.phone / totalQsos) * 100 : 0;
      const allPct = totalQsos ? (b.all / totalQsos) * 100 : 0;
      const bandText = escapeHtml(formatBandLabel(b.band || ''));
      const bandAttr = escapeAttr(b.band || '');
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td class="${bandClass(b.band)}"><b>${bandText}</b></td>
        ${renderModeCells(b.cw, cwPct, b.band, 'CW')}
        ${renderModeCells(b.digital, digPct, b.band, 'Digital')}
        ${renderModeCells(b.phone, phonePct, b.band, 'Phone')}
        ${renderModeCells(b.all, allPct, b.band, 'All')}
        <td>${formatNumberSh6(b.countries ?? '')}</td>
        <td>${formatNumberSh6(b.points ?? '')}</td>
        <td class="tac"><a href="#" class="map-link" data-scope="summary" data-key="${bandAttr}">map</a></td>
      </tr>
    `;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc">
          <th rowspan="2">Band</th>
          <th colspan="3">CW</th>
          <th colspan="3">Digital</th>
          <th colspan="3">Phone</th>
          <th colspan="3">All</th>
          <th rowspan="2">Countries</th>
          <th rowspan="2">Qs Pts</th>
          <th rowspan="2">Map</th>
        </tr>
        <tr class="thc">
          <th>QSOs</th><th colspan="2">%</th>
          <th>QSOs</th><th colspan="2">%</th>
          <th>QSOs</th><th colspan="2">%</th>
          <th>QSOs</th><th colspan="2">%</th>
        </tr>
        ${rows}
        ${mapAllFooter(16)}
      </table>
    `;
  }

  function renderLoadLogs() {
    return `
      <div class="landing-page">
        <section class="landing-hero">
          <div class="landing-brand">
            <img class="landing-logo" src="SH6_logo.png" alt="SH6" decoding="async">
            <span class="landing-brand-text">SH6</span>
          </div>
          <h1>SH6 — Hamradio log analyzer</h1>
          <p>Analyze hamradio logs in your browser: countries, rates, operators, maps, and side-by-side comparisons.</p>
          <a href="#" class="landing-start-link" data-action="start-load">Start log selection →</a>
        </section>
        <section class="landing-section landing-panel">
          <h3>What you can explore</h3>
          <ul class="landing-bullets">
            <li>Summary totals and band breakdowns.</li>
            <li>Countries, zones, and continent analysis.</li>
            <li>Rates, graphs, beam headings, and maps.</li>
          </ul>
        </section>
        <section class="landing-section landing-card">
          <h3>Quick start</h3>
          <ol class="landing-steps">
            <li>Load Log A (upload or pick from the archive).</li>
            <li>Optional: enable Compare logs mode and load Log B.</li>
            <li>Open a report from the menu to explore results.</li>
          </ol>
        </section>
        <section class="landing-section landing-panel">
          <h3>Privacy</h3>
          <p>Your log is processed locally in your browser. Files are not uploaded to a server.</p>
          <p>Large logs may take a moment to render.</p>
        </section>
        <section class="landing-section landing-panel">
          <h3>Author</h3>
          <p>Made by Simon, <a href="https://www.qrz.com/db/S53ZO" target="_blank" rel="noopener noreferrer">S53ZO</a> based on a popular solution that is no longer available. Feedback and comments are welcome.</p>
        </section>
      </div>
    `;
  }

  function getLogFilters() {
    return {
      search: (state.logSearch || '').trim().toUpperCase(),
      fieldFilter: (state.logFieldFilter || '').trim().toUpperCase(),
      bandFilter: (state.logBandFilter || '').trim().toUpperCase(),
      modeFilter: (state.logModeFilter || '').trim(),
      opFilter: (state.logOpFilter || '').trim().toUpperCase(),
      callLenFilter: Number.isFinite(state.logCallLenFilter) ? state.logCallLenFilter : (state.logCallLenFilter != null ? Number(state.logCallLenFilter) : null),
      callStructFilter: (state.logCallStructFilter || '').trim(),
      countryFilter: (state.logCountryFilter || '').trim().toUpperCase(),
      continentFilter: (state.logContinentFilter || '').trim().toUpperCase(),
      cqFilter: (state.logCqFilter || '').trim(),
      ituFilter: (state.logItuFilter || '').trim(),
      rangeFilter: state.logRange,
      timeRange: state.logTimeRange,
      headingRange: state.logHeadingRange,
      stationQsoRange: state.logStationQsoRange,
      distanceRange: state.logDistanceRange
    };
  }

  function applyLogFilters(qsos, filters) {
    let filtered = qsos || [];
    if (filters.search) {
      filtered = filtered.filter((q) => q.call && q.call.includes(filters.search));
    }
    if (filters.fieldFilter) {
      filtered = filtered.filter((q) => q.grid && q.grid.startsWith(filters.fieldFilter));
    }
    if (filters.bandFilter) {
      filtered = filtered.filter((q) => q.band && q.band.toUpperCase() === filters.bandFilter);
    }
    if (filters.modeFilter && filters.modeFilter !== 'All') {
      filtered = filtered.filter((q) => modeBucket(q.mode) === filters.modeFilter);
    }
    if (filters.opFilter) {
      filtered = filtered.filter((q) => q.op && q.op.toUpperCase() === filters.opFilter);
    }
    if (Number.isFinite(filters.callLenFilter)) {
      filtered = filtered.filter((q) => q.call && q.call.length === filters.callLenFilter);
    }
    if (filters.callStructFilter) {
      filtered = filtered.filter((q) => q.call && classifyCallStructure(q.call) === filters.callStructFilter);
    }
    if (filters.countryFilter) {
      filtered = filtered.filter((q) => q.country && q.country.toUpperCase() === filters.countryFilter);
    }
    if (filters.continentFilter) {
      filtered = filtered.filter((q) => q.continent && q.continent.toUpperCase() === filters.continentFilter);
    }
    if (filters.cqFilter) {
      filtered = filtered.filter((q) => String(q.cqZone || '') === filters.cqFilter);
    }
    if (filters.ituFilter) {
      filtered = filtered.filter((q) => String(q.ituZone || '') === filters.ituFilter);
    }
    if (filters.rangeFilter && Number.isFinite(filters.rangeFilter.start) && Number.isFinite(filters.rangeFilter.end)) {
      filtered = filtered.filter((q) => {
        const n = Number(q.qsoNumber);
        return Number.isFinite(n) && n >= filters.rangeFilter.start && n <= filters.rangeFilter.end;
      });
    }
    if (filters.timeRange && Number.isFinite(filters.timeRange.startTs) && Number.isFinite(filters.timeRange.endTs)) {
      filtered = filtered.filter((q) => typeof q.ts === 'number' && q.ts >= filters.timeRange.startTs && q.ts <= filters.timeRange.endTs);
    }
    if (filters.headingRange && Number.isFinite(filters.headingRange.start) && Number.isFinite(filters.headingRange.end)) {
      filtered = filtered.filter((q) => Number.isFinite(q.bearing) && q.bearing >= filters.headingRange.start && q.bearing <= filters.headingRange.end);
    }
    if (filters.stationQsoRange && Number.isFinite(filters.stationQsoRange.min) && Number.isFinite(filters.stationQsoRange.max)) {
      filtered = filtered.filter((q) => Number.isFinite(q.callCount) && q.callCount >= filters.stationQsoRange.min && q.callCount <= filters.stationQsoRange.max);
    }
    if (filters.distanceRange && Number.isFinite(filters.distanceRange.start) && Number.isFinite(filters.distanceRange.end)) {
      filtered = filtered.filter((q) => Number.isFinite(q.distance) && q.distance >= filters.distanceRange.start && q.distance <= filters.distanceRange.end);
    }
    return filtered;
  }

  function loadDemoLog(slotId = 'A') {
    const statusEl = slotId === 'B'
      ? dom.fileStatusB
      : slotId === 'C'
        ? dom.fileStatusC
        : slotId === 'D'
          ? dom.fileStatusD
          : dom.fileStatus;
    const startDemo = async () => {
      if (statusEl) statusEl.textContent = `Loading demo log (${DEMO_ARCHIVE_LABEL})...`;
      const result = await fetchArchiveLogText(DEMO_ARCHIVE_PATH);
      if (!result || !result.text) {
        if (statusEl) statusEl.textContent = 'Demo log download failed.';
        return;
      }
      const name = DEMO_ARCHIVE_PATH.split('/').pop() || 'demo.log';
      applyLoadedLogToSlot(slotId, result.text, name, result.text.length, 'Demo', statusEl, DEMO_ARCHIVE_PATH);
      if (statusEl && result.source) statusEl.title = result.source;
      showOverlayNotice('Demo log loaded! Explore the reports using the menu on the left.', 2250);
    };
    startDemo();
  }

  const LOG_COMPARE_COLUMNS = [
    { id: 'num', label: '#' },
    { id: 'time', label: 'Time' },
    { id: 'band', label: 'Band' },
    { id: 'mode', label: 'Mode' },
    { id: 'freq', label: 'Freq' },
    { id: 'call', label: 'Call' },
    { id: 'rstS', label: 'RST S' },
    { id: 'rstR', label: 'RST R' },
    { id: 'exchSent', label: 'Exch Sent' },
    { id: 'exchRcvd', label: 'Exch Rcvd' },
    { id: 'op', label: 'Op' },
    { id: 'country', label: 'Country' },
    { id: 'cont', label: 'Cont.' },
    { id: 'cq', label: 'CQ' },
    { id: 'itu', label: 'ITU' },
    { id: 'grid', label: 'Grid' },
    { id: 'flags', label: 'Flags' }
  ];

  function formatTimeOnly(ts, fallback) {
    if (Number.isFinite(ts)) {
      const d = new Date(ts);
      const hh = String(d.getUTCHours()).padStart(2, '0');
      const mm = String(d.getUTCMinutes()).padStart(2, '0');
      return `${hh}:${mm}Z`;
    }
    return fallback || '';
  }

  function getLogCompareColumnConfig(count) {
    const total = Math.max(1, Number(count) || 1);
    let columns = LOG_COMPARE_COLUMNS.map((c) => c.id);
    let timeOnly = false;
    if (total >= 4) {
      columns = ['num', 'time', 'band', 'mode', 'freq', 'call'];
      timeOnly = true;
    } else if (total === 3) {
      columns = columns.filter((c) => c !== 'exchSent' && c !== 'exchRcvd');
    } else if (total === 2) {
      columns = columns.filter((c) => !['rstS', 'rstR', 'grid', 'flags'].includes(c));
    }
    return { columns, timeOnly };
  }

  function renderLogCellById(q, columnId, options) {
    if (!q) return '<td></td>';
    const timeOnly = options && options.timeOnly;
    switch (columnId) {
      case 'num':
        return `<td class="log-qso c1">${formatNumberSh6(q.qsoNumber || '')}</td>`;
      case 'time': {
        const raw = timeOnly ? formatTimeOnly(q.ts, q.time || '') : (q.ts ? formatDateSh6(q.ts) : (q.time || ''));
        return `<td>${escapeHtml(raw)}</td>`;
      }
      case 'band':
        return `<td class="${bandClass(q.band)}">${escapeHtml(formatBandLabel(q.band || ''))}</td>`;
      case 'mode':
        return `<td class="${modeClass(q.mode)}">${escapeHtml(q.mode || '')}</td>`;
      case 'freq':
        return `<td class="${bandClass(q.band)}">${escapeHtml(formatFrequency(q.freq))}</td>`;
      case 'call':
        return `<td class="tl">${escapeCall(q.call || '')}</td>`;
      case 'rstS':
        return `<td>${formatNumberSh6(q.rstSent || '')}</td>`;
      case 'rstR':
        return `<td>${formatNumberSh6(q.rstRcvd || '')}</td>`;
      case 'exchSent':
        return `<td>${formatNumberSh6(q.stx || q.exchSent || '')}</td>`;
      case 'exchRcvd':
        return `<td>${formatNumberSh6(q.srx || q.exchRcvd || '')}</td>`;
      case 'op':
        return `<td>${escapeHtml(q.op || '')}</td>`;
      case 'country':
        return `<td class="tl">${escapeCountry(q.country || '')}</td>`;
      case 'cont':
        return `<td class="tac ${continentClass(q.continent)}">${escapeHtml(q.continent || '')}</td>`;
      case 'cq':
        return `<td>${escapeHtml(q.cqZone || '')}</td>`;
      case 'itu':
        return `<td>${escapeHtml(q.ituZone || '')}</td>`;
      case 'grid':
        return `<td class="tl">${escapeHtml(q.grid || '')}</td>`;
      case 'flags': {
        const flags = q.isQtc ? 'QTC' : `${q.inMaster === false ? 'NOT-IN-MASTER' : ''}${q.isDupe ? ' DUPE' : ''}`.trim();
        return `<td class="tl">${escapeHtml(flags)}</td>`;
      }
      default:
        return '<td></td>';
    }
  }

  function renderLogCells(q, columns, options) {
    return columns.map((col) => renderLogCellById(q, col, options)).join('');
  }

  function renderSessionControls() {
    const notices = Array.isArray(state.sessionNotice) ? state.sessionNotice.filter(Boolean) : [];
    const noticeHtml = notices.length
      ? `<div class="export-actions export-note"><b>Session notice</b>: ${escapeHtml(notices.join(' '))}</div>`
      : '';
    return `
      ${noticeHtml}
      <div class="utility-callout"><b>Session</b>: save or restore full comparisons and settings.</div>
      <div class="utility-primary-row">
        <button type="button" class="button utility-primary-btn session-permalink">Copy permalink</button>
        <button type="button" class="button utility-primary-btn session-save">Save session</button>
        <button type="button" class="button utility-primary-btn session-load">Load session</button>
        <input type="file" id="sessionFileInput" class="session-file-input" accept="application/json" hidden>
      </div>
    `;
  }

  function renderSessionPage() {
    return `
      <div class="mtc export-panel utility-panel">
        <div class="gradient">&nbsp;Save&Load session</div>
        <p>Sessions capture the full state of your analysis, including compare slots, filters, and report settings.</p>
        <div class="utility-grid">
          <div class="utility-block">
            <h4>Permalink</h4>
            <p>Generates a URL that restores archive logs and settings. Local logs cannot be auto-loaded; the app will ask you to upload them again.</p>
          </div>
          <div class="utility-block">
            <h4>Save session</h4>
            <p>Stores a local JSON file with raw log data and settings for offline restore (no network required).</p>
          </div>
          <div class="utility-block">
            <h4>Load session</h4>
            <p>Opens a saved session JSON and restores everything.</p>
          </div>
        </div>
        ${renderSessionControls()}
      </div>
    `;
  }

  const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function formatTimeOfDay(minutes) {
    const hh = Math.floor(minutes / 60);
    const mm = minutes % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}Z`;
  }

  function buildTenMinuteBuckets(qsos) {
    const buckets = new Map();
    (qsos || []).forEach((q) => {
      let key = 'unknown';
      if (Number.isFinite(q.ts)) {
        const d = new Date(q.ts);
        const minOfDay = d.getUTCHours() * 60 + d.getUTCMinutes();
        const day = d.getUTCDay();
        key = `${day}-${Math.floor(minOfDay / 10)}`;
      }
      if (!buckets.has(key)) buckets.set(key, []);
      const idx = Number.isFinite(q.id) ? q.id : (Number.isFinite(q.qsoNumber) ? q.qsoNumber - 1 : null);
      if (idx != null) buckets.get(key).push(idx);
    });
    return buckets;
  }

  function buildCompareBucketOrder(bucketMaps, qsoLists) {
    const allKeys = new Set();
    bucketMaps.forEach((map) => {
      map.forEach((_, key) => allKeys.add(key));
    });
    const numericKeys = Array.from(allKeys).filter((k) => k !== 'unknown');
    let startIndex = null;
    const allWithTs = qsoLists.flat().filter((q) => Number.isFinite(q.ts));
    if (allWithTs.length) {
      const minTs = Math.min(...allWithTs.map((q) => q.ts));
      const d = new Date(minTs);
      const startDay = d.getUTCDay();
      const startSlot = Math.floor((d.getUTCHours() * 60 + d.getUTCMinutes()) / 10);
      startIndex = startDay * 144 + startSlot;
    }
    const slotIndex = (key) => {
      const [dayStr, slotStr] = String(key).split('-');
      const day = Number(dayStr);
      const slot = Number(slotStr);
      return day * 144 + slot;
    };
    const numericSorted = numericKeys.slice().sort((a, b) => {
      const ai = slotIndex(a);
      const bi = slotIndex(b);
      if (startIndex == null) return ai - bi;
      const da = (ai - startIndex + 1008) % 1008;
      const db = (bi - startIndex + 1008) % 1008;
      return da - db;
    });
    const hasUnknown = allKeys.has('unknown');
    return hasUnknown ? numericSorted.concat(['unknown']) : numericSorted;
  }

  function buildCompareLogKey(filters) {
    const rangeKey = filters.rangeFilter ? `${filters.rangeFilter.start}-${filters.rangeFilter.end}` : '';
    const timeKey = filters.timeRange ? `${filters.timeRange.startTs}-${filters.timeRange.endTs}` : '';
    const headingKey = filters.headingRange ? `${filters.headingRange.start}-${filters.headingRange.end}` : '';
    const stationKey = filters.stationQsoRange ? `${filters.stationQsoRange.min}-${filters.stationQsoRange.max}` : '';
    const distanceKey = filters.distanceRange ? `${filters.distanceRange.start}-${filters.distanceRange.end}` : '';
    const slotVersions = getActiveCompareSlots().map((entry) => entry.slot?.logVersion || 0).join(',');
    return [
      state.compareCount || 1,
      slotVersions,
      filters.search || '',
      filters.fieldFilter || '',
      filters.bandFilter || '',
      filters.modeFilter || '',
      filters.opFilter || '',
      Number.isFinite(filters.callLenFilter) ? filters.callLenFilter : '',
      filters.callStructFilter || '',
      filters.countryFilter || '',
      filters.continentFilter || '',
      filters.cqFilter || '',
      filters.ituFilter || '',
      rangeKey,
      timeKey,
      headingKey,
      stationKey,
      distanceKey
    ].join('|');
  }

  function ensureCompareWorker() {
    if (state.compareWorker) return true;
    if (typeof Worker === 'undefined') return false;
    try {
      const worker = new Worker('worker.js');
      worker.onmessage = (evt) => {
        const payload = evt.data || {};
        if (payload.type === 'compareBuckets') {
          if (payload.key !== state.compareLogPendingKey) return;
          state.compareLogPendingKey = null;
          state.compareLogPendingSince = null;
          if (state.compareLogFallbackTimer) {
            clearTimeout(state.compareLogFallbackTimer);
            state.compareLogFallbackTimer = null;
          }
          state.compareLogData = {
            key: payload.key,
            counts: payload.data?.counts || [],
            totalRows: payload.data?.totalRows || 0,
            buckets: payload.data?.buckets || []
          };
          state.compareLogWindowStart = 0;
          renderActiveReport();
          return;
        }
      };
      worker.onerror = () => {
        state.compareWorker = null;
        state.compareLogPendingKey = null;
        state.compareLogPendingSince = null;
        if (state.compareLogFallbackTimer) {
          clearTimeout(state.compareLogFallbackTimer);
          state.compareLogFallbackTimer = null;
        }
      };
      state.compareWorker = worker;
      return true;
    } catch (err) {
      console.warn('Compare worker failed to start:', err);
      state.compareWorker = null;
      return false;
    }
  }

  function buildCompareLogDataSync(filters) {
    const slots = getActiveCompareSlots();
    const lists = slots.map((entry) => (entry.slot?.qsoData ? applyLogFilters(entry.slot.qsoData.qsos, filters) : []));
    const bucketMaps = lists.map((qsos) => buildTenMinuteBuckets(qsos));
    const orderedKeys = buildCompareBucketOrder(bucketMaps, lists);
    const buckets = orderedKeys.map((key) => ({
      key,
      lists: bucketMaps.map((map) => map.get(key) || [])
    }));
    const totalRows = buckets.reduce((sum, bucket) => {
      const lens = bucket.lists.map((list) => list.length);
      return sum + Math.max(1, ...lens);
    }, 0);
    return {
      counts: lists.map((qsos) => qsos.length),
      totalRows,
      buckets
    };
  }

  function requestCompareLogData(compareKey, filters) {
    if (!ensureCompareWorker()) {
      const data = buildCompareLogDataSync(filters);
      state.compareLogData = { key: compareKey, ...data };
      state.compareLogPendingKey = null;
      state.compareLogPendingSince = null;
      if (state.compareLogFallbackTimer) {
        clearTimeout(state.compareLogFallbackTimer);
        state.compareLogFallbackTimer = null;
      }
      state.compareLogWindowStart = 0;
      return;
    }
    if (state.compareLogPendingKey === compareKey) return;
    state.compareLogPendingKey = compareKey;
    state.compareLogPendingSince = Date.now();
    state.compareLogData = null;
    const slots = getActiveCompareSlots();
    const totalLoadedQsos = slots.reduce((sum, entry) => sum + (entry.slot?.qsoData?.qsos?.length || 0), 0);
    if (totalLoadedQsos <= COMPARE_PROGRESS_THRESHOLD) {
      const data = buildCompareLogDataSync(filters);
      state.compareLogData = { key: compareKey, ...data };
      state.compareLogPendingKey = null;
      state.compareLogPendingSince = null;
      if (state.compareLogFallbackTimer) {
        clearTimeout(state.compareLogFallbackTimer);
        state.compareLogFallbackTimer = null;
      }
      state.compareLogWindowStart = 0;
      return;
    }
    slots.forEach((entry) => ensureSlotQsoLite(entry.slot));
    const liteLists = slots.map((entry) => entry.slot?.qsoLite || []);
    state.compareWorker.postMessage({
      type: 'compareBuckets',
      key: compareKey,
      filters,
      logs: liteLists
    });
    if (state.compareLogFallbackTimer) clearTimeout(state.compareLogFallbackTimer);
    state.compareLogFallbackTimer = setTimeout(() => {
      if (state.compareLogPendingKey !== compareKey) return;
      const fallback = buildCompareLogDataSync(filters);
      state.compareLogData = { key: compareKey, ...fallback };
      state.compareLogPendingKey = null;
      state.compareLogPendingSince = null;
      state.compareLogFallbackTimer = null;
      renderActiveReport();
    }, 2500);
  }

  function renderCompareLogRows(buckets, start, end, slotEntries, columns, options) {
    let rows = '';
    let globalIndex = 0;
    for (const bucket of buckets) {
      const lists = bucket.lists || [];
      const max = Math.max(1, ...lists.map((list) => list.length));
      const bucketStart = globalIndex;
      const bucketEnd = globalIndex + max;
      if (bucketEnd <= start) {
        globalIndex = bucketEnd;
        continue;
      }
      if (bucketStart >= end) break;
      const key = bucket.key;
      const bucketLabel = key === 'unknown'
        ? 'Unknown time bucket'
        : (() => {
          const [dayStr, slotStr] = String(key).split('-');
          const day = Number(dayStr);
          const slot = Number(slotStr);
          const dayLabel = WEEKDAY_LABELS[Number.isFinite(day) ? day : 0] || '';
          return `${dayLabel} ${formatTimeOfDay(slot * 10)} - ${formatTimeOfDay(slot * 10 + 9)}`;
        })();
      rows += `<tr class="compare-bucket"><td colspan="${columns.length * slotEntries.length}">${bucketLabel}</td></tr>`;
      const from = Math.max(0, start - bucketStart);
      const to = Math.min(max, end - bucketStart);
      for (let i = from; i < to; i += 1) {
        const rowIndex = bucketStart + i + 1;
        const cls = rowIndex % 2 === 0 ? 'td1' : 'td0';
        const rowCells = slotEntries.map((entry, slotIdx) => {
          const list = lists[slotIdx] || [];
          const qIdx = list[i];
          const q = (qIdx != null && entry.slot?.qsoData?.qsos) ? entry.slot.qsoData.qsos[qIdx] : null;
          return renderLogCells(q, columns, options);
        }).join('');
        rows += `<tr class="${cls}">${rowCells}</tr>`;
      }
      globalIndex = bucketEnd;
    }
    return rows;
  }

  function renderLogCompare() {
    const slotEntries = getActiveCompareSlots();
    const anyLoaded = slotEntries.some((entry) => entry.slot?.qsoData);
    if (!anyLoaded) {
      return '<p>No logs loaded for comparison yet.</p>';
    }
    const filters = getLogFilters();
    const compareKey = buildCompareLogKey(filters);
    if (!state.compareLogData || state.compareLogData.key !== compareKey) {
      requestCompareLogData(compareKey, filters);
    }
    let compareData = state.compareLogData && state.compareLogData.key === compareKey ? state.compareLogData : null;
    const qsoTotals = slotEntries.map((entry) => entry.slot?.qsoData?.qsos?.length || 0);
    if (compareData && compareData.totalRows === 0 && qsoTotals.some((n) => n > 0)) {
      const fallback = buildCompareLogDataSync(filters);
      state.compareLogData = { key: compareKey, ...fallback };
      compareData = state.compareLogData;
    }
    if (!compareData && state.compareLogPendingKey === compareKey && state.compareLogPendingSince) {
      const elapsed = Date.now() - state.compareLogPendingSince;
      if (elapsed > 2500) {
        const fallback = buildCompareLogDataSync(filters);
        state.compareLogData = { key: compareKey, ...fallback };
        state.compareLogPendingKey = null;
        state.compareLogPendingSince = null;
        compareData = state.compareLogData;
      }
    }
    const counts = compareData ? (compareData.counts || []) : qsoTotals;
    const totalRows = compareData ? compareData.totalRows : 0;
    const windowSize = state.compareLogWindowSize || 1000;
    const maxStart = Math.max(0, totalRows - windowSize);
    const start = Math.min(Math.max(0, state.compareLogWindowStart || 0), maxStart);
    const end = Math.min(totalRows, start + windowSize);
    state.compareLogWindowStart = start;
    const columnConfig = getLogCompareColumnConfig(slotEntries.length);
    const columns = columnConfig.columns;
    const rows = compareData ? renderCompareLogRows(compareData.buckets, start, end, slotEntries, columns, columnConfig) : '';
    const dataNote = `<p>${(state.ctyTable && state.ctyTable.length) ? 'cty.dat loaded' : 'cty.dat missing or empty'}; ${(state.masterSet && state.masterSet.size) ? 'MASTER.DTA loaded' : 'MASTER.DTA missing or empty'}.</p>`;
    const safeBand = escapeHtml(filters.bandFilter ? formatBandLabel(filters.bandFilter) : 'All bands');
    const safeMode = escapeHtml(filters.modeFilter || '');
    const safeOp = escapeHtml(filters.opFilter || '');
    const safeLen = Number.isFinite(filters.callLenFilter) ? formatNumberSh6(filters.callLenFilter) : '';
    const safeStruct = escapeHtml(filters.callStructFilter || '');
    const safeCountry = escapeHtml(filters.countryFilter || '');
    const safeContinent = escapeHtml(filters.continentFilter || '');
    const safeCq = escapeHtml(filters.cqFilter || '');
    const safeItu = escapeHtml(filters.ituFilter || '');
    const stationRange = filters.stationQsoRange;
    const distanceRange = filters.distanceRange;
    const filterNote = filters.search || filters.fieldFilter || filters.bandFilter || filters.modeFilter || filters.opFilter || Number.isFinite(filters.callLenFilter) || filters.callStructFilter || filters.countryFilter || filters.continentFilter || filters.cqFilter || filters.ituFilter || filters.rangeFilter || filters.timeRange || filters.headingRange || stationRange || distanceRange
      ? `<p class="log-filter-note">Filter applied to all logs: ${safeBand} ${safeMode ? `/${safeMode}` : ''} ${safeOp ? ` OP ${safeOp}` : ''} ${safeLen ? ` Len ${safeLen}` : ''} ${safeStruct ? ` Struct ${safeStruct}` : ''} ${safeCountry ? ` ${safeCountry}` : ''} ${safeContinent ? ` ${safeContinent}` : ''} ${safeCq ? ` CQ${safeCq}` : ''} ${safeItu ? ` ITU${safeItu}` : ''} ${filters.headingRange ? ` Bearing ${filters.headingRange.start}-${filters.headingRange.end}°` : ''} ${stationRange ? ` Station QSOs ${stationRange.min}-${stationRange.max}` : ''} ${distanceRange ? ` Distance ${distanceRange.start}-${distanceRange.end} km` : ''} ${filters.rangeFilter ? `(QSO #${formatNumberSh6(filters.rangeFilter.start)}-${formatNumberSh6(filters.rangeFilter.end)})` : ''} ${filters.timeRange ? `(Time ${formatDateSh6(filters.timeRange.startTs)} - ${formatDateSh6(filters.timeRange.endTs)})` : ''} <span class="log-filter-hint">(click entries to drill down)</span> <a href="#" id="logClearFilters">clear filters</a></p>`
      : '';
    const note = `<p>${slotEntries.map((entry, idx) => `${entry.label}: ${formatNumberSh6(counts[idx] || 0)} QSOs`).join(' · ')}</p>`;
    const missingSlots = slotEntries.filter((entry) => !entry.slot?.qsoData).map((entry) => entry.label);
    const missingNote = missingSlots.length
      ? `<p class="log-filter-note">Load ${missingSlots.join(', ')} to enable full comparison.</p>`
      : '';
    const emptyNote = compareData && counts.reduce((sum, n) => sum + n, 0) === 0 ? '<p>No QSOs match current filter.</p>' : '';
    const totalLoadedQsos = slotEntries.reduce((sum, entry) => sum + (entry.slot?.qsoData?.qsos?.length || 0), 0);
    const pendingNote = compareData
      ? ''
      : `
      <p class="compare-building">
        <span class="compare-spinner" aria-hidden="true"></span>
        Compare log is still building\u2026 Need to process ${formatNumberSh6(totalLoadedQsos)} QSOs
      </p>
      `;
    const prevDisabled = start <= 0;
    const nextDisabled = end >= totalRows;
    const windowNote = compareData && totalRows > 0
      ? `
      <div class="compare-window-controls">
        <div class="compare-window-text">
          Showing rows ${formatNumberSh6(start + 1)}-${formatNumberSh6(end)} of ${formatNumberSh6(totalRows)} (window ${formatNumberSh6(windowSize)}).
        </div>
        <div class="compare-window-actions">
          <button type="button" class="compare-window-btn" data-dir="prev" ${prevDisabled ? 'disabled' : ''}>&#9664; Prev ${formatNumberSh6(windowSize)}</button>
          <button type="button" class="compare-window-btn" data-dir="next" ${nextDisabled ? 'disabled' : ''}>Next ${formatNumberSh6(windowSize)} &#9654;</button>
        </div>
      </div>
      `
      : '';
    return `
      ${renderSessionControls()}
      ${note}
      ${missingNote}
      ${dataNote}
      ${filterNote}
      ${emptyNote}
      ${pendingNote}
      ${windowNote}
      <div class="log-controls">
        <form id="logSearchForm" class="no-print log-search">
          Callsign:
          <input id="logSearchInput" type="text" value="${escapeAttr(filters.search || '')}">
          <input type="submit" value="Search">
          <button type="button" id="logSearchClear">Clear</button>
        </form>
      </div>
      <div class="compare-log-wrap">
        <table class="mtc log-table compare-log-table" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc">
            ${slotEntries.map((entry) => {
              const call = escapeHtml(entry.slot?.derived?.contestMeta?.stationCallsign || 'N/A');
              return `<th colspan="${columns.length}">${escapeHtml(entry.label)}: ${call}</th>`;
            }).join('')}
          </tr>
          <tr class="thc">
            ${slotEntries.map(() => columns.map((colId) => {
              const def = LOG_COMPARE_COLUMNS.find((c) => c.id === colId);
              return `<th>${escapeHtml(def ? def.label : '')}</th>`;
            }).join('')).join('')}
          </tr>
          ${rows || ''}
        </table>
      </div>
      ${windowNote}
    `;
  }

  function renderLog() {
    if (state.compareEnabled) {
      return renderLogCompare();
    }
    if (!state.qsoData) {
      return renderPlaceholder({ id: 'log', title: 'Log' });
    }
    const ctyLoaded = state.ctyTable && state.ctyTable.length > 0;
    const masterLoaded = state.masterSet && state.masterSet.size > 0;
    const filters = getLogFilters();
    const search = filters.search;
    const fieldFilter = filters.fieldFilter;
    const bandFilter = filters.bandFilter;
    const modeFilter = filters.modeFilter;
    const countryFilter = filters.countryFilter;
    const continentFilter = filters.continentFilter;
    const cqFilter = filters.cqFilter;
    const ituFilter = filters.ituFilter;
    const rangeFilter = filters.rangeFilter;
    const timeRange = filters.timeRange;
    const headingRange = filters.headingRange;
    const filtered = applyLogFilters(state.qsoData.qsos, filters);
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.logPageSize));
    const page = Math.min(state.logPage, totalPages - 1);
    if (page !== state.logPage) state.logPage = page;
    const start = page * state.logPageSize;
    const end = start + state.logPageSize;
    const rows = filtered.slice(start, end).map((q, idx) => {
      const call = escapeCall(q.call || '');
      const op = escapeHtml(q.op || '');
      const country = escapeCountry(q.country || '');
      const grid = escapeHtml(q.grid || '');
      const mode = escapeHtml(q.mode || '');
      const band = escapeHtml(formatBandLabel(q.band || ''));
      const cont = escapeHtml(q.continent || '');
      const flags = escapeHtml(q.isQtc ? 'QTC' : `${q.inMaster === false ? 'NOT-IN-MASTER' : ''}${q.isDupe ? ' DUPE' : ''}`.trim());
      const time = escapeHtml(q.time || '');
      const freq = escapeHtml(formatFrequency(q.freq));
      const cq = escapeHtml(q.cqZone || '');
      const itu = escapeHtml(q.ituZone || '');
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td class="log-qso c1">${formatNumberSh6(q.qsoNumber || '')}</td>
        <td>${q.ts ? formatDateSh6(q.ts) : time}</td>
        <td class="${bandClass(q.band)}">${band}</td>
        <td class="${modeClass(q.mode)}">${mode}</td>
        <td class="${bandClass(q.band)}">${freq}</td>
        <td class="tl">${call}</td>
        <td>${formatNumberSh6(q.rstSent || '')}</td>
        <td>${formatNumberSh6(q.rstRcvd || '')}</td>
        <td>${formatNumberSh6(q.stx || q.exchSent || '')}</td>
        <td>${formatNumberSh6(q.srx || q.exchRcvd || '')}</td>
        <td>${op}</td>
        <td class="tl">${country}</td>
        <td class="tac ${continentClass(q.continent)}">${cont}</td>
        <td>${cq}</td>
        <td>${itu}</td>
        <td class="tl">${grid}</td>
        <td class="tl">${flags}</td>
      </tr>
    `;
    }).join('');
    const note = `<p>Showing ${formatNumberSh6(start + 1)}-${formatNumberSh6(Math.min(end, filtered.length))} of ${formatNumberSh6(filtered.length)} QSOs (page ${page + 1} / ${totalPages}).</p>`;
    const dataNote = `<p>${ctyLoaded ? 'cty.dat loaded' : 'cty.dat missing or empty'}; ${masterLoaded ? 'MASTER.DTA loaded' : 'MASTER.DTA missing or empty'}.</p>`;
    const emptyNote = filtered.length ? '' : '<p>No QSOs match current filter.</p>';
    const safeBand = escapeHtml(bandFilter ? formatBandLabel(bandFilter) : 'All bands');
    const safeMode = escapeHtml(modeFilter || '');
    const safeOp = escapeHtml(filters.opFilter || '');
    const safeLen = Number.isFinite(filters.callLenFilter) ? formatNumberSh6(filters.callLenFilter) : '';
    const safeStruct = escapeHtml(filters.callStructFilter || '');
    const safeCountry = escapeHtml(countryFilter || '');
    const safeContinent = escapeHtml(continentFilter || '');
    const safeCq = escapeHtml(cqFilter || '');
    const safeItu = escapeHtml(ituFilter || '');
    const stationRange = filters.stationQsoRange;
    const distanceRange = filters.distanceRange;
    const filterNote = bandFilter || modeFilter || rangeFilter || countryFilter || timeRange || continentFilter || cqFilter || ituFilter || headingRange || filters.opFilter || Number.isFinite(filters.callLenFilter) || filters.callStructFilter || stationRange || distanceRange
      ? `<p class="log-filter-note">Filter: ${safeBand} ${safeMode ? `/${safeMode}` : ''} ${safeOp ? ` OP ${safeOp}` : ''} ${safeLen ? ` Len ${safeLen}` : ''} ${safeStruct ? ` Struct ${safeStruct}` : ''} ${safeCountry ? ` ${safeCountry}` : ''} ${safeContinent ? ` ${safeContinent}` : ''} ${safeCq ? ` CQ${safeCq}` : ''} ${safeItu ? ` ITU${safeItu}` : ''} ${headingRange ? ` Bearing ${headingRange.start}-${headingRange.end}°` : ''} ${stationRange ? ` Station QSOs ${stationRange.min}-${stationRange.max}` : ''} ${distanceRange ? ` Distance ${distanceRange.start}-${distanceRange.end} km` : ''} ${rangeFilter ? `(QSO #${formatNumberSh6(rangeFilter.start)}-${formatNumberSh6(rangeFilter.end)})` : ''} ${timeRange ? `(Time ${formatDateSh6(timeRange.startTs)} - ${formatDateSh6(timeRange.endTs)})` : ''} <span class="log-filter-hint">(click entries to drill down)</span> <a href="#" id="logClearFilters">clear filters</a></p>`
      : '';
    const pageLinks = Array.from({ length: totalPages }, (_, i) => {
      const from = i * state.logPageSize + 1;
      const to = Math.min((i + 1) * state.logPageSize, filtered.length);
      const cls = i === page ? 'active' : '';
      return `<a href="#" class="log-page ${cls}" data-page="${i}" title="${from}-${to} Qs">&nbsp;${i + 1}&nbsp;</a>`;
    }).join(' ');
    return `
      ${note}
      ${dataNote}
      ${filterNote}
      ${emptyNote}
      <div class="log-controls">
        <form id="logSearchForm" class="no-print log-search">
          Callsign:
          <input id="logSearchInput" type="text" value="${escapeAttr(search || '')}">
          <input type="submit" value="Search">
          <button type="button" id="logSearchClear">Clear</button>
        </form>
        <div class="log-pages">Pages: ${pageLinks}</div>
      </div>
      <table class="mtc log-table" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Time</th><th>Band</th><th>Mode</th><th>Freq</th><th>Call</th><th>RST S</th><th>RST R</th><th>Exch Sent</th><th>Exch Rcvd</th><th>Op</th><th>Country</th><th>Cont.</th><th>CQ</th><th>ITU</th><th>Grid</th><th>Flags</th></tr>
        ${rows}
      </table>
      <div class="log-controls log-controls-bottom">
        <div class="log-pages">Pages: ${pageLinks}</div>
      </div>
    `;
  }

  function renderRawLogPanel(slotLabel, rawText, filename, slotKey) {
    if (!rawText) return `<p>No ${slotLabel} loaded.</p>`;
    const safeText = escapeHtml(rawText);
    const safeName = escapeHtml(filename || `${slotLabel} log`);
    return `
      <div class="raw-log-panel">
        <p><b>${slotLabel}:</b> ${safeName}</p>
        <p>
          <button type="button" class="raw-log-console" data-slot="${slotKey}">Print ${slotLabel} to console</button>
          <button type="button" class="raw-log-copy" data-slot="${slotKey}">Copy ${slotLabel} to clipboard</button>
        </p>
        <pre class="raw-log">${safeText}</pre>
      </div>
    `;
  }

  function renderRawLog() {
    if (!state.logFile || !state.rawLogText) {
      return '<p>No log loaded yet.</p>';
    }
    return renderRawLogPanel('Log A', state.rawLogText, state.logFile?.name, 'A');
  }

  function renderLogExport() {
    if (!state.qsoData) return renderPlaceholder({ id: 'log', title: 'Log' });
    const rows = state.qsoData.qsos.map((q, idx) => {
      const call = escapeCall(q.call || '');
      const op = escapeHtml(q.op || '');
      const country = escapeCountry(q.country || '');
      const grid = escapeHtml(q.grid || '');
      const mode = escapeHtml(q.mode || '');
      const band = escapeHtml(formatBandLabel(q.band || ''));
      const cont = escapeHtml(q.continent || '');
      const flags = escapeHtml(q.isQtc ? 'QTC' : `${q.inMaster === false ? 'NOT-IN-MASTER' : ''}${q.isDupe ? ' DUPE' : ''}`.trim());
      const time = escapeHtml(q.time || '');
      const freq = escapeHtml(formatFrequency(q.freq));
      const cq = escapeHtml(q.cqZone || '');
      const itu = escapeHtml(q.ituZone || '');
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td class="log-qso c1">${formatNumberSh6(q.qsoNumber || '')}</td>
        <td>${q.ts ? formatDateSh6(q.ts) : time}</td>
        <td class="${bandClass(q.band)}">${band}</td>
        <td class="${modeClass(q.mode)}">${mode}</td>
        <td class="${bandClass(q.band)}">${freq}</td>
        <td class="tl">${call}</td>
        <td>${formatNumberSh6(q.rstSent || '')}</td>
        <td>${formatNumberSh6(q.rstRcvd || '')}</td>
        <td>${formatNumberSh6(q.stx || q.exchSent || '')}</td>
        <td>${formatNumberSh6(q.srx || q.exchRcvd || '')}</td>
        <td>${op}</td>
        <td class="tl">${country}</td>
        <td class="tac ${continentClass(q.continent)}">${cont}</td>
        <td>${cq}</td>
        <td>${itu}</td>
        <td class="tl">${grid}</td>
        <td class="tl">${flags}</td>
      </tr>
    `;
    }).join('');
    return `
      <table class="mtc log-table" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Time</th><th>Band</th><th>Mode</th><th>Freq</th><th>Call</th><th>RST S</th><th>RST R</th><th>Exch Sent</th><th>Exch Rcvd</th><th>Op</th><th>Country</th><th>Cont.</th><th>CQ</th><th>ITU</th><th>Grid</th><th>Flags</th></tr>
        ${rows}
      </table>
    `;
  }

  function buildExportFilename(ext) {
    const call = state.derived?.contestMeta?.stationCallsign || 'CALL';
    const contest = state.derived?.contestMeta?.contestId || 'CONTEST';
    const year = state.derived?.timeRange?.minTs ? new Date(state.derived.timeRange.minTs).getUTCFullYear() : 'YEAR';
    const safe = (val) => String(val || '').trim().replace(/[^A-Za-z0-9_-]+/g, '_');
    return `${safe(call)}_${safe(contest)}_${year}.${ext}`;
  }

  function buildExportFilenameForSlot(ext, slotId = 'A') {
    const key = String(slotId || 'A').toUpperCase();
    const slot = getSlotById(key) || state;
    const call = slot?.derived?.contestMeta?.stationCallsign || 'CALL';
    const contest = slot?.derived?.contestMeta?.contestId || 'CONTEST';
    const year = slot?.derived?.timeRange?.minTs ? new Date(slot.derived.timeRange.minTs).getUTCFullYear() : 'YEAR';
    const safe = (val) => String(val || '').trim().replace(/[^A-Za-z0-9_-]+/g, '_');
    const suffix = key === 'A' ? '' : `_${safe(key)}`;
    return `${safe(call)}_${safe(contest)}_${year}${suffix}.${ext}`;
  }

  function downloadTextFile(text, filename, mimeType = 'text/plain;charset=utf-8') {
    const blob = new Blob([String(text || '')], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCbrForSlot(slotId = 'A') {
    const key = String(slotId || 'A').toUpperCase();
    const slot = getSlotById(key) || state;
    const rawText = slot?.rawLogText || '';
    if (!rawText) {
      showOverlayNotice(`No raw log available in Log ${key}.`, 2400);
      return;
    }
    const filename = buildExportFilenameForSlot('cbr', key);
    downloadTextFile(rawText, filename, 'text/plain;charset=utf-8');

    const compareSlots = getActiveCompareSlots();
    const logParams = {};
    compareSlots.forEach((entry) => {
      logParams[`log_${entry.id.toLowerCase()}`] = entry.slot?.derived?.contestMeta?.stationCallsign || '';
    });
    trackEvent('download_cbr', {
      ...logParams,
      slot: key,
      compare: state.compareEnabled ? 'yes' : 'no',
      compare_count: state.compareCount || 1
    });
    showOverlayNotice(`Exported ${filename}.`, 1800);
  }

  function stripLinks(html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    wrapper.querySelectorAll('a').forEach((link) => {
      const span = document.createElement('span');
      span.textContent = link.textContent || '';
      const title = link.getAttribute('title');
      if (title) span.setAttribute('title', title);
      link.replaceWith(span);
    });
    return wrapper.innerHTML;
  }

  function renderReportExport(report) {
    if (report.id === 'log') return renderLogExport();
    if (report.id === 'map_view') {
      return '<p>Map view is interactive and not included in exports. Use the in-app map or KMZ files.</p>';
    }
    const html = renderReport(report);
    return stripLinks(html);
  }

  const EXPORT_EXCLUDE_IDS = new Set(['load_logs', 'export']);

  function resolveExportReports(reportIds) {
    const allowed = reports.filter((r) => !EXPORT_EXCLUDE_IDS.has(r.id));
    if (!Array.isArray(reportIds) || reportIds.length === 0) return allowed;
    const map = new Map(allowed.map((r) => [r.id, r]));
    return reportIds.map((id) => map.get(id)).filter(Boolean);
  }

  function buildExportHtmlSections(reportList) {
    if (!reportList || reportList.length === 0) {
      return '<section class="export-section"><div class="export-header"><div class="export-title">No sections selected</div><div class="export-page"></div></div><p>No content selected for export.</p></section>';
    }
    return reportList.map((r) => `
      <section class="export-section">
        <div class="export-header">
          <div class="export-title">${r.title}</div>
          <div class="export-page"></div>
        </div>
        ${withBandContext(r.id, () => renderReportExport(r))}
      </section>
    `).join('');
  }

  async function getStyleText() {
    try {
      const res = await fetch('style.css', { cache: 'no-store' });
      if (!res.ok) throw new Error('style fetch failed');
      return await res.text();
    } catch (err) {
      console.warn('Style fetch failed:', err);
      return '';
    }
  }

  async function exportHtmlFile(reportIds) {
    if (!state.qsoData) return;
    const styleText = await getStyleText();
    const body = `<div class="export-doc">${buildExportHtmlSections(resolveExportReports(reportIds))}</div>`;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>SH6 Export</title><style>${styleText}</style></head><body>${body}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = buildExportFilename('html');
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPdf(reportIds) {
    if (!state.qsoData) return;
    const styleText = await getStyleText();
    const body = `<div class="export-doc">${buildExportHtmlSections(resolveExportReports(reportIds))}</div>`;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>SH6 Export</title><style>${styleText}</style></head><body>${body}</body></html>`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.document.title = buildExportFilename('pdf').replace(/\.pdf$/, '');
    const triggerPrint = () => {
      win.focus();
      win.print();
    };
    win.addEventListener('load', () => {
      const fonts = win.document.fonts;
      if (fonts && typeof fonts.ready?.then === 'function') {
        fonts.ready.then(() => setTimeout(triggerPrint, 0));
      } else {
        setTimeout(triggerPrint, 0);
      }
    });
  }

  function openExportDialog(type) {
    if (!state.qsoData) return;
    const existing = document.getElementById('exportDialog');
    if (existing) existing.remove();
    const reportOptions = resolveExportReports().map((r) => `
      <label class="export-option">
        <input type="checkbox" data-report-id="${escapeAttr(r.id)}" checked>
        <span>${escapeHtml(r.title)}</span>
      </label>
    `).join('');
    const overlay = document.createElement('div');
    overlay.id = 'exportDialog';
    overlay.className = 'export-dialog-overlay no-print';
    overlay.innerHTML = `
      <div class="export-dialog">
        <div class="export-dialog-head">
          <strong>Export ${type === 'pdf' ? 'PDF' : 'HTML'}</strong>
        </div>
        <p>Select sections to include.</p>
        <div class="export-dialog-actions">
          <button type="button" id="exportSelectAll">Select all</button>
          <button type="button" id="exportSelectNone">Select none</button>
          <button type="button" id="exportCurrent">Current report only</button>
        </div>
        <div class="export-dialog-list">
          ${reportOptions}
        </div>
        <div class="export-dialog-footer">
          <button type="button" id="exportDoIt">Export selected</button>
          <button type="button" id="exportCancel">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const getChecks = () => Array.from(overlay.querySelectorAll('input[type="checkbox"][data-report-id]'));
    const setAll = (checked) => getChecks().forEach((cb) => { cb.checked = checked; });
    const close = () => overlay.remove();
    const exportSelected = (reportIds) => {
      const compareSlots = getActiveCompareSlots();
      const logParams = {};
      compareSlots.forEach((entry) => {
        logParams[`log_${entry.id.toLowerCase()}`] = entry.slot?.derived?.contestMeta?.stationCallsign || '';
      });
      trackEvent(type === 'pdf' ? 'download_pdf' : 'download_html', {
        ...logParams,
        compare: state.compareEnabled ? 'yes' : 'no',
        compare_count: state.compareCount || 1
      });
      if (type === 'pdf') {
        exportPdf(reportIds);
      } else {
        exportHtmlFile(reportIds);
      }
      close();
    };
    overlay.addEventListener('click', (evt) => {
      if (evt.target === overlay) close();
    });
    const selectAllBtn = overlay.querySelector('#exportSelectAll');
    const selectNoneBtn = overlay.querySelector('#exportSelectNone');
    const exportCurrentBtn = overlay.querySelector('#exportCurrent');
    const exportBtn = overlay.querySelector('#exportDoIt');
    const cancelBtn = overlay.querySelector('#exportCancel');
    if (selectAllBtn) selectAllBtn.addEventListener('click', () => setAll(true));
    if (selectNoneBtn) selectNoneBtn.addEventListener('click', () => setAll(false));
    if (exportCurrentBtn) {
      exportCurrentBtn.addEventListener('click', () => {
        const report = reports[state.activeIndex];
        if (!report) return;
        if (EXPORT_EXCLUDE_IDS.has(report.id)) {
          alert('The current view cannot be exported. Please select sections manually.');
          return;
        }
        exportSelected([report.id]);
      });
    }
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const selected = getChecks().filter((cb) => cb.checked).map((cb) => cb.dataset.reportId);
        if (!selected.length) {
          alert('Select at least one section to export.');
          return;
        }
        exportSelected(selected);
      });
    }
    if (cancelBtn) cancelBtn.addEventListener('click', close);
  }

  function renderDupes() {
    if (!state.derived) return renderPlaceholder({ id: 'dupes', title: 'Dupes' });
    const rows = state.derived.dupes.map((q, idx) => {
      const time = escapeHtml(q.time || '');
      const band = escapeHtml(formatBandLabel(q.band || ''));
      const mode = escapeHtml(q.mode || '');
      const call = escapeHtml(q.call || '');
      const callAttr = escapeAttr(q.call || '');
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${time}</td>
        <td class="${bandClass(q.band)}">${band}</td>
        <td class="${modeClass(q.mode)}">${mode}</td>
        <td><a href="#" class="log-call" data-call="${callAttr}">${call}</a></td>
      </tr>
    `;
    }).join('');
    const count = state.derived.dupes.length;
    if (!count) return '<p>No duplicate QSOs detected.</p>';
    return `
      <p>Duplicate QSOs: ${formatNumberSh6(count)}</p>
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Time</th><th>Band</th><th>Mode</th><th>Call</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderExportPage() {
    if (!state.qsoData) {
      return '<p>No log loaded yet. Load a log to enable exports.</p>';
    }
    const loadedSlots = getActiveCompareSlots().filter((entry) => entry.slot?.rawLogText);
    const cbrButtons = loadedSlots.length
      ? loadedSlots.map((entry) => (
        `<button type="button" class="button export-action" data-export="cbr" data-slot="${escapeAttr(entry.id)}">Export ${escapeHtml(entry.label)} CBR</button>`
      )).join(' ')
      : '';
    return `
      <div class="mtc export-panel utility-panel">
        <div class="gradient">&nbsp;Export PDF, HTML, CBR</div>
        <p>Create report exports by format. PDF/HTML let you choose sections; CBR exports raw log text for loaded compare slots.</p>
        <div class="utility-grid">
          <div class="utility-block">
            <h4>PDF export</h4>
            <p>Choose report sections, then open browser print.</p>
          </div>
          <div class="utility-block">
            <h4>HTML export</h4>
            <p>Generate a self-contained HTML report file.</p>
          </div>
        </div>
        <div class="utility-primary-row">
          <button type="button" class="button export-action utility-primary-btn" data-export="pdf">Export PDF</button>
          <button type="button" class="button export-action utility-primary-btn" data-export="html">Export HTML</button>
        </div>
        <div class="utility-block utility-cbr-block">
          <h4>CBR export</h4>
          <p>CBR export saves the original raw log text SH6 loaded for each slot.</p>
          <div class="utility-slot-actions">
            ${cbrButtons || '<span>No loaded raw logs available for CBR export.</span>'}
          </div>
        </div>
        <details class="utility-details">
          <summary>Notes and limits</summary>
          <ul>
            <li>In compare mode, CBR buttons are shown per active loaded slot (Log A/B/C/D).</li>
            <li>Interactive maps are not included in exports. Use KMZ files or the in-app map view.</li>
            <li>For large logs, export fewer sections to improve speed.</li>
          </ul>
        </details>
      </div>
    `;
  }

  function getQslLabelFilename() {
    const name = state.logFile?.name || '';
    if (name) return name;
    const type = (state.qsoData?.type || '').toUpperCase();
    const ext = type === 'CBR' ? 'cbr' : 'adi';
    return `sh6_log.${ext}`;
  }

  function isAdifText(text) {
    if (!text) return false;
    return /<eoh>/i.test(text) || /<eor>/i.test(text);
  }

  function formatAdifField(name, value) {
    const v = value == null ? '' : String(value).trim();
    if (!v) return '';
    return `<${name}:${v.length}>${v}`;
  }

  function buildAdifFromQsos(qsos) {
    const header = [
      'Generated by SH6',
      '<EOH>'
    ].join('\n');
    const lines = (qsos || []).map((q) => {
      const raw = q.raw || {};
      const call = raw.CALL || q.call || '';
      const qsoDate = raw.QSO_DATE || (q.ts ? new Date(q.ts).toISOString().slice(0, 10).replace(/-/g, '') : '');
      const timeOn = raw.TIME_ON || (q.ts ? new Date(q.ts).toISOString().slice(11, 19).replace(/:/g, '') : '');
      const band = raw.BAND || q.band || '';
      const mode = raw.MODE || q.mode || '';
      const rstSent = raw.RST_SENT || q.rstSent || '';
      const rstRcvd = raw.RST_RCVD || q.rstRcvd || '';
      const freq = raw.FREQ || q.freq || '';
      const station = raw.STATION_CALLSIGN || '';
      const op = raw.OPERATOR || q.op || '';
      const grid = raw.GRIDSQUARE || q.grid || '';
      const myGrid = raw.MY_GRIDSQUARE || '';
      const fields = [
        formatAdifField('CALL', call),
        formatAdifField('QSO_DATE', qsoDate),
        formatAdifField('TIME_ON', timeOn),
        formatAdifField('BAND', band),
        formatAdifField('MODE', mode),
        formatAdifField('RST_SENT', rstSent),
        formatAdifField('RST_RCVD', rstRcvd),
        formatAdifField('FREQ', freq),
        formatAdifField('OPERATOR', op),
        formatAdifField('STATION_CALLSIGN', station),
        formatAdifField('GRIDSQUARE', grid),
        formatAdifField('MY_GRIDSQUARE', myGrid)
      ].filter(Boolean).join(' ');
      return `${fields} <EOR>`;
    });
    return `${header}\n${lines.join('\n')}\n`;
  }

  function openQslLabelTool() {
    if (!state.rawLogText) {
      showOverlayNotice('Load a log first to send it to the QSL label tool.', 2400);
      return;
    }
    const content = isAdifText(state.rawLogText) ? state.rawLogText : buildAdifFromQsos(state.qsoData?.qsos || []);
    const win = window.open(QSL_LABEL_TOOL_URL, '_blank');
    if (!win) {
      showOverlayNotice('Popup blocked. Allow popups to open the QSL label tool.', 2600);
      return;
    }
    const targetOrigin = 'https://s53zo.github.io';
    const payload = {
      type: 'sh6_log',
      name: getQslLabelFilename(),
      content
    };
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      try {
        win.postMessage(payload, targetOrigin);
      } catch (err) {
        // ignore transient postMessage errors
      }
      if (attempts >= 15) window.clearInterval(timer);
    }, 350);
    try {
      win.postMessage(payload, targetOrigin);
    } catch (err) {
      /* ignore */
    }
    const onAck = (event) => {
      if (event.origin !== targetOrigin) return;
      if (event.data && event.data.type === 'sh6_log_received') {
        showOverlayNotice('Log sent to QSL label tool.', 2200);
        window.clearInterval(timer);
        window.removeEventListener('message', onAck);
      }
    };
    window.addEventListener('message', onAck);
    window.setTimeout(() => {
      window.removeEventListener('message', onAck);
    }, 8000);
  }

  function renderQslLabels() {
    if (!state.qsoData || !state.rawLogText) {
      return `
        <div class="mtc export-panel">
          <div class="gradient">&nbsp;QSL labels</div>
          <p>No log loaded yet. Load a log, then send it to the label generator.</p>
        </div>
      `;
    }
    const name = escapeHtml(getQslLabelFilename());
    const count = formatNumberSh6(state.qsoData.qsos.length || 0);
    return `
      <div class="mtc export-panel">
        <div class="gradient">&nbsp;QSL labels</div>
        <p>Send the current log to the ADIF-to-QSL-label tool and preload it there.</p>
        <p>The label service formats QSOs into print-ready Avery-style layouts with customizable columns, filters, and export options.</p>
        <p><a href="${QSL_LABEL_TOOL_URL}" target="_blank" rel="noopener noreferrer">${QSL_LABEL_TOOL_URL}</a></p>
        <div class="export-actions">
          <button type="button" class="button qsl-open-btn">Open QSL label tool</button>
          <span>${name} · ${count} QSOs</span>
        </div>
        <div class="export-actions export-note">
          <span>The label tool will open in a new tab and auto-load your log.</span>
        </div>
      </div>
    `;
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
    if (!slot.spotsState) {
      slot.spotsState = createSpotsState();
    }
    return slot.spotsState;
  }

  function getSpotsState() {
    return ensureSpotsState(state);
  }

  function ensureRbnState(slot) {
    if (!slot.rbnState) {
      slot.rbnState = createRbnState();
    }
    return slot.rbnState;
  }

  function getRbnState() {
    return ensureRbnState(state);
  }

  function getSpotStateBySource(slot, source) {
    return source === 'rbn' ? ensureRbnState(slot) : ensureSpotsState(slot);
  }

  function selectRbnDaysForSlot(slot, minTs, maxTs) {
    const allDays = buildRbnDayList(minTs, maxTs);
    if (!allDays.length) return [];
    const rbnState = ensureRbnState(slot);
    const selected = Array.isArray(rbnState.selectedDays) ? rbnState.selectedDays : [];
    const valid = selected.filter((d) => allDays.includes(d));
    let out = [];
    if (allDays.length <= 2) {
      out = allDays.slice();
    } else if (valid.length >= 2) {
      out = valid.slice(0, 2);
    } else if (valid.length === 1) {
      out = [valid[0]];
      const next = allDays.find((d) => d !== valid[0]);
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
    const band = freqMHz ? normalizeBandToken(parseBandFromFreq(freqMHz) || '') : '';
    return { dxCall, spotter, ts, freqKHz, freqMHz, band, comment };
  }

  function buildQsoTimeIndex(qsos) {
    const map = new Map();
    (qsos || []).forEach((q) => {
      if (!Number.isFinite(q.ts)) return;
      const band = normalizeBandToken(q.band || '');
      if (!band) return;
      if (!map.has(band)) map.set(band, []);
      map.get(band).push(q.ts);
    });
    map.forEach((list) => list.sort((a, b) => a - b));
    return map;
  }

  function buildQsoCallIndex(qsos) {
    const map = new Map();
    (qsos || []).forEach((q) => {
      if (!Number.isFinite(q.ts) || !q.call) return;
      const band = normalizeBandToken(q.band || '');
      if (!band) return;
      const call = normalizeCall(q.call);
      if (!call) return;
      if (!map.has(band)) map.set(band, new Map());
      const bandMap = map.get(band);
      if (!bandMap.has(call)) bandMap.set(call, []);
      bandMap.get(call).push(q.ts);
    });
    map.forEach((bandMap) => {
      bandMap.forEach((list) => list.sort((a, b) => a - b));
    });
    return map;
  }

  function hasQsoWithin(band, ts, index, windowMs) {
    if (!band || !index.has(band)) return false;
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
    return candidates.some((t) => Math.abs(t - ts) <= windowMs);
  }

  function hasQsoCallWithin(band, call, ts, index, windowMs) {
    if (!band || !call || !index.has(band)) return false;
    const bandMap = index.get(band);
    const key = normalizeCall(call);
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
    return candidates.some((t) => Math.abs(t - ts) <= windowMs);
  }

  function getNearestQsoDeltaMinutes(band, ts, index) {
    if (!band || !index.has(band)) return null;
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
    const best = Math.min(...candidates.map((t) => Math.abs(t - ts)));
    return best / 60000;
  }

  function getNearestQsoCallDeltaMinutes(band, call, ts, index) {
    if (!band || !call || !index.has(band)) return null;
    const bandMap = index.get(band);
    const key = normalizeCall(call);
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
    const best = Math.min(...candidates.map((t) => Math.abs(t - ts)));
    return best / 60000;
  }

  async function fetchSpotFile(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!/\.gz$/i.test(url)) return res.text();
    if (typeof DecompressionStream !== 'function') {
      throw new Error('gzip not supported in this browser');
    }
    const buffer = await res.arrayBuffer();
    const ds = new DecompressionStream('gzip');
    const stream = new Response(buffer).body.pipeThrough(ds);
    const text = await new Response(stream).text();
    return text;
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
    const spotterRaw = normalizeCall(raw.spotterRaw || raw.spotter || '');
    const spotter = normalizeSpotterBase(raw.spotter || spotterRaw);
    const dxCall = normalizeCall(raw.dxCall || '');
    const ts = Number(raw.ts);
    const freqKHz = raw.freqKHz != null ? Number(raw.freqKHz) : Number(raw.freq);
    const freqMHz = Number.isFinite(raw.freqMHz) ? Number(raw.freqMHz) : (Number.isFinite(freqKHz) ? freqKHz / 1000 : null);
    let band = normalizeBandToken(raw.band || '');
    if (!band && Number.isFinite(freqMHz)) band = normalizeBandToken(parseBandFromFreq(freqMHz));
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
    const url = `${RBN_PROXY_URL}?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || typeof data !== 'object') throw new Error('Invalid RBN response');
    return data;
  }

  async function loadSpotsForCurrentLog(slot = state) {
    const spotsState = ensureSpotsState(slot);
    if (!slot.derived || !slot.qsoData) return;
    const call = String(slot.derived.contestMeta?.stationCallsign || '').toUpperCase();
    const minTs = slot.derived.timeRange?.minTs;
    const maxTs = slot.derived.timeRange?.maxTs;
    if (!call || !Number.isFinite(minTs) || !Number.isFinite(maxTs)) {
      spotsState.status = 'error';
      spotsState.error = 'Missing callsign or time range.';
      renderActiveReport();
      return;
    }
    const windowKey = buildSpotWindowKey(minTs, maxTs);
    if (spotsState.status === 'ready' && spotsState.lastWindowKey === windowKey && spotsState.lastCall === call) {
      renderActiveReport();
      return;
    }
    spotsState.status = 'loading';
    spotsState.error = null;
    spotsState.errors = [];
    spotsState.stats = null;
    updateDataStatus();
    renderActiveReport();
    const days = buildSpotDayList(minTs, maxTs);
    const urls = days.map((d) => ({
      day: d,
      urls: [
        `${SPOTS_BASE_URL}/${d.year}/${d.doy}.dat`,
        `${SPOTS_BASE_URL}/${d.year}/${d.doy}.dat.gz`
      ]
    }));
    const qsoIndex = buildQsoTimeIndex(slot.qsoData.qsos);
    const qsoCallIndex = buildQsoCallIndex(slot.qsoData.qsos);
    let total = 0;
    const ofUsSpots = [];
    const byUsSpots = [];
    try {
      for (const entry of urls) {
        let text = null;
        let lastErr = null;
        for (const url of entry.urls) {
          try {
            text = await fetchSpotFile(url);
            break;
          } catch (err) {
            lastErr = err;
            continue;
          }
        }
        if (text == null) throw lastErr || new Error('Spot file missing');
        const lines = text.split(/\r?\n/);
        for (const line of lines) {
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
        }
      }
      spotsState.status = 'ready';
      spotsState.error = null;
      spotsState.lastWindowKey = windowKey;
      spotsState.lastCall = call;
      spotsState.totalScanned = total;
      spotsState.raw = { ofUsSpots, byUsSpots };
      spotsState.totalOfUs = ofUsSpots.length;
      spotsState.totalByUs = byUsSpots.length;
      spotsState.capPerSide = null;
      spotsState.truncatedOfUs = false;
      spotsState.truncatedByUs = false;
      spotsState.summaryOnly = false;
      spotsState.qsoIndex = qsoIndex;
      spotsState.qsoCallIndex = qsoCallIndex;
      computeSpotsStats(slot);
    } catch (err) {
      spotsState.status = 'error';
      spotsState.error = err && err.message ? err.message : 'Failed to load spots.';
    }
    updateDataStatus();
    renderActiveReport();
  }

  async function loadRbnForCurrentLog(slot = state) {
    const rbnState = ensureRbnState(slot);
    if (!slot.derived || !slot.qsoData) return;
    const call = String(slot.derived.contestMeta?.stationCallsign || '').toUpperCase();
    const minTs = slot.derived.timeRange?.minTs;
    const maxTs = slot.derived.timeRange?.maxTs;
    if (!call || !Number.isFinite(minTs) || !Number.isFinite(maxTs)) {
      rbnState.status = 'error';
      rbnState.error = 'Missing callsign or time range.';
      renderActiveReport();
      return;
    }
    const windowKey = buildSpotWindowKey(minTs, maxTs);
    if (rbnState.status === 'ready' && rbnState.lastWindowKey === windowKey && rbnState.lastCall === call) {
      renderActiveReport();
      return;
    }
    rbnState.status = 'loading';
    rbnState.error = null;
    rbnState.errors = [];
    rbnState.stats = null;
    updateDataStatus();
    renderActiveReport();
    const days = selectRbnDaysForSlot(slot, minTs, maxTs);
    const qsoIndex = buildQsoTimeIndex(slot.qsoData.qsos);
    const qsoCallIndex = buildQsoCallIndex(slot.qsoData.qsos);
    try {
      const data = await fetchRbnSpots(call, days);
      const ofUsSpots = (data.ofUsSpots || []).map(normalizeRbnSpot).filter(Boolean);
      const byUsSpots = (data.byUsSpots || []).map(normalizeRbnSpot).filter(Boolean);
      rbnState.status = 'ready';
      rbnState.error = null;
      rbnState.lastWindowKey = windowKey;
      rbnState.lastCall = call;
      rbnState.totalScanned = data.total || data.scanned || 0;
      rbnState.errors = Array.isArray(data.errors) ? data.errors : [];
      rbnState.totalOfUs = Number.isFinite(data.totalOfUs) ? data.totalOfUs : ofUsSpots.length;
      rbnState.totalByUs = Number.isFinite(data.totalByUs) ? data.totalByUs : byUsSpots.length;
      rbnState.capPerSide = Number.isFinite(data.capPerSide) ? data.capPerSide : null;
      rbnState.truncatedOfUs = Boolean(data.truncatedOfUs);
      rbnState.truncatedByUs = Boolean(data.truncatedByUs);
      rbnState.summaryOnly = (rbnState.totalOfUs + rbnState.totalByUs) > RBN_SUMMARY_ONLY_THRESHOLD;
      rbnState.raw = { ofUsSpots, byUsSpots };
      rbnState.qsoIndex = qsoIndex;
      rbnState.qsoCallIndex = qsoCallIndex;
      computeSpotsStats(slot, rbnState);
    } catch (err) {
      rbnState.status = 'error';
      rbnState.error = err && err.message ? err.message : 'Failed to load RBN spots.';
    }
    updateDataStatus();
    renderActiveReport();
  }

  function computeSpotsStats(slot = state, spotsStateOverride = null) {
    const spotsState = spotsStateOverride || ensureSpotsState(slot);
    if (!spotsState.raw || !slot.qsoData) return;
    const call = String(slot.derived?.contestMeta?.stationCallsign || '').toUpperCase();
    const windowMinutes = Number(spotsState.windowMinutes) || 15;
    const windowMs = windowMinutes * 60 * 1000;
    const filterSet = new Set(spotsState.bandFilter || []);
    const bandAllowed = (band) => {
      if (!filterSet.size) return true;
      const key = band || 'unknown';
      return filterSet.has(key);
    };
    const qsoIndex = spotsState.qsoIndex || buildQsoTimeIndex(slot.qsoData.qsos);
    const qsoCallIndex = spotsState.qsoCallIndex || buildQsoCallIndex(slot.qsoData.qsos);
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
      if (!bandAllowed(spot.band)) return;
      ofUs += 1;
      spotters.set(spot.spotter, (spotters.get(spot.spotter) || 0) + 1);
      const bandKey = spot.band || 'unknown';
      if (!bandStats.has(bandKey)) bandStats.set(bandKey, { ofUs: 0, ofUsMatched: 0, byUs: 0, byUsMatched: 0 });
      bandStats.get(bandKey).ofUs += 1;
      const matched = hasQsoWithin(spot.band, spot.ts, qsoIndex, windowMs);
      if (matched) {
        ofUsMatched += 1;
        bandStats.get(bandKey).ofUsMatched += 1;
      }
      const delta = matched ? getNearestQsoDeltaMinutes(spot.band, spot.ts, qsoIndex) : null;
      if (matched && Number.isFinite(delta)) responseTimes.push(delta);
      ofUsSpots.push({ ...spot, matched, delta });
      if (spot.band) {
        if (!heatmap.has(spot.band)) heatmap.set(spot.band, Array.from({ length: 24 }, () => 0));
        const hour = new Date(spot.ts).getUTCHours();
        heatmap.get(spot.band)[hour] = (heatmap.get(spot.band)[hour] || 0) + 1;
      }
    });
    (spotsState.raw.byUsSpots || []).forEach((spot) => {
      if (!bandAllowed(spot.band)) return;
      byUs += 1;
      dxTargets.set(spot.dxCall, (dxTargets.get(spot.dxCall) || 0) + 1);
      const bandKey = spot.band || 'unknown';
      if (!bandStats.has(bandKey)) bandStats.set(bandKey, { ofUs: 0, ofUsMatched: 0, byUs: 0, byUsMatched: 0 });
      bandStats.get(bandKey).byUs += 1;
      const matched = hasQsoWithin(spot.band, spot.ts, qsoIndex, windowMs);
      if (matched) {
        byUsMatched += 1;
        bandStats.get(bandKey).byUsMatched += 1;
      }
      const matchedDx = hasQsoCallWithin(spot.band, spot.dxCall, spot.ts, qsoCallIndex, windowMs);
      const deltaDx = matchedDx ? getNearestQsoCallDeltaMinutes(spot.band, spot.dxCall, spot.ts, qsoCallIndex) : null;
      if (matchedDx) {
        byUsMatchedDx += 1;
        if (Number.isFinite(deltaDx)) responseDxTimes.push(deltaDx);
      }
      byUsSpots.push({ ...spot, matched, matchedDx, deltaDx: Number.isFinite(deltaDx) ? deltaDx : null });
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

  function renderSpots(options = {}) {
    if (!state.qsoData || !state.derived) {
      return renderStateCard({
        type: 'info',
        title: 'Spots unavailable',
        message: 'Load a log to enable spots analysis for this report.'
      });
    }
    const source = options.source || 'spots';
    const sourceAttr = escapeAttr(source);
    const title = options.title || 'Spots';
    const intro = options.intro || 'Analyze spots for your callsign and your spotter activity.';
    const loadLabel = options.loadLabel || 'Load spots';
    const loadingLabel = options.loadingLabel || 'Loading spots...';
    const readyLabel = options.readyLabel || 'Spots loaded.';
    const fileListLabel = options.fileListLabel || 'Spot files';
    const errorLabel = options.errorLabel || 'Day errors';
    const extraNote = options.note || '';
    const dayPickerHtml = options.dayPickerHtml || '';
    const hideRbnExtras = source === 'rbn';
    const hideControls = Boolean(options.hideControls);
    const slotId = state.renderSlotId || 'A';
    const slotAttr = escapeAttr(slotId);
    const sectionIdBase = `spots-${String(source || 'spots').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${String(slotId || 'a').toLowerCase()}`;
    const sectionIds = {
      bandHour: `${sectionIdBase}-band-hour`,
      topSpotters: `${sectionIdBase}-top-spotters`,
      missedMults: `${sectionIdBase}-missed-mults`
    };
    const call = escapeHtml(state.derived.contestMeta?.stationCallsign || 'N/A');
    const minTs = state.derived.timeRange?.minTs;
    const maxTs = state.derived.timeRange?.maxTs;
    const start = Number.isFinite(minTs) ? formatDateSh6(minTs) : 'N/A';
    const end = Number.isFinite(maxTs) ? formatDateSh6(maxTs) : 'N/A';
    const days = buildSpotDayList(minTs, maxTs);
    const dayList = options.dayList != null
      ? options.dayList
      : days.map((d) => formatSpotDayLabel(d)).join(', ');
    const spotsState = options.spotsState || getSpotsState();
    const windowMinutes = Number(spotsState.windowMinutes) || 15;
    const bandFilterSet = new Set(spotsState.bandFilter || []);
    const drillBand = normalizeBandToken(spotsState.drillBand || '') || '';
    const drillHour = Number.isFinite(Number(spotsState.drillHour)) ? Number(spotsState.drillHour) : null;
    const drillContinent = String(spotsState.drillContinent || '').trim().toUpperCase();
    const drillCqZone = String(spotsState.drillCqZone || '').trim().toUpperCase();
    const drillItuZone = String(spotsState.drillItuZone || '').trim().toUpperCase();
    const stats = spotsState.stats;
    const statusText = spotsState.status === 'loading'
      ? loadingLabel
      : (spotsState.status === 'error' ? `Error: ${escapeHtml(spotsState.error || '')}` : (spotsState.status === 'ready' ? readyLabel : 'Not loaded'));
    const totalOfUs = Number.isFinite(spotsState.totalOfUs) ? spotsState.totalOfUs : (stats?.ofUs || 0);
    const totalByUs = Number.isFinite(spotsState.totalByUs) ? spotsState.totalByUs : (stats?.byUs || 0);
    const truncated = Boolean(spotsState.truncatedOfUs || spotsState.truncatedByUs);
    const capPerSide = Number.isFinite(spotsState.capPerSide) ? spotsState.capPerSide : null;
    const summaryOnly = Boolean(spotsState.summaryOnly);
    const truncatedNote = truncated
      ? `Large dataset detected. Showing first ${formatNumberSh6(capPerSide || SPOT_TABLE_LIMIT)} per side; stats are based on this sample.`
      : '';
    const summaryNote = summaryOnly
      ? 'Spot lists are hidden to protect your browser. Narrow by band/time to reveal lists.'
      : '';
    const errorList = Array.isArray(spotsState.errors) ? spotsState.errors : [];
    const errorSummary = errorList.length
      ? (() => {
        const max = 5;
        const items = errorList.slice(0, max).map((e) => {
          const day = escapeHtml(e?.day || '');
          const msg = escapeHtml(e?.error || 'error');
          return `${day}: ${msg}`;
        }).filter(Boolean);
        if (!items.length) return '';
        const more = errorList.length > max ? ` (+${errorList.length - max} more)` : '';
        return `${items.join('; ')}${more}`;
      })()
      : '';
    const baseBands = getBandsFromDerived(state.derived).filter((b) => b && String(b).toLowerCase() !== 'unknown');
    if (stats?.bandStats?.some((b) => b.band === 'unknown') && !baseBands.includes('unknown')) {
      baseBands.push('unknown');
    }
    const bandOptions = sortBands(baseBands);
    const summarizeGroups = (spots, keyField) => {
      const map = new Map();
      (spots || []).forEach((s) => {
        const key = s[keyField];
        if (!key) return;
        if (!map.has(key)) {
          map.set(key, { name: key, count: 0, matched: 0, matchedDx: 0, deltas: [], dxDeltas: [], bandCounts: new Map() });
        }
        const entry = map.get(key);
        entry.count += 1;
        if (s.matched) {
          entry.matched += 1;
          if (Number.isFinite(s.delta)) entry.deltas.push(s.delta);
        }
        if (s.matchedDx) {
          entry.matchedDx += 1;
          if (Number.isFinite(s.deltaDx)) entry.dxDeltas.push(s.deltaDx);
        }
        if (s.band) {
          entry.bandCounts.set(s.band, (entry.bandCounts.get(s.band) || 0) + 1);
        }
      });
      const median = (list) => {
        if (!list.length) return null;
        const sorted = list.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2) return sorted[mid];
        return (sorted[mid - 1] + sorted[mid]) / 2;
      };
      const out = [];
      map.forEach((entry) => {
        const topBand = entry.bandCounts.size
          ? Array.from(entry.bandCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
          : '';
        out.push({
          name: entry.name,
          count: entry.count,
          matched: entry.matched,
          matchedDx: entry.matchedDx,
          conv: entry.count ? (entry.matched / entry.count) * 100 : 0,
          convDx: entry.count ? (entry.matchedDx / entry.count) * 100 : 0,
          median: median(entry.deltas),
          avg: entry.deltas.length ? entry.deltas.reduce((a, b) => a + b, 0) / entry.deltas.length : null,
          medianDx: median(entry.dxDeltas),
          avgDx: entry.dxDeltas.length ? entry.dxDeltas.reduce((a, b) => a + b, 0) / entry.dxDeltas.length : null,
          topBand
        });
      });
      return out.sort((a, b) => b.count - a.count);
    };

    const renderSpotterTable = (entries) => {
      if (!entries || !entries.length) return '<p>None.</p>';
      const rows = entries.slice(0, 15).map((e, idx) => {
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        return `
          <tr class="${cls}">
            <td>${escapeHtml(e.name)}</td>
            <td>${formatNumberSh6(e.count)}</td>
            <td class="${bandClass(e.topBand)}">${escapeHtml(formatBandLabel(e.topBand || ''))}</td>
          </tr>
        `;
      }).join('');
      return `
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Spotter</th><th>Spots</th><th>Top band</th></tr>
          ${rows}
        </table>
      `;
    };

    const renderDxTable = (entries) => {
      if (!entries || !entries.length) return '<p>None.</p>';
      const rows = entries.slice(0, 15).map((e, idx) => {
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        return `
          <tr class="${cls}">
            <td>${escapeHtml(e.name)}</td>
            <td>${formatNumberSh6(e.count)}</td>
            <td class="${bandClass(e.topBand)}">${escapeHtml(formatBandLabel(e.topBand || ''))}</td>
          </tr>
        `;
      }).join('');
      return `
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>DX</th><th>Spots</th><th>Top band</th></tr>
          ${rows}
        </table>
      `;
    };
    const renderBandConversionTable = (bandStats) => {
      if (!bandStats || !bandStats.length) return '<p>No band data.</p>';
      const bands = sortBands(bandStats.map((b) => b.band).filter(Boolean));
      const rows = bands.map((band, idx) => {
        const entry = bandStats.find((b) => b.band === band) || { ofUs: 0, byUs: 0 };
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        return `
          <tr class="${cls}">
            <td class="${bandClass(band)}"><b>${escapeHtml(formatBandLabel(band))}</b></td>
            <td>${formatNumberSh6(entry.ofUs)}</td>
            <td>${formatNumberSh6(entry.byUs)}</td>
          </tr>
        `;
      }).join('');
      return `
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Band</th><th>Spots of you</th><th>Spots by you</th></tr>
          ${rows}
        </table>
      `;
    };
    const renderResponseHistogram = (values, windowMinutes) => {
      if (!values || !values.length) return '<p>No matched spots to analyze.</p>';
      const maxWindow = Math.max(1, Number(windowMinutes) || 15);
      const steps = [1, 3, 5, 10];
      const bins = [];
      let start = 0;
      for (const step of steps) {
        if (step >= maxWindow) {
          bins.push({ label: `${start}-${maxWindow}m`, min: start, max: maxWindow });
          start = maxWindow;
          break;
        }
        bins.push({ label: `${start}-${step}m`, min: start, max: step });
        start = step;
      }
      if (start < maxWindow) {
        bins.push({ label: `${start}-${maxWindow}m`, min: start, max: maxWindow });
      }
      const data = bins.map((b) => ({
        label: b.label,
        count: values.filter((v) => v >= b.min && v < b.max + 1e-6).length
      }));
      return renderBars(data, 'label', 'count');
    };
    const renderUnansweredTable = (spots, limit = SPOT_TABLE_LIMIT) => {
      if (!spots || !spots.length) return '<p>None.</p>';
      const clipped = spots.slice(0, limit);
      const truncated = spots.length > limit;
      const rows = clipped.map((s, idx) => {
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        return `
          <tr class="${cls}">
            <td>${escapeHtml(formatDateSh6(s.ts))}</td>
            <td class="${bandClass(s.band)}">${escapeHtml(formatBandLabel(s.band || ''))}</td>
            <td>${escapeHtml(String(s.freqKHz || ''))}</td>
            <td>${escapeHtml(s.spotter || '')}</td>
            <td class="tl">${escapeHtml(s.comment || '')}</td>
          </tr>
        `;
      }).join('');
      const note = truncated ? `<div class="export-actions export-note">Showing first ${formatNumberSh6(limit)} of ${formatNumberSh6(spots.length)} rows.</div>` : '';
      return `
        ${note}
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Time (UTC)</th><th>Band</th><th>Freq</th><th>Spotter</th><th>Comment</th></tr>
          ${rows}
        </table>
      `;
    };
    const renderAllSpotsTable = (spots, isOfUs, limit = SPOT_TABLE_LIMIT) => {
      if (!spots || !spots.length) return '<p>None.</p>';
      const clipped = spots.slice(0, limit);
      const truncated = spots.length > limit;
      const rows = clipped.map((s, idx) => {
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        const time = escapeHtml(formatDateSh6(s.ts));
        const bandLabel = escapeHtml(formatBandLabel(s.band || ''));
        const freq = escapeHtml(String(s.freqKHz || ''));
        const comment = escapeHtml(s.comment || '');
        if (isOfUs) {
          return `
            <tr class="${cls}">
              <td>${time}</td>
              <td class="${bandClass(s.band)}">${bandLabel}</td>
              <td>${freq}</td>
              <td>${escapeHtml(s.spotter || '')}</td>
              <td class="tl">${comment}</td>
            </tr>
          `;
        }
        return `
          <tr class="${cls}">
            <td>${time}</td>
            <td class="${bandClass(s.band)}">${bandLabel}</td>
            <td>${freq}</td>
            <td>${escapeHtml(s.dxCall || '')}</td>
            <td class="tl">${comment}</td>
          </tr>
        `;
      }).join('');
      const headers = isOfUs
        ? '<tr class="thc"><th>Time (UTC)</th><th>Band</th><th>Freq</th><th>Spotter</th><th>Comment</th></tr>'
        : '<tr class="thc"><th>Time (UTC)</th><th>Band</th><th>Freq</th><th>DX</th><th>Comment</th></tr>';
      const note = truncated ? `<div class="export-actions export-note">Showing first ${formatNumberSh6(limit)} of ${formatNumberSh6(spots.length)} rows.</div>` : '';
      return `
        ${note}
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          ${headers}
          ${rows}
        </table>
      `;
    };
    const medianValue = (list) => {
      if (!list || !list.length) return null;
      const sorted = list.slice().sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      if (sorted.length % 2) return sorted[mid];
      return (sorted[mid - 1] + sorted[mid]) / 2;
    };
    const lowerBound = (list, target) => {
      let lo = 0;
      let hi = list.length;
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (list[mid] < target) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    };
    const countInRange = (list, start, end) => {
      if (!list || !list.length) return 0;
      const left = lowerBound(list, start);
      const right = lowerBound(list, end);
      return Math.max(0, right - left);
    };
    const findAfterRecord = (list, ts) => {
      if (!list || !list.length) return null;
      let lo = 0;
      let hi = list.length;
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (list[mid].ts < ts) lo = mid + 1;
        else hi = mid;
      }
      return list[lo] || null;
    };
    const findBeforeRecord = (list, ts) => {
      if (!list || !list.length) return null;
      let lo = 0;
      let hi = list.length;
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (list[mid].ts <= ts) lo = mid + 1;
        else hi = mid;
      }
      return list[lo - 1] || null;
    };
    const formatUtcDate = (ts) => {
      const d = new Date(ts);
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const formatUtcTime = (ts) => {
      const d = new Date(ts);
      const h = String(d.getUTCHours()).padStart(2, '0');
      const m = String(d.getUTCMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    };
    const buildAnalysisContext = () => {
      const bandSet = new Set(spotsState.bandFilter || []);
      const bandAllowed = (band) => {
        if (!bandSet.size) return true;
        return bandSet.has(band || 'unknown');
      };
      const allQsos = (state.qsoData?.qsos || []).filter((q) => Number.isFinite(q.ts));
      const filteredQsos = allQsos.filter((q) => bandAllowed(normalizeBandToken(q.band || '') || 'unknown'));
      const filteredSorted = filteredQsos.slice().sort((a, b) => a.ts - b.ts);
      const allTimes = filteredSorted.map((q) => q.ts);
      const qsoTimesByBand = new Map();
      const qsoRecordsByBand = new Map();
      filteredSorted.forEach((q) => {
        const band = normalizeBandToken(q.band || '') || 'unknown';
        if (!qsoTimesByBand.has(band)) {
          qsoTimesByBand.set(band, []);
          qsoRecordsByBand.set(band, []);
        }
        qsoTimesByBand.get(band).push(q.ts);
        qsoRecordsByBand.get(band).push({ ts: q.ts, freq: q.freq, call: q.call || '', country: q.country || '', band });
      });
      const allSorted = allQsos.slice().sort((a, b) => a.ts - b.ts);
      const firstCallTime = new Map();
      const firstCallBandTime = new Map();
      const firstCountryTime = new Map();
      allSorted.forEach((q) => {
        const callKey = normalizeCall(q.call || '');
        if (callKey && !firstCallTime.has(callKey)) firstCallTime.set(callKey, q.ts);
        const bandKey = normalizeBandToken(q.band || '') || 'unknown';
        if (callKey) {
          const key = `${bandKey}|${callKey}`;
          if (!firstCallBandTime.has(key)) firstCallBandTime.set(key, q.ts);
        }
        const country = q.country || '';
        if (country && !firstCountryTime.has(country)) firstCountryTime.set(country, q.ts);
      });
      return {
        bandSet,
        bandAllowed,
        filteredSorted,
        allTimes,
        qsoTimesByBand,
        qsoRecordsByBand,
        firstCallTime,
        firstCallBandTime,
        firstCountryTime
      };
    };
    const renderUnworkedRateTable = (spots) => {
      if (!spots || !spots.length) return '<p>No data.</p>';
      const map = new Map();
      spots.forEach((s) => {
        const band = s.band || 'unknown';
        const hour = new Date(s.ts).getUTCHours();
        const key = `${band}|${hour}`;
        if (!map.has(key)) map.set(key, { band, hour, total: 0, unanswered: 0 });
        const entry = map.get(key);
        entry.total += 1;
        if (!s.matched) entry.unanswered += 1;
      });
      const entries = Array.from(map.values()).filter((e) => e.total >= 3).map((e) => ({
        ...e,
        pct: e.total ? (e.unanswered / e.total) * 100 : 0
      }));
      if (!entries.length) return '<p>No band/hour buckets with at least 3 spots.</p>';
      entries.sort((a, b) => b.pct - a.pct || b.total - a.total);
      const rows = entries.slice(0, 20).map((e, idx) => {
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        return `
          <tr class="${cls}">
            <td class="${bandClass(e.band)}">${escapeHtml(formatBandLabel(e.band || ''))}</td>
            <td>${String(e.hour).padStart(2, '0')}</td>
            <td>${formatNumberSh6(e.total)}</td>
            <td>${formatNumberSh6(e.unanswered)}</td>
            <td>${e.pct.toFixed(1)}%</td>
          </tr>
        `;
      }).join('');
      return `
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Band</th><th>Hour</th><th>Spots</th><th>Unanswered</th><th>%</th></tr>
          ${rows}
        </table>
      `;
    };
    const renderTimeToFirstQsoTable = (spots, analysis) => {
      if (!spots || !spots.length) return '<p>No data.</p>';
      const byBand = new Map();
      spots.forEach((s) => {
        const band = s.band || 'unknown';
        if (!byBand.has(band)) byBand.set(band, []);
        byBand.get(band).push(s.ts);
      });
      const gapMs = 30 * 60000;
      const rows = Array.from(byBand.entries()).map(([band, list]) => {
        const times = list.slice().sort((a, b) => a - b);
        const clusterStarts = [];
        let start = times[0];
        let prev = times[0];
        for (let i = 1; i < times.length; i += 1) {
          const ts = times[i];
          if (ts - prev > gapMs) {
            clusterStarts.push(start);
            start = ts;
          }
          prev = ts;
        }
        clusterStarts.push(start);
        const qsoList = analysis.qsoRecordsByBand.get(band) || [];
        const deltas = [];
        clusterStarts.forEach((ts) => {
          const next = findAfterRecord(qsoList, ts);
          if (next) deltas.push((next.ts - ts) / 60000);
        });
        return {
          band,
          clusters: clusterStarts.length,
          found: deltas.length,
          avg: deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : null,
          median: medianValue(deltas)
        };
      }).sort((a, b) => b.clusters - a.clusters);
      if (!rows.length) return '<p>No data.</p>';
      const body = rows.map((e, idx) => {
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        return `
          <tr class="${cls}">
            <td class="${bandClass(e.band)}">${escapeHtml(formatBandLabel(e.band || ''))}</td>
            <td>${formatNumberSh6(e.clusters)}</td>
            <td>${formatNumberSh6(e.found)}</td>
            <td>${e.avg != null ? e.avg.toFixed(1) : 'N/A'}</td>
            <td>${e.median != null ? e.median.toFixed(1) : 'N/A'}</td>
          </tr>
        `;
      }).join('');
      return `
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Band</th><th>Spot clusters</th><th>With QSO</th><th>Avg min</th><th>Median min</th></tr>
          ${body}
        </table>
      `;
    };
    const renderSpotUpliftTable = (spots, analysis) => {
      if (!spots || !spots.length) return '<p>No data.</p>';
      const windowMs = 10 * 60000;
      const map = new Map();
      spots.forEach((s) => {
        const band = s.band || 'unknown';
        const list = analysis.qsoTimesByBand.get(band) || [];
        const before = countInRange(list, s.ts - windowMs, s.ts);
        const after = countInRange(list, s.ts, s.ts + windowMs);
        if (!map.has(band)) map.set(band, { band, spots: 0, beforeSum: 0, afterSum: 0, upliftSum: 0, positive: 0 });
        const entry = map.get(band);
        entry.spots += 1;
        entry.beforeSum += before;
        entry.afterSum += after;
        entry.upliftSum += (after - before);
        if (after > before) entry.positive += 1;
      });
      const rows = Array.from(map.values()).sort((a, b) => b.spots - a.spots).map((e, idx) => {
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        const avgBefore = e.spots ? e.beforeSum / e.spots : 0;
        const avgAfter = e.spots ? e.afterSum / e.spots : 0;
        const avgUplift = e.spots ? e.upliftSum / e.spots : 0;
        const pct = e.spots ? (e.positive / e.spots) * 100 : 0;
        return `
          <tr class="${cls}">
            <td class="${bandClass(e.band)}">${escapeHtml(formatBandLabel(e.band || ''))}</td>
            <td>${avgBefore.toFixed(2)}</td>
            <td>${avgAfter.toFixed(2)}</td>
            <td>${avgUplift.toFixed(2)}</td>
            <td>${pct.toFixed(1)}%</td>
          </tr>
        `;
      }).join('');
      return `
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Band</th><th>Avg 10m before</th><th>Avg 10m after</th><th>Avg uplift</th><th>% positive</th></tr>
          ${rows}
        </table>
      `;
    };
    const renderSpottingFunnelTable = (spots, analysis) => {
      const total = spots.length;
      if (!total) return '<p>No data.</p>';
      let matchedBand = 0;
      let matchedDx = 0;
      let newCall = 0;
      let newBand = 0;
      let newCountry = 0;
      spots.forEach((s) => {
        if (s.matched) matchedBand += 1;
        if (s.matchedDx) {
          matchedDx += 1;
          const callKey = normalizeCall(s.dxCall || '');
          if (callKey) {
            const firstCall = analysis.firstCallTime.get(callKey);
            if (firstCall == null || firstCall >= s.ts) newCall += 1;
            const bandKey = s.band || 'unknown';
            const bandCallKey = `${bandKey}|${callKey}`;
            const firstBand = analysis.firstCallBandTime.get(bandCallKey);
            if (firstBand == null || firstBand >= s.ts) newBand += 1;
          }
          const prefix = lookupPrefix(s.dxCall || '');
          const country = prefix?.country || '';
          if (country) {
            const firstCountry = analysis.firstCountryTime.get(country);
            if (firstCountry == null || firstCountry >= s.ts) newCountry += 1;
          }
        }
      });
      const rows = [
        { label: 'Spots by you (total)', count: total },
        { label: 'Matched on band', count: matchedBand },
        { label: 'Worked DX (call)', count: matchedDx },
        { label: 'New DX call', count: newCall },
        { label: 'New band for call', count: newBand },
        { label: 'New country (cty)', count: newCountry }
      ].map((e, idx) => {
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        const pct = total ? (e.count / total) * 100 : 0;
        return `
          <tr class="${cls}">
            <td class="tl">${escapeHtml(e.label)}</td>
            <td>${formatNumberSh6(e.count)}</td>
            <td>${pct.toFixed(1)}%</td>
          </tr>
        `;
      }).join('');
      return `
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Stage</th><th>Count</th><th>% of total</th></tr>
          ${rows}
        </table>
      `;
    };
    const renderBandChangeEfficiencyTable = (analysis) => {
      const qsos = analysis.filteredSorted;
      if (!qsos || qsos.length < 2) return '<p>No data.</p>';
      const windowMs = 10 * 60000;
      const map = new Map();
      for (let i = 1; i < qsos.length; i += 1) {
        const prev = qsos[i - 1];
        const curr = qsos[i];
        const prevBand = normalizeBandToken(prev.band || '') || 'unknown';
        const currBand = normalizeBandToken(curr.band || '') || 'unknown';
        if (prevBand === currBand) continue;
        const before = countInRange(analysis.allTimes, curr.ts - windowMs, curr.ts);
        const after = countInRange(analysis.allTimes, curr.ts, curr.ts + windowMs);
        if (!map.has(currBand)) map.set(currBand, { band: currBand, switches: 0, improved: 0, upliftSum: 0 });
        const entry = map.get(currBand);
        entry.switches += 1;
        const uplift = after - before;
        entry.upliftSum += uplift;
        if (uplift > 0) entry.improved += 1;
      }
      const rows = Array.from(map.values()).sort((a, b) => b.switches - a.switches).map((e, idx) => {
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        const pct = e.switches ? (e.improved / e.switches) * 100 : 0;
        const avg = e.switches ? e.upliftSum / e.switches : 0;
        return `
          <tr class="${cls}">
            <td class="${bandClass(e.band)}">${escapeHtml(formatBandLabel(e.band || ''))}</td>
            <td>${formatNumberSh6(e.switches)}</td>
            <td>${pct.toFixed(1)}%</td>
            <td>${avg.toFixed(2)}</td>
          </tr>
        `;
      }).join('');
      return `
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Band</th><th>Switches into band</th><th>% improved</th><th>Avg uplift</th></tr>
          ${rows}
        </table>
      `;
    };
    const computeSpotterReliabilityEntries = (spots, minSpots = 3) => {
      if (!spots || !spots.length) return [];
      const map = new Map();
      spots.forEach((s) => {
        if (!map.has(s.spotter)) map.set(s.spotter, { spotter: s.spotter, spots: 0, matched: 0 });
        const entry = map.get(s.spotter);
        entry.spots += 1;
        if (s.matched) entry.matched += 1;
      });
      return Array.from(map.values())
        .filter((e) => e.spots >= minSpots)
        .map((e) => ({ ...e, pct: e.spots ? (e.matched / e.spots) * 100 : 0 }))
        .sort((a, b) => b.pct - a.pct || b.spots - a.spots);
    };

    const buildMissedMultEntries = (spots, analysis) => {
      if (!spots || !spots.length) return [];
      const missed = [];
      spots.forEach((s) => {
        if (s.matchedDx) return;
        const prefix = lookupPrefix(s.dxCall || '');
        const country = prefix?.country || '';
        if (!country) return;
        const first = analysis.firstCountryTime.get(country);
        if (first != null && first < s.ts) return;
        missed.push({
          ts: s.ts,
          band: s.band,
          dx: s.dxCall,
          country
        });
      });
      return missed;
    };

    const buildBestBandHourWindows = (spots, limit = 3) => {
      if (!spots || !spots.length) return [];
      const map = new Map();
      spots.forEach((spot) => {
        if (!Number.isFinite(spot.ts)) return;
        const band = normalizeBandToken(spot.band || '') || 'unknown';
        const hour = new Date(spot.ts).getUTCHours();
        const key = `${band}|${hour}`;
        if (!map.has(key)) map.set(key, { band, hour, spots: 0, matched: 0 });
        const entry = map.get(key);
        entry.spots += 1;
        if (spot.matched) entry.matched += 1;
      });
      return Array.from(map.values())
        .map((entry) => ({
          ...entry,
          conv: entry.spots ? (entry.matched / entry.spots) * 100 : 0
        }))
        .filter((entry) => entry.spots >= 3)
        .sort((a, b) => {
          if (b.matched !== a.matched) return b.matched - a.matched;
          if (b.conv !== a.conv) return b.conv - a.conv;
          if (b.spots !== a.spots) return b.spots - a.spots;
          return bandOrderIndex(a.band) - bandOrderIndex(b.band);
        })
        .slice(0, Math.max(1, Math.min(5, Number(limit) || 3)));
    };

    const estimateWindowConfidence = (spots) => {
      if (spots >= 30) return 'high';
      if (spots >= 12) return 'medium';
      return 'low';
    };

    const renderSpotterReliabilityTable = (spots) => {
      const entries = computeSpotterReliabilityEntries(spots, 3);
      const rows = entries
        .slice(0, 15)
        .map((e, idx) => {
          const cls = idx % 2 === 0 ? 'td1' : 'td0';
          return `
            <tr class="${cls}">
              <td>${escapeHtml(e.spotter || '')}</td>
              <td>${formatNumberSh6(e.spots)}</td>
              <td>${formatNumberSh6(e.matched)}</td>
              <td>${e.pct.toFixed(1)}%</td>
            </tr>
          `;
        }).join('');
      if (!rows) return '<p>No spotters with at least 3 spots.</p>';
      return `
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Spotter</th><th>Spots</th><th>Matched</th><th>%</th></tr>
          ${rows}
        </table>
      `;
    };
    const hasConcurrentBands = (qsos) => {
      const buckets = new Map();
      const bucketMs = 10 * 60000;
      (qsos || []).forEach((q) => {
        if (!Number.isFinite(q.ts)) return;
        const band = normalizeBandToken(q.band || '') || 'unknown';
        const bucket = Math.floor(q.ts / bucketMs);
        if (!buckets.has(bucket)) buckets.set(bucket, new Set());
        const set = buckets.get(bucket);
        set.add(band);
        if (set.size > 1) return;
      });
      for (const set of buckets.values()) {
        if (set.size > 1) return true;
      }
      return false;
    };
    const renderMissedMultTable = (spots, analysis) => {
      const missed = buildMissedMultEntries(spots, analysis);
      if (!missed.length) return '<p>No missed mult candidates found.</p>';
      const rows = missed.slice(0, 20).map((s, idx) => {
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        return `
          <tr class="${cls}">
            <td>${escapeHtml(formatDateSh6(s.ts))}</td>
            <td class="${bandClass(s.band)}">${escapeHtml(formatBandLabel(s.band || ''))}</td>
            <td>${escapeHtml(s.dx || '')}</td>
            <td>${escapeHtml(s.country || '')}</td>
          </tr>
        `;
      }).join('');
      return `
        <p>Missed mult candidates: ${formatNumberSh6(missed.length)}</p>
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Time (UTC)</th><th>Band</th><th>DX</th><th>Country</th></tr>
          ${rows}
        </table>
      `;
    };
    const renderOpenCloseTable = (spots) => {
      if (!spots || !spots.length) return '<p>No data.</p>';
      const map = new Map();
      spots.forEach((s) => {
        const day = formatUtcDate(s.ts);
        const band = s.band || 'unknown';
        const key = `${day}|${band}`;
        if (!map.has(key)) map.set(key, { day, band, min: s.ts, max: s.ts });
        const entry = map.get(key);
        entry.min = Math.min(entry.min, s.ts);
        entry.max = Math.max(entry.max, s.ts);
      });
      const entries = Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day) || bandOrderIndex(a.band) - bandOrderIndex(b.band));
      const rows = entries.map((e, idx) => {
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        const spanHours = ((e.max - e.min) / 3600000).toFixed(1);
        return `
          <tr class="${cls}">
            <td>${escapeHtml(e.day)}</td>
            <td class="${bandClass(e.band)}">${escapeHtml(formatBandLabel(e.band || ''))}</td>
            <td>${formatUtcTime(e.min)}</td>
            <td>${formatUtcTime(e.max)}</td>
            <td>${spanHours}</td>
          </tr>
        `;
      }).join('');
      return `
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Day (UTC)</th><th>Band</th><th>Open</th><th>Close</th><th>Span (h)</th></tr>
          ${rows}
        </table>
      `;
    };
    const renderPileupWindowTable = (spots, analysis) => {
      if (!spots || !spots.length) return '<p>No data.</p>';
      const bucketMs = 10 * 60000;
      const spotBuckets = new Map();
      spots.forEach((s) => {
        const bucket = Math.floor(s.ts / bucketMs);
        spotBuckets.set(bucket, (spotBuckets.get(bucket) || 0) + 1);
      });
      const qsoBuckets = new Map();
      analysis.allTimes.forEach((ts) => {
        const bucket = Math.floor(ts / bucketMs);
        qsoBuckets.set(bucket, (qsoBuckets.get(bucket) || 0) + 1);
      });
      const entries = Array.from(spotBuckets.entries()).map(([bucket, count]) => ({
        bucket,
        spots: count,
        qsos: qsoBuckets.get(bucket) || 0
      })).filter((e) => e.spots >= 5);
      if (!entries.length) return '<p>No pileup windows with at least 5 spots.</p>';
      entries.sort((a, b) => b.spots - a.spots || b.qsos - a.qsos);
      const rows = entries.slice(0, 20).map((e, idx) => {
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        const startTs = e.bucket * bucketMs;
        return `
          <tr class="${cls}">
            <td>${escapeHtml(formatDateSh6(startTs))}</td>
            <td>${formatNumberSh6(e.spots)}</td>
            <td>${formatNumberSh6(e.qsos)}</td>
          </tr>
        `;
      }).join('');
      return `
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Window start (UTC)</th><th>Spots</th><th>QSOs</th></tr>
          ${rows}
        </table>
      `;
    };
    const renderFrequencyAgilityTable = (spots, analysis) => {
      if (!spots || !spots.length) return '<p>No data.</p>';
      const moved = { count: 0, rateSum: 0, deltas: [] };
      const stayed = { count: 0, rateSum: 0, deltas: [] };
      const windowMs = 10 * 60000;
      spots.forEach((s) => {
        const band = s.band || 'unknown';
        const list = analysis.qsoRecordsByBand.get(band) || [];
        const times = analysis.qsoTimesByBand.get(band) || [];
        if (list.length < 2) return;
        const before = findBeforeRecord(list, s.ts);
        const after = findAfterRecord(list, s.ts);
        if (!before || !after) return;
        if (!Number.isFinite(before.freq) || !Number.isFinite(after.freq)) return;
        const deltaKhz = Math.abs(after.freq - before.freq) * 1000;
        const rateAfter = countInRange(times, s.ts, s.ts + windowMs);
        const bucket = deltaKhz >= 1 ? moved : stayed;
        bucket.count += 1;
        bucket.rateSum += rateAfter;
        bucket.deltas.push(deltaKhz);
      });
      if (!moved.count && !stayed.count) return '<p>No frequency-change samples.</p>';
      const rows = [
        { label: 'Moved ≥ 1 kHz', data: moved },
        { label: 'Stayed < 1 kHz', data: stayed }
      ].map((e, idx) => {
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        const avgRate = e.data.count ? e.data.rateSum / e.data.count : 0;
        const median = medianValue(e.data.deltas);
        return `
          <tr class="${cls}">
            <td class="tl">${escapeHtml(e.label)}</td>
            <td>${formatNumberSh6(e.data.count)}</td>
            <td>${avgRate.toFixed(2)}</td>
            <td>${median != null ? median.toFixed(1) : 'N/A'}</td>
          </tr>
        `;
      }).join('');
      return `
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Group</th><th>Spots</th><th>Avg 10m rate after</th><th>Median Δ kHz</th></tr>
          ${rows}
        </table>
      `;
    };
    const buildTenMinuteSeries = (derived, bandSet) => {
      if (!bandSet || !bandSet.size) {
        return (derived?.tenMinuteSeries || []).map((p) => ({ ts: p.bucket * 600000, qsos: p.qsos }));
      }
      const map = new Map();
      (state.qsoData?.qsos || []).forEach((q) => {
        if (!Number.isFinite(q.ts)) return;
        const band = normalizeBandToken(q.band || '') || 'unknown';
        if (!bandSet.has(band)) return;
        const bucket = Math.floor(q.ts / (60000 * 10));
        map.set(bucket, (map.get(bucket) || 0) + 1);
      });
      return Array.from(map.entries()).sort((a, b) => a[0] - b[0]).map(([bucket, qsos]) => ({ ts: bucket * 600000, qsos }));
    };
    const renderSpotRateTimeline = (derived, spots) => {
      const filterSet = new Set(spotsState.bandFilter || []);
      const series = buildTenMinuteSeries(derived, filterSet);
      if (!series.length) return '<p>No QSO rate data.</p>';
      const min = Math.min(...series.map((s) => s.ts));
      const max = Math.max(...series.map((s) => s.ts));
      const maxRate = Math.max(...series.map((s) => s.qsos), 1);
      const width = 900;
      const height = 320;
      const margin = { left: 70, right: 20, top: 20, bottom: 55 };
      const plotW = width - margin.left - margin.right;
      const plotH = height - margin.top - margin.bottom;
      const xScale = (ts) => margin.left + ((ts - min) / (max - min)) * plotW;
      const yScale = (v) => margin.top + (1 - (v / maxRate)) * plotH;
      let prevTs = null;
      const line = series.map((s, idx) => {
        const x = xScale(s.ts);
        const y = yScale(s.qsos);
        const jump = prevTs != null && (s.ts - prevTs) > 600000;
        const cmd = idx === 0 || jump ? 'M' : 'L';
        prevTs = s.ts;
        return `${cmd} ${x} ${y}`;
      }).join(' ');
      const xTicks = 5;
      const xGrid = [];
      const xLabels = [];
      for (let i = 0; i < xTicks; i += 1) {
        const t = min + ((max - min) * i) / (xTicks - 1);
        const x = xScale(t);
        xGrid.push(`<line class="freq-grid" x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}"></line>`);
        const label = formatDateSh6(t);
        xLabels.push(`<text class="freq-axis-text" x="${x}" y="${height - margin.bottom + 18}" transform="rotate(-35 ${x} ${height - margin.bottom + 18})" text-anchor="end">${escapeHtml(label)}</text>`);
      }
      const yTicks = 5;
      const yGrid = [];
      const yLabels = [];
      for (let i = 0; i < yTicks; i += 1) {
        const v = (maxRate * i) / (yTicks - 1);
        const y = yScale(v);
        yGrid.push(`<line class="freq-grid" x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}"></line>`);
        yLabels.push(`<text class="freq-axis-text" x="${margin.left - 8}" y="${y + 4}" text-anchor="end">${escapeHtml(v.toFixed(0))}</text>`);
      }
      const spotList = spots || [];
      const maxMarkers = 500;
      let spotLines = '';
      let spotAgg = '';
      if (spotList.length <= maxMarkers) {
        spotLines = spotList.map((s) => {
          const x = xScale(s.ts);
          return `<line class="spot-line" x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}"></line>`;
        }).join('');
      } else {
        const bucketCounts = new Map();
        spotList.forEach((s) => {
          if (!Number.isFinite(s.ts)) return;
          const bucket = Math.floor(s.ts / 600000) * 600000;
          bucketCounts.set(bucket, (bucketCounts.get(bucket) || 0) + 1);
        });
        const maxBucket = Math.max(...Array.from(bucketCounts.values()), 1);
        const aggHeight = plotH * 0.25;
        spotAgg = Array.from(bucketCounts.entries()).map(([bucket, count]) => {
          const x = xScale(bucket);
          const h = (count / maxBucket) * aggHeight;
          return `<rect class="spot-agg" x="${x - 1}" y="${height - margin.bottom - h}" width="2" height="${h}"></rect>`;
        }).join('');
      }
      return `
        <div class="freq-scatter-wrap">
          <svg class="freq-scatter" viewBox="0 0 ${width} ${height}" role="img" aria-label="10 minute rate timeline">
            <rect class="freq-plot-bg" x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}"></rect>
            ${xGrid.join('')}
            ${yGrid.join('')}
            ${spotLines}
            ${spotAgg}
            <path class="spot-rate-line" d="${line}"></path>
            <line class="freq-axis" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}"></line>
            <line class="freq-axis" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"></line>
            ${xLabels.join('')}
            ${yLabels.join('')}
            <text class="freq-axis-title" x="${width / 2}" y="${height - 8}" text-anchor="middle">Time (UTC)</text>
            <text class="freq-axis-title" x="14" y="${height / 2}" transform="rotate(-90 14 ${height / 2})" text-anchor="middle">10 min QSO rate</text>
          </svg>
        </div>
      `;
    };
    const renderHeatmap = (heatmapData) => {
      if (!heatmapData || !heatmapData.length) return '<p>No heatmap data.</p>';
      const bands = sortBands(heatmapData.map((h) => h.band));
      const maxVal = Math.max(...heatmapData.flatMap((h) => h.hours || []), 1);
      const header = Array.from({ length: 24 }, (_, h) => `<th>${String(h).padStart(2, '0')}</th>`).join('');
      const rows = bands.map((band, idx) => {
        const entry = heatmapData.find((h) => h.band === band);
        const hours = entry ? entry.hours : Array.from({ length: 24 }, () => 0);
        const cells = hours.map((value, hour) => {
          const count = Number(value) || 0;
          const active = drillBand === band && Number(drillHour) === hour;
          const intensity = count ? Math.min(0.85, 0.15 + (count / maxVal) * 0.7) : 0;
          const bg = count ? `background: rgba(30, 91, 214, ${intensity}); color: #fff;` : '';
          if (!count) return `<td style="${bg}"></td>`;
          return `
            <td style="${bg}">
              <button type="button" class="spots-heat-cell${active ? ' active' : ''}" data-slot="${slotAttr}" data-source="${sourceAttr}" data-band="${escapeAttr(band)}" data-hour="${hour}" title="Show ${formatNumberSh6(count)} spots on ${escapeAttr(formatBandLabel(band || ''))} at ${String(hour).padStart(2, '0')}Z">${formatNumberSh6(count)}</button>
            </td>
          `;
        }).join('');
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        return `<tr class="${cls}"><td class="${bandClass(band)}"><b>${escapeHtml(formatBandLabel(band))}</b></td>${cells}</tr>`;
      }).join('');
      return `
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Band</th>${header}</tr>
          ${rows}
        </table>
      `;
    };

    const renderSpotsCoachCards = (statsData, analysis) => {
      if (!statsData || !analysis) return '';

      const bestWindows = buildBestBandHourWindows(statsData.ofUsSpots || [], 3);
      const bestWindowRows = bestWindows.length
        ? bestWindows.map((entry) => {
          const hour = String(entry.hour).padStart(2, '0');
          const conv = Number.isFinite(entry.conv) ? `${entry.conv.toFixed(1)}%` : 'N/A';
          return `<li><b>${escapeHtml(formatBandLabel(entry.band || ''))} ${hour}:00Z</b> · ${formatNumberSh6(entry.matched)}/${formatNumberSh6(entry.spots)} matched (${conv})</li>`;
        }).join('')
        : '<li>No strong hour/band window found yet. Try broader band filters.</li>';
      const confidenceSpots = bestWindows.reduce((sum, entry) => sum + (Number(entry.spots) || 0), 0);
      const confidenceLabel = estimateWindowConfidence(confidenceSpots);
      const confidenceText = confidenceLabel === 'high'
        ? 'high confidence'
        : (confidenceLabel === 'medium' ? 'medium confidence' : 'low confidence');
      const windowSeverity = confidenceLabel === 'low'
        ? 'high'
        : (confidenceLabel === 'medium' ? 'medium' : 'opportunity');

      const reliableSpotters = computeSpotterReliabilityEntries(statsData.ofUsSpots || [], 4).slice(0, 3);
      const reliableRows = reliableSpotters.length
        ? reliableSpotters.map((entry) => `<li><b>${escapeHtml(entry.spotter || '')}</b> · ${entry.pct.toFixed(1)}% conversion (${formatNumberSh6(entry.matched)}/${formatNumberSh6(entry.spots)})</li>`).join('')
        : '<li>No spotter with enough sample size yet (need at least 4 spots).</li>';
      const topReliabilityPct = Number(reliableSpotters?.[0]?.pct || 0);
      const reliabilitySeverity = !reliableSpotters.length
        ? 'medium'
        : (topReliabilityPct < 35 ? 'medium' : 'opportunity');

      const missedMults = buildMissedMultEntries(statsData.byUsSpots || [], analysis);
      const topMissedCountries = Array.from(missedMults.reduce((map, entry) => {
        const key = String(entry.country || '').trim();
        if (!key) return map;
        map.set(key, (map.get(key) || 0) + 1);
        return map;
      }, new Map()).entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      const missedRows = topMissedCountries.length
        ? topMissedCountries.map(([country, count]) => `<li><b>${escapeHtml(country)}</b> · ${formatNumberSh6(count)} potential mult misses</li>`).join('')
        : '<li>No clear missed multiplier concentration detected.</li>';
      const missedTotalText = missedMults.length ? formatNumberSh6(missedMults.length) : '0';
      const missedSeverity = missedMults.length >= 25
        ? 'high'
        : (missedMults.length >= 10 ? 'medium' : (missedMults.length > 0 ? 'opportunity' : 'info'));

      return `
        <div class="spots-coach-grid">
          <article class="spots-coach-card">
            <div class="spots-coach-head">
              <h4>Best hour/band windows</h4>
              <span class="coach-severity-badge coach-severity-${windowSeverity}">${coachSeverityLabel(windowSeverity)}</span>
            </div>
            <p class="spots-coach-note">Top match windows from your current band filter (${confidenceText}; ${formatNumberSh6(confidenceSpots)} spots sampled).</p>
            <ul class="spots-coach-list">${bestWindowRows}</ul>
            <button type="button" class="spots-coach-action" data-source="${sourceAttr}" data-slot="${slotAttr}" data-target="${escapeAttr(sectionIds.bandHour)}">Jump to band/hour table</button>
          </article>
          <article class="spots-coach-card">
            <div class="spots-coach-head">
              <h4>Spotter reliability leaders</h4>
              <span class="coach-severity-badge coach-severity-${reliabilitySeverity}">${coachSeverityLabel(reliabilitySeverity)}</span>
            </div>
            <p class="spots-coach-note">Spotters with the best QSO conversion for your station.</p>
            <ul class="spots-coach-list">${reliableRows}</ul>
            <button type="button" class="spots-coach-action" data-source="${sourceAttr}" data-slot="${slotAttr}" data-target="${escapeAttr(sectionIds.topSpotters)}">Jump to top spotters</button>
          </article>
          <article class="spots-coach-card">
            <div class="spots-coach-head">
              <h4>Missed multiplier opportunities</h4>
              <span class="coach-severity-badge coach-severity-${missedSeverity}">${coachSeverityLabel(missedSeverity)}</span>
            </div>
            <p class="spots-coach-note">Raw candidates: ${missedTotalText}. Focus first on these repeat countries.</p>
            <ul class="spots-coach-list">${missedRows}</ul>
            <button type="button" class="spots-coach-action" data-source="${sourceAttr}" data-slot="${slotAttr}" data-target="${escapeAttr(sectionIds.missedMults)}">Jump to missed mult table</button>
          </article>
        </div>
      `;
    };

    const resolveSpotterGeo = (spotterCall) => {
      const key = normalizeCall(spotterCall || '');
      const prefix = key ? (lookupPrefix(key) || lookupPrefix(baseCall(key))) : null;
      const continent = normalizeContinent(prefix?.continent || '') || 'N/A';
      const cqZone = Number.isFinite(prefix?.cqZone) ? String(prefix.cqZone) : 'N/A';
      const ituZone = Number.isFinite(prefix?.ituZone) ? String(prefix.ituZone) : 'N/A';
      return { continent, cqZone, ituZone };
    };

    const renderDrillFilterRow = (label, type, counts, selectedValue) => {
      const entries = Array.from(counts.entries()).sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        if (type === 'continent') {
          const order = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC', 'N/A'];
          const aIdx = order.includes(a[0]) ? order.indexOf(a[0]) : 999;
          const bIdx = order.includes(b[0]) ? order.indexOf(b[0]) : 999;
          return aIdx - bIdx;
        }
        const aNum = Number(a[0]);
        const bNum = Number(b[0]);
        if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum;
        return String(a[0]).localeCompare(String(b[0]));
      });
      const filterTypeClass = `type-${type}`;
      const allLabel = type === 'continent' ? 'All continents' : (type === 'cq' ? 'All CQ zones' : 'All ITU zones');
      const buttons = entries.map(([value, count]) => {
        const active = selectedValue === value;
        const valueAttr = escapeAttr(String(value));
        const valueLabel = value === 'N/A' ? 'N/A' : escapeHtml(String(value));
        return `<button type="button" class="spots-drill-filter-btn ${filterTypeClass}${active ? ' active' : ''}" data-slot="${slotAttr}" data-source="${sourceAttr}" data-type="${type}" data-value="${valueAttr}" aria-pressed="${active ? 'true' : 'false'}">${valueLabel} (${formatNumberSh6(count)})</button>`;
      }).join('');
      return `
        <div class="spots-drill-filter-row">
          <span class="spots-drill-filter-label">${escapeHtml(label)}</span>
          <button type="button" class="spots-drill-filter-btn spots-drill-filter-all ${filterTypeClass}${selectedValue ? '' : ' active'}" data-slot="${slotAttr}" data-source="${sourceAttr}" data-type="${type}" data-value="" aria-pressed="${selectedValue ? 'false' : 'true'}">${allLabel}</button>
          ${buttons}
        </div>
      `;
    };

    const renderSpotBucketDetail = (spots) => {
      if (!spots || !spots.length) return '';
      if (!drillBand || !Number.isFinite(drillHour)) {
        return '<div class="spots-drill-panel"><p class="cqapi-muted">Click a value in the band/hour table to inspect actual spots for that bucket.</p></div>';
      }
      const targetHour = Math.max(0, Math.min(23, Math.round(drillHour)));
      const rows = (spots || [])
        .filter((s) => (s.band || 'unknown') === drillBand)
        .filter((s) => Number.isFinite(s.ts) && new Date(s.ts).getUTCHours() === targetHour)
        .map((s) => {
          const geo = resolveSpotterGeo(s.spotter || '');
          return {
            ...s,
            continent: geo.continent,
            cqZone: geo.cqZone,
            ituZone: geo.ituZone
          };
        });
      if (!rows.length) {
        return `
          <div class="spots-drill-panel">
            <div class="spots-drill-head">
              <b>Bucket detail</b>
              <button type="button" class="button spots-drill-clear" data-slot="${slotAttr}" data-source="${sourceAttr}">Clear selection</button>
            </div>
            <p class="cqapi-muted">No spots found for ${escapeHtml(formatBandLabel(drillBand))} at ${String(targetHour).padStart(2, '0')}:00Z.</p>
          </div>
        `;
      }
      const continentCounts = new Map();
      const cqCounts = new Map();
      const ituCounts = new Map();
      rows.forEach((row) => {
        continentCounts.set(row.continent, (continentCounts.get(row.continent) || 0) + 1);
        cqCounts.set(row.cqZone, (cqCounts.get(row.cqZone) || 0) + 1);
        ituCounts.set(row.ituZone, (ituCounts.get(row.ituZone) || 0) + 1);
      });
      const filtered = rows.filter((row) => {
        if (drillContinent && row.continent !== drillContinent) return false;
        if (drillCqZone && row.cqZone !== drillCqZone) return false;
        if (drillItuZone && row.ituZone !== drillItuZone) return false;
        return true;
      });
      if (!filtered.length) {
        return `
          <div class="spots-drill-panel">
            <div class="spots-drill-head">
              <b>Bucket detail: ${escapeHtml(formatBandLabel(drillBand))} ${String(targetHour).padStart(2, '0')}:00Z</b>
              <button type="button" class="button spots-drill-clear" data-slot="${slotAttr}" data-source="${sourceAttr}">Clear selection</button>
            </div>
            ${renderDrillFilterRow('Continent', 'continent', continentCounts, drillContinent)}
            ${renderDrillFilterRow('CQ zone', 'cq', cqCounts, drillCqZone)}
            ${renderDrillFilterRow('ITU zone', 'itu', ituCounts, drillItuZone)}
            <p class="cqapi-muted">No spots match the selected continent/zone filters in this bucket.</p>
          </div>
        `;
      }
      const matchedCount = filtered.filter((row) => row.matched).length;
      const sorted = filtered.slice().sort((a, b) => a.ts - b.ts);
      const clipped = sorted.slice(0, SPOT_TABLE_LIMIT);
      const truncatedList = sorted.length > SPOT_TABLE_LIMIT;
      const tableRows = clipped.map((row, idx) => {
        const cls = idx % 2 === 0 ? 'td1' : 'td0';
        const delta = Number.isFinite(row.delta) ? row.delta.toFixed(1) : 'N/A';
        return `
          <tr class="${cls}">
            <td>${escapeHtml(formatDateSh6(row.ts))}</td>
            <td class="${bandClass(row.band || '')}">${escapeHtml(formatBandLabel(row.band || ''))}</td>
            <td>${escapeHtml(String(row.freqKHz || ''))}</td>
            <td>${escapeHtml(row.spotter || '')}</td>
            <td>${escapeHtml(row.continent)}</td>
            <td>${escapeHtml(row.cqZone)}</td>
            <td>${escapeHtml(row.ituZone)}</td>
            <td>${row.matched ? 'Yes' : 'No'}</td>
            <td>${delta}</td>
            <td class="tl">${escapeHtml(row.comment || '')}</td>
          </tr>
        `;
      }).join('');
      return `
        <div class="spots-drill-panel">
          <div class="spots-drill-head">
            <b>Bucket detail: ${escapeHtml(formatBandLabel(drillBand))} ${String(targetHour).padStart(2, '0')}:00Z</b>
            <button type="button" class="button spots-drill-clear" data-slot="${slotAttr}" data-source="${sourceAttr}">Clear selection</button>
          </div>
          <div class="spots-drill-stats">
            <span><b>Total spots</b>: ${formatNumberSh6(rows.length)}</span>
            <span><b>After filters</b>: ${formatNumberSh6(filtered.length)}</span>
            <span><b>Matched</b>: ${formatNumberSh6(matchedCount)}</span>
          </div>
          ${renderDrillFilterRow('Continent', 'continent', continentCounts, drillContinent)}
          ${renderDrillFilterRow('CQ zone', 'cq', cqCounts, drillCqZone)}
          ${renderDrillFilterRow('ITU zone', 'itu', ituCounts, drillItuZone)}
          ${truncatedList ? `<div class="export-actions export-note">Showing first ${formatNumberSh6(SPOT_TABLE_LIMIT)} of ${formatNumberSh6(sorted.length)} rows.</div>` : ''}
          <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
            <tr class="thc"><th>Time (UTC)</th><th>Band</th><th>Freq</th><th>Spotter</th><th>Cont</th><th>CQ</th><th>ITU</th><th>QSO</th><th>Delta m</th><th>Comment</th></tr>
            ${tableRows}
          </table>
        </div>
      `;
    };
    const analysisContext = stats ? buildAnalysisContext() : null;
    const spotsCoachCards = stats && analysisContext ? renderSpotsCoachCards(stats, analysisContext) : '';
    const spotsIntro = renderReportIntroCard(
      `${title} analysis`,
      intro,
      [
        `Call ${state.derived.contestMeta?.stationCallsign || 'N/A'}`,
        `Window ±${windowMinutes}m`,
        `${formatDateSh6(minTs)} to ${formatDateSh6(maxTs)}`
      ]
    );

    return `
      <div class="mtc export-panel spots-panel" data-slot="${slotAttr}">
        <div class="gradient">&nbsp;${escapeHtml(title)}</div>
        ${spotsIntro}
        <div class="export-actions">
          <span><b>Callsign</b>: ${call} (exact match)</span>
        </div>
        <div class="export-actions">
          <span><b>Time window</b>: ${start} → ${end} (±${windowMinutes} minutes, same frequency band)</span>
        </div>
        ${extraNote ? `<div class="export-actions export-note">${escapeHtml(extraNote)}</div>` : ''}
        ${renderAnalysisStepHeading(1, 'Filters and data load', 'Tune match window/bands, then refresh spot files for this slot.')}
        ${hideControls ? '' : `
        <div class="spots-controls">
          <label for="spotsWindow-${slotAttr}">Match window (minutes): <span class="spots-window-value" data-slot="${slotAttr}" data-source="${sourceAttr}">${windowMinutes}</span></label>
          <input id="spotsWindow-${slotAttr}" class="spots-window" data-slot="${slotAttr}" data-source="${sourceAttr}" type="range" min="1" max="60" step="1" value="${windowMinutes}">
        </div>
        <div class="spots-filters">
          <label class="spots-filter">
            <input type="checkbox" class="spots-band-filter" data-slot="${slotAttr}" data-source="${sourceAttr}" data-band="ALL" ${bandFilterSet.size ? '' : 'checked'}>
            <span>All bands</span>
          </label>
          ${bandOptions.map((band) => {
            const label = band === 'unknown' ? 'Unknown' : formatBandLabel(band);
            const checked = bandFilterSet.has(band) ? 'checked' : '';
            const cls = band === 'unknown' ? '' : bandClass(band);
            return `
              <label class="spots-filter ${cls}">
                <input type="checkbox" class="spots-band-filter" data-slot="${slotAttr}" data-source="${sourceAttr}" data-band="${escapeAttr(band)}" ${checked}>
                <span>${escapeHtml(label)}</span>
              </label>
            `;
          }).join('')}
        </div>
        `}
        ${dayPickerHtml}
        <div class="export-actions">
          <span><b>${escapeHtml(fileListLabel)}</b>: ${dayList || 'N/A'}</span>
        </div>
        <div class="export-actions">
          <button type="button" class="button spots-load-btn" data-slot="${slotAttr}" data-source="${sourceAttr}">${escapeHtml(loadLabel)}</button>
          <span>${statusText}</span>
        </div>
        ${truncatedNote ? `<div class="export-actions export-note">${escapeHtml(truncatedNote)}</div>` : ''}
        ${summaryNote ? `<div class="export-actions export-note">${escapeHtml(summaryNote)}</div>` : ''}
        ${errorSummary ? `<div class="export-actions export-note"><b>${escapeHtml(errorLabel)}</b>: ${errorSummary}</div>` : ''}
        ${stats ? `
        ${renderAnalysisStepHeading(2, 'Summary snapshot', 'Validate current conversion quality before deeper analysis.')}
        <div class="export-actions export-note"><b>Spots coach summary</b></div>
        ${spotsCoachCards}

        <div class="export-actions export-note">
          <span><b>Total spots scanned</b>: ${formatNumberSh6(stats.total)}</span>
        </div>
        <div class="export-actions export-note">
          <span><b>Spots of you</b>: ${formatNumberSh6(totalOfUs)} (matched to QSOs: ${formatNumberSh6(stats.ofUsMatched)})</span>
        </div>
        <div class="export-actions export-note">
          <span><b>Spots by you</b>: ${formatNumberSh6(totalByUs)} (matched to QSOs: ${formatNumberSh6(stats.byUsMatched)})</span>
        </div>

        ${renderAnalysisStepHeading(3, 'Primary table and drill-down', 'Click band/hour values, then filter detail rows by continent and zones.')}
        <div id="${escapeAttr(sectionIds.bandHour)}" class="export-actions export-note"><b>Spots of you by band/hour</b><span class="spots-click-hint">Click a value to inspect actual spots and filter by Continent, CQ zone, and ITU zone.</span></div>
        ${renderHeatmap(stats.heatmap)}
        ${summaryOnly ? '' : renderSpotBucketDetail(stats.ofUsSpots)}

        ${renderAnalysisStepHeading(4, 'Advanced diagnostics', 'Use timeline and opportunity reports to plan next operating changes.')}

        <div class="export-actions export-note"><b>Spot→Rate timeline (10‑min rate with spot markers)</b></div>
        ${renderSpotRateTimeline(state.derived, stats.ofUsSpots)}

        <div class="export-actions export-note"><b>Conversion by band</b></div>
        ${renderBandConversionTable(stats.bandStats)}

        <div class="export-actions export-note"><b>Response time distribution (minutes)</b></div>
        ${renderResponseHistogram(stats.responseTimes, windowMinutes)}

        <div id="${escapeAttr(sectionIds.topSpotters)}" class="export-actions export-note"><b>Top spotters for you</b></div>
        ${renderSpotterTable(summarizeGroups(stats.ofUsSpots, 'spotter'))}

        <div class="export-actions export-note"><b>Top DX you spotted</b></div>
        ${renderDxTable(summarizeGroups(stats.byUsSpots, 'dxCall'))}

        ${hideRbnExtras ? '' : `
        <div class="export-actions export-note"><b>Unanswered spots (no QSO within ${windowMinutes} minutes)</b></div>
        ${summaryOnly ? '<p>Lists hidden for large datasets.</p>' : renderUnansweredTable((stats.ofUsSpots || []).filter((s) => !s.matched))}
        `}

        ${(() => {
          const analysis = analysisContext;
          if (!analysis) return '';
          const concurrentBands = hasConcurrentBands(state.qsoData?.qsos || []);
          return `
            ${hideRbnExtras ? '' : `
            <div class="export-actions export-note"><b>Unworked-after-spot rate (band/hour)</b></div>
            <div class="export-actions export-note">Out of all spots of you, how many did not turn into a QSO within the match window, grouped by band and hour. Lower is better.</div>
            ${renderUnworkedRateTable(stats.ofUsSpots)}
            `}

            <div class="export-actions export-note"><b>Time-to-first-QSO after spot (band)</b></div>
            <div class="export-actions export-note">How long it usually takes to log a QSO after the first spot in a spot “cluster” on each band. Lower is better.</div>
            ${renderTimeToFirstQsoTable(stats.ofUsSpots, analysis)}

            <div class="export-actions export-note"><b>Spot-to-rate uplift (10 min before vs after)</b></div>
            <div class="export-actions export-note">Compares QSO rate in the 10 minutes before a spot vs the 10 minutes after. Higher uplift and higher % positive are better.</div>
            ${renderSpotUpliftTable(stats.ofUsSpots, analysis)}

            ${hideRbnExtras ? '' : `
            <div class="export-actions export-note"><b>DX spot conversion funnel</b></div>
            <div class="export-actions export-note">Of the spots you sent, how many turned into a QSO, a new call, a new band for that call, or a new country. Higher % is better.</div>
            ${renderSpottingFunnelTable(stats.byUsSpots, analysis)}
            `}

            ${concurrentBands ? '' : `
            <div class="export-actions export-note"><b>Band change efficiency</b></div>
            <div class="export-actions export-note">When you switch into a band, did your rate go up in the next 10 minutes? Higher % improved and higher avg uplift are better.</div>
            ${renderBandChangeEfficiencyTable(analysis)}
            `}

            <div class="export-actions export-note"><b>Peak spotter reliability</b></div>
            <div class="export-actions export-note">Which spotters give you the most “actionable” spots (they turn into QSOs). Higher % is better.</div>
            ${renderSpotterReliabilityTable(stats.ofUsSpots)}

            <div id="${escapeAttr(sectionIds.missedMults)}" class="export-actions export-note"><b>Missed mult opportunities</b></div>
            <div class="export-actions export-note">Spots you sent where you never worked the DX and it looked like a new country at that time. Lower is better.</div>
            ${renderMissedMultTable(stats.byUsSpots, analysis)}

            <div class="export-actions export-note"><b>Opening/closing windows by day</b></div>
            <div class="export-actions export-note">First and last time you were spotted on each band each day. Longer span means a longer window of opportunity (informational).</div>
            ${renderOpenCloseTable(stats.ofUsSpots)}

            <div class="export-actions export-note"><b>Pileup window profiling</b></div>
            <div class="export-actions export-note">10‑minute windows with lots of spots, plus how many QSOs you made in those windows. Higher spots and QSOs indicate stronger pileups.</div>
            ${renderPileupWindowTable(stats.ofUsSpots, analysis)}

            <div class="export-actions export-note"><b>Frequency agility view</b></div>
            <div class="export-actions export-note">Compares QSOs after spots when you moved frequency versus stayed put. Higher avg rate after is better; use this to decide whether moving helps.</div>
            ${renderFrequencyAgilityTable(stats.ofUsSpots, analysis)}
          `;
        })()}

        <div class="export-actions export-note"><b>All spots of you</b></div>
        ${summaryOnly ? '<p>Lists hidden for large datasets.</p>' : renderAllSpotsTable(stats.ofUsSpots, true)}

        <div class="export-actions export-note"><b>All spots by you</b></div>
        ${summaryOnly ? '<p>Lists hidden for large datasets.</p>' : renderAllSpotsTable(stats.byUsSpots, false)}
        ` : ''}
      </div>
    `;
  }

  function renderRbnSpots() {
    if (!state.qsoData || !state.derived) {
      return renderStateCard({
        type: 'info',
        title: 'RBN spots unavailable',
        message: 'Load a log to enable RBN spots analysis for this report.'
      });
    }
    const minTs = state.derived.timeRange?.minTs;
    const maxTs = state.derived.timeRange?.maxTs;
    const slotId = state.renderSlotId || 'A';
    const allDays = buildRbnDayList(minTs, maxTs);
    const selectedDays = selectRbnDaysForSlot(state, minTs, maxTs);
    const dayList = selectedDays.map((d) => formatRbnDayLabel(d)).join(', ');
    const showPicker = allDays.length > 2;
    const dayPickerHtml = showPicker ? `
      <div class="export-actions export-note">
        This log spans ${formatNumberSh6(allDays.length)} UTC dates. RBN queries are limited to 2 dates at a time. Choose the dates below.
      </div>
      <div class="export-actions">
        <label for="rbnDayA">RBN date 1</label>
        <select id="rbnDayA" class="rbn-day-select" data-source="rbn" data-slot="${escapeAttr(slotId)}" data-index="0">
          ${allDays.map((d) => `<option value="${escapeAttr(d)}" ${selectedDays[0] === d ? 'selected' : ''}>${escapeHtml(formatRbnDayLabel(d))}</option>`).join('')}
        </select>
        <label for="rbnDayB" style="margin-left:12px;">RBN date 2</label>
        <select id="rbnDayB" class="rbn-day-select" data-source="rbn" data-slot="${escapeAttr(slotId)}" data-index="1">
          ${allDays.map((d) => `<option value="${escapeAttr(d)}" ${selectedDays[1] === d ? 'selected' : ''}>${escapeHtml(formatRbnDayLabel(d))}</option>`).join('')}
        </select>
      </div>
    ` : '';
    return renderSpots({
      source: 'rbn',
      spotsState: getRbnState(),
      title: 'RBN spots',
      intro: 'Analyze Reverse Beacon Network (RBN) spots for your callsign and skimmer activity.',
      loadLabel: 'Load RBN spots',
      loadingLabel: 'Loading RBN spots...',
      readyLabel: 'RBN spots loaded.',
      fileListLabel: 'RBN files',
      errorLabel: 'RBN day errors',
      dayList,
      note: 'RBN spotters can include a “-#” suffix (skimmer ID). These are grouped by the base callsign.',
      dayPickerHtml
    });
  }

  function resolveSpotterContinent(spotterCall) {
    const key = normalizeSpotterBase(spotterCall || '');
    const prefix = key ? (lookupPrefix(key) || lookupPrefix(baseCall(key))) : null;
    return normalizeContinent(prefix?.continent || '') || 'N/A';
  }

  const rbnCompareSignalIndexCache = new Map(); // slotId -> { dataKey, bySpotter: Map(spotter -> entry) }
  const rbnCompareSignalIndexJobs = new Map(); // slotId -> { dataKey, slotRef, spots, i, bySpotter }
  const rbnCompareSignalRankingCache = new Map(); // `${slotId}|${bandKey||'ALL'}` -> { dataKey, byContinent }
  const rbnCompareSignalCanvasJobs = new WeakMap(); // canvas -> { token, raf }
  let rbnCompareSignalDrawRaf = 0;
  let rbnCompareSignalIntersectionObserver = null;

  function rbnCompareSlotDataKey(slot) {
    const r = slot?.rbnState;
    if (!r || r.status !== 'ready' || !r.raw || !Array.isArray(r.raw.ofUsSpots)) return '';
    const days = Array.isArray(r.selectedDays) ? r.selectedDays.join(',') : '';
    const count = Number.isFinite(r.totalOfUs) ? r.totalOfUs : r.raw.ofUsSpots.length;
    return `${String(r.lastCall || '')}|${String(r.lastWindowKey || '')}|${days}|${count}`;
  }

  function sampleFlatStride(data, capPoints) {
    const arr = Array.isArray(data) ? data : [];
    const total = Math.floor(arr.length / 2);
    const cap = Math.max(0, Math.floor(Number(capPoints) || 0));
    if (!cap || total <= cap) return arr;
    const stride = Math.max(1, Math.ceil(total / cap));
    const out = [];
    for (let i = 0; i < total; i += stride) {
      const idx = i * 2;
      out.push(arr[idx], arr[idx + 1]);
    }
    return out;
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
      const c = Math.max(0, Math.floor(count || 0));
      const raw = Math.floor((cap * c) / Math.max(1, safeTotal));
      return [band, Math.min(c, Math.max(minEach, raw))];
    });
    let sum = out.reduce((acc, [, c]) => acc + c, 0);
    if (sum > cap) {
      // Trim from largest allocations first.
      const order = out.map(([, c], idx) => ({ idx, c })).sort((a, b) => b.c - a.c);
      for (const it of order) {
        if (sum <= cap) break;
        const current = out[it.idx][1];
        const next = Math.max(minEach, current - (sum - cap));
        out[it.idx][1] = next;
        sum -= (current - next);
      }
    } else if (sum < cap) {
      // Distribute remainder to largest bands where available.
      const need = cap - sum;
      const byAvail = out.map(([band, c], idx) => {
        const original = Math.max(0, Math.floor(entries[idx]?.[1] || 0));
        return { idx, band, avail: Math.max(0, original - c) };
      }).sort((a, b) => b.avail - a.avail);
      let left = need;
      for (const it of byAvail) {
        if (!left) break;
        if (it.avail <= 0) continue;
        const add = Math.min(it.avail, left);
        out[it.idx][1] += add;
        left -= add;
      }
    }
    return out;
  }

  function getRbnCompareIndexCached(slotId, slot) {
    const key = rbnCompareSlotDataKey(slot);
    if (!key) return null;
    const cached = rbnCompareSignalIndexCache.get(slotId);
    if (cached && cached.dataKey === key) return cached;
    return null;
  }

  function buildRbnCompareIndexSync(slotId, slot) {
    const dataKey = rbnCompareSlotDataKey(slot);
    if (!dataKey) return null;
    const cached = rbnCompareSignalIndexCache.get(slotId);
    if (cached && cached.dataKey === dataKey) return cached;
    const list = slot?.rbnState?.raw?.ofUsSpots || [];
    const bySpotter = new Map();
    (list || []).forEach((s) => {
      if (!s || !s.spotter) return;
      if (!Number.isFinite(s.ts) || !Number.isFinite(s.snr)) return;
      const spotter = normalizeSpotterBase(s.spotter);
      if (!spotter) return;
      const band = normalizeBandToken(s.band || '') || '';
      let entry = bySpotter.get(spotter);
      if (!entry) {
        entry = {
          spotter,
          continent: resolveSpotterContinent(spotter),
          totalCount: 0,
          bandCounts: new Map(),
          byBand: new Map(), // band -> flat [ts,snr,...]
          minSnr: null,
          maxSnr: null
        };
        bySpotter.set(spotter, entry);
      }
      entry.totalCount += 1;
      entry.bandCounts.set(band, (entry.bandCounts.get(band) || 0) + 1);
      if (!entry.byBand.has(band)) entry.byBand.set(band, []);
      entry.byBand.get(band).push(s.ts, s.snr);
      entry.minSnr = entry.minSnr == null ? s.snr : Math.min(entry.minSnr, s.snr);
      entry.maxSnr = entry.maxSnr == null ? s.snr : Math.max(entry.maxSnr, s.snr);
    });
    const built = { dataKey, bySpotter };
    rbnCompareSignalIndexCache.set(slotId, built);
    // Rankings depend on this index; clear any stale entries for this slot.
    Array.from(rbnCompareSignalRankingCache.keys()).forEach((k) => {
      if (k.startsWith(`${slotId}|`)) rbnCompareSignalRankingCache.delete(k);
    });
    return built;
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
      const chunk = 6000;
      const end = Math.min(job.spots.length, job.i + chunk);
      for (; job.i < end; job.i += 1) {
        const s = job.spots[job.i];
        if (!s || !s.spotter) continue;
        if (!Number.isFinite(s.ts) || !Number.isFinite(s.snr)) continue;
        const spotter = normalizeSpotterBase(s.spotter);
        if (!spotter) continue;
        const band = normalizeBandToken(s.band || '') || '';
        let entry = job.bySpotter.get(spotter);
        if (!entry) {
          entry = {
            spotter,
            continent: resolveSpotterContinent(spotter),
            totalCount: 0,
            bandCounts: new Map(),
            byBand: new Map(),
            minSnr: null,
            maxSnr: null
          };
          job.bySpotter.set(spotter, entry);
        }
        entry.totalCount += 1;
        entry.bandCounts.set(band, (entry.bandCounts.get(band) || 0) + 1);
        if (!entry.byBand.has(band)) entry.byBand.set(band, []);
        entry.byBand.get(band).push(s.ts, s.snr);
        entry.minSnr = entry.minSnr == null ? s.snr : Math.min(entry.minSnr, s.snr);
        entry.maxSnr = entry.maxSnr == null ? s.snr : Math.max(entry.maxSnr, s.snr);
      }
      if (job.i >= job.spots.length) {
        rbnCompareSignalIndexJobs.delete(slotId);
        rbnCompareSignalIndexCache.set(slotId, { dataKey: job.dataKey, bySpotter: job.bySpotter });
        Array.from(rbnCompareSignalRankingCache.keys()).forEach((k) => {
          if (k.startsWith(`${slotId}|`)) rbnCompareSignalRankingCache.delete(k);
        });
        scheduleRbnCompareSignalDraw();
        populateRbnCompareSignalSpotterSelects();
        return;
      }
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(step, { timeout: 200 });
      } else {
        setTimeout(step, 0);
      }
    };
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(step, { timeout: 200 });
    } else {
      setTimeout(step, 0);
    }
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
    const normBand = normalizeBandToken(bandKey || '');
    index.bySpotter.forEach((entry) => {
      const count = normBand ? (entry.bandCounts.get(normBand) || 0) : (entry.totalCount || 0);
      if (!count) return;
      const cont = entry.continent || 'N/A';
      if (!byContinent.has(cont)) byContinent.set(cont, []);
      byContinent.get(cont).push({ spotter: entry.spotter, count });
    });
    byContinent.forEach((list, cont) => {
      list.sort((a, b) => b.count - a.count || a.spotter.localeCompare(b.spotter));
      byContinent.set(cont, list);
    });
    const key = `${slotId}|${normBand || 'ALL'}`;
    const built = { dataKey, byContinent };
    rbnCompareSignalRankingCache.set(key, built);
    return built;
  }

  function scheduleRbnCompareSignalDraw() {
    if (rbnCompareSignalDrawRaf) return;
    rbnCompareSignalDrawRaf = requestAnimationFrame(() => {
      rbnCompareSignalDrawRaf = 0;
      if (reports[state.activeIndex]?.id === 'rbn_compare_signal') {
        drawRbnCompareSignalCharts();
      }
    });
  }

  function bandColorForChart(band) {
    const key = normalizeBandToken(band || '');
    // More saturated colors for dense scatter plots (better contrast with alpha).
    if (key === '160M') return '#334155'; // slate
    if (key === '80M') return '#2563eb'; // blue
    if (key === '40M') return '#16a34a'; // green
    if (key === '20M') return '#f59e0b'; // amber
    if (key === '15M') return '#dc2626'; // red
    if (key === '10M') return '#7c3aed'; // violet
    return '#0f172a';
  }

  function slotMarkerShape(slotId) {
    const id = String(slotId || 'A').toUpperCase();
    if (id === 'B') return 'triangle';
    if (id === 'C') return 'square';
    if (id === 'D') return 'diamond';
    return 'circle';
  }

  function formatUtcTick(ts) {
    if (!Number.isFinite(ts)) return '';
    const d = new Date(ts);
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const hh = String(d.getUTCHours()).padStart(2, '0');
    return `${dd} ${hh}Z`;
  }

  function drawRbnSignalCanvas(canvas, model) {
    if (!(canvas instanceof HTMLCanvasElement) || !model) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const prev = rbnCompareSignalCanvasJobs.get(canvas);
    if (prev && prev.raf) cancelAnimationFrame(prev.raf);
    const token = (prev?.token || 0) + 1;
    const job = { token, raf: 0 };
    rbnCompareSignalCanvasJobs.set(canvas, job);
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
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
    const pointCount = series.reduce((acc, s) => acc + Math.floor((Array.isArray(s?.data) ? s.data.length : 0) / 2), 0);

    const xOf = (ts) => margin.left + ((ts - minTs) / Math.max(1, (maxTs - minTs))) * plotW;
    const yOf = (y) => margin.top + (1 - ((y - minY) / Math.max(1e-9, (maxY - minY)))) * plotH;

    // Axes
    ctx.strokeStyle = '#b9cbe7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + plotH);
    ctx.lineTo(margin.left + plotW, margin.top + plotH);
    ctx.stroke();

    // Grid + ticks
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

    // Optional trendlines (subtle).
    const trendlines = Array.isArray(model.trendlines) ? model.trendlines : [];
    if (trendlines.length) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1.6;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      trendlines.forEach((t) => {
        const data = Array.isArray(t?.data) ? t.data : [];
        if (data.length < 4) return;
        ctx.strokeStyle = t.color || bandColorForChart(t.band);
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < data.length; i += 2) {
          const ts = data[i];
          const snr = data[i + 1];
          if (!Number.isFinite(ts) || !Number.isFinite(snr)) continue;
          const x = xOf(ts);
          const y = yOf(snr);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        if (started) ctx.stroke();
      });
      ctx.restore();
    }

    // Points (progressive + batching, alpha + jitter to reduce overplotting).
    // Keep markers at a consistent size; reduce points (sampling) elsewhere for performance/clarity.
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

    // Title
    ctx.fillStyle = '#193d6e';
    ctx.font = '12px var(--sh6-font-family, verdana, arial, sans-serif)';
    ctx.textBaseline = 'top';
    ctx.fillText(model.title || '', margin.left, 2);

    const budgetPerFrame = pointCount > 20000 ? 4200 : (pointCount > 12000 ? 5000 : 6200);
    let seriesIdx = 0;
    let pointIdx = 0; // index in flat array (ts at idx, snr at idx+1)
    const step = () => {
      const live = rbnCompareSignalCanvasJobs.get(canvas);
      if (!live || live.token !== token) return;
      ctx.save();
      ctx.globalAlpha = pointAlpha;
      let remaining = budgetPerFrame;
      while (remaining > 0 && seriesIdx < series.length) {
        const s = series[seriesIdx] || {};
        const data = Array.isArray(s.data) ? s.data : [];
        const shape = s.shape || 'circle';
        const color = s.color || bandColorForChart(s.band);
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
          const { x: jx, y: jy } = jitterOf(ts, snr);
          const x = xOf(ts) + jx;
          const y = yOf(snr) + jy;
          // Append marker path, fill once per chunk.
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
        job.raf = requestAnimationFrame(step);
        rbnCompareSignalCanvasJobs.set(canvas, job);
      }
    };
    job.raf = requestAnimationFrame(step);
    rbnCompareSignalCanvasJobs.set(canvas, job);
  }

  function drawRbnCompareSignalCharts() {
    const root = dom.viewContainer;
    if (!root) return;
    const canvases = Array.from(root.querySelectorAll('.rbn-signal-canvas')).filter((c) => {
      if (!(c instanceof HTMLCanvasElement)) return false;
      if (!rbnCompareSignalIntersectionObserver) return true;
      return c.dataset.rbnVisible === '1';
    });
    if (!canvases.length) return;

    const slots = getActiveCompareSlots().filter((entry) => entry.slot?.qsoData && entry.slot?.derived);
    const base = slots.find((e) => e.id === 'A') || slots[0] || null;
    const bandFilter = state.globalBandFilter || '';
    const bandKey = normalizeBandToken(bandFilter);

    const minTs = Math.min(...slots.map((e) => Number(e.slot?.derived?.timeRange?.minTs)).filter(Number.isFinite));
    const maxTs = Math.max(...slots.map((e) => Number(e.slot?.derived?.timeRange?.maxTs)).filter(Number.isFinite));
    const safeMinTs = Number.isFinite(minTs) ? minTs : Date.now() - 24 * 3600 * 1000;
    const safeMaxTs = Number.isFinite(maxTs) ? maxTs : Date.now();
    const slotKeys = slots.map((e) => {
      const dk = rbnCompareSlotDataKey(e.slot);
      const idx = getRbnCompareIndexCached(e.id, e.slot);
      const idxFlag = idx && idx.dataKey === dk ? '1' : '0';
      return `${e.id}:${dk}:${idxFlag}`;
    }).join('|');

    canvases.forEach((canvas) => {
      const continent = String(canvas.dataset.continent || '').trim().toUpperCase() || 'N/A';
      const selectedSpotter = normalizeSpotterBase(String(canvas.dataset.spotter || '').trim());
      const card = canvas.closest('.rbn-signal-card');
      const legendBandsNode = card ? card.querySelector('.rbn-signal-legend-bands') : null;
      const metaNode = card ? card.querySelector('.rbn-signal-meta') : null;
      const sizeKey = `${canvas.clientWidth || 0}x${Number(canvas.dataset.height) || 260}`;
      const drawKey = `${selectedSpotter}|${bandKey || 'ALL'}|${slotKeys}|${sizeKey}`;
      if (canvas.dataset.rbnDrawKey === drawKey) return;
      canvas.dataset.rbnDrawKey = drawKey;
      if (!base || !selectedSpotter) {
        drawRbnSignalCanvas(canvas, {
          title: 'RBN signal',
          minTs: safeMinTs,
          maxTs: safeMaxTs,
          minY: -30,
          maxY: 40,
          series: []
        });
        if (legendBandsNode) legendBandsNode.innerHTML = '';
        if (metaNode) metaNode.textContent = '0 points plotted · SNR range: N/A';
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
      const trendBins = 72;
      const trendAgg = new Map(); // band -> { sum: Float64Array, cnt: Uint32Array }
      let pointTotal = 0;
      slots.forEach((entry) => {
        const slotId = entry.id;
        const shape = slotMarkerShape(slotId);
        const slot = entry.slot;
        const idx = getRbnCompareIndexCached(slotId, slot);
        if (!idx) {
          // Build index in background, then redraw.
          scheduleRbnCompareIndexBuild(slotId, slot);
          return;
        }
        const spotterEntry = idx.bySpotter.get(selectedSpotter);
        if (!spotterEntry) return;
        const perSlotCap = 6500;
        if (bandKey) {
          const raw = spotterEntry.byBand.get(bandKey) || [];
          const seed = `${selectedSpotter}|${slotId}|${idx.dataKey}|${bandKey}`;
          const sampled = sampleFlatStrideSeeded(raw, perSlotCap, seed);
          if (!sampled.length) return;
          pointTotal += Math.floor(sampled.length / 2);
          series.push({ band: bandKey, shape, color: bandColorForChart(bandKey), data: sampled });
          bandsPlotted.add(bandKey);
          if (!trendAgg.has(bandKey)) trendAgg.set(bandKey, { sum: new Float64Array(trendBins), cnt: new Uint32Array(trendBins) });
          for (let i = 1; i < sampled.length; i += 2) {
            const snr = sampled[i];
            if (!Number.isFinite(snr)) continue;
            minSnr = minSnr == null ? snr : Math.min(minSnr, snr);
            maxSnr = maxSnr == null ? snr : Math.max(maxSnr, snr);
            minY = minY == null ? snr : Math.min(minY, snr);
            maxY = maxY == null ? snr : Math.max(maxY, snr);
          }
          for (let i = 0; i < sampled.length; i += 2) {
            const ts = sampled[i];
            const snr = sampled[i + 1];
            if (!Number.isFinite(ts) || !Number.isFinite(snr)) continue;
            const pos = (ts - safeMinTs) / Math.max(1, (safeMaxTs - safeMinTs));
            const bin = Math.max(0, Math.min(trendBins - 1, Math.floor(pos * trendBins)));
            const agg = trendAgg.get(bandKey);
            agg.sum[bin] += snr;
            agg.cnt[bin] += 1;
          }
          return;
        }
        const bandCounts = Array.from(spotterEntry.bandCounts.entries()).filter(([b, c]) => b && c > 0);
        const total = spotterEntry.totalCount || bandCounts.reduce((acc, [, c]) => acc + c, 0);
        const caps = computeProportionalCaps(bandCounts, total, perSlotCap, 120);
        caps.forEach(([band, cap]) => {
          const raw = spotterEntry.byBand.get(band) || [];
          const seed = `${selectedSpotter}|${slotId}|${idx.dataKey}|${band}`;
          const sampled = sampleFlatStrideSeeded(raw, cap, seed);
          if (!sampled.length) return;
          pointTotal += Math.floor(sampled.length / 2);
          series.push({ band, shape, color: bandColorForChart(band), data: sampled });
          bandsPlotted.add(band);
          if (!trendAgg.has(band)) trendAgg.set(band, { sum: new Float64Array(trendBins), cnt: new Uint32Array(trendBins) });
          for (let i = 1; i < sampled.length; i += 2) {
            const snr = sampled[i];
            if (!Number.isFinite(snr)) continue;
            minSnr = minSnr == null ? snr : Math.min(minSnr, snr);
            maxSnr = maxSnr == null ? snr : Math.max(maxSnr, snr);
            minY = minY == null ? snr : Math.min(minY, snr);
            maxY = maxY == null ? snr : Math.max(maxY, snr);
          }
          for (let i = 0; i < sampled.length; i += 2) {
            const ts = sampled[i];
            const snr = sampled[i + 1];
            if (!Number.isFinite(ts) || !Number.isFinite(snr)) continue;
            const pos = (ts - safeMinTs) / Math.max(1, (safeMaxTs - safeMinTs));
            const bin = Math.max(0, Math.min(trendBins - 1, Math.floor(pos * trendBins)));
            const agg = trendAgg.get(band);
            agg.sum[bin] += snr;
            agg.cnt[bin] += 1;
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

      const titleBand = bandKey ? formatBandLabel(bandKey) : 'All bands';
      const title = `${continent} · ${selectedSpotter} · ${titleBand}`;
      const trendlines = sortBands(Array.from(trendAgg.keys())).map((band) => {
        const agg = trendAgg.get(band);
        if (!agg) return null;
        const data = [];
        // 3-bin weighted smoothing.
        for (let i = 0; i < trendBins; i += 1) {
          const c0 = agg.cnt[i] || 0;
          if (!c0) continue;
          const prev = i > 0 ? i - 1 : i;
          const next = i < trendBins - 1 ? i + 1 : i;
          const cPrev = agg.cnt[prev] || 0;
          const cNext = agg.cnt[next] || 0;
          const sPrev = agg.sum[prev] || 0;
          const s0 = agg.sum[i] || 0;
          const sNext = agg.sum[next] || 0;
          const wSum = sPrev + s0 + sNext;
          const wCnt = cPrev + c0 + cNext;
          if (!wCnt) continue;
          const ts = safeMinTs + ((i + 0.5) / trendBins) * (safeMaxTs - safeMinTs);
          data.push(ts, wSum / wCnt);
        }
        if (data.length < 6) return null;
        return { band, color: bandColorForChart(band), data };
      }).filter(Boolean);
      drawRbnSignalCanvas(canvas, {
        title,
        minTs: safeMinTs,
        maxTs: safeMaxTs,
        minY,
        maxY,
        series,
        trendlines
      });

      if (legendBandsNode) {
        const bands = sortBands(Array.from(bandsPlotted).filter(Boolean));
        legendBandsNode.innerHTML = bands.map((b) => (
          `<span class="rbn-legend-item"><i style="background:${bandColorForChart(b)}"></i>${escapeHtml(formatBandLabel(b) || b)}</span>`
        )).join('');
      }
      if (metaNode) {
        const fmt = (v) => (Number.isFinite(v) ? `${v > 0 ? '+' : ''}${Math.round(v)}` : 'N/A');
        const rangeText = (Number.isFinite(minSnr) && Number.isFinite(maxSnr)) ? `${fmt(minSnr)}..${fmt(maxSnr)} dB` : 'N/A';
        metaNode.textContent = `${formatNumberSh6(pointTotal)} points plotted · SNR range: ${rangeText}`;
      }
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `${title}. ${formatNumberSh6(pointTotal)} points plotted. ${metaNode ? metaNode.textContent : ''}`);
    });
  }

  function populateRbnCompareSignalSpotterSelects() {
    if (reports[state.activeIndex]?.id !== 'rbn_compare_signal') return;
    const root = dom.viewContainer;
    if (!root) return;
    const slots = getActiveCompareSlots();
    const base = slots.find((e) => e.id === 'A') || slots[0] || null;
    if (!base) return;
    const bandKey = normalizeBandToken(state.globalBandFilter || '');
    const cached = getRbnCompareRankingCached(base.id, base.slot, bandKey);
    const index = cached ? null : getRbnCompareIndexCached(base.id, base.slot);
    const ranking = cached || (index ? buildRbnCompareRankingFromIndex(base.id, base.slot, bandKey, index) : null);
    if (!ranking) {
      if (base.slot?.rbnState?.status === 'ready') scheduleRbnCompareIndexBuild(base.id, base.slot);
      return;
    }
    const selections = (state.rbnCompareSignal && typeof state.rbnCompareSignal === 'object')
      ? state.rbnCompareSignal
      : { selectedByContinent: {} };
    if (!state.rbnCompareSignal) state.rbnCompareSignal = selections;
    if (!selections.selectedByContinent) selections.selectedByContinent = {};
    const selects = Array.from(root.querySelectorAll('.rbn-signal-select'));
    selects.forEach((select) => {
      const cont = String(select.dataset.continent || '').trim().toUpperCase() || 'N/A';
      const list = ranking.byContinent.get(cont) || [];
      if (!list.length) {
        select.innerHTML = '<option value="">No skimmers</option>';
        select.disabled = true;
        const canvas = select.closest('.rbn-signal-card')?.querySelector('.rbn-signal-canvas');
        if (canvas) canvas.dataset.spotter = '';
        return;
      }
      const saved = normalizeSpotterBase(String(selections.selectedByContinent[cont] || '').trim());
      const defaultSpotter = saved && list.some((e) => e.spotter === saved) ? saved : list[0].spotter;
      selections.selectedByContinent[cont] = defaultSpotter;
      select.disabled = false;
      select.innerHTML = list.slice(0, 80).map((e) => {
        const label = `${e.spotter} (${formatNumberSh6(e.count)})`;
        return `<option value="${escapeAttr(e.spotter)}" ${e.spotter === defaultSpotter ? 'selected' : ''}>${escapeHtml(label)}</option>`;
      }).join('');
      const canvas = select.closest('.rbn-signal-card')?.querySelector('.rbn-signal-canvas');
      if (canvas) canvas.dataset.spotter = defaultSpotter;
    });
    scheduleRbnCompareSignalDraw();
  }

  function renderRbnCompareSignal() {
    if (!state.qsoData || !state.derived) {
      return renderStateCard({
        type: 'info',
        title: 'RBN compare signal unavailable',
        message: 'Load a log to enable RBN signal compare.'
      });
    }

    const slots = getActiveCompareSlots();
    const loaded = slots.filter((e) => e.slot?.qsoData && e.slot?.derived);
    const base = loaded.find((e) => e.id === 'A') || loaded[0] || null;
    const bandKey = normalizeBandToken(state.globalBandFilter || '');
    const bandLabel = bandKey ? formatBandLabel(bandKey) : 'All bands';

    const rbnControls = loaded.map((entry) => {
      const status = mapSpotStatus(entry.slot?.rbnState?.status || 'idle');
      const statusText = status === 'ready' ? 'ready' : (status === 'loading' ? 'loading' : (status === 'error' ? 'error' : 'idle'));
      return `
        <button type="button" class="button spots-load-btn" data-source="rbn" data-slot="${escapeAttr(entry.id)}">Load RBN (${escapeHtml(entry.label)})</button>
        <span class="cqapi-muted">${escapeHtml(statusText)}</span>
      `;
    }).join(' ');

    const warning = (() => {
      const minTs = state.derived?.timeRange?.minTs;
      const maxTs = state.derived?.timeRange?.maxTs;
      const days = buildRbnDayList(minTs, maxTs);
      if ((days || []).length > 2) {
        return `<div class="export-actions export-note">Note: this contest spans more than 2 UTC dates; RBN queries are limited to 2 dates at a time. Adjust selected days in <b>RBN spots</b> if needed.</div>`;
      }
      return '';
    })();

    const contOrder = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC', 'N/A'];
    const selections = (state.rbnCompareSignal && typeof state.rbnCompareSignal === 'object')
      ? state.rbnCompareSignal
      : { selectedByContinent: {} };
    if (!state.rbnCompareSignal) state.rbnCompareSignal = selections;
    if (!selections.selectedByContinent) selections.selectedByContinent = {};

    const rankingCached = base ? getRbnCompareRankingCached(base.id, base.slot, bandKey) : null;
    const byContinent = rankingCached?.byContinent || new Map();
    const cards = contOrder.map((cont) => {
      const list = byContinent.get(cont) || [];
      if (!list.length) {
        return `
          <article class="rbn-signal-card">
            <div class="rbn-signal-head">
              <h4>${escapeHtml(continentLabel(cont) || cont)} top skimmer</h4>
              <span class="cqapi-muted">${base?.slot?.rbnState?.status === 'ready' ? 'No RBN spots found.' : 'Load RBN spots to populate charts.'}</span>
            </div>
            <label class="rbn-signal-picker">
              <span>Skimmer</span>
              <select class="rbn-signal-select" data-continent="${escapeAttr(cont)}" disabled>
                <option value="">${rankingCached ? 'No skimmers' : 'Building list...'}</option>
              </select>
            </label>
            <canvas class="rbn-signal-canvas" data-continent="${escapeAttr(cont)}" data-spotter="" data-height="260" role="img" aria-label="RBN signal scatter plot"></canvas>
            <div class="rbn-signal-meta cqapi-muted">0 points plotted · SNR range: N/A</div>
            <div class="rbn-signal-legend">
              <span class="rbn-legend-title">Legend</span>
              <span class="rbn-signal-legend-bands"></span>
              <span class="rbn-legend-item rbn-legend-shape">A ● B ▲ C ■ D ◆</span>
            </div>
          </article>
        `;
      }
      const saved = normalizeSpotterBase(String(selections.selectedByContinent[cont] || '').trim());
      const defaultSpotter = saved && list.some((e) => e.spotter === saved) ? saved : list[0].spotter;
      selections.selectedByContinent[cont] = defaultSpotter;
      const options = list.slice(0, 80).map((e) => {
        const label = `${e.spotter} (${formatNumberSh6(e.count)})`;
        return `<option value="${escapeAttr(e.spotter)}" ${e.spotter === defaultSpotter ? 'selected' : ''}>${escapeHtml(label)}</option>`;
      }).join('');
      return `
        <article class="rbn-signal-card">
          <div class="rbn-signal-head">
            <h4>${escapeHtml(continentLabel(cont) || cont)} top skimmer</h4>
            <label class="rbn-signal-picker">
              <span>Skimmer</span>
              <select class="rbn-signal-select" data-continent="${escapeAttr(cont)}">
                ${options}
              </select>
            </label>
          </div>
          <canvas class="rbn-signal-canvas" data-continent="${escapeAttr(cont)}" data-spotter="${escapeAttr(defaultSpotter)}" data-height="260" role="img" aria-label="RBN signal scatter plot"></canvas>
          <div class="rbn-signal-meta cqapi-muted">0 points plotted · SNR range: N/A</div>
          <div class="rbn-signal-legend">
            <span class="rbn-legend-title">Legend</span>
            <span class="rbn-signal-legend-bands"></span>
            <span class="rbn-legend-item rbn-legend-shape">A ● B ▲ C ■ D ◆</span>
          </div>
        </article>
      `;
    }).join('');

    const intro = renderReportIntroCard(
      'RBN compare signal',
      'Scatter charts of RBN SNR (dB) versus time, colored by band and overlaid across loaded logs.',
      [
        `Band filter ${bandLabel}`,
        `Charts based on Log A skimmers`,
        'Skimmer ranking follows band filter'
      ]
    );

    return `
      ${intro}
      ${warning}
      <div class="export-actions">${rbnControls || '<span class="cqapi-muted">Load at least one log to enable RBN charts.</span>'}</div>
      <div class="rbn-signal-grid">${cards}</div>
    `;
  }

  function renderSpotsSharedControls(source) {
    const sourceAttr = escapeAttr(source);
    const spotState = getSpotStateBySource(state, source);
    const windowMinutes = Number(spotState.windowMinutes) || 15;
    const bandFilterSet = new Set(spotState.bandFilter || []);
    const baseBands = getAvailableBands(true).filter((b) => b && String(b).toLowerCase() !== 'unknown');
    const bandOptions = sortBands(baseBands);
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
          const label = band === 'unknown' ? 'Unknown' : formatBandLabel(band);
          const checked = bandFilterSet.has(band) ? 'checked' : '';
          const cls = band === 'unknown' ? '' : bandClass(band);
          return `
            <label class="spots-filter ${cls}">
              <input type="checkbox" class="spots-band-filter" data-shared="1" data-source="${sourceAttr}" data-band="${escapeAttr(band)}" ${checked}>
              <span>${escapeHtml(label)}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderSpotsCompare(source) {
    const slots = getActiveCompareSnapshots();
    const htmlBlocks = slots.map((entry) => (
      entry.ready ? withSlotState(entry.snapshot, () => renderSpots({ source, spotsState: getSpotStateBySource(entry.snapshot, source), hideControls: true }), { slotId: entry.id }) : `<p>No ${entry.label} loaded.</p>`
    ));
    const controls = renderSpotsSharedControls(source);
    return `${controls}${renderComparePanels(slots, htmlBlocks, source === 'rbn' ? 'rbn_spots' : 'spots')}`;
  }

  function renderSpotHunter() {
    const slotId = state.renderSlotId || 'A';
    return `
      <div class="mtc map-card">
        <div class="gradient">&nbsp;Spot hunter</div>
        <div class="spot-hunter" data-slot="${escapeAttr(slotId)}">
          <p>Loading latest spots for today…</p>
        </div>
      </div>
    `;
  }

  function renderSpotHunterCompare() {
    const slots = getActiveCompareSnapshots();
    const htmlBlocks = slots.map((entry) => (
      entry.ready
        ? `<div class="spot-hunter" data-slot="${escapeAttr(entry.id)}"><p>Loading latest spots for today…</p></div>`
        : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'spot_hunter');
  }

  const CONTINENT_ORDER = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC'];

  function continentOrderIndex(code) {
    const key = normalizeContinent(code);
    const idx = CONTINENT_ORDER.indexOf(key);
    return idx === -1 ? 99 : idx;
  }

  function buildCountryListFromDerived(derived) {
    if (!derived || !derived.countrySummary) return [];
    return derived.countrySummary.map((c) => ({
      country: c.country,
      continent: c.continent || '',
      prefixCode: c.prefixCode || ''
    }));
  }

  function mergeCountryLists(listA, listB) {
    const map = new Map();
    listA.forEach((c) => {
      map.set(c.country, { ...c });
    });
    listB.forEach((c) => {
      if (!map.has(c.country)) {
        map.set(c.country, { ...c });
      } else {
        const existing = map.get(c.country);
        if (!existing.continent) existing.continent = c.continent || '';
        if (!existing.prefixCode) existing.prefixCode = c.prefixCode || '';
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const ai = continentOrderIndex(a.continent);
      const bi = continentOrderIndex(b.continent);
      if (ai !== bi) return ai - bi;
      const ap = a.prefixCode || a.country || '';
      const bp = b.prefixCode || b.country || '';
      return ap.localeCompare(bp);
    });
  }

  function buildCountrySummaryMap(derived) {
    const map = new Map();
    if (!derived || !derived.countrySummary) return map;
    derived.countrySummary.forEach((c) => map.set(c.country, c));
    return map;
  }

  function renderCountryRowsFromList(list, derived, totalQsos) {
    const bandCols = getDisplayBandList();
    const summaryMap = buildCountrySummaryMap(derived);
    const renderCount = (count, country, band, mode) => {
      if (!count) return '<td></td>';
      const countryAttr = escapeAttr(country || '');
      const bandAttr = escapeAttr(band || '');
      const modeAttr = escapeAttr(mode || '');
      return `<td><a href="#" class="log-country-filter" data-country="${countryAttr}" data-band="${bandAttr}" data-mode="${modeAttr}">${formatNumberSh6(count)}</a></td>`;
    };
    return list.map((info, idx) => {
      const c = summaryMap.get(info.country);
      const continent = c?.continent || info.continent || '';
      const prefixCode = c?.prefixCode || info.prefixCode || '';
      const pct = c && totalQsos ? ((c.qsos / totalQsos) * 100).toFixed(1) : '';
      const bandCount = c ? bandCols.filter((b) => c.bandCounts?.get(b)).length : 0;
      const bandClass = `q${Math.min(6, Math.max(1, bandCount || 1))}`;
      const bandCells = bandCols.map((b) => renderCount(c?.bandCounts?.get(b), info.country, b, ''));
      const countryText = escapeHtml(info.country || '');
      const countryAttr = escapeAttr(info.country || '');
      const mapLink = c ? `<a href="#" class="map-link" data-scope="country" data-key="${countryAttr}">map</a>` : '';
      const countryLabel = c ? `<a href="#" class="log-country" data-country="${countryAttr}">${countryText}</a>` : countryText;
      const uniqueLabel = c?.uniques
        ? `<a href="#" class="log-country-unique" data-country="${countryAttr}">${formatNumberSh6(c.uniques)}</a>`
        : '';
      const continentText = escapeHtml(continent);
      const prefixText = escapeHtml(prefixCode);
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${formatNumberSh6(idx + 1)}</td>
        <td class="${continentClass(continent)}">${continentText}</td>
        <td>${prefixText}</td>
        <td class="tl">${countryLabel}</td>
        <td>${c?.distanceAvg ? formatNumberSh6(c.distanceAvg.toFixed(0)) : ''}</td>
        ${renderCount(c?.cw, info.country, '', 'CW')}
        ${renderCount(c?.digital, info.country, '', 'Digital')}
        ${renderCount(c?.phone, info.country, '', 'Phone')}
        ${bandCells.join('')}
        ${renderCount(c?.qsos, info.country, '', '')}
        <td>${uniqueLabel}</td>
        <td><i>${pct}</i></td>
        <td class="${bandClass}">${bandCount || ''}</td>
        <td class="tac">${mapLink}</td>
      </tr>
    `;
    }).join('');
  }

  function renderCountriesTable(rows) {
    const bandCols = getDisplayBandList();
    const qsoCols = 3 + bandCols.length + 3;
    const bandHeaders = bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <colgroup><col width="40px" span="3" align="center"/><col align="left"/><col span="${bandCols.length + 9}" width="40px" align="center"/></colgroup>
        <tr class="thc">
          <th rowspan="2">#</th>
          <th rowspan="2">Cont.</th>
          <th colspan="2" rowspan="2">Country</th>
          <th rowspan="2">Distance, km</th>
          <th colspan="${qsoCols}">QSOs</th>
          <th rowspan="2">Bands</th>
          <th rowspan="2">Map</th>
        </tr>
        <tr class="thc">
          <th>CW</th><th>DIG</th><th>SSB</th>
          ${bandHeaders}
          <th>All</th><th>Unique</th><th>%</th>
        </tr>
        ${rows}
        ${mapAllFooter(bandCols.length + 13)}
      </table>
    `;
  }

  function renderCountryBandSummaryRowsFromList(list, derived, totalQsos, options = {}) {
    const bandCols = options.bandCols && options.bandCols.length ? options.bandCols : getDisplayBandList();
    const showIndex = options.showIndex !== false;
    const showTotal = options.showTotal !== false;
    const summaryMap = buildCountrySummaryMap(derived);
    const renderCount = (count, country, band) => {
      if (!count) return '<td></td>';
      const countryAttr = escapeAttr(country || '');
      const bandAttr = escapeAttr(band || '');
      return `<td><a href="#" class="log-country-filter" data-country="${countryAttr}" data-band="${bandAttr}" data-mode="">${formatNumberSh6(count)}</a></td>`;
    };
    return list.map((info, idx) => {
      const c = summaryMap.get(info.country);
      const continent = c?.continent || info.continent || '';
      const countryText = escapeHtml(info.country || '');
      const countryAttr = escapeAttr(info.country || '');
      const countryLabel = c ? `<a href="#" class="log-country" data-country="${countryAttr}">${countryText}</a>` : countryText;
      const bandCells = bandCols.map((b) => renderCount(c?.bandCounts?.get(b), info.country, b));
      const total = c?.qsos || 0;
      const totalCell = total ? renderCount(total, info.country, '') : '<td></td>';
      return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          ${showIndex ? `<td>${formatNumberSh6(idx + 1)}</td>` : ''}
          <td class="${continentClass(continent)}">${escapeHtml(continent)}</td>
          <td class="tl">${countryLabel}</td>
          ${bandCells.join('')}
          ${showTotal ? totalCell : ''}
        </tr>
      `;
    }).join('');
  }

  function renderCountriesBandSummaryTable(rows, options = {}) {
    const bandCols = options.bandCols && options.bandCols.length ? options.bandCols : getDisplayBandList();
    const showIndex = options.showIndex !== false;
    const showTotal = options.showTotal !== false;
    const continentLabel = options.continentLabel || 'Cont.';
    const bandHeaders = bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc">
          ${showIndex ? '<th>#</th>' : ''}
          <th>${escapeHtml(continentLabel)}</th>
          <th>Country</th>
          ${bandHeaders}
          ${showTotal ? '<th>All</th>' : ''}
        </tr>
        ${rows}
      </table>
    `;
  }

  function renderCountries() {
    if (!state.derived) return renderPlaceholder({ id: 'countries', title: 'Countries' });
    const totalQsos = state.qsoData?.qsos.length || 0;
    const list = buildCountryListFromDerived(state.derived);
    const rows = renderCountryRowsFromList(list, state.derived, totalQsos);
    return renderCountriesTable(rows);
  }

  function buildContinentListFromDerived(derived) {
    if (!derived || !derived.continentSummary) return [];
    return derived.continentSummary.map((c) => ({ continent: normalizeContinent(c.continent) }));
  }

  function mergeContinentLists(listA, listB) {
    const map = new Map();
    listA.forEach((c) => map.set(c.continent || 'Other', { ...c }));
    listB.forEach((c) => {
      const key = c.continent || 'Other';
      if (!map.has(key)) map.set(key, { ...c });
    });
    return Array.from(map.values()).sort((a, b) => {
      const ai = continentOrderIndex(a.continent);
      const bi = continentOrderIndex(b.continent);
      if (ai !== bi) return ai - bi;
      return (a.continent || '').localeCompare(b.continent || '');
    });
  }

  function buildContinentSummaryMap(derived) {
    const map = new Map();
    if (!derived || !derived.continentSummary) return map;
    derived.continentSummary.forEach((c) => map.set(normalizeContinent(c.continent), c));
    return map;
  }

  function renderContinentsRowsFromList(list, derived, totalQsos) {
    const bandCols = getDisplayBandList();
    const summaryMap = buildContinentSummaryMap(derived);
    return list.map((info, idx) => {
      const contKey = normalizeContinent(info.continent);
      const c = summaryMap.get(contKey);
      const pct = c && totalQsos ? ((c.qsos / totalQsos) * 100).toFixed(1) : '';
      const contText = escapeHtml(contKey);
      const contAttr = escapeAttr(contKey);
      const contLabel = escapeHtml(continentLabel(contKey));
      const bandCells = bandCols.map((b) => {
        const count = c?.bandCounts?.get(b) || 0;
        if (!count) return '<td></td>';
        return `<td><a href="#" class="log-continent-band" data-continent="${contAttr}" data-band="${b}">${formatNumberSh6(count)}</a></td>`;
      }).join('');
      const allLink = c ? `<a href="#" class="log-continent" data-continent="${contAttr}">${formatNumberSh6(c.qsos)}</a>` : '';
      const cw = c?.cw ? formatNumberSh6(c.cw) : '';
      const digital = c?.digital ? formatNumberSh6(c.digital) : '';
      const phone = c?.phone ? formatNumberSh6(c.phone) : '';
      const contClass = continentClass(contKey);
      const mapLink = c ? `<a href="#" class="map-link" data-scope="continent" data-key="${contAttr}">map</a>` : '';
      return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td>${formatNumberSh6(idx + 1)}</td>
          <td class="${contClass}">${contText}</td>
          <td style="text-align:left">${contLabel}</td>
          ${bandCells}
          <td>${allLink}</td>
          <td><i>${pct}</i></td>
          <td>${cw}</td>
          <td>${digital}</td>
          <td>${phone}</td>
          <td class="tac">${mapLink}</td>
        </tr>
      `;
    }).join('');
  }

  function renderContinentsTable(rows) {
    const bandCols = getDisplayBandList();
    const qsoCols = bandCols.length + 5;
    const bandHeaders = bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <colgroup><col width="40px"/><col width="30px"/><col width="200px"/><col span="${qsoCols}" width="120px"/><col width="56px"/></colgroup>
        <tr class="thc"><th rowspan="2">#</th><th colspan="2" rowspan="2">Continent</th><th colspan="${qsoCols}">QSOs</th><th rowspan="2">Map</th></tr>
        <tr class="thc">${bandHeaders}<th>All</th><th>%</th><th>CW</th><th>Digital</th><th>Phone</th></tr>
        ${rows}
        ${mapAllFooter(bandCols.length + 9)}
      </table>
    `;
  }

  function renderContinents() {
    if (!state.derived) return renderPlaceholder({ id: 'continents', title: 'Continents' });
    const totalQs = state.qsoData?.qsos?.length || 0;
    const list = buildContinentListFromDerived(state.derived);
    const rows = renderContinentsRowsFromList(list, state.derived, totalQs);
    return renderContinentsTable(rows);
  }

  function buildZoneListFromDerived(derived, field) {
    if (!derived) return [];
    const source = field === 'itu' ? derived.ituZoneSummary : derived.cqZoneSummary;
    if (!source) return [];
    return source.map((z) => ({ zone: z[`${field}Zone`] }));
  }

  function mergeZoneLists(listA, listB) {
    const map = new Map();
    listA.forEach((z) => map.set(z.zone, z));
    listB.forEach((z) => {
      if (!map.has(z.zone)) map.set(z.zone, z);
    });
    return Array.from(map.values()).sort((a, b) => a.zone - b.zone);
  }

  function buildZoneSummaryMap(derived, field) {
    const map = new Map();
    if (!derived) return map;
    const source = field === 'itu' ? derived.ituZoneSummary : derived.cqZoneSummary;
    if (!source) return map;
    source.forEach((z) => map.set(z[`${field}Zone`], z));
    return map;
  }

  function renderZoneRowsFromList(list, derived, field) {
    const bandCols = getDisplayBandList();
    const summaryMap = buildZoneSummaryMap(derived, field);
    const scope = field === 'itu' ? 'itu_zone' : 'cq_zone';
    const dataAttr = field === 'itu' ? 'data-itu' : 'data-cq';
    const linkClass = field === 'itu' ? 'log-itu' : 'log-cq';
    return list.map((info, idx) => {
      const z = summaryMap.get(info.zone);
      const zoneText = escapeHtml(info.zone ?? '');
      const zoneAttr = escapeAttr(info.zone ?? '');
      const mapLink = z ? `<a href="#" class="map-link" data-scope="${scope}" data-key="${zoneAttr}">map</a>` : '';
      const zoneLink = z ? `<a href="#" class="${linkClass}" ${dataAttr}="${zoneAttr}">${zoneText}</a>` : zoneText;
      const bandCells = bandCols.map((b) => {
        const count = z?.bandCounts?.get(b) || 0;
        if (!count) return '<td></td>';
        return `<td><a href=\"#\" class=\"${linkClass}\" ${dataAttr}=\"${zoneAttr}\" data-band=\"${escapeAttr(b)}\">${formatNumberSh6(count)}</a></td>`;
      }).join('');
      const allLink = z ? `<a href=\"#\" class=\"${linkClass}\" ${dataAttr}=\"${zoneAttr}\">${formatNumberSh6(z.qsos)}</a>` : '';
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${zoneLink}</td>
        <td>${z ? formatNumberSh6(z.countries) : ''}</td>
        ${bandCells}
        <td>${allLink}</td>
        <td class="tac">${mapLink}</td>
      </tr>
    `;
    }).join('');
  }

  function renderZonesTable(rows) {
    const bandCols = getDisplayBandList();
    const bandHeaders = bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Zone</th><th>DXCC</th>${bandHeaders}<th>All</th><th>Map</th></tr>
        ${rows}
        ${mapAllFooter(bandCols.length + 4)}
      </table>
    `;
  }

  function renderCqZones() {
    if (!state.derived) return renderPlaceholder({ id: 'zones_cq', title: 'CQ zones' });
    const list = buildZoneListFromDerived(state.derived, 'cq');
    const rows = renderZoneRowsFromList(list, state.derived, 'cq');
    return renderZonesTable(rows);
  }

  function renderItuZones() {
    if (!state.derived) return renderPlaceholder({ id: 'zones_itu', title: 'ITU zones' });
    const list = buildZoneListFromDerived(state.derived, 'itu');
    const rows = renderZoneRowsFromList(list, state.derived, 'itu');
    return renderZonesTable(rows);
  }

  function renderQsByHourSheet() {
    if (!state.derived || !state.derived.hourSeries) return renderPlaceholder({ id: 'qs_by_hour_sheet', title: 'Qs by hour sheet' });
    const bandCols = getDisplayBandList();
    const qsoCols = bandCols.length + 4;
    const hourPoints = new Map((state.derived.hourPointSeries || []).map((entry) => [entry.hour, entry.points]));
    let accum = 0;
    let lastDay = '';
    const rows = state.derived.hourSeries.map((h, idx) => {
      const hourTs = h.hour * 3600000;
      const day = formatDaySh6(hourTs);
      const hour = String(new Date(hourTs).getUTCHours()).padStart(2, '0');
      const dayLabel = day !== lastDay ? day : '';
      lastDay = day;
      const cells = bandCols.map((b) => {
        const count = h.bands[b] || 0;
        if (!count) return '<td></td>';
        return `<td><a href="#" class="log-hour-band" data-hour="${h.hour}" data-band="${b}">${formatNumberSh6(count)}</a></td>`;
      }).join('');
      accum += h.qsos;
      const pts = hourPoints.get(h.hour) || '';
      const avgPts = pts && h.qsos ? (pts / h.qsos).toFixed(1) : '';
      const cls = idx % 2 === 0 ? 'td1' : 'td0';
      const allLink = `<a href="#" class="log-hour" data-hour="${h.hour}"><b>${formatNumberSh6(h.qsos)}</b></a>`;
      return `<tr class="${cls}"><td>${dayLabel}</td><td><b>${hour}:00Z</b></td>${cells}<td>${allLink}</td><td>${formatNumberSh6(accum)}</td><td>${formatNumberSh6(pts)}</td><td>${avgPts}</td></tr>`;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc">
          <th rowspan="2">Day</th>
          <th rowspan="2">Hour</th>
          <th colspan="${qsoCols}">QSOs</th>
        </tr>
        <tr class="thc">
          ${bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('')}
          <th>All</th><th>Accum.</th><th>Pts</th><th>Avg. Pts</th>
        </tr>
        ${rows}
      </table>
    `;
  }

  function buildHourBucketMap(qsos, pointsByIndex = null) {
    const map = new Map();
    (qsos || []).forEach((q, idx) => {
      if (!Number.isFinite(q.ts)) return;
      const d = new Date(q.ts);
      const day = d.getUTCDay();
      const hour = d.getUTCHours();
      const key = `${day}-${hour}`;
      if (!map.has(key)) {
        map.set(key, {
          day,
          hour,
          qsos: 0,
          points: 0,
          bands: new Map(),
          bandPoints: new Map(),
          sampleTs: q.ts
        });
      }
      const entry = map.get(key);
      entry.qsos += 1;
      const points = Array.isArray(pointsByIndex) ? Number(pointsByIndex[idx]) : Number(q.points);
      if (Number.isFinite(points)) entry.points += points;
      const bandKey = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey) {
        entry.bands.set(bandKey, (entry.bands.get(bandKey) || 0) + 1);
        if (Number.isFinite(points)) {
          entry.bandPoints.set(bandKey, (entry.bandPoints.get(bandKey) || 0) + points);
        }
      }
    });
    return map;
  }

  function buildHourKeyOrderFromMaps(mapA, mapB, qsosA, qsosB) {
    return buildHourKeyOrderFromMapsList([mapA, mapB], [qsosA, qsosB]);
  }

  function buildHourKeyOrderFromMapsList(maps, qsoLists) {
    const allKeys = new Set();
    maps.forEach((map) => map.forEach((_, key) => allKeys.add(key)));
    const keys = Array.from(allKeys);
    let startIndex = null;
    const allWithTs = qsoLists.flat().filter((q) => Number.isFinite(q.ts));
    if (allWithTs.length) {
      const minTs = Math.min(...allWithTs.map((q) => q.ts));
      const d = new Date(minTs);
      startIndex = d.getUTCDay() * 24 + d.getUTCHours();
    }
    const idx = (key) => {
      const [dayStr, hourStr] = String(key).split('-');
      return Number(dayStr) * 24 + Number(hourStr);
    };
    return keys.sort((a, b) => {
      const ai = idx(a);
      const bi = idx(b);
      if (startIndex == null) return ai - bi;
      const da = (ai - startIndex + 168) % 168;
      const db = (bi - startIndex + 168) % 168;
      return da - db;
    });
  }

  function renderQsByHourSheetForSlot(slot, keyOrder, bucketMap) {
    if (!slot || !slot.derived) return '<p>No log loaded.</p>';
    const bandCols = getDisplayBandList();
    const qsoCols = bandCols.length + 4;
    let accum = 0;
    let lastDay = null;
    const rows = keyOrder.map((key, idx) => {
      const entry = bucketMap.get(key);
      const day = entry ? entry.day : Number(String(key).split('-')[0]);
      const hour = entry ? entry.hour : Number(String(key).split('-')[1]);
      const dayLabel = day !== lastDay ? (WEEKDAY_LABELS[day] || '') : '';
      lastDay = day;
      const cells = bandCols.map((b) => {
        const count = entry ? (entry.bands.get(b) || 0) : 0;
        if (!count) return '<td></td>';
        const hourBucket = entry ? Math.floor(entry.sampleTs / 3600000) : null;
        return hourBucket != null
          ? `<td><a href="#" class="log-hour-band" data-hour="${hourBucket}" data-band="${b}">${formatNumberSh6(count)}</a></td>`
          : `<td>${formatNumberSh6(count)}</td>`;
      }).join('');
      const qsos = entry ? entry.qsos : 0;
      accum += qsos;
      const pts = entry ? entry.points : 0;
      const avgPts = pts && qsos ? (pts / qsos).toFixed(1) : '';
      const cls = idx % 2 === 0 ? 'td1' : 'td0';
      const hourLabel = `${String(hour).padStart(2, '0')}:00Z`;
      const hourBucket = entry ? Math.floor(entry.sampleTs / 3600000) : null;
      const allLink = qsos && hourBucket != null
        ? `<a href="#" class="log-hour" data-hour="${hourBucket}"><b>${formatNumberSh6(qsos)}</b></a>`
        : (qsos ? `<b>${formatNumberSh6(qsos)}</b>` : '');
      return `<tr class="${cls}"><td>${dayLabel}</td><td><b>${hourLabel}</b></td>${cells}<td>${allLink}</td><td>${formatNumberSh6(accum || '')}</td><td>${formatNumberSh6(pts || '')}</td><td>${avgPts}</td></tr>`;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc">
          <th rowspan="2">Day</th>
          <th rowspan="2">Hour</th>
          <th colspan="${qsoCols}">QSOs</th>
        </tr>
        <tr class="thc">
          ${bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('')}
          <th>All</th><th>Accum.</th><th>Pts</th><th>Avg. Pts</th>
        </tr>
        ${rows}
      </table>
    `;
  }

  function renderQsByHourSheetCompare() {
    const slots = getActiveCompareSnapshots();
    const maps = slots.map((entry) => buildHourBucketMap(
      entry.snapshot.qsoData?.qsos || [],
      getEffectivePointsByIndex(entry.snapshot.derived, entry.snapshot.qsoData?.qsos || [])
    ));
    const order = buildHourKeyOrderFromMapsList(maps, slots.map((entry) => entry.snapshot.qsoData?.qsos || []));
    const htmlBlocks = slots.map((entry, idx) => (
      entry.ready ? renderQsByHourSheetForSlot(entry.snapshot, order, maps[idx]) : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'qs_by_hour_sheet');
  }

  function renderPointsByHourSheetForSlot(slot, keyOrder, bucketMap) {
    if (!slot || !slot.derived) return '<p>No log loaded.</p>';
    const bandCols = getDisplayBandList();
    const pointCols = bandCols.length + 4;
    let accum = 0;
    let lastDay = null;
    const rows = keyOrder.map((key, idx) => {
      const entry = bucketMap.get(key);
      const day = entry ? entry.day : Number(String(key).split('-')[0]);
      const hour = entry ? entry.hour : Number(String(key).split('-')[1]);
      const dayLabel = day !== lastDay ? (WEEKDAY_LABELS[day] || '') : '';
      lastDay = day;
      const cells = bandCols.map((b) => {
        const points = entry ? (entry.bandPoints?.get(b) || 0) : 0;
        if (!points) return '<td></td>';
        const hourBucket = entry ? Math.floor(entry.sampleTs / 3600000) : null;
        return hourBucket != null
          ? `<td><a href="#" class="log-hour-band" data-hour="${hourBucket}" data-band="${b}">${formatPointValue(points)}</a></td>`
          : `<td>${formatPointValue(points)}</td>`;
      }).join('');
      const pts = entry ? entry.points : 0;
      accum += pts;
      const qsos = entry ? entry.qsos : 0;
      const avgPts = pts && qsos ? (pts / qsos).toFixed(1) : '';
      const cls = idx % 2 === 0 ? 'td1' : 'td0';
      const hourLabel = `${String(hour).padStart(2, '0')}:00Z`;
      const hourBucket = entry ? Math.floor(entry.sampleTs / 3600000) : null;
      const allLink = pts && hourBucket != null
        ? `<a href="#" class="log-hour" data-hour="${hourBucket}"><b>${formatPointValue(pts)}</b></a>`
        : (pts ? `<b>${formatPointValue(pts)}</b>` : '');
      return `<tr class="${cls}"><td>${dayLabel}</td><td><b>${hourLabel}</b></td>${cells}<td>${allLink}</td><td>${formatPointValue(accum || '')}</td><td>${formatNumberSh6(qsos || '')}</td><td>${avgPts}</td></tr>`;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc">
          <th rowspan="2">Day</th>
          <th rowspan="2">Hour</th>
          <th colspan="${pointCols}">Points</th>
        </tr>
        <tr class="thc">
          ${bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('')}
          <th>All</th><th>Accum.</th><th>QSOs</th><th>Avg. Pts</th>
        </tr>
        ${rows}
      </table>
    `;
  }

  function renderPointsByHourSheet() {
    if (!state.derived || !state.derived.hourPointSeries) {
      return renderPlaceholder({ id: 'points_by_hour_sheet', title: 'Points by hour sheet' });
    }
    const qsos = state.qsoData?.qsos || [];
    const pointsByIndex = getEffectivePointsByIndex(state.derived, qsos);
    const map = buildHourBucketMap(qsos, pointsByIndex);
    const order = buildHourKeyOrderFromMapsList([map], [qsos]);
    if (!order.length) return '<p>No points to analyze.</p>';
    return renderPointsByHourSheetForSlot({ derived: state.derived }, order, map);
  }

  function renderPointsByHourSheetCompare() {
    const slots = getActiveCompareSnapshots();
    const maps = slots.map((entry) => buildHourBucketMap(
      entry.snapshot.qsoData?.qsos || [],
      getEffectivePointsByIndex(entry.snapshot.derived, entry.snapshot.qsoData?.qsos || [])
    ));
    const order = buildHourKeyOrderFromMapsList(maps, slots.map((entry) => entry.snapshot.qsoData?.qsos || []));
    const htmlBlocks = slots.map((entry, idx) => (
      entry.ready ? renderPointsByHourSheetForSlot(entry.snapshot, order, maps[idx]) : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'points_by_hour_sheet');
  }

  function renderQsoRatesForData(qsos) {
    const windows = [10, 20, 30, 60, 120];
    const rows = windows.map((mins, idx) => {
      const peak = computePeakWindow(qsos, mins);
      const perMin = peak.count ? (peak.count / mins).toFixed(1) : '0.0';
      const perHour = peak.count ? Math.round((peak.count * 60) / mins) : 0;
      const fromTime = peak.startTs ? formatDateSh6(peak.startTs) : 'N/A';
      const toTime = peak.endTs ? formatDateSh6(peak.endTs) : 'N/A';
      const startAttr = escapeAttr(peak.startQso ?? '');
      const endAttr = escapeAttr(peak.endQso ?? '');
      const rangeLink = (peak.startQso != null && peak.endQso != null)
        ? `<a href="#" class="log-range" data-start="${startAttr}" data-end="${endAttr}">${formatNumberSh6(peak.count)}</a>`
        : `${formatNumberSh6(peak.count)}`;
      return `
        <div class="rates-row ${idx % 2 === 0 ? 'td1' : 'td0'}">
          <div class="rates-cell"><b>${mins}</b></div>
          <div class="rates-cell">${rangeLink}</div>
          <div class="rates-cell">${perMin}</div>
          <div class="rates-cell">${formatNumberSh6(perHour)}</div>
          <div class="rates-cell">${fromTime}</div>
          <div class="rates-cell">${formatNumberSh6(peak.startQso ?? '')}</div>
          <div class="rates-cell">${toTime}</div>
          <div class="rates-cell">${formatNumberSh6(peak.endQso ?? '')}</div>
        </div>
      `;
    }).join('');
    return `
      <div class="rates-grid">
        <div class="rates-header thc">
          <div class="rates-cell">Period (min)</div>
          <div class="rates-cell">QSOs</div>
          <div class="rates-cell">QSOs / min</div>
          <div class="rates-cell">QSOs / hour</div>
          <div class="rates-cell">From (time)</div>
          <div class="rates-cell">From (QSO #)</div>
          <div class="rates-cell">To (time)</div>
          <div class="rates-cell">To (QSO #)</div>
        </div>
        ${rows}
      </div>
    `;
  }

  function renderRates() {
    if (!state.derived) return renderPlaceholder({ id: 'rates', title: 'Rates' });
    const qsos = state.qsoData?.qsos || [];
    return `
      <div class="gradient">&nbsp;QSO rates</div>
      ${renderQsoRatesForData(qsos)}
      <div class="gradient rates-subhead">&nbsp;Point rates</div>
      ${renderPointsRatesForData(state.derived, qsos)}
    `;
  }

  function formatPointValue(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return '';
    return Number.isInteger(num) ? formatNumberSh6(num) : num.toFixed(1);
  }

  function computePeakPointsWindow(qsos, pointsByIndex, windowMinutes) {
    const windowMs = windowMinutes * 60000;
    const data = (qsos || [])
      .map((q, idx) => ({
        ts: q?.ts,
        qsoNumber: q?.qsoNumber,
        points: Number(Array.isArray(pointsByIndex) ? pointsByIndex[idx] : q?.points) || 0
      }))
      .filter((item) => Number.isFinite(item.ts))
      .sort((a, b) => a.ts - b.ts);
    let best = { points: 0, startTs: null, endTs: null, startQso: null, endQso: null };
    let sum = 0;
    let j = 0;
    for (let i = 0; i < data.length; i += 1) {
      sum += data[i].points;
      while (data[i].ts - data[j].ts >= windowMs) {
        sum -= data[j].points;
        j += 1;
      }
      if (sum > best.points) {
        best = {
          points: sum,
          startTs: data[j].ts,
          endTs: data[i].ts,
          startQso: data[j].qsoNumber,
          endQso: data[i].qsoNumber
        };
      }
    }
    return best;
  }

  function renderPointsRatesForData(derived, qsos) {
    if (!derived || !derived.hourPointSeries) return '<p>No points to analyze.</p>';
    const pointsByIndex = getEffectivePointsByIndex(derived, qsos);
    const windows = [10, 20, 30, 60, 120];
    const rows = windows.map((mins, idx) => {
      const peak = computePeakPointsWindow(qsos, pointsByIndex, mins);
      const perMin = peak.points ? (peak.points / mins).toFixed(1) : '0.0';
      const perHour = peak.points ? ((peak.points * 60) / mins).toFixed(1) : '0.0';
      const fromTime = peak.startTs ? formatDateSh6(peak.startTs) : 'N/A';
      const toTime = peak.endTs ? formatDateSh6(peak.endTs) : 'N/A';
      return `
        <div class="rates-row ${idx % 2 === 0 ? 'td1' : 'td0'}">
          <div class="rates-cell"><b>${mins}</b></div>
          <div class="rates-cell">${formatPointValue(peak.points)}</div>
          <div class="rates-cell">${perMin}</div>
          <div class="rates-cell">${perHour}</div>
          <div class="rates-cell">${fromTime}</div>
          <div class="rates-cell">${formatNumberSh6(peak.startQso ?? '')}</div>
          <div class="rates-cell">${toTime}</div>
          <div class="rates-cell">${formatNumberSh6(peak.endQso ?? '')}</div>
        </div>
      `;
    }).join('');
    return `
      <div class="rates-grid rates-grid-points">
        <div class="rates-header thc">
          <div class="rates-cell">Period (min)</div>
          <div class="rates-cell">Points</div>
          <div class="rates-cell">Points / min</div>
          <div class="rates-cell">Points / hour</div>
          <div class="rates-cell">From (time)</div>
          <div class="rates-cell">From (QSO #)</div>
          <div class="rates-cell">To (time)</div>
          <div class="rates-cell">To (QSO #)</div>
        </div>
        ${rows}
      </div>
    `;
  }

  function computePeakWindow(qsos, windowMinutes) {
    const windowMs = windowMinutes * 60000;
    const data = qsos.filter((q) => typeof q.ts === 'number').sort((a, b) => a.ts - b.ts);
    let best = { count: 0, startTs: null, endTs: null, startQso: null, endQso: null };
    let j = 0;
    for (let i = 0; i < data.length; i++) {
      while (data[i].ts - data[j].ts >= windowMs) j += 1;
      const count = i - j + 1;
      if (count > best.count) {
        best = {
          count,
          startTs: data[j].ts,
          endTs: data[i].ts,
          startQso: data[j].qsoNumber,
          endQso: data[i].qsoNumber
        };
      }
    }
    return best;
  }

  function buildMinuteMapFromDerived(derived) {
    const minutesMap = new Map();
    if (!derived || !derived.minuteSeries) return minutesMap;
    derived.minuteSeries.forEach((m) => minutesMap.set(m.minute, m.qsos));
    return minutesMap;
  }

  function buildMinutePointMapFromDerived(derived) {
    const pointsMap = new Map();
    if (!derived || !derived.minutePointSeries) return pointsMap;
    derived.minutePointSeries.forEach((entry) => pointsMap.set(entry.minute, entry.points));
    return pointsMap;
  }

  function getMinuteRangeFromMap(minutesMap) {
    const allMinutes = Array.from(minutesMap.keys());
    if (!allMinutes.length) return null;
    return {
      minMinute: Math.min(...allMinutes),
      maxMinute: Math.max(...allMinutes)
    };
  }

  function renderQsByMinuteTable(minutesMap, startHour, endHour) {
    let lastDay = '';
    let rows = '';
    let rowIndex = 0;
    for (let hour = startHour; hour <= endHour; hour += 1) {
      const ts = hour * 3600000;
      const day = formatDaySh6(ts);
      const dayLabel = day !== lastDay ? day : '';
      lastDay = day;
      let cells = '';
      for (let m = 0; m < 60; m += 1) {
        const minuteBucket = hour * 60 + m;
        const count = minutesMap.get(minuteBucket) || '';
        const cls = minuteCountClass(count);
        const startTs = minuteBucket * 60000;
        const minuteLabel = formatDateSh6(startTs);
        const cellValue = count ? `<a href="#" class="log-minute" data-minute="${minuteBucket}" title="${minuteLabel}">${count}</a>` : '';
        cells += `<td class="${cls}">${cellValue}</td>`;
      }
      const rowCls = rowIndex % 2 === 0 ? 'td1' : 'td0';
      rows += `<tr style="text-align:center;" class="${rowCls}"><td>${dayLabel}</td><td><b>${String(new Date(ts).getUTCHours()).padStart(2, '0')}</b></td>${cells}</tr>`;
      rowIndex += 1;
    }
    return `
      <table class="mtc minute-grid-table" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th rowspan="2">Day</th><th rowspan="2">Hour</th><th colspan="60">Minute</th></tr>
        <tr class="thc">
          <th style="text-align:left" colspan="10">0</th>
          <th style="text-align:left" colspan="10">10</th>
          <th style="text-align:left" colspan="10">20</th>
          <th style="text-align:left" colspan="10">30</th>
          <th style="text-align:left" colspan="10">40</th>
          <th style="text-align:left" colspan="10">50</th>
        </tr>
        ${rows}
      </table>
    `;
  }

  function renderQsByMinute() {
    if (!state.derived || !state.derived.minuteSeries) return renderPlaceholder({ id: 'qs_by_minute', title: 'Qs by minute' });
    const minutesMap = buildMinuteMapFromDerived(state.derived);
    const range = getMinuteRangeFromMap(minutesMap);
    if (!range) return '<p>No QSOs to analyze.</p>';
    const startHour = Math.floor(range.minMinute / 60);
    const endHour = Math.floor(range.maxMinute / 60);
    return renderQsByMinuteTable(minutesMap, startHour, endHour);
  }

  function renderPointsByMinute() {
    if (!state.derived || !state.derived.minutePointSeries) return renderPlaceholder({ id: 'points_by_minute', title: 'Points by minute' });
    const minutesMap = buildMinutePointMapFromDerived(state.derived);
    const range = getMinuteRangeFromMap(minutesMap);
    if (!range) return '<p>No points to analyze.</p>';
    const startHour = Math.floor(range.minMinute / 60);
    const endHour = Math.floor(range.maxMinute / 60);
    return renderQsByMinuteTable(minutesMap, startHour, endHour);
  }

  function renderOneMinuteRates() {
    if (!state.derived || !state.derived.minuteSeries) return renderPlaceholder({ id: 'one_minute_rates', title: 'One minute rates' });
    return renderOneMinuteRatesForDerived(state.derived);
  }

  function renderOneMinutePointRates() {
    if (!state.derived || !state.derived.minutePointSeries) return renderPlaceholder({ id: 'one_minute_point_rates', title: 'One minute point rates' });
    return renderOneMinutePointRatesForDerived(state.derived);
  }

  function renderOneMinuteRatesForDerived(derived) {
    if (!derived || !derived.minuteSeries) return '<p>No QSOs to analyze.</p>';
    const grouped = new Map();
    derived.minuteSeries.forEach((m) => {
      if (!grouped.has(m.qsos)) grouped.set(m.qsos, []);
      grouped.get(m.qsos).push(m.minute);
    });
    const rows = Array.from(grouped.entries()).sort((a, b) => b[0] - a[0]).map(([rate, minutes], idx) => {
      const labels = minutes.map((min) => `<a href="#" class="log-minute" data-minute="${min}">${formatDateSh6(min * 60000)}</a>`).join('');
      return `
        <div class="one-minute-row ${idx % 2 === 0 ? 'td1' : 'td0'}">
          <div class="one-minute-cell one-minute-rate"><b>${rate}</b></div>
          <div class="one-minute-cell minute-list">${labels}</div>
          <div class="one-minute-cell one-minute-total">${formatNumberSh6(minutes.length)}</div>
        </div>
      `;
    }).join('');
    return `
      <div class="one-minute-rates">
        <div class="one-minute-header thc">
          <div class="one-minute-cell one-minute-rate">Qs per<br/>minute</div>
          <div class="one-minute-cell">Minutes list</div>
          <div class="one-minute-cell one-minute-total">Total</div>
        </div>
        ${rows}
      </div>
    `;
  }

  function renderOneMinutePointRatesForDerived(derived) {
    if (!derived || !derived.minutePointSeries) return '<p>No points to analyze.</p>';
    const grouped = new Map();
    derived.minutePointSeries.forEach((m) => {
      const points = Number(m.points) || 0;
      if (!grouped.has(points)) grouped.set(points, []);
      grouped.get(points).push(m.minute);
    });
    const rows = Array.from(grouped.entries()).sort((a, b) => b[0] - a[0]).map(([rate, minutes], idx) => {
      const labels = minutes.map((min) => `<a href="#" class="log-minute" data-minute="${min}">${formatDateSh6(min * 60000)}</a>`).join('');
      return `
        <div class="one-minute-row ${idx % 2 === 0 ? 'td1' : 'td0'}">
          <div class="one-minute-cell one-minute-rate"><b>${formatPointValue(rate)}</b></div>
          <div class="one-minute-cell minute-list">${labels}</div>
          <div class="one-minute-cell one-minute-total">${formatNumberSh6(minutes.length)}</div>
        </div>
      `;
    }).join('');
    return `
      <div class="one-minute-rates">
        <div class="one-minute-header thc">
          <div class="one-minute-cell one-minute-rate">Pts per<br/>minute</div>
          <div class="one-minute-cell">Minutes list</div>
          <div class="one-minute-cell one-minute-total">Total</div>
        </div>
        ${rows}
      </div>
    `;
  }

  function renderOneMinuteRatesCompareAligned() {
    const slots = getActiveCompareSnapshots();
    if (slots.length > 2) {
      const { pair, entries } = resolveFocusEntries('one_minute_rates', slots);
      const htmlBlocks = entries.map((entry) => (
        entry.ready ? renderOneMinuteRatesForDerived(entry.snapshot.derived) : `<p>No ${entry.label} loaded.</p>`
      ));
      const focusControls = renderCompareFocusControls('one_minute_rates', slots, pair);
      return `${focusControls}${renderComparePanels(entries, htmlBlocks, 'one_minute_rates')}`;
    }
    const htmlBlocks = slots.map((entry) => (
      entry.ready ? renderOneMinuteRatesForDerived(entry.snapshot.derived) : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'one_minute_rates');
  }

  function renderOneMinutePointRatesCompareAligned() {
    const slots = getActiveCompareSnapshots();
    if (slots.length > 2) {
      const { pair, entries } = resolveFocusEntries('one_minute_point_rates', slots);
      const htmlBlocks = entries.map((entry) => (
        entry.ready ? renderOneMinutePointRatesForDerived(entry.snapshot.derived) : `<p>No ${entry.label} loaded.</p>`
      ));
      const focusControls = renderCompareFocusControls('one_minute_point_rates', slots, pair);
      return `${focusControls}${renderComparePanels(entries, htmlBlocks, 'one_minute_point_rates')}`;
    }
    const htmlBlocks = slots.map((entry) => (
      entry.ready ? renderOneMinutePointRatesForDerived(entry.snapshot.derived) : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'one_minute_point_rates');
  }

  function renderPointsRatesCompareAligned() {
    const slots = getActiveCompareSnapshots();
    const htmlBlocks = slots.map((entry) => (
      entry.ready
        ? renderPointsRatesForData(entry.snapshot.derived, entry.snapshot.qsoData?.qsos || [])
        : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'points_rates');
  }

  function buildPrefixGroups(derived) {
    const groups = new Map();
    if (!derived || !derived.prefixGroups) return groups;
    if (derived.prefixGroups instanceof Map) {
      derived.prefixGroups.forEach((entry, key) => {
        const prefixes = Array.isArray(entry.prefixes) ? entry.prefixes : Array.from(entry.prefixes || []);
        groups.set(key, { ...entry, prefixes });
      });
      return groups;
    }
    if (Array.isArray(derived.prefixGroups)) {
      derived.prefixGroups.forEach((entry) => {
        const prefixes = Array.isArray(entry.prefixes) ? entry.prefixes : Array.from(entry.prefixes || []);
        groups.set(entry.country, { ...entry, prefixes });
      });
    }
    return groups;
  }

  function buildPrefixListFromGroups(groups) {
    return Array.from(groups.values()).map((g) => ({
      country: g.country,
      continent: g.continent,
      id: g.id
    })).sort((a, b) => {
      const ai = continentOrderIndex(a.continent);
      const bi = continentOrderIndex(b.continent);
      if (ai !== bi) return ai - bi;
      return (a.id || '').localeCompare(b.id || '');
    });
  }

  function mergePrefixLists(listA, listB) {
    const map = new Map();
    listA.forEach((g) => map.set(g.country, { ...g }));
    listB.forEach((g) => {
      if (!map.has(g.country)) {
        map.set(g.country, { ...g });
      } else {
        const existing = map.get(g.country);
        if (!existing.continent) existing.continent = g.continent || '';
        if (!existing.id) existing.id = g.id || '';
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const ai = continentOrderIndex(a.continent);
      const bi = continentOrderIndex(b.continent);
      if (ai !== bi) return ai - bi;
      return (a.id || '').localeCompare(b.id || '');
    });
  }

  function renderPrefixesRowsFromList(list, groups, totalPrefixes) {
    return list.map((info, idx) => {
      const g = groups.get(info.country);
      const count = g ? g.prefixes.length : 0;
      const pct = count && totalPrefixes ? ((count / totalPrefixes) * 100).toFixed(1) : '';
      const listText = g ? g.prefixes
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .join(' ') : '';
      const contText = escapeHtml(info.continent || '');
      const idText = escapeHtml(info.id || '');
      const countryText = escapeHtml(info.country || '');
      const listSafe = escapeHtml(listText);
      return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td>${formatNumberSh6(idx + 1)}</td>
          <td class="${continentClass(info.continent)}">${contText}</td>
          <td>${idText}</td>
          <td class="tl">${countryText}</td>
          <td><b>${count ? formatNumberSh6(count) : ''}</b></td>
          <td><i>${pct}</i></td>
          <td class="tl wrap-cell">${listSafe} </td>
        </tr>
      `;
    }).join('');
  }

  function renderPrefixesTable(rows) {
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;">
        <colgroup><col width="40px" span="3" align="center"/><col width="200px" align="left"/><col span="2" width="40px" align="center"/></colgroup>
        <tr class="thc"><th>#</th><th>Cont.</th><th>ID</th><th>Country</th><th>Count</th><th>% of pfx</th><th>Worked pfx</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderPrefixes() {
    if (!state.derived) return renderPlaceholder({ id: 'prefixes', title: 'Prefixes' });
    if (!state.ctyTable || !state.ctyTable.length) return '<p>cty.dat not loaded.</p>';
    const totalPrefixes = state.derived.prefixSummary.length || 0;
    const groups = buildPrefixGroups(state.derived);
    const list = buildPrefixListFromGroups(groups);
    const rows = renderPrefixesRowsFromList(list, groups, totalPrefixes);
    return renderPrefixesTable(rows);
  }

  function buildCallsignLengthList(derived) {
    if (!derived || !derived.callsignLengthSummary) return [];
    return derived.callsignLengthSummary.map((c) => ({ len: c.len }));
  }

  function mergeCallsignLengthLists(listA, listB) {
    const map = new Map();
    listA.forEach((c) => map.set(c.len, c));
    listB.forEach((c) => {
      if (!map.has(c.len)) map.set(c.len, c);
    });
    return Array.from(map.values()).sort((a, b) => a.len - b.len);
  }

  function buildCallsignLengthMap(derived) {
    const map = new Map();
    if (!derived || !derived.callsignLengthSummary) return map;
    derived.callsignLengthSummary.forEach((c) => map.set(c.len, c));
    return map;
  }

  function renderCallsignLengthRowsFromList(list, derived, totalCalls, totalQsos) {
    const map = buildCallsignLengthMap(derived);
    return list.map((info, idx) => {
      const c = map.get(info.len);
      const callPct = c && totalCalls ? ((c.callsigns / totalCalls) * 100).toFixed(2) : '';
      const qsoPct = c && totalQsos ? ((c.qsos / totalQsos) * 100).toFixed(2) : '';
      const lenAttr = escapeAttr(info.len);
      const callsignLink = c ? `<a href="#" class="log-call-len" data-len="${lenAttr}">${formatNumberSh6(c.callsigns)}</a>` : '';
      const qsoLink = c ? `<a href="#" class="log-call-len" data-len="${lenAttr}">${formatNumberSh6(c.qsos)}</a>` : '';
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${info.len}</td>
        <td>${callsignLink}</td>
        <td>${callPct}</td>
        <td>${qsoLink}</td>
        <td>${qsoPct}</td>
      </tr>
    `}).join('');
  }

  function renderCallsignLengthTable(rows) {
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Length</th><th>Callsigns</th><th>%</th><th>QSOs</th><th>%</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderCallsignLength() {
    if (!state.derived) return renderPlaceholder({ id: 'callsign_length', title: 'Callsign length' });
    const totalCalls = state.derived.uniqueCallsCount || 0;
    const totalQsos = state.qsoData?.qsos.length || 0;
    const list = buildCallsignLengthList(state.derived);
    const rows = renderCallsignLengthRowsFromList(list, state.derived, totalCalls, totalQsos);
    return renderCallsignLengthTable(rows);
  }

  function buildStructureList(derived) {
    if (!derived || !derived.structureSummary) return [];
    return derived.structureSummary.map((s) => ({ struct: s.struct }));
  }

  function mergeStructureLists(listA, listB) {
    const map = new Map();
    listA.forEach((s) => map.set(s.struct, s));
    listB.forEach((s) => {
      if (!map.has(s.struct)) map.set(s.struct, s);
    });
    return Array.from(map.values()).sort((a, b) => a.struct.localeCompare(b.struct));
  }

  function buildStructureMap(derived) {
    const map = new Map();
    if (!derived || !derived.structureSummary) return map;
    derived.structureSummary.forEach((s) => map.set(s.struct, s));
    return map;
  }

  function renderCallsignStructureRowsFromList(list, derived, totalCalls, totalQsos) {
    const map = buildStructureMap(derived);
    return list.map((info, idx) => {
      const s = map.get(info.struct);
      const callPct = s && totalCalls ? ((s.callsigns / totalCalls) * 100).toFixed(2) : '';
      const qsoPct = s && totalQsos ? ((s.qsos / totalQsos) * 100).toFixed(2) : '';
      const structText = escapeHtml(info.struct || '');
      const structAttr = escapeAttr(info.struct || '');
      const exampleText = escapeHtml(s?.example || '');
      const callsignLink = s ? `<a href="#" class="log-call-struct" data-struct="${structAttr}">${formatNumberSh6(s.callsigns)}</a>` : '';
      const qsoLink = s ? `<a href="#" class="log-call-struct" data-struct="${structAttr}">${formatNumberSh6(s.qsos)}</a>` : '';
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${idx + 1}</td>
        <td>${structText}</td>
        <td>${exampleText}</td>
        <td>${callsignLink}</td>
        <td>${callPct}</td>
        <td>${qsoLink}</td>
        <td>${qsoPct}</td>
      </tr>
    `}).join('');
  }

  function renderCallsignStructureTable(rows) {
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Callsign structure, C - char, D - digit</th><th>Example</th><th>Callsigns</th><th>%</th><th>QSOs</th><th>%</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderCallsignStructure() {
    if (!state.derived) return renderPlaceholder({ id: 'callsign_structure', title: 'Callsign structure' });
    const totalCalls = state.derived.uniqueCallsCount || 0;
    const totalQsos = state.qsoData?.qsos.length || 0;
    const list = buildStructureList(state.derived);
    const rows = renderCallsignStructureRowsFromList(list, state.derived, totalCalls, totalQsos);
    return renderCallsignStructureTable(rows);
  }

  function buildDistanceList(derived) {
    if (!derived || !derived.distanceSummary || !derived.distanceSummary.buckets) return [];
    return derived.distanceSummary.buckets.map((b) => ({ range: b.range }));
  }

  function mergeDistanceLists(listA, listB) {
    const map = new Map();
    listA.forEach((d) => map.set(d.range, d));
    listB.forEach((d) => {
      if (!map.has(d.range)) map.set(d.range, d);
    });
    return Array.from(map.values()).sort((a, b) => a.range - b.range);
  }

  function buildDistanceMap(derived) {
    const map = new Map();
    if (!derived || !derived.distanceSummary || !derived.distanceSummary.buckets) return map;
    derived.distanceSummary.buckets.forEach((b) => map.set(b.range, b));
    return map;
  }

  function renderDistanceRowsFromList(list, derived) {
    const ds = derived?.distanceSummary;
    const map = buildDistanceMap(derived);
    const bandCols = getDisplayBandList();
    return list.map((info, idx) => {
      const b = map.get(info.range);
      const pct = b && ds?.count ? ((b.count / ds.count) * 100).toFixed(2) : '';
      const rangeAttr = escapeAttr(info.range);
      const [startStr, endStr] = String(info.range || '').split('-');
      const start = Number(startStr);
      const end = Number(endStr);
      const startAttr = Number.isFinite(start) ? escapeAttr(start) : '';
      const endAttr = Number.isFinite(end) ? escapeAttr(end) : '';
      const mapLink = b ? `<a href="#" class="map-link" data-scope="distance" data-key="${rangeAttr}">map</a>` : '';
      const renderBandCount = (band) => {
        const count = b?.bands?.get(band) || 0;
        if (!count) return '<td></td>';
        const bandAttr = escapeAttr(band || '');
        return `<td><a href="#" class="log-distance" data-start="${startAttr}" data-end="${endAttr}" data-band="${bandAttr}">${formatNumberSh6(count)}</a></td>`;
      };
      const bandCells = bandCols.map((band) => renderBandCount(band)).join('');
      const qsoLink = b ? `<a href="#" class="log-distance" data-start="${startAttr}" data-end="${endAttr}">${formatNumberSh6(b.count)}</a>` : '';
      return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td>${formatNumberSh6(info.range)} km</td>
          ${bandCells}
          <td>${qsoLink}</td>
          <td><i>${pct}</i></td>
          <td class="tac">${mapLink}</td>
        </tr>
      `;
    }).join('');
  }

  function renderDistanceTable(rows) {
    const bandCols = getDisplayBandList();
    const qsoCols = bandCols.length + 1;
    const bandHeaders = bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc">
          <th rowspan="2">Distance, km</th>
          <th colspan="${qsoCols}">QSOs</th>
          <th rowspan="2">%</th>
          <th rowspan="2">Map</th>
        </tr>
        <tr class="thc">${bandHeaders}<th>All</th></tr>
        ${rows}
        ${mapAllFooter(bandCols.length + 4)}
      </table>
    `;
  }

  function renderDistance() {
    if (!state.derived || !state.derived.distanceSummary) return renderPlaceholder({ id: 'distance', title: 'Distance' });
    const ds = state.derived.distanceSummary;
    if (!ds.count) return '<p>No distance data (station or remote locations missing).</p>';
    const list = buildDistanceList(state.derived);
    const rows = renderDistanceRowsFromList(list, state.derived);
    return renderDistanceTable(rows);
  }

  function buildHeadingList(derived) {
    if (!derived || !derived.headingSummary) return [];
    return derived.headingSummary.map((h) => ({ start: h.start, sector: h.sector }));
  }

  function mergeHeadingLists(listA, listB) {
    const map = new Map();
    listA.forEach((h) => map.set(h.start, h));
    listB.forEach((h) => {
      if (!map.has(h.start)) map.set(h.start, h);
    });
    return Array.from(map.values()).sort((a, b) => a.start - b.start);
  }

  function buildHeadingMap(derived) {
    const map = new Map();
    if (!derived || !derived.headingSummary) return map;
    derived.headingSummary.forEach((h) => map.set(h.start, h));
    return map;
  }

  function renderHeadingRowsFromList(list, derived) {
    const bands = getDisplayBandList();
    const map = buildHeadingMap(derived);
    const total = derived?.headingSummary?.reduce((sum, h) => sum + h.count, 0) || 0;
    const maxCount = derived?.headingSummary?.reduce((max, h) => Math.max(max, h.count), 1) || 1;
    const rowColspan = bands.length + 5;
    let rows = '';
    list.forEach((info, idx) => {
      const h = map.get(info.start);
      const pct = h && total ? ((h.count / total) * 100).toFixed(1) : '';
      const headingAttr = escapeAttr(info.start);
      const sectorText = escapeHtml(info.sector || '');
      const bandCells = bands.map((b) => {
        const count = h?.bands?.get(b) || 0;
        if (!count) return '<td></td>';
        return `<td><a href="#" class="log-heading-band" data-heading="${headingAttr}" data-band="${b}">${formatNumberSh6(count)}</a></td>`;
      }).join('');
      const barWidth = h ? Math.round((h.count / maxCount) * 100) : 0;
      const mapLink = h ? `<a href="#" class="map-link" data-scope="heading" data-key="${headingAttr}">map</a>` : '';
      rows += `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td>${sectorText}</td>
          ${bandCells}
          <td>${h ? `<a href="#" class="log-heading" data-heading="${headingAttr}">${formatNumberSh6(h.count)}</a>` : ''}</td>
          <td><i>${pct}</i></td>
          <td style="text-align:left"><div class="sum" style="width:${barWidth}%" /></td>
          <td class="tac">${mapLink}</td>
        </tr>
      `;
      if (info.start % 90 === 80) {
        rows += `<tr><td colspan="${rowColspan}"><hr/></td></tr>`;
      }
    });
    return rows;
  }

  function renderHeadingTable(rows) {
    const bands = getDisplayBandList();
    const qsoCols = bands.length + 1;
    const bandHeaders = bands.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <colgroup><col width="100px" align="center"/><col span="${bands.length + 1}" width="60px"/><col width="56px"/></colgroup>
        <tr class="thc"><th rowspan="2">Heading, &#176;</th><th colspan="${qsoCols}">QSOs</th><th colspan="2" rowspan="2">%</th><th rowspan="2">Map</th></tr>
        <tr class="thc">${bandHeaders}<th>All</th></tr>
        ${rows}
        ${mapAllFooter(bands.length + 5)}
      </table>
    `;
  }

  function renderBeamHeading() {
    if (!state.derived || !state.derived.headingSummary) return renderPlaceholder({ id: 'beam_heading', title: 'Beam heading' });
    const list = buildHeadingList(state.derived);
    const rows = renderHeadingRowsFromList(list, state.derived);
    if (!rows) return '<p>No heading data.</p>';
    return renderHeadingTable(rows);
  }

  function renderMapView() {
    const ctx = state.mapContext || { scope: '', key: '' };
    const displayKey = ctx.scope === 'summary' ? formatBandLabel(ctx.key || '') : (ctx.key || '');
    const title = ctx.scope === 'all'
      ? 'All QSOs'
      : (displayKey ? `${ctx.scope}: ${displayKey}` : ctx.scope || 'Map');
    const safeTitle = escapeHtml(title || 'Map');
    const isFull = document.body && document.body.classList.contains('map-full');
    const fullUrl = buildMapPermalink(ctx.scope, ctx.key, true);
    const fullLink = isFull
      ? ''
      : `<a class="map-full-link" href="${escapeAttr(fullUrl)}" target="_blank" rel="noopener">Open full size</a>`;
    const kmzBands = ['All', ...getAvailableBands(false)];
    const kmzLinks = kmzBands.map((band) => {
      const url = state.kmzUrls?.[band];
      if (!url) return '';
      const label = band === 'All' ? 'all_qsos.kmz' : `qsos_${bandSlug(band)}.kmz`;
      const title = band === 'All' ? 'All QSOs KMZ' : `${formatBandLabel(band)} KMZ`;
      return `<li><a href="${url}" class="kmz-link" data-band="${band}" download="${label}">Download ${title}</a></li>`;
    }).filter(Boolean).join('');
    const kmzBlock = kmzLinks
      ? `<ul>${kmzLinks}</ul>`
      : '';
    const compareSlots = getLoadedCompareSlots();
    const legend = state.compareEnabled && compareSlots.length > 1
      ? `<div class="map-legend">
          ${compareSlots.map((entry) => `<span><i class="map-swatch" style="background:${entry.color};"></i> ${entry.label}</span>`).join('')}
        </div>`
      : '';
    return `
      <div class="mtc map-card">
        <div class="gradient">&nbsp;Map</div>
        <p><b>Selected:</b> ${safeTitle}</p>
        <div class="map-controls">
          <label><input type="checkbox" id="mapShowPoints" checked> Points</label>
          <label style="margin-left:10px;"><input type="checkbox" id="mapShowLines" checked> Lines</label>
        </div>
        ${fullLink ? `<div class="map-actions">${fullLink}</div>` : ''}
        ${legend}
        <div id="map"></div>
        ${kmzBlock}
        <p><button id="mapBack" type="button">Back</button></p>
      </div>
    `;
  }

  function renderAllCallsigns() {
    if (!state.derived) return renderPlaceholder({ id: 'all_callsigns', title: 'All callsigns' });
    const countryFilter = (state.allCallsignsCountryFilter || '').trim().toUpperCase();
    const bandCols = getDisplayBandList();
    let list = state.derived.allCallsList || [];
    if (countryFilter && Array.isArray(state.qsoData?.qsos)) {
      const byCall = new Map();
      state.qsoData.qsos.forEach((q) => {
        if (!q || !q.call) return;
        const qCountry = (q.country || '').trim().toUpperCase();
        if (qCountry !== countryFilter) return;
        const entry = byCall.get(q.call);
        if (entry) {
          entry.qsos += 1;
        } else {
          byCall.set(q.call, { call: q.call, qsos: 0, bandCounts: new Map() });
        }
        const next = byCall.get(q.call);
        next.qsos += 1;
        if (q.band) next.bandCounts.set(q.band, (next.bandCounts.get(q.band) || 0) + 1);
      });
      list = Array.from(byCall.values()).sort((a, b) => a.call.localeCompare(b.call));
    }
    const rows = list.slice(0, 2000).map((c, idx) => {
      const call = escapeHtml(c.call || '');
      const callAttr = escapeAttr(c.call || '');
      const renderBandCell = (band) => {
        const count = c?.bandCounts?.get(band) || 0;
        if (!count) return '<td></td>';
        return `<td><a href="#" class="log-call-band" data-call="${callAttr}" data-band="${escapeAttr(band)}">${formatNumberSh6(count)}</a></td>`;
      };
      const bandCells = bandCols.map((band) => renderBandCell(band)).join('');
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${formatNumberSh6(idx + 1)}</td>
        <td><a href="#" class="log-call" data-call="${callAttr}">${call}</a></td>
        ${bandCells}
        <td><a href="#" class="log-call" data-call="${callAttr}">${formatNumberSh6(c.qsos)}</a></td>
      </tr>
    `;
    }).join('');
    const filterNote = countryFilter
      ? `<p>Country filter: <b>${escapeHtml(countryFilter)}</b> (<a href="#" class="all-calls-clear-country">clear</a>)</p>`
      : '';
    const note = list.length > 2000 ? `<p>Showing first 2000 of ${list.length} calls.</p>` : '';
    const bandHeaders = bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    return `
      ${filterNote}
      ${note}
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Callsign</th>${bandHeaders}<th>All</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderNotInMaster() {
    if (!state.derived) return renderPlaceholder({ id: 'not_in_master', title: 'Not in master' });
    if (!state.masterSet || state.masterSet.size === 0) return '<p>Master file not loaded.</p>';
    const count = state.derived.notInMasterList.length;
    const note = count === 0 ? '<p>All calls found in master.</p>' : '';
    const list = state.derived.notInMasterList || [];
    const pageSize = state.notInMasterPageSize || 500;
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    const page = Math.min(Math.max(0, state.notInMasterPage || 0), totalPages - 1);
    if (page !== state.notInMasterPage) state.notInMasterPage = page;
    const start = page * pageSize;
    const end = Math.min(start + pageSize, list.length);
    const rows = list.slice(start, end).map((c, idx) => {
      const call = escapeHtml(c.call || '');
      const callAttr = escapeAttr(c.call || '');
      const qsos = formatNumberSh6(c.qsos || 0);
      const first = c.firstTs ? formatDateSh6(c.firstTs) : '';
      const last = c.lastTs ? formatDateSh6(c.lastTs) : '';
      return `
      <tr class="${(start + idx) % 2 === 0 ? 'td1' : 'td0'}">
        <td>${formatNumberSh6(start + idx + 1)}</td>
        <td><a href="#" class="log-call" data-call="${callAttr}">${call}</a></td>
        <td>${qsos}</td>
        <td>${first}</td>
        <td>${last}</td>
      </tr>
    `;
    }).join('');
    const nav = list.length > pageSize ? `
      <div class="not-master-controls">
        <button type="button" class="not-master-btn" data-dir="prev" ${page <= 0 ? 'disabled' : ''}>&#9664; Prev ${formatNumberSh6(pageSize)}</button>
        <span>Showing ${formatNumberSh6(start + 1)}-${formatNumberSh6(end)} of ${formatNumberSh6(list.length)}</span>
        <button type="button" class="not-master-btn" data-dir="next" ${page >= totalPages - 1 ? 'disabled' : ''}>Next ${formatNumberSh6(pageSize)} &#9654;</button>
      </div>
    ` : '';
    return `
      <p>Calls not found in MASTER.DTA: ${formatNumberSh6(count)}</p>
      ${note}
      ${nav}
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Callsign</th><th>QSOs</th><th>First</th><th>Last</th></tr>
        ${rows}
      </table>
      ${nav}
    `;
  }

  function renderCountriesByTimeRowsFromList(list, map, countryInfo, bandFilter) {
    const startHour = 0;
    const endHour = 23;
    const groups = new Map();
    list.forEach((info) => {
      const entry = map.get(info.country);
      const infoFromMap = entry || {};
      const mergedCont = (info.continent || infoFromMap.continent || '').trim().toUpperCase();
      const contKey = CONTINENT_ORDER.includes(mergedCont) ? mergedCont : (mergedCont || 'Other');
      const prefix = info.prefixCode || infoFromMap.prefix || (countryInfo.get(info.country)?.prefixCode || '');
      const bucketsByHour = new Map();
      if (entry && entry.buckets) {
        entry.buckets.forEach((counts, hourBucket) => {
          const hourOfDay = hourBucket % 24;
          if (!bucketsByHour.has(hourOfDay)) bucketsByHour.set(hourOfDay, [0, 0, 0, 0]);
          const target = bucketsByHour.get(hourOfDay);
          for (let i = 0; i < 4; i += 1) target[i] += counts[i] || 0;
        });
      }
      const data = {
        name: info.country,
        prefix,
        continent: contKey,
        total: entry ? entry.total : 0,
        buckets: bucketsByHour
      };
      if (!groups.has(contKey)) groups.set(contKey, []);
      groups.get(contKey).push(data);
    });
    let rows = '';
    CONTINENT_ORDER.concat(['Other']).forEach((contKey) => {
      const listForCont = groups.get(contKey);
      if (!listForCont || listForCont.length === 0) return;
      const contAttr = escapeAttr(contKey);
      const contLabel = escapeHtml(continentLabel(contKey));
      const bandLabel = bandFilter ? `${formatBandLabel(bandFilter)} QSOs` : 'All bands QSOs';
      rows += `<tr class="thc"><th colspan="3" class="${continentClass(contKey)}"><a href="#" class="log-continent" data-continent="${contAttr}">${contLabel}</a></th><th>${bandLabel}</th>${hourHeaders(startHour, endHour).join('')}</tr>`;
      rows += listForCont.map((entry, idx) => {
        let cells = '';
        for (let h = startHour; h <= endHour; h += 1) {
          const counts = entry.buckets.get(h) || [0, 0, 0, 0];
          counts.forEach((count, qi) => {
            const cls = minuteCountClass(count);
            const dal = qi === 0 ? 'dal' : '';
            cells += `<td class="${dal} ${cls}"></td>`;
          });
        }
        const rowCls = idx % 2 === 0 ? 'td1' : 'td0';
        const totalCell = entry.total ? formatNumberSh6(entry.total) : '';
        const prefixText = escapeHtml(entry.prefix || '');
        const countryText = escapeHtml(entry.name || '');
        const countryAttr = escapeAttr(entry.name || '');
        const countryLabel = entry.total ? `<a href=\"#\" class=\"log-country\" data-country=\"${countryAttr}\">${countryText}</a>` : countryText;
        return `
          <tr class="${rowCls}">
            <td>${formatNumberSh6(idx + 1)}</td>
            <td>${prefixText}</td>
            <td>${countryLabel}</td>
            <td>${totalCell}</td>
            ${cells}
          </tr>
        `;
      }).join('');
    });
    return rows;
  }

  function renderCountriesByTimeTable(rows) {
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;">
        <tr><td colspan="4">Legend (QSOs per each 15 min. period) :</td>
          <td colspan="4" class="s0"></td><td colspan="4">1</td>
          <td colspan="4" class="s1"></td><td colspan="4">2</td>
          <td colspan="4" class="s2"></td><td colspan="4">3</td>
          <td colspan="4" class="s3"></td><td colspan="4">4</td>
          <td colspan="4" class="s4"></td><td colspan="4">5</td>
          <td colspan="4" class="s5"></td><td colspan="4">6</td>
          <td colspan="4" class="s6"></td><td colspan="4">7</td>
          <td colspan="4" class="s7"></td><td colspan="4">8</td>
          <td colspan="4" class="s8"></td><td colspan="4">9</td>
          <td colspan="4" class="s9"></td><td colspan="4">10</td>
          <td colspan="16"> and more</td>
        </tr>
        <tr><td colspan="100">&nbsp;</td></tr>
        ${rows || '<tr><td colspan="100">No country rows available.</td></tr>'}
      </table>
    `;
  }

  function renderCountriesByTime(bandFilter) {
    if (!state.derived) return renderPlaceholder({ id: 'countries_by_time', title: 'Countries by time' });
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    const qsos = state.qsoData?.qsos || [];
    const map = buildCountryTimeBuckets(qsos, bandKey);
    if (map.size === 0) return '<p>No data.</p>';
    const countryInfo = new Map();
    state.derived.countrySummary.forEach((c) => {
      countryInfo.set(c.country, { continent: c.continent, prefixCode: c.prefixCode });
    });
    const list = buildCountryListFromDerived(state.derived);
    const rows = renderCountriesByTimeRowsFromList(list, map, countryInfo, bandKey);
    return renderCountriesByTimeTable(rows);
  }

  function hourHeaders(startHour, endHour) {
    const headers = [];
    for (let h = startHour; h <= endHour; h++) {
      const label = String(h % 24).padStart(2, '0');
      headers.push(`<th colspan="4">${label}</th>`);
    }
    return headers;
  }

  function buildCallSet(qsos) {
    const set = new Set();
    (qsos || []).forEach((q) => {
      const call = normalizeCall(q.call || '');
      if (call) set.add(call);
    });
    return set;
  }

  function filterPossibleErrors(list, excludeSet) {
    if (!excludeSet || excludeSet.size === 0) return list;
    return list.filter((e) => {
      const call = normalizeCall(e.q?.call || '');
      if (!call) return true;
      return !excludeSet.has(call);
    });
  }

  function renderPossibleErrorsFrom(derived, excludeSet, noteText) {
    if (!derived) return renderPlaceholder({ id: 'possible_errors', title: 'Possible errors' });
    if (!derived.possibleErrors || !derived.possibleErrors.length) return '<p>No possible errors detected.</p>';
    const filtered = filterPossibleErrors(derived.possibleErrors, excludeSet);
    const note = noteText ? `<p class="log-filter-note">${escapeHtml(noteText)}</p>` : '';
    if (!filtered.length) return `${note}<p>No possible errors detected.</p>`;
    const byCall = new Map();
    filtered.forEach((e) => {
      const callRaw = e.q?.call || '';
      const key = normalizeCall(callRaw) || '__missing__';
      if (!byCall.has(key)) {
        byCall.set(key, { callRaw, q: e.q, reason: e.reason });
      }
    });
    const rowsData = Array.from(byCall.values()).map((entry) => {
      const callCount = Number.isFinite(entry.q?.callCount) ? entry.q.callCount : 0;
      return { ...entry, callCount };
    }).sort((a, b) => {
      if (b.callCount !== a.callCount) return b.callCount - a.callCount;
      return String(a.callRaw || '').localeCompare(String(b.callRaw || ''));
    });
    if (!rowsData.length) return `${note}<p>No possible errors detected.</p>`;
    const rows = rowsData.map((e, idx) => {
      const callRaw = e.callRaw || '';
      const callCount = Number.isFinite(e.callCount) && e.callCount > 0 ? formatNumberSh6(e.callCount) : '';
      const suggRaw = callRaw ? suggestMasterMatches(callRaw, state.masterSet, 5).join(' ') : e.reason;
      const call = escapeHtml(callRaw);
      const callAttr = escapeAttr(callRaw);
      const sugg = escapeHtml(suggRaw || '');
      return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td>${idx + 1}</td>
          <td>${call ? `<a href="#" class="log-call" data-call="${callAttr}">${call}</a>` : ''}</td>
          <td>${callCount}</td>
          <td class="wrap-cell">${sugg}</td>
        </tr>
      `;
    }).join('');
    return `
      ${note}
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Callsign in log</th><th>QSOs</th><th>Callsign(s) in master database</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderPossibleErrors() {
    return renderPossibleErrorsFrom(state.derived, null, '');
  }

  function renderComments() {
    if (!state.derived) return renderPlaceholder({ id: 'comments', title: 'Comments' });
    if (!state.derived.comments || !state.derived.comments.length) return '<p>No comments found in log.</p>';
    const items = state.derived.comments.map((c) => `<li>${escapeHtml(c)}</li>`).join('');
    return `<ul>${items}</ul>`;
  }

  function renderFieldsMap() {
    if (!state.derived) return renderPlaceholder({ id: 'fields_map', title: 'Fields map' });
    if (!state.derived.fieldsSummary || !state.derived.fieldsSummary.length) return '<p>No grid fields found.</p>';
    const max = Math.max(...state.derived.fieldsSummary.map((f) => f.count), 1);
    const counts = new Map(state.derived.fieldsSummary.map((f) => [f.field, f.count]));
    const letters = 'ABCDEFGHIJKLMNOPQR'.split('');
    let rows = '';
    for (let r = letters.length - 1; r >= 0; r--) {
      const rowLetter = letters[r];
      let cells = '';
      letters.forEach((colLetter) => {
        const field = `${colLetter}${rowLetter}`;
        const count = counts.get(field) || 0;
        const alpha = count ? Math.min(0.3, count / max * 0.3) : 0;
        const style = count ? `style="border:1px solid #000000;background-color:rgba(0,0,255,${alpha.toFixed(3)})"` : '';
        const labelStyle = count ? '' : 'style="color:#dddddd;"';
        const sup = count ? ` <sup><b>${count}</b></sup>` : '';
        cells += `<td class="lm" ${style}><a href="#" class="field-cell" data-field="${field}"><span ${labelStyle}>${field}</span>${sup}</a></td>`;
      });
      rows += `<tr>${cells}</tr>`;
    }
    const coverage = `${state.derived.fieldsSummary.length} fields`;
    return `
      <p>Fields coverage: ${coverage}</p>
      <table class="fields-map">
        ${rows}
      </table>
    `;
  }

  function renderKmzFiles() {
    const kmzBands = ['All', ...getAvailableBands(false)];
    const urls = buildKmzUrls(kmzBands);
    const rows = kmzBands.map((b, idx) => {
      const url = urls[b];
      const label = b === 'All' ? 'all_qsos.kmz' : `qsos_${bandSlug(b)}.kmz`;
      return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td>${escapeHtml(formatBandLabel(b))}</td>
          <td>${url ? `<a href="${url}" download="${label}">${label}</a>` : label}</td>
        </tr>
      `;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Band</th><th>KMZ file</th></tr>
        ${rows}
      </table>
    `;
  }

  function buildKmzUrls(bands) {
    const urls = {};
    if (!state.kmzUrls) state.kmzUrls = {};
    const qsos = state.qsoData?.qsos || [];
    bands.forEach((band) => {
      if (state.kmzUrls[band]) {
        urls[band] = state.kmzUrls[band];
        return;
      }
      const kml = buildKmlForBand(qsos, band === 'All' ? null : band);
      if (!kml) return;
      const filename = band === 'All' ? 'all_qsos.kml' : `${bandSlug(band)}.kml`;
      const kmz = buildKmzFromKml(filename, kml);
      const blob = new Blob([kmz], { type: 'application/vnd.google-earth.kmz' });
      const url = URL.createObjectURL(blob);
      state.kmzUrls[band] = url;
      urls[band] = url;
    });
    return urls;
  }

  function filterQsosForMap(ctx, dataState = state) {
    let qsos = dataState.qsoData?.qsos || [];
    if (!ctx) return qsos;
    const scope = ctx.scope || '';
    const key = ctx.key || '';
    if (scope === 'all') return qsos;
    if (scope === 'country' && key) {
      qsos = qsos.filter((q) => q.country === key);
    } else if (scope === 'continent' && key) {
      qsos = qsos.filter((q) => q.continent === key);
    } else if (scope === 'cq_zone' && key) {
      qsos = qsos.filter((q) => String(q.cqZone || '') === String(key));
    } else if (scope === 'itu_zone' && key) {
      qsos = qsos.filter((q) => String(q.ituZone || '') === String(key));
    } else if (scope === 'summary') {
      if (key && key !== 'All') {
        qsos = qsos.filter((q) => q.band === key);
      }
    } else if (scope === 'distance' && key) {
      const [startStr, endStr] = String(key).split('-');
      const start = Number(startStr);
      const end = Number(endStr);
      if (Number.isFinite(start) && Number.isFinite(end)) {
        qsos = qsos.filter((q) => Number.isFinite(q.distance) && q.distance >= start && q.distance <= end);
      }
    } else if (scope === 'heading' && key) {
      const start = Number(key);
      if (Number.isFinite(start)) {
        qsos = qsos.filter((q) => Number.isFinite(q.bearing) && q.bearing >= start && q.bearing <= start + 9);
      }
    }
    return qsos;
  }

  function showMapView(scope, key) {
    state.mapContext = { scope: scope || '', key: key || '' };
    state.mapViewActive = true;
    document.body.classList.add('map-view');
    updateNavHighlight();
    dom.viewTitle.textContent = 'Map';
    dom.viewContainer.innerHTML = renderMapView();
    bindReportInteractions('map_view');
  }

  function initLeafletMap(ctx) {
    if (!window.L) return;
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    if (state.leafletMap) {
      state.leafletMap.remove();
      state.leafletMap = null;
    }
    mapEl.innerHTML = '';
    const map = L.map(mapEl, { worldCopyJump: true });
    state.leafletMap = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 6,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const showPoints = document.getElementById('mapShowPoints');
    const showLines = document.getElementById('mapShowLines');

    const markerLayer = L.layerGroup();
    const lineLayer = L.layerGroup();
    const allLatLngs = [];
    const loadedCompareSlots = getLoadedCompareSlots();
    const slots = state.compareEnabled && loadedCompareSlots.length > 1
      ? loadedCompareSlots.map((entry) => ({
        label: entry.label,
        color: entry.color,
        state: entry.slot
      }))
      : [
        { label: '', color: '#cc0000', state: state }
      ];

    const MAX_MAP_POINTS = 2500;
    const MAX_MAP_LINES = 1500;
    const sampleArray = (arr, max) => {
      if (arr.length <= max) return arr;
      const step = Math.ceil(arr.length / max);
      const out = [];
      for (let i = 0; i < arr.length; i += step) out.push(arr[i]);
      return out;
    };

    slots.forEach((slot) => {
      const station = slot.state.derived?.station;
      const qsos = filterQsosForMap(ctx, slot.state);
      const pointQsos = sampleArray(qsos, MAX_MAP_POINTS);
      const lineQsos = sampleArray(qsos, MAX_MAP_LINES);
      if (station && station.lat != null && station.lon != null) {
        const stationLabel = slot.label ? ` ${slot.label}` : '';
        const stationMarker = L.circleMarker([station.lat, station.lon], {
          radius: 6,
          color: slot.color,
          fillColor: slot.color,
          fillOpacity: 0.9
        });
        stationMarker.bindPopup(`Station${stationLabel}: ${escapeHtml(slot.state.derived?.contestMeta?.stationCallsign || '')}`);
        markerLayer.addLayer(stationMarker);
        allLatLngs.push(stationMarker.getLatLng());
      }
      pointQsos.forEach((q) => {
        const prefix = lookupPrefix(q.call);
        const remote = deriveRemoteLatLon(q, prefix);
        if (!remote) return;
        const marker = L.circleMarker([remote.lat, remote.lon], { radius: 3, color: slot.color, fillColor: slot.color, fillOpacity: 0.7 });
        marker.bindPopup(`${escapeHtml(q.call || '')} ${escapeHtml(formatBandLabel(q.band || ''))} ${escapeHtml(q.mode || '')}`);
        markerLayer.addLayer(marker);
        allLatLngs.push(marker.getLatLng());
      });
      lineQsos.forEach((q) => {
        if (!station || station.lat == null || station.lon == null) return;
        const prefix = lookupPrefix(q.call);
        const remote = deriveRemoteLatLon(q, prefix);
        if (!remote) return;
        if (station && station.lat != null && station.lon != null) {
          const distance = haversineKm(station.lat, station.lon, remote.lat, remote.lon);
          const segments = Math.min(64, Math.max(8, Math.round(distance / 400)));
          const linePoints = greatCirclePoints(station.lat, station.lon, remote.lat, remote.lon, segments);
          const line = L.polyline(linePoints, { color: slot.color, weight: 1, opacity: 0.5 });
          lineLayer.addLayer(line);
        }
      });
    });

    if (showPoints && showPoints.checked) markerLayer.addTo(map);
    if (showLines && showLines.checked) lineLayer.addTo(map);

    if (allLatLngs.length) {
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds.pad(0.2));
    } else {
      map.setView([20, 0], 2);
    }

    if (showPoints) {
      showPoints.onchange = () => {
        if (showPoints.checked) markerLayer.addTo(map);
        else map.removeLayer(markerLayer);
      };
    }
    if (showLines) {
      showLines.onchange = () => {
        if (showLines.checked) lineLayer.addTo(map);
        else map.removeLayer(lineLayer);
      };
    }
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }

  function buildKmlForBand(qsos, band) {
    if (!qsos || qsos.length === 0) return null;
    const isAll = !band || String(band).toLowerCase() === 'all';
    const placemarks = [];
    const station = state.derived?.station;
    if (station && station.lat != null && station.lon != null) {
      placemarks.push(`
        <Placemark>
          <name>Station</name>
          <Point><coordinates>${station.lon},${station.lat},0</coordinates></Point>
        </Placemark>
      `);
    }
    qsos.forEach((q) => {
      if (!isAll && band && q.band !== band) return;
      const prefix = lookupPrefix(q.call);
      const remote = deriveRemoteLatLon(q, prefix);
      if (!remote) return;
      const name = escapeXml(q.call || 'QSO');
      const desc = escapeXml(`${q.ts ? formatDateSh6(q.ts) : q.time} ${formatBandLabel(q.band || '')} ${q.mode || ''}`);
      placemarks.push(`
        <Placemark>
          <name>${name}</name>
          <description>${desc}</description>
          <Point><coordinates>${remote.lon},${remote.lat},0</coordinates></Point>
        </Placemark>
      `);
    });
    if (!placemarks.length) return null;
    const title = isAll ? 'All QSOs' : `${formatBandLabel(band)} QSOs`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(title)}</name>
    ${placemarks.join('')}
  </Document>
</kml>`;
  }

  function crc32(buf) {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  const CRC32_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c >>> 0;
    }
    return table;
  })();

  function buildKmzFromKml(filename, kmlText) {
    const encoder = new TextEncoder();
    const data = encoder.encode(kmlText);
    const name = encoder.encode(filename);
    const crc = crc32(data);
    const localHeader = new Uint8Array(30 + name.length);
    const dv1 = new DataView(localHeader.buffer);
    dv1.setUint32(0, 0x04034b50, true);
    dv1.setUint16(4, 20, true);
    dv1.setUint16(6, 0, true);
    dv1.setUint16(8, 0, true);
    dv1.setUint16(10, 0, true);
    dv1.setUint16(12, 0, true);
    dv1.setUint32(14, crc, true);
    dv1.setUint32(18, data.length, true);
    dv1.setUint32(22, data.length, true);
    dv1.setUint16(26, name.length, true);
    dv1.setUint16(28, 0, true);
    localHeader.set(name, 30);

    const centralHeader = new Uint8Array(46 + name.length);
    const dv2 = new DataView(centralHeader.buffer);
    dv2.setUint32(0, 0x02014b50, true);
    dv2.setUint16(4, 20, true);
    dv2.setUint16(6, 20, true);
    dv2.setUint16(8, 0, true);
    dv2.setUint16(10, 0, true);
    dv2.setUint16(12, 0, true);
    dv2.setUint16(14, 0, true);
    dv2.setUint32(16, crc, true);
    dv2.setUint32(20, data.length, true);
    dv2.setUint32(24, data.length, true);
    dv2.setUint16(28, name.length, true);
    dv2.setUint16(30, 0, true);
    dv2.setUint16(32, 0, true);
    dv2.setUint16(34, 0, true);
    dv2.setUint16(36, 0, true);
    dv2.setUint32(38, 0, true);
    dv2.setUint32(42, 0, true);
    centralHeader.set(name, 46);

    const end = new Uint8Array(22);
    const dv3 = new DataView(end.buffer);
    dv3.setUint32(0, 0x06054b50, true);
    dv3.setUint16(4, 0, true);
    dv3.setUint16(6, 0, true);
    dv3.setUint16(8, 1, true);
    dv3.setUint16(10, 1, true);
    dv3.setUint32(12, centralHeader.length, true);
    dv3.setUint32(16, localHeader.length + data.length, true);
    dv3.setUint16(20, 0, true);

    const total = localHeader.length + data.length + centralHeader.length + end.length;
    const out = new Uint8Array(total);
    let offset = 0;
    out.set(localHeader, offset); offset += localHeader.length;
    out.set(data, offset); offset += data.length;
    out.set(centralHeader, offset); offset += centralHeader.length;
    out.set(end, offset);
    return out;
  }

  function buildPassedQsoSet(qsos, windowMinutes) {
    const windowMs = Math.max(1, Number(windowMinutes) || 10) * 60000;
    const byCall = new Map();
    qsos.forEach((q, idx) => {
      const call = (q.call || '').trim().toUpperCase();
      const band = (q.band || '').trim();
      if (!call || !band || !Number.isFinite(q.ts)) return;
      if (!byCall.has(call)) byCall.set(call, []);
      byCall.get(call).push({ idx, ts: q.ts, band });
    });
    const passed = new Set();
    byCall.forEach((list) => {
      if (list.length < 2) return;
      list.sort((a, b) => a.ts - b.ts);
      let l = 0;
      let r = 0;
      const bandCounts = new Map();
      const addBand = (band) => {
        bandCounts.set(band, (bandCounts.get(band) || 0) + 1);
      };
      const removeBand = (band) => {
        const next = (bandCounts.get(band) || 0) - 1;
        if (next <= 0) bandCounts.delete(band);
        else bandCounts.set(band, next);
      };
      for (let i = 0; i < list.length; i += 1) {
        const currentTs = list[i].ts;
        while (r < list.length && list[r].ts - currentTs <= windowMs) {
          addBand(list[r].band);
          r += 1;
        }
        while (currentTs - list[l].ts > windowMs) {
          removeBand(list[l].band);
          l += 1;
        }
        if (bandCounts.size > 1) {
          passed.add(list[i].idx);
        }
      }
    });
    return passed;
  }

  function renderPassedQsosForList(qsos, options = {}) {
    const windowMinutes = Math.max(1, Number(state.passedQsoWindow) || 10);
    const passedSet = buildPassedQsoSet(qsos, windowMinutes);
    const passed = qsos.filter((_, idx) => passedSet.has(idx));
    const showControls = options.showControls !== false;
    const slider = showControls ? `
      <div class="break-controls passed-controls">
        Passed window (minutes):
        <input type="range" class="passed-window" min="1" max="60" step="1" value="${windowMinutes}">
        <span class="passed-window-value">${windowMinutes}</span>
      </div>
      <p>A passed QSO is a callsign worked on another band within ${windowMinutes} minutes.</p>
    ` : '';
    if (!passed.length) return `${slider}<p>No passed QSOs detected.</p>`;
    const rows = passed.map((q, idx) => {
      const number = q.qsoNumber || '';
      const numberAttr = escapeAttr(number);
      const numberCell = number ? `<a href="#" class="log-range" data-start="${numberAttr}" data-end="${numberAttr}">${formatNumberSh6(number)}</a>` : '';
      const time = escapeHtml(q.time || '');
      const call = escapeHtml(q.call || '');
      const callAttr = escapeAttr(q.call || '');
      const band = escapeHtml(formatBandLabel(q.band || ''));
      const mode = escapeHtml(q.mode || '');
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${numberCell}</td>
        <td>${q.ts ? formatDateSh6(q.ts) : time}</td>
        <td><a href="#" class="log-call" data-call="${callAttr}">${call}</a></td>
        <td class="${bandClass(q.band)}">${band}</td>
        <td class="${modeClass(q.mode)}">${mode}</td>
      </tr>
    `;
    }).join('');
    return `
      ${slider}
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Time</th><th>Call</th><th>Band</th><th>Mode</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderPassedQsos() {
    return renderPassedQsosForList(state.qsoData?.qsos || [], { showControls: true });
  }

  function renderAppInfo() {
    const perfSummary = getRenderPerfSummary();
    const lastRender = perfSummary.last;
    const hotspot = perfSummary.hotspot;
    const reportTitleForId = (reportId) => {
      const hit = reports.find((entry) => entry.id === reportId);
      return hit?.title || reportId || 'N/A';
    };
    const lastRenderText = lastRender
      ? `${reportTitleForId(lastRender.reportId)} · ${Number(lastRender.ms).toFixed(1)} ms`
      : 'N/A';
    const hotspotText = hotspot
      ? `${reportTitleForId(perfSummary.hotspotId)} · max ${Number(hotspot.maxMs).toFixed(1)} ms · avg ${Number(hotspot.avgMs || 0).toFixed(1)} ms`
      : 'N/A';
    const rows = [
      ['Report generator', `SH6 ${APP_VERSION}`],
      ['Generated', formatDateSh6(Date.now())],
      ['Log file', escapeHtml(state.logFile ? state.logFile.name : 'N/A')],
      ['QSOs parsed', state.qsoData ? formatNumberSh6(state.qsoData.qsos.length) : '0'],
      ['Event', escapeHtml(state.derived?.contestMeta?.contestId || 'N/A')],
      ['Station callsign', escapeHtml(state.derived?.contestMeta?.stationCallsign || 'N/A')],
      ['Render (last)', escapeHtml(lastRenderText)],
      ['Render hotspot', escapeHtml(hotspotText)],
      ['cty.dat', escapeHtml(state.ctyStatus || 'pending')],
      ['MASTER.DTA', escapeHtml(state.masterStatus || 'pending')]
    ];
    const cards = `
      <div class="appinfo-grid">
        <article class="appinfo-card">
          <h4>Build</h4>
          <p><b>Version:</b> ${escapeHtml(APP_VERSION)}</p>
          <p><b>Generated:</b> ${escapeHtml(formatDateSh6(Date.now()))}</p>
        </article>
        <article class="appinfo-card">
          <h4>Loaded log</h4>
          <p><b>File:</b> ${escapeHtml(state.logFile ? state.logFile.name : 'N/A')}</p>
          <p><b>QSOs:</b> ${state.qsoData ? formatNumberSh6(state.qsoData.qsos.length) : '0'}</p>
        </article>
        <article class="appinfo-card">
          <h4>Performance</h4>
          <p><b>Last render:</b> ${escapeHtml(lastRenderText)}</p>
          <p><b>Hotspot:</b> ${escapeHtml(hotspotText)}</p>
        </article>
        <article class="appinfo-card">
          <h4>Data files</h4>
          <p><b>cty.dat:</b> ${escapeHtml(state.ctyStatus || 'pending')}</p>
          <p><b>MASTER.DTA:</b> ${escapeHtml(state.masterStatus || 'pending')}</p>
        </article>
      </div>
    `;
    const rowHtml = rows.map(([label, value], idx) => `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}"><td>${label}</td><td>${value}</td></tr>
    `).join('');
    return `
      ${cards}
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;">
        <tr class="thc"><th>Parameter</th><th>Value</th></tr>
        ${rowHtml}
      </table>
    `;
  }

  function renderBars(data, labelField, valueField, maxOverride, options = {}) {
    const values = data.map((d) => Number(d[valueField]) || 0);
    const computedMax = Math.max(...values, 1);
    const max = Number.isFinite(maxOverride) && maxOverride > 0
      ? Math.max(maxOverride, computedMax)
      : computedMax;
    const valueTextField = String(options.valueTextField || '').trim();
    const barClass = String(options.barClass || '').trim();
    return data.map((d) => {
      const value = Number(d[valueField]) || 0;
      const w = value > 0 ? Math.max(4, (value / max) * 200) : 0;
      const label = escapeHtml(d[labelField] ?? '');
      const labelAttr = escapeAttr(d[labelField] ?? '');
      const valueRaw = valueTextField ? d[valueTextField] : d[valueField];
      const valueText = escapeHtml(valueRaw ?? '');
      return `
        <div class="bar-row">
          <div class="bar-label" title="${labelAttr}">${label}</div>
          <div class="bar-track"><div class="bar${barClass ? ` ${barClass}` : ''}" style="width:${w}px"></div></div>
          <div class="bar-value">${valueText}</div>
        </div>
      `;
    }).join('');
  }

  function renderChartModeControls(reportId, mode) {
    const normalizedMode = normalizeChartMetricMode(mode);
    return `
      <div class="chart-mode-controls" role="group" aria-label="Chart metric mode">
        <span class="chart-mode-label">Metric view</span>
        <button type="button" class="chart-mode-btn${normalizedMode === CHART_MODE_ABSOLUTE ? ' active' : ''}" data-chart-mode="${CHART_MODE_ABSOLUTE}" data-chart-report="${escapeAttr(reportId)}" aria-pressed="${normalizedMode === CHART_MODE_ABSOLUTE ? 'true' : 'false'}">Absolute</button>
        <button type="button" class="chart-mode-btn${normalizedMode === CHART_MODE_NORMALIZED ? ' active' : ''}" data-chart-mode="${CHART_MODE_NORMALIZED}" data-chart-report="${escapeAttr(reportId)}" aria-pressed="${normalizedMode === CHART_MODE_NORMALIZED ? 'true' : 'false'}">Normalized %</button>
      </div>
    `;
  }

  function resolveChartRowsWithMetric(data, valueField, mode, totalOverride = null) {
    const list = Array.isArray(data) ? data : [];
    const metricMode = normalizeChartMetricMode(mode);
    const derivedTotal = Number(totalOverride);
    const total = Number.isFinite(derivedTotal) && derivedTotal > 0
      ? derivedTotal
      : list.reduce((sum, row) => sum + (Number(row?.[valueField]) || 0), 0);
    return list.map((row) => {
      const raw = Number(row?.[valueField]) || 0;
      if (metricMode === CHART_MODE_NORMALIZED) {
        const pct = total > 0 ? (raw / total) * 100 : 0;
        return {
          ...row,
          chartValue: pct,
          chartText: `${pct.toFixed(1)}% (${formatNumberSh6(raw)})`
        };
      }
      return {
        ...row,
        chartValue: raw,
        chartText: formatNumberSh6(raw)
      };
    });
  }

  function resolveDerivedQsoTotal(derived) {
    const bandSummary = Array.isArray(derived?.bandSummary) ? derived.bandSummary : [];
    const sum = bandSummary.reduce((total, row) => total + (Number(row?.qsos) || 0), 0);
    if (sum > 0) return sum;
    return 0;
  }

  function renderChartsIndex() {
    return `
      <p>Select a chart from the sidebar (Qs by band, Top countries, Continents, Frequencies, Beam heading, Beam heading by hour).</p>
    `;
  }

  function buildChartQsByBandData(derived) {
    if (!derived || !derived.bandSummary) return [];
    return derived.bandSummary.map((b) => ({ ...b, bandLabel: formatBandLabel(b.band) }));
  }

  function renderChartQsByBandForDerived(derived, maxOverride, mode = CHART_MODE_ABSOLUTE) {
    if (!derived) return '<p>No data.</p>';
    const data = buildChartQsByBandData(derived);
    const metricRows = resolveChartRowsWithMetric(data, 'qsos', mode, resolveDerivedQsoTotal(derived));
    const maxForMode = normalizeChartMetricMode(mode) === CHART_MODE_NORMALIZED ? 100 : maxOverride;
    return `<div class="mtc chart-card"><div class="gradient">&nbsp;Qs by band</div>${renderBars(metricRows, 'bandLabel', 'chartValue', maxForMode, { valueTextField: 'chartText', barClass: 'chart-bar' })}</div>`;
  }

  function renderChartQsByBand() {
    if (!state.derived) return renderPlaceholder({ id: 'charts_qs_by_band', title: 'Qs by band' });
    const mode = normalizeChartMetricMode(state.chartMetricMode);
    return `${renderChartModeControls('charts_qs_by_band', mode)}${renderChartQsByBandForDerived(state.derived, null, mode)}`;
  }

  function buildChartTop10CountriesData(derived) {
    if (!derived || !derived.countrySummary) return [];
    return derived.countrySummary.slice().sort((a, b) => (b.qsos || 0) - (a.qsos || 0)).slice(0, 10);
  }

  function renderChartTop10CountriesForDerived(derived, maxOverride, mode = CHART_MODE_ABSOLUTE) {
    if (!derived) return '<p>No data.</p>';
    const top = buildChartTop10CountriesData(derived);
    const metricRows = resolveChartRowsWithMetric(top, 'qsos', mode, resolveDerivedQsoTotal(derived));
    const maxForMode = normalizeChartMetricMode(mode) === CHART_MODE_NORMALIZED ? 100 : maxOverride;
    return `<div class="mtc chart-card"><div class="gradient">&nbsp;Top 10 countries</div>${renderBars(metricRows, 'country', 'chartValue', maxForMode, { valueTextField: 'chartText', barClass: 'chart-bar' })}</div>`;
  }

  function renderChartTop10Countries() {
    if (!state.derived) return renderPlaceholder({ id: 'charts_top_10_countries', title: 'Top 10 countries' });
    const mode = normalizeChartMetricMode(state.chartMetricMode);
    return `${renderChartModeControls('charts_top_10_countries', mode)}${renderChartTop10CountriesForDerived(state.derived, null, mode)}`;
  }

  function buildChartContinentsData(derived) {
    if (!derived || !derived.continentSummary) return [];
    return derived.continentSummary;
  }

  function renderChartContinentsForDerived(derived, maxOverride, mode = CHART_MODE_ABSOLUTE) {
    if (!derived) return '<p>No data.</p>';
    const metricRows = resolveChartRowsWithMetric(buildChartContinentsData(derived), 'qsos', mode, resolveDerivedQsoTotal(derived));
    const maxForMode = normalizeChartMetricMode(mode) === CHART_MODE_NORMALIZED ? 100 : maxOverride;
    return `<div class="mtc chart-card"><div class="gradient">&nbsp;Continents</div>${renderBars(metricRows, 'continent', 'chartValue', maxForMode, { valueTextField: 'chartText', barClass: 'chart-bar' })}</div>`;
  }

  function renderChartContinents() {
    if (!state.derived) return renderPlaceholder({ id: 'charts_continents', title: 'Continents chart' });
    const mode = normalizeChartMetricMode(state.chartMetricMode);
    return `${renderChartModeControls('charts_continents', mode)}${renderChartContinentsForDerived(state.derived, null, mode)}`;
  }

  function renderChartQsByBandCompareAligned() {
    const mode = normalizeChartMetricMode(state.chartMetricMode);
    const slots = getActiveCompareSnapshots();
    const dataSets = slots.map((entry) => buildChartQsByBandData(entry.snapshot.derived));
    const maxValue = mode === CHART_MODE_NORMALIZED
      ? 100
      : Math.max(1, ...dataSets.flat().map((d) => Number(d.qsos) || 0));
    const htmlBlocks = slots.map((entry) => (
      entry.ready ? renderChartQsByBandForDerived(entry.snapshot.derived, maxValue, mode) : `<p>No ${entry.label} loaded.</p>`
    ));
    return `${renderChartModeControls('charts_qs_by_band', mode)}${renderComparePanels(slots, htmlBlocks, 'charts_qs_by_band', { chart: true })}`;
  }

  function renderChartTop10CountriesCompareAligned() {
    const mode = normalizeChartMetricMode(state.chartMetricMode);
    const slots = getActiveCompareSnapshots();
    const dataSets = slots.map((entry) => buildChartTop10CountriesData(entry.snapshot.derived));
    const maxValue = mode === CHART_MODE_NORMALIZED
      ? 100
      : Math.max(1, ...dataSets.flat().map((d) => Number(d.qsos) || 0));
    const htmlBlocks = slots.map((entry) => (
      entry.ready ? renderChartTop10CountriesForDerived(entry.snapshot.derived, maxValue, mode) : `<p>No ${entry.label} loaded.</p>`
    ));
    return `${renderChartModeControls('charts_top_10_countries', mode)}${renderComparePanels(slots, htmlBlocks, 'charts_top_10_countries', { chart: true })}`;
  }

  function renderChartContinentsCompareAligned() {
    const mode = normalizeChartMetricMode(state.chartMetricMode);
    const slots = getActiveCompareSnapshots();
    const dataSets = slots.map((entry) => buildChartContinentsData(entry.snapshot.derived));
    const maxValue = mode === CHART_MODE_NORMALIZED
      ? 100
      : Math.max(1, ...dataSets.flat().map((d) => Number(d.qsos) || 0));
    const htmlBlocks = slots.map((entry) => (
      entry.ready ? renderChartContinentsForDerived(entry.snapshot.derived, maxValue, mode) : `<p>No ${entry.label} loaded.</p>`
    ));
    return `${renderChartModeControls('charts_continents', mode)}${renderComparePanels(slots, htmlBlocks, 'charts_continents', { chart: true })}`;
  }

  function renderFrequencyScatterChart(qsos, rangeOverride, title) {
    const range = rangeOverride || getFrequencyScatterRange(qsos);
    if (!range) {
      return `<div class="mtc"><div class="gradient">&nbsp;${escapeHtml(title || 'Frequencies')}</div><p>No frequency/time data available.</p></div>`;
    }
    const { points, total } = sampleFrequencyScatterPoints(qsos, 6000);
    if (!points.length) {
      return `<div class="mtc"><div class="gradient">&nbsp;${escapeHtml(title || 'Frequencies')}</div><p>No frequency/time data available.</p></div>`;
    }
    const paddedTime = applyRangePadding(range.minTs, range.maxTs, 0.02, 60 * 60 * 1000);
    const paddedFreq = applyRangePadding(range.minFreq, range.maxFreq, 0.05, 0.1);
    const minTs = paddedTime.min;
    const maxTs = paddedTime.max;
    const minFreq = paddedFreq.min;
    const maxFreq = paddedFreq.max;
    const width = 900;
    const height = 320;
    const margin = { left: 70, right: 20, top: 20, bottom: 55 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;
    const xScale = (ts) => margin.left + ((ts - minTs) / (maxTs - minTs)) * plotW;
    const yScale = (freq) => margin.top + (1 - (freq - minFreq) / (maxFreq - minFreq)) * plotH;
    const xTicks = 5;
    const yTicks = 5;
    const xGrid = [];
    const xLabels = [];
    for (let i = 0; i < xTicks; i += 1) {
      const t = minTs + ((maxTs - minTs) * i) / (xTicks - 1);
      const x = xScale(t);
      xGrid.push(`<line class="freq-grid" x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}"></line>`);
      const label = formatDateSh6(t);
      xLabels.push(`<text class="freq-axis-text" x="${x}" y="${height - margin.bottom + 18}" transform="rotate(-35 ${x} ${height - margin.bottom + 18})" text-anchor="end">${escapeHtml(label)}</text>`);
    }
    const yGrid = [];
    const yLabels = [];
    for (let i = 0; i < yTicks; i += 1) {
      const f = minFreq + ((maxFreq - minFreq) * i) / (yTicks - 1);
      const y = yScale(f);
      yGrid.push(`<line class="freq-grid" x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}"></line>`);
      const label = formatFrequency(f);
      yLabels.push(`<text class="freq-axis-text" x="${margin.left - 8}" y="${y + 4}" text-anchor="end">${escapeHtml(label)}</text>`);
    }
    const dots = points.map((p) => {
      const x = xScale(p.ts);
      const y = yScale(p.freq);
      return `<circle class="freq-dot" cx="${x}" cy="${y}" r="2"></circle>`;
    }).join('');
    const note = total > points.length
      ? `<div class="freq-scatter-note">Showing ${formatNumberSh6(points.length)} of ${formatNumberSh6(total)} QSOs with frequency.</div>`
      : '';
    return `
      <div class="mtc">
        <div class="gradient">&nbsp;${escapeHtml(title || 'Frequencies')}</div>
        <div class="freq-scatter-wrap">
          <svg class="freq-scatter" viewBox="0 0 ${width} ${height}" role="img" aria-label="Frequency timeline scatter plot">
            <rect class="freq-plot-bg" x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}"></rect>
            ${xGrid.join('')}
            ${yGrid.join('')}
            <line class="freq-axis" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}"></line>
            <line class="freq-axis" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"></line>
            ${dots}
            ${xLabels.join('')}
            ${yLabels.join('')}
            <text class="freq-axis-title" x="${width / 2}" y="${height - 8}" text-anchor="middle">Time (UTC)</text>
            <text class="freq-axis-title" x="14" y="${height / 2}" transform="rotate(-90 14 ${height / 2})" text-anchor="middle">Frequency (MHz)</text>
          </svg>
        </div>
        ${note}
      </div>
    `;
  }

  function renderChartFrequencies() {
    if (!state.qsoData) return renderPlaceholder({ id: 'charts_frequencies', title: 'Frequencies' });
    const qsos = state.qsoData.qsos || [];
    return renderFrequencyScatterChart(qsos, null, 'Frequencies');
  }

  function renderChartBeamHeading() {
    if (!state.derived || !state.derived.headingSummary) return renderPlaceholder({ id: 'charts_beam_heading', title: 'Beam heading' });
    const mode = normalizeChartMetricMode(state.chartMetricMode);
    const rawData = state.derived.headingSummary.map((h) => ({ label: h.sector, value: h.count }));
    const metricRows = resolveChartRowsWithMetric(rawData, 'value', mode);
    const maxForMode = mode === CHART_MODE_NORMALIZED ? 100 : null;
    return `${renderChartModeControls('charts_beam_heading', mode)}<div class="mtc chart-card"><div class="gradient">&nbsp;Beam heading</div>${renderBars(metricRows, 'label', 'chartValue', maxForMode, { valueTextField: 'chartText', barClass: 'chart-bar' })}</div>`;
  }

  function renderChartBeamHeadingByHour() {
    if (!state.derived || !state.derived.headingByHourSeries) return renderPlaceholder({ id: 'charts_beam_heading_by_hour', title: 'Beam heading by hour' });
    const allSectors = new Set();
    state.derived.headingByHourSeries.forEach((h) => h.sectors.forEach((s) => allSectors.add(s.sector)));
    const sectors = Array.from(allSectors).sort((a, b) => a - b);
    const header = sectors.map((s) => `<th>${s}-${s + 29}</th>`).join('');
    const rows = state.derived.headingByHourSeries.map((h, idx) => {
      const date = formatDateSh6(h.hour * 3600000);
      const cells = sectors.map((s) => {
        const found = h.sectors.find((x) => x.sector === s);
        return `<td>${found ? found.count : 0}</td>`;
      }).join('');
      const cls = idx % 2 === 0 ? 'td1' : 'td0';
      return `<tr class="${cls}"><td>${date}</td>${cells}</tr>`;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Hour (UTC)</th>${header}</tr>
        ${rows}
      </table>
    `;
  }

  function renderGraphsQsByHour(bandFilter) {
    if (!state.derived || !state.derived.hourSeries) return renderPlaceholder({ id: 'graphs_qs_by_hour', title: 'Qs by hour' });
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    const data = state.derived.hourSeries.map((h) => {
      const ts = h.hour * 3600000;
      const hourLabel = formatDateSh6(ts);
      const val = bandKey ? (h.bands[bandKey] || 0) : h.qsos;
      return { label: hourLabel, value: val };
    });
    const bars = renderBars(data, 'label', 'value');
    const subtitle = bandKey ? `Band ${formatBandLabel(bandKey)}` : 'All bands';
    return `
      <div class="mtc">
        <div class="gradient">&nbsp;Qs by hour</div>
        <p>${subtitle}</p>
        ${bars}
      </div>
    `;
  }

  function renderGraphsQsByHourForSlot(slot, keyOrder, bucketMap, bandFilter, maxValue) {
    if (!slot || !slot.derived) return '<p>No log loaded.</p>';
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    const rows = keyOrder.map((key, idx) => {
      const entry = bucketMap.get(key);
      const day = entry ? entry.day : Number(String(key).split('-')[0]);
      const hour = entry ? entry.hour : Number(String(key).split('-')[1]);
      const label = `${WEEKDAY_LABELS[day] || ''} ${String(hour).padStart(2, '0')}:00Z`;
      const count = entry ? (bandKey ? (entry.bands.get(bandKey) || 0) : entry.qsos) : 0;
      const barWidth = maxValue ? Math.round((count / maxValue) * 100) : 0;
      const cls = idx % 2 === 0 ? 'td1' : 'td0';
      return `
        <tr class="${cls}">
          <td>${label}</td>
          <td>${count ? formatNumberSh6(count) : ''}</td>
          <td style="text-align:left"><div class="sum" style="width:${barWidth}%" /></td>
        </tr>
      `;
    }).join('');
    const subtitle = bandKey ? `Band ${formatBandLabel(bandKey)}` : 'All bands';
    return `
      <div class="mtc">
        <div class="gradient">&nbsp;Qs by hour</div>
        <p>${subtitle}</p>
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Hour (UTC)</th><th>QSOs</th><th>&nbsp;</th></tr>
          ${rows}
        </table>
      </div>
    `;
  }

  function renderGraphsQsByHourCompare(bandFilter) {
    const slots = getActiveCompareSnapshots();
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    const maps = slots.map((entry) => buildHourBucketMap(entry.snapshot.qsoData?.qsos || []));
    const order = buildHourKeyOrderFromMapsList(maps, slots.map((entry) => entry.snapshot.qsoData?.qsos || []));
    const values = [];
    maps.forEach((map) => {
      map.forEach((entry) => values.push(bandKey ? (entry.bands.get(bandKey) || 0) : entry.qsos));
    });
    const maxValue = Math.max(1, ...values);
    const htmlBlocks = slots.map((entry, idx) => (
      entry.ready ? renderGraphsQsByHourForSlot(entry.snapshot, order, maps[idx], bandKey, maxValue) : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'graphs_qs_by_hour');
  }

  function renderGraphsPointsByHourForSlot(slot, keyOrder, bucketMap, bandFilter, maxValue) {
    if (!slot || !slot.derived) return '<p>No log loaded.</p>';
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    const rows = keyOrder.map((key, idx) => {
      const entry = bucketMap.get(key);
      const day = entry ? entry.day : Number(String(key).split('-')[0]);
      const hour = entry ? entry.hour : Number(String(key).split('-')[1]);
      const label = `${WEEKDAY_LABELS[day] || ''} ${String(hour).padStart(2, '0')}:00Z`;
      const points = entry ? (bandKey ? (entry.bandPoints?.get(bandKey) || 0) : entry.points) : 0;
      const barWidth = maxValue ? Math.round((points / maxValue) * 100) : 0;
      const cls = idx % 2 === 0 ? 'td1' : 'td0';
      return `
        <tr class="${cls}">
          <td>${label}</td>
          <td>${points ? formatPointValue(points) : ''}</td>
          <td style="text-align:left"><div class="sum" style="width:${barWidth}%" /></td>
        </tr>
      `;
    }).join('');
    const subtitle = bandKey ? `Band ${formatBandLabel(bandKey)}` : 'All bands';
    return `
      <div class="mtc">
        <div class="gradient">&nbsp;Points by hour</div>
        <p>${subtitle}</p>
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Hour (UTC)</th><th>Points</th><th>&nbsp;</th></tr>
          ${rows}
        </table>
      </div>
    `;
  }

  function renderGraphsPointsByHour(bandFilter) {
    if (!state.derived || !state.derived.hourPointSeries) {
      return renderPlaceholder({ id: 'graphs_points_by_hour', title: 'Points by hour' });
    }
    const qsos = state.qsoData?.qsos || [];
    const pointsByIndex = getEffectivePointsByIndex(state.derived, qsos);
    const map = buildHourBucketMap(qsos, pointsByIndex);
    const order = buildHourKeyOrderFromMapsList([map], [qsos]);
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    const values = [];
    map.forEach((entry) => values.push(bandKey ? (entry.bandPoints?.get(bandKey) || 0) : entry.points));
    const maxValue = Math.max(1, ...values);
    return renderGraphsPointsByHourForSlot({ derived: state.derived }, order, map, bandKey, maxValue);
  }

  function renderGraphsPointsByHourCompare(bandFilter) {
    const slots = getActiveCompareSnapshots();
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    const maps = slots.map((entry) => buildHourBucketMap(
      entry.snapshot.qsoData?.qsos || [],
      getEffectivePointsByIndex(entry.snapshot.derived, entry.snapshot.qsoData?.qsos || [])
    ));
    const order = buildHourKeyOrderFromMapsList(maps, slots.map((entry) => entry.snapshot.qsoData?.qsos || []));
    const values = [];
    maps.forEach((map) => {
      map.forEach((entry) => values.push(bandKey ? (entry.bandPoints?.get(bandKey) || 0) : entry.points));
    });
    const maxValue = Math.max(1, ...values);
    const htmlBlocks = slots.map((entry, idx) => (
      entry.ready ? renderGraphsPointsByHourForSlot(entry.snapshot, order, maps[idx], bandKey, maxValue) : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'graphs_points_by_hour');
  }

  function renderReportSingle(report) {
    return withBandContext(report.id, () => {
      if (report.parentId === 'countries_by_time') {
        return renderCountriesByTime(report.band || null);
      }
      if (report.parentId === 'graphs_qs_by_hour') {
        return renderGraphsQsByHour(report.band || null);
      }
      if (report.parentId === 'graphs_points_by_hour') {
        return renderGraphsPointsByHour(report.band || null);
      }
      switch (report.id) {
        case 'load_logs': return renderLoadLogs();
        case 'main': return renderMain();
        case 'competitor_coach': return renderCompetitorCoach();
        case 'summary': return renderSummary();
        case 'log': return renderLog();
        case 'raw_log': return renderRawLog();
        case 'dupes': return renderDupes();
        case 'operators': return renderOperators();
        case 'qs_per_station': return renderQsPerStation();
        case 'countries': return renderCountries();
        case 'continents': return renderContinents();
        case 'zones_cq': return renderCqZones();
        case 'zones_itu': return renderItuZones();
        case 'qs_by_hour_sheet': return renderQsByHourSheet();
        case 'graphs_qs_by_hour': return renderGraphsQsByHour(null);
        case 'points_by_hour_sheet': return renderPointsByHourSheet();
        case 'graphs_points_by_hour': return renderGraphsPointsByHour(null);
        case 'rates': return renderRates();
        case 'points_rates': return renderRates();
        case 'qs_by_minute': return renderQsByMinute();
        case 'points_by_minute': return renderPointsByMinute();
        case 'one_minute_rates': return renderOneMinuteRates();
        case 'one_minute_point_rates': return renderOneMinutePointRates();
        case 'prefixes': return renderPrefixes();
        case 'callsign_length': return renderCallsignLength();
        case 'callsign_structure': return renderCallsignStructure();
        case 'distance': return renderDistance();
        case 'beam_heading': return renderBeamHeading();
        case 'breaks': return renderBreaks();
        case 'all_callsigns': return renderAllCallsigns();
        case 'not_in_master': return renderNotInMaster();
        case 'countries_by_time': return renderCountriesByTime(null);
        case 'possible_errors': return renderPossibleErrors();
        case 'comments': return renderComments();
        case 'export': return renderExportPage();
        case 'qsl_labels': return renderQslLabels();
        case 'session': return renderSessionPage();
        case 'spots': return renderSpots();
        case 'rbn_spots': return renderRbnSpots();
        case 'rbn_compare_signal': return renderRbnCompareSignal();
        case 'spot_hunter': return renderSpotHunter();
        case 'charts': return renderChartsIndex();
        case 'charts_qs_by_band': return renderChartQsByBand();
        case 'charts_top_10_countries': return renderChartTop10Countries();
        case 'charts_continents': return renderChartContinents();
        case 'charts_frequencies': return renderChartFrequencies();
        case 'charts_beam_heading': return renderChartBeamHeading();
        case 'charts_beam_heading_by_hour': return renderChartBeamHeadingByHour();
        case 'fields_map': return renderFieldsMap();
        case 'kmz_files': return renderKmzFiles();
        case 'passed_qsos': return renderPassedQsos();
        case 'sh6_info': return renderAppInfo();
        default: return renderPlaceholder(report);
      }
    });
  }

  function withSlotState(slot, fn, options = {}) {
    const snapshot = {
      logFile: state.logFile,
      qsoData: state.qsoData,
      qsoLite: state.qsoLite,
      rawLogText: state.rawLogText,
      derived: state.derived,
      logPage: state.logPage,
      logPageSize: state.logPageSize,
      fullQsoData: state.fullQsoData,
      fullDerived: state.fullDerived,
      bandDerivedCache: state.bandDerivedCache,
      logVersion: state.logVersion,
      spotsState: state.spotsState,
      rbnState: state.rbnState,
      apiEnrichment: state.apiEnrichment,
      renderSlotId: state.renderSlotId
    };
    Object.assign(state, slot);
    if (options.slotId) state.renderSlotId = options.slotId;
    const result = fn();
    Object.assign(state, snapshot);
    return result;
  }

  const COMPARE_SCROLL_SYNC_REPORTS = new Set([
    'summary',
    'countries',
    'continents',
    'zones_cq',
    'zones_itu',
    'qs_per_station',
    'qs_by_hour_sheet',
    'points_by_hour_sheet',
    'qs_by_minute',
    'points_by_minute',
    'rates',
    'points_rates',
    'one_minute_rates',
    'one_minute_point_rates',
    'spots',
    'rbn_spots'
  ]);

  function renderCompareHeader(slot, label, slotId) {
    const call = escapeHtml(slot.derived?.contestMeta?.stationCallsign || 'N/A');
    const contest = escapeHtml(slot.derived?.contestMeta?.contestId || 'N/A');
    const year = slot.derived?.timeRange?.minTs ? new Date(slot.derived.timeRange.minTs).getUTCFullYear() : 'N/A';
    const qsos = slot.qsoData?.qsos?.length ? formatNumberSh6(slot.qsoData.qsos.length) : '0';
    const slotLabel = escapeHtml(label || `Log ${slotId}`);
    return `
      <div class="compare-head-main">
        <span class="compare-slot-badge compare-slot-${String(slotId || '').toLowerCase()}">${slotLabel}</span>
        <span class="compare-head-call">${call}</span>
      </div>
      <div class="compare-head-meta">${contest} · ${year} · ${qsos} QSOs</div>
    `;
  }

  function renderCompareWorkspaceToolbar(reportId, slotEntries) {
    const safeReportId = String(reportId || '').split('::')[0];
    const reportTitle = reports.find((entry) => entry.id === safeReportId)?.title || safeReportId;
    const slotSummary = (slotEntries || []).map((entry) => {
      const call = escapeHtml(entry.snapshot?.derived?.contestMeta?.stationCallsign || 'N/A');
      const contest = escapeHtml(entry.snapshot?.derived?.contestMeta?.contestId || 'N/A');
      const qsos = entry.snapshot?.qsoData?.qsos?.length || 0;
      return `<span class="compare-workspace-slot compare-${entry.id.toLowerCase()}">${escapeHtml(entry.label)} · ${call} · ${contest} · ${formatNumberSh6(qsos)} QSOs</span>`;
    }).join('');
    const insightStrip = renderCompareInsightStrip(slotEntries, safeReportId);
    return `
      <div class="compare-workspace">
        <div class="compare-workspace-head">
          <span class="compare-workspace-title">Compare workspace</span>
          <span class="compare-workspace-report">Report: ${escapeHtml(reportTitle)}</span>
        </div>
        <div class="compare-workspace-slot-row">${slotSummary}</div>
        ${insightStrip}
      </div>
    `;
  }

  function resolveCompareScore(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return null;
    const scoring = snapshot?.derived?.scoring || {};
    const computed = Number(scoring.computedScore);
    if (Number.isFinite(computed) && computed > 0) return computed;
    const claimed = parseClaimedScoreNumber(snapshot?.derived?.contestMeta?.claimedScore);
    if (Number.isFinite(claimed) && claimed > 0) return claimed;
    const effective = Number(snapshot?.derived?.effectivePointsTotal);
    if (Number.isFinite(effective) && effective > 0) return Math.round(effective);
    return null;
  }

  function resolveCompareMultiplier(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return null;
    const scoring = snapshot?.derived?.scoring || {};
    const mult = Number(scoring.computedMultiplierTotal);
    if (Number.isFinite(mult) && mult >= 0) return mult;
    return null;
  }

  function buildCompareInsightChip(slotMetrics, key, label, reportJump) {
    const values = slotMetrics
      .map((entry) => ({
        ...entry,
        metricValue: Number(entry[key])
      }))
      .filter((entry) => Number.isFinite(entry.metricValue));
    if (values.length < 2) {
      return `<button type="button" class="compare-insight-chip" disabled>${escapeHtml(label)}: N/A</button>`;
    }
    const leader = values.reduce((best, entry) => (
      !best || entry.metricValue > best.metricValue ? entry : best
    ), null);
    const minValue = Math.min(...values.map((entry) => entry.metricValue));
    const spread = Math.max(0, Math.round((leader?.metricValue || 0) - minValue));
    const baseline = values.find((entry) => entry.id === 'A') || values[0];
    const gap = Number.isFinite(baseline?.metricValue) && Number.isFinite(leader?.metricValue)
      ? Math.round((leader.metricValue || 0) - (baseline.metricValue || 0))
      : null;
    const gapPct = Number.isFinite(gap) && Number.isFinite(baseline?.metricValue) && baseline.metricValue > 0
      ? (gap / baseline.metricValue) * 100
      : null;
    const baselineText = Number.isFinite(gap)
      ? (gap > 0
          ? `${formatNumberSh6(Math.abs(gap))} behind Log ${escapeHtml(String(baseline?.id || '').toUpperCase())}${Number.isFinite(gapPct) ? ` (${gapPct.toFixed(1)}%)` : ''}`
          : `Leading from Log ${escapeHtml(String(baseline?.id || '').toUpperCase())}`)
      : 'No baseline';
    const summary = `${label} spread ${formatNumberSh6(spread)} · leader ${escapeHtml(leader?.call || 'N/A')} · ${baselineText}`;
    return `<button type="button" class="compare-insight-chip" data-compare-jump="${escapeAttr(reportJump)}">${summary}</button>`;
  }

  function renderCompareInsightStrip(slotEntries, currentReportId) {
    const quickLinks = [
      { report: 'rates', label: 'Open Rates' },
    ].filter((entry) => entry.report !== currentReportId)
      .map((entry) => `<button type="button" class="compare-workspace-jump" data-compare-jump="${escapeAttr(entry.report)}">${escapeHtml(entry.label)}</button>`)
      .join('');
    if (!quickLinks) return '';
    return `<div class="compare-insight-strip"><div class="compare-insight-jumps">${quickLinks}</div></div>`;
  }

  function estimateReportRows(reportId, derived) {
    if (!derived) return 0;
    const baseId = String(reportId || '').split('::')[0];
    switch (baseId) {
      case 'main': return 8;
      case 'summary': return derived.bandModeSummary?.length || 0;
      case 'operators': return derived.operatorsSummary?.length || 0;
      case 'dupes': return derived.dupes?.length || 0;
      case 'qs_per_station': return getMaxQsosPerStation(derived) || 0;
      case 'qs_by_hour_sheet': return derived.hourSeries?.length || 0;
      case 'points_by_hour_sheet': return derived.hourPointSeries?.length || 0;
      case 'graphs_points_by_hour': return derived.hourPointSeries?.length || 0;
      case 'qs_by_minute': return derived.minuteSeries?.length || 0;
      case 'points_by_minute': return derived.minutePointSeries?.length || 0;
      case 'one_minute_rates': return derived.minuteSeries?.length || 0;
      case 'one_minute_point_rates': return derived.minutePointSeries?.length || 0;
      case 'rates': return derived.hourSeries?.length || 0;
      case 'points_rates': return derived.hourSeries?.length || 0;
      case 'continents': return derived.continentSummary?.length || 0;
      case 'zones_cq': return derived.cqZoneSummary?.length || 0;
      case 'zones_itu': return derived.ituZoneSummary?.length || 0;
      case 'callsign_length': return derived.callsignLengthSummary?.length || 0;
      case 'callsign_structure': return derived.structureSummary?.length || 0;
      case 'distance': return derived.distanceSummary?.buckets?.length || 0;
      case 'beam_heading': return derived.headingSummary?.length || 0;
      case 'comments': return derived.comments?.length || 0;
      case 'fields_map': return derived.fieldsSummary?.length || 0;
      case 'kmz_files': return 6;
      default: return 1000;
    }
  }

  function mergeListsMany(mergeFn, lists) {
    let merged = [];
    lists.forEach((list) => {
      merged = mergeFn(merged, list || []);
    });
    return merged;
  }

  function renderComparePanels(slotEntries, htmlBlocks, reportId, options = {}) {
    const baseId = String(reportId || '').split('::')[0];
    const narrowReports = new Set([
      'summary',
      'operators',
      'dupes',
      'qs_per_station',
      'zones_cq',
      'zones_itu',
      'callsign_length',
      'callsign_structure',
      'distance',
      'passed_qsos',
      'possible_errors',
      'not_in_master',
      'one_minute_rates',
      'one_minute_point_rates',
      'rates',
      'all_callsigns',
      'qs_by_hour_sheet',
      'points_by_hour_sheet'
    ]);
    const wrapReports = new Set(['one_minute_rates', 'one_minute_point_rates']);
    const stackReports = new Set(['rates']);
    const quadReports = new Set([
      'main',
      'summary',
      'qsl_labels',
      'qs_per_station',
      'one_minute_rates',
      'one_minute_point_rates',
      'distance',
      'breaks',
      'continents',
      'kmz_files',
      'fields_map',
      'callsign_length',
      'callsign_structure',
      'zones_cq',
      'zones_itu',
      'not_in_master',
      'possible_errors',
      'comments',
      'sh6_info',
      'charts'
    ]);
    const isNarrow = narrowReports.has(baseId);
    const shouldWrap = wrapReports.has(baseId);
    const isChart = options.chart || baseId.startsWith('charts_');
    const isQuad = isChart || quadReports.has(baseId);
    const shouldStack = stackReports.has(baseId);
    const syncScroll = state.compareSyncEnabled && !isChart && COMPARE_SCROLL_SYNC_REPORTS.has(baseId);
    const syncGroup = `compare-sync-${baseId}-${slotEntries.map((entry) => entry.id).join('').toLowerCase()}`;
    const gridClass = `compare-grid compare-count-${slotEntries.length}${isNarrow ? ' compare-narrow' : ''}${isChart ? ' compare-chart' : ''}${isQuad ? ' compare-quad' : ''}${shouldStack ? ' compare-stack' : ''}${state.compareStickyEnabled ? '' : ' compare-sticky-off'}`;
    const toolbar = slotEntries.length > 1 && !options.hideToolbar
      ? renderCompareWorkspaceToolbar(baseId, slotEntries)
      : '';
    return `
      ${toolbar}
      <div class="${gridClass}"${syncScroll ? ` data-compare-sync-group="${escapeAttr(syncGroup)}"` : ''} data-compare-report="${escapeAttr(baseId)}">
        ${slotEntries.map((entry, idx) => {
          const html = htmlBlocks[idx] || '';
          const panelClass = `compare-panel compare-${entry.id.toLowerCase()}`;
          return `
            <div class="${panelClass}">
              <div class="compare-head">${renderCompareHeader(entry.snapshot, entry.label, entry.id)}</div>
              <div class="compare-scroll${shouldWrap ? ' compare-scroll-wrap' : ''}${syncScroll ? ' compare-scroll-sync' : ''}"${syncScroll ? ` data-sync-group="${escapeAttr(syncGroup)}" data-sync-slot="${escapeAttr(entry.id)}"` : ''}>${html}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function normalizeHeadingLabel(text) {
    return String(text || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
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
    if (id !== 'spots' && id !== 'rbn_spots') return;
    if (!state.compareEnabled) return;
    if (window.innerWidth < 768) return;
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

  function bindCompareScrollSync(reportId) {
    const baseId = getFocusReportId(reportId);
    if (!state.compareEnabled) return;
    if (!COMPARE_SCROLL_SYNC_REPORTS.has(baseId)) return;
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
      const syncTo = (source) => {
        const left = source.scrollLeft;
        items.forEach((el) => {
          if (el === source) return;
          if (Math.abs((el.scrollLeft || 0) - left) < 1) return;
          el.scrollLeft = left;
        });
      };
      items.forEach((el) => {
        if (el.dataset.syncBound === '1') return;
        el.dataset.syncBound = '1';
        el.addEventListener('scroll', () => {
          if (syncing) return;
          syncing = true;
          syncTo(el);
          syncing = false;
        }, { passive: true });
      });
      syncTo(items[0]);
    });
  }

  function getFocusReportId(reportId) {
    return String(reportId || '').split('::')[0];
  }

  function getCompareFocusPair(reportId, slotEntries) {
    const baseId = getFocusReportId(reportId);
    const ids = slotEntries.map((entry) => entry.id);
    const stored = state.compareFocus?.[baseId] || [];
    let left = ids.includes(stored[0]) ? stored[0] : ids[0];
    let right = ids.includes(stored[1]) ? stored[1] : ids.find((id) => id !== left);
    if (!right) right = ids.find((id) => id !== left) || left;
    if (right === left) right = ids.find((id) => id !== left) || left;
    return [left, right];
  }

  function renderCompareFocusControls(reportId, slotEntries, pair) {
    if (slotEntries.length <= 2) return '';
    const baseId = getFocusReportId(reportId);
    const renderOptions = (selectedId) => slotEntries.map((entry) => {
      const selected = entry.id === selectedId ? ' selected' : '';
      return `<option value="${entry.id}"${selected}>${entry.label}</option>`;
    }).join('');
    return `
      <div class="compare-focus">
        <span>Focus compare:</span>
        <select class="compare-focus-select" data-focus-report="${baseId}" data-focus-role="a">
          ${renderOptions(pair[0])}
        </select>
        <span>vs</span>
        <select class="compare-focus-select" data-focus-report="${baseId}" data-focus-role="b">
          ${renderOptions(pair[1])}
        </select>
      </div>
    `;
  }

  function resolveFocusEntries(reportId, slotEntries) {
    const pair = getCompareFocusPair(reportId, slotEntries);
    const left = slotEntries.find((entry) => entry.id === pair[0]) || slotEntries[0];
    const right = slotEntries.find((entry) => entry.id === pair[1]) || slotEntries.find((entry) => entry.id !== (left && left.id));
    const entries = [left, right].filter(Boolean);
    return { pair, entries };
  }

  function renderFocusComparePanels(reportId, slotEntries, renderSlot, reportKey, options = {}) {
    const { pair, entries } = resolveFocusEntries(reportId, slotEntries);
    const focusControls = renderCompareFocusControls(reportId, slotEntries, pair);
    const htmlBlocks = entries.map((entry) => renderSlot(entry));
    return `${focusControls}${renderComparePanels(entries, htmlBlocks, reportKey, options)}`;
  }

  function renderCountriesCompareAligned() {
    const slots = getActiveCompareSnapshots();
    const lists = slots.map((entry) => buildCountryListFromDerived(entry.snapshot.derived));
    const list = mergeListsMany(mergeCountryLists, lists);
    const htmlBlocks = slots.map((entry) => (
      entry.ready
        ? renderCountriesTable(renderCountryRowsFromList(list, entry.snapshot.derived, entry.snapshot.qsoData?.qsos.length || 0))
        : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'countries');
  }

  function renderContinentsCompareAligned() {
    const slots = getActiveCompareSnapshots();
    const lists = slots.map((entry) => buildContinentListFromDerived(entry.snapshot.derived));
    const list = mergeListsMany(mergeContinentLists, lists);
    const htmlBlocks = slots.map((entry) => (
      entry.ready
        ? renderContinentsTable(renderContinentsRowsFromList(list, entry.snapshot.derived, entry.snapshot.qsoData?.qsos.length || 0))
        : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'continents');
  }

  function renderZoneCompareAligned(field) {
    const slots = getActiveCompareSnapshots();
    const lists = slots.map((entry) => buildZoneListFromDerived(entry.snapshot.derived, field));
    const list = mergeListsMany(mergeZoneLists, lists);
    const htmlBlocks = slots.map((entry) => (
      entry.ready
        ? renderZonesTable(renderZoneRowsFromList(list, entry.snapshot.derived, field))
        : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, field === 'itu' ? 'zones_itu' : 'zones_cq');
  }

  function renderPrefixesCompareAligned() {
    const slots = getActiveCompareSnapshots();
    if (!state.ctyTable || !state.ctyTable.length) {
      const htmlBlocks = slots.map((entry) => (entry.ready ? '<p>cty.dat not loaded.</p>' : `<p>No ${entry.label} loaded.</p>`));
      return renderComparePanels(slots, htmlBlocks, 'prefixes');
    }
    const groupSets = slots.map((entry) => buildPrefixGroups(entry.snapshot.derived));
    const list = mergeListsMany(mergePrefixLists, groupSets.map((groups) => buildPrefixListFromGroups(groups)));
    const htmlBlocks = slots.map((entry, idx) => (
      entry.ready
        ? renderPrefixesTable(renderPrefixesRowsFromList(list, groupSets[idx], entry.snapshot.derived?.prefixSummary?.length || 0))
        : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'prefixes');
  }

  function renderCallsignLengthCompareAligned() {
    const slots = getActiveCompareSnapshots();
    const lists = slots.map((entry) => buildCallsignLengthList(entry.snapshot.derived));
    const list = mergeListsMany(mergeCallsignLengthLists, lists);
    const htmlBlocks = slots.map((entry) => (
      entry.ready
        ? renderCallsignLengthTable(renderCallsignLengthRowsFromList(list, entry.snapshot.derived, entry.snapshot.derived?.uniqueCallsCount || 0, entry.snapshot.qsoData?.qsos.length || 0))
        : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'callsign_length');
  }

  function renderCallsignStructureCompareAligned() {
    const slots = getActiveCompareSnapshots();
    const lists = slots.map((entry) => buildStructureList(entry.snapshot.derived));
    const list = mergeListsMany(mergeStructureLists, lists);
    const htmlBlocks = slots.map((entry) => (
      entry.ready
        ? renderCallsignStructureTable(renderCallsignStructureRowsFromList(list, entry.snapshot.derived, entry.snapshot.derived?.uniqueCallsCount || 0, entry.snapshot.qsoData?.qsos.length || 0))
        : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'callsign_structure');
  }

  function renderDistanceCompareAligned() {
    const slots = getActiveCompareSnapshots();
    const lists = slots.map((entry) => buildDistanceList(entry.snapshot.derived));
    const list = mergeListsMany(mergeDistanceLists, lists);
    const htmlBlocks = slots.map((entry) => (
      entry.ready
        ? (list.length ? renderDistanceTable(renderDistanceRowsFromList(list, entry.snapshot.derived)) : '<p>No distance data (station or remote locations missing).</p>')
        : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'distance');
  }

  function renderBeamHeadingCompareAligned() {
    const slots = getActiveCompareSnapshots();
    const lists = slots.map((entry) => buildHeadingList(entry.snapshot.derived));
    const list = mergeListsMany(mergeHeadingLists, lists);
    const htmlBlocks = slots.map((entry) => {
      if (!entry.ready) return `<p>No ${entry.label} loaded.</p>`;
      const rows = list.length ? renderHeadingRowsFromList(list, entry.snapshot.derived) : '';
      return rows ? renderHeadingTable(rows) : '<p>No heading data.</p>';
    });
    return renderComparePanels(slots, htmlBlocks, 'beam_heading');
  }

  function renderCountriesByTimeCompareAligned(bandFilter) {
    const slots = getActiveCompareSnapshots();
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    const reportId = bandKey ? `countries_by_time::${bandKey}` : 'countries_by_time';
    if (slots.length > 2) {
      const { pair, entries } = resolveFocusEntries('countries_by_time', slots);
      const bandCols = bandKey
        ? [bandKey]
        : sortBands(Array.from(new Set(
          entries.flatMap((entry) => getBandsFromDerived(entry.snapshot.derived))
        )));
      const list = mergeListsMany(
        mergeCountryLists,
        entries.map((entry) => buildCountryListFromDerived(entry.snapshot.derived))
      );
      const htmlBlocks = entries.map((entry) => {
        if (!entry.ready) return `<p>No ${entry.label} loaded.</p>`;
        const rows = renderCountryBandSummaryRowsFromList(list, entry.snapshot.derived, entry.snapshot.qsoData?.qsos.length || 0, {
          bandCols,
          showIndex: false,
          showTotal: false
        });
        return rows ? renderCountriesBandSummaryTable(rows, {
          bandCols,
          showIndex: false,
          showTotal: false,
          continentLabel: 'Cnt'
        }) : '<p>No data.</p>';
      });
      const focusControls = renderCompareFocusControls('countries_by_time', slots, pair);
      return `${focusControls}${renderComparePanels(entries, htmlBlocks, reportId)}`;
    }
    const lists = slots.map((entry) => buildCountryListFromDerived(entry.snapshot.derived));
    const list = mergeListsMany(mergeCountryLists, lists);
    const renderForSlot = (entry) => {
      if (!entry.ready) return `<p>No ${entry.label} loaded.</p>`;
      const qsos = entry.snapshot.qsoData?.qsos || [];
      const map = buildCountryTimeBuckets(qsos, bandKey);
      if (!list.length) return '<p>No data.</p>';
      const countryInfo = new Map();
      entry.snapshot.derived?.countrySummary?.forEach((c) => {
        countryInfo.set(c.country, { continent: c.continent, prefixCode: c.prefixCode });
      });
      const rows = renderCountriesByTimeRowsFromList(list, map, countryInfo, bandKey);
      return renderCountriesByTimeTable(rows);
    };
    const htmlBlocks = slots.map((entry) => renderForSlot(entry));
    return renderComparePanels(slots, htmlBlocks, reportId);
  }

  function renderQsPerStationCompareAligned() {
    const slots = getActiveCompareSnapshots();
    const maxQso = Math.max(0, ...slots.map((entry) => getMaxQsosPerStation(entry.snapshot.derived)));
    const htmlBlocks = slots.map((entry) => (
      entry.ready
        ? renderQsPerStationTable(entry.snapshot.derived, entry.snapshot.qsoData?.qsos?.length || 0, maxQso)
        : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'qs_per_station');
  }

  function renderQsByMinuteCompareAligned() {
    const slots = getActiveCompareSnapshots();
    if (slots.length > 2) {
      const { pair, entries } = resolveFocusEntries('qs_by_minute', slots);
      const maps = entries.map((entry) => buildMinuteMapFromDerived(entry.snapshot.derived));
      const ranges = maps.map((map) => getMinuteRangeFromMap(map)).filter(Boolean);
      if (!ranges.length) {
        const htmlBlocks = entries.map((entry) => (entry.ready ? '<p>No QSOs to analyze.</p>' : `<p>No ${entry.label} loaded.</p>`));
        const focusControls = renderCompareFocusControls('qs_by_minute', slots, pair);
        return `${focusControls}${renderComparePanels(entries, htmlBlocks, 'qs_by_minute')}`;
      }
      const minMinute = Math.min(...ranges.map((r) => r.minMinute));
      const maxMinute = Math.max(...ranges.map((r) => r.maxMinute));
      const startHour = Math.floor(minMinute / 60);
      const endHour = Math.floor(maxMinute / 60);
      const htmlBlocks = entries.map((entry, idx) => (
        entry.ready ? renderQsByMinuteTable(maps[idx], startHour, endHour) : `<p>No ${entry.label} loaded.</p>`
      ));
      const focusControls = renderCompareFocusControls('qs_by_minute', slots, pair);
      return `${focusControls}${renderComparePanels(entries, htmlBlocks, 'qs_by_minute')}`;
    }
    const maps = slots.map((entry) => buildMinuteMapFromDerived(entry.snapshot.derived));
    const ranges = maps.map((map) => getMinuteRangeFromMap(map)).filter(Boolean);
    if (!ranges.length) {
      const htmlBlocks = slots.map((entry) => (entry.ready ? '<p>No QSOs to analyze.</p>' : `<p>No ${entry.label} loaded.</p>`));
      return renderComparePanels(slots, htmlBlocks, 'qs_by_minute');
    }
    const minMinute = Math.min(...ranges.map((r) => r.minMinute));
    const maxMinute = Math.max(...ranges.map((r) => r.maxMinute));
    const startHour = Math.floor(minMinute / 60);
    const endHour = Math.floor(maxMinute / 60);
    const htmlBlocks = slots.map((entry, idx) => (
      entry.ready ? renderQsByMinuteTable(maps[idx], startHour, endHour) : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'qs_by_minute');
  }

  function renderPointsByMinuteCompareAligned() {
    const slots = getActiveCompareSnapshots();
    if (slots.length > 2) {
      const { pair, entries } = resolveFocusEntries('points_by_minute', slots);
      const maps = entries.map((entry) => buildMinutePointMapFromDerived(entry.snapshot.derived));
      const ranges = maps.map((map) => getMinuteRangeFromMap(map)).filter(Boolean);
      if (!ranges.length) {
        const htmlBlocks = entries.map((entry) => (entry.ready ? '<p>No points to analyze.</p>' : `<p>No ${entry.label} loaded.</p>`));
        const focusControls = renderCompareFocusControls('points_by_minute', slots, pair);
        return `${focusControls}${renderComparePanels(entries, htmlBlocks, 'points_by_minute')}`;
      }
      const minMinute = Math.min(...ranges.map((r) => r.minMinute));
      const maxMinute = Math.max(...ranges.map((r) => r.maxMinute));
      const startHour = Math.floor(minMinute / 60);
      const endHour = Math.floor(maxMinute / 60);
      const htmlBlocks = entries.map((entry, idx) => (
        entry.ready ? renderQsByMinuteTable(maps[idx], startHour, endHour) : `<p>No ${entry.label} loaded.</p>`
      ));
      const focusControls = renderCompareFocusControls('points_by_minute', slots, pair);
      return `${focusControls}${renderComparePanels(entries, htmlBlocks, 'points_by_minute')}`;
    }
    const maps = slots.map((entry) => buildMinutePointMapFromDerived(entry.snapshot.derived));
    const ranges = maps.map((map) => getMinuteRangeFromMap(map)).filter(Boolean);
    if (!ranges.length) {
      const htmlBlocks = slots.map((entry) => (entry.ready ? '<p>No points to analyze.</p>' : `<p>No ${entry.label} loaded.</p>`));
      return renderComparePanels(slots, htmlBlocks, 'points_by_minute');
    }
    const minMinute = Math.min(...ranges.map((r) => r.minMinute));
    const maxMinute = Math.max(...ranges.map((r) => r.maxMinute));
    const startHour = Math.floor(minMinute / 60);
    const endHour = Math.floor(maxMinute / 60);
    const htmlBlocks = slots.map((entry, idx) => (
      entry.ready ? renderQsByMinuteTable(maps[idx], startHour, endHour) : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'points_by_minute');
  }

  function renderChartFrequenciesForSlot(slot, rangeOverride, qsosOverride) {
    if (!slot.qsoData) {
      return renderPlaceholder({ id: 'charts_frequencies', title: 'Frequencies' });
    }
    const qsos = qsosOverride || slot.qsoData.qsos || [];
    return renderFrequencyScatterChart(qsos, rangeOverride, 'Frequencies');
  }

  function renderChartFrequenciesCompareAligned() {
    const slots = getActiveCompareSnapshots();
    const band = state.globalBandFilter && shouldBandFilterReport('charts_frequencies') ? state.globalBandFilter : '';
    const lists = slots.map((entry) => getBandFilteredQsosFrom(entry.snapshot.qsoData?.qsos || [], band));
    const ranges = lists.map((list) => getFrequencyScatterRange(list));
    const keys = ranges.map((range) => getWeekendKeyFromRange(range));
    const shareAxis = keys.length > 0 && keys.every((key) => key && key === keys[0]);
    const sharedRange = shareAxis ? mergeFrequencyScatterRangesList(ranges) : null;
    const htmlBlocks = slots.map((entry, idx) => (
      entry.ready
        ? renderChartFrequenciesForSlot(entry.snapshot, shareAxis ? sharedRange : ranges[idx], lists[idx])
        : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'charts_frequencies', { chart: true });
  }

  function buildHeadingChartMap(derived) {
    const map = new Map();
    if (!derived || !derived.headingSummary) return map;
    derived.headingSummary.forEach((h) => map.set(h.start, { label: h.sector, value: h.count }));
    return map;
  }

  function buildHeadingChartOrder(mapA, mapB) {
    const starts = new Set([...mapA.keys(), ...mapB.keys()]);
    return Array.from(starts).sort((a, b) => a - b);
  }

  function buildHeadingChartOrderFromMaps(maps) {
    const starts = new Set();
    maps.forEach((map) => map.forEach((_, key) => starts.add(key)));
    return Array.from(starts).sort((a, b) => a - b);
  }

  function renderChartBeamHeadingForSlot(slot, order, maxOverride, mode = CHART_MODE_ABSOLUTE) {
    if (!slot.derived || !slot.derived.headingSummary) {
      return renderPlaceholder({ id: 'charts_beam_heading', title: 'Beam heading' });
    }
    const map = buildHeadingChartMap(slot.derived);
    const rawData = order.map((start) => {
      const entry = map.get(start);
      return {
        label: entry ? entry.label : `${start}-${start + 29}`,
        value: entry ? entry.value : 0
      };
    });
    const metricRows = resolveChartRowsWithMetric(rawData, 'value', mode);
    const maxForMode = normalizeChartMetricMode(mode) === CHART_MODE_NORMALIZED ? 100 : maxOverride;
    return `<div class="mtc chart-card"><div class="gradient">&nbsp;Beam heading</div>${renderBars(metricRows, 'label', 'chartValue', maxForMode, { valueTextField: 'chartText', barClass: 'chart-bar' })}</div>`;
  }

  function renderChartBeamHeadingCompareAligned() {
    const mode = normalizeChartMetricMode(state.chartMetricMode);
    const slots = getActiveCompareSnapshots();
    const maps = slots.map((entry) => buildHeadingChartMap(entry.snapshot.derived));
    const order = buildHeadingChartOrderFromMaps(maps);
    const values = [];
    maps.forEach((map) => map.forEach((entry) => values.push(entry.value || 0)));
    const maxValue = mode === CHART_MODE_NORMALIZED ? 100 : Math.max(1, ...values);
    const htmlBlocks = slots.map((entry) => (
      entry.ready ? renderChartBeamHeadingForSlot(entry.snapshot, order, maxValue, mode) : `<p>No ${entry.label} loaded.</p>`
    ));
    return `${renderChartModeControls('charts_beam_heading', mode)}${renderComparePanels(slots, htmlBlocks, 'charts_beam_heading', { chart: true })}`;
  }

  function buildHeadingByHourMap(derived) {
    const map = new Map();
    if (!derived || !derived.headingByHourSeries) return map;
    derived.headingByHourSeries.forEach((h) => {
      const sectorMap = new Map();
      h.sectors.forEach((s) => sectorMap.set(s.sector, s.count));
      map.set(h.hour, sectorMap);
    });
    return map;
  }

  function buildHeadingByHourOrder(mapA, mapB) {
    const hours = new Set([...mapA.keys(), ...mapB.keys()]);
    return Array.from(hours).sort((a, b) => a - b);
  }

  function buildHeadingByHourSectors(mapA, mapB) {
    const sectors = new Set();
    mapA.forEach((m) => m.forEach((_, s) => sectors.add(s)));
    mapB.forEach((m) => m.forEach((_, s) => sectors.add(s)));
    return Array.from(sectors).sort((a, b) => a - b);
  }

  function buildHeadingByHourOrderFromMaps(maps) {
    const hours = new Set();
    maps.forEach((map) => map.forEach((_, key) => hours.add(key)));
    return Array.from(hours).sort((a, b) => a - b);
  }

  function buildHeadingByHourSectorsFromMaps(maps) {
    const sectors = new Set();
    maps.forEach((map) => {
      map.forEach((m) => m.forEach((_, s) => sectors.add(s)));
    });
    return Array.from(sectors).sort((a, b) => a - b);
  }

  function renderChartBeamHeadingByHourForSlot(slot, hours, sectors) {
    if (!slot.derived || !slot.derived.headingByHourSeries) {
      return renderPlaceholder({ id: 'charts_beam_heading_by_hour', title: 'Beam heading by hour' });
    }
    const map = buildHeadingByHourMap(slot.derived);
    const header = sectors.map((s) => `<th>${s}-${s + 29}</th>`).join('');
    const rows = hours.map((hour, idx) => {
      const date = formatDateSh6(hour * 3600000);
      const sectorMap = map.get(hour) || new Map();
      const cells = sectors.map((s) => `<td>${sectorMap.get(s) || 0}</td>`).join('');
      const cls = idx % 2 === 0 ? 'td1' : 'td0';
      return `<tr class="${cls}"><td>${date}</td>${cells}</tr>`;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Hour (UTC)</th>${header}</tr>
        ${rows}
      </table>
    `;
  }

  function renderChartBeamHeadingByHourCompareAligned() {
    const slots = getActiveCompareSnapshots();
    const maps = slots.map((entry) => buildHeadingByHourMap(entry.snapshot.derived));
    const hours = buildHeadingByHourOrderFromMaps(maps);
    const sectors = buildHeadingByHourSectorsFromMaps(maps);
    const htmlBlocks = slots.map((entry, idx) => (
      entry.ready ? renderChartBeamHeadingByHourForSlot(entry.snapshot, hours, sectors) : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'charts_beam_heading_by_hour', { chart: true });
  }

  function renderReportCompare(report) {
    if (report.parentId === 'graphs_qs_by_hour') {
      return renderGraphsQsByHourCompare(report.band || null);
    }
    if (report.parentId === 'graphs_points_by_hour') {
      return renderGraphsPointsByHourCompare(report.band || null);
    }
    if (report.parentId === 'countries_by_time') {
      return renderCountriesByTimeCompareAligned(report.band || null);
    }
    if (report.id === 'log') {
      return renderLogCompare();
    }
    if (report.id === 'raw_log') {
      const slots = getActiveCompareSnapshots();
      const htmlBlocks = slots.map((entry) => (
        entry.snapshot.rawLogText
          ? renderRawLogPanel(entry.label, entry.snapshot.rawLogText, entry.snapshot.logFile?.name, entry.id)
          : `<p>No ${entry.label} loaded.</p>`
      ));
      return renderComparePanels(slots, htmlBlocks, 'raw_log');
    }
    if (report.id === 'session') {
      return renderSessionPage();
    }
    if (report.id === 'qs_by_hour_sheet') {
      return renderQsByHourSheetCompare();
    }
    if (report.id === 'points_by_hour_sheet') {
      return renderPointsByHourSheetCompare();
    }
    if (report.id === 'qs_by_minute') {
      return renderQsByMinuteCompareAligned();
    }
    if (report.id === 'points_by_minute') {
      return renderPointsByMinuteCompareAligned();
    }
    if (report.id === 'one_minute_rates') {
      return renderOneMinuteRatesCompareAligned();
    }
    if (report.id === 'one_minute_point_rates') {
      return renderOneMinutePointRatesCompareAligned();
    }
    if (report.id === 'points_rates') {
      return renderPointsRatesCompareAligned();
    }
    if (report.id === 'spot_hunter') {
      return renderSpotHunterCompare();
    }
    if (report.id === 'spots') {
      return renderSpotsCompare('spots');
    }
    if (report.id === 'rbn_spots') {
      return renderSpotsCompare('rbn');
    }
    if (report.id === 'charts_frequencies') {
      return renderChartFrequenciesCompareAligned();
    }
    if (report.id === 'charts_qs_by_band') {
      return renderChartQsByBandCompareAligned();
    }
    if (report.id === 'charts_top_10_countries') {
      return renderChartTop10CountriesCompareAligned();
    }
    if (report.id === 'charts_continents') {
      return renderChartContinentsCompareAligned();
    }
    if (report.id === 'charts_beam_heading') {
      return renderChartBeamHeadingCompareAligned();
    }
    if (report.id === 'charts_beam_heading_by_hour') {
      return renderChartBeamHeadingByHourCompareAligned();
    }
    if (report.id === 'breaks') {
      return renderBreaksCompare();
    }
    if (report.id === 'passed_qsos') {
      const slots = getActiveCompareSnapshots();
      const htmlBlocks = slots.map((entry) => (
        entry.ready ? renderPassedQsosForList(entry.snapshot.qsoData?.qsos || [], { showControls: false }) : `<p>No ${entry.label} loaded.</p>`
      ));
      const windowMinutes = Math.max(1, Number(state.passedQsoWindow) || 10);
      const slider = `
        <div class="break-controls passed-controls">
          Passed window (minutes):
          <input type="range" class="passed-window" min="1" max="60" step="1" value="${windowMinutes}">
          <span class="passed-window-value">${windowMinutes}</span>
        </div>
        <p>A passed QSO is a callsign worked on another band within ${windowMinutes} minutes.</p>
      `;
      return `${slider}${renderComparePanels(slots, htmlBlocks, 'passed_qsos')}`;
    }
    if (report.id === 'graphs_qs_by_hour') {
      return renderGraphsQsByHourCompare(null);
    }
    if (report.id === 'graphs_points_by_hour') {
      return renderGraphsPointsByHourCompare(null);
    }
    if (report.id === 'countries_by_time') {
      return renderCountriesByTimeCompareAligned(null);
    }
    if (report.id === 'possible_errors') {
      const slots = getActiveCompareSnapshots();
      const callSets = slots.map((entry) => (entry.ready ? buildCallSet(entry.snapshot.qsoData?.qsos || []) : new Set()));
      const note = 'Compare mode: callsigns appearing in other logs are omitted from Possible errors for each log.';
      const htmlBlocks = slots.map((entry, idx) => {
        if (!entry.ready) return `<p>No ${entry.label} loaded.</p>`;
        const exclude = new Set();
        callSets.forEach((set, setIdx) => {
          if (setIdx === idx) return;
          set.forEach((call) => exclude.add(call));
        });
        return renderPossibleErrorsFrom(entry.snapshot.derived, exclude, note);
      });
      return renderComparePanels(slots, htmlBlocks, 'possible_errors');
    }
    if (report.id === 'countries') return renderCountriesCompareAligned();
    if (report.id === 'continents') return renderContinentsCompareAligned();
    if (report.id === 'zones_cq') return renderZoneCompareAligned('cq');
    if (report.id === 'zones_itu') return renderZoneCompareAligned('itu');
    if (report.id === 'prefixes') return renderPrefixesCompareAligned();
    if (report.id === 'callsign_length') return renderCallsignLengthCompareAligned();
    if (report.id === 'callsign_structure') return renderCallsignStructureCompareAligned();
    if (report.id === 'distance') return renderDistanceCompareAligned();
    if (report.id === 'beam_heading') return renderBeamHeadingCompareAligned();
    if (report.id === 'qs_per_station') return renderQsPerStationCompareAligned();
    const slots = getActiveCompareSnapshots();
    const htmlBlocks = slots.map((entry) => (
      entry.ready ? withSlotState(entry.snapshot, () => renderReportSingle(report), { slotId: entry.id }) : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, report.id);
  }

  function renderReport(report) {
    if (SINGLE_INSTANCE_REPORT_IDS.has(report.id)) return renderReportSingle(report);
    if (state.compareEnabled) {
      return renderReportCompare(report);
    }
    return renderReportSingle(report);
  }

  let focusRenderTimer = null;
  function bindReportInteractions(reportId) {
    if (reportId !== 'rbn_compare_signal' && rbnCompareSignalResizeObserver) {
      rbnCompareSignalResizeObserver.disconnect();
      rbnCompareSignalResizeObserver = null;
      rbnCompareSignalResizeRaf = 0;
    }
    if (reportId !== 'rbn_compare_signal' && rbnCompareSignalIntersectionObserver) {
      rbnCompareSignalIntersectionObserver.disconnect();
      rbnCompareSignalIntersectionObserver = null;
    }
    wrapWideTables(dom.viewContainer, reportId);
    makeTablesSortable(dom.viewContainer);
    bindCompareScrollSync(reportId);
    attachLongReportJumpBar(dom.viewContainer, reportId);
    const compareToggleButtons = dom.viewContainer.querySelectorAll('.compare-ui-toggle');
    compareToggleButtons.forEach((btn) => {
      btn.addEventListener('click', (evt) => {
        evt.preventDefault();
        const toggle = String(btn.dataset.compareToggle || '').trim().toLowerCase();
        if (toggle === 'sync') {
          state.compareSyncEnabled = !state.compareSyncEnabled;
        } else if (toggle === 'sticky') {
          state.compareStickyEnabled = !state.compareStickyEnabled;
        } else {
          return;
        }
        renderReportWithLoading(reports[state.activeIndex]);
      });
    });
    const compareJumpButtons = dom.viewContainer.querySelectorAll('[data-compare-jump]');
    compareJumpButtons.forEach((btn) => {
      btn.addEventListener('click', (evt) => {
        evt.preventDefault();
        const targetId = String(btn.dataset.compareJump || '').trim();
        if (!targetId) return;
        if (reports[state.activeIndex]?.id === targetId) {
          renderReportWithLoading(reports[state.activeIndex]);
          return;
        }
        setActiveReportById(targetId, { silent: true });
      });
    });
    const chartModeButtons = dom.viewContainer.querySelectorAll('.chart-mode-btn');
    chartModeButtons.forEach((btn) => {
      btn.addEventListener('click', (evt) => {
        evt.preventDefault();
        const nextMode = normalizeChartMetricMode(btn.dataset.chartMode || '');
        if (nextMode === state.chartMetricMode) return;
        state.chartMetricMode = nextMode;
        renderReportWithLoading(reports[state.activeIndex]);
      });
    });
    const focusSelects = dom.viewContainer.querySelectorAll('.compare-focus-select');
    if (focusSelects.length) {
      focusSelects.forEach((select) => {
        select.addEventListener('change', () => {
          const baseId = select.dataset.focusReport || '';
          if (!baseId) return;
          const role = select.dataset.focusRole || 'a';
          const slots = getActiveCompareSnapshots();
          if (slots.length <= 2) return;
          const [currentLeft, currentRight] = getCompareFocusPair(baseId, slots);
          let left = currentLeft;
          let right = currentRight;
          if (role === 'a') {
            left = select.value;
          } else {
            right = select.value;
          }
          if (left === right) {
            const alt = slots.map((s) => s.id).find((id) => id !== left);
            if (role === 'a') right = alt || right;
            else left = alt || left;
          }
          state.compareFocus = state.compareFocus || {};
          state.compareFocus[baseId] = [left, right];
          if (focusRenderTimer) clearTimeout(focusRenderTimer);
          focusRenderTimer = setTimeout(() => {
            try {
              renderReportWithLoading(reports[state.activeIndex]);
            } catch (err) {
              console.error('Focus render failed:', err);
              showOverlayNotice('Unable to update focus view. Please try again.', 3000);
            }
          }, 0);
        });
      });
    }
    if (reportId === 'operators') {
      loadOperatorPhotos(dom.viewContainer);
    }
    if (reportId === 'spot_hunter') {
      if (dom.spotHunterStatusRow) dom.spotHunterStatusRow.classList.remove('hidden');
      updateDataStatus();
      loadSpotHunterModule()
        .then(() => {
          if (typeof window.SpotHunterRender === 'function') {
            window.SpotHunterRender();
          }
        })
        .catch((err) => {
          console.error(err);
          const containers = dom.viewContainer.querySelectorAll('.spot-hunter');
          containers.forEach((el) => {
            el.innerHTML = '<p>Unable to load Spot hunter module.</p>';
          });
        });
    }
    if (reportId === 'competitor_coach') {
      const scopeButtons = document.querySelectorAll('.coach-scope-btn');
      const categoryButtons = document.querySelectorAll('.coach-category-btn');
      const navButtons = document.querySelectorAll('.coach-brief-nav');

      const setActiveChoice = (buttons, predicate) => {
        buttons.forEach((btn) => {
          const active = Boolean(predicate(btn));
          btn.classList.toggle('active', active);
          btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      };

      const syncCoachControls = () => {
        state.competitorCoach = state.competitorCoach || createCompetitorCoachState();
        const activeScope = Array.from(scopeButtons).find((btn) => btn.classList.contains('active'));
        const activeCategory = Array.from(categoryButtons).find((btn) => btn.classList.contains('active'));
        if (activeScope) state.competitorCoach.scopeType = normalizeCoachScopeType(activeScope.dataset.scope || '');
        if (activeCategory) state.competitorCoach.categoryMode = activeCategory.dataset.categoryMode === 'all' ? 'all' : 'same';
      };

      scopeButtons.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
          evt.preventDefault();
          if (btn.disabled) return;
          const nextScope = btn.dataset.scope || '';
          setActiveChoice(scopeButtons, (item) => item.dataset.scope === nextScope);
          syncCoachControls();
          triggerCompetitorCoachRefresh(true);
        });
      });

      categoryButtons.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
          evt.preventDefault();
          if (btn.disabled) return;
          const nextMode = btn.dataset.categoryMode || 'same';
          setActiveChoice(categoryButtons, (item) => (item.dataset.categoryMode || 'same') === nextMode);
          syncCoachControls();
          triggerCompetitorCoachRefresh(true);
        });
      });

      navButtons.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
          evt.preventDefault();
          const target = String(btn.dataset.report || '').trim();
          if (!target) return;
          setActiveReportById(target);
        });
      });

      if (state.competitorCoach?.status === 'idle') {
        triggerCompetitorCoachRefresh(false);
      }
    }
    if (reportId === 'not_in_master') {
      const buttons = document.querySelectorAll('.not-master-btn');
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const list = state.derived?.notInMasterList || [];
          const pageSize = state.notInMasterPageSize || 500;
          const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
          const dir = btn.dataset.dir || '';
          if (dir === 'prev') {
            if (state.notInMasterPage > 0) {
              state.notInMasterPage -= 1;
              renderReportWithLoading(reports[state.activeIndex]);
            }
          } else if (dir === 'next') {
            if (state.notInMasterPage < totalPages - 1) {
              state.notInMasterPage += 1;
              renderReportWithLoading(reports[state.activeIndex]);
            }
          }
        });
      });
    }
    if (reportId === 'export') {
      const exportButtons = document.querySelectorAll('.export-action');
      exportButtons.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
          evt.preventDefault();
          const mode = btn.dataset.export;
          if (mode === 'pdf' || mode === 'html') {
            openExportDialog(mode);
            return;
          }
          if (mode === 'cbr') {
            const slotId = btn.dataset.slot || 'A';
            exportCbrForSlot(slotId);
          }
        });
      });
    }
    if (reportId === 'qsl_labels') {
      const btn = document.querySelector('.qsl-open-btn');
      if (btn) {
        btn.addEventListener('click', (evt) => {
          evt.preventDefault();
          openQslLabelTool();
        });
      }
    }
    const bindSpotControls = (source) => {
      const loadTargets = state.compareEnabled ? getLoadedCompareSlots() : [{ id: 'A', slot: state }];
      loadTargets.forEach((entry) => {
        if (!entry.slot?.derived || !entry.slot?.qsoData) return;
        const spotState = getSpotStateBySource(entry.slot, source);
        if (spotState.status === 'idle' || spotState.status === 'error') {
          loadSpotsForSource(entry.slot, source);
        }
      });
      const buttons = document.querySelectorAll(`.spots-load-btn[data-source="${source}"]`);
      buttons.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
          evt.preventDefault();
          const slotId = btn.dataset.slot || 'A';
          const slot = getSlotById(slotId) || state;
          loadSpotsForSource(slot, source);
        });
      });
      const windowInputs = document.querySelectorAll(`.spots-window[data-source="${source}"]:not([data-shared="1"])`);
      windowInputs.forEach((input) => {
        input.addEventListener('input', () => {
          const slotId = input.dataset.slot || 'A';
          const slot = getSlotById(slotId) || state;
          const spotState = getSpotStateBySource(slot, source);
          spotState.windowMinutes = Number(input.value) || 15;
          const valueEl = document.querySelector(`.spots-window-value[data-slot="${slotId}"][data-source="${source}"]`);
          if (valueEl) valueEl.textContent = String(spotState.windowMinutes);
          computeSpotsStats(slot, spotState);
          renderActiveReport();
        });
      });
      const filters = document.querySelectorAll(`.spots-band-filter[data-source="${source}"]:not([data-shared="1"])`);
      filters.forEach((el) => {
        el.addEventListener('change', () => {
          const slotId = el.dataset.slot || 'A';
          const slot = getSlotById(slotId) || state;
          const spotState = getSpotStateBySource(slot, source);
          const band = el.dataset.band || '';
          const current = new Set(spotState.bandFilter || []);
          if (band === 'ALL') {
            if (el.checked) current.clear();
          } else {
            if (el.checked) current.add(band);
            else current.delete(band);
          }
          spotState.bandFilter = Array.from(current);
          computeSpotsStats(slot, spotState);
          renderActiveReport();
        });
      });
      const heatCells = document.querySelectorAll(`.spots-heat-cell[data-source="${source}"]`);
      heatCells.forEach((cell) => {
        cell.addEventListener('click', (evt) => {
          evt.preventDefault();
          const slotId = cell.dataset.slot || 'A';
          const slot = getSlotById(slotId) || state;
          const spotState = getSpotStateBySource(slot, source);
          const band = normalizeBandToken(cell.dataset.band || '') || '';
          const hour = Number(cell.dataset.hour);
          if (!band || !Number.isFinite(hour)) return;
          spotState.drillBand = band;
          spotState.drillHour = Math.max(0, Math.min(23, Math.round(hour)));
          spotState.drillContinent = '';
          spotState.drillCqZone = '';
          spotState.drillItuZone = '';
          renderActiveReport();
        });
      });
      const drillClearButtons = document.querySelectorAll(`.spots-drill-clear[data-source="${source}"]`);
      drillClearButtons.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
          evt.preventDefault();
          const slotId = btn.dataset.slot || 'A';
          const slot = getSlotById(slotId) || state;
          const spotState = getSpotStateBySource(slot, source);
          spotState.drillBand = '';
          spotState.drillHour = null;
          spotState.drillContinent = '';
          spotState.drillCqZone = '';
          spotState.drillItuZone = '';
          renderActiveReport();
        });
      });
      const drillFilterButtons = document.querySelectorAll(`.spots-drill-filter-btn[data-source="${source}"]`);
      drillFilterButtons.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
          evt.preventDefault();
          const slotId = btn.dataset.slot || 'A';
          const slot = getSlotById(slotId) || state;
          const spotState = getSpotStateBySource(slot, source);
          const type = String(btn.dataset.type || '').trim().toLowerCase();
          const value = String(btn.dataset.value || '').trim().toUpperCase();
          if (type === 'continent') {
            spotState.drillContinent = value;
          } else if (type === 'cq') {
            spotState.drillCqZone = value;
          } else if (type === 'itu') {
            spotState.drillItuZone = value;
          } else {
            return;
          }
          renderActiveReport();
        });
      });
      const coachActions = document.querySelectorAll(`.spots-coach-action[data-source="${source}"]`);
      coachActions.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
          evt.preventDefault();
          const targetId = String(btn.dataset.target || '').trim();
          if (!targetId) return;
          const target = document.getElementById(targetId);
          if (!target) return;
          const reduceMotion = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
          target.scrollIntoView({
            block: 'start',
            behavior: reduceMotion ? 'auto' : 'smooth'
          });
        });
      });
      const sharedWindow = document.querySelectorAll(`.spots-window[data-source="${source}"][data-shared="1"]`);
      sharedWindow.forEach((input) => {
        input.addEventListener('input', () => {
          const next = Number(input.value) || 15;
          const valueEl = document.querySelector(`.spots-window-value[data-source="${source}"][data-shared="1"]`);
          if (valueEl) valueEl.textContent = String(next);
          const targets = state.compareEnabled ? getLoadedCompareSlots() : [{ id: 'A', slot: state }];
          targets.forEach((entry) => {
            const spotState = getSpotStateBySource(entry.slot, source);
            spotState.windowMinutes = next;
            computeSpotsStats(entry.slot, spotState);
          });
          renderActiveReport();
        });
      });
      const sharedFilters = document.querySelectorAll(`.spots-band-filter[data-source="${source}"][data-shared="1"]`);
      sharedFilters.forEach((el) => {
        el.addEventListener('change', () => {
          const band = el.dataset.band || '';
          const targets = state.compareEnabled ? getLoadedCompareSlots() : [{ id: 'A', slot: state }];
          targets.forEach((entry) => {
            const spotState = getSpotStateBySource(entry.slot, source);
            const current = new Set(spotState.bandFilter || []);
            if (band === 'ALL') {
              if (el.checked) current.clear();
            } else {
              if (el.checked) current.add(band);
              else current.delete(band);
            }
            spotState.bandFilter = Array.from(current);
            computeSpotsStats(entry.slot, spotState);
          });
          renderActiveReport();
        });
      });
      if (source === 'rbn') {
        const daySelects = document.querySelectorAll(`.rbn-day-select[data-source="${source}"]`);
        daySelects.forEach((select) => {
          select.addEventListener('change', () => {
            const slotId = select.dataset.slot || 'A';
            const scoped = Array.from(document.querySelectorAll(`.rbn-day-select[data-source="${source}"][data-slot="${slotId}"]`));
            const values = scoped.map((s) => s.value).filter(Boolean);
            if (scoped.length === 2 && values.length === 2 && values[0] === values[1]) {
              const options = Array.from(select.options).map((o) => o.value);
              const next = options.find((v) => v !== values[0]);
              if (next) {
                const other = scoped[0] === select ? scoped[1] : scoped[0];
                other.value = next;
              }
            }
            const slot = getSlotById(slotId) || state;
            const rbnState = getSpotStateBySource(slot, 'rbn');
            rbnState.selectedDays = scoped.map((s) => s.value).filter(Boolean).slice(0, 2);
            renderActiveReport();
          });
        });
      }
    };
    if (reportId === 'spots') {
      if (dom.spotsStatusRow) dom.spotsStatusRow.classList.remove('hidden');
      updateDataStatus();
      bindSpotControls('spots');
      alignSpotsCompareSections(reportId);
    }
    if (reportId === 'rbn_spots') {
      if (dom.rbnStatusRow) dom.rbnStatusRow.classList.remove('hidden');
      updateDataStatus();
      bindSpotControls('rbn');
      alignSpotsCompareSections(reportId);
    }
    if (reportId === 'rbn_compare_signal') {
      if (dom.rbnStatusRow) dom.rbnStatusRow.classList.remove('hidden');
      updateDataStatus();
      bindSpotControls('rbn');
      const slotEntries = getActiveCompareSlots().filter((e) => e.slot?.qsoData && e.slot?.derived);
      slotEntries.forEach((entry) => {
        if (entry.slot?.rbnState?.status === 'ready') scheduleRbnCompareIndexBuild(entry.id, entry.slot);
      });
      const selects = dom.viewContainer.querySelectorAll('.rbn-signal-select');
      selects.forEach((select) => {
        select.addEventListener('change', () => {
          const cont = String(select.dataset.continent || '').trim().toUpperCase() || 'N/A';
          const value = normalizeSpotterBase(String(select.value || '').trim());
          state.rbnCompareSignal = state.rbnCompareSignal && typeof state.rbnCompareSignal === 'object'
            ? state.rbnCompareSignal
            : { selectedByContinent: {} };
          if (!state.rbnCompareSignal.selectedByContinent) state.rbnCompareSignal.selectedByContinent = {};
          state.rbnCompareSignal.selectedByContinent[cont] = value;
          const canvas = select.closest('.rbn-signal-card')?.querySelector('.rbn-signal-canvas');
          if (canvas) canvas.dataset.spotter = value;
          scheduleRbnCompareSignalDraw();
        });
      });
      if (rbnCompareSignalResizeObserver) {
        rbnCompareSignalResizeObserver.disconnect();
        rbnCompareSignalResizeObserver = null;
        rbnCompareSignalResizeRaf = 0;
      }
      const grid = dom.viewContainer ? dom.viewContainer.querySelector('.rbn-signal-grid') : null;
      if (grid && typeof ResizeObserver === 'function') {
        const schedule = () => {
          if (rbnCompareSignalResizeRaf) return;
          rbnCompareSignalResizeRaf = requestAnimationFrame(() => {
            rbnCompareSignalResizeRaf = 0;
            scheduleRbnCompareSignalDraw();
          });
        };
        rbnCompareSignalResizeObserver = new ResizeObserver(schedule);
        rbnCompareSignalResizeObserver.observe(grid);
      }
      if (rbnCompareSignalIntersectionObserver) {
        rbnCompareSignalIntersectionObserver.disconnect();
        rbnCompareSignalIntersectionObserver = null;
      }
      const canvases = Array.from(dom.viewContainer.querySelectorAll('.rbn-signal-canvas'));
      canvases.forEach((c) => { if (c instanceof HTMLCanvasElement) c.dataset.rbnVisible = '0'; });
      if (typeof IntersectionObserver === 'function') {
        rbnCompareSignalIntersectionObserver = new IntersectionObserver((entries) => {
          let touched = false;
          entries.forEach((e) => {
            const target = e.target;
            if (!(target instanceof HTMLCanvasElement)) return;
            if (e.isIntersecting) {
              target.dataset.rbnVisible = '1';
              touched = true;
            }
          });
          if (touched) scheduleRbnCompareSignalDraw();
        }, { root: null, rootMargin: '240px 0px', threshold: 0.01 });
        canvases.forEach((c) => {
          if (c instanceof HTMLCanvasElement) rbnCompareSignalIntersectionObserver.observe(c);
        });
      } else {
        canvases.forEach((c) => { if (c instanceof HTMLCanvasElement) c.dataset.rbnVisible = '1'; });
      }
      populateRbnCompareSignalSpotterSelects();
      scheduleRbnCompareSignalDraw();
    }
    if (reportId === 'load_logs') {
      const revealLoadPanel = () => {
        state.showLoadPanel = true;
        document.body.classList.remove('landing-only');
        document.body.classList.add('load-active');
        if (dom.loadPanel) dom.loadPanel.style.display = 'block';
        const landingPage = document.querySelector('.landing-page');
        if (landingPage) landingPage.classList.add('is-hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      const landingStart = document.querySelectorAll('.landing-start-link');
      landingStart.forEach((link) => {
        link.addEventListener('click', (evt) => {
          evt.preventDefault();
          revealLoadPanel();
          if (dom.loadPanel) {
            dom.loadPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
      const shortcuts = document.querySelectorAll('.report-shortcut');
      shortcuts.forEach((link) => {
        link.addEventListener('click', (evt) => {
          evt.preventDefault();
          const reportId = link.dataset.report;
          const mapScope = link.dataset.map;
          if (mapScope) {
            state.mapContext = { scope: mapScope, key: '' };
            dom.viewTitle.textContent = 'Map';
            dom.viewContainer.innerHTML = renderMapView();
            bindReportInteractions('map_view');
            return;
          }
          if (!reportId) return;
          setActiveReportById(reportId, { silent: true });
        });
      });
    }
    if (reportId === 'log') {
      const prev = document.getElementById('logPrev');
      const next = document.getElementById('logNext');
      const pageLinks = document.querySelectorAll('.log-page');
      const searchForm = document.getElementById('logSearchForm');
      const searchInput = document.getElementById('logSearchInput');
      const searchClear = document.getElementById('logSearchClear');
      const clearFilters = document.getElementById('logClearFilters');
      if (prev) prev.addEventListener('click', () => {
        if (state.logPage > 0) {
          state.logPage -= 1;
          renderReportWithLoading(reports[state.activeIndex]);
        }
      });
      if (next) next.addEventListener('click', () => {
        const search = (state.logSearch || '').trim().toUpperCase();
        const fieldFilter = (state.logFieldFilter || '').trim().toUpperCase();
        const bandFilter = (state.logBandFilter || '').trim().toUpperCase();
        const modeFilter = (state.logModeFilter || '').trim();
        const opFilter = (state.logOpFilter || '').trim().toUpperCase();
        const callLenFilter = Number.isFinite(state.logCallLenFilter)
          ? state.logCallLenFilter
          : (state.logCallLenFilter != null ? Number(state.logCallLenFilter) : null);
        const callStructFilter = (state.logCallStructFilter || '').trim();
        const countryFilter = (state.logCountryFilter || '').trim().toUpperCase();
        const continentFilter = (state.logContinentFilter || '').trim().toUpperCase();
        const cqFilter = (state.logCqFilter || '').trim();
        const ituFilter = (state.logItuFilter || '').trim();
        const rangeFilter = state.logRange;
        const timeRange = state.logTimeRange;
        const stationQsoRange = state.logStationQsoRange;
        const distanceRange = state.logDistanceRange;
        let filtered = state.qsoData?.qsos || [];
        if (search) {
          filtered = filtered.filter((q) => q.call && q.call.includes(search));
        }
        if (fieldFilter) {
          filtered = filtered.filter((q) => q.grid && q.grid.startsWith(fieldFilter));
        }
        if (bandFilter) {
          filtered = filtered.filter((q) => q.band && q.band.toUpperCase() === bandFilter);
        }
        if (modeFilter && modeFilter !== 'All') {
          filtered = filtered.filter((q) => modeBucket(q.mode) === modeFilter);
        }
        if (opFilter) {
          filtered = filtered.filter((q) => q.op && q.op.toUpperCase() === opFilter);
        }
        if (Number.isFinite(callLenFilter)) {
          filtered = filtered.filter((q) => q.call && q.call.length === callLenFilter);
        }
        if (callStructFilter) {
          filtered = filtered.filter((q) => q.call && classifyCallStructure(q.call) === callStructFilter);
        }
        if (countryFilter) {
          filtered = filtered.filter((q) => q.country && q.country.toUpperCase() === countryFilter);
        }
        if (continentFilter) {
          filtered = filtered.filter((q) => q.continent && q.continent.toUpperCase() === continentFilter);
        }
        if (cqFilter) {
          filtered = filtered.filter((q) => String(q.cqZone || '') === cqFilter);
        }
        if (ituFilter) {
          filtered = filtered.filter((q) => String(q.ituZone || '') === ituFilter);
        }
        if (rangeFilter && Number.isFinite(rangeFilter.start) && Number.isFinite(rangeFilter.end)) {
          filtered = filtered.filter((q) => {
            const n = Number(q.qsoNumber);
            return Number.isFinite(n) && n >= rangeFilter.start && n <= rangeFilter.end;
          });
        }
        if (timeRange && Number.isFinite(timeRange.startTs) && Number.isFinite(timeRange.endTs)) {
          filtered = filtered.filter((q) => typeof q.ts === 'number' && q.ts >= timeRange.startTs && q.ts <= timeRange.endTs);
        }
        if (stationQsoRange && Number.isFinite(stationQsoRange.min) && Number.isFinite(stationQsoRange.max)) {
          filtered = filtered.filter((q) => Number.isFinite(q.callCount) && q.callCount >= stationQsoRange.min && q.callCount <= stationQsoRange.max);
        }
        if (distanceRange && Number.isFinite(distanceRange.start) && Number.isFinite(distanceRange.end)) {
          filtered = filtered.filter((q) => Number.isFinite(q.distance) && q.distance >= distanceRange.start && q.distance <= distanceRange.end);
        }
        const filteredCount = filtered.length;
        const totalPages = Math.max(1, Math.ceil(filteredCount / state.logPageSize));
        if (state.logPage < totalPages - 1) {
          state.logPage += 1;
          renderReportWithLoading(reports[state.activeIndex]);
        }
      });
      pageLinks.forEach((link) => {
        link.addEventListener('click', (evt) => {
          evt.preventDefault();
          const page = parseInt(link.dataset.page, 10);
          if (Number.isFinite(page)) {
            state.logPage = page;
            renderReportWithLoading(reports[state.activeIndex]);
          }
        });
      });
      if (searchForm) {
        searchForm.addEventListener('submit', (evt) => {
          evt.preventDefault();
          state.logSearch = (searchInput?.value || '').trim().toUpperCase();
          state.logFieldFilter = '';
          state.logBandFilter = '';
          state.logModeFilter = '';
          state.logOpFilter = '';
          state.logCallLenFilter = null;
          state.logCallStructFilter = '';
          state.logCountryFilter = '';
          state.logContinentFilter = '';
          state.logCqFilter = '';
          state.logItuFilter = '';
          state.logRange = null;
          state.logTimeRange = null;
          state.logHeadingRange = null;
          state.logStationQsoRange = null;
          state.logDistanceRange = null;
          state.logPage = 0;
          renderReportWithLoading(reports[state.activeIndex]);
        });
      }
      if (searchClear) {
        searchClear.addEventListener('click', () => {
          state.logSearch = '';
          state.logFieldFilter = '';
          state.logBandFilter = '';
          state.logModeFilter = '';
          state.logOpFilter = '';
          state.logCallLenFilter = null;
          state.logCallStructFilter = '';
          state.logCountryFilter = '';
          state.logContinentFilter = '';
          state.logCqFilter = '';
          state.logItuFilter = '';
          state.logRange = null;
          state.logTimeRange = null;
          state.logHeadingRange = null;
          state.logStationQsoRange = null;
          state.logDistanceRange = null;
          state.logPage = 0;
          renderReportWithLoading(reports[state.activeIndex]);
        });
      }
      if (clearFilters) {
        clearFilters.addEventListener('click', (evt) => {
          evt.preventDefault();
          state.logSearch = '';
          state.logFieldFilter = '';
          state.logBandFilter = '';
          state.logModeFilter = '';
          state.logOpFilter = '';
          state.logCallLenFilter = null;
          state.logCallStructFilter = '';
          state.logCountryFilter = '';
          state.logContinentFilter = '';
          state.logCqFilter = '';
          state.logItuFilter = '';
          state.logRange = null;
          state.logTimeRange = null;
          state.logHeadingRange = null;
          state.logStationQsoRange = null;
          state.logDistanceRange = null;
          state.logPage = 0;
          renderReportWithLoading(reports[state.activeIndex]);
        });
      }
      const compareButtons = document.querySelectorAll('.compare-window-btn');
      compareButtons.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
          evt.preventDefault();
          if (btn.disabled) return;
          const size = state.compareLogWindowSize || 1000;
          const dir = btn.dataset.dir || '';
          if (dir === 'prev') {
            state.compareLogWindowStart = Math.max(0, (state.compareLogWindowStart || 0) - size);
          } else {
            state.compareLogWindowStart = (state.compareLogWindowStart || 0) + size;
          }
          renderReportWithLoading(reports[state.activeIndex]);
        });
      });
    }
    if (reportId === 'session') {
      const permalinkBtn = document.querySelector('.session-permalink');
      const saveBtn = document.querySelector('.session-save');
      const loadBtn = document.querySelector('.session-load');
      const fileInput = document.getElementById('sessionFileInput');
      if (permalinkBtn) {
        permalinkBtn.addEventListener('click', async () => {
          const link = buildPermalink();
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(link);
              trackEvent('session_permalink_copy', { method: 'clipboard' });
              showOverlayNotice('Permalink copied to clipboard.', 2000);
              return;
            }
          } catch (err) {
            trackEvent('session_permalink_error', {
              method: 'clipboard',
              message: err && err.message ? err.message : 'clipboard failed'
            });
            /* fallback below */
          }
          trackEvent('session_permalink_copy', { method: 'prompt' });
          window.prompt('Copy permalink:', link);
        });
      }
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          try {
            const payload = buildSessionPayload(true);
            const json = JSON.stringify(payload, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const ts = new Date();
            const stamp = `${ts.getUTCFullYear()}${String(ts.getUTCMonth() + 1).padStart(2, '0')}${String(ts.getUTCDate()).padStart(2, '0')}-${String(ts.getUTCHours()).padStart(2, '0')}${String(ts.getUTCMinutes()).padStart(2, '0')}`;
            const name = `sh6-session-${stamp}.json`;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            trackEvent('session_save', {
              size: json.length,
              compare: state.compareEnabled ? 'yes' : 'no',
              compare_count: state.compareCount || 1
            });
            showOverlayNotice('Session saved.', 2000);
          } catch (err) {
            trackEvent('session_save_error', {
              message: err && err.message ? err.message : 'save failed'
            });
            showOverlayNotice('Unable to save session.', 3000);
          }
        });
      }
      if (loadBtn && fileInput) {
        loadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async () => {
          const file = fileInput.files && fileInput.files[0];
          if (!file) return;
          try {
            trackEvent('session_load_start', {
              size: file.size || 0
            });
            const text = await file.text();
            const payload = JSON.parse(text);
            await applySessionPayload(payload, { fromPermalink: false });
            trackEvent('session_load_success', {
              size: file.size || 0
            });
            showOverlayNotice('Session loaded.', 2000);
          } catch (err) {
            trackEvent('session_load_error', {
              message: err && err.message ? err.message : 'load failed'
            });
            showOverlayNotice('Failed to load session file.', 3000);
          } finally {
            fileInput.value = '';
          }
        });
      }
    }
    if (reportId === 'raw_log') {
      const buttons = document.querySelectorAll('.raw-log-console');
      const copyButtons = document.querySelectorAll('.raw-log-copy');
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const slotId = btn.dataset.slot;
          const slotState = getSlotById(slotId);
          const text = slotState?.rawLogText || '';
          if (text) {
            console.log(text);
          } else {
            console.log('No raw log text available.');
          }
        });
      });
      copyButtons.forEach((btn) => {
        btn.addEventListener('click', async () => {
          const slotId = btn.dataset.slot;
          const slotState = getSlotById(slotId);
          const text = slotState?.rawLogText || '';
          if (!text) return;
          const original = btn.textContent;
          const ok = await copyToClipboard(text);
          btn.textContent = ok ? 'Copied!' : 'Copy failed';
          setTimeout(() => {
            btn.textContent = original;
          }, 1200);
        });
      });
    }
    if (reportId === 'fields_map') {
      const cells = document.querySelectorAll('.field-cell');
      cells.forEach((cell) => {
        cell.addEventListener('click', (evt) => {
          evt.preventDefault();
          const field = cell.dataset.field;
          if (!field) return;
          state.logSearch = '';
          state.logFieldFilter = field;
          state.logBandFilter = '';
          state.logModeFilter = '';
          state.logOpFilter = '';
          state.logCallLenFilter = null;
          state.logCallStructFilter = '';
          state.logCountryFilter = '';
          state.logContinentFilter = '';
          state.logCqFilter = '';
          state.logItuFilter = '';
          state.logRange = null;
          state.logTimeRange = null;
          state.logHeadingRange = null;
          state.logStationQsoRange = null;
          state.logDistanceRange = null;
          state.logPage = 0;
          const logIndex = reports.findIndex((r) => r.id === 'log');
          if (logIndex >= 0) setActiveReport(logIndex);
        });
      });
    }

    const cqApiLoadButtons = document.querySelectorAll('.cqapi-load-btn');
    cqApiLoadButtons.forEach((btn) => {
      btn.addEventListener('click', async (evt) => {
        evt.preventDefault();
        if (btn.disabled) return;
        const slotId = String(btn.dataset.slot || '').toUpperCase();
        const year = Number(btn.dataset.year);
        const callsign = normalizeCall(btn.dataset.callsign || '');
        const contestId = String(btn.dataset.contest || '').trim().toUpperCase();
        const mode = String(btn.dataset.mode || '').trim().toLowerCase();
        if (!slotId || !Number.isFinite(year) || !callsign || !contestId || !mode) {
          showOverlayNotice('Missing CQ API load details for this row.', 2500);
          return;
        }

        const originalText = btn.textContent;
        btn.disabled = true;
        btn.classList.add('is-loading');
        btn.textContent = '...';

        trackEvent('cqapi_compare_load_click', {
          slot: slotId,
          callsign,
          contest: contestId,
          mode,
          year
        });

        try {
          const result = await loadCqApiHistoryArchiveToSlot({
            slotId,
            callsign,
            contestId,
            mode,
            year
          });
          if (btn.classList.contains('coach-load-btn')) {
            const rowKey = String(btn.dataset.rowKey || '').trim()
              || buildCoachRowKey({ callsign, year, contestId, mode });
            if (rowKey) {
              const coach = state.competitorCoach || createCompetitorCoachState();
              const nextLoadedSlots = { ...(coach.loadedSlotRows || {}) };
              nextLoadedSlots[slotId] = rowKey;
              state.competitorCoach = {
                ...coach,
                loadedSlotRows: nextLoadedSlots,
                lastLoadedSlot: slotId,
                lastLoadedRowKey: rowKey
              };
            }
          }
          btn.classList.remove('is-loading');
          btn.classList.add('is-ok');
          btn.textContent = 'OK';
          showOverlayNotice(`Loaded ${callsign} ${contestId} ${year} into Log ${slotId}.`, 2200);
          trackEvent('cqapi_compare_load_success', {
            slot: slotId,
            callsign,
            contest: contestId,
            mode,
            year,
            path: result.path || ''
          });
          if (btn.classList.contains('coach-load-btn') && reports[state.activeIndex]?.id === 'competitor_coach') {
            renderActiveReport();
            return;
          }
          setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('is-ok');
            btn.disabled = false;
          }, 900);
        } catch (err) {
          const message = err && err.message ? err.message : 'Unable to load archive log';
          btn.classList.remove('is-loading');
          btn.classList.add('is-error');
          btn.textContent = 'ERR';
          showOverlayNotice(message, 3200);
          trackEvent('cqapi_compare_load_error', {
            slot: slotId,
            callsign,
            contest: contestId,
            mode,
            year,
            message
          });
          setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('is-error');
            btn.disabled = false;
          }, 1200);
        }
      });
    });

    const rangeLinks = document.querySelectorAll('.log-range');
    rangeLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const start = Number(link.dataset.start);
        const end = Number(link.dataset.end);
        if (!Number.isFinite(start) || !Number.isFinite(end)) return;
        state.logRange = { start, end };
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = '';
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const filterLinks = document.querySelectorAll('.log-filter');
    filterLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const band = (link.dataset.band || '').trim().toUpperCase();
        const mode = (link.dataset.mode || '').trim();
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = band === 'ALL' ? '' : band;
        state.logModeFilter = mode === 'All' ? '' : (mode || '');
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const mapLinks = document.querySelectorAll('.map-link');
    mapLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const scope = link.dataset.scope || 'map';
        const key = link.dataset.key || '';
        showMapView(scope, key);
      });
    });

    const kmzLinks = document.querySelectorAll('.kmz-link');
    kmzLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const band = link.dataset.band || '';
        const mapSvg = document.getElementById('mapSvg');
        if (mapSvg) {
          const label = mapSvg.querySelector('text');
          if (label) label.textContent = band ? `Map preview (KMZ ${band === 'All' ? 'All QSOs' : `${band}m`} selected)` : 'Map preview (placeholder)';
        }
      });
    });

    const callLinks = document.querySelectorAll('.log-call');
    callLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const call = (link.dataset.call || '').trim().toUpperCase();
        if (!call) return;
        state.logRange = null;
        state.logSearch = call;
        state.logFieldFilter = '';
        state.logBandFilter = '';
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const callBandLinks = document.querySelectorAll('.log-call-band');
    callBandLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const call = (link.dataset.call || '').trim().toUpperCase();
        const band = (link.dataset.band || '').trim().toUpperCase();
        if (!call || !band) return;
        state.logRange = null;
        state.logSearch = call;
        state.logFieldFilter = '';
        state.logBandFilter = band;
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const opLinks = document.querySelectorAll('.log-op');
    opLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const op = (link.dataset.op || '').trim().toUpperCase();
        if (!op) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = '';
        state.logModeFilter = '';
        state.logOpFilter = op;
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const callLenLinks = document.querySelectorAll('.log-call-len');
    callLenLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const len = Number(link.dataset.len);
        if (!Number.isFinite(len)) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = '';
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = len;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const callStructLinks = document.querySelectorAll('.log-call-struct');
    callStructLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const struct = (link.dataset.struct || '').trim();
        if (!struct) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = '';
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = struct;
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const stationQsoLinks = document.querySelectorAll('.log-station-qso');
    stationQsoLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const min = Number(link.dataset.min);
        const max = Number(link.dataset.max);
        if (!Number.isFinite(min) || !Number.isFinite(max)) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = '';
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = { min, max };
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const countryLinks = document.querySelectorAll('.log-country');
    countryLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const country = (link.dataset.country || '').trim().toUpperCase();
        if (!country) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = '';
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = country;
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const countryUniqueLinks = document.querySelectorAll('.log-country-unique');
    countryUniqueLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const country = (link.dataset.country || '').trim().toUpperCase();
        if (!country) return;
        state.allCallsignsCountryFilter = country;
        const reportIndex = reports.findIndex((r) => r.id === 'all_callsigns');
        if (reportIndex >= 0) setActiveReport(reportIndex);
      });
    });

    const clearAllCallsCountryLinks = document.querySelectorAll('.all-calls-clear-country');
    clearAllCallsCountryLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        state.allCallsignsCountryFilter = '';
        renderActiveReport();
      });
    });

    const distanceLinks = document.querySelectorAll('.log-distance');
    distanceLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const start = Number(link.dataset.start);
        const end = Number(link.dataset.end);
        const band = (link.dataset.band || '').trim().toUpperCase();
        if (!Number.isFinite(start) || !Number.isFinite(end)) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = band;
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = { start, end };
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const continentLinks = document.querySelectorAll('.log-continent');
    continentLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const continent = (link.dataset.continent || '').trim().toUpperCase();
        if (!continent) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = '';
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = continent;
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const continentBandLinks = document.querySelectorAll('.log-continent-band');
    continentBandLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const continent = (link.dataset.continent || '').trim().toUpperCase();
        const band = (link.dataset.band || '').trim().toUpperCase();
        if (!continent) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = band;
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = continent;
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const headingLinks = document.querySelectorAll('.log-heading');
    headingLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const heading = Number(link.dataset.heading);
        if (!Number.isFinite(heading)) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = '';
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logHeadingRange = { start: heading, end: heading + 9 };
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const headingBandLinks = document.querySelectorAll('.log-heading-band');
    headingBandLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const heading = Number(link.dataset.heading);
        const band = (link.dataset.band || '').trim().toUpperCase();
        if (!Number.isFinite(heading)) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = band;
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logHeadingRange = { start: heading, end: heading + 9 };
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const hourLinks = document.querySelectorAll('.log-hour');
    hourLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const hour = Number(link.dataset.hour);
        if (!Number.isFinite(hour)) return;
        const startTs = hour * 3600000;
        const endTs = startTs + 3599999;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = '';
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = { startTs, endTs };
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const hourBandLinks = document.querySelectorAll('.log-hour-band');
    hourBandLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const hour = Number(link.dataset.hour);
        const band = (link.dataset.band || '').trim().toUpperCase();
        if (!Number.isFinite(hour)) return;
        const startTs = hour * 3600000;
        const endTs = startTs + 3599999;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = band;
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = { startTs, endTs };
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const minuteLinks = document.querySelectorAll('.log-minute');
    minuteLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const minute = Number(link.dataset.minute);
        if (!Number.isFinite(minute)) return;
        const startTs = minute * 60000;
        const endTs = startTs + 59999;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = '';
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = { startTs, endTs };
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const countryFilters = document.querySelectorAll('.log-country-filter');
    countryFilters.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const country = (link.dataset.country || '').trim().toUpperCase();
        const band = (link.dataset.band || '').trim().toUpperCase();
        const mode = (link.dataset.mode || '').trim();
        if (!country) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = band;
        state.logModeFilter = mode || '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = country;
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const cqLinks = document.querySelectorAll('.log-cq');
    cqLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const cq = (link.dataset.cq || '').trim();
        const band = (link.dataset.band || '').trim().toUpperCase();
        if (!cq) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = band;
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = cq;
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    const ituLinks = document.querySelectorAll('.log-itu');
    ituLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const itu = (link.dataset.itu || '').trim();
        const band = (link.dataset.band || '').trim().toUpperCase();
        if (!itu) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = band;
        state.logModeFilter = '';
        state.logOpFilter = '';
        state.logCallLenFilter = null;
        state.logCallStructFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = itu;
        state.logTimeRange = null;
        state.logHeadingRange = null;
        state.logStationQsoRange = null;
        state.logDistanceRange = null;
        state.logPage = 0;
        const logIndex = reports.findIndex((r) => r.id === 'log');
        if (logIndex >= 0) setActiveReport(logIndex);
      });
    });

    if (reportId === 'map_view') {
      const backBtn = document.getElementById('mapBack');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          setActiveReport(state.activeIndex);
        });
      }
      initLeafletMap(state.mapContext);
    }
    if (reportId === 'breaks') {
      const sliders = dom.viewContainer.querySelectorAll('.break-threshold');
      const values = dom.viewContainer.querySelectorAll('.break-threshold-value');
      const updateDisplay = (next) => {
        const text = String(next);
        values.forEach((el) => { el.textContent = text; });
        sliders.forEach((el) => {
          if (Number(el.value) !== next) el.value = text;
        });
      };
      sliders.forEach((slider) => {
        slider.addEventListener('input', () => {
          const next = Number(slider.value) || 60;
          state.breakThreshold = next;
          updateDisplay(next);
        });
        slider.addEventListener('change', () => {
          renderReportWithLoading(reports[state.activeIndex]);
        });
      });
    }
    if (reportId === 'passed_qsos') {
      const sliders = dom.viewContainer.querySelectorAll('.passed-window');
      const values = dom.viewContainer.querySelectorAll('.passed-window-value');
      const updateDisplay = (next) => {
        const text = String(next);
        values.forEach((el) => { el.textContent = text; });
        sliders.forEach((el) => {
          if (Number(el.value) !== next) el.value = text;
        });
      };
      sliders.forEach((slider) => {
        slider.addEventListener('input', () => {
          const next = Number(slider.value) || 10;
          state.passedQsoWindow = next;
          updateDisplay(next);
        });
        slider.addEventListener('change', () => {
          renderReportWithLoading(reports[state.activeIndex]);
        });
      });
    }
    const demoButtons = document.querySelectorAll('.demo-log-btn');
    demoButtons.forEach((btn) => {
      btn.addEventListener('click', (evt) => {
        evt.preventDefault();
        const slotId = btn.dataset.slot || 'A';
        setSlotAction(slotId, 'demo');
        loadDemoLog(slotId);
      });
    });
  }

  function renderBreaksForDerived(derived, slotLabel, options = {}) {
    if (!derived || !derived.minuteSeries) return renderPlaceholder({ id: 'breaks', title: 'Break time' });
    const threshold = state.breakThreshold || 60;
    const minutesMap = new Map(derived.minuteSeries.map((m) => [m.minute, m.qsos]));
    const breakSummary = computeBreakSummary(minutesMap, threshold);
    const slotAttr = slotLabel ? ` data-break-slot="${slotLabel}"` : '';
    const showControls = options.showControls !== false;
    const slider = showControls ? `
      <div class="break-controls"${slotAttr}>
        Break threshold (minutes):
        <input type="range" class="break-threshold"${slotAttr} min="2" max="60" step="1" value="${threshold}">
        <span class="break-threshold-value"${slotAttr}>${threshold}</span>
      </div>
    ` : '';
    if (!breakSummary.breaks.length) return `${slider}<p>No breaks detected.</p>`;
    let accum = 0;
    const rows = breakSummary.breaks.map((b, idx) => {
      accum += b.minutes;
      const start = formatDateSh6(b.start * 60000);
      const end = formatDateSh6(b.end * 60000);
      const len = `${String(Math.floor(b.minutes / 60)).padStart(2, '0')}:${String(b.minutes % 60).padStart(2, '0')}`;
      const acc = `${String(Math.floor(accum / 60)).padStart(2, '0')}:${String(accum % 60).padStart(2, '0')}`;
      const cls = idx % 2 === 0 ? 'td1' : 'td0';
      return `<tr class="${cls}"><td>${idx + 1}</td><td>${start}</td><td>${end}</td><td>${len}</td><td>${acc}</td></tr>`;
    }).join('');
    const totalHours = `${Math.floor(breakSummary.totalBreakMin / 60)}:${String(breakSummary.totalBreakMin % 60).padStart(2, '0')} (${breakSummary.totalBreakMin} min)`;
    return `
      ${slider}
      <p>Total break time (&gt;${threshold} min gaps): ${totalHours}</p>
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>From</th><th>To</th><th>Break time,HH:mm</th><th>Accum.HH:mm</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderBreaks() {
    return renderBreaksForDerived(state.derived, 'A');
  }

  function renderBreaksCompare() {
    const slots = getActiveCompareSnapshots();
    const htmlBlocks = slots.map((entry) => (
      entry.ready ? renderBreaksForDerived(entry.snapshot.derived, entry.id, { showControls: false }) : `<p>No ${entry.label} loaded.</p>`
    ));
    const slider = `
      <div class="break-controls">
        Break threshold (minutes):
        <input type="range" class="break-threshold" min="2" max="60" step="1" value="${state.breakThreshold || 60}">
        <span class="break-threshold-value">${state.breakThreshold || 60}</span>
      </div>
    `;
    return `${slider}${renderComparePanels(slots, htmlBlocks, 'breaks')}`;
  }

  function setupRepoSearch(slotId) {
    const slotKey = String(slotId || 'A').toUpperCase();
    const isA = slotKey === 'A';
    const searchInput = isA ? dom.repoSearch : slotKey === 'B' ? dom.repoSearchB : slotKey === 'C' ? dom.repoSearchC : dom.repoSearchD;
    const resultsEl = isA ? dom.repoResults : slotKey === 'B' ? dom.repoResultsB : slotKey === 'C' ? dom.repoResultsC : dom.repoResultsD;
    const statusEl = isA ? dom.repoStatus : slotKey === 'B' ? dom.repoStatusB : slotKey === 'C' ? dom.repoStatusC : dom.repoStatusD;
    const statusTarget = isA ? dom.fileStatus : slotKey === 'B' ? dom.fileStatusB : slotKey === 'C' ? dom.fileStatusC : dom.fileStatusD;
    if (!searchInput || !resultsEl || !statusEl) return;
    let timer = null;
    const shardCache = new Map();
    let sqlLoader = null;
    let archiveRows = [];
    let searchSeq = 0;
    let lastInputValue = '';
    let lastInputStamp = 0;
    let lastTrackedSearch = '';

    const crc32Table = (() => {
      const table = new Uint32Array(256);
      for (let i = 0; i < 256; i += 1) {
        let c = i;
        for (let k = 0; k < 8; k += 1) {
          c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
        }
        table[i] = c >>> 0;
      }
      return table;
    })();

    const crc32 = (str) => {
      let c = 0xffffffff;
      for (let i = 0; i < str.length; i += 1) {
        c = crc32Table[(c ^ str.charCodeAt(i)) & 0xff] ^ (c >>> 8);
      }
      return (c ^ 0xffffffff) >>> 0;
    };

    const normalizeCallsign = (input) => (input || '').trim().toUpperCase().replace(/\s+/g, '');

    const getShardUrls = (callsign) => {
      const bucket = crc32(callsign) & 0xff;
      const shard = bucket.toString(16).padStart(2, '0');
      const nonce = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
      const suffix = `logs_${shard}.sqlite?v=${encodeURIComponent(APP_VERSION)}-${nonce}`;
      return [
        `${ARCHIVE_SHARD_BASE_RAW}/${suffix}`,
        `${ARCHIVE_SHARD_BASE}/${suffix}`
      ];
    };

    const loadScript = (url) => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.head.appendChild(script);
    });

    let sqlBaseUrl = null;

    const loadSqlJs = async () => {
      if (sqlLoader) return sqlLoader;
      sqlLoader = (async () => {
        if (typeof window.initSqlJs === 'function') {
          sqlBaseUrl = sqlBaseUrl || SQLJS_BASE_URLS[0];
          return window.initSqlJs({ locateFile: (file) => `${sqlBaseUrl}${file}` });
        }
        let lastErr = null;
        for (const base of SQLJS_BASE_URLS) {
          try {
            await loadScript(`${base}sql-wasm.js`);
            if (typeof window.initSqlJs === 'function') {
              sqlBaseUrl = base;
              return window.initSqlJs({ locateFile: (file) => `${base}${file}` });
            }
          } catch (err) {
            lastErr = err;
          }
        }
        throw lastErr || new Error('sql.js not loaded.');
      })();
      return sqlLoader;
    };

    const withTimeout = (promise, ms, label) => new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`${label || 'Operation'} timed out after ${ms}ms`));
      }, ms);
      promise.then((value) => {
        clearTimeout(timer);
        resolve(value);
      }).catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    const openSqliteShard = async (shardUrls) => {
      const cacheKey = shardUrls.join('|');
      if (shardCache.has(cacheKey)) return shardCache.get(cacheKey);
      const SQL = await loadSqlJs();
      let lastErr = null;
      for (const url of shardUrls) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) throw new Error(`Shard download failed: ${res.status}`);
          const buf = await res.arrayBuffer();
          const db = new SQL.Database(new Uint8Array(buf));
          shardCache.set(cacheKey, db);
          return db;
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr || new Error('Shard download failed.');
    };

    const normalizeLabel = (value) => (value == null ? '' : String(value).trim());

    const sortResults = (rows) => rows.slice().sort((a, b) => {
      const contestA = normalizeLabel(a.contest).toUpperCase();
      const contestB = normalizeLabel(b.contest).toUpperCase();
      if (contestA !== contestB) return contestA.localeCompare(contestB);
      const yearA = Number.isFinite(a.year) ? a.year : -1;
      const yearB = Number.isFinite(b.year) ? b.year : -1;
      if (yearA !== yearB) return yearB - yearA;
      const modeA = normalizeLabel(a.mode).toUpperCase();
      const modeB = normalizeLabel(b.mode).toUpperCase();
      if (modeA !== modeB) return modeA.localeCompare(modeB);
      const seasonA = normalizeLabel(a.season).toUpperCase();
      const seasonB = normalizeLabel(b.season).toUpperCase();
      return seasonA.localeCompare(seasonB);
    });

    const parseIsoWeek = (dateStr) => {
      const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
      if (!y || !m || !d) return null;
      const date = new Date(Date.UTC(y, m - 1, d));
      const day = (date.getUTCDay() + 6) % 7;
      date.setUTCDate(date.getUTCDate() - day + 3);
      const firstThu = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
      const firstDay = (firstThu.getUTCDay() + 6) % 7;
      firstThu.setUTCDate(firstThu.getUTCDate() - firstDay + 3);
      const week = 1 + Math.round((date - firstThu) / 604800000);
      return { year: date.getUTCFullYear(), week };
    };

    const formatArchiveSubKey = (row) => {
      const contest = normalizeLabel(row.contest);
      const path = normalizeLabel(row.path);
      if (!contest || !path) return [normalizeLabel(row.mode), normalizeLabel(row.season)].filter(Boolean).join(' • ');
      if (contest.startsWith('WednesdayMiniTest')) {
        const match = path.match(/\d{4}-\d{2}-\d{2}/);
        if (match) {
          const iso = parseIsoWeek(match[0]);
          if (iso) return `Week ${iso.year}-W${String(iso.week).padStart(2, '0')}`;
        }
        return 'Week';
      }
      if (contest === 'EU_VHF_CONTESTS') {
        const parts = path.split('/').filter(Boolean);
        const event = parts[1] ? parts[1].replace(/_/g, ' ') : '';
        const band = parts[2] || '';
        return [event, band].filter(Boolean).join(' \u2022 ');
      }
      return [normalizeLabel(row.mode), normalizeLabel(row.season)].filter(Boolean).join(' • ');
    };

    const renderResultsTree = () => {
      if (!archiveRows.length) {
        resultsEl.innerHTML = '';
        statusEl.textContent = 'No matches found in the archive.';
        return;
      }
      const tree = new Map();
      archiveRows.forEach((row) => {
        const contest = normalizeLabel(row.contest);
        const year = Number.isFinite(row.year) ? String(row.year) : '';
        const subKey = formatArchiveSubKey(row);
        if (!tree.has(contest)) tree.set(contest, new Map());
        const yearMap = tree.get(contest);
        if (!yearMap.has(year)) yearMap.set(year, new Map());
        const modeMap = yearMap.get(year);
        if (!modeMap.has(subKey)) modeMap.set(subKey, []);
        modeMap.get(subKey).push(row);
      });
      const chunks = ['<div class="repo-tree">'];
      const contestCount = tree.size;
      statusEl.textContent = `Select a log to load. Found ${archiveRows.length} logs in ${contestCount} hamradio events.`;
      tree.forEach((yearMap, contest) => {
        const hasContest = Boolean(contest);
        const contestLabel = escapeHtml(contest);
        if (hasContest) chunks.push(`<details class="repo-contest"><summary>${contestLabel}</summary>`);
        yearMap.forEach((modeMap, year) => {
          const hasYear = Boolean(year);
          const yearLabel = escapeHtml(year);
          if (hasYear) chunks.push(`<details class="repo-year"><summary>${yearLabel}</summary>`);
          modeMap.forEach((rows, subKey) => {
            const hasSub = Boolean(subKey);
            const subLabel = escapeHtml(subKey);
            if (hasSub) chunks.push(`<details class="repo-subcat"><summary>${subLabel}</summary>`);
            rows.forEach((row) => {
              const path = row.path || '';
              const label = path.split('/').pop();
              const isReconstructed = path.startsWith('RECONSTRUCTED_LOGS/');
              const suffix = isReconstructed ? ' (reconstructed log)' : '';
              const pathAttr = escapeAttr(path);
              const labelText = escapeHtml((label || '') + suffix);
              chunks.push(`<button type="button" class="repo-leaf" data-path="${pathAttr}">${labelText}</button>`);
            });
            if (hasSub) chunks.push(`</details>`);
          });
          if (hasYear) chunks.push(`</details>`);
        });
        if (hasContest) chunks.push(`</details>`);
      });
      chunks.push('</div>');
      resultsEl.innerHTML = chunks.join('');
    };

    const renderResults = (rows) => {
      archiveRows = sortResults(rows);
      renderResultsTree();
    };

    const shouldQueryArchive = (callsign, issuedAt) => {
      if (!callsign || callsign.length < 3) return false;
      if (!/\d/.test(callsign)) return false;
      if (issuedAt && Date.now() - issuedAt < 800) return false;
      return true;
    };

    const searchArchive = async (input, issuedAt) => {
      if (searchInput && searchInput.value !== input) return;
      const callsign = normalizeCallsign(input);
      if (callsign.length < 3) {
        resultsEl.innerHTML = '';
        statusEl.textContent = '';
        archiveRows = [];
        return;
      }
      if (!shouldQueryArchive(callsign, issuedAt)) {
        resultsEl.innerHTML = '';
        statusEl.textContent = 'Enter full callsign (letters + number) to search.';
        archiveRows = [];
        return;
      }
      if (shouldQueryArchive(callsign, issuedAt)) {
        const trackKey = `${slotKey || 'A'}|${callsign}`;
        if (trackKey !== lastTrackedSearch) {
          trackEvent('archive_search', {
            slot: slotKey || 'A',
            callsign
          });
          lastTrackedSearch = trackKey;
        }
      }
      const seq = ++searchSeq;
      statusEl.textContent = `Searching archive for ${callsign}...`;
      const shardUrls = getShardUrls(callsign);
      try {
        const shardLabel = shardUrls[0].split('/').pop().split('?')[0];
        statusEl.textContent = `Downloading shard ${shardLabel}...`;
        const db = await withTimeout(openSqliteShard(shardUrls), 20000, 'Shard open');
        if (seq !== searchSeq) return;
        statusEl.textContent = 'Querying archive...';
        const where = `callsign = ?`;
        const sql = `SELECT path, contest, year, mode, season FROM logs WHERE ${where}`;
        const stmt = db.prepare(sql);
        stmt.bind([callsign]);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        if (seq !== searchSeq) return;
        renderResults(rows);
        statusEl.textContent = rows.length ? `Select a log to load for ${callsign}.` : `No matches found for ${callsign}.`;
      } catch (err) {
        if (seq !== searchSeq) return;
        console.error('Archive search failed:', err);
        trackEvent('archive_shard_error', {
          slot: slotKey || 'A',
          callsign,
          message: err && err.message ? err.message : 'unknown error'
        });
        resultsEl.innerHTML = '';
        statusEl.textContent = `Archive search failed: ${err && err.message ? err.message : 'unknown error'}`;
      }
    };

    const fetchFromArchive = async (path) => {
      if (!path) return;
      const name = path.split('/').pop();
      trackEvent('archive_log_select', {
        slot: slotKey || 'A',
        path,
        name: name || ''
      });
      statusEl.textContent = `Downloading ${name}...`;
      resultsEl.querySelectorAll('button').forEach((btn) => btn.disabled = true);
      let text = null;
      let source = null;
      const pageUrl = `${ARCHIVE_BASE_URL}/${path}`;
      try {
        const res = await fetch(pageUrl);
        if (res.ok) {
          text = await res.text();
          source = pageUrl;
        }
      } catch (err) {
        console.warn('Archive fetch failed:', pageUrl, err);
      }
      if (!text) {
        for (const branch of ARCHIVE_BRANCHES) {
          const rawUrl = `https://raw.githubusercontent.com/s53zo/Hamradio-Contest-logs-Archives/${branch}/${path}`;
          try {
            const res = await fetch(rawUrl);
            if (res.ok) {
              text = await res.text();
              source = rawUrl;
              break;
            }
          } catch (err) {
            console.warn('Archive fetch failed:', rawUrl, err);
          }
        }
      }
      if (!text) {
        statusEl.textContent = 'Download failed.';
        resultsEl.querySelectorAll('button').forEach((btn) => btn.disabled = false);
        return;
      }
      try {
        applyLoadedLogToSlot(slotId, text, name, text.length, 'Archive', statusTarget, path);
        statusEl.textContent = `Loaded ${name} from archive.`;
        resultsEl.querySelectorAll('button').forEach((btn) => btn.disabled = false);
        if (source) statusEl.title = source;
      } catch (err) {
        statusEl.textContent = 'Failed to parse archive log.';
        resultsEl.querySelectorAll('button').forEach((btn) => btn.disabled = false);
        console.error('Archive parse failed:', err);
      }
    };

    searchInput.addEventListener('input', (evt) => {
      if (timer) clearTimeout(timer);
      lastInputValue = evt.target.value;
      lastInputStamp = Date.now();
      timer = setTimeout(() => searchArchive(lastInputValue, lastInputStamp), 900);
    });

    resultsEl.addEventListener('click', (evt) => {
      const target = evt.target instanceof HTMLElement ? evt.target.closest('button') : null;
      if (!target) return;
      const path = target.dataset.path;
      if (!path) return;
      fetchFromArchive(path);
    });
  }

  function setCompareCount(count, updateRadios = false) {
    const safeCount = Math.min(4, Math.max(1, Number(count) || 1));
    state.compareCount = safeCount;
    state.compareEnabled = safeCount > 1;
    document.body.classList.toggle('compare-mode', state.compareEnabled);
    document.body.classList.remove('compare-count-1', 'compare-count-2', 'compare-count-3', 'compare-count-4');
    document.body.classList.add(`compare-count-${safeCount}`);
    if (dom.compareHelper) {
      dom.compareHelper.textContent = safeCount > 1
        ? `Comparing ${safeCount} logs`
        : 'Single log mode';
    }
    if (updateRadios && dom.compareModeRadios && dom.compareModeRadios.length) {
      dom.compareModeRadios.forEach((radio) => {
        radio.checked = Number(radio.value) === safeCount;
      });
    }
    invalidateCompareLogData();
    updateBandRibbon();
    rebuildReports();
    renderActiveReport();
    updateLoadSummary();
  }

  function setupSlotActions() {
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
        const input = slotId === 'B'
          ? dom.repoSearchB
          : slotId === 'C'
            ? dom.repoSearchC
            : slotId === 'D'
              ? dom.repoSearchD
              : dom.repoSearch;
        if (input) input.focus();
      });
    });
    ['A', 'B', 'C', 'D'].forEach((slotId) => {
      const panel = getSlotPanel(slotId);
      const activeBtn = panel ? panel.querySelector('.slot-choice.is-active') : null;
      const action = activeBtn ? (activeBtn.dataset.action || 'upload') : 'upload';
      setSlotAction(slotId, action);
    });
    updateSlotStatus('A');
    updateSlotStatus('B');
    updateSlotStatus('C');
    updateSlotStatus('D');
    updateLoadSummary();
  }

  function setupLoadSummaryActions() {
    if (!dom.viewReportsBtn) return;
    dom.viewReportsBtn.addEventListener('click', (evt) => {
      evt.preventDefault();
      const mainIndex = reports.findIndex((r) => r.id === 'main');
      if (mainIndex >= 0) {
        setActiveReport(mainIndex);
        return;
      }
      const container = dom.viewContainer || document.getElementById('viewContainer');
      if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function setupCompareToggle() {
    if (!dom.compareModeRadios || !dom.compareModeRadios.length) return;
    dom.compareModeRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          trackEvent('compare_mode_change', {
            count: Number(radio.value) || 1
          });
          setCompareCount(radio.value, false);
        }
      });
    });
    const selected = Array.from(dom.compareModeRadios).find((r) => r.checked);
    setCompareCount(selected ? selected.value : 1, true);
  }

  function setupUiThemeToggle() {
    applyUiTheme(getPreferredUiTheme(), false);
    if (!dom.uiThemeSwitch) return;
    const buttons = dom.uiThemeSwitch.querySelectorAll('.ui-theme-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (evt) => {
        evt.preventDefault();
        const theme = normalizeUiTheme(btn.dataset.theme || '');
        if (theme === state.uiTheme) return;
        applyUiTheme(theme, true);
        trackEvent('ui_theme_change', { theme });
      });
      btn.addEventListener('keydown', (evt) => {
        if (evt.key !== 'ArrowLeft' && evt.key !== 'ArrowRight') return;
        evt.preventDefault();
        const order = [UI_THEME_CLASSIC, UI_THEME_NT];
        const current = order.indexOf(normalizeUiTheme(state.uiTheme));
        const dir = evt.key === 'ArrowRight' ? 1 : -1;
        const next = order[(current + dir + order.length) % order.length];
        applyUiTheme(next, true);
        trackEvent('ui_theme_change', { theme: next });
      });
    });
    syncUiThemeButtons();
  }

  async function init() {
    if (dom.appVersion) dom.appVersion.textContent = APP_VERSION;
    if (dom.viewTitle) dom.viewTitle.setAttribute('aria-live', 'polite');
    if (dom.viewContainer) dom.viewContainer.setAttribute('aria-busy', 'false');
    setupUiThemeToggle();
    setupNavSearch();
    rebuildReports();
    setupFileInput(dom.fileInput, dom.fileStatus, 'A');
    setupFileInput(dom.fileInputB, dom.fileStatusB, 'B');
    setupFileInput(dom.fileInputC, dom.fileStatusC, 'C');
    setupFileInput(dom.fileInputD, dom.fileStatusD, 'D');
    setupGlobalDragOverlay();
    setupDropReplacePrompt();
    setupRepoSearch('A');
    setupRepoSearch('B');
    setupRepoSearch('C');
    setupRepoSearch('D');
    setupCompareToggle();
    setupSlotActions();
    setupLoadSummaryActions();
    setupDataFileInputs();
    setupPrevNext();
    initDataFetches();
    if (dom.bandRibbon) {
      dom.bandRibbon.addEventListener('click', (evt) => {
        const target = evt.target;
        if (!(target instanceof HTMLElement)) return;
        if (!target.classList.contains('band-pill')) return;
        evt.preventDefault();
        const band = (target.dataset.band || '').trim().toUpperCase();
        state.globalBandFilter = band;
        const pills = dom.bandRibbon.querySelectorAll('.band-pill');
        pills.forEach((pill) => {
          pill.classList.toggle('active', (pill.dataset.band || '').trim().toUpperCase() === band);
        });
        renderActiveReport();
      });
    }
    // Export actions are handled in the Export report page.
    updateBandRibbon();
    const mapParams = parseMapViewParams();
    const permalinkState = parsePermalinkState();
    if (permalinkState) {
      await applySessionPayload(permalinkState, { fromPermalink: true });
    } else {
      setActiveReport(0);
    }
    if (mapParams && mapParams.full) {
      document.body.classList.add('map-full');
    }
    if (mapParams) {
      showMapView(mapParams.scope, mapParams.key);
    }
  }

  window.SH6 = Object.assign(window.SH6 || {}, {
    formatNumberSh6,
    formatDateSh6,
    formatBandLabel,
    sortBands,
    parseBandFromFreq,
    normalizeBandToken,
    normalizeCall,
    normalizeMode,
    lookupPrefix,
    bandClass,
    getSlotById,
    getUiTheme: () => state.uiTheme,
    setUiTheme: (theme) => applyUiTheme(theme, true),
    getRenderPerf: () => getRenderPerfSummary(),
    trackEvent,
    setSpotHunterStatus: (status, payload = {}) => {
      state.spotHunterStatus = status || 'pending';
      state.spotHunterSource = payload.source || state.spotHunterSource || '';
      state.spotHunterError = payload.error || '';
      updateDataStatus();
    }
  });

  document.addEventListener('DOMContentLoaded', init);
})();
