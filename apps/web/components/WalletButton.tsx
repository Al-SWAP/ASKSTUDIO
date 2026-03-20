"use client";

import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  async () => {
    const { WalletMultiButton } = await import("@solana/wallet-adapter-react-ui");
    return WalletMultiButton;
  },
  { ssr: false, loading: () => (
    <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm">
      Loading...
    </button>
  )}
);

export function WalletButton() {
  return (
    <div className="wallet-button-wrapper">
      <WalletMultiButton
        style={{
          background: "rgba(139, 92, 246, 0.2)",
          border: "1px solid rgba(139, 92, 246, 0.4)",
          borderRadius: "12px",
          color: "white",
          fontSize: "14px",
          fontWeight: 600,
          padding: "8px 16px",
          height: "auto",
          transition: "all 0.2s",
        }}
      />
    </div>
  );
}
