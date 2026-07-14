import type { Band, NutrientKey } from './types';

/**
 * UK FSA front-of-pack traffic-light thresholds (grams per 100g).
 * Used only when Open Food Facts hasn't already computed nutrient_levels for a product.
 */
const THRESHOLDS: Record<NutrientKey, { low: number; medium: number }> = {
  fat: { low: 3, medium: 17.5 },
  saturatedFat: { low: 1.5, medium: 5 },
  sugars: { low: 5, medium: 22.5 },
  salt: { low: 0.3, medium: 1.5 },
};

export function bandFromGramsPer100g(key: NutrientKey, grams: number): Band {
  const { low, medium } = THRESHOLDS[key];
  if (grams <= low) return 'green';
  if (grams <= medium) return 'amber';
  return 'red';
}

export function offLevelToBand(level: 'low' | 'moderate' | 'high' | undefined): Band | undefined {
  if (level === 'low') return 'green';
  if (level === 'moderate') return 'amber';
  if (level === 'high') return 'red';
  return undefined;
}
