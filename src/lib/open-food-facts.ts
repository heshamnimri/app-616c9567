import type { NormalizedProduct } from './types';

const FIELDS = [
  'code',
  'product_name',
  'brands',
  'manufacturing_places',
  'nova_group',
  'additives_tags',
  'ingredients_text',
  'nutriments',
  'nutrient_levels',
  'ingredients_analysis_tags',
].join(',');

interface OffNutrientLevels {
  fat?: 'low' | 'moderate' | 'high';
  'saturated-fat'?: 'low' | 'moderate' | 'high';
  sugars?: 'low' | 'moderate' | 'high';
  salt?: 'low' | 'moderate' | 'high';
}

interface OffNutriments {
  fat_100g?: number;
  'saturated-fat_100g'?: number;
  sugars_100g?: number;
  salt_100g?: number;
}

interface OffRawProduct {
  product_name?: string;
  brands?: string;
  manufacturing_places?: string;
  nova_group?: number;
  additives_tags?: string[];
  ingredients_text?: string;
  nutriments?: OffNutriments;
  nutrient_levels?: OffNutrientLevels;
  ingredients_analysis_tags?: string[];
}

interface OffApiResponse {
  status: number;
  product?: OffRawProduct;
}

export type LookupResult =
  | { status: 'found'; product: NormalizedProduct }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

export async function lookupBarcode(barcode: string): Promise<LookupResult> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`;

  // No custom User-Agent here: browsers treat it as a forbidden fetch header and silently
  // ignore attempts to set it. OFF's request for a descriptive UA applies to bulk/server use.
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Network error' };
  }

  if (!response.ok) {
    return { status: 'error', message: `Open Food Facts request failed (${response.status})` };
  }

  const data = (await response.json()) as OffApiResponse;
  if (data.status !== 1 || !data.product) {
    return { status: 'not_found' };
  }

  return { status: 'found', product: normalizeProduct(barcode, data.product) };
}

function normalizeProduct(barcode: string, raw: OffRawProduct): NormalizedProduct {
  const brands = splitList(raw.brands);
  const manufacturers = [...brands, ...splitList(raw.manufacturing_places)];
  const nutrientLevels = raw.nutrient_levels ?? {};
  const nutriments = raw.nutriments ?? {};
  const novaGroup = raw.nova_group;

  return {
    barcode,
    name: raw.product_name,
    brands,
    manufacturers,
    novaGroup: novaGroup === 1 || novaGroup === 2 || novaGroup === 3 || novaGroup === 4 ? novaGroup : undefined,
    additiveTags: (raw.additives_tags ?? []).map(stripPrefix),
    ingredientsText: raw.ingredients_text,
    nutrientLevels: {
      fat: nutrientLevels.fat,
      saturatedFat: nutrientLevels['saturated-fat'],
      sugars: nutrientLevels.sugars,
      salt: nutrientLevels.salt,
    },
    nutriments: {
      fat: nutriments.fat_100g,
      saturatedFat: nutriments['saturated-fat_100g'],
      sugars: nutriments.sugars_100g,
      salt: nutriments.salt_100g,
    },
    ingredientsAnalysisTags: (raw.ingredients_analysis_tags ?? []).map(stripPrefix),
  };
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function stripPrefix(tag: string): string {
  return tag.replace(/^en:/, '');
}
