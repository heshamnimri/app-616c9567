export type Band = 'green' | 'amber' | 'red' | 'unknown';

export type NutrientKey = 'fat' | 'saturatedFat' | 'sugars' | 'salt';

export interface NormalizedProduct {
  barcode?: string;
  name?: string;
  /** Consumer-facing brand names, e.g. ["Coca-Cola"] */
  brands: string[];
  /** Brands plus manufacturing places, checked against the boycott dataset */
  manufacturers: string[];
  novaGroup?: 1 | 2 | 3 | 4;
  /** E-number tags without the "en:" prefix, e.g. ["e171", "e322"] */
  additiveTags: string[];
  ingredientsText?: string;
  nutrientLevels: Partial<Record<NutrientKey, 'low' | 'moderate' | 'high'>>;
  /** Grams per 100g */
  nutriments: Partial<Record<NutrientKey, number>>;
  /** e.g. ["palm-oil", "vegan"] without the "en:" prefix */
  ingredientsAnalysisTags: string[];
}

export interface MetricResult {
  key: string;
  label: string;
  band: Band;
  points: number;
  maxPoints: number;
  detail: string;
}

export interface ScoreResult {
  total: number;
  band: Band;
  metrics: MetricResult[];
}

export type BoycottStatus = 'boycotted' | 'clear' | 'unknown';

export interface BoycottResult {
  /**
   * 'boycotted' — brand/company matched an "avoid" entry.
   * 'clear' — matched a known non-avoid entry.
   * 'unknown' — no matching entry in the dataset, so its status can't be determined.
   */
  status: BoycottStatus;
  matchedName?: string;
  matchType?: 'brand' | 'company';
  reasons?: string[];
}
