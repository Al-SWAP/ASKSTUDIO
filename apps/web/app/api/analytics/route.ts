import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary, getRecentEntries, recordSwap } from "@askstudio/dex";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const since = searchParams.get("since");
  const sinceMs = since ? parseInt(since, 10) : undefined;

  const summary = getAnalyticsSummary(sinceMs);
  const recent = getRecentEntries(20);

  return NextResponse.json(
    { summary, recent },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    inputMint, outputMint, inputAmount, outputAmount,
    feeBps, feeAmountLamports, signature, priceImpactPct, routeCount,
  } = body;

  if (
    typeof inputMint !== "string" || typeof outputMint !== "string" ||
    typeof inputAmount !== "number" || typeof outputAmount !== "number" ||
    typeof feeBps !== "number" || typeof feeAmountLamports !== "number" ||
    typeof signature !== "string" || typeof priceImpactPct !== "number" ||
    typeof routeCount !== "number"
  ) {
    return NextResponse.json({ error: "Invalid analytics payload" }, { status: 400 });
  }

  const entry = recordSwap({
    inputMint, outputMint, inputAmount, outputAmount,
    feeBps, feeAmountLamports, signature, priceImpactPct, routeCount,
  });

  return NextResponse.json({ id: entry.id }, { status: 201 });
}
