import { useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export interface PhotoCaptureProps {
  label: string;
  onCapture: (uri: string) => void;
}

/**
 * Unlike continuous barcode decoding, a single still-photo capture via expo-camera works
 * reliably on web too, so this doesn't need a platform-specific override.
 */
export function PhotoCapture({ label, onCapture }: PhotoCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <ThemedText type="subtitle" style={styles.message}>
          Camera access is needed to take a photo
        </ThemedText>
        <Pressable onPress={requestPermission} style={styles.button}>
          <ThemedText type="linkPrimary">Grant camera access</ThemedText>
        </Pressable>
      </View>
    );
  }

  async function handleCapture() {
    const photo = await cameraRef.current?.takePictureAsync();
    if (photo) onCapture(photo.uri);
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      <View style={styles.controls}>
        <Pressable onPress={handleCapture} style={styles.captureButton}>
          <ThemedText type="linkPrimary">{label}</ThemedText>
        </Pressable>
      </View>
    </View>
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
  controls: {
    position: 'absolute',
    bottom: Spacing.five,
    alignSelf: 'center',
  },
  captureButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
});
