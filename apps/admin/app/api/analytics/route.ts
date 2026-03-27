import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary, getRecentEntries } from "@askstudio/dex";

export const runtime = "nodejs";

// NOTE: Analytics are stored in-memory and are scoped to this Node.js process.
// In serverless/multi-instance deployments each instance has its own store.
// Replace with a durable DB/KV backend for production multi-instance use.
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
