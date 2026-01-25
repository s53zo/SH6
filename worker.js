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

function applyLogFilters(qsos, filters) {
  const out = [];
  const search = filters.search || '';
  const fieldFilter = filters.fieldFilter || '';
  const bandFilter = filters.bandFilter || '';
  const modeFilter = filters.modeFilter || '';
  const countryFilter = filters.countryFilter || '';
  const continentFilter = filters.continentFilter || '';
  const cqFilter = filters.cqFilter || '';
  const ituFilter = filters.ituFilter || '';
  const rangeFilter = filters.rangeFilter;
  const timeRange = filters.timeRange;
  const headingRange = filters.headingRange;
  for (const q of qsos || []) {
    if (search && (!q.call || !q.call.includes(search))) continue;
    if (fieldFilter && (!q.grid || !q.grid.startsWith(fieldFilter))) continue;
    if (bandFilter && (!q.band || q.band.toUpperCase() !== bandFilter)) continue;
    if (modeFilter && modeFilter !== 'All' && modeBucket(q.mode) !== modeFilter) continue;
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

function buildOrderedKeys(aBuckets, bBuckets, aQsos, bQsos) {
  const allKeys = new Set([...aBuckets.keys(), ...bBuckets.keys()]);
  const numericKeys = Array.from(allKeys).filter((k) => k !== 'unknown');
  let startIndex = null;
  const allWithTs = aQsos.concat(bQsos).filter((q) => Number.isFinite(q.ts));
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

function parseKpApText(text, minKey, maxKey) {
  const sumKp = new Map();
  const sumAp = new Map();
  const countKp = new Map();
  const countAp = new Map();
  const lines = String(text || '').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length < 9) continue;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) continue;
    const key = year * 10000 + month * 100 + day;
    if (minKey && key < minKey) continue;
    if (maxKey && key > maxKey) continue;
    const kpVal = parseFloat(parts[7]);
    const apVal = parseFloat(parts[8]);
    if (Number.isFinite(kpVal) && kpVal >= 0) {
      sumKp.set(key, (sumKp.get(key) || 0) + kpVal);
      countKp.set(key, (countKp.get(key) || 0) + 1);
    }
    if (Number.isFinite(apVal) && apVal >= 0) {
      sumAp.set(key, (sumAp.get(key) || 0) + apVal);
      countAp.set(key, (countAp.get(key) || 0) + 1);
    }
  }
  const kp = [];
  const ap = [];
  sumKp.forEach((sum, key) => {
    const count = countKp.get(key) || 0;
    if (count) kp.push([key, sum / count]);
  });
  sumAp.forEach((sum, key) => {
    const count = countAp.get(key) || 0;
    if (count) ap.push([key, sum / count]);
  });
  return { kp, ap };
}

function parseSsnCsv(text, minKey, maxKey) {
  const ssn = [];
  const lines = String(text || '').split(/\r?\n/);
  for (const line of lines) {
    if (!line) continue;
    const parts = line.split(';');
    if (parts.length < 5) continue;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) continue;
    const key = year * 10000 + month * 100 + day;
    if (minKey && key < minKey) continue;
    if (maxKey && key > maxKey) continue;
    const val = parseInt(parts[4], 10);
    if (Number.isFinite(val) && val >= 0) {
      ssn.push([key, val]);
    }
  }
  return ssn;
}

self.onmessage = (evt) => {
  const payload = evt.data || {};
  if (payload.type === 'compareBuckets') {
    const filters = payload.filters || {};
    const aQsos = applyLogFilters(payload.aQsos || [], filters);
    const bQsos = applyLogFilters(payload.bQsos || [], filters);
    const aBuckets = buildTenMinuteBuckets(aQsos);
    const bBuckets = buildTenMinuteBuckets(bQsos);
    const orderedKeys = buildOrderedKeys(aBuckets, bBuckets, aQsos, bQsos);
    const buckets = orderedKeys.map((key) => ({
      key,
      a: aBuckets.get(key) || [],
      b: bBuckets.get(key) || []
    }));
    const totalRows = buckets.reduce((sum, bucket) => sum + Math.max(bucket.a.length, bucket.b.length, 1), 0);
    self.postMessage({
      type: 'compareBuckets',
      key: payload.key,
      data: {
        aCount: aQsos.length,
        bCount: bQsos.length,
        totalRows,
        buckets
      }
    });
    return;
  }
  if (payload.type === 'parseSolar') {
    const kpAp = parseKpApText(payload.kpText, payload.minKey, payload.maxKey);
    const ssn = parseSsnCsv(payload.ssnText, payload.minKey, payload.maxKey);
    self.postMessage({
      type: 'solarParsed',
      key: payload.key,
      data: {
        updatedAt: Date.now(),
        kp: kpAp.kp,
        ap: kpAp.ap,
        ssn
      }
    });
  }
};
