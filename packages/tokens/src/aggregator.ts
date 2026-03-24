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
  merged.rank = (merged.rank ?? 0) + (incoming.rank ?? 0);
  if (incoming.tags) {
    const tagsSet = new Set([...(merged.tags ?? []), ...incoming.tags]);
    merged.tags = Array.from(tagsSet);
  }
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
  const successfulSources: TokenSource[] = [];

  const sourceLabels: TokenSource[] = ["jupiter", "raydium", "orca"];
  for (let i = 0; i < results.length; i++) {
    const result = results[i]!;
    if (result.status === "fulfilled") {
      successfulSources.push(sourceLabels[i]!);
      for (const token of result.value) {
        const existing = tokenMap.get(token.address);
        tokenMap.set(token.address, existing ? mergeToken(existing, token) : token);
      }
    }
  }

  if (successfulSources.length === 0) {
    throw new Error("All token sources failed to respond");
  }

  const tokens = Array.from(tokenMap.values())
    .map((t) => ({ ...t, rank: rankToken(t) }))
    .sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0));

  return {
    tokens,
    lastUpdated: Date.now(),
    sources: successfulSources,
  };
}

const BLACKLISTED_MINTS = new Set<string>();

export function blacklistToken(mint: string): void {
  BLACKLISTED_MINTS.add(mint);
}

export function unblacklistToken(mint: string): void {
  BLACKLISTED_MINTS.delete(mint);
}

export function getBlacklist(): string[] {
  return Array.from(BLACKLISTED_MINTS);
}

export function filterTokenList(list: TokenList): TokenList {
  return {
    ...list,
    tokens: list.tokens.filter((t) => !BLACKLISTED_MINTS.has(t.address)),
  };
}

export function buildFastIndex(list: TokenList): Map<string, Token> {
  const map = new Map<string, Token>();
  for (const token of list.tokens) {
    map.set(token.address, token);
    map.set(token.symbol.toLowerCase(), token);
  }
  return map;
}
