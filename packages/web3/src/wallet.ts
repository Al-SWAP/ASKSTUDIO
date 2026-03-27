import { type Connection, PublicKey } from "@solana/web3.js";

export interface WalletInfo {
  publicKey: string;
  balance: number;
  network: "mainnet-beta" | "devnet" | "testnet" | "unknown";
}

/**
 * Returns true only when `address` decodes to a valid 32-byte Solana public key.
 * Uses the `PublicKey` constructor rather than a regex so that base58 strings
 * that pass the character-set check but decode to the wrong byte length are
 * correctly rejected.
 */
export function validatePublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export async function getSolBalance(
  connection: Connection,
  walletAddress: string
): Promise<number> {
  const { PublicKey } = await import("@solana/web3.js");
  const lamports = await connection.getBalance(new PublicKey(walletAddress));
  return lamports / 1e9;
}
