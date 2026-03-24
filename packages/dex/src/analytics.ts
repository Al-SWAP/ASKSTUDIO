import type { AnalyticsEntry } from "./types";

const MAX_ENTRIES = 10_000;

const _entries: AnalyticsEntry[] = [];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function recordSwap(entry: Omit<AnalyticsEntry, "id" | "timestamp">): AnalyticsEntry {
  const full: AnalyticsEntry = {
    id: generateId(),
    timestamp: Date.now(),
    ...entry,
  };
  _entries.push(full);
  if (_entries.length > MAX_ENTRIES) {
    _entries.splice(0, _entries.length - MAX_ENTRIES);
  }
  return full;
}

export interface AnalyticsSummary {
  totalSwaps: number;
  totalVolumeInputLamports: number;
  totalVolumeOutputLamports: number;
  totalFeesLamports: number;
  averagePriceImpact: number;
  averageRouteCount: number;
  periodStart: number;
  periodEnd: number;
}

export function getAnalyticsSummary(sinceMs?: number): AnalyticsSummary {
  const now = Date.now();
  const from = sinceMs ?? 0;
  const filtered = _entries.filter((e) => e.timestamp >= from);

  const totalVolumeInputLamports = filtered.reduce((acc, e) => acc + e.inputAmount, 0);
  const totalVolumeOutputLamports = filtered.reduce((acc, e) => acc + e.outputAmount, 0);
  const totalFeesLamports = filtered.reduce((acc, e) => acc + e.feeAmountLamports, 0);
  const totalPriceImpact = filtered.reduce((acc, e) => acc + e.priceImpactPct, 0);
  const totalRouteCount = filtered.reduce((acc, e) => acc + e.routeCount, 0);

  return {
    totalSwaps: filtered.length,
    totalVolumeInputLamports,
    totalVolumeOutputLamports,
    totalFeesLamports,
    averagePriceImpact: filtered.length > 0 ? totalPriceImpact / filtered.length : 0,
    averageRouteCount: filtered.length > 0 ? totalRouteCount / filtered.length : 0,
    periodStart: from,
    periodEnd: now,
  };
}

export function getRecentEntries(limit = 50): AnalyticsEntry[] {
  return _entries.slice(-limit).reverse();
}

export function clearAnalytics(): void {
  _entries.splice(0, _entries.length);
}
