import { NextResponse } from "next/server";
import { aggregateTokens } from "@askstudio/tokens";

export const revalidate = 3600;

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const tokenList = await aggregateTokens(controller.signal);
    clearTimeout(timeout);

    return NextResponse.json(tokenList, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Token aggregation failed";
    return NextResponse.json({ error: message, tokens: [] }, { status: 500 });
  }
}
