import { PigmentRecord, ParsedHit, DecodeStats } from '../types/pigment';
import { extractConcentrationFromSnippet, evaluateREACHConcentration } from '../lib/concentrationEvaluator';
import { t, tArray, registerDataRefresher, SupportedLocale, getLocale } from '../lib/i18n';

export const REGULATION_DATE = '2022-01-04';
export const REGULATION_REF = 'EU 2020/2081 (Annex XVII, Entry 75) + EU 2023/1545';

export const PIGMENTS: PigmentRecord[] = [
  {
    id: 'pigment_blue_15',
    name: t('data_pigments.pigment_blue_15.name'),
    ci: 'CI 74160',
    cas: ["147-14-8"],
    inci: 'CI 74160',
    color_group: 'blue',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_blue_15.exact_limit'),
    entry_reference: t('data_pigments.pigment_blue_15.entry_reference'),
    notes: t('data_pigments.pigment_blue_15.notes'),
    also_known_as: tArray('data_pigments.pigment_blue_15.also_known_as'),
    found_in: tArray('data_pigments.pigment_blue_15.found_in'),
    echa_cas: '147-14-8',
    echa_ref: 'ECHA Dossier CAS 147-14-8',
  },
  {
    id: 'pigment_blue_15_3',
    name: t('data_pigments.pigment_blue_15_3.name'),
    ci: 'CI 74160',
    cas: ["147-14-8"],
    inci: 'CI 74160',
    color_group: 'blue',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_blue_15_3.exact_limit'),
    entry_reference: t('data_pigments.pigment_blue_15_3.entry_reference'),
    notes: t('data_pigments.pigment_blue_15_3.notes'),
    also_known_as: tArray('data_pigments.pigment_blue_15_3.also_known_as'),
    found_in: tArray('data_pigments.pigment_blue_15_3.found_in'),
    echa_cas: '147-14-8',
    echa_ref: 'ECHA Dossier CAS 147-14-8',
  },
  {
    id: 'pigment_green_7',
    name: t('data_pigments.pigment_green_7.name'),
    ci: 'CI 74260',
    cas: ["1328-53-6"],
    inci: 'CI 74260',
    color_group: 'green',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_green_7.exact_limit'),
    entry_reference: t('data_pigments.pigment_green_7.entry_reference'),
    notes: t('data_pigments.pigment_green_7.notes'),
    also_known_as: tArray('data_pigments.pigment_green_7.also_known_as'),
    found_in: tArray('data_pigments.pigment_green_7.found_in'),
    echa_cas: '1328-53-6',
    echa_ref: 'ECHA Dossier CAS 1328-53-6',
  },
  {
    id: 'pigment_green_36',
    name: t('data_pigments.pigment_green_36.name'),
    ci: 'CI 74265',
    cas: ["14302-13-7"],
    inci: 'CI 74265',
    color_group: 'green',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_green_36.exact_limit'),
    entry_reference: t('data_pigments.pigment_green_36.entry_reference'),
    notes: t('data_pigments.pigment_green_36.notes'),
    also_known_as: tArray('data_pigments.pigment_green_36.also_known_as'),
    found_in: tArray('data_pigments.pigment_green_36.found_in'),
    echa_cas: '14302-13-7',
    echa_ref: 'ECHA Dossier CAS 14302-13-7',
  },
  {
    id: 'pigment_violet_23',
    name: t('data_pigments.pigment_violet_23.name'),
    ci: 'CI 51319',
    cas: ["6358-30-1"],
    inci: 'CI 51319',
    color_group: 'violet',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2023/1545',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_violet_23.exact_limit'),
    entry_reference: t('data_pigments.pigment_violet_23.entry_reference'),
    notes: t('data_pigments.pigment_violet_23.notes'),
    also_known_as: tArray('data_pigments.pigment_violet_23.also_known_as'),
    found_in: tArray('data_pigments.pigment_violet_23.found_in'),
    echa_cas: '6358-30-1',
    echa_ref: 'ECHA Dossier CAS 6358-30-1',
  },
  {
    id: 'pigment_red_22',
    name: t('data_pigments.pigment_red_22.name'),
    ci: 'CI 11120',
    cas: ["6410-41-9"],
    inci: 'CI 11120',
    color_group: 'red',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_red_22.exact_limit'),
    entry_reference: t('data_pigments.pigment_red_22.entry_reference'),
    notes: t('data_pigments.pigment_red_22.notes'),
    also_known_as: tArray('data_pigments.pigment_red_22.also_known_as'),
    found_in: tArray('data_pigments.pigment_red_22.found_in'),
    echa_cas: '6410-41-9',
    echa_ref: 'ECHA Dossier CAS 6410-41-9',
  },
  {
    id: 'pigment_red_17',
    name: t('data_pigments.pigment_red_17.name'),
    ci: 'CI 12390',
    cas: ["16521-38-3"],
    inci: 'CI 12390',
    color_group: 'red',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_red_17.exact_limit'),
    entry_reference: t('data_pigments.pigment_red_17.entry_reference'),
    notes: t('data_pigments.pigment_red_17.notes'),
    also_known_as: tArray('data_pigments.pigment_red_17.also_known_as'),
    found_in: tArray('data_pigments.pigment_red_17.found_in'),
    echa_cas: '16521-38-3',
    echa_ref: 'ECHA Dossier CAS 16521-38-3',
  },
  {
    id: 'pigment_red_149',
    name: t('data_pigments.pigment_red_149.name'),
    ci: 'CI 71137',
    cas: ["4948-15-6"],
    inci: 'CI 71137',
    color_group: 'red',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_red_149.exact_limit'),
    entry_reference: t('data_pigments.pigment_red_149.entry_reference'),
    notes: t('data_pigments.pigment_red_149.notes'),
    also_known_as: tArray('data_pigments.pigment_red_149.also_known_as'),
    found_in: tArray('data_pigments.pigment_red_149.found_in'),
    echa_cas: '4948-15-6',
    echa_ref: 'ECHA Dossier CAS 4948-15-6',
  },
  {
    id: 'pigment_orange_13',
    name: t('data_pigments.pigment_orange_13.name'),
    ci: 'CI 21110',
    cas: ["3520-72-7"],
    inci: 'CI 21110',
    color_group: 'orange',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_orange_13.exact_limit'),
    entry_reference: t('data_pigments.pigment_orange_13.entry_reference'),
    notes: t('data_pigments.pigment_orange_13.notes'),
    also_known_as: tArray('data_pigments.pigment_orange_13.also_known_as'),
    found_in: tArray('data_pigments.pigment_orange_13.found_in'),
    echa_cas: '3520-72-7',
    echa_ref: 'ECHA Dossier CAS 3520-72-7',
  },
  {
    id: 'pigment_orange_16',
    name: t('data_pigments.pigment_orange_16.name'),
    ci: 'CI 21160',
    cas: ["6505-28-8"],
    inci: 'CI 21160',
    color_group: 'orange',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_orange_16.exact_limit'),
    entry_reference: t('data_pigments.pigment_orange_16.entry_reference'),
    notes: t('data_pigments.pigment_orange_16.notes'),
    also_known_as: tArray('data_pigments.pigment_orange_16.also_known_as'),
    found_in: tArray('data_pigments.pigment_orange_16.found_in'),
    echa_cas: '6505-28-8',
    echa_ref: 'ECHA Dossier CAS 6505-28-8',
  },
  {
    id: 'pigment_yellow_1',
    name: t('data_pigments.pigment_yellow_1.name'),
    ci: 'CI 11680',
    cas: ["2512-29-0"],
    inci: 'CI 11680',
    color_group: 'yellow',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_yellow_1.exact_limit'),
    entry_reference: t('data_pigments.pigment_yellow_1.entry_reference'),
    notes: t('data_pigments.pigment_yellow_1.notes'),
    also_known_as: tArray('data_pigments.pigment_yellow_1.also_known_as'),
    found_in: tArray('data_pigments.pigment_yellow_1.found_in'),
    echa_cas: '2512-29-0',
    echa_ref: 'ECHA Dossier CAS 2512-29-0',
  },
  {
    id: 'pigment_yellow_3',
    name: t('data_pigments.pigment_yellow_3.name'),
    ci: 'CI 11710',
    cas: ["6486-23-3"],
    inci: 'CI 11710',
    color_group: 'yellow',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_yellow_3.exact_limit'),
    entry_reference: t('data_pigments.pigment_yellow_3.entry_reference'),
    notes: t('data_pigments.pigment_yellow_3.notes'),
    also_known_as: tArray('data_pigments.pigment_yellow_3.also_known_as'),
    found_in: tArray('data_pigments.pigment_yellow_3.found_in'),
    echa_cas: '6486-23-3',
    echa_ref: 'ECHA Dossier CAS 6486-23-3',
  },
  {
    id: 'carbon_black',
    name: t('data_pigments.carbon_black.name'),
    ci: 'CI 77266',
    cas: ["1333-86-4"],
    inci: 'CI 77266',
    color_group: 'black',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.carbon_black.exact_limit'),
    entry_reference: t('data_pigments.carbon_black.entry_reference'),
    notes: t('data_pigments.carbon_black.notes'),
    also_known_as: tArray('data_pigments.carbon_black.also_known_as'),
    found_in: tArray('data_pigments.carbon_black.found_in'),
    echa_cas: '1333-86-4',
    echa_ref: 'ECHA Dossier CAS 1333-86-4',
  },
  {
    id: 'titanium_dioxide',
    name: t('data_pigments.titanium_dioxide.name'),
    ci: 'CI 77891',
    cas: ["13463-67-7"],
    inci: 'CI 77891',
    color_group: 'white',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.titanium_dioxide.exact_limit'),
    entry_reference: t('data_pigments.titanium_dioxide.entry_reference'),
    notes: t('data_pigments.titanium_dioxide.notes'),
    also_known_as: tArray('data_pigments.titanium_dioxide.also_known_as'),
    found_in: tArray('data_pigments.titanium_dioxide.found_in'),
    echa_cas: '13463-67-7',
    echa_ref: 'ECHA Dossier CAS 13463-67-7',
  },
  {
    id: 'bkc',
    name: t('data_pigments.bkc.name'),
    ci: null,
    cas: ["8001-54-5","63449-41-2"],
    inci: 'Benzalkonium Chloride',
    color_group: 'additive',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.bkc.exact_limit'),
    entry_reference: t('data_pigments.bkc.entry_reference'),
    notes: t('data_pigments.bkc.notes'),
    also_known_as: tArray('data_pigments.bkc.also_known_as'),
    found_in: tArray('data_pigments.bkc.found_in'),
    echa_cas: '8001-54-5',
    echa_ref: 'ECHA Dossier CAS 8001-54-5',
  },
  {
    id: 'propylene_glycol',
    name: t('data_pigments.propylene_glycol.name'),
    ci: null,
    cas: ["57-55-6"],
    inci: 'Propylene Glycol',
    color_group: 'additive',
    status: 'safe',
    status_label: t('status.not_covered'),
    regulation: null,
    limit_ppm: null,
    exact_limit: t('data_pigments.propylene_glycol.exact_limit'),
    entry_reference: t('data_pigments.propylene_glycol.entry_reference'),
    notes: t('data_pigments.propylene_glycol.notes'),
    also_known_as: tArray('data_pigments.propylene_glycol.also_known_as'),
    found_in: tArray('data_pigments.propylene_glycol.found_in'),
    echa_cas: '57-55-6',
    echa_ref: 'ECHA Dossier CAS 57-55-6',
  },
  {
    id: 'isopropyl_alcohol',
    name: t('data_pigments.isopropyl_alcohol.name'),
    ci: null,
    cas: ["67-63-0"],
    inci: 'Alcohol',
    color_group: 'additive',
    status: 'safe',
    status_label: t('status.not_covered'),
    regulation: null,
    limit_ppm: null,
    exact_limit: t('data_pigments.isopropyl_alcohol.exact_limit'),
    entry_reference: t('data_pigments.isopropyl_alcohol.entry_reference'),
    notes: t('data_pigments.isopropyl_alcohol.notes'),
    also_known_as: tArray('data_pigments.isopropyl_alcohol.also_known_as'),
    found_in: tArray('data_pigments.isopropyl_alcohol.found_in'),
    echa_cas: '67-63-0',
    echa_ref: 'ECHA Dossier CAS 67-63-0',
  },
  {
    id: 'glycerin',
    name: t('data_pigments.glycerin.name'),
    ci: null,
    cas: ["56-81-5"],
    inci: 'Glycerin',
    color_group: 'additive',
    status: 'safe',
    status_label: t('status.not_covered'),
    regulation: null,
    limit_ppm: null,
    exact_limit: t('data_pigments.glycerin.exact_limit'),
    entry_reference: t('data_pigments.glycerin.entry_reference'),
    notes: t('data_pigments.glycerin.notes'),
    also_known_as: tArray('data_pigments.glycerin.also_known_as'),
    found_in: tArray('data_pigments.glycerin.found_in'),
    echa_cas: '56-81-5',
    echa_ref: 'ECHA Dossier CAS 56-81-5',
  },
  {
    id: 'hamamelis',
    name: t('data_pigments.hamamelis.name'),
    ci: null,
    cas: ["84696-19-5"],
    inci: 'Hamamelis Virginiana Water',
    color_group: 'additive',
    status: 'safe',
    status_label: t('status.not_covered'),
    regulation: null,
    limit_ppm: null,
    exact_limit: t('data_pigments.hamamelis.exact_limit'),
    entry_reference: t('data_pigments.hamamelis.entry_reference'),
    notes: t('data_pigments.hamamelis.notes'),
    also_known_as: tArray('data_pigments.hamamelis.also_known_as'),
    found_in: tArray('data_pigments.hamamelis.found_in'),
    echa_cas: '84696-19-5',
    echa_ref: 'ECHA Dossier CAS 84696-19-5',
  },
  {
    id: 'water_aqua',
    name: t('data_pigments.water_aqua.name'),
    ci: null,
    cas: ["7732-18-5"],
    inci: 'Aqua',
    color_group: 'additive',
    status: 'safe',
    status_label: t('status.not_covered'),
    regulation: null,
    limit_ppm: null,
    exact_limit: t('data_pigments.water_aqua.exact_limit'),
    entry_reference: t('data_pigments.water_aqua.entry_reference'),
    notes: t('data_pigments.water_aqua.notes'),
    also_known_as: tArray('data_pigments.water_aqua.also_known_as'),
    found_in: tArray('data_pigments.water_aqua.found_in'),
    echa_cas: '7732-18-5',
    echa_ref: 'ECHA Dossier CAS 7732-18-5',
  },
  {
    id: 'formaldehyde',
    name: t('data_pigments.formaldehyde.name'),
    ci: null,
    cas: ["50-00-0"],
    inci: 'Formaldehyde',
    color_group: 'additive',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.formaldehyde.exact_limit'),
    entry_reference: t('data_pigments.formaldehyde.entry_reference'),
    notes: t('data_pigments.formaldehyde.notes'),
    also_known_as: tArray('data_pigments.formaldehyde.also_known_as'),
    found_in: tArray('data_pigments.formaldehyde.found_in'),
    echa_cas: '50-00-0',
    echa_ref: 'ECHA Dossier CAS 50-00-0',
  },
  {
    id: 'arsenic',
    name: t('data_pigments.arsenic.name'),
    ci: null,
    cas: ["7440-38-2"],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: 0.5,
    exact_limit: t('data_pigments.arsenic.exact_limit'),
    entry_reference: t('data_pigments.arsenic.entry_reference'),
    notes: t('data_pigments.arsenic.notes'),
    also_known_as: tArray('data_pigments.arsenic.also_known_as'),
    found_in: tArray('data_pigments.arsenic.found_in'),
    echa_cas: '7440-38-2',
    echa_ref: 'ECHA Dossier CAS 7440-38-2',
  },
  {
    id: 'barium',
    name: t('data_pigments.barium.name'),
    ci: null,
    cas: ["7440-39-3"],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: 500,
    exact_limit: t('data_pigments.barium.exact_limit'),
    entry_reference: t('data_pigments.barium.entry_reference'),
    notes: t('data_pigments.barium.notes'),
    also_known_as: tArray('data_pigments.barium.also_known_as'),
    found_in: tArray('data_pigments.barium.found_in'),
    echa_cas: '7440-39-3',
    echa_ref: 'ECHA Dossier CAS 7440-39-3',
  },
  {
    id: 'cadmium_ink',
    name: t('data_pigments.cadmium_ink.name'),
    ci: null,
    cas: ["7440-43-9"],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: 0.5,
    exact_limit: t('data_pigments.cadmium_ink.exact_limit'),
    entry_reference: t('data_pigments.cadmium_ink.entry_reference'),
    notes: t('data_pigments.cadmium_ink.notes'),
    also_known_as: tArray('data_pigments.cadmium_ink.also_known_as'),
    found_in: tArray('data_pigments.cadmium_ink.found_in'),
    echa_cas: '7440-43-9',
    echa_ref: 'ECHA Dossier CAS 7440-43-9',
  },
  {
    id: 'chromium_vi',
    name: t('data_pigments.chromium_vi.name'),
    ci: null,
    cas: ["18540-29-9"],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: 0.5,
    exact_limit: t('data_pigments.chromium_vi.exact_limit'),
    entry_reference: t('data_pigments.chromium_vi.entry_reference'),
    notes: t('data_pigments.chromium_vi.notes'),
    also_known_as: tArray('data_pigments.chromium_vi.also_known_as'),
    found_in: tArray('data_pigments.chromium_vi.found_in'),
    echa_cas: '18540-29-9',
    echa_ref: 'ECHA Dossier CAS 18540-29-9',
  },
  {
    id: 'cobalt_ink',
    name: t('data_pigments.cobalt_ink.name'),
    ci: null,
    cas: ["7440-48-4"],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: 0.5,
    exact_limit: t('data_pigments.cobalt_ink.exact_limit'),
    entry_reference: t('data_pigments.cobalt_ink.entry_reference'),
    notes: t('data_pigments.cobalt_ink.notes'),
    also_known_as: tArray('data_pigments.cobalt_ink.also_known_as'),
    found_in: tArray('data_pigments.cobalt_ink.found_in'),
    echa_cas: '7440-48-4',
    echa_ref: 'ECHA Dossier CAS 7440-48-4',
  },
  {
    id: 'copper_ink',
    name: t('data_pigments.copper_ink.name'),
    ci: null,
    cas: ["7440-50-8"],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: 250,
    exact_limit: t('data_pigments.copper_ink.exact_limit'),
    entry_reference: t('data_pigments.copper_ink.entry_reference'),
    notes: t('data_pigments.copper_ink.notes'),
    also_known_as: tArray('data_pigments.copper_ink.also_known_as'),
    found_in: tArray('data_pigments.copper_ink.found_in'),
    echa_cas: '7440-50-8',
    echa_ref: 'ECHA Dossier CAS 7440-50-8',
  },
  {
    id: 'lead_ink',
    name: t('data_pigments.lead_ink.name'),
    ci: null,
    cas: ["7439-92-1"],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: 0.7,
    exact_limit: t('data_pigments.lead_ink.exact_limit'),
    entry_reference: t('data_pigments.lead_ink.entry_reference'),
    notes: t('data_pigments.lead_ink.notes'),
    also_known_as: tArray('data_pigments.lead_ink.also_known_as'),
    found_in: tArray('data_pigments.lead_ink.found_in'),
    echa_cas: '7439-92-1',
    echa_ref: 'ECHA Dossier CAS 7439-92-1',
  },
  {
    id: 'mercury_ink',
    name: t('data_pigments.mercury_ink.name'),
    ci: null,
    cas: ["7439-97-6"],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: 0.5,
    exact_limit: t('data_pigments.mercury_ink.exact_limit'),
    entry_reference: t('data_pigments.mercury_ink.entry_reference'),
    notes: t('data_pigments.mercury_ink.notes'),
    also_known_as: tArray('data_pigments.mercury_ink.also_known_as'),
    found_in: tArray('data_pigments.mercury_ink.found_in'),
    echa_cas: '7439-97-6',
    echa_ref: 'ECHA Dossier CAS 7439-97-6',
  },
  {
    id: 'nickel_ink',
    name: t('data_pigments.nickel_ink.name'),
    ci: null,
    cas: ["7440-02-0"],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: 5,
    exact_limit: t('data_pigments.nickel_ink.exact_limit'),
    entry_reference: t('data_pigments.nickel_ink.entry_reference'),
    notes: t('data_pigments.nickel_ink.notes'),
    also_known_as: tArray('data_pigments.nickel_ink.also_known_as'),
    found_in: tArray('data_pigments.nickel_ink.found_in'),
    echa_cas: '7440-02-0',
    echa_ref: 'ECHA Dossier CAS 7440-02-0',
  },
  {
    id: 'selenium_ink',
    name: t('data_pigments.selenium_ink.name'),
    ci: null,
    cas: ["7782-49-2"],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: 2,
    exact_limit: t('data_pigments.selenium_ink.exact_limit'),
    entry_reference: t('data_pigments.selenium_ink.entry_reference'),
    notes: t('data_pigments.selenium_ink.notes'),
    also_known_as: tArray('data_pigments.selenium_ink.also_known_as'),
    found_in: tArray('data_pigments.selenium_ink.found_in'),
    echa_cas: '7782-49-2',
    echa_ref: 'ECHA Dossier CAS 7782-49-2',
  },
  {
    id: 'aniline',
    name: t('data_pigments.aniline.name'),
    ci: null,
    cas: ["62-53-3"],
    inci: 'Aniline',
    color_group: 'amine',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.aniline.exact_limit'),
    entry_reference: t('data_pigments.aniline.entry_reference'),
    notes: t('data_pigments.aniline.notes'),
    also_known_as: tArray('data_pigments.aniline.also_known_as'),
    found_in: tArray('data_pigments.aniline.found_in'),
    echa_cas: '62-53-3',
    echa_ref: 'ECHA Dossier CAS 62-53-3',
  },
  {
    id: 'o_toluidine',
    name: t('data_pigments.o_toluidine.name'),
    ci: null,
    cas: ["95-53-4"],
    inci: null,
    color_group: 'amine',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.o_toluidine.exact_limit'),
    entry_reference: t('data_pigments.o_toluidine.entry_reference'),
    notes: t('data_pigments.o_toluidine.notes'),
    also_known_as: tArray('data_pigments.o_toluidine.also_known_as'),
    found_in: tArray('data_pigments.o_toluidine.found_in'),
    echa_cas: '95-53-4',
    echa_ref: 'ECHA Dossier CAS 95-53-4',
  },
  {
    id: 'pigment_red_48_2',
    name: t('data_pigments.pigment_red_48_2.name'),
    ci: 'CI 15865',
    cas: ["7023-61-2"],
    inci: 'CI 15865',
    color_group: 'red',
    status: 'watch',
    status_label: t('status.under_review'),
    regulation: null,
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_red_48_2.exact_limit'),
    entry_reference: t('data_pigments.pigment_red_48_2.entry_reference'),
    notes: t('data_pigments.pigment_red_48_2.notes'),
    also_known_as: tArray('data_pigments.pigment_red_48_2.also_known_as'),
    found_in: tArray('data_pigments.pigment_red_48_2.found_in'),
    echa_cas: '7023-61-2',
    echa_ref: 'ECHA Dossier CAS 7023-61-2',
  },
  {
    id: 'pigment_red_53_1',
    name: t('data_pigments.pigment_red_53_1.name'),
    ci: 'CI 15585',
    cas: ["5160-02-1"],
    inci: 'CI 15585',
    color_group: 'red',
    status: 'watch',
    status_label: t('status.under_review'),
    regulation: null,
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_red_53_1.exact_limit'),
    entry_reference: t('data_pigments.pigment_red_53_1.entry_reference'),
    notes: t('data_pigments.pigment_red_53_1.notes'),
    also_known_as: tArray('data_pigments.pigment_red_53_1.also_known_as'),
    found_in: tArray('data_pigments.pigment_red_53_1.found_in'),
    echa_cas: '5160-02-1',
    echa_ref: 'ECHA Dossier CAS 5160-02-1',
  },
  {
    id: 'pigment_yellow_74',
    name: t('data_pigments.pigment_yellow_74.name'),
    ci: 'CI 11741',
    cas: ["6358-31-2"],
    inci: 'CI 11741',
    color_group: 'yellow',
    status: 'watch',
    status_label: t('status.under_review'),
    regulation: null,
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_yellow_74.exact_limit'),
    entry_reference: t('data_pigments.pigment_yellow_74.entry_reference'),
    notes: t('data_pigments.pigment_yellow_74.notes'),
    also_known_as: tArray('data_pigments.pigment_yellow_74.also_known_as'),
    found_in: tArray('data_pigments.pigment_yellow_74.found_in'),
    echa_cas: '6358-31-2',
    echa_ref: 'ECHA Dossier CAS 6358-31-2',
  },
  {
    id: 'pigment_red_170',
    name: t('data_pigments.pigment_red_170.name'),
    ci: 'CI 12475',
    cas: ["2786-76-7"],
    inci: 'CI 12475',
    color_group: 'red',
    status: 'safe',
    status_label: t('status.not_covered'),
    regulation: null,
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_red_170.exact_limit'),
    entry_reference: t('data_pigments.pigment_red_170.entry_reference'),
    notes: t('data_pigments.pigment_red_170.notes'),
    also_known_as: tArray('data_pigments.pigment_red_170.also_known_as'),
    found_in: tArray('data_pigments.pigment_red_170.found_in'),
    echa_cas: '2786-76-7',
    echa_ref: 'ECHA Dossier CAS 2786-76-7',
  },
  {
    id: 'pigment_red_254',
    name: t('data_pigments.pigment_red_254.name'),
    ci: 'CI 56110',
    cas: ["84632-65-5"],
    inci: 'CI 56110',
    color_group: 'red',
    status: 'safe',
    status_label: t('status.not_covered'),
    regulation: null,
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_red_254.exact_limit'),
    entry_reference: t('data_pigments.pigment_red_254.entry_reference'),
    notes: t('data_pigments.pigment_red_254.notes'),
    also_known_as: tArray('data_pigments.pigment_red_254.also_known_as'),
    found_in: tArray('data_pigments.pigment_red_254.found_in'),
    echa_cas: '84632-65-5',
    echa_ref: 'ECHA Dossier CAS 84632-65-5',
  },
  {
    id: 'pigment_red_101',
    name: t('data_pigments.pigment_red_101.name'),
    ci: 'CI 77491',
    cas: ["1309-37-1"],
    inci: 'CI 77491',
    color_group: 'red',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_red_101.exact_limit'),
    entry_reference: t('data_pigments.pigment_red_101.entry_reference'),
    notes: t('data_pigments.pigment_red_101.notes'),
    also_known_as: tArray('data_pigments.pigment_red_101.also_known_as'),
    found_in: tArray('data_pigments.pigment_red_101.found_in'),
    echa_cas: '1309-37-1',
    echa_ref: 'ECHA Dossier CAS 1309-37-1',
  },
  {
    id: 'pigment_yellow_14',
    name: t('data_pigments.pigment_yellow_14.name'),
    ci: 'CI 21095',
    cas: ["5468-75-7"],
    inci: 'CI 21095',
    color_group: 'yellow',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_yellow_14.exact_limit'),
    entry_reference: t('data_pigments.pigment_yellow_14.entry_reference'),
    notes: t('data_pigments.pigment_yellow_14.notes'),
    also_known_as: tArray('data_pigments.pigment_yellow_14.also_known_as'),
    found_in: tArray('data_pigments.pigment_yellow_14.found_in'),
    echa_cas: '5468-75-7',
    echa_ref: 'ECHA Dossier CAS 5468-75-7',
  },
  {
    id: 'pigment_yellow_83',
    name: t('data_pigments.pigment_yellow_83.name'),
    ci: 'CI 21108',
    cas: ["5567-15-7"],
    inci: 'CI 21108',
    color_group: 'yellow',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_yellow_83.exact_limit'),
    entry_reference: t('data_pigments.pigment_yellow_83.entry_reference'),
    notes: t('data_pigments.pigment_yellow_83.notes'),
    also_known_as: tArray('data_pigments.pigment_yellow_83.also_known_as'),
    found_in: tArray('data_pigments.pigment_yellow_83.found_in'),
    echa_cas: '5567-15-7',
    echa_ref: 'ECHA Dossier CAS 5567-15-7',
  },
  {
    id: 'pigment_yellow_138',
    name: t('data_pigments.pigment_yellow_138.name'),
    ci: 'CI 56300',
    cas: ["30125-47-4"],
    inci: 'CI 56300',
    color_group: 'yellow',
    status: 'safe',
    status_label: t('status.not_covered'),
    regulation: null,
    limit_ppm: null,
    exact_limit: t('data_pigments.pigment_yellow_138.exact_limit'),
    entry_reference: t('data_pigments.pigment_yellow_138.entry_reference'),
    notes: t('data_pigments.pigment_yellow_138.notes'),
    also_known_as: tArray('data_pigments.pigment_yellow_138.also_known_as'),
    found_in: tArray('data_pigments.pigment_yellow_138.found_in'),
    echa_cas: '30125-47-4',
    echa_ref: 'ECHA Dossier CAS 30125-47-4',
  },
  {
    id: 'ethanol',
    name: t('data_pigments.ethanol.name'),
    ci: null,
    cas: ["64-17-5"],
    inci: 'Alcohol Denat',
    color_group: 'additive',
    status: 'safe',
    status_label: t('status.not_covered'),
    regulation: null,
    limit_ppm: null,
    exact_limit: t('data_pigments.ethanol.exact_limit'),
    entry_reference: t('data_pigments.ethanol.entry_reference'),
    notes: t('data_pigments.ethanol.notes'),
    also_known_as: tArray('data_pigments.ethanol.also_known_as'),
    found_in: tArray('data_pigments.ethanol.found_in'),
    echa_cas: '64-17-5',
    echa_ref: 'ECHA Dossier CAS 64-17-5',
  },
  {
    id: 'benzyl_alcohol',
    name: t('data_pigments.benzyl_alcohol.name'),
    ci: null,
    cas: ["100-51-6"],
    inci: 'Benzyl Alcohol',
    color_group: 'additive',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.benzyl_alcohol.exact_limit'),
    entry_reference: t('data_pigments.benzyl_alcohol.entry_reference'),
    notes: t('data_pigments.benzyl_alcohol.notes'),
    also_known_as: tArray('data_pigments.benzyl_alcohol.also_known_as'),
    found_in: tArray('data_pigments.benzyl_alcohol.found_in'),
    echa_cas: '100-51-6',
    echa_ref: 'ECHA Dossier CAS 100-51-6',
  },
  {
    id: 'phenoxyethanol',
    name: t('data_pigments.phenoxyethanol.name'),
    ci: null,
    cas: ["122-99-6"],
    inci: 'Phenoxyethanol',
    color_group: 'additive',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.phenoxyethanol.exact_limit'),
    entry_reference: t('data_pigments.phenoxyethanol.entry_reference'),
    notes: t('data_pigments.phenoxyethanol.notes'),
    also_known_as: tArray('data_pigments.phenoxyethanol.also_known_as'),
    found_in: tArray('data_pigments.phenoxyethanol.found_in'),
    echa_cas: '122-99-6',
    echa_ref: 'ECHA Dossier CAS 122-99-6',
  },
  {
    id: 'polyethylene_glycol',
    name: t('data_pigments.polyethylene_glycol.name'),
    ci: null,
    cas: ["25322-68-3"],
    inci: 'PEG-8',
    color_group: 'additive',
    status: 'safe',
    status_label: t('status.not_covered'),
    regulation: null,
    limit_ppm: null,
    exact_limit: t('data_pigments.polyethylene_glycol.exact_limit'),
    entry_reference: t('data_pigments.polyethylene_glycol.entry_reference'),
    notes: t('data_pigments.polyethylene_glycol.notes'),
    also_known_as: tArray('data_pigments.polyethylene_glycol.also_known_as'),
    found_in: tArray('data_pigments.polyethylene_glycol.found_in'),
    echa_cas: '25322-68-3',
    echa_ref: 'ECHA Dossier CAS 25322-68-3',
  },
  {
    id: 'benzoic_acid',
    name: t('data_pigments.benzoic_acid.name'),
    ci: null,
    cas: ["65-85-0","532-32-1"],
    inci: 'Benzoic Acid',
    color_group: 'additive',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.benzoic_acid.exact_limit'),
    entry_reference: t('data_pigments.benzoic_acid.entry_reference'),
    notes: t('data_pigments.benzoic_acid.notes'),
    also_known_as: tArray('data_pigments.benzoic_acid.also_known_as'),
    found_in: tArray('data_pigments.benzoic_acid.found_in'),
    echa_cas: '65-85-0',
    echa_ref: 'ECHA Dossier CAS 65-85-0',
  },
  {
    id: 'rosin_colophonium',
    name: t('data_pigments.rosin_colophonium.name'),
    ci: null,
    cas: ["8050-09-7"],
    inci: 'Colophonium',
    color_group: 'additive',
    status: 'restricted',
    status_label: t('status.restricted'),
    regulation: 'EU 2020/2081',
    limit_ppm: 10,
    exact_limit: t('data_pigments.rosin_colophonium.exact_limit'),
    entry_reference: t('data_pigments.rosin_colophonium.entry_reference'),
    notes: t('data_pigments.rosin_colophonium.notes'),
    also_known_as: tArray('data_pigments.rosin_colophonium.also_known_as'),
    found_in: tArray('data_pigments.rosin_colophonium.found_in'),
    echa_cas: '8050-09-7',
    echa_ref: 'ECHA Dossier CAS 8050-09-7',
  },
  {
    id: 'o_anisidine',
    name: t('data_pigments.o_anisidine.name'),
    ci: null,
    cas: ["90-04-0"],
    inci: null,
    color_group: 'amine',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.o_anisidine.exact_limit'),
    entry_reference: t('data_pigments.o_anisidine.entry_reference'),
    notes: t('data_pigments.o_anisidine.notes'),
    also_known_as: tArray('data_pigments.o_anisidine.also_known_as'),
    found_in: tArray('data_pigments.o_anisidine.found_in'),
    echa_cas: '90-04-0',
    echa_ref: 'ECHA Dossier CAS 90-04-0',
  },
  {
    id: 'benzidine',
    name: t('data_pigments.benzidine.name'),
    ci: null,
    cas: ["92-87-5"],
    inci: null,
    color_group: 'amine',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.benzidine.exact_limit'),
    entry_reference: t('data_pigments.benzidine.entry_reference'),
    notes: t('data_pigments.benzidine.notes'),
    also_known_as: tArray('data_pigments.benzidine.also_known_as'),
    found_in: tArray('data_pigments.benzidine.found_in'),
    echa_cas: '92-87-5',
    echa_ref: 'ECHA Dossier CAS 92-87-5',
  },
  {
    id: 'dichlorobenzidine',
    name: t('data_pigments.dichlorobenzidine.name'),
    ci: null,
    cas: ["91-94-1"],
    inci: null,
    color_group: 'amine',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.dichlorobenzidine.exact_limit'),
    entry_reference: t('data_pigments.dichlorobenzidine.entry_reference'),
    notes: t('data_pigments.dichlorobenzidine.notes'),
    also_known_as: tArray('data_pigments.dichlorobenzidine.also_known_as'),
    found_in: tArray('data_pigments.dichlorobenzidine.found_in'),
    echa_cas: '91-94-1',
    echa_ref: 'ECHA Dossier CAS 91-94-1',
  },
  {
    id: 'chloroaniline',
    name: t('data_pigments.chloroaniline.name'),
    ci: null,
    cas: ["106-47-8"],
    inci: null,
    color_group: 'amine',
    status: 'banned',
    status_label: t('status.prohibited'),
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    exact_limit: t('data_pigments.chloroaniline.exact_limit'),
    entry_reference: t('data_pigments.chloroaniline.entry_reference'),
    notes: t('data_pigments.chloroaniline.notes'),
    also_known_as: tArray('data_pigments.chloroaniline.also_known_as'),
    found_in: tArray('data_pigments.chloroaniline.found_in'),
    echa_cas: '106-47-8',
    echa_ref: 'ECHA Dossier CAS 106-47-8',
  },
];

