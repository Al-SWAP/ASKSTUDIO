"use client";

import { useEffect, useRef, useState } from "react";
import type { Token } from "@askstudio/tokens";

interface TokenSelectorModalProps {
  tokens: Token[];
  onSelect: (token: Token) => void;
  onClose: () => void;
}

export function TokenSelectorModal({ tokens, onSelect, onClose }: TokenSelectorModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = "token-selector-title";

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Focus trap: keep focus inside the modal while it is open.
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const filtered = query.trim().length === 0
    ? tokens.slice(0, 100)
    : tokens
        .filter(
          (t) =>
            t.symbol.toLowerCase().includes(query.toLowerCase()) ||
            t.name.toLowerCase().includes(query.toLowerCase()) ||
            t.address.toLowerCase().startsWith(query.toLowerCase())
        )
        .slice(0, 50);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md glass rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 id={titleId} className="text-white font-semibold">Select Token</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, symbol, or address..."
            className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-white/40 py-8 text-sm">No tokens found</p>
          ) : (
            filtered.map((token) => (
              <button
                key={token.address}
                type="button"
                onClick={() => onSelect(token)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/10 transition-colors text-left group"
              >
                {token.logoURI ? (
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="w-9 h-9 rounded-full flex-shrink-0"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {token.symbol.slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors">
                    {token.symbol}
                  </p>
                  <p className="text-white/40 text-xs truncate">{token.name}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {token.sources.map((src) => (
                    <span key={src} className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/40">
                      {src.slice(0, 3).toUpperCase()}
                    </span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-white/10 text-center text-xs text-white/30">
          {tokens.length.toLocaleString()} tokens from Jupiter · Raydium · Orca
        </div>
      </div>
    </div>
  );
}
