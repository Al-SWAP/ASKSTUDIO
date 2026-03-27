import { env } from "@askstudio/config";
import { combineSignals } from "@askstudio/web3";
import type { QuoteParams, SwapRoute, SwapParams, SwapTransaction } from "./types";

const QUOTE_TIMEOUT_MS = 10_000;
const SWAP_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number
): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      const body = await res.text();
      lastErr = new Error(`HTTP ${res.status}: ${body}`);
      if (res.status < 500) throw lastErr;
    } catch (e) {
      lastErr = e;
      if (i < retries) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
    }
  }
  throw lastErr;
}

export async function getJupiterQuote(params: QuoteParams, signal?: AbortSignal): Promise<SwapRoute> {
  const searchParams = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: params.amount,
    slippageBps: (params.slippageBps ?? 50).toString(),
    swapMode: params.swapMode ?? "ExactIn",
    onlyDirectRoutes: (params.onlyDirectRoutes ?? false).toString(),
    asLegacyTransaction: (params.asLegacyTransaction ?? false).toString(),
  });

  if (params.platformFeeBps !== undefined) {
    searchParams.set("platformFeeBps", params.platformFeeBps.toString());
  }

  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), QUOTE_TIMEOUT_MS);
  const combined = signal ? combineSignals([signal, timeoutController.signal]) : timeoutController.signal;

  try {
    const res = await fetchWithRetry(
      `${env.JUPITER_API}/quote?${searchParams.toString()}`,
      { signal: combined, headers: { Accept: "application/json" } },
      MAX_RETRIES
    );
    clearTimeout(timer);
    const data: SwapRoute = await res.json();
    return data;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

export async function buildJupiterSwapTransaction(
  params: SwapParams,
  signal?: AbortSignal
): Promise<SwapTransaction> {
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), SWAP_TIMEOUT_MS);
  const combined = signal ? combineSignals([signal, timeoutController.signal]) : timeoutController.signal;

  const body: Record<string, unknown> = {
    quoteResponse: params.quoteResponse,
    userPublicKey: params.userPublicKey,
    wrapAndUnwrapSol: params.wrapAndUnwrapSol ?? true,
    dynamicComputeUnitLimit: params.dynamicComputeUnitLimit ?? true,
    skipUserAccountsRpcCalls: params.skipUserAccountsRpcCalls ?? false,
  };

  if (params.feeAccount) body.feeAccount = params.feeAccount;
  if (params.prioritizationFeeLamports !== undefined) {
    body.prioritizationFeeLamports = params.prioritizationFeeLamports;
  }
  if (params.asLegacyTransaction) body.asLegacyTransaction = true;

  try {
    const res = await fetchWithRetry(
      `${env.JUPITER_SWAP_API}`,
      {
        method: "POST",
        signal: combined,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      },
      MAX_RETRIES
    );
    clearTimeout(timer);
    return res.json();
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}
