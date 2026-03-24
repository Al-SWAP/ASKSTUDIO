"use client";

import { useCallback } from "react";
import { useWallet as useSolanaWallet, useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction, Transaction } from "@solana/web3.js";
import { useSwapStore } from "../store/swapStore";
import { recordSwap } from "@askstudio/dex";

export function useSwap() {
  const { publicKey, signTransaction, connected } = useSolanaWallet();
  const { connection } = useConnection();
  const { route, setSwapping, setError, setTxSignature } = useSwapStore();

  const executeSwap = useCallback(async () => {
    if (!connected || !publicKey || !route || !signTransaction) {
      setError("Wallet not connected or no route available");
      return;
    }

    setSwapping(true);
    setError(null);
    setTxSignature(null);

    try {
      const res = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: route,
          userPublicKey: publicKey.toBase58(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Swap build failed" }));
        throw new Error(err.error ?? `Swap failed: ${res.status}`);
      }

      const { swapTransaction, lastValidBlockHeight } = await res.json();
      if (!swapTransaction) throw new Error("No swap transaction returned");

      const txBytes = Buffer.from(swapTransaction, "base64");
      const { blockhash } = await connection.getLatestBlockhash();

      let signature: string;
      try {
        // Try versioned transaction first
        const versionedTx = VersionedTransaction.deserialize(txBytes);
        const signed = await (signTransaction as (tx: VersionedTransaction) => Promise<VersionedTransaction>)(versionedTx);
        signature = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
        });
      } catch {
        // Fall back to legacy transaction
        const legacyTx = Transaction.from(txBytes);
        const signed = await signTransaction(legacyTx);
        signature = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
        });
      }

      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight: lastValidBlockHeight ?? (await connection.getLatestBlockhash()).lastValidBlockHeight,
        },
        "confirmed"
      );

      setTxSignature(signature);

      recordSwap({
        inputMint: route.inputMint,
        outputMint: route.outputMint,
        inputAmount: parseInt(route.inAmount, 10),
        outputAmount: parseInt(route.outAmount, 10),
        feeBps: route.platformFee?.feeBps ?? 0,
        feeAmountLamports: route.platformFee ? parseInt(route.platformFee.amount, 10) : 0,
        signature,
        priceImpactPct: parseFloat(route.priceImpactPct),
        routeCount: route.routePlan?.length ?? 1,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Swap failed");
    } finally {
      setSwapping(false);
    }
  }, [connected, publicKey, route, signTransaction, connection, setSwapping, setError, setTxSignature]);

  return { executeSwap };
}
