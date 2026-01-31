const MODE_DIGITAL = new Set([
  'FT8', 'FT4', 'RTTY', 'PSK', 'PSK31', 'DATA', 'DIGI', 'MFSK',
  'JT65', 'JT9', 'OLIVIA', 'FSK', 'FSK441', 'AMTOR'
]);
const MODE_PHONE = new Set(['SSB', 'USB', 'LSB', 'AM', 'FM', 'PH', 'PHONE']);

function normalizeMode(mode) {
  return (mode || '').trim().toUpperCase();
}

function modeBucket(mode) {
  const m = normalizeMode(mode);
  if (m === 'CW') return 'CW';
  if (MODE_PHONE.has(m)) return 'Phone';
  if (MODE_DIGITAL.has(m)) return 'Digital';
  return 'Digital';
}

function classifyCallStructure(call) {
  const m = String(call || '').toUpperCase().match(/^([A-Z]+)(\d+)([A-Z]+)$/);
  if (!m) return 'other';
  const pre = m[1].length;
  const digits = m[2].length;
  const suf = m[3].length;
  return `${pre}x${suf}d${digits}`;
}

function applyLogFilters(qsos, filters) {
  const out = [];
  const search = filters.search || '';
  const fieldFilter = filters.fieldFilter || '';
  const bandFilter = filters.bandFilter || '';
  const modeFilter = filters.modeFilter || '';
  const opFilter = filters.opFilter || '';
  const callLenFilter = Number.isFinite(filters.callLenFilter)
    ? filters.callLenFilter
    : (filters.callLenFilter != null ? Number(filters.callLenFilter) : null);
  const callStructFilter = filters.callStructFilter || '';
  const countryFilter = filters.countryFilter || '';
  const continentFilter = filters.continentFilter || '';
  const cqFilter = filters.cqFilter || '';
  const ituFilter = filters.ituFilter || '';
  const rangeFilter = filters.rangeFilter;
  const timeRange = filters.timeRange;
  const headingRange = filters.headingRange;
  const stationQsoRange = filters.stationQsoRange;
  const distanceRange = filters.distanceRange;
  for (const q of qsos || []) {
    if (search && (!q.call || !q.call.includes(search))) continue;
    if (fieldFilter && (!q.grid || !q.grid.startsWith(fieldFilter))) continue;
    if (bandFilter && (!q.band || q.band.toUpperCase() !== bandFilter)) continue;
    if (modeFilter && modeFilter !== 'All' && modeBucket(q.mode) !== modeFilter) continue;
    if (opFilter && (!q.op || q.op.toUpperCase() !== opFilter)) continue;
    if (Number.isFinite(callLenFilter) && (!q.call || q.call.length !== callLenFilter)) continue;
    if (callStructFilter && (!q.call || classifyCallStructure(q.call) !== callStructFilter)) continue;
    if (countryFilter && (!q.country || q.country.toUpperCase() !== countryFilter)) continue;
    if (continentFilter && (!q.continent || q.continent.toUpperCase() !== continentFilter)) continue;
    if (cqFilter && String(q.cqZone || '') !== cqFilter) continue;
    if (ituFilter && String(q.ituZone || '') !== ituFilter) continue;
    if (rangeFilter && Number.isFinite(rangeFilter.start) && Number.isFinite(rangeFilter.end)) {
      const n = Number(q.qsoNumber);
      if (!Number.isFinite(n) || n < rangeFilter.start || n > rangeFilter.end) continue;
    }
    if (timeRange && Number.isFinite(timeRange.startTs) && Number.isFinite(timeRange.endTs)) {
      if (typeof q.ts !== 'number' || q.ts < timeRange.startTs || q.ts > timeRange.endTs) continue;
    }
    if (headingRange && Number.isFinite(headingRange.start) && Number.isFinite(headingRange.end)) {
      if (!Number.isFinite(q.bearing) || q.bearing < headingRange.start || q.bearing > headingRange.end) continue;
    }
    if (stationQsoRange && Number.isFinite(stationQsoRange.min) && Number.isFinite(stationQsoRange.max)) {
      if (!Number.isFinite(q.callCount) || q.callCount < stationQsoRange.min || q.callCount > stationQsoRange.max) continue;
    }
    if (distanceRange && Number.isFinite(distanceRange.start) && Number.isFinite(distanceRange.end)) {
      if (!Number.isFinite(q.distance) || q.distance < distanceRange.start || q.distance > distanceRange.end) continue;
    }
    out.push(q);
  }
  return out;
}

function buildTenMinuteBuckets(qsos) {
  const buckets = new Map();
  for (const q of qsos || []) {
    let key = 'unknown';
    if (Number.isFinite(q.ts)) {
      const d = new Date(q.ts);
      const minOfDay = d.getUTCHours() * 60 + d.getUTCMinutes();
      const day = d.getUTCDay();
      key = `${day}-${Math.floor(minOfDay / 10)}`;
    }
    if (!buckets.has(key)) buckets.set(key, []);
    if (q.i != null) buckets.get(key).push(q.i);
  }
  return buckets;
}

function buildOrderedKeys(bucketMaps, qsoLists) {
  const allKeys = new Set();
  bucketMaps.forEach((map) => map.forEach((_, key) => allKeys.add(key)));
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
    const parts = String(key).split('-');
    const day = Number(parts[0]);
    const slot = Number(parts[1]);
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

self.onmessage = (evt) => {
  const payload = evt.data || {};
  if (payload.type === 'compareBuckets') {
    const filters = payload.filters || {};
    const logs = Array.isArray(payload.logs) ? payload.logs : [];
    const filtered = logs.map((list) => applyLogFilters(list || [], filters));
    const bucketMaps = filtered.map((list) => buildTenMinuteBuckets(list));
    const orderedKeys = buildOrderedKeys(bucketMaps, filtered);
    const buckets = orderedKeys.map((key) => ({
      key,
      lists: bucketMaps.map((map) => map.get(key) || [])
    }));
    const totalRows = buckets.reduce((sum, bucket) => {
      const lengths = bucket.lists.map((list) => list.length);
      return sum + Math.max(1, ...lengths);
    }, 0);
    self.postMessage({
      type: 'compareBuckets',
      key: payload.key,
      data: {
        counts: filtered.map((list) => list.length),
        totalRows,
        buckets
      }
    });
    return;
  }
};
