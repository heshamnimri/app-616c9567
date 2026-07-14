import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export interface ScanLoaderProps {
  message: string;
}

/** App brand blue (matches the splash screen in app.json) used as the spinner accent. */
const ACCENT = '#208AEF';
const TRACK = 'rgba(32,138,239,0.18)';

export function ScanLoader({ message }: ScanLoaderProps) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const pulsing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    rotation.start();
    pulsing.start();
    return () => {
      rotation.stop();
      pulsing.stop();
    };
  }, [spin, pulse]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const dotOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <View style={styles.container}>
      <View style={styles.ringWrap}>
        <Animated.View style={[styles.ring, { transform: [{ rotate }] }]} />
        <Animated.View style={[styles.dot, { opacity: dotOpacity }]} />
      </View>
      <ThemedText type="subtitle" style={styles.message}>
        {message}
      </ThemedText>
    </View>
  );
}

const RING_SIZE = 76;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 5,
    borderColor: TRACK,
    borderTopColor: ACCENT,
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ACCENT,
  },
  message: {
    textAlign: 'center',
  },
});
