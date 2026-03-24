export default function TokenInspectorPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-bold text-green-400">Token Inspector</h1>
      <p className="text-white/60 text-sm">
        Query /api/tokens to get the full aggregated token list from Jupiter, Raydium, and Orca.
      </p>
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-xs text-white/70">
        <p>GET /api/tokens</p>
        <p className="mt-2 text-white/40">Returns: &#123; tokens: Token[], lastUpdated: number, sources: string[] &#125;</p>
      </div>
    </div>
  );
}
