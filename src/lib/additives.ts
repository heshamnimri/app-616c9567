export type AdditiveTier = 'high' | 'moderate' | 'low';

interface AdditiveInfo {
  name: string;
  tier: AdditiveTier;
}

/**
 * Curated risk tiers for common food additive E-numbers, informed by EFSA re-evaluations,
 * France's ANSES risk categorisation, the Southampton study on artificial colours, and
 * IARC/regulatory actions (e.g. EU's 2022 ban on titanium dioxide as a food additive).
 * Not exhaustive — additives absent from this table fall back to a small generic penalty.
 */
const ADDITIVE_TABLE: Record<string, AdditiveInfo> = {
  // Colours flagged by the Southampton study / banned or restricted in some jurisdictions
  e102: { name: 'Tartrazine', tier: 'high' },
  e104: { name: 'Quinoline Yellow', tier: 'high' },
  e110: { name: 'Sunset Yellow FCF', tier: 'high' },
  e122: { name: 'Carmoisine', tier: 'high' },
  e124: { name: 'Ponceau 4R', tier: 'high' },
  e129: { name: 'Allura Red AC', tier: 'high' },
  e128: { name: 'Red 2G', tier: 'high' },
  e171: { name: 'Titanium Dioxide', tier: 'high' },
  e173: { name: 'Aluminium', tier: 'moderate' },
  e150c: { name: 'Ammonia Caramel', tier: 'moderate' },
  e150d: { name: 'Sulphite Ammonia Caramel', tier: 'high' },
  e150a: { name: 'Plain Caramel', tier: 'low' },
  e150b: { name: 'Caustic Sulphite Caramel', tier: 'moderate' },

  // Preservatives of concern
  e249: { name: 'Potassium Nitrite', tier: 'high' },
  e250: { name: 'Sodium Nitrite', tier: 'high' },
  e251: { name: 'Sodium Nitrate', tier: 'high' },
  e252: { name: 'Potassium Nitrate', tier: 'high' },
  e211: { name: 'Sodium Benzoate', tier: 'moderate' },
  e220: { name: 'Sulphur Dioxide', tier: 'moderate' },
  e221: { name: 'Sodium Sulphite', tier: 'moderate' },
  e223: { name: 'Sodium Metabisulphite', tier: 'moderate' },
  e224: { name: 'Potassium Metabisulphite', tier: 'moderate' },
  e200: { name: 'Sorbic Acid', tier: 'low' },
  e202: { name: 'Potassium Sorbate', tier: 'low' },

  // Antioxidants of concern
  e320: { name: 'BHA', tier: 'high' },
  e321: { name: 'BHT', tier: 'high' },

  // Emulsifiers / thickeners with emerging gut-health concerns
  e407: { name: 'Carrageenan', tier: 'moderate' },
  e466: { name: 'Carboxymethyl Cellulose', tier: 'moderate' },
  e433: { name: 'Polysorbate 80', tier: 'moderate' },
  e322: { name: 'Lecithin', tier: 'low' },
  e412: { name: 'Guar Gum', tier: 'low' },
  e415: { name: 'Xanthan Gum', tier: 'low' },
  e440: { name: 'Pectin', tier: 'low' },
  e401: { name: 'Sodium Alginate', tier: 'low' },

  // Phosphates — excess intake linked to cardiovascular/kidney concerns
  e338: { name: 'Phosphoric Acid', tier: 'moderate' },
  e339: { name: 'Sodium Phosphates', tier: 'moderate' },
  e340: { name: 'Potassium Phosphates', tier: 'moderate' },
  e341: { name: 'Calcium Phosphates', tier: 'moderate' },
  e450: { name: 'Diphosphates', tier: 'moderate' },
  e451: { name: 'Triphosphates', tier: 'moderate' },

  // Raising/bleaching agents banned in several jurisdictions
  e924: { name: 'Potassium Bromate', tier: 'high' },
  e927b: { name: 'Azodicarbonamide', tier: 'high' },

  // Sweeteners
  e950: { name: 'Acesulfame K', tier: 'moderate' },
  e951: { name: 'Aspartame', tier: 'high' },
  e952: { name: 'Cyclamate', tier: 'high' },
  e955: { name: 'Sucralose', tier: 'moderate' },
  e961: { name: 'Neotame', tier: 'moderate' },
  e960: { name: 'Steviol Glycosides', tier: 'low' },

  // Flavour enhancers
  e621: { name: 'Monosodium Glutamate', tier: 'moderate' },
  e627: { name: 'Disodium Guanylate', tier: 'moderate' },
  e631: { name: 'Disodium Inosinate', tier: 'moderate' },

  // Generally low-concern / naturally derived
  e100: { name: 'Curcumin', tier: 'low' },
  e160a: { name: 'Carotenes', tier: 'low' },
  e296: { name: 'Malic Acid', tier: 'low' },
  e300: { name: 'Ascorbic Acid (Vitamin C)', tier: 'low' },
  e306: { name: 'Tocopherols (Vitamin E)', tier: 'low' },
  e330: { name: 'Citric Acid', tier: 'low' },
  e500: { name: 'Sodium Carbonates', tier: 'low' },
  e501: { name: 'Potassium Carbonates', tier: 'low' },
};

const GENERIC_UNKNOWN_TIER: AdditiveTier = 'low';

export function getAdditiveInfo(tag: string): AdditiveInfo {
  const key = tag.replace(/^en:/, '').toLowerCase();
  return ADDITIVE_TABLE[key] ?? { name: key.toUpperCase(), tier: GENERIC_UNKNOWN_TIER };
}

export function hasHighConcernAdditive(tags: string[]): boolean {
  return tags.some((tag) => getAdditiveInfo(tag).tier === 'high');
}

const TIER_DEDUCTION: Record<AdditiveTier, number> = {
  high: 4,
  moderate: 2,
  low: 1,
};

export function additivePoints(tags: string[], maxPoints: number): number {
  const deduction = tags.reduce((sum, tag) => sum + TIER_DEDUCTION[getAdditiveInfo(tag).tier], 0);
  return Math.max(0, maxPoints - deduction);
}
