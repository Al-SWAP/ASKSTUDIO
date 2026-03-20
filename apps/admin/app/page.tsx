import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">AskStudio DEX Aggregator — Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Token Management", desc: "Blacklist, override, and inspect tokens", href: "/tokens", className: "text-violet-400" },
          { title: "RPC Monitoring", desc: "Live RPC health, latency, and failover status", href: "/rpc", className: "text-cyan-400" },
          { title: "Feature Flags", desc: "Toggle features across all apps", href: "/flags", className: "text-green-400" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="glass-card p-5 hover:bg-white/10 transition-all duration-200 group"
          >
            <div className={`text-sm font-semibold ${card.className} mb-1`}>{card.title}</div>
            <p className="text-white/40 text-xs">{card.desc}</p>
          </Link>
        ))}
      </div>

      <div className="glass-card p-5">
        <h2 className="font-semibold mb-3">System Status</h2>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          {[
            { label: "Jupiter API", status: "online" },
            { label: "Raydium API", status: "online" },
            { label: "Orca API", status: "online" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-white/40 text-xs mb-1">{s.label}</div>
              <div className="flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 font-medium capitalize">{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
