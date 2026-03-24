import { NextRequest, NextResponse } from "next/server";
import { blacklistToken, unblacklistToken, getBlacklist } from "@askstudio/tokens";

export const runtime = "nodejs";

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

  if (action === "blacklist") {
    blacklistToken(mint);
    return NextResponse.json({ ok: true, action: "blacklisted", mint });
  } else if (action === "unblacklist") {
    unblacklistToken(mint);
    return NextResponse.json({ ok: true, action: "unblacklisted", mint });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
