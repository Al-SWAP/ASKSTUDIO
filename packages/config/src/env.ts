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
} as const;

export type Env = typeof env;

export const RPC_ENDPOINTS = [
  env.SOLANA_RPC,
  env.SOLANA_RPC_FALLBACK,
  env.SOLANA_RPC_BACKUP,
] as const;
