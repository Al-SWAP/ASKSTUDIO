import { NextResponse } from "next/server";
import { rpcManager } from "@askstudio/web3";

export const runtime = "nodejs";

export async function GET() {
  const health = await rpcManager.checkAllHealth();
  return NextResponse.json({ endpoints: health });
}
