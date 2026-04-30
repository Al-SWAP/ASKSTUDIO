import { env } from "@askstudio/config";
import type { QuoteParams, SwapRoute, SwapParams, SwapTransaction } from "./types";

const QUOTE_TIMEOUT_MS = 10_000;

export async function getJupiterQuote(params: QuoteParams, signal?: AbortSignal): Promise<SwapRoute> {
  const searchParams = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: params.amount.toString(),
    slippageBps: (params.slippageBps ?? 50).toString(),
    swapMode: params.swapMode ?? "ExactIn",
    onlyDirectRoutes: (params.onlyDirectRoutes ?? false).toString(),
    asLegacyTransaction: (params.asLegacyTransaction ?? false).toString(),
  });

  if (params.platformFeeBps !== undefined) {
    searchParams.set("platformFeeBps", params.platformFeeBps.toString());
  }

  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), QUOTE_TIMEOUT_MS);

  const combinedSignal = signal
    ? anySignal([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(`${env.JUPITER_API}/quote?${searchParams.toString()}`, {
      signal: combinedSignal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jupiter quote failed (${response.status}): ${errorText}`);
    }

    const data: SwapRoute = await response.json();
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getJupiterSwapTransaction(
  params: SwapParams,
  signal?: AbortSignal
): Promise<SwapTransaction> {
  const response = await fetch(env.JUPITER_SWAP_API, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      quoteResponse: params.quoteResponse,
      userPublicKey: params.userPublicKey,
      wrapAndUnwrapSol: params.wrapAndUnwrapSol ?? true,
      asLegacyTransaction: params.asLegacyTransaction ?? false,
      feeAccount: params.feeAccount,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Jupiter swap transaction failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  // Prefer the native AbortSignal.any when available (Node 18.17+ / Chrome 116+)
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any(signals);
  }
  const controller = new AbortController();
  const cleanup: (() => void)[] = [];

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    const onAbort = () => {
      controller.abort();
      cleanup.forEach((fn) => fn());
    };
    signal.addEventListener("abort", onAbort, { once: true });
    cleanup.push(() => signal.removeEventListener("abort", onAbort));
  }

  // Also clean up all listeners once the combined signal itself fires.
  controller.signal.addEventListener("abort", () => cleanup.forEach((fn) => fn()), { once: true });

  return controller.signal;
}
