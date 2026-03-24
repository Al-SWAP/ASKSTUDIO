import type { SwapRoute, RouteScore } from "./types";

const AI_WEIGHTS = {
  output: 0.45,
  priceImpact: 0.25,
  hopCount: 0.15,
  latency: 0.10,
  fee: 0.05,
};

const HOP_PENALTY = 8;
const PRICE_IMPACT_WEIGHT = 15;

/**
 * AI Router scoring function.
 * score = outputScore - (priceImpact * weight) - (hopCount * penalty) + latencyBonus
 */
export function scoreRoute(route: SwapRoute, latencyMs?: number): RouteScore {
  const outAmount = parseFloat(route.outAmount);
  const priceImpact = parseFloat(route.priceImpactPct);
  const hopCount = route.routePlan?.length ?? 1;
  const slippageBps = route.slippageBps ?? 50;

  const outputScore = outAmount > 0 ? Math.min(100, (1 / (1 + priceImpact)) * 100) : 0;
  const priceImpactScore = Math.max(0, 100 - priceImpact * PRICE_IMPACT_WEIGHT);
  const hopScore = Math.max(0, 100 - (hopCount - 1) * HOP_PENALTY);
  const latencyScore = latencyMs != null ? Math.max(0, 100 - latencyMs / 50) : 50;
  const feeScore = Math.max(0, 100 - slippageBps / 5);

  const score =
    outputScore * AI_WEIGHTS.output +
    priceImpactScore * AI_WEIGHTS.priceImpact +
    hopScore * AI_WEIGHTS.hopCount +
    latencyScore * AI_WEIGHTS.latency +
    feeScore * AI_WEIGHTS.fee;

  return {
    route: { ...route, score },
    score,
    breakdown: { outputScore, feeScore, priceImpactScore, latencyScore, hopScore },
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
  return scored[0]?.route ?? null;
}

export function getFallbackRoutes(routes: SwapRoute[], count = 2, latencyMs?: number): SwapRoute[] {
  const scored = sortRoutes(routes, latencyMs);
  return scored.slice(1, 1 + count).map((s) => s.route);
}
