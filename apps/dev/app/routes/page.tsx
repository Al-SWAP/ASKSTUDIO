"use client";

import { useState } from "react";
import { scoreRoute } from "@askstudio/dex";
import type { SwapRoute } from "@askstudio/dex";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export default function RouteDebuggerPage() {
  const [inputMint, setInputMint] = useState(SOL_MINT);
  const [outputMint, setOutputMint] = useState(USDC_MINT);
  const [amount, setAmount] = useState("1000000000");
  const [slippageBps, setSlippageBps] = useState("50");
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<SwapRoute | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRoute = async () => {
    setLoading(true);
    setError(null);
    setRoute(null);
    try {
      const res = await fetch(
        `/api/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? "Request failed");
      }
      const data = await res.json();
      setRoute(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch route");
    } finally {
      setLoading(false);
    }
  };

  const scored = route ? scoreRoute(route) : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Route Debugger</h1>
        <p className="text-white/40 text-sm mt-1">Inspect swap routes and scoring from Jupiter API</p>
      </div>

      <div className="glass-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-white/40 text-xs mb-1 block">Input Mint</label>
            <input type="text" value={inputMint} onChange={(e) => setInputMint(e.target.value)} className="glass-input w-full text-sm font-mono" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Output Mint</label>
            <input type="text" value={outputMint} onChange={(e) => setOutputMint(e.target.value)} className="glass-input w-full text-sm font-mono" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Amount (raw lamports)</label>
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} className="glass-input w-full text-sm font-mono" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Slippage BPS</label>
            <input type="text" value={slippageBps} onChange={(e) => setSlippageBps(e.target.value)} className="glass-input w-full text-sm font-mono" />
          </div>
        </div>
        <button
          onClick={fetchRoute}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/40 text-violet-300 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Fetching..." : "Fetch Route"}
        </button>
      </div>

      {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>}

      {route && scored && (
        <div className="space-y-3">
          <div className="glass-card p-4 space-y-2 text-sm">
            <h2 className="font-semibold mb-3">Route Score</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Total Score", value: scored.score.toFixed(1), highlight: true },
                { label: "Output Score", value: scored.breakdown.outputScore.toFixed(1) },
                { label: "Fee Score", value: scored.breakdown.feeScore.toFixed(1) },
                { label: "Price Impact Score", value: scored.breakdown.priceImpactScore.toFixed(1) },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-white/40">{item.label}</span>
                  <span className={`font-mono font-semibold ${item.highlight ? "text-violet-300" : "text-white"}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-semibold mb-2 text-sm">Raw Route JSON</h2>
            <div className="code-block">{JSON.stringify(route, null, 2)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
