import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_WALLETS = (process.env.ADMIN_ALLOWED_WALLETS ?? "")
  .split(",")
  .map((w) => w.trim().toLowerCase())
  .filter(Boolean);

export function middleware(req: NextRequest) {
  const walletHeader = req.headers.get("x-wallet-address");
  if (ALLOWED_WALLETS.length === 0) {
    return NextResponse.next();
  }
  if (!walletHeader || !ALLOWED_WALLETS.includes(walletHeader.toLowerCase())) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized: wallet not on allowlist" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/tokens/:path*", "/rpc/:path*", "/flags/:path*"],
};
