/**
 * Label & Documentation QR Code Parser
 * Parses printed documentation QR codes, SDS batch certificates, and bottle labels
 * into structured tattoo ink metadata (Brand, Ink Name, Batch/Lot, Expiry, Ingredients).
 * 100% offline, pure client-side algorithmic parsing.
 */

export interface ParsedLabelData {
  brand?: string;
  inkName?: string;
  batchNumber?: string;
  expiryDate?: string;
  ingredients?: string;
  rawText: string;
  detectedType: 'json' | 'structured_text' | 'url_params' | 'ingredients_list' | 'batch_code' | 'plain';
}

/**
 * Parses raw text from a QR code or barcode into ink information.
 */
export function parseLabelOrDocumentation(raw: string): ParsedLabelData {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { rawText: '', detectedType: 'plain' };
  }

  // 1. Try parsing as JSON (e.g. our app's own QR label or industry JSON batch tokens)
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null) {
        const brand = parsed.brand || parsed.manufacturer || parsed.producer || parsed.make || '';
        const inkName = parsed.ink || parsed.inkName || parsed.name || parsed.product || parsed.shade || parsed.color || '';
        const batchNumber = parsed.lot || parsed.batch || parsed.batchNo || parsed.batchNumber || parsed.lotNumber || parsed.charge || '';
        const expiryDate = parsed.exp || parsed.expiry || parsed.expiryDate || parsed.bestBefore || '';
        let ingredients = '';

        if (typeof parsed.ingredients === 'string') {
          ingredients = parsed.ingredients;
        } else if (Array.isArray(parsed.ingredients)) {
          ingredients = parsed.ingredients.join(', ');
        } else if (parsed.composition) {
          ingredients = typeof parsed.composition === 'string' ? parsed.composition : JSON.stringify(parsed.composition);
        } else if (parsed.formula) {
          ingredients = typeof parsed.formula === 'string' ? parsed.formula : JSON.stringify(parsed.formula);
        }

        return {
          brand: brand ? String(brand).trim() : undefined,
          inkName: inkName ? String(inkName).trim() : undefined,
          batchNumber: batchNumber ? String(batchNumber).trim() : undefined,
          expiryDate: expiryDate ? String(expiryDate).trim() : undefined,
          ingredients: ingredients ? String(ingredients).trim() : undefined,
          rawText: trimmed,
          detectedType: 'json',
        };
      }
    } catch {
      // Not valid JSON, continue with subsequent detectors
    }
  }

  // 2. Check for URL with query parameters (e.g. manufacturer SDS verification URLs)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('?')) {
    try {
      const urlStr = trimmed.startsWith('http') ? trimmed : `https://example.com/${trimmed}`;
      const url = new URL(urlStr);
      const params = url.searchParams;

      const brand = params.get('brand') || params.get('manufacturer') || params.get('mfg') || '';
      const inkName = params.get('ink') || params.get('name') || params.get('product') || params.get('shade') || '';
      const batchNumber = params.get('lot') || params.get('batch') || params.get('batchNo') || params.get('lotNo') || '';
      const expiryDate = params.get('exp') || params.get('expiry') || '';
      const ingredients = params.get('ingredients') || params.get('formula') || params.get('ci') || '';

      if (brand || inkName || batchNumber || ingredients) {
        return {
          brand: brand ? decodeURIComponent(brand).trim() : undefined,
          inkName: inkName ? decodeURIComponent(inkName).trim() : undefined,
          batchNumber: batchNumber ? decodeURIComponent(batchNumber).trim() : undefined,
          expiryDate: expiryDate ? decodeURIComponent(expiryDate).trim() : undefined,
          ingredients: ingredients ? decodeURIComponent(ingredients).trim() : undefined,
          rawText: trimmed,
          detectedType: 'url_params',
        };
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  // 3. Check for Structured Multi-Line Key-Value Text (Common in printed documentation/certificates)
  const lines = trimmed.split(/[\r\n]+/);
  if (lines.length > 1) {
    let brand: string | undefined;
    let inkName: string | undefined;
    let batchNumber: string | undefined;
    let expiryDate: string | undefined;
    let ingredients: string | undefined;
    let matchedLines = 0;

    for (const line of lines) {
      const lineTrim = line.trim();
      if (!lineTrim) continue;

      // Brand / Manufacturer
      const brandMatch = lineTrim.match(/^(?:brand|manufacturer|hersteller|marque|marca|fabricante)\s*[:=]\s*(.+)$/i);
      if (brandMatch) {
        brand = brandMatch[1].trim();
        matchedLines++;
        continue;
      }

      // Ink Name / Product / Shade
      const inkMatch = lineTrim.match(/^(?:ink(?:\s*name)?|product|name|shade|farbe|couleur|colore|cor|bezeichnung)\s*[:=]\s*(.+)$/i);
      if (inkMatch) {
        inkName = inkMatch[1].trim();
        matchedLines++;
        continue;
      }

      // Batch / Lot / Charge
      const batchMatch = lineTrim.match(/^(?:batch(?:\s*(?:no|number|#))?|lot(?:\s*(?:no|number|#))?|charge|ch\.-b\.|lote)\s*[:=]\s*(.+)$/i);
      if (batchMatch) {
        batchNumber = batchMatch[1].trim();
        matchedLines++;
        continue;
      }

      // Expiry / Best Before / MHD
      const expMatch = lineTrim.match(/^(?:exp(?:\s*date)?|expiry|best\s*before|mhd|verwendbar\s*bis|date\s*limite)\s*[:=]\s*(.+)$/i);
      if (expMatch) {
        expiryDate = expMatch[1].trim();
        matchedLines++;
        continue;
      }

      // Ingredients / Inhaltsstoffe / Composition
      const ingMatch = lineTrim.match(/^(?:ingredients|inhaltsstoffe|ingr[eé]dients|ingredienti|ingredientes|composition)\s*[:=]\s*(.+)$/i);
      if (ingMatch) {
        ingredients = ingMatch[1].trim();
        matchedLines++;
        continue;
      }

      // If line contains known pigment markers like "CI 77" or "Aqua" or "CAS ", it could be an ingredient continuation
      if (/\b(?:CI\s*\d{5}|CAS\s*\d+-\d+-\d+|Aqua|Glycerin|Hamamelis)\b/i.test(lineTrim)) {
        ingredients = ingredients ? `${ingredients}, ${lineTrim}` : lineTrim;
        matchedLines++;
      }
    }

    if (matchedLines > 0) {
      return {
        brand,
        inkName,
        batchNumber,
        expiryDate,
        ingredients,
        rawText: trimmed,
        detectedType: 'structured_text',
      };
    }
  }

  // 4. Check for Delimited Pipe / Semicolon Format (e.g., BRAND|INK|BATCH|INGREDIENTS)
  if (trimmed.includes('|')) {
    const parts = trimmed.split('|').map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return {
        brand: parts[0] || undefined,
        inkName: parts[1] || undefined,
        batchNumber: parts[2] || undefined,
        ingredients: parts.slice(3).join(', ') || undefined,
        rawText: trimmed,
        detectedType: 'structured_text',
      };
    }
  }

  // 5. Check if the raw text is an ingredients list (contains CI numbers, CAS numbers, Aqua, etc.)
  const isIngredientList =
    /\bCI\s*\d{5}\b/i.test(trimmed) ||
    /\bCAS\s*\d{2,7}-\d{2}-\d\b/i.test(trimmed) ||
    /\b(?:Aqua|Water|Glycerin|Hamamelis|Isopropyl|Alcohol|Carbon\s*Black|Titanium\s*Dioxide)\b/i.test(trimmed);

  if (isIngredientList) {
    return {
      ingredients: trimmed,
      rawText: trimmed,
      detectedType: 'ingredients_list',
    };
  }

  // 6. Check if text is a single Batch / Lot number code
  const isBatchCode = /^(?:LOT|BATCH|CHG|B)[\s\-#:]*[A-Z0-9\-_./]+$/i.test(trimmed);
  if (isBatchCode && trimmed.length <= 40) {
    return {
      batchNumber: trimmed,
      rawText: trimmed,
      detectedType: 'batch_code',
    };
  }

  // 7. Generic fallback: return as raw ingredients/text
  return {
    ingredients: trimmed,
    rawText: trimmed,
    detectedType: 'plain',
  };
}
