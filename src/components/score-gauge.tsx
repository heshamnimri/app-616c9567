import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BandColors } from '@/constants/band-colors';
import type { Band } from '@/lib/types';

export interface ScoreGaugeProps {
  total: number;
  band: Band;
}

export function ScoreGauge({ total, band }: ScoreGaugeProps) {
  const colors = BandColors[band];
  return (
    <View style={[styles.circle, { backgroundColor: colors.background }]}>
      <ThemedText style={[styles.score, { color: colors.foreground }]}>{total}</ThemedText>
      <ThemedText style={[styles.outOf, { color: colors.foreground }]}>/ 100</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: 56,
    fontWeight: '700',
    lineHeight: 60,
  },
  outOf: {
    fontSize: 16,
    fontWeight: '500',
  },
});
