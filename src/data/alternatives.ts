import { t, registerDataRefresher, SupportedLocale, getLocale } from '../lib/i18n';

// REACH Annex XVII Entry 75 Compliant Colorant & Carrier Alternatives Matrix
// Cross-references prohibited / restricted pigments with legally permitted alternatives under EU 2020/2081

export interface ColorantAlternative {
  id: string;
  problematicPigment: string;
  ciNumber: string;
  casNumber: string;
  restrictionReason: string;
  legalStatus: 'Prohibited (EU 2020/2081)' | 'Restricted (Limits Apply)';
  recommendedAlternatives: {
    name: string;
    ciNumber: string;
    casNumber: string;
    inci: string;
    colorShade: string;
    status: 'Permitted without prohibition' | 'Compliant carrier';
    technicalNotes: string;
  }[];
}

export const ALTERNATIVE_COLORANT_MATRIX: ColorantAlternative[] = [
  {
    id: 'alt_pb15',
    problematicPigment: t('data_alternatives.alt_pb15.problematic_pigment'),
    ciNumber: 'CI 74160',
    casNumber: '147-14-8',
    restrictionReason: t('data_alternatives.alt_pb15.restriction_reason'),
    legalStatus: t('data_alternatives.alt_pb15.legal_status') as 'Prohibited (EU 2020/2081)' | 'Restricted (Limits Apply)',
    recommendedAlternatives: [
      {
        name: t('data_alternatives.alt_pb15.alternatives.alt_0.name'),
        ciNumber: 'CI 69800',
        casNumber: '81-77-6',
        inci: 'CI 69800',
        colorShade: t('data_alternatives.alt_pb15.alternatives.alt_0.color_shade'),
        status: t('data_alternatives.alt_pb15.alternatives.alt_0.status') as 'Permitted without prohibition' | 'Compliant carrier',
        technicalNotes: t('data_alternatives.alt_pb15.alternatives.alt_0.technical_notes')
      },
      {
        name: t('data_alternatives.alt_pb15.alternatives.alt_1.name'),
        ciNumber: 'CI 77007',
        casNumber: '57455-37-5',
        inci: 'CI 77007',
        colorShade: t('data_alternatives.alt_pb15.alternatives.alt_1.color_shade'),
        status: t('data_alternatives.alt_pb15.alternatives.alt_1.status') as 'Permitted without prohibition' | 'Compliant carrier',
        technicalNotes: t('data_alternatives.alt_pb15.alternatives.alt_1.technical_notes')
      },
      {
        name: t('data_alternatives.alt_pb15.alternatives.alt_2.name'),
        ciNumber: 'CI 77346',
        casNumber: '1345-16-0',
        inci: 'CI 77346',
        colorShade: t('data_alternatives.alt_pb15.alternatives.alt_2.color_shade'),
        status: t('data_alternatives.alt_pb15.alternatives.alt_2.status') as 'Permitted without prohibition' | 'Compliant carrier',
        technicalNotes: t('data_alternatives.alt_pb15.alternatives.alt_2.technical_notes')
      }
    ]
  },
  {
    id: 'alt_pg7',
    problematicPigment: t('data_alternatives.alt_pg7.problematic_pigment'),
    ciNumber: 'CI 74260',
    casNumber: '1328-53-6',
    restrictionReason: t('data_alternatives.alt_pg7.restriction_reason'),
    legalStatus: t('data_alternatives.alt_pg7.legal_status') as 'Prohibited (EU 2020/2081)' | 'Restricted (Limits Apply)',
    recommendedAlternatives: [
      {
        name: t('data_alternatives.alt_pg7.alternatives.alt_0.name'),
        ciNumber: 'CI 77288',
        casNumber: '1308-38-9',
        inci: 'Chromium Oxide Greens',
        colorShade: t('data_alternatives.alt_pg7.alternatives.alt_0.color_shade'),
        status: t('data_alternatives.alt_pg7.alternatives.alt_0.status') as 'Permitted without prohibition' | 'Compliant carrier',
        technicalNotes: t('data_alternatives.alt_pg7.alternatives.alt_0.technical_notes')
      },
      {
        name: t('data_alternatives.alt_pg7.alternatives.alt_1.name'),
        ciNumber: 'CI 77289',
        casNumber: '12001-99-9',
        inci: 'Chromium Hydroxide Green',
        colorShade: t('data_alternatives.alt_pg7.alternatives.alt_1.color_shade'),
        status: t('data_alternatives.alt_pg7.alternatives.alt_1.status') as 'Permitted without prohibition' | 'Compliant carrier',
        technicalNotes: t('data_alternatives.alt_pg7.alternatives.alt_1.technical_notes')
      },
      {
        name: t('data_alternatives.alt_pg7.alternatives.alt_2.name'),
        ciNumber: 'CI 77335 / CI 77344',
        casNumber: '8011-87-8',
        inci: 'CI 77335',
        colorShade: t('data_alternatives.alt_pg7.alternatives.alt_2.color_shade'),
        status: t('data_alternatives.alt_pg7.alternatives.alt_2.status') as 'Permitted without prohibition' | 'Compliant carrier',
        technicalNotes: t('data_alternatives.alt_pg7.alternatives.alt_2.technical_notes')
      }
    ]
  },
  {
    id: 'alt_pr22',
    problematicPigment: t('data_alternatives.alt_pr22.problematic_pigment'),
    ciNumber: 'CI 12315',
    casNumber: '6448-95-9',
    restrictionReason: t('data_alternatives.alt_pr22.restriction_reason'),
    legalStatus: t('data_alternatives.alt_pr22.legal_status') as 'Prohibited (EU 2020/2081)' | 'Restricted (Limits Apply)',
    recommendedAlternatives: [
      {
        name: t('data_alternatives.alt_pr22.alternatives.alt_0.name'),
        ciNumber: 'CI 77491',
        casNumber: '1309-37-1',
        inci: 'Iron Oxides',
        colorShade: t('data_alternatives.alt_pr22.alternatives.alt_0.color_shade'),
        status: t('data_alternatives.alt_pr22.alternatives.alt_0.status') as 'Permitted without prohibition' | 'Compliant carrier',
        technicalNotes: t('data_alternatives.alt_pr22.alternatives.alt_0.technical_notes')
      },
      {
        name: t('data_alternatives.alt_pr22.alternatives.alt_1.name'),
        ciNumber: 'CI 56110',
        casNumber: '84632-65-5',
        inci: 'CI 56110',
        colorShade: t('data_alternatives.alt_pr22.alternatives.alt_1.color_shade'),
        status: t('data_alternatives.alt_pr22.alternatives.alt_1.status') as 'Permitted without prohibition' | 'Compliant carrier',
        technicalNotes: t('data_alternatives.alt_pr22.alternatives.alt_1.technical_notes')
      },
      {
        name: t('data_alternatives.alt_pr22.alternatives.alt_2.name'),
        ciNumber: 'CI 73915',
        casNumber: '980-26-7',
        inci: 'CI 73915',
        colorShade: t('data_alternatives.alt_pr22.alternatives.alt_2.color_shade'),
        status: t('data_alternatives.alt_pr22.alternatives.alt_2.status') as 'Permitted without prohibition' | 'Compliant carrier',
        technicalNotes: t('data_alternatives.alt_pr22.alternatives.alt_2.technical_notes')
      }
    ]
  },
  {
    id: 'alt_py14',
    problematicPigment: t('data_alternatives.alt_py14.problematic_pigment'),
    ciNumber: 'CI 21095',
    casNumber: '5468-75-7',
    restrictionReason: t('data_alternatives.alt_py14.restriction_reason'),
    legalStatus: t('data_alternatives.alt_py14.legal_status') as 'Prohibited (EU 2020/2081)' | 'Restricted (Limits Apply)',
    recommendedAlternatives: [
      {
        name: t('data_alternatives.alt_py14.alternatives.alt_0.name'),
        ciNumber: 'CI 77492',
        casNumber: '51274-00-1',
        inci: 'Iron Oxides',
        colorShade: t('data_alternatives.alt_py14.alternatives.alt_0.color_shade'),
        status: t('data_alternatives.alt_py14.alternatives.alt_0.status') as 'Permitted without prohibition' | 'Compliant carrier',
        technicalNotes: t('data_alternatives.alt_py14.alternatives.alt_0.technical_notes')
      },
      {
        name: t('data_alternatives.alt_py14.alternatives.alt_1.name'),
        ciNumber: 'CI 12764',
        casNumber: '68511-62-6',
        inci: 'CI 12764',
        colorShade: t('data_alternatives.alt_py14.alternatives.alt_1.color_shade'),
        status: t('data_alternatives.alt_py14.alternatives.alt_1.status') as 'Permitted without prohibition' | 'Compliant carrier',
        technicalNotes: t('data_alternatives.alt_py14.alternatives.alt_1.technical_notes')
      }
    ]
  },
];

