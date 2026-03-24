import { rpcManager } from "@askstudio/web3";

export default async function RpcPage() {
  const health = await rpcManager.checkAllHealth();
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-white">RPC Health Monitor</h1>
      <div className="space-y-3">
        {health.map((h) => (
          <div key={h.endpoint} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-white text-sm">{h.endpoint}</p>
              <p className="text-white/40 text-xs mt-1">
                Last checked: {h.lastChecked ? new Date(h.lastChecked).toLocaleTimeString() : "never"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/60 text-sm">
                {h.latencyMs === Infinity ? "Timeout" : `${h.latencyMs}ms`}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                h.healthy ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}>
                {h.healthy ? "● Online" : "● Offline"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
