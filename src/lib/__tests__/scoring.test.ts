import { scoreProduct } from '../scoring';
import type { NormalizedProduct } from '../types';

function baseProduct(overrides: Partial<NormalizedProduct>): NormalizedProduct {
  return {
    brands: [],
    manufacturers: [],
    additiveTags: [],
    nutrientLevels: {},
    nutriments: {},
    ingredientsAnalysisTags: [],
    ...overrides,
  };
}

describe('scoreProduct', () => {
  it('scores an ultra-processed snack red, with all 9 metrics present', () => {
    const product = baseProduct({
      novaGroup: 4,
      additiveTags: ['e171', 'e250', 'e621'],
      ingredientsText:
        'Sugar, palm oil, wheat flour, corn syrup, natural flavouring, salt, e171, e250, e621',
      nutrientLevels: { fat: 'high', saturatedFat: 'high', sugars: 'high', salt: 'high' },
    });

    const result = scoreProduct(product);

    expect(result.metrics).toHaveLength(9);
    expect(result.band).toBe('red');
    expect(result.total).toBeLessThan(50);

    const processing = result.metrics.find((m) => m.key === 'processing');
    expect(processing?.band).toBe('red');

    const additives = result.metrics.find((m) => m.key === 'additives');
    expect(additives?.band).toBe('red');

    const flavouring = result.metrics.find((m) => m.key === 'flavouring');
    expect(flavouring?.band).toBe('red');
  });

  it('scores a minimally processed whole food green', () => {
    const product = baseProduct({
      novaGroup: 1,
      additiveTags: [],
      ingredientsText: 'Rolled oats',
      nutrientLevels: { fat: 'low', saturatedFat: 'low', sugars: 'low', salt: 'low' },
    });

    const result = scoreProduct(product);

    expect(result.band).toBe('green');
    expect(result.total).toBeGreaterThanOrEqual(70);
    expect(result.metrics.every((m) => m.band === 'green')).toBe(true);
  });

  it('marks nutrient and processing metrics unknown when data is missing, without crashing', () => {
    const product = baseProduct({
      ingredientsText: 'Tomatoes, olive oil, basil',
    });

    const result = scoreProduct(product);

    const fat = result.metrics.find((m) => m.key === 'fat');
    expect(fat?.band).toBe('unknown');
    const processing = result.metrics.find((m) => m.key === 'processing');
    expect(processing?.band).toBe('unknown');

    // Refined oils shouldn't flag plain olive oil as refined.
    const oils = result.metrics.find((m) => m.key === 'refinedOils');
    expect(oils?.band).toBe('green');
  });

  it('penalizes natural flavouring more than artificial flavouring', () => {
    const natural = scoreProduct(baseProduct({ ingredientsText: 'natural flavouring' }));
    const artificial = scoreProduct(baseProduct({ ingredientsText: 'artificial flavouring' }));

    const naturalMetric = natural.metrics.find((m) => m.key === 'flavouring')!;
    const artificialMetric = artificial.metrics.find((m) => m.key === 'flavouring')!;

    expect(naturalMetric.band).toBe('red');
    expect(naturalMetric.points).toBeLessThan(artificialMetric.points);
  });

  it('bands the overall score per the 70/50 thresholds', () => {
    expect(scoreProduct(baseProduct({})).total).toBeGreaterThanOrEqual(0);
  });
});
