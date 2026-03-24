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

export interface RoutePlanStep {
  swapInfo: {
    ammKey: string;
    label?: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };
  percent: number;
}

export interface SwapRoute {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: {
    amount: string;
    feeBps: number;
  };
  priceImpactPct: string;
  routePlan: RoutePlanStep[];
  contextSlot?: number;
  timeTaken?: number;
  score?: number;
}

export interface RouteScore {
  route: SwapRoute;
  score: number;
  breakdown: {
    outputScore: number;
    feeScore: number;
    priceImpactScore: number;
    latencyScore: number;
    hopScore: number;
  };
}

export interface SwapParams {
  quoteResponse: SwapRoute;
  userPublicKey: string;
  wrapAndUnwrapSol?: boolean;
  feeAccount?: string;
  prioritizationFeeLamports?: number | "auto";
  asLegacyTransaction?: boolean;
  dynamicComputeUnitLimit?: boolean;
  skipUserAccountsRpcCalls?: boolean;
}

export interface SwapTransaction {
  swapTransaction: string;
  lastValidBlockHeight?: number;
  prioritizationFeeLamports?: number;
  computeUnitLimit?: number;
  dynamicSlippageReport?: {
    slippageBps: number;
    otherAmount?: number;
    simulatedIncurredSlippageBps?: number;
    amplificationRatio?: string;
  };
}

export interface FeeConfig {
  bps: number;
  recipient: string;
  enabled: boolean;
}

export interface AnalyticsEntry {
  id: string;
  timestamp: number;
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  outputAmount: number;
  feeBps: number;
  feeAmountLamports: number;
  signature?: string;
  priceImpactPct: number;
  routeCount: number;
}
