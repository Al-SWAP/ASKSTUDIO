"use client";

import { useState } from "react";
import type { SwapRoute } from "@askstudio/dex";
import { scoreRoute } from "@askstudio/dex";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

interface SimulationResult {
  route: SwapRoute;
  outputAmount: number;
  priceImpact: number;
  effectivePrice: number;
  score: number;
  slippageRisk: "low" | "medium" | "high";
}

export default function SimulatorPage() {
  const [inputMint, setInputMint] = useState(SOL_MINT);
  const [outputMint, setOutputMint] = useState(USDC_MINT);
  const [inputDecimals, setInputDecimals] = useState(9);
  const [outputDecimals, setOutputDecimals] = useState(6);
  const [amount, setAmount] = useState("1");
  const [slippageBps, setSlippageBps] = useState("50");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simulate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const rawAmount = Math.floor(parseFloat(amount) * Math.pow(10, inputDecimals));
      const res = await fetch(
        `/api/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${rawAmount}&slippageBps=${slippageBps}`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Simulation failed" }));
        throw new Error(err.error ?? "Simulation failed");
      }
      const route: SwapRoute = await res.json();
      const outAmount = parseFloat(route.outAmount) / Math.pow(10, outputDecimals);
      const inAmountUI = parseFloat(route.inAmount) / Math.pow(10, inputDecimals);
      const priceImpact = parseFloat(route.priceImpactPct);
      const effectivePrice = outAmount / inAmountUI;
      const scored = scoreRoute(route);
      const slippageRisk: "low" | "medium" | "high" =
        priceImpact < 1 ? "low" : priceImpact < 3 ? "medium" : "high";

      setResult({ route, outputAmount: outAmount, priceImpact, effectivePrice, score: scored.score, slippageRisk });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  const riskColors = { low: "text-green-400", medium: "text-yellow-400", high: "text-red-400" };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Swap Simulator</h1>
        <p className="text-white/40 text-sm mt-1">Simulate swaps and analyze outcomes without broadcasting</p>
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
            <label className="text-white/40 text-xs mb-1 block">Amount (UI)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="glass-input w-full text-sm font-mono" min="0" step="any" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Slippage BPS</label>
            <input type="number" value={slippageBps} onChange={(e) => setSlippageBps(e.target.value)} className="glass-input w-full text-sm font-mono" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Input Decimals</label>
            <input type="number" value={inputDecimals} onChange={(e) => setInputDecimals(parseInt(e.target.value))} className="glass-input w-full text-sm font-mono" min="0" max="18" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Output Decimals</label>
            <input type="number" value={outputDecimals} onChange={(e) => setOutputDecimals(parseInt(e.target.value))} className="glass-input w-full text-sm font-mono" min="0" max="18" />
          </div>
        </div>
        <button
          onClick={simulate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/40 text-violet-300 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Simulating..." : "Simulate Swap"}
        </button>
      </div>

      {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>}

      {result && (
        <div className="space-y-3">
          <div className="glass-card p-4 space-y-3">
            <h2 className="font-semibold text-sm">Simulation Results</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Output Amount", value: result.outputAmount.toFixed(outputDecimals > 6 ? 6 : outputDecimals) },
                { label: "Effective Price", value: result.effectivePrice.toFixed(6) },
                { label: "Price Impact", value: `${result.priceImpact.toFixed(4)}%`, color: riskColors[result.slippageRisk] },
                { label: "Route Score", value: result.score.toFixed(1), color: "text-violet-300" },
                { label: "Slippage Risk", value: result.slippageRisk.toUpperCase(), color: riskColors[result.slippageRisk] },
                { label: "Hops", value: result.route.routePlan.length.toString() },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-white/40">{item.label}</span>
                  <span className={`font-mono font-semibold ${item.color ?? "text-white"}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-4">
            <h2 className="font-semibold mb-2 text-sm">Route Plan</h2>
            <div className="flex flex-wrap gap-2">
              {result.route.routePlan.map((step, i) => (
                <div key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-white/30 text-xs">→</span>}
                  <span className="px-2 py-1 rounded-lg bg-violet-600/20 text-violet-300 text-xs font-medium">
                    {step.swapInfo.label ?? "DEX"} ({step.percent}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
