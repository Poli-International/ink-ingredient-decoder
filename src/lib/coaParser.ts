export interface ParsedCoaItem {
  metalId: string;
  matchedName: string;
  rawValue: string;
  numericPpm: number;
  unit: string;
  isBelowDetection: boolean;
  limitPpm: number;
  pass: boolean;
}

export interface ParsedCoaResult {
  measurements: Record<string, string>;
  detectedItems: ParsedCoaItem[];
  detectedBatch?: string;
  detectedBrand?: string;
  detectedLab?: string;
  detectedDate?: string;
  rawPastedText: string;
}

interface MetalAlias {
  id: string;
  limitPpm: number;
  patterns: RegExp[];
}

const METAL_ALIASES: MetalAlias[] = [
  {
    id: 'lead',
    limitPpm: 0.7,
    patterns: [/\b(lead|plomb|blei|plomo|lood|chumbo|pb)\b/i, /cas\s*[:#-]?\s*7439-92-1/i],
  },
  {
    id: 'arsenic',
    limitPpm: 0.5,
    patterns: [/\b(arsenic|arsénic|arsène|arsen|arsénico|arseen|arsênio|as)\b/i, /cas\s*[:#-]?\s*7440-38-2/i],
  },
  {
    id: 'cadmium',
    limitPpm: 0.5,
    patterns: [/\b(cadmium|cadmio|cd)\b/i, /cas\s*[:#-]?\s*7440-43-9/i],
  },
  {
    id: 'antimony',
    limitPpm: 0.5,
    patterns: [/\b(antimony|antimoine|antimon|antimonio|antimoon|sb)\b/i, /cas\s*[:#-]?\s*7440-36-0/i],
  },
  {
    id: 'mercury',
    limitPpm: 0.5,
    patterns: [/\b(mercury|mercure|quecksilber|mercurio|kwik|hg)\b/i, /cas\s*[:#-]?\s*7439-97-6/i],
  },
  {
    id: 'nickel',
    limitPpm: 5.0,
    patterns: [/\b(nickel|nikkel|níquel|ni)\b/i, /cas\s*[:#-]?\s*7440-02-0/i],
  },
  {
    id: 'chromium_vi',
    limitPpm: 0.5,
    patterns: [
      /\b(chromium\s*(vi|6|\(vi\))|chrome\s*(vi|6|\(vi\))|chrom\s*(vi|6|\(vi\))|cromo\s*(vi|6|\(vi\))|chroom\s*(vi|6|\(vi\))|cr\s*(vi|6|\(vi\)))\b/i,
      /\b(chromium|chrome|chrom|cromo|chroom|cr)\b/i,
      /cas\s*[:#-]?\s*18540-29-9/i,
    ],
  },
  {
    id: 'barium',
    limitPpm: 500.0,
    patterns: [/\b(barium|baryum|bario|ba)\b/i, /cas\s*[:#-]?\s*7440-39-3/i],
  },
  {
    id: 'copper',
    limitPpm: 250.0,
    patterns: [/\b(copper|cuivre|kupfer|cobre|koper|cu)\b/i, /cas\s*[:#-]?\s*7440-50-8/i],
  },
  {
    id: 'zinc',
    limitPpm: 2000.0,
    patterns: [/\b(zinc|zink|zinco|zn)\b/i, /cas\s*[:#-]?\s*7440-66-6/i],
  },
  {
    id: 'tin',
    limitPpm: 50.0,
    patterns: [/\b(tin|étain|etain|zinn|estaño|estano|tin|chumbo-branco|sn)\b/i, /cas\s*[:#-]?\s*7440-31-5/i],
  },
  {
    id: 'selenium',
    limitPpm: 2.0,
    patterns: [/\b(selenium|sélénium|selen|selenio|se)\b/i, /cas\s*[:#-]?\s*7782-49-2/i],
  },
  {
    id: 'pah_benzo_a_pyrene',
    limitPpm: 0.005,
    patterns: [/\b(benzo\[?a\]?pyrene|b\[?a\]?p|benzopyrène|benzopyren|benzopireno)\b/i, /cas\s*[:#-]?\s*50-32-8/i],
  },
  {
    id: 'pah_total',
    limitPpm: 0.5,
    patterns: [/\b(pah|hap|pak|polycyclic\s*aromatic|polyzyklisch)\b/i],
  },
];

export function parseCoaText(text: string): ParsedCoaResult {
  const lines = text.split(/\r?\n/);
  const measurements: Record<string, string> = {};
  const detectedItems: ParsedCoaItem[] = [];

  let detectedBatch: string | undefined;
  let detectedBrand: string | undefined;
  let detectedLab: string | undefined;
  let detectedDate: string | undefined;

  // Metadata regexes
  const batchRegex = /(?:lot|batch|lote|chargen?|lot-no|batch-no)[\s.:#-]+([A-Z0-9_-]{3,20})/i;
  const labRegex = /(?:laboratory|laboratoire|labor|laboratorio|test\s*facility|institut|sgs|ctl|eurofins|intertek|fresenius)[\s.:-]+([A-Za-z0-9 .,&-]{3,40})/i;
  const dateRegex = /(?:date|datum|fecha|date\s*of\s*test)[\s.:-]+(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Check for batch
    if (!detectedBatch) {
      const bMatch = line.match(batchRegex);
      if (bMatch && bMatch[1]) detectedBatch = bMatch[1].trim();
    }
    // Check for lab
    if (!detectedLab) {
      const lMatch = line.match(labRegex);
      if (lMatch && lMatch[0]) detectedLab = lMatch[0].trim();
    }
    // Check for date
    if (!detectedDate) {
      const dMatch = line.match(dateRegex);
      if (dMatch && dMatch[1]) detectedDate = dMatch[1].trim();
    }

    // Match substances
    for (const metal of METAL_ALIASES) {
      if (measurements[metal.id] !== undefined) continue; // Already matched

      const matchesSubstance = metal.patterns.some((pat) => pat.test(line));
      if (!matchesSubstance) continue;

      // Extract numeric or ND / < value from the same line
      // E.g.: "Lead: <0.2 ppm", "Pb 0.15 mg/kg", "Cadmium (Cd) ND", "Arsenic: 0.04"
      const ndMatch = line.match(/\b(nd|n\.d\.|not\s*detected|non\s*détecté|nicht\s*nachweisbar|no\s*detectado)\b/i);
      const valMatch = line.match(/([<≤]?\s*[\d]+[.,][\d]+|[<≤]?\s*[\d]+)\s*(ppm|mg\/kg|ppb|ug\/kg|µg\/kg|%)?/i);

      let numericPpm = 0;
      let rawValStr = '';
      let isBelowDetection = false;
      let unit = 'ppm';

      if (ndMatch) {
        isBelowDetection = true;
        rawValStr = '0';
        numericPpm = 0;
      } else if (valMatch) {
        rawValStr = valMatch[1].replace(',', '.').replace(/\s+/g, '');
        if (rawValStr.startsWith('<') || rawValStr.startsWith('≤')) {
          isBelowDetection = true;
          const num = parseFloat(rawValStr.slice(1));
          numericPpm = isNaN(num) ? 0 : num;
        } else {
          const num = parseFloat(rawValStr);
          numericPpm = isNaN(num) ? 0 : num;
        }

        if (valMatch[2]) {
          unit = valMatch[2].toLowerCase();
          if (unit === 'ppb' || unit === 'ug/kg' || unit === 'µg/kg') {
            numericPpm = numericPpm / 1000;
          } else if (unit === '%') {
            numericPpm = numericPpm * 10000;
          }
        }
      }

      if (valMatch || ndMatch) {
        measurements[metal.id] = String(numericPpm);
        detectedItems.push({
          metalId: metal.id,
          matchedName: metal.id,
          rawValue: rawValStr || '0',
          numericPpm,
          unit,
          isBelowDetection,
          limitPpm: metal.limitPpm,
          pass: numericPpm <= metal.limitPpm,
        });
        break;
      }
    }
  }

  return {
    measurements,
    detectedItems,
    detectedBatch,
    detectedBrand,
    detectedLab,
    detectedDate,
    rawPastedText: text,
  };
}
