"use client";

import dynamic from "next/dynamic";
import React, { useMemo } from "react";

const WalletProviderInner = dynamic(
  async () => {
    const { ConnectionProvider, WalletProvider: SolanaWalletProvider } = await import(
      "@solana/wallet-adapter-react"
    );
    const { WalletModalProvider } = await import("@solana/wallet-adapter-react-ui");
    const { PhantomWalletAdapter, SolflareWalletAdapter, BackpackWalletAdapter } = await import(
      "@solana/wallet-adapter-wallets"
    );

    // Import CSS for wallet modal
    await import("@solana/wallet-adapter-react-ui/styles.css");

    function InnerProvider({ children }: { children: React.ReactNode }) {
      const endpoint =
        process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.mainnet-beta.solana.com";
      const wallets = useMemo(
        () => [
          new PhantomWalletAdapter(),
          new SolflareWalletAdapter(),
          new BackpackWalletAdapter(),
        ],
        []
      );

      return (
        <ConnectionProvider endpoint={endpoint}>
          <SolanaWalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>{children}</WalletModalProvider>
          </SolanaWalletProvider>
        </ConnectionProvider>
      );
    }

    return InnerProvider;
  },
  { ssr: false, loading: () => null }
);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return <WalletProviderInner>{children}</WalletProviderInner>;
}
