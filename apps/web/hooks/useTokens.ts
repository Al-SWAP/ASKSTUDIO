"use client";

import { useQuery } from "@tanstack/react-query";
import type { Token } from "@askstudio/tokens";

async function fetchTokens(): Promise<Token[]> {
  const res = await fetch("/api/tokens");
  if (!res.ok) throw new Error("Failed to fetch tokens");
  const data = await res.json();
  return data.tokens as Token[];
}

export function useTokens() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tokens"],
    queryFn: fetchTokens,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    tokens: data ?? [],
    isLoading,
    error: error?.message ?? null,
  };
}

export function useTokenSearch(tokens: Token[], query: string): Token[] {
  if (!query.trim()) return tokens.slice(0, 100);
  const q = query.toLowerCase().trim();
  return tokens
    .filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase() === q
    )
    .slice(0, 50);
}
