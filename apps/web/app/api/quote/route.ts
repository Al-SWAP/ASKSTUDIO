import { NextRequest, NextResponse } from "next/server";
import { env, MAX_SLIPPAGE_BPS, MIN_SLIPPAGE_BPS } from "@askstudio/config";
import { getPlatformFeeBps } from "@askstudio/dex";

export const runtime = "edge";

const QUOTE_TIMEOUT_MS = 8_000;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const inputMint = searchParams.get("inputMint");
  const outputMint = searchParams.get("outputMint");
  const amount = searchParams.get("amount");
  const slippageBpsRaw = searchParams.get("slippageBps") ?? "50";

  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json({ error: "Missing required parameters: inputMint, outputMint, amount" }, { status: 400 });
  }

  const amountNum = parseInt(amount, 10);
  if (isNaN(amountNum) || amountNum <= 0) {
    return NextResponse.json({ error: "Invalid amount: must be a positive integer" }, { status: 400 });
  }

  const slippageBps = Math.max(
    MIN_SLIPPAGE_BPS,
    Math.min(MAX_SLIPPAGE_BPS, parseInt(slippageBpsRaw, 10) || 50)
  );

  const platformFeeBps = getPlatformFeeBps();

  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amountNum.toString(),
    slippageBps: slippageBps.toString(),
    swapMode: "ExactIn",
  });

  if (platformFeeBps > 0) {
    params.set("platformFeeBps", platformFeeBps.toString());
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), QUOTE_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(`${env.JUPITER_API}/quote?${params.toString()}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Jupiter quote error: ${errText}` },
        { status: res.status >= 500 ? 502 : res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("timeout") || message.includes("abort")) {
      return NextResponse.json({ error: "Quote request timed out" }, { status: 504 });
    }
    return NextResponse.json({ error: `Quote failed: ${message}` }, { status: 500 });
  }
}
