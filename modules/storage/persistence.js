const DB_NAME = 'sh6-persistence-v1';
const DB_VERSION = 1;
const STORE_KV = 'kv';
const STORE_RECORDS = 'records';
const STORE_BLOBS = 'blobs';
const OPFS_TEXT_THRESHOLD = 32 * 1024;

function supportsIndexedDb() {
  return typeof indexedDB !== 'undefined' && indexedDB != null;
}

function supportsLocalStorage() {
  try {
    if (typeof localStorage === 'undefined') return false;
    const probe = '__sh6_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch (err) {
    return false;
  }
}

function supportsOpfs() {
  return Boolean(navigator?.storage?.getDirectory);
}

function base64UrlEncode(value) {
  const text = String(value == null ? '' : value);
  const encoded = btoa(unescape(encodeURIComponent(text)));
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  if (!value) return '';
  let text = String(value);
  text = text.replace(/-/g, '+').replace(/_/g, '/');
  while (text.length % 4) text += '=';
  return decodeURIComponent(escape(atob(text)));
}

function createMemoryStore() {
  const kv = new Map();
  const records = new Map();
  const blobs = new Map();
  return {
    async get(store, key) {
      if (store === STORE_KV) return kv.get(key);
      if (store === STORE_RECORDS) return records.get(key);
      if (store === STORE_BLOBS) return blobs.get(key);
      return undefined;
    },
    async put(store, value) {
      if (!value || value.key == null) throw new Error('Memory store requires values with a key.');
      if (store === STORE_KV) kv.set(value.key, value);
      if (store === STORE_RECORDS) records.set(value.key, value);
      if (store === STORE_BLOBS) blobs.set(value.key, value);
      return value;
    },
    async delete(store, key) {
      if (store === STORE_KV) kv.delete(key);
      if (store === STORE_RECORDS) records.delete(key);
      if (store === STORE_BLOBS) blobs.delete(key);
    }
  };
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed.'));
  });
}

async function openDatabase() {
  if (!supportsIndexedDb()) return null;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_KV)) db.createObjectStore(STORE_KV, { keyPath: 'key' });
      if (!db.objectStoreNames.contains(STORE_RECORDS)) db.createObjectStore(STORE_RECORDS, { keyPath: 'key' });
      if (!db.objectStoreNames.contains(STORE_BLOBS)) db.createObjectStore(STORE_BLOBS, { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB.'));
  });
}

function createIndexedDbStore(db) {
  return {
    async get(storeName, key) {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      return requestToPromise(store.get(key));
    },
    async put(storeName, value) {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      await requestToPromise(store.put(value));
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction failed.'));
        tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted.'));
      });
      return value;
    },
    async delete(storeName, key) {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      await requestToPromise(store.delete(key));
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error('IndexedDB delete failed.'));
        tx.onabort = () => reject(tx.error || new Error('IndexedDB delete aborted.'));
      });
    }
  };
}

async function ensureDirectory(rootHandle, parts) {
  let current = rootHandle;
  for (const part of parts) {
    current = await current.getDirectoryHandle(part, { create: true });
  }
  return current;
}

async function writeOpfsText(rootHandle, path, text) {
  const parts = String(path || '').split('/').filter(Boolean);
  const filename = parts.pop();
  const dir = await ensureDirectory(rootHandle, parts);
  const fileHandle = await dir.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(String(text == null ? '' : text));
  await writable.close();
}

async function readOpfsText(rootHandle, path) {
  try {
    const parts = String(path || '').split('/').filter(Boolean);
    const filename = parts.pop();
    let current = rootHandle;
    for (const part of parts) current = await current.getDirectoryHandle(part);
    const fileHandle = await current.getFileHandle(filename);
    const file = await fileHandle.getFile();
    return file.text();
  } catch (err) {
    return null;
  }
}

async function deleteOpfsPath(rootHandle, path) {
  try {
    const parts = String(path || '').split('/').filter(Boolean);
    const filename = parts.pop();
    let current = rootHandle;
    for (const part of parts) current = await current.getDirectoryHandle(part);
    await current.removeEntry(filename);
  } catch (err) {
    // ignore missing paths
  }
}

function createLocalStorageBridge(namespace) {
  const safeNamespace = String(namespace || 'sh6');
  const isAvailable = supportsLocalStorage();
  return {
    isAvailable,
    get(key) {
      if (!isAvailable) return null;
      return localStorage.getItem(`${safeNamespace}:${key}`);
    },
    set(key, value) {
      if (!isAvailable) return false;
      try {
        localStorage.setItem(`${safeNamespace}:${key}`, value);
        return true;
      } catch (err) {
        return false;
      }
    },
    delete(key) {
      if (!isAvailable) return;
      localStorage.removeItem(`${safeNamespace}:${key}`);
    }
  };
}

function encodeRecordPath(kind, key, extension = 'txt') {
  return `${kind}/${base64UrlEncode(key)}.${extension}`;
}

