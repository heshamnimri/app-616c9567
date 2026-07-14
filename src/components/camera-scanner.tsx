import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export interface CameraScannerProps {
  /** Called on every detected frame — the caller is responsible for debouncing/ignoring repeats. */
  onScanned: (barcode: string) => void;
}

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] as const;

export function CameraScanner({ onScanned }: CameraScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <ThemedText type="subtitle" style={styles.message}>
          Camera access is needed to scan barcodes
        </ThemedText>
        <Pressable onPress={requestPermission} style={styles.button}>
          <ThemedText type="linkPrimary">Grant camera access</ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <CameraView
      style={styles.container}
      facing="back"
      barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
      onBarcodeScanned={(result: BarcodeScanningResult) => onScanned(result.data)}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  message: {
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
});
