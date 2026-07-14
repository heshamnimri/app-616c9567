export async function recognizeText(_imageUri: string): Promise<string> {
  throw new Error(
    'OCR is only implemented for web in this build. Native OCR (e.g. ML Kit text recognition) is a planned follow-up for the iOS/Android build.',
  );
}
