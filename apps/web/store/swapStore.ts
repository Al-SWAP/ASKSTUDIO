import { create } from "zustand";
import type { Token } from "@askstudio/tokens";
import type { SwapRoute } from "@askstudio/dex";

export interface SwapState {
  inputToken: Token | null;
  outputToken: Token | null;
  inputAmount: string;
  outputAmount: string;
  slippageBps: number;
  route: SwapRoute | null;
  isLoadingQuote: boolean;
  quoteError: string | null;
  isSwapping: boolean;
  swapError: string | null;
  swapTxSignature: string | null;
}

export interface SwapActions {
  setInputToken: (token: Token | null) => void;
  setOutputToken: (token: Token | null) => void;
  setInputAmount: (amount: string) => void;
  setOutputAmount: (amount: string) => void;
  setSlippageBps: (bps: number) => void;
  setRoute: (route: SwapRoute | null) => void;
  setIsLoadingQuote: (loading: boolean) => void;
  setQuoteError: (error: string | null) => void;
  setIsSwapping: (swapping: boolean) => void;
  setSwapError: (error: string | null) => void;
  setSwapTxSignature: (sig: string | null) => void;
  flipTokens: () => void;
  reset: () => void;
}

const initialState: SwapState = {
  inputToken: null,
  outputToken: null,
  inputAmount: "",
  outputAmount: "",
  slippageBps: 50,
  route: null,
  isLoadingQuote: false,
  quoteError: null,
  isSwapping: false,
  swapError: null,
  swapTxSignature: null,
};

export const useSwapStore = create<SwapState & SwapActions>()((set, get) => ({
  ...initialState,
  setInputToken: (token) => set({ inputToken: token, route: null, outputAmount: "" }),
  setOutputToken: (token) => set({ outputToken: token, route: null, outputAmount: "" }),
  setInputAmount: (amount) => set({ inputAmount: amount }),
  setOutputAmount: (amount) => set({ outputAmount: amount }),
  setSlippageBps: (bps) => set({ slippageBps: bps }),
  setRoute: (route) => set({ route }),
  setIsLoadingQuote: (loading) => set({ isLoadingQuote: loading }),
  setQuoteError: (error) => set({ quoteError: error }),
  setIsSwapping: (swapping) => set({ isSwapping: swapping }),
  setSwapError: (error) => set({ swapError: error }),
  setSwapTxSignature: (sig) => set({ swapTxSignature: sig }),
  flipTokens: () => {
    const { inputToken, outputToken, outputAmount } = get();
    set({
      inputToken: outputToken,
      outputToken: inputToken,
      inputAmount: outputAmount,
      outputAmount: "",
      route: null,
    });
  },
  reset: () => set(initialState),
}));
