import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_WALLETS = (process.env.ADMIN_ALLOWED_WALLETS ?? "")
  .split(",")
  .map((w) => w.trim())
  .filter(Boolean);

// Replay-attack window: 5 minutes
const MESSAGE_TTL_MS = 5 * 60 * 1000;

/**
 * Minimal base58 decoder (Bitcoin/Solana alphabet).
 * Used to decode Solana wallet addresses and signatures without external dependencies.
 */
function base58Decode(s: string): Uint8Array {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const map = new Uint8Array(256).fill(255);
  for (let i = 0; i < ALPHABET.length; i++) map[ALPHABET.charCodeAt(i)] = i;

  const bytes: number[] = [0];
  for (const char of s) {
    const digit = map[char.charCodeAt(0)];
    if (digit === 255) throw new Error(`Invalid base58 character: ${char}`);
    let carry = digit;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  // Preserve leading zeros
  for (const char of s) {
    if (char !== "1") break;
    bytes.push(0);
  }
  return new Uint8Array(bytes.reverse());
}

function unauthorized(message: string) {
  return new NextResponse(
    JSON.stringify({ error: `Unauthorized: ${message}` }),
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Admin middleware — requires a valid ed25519 wallet signature for every request.
 *
 * Required request headers:
 *   x-wallet-address  — base58-encoded Solana public key
 *   x-wallet-signature — base58-encoded ed25519 signature over the raw message bytes
 *   x-wallet-message  — JSON string: { timestamp: <unix-ms>, domain: "<host>" }
 *
 * Clients must re-sign on each request (or cache the signed token) and include fresh headers.
 * The timestamp window prevents replay attacks; the domain prevents cross-site replay.
 */
export async function middleware(req: NextRequest) {
  if (ALLOWED_WALLETS.length === 0) {
    return NextResponse.next();
  }

  const walletAddress = req.headers.get("x-wallet-address");
  const walletSignature = req.headers.get("x-wallet-signature");
  const walletMessage = req.headers.get("x-wallet-message");

  if (!walletAddress || !walletSignature || !walletMessage) {
    return unauthorized("Missing authentication headers (x-wallet-address, x-wallet-signature, x-wallet-message)");
  }

  const wallet = walletAddress;
  if (!ALLOWED_WALLETS.includes(wallet)) {
    return unauthorized("Wallet not on allowlist");
  }

  // Parse and validate message payload
  let parsed: { timestamp: number; domain: string };
  try {
    parsed = JSON.parse(walletMessage);
  } catch {
    return unauthorized("Malformed message JSON");
  }

  if (!parsed.timestamp || !Number.isFinite(parsed.timestamp)) {
    return unauthorized("Missing or invalid timestamp in message");
  }

  if (Date.now() - parsed.timestamp > MESSAGE_TTL_MS) {
    return unauthorized("Message expired — please re-sign");
  }

  // Reject clocks that are more than 1 minute ahead to prevent future-timestamp abuse.
  if (parsed.timestamp > Date.now() + 60_000) {
    return unauthorized("Message timestamp is too far in the future");
  }

  // Validate domain to prevent cross-origin replay attacks
  if (parsed.domain !== req.nextUrl.host) {
    return unauthorized("Domain mismatch");
  }

  // Verify ed25519 signature using the Web Crypto API (available in Edge runtime)
  try {
    const pubKeyBytes = base58Decode(walletAddress);
    const sigBytes = base58Decode(walletSignature);
    const msgBytes = new TextEncoder().encode(walletMessage);

    // Validate key/signature lengths before handing off to Web Crypto.
    if (pubKeyBytes.length !== 32) {
      return unauthorized("Invalid public key length");
    }
    if (sigBytes.length !== 64) {
      return unauthorized("Invalid signature length");
    }

    // Cast to ArrayBuffer: our buffers are always ArrayBuffer-backed (never SharedArrayBuffer).
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      pubKeyBytes.buffer as ArrayBuffer,
      { name: "Ed25519" },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify(
      "Ed25519",
      cryptoKey,
      sigBytes.buffer as ArrayBuffer,
      msgBytes.buffer as ArrayBuffer
    );
    if (!valid) {
      return unauthorized("Invalid signature");
    }
  } catch {
    return unauthorized("Signature verification failed");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
