"use client";

import { useState } from "react";
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { rpcManager } from "@askstudio/web3";

export default function TxBuilderPage() {
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [solAmount, setSolAmount] = useState("0.001");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const buildTransaction = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let fromPubkey: PublicKey;
      let toPubkey: PublicKey;
      try {
        fromPubkey = new PublicKey(fromAddress);
        toPubkey = new PublicKey(toAddress);
      } catch {
        throw new Error("Invalid public key format");
      }
      const lamports = Math.floor(parseFloat(solAmount) * LAMPORTS_PER_SOL);
      if (isNaN(lamports) || lamports <= 0) throw new Error("Invalid SOL amount");

      const connection = rpcManager.getConnection("confirmed");
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: fromPubkey,
      });

      tx.add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        })
      );

      const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
      const base64 = serialized.toString("base64");

      setResult(JSON.stringify({
        transaction: base64,
        blockhash,
        lastValidBlockHeight,
        feePayer: fromPubkey.toBase58(),
        instructions: tx.instructions.length,
        estimatedFee: "~5000 lamports (0.000005 SOL)",
      }, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction build failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">TX Builder</h1>
        <p className="text-white/40 text-sm mt-1">Construct and inspect raw Solana transactions</p>
      </div>

      <div className="glass-card p-4 space-y-3">
        <h2 className="font-semibold text-sm">SOL Transfer</h2>
        <div className="space-y-3">
          <div>
            <label className="text-white/40 text-xs mb-1 block">From Address</label>
            <input type="text" placeholder="Sender public key" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} className="glass-input w-full text-sm font-mono" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">To Address</label>
            <input type="text" placeholder="Recipient public key" value={toAddress} onChange={(e) => setToAddress(e.target.value)} className="glass-input w-full text-sm font-mono" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Amount (SOL)</label>
            <input type="number" placeholder="0.001" value={solAmount} onChange={(e) => setSolAmount(e.target.value)} className="glass-input w-full text-sm font-mono" min="0" step="0.001" />
          </div>
        </div>
        <button
          onClick={buildTransaction}
          disabled={loading || !fromAddress || !toAddress}
          className="px-4 py-2 rounded-xl bg-green-600/30 hover:bg-green-600/40 text-green-300 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Building..." : "Build Transaction"}
        </button>
      </div>

      {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>}
      {result && (
        <div>
          <h2 className="font-semibold mb-2 text-sm">Transaction Details</h2>
          <div className="code-block">{result}</div>
        </div>
      )}
    </div>
  );
}
