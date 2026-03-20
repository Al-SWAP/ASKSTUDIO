import React from "react";
import type { Token } from "@askstudio/tokens";

export interface TokenSelectorProps {
  token: Token | null;
  onClick?: () => void;
  disabled?: boolean;
}

export function TokenSelector({ token, onClick, disabled }: TokenSelectorProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-xl
        bg-white/5 hover:bg-white/10 border border-white/10
        transition-all duration-200 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        min-w-[120px]
      `}
    >
      {token ? (
        <>
          {token.logoURI ? (
            <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-violet-600/50 flex items-center justify-center text-xs font-bold text-white">
              {token.symbol.slice(0, 2)}
            </div>
          )}
          <span className="font-semibold text-white">{token.symbol}</span>
          <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </>
      ) : (
        <>
          <span className="font-semibold text-white/70">Select token</span>
          <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </>
      )}
    </button>
  );
}
