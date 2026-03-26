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

  // Amounts are sent as strings to preserve u64 precision.
  const isUint64String = (v: unknown) => typeof v === "string" && /^\d+$/.test(v);

  if (
    typeof inputMint !== "string" || typeof outputMint !== "string" ||
    !isUint64String(inputAmount) || !isUint64String(outputAmount) ||
    typeof feeBps !== "number" || !isUint64String(feeAmountLamports) ||
    typeof signature !== "string" || typeof priceImpactPct !== "number" ||
    typeof routeCount !== "number"
  ) {
    return NextResponse.json({ error: "Invalid analytics payload" }, { status: 400 });
  }

  const entry = recordSwap({
    inputMint: inputMint as string,
    outputMint: outputMint as string,
    inputAmount: inputAmount as string,
    outputAmount: outputAmount as string,
    feeBps: feeBps as number,
    feeAmountLamports: feeAmountLamports as string,
    signature: signature as string,
    priceImpactPct: priceImpactPct as number,
    routeCount: routeCount as number,
  });

  return NextResponse.json({ id: entry.id }, { status: 201 });
}
