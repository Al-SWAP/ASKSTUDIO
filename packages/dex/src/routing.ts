import type { SwapRoute, RouteScore } from "./types";

const AI_WEIGHTS = {
  output: 0.45,
  priceImpact: 0.25,
  hopCount: 0.15,
  latency: 0.10,
  slippage: 0.05,
};

const HOP_PENALTY = 8;
const PRICE_IMPACT_WEIGHT = 15;

/**
 * AI Router scoring function.
 * outputScore is normalized against maxOutAmount so the route with the largest
 * real output amount scores 100; all others are scaled proportionally.
 * BigInt is used for amount comparison to avoid JS floating-point precision loss
 * on u64-sized values. The ratio is computed in integer arithmetic scaled to 100.
 */
export function scoreRoute(route: SwapRoute, latencyMs?: number, maxOutAmountStr?: string): RouteScore {
  // Parse amounts as BigInt to handle u64 values without precision loss.
  const outAmountBig = BigInt(route.outAmount || "0");
  const maxBig = maxOutAmountStr ? BigInt(maxOutAmountStr) : outAmountBig;

  // Compute outputScore as integer ratio scaled by 100 (preserves two decimal places).
  const outputScore = maxBig > 0n && outAmountBig > 0n
    ? Math.min(100, Number((outAmountBig * 10000n) / maxBig) / 100)
    : 0;

  const priceImpact = parseFloat(route.priceImpactPct);
  const hopCount = route.routePlan?.length ?? 1;
  const slippageBps = route.slippageBps ?? 50;

  const priceImpactScore = Math.max(0, 100 - priceImpact * PRICE_IMPACT_WEIGHT);
  const hopScore = Math.max(0, 100 - (hopCount - 1) * HOP_PENALTY);
  const latencyScore = latencyMs != null ? Math.max(0, 100 - latencyMs / 50) : 50;
  // Slippage-based penalty: lower slippage tolerance scores higher.
  const slippageScore = Math.max(0, 100 - slippageBps / 5);

  const score =
    outputScore * AI_WEIGHTS.output +
    priceImpactScore * AI_WEIGHTS.priceImpact +
    hopScore * AI_WEIGHTS.hopCount +
    latencyScore * AI_WEIGHTS.latency +
    slippageScore * AI_WEIGHTS.slippage;

  return {
    route: { ...route, score },
    score,
    breakdown: { outputScore, slippageScore, priceImpactScore, latencyScore, hopScore },
  };
}

export function sortRoutes(routes: SwapRoute[], latencyMs?: number): RouteScore[] {
  // Compute the best outAmount using BigInt comparison to avoid precision loss on u64 values.
  const maxOutAmountBig = routes.reduce((max, r) => {
    const v = BigInt(r.outAmount || "0");
    return v > max ? v : max;
  }, 0n);
  const maxOutAmountStr = maxOutAmountBig > 0n ? maxOutAmountBig.toString() : undefined;

  return routes
    .map((route) => scoreRoute(route, latencyMs, maxOutAmountStr))
    .sort((a, b) => b.score - a.score);
}

export function getBestRoute(routes: SwapRoute[], latencyMs?: number): SwapRoute | null {
  if (routes.length === 0) return null;
  const scored = sortRoutes(routes, latencyMs);
  return scored[0]?.route ?? null;
}

export function getFallbackRoutes(routes: SwapRoute[], count = 2, latencyMs?: number): SwapRoute[] {
  const scored = sortRoutes(routes, latencyMs);
  return scored.slice(1, 1 + count).map((s) => s.route);
}
