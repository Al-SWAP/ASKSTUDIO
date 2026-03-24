import { env } from "@askstudio/config";
import type { Token, JupiterTokenRaw } from "./types";

const FETCH_TIMEOUT_MS = 15_000;

export async function fetchJupiterTokens(signal?: AbortSignal): Promise<Token[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const combined = signal
    ? AbortSignal.any([signal, controller.signal])
    : controller.signal;

  try {
    const res = await fetch(env.TOKEN_LIST, {
      signal: combined,
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    } as RequestInit);

    clearTimeout(timer);

    if (!res.ok) throw new Error(`Jupiter token list failed: ${res.status}`);
    const raw: JupiterTokenRaw[] = await res.json();
    return raw.map((t) => ({
      address: t.address,
      symbol: t.symbol ?? t.address.slice(0, 6),
      name: t.name ?? t.symbol ?? t.address.slice(0, 8),
      decimals: t.decimals ?? 9,
      logoURI: t.logoURI,
      tags: t.tags ?? [],
      sources: ["jupiter" as const],
      chainId: t.chainId ?? 101,
    }));
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}
