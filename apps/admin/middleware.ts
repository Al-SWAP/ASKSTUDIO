import { NextRequest, NextResponse } from "next/server";
import { env } from "@askstudio/config";
import nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * Verifies that the wallet signed the provided message.
 * Clients must include three headers:
 *   x-wallet-address   — base58 public key
 *   x-wallet-message   — UTF-8 message that was signed (e.g. a timestamp nonce)
 *   x-wallet-signature — base58-encoded ed25519 signature
 */
function verifyWalletSignature(req: NextRequest, wallet: string): boolean {
  const message = req.headers.get("x-wallet-message");
  const signature = req.headers.get("x-wallet-signature");

  if (!message || !signature) return false;

  try {
    const publicKeyBytes = bs58.decode(wallet);
    const signatureBytes = bs58.decode(signature);
    const messageBytes = new TextEncoder().encode(message);
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const whitelist = env.ADMIN_WALLET_WHITELIST;
  if (whitelist.length === 0) return NextResponse.next();

  const wallet = req.headers.get("x-wallet-address");
  if (!wallet || !whitelist.includes(wallet)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!verifyWalletSignature(req, wallet)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
