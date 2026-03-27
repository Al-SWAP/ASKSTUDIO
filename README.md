<div align="center">

# AskStudio

**Solana DEX Aggregator — Multi-protocol token swaps with AI-powered route optimization**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-Web3.js-9945FF?logo=solana)](https://solana.com/)
[![pnpm](https://img.shields.io/badge/pnpm-9.1-orange?logo=pnpm)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.0-EF4444?logo=turborepo)](https://turbo.build/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[Features](#-features) · [Architecture](#️-architecture) · [Screenshots](#-screenshots) · [Getting Started](#-getting-started) · [Configuration](#-configuration) · [Contributing](#-contributing)

</div>

---

## Overview

AskStudio is a **Solana-based DEX aggregator** that routes token swaps across Jupiter, Raydium, and Orca to find the best price with minimal slippage. It combines an AI-inspired route scoring engine, multi-RPC failover, MEV protection, and configurable platform fees — all exposed through a Next.js web app, a React Native mobile app, an Electron desktop client, and a protected admin dashboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔀 **Multi-Protocol Routing** | Aggregates Jupiter, Raydium, and Orca liquidity for best-price execution |
| 🤖 **AI Route Scoring** | Weights output (45%), price impact (25%), hops (15%), latency (10%), and slippage (5%) |
| 🛡️ **MEV Protection** | Slippage capping, route validation, and prioritization-fee management |
| ⚡ **Multi-RPC Failover** | Three endpoints with health checking, latency tracking, and round-robin rotation |
| 💰 **Platform Fees** | Configurable 0–200 BPS fees with on-chain treasury forwarding via Anchor program |
| 🪙 **Token Aggregation** | Merges and deduplicates token lists from Jupiter, Raydium, and Orca |
| 📊 **Analytics** | Tracks swaps, fee revenue, price impact, and historical statistics |
| 🔐 **Admin Dashboard** | Fee config, RPC health, token blacklisting, and analytics — wallet-gated |
| 📱 **Cross-Platform** | Web (Next.js), Mobile (Expo / React Native), Desktop (Electron) |
| 🔑 **Wallet Support** | Phantom and Solflare with full transaction signing |

---

## 🏗️ Architecture

AskStudio is a **pnpm + Turborepo monorepo** with five shared packages and five application targets.

```
askstudio/
├── apps/
│   ├── web/          # Main trading UI       → Next.js 14  (port 3000)
│   ├── admin/        # Admin dashboard        → Next.js 14  (port 3001)
│   ├── dev/          # Developer tools        → Next.js 14  (port 3002)
│   ├── mobile/       # iOS / Android          → Expo 51 / React Native 0.74
│   └── desktop/      # Cross-platform binary  → Electron 30
│
├── packages/
│   ├── config/       # Env variables & constants
│   ├── web3/         # Solana RPC manager, wallet utils, tx confirmation
│   ├── tokens/       # Token aggregation, blacklist, fast index
│   ├── dex/          # Quote fetching, route scoring, fee math, MEV, analytics
│   └── ui/           # Shared React components (Button, TokenSelector, RouteDisplay)
│
├── program/          # Anchor on-chain fee-collector program (Rust)
│   └── programs/fee-collector/src/lib.rs
│
├── .env.example      # Environment variable template
├── package.json      # Root workspace scripts
├── pnpm-workspace.yaml
└── turbo.json        # Turborepo pipeline
```

### Package dependency graph

```
apps/web  apps/admin  apps/dev
    │           │         │
    └───────────┴─────────┘
                │
    ┌───────────┼────────────┐
    │           │            │
@askstudio/  @askstudio/  @askstudio/
   dex          tokens       ui
    │              │
    └──────┬────────┘
           │
     @askstudio/web3
           │
     @askstudio/config
```

---

## 📸 Screenshots

> Screenshots are stored in [`docs/screenshots/`](docs/screenshots/).

### Swap Interface (Web)
![Swap Interface](docs/screenshots/swap-interface.png)

### Route Details
![Route Details](docs/screenshots/route-details.png)

### Token Selector
![Token Selector](docs/screenshots/token-selector.png)

### Admin Dashboard
![Admin Dashboard](docs/screenshots/admin-dashboard.png)

### Developer Tools
![Developer Tools](docs/screenshots/dev-tools.png)

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 20.0.0 |
| pnpm | ≥ 9.0.0 |
| Git | any recent |

> **Anchor / Rust** (optional — only needed to build or deploy the on-chain program):  
> Install via [rustup](https://rustup.rs/) and [avm](https://www.anchor-lang.com/docs/installation).

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Al-SWAP/ASKSTUDIO.git
cd ASKSTUDIO

# 2. Install dependencies for all packages and apps
pnpm install

# 3. Copy the environment template and fill in your values
cp .env.example .env.local
```

Edit `.env.local` with your RPC endpoints and fee configuration (see [Configuration](#-configuration)).

### Running the Development Servers

```bash
# Start all apps in parallel (web :3000, admin :3001, dev :3002)
pnpm dev

# Or start individual apps
pnpm --filter @askstudio/web   dev    # Main trading UI
pnpm --filter @askstudio/admin dev    # Admin dashboard
pnpm --filter @askstudio/dev   dev    # Developer tools
pnpm --filter @askstudio/mobile start # Expo (iOS/Android/Web)
```

### Building for Production

```bash
# Build all packages and apps
pnpm build

# Type-check the entire workspace
pnpm type-check

# Lint the entire workspace
pnpm lint
```

---

## ⚙️ Configuration

All configuration is driven by environment variables. Copy `.env.example` to `.env.local` and adjust as needed.

```bash
# ── Solana RPC Endpoints ─────────────────────────────────────────────────────
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_RPC_FALLBACK=https://rpc.ankr.com/solana
NEXT_PUBLIC_SOLANA_RPC_BACKUP=https://solana.public-rpc.com

# ── Jupiter API ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_JUPITER_API=https://quote-api.jup.ag/v6
NEXT_PUBLIC_JUPITER_SWAP_API=https://quote-api.jup.ag/v6/swap

# ── Token Lists ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_TOKEN_LIST=https://token.jup.ag/all
NEXT_PUBLIC_RAYDIUM_API=https://api.raydium.io/v2/sdk/liquidity/mainnet.json
NEXT_PUBLIC_ORCA_API=https://api.orca.so/allPools

# ── Wallet ───────────────────────────────────────────────────────────────────
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# ── Platform Fees (optional) ─────────────────────────────────────────────────
# Set to a valid base58 Solana SPL token account to enable fees.
# Leave empty to disable fee routing entirely.
NEXT_PUBLIC_FEE_RESERVE=
NEXT_PUBLIC_DEFAULT_FEE_BPS=20      # 20 BPS = 0.20%

# ── Admin Dashboard ───────────────────────────────────────────────────────────
# Comma-separated list of wallet addresses allowed to access /admin
ADMIN_WALLET_WHITELIST=
```

### Key constants (from `@askstudio/config`)

| Constant | Value | Description |
|---|---|---|
| `DEFAULT_SLIPPAGE_BPS` | 50 | Default slippage tolerance (0.5%) |
| `MAX_SLIPPAGE_BPS` | 500 | Maximum allowed slippage (5%) |
| `MIN_FEE_BPS` | 0 | Minimum platform fee |
| `MAX_FEE_BPS` | 200 | Maximum platform fee (2%) |

---

## 📦 Packages

### `@askstudio/config`
Centralised environment variables and shared constants (`RPC_ENDPOINTS`, slippage bounds, fee bounds, rate-limit windows).

### `@askstudio/web3`
Solana connection management with multi-endpoint failover, wallet utilities (`validatePublicKey`, `truncateAddress`, `getSolBalance`), transaction confirmation helpers, and the `combineSignals()` AbortSignal utility.

### `@askstudio/tokens`
Token list aggregation from Jupiter, Raydium, and Orca. Handles deduplication, ranking, metadata merging, blacklist management, and fast-index lookup.

### `@askstudio/dex`
Core trading logic: Jupiter quote fetching with retry, swap transaction building, AI-inspired route scoring and selection, configurable platform fees (BigInt math), MEV protection, and in-memory swap analytics.

### `@askstudio/ui`
Shared React component library: `Button`, `TokenSelector`, `RouteDisplay`. Styled with TailwindCSS.

---

## 🖥️ Apps

### `apps/web` — Main Trading UI
The primary user-facing interface. Supports:
- Real-time Jupiter quotes with auto-refresh
- Token selector with search and filtering
- Slippage tolerance controls
- Swap route visualisation
- Phantom & Solflare wallet connection
- Transaction confirmation with Solscan link

### `apps/admin` — Admin Dashboard
Protected by wallet signature verification (`ADMIN_WALLET_WHITELIST`). Provides:
- Fee configuration (BPS & recipient wallet)
- RPC endpoint health monitoring
- Token blacklist management
- Swap analytics and statistics

### `apps/dev` — Developer Tools
An internal debugging interface for:
- Live RPC endpoint switching
- Raw Jupiter route inspection
- Raw transaction building and preview
- Swap simulation (no signing required)
- Token metadata inspection

### `apps/mobile` — Mobile App (Expo)
React Native application for iOS and Android built with Expo 51. Contains the main `SwapScreen` and React Navigation stack.

### `apps/desktop` — Desktop App (Electron)
Cross-platform native application. Packaged with Electron Builder for Linux (AppImage), macOS (DMG), and Windows (NSIS).

---

## ⛓️ On-Chain Program

The Anchor **fee-collector** program at `program/programs/fee-collector/` handles on-chain fee collection and forwarding to a treasury PDA.

| Instruction | Description |
|---|---|
| `initialize(fee_reserve)` | One-time setup — creates treasury PDA and stores `ProtocolConfig` |
| `collect_fee(amount_lamports)` | Transfers SOL from payer → treasury; emits `FeeCollected` event |
| `forward_fees()` | Authority-only — forwards accumulated fees to `fee_reserve` |

**Program ID**: `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS`

To build and deploy the program:

```bash
cd program
anchor build
anchor deploy --provider.cluster devnet
```

---

## 🤝 Contributing

Contributions are welcome! Please read the [Contributing Guide](docs/CONTRIBUTING.md) before opening a pull request.

Quick summary:

1. **Fork** the repository and create a feature branch from `main`.
2. Run `pnpm install` to set up the workspace.
3. Make your changes, keeping them focused on a single concern.
4. Run `pnpm type-check && pnpm lint` to validate your changes.
5. Open a pull request with a clear title and description.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
Built with ❤️ on Solana
</div>

