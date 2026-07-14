import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { PhotoCapture } from '@/components/photo-capture';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useScanStore } from '@/hooks/use-scan-store';
import { useTheme } from '@/hooks/use-theme';
import { recognizeText } from '@/lib/ocr';

type Step = 'ingredients-photo' | 'ingredients-edit' | 'manufacturer-photo' | 'manufacturer-edit';

export default function ManualScanScreen() {
  const router = useRouter();
  const theme = useTheme();
  const setManualProduct = useScanStore((state) => state.setManualProduct);

  const [step, setStep] = useState<Step>('ingredients-photo');
  const [ingredientsText, setIngredientsText] = useState('');
  const [manufacturerText, setManufacturerText] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);

  async function handleIngredientsCapture(uri: string) {
    setIsRecognizing(true);
    try {
      setIngredientsText(await recognizeText(uri));
    } catch {
      setIngredientsText('');
    } finally {
      setIsRecognizing(false);
      setStep('ingredients-edit');
    }
  }

  async function handleManufacturerCapture(uri: string) {
    setIsRecognizing(true);
    try {
      setManufacturerText(await recognizeText(uri));
    } catch {
      setManufacturerText('');
    } finally {
      setIsRecognizing(false);
      setStep('manufacturer-edit');
    }
  }

  function handleAnalyze() {
    setManualProduct(ingredientsText, manufacturerText);
    router.replace('/results');
  }

  if (isRecognizing) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText type="subtitle" style={styles.centerText}>
          Reading text from photo…
        </ThemedText>
      </ThemedView>
    );
  }

  if (step === 'ingredients-photo') {
    return (
      <View style={styles.container}>
        <View style={styles.instructionBanner}>
          <ThemedText type="smallBold" style={styles.centerText}>
            Barcode not found. Take a clear photo of the ingredients list.
          </ThemedText>
        </View>
        <PhotoCapture label="Capture ingredients list" onCapture={handleIngredientsCapture} />
      </View>
    );
  }

  if (step === 'ingredients-edit') {
    return (
      <ThemedView style={styles.editContainer}>
        <ThemedText type="smallBold">Review the ingredients text</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Correct any mistakes from the photo scan before continuing.
        </ThemedText>
        <TextInput
          value={ingredientsText}
          onChangeText={setIngredientsText}
          multiline
          style={[styles.textInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
          placeholder="Ingredients text…"
          placeholderTextColor={theme.textSecondary}
        />
        <Pressable onPress={() => setStep('manufacturer-photo')} style={styles.button}>
          <ThemedText type="linkPrimary">Next: manufacturer photo</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (step === 'manufacturer-photo') {
    return (
      <View style={styles.container}>
        <View style={styles.instructionBanner}>
          <ThemedText type="smallBold" style={styles.centerText}>
            Now take a photo of the manufacturer or company name.
          </ThemedText>
        </View>
        <PhotoCapture label="Capture manufacturer name" onCapture={handleManufacturerCapture} />
      </View>
    );
  }

  return (
    <ThemedView style={styles.editContainer}>
      <ThemedText type="smallBold">Review the manufacturer name</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Correct any mistakes from the photo scan before analyzing.
      </ThemedText>
      <TextInput
        value={manufacturerText}
        onChangeText={setManufacturerText}
        style={[styles.textInput, styles.singleLineInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
        placeholder="Manufacturer or company name…"
        placeholderTextColor={theme.textSecondary}
      />
      <Pressable onPress={handleAnalyze} style={styles.button}>
        <ThemedText type="linkPrimary">Analyze</ThemedText>
      </Pressable>
    </ThemedView>
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
  },
  centerText: {
    textAlign: 'center',
  },
  instructionBanner: {
    padding: Spacing.three,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  editContainer: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    minHeight: 160,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  singleLineInput: {
    minHeight: 48,
    textAlignVertical: 'center',
  },
  button: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});
