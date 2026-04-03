import type { Token, TokenList, TokenSource } from "./types";
import { fetchJupiterTokens } from "./jupiter";
import { fetchRaydiumTokens } from "./raydium";
import { fetchOrcaTokens } from "./orca";

function mergeToken(base: Token, incoming: Token): Token {
  const merged: Token = { ...base };
  if (!merged.name || merged.name === merged.address.slice(0, 8)) {
    merged.name = incoming.name;
  }
  if (!merged.symbol || merged.symbol === merged.address.slice(0, 6).toUpperCase()) {
    merged.symbol = incoming.symbol;
  }
  if (!merged.logoURI && incoming.logoURI) {
    merged.logoURI = incoming.logoURI;
  }
  const sourcesSet = new Set([...merged.sources, ...incoming.sources]);
  merged.sources = Array.from(sourcesSet) as TokenSource[];
  // rank is recomputed for all tokens via rankToken() in aggregateTokens; no need to accumulate here.
  return merged;
}

function rankToken(token: Token): number {
  let score = 0;
  score += token.sources.length * 20;
  if (token.tags?.includes("verified")) score += 100;
  if (token.tags?.includes("community")) score += 50;
  if (token.tags?.includes("strict")) score += 200;
  if (token.logoURI) score += 10;
  if (token.name && token.name !== token.address.slice(0, 8)) score += 5;
  return score;
}

export async function aggregateTokens(signal?: AbortSignal): Promise<TokenList> {
  const results = await Promise.allSettled([
    fetchJupiterTokens(signal),
    fetchRaydiumTokens(signal),
    fetchOrcaTokens(signal),
  ]);

  const tokenMap = new Map<string, Token>();

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const token of result.value) {
        const existing = tokenMap.get(token.address);
        if (existing) {
          tokenMap.set(token.address, mergeToken(existing, token));
        } else {
          tokenMap.set(token.address, { ...token });
        }
      }
    }
  }

  const tokens = Array.from(tokenMap.values())
    .map((t) => ({ ...t, rank: rankToken(t) }))
    .sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0));

  return {
    tokens,
    updatedAt: Date.now(),
  };
}

export function searchTokens(tokens: Token[], query: string): Token[] {
  const q = query.toLowerCase().trim();
  if (!q) return tokens;
  return tokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.address.toLowerCase() === q
  );
}

export function getTokenByMint(tokens: Token[], mint: string): Token | undefined {
  return tokens.find((t) => t.address === mint);
}
