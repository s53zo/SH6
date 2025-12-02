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
    { id: 'charts_continents', title: 'Continents chart' },
    { id: 'charts_beam_heading_by_hour', title: 'Beam heading by hour' },
    { id: 'comments', title: 'Comments' },
    { id: 'sh5_info', title: 'App info' }
  ];

  const APP_VERSION = 'v0.5.9';
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
    logPageSize: 200,
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
    fileStatus: document.getElementById('fileStatus'),
    viewTitle: document.getElementById('viewTitle'),
    viewContainer: document.getElementById('viewContainer'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    ctyStatus: document.getElementById('ctyStatus'),
    masterStatus: document.getElementById('masterStatus'),
    appVersion: document.getElementById('appVersion')
  };

  const renderers = {};

  function initNavigation() {
    reports.forEach((r, idx) => {
      const li = document.createElement('li');
      li.textContent = r.title;
      li.dataset.index = idx;
      li.addEventListener('click', () => setActiveReport(idx));
      dom.navList.appendChild(li);
    });
    updateNavHighlight();
    updatePrevNextButtons();
  }

  function updateNavHighlight() {
    const children = dom.navList.querySelectorAll('li');
    children.forEach((li, idx) => {
      li.classList.toggle('active', idx === state.activeIndex);
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
      <p>Once parsing and aggregation are wired, this view will render SH5-style data for <code>${report.id}</code>.</p>
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

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
    const sectors = new Map(); // 0-30, 30-60, etc
    return {
      add(b) {
        if (!Number.isFinite(b)) return;
        const bucket = Math.floor(b / 30) * 30;
        sectors.set(bucket, (sectors.get(bucket) || 0) + 1);
      },
      export() {
        return Array.from(sectors.entries()).sort((a, b) => a[0] - b[0]).map(([start, count]) => ({
          sector: `${start}-${start + 29}`,
          count
        }));
      }
    };
  }

  function parseDateTime(dateStr, timeStr) {
    const d = (dateStr || '').trim();
    const t = (timeStr || '').trim();
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
        const [namePart, rest] = header.split(':');
        const name = (namePart || '').trim().toUpperCase();
        const lenStr = (rest || '').split(/[>:]/)[0];
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
    if (lower.endsWith('.adi') || lower.endsWith('.adif') || /<eoh>/i.test(text) || /<eor>/i.test(text)) {
      const adifRecords = parseAdif(text);
      const qsos = adifRecords.map((r, idx) => ({
        id: idx,
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, r.FREQ ? parseFloat(r.FREQ) : null),
        mode: normalizeMode(r.MODE),
        freq: r.FREQ ? parseFloat(r.FREQ) : null,
        time: `${(r.QSO_DATE || '').trim()} ${(r.TIME_ON || '').trim()}`,
        ts: parseDateTime(r.QSO_DATE, r.TIME_ON),
        op: normalizeCall(r.OPERATOR || r.STATION_CALLSIGN),
        grid: r.GRIDSQUARE || r.MY_GRIDSQUARE || r.STATION_LOC,
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
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, null),
        mode: normalizeMode(r.MODE),
        freq: null,
        time: `${(r.DATE || '').trim()} ${(r.TIME || '').trim()}`,
        ts: parseDateTime(r.DATE, r.TIME),
        op: normalizeCall(r.OPERATOR || r.STATION_CALLSIGN),
        grid: r.GRIDSQUARE || r.MY_GRIDSQUARE || r.STATION_LOC,
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
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, r.FREQ ? parseFloat(r.FREQ) : null),
        mode: normalizeMode(r.MODE),
        freq: r.FREQ ? parseFloat(r.FREQ) : null,
        time: `${(r.QSO_DATE || '').trim()} ${(r.TIME_ON || '').trim()}`,
        ts: parseDateTime(r.QSO_DATE, r.TIME_ON),
        op: normalizeCall(r.OPERATOR || r.STATION_CALLSIGN),
        raw: r
      }));
      return { type: 'ADIF', qsos };
    }
    return { type: 'unknown', qsos: [] };
  }

  function updateDataStatus() {
    const ctyErr = state.ctyError ? ` (${state.ctyError})` : '';
    const masterErr = state.masterError ? ` (${state.masterError})` : '';
    const ctySrc = state.ctySource ? ` [${state.ctySource}]` : '';
    const masterSrc = state.masterSource ? ` [${state.masterSource}]` : '';
    dom.ctyStatus.textContent = `${state.ctyStatus}${ctyErr}${ctySrc}`;
    dom.masterStatus.textContent = `${state.masterStatus}${masterErr}${masterSrc}`;
  }

  function setupFileInput() {
    dom.fileInput.addEventListener('change', async (evt) => {
      const [file] = evt.target.files || [];
      if (!file) return;
      state.logFile = file;
      state.logPage = 0;
      dom.fileStatus.textContent = `Loaded ${file.name} (${file.size} bytes)`;
      const text = await file.text();
      state.qsoData = parseLogFile(text, file.name);
      state.derived = buildDerived(state.qsoData.qsos);
      dom.fileStatus.textContent = `Loaded ${file.name} (${file.size} bytes) – parsed ${state.qsoData.qsos.length} QSOs as ${state.qsoData.type}`;
      setActiveReport(state.activeIndex);
    });
  }

  function recomputeDerived(reason) {
    if (!state.qsoData) return;
    state.derived = buildDerived(state.qsoData.qsos);
    dom.viewContainer.innerHTML = renderReport(reports[state.activeIndex]);
    bindReportInteractions(reports[state.activeIndex].id);
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

  function initDataFetches() {
    fetchWithFallback(CTY_URLS, (status, url) => {
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
        state.ctyTable = parseCtyDat(text);
        recomputeDerived('cty');
      }
      updateDataStatus();
    });

    fetchWithFallback(MASTER_URLS, (status, url) => {
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
        state.masterSet = parseMasterDta(text);
        recomputeDerived('master');
      }
      updateDataStatus();
    });
  }

  function parseCtyDat(text) {
    // Parses cty.dat into array of prefix objects for quick lookups.
    // cty.dat format: country:...:tz, prefix1,prefix2,...;aliases
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const entries = [];
    for (const line of lines) {
      if (line.startsWith('#')) continue;
      const parts = line.split(',');
      if (parts.length < 2) continue;
      const countryPart = parts[0];
      const remainder = parts.slice(1).join(','); // prefixes and maybe semicolons
      const countryFields = countryPart.split(':');
      if (countryFields.length < 7) continue;
      const [name, cqZone, ituZone, continent, lat, lon, tz] = countryFields;
      // Only take the prefix list before any semicolon (which starts the country modifier section)
      const prefixBlock = remainder.split(';')[0];
      const prefixes = prefixBlock.split(/[\s,]+/).filter(Boolean);
      for (const p of prefixes) {
        const prefix = p.trim();
        if (!prefix) continue;
        entries.push({
          prefix,
          country: name,
          cqZone: parseInt(cqZone, 10) || null,
          ituZone: parseInt(ituZone, 10) || null,
          continent: continent || null,
          lat: parseFloat(lat) || null,
          lon: parseFloat(lon) || null,
          tz: parseFloat(tz) || null
        });
      }
    }
    // Sort by prefix length descending for longest-match lookups.
    return entries.sort((a, b) => b.prefix.length - a.prefix.length);
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
    const lines = data.split(/\r?\n/);
    const set = new Set();
    for (const line of lines) {
      const cleaned = line.replace(/\0/g, '').trim();
      const call = normalizeCall(cleaned);
      if (call) set.add(call);
    }
    return set;
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
      if (call.startsWith(entry.prefix)) {
        return entry;
      }
    }
    return null;
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
    const countries = new Map();
    const continents = new Map();
    const cqZones = new Map();
    const hours = new Map(); // hour bucket (UTC) -> stats
    const minutes = new Map(); // minute bucket (UTC) -> stats
    const tenMinutes = new Map(); // 10-minute buckets
    const prefixes = new Map();
    const callsignLengths = new Map();
    const notInMasterCalls = new Map(); // call -> {qsos, firstTs, lastTs}
    const allCalls = new Map(); // call -> {qsos, bands:Set, firstTs, lastTs}
    const hoursCountries = new Map(); // hour -> Map(country -> count)
    const bandHourCountry = new Map(); // band -> Map(hour -> Map(country -> count))
    const ops = new Map(); // operator -> {qsos, uniques:Set}
    const structures = new Map(); // call structure -> count
    const ituZones = new Map();
    const distanceSummary = makeDistanceSummary();
    const headingSummary = makeHeadingSummary();
    const headingByHour = new Map(); // hour -> Map(sector -> count)
    const possibleErrors = [];
    const comments = new Set();
    const fields = new Map(); // grid field (first two letters)
    let minTs = null;
    let maxTs = null;

    const station = deriveStation(qsos);

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

      // Prefix/country enrich
      const prefix = lookupPrefix(q.call);
      if (prefix) {
        q.country = prefix.country;
        q.cqZone = prefix.cqZone;
        q.ituZone = prefix.ituZone;
        q.continent = prefix.continent;
        q.prefix = prefix.prefix;
        if (prefix.country) {
          if (!countries.has(prefix.country)) countries.set(prefix.country, { qsos: 0, uniques: new Set(), bands: new Set(), firstTs: q.ts, lastTs: q.ts });
          const c = countries.get(prefix.country);
          c.qsos += 1;
          if (q.call) c.uniques.add(q.call);
          if (q.band) c.bands.add(q.band);
          if (typeof q.ts === 'number') {
            if (c.firstTs == null || q.ts < c.firstTs) c.firstTs = q.ts;
            if (c.lastTs == null || q.ts > c.lastTs) c.lastTs = q.ts;
          }
        }
        if (prefix.continent) {
          if (!continents.has(prefix.continent)) continents.set(prefix.continent, { qsos: 0, uniques: new Set() });
          const c = continents.get(prefix.continent);
          c.qsos += 1;
          if (q.call) c.uniques.add(q.call);
        }
        if (prefix.cqZone) {
          if (!cqZones.has(prefix.cqZone)) cqZones.set(prefix.cqZone, { qsos: 0, uniques: new Set() });
          const z = cqZones.get(prefix.cqZone);
          z.qsos += 1;
          if (q.call) z.uniques.add(q.call);
        }
        if (prefix.ituZone) {
          if (!ituZones.has(prefix.ituZone)) ituZones.set(prefix.ituZone, { qsos: 0, uniques: new Set() });
          const z = ituZones.get(prefix.ituZone);
          z.qsos += 1;
          if (q.call) z.uniques.add(q.call);
        }
      }

      // Master lookup (only if file successfully loaded and non-empty)
      if (state.masterSet && state.masterSet.size > 0) {
        q.inMaster = state.masterSet.has(q.call);
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
        callsignLengths.set(len, (callsignLengths.get(len) || 0) + 1);
        const struct = classifyCallStructure(q.call);
        structures.set(struct, (structures.get(struct) || 0) + 1);
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
          headingSummary.add(brng);
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

      // Fields (grid first two letters)
      if (q.grid && q.grid.length >= 2) {
        const field = q.grid.slice(0, 2).toUpperCase();
        fields.set(field, (fields.get(field) || 0) + 1);
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

    const countrySummary = [];
    countries.forEach((v, k) => {
      countrySummary.push({
        country: k,
        qsos: v.qsos,
        uniques: v.uniques.size,
        bands: Array.from(v.bands).sort(),
        firstTs: v.firstTs,
        lastTs: v.lastTs
      });
    });
    countrySummary.sort((a, b) => b.qsos - a.qsos || a.country.localeCompare(b.country));

    const continentSummary = [];
    continents.forEach((v, k) => {
      continentSummary.push({
        continent: k,
        qsos: v.qsos,
        uniques: v.uniques.size
      });
    });
    continentSummary.sort((a, b) => b.qsos - a.qsos || a.continent.localeCompare(b.continent));

    const cqZoneSummary = [];
    cqZones.forEach((v, k) => {
      cqZoneSummary.push({
        cqZone: k,
        qsos: v.qsos,
        uniques: v.uniques.size
      });
    });
    cqZoneSummary.sort((a, b) => a.cqZone - b.cqZone);

    const ituZoneSummary = [];
    ituZones.forEach((v, k) => {
      ituZoneSummary.push({
        ituZone: k,
        qsos: v.qsos,
        uniques: v.uniques.size
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
    const callsignLengthSummary = Array.from(callsignLengths.entries()).map(([len, count]) => ({ len, count }))
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

    const structureSummary = Array.from(structures.entries()).map(([struct, count]) => ({
      struct,
      count
    })).sort((a, b) => b.count - a.count || a.struct.localeCompare(b.struct));

    const headingByHourSeries = Array.from(headingByHour.entries()).sort((a, b) => a[0] - b[0]).map(([hour, m]) => {
      const sectors = Array.from(m.entries()).sort((a, b) => a[0] - b[0]).map(([sector, count]) => ({ sector, count }));
      return { hour, sectors };
    });

    const fieldsSummary = Array.from(fields.entries()).map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count || a.field.localeCompare(b.field));

    return {
      dupes,
      uniqueCallsCount: calls.size,
      bandSummary,
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
      fieldsSummary,
      station,
      comments: Array.from(comments),
      possibleErrors,
      timeRange: { minTs, maxTs }
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
    const hours = duration != null ? `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')} (min ${duration})` : 'N/A';

    return `
      <table>
        <tr><th>Parameter</th><th>Value</th></tr>
        <tr><td>QSOs</td><td><strong>${totalQsos}</strong></td></tr>
        <tr><td>Dupes</td><td>${dupes}</td></tr>
        <tr><td>Unique callsigns</td><td>${uniques}</td></tr>
        <tr><td>Start time</td><td>${formatDate(state.derived.timeRange.minTs)}</td></tr>
        <tr><td>End time</td><td>${formatDate(state.derived.timeRange.maxTs)}</td></tr>
        <tr><td>Participation time</td><td>${hours}</td></tr>
        <tr><td>Operators</td><td>${state.derived.operatorsSummary?.length || 0}</td></tr>
        <tr><td>Station location</td><td>${state.derived.station ? `${state.derived.station.value} (${state.derived.station.source})` : 'N/A'}</td></tr>
        <tr><td>Country file</td><td>${state.ctyStatus}${state.ctyError ? ` (error: ${state.ctyError})` : ''}</td></tr>
        <tr><td>Master file</td><td>${state.masterStatus}${state.masterError ? ` (error: ${state.masterError})` : ''}</td></tr>
      </table>
    `;
  }

  function renderOperators() {
    if (!state.derived) return renderPlaceholder({ id: 'operators', title: 'Operators' });
    if (!state.derived.operatorsSummary || state.derived.operatorsSummary.length === 0) return '<p>No operator data in log.</p>';
    const rows = state.derived.operatorsSummary.map((o) => `
      <tr>
        <td>${o.op}</td>
        <td>${o.qsos}</td>
        <td>${o.uniques}</td>
      </tr>
    `).join('');
    return `
      <table>
        <tr><th>Operator</th><th>QSOs</th><th>Uniques</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderQsPerStation() {
    return renderOperators();
  }

  function renderSummary() {
    if (!state.derived) return renderPlaceholder({ id: 'summary', title: 'Summary' });
    const rows = state.derived.bandSummary.map((b) => `
      <tr>
        <td>${b.band}</td>
        <td>${b.qsos}</td>
        <td>${b.dupes}</td>
        <td>${b.uniques}</td>
      </tr>
    `).join('');
    return `
      <table>
        <tr><th>Band</th><th>QSOs</th><th>Dupes</th><th>Uniques</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderLog() {
    if (!state.qsoData) return renderPlaceholder({ id: 'log', title: 'Log' });
    const start = state.logPage * state.logPageSize;
    const end = start + state.logPageSize;
    const rows = state.qsoData.qsos.slice(start, end).map((q) => `
      <tr>
        <td>${q.time}</td>
        <td>${q.band}</td>
        <td>${q.mode}</td>
        <td>${q.freq ?? ''}</td>
        <td>${q.call}</td>
        <td>${q.op || ''}</td>
        <td>${q.stx || q.raw?.EXCH_SENT || q.raw?.STX_STRING || ''}</td>
        <td>${q.srx || q.raw?.EXCH_RCVD || q.raw?.SRX_STRING || ''}</td>
        <td>${q.country || ''}</td>
        <td>${q.cqZone || ''}</td>
        <td>${q.ituZone || ''}</td>
        <td>${q.grid || ''}</td>
        <td>${q.inMaster === false ? 'NOT-IN-MASTER' : ''}${q.isDupe ? ' DUPE' : ''}</td>
      </tr>
    `).join('');
    const totalPages = Math.ceil(state.qsoData.qsos.length / state.logPageSize);
    const note = `<p>Showing ${start + 1}-${Math.min(end, state.qsoData.qsos.length)} of ${state.qsoData.qsos.length} QSOs (page ${state.logPage + 1} / ${totalPages}).</p>`;
    return `
      ${note}
      <div>
        <button id="logPrev" ${state.logPage === 0 ? 'disabled' : ''}>Prev</button>
        <button id="logNext" ${state.logPage >= totalPages - 1 ? 'disabled' : ''}>Next</button>
      </div>
      <table>
        <tr><th>Time</th><th>Band</th><th>Mode</th><th>Freq</th><th>Call</th><th>Op</th><th>Exch Sent</th><th>Exch Rcvd</th><th>Country</th><th>CQ</th><th>ITU</th><th>Grid</th><th>Flags</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderDupes() {
    if (!state.derived) return renderPlaceholder({ id: 'dupes', title: 'Dupes' });
    const rows = state.derived.dupes.map((q) => `
      <tr>
        <td>${q.time}</td>
        <td>${q.band}</td>
        <td>${q.mode}</td>
        <td>${q.call}</td>
      </tr>
    `).join('');
    const count = state.derived.dupes.length;
    if (!count) return '<p>No duplicate QSOs detected.</p>';
    return `
      <p>Duplicate QSOs: ${count}</p>
      <table>
        <tr><th>Time</th><th>Band</th><th>Mode</th><th>Call</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderCountries() {
    if (!state.derived) return renderPlaceholder({ id: 'countries', title: 'Countries' });
    const rows = state.derived.countrySummary.map((c) => `
      <tr>
        <td>${c.country}</td>
        <td>${c.qsos}</td>
        <td>${c.uniques}</td>
        <td>${c.bands.join(', ')}</td>
        <td>${formatDate(c.firstTs)}</td>
        <td>${formatDate(c.lastTs)}</td>
      </tr>
    `).join('');
    return `
      <table>
        <tr><th>Country</th><th>QSOs</th><th>Uniques</th><th>Bands</th><th>First</th><th>Last</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderContinents() {
    if (!state.derived) return renderPlaceholder({ id: 'continents', title: 'Continents' });
    const rows = state.derived.continentSummary.map((c) => `
      <tr>
        <td>${c.continent}</td>
        <td>${c.qsos}</td>
        <td>${c.uniques}</td>
      </tr>
    `).join('');
    return `
      <table>
        <tr><th>Continent</th><th>QSOs</th><th>Uniques</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderCqZones() {
    if (!state.derived) return renderPlaceholder({ id: 'zones_cq', title: 'CQ zones' });
    const rows = state.derived.cqZoneSummary.map((z) => `
      <tr>
        <td>${z.cqZone}</td>
        <td>${z.qsos}</td>
        <td>${z.uniques}</td>
      </tr>
    `).join('');
    return `
      <table>
        <tr><th>CQ Zone</th><th>QSOs</th><th>Uniques</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderItuZones() {
    if (!state.derived) return renderPlaceholder({ id: 'zones_itu', title: 'ITU zones' });
    const rows = state.derived.ituZoneSummary.map((z) => `
      <tr>
        <td>${z.ituZone}</td>
        <td>${z.qsos}</td>
        <td>${z.uniques}</td>
      </tr>
    `).join('');
    return `
      <table>
        <tr><th>ITU Zone</th><th>QSOs</th><th>Uniques</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderQsByHourSheet() {
    if (!state.derived || !state.derived.hourSeries) return renderPlaceholder({ id: 'qs_by_hour_sheet', title: 'Qs by hour sheet' });
    const allBands = new Set();
    state.derived.hourSeries.forEach((h) => {
      Object.keys(h.bands).forEach((b) => allBands.add(b));
    });
    const bands = Array.from(allBands).sort();

    const header = bands.map((b) => `<th>${b}</th>`).join('');
    const rows = state.derived.hourSeries.map((h) => {
      const date = new Date(h.hour * 3600000);
      const label = date.toISOString().slice(0, 13).replace('T', ' ');
      const cells = bands.map((b) => `<td>${h.bands[b] || 0}</td>`).join('');
      return `<tr><td>${label}</td>${cells}<td>${h.qsos}</td></tr>`;
    }).join('');
    return `
      <table>
        <tr><th>Hour (UTC)</th>${header}<th>Total</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderRates() {
    if (!state.derived || !state.derived.hourSeries) return renderPlaceholder({ id: 'rates', title: 'Rates' });
    // Simple 60-minute window peak calculation
    const buckets = state.derived.hourSeries;
    let peak = 0;
    let peakHour = null;
    buckets.forEach((h) => {
      if (h.qsos > peak) {
        peak = h.qsos;
        peakHour = h.hour;
      }
    });
    const peakLabel = peakHour != null ? new Date(peakHour * 3600000).toISOString().slice(0, 13).replace('T', ' ') : 'N/A';
    // 10-minute peak
    let peak10 = 0;
    let peak10Bucket = null;
    if (state.derived.tenMinuteSeries) {
      state.derived.tenMinuteSeries.forEach((b) => {
        if (b.qsos > peak10) {
          peak10 = b.qsos;
          peak10Bucket = b.bucket;
        }
      });
    }
    const peak10Label = peak10Bucket != null ? new Date(peak10Bucket * 600000).toISOString().slice(0, 16).replace('T', ' ') : 'N/A';
    return `
      <p>Highest hourly rate: <strong>${peak}</strong> QSOs at ${peakLabel} UTC.</p>
      <p>Highest 10-minute rate: <strong>${peak10}</strong> QSOs at ${peak10Label} UTC.</p>
      ${renderQsByHourSheet()}
    `;
  }

  function renderQsByMinute() {
    if (!state.derived || !state.derived.minuteSeries) return renderPlaceholder({ id: 'qs_by_minute', title: 'Qs by minute' });
    const rows = state.derived.minuteSeries.map((m) => {
      const date = new Date(m.minute * 60000);
      const label = date.toISOString().slice(0, 16).replace('T', ' ');
      return `<tr><td>${label}</td><td>${m.qsos}</td></tr>`;
    }).join('');
    return `
      <table>
        <tr><th>Minute (UTC)</th><th>QSOs</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderOneMinuteRates() {
    if (!state.derived || !state.derived.minuteSeries) return renderPlaceholder({ id: 'one_minute_rates', title: 'One minute rates' });
    const sorted = [...state.derived.minuteSeries].sort((a, b) => b.qsos - a.qsos || a.minute - b.minute).slice(0, 20);
    const rows = sorted.map((m) => {
      const date = new Date(m.minute * 60000);
      const label = date.toISOString().slice(0, 16).replace('T', ' ');
      return `<tr><td>${label}</td><td>${m.qsos}</td></tr>`;
    }).join('');
    return `
      <p>Top 20 one-minute rates.</p>
      <table>
        <tr><th>Minute (UTC)</th><th>QSOs</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderPrefixes() {
    if (!state.derived) return renderPlaceholder({ id: 'prefixes', title: 'Prefixes' });
    const rows = state.derived.prefixSummary.map((p) => `
      <tr>
        <td>${p.prefix}</td>
        <td>${p.qsos}</td>
        <td>${p.uniques}</td>
      </tr>
    `).join('');
    return `
      <table>
        <tr><th>Prefix</th><th>QSOs</th><th>Uniques</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderCallsignLength() {
    if (!state.derived) return renderPlaceholder({ id: 'callsign_length', title: 'Callsign length' });
    const rows = state.derived.callsignLengthSummary.map((c) => `
      <tr>
        <td>${c.len}</td>
        <td>${c.count}</td>
      </tr>
    `).join('');
    return `
      <table>
        <tr><th>Length</th><th>Count</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderCallsignStructure() {
    if (!state.derived) return renderPlaceholder({ id: 'callsign_structure', title: 'Callsign structure' });
    const rows = state.derived.structureSummary.map((s) => `
      <tr>
        <td>${s.struct}</td>
        <td>${s.count}</td>
      </tr>
    `).join('');
    return `
      <table>
        <tr><th>Structure</th><th>Count</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderDistance() {
    if (!state.derived || !state.derived.distanceSummary) return renderPlaceholder({ id: 'distance', title: 'Distance' });
    const ds = state.derived.distanceSummary;
    if (!ds.count) return '<p>No distance data (station or remote locations missing).</p>';
    const buckets = ds.buckets.map((b) => `<tr><td>${b.range} km</td><td>${b.count}</td></tr>`).join('');
    return `
      <p>QSOs with distance: ${ds.count}</p>
      <p>Avg: ${ds.avg?.toFixed(1)} km, Min: ${ds.min?.toFixed(1)} km, Max: ${ds.max?.toFixed(1)} km</p>
      <table>
        <tr><th>Range (km)</th><th>Count</th></tr>
        ${buckets}
      </table>
    `;
  }

  function renderBeamHeading() {
    if (!state.derived || !state.derived.headingSummary) return renderPlaceholder({ id: 'beam_heading', title: 'Beam heading' });
    const rows = state.derived.headingSummary.map((h) => `
      <tr>
        <td>${h.sector} deg</td>
        <td>${h.count}</td>
      </tr>
    `).join('');
    if (!rows) return '<p>No heading data.</p>';
    return `
      <table>
        <tr><th>Sector</th><th>Count</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderAllCallsigns() {
    if (!state.derived) return renderPlaceholder({ id: 'all_callsigns', title: 'All callsigns' });
    const rows = state.derived.allCallsList.slice(0, 2000).map((c) => `
      <tr>
        <td>${c.call}</td>
        <td>${c.qsos}</td>
        <td>${c.bands.join(', ')}</td>
        <td>${formatDate(c.firstTs)}</td>
        <td>${formatDate(c.lastTs)}</td>
      </tr>
    `).join('');
    const note = state.derived.allCallsList.length > 2000 ? `<p>Showing first 2000 of ${state.derived.allCallsList.length} calls.</p>` : '';
    return `
      ${note}
      <table>
        <tr><th>Call</th><th>QSOs</th><th>Bands</th><th>First QSO</th><th>Last QSO</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderNotInMaster() {
    if (!state.derived) return renderPlaceholder({ id: 'not_in_master', title: 'Not in master' });
    if (!state.masterSet || state.masterSet.size === 0) return '<p>Master file not loaded.</p>';
    const rows = state.derived.notInMasterList.map((c) => `
      <tr>
        <td>${c.call}</td>
        <td>${c.qsos}</td>
        <td>${formatDate(c.firstTs)}</td>
        <td>${formatDate(c.lastTs)}</td>
      </tr>
    `).join('');
    const count = state.derived.notInMasterList.length;
    const note = count === 0 ? '<p>All calls found in master.</p>' : '';
    return `
      <p>Calls not found in MASTER.DTA: ${count}</p>
      ${note}
      <table>
        <tr><th>Call</th><th>QSOs</th><th>First</th><th>Last</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderCountriesByTime(bandFilter) {
    if (!state.derived) return renderPlaceholder({ id: 'countries_by_time', title: 'Countries by time' });
    const matrix = bandFilter ? state.derived.bandHourCountry.get(bandFilter) : state.derived.hoursCountries;
    if (!matrix || matrix.size === 0) return '<p>No data.</p>';
    const allCountries = new Set();
    matrix.forEach((m) => m.forEach((_, country) => allCountries.add(country)));
    const countries = Array.from(allCountries).sort();
    const rows = Array.from(matrix.entries()).sort((a, b) => a[0] - b[0]).map(([hour, m]) => {
      const date = new Date(hour * 3600000).toISOString().slice(0, 13).replace('T', ' ');
      const cells = countries.map((c) => `<td>${m.get(c) || 0}</td>`).join('');
      return `<tr><td>${date}</td>${cells}</tr>`;
    }).join('');
    const header = countries.map((c) => `<th>${c}</th>`).join('');
    return `
      <table>
        <tr><th>Hour (UTC)</th>${header}</tr>
        ${rows}
      </table>
    `;
  }

  function renderPossibleErrors() {
    if (!state.derived) return renderPlaceholder({ id: 'possible_errors', title: 'Possible errors' });
    if (!state.derived.possibleErrors || !state.derived.possibleErrors.length) return '<p>No possible errors detected by simple heuristics.</p>';
    const rows = state.derived.possibleErrors.map((e) => `
      <tr>
        <td>${e.reason}</td>
        <td>${e.q.time}</td>
        <td>${e.q.band}</td>
        <td>${e.q.freq ?? ''}</td>
        <td>${e.q.mode}</td>
        <td>${e.q.call || ''}</td>
      </tr>
    `).join('');
    return `
      <p>Heuristics: missing callsign, unrecognized pattern, prefix not found, invalid/missing time, band/frequency mismatch, or zone vs prefix disagreement.</p>
      <table>
        <tr><th>Reason</th><th>Time</th><th>Band</th><th>Freq (MHz)</th><th>Mode</th><th>Call</th></tr>
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
    const rows = state.derived.fieldsSummary.map((f) => `
      <tr>
        <td>${f.field}</td>
        <td>${f.count}</td>
      </tr>
    `).join('');
    const coverage = `${state.derived.fieldsSummary.length} fields`;
    return `
      <p>Fields coverage: ${coverage}</p>
      ${renderBars(state.derived.fieldsSummary, 'field', 'count')}
      <table>
        <tr><th>Field</th><th>QSOs</th></tr>
        ${rows}
      </table>
    `;
  }

  function renderKmzFiles() {
    return '<p>KMZ generation is not implemented in this client-side build.</p>';
  }

  function renderSun() {
    return '<p>Sun/solar data not available offline. Provide local indices file or integrate a feed.</p>';
  }

  function renderPassedQsos() {
    return '<p>Passed QSOs detection not implemented. Add markers in your log or extend parser to flag passed contacts.</p>';
  }

  function renderAppInfo() {
    return `
      <p>SH6 client-side report generator ${APP_VERSION}</p>
      <ul>
        <li>Parses ADIF/CBF in browser</li>
        <li>Uses cty.dat and MASTER.DTA (remote or same-origin)</li>
        <li>Renders SH5-style summary, country/zone, rate, and QA reports</li>
      </ul>
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
      <p>Select a chart from the sidebar (Qs by band, Top countries, Continents, Beam heading by hour).</p>
    `;
  }

  function renderChartQsByBand() {
    if (!state.derived) return renderPlaceholder({ id: 'charts_qs_by_band', title: 'Qs by band' });
    return renderBars(state.derived.bandSummary, 'band', 'qsos');
  }

  function renderChartTop10Countries() {
    if (!state.derived) return renderPlaceholder({ id: 'charts_top_10_countries', title: 'Top 10 countries' });
    const top = state.derived.countrySummary.slice(0, 10);
    return renderBars(top, 'country', 'qsos');
  }

  function renderChartContinents() {
    if (!state.derived) return renderPlaceholder({ id: 'charts_continents', title: 'Continents chart' });
    return renderBars(state.derived.continentSummary, 'continent', 'qsos');
  }

  function renderChartBeamHeadingByHour() {
    if (!state.derived || !state.derived.headingByHourSeries) return renderPlaceholder({ id: 'charts_beam_heading_by_hour', title: 'Beam heading by hour' });
    const allSectors = new Set();
    state.derived.headingByHourSeries.forEach((h) => h.sectors.forEach((s) => allSectors.add(s.sector)));
    const sectors = Array.from(allSectors).sort((a, b) => a - b);
    const header = sectors.map((s) => `<th>${s}-${s + 29}</th>`).join('');
    const rows = state.derived.headingByHourSeries.map((h) => {
      const date = new Date(h.hour * 3600000).toISOString().slice(0, 13).replace('T', ' ');
      const cells = sectors.map((s) => {
        const found = h.sectors.find((x) => x.sector === s);
        return `<td>${found ? found.count : 0}</td>`;
      }).join('');
      return `<tr><td>${date}</td>${cells}</tr>`;
    }).join('');
    return `
      <table>
        <tr><th>Hour (UTC)</th>${header}</tr>
        ${rows}
      </table>
    `;
  }

  function renderGraphsQsByHour(bandFilter) {
    if (!state.derived || !state.derived.hourSeries) return renderPlaceholder({ id: 'graphs_qs_by_hour', title: 'Qs by hour' });
    const data = state.derived.hourSeries.map((h) => {
      const hourLabel = new Date(h.hour * 3600000).toISOString().slice(0, 13).replace('T', ' ');
      const val = bandFilter ? (h.bands[bandFilter] || 0) : h.qsos;
      return { label: hourLabel, value: val };
    });
    const bars = renderBars(data, 'label', 'value');
    const subtitle = bandFilter ? `Band ${bandFilter}` : 'All bands';
    return `<p>${subtitle}</p>${bars}`;
  }

  function renderReport(report) {
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
      case 'charts_beam_heading_by_hour': return renderChartBeamHeadingByHour();
      case 'fields_map': return renderFieldsMap();
      case 'kmz_files': return renderKmzFiles();
      case 'sun': return renderSun();
      case 'passed_qsos': return renderPassedQsos();
      case 'sh5_info': return renderAppInfo();
      default: return renderPlaceholder(report);
    }
  }

  function bindReportInteractions(reportId) {
    if (reportId === 'log') {
      const prev = document.getElementById('logPrev');
      const next = document.getElementById('logNext');
      if (prev) prev.addEventListener('click', () => {
        if (state.logPage > 0) {
          state.logPage -= 1;
          dom.viewContainer.innerHTML = renderLog();
          bindReportInteractions('log');
        }
      });
      if (next) next.addEventListener('click', () => {
        const totalPages = Math.ceil((state.qsoData?.qsos.length || 0) / state.logPageSize);
        if (state.logPage < totalPages - 1) {
          state.logPage += 1;
          dom.viewContainer.innerHTML = renderLog();
          bindReportInteractions('log');
        }
      });
    }
  }

  function init() {
    if (dom.appVersion) dom.appVersion.textContent = APP_VERSION;
    initNavigation();
    setupFileInput();
    setupPrevNext();
    initDataFetches();
    setActiveReport(0);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
  function renderBreaks() {
    if (!state.derived || !state.derived.minuteSeries) return renderPlaceholder({ id: 'breaks', title: 'Break time' });
    const minutes = state.derived.minuteSeries.map((m) => m.minute).sort((a, b) => a - b);
    if (!minutes.length) return '<p>No QSOs to analyze.</p>';
    const threshold = 60; // minutes gap to count as break
    let totalBreakMin = 0;
    const breaks = [];
    for (let i = 1; i < minutes.length; i++) {
      const gap = minutes[i] - minutes[i - 1];
      if (gap > threshold) {
        const len = gap - 1;
        totalBreakMin += len;
        breaks.push({ start: minutes[i - 1] + 1, end: minutes[i] - 1, minutes: len });
      }
    }
    const rows = breaks.map((b) => {
      const start = new Date(b.start * 60000).toISOString().slice(0, 16).replace('T', ' ');
      const end = new Date(b.end * 60000).toISOString().slice(0, 16).replace('T', ' ');
      return `<tr><td>${start}</td><td>${end}</td><td>${b.minutes}</td></tr>`;
    }).join('');
    const totalHours = `${Math.floor(totalBreakMin / 60)}:${String(totalBreakMin % 60).padStart(2, '0')} (${totalBreakMin} min)`;
    return `
      <p>Total break time (&gt;${threshold} min gaps): ${totalHours}</p>
      <table>
        <tr><th>Start (UTC)</th><th>End (UTC)</th><th>Minutes</th></tr>
        ${rows}
      </table>
    `;
  }
