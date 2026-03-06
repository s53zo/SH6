import './modules/compare/compare-core.js';

function getCompareCore() {
  const core = globalThis.SH6CompareCore;
  if (!core || typeof core.buildCompareBucketPayload !== 'function') {
    throw new Error('SH6 compare core is unavailable in worker context.');
  }
  return core;
}

self.onmessage = (event) => {
  const payload = event.data || {};
  if (payload.type !== 'compareBuckets') return;
  const data = getCompareCore().buildCompareBucketPayload(
    Array.isArray(payload.logs) ? payload.logs : [],
    payload.filters || {}
  );
  self.postMessage({
    type: 'compareBuckets',
    key: payload.key,
    data
  });
};
