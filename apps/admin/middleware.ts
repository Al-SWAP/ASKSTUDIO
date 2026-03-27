import { NextRequest, NextResponse } from "next/server";
import { env } from "@askstudio/config";
import nacl from "tweetnacl";
import bs58 from "bs58";

/** Maximum age of a signed message before it is rejected as a replay. */
const MESSAGE_TTL_MS = 5 * 60 * 1_000; // 5 minutes
/** Maximum allowed clock skew (future-dated messages beyond this are rejected). */
const CLOCK_SKEW_MS = 30_000; // 30 seconds

/**
 * Verifies that the wallet signed the provided message AND that the message is
 * fresh enough to prevent replay attacks.
 *
 * Clients must include three headers:
 *   x-wallet-address   — base58 public key
 *   x-wallet-message   — JSON string: { "timestamp": <unix-ms>, "domain": "<host>" }
 *   x-wallet-signature — base58-encoded ed25519 signature over the UTF-8 message
 *
 * The message is rejected if:
 *   - it is not valid JSON
 *   - it does not contain a numeric `timestamp` field
 *   - the timestamp is older than MESSAGE_TTL_MS (default 5 min)
 *   - `domain` does not match the request host (cross-host replay protection)
 *   - the ed25519 signature does not verify
 */
function verifyWalletSignature(req: NextRequest, wallet: string): boolean {
  const message = req.headers.get("x-wallet-message");
  const signature = req.headers.get("x-wallet-signature");

  if (!message || !signature) return false;

  // Verify the ed25519 signature first (cheap key-material check).
  try {
    const publicKeyBytes = bs58.decode(wallet);
    const signatureBytes = bs58.decode(signature);
    const messageBytes = new TextEncoder().encode(message);
    if (!nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)) {
      return false;
    }
  } catch {
    return false;
  }

  // Validate message freshness and origin to prevent replay of captured signatures.
  // The client must embed a `timestamp` (unix ms) and `domain` in the signed JSON payload.
  try {
    const parsed = JSON.parse(message) as Record<string, unknown>;
    if (typeof parsed.timestamp !== "number") return false;
    const now = Date.now();
    // Reject messages older than the TTL (replay protection).
    if (now - parsed.timestamp > MESSAGE_TTL_MS) return false;
    // Reject messages signed with a future timestamp (bypass via future-dating).
    if (parsed.timestamp > now + CLOCK_SKEW_MS) return false;
    // Reject messages signed for a different host (cross-host replay protection).
    if (typeof parsed.domain !== "string" || parsed.domain !== req.nextUrl.host) return false;
  } catch {
    // Message is not valid JSON — reject; plain-string messages cannot prove freshness.
    return false;
  }

  return true;
}

export function middleware(req: NextRequest) {
  const whitelist = env.ADMIN_WALLET_WHITELIST;
  const isProduction = process.env.NODE_ENV === "production";

  if (whitelist.length === 0) {
    // Fail closed in production if the admin whitelist is not configured.
    if (isProduction) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // In non-production environments, allow bypass for local development.
    return NextResponse.next();
  }

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
  // Protect all routes in the admin app, not just API routes.
  matcher: ["/:path*"],
};
