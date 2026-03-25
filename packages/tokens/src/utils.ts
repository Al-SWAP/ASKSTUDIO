/**
 * Combines multiple AbortSignals into one that aborts when any input signal aborts.
 * Uses the native `AbortSignal.any` when available (Node 20+ / modern browsers),
 * and falls back to a manual polyfill for Edge runtimes and older environments.
 */
export function combineSignals(signals: AbortSignal[]): AbortSignal {
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any(signals);
  }
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}
