export type TokenSource = "jupiter" | "raydium" | "orca";

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  sources: TokenSource[];
  rank?: number;
  chainId?: number;
}

export interface TokenList {
  tokens: Token[];
  lastUpdated: number;
  sources: TokenSource[];
}

export interface JupiterTokenRaw {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  chainId?: number;
}

export interface RaydiumPoolRaw {
  baseMint: string;
  quoteMint: string;
  lpMint?: string;
  baseDecimals: number;
  quoteDecimals: number;
  lpDecimals?: number;
  version?: number;
  programId?: string;
  id?: string;
}

export interface OrcaPoolRaw {
  tokenMintA: string;
  tokenMintB: string;
  decimalsA?: number;
  decimalsB?: number;
}
