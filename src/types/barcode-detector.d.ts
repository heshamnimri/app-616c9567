// Minimal ambient typing for the browser Shape Detection API's BarcodeDetector, which
// TypeScript's bundled DOM lib doesn't declare yet. Chromium-only (caniuse: mdn-api_barcodedetector).
interface BarcodeDetectorOptions {
  formats: string[];
}

interface DetectedBarcode {
  rawValue: string;
  format: string;
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions);
  static getSupportedFormats(): Promise<string[]>;
  detect(image: CanvasImageSource): Promise<DetectedBarcode[]>;
}
