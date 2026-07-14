import { createWorker, type Worker } from 'tesseract.js';

let workerPromise: Promise<Worker> | undefined;

function getWorker(): Promise<Worker> {
  if (!workerPromise) workerPromise = createWorker('eng');
  return workerPromise;
}

export async function recognizeText(imageUri: string): Promise<string> {
  const worker = await getWorker();
  const {
    data: { text },
  } = await worker.recognize(imageUri);
  return text;
}
