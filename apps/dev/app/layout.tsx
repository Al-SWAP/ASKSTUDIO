import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AskStudio Dev",
  description: "Developer panel for AskStudio DEX aggregator",
};

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/rpc", label: "RPC Selector" },
  { href: "/routes", label: "Route Debugger" },
  { href: "/tx", label: "TX Builder" },
  { href: "/simulator", label: "Swap Simulator" },
  { href: "/tokens", label: "Token Inspector" },
];

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <aside className="w-56 border-r border-white/5 bg-white/2 flex flex-col gap-1 pt-6 px-3">
            <div className="flex items-center gap-2 px-3 mb-6">
              <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center font-bold text-xs">D</div>
              <span className="font-bold text-sm">Dev Panel</span>
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </aside>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
