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
    for (const [, tokenInfo] of Object.entries(pool.tokens ?? {})) {
      // Use tokenInfo.mint as the canonical address; the record key is not guaranteed
      // to be the mint address and using it can produce incorrect token.address values.
      const mintAddress = tokenInfo.mint;
      if (!tokenMap.has(mintAddress)) {
        tokenMap.set(mintAddress, {
          address: mintAddress,
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
        const existing = tokenMap.get(mintAddress)!;
        if (!existing.sources.includes("orca")) {
          existing.sources.push("orca");
        }
      }
    }
  }

  return Array.from(tokenMap.values());
}
