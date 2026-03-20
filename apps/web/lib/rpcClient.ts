import { rpcManager } from "@askstudio/web3";

export { rpcManager };

export function getRpcConnection(commitment?: Parameters<typeof rpcManager.getConnection>[0]) {
  return rpcManager.getConnection(commitment);
}
