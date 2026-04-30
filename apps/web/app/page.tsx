import { SwapCard } from "@/components/SwapCard";
import { WalletButton } from "@/components/WalletButton";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-sm">
            A
          </div>
          <span className="font-bold text-lg tracking-tight">AskStudio</span>
          <span className="text-white/30 text-sm">DEX</span>
        </div>
        <WalletButton />
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Swap{" "}
              <span className="neon-text">smarter</span>
            </h1>
            <p className="text-white/50 text-sm">
              Best rates aggregated from Jupiter, Raydium &amp; Orca
            </p>
          </div>
          <SwapCard />
        </div>
      </div>

      <footer className="text-center py-4 text-white/20 text-xs border-t border-white/5">
        Built with ❤️ on Solana
      </footer>
    </main>
  );
}
