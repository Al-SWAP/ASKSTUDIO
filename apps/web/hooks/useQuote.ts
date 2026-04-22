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
    setIsLoadingQuote,
    setQuoteError,
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

    setIsLoadingQuote(true);
    setQuoteError(null);

    const start = performance.now();

    try {
      const decimals = inputToken.decimals ?? 9;
      // Use BigInt-based fixed-point arithmetic to avoid float precision loss for
      // u64-scale lamport amounts (parseFloat * 10^decimals can exceed MAX_SAFE_INTEGER).
      const [whole, frac = ""] = inputAmount.split(".");
      const fracTrimmed = frac.slice(0, decimals).padEnd(decimals, "0");
      const amountLamportsBig =
        BigInt(whole || "0") * (10n ** BigInt(decimals)) + BigInt(fracTrimmed);
      if (amountLamportsBig <= 0n) {
        setRoute(null);
        setLatencyMs(undefined);
        return;
      }

      const params = new URLSearchParams({
        inputMint: inputToken.address,
        outputMint: outputToken.address,
        amount: amountLamportsBig.toString(),
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
      setQuoteError(err instanceof Error ? err.message : "Quote failed");
      setRoute(null);
      setLatencyMs(undefined);
    } finally {
      setIsLoadingQuote(false);
    }
  }, [inputToken, outputToken, inputAmount, slippageBps, setRoute, setIsLoadingQuote, setQuoteError]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchQuote, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      // Abort any in-flight fetch so state updates don't run after unmount.
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchQuote]);

  return { refresh: fetchQuote, latencyMs };
}
