"use client";

import { useState } from "react";
import type { Token } from "@askstudio/tokens";

interface TokenInputProps {
  label: string;
  token: Token | null;
  amount: string;
  onAmountChange?: (val: string) => void;
  onTokenClick: () => void;
  readOnly?: boolean;
  estimatedAmount?: string;
}

export function TokenInput({
  label,
  token,
  amount,
  onAmountChange,
  onTokenClick,
  readOnly = false,
  estimatedAmount,
}: TokenInputProps) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2 hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40 uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onTokenClick}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
        >
          {token ? (
            <>
              {token.logoURI && (
                <img
                  src={token.logoURI}
                  alt={token.symbol}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              <span className="text-white font-semibold text-sm">{token.symbol}</span>
            </>
          ) : (
            <span className="text-white/50 text-sm">Select</span>
          )}
          <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="flex-1 text-right">
          {readOnly ? (
            <p className="text-2xl font-bold text-white tabular-nums">
              {estimatedAmount ?? "—"}
            </p>
          ) : (
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => onAmountChange?.(e.target.value)}
              placeholder="0.00"
              className="w-full text-2xl font-bold bg-transparent text-white text-right outline-none placeholder-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          )}
        </div>
      </div>
      {token && (
        <p className="text-xs text-white/30 text-right">{token.name}</p>
      )}
    </div>
  );
}
