import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BandColors } from '@/constants/band-colors';
import { Spacing } from '@/constants/theme';

export interface BoycottBannerProps {
  isBoycotted: boolean;
  matchedName?: string;
}

export function BoycottBanner({ isBoycotted, matchedName }: BoycottBannerProps) {
  const colors = isBoycotted ? BandColors.red : BandColors.green;
  const label = isBoycotted ? `Boycott${matchedName ? ` — ${matchedName}` : ''}` : 'Not on the boycott list';

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
