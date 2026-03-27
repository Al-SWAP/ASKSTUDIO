"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "./WalletButton";
import { TokenInput } from "./TokenInput";
import { SlippageControl } from "./SlippageControl";
import { RouteInfo } from "./RouteInfo";
import { TokenSelectorModal } from "./TokenSelectorModal";
import { useTokens } from "../hooks/useTokens";
import { useQuote } from "../hooks/useQuote";
import { useSwap } from "../hooks/useSwap";
import { useSwapStore } from "../store/swapStore";
import type { Token } from "@askstudio/tokens";

export function SwapCard() {
  const {
    inputToken,
    outputToken,
    inputAmount,
    route,
    isLoadingQuote,
    isSwapping,
    error,
    txSignature,
    setInputToken,
    setOutputToken,
    setInputAmount,
    swapTokens,
    reset,
  } = useSwapStore();

  const { data: tokenList, isLoading: tokensLoading, error: tokensError } = useTokens();
  const { refresh, latencyMs } = useQuote();
  const { executeSwap } = useSwap();
  const { connected } = useWallet();

  const [selectorTarget, setSelectorTarget] = useState<"input" | "output" | null>(null);

  const tokens = tokenList?.tokens ?? [];

  const handleSelectToken = (token: Token) => {
    if (selectorTarget === "input") setInputToken(token);
    else if (selectorTarget === "output") setOutputToken(token);
    setSelectorTarget(null);
  };

  const estimatedOutput = (() => {
    if (!route || !outputToken) return "";
    // Use BigInt arithmetic to avoid float precision loss on u64-scale outAmount values.
    const decimals = outputToken.decimals ?? 9;
    const outAmountBig = BigInt(route.outAmount);
    const divisor = 10n ** BigInt(decimals);
    // Scale by 1_000_000 to derive 6 significant fractional digits in integer space.
    const scaledBy6 = (outAmountBig * 1_000_000n) / divisor;
    const intPart = scaledBy6 / 1_000_000n;
    const fracPart = scaledBy6 % 1_000_000n;
    return `${intPart}.${fracPart.toString().padStart(6, "0")}`;
  })();

  const canSwap = connected && !!route && !isSwapping && !isLoadingQuote;

  return (
    <>
      <div className="glass rounded-2xl p-6 space-y-4 neon-glow animate-slide-up">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Swap</h2>
          <WalletButton />
        </div>

        <div className="space-y-2">
          <TokenInput
            label="You Pay"
            token={inputToken}
            amount={inputAmount}
            onAmountChange={setInputAmount}
            onTokenClick={() => setSelectorTarget("input")}
          />

          <div className="flex justify-center">
            <button
              onClick={swapTokens}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all hover:rotate-180 duration-300"
              title="Swap tokens"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          <TokenInput
            label="You Receive"
            token={outputToken}
            amount={estimatedOutput}
            onTokenClick={() => setSelectorTarget("output")}
            readOnly
            estimatedAmount={estimatedOutput}
          />
        </div>

        <SlippageControl />

        <RouteInfo route={route} latencyMs={latencyMs} loading={isLoadingQuote} />

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {txSignature && (
          <div className="rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 space-y-1">
            <p className="text-green-400 text-sm font-semibold">✓ Swap confirmed!</p>
            <a
              href={`https://solscan.io/tx/${txSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-400/70 hover:text-green-400 underline font-mono break-all"
            >
              {txSignature}
            </a>
          </div>
        )}

        <button
          onClick={connected ? executeSwap : undefined}
          disabled={!canSwap}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200 ${
            canSwap
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white neon-glow"
              : "bg-white/10 text-white/40 cursor-not-allowed"
          }`}
        >
          {isSwapping ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Swapping...
            </span>
          ) : !connected ? (
            "Connect Wallet"
          ) : !inputToken || !outputToken ? (
            "Select Tokens"
          ) : !inputAmount || parseFloat(inputAmount) <= 0 ? (
            "Enter Amount"
          ) : isLoadingQuote ? (
            "Getting Quote..."
          ) : !route ? (
            "No Route Found"
          ) : (
            "Swap"
          )}
        </button>

        {tokensLoading && (
          <p className="text-center text-white/30 text-xs">Loading token list...</p>
        )}
        {tokensError && (
          <p className="text-center text-red-400/60 text-xs">Token list error: {tokensError.message}</p>
        )}
      </div>

      {selectorTarget && (
        <TokenSelectorModal
          tokens={tokens}
          onSelect={handleSelectToken}
          onClose={() => setSelectorTarget(null)}
        />
      )}
    </>
  );
}
