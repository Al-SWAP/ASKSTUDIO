import type { SwapRoute, RouteScore } from "./types";

const WEIGHTS = {
  output: 0.5,
  fee: 0.2,
  priceImpact: 0.2,
  latency: 0.1,
};

export function scoreRoute(route: SwapRoute, latencyMs?: number): RouteScore {
  const outAmount = parseFloat(route.outAmount);
  const priceImpact = parseFloat(route.priceImpactPct);
  const slippageBps = route.slippageBps;

  const outputScore = outAmount > 0 ? Math.min(100, (1 / (1 + priceImpact)) * 100) : 0;
  const feeScore = Math.max(0, 100 - slippageBps / 10);
  const priceImpactScore = Math.max(0, 100 - priceImpact * 20);
  const latencyScore = latencyMs != null ? Math.max(0, 100 - latencyMs / 100) : 50;

  const score =
    outputScore * WEIGHTS.output +
    feeScore * WEIGHTS.fee +
    priceImpactScore * WEIGHTS.priceImpact +
    latencyScore * WEIGHTS.latency;

  return {
    route: { ...route, score },
    score,
    breakdown: { outputScore, feeScore, priceImpactScore, latencyScore },
  };
}

export function sortRoutes(routes: SwapRoute[], latencyMs?: number): RouteScore[] {
  return routes
    .map((route) => scoreRoute(route, latencyMs))
    .sort((a, b) => b.score - a.score);
}

export function getBestRoute(routes: SwapRoute[], latencyMs?: number): SwapRoute | null {
  if (routes.length === 0) return null;
  const scored = sortRoutes(routes, latencyMs);
  return scored[0].route;
}

export function formatPriceImpact(priceImpactPct: string): string {
  const pct = parseFloat(priceImpactPct);
  if (pct < 0.01) return "<0.01%";
  return `${pct.toFixed(2)}%`;
}

export function formatRouteLabel(route: SwapRoute): string {
  const hops = route.routePlan.length;
  const dexes = [...new Set(route.routePlan.map((r) => r.swapInfo.label ?? "Unknown"))];
  return `${hops} hop${hops !== 1 ? "s" : ""} via ${dexes.join(" → ")}`;
}
