/**
 * Open Food Facts has no dedicated fields for "refined sugar", "natural/artificial flavouring",
 * or "refined oil" — these are transparent keyword heuristics over the ingredients text rather
 * than an authoritative taxonomy. They're intentionally simple and easy to refine later.
 */

const REFINED_SUGAR_PATTERNS: RegExp[] = [
  /\bsugars?\b/,
  /glucose[\s-]?syrup/,
  /corn syrup/,
  /\bdextrose\b/,
  /\bfructose\b/,
  /\bsucrose\b/,
  /maltodextrin/,
];

export function detectRefinedSugars(ingredientsText: string | undefined): string[] {
  return matchPatterns(ingredientsText, REFINED_SUGAR_PATTERNS);
}

export type FlavouringSignal = 'none' | 'generic' | 'artificial' | 'natural';

/**
 * Natural flavouring is flagged as worse than artificial per this app's design brief — despite
 * the "natural" label, it's an ambiguous, often heavily processed ingredient category.
 */
export function detectFlavouring(ingredientsText: string | undefined): FlavouringSignal {
  const text = ingredientsText?.toLowerCase() ?? '';
  if (!text) return 'none';
  if (/natural flavou?rings?|natural flavou?rs?/.test(text)) return 'natural';
  if (/artificial flavou?rings?|artificial flavou?rs?/.test(text)) return 'artificial';
  if (/\bflavou?rings?\b|\bflavou?rs?\b/.test(text)) return 'generic';
  return 'none';
}

const REFINED_OIL_PATTERNS: RegExp[] = [
  /palm kernel oil/,
  /palm oil/,
  /hydrogenated [a-z\s]*oil/,
  /vegetable oil/,
  /rapeseed oil/,
  /canola oil/,
  /soybean oil/,
  /sunflower oil/,
  /corn oil/,
  /cottonseed oil/,
];

export function detectRefinedOils(
  ingredientsText: string | undefined,
  ingredientsAnalysisTags: string[] = [],
): string[] {
  const matches = matchPatterns(ingredientsText, REFINED_OIL_PATTERNS);
  if (ingredientsAnalysisTags.includes('palm-oil') && !matches.includes('palm oil')) {
    matches.push('palm oil');
  }
  return matches;
}

/**
 * Best-effort extraction of E-number additive codes (e.g. "E171", "E-171") from raw OCR'd
 * ingredients text, for the barcode-not-found fallback flow where there's no additives_tags
 * field to rely on. Many additives are printed by name rather than E-number, so this only
 * catches a subset — it's a supplement to the ingredient heuristics above, not a replacement.
 */
export function extractAdditiveCodes(ingredientsText: string | undefined): string[] {
  const lower = ingredientsText?.toLowerCase() ?? '';
  if (!lower) return [];
  const matches = lower.matchAll(/\be-?\s?(\d{3}[a-z]?)\b/g);
  const codes = new Set<string>();
  for (const match of matches) codes.add(`e${match[1]}`);
  return [...codes];
}

function matchPatterns(text: string | undefined, patterns: RegExp[]): string[] {
  const lower = text?.toLowerCase() ?? '';
  if (!lower) return [];
  const matches: string[] = [];
  for (const pattern of patterns) {
    const match = lower.match(pattern);
    if (match) matches.push(match[0]);
  }
  return matches;
}