/**
 * Refreshes all translated text fields of in-memory colorant alternatives
 * when the application locale changes.
 */
export function refreshAlternativesTranslations(locale?: SupportedLocale): void {
  const activeLocale = locale || getLocale();
  ALTERNATIVE_COLORANT_MATRIX.forEach((alt) => {
    alt.problematicPigment = t(`data_alternatives.${alt.id}.problematic_pigment`, undefined, activeLocale);
    alt.restrictionReason = t(`data_alternatives.${alt.id}.restriction_reason`, undefined, activeLocale);
    alt.legalStatus = t(`data_alternatives.${alt.id}.legal_status`, undefined, activeLocale) as any;
    alt.recommendedAlternatives.forEach((item, idx) => {
      item.name = t(`data_alternatives.${alt.id}.alternatives.alt_${idx}.name`, undefined, activeLocale);
      item.colorShade = t(`data_alternatives.${alt.id}.alternatives.alt_${idx}.color_shade`, undefined, activeLocale);
      item.status = t(`data_alternatives.${alt.id}.alternatives.alt_${idx}.status`, undefined, activeLocale) as any;
      item.technicalNotes = t(`data_alternatives.${alt.id}.alternatives.alt_${idx}.technical_notes`, undefined, activeLocale);
    });
  });
}

registerDataRefresher(refreshAlternativesTranslations);

