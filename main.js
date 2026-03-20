(() => {
  const BASE_REPORTS = [
    { id: 'load_logs', title: 'Start' },
    { id: 'main', title: 'Main' },
    { id: 'competitor_coach', title: 'Competitor coach' },
    { id: 'agent_briefing', title: 'Agent briefing' },
    { id: 'summary', title: 'Summary' },
    { id: 'log', title: 'Log' },
    { id: 'operators', title: 'Operators' },
    { id: 'all_callsigns', title: 'All callsigns' },
    { id: 'rates', title: 'Rates' },
    { id: 'countries', title: 'Countries' },
    { id: 'countries_by_time', title: 'Countries by time' },
    { id: 'countries_by_month', title: 'Countries by month' },
    { id: 'countries_by_year', title: 'Countries by year' },
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
    { id: 'zones_cq_by_month', title: 'CQ zones by month' },
    { id: 'zones_cq_by_year', title: 'CQ zones by year' },
    { id: 'zones_itu_by_month', title: 'ITU zones by month' },
    { id: 'zones_itu_by_year', title: 'ITU zones by year' },
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

  const ANALYSIS_MODE_CONTESTER = 'contester';
  const ANALYSIS_MODE_DXER = 'dxer';
  const DUPE_WINDOW_MS = 15 * 60 * 1000;
  const ANALYSIS_MODE_LABELS = Object.freeze({
    [ANALYSIS_MODE_CONTESTER]: 'Contester',
    [ANALYSIS_MODE_DXER]: 'DXer'
  });
  const ANALYSIS_MODE_DIFFERENCE_TEXT = 'Contester is optimized for contest workflows with strict duplicate checks and contest-focused reports, while DXer is for long-term DX logs with relaxed duplicate handling and month/year summaries.';

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
    countries_by_month: 'geo_analysis',
    countries_by_year: 'geo_analysis',
    zones_cq_by_month: 'geo_analysis',
    zones_cq_by_year: 'geo_analysis',
    zones_itu_by_month: 'geo_analysis',
    zones_itu_by_year: 'geo_analysis',
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
    agent_briefing: 'spots_coach',
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

  const APP_VERSION = 'v6.2.19';
  const UI_THEME_NT = 'nt';
  const CHART_MODE_ABSOLUTE = 'absolute';
  const CHART_MODE_NORMALIZED = 'normalized';
  const COMPARE_SCORE_MODE_COMPUTED = 'computed';
  const COMPARE_SCORE_MODE_CLAIMED = 'claimed';
  const COMPARE_SCORE_MODE_LOGGED = 'logged';
  const COMPARE_SCORE_MODE_LABELS = Object.freeze({
    [COMPARE_SCORE_MODE_COMPUTED]: 'Computed score',
    [COMPARE_SCORE_MODE_CLAIMED]: 'Claimed score',
    [COMPARE_SCORE_MODE_LOGGED]: 'Logged points'
  });
  const RETAINED_REPORT_IDS = new Set([
    'log',
    'all_callsigns',
    'not_in_master',
    'session',
    'competitor_coach',
    'agent_briefing',
    'dupes',
    'countries',
    'continents',
    'zones_cq',
    'zones_itu',
    'prefixes',
    'callsign_length',
    'callsign_structure',
    'distance',
    'beam_heading',
    'passed_qsos',
    'possible_errors'
  ]);
  const COMPARE_TIME_LOCK_REPORTS = new Set([
    'qs_by_hour_sheet',
    'points_by_hour_sheet',
    'qs_by_minute',
    'points_by_minute'
  ]);
  const COMPARE_PERSPECTIVE_STORAGE_KEY = 'sh6_compare_perspectives_v1';
  const COMPARE_PERSPECTIVE_LIMIT = 12;
  const COMPARE_WORKSPACE_MODULE_URL = './modules/compare/workspace-ui.js?v=6.2.19';
  const COMPARE_CONTROLLER_RUNTIME_MODULE_URL = './modules/compare/controller-runtime.js?v=6.2.19';
  const RETAINED_RUNTIME_MODULE_URL = './modules/reports/retained-runtime.js?v=6.2.19';
  const NAVIGATION_RUNTIME_MODULE_URL = './modules/ui/navigation-runtime.js?v=6.2.19';
  const STORAGE_RUNTIME_MODULE_URL = './modules/storage/runtime.js?v=6.2.19';
  const ARCHIVE_CLIENT_MODULE_URL = './modules/archive/client.js?v=6.2.19';
  const ARCHIVE_SEARCH_RUNTIME_MODULE_URL = './modules/archive/search-runtime.js?v=6.2.19';
  const LOAD_PANEL_RUNTIME_MODULE_URL = './modules/ui/load-panel-runtime.js?v=6.2.19';
  const ANALYSIS_CONTROLS_RUNTIME_MODULE_URL = './modules/ui/analysis-controls-runtime.js?v=6.2.19';
  const COACH_RUNTIME_MODULE_URL = './modules/coach/runtime.js?v=6.2.19';
  const CANVAS_ZOOM_RUNTIME_MODULE_URL = './modules/ui/canvas-zoom-runtime.js?v=6.2.19';
  const RBN_SIGNAL_EXPORT_RUNTIME_MODULE_URL = './modules/spots/signal-export-runtime.js?v=6.2.19';
  const SPOTS_COMPARE_RUNTIME_MODULE_URL = './modules/spots/compare-runtime.js?v=6.2.19';
  const SPOTS_DRILLDOWN_RUNTIME_MODULE_URL = './modules/spots/drilldown-runtime.js?v=6.2.19';
  const SPOTS_COACH_SUMMARY_RUNTIME_MODULE_URL = './modules/spots/coach-summary-runtime.js?v=6.2.19';
  const SPOTS_DIAGNOSTICS_RUNTIME_MODULE_URL = './modules/spots/diagnostics-runtime.js?v=6.2.19';
  const SPOTS_CHARTS_RUNTIME_MODULE_URL = './modules/spots/charts-runtime.js?v=6.2.19';
  const SPOTS_DATA_RUNTIME_MODULE_URL = './modules/spots/data-runtime.js?v=6.2.19';
  const SPOTS_ACTIONS_RUNTIME_MODULE_URL = './modules/spots/actions-runtime.js?v=6.2.19';
  const RBN_COMPARE_CHART_RUNTIME_MODULE_URL = './modules/spots/rbn-compare-chart-runtime.js?v=6.2.19';
  const RBN_COMPARE_VIEW_RUNTIME_MODULE_URL = './modules/spots/rbn-compare-view-runtime.js?v=6.2.19';
  const RBN_COMPARE_MODEL_RUNTIME_MODULE_URL = './modules/spots/rbn-compare-model-runtime.js?v=6.2.19';
  const RBN_COMPARE_RUNTIME_MODULE_URL = './modules/spots/rbn-compare-runtime.js?v=6.2.19';
  const INVESTIGATION_ACTIONS_RUNTIME_MODULE_URL = './modules/ui/investigation-actions-runtime.js?v=6.2.19';
  const INVESTIGATION_WORKSPACE_MODULE_URL = './modules/reports/investigation-workspace.js?v=6.2.19';
  const SESSION_CODEC_MODULE_URL = './modules/session/codec.js?v=6.2.19';
  const SESSION_PERSPECTIVES_MODULE_URL = './modules/session/perspectives.js?v=6.2.19';
  const EXPORT_RUNTIME_MODULE_URL = './modules/export/runtime.js?v=6.2.19';
  const SQLJS_BASE_URLS = [
    'https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/',
    'https://unpkg.com/sql.js@1.8.0/dist/'
  ];
  const ARCHIVE_BASE_URL = 'https://hclamirror20260320.z1.web.core.windows.net';
  const ARCHIVE_FALLBACK_BASE_URLS = [];
  const ARCHIVE_SHARD_BASES = [
    `${ARCHIVE_BASE_URL}/SH6`
  ];
  const PERMALINK_BASE_URL = 'https://s53m.com/SH6/';
  const RBN_RECOMMENDATION_URL = 'https://s53m.com/RBN';
  const ARCHIVE_SH6_BASE = `${ARCHIVE_BASE_URL}/SH6`;
  const SCORING_SPEC_URLS = [
    'https://cdn.jsdelivr.net/gh/s53zo/SH6@contest-rules/data/contest_scoring_spec.json',
    'https://raw.githubusercontent.com/s53zo/SH6/contest-rules/data/contest_scoring_spec.json',
    'https://cdn.jsdelivr.net/gh/s53zo/SH6@main/data/contest_scoring_spec.json',
    'https://raw.githubusercontent.com/s53zo/SH6/main/data/contest_scoring_spec.json',
    'data/contest_scoring_spec.json',
    './data/contest_scoring_spec.json'
  ];
  const SCORING_UNKNOWN_WARNING = 'Rules for this contest are unknown. Showing logged points only if available.';
  const SCORING_UNKNOWN_WARNING_DXER = 'Scoring rules are unavailable. Showing logged points only.';
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
  const CALLSIGN_LOOKUP_BATCH = 5000;
  const CALLSIGN_LOOKUP_MAX_BATCH_BYTES = 120000;
  const CALLSIGN_LOOKUP_SPLIT_STATUSES = new Set([400, 404, 413, 414, 429, 431, 500, 502, 503, 504]);
  const CALLSIGN_LOOKUP_RETRYABLE_STATUSES = new Set([404, 408, 425, 429, 500, 502, 503, 504]);
  const CALLSIGN_LOOKUP_MAX_ATTEMPTS = 3;
  const CALLSIGN_LOOKUP_RETRY_DELAY_MS = 12000;
  const CALLSIGN_LOOKUP_MIN_GAP_MS = 280;
  const CALLSIGN_LOOKUP_TIMEOUT_MS = 8000;
  const RBN_SUMMARY_ONLY_THRESHOLD = 200000;
  const SPOT_TABLE_LIMIT = 2000;
  const CANVAS_ZOOM_MIN_DRAG_PX = 8;
  const CANVAS_ZOOM_MIN_SPAN_MS = 5 * 60 * 1000;
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
    'agent_briefing',
    'rbn_compare_signal'
  ]);
  const SESSION_VERSION = 1;
  const PERMALINK_COMPACT_PREFIX = 'v2.';
  const ANALYSIS_MODE_DEFAULT = ANALYSIS_MODE_CONTESTER;
  const ANALYSIS_MODE_OPTIONS = Object.freeze(new Set([ANALYSIS_MODE_CONTESTER, ANALYSIS_MODE_DXER]));
  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const PERIOD_FILTER_COMPACT_YEARS = 'py';
  const PERIOD_FILTER_COMPACT_MONTHS = 'pm';
  const DEFAULT_COMPARE_FOCUS = Object.freeze({
    countries_by_time: ['A', 'B'],
    countries_by_month: ['A', 'B'],
    countries_by_year: ['A', 'B'],
    qs_by_minute: ['A', 'B'],
    one_minute_rates: ['A', 'B'],
    points_by_minute: ['A', 'B'],
    one_minute_point_rates: ['A', 'B'],
    zones_cq_by_year: ['A', 'B'],
    zones_cq_by_month: ['A', 'B'],
    zones_itu_by_year: ['A', 'B'],
    zones_itu_by_month: ['A', 'B']
  });
  const DXER_HIDDEN_REPORTS = new Set([
    'main',
    'summary',
    'points_rates',
    'competitor_coach',
    'qs_by_hour_sheet',
    'points_by_hour_sheet',
    'graphs_qs_by_hour',
    'graphs_points_by_hour',
    'qs_by_minute',
    'points_by_minute',
    'one_minute_rates',
    'one_minute_point_rates',
    'breaks'
  ]);
  const CONTESTER_HIDDEN_REPORTS = new Set([
    'countries_by_month',
    'countries_by_year',
    'zones_cq_by_month',
    'zones_cq_by_year',
    'zones_itu_by_month',
    'zones_itu_by_year'
  ]);

  function cloneCompareFocus(source = DEFAULT_COMPARE_FOCUS) {
    return {
      countries_by_time: Array.isArray(source.countries_by_time) ? source.countries_by_time.slice() : ['A', 'B'],
      countries_by_month: Array.isArray(source.countries_by_month) ? source.countries_by_month.slice() : ['A', 'B'],
      countries_by_year: Array.isArray(source.countries_by_year) ? source.countries_by_year.slice() : ['A', 'B'],
      qs_by_minute: Array.isArray(source.qs_by_minute) ? source.qs_by_minute.slice() : ['A', 'B'],
      one_minute_rates: Array.isArray(source.one_minute_rates) ? source.one_minute_rates.slice() : ['A', 'B'],
      points_by_minute: Array.isArray(source.points_by_minute) ? source.points_by_minute.slice() : ['A', 'B'],
      one_minute_point_rates: Array.isArray(source.one_minute_point_rates) ? source.one_minute_point_rates.slice() : ['A', 'B'],
      zones_cq_by_year: Array.isArray(source.zones_cq_by_year) ? source.zones_cq_by_year.slice() : ['A', 'B'],
      zones_cq_by_month: Array.isArray(source.zones_cq_by_month) ? source.zones_cq_by_month.slice() : ['A', 'B'],
      zones_itu_by_year: Array.isArray(source.zones_itu_by_year) ? source.zones_itu_by_year.slice() : ['A', 'B'],
      zones_itu_by_month: Array.isArray(source.zones_itu_by_month) ? source.zones_itu_by_month.slice() : ['A', 'B']
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
      lastDaysKey: null, // RBN only: selected day(s) key to validate cached data.
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

  function createAgentBriefingState(seed = {}) {
    return {
      status: String(seed.status || 'idle'),
      key: String(seed.key || ''),
      result: seed.result || null,
      error: seed.error ? String(seed.error) : ''
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
    clearAnalysisModeSuggestion();
    scheduleAutosaveSession();
  }

  function resetCompareSlot(slotId) {
    const idx = COMPARE_SLOT_IDS.indexOf(String(slotId || '').toUpperCase());
    if (idx < 0) return;
    state.compareSlots[idx] = createEmptyCompareSlot();
    scheduleAutosaveSession();
  }

  function serializeSpotSettings(spotState) {
    return getSessionCodec().serializeSpotSettings(spotState);
  }

  function serializeRbnSettings(rbnState) {
    return getSessionCodec().serializeRbnSettings(rbnState);
  }

  function buildSessionPayload(includeRaw) {
    return getSessionCodec().buildSessionPayload(includeRaw);
  }

  function createDefaultLogFilters() {
    return getSessionCodec().createDefaultLogFilters();
  }

  function cloneTsRange(value, startKey = 'startTs', endKey = 'endTs') {
    if (!value || typeof value !== 'object') return null;
    const start = Number(value[startKey]);
    const end = Number(value[endKey]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    return { [startKey]: start, [endKey]: end };
  }

  function encodePermalinkState(payload) {
    return getSessionCodec().encodePermalinkState(payload);
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

  function normalizeAnalysisMode(rawMode) {
    const value = String(rawMode || '').toLowerCase();
    return ANALYSIS_MODE_OPTIONS.has(value) ? value : '';
  }

  function resolveAnalysisModeLabel(mode) {
    const key = normalizeAnalysisMode(mode);
    return ANALYSIS_MODE_LABELS[key] || '';
  }

  function resolveAnalysisMode(mode) {
    return normalizeAnalysisMode(mode);
  }

  function normalizeCompareScoreMode(rawMode) {
    const value = String(rawMode || '').trim().toLowerCase();
    if (value === COMPARE_SCORE_MODE_CLAIMED) return COMPARE_SCORE_MODE_CLAIMED;
    if (value === COMPARE_SCORE_MODE_LOGGED) return COMPARE_SCORE_MODE_LOGGED;
    return COMPARE_SCORE_MODE_COMPUTED;
  }

  function resolveCompareScoreModeLabel(mode) {
    const key = normalizeCompareScoreMode(mode);
    return COMPARE_SCORE_MODE_LABELS[key] || COMPARE_SCORE_MODE_LABELS[COMPARE_SCORE_MODE_COMPUTED];
  }

  function formatCompareTimeRangeLabel(range) {
    const safe = cloneTsRange(range);
    if (!safe) return 'No time lock';
    return `${formatTimeOnly(safe.startTs, formatDateSh6(safe.startTs))} → ${formatTimeOnly(safe.endTs, formatDateSh6(safe.endTs))}`;
  }

  function getCompareTimeRangeLock() {
    return cloneTsRange(state.compareTimeRangeLock);
  }

  function sameTsRange(a, b) {
    const left = cloneTsRange(a);
    const right = cloneTsRange(b);
    if (!left || !right) return false;
    return left.startTs === right.startTs && left.endTs === right.endTs;
  }

  function filterQsosAndPointsByTsRange(qsos, pointsByIndex, range) {
    const safe = cloneTsRange(range);
    const list = Array.isArray(qsos) ? qsos : [];
    const points = Array.isArray(pointsByIndex) ? pointsByIndex : null;
    if (!safe) {
      return {
        qsos: list.slice(),
        pointsByIndex: points ? points.slice() : null
      };
    }
    const filteredQsos = [];
    const filteredPoints = points ? [] : null;
    list.forEach((q, idx) => {
      if (!Number.isFinite(q?.ts) || q.ts < safe.startTs || q.ts > safe.endTs) return;
      filteredQsos.push(q);
      if (filteredPoints) filteredPoints.push(points[idx]);
    });
    return {
      qsos: filteredQsos,
      pointsByIndex: filteredPoints
    };
  }

  function buildMinuteCountMap(qsos) {
    const map = new Map();
    (qsos || []).forEach((q) => {
      if (!Number.isFinite(q?.ts)) return;
      const minuteBucket = Math.floor(q.ts / 60000);
      map.set(minuteBucket, (map.get(minuteBucket) || 0) + 1);
    });
    return map;
  }

  function buildMinutePointMapFromQsos(qsos, pointsByIndex) {
    const map = new Map();
    (qsos || []).forEach((q, idx) => {
      if (!Number.isFinite(q?.ts)) return;
      const minuteBucket = Math.floor(q.ts / 60000);
      const points = Number(Array.isArray(pointsByIndex) ? pointsByIndex[idx] : q?.points);
      map.set(minuteBucket, (map.get(minuteBucket) || 0) + (Number.isFinite(points) ? points : 0));
    });
    return map;
  }

  function loadStoredComparePerspectives() {
    return getComparePerspectiveStore().loadStoredComparePerspectives();
  }

  function writeStoredComparePerspectives(items) {
    return getComparePerspectiveStore().writeStoredComparePerspectives(items);
  }

  function buildCurrentComparePerspective() {
    return getComparePerspectiveStore().buildCurrentComparePerspective();
  }

  function normalizeGeneratedComparePerspective(input, fallbackLabel = 'Generated perspective') {
    return getComparePerspectiveStore().normalizeGeneratedComparePerspective(input, fallbackLabel);
  }

  function saveComparePerspectiveEntry(entry) {
    return getComparePerspectiveStore().saveComparePerspectiveEntry(entry);
  }

  function saveComparePerspectiveBundle(entries) {
    return getComparePerspectiveStore().saveComparePerspectiveBundle(entries);
  }

  function applyGeneratedComparePerspective(entry) {
    const normalized = normalizeGeneratedComparePerspective(entry, entry?.label || 'Generated perspective');
    if (!normalized) return false;
    return applyStoredComparePerspective(normalized);
  }

  function saveCurrentComparePerspective() {
    return getComparePerspectiveStore().saveCurrentComparePerspective();
  }

  function deleteStoredComparePerspective(id) {
    return getComparePerspectiveStore().deleteStoredComparePerspective(id);
  }

  function applyStoredComparePerspective(rawPerspective) {
    if (!rawPerspective || typeof rawPerspective !== 'object') return false;
    state.compareScoreMode = normalizeCompareScoreMode(rawPerspective.compareScoreMode);
    state.compareSyncEnabled = rawPerspective.compareSyncEnabled !== false;
    state.compareStickyEnabled = rawPerspective.compareStickyEnabled !== false;
    state.compareTimeRangeLock = cloneTsRange(rawPerspective.compareTimeRangeLock);
    state.compareFocus = cloneCompareFocus(rawPerspective.compareFocus || DEFAULT_COMPARE_FOCUS);
    state.globalBandFilter = rawPerspective.globalBandFilter || '';
    state.logTimeRange = cloneTsRange(rawPerspective.logTimeRange);
    updateBandRibbon();
    const reportId = String(rawPerspective.reportId || '');
    if (reportId) {
      setActiveReportById(reportId, { silent: true });
      return true;
    }
    renderActiveReport();
    return true;
  }

  function buildAgentSpotSummary(spotState) {
    if (!spotState) {
      return {
        status: 'idle',
        totalScanned: 0,
        totalOfUs: 0,
        totalByUs: 0,
        windowMinutes: 15
      };
    }
    return {
      status: String(spotState.status || 'idle'),
      totalScanned: Number(spotState.totalScanned || 0),
      totalOfUs: Number(spotState.totalOfUs || 0),
      totalByUs: Number(spotState.totalByUs || 0),
      windowMinutes: Number(spotState.windowMinutes || 15)
    };
  }

  function buildAgentSlotSnapshot(slot, slotId, label) {
    if (!slot || !slot.derived || !slot.qsoData) return null;
    const scoring = slot.derived.scoring || {};
    const contestMeta = slot.derived.contestMeta || {};
    const years = slot.derived.timeRange?.minTs ? new Date(slot.derived.timeRange.minTs).getUTCFullYear() : null;
    return {
      slotId,
      label,
      sourceType: slot.logFile?.path ? 'archive' : 'local',
      call: contestMeta.stationCallsign || '',
      contestId: contestMeta.contestId || '',
      year: years,
      qsoCount: Array.isArray(slot.qsoData.qsos) ? slot.qsoData.qsos.length : 0,
      scoring: {
        supported: Boolean(scoring.supported),
        confidence: scoring.confidence || 'unknown',
        ruleName: scoring.ruleName || '',
        ruleReferenceUrl: scoring.ruleReferenceUrl || '',
        detectionMethod: scoring.detectionMethod || '',
        duplicatePolicy: scoring.duplicatePolicy || '',
        multiplierCreditPolicy: scoring.multiplierCreditPolicy || '',
        claimedScoreHeader: Number.isFinite(scoring.claimedScoreHeader) ? scoring.claimedScoreHeader : null,
        computedScore: Number.isFinite(scoring.computedScore) ? scoring.computedScore : null,
        computedQsoPointsTotal: Number.isFinite(scoring.computedQsoPointsTotal) ? scoring.computedQsoPointsTotal : null,
        computedMultiplierTotal: Number.isFinite(scoring.computedMultiplierTotal) ? scoring.computedMultiplierTotal : null,
        scoreDeltaAbs: Number.isFinite(scoring.scoreDeltaAbs) ? scoring.scoreDeltaAbs : null,
        assumptions: Array.isArray(scoring.assumptions) ? scoring.assumptions.slice(0, 4) : []
      },
      effectivePointsTotal: Number(slot.derived.effectivePointsTotal || 0),
      dupeCount: Array.isArray(slot.derived.dupes) ? slot.derived.dupes.length : 0,
      notInMasterCount: Array.isArray(slot.derived.notInMasterList) ? slot.derived.notInMasterList.length : 0,
      possibleErrors: Array.isArray(slot.derived.possibleErrors)
        ? slot.derived.possibleErrors.slice(0, 25).map((entry) => ({
          reason: String(entry?.reason || ''),
          call: String(entry?.q?.call || '')
        }))
        : [],
      timeRange: cloneTsRange(slot.derived.timeRange),
      breakSummary: slot.derived.breakSummary || { totalBreakMin: 0, breaks: [] },
      hourSeries: Array.isArray(slot.derived.hourSeries) ? slot.derived.hourSeries.map((entry) => ({ hour: entry.hour, qsos: entry.qsos })) : [],
      hourPointSeries: Array.isArray(slot.derived.hourPointSeries) ? slot.derived.hourPointSeries.map((entry) => ({ hour: entry.hour, points: entry.points })) : [],
      minuteSeries: Array.isArray(slot.derived.minuteSeries) ? slot.derived.minuteSeries.map((entry) => ({ minute: entry.minute, qsos: entry.qsos })) : [],
      minutePointSeries: Array.isArray(slot.derived.minutePointSeries) ? slot.derived.minutePointSeries.map((entry) => ({ minute: entry.minute, points: entry.points })) : [],
      tenMinuteSeries: Array.isArray(slot.derived.tenMinuteSeries) ? slot.derived.tenMinuteSeries.map((entry) => ({ bucket: entry.bucket, qsos: entry.qsos })) : [],
      frequencySummary: Array.isArray(slot.derived.frequencySummary) ? slot.derived.frequencySummary.map((entry) => ({ freq: entry.freq, count: entry.count })) : [],
      spots: buildAgentSpotSummary(slot.spotsState),
      rbn: buildAgentSpotSummary(slot.rbnState)
    };
  }

  function buildAgentRuntimeSnapshot() {
    const compareSlots = getActiveCompareSlots()
      .filter((entry) => entry.id !== 'A')
      .map((entry) => buildAgentSlotSnapshot(entry.slot, entry.id, entry.label))
      .filter(Boolean);
    const coach = state.competitorCoach || createCompetitorCoachState();
    return {
      analysisMode: state.analysisMode,
      compareEnabled: Boolean(state.compareEnabled),
      compareScoreMode: state.compareScoreMode || COMPARE_SCORE_MODE_COMPUTED,
      perspectivesCount: loadStoredComparePerspectives().length,
      compareTimeRangeLock: cloneTsRange(state.compareTimeRangeLock),
      primary: buildAgentSlotSnapshot(state, 'A', 'Log A'),
      compareSlots,
      dataStatus: {
        ctyStatus: state.ctyStatus || 'pending',
        masterStatus: state.masterStatus || 'pending',
        scoringStatus: state.scoringStatus || 'pending',
        qthStatus: state.qthStatus || 'pending',
        cqApiStatus: state.cqApiStatus || 'pending',
        spotsStatus: state.spotsState?.status || 'idle',
        rbnStatus: state.rbnState?.status || 'idle'
      },
      coach: {
        status: coach.status || 'idle',
        totalRows: Number(coach.totalRows || 0),
        gapDriver: coach.gapDriver || null,
        closestRivals: Array.isArray(coach.closestRivals) ? coach.closestRivals.slice(0, 3).map((row) => ({
          call: row.call || row.callsign || '',
          scoreTotal: Number(row.scoreTotal || row.score || 0),
          multTotal: Number(row.multTotal || row.mult || 0),
          qsoTotal: Number(row.qsoTotal || row.qsos || 0)
        })) : []
      }
    };
  }

  function buildAgentBriefingKey() {
    const parts = [
      state.analysisMode,
      state.logVersion || 0,
      state.compareScoreMode || '',
      state.compareEnabled ? '1' : '0',
      state.competitorCoach?.status || 'idle',
      state.competitorCoach?.totalRows || 0,
      state.spotsState?.status || 'idle',
      state.spotsState?.totalScanned || 0,
      state.rbnState?.status || 'idle',
      state.rbnState?.totalScanned || 0
    ];
    state.compareSlots.forEach((slot) => {
      parts.push(slot?.logVersion || 0);
      parts.push(slot?.spotsState?.totalScanned || 0);
      parts.push(slot?.rbnState?.totalScanned || 0);
    });
    return parts.join('|');
  }

  function requestAgentBriefing(key) {
    if (!key) return;
    if (state.agentBriefing?.status === 'loading' && state.agentBriefing.key === key) return;
    state.agentBriefing = createAgentBriefingState({
      status: 'loading',
      key
    });
    loadAgentRuntimeModule().then((mod) => {
      if (!mod || typeof mod.runSh6AgentRuntime !== 'function') {
        throw new Error('Agent runtime unavailable.');
      }
      const snapshot = buildAgentRuntimeSnapshot();
      const result = mod.runSh6AgentRuntime(snapshot);
      if (state.agentBriefing.key !== key) return;
      state.agentBriefing = createAgentBriefingState({
        status: 'ready',
        key,
        result
      });
      if (reports[state.activeIndex]?.id === 'agent_briefing') {
        renderActiveReport();
      }
    }).catch((err) => {
      state.agentBriefing = createAgentBriefingState({
        status: 'error',
        key,
        error: err && err.message ? err.message : 'Agent runtime failed.'
      });
      if (reports[state.activeIndex]?.id === 'agent_briefing') {
        renderActiveReport();
      }
    });
  }

  function resolveAnalysisModeSuggestion(logData, derived) {
    const qsos = Array.isArray(logData?.qsos) ? logData.qsos : [];
    if (!qsos.length) return null;
    const minTs = Number(derived?.timeRange?.minTs);
    const maxTs = Number(derived?.timeRange?.maxTs);
    const qsoCount = Number.isFinite(qsos.length) ? qsos.length : 0;
    if (Number.isFinite(minTs) && Number.isFinite(maxTs) && qsoCount > 0 && maxTs > minTs) {
      const spanMs = maxTs - minTs;
      const spanHours = spanMs / 3600000;
      if (spanHours >= 24 * 14) {
        return { mode: ANALYSIS_MODE_DXER, reason: 'Very long log duration (14+ days).' };
      }
      if (spanHours >= 24 * 7 && qsoCount < 1000) {
        return { mode: ANALYSIS_MODE_DXER, reason: 'Week-long log without contest metadata.' };
      }
    }
    return null;
  }

  function setAnalysisModeSuggestion(rawSuggestion) {
    state.analysisModeSuggestion = rawSuggestion && rawSuggestion.mode ? { ...rawSuggestion } : null;
    if (state.analysisModeSuggestion && resolveAnalysisMode(state.analysisModeSuggestion.mode) === state.analysisMode) {
      state.analysisModeSuggestion = null;
    }
    renderAnalysisModeSuggestion();
  }

  function clearAnalysisModeSuggestion() {
    state.analysisModeSuggestion = null;
    renderAnalysisModeSuggestion();
  }

  function renderAnalysisModeSuggestion() {
    const suggestion = state.analysisModeSuggestion;
    const target = dom.analysisModeSuggestion;
    if (!target) return;
    if (!suggestion || !suggestion.mode) {
      target.hidden = true;
      target.textContent = '';
      return;
    }
    const modeLabel = resolveAnalysisModeLabel(suggestion.mode);
    if (!modeLabel) {
      target.hidden = true;
      target.textContent = '';
      return;
    }
    target.hidden = false;
    const reason = suggestion.reason || 'Log context suggests this mode.';
    const mode = escapeAttr(suggestion.mode);
    const modeText = escapeHtml(modeLabel);
    const reasonText = escapeHtml(reason);
    target.innerHTML = `
      <span class="load-step-note"><b>Suggestion:</b> ${modeText} mode appears more suitable for this log (${reasonText}).</span>
      <button type="button" class="button" data-mode-suggestion="${mode}">Use ${modeText}</button>
    `;
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
    clearAnalysisModeSuggestion();
    const hadAnalysisMode = Object.prototype.hasOwnProperty.call(migrated, 'analysisMode');
    state.sessionNotice = [];
    state.allCallsignsCountryFilter = '';
    state.analysisMode = normalizeAnalysisMode(migrated.analysisMode) || ANALYSIS_MODE_DEFAULT;
    state.compareScoreMode = normalizeCompareScoreMode(migrated.compareScoreMode);
    state.compareSyncEnabled = migrated.compareSyncEnabled !== false;
    state.compareStickyEnabled = migrated.compareStickyEnabled !== false;
    state.compareTimeRangeLock = cloneTsRange(migrated.compareTimeRangeLock);
    if (dom.analysisModeRadios && dom.analysisModeRadios.length) {
      dom.analysisModeRadios.forEach((radio) => {
        radio.checked = String(radio.value) === state.analysisMode;
      });
    }
    if (!hadAnalysisMode) {
      state.sessionNotice.push('Session load used default analysis mode: Contester.');
    }
    const compareCount = Math.min(4, Math.max(1, Number(migrated.compareCount) || 1));
    if (state.analysisMode === ANALYSIS_MODE_DXER) {
      if (compareCount > 1) state.compareCountBeforeDxer = compareCount;
      setCompareCount(1, true);
    } else {
      setCompareCount(compareCount, true);
    }
    syncLoadPanelFlowForAnalysisMode();
    state.compareFocus = migrated.compareFocus || state.compareFocus;
    state.globalBandFilter = migrated.globalBandFilter || '';
    state.globalYearsFilter = normalizePeriodYears(migrated.globalYearsFilter);
    state.globalMonthsFilter = normalizePeriodMonths(migrated.globalMonthsFilter);
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
        await applyLoadedLogToSlot(id, data.rawText, data.file?.name || `${id}.log`, data.file?.size || data.rawText.length, 'Session', null, data.archivePath || '');
        applySpotSettings(getSlotById(id), data);
        continue;
      }
      if (data.sourceType === 'local') {
        const cachedRaw = await loadDurableRawLog(id);
        if (cachedRaw && cachedRaw.text) {
          await applyLoadedLogToSlot(id, cachedRaw.text, data.file?.name || `${id}.log`, data.file?.size || cachedRaw.text.length, 'Autosave', null, data.archivePath || '');
          applySpotSettings(getSlotById(id), data);
          continue;
        }
      }
      if (data.archivePath) {
        const result = await fetchArchiveLogText(data.archivePath);
        if (result && result.text) {
          const name = data.file?.name || data.archivePath.split('/').pop() || `${id}.log`;
          await applyLoadedLogToSlot(id, result.text, name, result.text.length, 'Archive', null, data.archivePath);
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
    syncPeriodFiltersWithAvailableData();
    rebuildReports();
    const logIndex = reports.findIndex((r) => r.id === 'log');
    if (logIndex >= 0) setActiveReport(logIndex);
    scheduleAutosaveSession();
  }

  function buildPermalink() {
    return getSessionCodec().buildPermalink();
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
    return getSessionCodec().parsePermalinkState(window.location.search || '');
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
    globalYearsFilter: [],
    globalMonthsFilter: [],
    fullQsoData: null,
    fullDerived: null,
    bandDerivedCache: new Map(),
    periodFilterCache: new Map(),
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
    analysisMode: ANALYSIS_MODE_DEFAULT,
    analysisModeSuggestion: null,
    compareCount: 1,
    compareScoreMode: COMPARE_SCORE_MODE_COMPUTED,
    compareCountBeforeDxer: 1,
    compareSyncEnabled: true,
    compareStickyEnabled: true,
    compareTimeRangeLock: null,
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
    agentBriefing: createAgentBriefingState(),
    spotsState: null,
    rbnState: null,
    compareSlots: [createEmptyCompareSlot(), createEmptyCompareSlot(), createEmptyCompareSlot()]
  };

  const qrzPhotoInFlight = new Map();
  const callsignGridPending = new Set();
  let callsignGridTimer = null;
  let callsignGridInFlight = false;
  let callsignLookupLastRequestTs = 0;
  let viewContainerMapLinkHandler = null;
  let agentRuntimeModulePromise = null;
  let navigationRuntimeModulePromise = null;
  let navigationRuntime = null;
  let retainedRuntimeModulePromise = null;
  let retainedRuntime = null;
  let storageRuntimeModulePromise = null;
  let storageRuntime = null;
  let virtualTableModulePromise = null;
  let durableStorageModulePromise = null;
  let compareWorkspaceModulePromise = null;
  let compareWorkspaceRenderer = null;
  let compareControllerRuntimeModulePromise = null;
  let compareControllerRuntime = null;
  let archiveClientModulePromise = null;
  let archiveClient = null;
  let archiveSearchRuntimeModulePromise = null;
  let archiveSearchRuntime = null;
  let loadPanelRuntimeModulePromise = null;
  let loadPanelRuntime = null;
  let analysisControlsRuntimeModulePromise = null;
  let analysisControlsRuntime = null;
  let coachRuntimeModulePromise = null;
  let coachRuntime = null;
  let canvasZoomRuntimeModulePromise = null;
  let canvasZoomRuntime = null;
  let rbnSignalExportRuntimeModulePromise = null;
  let rbnSignalExportRuntime = null;
  let spotsCompareRuntimeModulePromise = null;
  let spotsCompareRuntime = null;
  let spotsDrilldownRuntimeModulePromise = null;
  let spotsDrilldownRuntime = null;
  let spotsCoachSummaryRuntimeModulePromise = null;
  let spotsCoachSummaryRuntime = null;
  let spotsDiagnosticsRuntimeModulePromise = null;
  let spotsDiagnosticsRuntime = null;
  let spotsChartsRuntimeModulePromise = null;
  let spotsChartsRuntime = null;
  let spotsDataRuntimeModulePromise = null;
  let spotsDataRuntime = null;
  let spotsActionsRuntimeModulePromise = null;
  let spotsActionsRuntime = null;
  let rbnCompareChartRuntimeModulePromise = null;
  let rbnCompareChartRuntime = null;
  let rbnCompareViewRuntimeModulePromise = null;
  let rbnCompareViewRuntime = null;
  let rbnCompareModelRuntimeModulePromise = null;
  let rbnCompareModelRuntime = null;
  let rbnCompareRuntimeModulePromise = null;
  let rbnCompareRuntime = null;
  let investigationActionsRuntimeModulePromise = null;
  let investigationActionsRuntime = null;
  let investigationWorkspaceModulePromise = null;
  let investigationWorkspaceRenderer = null;
  let sessionCodecModulePromise = null;
  let sessionCodec = null;
  let comparePerspectiveModulePromise = null;
  let comparePerspectiveStore = null;
  let exportRuntimeModulePromise = null;
  let exportRuntime = null;
  let engineTaskWorker = null;
  let engineTaskSeq = 0;
  let derivedRecomputeSeq = 0;
  const engineTaskResolvers = new Map();

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
    navSearchEmpty: document.getElementById('navSearchEmpty'),
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
    periodFilterRibbon: document.getElementById('periodFilterRibbon'),
    loadPanelSubtitle: document.getElementById('loadPanelSubtitle'),
    loadStepAnalysisTitle: document.getElementById('loadStepAnalysisTitle'),
    compareModeLoadStep: document.getElementById('compareModeLoadStep'),
    loadStepCompareTitle: document.getElementById('loadStepCompareTitle'),
    loadStepLoadTitle: document.getElementById('loadStepLoadTitle'),
    loadStepReportsTitle: document.getElementById('loadStepReportsTitle'),
    loadTipBadge: document.getElementById('loadTipBadge'),
    loadSummary: document.getElementById('loadSummary'),
    loadSummaryItems: document.getElementById('loadSummaryItems'),
    loadSummaryHint: document.getElementById('loadSummaryHint'),
    viewReportsBtn: document.getElementById('viewReportsBtn'),
    resetSelectionsBtn: document.getElementById('resetSelectionsBtn'),
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
    analysisModeRadios: document.querySelectorAll('.analysis-mode-option'),
    analysisModeSuggestion: document.getElementById('analysisModeSuggestion'),
    analysisModeDiffHint: document.querySelector('.analysis-mode-diff-hint'),
    analysisModeDiffTooltip: document.getElementById('analysisModeDiffTooltip'),
    dropReplace: document.getElementById('dropReplace'),
    dropReplaceActions: document.getElementById('dropReplaceActions'),
    dropReplaceCancel: document.getElementById('dropReplaceCancel'),
    dragOverlay: document.getElementById('dragOverlay')
  };

  function loadAgentRuntimeModule() {
    if (!agentRuntimeModulePromise) {
      agentRuntimeModulePromise = import('./modules/agents/runtime.js')
        .catch(() => null);
    }
    return agentRuntimeModulePromise;
  }

  function loadNavigationRuntimeModule() {
    if (!navigationRuntimeModulePromise) {
      navigationRuntimeModulePromise = import(NAVIGATION_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createNavigationRuntime !== 'function') {
            throw new Error('navigation runtime module unavailable');
          }
          navigationRuntime = mod.createNavigationRuntime({
            getDom: () => dom,
            getState: () => state,
            getReports: () => reports,
            navSections: NAV_SECTIONS,
            navSectionByReport: NAV_SECTION_BY_REPORT,
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
            analysisModeDxer: ANALYSIS_MODE_DXER
          });
          return navigationRuntime;
        });
    }
    return navigationRuntimeModulePromise;
  }

  function getNavigationRuntime() {
    if (!navigationRuntime) {
      throw new Error('navigation runtime not loaded');
    }
    return navigationRuntime;
  }

  function loadVirtualTableModule() {
    if (!virtualTableModulePromise) {
      virtualTableModulePromise = import('./modules/ui/virtual-table.js');
    }
    return virtualTableModulePromise;
  }

  function loadStorageRuntimeModule() {
    if (!storageRuntimeModulePromise) {
      storageRuntimeModulePromise = import(STORAGE_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createStorageRuntime !== 'function') {
            throw new Error('storage runtime module unavailable');
          }
          storageRuntime = mod.createStorageRuntime({
            createStorage: async () => {
              const storageModule = await loadDurableStorageModule();
              if (!storageModule || typeof storageModule.createSh6Storage !== 'function') return null;
              return storageModule.createSh6Storage({ appVersion: APP_VERSION });
            },
            comparePerspectiveStorageKey: COMPARE_PERSPECTIVE_STORAGE_KEY,
            comparePerspectiveLimit: COMPARE_PERSPECTIVE_LIMIT,
            writeStorageText: (key, value) => localStorage.setItem(key, value),
            buildSessionPayload
          });
          return storageRuntime;
        });
    }
    return storageRuntimeModulePromise;
  }

  function getStorageRuntime() {
    if (!storageRuntime) {
      throw new Error('storage runtime not loaded');
    }
    return storageRuntime;
  }

  function loadDurableStorageModule() {
    if (!durableStorageModulePromise) {
      durableStorageModulePromise = import('./modules/storage/persistence.js')
        .catch(() => null);
    }
    return durableStorageModulePromise;
  }

  function loadCompareWorkspaceModule() {
    if (!compareWorkspaceModulePromise) {
      compareWorkspaceModulePromise = import(COMPARE_WORKSPACE_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createCompareWorkspaceRenderer !== 'function') {
            throw new Error('compare workspace module unavailable');
          }
          compareWorkspaceRenderer = mod.createCompareWorkspaceRenderer({
            escapeHtml,
            escapeAttr,
            formatNumberSh6,
            formatDateSh6,
            resolveCompareScoreModeLabel,
            normalizeCompareScoreMode,
            parseClaimedScoreNumber,
            cloneTsRange,
            sameTsRange,
            formatCompareTimeRangeLabel,
            getCompareTimeRangeLock,
            getBaseReportId,
            getCompareFocusPair,
            filterQsosAndPointsByTsRange,
            getEffectivePointsByIndex,
            buildMinutePointMapFromQsos,
            buildMinuteCountMap,
            compareTimeLockReports: COMPARE_TIME_LOCK_REPORTS,
            compareScrollSyncReports: COMPARE_SCROLL_SYNC_REPORTS,
            compareScoreModeComputed: COMPARE_SCORE_MODE_COMPUTED,
            compareScoreModeClaimed: COMPARE_SCORE_MODE_CLAIMED,
            compareScoreModeLogged: COMPARE_SCORE_MODE_LOGGED
          });
          return compareWorkspaceRenderer;
        });
    }
    return compareWorkspaceModulePromise;
  }

  function loadCompareControllerRuntimeModule() {
    if (!compareControllerRuntimeModulePromise) {
      compareControllerRuntimeModulePromise = import(COMPARE_CONTROLLER_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createCompareControllerRuntime !== 'function') {
            throw new Error('compare controller runtime module unavailable');
          }
          compareControllerRuntime = mod.createCompareControllerRuntime({
            getDom: () => dom,
            getState: () => state,
            getReports: () => reports,
            getActiveCompareSnapshots,
            getBaseReportId,
            compareScrollSyncReports: COMPARE_SCROLL_SYNC_REPORTS,
            compareCrossHighlightReports: COMPARE_CROSS_HIGHLIGHT_REPORTS,
            normalizeCompareScoreMode,
            cloneTsRange,
            saveCurrentComparePerspective,
            showOverlayNotice,
            renderCurrentReportWithLoading: () => renderReportWithLoading(reports[state.activeIndex]),
            setActiveReportById,
            escapeHtml,
            escapeAttr
          });
          return compareControllerRuntime;
        });
    }
    return compareControllerRuntimeModulePromise;
  }

  function getCompareControllerRuntime() {
    if (!compareControllerRuntime) {
      throw new Error('compare controller runtime not loaded');
    }
    return compareControllerRuntime;
  }

  function getCompareWorkspaceRenderer() {
    if (!compareWorkspaceRenderer) {
      throw new Error('compare workspace renderer not loaded');
    }
    return compareWorkspaceRenderer;
  }

  function loadRetainedRuntimeModule() {
    if (!retainedRuntimeModulePromise) {
      retainedRuntimeModulePromise = import(RETAINED_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createRetainedReportRuntime !== 'function') {
            throw new Error('retained runtime module unavailable');
          }
          retainedRuntime = mod.createRetainedReportRuntime({
            escapeAttr,
            getDom: () => dom,
            getCurrentReportId: () => reports[state.activeIndex]?.id || '',
            isRetainedReport,
            loadVirtualTableModule,
            renderRetainedReportContent,
            bindReportInteractions,
            renderCurrentReportWithLoading: () => renderReportWithLoading(reports[state.activeIndex])
          });
          return retainedRuntime;
        });
    }
    return retainedRuntimeModulePromise;
  }

  function getRetainedRuntime() {
    if (!retainedRuntime) {
      throw new Error('retained runtime not loaded');
    }
    return retainedRuntime;
  }

  function loadArchiveClientModule() {
    if (!archiveClientModulePromise) {
      archiveClientModulePromise = import(ARCHIVE_CLIENT_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createArchiveClient !== 'function') {
            throw new Error('archive client module unavailable');
          }
          archiveClient = mod.createArchiveClient({
            sqlJsBaseUrls: SQLJS_BASE_URLS,
            archiveBaseUrl: ARCHIVE_BASE_URL,
            archiveFallbackBaseUrls: ARCHIVE_FALLBACK_BASE_URLS,
            buildFetchUrls,
            normalizeCall,
            normalizeArchiveContestToken,
            normalizeArchiveModeToken,
            getArchiveShardUrlsForCallsign,
            withTimeoutPromise,
            ensureDurableStorageReady,
            runEngineTask
          });
          return archiveClient;
        });
    }
    return archiveClientModulePromise;
  }

  function loadArchiveSearchRuntimeModule() {
    if (!archiveSearchRuntimeModulePromise) {
      archiveSearchRuntimeModulePromise = import(ARCHIVE_SEARCH_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createArchiveSearchRuntime !== 'function') {
            throw new Error('archive search runtime module unavailable');
          }
          archiveSearchRuntime = mod.createArchiveSearchRuntime({
            getSlotElements: (slotId) => {
              const key = String(slotId || 'A').toUpperCase();
              const isA = key === 'A';
              return {
                searchInput: isA ? dom.repoSearch : key === 'B' ? dom.repoSearchB : key === 'C' ? dom.repoSearchC : dom.repoSearchD,
                resultsEl: isA ? dom.repoResults : key === 'B' ? dom.repoResultsB : key === 'C' ? dom.repoResultsC : dom.repoResultsD,
                statusEl: isA ? dom.repoStatus : key === 'B' ? dom.repoStatusB : key === 'C' ? dom.repoStatusC : dom.repoStatusD,
                statusTarget: getStatusElBySlot(key)
              };
            },
            normalizeCall,
            escapeAttr,
            escapeHtml,
            trackEvent,
            queryArchiveRowsByCallsign: async (callsign) => {
              const client = await loadArchiveClientModule();
              return client.queryRowsByCallsign(callsign);
            },
            fetchArchiveLogText,
            applyLoadedLogToSlot
          });
          return archiveSearchRuntime;
        });
    }
    return archiveSearchRuntimeModulePromise;
  }

  function getArchiveSearchRuntime() {
    if (!archiveSearchRuntime) {
      throw new Error('archive search runtime not loaded');
    }
    return archiveSearchRuntime;
  }

  function loadLoadPanelRuntimeModule() {
    if (!loadPanelRuntimeModulePromise) {
      loadPanelRuntimeModulePromise = import(LOAD_PANEL_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createLoadPanelRuntime !== 'function') {
            throw new Error('load panel runtime module unavailable');
          }
          loadPanelRuntime = mod.createLoadPanelRuntime({
            getSlotPanel,
            getStatusElBySlot,
            getSlotStatusElBySlot,
            getRepoCompactBySlot,
            getSlotById,
            getActiveCompareSlots,
            clearSlotData: (slotId) => {
              if (String(slotId || 'A').toUpperCase() === 'A') resetMainSlot();
              else resetCompareSlot(slotId);
            },
            escapeHtml,
            focusArchiveSearchInput: (slotId) => {
              const key = String(slotId || 'A').toUpperCase();
              const input = key === 'B'
                ? dom.repoSearchB
                : key === 'C'
                  ? dom.repoSearchC
                  : key === 'D'
                    ? dom.repoSearchD
                    : dom.repoSearch;
              if (input) input.focus();
            },
            loadDemoLog,
            getReports: () => reports,
            setActiveReport,
            getViewContainer: () => dom.viewContainer || document.getElementById('viewContainer'),
            slotIds: ['A', 'B', 'C', 'D']
          });
          return loadPanelRuntime;
        });
    }
    return loadPanelRuntimeModulePromise;
  }

  function getLoadPanelRuntime() {
    if (!loadPanelRuntime) {
      throw new Error('load panel runtime not loaded');
    }
    return loadPanelRuntime;
  }

  function loadAnalysisControlsRuntimeModule() {
    if (!analysisControlsRuntimeModulePromise) {
      analysisControlsRuntimeModulePromise = import(ANALYSIS_CONTROLS_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createAnalysisControlsRuntime !== 'function') {
            throw new Error('analysis controls runtime module unavailable');
          }
          analysisControlsRuntime = mod.createAnalysisControlsRuntime({
            getDom: () => dom,
            getState: () => state,
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
            analysisModeDefault: ANALYSIS_MODE_DEFAULT,
            analysisModeDxer: ANALYSIS_MODE_DXER,
            analysisModeDifferenceText: ANALYSIS_MODE_DIFFERENCE_TEXT
          });
          return analysisControlsRuntime;
        });
    }
    return analysisControlsRuntimeModulePromise;
  }

  function getAnalysisControlsRuntime() {
    if (!analysisControlsRuntime) {
      throw new Error('analysis controls runtime not loaded');
    }
    return analysisControlsRuntime;
  }

  function loadCoachRuntimeModule() {
    if (!coachRuntimeModulePromise) {
      coachRuntimeModulePromise = import(COACH_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createCoachRuntime !== 'function') {
            throw new Error('coach runtime module unavailable');
          }
          coachRuntime = mod.createCoachRuntime({
            getState: () => state,
            getActiveReportId: () => reports[state.activeIndex]?.id || '',
            compareSlotIds: COMPARE_SLOT_IDS,
            cqApiProxyBase: CQ_API_PROXY_BASE,
            cqApiProxyKeys: CQ_API_PROXY_KEYS,
            cqApiSupportedContests: CQ_API_SUPPORTED_CONTESTS,
            loadCqApiModule,
            loadCompetitorCoachModule,
            loadArchiveClientModule,
            createApiEnrichmentState,
            createCompetitorCoachState,
            normalizeCall,
            deriveStationCallsign,
            inferApiMode,
            dedupeValues,
            parseOperatorsList,
            lookupPrefix,
            baseCall,
            normalizeContinent,
            mapContinentToCqGeo,
            renderActiveReport,
            updateDataStatus,
            trackEvent,
            setCompareCount,
            setSlotAction,
            applyLoadedLogToSlot,
            getStatusElBySlot
          });
          return coachRuntime;
        });
    }
    return coachRuntimeModulePromise;
  }

  function getCoachRuntime() {
    if (!coachRuntime) {
      throw new Error('coach runtime not loaded');
    }
    return coachRuntime;
  }

  function loadCanvasZoomRuntimeModule() {
    if (!canvasZoomRuntimeModulePromise) {
      canvasZoomRuntimeModulePromise = import(CANVAS_ZOOM_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createCanvasZoomRuntime !== 'function') {
            throw new Error('canvas zoom runtime module unavailable');
          }
          canvasZoomRuntime = mod.createCanvasZoomRuntime({
            getState: () => state,
            normalizeSpotterBase,
            normalizeBandToken,
            minDragPx: CANVAS_ZOOM_MIN_DRAG_PX,
            minSpanMs: CANVAS_ZOOM_MIN_SPAN_MS
          });
          return canvasZoomRuntime;
        });
    }
    return canvasZoomRuntimeModulePromise;
  }

  function getCanvasZoomRuntime() {
    if (!canvasZoomRuntime) {
      throw new Error('canvas zoom runtime not loaded');
    }
    return canvasZoomRuntime;
  }

  function loadRbnSignalExportRuntimeModule() {
    if (!rbnSignalExportRuntimeModulePromise) {
      rbnSignalExportRuntimeModulePromise = import(RBN_SIGNAL_EXPORT_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createRbnSignalExportRuntime !== 'function') {
            throw new Error('rbn signal export runtime module unavailable');
          }
          rbnSignalExportRuntime = mod.createRbnSignalExportRuntime({
            canvasToBlobAsync,
            normalizeSpotterBase,
            sanitizeFilenameToken,
            showOverlayNotice,
            trackEvent,
            downloadBlobFile
          });
          return rbnSignalExportRuntime;
        });
    }
    return rbnSignalExportRuntimeModulePromise;
  }

  function getRbnSignalExportRuntime() {
    if (!rbnSignalExportRuntime) {
      throw new Error('rbn signal export runtime not loaded');
    }
    return rbnSignalExportRuntime;
  }

  function loadSpotsCompareRuntimeModule() {
    if (!spotsCompareRuntimeModulePromise) {
      spotsCompareRuntimeModulePromise = import(SPOTS_COMPARE_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createSpotsCompareRuntime !== 'function') {
            throw new Error('spots compare runtime module unavailable');
          }
          spotsCompareRuntime = mod.createSpotsCompareRuntime({
            getState: () => state,
            getActiveCompareSnapshots,
            getSpotStateBySource,
            getAvailableBands,
            sortBands,
            formatBandLabel,
            bandClass,
            escapeAttr,
            escapeHtml,
            renderSpotsCompareSlot: (entry, source) => withSlotState(
              entry.snapshot,
              () => renderSpots({ source, spotsState: getSpotStateBySource(entry.snapshot, source), hideControls: true }),
              { slotId: entry.id }
            ),
            renderComparePanels,
            renderRbnRecommendationCallout
          });
          return spotsCompareRuntime;
        });
    }
    return spotsCompareRuntimeModulePromise;
  }

  function getSpotsCompareRuntime() {
    if (!spotsCompareRuntime) {
      throw new Error('spots compare runtime not loaded');
    }
    return spotsCompareRuntime;
  }

  function loadSpotsDrilldownRuntimeModule() {
    if (!spotsDrilldownRuntimeModulePromise) {
      spotsDrilldownRuntimeModulePromise = import(SPOTS_DRILLDOWN_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createSpotsDrilldownRuntime !== 'function') {
            throw new Error('spots drilldown runtime module unavailable');
          }
          spotsDrilldownRuntime = mod.createSpotsDrilldownRuntime({
            normalizeCall,
            lookupPrefix,
            baseCall,
            normalizeContinent,
            escapeAttr,
            escapeHtml,
            formatBandLabel,
            formatDateSh6,
            formatNumberSh6,
            bandClass,
            spotTableLimit: SPOT_TABLE_LIMIT
          });
          return spotsDrilldownRuntime;
        });
    }
    return spotsDrilldownRuntimeModulePromise;
  }

  function getSpotsDrilldownRuntime() {
    if (!spotsDrilldownRuntime) {
      throw new Error('spots drilldown runtime not loaded');
    }
    return spotsDrilldownRuntime;
  }

  function loadSpotsCoachSummaryRuntimeModule() {
    if (!spotsCoachSummaryRuntimeModulePromise) {
      spotsCoachSummaryRuntimeModulePromise = import(SPOTS_COACH_SUMMARY_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createSpotsCoachSummaryRuntime !== 'function') {
            throw new Error('spots coach summary runtime module unavailable');
          }
          spotsCoachSummaryRuntime = mod.createSpotsCoachSummaryRuntime({
            lookupPrefix,
            normalizeBandToken,
            bandOrderIndex,
            escapeHtml,
            escapeAttr,
            formatBandLabel,
            formatNumberSh6,
            coachSeverityLabel
          });
          return spotsCoachSummaryRuntime;
        });
    }
    return spotsCoachSummaryRuntimeModulePromise;
  }

  function getSpotsCoachSummaryRuntime() {
    if (!spotsCoachSummaryRuntime) {
      throw new Error('spots coach summary runtime not loaded');
    }
    return spotsCoachSummaryRuntime;
  }

  function loadSpotsDiagnosticsRuntimeModule() {
    if (!spotsDiagnosticsRuntimeModulePromise) {
      spotsDiagnosticsRuntimeModulePromise = import(SPOTS_DIAGNOSTICS_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createSpotsDiagnosticsRuntime !== 'function') {
            throw new Error('spots diagnostics runtime module unavailable');
          }
          spotsDiagnosticsRuntime = mod.createSpotsDiagnosticsRuntime({
            normalizeBandToken,
            normalizeCall,
            lookupPrefix,
            bandOrderIndex,
            formatBandLabel,
            formatDateSh6,
            formatNumberSh6,
            escapeHtml,
            bandClass,
            computeSpotterReliabilityEntries: (spots, minSpots) => getSpotsCoachSummaryRuntime().computeSpotterReliabilityEntries(spots, minSpots),
            buildMissedMultEntries: (spots, analysis) => getSpotsCoachSummaryRuntime().buildMissedMultEntries(spots, analysis)
          });
          return spotsDiagnosticsRuntime;
        });
    }
    return spotsDiagnosticsRuntimeModulePromise;
  }

  function getSpotsDiagnosticsRuntime() {
    if (!spotsDiagnosticsRuntime) {
      throw new Error('spots diagnostics runtime not loaded');
    }
    return spotsDiagnosticsRuntime;
  }

  function loadSpotsChartsRuntimeModule() {
    if (!spotsChartsRuntimeModulePromise) {
      spotsChartsRuntimeModulePromise = import(SPOTS_CHARTS_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createSpotsChartsRuntime !== 'function') {
            throw new Error('spots charts runtime module unavailable');
          }
          spotsChartsRuntime = mod.createSpotsChartsRuntime({
            normalizeBandToken,
            escapeHtml,
            escapeAttr,
            formatBandLabel,
            formatDateSh6,
            formatNumberSh6,
            bandClass,
            sortBands
          });
          return spotsChartsRuntime;
        });
    }
    return spotsChartsRuntimeModulePromise;
  }

  function getSpotsChartsRuntime() {
    if (!spotsChartsRuntime) {
      throw new Error('spots charts runtime not loaded');
    }
    return spotsChartsRuntime;
  }

  function loadSpotsDataRuntimeModule() {
    if (!spotsDataRuntimeModulePromise) {
      spotsDataRuntimeModulePromise = import(SPOTS_DATA_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createSpotsDataRuntime !== 'function') {
            throw new Error('spots data runtime module unavailable');
          }
          spotsDataRuntime = mod.createSpotsDataRuntime({
            getState: () => state,
            createSpotsState,
            createRbnState,
            getLoadedCompareSlots,
            normalizeBandToken,
            parseBandFromFreq,
            normalizeCall,
            normalizeSpotterBase,
            runEngineTask,
            updateDataStatus,
            renderActiveReport,
            spotsBaseUrl: SPOTS_BASE_URL,
            rbnProxyUrl: RBN_PROXY_URL,
            rbnSummaryOnlyThreshold: RBN_SUMMARY_ONLY_THRESHOLD
          });
          return spotsDataRuntime;
        });
    }
    return spotsDataRuntimeModulePromise;
  }

  function getSpotsDataRuntime() {
    if (!spotsDataRuntime) {
      throw new Error('spots data runtime not loaded');
    }
    return spotsDataRuntime;
  }

  function loadSpotsActionsRuntimeModule() {
    if (!spotsActionsRuntimeModulePromise) {
      spotsActionsRuntimeModulePromise = import(SPOTS_ACTIONS_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createSpotsActionsRuntime !== 'function') {
            throw new Error('spots actions runtime module unavailable');
          }
          spotsActionsRuntime = mod.createSpotsActionsRuntime({
            getDom: () => dom,
            getState: () => state,
            getLoadedCompareSlots,
            getSpotStateBySource,
            getSlotById,
            normalizeCall,
            normalizeBandToken,
            buildSpotWindowKey,
            selectRbnDaysForSlot,
            loadSpotsForSource,
            computeSpotsStats,
            renderActiveReport,
            updateDataStatus,
            bindDragZoomOnCanvas,
            alignSpotsCompareSections
          });
          return spotsActionsRuntime;
        });
    }
    return spotsActionsRuntimeModulePromise;
  }

  function getSpotsActionsRuntime() {
    if (!spotsActionsRuntime) {
      throw new Error('spots actions runtime not loaded');
    }
    return spotsActionsRuntime;
  }

  function loadRbnCompareChartRuntimeModule() {
    if (!rbnCompareChartRuntimeModulePromise) {
      rbnCompareChartRuntimeModulePromise = import(RBN_COMPARE_CHART_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createRbnCompareChartRuntime !== 'function') {
            throw new Error('rbn compare chart runtime module unavailable');
          }
          rbnCompareChartRuntime = mod.createRbnCompareChartRuntime({
            getDom: () => dom,
            getState: () => state,
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
          });
          return rbnCompareChartRuntime;
        });
    }
    return rbnCompareChartRuntimeModulePromise;
  }

  function getRbnCompareChartRuntime() {
    if (!rbnCompareChartRuntime) {
      throw new Error('rbn compare chart runtime not loaded');
    }
    return rbnCompareChartRuntime;
  }

  function loadRbnCompareViewRuntimeModule() {
    if (!rbnCompareViewRuntimeModulePromise) {
      rbnCompareViewRuntimeModulePromise = import(RBN_COMPARE_VIEW_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createRbnCompareViewRuntime !== 'function') {
            throw new Error('rbn compare view runtime module unavailable');
          }
          rbnCompareViewRuntime = mod.createRbnCompareViewRuntime({
            getState: () => state,
            getActiveCompareSlots,
            getSlotById,
            compareSlotIds: COMPARE_SLOT_IDS,
            createCompetitorCoachState,
            buildCompetitorCoachContext,
            normalizeCall,
            normalizeBandToken,
            formatBandLabel,
            escapeAttr,
            escapeHtml,
            mapSpotStatus,
            buildRbnDayList,
            getRbnCompareRankingCached,
            continentLabel,
            normalizeSpotterBase,
            formatNumberSh6,
            renderReportIntroCard,
            renderRbnRecommendationCallout,
            renderStateCard,
            analysisModeDxer: ANALYSIS_MODE_DXER
          });
          return rbnCompareViewRuntime;
        });
    }
    return rbnCompareViewRuntimeModulePromise;
  }

  function getRbnCompareViewRuntime() {
    if (!rbnCompareViewRuntime) {
      throw new Error('rbn compare view runtime not loaded');
    }
    return rbnCompareViewRuntime;
  }

  function loadRbnCompareModelRuntimeModule() {
    if (!rbnCompareModelRuntimeModulePromise) {
      rbnCompareModelRuntimeModulePromise = import(RBN_COMPARE_MODEL_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createRbnCompareModelRuntime !== 'function') {
            throw new Error('rbn compare model runtime module unavailable');
          }
          rbnCompareModelRuntime = mod.createRbnCompareModelRuntime({
            getDom: () => dom,
            getState: () => state,
            getActiveCompareSlots,
            getActiveReportId: () => reports[state.activeIndex]?.id || '',
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
          });
          return rbnCompareModelRuntime;
        });
    }
    return rbnCompareModelRuntimeModulePromise;
  }

  function getRbnCompareModelRuntime() {
    if (!rbnCompareModelRuntime) {
      throw new Error('rbn compare model runtime not loaded');
    }
    return rbnCompareModelRuntime;
  }

  function loadRbnCompareRuntimeModule() {
    if (!rbnCompareRuntimeModulePromise) {
      const rbnCompareModelRuntimeReady = loadRbnCompareModelRuntimeModule();
      rbnCompareRuntimeModulePromise = rbnCompareModelRuntimeReady.then(() => import(RBN_COMPARE_RUNTIME_MODULE_URL))
        .then((mod) => {
          if (!mod || typeof mod.createRbnCompareRuntime !== 'function') {
            throw new Error('rbn compare runtime module unavailable');
          }
          rbnCompareRuntime = mod.createRbnCompareRuntime({
            getDom: () => dom,
            getState: () => state,
            getActiveCompareSlots,
            setActiveReportById,
            updateDataStatus,
            bindSpotControls: (source) => getSpotsActionsRuntime().bindSpotControls(source),
            scheduleRbnCompareIndexBuild,
            normalizeSpotterBase,
            normalizeBandToken,
            scheduleRbnCompareSignalDraw,
            copyRbnSignalCardImage,
            getCanvasZoomKey,
            clearCanvasZoom,
            bindDragZoomOnCanvas,
            populateRbnCompareSignalSpotterSelects
          });
          return rbnCompareRuntime;
        });
    }
    return rbnCompareRuntimeModulePromise;
  }

  function getRbnCompareRuntime() {
    if (!rbnCompareRuntime) {
      throw new Error('rbn compare runtime not loaded');
    }
    return rbnCompareRuntime;
  }

  function loadInvestigationActionsRuntimeModule() {
    if (!investigationActionsRuntimeModulePromise) {
      investigationActionsRuntimeModulePromise = import(INVESTIGATION_ACTIONS_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createInvestigationActionsRuntime !== 'function') {
            throw new Error('investigation actions runtime unavailable');
          }
          investigationActionsRuntime = mod.createInvestigationActionsRuntime({
            getState: () => state,
            getActiveReportId: () => reports[state.activeIndex]?.id || '',
            createAgentBriefingState,
            createCompetitorCoachState,
            normalizeCoachScopeType,
            triggerCompetitorCoachRefresh,
            setActiveReportById,
            getAgentBriefingActionById,
            handleAgentBriefingAction,
            showOverlayNotice,
            trackEvent,
            loadCqApiHistoryArchiveToSlot,
            buildCoachRowKey,
            renderCurrentReportWithLoading: () => renderReportWithLoading(reports[state.activeIndex]),
            renderActiveReport,
            normalizeCall
          });
          return investigationActionsRuntime;
        });
    }
    return investigationActionsRuntimeModulePromise;
  }

  function getInvestigationActionsRuntime() {
    if (!investigationActionsRuntime) {
      throw new Error('investigation actions runtime not loaded');
    }
    return investigationActionsRuntime;
  }

  function loadInvestigationWorkspaceModule() {
    if (!investigationWorkspaceModulePromise) {
      investigationWorkspaceModulePromise = import(INVESTIGATION_WORKSPACE_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createInvestigationWorkspaceRenderer !== 'function') {
            throw new Error('investigation workspace module unavailable');
          }
          investigationWorkspaceRenderer = mod.createInvestigationWorkspaceRenderer({
            getState: () => state,
            analysisModeDxer: ANALYSIS_MODE_DXER,
            compareSlotIds: COMPARE_SLOT_IDS,
            getSlotById,
            getActiveCompareSlots,
            renderPlaceholder,
            renderReportIntroCard,
            renderAnalysisStepHeading,
            buildCompetitorCoachContext,
            createCompetitorCoachState,
            buildCoachRowKey,
            formatCoachScopeTitle,
            normalizeCoachScopeType,
            normalizeCoachCategory,
            normalizeCoachSeverity,
            coachSeverityLabel,
            findCqApiCategoryLabel,
            formatCqApiNumber,
            formatCqApiMultiplierValue,
            formatCqApiOperatorsCell,
            formatNumberSh6,
            formatYearSh6,
            normalizeCall,
            escapeHtml,
            escapeAttr,
            buildAgentBriefingKey,
            requestAgentBriefing,
            createAgentBriefingState
          });
          return investigationWorkspaceRenderer;
        });
    }
    return investigationWorkspaceModulePromise;
  }

  function getInvestigationWorkspaceRenderer() {
    if (!investigationWorkspaceRenderer) {
      throw new Error('investigation workspace renderer not loaded');
    }
    return investigationWorkspaceRenderer;
  }

  function loadSessionCodecModule() {
    if (!sessionCodecModulePromise) {
      sessionCodecModulePromise = import(SESSION_CODEC_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createSessionCodec !== 'function') {
            throw new Error('session codec module unavailable');
          }
          sessionCodec = mod.createSessionCodec({
            getState: () => state,
            getSlotById,
            slotIds: ['A', 'B', 'C', 'D'],
            appVersion: APP_VERSION,
            sessionVersion: SESSION_VERSION,
            permalinkBaseUrl: PERMALINK_BASE_URL,
            permalinkCompactPrefix: PERMALINK_COMPACT_PREFIX,
            periodFilterCompactYears: PERIOD_FILTER_COMPACT_YEARS,
            periodFilterCompactMonths: PERIOD_FILTER_COMPACT_MONTHS,
            analysisModeDxer: ANALYSIS_MODE_DXER,
            compareScoreModeComputed: COMPARE_SCORE_MODE_COMPUTED,
            defaultCompareFocus: DEFAULT_COMPARE_FOCUS,
            normalizeAnalysisMode,
            normalizeCompareScoreMode,
            normalizePeriodYears,
            normalizePeriodMonths,
            cloneCompareFocus,
            cloneTsRange,
            base64UrlEncode,
            base64UrlDecode
          });
          return sessionCodec;
        });
    }
    return sessionCodecModulePromise;
  }

  function getSessionCodec() {
    if (!sessionCodec) {
      throw new Error('session codec not loaded');
    }
    return sessionCodec;
  }

  function loadComparePerspectiveModule() {
    if (!comparePerspectiveModulePromise) {
      comparePerspectiveModulePromise = import(SESSION_PERSPECTIVES_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createComparePerspectiveStore !== 'function') {
            throw new Error('compare perspective module unavailable');
          }
          comparePerspectiveStore = mod.createComparePerspectiveStore({
            getState: () => state,
            getCurrentReportId: () => reports[state.activeIndex]?.id || 'main',
            storageKey: COMPARE_PERSPECTIVE_STORAGE_KEY,
            limit: COMPARE_PERSPECTIVE_LIMIT,
            readStorageText: (key) => localStorage.getItem(key),
            writeStorageText: (key, value) => localStorage.setItem(key, value),
            ensureDurableStorageReady,
            normalizeCompareScoreMode,
            cloneCompareFocus,
            cloneTsRange,
            defaultCompareFocus: DEFAULT_COMPARE_FOCUS
          });
          return comparePerspectiveStore;
        });
    }
    return comparePerspectiveModulePromise;
  }

  function getComparePerspectiveStore() {
    if (!comparePerspectiveStore) {
      throw new Error('compare perspective store not loaded');
    }
    return comparePerspectiveStore;
  }

  function loadExportRuntimeModule() {
    if (!exportRuntimeModulePromise) {
      exportRuntimeModulePromise = import(EXPORT_RUNTIME_MODULE_URL)
        .then((mod) => {
          if (!mod || typeof mod.createExportRuntime !== 'function') {
            throw new Error('export runtime module unavailable');
          }
          exportRuntime = mod.createExportRuntime({
            getState: () => state,
            getReports: () => reports,
            getSlotById,
            getActiveCompareSlots,
            withBandContext,
            withStaticVirtualTableRender,
            renderReport,
            renderPlaceholder,
            showOverlayNotice,
            trackEvent,
            formatNumberSh6,
            formatDateSh6,
            formatBandLabel,
            formatFrequency,
            bandClass,
            modeClass,
            continentClass,
            escapeCall,
            escapeCountry,
            escapeHtml,
            escapeAttr
          });
          return exportRuntime;
        });
    }
    return exportRuntimeModulePromise;
  }

  function getExportRuntime() {
    if (!exportRuntime) {
      throw new Error('export runtime not loaded');
    }
    return exportRuntime;
  }

  async function ensureDurableStorageReady() {
    return getStorageRuntime().ensureDurableStorageReady();
  }

  async function loadDurableRawLog(slotId) {
    return getStorageRuntime().loadDurableRawLog(slotId);
  }

  function persistDurableSlotLog(slotId, slot, text) {
    return getStorageRuntime().persistDurableSlotLog(slotId, slot, text);
  }

  function scheduleAutosaveSession() {
    return getStorageRuntime().scheduleAutosaveSession();
  }

  function ensureEngineTaskWorker() {
    if (engineTaskWorker) return engineTaskWorker;
    if (typeof Worker === 'undefined') return null;
    try {
      engineTaskWorker = new Worker('./modules/engine/task-worker.js', { type: 'module' });
      engineTaskWorker.onmessage = (event) => {
        const payload = event.data || {};
        const resolver = engineTaskResolvers.get(payload.key);
        if (!resolver) return;
        engineTaskResolvers.delete(payload.key);
        if (payload.type === 'taskError') {
          resolver.reject(new Error(payload.error || 'Worker task failed.'));
          return;
        }
        resolver.resolve(payload.data);
      };
      engineTaskWorker.onerror = (event) => {
        const pending = Array.from(engineTaskResolvers.values());
        engineTaskResolvers.clear();
        pending.forEach((entry) => entry.reject(event.error || new Error('Engine worker crashed.')));
        engineTaskWorker = null;
      };
      return engineTaskWorker;
    } catch (err) {
      console.warn('Engine task worker failed to start:', err);
      engineTaskWorker = null;
      return null;
    }
  }

  function runEngineTask(type, payload = {}) {
    const worker = ensureEngineTaskWorker();
    if (!worker) return Promise.reject(new Error('Engine worker unavailable.'));
    const key = `task-${Date.now()}-${++engineTaskSeq}`;
    return new Promise((resolve, reject) => {
      engineTaskResolvers.set(key, { resolve, reject });
      worker.postMessage({ type, key, ...payload });
    });
  }

  function getAnalysisCore() {
    const core = globalThis.SH6AnalysisCore;
    if (!core || typeof core.analyzeLogText !== 'function' || typeof core.buildDerived !== 'function') {
      throw new Error('SH6 analysis core is unavailable.');
    }
    return core;
  }

  function buildAnalysisResourcesPayload() {
    return {
      ctyTable: Array.isArray(state.ctyTable) ? state.ctyTable : [],
      masterCalls: state.masterSet instanceof Set ? Array.from(state.masterSet.values()) : [],
      scoringSpec: state.scoringSpec || null,
      scoringSource: state.scoringSource || '',
      scoringStatus: state.scoringStatus || 'pending',
      scoringError: state.scoringError || '',
      analysisMode: state.analysisMode || ANALYSIS_MODE_DEFAULT,
      callsignGridEntries: state.callsignGridCache instanceof Map ? Array.from(state.callsignGridCache.entries()) : []
    };
  }

  async function analyzeLogWithEngine(text, filename, context = {}) {
    const analysis = buildAnalysisResourcesPayload();
    try {
      return await runEngineTask('analyzeLog', { text, filename, context, analysis });
    } catch (err) {
      console.warn('Engine analyzeLog fallback:', err);
      return getAnalysisCore().analyzeLogText(text, filename, context, analysis);
    }
  }

  async function deriveSlotsWithEngine(slots) {
    const analysis = buildAnalysisResourcesPayload();
    const safeSlots = Array.isArray(slots) ? slots : [];
    try {
      const result = await runEngineTask('deriveSlots', { slots: safeSlots, analysis });
      return Array.isArray(result?.slots) ? result.slots : [];
    } catch (err) {
      console.warn('Engine deriveSlots fallback:', err);
      return safeSlots.map((entry) => {
        const result = getAnalysisCore().deriveLog(entry?.qsoData || { type: 'unknown', qsos: [] }, entry?.context || {}, analysis);
        return {
          slotId: String(entry?.slotId || '').toUpperCase(),
          qsoData: result.qsoData,
          derived: result.derived
        };
      });
    }
  }

  function isRetainedReport(reportId) {
    return RETAINED_REPORT_IDS.has(String(reportId || '').split('::')[0]);
  }

  function destroyVirtualTableControllers() {
    return invokeOptionalRuntime('retained runtime', () => getRetainedRuntime().destroyVirtualTableControllers());
  }

  function renderRetainedReportShell(reportId, html) {
    return invokeOptionalRuntime('retained runtime', () => getRetainedRuntime().renderRetainedReportShell(reportId, html), html);
  }

  function renderRetainedReportContent(reportId) {
    const key = String(reportId || '').split('::')[0];
    switch (key) {
      case 'log':
        return state.compareEnabled ? renderLogCompareContent() : renderLogContent();
      case 'all_callsigns':
        return renderAllCallsignsReportContent();
      case 'not_in_master':
        return renderNotInMasterReportContent();
      case 'session':
        return renderSessionPageContent();
      case 'competitor_coach':
        return renderCompetitorCoachContent();
      case 'agent_briefing':
        return renderAgentBriefingContent();
      case 'dupes':
        return renderDupesReportContent();
      case 'countries':
        return renderCountriesReportContent();
      case 'continents':
        return renderContinentsReportContent();
      case 'zones_cq':
        return renderCqZonesReportContent();
      case 'zones_itu':
        return renderItuZonesReportContent();
      case 'prefixes':
        return renderPrefixesReportContent();
      case 'callsign_length':
        return renderCallsignLengthReportContent();
      case 'callsign_structure':
        return renderCallsignStructureReportContent();
      case 'distance':
        return renderDistanceReportContent();
      case 'beam_heading':
        return renderBeamHeadingReportContent();
      case 'passed_qsos':
        return renderPassedQsosReportContent();
      case 'possible_errors':
        return renderPossibleErrorsReportContent();
      default:
        return '';
    }
  }

  function refreshCurrentReportView(reportId = reports[state.activeIndex]?.id || '') {
    return invokeOptionalRuntime('retained runtime', () => getRetainedRuntime().refreshCurrentReportView(reportId));
  }

  function bindVirtualTable(reportId) {
    return invokeOptionalRuntime('retained runtime', () => getRetainedRuntime().bindVirtualTable(reportId));
  }

  function withStaticVirtualTableRender(fn) {
    return invokeOptionalRuntime('retained runtime', () => getRetainedRuntime().withStaticVirtualTableRender(fn), (typeof fn === 'function' ? fn() : undefined));
  }

  function renderRetainedVirtualTable(reportId, options = {}) {
    return invokeOptionalRuntime('retained runtime', () => getRetainedRuntime().renderRetainedVirtualTable(reportId, options), '');
  }

  function setRetainedReportModel(reportId, model) {
    return invokeOptionalRuntime('retained runtime', () => getRetainedRuntime().setRetainedReportModel(reportId, model));
  }

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
      periodFilterCache: source.periodFilterCache,
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

  function normalizeChartMetricMode(value) {
    const key = String(value || '').trim().toLowerCase();
    return key === CHART_MODE_NORMALIZED ? CHART_MODE_NORMALIZED : CHART_MODE_ABSOLUTE;
  }

  function normalizeScoringDuplicatePolicy(value) {
    const key = String(value || '').trim().toLowerCase();
    if (key === 'include_all_dupes' || key === 'include_dupes') return 'include_all_dupes';
    return 'exclude_all_dupes';
  }

  function resolveScoringDuplicatePolicy(rule) {
    return normalizeScoringDuplicatePolicy(firstNonNull(
      rule?.duplicate_policy,
      rule?.qso_points?.duplicate_policy
    ));
  }

  function normalizeMultiplierCreditPolicy(value) {
    const key = String(value || '').trim().toLowerCase();
    if (key === 'valid_qso_allow_zero_points' || key === 'valid_qso_zero_points' || key === 'valid_qso_allow_zero_point') {
      return 'valid_qso_allow_zero_points';
    }
    return 'positive_points_non_dupe';
  }

  function resolveMultiplierCreditPolicy(rule) {
    if (rule?.multipliers?.credit_on_zero_point_valid_qso === true) {
      return 'valid_qso_allow_zero_points';
    }
    return normalizeMultiplierCreditPolicy(rule?.multipliers?.credit_policy);
  }

  function describeScoringDuplicatePolicy(value) {
    if (!value) return 'N/A';
    const key = normalizeScoringDuplicatePolicy(value);
    if (key === 'include_all_dupes') return 'Duplicates keep QSO-point credit.';
    return 'Duplicates are excluded from QSO-point credit.';
  }

  function describeMultiplierCreditPolicy(value) {
    if (!value) return 'N/A';
    const key = normalizeMultiplierCreditPolicy(value);
    if (key === 'valid_qso_allow_zero_points') return 'Valid non-dupe QSOs may earn multipliers even with zero QSO points.';
    return 'Only positive-point, non-dupe QSOs earn multipliers.';
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
    return getLoadPanelRuntime().setArchiveCompact(slotId, show, pathLabel);
  }

  function updateSlotStatus(slotId) {
    return getLoadPanelRuntime().updateSlotStatus(slotId);
  }

  function setSlotAction(slotId, action) {
    return getLoadPanelRuntime().setSlotAction(slotId, action);
  }

  function updateLoadSummary() {
    return getLoadPanelRuntime().updateLoadSummary();
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
  const runtimeFailureKeys = new Set();

  function logRuntimeFailureOnce(key, err) {
    const safeKey = String(key || 'unknown runtime');
    if (runtimeFailureKeys.has(safeKey)) return;
    runtimeFailureKeys.add(safeKey);
    console.error(`SH6 runtime unavailable: ${safeKey}`, err);
  }

  function invokeOptionalRuntime(key, fn, fallback = undefined) {
    try {
      return typeof fn === 'function' ? fn() : fallback;
    } catch (err) {
      logRuntimeFailureOnce(key, err);
      return fallback;
    }
  }

  function initNavigation() {
    return getNavigationRuntime().initNavigation();
  }

  function applyNavSearchFilter(rawTerm = '') {
    return getNavigationRuntime().applyNavSearchFilter(rawTerm);
  }

  function setupNavSearch() {
    return getNavigationRuntime().setupNavSearch();
  }

  function updateNavHighlight() {
    return getNavigationRuntime().updateNavHighlight();
  }

  function updatePrevNextButtons() {
    return getNavigationRuntime().updatePrevNextButtons();
  }

  function showLoadingState(message) {
    return getNavigationRuntime().showLoadingState(message);
  }

  function clearLoadingState() {
    return getNavigationRuntime().clearLoadingState();
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
    return getNavigationRuntime().renderReportWithLoading(report);
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

  function updatePeriodRibbon() {
    if (!dom.periodFilterRibbon) return;
    const report = reports[state.activeIndex];
    if (!report) {
      dom.periodFilterRibbon.innerHTML = '';
      return;
    }
    syncPeriodFiltersWithAvailableData();
    const availableYears = getAvailableYearsForPeriodFilter();
    const availableMonths = getAvailableMonthsForPeriodFilter();
    if (!availableYears.length && !availableMonths.length) {
      dom.periodFilterRibbon.innerHTML = '<span class="period-message">No period data available.</span>';
      return;
    }
    const selectedYears = normalizePeriodYears(state.globalYearsFilter);
    const selectedMonths = normalizePeriodMonths(state.globalMonthsFilter);
    const yearSet = new Set(selectedYears);
    const monthSet = new Set(selectedMonths);
    const yearActiveAll = selectedYears.length === 0;
    const monthActiveAll = selectedMonths.length === 0;
    const yearLinks = availableYears.map((year) => {
      const isActive = !yearActiveAll && yearSet.has(year);
      const yearAttr = escapeAttr(year);
      const cls = `period-pill${isActive ? ' active' : ''}`;
      return `<a href="#" class="${cls}" data-period-kind="year" data-period-value="${yearAttr}">${escapeHtml(String(year))}</a>`;
    }).join('');
    const monthLinks = availableMonths.map((month) => {
      const label = MONTH_LABELS[month - 1] || String(month);
      const isActive = !monthActiveAll && monthSet.has(month);
      const monthAttr = escapeAttr(month);
      const cls = `period-pill${isActive ? ' active' : ''}`;
      return `<a href="#" class="${cls}" data-period-kind="month" data-period-value="${monthAttr}">${escapeHtml(label)}</a>`;
    }).join('');
    dom.periodFilterRibbon.innerHTML = `
      <div class="period-filter-group">
        <span class="period-label">Year:</span>
        <a href="#" class="period-pill${yearActiveAll ? ' active' : ''}" data-period-kind="all-years">All</a>
        ${yearLinks}
      </div>
      <div class="period-filter-group">
        <span class="period-label">Month:</span>
        <a href="#" class="period-pill${monthActiveAll ? ' active' : ''}" data-period-kind="all-months">All</a>
        ${monthLinks}
      </div>
    `;
  }

  function renderActiveReport() {
    return getNavigationRuntime().renderActiveReport();
  }

  function setActiveReport(idx) {
    return getNavigationRuntime().setActiveReport(idx);
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

  function renderRbnRecommendationCallout() {
    return `
      <section class="report-recommendation-card">
        <span class="report-recommendation-kicker">Author recommendation</span>
        <div class="report-recommendation-body">
          <a href="${escapeAttr(RBN_RECOMMENDATION_URL)}" target="_blank" rel="noopener noreferrer">Open the dedicated RBN analysis site</a>
          <p>Use the standalone RBN workspace for deeper beacon-focused investigation, then come back to SH6 for log-integrated analysis.</p>
        </div>
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

  function renderLocalServerRequiredState() {
    document.body.classList.remove('landing-only', 'load-active', 'is-loading');
    if (dom.viewContainer) dom.viewContainer.setAttribute('aria-busy', 'false');
    if (dom.loadPanel) dom.loadPanel.style.display = 'none';
    if (dom.bandRibbon) dom.bandRibbon.style.display = 'none';
    if (dom.periodFilterRibbon) dom.periodFilterRibbon.style.display = 'none';
    if (dom.navSearchInput) {
      dom.navSearchInput.disabled = true;
      dom.navSearchInput.placeholder = 'Run SH6 over http://127.0.0.1:8000/';
      dom.navSearchInput.setAttribute('aria-disabled', 'true');
    }
    if (dom.navSearchEmpty) {
      dom.navSearchEmpty.hidden = true;
      dom.navSearchEmpty.textContent = '';
    }
    if (dom.navList) {
      dom.navList.innerHTML = `
        <li class="active"><span data-index="-1" class="active sli" aria-current="page">Local server required</span></li>
        <li><span data-index="-2">Run ./scripts/run-local-web.sh</span></li>
        <li><span data-index="-3">Then open http://127.0.0.1:8000/</span></li>
      `;
    }
    if (dom.viewTitle) dom.viewTitle.textContent = 'Local server required';
    if (dom.viewContainer) {
      dom.viewContainer.innerHTML = `
        <section class="state-card state-warn">
          <h3>Open SH6 through a local web server</h3>
          <p>Browsers block module imports, workers, and local data fetches when SH6 is opened from <code>file://</code>. That leaves the menu empty and the load controls non-functional.</p>
          <p>From the SH6 folder run <code>./scripts/run-local-web.sh</code> or <code>python3 -m http.server 8000</code>, then open <a href="http://127.0.0.1:8000/">http://127.0.0.1:8000/</a>.</p>
        </section>
      `;
    }
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
  const BAND_DEF_BY_LABEL = new Map(BAND_DEFS.map((b) => [b.label, b]));
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

  function normalizePeriodYears(values) {
    const unique = new Map();
    (Array.isArray(values) ? values : []).forEach((value) => {
      const year = Number(value);
      if (!Number.isFinite(year)) return;
      const intYear = Math.trunc(year);
      if (intYear >= -10000 && intYear <= 10000) {
        unique.set(intYear, intYear);
      }
    });
    return Array.from(unique.values()).sort((a, b) => a - b);
  }

  function normalizePeriodMonths(values) {
    const unique = new Map();
    (Array.isArray(values) ? values : []).forEach((value) => {
      const month = Number(value);
      if (!Number.isFinite(month)) return;
      const intMonth = Math.trunc(month);
      if (intMonth >= 1 && intMonth <= 12) {
        unique.set(intMonth, intMonth);
      }
    });
    return Array.from(unique.values()).sort((a, b) => a - b);
  }

  function getAvailableYearsFromQsoList(qsos) {
    const years = new Set();
    (qsos || []).forEach((q) => {
      if (!Number.isFinite(q?.ts)) return;
      years.add(new Date(q.ts).getUTCFullYear());
    });
    return Array.from(years).sort((a, b) => a - b);
  }

  function getAvailableMonthsFromQsoList(qsos) {
    const months = new Set();
    (qsos || []).forEach((q) => {
      if (!Number.isFinite(q?.ts)) return;
      months.add((new Date(q.ts).getUTCMonth() + 1));
    });
    return Array.from(months).sort((a, b) => a - b);
  }

  function getAvailablePeriodSourceQsos() {
    const seenSlotIds = new Set();
    const slots = getActiveCompareSlots().map((entry) => {
      const slotId = String(entry?.id || '').toUpperCase();
      if (!slotId) return null;
      return {
        slotId,
        slot: slotId === 'A' ? state : getSlotById(slotId)
      };
    });
    const sets = [];
    slots.forEach((entry) => {
      if (!entry || !entry.slotId || seenSlotIds.has(entry.slotId)) return;
      seenSlotIds.add(entry.slotId);
      const slotQsos = entry.slot?.fullQsoData?.qsos;
      if (Array.isArray(slotQsos)) sets.push(slotQsos);
    });
    return sets;
  }

  function getAvailableYearsForPeriodFilter() {
    const years = new Set();
    getAvailablePeriodSourceQsos().forEach((qsos) => {
      if (!Array.isArray(qsos)) return;
      getAvailableYearsFromQsoList(qsos).forEach((year) => years.add(year));
    });
    return Array.from(years).sort((a, b) => a - b);
  }

  function getAvailableMonthsForPeriodFilter() {
    const months = new Set();
    getAvailablePeriodSourceQsos().forEach((qsos) => {
      if (!Array.isArray(qsos)) return;
      getAvailableMonthsFromQsoList(qsos).forEach((month) => months.add(month));
    });
    const available = Array.from(months).sort((a, b) => a - b);
    const all = MONTH_LABELS.map((_, index) => index + 1);
    return all.filter((month) => available.includes(month));
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
      if (state.analysisMode === ANALYSIS_MODE_DXER && DXER_HIDDEN_REPORTS.has(r.id)) return;
      if (state.analysisMode === ANALYSIS_MODE_CONTESTER && CONTESTER_HIDDEN_REPORTS.has(r.id)) return;
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
    if (safeId === 'countries_by_month_heatmap') {
      return setActiveReportById('countries_by_month', options);
    }
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

  function resolveFrequencyScatterBand(q) {
    const freqBand = Number.isFinite(q?.freq) ? parseBandFromFreq(Number(q.freq)) : '';
    if (freqBand) return freqBand;
    const normalized = normalizeBandToken(q?.band || '');
    return normalized || 'UNKNOWN';
  }

  function collectFrequencyScatterBandRanges(qsos) {
    const byBand = new Map();
    (qsos || []).forEach((q) => {
      if (!Number.isFinite(q?.ts) || !Number.isFinite(q?.freq)) return;
      const band = resolveFrequencyScatterBand(q);
      const freq = Number(q.freq);
      if (!byBand.has(band)) {
        byBand.set(band, { band, minFreq: freq, maxFreq: freq });
      } else {
        const current = byBand.get(band);
        if (freq < current.minFreq) current.minFreq = freq;
        if (freq > current.maxFreq) current.maxFreq = freq;
      }
    });
    return Array.from(byBand.values()).map((entry) => {
      const def = BAND_DEF_BY_LABEL.get(entry.band);
      const minFreq = Number(entry.minFreq);
      const maxFreq = Number(entry.maxFreq);
      const officialMin = Number.isFinite(def?.min) ? Number(def.min) : null;
      const officialMax = Number.isFinite(def?.max) ? Number(def.max) : null;
      return { band: entry.band, minFreq, maxFreq, officialMin, officialMax };
    }).sort((a, b) => {
      const ai = bandOrderIndex(a.band);
      const bi = bandOrderIndex(b.band);
      if (ai !== bi) return ai - bi;
      return String(a.band || '').localeCompare(String(b.band || ''));
    });
  }

  function mergeFrequencyScatterBandRanges(rangeA, rangeB) {
    const merged = new Map();
    const absorb = (entries) => {
      (entries || []).forEach((entry) => {
        if (!entry || !entry.band) return;
        const band = String(entry.band).toUpperCase();
        const minFreq = Number(entry.minFreq);
        const maxFreq = Number(entry.maxFreq);
        const incomingOfficialMin = Number(entry.officialMin);
        const incomingOfficialMax = Number(entry.officialMax);
        if (!merged.has(band)) {
          const def = BAND_DEF_BY_LABEL.get(band);
          merged.set(band, {
            band,
            minFreq: Number.isFinite(minFreq) ? minFreq : null,
            maxFreq: Number.isFinite(maxFreq) ? maxFreq : null,
            officialMin: Number.isFinite(def?.min) ? Number(def.min) : (Number.isFinite(incomingOfficialMin) ? incomingOfficialMin : null),
            officialMax: Number.isFinite(def?.max) ? Number(def.max) : (Number.isFinite(incomingOfficialMax) ? incomingOfficialMax : null)
          });
          return;
        }
        const curr = merged.get(band);
        if (Number.isFinite(minFreq)) curr.minFreq = Number.isFinite(curr.minFreq) ? Math.min(curr.minFreq, minFreq) : minFreq;
        if (Number.isFinite(maxFreq)) curr.maxFreq = Number.isFinite(curr.maxFreq) ? Math.max(curr.maxFreq, maxFreq) : maxFreq;
        if (!Number.isFinite(curr.officialMin) && Number.isFinite(incomingOfficialMin)) curr.officialMin = incomingOfficialMin;
        if (!Number.isFinite(curr.officialMax) && Number.isFinite(incomingOfficialMax)) curr.officialMax = incomingOfficialMax;
      });
    };
    absorb(rangeA?.bandRanges);
    absorb(rangeB?.bandRanges);
    return Array.from(merged.values()).map((entry) => {
      const def = BAND_DEF_BY_LABEL.get(entry.band);
      const minFreq = Number(entry.minFreq);
      const maxFreq = Number(entry.maxFreq);
      const officialMin = Number.isFinite(def?.min) ? Number(def.min) : (Number.isFinite(entry.officialMin) ? Number(entry.officialMin) : null);
      const officialMax = Number.isFinite(def?.max) ? Number(def.max) : (Number.isFinite(entry.officialMax) ? Number(entry.officialMax) : null);
      return { band: entry.band, minFreq, maxFreq, officialMin, officialMax };
    }).sort((a, b) => {
      const ai = bandOrderIndex(a.band);
      const bi = bandOrderIndex(b.band);
      if (ai !== bi) return ai - bi;
      return String(a.band || '').localeCompare(String(b.band || ''));
    });
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
    const bandRanges = collectFrequencyScatterBandRanges(qsos);
    return { minTs, maxTs, minFreq, maxFreq, count, bandRanges };
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
      count: (rangeA.count || 0) + (rangeB.count || 0),
      bandRanges: mergeFrequencyScatterBandRanges(rangeA, rangeB)
    };
  }

  function mergeFrequencyScatterRangesList(ranges) {
    const valid = (ranges || []).filter(Boolean);
    if (!valid.length) return null;
    return valid.reduce((acc, range) => mergeFrequencyScatterRanges(acc, range), null);
  }

  function allocateWeightedBudgets(items, total, options = {}) {
    const list = (items || []).map((item, idx) => ({
      key: item?.key ?? idx,
      weight: Math.max(0, Number(item?.weight) || 0),
      idx
    })).filter((entry) => entry.weight > 0);
    const budgets = new Map();
    list.forEach((entry) => budgets.set(entry.key, 0));
    let remaining = Math.max(0, Math.floor(Number(total) || 0));
    if (!list.length || remaining <= 0) return budgets;
    const ensureMin = Boolean(options.ensureMin);
    if (ensureMin && remaining >= list.length) {
      list.forEach((entry) => budgets.set(entry.key, 1));
      remaining -= list.length;
    }
    if (remaining <= 0) return budgets;
    const weightSum = list.reduce((sum, entry) => sum + entry.weight, 0);
    if (!Number.isFinite(weightSum) || weightSum <= 0) return budgets;
    let used = 0;
    const remainders = list.map((entry) => {
      const raw = (remaining * entry.weight) / weightSum;
      const base = Math.floor(raw);
      used += base;
      budgets.set(entry.key, (budgets.get(entry.key) || 0) + base);
      return {
        key: entry.key,
        frac: raw - base,
        raw,
        idx: entry.idx
      };
    });
    let leftovers = remaining - used;
    remainders.sort((a, b) => b.frac - a.frac || b.raw - a.raw || a.idx - b.idx);
    for (let i = 0; i < leftovers; i += 1) {
      const target = remainders[i % remainders.length];
      budgets.set(target.key, (budgets.get(target.key) || 0) + 1);
    }
    return budgets;
  }

  function selectEvenly(items, count) {
    const list = Array.isArray(items) ? items : [];
    const target = Math.max(0, Math.floor(Number(count) || 0));
    if (!target || !list.length) return [];
    if (target >= list.length) return list.slice();
    if (target === 1) return [list[Math.floor((list.length - 1) / 2)]];
    const out = [];
    const used = new Set();
    const step = (list.length - 1) / (target - 1);
    for (let i = 0; i < target; i += 1) {
      let idx = Math.round(i * step);
      while (idx < list.length && used.has(idx)) idx += 1;
      while (idx >= 0 && used.has(idx)) idx -= 1;
      if (idx < 0 || idx >= list.length || used.has(idx)) continue;
      used.add(idx);
      out.push(list[idx]);
    }
    if (out.length >= target) return out.slice(0, target);
    for (let i = 0; i < list.length && out.length < target; i += 1) {
      if (used.has(i)) continue;
      used.add(i);
      out.push(list[i]);
    }
    return out;
  }

  function appendUniquePoints(target, candidates, limit, seen) {
    const out = target;
    (candidates || []).forEach((point) => {
      if (!point) return;
      if (out.length >= limit) return;
      const key = Number(point.idx);
      if (!Number.isFinite(key) || seen.has(key)) return;
      seen.add(key);
      out.push(point);
    });
    return out;
  }

  function selectSpPoints(points, count) {
    const list = Array.isArray(points) ? points : [];
    const target = Math.max(0, Math.floor(Number(count) || 0));
    if (!target || !list.length) return [];
    if (target >= list.length) return list.slice();
    const byTs = list.slice().sort((a, b) => a.ts - b.ts || a.idx - b.idx);
    const byFreq = list.slice().sort((a, b) => a.freq - b.freq || a.ts - b.ts || a.idx - b.idx);
    const freqBudget = Math.max(1, Math.min(target, Math.ceil(target * 0.6)));
    const timeBudget = Math.max(0, target - freqBudget);
    const out = [];
    const seen = new Set();
    appendUniquePoints(out, selectEvenly(byFreq, freqBudget), target, seen);
    appendUniquePoints(out, selectEvenly(byTs, timeBudget), target, seen);
    if (out.length < target) {
      appendUniquePoints(out, selectEvenly(byTs, target), target, seen);
    }
    return out.slice(0, target);
  }

  function sampleFrequencyBucket(points, budget) {
    const list = (points || []).slice().sort((a, b) => a.ts - b.ts || a.idx - b.idx);
    const target = Math.max(0, Math.floor(Number(budget) || 0));
    if (!target || !list.length) return [];
    if (target >= list.length) return list;
    const binWidth = 0.002; // 2 kHz bins for run-frequency clustering.
    const bins = new Map();
    list.forEach((point) => {
      const key = Math.round(point.freq / binWidth);
      if (!bins.has(key)) bins.set(key, []);
      bins.get(key).push(point);
    });
    let dominantKey = null;
    let dominantCount = 0;
    bins.forEach((members, key) => {
      if (members.length > dominantCount) {
        dominantCount = members.length;
        dominantKey = key;
      }
    });
    const hasRunCluster = dominantKey != null && dominantCount >= 3 && (dominantCount / list.length) >= 0.2;
    if (!hasRunCluster) return selectSpPoints(list, target);
    const runPoints = list.filter((point) => Math.round(point.freq / binWidth) === dominantKey);
    const spPoints = list.filter((point) => Math.round(point.freq / binWidth) !== dominantKey);
    let runBudget = Math.min(runPoints.length, Math.max(1, Math.round(target * 0.6)));
    let spBudget = target - runBudget;
    if (spPoints.length && spBudget <= 0 && target >= 2) {
      spBudget = 1;
      runBudget = Math.max(0, target - spBudget);
    }
    if (spBudget > spPoints.length) {
      runBudget = Math.min(runPoints.length, runBudget + (spBudget - spPoints.length));
      spBudget = spPoints.length;
    }
    const selectedRun = selectEvenly(runPoints, runBudget);
    const selectedSp = selectSpPoints(spPoints, spBudget);
    const out = [];
    const seen = new Set();
    appendUniquePoints(out, selectedRun, target, seen);
    appendUniquePoints(out, selectedSp, target, seen);
    if (out.length < target) {
      appendUniquePoints(out, selectSpPoints(list, target), target, seen);
    }
    return out.slice(0, target);
  }

  function sampleFrequencyBand(points, budget) {
    const list = (points || []).slice().sort((a, b) => a.ts - b.ts || a.idx - b.idx);
    const target = Math.max(0, Math.floor(Number(budget) || 0));
    if (!target || !list.length) return [];
    if (target >= list.length) return list;
    const anchors = [];
    anchors.push(list[0]);
    if (list.length > 1) anchors.push(list[list.length - 1]);
    const anchorCount = Math.min(target, anchors.length);
    const coreBudget = Math.max(0, target - anchorCount);
    const core = list.slice(1, -1);
    const sampledCore = [];
    if (coreBudget > 0 && core.length) {
      const bucketMs = 10 * 60 * 1000;
      const startTs = list[0].ts;
      const buckets = new Map();
      core.forEach((point) => {
        const key = Math.floor((point.ts - startTs) / bucketMs);
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(point);
      });
      const bucketItems = Array.from(buckets.entries()).map(([key, members]) => ({ key, members }));
      const bucketBudgets = allocateWeightedBudgets(
        bucketItems.map((entry) => ({ key: entry.key, weight: entry.members.length })),
        coreBudget,
        { ensureMin: true }
      );
      bucketItems.sort((a, b) => a.key - b.key);
      bucketItems.forEach((entry) => {
        const b = bucketBudgets.get(entry.key) || 0;
        if (!b) return;
        sampledCore.push(...sampleFrequencyBucket(entry.members, b));
      });
      if (sampledCore.length < coreBudget) {
        const used = new Set(sampledCore.map((point) => point.idx));
        const leftover = core.filter((point) => !used.has(point.idx));
        sampledCore.push(...selectSpPoints(leftover, coreBudget - sampledCore.length));
      } else if (sampledCore.length > coreBudget) {
        const trimmed = selectEvenly(sampledCore.sort((a, b) => a.ts - b.ts || a.idx - b.idx), coreBudget);
        sampledCore.length = 0;
        sampledCore.push(...trimmed);
      }
    }
    const out = [];
    const seen = new Set();
    appendUniquePoints(out, anchors.slice(0, anchorCount), target, seen);
    appendUniquePoints(out, sampledCore, target, seen);
    if (out.length < target) {
      appendUniquePoints(out, selectSpPoints(list, target), target, seen);
    }
    return out.sort((a, b) => a.ts - b.ts || a.idx - b.idx).slice(0, target);
  }

  function sampleFrequencyScatterPoints(qsos, maxPoints = 6000) {
    const all = [];
    let pointIndex = 0;
    (qsos || []).forEach((q) => {
      if (!Number.isFinite(q.ts) || !Number.isFinite(q.freq)) return;
      all.push({
        idx: pointIndex,
        ts: Number(q.ts),
        freq: Number(q.freq),
        band: resolveFrequencyScatterBand(q)
      });
      pointIndex += 1;
    });
    if (!all.length) return { points: [], total: 0 };
    const total = all.length;
    const cap = Math.max(1, Math.floor(Number(maxPoints) || 6000));
    if (total <= cap) {
      const points = all
        .slice()
        .sort((a, b) => a.ts - b.ts || a.idx - b.idx)
        .map((point) => ({ ts: point.ts, freq: point.freq, band: point.band }));
      return { points, total };
    }
    const byBand = new Map();
    all.forEach((point) => {
      if (!byBand.has(point.band)) byBand.set(point.band, []);
      byBand.get(point.band).push(point);
    });
    const bands = Array.from(byBand.entries()).map(([band, points]) => ({ band, points }))
      .sort((a, b) => {
        const ai = bandOrderIndex(a.band);
        const bi = bandOrderIndex(b.band);
        if (ai !== bi) return ai - bi;
        return String(a.band || '').localeCompare(String(b.band || ''));
      });
    const bandBudgets = allocateWeightedBudgets(
      bands.map((entry) => ({ key: entry.band, weight: entry.points.length })),
      cap,
      { ensureMin: true }
    );
    const sampled = [];
    bands.forEach((entry) => {
      const budget = bandBudgets.get(entry.band) || 0;
      if (!budget) return;
      sampled.push(...sampleFrequencyBand(entry.points, budget));
    });
    const sampledSorted = sampled.sort((a, b) => a.ts - b.ts || a.idx - b.idx);
    const points = (sampledSorted.length > cap ? selectEvenly(sampledSorted, cap) : sampledSorted)
      .map((point) => ({ ts: point.ts, freq: point.freq, band: point.band }));
    return { points, total };
  }

  function buildFrequencyScatterBrackets(bandRanges, plotTop, plotBottom) {
    const ordered = (bandRanges || []).slice().sort((a, b) => {
      const ai = bandOrderIndex(a.band);
      const bi = bandOrderIndex(b.band);
      const aUnknown = ai === 9999;
      const bUnknown = bi === 9999;
      if (aUnknown !== bUnknown) return aUnknown ? 1 : -1;
      if (ai !== bi) return bi - ai;
      return String(a.band || '').localeCompare(String(b.band || ''));
    });
    if (!ordered.length) return [];
    const totalHeight = Math.max(1, plotBottom - plotTop);
    let gap = ordered.length > 1 ? Math.min(6, Math.max(1, totalHeight / (ordered.length * 8))) : 0;
    let available = totalHeight - (gap * (ordered.length - 1));
    let baseHeight = available / ordered.length;
    if (!Number.isFinite(baseHeight) || baseHeight <= 0) {
      gap = 0;
      available = totalHeight;
      baseHeight = available / ordered.length;
    }
    return ordered.map((entry, idx) => {
      const top = plotTop + idx * (baseHeight + gap);
      const bottom = top + baseHeight;
      const rawMin = Number(entry.minFreq);
      const rawMax = Number(entry.maxFreq);
      const officialMin = Number(entry.officialMin);
      const officialMax = Number(entry.officialMax);
      let minFreq = Number.isFinite(rawMin) ? rawMin : 0;
      let maxFreq = Number.isFinite(rawMax) ? rawMax : minFreq;
      if (maxFreq < minFreq) {
        const tmp = minFreq;
        minFreq = maxFreq;
        maxFreq = tmp;
      }
      const officialSpan = (Number.isFinite(officialMin) && Number.isFinite(officialMax) && officialMax > officialMin)
        ? (officialMax - officialMin)
        : null;
      const minSpan = Number.isFinite(officialSpan)
        ? Math.max(0.005, Math.min(0.05, officialSpan * 0.03))
        : 0.01;
      let span = maxFreq - minFreq;
      if (!Number.isFinite(span) || span < minSpan) {
        const center = Number.isFinite(minFreq) && Number.isFinite(maxFreq)
          ? (minFreq + maxFreq) / 2
          : (Number.isFinite(officialMin) ? officialMin : 0);
        span = minSpan;
        minFreq = center - (span / 2);
        maxFreq = center + (span / 2);
      }
      const pad = span * 0.05;
      minFreq -= pad;
      maxFreq += pad;
      if (Number.isFinite(officialMin)) minFreq = Math.max(minFreq, officialMin);
      if (Number.isFinite(officialMax)) maxFreq = Math.min(maxFreq, officialMax);
      if (!Number.isFinite(maxFreq) || maxFreq <= minFreq) {
        if (Number.isFinite(officialMin) && Number.isFinite(officialMax) && officialMax > officialMin) {
          minFreq = officialMin;
          maxFreq = officialMax;
        } else {
          maxFreq = minFreq + minSpan;
        }
      }
      return {
        band: entry.band,
        top,
        bottom,
        minFreq,
        maxFreq
      };
    });
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
      case 'countries_by_month':
        return 0;
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
      'countries_by_month',
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
      'countries_by_month',
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

  function sanitizeFilenameToken(value, fallback = 'item') {
    const safe = String(value == null ? '' : value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return safe || fallback;
  }

  function downloadBlobFile(blob, filename) {
    if (!(blob instanceof Blob)) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename || 'image.png';
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function canvasToBlobAsync(canvas, type = 'image/png', quality) {
    return new Promise((resolve, reject) => {
      if (!(canvas instanceof HTMLCanvasElement)) {
        reject(new Error('Invalid canvas'));
        return;
      }
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create PNG blob'));
        }, type, quality);
        return;
      }
      try {
        const dataUrl = canvas.toDataURL(type, quality);
        const payload = dataUrl.split(',')[1] || '';
        const bytes = atob(payload);
        const buffer = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i += 1) buffer[i] = bytes.charCodeAt(i);
        resolve(new Blob([buffer], { type }));
      } catch (err) {
        reject(err);
      }
    });
  }

  async function copyRbnSignalCardImage(button) {
    return getRbnSignalExportRuntime().copyRbnSignalCardImage(button);
  }

  function dateKeyFromTs(ts) {
    const d = new Date(ts);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    return y * 10000 + m * 100 + day;
  }

  function monthKeyFromTs(ts) {
    if (!Number.isFinite(ts)) return '';
    const d = new Date(ts);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    return `${y}-${String(m).padStart(2, '0')}`;
  }

  function yearKeyFromTs(ts) {
    if (!Number.isFinite(ts)) return '';
    const d = new Date(ts);
    return String(d.getUTCFullYear());
  }

  function monthLabelFromKey(monthKey) {
    if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) return monthKey;
    const y = Number(monthKey.slice(0, 4));
    const m = Number(monthKey.slice(5, 7)) - 1;
    const month = new Date(Date.UTC(y, m, 1));
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthText = shortMonths[month.getUTCMonth()] || '';
    return monthText ? `${monthText} ${y}` : monthKey;
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

  function buildCountryMonthBuckets(qsos, bandFilter) {
    const map = new Map(); // country -> { total, months: Map(monthKey -> count) }
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    qsos.forEach((q) => {
      const qBand = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey && qBand !== bandKey) return;
      if (q.country == null || q.ts == null) return;
      const monthKey = monthKeyFromTs(q.ts);
      if (!monthKey) return;
      if (!map.has(q.country)) {
        map.set(q.country, {
          total: 0,
          months: new Map()
        });
      }
      const buckets = map.get(q.country);
      buckets.total += 1;
      buckets.months.set(monthKey, (buckets.months.get(monthKey) || 0) + 1);
    });
    return map;
  }

  function buildCountryMonthOfYearBuckets(qsos, bandFilter) {
    const map = new Map(); // country -> { total, months: number[12] }
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    qsos.forEach((q) => {
      const qBand = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey && qBand !== bandKey) return;
      if (q.country == null || q.ts == null) return;
      const d = new Date(q.ts);
      const monthIndex = d.getUTCMonth();
      if (!Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) return;
      if (!map.has(q.country)) {
        map.set(q.country, {
          total: 0,
          months: Array.from({ length: 12 }, () => 0)
        });
      }
      const buckets = map.get(q.country);
      buckets.total += 1;
      buckets.months[monthIndex] = (buckets.months[monthIndex] || 0) + 1;
    });
    return map;
  }

  function getCountryMonthHeatMaxCount(countryMonthMap) {
    let max = 0;
    countryMonthMap.forEach((entry) => {
      const months = Array.isArray(entry?.months) ? entry.months : [];
      months.forEach((count) => {
        const safe = Number(count) || 0;
        if (safe > max) max = safe;
      });
    });
    return max;
  }

  function monthHeatClass(count, maxCount) {
    const safeCount = Number(count) || 0;
    const safeMax = Number(maxCount) || 0;
    if (!safeCount || safeMax <= 0) return '';
    const level = Math.min(10, Math.max(1, Math.ceil((safeCount / safeMax) * 10)));
    return `s${level - 1}`;
  }

  function buildZoneMonthBuckets(qsos, field, bandFilter) {
    const map = new Map(); // zone -> { total, months: Map(monthKey -> count), countries: Set }
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    const fieldName = field === 'itu' ? 'ituZone' : 'cqZone';
    qsos.forEach((q) => {
      const qBand = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey && qBand !== bandKey) return;
      const zone = Number.isFinite(q[fieldName]) ? q[fieldName] : null;
      if (!zone) return;
      if (q.ts == null) return;
      const monthKey = monthKeyFromTs(q.ts);
      if (!monthKey) return;
      if (!map.has(zone)) {
        map.set(zone, {
          total: 0,
          months: new Map(),
          countries: new Set()
        });
      }
      const buckets = map.get(zone);
      buckets.total += 1;
      buckets.months.set(monthKey, (buckets.months.get(monthKey) || 0) + 1);
      if (q.country) buckets.countries.add(q.country);
    });
    return map;
  }

  function buildCountryYearBuckets(qsos, bandFilter) {
    const map = new Map(); // country -> { total, years: Map(yearKey -> count) }
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    qsos.forEach((q) => {
      const qBand = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey && qBand !== bandKey) return;
      if (q.country == null || q.ts == null) return;
      const yearKey = yearKeyFromTs(q.ts);
      if (!yearKey) return;
      if (!map.has(q.country)) {
        map.set(q.country, {
          total: 0,
          years: new Map()
        });
      }
      const buckets = map.get(q.country);
      buckets.total += 1;
      buckets.years.set(yearKey, (buckets.years.get(yearKey) || 0) + 1);
    });
    return map;
  }

  function buildZoneYearBuckets(qsos, field, bandFilter) {
    const map = new Map(); // zone -> { total, years: Map(yearKey -> count), countries: Set }
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    const fieldName = field === 'itu' ? 'ituZone' : 'cqZone';
    qsos.forEach((q) => {
      const qBand = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey && qBand !== bandKey) return;
      const zone = Number.isFinite(q[fieldName]) ? q[fieldName] : null;
      if (!zone) return;
      if (q.ts == null) return;
      const yearKey = yearKeyFromTs(q.ts);
      if (!yearKey) return;
      if (!map.has(zone)) {
        map.set(zone, {
          total: 0,
          years: new Map(),
          countries: new Set()
        });
      }
      const buckets = map.get(zone);
      buckets.total += 1;
      buckets.years.set(yearKey, (buckets.years.get(yearKey) || 0) + 1);
      if (q.country) buckets.countries.add(q.country);
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
        warning: state.analysisMode === ANALYSIS_MODE_DXER ? SCORING_UNKNOWN_WARNING_DXER : SCORING_UNKNOWN_WARNING,
        assumptions: ['No matching scoring rule set found for this log.'],
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
    const duplicatePolicy = resolveScoringDuplicatePolicy(rule);
    const scoreDuplicates = duplicatePolicy === 'include_all_dupes';
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
      const isDuplicate = Boolean(q?.isDupe);
      if (facts.call && (!isDuplicate || scoreDuplicates)) uniqueCalls.add(facts.call);
      if (isDuplicate && !scoreDuplicates) {
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
    const multiplierCreditPolicy = resolveMultiplierCreditPolicy(rule);
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
      const facts = buildQsoScoringFacts(q, station, runtime);
      const pointValue = Number(pointState?.pointsByIndex?.[idx]);
      const eligible = multiplierCreditPolicy === 'valid_qso_allow_zero_points'
        ? (!q?.isDupe && facts.validQso && (!Number.isFinite(pointValue) || pointValue >= 0))
        : (!q?.isDupe && Number.isFinite(pointValue) && pointValue > 0);
      if (!eligible) {
        markScoringRuntime(facts, runtime);
        return;
      }
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
    const duplicatePolicy = resolveScoringDuplicatePolicy(resolved?.rule);
    const scoreDuplicates = duplicatePolicy === 'include_all_dupes';
    const pointsByIndex = new Array((qsos || []).length).fill(0);
    const multOnce = new Set();
    const multPerBand = new Set();
    const multPerMode = { CW: new Set(), SSB: new Set(), DIG: new Set() };
    const uniqueCalls = new Set();
    let qsoPointsTotal = 0;
    let multiplierTotal = 0;

    (qsos || []).forEach((q, idx) => {
      const facts = buildQsoScoringFacts(q, station, runtime);
      if (q?.isDupe && !scoreDuplicates) {
        return;
      }
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
    const duplicatePolicy = resolveScoringDuplicatePolicy(resolved?.rule);
    const scoreDuplicates = duplicatePolicy === 'include_all_dupes';
    const pointsByIndex = new Array((qsos || []).length).fill(0);
    const multPerBand = new Set();
    let qsoPointsTotal = 0;

    (qsos || []).forEach((q, idx) => {
      const facts = buildQsoScoringFacts(q, station, runtime);
      if (q?.isDupe && !scoreDuplicates) {
        return;
      }
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
    const ruleSpecVersion = String(state.scoringSpec?.spec_version || '');
    const ruleSpecSource = String(state.scoringSource || '');
    const duplicatePolicy = resolved?.rule ? resolveScoringDuplicatePolicy(resolved.rule) : '';
    const multiplierCreditPolicy = resolved?.rule ? resolveMultiplierCreditPolicy(resolved.rule) : '';
    const ruleReferenceUrl = Array.isArray(resolved?.rule?.official_rules_urls) && resolved.rule.official_rules_urls.length
      ? String(resolved.rule.official_rules_urls[0] || '')
      : '';
    if (!resolved.supported) {
      return {
        supported: false,
        confidence: 'unknown',
        warning: resolved.warning || (state.analysisMode === ANALYSIS_MODE_DXER ? SCORING_UNKNOWN_WARNING_DXER : SCORING_UNKNOWN_WARNING),
        assumptions: Array.isArray(resolved.assumptions) ? resolved.assumptions : [],
        detectionMethod: resolved.detectionMethod || 'none',
        detectionValue: resolved.detectionValue || '',
        ruleId: null,
        ruleName: state.analysisMode === ANALYSIS_MODE_DXER ? 'Unknown rules' : 'Unknown contest',
        claimedScoreHeader,
        loggedPointsTotal,
        ruleSpecVersion,
        ruleSpecSource,
        ruleReferenceUrl,
        duplicatePolicy,
        multiplierCreditPolicy,
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
        assumptions.add('Bundle matched but subevent was not detected. Logged points fallback is used.');
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
        ruleSpecVersion,
        ruleSpecSource,
        ruleReferenceUrl,
        duplicatePolicy,
        multiplierCreditPolicy,
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
        ruleSpecVersion,
        ruleSpecSource,
        ruleReferenceUrl,
        duplicatePolicy,
        multiplierCreditPolicy,
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
      ruleSpecVersion,
      ruleSpecSource,
      ruleReferenceUrl,
      duplicatePolicy,
      multiplierCreditPolicy,
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

  function buildBreakReportMetrics(derived, threshold) {
    const minutesMap = new Map((derived?.minuteSeries || []).map((m) => [m.minute, m.qsos]));
    const breakSummary = computeBreakSummary(minutesMap, threshold);
    const minTs = Number(derived?.timeRange?.minTs);
    const maxTs = Number(derived?.timeRange?.maxTs);
    const participationMin = Number.isFinite(minTs) && Number.isFinite(maxTs) && maxTs >= minTs
      ? Math.round((maxTs - minTs) / 60000)
      : null;
    const onAirMin = participationMin != null
      ? Math.max(participationMin - breakSummary.totalBreakMin, 0)
      : null;
    return {
      breakSummary,
      participationMin,
      onAirMin
    };
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
    return getAnalysisCore().parseLogFile(text, filename);
  }

  function mapSpotStatus(status) {
    if (status === 'ready') return 'ok';
    if (status === 'loading') return 'loading';
    if (status === 'qrx') return 'qrx';
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
    const setSourceIndicator = (el, src, status) => {
      if (!el) return;
      const info = classifySource(src);
      const show = status === 'ok' && Boolean(info.mark);
      el.textContent = show ? info.mark : '';
      el.title = show ? (src || '') : '';
      el.className = ['source-indicator', info.className, show ? '' : 'hidden'].filter(Boolean).join(' ');
    };
    const formatStatus = (status, src) => {
      if (status === 'ok') return isProxy(src) ? 'OK - Ready' : 'OK';
      if (status === 'loading') return isProxy(src) ? 'proxy loading' : 'loading';
      if (status === 'qrx') return 'QRX';
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
        state.ctyStatus === 'qrx' ? 'status-qrx' : '',
        state.ctyStatus === 'error' ? 'status-error' : ''
      ].filter(Boolean).join(' ');
    }
    setSourceIndicator(dom.ctySourceLabel, state.ctySource, state.ctyStatus);
    if (dom.masterStatus) {
      dom.masterStatus.textContent = formatStatus(state.masterStatus, state.masterSource);
      dom.masterStatus.title = [state.masterSource, state.masterError].filter(Boolean).join(' ');
      const proxy = isProxy(state.masterSource);
      dom.masterStatus.className = [
        'status-indicator',
        state.masterStatus === 'ok' ? 'status-ok' : '',
        state.masterStatus === 'loading' ? (proxy ? 'status-proxy-loading' : 'status-loading') : '',
        state.masterStatus === 'qrx' ? 'status-qrx' : '',
        state.masterStatus === 'error' ? 'status-error' : ''
      ].filter(Boolean).join(' ');
    }
    setSourceIndicator(dom.masterSourceLabel, state.masterSource, state.masterStatus);
    if (dom.qthStatus) {
      dom.qthStatus.textContent = formatStatus(state.qthStatus, state.qthSource);
      dom.qthStatus.title = [state.qthSource, state.qthError].filter(Boolean).join(' ');
      const proxy = isProxy(state.qthSource);
      dom.qthStatus.className = [
        'status-indicator',
        state.qthStatus === 'ok' ? 'status-ok' : '',
        state.qthStatus === 'loading' ? (proxy ? 'status-proxy-loading' : 'status-loading') : '',
        state.qthStatus === 'qrx' ? 'status-qrx' : '',
        state.qthStatus === 'error' ? 'status-error' : ''
      ].filter(Boolean).join(' ');
    }
    if (dom.qthStatusRow) {
      dom.qthStatusRow.classList.toggle('hidden', state.qthStatus === 'pending');
    }
    setSourceIndicator(dom.qthSourceLabel, state.qthSource, state.qthStatus);
    if (dom.cqApiStatus) {
      dom.cqApiStatus.textContent = formatStatus(state.cqApiStatus, state.cqApiSource);
      dom.cqApiStatus.title = [state.cqApiSource, state.cqApiError].filter(Boolean).join(' ');
      const proxy = isProxy(state.cqApiSource);
      dom.cqApiStatus.className = [
        'status-indicator',
        state.cqApiStatus === 'ok' ? 'status-ok' : '',
        state.cqApiStatus === 'loading' ? (proxy ? 'status-proxy-loading' : 'status-loading') : '',
        state.cqApiStatus === 'qrx' ? 'status-qrx' : '',
        state.cqApiStatus === 'error' ? 'status-error' : ''
      ].filter(Boolean).join(' ');
    }
    if (dom.cqApiStatusRow) {
      dom.cqApiStatusRow.classList.toggle('hidden', state.cqApiStatus === 'pending');
    }
    setSourceIndicator(dom.cqApiSourceLabel, state.cqApiSource, state.cqApiStatus);
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
        status === 'qrx' ? 'status-qrx' : '',
        status === 'error' ? 'status-error' : ''
      ].filter(Boolean).join(' ');
    }
    setSourceIndicator(dom.spotsSourceLabel, SPOTS_BASE_URL, mapSpotStatus(ensureSpotsState(state).status));
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
        status === 'qrx' ? 'status-qrx' : '',
        status === 'error' ? 'status-error' : ''
      ].filter(Boolean).join(' ');
    }
    setSourceIndicator(dom.rbnSourceLabel, RBN_PROXY_URL, mapSpotStatus(ensureRbnState(state).status));
    if (dom.spotHunterStatus) {
      const status = mapSpotStatus(state.spotHunterStatus);
      dom.spotHunterStatus.textContent = formatStatus(status, state.spotHunterSource);
      dom.spotHunterStatus.title = [state.spotHunterSource, state.spotHunterError].filter(Boolean).join(' ');
      const proxy = isProxy(state.spotHunterSource);
      dom.spotHunterStatus.className = [
        'status-indicator',
        status === 'ok' ? 'status-ok' : '',
        status === 'loading' ? (proxy ? 'status-proxy-loading' : 'status-loading') : '',
        status === 'qrx' ? 'status-qrx' : '',
        status === 'error' ? 'status-error' : ''
      ].filter(Boolean).join(' ');
    }
    setSourceIndicator(dom.spotHunterSourceLabel, state.spotHunterSource, mapSpotStatus(state.spotHunterStatus));
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
      const parsed = await applyLoadedLogToSlot(slotId, text, file.name, file.size, sourceLabel || 'Uploaded', statusEl);
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

  async function applyLoadedLogToSlot(slotId, text, filename, size, sourceLabel, statusEl, sourcePath) {
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
    target.rawLogText = text;
    const analysisSeq = (target.analysisSeq || 0) + 1;
    target.analysisSeq = analysisSeq;
    if (statusTarget) statusTarget.textContent = `Analyzing ${filename} (${formatNumberSh6(safeSize)} bytes)...`;
    const analyzed = await analyzeLogWithEngine(text, filename, {
      logFile: target.logFile,
      sourcePath: target.logFile?.path || '',
      analysisMode: state.analysisMode
    });
    if (target.analysisSeq !== analysisSeq) return null;
    target.qsoData = analyzed?.qsoData || { type: 'unknown', qsos: [] };
    target.derived = analyzed?.derived || buildDerived(target.qsoData.qsos, {
      logFile: target.logFile,
      analysisMode: state.analysisMode
    });
    queueCallsignGridLookup(target.qsoData.qsos);
    const suggestedMode = target === state || !state.qsoData ? resolveAnalysisModeSuggestion(target.qsoData, target.derived) : null;
    if (target === state || !state.qsoData) {
      setAnalysisModeSuggestion(suggestedMode);
    }
    target.qsoLite = buildQsoLiteArray(target.qsoData.qsos);
    target.fullQsoData = target.qsoData;
    target.fullDerived = target.derived;
    target.bandDerivedCache = new Map();
    target.periodFilterCache = new Map();
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
    persistDurableSlotLog(slotKey, target, text);
    scheduleAutosaveSession();
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
            await recomputeDerived('cty');
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
            await recomputeDerived('master');
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

  async function recomputeDerived(reason) {
    const slotRequests = [];
    if (state.qsoData) {
      slotRequests.push({
        slotId: 'A',
        qsoData: state.qsoData,
        context: {
          logFile: state.logFile,
          sourcePath: state.logFile?.path || '',
          analysisMode: state.analysisMode
        }
      });
    }
    state.compareSlots.forEach((slot, index) => {
      if (!slot || !slot.qsoData) return;
      slotRequests.push({
        slotId: String.fromCharCode('B'.charCodeAt(0) + index),
        qsoData: slot.qsoData,
        context: {
          logFile: slot.logFile,
          sourcePath: slot.logFile?.path || '',
          analysisMode: state.analysisMode
        }
      });
    });
    if (!slotRequests.length) return;
    const recomputeSeq = ++derivedRecomputeSeq;
    const results = await deriveSlotsWithEngine(slotRequests);
    if (recomputeSeq !== derivedRecomputeSeq) return;
    results.forEach((result) => {
      const slot = getSlotById(result.slotId);
      if (!slot) return;
      slot.qsoData = result.qsoData;
      slot.derived = result.derived;
      slot.qsoLite = buildQsoLiteArray(slot.qsoData?.qsos || []);
      slot.fullQsoData = slot.qsoData;
      slot.fullDerived = slot.derived;
      slot.bandDerivedCache = new Map();
      slot.periodFilterCache = new Map();
      slot.logVersion = (slot.logVersion || 0) + 1;
    });
    state.competitorCoach = createCompetitorCoachState(state.competitorCoach);
    invalidateCompareLogData();
    syncPeriodFiltersWithAvailableData();
    updateBandRibbon();
    rebuildReports();
    renderActiveReport();
  }

  function shouldBandFilterReport(reportId) {
    return shouldBandFilterControls(reportId) && !!state.globalBandFilter;
  }

  function shouldBandFilterControls(reportId) {
    const baseId = String(reportId || '').split('::')[0];
    const excluded = new Set([
      'kmz_files',
      'comments',
      'sh6_info',
      'competitor_coach'
    ]);
    return !excluded.has(baseId);
  }

  function shouldPeriodFilterReport(reportId) {
    if (state.analysisMode !== ANALYSIS_MODE_DXER) return false;
    return shouldBandFilterControls(reportId);
  }

  function syncPeriodFiltersWithAvailableData() {
    const normalizedYears = normalizePeriodYears(state.globalYearsFilter);
    const normalizedMonths = normalizePeriodMonths(state.globalMonthsFilter);
    const availableYears = getAvailableYearsForPeriodFilter();
    const availableMonths = getAvailableMonthsForPeriodFilter();
    const hasInvalidYears = normalizedYears.some((year) => !availableYears.includes(year));
    const hasInvalidMonths = normalizedMonths.some((month) => !availableMonths.includes(month));
    const nextYears = hasInvalidYears ? normalizedYears.filter((year) => availableYears.includes(year)) : normalizedYears;
    const nextMonths = hasInvalidMonths ? normalizedMonths.filter((month) => availableMonths.includes(month)) : normalizedMonths;
    state.globalYearsFilter = nextYears;
    state.globalMonthsFilter = nextMonths;
    if (hasInvalidYears || hasInvalidMonths) {
      state.periodFilterCache = new Map();
      return true;
    }
    return false;
  }

  function getPeriodFilteredQsosFromList(qsos, years, months) {
    const activeYears = normalizePeriodYears(years);
    const activeMonths = normalizePeriodMonths(months);
    if (!activeYears.length && !activeMonths.length) {
      return Array.isArray(qsos) ? qsos.slice() : [];
    }
    if (!Array.isArray(qsos)) return [];
    return qsos.filter((q) => {
      if (!Number.isFinite(q?.ts)) return false;
      const d = new Date(q.ts);
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth() + 1;
      const matchedYear = !activeYears.length || activeYears.includes(year);
      const matchedMonth = !activeMonths.length || activeMonths.includes(month);
      return matchedYear && matchedMonth;
    });
  }

  function buildPeriodFilterCacheKey(years, months, band) {
    const yearKey = (normalizePeriodYears(years).length ? normalizePeriodYears(years).join(',') : 'all');
    const monthKey = (normalizePeriodMonths(months).length ? normalizePeriodMonths(months).join(',') : 'all');
    const bandKey = String(band || '').toUpperCase();
    const sourceKey = `${state.logVersion || 0}`;
    return `${sourceKey}|y:${yearKey}|m:${monthKey}|b:${bandKey}`;
  }

  function withPeriodContext(reportId, fn) {
    if (!shouldPeriodFilterReport(reportId)) return fn();
    syncPeriodFiltersWithAvailableData();
    const years = normalizePeriodYears(state.globalYearsFilter);
    const months = normalizePeriodMonths(state.globalMonthsFilter);
    if (!years.length && !months.length) return fn();
    const baseQsos = state.qsoData?.qsos || [];
    const cache = state.periodFilterCache || new Map();
    if (!state.periodFilterCache) state.periodFilterCache = cache;
    const cacheKey = buildPeriodFilterCacheKey(years, months, state.globalBandFilter);
    let cached = cache.get(cacheKey);
    let filteredQsos = cached && Array.isArray(cached.qsos) ? cached.qsos : null;
    let periodDerived = cached && cached.derived ? cached.derived : null;
    if (!filteredQsos || !periodDerived) {
      filteredQsos = getPeriodFilteredQsosFromList(baseQsos, years, months);
      periodDerived = buildDerived(filteredQsos, {
        logFile: state.logFile,
        sourcePath: state.logFile?.path || '',
        analysisMode: state.analysisMode
      });
      cache.set(cacheKey, { qsos: filteredQsos, derived: periodDerived });
    }
    const prevQsoData = state.qsoData;
    const prevDerived = state.derived;
    state.qsoData = { ...(state.fullQsoData || prevQsoData), qsos: filteredQsos };
    state.derived = periodDerived;
    const out = fn();
    state.qsoData = prevQsoData;
    state.derived = prevDerived;
    return out;
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
    if (!state.globalBandFilter || !shouldBandFilterReport(reportId)) {
      return withPeriodContext(reportId, fn);
    }
    const band = state.globalBandFilter;
    const cache = state.bandDerivedCache || new Map();
    if (!state.bandDerivedCache) state.bandDerivedCache = cache;
    let derived = cache.get(band);
    let qsos;
    if (!derived) {
      qsos = getBandFilteredQsos(band);
      derived = buildDerived(qsos, {
        logFile: state.logFile,
        sourcePath: state.logFile?.path || '',
        analysisMode: state.analysisMode
      });
      cache.set(band, derived);
    } else {
      qsos = getBandFilteredQsos(band);
    }
    const prevQso = state.qsoData;
    const prevDerived = state.derived;
    state.qsoData = { ...(state.fullQsoData || prevQso), qsos };
    state.derived = derived;
    const out = withPeriodContext(reportId, () => fn());
    state.qsoData = prevQso;
    state.derived = prevDerived;
    return out;
  }

  async function fetchResource(url, onStatus) {
    try {
      onStatus('loading');
      const res = await fetch(url, { cache: 'no-store' });
      if (res.status === 429) {
        const retryAfterHeader = String(res.headers.get('retry-after') || '').trim();
        const retryAfterSeconds = retryAfterHeader && /^\d+$/.test(retryAfterHeader) ? Number(retryAfterHeader) : null;
        const retryAfterMs = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : 15000;
        onStatus('qrx');
        return { error: 'HTTP 429', status: 429, retryAfterMs, retryable: true };
      }
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
    let lastRetryAfterMs = 0;
    for (const url of urls) {
      // Retry a single source a few times when the server asks us to slow down.
      for (let attempt = 1; attempt <= 4; attempt += 1) {
        // eslint-disable-next-line no-await-in-loop
        const res = await fetchResource(url, (status) => onStatus(status, url));
        if (res && typeof res === 'object' && res.error) {
          lastError = res.error;
          lastRetryAfterMs = Number(res.retryAfterMs) || lastRetryAfterMs || 0;
          if (res.retryable && attempt < 4) {
            const base = Number(res.retryAfterMs) || 15000;
            const jitter = Math.floor(Math.random() * 180);
            const waitMs = Math.max(1000, base + jitter);
            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            continue;
          }
          break;
        }
        return { text: res, url };
      }
    }
    return { error: lastError || (lastRetryAfterMs ? `HTTP 429 (QRX ${Math.round(lastRetryAfterMs / 1000)}s)` : 'All sources failed') };
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
    return ARCHIVE_SHARD_BASES
      .map((base) => `${String(base || '').replace(/\/+$/, '')}/${suffix}`)
      .filter((url, index, urls) => url && urls.indexOf(url) === index);
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

  function getAgentBriefingActionById(actionId) {
    const key = String(actionId || '').trim();
    if (!key) return null;
    const findings = Array.isArray(state.agentBriefing?.result?.findings) ? state.agentBriefing.result.findings : [];
    const match = key.match(/^f(\d+)-a(\d+)$/);
    if (!match) return null;
    const findingIndex = Number(match[1]);
    const actionIndex = Number(match[2]);
    if (!Number.isFinite(findingIndex) || !Number.isFinite(actionIndex)) return null;
    const finding = findings[findingIndex];
    const actions = Array.isArray(finding?.actions) ? finding.actions : [];
    return actions[actionIndex] || null;
  }

  function handleAgentBriefingAction(action) {
    if (!action || typeof action !== 'object') return false;
    const type = String(action.type || '').trim().toLowerCase();
    if (type === 'report') {
      const target = String(action.reportId || '').trim();
      if (!target) return false;
      setActiveReportById(target);
      return true;
    }
    if (type === 'perspective_apply') {
      const perspective = action.perspective || null;
      if (!applyGeneratedComparePerspective(perspective)) return false;
      showOverlayNotice(`Applied perspective: ${(perspective && perspective.label) ? perspective.label : (action.label || 'Generated perspective')}`, 2200);
      return true;
    }
    if (type === 'perspective_save') {
      const perspective = action.perspective || null;
      const saved = saveComparePerspectiveEntry(perspective);
      if (!saved) return false;
      showOverlayNotice(`Saved perspective: ${saved.label}`, 2200);
      if (reports[state.activeIndex]?.id === 'agent_briefing') {
        state.agentBriefing = createAgentBriefingState();
        setActiveReportById('agent_briefing', { silent: true });
      }
      return true;
    }
    if (type === 'perspective_bundle_save') {
      const saved = saveComparePerspectiveBundle(action.perspectives);
      if (!saved.length) return false;
      showOverlayNotice(`Saved ${formatNumberSh6(saved.length)} perspectives from ${action.label || 'agent briefing'}.`, 2400);
      if (reports[state.activeIndex]?.id === 'agent_briefing') {
        state.agentBriefing = createAgentBriefingState();
        setActiveReportById('agent_briefing', { silent: true });
      }
      return true;
    }
    return false;
  }

  async function fetchArchiveLogText(path) {
    const client = await loadArchiveClientModule();
    return client.fetchArchiveLogText(path);
  }

  function loadCqApiHistoryArchiveToSlot(request) {
    return getCoachRuntime().loadCqApiHistoryArchiveToSlot(request);
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
      if (status === 429) {
        return { ok: false, warning: warnings.join(' | '), error: res.error || 'HTTP 429', status: 429, retryAfterMs: CALLSIGN_LOOKUP_RETRY_DELAY_MS };
      }
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
          const statusOut = Number.isFinite(leftResult.status) ? leftResult.status : (Number.isFinite(rightResult.status) ? rightResult.status : status);
          const retryAfterOut = Number.isFinite(leftResult.retryAfterMs) ? leftResult.retryAfterMs : (Number.isFinite(rightResult.retryAfterMs) ? rightResult.retryAfterMs : 0);
          return {
            ok: false,
            warning: [leftResult.warning, rightResult.warning].filter(Boolean).join(' | '),
            error: res.error || `HTTP ${status}`,
            status: statusOut,
            retryAfterMs: retryAfterOut
          };
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
        return { ok: false, warning: warnings.join(' | '), error: res.error || `HTTP ${status || 0}`, status };
      }
      return { ok: false, warning: warnings.join(' | '), error: res.error || `HTTP ${status || 0}`, status };
    }
    return { ok: true, warning: warnings.join(' | '), status: 200 };
  }

  async function fetchCallsignGridBatch(calls) {
    if (!calls || !calls.length) return { ok: true, warning: '' };
    try {
      let lastError = '';
      let warnings = [];
      for (const url of CALLSIGN_LOOKUP_URLS) {
        // eslint-disable-next-line no-await-in-loop
        const result = await fetchCallsignGridBatchViaUrl(url, calls);
        if (Number(result?.status) === 429) {
          state.qthSource = url;
          return { ok: false, warning: warnings.join(' | '), error: result.error || 'HTTP 429', status: 429, retryAfterMs: result.retryAfterMs || CALLSIGN_LOOKUP_RETRY_DELAY_MS };
        }
        if (result.ok) {
          state.qthSource = url;
          if (result.warning) warnings.push(result.warning);
          return { ok: true, warning: warnings.join(' | '), status: 200 };
        }
        if (result.warning) warnings.push(result.warning);
        lastError = result.error || 'Lookup failed';
      }
      return { ok: false, warning: warnings.join(' | '), error: lastError || 'Lookup failed', status: 0 };
    } catch (err) {
      return { ok: false, warning: '', error: err && err.message ? err.message : 'Lookup failed', status: 0 };
    }
  }

  async function flushCallsignGridLookup() {
    if (callsignGridInFlight) return;
    const pending = Array.from(callsignGridPending);
    if (!pending.length) return;
    callsignGridPending.clear();
    callsignGridInFlight = true;
    let hadError = false;
    let hadRateLimit = false;
    let retryAfterMs = 0;
    const warnings = [];
    let lastError = '';
    try {
      for (let i = 0; i < pending.length; i += CALLSIGN_LOOKUP_BATCH) {
        const batch = pending.slice(i, i + CALLSIGN_LOOKUP_BATCH);
        // eslint-disable-next-line no-await-in-loop
        const result = await fetchCallsignGridBatch(batch);
        if (Number(result?.status) === 429) {
          hadRateLimit = true;
          retryAfterMs = Number(result.retryAfterMs) || CALLSIGN_LOOKUP_RETRY_DELAY_MS;
          batch.forEach((call) => callsignGridPending.add(call));
          for (let j = i + CALLSIGN_LOOKUP_BATCH; j < pending.length; j += 1) {
            callsignGridPending.add(pending[j]);
          }
          break;
        }
        if (!result.ok) {
          hadError = true;
          lastError = result.error || lastError || 'Lookup failed';
        }
        if (result.warning) warnings.push(result.warning);
      }
    } finally {
      callsignGridInFlight = false;
      if (hadRateLimit) {
        state.qthStatus = 'qrx';
        state.qthError = null;
        updateDataStatus();
        if (callsignGridTimer) {
          clearTimeout(callsignGridTimer);
          callsignGridTimer = null;
        }
        scheduleCallsignGridLookup(Math.max(1000, retryAfterMs || CALLSIGN_LOOKUP_RETRY_DELAY_MS));
      } else if (!hadError) {
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
      recomputeDerived('lookup').catch((err) => {
        console.warn('Lookup-driven rederive failed:', err);
      });
      if (callsignGridPending.size) {
        scheduleCallsignGridLookup();
      }
    }
  }

  function scheduleCallsignGridLookup(delayMs = 250) {
    if (callsignGridTimer) return;
    callsignGridTimer = setTimeout(() => {
      callsignGridTimer = null;
      flushCallsignGridLookup();
    }, Math.max(0, Number(delayMs) || 0));
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

  function buildCqApiRequest(slot) {
    return getCoachRuntime().buildCqApiRequest(slot);
  }

  function ensureCqApiClient() {
    return getCoachRuntime().ensureCqApiClient();
  }

  async function triggerCqApiEnrichmentForSlot(slot, slotId = 'A') {
    return getCoachRuntime().triggerCqApiEnrichmentForSlot(slot, slotId);
  }

  function normalizeCoachCategory(value) {
    return getCoachRuntime().normalizeCoachCategory(value);
  }

  function normalizeCoachScopeType(value) {
    return getCoachRuntime().normalizeCoachScopeType(value);
  }

  function formatCoachScopeTitle(scopeType) {
    return getCoachRuntime().formatCoachScopeTitle(scopeType);
  }

  function buildCompetitorCoachContext(client) {
    return getCoachRuntime().buildCompetitorCoachContext(client);
  }

  function buildCoachRowKey(options) {
    return getCoachRuntime().buildCoachRowKey(options);
  }

  function triggerCompetitorCoachRefresh(force = false) {
    return getCoachRuntime().triggerCompetitorCoachRefresh(force);
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
      if (status === 'qrx') state.ctySource = url;
      updateDataStatus();
    }).then(async (res) => {
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
          await recomputeDerived('cty');
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
      if (status === 'qrx') state.masterSource = url;
      updateDataStatus();
    }).then(async (res) => {
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
          await recomputeDerived('master');
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
      if (status === 'error' || status === 'loading' || status === 'qrx') state.scoringSource = url;
    }).then(async (res) => {
      if (res.error) {
        state.scoringError = res.error;
        state.scoringStatus = 'error';
        await recomputeDerived('scoring');
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
      await recomputeDerived('scoring');
    });
  }

  function parseCtyDat(text) {
    return getAnalysisCore().parseCtyDat(text);
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
    return getAnalysisCore().parseMasterDta(text);
  }

  const PORTABLE_CALL_SUFFIXES = new Set(['P', 'M', 'MM', 'AM', 'QRP']);
  const SLASH_AREA_TOKEN_RE = /^[A-Z]{1,2}\d{1,2}$/;
  const KG4_US_CALL_RE = /^KG4[A-Z]{1,3}$/;
  const KG4_GITMO_RE = /^KG4[A-Z]{2}$/;

  function baseCall(call) {
    if (!call) return '';
    const parts = call.split('/');
    if (parts.length === 1) return call;
    const suffix = parts[parts.length - 1];
    if (PORTABLE_CALL_SUFFIXES.has(suffix)) return parts[0];
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

  function findPrefixEntry(key) {
    if (!state.ctyTable || !key) return null;
    for (const entry of state.ctyTable) {
      if (entry.exact) {
        if (key === entry.prefix) return entry;
      } else if (key.startsWith(entry.prefix)) {
        return entry;
      }
    }
    return null;
  }

  function getUnitedStatesEntry() {
    if (!state.ctyTable) return null;
    return state.ctyTable.find((entry) => !entry.exact && entry.country === 'United States' && entry.prefix === 'K') || null;
  }

  function isLikelyUsKg4Call(key) {
    if (!key) return false;
    const base = key.split('/')[0] || key;
    if (!KG4_US_CALL_RE.test(base)) return false;
    return !KG4_GITMO_RE.test(base);
  }

  function lookupPrefix(call) {
    if (!state.ctyTable || !call) return null;
    const key = normalizeCall(call);
    if (!key) return null;
    if (state.prefixCache.has(key)) return state.prefixCache.get(key);

    let found = findPrefixEntry(key);
    if (key.includes('/')) {
      const fullExact = Boolean(found && found.exact && found.prefix === key);
      if (!fullExact) {
        const parts = key.split('/').filter(Boolean);
        const suffix = parts[parts.length - 1] || '';
        if (SLASH_AREA_TOKEN_RE.test(suffix) && !PORTABLE_CALL_SUFFIXES.has(suffix)) {
          const suffixHit = findPrefixEntry(suffix);
          if (suffixHit) {
            found = suffixHit;
          }
        }
        const base = baseCall(key);
        const baseHit = base && base !== key ? findPrefixEntry(base) : null;
        if (baseHit && baseHit.exact) {
          found = baseHit;
        }
      }
    }

    if (found && found.country === 'Guantanamo Bay' && found.prefix === 'KG4' && isLikelyUsKg4Call(key)) {
      const usEntry = getUnitedStatesEntry();
      if (usEntry) found = usEntry;
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

  function markDupes(qsos, analysisMode = ANALYSIS_MODE_CONTESTER) {
    const seen = new Map();
    const windowMs = DUPE_WINDOW_MS;
    const dupes = [];
    const isDxer = analysisMode === ANALYSIS_MODE_DXER;
    for (const q of qsos) {
      if (!q.call) {
        q.isDupe = false;
        continue;
      }
      const call = q.call;
      const band = q.band || '';
      const key = `${call}|${band}`;
      if (isDxer) {
        const lastTs = seen.get(key);
        if (Number.isFinite(q.ts) && Number.isFinite(lastTs) && (q.ts - lastTs) <= windowMs && (q.ts - lastTs) >= 0) {
          q.isDupe = true;
          dupes.push(q);
        } else {
          q.isDupe = false;
        }
        if (Number.isFinite(q.ts)) seen.set(key, q.ts);
        continue;
      }
      const mode = q.mode || '';
      const strictKey = `${key}|${mode}`;
      if (seen.has(strictKey)) {
        q.isDupe = true;
        dupes.push(q);
      } else {
        q.isDupe = false;
        seen.set(strictKey, true);
      }
    }
    return dupes;
  }

  function buildDerived(qsos, context = {}) {
    return getAnalysisCore().buildDerived(qsos, context, buildAnalysisResourcesPayload());
  }

  function runDupeModeRegressionChecks() {
    const checks = [];
    const baseTs = 1_700_000_000_000;
    const mkQso = (call, band, mode, offsetMinutes) => ({
      call,
      band,
      mode,
      ts: baseTs + (offsetMinutes * 60 * 1000)
    });

    const contestModeQsos = [
      mkQso('W1ABC', '20M', 'SSB', 0),
      mkQso('W1ABC', '20M', 'SSB', 1),
      mkQso('W1ABC', '20M', 'CW', 2),
      mkQso('W1ABC', '40M', 'SSB', 3),
      mkQso('W1ABC', '20M', 'SSB', 4)
    ];

    const contestModeDerived = buildDerived(contestModeQsos, {
      analysisMode: ANALYSIS_MODE_CONTESTER
    });
    const contestModeMap = contestModeQsos.map((q) => Boolean(q.isDupe));
    checks.push({
      name: 'Contester mode: same call + band + mode duplicates only',
      passed: contestModeMap[0] === false && contestModeMap[1] === true && contestModeMap[2] === false && contestModeMap[3] === false && contestModeMap[4] === true,
      details: {
        dupes: contestModeQsos
          .map((q, index) => ({ index: index + 1, isDupe: contestModeMap[index], mode: q.mode, band: q.band }))
      }
    });

    const dxerQsos = [
      mkQso('K4ABC', '20M', 'SSB', 0),
      mkQso('K4ABC', '20M', 'SSB', 10),
      mkQso('K4ABC', '20M', 'SSB', 30),
      mkQso('K4ABC', '20M', 'CW', 41),
      mkQso('K4ABC', '40M', 'SSB', 42)
    ];
    const dxerModeDerived = buildDerived(dxerQsos, {
      analysisMode: ANALYSIS_MODE_DXER
    });
    const dxerModeMap = dxerQsos.map((q) => Boolean(q.isDupe));
    checks.push({
      name: 'DXer mode: same call + band duplicates within rolling 15 minutes',
      passed: dxerModeMap[0] === false && dxerModeMap[1] === true && dxerModeMap[2] === false && dxerModeMap[3] === true && dxerModeMap[4] === false,
      details: {
        dupes: dxerQsos.map((q, index) => ({ index: index + 1, isDupe: dxerModeMap[index], mode: q.mode, band: q.band }))
      }
    });

    return {
      passed: checks.every((check) => check.passed),
      checks,
      summary: {
        contestModeDupes: contestModeDerived?.dupes?.length || 0,
        dxerModeDupes: dxerModeDerived?.dupes?.length || 0
      }
    };
  }

  function runScoringRegressionChecks() {
    const checks = [];
    const makeStation = (overrides = {}) => ({
      stationCall: 'S51AA',
      stationPrefixToken: 'S5',
      stationCountry: 'Slovenia',
      stationCountryKey: normalizeCountryName('Slovenia'),
      stationContinent: 'EU',
      stationCqZone: 15,
      stationItuZone: 28,
      stationIsEu: true,
      stationIsNa: false,
      stationIsRu: false,
      stationIsFrench: false,
      stationIsDl: false,
      stationIsWVe: false,
      stationSentEuRegion: '',
      stationHasSentExchangeTokens: false,
      stationIsEuExchangeMember: false,
      stationPortable: false,
      ...overrides
    });

    const duplicateRule = {
      id: 'generic_fixed',
      qso_points: {
        model: 'fixed',
        rules: [{ points: 5 }]
      },
      multipliers: {
        model: 'none_multiplicative',
        groups: []
      }
    };
    const duplicateQsos = [
      { call: 'S52AA', band: '20M', mode: 'CW', country: 'Slovenia', continent: 'EU', cqZone: 15, ituZone: 28 },
      { call: 'S52AA', band: '20M', mode: 'CW', country: 'Slovenia', continent: 'EU', cqZone: 15, ituZone: 28, isDupe: true }
    ];
    const duplicatePointState = computeRuleQsoPoints(duplicateRule, duplicateQsos, makeStation(), new Set());
    checks.push({
      name: 'Generic scoring excludes duplicate QSO points by default',
      passed: duplicatePointState.qsoPointsTotal === 5
        && duplicatePointState.pointsByIndex[0] === 5
        && duplicatePointState.pointsByIndex[1] === 0,
      details: {
        total: duplicatePointState.qsoPointsTotal,
        pointsByIndex: duplicatePointState.pointsByIndex
      }
    });

    const cqwwLikeRule = {
      id: 'cqww',
      qso_points: {
        model: 'table_by_geography',
        rules: [
          { when: 'different_continent', points: 3 },
          { when: 'same_continent_different_country', points: 1 },
          { when: 'same_country', points: 0 }
        ]
      },
      multipliers: {
        model: 'sum_of_groups',
        counting_scope: 'per_band',
        credit_on_zero_point_valid_qso: true,
        groups: ['country']
      }
    };
    const zeroPointQsos = [
      { call: 'S52BB', band: '20M', mode: 'CW', country: 'Slovenia', continent: 'EU', cqZone: 15, ituZone: 28 },
      { call: 'S53CC', band: '40M', mode: 'CW', country: 'Slovenia', continent: 'EU', cqZone: 15, ituZone: 28 }
    ];
    const zeroPointState = computeRuleQsoPoints(cqwwLikeRule, zeroPointQsos, makeStation(), new Set());
    const zeroPointMults = computeRuleMultipliers(cqwwLikeRule, zeroPointQsos, makeStation(), zeroPointState, new Set());
    checks.push({
      name: 'Zero-point valid QSOs can still credit multipliers when rules allow it',
      passed: zeroPointState.qsoPointsTotal === 0 && zeroPointMults.total === 2,
      details: {
        qsoPointsTotal: zeroPointState.qsoPointsTotal,
        multiplierTotal: zeroPointMults.total,
        groupCounts: zeroPointMults.groupCounts
      }
    });

    return {
      passed: checks.every((check) => check.passed),
      checks
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
    if (state.analysisMode === ANALYSIS_MODE_DXER) return '';
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
    const scoringDetection = scoring.detectionMethod
      ? `${escapeHtml(scoring.detectionMethod)}${scoring.detectionValue ? ` · ${escapeHtml(scoring.detectionValue)}` : ''}`
      : 'N/A';
    const scoringSpecVersion = escapeHtml(scoring.ruleSpecVersion || 'N/A');
    const scoringSpecSource = escapeHtml(scoring.ruleSpecSource || 'N/A');
    const duplicatePolicyLabel = escapeHtml(describeScoringDuplicatePolicy(scoring.duplicatePolicy));
    const multiplierCreditLabel = escapeHtml(describeMultiplierCreditPolicy(scoring.multiplierCreditPolicy));
    const scoringRuleReference = scoring.ruleReferenceUrl
      ? `<a href="${escapeAttr(scoring.ruleReferenceUrl)}" target="_blank" rel="noopener noreferrer">Official rules</a>`
      : 'N/A';
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

    const reconNote = (state.analysisMode === ANALYSIS_MODE_DXER || !state.logFile?.reconstructed)
      ? ''
      : `<div class="recon-note">${escapeHtml(RECONSTRUCTED_NOTICE)}</div>`;
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
      ['Scoring detection', scoringDetection],
      ['Scoring spec version', scoringSpecVersion],
      ['Scoring spec source', scoringSpecSource],
      ['Scoring duplicate policy', duplicatePolicyLabel],
      ['Scoring multiplier credit', multiplierCreditLabel],
      ['Rule reference', scoringRuleReference],
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
        `${state.analysisMode === ANALYSIS_MODE_DXER ? 'Event' : 'Contest'} ${state.derived.contestMeta?.contestId || 'N/A'}`,
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

  function renderCompetitorCoachContent() {
    return getInvestigationWorkspaceRenderer().renderCompetitorCoachContent();
  }

  function renderCompetitorCoach() {
    return renderRetainedReportShell('competitor_coach', renderCompetitorCoachContent());
  }

  function renderAgentBriefingContent() {
    return getInvestigationWorkspaceRenderer().renderAgentBriefingContent();
  }

  function renderAgentBriefing() {
    return renderRetainedReportShell('agent_briefing', renderAgentBriefingContent());
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
    if (globalThis.SH6CompareCore && typeof globalThis.SH6CompareCore.applyLogFilters === 'function') {
      return globalThis.SH6CompareCore.applyLogFilters(qsos, filters);
    }
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
      await applyLoadedLogToSlot(slotId, result.text, name, result.text.length, 'Demo', statusEl, DEMO_ARCHIVE_PATH);
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
      columns = columns.filter((c) => !['exchSent', 'exchRcvd', 'country', 'op', 'cq', 'itu', 'grid', 'flags'].includes(c));
    } else if (total === 2) {
      columns = columns.filter((c) => !['rstS', 'rstR', 'exchSent', 'exchRcvd', 'country', 'grid', 'flags'].includes(c));
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
      <div class="utility-primary-row utility-primary-row-stacked">
        <button type="button" class="button utility-primary-btn session-permalink">Copy permalink</button>
        <button type="button" class="button utility-primary-btn session-save">Save session</button>
        <button type="button" class="button utility-primary-btn session-load">Load session</button>
        <input type="file" id="sessionFileInput" class="session-file-input" accept="application/json" hidden>
      </div>
    `;
  }

  function renderSavedComparePerspectives() {
    const items = loadStoredComparePerspectives();
    const rows = items.length
      ? items.map((entry) => {
        const id = escapeAttr(String(entry?.id || ''));
        const label = escapeHtml(String(entry?.label || 'Saved perspective'));
        const reportId = escapeHtml(String(entry?.reportId || 'main'));
        const rangeLabel = escapeHtml(formatCompareTimeRangeLabel(entry?.compareTimeRangeLock));
        return `
          <tr>
            <td><strong>${label}</strong></td>
            <td>${reportId}</td>
            <td>${rangeLabel}</td>
            <td>
              <button type="button" class="button session-perspective-apply" data-perspective-id="${id}">Apply</button>
              <button type="button" class="button session-perspective-delete" data-perspective-id="${id}">Delete</button>
            </td>
          </tr>
        `;
      }).join('')
      : '<tr><td colspan="4">No saved perspectives yet. Save one from Compare workspace.</td></tr>';
    return `
      <div class="utility-block utility-block-wide">
        <h4>Saved compare perspectives</h4>
        <p>Perspectives store compare workspace state such as active report, score mode, focus pair, sticky/sync toggles, and locked time range.</p>
        <table class="mtc utility-table">
          <tr class="thc"><th>Label</th><th>Report</th><th>Time lock</th><th>Actions</th></tr>
          ${rows}
        </table>
      </div>
    `;
  }

  function renderSessionPageContent() {
    return `
      <div class="mtc export-panel utility-panel">
        <div class="gradient">&nbsp;Save&Load session</div>
        <p>Sessions capture the full state of your analysis, including compare slots, filters, and report settings.</p>
        <div class="utility-stack">
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
        ${renderSavedComparePerspectives()}
        ${renderSessionControls()}
      </div>
    `;
  }

  function renderSessionPage() {
    return renderRetainedReportShell('session', renderSessionPageContent());
  }

  const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function formatTimeOfDay(minutes) {
    const hh = Math.floor(minutes / 60);
    const mm = minutes % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}Z`;
  }

  function buildTenMinuteBuckets(qsos) {
    if (globalThis.SH6CompareCore && typeof globalThis.SH6CompareCore.buildTenMinuteBuckets === 'function') {
      return globalThis.SH6CompareCore.buildTenMinuteBuckets(qsos, {
        indexGetter: (q) => (Number.isFinite(q?.id) ? q.id : (Number.isFinite(q?.qsoNumber) ? q.qsoNumber - 1 : null))
      });
    }
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
    if (globalThis.SH6CompareCore && typeof globalThis.SH6CompareCore.buildCompareBucketOrder === 'function') {
      return globalThis.SH6CompareCore.buildCompareBucketOrder(bucketMaps, qsoLists);
    }
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
      const worker = new Worker('worker.js', { type: 'module' });
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

  function renderLogCompareContent() {
    const slotEntries = getActiveCompareSlots();
    const anyLoaded = slotEntries.some((entry) => entry.slot?.qsoData);
    if (!anyLoaded) {
      setRetainedReportModel('log', null);
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
    setRetainedReportModel('log', null);
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

  function renderLogContent() {
    if (state.compareEnabled) {
      return renderLogCompareContent();
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
    const rowList = filtered.slice(start, end).map((q, idx) => {
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
    });
    setRetainedReportModel('log', {
      rows: rowList,
      rowHeight: 28,
      overscan: 10,
      colspan: 17,
      emptyHtml: '<tr class="td1"><td colspan="17">No QSOs match current filter.</td></tr>'
    });
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
      <div class="virtual-table-shell" data-virtual-table="log">
        <table class="mtc log-table" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>#</th><th>Time</th><th>Band</th><th>Mode</th><th>Freq</th><th>Call</th><th>RST S</th><th>RST R</th><th>Exch Sent</th><th>Exch Rcvd</th><th>Op</th><th>Country</th><th>Cont.</th><th>CQ</th><th>ITU</th><th>Grid</th><th>Flags</th></tr>
          <tbody data-virtual-body="log"></tbody>
        </table>
      </div>
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
    return getExportRuntime().renderLogExport();
  }

  function renderLogCompare() {
    return renderRetainedReportShell('log', renderLogCompareContent());
  }

  function renderLog() {
    return renderRetainedReportShell('log', renderLogContent());
  }

  function buildExportFilename(ext) {
    return getExportRuntime().buildExportFilename(ext);
  }

  function buildExportFilenameForSlot(ext, slotId = 'A') {
    return getExportRuntime().buildExportFilenameForSlot(ext, slotId);
  }

  function exportCbrForSlot(slotId = 'A') {
    return getExportRuntime().exportCbrForSlot(slotId);
  }

  function renderReportExport(report) {
    return getExportRuntime().renderReportExport(report);
  }

  function openExportDialog(type) {
    return getExportRuntime().openExportDialog(type);
  }

  function renderDupesContent() {
    if (!state.derived) return renderPlaceholder({ id: 'dupes', title: 'Dupes' });
    const rowList = state.derived.dupes.map((q, idx) => {
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
    });
    const count = state.derived.dupes.length;
    if (!count) return '<p>No duplicate QSOs detected.</p>';
    return `
      <p>Duplicate QSOs: ${formatNumberSh6(count)}</p>
      ${renderRetainedVirtualTable('dupes', {
        rows: rowList,
        rowHeight: 28,
        overscan: 10,
        columnCount: 4,
        emptyHtml: '<tr class="td1"><td colspan="4">No duplicate QSOs detected.</td></tr>',
        headerHtml: '<tr class="thc"><th>Time</th><th>Band</th><th>Mode</th><th>Call</th></tr>'
      })}
    `;
  }

  function renderDupesCompareContent() {
    return renderRetainedComparePanels('dupes', () => renderDupesContent());
  }

  function renderDupesReportContent() {
    return state.compareEnabled ? renderDupesCompareContent() : renderDupesContent();
  }

  function renderDupes() {
    return renderRetainedReportShell('dupes', renderDupesReportContent());
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

  function buildSpotDayList(minTs, maxTs) {
    return getSpotsDataRuntime().buildSpotDayList(minTs, maxTs);
  }

  function formatSpotDayLabel(day) {
    return getSpotsDataRuntime().formatSpotDayLabel(day);
  }

  function buildRbnDayList(minTs, maxTs) {
    return getSpotsDataRuntime().buildRbnDayList(minTs, maxTs);
  }

  function formatRbnDayLabel(day) {
    return getSpotsDataRuntime().formatRbnDayLabel(day);
  }

  function ensureSpotsState(slot) {
    return getSpotsDataRuntime().ensureSpotsState(slot);
  }

  function getSpotsState() {
    return getSpotsDataRuntime().getSpotsState();
  }

  function ensureRbnState(slot) {
    return getSpotsDataRuntime().ensureRbnState(slot);
  }

  function getRbnState() {
    return getSpotsDataRuntime().getRbnState();
  }

  function getSpotStateBySource(slot, source) {
    return getSpotsDataRuntime().getSpotStateBySource(slot, source);
  }

  function selectRbnDaysForSlot(slot, minTs, maxTs) {
    return getSpotsDataRuntime().selectRbnDaysForSlot(slot, minTs, maxTs);
  }

  function loadSpotsForSource(slot, source) {
    return getSpotsDataRuntime().loadSpotsForSource(slot, source);
  }

  function buildSpotWindowKey(minTs, maxTs) {
    return getSpotsDataRuntime().buildSpotWindowKey(minTs, maxTs);
  }

  function resolveSpotDisplayRange(slot = state) {
    return getSpotsDataRuntime().resolveSpotDisplayRange(slot);
  }

  function isSpotWithinDisplayRange(ts, range) {
    return getSpotsDataRuntime().isSpotWithinDisplayRange(ts, range);
  }

  function getSpotHeatmapHours(minTs, maxTs) {
    return getSpotsDataRuntime().getSpotHeatmapHours(minTs, maxTs);
  }

  function parseSpotLine(line) {
    return getSpotsDataRuntime().parseSpotLine(line);
  }

  function buildQsoTimeIndex(qsos) {
    return getSpotsDataRuntime().buildQsoTimeIndex(qsos);
  }

  function buildQsoCallIndex(qsos) {
    return getSpotsDataRuntime().buildQsoCallIndex(qsos);
  }

  function materializeQsoTimeIndex(entries) {
    return getSpotsDataRuntime().materializeQsoTimeIndex(entries);
  }

  function materializeQsoCallIndex(entries) {
    return getSpotsDataRuntime().materializeQsoCallIndex(entries);
  }

  async function buildSpotIndexesAsync(qsos) {
    return getSpotsDataRuntime().buildSpotIndexesAsync(qsos);
  }

  function hasQsoWithin(band, ts, index, windowMs) {
    return getSpotsDataRuntime().hasQsoWithin(band, ts, index, windowMs);
  }

  function hasQsoCallWithin(band, call, ts, index, windowMs) {
    return getSpotsDataRuntime().hasQsoCallWithin(band, call, ts, index, windowMs);
  }

  function getNearestQsoDeltaMinutes(band, ts, index) {
    return getSpotsDataRuntime().getNearestQsoDeltaMinutes(band, ts, index);
  }

  function getNearestQsoCallDeltaMinutes(band, call, ts, index) {
    return getSpotsDataRuntime().getNearestQsoCallDeltaMinutes(band, call, ts, index);
  }

  async function fetchSpotFile(url) {
    return getSpotsDataRuntime().fetchSpotFile(url);
  }

  function formatRbnComment(spot) {
    return getSpotsDataRuntime().formatRbnComment(spot);
  }

  function normalizeRbnSpot(raw) {
    return getSpotsDataRuntime().normalizeRbnSpot(raw);
  }

  async function fetchRbnSpots(call, days) {
    return getSpotsDataRuntime().fetchRbnSpots(call, days);
  }

  async function loadSpotsForCurrentLog(slot = state) {
    return getSpotsDataRuntime().loadSpotsForCurrentLog(slot);
  }

  async function loadRbnForCurrentLog(slot = state) {
    return getSpotsDataRuntime().loadRbnForCurrentLog(slot);
  }

  function computeSpotsStats(slot = state, spotsStateOverride = null) {
    return getSpotsDataRuntime().computeSpotsStats(slot, spotsStateOverride);
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
    const topNoticeHtml = options.topNoticeHtml || '';
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
    const displayRange = resolveSpotDisplayRange(state);
    const minTs = Number.isFinite(displayRange.minTs) ? displayRange.minTs : state.derived.timeRange?.minTs;
    const maxTs = Number.isFinite(displayRange.maxTs) ? displayRange.maxTs : state.derived.timeRange?.maxTs;
    const heatmapHours = getSpotHeatmapHours(minTs, maxTs);
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
      : (spotsState.status === 'qrx'
          ? 'QRX (rate limited). Retrying...'
          : (spotsState.status === 'error'
              ? `Error: ${escapeHtml(spotsState.error || '')}`
              : (spotsState.status === 'ready' ? readyLabel : 'Not loaded')));
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
    const buildAnalysisContext = () => getSpotsDiagnosticsRuntime().buildAnalysisContext({
      qsos: state.qsoData?.qsos || [],
      bandFilter: spotsState.bandFilter || []
    });
    const renderUnworkedRateTable = (spots) => getSpotsDiagnosticsRuntime().renderUnworkedRateTable(spots);
    const renderTimeToFirstQsoTable = (spots, analysis) => getSpotsDiagnosticsRuntime().renderTimeToFirstQsoTable(spots, analysis);
    const renderSpotUpliftTable = (spots, analysis) => getSpotsDiagnosticsRuntime().renderSpotUpliftTable(spots, analysis);
    const renderSpottingFunnelTable = (spots, analysis) => getSpotsDiagnosticsRuntime().renderSpottingFunnelTable(spots, analysis);
    const renderBandChangeEfficiencyTable = (analysis) => getSpotsDiagnosticsRuntime().renderBandChangeEfficiencyTable(analysis);
    const computeSpotterReliabilityEntries = (spots, minSpots = 3) => getSpotsCoachSummaryRuntime().computeSpotterReliabilityEntries(spots, minSpots);

    const buildMissedMultEntries = (spots, analysis) => getSpotsCoachSummaryRuntime().buildMissedMultEntries(spots, analysis);

    const renderSpotterReliabilityTable = (spots) => getSpotsDiagnosticsRuntime().renderSpotterReliabilityTable(spots);
    const hasConcurrentBands = (qsos) => getSpotsDiagnosticsRuntime().hasConcurrentBands(qsos);
    const renderMissedMultTable = (spots, analysis) => getSpotsDiagnosticsRuntime().renderMissedMultTable(spots, analysis);
    const renderOpenCloseTable = (spots) => getSpotsDiagnosticsRuntime().renderOpenCloseTable(spots);
    const renderPileupWindowTable = (spots, analysis) => getSpotsDiagnosticsRuntime().renderPileupWindowTable(spots, analysis);
    const renderFrequencyAgilityTable = (spots, analysis) => getSpotsDiagnosticsRuntime().renderFrequencyAgilityTable(spots, analysis);
    const buildTenMinuteSeries = (derived, bandSet) => getSpotsChartsRuntime().buildTenMinuteSeries({
      derived,
      qsos: state.qsoData?.qsos || [],
      bandFilter: Array.from(bandSet || [])
    });
    const renderSpotRateTimeline = (derived, spots) => getSpotsChartsRuntime().renderSpotRateTimeline({
      derived,
      qsos: state.qsoData?.qsos || [],
      bandFilter: spotsState.bandFilter || [],
      spots
    });
    const renderHeatmap = (heatmapData) => getSpotsChartsRuntime().renderHeatmap({
      heatmapData,
      heatmapHours,
      drillBand,
      drillHour,
      slotAttr,
      sourceAttr
    });

    const renderSpotsCoachCards = (statsData, analysis) => getSpotsCoachSummaryRuntime().renderSpotsCoachCards({
      statsData,
      analysis,
      sourceAttr,
      slotAttr,
      sectionIds
    });

    const renderSpotBucketDetail = (spots) => getSpotsDrilldownRuntime().renderSpotBucketDetail({
      spots,
      drillBand,
      drillHour,
      drillContinent,
      drillCqZone,
      drillItuZone,
      slotAttr,
      sourceAttr
    });
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
        <div class="sh6-advanced-analysis">
          ${topNoticeHtml}
          ${spotsIntro}
          <div class="export-actions">
            <span><b>Callsign</b>: ${call} (exact match)</span>
          </div>
          <div class="export-actions">
            <span><b>Time window</b>: ${start} → ${end} (±${windowMinutes} minutes, same frequency band)</span>
          </div>
          ${extraNote ? `<div class="export-actions export-note">${escapeHtml(extraNote)}</div>` : ''}
          ${renderAnalysisStepHeading(1, 'Filters and data load', 'Tune match window/bands, then refresh spot files for this slot.')}
        </div>
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
          <span>${statusText}</span>
        </div>
        ${truncatedNote ? `<div class="export-actions export-note">${escapeHtml(truncatedNote)}</div>` : ''}
        ${summaryNote ? `<div class="export-actions export-note">${escapeHtml(summaryNote)}</div>` : ''}
        ${errorSummary ? `<div class="export-actions export-note"><b>${escapeHtml(errorLabel)}</b>: ${errorSummary}</div>` : ''}
        ${stats ? `
        <div class="sh6-advanced-analysis">
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
        </div>
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
      topNoticeHtml: renderRbnRecommendationCallout(),
      dayPickerHtml
    });
  }

  function resolveSpotterContinent(spotterCall) {
    return getRbnCompareModelRuntime().resolveSpotterContinent(spotterCall);
  }

  let rbnCompareSignalDrawRaf = 0;

  function rbnCompareSlotDataKey(slot) {
    return getRbnCompareModelRuntime().rbnCompareSlotDataKey(slot);
  }

  function sampleFlatStrideSeeded(data, capPoints, seed) {
    return getRbnCompareModelRuntime().sampleFlatStrideSeeded(data, capPoints, seed);
  }

  function computeProportionalCaps(entries, total, capTotal, minEach = 200) {
    return getRbnCompareModelRuntime().computeProportionalCaps(entries, total, capTotal, minEach);
  }

  function getRbnCompareIndexCached(slotId, slot) {
    return getRbnCompareModelRuntime().getRbnCompareIndexCached(slotId, slot);
  }

  function scheduleRbnCompareIndexBuild(slotId, slot) {
    return getRbnCompareModelRuntime().scheduleRbnCompareIndexBuild(slotId, slot);
  }

  function getRbnCompareRankingCached(slotId, slot, bandKey) {
    return getRbnCompareModelRuntime().getRbnCompareRankingCached(slotId, slot, bandKey);
  }

  function buildRbnCompareRankingFromIndex(slotId, slot, bandKey, index) {
    return getRbnCompareModelRuntime().buildRbnCompareRankingFromIndex(slotId, slot, bandKey, index);
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
    return getRbnCompareChartRuntime().bandColorForChart(band);
  }

  function slotMarkerShape(slotId) {
    return getRbnCompareViewRuntime().slotMarkerShape(slotId);
  }

  function slotMarkerSymbol(slotId) {
    return getRbnCompareViewRuntime().slotMarkerSymbol(slotId);
  }

  function slotLineDash(slotId) {
    return getRbnCompareViewRuntime().slotLineDash(slotId);
  }

  function slotLineStyleLabel(slotId) {
    return getRbnCompareViewRuntime().slotLineStyleLabel(slotId);
  }

  function slotLineStyleSample(slotId) {
    return getRbnCompareViewRuntime().slotLineStyleSample(slotId);
  }

  function slotLegendMarkerSvg(slotId) {
    return getRbnCompareViewRuntime().slotLegendMarkerSvg(slotId);
  }

  function slotLegendLineSvg(slotId) {
    return getRbnCompareViewRuntime().slotLegendLineSvg(slotId);
  }

  function formatUtcTick(ts) {
    return getRbnCompareChartRuntime().formatUtcTick(ts);
  }

  function ensureCanvasZoomStore(chartType = 'rbn') {
    return getCanvasZoomRuntime().ensureCanvasZoomStore(chartType);
  }

  function getCanvasZoomKey(canvas, chartType = 'rbn', bandKey = '') {
    return getCanvasZoomRuntime().getCanvasZoomKey(canvas, chartType, bandKey);
  }

  function resolveCanvasZoomWindow(chartType, key, fallbackMinTs, fallbackMaxTs) {
    return getCanvasZoomRuntime().resolveCanvasZoomWindow(chartType, key, fallbackMinTs, fallbackMaxTs);
  }

  function clearCanvasZoom(chartType, key, onZoomChanged) {
    return getCanvasZoomRuntime().clearCanvasZoom(chartType, key, onZoomChanged);
  }

  function getCanvasPlotMetrics(canvas) {
    return getCanvasZoomRuntime().getCanvasPlotMetrics(canvas);
  }

  function updateCanvasZoomBox(canvas, startX, currentX) {
    return getCanvasZoomRuntime().updateCanvasZoomBox(canvas, startX, currentX);
  }

  function hideCanvasZoomBox(canvas) {
    return getCanvasZoomRuntime().hideCanvasZoomBox(canvas);
  }

  function applyCanvasZoomFromPixels(canvas, chartType, key, startX, endX, onZoomChanged) {
    return getCanvasZoomRuntime().applyCanvasZoomFromPixels(canvas, chartType, key, startX, endX, onZoomChanged);
  }

  function bindDragZoomOnCanvas(canvas, options = {}) {
    return getCanvasZoomRuntime().bindDragZoomOnCanvas(canvas, options);
  }

  function drawRbnSignalCanvas(canvas, model) {
    return getRbnCompareChartRuntime().drawRbnSignalCanvas(canvas, model);
  }

  function drawRbnCompareSignalCharts() {
    return getRbnCompareChartRuntime().drawRbnCompareSignalCharts();
  }

  function populateRbnCompareSignalSpotterSelects() {
    return getRbnCompareModelRuntime().populateRbnCompareSignalSpotterSelects();
  }

  function renderRbnCompareSignal() {
    return getRbnCompareViewRuntime().renderRbnCompareSignal();
  }

  function renderSpotsSharedControls(source) {
    return getSpotsCompareRuntime().renderSpotsSharedControls(source);
  }

  function renderSpotsCompare(source) {
    return getSpotsCompareRuntime().renderSpotsCompare(source);
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
    });
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
        ${joinTableRows(rows)}
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

  function renderCountriesContent() {
    if (!state.derived) return renderPlaceholder({ id: 'countries', title: 'Countries' });
    const totalQsos = state.qsoData?.qsos.length || 0;
    const list = buildCountryListFromDerived(state.derived);
    const rows = renderCountryRowsFromList(list, state.derived, totalQsos);
    const bandCols = getDisplayBandList();
    const qsoCols = 3 + bandCols.length + 3;
    const bandHeaders = bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    return renderRetainedVirtualTable('countries', {
      rows,
      rowHeight: 28,
      overscan: 12,
      columnCount: bandCols.length + 13,
      emptyHtml: `<tr class="td1"><td colspan="${bandCols.length + 13}">No country data available.</td></tr>`,
      colgroupHtml: `<colgroup><col width="40px" span="3" align="center"/><col align="left"/><col span="${bandCols.length + 9}" width="40px" align="center"/></colgroup>`,
      headerHtml: `
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
      `,
      footerHtml: mapAllFooter(bandCols.length + 13)
    });
  }

  function renderCountriesCompareContent() {
    return renderCountriesCompareAligned();
  }

  function renderCountriesReportContent() {
    return state.compareEnabled ? renderCountriesCompareContent() : renderCountriesContent();
  }

  function renderCountries() {
    return renderRetainedReportShell('countries', renderCountriesReportContent());
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
    });
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
        ${joinTableRows(rows)}
        ${mapAllFooter(bandCols.length + 9)}
      </table>
    `;
  }

  function renderContinentsContent() {
    if (!state.derived) return renderPlaceholder({ id: 'continents', title: 'Continents' });
    const totalQs = state.qsoData?.qsos?.length || 0;
    const list = buildContinentListFromDerived(state.derived);
    const rows = renderContinentsRowsFromList(list, state.derived, totalQs);
    const bandCols = getDisplayBandList();
    const qsoCols = bandCols.length + 5;
    const bandHeaders = bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    return renderRetainedVirtualTable('continents', {
      rows,
      rowHeight: 28,
      overscan: 10,
      columnCount: bandCols.length + 9,
      emptyHtml: `<tr class="td1"><td colspan="${bandCols.length + 9}">No continent data available.</td></tr>`,
      colgroupHtml: `<colgroup><col width="40px"/><col width="30px"/><col width="200px"/><col span="${qsoCols}" width="120px"/><col width="56px"/></colgroup>`,
      headerHtml: `
        <tr class="thc"><th rowspan="2">#</th><th colspan="2" rowspan="2">Continent</th><th colspan="${qsoCols}">QSOs</th><th rowspan="2">Map</th></tr>
        <tr class="thc">${bandHeaders}<th>All</th><th>%</th><th>CW</th><th>Digital</th><th>Phone</th></tr>
      `,
      footerHtml: mapAllFooter(bandCols.length + 9)
    });
  }

  function renderContinentsCompareContent() {
    return renderContinentsCompareAligned();
  }

  function renderContinentsReportContent() {
    return state.compareEnabled ? renderContinentsCompareContent() : renderContinentsContent();
  }

  function renderContinents() {
    return renderRetainedReportShell('continents', renderContinentsReportContent());
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

  function getMonthColumnsFromDerived(derived) {
    return Array.isArray(derived?.monthColumns) ? derived.monthColumns.slice() : [];
  }

  function getYearColumnsFromDerived(derived) {
    return Array.isArray(derived?.yearColumns) ? derived.yearColumns.slice() : [];
  }

  function buildMonthColumnsFromDerivedList(derivedList) {
    const out = new Set();
    if (!Array.isArray(derivedList)) return [];
    derivedList.forEach((derived) => {
      const cols = getMonthColumnsFromDerived(derived);
      cols.forEach((monthKey) => out.add(monthKey));
    });
    return Array.from(out).sort((a, b) => a.localeCompare(b));
  }

  function buildYearColumnsFromDerivedList(derivedList) {
    const out = new Set();
    if (!Array.isArray(derivedList)) return [];
    derivedList.forEach((derived) => {
      const cols = getYearColumnsFromDerived(derived);
      cols.forEach((yearKey) => out.add(yearKey));
    });
    return Array.from(out).sort((a, b) => Number(a) - Number(b));
  }

  function buildZoneMonthListFromDerived(derived, field) {
    const source = field === 'itu' ? derived?.ituZonesByMonth : derived?.cqZonesByMonth;
    if (!source) return [];
    return Array.from(source.keys()).sort((a, b) => {
      const ai = Number(a) || 0;
      const bi = Number(b) || 0;
      return ai - bi;
    }).map((zone) => ({ zone }));
  }

  function buildZoneMonthSummaryMap(derived, field) {
    const map = new Map();
    const source = field === 'itu' ? derived?.ituZonesByMonth : derived?.cqZonesByMonth;
    if (!source) return map;
    source.forEach((z, zone) => map.set(zone, z));
    return map;
  }

  function buildZoneYearListFromDerived(derived, field) {
    const source = field === 'itu' ? derived?.ituZonesByYear : derived?.cqZonesByYear;
    if (!source) return [];
    return Array.from(source.keys()).sort((a, b) => {
      const ai = Number(a) || 0;
      const bi = Number(b) || 0;
      return ai - bi;
    }).map((zone) => ({ zone }));
  }

  function buildZoneYearSummaryMap(derived, field) {
    const map = new Map();
    const source = field === 'itu' ? derived?.ituZonesByYear : derived?.cqZonesByYear;
    if (!source) return map;
    source.forEach((z, zone) => map.set(zone, z));
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
    });
  }

  function renderZonesTable(rows) {
    const bandCols = getDisplayBandList();
    const bandHeaders = bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Zone</th><th>DXCC</th>${bandHeaders}<th>All</th><th>Map</th></tr>
        ${joinTableRows(rows)}
        ${mapAllFooter(bandCols.length + 4)}
      </table>
    `;
  }

  function renderCqZonesContent() {
    if (!state.derived) return renderPlaceholder({ id: 'zones_cq', title: 'CQ zones' });
    const list = buildZoneListFromDerived(state.derived, 'cq');
    const rows = renderZoneRowsFromList(list, state.derived, 'cq');
    const bandCols = getDisplayBandList();
    const bandHeaders = bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    return renderRetainedVirtualTable('zones_cq', {
      rows,
      rowHeight: 28,
      overscan: 10,
      columnCount: bandCols.length + 4,
      emptyHtml: `<tr class="td1"><td colspan="${bandCols.length + 4}">No CQ zone data available.</td></tr>`,
      headerHtml: `<tr class="thc"><th>Zone</th><th>DXCC</th>${bandHeaders}<th>All</th><th>Map</th></tr>`,
      footerHtml: mapAllFooter(bandCols.length + 4)
    });
  }

  function renderCqZonesCompareContent() {
    return renderZoneCompareAligned('cq');
  }

  function renderCqZonesReportContent() {
    return state.compareEnabled ? renderCqZonesCompareContent() : renderCqZonesContent();
  }

  function renderCqZones() {
    return renderRetainedReportShell('zones_cq', renderCqZonesReportContent());
  }

  function renderItuZonesContent() {
    if (!state.derived) return renderPlaceholder({ id: 'zones_itu', title: 'ITU zones' });
    const list = buildZoneListFromDerived(state.derived, 'itu');
    const rows = renderZoneRowsFromList(list, state.derived, 'itu');
    const bandCols = getDisplayBandList();
    const bandHeaders = bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    return renderRetainedVirtualTable('zones_itu', {
      rows,
      rowHeight: 28,
      overscan: 10,
      columnCount: bandCols.length + 4,
      emptyHtml: `<tr class="td1"><td colspan="${bandCols.length + 4}">No ITU zone data available.</td></tr>`,
      headerHtml: `<tr class="thc"><th>Zone</th><th>DXCC</th>${bandHeaders}<th>All</th><th>Map</th></tr>`,
      footerHtml: mapAllFooter(bandCols.length + 4)
    });
  }

  function renderItuZonesCompareContent() {
    return renderZoneCompareAligned('itu');
  }

  function renderItuZonesReportContent() {
    return state.compareEnabled ? renderItuZonesCompareContent() : renderItuZonesContent();
  }

  function renderItuZones() {
    return renderRetainedReportShell('zones_itu', renderItuZonesReportContent());
  }

  function renderZoneMonthRowsFromList(list, derived, field, monthColumns) {
    const monthCols = monthColumns && monthColumns.length ? monthColumns : [];
    const summaryMap = buildZoneMonthSummaryMap(derived, field);
    const scope = field === 'itu' ? 'itu_zone' : 'cq_zone';
    const dataAttr = field === 'itu' ? 'data-itu' : 'data-cq';
    const linkClass = field === 'itu' ? 'log-itu' : 'log-cq';
    return list.map((info, idx) => {
      const zone = Number(info.zone);
      const z = summaryMap.get(zone);
      const zoneText = escapeHtml(String(info.zone || ''));
      const zoneAttr = escapeAttr(String(info.zone || ''));
      const mapLink = z ? `<a href="#" class="map-link" data-scope="${scope}" data-key="${zoneAttr}">map</a>` : '';
      const zoneLink = z ? `<a href="#" class="${linkClass}" ${dataAttr}="${zoneAttr}">${zoneText}</a>` : zoneText;
      const countries = z?.countries?.size ? formatNumberSh6(z.countries.size) : '';
      const allCount = z?.total ? formatNumberSh6(z.total) : '';
      const monthCells = monthCols.map((monthKey) => {
        const count = z?.months?.get(monthKey) || 0;
        if (!count) return '<td></td>';
        return `<td>${formatNumberSh6(count)}</td>`;
      }).join('');
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${zoneLink}</td>
        <td>${countries}</td>
        ${monthCells}
        <td>${allCount}</td>
        <td class="tac">${mapLink}</td>
      </tr>
    `;
    }).join('');
  }

  function renderZoneYearRowsFromList(list, derived, field, yearColumns) {
    const yearCols = yearColumns && yearColumns.length ? yearColumns : [];
    const summaryMap = buildZoneYearSummaryMap(derived, field);
    const scope = field === 'itu' ? 'itu_zone' : 'cq_zone';
    const dataAttr = field === 'itu' ? 'data-itu' : 'data-cq';
    const linkClass = field === 'itu' ? 'log-itu' : 'log-cq';
    return list.map((info, idx) => {
      const zone = Number(info.zone);
      const z = summaryMap.get(zone);
      const zoneText = escapeHtml(String(info.zone || ''));
      const zoneAttr = escapeAttr(String(info.zone || ''));
      const mapLink = z ? `<a href="#" class="map-link" data-scope="${scope}" data-key="${zoneAttr}">map</a>` : '';
      const zoneLink = z ? `<a href="#" class="${linkClass}" ${dataAttr}="${zoneAttr}">${zoneText}</a>` : zoneText;
      const countries = z?.countries?.size ? formatNumberSh6(z.countries.size) : '';
      const allCount = z?.total ? formatNumberSh6(z.total) : '';
      const yearCells = yearCols.map((yearKey) => {
        const count = z?.years?.get(yearKey) || 0;
        if (!count) return '<td></td>';
        return `<td>${formatNumberSh6(count)}</td>`;
      }).join('');
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${zoneLink}</td>
        <td>${countries}</td>
        ${yearCells}
        <td>${allCount}</td>
        <td class="tac">${mapLink}</td>
      </tr>
    `;
    }).join('');
  }

  function renderZoneMonthTable(rows, monthColumns) {
    const monthHeaders = (monthColumns && monthColumns.length ? monthColumns : []).map((monthKey) => `<th>${escapeHtml(monthLabelFromKey(monthKey))}</th>`).join('');
    const colCount = 3 + (monthColumns && monthColumns.length ? monthColumns.length : 0);
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Zone</th><th>DXCC</th>${monthHeaders}<th>All</th><th>Map</th></tr>
        ${rows}
        ${mapAllFooter(colCount)}
      </table>
    `;
  }

  function renderZoneYearTable(rows, yearColumns) {
    const yearHeaders = (yearColumns && yearColumns.length ? yearColumns : []).map((yearKey) => `<th>${escapeHtml(String(yearKey))}</th>`).join('');
    const colCount = 3 + (yearColumns && yearColumns.length ? yearColumns.length : 0);
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Zone</th><th>DXCC</th>${yearHeaders}<th>All</th><th>Map</th></tr>
        ${rows}
        ${mapAllFooter(colCount)}
      </table>
    `;
  }

  function renderCqZonesByMonth() {
    if (!state.derived) return renderPlaceholder({ id: 'zones_cq_by_month', title: 'CQ zones by month' });
    const list = buildZoneMonthListFromDerived(state.derived, 'cq');
    const monthColumns = getMonthColumnsFromDerived(state.derived);
    if (!monthColumns.length || !list.length) return '<p>No data.</p>';
    const rows = renderZoneMonthRowsFromList(list, state.derived, 'cq', monthColumns);
    return renderZoneMonthTable(rows, monthColumns);
  }

  function renderItuZonesByMonth() {
    if (!state.derived) return renderPlaceholder({ id: 'zones_itu_by_month', title: 'ITU zones by month' });
    const list = buildZoneMonthListFromDerived(state.derived, 'itu');
    const monthColumns = getMonthColumnsFromDerived(state.derived);
    if (!monthColumns.length || !list.length) return '<p>No data.</p>';
    const rows = renderZoneMonthRowsFromList(list, state.derived, 'itu', monthColumns);
    return renderZoneMonthTable(rows, monthColumns);
  }

  function renderCqZonesByYear() {
    if (!state.derived) return renderPlaceholder({ id: 'zones_cq_by_year', title: 'CQ zones by year' });
    const list = buildZoneYearListFromDerived(state.derived, 'cq');
    const yearColumns = getYearColumnsFromDerived(state.derived);
    if (!yearColumns.length || !list.length) return '<p>No data.</p>';
    const rows = renderZoneYearRowsFromList(list, state.derived, 'cq', yearColumns);
    return renderZoneYearTable(rows, yearColumns);
  }

  function renderItuZonesByYear() {
    if (!state.derived) return renderPlaceholder({ id: 'zones_itu_by_year', title: 'ITU zones by year' });
    const list = buildZoneYearListFromDerived(state.derived, 'itu');
    const yearColumns = getYearColumnsFromDerived(state.derived);
    if (!yearColumns.length || !list.length) return '<p>No data.</p>';
    const rows = renderZoneYearRowsFromList(list, state.derived, 'itu', yearColumns);
    return renderZoneYearTable(rows, yearColumns);
  }

  function renderCountryMonthRowsFromList(list, derived, monthColumns) {
    const monthCols = monthColumns && monthColumns.length ? monthColumns : [];
    const summaryMap = buildCountrySummaryMap(derived);
    const monthDataMap = derived?.countriesByMonth || new Map();
    return list.map((info, idx) => {
      const country = info.country;
      const c = summaryMap.get(country);
      const continent = c?.continent || info.continent || '';
      const prefixCode = c?.prefixCode || info.prefixCode || '';
      const countryData = monthDataMap.get(country);
      const countryAttr = escapeAttr(country || '');
      const rowTotal = countryData?.total || 0;
      const mapLink = c ? `<a href="#" class="map-link" data-scope="country" data-key="${countryAttr}">map</a>` : '';
      const countryLabel = c ? `<a href="#" class="log-country" data-country="${countryAttr}">${escapeHtml(country || '')}</a>` : escapeHtml(country || '');
      const monthCells = monthCols.map((monthKey) => {
        const count = countryData?.months?.get(monthKey) || 0;
        if (!count) return '<td></td>';
        return `<td>${formatNumberSh6(count)}</td>`;
      }).join('');
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${formatNumberSh6(idx + 1)}</td>
        <td class="${continentClass(continent)}">${escapeHtml(continent)}</td>
        <td>${escapeHtml(prefixCode)}</td>
        <td>${countryLabel}</td>
        <td>${rowTotal ? formatNumberSh6(rowTotal) : ''}</td>
        ${monthCells}
        <td class="tac">${mapLink}</td>
      </tr>
    `;
    }).join('');
  }

  function renderCountryYearRowsFromList(list, derived, yearColumns) {
    const yearCols = yearColumns && yearColumns.length ? yearColumns : [];
    const summaryMap = buildCountrySummaryMap(derived);
    const yearDataMap = derived?.countriesByYear || new Map();
    return list.map((info, idx) => {
      const country = info.country;
      const c = summaryMap.get(country);
      const continent = c?.continent || info.continent || '';
      const prefixCode = c?.prefixCode || info.prefixCode || '';
      const countryData = yearDataMap.get(country);
      const countryAttr = escapeAttr(country || '');
      const rowTotal = countryData?.total || 0;
      const mapLink = c ? `<a href="#" class="map-link" data-scope="country" data-key="${countryAttr}">map</a>` : '';
      const countryLabel = c ? `<a href="#" class="log-country" data-country="${countryAttr}">${escapeHtml(country || '')}</a>` : escapeHtml(country || '');
      const yearCells = yearCols.map((yearKey) => {
        const count = countryData?.years?.get(yearKey) || 0;
        if (!count) return '<td></td>';
        return `<td>${formatNumberSh6(count)}</td>`;
      }).join('');
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${formatNumberSh6(idx + 1)}</td>
        <td class="${continentClass(continent)}">${escapeHtml(continent)}</td>
        <td>${escapeHtml(prefixCode)}</td>
        <td>${countryLabel}</td>
        <td>${rowTotal ? formatNumberSh6(rowTotal) : ''}</td>
        ${yearCells}
        <td class="tac">${mapLink}</td>
      </tr>
    `;
    }).join('');
  }

  function renderCountriesByMonthTable(rows, monthColumns) {
    const monthHeaders = (monthColumns && monthColumns.length ? monthColumns : []).map((monthKey) => `<th>${escapeHtml(monthLabelFromKey(monthKey))}</th>`).join('');
    const colCount = 5 + (monthColumns && monthColumns.length ? monthColumns.length : 0);
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Cont.</th><th>Prefix</th><th>Country</th><th>Total</th>${monthHeaders}<th>Map</th></tr>
        ${rows}
        ${mapAllFooter(colCount)}
      </table>
    `;
  }

  function renderCountriesByYearTable(rows, yearColumns) {
    const yearHeaders = (yearColumns && yearColumns.length ? yearColumns : []).map((yearKey) => `<th>${escapeHtml(String(yearKey))}</th>`).join('');
    const colCount = 5 + (yearColumns && yearColumns.length ? yearColumns.length : 0);
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Cont.</th><th>Prefix</th><th>Country</th><th>Total</th>${yearHeaders}<th>Map</th></tr>
        ${rows}
        ${mapAllFooter(colCount)}
      </table>
    `;
  }

  function renderCountriesByMonth() {
    return renderCountriesByMonthHeatmap(state.globalBandFilter || '');
  }

  function monthOfYearHeaders() {
    return MONTH_LABELS.map((label) => `<th class="countries-month-header">${escapeHtml(label)}</th>`).join('');
  }

  function buildCountryInfoMap(derived) {
    const map = new Map();
    (derived?.countrySummary || []).forEach((c) => {
      map.set(c.country, {
        continent: c.continent || '',
        prefixCode: c.prefixCode || ''
      });
    });
    return map;
  }

  function renderCountriesByMonthHeatmapRowsFromList(list, monthMap, countryInfoMap, maxCount, bandFilter) {
    const groups = new Map();
    list.forEach((info) => {
      const country = info?.country || '';
      const bucket = monthMap.get(country);
      if (!bucket || !bucket.total) return;
      const mergedInfo = countryInfoMap.get(country) || {};
      const rawContinent = normalizeContinent(info.continent || mergedInfo.continent || '');
      const continent = CONTINENT_ORDER.includes(rawContinent) ? rawContinent : (rawContinent || 'Other');
      const prefix = info.prefixCode || mergedInfo.prefixCode || '';
      if (!groups.has(continent)) groups.set(continent, []);
      groups.get(continent).push({
        country,
        prefix,
        total: bucket.total,
        months: Array.isArray(bucket.months) ? bucket.months : Array.from({ length: 12 }, () => 0)
      });
    });
    const bandLabel = bandFilter ? `${formatBandLabel(bandFilter)} QSOs` : 'All bands QSOs';
    let rows = '';
    CONTINENT_ORDER.concat(['Other']).forEach((continent) => {
      const countries = groups.get(continent);
      if (!countries || !countries.length) return;
      const continentAttr = escapeAttr(continent);
      const continentText = escapeHtml(continentLabel(continent) || continent);
      rows += `<tr class="thc"><th colspan="3" class="${continentClass(continent)}"><a href="#" class="log-continent" data-continent="${continentAttr}">${continentText}</a></th><th class="countries-month-total-header">${escapeHtml(bandLabel)}</th>${monthOfYearHeaders()}</tr>`;
      rows += countries.map((entry, idx) => {
        const rowCls = idx % 2 === 0 ? 'td1' : 'td0';
        const prefixText = escapeHtml(entry.prefix || '');
        const countryAttr = escapeAttr(entry.country || '');
        const countryText = escapeHtml(entry.country || '');
        const countryCell = entry.total ? `<a href="#" class="log-country" data-country="${countryAttr}">${countryText}</a>` : countryText;
        const monthCells = entry.months.map((count, monthIndex) => {
          const cls = monthHeatClass(count, maxCount);
          const title = count
            ? `${entry.country} ${MONTH_LABELS[monthIndex]}: ${formatNumberSh6(count)} QSOs`
            : '';
          const classAttr = cls ? ` class="countries-month-cell ${cls}"` : ' class="countries-month-cell"';
          const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
          return `<td${classAttr}${titleAttr}>${count ? formatNumberSh6(count) : ''}</td>`;
        }).join('');
        return `
          <tr class="${rowCls}">
            <td class="countries-month-index-cell">${formatNumberSh6(idx + 1)}</td>
            <td class="countries-month-prefix-cell">${prefixText}</td>
            <td class="countries-month-country-cell">${countryCell}</td>
            <td class="countries-month-total-cell">${formatNumberSh6(entry.total)}</td>
            ${monthCells}
          </tr>
        `;
      }).join('');
    });
    return rows;
  }

  function renderCountriesByMonthHeatmapTable(rows) {
    const legendCells = Array.from({ length: 10 }, (_, idx) => `<td class="s${idx}" title="Intensity level ${idx + 1}"></td>`).join('');
    const monthCols = Array.from({ length: 12 }, () => '<col class="countries-month-col-month">').join('');
    return `
      <table class="mtc countries-month-heatmap-table" style="margin-top:5px;margin-bottom:10px;">
        <colgroup>
          <col class="countries-month-col-index">
          <col class="countries-month-col-prefix">
          <col class="countries-month-col-country">
          <col class="countries-month-col-total">
          ${monthCols}
        </colgroup>
        <tr>
          <td colspan="4">Legend (relative monthly intensity):</td>
          ${legendCells}
          <td colspan="2">low -> high</td>
        </tr>
        <tr><td colspan="16">&nbsp;</td></tr>
        ${rows || '<tr><td colspan="16">No country rows available.</td></tr>'}
      </table>
    `;
  }

  function renderCountriesByMonthHeatmap(bandFilter) {
    if (!state.derived) return renderPlaceholder({ id: 'countries_by_month', title: 'Countries by month' });
    const selectedBand = bandFilter
      ? normalizeBandToken(bandFilter)
      : (state.globalBandFilter && shouldBandFilterReport('countries_by_month')
        ? normalizeBandToken(state.globalBandFilter)
        : '');
    const qsos = state.qsoData?.qsos || [];
    const monthMap = buildCountryMonthOfYearBuckets(qsos, selectedBand);
    if (!monthMap.size) return '<p>No data.</p>';
    const list = buildCountryListFromDerived(state.derived);
    if (!list.length) return '<p>No data.</p>';
    const countryInfoMap = buildCountryInfoMap(state.derived);
    const maxCount = getCountryMonthHeatMaxCount(monthMap);
    const rows = renderCountriesByMonthHeatmapRowsFromList(list, monthMap, countryInfoMap, maxCount, selectedBand);
    return rows ? renderCountriesByMonthHeatmapTable(rows) : '<p>No data.</p>';
  }

  function renderCountriesByYear() {
    if (!state.derived) return renderPlaceholder({ id: 'countries_by_year', title: 'Countries by year' });
    const yearColumns = getYearColumnsFromDerived(state.derived);
    const list = buildCountryListFromDerived(state.derived);
    if (!yearColumns.length || !list.length) return '<p>No data.</p>';
    const rows = renderCountryYearRowsFromList(list, state.derived, yearColumns);
    return renderCountriesByYearTable(rows, yearColumns);
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
      return `<tr class="${cls}" data-compare-row-key="hour-${escapeAttr(String(key))}"><td>${dayLabel}</td><td><b>${hourLabel}</b></td>${cells}<td>${allLink}</td><td>${formatNumberSh6(accum || '')}</td><td>${formatNumberSh6(pts || '')}</td><td>${avgPts}</td></tr>`;
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
    const range = getCompareTimeRangeLock();
    const filtered = slots.map((entry) => filterQsosAndPointsByTsRange(
      entry.snapshot.qsoData?.qsos || [],
      getEffectivePointsByIndex(entry.snapshot.derived, entry.snapshot.qsoData?.qsos || []),
      range
    ));
    const maps = filtered.map((entry) => buildHourBucketMap(entry.qsos, entry.pointsByIndex));
    const order = buildHourKeyOrderFromMapsList(maps, filtered.map((entry) => entry.qsos));
    if (!order.length) {
      const message = range ? 'No QSOs inside the locked time range.' : 'No QSOs to analyze.';
      const htmlBlocks = slots.map((entry) => (entry.ready ? `<p>${message}</p>` : `<p>No ${entry.label} loaded.</p>`));
      return renderComparePanels(slots, htmlBlocks, 'qs_by_hour_sheet');
    }
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
      return `<tr class="${cls}" data-compare-row-key="hour-${escapeAttr(String(key))}"><td>${dayLabel}</td><td><b>${hourLabel}</b></td>${cells}<td>${allLink}</td><td>${formatPointValue(accum || '')}</td><td>${formatNumberSh6(qsos || '')}</td><td>${avgPts}</td></tr>`;
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
    const range = getCompareTimeRangeLock();
    const filtered = slots.map((entry) => filterQsosAndPointsByTsRange(
      entry.snapshot.qsoData?.qsos || [],
      getEffectivePointsByIndex(entry.snapshot.derived, entry.snapshot.qsoData?.qsos || []),
      range
    ));
    const maps = filtered.map((entry) => buildHourBucketMap(entry.qsos, entry.pointsByIndex));
    const order = buildHourKeyOrderFromMapsList(maps, filtered.map((entry) => entry.qsos));
    if (!order.length) {
      const message = range ? 'No points inside the locked time range.' : 'No points to analyze.';
      const htmlBlocks = slots.map((entry) => (entry.ready ? `<p>${message}</p>` : `<p>No ${entry.label} loaded.</p>`));
      return renderComparePanels(slots, htmlBlocks, 'points_by_hour_sheet');
    }
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
        isDupe: Boolean(q?.isDupe),
        qsoNumber: q?.qsoNumber,
        points: Number(Array.isArray(pointsByIndex) ? pointsByIndex[idx] : q?.points) || 0
      }))
      .filter((item) => Number.isFinite(item.ts) && !item.isDupe)
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
    const data = (qsos || [])
      .filter((q) => typeof q.ts === 'number' && !q.isDupe)
      .sort((a, b) => a.ts - b.ts);
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
        cells += `<td class="${cls}" data-compare-cell-key="minute-${escapeAttr(String(minuteBucket))}">${cellValue}</td>`;
      }
      const rowCls = rowIndex % 2 === 0 ? 'td1' : 'td0';
      rows += `<tr style="text-align:center;" class="${rowCls}" data-compare-row-key="hour-${escapeAttr(String(hour))}"><td>${dayLabel}</td><td><b>${String(new Date(ts).getUTCHours()).padStart(2, '0')}</b></td>${cells}</tr>`;
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
    });
  }

  function renderPrefixesTable(rows) {
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;">
        <colgroup><col width="40px" span="3" align="center"/><col width="200px" align="left"/><col span="2" width="40px" align="center"/></colgroup>
        <tr class="thc"><th>#</th><th>Cont.</th><th>ID</th><th>Country</th><th>Count</th><th>% of pfx</th><th>Worked pfx</th></tr>
        ${joinTableRows(rows)}
      </table>
    `;
  }

  function renderPrefixesContent() {
    if (!state.derived) return renderPlaceholder({ id: 'prefixes', title: 'Prefixes' });
    if (!state.ctyTable || !state.ctyTable.length) return '<p>cty.dat not loaded.</p>';
    const totalPrefixes = state.derived.prefixSummary.length || 0;
    const groups = buildPrefixGroups(state.derived);
    const list = buildPrefixListFromGroups(groups);
    const rows = renderPrefixesRowsFromList(list, groups, totalPrefixes);
    return renderRetainedVirtualTable('prefixes', {
      rows,
      rowHeight: 30,
      overscan: 10,
      columnCount: 7,
      emptyHtml: '<tr class="td1"><td colspan="7">No prefix data available.</td></tr>',
      colgroupHtml: '<colgroup><col width="40px" span="3" align="center"/><col width="200px" align="left"/><col span="2" width="40px" align="center"/></colgroup>',
      headerHtml: '<tr class="thc"><th>#</th><th>Cont.</th><th>ID</th><th>Country</th><th>Count</th><th>% of pfx</th><th>Worked pfx</th></tr>'
    });
  }

  function renderPrefixesCompareContent() {
    return renderPrefixesCompareAligned();
  }

  function renderPrefixesReportContent() {
    return state.compareEnabled ? renderPrefixesCompareContent() : renderPrefixesContent();
  }

  function renderPrefixes() {
    return renderRetainedReportShell('prefixes', renderPrefixesReportContent());
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
    `});
  }

  function renderCallsignLengthTable(rows) {
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Length</th><th>Callsigns</th><th>%</th><th>QSOs</th><th>%</th></tr>
        ${joinTableRows(rows)}
      </table>
    `;
  }

  function renderCallsignLengthContent() {
    if (!state.derived) return renderPlaceholder({ id: 'callsign_length', title: 'Callsign length' });
    const totalCalls = state.derived.uniqueCallsCount || 0;
    const totalQsos = state.qsoData?.qsos.length || 0;
    const list = buildCallsignLengthList(state.derived);
    const rows = renderCallsignLengthRowsFromList(list, state.derived, totalCalls, totalQsos);
    return renderRetainedVirtualTable('callsign_length', {
      rows,
      rowHeight: 28,
      overscan: 8,
      columnCount: 5,
      emptyHtml: '<tr class="td1"><td colspan="5">No callsign-length data available.</td></tr>',
      headerHtml: '<tr class="thc"><th>Length</th><th>Callsigns</th><th>%</th><th>QSOs</th><th>%</th></tr>'
    });
  }

  function renderCallsignLengthCompareContent() {
    return renderCallsignLengthCompareAligned();
  }

  function renderCallsignLengthReportContent() {
    return state.compareEnabled ? renderCallsignLengthCompareContent() : renderCallsignLengthContent();
  }

  function renderCallsignLength() {
    return renderRetainedReportShell('callsign_length', renderCallsignLengthReportContent());
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
    `});
  }

  function renderCallsignStructureTable(rows) {
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Callsign structure, C - char, D - digit</th><th>Example</th><th>Callsigns</th><th>%</th><th>QSOs</th><th>%</th></tr>
        ${joinTableRows(rows)}
      </table>
    `;
  }

  function renderCallsignStructureContent() {
    if (!state.derived) return renderPlaceholder({ id: 'callsign_structure', title: 'Callsign structure' });
    const totalCalls = state.derived.uniqueCallsCount || 0;
    const totalQsos = state.qsoData?.qsos.length || 0;
    const list = buildStructureList(state.derived);
    const rows = renderCallsignStructureRowsFromList(list, state.derived, totalCalls, totalQsos);
    return renderRetainedVirtualTable('callsign_structure', {
      rows,
      rowHeight: 28,
      overscan: 8,
      columnCount: 7,
      emptyHtml: '<tr class="td1"><td colspan="7">No callsign-structure data available.</td></tr>',
      headerHtml: '<tr class="thc"><th>#</th><th>Callsign structure, C - char, D - digit</th><th>Example</th><th>Callsigns</th><th>%</th><th>QSOs</th><th>%</th></tr>'
    });
  }

  function renderCallsignStructureCompareContent() {
    return renderCallsignStructureCompareAligned();
  }

  function renderCallsignStructureReportContent() {
    return state.compareEnabled ? renderCallsignStructureCompareContent() : renderCallsignStructureContent();
  }

  function renderCallsignStructure() {
    return renderRetainedReportShell('callsign_structure', renderCallsignStructureReportContent());
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
    });
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
        ${joinTableRows(rows)}
        ${mapAllFooter(bandCols.length + 4)}
      </table>
    `;
  }

  function renderDistanceContent() {
    if (!state.derived || !state.derived.distanceSummary) return renderPlaceholder({ id: 'distance', title: 'Distance' });
    const ds = state.derived.distanceSummary;
    if (!ds.count) return '<p>No distance data (station or remote locations missing).</p>';
    const list = buildDistanceList(state.derived);
    const rows = renderDistanceRowsFromList(list, state.derived);
    const bandCols = getDisplayBandList();
    const qsoCols = bandCols.length + 1;
    const bandHeaders = bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    return renderRetainedVirtualTable('distance', {
      rows,
      rowHeight: 28,
      overscan: 10,
      columnCount: bandCols.length + 4,
      emptyHtml: `<tr class="td1"><td colspan="${bandCols.length + 4}">No distance data available.</td></tr>`,
      headerHtml: `
        <tr class="thc">
          <th rowspan="2">Distance, km</th>
          <th colspan="${qsoCols}">QSOs</th>
          <th rowspan="2">%</th>
          <th rowspan="2">Map</th>
        </tr>
        <tr class="thc">${bandHeaders}<th>All</th></tr>
      `,
      footerHtml: mapAllFooter(bandCols.length + 4)
    });
  }

  function renderDistanceCompareContent() {
    return renderDistanceCompareAligned();
  }

  function renderDistanceReportContent() {
    return state.compareEnabled ? renderDistanceCompareContent() : renderDistanceContent();
  }

  function renderDistance() {
    return renderRetainedReportShell('distance', renderDistanceReportContent());
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

  function formatHeadingSectorLabel(start, span = 10) {
    const safeStart = Math.max(0, Math.min(359, Number(start) || 0));
    const safeSpan = Math.max(1, Number(span) || 10);
    const safeEnd = Math.max(safeStart, Math.min(359, safeStart + safeSpan - 1));
    if (safeSpan === 1) return `${String(safeStart).padStart(3, '0')}°`;
    return `${String(safeStart).padStart(3, '0')} - ${String(safeEnd).padStart(3, '0')}`;
  }

  function collectHeadingHistogramFromQsos(qsos, options = {}) {
    const list = Array.isArray(qsos) ? qsos : [];
    const safeBinSize = Math.max(1, Math.min(30, Number(options.binSize) || 10));
    const metric = options.metric === 'points' ? 'points' : 'qsos';
    const pointsByIndex = Array.isArray(options.pointsByIndex) ? options.pointsByIndex : null;
    const bins = new Map();
    list.forEach((q, idx) => {
      const bearing = Number(q?.bearing);
      if (!Number.isFinite(bearing)) return;
      const normalized = ((bearing % 360) + 360) % 360;
      const start = Math.floor(normalized / safeBinSize) * safeBinSize;
      const existing = bins.get(start) || {
        start,
        span: safeBinSize,
        sector: formatHeadingSectorLabel(start, safeBinSize),
        count: 0,
        points: 0
      };
      const pointValue = Math.max(0, Number(pointsByIndex?.[idx] ?? q?.points) || 0);
      existing.count += 1;
      existing.points += pointValue;
      bins.set(start, existing);
    });
    return Array.from(bins.values())
      .filter((entry) => metric !== 'points' || entry.points > 0)
      .sort((left, right) => left.start - right.start);
  }

  function buildHeadingMetricEntries(summary, mode = CHART_MODE_ABSOLUTE, options = {}) {
    const normalizedMode = normalizeChartMetricMode(mode);
    const qsoList = Array.isArray(options.qsos) ? options.qsos : null;
    const metric = options.metric === 'points' ? 'points' : 'qsos';
    const unitLabel = metric === 'points' ? 'pts' : 'QSOs';
    const binSize = Math.max(1, Math.min(30, Number(options.binSize) || 10));
    const list = qsoList
      ? collectHeadingHistogramFromQsos(qsoList, {
        binSize,
        metric,
        pointsByIndex: options.pointsByIndex
      })
      : (metric === 'points' ? [] : (Array.isArray(summary) ? summary : []));
    const total = list.reduce((sum, entry) => sum + (metric === 'points' ? (Number(entry?.points) || 0) : (Number(entry?.count) || 0)), 0);
    return list.map((entry) => {
      const count = Number(entry?.count) || 0;
      const points = Number(entry?.points) || 0;
      const start = Number(entry?.start) || 0;
      const span = Math.max(1, Number(entry?.span) || (qsoList ? binSize : 10));
      const absoluteValue = metric === 'points' ? points : count;
      const pct = total > 0 ? (absoluteValue / total) * 100 : 0;
      return {
        start,
        span,
        sector: String(entry?.sector || formatHeadingSectorLabel(start, span)),
        count,
        points,
        absoluteValue,
        pct,
        unitLabel,
        metricValue: normalizedMode === CHART_MODE_NORMALIZED ? pct : absoluteValue,
        metricText: normalizedMode === CHART_MODE_NORMALIZED ? `${pct.toFixed(1)}%` : formatNumberSh6(Math.round(absoluteValue)),
        detailText: `${formatNumberSh6(Math.round(absoluteValue))} ${unitLabel} · ${pct.toFixed(1)}%`
      };
    }).sort((left, right) => left.start - right.start);
  }

  function getHeadingMetricMax(derivedList, mode = CHART_MODE_ABSOLUTE, options = {}) {
    const source = Array.isArray(derivedList) ? derivedList : [derivedList];
    let max = 0;
    source.forEach((derived) => {
      const summary = Array.isArray(derived?.headingSummary) ? derived.headingSummary : [];
      const qsos = Array.isArray(derived?.qsos) ? derived.qsos : null;
      const pointsByIndex = Array.isArray(derived?.pointsByIndex) ? derived.pointsByIndex : null;
      buildHeadingMetricEntries(summary, mode, {
        qsos,
        binSize: options.binSize,
        metric: options.metric,
        pointsByIndex
      }).forEach((entry) => {
        if (entry.metricValue > max) max = entry.metricValue;
      });
    });
    return Math.max(1, max);
  }

  function polarToCartesian(cx, cy, radius, angleDeg) {
    const radians = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(radians),
      y: cy + radius * Math.sin(radians)
    };
  }

  function describeDonutSector(cx, cy, innerRadius, outerRadius, startDeg, endDeg) {
    const outerStart = polarToCartesian(cx, cy, outerRadius, startDeg);
    const outerEnd = polarToCartesian(cx, cy, outerRadius, endDeg);
    const innerEnd = polarToCartesian(cx, cy, innerRadius, endDeg);
    const innerStart = polarToCartesian(cx, cy, innerRadius, startDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return [
      `M ${outerStart.x.toFixed(3)} ${outerStart.y.toFixed(3)}`,
      `A ${outerRadius.toFixed(3)} ${outerRadius.toFixed(3)} 0 ${largeArc} 1 ${outerEnd.x.toFixed(3)} ${outerEnd.y.toFixed(3)}`,
      `L ${innerEnd.x.toFixed(3)} ${innerEnd.y.toFixed(3)}`,
      `A ${innerRadius.toFixed(3)} ${innerRadius.toFixed(3)} 0 ${largeArc} 0 ${innerStart.x.toFixed(3)} ${innerStart.y.toFixed(3)}`,
      'Z'
    ].join(' ');
  }

  function headingCompassTextAnchor(angleDeg) {
    const normalized = ((Number(angleDeg) % 360) + 360) % 360;
    if (normalized === 0 || normalized === 180) return 'middle';
    return normalized < 180 ? 'start' : 'end';
  }

  function renderHeadingCompassCard(summary, options = {}) {
    const title = options.title || 'Beam heading compass';
    const mode = options.mode || CHART_MODE_ABSOLUTE;
    const metric = options.metric === 'points' ? 'points' : 'qsos';
    const unitLabel = metric === 'points' ? 'Pts' : 'QSOs';
    const hue = metric === 'points' ? 28 : 212;
    const binSize = Math.max(1, Math.min(30, Number(options.binSize) || 10));
    const entries = buildHeadingMetricEntries(summary, mode, {
      qsos: Array.isArray(options.qsos) ? options.qsos : null,
      binSize,
      metric,
      pointsByIndex: Array.isArray(options.pointsByIndex) ? options.pointsByIndex : null
    });
    if (!entries.length) return `<p>No ${metric === 'points' ? 'point' : 'heading'} data.</p>`;
    const maxMetric = Number.isFinite(options.maxValue) && options.maxValue > 0
      ? Number(options.maxValue)
      : Math.max(1, ...entries.map((entry) => entry.metricValue));
    const totalValue = entries.reduce((sum, entry) => sum + entry.absoluteValue, 0);
    const strongest = entries.slice().sort((left, right) => right.absoluteValue - left.absoluteValue || left.start - right.start).slice(0, 6);
    const normalizedMode = normalizeChartMetricMode(mode);
    const cx = 180;
    const cy = 180;
    const innerRadius = 44;
    const outerRadius = 154;
    const sectorPaths = entries.map((entry) => {
      const ratio = maxMetric > 0 ? entry.metricValue / maxMetric : 0;
      const currentOuter = innerRadius + Math.max(0.08, ratio) * (outerRadius - innerRadius);
      const inset = Math.min(0.22, Math.max(0.04, entry.span * 0.14));
      const startDeg = entry.start + inset;
      const endDeg = entry.start + entry.span - inset;
      const lightness = 86 - ratio * 36;
      const fill = `hsl(${hue} 72% ${lightness.toFixed(1)}%)`;
      const path = describeDonutSector(cx, cy, innerRadius, currentOuter, startDeg, endDeg);
      return `
        <a href="#" class="log-heading heading-sector-link" data-heading="${escapeAttr(entry.start)}" data-heading-span="${escapeAttr(entry.span)}">
          <title>${escapeHtml(`${entry.sector}: ${entry.detailText}`)}</title>
          <path d="${path}" fill="${fill}" stroke="#1c4f95" stroke-width="1"></path>
        </a>
      `;
    }).join('');
    const ringGuides = [0.25, 0.5, 0.75, 1].map((ratio) => {
      const radius = innerRadius + ratio * (outerRadius - innerRadius);
      return `<circle cx="${cx}" cy="${cy}" r="${radius.toFixed(1)}" class="heading-compass-ring"></circle>`;
    }).join('');
    const axisLines = [0, 90, 180, 270].map((angle) => {
      const from = polarToCartesian(cx, cy, innerRadius - 8, angle);
      const to = polarToCartesian(cx, cy, outerRadius + 4, angle);
      return `<line x1="${from.x.toFixed(2)}" y1="${from.y.toFixed(2)}" x2="${to.x.toFixed(2)}" y2="${to.y.toFixed(2)}" class="heading-compass-axis"></line>`;
    }).join('');
    const compassLabels = [
      ['N', 0],
      ['NE', 45],
      ['E', 90],
      ['SE', 135],
      ['S', 180],
      ['SW', 225],
      ['W', 270],
      ['NW', 315]
    ].map(([label, angle]) => {
      const point = polarToCartesian(cx, cy, outerRadius + 18, angle);
      return `
        <text x="${point.x.toFixed(2)}" y="${point.y.toFixed(2)}" text-anchor="${headingCompassTextAnchor(angle)}" class="heading-compass-label">
          ${escapeHtml(label)}
        </text>
      `;
    }).join('');
    const topChips = strongest.map((entry) => `
      <a href="#" class="heading-visual-chip log-heading" data-heading="${escapeAttr(entry.start)}" data-heading-span="${escapeAttr(entry.span)}">
        <span>${escapeHtml(entry.sector)}</span>
        <b>${escapeHtml(entry.detailText)}</b>
      </a>
    `).join('');
    const scaleText = normalizedMode === CHART_MODE_NORMALIZED
      ? `Scaled to the strongest sector share (${maxMetric.toFixed(1)}%).`
      : `Scaled to the strongest sector (${formatNumberSh6(Math.round(maxMetric))} ${unitLabel}).`;
    const copyText = metric === 'points'
      ? 'Compass-style histogram of effective points by heading. Longer wedges indicate where score came from.'
      : 'Compass-style histogram of worked headings. Longer wedges indicate stronger activity in that direction.';
    return `
      <section class="heading-visual-card chart-card">
        <div class="gradient">&nbsp;${escapeHtml(title)}</div>
        <div class="heading-visual-layout">
          <div class="heading-visual-figure">
            <svg class="heading-compass-svg" viewBox="0 0 360 360" role="img" aria-label="Compass histogram of worked beam headings">
              ${ringGuides}
              ${axisLines}
              ${sectorPaths}
              <circle cx="${cx}" cy="${cy}" r="${(innerRadius - 10).toFixed(1)}" class="heading-compass-core"></circle>
              <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="heading-compass-total">${escapeHtml(formatNumberSh6(Math.round(totalValue)))}</text>
              <text x="${cx}" y="${cy + 14}" text-anchor="middle" class="heading-compass-caption">${escapeHtml(unitLabel)}</text>
              ${compassLabels}
            </svg>
          </div>
          <div class="heading-visual-details">
            <p class="heading-visual-copy">${escapeHtml(copyText)}</p>
            <div class="heading-visual-stat-grid">
              <div class="heading-visual-stat">
                <span>Direction buckets</span>
                <b>${escapeHtml(formatNumberSh6(entries.length))}</b>
              </div>
              <div class="heading-visual-stat">
                <span>Strongest sector</span>
                <b>${escapeHtml(strongest[0]?.sector || 'N/A')}</b>
              </div>
              <div class="heading-visual-stat">
                <span>Compass detail</span>
                <b>${escapeHtml(`${binSize}° bins`)}</b>
              </div>
            </div>
            <p class="heading-visual-scale">${escapeHtml(scaleText)}</p>
            <div class="heading-visual-chip-row">${topChips}</div>
          </div>
        </div>
      </section>
    `;
  }

  function renderHeadingCompassPair(summary, options = {}) {
    const mode = options.mode || CHART_MODE_ABSOLUTE;
    const binSize = Math.max(1, Math.min(30, Number(options.binSize) || 10));
    const qsos = Array.isArray(options.qsos) ? options.qsos : [];
    const pointsByIndex = Array.isArray(options.pointsByIndex) ? options.pointsByIndex : null;
    return `
      <div class="heading-visual-grid">
        ${renderHeadingCompassCard(summary, {
          title: options.qsoTitle || 'QSO compass',
          mode,
          maxValue: options.qsoMaxValue,
          qsos,
          pointsByIndex,
          binSize,
          metric: 'qsos'
        })}
        ${renderHeadingCompassCard(summary, {
          title: options.pointsTitle || 'Points compass',
          mode,
          maxValue: options.pointsMaxValue,
          qsos,
          pointsByIndex,
          binSize,
          metric: 'points'
        })}
      </div>
    `;
  }

  function getHeadingByHourMax(derivedList) {
    const source = Array.isArray(derivedList) ? derivedList : [derivedList];
    let max = 0;
    source.forEach((derived) => {
      (derived?.headingByHourSeries || []).forEach((hourEntry) => {
        (hourEntry?.sectors || []).forEach((sectorEntry) => {
          const count = Number(sectorEntry?.count) || 0;
          if (count > max) max = count;
        });
      });
    });
    return Math.max(1, max);
  }

  function renderHeadingByHourHeatmapCard(derived, options = {}) {
    if (!derived || !derived.headingByHourSeries) {
      return renderPlaceholder({ id: 'charts_beam_heading_by_hour', title: 'Beam heading by hour' });
    }
    const title = options.title || 'Beam heading by hour';
    const map = buildHeadingByHourMap(derived);
    const hours = Array.isArray(options.hours) && options.hours.length ? options.hours : buildHeadingByHourOrderFromMaps([map]);
    const sectors = Array.isArray(options.sectors) && options.sectors.length ? options.sectors : buildHeadingByHourSectorsFromMaps([map]);
    if (!hours.length || !sectors.length) return '<p>No heading-by-hour data.</p>';
    const maxValue = Number.isFinite(options.maxValue) && options.maxValue > 0
      ? Number(options.maxValue)
      : getHeadingByHourMax(derived);
    const rows = hours.map((hour, idx) => {
      const sectorMap = map.get(hour) || new Map();
      const rowTotal = sectors.reduce((sum, sector) => sum + (sectorMap.get(sector) || 0), 0);
      const cells = sectors.map((sector) => {
        const count = Number(sectorMap.get(sector) || 0);
        const ratio = maxValue > 0 ? count / maxValue : 0;
        const background = count
          ? `hsla(214, 78%, 42%, ${(0.12 + ratio * 0.78).toFixed(3)})`
          : 'rgba(30, 91, 214, 0.035)';
        const color = ratio > 0.58 ? '#ffffff' : '#173b68';
        const label = `${formatDateSh6(hour * 3600000)} · ${formatHeadingSectorLabel(sector, 30)} · ${formatNumberSh6(count)} QSOs`;
        return `<td class="heading-heatmap-cell${count ? ' is-active' : ''}" style="background:${background};color:${color};" title="${escapeAttr(label)}">${count ? formatNumberSh6(count) : ''}</td>`;
      }).join('');
      const cls = idx % 2 === 0 ? 'td1' : 'td0';
      return `<tr class="${cls}"><td class="heading-heatmap-time">${escapeHtml(formatDateSh6(hour * 3600000))}</td>${cells}<td class="heading-heatmap-total">${formatNumberSh6(rowTotal)}</td></tr>`;
    }).join('');
    const header = sectors.map((sector) => `<th class="heading-heatmap-header">${escapeHtml(formatHeadingSectorLabel(sector, 30))}</th>`).join('');
    return `
      <section class="heading-heatmap-card chart-card">
        <div class="gradient">&nbsp;${escapeHtml(title)}</div>
        <div class="heading-heatmap-meta">
          <span>${escapeHtml(formatNumberSh6(hours.length))} hourly slices</span>
          <span>${escapeHtml(formatNumberSh6(sectors.length))} sectors</span>
          <span>Shared heat scale max ${escapeHtml(formatNumberSh6(Math.round(maxValue)))} QSOs</span>
        </div>
        <div class="heading-heatmap-legend">
          <span class="heading-heatmap-legend-label">Low</span>
          <span class="heading-heatmap-legend-bar"></span>
          <span class="heading-heatmap-legend-label">High</span>
        </div>
        <div class="heading-heatmap-scroll">
          <table class="mtc heading-heatmap-table" style="margin-top:5px;margin-bottom:10px;text-align:right;">
            <tr class="thc"><th>Hour (UTC)</th>${header}<th>Total</th></tr>
            ${rows}
          </table>
        </div>
      </section>
    `;
  }

  function renderHeadingRowsFromList(list, derived) {
    const bands = getDisplayBandList();
    const map = buildHeadingMap(derived);
    const total = derived?.headingSummary?.reduce((sum, h) => sum + h.count, 0) || 0;
    const maxCount = derived?.headingSummary?.reduce((max, h) => Math.max(max, h.count), 1) || 1;
    const rowColspan = bands.length + 5;
    const rows = [];
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
      rows.push(`
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td>${sectorText}</td>
          ${bandCells}
          <td>${h ? `<a href="#" class="log-heading" data-heading="${headingAttr}">${formatNumberSh6(h.count)}</a>` : ''}</td>
          <td><i>${pct}</i></td>
          <td style="text-align:left"><div class="sum" style="width:${barWidth}%" /></td>
          <td class="tac">${mapLink}</td>
        </tr>
      `);
      if (info.start % 90 === 80) {
        rows.push(`<tr><td colspan="${rowColspan}"><hr/></td></tr>`);
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
        ${joinTableRows(rows)}
        ${mapAllFooter(bands.length + 5)}
      </table>
    `;
  }

  function renderBeamHeadingContent() {
    if (!state.derived || !state.derived.headingSummary) return renderPlaceholder({ id: 'beam_heading', title: 'Beam heading' });
    const list = buildHeadingList(state.derived);
    const rows = renderHeadingRowsFromList(list, state.derived);
    if (!rows.length) return '<p>No heading data.</p>';
    const bands = getDisplayBandList();
    const qsoCols = bands.length + 1;
    const bandHeaders = bands.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    const total = state.derived.headingSummary.reduce((sum, entry) => sum + (Number(entry?.count) || 0), 0);
    const intro = renderReportIntroCard(
      'Beam heading',
      'Compass histogram of worked bearings, followed by the detailed per-band table for drill-down and map jumps.',
      [
        `${formatNumberSh6(total)} QSOs with bearings`,
        '10° compass bins + 10° drill-down table'
      ]
    );
    const qsos = state.qsoData?.qsos || [];
    const pointsByIndex = getEffectivePointsByIndex(state.derived, qsos);
    const table = renderRetainedVirtualTable('beam_heading', {
      rows,
      rowHeight: 28,
      overscan: 10,
      columnCount: bands.length + 5,
      emptyHtml: `<tr class="td1"><td colspan="${bands.length + 5}">No heading data available.</td></tr>`,
      colgroupHtml: `<colgroup><col width="100px" align="center"/><col span="${bands.length + 1}" width="60px"/><col width="56px"/></colgroup>`,
      headerHtml: `
        <tr class="thc"><th rowspan="2">Heading, &#176;</th><th colspan="${qsoCols}">QSOs</th><th colspan="2" rowspan="2">%</th><th rowspan="2">Map</th></tr>
        <tr class="thc">${bandHeaders}<th>All</th></tr>
      `,
      footerHtml: mapAllFooter(bands.length + 5)
    });
    return `${intro}${renderHeadingCompassPair(state.derived.headingSummary, {
      qsoTitle: 'QSO compass',
      pointsTitle: 'Points compass',
      qsos,
      pointsByIndex,
      binSize: 10
    })}${table}`;
  }

  function renderBeamHeadingCompareContent() {
    return renderBeamHeadingCompareAligned();
  }

  function renderBeamHeadingReportContent() {
    return state.compareEnabled ? renderBeamHeadingCompareContent() : renderBeamHeadingContent();
  }

  function renderBeamHeading() {
    return renderRetainedReportShell('beam_heading', renderBeamHeadingReportContent());
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

  function renderAllCallsignsContent() {
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
    const rowList = list.map((c, idx) => {
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
    });
    const filterNote = countryFilter
      ? `<p>Country filter: <b>${escapeHtml(countryFilter)}</b> (<a href="#" class="all-calls-clear-country">clear</a>)</p>`
      : '';
    const note = list.length ? `<p>Virtualized list: ${formatNumberSh6(list.length)} calls.</p>` : '';
    const bandHeaders = bandCols.map((b) => `<th>${escapeHtml(formatBandLabel(b))}</th>`).join('');
    return `
      ${filterNote}
      ${note}
      ${renderRetainedVirtualTable('all_callsigns', {
        rows: rowList,
        rowHeight: 28,
        overscan: 12,
        columnCount: bandCols.length + 3,
        emptyHtml: `<tr class="td1"><td colspan="${bandCols.length + 3}">No callsigns available.</td></tr>`,
        headerHtml: `<tr class="thc"><th>#</th><th>Callsign</th>${bandHeaders}<th>All</th></tr>`
      })}
    `;
  }

  function renderAllCallsignsCompareContent() {
    return renderRetainedComparePanels('all_callsigns', () => renderAllCallsignsContent());
  }

  function renderAllCallsignsReportContent() {
    return state.compareEnabled ? renderAllCallsignsCompareContent() : renderAllCallsignsContent();
  }

  function renderNotInMasterContent() {
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
    const rowList = list.slice(start, end).map((c, idx) => {
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
    });
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
      ${renderRetainedVirtualTable('not_in_master', {
        rows: rowList,
        rowHeight: 28,
        overscan: 10,
        columnCount: 5,
        emptyHtml: '<tr class="td1"><td colspan="5">All calls found in master.</td></tr>',
        headerHtml: '<tr class="thc"><th>#</th><th>Callsign</th><th>QSOs</th><th>First</th><th>Last</th></tr>'
      })}
      ${nav}
    `;
  }

  function renderNotInMasterCompareContent() {
    return renderRetainedComparePanels('not_in_master', () => renderNotInMasterContent());
  }

  function renderNotInMasterReportContent() {
    return state.compareEnabled ? renderNotInMasterCompareContent() : renderNotInMasterContent();
  }

  function renderAllCallsigns() {
    return renderRetainedReportShell('all_callsigns', renderAllCallsignsReportContent());
  }

  function renderNotInMaster() {
    return renderRetainedReportShell('not_in_master', renderNotInMasterReportContent());
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
    });
    return `
      ${note}
      ${renderRetainedVirtualTable('possible_errors', {
        rows,
        rowHeight: 30,
        overscan: 10,
        columnCount: 4,
        emptyHtml: '<tr class="td1"><td colspan="4">No possible errors detected.</td></tr>',
        headerHtml: '<tr class="thc"><th>#</th><th>Callsign in log</th><th>QSOs</th><th>Callsign(s) in master database</th></tr>'
      })}
    `;
  }

  function renderPossibleErrorsContent() {
    return renderPossibleErrorsFrom(state.derived, null, '');
  }

  function renderPossibleErrorsCompareContent() {
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
      return withSlotState(
        entry.snapshot,
        () => withStaticVirtualTableRender(() => renderPossibleErrorsFrom(entry.snapshot.derived, exclude, note)),
        { slotId: entry.id }
      );
    });
    return renderComparePanels(slots, htmlBlocks, 'possible_errors');
  }

  function renderPossibleErrorsReportContent() {
    return state.compareEnabled ? renderPossibleErrorsCompareContent() : renderPossibleErrorsContent();
  }

  function renderPossibleErrors() {
    return renderRetainedReportShell('possible_errors', renderPossibleErrorsReportContent());
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
    });
    return `
      ${slider}
      ${renderRetainedVirtualTable('passed_qsos', {
        rows,
        rowHeight: 28,
        overscan: 10,
        columnCount: 5,
        emptyHtml: '<tr class="td1"><td colspan="5">No passed QSOs detected.</td></tr>',
        headerHtml: '<tr class="thc"><th>#</th><th>Time</th><th>Call</th><th>Band</th><th>Mode</th></tr>'
      })}
    `;
  }

  function renderPassedQsosContent() {
    return renderPassedQsosForList(state.qsoData?.qsos || [], { showControls: true });
  }

  function renderPassedQsosCompareContent() {
    const slots = getActiveCompareSnapshots();
    const htmlBlocks = slots.map((entry) => (
      entry.ready
        ? withSlotState(
          entry.snapshot,
          () => withStaticVirtualTableRender(() => renderPassedQsosForList(entry.snapshot.qsoData?.qsos || [], { showControls: false })),
          { slotId: entry.id }
        )
        : `<p>No ${entry.label} loaded.</p>`
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

  function renderPassedQsosReportContent() {
    return state.compareEnabled ? renderPassedQsosCompareContent() : renderPassedQsosContent();
  }

  function renderPassedQsos() {
    return renderRetainedReportShell('passed_qsos', renderPassedQsosReportContent());
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
    const yScaleLinear = (freq) => margin.top + (1 - (freq - minFreq) / (maxFreq - minFreq)) * plotH;
    const fallbackBandRanges = collectFrequencyScatterBandRanges(qsos);
    const bandRanges = Array.isArray(range.bandRanges) && range.bandRanges.length
      ? range.bandRanges
      : fallbackBandRanges;
    const brackets = buildFrequencyScatterBrackets(bandRanges, margin.top, height - margin.bottom);
    const bracketByBand = new Map(brackets.map((entry) => [entry.band, entry]));
    const yForPoint = (point) => {
      const bracket = bracketByBand.get(point.band);
      if (!bracket) return yScaleLinear(point.freq);
      const span = bracket.maxFreq - bracket.minFreq;
      if (!Number.isFinite(span) || span <= 0) return (bracket.top + bracket.bottom) / 2;
      const ratio = Math.max(0, Math.min(1, (point.freq - bracket.minFreq) / span));
      return bracket.bottom - (ratio * (bracket.bottom - bracket.top));
    };
    const xTicks = 5;
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
    brackets.forEach((bracket, idx) => {
      const topY = bracket.top;
      const bottomY = bracket.bottom;
      yGrid.push(`<line class="freq-grid" x1="${margin.left}" y1="${topY}" x2="${width - margin.right}" y2="${topY}"></line>`);
      if (idx === brackets.length - 1) {
        yGrid.push(`<line class="freq-grid" x1="${margin.left}" y1="${bottomY}" x2="${width - margin.right}" y2="${bottomY}"></line>`);
      }
      const labelY = (topY + bottomY) / 2;
      yLabels.push(`<text class="freq-axis-text" x="${margin.left - 8}" y="${labelY + 4}" text-anchor="end">${escapeHtml(formatBandLabel(bracket.band || ''))}</text>`);
    });
    const dots = points.map((p) => {
      const x = xScale(p.ts);
      const y = yForPoint(p);
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
            <text class="freq-axis-title" x="14" y="${height / 2}" transform="rotate(-90 14 ${height / 2})" text-anchor="middle">Band (within-band frequency)</text>
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
    const qsos = state.qsoData?.qsos || [];
    const pointsByIndex = getEffectivePointsByIndex(state.derived, qsos);
    return renderHeadingCompassPair(state.derived.headingSummary, {
      qsoTitle: 'QSO compass',
      pointsTitle: 'Points compass',
      mode: CHART_MODE_ABSOLUTE,
      qsos,
      pointsByIndex,
      binSize: 10
    });
  }

  function renderChartBeamHeadingByHour() {
    if (!state.derived || !state.derived.headingByHourSeries) return renderPlaceholder({ id: 'charts_beam_heading_by_hour', title: 'Beam heading by hour' });
    return renderHeadingByHourHeatmapCard(state.derived, { title: 'Beam heading by hour' });
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
        case 'agent_briefing': return renderAgentBriefing();
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
        case 'countries_by_month': return renderCountriesByMonth();
        case 'countries_by_year': return renderCountriesByYear();
        case 'zones_cq_by_month': return renderCqZonesByMonth();
        case 'zones_itu_by_month': return renderItuZonesByMonth();
        case 'zones_cq_by_year': return renderCqZonesByYear();
        case 'zones_itu_by_year': return renderItuZonesByYear();
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
      periodFilterCache: state.periodFilterCache,
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
  const COMPARE_CROSS_HIGHLIGHT_REPORTS = new Set([
    'qs_by_hour_sheet',
    'points_by_hour_sheet',
    'qs_by_minute',
    'points_by_minute'
  ]);

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
      case 'countries_by_month': return derived.countrySummary?.length || 0;
      case 'countries_by_year': return derived.countrySummary?.length || 0;
      case 'zones_cq': return derived.cqZoneSummary?.length || 0;
      case 'zones_itu': return derived.ituZoneSummary?.length || 0;
      case 'zones_cq_by_month': return derived.cqZonesByMonth?.size || 0;
      case 'zones_itu_by_month': return derived.ituZonesByMonth?.size || 0;
      case 'zones_cq_by_year': return derived.cqZonesByYear?.size || 0;
      case 'zones_itu_by_year': return derived.ituZonesByYear?.size || 0;
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

  function renderRetainedComparePanels(reportId, renderSlotContent) {
    const slots = getActiveCompareSnapshots();
    const htmlBlocks = slots.map((entry) => (
      entry.ready
        ? withSlotState(entry.snapshot, () => withStaticVirtualTableRender(() => renderSlotContent(entry)), { slotId: entry.id })
        : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, reportId);
  }

  function renderComparePanels(slotEntries, htmlBlocks, reportId, options = {}) {
    return getCompareWorkspaceRenderer().renderComparePanels(slotEntries, htmlBlocks, reportId, options, { state, reports });
  }

  function alignSpotsCompareSections(reportId) {
    return getSpotsCompareRuntime().alignSpotsCompareSections(reportId);
  }

  function bindCompareScrollSync(reportId) {
    return getCompareControllerRuntime().bindCompareScrollSync(reportId);
  }

  function clearCompareCrossHighlights(root) {
    return getCompareControllerRuntime().clearCompareCrossHighlights(root);
  }

  function bindCompareCrossHighlights(reportId) {
    return getCompareControllerRuntime().bindCompareCrossHighlights(reportId);
  }

  function getFocusReportId(reportId) {
    return String(reportId || '').split('::')[0];
  }

  function getCompareFocusPair(reportId, slotEntries) {
    return getCompareControllerRuntime().getCompareFocusPair(reportId, slotEntries);
  }

  function renderCompareFocusControls(reportId, slotEntries, pair) {
    return getCompareControllerRuntime().renderCompareFocusControls(reportId, slotEntries, pair);
  }

  function resolveFocusEntries(reportId, slotEntries) {
    return getCompareControllerRuntime().resolveFocusEntries(reportId, slotEntries);
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

  function renderZoneMonthCompareAligned(field) {
    const reportId = field === 'itu' ? 'zones_itu_by_month' : 'zones_cq_by_month';
    const slots = getActiveCompareSnapshots();
    const monthColumns = buildMonthColumnsFromDerivedList(slots.map((entry) => entry.snapshot?.derived));
    if (slots.length > 2) {
      const { pair, entries } = resolveFocusEntries(reportId, slots);
      const lists = entries.map((entry) => buildZoneMonthListFromDerived(entry.snapshot.derived, field));
      const list = mergeListsMany(mergeZoneLists, lists);
      const reportRows = (entry, cols) => {
        if (!entry.ready) return `<p>No ${entry.label} loaded.</p>`;
        if (!cols.length || !list.length) return '<p>No data.</p>';
        const rows = renderZoneMonthRowsFromList(list, entry.snapshot.derived, field, cols);
        return rows ? renderZoneMonthTable(rows, cols) : '<p>No data.</p>';
      };
      const htmlBlocks = entries.map((entry) => reportRows(entry, monthColumns));
      const focusControls = renderCompareFocusControls(reportId, slots, pair);
      return `${focusControls}${renderComparePanels(entries, htmlBlocks, reportId)}`;
    }
    const lists = slots.map((entry) => buildZoneMonthListFromDerived(entry.snapshot.derived, field));
    const list = mergeListsMany(mergeZoneLists, lists);
    const htmlBlocks = slots.map((entry) => {
      if (!entry.ready) return `<p>No ${entry.label} loaded.</p>`;
      if (!monthColumns.length || !list.length) return '<p>No data.</p>';
      const rows = renderZoneMonthRowsFromList(list, entry.snapshot.derived, field, monthColumns);
      return rows ? renderZoneMonthTable(rows, monthColumns) : '<p>No data.</p>';
    });
    return renderComparePanels(slots, htmlBlocks, reportId);
  }

  function renderZoneYearCompareAligned(field) {
    const reportId = field === 'itu' ? 'zones_itu_by_year' : 'zones_cq_by_year';
    const slots = getActiveCompareSnapshots();
    const yearColumns = buildYearColumnsFromDerivedList(slots.map((entry) => entry.snapshot?.derived));
    if (slots.length > 2) {
      const { pair, entries } = resolveFocusEntries(reportId, slots);
      const lists = entries.map((entry) => buildZoneYearListFromDerived(entry.snapshot.derived, field));
      const list = mergeListsMany(mergeZoneLists, lists);
      const reportRows = (entry, cols) => {
        if (!entry.ready) return `<p>No ${entry.label} loaded.</p>`;
        if (!cols.length || !list.length) return '<p>No data.</p>';
        const rows = renderZoneYearRowsFromList(list, entry.snapshot.derived, field, cols);
        return rows ? renderZoneYearTable(rows, cols) : '<p>No data.</p>';
      };
      const htmlBlocks = entries.map((entry) => reportRows(entry, yearColumns));
      const focusControls = renderCompareFocusControls(reportId, slots, pair);
      return `${focusControls}${renderComparePanels(entries, htmlBlocks, reportId)}`;
    }
    const lists = slots.map((entry) => buildZoneYearListFromDerived(entry.snapshot.derived, field));
    const list = mergeListsMany(mergeZoneLists, lists);
    const htmlBlocks = slots.map((entry) => {
      if (!entry.ready) return `<p>No ${entry.label} loaded.</p>`;
      if (!yearColumns.length || !list.length) return '<p>No data.</p>';
      const rows = renderZoneYearRowsFromList(list, entry.snapshot.derived, field, yearColumns);
      return rows ? renderZoneYearTable(rows, yearColumns) : '<p>No data.</p>';
    });
    return renderComparePanels(slots, htmlBlocks, reportId);
  }

  function renderCountriesByMonthCompareAligned() {
    return renderCountriesByMonthHeatmapCompareAligned();
  }

  function renderCountriesByMonthHeatmapCompareAligned() {
    const reportId = 'countries_by_month';
    const selectedBand = state.globalBandFilter && shouldBandFilterReport(reportId)
      ? normalizeBandToken(state.globalBandFilter)
      : '';
    const slots = getActiveCompareSnapshots();
    const buildMonthMap = (entry) => buildCountryMonthOfYearBuckets(entry.snapshot?.qsoData?.qsos || [], selectedBand);
    const buildMaxFromMaps = (maps) => Math.max(0, ...maps.map((map) => getCountryMonthHeatMaxCount(map)));
    const renderEntry = (entry, list, maxCount) => {
      if (!entry.ready) return `<p>No ${entry.label} loaded.</p>`;
      if (!list.length) return '<p>No data.</p>';
      const monthMap = buildMonthMap(entry);
      if (!monthMap.size) return '<p>No data.</p>';
      const countryInfoMap = buildCountryInfoMap(entry.snapshot.derived);
      const rows = renderCountriesByMonthHeatmapRowsFromList(list, monthMap, countryInfoMap, maxCount, selectedBand);
      return rows ? renderCountriesByMonthHeatmapTable(rows) : '<p>No data.</p>';
    };
    if (slots.length > 2) {
      const { pair, entries } = resolveFocusEntries(reportId, slots);
      const lists = entries.map((entry) => buildCountryListFromDerived(entry.snapshot.derived));
      const list = mergeListsMany(mergeCountryLists, lists);
      const maxCount = buildMaxFromMaps(entries.map((entry) => buildMonthMap(entry)));
      const htmlBlocks = entries.map((entry) => renderEntry(entry, list, maxCount));
      const focusControls = renderCompareFocusControls(reportId, slots, pair);
      return `${focusControls}${renderComparePanels(entries, htmlBlocks, reportId)}`;
    }
    const lists = slots.map((entry) => buildCountryListFromDerived(entry.snapshot.derived));
    const list = mergeListsMany(mergeCountryLists, lists);
    const maxCount = buildMaxFromMaps(slots.map((entry) => buildMonthMap(entry)));
    const htmlBlocks = slots.map((entry) => renderEntry(entry, list, maxCount));
    return renderComparePanels(slots, htmlBlocks, reportId);
  }

  function renderCountriesByYearCompareAligned() {
    const slots = getActiveCompareSnapshots();
    const yearColumns = buildYearColumnsFromDerivedList(slots.map((entry) => entry.snapshot?.derived));
    if (slots.length > 2) {
      const { pair, entries } = resolveFocusEntries('countries_by_year', slots);
      const lists = entries.map((entry) => buildCountryListFromDerived(entry.snapshot.derived));
      const list = mergeListsMany(mergeCountryLists, lists);
      const htmlBlocks = entries.map((entry) => {
        if (!entry.ready) return `<p>No ${entry.label} loaded.</p>`;
        if (!yearColumns.length || !list.length) return '<p>No data.</p>';
        const rows = renderCountryYearRowsFromList(list, entry.snapshot.derived, yearColumns);
        return rows ? renderCountriesByYearTable(rows, yearColumns) : '<p>No data.</p>';
      });
      const focusControls = renderCompareFocusControls('countries_by_year', slots, pair);
      return `${focusControls}${renderComparePanels(entries, htmlBlocks, 'countries_by_year')}`;
    }
    const lists = slots.map((entry) => buildCountryListFromDerived(entry.snapshot.derived));
    const list = mergeListsMany(mergeCountryLists, lists);
    const htmlBlocks = slots.map((entry) => {
      if (!entry.ready) return `<p>No ${entry.label} loaded.</p>`;
      if (!yearColumns.length || !list.length) return '<p>No data.</p>';
      const rows = renderCountryYearRowsFromList(list, entry.snapshot.derived, yearColumns);
      return rows ? renderCountriesByYearTable(rows, yearColumns) : '<p>No data.</p>';
    });
    return renderComparePanels(slots, htmlBlocks, 'countries_by_year');
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
    const chartMax = getHeadingMetricMax(
      slots.map((entry) => ({ qsos: entry.snapshot.qsoData?.qsos || [] })),
      CHART_MODE_ABSOLUTE,
      { binSize: 10, metric: 'qsos' }
    );
    const pointsMax = getHeadingMetricMax(
      slots.map((entry) => ({
        qsos: entry.snapshot.qsoData?.qsos || [],
        pointsByIndex: getEffectivePointsByIndex(entry.snapshot.derived, entry.snapshot.qsoData?.qsos || [])
      })),
      CHART_MODE_ABSOLUTE,
      { binSize: 10, metric: 'points' }
    );
    const htmlBlocks = slots.map((entry) => {
      if (!entry.ready) return `<p>No ${entry.label} loaded.</p>`;
      const rows = list.length ? renderHeadingRowsFromList(list, entry.snapshot.derived) : '';
      if (!rows) return '<p>No heading data.</p>';
      const qsos = entry.snapshot.qsoData?.qsos || [];
      const pointsByIndex = getEffectivePointsByIndex(entry.snapshot.derived, qsos);
      return `${renderHeadingCompassPair(entry.snapshot.derived?.headingSummary || [], {
        qsoTitle: `${entry.label} QSO compass`,
        pointsTitle: `${entry.label} points compass`,
        mode: CHART_MODE_ABSOLUTE,
        qsoMaxValue: chartMax,
        pointsMaxValue: pointsMax,
        qsos,
        pointsByIndex,
        binSize: 10
      })}${renderHeadingTable(rows)}`;
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
    const range = getCompareTimeRangeLock();
    if (slots.length > 2) {
      const { pair, entries } = resolveFocusEntries('qs_by_minute', slots);
      const filtered = entries.map((entry) => filterQsosAndPointsByTsRange(
        entry.snapshot.qsoData?.qsos || [],
        getEffectivePointsByIndex(entry.snapshot.derived, entry.snapshot.qsoData?.qsos || []),
        range
      ));
      const maps = filtered.map((entry) => buildMinuteCountMap(entry.qsos));
      const ranges = maps.map((map) => getMinuteRangeFromMap(map)).filter(Boolean);
      if (!ranges.length) {
        const message = range ? 'No QSOs inside the locked time range.' : 'No QSOs to analyze.';
        const htmlBlocks = entries.map((entry) => (entry.ready ? `<p>${message}</p>` : `<p>No ${entry.label} loaded.</p>`));
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
    const filtered = slots.map((entry) => filterQsosAndPointsByTsRange(
      entry.snapshot.qsoData?.qsos || [],
      getEffectivePointsByIndex(entry.snapshot.derived, entry.snapshot.qsoData?.qsos || []),
      range
    ));
    const maps = filtered.map((entry) => buildMinuteCountMap(entry.qsos));
    const ranges = maps.map((map) => getMinuteRangeFromMap(map)).filter(Boolean);
    if (!ranges.length) {
      const message = range ? 'No QSOs inside the locked time range.' : 'No QSOs to analyze.';
      const htmlBlocks = slots.map((entry) => (entry.ready ? `<p>${message}</p>` : `<p>No ${entry.label} loaded.</p>`));
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
    const range = getCompareTimeRangeLock();
    if (slots.length > 2) {
      const { pair, entries } = resolveFocusEntries('points_by_minute', slots);
      const filtered = entries.map((entry) => filterQsosAndPointsByTsRange(
        entry.snapshot.qsoData?.qsos || [],
        getEffectivePointsByIndex(entry.snapshot.derived, entry.snapshot.qsoData?.qsos || []),
        range
      ));
      const maps = filtered.map((entry) => buildMinutePointMapFromQsos(entry.qsos, entry.pointsByIndex));
      const ranges = maps.map((map) => getMinuteRangeFromMap(map)).filter(Boolean);
      if (!ranges.length) {
        const message = range ? 'No points inside the locked time range.' : 'No points to analyze.';
        const htmlBlocks = entries.map((entry) => (entry.ready ? `<p>${message}</p>` : `<p>No ${entry.label} loaded.</p>`));
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
    const filtered = slots.map((entry) => filterQsosAndPointsByTsRange(
      entry.snapshot.qsoData?.qsos || [],
      getEffectivePointsByIndex(entry.snapshot.derived, entry.snapshot.qsoData?.qsos || []),
      range
    ));
    const maps = filtered.map((entry) => buildMinutePointMapFromQsos(entry.qsos, entry.pointsByIndex));
    const ranges = maps.map((map) => getMinuteRangeFromMap(map)).filter(Boolean);
    if (!ranges.length) {
      const message = range ? 'No points inside the locked time range.' : 'No points to analyze.';
      const htmlBlocks = slots.map((entry) => (entry.ready ? `<p>${message}</p>` : `<p>No ${entry.label} loaded.</p>`));
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

  function renderChartBeamHeadingForSlot(slot, maxOverride) {
    if (!slot.derived || !slot.derived.headingSummary) {
      return renderPlaceholder({ id: 'charts_beam_heading', title: 'Beam heading' });
    }
    const qsos = slot.qsoData?.qsos || [];
    const pointsByIndex = getEffectivePointsByIndex(slot.derived, qsos);
    return renderHeadingCompassPair(slot.derived.headingSummary, {
      qsoTitle: 'QSO compass',
      pointsTitle: 'Points compass',
      mode: CHART_MODE_ABSOLUTE,
      qsoMaxValue: maxOverride.qsos,
      pointsMaxValue: maxOverride.points,
      qsos,
      pointsByIndex,
      binSize: 10
    });
  }

  function renderChartBeamHeadingCompareAligned() {
    const slots = getActiveCompareSnapshots();
    const maxValue = getHeadingMetricMax(
      slots.map((entry) => ({ qsos: entry.snapshot.qsoData?.qsos || [] })),
      CHART_MODE_ABSOLUTE,
      { binSize: 10, metric: 'qsos' }
    );
    const pointsMaxValue = getHeadingMetricMax(
      slots.map((entry) => ({
        qsos: entry.snapshot.qsoData?.qsos || [],
        pointsByIndex: getEffectivePointsByIndex(entry.snapshot.derived, entry.snapshot.qsoData?.qsos || [])
      })),
      CHART_MODE_ABSOLUTE,
      { binSize: 10, metric: 'points' }
    );
    const htmlBlocks = slots.map((entry) => (
      entry.ready ? renderChartBeamHeadingForSlot(entry.snapshot, { qsos: maxValue, points: pointsMaxValue }) : `<p>No ${entry.label} loaded.</p>`
    ));
    return renderComparePanels(slots, htmlBlocks, 'charts_beam_heading', { chart: true });
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
    return renderHeadingByHourHeatmapCard(slot.derived, {
      title: 'Beam heading by hour',
      hours,
      sectors,
      maxValue: getHeadingByHourMax(slot.derived)
    });
  }

  function renderChartBeamHeadingByHourCompareAligned() {
    const slots = getActiveCompareSnapshots();
    const maps = slots.map((entry) => buildHeadingByHourMap(entry.snapshot.derived));
    const hours = buildHeadingByHourOrderFromMaps(maps);
    const sectors = buildHeadingByHourSectorsFromMaps(maps);
    const maxValue = getHeadingByHourMax(slots.map((entry) => entry.snapshot.derived));
    const htmlBlocks = slots.map((entry, idx) => (
      entry.ready ? renderHeadingByHourHeatmapCard(entry.snapshot.derived, {
        title: 'Beam heading by hour',
        hours,
        sectors,
        maxValue
      }) : `<p>No ${entry.label} loaded.</p>`
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
    if (report.id === 'dupes') {
      return renderDupes();
    }
    if (report.id === 'all_callsigns') {
      return renderAllCallsigns();
    }
    if (report.id === 'not_in_master') {
      return renderNotInMaster();
    }
    if (report.id === 'passed_qsos') {
      return renderPassedQsos();
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
      return renderPossibleErrors();
    }
    if (report.id === 'countries') return renderCountries();
    if (report.id === 'continents') return renderContinents();
    if (report.id === 'zones_cq') return renderCqZones();
    if (report.id === 'zones_itu') return renderItuZones();
    if (report.id === 'countries_by_month') return renderCountriesByMonthCompareAligned();
    if (report.id === 'countries_by_year') return renderCountriesByYearCompareAligned();
    if (report.id === 'zones_cq_by_month') return renderZoneMonthCompareAligned('cq');
    if (report.id === 'zones_itu_by_month') return renderZoneMonthCompareAligned('itu');
    if (report.id === 'zones_cq_by_year') return renderZoneYearCompareAligned('cq');
    if (report.id === 'zones_itu_by_year') return renderZoneYearCompareAligned('itu');
    if (report.id === 'prefixes') return renderPrefixes();
    if (report.id === 'callsign_length') return renderCallsignLength();
    if (report.id === 'callsign_structure') return renderCallsignStructure();
    if (report.id === 'distance') return renderDistance();
    if (report.id === 'beam_heading') return renderBeamHeading();
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

  function bindReportInteractions(reportId) {
    invokeOptionalRuntime('rbn compare runtime', () => getRbnCompareRuntime().teardownIfInactive(reportId));
    wrapWideTables(dom.viewContainer, reportId);
    makeTablesSortable(dom.viewContainer);
    invokeOptionalRuntime('compare controller runtime', () => getCompareControllerRuntime().bindWorkspaceInteractions(reportId));
    attachLongReportJumpBar(dom.viewContainer, reportId);
    bindVirtualTable(reportId);
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
    invokeOptionalRuntime('investigation actions runtime', () => getInvestigationActionsRuntime().bindInvestigationActions(reportId));
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
    invokeOptionalRuntime('spots actions runtime', () => getSpotsActionsRuntime().bindSpotReport(reportId));
    invokeOptionalRuntime('rbn compare runtime', () => getRbnCompareRuntime().bindRbnCompareSignalReport(reportId));
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
      const perspectiveApplyButtons = document.querySelectorAll('.session-perspective-apply');
      const perspectiveDeleteButtons = document.querySelectorAll('.session-perspective-delete');
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
      perspectiveApplyButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const perspectiveId = String(btn.dataset.perspectiveId || '').trim();
          if (!perspectiveId) return;
          const entry = loadStoredComparePerspectives().find((item) => String(item?.id || '') === perspectiveId);
          if (!entry) {
            showOverlayNotice('Saved perspective not found.', 2400);
            return;
          }
          applyStoredComparePerspective(entry);
          showOverlayNotice(`Applied perspective: ${entry.label || 'Saved perspective'}`, 2200);
        });
      });
      perspectiveDeleteButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const perspectiveId = String(btn.dataset.perspectiveId || '').trim();
          if (!perspectiveId) return;
          if (!deleteStoredComparePerspective(perspectiveId)) {
            showOverlayNotice('Unable to delete saved perspective.', 2400);
            return;
          }
          renderReportWithLoading(reports[state.activeIndex]);
          showOverlayNotice('Saved perspective deleted.', 2000);
        });
      });
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

    if (dom.viewContainer instanceof HTMLElement) {
      if (typeof viewContainerMapLinkHandler === 'function') {
        dom.viewContainer.removeEventListener('click', viewContainerMapLinkHandler);
      }
      viewContainerMapLinkHandler = (evt) => {
        const link = evt.target instanceof Element ? evt.target.closest('.map-link') : null;
        if (!(link instanceof HTMLElement) || !dom.viewContainer.contains(link)) return;
        evt.preventDefault();
        const scope = link.dataset.scope || 'map';
        const key = link.dataset.key || '';
        showMapView(scope, key);
      };
      dom.viewContainer.addEventListener('click', viewContainerMapLinkHandler);
    }

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
        const span = Math.max(1, Number(link.dataset.headingSpan) || 10);
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
        state.logHeadingRange = { start: heading, end: heading + span - 1 };
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
        const span = Math.max(1, Number(link.dataset.headingSpan) || 10);
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
        state.logHeadingRange = { start: heading, end: heading + span - 1 };
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
  }

  function renderBreaksForDerived(derived, slotLabel, options = {}) {
    if (!derived || !derived.minuteSeries) return renderPlaceholder({ id: 'breaks', title: 'Break time' });
    const threshold = state.breakThreshold || 60;
    const metrics = buildBreakReportMetrics(derived, threshold);
    const breakSummary = metrics.breakSummary;
    const slotAttr = slotLabel ? ` data-break-slot="${slotLabel}"` : '';
    const showControls = options.showControls !== false;
    const slider = showControls ? `
      <div class="break-controls"${slotAttr}>
        Break threshold (minutes):
        <input type="range" class="break-threshold"${slotAttr} min="2" max="60" step="1" value="${threshold}">
        <span class="break-threshold-value"${slotAttr}>${threshold}</span>
      </div>
    ` : '';
    const totalHours = `${Math.floor(breakSummary.totalBreakMin / 60)}:${String(breakSummary.totalBreakMin % 60).padStart(2, '0')} (${breakSummary.totalBreakMin} min)`;
    const onAirText = metrics.onAirMin != null
      ? `${formatMinutes(metrics.onAirMin)} (${metrics.onAirMin} min)`
      : 'N/A';
    const summaryHtml = `
      <p>Total break time (&gt;${threshold} min gaps): ${totalHours}</p>
      <p><strong>ON AIR time</strong>: ${onAirText}</p>
    `;
    if (!breakSummary.breaks.length) return `${slider}${summaryHtml}<p>No breaks detected.</p>`;
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
    return `
      ${slider}
      ${summaryHtml}
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
    return getArchiveSearchRuntime().setupRepoSearch(slotId);
  }

  function setCompareCount(count, updateRadios = false) {
    return getAnalysisControlsRuntime().setCompareCount(count, updateRadios);
  }

  function syncLoadPanelFlowForAnalysisMode() {
    return getAnalysisControlsRuntime().syncLoadPanelFlowForAnalysisMode();
  }

  function setAnalysisMode(mode, updateRadios = false) {
    return getAnalysisControlsRuntime().setAnalysisMode(mode, updateRadios);
  }

  function setupSlotActions() {
    return getLoadPanelRuntime().setupSlotActions();
  }

  function setupLoadSummaryActions() {
    return getLoadPanelRuntime().setupLoadSummaryActions();
  }

  function setupResetSelectionsAction() {
    if (!dom.resetSelectionsBtn) return;
    dom.resetSelectionsBtn.addEventListener('click', (evt) => {
      evt.preventDefault();
      trackEvent('reset_selections_click', {
        compareCount: Number(state.compareCount) || 1
      });
      const url = new URL(window.location.href);
      url.search = '';
      url.hash = '';
      window.location.assign(url.toString());
    });
  }

  function setupCompareToggle() {
    return getAnalysisControlsRuntime().setupCompareToggle();
  }

  function setupAnalysisModeToggle() {
    return getAnalysisControlsRuntime().setupAnalysisModeToggle();
  }

  async function init() {
    if (dom.appVersion) dom.appVersion.textContent = APP_VERSION;
    if (dom.viewTitle) dom.viewTitle.setAttribute('aria-live', 'polite');
    if (dom.viewContainer) dom.viewContainer.setAttribute('aria-busy', 'false');
    // Default: hide verbose analysis narratives while we iterate on advanced analysis.
    document.body.classList.add('sh6-hide-advanced-analysis');
    // Keep NT theme always (Classic theme removed).
    state.uiTheme = UI_THEME_NT;
    document.body.classList.add('ui-theme-nt');
    const navigationRuntimeReady = loadNavigationRuntimeModule();
    await navigationRuntimeReady;
    setupNavSearch();
    rebuildReports();

    const initRuntimeWarnings = [];
    const awaitInitRuntime = async (label, promise, options = {}) => {
      const critical = options.critical === true;
      try {
        await promise;
        return true;
      } catch (err) {
        logRuntimeFailureOnce(`init:${label}`, err);
        if (critical) throw err;
        initRuntimeWarnings.push(label);
        return false;
      }
    };

    const retainedRuntimeReady = loadRetainedRuntimeModule();
    const compareControllerReady = loadCompareControllerRuntimeModule();
    const archiveSearchRuntimeReady = loadArchiveSearchRuntimeModule();
    const loadPanelRuntimeReady = loadLoadPanelRuntimeModule();
    const analysisControlsRuntimeReady = loadAnalysisControlsRuntimeModule();
    const compareWorkspaceReady = loadCompareWorkspaceModule();
    const coachRuntimeReady = loadCoachRuntimeModule();
    const canvasZoomRuntimeReady = loadCanvasZoomRuntimeModule();
    const rbnSignalExportRuntimeReady = loadRbnSignalExportRuntimeModule();
    const spotsCompareRuntimeReady = loadSpotsCompareRuntimeModule();
    const spotsDrilldownRuntimeReady = loadSpotsDrilldownRuntimeModule();
    const spotsCoachSummaryRuntimeReady = loadSpotsCoachSummaryRuntimeModule();
    const spotsDiagnosticsRuntimeReady = loadSpotsDiagnosticsRuntimeModule();
    const spotsChartsRuntimeReady = loadSpotsChartsRuntimeModule();
    const spotsDataRuntimeReady = loadSpotsDataRuntimeModule();
    const spotsActionsRuntimeReady = loadSpotsActionsRuntimeModule();
    const rbnCompareChartRuntimeReady = loadRbnCompareChartRuntimeModule();
    const rbnCompareViewRuntimeReady = loadRbnCompareViewRuntimeModule();
    const rbnCompareModelRuntimeReady = loadRbnCompareModelRuntimeModule();
    const rbnCompareRuntimeReady = loadRbnCompareRuntimeModule();
    const investigationActionsRuntimeReady = loadInvestigationActionsRuntimeModule();
    const investigationWorkspaceReady = loadInvestigationWorkspaceModule();
    const sessionCodecReady = loadSessionCodecModule();
    const comparePerspectiveReady = loadComparePerspectiveModule();
    const exportRuntimeReady = loadExportRuntimeModule();
    const storageRuntimeReady = loadStorageRuntimeModule();

    await awaitInitRuntime('retained runtime', retainedRuntimeReady, { critical: true });
    const archiveSearchLoaded = await awaitInitRuntime('archive search runtime', archiveSearchRuntimeReady);
    const loadPanelLoaded = await awaitInitRuntime('load panel runtime', loadPanelRuntimeReady);
    const analysisControlsLoaded = await awaitInitRuntime('analysis controls runtime', analysisControlsRuntimeReady);
    await awaitInitRuntime('compare controller runtime', compareControllerReady);
    await awaitInitRuntime('coach runtime', coachRuntimeReady);
    await awaitInitRuntime('canvas zoom runtime', canvasZoomRuntimeReady);
    await awaitInitRuntime('rbn signal export runtime', rbnSignalExportRuntimeReady);
    await awaitInitRuntime('spots compare runtime', spotsCompareRuntimeReady);
    await awaitInitRuntime('spots drilldown runtime', spotsDrilldownRuntimeReady);
    await awaitInitRuntime('spots coach summary runtime', spotsCoachSummaryRuntimeReady);
    await awaitInitRuntime('spots diagnostics runtime', spotsDiagnosticsRuntimeReady);
    await awaitInitRuntime('spots charts runtime', spotsChartsRuntimeReady);
    await awaitInitRuntime('spots data runtime', spotsDataRuntimeReady);
    await awaitInitRuntime('spots actions runtime', spotsActionsRuntimeReady);
    await awaitInitRuntime('rbn compare chart runtime', rbnCompareChartRuntimeReady);
    await awaitInitRuntime('rbn compare view runtime', rbnCompareViewRuntimeReady);
    await awaitInitRuntime('rbn compare model runtime', rbnCompareModelRuntimeReady);
    await awaitInitRuntime('rbn compare runtime', rbnCompareRuntimeReady);
    await awaitInitRuntime('investigation actions runtime', investigationActionsRuntimeReady);

    setupFileInput(dom.fileInput, dom.fileStatus, 'A');
    setupFileInput(dom.fileInputB, dom.fileStatusB, 'B');
    setupFileInput(dom.fileInputC, dom.fileStatusC, 'C');
    setupFileInput(dom.fileInputD, dom.fileStatusD, 'D');
    setupGlobalDragOverlay();
    setupDropReplacePrompt();
    if (archiveSearchLoaded) {
      setupRepoSearch('A');
      setupRepoSearch('B');
      setupRepoSearch('C');
      setupRepoSearch('D');
    }
    if (analysisControlsLoaded) {
      setupCompareToggle();
      setupAnalysisModeToggle();
    }
    if (loadPanelLoaded) {
      setupSlotActions();
      setupLoadSummaryActions();
    }
    setupResetSelectionsAction();
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
    if (dom.periodFilterRibbon) {
      dom.periodFilterRibbon.addEventListener('click', (evt) => {
        const target = evt.target;
        if (!(target instanceof HTMLElement)) return;
        if (!target.classList.contains('period-pill')) return;
        const kind = (target.dataset.periodKind || '').trim();
        if (!kind) return;
        evt.preventDefault();
        const years = new Set(normalizePeriodYears(state.globalYearsFilter));
        const months = new Set(normalizePeriodMonths(state.globalMonthsFilter));
        if (kind === 'all-years') {
          years.clear();
        } else if (kind === 'all-months') {
          months.clear();
        } else if (kind === 'year') {
          const raw = Number(target.dataset.periodValue);
          if (Number.isFinite(raw)) {
            const year = Math.trunc(raw);
            if (years.has(year)) {
              years.delete(year);
            } else {
              years.add(year);
            }
          }
        } else if (kind === 'month') {
          const raw = Number(target.dataset.periodValue);
          if (Number.isFinite(raw)) {
            const month = Math.trunc(raw);
            if (months.has(month)) {
              months.delete(month);
            } else {
              months.add(month);
            }
          }
        }
        state.globalYearsFilter = Array.from(years).filter((year) => Number.isFinite(year)).sort((a, b) => a - b);
        state.globalMonthsFilter = Array.from(months).filter((month) => Number.isFinite(month) && month >= 1 && month <= 12).sort((a, b) => a - b);
        state.periodFilterCache = new Map();
        syncPeriodFiltersWithAvailableData();
        renderActiveReport();
      });
    }
    // Export actions are handled in the Export report page.
    const compareWorkspaceLoaded = await awaitInitRuntime('compare workspace module', compareWorkspaceReady);
    const investigationWorkspaceLoaded = await awaitInitRuntime('investigation workspace module', investigationWorkspaceReady);
    const sessionCodecLoaded = await awaitInitRuntime('session codec module', sessionCodecReady);
    const comparePerspectiveLoaded = await awaitInitRuntime('compare perspective module', comparePerspectiveReady);
    const exportRuntimeLoaded = await awaitInitRuntime('export runtime module', exportRuntimeReady);
    const storageRuntimeLoaded = await awaitInitRuntime('storage runtime', storageRuntimeReady);
    void compareWorkspaceLoaded;
    void investigationWorkspaceLoaded;
    void comparePerspectiveLoaded;
    void exportRuntimeLoaded;
    updateBandRibbon();
    const mapParams = parseMapViewParams();
    const canRestoreSession = sessionCodecLoaded && loadPanelLoaded && analysisControlsLoaded;
    const permalinkState = canRestoreSession ? parsePermalinkState() : null;
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
    if (initRuntimeWarnings.length) {
      console.warn('SH6 loaded with limited features due to runtime preload failures:', initRuntimeWarnings);
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
    getRenderPerf: () => getRenderPerfSummary(),
    runDupeModeRegressionChecks,
    runScoringRegressionChecks,
    trackEvent,
    setSpotHunterStatus: (status, payload = {}) => {
      state.spotHunterStatus = status || 'pending';
      state.spotHunterSource = payload.source || state.spotHunterSource || '';
      state.spotHunterError = payload.error || '';
      updateDataStatus();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (window.location?.protocol === 'file:') {
      renderLocalServerRequiredState();
      return;
    }
    init().catch((err) => {
      console.error('SH6 init failed:', err);
      if (dom.viewTitle) dom.viewTitle.textContent = 'Startup error';
      if (dom.viewContainer) {
        dom.viewContainer.innerHTML = renderStateCard({
          type: 'error',
          title: 'Startup partially failed',
          message: 'SH6 could not finish startup. Refresh the page or check the browser console for details.'
        });
      }
    });
  });
})();
