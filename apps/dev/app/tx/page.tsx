export default function TxBuilderPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-bold text-green-400">Transaction Builder</h1>
      <p className="text-white/60 text-sm">
        Use the Jupiter swap API to build a transaction. POST to /api/swap with quoteResponse and userPublicKey.
      </p>
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-xs text-white/70">
        <p>POST /api/swap</p>
        <pre className="mt-2">{JSON.stringify({ quoteResponse: "...", userPublicKey: "Your_Public_Key" }, null, 2)}</pre>
      </div>
    </div>
  );
}
