import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BoycottBanner } from '@/components/boycott-banner';
import { MetricRow } from '@/components/metric-row';
import { ScoreGauge } from '@/components/score-gauge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useScanStore } from '@/hooks/use-scan-store';

export default function ResultsScreen() {
  const router = useRouter();
  const product = useScanStore((state) => state.product);
  const score = useScanStore((state) => state.score);
  const boycott = useScanStore((state) => state.boycott);
  const reset = useScanStore((state) => state.reset);

  function handleScanAgain() {
    reset();
    router.replace('/');
  }

  if (!product || !score || !boycott) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText type="subtitle" style={styles.centerText}>
          No scan data yet
        </ThemedText>
        <Pressable onPress={handleScanAgain} style={styles.button}>
          <ThemedText type="linkPrimary">Scan a product</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <BoycottBanner isBoycotted={boycott.isBoycotted} matchedName={boycott.matchedName} />

        <View style={styles.scoreSection}>
          <ScoreGauge total={score.total} band={score.band} />
          {product.name && (
            <ThemedText type="subtitle" style={styles.centerText}>
              {product.name}
            </ThemedText>
          )}
          {product.brands.length > 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              {product.brands.join(', ')}
            </ThemedText>
          )}
        </View>

        <ThemedView type="backgroundElement" style={styles.metricsSection}>
          {score.metrics.map((metric) => (
            <MetricRow key={metric.key} metric={metric} />
          ))}
        </ThemedView>

        <Pressable onPress={handleScanAgain} style={styles.button}>
          <ThemedText type="linkPrimary">Scan another product</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  centerText: {
    textAlign: 'center',
  },
  scoreSection: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  metricsSection: {
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  button: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
});
