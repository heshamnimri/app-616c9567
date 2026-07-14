import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export interface CameraScannerProps {
  /** Called on every detected frame — the caller is responsible for debouncing/ignoring repeats. */
  onScanned: (barcode: string) => void;
}

const ZXING_FORMAT_NAMES = ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'CODE_128'] as const;
const NATIVE_DETECTOR_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'];

export function CameraScanner({ onScanned }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onScannedRef = useRef(onScanned);

  useEffect(() => {
    onScannedRef.current = onScanned;
  }, [onScanned]);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | undefined;
    let rafId: number | undefined;
    let scannerControls: { stop: () => void } | undefined;

    function handleCode(code: string) {
      onScannedRef.current(code);
    }

    async function start() {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setError('Camera is not available in this browser.');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      } catch {
        setError('Camera access was denied.');
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      const DetectorCtor = (globalThis as { BarcodeDetector?: typeof BarcodeDetector }).BarcodeDetector;

      if (DetectorCtor) {
        const detector = new DetectorCtor({ formats: NATIVE_DETECTOR_FORMATS });
        const tick = async () => {
          if (cancelled) return;
          try {
            const codes = await detector.detect(video);
            if (codes.length > 0) handleCode(codes[0].rawValue);
          } catch {
            // Transient decode failures between frames are expected; ignore and keep scanning.
          }
          rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return;
      }

      // Safari/Firefox don't support BarcodeDetector — fall back to ZXing.
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const { BarcodeFormat } = await import('@zxing/library');
      const reader = new BrowserMultiFormatReader();
      reader.possibleFormats = ZXING_FORMAT_NAMES.map((name) => BarcodeFormat[name]);
      if (cancelled) return;
      scannerControls = await reader.decodeFromVideoElement(video, (result) => {
        if (result) handleCode(result.getText());
      });
    }

    start();

    return () => {
      cancelled = true;
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      scannerControls?.stop();
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  if (error) {
    return (
      <View style={styles.centered}>
        <ThemedText type="subtitle" style={styles.message}>
          {error}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <video ref={videoRef} muted playsInline style={videoStyle} />
    </View>
  );
}

const videoStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

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
});
