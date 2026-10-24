import { t, registerDataRefresher, SupportedLocale, getLocale } from '../lib/i18n';
// Official REACH Annex XVII Entry 75, Appendix 13 Impurity & Heavy Metal Concentration Limits
// Regulation (EU) 2020/2081, Table in Appendix 13
export interface HeavyMetalLimit {
  id: string;
  substance: string;
  cas: string;
  ec: string;
  maxLimitPpm: number; // in mg/kg (ppm)
  category: 'heavy_metal' | 'polycyclic_aromatic_hydrocarbon' | 'impurity';
  description: string;
}

export const REACH_APPENDIX_13_LIMITS: HeavyMetalLimit[] = [
  {
    id: 'lead',
    substance: t('data_metals.lead.substance'),
    cas: '7439-92-1',
    ec: '231-100-4',
    maxLimitPpm: 0.7,
    category: 'heavy_metal',
    description: t('data_metals.lead.description')
  },
  {
    id: 'arsenic',
    substance: t('data_metals.arsenic.substance'),
    cas: '7440-38-2',
    ec: '231-148-6',
    maxLimitPpm: 0.5,
    category: 'heavy_metal',
    description: t('data_metals.arsenic.description')
  },
  {
    id: 'cadmium',
    substance: t('data_metals.cadmium.substance'),
    cas: '7440-43-9',
    ec: '231-152-8',
    maxLimitPpm: 0.5,
    category: 'heavy_metal',
    description: t('data_metals.cadmium.description')
  },
  {
    id: 'antimony',
    substance: t('data_metals.antimony.substance'),
    cas: '7440-36-0',
    ec: '231-146-5',
    maxLimitPpm: 0.5,
    category: 'heavy_metal',
    description: t('data_metals.antimony.description')
  },
  {
    id: 'mercury',
    substance: t('data_metals.mercury.substance'),
    cas: '7439-97-6',
    ec: '231-106-7',
    maxLimitPpm: 0.5,
    category: 'heavy_metal',
    description: t('data_metals.mercury.description')
  },
  {
    id: 'nickel',
    substance: t('data_metals.nickel.substance'),
    cas: '7440-02-0',
    ec: '231-111-4',
    maxLimitPpm: 5.0,
    category: 'heavy_metal',
    description: t('data_metals.nickel.description')
  },
  {
    id: 'chromium_vi',
    substance: t('data_metals.chromium_vi.substance'),
    cas: '18540-29-9',
    ec: '—',
    maxLimitPpm: 0.5,
    category: 'heavy_metal',
    description: t('data_metals.chromium_vi.description')
  },
  {
    id: 'barium',
    substance: t('data_metals.barium.substance'),
    cas: '7440-39-3',
    ec: '231-149-1',
    maxLimitPpm: 500.0,
    category: 'heavy_metal',
    description: t('data_metals.barium.description')
  },
  {
    id: 'copper',
    substance: t('data_metals.copper.substance'),
    cas: '7440-50-8',
    ec: '231-159-6',
    maxLimitPpm: 250.0,
    category: 'heavy_metal',
    description: t('data_metals.copper.description')
  },
  {
    id: 'zinc',
    substance: t('data_metals.zinc.substance'),
    cas: '7440-66-6',
    ec: '231-175-3',
    maxLimitPpm: 2000.0,
    category: 'heavy_metal',
    description: t('data_metals.zinc.description')
  },
  {
    id: 'selenium',
    substance: t('data_metals.selenium.substance'),
    cas: '7782-49-2',
    ec: '231-957-4',
    maxLimitPpm: 2.0,
    category: 'heavy_metal',
    description: t('data_metals.selenium.description')
  },
  {
    id: 'tin',
    substance: t('data_metals.tin.substance'),
    cas: '7440-31-5',
    ec: '231-141-8',
    maxLimitPpm: 0.5,
    category: 'heavy_metal',
    description: t('data_metals.tin.description')
  },
  {
    id: 'cobalt',
    substance: t('data_metals.cobalt.substance'),
    cas: '7440-48-4',
    ec: '231-158-0',
    maxLimitPpm: 0.5,
    category: 'heavy_metal',
    description: t('data_metals.cobalt.description')
  },
  {
    id: 'bap',
    substance: t('data_metals.bap.substance'),
    cas: '50-32-8',
    ec: '200-028-5',
    maxLimitPpm: 0.005, // 5 ppb (0.005 mg/kg)
    category: 'polycyclic_aromatic_hydrocarbon',
    description: t('data_metals.bap.description')
  },
  {
    id: 'pahs_total',
    substance: t('data_metals.pahs_total.substance'),
    cas: '—',
    ec: '—',
    maxLimitPpm: 0.5, // 0.5 mg/kg
    category: 'polycyclic_aromatic_hydrocarbon',
    description: t('data_metals.pahs_total.description')
  }
];

/**
 * Refreshes all translated text fields of in-memory heavy metal limit entries
 * when the application locale changes.
 */
export function refreshHeavyMetalsTranslations(locale?: SupportedLocale): void {
  const activeLocale = locale || getLocale();
  REACH_APPENDIX_13_LIMITS.forEach((m) => {
    m.substance = t(`data_metals.${m.id}.substance`, undefined, activeLocale);
    m.description = t(`data_metals.${m.id}.description`, undefined, activeLocale);
  });
}

registerDataRefresher(refreshHeavyMetalsTranslations);

