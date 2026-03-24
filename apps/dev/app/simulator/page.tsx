import { scoreRoute } from "@askstudio/dex";
import type { SwapRoute } from "@askstudio/dex";

const EXAMPLE_ROUTE: SwapRoute = {
  inputMint: "So11111111111111111111111111111111111111112",
  inAmount: "1000000000",
  outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  outAmount: "95000000",
  otherAmountThreshold: "94525000",
  swapMode: "ExactIn",
  slippageBps: 50,
  priceImpactPct: "0.12",
  routePlan: [
    {
      swapInfo: {
        ammKey: "raydium_amm_1",
        label: "Raydium",
        inputMint: "So11111111111111111111111111111111111111112",
        outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        inAmount: "1000000000",
        outAmount: "95000000",
        feeAmount: "2500000",
        feeMint: "So11111111111111111111111111111111111111112",
      },
      percent: 100,
    },
  ],
};

export default function SimulatorPage() {
  const scored = scoreRoute(EXAMPLE_ROUTE, 120);
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-bold text-green-400">Swap Simulator</h1>
      <p className="text-white/60 text-sm">AI route scoring simulation (no signing required).</p>
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <p className="text-white font-semibold">Example Route: SOL → USDC</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/40 text-xs">AI Score</p>
            <p className="text-purple-400 text-2xl font-bold">{scored.score.toFixed(1)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/40 text-xs">Price Impact</p>
            <p className="text-yellow-400 text-2xl font-bold">{parseFloat(EXAMPLE_ROUTE.priceImpactPct).toFixed(3)}%</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/40 text-xs">Output Score</p>
            <p className="text-white font-bold">{scored.breakdown.outputScore.toFixed(1)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/40 text-xs">Hop Score</p>
            <p className="text-white font-bold">{scored.breakdown.hopScore.toFixed(1)}</p>
          </div>
        </div>
        <pre className="text-xs text-white/50 font-mono mt-2 overflow-auto max-h-48">
          {JSON.stringify(scored, null, 2)}
        </pre>
      </div>
    </div>
  );
}
