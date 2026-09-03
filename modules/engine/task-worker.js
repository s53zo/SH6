import '../analysis/core.js?v=6.3.28';
import '../compare/compare-core.js?v=6.3.28';

let analysisResources = {};
const compareLogsBySlot = new Map();

function normalizeBandToken(value) {
  return String(value || '').trim().toUpperCase();
}

function normalizeCall(value) {
  return String(value || '').trim().toUpperCase();
}

function getAnalysisCore() {
  const core = globalThis.SH6AnalysisCore;
  if (!core || typeof core.analyzeLogText !== 'function' || typeof core.deriveLog !== 'function') {
    throw new Error('SH6 analysis core is unavailable in engine worker.');
  }
  return core;
}

function getCompareCore() {
  const core = globalThis.SH6CompareCore;
  if (!core || typeof core.buildCompareBucketPayload !== 'function') {
    throw new Error('SH6 compare core is unavailable in engine worker.');
  }
  return core;
}

function buildCompareLog(qsos) {
  return (qsos || []).map((q, index) => ({
    i: index,
    call: q.call || '',
    grid: q.grid || '',
    band: q.band || '',
    mode: q.mode || '',
    op: q.op || '',
    country: q.country || '',
    continent: q.continent || '',
    cqZone: q.cqZone,
    ituZone: q.ituZone,
    qsoNumber: q.qsoNumber,
    ts: q.ts,
    bearing: q.bearing,
    distance: q.distance,
    callCount: q.callCount,
    isDupe: Boolean(q.isDupe),
    operatingStyleRole: q.operatingStyleRole || '',
    operatingStyleBand: q.operatingStyleBand || q.band || '',
    txId: q.txId ?? null
  }));
}

