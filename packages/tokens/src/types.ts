export interface Token {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
  extensions?: Record<string, unknown>;
  sources: TokenSource[];
  rank?: number;
}

export type TokenSource = "jupiter" | "raydium" | "orca";

export interface TokenList {
  tokens: Token[];
  updatedAt: number;
}

export interface RaydiumPoolInfo {
  id: string;
  baseMint: string;
  quoteMint: string;
  baseDecimals: number;
  quoteDecimals: number;
  lpMint: string;
  version: number;
  programId: string;
}

export interface OrcaPool {
  tokenIds: string[];
  tokens: Record<string, { name: string; decimals: number; mint: string; logoURI?: string }>;
  curveType: number;
  amp?: number;
}
