import { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  InkAuditRecord,
  StudioInkItem,
  ClientTattooSession,
  HeavyMetalCOARecord,
  CustomInkMixture,
  OfflineDatabaseBackup,
} from '../types/database';
import {
  getProfile,
  saveProfile as dbSaveProfile,
  getAudits,
  saveAudit as dbSaveAudit,
  deleteAudit as dbDeleteAudit,
  clearAllAudits as dbClearAudits,
  getInventory,
  saveInventoryItem as dbSaveInventory,
  deleteInventoryItem as dbDeleteInventory,
  getSessions,
  saveSession as dbSaveSession,
  deleteSession as dbDeleteSession,
  getCOARecords,
  saveCOARecord as dbSaveCOA,
  deleteCOARecord as dbDeleteCOA,
  getMixtures,
  saveMixture as dbSaveMixture,
  deleteMixture as dbDeleteMixture,
  exportOfflineBackup as dbExportBackup,
  importOfflineBackup as dbImportBackup,
  subscribeToSync,
  DEFAULT_PROFILE,
} from '../lib/offlineDb';

export interface UseOfflineSyncReturn {
  isOnline: boolean;
  profile: UserProfile;
  audits: InkAuditRecord[];
  inventory: StudioInkItem[];
  sessions: ClientTattooSession[];
  coas: HeavyMetalCOARecord[];
  mixtures: CustomInkMixture[];
  loading: boolean;
  syncTimestamp: string;
  saveUserProfile: (updated: Partial<UserProfile>) => Promise<void>;
  saveInkAudit: (audit: InkAuditRecord) => Promise<void>;
  deleteInkAudit: (id: string) => Promise<void>;
  clearInkAudits: () => Promise<void>;
  saveInventory: (item: StudioInkItem) => Promise<void>;
  deleteInventory: (id: string) => Promise<void>;
  saveSession: (session: ClientTattooSession) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  saveCOA: (coa: HeavyMetalCOARecord) => Promise<void>;
  deleteCOA: (id: string) => Promise<void>;
  saveMixture: (mixture: CustomInkMixture) => Promise<void>;
  deleteMixture: (id: string) => Promise<void>;
  exportData: () => Promise<OfflineDatabaseBackup>;
  importData: (backup: OfflineDatabaseBackup) => Promise<void>;
  refreshAll: () => Promise<void>;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [audits, setAudits] = useState<InkAuditRecord[]>([]);
  const [inventory, setInventory] = useState<StudioInkItem[]>([]);
  const [sessions, setSessions] = useState<ClientTattooSession[]>([]);
  const [coas, setCOAs] = useState<HeavyMetalCOARecord[]>([]);
  const [mixtures, setMixtures] = useState<CustomInkMixture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncTimestamp, setSyncTimestamp] = useState<string>(() => new Date().toLocaleTimeString());

  // Load all data from local offline database
  const refreshAll = useCallback(async () => {
    try {
      const [loadedProfile, loadedAudits, loadedInv, loadedSessions, loadedCoas, loadedMixtures] = await Promise.all([
        getProfile(),
        getAudits(),
        getInventory(),
        getSessions(),
        getCOARecords(),
        getMixtures(),
      ]);
      setProfile(loadedProfile);
      setAudits(loadedAudits);
      setInventory(loadedInv);
      setSessions(loadedSessions);
      setCOAs(loadedCoas);
      setMixtures(loadedMixtures);
      setSyncTimestamp(new Date().toLocaleTimeString());
    } catch {
      // Keep existing state
    } finally {
      setLoading(false);
    }
  }, []);

  // Online / offline network event listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial load
    refreshAll();

    // Subscribe to cross-tab BroadcastChannel & localStorage sync
    const unsubscribe = subscribeToSync((event) => {
      if (event.type === 'profile_updated' && event.payload) {
        setProfile(event.payload as UserProfile);
      } else {
        refreshAll();
      }
      setSyncTimestamp(new Date().toLocaleTimeString());
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, [refreshAll]);

  const saveUserProfile = useCallback(
    async (updated: Partial<UserProfile>) => {
      const merged: UserProfile = {
        ...profile,
        ...updated,
        updatedAt: new Date().toISOString(),
      };
      setProfile(merged);
      await dbSaveProfile(merged);
      setSyncTimestamp(new Date().toLocaleTimeString());
    },
    [profile]
  );

  const saveInkAudit = useCallback(async (audit: InkAuditRecord) => {
    await dbSaveAudit(audit);
    setAudits((prev) => [audit, ...prev.filter((a) => a.id !== audit.id)]);
    setSyncTimestamp(new Date().toLocaleTimeString());
  }, []);

  const deleteInkAudit = useCallback(async (id: string) => {
    await dbDeleteAudit(id);
    setAudits((prev) => prev.filter((a) => a.id !== id));
    setSyncTimestamp(new Date().toLocaleTimeString());
  }, []);

  const clearInkAudits = useCallback(async () => {
    await dbClearAudits();
    setAudits([]);
    setSyncTimestamp(new Date().toLocaleTimeString());
  }, []);

  const saveInventory = useCallback(async (item: StudioInkItem) => {
    await dbSaveInventory(item);
    setInventory((prev) => [...prev.filter((i) => i.id !== item.id), item]);
    setSyncTimestamp(new Date().toLocaleTimeString());
  }, []);

  const deleteInventory = useCallback(async (id: string) => {
    await dbDeleteInventory(id);
    setInventory((prev) => prev.filter((i) => i.id !== id));
    setSyncTimestamp(new Date().toLocaleTimeString());
  }, []);

  const saveSession = useCallback(async (session: ClientTattooSession) => {
    await dbSaveSession(session);
    setSessions((prev) => [session, ...prev.filter((s) => s.id !== session.id)]);
    setSyncTimestamp(new Date().toLocaleTimeString());
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    await dbDeleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setSyncTimestamp(new Date().toLocaleTimeString());
  }, []);

  const saveCOA = useCallback(async (coa: HeavyMetalCOARecord) => {
    await dbSaveCOA(coa);
    setCOAs((prev) => [coa, ...prev.filter((c) => c.id !== coa.id)]);
    setSyncTimestamp(new Date().toLocaleTimeString());
  }, []);

  const deleteCOA = useCallback(async (id: string) => {
    await dbDeleteCOA(id);
    setCOAs((prev) => prev.filter((c) => c.id !== id));
    setSyncTimestamp(new Date().toLocaleTimeString());
  }, []);

  const saveMixture = useCallback(async (mixture: CustomInkMixture) => {
    await dbSaveMixture(mixture);
    setMixtures((prev) => [mixture, ...prev.filter((m) => m.id !== mixture.id)]);
    setSyncTimestamp(new Date().toLocaleTimeString());
  }, []);

  const deleteMixture = useCallback(async (id: string) => {
    await dbDeleteMixture(id);
    setMixtures((prev) => prev.filter((m) => m.id !== id));
    setSyncTimestamp(new Date().toLocaleTimeString());
  }, []);

  const exportData = useCallback(async () => {
    return dbExportBackup();
  }, []);

  const importData = useCallback(
    async (backup: OfflineDatabaseBackup) => {
      await dbImportBackup(backup);
      await refreshAll();
    },
    [refreshAll]
  );

  return {
    isOnline,
    profile,
    audits,
    inventory,
    sessions,
    coas,
    mixtures,
    loading,
    syncTimestamp,
    saveUserProfile,
    saveInkAudit,
    deleteInkAudit,
    clearInkAudits,
    saveInventory,
    deleteInventory,
    saveSession,
    deleteSession,
    saveCOA,
    deleteCOA,
    saveMixture,
    deleteMixture,
    exportData,
    importData,
    refreshAll,
  };
}
