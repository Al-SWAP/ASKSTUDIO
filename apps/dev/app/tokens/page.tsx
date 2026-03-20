"use client";

import { useState, useEffect } from "react";
import type { Token } from "@askstudio/tokens";

export default function TokenInspectorPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Token | null>(null);

  useEffect(() => {
    fetch("/api/tokens")
      .then((r) => r.json())
      .then((d) => {
        setTokens(d.tokens ?? []);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tokens
    .filter((t) => {
      if (sourceFilter !== "all" && !t.sources.includes(sourceFilter as "jupiter" | "raydium" | "orca")) return false;
      const q = search.toLowerCase();
      return !q || t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.address.toLowerCase() === q;
    })
    .slice(0, 100);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Token Inspector</h1>
        <p className="text-white/40 text-sm mt-1">Inspect raw token data aggregated from all sources</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search tokens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input text-sm flex-1 min-w-[200px]"
        />
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="glass-input text-sm"
        >
          <option value="all">All Sources</option>
          <option value="jupiter">Jupiter</option>
          <option value="raydium">Raydium</option>
          <option value="orca">Orca</option>
        </select>
        <span className="text-white/40 text-xs whitespace-nowrap">{tokens.length.toLocaleString()} total</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="glass-card overflow-hidden">
          <div className="overflow-y-auto max-h-[600px]">
            {loading ? (
              <div className="p-8 text-center text-white/30">Loading tokens...</div>
            ) : error ? (
              <div className="p-4 text-red-400 text-sm">{error}</div>
            ) : (
              filtered.map((token) => (
                <button
                  key={token.address}
                  onClick={() => setSelected(token)}
                  className={`w-full flex items-center gap-3 p-3 border-b border-white/5 hover:bg-white/5 transition-colors text-left
                    ${selected?.address === token.address ? "bg-violet-600/10 border-l-2 border-l-violet-500" : ""}`}
                >
                  {token.logoURI ? (
                    <img src={token.logoURI} alt={token.symbol} className="w-7 h-7 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-violet-600/30 flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">
                      {token.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{token.symbol}</div>
                    <div className="text-white/40 text-xs truncate">{token.name}</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {token.sources.map((s) => (
                      <span key={s} className="w-1.5 h-1.5 rounded-full bg-violet-400" title={s} />
                    ))}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {selected && (
          <div className="glass-card p-4 space-y-3 self-start">
            <div className="flex items-center gap-3">
              {selected.logoURI && <img src={selected.logoURI} alt={selected.symbol} className="w-10 h-10 rounded-full" />}
              <div>
                <div className="font-bold text-lg">{selected.symbol}</div>
                <div className="text-white/40 text-sm">{selected.name}</div>
              </div>
            </div>
            <div className="code-block">{JSON.stringify(selected, null, 2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
