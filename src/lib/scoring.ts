import { additivePoints, hasHighConcernAdditive } from './additives';
import { detectFlavouring, detectRefinedOils, detectRefinedSugars, type FlavouringSignal } from './ingredient-heuristics';
import { bandFromGramsPer100g, offLevelToBand } from './nutrient-levels';
import type { Band, MetricResult, NormalizedProduct, NutrientKey, ScoreResult } from './types';

const NUTRIENT_LABELS: Record<NutrientKey, string> = {
  fat: 'Fat',
  saturatedFat: 'Saturates',
  sugars: 'Sugars',
  salt: 'Salt',
};

const NUTRIENT_MAX_POINTS = 10;
const NOVA_MAX_POINTS = 25;
const ADDITIVES_MAX_POINTS = 15;
const SUGAR_MAX_POINTS = 7;
const FLAVOURING_MAX_POINTS = 7;
const OIL_MAX_POINTS = 6;

function unknownMetric(key: string, label: string, maxPoints: number, detail: string): MetricResult {
  return { key, label, band: 'unknown', points: Math.round(maxPoints / 2), maxPoints, detail };
}

function nutrientMetric(key: NutrientKey, product: NormalizedProduct): MetricResult {
  const label = NUTRIENT_LABELS[key];
  const level = product.nutrientLevels[key];
  const grams = product.nutriments[key];

  const band: Band | undefined = offLevelToBand(level) ?? (grams !== undefined ? bandFromGramsPer100g(key, grams) : undefined);

  if (!band) {
    return unknownMetric(key, label, NUTRIENT_MAX_POINTS, 'Not available for this product.');
  }

  const points = band === 'green' ? NUTRIENT_MAX_POINTS : band === 'amber' ? NUTRIENT_MAX_POINTS / 2 : 0;
  const detail =
    grams !== undefined
      ? `${grams}g per 100g (${band === 'green' ? 'low' : band === 'amber' ? 'moderate' : 'high'})`
      : `${band === 'green' ? 'Low' : band === 'amber' ? 'Moderate' : 'High'}`;

  return { key, label, band, points, maxPoints: NUTRIENT_MAX_POINTS, detail };
}

function processingMetric(product: NormalizedProduct): MetricResult {
  const group = product.novaGroup;
  if (!group) {
    return unknownMetric('processing', 'Level of processing', NOVA_MAX_POINTS, 'Processing level unknown.');
  }
  const pointsByGroup: Record<1 | 2 | 3 | 4, number> = { 1: 25, 2: 17, 3: 8, 4: 0 };
  const band: Band = group <= 2 ? 'green' : group === 3 ? 'amber' : 'red';
  const labelByGroup: Record<1 | 2 | 3 | 4, string> = {
    1: 'Unprocessed or minimally processed',
    2: 'Processed culinary ingredient',
    3: 'Processed food',
    4: 'Ultra-processed food',
  };
  return {
    key: 'processing',
    label: 'Level of processing',
    band,
    points: pointsByGroup[group],
    maxPoints: NOVA_MAX_POINTS,
    detail: `NOVA group ${group} — ${labelByGroup[group]}`,
  };
}

function additivesMetric(product: NormalizedProduct): MetricResult {
  const tags = product.additiveTags;
  const band: Band = tags.length === 0 ? 'green' : hasHighConcernAdditive(tags) || tags.length >= 4 ? 'red' : 'amber';
  return {
    key: 'additives',
    label: 'Additives',
    band,
    points: additivePoints(tags, ADDITIVES_MAX_POINTS),
    maxPoints: ADDITIVES_MAX_POINTS,
    detail: tags.length === 0 ? 'No additives detected' : `${tags.length} additive${tags.length === 1 ? '' : 's'} detected`,
  };
}

function refinedSugarsMetric(product: NormalizedProduct): MetricResult {
  if (product.ingredientsText === undefined) {
    return unknownMetric('refinedSugars', 'Refined sugars', SUGAR_MAX_POINTS, 'Ingredients not available.');
  }
  const matches = detectRefinedSugars(product.ingredientsText);
  const band: Band = matches.length === 0 ? 'green' : matches.length <= 2 ? 'amber' : 'red';
  const points = Math.max(0, Math.round(SUGAR_MAX_POINTS - matches.length * 1.5));
  return {
    key: 'refinedSugars',
    label: 'Refined sugars',
    band,
    points,
    maxPoints: SUGAR_MAX_POINTS,
    detail: matches.length === 0 ? 'No refined sugars detected' : `Found: ${[...new Set(matches)].join(', ')}`,
  };
}

const FLAVOURING_BY_SIGNAL: Record<FlavouringSignal, { band: Band; points: number; detail: string }> = {
  none: { band: 'green', points: FLAVOURING_MAX_POINTS, detail: 'No flavouring detected' },
  generic: { band: 'amber', points: FLAVOURING_MAX_POINTS - 2, detail: 'Flavouring present' },
  artificial: { band: 'amber', points: FLAVOURING_MAX_POINTS - 3, detail: 'Artificial flavouring present' },
  natural: { band: 'red', points: FLAVOURING_MAX_POINTS - 4, detail: 'Natural flavouring present' },
};

function flavouringMetric(product: NormalizedProduct): MetricResult {
  if (product.ingredientsText === undefined) {
    return unknownMetric('flavouring', 'Natural/artificial flavouring', FLAVOURING_MAX_POINTS, 'Ingredients not available.');
  }
  const signal = detectFlavouring(product.ingredientsText);
  const { band, points, detail } = FLAVOURING_BY_SIGNAL[signal];

  return {
    key: 'flavouring',
    label: 'Natural/artificial flavouring',
    band,
    points: Math.max(0, points),
    maxPoints: FLAVOURING_MAX_POINTS,
    detail,
  };
}

function refinedOilsMetric(product: NormalizedProduct): MetricResult {
  if (product.ingredientsText === undefined) {
    return unknownMetric('refinedOils', 'Refined oils', OIL_MAX_POINTS, 'Ingredients not available.');
  }
  const matches = detectRefinedOils(product.ingredientsText, product.ingredientsAnalysisTags);
  const band: Band = matches.length === 0 ? 'green' : matches.length === 1 ? 'amber' : 'red';
  const points = Math.max(0, OIL_MAX_POINTS - matches.length * 2);
  return {
    key: 'refinedOils',
    label: 'Refined oils',
    band,
    points,
    maxPoints: OIL_MAX_POINTS,
    detail: matches.length === 0 ? 'No refined oils detected' : `Found: ${[...new Set(matches)].join(', ')}`,
  };
}

function overallBand(total: number): Band {
  if (total >= 70) return 'green';
  if (total >= 50) return 'amber';
  return 'red';
}

export function scoreProduct(product: NormalizedProduct): ScoreResult {
  const metrics: MetricResult[] = [
    nutrientMetric('fat', product),
    nutrientMetric('saturatedFat', product),
    nutrientMetric('sugars', product),
    nutrientMetric('salt', product),
    processingMetric(product),
    additivesMetric(product),
    refinedSugarsMetric(product),
    flavouringMetric(product),
    refinedOilsMetric(product),
  ];

  const total = Math.round(metrics.reduce((sum, m) => sum + m.points, 0));

  return { total, band: overallBand(total), metrics };
}
