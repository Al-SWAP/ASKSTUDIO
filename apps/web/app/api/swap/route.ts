import { NextRequest, NextResponse } from "next/server";
import { env } from "@askstudio/config";
import { getFeeConfig } from "@askstudio/dex";

export const runtime = "edge";

const SWAP_TIMEOUT_MS = 15_000;

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

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(userPublicKey)) {
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

  if (feeConfig.enabled && feeConfig.recipient) {
    swapPayload.feeAccount = feeConfig.recipient;
  }

  try {
    const res = await fetch(`${env.JUPITER_SWAP_API}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(swapPayload),
      signal: AbortSignal.timeout(SWAP_TIMEOUT_MS),
    });

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
