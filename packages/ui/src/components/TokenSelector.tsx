import * as React from "react";
import type { Token } from "@askstudio/tokens";

export interface TokenSelectorProps {
  tokens: Token[];
  selected?: Token;
  onSelect: (token: Token) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TokenSelector({
  tokens,
  selected,
  onSelect,
  placeholder = "Select token",
  disabled = false,
}: TokenSelectorProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(
    () =>
      query.trim().length === 0
        ? tokens.slice(0, 100)
        : tokens.filter(
            (t) =>
              t.symbol.toLowerCase().includes(query.toLowerCase()) ||
              t.name.toLowerCase().includes(query.toLowerCase()) ||
              t.address.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 50),
    [tokens, query]
  );

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors w-full"
      >
        {selected ? (
          <>
            {selected.logoURI && (
              <img src={selected.logoURI} alt={selected.symbol} className="w-6 h-6 rounded-full" />
            )}
            <span className="font-semibold">{selected.symbol}</span>
          </>
        ) : (
          <span className="text-white/60">{placeholder}</span>
        )}
        <svg className="ml-auto w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 bg-gray-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="p-3 border-b border-white/10">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or address..."
              className="w-full bg-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-white/40 py-6 text-sm">No tokens found</p>
            ) : (
              filtered.map((token) => (
                <button
                  key={token.address}
                  type="button"
                  onClick={() => {
                    onSelect(token);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/10 transition-colors text-left"
                >
                  {token.logoURI ? (
                    <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {token.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{token.symbol}</p>
                    <p className="text-white/50 text-xs truncate">{token.name}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
