import { env } from "@askstudio/config";
import type { Token, RaydiumPoolRaw } from "./types";
import { combineSignals } from "./utils";

const FETCH_TIMEOUT_MS = 15_000;
const KNOWN_SYMBOLS: Record<string, string> = {
  So11111111111111111111111111111111111111112: "SOL",
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
};

export async function fetchRaydiumTokens(signal?: AbortSignal): Promise<Token[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const combined = signal
    ? combineSignals([signal, controller.signal])
    : controller.signal;

  try {
    const res = await fetch(env.RAYDIUM_API, {
      signal: combined,
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    } as RequestInit);

    clearTimeout(timer);

    if (!res.ok) throw new Error(`Raydium API failed: ${res.status}`);

    const data = await res.json() as { official?: RaydiumPoolRaw[]; unOfficial?: RaydiumPoolRaw[] };
    const pools = [...(data.official ?? []), ...(data.unOfficial ?? [])];
    const mintSet = new Map<string, Token>();

    for (const pool of pools) {
      for (const [mint, decimals] of [
        [pool.baseMint, pool.baseDecimals],
        [pool.quoteMint, pool.quoteDecimals],
      ] as [string, number][]) {
        if (!mintSet.has(mint)) {
          const sym = KNOWN_SYMBOLS[mint] ?? mint.slice(0, 6).toUpperCase();
          mintSet.set(mint, {
            address: mint,
            symbol: sym,
            name: sym,
            decimals: decimals ?? 9,
            sources: ["raydium" as const],
            tags: [],
          });
        }
      }
    }

    return Array.from(mintSet.values());
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}
