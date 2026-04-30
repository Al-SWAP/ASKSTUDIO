"use client";

import dynamic from "next/dynamic";
import React, { useMemo } from "react";

const WalletProviderInner = dynamic(
  async () => {
    const { ConnectionProvider, WalletProvider: SolanaWalletProvider } = await import(
      "@solana/wallet-adapter-react"
    );
    const { WalletModalProvider } = await import("@solana/wallet-adapter-react-ui");
    const { PhantomWalletAdapter, SolflareWalletAdapter } = await import(
      "@solana/wallet-adapter-wallets"
    );
    const { rpcManager } = await import("@askstudio/web3");

    // Import CSS for wallet modal
    // @ts-expect-error - CSS file import without type declarations
    await import("@solana/wallet-adapter-react-ui/styles.css");

    // NOTE: WalletConnect v2 can be added here by installing
    // `@solana/wallet-adapter-walletconnect` and adding:
    //   new WalletConnectWalletAdapter({ network: WalletAdapterNetwork.Mainnet,
    //     options: { projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID } })
    // to the wallets array below.

    function InnerProvider({ children }: { children: React.ReactNode }) {
      // Use the best available RPC endpoint from the RpcManager instead of a hard-coded URL.
      const endpoint = rpcManager.getBestEndpoint();
      const wallets = useMemo(
        () => [
          new PhantomWalletAdapter(),
          new SolflareWalletAdapter(),
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
