(() => {
  const reports = [
    { id: 'main', title: 'Main' },
    { id: 'summary', title: 'Summary' },
    { id: 'log', title: 'Log' },
    { id: 'operators', title: 'Operators' },
    { id: 'all_callsigns', title: 'All callsigns' },
    { id: 'rates', title: 'Rates' },
    { id: 'countries', title: 'Countries' },
    { id: 'countries_by_time', title: 'Countries by time' },
    { id: 'countries_by_time_10', title: 'Countries by time - 10' },
    { id: 'countries_by_time_15', title: 'Countries by time - 15' },
    { id: 'countries_by_time_20', title: 'Countries by time - 20' },
    { id: 'countries_by_time_40', title: 'Countries by time - 40' },
    { id: 'countries_by_time_80', title: 'Countries by time - 80' },
    { id: 'countries_by_time_160', title: 'Countries by time - 160' },
    { id: 'qs_per_station', title: 'Qs per station' },
    { id: 'passed_qsos', title: 'Passed QSOs' },
    { id: 'dupes', title: 'Dupes' },
    { id: 'qs_by_hour_sheet', title: 'Qs by hour sheet' },
    { id: 'graphs_qs_by_hour', title: 'Qs by hour' },
    { id: 'graphs_qs_by_hour_10', title: 'Qs by hour - 10' },
    { id: 'graphs_qs_by_hour_15', title: 'Qs by hour - 15' },
    { id: 'graphs_qs_by_hour_20', title: 'Qs by hour - 20' },
    { id: 'graphs_qs_by_hour_40', title: 'Qs by hour - 40' },
    { id: 'graphs_qs_by_hour_80', title: 'Qs by hour - 80' },
    { id: 'graphs_qs_by_hour_160', title: 'Qs by hour - 160' },
    { id: 'qs_by_minute', title: 'Qs by minute' },
    { id: 'one_minute_rates', title: 'One minute rates' },
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
    { id: 'sun', title: 'Sun' },
    { id: 'not_in_master', title: 'Not in master' },
    { id: 'possible_errors', title: 'Possible errors' },
    { id: 'charts', title: 'Charts' },
    { id: 'charts_top_10_countries', title: 'Top 10 countries' },
    { id: 'charts_qs_by_band', title: 'Qs by band' },
    { id: 'charts_continents', title: 'Continents' },
    { id: 'charts_frequencies', title: 'Frequencies' },
    { id: 'charts_beam_heading', title: 'Beam heading' },
    { id: 'charts_beam_heading_by_hour', title: 'Beam heading by hour' },
    { id: 'comments', title: 'Comments' },
    { id: 'sh6_info', title: 'SH6 info' }
  ];

  const APP_VERSION = 'v0.5.70';
  const SQLJS_BASE_URLS = [
    'https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/',
    'https://unpkg.com/sql.js@1.8.0/dist/'
  ];
  const ARCHIVE_BASE_URL = 'https://raw.githubusercontent.com/s53zo/Hamradio-Contest-logs-Archives/main';
  const ARCHIVE_SHARD_BASE = 'https://cdn.jsdelivr.net/gh/s53zo/Hamradio-Contest-logs-Archives@main/SH6';
  const ARCHIVE_SHARD_BASE_RAW = 'https://raw.githubusercontent.com/s53zo/Hamradio-Contest-logs-Archives/main/SH6';
  const ARCHIVE_SH6_BASE = `${ARCHIVE_BASE_URL}/SH6`;
  const ARCHIVE_BRANCHES = ['main', 'master'];
  const CORS_PROXIES = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
  ];
  const CTY_URLS = [
    'https://www.country-files.com/cty/cty.dat',
    'cty.dat',
    './cty.dat',
    '/cty.dat',
    'CTY.DAT',
    './CTY.DAT',
    '/CTY.DAT'
  ];
  const MASTER_URLS = [
    'https://www.supercheckpartial.com/MASTER.DTA',
    'MASTER.DTA',
    './MASTER.DTA',
    '/MASTER.DTA'
  ];

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

  const state = {
    activeIndex: 0,
    logFile: null,
    qsoData: null,
    ctyDat: null,
    masterDta: null,
    ctyTable: null,
    masterSet: null,
    derived: null,
    logPage: 0,
    logPageSize: 500,
    logSearch: '',
    logFieldFilter: '',
    logBandFilter: '',
    logModeFilter: '',
    logCountryFilter: '',
    logContinentFilter: '',
    logCqFilter: '',
    logItuFilter: '',
    logRange: null,
    logTimeRange: null,
    logHeadingRange: null,
    breakThreshold: 15,
    globalBandFilter: '',
    fullQsoData: null,
    fullDerived: null,
    bandDerivedCache: new Map(),
    mapContext: null,
    kmzUrls: {},
    ctyStatus: 'pending',
    masterStatus: 'pending',
    ctyError: null,
    masterError: null,
    ctySource: null,
    masterSource: null
  };

  const dom = {
    navList: document.getElementById('navList'),
    fileInput: document.getElementById('fileInput'),
    ctyInput: document.getElementById('ctyInput'),
    masterInput: document.getElementById('masterInput'),
    fileStatus: document.getElementById('fileStatus'),
    viewTitle: document.getElementById('viewTitle'),
    viewContainer: document.getElementById('viewContainer'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    ctyStatus: document.getElementById('ctyStatus'),
    masterStatus: document.getElementById('masterStatus'),
    appVersion: document.getElementById('appVersion'),
    exportPdfBtn: document.getElementById('exportPdfBtn'),
    exportHtmlBtn: document.getElementById('exportHtmlBtn'),
    bandRibbon: document.getElementById('bandRibbon'),
    repoSearch: document.getElementById('repoSearch'),
    repoStatus: document.getElementById('repoStatus'),
    repoResults: document.getElementById('repoResults')
    ,repoAutoClose: document.getElementById('repoAutoClose')
  };

  const renderers = {};

  function initNavigation() {
    const childReportIds = new Set([
      'countries_by_time_10', 'countries_by_time_15', 'countries_by_time_20', 'countries_by_time_40',
      'countries_by_time_80', 'countries_by_time_160', 'graphs_qs_by_hour_10', 'graphs_qs_by_hour_15',
      'graphs_qs_by_hour_20', 'graphs_qs_by_hour_40', 'graphs_qs_by_hour_80', 'graphs_qs_by_hour_160',
      'charts_top_10_countries', 'charts_qs_by_band', 'charts_continents', 'charts_frequencies',
      'charts_beam_heading', 'charts_beam_heading_by_hour'
    ]);
    reports.forEach((r, idx) => {
      const li = document.createElement('li');
      li.textContent = r.title;
      li.dataset.index = idx;
      li.addEventListener('click', () => setActiveReport(idx));
      if (childReportIds.has(r.id)) {
        li.classList.add('cli');
      } else {
        li.classList.add('mli');
      }
      dom.navList.appendChild(li);
    });
    updateNavHighlight();
    updatePrevNextButtons();
  }

  function updateNavHighlight() {
    const children = dom.navList.querySelectorAll('li');
    children.forEach((li, idx) => {
      const isActive = idx === state.activeIndex;
      li.classList.toggle('active', isActive);
      if (isActive) {
        li.classList.remove('mli', 'cli');
        li.classList.add('sli');
      } else if (!li.classList.contains('mli') && !li.classList.contains('cli')) {
        li.classList.add('mli');
      }
    });
  }

  function updatePrevNextButtons() {
    dom.prevBtn.disabled = state.activeIndex === 0;
    dom.nextBtn.disabled = state.activeIndex === reports.length - 1;
  }

  function setActiveReport(idx) {
    state.activeIndex = idx;
    const report = reports[idx];
    dom.viewTitle.textContent = report.title;
    dom.viewContainer.innerHTML = renderReport(report);
    bindReportInteractions(report.id);
    updateNavHighlight();
    updatePrevNextButtons();
  }

  function renderPlaceholder(report) {
    const hasLog = !!state.logFile;
    const logMsg = hasLog ? `Loaded file: ${state.logFile.name}` : 'No log file loaded yet.';
    const qsoMsg = state.qsoData ? `Parsed QSOs: ${state.qsoData.qsos.length}` : 'QSOs not parsed.';
    return `
      <p><strong>${report.title}</strong> view is not yet implemented.</p>
      <p>${logMsg}</p>
      <p>${qsoMsg}</p>
      <p>Once parsing and aggregation are wired, this view will render SH6-style data for <code>${report.id}</code>.</p>
    `;
  }

  const SUPPORTED_BANDS = new Set(['160', '80', '60', '40', '30', '20', '17', '15', '12', '10', '6', '2', '70']);

  function normalizeCall(call) {
    return (call || '').trim().toUpperCase();
  }

  function parseBandFromFreq(freqMHz) {
    if (!freqMHz || Number.isNaN(freqMHz)) return '';
    if (freqMHz >= 1.8 && freqMHz < 2.0) return '160';
    if (freqMHz >= 3.4 && freqMHz < 4.0) return '80';
    if (freqMHz >= 5.0 && freqMHz < 5.5) return '60';
    if (freqMHz >= 6.9 && freqMHz < 7.5) return '40';
    if (freqMHz >= 10.0 && freqMHz < 10.2) return '30';
    if (freqMHz >= 13.9 && freqMHz < 15.0) return '20';
    if (freqMHz >= 18.0 && freqMHz < 18.2) return '17';
    if (freqMHz >= 20.8 && freqMHz < 22.0) return '15';
    if (freqMHz >= 24.8 && freqMHz < 25.0) return '12';
    if (freqMHz >= 27.9 && freqMHz < 29.8) return '10';
    if (freqMHz >= 50 && freqMHz < 54) return '6';
    if (freqMHz >= 144 && freqMHz < 148) return '2';
    if (freqMHz >= 420 && freqMHz < 450) return '70';
    return '';
  }

  function normalizeBand(rawBand, freq) {
    const band = (rawBand || '').replace('M', '').trim();
    if (band) return band;
    return parseBandFromFreq(freq);
  }

  function normalizeMode(mode) {
    return (mode || '').trim().toUpperCase();
  }

  function formatNumberSh6(value) {
    if (value == null || value === '') return '';
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value);
    return num.toLocaleString('en-US');
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

  const BAND_CLASS_MAP = {
    '160': 'b160',
    '80': 'b80',
    '40': 'b40',
    '20': 'b20',
    '15': 'b15',
    '10': 'b10'
  };

  function bandClass(band) {
    return BAND_CLASS_MAP[band] || '';
  }

  function modeClass(mode) {
    const bucket = modeBucket(mode);
    if (bucket === 'CW') return 'm-cw';
    if (bucket === 'Digital') return 'm-dig';
    if (bucket === 'Phone') return 'm-ph';
    return '';
  }

  function continentClass(cont) {
    switch ((cont || '').toUpperCase()) {
      case 'NA': return 'c2';
      case 'SA': return 'c3';
      case 'EU': return 'c4';
      case 'AF': return 'c5';
      case 'AS': return 'c6';
      case 'OC': return 'c7';
      default: return '';
    }
  }

  function formatDateSh6(ts) {
    if (ts == null) return 'N/A';
    const d = new Date(ts);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${day}-${month}_${year} ${hh}:${mm}Z`;
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
    qsos.forEach((q) => {
      if (bandFilter && q.band !== bandFilter) return;
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
      claimedScore: null,
      club: null,
      software: null,
      ssn: null,
      kIndex: null
    };
    for (const q of qsos) {
      const r = q.raw || {};
      if (!meta.stationCallsign) meta.stationCallsign = firstNonNull(r.STATION_CALLSIGN, r.OPERATOR, q.op);
      if (!meta.contestId) meta.contestId = firstNonNull(r.CONTEST_ID, r.CONTEST_NAME, r.CONTEST);
      if (!meta.category) meta.category = firstNonNull(r.CATEGORY_OPERATOR, r.CATEGORY, r.CATEGORY_OVERLAY);
      if (meta.claimedScore == null) meta.claimedScore = firstNonNull(r.CLAIMED_SCORE, r.CLAIMED, r.APP_N1MM_CLAIMED_SCORE);
      if (!meta.club) meta.club = firstNonNull(r.CLUB, r.APP_N1MM_CLUB);
      if (!meta.software) meta.software = firstNonNull(r.APP_N1MM_N1MMVERSION, r.SW_VERSION, r.SOFTWARE);
      if (meta.ssn == null) meta.ssn = firstNonNull(r.SSN, r.SOLAR_SSN);
      if (meta.kIndex == null) meta.kIndex = firstNonNull(r.K_INDEX, r.SOLAR_KINDEX);
      if (meta.stationCallsign && meta.contestId && meta.category) break;
    }
    return meta;
  }

  function loadSolarData() {
    const raw = localStorage.getItem('sh6_solar_data');
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.hours)) return data;
    } catch (e) {
      return null;
    }
    return null;
  }

  function getSolarForHour(solarData, hourTs, fallback) {
    if (!solarData || !Array.isArray(solarData.hours)) return fallback;
    const hourKey = Math.floor(hourTs / 3600000);
    const found = solarData.hours.find((h) => h.hour === hourKey);
    if (found) {
      return {
        ssn: found.ssn ?? fallback.ssn,
        kIndex: found.kIndex ?? fallback.kIndex
      };
    }
    return fallback;
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
    const lon = (g.charCodeAt(0) - A) * 20 - 180 + (parseInt(g[2], 10) || 0) * 2 + 1;
    const lat = (g.charCodeAt(1) - A) * 10 - 90 + (parseInt(g[3], 10) || 0) * 1 + 0.5;
    if (g.length >= 6) {
      const lonMin = (g.charCodeAt(4) - A) * (5 / 60) + (2 / 60);
      const latMin = (g.charCodeAt(5) - A) * (2.5 / 60) + (1.25 / 60);
      return { lat: lat + latMin, lon: lon + lonMin };
    }
    return { lat, lon };
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

  function deriveStation(qsos) {
    // Try to find station lat/lon from ADIF fields: MY_GRIDSQUARE, STATION_LOC, MY_LAT/LON.
    for (const q of qsos) {
      const r = q.raw || {};
      if (r.MY_GRIDSQUARE || r.STATION_LOC) {
        const g = r.MY_GRIDSQUARE || r.STATION_LOC;
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
    // Prefer QSO-specific grid; fall back to prefix lat/lon from cty.dat.
    if (q.grid) {
      const loc = gridToLatLon(q.grid);
      if (loc) return loc;
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
    const histogram = new Map(); // bucket (0-1000,1000-2000, etc) -> count
    return {
      add(d) {
        if (!Number.isFinite(d)) return;
        count += 1;
        sum += d;
        if (min == null || d < min) min = d;
        if (max == null || d > max) max = d;
      const bucket = Math.floor(d / 1000) * 1000;
      histogram.set(bucket, (histogram.get(bucket) || 0) + 1);
    },
      export() {
        const buckets = Array.from(histogram.entries()).sort((a, b) => a[0] - b[0]).map(([start, c]) => ({
          range: `${start}-${start + 999}`,
          count: c
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

  function isCallsignToken(token) {
    if (!token) return false;
    const t = token.trim().toUpperCase();
    if (isMaidenheadGrid(t)) return false;
    return /[A-Z]/.test(t) && /\d/.test(t);
  }

  function parseCabrillo(text) {
    const lines = text.split(/\r?\n/);
    const header = {};
    const qsos = [];
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (/^QSO:/i.test(trimmed)) {
        const tokens = trimmed.replace(/^QSO:\s*/i, '').split(/\s+/);
        if (tokens.length < 9) return;
        const freqKHz = parseInt(tokens[0], 10);
        const freqMHz = Number.isFinite(freqKHz) ? freqKHz / 1000 : null;
        const mode = normalizeCabrilloMode(tokens[1]);
        const date = tokens[2] || '';
        const time = tokens[3] || '';
        const myCall = tokens[4] || '';
        const rstSent = tokens[5] || '';
        const rest = tokens.slice(6);
        let dxIndex = -1;
        for (let i = 0; i < rest.length; i += 1) {
          if (isCallsignToken(rest[i])) {
            dxIndex = i;
            break;
          }
        }
        if (dxIndex === -1 || dxIndex + 1 >= rest.length) {
          dxIndex = 1;
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
          BAND: freqMHz ? parseBandFromFreq(freqMHz) : '',
          MODE: mode,
          CALL: call,
          FREQ: freqMHz,
          RST_SENT: rstSent,
          RST_RCVD: rstRcvd,
          STX_STRING: exchSent,
          SRX_STRING: exchRcvd,
          MY_GRIDSQUARE: sentGrid,
          GRIDSQUARE: rcvdGrid,
          OPERATOR: myCall
        });
      } else {
        const idx = trimmed.indexOf(':');
        if (idx === -1) return;
        const key = trimmed.slice(0, idx).trim().toUpperCase();
        const value = trimmed.slice(idx + 1).trim();
        if (key) header[key] = value;
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
      let band = bandOrFreq;
      let freq = parseFloat(bandOrFreq);
      if (!Number.isFinite(freq)) freq = null;
      if (freq != null) {
        band = parseBandFromFreq(freq);
      }
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
      const meta = cab.header || {};
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

  function updateDataStatus() {
    const isProxy = (src) => /allorigins\.win|corsproxy\.io/i.test(src || '');
    const formatStatus = (status, src) => {
      if (status === 'ok') return isProxy(src) ? 'OK - Ready' : 'OK';
      if (status === 'loading') return isProxy(src) ? 'proxy loading' : 'loading';
      if (status === 'error') return 'error';
      return status || '';
    };
    dom.ctyStatus.textContent = formatStatus(state.ctyStatus, state.ctySource);
    dom.masterStatus.textContent = formatStatus(state.masterStatus, state.masterSource);
    if (dom.ctyStatus) dom.ctyStatus.title = [state.ctySource, state.ctyError].filter(Boolean).join(' ');
    if (dom.masterStatus) dom.masterStatus.title = [state.masterSource, state.masterError].filter(Boolean).join(' ');
  }

  function setupFileInput() {
    dom.fileInput.addEventListener('change', async (evt) => {
      const [file] = evt.target.files || [];
      if (!file) return;
      try {
        const text = await file.text();
        applyLoadedLog(text, file.name, file.size, 'Uploaded');
      } catch (err) {
        console.error('File parse failed:', err);
        dom.fileStatus.textContent = `Failed to parse ${file.name}: ${err && err.message ? err.message : 'unknown error'}`;
      }
    });
  }

  function applyLoadedLog(text, filename, size, sourceLabel) {
    const safeSize = Number.isFinite(size) ? size : text.length;
    state.logFile = { name: filename, size: safeSize, source: sourceLabel || '' };
    state.logPage = 0;
    dom.fileStatus.textContent = `Loaded ${filename} (${formatNumberSh6(safeSize)} bytes)`;
    state.qsoData = parseLogFile(text, filename);
    state.derived = buildDerived(state.qsoData.qsos);
    state.fullQsoData = state.qsoData;
    state.fullDerived = state.derived;
    state.bandDerivedCache = new Map();
    if (!state.qsoData.qsos.length) {
      dom.fileStatus.textContent = `Loaded ${filename} (${formatNumberSh6(safeSize)} bytes) – parsed 0 QSOs. Check file format.`;
    } else {
      dom.fileStatus.textContent = `Loaded ${filename} (${formatNumberSh6(safeSize)} bytes) – parsed ${formatNumberSh6(state.qsoData.qsos.length)} QSOs as ${state.qsoData.type}`;
    }
    setActiveReport(state.activeIndex);
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
            state.ctyStatus = 'error';
            state.ctyError = 'Parsed 0 prefixes from cty.dat';
            state.ctySource = 'local upload';
          } else {
            state.ctyDat = text;
            state.ctyTable = table;
            state.ctyStatus = 'ok';
            state.ctyError = null;
            state.ctySource = 'local upload';
            recomputeDerived('cty');
          }
        } catch (err) {
          state.ctyTable = null;
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
    if (!state.qsoData) return;
    state.derived = buildDerived(state.qsoData.qsos);
    state.fullQsoData = state.qsoData;
    state.fullDerived = state.derived;
    state.bandDerivedCache = new Map();
    dom.viewContainer.innerHTML = renderReport(reports[state.activeIndex]);
    bindReportInteractions(reports[state.activeIndex].id);
  }

  function shouldBandFilterReport(reportId) {
    if (!state.globalBandFilter) return false;
    const excluded = new Set([
      'kmz_files',
      'charts_frequencies',
      'charts_beam_heading_by_hour',
      'sun',
      'comments',
      'sh6_info'
    ]);
    return !excluded.has(reportId);
  }

  function getBandFilteredQsos(band) {
    const source = state.fullQsoData?.qsos || state.qsoData?.qsos || [];
    return source.filter((q) => q.band && q.band.toUpperCase() === band);
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
      derived = buildDerived(qsos);
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
    fetchWithFallback(ctyUrls, (status, url) => {
      state.ctyStatus = status;
      if (status === 'error') state.ctySource = url;
      if (status === 'loading') state.ctySource = url;
      updateDataStatus();
    }).then((res) => {
      if (res.error) {
        state.ctyError = res.error;
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
          state.ctyError = null;
          state.ctyStatus = 'ok';
          recomputeDerived('cty');
        } else {
          state.ctyTable = null;
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
  }

  function parseCtyDat(text) {
    // Parses cty.dat into array of prefix objects for quick lookups.
    // cty.dat format: country:...:tz, prefix1,prefix2,...;aliases with entries spanning multiple lines ending in ';'
    if (!text || /<html|<body/i.test(text)) return [];
    const lines = text.split(/\r?\n/);
    const entries = [];
    const parseToken = (tok, base) => {
      const cleaned = tok.replace(/[:\s]+$/g, '');
      const m = cleaned.match(/^(=)?([^(\[\s]+)(?:\((\d+)\))?(?:\[(\d+)\])?$/);
      if (!m) return null;
      const [, exactMark, body, cqOverride, ituOverride] = m;
      return {
        prefix: body.toUpperCase(),
        exact: exactMark === '=',
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
        for (const p of prefixes) {
          const parsed = parseToken(p.trim(), base);
          if (parsed) entries.push(parsed);
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
      for (const t of suffix) {
        const parsed = parseToken(t.trim(), base);
        if (parsed) looseEntries.push(parsed);
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
    for (const entry of state.ctyTable) {
      if (entry.exact) {
        if (call === entry.prefix) return entry;
      } else if (call.startsWith(entry.prefix)) {
        return entry;
      }
    }
    return null;
  }

  function buildCountryPrefixMap() {
    const map = new Map();
    if (!state.ctyTable) return map;
    for (const entry of state.ctyTable) {
      if (!entry.country || !entry.prefix) continue;
      const current = map.get(entry.country);
      if (!current || entry.prefix.length < current.length) {
        map.set(entry.country, entry.prefix);
      }
    }
    return map;
  }

  function continentLabel(code) {
    switch ((code || '').toUpperCase()) {
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

  function buildDerived(qsos) {
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
    const prefixes = new Map();
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
      const bandKey = q.band || 'unknown';
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

      // Prefix/country enrich
      const prefix = lookupPrefix(q.call);
      if (prefix) {
        q.country = prefix.country;
        q.cqZone = prefix.cqZone;
        q.ituZone = prefix.ituZone;
        q.continent = prefix.continent;
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
              continent: prefix.continent || null,
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
        if (prefix.continent) {
          if (!continents.has(prefix.continent)) {
            continents.set(prefix.continent, { qsos: 0, uniques: new Set(), bandCounts: new Map(), cw: 0, digital: 0, phone: 0 });
          }
          const c = continents.get(prefix.continent);
          c.qsos += 1;
          if (q.call) c.uniques.add(q.call);
          if (q.band) c.bandCounts.set(q.band, (c.bandCounts.get(q.band) || 0) + 1);
          if (bucket === 'CW') c.cw += 1;
          if (bucket === 'Digital') c.digital += 1;
          if (bucket === 'Phone') c.phone += 1;
        }
        if (prefix.cqZone) {
          if (!cqZones.has(prefix.cqZone)) cqZones.set(prefix.cqZone, { qsos: 0, countries: new Set() });
          const z = cqZones.get(prefix.cqZone);
          z.qsos += 1;
          if (prefix.country) z.countries.add(prefix.country);
        }
        if (prefix.ituZone) {
          if (!ituZones.has(prefix.ituZone)) ituZones.set(prefix.ituZone, { qsos: 0, countries: new Set() });
          const z = ituZones.get(prefix.ituZone);
          z.qsos += 1;
          if (prefix.country) z.countries.add(prefix.country);
        }
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
        const hb = q.band || 'unknown';
        if (!h.byBand.has(hb)) h.byBand.set(hb, 0);
        h.byBand.set(hb, h.byBand.get(hb) + 1);

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

          const bandKey = q.band || 'unknown';
          if (!bandHourCountry.has(bandKey)) bandHourCountry.set(bandKey, new Map());
          const bandMap = bandHourCountry.get(bandKey);
          if (!bandMap.has(hourBucket)) bandMap.set(hourBucket, new Map());
          const bhc = bandMap.get(hourBucket);
          bhc.set(q.country, (bhc.get(q.country) || 0) + 1);
        }
      }

      // Prefixes
      if (prefix && prefix.prefix) {
        if (!prefixes.has(prefix.prefix)) prefixes.set(prefix.prefix, { qsos: 0, uniques: new Set() });
        const p = prefixes.get(prefix.prefix);
        p.qsos += 1;
        if (q.call) p.uniques.add(q.call);
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
        if (!allCalls.has(q.call)) allCalls.set(q.call, { qsos: 0, bands: new Set(), firstTs: q.ts, lastTs: q.ts });
        const a = allCalls.get(q.call);
        a.qsos += 1;
        if (q.band) a.bands.add(q.band);
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
          distanceSummary.add(dist);
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
      const loggedCq = parseZone(q.raw?.CQZ ?? q.raw?.CQ_ZONE);
      const loggedItu = parseZone(q.raw?.ITUZ ?? q.raw?.ITU_ZONE);
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
        possibleErrors.push({ reason: `Unexpected band value "${q.band}"`, q });
      }
      if (Number.isFinite(q.freq)) {
        if (!freqBand) {
          possibleErrors.push({ reason: `Frequency ${q.freq} MHz is outside supported bands`, q });
        } else if (q.band && q.band !== freqBand) {
          possibleErrors.push({ reason: `Band/freq mismatch: band ${q.band}, freq ${q.freq} MHz (${freqBand}m)`, q });
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
    bandSummary.sort((a, b) => a.band.localeCompare(b.band));

    const bandModeSummary = Array.from(bandModes.values()).map((b) => ({
      band: b.band,
      cw: b.cw,
      digital: b.digital,
      phone: b.phone,
      all: b.all,
      countries: b.countries.size,
      points: b.points
    })).sort((a, b) => {
      const ai = parseInt(a.band, 10);
      const bi = parseInt(b.band, 10);
      if (Number.isFinite(ai) && Number.isFinite(bi)) return bi - ai;
      return a.band.localeCompare(b.band);
    });

    const countrySummary = [];
    countries.forEach((v, k) => {
      countrySummary.push({
        country: k,
        qsos: v.qsos,
        uniques: v.uniques.size,
        bands: Array.from(v.bands).sort(),
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
        countries: v.countries.size
      });
    });
    cqZoneSummary.sort((a, b) => a.cqZone - b.cqZone);

    const ituZoneSummary = [];
    ituZones.forEach((v, k) => {
      ituZoneSummary.push({
        ituZone: k,
        qsos: v.qsos,
        countries: v.countries.size
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
    prefixes.forEach((v, k) => {
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
      firstTs: info.firstTs,
      lastTs: info.lastTs
    })).sort((a, b) => a.call.localeCompare(b.call));

    const operatorsSummary = Array.from(ops.entries()).map(([op, info]) => ({
      op,
      qsos: info.qsos,
      uniques: info.uniques.size
    })).sort((a, b) => b.qsos - a.qsos || a.op.localeCompare(b.op));

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
      tenMinuteSeries,
      prefixSummary,
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
      comments: Array.from(comments),
      possibleErrors,
      timeRange: { minTs, maxTs },
      breakSummary,
      totalPoints
    };
  }

  function formatDate(ts) {
    if (ts == null) return 'N/A';
    const d = new Date(ts);
    return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, 'Z');
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
    const stationCall = state.derived.contestMeta?.stationCallsign || '';
    const stationPrefix = stationCall ? lookupPrefix(stationCall) : null;
    const stationCountry = stationPrefix?.country || 'N/A';
    const locator = state.derived.station?.source === 'grid' ? state.derived.station.value : 'N/A';
    const operators = state.derived.operatorsSummary?.map((o) => o.op).join(' ') || 'N/A';
    const contest = state.derived.contestMeta?.contestId || 'N/A';
    const category = state.derived.contestMeta?.category || 'N/A';
    const claimedScore = Number.isFinite(state.derived.totalPoints) && state.derived.totalPoints > 0
      ? state.derived.totalPoints
      : (state.derived.contestMeta?.claimedScore || '0');
    const software = state.derived.contestMeta?.software || 'N/A';
    const club = state.derived.contestMeta?.club || 'N/A';

    const rows = [
      ['Callsign', `<strong>${stationCall || 'N/A'}</strong>`],
      ['Country', stationCountry],
      ['Locator', locator],
      ['Sunrise', 'N/A'],
      ['Sunset', 'N/A'],
      ['Contest', contest],
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
      ['Claimed score', `<strong>${formatNumberSh6(claimedScore)}</strong> pts`],
      ['Software', software],
      ['Sunspot number (SSN)', 'N/A'],
      ['Callsigns not found in SH6.master', `${formatNumberSh6(notInMaster)} (${notInMasterPct}%)`],
      ['Prefixes', formatNumberSh6(prefixes)],
      ['Club', club]
    ];
    const rowHtml = rows.map(([label, value], idx) => `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}"><td>${label}</td><td>${value}</td></tr>
      `).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;">
        <tr class="thc"><th>Parameter</th><th>Value</th></tr>
        ${rowHtml}
      </table>
    `;
  }

  function renderOperators() {
    if (!state.derived) return renderPlaceholder({ id: 'operators', title: 'Operators' });
    if (!state.derived.operatorsSummary || state.derived.operatorsSummary.length === 0) return '<p>No operator data in log.</p>';
    const cards = state.derived.operatorsSummary.map((o) => {
      const call = escapeHtml(o.op);
      const urlCall = encodeURIComponent(o.op || '');
      return `
        <div class="operator-card">
          <div class="np"></div>
          <i style="border-bottom:1px dashed" title="No file ${call.toLowerCase()}.jpg in 'images' folder.">(No photo)</i>
          <br/><br/>
          <b><a rel="nofollow" title="${call} at QRZ.COM" target="_blank" href="http://www.qrz.com/db/${urlCall}">${call}</a></b>
          <br/>&nbsp;<br/><br/>
        </div>
      `;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;">
        <tr><td><div class="operator-grid">${cards}</div></td></tr>
      </table>
    `;
  }

  function renderQsPerStation() {
    if (!state.derived) return renderPlaceholder({ id: 'qs_per_station', title: 'Qs per station' });
    const grouped = new Map();
    state.derived.allCallsList.forEach((c) => {
      if (!grouped.has(c.qsos)) grouped.set(c.qsos, []);
      grouped.get(c.qsos).push(c.call);
    });
    const rows = Array.from(grouped.entries()).sort((a, b) => b[0] - a[0]).map(([qsos, calls], idx) => {
      const stations = calls.length;
      const total = stations * qsos;
      const callLinks = calls.map((call) => {
        const safe = escapeHtml(call);
        return `<a href="#" class="log-call" data-call="${safe}">${safe}</a>`;
      }).join(' ');
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td><b>${formatNumberSh6(qsos)}</b></td>
        <td>${callLinks}</td>
        <td><b>${formatNumberSh6(stations)}</b></td>
        <td><b>${formatNumberSh6(total)}</b></td>
      </tr>
    `;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>QSOs</th><th>Callsigns</th><th>Stations</th><th>Total QSOs</th></tr>
        ${rows}
      </table>
    `;
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
      const link = `<a href="#" class="log-filter" data-band="${band}" data-mode="${mode}">${formatNumberSh6(count)}</a>`;
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
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td class="${bandClass(b.band)}"><b>${b.band}</b></td>
        ${renderModeCells(b.cw, cwPct, b.band, 'CW')}
        ${renderModeCells(b.digital, digPct, b.band, 'Digital')}
        ${renderModeCells(b.phone, phonePct, b.band, 'Phone')}
        ${renderModeCells(b.all, allPct, b.band, 'All')}
        <td>${formatNumberSh6(b.countries ?? '')}</td>
        <td>${formatNumberSh6(b.points ?? '')}</td>
        <td class="tac"><a href="#" class="map-link" data-scope="summary" data-key="${b.band}">map</a></td>
      </tr>
    `;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <colgroup><col width="6%" span="16"/></colgroup>
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
      </table>
    `;
  }

  function renderLog() {
    if (!state.qsoData) return renderPlaceholder({ id: 'log', title: 'Log' });
    const ctyLoaded = state.ctyTable && state.ctyTable.length > 0;
    const masterLoaded = state.masterSet && state.masterSet.size > 0;
    const search = (state.logSearch || '').trim().toUpperCase();
    const fieldFilter = (state.logFieldFilter || '').trim().toUpperCase();
    const bandFilter = (state.logBandFilter || '').trim().toUpperCase();
    const modeFilter = (state.logModeFilter || '').trim();
    const countryFilter = (state.logCountryFilter || '').trim().toUpperCase();
    const continentFilter = (state.logContinentFilter || '').trim().toUpperCase();
    const cqFilter = (state.logCqFilter || '').trim();
    const ituFilter = (state.logItuFilter || '').trim();
    const rangeFilter = state.logRange;
    const timeRange = state.logTimeRange;
    const headingRange = state.logHeadingRange;
    let filtered = state.qsoData.qsos;
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
    if (headingRange && Number.isFinite(headingRange.start) && Number.isFinite(headingRange.end)) {
      filtered = filtered.filter((q) => Number.isFinite(q.bearing) && q.bearing >= headingRange.start && q.bearing <= headingRange.end);
    }
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.logPageSize));
    const page = Math.min(state.logPage, totalPages - 1);
    if (page !== state.logPage) state.logPage = page;
    const start = page * state.logPageSize;
    const end = start + state.logPageSize;
    const rows = filtered.slice(start, end).map((q, idx) => {
      const call = escapeHtml(q.call || '');
      const op = escapeHtml(q.op || '');
      const country = escapeHtml(q.country || '');
      const grid = escapeHtml(q.grid || '');
      const mode = escapeHtml(q.mode || '');
      const band = escapeHtml(q.band || '');
      const cont = escapeHtml(q.continent || '');
      const flags = escapeHtml(`${q.inMaster === false ? 'NOT-IN-MASTER' : ''}${q.isDupe ? ' DUPE' : ''}`);
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td class="log-qso c1">${formatNumberSh6(q.qsoNumber || '')}</td>
        <td>${q.ts ? formatDateSh6(q.ts) : q.time}</td>
        <td class="${bandClass(q.band)}">${band}</td>
        <td class="${modeClass(q.mode)}">${mode}</td>
        <td class="${bandClass(q.band)}">${q.freq ?? ''}</td>
        <td class="tl">${call}</td>
        <td>${formatNumberSh6(q.rstSent || '')}</td>
        <td>${formatNumberSh6(q.rstRcvd || '')}</td>
        <td>${formatNumberSh6(q.stx || q.exchSent || '')}</td>
        <td>${formatNumberSh6(q.srx || q.exchRcvd || '')}</td>
        <td>${op}</td>
        <td class="tl">${country}</td>
        <td class="tac ${continentClass(q.continent)}">${cont}</td>
        <td>${q.cqZone || ''}</td>
        <td>${q.ituZone || ''}</td>
        <td class="tl">${grid}</td>
        <td class="tl">${flags}</td>
      </tr>
    `;
    }).join('');
    const note = `<p>Showing ${formatNumberSh6(start + 1)}-${formatNumberSh6(Math.min(end, filtered.length))} of ${formatNumberSh6(filtered.length)} QSOs (page ${page + 1} / ${totalPages}).</p>`;
    const dataNote = `<p>${ctyLoaded ? 'cty.dat loaded' : 'cty.dat missing or empty'}; ${masterLoaded ? 'MASTER.DTA loaded' : 'MASTER.DTA missing or empty'}.</p>`;
    const emptyNote = filtered.length ? '' : '<p>No QSOs match current filter.</p>';
    const filterNote = bandFilter || modeFilter || rangeFilter || countryFilter || timeRange || continentFilter || cqFilter || ituFilter || headingRange
      ? `<p class="log-filter-note">Filter: ${bandFilter || 'All bands'} ${modeFilter ? `/${modeFilter}` : ''} ${countryFilter ? ` ${countryFilter}` : ''} ${continentFilter ? ` ${continentFilter}` : ''} ${cqFilter ? ` CQ${cqFilter}` : ''} ${ituFilter ? ` ITU${ituFilter}` : ''} ${headingRange ? ` Bearing ${headingRange.start}-${headingRange.end}°` : ''} ${rangeFilter ? `(QSO #${formatNumberSh6(rangeFilter.start)}-${formatNumberSh6(rangeFilter.end)})` : ''} ${timeRange ? `(Time ${formatDateSh6(timeRange.startTs)} - ${formatDateSh6(timeRange.endTs)})` : ''} <span class="log-filter-hint">(click entries to drill down)</span> <a href="#" id="logClearFilters">clear filters</a></p>`
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
          <input id="logSearchInput" type="text" value="${search}">
          <input type="submit" value="Search">
          <button type="button" id="logSearchClear">Clear</button>
        </form>
        <div class="log-pages">Pages: ${pageLinks}</div>
      </div>
      <table class="mtc log-table" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Time</th><th>Band</th><th>Mode</th><th>Freq</th><th>Call</th><th>RST S</th><th>RST R</th><th>Exch Sent</th><th>Exch Rcvd</th><th>Op</th><th>Country</th><th>Cont.</th><th>CQ</th><th>ITU</th><th>Grid</th><th>Flags</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderLogExport() {
    if (!state.qsoData) return renderPlaceholder({ id: 'log', title: 'Log' });
    const rows = state.qsoData.qsos.map((q, idx) => {
      const call = escapeHtml(q.call || '');
      const op = escapeHtml(q.op || '');
      const country = escapeHtml(q.country || '');
      const grid = escapeHtml(q.grid || '');
      const mode = escapeHtml(q.mode || '');
      const band = escapeHtml(q.band || '');
      const cont = escapeHtml(q.continent || '');
      const flags = escapeHtml(`${q.inMaster === false ? 'NOT-IN-MASTER' : ''}${q.isDupe ? ' DUPE' : ''}`);
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td class="log-qso c1">${formatNumberSh6(q.qsoNumber || '')}</td>
        <td>${q.ts ? formatDateSh6(q.ts) : q.time}</td>
        <td class="${bandClass(q.band)}">${band}</td>
        <td class="${modeClass(q.mode)}">${mode}</td>
        <td class="${bandClass(q.band)}">${q.freq ?? ''}</td>
        <td class="tl">${call}</td>
        <td>${formatNumberSh6(q.rstSent || '')}</td>
        <td>${formatNumberSh6(q.rstRcvd || '')}</td>
        <td>${formatNumberSh6(q.stx || q.exchSent || '')}</td>
        <td>${formatNumberSh6(q.srx || q.exchRcvd || '')}</td>
        <td>${op}</td>
        <td class="tl">${country}</td>
        <td class="tac ${continentClass(q.continent)}">${cont}</td>
        <td>${q.cqZone || ''}</td>
        <td>${q.ituZone || ''}</td>
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

  function stripLinks(html) {
    return html.replace(/<a [^>]*>(.*?)<\/a>/g, '$1');
  }

  function renderReportExport(report) {
    if (report.id === 'log') return renderLogExport();
    const html = renderReport(report);
    return stripLinks(html);
  }

  function buildExportHtmlSections() {
    return reports.map((r) => `
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

  async function exportHtmlFile() {
    if (!state.qsoData) return;
    const styleText = await getStyleText();
    const body = `<div class="export-doc">${buildExportHtmlSections()}</div>`;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>SH6 Export</title><style>${styleText}</style></head><body>${body}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = buildExportFilename('html');
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPdf() {
    if (!state.qsoData) return;
    const styleText = await getStyleText();
    const body = `<div class="export-doc">${buildExportHtmlSections()}</div>`;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>SH6 Export</title><style>${styleText}</style></head><body>${body}</body></html>`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.document.title = buildExportFilename('pdf').replace(/\.pdf$/, '');
    win.focus();
    win.print();
  }

  function renderDupes() {
    if (!state.derived) return renderPlaceholder({ id: 'dupes', title: 'Dupes' });
    const rows = state.derived.dupes.map((q, idx) => `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${q.time}</td>
        <td class="${bandClass(q.band)}">${q.band}</td>
        <td class="${modeClass(q.mode)}">${q.mode}</td>
        <td><a href="#" class="log-call" data-call="${q.call}">${q.call}</a></td>
      </tr>
    `).join('');
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

  function renderCountries() {
    if (!state.derived) return renderPlaceholder({ id: 'countries', title: 'Countries' });
    const totalQsos = state.qsoData?.qsos.length || 0;
    const bandCols = ['160', '80', '40', '20', '15', '10'];
    const renderCount = (count, country, band, mode) => {
      if (!count) return '<td></td>';
      return `<td><a href="#" class="log-country-filter" data-country="${country}" data-band="${band || ''}" data-mode="${mode || ''}">${formatNumberSh6(count)}</a></td>`;
    };
    const rows = state.derived.countrySummary.map((c, idx) => {
      const pct = totalQsos ? ((c.qsos / totalQsos) * 100).toFixed(1) : '0.0';
      const bandCount = bandCols.filter((b) => c.bandCounts?.get(b)).length;
      const bandClass = `q${Math.min(6, Math.max(1, bandCount || 1))}`;
      const bandCells = bandCols.map((b) => renderCount(c.bandCounts?.get(b), c.country, b, ''));
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${formatNumberSh6(idx + 1)}</td>
        <td class="${continentClass(c.continent)}">${c.continent || ''}</td>
        <td>${c.prefixCode || ''}</td>
        <td class="tl"><a href="#" class="log-country" data-country="${c.country}">${c.country}</a></td>
        <td>${c.distanceAvg ? formatNumberSh6(c.distanceAvg.toFixed(0)) : ''}</td>
        ${renderCount(c.cw, c.country, '', 'CW')}
        ${renderCount(c.digital, c.country, '', 'Digital')}
        ${renderCount(c.phone, c.country, '', 'Phone')}
        ${bandCells.join('')}
        ${renderCount(c.qsos, c.country, '', '')}
        <td><i>${pct}</i></td>
        <td class="${bandClass}">${bandCount || ''}</td>
        <td class="tac"><a href="#" class="map-link" data-scope="country" data-key="${c.country}">map</a></td>
      </tr>
    `;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <colgroup><col width="40px" span="3" align="center"/><col align="left"/><col span="12" width="40px" align="center"/></colgroup>
        <tr class="thc">
          <th rowspan="2">#</th>
          <th rowspan="2">Cont.</th>
          <th colspan="2" rowspan="2">Country</th>
          <th rowspan="2">Distance, km</th>
          <th colspan="11">QSOs</th>
          <th rowspan="2">Bands</th>
          <th rowspan="2">Map</th>
        </tr>
        <tr class="thc">
          <th>CW</th><th>DIG</th><th>SSB</th>
          <th>160</th><th>80</th><th>40</th><th>20</th><th>15</th><th>10</th>
          <th>All</th><th>%</th>
        </tr>
        ${rows}
      </table>
    `;
  }

  function renderContinents() {
    if (!state.derived) return renderPlaceholder({ id: 'continents', title: 'Continents' });
    const bandCols = ['160', '80', '40', '20', '15', '10'];
    const totalQs = state.qsoData?.qsos?.length || 0;
    const rows = state.derived.continentSummary.map((c, idx) => {
      const pct = totalQs ? ((c.qsos / totalQs) * 100).toFixed(1) : '';
      const bandCells = bandCols.map((b) => {
        const count = c.bandCounts?.get(b) || 0;
        if (!count) return '<td></td>';
        return `<td><a href="#" class="log-continent-band" data-continent="${c.continent}" data-band="${b}">${formatNumberSh6(count)}</a></td>`;
      }).join('');
      const allLink = `<a href="#" class="log-continent" data-continent="${c.continent}">${formatNumberSh6(c.qsos)}</a>`;
      const cw = c.cw ? formatNumberSh6(c.cw) : '';
      const digital = c.digital ? formatNumberSh6(c.digital) : '';
      const phone = c.phone ? formatNumberSh6(c.phone) : '';
      const contKey = (c.continent || '').toUpperCase();
      const contClass = continentClass(contKey);
      return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td class="${contClass}">${contKey}</td>
          <td style="text-align:left">${continentLabel(contKey)}</td>
          ${bandCells}
          <td>${allLink}</td>
          <td><i>${pct}</i></td>
          <td>${cw}</td>
          <td>${digital}</td>
          <td>${phone}</td>
          <td class="tac"><a href="#" class="map-link" data-scope="continent" data-key="${contKey}">map</a></td>
        </tr>
      `;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <colgroup><col width="30px"/><col width="200px"/><col span="11" width="120px"/><col width="5%"/></colgroup>
        <tr class="thc"><th colspan="2" rowspan="2">Continent</th><th colspan="11">QSOs</th><th colspan="2" rowspan="2">Map</th></tr>
        <tr class="thc"><th>160</th><th>80</th><th>40</th><th>20</th><th>15</th><th>10</th><th>All</th><th>%</th><th>CW</th><th>Digital</th><th>Phone</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderCqZones() {
    if (!state.derived) return renderPlaceholder({ id: 'zones_cq', title: 'CQ zones' });
    const rows = state.derived.cqZoneSummary.map((z, idx) => `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td><a href="#" class="log-cq" data-cq="${z.cqZone}">${z.cqZone}</a></td>
        <td>${formatNumberSh6(z.countries)}</td>
        <td>${formatNumberSh6(z.qsos)}</td>
        <td class="tac"><a href="#" class="map-link" data-scope="cq_zone" data-key="${z.cqZone}">map</a></td>
      </tr>
    `).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Zone</th><th>Number of countries in this zone</th><th>QSOs</th><th>Map</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderItuZones() {
    if (!state.derived) return renderPlaceholder({ id: 'zones_itu', title: 'ITU zones' });
    const rows = state.derived.ituZoneSummary.map((z, idx) => `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td><a href="#" class="log-itu" data-itu="${z.ituZone}">${z.ituZone}</a></td>
        <td>${formatNumberSh6(z.countries)}</td>
        <td>${formatNumberSh6(z.qsos)}</td>
        <td class="tac"><a href="#" class="map-link" data-scope="itu_zone" data-key="${z.ituZone}">map</a></td>
      </tr>
    `).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Zone</th><th>Number of countries in this zone</th><th>QSOs</th><th>Map</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderQsByHourSheet() {
    if (!state.derived || !state.derived.hourSeries) return renderPlaceholder({ id: 'qs_by_hour_sheet', title: 'Qs by hour sheet' });
    const bandCols = ['160', '80', '40', '20', '15', '10'];
    const hourPoints = new Map();
    (state.qsoData?.qsos || []).forEach((q) => {
      if (typeof q.ts !== 'number' || !Number.isFinite(q.points)) return;
      const hourBucket = Math.floor(q.ts / 3600000);
      hourPoints.set(hourBucket, (hourPoints.get(hourBucket) || 0) + q.points);
    });
    const solarData = loadSolarData();
    let accum = 0;
    let lastDay = '';
    const rows = state.derived.hourSeries.map((h, idx) => {
      const hourTs = h.hour * 3600000;
      const day = formatDaySh6(hourTs);
      const hour = String(new Date(hourTs).getUTCHours()).padStart(2, '0');
      const dayLabel = day !== lastDay ? day : '';
      lastDay = day;
      const solar = getSolarForHour(solarData, h.hour * 3600000, {
        ssn: state.derived.contestMeta?.ssn || '',
        kIndex: state.derived.contestMeta?.kIndex || ''
      });
      const kDots = solar.kIndex ? '&#8226;'.repeat(Math.max(1, Math.min(5, Number(solar.kIndex)))) : '';
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
      return `<tr class="${cls}"><td>${dayLabel}</td><td><b>${hour}:00Z</b></td><td>${solar.ssn || ''}</td><td>${solar.kIndex || ''}</td><td align="left">${kDots}</td>${cells}<td>${allLink}</td><td>${formatNumberSh6(accum)}</td><td>${formatNumberSh6(pts)}</td><td>${avgPts}</td></tr>`;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc">
          <th rowspan="2">Day</th>
          <th rowspan="2">Hour</th>
          <th rowspan="2">SSN</th>
          <th colspan="2" rowspan="2">K<br/>index</th>
          <th colspan="10">QSOs</th>
        </tr>
        <tr class="thc">
          <th>160</th><th>80</th><th>40</th><th>20</th><th>15</th><th>10</th>
          <th>All</th><th>Accum.</th><th>Pts</th><th>Avg. Pts</th>
        </tr>
        ${rows}
      </table>
    `;
  }

  function renderRates() {
    if (!state.derived || !state.derived.hourSeries) return renderPlaceholder({ id: 'rates', title: 'Rates' });
    const qsos = state.qsoData?.qsos || [];
    const windows = [10, 20, 30, 60, 120];
    const rows = windows.map((mins, idx) => {
      const peak = computePeakWindow(qsos, mins);
      const perMin = peak.count ? (peak.count / mins).toFixed(1) : '0.0';
      const perHour = peak.count ? Math.round((peak.count * 60) / mins) : 0;
      const fromTime = peak.startTs ? formatDateSh6(peak.startTs) : 'N/A';
      const toTime = peak.endTs ? formatDateSh6(peak.endTs) : 'N/A';
      const rangeLink = (peak.startQso != null && peak.endQso != null)
        ? `<a href="#" class="log-range" data-start="${peak.startQso}" data-end="${peak.endQso}">${formatNumberSh6(peak.count)}</a>`
        : `${formatNumberSh6(peak.count)}`;
      return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td><b>${mins}</b></td>
          <td>${rangeLink}</td>
          <td>${perMin}</td>
          <td>${formatNumberSh6(perHour)}</td>
          <td>${fromTime}</td>
          <td>${formatNumberSh6(peak.startQso ?? '')}</td>
          <td>${toTime}</td>
          <td>${formatNumberSh6(peak.endQso ?? '')}</td>
        </tr>
      `;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <colgroup><col width="100px" span="4" align="center"/><col width="150px" align="center"/><col width="50px" align="center"/><col width="150px" align="center"/><col width="50px" align="center"/></colgroup>
        <tr class="thc">
          <th rowspan="2">Period, min.</th>
          <th rowspan="2">QSOs</th>
          <th rowspan="2">QSOs per<br/>minute</th>
          <th rowspan="2">QSOs per<br/>hour</th>
          <th colspan="2">From</th>
          <th colspan="2">To</th>
        </tr>
        <tr class="thc">
          <th>Time</th>
          <th>QSO #</th>
          <th>Time</th>
          <th>QSO #</th>
        </tr>
        ${rows}
      </table>
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

  function renderQsByMinute() {
    if (!state.derived || !state.derived.minuteSeries) return renderPlaceholder({ id: 'qs_by_minute', title: 'Qs by minute' });
    const minutesMap = new Map();
    state.derived.minuteSeries.forEach((m) => minutesMap.set(m.minute, m.qsos));
    const allMinutes = Array.from(minutesMap.keys());
    if (allMinutes.length === 0) return '<p>No QSOs to analyze.</p>';
    const minMinute = Math.min(...allMinutes);
    const maxMinute = Math.max(...allMinutes);
    const startHour = Math.floor(minMinute / 60);
    const endHour = Math.floor(maxMinute / 60);
    let lastDay = '';
    let rows = '';
    let rowIndex = 0;
    for (let hour = startHour; hour <= endHour; hour++) {
      const ts = hour * 3600000;
      const day = formatDaySh6(ts);
      const dayLabel = day !== lastDay ? day : '';
      lastDay = day;
      let cells = '';
      for (let m = 0; m < 60; m++) {
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
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
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

  function renderOneMinuteRates() {
    if (!state.derived || !state.derived.minuteSeries) return renderPlaceholder({ id: 'one_minute_rates', title: 'One minute rates' });
    const grouped = new Map();
    state.derived.minuteSeries.forEach((m) => {
      if (!grouped.has(m.qsos)) grouped.set(m.qsos, []);
      grouped.get(m.qsos).push(m.minute);
    });
    const rows = Array.from(grouped.entries()).sort((a, b) => b[0] - a[0]).map(([rate, minutes], idx) => {
      const labels = minutes.map((min) => `<a href="#" class="log-minute" data-minute="${min}">${formatDateSh6(min * 60000)}</a>`).join(' ');
      return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td style="text-align:center"><b>${rate}</b></td>
          <td class="minute-list">${labels}</td>
          <td>${formatNumberSh6(minutes.length)}</td>
        </tr>
      `;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Qs per<br/>minute</th><th>Minutes list</th><th>Total</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderPrefixes() {
    if (!state.derived) return renderPlaceholder({ id: 'prefixes', title: 'Prefixes' });
    if (!state.ctyTable || !state.ctyTable.length) return '<p>cty.dat not loaded.</p>';
    const totalPrefixes = state.derived.prefixSummary.length || 0;
    const countryPrefixMap = buildCountryPrefixMap();
    const groups = new Map();
    state.derived.prefixSummary.forEach((p) => {
      const entry = state.ctyTable.find((e) => e.prefix === p.prefix);
      if (!entry || !entry.country) return;
      const key = entry.country;
      if (!groups.has(key)) {
        groups.set(key, {
          country: entry.country,
          continent: entry.continent || '',
          id: countryPrefixMap.get(entry.country) || entry.prefix,
          prefixes: []
        });
      }
      groups.get(key).prefixes.push(p.prefix);
    });
    const rows = Array.from(groups.values())
      .sort((a, b) => a.id.localeCompare(b.id) || a.country.localeCompare(b.country))
      .map((g, idx) => {
        const count = g.prefixes.length;
        const pct = totalPrefixes ? ((count / totalPrefixes) * 100).toFixed(1) : '0.0';
        const list = g.prefixes.sort((a, b) => a.localeCompare(b)).join(' ');
        return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td>${formatNumberSh6(idx + 1)}</td>
          <td class="${continentClass(g.continent)}">${g.continent}</td>
          <td>${g.id}</td>
          <td class="tl">${g.country}</td>
          <td><b>${formatNumberSh6(count)}</b></td>
          <td><i>${pct}</i></td>
          <td class="tl">${list} </td>
        </tr>
      `;
      }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;">
        <colgroup><col width="40px" span="3" align="center"/><col width="200px" align="left"/><col span="2" width="40px" align="center"/></colgroup>
        <tr class="thc"><th>#</th><th>Cont.</th><th>ID</th><th>Country</th><th colspan="3">Prefixes</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderCallsignLength() {
    if (!state.derived) return renderPlaceholder({ id: 'callsign_length', title: 'Callsign length' });
    const totalCalls = state.derived.uniqueCallsCount || 0;
    const totalQsos = state.qsoData?.qsos.length || 0;
    const rows = state.derived.callsignLengthSummary.map((c, idx) => {
      const callPct = totalCalls ? ((c.callsigns / totalCalls) * 100).toFixed(2) : '0.00';
      const qsoPct = totalQsos ? ((c.qsos / totalQsos) * 100).toFixed(2) : '0.00';
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${c.len}</td>
        <td>${formatNumberSh6(c.callsigns)}</td>
        <td>${callPct}</td>
        <td>${formatNumberSh6(c.qsos)}</td>
        <td>${qsoPct}</td>
      </tr>
    `}).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Length</th><th>Callsigns</th><th>%</th><th>QSOs</th><th>%</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderCallsignStructure() {
    if (!state.derived) return renderPlaceholder({ id: 'callsign_structure', title: 'Callsign structure' });
    const totalCalls = state.derived.uniqueCallsCount || 0;
    const totalQsos = state.qsoData?.qsos.length || 0;
    const rows = state.derived.structureSummary.map((s, idx) => {
      const callPct = totalCalls ? ((s.callsigns / totalCalls) * 100).toFixed(2) : '0.00';
      const qsoPct = totalQsos ? ((s.qsos / totalQsos) * 100).toFixed(2) : '0.00';
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${idx + 1}</td>
        <td>${s.struct}</td>
        <td>${s.example || ''}</td>
        <td>${formatNumberSh6(s.callsigns)}</td>
        <td>${callPct}</td>
        <td>${formatNumberSh6(s.qsos)}</td>
        <td>${qsoPct}</td>
      </tr>
    `}).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Callsign structure, C - char, D - digit</th><th>Example</th><th>Callsigns</th><th>%</th><th>QSOs</th><th>%</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderDistance() {
    if (!state.derived || !state.derived.distanceSummary) return renderPlaceholder({ id: 'distance', title: 'Distance' });
    const ds = state.derived.distanceSummary;
    if (!ds.count) return '<p>No distance data (station or remote locations missing).</p>';
    const buckets = ds.buckets.map((b, idx) => {
      const pct = ds.count ? ((b.count / ds.count) * 100).toFixed(2) : '0.00';
      const cls = idx % 2 === 0 ? 'td1' : 'td0';
      return `<tr class="${cls}"><td>${formatNumberSh6(b.range)} km</td><td>${formatNumberSh6(b.count)}</td><td>${pct}</td><td class="tac"><a href="#" class="map-link" data-scope="distance" data-key="${b.range}">map</a></td></tr>`;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Distance, km</th><th>QSOs</th><th>%</th><th>Map</th></tr>
        ${buckets}
      </table>
    `;
  }

  function renderBeamHeading() {
    if (!state.derived || !state.derived.headingSummary) return renderPlaceholder({ id: 'beam_heading', title: 'Beam heading' });
    const bands = ['160', '80', '40', '20', '15', '10'];
    const total = state.derived.headingSummary.reduce((sum, h) => sum + h.count, 0);
    const maxCount = state.derived.headingSummary.reduce((max, h) => Math.max(max, h.count), 1);
    let rows = '';
    state.derived.headingSummary.forEach((h, idx) => {
      const pct = total ? ((h.count / total) * 100).toFixed(1) : '0.0';
      const cls = idx % 2 === 0 ? 'td1' : 'td0';
      const bandCells = bands.map((b) => {
        const count = h.bands?.get(b) || 0;
        if (!count) return '<td></td>';
        return `<td><a href="#" class="log-heading-band" data-heading="${h.start}" data-band="${b}">${formatNumberSh6(count)}</a></td>`;
      }).join('');
      const barWidth = Math.round((h.count / maxCount) * 100);
      rows += `
        <tr class="${cls}">
          <td>${h.sector}</td>
          ${bandCells}
          <td><a href="#" class="log-heading" data-heading="${h.start}">${formatNumberSh6(h.count)}</a></td>
          <td><i>${pct}</i></td>
          <td style="text-align:left"><div class="sum" style="width:${barWidth}%" /></td>
          <td class="tac"><a href="#" class="map-link" data-scope="heading" data-key="${h.start}">map</a></td>
        </tr>
      `;
      if (h.start % 90 === 80) {
        rows += '<tr><td colspan="11"><hr/></td></tr>';
      }
    });
    if (!rows) return '<p>No heading data.</p>';
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <colgroup><col width="100px" align="center"/><col span="9" width="60px"/><col width="5%"/></colgroup>
        <tr class="thc"><th rowspan="2">Heading, &#176;</th><th colspan="7">QSOs</th><th colspan="2" rowspan="2">%</th><th colspan="2" rowspan="2">Map</th></tr>
        <tr class="thc"><th>160</th><th>80</th><th>40</th><th>20</th><th>15</th><th>10</th><th>All</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderMapView() {
    const ctx = state.mapContext || { scope: '', key: '' };
    const title = ctx.key ? `${ctx.scope}: ${ctx.key}` : ctx.scope || 'Map';
    const kmzLinks = Object.entries(state.kmzUrls || {}).map(([band, url]) => {
      return `<li><a href="${url}" class="kmz-link" data-band="${band}" download="qsos_${band}m.kmz">Download ${band}m KMZ</a></li>`;
    }).join('');
    const kmzBlock = kmzLinks
      ? `<ul>${kmzLinks}</ul>`
      : '<p>No KMZ files generated yet. Open the KMZ files report to generate them.</p>';
    return `
      <div class="mtc">
        <div class="gradient">&nbsp;Map</div>
        <p><b>Selected:</b> ${title || 'Map'}</p>
        <div class="map-controls">
          <label><input type="checkbox" id="mapShowPoints" checked> Points</label>
          <label style="margin-left:10px;"><input type="checkbox" id="mapShowLines" checked> Lines</label>
        </div>
        <div id="map"></div>
        <p>Use KMZ downloads below for full path visualization.</p>
        ${kmzBlock}
        <p><button id="mapBack" type="button">Back</button></p>
      </div>
    `;
  }

  function renderAllCallsigns() {
    if (!state.derived) return renderPlaceholder({ id: 'all_callsigns', title: 'All callsigns' });
    const rows = state.derived.allCallsList.slice(0, 2000).map((c, idx) => `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${formatNumberSh6(idx + 1)}</td>
        <td><a href="#" class="log-call" data-call="${c.call}">${c.call}</a></td>
        <td>${formatNumberSh6(c.qsos)}</td>
      </tr>
    `).join('');
    const note = state.derived.allCallsList.length > 2000 ? `<p>Showing first 2000 of ${state.derived.allCallsList.length} calls.</p>` : '';
    return `
      ${note}
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Callsign</th><th>QSOs</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderNotInMaster() {
    if (!state.derived) return renderPlaceholder({ id: 'not_in_master', title: 'Not in master' });
    if (!state.masterSet || state.masterSet.size === 0) return '<p>Master file not loaded.</p>';
    const count = state.derived.notInMasterList.length;
    const note = count === 0 ? '<p>All calls found in master.</p>' : '';
    const grouped = new Map();
    state.derived.notInMasterList.forEach((c) => {
      if (!grouped.has(c.qsos)) grouped.set(c.qsos, []);
      grouped.get(c.qsos).push(c.call);
    });
    const rows = Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]).map(([qsos, calls], idx) => {
      const callLinks = calls.map((call) => `<a href="#" class="log-call" data-call="${call}">${call}</a>`).join(' ');
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td><b>${formatNumberSh6(qsos)}</b></td>
        <td>${callLinks}</td>
        <td><b>${formatNumberSh6(calls.length)}</b></td>
      </tr>
    `;
    }).join('');
    return `
      <p>Calls not found in MASTER.DTA: ${formatNumberSh6(count)}</p>
      ${note}
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>QSOs</th><th>Callsigns</th><th>Total</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderCountriesByTime(bandFilter) {
    if (!state.derived) return renderPlaceholder({ id: 'countries_by_time', title: 'Countries by time' });
    const qsos = state.qsoData?.qsos || [];
    const map = buildCountryTimeBuckets(qsos, bandFilter);
    if (map.size === 0) return '<p>No data.</p>';
    const startHour = 0;
    const endHour = 23;
    const countryInfo = new Map();
    state.derived.countrySummary.forEach((c) => {
      countryInfo.set(c.country, { continent: c.continent, prefixCode: c.prefixCode });
    });
    const continentsOrder = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC'];
    const groups = new Map();
    Array.from(map.entries()).forEach(([country, data]) => {
      const info = countryInfo.get(country) || {};
      const code = (info.continent || data.continent || '').trim().toUpperCase();
      const contKey = continentsOrder.includes(code) ? code : (code || 'Other');
      const prefixCode = info.prefixCode || data.prefix || '';
      const bucketsByHour = new Map();
      data.buckets.forEach((counts, hourBucket) => {
        const hourOfDay = hourBucket % 24;
        if (!bucketsByHour.has(hourOfDay)) bucketsByHour.set(hourOfDay, [0, 0, 0, 0]);
        const target = bucketsByHour.get(hourOfDay);
        for (let i = 0; i < 4; i++) target[i] += counts[i] || 0;
      });
      const entry = { country, data: { ...data, continent: contKey, prefix: prefixCode } };
      entry.data.buckets = bucketsByHour;
      if (!groups.has(contKey)) groups.set(contKey, []);
      groups.get(contKey).push(entry);
    });
    let rows = '';
    let rowCount = 0;
    continentsOrder.concat(['Other']).forEach((contKey) => {
      const list = groups.get(contKey);
      if (!list || list.length === 0) return;
      rows += `<tr class="thc"><th colspan="3" class="${continentClass(contKey)}"><a href="#" class="log-continent" data-continent="${contKey}">${continentLabel(contKey)}</a></th><th>${bandFilter ? `${bandFilter} m Qs` : 'All m Qs'}</th>${hourHeaders(startHour, endHour).join('')}</tr>`;
      rows += list.sort((a, b) => a.country.localeCompare(b.country)).map((entry, idx) => {
        let cells = '';
        for (let h = startHour; h <= endHour; h++) {
          const counts = entry.data.buckets.get(h) || [0, 0, 0, 0];
          counts.forEach((count, qi) => {
            const cls = minuteCountClass(count);
            const dal = qi === 0 ? 'dal' : '';
            cells += `<td class="${dal} ${cls}"></td>`;
          });
        }
        const rowCls = idx % 2 === 0 ? 'td1' : 'td0';
        rowCount += 1;
        return `
          <tr class="${rowCls}">
            <td>${formatNumberSh6(idx + 1)}</td>
            <td>${entry.data.prefix}</td>
            <td><a href="#" class="log-country" data-country="${entry.data.name}">${entry.data.name}</a></td>
            <td>${formatNumberSh6(entry.data.total)}</td>
            ${cells}
          </tr>
        `;
      }).join('');
    });
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

  function hourHeaders(startHour, endHour) {
    const headers = [];
    for (let h = startHour; h <= endHour; h++) {
      const label = String(h % 24).padStart(2, '0');
      headers.push(`<th colspan="4">${label}</th>`);
    }
    return headers;
  }

  function renderPossibleErrors() {
    if (!state.derived) return renderPlaceholder({ id: 'possible_errors', title: 'Possible errors' });
    if (!state.derived.possibleErrors || !state.derived.possibleErrors.length) return '<p>No possible errors detected.</p>';
    const rows = state.derived.possibleErrors.map((e, idx) => {
      const call = e.q.call || '';
      const sugg = call ? suggestMasterMatches(call, state.masterSet, 5).join(' ') : e.reason;
      return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td>${idx + 1}</td>
          <td>${call ? `<a href="#" class="log-call" data-call="${call}">${call}</a>` : ''}</td>
          <td>${sugg}</td>
        </tr>
      `;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Callsign in log</th><th>Callsign(s) in master database</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderComments() {
    if (!state.derived) return renderPlaceholder({ id: 'comments', title: 'Comments' });
    if (!state.derived.comments || !state.derived.comments.length) return '<p>No comments found in log.</p>';
    const items = state.derived.comments.map((c) => `<li>${c}</li>`).join('');
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
    const bands = ['160', '80', '40', '20', '15', '10'];
    const urls = buildKmzUrls(bands);
    const rows = bands.map((b, idx) => {
      const url = urls[b];
      const label = url ? `${b}_kmz.kmz` : 'N/A';
      return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td>${b}</td>
          <td>${url ? `<a href="${url}" download="${b}_kmz.kmz">${label}</a>` : label}</td>
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
      const kml = buildKmlForBand(qsos, band);
      if (!kml) return;
      const kmz = buildKmzFromKml(`${band}.kml`, kml);
      const blob = new Blob([kmz], { type: 'application/vnd.google-earth.kmz' });
      const url = URL.createObjectURL(blob);
      state.kmzUrls[band] = url;
      urls[band] = url;
    });
    return urls;
  }

  function filterQsosForMap(ctx) {
    let qsos = state.qsoData?.qsos || [];
    if (!ctx) return qsos;
    const scope = ctx.scope || '';
    const key = ctx.key || '';
    if (scope === 'country' && key) {
      qsos = qsos.filter((q) => q.country === key);
    } else if (scope === 'continent' && key) {
      qsos = qsos.filter((q) => q.continent === key);
    } else if (scope === 'cq_zone' && key) {
      qsos = qsos.filter((q) => String(q.cqZone || '') === String(key));
    } else if (scope === 'itu_zone' && key) {
      qsos = qsos.filter((q) => String(q.ituZone || '') === String(key));
    } else if (scope === 'summary' && key) {
      qsos = qsos.filter((q) => q.band === key);
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

  function initLeafletMap(ctx) {
    if (!window.L) return;
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    mapEl.innerHTML = '';
    const map = L.map(mapEl, { worldCopyJump: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 6,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const showPoints = document.getElementById('mapShowPoints');
    const showLines = document.getElementById('mapShowLines');

    const station = state.derived?.station;
    const qsos = filterQsosForMap(ctx);
    const markers = [];
    const lines = [];

    if (station && station.lat != null && station.lon != null) {
      const stationMarker = L.circleMarker([station.lat, station.lon], { radius: 6, color: '#5266df', fillColor: '#5266df', fillOpacity: 0.9 });
      stationMarker.bindPopup(`Station: ${escapeHtml(state.derived?.contestMeta?.stationCallsign || '')}`);
      markers.push(stationMarker);
    }

    qsos.forEach((q) => {
      const prefix = lookupPrefix(q.call);
      const remote = deriveRemoteLatLon(q, prefix);
      if (!remote) return;
      const marker = L.circleMarker([remote.lat, remote.lon], { radius: 3, color: '#cc0000', fillColor: '#cc0000', fillOpacity: 0.8 });
      marker.bindPopup(`${escapeHtml(q.call || '')} ${escapeHtml(q.band || '')} ${escapeHtml(q.mode || '')}`);
      markers.push(marker);
      if (station && station.lat != null && station.lon != null) {
        const distance = haversineKm(station.lat, station.lon, remote.lat, remote.lon);
        const segments = Math.min(64, Math.max(8, Math.round(distance / 400)));
        const linePoints = greatCirclePoints(station.lat, station.lon, remote.lat, remote.lon, segments);
        const line = L.polyline(linePoints, { color: '#555555', weight: 1, opacity: 0.6 });
        lines.push(line);
      }
    });

    const markerLayer = L.layerGroup(markers);
    const lineLayer = L.layerGroup(lines);

    if (showPoints && showPoints.checked) markerLayer.addTo(map);
    if (showLines && showLines.checked) lineLayer.addTo(map);

    const allLatLngs = markers.map((m) => m.getLatLng());
    if (allLatLngs.length) {
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds.pad(0.2));
    } else {
      map.setView([20, 0], 2);
    }

    if (showPoints) {
      showPoints.addEventListener('change', () => {
        if (showPoints.checked) markerLayer.addTo(map);
        else map.removeLayer(markerLayer);
      });
    }
    if (showLines) {
      showLines.addEventListener('change', () => {
        if (showLines.checked) lineLayer.addTo(map);
        else map.removeLayer(lineLayer);
      });
    }
  }

  function buildKmlForBand(qsos, band) {
    if (!qsos || qsos.length === 0) return null;
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
      if (band && q.band !== band) return;
      const prefix = lookupPrefix(q.call);
      const remote = deriveRemoteLatLon(q, prefix);
      if (!remote) return;
      const name = q.call || 'QSO';
      const desc = `${q.ts ? formatDateSh6(q.ts) : q.time} ${q.band || ''} ${q.mode || ''}`;
      placemarks.push(`
        <Placemark>
          <name>${name}</name>
          <description>${desc}</description>
          <Point><coordinates>${remote.lon},${remote.lat},0</coordinates></Point>
        </Placemark>
      `);
    });
    if (!placemarks.length) return null;
    return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${band}m QSOs</name>
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

  function renderSun() {
    return `
      <p>Solar data (SSN/K-index) can be provided via localStorage.</p>
      <p>Set <code>sh6_solar_data</code> to JSON like:</p>
      <pre>{
  "hours":[
    {"hour": 482316, "ssn": 152, "kIndex": 3},
    {"hour": 482317, "ssn": 152, "kIndex": 3}
  ]
}</pre>
      <p>Hour value is <code>Math.floor(Date.UTC(...) / 3600000)</code>.</p>
    `;
  }

  function renderPassedQsos() {
    const qsos = state.qsoData?.qsos || [];
    const passed = qsos.filter((q) => (q.raw?.APP_N1MM_ISRUNQSO === '0' || q.raw?.APP_N1MM_ISRUNQSO === 'False'));
    if (!passed.length) return '<p>No passed QSOs detected.</p>';
    const rows = passed.map((q, idx) => {
      const number = q.qsoNumber || '';
      const numberCell = number ? `<a href="#" class="log-range" data-start="${number}" data-end="${number}">${formatNumberSh6(number)}</a>` : '';
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td>${numberCell}</td>
        <td>${q.ts ? formatDateSh6(q.ts) : q.time}</td>
        <td><a href="#" class="log-call" data-call="${q.call}">${q.call}</a></td>
        <td class="${bandClass(q.band)}">${q.band}</td>
        <td class="${modeClass(q.mode)}">${q.mode}</td>
      </tr>
    `;
    }).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Time</th><th>Call</th><th>Band</th><th>Mode</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderAppInfo() {
    const rows = [
      ['Report generator', `SH6 ${APP_VERSION}`],
      ['Generated', formatDateSh6(Date.now())],
      ['Log file', state.logFile ? state.logFile.name : 'N/A'],
      ['QSOs parsed', state.qsoData ? formatNumberSh6(state.qsoData.qsos.length) : '0'],
      ['Contest', state.derived?.contestMeta?.contestId || 'N/A'],
      ['Station callsign', state.derived?.contestMeta?.stationCallsign || 'N/A'],
      ['cty.dat', state.ctyStatus || 'pending'],
      ['MASTER.DTA', state.masterStatus || 'pending']
    ];
    const rowHtml = rows.map(([label, value], idx) => `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}"><td>${label}</td><td>${value}</td></tr>
    `).join('');
    return `
      <table class="mtc" style="margin-top:5px;margin-bottom:10px;">
        <tr class="thc"><th>Parameter</th><th>Value</th></tr>
        ${rowHtml}
      </table>
    `;
  }

  function renderBars(data, labelField, valueField) {
    const max = Math.max(...data.map((d) => d[valueField] || 0), 1);
    return data.map((d) => {
      const w = Math.max(4, (d[valueField] / max) * 200);
      return `
        <div class="bar-row">
          <div class="bar-label" title="${d[labelField]}">${d[labelField]}</div>
          <div class="bar" style="width:${w}px"></div>
          <div>${d[valueField]}</div>
        </div>
      `;
    }).join('');
  }

  function renderChartsIndex() {
    return `
      <p>Select a chart from the sidebar (Qs by band, Top countries, Continents, Frequencies, Beam heading, Beam heading by hour).</p>
    `;
  }

  function renderChartQsByBand() {
    if (!state.derived) return renderPlaceholder({ id: 'charts_qs_by_band', title: 'Qs by band' });
    return `<div class="mtc"><div class="gradient">&nbsp;Qs by band</div>${renderBars(state.derived.bandSummary, 'band', 'qsos')}</div>`;
  }

  function renderChartTop10Countries() {
    if (!state.derived) return renderPlaceholder({ id: 'charts_top_10_countries', title: 'Top 10 countries' });
    const top = state.derived.countrySummary.slice(0, 10);
    return `<div class="mtc"><div class="gradient">&nbsp;Top 10 countries</div>${renderBars(top, 'country', 'qsos')}</div>`;
  }

  function renderChartContinents() {
    if (!state.derived) return renderPlaceholder({ id: 'charts_continents', title: 'Continents chart' });
    return `<div class="mtc"><div class="gradient">&nbsp;Continents</div>${renderBars(state.derived.continentSummary, 'continent', 'qsos')}</div>`;
  }

  function renderChartFrequencies() {
    if (!state.derived || !state.derived.frequencySummary) return renderPlaceholder({ id: 'charts_frequencies', title: 'Frequencies' });
    const data = state.derived.frequencySummary.map((f) => ({ label: f.freq.toFixed(1), value: f.count }));
    return `<div class="mtc"><div class="gradient">&nbsp;Frequencies</div>${renderBars(data, 'label', 'value')}</div>`;
  }

  function renderChartBeamHeading() {
    if (!state.derived || !state.derived.headingSummary) return renderPlaceholder({ id: 'charts_beam_heading', title: 'Beam heading' });
    const data = state.derived.headingSummary.map((h) => ({ label: h.sector, value: h.count }));
    return `<div class="mtc"><div class="gradient">&nbsp;Beam heading</div>${renderBars(data, 'label', 'value')}</div>`;
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
    const data = state.derived.hourSeries.map((h) => {
      const ts = h.hour * 3600000;
      const hourLabel = formatDateSh6(ts);
      const val = bandFilter ? (h.bands[bandFilter] || 0) : h.qsos;
      return { label: hourLabel, value: val };
    });
    const bars = renderBars(data, 'label', 'value');
    const subtitle = bandFilter ? `Band ${bandFilter}` : 'All bands';
    return `
      <div class="mtc">
        <div class="gradient">&nbsp;Qs by hour</div>
        <p>${subtitle}</p>
        ${bars}
      </div>
    `;
  }

  function renderReport(report) {
    return withBandContext(report.id, () => {
      switch (report.id) {
        case 'main': return renderMain();
        case 'summary': return renderSummary();
        case 'log': return renderLog();
        case 'dupes': return renderDupes();
        case 'operators': return renderOperators();
        case 'qs_per_station': return renderQsPerStation();
        case 'countries': return renderCountries();
        case 'continents': return renderContinents();
        case 'zones_cq': return renderCqZones();
        case 'zones_itu': return renderItuZones();
        case 'qs_by_hour_sheet': return renderQsByHourSheet();
        case 'graphs_qs_by_hour': return renderGraphsQsByHour(null);
        case 'graphs_qs_by_hour_10': return renderGraphsQsByHour('10');
        case 'graphs_qs_by_hour_15': return renderGraphsQsByHour('15');
        case 'graphs_qs_by_hour_20': return renderGraphsQsByHour('20');
        case 'graphs_qs_by_hour_40': return renderGraphsQsByHour('40');
        case 'graphs_qs_by_hour_80': return renderGraphsQsByHour('80');
        case 'graphs_qs_by_hour_160': return renderGraphsQsByHour('160');
        case 'rates': return renderRates();
        case 'qs_by_minute': return renderQsByMinute();
        case 'one_minute_rates': return renderOneMinuteRates();
        case 'prefixes': return renderPrefixes();
        case 'callsign_length': return renderCallsignLength();
        case 'callsign_structure': return renderCallsignStructure();
        case 'distance': return renderDistance();
        case 'beam_heading': return renderBeamHeading();
        case 'breaks': return renderBreaks();
        case 'all_callsigns': return renderAllCallsigns();
        case 'not_in_master': return renderNotInMaster();
        case 'countries_by_time': return renderCountriesByTime(null);
        case 'countries_by_time_10': return renderCountriesByTime('10');
        case 'countries_by_time_15': return renderCountriesByTime('15');
        case 'countries_by_time_20': return renderCountriesByTime('20');
        case 'countries_by_time_40': return renderCountriesByTime('40');
        case 'countries_by_time_80': return renderCountriesByTime('80');
        case 'countries_by_time_160': return renderCountriesByTime('160');
        case 'possible_errors': return renderPossibleErrors();
        case 'comments': return renderComments();
        case 'charts': return renderChartsIndex();
        case 'charts_qs_by_band': return renderChartQsByBand();
        case 'charts_top_10_countries': return renderChartTop10Countries();
        case 'charts_continents': return renderChartContinents();
        case 'charts_frequencies': return renderChartFrequencies();
        case 'charts_beam_heading': return renderChartBeamHeading();
        case 'charts_beam_heading_by_hour': return renderChartBeamHeadingByHour();
        case 'fields_map': return renderFieldsMap();
        case 'kmz_files': return renderKmzFiles();
        case 'sun': return renderSun();
        case 'passed_qsos': return renderPassedQsos();
        case 'sh6_info': return renderAppInfo();
        default: return renderPlaceholder(report);
      }
    });
  }

  function bindReportInteractions(reportId) {
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
          dom.viewContainer.innerHTML = renderLog();
          bindReportInteractions('log');
        }
      });
      if (next) next.addEventListener('click', () => {
        const search = (state.logSearch || '').trim().toUpperCase();
        const fieldFilter = (state.logFieldFilter || '').trim().toUpperCase();
        const bandFilter = (state.logBandFilter || '').trim().toUpperCase();
        const modeFilter = (state.logModeFilter || '').trim();
        const countryFilter = (state.logCountryFilter || '').trim().toUpperCase();
        const continentFilter = (state.logContinentFilter || '').trim().toUpperCase();
        const cqFilter = (state.logCqFilter || '').trim();
        const ituFilter = (state.logItuFilter || '').trim();
        const rangeFilter = state.logRange;
        const timeRange = state.logTimeRange;
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
        const filteredCount = filtered.length;
        const totalPages = Math.max(1, Math.ceil(filteredCount / state.logPageSize));
        if (state.logPage < totalPages - 1) {
          state.logPage += 1;
          dom.viewContainer.innerHTML = renderLog();
          bindReportInteractions('log');
        }
      });
      pageLinks.forEach((link) => {
        link.addEventListener('click', (evt) => {
          evt.preventDefault();
          const page = parseInt(link.dataset.page, 10);
          if (Number.isFinite(page)) {
            state.logPage = page;
            dom.viewContainer.innerHTML = renderLog();
            bindReportInteractions('log');
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
          state.logCountryFilter = '';
          state.logContinentFilter = '';
          state.logCqFilter = '';
          state.logItuFilter = '';
          state.logRange = null;
          state.logTimeRange = null;
          state.logHeadingRange = null;
          state.logPage = 0;
          dom.viewContainer.innerHTML = renderLog();
          bindReportInteractions('log');
        });
      }
      if (searchClear) {
        searchClear.addEventListener('click', () => {
          state.logSearch = '';
          state.logFieldFilter = '';
          state.logBandFilter = '';
          state.logModeFilter = '';
          state.logCountryFilter = '';
          state.logContinentFilter = '';
          state.logCqFilter = '';
          state.logItuFilter = '';
          state.logRange = null;
          state.logTimeRange = null;
          state.logHeadingRange = null;
          state.logPage = 0;
          dom.viewContainer.innerHTML = renderLog();
          bindReportInteractions('log');
        });
      }
      if (clearFilters) {
        clearFilters.addEventListener('click', (evt) => {
          evt.preventDefault();
          state.logSearch = '';
          state.logFieldFilter = '';
          state.logBandFilter = '';
          state.logModeFilter = '';
          state.logCountryFilter = '';
          state.logContinentFilter = '';
          state.logCqFilter = '';
          state.logItuFilter = '';
          state.logRange = null;
          state.logTimeRange = null;
          state.logHeadingRange = null;
          state.logPage = 0;
          dom.viewContainer.innerHTML = renderLog();
          bindReportInteractions('log');
        });
      }
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
          state.logCountryFilter = '';
          state.logContinentFilter = '';
          state.logCqFilter = '';
          state.logItuFilter = '';
          state.logRange = null;
          state.logTimeRange = null;
          state.logHeadingRange = null;
          state.logPage = 0;
          dom.viewContainer.innerHTML = renderLog();
          bindReportInteractions('log');
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
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
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
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
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
        state.mapContext = { scope, key };
        dom.viewTitle.textContent = 'Map';
        dom.viewContainer.innerHTML = renderMapView();
        bindReportInteractions('map_view');
      });
    });

    const kmzLinks = document.querySelectorAll('.kmz-link');
    kmzLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const band = link.dataset.band || '';
        const mapSvg = document.getElementById('mapSvg');
        if (mapSvg) {
          const label = mapSvg.querySelector('text');
          if (label) label.textContent = band ? `Map preview (KMZ ${band}m selected)` : 'Map preview (placeholder)';
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
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
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
        state.logCountryFilter = country;
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
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
        state.logCountryFilter = '';
        state.logContinentFilter = continent;
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
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
        state.logCountryFilter = '';
        state.logContinentFilter = continent;
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
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
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
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
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
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
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = { startTs, endTs };
        state.logHeadingRange = null;
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
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = { startTs, endTs };
        state.logHeadingRange = null;
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
        state.logCountryFilter = country;
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
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
        if (!cq) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = '';
        state.logModeFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = cq;
        state.logItuFilter = '';
        state.logTimeRange = null;
        state.logHeadingRange = null;
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
        if (!itu) return;
        state.logRange = null;
        state.logSearch = '';
        state.logFieldFilter = '';
        state.logBandFilter = '';
        state.logModeFilter = '';
        state.logCountryFilter = '';
        state.logContinentFilter = '';
        state.logCqFilter = '';
        state.logItuFilter = itu;
        state.logTimeRange = null;
        state.logHeadingRange = null;
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
      const slider = document.getElementById('breakThreshold');
      const value = document.getElementById('breakThresholdValue');
      if (slider && value) {
        slider.addEventListener('input', () => {
          state.breakThreshold = Number(slider.value) || 60;
          value.textContent = String(state.breakThreshold);
        });
        slider.addEventListener('change', () => {
          dom.viewContainer.innerHTML = renderBreaks();
          bindReportInteractions('breaks');
        });
      }
    }
  }

  function renderBreaks() {
    if (!state.derived || !state.derived.minuteSeries) return renderPlaceholder({ id: 'breaks', title: 'Break time' });
    const threshold = state.breakThreshold || 60;
    const minutesMap = new Map(state.derived.minuteSeries.map((m) => [m.minute, m.qsos]));
    const breakSummary = computeBreakSummary(minutesMap, threshold);
    const slider = `
      <div class="break-controls">
        Break threshold (minutes):
        <input type="range" id="breakThreshold" min="10" max="60" step="1" value="${threshold}">
        <span id="breakThresholdValue">${threshold}</span>
      </div>
    `;
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

  function setupRepoSearch() {
    if (!dom.repoSearch || !dom.repoResults || !dom.repoStatus) return;
    let timer = null;
    const shardCache = new Map();
    let sqlLoader = null;
    let archiveRows = [];
    let searchSeq = 0;

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

    const renderResultsTree = () => {
      if (!archiveRows.length) {
        dom.repoResults.innerHTML = '';
        dom.repoStatus.textContent = 'No matches found in the archive.';
        return;
      }
      const tree = new Map();
      archiveRows.forEach((row) => {
        const contest = normalizeLabel(row.contest);
        const year = Number.isFinite(row.year) ? String(row.year) : '';
        const mode = normalizeLabel(row.mode);
        const season = normalizeLabel(row.season);
        if (!tree.has(contest)) tree.set(contest, new Map());
        const yearMap = tree.get(contest);
        if (!yearMap.has(year)) yearMap.set(year, new Map());
        const modeMap = yearMap.get(year);
        const subKey = [mode, season].filter(Boolean).join(' • ');
        if (!modeMap.has(subKey)) modeMap.set(subKey, []);
        modeMap.get(subKey).push(row);
      });
      const chunks = ['<div class="repo-tree">'];
      const contestCount = tree.size;
      dom.repoStatus.textContent = `Select a log to load. Found ${archiveRows.length} logs in ${contestCount} contests.`;
      tree.forEach((yearMap, contest) => {
        const hasContest = Boolean(contest);
        if (hasContest) chunks.push(`<details class="repo-contest"><summary>${contest}</summary>`);
        yearMap.forEach((modeMap, year) => {
          const hasYear = Boolean(year);
          if (hasYear) chunks.push(`<details class="repo-year"><summary>${year}</summary>`);
          modeMap.forEach((rows, subKey) => {
            const hasSub = Boolean(subKey);
            if (hasSub) chunks.push(`<details class="repo-subcat"><summary>${subKey}</summary>`);
            rows.forEach((row) => {
              const label = row.path.split('/').pop();
              chunks.push(`<button type="button" class="repo-leaf" data-path="${row.path}">${label}</button>`);
            });
            if (hasSub) chunks.push(`</details>`);
          });
          if (hasYear) chunks.push(`</details>`);
        });
        if (hasContest) chunks.push(`</details>`);
      });
      chunks.push('</div>');
      dom.repoResults.innerHTML = chunks.join('');
    };

    const renderResults = (rows) => {
      archiveRows = sortResults(rows);
      renderResultsTree();
    };

    const searchArchive = async (input) => {
      const callsign = normalizeCallsign(input);
      if (callsign.length < 3) {
        dom.repoResults.innerHTML = '';
        dom.repoStatus.textContent = '';
        return;
      }
      const seq = ++searchSeq;
      dom.repoStatus.textContent = `Searching archive for ${callsign}...`;
      const shardUrls = getShardUrls(callsign);
      try {
        const shardLabel = shardUrls[0].split('/').pop().split('?')[0];
        dom.repoStatus.textContent = `Downloading shard ${shardLabel}...`;
        const db = await withTimeout(openSqliteShard(shardUrls), 20000, 'Shard open');
        if (seq !== searchSeq) return;
        dom.repoStatus.textContent = 'Querying archive...';
        const where = `callsign = ?`;
        const sql = `SELECT path, contest, year, mode, season FROM logs WHERE ${where}`;
        const stmt = db.prepare(sql);
        stmt.bind([callsign]);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        if (seq !== searchSeq) return;
        renderResults(rows);
        dom.repoStatus.textContent = rows.length ? `Select a log to load for ${callsign}.` : `No matches found for ${callsign}.`;
      } catch (err) {
        if (seq !== searchSeq) return;
        console.error('Archive search failed:', err);
        dom.repoResults.innerHTML = '';
        dom.repoStatus.textContent = `Archive search failed: ${err && err.message ? err.message : 'unknown error'}`;
      }
    };

    const fetchFromArchive = async (path) => {
      if (!path) return;
      const name = path.split('/').pop();
      dom.repoStatus.textContent = `Downloading ${name}...`;
      dom.repoResults.querySelectorAll('button').forEach((btn) => btn.disabled = true);
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
        dom.repoStatus.textContent = 'Download failed.';
        dom.repoResults.querySelectorAll('button').forEach((btn) => btn.disabled = false);
        return;
      }
      try {
        applyLoadedLog(text, name, text.length, 'Archive');
        dom.repoStatus.textContent = `Loaded ${name} from archive.`;
        dom.repoResults.querySelectorAll('button').forEach((btn) => btn.disabled = false);
        if (source) dom.repoStatus.title = source;
      } catch (err) {
        dom.repoStatus.textContent = 'Failed to parse archive log.';
        dom.repoResults.querySelectorAll('button').forEach((btn) => btn.disabled = false);
        console.error('Archive parse failed:', err);
      }
    };

    dom.repoSearch.addEventListener('input', (evt) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => searchArchive(evt.target.value), 300);
    });

    dom.repoResults.addEventListener('click', (evt) => {
      const target = evt.target instanceof HTMLElement ? evt.target.closest('button') : null;
      if (!target) return;
      const path = target.dataset.path;
      if (!path) return;
      fetchFromArchive(path);
      if (!dom.repoAutoClose || dom.repoAutoClose.checked) {
        const details = dom.repoResults.querySelectorAll('details');
        details.forEach((d) => d.open = false);
      }
    });
  }

  function init() {
    if (dom.appVersion) dom.appVersion.textContent = APP_VERSION;
    initNavigation();
    setupFileInput();
    setupRepoSearch();
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
        dom.viewContainer.innerHTML = renderReport(reports[state.activeIndex]);
        bindReportInteractions(reports[state.activeIndex].id);
      });
    }
    if (dom.exportPdfBtn) {
      dom.exportPdfBtn.addEventListener('click', () => {
        exportPdf();
      });
    }
    if (dom.exportHtmlBtn) {
      dom.exportHtmlBtn.addEventListener('click', () => {
        exportHtmlFile();
      });
    }
    setActiveReport(0);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
