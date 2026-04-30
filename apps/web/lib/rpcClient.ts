import { rpcManager } from "@askstudio/web3";
import type { Commitment } from "@solana/web3.js";

export { rpcManager };

/** Returns a Connection using the best healthy endpoint, with automatic failover. */
export async function getRpcConnection(commitment: Commitment = "confirmed") {
  return rpcManager.getConnectionWithFailover(commitment);
}
