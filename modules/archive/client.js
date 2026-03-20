export function createArchiveClient(deps = {}) {
  const {
    sqlJsBaseUrls,
    archiveBaseUrl,
    archiveFallbackBaseUrls,
    buildFetchUrls,
    normalizeCall,
    normalizeArchiveContestToken,
    normalizeArchiveModeToken,
    getArchiveShardUrlsForCallsign,
    withTimeoutPromise,
    ensureDurableStorageReady,
    runEngineTask
  } = deps;

  const archiveShardDbCache = new Map();
  const archiveRowsByCallCache = new Map();
  let archiveSqlLoader = null;
  let archiveSqlBaseUrl = null;

  async function loadArchiveSqlJs() {
    if (archiveSqlLoader) return archiveSqlLoader;
    archiveSqlLoader = (async () => {
      if (typeof window.initSqlJs === 'function') {
        archiveSqlBaseUrl = archiveSqlBaseUrl || sqlJsBaseUrls[0];
        return window.initSqlJs({ locateFile: (file) => `${archiveSqlBaseUrl}${file}` });
      }
      let lastErr = null;
      for (const base of sqlJsBaseUrls) {
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
    const fetchUrls = typeof buildFetchUrls === 'function' ? buildFetchUrls(shardUrls) : shardUrls;
    let lastErr = null;
    for (const url of fetchUrls) {
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

  async function queryRowsByCallsign(callsign) {
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

  function pickHistoryMatch(rows, request) {
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

  async function fetchArchiveLogText(path) {
    if (!path) return null;
    const storage = await ensureDurableStorageReady().catch(() => null);
    const cached = await storage?.loadArchiveLog?.(path).catch(() => null);
    if (cached && typeof cached.text === 'string') {
      return {
        text: cached.text,
        source: cached.meta?.source || 'Browser cache'
      };
    }
    const urls = [];
    const normalizedPath = String(path || '').replace(/^\/+/, '');
    const primary = `${String(archiveBaseUrl || '').replace(/\/+$/, '')}/${normalizedPath}`;
    urls.push(primary);
    (archiveFallbackBaseUrls || []).forEach((baseUrl) => {
      const fallbackUrl = `${String(baseUrl || '').replace(/\/+$/, '')}/${normalizedPath}`;
      if (!urls.includes(fallbackUrl)) urls.push(fallbackUrl);
    });
    const fetchUrls = typeof buildFetchUrls === 'function' ? buildFetchUrls(urls) : urls;
    try {
      const workerResult = await runEngineTask('archiveText', { urls: fetchUrls });
      if (workerResult && typeof workerResult.text === 'string') {
        const source = workerResult.url || primary;
        storage?.saveArchiveLog?.(path, workerResult.text, { path, source }).catch(() => {});
        return {
          text: workerResult.text,
          source
        };
      }
    } catch (err) {
      /* fall back to main-thread fetch */
    }
    for (const url of fetchUrls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const text = await res.text();
          storage?.saveArchiveLog?.(path, text, { path, source: url }).catch(() => {});
          return { text, source: url };
        }
      } catch (err) {
        /* ignore and try next */
      }
    }
    return null;
  }

  return {
    fetchArchiveLogText,
    pickHistoryMatch,
    queryRowsByCallsign
  };
}
