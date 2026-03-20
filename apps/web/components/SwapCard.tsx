"use client";

import { useSwap } from "@/hooks/useSwap";
import { TokenInput } from "./TokenInput";
import { RouteInfo } from "./RouteInfo";
import { SlippageControl } from "./SlippageControl";
import { useWallet } from "@/hooks/useWallet";

export function SwapCard() {
  const swap = useSwap();
  const { connected, connecting } = useWallet();

  return (
    <div className="glass-card p-4 space-y-2 neon-glow">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-white">Swap</h2>
        <SlippageControl />
      </div>

      <TokenInput
        label="You Pay"
        token={swap.inputToken}
        amount={swap.inputAmount}
        onTokenSelect={swap.setInputToken}
        onAmountChange={swap.setInputAmount}
        excludeMint={swap.outputToken?.address}
      />

      <div className="flex justify-center">
        <button
          onClick={swap.flipTokens}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10
                     flex items-center justify-center text-white/50 hover:text-white
                     transition-all duration-200 active:scale-95 hover:rotate-180"
          title="Flip tokens"
        >
          ↕
        </button>
      </div>

      <TokenInput
        label="You Receive"
        token={swap.outputToken}
        amount={swap.outputAmount}
        onTokenSelect={swap.setOutputToken}
        readonly
        excludeMint={swap.inputToken?.address}
      />

      <RouteInfo />

      {swap.quoteError && (
        <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          {swap.quoteError}
        </div>
      )}

      {swap.swapError && (
        <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          {swap.swapError}
        </div>
      )}

      {swap.swapTxSignature && (
        <div className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg p-2">
          ✓ Swap confirmed!{" "}
          <a
            href={`https://solscan.io/tx/${swap.swapTxSignature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-300"
          >
            View on Solscan
          </a>
        </div>
      )}

      <button
        onClick={connecting ? undefined : !connected ? undefined : swap.executeSwap}
        disabled={connected && !swap.canSwap}
        className={`
          w-full py-3 rounded-xl font-semibold text-base transition-all duration-200
          ${!connected
            ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 cursor-default"
            : swap.canSwap
              ? "bg-violet-600 hover:bg-violet-500 text-white border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.4)] active:scale-[0.98]"
              : "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
          }
        `}
      >
        {connecting
          ? "Connecting..."
          : !connected
            ? "Connect Wallet"
            : swap.isSwapping
              ? "Swapping..."
              : swap.isLoadingQuote
                ? "Getting quote..."
                : !swap.inputToken || !swap.outputToken
                  ? "Select tokens"
                  : !swap.inputAmount || parseFloat(swap.inputAmount) <= 0
                    ? "Enter amount"
                    : !swap.route
                      ? "No route found"
                      : "Swap"
        }
      </button>
    </div>
  );
}
