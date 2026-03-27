import { SwapCard } from "../components/SwapCard";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
            AskStudio
          </h1>
          <p className="text-white/50 text-sm">AI-powered DEX aggregator · Jupiter + Raydium + Orca</p>
        </div>
        <SwapCard />
        <p className="text-center text-white/30 text-xs">
          Powered by Jupiter API · Real on-chain swaps · No custody
        </p>
      </div>
    </main>
  );
}
