"use client";

import { useSwapStore } from "@/store/swapStore";

export function RouteInfo() {
  const { route, isLoadingQuote, outputToken } = useSwapStore();

  if (isLoadingQuote) {
    return (
      <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center gap-2">
        <div className="w-3 h-3 border-2 border-violet-500/50 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-white/40 text-xs">Finding best route...</span>
      </div>
    );
  }

  if (!route) return null;

  const priceImpact = parseFloat(route.priceImpactPct);
  const impactColor =
    priceImpact < 1 ? "text-green-400" : priceImpact < 3 ? "text-yellow-400" : "text-red-400";

  const outDecimals = outputToken?.decimals ?? 6;
  const minReceived = parseInt(route.otherAmountThreshold) / Math.pow(10, outDecimals);

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-white/40">Route</span>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {route.routePlan.map((step, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-white/20">→</span>}
              <span className="px-1.5 py-0.5 rounded bg-violet-600/20 text-violet-300 font-medium">
                {step.swapInfo.label ?? "DEX"}
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-white/40">Price Impact</span>
        <span className={`font-medium ${impactColor}`}>
          {priceImpact < 0.01 ? "<0.01%" : `${priceImpact.toFixed(2)}%`}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-white/40">Min Received</span>
        <span className="text-white/70 font-medium">
          {minReceived.toFixed(outDecimals > 6 ? 6 : outDecimals)} {outputToken?.symbol ?? ""}
        </span>
      </div>
    </div>
  );
}
