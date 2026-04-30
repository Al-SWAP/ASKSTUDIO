import Link from "next/link";

export default function DevDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dev Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">AskStudio DEX Aggregator — Developer Panel</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "RPC Selector", desc: "Switch endpoints, test latency, live switching", href: "/rpc", className: "text-cyan-400" },
          { title: "Route Debugger", desc: "Inspect and compare swap routes", href: "/routes", className: "text-violet-400" },
          { title: "TX Builder", desc: "Construct and sign raw Solana transactions", href: "/tx", className: "text-green-400" },
          { title: "Swap Simulator", desc: "Simulate swaps without broadcasting", href: "/simulator", className: "text-yellow-400" },
          { title: "Token Inspector", desc: "View raw token data from all sources", href: "/tokens", className: "text-pink-400" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="glass-card p-5 hover:bg-white/10 transition-all duration-200"
          >
            <div className={`text-sm font-semibold ${card.className} mb-1`}>{card.title}</div>
            <p className="text-white/40 text-xs">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
