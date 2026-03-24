import { NextRequest, NextResponse } from "next/server";
import { aggregateTokens, filterTokenList } from "@askstudio/tokens";

export const runtime = "edge";
export const revalidate = 3600;

export async function GET(_req: NextRequest) {
  try {
    const list = await aggregateTokens();
    const filtered = filterTokenList(list);
    return NextResponse.json(filtered, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Token aggregation failed: ${message}` }, { status: 500 });
  }
}