function normalizeCompareLogVersion(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function buildCompareLogRecord(slotId, log, slotLogVersion) {
  const key = String(slotId || '').trim().toUpperCase();
  if (!key) return null;
  return {
    slotId: key,
    log: Array.isArray(log) ? log : [],
    slotLogVersion: normalizeCompareLogVersion(slotLogVersion)
  };
}

function retainCompareLog(slotId, qsoData, slotLogVersion) {
  const key = String(slotId || '').trim().toUpperCase();
  if (!key) return;
  const record = buildCompareLogRecord(key, buildCompareLog(qsoData?.qsos || []), slotLogVersion);
  if (!record) return;
  compareLogsBySlot.set(key, record);
}

function setCompareLogSlot(slotId, log, slotLogVersion) {
  const key = String(slotId || '').trim().toUpperCase();
  if (!key) return;
  const record = {
    slotId: key,
    log: Array.isArray(log) ? log : [],
    slotLogVersion: normalizeCompareLogVersion(slotLogVersion)
  };
  if (!record) return;
  compareLogsBySlot.set(key, record);
}

function buildCompareLogsFromPayload(slotIds, loadedSlotIds) {
  return slotIds.map((slotId) => {
    if (!loadedSlotIds.has(slotId)) return [];
    const entry = compareLogsBySlot.get(slotId);
    if (!entry || !Array.isArray(entry.log)) return [];
    return entry.log;
  });
}

function normalizeSlotVersions(slotVersions) {
  const normalized = {};
  Object.entries(slotVersions || {}).forEach(([slotId, value]) => {
    const normalizedSlotId = String(slotId || '').trim().toUpperCase();
    if (!normalizedSlotId) return;
    normalized[normalizedSlotId] = {
      slotLogVersion: normalizeCompareLogVersion(value?.slotLogVersion)
    };
  });
  return normalized;
}

function buildSpotIndexes(qsos) {
  const timeIndex = new Map();
  const callIndex = new Map();
  (qsos || []).forEach((q) => {
    if (!Number.isFinite(q?.ts)) return;
    const band = normalizeBandToken(q?.band || '');
    if (!band) return;
    if (!timeIndex.has(band)) timeIndex.set(band, []);
    timeIndex.get(band).push(q.ts);

    const call = normalizeCall(q?.call || '');
    if (!call) return;
    if (!callIndex.has(band)) callIndex.set(band, new Map());
    const bandMap = callIndex.get(band);
    if (!bandMap.has(call)) bandMap.set(call, []);
    bandMap.get(call).push(q.ts);
  });

  timeIndex.forEach((list) => list.sort((left, right) => left - right));
  callIndex.forEach((bandMap) => {
    bandMap.forEach((list) => list.sort((left, right) => left - right));
  });

  return {
    timeIndexEntries: Array.from(timeIndex.entries()),
    callIndexEntries: Array.from(callIndex.entries()).map(([band, bandMap]) => [band, Array.from(bandMap.entries())])
  };
}

async function fetchArchiveText(candidateUrls) {
  const urls = Array.isArray(candidateUrls) ? candidateUrls.filter(Boolean) : [];
  let lastError = null;
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return {
        url,
        text: await response.text()
      };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Archive fetch failed.');
}

self.onmessage = async (event) => {
  const payload = event.data || {};
  const key = payload.key;
  try {
    if (payload.type === 'configureAnalysis') {
      analysisResources = payload.analysis && typeof payload.analysis === 'object'
        ? payload.analysis
        : {};
      self.postMessage({ type: 'taskResult', key, data: { configured: true } });
      return;
    }
    if (payload.type === 'setCompareLog') {
      const slotId = String(payload.slotId || '').trim().toUpperCase();
      if (slotId) setCompareLogSlot(slotId, payload.log, payload.slotLogVersion);
      self.postMessage({ type: 'taskResult', key, data: { configured: Boolean(slotId) } });
      return;
    }
    if (payload.type === 'clearCompareSlots') {
      (Array.isArray(payload.slotIds) ? payload.slotIds : []).forEach((slotId) => {
        compareLogsBySlot.delete(String(slotId || '').trim().toUpperCase());
      });
      self.postMessage({ type: 'taskResult', key, data: { cleared: true } });
      return;
    }
    if (payload.type === 'compareBuckets') {
      const slotIds = Array.isArray(payload.slotIds)
        ? payload.slotIds.map((slotId) => String(slotId || '').trim().toUpperCase())
        : [];
      const loadedSlotIds = new Set(
        (Array.isArray(payload.loadedSlotIds) ? payload.loadedSlotIds : [])
          .map((slotId) => String(slotId || '').trim().toUpperCase())
      );
      const slotVersions = normalizeSlotVersions(payload.slotVersions);
      const mismatched = slotIds.filter((slotId) => {
        if (!loadedSlotIds.has(slotId)) return false;
        const expected = slotVersions[slotId];
        const entry = compareLogsBySlot.get(slotId);
        if (!entry) return true;
        if (!expected || expected.slotLogVersion == null) return false;
        return entry.slotLogVersion !== expected.slotLogVersion;
      });
      const missing = slotIds.filter((slotId) => loadedSlotIds.has(slotId) && !compareLogsBySlot.has(slotId));
      const invalid = [...new Set(mismatched.concat(missing))];
      if (invalid.length) throw new Error(`Compare log data unavailable for: ${invalid.join(', ')}`);
      const logs = buildCompareLogsFromPayload(slotIds, loadedSlotIds);
      const data = getCompareCore().buildCompareBucketPayload(logs, payload.filters || {});
      self.postMessage({ type: 'taskResult', key, data });
      return;
    }
    if (payload.type === 'spotIndexes') {
      const data = buildSpotIndexes(payload.qsos || []);
      self.postMessage({ type: 'taskResult', key, data });
      return;
    }
    if (payload.type === 'archiveText') {
      const data = await fetchArchiveText(payload.urls || []);
      self.postMessage({ type: 'taskResult', key, data });
      return;
    }
    if (payload.type === 'analyzeLog') {
      const data = getAnalysisCore().analyzeLogText(
        payload.text || '',
        payload.filename || '',
        payload.context || {},
        payload.analysis || analysisResources
      );
      self.postMessage({ type: 'taskResult', key, data });
      retainCompareLog(payload.slotId, data.qsoData, payload.slotLogVersion);
      return;
    }
    if (payload.type === 'deriveSlots') {
      const slots = Array.isArray(payload.slots) ? payload.slots : [];
      const analysis = payload.analysis || analysisResources;
      const derivedSlots = slots.map((entry) => {
        const result = getAnalysisCore().deriveLog(entry?.qsoData || { type: 'unknown', qsos: [] }, entry?.context || {}, analysis);
        const slotId = String(entry?.slotId || '').toUpperCase();
        return {
          slotId,
          qsoData: result.qsoData,
          derived: result.derived
        };
      });
      const data = { slots: derivedSlots };
      self.postMessage({ type: 'taskResult', key, data });
      derivedSlots.forEach((entry) => {
        const match = slots.find((slot) => String(slot?.slotId || '').toUpperCase() === entry.slotId);
        retainCompareLog(entry.slotId, entry.qsoData, match?.slotLogVersion);
      });
      return;
    }
    throw new Error(`Unsupported task type: ${payload.type || 'unknown'}`);
  } catch (err) {
    self.postMessage({
      type: 'taskError',
      key,
      error: err && err.message ? err.message : 'Worker task failed.'
    });
  }
};

self.postMessage({ type: 'workerReady' });
