"use client";

import { useSwapStore } from "@/store/swapStore";

const PRESET_BPS = [10, 50, 100, 300];

export function SlippageControl() {
  const { slippageBps, setSlippageBps } = useSwapStore();

  return (
    <div className="flex items-center gap-2">
      <span className="text-white/40 text-xs">Slippage:</span>
      <div className="flex items-center gap-1">
        {PRESET_BPS.map((bps) => (
          <button
            key={bps}
            onClick={() => setSlippageBps(bps)}
            className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all
              ${slippageBps === bps
                ? "bg-violet-600/40 text-violet-300 border border-violet-500/40"
                : "bg-white/5 text-white/40 hover:text-white/70 border border-transparent"
              }`}
          >
            {(bps / 100).toFixed(1)}%
          </button>
        ))}
      </div>
    </div>
  );
}
