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
          if (this.debug) console.log('[CQAPI] request', url);
          try {
            const { httpStatus, payload } = await this._fetchJson(url);
            const result = {
              status: Number.isFinite(Number(payload?.status)) ? Number(payload.status) : httpStatus,
              statusMessage: parseStatusMessage(payload),
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
            if (this.debug) console.warn('[CQAPI] source failed', url, err);
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
        return { ok: false, map: {}, source: resp.url, statusMessage: resp.statusMessage };
      }
      const map = {};
      Object.keys(resp.payload).forEach((key) => {
        if (key === 'status' || key === 'status_message' || key === 'status message') return;
        map[key.toUpperCase()] = safeString(resp.payload[key]);
      });
      return { ok: true, map, source: resp.url, statusMessage: resp.statusMessage };
    }

    async catlist(contestId) {
      const resp = await this._request(contestId, 'catlist', 'catlist', LIST_TTL_MS, true);
      if (resp.status !== 200 || !Array.isArray(resp.payload?.data)) {
        return { ok: false, list: [], source: resp.url, statusMessage: resp.statusMessage };
      }
      const list = resp.payload.data.map((row) => ({
        category: normalizeCategoryLabel(row?.category || ''),
        description: safeString(row?.description || '').trim()
      })).filter((row) => row.category);
      return { ok: true, list, source: resp.url, statusMessage: resp.statusMessage };
    }

    async clublist(contestId) {
      const resp = await this._request(contestId, 'clublist', 'clublist', LIST_TTL_MS, true);
      if (resp.status !== 200 || !Array.isArray(resp.payload?.data)) {
        return { ok: false, list: [], source: resp.url, statusMessage: resp.statusMessage };
      }
      const list = resp.payload.data.map((row) => ({
        name: safeString(row?.name || '').trim(),
        region: safeString(row?.region || '').trim().toUpperCase()
      })).filter((row) => row.name);
      return { ok: true, list, source: resp.url, statusMessage: resp.statusMessage };
    }

    async score(contestId, mode, year, callsign) {
      const path = this._buildScorePath(mode, year, callsign);
      const resp = await this._request(contestId, path, `score:${mode}:${year}:${callsign}`, SCORE_TTL_MS, false);
      if (resp.status !== 200 || !Array.isArray(resp.payload?.data)) {
        return { ok: false, rows: [], source: resp.url, statusMessage: resp.statusMessage };
      }
      const rows = resp.payload.data
        .map((row) => normalizeScoreRow(contestId, mode, row))
        .filter(Boolean);
      return { ok: true, rows, source: resp.url, statusMessage: resp.statusMessage };
    }

    async history(contestId, mode, callsign) {
      return this.score(contestId, mode, '*', callsign);
    }

    async record(contestId, mode, category, geo) {
      const path = this._buildRecordPath(mode, category, geo);
      const resp = await this._request(contestId, path, `record:${mode}:${category}:${geo}`, RECORD_TTL_MS, false);
      if (resp.status !== 200 || !resp.payload || typeof resp.payload !== 'object') {
        return { ok: false, row: null, source: resp.url, statusMessage: resp.statusMessage };
      }
      const row = normalizeRecordRow(contestId, mode, resp.payload);
      if (!row) return { ok: false, row: null, source: resp.url, statusMessage: resp.statusMessage };
      return { ok: true, row, source: resp.url, statusMessage: resp.statusMessage };
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

        const categories = dedupe([...(params?.categories || []), '*']);
        const geos = dedupe([...(params?.geos || []), 'WORLD']);

        const [geoRes, catRes, currentRes, historyRes] = await Promise.all([
          this.geolist(contestId),
          this.catlist(contestId),
          this.score(contestId, mode, year, callsign),
          this.history(contestId, mode, callsign)
        ]);

        let recordRes = { ok: false, row: null, source: null, statusMessage: '' };
        let matchedCategory = null;
        let matchedGeo = null;

        for (const category of categories) {
          if (recordRes.ok) break;
          for (const geo of geos) {
            const attempt = await this.record(contestId, mode, category, geo);
            if (attempt.ok) {
              recordRes = attempt;
              matchedCategory = category;
              matchedGeo = geo;
              break;
            }
          }
        }

        const history = (historyRes.rows || []).slice().sort((a, b) => {
          const ay = Number(a?.year) || 0;
          const by = Number(b?.year) || 0;
          return by - ay;
        });

        const source = currentRes.source || historyRes.source || recordRes.source || geoRes.source || catRes.source || '';
        const helperActive = /azure\.s53m\.com/i.test(source);

        return {
          ok: true,
          contestId,
          mode,
          callsign,
          year,
          currentScore: currentRes.ok ? (currentRes.rows[0] || null) : null,
          history,
          record: recordRes.ok ? recordRes.row : null,
          matchedCategory,
          matchedGeo,
          categoriesTried: categories,
          geosTried: geos,
          labels: {
            geolist: geoRes.ok ? geoRes.map : {},
            catlist: catRes.ok ? catRes.list : []
          },
          source,
          helperActive,
          statusMessage: currentRes.statusMessage || historyRes.statusMessage || recordRes.statusMessage || ''
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
