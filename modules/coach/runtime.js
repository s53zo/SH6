export function createCoachRuntime(deps = {}) {
  const {
    getState,
    getActiveReportId,
    compareSlotIds = ['A', 'B', 'C', 'D'],
    cqApiProxyBase = '',
    cqApiProxyKeys = {},
    cqApiSupportedContests = new Set(),
    loadCqApiModule,
    loadCompetitorCoachModule,
    loadArchiveClientModule,
    createApiEnrichmentState,
    createCompetitorCoachState,
    normalizeCall,
    deriveStationCallsign,
    inferApiMode,
    dedupeValues,
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
  } = deps;

  let cqApiRetryTimer = null;
  let competitorCoachRetryTimer = null;

  function getStateSafe() {
    return typeof getState === 'function' ? getState() : null;
  }

  function getActiveReportIdSafe() {
    return typeof getActiveReportId === 'function' ? String(getActiveReportId() || '') : '';
  }

  function getWindowSafe() {
    return typeof window !== 'undefined' ? window : globalThis;
  }

  function normalizeCallSafe(value) {
    if (typeof normalizeCall === 'function') return normalizeCall(value);
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  }

  function deriveStationCallsignSafe(qsos) {
    return typeof deriveStationCallsign === 'function' ? deriveStationCallsign(qsos) : '';
  }

  function dedupeValuesSafe(values) {
    if (typeof dedupeValues === 'function') return dedupeValues(values);
    const out = [];
    const seen = new Set();
    (Array.isArray(values) ? values : []).forEach((value) => {
      const key = String(value || '').trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(key);
    });
    return out;
  }

  function lookupPrefixSafe(value) {
    return typeof lookupPrefix === 'function' ? lookupPrefix(value) : null;
  }

  function baseCallSafe(value) {
    return typeof baseCall === 'function' ? baseCall(value) : String(value || '').split('/')[0] || '';
  }

  function normalizeContinentSafe(value) {
    return typeof normalizeContinent === 'function'
      ? normalizeContinent(value)
      : String(value || '').trim().toUpperCase();
  }

  function mapContinentToCqGeoSafe(value) {
    return typeof mapContinentToCqGeo === 'function'
      ? mapContinentToCqGeo(value)
      : String(value || '').trim().toUpperCase();
  }

  function renderActiveReportSafe() {
    if (typeof renderActiveReport === 'function') renderActiveReport();
  }

  function updateDataStatusSafe() {
    if (typeof updateDataStatus === 'function') updateDataStatus();
  }

  function trackEventSafe(name, payload) {
    if (typeof trackEvent === 'function') trackEvent(name, payload || {});
  }

  function createApiState() {
    return typeof createApiEnrichmentState === 'function'
      ? createApiEnrichmentState()
      : {
          status: 'idle',
          error: null,
          source: null,
          helperActive: false,
          data: null,
          requestKey: null
        };
  }

  function createCoachState(seed = {}) {
    return typeof createCompetitorCoachState === 'function'
      ? createCompetitorCoachState(seed)
      : {
          status: 'idle',
          error: null,
          source: null,
          statusMessage: '',
          requestKey: null,
          scopeType: 'continent',
          categoryMode: 'same',
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
          loadedSlotRows: compareSlotIds.reduce((acc, slotId) => {
            acc[slotId] = '';
            return acc;
          }, {}),
          lastLoadedSlot: '',
          lastLoadedRowKey: ''
        };
  }

  function inferApiCategories(slot, contestId) {
    const out = [];
    const metaCategory = String(slot?.derived?.contestMeta?.category || '').trim();
    const firstRaw = slot?.qsoData?.qsos?.[0]?.raw || {};
    out.push(...inferExactApiCategoriesFromCabrillo(slot, contestId));
    const parts = [
      metaCategory,
      firstRaw.CATEGORY,
      firstRaw['CATEGORY-OPERATOR'],
      firstRaw['CATEGORY-POWER'],
      firstRaw['CATEGORY-BAND'],
      firstRaw['CATEGORY-ASSISTED'],
      firstRaw['CATEGORY-STATION']
    ].map((value) => String(value || '').trim().toUpperCase()).filter(Boolean);
    out.push(...parts);
    if (contestId === 'CQ160') {
      const letter = String(metaCategory || '').trim().toUpperCase().match(/^([A-Z])\b/);
      if (letter && letter[1]) out.push(letter[1]);
      const first = String(firstRaw.CATEGORY || '').trim().toUpperCase();
      if (first.length === 1) out.push(first);
    }
    return dedupeValuesSafe(out);
  }

  function inferApiScopeGeos(slot) {
    const scope = {
      dxcc: '',
      continent: '',
      world: 'WORLD'
    };
    const stationCall = normalizeCallSafe(
      slot?.derived?.contestMeta?.stationCallsign || deriveStationCallsignSafe(slot?.qsoData?.qsos || [])
    );
    if (stationCall) {
      const prefix = lookupPrefixSafe(stationCall);
      if (prefix) {
        if (prefix.prefix) scope.dxcc = String(prefix.prefix).toUpperCase();
        const contGeo = mapContinentToCqGeoSafe(prefix.continent);
        if (contGeo) scope.continent = contGeo;
      }
    }
    return scope;
  }

  function inferApiGeos(slot) {
    const scope = inferApiScopeGeos(slot);
    return dedupeValuesSafe([scope.dxcc, scope.continent, scope.world]);
  }

  function normalizeCoachCategory(value) {
    return String(value || '')
      .replace(/%20/gi, ' ')
      .replace(/\+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  function normalizeCoachBandCategory(value) {
    const key = String(value || '').trim().toUpperCase();
    if (!key || key === 'ALL' || key === 'AB' || key === 'ALL-BAND' || key === 'ALL BAND') return 'ALL';
    const match = key.match(/^(160|80|40|20|15|10)M?$/);
    return match ? `${match[1]}M` : 'ALL';
  }

  function inferExactApiCategoriesFromCabrillo(slot, contestId) {
    const firstRaw = slot?.qsoData?.qsos?.[0]?.raw || {};
    const meta = slot?.derived?.contestMeta || {};
    const operator = normalizeCoachCategory(firstRaw['CATEGORY-OPERATOR'] || meta.categoryOperator || meta.category || '');
    const power = normalizeCoachCategory(firstRaw['CATEGORY-POWER'] || meta.categoryPower || '');
    const band = normalizeCoachBandCategory(firstRaw['CATEGORY-BAND'] || meta.categoryBand || '');
    const assisted = normalizeCoachCategory(firstRaw['CATEGORY-ASSISTED'] || meta.categoryAssisted || '');
    const transmitter = normalizeCoachCategory(firstRaw['CATEGORY-TRANSMITTER'] || meta.categoryTransmitter || '');
    const station = normalizeCoachCategory(firstRaw['CATEGORY-STATION'] || meta.categoryStation || '');
    const out = [];

    if (operator.includes('MULTI')) {
      if (station.includes('DISTRIBUTED') || transmitter.includes('DISTRIBUTED')) out.push('MD');
      else if (transmitter.includes('TWO') || transmitter === '2') out.push('M2');
      else if (transmitter.includes('MULTI') || transmitter === 'UNLIMITED') out.push('MM');
      else out.push(power.includes('LOW') ? 'MSL' : 'MSH');
      return out;
    }

    if (operator.includes('SINGLE') || operator === 'SINGLE-OP' || /^SO\b/.test(operator) || /^SINGLE\b/.test(operator)) {
      const powerCode = power.includes('LOW') ? 'L' : (power.includes('QRP') ? 'Q' : 'H');
      const assistedCode = contestId === 'CQWW' || contestId === 'CQWWRTTY'
        ? (assisted.includes('ASSISTED') && !assisted.includes('NON') ? 'A' : 'S')
        : 'S';
      out.push(`${assistedCode}${powerCode} ${band}`);
    }

    return out;
  }

  function sameStationCategory(row, callsign) {
    const stationCall = normalizeCallSafe(callsign || '');
    if (!row) return '';
    if (stationCall && normalizeCallSafe(row.callsign || row.call || '') !== stationCall) return '';
    return normalizeCoachCategory(row.category || row.cat || '');
  }

  function findSameYearCategory(rows, year, callsign) {
    const yearNum = Number(year);
    if (!Number.isFinite(yearNum)) return '';
    const stationCall = normalizeCallSafe(callsign || '');
    const hit = (rows || []).find((row) => (
      Number(row?.year ?? row?.yr) === yearNum
      && (!stationCall || normalizeCallSafe(row.callsign || row.call || '') === stationCall)
    ));
    return normalizeCoachCategory(hit?.category || hit?.cat || '');
  }

  function resolveCoachCategoryFromApiData(apiData, fallbackCategory, year, stationCall) {
    return normalizeCoachCategory(
      sameStationCategory(apiData?.currentScore, stationCall)
      || apiData?.matchedCategory
      || findSameYearCategory(apiData?.history || [], year, stationCall)
      || fallbackCategory
    );
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
    const parsedYear = parseCoachNumber(row.year ?? row.yr);
    return {
      contest: contestId,
      mode,
      year: Number.isFinite(parsedYear) ? parsedYear : year,
      callsign: normalizeCallSafe(row.callsign || row.call || ''),
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
    return /^M(?:M|2|S|L|D|O|ULTI|$)/.test(category);
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
    const proxyKey = cqApiProxyKeys[contestId];
    if (!proxyKey) return { ok: false, rows: [], source: '', statusMessage: 'Unsupported contest' };
    const safeCategory = normalizeCoachCategory(category || '');
    if (!safeCategory) return { ok: false, rows: [], source: '', statusMessage: 'Missing category' };
    const url = `${cqApiProxyBase}/${proxyKey}/raw/${encodeCqApiPathSegment(mode)}/category/${encodeCqApiPathSegment(safeCategory)}`;
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
    if (cqApiSupportedContests.has(byPath)) return byPath;
    const raw = String(contestText || '').toUpperCase().replace(/[_\s]+/g, '-');
    if (!raw) return '';
    if (raw.includes('CQ-WPX-RTTY') || raw === 'CQWPXRTTY') return 'CQWPXRTTY';
    if (raw.includes('CQ-WW-RTTY') || raw === 'CQWWRTTY') return 'CQWWRTTY';
    if (raw.includes('CQ-WPX') || raw === 'CQWPX') return 'CQWPX';
    if (raw.includes('CQ-WW') || raw === 'CQWW') return 'CQWW';
    if (raw.includes('CQ-160') || raw === 'CQ160') return 'CQ160';
    return '';
  }

  function buildCqApiRequest(slot) {
    const state = getStateSafe();
    if (!slot?.derived || !slot?.qsoData) return null;
    const contestIdText = String(slot.derived.contestMeta?.contestId || '');
    const archivePath = String(slot.logFile?.path || '');
    const contestId = state?.cqApiClient?.normalizeContestId
      ? state.cqApiClient.normalizeContestId(contestIdText, archivePath)
      : normalizeContestIdForCoach(contestIdText, archivePath);
    if (!contestId) return null;
    const callsign = normalizeCallSafe(slot.derived.contestMeta?.stationCallsign || deriveStationCallsignSafe(slot.qsoData.qsos));
    if (!callsign) return null;
    const minTs = slot.derived.timeRange?.minTs;
    const year = Number.isFinite(minTs) ? String(new Date(minTs).getUTCFullYear()) : '*';
    const mode = typeof inferApiMode === 'function' ? inferApiMode(slot, contestId) : '';
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
    const state = getStateSafe();
    if (state?.cqApiClient) return state.cqApiClient;
    if (typeof loadCqApiModule === 'function') await loadCqApiModule();
    const win = getWindowSafe();
    if (!win.SH6CqApi || typeof win.SH6CqApi.createClient !== 'function') {
      throw new Error('CQ API client unavailable');
    }
    const client = win.SH6CqApi.createClient({
      proxyBase: cqApiProxyBase,
      useProxy: true,
      useDirect: true,
      timeoutMs: 9000,
      maxAttempts: 3,
      retryBackoffMs: 220,
      debug: Boolean(win.SH6_API_DEBUG)
    });
    if (state) state.cqApiClient = client;
    return client;
  }

  function setCqApiStatus(status, source, error) {
    const state = getStateSafe();
    if (!state) return;
    state.cqApiStatus = status || 'pending';
    state.cqApiSource = source || state.cqApiSource || cqApiProxyBase;
    state.cqApiError = error || null;
    updateDataStatusSafe();
  }

  function isRateLimitText(value) {
    const msg = String(value || '');
    return /\b429\b/i.test(msg) || /rate\s*limit/i.test(msg) || /Transient API status 429/i.test(msg);
  }

  function scheduleCqApiRetry(fn, delayMs = 15000) {
    if (cqApiRetryTimer) return;
    const win = getWindowSafe();
    cqApiRetryTimer = win.setTimeout(() => {
      cqApiRetryTimer = null;
      fn();
    }, Math.max(1000, Number(delayMs) || 15000));
  }

  function scheduleCompetitorCoachRetry(fn, delayMs = 15000) {
    if (competitorCoachRetryTimer) return;
    const win = getWindowSafe();
    competitorCoachRetryTimer = win.setTimeout(() => {
      competitorCoachRetryTimer = null;
      fn();
    }, Math.max(1000, Number(delayMs) || 15000));
  }

  async function triggerCqApiEnrichmentForSlot(slot, slotId = 'A') {
    if (!slot || !slot.qsoData || !slot.derived) return;

    if (!slot.apiEnrichment) slot.apiEnrichment = createApiState();

    let client = null;
    try {
      client = await ensureCqApiClient();
    } catch (err) {
      slot.apiEnrichment = {
        ...createApiState(),
        status: 'error',
        error: err && err.message ? err.message : 'CQ API module load failed'
      };
      setCqApiStatus('error', cqApiProxyBase, slot.apiEnrichment.error);
      renderActiveReportSafe();
      return;
    }

    const req = buildCqApiRequest(slot);
    const supported = req && (typeof client.isSupportedContest === 'function'
      ? client.isSupportedContest(req.contestId)
      : cqApiSupportedContests.has(req?.contestId));
    if (!req || !supported) {
      slot.apiEnrichment = {
        ...createApiState(),
        status: 'unsupported',
        error: 'Contest not supported for CQ API enrichment'
      };
      if (String(slotId).toUpperCase() === 'A') {
        setCqApiStatus('pending', cqApiProxyBase, null);
      }
      renderActiveReportSafe();
      return;
    }

    const token = `${req.contestId}:${req.callsign}:${req.year}:${req.mode}:${Date.now()}`;
    slot.apiEnrichment = {
      ...createApiState(),
      status: 'loading',
      requestKey: token
    };
    setCqApiStatus('loading', cqApiProxyBase, null);
    renderActiveReportSafe();

    try {
      const result = await client.enrich(req);
      if (!slot.apiEnrichment || slot.apiEnrichment.requestKey !== token) return;

      if (result?.ok) {
        slot.apiEnrichment = {
          ...createApiState(),
          status: 'ready',
          source: result.source || null,
          helperActive: Boolean(result.helperActive),
          data: result
        };
        setCqApiStatus('ok', result.source || cqApiProxyBase, null);
      } else if (result?.unsupported) {
        slot.apiEnrichment = {
          ...createApiState(),
          status: 'unsupported',
          error: result.reason || 'Unsupported'
        };
        setCqApiStatus('pending', cqApiProxyBase, null);
      } else {
        const errText = result?.error || result?.statusMessage || 'CQ API request failed';
        if (isRateLimitText(errText)) {
          slot.apiEnrichment = {
            ...createApiState(),
            status: 'loading',
            requestKey: token
          };
          setCqApiStatus('qrx', result?.source || cqApiProxyBase, null);
          scheduleCqApiRetry(() => triggerCqApiEnrichmentForSlot(slot, slotId), 15000);
        } else {
          slot.apiEnrichment = {
            ...createApiState(),
            status: 'error',
            error: errText
          };
          setCqApiStatus('error', result?.source || cqApiProxyBase, slot.apiEnrichment.error);
        }
      }
    } catch (err) {
      if (!slot.apiEnrichment || slot.apiEnrichment.requestKey !== token) return;
      const msg = err && err.message ? err.message : 'CQ API request failed';
      if (isRateLimitText(msg)) {
        slot.apiEnrichment = {
          ...createApiState(),
          status: 'loading',
          requestKey: token
        };
        setCqApiStatus('qrx', cqApiProxyBase, null);
        scheduleCqApiRetry(() => triggerCqApiEnrichmentForSlot(slot, slotId), 15000);
      } else {
        slot.apiEnrichment = {
          ...createApiState(),
          status: 'error',
          error: msg
        };
        setCqApiStatus('error', cqApiProxyBase, slot.apiEnrichment.error);
      }
    }
    renderActiveReportSafe();
  }

  function buildCompetitorCoachContext(client) {
    const state = getStateSafe();
    if (!state?.qsoData || !state?.derived) {
      return { ok: false, reason: 'Load Log A first.' };
    }
    const contestIdText = String(state.derived.contestMeta?.contestId || '');
    const archivePath = String(state.logFile?.path || '');
    const contestId = client?.normalizeContestId
      ? client.normalizeContestId(contestIdText, archivePath)
      : normalizeContestIdForCoach(contestIdText, archivePath);
    if (!contestId || !cqApiSupportedContests.has(contestId)) {
      return { ok: false, reason: 'This contest is not supported for CQ competitor analysis.' };
    }
    const callsign = normalizeCallSafe(
      state.derived.contestMeta?.stationCallsign || deriveStationCallsignSafe(state.qsoData.qsos)
    );
    if (!callsign) {
      return { ok: false, reason: 'Station callsign not found in the loaded log.' };
    }
    const mode = typeof inferApiMode === 'function' ? inferApiMode(state, contestId) : '';
    if (!mode) {
      return { ok: false, reason: 'Unable to infer mode for CQ competitor lookup.' };
    }
    const minTs = state.derived.timeRange?.minTs;
    const year = Number.isFinite(minTs) ? new Date(minTs).getUTCFullYear() : null;
    if (!Number.isFinite(year)) {
      return { ok: false, reason: 'Unable to infer contest year from the loaded log.' };
    }

    const stationPrefix = lookupPrefixSafe(callsign) || lookupPrefixSafe(baseCallSafe(callsign));
    const scopeValues = {
      dxcc: String(stationPrefix?.prefix || '').trim().toUpperCase(),
      continent: normalizeContinentSafe(stationPrefix?.continent || ''),
      cq_zone: Number.isFinite(stationPrefix?.cqZone) ? String(stationPrefix.cqZone) : '',
      itu_zone: Number.isFinite(stationPrefix?.ituZone) ? String(stationPrefix.ituZone) : ''
    };

    const targetCategory = resolveCoachCategoryFromApiData(
      state.apiEnrichment?.data,
      state.derived.contestMeta?.category,
      year,
      callsign
    );

    return {
      ok: true,
      contestId,
      mode,
      year,
      callsign,
      scopeValues,
      targetCategory
    };
  }

  function buildCompetitorCoachRequestKey(context, scopeType, categoryMode, targetCategory) {
    const state = getStateSafe();
    return [
      state?.logVersion || 0,
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
    const call = normalizeCallSafe(callsign || '');
    const y = Number(year);
    const contest = String(contestId || '').trim().toUpperCase();
    const normalizedMode = String(mode || '').trim().toLowerCase();
    if (!call || !Number.isFinite(y) || !contest || !normalizedMode) return '';
    return `${call}|${Math.round(y)}|${contest}|${normalizedMode}`;
  }

  async function triggerCompetitorCoachRefresh(force = false) {
    const state = getStateSafe();
    if (!state?.qsoData || !state?.derived) return;
    const previous = state.competitorCoach || createCoachState();

    let client;
    try {
      client = await ensureCqApiClient();
    } catch (err) {
      state.competitorCoach = {
        ...createCoachState(previous),
        status: 'error',
        error: err && err.message ? err.message : 'CQ API client unavailable'
      };
      if (getActiveReportIdSafe() === 'competitor_coach') renderActiveReportSafe();
      return;
    }

    const context = buildCompetitorCoachContext(client);
    if (!context.ok) {
      state.competitorCoach = {
        ...createCoachState(previous),
        status: 'error',
        error: context.reason || 'Competitor context unavailable'
      };
      if (getActiveReportIdSafe() === 'competitor_coach') renderActiveReportSafe();
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
        ...createCoachState(previous),
        status: 'error',
        scopeType,
        categoryMode,
        targetCategory,
        error: `No ${formatCoachScopeTitle(scopeType)} value found for the station.`
      };
      if (getActiveReportIdSafe() === 'competitor_coach') renderActiveReportSafe();
      return;
    }

    const requestKey = buildCompetitorCoachRequestKey(context, scopeType, categoryMode, targetCategory);
    if (!force && previous.requestKey === requestKey && (previous.status === 'loading' || previous.status === 'ready')) {
      return;
    }

    state.competitorCoach = {
      ...createCoachState(previous),
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
    if (getActiveReportIdSafe() === 'competitor_coach') renderActiveReportSafe();

    try {
      if (typeof loadCompetitorCoachModule === 'function') await loadCompetitorCoachModule();
      const win = getWindowSafe();
      if (!win.SH6CompetitorCoach || typeof win.SH6CompetitorCoach.buildModel !== 'function') {
        throw new Error('Competitor coach module unavailable.');
      }
      const scoreRes = await client.score(context.contestId, context.mode, String(context.year), '*');
      let cohortRows = scoreRes?.ok && Array.isArray(scoreRes.rows) ? scoreRes.rows.slice() : [];
      let statusMessage = scoreRes?.statusMessage || '';
      let sourceKind = 'official';
      let rawSource = '';

      const selfRawCategory = resolveCoachCategoryFromApiData(
        state.apiEnrichment?.data,
        state.derived?.contestMeta?.category,
        context.year,
        context.callsign
      );
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
        const key = normalizeCallSafe(callsign);
        if (!key) return { dxcc: '', continent: '', cqZone: '', ituZone: '' };
        if (callMetaCache.has(key)) return callMetaCache.get(key);
        const prefix = lookupPrefixSafe(key) || lookupPrefixSafe(baseCallSafe(key));
        const meta = {
          dxcc: String(prefix?.prefix || '').trim().toUpperCase(),
          continent: normalizeContinentSafe(prefix?.continent || ''),
          cqZone: Number.isFinite(prefix?.cqZone) ? String(prefix.cqZone) : '',
          ituZone: Number.isFinite(prefix?.ituZone) ? String(prefix.ituZone) : ''
        };
        callMetaCache.set(key, meta);
        return meta;
      };

      const model = win.SH6CompetitorCoach.buildModel({
        rows: cohortRows,
        scopeType,
        scopeValue: targetScopeValue,
        categoryMode,
        targetCategory: effectiveTargetCategory,
        stationCall: context.callsign,
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
      trackEventSafe('competitor_coach_refresh', {
        contest: context.contestId,
        mode: context.mode,
        year: context.year,
        scope: scopeType,
        category_mode: categoryMode,
        source_kind: sourceKind,
        cohort_rows: state.competitorCoach.totalRows
      });
    } catch (err) {
      const msg = err && err.message ? err.message : 'Competitor cohort fetch failed.';
      if (isRateLimitText(msg)) {
        state.competitorCoach = {
          ...state.competitorCoach,
          status: 'loading',
          error: null,
          statusMessage: 'QRX (rate limited). Retrying...'
        };
        setCqApiStatus('qrx', cqApiProxyBase, null);
        scheduleCompetitorCoachRetry(() => triggerCompetitorCoachRefresh(true), 15000);
        if (getActiveReportIdSafe() === 'competitor_coach') renderActiveReportSafe();
        return;
      }
      state.competitorCoach = {
        ...state.competitorCoach,
        status: 'error',
        error: msg,
        rows: [],
        totalRows: 0,
        currentRow: null,
        closestRivals: [],
        gapDriver: null,
        insights: []
      };
    }

    if (getActiveReportIdSafe() === 'competitor_coach') renderActiveReportSafe();
  }

  function ensureCompareCountForSlot(slotId) {
    const state = getStateSafe();
    const key = String(slotId || '').toUpperCase();
    const needed = key === 'B' ? 2 : key === 'C' ? 3 : key === 'D' ? 4 : 1;
    if (state && Number(state.compareCount) < needed && typeof setCompareCount === 'function') {
      setCompareCount(needed, true);
    }
  }

  async function loadCqApiHistoryArchiveToSlot(request) {
    if (typeof loadArchiveClientModule !== 'function') {
      throw new Error('Archive client unavailable');
    }
    const client = await loadArchiveClientModule();
    const slotId = String(request?.slotId || '').toUpperCase();
    if (!compareSlotIds.includes(slotId)) throw new Error('Invalid target compare slot');
    const callsign = normalizeCallSafe(request?.callsign || '');
    const contestId = String(request?.contestId || '').trim().toUpperCase();
    const mode = String(request?.mode || '').trim().toLowerCase();
    const year = Number(request?.year);
    if (!callsign || !contestId || !mode || !Number.isFinite(year)) {
      throw new Error('Missing callsign, contest, mode, or year');
    }

    const rows = await client.queryRowsByCallsign(callsign);
    const match = client.pickHistoryMatch(rows, { callsign, contestId, mode, year });
    if (!match?.path) {
      throw new Error(`No archive log found for ${callsign} ${contestId} ${year}`);
    }

    const downloaded = await client.fetchArchiveLogText(match.path);
    if (!downloaded?.text) throw new Error(`Failed to download archive log ${match.path}`);

    ensureCompareCountForSlot(slotId);
    if (typeof setSlotAction === 'function') setSlotAction(slotId, 'archive');
    const fileName = String(match.path).split('/').pop() || `${callsign}.log`;
    if (typeof applyLoadedLogToSlot !== 'function') {
      throw new Error('Slot apply handler unavailable');
    }
    await applyLoadedLogToSlot(
      slotId,
      downloaded.text,
      fileName,
      downloaded.text.length,
      'Archive',
      typeof getStatusElBySlot === 'function' ? getStatusElBySlot(slotId) : null,
      match.path
    );
    return {
      slotId,
      path: match.path,
      source: downloaded.source || ''
    };
  }

  return {
    normalizeCoachCategory,
    normalizeCoachScopeType,
    formatCoachScopeTitle,
    buildCqApiRequest,
    ensureCqApiClient,
    buildCompetitorCoachContext,
    buildCoachRowKey,
    triggerCqApiEnrichmentForSlot,
    triggerCompetitorCoachRefresh,
    loadCqApiHistoryArchiveToSlot
  };
}