export async function createSh6Persistence(options = {}) {
  const namespace = String(options.namespace || 'sh6');
  const storageBridge = createLocalStorageBridge(namespace);
  let db = null;
  let store = createMemoryStore();
  let opfsRoot = null;

  try {
    db = await openDatabase();
    if (db) store = createIndexedDbStore(db);
  } catch (err) {
    db = null;
  }

  if (supportsOpfs()) {
    try {
      opfsRoot = await navigator.storage.getDirectory();
    } catch (err) {
      opfsRoot = null;
    }
  }

  async function getJson(key, fallback = null) {
    const record = await store.get(STORE_KV, key);
    if (record && Object.prototype.hasOwnProperty.call(record, 'value')) return record.value;
    const raw = storageBridge.get(`kv:${key}`);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  async function setJson(key, value) {
    await store.put(STORE_KV, {
      key,
      value,
      updatedAt: Date.now()
    });
    storageBridge.set(`kv:${key}`, JSON.stringify(value));
    return value;
  }

  async function deleteJson(key) {
    await store.delete(STORE_KV, key);
    storageBridge.delete(`kv:${key}`);
  }

  async function saveTextRecord(kind, key, text, meta = {}) {
    const safeText = String(text == null ? '' : text);
    const updatedAt = Date.now();
    const record = {
      key,
      kind,
      meta,
      updatedAt,
      size: safeText.length,
      storage: 'idb'
    };

    if (opfsRoot && safeText.length >= OPFS_TEXT_THRESHOLD) {
      const opfsPath = encodeRecordPath(kind, key, 'txt');
      await writeOpfsText(opfsRoot, opfsPath, safeText);
      record.storage = 'opfs';
      record.opfsPath = opfsPath;
      await store.delete(STORE_BLOBS, key);
    } else {
      await store.put(STORE_BLOBS, { key, text: safeText, updatedAt });
    }

    await store.put(STORE_RECORDS, record);
    return record;
  }

  async function loadTextRecord(key) {
    const record = await store.get(STORE_RECORDS, key);
    if (!record) return null;
    if (record.storage === 'opfs' && record.opfsPath && opfsRoot) {
      const text = await readOpfsText(opfsRoot, record.opfsPath);
      if (text != null) return { text, meta: record.meta || {}, record };
    }
    const blobRecord = await store.get(STORE_BLOBS, key);
    if (blobRecord && typeof blobRecord.text === 'string') {
      return { text: blobRecord.text, meta: record.meta || {}, record };
    }
    return null;
  }

  async function deleteTextRecord(key) {
    const record = await store.get(STORE_RECORDS, key);
    if (record?.storage === 'opfs' && record.opfsPath && opfsRoot) {
      await deleteOpfsPath(opfsRoot, record.opfsPath);
    }
    await store.delete(STORE_RECORDS, key);
    await store.delete(STORE_BLOBS, key);
  }

  return {
    backendName: db ? (opfsRoot ? 'indexeddb+opfs' : 'indexeddb') : (storageBridge.isAvailable ? 'localstorage+memory' : 'memory'),
    supportsIndexedDb: Boolean(db),
    supportsOpfs: Boolean(opfsRoot),
    getJson,
    setJson,
    deleteJson,
    loadComparePerspectives() {
      return getJson('compare-perspectives', []);
    },
    saveComparePerspectives(items) {
      return setJson('compare-perspectives', Array.isArray(items) ? items : []);
    },
    async saveWorkspaceSnapshot(payload) {
      return saveTextRecord('workspace', 'workspace:last', JSON.stringify(payload || {}), {
        kind: 'workspace-snapshot'
      });
    },
    async loadWorkspaceSnapshot() {
      const record = await loadTextRecord('workspace:last');
      if (!record?.text) return null;
      try {
        return JSON.parse(record.text);
      } catch (err) {
        return null;
      }
    },
    async saveLogRecord(key, text, meta = {}) {
      return saveTextRecord('logs', String(key || ''), text, meta);
    },
    async loadLogRecord(key) {
      return loadTextRecord(String(key || ''));
    },
    async saveRawLog(slotId, text, meta = {}) {
      const safeSlotId = String(slotId || '').toUpperCase();
      return saveTextRecord('logs', `raw:${safeSlotId}`, text, {
        ...meta,
        kind: 'raw-log',
        slotId: safeSlotId
      });
    },
    async loadRawLog(slotId) {
      const safeSlotId = String(slotId || '').toUpperCase();
      return loadTextRecord(`raw:${safeSlotId}`);
    },
    async saveArchiveText(path, text, meta = {}) {
      const safePath = String(path || '');
      return saveTextRecord('archive', `archive:${safePath}`, text, {
        ...meta,
        path: safePath
      });
    },
    async loadArchiveText(path) {
      const safePath = String(path || '');
      return loadTextRecord(`archive:${safePath}`);
    },
    async saveArchiveLog(path, text, meta = {}) {
      return this.saveArchiveText(path, text, {
        ...meta,
        kind: 'archive-log'
      });
    },
    async loadArchiveLog(path) {
      return this.loadArchiveText(path);
    },
    async deleteArchiveText(path) {
      const safePath = String(path || '');
      return deleteTextRecord(`archive:${safePath}`);
    },
    async saveAutosaveSession(payload) {
      return saveTextRecord('sessions', 'session:autosave', JSON.stringify(payload || {}), {
        kind: 'autosave-session'
      });
    },
    async loadAutosaveSession() {
      const record = await loadTextRecord('session:autosave');
      if (!record?.text) return null;
      try {
        return JSON.parse(record.text);
      } catch (err) {
        return null;
      }
    },
    encodeOpaqueKey(value) {
      return base64UrlEncode(value);
    },
    decodeOpaqueKey(value) {
      return base64UrlDecode(value);
    }
  };
}

export async function createSh6Storage(options = {}) {
  return createSh6Persistence(options);
}
