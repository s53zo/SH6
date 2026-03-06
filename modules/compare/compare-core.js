(function initSh6CompareCore(globalScope) {
  'use strict';

  const MODE_DIGITAL = new Set([
    'FT8', 'FT4', 'RTTY', 'PSK', 'PSK31', 'DATA', 'DIGI', 'MFSK',
    'JT65', 'JT9', 'OLIVIA', 'FSK', 'FSK441', 'AMTOR'
  ]);

  const MODE_PHONE = new Set(['SSB', 'USB', 'LSB', 'AM', 'FM', 'PH', 'PHONE']);

  function normalizeMode(mode) {
    return String(mode || '').trim().toUpperCase();
  }

  function modeBucket(mode) {
    const value = normalizeMode(mode);
    if (value === 'CW') return 'CW';
    if (MODE_PHONE.has(value)) return 'Phone';
    if (MODE_DIGITAL.has(value)) return 'Digital';
    return 'Digital';
  }

  function classifyCallStructure(call) {
    const match = String(call || '').toUpperCase().match(/^([A-Z]+)(\d+)([A-Z]+)$/);
    if (!match) return 'other';
    return `${match[1].length}x${match[3].length}d${match[2].length}`;
  }

  function getDefaultIndex(qso) {
    if (Number.isFinite(qso?.i)) return qso.i;
    if (Number.isFinite(qso?.id)) return qso.id;
    if (Number.isFinite(qso?.qsoNumber)) return qso.qsoNumber - 1;
    return null;
  }

  function applyLogFilters(qsos, filters = {}) {
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
        const qsoNumber = Number(q.qsoNumber);
        if (!Number.isFinite(qsoNumber) || qsoNumber < rangeFilter.start || qsoNumber > rangeFilter.end) continue;
      }
      if (timeRange && Number.isFinite(timeRange.startTs) && Number.isFinite(timeRange.endTs)) {
        if (!Number.isFinite(q.ts) || q.ts < timeRange.startTs || q.ts > timeRange.endTs) continue;
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

  function buildTenMinuteBuckets(qsos, options = {}) {
    const buckets = new Map();
    const indexGetter = typeof options.indexGetter === 'function' ? options.indexGetter : getDefaultIndex;

    for (const q of qsos || []) {
      let key = 'unknown';
      if (Number.isFinite(q.ts)) {
        const date = new Date(q.ts);
        const minuteOfDay = date.getUTCHours() * 60 + date.getUTCMinutes();
        const day = date.getUTCDay();
        key = `${day}-${Math.floor(minuteOfDay / 10)}`;
      }
      if (!buckets.has(key)) buckets.set(key, []);
      const index = indexGetter(q);
      if (index != null) buckets.get(key).push(index);
    }

    return buckets;
  }

  function buildCompareBucketOrder(bucketMaps, qsoLists = []) {
    const allKeys = new Set();
    for (const map of bucketMaps || []) {
      if (!map || typeof map.forEach !== 'function') continue;
      map.forEach((_, key) => allKeys.add(key));
    }

    const numericKeys = Array.from(allKeys).filter((key) => key !== 'unknown');
    let startIndex = null;
    const allWithTs = (qsoLists || []).flat().filter((q) => Number.isFinite(q?.ts));
    if (allWithTs.length) {
      const minTs = Math.min(...allWithTs.map((q) => q.ts));
      const date = new Date(minTs);
      startIndex = date.getUTCDay() * 144 + Math.floor((date.getUTCHours() * 60 + date.getUTCMinutes()) / 10);
    }

    const slotIndex = (key) => {
      const [dayStr, slotStr] = String(key).split('-');
      return Number(dayStr) * 144 + Number(slotStr);
    };

    const numericSorted = numericKeys.slice().sort((left, right) => {
      const leftIndex = slotIndex(left);
      const rightIndex = slotIndex(right);
      if (startIndex == null) return leftIndex - rightIndex;
      const leftDelta = (leftIndex - startIndex + 1008) % 1008;
      const rightDelta = (rightIndex - startIndex + 1008) % 1008;
      return leftDelta - rightDelta;
    });

    return allKeys.has('unknown') ? numericSorted.concat(['unknown']) : numericSorted;
  }

  function buildCompareBucketPayload(logs = [], filters = {}, options = {}) {
    const filtered = logs.map((list) => applyLogFilters(list || [], filters));
    const bucketMaps = filtered.map((list) => buildTenMinuteBuckets(list, options));
    const orderedKeys = buildCompareBucketOrder(bucketMaps, filtered);
    const buckets = orderedKeys.map((key) => ({
      key,
      lists: bucketMaps.map((map) => map.get(key) || [])
    }));
    const totalRows = buckets.reduce((sum, bucket) => {
      const lengths = bucket.lists.map((list) => list.length);
      return sum + Math.max(1, ...lengths);
    }, 0);

    return {
      counts: filtered.map((list) => list.length),
      totalRows,
      buckets
    };
  }

  const api = {
    normalizeMode,
    modeBucket,
    classifyCallStructure,
    applyLogFilters,
    buildTenMinuteBuckets,
    buildCompareBucketOrder,
    buildOrderedBucketKeys: buildCompareBucketOrder,
    buildCompareBucketPayload
  };

  const existing = globalScope && typeof globalScope.SH6CompareCore === 'object' && globalScope.SH6CompareCore
    ? globalScope.SH6CompareCore
    : {};
  globalScope.SH6CompareCore = Object.assign({}, existing, api);
})(typeof globalThis !== 'undefined' ? globalThis : self);
