import { getAnalyticsSummary, getRecentEntries } from "@askstudio/dex";

export default function AnalyticsPage() {
  const summary = getAnalyticsSummary();
  const recent = getRecentEntries(10);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-white/50 text-sm">Total Swaps</p>
          <p className="text-3xl font-bold text-white">{summary.totalSwaps.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-white/50 text-sm">Total Volume (lamports)</p>
          <p className="text-2xl font-bold text-purple-400">{summary.totalVolumeInputLamports.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-white/50 text-sm">Fees Collected (lamports)</p>
          <p className="text-2xl font-bold text-green-400">{summary.totalFeesLamports.toLocaleString()}</p>
        </div>
      </div>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Swaps</h2>
        {recent.length === 0 ? (
          <p className="text-white/40 text-sm">No swaps recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-left border-b border-white/10">
                <th className="pb-2">Time</th>
                <th className="pb-2">Input</th>
                <th className="pb-2">Output</th>
                <th className="pb-2">Fee BPS</th>
                <th className="pb-2">Impact</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((e) => (
                <tr key={e.id} className="border-b border-white/5 text-white/70">
                  <td className="py-2 text-xs">{new Date(e.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2 font-mono text-xs">{e.inputMint.slice(0, 8)}…</td>
                  <td className="py-2 font-mono text-xs">{e.outputMint.slice(0, 8)}…</td>
                  <td className="py-2">{e.feeBps}</td>
                  <td className="py-2">{e.priceImpactPct.toFixed(3)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
