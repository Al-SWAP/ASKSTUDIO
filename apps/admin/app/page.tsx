import { getFeeConfig } from "@askstudio/dex";
import { rpcManager } from "@askstudio/web3";

export default async function AdminPage() {
  const feeConfig = getFeeConfig();
  const rpcHealth = rpcManager.getAllHealth();

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Fee Configuration</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/50">Current Fee BPS</p>
            <p className="text-2xl font-bold text-purple-400">{feeConfig.bps}</p>
            <p className="text-white/30 text-xs">{(feeConfig.bps / 100).toFixed(2)}% per swap</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/50">Fee Recipient</p>
            <p className="text-sm font-mono text-white truncate">{feeConfig.recipient}</p>
            <p className={`text-xs mt-1 ${feeConfig.enabled ? "text-green-400" : "text-red-400"}`}>
              {feeConfig.enabled ? "Enabled" : "Disabled"}
            </p>
          </div>
        </div>
        <p className="text-white/40 text-xs">Use POST /api/fee to update fee configuration.</p>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">RPC Health</h2>
        <div className="space-y-2">
          {rpcHealth.map((h) => (
            <div key={h.endpoint} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
              <span className="font-mono text-sm text-white/70 truncate max-w-xs">{h.endpoint}</span>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${h.healthy ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {h.healthy ? "Healthy" : "Unhealthy"}
                </span>
                <span className="text-white/40 text-xs">
                  {h.latencyMs === Infinity ? "—" : `${h.latencyMs}ms`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
