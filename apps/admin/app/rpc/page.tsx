"use client";

import { useState, useEffect, useCallback } from "react";
import { rpcManager, type RpcHealth } from "@askstudio/web3";
import { RPC_ENDPOINTS } from "@askstudio/config";

export default function RpcMonitorPage() {
  const [healthData, setHealthData] = useState<RpcHealth[]>([]);
  const [checking, setChecking] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkHealth = useCallback(async () => {
    setChecking(true);
    try {
      const results = await rpcManager.checkAllHealth();
      setHealthData(results);
    } catch (e) {
      console.error("Health check failed:", e);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(checkHealth, 30_000);
    return () => clearInterval(interval);
  }, [autoRefresh, checkHealth]);

  const getLatencyColor = (ms: number) => {
    if (ms === Infinity) return "text-red-400";
    if (ms < 200) return "text-green-400";
    if (ms < 500) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">RPC Monitoring</h1>
          <p className="text-white/40 text-sm mt-1">Real-time RPC endpoint health and latency</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={checkHealth}
            disabled={checking}
            className="px-3 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/40 text-violet-300 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {checking ? "Checking..." : "Check Now"}
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {RPC_ENDPOINTS.map((endpoint, i) => {
          const health = healthData.find((h) => h.endpoint === endpoint);
          return (
            <div key={endpoint} className="glass-card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${health?.healthy ? "bg-green-400 animate-pulse" : health ? "bg-red-400" : "bg-white/20"}`} />
                <div>
                  <div className="font-medium text-sm">{endpoint}</div>
                  <div className="text-white/40 text-xs">
                    {i === 0 ? "Primary" : i === 1 ? "Fallback" : "Backup"}
                    {health?.lastChecked ? ` · Checked ${Math.round((Date.now() - health.lastChecked) / 1000)}s ago` : ""}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-mono font-semibold text-sm ${health ? getLatencyColor(health.latencyMs) : "text-white/30"}`}>
                  {health ? (health.latencyMs === Infinity ? "Timeout" : `${health.latencyMs}ms`) : "—"}
                </div>
                <div className={`text-xs ${health?.healthy ? "text-green-400" : health ? "text-red-400" : "text-white/30"}`}>
                  {health ? (health.healthy ? "Healthy" : "Unhealthy") : "Pending"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-4">
        <h2 className="font-semibold mb-3 text-sm">Current Best Endpoint</h2>
        <code className="text-violet-300 text-sm bg-violet-600/10 px-3 py-1.5 rounded-lg">
          {rpcManager.getBestEndpoint()}
        </code>
      </div>
    </div>
  );
}
