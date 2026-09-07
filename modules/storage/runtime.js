export function createStorageRuntime(deps = {}) {
  const {
    createStorage,
    comparePerspectiveStorageKey,
    comparePerspectiveLimit,
    writeStorageText,
    buildSessionPayload
  } = deps;

  let durableStorageReadyPromise = null;
  let autosaveSessionTimer = null;

  function encodeRawBytes(bytes) {
    if (!(bytes instanceof Uint8Array) || !bytes.length || typeof btoa !== 'function') return '';
    let binary = '';
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, Math.min(bytes.length, offset + chunkSize)));
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  async function ensureDurableStorageReady() {
    if (!durableStorageReadyPromise) {
      durableStorageReadyPromise = (async () => {
        const storage = await createStorage?.();
        if (!storage) return null;
        const perspectives = await storage.loadComparePerspectives?.().catch(() => []);
        if (Array.isArray(perspectives) && perspectives.length && typeof writeStorageText === 'function') {
          writeStorageText(
            comparePerspectiveStorageKey,
            JSON.stringify(perspectives.slice(0, Math.max(1, Number(comparePerspectiveLimit) || 12)))
          );
        }
        return storage;
      })();
    }
    return durableStorageReadyPromise;
  }

  async function loadDurableRawLog(slotId) {
    const storage = await ensureDurableStorageReady().catch(() => null);
    if (!storage || typeof storage.loadRawLog !== 'function') return null;
    const record = await storage.loadRawLog(String(slotId || '').toUpperCase()).catch(() => null);
    return record && typeof record.text === 'string'
      ? { ...record, ...(record.meta && typeof record.meta === 'object' ? record.meta : {}) }
      : null;
  }

  function persistDurableSlotLog(slotId, slot, text) {
    const safeSlotId = String(slotId || '').toUpperCase();
    const safeText = String(text == null ? '' : text);
    if (!safeSlotId || !safeText) return;
    const file = slot?.logFile || {};
    const meta = {
      slotId: safeSlotId,
      name: file.name || `${safeSlotId}.log`,
      size: Number.isFinite(file.size) ? file.size : safeText.length,
      source: file.source || '',
      path: file.path || ''
    };
    const rawBytesBase64 = encodeRawBytes(slot?.rawLogBytes);
    if (rawBytesBase64) meta.rawBytesBase64 = rawBytesBase64;
    ensureDurableStorageReady().then((storage) => {
      if (!storage) return;
      storage.saveRawLog?.(safeSlotId, safeText, meta).catch(() => {});
      if (meta.path) {
        storage.saveArchiveLog?.(meta.path, safeText, meta).catch(() => {});
      }
    }).catch(() => {});
  }

  function scheduleAutosaveSession() {
    if (autosaveSessionTimer) clearTimeout(autosaveSessionTimer);
    autosaveSessionTimer = setTimeout(() => {
      autosaveSessionTimer = null;
      const payload = buildSessionPayload?.(false);
      ensureDurableStorageReady().then((storage) => {
        storage?.saveAutosaveSession?.(payload).catch(() => {});
      }).catch(() => {});
    }, 400);
  }

  async function loadAutosaveSession() {
    const storage = await ensureDurableStorageReady().catch(() => null);
    return storage?.loadAutosaveSession?.().catch(() => null) || null;
  }

  return {
    ensureDurableStorageReady,
    loadAutosaveSession,
    loadDurableRawLog,
    persistDurableSlotLog,
    scheduleAutosaveSession
  };
}
