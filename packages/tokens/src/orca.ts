import { env } from "@askstudio/config";
import type { Token, OrcaPoolRaw } from "./types";
import { combineSignals } from "./utils";

const FETCH_TIMEOUT_MS = 15_000;

export async function fetchOrcaTokens(signal?: AbortSignal): Promise<Token[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const combined = signal
    ? combineSignals([signal, controller.signal])
    : controller.signal;

  try {
    const res = await fetch(env.ORCA_API, {
      signal: combined,
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    } as RequestInit);

    clearTimeout(timer);

    if (!res.ok) throw new Error(`Orca API failed: ${res.status}`);

    const data = await res.json() as Record<string, OrcaPoolRaw>;
    const mintSet = new Map<string, Token>();

    for (const pool of Object.values(data)) {
      for (const [mint, decimals] of [
        [pool.tokenMintA, pool.decimalsA ?? 9],
        [pool.tokenMintB, pool.decimalsB ?? 9],
      ] as [string, number][]) {
        if (mint && !mintSet.has(mint)) {
          const sym = mint.slice(0, 6).toUpperCase();
          mintSet.set(mint, {
            address: mint,
            symbol: sym,
            name: sym,
            decimals,
            sources: ["orca" as const],
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
