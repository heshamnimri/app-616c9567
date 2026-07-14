import { extractAdditiveCodes } from './ingredient-heuristics';
import type { NormalizedProduct } from './types';

/**
 * Builds a partial NormalizedProduct from OCR'd photos when a barcode isn't found. Nutrition
 * facts (fat/saturates/sugars/salt) and NOVA processing group aren't derivable from an
 * ingredients-list + manufacturer photo alone, so those stay unset and the scoring engine
 * reports them as "unknown" rather than guessing.
 */
export function buildManualProduct(ingredientsText: string, manufacturerText: string): NormalizedProduct {
  const manufacturer = manufacturerText.trim();
  return {
    brands: manufacturer ? [manufacturer] : [],
    manufacturers: manufacturer ? [manufacturer] : [],
    additiveTags: extractAdditiveCodes(ingredientsText),
    ingredientsText,
    nutrientLevels: {},
    nutriments: {},
    ingredientsAnalysisTags: [],
  };
}
