// Regex and logic for extracting stated concentration percentages from SDS Section 3 & bottle labels
// e.g. "Carbon Black: 15-20%", "Lead: <0.00005%", "Glycerin: 5%", "Nickel: 0.0004% (4 ppm)"

export interface ExtractedConcentration {
  raw: string; // e.g. "15-20%" or "<0.00005%"
  percentValue: number; // e.g. 20 (uses upper bound if range)
  ppmEquivalent: number; // e.g. 200,000 ppm
  isUpperBound: boolean;
}

// Matches percentages like "15%", "15-20%", "15 - 20 %", "< 0.00005%", ">= 5%", "0.1% w/w", "1000 mg/kg", "5 ppm"
const PERCENT_REGEX = /(?:[<>≤≥~]\s*)?(\d+(?:\.\d+)?)(?:\s*(?:-|–|to)\s*(\d+(?:\.\d+)?))?\s*(%|ppm|mg\/kg)/i;

export function extractConcentrationFromSnippet(snippet: string): ExtractedConcentration | null {
  if (!snippet) return null;
  const match = snippet.match(PERCENT_REGEX);
  if (!match) return null;

  const raw = match[0].trim();
  const lowerVal = parseFloat(match[1]);
  const upperVal = match[2] ? parseFloat(match[2]) : lowerVal;
  const unit = match[3].toLowerCase();

  let percentValue = upperVal;
  let ppmEquivalent = upperVal * 10000;

  if (unit === 'ppm' || unit === 'mg/kg') {
    ppmEquivalent = upperVal;
    percentValue = upperVal / 10000;
  }

  return {
    raw,
    percentValue,
    ppmEquivalent,
    isUpperBound: !!match[2] || raw.startsWith('<') || raw.startsWith('≤'),
  };
}

export function evaluateREACHConcentration(
  percentValue: number | null,
  substanceStatus: string,
  exactLimitText?: string
): 'exceeds_limit' | 'within_limit' | 'limit_not_quantified' | 'prohibited_regardless' {
  if (percentValue === null || percentValue === undefined) {
    return 'limit_not_quantified';
  }

  // If substance is completely banned under Annex II / Entry 75 (e.g. Pigment Blue 15:3, Pigment Green 7),
  // any deliberate intentional addition or level >= 0.1% (or detectable above impurity limit) is prohibited
  if (substanceStatus === 'banned' || substanceStatus === 'svhc') {
    // If concentration is > 0.1% (standard threshold) or intentionally declared
    if (percentValue >= 0.1) {
      return 'exceeds_limit';
    }
    return 'prohibited_regardless';
  }

  // If substance is restricted, parse threshold from exact limit if available
  // Standard REACH Annex XVII Entry 75 general default is 0.1% (1,000 mg/kg), or specific limits in Appendix 13
  let thresholdPercent = 0.1;
  if (exactLimitText) {
    if (exactLimitText.includes('0.00005%') || exactLimitText.includes('0.5 mg/kg')) {
      thresholdPercent = 0.00005;
    } else if (exactLimitText.includes('0.00007%') || exactLimitText.includes('0.7 mg/kg')) {
      thresholdPercent = 0.00007;
    } else if (exactLimitText.includes('0.0005%') || exactLimitText.includes('5 mg/kg')) {
      thresholdPercent = 0.0005;
    } else if (exactLimitText.includes('0.02%')) {
      thresholdPercent = 0.02;
    }
  }

  if (percentValue > thresholdPercent) {
    return 'exceeds_limit';
  }
  return 'within_limit';
}
