import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
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

export const useSwapStore = create<SwapState & SwapActions>()(
  immer((set) => ({
    ...initialState,
    setInputToken: (token) => set((s) => { s.inputToken = token; s.route = null; s.outputAmount = ""; }),
    setOutputToken: (token) => set((s) => { s.outputToken = token; s.route = null; s.outputAmount = ""; }),
    setInputAmount: (amount) => set((s) => { s.inputAmount = amount; }),
    setOutputAmount: (amount) => set((s) => { s.outputAmount = amount; }),
    setSlippageBps: (bps) => set((s) => { s.slippageBps = bps; }),
    setRoute: (route) => set((s) => { s.route = route; }),
    setIsLoadingQuote: (loading) => set((s) => { s.isLoadingQuote = loading; }),
    setQuoteError: (error) => set((s) => { s.quoteError = error; }),
    setIsSwapping: (swapping) => set((s) => { s.isSwapping = swapping; }),
    setSwapError: (error) => set((s) => { s.swapError = error; }),
    setSwapTxSignature: (sig) => set((s) => { s.swapTxSignature = sig; }),
    flipTokens: () =>
      set((s) => {
        const tmp = s.inputToken;
        s.inputToken = s.outputToken;
        s.outputToken = tmp;
        s.inputAmount = s.outputAmount;
        s.outputAmount = "";
        s.route = null;
      }),
    reset: () => set(() => ({ ...initialState })),
  }))
);
