export const env = {
  SOLANA_RPC: process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.mainnet-beta.solana.com",
  SOLANA_RPC_FALLBACK: process.env.NEXT_PUBLIC_SOLANA_RPC_FALLBACK ?? "https://rpc.ankr.com/solana",
  SOLANA_RPC_BACKUP: process.env.NEXT_PUBLIC_SOLANA_RPC_BACKUP ?? "https://solana.public-rpc.com",
  JUPITER_API: process.env.NEXT_PUBLIC_JUPITER_API ?? "https://quote-api.jup.ag/v6",
  JUPITER_SWAP_API: process.env.NEXT_PUBLIC_JUPITER_SWAP_API ?? "https://quote-api.jup.ag/v6/swap",
  TOKEN_LIST: process.env.NEXT_PUBLIC_TOKEN_LIST ?? "https://token.jup.ag/all",
  RAYDIUM_API: process.env.NEXT_PUBLIC_RAYDIUM_API ?? "https://api.raydium.io/v2/sdk/liquidity/mainnet.json",
  ORCA_API: process.env.NEXT_PUBLIC_ORCA_API ?? "https://api.orca.so/allPools",
  WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "public_default_project_id",
  FEE_RESERVE: process.env.NEXT_PUBLIC_FEE_RESERVE ?? "",
  DEFAULT_FEE_BPS: (() => {
    const parsed = parseInt(process.env.NEXT_PUBLIC_DEFAULT_FEE_BPS ?? "20", 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 20;
  })(),
} as const;

export type Env = typeof env;

export const RPC_ENDPOINTS = [
  env.SOLANA_RPC,
  env.SOLANA_RPC_FALLBACK,
  env.SOLANA_RPC_BACKUP,
] as const;

/** Maximum platform fee in basis points (10% = 1000 bps). */
export const MAX_FEE_BPS = 1000;

/** Minimum non-zero platform fee in basis points (0.01% = 1 bps). */
export const MIN_FEE_BPS = 1;

/** Maximum slippage in basis points (50% = 5000 bps). */
export const MAX_SLIPPAGE_BPS = 5000;
