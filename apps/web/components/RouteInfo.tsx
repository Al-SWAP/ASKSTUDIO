"use client";

import type { SwapRoute } from "@askstudio/dex";
import { RouteDisplay } from "@askstudio/ui";

interface RouteInfoProps {
  route: SwapRoute | null;
  latencyMs?: number;
  loading: boolean;
}

export function RouteInfo({ route, latencyMs, loading }: RouteInfoProps) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
      </div>
    );
  }
  if (!route) return null;
  return <RouteDisplay route={route} latencyMs={latencyMs} />;
}
