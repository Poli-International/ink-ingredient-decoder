import {
  JurisdictionMeta,
  JurisdictionId,
  DivergencePoint,
  IngredientMultiAssessment,
  IngredientJurisdictionStatus,
} from '../types/jurisdictions';
import { PigmentRecord } from '../types/pigment';

export const JURISDICTIONS_META: Record<JurisdictionId, JurisdictionMeta> = {
  eu: {
    id: 'eu',
    nameKey: 'jurisdictions.eu.name',
    regionKey: 'jurisdictions.eu.region',
    flagCode: 'EU',
    primaryLaw: 'Regulation (EU) 2020/2081 (REACH Annex XVII Entry 75)',
    governingBody: 'European Chemicals Agency (ECHA)',
    approachType: 'chemical_limits',
  },
  us: {
    id: 'us',
    nameKey: 'jurisdictions.us.name',
    regionKey: 'jurisdictions.us.region',
    flagCode: 'US',
    primaryLaw: 'Federal Food, Drug, and Cosmetic Act (FD&C Act) / MoCRA',
    governingBody: 'U.S. Food and Drug Administration (FDA)',
    approachType: 'facility_listing',
  },
  au: {
    id: 'au',
    nameKey: 'jurisdictions.au.name',
    regionKey: 'jurisdictions.au.region',
    flagCode: 'AU',
    primaryLaw: 'Industrial Chemicals Act 2019 / AICIS',
    governingBody: 'Australian Industrial Chemicals Introduction Scheme (AICIS)',
    approachType: 'industrial_inventory',
  },
  asean: {
    id: 'asean',
    nameKey: 'jurisdictions.asean.name',
    regionKey: 'jurisdictions.asean.region',
    flagCode: 'ASEAN',
    primaryLaw: 'ASEAN Cosmetic Directive (ACD) / National Public Health Acts',
    governingBody: 'National Regulatory Authorities (HSA, FDA Thailand, BPOM, NPRA)',
    approachType: 'non_harmonized',
  },
};

