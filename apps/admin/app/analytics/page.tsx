import type { AnalyticsSummary } from "@askstudio/dex";
import type { AnalyticsEntry } from "@askstudio/dex";

// Force dynamic rendering — analytics must not be stale from a build-time snapshot.
export const dynamic = "force-dynamic";

const EMPTY_SUMMARY: AnalyticsSummary = {
  totalSwaps: 0,
  totalVolumeInputLamports: 0,
  totalVolumeOutputLamports: 0,
  totalFeesLamports: 0,
  averagePriceImpact: 0,
  averageRouteCount: 0,
  periodStart: 0,
  periodEnd: 0,
};

export default async function AnalyticsPage() {
  // Fetch from the admin app's own /api/analytics endpoint so the data path
  // is consistent and can later be backed by a shared store without page changes.
  const baseUrl =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT ?? 3001}`;

  let summary: AnalyticsSummary = EMPTY_SUMMARY;
  let recent: AnalyticsEntry[] = [];

  try {
    const res = await fetch(`${baseUrl}/api/analytics`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      summary = data.summary ?? EMPTY_SUMMARY;
      recent = data.recent ?? [];
    }
  } catch {
    // If the API is unreachable, render with empty data.
  }

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
