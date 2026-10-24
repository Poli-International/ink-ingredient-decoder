import {
  UserProfile,
  InkAuditRecord,
  StudioInkItem,
  ClientTattooSession,
  HeavyMetalCOARecord,
  CustomInkMixture,
  OfflineSyncQueueItem,
  OfflineDatabaseBackup,
} from '../types/database';

const DB_NAME = 'poli_ink_ingredient_decoder_db';
const DB_VERSION = 3;
const SYNC_CHANNEL_NAME = 'poli_ink_decoder_sync_channel';

export const DEFAULT_PROFILE: UserProfile = {
  id: 'default_artist_profile',
  name: 'Tattoo Artist',
  studioName: 'Independent Studio',
  role: 'Tattoo Artist',
  location: 'European Union',
  notes: 'Compliance monitoring under EU 2020/2081.',
  avatarDataUrl: null,
  updatedAt: new Date().toISOString(),
};

type SyncListener = (event: { type: string; payload?: unknown }) => void;
const syncListeners = new Set<SyncListener>();

let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
    syncChannel.onmessage = (ev) => {
      syncListeners.forEach((fn) => fn(ev.data));
    };
  } catch {
    syncChannel = null;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'poli_sync_ping' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        syncListeners.forEach((fn) => fn(parsed));
      } catch {
        // Ignore
      }
    }
  });
}

function notifySync(type: string, payload?: unknown) {
  const msg = { type, payload, timestamp: Date.now() };
  if (syncChannel) {
    try {
      syncChannel.postMessage(msg);
    } catch {
      // Ignored
    }
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('poli_sync_ping', JSON.stringify(msg));
    } catch {
      // Ignored
    }
  }
  syncListeners.forEach((fn) => fn(msg));
}

export function subscribeToSync(listener: SyncListener): () => void {
  syncListeners.add(listener);
  return () => {
    syncListeners.delete(listener);
  };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('profiles')) {
        db.createObjectStore('profiles', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('audits')) {
        const auditStore = db.createObjectStore('audits', { keyPath: 'id' });
        auditStore.createIndex('timestamp', 'timestamp', { unique: false });
        auditStore.createIndex('verdict', 'verdict', { unique: false });
      }

      if (!db.objectStoreNames.contains('inventory')) {
        const invStore = db.createObjectStore('inventory', { keyPath: 'id' });
        invStore.createIndex('brand', 'brand', { unique: false });
        invStore.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('coas')) {
        const coaStore = db.createObjectStore('coas', { keyPath: 'id' });
        coaStore.createIndex('batchNumber', 'batchNumber', { unique: false });
      }

      if (!db.objectStoreNames.contains('mixtures')) {
        const mixStore = db.createObjectStore('mixtures', { keyPath: 'id' });
        mixStore.createIndex('mixtureBatchNumber', 'mixtureBatchNumber', { unique: false });
      }

      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id' });
      }
    };
  });
}

// ─── Profile Storage ─────────────────────────────────────────────

export async function getProfile(): Promise<UserProfile> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('profiles', 'readonly');
      const store = tx.objectStore('profiles');
      const req = store.get('default_artist_profile');

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result as UserProfile);
        } else {
          const local = getLocalStorageItem<UserProfile>('poli_profile');
          resolve(local || DEFAULT_PROFILE);
        }
      };

      req.onerror = () => {
        const local = getLocalStorageItem<UserProfile>('poli_profile');
        resolve(local || DEFAULT_PROFILE);
      };
    });
  } catch {
    const local = getLocalStorageItem<UserProfile>('poli_profile');
    return local || DEFAULT_PROFILE;
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  profile.updatedAt = new Date().toISOString();
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('profiles', 'readwrite');
      const store = tx.objectStore('profiles');
      const req = store.put(profile);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback to localStorage
  }
  setLocalStorageItem('poli_profile', profile);
  notifySync('profile_updated', profile);
}

// ─── Audits (Saved Inks Shortlist) Storage ───────────────────────

export async function getAudits(): Promise<InkAuditRecord[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('audits', 'readonly');
      const store = tx.objectStore('audits');
      const req = store.getAll();

      req.onsuccess = () => {
        const items = (req.result || []) as InkAuditRecord[];
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(items);
      };

      req.onerror = () => {
        const local = getLocalStorageItem<InkAuditRecord[]>('poli_audits') || [];
        resolve(local);
      };
    });
  } catch {
    const local = getLocalStorageItem<InkAuditRecord[]>('poli_audits') || [];
    return local;
  }
}

