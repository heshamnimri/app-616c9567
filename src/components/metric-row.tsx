import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BandColors } from '@/constants/band-colors';
import { Spacing } from '@/constants/theme';
import type { MetricResult } from '@/lib/types';

export interface MetricRowProps {
  metric: MetricResult;
}

export function MetricRow({ metric }: MetricRowProps) {
  const colors = BandColors[metric.band];
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: colors.background }]} />
      <View style={styles.textContainer}>
        <ThemedText type="smallBold">{metric.label}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {metric.detail}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: Spacing.half,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.half,
  },
});
