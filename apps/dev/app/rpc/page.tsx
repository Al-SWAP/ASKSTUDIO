import { rpcManager } from "@askstudio/web3";

export default async function RpcDevPage() {
  const health = rpcManager.getAllHealth();
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-bold text-green-400">RPC Switcher</h1>
      <div className="space-y-3">
        {health.map((h) => (
          <div key={h.endpoint} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm text-white">{h.endpoint}</p>
              <span className={`px-2 py-1 rounded text-xs ${h.healthy ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {h.healthy ? "OK" : "FAIL"}
              </span>
            </div>
            <p className="text-white/40 text-xs mt-1">
              Latency: {h.latencyMs === Infinity ? "N/A" : `${h.latencyMs}ms`}
            </p>
          </div>
        ))}
      </div>
      <p className="text-white/30 text-xs">Endpoint rotation handled automatically by RpcManager.</p>
    </div>
  );
}
