import type { SwapRoute, QuoteParams } from "./types";
import { MAX_SLIPPAGE_BPS } from "@askstudio/config";

export interface MevProtectionConfig {
  maxSlippageBps: number;
  priorityFeeLamports: number;
  useVersionedTransaction: boolean;
}

const DEFAULT_MEV_CONFIG: MevProtectionConfig = {
  maxSlippageBps: 100,
  priorityFeeLamports: 1000,
  useVersionedTransaction: true,
};

let _mevConfig: MevProtectionConfig = { ...DEFAULT_MEV_CONFIG };

export function getMevConfig(): MevProtectionConfig {
  return { ..._mevConfig };
}

export function setMevConfig(config: Partial<MevProtectionConfig>): MevProtectionConfig {
  if (config.maxSlippageBps !== undefined) {
    if (config.maxSlippageBps < 1 || config.maxSlippageBps > MAX_SLIPPAGE_BPS) {
      throw new Error(`MEV slippage cap must be 1–${MAX_SLIPPAGE_BPS} BPS`);
    }
    _mevConfig.maxSlippageBps = config.maxSlippageBps;
  }
  if (config.priorityFeeLamports !== undefined) {
    if (config.priorityFeeLamports < 0) throw new Error("Priority fee cannot be negative");
    _mevConfig.priorityFeeLamports = config.priorityFeeLamports;
  }
  if (config.useVersionedTransaction !== undefined) {
    _mevConfig.useVersionedTransaction = config.useVersionedTransaction;
  }
  return getMevConfig();
}

export function capSlippage(requestedBps: number): number {
  return Math.min(requestedBps, _mevConfig.maxSlippageBps);
}

export function validateRoute(route: SwapRoute): { valid: boolean; reason?: string } {
  const priceImpact = parseFloat(route.priceImpactPct);
  if (priceImpact > 5) {
    return { valid: false, reason: `Price impact too high: ${priceImpact.toFixed(2)}%` };
  }
  if (route.slippageBps > _mevConfig.maxSlippageBps) {
    return { valid: false, reason: `Slippage too high: ${route.slippageBps} BPS (cap: ${_mevConfig.maxSlippageBps})` };
  }
  return { valid: true };
}

export function applyMevProtection(params: QuoteParams): QuoteParams {
  return {
    ...params,
    slippageBps: capSlippage(params.slippageBps ?? 50),
    asLegacyTransaction: !_mevConfig.useVersionedTransaction,
  };
}
