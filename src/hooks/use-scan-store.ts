import { create } from 'zustand';

import { buildManualProduct } from '@/lib/manual-product';
import { checkBoycott } from '@/lib/boycott';
import { lookupBarcode } from '@/lib/open-food-facts';
import { scoreProduct } from '@/lib/scoring';
import type { BoycottResult, NormalizedProduct, ScoreResult } from '@/lib/types';

export type ScanStatus = 'idle' | 'loading' | 'found' | 'not_found' | 'error';

interface ScanState {
  status: ScanStatus;
  barcode?: string;
  product?: NormalizedProduct;
  score?: ScoreResult;
  boycott?: BoycottResult;
  errorMessage?: string;
  /** Sets 'loading' immediately, then resolves to found/not_found/error from Open Food Facts. */
  lookup: (barcode: string) => Promise<void>;
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

  lookup: async (barcode) => {
    set({ status: 'loading', barcode, ...emptyResult });

    const result = await lookupBarcode(barcode);

    if (result.status === 'found') {
      set({
        status: 'found',
        barcode,
        product: result.product,
        score: scoreProduct(result.product),
        boycott: checkBoycott(result.product.brands, result.product.manufacturers),
        errorMessage: undefined,
      });
    } else if (result.status === 'not_found') {
      set({ status: 'not_found', barcode, ...emptyResult });
    } else {
      set({ status: 'error', barcode, ...emptyResult, errorMessage: result.message });
    }
  },

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