// ═══════════════════════════════════════════════════════════════
// NORMALIZATION & SYNONYM INDEX
// ═══════════════════════════════════════════════════════════════

export function normalizeCi(s: string): string {
  return String(s || '').replace(/[\s.:\-_#]+/g, '').toUpperCase();
}

export function normalizeName(s: string): string {
  return String(s || '').toLowerCase().replace(/[\s\-_.:/()#]+/g, '');
}

export function normalizeCas(s: string): string {
  return String(s || '').replace(/[\s\-]/g, '');
}

export interface IndexEntry {
  key: string;
  entry: PigmentRecord;
  matchType: 'cas' | 'ci' | 'name';
  matchLabel: string;
}

export interface MatchResult {
  entry: PigmentRecord;
  matchType: 'cas' | 'ci' | 'name';
  matchedBy: string;
}

// Pre-computed lookup index covering CAS numbers, CI numbers, INCI, trade shorthands, and synonyms
export const PIGMENT_INDEX: IndexEntry[] = (() => {
  const idx: IndexEntry[] = [];

  function add(key: string, entry: PigmentRecord, matchType: 'cas' | 'ci' | 'name', matchLabel: string) {
    if (!key) return;
    idx.push({ key, entry, matchType, matchLabel });
  }

  PIGMENTS.forEach((p) => {
    // 1. CAS numbers (standard and hyphen-free)
    p.cas.forEach((c) => {
      add(c.trim(), p, 'cas', `CAS ${c.trim()}`);
      add(normalizeCas(c), p, 'cas', `CAS ${c.trim()}`);
    });

    // 2. CI numbers
    if (p.ci) {
      const ciNorm = normalizeCi(p.ci);
      add(ciNorm, p, 'ci', `Colour Index ${p.ci}`);
      // Also register bare digits if 4-6 digits
      const digitsMatch = p.ci.match(/\d{4,6}/);
      if (digitsMatch) {
        add(digitsMatch[0], p, 'ci', `Colour Index ${p.ci}`);
      }
    }

    // 3. INCI Name
    if (p.inci) {
      add(normalizeName(p.inci), p, 'name', `INCI: ${p.inci}`);
    }

    // 4. Substance Name (current language, then English)
    const enName = t(`data_pigments.${p.id}.name`, undefined, 'en');
    [...new Set([p.name, enName])].forEach((nm) => add(normalizeName(nm), p, 'name', nm));

    // 5. Also known as / Trade shorthands (current language, then English)
    const aliases = [...new Set([...(p.also_known_as || []), ...tArray(`data_pigments.${p.id}.also_known_as`, 'en')])];
    aliases.forEach((a) => {
      add(normalizeName(a), p, 'name', a);

      // If it looks like a trade shorthand code e.g. "PBk 7", "PB 15:3", "PR 170"
      if (/^[a-z]{1,3}\s*[-_]?\s*\d+/i.test(a)) {
        const shortClean = a.replace(/[\s\-_]/g, '').toLowerCase();
        add(shortClean, p, 'name', `Trade shorthand ${a}`);
        // Version without colon e.g. "pb153"
        add(shortClean.replace(/:/g, ''), p, 'name', `Trade shorthand ${a}`);
      }
    });
  });

  return idx;
})();

/**
 * Searches for a pigment matching a query token with explanation of how it matched.
 * Resilient to typos (missing colon in 15:3, missing spaces in CI numbers, trade shorthands).
 */
export function findPigmentWithReason(query: string): MatchResult | null {
  if (!query) return null;
  const q = query.trim();
  if (q.length < 2) return null;

  // 1. Exact or normalized CAS match
  const casPattern = /\b(\d{1,7}-\d{2}-\d)\b/;
  const casMatch = q.match(casPattern);
  if (casMatch) {
    const rawCas = casMatch[1];
    const hit = PIGMENT_INDEX.find((e) => e.key === rawCas || e.key === normalizeCas(rawCas));
    if (hit) {
      return {
        entry: hit.entry,
        matchType: 'cas',
        matchedBy: `CAS ${rawCas}`,
      };
    }
  }

  // 2. CI number match (handles "CI 77266", "CI77266", "C.I. 77266", "Colour Index 77266", or bare 5-digit number)
  const ciMatch = q.match(/(?:ci|c\.i\.|colour\s*index|color\s*index)\s*#?:?\s*(\d{4,6})/i) || q.match(/^(\d{5})$/);
  if (ciMatch) {
    const num = ciMatch[1];
    if (num === '74160' && (/15[.:\s]?3/i.test(q) || /alpha/i.test(q))) {
      const pb153 = PIGMENTS.find((p) => p.id === 'pigment_blue_15_3');
      if (pb153) {
        return {
          entry: pb153,
          matchType: 'ci',
          matchedBy: t('parser_matches.colour_index_pb15_3'),
        };
      }
    }
    const ciKey = normalizeCi('CI' + num);
    const hit = PIGMENT_INDEX.find((e) => e.key === ciKey || e.key === num);
    if (hit) {
      return {
        entry: hit.entry,
        matchType: 'ci',
        matchedBy: t('parser_matches.colour_index', { num }),
      };
    }
  }

  // 3. Trade shorthand resolution (e.g. "PBk 7", "PB15:3", "PB 15.3", "PB153", "PG 7", "PR 170", "PW 6", "PY 74")
  const shortMatch = q.match(/(?:^|\b)(pbk|pw|pb|pg|pv|pr|py|po)\s*[-_.]?\s*(\d{1,3})(?::|\.|\s)?(\d)?(?:\b|$)/i);
  if (shortMatch) {
    const prefix = shortMatch[1].toLowerCase();
    const num = shortMatch[2];
    const sub = shortMatch[3];
    const fullCode = sub ? `${prefix}${num}:${sub}` : `${prefix}${num}`;
    const cleanCode = fullCode.replace(/:/g, '');

    const hit = PIGMENT_INDEX.find(
      (e) =>
        e.key === fullCode ||
        e.key === cleanCode ||
        e.key === `${prefix} ${num}` ||
        e.key.startsWith(fullCode)
    );
    if (hit) {
      const displayLabel = sub ? `${shortMatch[1].toUpperCase()} ${num}:${sub}` : `${shortMatch[1].toUpperCase()} ${num}`;
      return {
        entry: hit.entry,
        matchType: 'name',
        matchedBy: t('parser_matches.trade_shorthand', { displayLabel }),
      };
    }
  }

  // 4. Exact normalized name or synonym match
  const norm = normalizeName(q);
  const directHit = PIGMENT_INDEX.find((e) => e.key === norm);
  if (directHit) {
    return {
      entry: directHit.entry,
      matchType: directHit.matchType,
      matchedBy: directHit.matchLabel.startsWith('CAS') || directHit.matchLabel.startsWith('Colour Index') || directHit.matchLabel.startsWith('Trade shorthand')
        ? directHit.matchLabel
        : t('parser_matches.matched_synonym', { matchLabel: directHit.matchLabel }),
    };
  }

  // 5. Typo resilience:
  // Missing colon in Pigment Blue 15.3 or Pigment Blue 153
  if (/pigment\s*blue\s*15[.\s]?3/i.test(q) || /pb\s*15[.\s]?3/i.test(q)) {
    const pb153 = PIGMENTS.find((p) => p.id === 'pigment_blue_15_3');
    if (pb153) {
      return {
        entry: pb153,
        matchType: 'name',
        matchedBy: t('parser_matches.fuzzy_matched', { query: q, target: 'Pigment Blue 15:3' }),
      };
    }
  }

  // Missing colon in Pigment Red 48.2
  if (/pigment\s*red\s*48[.\s]?2/i.test(q) || /pr\s*48[.\s]?2/i.test(q)) {
    const pr482 = PIGMENTS.find((p) => p.id === 'pigment_red_48_2');
    if (pr482) {
      return {
        entry: pr482,
        matchType: 'name',
        matchedBy: t('parser_matches.fuzzy_matched', { query: q, target: 'Pigment Red 48:2' }),
      };
    }
  }

  // Missing colon in Pigment Red 53.1
  if (/pigment\s*red\s*53[.\s]?1/i.test(q) || /pr\s*53[.\s]?1/i.test(q)) {
    const pr531 = PIGMENTS.find((p) => p.id === 'pigment_red_53_1');
    if (pr531) {
      return {
        entry: pr531,
        matchType: 'name',
        matchedBy: t('parser_matches.fuzzy_matched', { query: q, target: 'Pigment Red 53:1' }),
      };
    }
  }

  // Spaced CAS numbers e.g. "1333 - 86 - 4"
  const spacedCas = q.match(/\b(\d{1,7})\s*-\s*(\d{2})\s*-\s*(\d)\b/);
  if (spacedCas) {
    const reconstructed = `${spacedCas[1]}-${spacedCas[2]}-${spacedCas[3]}`;
    const hit = PIGMENT_INDEX.find((e) => e.key === reconstructed);
    if (hit) {
      return {
        entry: hit.entry,
        matchType: 'cas',
        matchedBy: t('parser_matches.cas_reconstructed', { cas: reconstructed }),
      };
    }
  }

  // 6. Substring match for compound names (only if token is specific and >= 4 chars)
  if (norm.length >= 4) {
    const partial = PIGMENT_INDEX.find(
      (e) => (e.key.includes(norm) || norm.includes(e.key)) && e.key.length >= 4
    );
    if (partial) {
      return {
        entry: partial.entry,
        matchType: partial.matchType,
        matchedBy: t('parser_matches.matched_via', { label: partial.matchLabel }),
      };
    }
  }

  return null;
}

export function findPigmentByQuery(query: string): PigmentRecord | null {
  const res = findPigmentWithReason(query);
  return res ? res.entry : null;
}

/**
 * Splits text by delimiter while respecting parentheses (e.g. "CI 77266 (Carbon Black, Lamp Black) 25%").
 */
function splitPreservingParens(str: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '(' || char === '[' || char === '{') depth++;
    else if (char === ')' || char === ']' || char === '}') depth = Math.max(0, depth - 1);

    if (char === delimiter && depth === 0) {
      if (current.trim()) result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

/**
 * Parses full ingredient declarations, SDS Section 3 tables, or OCR label transcriptions.
 * Extracts CI numbers, CAS numbers, and trade names with full synonym resolution and typo resilience.
 * Unrecognised items are recorded exactly as written on the label and marked for the question sheet.
 */
export function parseInkIngredients(text: string): ParsedHit[] {
  if (!text) return [];
  const results: ParsedHit[] = [];
  const seenIdentifiedIds = new Set<string>();
  const seenQueries = new Set<string>();
  const seenCiNumbers = new Set<string>();
  const seenCasNumbers = new Set<string>();

  function addHit(
    query: string,
    type: 'cas' | 'ci' | 'name' | 'unrecognised',
    entry: PigmentRecord | null,
    matchedBy?: string,
    sourceSnippet?: string
  ) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    // Check for stated concentration percentages in snippet or clean query
    const conc = extractConcentrationFromSnippet(sourceSnippet || cleanQuery);
    const concVerdict = entry
      ? evaluateREACHConcentration(conc ? conc.percentValue : null, entry.status, entry.exact_limit)
      : undefined;

    if (entry) {
      if (entry.ci) {
        const num = entry.ci.replace(/\D/g, '');
        if (num) seenCiNumbers.add(num);
      }
      if (entry.cas) {
        entry.cas.forEach((c) => seenCasNumbers.add(c.trim()));
      }
      if (seenIdentifiedIds.has(entry.id)) {
        // Enrich existing hit if concentration or query is more descriptive
        const existing = results.find((r) => r.substance?.id === entry.id);
        if (existing) {
          if (conc && !existing.detectedConcentrationPercent) {
            existing.detectedConcentrationPercent = conc.percentValue;
            existing.concentrationRaw = conc.raw;
            existing.concentrationVerdict = concVerdict;
          }
          if (cleanQuery.length > existing.query.length && !existing.query.includes(cleanQuery)) {
            existing.query = cleanQuery;
          }
        }
        return;
      }
      seenIdentifiedIds.add(entry.id);
      results.push({
        query: cleanQuery,
        type,
        substance: entry,
        matchedBy: matchedBy || `Matched ${entry.name}`,
        detectedConcentrationPercent: conc ? conc.percentValue : null,
        concentrationRaw: conc ? conc.raw : null,
        concentrationVerdict: concVerdict,
      });
    } else {
      const qKey = normalizeName(cleanQuery);
      if (seenQueries.has(qKey)) return;
      seenQueries.add(qKey);
      results.push({
        query: cleanQuery,
        type: 'unrecognised',
        substance: null,
        detectedConcentrationPercent: conc ? conc.percentValue : null,
        concentrationRaw: conc ? conc.raw : null,
      });
    }
  }

  // 1. Process line by line to handle SDS Section 3 tables and multi-line declarations
  const rawLines = text.split(/[\r\n]+/);

  rawLines.forEach((line) => {
    let trimmedLine = line.trim();
    if (!trimmedLine) return;

    // Strip table delimiters (pipes, tabs)
    if (trimmedLine.includes('|') || trimmedLine.includes('\t')) {
      // SDS Table row
      const cells = trimmedLine.split(/[|\t]+/).map((c) => c.trim()).filter(Boolean);
      // Skip header rows
      if (cells.some((c) => /^(substance|chemical|ingredient|cas\s*no|ec\s*no|weight|%\s*w\/w|classification)$/i.test(c))) {
        return;
      }
      cells.forEach((cell) => {
        // Check if cell is purely a percentage or number
        if (/^[\d.\s%<>-]+$/.test(cell)) return;

        // Clean cell
        const cleanCell = cell.replace(/^[-*•·\s]+/, '').replace(/[-*•·\s]+$/, '');
        if (cleanCell.length < 2) return;

        const match = findPigmentWithReason(cleanCell);
        if (match) {
          addHit(cleanCell, match.matchType, match.entry, match.matchedBy, trimmedLine);
        } else if (!/^(none|n\/a|not\s*applicable)$/i.test(cleanCell)) {
          // If cell has substance-like content and isn't just metadata
          if (!/^(table|section|mixture|component)$/i.test(cleanCell)) {
            addHit(cleanCell, 'unrecognised', null, undefined, trimmedLine);
          }
        }
      });
      return;
    }

    // Strip leading section labels or common label prefixes
    trimmedLine = trimmedLine.replace(/^(?:ingredients?|contains?|composition|substances?|mixture|components?|may contain \(\+\/\-\)|inci)\s*[:=]?\s*/i, '');
    trimmedLine = trimmedLine.replace(/^[-*•·\s]+/, '').replace(/[-*•·\s]+$/, '');

    // Skip blank or pure boilerplate
    if (!trimmedLine || /^(section\s*3|composition\s*on\s*ingredients)$/i.test(trimmedLine)) return;

    // Split line by semicolons, bullets, or commas (preserving parentheses)
    const segments = trimmedLine.split(/[;•·]+/).flatMap((seg) => splitPreservingParens(seg, ','));

    segments.forEach((seg) => {
      let rawSeg = seg.trim();
      rawSeg = rawSeg.replace(/^[-*•·\s]+/, '').replace(/[-*•·\s]+$/, '');
      if (!rawSeg || rawSeg.length < 2) return;

      // If pure percentage or number, ignore
      if (/^[\d.\s%<>-]+$/.test(rawSeg)) return;

      // Extract and strip trailing concentration if present so token lookup is clean
      const conc = extractConcentrationFromSnippet(rawSeg);
      let searchToken = rawSeg;
      if (conc) {
        searchToken = rawSeg.replace(conc.raw, '').trim();
      }

      // Check if searchToken contains parenthetical expression e.g. "CI 77266 (Carbon Black)"
      const parenMatch = searchToken.match(/^([^(]+)\(([^)]+)\)$/);
      if (parenMatch) {
        const outer = parenMatch[1].trim();
        const inner = parenMatch[2].trim();

        // Try matching outer and inner
        const outerMatch = findPigmentWithReason(outer);
        const innerMatch = findPigmentWithReason(inner);

        if (outerMatch && innerMatch && outerMatch.entry.id === innerMatch.entry.id) {
          // Unified match
          addHit(rawSeg, outerMatch.matchType, outerMatch.entry, `${outerMatch.matchedBy} · ${innerMatch.matchedBy}`, rawSeg);
          return;
        } else if (innerMatch && (innerMatch.entry.id === 'pigment_blue_15_3' || innerMatch.entry.id === 'pigment_red_48_2' || innerMatch.entry.id === 'pigment_red_53_1')) {
          // Specific subtype declared inside parentheses
          addHit(rawSeg, innerMatch.matchType, innerMatch.entry, `${innerMatch.matchedBy} · ${outerMatch?.matchedBy || outer}`, rawSeg);
          return;
        } else if (outerMatch) {
          addHit(rawSeg, outerMatch.matchType, outerMatch.entry, outerMatch.matchedBy, rawSeg);
          return;
        } else if (innerMatch) {
          addHit(rawSeg, innerMatch.matchType, innerMatch.entry, innerMatch.matchedBy, rawSeg);
          return;
        }
      }

      // Check if searchToken contains slash e.g. "Water / Aqua"
      if (searchToken.includes('/')) {
        const parts = searchToken.split('/').map((p) => p.trim());
        const partMatches = parts.map((p) => findPigmentWithReason(p)).filter(Boolean);
        if (partMatches.length > 0) {
          const first = partMatches[0]!;
          addHit(rawSeg, first.matchType, first.entry, first.matchedBy, rawSeg);
          return;
        }
      }

      // Standard lookup
      const directMatch = findPigmentWithReason(searchToken);
      if (directMatch) {
        addHit(rawSeg, directMatch.matchType, directMatch.entry, directMatch.matchedBy, rawSeg);
      } else {
        addHit(rawSeg, 'unrecognised', null, undefined, rawSeg);
      }
    });
  });

  // 2. Safety sweep: scan full text for any explicit CAS or CI numbers that may have been in unusual formats
  const casMatches = [...text.matchAll(/\b(\d{1,7}-\d{2}-\d)\b/g)];
  casMatches.forEach((m) => {
    const cas = m[1];
    if (seenCasNumbers.has(cas)) return;
    const match = findPigmentWithReason(cas);
    if (match && !seenIdentifiedIds.has(match.entry.id)) {
      addHit(cas, 'cas', match.entry, match.matchedBy, m[0]);
    }
  });

  const ciMatches = [...text.matchAll(/(?:ci|c\.i\.|colour\s*index)\s*#?:?\s*(\d{4,6})/gi)];
  ciMatches.forEach((m) => {
    const ciNum = m[1];
    if (seenCiNumbers.has(ciNum)) return;
    const match = findPigmentWithReason('CI ' + ciNum);
    if (match && !seenIdentifiedIds.has(match.entry.id)) {
      addHit('CI ' + ciNum, 'ci', match.entry, match.matchedBy, m[0]);
    }
  });

  return results;
}

export function computeDecodeStats(hits: ParsedHit[]): DecodeStats {
  let prohibited = 0;
  let restricted = 0;
  let notCovered = 0;
  let unrecognised = 0;

  hits.forEach((h) => {
    if (!h.substance) {
      unrecognised++;
    } else if (h.substance.status === 'banned' || h.substance.status === 'svhc') {
      prohibited++;
    } else if (h.substance.status === 'restricted' || h.substance.status === 'watch') {
      restricted++;
    } else {
      notCovered++;
    }
  });

  return {
    total: hits.length,
    prohibited,
    restricted,
    notCovered,
    unrecognised,
  };
}

export const PIGMENT_DATABASE = PIGMENTS;

/**
 * Refreshes all translated text fields of in-memory PIGMENTS records
 * when the application locale changes.
 */
export function refreshPigmentsTranslations(locale?: SupportedLocale): void {
  const activeLocale = locale || getLocale();
  PIGMENTS.forEach((p) => {
    p.name = t(`data_pigments.${p.id}.name`, undefined, activeLocale);
    p.exact_limit = t(`data_pigments.${p.id}.exact_limit`, undefined, activeLocale);
    p.entry_reference = t(`data_pigments.${p.id}.entry_reference`, undefined, activeLocale);
    p.notes = t(`data_pigments.${p.id}.notes`, undefined, activeLocale);
    p.also_known_as = tArray(`data_pigments.${p.id}.also_known_as`, activeLocale);
    p.found_in = tArray(`data_pigments.${p.id}.found_in`, activeLocale);
    const statusKey =
      p.status === 'banned'
        ? 'status.prohibited'
        : p.status === 'svhc'
        ? 'status.svhc_alert'
        : p.status === 'restricted'
        ? 'status.restricted'
        : 'status.compliant';
    p.status_label = t(statusKey, undefined, activeLocale);
  });
}

// Register refresher so it is triggered whenever setLocale is called
registerDataRefresher(refreshPigmentsTranslations);


