import { env } from "@askstudio/config";
import type { Token, OrcaPool } from "./types";

export async function fetchOrcaTokens(signal?: AbortSignal): Promise<Token[]> {
  const response = await fetch(env.ORCA_API, {
    signal,
    next: { revalidate: 3600 },
  } as RequestInit);

  if (!response.ok) {
    throw new Error(`Orca API fetch failed: ${response.statusText}`);
  }

  const data: Record<string, OrcaPool> = await response.json();
  const tokenMap = new Map<string, Token>();

  for (const pool of Object.values(data)) {
    for (const [mint, tokenInfo] of Object.entries(pool.tokens ?? {})) {
      if (!tokenMap.has(mint)) {
        tokenMap.set(mint, {
          address: mint,
          chainId: 101,
          decimals: tokenInfo.decimals,
          name: tokenInfo.name,
          symbol: tokenInfo.name.slice(0, 10).toUpperCase(),
          logoURI: tokenInfo.logoURI,
          tags: [],
          sources: ["orca" as const],
          rank: 5,
        });
      } else {
        const existing = tokenMap.get(mint)!;
        if (!existing.sources.includes("orca")) {
          existing.sources.push("orca");
        }
      }
    }
  }

  return Array.from(tokenMap.values());
}
