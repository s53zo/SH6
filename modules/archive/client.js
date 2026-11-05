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
  const archiveShardInFlight = new Map();
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
    if(archiveShardInFlight.has(cacheKey)) return archiveShardInFlight.get(cacheKey);
    const pending=downloadArchiveShard(shardUrls,cacheKey);
    archiveShardInFlight.set(cacheKey,pending);
    try {return await pending;} finally {archiveShardInFlight.delete(cacheKey);}
  }

  async function downloadArchiveShard(shardUrls,cacheKey) {
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

  async function queryExactCallsign(normalized) {
    const db = await openArchiveShardDbForCallsign(normalized);
    const columnRows = db.exec('PRAGMA table_info(logs)');
    const columnNames = new Set((columnRows?.[0]?.values || []).map((row) => row?.[1]).filter(Boolean));
    const optionalColumns = ['subcontest', 'detail'].filter((column) => columnNames.has(column));
    const columns = ['path', 'contest', 'year', 'mode', 'season'].concat(optionalColumns);
    const stmt = db.prepare(`SELECT ${columns.join(', ')} FROM logs WHERE callsign = ?`);
    stmt.bind([normalized]);
    const rows = [];
    try {
      while (stmt.step()) rows.push(stmt.getAsObject());
    } finally {
      stmt.free();
    }
    return rows;
  }

  async function queryRowsByCallsign(callsign, options = {}) {
    const normalized = normalizeCall(callsign).replace(/\s+/g, '').replace(/_/g, '/');
    if (!normalized) return [];
    if (archiveRowsByCallCache.has(normalized)) {const rows=archiveRowsByCallCache.get(normalized);return options.withCoverage?{rows,partial:false}:rows;}
    // Archive filenames sometimes encode portable calls with underscores. Each
    // spelling hashes to its own shard, so a SQL alias in one DB is insufficient.
    const aliases = [...new Set([normalized, normalized.replace(/\//g, '_')])];
    const results = await Promise.allSettled(aliases.map(queryExactCallsign));
    const rows = [...new Map(results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
      .map((row) => [row.path, row])).values()];
    const failed = results.find((result) => result.status === 'rejected');
    if (failed && !rows.length) throw failed.reason;
    // A temporarily unavailable alias must be retried on the next search.
    if (!failed) archiveRowsByCallCache.set(normalized, rows);
    return options.withCoverage?{rows,partial:!!failed}:rows;
  }

  async function queryRowsByCallsigns(callsigns,{concurrency=4,onProgress=()=>{},signal}={}) {
    const canonical=value=>normalizeCall(value).replace(/\s+/g,'').replace(/_/g,'/');
    const results=new Map(),groups=new Map();
    for(const value of callsigns) {
      const normalized=canonical(value);if(!normalized || results.has(normalized))continue;
      if(archiveRowsByCallCache.has(normalized)){results.set(normalized,{rows:archiveRowsByCallCache.get(normalized),partial:false});continue;}
      results.set(normalized,{rows:[],partial:false});
      for(const alias of new Set([normalized,normalized.replace(/\//g,'_')])) {
        const urls=getArchiveShardUrlsForCallsign(alias),key=urls.join('|');
        if(!groups.has(key))groups.set(key,{representative:alias,aliases:new Set()});
        groups.get(key).aliases.add(alias);
      }
    }
    const work=[...groups.values()];let cursor=0,completed=0;
    await Promise.all(Array.from({length:Math.max(1,Math.min(8,concurrency))},async()=>{
      while(cursor<work.length) {
        if(signal?.aborted)throw Error('Archive lookup cancelled');
        const group=work[cursor++],aliases=[...group.aliases];
        try {
          const db=await openArchiveShardDbForCallsign(group.representative);
          if(signal?.aborted)throw Error('Archive lookup cancelled');
          const columns=new Set((db.exec('PRAGMA table_info(logs)')?.[0]?.values || []).map(row=>row[1]));
          const selected=['callsign','path','contest','year','mode','season',...['subcontest','detail'].filter(c=>columns.has(c))];
          for(let i=0;i<aliases.length;i+=400) {
            const chunk=aliases.slice(i,i+400),stmt=db.prepare(`SELECT ${selected.join(', ')} FROM logs WHERE callsign IN (${chunk.map(()=>'?').join(', ')})`);
            try {stmt.bind(chunk);while(stmt.step()){const row=stmt.getAsObject(),target=results.get(canonical(row.callsign));if(target)target.rows.push(row);}} finally {stmt.free();}
          }
        } catch(error) {
          if(signal?.aborted)throw error;
          for(const alias of aliases){const entry=results.get(canonical(alias));entry.partial=true;entry.error=error.message;}
        }
        onProgress({completed:++completed,total:work.length});
      }
    }));
    for(const [normalized,entry] of results) {
      entry.rows=[...new Map(entry.rows.map(row=>[row.path,row])).values()];
      if(!entry.partial)archiveRowsByCallCache.set(normalized,entry.rows);
    }
    return results;
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
        const fileCall = normalizeCall(baseName.replace(/\.[^.]+$/, '')).replace(/_/g, '/');
        const fileCallMatch = fileCall && fileCall === call.replace(/_/g, '/');
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
    queryRowsByCallsign,
    queryRowsByCallsigns
  };
}
