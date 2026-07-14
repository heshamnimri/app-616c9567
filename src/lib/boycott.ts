import boycottData from '@/data/boycott-list.json';
import type { BoycottResult } from './types';

interface BoycottBrandEntry {
  id: string;
  name: string;
  status: 'avoid' | 'support' | 'neutral';
  reasons: string[];
  stakeholders: string[];
}

interface BoycottCompanyEntry {
  id: string;
  name: string;
  status: 'avoid' | 'support' | 'neutral';
}

type IndexEntry =
  | { type: 'brand'; entry: BoycottBrandEntry }
  | { type: 'company'; entry: BoycottCompanyEntry };

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function buildIndex(): Map<string, IndexEntry> {
  const index = new Map<string, IndexEntry>();
  const brands = boycottData.brands as Record<string, BoycottBrandEntry>;
  const companies = boycottData.companies as Record<string, BoycottCompanyEntry>;

  for (const brand of Object.values(brands)) {
    index.set(normalize(brand.id), { type: 'brand', entry: brand });
    index.set(normalize(brand.name), { type: 'brand', entry: brand });
  }
  for (const company of Object.values(companies)) {
    const key = normalize(company.id);
    if (!index.has(key)) index.set(key, { type: 'company', entry: company });
    index.set(normalize(company.name), { type: 'company', entry: company });
  }
  return index;
}

let cachedIndex: Map<string, IndexEntry> | undefined;

function getIndex(): Map<string, IndexEntry> {
  if (!cachedIndex) cachedIndex = buildIndex();
  return cachedIndex;
}

/**
 * Checks product brand/manufacturer names against the bundled TechForPalestine snapshot
 * (github.com/TechForPalestine/boycott-israeli-consumer-goods-dataset). Brands are checked
 * before manufacturers/companies. Returns 'boycotted' on an "avoid" match, 'clear' on a
 * known non-avoid match, and 'unknown' when nothing in the dataset matches.
 */
export function checkBoycott(brands: string[], manufacturers: string[]): BoycottResult {
  const index = getIndex();
  let nonAvoidMatch: IndexEntry | undefined;

  for (const name of [...brands, ...manufacturers]) {
    const match = index.get(normalize(name));
    if (!match) continue;
    if (match.entry.status === 'avoid') {
      return {
        status: 'boycotted',
        matchedName: match.entry.name,
        matchType: match.type,
        reasons: match.type === 'brand' ? match.entry.reasons : undefined,
      };
    }
    nonAvoidMatch ??= match;
  }

  if (nonAvoidMatch) {
    return { status: 'clear', matchedName: nonAvoidMatch.entry.name, matchType: nonAvoidMatch.type };
  }

  return { status: 'unknown' };
}
