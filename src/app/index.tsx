import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CameraScanner } from '@/components/camera-scanner';
import { Spacing } from '@/constants/theme';
import { useScanStore } from '@/hooks/use-scan-store';
import { lookupBarcode } from '@/lib/open-food-facts';

export default function ScanScreen() {
  const router = useRouter();
  const setFound = useScanStore((state) => state.setFound);
  const setNotFound = useScanStore((state) => state.setNotFound);
  const isLoadingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleScanned(barcode: string) {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    setErrorMessage(null);

    const result = await lookupBarcode(barcode);

    if (result.status === 'found') {
      setFound(barcode, result.product);
      router.push('/results');
    } else if (result.status === 'not_found') {
      setNotFound(barcode);
      router.push('/manual-scan');
    } else {
      setErrorMessage(result.message);
    }

    isLoadingRef.current = false;
    setIsLoading(false);
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
      {isLoading && (
        <View style={[styles.loadingOverlay, styles.noPointerEvents]}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Looking up product…</Text>
        </View>
      )}
      {errorMessage && (
        <View style={[styles.errorBanner, styles.noPointerEvents]}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
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
  loadingOverlay: {
    position: 'absolute',
    bottom: Spacing.six,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  errorBanner: {
    position: 'absolute',
    bottom: Spacing.six,
    left: Spacing.four,
    right: Spacing.four,
    backgroundColor: 'rgba(229,72,77,0.9)',
    borderRadius: Spacing.two,
    padding: Spacing.three,
  },
  errorText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
