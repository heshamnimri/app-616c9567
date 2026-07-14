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
 * (github.com/TechForPalestine/boycott-israeli-consumer-goods-dataset). Brand names are
 * checked first, then manufacturer/company names.
 */
export function checkBoycott(brands: string[], manufacturers: string[]): BoycottResult {
  const index = getIndex();

  for (const brand of brands) {
    const match = index.get(normalize(brand));
    if (match && match.entry.status === 'avoid') {
      return {
        isBoycotted: true,
        matchedName: match.entry.name,
        matchType: match.type,
        reasons: match.type === 'brand' ? match.entry.reasons : undefined,
      };
    }
  }

  for (const manufacturer of manufacturers) {
    const match = index.get(normalize(manufacturer));
    if (match && match.entry.status === 'avoid') {
      return {
        isBoycotted: true,
        matchedName: match.entry.name,
        matchType: match.type,
        reasons: match.type === 'brand' ? match.entry.reasons : undefined,
      };
    }
  }

  return { isBoycotted: false };
}
