"use client";

import { useState, useEffect, useCallback } from "react";
import { rpcManager, type RpcHealth } from "@askstudio/web3";
import { RPC_ENDPOINTS } from "@askstudio/config";

export default function DevRpcPage() {
  const [healthData, setHealthData] = useState<RpcHealth[]>([]);
  const [checking, setChecking] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [activeEndpoint, setActiveEndpoint] = useState<string>(
    () => rpcManager.getPinnedEndpoint() ?? RPC_ENDPOINTS[0]
  );
  const [customTestResult, setCustomTestResult] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setChecking(true);
    try {
      const results = await rpcManager.checkAllHealth();
      setHealthData(results);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const handleSelectEndpoint = (endpoint: string) => {
    setActiveEndpoint(endpoint);
    // Pin the selected endpoint in the singleton rpcManager so all subsequent
    // connections (swap UI, token fetches, etc.) use it immediately.
    rpcManager.pinEndpoint(endpoint);
  };

  const testCustomEndpoint = async () => {
    if (!customEndpoint.trim()) return;
    setCustomTestResult("Testing...");
    const start = Date.now();
    try {
      const { Connection } = await import("@solana/web3.js");
      const conn = new Connection(customEndpoint, "confirmed");
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          conn.getSlot(),
          new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error("timeout")), 5000);
          }),
        ]);
        const ms = Date.now() - start;
        setCustomTestResult(`✓ Healthy — ${ms}ms latency`);
      } catch (e) {
        setCustomTestResult(`✗ Failed: ${e instanceof Error ? e.message : "Unknown error"}`);
      } finally {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
      }
    } catch (e) {
      setCustomTestResult(`✗ Failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const getLatencyColor = (ms: number) => {
    if (ms === Infinity) return "text-red-400";
    if (ms < 200) return "text-green-400";
    if (ms < 500) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">RPC Selector</h1>
        <p className="text-white/40 text-sm mt-1">Live endpoint switching and latency testing</p>
      </div>

      <div className="grid gap-3">
        {RPC_ENDPOINTS.map((endpoint, i) => {
          const health = healthData.find((h) => h.endpoint === endpoint);
          const isActive = activeEndpoint === endpoint;
          return (
            <div
              key={endpoint}
              onClick={() => handleSelectEndpoint(endpoint)}
              className={`glass-card p-4 flex items-center justify-between gap-4 cursor-pointer transition-all
                ${isActive ? "border-violet-500/50 bg-violet-600/10" : "hover:bg-white/5"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${health?.healthy ? "bg-green-400 animate-pulse" : health ? "bg-red-400" : "bg-white/20"}`} />
                <div>
                  <div className="font-medium text-sm font-mono">{endpoint}</div>
                  <div className="text-white/40 text-xs">{i === 0 ? "Primary" : i === 1 ? "Fallback" : "Backup"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`font-mono text-sm font-semibold ${health ? getLatencyColor(health.latencyMs) : "text-white/30"}`}>
                  {health ? (health.latencyMs === Infinity ? "Timeout" : `${health.latencyMs}ms`) : "—"}
                </div>
                {isActive && <span className="text-xs text-violet-300 bg-violet-600/20 px-2 py-0.5 rounded-full">Active</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-4 space-y-3">
        <h2 className="font-semibold text-sm">Test Custom Endpoint</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://your-rpc-endpoint.com"
            value={customEndpoint}
            onChange={(e) => setCustomEndpoint(e.target.value)}
            className="glass-input flex-1 text-sm font-mono"
          />
          <button
            onClick={testCustomEndpoint}
            className="px-4 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 text-sm font-medium transition-colors"
          >
            Test
          </button>
        </div>
        {customTestResult && (
          <div className={`text-sm font-mono ${customTestResult.startsWith("✓") ? "text-green-400" : customTestResult === "Testing..." ? "text-white/50" : "text-red-400"}`}>
            {customTestResult}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={checkHealth}
          disabled={checking}
          className="px-4 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/40 text-violet-300 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {checking ? "Checking all endpoints..." : "Refresh Health"}
        </button>
        {rpcManager.getPinnedEndpoint() && (
          <button
            onClick={() => {
              rpcManager.pinEndpoint(null);
              setActiveEndpoint(rpcManager.getBestEndpoint());
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 text-sm font-medium transition-colors"
          >
            Resume Auto-Select
          </button>
        )}
      </div>
    </div>
  );
}