export async function saveAudit(audit: InkAuditRecord): Promise<void> {
  audit.updatedAt = new Date().toISOString();
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('audits', 'readwrite');
      const store = tx.objectStore('audits');
      const req = store.put(audit);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback to localStorage
  }

  const existing = getLocalStorageItem<InkAuditRecord[]>('poli_audits') || [];
  const filtered = existing.filter((a) => a.id !== audit.id);
  filtered.unshift(audit);
  setLocalStorageItem('poli_audits', filtered);

  notifySync('audit_saved', audit);
}

export async function deleteAudit(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('audits', 'readwrite');
      const store = tx.objectStore('audits');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback
  }

  const existing = getLocalStorageItem<InkAuditRecord[]>('poli_audits') || [];
  const filtered = existing.filter((a) => a.id !== id);
  setLocalStorageItem('poli_audits', filtered);

  notifySync('audit_deleted', id);
}

export async function clearAllAudits(): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('audits', 'readwrite');
      const store = tx.objectStore('audits');
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback
  }

  setLocalStorageItem('poli_audits', []);
  notifySync('audits_cleared');
}

// ─── Inventory Storage ───────────────────────────────────────────

export async function getInventory(): Promise<StudioInkItem[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('inventory', 'readonly');
      const store = tx.objectStore('inventory');
      const req = store.getAll();

      req.onsuccess = () => {
        resolve((req.result || []) as StudioInkItem[]);
      };

      req.onerror = () => {
        const local = getLocalStorageItem<StudioInkItem[]>('poli_inventory') || [];
        resolve(local);
      };
    });
  } catch {
    const local = getLocalStorageItem<StudioInkItem[]>('poli_inventory') || [];
    return local;
  }
}

export async function saveInventoryItem(item: StudioInkItem): Promise<void> {
  item.updatedAt = new Date().toISOString();
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('inventory', 'readwrite');
      const store = tx.objectStore('inventory');
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback
  }

  const existing = getLocalStorageItem<StudioInkItem[]>('poli_inventory') || [];
  const filtered = existing.filter((i) => i.id !== item.id);
  filtered.push(item);
  setLocalStorageItem('poli_inventory', filtered);

  notifySync('inventory_saved', item);
}

export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('inventory', 'readwrite');
      const store = tx.objectStore('inventory');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback
  }

  const existing = getLocalStorageItem<StudioInkItem[]>('poli_inventory') || [];
  const filtered = existing.filter((i) => i.id !== id);
  setLocalStorageItem('poli_inventory', filtered);

  notifySync('inventory_deleted', id);
}

// ─── Client Sessions Storage ─────────────────────────────────────

export async function getSessions(): Promise<ClientTattooSession[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('sessions', 'readonly');
      const store = tx.objectStore('sessions');
      const req = store.getAll();

      req.onsuccess = () => {
        const items = (req.result || []) as ClientTattooSession[];
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(items);
      };

      req.onerror = () => {
        const local = getLocalStorageItem<ClientTattooSession[]>('poli_sessions') || [];
        resolve(local);
      };
    });
  } catch {
    const local = getLocalStorageItem<ClientTattooSession[]>('poli_sessions') || [];
    return local;
  }
}

export async function saveSession(session: ClientTattooSession): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      const req = store.put(session);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback
  }

  const existing = getLocalStorageItem<ClientTattooSession[]>('poli_sessions') || [];
  const filtered = existing.filter((s) => s.id !== session.id);
  filtered.unshift(session);
  setLocalStorageItem('poli_sessions', filtered);

  notifySync('session_saved', session);
}

export async function deleteSession(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback
  }

  const existing = getLocalStorageItem<ClientTattooSession[]>('poli_sessions') || [];
  const filtered = existing.filter((s) => s.id !== id);
  setLocalStorageItem('poli_sessions', filtered);

  notifySync('session_deleted', id);
}

// ─── Heavy Metal COA Test Storage ─────────────────────────────────

export async function getCOARecords(): Promise<HeavyMetalCOARecord[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('coas', 'readonly');
      const store = tx.objectStore('coas');
      const req = store.getAll();

      req.onsuccess = () => {
        const items = (req.result || []) as HeavyMetalCOARecord[];
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(items);
      };

      req.onerror = () => {
        const local = getLocalStorageItem<HeavyMetalCOARecord[]>('poli_coas') || [];
        resolve(local);
      };
    });
  } catch {
    const local = getLocalStorageItem<HeavyMetalCOARecord[]>('poli_coas') || [];
    return local;
  }
}

