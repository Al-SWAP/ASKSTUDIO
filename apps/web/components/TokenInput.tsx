"use client";

import { useState } from "react";
import type { Token } from "@askstudio/tokens";
import { TokenSelectorModal } from "./TokenSelectorModal";

interface TokenInputProps {
  label: string;
  token: Token | null;
  amount: string;
  onTokenSelect: (token: Token) => void;
  onAmountChange?: (amount: string) => void;
  readonly?: boolean;
  excludeMint?: string;
}

export function TokenInput({
  label,
  token,
  amount,
  onTokenSelect,
  onAmountChange,
  readonly = false,
  excludeMint,
}: TokenInputProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => onAmountChange?.(e.target.value)}
          readOnly={readonly}
          className={`
            flex-1 bg-transparent text-2xl font-bold text-white placeholder:text-white/20
            focus:outline-none min-w-0
            ${readonly ? "cursor-default" : ""}
          `}
          min="0"
          step="any"
        />
        <button
          onClick={() => setModalOpen(true)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0
            transition-all duration-200 active:scale-95
            ${token
              ? "bg-white/10 hover:bg-white/15 border border-white/15"
              : "bg-violet-600/30 hover:bg-violet-600/40 border border-violet-500/40"
            }
          `}
        >
          {token ? (
            <>
              {token.logoURI && (
                <img src={token.logoURI} alt={token.symbol} className="w-5 h-5 rounded-full" />
              )}
              <span className="font-semibold text-white text-sm">{token.symbol}</span>
            </>
          ) : (
            <span className="font-semibold text-violet-300 text-sm whitespace-nowrap">Select token</span>
          )}
          <svg className="w-3 h-3 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {token && (
        <div className="text-white/30 text-xs">{token.name}</div>
      )}
      <TokenSelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={onTokenSelect}
        excludeMint={excludeMint}
      />
    </div>
  );
}
