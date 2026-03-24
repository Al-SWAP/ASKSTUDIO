import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from "../providers/QueryProvider";
import { WalletProvider } from "../providers/WalletProvider";

export const metadata: Metadata = {
  title: "AskStudio — Jupiter-class DEX Aggregator",
  description: "AI-powered DEX aggregator with multi-source liquidity, real-time routing, and on-chain fee capture",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <WalletProvider>{children}</WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
