"use client";

import { useState, useEffect } from "react";

interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  defaultValue: boolean;
}

const FLAGS: FeatureFlag[] = [
  { key: "enable_orca", label: "Orca Integration", description: "Include Orca pools in token aggregation", defaultValue: true },
  { key: "enable_raydium", label: "Raydium Integration", description: "Include Raydium pools in token aggregation", defaultValue: true },
  { key: "enable_jupiter_swap", label: "Jupiter Swap", description: "Allow executing swaps via Jupiter", defaultValue: true },
  { key: "show_price_impact_warning", label: "Price Impact Warnings", description: "Show warning when price impact > 3%", defaultValue: true },
  { key: "enable_legacy_tx", label: "Legacy Transactions", description: "Use legacy transaction format instead of versioned", defaultValue: false },
  { key: "enable_dev_panel", label: "Dev Panel Access", description: "Allow access to the developer panel", defaultValue: true },
  { key: "enable_analytics", label: "Analytics", description: "Enable usage analytics tracking", defaultValue: false },
];

const STORAGE_KEY = "admin_feature_flags";

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setFlags(JSON.parse(saved));
    } else {
      const defaults: Record<string, boolean> = {};
      FLAGS.forEach((f) => (defaults[f.key] = f.defaultValue));
      setFlags(defaults);
    }
  }, []);

  const toggle = (key: string) => {
    setFlags((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetAll = () => {
    const defaults: Record<string, boolean> = {};
    FLAGS.forEach((f) => (defaults[f.key] = f.defaultValue));
    setFlags(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags</h1>
          <p className="text-white/40 text-sm mt-1">Toggle features across the DEX aggregator</p>
        </div>
        <button onClick={resetAll} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors">
          Reset All
        </button>
      </div>
      <div className="glass-card divide-y divide-white/5">
        {FLAGS.map((flag) => (
          <div key={flag.key} className="flex items-center justify-between p-4 gap-4">
            <div>
              <div className="font-medium text-sm">{flag.label}</div>
              <div className="text-white/40 text-xs mt-0.5">{flag.description}</div>
              <code className="text-white/20 text-xs">{flag.key}</code>
            </div>
            <button
              onClick={() => toggle(flag.key)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
                ${flags[flag.key] ? "bg-violet-600" : "bg-white/10"}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                  ${flags[flag.key] ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
