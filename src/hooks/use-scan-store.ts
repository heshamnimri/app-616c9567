import { create } from 'zustand';

import { buildManualProduct } from '@/lib/manual-product';
import { checkBoycott } from '@/lib/boycott';
import { scoreProduct } from '@/lib/scoring';
import type { BoycottResult, NormalizedProduct, ScoreResult } from '@/lib/types';

export type ScanStatus = 'idle' | 'found' | 'not_found' | 'error';

interface ScanState {
  status: ScanStatus;
  barcode?: string;
  product?: NormalizedProduct;
  score?: ScoreResult;
  boycott?: BoycottResult;
  errorMessage?: string;
  setFound: (barcode: string, product: NormalizedProduct) => void;
  setNotFound: (barcode: string) => void;
  setError: (barcode: string, message: string) => void;
  setManualProduct: (ingredientsText: string, manufacturerText: string) => void;
  reset: () => void;
}

const emptyResult = {
  product: undefined,
  score: undefined,
  boycott: undefined,
  errorMessage: undefined,
};

export const useScanStore = create<ScanState>((set) => ({
  status: 'idle',

  setFound: (barcode, product) =>
    set({
      status: 'found',
      barcode,
      product,
      score: scoreProduct(product),
      boycott: checkBoycott(product.brands, product.manufacturers),
      errorMessage: undefined,
    }),

  setNotFound: (barcode) => set({ status: 'not_found', barcode, ...emptyResult }),

  setError: (barcode, message) => set({ status: 'error', barcode, ...emptyResult, errorMessage: message }),

  setManualProduct: (ingredientsText, manufacturerText) => {
    const product = buildManualProduct(ingredientsText, manufacturerText);
    set({
      status: 'found',
      product,
      score: scoreProduct(product),
      boycott: checkBoycott(product.brands, product.manufacturers),
      errorMessage: undefined,
    });
  },

  reset: () => set({ status: 'idle', barcode: undefined, ...emptyResult }),
}));
