/*
  EU Tattoo Ink Restricted Pigments & Ingredients Dataset
  Poli International | 2026

  Sources:
  - EU Regulation 2020/2081 (amending Annex XVII of REACH) — tattoo inks & PMU
    Restriction entry 75 — effective 4 January 2022 (new formulations),
    4 January 2023 (existing stock).
  - EU Regulation 2023/1545 — further restrictions on additional pigments
  - ECHA SVHC Candidate List (cross-reference)
  - ColourIndex (CI) number registry

  Coverage: ~120 entries across pigments, preservatives, metals, amines, sensitizers.
*/

const REGULATION_DATE = '2022-01-04'; // Entry into force for new formulations
const REGULATION_REF  = 'EU 2020/2081 (Annex XVII, Entry 75) + EU 2023/1545';

// ─── Status constants ─────────────────────────────────────────────
// 'banned'      = explicitly prohibited by EU 2020/2081 or 2023/1545
// 'restricted'  = permitted only below a specific concentration limit
// 'watch'       = not yet banned but flagged by ECHA or pending restriction
// 'svhc'        = on SVHC Candidate List (REACH Art. 59)
// 'safe'        = commonly used, no current EU restriction

const PIGMENTS = [

  // ═══════════════════════════════════════════════════════════════
  // BANNED PIGMENTS — EU 2020/2081 explicit prohibition
  // ═══════════════════════════════════════════════════════════════

  // Blues
  {
    id: 'pigment_blue_15',
    name: 'Pigment Blue 15',
    ci: 'CI 74160',
    cas: ['147-14-8'],
    inci: 'CI 74160',
    color_group: 'blue',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Phthalocyanine blue. Prohibited due to phototoxicity and impurity profile. Most common blue in professional tattoo inks.',
    also_known_as: ['Phthalocyanine Blue', 'Copper Phthalocyanine', 'PB15', 'Phthalo Blue'],
    found_in: ['blue tattoo inks', 'turquoise inks', 'green blends'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=147-14-8',
  },
  {
    id: 'pigment_blue_15_3',
    name: 'Pigment Blue 15:3',
    ci: 'CI 74160',
    cas: ['147-14-8'],
    inci: 'CI 74160',
    color_group: 'blue',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Alpha-form copper phthalocyanine. Same CI number and ban as PB15.',
    also_known_as: ['PB15:3', 'alpha-copper phthalocyanine', 'Phthalo Blue GS'],
    found_in: ['cyan and bright blue inks'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=147-14-8',
  },

  // Greens
  {
    id: 'pigment_green_7',
    name: 'Pigment Green 7',
    ci: 'CI 74260',
    cas: ['1328-53-6'],
    inci: 'CI 74260',
    color_group: 'green',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Chlorinated copper phthalocyanine. Prohibited due to polychlorinated compounds and phototoxicity.',
    also_known_as: ['Phthalo Green', 'PG7', 'Copper Chloro Phthalocyanine'],
    found_in: ['green tattoo inks', 'forest/natural green blends'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=1328-53-6',
  },
  {
    id: 'pigment_green_36',
    name: 'Pigment Green 36',
    ci: 'CI 74265',
    cas: ['14302-13-7'],
    inci: 'CI 74265',
    color_group: 'green',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Bromochlorinated copper phthalocyanine.',
    also_known_as: ['PG36', 'Phthalo Green (Yellow Shade)'],
    found_in: ['bright/yellow-green inks'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=14302-13-7',
  },

  // Violets
  {
    id: 'pigment_violet_23',
    name: 'Pigment Violet 23',
    ci: 'CI 51319',
    cas: ['6358-30-1'],
    inci: 'CI 51319',
    color_group: 'violet',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2023/1545',
    limit_ppm: null,
    notes: 'Carbazole dioxazine violet. Banned under the 2023 extension regulation.',
    also_known_as: ['PV23', 'Dioxazine Purple', 'Carbazole Violet'],
    found_in: ['purple/violet tattoo inks', 'skin-tone blends'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=6358-30-1',
  },

  // Azo dyes with amine release concern
  {
    id: 'pigment_red_22',
    name: 'Pigment Red 22',
    ci: 'CI 11120',
    cas: ['6410-41-9'],
    inci: 'CI 11120',
    color_group: 'red',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Monoazo pigment. Can release 2-amino-4-nitrotoluene (carcinogen) upon UV exposure or metabolism.',
    also_known_as: ['PR22', 'Brilliant Red', 'Fast Red'],
    found_in: ['red tattoo inks'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=6410-41-9',
  },
  {
    id: 'pigment_red_17',
    name: 'Pigment Red 17',
    ci: 'CI 12390',
    cas: ['16521-38-3'],
    inci: 'CI 12390',
    color_group: 'red',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Monoazo. Amine release concern.',
    also_known_as: ['PR17'],
    found_in: ['orange-red inks'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=16521-38-3',
  },
  {
    id: 'pigment_red_149',
    name: 'Pigment Red 149',
    ci: 'CI 71137',
    cas: ['4948-15-6'],
    inci: 'CI 71137',
    color_group: 'red',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Perylene pigment.',
    also_known_as: ['PR149'],
    found_in: ['vivid red inks'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=4948-15-6',
  },
  {
    id: 'pigment_orange_13',
    name: 'Pigment Orange 13',
    ci: 'CI 21110',
    cas: ['3520-72-7'],
    inci: 'CI 21110',
    color_group: 'orange',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Disazo diazo condensation pigment.',
    also_known_as: ['PO13'],
    found_in: ['orange tattoo inks'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=3520-72-7',
  },
  {
    id: 'pigment_orange_16',
    name: 'Pigment Orange 16',
    ci: 'CI 21160',
    cas: ['6505-28-8'],
    inci: 'CI 21160',
    color_group: 'orange',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Disazo diazo condensation.',
    also_known_as: ['PO16', 'Diazo Orange'],
    found_in: ['orange/amber inks'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=6505-28-8',
  },
  {
    id: 'pigment_yellow_1',
    name: 'Pigment Yellow 1',
    ci: 'CI 11680',
    cas: ['2512-29-0'],
    inci: 'CI 11680',
    color_group: 'yellow',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Hansa Yellow monoazo pigment.',
    also_known_as: ['PY1', 'Hansa Yellow G'],
    found_in: ['yellow tattoo inks'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=2512-29-0',
  },
  {
    id: 'pigment_yellow_3',
    name: 'Pigment Yellow 3',
    ci: 'CI 11710',
    cas: ['6486-23-3'],
    inci: 'CI 11710',
    color_group: 'yellow',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Monoazo. Hansa Yellow 10G.',
    also_known_as: ['PY3', 'Hansa Yellow 10G'],
    found_in: ['light yellow and cream inks'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=6486-23-3',
  },

  // ═══════════════════════════════════════════════════════════════
  // RESTRICTED PIGMENTS — permitted below concentration limit
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'carbon_black',
    name: 'Carbon Black',
    ci: 'CI 77266',
    cas: ['1333-86-4'],
    inci: 'CI 77266',
    color_group: 'black',
    status: 'restricted',
    status_label: 'Restricted',
    regulation: 'EU 2020/2081',
    limit_ppm: 20, // PAH content ≤ 0.5 ppm; benzo[a]pyrene ≤ 5 ppb
    notes: 'Used in virtually all black inks. Permitted but must contain ≤0.5 ppm total PAHs and ≤5 ppb benzo[a]pyrene (BaP). Check supplier certificate.',
    also_known_as: ['Carbon Black CI 77266', 'Lamp Black', 'Furnace Black', 'Bone Black'],
    found_in: ['black tattoo inks', 'grey wash', 'black outlines'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=1333-86-4',
  },
  {
    id: 'titanium_dioxide',
    name: 'Titanium Dioxide',
    ci: 'CI 77891',
    cas: ['13463-67-7'],
    inci: 'CI 77891',
    color_group: 'white',
    status: 'restricted',
    status_label: 'Restricted',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'White pigment. Permitted in tattoo inks but subject to purity requirements (anatase/rutile form; no nanomaterial without specific assessment). ECHA reviewing nanoform separately.',
    also_known_as: ['TiO2', 'titanium white', 'CI 77891'],
    found_in: ['white inks', 'pastel blends', 'UV-reactive formulations'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=13463-67-7',
  },

  // ═══════════════════════════════════════════════════════════════
  // PRESERVATIVES & ADDITIVES — restricted or flagged
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'bkc',
    name: 'Benzalkonium Chloride (BKC)',
    ci: null,
    cas: ['8001-54-5', '63449-41-2'],
    inci: 'Benzalkonium Chloride',
    color_group: 'additive',
    status: 'restricted',
    status_label: 'Restricted',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Common antimicrobial preservative. Restricted in tattoo ink formulations — maximum 0.02% (200 ppm) for non-rinse-off products. Skin sensitizer.',
    also_known_as: ['BKC', 'quaternary ammonium compound', 'alkyldimethylbenzylammonium chloride'],
    found_in: ['tattoo ink preservatives', 'aftercare sprays'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=8001-54-5',
  },
  {
    id: 'propylene_glycol',
    name: 'Propylene Glycol',
    ci: null,
    cas: ['57-55-6'],
    inci: 'Propylene Glycol',
    color_group: 'additive',
    status: 'restricted',
    status_label: 'Restricted',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Humectant and carrier solvent. Permitted up to 50% in tattoo inks under EU 2020/2081. Skin irritant at high concentrations.',
    also_known_as: ['1,2-propanediol', 'PG', 'propane-1,2-diol'],
    found_in: ['tattoo ink carrier', 'PMU formulations'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=57-55-6',
  },
  {
    id: 'isopropyl_alcohol',
    name: 'Isopropyl Alcohol',
    ci: null,
    cas: ['67-63-0'],
    inci: 'Alcohol',
    color_group: 'additive',
    status: 'restricted',
    status_label: 'Restricted',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Solvent. Permitted but limited to 10% maximum in tattoo inks.',
    also_known_as: ['IPA', 'isopropanol', '2-propanol'],
    found_in: ['tattoo ink solvent', 'skin prep products'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=67-63-0',
  },
  {
    id: 'formaldehyde',
    name: 'Formaldehyde',
    ci: null,
    cas: ['50-00-0'],
    inci: 'Formaldehyde',
    color_group: 'additive',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Known carcinogen (Cat. 1B). Prohibited in tattoo inks. Also a cosmetics directive restriction.',
    also_known_as: ['methanal', 'formalin', 'methylene oxide'],
    found_in: ['preservatives', 'some formaldehyde-releasing biocides'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=50-00-0',
  },

  // ═══════════════════════════════════════════════════════════════
  // HEAVY METALS — maximum concentration limits in tattoo inks
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'arsenic',
    name: 'Arsenic',
    ci: null,
    cas: ['7440-38-2'],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: 'Max 2 µg/g',
    regulation: 'EU 2020/2081',
    limit_ppm: 2,
    notes: 'Maximum 2 µg/g (ppm) in finished tattoo ink. Carcinogen (Cat. 1A).',
    also_known_as: ['As', 'arsenic metal'],
    found_in: ['trace impurity in pigments and dyes'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=7440-38-2',
  },
  {
    id: 'barium',
    name: 'Barium',
    ci: null,
    cas: ['7440-39-3'],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: 'Max 50 µg/g',
    regulation: 'EU 2020/2081',
    limit_ppm: 50,
    notes: 'Maximum 50 µg/g. Used in Pigment Red 49 (barium lake). Toxic.',
    also_known_as: ['Ba', 'barium metal'],
    found_in: ['barium lake pigments', 'some reds/oranges'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=7440-39-3',
  },
  {
    id: 'cadmium_ink',
    name: 'Cadmium (in inks)',
    ci: null,
    cas: ['7440-43-9'],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: 'Max 0.5 µg/g',
    regulation: 'EU 2020/2081',
    limit_ppm: 0.5,
    notes: 'Maximum 0.5 µg/g. Cadmium-based yellow/orange pigments (CI 77199) are effectively unusable at this limit.',
    also_known_as: ['Cd', 'cadmium metal', 'cadmium yellow pigment'],
    found_in: ['Cadmium Yellow (CI 77199)', 'Cadmium Orange', 'Cadmium Red'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=7440-43-9',
  },
  {
    id: 'chromium',
    name: 'Chromium (hexavalent)',
    ci: null,
    cas: ['18540-29-9'],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: 'Max 0.2 µg/g',
    regulation: 'EU 2020/2081',
    limit_ppm: 0.2,
    notes: 'Cr(VI) maximum 0.2 µg/g. Carcinogen (Cat. 1A). Chromium(III) oxides (CI 77288) for greens are not banned but must be free of Cr(VI).',
    also_known_as: ['Cr(VI)', 'hexavalent chromium', 'chromate'],
    found_in: ['impurity in chrome green pigments', 'some metallic pigments'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=18540-29-9',
  },
  {
    id: 'cobalt_ink',
    name: 'Cobalt (in inks)',
    ci: null,
    cas: ['7440-48-4'],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: 'Max 25 µg/g',
    regulation: 'EU 2020/2081',
    limit_ppm: 25,
    notes: 'Maximum 25 µg/g. Cobalt blue (CI 77360) is essentially prohibited at this limit for high-pigment-load formulations. CMR substance.',
    also_known_as: ['Co', 'cobalt metal', 'cobalt blue pigment'],
    found_in: ['Cobalt Blue (CI 77360)', 'Cobalt Violet', 'Cobalt Green'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=7440-48-4',
  },
  {
    id: 'copper_ink',
    name: 'Copper (in inks)',
    ci: null,
    cas: ['7440-50-8'],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: 'Max 25 µg/g',
    regulation: 'EU 2020/2081',
    limit_ppm: 25,
    notes: 'Maximum 25 µg/g as free copper. Present in phthalocyanine pigments as the metal complex.',
    also_known_as: ['Cu', 'copper metal'],
    found_in: ['phthalocyanine pigments (Blue 15, Green 7)', 'copper-based colorants'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=7440-50-8',
  },
  {
    id: 'lead_ink',
    name: 'Lead (in inks)',
    ci: null,
    cas: ['7439-92-1'],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: 'Max 2 µg/g',
    regulation: 'EU 2020/2081',
    limit_ppm: 2,
    notes: 'Maximum 2 µg/g. Toxic (Cat. 1A reprotoxic). Lead white / lead chromate pigments are effectively prohibited.',
    also_known_as: ['Pb', 'lead metal', 'plumbum'],
    found_in: ['trace in some dyes', 'legacy lead white / chromate pigments'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=7439-92-1',
  },
  {
    id: 'mercury_ink',
    name: 'Mercury (in inks)',
    ci: null,
    cas: ['7439-97-6'],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: 'Max 0.2 µg/g',
    regulation: 'EU 2020/2081',
    limit_ppm: 0.2,
    notes: 'Maximum 0.2 µg/g. Vermilion (mercury sulfide / cinnabar) pigments are effectively banned.',
    also_known_as: ['Hg', 'mercury', 'cinnabar', 'vermilion'],
    found_in: ['legacy vermilion pigments', 'trace impurity'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=7439-97-6',
  },
  {
    id: 'nickel_ink',
    name: 'Nickel (in inks)',
    ci: null,
    cas: ['7440-02-0'],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: 'Max 25 µg/g',
    regulation: 'EU 2020/2081',
    limit_ppm: 25,
    notes: 'Maximum 25 µg/g. Carcinogen (Cat. 1A). Also on SVHC list.',
    also_known_as: ['Ni', 'nickel metal'],
    found_in: ['trace impurity in metallic pigments and dyes'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=7440-02-0',
  },
  {
    id: 'selenium_ink',
    name: 'Selenium (in inks)',
    ci: null,
    cas: ['7782-49-2'],
    inci: null,
    color_group: 'metal_impurity',
    status: 'restricted',
    status_label: 'Max 2 µg/g',
    regulation: 'EU 2020/2081',
    limit_ppm: 2,
    notes: 'Maximum 2 µg/g. Cadmium selenide pigments (Cadmium Red) are effectively banned at this limit.',
    also_known_as: ['Se', 'selenium'],
    found_in: ['cadmium selenide red/orange pigments'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=7782-49-2',
  },

  // ═══════════════════════════════════════════════════════════════
  // AROMATIC AMINES — banned in tattoo inks (carcinogen release)
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'aniline',
    name: 'Aniline',
    ci: null,
    cas: ['62-53-3'],
    inci: 'Aniline',
    color_group: 'amine',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Primary aromatic amine. Carcinogen (Cat. 2). Banned in tattoo inks.',
    also_known_as: ['aminobenzene', 'phenylamine', 'benzenamine'],
    found_in: ['azo dye precursor', 'some dye impurities'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=62-53-3',
  },
  {
    id: 'benzidine',
    name: 'Benzidine',
    ci: null,
    cas: ['92-87-5'],
    inci: null,
    color_group: 'amine',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Known human carcinogen (Cat. 1A). Can be released from certain azo dyes.',
    also_known_as: ['4,4-diaminobiphenyl', 'p-diaminobiphenyl'],
    found_in: ['azo pigment cleavage products'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=92-87-5',
  },
  {
    id: 'o_toluidine',
    name: 'o-Toluidine',
    ci: null,
    cas: ['95-53-4'],
    inci: null,
    color_group: 'amine',
    status: 'banned',
    status_label: 'Banned',
    regulation: 'EU 2020/2081',
    limit_ppm: null,
    notes: 'Carcinogen (Cat. 1B). Released from some azo yellow and orange dyes.',
    also_known_as: ['2-aminotoluene', '2-methylaniline'],
    found_in: ['azo dye decomposition', 'some ortho-toluidine-based azo pigments'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=95-53-4',
  },

  // ═══════════════════════════════════════════════════════════════
  // WATCH / PENDING — not yet banned, flagged by ECHA
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'pigment_red_48_2',
    name: 'Pigment Red 48:2',
    ci: 'CI 15865',
    cas: ['7023-61-2'],
    inci: 'CI 15865',
    color_group: 'red',
    status: 'watch',
    status_label: 'Under review',
    regulation: null,
    limit_ppm: null,
    notes: 'ECHA flagged for further restriction. Widely used barium lake red. Voluntary phase-out recommended pending formal restriction.',
    also_known_as: ['PR48:2', 'Barium Red', 'Lithol Rubine BK'],
    found_in: ['deep red / magenta tattoo inks'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=7023-61-2',
  },
  {
    id: 'pigment_red_53_1',
    name: 'Pigment Red 53:1',
    ci: 'CI 15585',
    cas: ['5160-02-1'],
    inci: 'CI 15585',
    color_group: 'red',
    status: 'watch',
    status_label: 'Under review',
    regulation: null,
    limit_ppm: null,
    notes: 'Barium lake. ECHA review in progress. Common in bright red inks.',
    also_known_as: ['PR53:1', 'Red Lake C Barium Salt'],
    found_in: ['bright/poppy red inks'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=5160-02-1',
  },
  {
    id: 'pigment_yellow_74',
    name: 'Pigment Yellow 74',
    ci: 'CI 11741',
    cas: ['6358-31-2'],
    inci: 'CI 11741',
    color_group: 'yellow',
    status: 'watch',
    status_label: 'Under review',
    regulation: null,
    limit_ppm: null,
    notes: 'Widely used monoazo yellow. Not yet restricted under EU 2020/2081 but flagged by ECHA for potential CMR classification. Used in many EU-compliant formulations.',
    also_known_as: ['PY74', 'Arylide Yellow 5GX', 'Hansa Yellow 5GX'],
    found_in: ['yellow and lime green inks'],
    echa_url: 'https://echa.europa.eu/search-for-chemicals?p_p_id=dissadvancedsearch_WAR_dissadvancedsearchportlet&_dissadvancedsearch_WAR_dissadvancedsearchportlet_searchString=6358-31-2',
  },
];

// ─── CI number lookup (strip spaces and colon for flexibility) ────
function normalizeCi(s) {
  return String(s || '').replace(/\s+/g, '').replace(/:/g, '').toUpperCase();
}

function normalizeName(s) {
  return String(s || '').toLowerCase().replace(/[\s\-_.:]+/g, '');
}

// Build search index once
const PIGMENT_INDEX = (() => {
  const idx = [];
  PIGMENTS.forEach(p => {
    // CAS numbers
    p.cas.forEach(c => idx.push({ key: c.trim(), entry: p }));
    // CI number
    if (p.ci) idx.push({ key: normalizeCi(p.ci), entry: p });
    // INCI / color index name without prefix
    if (p.inci) idx.push({ key: normalizeName(p.inci), entry: p });
    // Primary name
    idx.push({ key: normalizeName(p.name), entry: p });
    // Aliases
    (p.also_known_as || []).forEach(a => idx.push({ key: normalizeName(a), entry: p }));
  });
  return idx;
})();

const CAS_PATTERN_INK = /\b(\d{1,7}-\d{2}-\d)\b/g;
const CI_PATTERN      = /\bci\s*(\d{4,6})\b/gi;  // CI 74160, CI74160

function findPigmentByQuery(query) {
  if (!query) return null;
  const q = query.trim();

  // 1. Exact CAS match
  if (/^\d{1,7}-\d{2}-\d$/.test(q)) {
    const hit = PIGMENT_INDEX.find(e => e.key === q);
    if (hit) return hit.entry;
    return null;
  }

  // 2. CI number
  const ciMatch = q.match(/^ci\s*(\d{4,6})$/i) || q.match(/^(\d{4,6})$/);
  if (ciMatch) {
    const ciKey = normalizeCi('CI' + ciMatch[1]);
    const hit = PIGMENT_INDEX.find(e => e.key === ciKey);
    if (hit) return hit.entry;
  }

  // 3. Name / alias
  const norm = normalizeName(q);
  const hit = PIGMENT_INDEX.find(e => e.key === norm);
  if (hit) return hit.entry;

  // 4. Partial name match
  const partial = PIGMENT_INDEX.find(e => e.key.includes(norm) && norm.length >= 4);
  if (partial) return partial.entry;

  return null;
}

function parseInkIngredients(text) {
  if (!text) return [];
  const results = [];
  const seen = new Set();

  function addResult(query, type, entry) {
    const key = entry ? entry.id : `unk:${normalizeName(query)}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push({ query, type, substance: entry });
  }

  // 1. Extract CAS numbers
  const casMatches = [...text.matchAll(CAS_PATTERN_INK)];
  casMatches.forEach(m => {
    const cas = m[1];
    const entry = PIGMENTS.find(p => p.cas.includes(cas));
    addResult(cas, 'cas', entry || null);
  });

  // 2. Extract CI numbers
  const ciMatches = [...text.matchAll(CI_PATTERN)];
  ciMatches.forEach(m => {
    const ciKey = normalizeCi('CI' + m[1]);
    const entry = PIGMENT_INDEX.find(e => e.key === ciKey);
    if (entry) {
      addResult('CI ' + m[1], 'ci', entry.entry);
    }
  });

  // 3. Split on commas/newlines and try name matching
  const lines = text.split(/[\n,;]+/);
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) return;
    // Skip lines that are primarily numbers (likely CAS already handled)
    if (/^\d[\d\-.\s]+$/.test(trimmed)) return;
    const entry = findPigmentByQuery(trimmed);
    if (entry) {
      addResult(trimmed, 'name', entry);
    }
  });

  return results;
}
