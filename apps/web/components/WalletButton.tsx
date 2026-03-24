"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletButton() {
  const { connected, publicKey, disconnect } = useWallet();

  if (connected && publicKey) {
    const addr = publicKey.toBase58();
    const short = `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/60 font-mono">{short}</span>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 transition-colors border border-red-500/30"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-500 !rounded-xl !text-sm !px-4 !py-2" />;
}
