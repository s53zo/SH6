export function createComparePerspectiveStore(deps = {}) {
  const {
    getState,
    getCurrentReportId,
    storageKey,
    limit,
    readStorageText,
    writeStorageText,
    ensureDurableStorageReady,
    normalizeCompareScoreMode,
    cloneCompareFocus,
    cloneTsRange,
    defaultCompareFocus
  } = deps;

  function loadStoredComparePerspectives() {
    try {
      const raw = readStorageText(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((entry) => entry && typeof entry === 'object') : [];
    } catch (err) {
      return [];
    }
  }

  function writeStoredComparePerspectives(items) {
    try {
      writeStorageText(storageKey, JSON.stringify(Array.isArray(items) ? items : []));
      return true;
    } catch (err) {
      return false;
    }
  }

  function buildCurrentComparePerspective() {
    const state = getState();
    const reportId = getCurrentReportId() || 'main';
    const savedAt = Date.now();
    return {
      id: `perspective-${savedAt}`,
      savedAt,
      label: `${new Date(savedAt).toISOString().slice(0, 16).replace('T', ' ')} · ${reportId}`,
      reportId,
      compareScoreMode: normalizeCompareScoreMode(state.compareScoreMode),
      compareSyncEnabled: Boolean(state.compareSyncEnabled),
      compareStickyEnabled: Boolean(state.compareStickyEnabled),
      compareTimeRangeLock: cloneTsRange(state.compareTimeRangeLock),
      compareFocus: cloneCompareFocus(state.compareFocus),
      globalBandFilter: state.globalBandFilter || '',
      globalRadioFilter: state.globalRadioFilter || '',
      radioHeatMetric: state.radioHeatMetric || 'minutes',
      radioHeatA: state.radioHeatA || '',
      radioHeatB: state.radioHeatB || '',
      logTimeRange: cloneTsRange(state.logTimeRange)
    };
  }

  function normalizeGeneratedComparePerspective(input, fallbackLabel = 'Generated perspective') {
    const state = getState();
    if (!input || typeof input !== 'object') return null;
    const savedAt = Number.isFinite(Number(input.savedAt)) ? Number(input.savedAt) : Date.now();
    const reportId = String(input.reportId || '').trim() || 'summary';
    const label = String(input.label || fallbackLabel || 'Generated perspective').trim() || 'Generated perspective';
    const explicitRange = cloneTsRange(input.compareTimeRangeLock) || cloneTsRange(input.logTimeRange);
    const explicitLogRange = cloneTsRange(input.logTimeRange) || cloneTsRange(input.compareTimeRangeLock);
    return {
      id: String(input.id || ''),
      savedAt,
      label,
      reportId,
      compareScoreMode: normalizeCompareScoreMode(input.compareScoreMode || state.compareScoreMode),
      compareSyncEnabled: Object.prototype.hasOwnProperty.call(input, 'compareSyncEnabled')
        ? input.compareSyncEnabled !== false
        : Boolean(state.compareSyncEnabled),
      compareStickyEnabled: Object.prototype.hasOwnProperty.call(input, 'compareStickyEnabled')
        ? input.compareStickyEnabled !== false
        : Boolean(state.compareStickyEnabled),
      compareTimeRangeLock: explicitRange,
      compareFocus: cloneCompareFocus(input.compareFocus || state.compareFocus || defaultCompareFocus),
      globalBandFilter: typeof input.globalBandFilter === 'string' ? input.globalBandFilter : (state.globalBandFilter || ''),
      globalRadioFilter: typeof input.globalRadioFilter === 'string' ? input.globalRadioFilter : (state.globalRadioFilter || ''),
      radioHeatMetric: ['minutes', 'qsos', 'points', 'multipliers', 'combinedRate'].includes(input.radioHeatMetric) ? input.radioHeatMetric : (state.radioHeatMetric || 'minutes'),
      radioHeatA: typeof input.radioHeatA === 'string' ? input.radioHeatA : (state.radioHeatA || ''),
      radioHeatB: typeof input.radioHeatB === 'string' ? input.radioHeatB : (state.radioHeatB || ''),
      logTimeRange: explicitLogRange
    };
  }

  function persistDurable(items) {
    ensureDurableStorageReady()
      .then((storage) => storage?.saveComparePerspectives?.(items))
      .catch(() => {});
  }

  function saveComparePerspectiveEntry(entry) {
    const normalized = normalizeGeneratedComparePerspective(entry, entry?.label || 'Generated perspective');
    if (!normalized) return null;
    const next = { ...normalized };
    if (!next.id) next.id = `perspective-${next.savedAt}-${Math.random().toString(36).slice(2, 8)}`;
    const existing = loadStoredComparePerspectives().filter((item) => String(item?.id || '') !== next.id);
    existing.unshift(next);
    const limitedItems = existing.slice(0, limit);
    writeStoredComparePerspectives(limitedItems);
    persistDurable(limitedItems);
    return next;
  }

  function saveComparePerspectiveBundle(entries) {
    const items = Array.isArray(entries) ? entries : [];
    if (!items.length) return [];
    const saved = [];
    const existing = loadStoredComparePerspectives();
    items.forEach((entry, index) => {
      const normalized = normalizeGeneratedComparePerspective(entry, entry?.label || `Generated perspective ${index + 1}`);
      if (!normalized) return;
      const next = { ...normalized };
      if (!next.id) next.id = `perspective-${next.savedAt}-${index}-${Math.random().toString(36).slice(2, 7)}`;
      saved.push(next);
    });
    if (!saved.length) return [];
    const seen = new Set(saved.map((entry) => entry.id));
    const merged = saved.concat(existing.filter((entry) => !seen.has(String(entry?.id || ''))));
    const limitedItems = merged.slice(0, limit);
    writeStoredComparePerspectives(limitedItems);
    persistDurable(limitedItems);
    return saved;
  }

  function saveCurrentComparePerspective() {
    return saveComparePerspectiveEntry(buildCurrentComparePerspective());
  }

  function deleteStoredComparePerspective(id) {
    const key = String(id || '');
    if (!key) return false;
    const next = loadStoredComparePerspectives().filter((entry) => String(entry?.id || '') !== key);
    const ok = writeStoredComparePerspectives(next);
    if (ok) persistDurable(next);
    return ok;
  }

  return {
    buildCurrentComparePerspective,
    deleteStoredComparePerspective,
    loadStoredComparePerspectives,
    normalizeGeneratedComparePerspective,
    saveComparePerspectiveBundle,
    saveComparePerspectiveEntry,
    saveCurrentComparePerspective,
    writeStoredComparePerspectives
  };
}
