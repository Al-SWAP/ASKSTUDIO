import { NextRequest, NextResponse } from "next/server";
import { aggregateTokens } from "@askstudio/tokens";

export const runtime = "edge";

export async function GET(_req: NextRequest) {
  try {
    const list = await aggregateTokens();
    return NextResponse.json(list);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
