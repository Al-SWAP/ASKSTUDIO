import { NextRequest, NextResponse } from "next/server";
import { env, MAX_SLIPPAGE_BPS } from "@askstudio/config";

export const runtime = "edge";

const QUOTE_TIMEOUT_MS = 8_000;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const inputMint = searchParams.get("inputMint");
  const outputMint = searchParams.get("outputMint");
  const amount = searchParams.get("amount");
  const slippageBpsRaw = searchParams.get("slippageBps") ?? "50";

  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  // Use BigInt to validate and normalise the amount without float precision loss.
  // Solana token amounts are integers that can exceed Number.MAX_SAFE_INTEGER.
  let amountBigInt: bigint;
  try {
    amountBigInt = BigInt(amount);
  } catch {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (amountBigInt <= 0n) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const slippageBpsNum = parseInt(slippageBpsRaw, 10);
  if (isNaN(slippageBpsNum) || slippageBpsNum < 0) {
    return NextResponse.json({ error: "Invalid slippageBps" }, { status: 400 });
  }
  const slippageBps = Math.min(slippageBpsNum, MAX_SLIPPAGE_BPS).toString();

  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amountBigInt.toString(),
    slippageBps,
    swapMode: "ExactIn",
  });

  // AbortSignal.timeout is not supported on all Edge runtimes; use AbortController
  // + setTimeout for broader compatibility.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), QUOTE_TIMEOUT_MS);
  try {
    let response: Response;
    try {
      response = await fetch(`${env.JUPITER_API}/quote?${params.toString()}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Jupiter API error: ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Jupiter v6 /quote returns the route object directly. If a future API version
    // wraps it in { data: [...] }, extract the best (first) route automatically.
    const route =
      data &&
      typeof data === "object" &&
      Array.isArray((data as Record<string, unknown>).data) &&
      ((data as Record<string, unknown>).data as unknown[]).length > 0
        ? ((data as Record<string, unknown>).data as unknown[])[0]
        : data;
    return NextResponse.json(route, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Quote fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
