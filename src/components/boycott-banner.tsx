import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BandColors } from '@/constants/band-colors';
import { Spacing } from '@/constants/theme';
import type { BoycottStatus } from '@/lib/types';

export interface BoycottBannerProps {
  status: BoycottStatus;
  matchedName?: string;
}

export function BoycottBanner({ status, matchedName }: BoycottBannerProps) {
  const colors =
    status === 'boycotted' ? BandColors.red : status === 'clear' ? BandColors.green : BandColors.unknown;

  const label =
    status === 'boycotted'
      ? `Boycott${matchedName ? ` — ${matchedName}` : ''}`
      : status === 'clear'
        ? 'Not on the boycott list'
        : 'Unknown boycott status';

  return (
    <View style={[styles.banner, { backgroundColor: colors.background }]}>
      <ThemedText type="smallBold" style={{ color: colors.foreground }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
});
