import type { Connection } from "@solana/web3.js";

export interface WalletInfo {
  publicKey: string;
  balance: number;
  network: "mainnet-beta" | "devnet" | "testnet" | "unknown";
}

export function validatePublicKey(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
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
