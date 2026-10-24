export type PigmentStatus = 'banned' | 'restricted' | 'watch' | 'svhc' | 'safe';

export type ColorGroup =
  | 'blue'
  | 'green'
  | 'violet'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'black'
  | 'white'
  | 'preservative'
  | 'solvent'
  | 'heavy_metal'
  | 'metal_impurity'
  | 'additive'
  | 'amine'
  | 'aromatic_amine'
  | 'other';

export interface PigmentRecord {
  id: string;
  name: string;
  ci: string | null;
  cas: string[];
  inci: string | null;
  color_group: ColorGroup;
  status: PigmentStatus;
  status_label: string;
  regulation: string | null;
  limit_ppm: number | null;
  exact_limit?: string; // Exact regulatory text, e.g. "0.00005% by weight (0.5 mg/kg)" or "check the regulation text"
  entry_reference?: string; // e.g. "Entry 75, paragraph 1(a) / Appendix 13"
  notes: string;
  also_known_as: string[];
  found_in: string[];
  echa_cas?: string;
  echa_ref?: string;
}

export interface ParsedHit {
  query: string;
  type: 'cas' | 'ci' | 'name' | 'unrecognised';
  substance: PigmentRecord | null;
  matchedBy?: string; // Explanation of what matched (e.g. "CI 77266", "Trade shorthand PBk 7", "CAS 1333-86-4")
  unrecognisedReason?: string; // e.g. "Not listed under Entry 75 or cosmetic pigment index"
  detectedConcentrationPercent?: number | null; // e.g. 15 for 15%
  concentrationRaw?: string | null; // e.g. "15-20%" or "<0.00005%"
  concentrationVerdict?: 'exceeds_limit' | 'within_limit' | 'limit_not_quantified' | 'prohibited_regardless';
}

export interface DecodeStats {
  total: number;
  prohibited: number;
  restricted: number;
  notCovered: number;
  unrecognised: number;
}
