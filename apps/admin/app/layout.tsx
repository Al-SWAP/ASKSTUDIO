import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AskStudio Admin",
  description: "Admin panel for AskStudio DEX aggregator",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-gray-900 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="text-purple-400 font-bold">AskStudio Admin</span>
            <a href="/admin" className="text-white/60 hover:text-white text-sm">Dashboard</a>
            <a href="/admin/rpc" className="text-white/60 hover:text-white text-sm">RPC Health</a>
            <a href="/admin/tokens" className="text-white/60 hover:text-white text-sm">Tokens</a>
            <a href="/admin/analytics" className="text-white/60 hover:text-white text-sm">Analytics</a>
          </div>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
