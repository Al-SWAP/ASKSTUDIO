import { NextRequest, NextResponse } from "next/server";
import { env } from "@askstudio/config";
import { getFeeConfig } from "@askstudio/dex";

export const runtime = "edge";

const SWAP_TIMEOUT_MS = 15_000;
const BASE58_PUBKEY_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { quoteResponse, userPublicKey } = body;

  if (!quoteResponse || !userPublicKey || typeof userPublicKey !== "string") {
    return NextResponse.json({ error: "Missing quoteResponse or userPublicKey" }, { status: 400 });
  }

  if (!BASE58_PUBKEY_RE.test(userPublicKey)) {
    return NextResponse.json({ error: "Invalid wallet public key" }, { status: 400 });
  }

  const feeConfig = getFeeConfig();
  const swapPayload: Record<string, unknown> = {
    quoteResponse,
    userPublicKey,
    wrapAndUnwrapSol: true,
    dynamicComputeUnitLimit: true,
    skipUserAccountsRpcCalls: false,
    prioritizationFeeLamports: 1000,
  };

  // Only attach platform fee when the fee account is a valid base58 pubkey (initialized SPL ATA).
  // An empty or non-base58 FEE_RESERVE disables fee routing to avoid swap build failures.
  if (feeConfig.enabled && feeConfig.recipient && BASE58_PUBKEY_RE.test(feeConfig.recipient)) {
    swapPayload.feeAccount = feeConfig.recipient;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SWAP_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(`${env.JUPITER_SWAP_API}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(swapPayload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Jupiter swap error: ${errText}` },
        { status: res.status >= 500 ? 502 : res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Swap failed: ${message}` }, { status: 500 });
  }
}
