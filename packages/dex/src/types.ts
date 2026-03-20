export interface SwapRoute {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: "ExactIn" | "ExactOut";
  slippageBps: number;
  platformFee?: PlatformFee;
  priceImpactPct: string;
  routePlan: RoutePlan[];
  contextSlot?: number;
  timeTaken?: number;
  score?: number;
}

export interface PlatformFee {
  amount: string;
  feeBps: number;
}

export interface RoutePlan {
  swapInfo: SwapInfo;
  percent: number;
}

export interface SwapInfo {
  ammKey: string;
  label?: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  feeAmount: string;
  feeMint: string;
}

export interface QuoteParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
  swapMode?: "ExactIn" | "ExactOut";
  onlyDirectRoutes?: boolean;
  asLegacyTransaction?: boolean;
  platformFeeBps?: number;
}

export interface SwapParams {
  quoteResponse: SwapRoute;
  userPublicKey: string;
  wrapAndUnwrapSol?: boolean;
  asLegacyTransaction?: boolean;
  feeAccount?: string;
}

export interface SwapTransaction {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports?: number;
}

export interface RouteScore {
  route: SwapRoute;
  score: number;
  breakdown: {
    outputScore: number;
    feeScore: number;
    priceImpactScore: number;
    latencyScore: number;
  };
}
