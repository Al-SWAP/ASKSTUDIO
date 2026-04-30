import type { SwapRoute, RouteScore } from "./types";

const WEIGHTS = {
  output: 0.5,
  fee: 0.2,
  priceImpact: 0.2,
  latency: 0.1,
};

export function scoreRoute(
  route: SwapRoute,
  latencyMs?: number,
  maxOutAmount?: bigint
): RouteScore {
  const outAmount = BigInt(route.outAmount || "0");
  // Guard against NaN/Infinity from missing or malformed priceImpactPct.
  const priceImpactRaw = parseFloat(route.priceImpactPct);
  const priceImpact = isFinite(priceImpactRaw) ? priceImpactRaw : 0;
  // Prefer explicit platform fee BPS; fall back to slippage BPS as a proxy for cost.
  const feeBps = route.platformFee?.feeBps ?? route.slippageBps;

  // Normalize outputScore against the best known outAmount across all candidate routes.
  // Falls back to a priceImpact-based heuristic when only a single route is scored.
  let outputScore: number;
  if (maxOutAmount !== undefined && maxOutAmount > 0n) {
    outputScore =
      outAmount > 0n
        ? Math.min(100, Number((outAmount * 10_000n) / maxOutAmount) / 100)
        : 0;
  } else {
    outputScore = outAmount > 0n ? Math.min(100, (1 / (1 + priceImpact)) * 100) : 0;
  }
  const feeScore = Math.max(0, 100 - feeBps / 10);
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
  // Compute the maximum outAmount across all routes so outputScore is properly normalized.
  const maxOutAmount = routes.reduce((max, r) => {
    const amt = BigInt(r.outAmount || "0");
    return amt > max ? amt : max;
  }, 0n);
  return routes
    .map((route) => scoreRoute(route, latencyMs, maxOutAmount))
    .sort((a, b) => b.score - a.score);
}

export function getBestRoute(routes: SwapRoute[], latencyMs?: number): SwapRoute | null {
  if (routes.length === 0) return null;
  const scored = sortRoutes(routes, latencyMs);
  return scored[0].route;
}

export function formatPriceImpact(priceImpactPct: string): string {
  const pct = parseFloat(priceImpactPct);
  if (!isFinite(pct) || pct < 0) return "—";
  if (pct < 0.01) return "<0.01%";
  return `${pct.toFixed(2)}%`;
}

export function formatRouteLabel(route: SwapRoute): string {
  const hops = route.routePlan.length;
  const dexes = [...new Set(route.routePlan.map((r) => r.swapInfo.label ?? "Unknown"))];
  return `${hops} hop${hops !== 1 ? "s" : ""} via ${dexes.join(" → ")}`;
}
