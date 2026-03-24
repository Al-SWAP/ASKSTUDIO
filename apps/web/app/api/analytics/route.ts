import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary, getRecentEntries } from "@askstudio/dex";

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
