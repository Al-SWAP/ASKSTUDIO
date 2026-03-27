import { NextRequest, NextResponse } from "next/server";
import { env, MAX_SLIPPAGE_BPS, MIN_SLIPPAGE_BPS } from "@askstudio/config";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const inputMint = searchParams.get("inputMint");
  const outputMint = searchParams.get("outputMint");
  const amount = searchParams.get("amount");
  const slippageBpsRaw = searchParams.get("slippageBps") ?? "50";

  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json({ error: "Missing inputMint, outputMint, amount" }, { status: 400 });
  }

  const amountNum = parseInt(amount, 10);
  if (isNaN(amountNum) || amountNum <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const slippageBps = Math.max(MIN_SLIPPAGE_BPS, Math.min(MAX_SLIPPAGE_BPS, parseInt(slippageBpsRaw, 10) || 50));

  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amountNum.toString(),
    slippageBps: slippageBps.toString(),
    swapMode: "ExactIn",
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${env.JUPITER_API}/quote?${params}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}
