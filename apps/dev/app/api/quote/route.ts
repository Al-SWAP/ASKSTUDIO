import { NextRequest, NextResponse } from "next/server";
import { env } from "@askstudio/config";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const inputMint = searchParams.get("inputMint");
  const outputMint = searchParams.get("outputMint");
  const amount = searchParams.get("amount");
  const slippageBps = searchParams.get("slippageBps") ?? "50";

  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const amountNum = parseInt(amount, 10);
  if (isNaN(amountNum) || amountNum <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const params = new URLSearchParams({ inputMint, outputMint, amount: amountNum.toString(), slippageBps, swapMode: "ExactIn" });

  try {
    const response = await fetch(`${env.JUPITER_API}/quote?${params.toString()}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Jupiter API error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Quote fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
