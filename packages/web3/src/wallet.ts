import { PublicKey, Transaction, VersionedTransaction, Connection } from "@solana/web3.js";

export interface WalletInfo {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export async function getSolBalance(connection: Connection, publicKey: PublicKey): Promise<number> {
  const lamports = await connection.getBalance(publicKey);
  return lamports / 1e9;
}

export async function getTokenBalance(
  connection: Connection,
  walletPublicKey: PublicKey,
  tokenMint: PublicKey
): Promise<number> {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
      mint: tokenMint,
    });
    if (tokenAccounts.value.length === 0) return 0;
    const account = tokenAccounts.value[0];
    const amount = account.account.data.parsed.info.tokenAmount.uiAmount;
    return amount ?? 0;
  } catch {
    return 0;
  }
}

export function isVersionedTransaction(tx: Transaction | VersionedTransaction): tx is VersionedTransaction {
  return "version" in tx;
}
