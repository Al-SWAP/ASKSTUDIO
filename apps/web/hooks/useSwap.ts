"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSwapStore } from "@/store/swapStore";
import { useWallet } from "@/hooks/useWallet";
import { getJupiterSwapTransaction } from "@askstudio/dex";
import { getRpcConnection } from "@/lib/rpcClient";
import { Transaction, VersionedTransaction } from "@solana/web3.js";

const DEBOUNCE_MS = 600;

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
      const amount = Math.floor(parseFloat(inputAmount) * Math.pow(10, inputToken.decimals));
      const res = await fetch(
        `/api/quote?inputMint=${inputToken.address}&outputMint=${outputToken.address}&amount=${amount}&slippageBps=${slippageBps}`,
        { signal: abortRef.current.signal }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Quote failed" }));
        throw new Error(err.error ?? "Quote failed");
      }

      const route = await res.json();
      const outAmount = parseFloat(route.outAmount) / Math.pow(10, outputToken.decimals);
      store.setRoute(route);
      store.setOutputAmount(outAmount.toFixed(outputToken.decimals > 6 ? 6 : outputToken.decimals));
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

      const connection = getRpcConnection("confirmed");
      const txBuffer = Buffer.from(swapData.swapTransaction, "base64");

      let tx: Transaction | VersionedTransaction;
      try {
        tx = VersionedTransaction.deserialize(txBuffer);
      } catch {
        tx = Transaction.from(txBuffer);
      }

      const sig = await sendTransaction(tx, connection, {
        maxRetries: 3,
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      store.setSwapTxSignature(sig);

      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      await connection.confirmTransaction(
        { signature: sig, lastValidBlockHeight: swapData.lastValidBlockHeight, blockhash },
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
