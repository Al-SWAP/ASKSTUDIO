import { create } from "zustand";
import type { Token } from "@askstudio/tokens";
import type { SwapRoute } from "@askstudio/dex";
import { DEFAULT_SLIPPAGE_BPS } from "@askstudio/config";

interface SwapState {
  inputToken: Token | null;
  outputToken: Token | null;
  inputAmount: string;
  slippageBps: number;
  route: SwapRoute | null;
  isLoadingQuote: boolean;
  isSwapping: boolean;
  error: string | null;
  txSignature: string | null;

  setInputToken: (token: Token | null) => void;
  setOutputToken: (token: Token | null) => void;
  setInputAmount: (amount: string) => void;
  setSlippageBps: (bps: number) => void;
  setRoute: (route: SwapRoute | null) => void;
  setLoadingQuote: (loading: boolean) => void;
  setSwapping: (swapping: boolean) => void;
  setError: (error: string | null) => void;
  setTxSignature: (sig: string | null) => void;
  swapTokens: () => void;
  reset: () => void;
}

export const useSwapStore = create<SwapState>((set, get) => ({
  inputToken: null,
  outputToken: null,
  inputAmount: "",
  slippageBps: DEFAULT_SLIPPAGE_BPS,
  route: null,
  isLoadingQuote: false,
  isSwapping: false,
  error: null,
  txSignature: null,

  setInputToken: (token) => set({ inputToken: token, route: null }),
  setOutputToken: (token) => set({ outputToken: token, route: null }),
  setInputAmount: (amount) => set({ inputAmount: amount, route: null }),
  setSlippageBps: (bps) => set({ slippageBps: bps }),
  setRoute: (route) => set({ route }),
  setLoadingQuote: (loading) => set({ isLoadingQuote: loading }),
  setSwapping: (swapping) => set({ isSwapping: swapping }),
  setError: (error) => set({ error }),
  setTxSignature: (sig) => set({ txSignature: sig }),

  swapTokens: () => {
    const { inputToken, outputToken, inputAmount } = get();
    set({
      inputToken: outputToken,
      outputToken: inputToken,
      inputAmount: "",
      route: null,
    });
  },

  reset: () =>
    set({
      route: null,
      error: null,
      txSignature: null,
      isLoadingQuote: false,
      isSwapping: false,
    }),
}));
