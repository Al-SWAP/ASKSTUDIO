import * as React from "react";
import type { SwapRoute, RoutePlanStep } from "@askstudio/dex";

export interface RouteDisplayProps {
  route: SwapRoute;
  latencyMs?: number;
}

export function RouteDisplay({ route, latencyMs }: RouteDisplayProps): React.ReactElement {
  const priceImpact = parseFloat(route.priceImpactPct);
  const impactColor =
    priceImpact > 3 ? "text-red-400" : priceImpact > 1 ? "text-yellow-400" : "text-green-400";

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/60">Price Impact</span>
        <span className={`font-semibold ${impactColor}`}>{priceImpact.toFixed(3)}%</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-white/60">Slippage Tolerance</span>
        <span className="text-white font-semibold">{(route.slippageBps / 100).toFixed(2)}%</span>
      </div>

      {route.platformFee && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Platform Fee</span>
          <span className="text-white font-semibold">{(route.platformFee.feeBps / 100).toFixed(2)}%</span>
        </div>
      )}

      {latencyMs !== undefined && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Quote Latency</span>
          <span className="text-white font-semibold">{latencyMs}ms</span>
        </div>
      )}

      {route.routePlan.length > 0 && (
        <div className="space-y-1">
          <p className="text-white/60 text-xs uppercase tracking-wide">Route</p>
          <div className="flex items-center gap-1 flex-wrap">
            {route.routePlan.map((step: RoutePlanStep, i: number) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-white/30 text-xs">→</span>}
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs font-medium">
                  {step.swapInfo.label ?? step.swapInfo.ammKey.slice(0, 8)}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {route.score !== undefined && (
        <div className="flex items-center justify-between text-sm border-t border-white/10 pt-2">
          <span className="text-white/60">AI Score</span>
          <span className="text-purple-400 font-semibold">{route.score.toFixed(1)}/100</span>
        </div>
      )}
    </div>
  );
}
