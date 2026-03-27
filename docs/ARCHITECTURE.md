# AskStudio — Architecture

This document describes the internal architecture of AskStudio in detail.

---

## Table of Contents

- [Monorepo Layout](#monorepo-layout)
- [Package Dependency Graph](#package-dependency-graph)
- [Data Flow — Swap Execution](#data-flow--swap-execution)
- [RPC Failover Strategy](#rpc-failover-strategy)
- [Token Aggregation Pipeline](#token-aggregation-pipeline)
- [Route Scoring Algorithm](#route-scoring-algorithm)
- [Fee System](#fee-system)
- [Admin Authentication](#admin-authentication)
- [On-Chain Program](#on-chain-program)

---

## Monorepo Layout

AskStudio uses **pnpm workspaces** with **Turborepo** for task orchestration.

```
askstudio/
├── apps/
│   ├── web/          # Next.js 14 — main trading UI (port 3000)
│   ├── admin/        # Next.js 14 — admin dashboard (port 3001)
│   ├── dev/          # Next.js 14 — developer tools (port 3002)
│   ├── mobile/       # Expo 51 / React Native 0.74 — iOS & Android
│   └── desktop/      # Electron 30 — cross-platform desktop app
│
├── packages/
│   ├── config/       # Env variables & shared constants
│   ├── web3/         # Solana RPC, wallet utils, tx confirmation
│   ├── tokens/       # Token list aggregation & blacklist
│   ├── dex/          # Quote fetching, routing, fees, MEV, analytics
│   └── ui/           # Shared React component library
│
├── program/
│   └── programs/
│       └── fee-collector/   # Anchor program (Rust)
│
├── turbo.json        # Task pipeline (build → type-check → lint → dev)
└── pnpm-workspace.yaml
```

All packages use `"main": "./src/index.ts"` — no build step is required for type-checking during development.

---

## Package Dependency Graph

```
apps/web ─────────────────────────────────────────────────────────────┐
apps/admin ────────────────────────────────────────────────────────────┤
apps/dev ──────────────────────────────────────────────────────────────┤
                                                                        ↓
                         ┌──────────────┬──────────────┬──────────────┐
                         │              │              │              │
                   @askstudio/    @askstudio/    @askstudio/    @askstudio/
                      dex           tokens          ui            web3
                         │              │                          │
                         └──────────────┘                          │
                                 │                                  │
                          @askstudio/web3 ──────────────────────────┘
                                 │
                          @askstudio/config
```

- `@askstudio/dex` and `@askstudio/tokens` both depend on `@askstudio/web3`.
- `@askstudio/web3` depends on `@askstudio/config`.
- All apps depend on one or more packages; no app is depended on by another.

---

## Data Flow — Swap Execution

```
User types amount
        │
        ▼
SwapCard (apps/web)
        │  triggers after debounce
        ▼
getJupiterQuote()          ← @askstudio/dex
        │  GET /quote?inputMint=…&outputMint=…&amount=…&slippageBps=…
        ▼
Jupiter Quote API v6
        │  returns array of SwapRoute candidates
        ▼
scoreRoute() / getBestRoute()   ← @askstudio/dex/routing
        │  weighted score: output 45%, priceImpact 25%, hops 15%, latency 10%, slippage 5%
        ▼
RouteInfo component displays best route
        │
        ▼  user clicks Swap
buildJupiterSwapTransaction()   ← @askstudio/dex
        │  POST /swap with feeAccount if NEXT_PUBLIC_FEE_RESERVE is set
        ▼
Wallet signs transaction (Phantom / Solflare)
        │
        ▼
sendRawTransaction()   ← getConnection() from @askstudio/web3
        │
        ▼
listenForSwapConfirmation()   ← @askstudio/web3
        │  polls until confirmed or timeout
        ▼
recordSwap()   ← @askstudio/dex/analytics
        │
        ▼
Display Solscan link
```

---

## RPC Failover Strategy

`RpcManager` in `@askstudio/web3` manages multiple RPC endpoints:

1. **Health check** — endpoint health is evaluated when `checkAllHealth()` is called, using a 5-second timeout per endpoint. Callers are responsible for scheduling health checks (for example, on startup or via an external scheduler).
2. **Round-robin rotation** — `getBestEndpoint()` advances the active index every 30 seconds among currently-healthy endpoints. The rotation is time-based (triggered by successive calls) rather than on an independent timer.
3. **Pinned endpoint** — `switchEndpoint()` pins a specific endpoint for all subsequent connections. The pin is automatically released if the endpoint is found to be unhealthy during `getBestEndpoint()`.
4. **Fallback on error** — if the pinned endpoint becomes unhealthy, `getBestEndpoint()` falls back to round-robin across the remaining healthy pool.
5. **Sentinel-based timeout** — `Promise.race()` with a sentinel value avoids unhandled rejections on timeout.

---

## Token Aggregation Pipeline

`aggregateTokens()` in `@askstudio/tokens` runs the following steps:

```
fetchJupiterTokens()    fetchRaydiumTokens()    fetchOrcaTokens()
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                │
                    Merge by mint address
                    (deduplicate, combine sources[])
                                │
                    Rank tokens
                    (official list membership, verified tag, source count)
                                │
                    Apply blacklist filter
                    (remove tokens in getBlacklist())
                                │
                    Return AggregatedToken[]
```

`buildFastIndex()` creates a `Map<mint, token>` for O(1) lookup during swap routing.

---

## Route Scoring Algorithm

`scoreRoute()` in `@askstudio/dex/routing` normalises each metric across the candidate set and produces a weighted score:

| Metric | Weight | Direction |
|---|---|---|
| Output amount | 45% | Higher is better |
| Price impact | 25% | Lower is better |
| Hop count | 15% | Fewer is better |
| Quote latency | 10% | Lower is better |
| Slippage | 5% | Lower is better |

`getFallbackRoutes()` returns the next two highest-scoring routes for retry if the best route fails at swap time.

---

## Fee System

Fees are calculated using `bigint` to preserve u64 precision:

```
calculateFee(amount: bigint, feeBps: number): bigint
  → (amount * BigInt(feeBps)) / BigInt(10000)

calculateNetAmount(amount: bigint, feeBps: number): bigint
  → amount - calculateFee(amount, feeBps)
```

`setFeeConfig()` validates that the recipient is a valid base58 address before enabling fees.

If `NEXT_PUBLIC_FEE_RESERVE` is set, `buildJupiterSwapTransaction()` includes the `feeAccount` in the Jupiter swap request. The Anchor `fee-collector` program handles the on-chain side.

---

## Admin Authentication

Every request to `apps/admin` is validated by `middleware.ts`:

1. The client signs a JSON message `{ "timestamp": <unix-ms>, "domain": "<host>" }` with its Ed25519 wallet private key.
2. The signature and public key are sent as HTTP headers.
3. Middleware verifies:
   - The signature is valid (using `tweetnacl` + `bs58`).
   - The timestamp is within a 5-minute window (replay protection).
   - The `domain` in the signed payload matches `req.nextUrl.host` (cross-host replay protection).
   - The public key is in `ADMIN_WALLET_WHITELIST`.
4. If `ADMIN_WALLET_WHITELIST` is empty in production, middleware **fails closed** (returns 401).

---

## On-Chain Program

The Anchor **fee-collector** program manages two PDAs:

```
config PDA  (seed: "config")
  ┌───────────────────────┐
  │  authority: Pubkey    │  ← deployer
  │  fee_reserve: Pubkey  │  ← SPL token account for fee destination
  │  bump: u8             │
  └───────────────────────┘

treasury PDA  (seed: "treasury" + config_key)
  ← accumulates SOL from collect_fee()
  ← drained by forward_fees() to fee_reserve
```

**Instructions:**

| Instruction | Caller | Effect |
|---|---|---|
| `initialize(fee_reserve)` | Deployer (once) | Creates config & treasury PDAs |
| `collect_fee(amount)` | Any user | Transfers lamports to treasury; emits `FeeCollected` |
| `forward_fees()` | Authority only | Sends treasury balance to `fee_reserve`; emits `FeesForwarded` |
