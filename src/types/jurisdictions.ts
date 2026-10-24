export type JurisdictionId = 'eu' | 'us' | 'au' | 'asean';

export interface JurisdictionMeta {
  id: JurisdictionId;
  nameKey: string;
  regionKey: string;
  flagCode: string;
  primaryLaw: string;
  governingBody: string;
  approachType: 'chemical_limits' | 'facility_listing' | 'industrial_inventory' | 'non_harmonized';
}

export type DivergenceCategory =
  | 'statutory_basis'
  | 'chemical_thresholds'
  | 'pigment_rules'
  | 'heavy_metals'
  | 'facility_duties'
  | 'studio_records'
  | 'pmu_provisions'
  | 'enforcement';

export interface DivergencePoint {
  id: string;
  category: DivergenceCategory;
  categoryKey: string;
  titleKey: string;
  jurisdictions: {
    eu: {
      instrument: string;
      summaryKey: string;
      specificsKey: string;
      statusBadge: 'binding_ppm' | 'strict_restriction' | 'svhc_threshold';
    };
    us: {
      instrument: string;
      summaryKey: string;
      specificsKey: string;
      statusBadge: 'mocra_listing' | 'unapproved_color' | 'enforcement_discretion';
    };
    au: {
      instrument: string;
      summaryKey: string;
      specificsKey: string;
      statusBadge: 'aicis_inventory' | 'state_health' | 'not_ppm_regulated';
    };
    asean: {
      instrument: string;
      summaryKey: string;
      specificsKey: string;
      statusBadge: 'non_harmonized' | 'acd_topical_only' | 'national_licensing';
    };
  };
}

export interface IngredientJurisdictionStatus {
  jurisdiction: JurisdictionId;
  status: 'compliant' | 'restricted' | 'banned' | 'listed' | 'unapproved' | 'not_regulated' | 'action_required';
  statusLabelKey: string;
  statutoryReference: string;
  legalContextKey: string;
  practicalActionKey: string;
}

export interface IngredientMultiAssessment {
  substanceId: string;
  name: string;
  ci: string | null;
  cas: string[];
  colorGroup: string;
  eu: IngredientJurisdictionStatus;
  us: IngredientJurisdictionStatus;
  au: IngredientJurisdictionStatus;
  asean: IngredientJurisdictionStatus;
}
