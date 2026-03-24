"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSwapStore } from "../store/swapStore";
import type { SwapRoute } from "@askstudio/dex";

const DEBOUNCE_MS = 600;

export function useQuote() {
  const {
    inputToken,
    outputToken,
    inputAmount,
    slippageBps,
    setRoute,
    setLoadingQuote,
    setError,
  } = useSwapStore();

  const [latencyMs, setLatencyMs] = useState<number | undefined>(undefined);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchQuote = useCallback(async () => {
    if (!inputToken || !outputToken || !inputAmount || parseFloat(inputAmount) <= 0) {
      setRoute(null);
      setLatencyMs(undefined);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoadingQuote(true);
    setError(null);

    const start = performance.now();

    try {
      const decimals = inputToken.decimals ?? 9;
      const amountLamports = Math.floor(parseFloat(inputAmount) * Math.pow(10, decimals));
      if (amountLamports <= 0) {
        setRoute(null);
        setLatencyMs(undefined);
        return;
      }

      const params = new URLSearchParams({
        inputMint: inputToken.address,
        outputMint: outputToken.address,
        amount: amountLamports.toString(),
        slippageBps: slippageBps.toString(),
      });

      const res = await fetch(`/api/quote?${params.toString()}`, {
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Quote failed" }));
        throw new Error(err.error ?? `Quote failed: ${res.status}`);
      }

      const route: SwapRoute = await res.json();
      setRoute(route);
      setLatencyMs(Math.round(performance.now() - start));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Quote failed");
      setRoute(null);
      setLatencyMs(undefined);
    } finally {
      setLoadingQuote(false);
    }
  }, [inputToken, outputToken, inputAmount, slippageBps, setRoute, setLoadingQuote, setError]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchQuote, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchQuote]);

  return { refresh: fetchQuote, latencyMs };
}
