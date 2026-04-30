import { env } from "@askstudio/config";
import type { Token } from "./types";

interface JupiterToken {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
  extensions?: Record<string, unknown>;
}

export async function fetchJupiterTokens(signal?: AbortSignal): Promise<Token[]> {
  const response = await fetch(env.TOKEN_LIST, {
    signal,
    next: { revalidate: 3600 },
  } as RequestInit);

  if (!response.ok) {
    throw new Error(`Jupiter token list fetch failed: ${response.statusText}`);
  }

  const tokens: JupiterToken[] = await response.json();

  return tokens.map((t) => ({
    address: t.address,
    chainId: t.chainId ?? 101,
    decimals: t.decimals,
    name: t.name,
    symbol: t.symbol,
    logoURI: t.logoURI,
    tags: t.tags ?? [],
    extensions: t.extensions ?? {},
    sources: ["jupiter" as const],
    rank: t.tags?.includes("verified") ? 100 : t.tags?.includes("community") ? 50 : 10,
  }));
}
