"use client";

import { useState, useEffect } from "react";
import type { Token } from "@askstudio/tokens";

const STORAGE_KEY = "admin_token_blacklist";

export default function TokensAdminPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [blacklist, setBlacklist] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBlacklist(new Set(JSON.parse(saved)));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("/api/tokens")
      .then((r) => r.json())
      .then((d) => {
        setTokens(d.tokens ?? []);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleBlacklist = (address: string) => {
    setBlacklist((prev) => {
      const next = new Set(prev);
      next.has(address) ? next.delete(address) : next.add(address);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const filtered = tokens
    .filter((t) => {
      const q = search.trim();
      if (!q) return true;
      const qLower = q.toLowerCase();
      return (
        t.symbol.toLowerCase().includes(qLower) ||
        t.name.toLowerCase().includes(qLower) ||
        t.address.includes(q)
      );
    })
    .slice(0, 100);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Token Management</h1>
        <p className="text-white/40 text-sm mt-1">Blacklist tokens or override their metadata</p>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search tokens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input flex-1 text-sm"
        />
        <div className="text-white/40 text-xs whitespace-nowrap">{tokens.length.toLocaleString()} tokens</div>
      </div>
      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>
      )}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr className="text-white/40 text-xs">
              <th className="text-left p-3">Token</th>
              <th className="text-left p-3 hidden sm:table-cell">Address</th>
              <th className="text-left p-3 hidden md:table-cell">Sources</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-white/30">Loading tokens...</td></tr>
            ) : (
              filtered.map((token) => (
                <tr key={token.address} className={`table-row ${blacklist.has(token.address) ? "opacity-40" : ""}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {token.logoURI ? (
                        <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-violet-600/30 flex items-center justify-center text-xs font-bold text-violet-300">
                          {token.symbol.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{token.symbol}</div>
                        <div className="text-white/40 text-xs truncate max-w-[120px]">{token.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden sm:table-cell">
                    <code className="text-white/40 text-xs">{token.address.slice(0, 8)}...{token.address.slice(-4)}</code>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {token.sources.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-xs">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => toggleBlacklist(token.address)}
                      aria-label={blacklist.has(token.address) ? `Unblock ${token.symbol}` : `Blacklist ${token.symbol}`}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors
                        ${blacklist.has(token.address)
                          ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                          : "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                        }`}
                    >
                      {blacklist.has(token.address) ? "Unblock" : "Blacklist"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
