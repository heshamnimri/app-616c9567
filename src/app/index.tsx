import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CameraScanner } from '@/components/camera-scanner';
import { Spacing } from '@/constants/theme';
import { useScanStore } from '@/hooks/use-scan-store';

export default function ScanScreen() {
  const router = useRouter();
  const lookup = useScanStore((state) => state.lookup);
  const scannedRef = useRef(false);

  // Re-arm the scanner every time this screen regains focus (e.g. after "Scan again").
  useFocusEffect(
    useCallback(() => {
      scannedRef.current = false;
    }, []),
  );

  function handleScanned(barcode: string) {
    if (scannedRef.current) return;
    scannedRef.current = true;
    // Kick off the lookup and hand the user straight to the results screen, which shows the
    // loading animation and then the outcome (found / item not found / error).
    lookup(barcode);
    router.push('/results');
  }

  return (
    <View style={styles.container}>
      <CameraScanner onScanned={handleScanned} />
      <View style={[styles.overlay, styles.noPointerEvents]}>
        <View style={styles.frame}>
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
        </View>
        <Text style={styles.hint}>Line up the barcode inside the box</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  noPointerEvents: {
    pointerEvents: 'none',
  },
  frame: {
    width: '78%',
    maxWidth: 420,
    aspectRatio: 1.6,
    borderRadius: Spacing.three,
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: '#ffffff',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: Spacing.three,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: Spacing.three,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: Spacing.three,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: Spacing.three,
  },
  hint: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
});
