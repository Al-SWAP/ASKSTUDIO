import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { WalletProvider } from "@/providers/WalletProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AskStudio DEX | Best Solana Swap Rates",
  description: "Aggregate the best swap routes across Jupiter, Raydium, and Orca on Solana",
  keywords: ["solana", "dex", "swap", "defi", "aggregator"],
  openGraph: {
    title: "AskStudio DEX",
    description: "Best Solana swap rates aggregated",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <QueryProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
