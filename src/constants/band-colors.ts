import type { Band } from '@/lib/types';

/**
 * Fixed (not light/dark adaptive) traffic-light colours, matching the convention used by
 * front-of-pack nutrition labelling and apps like Yuka — the badge colour stays the same
 * regardless of the app's own theme.
 */
export const BandColors: Record<Band, { background: string; foreground: string }> = {
  green: { background: '#1FA97F', foreground: '#FFFFFF' },
  amber: { background: '#F5A623', foreground: '#1A1A1A' },
  red: { background: '#E5484D', foreground: '#FFFFFF' },
  unknown: { background: '#9AA0A6', foreground: '#FFFFFF' },
};
