function normalizeBandToken(value) {
  return String(value || '').trim().toUpperCase();
}

function normalizeCall(value) {
  return String(value || '').trim().toUpperCase();
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
    throw new Error(`Unsupported task type: ${payload.type || 'unknown'}`);
  } catch (err) {
    self.postMessage({
      type: 'taskError',
      key,
      error: err && err.message ? err.message : 'Worker task failed.'
    });
  }
};
