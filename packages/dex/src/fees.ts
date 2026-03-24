import type { FeeConfig } from "./types";
import { MAX_FEE_BPS, MIN_FEE_BPS, env } from "@askstudio/config";

let _config: FeeConfig = {
  bps: env.DEFAULT_FEE_BPS,
  recipient: env.FEE_RESERVE,
  enabled: true,
};

export function getFeeConfig(): FeeConfig {
  return { ..._config };
}

export function setFeeConfig(config: Partial<FeeConfig>): FeeConfig {
  if (config.bps !== undefined) {
    if (config.bps < MIN_FEE_BPS || config.bps > MAX_FEE_BPS) {
      throw new Error(`Fee BPS must be between ${MIN_FEE_BPS} and ${MAX_FEE_BPS}`);
    }
    _config.bps = config.bps;
  }
  if (config.recipient !== undefined) {
    if (!config.recipient || config.recipient.trim().length === 0) {
      throw new Error("Fee recipient cannot be empty");
    }
    _config.recipient = config.recipient.trim();
  }
  if (config.enabled !== undefined) {
    _config.enabled = config.enabled;
  }
  return getFeeConfig();
}

export function calculateFee(inputAmountLamports: number, bps: number): number {
  if (bps <= 0) return 0;
  return Math.floor((inputAmountLamports * bps) / 10_000);
}

export function calculateNetAmount(inputAmountLamports: number, bps: number): number {
  return inputAmountLamports - calculateFee(inputAmountLamports, bps);
}

export function feeBpsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

/**
 * Returns Jupiter platform fee BPS to embed in quote request.
 * When the fee is disabled, returns 0.
 */
export function getPlatformFeeBps(): number {
  if (!_config.enabled) return 0;
  return _config.bps;
}
