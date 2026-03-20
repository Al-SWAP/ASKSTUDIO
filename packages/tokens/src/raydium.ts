import { env } from "@askstudio/config";
import type { Token, RaydiumPoolInfo } from "./types";

interface RaydiumApiResponse {
  official: RaydiumPoolInfo[];
  unOfficial: RaydiumPoolInfo[];
}

export async function fetchRaydiumTokens(signal?: AbortSignal): Promise<Token[]> {
  const response = await fetch(env.RAYDIUM_API, {
    signal,
    next: { revalidate: 3600 },
  } as RequestInit);

  if (!response.ok) {
    throw new Error(`Raydium API fetch failed: ${response.statusText}`);
  }

  const data: RaydiumApiResponse = await response.json();
  const pools = [...(data.official ?? []), ...(data.unOfficial ?? [])];

  const tokenMap = new Map<string, Token>();

  for (const pool of pools) {
    if (!tokenMap.has(pool.baseMint)) {
      tokenMap.set(pool.baseMint, {
        address: pool.baseMint,
        chainId: 101,
        decimals: pool.baseDecimals,
        name: pool.baseMint.slice(0, 8),
        symbol: pool.baseMint.slice(0, 6).toUpperCase(),
        tags: [],
        sources: ["raydium" as const],
        rank: 5,
      });
    } else {
      const existing = tokenMap.get(pool.baseMint)!;
      if (!existing.sources.includes("raydium")) {
        existing.sources.push("raydium");
      }
    }

    if (!tokenMap.has(pool.quoteMint)) {
      tokenMap.set(pool.quoteMint, {
        address: pool.quoteMint,
        chainId: 101,
        decimals: pool.quoteDecimals,
        name: pool.quoteMint.slice(0, 8),
        symbol: pool.quoteMint.slice(0, 6).toUpperCase(),
        tags: [],
        sources: ["raydium" as const],
        rank: 5,
      });
    } else {
      const existing = tokenMap.get(pool.quoteMint)!;
      if (!existing.sources.includes("raydium")) {
        existing.sources.push("raydium");
      }
    }
  }

  return Array.from(tokenMap.values());
}
