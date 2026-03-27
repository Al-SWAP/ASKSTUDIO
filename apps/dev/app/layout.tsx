import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AskStudio Dev Tools",
  description: "Developer panel for AskStudio DEX aggregator",
};

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-gray-900 border-b border-white/10 px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="text-green-400 font-bold font-mono">AskStudio Dev</span>
            <a href="/dev" className="text-white/60 hover:text-white text-sm">Tools</a>
            <a href="/dev/rpc" className="text-white/60 hover:text-white text-sm">RPC</a>
            <a href="/dev/routes" className="text-white/60 hover:text-white text-sm">Routes</a>
            <a href="/dev/tx" className="text-white/60 hover:text-white text-sm">TX Builder</a>
            <a href="/dev/simulator" className="text-white/60 hover:text-white text-sm">Simulator</a>
            <a href="/dev/tokens" className="text-white/60 hover:text-white text-sm">Tokens</a>
          </div>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
