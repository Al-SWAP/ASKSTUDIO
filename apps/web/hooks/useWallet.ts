"use client";

import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";
import { shortenAddress } from "@askstudio/web3";

export function useWallet() {
  const {
    publicKey,
    connected,
    connecting,
    disconnecting,
    disconnect,
    select,
    wallets,
    wallet,
    sendTransaction,
    signTransaction,
    signAllTransactions,
  } = useSolanaWallet();

  const shortAddress = publicKey ? shortenAddress(publicKey.toBase58()) : null;

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  }, [disconnect]);

  return {
    publicKey,
    connected,
    connecting,
    disconnecting,
    disconnect: handleDisconnect,
    select,
    wallets,
    wallet,
    shortAddress,
    sendTransaction,
    signTransaction,
    signAllTransactions,
  };
}
