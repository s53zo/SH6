(() => {
  'use strict';

  const CONTESTS = {
    CQWW: {
      id: 'CQWW',
      directBase: 'https://cqww.com',
      proxyKey: 'cqww',
      modes: ['cw', 'ph']
    },
    CQWPX: {
      id: 'CQWPX',
      directBase: 'https://cqwpx.com',
      proxyKey: 'cqwpx',
      modes: ['cw', 'ph']
    },
    CQWWRTTY: {
      id: 'CQWWRTTY',
      directBase: 'https://cqwwrtty.com',
      proxyKey: 'cqwwrtty',
      modes: ['rtty', 'ry']
    },
    CQWPXRTTY: {
      id: 'CQWPXRTTY',
      directBase: 'https://cqwpxrtty.com',
      proxyKey: 'cqwpxrtty',
      modes: ['rtty']
    },
    CQ160: {
      id: 'CQ160',
      directBase: 'https://cq160.com',
      proxyKey: 'cq160',
      modes: ['cw', 'ph']
    }
  };

  const LIST_TTL_MS = 1000 * 60 * 60 * 24;
  const SCORE_TTL_MS = 1000 * 60 * 30;
  const RECORD_TTL_MS = 1000 * 60 * 60;
  const RAW_TTL_MS = 1000 * 60 * 5;
  const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

  function safeString(value) {
    return value == null ? '' : String(value);
  }

  function parseNumber(value) {
    if (value == null || value === '') return null;
    const n = Number(String(value).replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  }

  function normalizeModeToken(value) {
    const v = safeString(value).trim().toLowerCase();
    if (!v) return '';
    if (v === 'ssb' || v === 'phone') return 'ph';
    if (v === 'ry') return 'rtty';
    return v;
  }

  function normalizeModeLabel(value) {
    const v = normalizeModeToken(value);
    if (!v) return '';
    if (v === 'ph') return 'ssb';
    return v;
  }

  function encodePathSegment(value) {
    return encodeURIComponent(safeString(value).trim())
      .replace(/%2A/g, '*')
      .replace(/%20/g, '+');
  }

  function encodeCallPath(callsign) {
    return safeString(callsign)
      .trim()
      .split('/')
      .filter(Boolean)
      .map(encodePathSegment)
      .join('/');
  }

  function dedupe(list) {
    const out = [];
    const seen = new Set();
    (list || []).forEach((item) => {
      const key = safeString(item).trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(key);
    });
    return out;
  }

  function parseStatusMessage(payload) {
    if (!payload || typeof payload !== 'object') return '';
    return safeString(payload.status_message || payload['status message'] || payload.message || '').trim();
  }

  function resolveApiStatus(payload, httpStatus) {
    const status = Number(payload?.status);
    return Number.isFinite(status) ? status : Number(httpStatus);
  }

  function isRetryableStatus(status) {
    return RETRYABLE_STATUSES.has(Number(status));
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
  }

  function normalizeContestFromText(text) {
    const raw = safeString(text).toUpperCase().replace(/[_\s]+/g, '-');
    if (!raw) return null;
    if (raw.includes('CQ-WPX-RTTY') || raw === 'CQWPXRTTY') return 'CQWPXRTTY';
    if (raw.includes('CQ-WW-RTTY') || raw === 'CQWWRTTY') return 'CQWWRTTY';
    if (raw.includes('CQ-WPX') || raw === 'CQWPX') return 'CQWPX';
    if (raw.includes('CQ-WW') || raw === 'CQWW') return 'CQWW';
    if (raw.includes('CQ-160') || raw === 'CQ160') return 'CQ160';
    return null;
  }

  function normalizeContestFromPath(path) {
    const first = safeString(path).split('/').filter(Boolean)[0] || '';
    const p = first.toUpperCase();
    if (p === 'CQWW') return 'CQWW';
    if (p === 'CQWPX') return 'CQWPX';
    if (p === 'CQWWRTTY') return 'CQWWRTTY';
    if (p === 'CQWPXRTTY') return 'CQWPXRTTY';
    if (p === 'CQ160') return 'CQ160';
    return null;
  }

  function normalizeCategoryLabel(value) {
    return safeString(value).replace(/%20/g, ' ').replace(/\+/g, ' ').trim().toUpperCase();
  }

  function sumBreakdown(map) {
    let total = 0;
    let hasAny = false;
    Object.values(map || {}).forEach((value) => {
      if (!Number.isFinite(value)) return;
      total += value;
      hasAny = true;
    });
    return hasAny ? total : null;
  }

  function getScoreMultiplierBreakdown(contestId, row) {
    const breakdown = {};
    if (contestId === 'CQWW') {
      const z = parseNumber(row.z);
      const c = parseNumber(row.c);
      if (Number.isFinite(z)) breakdown.z = z;
      if (Number.isFinite(c)) breakdown.c = c;
      return breakdown;
    }
    if (contestId === 'CQWWRTTY') {
      const z = parseNumber(row.z);
      const c = parseNumber(row.c);
      const s = parseNumber(row.s);
      if (Number.isFinite(z)) breakdown.z = z;
      if (Number.isFinite(c)) breakdown.c = c;
      if (Number.isFinite(s)) breakdown.s = s;
      return breakdown;
    }
    if (contestId === 'CQ160') {
      const wve = parseNumber(row.wve);
      const c = parseNumber(row.c);
      if (Number.isFinite(wve)) breakdown.wve = wve;
      if (Number.isFinite(c)) breakdown.c = c;
      return breakdown;
    }
    const m = parseNumber(row.m);
    if (Number.isFinite(m)) breakdown.m = m;
    return breakdown;
  }

  function getRecordMultiplierBreakdown(contestId, row) {
    const breakdown = {};
    if (Number.isFinite(parseNumber(row.mult))) {
      breakdown.m = parseNumber(row.mult);
    }
    if (contestId === 'CQWW') {
      const z = parseNumber(row.multz);
      const c = parseNumber(row.multc);
      if (Number.isFinite(z)) breakdown.z = z;
      if (Number.isFinite(c)) breakdown.c = c;
      return breakdown;
    }
    if (contestId === 'CQWWRTTY') {
      const z = parseNumber(row.multz);
      const c = parseNumber(row.multc);
      const s = parseNumber(row.mults);
      if (Number.isFinite(z)) breakdown.z = z;
      if (Number.isFinite(c)) breakdown.c = c;
      if (Number.isFinite(s)) breakdown.s = s;
      return breakdown;
    }
    if (contestId === 'CQ160') {
      const wve = parseNumber(row.multwve);
      const c = parseNumber(row.multc);
      if (Number.isFinite(wve)) breakdown.wve = wve;
      if (Number.isFinite(c)) breakdown.c = c;
      return breakdown;
    }
    return breakdown;
  }

  function normalizeScoreRow(contestId, mode, row) {
    if (!row || typeof row !== 'object') return null;
    const multBreakdown = getScoreMultiplierBreakdown(contestId, row);
    const multTotal = sumBreakdown(multBreakdown);
    return {
      contest: contestId,
      mode: normalizeModeLabel(mode || row.mode),
      year: parseNumber(row.yr),
      callsign: safeString(row.callsign || '').toUpperCase(),
      category: normalizeCategoryLabel(row.cat || ''),
      score: parseNumber(row.score),
      qsos: parseNumber(row.q || row.qsos),
      multTotal,
      multBreakdown,
      operators: safeString(row.operators || ''),
      geo: safeString(row.cty || '').toUpperCase() || null,
      raw: row
    };
  }

  function normalizeRecordRow(contestId, mode, row) {
    if (!row || typeof row !== 'object') return null;
    const multBreakdown = getRecordMultiplierBreakdown(contestId, row);
    const multTotal = sumBreakdown(multBreakdown);
    return {
      contest: contestId,
      mode: normalizeModeLabel(mode || row.mode),
      category: normalizeCategoryLabel(row.category || ''),
      geo: safeString(row.geo || '').toUpperCase(),
      year: parseNumber(row.year),
      callsign: safeString(row.call || '').toUpperCase(),
      score: parseNumber(row.score),
      qsos: parseNumber(row.qsos),
      multTotal,
      multBreakdown,
      operators: safeString(row.operators || ''),
      raw: row
    };
  }

  function normalizeRawScoreRow(contestId, mode, row) {
    if (!row || typeof row !== 'object') return null;
    const score = parseNumber(row.rawscore ?? row.raw_score ?? row.score);
    if (!Number.isFinite(score)) return null;
    return {
      contest: contestId,
      mode: normalizeModeLabel(mode || row.mode),
      year: parseNumber(row.year ?? row.yr),
      callsign: safeString(row.callsign || row.call || '').toUpperCase(),
      category: normalizeCategoryLabel(row.category || row.cat || ''),
      score,
      qsos: parseNumber(row.qsos || row.q),
      multTotal: parseNumber(row.mult || row.m),
      multBreakdown: {},
      operators: safeString(row.operators || ''),
      geo: safeString(row.geo || row.cty || '').toUpperCase() || null,
      isRaw: true,
      raw: row
    };
  }

  function sanitizeCallsign(value) {
    const call = safeString(value).trim().toUpperCase();
    if (!call) return '';
    return call.replace(/\s+/g, '');
  }

  class CqApiClient {
    constructor(options = {}) {
      this.timeoutMs = Math.max(1000, Number(options.timeoutMs) || 9000);
      this.proxyBase = safeString(options.proxyBase || '').replace(/\/$/, '');
      this.useProxy = options.useProxy !== false;
      this.useDirect = options.useDirect !== false;
      this.debug = Boolean(options.debug);
      this.maxAttempts = Math.max(1, Number(options.maxAttempts) || 3);
      this.retryBackoffMs = Math.max(60, Number(options.retryBackoffMs) || 220);
      this.storagePrefix = safeString(options.storagePrefix || 'sh6_cq_api_v1_');
      this.cache = new Map();
      this.inFlight = new Map();
    }

    normalizeContestId(contestText, archivePath) {
      return normalizeContestFromPath(archivePath) || normalizeContestFromText(contestText) || null;
    }

    isSupportedContest(contestId) {
      return Boolean(CONTESTS[contestId]);
    }

    normalizeMode(contestId, mode) {
      const contest = CONTESTS[contestId];
      if (!contest) return '';
      const normalized = normalizeModeToken(mode);
      if (contestId === 'CQWWRTTY' || contestId === 'CQWPXRTTY') {
        return 'rtty';
      }
      if (!normalized) return '';
      if (normalized === 'rtty') return '';
      if (normalized === 'cw' || normalized === 'ph') return normalized;
      return '';
    }

    _getSources(contestId) {
      const contest = CONTESTS[contestId];
      if (!contest) return [];
      const out = [];
      if (this.useProxy && this.proxyBase) {
        out.push({
          kind: 'proxy',
          base: this.proxyBase,
          contest,
          label: `${this.proxyBase}/${contest.proxyKey}`
        });
      }
      if (this.useDirect) {
        out.push({
          kind: 'direct',
          base: contest.directBase,
          contest,
          label: `${contest.directBase}/api/get`
        });
      }
      return out;
    }

    _buildUrl(source, endpointPath) {
      const path = safeString(endpointPath).replace(/^\/+/, '');
      if (source.kind === 'proxy') {
        return `${source.base}/${source.contest.proxyKey}/${path}`;
      }
      return `${source.base}/api/get/${path}`;
    }

    _cacheGet(key) {
      const hit = this.cache.get(key);
      if (!hit) return null;
      if (Date.now() > hit.expiresAt) {
        this.cache.delete(key);
        return null;
      }
      return hit.value;
    }

    _cacheSet(key, value, ttlMs) {
      this.cache.set(key, {
        value,
        expiresAt: Date.now() + Math.max(0, Number(ttlMs) || 0)
      });
    }

    _storageGet(key) {
      try {
        const raw = localStorage.getItem(this.storagePrefix + key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || Date.now() > Number(parsed.expiresAt || 0)) {
          localStorage.removeItem(this.storagePrefix + key);
          return null;
        }
        return parsed.value || null;
      } catch (err) {
        return null;
      }
    }

    _storageSet(key, value, ttlMs) {
      try {
        localStorage.setItem(this.storagePrefix + key, JSON.stringify({
          value,
          expiresAt: Date.now() + Math.max(0, Number(ttlMs) || 0)
        }));
      } catch (err) {
        /* ignore storage errors */
      }
    }

    async _fetchJson(url) {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), this.timeoutMs);
      try {
        const res = await fetch(url, {
          method: 'GET',
          cache: 'no-store',
          signal: ctl.signal,
          headers: { Accept: 'application/json' }
        });
        const text = await res.text();
        let payload = null;
        try {
          payload = text ? JSON.parse(text) : null;
        } catch (err) {
          throw new Error(`Invalid JSON (HTTP ${res.status})`);
        }
        return { httpStatus: res.status, payload, url };
      } finally {
        clearTimeout(timer);
      }
    }

    async _request(contestId, endpointPath, cacheKey, ttlMs, useStorageCache = false) {
      const key = `${contestId}:${cacheKey}`;
      const memory = this._cacheGet(key);
      if (memory) return memory;
      if (useStorageCache) {
        const storage = this._storageGet(key);
        if (storage) {
          this._cacheSet(key, storage, ttlMs);
          return storage;
        }
      }
      if (this.inFlight.has(key)) return this.inFlight.get(key);

      const task = (async () => {
        const sources = this._getSources(contestId);
        if (!sources.length) throw new Error('No API sources configured');
        let lastNetworkErr = null;
        for (const source of sources) {
          const url = this._buildUrl(source, endpointPath);
          for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
            if (this.debug) console.log('[CQAPI] request', { url, attempt, maxAttempts: this.maxAttempts });
            try {
              const { httpStatus, payload } = await this._fetchJson(url);
              const status = resolveApiStatus(payload, httpStatus);
              const statusMessage = parseStatusMessage(payload);
              if (isRetryableStatus(status)) {
                lastNetworkErr = new Error(`Transient API status ${status}${statusMessage ? `: ${statusMessage}` : ''}`);
                if (attempt < this.maxAttempts) {
                  const waitMs = (this.retryBackoffMs * (2 ** (attempt - 1))) + Math.floor(Math.random() * 120);
                  if (this.debug) console.warn('[CQAPI] transient status, retrying', { url, attempt, status, waitMs });
                  await sleep(waitMs);
                  continue;
                }
                if (this.debug) console.warn('[CQAPI] transient status, trying next source', { url, status });
                break;
              }
              const result = {
                status,
                statusMessage,
                payload,
                url,
                sourceKind: source.kind,
                helperActive: /azure\.s53m\.com/i.test(url)
              };
              this._cacheSet(key, result, ttlMs);
              if (useStorageCache) this._storageSet(key, result, ttlMs);
              return result;
            } catch (err) {
              lastNetworkErr = err;
              if (attempt < this.maxAttempts) {
                const waitMs = (this.retryBackoffMs * (2 ** (attempt - 1))) + Math.floor(Math.random() * 120);
                if (this.debug) console.warn('[CQAPI] source failed, retrying', { url, attempt, waitMs, error: String(err?.message || err) });
                await sleep(waitMs);
                continue;
              }
              if (this.debug) console.warn('[CQAPI] source failed, trying next source', url, err);
            }
          }
        }
        throw lastNetworkErr || new Error('All API sources failed');
      })();

      this.inFlight.set(key, task);
      try {
        return await task;
      } finally {
        this.inFlight.delete(key);
      }
    }

    _buildScorePath(mode, year, callsign) {
      const yearSeg = safeString(year || '*').trim() || '*';
      const callPath = encodeCallPath(callsign);
      return `score/${encodePathSegment(mode)}/${encodePathSegment(yearSeg)}/${callPath}`;
    }

    _buildRecordPath(mode, category, geo) {
      return `record/${encodePathSegment(mode)}/${encodePathSegment(category)}/${encodePathSegment(geo)}`;
    }

    async geolist(contestId) {
      const resp = await this._request(contestId, 'geolist', 'geolist', LIST_TTL_MS, true);
      if (resp.status !== 200 || !resp.payload || typeof resp.payload !== 'object') {
        return { ok: false, map: {}, source: resp.url, statusMessage: resp.statusMessage, rawPayload: this.debug ? resp.payload : null };
      }
      const map = {};
      Object.keys(resp.payload).forEach((key) => {
        if (key === 'status' || key === 'status_message' || key === 'status message') return;
        map[key.toUpperCase()] = safeString(resp.payload[key]);
      });
      return { ok: true, map, source: resp.url, statusMessage: resp.statusMessage, rawPayload: this.debug ? resp.payload : null };
    }

    async catlist(contestId) {
      const resp = await this._request(contestId, 'catlist', 'catlist', LIST_TTL_MS, true);
      if (resp.status !== 200 || !Array.isArray(resp.payload?.data)) {
        return { ok: false, list: [], source: resp.url, statusMessage: resp.statusMessage, rawPayload: this.debug ? resp.payload : null };
      }
      const list = resp.payload.data.map((row) => ({
        category: normalizeCategoryLabel(row?.category || ''),
        description: safeString(row?.description || '').trim()
      })).filter((row) => row.category);
      return { ok: true, list, source: resp.url, statusMessage: resp.statusMessage, rawPayload: this.debug ? resp.payload : null };
    }

    async clublist(contestId) {
      const resp = await this._request(contestId, 'clublist', 'clublist', LIST_TTL_MS, true);
      if (resp.status !== 200 || !Array.isArray(resp.payload?.data)) {
        return { ok: false, list: [], source: resp.url, statusMessage: resp.statusMessage, rawPayload: this.debug ? resp.payload : null };
      }
      const list = resp.payload.data.map((row) => ({
        name: safeString(row?.name || '').trim(),
        region: safeString(row?.region || '').trim().toUpperCase()
      })).filter((row) => row.name);
      return { ok: true, list, source: resp.url, statusMessage: resp.statusMessage, rawPayload: this.debug ? resp.payload : null };
    }

    async score(contestId, mode, year, callsign) {
      const path = this._buildScorePath(mode, year, callsign);
      const resp = await this._request(contestId, path, `score:${mode}:${year}:${callsign}`, SCORE_TTL_MS, false);
      if (resp.status !== 200 || !Array.isArray(resp.payload?.data)) {
        return { ok: false, rows: [], source: resp.url, statusMessage: resp.statusMessage, rawPayload: this.debug ? resp.payload : null };
      }
      const rows = resp.payload.data
        .map((row) => normalizeScoreRow(contestId, mode, row))
        .filter(Boolean);
      return { ok: true, rows, source: resp.url, statusMessage: resp.statusMessage, rawPayload: this.debug ? resp.payload : null };
    }

    async raw(contestId, mode, callsign) {
      const callPath = encodeCallPath(callsign);
      const path = `raw/${encodePathSegment(mode)}/callsign/${callPath}`;
      const resp = await this._request(contestId, path, `raw:${mode}:${callsign}`, RAW_TTL_MS, false);
      if (resp.status !== 200 || !Array.isArray(resp.payload?.data)) {
        return { ok: false, rows: [], source: resp.url, statusMessage: resp.statusMessage, rawPayload: this.debug ? resp.payload : null };
      }
      const rows = resp.payload.data
        .map((row) => normalizeRawScoreRow(contestId, mode, row))
        .filter(Boolean);
      return { ok: true, rows, source: resp.url, statusMessage: resp.statusMessage, rawPayload: this.debug ? resp.payload : null };
    }

    async history(contestId, mode, callsign) {
      return this.score(contestId, mode, '*', callsign);
    }

    async record(contestId, mode, category, geo) {
      const path = this._buildRecordPath(mode, category, geo);
      const resp = await this._request(contestId, path, `record:${mode}:${category}:${geo}`, RECORD_TTL_MS, false);
      if (resp.status !== 200 || !resp.payload || typeof resp.payload !== 'object') {
        return { ok: false, row: null, source: resp.url, statusMessage: resp.statusMessage, rawPayload: this.debug ? resp.payload : null };
      }
      const row = normalizeRecordRow(contestId, mode, resp.payload);
      if (!row) return { ok: false, row: null, source: resp.url, statusMessage: resp.statusMessage, rawPayload: this.debug ? resp.payload : null };
      return { ok: true, row, source: resp.url, statusMessage: resp.statusMessage, rawPayload: this.debug ? resp.payload : null };
    }

    async enrich(params) {
      try {
        const contestId = this.normalizeContestId(params?.contestId, params?.archivePath);
        if (!contestId || !CONTESTS[contestId]) {
          return { ok: false, unsupported: true, reason: 'Unsupported contest' };
        }
        let mode = this.normalizeMode(contestId, params?.mode);
        if (!mode) {
          if (contestId === 'CQWWRTTY' || contestId === 'CQWPXRTTY') mode = 'rtty';
          else return { ok: false, unsupported: true, reason: 'Unsupported mode' };
        }
        const callsign = sanitizeCallsign(params?.callsign);
        if (!callsign) return { ok: false, error: 'Missing callsign' };
        const year = Number.isFinite(Number(params?.year)) ? String(Number(params.year)) : '*';

        const explicitCategories = dedupe((params?.categories || [])
          .map((category) => normalizeCategoryLabel(category))
          .filter(Boolean));
        const requestedGeos = dedupe((params?.geos || [])
          .map((geo) => safeString(geo).trim().toUpperCase())
          .filter(Boolean));
        const scopeGeoHints = params?.scopeGeos && typeof params.scopeGeos === 'object'
          ? params.scopeGeos
          : {};
        const scopeGeos = {
          dxcc: safeString(scopeGeoHints.dxcc || requestedGeos[0] || '').trim().toUpperCase(),
          continent: safeString(
            scopeGeoHints.continent
              || requestedGeos.find((geo) => ['AFR', 'ASI', 'EUR', 'NAM', 'OCE', 'SAM'].includes(geo))
              || ''
          ).trim().toUpperCase(),
          world: safeString(scopeGeoHints.world || 'WORLD').trim().toUpperCase() || 'WORLD'
        };
        const geos = dedupe([scopeGeos.dxcc, scopeGeos.continent, scopeGeos.world, ...requestedGeos].filter(Boolean));

        const [geoRes, catRes, currentRes, historyRes] = await Promise.all([
          this.geolist(contestId),
          this.catlist(contestId),
          this.score(contestId, mode, year, callsign),
          this.history(contestId, mode, callsign)
        ]);

        const history = (historyRes.rows || []).slice().sort((a, b) => {
          const ay = Number(a?.year) || 0;
          const by = Number(b?.year) || 0;
          return by - ay;
        });
        const selectedYear = Number.isFinite(Number(year)) ? Number(year) : null;
        const maxOfficialYear = history.length
          ? history.reduce((max, row) => {
            const y = Number(row?.year) || 0;
            return y > max ? y : max;
          }, 0)
          : 0;
        const nowYear = new Date().getUTCFullYear();
        let currentScore = currentRes.ok ? (currentRes.rows[0] || null) : null;
        let currentScoreSource = currentScore ? 'final' : null;
        let rawRes = null;
        const shouldTryRawFallback = !currentScore
          && Number.isFinite(selectedYear)
          && selectedYear >= (nowYear - 1)
          && selectedYear > maxOfficialYear;
        if (shouldTryRawFallback) {
          rawRes = await this.raw(contestId, mode, callsign);
          if (rawRes.ok) {
            const exactCall = rawRes.rows.find((row) => safeString(row?.callsign).toUpperCase() === callsign) || null;
            if (exactCall) {
              currentScore = {
                ...exactCall,
                year: Number.isFinite(selectedYear) ? selectedYear : exactCall.year
              };
              currentScoreSource = 'raw';
            }
          }
        }
        const preferredCategory = normalizeCategoryLabel(currentScore?.category || history[0]?.category || '');
        const categoriesTried = dedupe([preferredCategory, ...explicitCategories]
          .map((category) => normalizeCategoryLabel(category))
          .filter((category) => category && category !== '*'));
        const allowWildcardFallback = explicitCategories.includes('*') || categoriesTried.length === 0;
        if (allowWildcardFallback) categoriesTried.push('*');

        const scopePlan = [
          { scope: 'dxcc', scopeLabel: 'DXCC', geo: scopeGeos.dxcc, geoCandidates: dedupe([scopeGeos.dxcc]) },
          { scope: 'continent', scopeLabel: 'Continent', geo: scopeGeos.continent, geoCandidates: dedupe([scopeGeos.continent]) },
          { scope: 'world', scopeLabel: 'World', geo: scopeGeos.world, geoCandidates: dedupe([scopeGeos.world, '*']) }
        ];
        const recordsByScope = [];
        for (const scopeEntry of scopePlan) {
          const geo = safeString(scopeEntry.geo).trim().toUpperCase();
          let found = {
            scope: scopeEntry.scope,
            scopeLabel: scopeEntry.scopeLabel,
            geo,
            matchedGeo: null,
            category: null,
            row: null,
            source: null,
            statusMessage: '',
            rawPayload: null
          };
          const geoCandidates = Array.isArray(scopeEntry.geoCandidates) ? scopeEntry.geoCandidates : [geo];
          if (geoCandidates.length) {
            let scopeError = '';
            for (const geoCandidate of geoCandidates) {
              if (found.row) break;
              const candidateGeo = safeString(geoCandidate).trim().toUpperCase();
              if (!candidateGeo) continue;
              for (const category of categoriesTried) {
                try {
                  const attempt = await this.record(contestId, mode, category, candidateGeo);
                  if (attempt.ok) {
                    found = {
                      scope: scopeEntry.scope,
                      scopeLabel: scopeEntry.scopeLabel,
                      geo,
                      matchedGeo: attempt?.row?.geo || candidateGeo,
                      category,
                      row: attempt.row || null,
                      source: attempt.source || null,
                      statusMessage: attempt.statusMessage || '',
                      rawPayload: attempt.rawPayload || null
                    };
                    break;
                  }
                } catch (err) {
                  scopeError = err && err.message ? err.message : String(err);
                }
              }
            }
            if (!found.row && scopeError) found.statusMessage = scopeError;
          }
          recordsByScope.push(found);
        }
        const firstRecord = recordsByScope.find((entry) => entry && entry.row) || null;
        const matchedCategory = firstRecord?.category || null;
        const matchedGeo = firstRecord?.geo || null;
        const record = firstRecord?.row || null;
        const recordSource = firstRecord?.source || recordsByScope.find((entry) => entry?.source)?.source || null;
        const recordStatusMessage = firstRecord?.statusMessage || recordsByScope.find((entry) => entry?.statusMessage)?.statusMessage || '';

        const source = currentRes.source || historyRes.source || recordSource || geoRes.source || catRes.source || '';
        const helperActive = /azure\.s53m\.com/i.test(source);

        const statusMessage = [
          currentRes.statusMessage || '',
          currentScoreSource === 'raw' ? 'Showing raw score fallback (unofficial/live).' : ''
        ].filter(Boolean).join(' ').trim();

        return {
          ok: true,
          contestId,
          mode,
          callsign,
          year,
          currentScore,
          history,
          record,
          matchedCategory,
          matchedGeo,
          categoriesTried,
          geosTried: geos,
          recordsByScope: recordsByScope.map((entry) => ({
            scope: entry.scope,
            scopeLabel: entry.scopeLabel,
            geo: entry.geo,
            matchedGeo: entry.matchedGeo,
            category: entry.category,
            row: entry.row,
            source: entry.source,
            statusMessage: entry.statusMessage
          })),
          labels: {
            geolist: geoRes.ok ? geoRes.map : {},
            catlist: catRes.ok ? catRes.list : []
          },
          source,
          helperActive,
          currentScoreSource,
          statusMessage,
          debugPayload: this.debug ? {
            request: {
              contestId,
              mode,
              callsign,
              year,
              selectedYear,
              maxOfficialYear,
              nowYear,
              shouldTryRawFallback,
              explicitCategories,
              preferredCategory,
              categoriesTried,
              scopeGeos,
              geos
            },
            responses: {
              geolist: geoRes.rawPayload || null,
              catlist: catRes.rawPayload || null,
              currentScore: currentRes.rawPayload || null,
              history: historyRes.rawPayload || null,
              rawScore: rawRes?.rawPayload || null,
              recordsByScope: recordsByScope.reduce((acc, entry) => {
                if (!entry?.scope) return acc;
                acc[entry.scope] = entry.rawPayload || null;
                return acc;
              }, {})
            }
          } : null
        };
      } catch (err) {
        return {
          ok: false,
          error: err && err.message ? err.message : 'CQ API enrichment failed'
        };
      }
    }
  }

  const api = {
    version: '1.0.0',
    createClient(options) {
      return new CqApiClient(options);
    }
  };

  window.SH6CqApi = api;
})();
