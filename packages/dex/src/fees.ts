import type { FeeConfig } from "./types";
import { MAX_FEE_BPS, MIN_FEE_BPS, env } from "@askstudio/config";

const BASE58_PUBKEY_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// Fees are enabled only when a valid base58 token account is configured.
// An empty FEE_RESERVE (the default) disables fee routing to avoid Jupiter swap failures.
let _config: FeeConfig = {
  bps: env.DEFAULT_FEE_BPS,
  recipient: env.FEE_RESERVE,
  enabled: Boolean(env.FEE_RESERVE) && BASE58_PUBKEY_RE.test(env.FEE_RESERVE),
};

export function getFeeConfig(): FeeConfig {
  return { ..._config };
}

export function setFeeConfig(config: Partial<FeeConfig>): FeeConfig {
  if (config.bps !== undefined) {
    if (!Number.isFinite(config.bps) || config.bps < MIN_FEE_BPS || config.bps > MAX_FEE_BPS) {
      throw new Error(`Fee BPS must be a finite number between ${MIN_FEE_BPS} and ${MAX_FEE_BPS}`);
    }
    _config.bps = config.bps;
  }
  if (config.recipient !== undefined) {
    const trimmed = config.recipient.trim();
    if (!trimmed) {
      throw new Error("Fee recipient cannot be empty");
    }
    if (!BASE58_PUBKEY_RE.test(trimmed)) {
      throw new Error("Fee recipient must be a valid base58 Solana public key (SPL token account)");
    }
    _config.recipient = trimmed;
  }
  if (config.enabled !== undefined) {
    if (config.enabled && !BASE58_PUBKEY_RE.test(_config.recipient)) {
      throw new Error("Cannot enable fees: recipient is not a valid base58 Solana public key");
    }
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
 * Returns 0 when fees are disabled or when the recipient is not a valid base58 key,
 * preventing a state where fees appear enabled but the swap API would reject the account.
 */
export function getPlatformFeeBps(): number {
  if (!_config.enabled || !BASE58_PUBKEY_RE.test(_config.recipient)) return 0;
  return _config.bps;
}
