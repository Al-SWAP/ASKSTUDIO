import React from "react";
import type { SwapRoute } from "@askstudio/dex";

export interface RouteDisplayProps {
  route: SwapRoute | null;
  loading?: boolean;
}

export function RouteDisplay({ route, loading }: RouteDisplayProps) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-violet-500/50 border-t-violet-500 rounded-full animate-spin" />
          <span className="text-white/50 text-sm">Finding best route...</span>
        </div>
      </div>
    );
  }

  if (!route) return null;

  const priceImpact = parseFloat(route.priceImpactPct);
  const impactColor = priceImpact < 1 ? "text-green-400" : priceImpact < 3 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/50">Route</span>
        <div className="flex items-center gap-1">
          {route.routePlan.map((step, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-white/30">→</span>}
              <span className="px-2 py-0.5 rounded-md bg-violet-600/20 text-violet-300 text-xs font-medium">
                {step.swapInfo.label ?? "DEX"}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/50">Price Impact</span>
        <span className={`font-medium ${impactColor}`}>
          {priceImpact < 0.01 ? "<0.01%" : `${priceImpact.toFixed(2)}%`}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/50">Slippage Tolerance</span>
        <span className="text-white/80">{(route.slippageBps / 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}
