import { getBlacklist } from "@askstudio/tokens";

export default function TokensAdminPage() {
  const blacklist = getBlacklist();
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Token Management</h1>
      <section className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Blacklisted Tokens ({blacklist.length})</h2>
        {blacklist.length === 0 ? (
          <p className="text-white/40 text-sm">No tokens blacklisted.</p>
        ) : (
          <div className="space-y-2">
            {blacklist.map((mint) => (
              <div key={mint} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <span className="font-mono text-xs text-white/70">{mint}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-white/30 text-xs mt-4">Use POST /api/tokens to blacklist/unblacklist tokens.</p>
      </section>
    </div>
  );
}
