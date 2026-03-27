import { NextRequest, NextResponse } from "next/server";
import { blacklistToken, unblacklistToken, getBlacklist } from "@askstudio/tokens";

export const runtime = "nodejs";

const BASE58_PUBKEY_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function GET() {
  return NextResponse.json({ blacklist: getBlacklist() });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, mint } = body;
  if (!mint || typeof mint !== "string") {
    return NextResponse.json({ error: "mint address required" }, { status: 400 });
  }

  if (!BASE58_PUBKEY_RE.test(mint)) {
    return NextResponse.json({ error: "Invalid mint: must be a valid base58 Solana public key" }, { status: 400 });
  }

  if (action === "blacklist") {
    blacklistToken(mint);
    return NextResponse.json({ ok: true, action: "blacklisted", mint });
  } else if (action === "unblacklist") {
    unblacklistToken(mint);
    return NextResponse.json({ ok: true, action: "unblacklisted", mint });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