export const DIVERGENCE_POINTS: DivergencePoint[] = [
  {
    id: 'statutory_classification',
    category: 'statutory_basis',
    categoryKey: 'jurisdictions.divergence.cat_statutory',
    titleKey: 'jurisdictions.divergence.statutory_title',
    jurisdictions: {
      eu: {
        instrument: 'Regulation (EU) 2020/2081 (REACH Annex XVII Entry 75)',
        summaryKey: 'jurisdictions.divergence.eu_statutory_summary',
        specificsKey: 'jurisdictions.divergence.eu_statutory_specifics',
        statusBadge: 'binding_ppm',
      },
      us: {
        instrument: 'FD&C Act Section 601 / MoCRA (21 U.S.C. 364)',
        summaryKey: 'jurisdictions.divergence.us_statutory_summary',
        specificsKey: 'jurisdictions.divergence.us_statutory_specifics',
        statusBadge: 'mocra_listing',
      },
      au: {
        instrument: 'Industrial Chemicals Act 2019 & State Public Health Acts',
        summaryKey: 'jurisdictions.divergence.au_statutory_summary',
        specificsKey: 'jurisdictions.divergence.au_statutory_specifics',
        statusBadge: 'aicis_inventory',
      },
      asean: {
        instrument: 'ASEAN Cosmetic Directive & National Public Health Ordinances',
        summaryKey: 'jurisdictions.divergence.asean_statutory_summary',
        specificsKey: 'jurisdictions.divergence.asean_statutory_specifics',
        statusBadge: 'non_harmonized',
      },
    },
  },
  {
    id: 'chemical_thresholds',
    category: 'chemical_thresholds',
    categoryKey: 'jurisdictions.divergence.cat_thresholds',
    titleKey: 'jurisdictions.divergence.thresholds_title',
    jurisdictions: {
      eu: {
        instrument: 'REACH Annex XVII Entry 75 Appendix 13 Table',
        summaryKey: 'jurisdictions.divergence.eu_thresholds_summary',
        specificsKey: 'jurisdictions.divergence.eu_thresholds_specifics',
        statusBadge: 'binding_ppm',
      },
      us: {
        instrument: 'FD&C Act Sections 601 & 602 (Adulteration & Misbranding)',
        summaryKey: 'jurisdictions.divergence.us_thresholds_summary',
        specificsKey: 'jurisdictions.divergence.us_thresholds_specifics',
        statusBadge: 'enforcement_discretion',
      },
      au: {
        instrument: 'AICIS Chemical Introductions & State Skin Penetration Codes',
        summaryKey: 'jurisdictions.divergence.au_thresholds_summary',
        specificsKey: 'jurisdictions.divergence.au_thresholds_specifics',
        statusBadge: 'not_ppm_regulated',
      },
      asean: {
        instrument: 'ACD Annex II (Topical Cosmetics Only) / Municipal Rules',
        summaryKey: 'jurisdictions.divergence.asean_thresholds_summary',
        specificsKey: 'jurisdictions.divergence.asean_thresholds_specifics',
        statusBadge: 'acd_topical_only',
      },
    },
  },
  {
    id: 'pigment_approval_paradox',
    category: 'pigment_rules',
    categoryKey: 'jurisdictions.divergence.cat_pigments',
    titleKey: 'jurisdictions.divergence.pigments_title',
    jurisdictions: {
      eu: {
        instrument: 'REACH Entry 75 / Appendix 13 Derogations',
        summaryKey: 'jurisdictions.divergence.eu_pigments_summary',
        specificsKey: 'jurisdictions.divergence.eu_pigments_specifics',
        statusBadge: 'strict_restriction',
      },
      us: {
        instrument: '21 CFR Parts 70, 73, 74, 81 & 82 (Color Additives)',
        summaryKey: 'jurisdictions.divergence.us_pigments_summary',
        specificsKey: 'jurisdictions.divergence.us_pigments_specifics',
        statusBadge: 'unapproved_color',
      },
      au: {
        instrument: 'Australian Inventory of Industrial Chemicals (AIIC)',
        summaryKey: 'jurisdictions.divergence.au_pigments_summary',
        specificsKey: 'jurisdictions.divergence.au_pigments_specifics',
        statusBadge: 'aicis_inventory',
      },
      asean: {
        instrument: 'National Import Customs & Consumer Protection Acts',
        summaryKey: 'jurisdictions.divergence.asean_pigments_summary',
        specificsKey: 'jurisdictions.divergence.asean_pigments_specifics',
        statusBadge: 'non_harmonized',
      },
    },
  },
  {
    id: 'heavy_metals_impurities',
    category: 'heavy_metals',
    categoryKey: 'jurisdictions.divergence.cat_metals',
    titleKey: 'jurisdictions.divergence.metals_title',
    jurisdictions: {
      eu: {
        instrument: 'REACH Entry 75 Appendix 13 Table: 19 Statutory Limits',
        summaryKey: 'jurisdictions.divergence.eu_metals_summary',
        specificsKey: 'jurisdictions.divergence.eu_metals_specifics',
        statusBadge: 'binding_ppm',
      },
      us: {
        instrument: 'FDA CFSAN Microbial & Impurity Safety Advisories',
        summaryKey: 'jurisdictions.divergence.us_metals_summary',
        specificsKey: 'jurisdictions.divergence.us_metals_specifics',
        statusBadge: 'enforcement_discretion',
      },
      au: {
        instrument: 'AICIS Chemical Risk Evaluations & State Health Acts',
        summaryKey: 'jurisdictions.divergence.au_metals_summary',
        specificsKey: 'jurisdictions.divergence.au_metals_specifics',
        statusBadge: 'not_ppm_regulated',
      },
      asean: {
        instrument: 'ACD Cosmetic Limits (Topical: Pb 20ppm, As 5ppm, Hg 1ppm)',
        summaryKey: 'jurisdictions.divergence.asean_metals_summary',
        specificsKey: 'jurisdictions.divergence.asean_metals_specifics',
        statusBadge: 'acd_topical_only',
      },
    },
  },
  {
    id: 'facility_manufacturer_duties',
    category: 'facility_duties',
    categoryKey: 'jurisdictions.divergence.cat_facility',
    titleKey: 'jurisdictions.divergence.facility_title',
    jurisdictions: {
      eu: {
        instrument: 'CLP Regulation (EC) No 1272/2008 & REACH Title IV (SDS)',
        summaryKey: 'jurisdictions.divergence.eu_facility_summary',
        specificsKey: 'jurisdictions.divergence.eu_facility_specifics',
        statusBadge: 'strict_restriction',
      },
      us: {
        instrument: 'MoCRA Sections 605, 606, 607, 609 (21 U.S.C. 364a-e)',
        summaryKey: 'jurisdictions.divergence.us_facility_summary',
        specificsKey: 'jurisdictions.divergence.us_facility_specifics',
        statusBadge: 'mocra_listing',
      },
      au: {
        instrument: 'AICIS Annual Declarations & Importer Registrations',
        summaryKey: 'jurisdictions.divergence.au_facility_summary',
        specificsKey: 'jurisdictions.divergence.au_facility_specifics',
        statusBadge: 'aicis_inventory',
      },
      asean: {
        instrument: 'National Importer Licensing & Commercial Invoicing',
        summaryKey: 'jurisdictions.divergence.asean_facility_summary',
        specificsKey: 'jurisdictions.divergence.asean_facility_specifics',
        statusBadge: 'national_licensing',
      },
    },
  },
  {
    id: 'studio_recordkeeping_mandates',
    category: 'studio_records',
    categoryKey: 'jurisdictions.divergence.cat_records',
    titleKey: 'jurisdictions.divergence.records_title',
    jurisdictions: {
      eu: {
        instrument: 'Member State Health Acts & Consumer Product Safety Laws',
        summaryKey: 'jurisdictions.divergence.eu_records_summary',
        specificsKey: 'jurisdictions.divergence.eu_records_specifics',
        statusBadge: 'strict_restriction',
      },
      us: {
        instrument: 'MoCRA Adverse Event Traceability (3-Year Lot Retention Recommended)',
        summaryKey: 'jurisdictions.divergence.us_records_summary',
        specificsKey: 'jurisdictions.divergence.us_records_specifics',
        statusBadge: 'mocra_listing',
      },
      au: {
        instrument: 'State Public Health Regulations (Skin Penetration Codes)',
        summaryKey: 'jurisdictions.divergence.au_records_summary',
        specificsKey: 'jurisdictions.divergence.au_records_specifics',
        statusBadge: 'state_health',
      },
      asean: {
        instrument: 'Municipal Salon Ordinances & Studio Inspection Logs',
        summaryKey: 'jurisdictions.divergence.asean_records_summary',
        specificsKey: 'jurisdictions.divergence.asean_records_specifics',
        statusBadge: 'national_licensing',
      },
    },
  },
  {
    id: 'pmu_microblading_scope',
    category: 'pmu_provisions',
    categoryKey: 'jurisdictions.divergence.cat_pmu',
    titleKey: 'jurisdictions.divergence.pmu_title',
    jurisdictions: {
      eu: {
        instrument: 'REACH Entry 75 ("Tattoos or Permanent Make-Up")',
        summaryKey: 'jurisdictions.divergence.eu_pmu_summary',
        specificsKey: 'jurisdictions.divergence.eu_pmu_specifics',
        statusBadge: 'binding_ppm',
      },
      us: {
        instrument: 'FD&C Act / MoCRA Cosmetic Pigment Scope',
        summaryKey: 'jurisdictions.divergence.us_pmu_summary',
        specificsKey: 'jurisdictions.divergence.us_pmu_specifics',
        statusBadge: 'mocra_listing',
      },
      au: {
        instrument: 'Personal Appearance Services Acts & Infection Control Standards',
        summaryKey: 'jurisdictions.divergence.au_pmu_summary',
        specificsKey: 'jurisdictions.divergence.au_pmu_specifics',
        statusBadge: 'state_health',
      },
      asean: {
        instrument: 'ACD Topical Prep Rules & Local Aesthetic Clinic Guidelines',
        summaryKey: 'jurisdictions.divergence.asean_pmu_summary',
        specificsKey: 'jurisdictions.divergence.asean_pmu_specifics',
        statusBadge: 'acd_topical_only',
      },
    },
  },
];

