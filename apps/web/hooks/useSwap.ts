"use client";

import { useCallback } from "react";
import { useWallet as useSolanaWallet, useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction, Transaction } from "@solana/web3.js";
import { useSwapStore } from "../store/swapStore";

/** Browser-safe base64 → Uint8Array (avoids relying on Node Buffer polyfill) */
function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

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

      const { swapTransaction, lastValidBlockHeight: apiLastValidBlockHeight } = await res.json();
      if (!swapTransaction) throw new Error("No swap transaction returned");

      // Browser-safe decode — avoids dependency on Node.js Buffer polyfill
      const txBytes = base64ToUint8Array(swapTransaction);

      let signature: string;
      let blockhash: string;
      let lastValidBlockHeight: number;

      try {
        // Versioned transaction path
        const versionedTx = VersionedTransaction.deserialize(txBytes);
        // Extract the blockhash that Jupiter embedded in the transaction
        blockhash = versionedTx.message.recentBlockhash;
        lastValidBlockHeight =
          apiLastValidBlockHeight ?? (await connection.getLatestBlockhash()).lastValidBlockHeight;

        const signed = await (signTransaction as (tx: VersionedTransaction) => Promise<VersionedTransaction>)(
          versionedTx
        );
        signature = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
        });
      } catch {
        // Legacy transaction fallback
        const legacyTx = Transaction.from(txBytes);
        // Fetch blockhash once only — avoids two calls returning different blockhash contexts
        const latestBh =
          !legacyTx.recentBlockhash || !apiLastValidBlockHeight
            ? await connection.getLatestBlockhash()
            : null;
        blockhash = legacyTx.recentBlockhash ?? latestBh!.blockhash;
        lastValidBlockHeight = apiLastValidBlockHeight ?? latestBh!.lastValidBlockHeight;

        const signed = await signTransaction(legacyTx);
        signature = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
        });
      }

      // Confirm against the same blockhash that is baked into the transaction
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      setTxSignature(signature);

      // Record analytics on the server so the admin dashboard can see them
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputMint: route.inputMint,
          outputMint: route.outputMint,
          inputAmount: parseInt(route.inAmount, 10),
          outputAmount: parseInt(route.outAmount, 10),
          feeBps: route.platformFee?.feeBps ?? 0,
          feeAmountLamports: route.platformFee ? parseInt(route.platformFee.amount, 10) : 0,
          signature,
          priceImpactPct: parseFloat(route.priceImpactPct),
          routeCount: route.routePlan?.length ?? 1,
        }),
      }).catch(() => {/* non-critical — don't fail the swap */});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Swap failed");
    } finally {
      setSwapping(false);
    }
  }, [connected, publicKey, route, signTransaction, connection, setSwapping, setError, setTxSignature]);

  return { executeSwap };
}
