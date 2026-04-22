import { NextRequest, NextResponse } from "next/server";
import { getFeeConfig, setFeeConfig } from "@askstudio/dex";
import { MAX_FEE_BPS, MIN_FEE_BPS } from "@askstudio/config";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getFeeConfig());
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { bps, recipient, enabled } = body;

  if (bps !== undefined) {
    const bpsNum = Number(bps);
    if (isNaN(bpsNum) || bpsNum < MIN_FEE_BPS || bpsNum > MAX_FEE_BPS) {
      return NextResponse.json({ error: `BPS must be ${MIN_FEE_BPS}–${MAX_FEE_BPS}` }, { status: 400 });
    }
  }

  try {
    const updated = setFeeConfig({
      ...(bps !== undefined ? { bps: Number(bps) } : {}),
      ...(recipient !== undefined ? { recipient: String(recipient) } : {}),
      ...(enabled !== undefined ? { enabled: Boolean(enabled) } : {}),
    });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Update failed" }, { status: 400 });
  }
}