export function assessSubstanceAcrossJurisdictions(
  substance: PigmentRecord,
  concentrationPercent?: number | null
): IngredientMultiAssessment {
  const isCi74160 = substance.ci === 'CI 74160';
  const isCi74260 = substance.ci === 'CI 74260';
  const isBannedEU = substance.status === 'banned' || substance.status === 'svhc';
  const isRestrictedEU = substance.status === 'restricted';
  const isMetalImpurity = substance.color_group === 'heavy_metal' || substance.color_group === 'metal_impurity';

  // 1. EU Assessment
  let euStatus: IngredientJurisdictionStatus['status'] = 'compliant';
  let euStatusLabel = 'jurisdictions.status.eu_compliant';
  let euLegalContext = 'jurisdictions.eval.eu_compliant_desc';
  let euAction = 'jurisdictions.eval.eu_compliant_action';

  if (isCi74160 || isCi74260) {
    euStatus = 'restricted';
    euStatusLabel = 'jurisdictions.status.eu_restricted';
    euLegalContext = 'jurisdictions.eval.eu_bluegreen_desc';
    euAction = 'jurisdictions.eval.eu_bluegreen_action';
  } else if (isBannedEU) {
    euStatus = 'banned';
    euStatusLabel = 'jurisdictions.status.eu_banned';
    euLegalContext = 'jurisdictions.eval.eu_banned_desc';
    euAction = 'jurisdictions.eval.eu_banned_action';
  } else if (isRestrictedEU || isMetalImpurity) {
    euStatus = 'restricted';
    euStatusLabel = 'jurisdictions.status.eu_restricted';
    euLegalContext = 'jurisdictions.eval.eu_restricted_desc';
    euAction = 'jurisdictions.eval.eu_restricted_action';
  }

  // 2. US Assessment (FDA & MoCRA)
  let usStatus: IngredientJurisdictionStatus['status'] = 'listed';
  let usStatusLabel = 'jurisdictions.status.us_mocra_listed';
  let usLegalContext = 'jurisdictions.eval.us_standard_desc';
  let usAction = 'jurisdictions.eval.us_standard_action';

  if (isMetalImpurity) {
    usStatus = 'action_required';
    usStatusLabel = 'jurisdictions.status.us_contaminant_concern';
    usLegalContext = 'jurisdictions.eval.us_metal_desc';
    usAction = 'jurisdictions.eval.us_metal_action';
  } else if (substance.color_group !== 'solvent' && substance.color_group !== 'additive' && substance.color_group !== 'preservative') {
    // Coloring pigments in US: technically color additives under FD&C Act, unapproved for injection, sold under enforcement discretion + MoCRA
    usStatus = 'unapproved';
    usStatusLabel = 'jurisdictions.status.us_unapproved_color';
    usLegalContext = 'jurisdictions.eval.us_color_paradox_desc';
    usAction = 'jurisdictions.eval.us_color_paradox_action';
  }

  // 3. Australia Assessment (AICIS & AIIC)
  let auStatus: IngredientJurisdictionStatus['status'] = 'listed';
  let auStatusLabel = 'jurisdictions.status.au_aiic_listed';
  let auLegalContext = 'jurisdictions.eval.au_listed_desc';
  let auAction = 'jurisdictions.eval.au_listed_action';

  if (isMetalImpurity) {
    auStatus = 'action_required';
    auStatusLabel = 'jurisdictions.status.au_impurity_alert';
    auLegalContext = 'jurisdictions.eval.au_metal_desc';
    auAction = 'jurisdictions.eval.au_metal_action';
  } else if (substance.status === 'banned') {
    auStatus = 'action_required';
    auStatusLabel = 'jurisdictions.status.au_prohibited_chemical';
    auLegalContext = 'jurisdictions.eval.au_banned_desc';
    auAction = 'jurisdictions.eval.au_banned_action';
  }

  // 4. Southeast Asia Assessment (ASEAN ACD / National)
  let aseanStatus: IngredientJurisdictionStatus['status'] = 'not_regulated';
  let aseanStatusLabel = 'jurisdictions.status.asean_non_harmonized';
  let aseanLegalContext = 'jurisdictions.eval.asean_standard_desc';
  let aseanAction = 'jurisdictions.eval.asean_standard_action';

  if (isMetalImpurity) {
    aseanStatus = 'action_required';
    aseanStatusLabel = 'jurisdictions.status.asean_cosmetic_limit_applied';
    aseanLegalContext = 'jurisdictions.eval.asean_metal_desc';
    aseanAction = 'jurisdictions.eval.asean_metal_action';
  } else if (substance.status === 'banned') {
    aseanStatus = 'restricted';
    aseanStatusLabel = 'jurisdictions.status.asean_acd_annex_banned';
    aseanLegalContext = 'jurisdictions.eval.asean_banned_desc';
    aseanAction = 'jurisdictions.eval.asean_banned_action';
  }

  return {
    substanceId: substance.id,
    name: substance.name,
    ci: substance.ci,
    cas: substance.cas,
    colorGroup: substance.color_group,
    eu: {
      jurisdiction: 'eu',
      status: euStatus,
      statusLabelKey: euStatusLabel,
      statutoryReference: 'Regulation (EU) 2020/2081 (REACH Entry 75)',
      legalContextKey: euLegalContext,
      practicalActionKey: euAction,
    },
    us: {
      jurisdiction: 'us',
      status: usStatus,
      statusLabelKey: usStatusLabel,
      statutoryReference: 'FD&C Act Sec. 601 / MoCRA / 21 CFR',
      legalContextKey: usLegalContext,
      practicalActionKey: usAction,
    },
    au: {
      jurisdiction: 'au',
      status: auStatus,
      statusLabelKey: auStatusLabel,
      statutoryReference: 'Industrial Chemicals Act 2019 (AICIS)',
      legalContextKey: auLegalContext,
      practicalActionKey: auAction,
    },
    asean: {
      jurisdiction: 'asean',
      status: aseanStatus,
      statusLabelKey: aseanStatusLabel,
      statutoryReference: 'ASEAN Cosmetic Directive / National Health Acts',
      legalContextKey: aseanLegalContext,
      practicalActionKey: aseanAction,
    },
  };
}
