export default function DevPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-green-400">Developer Tools</h1>
      <div className="grid grid-cols-2 gap-4">
        {[
          { href: "/dev/rpc", label: "RPC Switcher", desc: "Live endpoint management" },
          { href: "/dev/routes", label: "Route Debugger", desc: "Inspect raw Jupiter routes" },
          { href: "/dev/tx", label: "TX Builder", desc: "Build raw transactions" },
          { href: "/dev/simulator", label: "Swap Simulator", desc: "Simulate without signing" },
          { href: "/dev/tokens", label: "Token Inspector", desc: "Inspect token metadata" },
        ].map((tool) => (
          <a
            key={tool.href}
            href={tool.href}
            className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:border-green-500/50 transition-colors"
          >
            <p className="text-green-400 font-semibold">{tool.label}</p>
            <p className="text-white/40 text-sm mt-1">{tool.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
