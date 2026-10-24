import { ParsedHit, DecodeStats } from './pigment';

export interface UserProfile {
  id: string;
  name: string;
  studioName: string;
  role: string;
  location: string;
  notes: string;
  avatarDataUrl: string | null;
  updatedAt: string;
}

export interface InkAuditRecord {
  id: string;
  timestamp: string; // ISO string
  localDate: string; // Format YYYY-MM-DD in local calendar (Ban 19)
  inkName: string;
  brand: string;
  batchNumber: string;
  ingredientsRaw: string;
  hits: ParsedHit[];
  stats: DecodeStats;
  verdict: 'prohibited_detected' | 'restricted_detected' | 'not_covered_only' | 'unrecognised_items';
  findingsSummary: string;
  auditorName: string;
  studioName: string;
  auditorAvatar: string | null;
  synced: boolean;
  updatedAt: string;
}

export interface StudioInkItem {
  id: string;
  name: string;
  brand: string;
  batchNumber?: string;
  color?: string;
  ciNumbers?: string[];
  casNumbers?: string[];
  openedDate?: string; // Format YYYY-MM-DD in local calendar
  expiryDate?: string; // Format YYYY-MM-DD in local calendar
  paoMonths?: number; // Period After Opening in months (e.g. 6, 12)
  status: 'compliant' | 'restricted' | 'banned' | 'unverified';
  notes?: string;
  lastVerified?: string;
  updatedAt: string;
}

export interface ClientTattooSession {
  id: string;
  timestamp: string;
  localDate: string; // Format YYYY-MM-DD in local calendar
  clientReference: string; // Client consent # or code
  clientName: string;
  artistName: string;
  studioName: string;
  bodyPlacement: string;
  usedInks: {
    inkId: string;
    inkName: string;
    brand: string;
    batchNumber: string;
    purpose: 'outline' | 'shading' | 'color_fill' | 'highlight';
    status: 'compliant' | 'restricted' | 'banned' | 'unverified';
    isMixture?: boolean;
    mixtureBatchNumber?: string;
    diluentInfo?: string;
  }[];
  notes?: string;
}

export interface CustomInkMixture {
  id: string;
  name: string;
  type: 'graywash' | 'color_dilution' | 'lining_wash' | 'custom';
  mixtureBatchNumber: string;
  preparedDate: string; // Format YYYY-MM-DD in local calendar
  expiryDate?: string; // Format YYYY-MM-DD in local calendar
  paoDays?: number; // E.g. 30 days or single-use
  artistName?: string;
  studioName?: string;
  baseInks: {
    inkId?: string;
    inkName: string;
    brand: string;
    batchNumber: string;
    ratioOrDrops: string;
  }[];
  diluent?: {
    type?: string;
    name?: string;
    brand?: string;
    batchNumber?: string;
    ratioOrDrops?: string;
  };
  notes?: string;
  createdAt?: string;
  updatedAt: string;
}

export interface HeavyMetalCOARecord {
  id: string;
  batchNumber: string;
  inkName: string;
  brand: string;
  testDate: string; // YYYY-MM-DD
  labName: string;
  sampleType: 'ink_bottle' | 'raw_pigment';
  results: {
    metalId: string;
    substanceName: string;
    measuredPpm: number;
    maxLimitPpm: number;
    pass: boolean;
    marginPercent: number; // e.g. 20% of limit
  }[];
  overallPass: boolean;
  notes?: string;
  createdAt: string;
}

export interface OfflineSyncQueueItem {
  id: string;
  action: 'save_audit' | 'delete_audit' | 'save_profile' | 'save_inventory' | 'delete_inventory';
  entityId: string;
  timestamp: string;
  status: 'synced_local' | 'pending';
}

export interface OfflineDatabaseBackup {
  schemaVersion: number;
  exportedAt: string;
  profile: UserProfile | null;
  audits: InkAuditRecord[];
  inventory: StudioInkItem[];
  sessions?: ClientTattooSession[];
  coas?: HeavyMetalCOARecord[];
  mixtures?: CustomInkMixture[];
  queue: OfflineSyncQueueItem[];
}
