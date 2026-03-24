import { NextRequest, NextResponse } from "next/server";
import { env } from "@askstudio/config";

export function middleware(req: NextRequest) {
  const whitelist = env.ADMIN_WALLET_WHITELIST;
  if (whitelist.length === 0) return NextResponse.next();
  const wallet = req.headers.get("x-wallet-address");
  if (!wallet || !whitelist.includes(wallet)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
