"use client";

import { useState } from "react";
import { DEFAULT_SLIPPAGE_BPS, MAX_SLIPPAGE_BPS, MIN_SLIPPAGE_BPS } from "@askstudio/config";
import { useSwapStore } from "../store/swapStore";

const PRESETS = [10, 50, 100];

export function SlippageControl() {
  const { slippageBps, setSlippageBps } = useSwapStore();
  const [custom, setCustom] = useState(false);
  const [customVal, setCustomVal] = useState("");

  const handlePreset = (bps: number) => {
    setSlippageBps(bps);
    setCustom(false);
    setCustomVal("");
  };

  const handleCustom = (val: string) => {
    setCustomVal(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      const bps = Math.round(num * 100);
      if (bps >= MIN_SLIPPAGE_BPS && bps <= MAX_SLIPPAGE_BPS) {
        setSlippageBps(bps);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-white/50">Slippage:</span>
      {PRESETS.map((bps) => (
        <button
          key={bps}
          onClick={() => handlePreset(bps)}
          className={`px-2 py-1 rounded-md transition-colors ${
            slippageBps === bps && !custom
              ? "bg-purple-600 text-white"
              : "bg-white/10 text-white/60 hover:bg-white/20"
          }`}
        >
          {(bps / 100).toFixed(2)}%
        </button>
      ))}
      <button
        onClick={() => setCustom(true)}
        className={`px-2 py-1 rounded-md transition-colors ${
          custom ? "bg-purple-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
        }`}
      >
        Custom
      </button>
      {custom && (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            type="number"
            min="0.01"
            max="5"
            step="0.01"
            value={customVal}
            onChange={(e) => handleCustom(e.target.value)}
            placeholder="0.50"
            className="w-16 bg-white/10 text-white rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-purple-500"
          />
          <span className="text-white/50">%</span>
        </div>
      )}
    </div>
  );
}
