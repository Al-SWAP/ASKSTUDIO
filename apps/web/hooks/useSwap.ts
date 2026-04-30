"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSwapStore } from "@/store/swapStore";
import { useWallet } from "@/hooks/useWallet";
import { getJupiterSwapTransaction } from "@askstudio/dex";
import { getRpcConnection } from "@/lib/rpcClient";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { formatBaseUnits } from "@/lib/formatUnits";

const DEBOUNCE_MS = 600;

/** Convert a decimal string amount to base units (integer) without float precision loss.
 * Rejects scientific notation (e.g. "1e-7") and non-decimal formats to prevent silent
 * misparsing. Throws if the result exceeds Number.MAX_SAFE_INTEGER. */
function toBaseUnits(amount: string, decimals: number): number {
  // Only accept plain decimal strings (digits with optional single dot).
  if (!/^\d*\.?\d*$/.test(amount) || amount === "" || amount === ".") return 0;
  const [whole, frac = ""] = amount.split(".");
  const fracPadded = frac.padEnd(decimals, "0").slice(0, decimals);
  const combined = (whole || "0") + fracPadded;
  const trimmed = combined.replace(/^0+(?=\d)/, "") || "0";
  const result = parseInt(trimmed, 10);
  if (isNaN(result)) return 0;
  if (result > Number.MAX_SAFE_INTEGER) {
    throw new Error("Amount too large to represent safely; please reduce the input amount.");
  }
  return result;
}

/** Decode a base64 string to Uint8Array without relying on Node's Buffer polyfill. */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function useSwap() {
  const store = useSwapStore();
  const { publicKey, sendTransaction, connected } = useWallet();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchQuote = useCallback(async () => {
    const { inputToken, outputToken, inputAmount, slippageBps } = useSwapStore.getState();

    if (!inputToken || !outputToken || !inputAmount || parseFloat(inputAmount) <= 0) {
      store.setRoute(null);
      store.setOutputAmount("");
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    store.setIsLoadingQuote(true);
    store.setQuoteError(null);

    try {
      const amount = toBaseUnits(inputAmount, inputToken.decimals);
      const res = await fetch(
        `/api/quote?inputMint=${inputToken.address}&outputMint=${outputToken.address}&amount=${amount}&slippageBps=${slippageBps}`,
        { signal: abortRef.current.signal }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Quote failed" }));
        throw new Error(err.error ?? "Quote failed");
      }

      const route = await res.json();
      // Use BigInt-based formatting to avoid float precision loss on large base-unit amounts.
      store.setRoute(route);
      store.setOutputAmount(formatBaseUnits(route.outAmount, outputToken.decimals));
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        store.setQuoteError(err.message);
        store.setRoute(null);
        store.setOutputAmount("");
      }
    } finally {
      store.setIsLoadingQuote(false);
    }
  }, [store]);

  const debouncedFetchQuote = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchQuote, DEBOUNCE_MS);
  }, [fetchQuote]);

  useEffect(() => {
    debouncedFetchQuote();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    store.inputToken?.address,
    store.outputToken?.address,
    store.inputAmount,
    store.slippageBps,
    debouncedFetchQuote,
  ]);

  const executeSwap = useCallback(async () => {
    const { route } = useSwapStore.getState();
    if (!route || !publicKey || !connected) return;

    store.setIsSwapping(true);
    store.setSwapError(null);
    store.setSwapTxSignature(null);

    try {
      const swapData = await getJupiterSwapTransaction({
        quoteResponse: route,
        userPublicKey: publicKey.toBase58(),
        wrapAndUnwrapSol: true,
      });

      const connection = await getRpcConnection("confirmed");
      const txBytes = base64ToUint8Array(swapData.swapTransaction);

      let tx: Transaction | VersionedTransaction;
      let recentBlockhash: string;
      try {
        const versioned = VersionedTransaction.deserialize(txBytes);
        tx = versioned;
        recentBlockhash = versioned.message.recentBlockhash;
      } catch {
        const legacy = Transaction.from(txBytes);
        tx = legacy;
        if (!legacy.recentBlockhash) {
          throw new Error("Transaction is missing recentBlockhash; cannot confirm.");
        }
        recentBlockhash = legacy.recentBlockhash;
      }

      const sig = await sendTransaction(tx, connection, {
        maxRetries: 3,
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      store.setSwapTxSignature(sig);

      await connection.confirmTransaction(
        {
          signature: sig,
          lastValidBlockHeight: swapData.lastValidBlockHeight,
          blockhash: recentBlockhash,
        },
        "confirmed"
      );
    } catch (err: unknown) {
      store.setSwapError(err instanceof Error ? err.message : "Swap failed");
    } finally {
      store.setIsSwapping(false);
    }
  }, [publicKey, sendTransaction, connected, store]);

  return {
    ...store,
    fetchQuote,
    executeSwap,
    canSwap:
      connected &&
      !!store.inputToken &&
      !!store.outputToken &&
      !!store.inputAmount &&
      parseFloat(store.inputAmount) > 0 &&
      !!store.route &&
      !store.isSwapping,
  };
}