export async function saveCOARecord(coa: HeavyMetalCOARecord): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('coas', 'readwrite');
      const store = tx.objectStore('coas');
      const req = store.put(coa);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback
  }

  const existing = getLocalStorageItem<HeavyMetalCOARecord[]>('poli_coas') || [];
  const filtered = existing.filter((c) => c.id !== coa.id);
  filtered.unshift(coa);
  setLocalStorageItem('poli_coas', filtered);

  notifySync('coa_saved', coa);
}

export async function deleteCOARecord(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('coas', 'readwrite');
      const store = tx.objectStore('coas');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback
  }

  const existing = getLocalStorageItem<HeavyMetalCOARecord[]>('poli_coas') || [];
  const filtered = existing.filter((c) => c.id !== id);
  setLocalStorageItem('poli_coas', filtered);

  notifySync('coa_deleted', id);
}

// ─── Custom Shade & Dilution Mixture Storage ─────────────────────

export async function getMixtures(): Promise<CustomInkMixture[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('mixtures', 'readonly');
      const store = tx.objectStore('mixtures');
      const req = store.getAll();

      req.onsuccess = () => {
        const items = (req.result || []) as CustomInkMixture[];
        items.sort((a, b) => new Date(b.preparedDate).getTime() - new Date(a.preparedDate).getTime());
        resolve(items);
      };

      req.onerror = () => {
        const local = getLocalStorageItem<CustomInkMixture[]>('poli_mixtures') || [];
        resolve(local);
      };
    });
  } catch {
    const local = getLocalStorageItem<CustomInkMixture[]>('poli_mixtures') || [];
    return local;
  }
}

export async function saveMixture(mixture: CustomInkMixture): Promise<void> {
  mixture.updatedAt = new Date().toISOString();
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('mixtures', 'readwrite');
      const store = tx.objectStore('mixtures');
      const req = store.put(mixture);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback
  }

  const existing = getLocalStorageItem<CustomInkMixture[]>('poli_mixtures') || [];
  const filtered = existing.filter((m) => m.id !== mixture.id);
  filtered.unshift(mixture);
  setLocalStorageItem('poli_mixtures', filtered);

  notifySync('mixture_saved', mixture);
}

export async function deleteMixture(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('mixtures', 'readwrite');
      const store = tx.objectStore('mixtures');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback
  }

  const existing = getLocalStorageItem<CustomInkMixture[]>('poli_mixtures') || [];
  const filtered = existing.filter((m) => m.id !== id);
  setLocalStorageItem('poli_mixtures', filtered);

  notifySync('mixture_deleted', id);
}

// ─── Export & Import ─────────────────────────────────────────────

export async function exportOfflineBackup(): Promise<OfflineDatabaseBackup> {
  const profile = await getProfile();
  const audits = await getAudits();
  const inventory = await getInventory();
  const sessions = await getSessions();
  const coas = await getCOARecords();
  const mixtures = await getMixtures();

  return {
    schemaVersion: DB_VERSION,
    exportedAt: new Date().toISOString(),
    profile,
    audits,
    inventory,
    sessions,
    coas,
    mixtures,
    queue: [],
  };
}

export async function importOfflineBackup(backup: OfflineDatabaseBackup): Promise<void> {
  if (!backup || typeof backup !== 'object') {
    throw new Error('Invalid backup file format.');
  }

  if (backup.profile) {
    await saveProfile(backup.profile);
  }

  if (Array.isArray(backup.audits)) {
    for (const audit of backup.audits) {
      if (audit && audit.id) {
        await saveAudit(audit);
      }
    }
  }

  if (Array.isArray(backup.inventory)) {
    for (const item of backup.inventory) {
      if (item && item.id) {
        await saveInventoryItem(item);
      }
    }
  }

  if (Array.isArray(backup.sessions)) {
    for (const session of backup.sessions) {
      if (session && session.id) {
        await saveSession(session);
      }
    }
  }

  if (Array.isArray(backup.coas)) {
    for (const coa of backup.coas) {
      if (coa && coa.id) {
        await saveCOARecord(coa);
      }
    }
  }

  if (Array.isArray(backup.mixtures)) {
    for (const mixture of backup.mixtures) {
      if (mixture && mixture.id) {
        await saveMixture(mixture);
      }
    }
  }

  notifySync('backup_imported');
}

// ─── LocalStorage helpers ────────────────────────────────────────

function getLocalStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalStorageItem<T>(key: string, val: T): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Quota reached
  }
}
