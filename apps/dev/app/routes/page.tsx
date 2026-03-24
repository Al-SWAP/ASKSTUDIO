export default function RoutesPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-bold text-green-400">Route Debugger</h1>
      <p className="text-white/60 text-sm">Query /api/quote with inputMint, outputMint, amount to inspect raw Jupiter routes.</p>
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-white/50 text-xs font-mono">GET /api/quote?inputMint=So11111111111111111111111111111111111111112&amp;outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amp;amount=1000000000&amp;slippageBps=50</p>
      </div>
    </div>
  );
}
