"use client";

import { useState, useEffect, useCallback } from "react";
import { useTokens, useTokenSearch } from "@/hooks/useTokens";
import type { Token } from "@askstudio/tokens";

interface TokenSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  excludeMint?: string;
}

export function TokenSelectorModal({ open, onClose, onSelect, excludeMint }: TokenSelectorModalProps) {
  const [query, setQuery] = useState("");
  const { tokens, isLoading } = useTokens();
  const filtered = useTokenSearch(tokens, query).filter((t) => t.address !== excludeMint);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card w-full max-w-sm max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Select Token</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-3 border-b border-white/5">
          <input
            type="text"
            placeholder="Search by name, symbol or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="glass-input w-full text-sm"
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-white/40 text-sm">
              Loading tokens...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-white/40 text-sm">
              No tokens found
            </div>
          ) : (
            <div className="p-2">
              {filtered.map((token) => (
                <button
                  key={token.address}
                  onClick={() => { onSelect(token); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  {token.logoURI ? (
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">
                      {token.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{token.symbol}</div>
                    <div className="text-white/40 text-xs truncate">{token.name}</div>
                  </div>
                  {token.tags?.includes("verified") && (
                    <span className="text-green-400 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
