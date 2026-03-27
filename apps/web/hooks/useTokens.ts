"use client";

import { useQuery } from "@tanstack/react-query";
import type { Token, TokenList } from "@askstudio/tokens";

export function useTokens() {
  return useQuery<TokenList, Error>({
    queryKey: ["tokens"],
    queryFn: async () => {
      const res = await fetch("/api/tokens");
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown" }));
        throw new Error(err.error ?? `Token fetch failed: ${res.status}`);
      }
      return res.json();
    },
    staleTime: 3_600_000,
    gcTime: 7_200_000,
    retry: 3,
  });
}

export function useTokenByAddress(address: string | undefined, tokens: Token[] | undefined) {
  if (!address || !tokens) return null;
  return tokens.find((t) => t.address === address) ?? null;
}
