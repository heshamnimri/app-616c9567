import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      <SafeAreaView style={[styles.overlay, styles.noPointerEvents]}>
        <Text style={styles.hint}>Point the camera at a barcode</Text>
      </SafeAreaView>
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
    alignItems: 'center',
    paddingTop: Spacing.four,
  },
  noPointerEvents: {
    pointerEvents: 'none',
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
